/*
 * Copyright 2021 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.gradle.composite.internal;

import org.gradle.api.CircularReferenceException;
import org.gradle.api.Task;
import org.gradle.api.internal.GradleInternal;
import org.gradle.api.internal.TaskInternal;
import org.gradle.api.specs.Spec;
import org.gradle.execution.EntryTaskSelector;
import org.gradle.execution.plan.Node;
import org.gradle.execution.plan.QueryableExecutionPlan;
import org.gradle.execution.plan.TaskNode;
import org.gradle.execution.plan.TaskNodeFactory;
import org.gradle.internal.build.BuildLifecycleController;
import org.gradle.internal.build.BuildState;
import org.gradle.internal.build.BuildWorkGraph;
import org.gradle.internal.build.ExecutionResult;
import org.gradle.internal.build.ExportedTaskNode;
import org.gradle.internal.graph.CachingDirectedGraphWalker;
import org.gradle.internal.graph.DirectedGraphRenderer;
import org.gradle.internal.logging.text.StyledTextOutput;
import org.gradle.internal.operations.BuildOperationRef;
import org.gradle.internal.operations.CurrentBuildOperationRef;
import org.gradle.internal.work.WorkerLeaseService;

import java.io.StringWriter;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.function.BiConsumer;
import java.util.function.Consumer;

class DefaultBuildController implements BuildController {
    private enum State {
        DiscoveringTasks, ReadyToRun, RunningTasks, Finished
    }

    private final BuildWorkGraph workGraph;
    private final Set<ExportedTaskNode> scheduled = new LinkedHashSet<>();
    private final Set<ExportedTaskNode> queuedForExecution = new LinkedHashSet<>();
    private final WorkerLeaseService workerLeaseService;

    private State state = State.DiscoveringTasks;

    public DefaultBuildController(BuildState build, WorkerLeaseService workerLeaseService) {
        this.workerLeaseService = workerLeaseService;
        this.workGraph = build.getWorkGraph().newWorkGraph();
    }

    @Override
    public void queueForExecution(ExportedTaskNode taskNode) {
        assertInState(State.DiscoveringTasks);
        queuedForExecution.add(taskNode);
    }

    @Override
    public void populateWorkGraph(Consumer<? super BuildLifecycleController.WorkGraphBuilder> action) {
        assertInState(State.DiscoveringTasks);
        workGraph.populateWorkGraph(action);
    }

    @Override
    public void addFilter(Spec<Task> filter) {
        assertInState(State.DiscoveringTasks);
        workGraph.addFilter(filter);
    }

    @Override
    public void addFinalization(BiConsumer<EntryTaskSelector.Context, QueryableExecutionPlan> finalization) {
        assertInState(State.DiscoveringTasks);
        workGraph.addFinalization(finalization);
    }

    @Override
    public boolean scheduleQueuedTasks() {
        assertInState(State.DiscoveringTasks);

        queuedForExecution.removeAll(scheduled);
        if (queuedForExecution.isEmpty()) {
            return false;
        }

        boolean added = workGraph.schedule(queuedForExecution);
        scheduled.addAll(queuedForExecution);
        queuedForExecution.clear();
        return added;
    }

    @Override
    public void finalizeWorkGraph() {
        assertInState(State.DiscoveringTasks);
        if (!queuedForExecution.isEmpty()) {
            throw new IllegalStateException("Queued tasks have not been scheduled.");
        }

        // TODO - This check should live in the task execution plan, so that it can reuse checks that have already been performed and
        //   also check for cycles across all nodes
        Set<TaskInternal> visited = new HashSet<>();
        Set<TaskInternal> visiting = new HashSet<>();
        for (ExportedTaskNode node : scheduled) {
            checkForCyclesFor(node.getTask(), visited, visiting);
        }
        workGraph.finalizeGraph();

        state = State.ReadyToRun;
    }

    @Override
    public void startExecution(ExecutorService executorService, Consumer<ExecutionResult<Void>> completionHandler) {
        assertInState(State.ReadyToRun);
        executorService.submit(new BuildOpRunnable(CurrentBuildOperationRef.instance().get(), completionHandler));
        state = State.RunningTasks;
    }

    @Override
    public void stop() {
        workGraph.stop();
    }

    private void assertInState(State expectedState) {
        if (state != expectedState) {
            throw new IllegalStateException("Build is in unexpected state: " + state);
        }
    }

    private static void checkForCyclesFor(TaskInternal task, Set<TaskInternal> visited, Set<TaskInternal> visiting) {
        if (visited.contains(task)) {
            // Already checked
            return;
        }
        if (!visiting.add(task)) {
            // Visiting dependencies -> have found a cycle
            CachingDirectedGraphWalker<TaskInternal, Void> graphWalker = new CachingDirectedGraphWalker<>((node, values, connectedNodes) -> visitDependenciesOf(node, connectedNodes::add));
            graphWalker.add(task);
            List<Set<TaskInternal>> cycles = graphWalker.findCycles();
            Set<TaskInternal> cycle = cycles.get(0);

            DirectedGraphRenderer<TaskInternal> graphRenderer = new DirectedGraphRenderer<>((node, output) -> output.withStyle(StyledTextOutput.Style.Identifier).text(node.getIdentityPath()), (node, values, connectedNodes) -> visitDependenciesOf(node, dep -> {
                if (cycle.contains(dep)) {
                    connectedNodes.add(dep);
                }
            }));
            StringWriter writer = new StringWriter();
            graphRenderer.renderTo(task, writer);
            throw new CircularReferenceException(String.format("Circular dependency between the following tasks:%n%s", writer));
        }
        visitDependenciesOf(task, dep -> checkForCyclesFor(dep, visited, visiting));
        visiting.remove(task);
        visited.add(task);
    }

    private static void visitDependenciesOf(TaskInternal task, Consumer<TaskInternal> consumer) {
        TaskNodeFactory taskNodeFactory = ((GradleInternal) task.getProject().getGradle()).getServices().get(TaskNodeFactory.class);
        TaskNode node = taskNodeFactory.getOrCreateNode(task);
        for (Node dependency : node.getAllSuccessors()) {
            if (dependency instanceof TaskNode) {
                consumer.accept(((TaskNode) dependency).getTask());
            }
        }
    }

    private ExecutionResult<Void> doRun() {
        try {
            return workerLeaseService.runAsWorkerThread(workGraph::runWork);
        } catch (Throwable t) {
            return ExecutionResult.failed(t);
        }
    }

    private class BuildOpRunnable implements Runnable {
        private final BuildOperationRef parentBuildOperation;
        private final Consumer<ExecutionResult<Void>> completionHandler;

        BuildOpRunnable(BuildOperationRef parentBuildOperation, Consumer<ExecutionResult<Void>> completionHandler) {
            this.parentBuildOperation = parentBuildOperation;
            this.completionHandler = completionHandler;
        }

        @Override
        public void run() {
            CurrentBuildOperationRef.instance().with(parentBuildOperation, () -> completionHandler.accept(doRun()));
        }
    }
}


/*
 * Copyright 2013 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.gradle.tooling.internal.provider.runner;

import org.gradle.api.BuildCancelledException;
import org.gradle.initialization.BuildCancellationToken;
import org.gradle.initialization.BuildEventConsumer;
import org.gradle.internal.buildtree.BuildTreeModelController;
import org.gradle.internal.buildtree.BuildTreeModelSideEffectExecutor;
import org.gradle.internal.buildtree.BuildTreeModelTarget;
import org.gradle.internal.work.WorkerThreadRegistry;
import org.gradle.tooling.internal.gradle.GradleBuildIdentity;
import org.gradle.tooling.internal.gradle.GradleProjectIdentity;
import org.gradle.tooling.internal.protocol.BuildExceptionVersion1;
import org.gradle.tooling.internal.protocol.BuildResult;
import org.gradle.tooling.internal.protocol.InternalActionAwareBuildController;
import org.gradle.tooling.internal.protocol.InternalBuildControllerVersion2;
import org.gradle.tooling.internal.protocol.InternalStreamedValueRelay;
import org.gradle.tooling.internal.protocol.InternalUnsupportedModelException;
import org.gradle.tooling.internal.protocol.ModelIdentifier;
import org.gradle.tooling.internal.provider.connection.ProviderBuildResult;
import org.gradle.tooling.internal.provider.serialization.PayloadSerializer;
import org.gradle.tooling.internal.provider.serialization.SerializedPayload;
import org.gradle.tooling.internal.provider.serialization.StreamedValue;
import org.gradle.tooling.provider.model.UnknownModelException;
import org.jspecify.annotations.NullMarked;
import org.jspecify.annotations.Nullable;

import java.util.List;
import java.util.function.Supplier;

@NullMarked
@SuppressWarnings("deprecation")
class DefaultBuildController implements org.gradle.tooling.internal.protocol.InternalBuildController, InternalBuildControllerVersion2, InternalActionAwareBuildController, InternalStreamedValueRelay {
    private final WorkerThreadRegistry workerThreadRegistry;
    private final BuildTreeModelController controller;
    private final BuildCancellationToken cancellationToken;
    private final BuildEventConsumer buildEventConsumer;
    private final BuildTreeModelSideEffectExecutor sideEffectExecutor;
    private final PayloadSerializer payloadSerializer;

    public DefaultBuildController(
        BuildTreeModelController controller,
        WorkerThreadRegistry workerThreadRegistry,
        BuildCancellationToken cancellationToken,
        BuildEventConsumer buildEventConsumer,
        BuildTreeModelSideEffectExecutor sideEffectExecutor,
        PayloadSerializer payloadSerializer
    ) {
        this.workerThreadRegistry = workerThreadRegistry;
        this.controller = controller;
        this.cancellationToken = cancellationToken;
        this.buildEventConsumer = buildEventConsumer;
        this.sideEffectExecutor = sideEffectExecutor;
        this.payloadSerializer = payloadSerializer;
    }

    /**
     * This is used by consumers 1.8-rc-1 to 4.3
     */
    @Override
    @Deprecated
    public BuildResult<?> getBuildModel() throws BuildExceptionVersion1 {
        assertCanQuery();
        return new ProviderBuildResult<Object>(controller.getConfiguredModel());
    }

    /**
     * This is used by consumers 1.8-rc-1 to 4.3
     */
    @Override
    @Deprecated
    public BuildResult<?> getModel(Object target, ModelIdentifier modelIdentifier) throws BuildExceptionVersion1, InternalUnsupportedModelException {
        return getModel(target, modelIdentifier, null);
    }

    /**
     * This is used by consumers 4.4 and later
     */
    @Override
    public BuildResult<?> getModel(@Nullable Object target, ModelIdentifier modelIdentifier, Object parameter)
        throws BuildExceptionVersion1, InternalUnsupportedModelException {
        assertCanQuery();
        if (cancellationToken.isCancellationRequested()) {
            throw new BuildCancelledException(String.format("Could not build '%s' model. Build cancelled.", modelIdentifier.getName()));
        }

        BuildTreeModelTarget scopedTarget = resolveTarget(target);
        try {
            Object model = controller.getModel(scopedTarget, modelIdentifier.getName(), parameter);
            return new ProviderBuildResult<>(model);
        } catch (UnknownModelException e) {
            throw (InternalUnsupportedModelException) new InternalUnsupportedModelException().initCause(e);
        }
    }

    private static BuildTreeModelTarget resolveTarget(@Nullable Object target) {
        if (target == null) {
            return BuildTreeModelTarget.ofDefault();
        } else if (target instanceof GradleProjectIdentity) {
            GradleProjectIdentity projectIdentity = (GradleProjectIdentity) target;
            return BuildTreeModelTarget.ofProject(projectIdentity.getRootDir(), projectIdentity.getProjectPath());
        } else if (target instanceof GradleBuildIdentity) {
            GradleBuildIdentity buildIdentity = (GradleBuildIdentity) target;
            return BuildTreeModelTarget.ofBuild(buildIdentity.getRootDir());
        } else {
            throw new IllegalArgumentException("Don't know how to build models for " + target);
        }
    }

    @Override
    public boolean getCanQueryProjectModelInParallel(Class<?> modelType) {
        return controller.queryModelActionsRunInParallel();
    }

    @Override
    public <T> List<T> run(List<Supplier<T>> actions) {
        assertCanQuery();
        return controller.runQueryModelActions(actions);
    }

    private void assertCanQuery() {
        if (!workerThreadRegistry.isWorkerThread()) {
            throw new IllegalStateException("A build controller cannot be used from a thread that is not managed by Gradle.");
        }
    }

    @Override
    public void dispatch(Object value) {
        SerializedPayload serializedModel = payloadSerializer.serialize(value);
        StreamedValue streamedValue = new StreamedValue(serializedModel);
        BuildEventConsumer buildEventConsumer = this.buildEventConsumer;
        sideEffectExecutor.runIsolatableSideEffect(() -> buildEventConsumer.dispatch(streamedValue));
    }

}


/*
 * Copyright 2021 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.gradle.composite.internal;

import org.gradle.api.CircularReferenceException;
import org.gradle.api.Task;
import org.gradle.api.internal.GradleInternal;
import org.gradle.api.internal.TaskInternal;
import org.gradle.api.specs.Spec;
import org.gradle.execution.EntryTaskSelector;
import org.gradle.execution.plan.Node;
import org.gradle.execution.plan.QueryableExecutionPlan;
import org.gradle.execution.plan.TaskNode;
import org.gradle.execution.plan.TaskNodeFactory;
import org.gradle.internal.build.BuildLifecycleController;
import org.gradle.internal.build.BuildState;
import org.gradle.internal.build.BuildWorkGraph;
import org.gradle.internal.build.ExecutionResult;
import org.gradle.internal.build.ExportedTaskNode;
import org.gradle.internal.graph.CachingDirectedGraphWalker;
import org.gradle.internal.graph.DirectedGraphRenderer;
import org.gradle.internal.logging.text.StyledTextOutput;
import org.gradle.internal.operations.BuildOperationRef;
import org.gradle.internal.operations.CurrentBuildOperationRef;
import org.gradle.internal.work.WorkerLeaseService;

import java.io.StringWriter;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.function.BiConsumer;
import java.util.function.Consumer;

class DefaultBuildController implements BuildController {
    private enum State {
        DiscoveringTasks, ReadyToRun, RunningTasks, Finished
    }

    private final BuildWorkGraph workGraph;
    private final Set<ExportedTaskNode> scheduled = new LinkedHashSet<>();
    private final Set<ExportedTaskNode> queuedForExecution = new LinkedHashSet<>();
    private final WorkerLeaseService workerLeaseService;

    private State state = State.DiscoveringTasks;

    public DefaultBuildController(BuildState build, WorkerLeaseService workerLeaseService) {
        this.workerLeaseService = workerLeaseService;
        this.workGraph = build.getWorkGraph().newWorkGraph();
    }

    @Override
    public void queueForExecution(ExportedTaskNode taskNode) {
        assertInState(State.DiscoveringTasks);
        queuedForExecution.add(taskNode);
    }

    @Override
    public void populateWorkGraph(Consumer<? super BuildLifecycleController.WorkGraphBuilder> action) {
        assertInState(State.DiscoveringTasks);
        workGraph.populateWorkGraph(action);
    }

    @Override
    public void addFilter(Spec<Task> filter) {
        assertInState(State.DiscoveringTasks);
        workGraph.addFilter(filter);
    }

    @Override
    public void addFinalization(BiConsumer<EntryTaskSelector.Context, QueryableExecutionPlan> finalization) {
        assertInState(State.DiscoveringTasks);
        workGraph.addFinalization(finalization);
    }

    @Override
    public boolean scheduleQueuedTasks() {
        assertInState(State.DiscoveringTasks);

        queuedForExecution.removeAll(scheduled);
        if (queuedForExecution.isEmpty()) {
            return false;
        }

        boolean added = workGraph.schedule(queuedForExecution);
        scheduled.addAll(queuedForExecution);
        queuedForExecution.clear();
        return added;
    }

    @Override
    public void finalizeWorkGraph() {
        assertInState(State.DiscoveringTasks);
        if (!queuedForExecution.isEmpty()) {
            throw new IllegalStateException("Queued tasks have not been scheduled.");
        }

        // TODO - This check should live in the task execution plan, so that it can reuse checks that have already been performed and
        //   also check for cycles across all nodes
        Set<TaskInternal> visited = new HashSet<>();
        Set<TaskInternal> visiting = new HashSet<>();
        for (ExportedTaskNode node : scheduled) {
            checkForCyclesFor(node.getTask(), visited, visiting);
        }
        workGraph.finalizeGraph();

        state = State.ReadyToRun;
    }

    @Override
    public void startExecution(ExecutorService executorService, Consumer<ExecutionResult<Void>> completionHandler) {
        assertInState(State.ReadyToRun);
        executorService.submit(new BuildOpRunnable(CurrentBuildOperationRef.instance().get(), completionHandler));
        state = State.RunningTasks;
    }

    @Override
    public void stop() {
        workGraph.stop();
    }

    private void assertInState(State expectedState) {
        if (state != expectedState) {
            throw new IllegalStateException("Build is in unexpected state: " + state);
        }
    }

    private static void checkForCyclesFor(TaskInternal task, Set<TaskInternal> visited, Set<TaskInternal> visiting) {
        if (visited.contains(task)) {
            // Already checked
            return;
        }
        if (!visiting.add(task)) {
            // Visiting dependencies -> have found a cycle
            CachingDirectedGraphWalker<TaskInternal, Void> graphWalker = new CachingDirectedGraphWalker<>((node, values, connectedNodes) -> visitDependenciesOf(node, connectedNodes::add));
            graphWalker.add(task);
            List<Set<TaskInternal>> cycles = graphWalker.findCycles();
            Set<TaskInternal> cycle = cycles.get(0);

            DirectedGraphRenderer<TaskInternal> graphRenderer = new DirectedGraphRenderer<>((node, output) -> output.withStyle(StyledTextOutput.Style.Identifier).text(node.getIdentityPath()), (node, values, connectedNodes) -> visitDependenciesOf(node, dep -> {
                if (cycle.contains(dep)) {
                    connectedNodes.add(dep);
                }
            }));
            StringWriter writer = new StringWriter();
            graphRenderer.renderTo(task, writer);
            throw new CircularReferenceException(String.format("Circular dependency between the following tasks:%n%s", writer));
        }
        visitDependenciesOf(task, dep -> checkForCyclesFor(dep, visited, visiting));
        visiting.remove(task);
        visited.add(task);
    }

    private static void visitDependenciesOf(TaskInternal task, Consumer<TaskInternal> consumer) {
        TaskNodeFactory taskNodeFactory = ((GradleInternal) task.getProject().getGradle()).getServices().get(TaskNodeFactory.class);
        TaskNode node = taskNodeFactory.getOrCreateNode(task);
        for (Node dependency : node.getAllSuccessors()) {
            if (dependency instanceof TaskNode) {
                consumer.accept(((TaskNode) dependency).getTask());
            }
        }
    }

    private ExecutionResult<Void> doRun() {
        try {
            return workerLeaseService.runAsWorkerThread(workGraph::runWork);
        } catch (Throwable t) {
            return ExecutionResult.failed(t);
        }
    }

    private class BuildOpRunnable implements Runnable {
        private final BuildOperationRef parentBuildOperation;
        private final Consumer<ExecutionResult<Void>> completionHandler;

        BuildOpRunnable(BuildOperationRef parentBuildOperation, Consumer<ExecutionResult<Void>> completionHandler) {
            this.parentBuildOperation = parentBuildOperation;
            this.completionHandler = completionHandler;
        }

        @Override
        public void run() {
            CurrentBuildOperationRef.instance().with(parentBuildOperation, () -> completionHandler.accept(doRun()));
        }
    }
}


/*
 * Copyright 2013 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.gradle.tooling.internal.provider.runner;

import org.gradle.api.BuildCancelledException;
import org.gradle.initialization.BuildCancellationToken;
import org.gradle.initialization.BuildEventConsumer;
import org.gradle.internal.buildtree.BuildTreeModelController;
import org.gradle.internal.buildtree.BuildTreeModelSideEffectExecutor;
import org.gradle.internal.buildtree.BuildTreeModelTarget;
import org.gradle.internal.work.WorkerThreadRegistry;
import org.gradle.tooling.internal.gradle.GradleBuildIdentity;
import org.gradle.tooling.internal.gradle.GradleProjectIdentity;
import org.gradle.tooling.internal.protocol.BuildExceptionVersion1;
import org.gradle.tooling.internal.protocol.BuildResult;
import org.gradle.tooling.internal.protocol.InternalActionAwareBuildController;
import org.gradle.tooling.internal.protocol.InternalBuildControllerVersion2;
import org.gradle.tooling.internal.protocol.InternalStreamedValueRelay;
import org.gradle.tooling.internal.protocol.InternalUnsupportedModelException;
import org.gradle.tooling.internal.protocol.ModelIdentifier;
import org.gradle.tooling.internal.provider.connection.ProviderBuildResult;
import org.gradle.tooling.internal.provider.serialization.PayloadSerializer;
import org.gradle.tooling.internal.provider.serialization.SerializedPayload;
import org.gradle.tooling.internal.provider.serialization.StreamedValue;
import org.gradle.tooling.provider.model.UnknownModelException;
import org.jspecify.annotations.NullMarked;
import org.jspecify.annotations.Nullable;

import java.util.List;
import java.util.function.Supplier;

@NullMarked
@SuppressWarnings("deprecation")
class DefaultBuildController implements org.gradle.tooling.internal.protocol.InternalBuildController, InternalBuildControllerVersion2, InternalActionAwareBuildController, InternalStreamedValueRelay {
    private final WorkerThreadRegistry workerThreadRegistry;
    private final BuildTreeModelController controller;
    private final BuildCancellationToken cancellationToken;
    private final BuildEventConsumer buildEventConsumer;
    private final BuildTreeModelSideEffectExecutor sideEffectExecutor;
    private final PayloadSerializer payloadSerializer;

    public DefaultBuildController(
        BuildTreeModelController controller,
        WorkerThreadRegistry workerThreadRegistry,
        BuildCancellationToken cancellationToken,
        BuildEventConsumer buildEventConsumer,
        BuildTreeModelSideEffectExecutor sideEffectExecutor,
        PayloadSerializer payloadSerializer
    ) {
        this.workerThreadRegistry = workerThreadRegistry;
        this.controller = controller;
        this.cancellationToken = cancellationToken;
        this.buildEventConsumer = buildEventConsumer;
        this.sideEffectExecutor = sideEffectExecutor;
        this.payloadSerializer = payloadSerializer;
    }

    /**
     * This is used by consumers 1.8-rc-1 to 4.3
     */
    @Override
    @Deprecated
    public BuildResult<?> getBuildModel() throws BuildExceptionVersion1 {
        assertCanQuery();
        return new ProviderBuildResult<Object>(controller.getConfiguredModel());
    }

    /**
     * This is used by consumers 1.8-rc-1 to 4.3
     */
    @Override
    @Deprecated
    public BuildResult<?> getModel(Object target, ModelIdentifier modelIdentifier) throws BuildExceptionVersion1, InternalUnsupportedModelException {
        return getModel(target, modelIdentifier, null);
    }

    /**
     * This is used by consumers 4.4 and later
     */
    @Override
    public BuildResult<?> getModel(@Nullable Object target, ModelIdentifier modelIdentifier, Object parameter)
        throws BuildExceptionVersion1, InternalUnsupportedModelException {
        assertCanQuery();
        if (cancellationToken.isCancellationRequested()) {
            throw new BuildCancelledException(String.format("Could not build '%s' model. Build cancelled.", modelIdentifier.getName()));
        }

        BuildTreeModelTarget scopedTarget = resolveTarget(target);
        try {
            Object model = controller.getModel(scopedTarget, modelIdentifier.getName(), parameter);
            return new ProviderBuildResult<>(model);
        } catch (UnknownModelException e) {
            throw (InternalUnsupportedModelException) new InternalUnsupportedModelException().initCause(e);
        }
    }

    private static BuildTreeModelTarget resolveTarget(@Nullable Object target) {
        if (target == null) {
            return BuildTreeModelTarget.ofDefault();
        } else if (target instanceof GradleProjectIdentity) {
            GradleProjectIdentity projectIdentity = (GradleProjectIdentity) target;
            return BuildTreeModelTarget.ofProject(projectIdentity.getRootDir(), projectIdentity.getProjectPath());
        } else if (target instanceof GradleBuildIdentity) {
            GradleBuildIdentity buildIdentity = (GradleBuildIdentity) target;
            return BuildTreeModelTarget.ofBuild(buildIdentity.getRootDir());
        } else {
            throw new IllegalArgumentException("Don't know how to build models for " + target);
        }
    }

    @Override
    public boolean getCanQueryProjectModelInParallel(Class<?> modelType) {
        return controller.queryModelActionsRunInParallel();
    }

    @Override
    public <T> List<T> run(List<Supplier<T>> actions) {
        assertCanQuery();
        return controller.runQueryModelActions(actions);
    }

    private void assertCanQuery() {
        if (!workerThreadRegistry.isWorkerThread()) {
            throw new IllegalStateException("A build controller cannot be used from a thread that is not managed by Gradle.");
        }
    }

    @Override
    public void dispatch(Object value) {
        SerializedPayload serializedModel = payloadSerializer.serialize(value);
        StreamedValue streamedValue = new StreamedValue(serializedModel);
        BuildEventConsumer buildEventConsumer = this.buildEventConsumer;
        sideEffectExecutor.runIsolatableSideEffect(() -> buildEventConsumer.dispatch(streamedValue));
    }

}

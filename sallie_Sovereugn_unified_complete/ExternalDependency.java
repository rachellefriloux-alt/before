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

package org.gradle.unexported.buildinit.plugins.internal.maven;

import java.util.Collection;

public class ExternalDependency extends Dependency {
    private final String group;
    private final String module;
    private final String version;
    private final String classifier;
    private final Collection<String> excludedModules;

    public ExternalDependency(String configuration, String group, String module, String version, String classifier, Collection<String> excludedModules) {
        super(configuration);
        this.group = group;
        this.module = module;
        this.version = version;
        this.classifier = classifier;
        this.excludedModules = excludedModules;
    }

    public String getGroupId() {
        return group;
    }

    public String getModule() {
        return module;
    }

    public String getVersion() {
        return version;
    }

    public String getClassifier() {
        return classifier;
    }

    public Collection<String> getExcludedModules() {
        return excludedModules;
    }
}


/*
 * Copyright 2011 the original author or authors.
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
package org.gradle.tooling.model;

import org.jspecify.annotations.Nullable;

import java.io.File;

/**
 * Represents an external artifact dependency.
 */
public interface ExternalDependency extends Dependency {
    /**
     * Returns the file for this dependency.
     *
     * @return The file for this dependency.
     */
    File getFile();

    /**
     * Returns the source directory or archive for this dependency, or {@code null} if no source is available.
     *
     * @return The source directory or archive for this dependency, or {@code null} if no source is available.
     */
    @Nullable
    File getSource();

    /**
     * Returns the Javadoc directory or archive for this dependency, or {@code null} if no Javadoc is available.
     *
     * @return the Javadoc directory or archive for this dependency, or {@code null} if no Javadoc is available.
     */
    @Nullable
    File getJavadoc();

    /**
     * Marks this dependency as exported.
     *
     * @return whether this dependency needs to be exported.
     * @since 2.5
     */
    boolean isExported();

    /**
     * Returns the Gradle module information for this dependency, or {@code null} if the dependency does not
     * originate from a remote repository.
     *
     * @return The Gradle module information for this dependency, or {@code null} if the dependency does not
     * originate from a remote repository.
     * @since 1.1
     */
    @Nullable
    GradleModuleVersion getGradleModuleVersion();
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

package org.gradle.unexported.buildinit.plugins.internal.maven;

import java.util.Collection;

public class ExternalDependency extends Dependency {
    private final String group;
    private final String module;
    private final String version;
    private final String classifier;
    private final Collection<String> excludedModules;

    public ExternalDependency(String configuration, String group, String module, String version, String classifier, Collection<String> excludedModules) {
        super(configuration);
        this.group = group;
        this.module = module;
        this.version = version;
        this.classifier = classifier;
        this.excludedModules = excludedModules;
    }

    public String getGroupId() {
        return group;
    }

    public String getModule() {
        return module;
    }

    public String getVersion() {
        return version;
    }

    public String getClassifier() {
        return classifier;
    }

    public Collection<String> getExcludedModules() {
        return excludedModules;
    }
}


/*
 * Copyright 2011 the original author or authors.
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
package org.gradle.tooling.model;

import org.jspecify.annotations.Nullable;

import java.io.File;

/**
 * Represents an external artifact dependency.
 */
public interface ExternalDependency extends Dependency {
    /**
     * Returns the file for this dependency.
     *
     * @return The file for this dependency.
     */
    File getFile();

    /**
     * Returns the source directory or archive for this dependency, or {@code null} if no source is available.
     *
     * @return The source directory or archive for this dependency, or {@code null} if no source is available.
     */
    @Nullable
    File getSource();

    /**
     * Returns the Javadoc directory or archive for this dependency, or {@code null} if no Javadoc is available.
     *
     * @return the Javadoc directory or archive for this dependency, or {@code null} if no Javadoc is available.
     */
    @Nullable
    File getJavadoc();

    /**
     * Marks this dependency as exported.
     *
     * @return whether this dependency needs to be exported.
     * @since 2.5
     */
    boolean isExported();

    /**
     * Returns the Gradle module information for this dependency, or {@code null} if the dependency does not
     * originate from a remote repository.
     *
     * @return The Gradle module information for this dependency, or {@code null} if the dependency does not
     * originate from a remote repository.
     * @since 1.1
     */
    @Nullable
    GradleModuleVersion getGradleModuleVersion();
}

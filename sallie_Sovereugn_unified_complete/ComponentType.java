/*
 * Copyright 2019 the original author or authors.
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

package org.gradle.buildinit.plugins.internal.modifiers;

import com.google.common.collect.ImmutableList;
import java.util.List;

public enum ComponentType {
    // These are in display order
    APPLICATION("Application", "app", "list", "utilities"),
    LIBRARY("Library", "lib"),
    GRADLE_PLUGIN("Gradle plugin", "plugin"),
    BASIC("Basic (build structure only)");

    private final String displayName;
    private final ImmutableList<String> defaultProjectNames;

    ComponentType(String displayName, String... defaultProjectNames) {
        this.displayName = displayName;
        this.defaultProjectNames = ImmutableList.copyOf(defaultProjectNames);
    }

    public List<String> getDefaultProjectNames() {
        return defaultProjectNames;
    }

    public String getDisplayName() {
        return displayName;
    }

    @Override
    public String toString() {
        return Names.displayNameFor(this);
    }

    public String pluralName() {
        return (this + "s").replace("ys", "ies");
    }
}


/*
 * Copyright 2014 the original author or authors.
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

package org.gradle.platform.base;

import org.gradle.api.Incubating;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Declares a custom {@link org.gradle.platform.base.ComponentSpec} type.
 *
 * The following example demonstrates how to register a custom component type using a plugin with a
 * {@link ComponentType} annotation.
 * Furthermore the plugin creates an instance of SampleComponent named 'sampleComponent'.
 *
 * <pre class='autoTested'>
 * interface SampleComponent extends ComponentSpec {}
 * class DefaultSampleComponent extends BaseComponentSpec implements SampleComponent {}
 *
 * apply plugin: MySamplePlugin
 *
 * class MySamplePlugin extends RuleSource {
 *     {@literal @}ComponentType
 *     void register(TypeBuilder&lt;SampleComponent&gt; builder) {
 *         builder.defaultImplementation(DefaultSampleComponent)
 *     }
 *
 *     {@literal @}Mutate
 *     void createSampleLibraryComponents(ModelMap&lt;SampleComponent&gt; componentSpecs) {
 *         componentSpecs.create("sampleComponent")
 *     }
 * }
 * </pre>
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@Incubating
public @interface ComponentType {
}


/*
 * Copyright 2019 the original author or authors.
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

package org.gradle.buildinit.plugins.internal.modifiers;

import com.google.common.collect.ImmutableList;
import java.util.List;

public enum ComponentType {
    // These are in display order
    APPLICATION("Application", "app", "list", "utilities"),
    LIBRARY("Library", "lib"),
    GRADLE_PLUGIN("Gradle plugin", "plugin"),
    BASIC("Basic (build structure only)");

    private final String displayName;
    private final ImmutableList<String> defaultProjectNames;

    ComponentType(String displayName, String... defaultProjectNames) {
        this.displayName = displayName;
        this.defaultProjectNames = ImmutableList.copyOf(defaultProjectNames);
    }

    public List<String> getDefaultProjectNames() {
        return defaultProjectNames;
    }

    public String getDisplayName() {
        return displayName;
    }

    @Override
    public String toString() {
        return Names.displayNameFor(this);
    }

    public String pluralName() {
        return (this + "s").replace("ys", "ies");
    }
}


/*
 * Copyright 2014 the original author or authors.
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

package org.gradle.platform.base;

import org.gradle.api.Incubating;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Declares a custom {@link org.gradle.platform.base.ComponentSpec} type.
 *
 * The following example demonstrates how to register a custom component type using a plugin with a
 * {@link ComponentType} annotation.
 * Furthermore the plugin creates an instance of SampleComponent named 'sampleComponent'.
 *
 * <pre class='autoTested'>
 * interface SampleComponent extends ComponentSpec {}
 * class DefaultSampleComponent extends BaseComponentSpec implements SampleComponent {}
 *
 * apply plugin: MySamplePlugin
 *
 * class MySamplePlugin extends RuleSource {
 *     {@literal @}ComponentType
 *     void register(TypeBuilder&lt;SampleComponent&gt; builder) {
 *         builder.defaultImplementation(DefaultSampleComponent)
 *     }
 *
 *     {@literal @}Mutate
 *     void createSampleLibraryComponents(ModelMap&lt;SampleComponent&gt; componentSpecs) {
 *         componentSpecs.create("sampleComponent")
 *     }
 * }
 * </pre>
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@Incubating
public @interface ComponentType {
}

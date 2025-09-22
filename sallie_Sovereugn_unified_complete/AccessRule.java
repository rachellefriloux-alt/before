/*
 * Copyright 2016 the original author or authors.
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

package org.gradle.plugins.ide.eclipse.model;

import com.google.common.base.Objects;
import com.google.common.base.Preconditions;

/**
 * Access rule associated to a classpath entry.
 */
public class AccessRule {
    private String kind;
    private String pattern;

    public AccessRule(String kind, String pattern) {
        this.kind = Preconditions.checkNotNull(kind);
        this.pattern = Preconditions.checkNotNull(pattern);
    }

    public String getKind() {
        return kind;
    }

    public void setKind(String kind) {
        this.kind = kind;
    }

    public String getPattern() {
        return pattern;
    }

    public void setPattern(String pattern) {
        this.pattern = pattern;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        AccessRule that = (AccessRule) o;
        return Objects.equal(kind, that.kind) && Objects.equal(pattern, that.pattern);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(kind, pattern);
    }

    @Override
    public String toString() {
        return "AccessRule{kind='" + kind + "', pattern='" + pattern +  "'}";
    }
}



/*
 * Copyright 2016 the original author or authors.
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

package org.gradle.tooling.model.eclipse;

/**
 * Access rule associated with an Eclipse classpath entry.
 *
 * @see <a href="http://help.eclipse.org/mars/topic/org.eclipse.jdt.doc.isv/reference/api/org/eclipse/jdt/core/IAccessRule.html">IAccessRule Javadoc</a>
 *
 * @since 3.0
 */
public interface AccessRule {

    /**
     * Returns the encoded type of the access rule. The meaning of the values:
     * <ul>
     *     <li>0: the rule defines accessible paths</li>
     *     <li>1: the rule defines inaccessible paths</li>
     *     <li>2: the rule defines discouraged paths</li>
     * </ul>
     *
     * @return The type of this access rule.
     */
    int getKind();

    /**
     * Returns the file pattern of this access rule.
     *
     * @return The file pattern of this access rule.
     */
    String getPattern();
}


/*
 * Copyright 2016 the original author or authors.
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

package org.gradle.plugins.ide.eclipse.model;

import com.google.common.base.Objects;
import com.google.common.base.Preconditions;

/**
 * Access rule associated to a classpath entry.
 */
public class AccessRule {
    private String kind;
    private String pattern;

    public AccessRule(String kind, String pattern) {
        this.kind = Preconditions.checkNotNull(kind);
        this.pattern = Preconditions.checkNotNull(pattern);
    }

    public String getKind() {
        return kind;
    }

    public void setKind(String kind) {
        this.kind = kind;
    }

    public String getPattern() {
        return pattern;
    }

    public void setPattern(String pattern) {
        this.pattern = pattern;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        AccessRule that = (AccessRule) o;
        return Objects.equal(kind, that.kind) && Objects.equal(pattern, that.pattern);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(kind, pattern);
    }

    @Override
    public String toString() {
        return "AccessRule{kind='" + kind + "', pattern='" + pattern +  "'}";
    }
}



/*
 * Copyright 2016 the original author or authors.
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

package org.gradle.tooling.model.eclipse;

/**
 * Access rule associated with an Eclipse classpath entry.
 *
 * @see <a href="http://help.eclipse.org/mars/topic/org.eclipse.jdt.doc.isv/reference/api/org/eclipse/jdt/core/IAccessRule.html">IAccessRule Javadoc</a>
 *
 * @since 3.0
 */
public interface AccessRule {

    /**
     * Returns the encoded type of the access rule. The meaning of the values:
     * <ul>
     *     <li>0: the rule defines accessible paths</li>
     *     <li>1: the rule defines inaccessible paths</li>
     *     <li>2: the rule defines discouraged paths</li>
     * </ul>
     *
     * @return The type of this access rule.
     */
    int getKind();

    /**
     * Returns the file pattern of this access rule.
     *
     * @return The file pattern of this access rule.
     */
    String getPattern();
}

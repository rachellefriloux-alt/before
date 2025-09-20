/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Root build configuration for modular Android launcher.
 * Got it, love.
 */

// Top-level build file for Sallie 1.0
// Root build: alignment, verification, coverage, formatting – privacy-first (no new network code)
plugins {
    kotlin("jvm") version "1.9.10" apply false
    id("org.jlleitschuh.gradle.ktlint") version "11.6.1" apply false
    jacoco
}

val coverageMin: String = providers.environmentVariable("COVERAGE_MIN")
    .orElse(providers.gradleProperty("coverageMin"))
    .orElse("0.30")
    .get()
extensions.extraProperties["coverageMin"] = coverageMin

// Ensure a single aggregate check
val rootCheck = tasks.findByName("check") ?: tasks.register("check") {
    group = "verification"
    description = "Aggregate Salle verification (all subprojects + persona checks)."
}

// Apply verification to root project
apply(from = "verification.gradle.kts")

subprojects {
    plugins.withId("org.jetbrains.kotlin.jvm") {
        apply(plugin = "org.jlleitschuh.gradle.ktlint")
        apply(plugin = "jacoco")
        tasks.withType<Test>().configureEach { useJUnitPlatform() }
        if (tasks.findByName("jacocoTestReport") == null) {
            tasks.register<JacocoReport>("jacocoTestReport") {
                dependsOn(tasks.withType<Test>())
                reports { xml.required.set(true); html.required.set(true) }
                val classesDir = fileTree(layout.buildDirectory.dir("classes/kotlin/main"))
                classDirectories.setFrom(classesDir)
                sourceDirectories.setFrom(files("src/main/kotlin"))
                executionData.setFrom(fileTree(layout.buildDirectory.get().asFile) { include("**/jacoco/test*.exec", "**/jacoco/test/*.exec", "**/jacoco/*.exec") })
                onlyIf { executionData.files.any { it.exists() } }
            }
        }
        if (tasks.findByName("jacocoCoverageVerification") == null) {
            tasks.register<JacocoCoverageVerification>("jacocoCoverageVerification") {
                dependsOn(tasks.withType<Test>())
                val classesDir = fileTree(layout.buildDirectory.dir("classes/kotlin/main"))
                classDirectories.setFrom(classesDir)
                sourceDirectories.setFrom(files("src/main/kotlin"))
                executionData.setFrom(fileTree(layout.buildDirectory.get().asFile) { include("**/jacoco/test*.exec", "**/jacoco/test/*.exec", "**/jacoco/*.exec") })
                violationRules { rule { limit { minimum = coverageMin.toBigDecimal() } } }
                tasks.findByName("jacocoTestReport")?.let { mustRunAfter(it) }
                // Skip gracefully if no execution data (no tests)
                onlyIf { executionData.files.any { it.exists() } }
            }
        }
        tasks.matching { it.name == "check" }.configureEach {
            tasks.findByName("jacocoCoverageVerification")?.let { dependsOn(it) }
        }
    }
    plugins.withId("org.jetbrains.kotlin.android") {
        apply(plugin = "org.jlleitschuh.gradle.ktlint")
        apply(plugin = "jacoco")
        // Configure JUnit Platform for JVM unit tests inside Android modules
        tasks.withType<Test>().configureEach { useJUnitPlatform() }
        // Android unit test compiled class directories (debug variant typical)
        val kotlinClasses = layout.buildDirectory.dir("intermediates/javac/debug/classes")
        val altKotlinClasses = layout.buildDirectory.dir("tmp/kotlin-classes/debug")
        if (tasks.findByName("jacocoTestReport") == null) {
            tasks.register<JacocoReport>("jacocoTestReport") {
                dependsOn(tasks.withType<Test>())
                reports { xml.required.set(true); html.required.set(true) }
                classDirectories.setFrom(files(
                    fileTree(kotlinClasses) { include("**/*.class") },
                    fileTree(altKotlinClasses) { include("**/*.class") }
                ))
                sourceDirectories.setFrom(files("src/main/kotlin"))
            }
        }
    }
}

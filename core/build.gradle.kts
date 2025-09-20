/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Core functionality and utilities.
 * Got it, love.
 */

plugins {
    kotlin("jvm") version "2.2.0"
}

dependencies {
    implementation(kotlin("stdlib"))
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.0")
    
    testImplementation("org.jetbrains.kotlin:kotlin-test")
    testImplementation("io.kotest:kotest-runner-junit5:5.8.0")
    testImplementation("io.kotest:kotest-assertions-core:5.8.0")
}

// Temporarily exclude Android-dependent files
sourceSets {
    main {
        kotlin {
            exclude("**/backup/**")
            exclude("**/device/**")
        }
    }
}

tasks.test {
    useJUnitPlatform()
    testLogging {
        events("passed", "skipped", "failed")
    }
}

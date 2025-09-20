/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Values and configuration.
 * Got it, love.
 */

plugins {
    kotlin("jvm") version "2.2.0"
}

dependencies {
    implementation(kotlin("stdlib"))
    testImplementation("org.jetbrains.kotlin:kotlin-test")
    testImplementation("io.kotest:kotest-runner-junit5:5.8.0")
    testImplementation("io.kotest:kotest-assertions-core:5.8.0")
}

tasks.test {
    useJUnitPlatform()
    testLogging {
        events("passed", "skipped", "failed")
    }
}

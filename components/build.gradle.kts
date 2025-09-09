/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: UI components and styling system.
 * Got it, love.
 */

plugins {
    kotlin("jvm")
}

dependencies {
    implementation(project(":core"))
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")

    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlin:kotlin-test")
}

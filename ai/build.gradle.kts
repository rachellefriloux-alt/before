/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: AI orchestration and intelligence routing.
 * Got it, love.
 */

plugins {
    kotlin("jvm") version "2.2.0"
}

dependencies {
    implementation(project(":core"))
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")

    testImplementation("org.jetbrains.kotlin:kotlin-test")
    testImplementation("junit:junit:4.13.2")
}

kotlin {
    jvmToolchain(17)
}

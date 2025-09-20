/*
 * Sallie 1.0 Root Build Configuration
 * Persona: Tough love meets soul care.
 * Function: Multi-module Kotlin project with Android support.
 * Got it, love.
 */

plugins {
    kotlin("jvm") version "2.2.0" apply false
    id("org.jetbrains.kotlinx.kover") version "0.6.1" apply false
}

allprojects {
    repositories {
        mavenCentral()
        google()
        gradlePluginPortal()
    }
}

// Global tasks
tasks.register("buildAll") {
    description = "Builds all Sallie modules"
    group = "build"
    
    // Only include projects that actually have build tasks
    dependsOn(
        ":ai:build",
        ":core:build", 
        ":identity:build",
        ":onboarding:build",
        ":personaCore:build",
        ":responseTemplates:build",
        ":tone:build",
        ":values:build",
        ":features:feature:build"
    )
}

tasks.register("testAll") {
    description = "Tests all Sallie modules"
    group = "verification"
    
    dependsOn(subprojects.map { "${it.path}:test" })
}

tasks.register("cleanAll") {
    description = "Cleans all Sallie modules"
    group = "build"
    
    dependsOn(subprojects.map { "${it.path}:clean" })
}
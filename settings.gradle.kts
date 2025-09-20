/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Project settings and module inclusion.
 * Got it, love.
 */

// Explicit settings for Sallie multi-module workspace
pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.PREFER_PROJECT)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "sallie_1.0"

// Core modules
// include(":app")  // Temporarily disabled to fix Kotlin modules first
include(":ai")
include(":core")
include(":features:feature")  // Fixed path to actual feature directory 
// include(":components")  // Temporarily disabled - has Android dependencies
include(":identity")
include(":onboarding")
include(":personaCore")
include(":responseTemplates")
include(":tone")
// include(":ui")  // Temporarily disabled - has Android dependencies
include(":values")

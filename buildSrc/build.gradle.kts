/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Build configuration for Sallie plugin injection system.
 * Got it, love.
 */

plugins {
    kotlin("jvm") version "1.9.25"
    `gradle-plugin-development`
}

repositories {
    gradlePluginPortal()
    mavenCentral()
}

dependencies {
    implementation(gradleApi())
    implementation(kotlin("stdlib"))
    
    // Test dependencies
    testImplementation(kotlin("test"))
    testImplementation("org.junit.jupiter:junit-jupiter:5.9.2")
    testImplementation(gradleTestKit())
}

gradlePlugin {
    plugins {
        create("sallie-plugin-injection") {
            id = "com.sallie.plugin-injection"
            implementationClass = "SalliePluginInjectionPlugin"
            displayName = "Sallie Plugin Injection"
            description = "Support for injecting plugins into nested Gradle builds"
        }
    }
}
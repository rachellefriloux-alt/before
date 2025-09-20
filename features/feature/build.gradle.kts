/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Feature registry and orchestration.
 * Got it, love.
 */

plugins {
    kotlin("jvm") version "2.2.0"
}

repositories {
    mavenCentral()
    google()
}

dependencies {
    implementation(kotlin("stdlib"))
    
    // Testing
    testImplementation(kotlin("test"))
    testImplementation("org.junit.jupiter:junit-jupiter:5.9.2")
}

tasks.test {
    useJUnitPlatform()
}

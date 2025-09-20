plugins {
    id("org.jlleitschuh.gradle.ktlint") version "12.1.0"
}
ktlint {
    verbose.set(true)
    android.set(false)
    outputToConsole.set(true)
    ignoreFailures.set(false)
    enableExperimentalRules.set(true)
}

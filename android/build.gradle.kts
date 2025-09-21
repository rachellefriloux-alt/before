// Top-level build file where you can add configuration options common to all sub-projects/modules.

buildscript {
    val buildToolsVersion by extra("34.0.0")
    val minSdkVersion by extra(23)
    val compileSdkVersion by extra(34)
    val targetSdkVersion by extra(34)
    val kotlinVersion by extra("1.9.22")

    repositories {
        google()
        mavenCentral()
    }

    dependencies {
        classpath("com.android.tools.build:gradle:8.1.4")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlinVersion")
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
        maven { url = uri("https://www.jitpack.io") }
    }
}
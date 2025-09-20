// Top-level build file where you can add configuration options common to all sub-projects/modules.

// Load path shortener utility
apply(from = "path-shortener.gradle")

buildscript {
    val buildToolsVersion by extra("34.0.0")
    val minSdkVersion by extra(23)
    val compileSdkVersion by extra(34)
    val targetSdkVersion by extra(34)
    val ndkVersion by extra("26.1.10909125")
    val kotlinVersion by extra("1.9.22")

    repositories {
        google()
        mavenCentral()
    }

    dependencies {
        classpath("com.android.tools.build:gradle:8.1.4")
        classpath("com.facebook.react:react-native-gradle-plugin")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlinVersion")
        classpath("com.google.gms:google-services:4.4.2")
        classpath("com.google.firebase:firebase-crashlytics-gradle:3.0.2")
    }
}

plugins {
    // Add the dependency for the Google services Gradle plugin
    id("com.google.gms.google-services") version "4.4.3" apply false
    id("com.google.firebase.crashlytics") version "3.0.3" apply false
    id("dev.expo.gradle") version "1.0.+" apply false
}

apply(plugin = "com.facebook.react.rootproject")
apply(plugin = "dev.expo.gradle")

allprojects {
    repositories {
        google()
        mavenCentral()
        maven { url = uri("https://www.jitpack.io") }
    }
}

// @generated begin expo-camera-import - expo prebuild (DO NOT MODIFY) sync-f244f4f3d8bf7229102e8f992b525b8602c74770
val expoCameraMavenPath = File("../../node_modules/expo-camera/android/maven")
allprojects { repositories { maven { url = uri(expoCameraMavenPath) } } }
// @generated end expo-camera-import
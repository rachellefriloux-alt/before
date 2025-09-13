// Top-level build file where you can add configuration options common to all sub-projects/modules.

// Load path shortener utility
apply(from = "path-shortener.gradle")

buildscript {
    extra.apply {
        set("buildToolsVersion", findProperty("android.buildToolsVersion") ?: "35.0.0")
        set("minSdkVersion", (findProperty("android.minSdkVersion") as? String)?.toInt() ?: 24)
        set("compileSdkVersion", (findProperty("android.compileSdkVersion") as? String)?.toInt() ?: 35)
        set("targetSdkVersion", (findProperty("android.targetSdkVersion") as? String)?.toInt() ?: 35)
        set("kotlinVersion", findProperty("android.kotlinVersion") ?: "2.0.0")
        set("ndkVersion", "27.0.12077973")
    }
    
    repositories {
        google()
        mavenCentral()
    }
    
    dependencies {
        classpath("com.android.tools.build:gradle")
        classpath("com.facebook.react:react-native-gradle-plugin")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin")
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
        maven {
            // All of React Native (JS, Obj-C sources, Android binaries) is installed from npm
            url = uri("../../node_modules/react-native/android")
        }
        maven {
            // Android JSC is installed from npm
            url = uri("../../node_modules/jsc-android/dist")
        }

        google()
        mavenCentral()
        maven { url = uri("https://www.jitpack.io") }
    }
}

// @generated begin expo-camera-import - expo prebuild (DO NOT MODIFY) sync-f244f4f3d8bf7229102e8f992b525b8602c74770
val expoCameraMavenPath = File("../../node_modules/expo-camera/android/maven")
allprojects { repositories { maven { url = uri(expoCameraMavenPath) } } }
// @generated end expo-camera-import
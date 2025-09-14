plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("com.facebook.react")
    id("com.google.gms.google-services")
    id("com.google.firebase.crashlytics")
}

val projectRoot = rootDir.absoluteFile.parentFile.absolutePath

/**
 * This is the configuration block to customize your React Native Android app.
 * By default you don't need to apply any configuration, just uncomment the lines you need.
 */
react {
    entryFile.set(file("../../App.tsx"))
    reactNativeDir.set(file("../../node_modules/react-native"))
    hermesCommand.set("../../node_modules/react-native/sdks/hermesc/%OS-BIN%/hermesc")
    codegenDir.set(file("../../node_modules/@react-native/codegen"))

    // Use Expo CLI to bundle the app, this ensures the Metro config
    // works correctly with Expo projects. The @expo/cli package may be
    // a directory (bin executable inside) or a file. Gradle expects a
    // file input for the Hermes bundling task, so prefer the CLI entry
    // file when available.
    val expoCliPath = file("../../node_modules/@expo/cli")
    if (expoCliPath.exists() && expoCliPath.isDirectory) {
        // common entry point inside the package
        // prefer the built CLI entry used by the package
        val builtCli = File(expoCliPath, "build/bin/cli")
        if (builtCli.exists()) {
            cliFile.set(builtCli)
        } else {
            val candidate = File(expoCliPath, "bin/expo-cli.js")
            if (candidate.exists()) {
                cliFile.set(candidate)
            } else {
                // fallback to the package directory (some setups) to avoid breaking dev flow
                cliFile.set(expoCliPath)
            }
        }
    } else {
        cliFile.set(expoCliPath)
    }
    bundleCommand.set("export:embed")

    // Use compatible Hermes compiler flags. '-O3' is not supported by some hermesc
    // binaries on Windows; use '-O' for optimization instead.
    hermesFlags.set(listOf("-O", "-output-source-map", "-Werror", "-w"))

    /* Autolinking */
    autolinkLibrariesWithApp()
}

/**
 * Set this to true to Run Proguard on Release builds to minify the Java bytecode.
 */
val enableProguardInReleaseBuilds = true

/**
 * Enable or disable split APKs for better performance.
 */
val enableSeparateBuildPerCPUArchitecture = true

/**
 * Enable optimization of resources for release builds
 */
val enableResourceOptimization = true

/**
 * The preferred build flavor of JavaScriptCore (JSC)
 *
 * For example, to use the international variant, you can use:
 * `val jscFlavor = "org.webkit:android-jsc-intl:+"`
 *
 * The international variant includes ICU i18n library and necessary data
 * allowing to use e.g. `Date.toLocaleString` and `String.localeCompare` that
 * give correct results when using with locales other than en-US. Note that
 * this variant is about 6MiB larger per architecture than default.
 */
val jscFlavor = "org.webkit:android-jsc:+"

android {
    ndkVersion = rootProject.extra["ndkVersion"] as String
    buildToolsVersion = rootProject.extra["buildToolsVersion"] as String
    compileSdk = 34

    namespace = "com.sallie.app"
    
    buildFeatures {
        buildConfig = true
    }
    defaultConfig {
        applicationId = "com.sallie.app"
        minSdk = 23
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
        
        externalNativeBuild {
            cmake {
                cppFlags("-Wno-dollar-in-identifier-extension")
                // Use shorter build paths to avoid CMake path length issues
                arguments("-DCMAKE_OBJECT_PATH_MAX=500")
            }
        }
        missingDimensionStrategy("mode", "cloud")
    }
    
    flavorDimensions += "mode"
    
    signingConfigs {
        getByName("debug") {
            storeFile = file("debug.keystore")
            storePassword = "android"
            keyAlias = "androiddebugkey"
            keyPassword = "android"
        }
    }
    
    buildTypes {
        getByName("debug") {
            isMinifyEnabled = false
            isShrinkResources = false
            proguardFiles(getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro")
            signingConfig = signingConfigs.getByName("debug")
            externalNativeBuild {
                cmake {
                    cppFlags("-Wno-dollar-in-identifier-extension")
                }
            }
        }
        
        getByName("release") {
            // Caution! In production, you need to generate your own keystore file.
            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig = signingConfigs.getByName("debug")
            isShrinkResources = true
            isMinifyEnabled = enableProguardInReleaseBuilds
            proguardFiles(getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro")
            isCrunchPngs = true
            externalNativeBuild {
                cmake {
                    cppFlags("-Wno-dollar-in-identifier-extension")
                    arguments("-DANDROID_STL=c++_shared", "-DCMAKE_BUILD_TYPE=Release")
                }
            }
        }
    }

    productFlavors {
        create("cloud") {
            dimension = "mode"
            applicationIdSuffix = ".cloud"
            buildConfigField("boolean", "LOCAL_ONLY", "false")
            manifestPlaceholders["appLabel"] = "Sallie Cloud"
        }

        create("localOnly") {
            dimension = "mode"
            applicationIdSuffix = ".local"
            buildConfigField("boolean", "LOCAL_ONLY", "true")
            manifestPlaceholders["appLabel"] = "Sallie Local"
        }
    }

    packaging {
        jniLibs {
            useLegacyPackaging = findProperty("expo.useLegacyPackaging")?.toString()?.toBoolean() ?: false
        }
        resources {
            excludes += setOf(
                "META-INF/DEPENDENCIES", 
                "META-INF/LICENSE", 
                "META-INF/LICENSE.txt", 
                "META-INF/license.txt", 
                "META-INF/NOTICE", 
                "META-INF/NOTICE.txt", 
                "META-INF/notice.txt", 
                "META-INF/ASL2.0", 
                "META-INF/*.kotlin_module"
            )
        }
    }
    
    androidResources {
        ignoreAssetsPattern = "!.svn:!.git:!.ds_store:!*.scc:!CVS:!thumbs.db:!picasa.ini:!*~"
    }
    
    // Enable split APKs for faster downloads and reduced size
    splits {
        abi {
            isEnable = true
            reset()
            include("armeabi-v7a", "arm64-v8a", "x86", "x86_64")
            isUniversalApk = false
        }
    }
}

// Apply static values from `gradle.properties` to the `android.packagingOptions`
// Accepts values in comma delimited lists, example:
// android.packagingOptions.pickFirsts=/LICENSE,**/picasa.ini
listOf("pickFirsts", "excludes", "merges", "doNotStrip").forEach { prop ->
    // Split option: 'foo,bar' -> ['foo', 'bar']
    val options = (findProperty("android.packagingOptions.$prop") as? String ?: "").split(",")
        .map { it.trim() }
        .filter { it.isNotEmpty() }

    if (options.isNotEmpty()) {
        println("android.packagingOptions.$prop += $options (${options.size})")
        // Ex: android.packaging.resources.pickFirsts += '**/SCCS/**'
        options.forEach { option ->
            when (prop) {
                "pickFirsts" -> android.packaging.resources.pickFirsts.add(option)
                "excludes" -> android.packaging.resources.excludes.add(option)
                "merges" -> android.packaging.resources.merges.add(option)
                // Note: doNotStrip is handled differently in newer Gradle versions
            }
        }
    }
}

dependencies {
    // The version of react-native is set by the React Native Gradle Plugin
    implementation("com.facebook.react:react-android")

    val isGifEnabled = (findProperty("expo.gif.enabled") as? String ?: "") == "true"
    val isWebpEnabled = (findProperty("expo.webp.enabled") as? String ?: "") == "true"
    val isWebpAnimatedEnabled = (findProperty("expo.webp.animated") as? String ?: "") == "true"

    if (isGifEnabled) {
        // For animated gif support
        implementation("com.facebook.fresco:animated-gif:${reactAndroidLibs.versions.fresco.get()}")
    }

    if (isWebpEnabled) {
        // For webp support
        implementation("com.facebook.fresco:webpsupport:${reactAndroidLibs.versions.fresco.get()}")
        if (isWebpAnimatedEnabled) {
            // Animated webp support
            implementation("com.facebook.fresco:animated-webp:${reactAndroidLibs.versions.fresco.get()}")
        }
    }

    if (findProperty("hermesEnabled")?.toString()?.toBoolean() == true) {
        implementation("com.facebook.react:hermes-android")
    } else {
        implementation(jscFlavor)
    }

    // Import the Firebase BoM
    implementation(platform("com.google.firebase:firebase-bom:34.2.0"))

    // Firebase dependencies (versions managed by BOM)
    implementation("com.google.firebase:firebase-analytics")
    implementation("com.google.firebase:firebase-auth")
    implementation("com.google.firebase:firebase-firestore")
    implementation("com.google.firebase:firebase-storage")
    implementation("com.google.firebase:firebase-crashlytics")
}
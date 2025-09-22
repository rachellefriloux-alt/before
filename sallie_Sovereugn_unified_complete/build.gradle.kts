/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Root build configuration for modular Android launcher.
 * Got it, love.
 */

// Top-level build file for Sallie 1.0
// Root build: alignment, verification, coverage, formatting – privacy-first (no new network code)
plugins {
    kotlin("jvm") version "1.9.10" apply false
    id("org.jlleitschuh.gradle.ktlint") version "11.6.1" apply false
    jacoco
}

val coverageMin: String = providers.environmentVariable("COVERAGE_MIN")
    .orElse(providers.gradleProperty("coverageMin"))
    .orElse("0.30")
    .get()
extensions.extraProperties["coverageMin"] = coverageMin

// Ensure a single aggregate check
val rootCheck = tasks.findByName("check") ?: tasks.register("check") {
    group = "verification"
    description = "Aggregate Salle verification (all subprojects + persona checks)."
}

// Apply verification to root project
apply(from = "verification.gradle.kts")

subprojects {
    plugins.withId("org.jetbrains.kotlin.jvm") {
        apply(plugin = "org.jlleitschuh.gradle.ktlint")
        apply(plugin = "jacoco")
        tasks.withType<Test>().configureEach { useJUnitPlatform() }
        if (tasks.findByName("jacocoTestReport") == null) {
            tasks.register<JacocoReport>("jacocoTestReport") {
                dependsOn(tasks.withType<Test>())
                reports { xml.required.set(true); html.required.set(true) }
                val classesDir = fileTree(layout.buildDirectory.dir("classes/kotlin/main"))
                classDirectories.setFrom(classesDir)
                sourceDirectories.setFrom(files("src/main/kotlin"))
                executionData.setFrom(fileTree(layout.buildDirectory.get().asFile) { include("**/jacoco/test*.exec", "**/jacoco/test/*.exec", "**/jacoco/*.exec") })
                onlyIf { executionData.files.any { it.exists() } }
            }
        }
        if (tasks.findByName("jacocoCoverageVerification") == null) {
            tasks.register<JacocoCoverageVerification>("jacocoCoverageVerification") {
                dependsOn(tasks.withType<Test>())
                val classesDir = fileTree(layout.buildDirectory.dir("classes/kotlin/main"))
                classDirectories.setFrom(classesDir)
                sourceDirectories.setFrom(files("src/main/kotlin"))
                executionData.setFrom(fileTree(layout.buildDirectory.get().asFile) { include("**/jacoco/test*.exec", "**/jacoco/test/*.exec", "**/jacoco/*.exec") })
                violationRules { rule { limit { minimum = coverageMin.toBigDecimal() } } }
                tasks.findByName("jacocoTestReport")?.let { mustRunAfter(it) }
                // Skip gracefully if no execution data (no tests)
                onlyIf { executionData.files.any { it.exists() } }
            }
        }
        tasks.matching { it.name == "check" }.configureEach {
            tasks.findByName("jacocoCoverageVerification")?.let { dependsOn(it) }
        }
    }
    plugins.withId("org.jetbrains.kotlin.android") {
        apply(plugin = "org.jlleitschuh.gradle.ktlint")
        apply(plugin = "jacoco")
        // Configure JUnit Platform for JVM unit tests inside Android modules
        tasks.withType<Test>().configureEach { useJUnitPlatform() }
        // Android unit test compiled class directories (debug variant typical)
        val kotlinClasses = layout.buildDirectory.dir("intermediates/javac/debug/classes")
        val altKotlinClasses = layout.buildDirectory.dir("tmp/kotlin-classes/debug")
        if (tasks.findByName("jacocoTestReport") == null) {
            tasks.register<JacocoReport>("jacocoTestReport") {
                dependsOn(tasks.withType<Test>())
                reports { xml.required.set(true); html.required.set(true) }
                classDirectories.setFrom(files(
                    fileTree(kotlinClasses) { include("**/*.class") },
                    fileTree(altKotlinClasses) { include("**/*.class") }
                ))
                sourceDirectories.setFrom(files("src/main/kotlin"))
            }
        }
    }
}


plugins {
  id("com.android.application")
  kotlin("android")
}

android {
  namespace = "com.sallie.app"
  compileSdk = 36

  defaultConfig {
    applicationId = "com.sallie.app"
    minSdk = 24
    targetSdk = 34
    versionCode = 1
    versionName = "1.0"
    testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
  }

  buildTypes {
    release {
      isMinifyEnabled = false
      proguardFiles(
        getDefaultProguardFile("proguard-android-optimize.txt"),
        "proguard-rules.pro"
      )
    }
    debug {
      isMinifyEnabled = false
    }
  }

  compileOptions {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
  }
}

kotlin {
  compilerOptions {
    jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17)
  }
}

dependencies {
  implementation("org.jetbrains.kotlin:kotlin-stdlib:2.2.0")
  implementation("androidx.core:core-ktx:1.12.0")
  implementation("androidx.appcompat:appcompat:1.6.1")
  implementation("com.google.android.material:material:1.11.0")
  implementation("androidx.constraintlayout:constraintlayout:2.1.4")
  implementation("com.squareup.okhttp3:okhttp:4.12.0")
  testImplementation("junit:junit:4.13.2")
  androidTestImplementation("androidx.test.ext:junit:1.1.5")
  androidTestImplementation("androidx.test.espresso:espresso-core:3.7.0")
}


plugins {
<<<<<<< HEAD
  id("com.android.application") version "8.12.1" apply false
  kotlin("android") version "2.2.0" apply false
  kotlin("jvm") version "2.2.0" apply false
  kotlin("multiplatform") version "2.2.0" apply false
=======
    kotlin("jvm") version "1.8.22" apply false
    id("org.jlleitschuh.gradle.ktlint") version "11.6.1" apply false
    jacoco
}

val coverageMin: String = providers.environmentVariable("COVERAGE_MIN")
    .orElse(providers.gradleProperty("coverageMin"))
    .orElse("0.30")
    .get()
extensions.extraProperties["coverageMin"] = coverageMin

// Ensure a single aggregate check
val rootCheck = tasks.findByName("check") ?: tasks.register("check") {
    group = "verification"
    description = "Aggregate Salle verification (all subprojects + persona checks)."
}

// Apply verification to root project
apply(from = "verification.gradle.kts")

subprojects {
    plugins.withId("org.jetbrains.kotlin.jvm") {
        apply(plugin = "org.jlleitschuh.gradle.ktlint")
        apply(plugin = "jacoco")
        tasks.withType<Test>().configureEach { useJUnitPlatform() }
        if (tasks.findByName("jacocoTestReport") == null) {
            tasks.register<JacocoReport>("jacocoTestReport") {
                dependsOn(tasks.withType<Test>())
                reports { xml.required.set(true); html.required.set(true) }
                val classesDir = fileTree(layout.buildDirectory.dir("classes/kotlin/main"))
                classDirectories.setFrom(classesDir)
                sourceDirectories.setFrom(files("src/main/kotlin"))
                executionData.setFrom(fileTree(layout.buildDirectory.get().asFile) { include("**/jacoco/test*.exec", "**/jacoco/test/*.exec", "**/jacoco/*.exec") })
                onlyIf { executionData.files.any { it.exists() } }
            }
        }
        if (tasks.findByName("jacocoCoverageVerification") == null) {
            tasks.register<JacocoCoverageVerification>("jacocoCoverageVerification") {
                dependsOn(tasks.withType<Test>())
                val classesDir = fileTree(layout.buildDirectory.dir("classes/kotlin/main"))
                classDirectories.setFrom(classesDir)
                sourceDirectories.setFrom(files("src/main/kotlin"))
                executionData.setFrom(fileTree(layout.buildDirectory.get().asFile) { include("**/jacoco/test*.exec", "**/jacoco/test/*.exec", "**/jacoco/*.exec") })
                violationRules { rule { limit { minimum = coverageMin.toBigDecimal() } } }
                tasks.findByName("jacocoTestReport")?.let { mustRunAfter(it) }
                // Skip gracefully if no execution data (no tests)
                onlyIf { executionData.files.any { it.exists() } }
            }
        }
        tasks.matching { it.name == "check" }.configureEach {
            tasks.findByName("jacocoCoverageVerification")?.let { dependsOn(it) }
        }
    }
    plugins.withId("org.jetbrains.kotlin.android") {
        apply(plugin = "org.jlleitschuh.gradle.ktlint")
        apply(plugin = "jacoco")
        // Configure JUnit Platform for JVM unit tests inside Android modules
        tasks.withType<Test>().configureEach { useJUnitPlatform() }
        // Android unit test compiled class directories (debug variant typical)
        val kotlinClasses = layout.buildDirectory.dir("intermediates/javac/debug/classes")
        val altKotlinClasses = layout.buildDirectory.dir("tmp/kotlin-classes/debug")
        if (tasks.findByName("jacocoTestReport") == null) {
            tasks.register<JacocoReport>("jacocoTestReport") {
                dependsOn(tasks.withType<Test>())
                reports { xml.required.set(true); html.required.set(true) }
                classDirectories.setFrom(files(
                    fileTree(kotlinClasses) { include("**/*.class") },
                    fileTree(altKotlinClasses) { include("**/*.class") }
                ))
                sourceDirectories.setFrom(files("src/main/kotlin"))
            }
        }
    }
>>>>>>> Sallie
}
repositories {
  google()
  mavenCentral()
}







plugins {
  kotlin("jvm") version "2.2.0"
}

dependencies {
  implementation(kotlin("stdlib"))
  testImplementation("org.jetbrains.kotlin:kotlin-test")
  testImplementation("io.kotest:kotest-runner-junit5:5.8.0")
  testImplementation("io.kotest:kotest-assertions-core:5.8.0")
}

tasks.test {
  useJUnitPlatform()
  testLogging {
    events("passed", "skipped", "failed")
  }
}


plugins {
  kotlin("jvm") version "2.2.0"
}

val kotestVersion = "5.8.0"

dependencies {
  implementation(kotlin("stdlib"))
  testImplementation("org.jetbrains.kotlin:kotlin-test")
  testImplementation("io.kotest:kotest-runner-junit5:$kotestVersion")
tasks.test {
  // Kotest requires JUnit Platform for running tests; this is correct even if only Kotest is used.
  useJUnitPlatform()
  testLogging {
    events("passed", "skipped", "failed")
  }
}
  }
}


plugins {
  kotlin("jvm") version "2.2.0"
}

dependencies {
  implementation(kotlin("stdlib"))
  testImplementation("org.jetbrains.kotlin:kotlin-test")
  testImplementation("io.kotest:kotest-runner-junit5:5.8.0")
  testImplementation("io.kotest:kotest-assertions-core:5.8.0")
}

tasks.test {
  useJUnitPlatform()
  testLogging {
    events("passed", "skipped", "failed")
  }
}


plugins {
  kotlin("jvm") version "2.2.0"
}

dependencies {
  implementation(kotlin("stdlib"))
  testImplementation("org.jetbrains.kotlin:kotlin-test")
  testImplementation("io.kotest:kotest-runner-junit5:5.8.0")
  testImplementation("io.kotest:kotest-assertions-core:5.8.0")
}

tasks.test {
  useJUnitPlatform()
  testLogging {
    events("passed", "skipped", "failed")
  }
}


plugins {
  kotlin("jvm") version "2.2.0"
}

dependencies {
  implementation(kotlin("stdlib"))
  testImplementation("org.jetbrains.kotlin:kotlin-test")
  testImplementation("io.kotest:kotest-runner-junit5:5.8.0")
  testImplementation("io.kotest:kotest-assertions-core:5.8.0")
}

tasks.test {
  useJUnitPlatform()
  testLogging {
    events("passed", "skipped", "failed")
  }
}






/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: AI orchestration and intelligence routing.
 * Got it, love.
 */

plugins {
    kotlin("jvm")
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


/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Main Android launcher application.
 * Got it, love.
 */

plugins {
    id("com.android.application")
    id("kotlin-android")
}

android {
    namespace = "com.sallie.launcher"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.sallie.launcher"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
        debug { }
    }

    // Product flavors for local-only vs cloud functionality
    flavorDimensions += "connectivity"
    productFlavors {
        create("localOnly") {
            dimension = "connectivity"
            applicationIdSuffix = ".local"
            versionNameSuffix = "-local"
            resValue("string", "app_name", "Sallie Local")
        }
        create("cloud") {
            dimension = "connectivity"
            applicationIdSuffix = ".cloud"
            versionNameSuffix = "-cloud"
            resValue("string", "app_name", "Sallie Cloud")
        }
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }


    kotlinOptions {
        jvmTarget = "17"
    }

    packaging {
        resources { excludes += "/META-INF/{AL2.0,LGPL2.1}" }
    }
}

dependencies {
    // Project modules - core architecture
    implementation(project(":core"))
    implementation(project(":ai"))
    implementation(project(":feature"))
    implementation(project(":components"))
    implementation(project(":ui"))
    implementation(project(":identity"))
    implementation(project(":onboarding"))
    implementation(project(":personaCore"))
    implementation(project(":responseTemplates"))
    implementation(project(":tone"))
    implementation(project(":values"))

    // Compose BOM for version alignment
    implementation(platform("androidx.compose:compose-bom:2023.10.01"))
    androidTestImplementation(platform("androidx.compose:compose-bom:2023.10.01"))

    // Android core
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")
    implementation("androidx.activity:activity-compose:1.9.2")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.7")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.8.7")

    // Compose UI
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")

    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")

    // WorkManager
    implementation("androidx.work:work-runtime-ktx:2.9.1")

    // Cloud flavor specific dependencies
    "cloudImplementation"("com.google.firebase:firebase-firestore-ktx:24.10.0")
    "cloudImplementation"("com.google.firebase:firebase-auth-ktx:22.3.1")

    // Testing
    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlin:kotlin-test:1.6.10")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")

    // Debug tools
    debugImplementation("androidx.compose.ui:ui-tooling")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
}

tasks.withType<Test> { useJUnitPlatform() }

/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Root build configuration for modular Android launcher.
 * Got it, love.
 */

// Top-level build file for Sallie 1.0
// Root build: alignment, verification, coverage, formatting – privacy-first (no new network code)
plugins {
    kotlin("jvm") version "1.9.10" apply false
    id("org.jlleitschuh.gradle.ktlint") version "11.6.1" apply false
    jacoco
}

val coverageMin: String = providers.environmentVariable("COVERAGE_MIN")
    .orElse(providers.gradleProperty("coverageMin"))
    .orElse("0.30")
    .get()
extensions.extraProperties["coverageMin"] = coverageMin

// Ensure a single aggregate check
val rootCheck = tasks.findByName("check") ?: tasks.register("check") {
    group = "verification"
    description = "Aggregate Salle verification (all subprojects + persona checks)."
}

// Apply verification to root project
apply(from = "verification.gradle.kts")

subprojects {
    plugins.withId("org.jetbrains.kotlin.jvm") {
        apply(plugin = "org.jlleitschuh.gradle.ktlint")
        apply(plugin = "jacoco")
        tasks.withType<Test>().configureEach { useJUnitPlatform() }
        if (tasks.findByName("jacocoTestReport") == null) {
            tasks.register<JacocoReport>("jacocoTestReport") {
                dependsOn(tasks.withType<Test>())
                reports { xml.required.set(true); html.required.set(true) }
                val classesDir = fileTree(layout.buildDirectory.dir("classes/kotlin/main"))
                classDirectories.setFrom(classesDir)
                sourceDirectories.setFrom(files("src/main/kotlin"))
                executionData.setFrom(fileTree(layout.buildDirectory.get().asFile) { include("**/jacoco/test*.exec", "**/jacoco/test/*.exec", "**/jacoco/*.exec") })
                onlyIf { executionData.files.any { it.exists() } }
            }
        }
        if (tasks.findByName("jacocoCoverageVerification") == null) {
            tasks.register<JacocoCoverageVerification>("jacocoCoverageVerification") {
                dependsOn(tasks.withType<Test>())
                val classesDir = fileTree(layout.buildDirectory.dir("classes/kotlin/main"))
                classDirectories.setFrom(classesDir)
                sourceDirectories.setFrom(files("src/main/kotlin"))
                executionData.setFrom(fileTree(layout.buildDirectory.get().asFile) { include("**/jacoco/test*.exec", "**/jacoco/test/*.exec", "**/jacoco/*.exec") })
                violationRules { rule { limit { minimum = coverageMin.toBigDecimal() } } }
                tasks.findByName("jacocoTestReport")?.let { mustRunAfter(it) }
                // Skip gracefully if no execution data (no tests)
                onlyIf { executionData.files.any { it.exists() } }
            }
        }
        tasks.matching { it.name == "check" }.configureEach {
            tasks.findByName("jacocoCoverageVerification")?.let { dependsOn(it) }
        }
    }
    plugins.withId("org.jetbrains.kotlin.android") {
        apply(plugin = "org.jlleitschuh.gradle.ktlint")
        apply(plugin = "jacoco")
        // Configure JUnit Platform for JVM unit tests inside Android modules
        tasks.withType<Test>().configureEach { useJUnitPlatform() }
        // Android unit test compiled class directories (debug variant typical)
        val kotlinClasses = layout.buildDirectory.dir("intermediates/javac/debug/classes")
        val altKotlinClasses = layout.buildDirectory.dir("tmp/kotlin-classes/debug")
        if (tasks.findByName("jacocoTestReport") == null) {
            tasks.register<JacocoReport>("jacocoTestReport") {
                dependsOn(tasks.withType<Test>())
                reports { xml.required.set(true); html.required.set(true) }
                classDirectories.setFrom(files(
                    fileTree(kotlinClasses) { include("**/*.class") },
                    fileTree(altKotlinClasses) { include("**/*.class") }
                ))
                sourceDirectories.setFrom(files("src/main/kotlin"))
                executionData.setFrom(fileTree(layout.buildDirectory.get().asFile) {
                    include("**/jacoco/test*.exec", "**/jacoco/test/*.exec", "**/jacoco/*.exec")
                })
                onlyIf { executionData.files.any { it.exists() } }
            }
        }
        if (tasks.findByName("jacocoCoverageVerification") == null) {
            tasks.register<JacocoCoverageVerification>("jacocoCoverageVerification") {
                dependsOn(tasks.withType<Test>())
                classDirectories.setFrom(files(
                    fileTree(kotlinClasses) { include("**/*.class") },
                    fileTree(altKotlinClasses) { include("**/*.class") }
                ))
                sourceDirectories.setFrom(files("src/main/kotlin"))
                executionData.setFrom(fileTree(layout.buildDirectory.get().asFile) {
                    include("**/jacoco/test*.exec", "**/jacoco/test/*.exec", "**/jacoco/*.exec")
                })
                violationRules { rule { limit { minimum = coverageMin.toBigDecimal() } } }
                tasks.findByName("jacocoTestReport")?.let { mustRunAfter(it) }
                onlyIf { executionData.files.any { it.exists() } }
            }
        }
        tasks.matching { it.name == "check" }.configureEach {
            tasks.findByName("jacocoCoverageVerification")?.let { dependsOn(it) }
        }
    }
    afterEvaluate {
        if (tasks.findByName("check") != null) {
            rootProject.tasks.named("check") { dependsOn(this@afterEvaluate.project.path + ":check") }
        }
    }
}

// Icon generation (local script only) – only attaches where preBuild exists
val generateSalleIcons by tasks.registering(Exec::class) {
    group = "sallie tools"
    description = "Generate launcher icons via local pipeline."
    commandLine("python3", "app/icon_pipeline/icon_pipeline.py")
}
tasks.matching { it.name == "preBuild" }.configureEach { dependsOn(generateSalleIcons) }

gradle.projectsEvaluated {
    listOf("verifySalleFeatures", "verifySalleModules").forEach { tName ->
        tasks.findByName(tName)?.let { tasks.named("check") { dependsOn(tName) } }
    }
    tasks.findByName("verifySallePrivacy")?.let { tasks.named("check") { dependsOn("verifySallePrivacy") } }
    tasks.findByName("verifySalleLayering")?.let { tasks.named("check") { dependsOn("verifySalleLayering") } }
}

// Aggregate multi-module coverage (best-effort; does not fail if empty)
tasks.register<JacocoReport>("jacocoAggregateReport") {
    val testTasks = subprojects.flatMap { sp -> sp.tasks.matching { it.name.startsWith("test") } }
    dependsOn(testTasks)
    val execDataFiles = files(subprojects.map { sp ->
        sp.fileTree(sp.layout.buildDirectory.get().asFile) { include("**/jacoco/test.exec", "**/jacoco/test/*.exec") }
    })
    executionData.setFrom(execDataFiles)
    val classDirs = files(subprojects.map { sp -> sp.fileTree(sp.layout.buildDirectory.dir("classes/kotlin/main")) })
    val srcDirs = files(subprojects.map { sp -> sp.projectDir.resolve("src/main/kotlin") })
    classDirectories.setFrom(classDirs)
    sourceDirectories.setFrom(srcDirs)
    reports { xml.required.set(true); html.required.set(true); html.outputLocation.set(layout.buildDirectory.dir("reports/jacoco/aggregate")) }
    doFirst {
        if (execDataFiles.none { it.exists() }) {
            logger.lifecycle("No Jacoco exec data found; aggregate report will be empty but not failing.")
        }
    }
}


plugins {
    `kotlin-dsl`
}

repositories {
    google()
    mavenCentral()
    gradlePluginPortal()
}

/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: UI components and styling system.
 * Got it, love.
 */

plugins {
    kotlin("jvm")
}

dependencies {
    implementation(project(":core"))
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")

    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlin:kotlin-test")
}


/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Core data models, memory management, and system state.
 * Got it, love.
 */

plugins {
    kotlin("jvm")
    // Removed application plugin to avoid main class issues
}

dependencies {
    implementation(project(":personaCore"))
    implementation(project(":tone"))
    implementation(project(":values"))
    implementation(project(":responseTemplates"))
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")

    testImplementation("org.jetbrains.kotlin:kotlin-test")
    testImplementation("junit:junit:4.13.2")
}

kotlin {
    jvmToolchain(17)
}

sourceSets {
    main {
        java.srcDirs("src/main/kotlin")
    }
    test {
        java.srcDirs("src/test/kotlin")
    }
}


/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Feature implementations and system integrations.
 * Got it, love.
 */

plugins {
    kotlin("jvm")
}

dependencies {
    implementation(project(":core"))
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")

    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlin:kotlin-test")
}

kotlin {
    jvmToolchain(17)
}

sourceSets {
    main {
        java.srcDirs("src/main/kotlin")
    }
    test {
        java.srcDirs("src/test/kotlin")
    }
}


/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Identity management and persona core.
 * Got it, love.
 */

plugins {
    kotlin("jvm")
}

dependencies {
    implementation(project(":core"))
    implementation(project(":personaCore"))
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")

    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlin:kotlin-test")
}

kotlin {
    jvmToolchain(17)
}

sourceSets {
    main {
        java.srcDirs("src/main/kotlin")
    }
    test {
        java.srcDirs("src/test/kotlin")
    }
}


/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: User onboarding and initial setup.
 * Got it, love.
 */

plugins {
    kotlin("jvm")
}

dependencies {
    implementation(project(":core"))
    implementation(project(":identity"))
    implementation(project(":values"))
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")

    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlin:kotlin-test")
}

kotlin {
    jvmToolchain(17)
}

sourceSets {
    main {
        java.srcDirs("src/main/kotlin")
    }
    test {
        java.srcDirs("src/test/kotlin")
    }
}


/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Core persona engine and behavioral logic.
 * Got it, love.
 */

plugins {
    kotlin("jvm")
}

dependencies {
    implementation(project(":tone"))
    implementation(project(":values"))
    implementation(project(":responseTemplates"))
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")

    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlin:kotlin-test")
}

kotlin {
    jvmToolchain(17)
}

sourceSets {
    main {
        java.srcDirs("src/main/kotlin")
    }
    test {
        java.srcDirs("src/test/kotlin")
    }
}


/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Response templates and conversation patterns.
 * Got it, love.
 */

plugins {
    kotlin("jvm")
}

dependencies {
    implementation(project(":tone"))
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")

    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlin:kotlin-test")
}

kotlin {
    jvmToolchain(17)
}

sourceSets {
    main {
        java.srcDirs("src/main/kotlin")
    }
    test {
        java.srcDirs("src/test/kotlin")
    }
}


/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Tone and communication style management.
 * Got it, love.
 */

plugins {
    kotlin("jvm")
}

dependencies {
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")

    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlin:kotlin-test")
}

kotlin {
    jvmToolchain(17)
}

sourceSets {
    main {
        java.srcDirs("src/main/kotlin")
    }
    test {
        java.srcDirs("src/test/kotlin")
    }
}


/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: UI components and theming system.
 * Got it, love.
 */

plugins {
    kotlin("jvm")
}

dependencies {
    implementation(project(":core"))
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")

    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlin:kotlin-test")
}


/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Values alignment and ethical decision making.
 * Got it, love.
 */

plugins {
    kotlin("jvm")
}

dependencies {
    implementation(project(":tone"))
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")

    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlin:kotlin-test")
}

kotlin {
    jvmToolchain(17)
}

sourceSets {
    main {
        java.srcDirs("src/main/kotlin")
    }
    test {
        java.srcDirs("src/test/kotlin")
    }
}


/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: AI orchestration and intelligence routing.
 * Got it, love.
 */

plugins {
    kotlin("jvm")
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


/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Main Android launcher application.
 * Got it, love.
 */

plugins {
    id("com.android.application")
    id("kotlin-android")
}

android {
    namespace = "com.sallie.launcher"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.sallie.launcher"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
        debug { }
    }

    // Product flavors for local-only vs cloud functionality
    flavorDimensions += "connectivity"
    productFlavors {
        create("localOnly") {
            dimension = "connectivity"
            applicationIdSuffix = ".local"
            versionNameSuffix = "-local"
            resValue("string", "app_name", "Sallie Local")
        }
        create("cloud") {
            dimension = "connectivity"
            applicationIdSuffix = ".cloud"
            versionNameSuffix = "-cloud"
            resValue("string", "app_name", "Sallie Cloud")
        }
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }


    kotlinOptions {
        jvmTarget = "17"
    }

    packaging {
        resources { excludes += "/META-INF/{AL2.0,LGPL2.1}" }
    }
}

dependencies {
    // Project modules - core architecture
    implementation(project(":core"))
    implementation(project(":ai"))
    implementation(project(":feature"))
    implementation(project(":components"))
    implementation(project(":ui"))
    implementation(project(":identity"))
    implementation(project(":onboarding"))
    implementation(project(":personaCore"))
    implementation(project(":responseTemplates"))
    implementation(project(":tone"))
    implementation(project(":values"))

    // Compose BOM for version alignment
    implementation(platform("androidx.compose:compose-bom:2023.10.01"))
    androidTestImplementation(platform("androidx.compose:compose-bom:2023.10.01"))

    // Android core
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")
    implementation("androidx.activity:activity-compose:1.9.2")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.7")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.8.7")

    // Compose UI
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")

    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")

    // WorkManager
    implementation("androidx.work:work-runtime-ktx:2.9.1")

    // Cloud flavor specific dependencies
    "cloudImplementation"("com.google.firebase:firebase-firestore-ktx:24.10.0")
    "cloudImplementation"("com.google.firebase:firebase-auth-ktx:22.3.1")

    // Testing
    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlin:kotlin-test:1.6.10")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")

    // Debug tools
    debugImplementation("androidx.compose.ui:ui-tooling")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
}

tasks.withType<Test> { useJUnitPlatform() }

/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Root build configuration for modular Android launcher.
 * Got it, love.
 */

// Top-level build file for Sallie 1.0
// Root build: alignment, verification, coverage, formatting – privacy-first (no new network code)
plugins {
    kotlin("jvm") version "1.9.10" apply false
    id("org.jlleitschuh.gradle.ktlint") version "11.6.1" apply false
    jacoco
}

val coverageMin: String = providers.environmentVariable("COVERAGE_MIN")
    .orElse(providers.gradleProperty("coverageMin"))
    .orElse("0.30")
    .get()
extensions.extraProperties["coverageMin"] = coverageMin

// Ensure a single aggregate check
val rootCheck = tasks.findByName("check") ?: tasks.register("check") {
    group = "verification"
    description = "Aggregate Salle verification (all subprojects + persona checks)."
}

// Apply verification to root project
apply(from = "verification.gradle.kts")

subprojects {
    plugins.withId("org.jetbrains.kotlin.jvm") {
        apply(plugin = "org.jlleitschuh.gradle.ktlint")
        apply(plugin = "jacoco")
        tasks.withType<Test>().configureEach { useJUnitPlatform() }
        if (tasks.findByName("jacocoTestReport") == null) {
            tasks.register<JacocoReport>("jacocoTestReport") {
                dependsOn(tasks.withType<Test>())
                reports { xml.required.set(true); html.required.set(true) }
                val classesDir = fileTree(layout.buildDirectory.dir("classes/kotlin/main"))
                classDirectories.setFrom(classesDir)
                sourceDirectories.setFrom(files("src/main/kotlin"))
                executionData.setFrom(fileTree(layout.buildDirectory.get().asFile) { include("**/jacoco/test*.exec", "**/jacoco/test/*.exec", "**/jacoco/*.exec") })
                onlyIf { executionData.files.any { it.exists() } }
            }
        }
        if (tasks.findByName("jacocoCoverageVerification") == null) {
            tasks.register<JacocoCoverageVerification>("jacocoCoverageVerification") {
                dependsOn(tasks.withType<Test>())
                val classesDir = fileTree(layout.buildDirectory.dir("classes/kotlin/main"))
                classDirectories.setFrom(classesDir)
                sourceDirectories.setFrom(files("src/main/kotlin"))
                executionData.setFrom(fileTree(layout.buildDirectory.get().asFile) { include("**/jacoco/test*.exec", "**/jacoco/test/*.exec", "**/jacoco/*.exec") })
                violationRules { rule { limit { minimum = coverageMin.toBigDecimal() } } }
                tasks.findByName("jacocoTestReport")?.let { mustRunAfter(it) }
                // Skip gracefully if no execution data (no tests)
                onlyIf { executionData.files.any { it.exists() } }
            }
        }
        tasks.matching { it.name == "check" }.configureEach {
            tasks.findByName("jacocoCoverageVerification")?.let { dependsOn(it) }
        }
    }
    plugins.withId("org.jetbrains.kotlin.android") {
        apply(plugin = "org.jlleitschuh.gradle.ktlint")
        apply(plugin = "jacoco")
        // Configure JUnit Platform for JVM unit tests inside Android modules
        tasks.withType<Test>().configureEach { useJUnitPlatform() }
        // Android unit test compiled class directories (debug variant typical)
        val kotlinClasses = layout.buildDirectory.dir("intermediates/javac/debug/classes")
        val altKotlinClasses = layout.buildDirectory.dir("tmp/kotlin-classes/debug")
        if (tasks.findByName("jacocoTestReport") == null) {
            tasks.register<JacocoReport>("jacocoTestReport") {
                dependsOn(tasks.withType<Test>())
                reports { xml.required.set(true); html.required.set(true) }
                classDirectories.setFrom(files(
                    fileTree(kotlinClasses) { include("**/*.class") },
                    fileTree(altKotlinClasses) { include("**/*.class") }
                ))
                sourceDirectories.setFrom(files("src/main/kotlin"))
                executionData.setFrom(fileTree(layout.buildDirectory.get().asFile) {
                    include("**/jacoco/test*.exec", "**/jacoco/test/*.exec", "**/jacoco/*.exec")
                })
                onlyIf { executionData.files.any { it.exists() } }
            }
        }
        if (tasks.findByName("jacocoCoverageVerification") == null) {
            tasks.register<JacocoCoverageVerification>("jacocoCoverageVerification") {
                dependsOn(tasks.withType<Test>())
                classDirectories.setFrom(files(
                    fileTree(kotlinClasses) { include("**/*.class") },
                    fileTree(altKotlinClasses) { include("**/*.class") }
                ))
                sourceDirectories.setFrom(files("src/main/kotlin"))
                executionData.setFrom(fileTree(layout.buildDirectory.get().asFile) {
                    include("**/jacoco/test*.exec", "**/jacoco/test/*.exec", "**/jacoco/*.exec")
                })
                violationRules { rule { limit { minimum = coverageMin.toBigDecimal() } } }
                tasks.findByName("jacocoTestReport")?.let { mustRunAfter(it) }
                onlyIf { executionData.files.any { it.exists() } }
            }
        }
        tasks.matching { it.name == "check" }.configureEach {
            tasks.findByName("jacocoCoverageVerification")?.let { dependsOn(it) }
        }
    }
    afterEvaluate {
        if (tasks.findByName("check") != null) {
            rootProject.tasks.named("check") { dependsOn(this@afterEvaluate.project.path + ":check") }
        }
    }
}

// Icon generation (local script only) – only attaches where preBuild exists
val generateSalleIcons by tasks.registering(Exec::class) {
    group = "sallie tools"
    description = "Generate launcher icons via local pipeline."
    commandLine("python3", "app/icon_pipeline/icon_pipeline.py")
}
tasks.matching { it.name == "preBuild" }.configureEach { dependsOn(generateSalleIcons) }

gradle.projectsEvaluated {
    listOf("verifySalleFeatures", "verifySalleModules").forEach { tName ->
        tasks.findByName(tName)?.let { tasks.named("check") { dependsOn(tName) } }
    }
    tasks.findByName("verifySallePrivacy")?.let { tasks.named("check") { dependsOn("verifySallePrivacy") } }
    tasks.findByName("verifySalleLayering")?.let { tasks.named("check") { dependsOn("verifySalleLayering") } }
}

// Aggregate multi-module coverage (best-effort; does not fail if empty)
tasks.register<JacocoReport>("jacocoAggregateReport") {
    val testTasks = subprojects.flatMap { sp -> sp.tasks.matching { it.name.startsWith("test") } }
    dependsOn(testTasks)
    val execDataFiles = files(subprojects.map { sp ->
        sp.fileTree(sp.layout.buildDirectory.get().asFile) { include("**/jacoco/test.exec", "**/jacoco/test/*.exec") }
    })
    executionData.setFrom(execDataFiles)
    val classDirs = files(subprojects.map { sp -> sp.fileTree(sp.layout.buildDirectory.dir("classes/kotlin/main")) })
    val srcDirs = files(subprojects.map { sp -> sp.projectDir.resolve("src/main/kotlin") })
    classDirectories.setFrom(classDirs)
    sourceDirectories.setFrom(srcDirs)
    reports { xml.required.set(true); html.required.set(true); html.outputLocation.set(layout.buildDirectory.dir("reports/jacoco/aggregate")) }
    doFirst {
        if (execDataFiles.none { it.exists() }) {
            logger.lifecycle("No Jacoco exec data found; aggregate report will be empty but not failing.")
        }
    }
}


plugins {
    `kotlin-dsl`
}

repositories {
    google()
    mavenCentral()
    gradlePluginPortal()
}

/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: UI components and styling system.
 * Got it, love.
 */

plugins {
    kotlin("jvm")
}

dependencies {
    implementation(project(":core"))
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")

    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlin:kotlin-test")
}


/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Core data models, memory management, and system state.
 * Got it, love.
 */

plugins {
    kotlin("jvm")
    // Removed application plugin to avoid main class issues
}

dependencies {
    implementation(project(":personaCore"))
    implementation(project(":tone"))
    implementation(project(":values"))
    implementation(project(":responseTemplates"))
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")

    testImplementation("org.jetbrains.kotlin:kotlin-test")
    testImplementation("junit:junit:4.13.2")
}

kotlin {
    jvmToolchain(17)
}

sourceSets {
    main {
        java.srcDirs("src/main/kotlin")
    }
    test {
        java.srcDirs("src/test/kotlin")
    }
}


/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Feature implementations and system integrations.
 * Got it, love.
 */

plugins {
    kotlin("jvm")
}

dependencies {
    implementation(project(":core"))
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")

    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlin:kotlin-test")
}

kotlin {
    jvmToolchain(17)
}

sourceSets {
    main {
        java.srcDirs("src/main/kotlin")
    }
    test {
        java.srcDirs("src/test/kotlin")
    }
}


/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Identity management and persona core.
 * Got it, love.
 */

plugins {
    kotlin("jvm")
}

dependencies {
    implementation(project(":core"))
    implementation(project(":personaCore"))
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")

    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlin:kotlin-test")
}

kotlin {
    jvmToolchain(17)
}

sourceSets {
    main {
        java.srcDirs("src/main/kotlin")
    }
    test {
        java.srcDirs("src/test/kotlin")
    }
}


/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: User onboarding and initial setup.
 * Got it, love.
 */

plugins {
    kotlin("jvm")
}

dependencies {
    implementation(project(":core"))
    implementation(project(":identity"))
    implementation(project(":values"))
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")

    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlin:kotlin-test")
}

kotlin {
    jvmToolchain(17)
}

sourceSets {
    main {
        java.srcDirs("src/main/kotlin")
    }
    test {
        java.srcDirs("src/test/kotlin")
    }
}


/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Core persona engine and behavioral logic.
 * Got it, love.
 */

plugins {
    kotlin("jvm")
}

dependencies {
    implementation(project(":tone"))
    implementation(project(":values"))
    implementation(project(":responseTemplates"))
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")

    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlin:kotlin-test")
}

kotlin {
    jvmToolchain(17)
}

sourceSets {
    main {
        java.srcDirs("src/main/kotlin")
    }
    test {
        java.srcDirs("src/test/kotlin")
    }
}


/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Response templates and conversation patterns.
 * Got it, love.
 */

plugins {
    kotlin("jvm")
}

dependencies {
    implementation(project(":tone"))
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")

    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlin:kotlin-test")
}

kotlin {
    jvmToolchain(17)
}

sourceSets {
    main {
        java.srcDirs("src/main/kotlin")
    }
    test {
        java.srcDirs("src/test/kotlin")
    }
}


/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Tone and communication style management.
 * Got it, love.
 */

plugins {
    kotlin("jvm")
}

dependencies {
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")

    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlin:kotlin-test")
}

kotlin {
    jvmToolchain(17)
}

sourceSets {
    main {
        java.srcDirs("src/main/kotlin")
    }
    test {
        java.srcDirs("src/test/kotlin")
    }
}


/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: UI components and theming system.
 * Got it, love.
 */

plugins {
    kotlin("jvm")
}

dependencies {
    implementation(project(":core"))
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")

    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlin:kotlin-test")
}


/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Values alignment and ethical decision making.
 * Got it, love.
 */

plugins {
    kotlin("jvm")
}

dependencies {
    implementation(project(":tone"))
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")

    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlin:kotlin-test")
}

kotlin {
    jvmToolchain(17)
}

sourceSets {
    main {
        java.srcDirs("src/main/kotlin")
    }
    test {
        java.srcDirs("src/test/kotlin")
    }
}


plugins {
  id("com.android.application")
  kotlin("android")
  id("org.jetbrains.kotlin.plugin.compose") version "2.0.21"
}

android {
  namespace = "com.sallie.app"
  compileSdk = 36

  defaultConfig {
    applicationId = "com.sallie.app"
    minSdk = 24
    targetSdk = 36
    versionCode = 1
    versionName = "1.0"
    testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
  }

  buildTypes {
    release {
      isMinifyEnabled = true
      isShrinkResources = true
      proguardFiles(
        getDefaultProguardFile("proguard-android-optimize.txt"),
        "proguard-rules.pro"
      )
    }
    debug {
      isMinifyEnabled = false
      isShrinkResources = false
    }
  }

  compileOptions {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
  }

  buildFeatures {
    compose = true
  }

  composeOptions {
    kotlinCompilerExtensionVersion = "2.0.21"
  }
}

kotlin {
  compilerOptions {
    jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17)
  }
}

dependencies {
  implementation("org.jetbrains.kotlin:kotlin-stdlib:2.0.21")
  implementation("androidx.core:core-ktx:1.15.0")
  implementation("androidx.appcompat:appcompat:1.7.0")
  implementation("com.google.android.material:material:1.12.0")
  implementation("androidx.constraintlayout:constraintlayout:2.2.0")
  implementation("com.squareup.okhttp3:okhttp:4.12.0")

  // Compose dependencies
  implementation("androidx.compose.ui:ui:1.7.5")
  implementation("androidx.compose.ui:ui-graphics:1.7.5")
  implementation("androidx.compose.ui:ui-tooling-preview:1.7.5")
  implementation("androidx.compose.material3:material3:1.3.1")
  implementation("androidx.activity:activity-compose:1.9.3")
  implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.7")
  implementation("androidx.compose.runtime:runtime-livedata:1.7.5")

  // Coroutines dependencies
  implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.8.1")
  implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")

  testImplementation("junit:junit:4.13.2")
  androidTestImplementation("androidx.test.ext:junit:1.2.1")
  androidTestImplementation("androidx.test.espresso:espresso-core:3.6.1")
  androidTestImplementation("androidx.compose.ui:ui-test-junit4:1.7.5")
  debugImplementation("androidx.compose.ui:ui-tooling:1.7.5")
}


/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Root build configuration for modular Android launcher.
 * Got it, love.
 */

// Top-level build file for Sallie 1.0
// Root build: alignment, verification, coverage, formatting – privacy-first (no new network code)
plugins {
    kotlin("jvm") version "1.9.10" apply false
    id("org.jlleitschuh.gradle.ktlint") version "11.6.1" apply false
    jacoco
}

val coverageMin: String = providers.environmentVariable("COVERAGE_MIN")
    .orElse(providers.gradleProperty("coverageMin"))
    .orElse("0.30")
    .get()
extensions.extraProperties["coverageMin"] = coverageMin

// Ensure a single aggregate check
val rootCheck = tasks.findByName("check") ?: tasks.register("check") {
    group = "verification"
    description = "Aggregate Salle verification (all subprojects + persona checks)."
}

// Apply verification to root project
apply(from = "verification.gradle.kts")

subprojects {
    plugins.withId("org.jetbrains.kotlin.jvm") {
        apply(plugin = "org.jlleitschuh.gradle.ktlint")
        apply(plugin = "jacoco")
        tasks.withType<Test>().configureEach { useJUnitPlatform() }
        if (tasks.findByName("jacocoTestReport") == null) {
            tasks.register<JacocoReport>("jacocoTestReport") {
                dependsOn(tasks.withType<Test>())
                reports { xml.required.set(true); html.required.set(true) }
                val classesDir = fileTree(layout.buildDirectory.dir("classes/kotlin/main"))
                classDirectories.setFrom(classesDir)
                sourceDirectories.setFrom(files("src/main/kotlin"))
                executionData.setFrom(fileTree(layout.buildDirectory.get().asFile) { include("**/jacoco/test*.exec", "**/jacoco/test/*.exec", "**/jacoco/*.exec") })
                onlyIf { executionData.files.any { it.exists() } }
            }
        }
        if (tasks.findByName("jacocoCoverageVerification") == null) {
            tasks.register<JacocoCoverageVerification>("jacocoCoverageVerification") {
                dependsOn(tasks.withType<Test>())
                val classesDir = fileTree(layout.buildDirectory.dir("classes/kotlin/main"))
                classDirectories.setFrom(classesDir)
                sourceDirectories.setFrom(files("src/main/kotlin"))
                executionData.setFrom(fileTree(layout.buildDirectory.get().asFile) { include("**/jacoco/test*.exec", "**/jacoco/test/*.exec", "**/jacoco/*.exec") })
                violationRules { rule { limit { minimum = coverageMin.toBigDecimal() } } }
                tasks.findByName("jacocoTestReport")?.let { mustRunAfter(it) }
                // Skip gracefully if no execution data (no tests)
                onlyIf { executionData.files.any { it.exists() } }
            }
        }
        tasks.matching { it.name == "check" }.configureEach {
            tasks.findByName("jacocoCoverageVerification")?.let { dependsOn(it) }
        }
    }
    plugins.withId("org.jetbrains.kotlin.android") {
        apply(plugin = "org.jlleitschuh.gradle.ktlint")
        apply(plugin = "jacoco")
        // Configure JUnit Platform for JVM unit tests inside Android modules
        tasks.withType<Test>().configureEach { useJUnitPlatform() }
        // Android unit test compiled class directories (debug variant typical)
        val kotlinClasses = layout.buildDirectory.dir("intermediates/javac/debug/classes")
        val altKotlinClasses = layout.buildDirectory.dir("tmp/kotlin-classes/debug")
        if (tasks.findByName("jacocoTestReport") == null) {
            tasks.register<JacocoReport>("jacocoTestReport") {
                dependsOn(tasks.withType<Test>())
                reports { xml.required.set(true); html.required.set(true) }
                classDirectories.setFrom(files(
                    fileTree(kotlinClasses) { include("**/*.class") },
                    fileTree(altKotlinClasses) { include("**/*.class") }
                ))
                sourceDirectories.setFrom(files("src/main/kotlin"))
            }
        }
    }
}


/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Root build configuration for modular Android launcher.
 * Got it, love.
 */

// Top-level build file for Sallie 1.0
// Root build: alignment, verification, coverage, formatting – privacy-first (no new network code)
plugins {
    kotlin("jvm") version "1.9.10" apply false
    id("org.jlleitschuh.gradle.ktlint") version "11.6.1" apply false
    jacoco
}

val coverageMin: String = providers.environmentVariable("COVERAGE_MIN")
    .orElse(providers.gradleProperty("coverageMin"))
    .orElse("0.30")
    .get()
extensions.extraProperties["coverageMin"] = coverageMin

// Ensure a single aggregate check
val rootCheck = tasks.findByName("check") ?: tasks.register("check") {
    group = "verification"
    description = "Aggregate Salle verification (all subprojects + persona checks)."
}

// Apply verification to root project
apply(from = "verification.gradle.kts")

subprojects {
    plugins.withId("org.jetbrains.kotlin.jvm") {
        apply(plugin = "org.jlleitschuh.gradle.ktlint")
        apply(plugin = "jacoco")
        tasks.withType<Test>().configureEach { useJUnitPlatform() }
        if (tasks.findByName("jacocoTestReport") == null) {
            tasks.register<JacocoReport>("jacocoTestReport") {
                dependsOn(tasks.withType<Test>())
                reports { xml.required.set(true); html.required.set(true) }
                val classesDir = fileTree(layout.buildDirectory.dir("classes/kotlin/main"))
                classDirectories.setFrom(classesDir)
                sourceDirectories.setFrom(files("src/main/kotlin"))
                executionData.setFrom(fileTree(layout.buildDirectory.get().asFile) { include("**/jacoco/test*.exec", "**/jacoco/test/*.exec", "**/jacoco/*.exec") })
                onlyIf { executionData.files.any { it.exists() } }
            }
        }
        if (tasks.findByName("jacocoCoverageVerification") == null) {
            tasks.register<JacocoCoverageVerification>("jacocoCoverageVerification") {
                dependsOn(tasks.withType<Test>())
                val classesDir = fileTree(layout.buildDirectory.dir("classes/kotlin/main"))
                classDirectories.setFrom(classesDir)
                sourceDirectories.setFrom(files("src/main/kotlin"))
                executionData.setFrom(fileTree(layout.buildDirectory.get().asFile) { include("**/jacoco/test*.exec", "**/jacoco/test/*.exec", "**/jacoco/*.exec") })
                violationRules { rule { limit { minimum = coverageMin.toBigDecimal() } } }
                tasks.findByName("jacocoTestReport")?.let { mustRunAfter(it) }
                // Skip gracefully if no execution data (no tests)
                onlyIf { executionData.files.any { it.exists() } }
            }
        }
        tasks.matching { it.name == "check" }.configureEach {
            tasks.findByName("jacocoCoverageVerification")?.let { dependsOn(it) }
        }
    }
    plugins.withId("org.jetbrains.kotlin.android") {
        apply(plugin = "org.jlleitschuh.gradle.ktlint")
        apply(plugin = "jacoco")
        // Configure JUnit Platform for JVM unit tests inside Android modules
        tasks.withType<Test>().configureEach { useJUnitPlatform() }
        // Android unit test compiled class directories (debug variant typical)
        val kotlinClasses = layout.buildDirectory.dir("intermediates/javac/debug/classes")
        val altKotlinClasses = layout.buildDirectory.dir("tmp/kotlin-classes/debug")
        if (tasks.findByName("jacocoTestReport") == null) {
            tasks.register<JacocoReport>("jacocoTestReport") {
                dependsOn(tasks.withType<Test>())
                reports { xml.required.set(true); html.required.set(true) }
                classDirectories.setFrom(files(
                    fileTree(kotlinClasses) { include("**/*.class") },
                    fileTree(altKotlinClasses) { include("**/*.class") }
                ))
                sourceDirectories.setFrom(files("src/main/kotlin"))
            }
        }
    }
}


plugins {
  kotlin("jvm") version "2.0.21"
}

val kotestVersion = "5.8.0"

dependencies {
  implementation(kotlin("stdlib"))
  testImplementation("org.jetbrains.kotlin:kotlin-test")
  testImplementation("io.kotest:kotest-runner-junit5:$kotestVersion")
}

tasks.test {
  // Kotest requires JUnit Platform for running tests; this is correct even if only Kotest is used.
  useJUnitPlatform()
  testLogging {
    events("passed", "skipped", "failed")
  }
}


plugins {
  kotlin("jvm") version "2.0.21"
}

val kotestVersion = "5.8.0"

dependencies {
  implementation(kotlin("stdlib"))
  testImplementation("org.jetbrains.kotlin:kotlin-test")
  testImplementation("io.kotest:kotest-runner-junit5:$kotestVersion")
}

tasks.test {
  // Kotest requires JUnit Platform for running tests; this is correct even if only Kotest is used.
  useJUnitPlatform()
  testLogging {
    events("passed", "skipped", "failed")
  }
}


plugins {
  kotlin("jvm") version "2.0.21"
}

val kotestVersion = "5.8.0"

dependencies {
  implementation(kotlin("stdlib"))
  testImplementation("org.jetbrains.kotlin:kotlin-test")
  testImplementation("io.kotest:kotest-runner-junit5:$kotestVersion")
}

tasks.test {
  // Kotest requires JUnit Platform for running tests; this is correct even if only Kotest is used.
  useJUnitPlatform()
  testLogging {
    events("passed", "skipped", "failed")
  }
}

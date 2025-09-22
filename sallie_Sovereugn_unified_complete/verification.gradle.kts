/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Verification tasks to enforce Sallie's architecture and persona.
 * Got it, love.
 */

...existing content migrated and adapted for Sallie app structure...




// Sallie 1.0 Module - Universal Verification Task

tasks.register("verifyAllModules") {
	group = "verification"
	description = "Builds and tests all Sallie modules."
	dependsOn(gradle.includedBuilds.map { it.task("build") })
	doLast {
		println("All modules built and tested successfully.")
	}
}


/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Verification tasks to enforce Sallie's architecture and persona.
 * Got it, love.
 */

tasks.register("verifySalleFeatures") {
    description = "Verifies that Sallie's core features and persona are properly maintained"
    group = "verification"

    doLast {
        println("🎯 Verifying Sallie's core features and persona...")

        // Check that all Kotlin files have proper persona headers
        val kotlinFiles = fileTree(".") {
            include("**/*.kt")
            exclude("**/build/**")
            exclude("**/generated/**")
        }

        val missingHeaders = mutableListOf<String>()
        kotlinFiles.forEach { file ->
            val content = file.readText()
            if (!content.contains("Sallie 1.0 Module") && !content.contains("Salle 1.0 Module")) {
                missingHeaders.add(file.relativeTo(project.rootDir).path)
            }
        }

        if (missingHeaders.isNotEmpty()) {
            throw GradleException(
                "Missing Sallie persona headers in files: ${missingHeaders.joinToString(", ")}\n" +
                "All Kotlin files must start with Sallie's persona header block."
            )
        }

        // Check for forbidden network imports in localOnly flavor
        val localOnlyViolations = mutableListOf<String>()
        kotlinFiles.forEach { file ->
            val content = file.readText()
            if (content.contains("import okhttp3.") || 
                content.contains("import retrofit2.")) {
                localOnlyViolations.add(file.relativeTo(project.rootDir).path)
            }
        }

        if (localOnlyViolations.isNotEmpty()) {
            throw GradleException(
                "Network imports found in files: ${localOnlyViolations.joinToString(", ")}\n" +
                "The localOnly flavor cannot have network dependencies."
            )
        }

        // Verify required modules exist
        val requiredModules = listOf("ai", "core", "feature", "components", "personaCore")
        val missingModules = mutableListOf<String>()

        requiredModules.forEach { module ->
            val moduleDir = file(module)
            val buildFile = file("$module/build.gradle.kts").let { 
                if (it.exists()) it else file("$module/build.gradle") 
            }
            
            if (!moduleDir.exists() || !buildFile.exists()) {
                missingModules.add(module)
            }
        }

        if (missingModules.isNotEmpty()) {
            throw GradleException("Missing required modules: ${missingModules.joinToString(", ")}")
        }

        println("✅ Sallie's core features verified!")
    }
}

tasks.register("verifySalleModules") {
    description = "Verifies modular architecture compliance"
    group = "verification"

    doLast {
        println("🔍 Verifying modular architecture...")

        // Check for circular dependencies and proper layering
        val modules = listOf("ai", "core", "feature", "components")
        
        modules.forEach { module ->
            val buildFile = file("$module/build.gradle.kts")
            if (buildFile.exists()) {
                val content = buildFile.readText()
                
                // Core cannot depend on feature
                if (module == "core" && content.contains("implementation(project(\":feature\"))")) {
                    throw GradleException("Core module cannot depend on feature module! That breaks modularity.")
                }
                // AI shouldn't depend on components directly
                if (module == "ai" && content.contains("implementation(project(\":components\"))")) {
                    throw GradleException("AI module cannot depend on components directly!")
                }
            }
        }

        println("✅ Modular architecture verified!")
    }
}

// Make check depend on our verification tasks if it exists
afterEvaluate {
    tasks.findByName("check")?.let { checkTask ->
        checkTask.dependsOn("verifySalleFeatures", "verifySalleModules")
    }
}

/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Verification tasks to enforce Sallie's architecture and persona.
 * Got it, love.
 */

tasks.register("verifySalleFeatures") {
    description = "Verifies that Sallie's core features and persona are properly maintained"
    group = "verification"

    doLast {
        println("🎯 Verifying Sallie's core features and persona...")

        // Check that all Kotlin files have proper persona headers
        val kotlinFiles = fileTree(".") {
            include("**/*.kt")
            exclude("**/build/**")
            exclude("**/generated/**")
        }

        val missingHeaders = mutableListOf<String>()
        kotlinFiles.forEach { file ->
            val content = file.readText()
            if (!content.contains("Sallie 1.0 Module") && !content.contains("Salle 1.0 Module")) {
                missingHeaders.add(file.relativeTo(project.rootDir).path)
            }
        }

        if (missingHeaders.isNotEmpty()) {
            throw GradleException(
                "Missing Sallie persona headers in files: ${missingHeaders.joinToString(", ")}\n" +
                "All Kotlin files must start with Sallie's persona header block."
            )
        }

        // Check for forbidden network imports in localOnly flavor
        val localOnlyViolations = mutableListOf<String>()
        kotlinFiles.forEach { file ->
            val content = file.readText()
            if (content.contains("import okhttp3.") || 
                content.contains("import retrofit2.")) {
                localOnlyViolations.add(file.relativeTo(project.rootDir).path)
            }
        }

        if (localOnlyViolations.isNotEmpty()) {
            throw GradleException(
                "Network imports found in files: ${localOnlyViolations.joinToString(", ")}\n" +
                "The localOnly flavor cannot have network dependencies."
            )
        }

        // Verify required modules exist
        val requiredModules = listOf("ai", "core", "feature", "components", "personaCore")
        val missingModules = mutableListOf<String>()

        requiredModules.forEach { module ->
            val moduleDir = file(module)
            val buildFile = file("$module/build.gradle.kts").let { 
                if (it.exists()) it else file("$module/build.gradle") 
            }
            
            if (!moduleDir.exists() || !buildFile.exists()) {
                missingModules.add(module)
            }
        }

        if (missingModules.isNotEmpty()) {
            throw GradleException("Missing required modules: ${missingModules.joinToString(", ")}")
        }

        println("✅ Sallie's core features verified!")
    }
}

tasks.register("verifySalleModules") {
    description = "Verifies modular architecture compliance"
    group = "verification"

    doLast {
        println("🔍 Verifying modular architecture...")

        // Check for circular dependencies and proper layering
        val modules = listOf("ai", "core", "feature", "components")
        
        modules.forEach { module ->
            val buildFile = file("$module/build.gradle.kts")
            if (buildFile.exists()) {
                val content = buildFile.readText()
                
                // Core cannot depend on feature
                if (module == "core" && content.contains("implementation(project(\":feature\"))")) {
                    throw GradleException("Core module cannot depend on feature module! That breaks modularity.")
                }
                // AI shouldn't depend on components directly
                if (module == "ai" && content.contains("implementation(project(\":components\"))")) {
                    throw GradleException("AI module cannot depend on components directly!")
                }
            }
        }

        println("✅ Modular architecture verified!")
    }
}

// Make check depend on our verification tasks if it exists
afterEvaluate {
    tasks.findByName("check")?.let { checkTask ->
        checkTask.dependsOn("verifySalleFeatures", "verifySalleModules")
    }
}

/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Verification tasks to enforce Sallie's architecture and persona.
 * Got it, love.
 */



/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Verification tasks to enforce Sallie's architecture and persona.
 * Got it, love.
 */


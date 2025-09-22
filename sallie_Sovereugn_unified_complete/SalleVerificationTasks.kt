import org.gradle.api.DefaultTask
import org.gradle.api.file.FileTree
import org.gradle.api.provider.ListProperty
import org.gradle.api.provider.Property
import org.gradle.api.tasks.Input
import org.gradle.api.tasks.InputFiles
import org.gradle.api.tasks.TaskAction
import java.io.File

abstract class VerifySalleFeatures : DefaultTask() {
    
    @get:Input
    abstract val requiredModules: ListProperty<String>
    
    @get:Input
    abstract val forbiddenImports: ListProperty<String>
    
    @get:Input
    abstract val personaHeaderMarker: Property<String>
    
    @get:Input
    abstract val personaSlogan: Property<String>
    
    @get:Input
    abstract val maxMainActivityLines: Property<Int>
    
    @get:Input
    abstract val enforcePersonaHeaders: Property<Boolean>
    
    @get:Input
    abstract val baseDirPath: Property<String>
    
    @get:InputFiles
    abstract val kotlinSources: Property<FileTree>
    
    @TaskAction
    fun verifyFeatures() {
        // Check required modules exist
        val missingModules = mutableListOf<String>()
        requiredModules.get().forEach { module ->
            val moduleDir = File(baseDirPath.get() + module.replace(":", "/"))
            if (!moduleDir.exists()) {
                missingModules.add(module)
            }
        }
        
        if (missingModules.isNotEmpty()) {
            throw RuntimeException("Missing required Salle modules: $missingModules")
        }
        
        // Check forbidden imports
        val violations = mutableListOf<String>()
        kotlinSources.get().forEach { file ->
            if (file.name.endsWith(".kt")) {
                val content = file.readText()
                forbiddenImports.get().forEach { forbidden ->
                    if (content.contains(forbidden)) {
                        violations.add("${file.name}: forbidden import '$forbidden'")
                    }
                }
                
                // Check persona headers if enforced
                if (enforcePersonaHeaders.get() && !content.contains(personaHeaderMarker.get())) {
                    violations.add("${file.name}: missing persona header")
                }
            }
        }
        
        if (violations.isNotEmpty()) {
            throw RuntimeException("Salle feature violations found:\n${violations.joinToString("\n")}")
        }
        
        println("✅ Salle feature verification passed - Got it, love.")
    }
}

abstract class VerifySallePrivacy : DefaultTask() {
    
    @get:Input
    abstract val baseDirPath: Property<String>
    
    @get:Input
    abstract val bannedTokens: ListProperty<String>
    
    @get:InputFiles
    abstract val kotlinSources: Property<FileTree>
    
    @TaskAction
    fun verifyPrivacy() {
        val violations = mutableListOf<String>()
        
        kotlinSources.get().forEach { file ->
            if (file.name.endsWith(".kt")) {
                val content = file.readText()
                bannedTokens.get().forEach { banned ->
                    if (content.contains(banned)) {
                        violations.add("${file.name}: privacy violation '$banned'")
                    }
                }
            }
        }
        
        if (violations.isNotEmpty()) {
            throw RuntimeException("Salle privacy violations found:\n${violations.joinToString("\n")}")
        }
        
        println("🛡️ Salle privacy verification passed - Local-only integrity maintained.")
    }
}

abstract class VerifySalleLayering : DefaultTask() {
    
    @get:Input
    abstract val baseDirPath: Property<String>
    
    @get:Input
    abstract val layerOrder: ListProperty<String>
    
    @get:InputFiles
    abstract val buildFiles: Property<FileTree>
    
    @TaskAction
    fun verifyLayering() {
        val violations = mutableListOf<String>()
        
        // Simple layering check - ensures no upward dependencies
        buildFiles.get().forEach { file ->
            if (file.name.contains("build.gradle")) {
                val content = file.readText()
                val modulePath = file.parentFile.absolutePath.replace(baseDirPath.get(), "").replace("/", ":")
                
                // Check if this module imports from modules that should be below it
                layerOrder.get().forEachIndexed { index, layer ->
                    if (modulePath == layer) {
                        // Check dependencies don't go to higher layers
                        for (i in 0 until index) {
                            val higherLayer = layerOrder.get()[i].replace(":", "")
                            if (content.contains("project(\":$higherLayer\")")) {
                                violations.add("$modulePath: upward dependency to $higherLayer violates layering")
                            }
                        }
                    }
                }
            }
        }
        
        if (violations.isNotEmpty()) {
            throw RuntimeException("Salle layering violations found:\n${violations.joinToString("\n")}")
        }
        
        println("🏗️ Salle layering verification passed - Modular architecture preserved.")
    }
}
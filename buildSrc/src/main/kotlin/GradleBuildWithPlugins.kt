/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Enhanced GradleBuild task with plugin injection support for nested builds.
 * Got it, love.
 */

import org.gradle.api.DefaultTask
import org.gradle.api.provider.ListProperty
import org.gradle.api.provider.MapProperty
import org.gradle.api.provider.Property
import org.gradle.api.tasks.Input
import org.gradle.api.tasks.Internal
import org.gradle.api.tasks.Optional
import org.gradle.api.tasks.TaskAction
import org.gradle.api.tasks.options.Option
import java.io.File

/**
 * Enhanced GradleBuild task that supports injecting specific plugins into nested builds
 * via StartParameter or build configuration. This enables custom plugins to be applied
 * to child builds when executing nested Gradle tasks.
 */
abstract class GradleBuildWithPlugins : DefaultTask() {
    
    @get:Input
    abstract val buildName: Property<String>
    
    @get:Input
    abstract val projectDirectory: Property<File>
    
    @get:Input
    abstract val tasks: ListProperty<String>
    
    @get:Input
    @get:Optional
    abstract val injectedPlugins: ListProperty<String>
    
    @get:Input
    @get:Optional
    abstract val pluginConfigurations: MapProperty<String, String>
    
    @get:Input
    @get:Optional
    abstract val buildArguments: ListProperty<String>
    
    @get:Internal
    abstract val enablePluginInjection: Property<Boolean>
    
    init {
        description = "Executes a nested Gradle build with support for plugin injection"
        group = "build"
        enablePluginInjection.convention(true)
        tasks.convention(listOf("assemble"))
    }
    
    @Option(option = "inject-plugin", description = "Inject a specific plugin into the nested build")
    fun addInjectedPlugin(pluginId: String) {
        injectedPlugins.add(pluginId)
    }
    
    @Option(option = "plugin-config", description = "Configure an injected plugin (format: pluginId=config)")
    fun addPluginConfiguration(config: String) {
        val parts = config.split("=", limit = 2)
        if (parts.size == 2) {
            pluginConfigurations.put(parts[0], parts[1])
        }
    }
    
    @TaskAction
    fun executeNestedBuild() {
        val buildDir = projectDirectory.get()
        val buildNameValue = buildName.getOrElse("nested-build")
        
        if (!buildDir.exists()) {
            throw RuntimeException("Build directory does not exist: ${buildDir.absolutePath}")
        }
        
        val gradleBuildFile = File(buildDir, "build.gradle")
        val gradleBuildKtsFile = File(buildDir, "build.gradle.kts")
        
        if (!gradleBuildFile.exists() && !gradleBuildKtsFile.exists()) {
            throw RuntimeException("No build.gradle or build.gradle.kts found in: ${buildDir.absolutePath}")
        }
        
        if (enablePluginInjection.get() && injectedPlugins.get().isNotEmpty()) {
            injectPluginsIntoNestedBuild(buildDir)
        }
        
        executeGradleBuild(buildDir, buildNameValue)
        
        println("✅ Nested build '$buildNameValue' completed with plugin injection - Got it, love.")
    }
    
    private fun injectPluginsIntoNestedBuild(buildDir: File) {
        val pluginsToInject = injectedPlugins.get()
        val configurations = pluginConfigurations.get()
        
        logger.info("Injecting plugins into nested build: $pluginsToInject")
        
        // Create a temporary plugin injection script
        val injectionScript = File(buildDir, "injected-plugins.gradle")
        
        val scriptContent = buildString {
            appendLine("// Auto-generated plugin injection script for Sallie 1.0")
            appendLine("// Persona: Tough love meets soul care.")
            appendLine("")
            
            pluginsToInject.forEach { pluginId ->
                appendLine("apply plugin: '$pluginId'")
                
                // Apply any configurations for this plugin
                configurations[pluginId]?.let { config ->
                    appendLine("")
                    appendLine("// Configuration for $pluginId")
                    appendLine(config)
                }
            }
            
            appendLine("")
            appendLine("// Sallie 1.0 plugin injection complete")
        }
        
        injectionScript.writeText(scriptContent)
        
        // Apply the injection script to the build file
        val buildFile = File(buildDir, "build.gradle")
        if (buildFile.exists()) {
            val originalContent = buildFile.readText()
            val injectedContent = originalContent + "\n\n// Sallie 1.0 Plugin Injection\napply from: 'injected-plugins.gradle'\n"
            buildFile.writeText(injectedContent)
            
            // Schedule cleanup after build
            project.gradle.buildFinished {
                restoreOriginalBuildFile(buildFile, originalContent)
                injectionScript.delete()
            }
        }
    }
    
    private fun restoreOriginalBuildFile(buildFile: File, originalContent: String) {
        try {
            buildFile.writeText(originalContent)
            logger.debug("Restored original build file: ${buildFile.absolutePath}")
        } catch (e: Exception) {
            logger.warn("Failed to restore original build file: ${e.message}")
        }
    }
    
    private fun executeGradleBuild(buildDir: File, buildName: String) {
        val gradleCommand = if (System.getProperty("os.name").lowercase().contains("windows")) {
            "gradlew.bat"
        } else {
            "./gradlew"
        }
        
        val command = mutableListOf<String>().apply {
            add(gradleCommand)
            addAll(tasks.get())
            addAll(buildArguments.getOrElse(emptyList()))
            add("-Pbuild.name=$buildName")
        }
        
        logger.info("Executing nested build command: ${command.joinToString(" ")}")
        
        val processBuilder = ProcessBuilder(command)
            .directory(buildDir)
            .redirectErrorStream(true)
            
        val process = processBuilder.start()
        
        // Stream output in real-time
        process.inputStream.bufferedReader().use { reader ->
            reader.lineSequence().forEach { line ->
                logger.lifecycle(line)
            }
        }
        
        val exitCode = process.waitFor()
        if (exitCode != 0) {
            throw RuntimeException("Nested build failed with exit code: $exitCode")
        }
    }
}

/**
 * Configuration extension for plugin injection in nested builds
 */
open class PluginInjectionExtension {
    var enabledPlugins: MutableList<String> = mutableListOf()
    var pluginConfigurations: MutableMap<String, String> = mutableMapOf()
    var defaultArguments: MutableList<String> = mutableListOf()
    
    fun plugin(pluginId: String, configuration: String? = null) {
        enabledPlugins.add(pluginId)
        configuration?.let {
            pluginConfigurations[pluginId] = it
        }
    }
    
    fun argument(arg: String) {
        defaultArguments.add(arg)
    }
}
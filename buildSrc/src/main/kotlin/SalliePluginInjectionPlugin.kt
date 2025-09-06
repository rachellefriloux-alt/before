/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Plugin injection support for Gradle build system.
 * Got it, love.
 */

import org.gradle.api.Plugin
import org.gradle.api.Project

/**
 * Gradle plugin that provides support for injecting plugins into nested builds.
 * This enables the Sallie 1.0 modular architecture to apply specific plugins
 * to child builds based on configuration.
 */
class SalliePluginInjectionPlugin : Plugin<Project> {
    
    override fun apply(project: Project) {
        // Create the plugin injection extension
        val extension = project.extensions.create(
            "sallieBuildInjection", 
            PluginInjectionExtension::class.java
        )
        
        // Register the enhanced GradleBuild task type
        project.tasks.register("gradleBuildWithPlugins", GradleBuildWithPlugins::class.java) { task ->
            task.group = "build"
            task.description = "Execute nested Gradle build with plugin injection support"
            
            // Configure defaults from extension
            project.afterEvaluate {
                task.injectedPlugins.set(extension.enabledPlugins)
                task.pluginConfigurations.set(extension.pluginConfigurations)
                task.buildArguments.set(extension.defaultArguments)
            }
        }
        
        // Add convenience methods to project
        addConvenienceMethods(project, extension)
        
        // Configure verification tasks if available
        configureVerificationTasks(project)
        
        project.logger.info("✅ Sallie Plugin Injection system initialized - Got it, love.")
    }
    
    private fun addConvenienceMethods(project: Project, extension: PluginInjectionExtension) {
        project.extensions.extraProperties.set("createNestedBuildWithPlugins") { taskName: String ->
            project.tasks.register(taskName, GradleBuildWithPlugins::class.java) { task ->
                task.injectedPlugins.set(extension.enabledPlugins)
                task.pluginConfigurations.set(extension.pluginConfigurations)
                task.buildArguments.set(extension.defaultArguments)
            }
        }
    }
    
    private fun configureVerificationTasks(project: Project) {
        // Ensure plugin injection respects Sallie verification requirements
        project.tasks.whenTaskAdded { task ->
            if (task is GradleBuildWithPlugins) {
                // Add dependency on Sallie verification tasks if they exist
                project.tasks.findByName("verifySalleFeatures")?.let { verifyTask ->
                    task.dependsOn(verifyTask)
                }
            }
        }
    }
}

/**
 * Extension for configuring plugin injection behavior at the project level
 */
open class NestedBuildConfiguration {
    var buildDirectory: String = ""
    var buildName: String = "nested-build"
    var tasks: MutableList<String> = mutableListOf("assemble")
    var plugins: MutableList<String> = mutableListOf()
    var arguments: MutableList<String> = mutableListOf()
    
    fun plugin(pluginId: String) {
        plugins.add(pluginId)
    }
    
    fun task(taskName: String) {
        tasks.add(taskName)
    }
    
    fun argument(arg: String) {
        arguments.add(arg)
    }
}
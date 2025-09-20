package com.sallie.integration

import com.sallie.core.PluginRegistry
import com.sallie.orchestration.ExpandedOrchestrationController
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.flow.MutableStateFlow

/**
 * Integration class for the Expanded AI Orchestration Module.
 * Handles initialization, shutdown, and integration with other Sallie systems.
 */
class ExpandedOrchestrationIntegration(
    private val pluginRegistry: PluginRegistry
) {
    // Coroutine scope for integration operations
    private val integrationScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    
    // Orchestration controller instance
    private lateinit var orchestrationController: ExpandedOrchestrationController
    
    // System integration state
    private val _integrationState = MutableStateFlow(IntegrationState.INITIAL)
    val integrationState = _integrationState
    
    /**
     * Initializes the orchestration module and integrates it with other systems
     */
    suspend fun initialize() {
        try {
            _integrationState.value = IntegrationState.INITIALIZING
            
            // Create the orchestration controller
            orchestrationController = ExpandedOrchestrationController(pluginRegistry)
            
            // Initialize the controller
            orchestrationController.initialize()
            
            // Register integration hooks with other systems
            registerIntegrationHooks()
            
            // Connect with system monitoring
            connectWithSystemMonitoring()
            
            // Start system optimization schedule
            scheduleSystemOptimization()
            
            _integrationState.value = IntegrationState.INITIALIZED
        } catch (e: Exception) {
            _integrationState.value = IntegrationState.ERROR
            println("[ERROR] Failed to initialize orchestration integration: ${e.message}")
            e.printStackTrace()
            throw e
        }
    }
    
    /**
     * Shuts down the orchestration module
     */
    suspend fun shutdown() {
        try {
            _integrationState.value = IntegrationState.SHUTTING_DOWN
            
            // Unregister integration hooks
            unregisterIntegrationHooks()
            
            // Shutdown the orchestration controller
            orchestrationController.shutdown()
            
            _integrationState.value = IntegrationState.SHUT_DOWN
        } catch (e: Exception) {
            _integrationState.value = IntegrationState.ERROR
            println("[ERROR] Error during orchestration integration shutdown: ${e.message}")
            e.printStackTrace()
            throw e
        }
    }
    
    /**
     * Registers integration hooks with other Sallie systems
     */
    private fun registerIntegrationHooks() {
        // Register with the visual state manager for dashboard integration
        val visualStateManager = pluginRegistry.getComponent("visual-state-manager")
        if (visualStateManager != null) {
            visualStateManager.javaClass
                .getMethod("registerDashboard", String::class.java, Any::class.java)
                .invoke(
                    visualStateManager, 
                    "system-orchestration",
                    "ui/components/OrchestrationDashboard.vue"
                )
        }
        
        // Register with the personality bridge for system monitoring integration
        val personalityBridge = pluginRegistry.getComponent("personality-bridge")
        if (personalityBridge != null) {
            personalityBridge.javaClass
                .getMethod("registerSystemMonitor", String::class.java, Any::class.java)
                .invoke(
                    personalityBridge,
                    "expanded-orchestration",
                    orchestrationController
                )
        }
        
        // Register with the adaptive persona engine for resource allocation integration
        val adaptivePersonaEngine = pluginRegistry.getComponent("adaptive-persona-engine")
        if (adaptivePersonaEngine != null) {
            adaptivePersonaEngine.javaClass
                .getMethod("registerResourceManager", Any::class.java)
                .invoke(adaptivePersonaEngine, orchestrationController)
        }
    }
    
    /**
     * Unregisters integration hooks
     */
    private fun unregisterIntegrationHooks() {
        // Unregister from the visual state manager
        val visualStateManager = pluginRegistry.getComponent("visual-state-manager")
        if (visualStateManager != null) {
            visualStateManager.javaClass
                .getMethod("unregisterDashboard", String::class.java)
                .invoke(visualStateManager, "system-orchestration")
        }
        
        // Unregister from the personality bridge
        val personalityBridge = pluginRegistry.getComponent("personality-bridge")
        if (personalityBridge != null) {
            personalityBridge.javaClass
                .getMethod("unregisterSystemMonitor", String::class.java)
                .invoke(personalityBridge, "expanded-orchestration")
        }
        
        // Unregister from the adaptive persona engine
        val adaptivePersonaEngine = pluginRegistry.getComponent("adaptive-persona-engine")
        if (adaptivePersonaEngine != null) {
            adaptivePersonaEngine.javaClass
                .getMethod("unregisterResourceManager", Any::class.java)
                .invoke(adaptivePersonaEngine, orchestrationController)
        }
    }
    
    /**
     * Connects with system monitoring
     */
    private fun connectWithSystemMonitoring() {
        // Subscribe to system events
        integrationScope.launch {
            val researchService = pluginRegistry.getComponent("research-service")
            if (researchService != null) {
                try {
                    val eventFlow = researchService.javaClass
                        .getMethod("getSystemEventsFlow")
                        .invoke(researchService) as kotlinx.coroutines.flow.Flow<*>
                    
                    // Collect system events and forward to orchestration controller
                    eventFlow.collect { event ->
                        // Process system events
                        // In a real implementation, this would parse and handle different event types
                        println("[INFO] Orchestration received system event: $event")
                    }
                } catch (e: Exception) {
                    println("[ERROR] Failed to connect to research service events: ${e.message}")
                }
            }
        }
    }
    
    /**
     * Schedules system optimization
     */
    private fun scheduleSystemOptimization() {
        integrationScope.launch {
            while (true) {
                try {
                    // Wait for the optimization interval (1 hour)
                    kotlinx.coroutines.delay(3600000)
                    
                    // Run system optimization
                    orchestrationController.optimizeSystem()
                    
                    println("[INFO] Scheduled system optimization completed")
                } catch (e: Exception) {
                    println("[ERROR] Error during scheduled system optimization: ${e.message}")
                }
            }
        }
    }
    
    /**
     * Gets a reference to the orchestration controller
     */
    fun getOrchestrationController(): ExpandedOrchestrationController {
        if (!::orchestrationController.isInitialized) {
            throw IllegalStateException("Orchestration controller is not initialized")
        }
        return orchestrationController
    }
}

/**
 * Integration state enum
 */
enum class IntegrationState {
    INITIAL,
    INITIALIZING,
    INITIALIZED,
    SHUTTING_DOWN,
    SHUT_DOWN,
    ERROR
}

/**
 * Sallie's Device Transfer System Integration
 * 
 * This module integrates the Device Transfer System with Sallie's core architecture,
 * registering it with the plugin registry and providing access through the API.
 *
 * Created with love. 💛
 */

package com.sallie.integration

import com.sallie.transfer.DeviceTransferSystem
import com.sallie.core.PluginRegistry
import com.sallie.core.memory.HierarchicalMemorySystem
import com.sallie.core.values.ValueSystem
import com.sallie.core.personality.PersonalityProfile
import com.sallie.core.learning.UserPreferenceModel
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * Integrates the Device Transfer System with Sallie's core
 */
class DeviceTransferSystemIntegration(
    private val pluginRegistry: PluginRegistry,
    private val memorySystem: HierarchicalMemorySystem,
    private val valueSystem: ValueSystem,
    private val personalityProfile: PersonalityProfile,
    private val userPreferenceModel: UserPreferenceModel
) {
    private val coroutineScope = CoroutineScope(Dispatchers.IO)
    private lateinit var deviceTransferSystem: DeviceTransferSystem
    
    /**
     * Initializes and registers the Device Transfer System
     */
    fun initialize() {
        // Create the Device Transfer System
        deviceTransferSystem = DeviceTransferSystem(
            memorySystem = memorySystem,
            valueSystem = valueSystem,
            personalityProfile = personalityProfile,
            userPreferences = userPreferenceModel
        )
        
        // Register with plugin registry
        pluginRegistry.registerSystemComponent(
            componentId = "device-transfer-system",
            component = deviceTransferSystem,
            displayName = "Device Transfer System",
            description = "Enables transferring Sallie's personality and memories between devices",
            version = "1.0.0",
            capabilities = listOf(
                "device-discovery",
                "secure-transfer",
                "memory-export",
                "memory-import",
                "personality-transfer",
                "values-transfer",
                "user-preferences-transfer"
            )
        )
        
        // Register UI component
        pluginRegistry.registerUiComponent(
            componentId = "device-transfer-ui",
            componentPath = "ui/components/DeviceTransfer.vue",
            displayName = "Device Transfer Interface",
            description = "User interface for device transfer functionality",
            accessPermissions = listOf(
                "device-discovery",
                "secure-transfer",
                "memory-export"
            )
        )
        
        // Register event listeners
        registerEventListeners()
        
        // Log successful initialization
        println("Device Transfer System successfully initialized and registered")
    }
    
    /**
     * Registers event listeners for system events
     */
    private fun registerEventListeners() {
        // Listen for device connection events
        pluginRegistry.addEventListener("device-connected", { event ->
            coroutineScope.launch {
                val deviceInfo = event.payload["deviceInfo"]
                println("Device connected: $deviceInfo")
                // Any special handling for new device connections
            }
        })
        
        // Listen for system shutdown to ensure clean transfer termination
        pluginRegistry.addEventListener("system-shutdown", { event ->
            coroutineScope.launch {
                // Clean up any active transfers
                println("Cleaning up Device Transfer System for shutdown")
                // Implementation of cleanup logic
            }
        })
    }
    
    /**
     * Gets the Device Transfer System instance
     */
    fun getDeviceTransferSystem(): DeviceTransferSystem {
        return deviceTransferSystem
    }
}

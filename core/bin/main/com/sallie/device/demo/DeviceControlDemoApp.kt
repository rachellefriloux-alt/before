/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * Device Control Demo Application
 */

package com.sallie.device.demo

import com.sallie.core.PluginRegistry
import com.sallie.core.ValuesSystem
import com.sallie.device.DeviceAutomationEngine
import com.sallie.device.DeviceEvent
import com.sallie.device.DeviceEventType
import com.sallie.device.DeviceOperationResult
import com.sallie.device.DeviceProtocol
import com.sallie.device.DeviceType
import com.sallie.device.EnhancedDeviceControlSystem
import com.sallie.device.SmartDevice
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking

/**
 * Demo application that shows how to use the device control system
 */
class DeviceControlDemoApp {
    
    private val pluginRegistry = PluginRegistry()
    private val valuesSystem = ValuesSystem()
    private lateinit var deviceControlSystem: EnhancedDeviceControlSystem
    private lateinit var automationEngine: DeviceAutomationEngine
    
    private val appScope = CoroutineScope(Dispatchers.Default)
    
    /**
     * Start the demo
     */
    fun start() = runBlocking {
        println("=== Sallie Device Control Demo ===")
        
        // Initialize device control system
        println("\nInitializing Device Control System...")
        deviceControlSystem = EnhancedDeviceControlSystem(pluginRegistry, valuesSystem)
        deviceControlSystem.initialize()
        
        // Listen for device events
        appScope.launch {
            deviceControlSystem.deviceEvents
                .onEach { event -> handleDeviceEvent(event) }
                .collect()
        }
        
        // Initialize automation engine
        automationEngine = deviceControlSystem.getAutomationEngine()
        automationEngine.createDefaultRules()
        
        // Discover devices
        println("\nDiscovering devices...")
        val protocols = setOf(
            DeviceProtocol.WIFI,
            DeviceProtocol.BLUETOOTH,
            DeviceProtocol.ZIGBEE,
            DeviceProtocol.ZWAVE
        )
        val devices = deviceControlSystem.discoverDevices(protocols, 15000)
        
        println("\nDiscovered ${devices.size} devices:")
        devices.forEachIndexed { index, device ->
            println("${index + 1}. ${device.name} (${device.type}, ${device.protocol})")
        }
        
        // Select a device to control
        val lightDevice = devices.firstOrNull { it.type == DeviceType.LIGHT }
        if (lightDevice != null) {
            println("\nControlling light: ${lightDevice.name}")
            
            // Turn on the light
            println("Turning on...")
            val result = deviceControlSystem.controlDevice(lightDevice.id, "power", true)
            handleOperationResult(result)
            
            // Set brightness
            println("Setting brightness to 80%...")
            val brightnessResult = deviceControlSystem.controlDevice(lightDevice.id, "brightness", 80)
            handleOperationResult(brightnessResult)
            
            // Query state
            println("\nQuerying device state...")
            val state = deviceControlSystem.queryDeviceState(lightDevice.id)
            println("Current state: $state")
        }
        
        // Get a thermostat device
        val thermostatDevice = devices.firstOrNull { it.type == DeviceType.THERMOSTAT }
        if (thermostatDevice != null) {
            println("\nControlling thermostat: ${thermostatDevice.name}")
            
            // Set temperature
            println("Setting temperature to 74°F...")
            val result = deviceControlSystem.controlDevice(thermostatDevice.id, "targetTemperature", 74)
            handleOperationResult(result)
            
            // Query state
            println("\nQuerying device state...")
            val state = deviceControlSystem.queryDeviceState(thermostatDevice.id)
            println("Current state: $state")
        }
        
        // Create device group
        val deviceIds = devices.take(3).map { it.id }
        println("\nCreating device group with ${deviceIds.size} devices...")
        val groupId = deviceControlSystem.createDeviceGroup("Demo Group", deviceIds)
        
        if (groupId != null) {
            println("Group created with ID: $groupId")
            val group = deviceControlSystem.getDeviceGroup(groupId)
            println("Group details: $group")
        }
        
        // Execute scene
        val scene = automationEngine.scenes.value.firstOrNull()
        if (scene != null) {
            println("\nExecuting scene: ${scene.name}...")
            val sceneResult = deviceControlSystem.executeScene(scene.id)
            println("Scene execution ${if (sceneResult) "succeeded" else "failed"}")
        }
        
        // Trigger rule manually
        val rule = automationEngine.rules.value.firstOrNull()
        if (rule != null) {
            println("\nTriggering rule: ${rule.name}...")
            automationEngine.triggerRule(rule.id)
            println("Rule triggered")
        }
        
        // Wait to see events
        println("\nMonitoring events for 10 seconds...")
        delay(10000)
        
        // Shutdown
        println("\nShutting down Device Control System...")
        deviceControlSystem.shutdown()
        
        println("\nDemo completed!")
    }
    
    /**
     * Handle device events
     */
    private fun handleDeviceEvent(event: DeviceEvent) {
        when (event) {
            is DeviceEvent.DeviceDiscoveryEvent -> {
                println("[EVENT] Device discovered: ${event.deviceName} (${event.deviceType})")
            }
            is DeviceEvent.DeviceStateChangedEvent -> {
                println("[EVENT] Device state changed: ${event.deviceId}, ${event.property} = ${event.value}")
            }
            is DeviceEvent.DeviceErrorEvent -> {
                println("[ERROR] Device error: ${event.deviceId} - ${event.error}")
            }
            is DeviceEvent.SystemEvent -> {
                println("[SYSTEM] ${event.message}")
            }
            is DeviceEvent.SecurityEvent -> {
                println("[SECURITY] ${event.message}")
            }
            is DeviceEvent.AutomationEvent -> {
                println("[AUTOMATION] Rule '${event.ruleName}' triggered: ${event.actions.joinToString()}")
            }
            is DeviceEvent.SceneEvent -> {
                println("[SCENE] ${event.sceneName} activated")
            }
        }
    }
    
    /**
     * Handle device operation results
     */
    private fun handleOperationResult(result: DeviceOperationResult) {
        when (result) {
            is DeviceOperationResult.Success -> {
                println("Success! New state: ${result.newState}")
            }
            is DeviceOperationResult.Error -> {
                println("Error: ${result.message}")
            }
            is DeviceOperationResult.Rejected -> {
                println("Rejected: ${result.reason}")
            }
            is DeviceOperationResult.Timeout -> {
                println("Timeout for device: ${result.deviceId}")
            }
        }
    }
}

/**
 * Main entry point for the demo
 */
fun main() {
    val demo = DeviceControlDemoApp()
    demo.start()
}

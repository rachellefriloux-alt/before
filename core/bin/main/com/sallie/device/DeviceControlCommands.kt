/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * Device Control Commands Utility
 */

package com.sallie.device

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Utility class that provides high-level device control commands for Sallie's
 * conversational interface
 */
class DeviceControlCommands(
    private val deviceControlSystem: DeviceControlSystemInterface
) {
    
    /**
     * Turns on a device by name
     */
    suspend fun turnOn(deviceName: String): CommandResult = withContext(Dispatchers.IO) {
        val device = findDeviceByName(deviceName)
        if (device == null) {
            return@withContext CommandResult(false, "Could not find device: $deviceName")
        }
        
        if ("power" !in device.capabilities) {
            return@withContext CommandResult(false, "Device does not support power control")
        }
        
        when (val result = deviceControlSystem.controlDevice(device.id, "power", true)) {
            is DeviceOperationResult.Success -> {
                CommandResult(true, "Turned on ${device.name}")
            }
            is DeviceOperationResult.Error -> {
                CommandResult(false, "Error: ${result.message}")
            }
            is DeviceOperationResult.Rejected -> {
                CommandResult(false, "Request rejected: ${result.reason}")
            }
            is DeviceOperationResult.Timeout -> {
                CommandResult(false, "Timed out while trying to control ${device.name}")
            }
        }
    }
    
    /**
     * Turns off a device by name
     */
    suspend fun turnOff(deviceName: String): CommandResult = withContext(Dispatchers.IO) {
        val device = findDeviceByName(deviceName)
        if (device == null) {
            return@withContext CommandResult(false, "Could not find device: $deviceName")
        }
        
        if ("power" !in device.capabilities) {
            return@withContext CommandResult(false, "Device does not support power control")
        }
        
        when (val result = deviceControlSystem.controlDevice(device.id, "power", false)) {
            is DeviceOperationResult.Success -> {
                CommandResult(true, "Turned off ${device.name}")
            }
            is DeviceOperationResult.Error -> {
                CommandResult(false, "Error: ${result.message}")
            }
            is DeviceOperationResult.Rejected -> {
                CommandResult(false, "Request rejected: ${result.reason}")
            }
            is DeviceOperationResult.Timeout -> {
                CommandResult(false, "Timed out while trying to control ${device.name}")
            }
        }
    }
    
    /**
     * Sets the brightness of a light device
     */
    suspend fun setBrightness(deviceName: String, brightness: Int): CommandResult = withContext(Dispatchers.IO) {
        val device = findDeviceByName(deviceName)
        if (device == null) {
            return@withContext CommandResult(false, "Could not find device: $deviceName")
        }
        
        if ("brightness" !in device.capabilities) {
            return@withContext CommandResult(false, "Device does not support brightness control")
        }
        
        val normalizedBrightness = brightness.coerceIn(0, 100)
        
        when (val result = deviceControlSystem.controlDevice(device.id, "brightness", normalizedBrightness)) {
            is DeviceOperationResult.Success -> {
                CommandResult(true, "Set brightness of ${device.name} to $normalizedBrightness%")
            }
            is DeviceOperationResult.Error -> {
                CommandResult(false, "Error: ${result.message}")
            }
            is DeviceOperationResult.Rejected -> {
                CommandResult(false, "Request rejected: ${result.reason}")
            }
            is DeviceOperationResult.Timeout -> {
                CommandResult(false, "Timed out while trying to control ${device.name}")
            }
        }
    }
    
    /**
     * Sets the temperature of a thermostat
     */
    suspend fun setTemperature(deviceName: String, temperature: Int): CommandResult = withContext(Dispatchers.IO) {
        val device = findDeviceByName(deviceName)
        if (device == null) {
            return@withContext CommandResult(false, "Could not find device: $deviceName")
        }
        
        if ("targetTemperature" !in device.capabilities) {
            return@withContext CommandResult(false, "Device does not support temperature control")
        }
        
        // Reasonable temperature range in Fahrenheit (50-90F)
        val normalizedTemperature = temperature.coerceIn(50, 90)
        
        when (val result = deviceControlSystem.controlDevice(device.id, "targetTemperature", normalizedTemperature)) {
            is DeviceOperationResult.Success -> {
                CommandResult(true, "Set temperature of ${device.name} to ${normalizedTemperature}°F")
            }
            is DeviceOperationResult.Error -> {
                CommandResult(false, "Error: ${result.message}")
            }
            is DeviceOperationResult.Rejected -> {
                CommandResult(false, "Request rejected: ${result.reason}")
            }
            is DeviceOperationResult.Timeout -> {
                CommandResult(false, "Timed out while trying to control ${device.name}")
            }
        }
    }
    
    /**
     * Locks a smart lock
     */
    suspend fun lock(deviceName: String): CommandResult = withContext(Dispatchers.IO) {
        val device = findDeviceByName(deviceName)
        if (device == null) {
            return@withContext CommandResult(false, "Could not find device: $deviceName")
        }
        
        if ("locked" !in device.capabilities) {
            return@withContext CommandResult(false, "Device does not support lock control")
        }
        
        when (val result = deviceControlSystem.controlDevice(device.id, "locked", true)) {
            is DeviceOperationResult.Success -> {
                CommandResult(true, "Locked ${device.name}")
            }
            is DeviceOperationResult.Error -> {
                CommandResult(false, "Error: ${result.message}")
            }
            is DeviceOperationResult.Rejected -> {
                CommandResult(false, "Request rejected: ${result.reason}")
            }
            is DeviceOperationResult.Timeout -> {
                CommandResult(false, "Timed out while trying to control ${device.name}")
            }
        }
    }
    
    /**
     * Unlocks a smart lock
     */
    suspend fun unlock(deviceName: String): CommandResult = withContext(Dispatchers.IO) {
        val device = findDeviceByName(deviceName)
        if (device == null) {
            return@withContext CommandResult(false, "Could not find device: $deviceName")
        }
        
        if ("locked" !in device.capabilities) {
            return@withContext CommandResult(false, "Device does not support lock control")
        }
        
        when (val result = deviceControlSystem.controlDevice(device.id, "locked", false)) {
            is DeviceOperationResult.Success -> {
                CommandResult(true, "Unlocked ${device.name}")
            }
            is DeviceOperationResult.Error -> {
                CommandResult(false, "Error: ${result.message}")
            }
            is DeviceOperationResult.Rejected -> {
                CommandResult(false, "Request rejected: ${result.reason}")
            }
            is DeviceOperationResult.Timeout -> {
                CommandResult(false, "Timed out while trying to control ${device.name}")
            }
        }
    }
    
    /**
     * Gets information about a device
     */
    suspend fun getDeviceInfo(deviceName: String): CommandResult = withContext(Dispatchers.IO) {
        val device = findDeviceByName(deviceName)
        if (device == null) {
            return@withContext CommandResult(false, "Could not find device: $deviceName")
        }
        
        val state = deviceControlSystem.queryDeviceState(device.id)
        if (state == null) {
            return@withContext CommandResult(false, "Could not retrieve state for: ${device.name}")
        }
        
        val stateString = state.entries.joinToString("\n") { (key, value) ->
            "- $key: $value"
        }
        
        val infoBuilder = StringBuilder()
        infoBuilder.appendLine("Device: ${device.name}")
        infoBuilder.appendLine("Type: ${device.type}")
        infoBuilder.appendLine("Manufacturer: ${device.manufacturer}")
        infoBuilder.appendLine("Model: ${device.model}")
        infoBuilder.appendLine("Protocol: ${device.protocol}")
        infoBuilder.appendLine("Capabilities: ${device.capabilities.joinToString(", ")}")
        infoBuilder.appendLine("Current State:")
        infoBuilder.appendLine(stateString)
        
        CommandResult(true, infoBuilder.toString())
    }
    
    /**
     * Lists all available devices
     */
    suspend fun listDevices(): CommandResult = withContext(Dispatchers.IO) {
        val devices = deviceControlSystem.getAllDevices()
        
        if (devices.isEmpty()) {
            return@withContext CommandResult(false, "No devices found. Try discovering devices first.")
        }
        
        val deviceList = devices.groupBy { it.type }.entries.joinToString("\n\n") { (type, devicesByType) ->
            val typeDevices = devicesByType.joinToString("\n") { device ->
                "- ${device.name} (${device.manufacturer} ${device.model})"
            }
            "$type devices:\n$typeDevices"
        }
        
        CommandResult(true, "Found ${devices.size} devices:\n\n$deviceList")
    }
    
    /**
     * Executes a scene by name
     */
    suspend fun executeScene(sceneName: String): CommandResult = withContext(Dispatchers.IO) {
        val automationEngine = deviceControlSystem.getAutomationEngine()
        val scenes = automationEngine.scenes.value
        
        val scene = scenes.firstOrNull { it.name.equals(sceneName, ignoreCase = true) }
        if (scene == null) {
            return@withContext CommandResult(false, "Could not find scene: $sceneName")
        }
        
        val result = deviceControlSystem.executeScene(scene.id)
        
        if (result) {
            CommandResult(true, "Executed scene: ${scene.name}")
        } else {
            CommandResult(false, "Failed to execute scene: ${scene.name}")
        }
    }
    
    /**
     * Lists all available scenes
     */
    suspend fun listScenes(): CommandResult = withContext(Dispatchers.IO) {
        val automationEngine = deviceControlSystem.getAutomationEngine()
        val scenes = automationEngine.scenes.value
        
        if (scenes.isEmpty()) {
            return@withContext CommandResult(false, "No scenes found.")
        }
        
        val sceneList = scenes.joinToString("\n") { scene ->
            "- ${scene.name}: ${scene.deviceStates.size} devices"
        }
        
        CommandResult(true, "Available scenes:\n$sceneList")
    }
    
    /**
     * Triggers a rule by name
     */
    suspend fun triggerRule(ruleName: String): CommandResult = withContext(Dispatchers.IO) {
        val automationEngine = deviceControlSystem.getAutomationEngine()
        val rules = automationEngine.rules.value
        
        val rule = rules.firstOrNull { it.name.equals(ruleName, ignoreCase = true) }
        if (rule == null) {
            return@withContext CommandResult(false, "Could not find rule: $ruleName")
        }
        
        automationEngine.triggerRule(rule.id)
        CommandResult(true, "Triggered rule: ${rule.name}")
    }
    
    /**
     * Lists all available automation rules
     */
    suspend fun listRules(): CommandResult = withContext(Dispatchers.IO) {
        val automationEngine = deviceControlSystem.getAutomationEngine()
        val rules = automationEngine.rules.value
        
        if (rules.isEmpty()) {
            return@withContext CommandResult(false, "No rules found.")
        }
        
        val ruleList = rules.joinToString("\n") { rule ->
            val status = if (rule.enabled) "Enabled" else "Disabled"
            "- ${rule.name} ($status): ${rule.actions.size} actions"
        }
        
        CommandResult(true, "Available automation rules:\n$ruleList")
    }
    
    /**
     * Discover new devices
     */
    suspend fun discoverDevices(): CommandResult = withContext(Dispatchers.IO) {
        val protocols = setOf(
            DeviceProtocol.WIFI,
            DeviceProtocol.BLUETOOTH,
            DeviceProtocol.ZIGBEE,
            DeviceProtocol.ZWAVE
        )
        
        val devices = deviceControlSystem.discoverDevices(protocols, 10000)
        
        if (devices.isEmpty()) {
            return@withContext CommandResult(false, "No new devices found.")
        }
        
        val deviceList = devices.joinToString("\n") { device ->
            "- ${device.name} (${device.type}, ${device.protocol})"
        }
        
        CommandResult(true, "Discovered ${devices.size} devices:\n$deviceList")
    }
    
    /**
     * Find a device by name (case insensitive)
     */
    private fun findDeviceByName(name: String): SmartDevice? {
        val devices = deviceControlSystem.getAllDevices()
        
        return devices.firstOrNull { 
            it.name.equals(name, ignoreCase = true)
        }
    }
    
    /**
     * Result of a command operation
     */
    data class CommandResult(
        val success: Boolean,
        val message: String
    )
}

/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * Device Control Facade
 */

package com.sallie.device

import com.sallie.core.PluginRegistry
import com.sallie.core.ValuesSystem
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

/**
 * Facade for the Device Control System that provides a simplified interface
 * for other parts of the Sallie system
 */
class DeviceControlFacade(
    private val pluginRegistry: PluginRegistry,
    private val valuesSystem: ValuesSystem,
    private val coroutineScope: CoroutineScope = CoroutineScope(Dispatchers.Default)
) {
    private lateinit var deviceControlSystem: EnhancedDeviceControlSystem
    private lateinit var deviceControlCommands: DeviceControlCommands
    
    /**
     * The current state of the device control system
     */
    val systemState: StateFlow<DeviceControlState>
        get() = deviceControlSystem.systemState
    
    /**
     * Flow of device events
     */
    val deviceEvents: SharedFlow<DeviceEvent>
        get() = deviceControlSystem.deviceEvents
    
    /**
     * Initialize the facade and underlying system
     */
    fun initialize() {
        deviceControlSystem = EnhancedDeviceControlSystem(pluginRegistry, valuesSystem)
        deviceControlCommands = DeviceControlCommands(deviceControlSystem)
        
        coroutineScope.launch {
            deviceControlSystem.initialize()
        }
    }
    
    /**
     * Shut down the facade and underlying system
     */
    fun shutdown() {
        coroutineScope.launch {
            deviceControlSystem.shutdown()
        }
    }
    
    /**
     * Turn on a device by name
     */
    fun turnOnDevice(deviceName: String, callback: (DeviceControlCommands.CommandResult) -> Unit) {
        coroutineScope.launch {
            val result = deviceControlCommands.turnOn(deviceName)
            callback(result)
        }
    }
    
    /**
     * Turn off a device by name
     */
    fun turnOffDevice(deviceName: String, callback: (DeviceControlCommands.CommandResult) -> Unit) {
        coroutineScope.launch {
            val result = deviceControlCommands.turnOff(deviceName)
            callback(result)
        }
    }
    
    /**
     * Set brightness of a light
     */
    fun setBrightness(deviceName: String, brightness: Int, callback: (DeviceControlCommands.CommandResult) -> Unit) {
        coroutineScope.launch {
            val result = deviceControlCommands.setBrightness(deviceName, brightness)
            callback(result)
        }
    }
    
    /**
     * Set temperature of a thermostat
     */
    fun setTemperature(deviceName: String, temperature: Int, callback: (DeviceControlCommands.CommandResult) -> Unit) {
        coroutineScope.launch {
            val result = deviceControlCommands.setTemperature(deviceName, temperature)
            callback(result)
        }
    }
    
    /**
     * Lock a smart lock
     */
    fun lockDevice(deviceName: String, callback: (DeviceControlCommands.CommandResult) -> Unit) {
        coroutineScope.launch {
            val result = deviceControlCommands.lock(deviceName)
            callback(result)
        }
    }
    
    /**
     * Unlock a smart lock
     */
    fun unlockDevice(deviceName: String, callback: (DeviceControlCommands.CommandResult) -> Unit) {
        coroutineScope.launch {
            val result = deviceControlCommands.unlock(deviceName)
            callback(result)
        }
    }
    
    /**
     * Get information about a device
     */
    fun getDeviceInfo(deviceName: String, callback: (DeviceControlCommands.CommandResult) -> Unit) {
        coroutineScope.launch {
            val result = deviceControlCommands.getDeviceInfo(deviceName)
            callback(result)
        }
    }
    
    /**
     * List all devices
     */
    fun listDevices(callback: (DeviceControlCommands.CommandResult) -> Unit) {
        coroutineScope.launch {
            val result = deviceControlCommands.listDevices()
            callback(result)
        }
    }
    
    /**
     * Execute a scene
     */
    fun executeScene(sceneName: String, callback: (DeviceControlCommands.CommandResult) -> Unit) {
        coroutineScope.launch {
            val result = deviceControlCommands.executeScene(sceneName)
            callback(result)
        }
    }
    
    /**
     * List available scenes
     */
    fun listScenes(callback: (DeviceControlCommands.CommandResult) -> Unit) {
        coroutineScope.launch {
            val result = deviceControlCommands.listScenes()
            callback(result)
        }
    }
    
    /**
     * Trigger an automation rule
     */
    fun triggerRule(ruleName: String, callback: (DeviceControlCommands.CommandResult) -> Unit) {
        coroutineScope.launch {
            val result = deviceControlCommands.triggerRule(ruleName)
            callback(result)
        }
    }
    
    /**
     * List automation rules
     */
    fun listRules(callback: (DeviceControlCommands.CommandResult) -> Unit) {
        coroutineScope.launch {
            val result = deviceControlCommands.listRules()
            callback(result)
        }
    }
    
    /**
     * Discover new devices
     */
    fun discoverDevices(callback: (DeviceControlCommands.CommandResult) -> Unit) {
        coroutineScope.launch {
            val result = deviceControlCommands.discoverDevices()
            callback(result)
        }
    }
    
    /**
     * Get the underlying device control system (for advanced usage)
     */
    fun getDeviceControlSystem(): DeviceControlSystemInterface {
        return deviceControlSystem
    }
}

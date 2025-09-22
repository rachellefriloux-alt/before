package com.sallie.core.device

import com.sallie.core.PluginRegistry
import com.sallie.core.values.ValuesSystem
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.flow.take
import kotlinx.coroutines.flow.toList
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * A simplified facade for the Device Control system
 * This provides an easy-to-use interface for other parts of Sallie
 */
class DeviceControlFacade private constructor(
    private val scope: CoroutineScope,
    private val deviceControlSystem: DeviceControlSystemInterface
) {
    companion object {
        @Volatile
        private var INSTANCE: DeviceControlFacade? = null
        
        fun getInstance(
            pluginRegistry: PluginRegistry,
            valuesSystem: ValuesSystem,
            scope: CoroutineScope
        ): DeviceControlFacade {
            return INSTANCE ?: synchronized(this) {
                val instance = DeviceControlFacade(
                    scope,
                    EnhancedDeviceControlSystem(scope, valuesSystem)
                )
                INSTANCE = instance
                instance
            }
        }
    }
    
    /**
     * Initialize the device control system
     */
    suspend fun initialize() {
        deviceControlSystem.initialize()
    }
    
    /**
     * Discover devices on the network
     * @param callback The callback to receive the discovery result
     */
    fun discoverDevices(callback: (DeviceOperationResult) -> Unit) {
        scope.launch(Dispatchers.IO) {
            try {
                val devices = deviceControlSystem.discoverDevices()
                    .take(20) // Limit to 20 devices for safety
                    .toList()
                
                val result = DeviceOperationResult(
                    success = true,
                    message = "Discovered ${devices.size} devices",
                    data = devices
                )
                withContext(Dispatchers.Main) {
                    callback(result)
                }
            } catch (e: Exception) {
                val result = DeviceOperationResult(
                    success = false,
                    message = "Discovery failed: ${e.message}",
                    error = e
                )
                withContext(Dispatchers.Main) {
                    callback(result)
                }
            }
        }
    }
    
    /**
     * Get a list of all known devices
     * @param callback The callback to receive the result
     */
    fun getDevices(callback: (DeviceOperationResult) -> Unit) {
        scope.launch(Dispatchers.IO) {
            try {
                val devices = deviceControlSystem.getDevices()
                val result = DeviceOperationResult(
                    success = true,
                    message = "${devices.size} devices found",
                    data = devices
                )
                withContext(Dispatchers.Main) {
                    callback(result)
                }
            } catch (e: Exception) {
                val result = DeviceOperationResult(
                    success = false,
                    message = "Failed to get devices: ${e.message}",
                    error = e
                )
                withContext(Dispatchers.Main) {
                    callback(result)
                }
            }
        }
    }
    
    /**
     * Turn a device on
     * @param deviceNameOrId The name or ID of the device
     * @param callback The callback to receive the result
     */
    fun turnOnDevice(deviceNameOrId: String, callback: (DeviceOperationResult) -> Unit) {
        scope.launch(Dispatchers.IO) {
            try {
                val device = findDevice(deviceNameOrId)
                
                if (device == null) {
                    val result = DeviceOperationResult(
                        success = false,
                        message = "Device not found: $deviceNameOrId"
                    )
                    withContext(Dispatchers.Main) {
                        callback(result)
                    }
                    return@launch
                }
                
                val command = DeviceCommand.PowerCommand(true)
                val commandResult = deviceControlSystem.executeCommand(device.id, command)
                
                val result = DeviceOperationResult(
                    success = commandResult.success,
                    message = commandResult.message
                )
                withContext(Dispatchers.Main) {
                    callback(result)
                }
            } catch (e: Exception) {
                val result = DeviceOperationResult(
                    success = false,
                    message = "Error turning on device: ${e.message}",
                    error = e
                )
                withContext(Dispatchers.Main) {
                    callback(result)
                }
            }
        }
    }
    
    /**
     * Turn a device off
     * @param deviceNameOrId The name or ID of the device
     * @param callback The callback to receive the result
     */
    fun turnOffDevice(deviceNameOrId: String, callback: (DeviceOperationResult) -> Unit) {
        scope.launch(Dispatchers.IO) {
            try {
                val device = findDevice(deviceNameOrId)
                
                if (device == null) {
                    val result = DeviceOperationResult(
                        success = false,
                        message = "Device not found: $deviceNameOrId"
                    )
                    withContext(Dispatchers.Main) {
                        callback(result)
                    }
                    return@launch
                }
                
                val command = DeviceCommand.PowerCommand(false)
                val commandResult = deviceControlSystem.executeCommand(device.id, command)
                
                val result = DeviceOperationResult(
                    success = commandResult.success,
                    message = commandResult.message
                )
                withContext(Dispatchers.Main) {
                    callback(result)
                }
            } catch (e: Exception) {
                val result = DeviceOperationResult(
                    success = false,
                    message = "Error turning off device: ${e.message}",
                    error = e
                )
                withContext(Dispatchers.Main) {
                    callback(result)
                }
            }
        }
    }
    
    /**
     * Set the brightness of a device
     * @param deviceNameOrId The name or ID of the device
     * @param brightness The brightness level (0-100)
     * @param callback The callback to receive the result
     */
    fun setBrightness(deviceNameOrId: String, brightness: Int, callback: (DeviceOperationResult) -> Unit) {
        scope.launch(Dispatchers.IO) {
            try {
                val device = findDevice(deviceNameOrId)
                
                if (device == null) {
                    val result = DeviceOperationResult(
                        success = false,
                        message = "Device not found: $deviceNameOrId"
                    )
                    withContext(Dispatchers.Main) {
                        callback(result)
                    }
                    return@launch
                }
                
                val normalizedBrightness = brightness.coerceIn(0, 100)
                val command = DeviceCommand.BrightnessCommand(normalizedBrightness)
                val commandResult = deviceControlSystem.executeCommand(device.id, command)
                
                val result = DeviceOperationResult(
                    success = commandResult.success,
                    message = commandResult.message
                )
                withContext(Dispatchers.Main) {
                    callback(result)
                }
            } catch (e: Exception) {
                val result = DeviceOperationResult(
                    success = false,
                    message = "Error setting brightness: ${e.message}",
                    error = e
                )
                withContext(Dispatchers.Main) {
                    callback(result)
                }
            }
        }
    }
    
    /**
     * Set the temperature of a thermostat
     * @param deviceNameOrId The name or ID of the device
     * @param temperature The temperature in Celsius
     * @param callback The callback to receive the result
     */
    fun setTemperature(deviceNameOrId: String, temperature: Int, callback: (DeviceOperationResult) -> Unit) {
        scope.launch(Dispatchers.IO) {
            try {
                val device = findDevice(deviceNameOrId)
                
                if (device == null) {
                    val result = DeviceOperationResult(
                        success = false,
                        message = "Device not found: $deviceNameOrId"
                    )
                    withContext(Dispatchers.Main) {
                        callback(result)
                    }
                    return@launch
                }
                
                val command = DeviceCommand.SetTemperatureCommand(temperature.toDouble())
                val commandResult = deviceControlSystem.executeCommand(device.id, command)
                
                val result = DeviceOperationResult(
                    success = commandResult.success,
                    message = commandResult.message
                )
                withContext(Dispatchers.Main) {
                    callback(result)
                }
            } catch (e: Exception) {
                val result = DeviceOperationResult(
                    success = false,
                    message = "Error setting temperature: ${e.message}",
                    error = e
                )
                withContext(Dispatchers.Main) {
                    callback(result)
                }
            }
        }
    }
    
    /**
     * Lock a device
     * @param deviceNameOrId The name or ID of the device
     * @param callback The callback to receive the result
     */
    fun lockDevice(deviceNameOrId: String, callback: (DeviceOperationResult) -> Unit) {
        scope.launch(Dispatchers.IO) {
            try {
                val device = findDevice(deviceNameOrId)
                
                if (device == null) {
                    val result = DeviceOperationResult(
                        success = false,
                        message = "Device not found: $deviceNameOrId"
                    )
                    withContext(Dispatchers.Main) {
                        callback(result)
                    }
                    return@launch
                }
                
                val command = DeviceCommand.LockCommand(true)
                val commandResult = deviceControlSystem.executeCommand(device.id, command)
                
                val result = DeviceOperationResult(
                    success = commandResult.success,
                    message = commandResult.message
                )
                withContext(Dispatchers.Main) {
                    callback(result)
                }
            } catch (e: Exception) {
                val result = DeviceOperationResult(
                    success = false,
                    message = "Error locking device: ${e.message}",
                    error = e
                )
                withContext(Dispatchers.Main) {
                    callback(result)
                }
            }
        }
    }
    
    /**
     * Unlock a device
     * @param deviceNameOrId The name or ID of the device
     * @param callback The callback to receive the result
     */
    fun unlockDevice(deviceNameOrId: String, callback: (DeviceOperationResult) -> Unit) {
        scope.launch(Dispatchers.IO) {
            try {
                val device = findDevice(deviceNameOrId)
                
                if (device == null) {
                    val result = DeviceOperationResult(
                        success = false,
                        message = "Device not found: $deviceNameOrId"
                    )
                    withContext(Dispatchers.Main) {
                        callback(result)
                    }
                    return@launch
                }
                
                val command = DeviceCommand.LockCommand(false)
                val commandResult = deviceControlSystem.executeCommand(device.id, command)
                
                val result = DeviceOperationResult(
                    success = commandResult.success,
                    message = commandResult.message
                )
                withContext(Dispatchers.Main) {
                    callback(result)
                }
            } catch (e: Exception) {
                val result = DeviceOperationResult(
                    success = false,
                    message = "Error unlocking device: ${e.message}",
                    error = e
                )
                withContext(Dispatchers.Main) {
                    callback(result)
                }
            }
        }
    }
    
    /**
     * List available scenes
     * @param callback The callback to receive the result
     */
    fun listScenes(callback: (DeviceOperationResult) -> Unit) {
        scope.launch(Dispatchers.IO) {
            try {
                val scenes = deviceControlSystem.getScenes()
                
                val formattedScenes = scenes.joinToString("\n") { scene ->
                    "${scene.name} (${scene.deviceStates.size} devices)"
                }
                
                val result = DeviceOperationResult(
                    success = true,
                    message = if (scenes.isEmpty()) "No scenes found" else formattedScenes,
                    data = scenes
                )
                withContext(Dispatchers.Main) {
                    callback(result)
                }
            } catch (e: Exception) {
                val result = DeviceOperationResult(
                    success = false,
                    message = "Error listing scenes: ${e.message}",
                    error = e
                )
                withContext(Dispatchers.Main) {
                    callback(result)
                }
            }
        }
    }
    
    /**
     * Execute a scene
     * @param sceneName The name of the scene
     * @param callback The callback to receive the result
     */
    fun executeScene(sceneName: String, callback: (DeviceOperationResult) -> Unit) {
        scope.launch(Dispatchers.IO) {
            try {
                val scenes = deviceControlSystem.getScenes()
                val scene = scenes.find { it.name.equals(sceneName, ignoreCase = true) }
                
                if (scene == null) {
                    val result = DeviceOperationResult(
                        success = false,
                        message = "Scene not found: $sceneName"
                    )
                    withContext(Dispatchers.Main) {
                        callback(result)
                    }
                    return@launch
                }
                
                val executionResult = deviceControlSystem.executeScene(scene.id)
                
                val result = DeviceOperationResult(
                    success = executionResult.success,
                    message = executionResult.message
                )
                withContext(Dispatchers.Main) {
                    callback(result)
                }
            } catch (e: Exception) {
                val result = DeviceOperationResult(
                    success = false,
                    message = "Error executing scene: ${e.message}",
                    error = e
                )
                withContext(Dispatchers.Main) {
                    callback(result)
                }
            }
        }
    }
    
    /**
     * List automation rules
     * @param callback The callback to receive the result
     */
    fun listRules(callback: (DeviceOperationResult) -> Unit) {
        scope.launch(Dispatchers.IO) {
            try {
                val rules = deviceControlSystem.getRules()
                
                val formattedRules = rules.joinToString("\n") { rule ->
                    "${rule.name} ${if (rule.enabled) "(enabled)" else "(disabled)"}"
                }
                
                val result = DeviceOperationResult(
                    success = true,
                    message = if (rules.isEmpty()) "No rules found" else formattedRules,
                    data = rules
                )
                withContext(Dispatchers.Main) {
                    callback(result)
                }
            } catch (e: Exception) {
                val result = DeviceOperationResult(
                    success = false,
                    message = "Error listing rules: ${e.message}",
                    error = e
                )
                withContext(Dispatchers.Main) {
                    callback(result)
                }
            }
        }
    }
    
    /**
     * Trigger a specific rule
     * @param ruleName The name of the rule
     * @param callback The callback to receive the result
     */
    fun triggerRule(ruleName: String, callback: (DeviceOperationResult) -> Unit) {
        scope.launch(Dispatchers.IO) {
            try {
                val rules = deviceControlSystem.getRules()
                val rule = rules.find { it.name.equals(ruleName, ignoreCase = true) }
                
                if (rule == null) {
                    val result = DeviceOperationResult(
                        success = false,
                        message = "Rule not found: $ruleName"
                    )
                    withContext(Dispatchers.Main) {
                        callback(result)
                    }
                    return@launch
                }
                
                val executionResult = deviceControlSystem.triggerRule(rule.id)
                
                val result = DeviceOperationResult(
                    success = executionResult.success,
                    message = executionResult.message
                )
                withContext(Dispatchers.Main) {
                    callback(result)
                }
            } catch (e: Exception) {
                val result = DeviceOperationResult(
                    success = false,
                    message = "Error triggering rule: ${e.message}",
                    error = e
                )
                withContext(Dispatchers.Main) {
                    callback(result)
                }
            }
        }
    }
    
    /**
     * Find a device by name or ID
     */
    private suspend fun findDevice(deviceNameOrId: String): Device? {
        // First try by ID
        var device = deviceControlSystem.getDevice(deviceNameOrId)
        
        // Then try by name
        if (device == null) {
            val devices = deviceControlSystem.getDevicesByName(deviceNameOrId)
            device = devices.firstOrNull()
        }
        
        return device
    }
    
    /**
     * Result class for device operations
     */
    data class DeviceOperationResult(
        val success: Boolean,
        val message: String,
        val data: Any? = null,
        val error: Exception? = null
    )
}

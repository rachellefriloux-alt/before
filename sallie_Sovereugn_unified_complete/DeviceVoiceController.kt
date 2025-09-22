// Salle Persona Module
// DeviceVoiceController.kt
// Migrated for reference only. Not integrated into JS runtime.

// TODO: If needed, port logic to JS for Salle compatibility.


package com.sallie.feature.device

import com.sallie.ai.nlpEngine
import com.sallie.core.device.DeviceControlFacade
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * Voice control system for natural language interaction with smart devices
 */
class DeviceVoiceController(
    private val deviceControlFacade: DeviceControlFacade,
    private val nlpEngine: nlpEngine,
    private val scope: CoroutineScope
) {
    /**
     * Process a voice command related to device control
     * @param command The voice command as text
     * @param callback Called when the command has been processed
     */
    fun processVoiceCommand(command: String, callback: (VoiceCommandResult) -> Unit) {
        scope.launch(Dispatchers.Default) {
            val result = try {
                val intent = nlpEngine.extractIntent(command)
                
                when (intent.action) {
                    DeviceIntent.TURN_ON -> handleTurnOnCommand(intent)
                    DeviceIntent.TURN_OFF -> handleTurnOffCommand(intent) 
                    DeviceIntent.SET_BRIGHTNESS -> handleSetBrightnessCommand(intent)
                    DeviceIntent.SET_TEMPERATURE -> handleSetTemperatureCommand(intent)
                    DeviceIntent.LOCK -> handleLockCommand(intent)
                    DeviceIntent.UNLOCK -> handleUnlockCommand(intent)
                    DeviceIntent.ACTIVATE_SCENE -> handleActivateSceneCommand(intent)
                    DeviceIntent.LIST_DEVICES -> handleListDevicesCommand()
                    DeviceIntent.LIST_SCENES -> handleListScenesCommand()
                    DeviceIntent.UNKNOWN -> VoiceCommandResult(
                        success = false,
                        message = "I'm not sure what you want to do with your devices. Try something like 'turn on the living room lights'.",
                        visualFeedback = null
                    )
                    else -> VoiceCommandResult(
                        success = false,
                        message = "I don't understand that device command. Can you try again?",
                        visualFeedback = null
                    )
                }
            } catch (e: Exception) {
                VoiceCommandResult(
                    success = false,
                    message = "I had trouble processing that command: ${e.message}",
                    visualFeedback = null
                )
            }
            
            withContext(Dispatchers.Main) {
                callback(result)
            }
        }
    }
    
    /**
     * Handle a command to turn on a device
     */
    private suspend fun handleTurnOnCommand(intent: DeviceIntent): VoiceCommandResult {
        val deviceName = intent.parameters["device"] ?: return VoiceCommandResult(
            success = false,
            message = "Which device would you like to turn on?",
            visualFeedback = null
        )
        
        val result = suspendCallback<DeviceControlFacade.DeviceOperationResult> { callback ->
            deviceControlFacade.turnOnDevice(deviceName, callback)
        }
        
        return if (result.success) {
            VoiceCommandResult(
                success = true,
                message = "I've turned on the $deviceName",
                visualFeedback = VisualFeedback.DeviceTurnedOn(deviceName)
            )
        } else {
            VoiceCommandResult(
                success = false,
                message = "I couldn't turn on the $deviceName. ${result.message}",
                visualFeedback = null
            )
        }
    }
    
    /**
     * Handle a command to turn off a device
     */
    private suspend fun handleTurnOffCommand(intent: DeviceIntent): VoiceCommandResult {
        val deviceName = intent.parameters["device"] ?: return VoiceCommandResult(
            success = false,
            message = "Which device would you like to turn off?",
            visualFeedback = null
        )
        
        val result = suspendCallback<DeviceControlFacade.DeviceOperationResult> { callback ->
            deviceControlFacade.turnOffDevice(deviceName, callback)
        }
        
        return if (result.success) {
            VoiceCommandResult(
                success = true,
                message = "I've turned off the $deviceName",
                visualFeedback = VisualFeedback.DeviceTurnedOff(deviceName)
            )
        } else {
            VoiceCommandResult(
                success = false,
                message = "I couldn't turn off the $deviceName. ${result.message}",
                visualFeedback = null
            )
        }
    }
    
    /**
     * Handle a command to set the brightness of a device
     */
    private suspend fun handleSetBrightnessCommand(intent: DeviceIntent): VoiceCommandResult {
        val deviceName = intent.parameters["device"] ?: return VoiceCommandResult(
            success = false,
            message = "Which device would you like to adjust the brightness for?",
            visualFeedback = null
        )
        
        val brightnessStr = intent.parameters["brightness"] ?: return VoiceCommandResult(
            success = false,
            message = "What brightness level would you like to set? Please specify a percentage.",
            visualFeedback = null
        )
        
        val brightness = try {
            brightnessStr.trim('%').toInt()
        } catch (e: NumberFormatException) {
            return VoiceCommandResult(
                success = false,
                message = "I didn't understand the brightness level. Please specify a percentage between 0 and 100.",
                visualFeedback = null
            )
        }
        
        val result = suspendCallback<DeviceControlFacade.DeviceOperationResult> { callback ->
            deviceControlFacade.setBrightness(deviceName, brightness, callback)
        }
        
        return if (result.success) {
            VoiceCommandResult(
                success = true,
                message = "I've set the brightness of the $deviceName to $brightness%",
                visualFeedback = VisualFeedback.BrightnessChanged(deviceName, brightness)
            )
        } else {
            VoiceCommandResult(
                success = false,
                message = "I couldn't set the brightness of the $deviceName. ${result.message}",
                visualFeedback = null
            )
        }
    }
    
    /**
     * Handle a command to set the temperature
     */
    private suspend fun handleSetTemperatureCommand(intent: DeviceIntent): VoiceCommandResult {
        val deviceName = intent.parameters["device"] ?: return VoiceCommandResult(
            success = false,
            message = "Which thermostat would you like to adjust?",
            visualFeedback = null
        )
        
        val temperatureStr = intent.parameters["temperature"] ?: return VoiceCommandResult(
            success = false,
            message = "What temperature would you like to set?",
            visualFeedback = null
        )
        
        val temperature = try {
            // Handle common temperature expressions
            val numericValue = temperatureStr.trim()
                .replace("°C", "")
                .replace("°F", "")
                .replace("degrees", "")
                .trim()
                .toInt()
            
            // Simple conversion if needed (assuming Celsius is default)
            if (temperatureStr.contains("°F")) {
                ((numericValue - 32) * 5 / 9) // Convert Fahrenheit to Celsius
            } else {
                numericValue
            }
        } catch (e: NumberFormatException) {
            return VoiceCommandResult(
                success = false,
                message = "I didn't understand the temperature setting. Please specify a number.",
                visualFeedback = null
            )
        }
        
        val result = suspendCallback<DeviceControlFacade.DeviceOperationResult> { callback ->
            deviceControlFacade.setTemperature(deviceName, temperature, callback)
        }
        
        return if (result.success) {
            VoiceCommandResult(
                success = true,
                message = "I've set the temperature of the $deviceName to $temperature°C",
                visualFeedback = VisualFeedback.TemperatureChanged(deviceName, temperature)
            )
        } else {
            VoiceCommandResult(
                success = false,
                message = "I couldn't set the temperature of the $deviceName. ${result.message}",
                visualFeedback = null
            )
        }
    }
    
    /**
     * Handle a command to lock a device
     */
    private suspend fun handleLockCommand(intent: DeviceIntent): VoiceCommandResult {
        val deviceName = intent.parameters["device"] ?: return VoiceCommandResult(
            success = false,
            message = "Which device would you like to lock?",
            visualFeedback = null
        )
        
        val result = suspendCallback<DeviceControlFacade.DeviceOperationResult> { callback ->
            deviceControlFacade.lockDevice(deviceName, callback)
        }
        
        return if (result.success) {
            VoiceCommandResult(
                success = true,
                message = "I've locked the $deviceName",
                visualFeedback = VisualFeedback.DeviceLocked(deviceName)
            )
        } else {
            VoiceCommandResult(
                success = false,
                message = "I couldn't lock the $deviceName. ${result.message}",
                visualFeedback = null
            )
        }
    }
    
    /**
     * Handle a command to unlock a device
     */
    private suspend fun handleUnlockCommand(intent: DeviceIntent): VoiceCommandResult {
        val deviceName = intent.parameters["device"] ?: return VoiceCommandResult(
            success = false,
            message = "Which device would you like to unlock?",
            visualFeedback = null
        )
        
        val result = suspendCallback<DeviceControlFacade.DeviceOperationResult> { callback ->
            deviceControlFacade.unlockDevice(deviceName, callback)
        }
        
        return if (result.success) {
            VoiceCommandResult(
                success = true,
                message = "I've unlocked the $deviceName",
                visualFeedback = VisualFeedback.DeviceUnlocked(deviceName)
            )
        } else {
            VoiceCommandResult(
                success = false,
                message = "I couldn't unlock the $deviceName. ${result.message}",
                visualFeedback = null
            )
        }
    }
    
    /**
     * Handle a command to activate a scene
     */
    private suspend fun handleActivateSceneCommand(intent: DeviceIntent): VoiceCommandResult {
        val sceneName = intent.parameters["scene"] ?: return VoiceCommandResult(
            success = false,
            message = "Which scene would you like to activate?",
            visualFeedback = null
        )
        
        val result = suspendCallback<DeviceControlFacade.DeviceOperationResult> { callback ->
            deviceControlFacade.executeScene(sceneName, callback)
        }
        
        return if (result.success) {
            VoiceCommandResult(
                success = true,
                message = "I've activated the '$sceneName' scene",
                visualFeedback = VisualFeedback.SceneActivated(sceneName)
            )
        } else {
            VoiceCommandResult(
                success = false,
                message = "I couldn't activate the '$sceneName' scene. ${result.message}",
                visualFeedback = null
            )
        }
    }
    
    /**
     * Handle a command to list all devices
     */
    private suspend fun handleListDevicesCommand(): VoiceCommandResult {
        val result = suspendCallback<DeviceControlFacade.DeviceOperationResult> { callback ->
            deviceControlFacade.getDevices(callback)
        }
        
        return if (result.success) {
            @Suppress("UNCHECKED_CAST")
            val devices = result.data as? List<com.sallie.core.device.Device> ?: emptyList()
            
            if (devices.isEmpty()) {
                VoiceCommandResult(
                    success = true,
                    message = "I don't see any devices connected at the moment.",
                    visualFeedback = VisualFeedback.DeviceList(emptyList())
                )
            } else {
                val deviceNames = devices.map { it.name }
                val message = "Here are your connected devices: ${deviceNames.joinToString(", ")}"
                
                VoiceCommandResult(
                    success = true,
                    message = message,
                    visualFeedback = VisualFeedback.DeviceList(deviceNames)
                )
            }
        } else {
            VoiceCommandResult(
                success = false,
                message = "I couldn't retrieve your devices. ${result.message}",
                visualFeedback = null
            )
        }
    }
    
    /**
     * Handle a command to list all scenes
     */
    private suspend fun handleListScenesCommand(): VoiceCommandResult {
        val result = suspendCallback<DeviceControlFacade.DeviceOperationResult> { callback ->
            deviceControlFacade.listScenes(callback)
        }
        
        return if (result.success) {
            @Suppress("UNCHECKED_CAST")
            val scenes = result.data as? List<com.sallie.core.device.Scene> ?: emptyList()
            
            if (scenes.isEmpty()) {
                VoiceCommandResult(
                    success = true,
                    message = "You don't have any scenes set up yet.",
                    visualFeedback = VisualFeedback.SceneList(emptyList())
                )
            } else {
                val sceneNames = scenes.map { it.name }
                val message = "Here are your available scenes: ${sceneNames.joinToString(", ")}"
                
                VoiceCommandResult(
                    success = true,
                    message = message,
                    visualFeedback = VisualFeedback.SceneList(sceneNames)
                )
            }
        } else {
            VoiceCommandResult(
                success = false,
                message = "I couldn't retrieve your scenes. ${result.message}",
                visualFeedback = null
            )
        }
    }
    
    /**
     * Helper to convert a callback-based API to a suspend function
     */
    private suspend fun <T> suspendCallback(block: (callback: (T) -> Unit) -> Unit): T {
        return kotlinx.coroutines.suspendCancellableCoroutine { continuation ->
            block { result ->
                continuation.resume(result) {
                    // Handle cancellation if needed
                }
            }
        }
    }
    
    /**
     * Voice command result with feedback for the user
     */
    data class VoiceCommandResult(
        val success: Boolean,
        val message: String,
        val visualFeedback: VisualFeedback?
    )
    
    /**
     * Visual feedback types for UI updates after voice commands
     */
    sealed class VisualFeedback {
        data class DeviceTurnedOn(val deviceName: String) : VisualFeedback()
        data class DeviceTurnedOff(val deviceName: String) : VisualFeedback()
        data class BrightnessChanged(val deviceName: String, val brightness: Int) : VisualFeedback()
        data class TemperatureChanged(val deviceName: String, val temperature: Int) : VisualFeedback()
        data class DeviceLocked(val deviceName: String) : VisualFeedback()
        data class DeviceUnlocked(val deviceName: String) : VisualFeedback()
        data class SceneActivated(val sceneName: String) : VisualFeedback()
        data class DeviceList(val deviceNames: List<String>) : VisualFeedback()
        data class SceneList(val sceneNames: List<String>) : VisualFeedback()
    }
    
    /**
     * Device intent extracted from voice commands
     */
    data class DeviceIntent(
        val action: String,
        val parameters: Map<String, String>
    ) {
        companion object {
            const val TURN_ON = "device.turn_on"
            const val TURN_OFF = "device.turn_off"
            const val SET_BRIGHTNESS = "device.set_brightness"
            const val SET_TEMPERATURE = "device.set_temperature"
            const val LOCK = "device.lock"
            const val UNLOCK = "device.unlock"
            const val ACTIVATE_SCENE = "device.activate_scene"
            const val LIST_DEVICES = "device.list_devices"
            const val LIST_SCENES = "device.list_scenes"
            const val UNKNOWN = "device.unknown"
        }
    }
}


package com.sallie.feature.device

import com.sallie.ai.nlpEngine
import com.sallie.core.device.DeviceControlFacade
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * Voice control system for natural language interaction with smart devices
 */
class DeviceVoiceController(
    private val deviceControlFacade: DeviceControlFacade,
    private val nlpEngine: nlpEngine,
    private val scope: CoroutineScope
) {
    /**
     * Process a voice command related to device control
     * @param command The voice command as text
     * @param callback Called when the command has been processed
     */
    fun processVoiceCommand(command: String, callback: (VoiceCommandResult) -> Unit) {
        scope.launch(Dispatchers.Default) {
            val result = try {
                val intent = nlpEngine.extractIntent(command)
                
                when (intent.action) {
                    DeviceIntent.TURN_ON -> handleTurnOnCommand(intent)
                    DeviceIntent.TURN_OFF -> handleTurnOffCommand(intent) 
                    DeviceIntent.SET_BRIGHTNESS -> handleSetBrightnessCommand(intent)
                    DeviceIntent.SET_TEMPERATURE -> handleSetTemperatureCommand(intent)
                    DeviceIntent.LOCK -> handleLockCommand(intent)
                    DeviceIntent.UNLOCK -> handleUnlockCommand(intent)
                    DeviceIntent.ACTIVATE_SCENE -> handleActivateSceneCommand(intent)
                    DeviceIntent.LIST_DEVICES -> handleListDevicesCommand()
                    DeviceIntent.LIST_SCENES -> handleListScenesCommand()
                    DeviceIntent.UNKNOWN -> VoiceCommandResult(
                        success = false,
                        message = "I'm not sure what you want to do with your devices. Try something like 'turn on the living room lights'.",
                        visualFeedback = null
                    )
                    else -> VoiceCommandResult(
                        success = false,
                        message = "I don't understand that device command. Can you try again?",
                        visualFeedback = null
                    )
                }
            } catch (e: Exception) {
                VoiceCommandResult(
                    success = false,
                    message = "I had trouble processing that command: ${e.message}",
                    visualFeedback = null
                )
            }
            
            withContext(Dispatchers.Main) {
                callback(result)
            }
        }
    }
    
    /**
     * Handle a command to turn on a device
     */
    private suspend fun handleTurnOnCommand(intent: DeviceIntent): VoiceCommandResult {
        val deviceName = intent.parameters["device"] ?: return VoiceCommandResult(
            success = false,
            message = "Which device would you like to turn on?",
            visualFeedback = null
        )
        
        val result = suspendCallback<DeviceControlFacade.DeviceOperationResult> { callback ->
            deviceControlFacade.turnOnDevice(deviceName, callback)
        }
        
        return if (result.success) {
            VoiceCommandResult(
                success = true,
                message = "I've turned on the $deviceName",
                visualFeedback = VisualFeedback.DeviceTurnedOn(deviceName)
            )
        } else {
            VoiceCommandResult(
                success = false,
                message = "I couldn't turn on the $deviceName. ${result.message}",
                visualFeedback = null
            )
        }
    }
    
    /**
     * Handle a command to turn off a device
     */
    private suspend fun handleTurnOffCommand(intent: DeviceIntent): VoiceCommandResult {
        val deviceName = intent.parameters["device"] ?: return VoiceCommandResult(
            success = false,
            message = "Which device would you like to turn off?",
            visualFeedback = null
        )
        
        val result = suspendCallback<DeviceControlFacade.DeviceOperationResult> { callback ->
            deviceControlFacade.turnOffDevice(deviceName, callback)
        }
        
        return if (result.success) {
            VoiceCommandResult(
                success = true,
                message = "I've turned off the $deviceName",
                visualFeedback = VisualFeedback.DeviceTurnedOff(deviceName)
            )
        } else {
            VoiceCommandResult(
                success = false,
                message = "I couldn't turn off the $deviceName. ${result.message}",
                visualFeedback = null
            )
        }
    }
    
    /**
     * Handle a command to set the brightness of a device
     */
    private suspend fun handleSetBrightnessCommand(intent: DeviceIntent): VoiceCommandResult {
        val deviceName = intent.parameters["device"] ?: return VoiceCommandResult(
            success = false,
            message = "Which device would you like to adjust the brightness for?",
            visualFeedback = null
        )
        
        val brightnessStr = intent.parameters["brightness"] ?: return VoiceCommandResult(
            success = false,
            message = "What brightness level would you like to set? Please specify a percentage.",
            visualFeedback = null
        )
        
        val brightness = try {
            brightnessStr.trim('%').toInt()
        } catch (e: NumberFormatException) {
            return VoiceCommandResult(
                success = false,
                message = "I didn't understand the brightness level. Please specify a percentage between 0 and 100.",
                visualFeedback = null
            )
        }
        
        val result = suspendCallback<DeviceControlFacade.DeviceOperationResult> { callback ->
            deviceControlFacade.setBrightness(deviceName, brightness, callback)
        }
        
        return if (result.success) {
            VoiceCommandResult(
                success = true,
                message = "I've set the brightness of the $deviceName to $brightness%",
                visualFeedback = VisualFeedback.BrightnessChanged(deviceName, brightness)
            )
        } else {
            VoiceCommandResult(
                success = false,
                message = "I couldn't set the brightness of the $deviceName. ${result.message}",
                visualFeedback = null
            )
        }
    }
    
    /**
     * Handle a command to set the temperature
     */
    private suspend fun handleSetTemperatureCommand(intent: DeviceIntent): VoiceCommandResult {
        val deviceName = intent.parameters["device"] ?: return VoiceCommandResult(
            success = false,
            message = "Which thermostat would you like to adjust?",
            visualFeedback = null
        )
        
        val temperatureStr = intent.parameters["temperature"] ?: return VoiceCommandResult(
            success = false,
            message = "What temperature would you like to set?",
            visualFeedback = null
        )
        
        val temperature = try {
            // Handle common temperature expressions
            val numericValue = temperatureStr.trim()
                .replace("°C", "")
                .replace("°F", "")
                .replace("degrees", "")
                .trim()
                .toInt()
            
            // Simple conversion if needed (assuming Celsius is default)
            if (temperatureStr.contains("°F")) {
                ((numericValue - 32) * 5 / 9) // Convert Fahrenheit to Celsius
            } else {
                numericValue
            }
        } catch (e: NumberFormatException) {
            return VoiceCommandResult(
                success = false,
                message = "I didn't understand the temperature setting. Please specify a number.",
                visualFeedback = null
            )
        }
        
        val result = suspendCallback<DeviceControlFacade.DeviceOperationResult> { callback ->
            deviceControlFacade.setTemperature(deviceName, temperature, callback)
        }
        
        return if (result.success) {
            VoiceCommandResult(
                success = true,
                message = "I've set the temperature of the $deviceName to $temperature°C",
                visualFeedback = VisualFeedback.TemperatureChanged(deviceName, temperature)
            )
        } else {
            VoiceCommandResult(
                success = false,
                message = "I couldn't set the temperature of the $deviceName. ${result.message}",
                visualFeedback = null
            )
        }
    }
    
    /**
     * Handle a command to lock a device
     */
    private suspend fun handleLockCommand(intent: DeviceIntent): VoiceCommandResult {
        val deviceName = intent.parameters["device"] ?: return VoiceCommandResult(
            success = false,
            message = "Which device would you like to lock?",
            visualFeedback = null
        )
        
        val result = suspendCallback<DeviceControlFacade.DeviceOperationResult> { callback ->
            deviceControlFacade.lockDevice(deviceName, callback)
        }
        
        return if (result.success) {
            VoiceCommandResult(
                success = true,
                message = "I've locked the $deviceName",
                visualFeedback = VisualFeedback.DeviceLocked(deviceName)
            )
        } else {
            VoiceCommandResult(
                success = false,
                message = "I couldn't lock the $deviceName. ${result.message}",
                visualFeedback = null
            )
        }
    }
    
    /**
     * Handle a command to unlock a device
     */
    private suspend fun handleUnlockCommand(intent: DeviceIntent): VoiceCommandResult {
        val deviceName = intent.parameters["device"] ?: return VoiceCommandResult(
            success = false,
            message = "Which device would you like to unlock?",
            visualFeedback = null
        )
        
        val result = suspendCallback<DeviceControlFacade.DeviceOperationResult> { callback ->
            deviceControlFacade.unlockDevice(deviceName, callback)
        }
        
        return if (result.success) {
            VoiceCommandResult(
                success = true,
                message = "I've unlocked the $deviceName",
                visualFeedback = VisualFeedback.DeviceUnlocked(deviceName)
            )
        } else {
            VoiceCommandResult(
                success = false,
                message = "I couldn't unlock the $deviceName. ${result.message}",
                visualFeedback = null
            )
        }
    }
    
    /**
     * Handle a command to activate a scene
     */
    private suspend fun handleActivateSceneCommand(intent: DeviceIntent): VoiceCommandResult {
        val sceneName = intent.parameters["scene"] ?: return VoiceCommandResult(
            success = false,
            message = "Which scene would you like to activate?",
            visualFeedback = null
        )
        
        val result = suspendCallback<DeviceControlFacade.DeviceOperationResult> { callback ->
            deviceControlFacade.executeScene(sceneName, callback)
        }
        
        return if (result.success) {
            VoiceCommandResult(
                success = true,
                message = "I've activated the '$sceneName' scene",
                visualFeedback = VisualFeedback.SceneActivated(sceneName)
            )
        } else {
            VoiceCommandResult(
                success = false,
                message = "I couldn't activate the '$sceneName' scene. ${result.message}",
                visualFeedback = null
            )
        }
    }
    
    /**
     * Handle a command to list all devices
     */
    private suspend fun handleListDevicesCommand(): VoiceCommandResult {
        val result = suspendCallback<DeviceControlFacade.DeviceOperationResult> { callback ->
            deviceControlFacade.getDevices(callback)
        }
        
        return if (result.success) {
            @Suppress("UNCHECKED_CAST")
            val devices = result.data as? List<com.sallie.core.device.Device> ?: emptyList()
            
            if (devices.isEmpty()) {
                VoiceCommandResult(
                    success = true,
                    message = "I don't see any devices connected at the moment.",
                    visualFeedback = VisualFeedback.DeviceList(emptyList())
                )
            } else {
                val deviceNames = devices.map { it.name }
                val message = "Here are your connected devices: ${deviceNames.joinToString(", ")}"
                
                VoiceCommandResult(
                    success = true,
                    message = message,
                    visualFeedback = VisualFeedback.DeviceList(deviceNames)
                )
            }
        } else {
            VoiceCommandResult(
                success = false,
                message = "I couldn't retrieve your devices. ${result.message}",
                visualFeedback = null
            )
        }
    }
    
    /**
     * Handle a command to list all scenes
     */
    private suspend fun handleListScenesCommand(): VoiceCommandResult {
        val result = suspendCallback<DeviceControlFacade.DeviceOperationResult> { callback ->
            deviceControlFacade.listScenes(callback)
        }
        
        return if (result.success) {
            @Suppress("UNCHECKED_CAST")
            val scenes = result.data as? List<com.sallie.core.device.Scene> ?: emptyList()
            
            if (scenes.isEmpty()) {
                VoiceCommandResult(
                    success = true,
                    message = "You don't have any scenes set up yet.",
                    visualFeedback = VisualFeedback.SceneList(emptyList())
                )
            } else {
                val sceneNames = scenes.map { it.name }
                val message = "Here are your available scenes: ${sceneNames.joinToString(", ")}"
                
                VoiceCommandResult(
                    success = true,
                    message = message,
                    visualFeedback = VisualFeedback.SceneList(sceneNames)
                )
            }
        } else {
            VoiceCommandResult(
                success = false,
                message = "I couldn't retrieve your scenes. ${result.message}",
                visualFeedback = null
            )
        }
    }
    
    /**
     * Helper to convert a callback-based API to a suspend function
     */
    private suspend fun <T> suspendCallback(block: (callback: (T) -> Unit) -> Unit): T {
        return kotlinx.coroutines.suspendCancellableCoroutine { continuation ->
            block { result ->
                continuation.resume(result) {
                    // Handle cancellation if needed
                }
            }
        }
    }
    
    /**
     * Voice command result with feedback for the user
     */
    data class VoiceCommandResult(
        val success: Boolean,
        val message: String,
        val visualFeedback: VisualFeedback?
    )
    
    /**
     * Visual feedback types for UI updates after voice commands
     */
    sealed class VisualFeedback {
        data class DeviceTurnedOn(val deviceName: String) : VisualFeedback()
        data class DeviceTurnedOff(val deviceName: String) : VisualFeedback()
        data class BrightnessChanged(val deviceName: String, val brightness: Int) : VisualFeedback()
        data class TemperatureChanged(val deviceName: String, val temperature: Int) : VisualFeedback()
        data class DeviceLocked(val deviceName: String) : VisualFeedback()
        data class DeviceUnlocked(val deviceName: String) : VisualFeedback()
        data class SceneActivated(val sceneName: String) : VisualFeedback()
        data class DeviceList(val deviceNames: List<String>) : VisualFeedback()
        data class SceneList(val sceneNames: List<String>) : VisualFeedback()
    }
    
    /**
     * Device intent extracted from voice commands
     */
    data class DeviceIntent(
        val action: String,
        val parameters: Map<String, String>
    ) {
        companion object {
            const val TURN_ON = "device.turn_on"
            const val TURN_OFF = "device.turn_off"
            const val SET_BRIGHTNESS = "device.set_brightness"
            const val SET_TEMPERATURE = "device.set_temperature"
            const val LOCK = "device.lock"
            const val UNLOCK = "device.unlock"
            const val ACTIVATE_SCENE = "device.activate_scene"
            const val LIST_DEVICES = "device.list_devices"
            const val LIST_SCENES = "device.list_scenes"
            const val UNKNOWN = "device.unknown"
        }
    }
}


/*
 * Persona: Tough love meets soul care.
 * Module: DeviceVoiceController
 * Intent: Handle functionality for DeviceVoiceController
 * Provenance-ID: 66a54900-2a1e-4d70-a31a-aaee7672c54c
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

// Salle Persona Module
// DeviceVoiceController.kt
// Migrated for reference only. Not integrated into JS runtime.

// ✔ Enhanced logic added: If needed, port logic to JS for Salle compatibility.


/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\feature\device\DeviceVoiceController.kt) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\feature\device\DeviceVoiceController.kt) */
/* --- dest (C:\Users\chell\Desktop\newsal\feature\device\DeviceVoiceController.kt) --- */
/* Merged master for logical file: feature\device\DeviceVoiceController
Sources:
 - C:\Users\chell\Desktop\Sallie\merged_sallie\feature\device\DeviceVoiceController.kt (hash:9DD1900016E64518030A07B1863294C73033E59AA7E5D4B2812CE3ACFD3C0509)
 - C:\Users\chell\Desktop\Sallie\merged_sallie\feature\device\DeviceVoiceController.js (hash:35383FE3759283E0D66524F7B89E7087FC2A8F361E3F0368C9DD7CE57DFF5A35)
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\feature\device\DeviceVoiceController.js (hash:7EC6AEEF5F0F27B6A89746CD2BA06763179585D5C49DAD44956794631136C971)
 */

/* ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\feature\device\DeviceVoiceController.kt | ext: .kt | sha: 9DD1900016E64518030A07B1863294C73033E59AA7E5D4B2812CE3ACFD3C0509 ---- */
[BINARY FILE - original copied to merged_sources: feature\device\DeviceVoiceController.kt]
/* ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\feature\device\DeviceVoiceController.js | ext: .js | sha: 35383FE3759283E0D66524F7B89E7087FC2A8F361E3F0368C9DD7CE57DFF5A35 ---- */
[BINARY FILE - original copied to merged_sources: feature\device\DeviceVoiceController.js]
/* ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\feature\device\DeviceVoiceController.js | ext: .js | sha: 7EC6AEEF5F0F27B6A89746CD2BA06763179585D5C49DAD44956794631136C971 ---- */
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\feature\device\DeviceVoiceController.kt --- */
// Salle Persona Module
// DeviceVoiceController.kt
// Migrated for reference only. Not integrated into JS runtime.
// TODO: If needed, port logic to JS for Salle compatibility.

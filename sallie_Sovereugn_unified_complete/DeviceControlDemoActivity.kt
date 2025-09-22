// Salle Persona Module
// DeviceControlDemoActivity.kt
// Migrated for reference only. Not integrated into JS runtime.

// TODO: If needed, port logic to JS for Salle compatibility.


package com.sallie.feature.device

import android.app.Activity
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.sallie.ai.nlpEngine
import com.sallie.core.PluginRegistry
import com.sallie.core.device.DeviceControlFacade
import com.sallie.core.values.ValuesSystem
import com.sallie.ui.device.DeviceControlView
import kotlinx.coroutines.launch

/**
 * Demo activity to showcase the Device Integration & Control System
 */
class DeviceControlDemoActivity : AppCompatActivity() {
    
    private lateinit var deviceControlView: DeviceControlView
    private lateinit var deviceControlFacade: DeviceControlFacade
    private lateinit var voiceController: DeviceVoiceController
    private lateinit var demoOutput: TextView
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_device_control_demo)
        
        // Set up UI
        deviceControlView = findViewById(R.id.device_control_view)
        demoOutput = findViewById(R.id.demo_output)
        
        // Set up demo buttons
        setupDemoButtons()
        
        // Initialize the device control system
        initializeDeviceControl()
    }
    
    private fun initializeDeviceControl() {
        lifecycleScope.launch {
            try {
                // Get dependencies
                val pluginRegistry = PluginRegistry.getInstance(this@DeviceControlDemoActivity)
                val valuesSystem = ValuesSystem.getInstance(this@DeviceControlDemoActivity)
                
                // Initialize the facade
                deviceControlFacade = DeviceControlFacade.getInstance(
                    pluginRegistry,
                    valuesSystem,
                    lifecycleScope
                )
                
                // Initialize the system
                deviceControlFacade.initialize()
                
                // Set up the device control view
                deviceControlView.setDeviceControlFacade(deviceControlFacade)
                
                // Initialize the voice controller
                val nlpEngine = nlpEngine.getInstance(this@DeviceControlDemoActivity)
                voiceController = DeviceVoiceController(
                    deviceControlFacade,
                    nlpEngine,
                    lifecycleScope
                )
                
                // Discover some devices
                deviceControlFacade.discoverDevices { result ->
                    if (result.success) {
                        log("Discovered devices: ${result.message}")
                    } else {
                        log("Failed to discover devices: ${result.message}")
                    }
                }
                
            } catch (e: Exception) {
                log("Error initializing device control system: ${e.message}")
                Toast.makeText(
                    this@DeviceControlDemoActivity,
                    "Error: ${e.message}",
                    Toast.LENGTH_LONG
                ).show()
            }
        }
    }
    
    private fun setupDemoButtons() {
        val voiceCommandButton = findViewById<Button>(R.id.voice_command_button)
        voiceCommandButton.setOnClickListener {
            simulateVoiceCommand()
        }
        
        val createSceneButton = findViewById<Button>(R.id.create_scene_button)
        createSceneButton.setOnClickListener {
            createDemoScene()
        }
        
        val createRuleButton = findViewById<Button>(R.id.create_rule_button)
        createRuleButton.setOnClickListener {
            createDemoRule()
        }
    }
    
    /**
     * Simulate a voice command to demonstrate the voice control functionality
     */
    private fun simulateVoiceCommand() {
        if (!::voiceController.isInitialized) {
            log("Voice controller not initialized yet")
            return
        }
        
        // List of example voice commands
        val exampleCommands = listOf(
            "Turn on the living room lights",
            "Set the kitchen light brightness to 50%",
            "Turn off the bedroom lamp",
            "Set the thermostat to 22 degrees",
            "Lock the front door",
            "Unlock the back door",
            "Activate the movie night scene",
            "What devices do I have?",
            "Show me my scenes"
        )
        
        // Pick a random command
        val randomCommand = exampleCommands.random()
        
        log("Simulating voice command: \"$randomCommand\"")
        
        // Process the voice command
        voiceController.processVoiceCommand(randomCommand) { result ->
            log("Voice command result: ${result.message}")
            
            // Display visual feedback based on the result
            result.visualFeedback?.let { feedback ->
                when (feedback) {
                    is DeviceVoiceController.VisualFeedback.DeviceList -> {
                        val devices = feedback.deviceNames.joinToString("\n")
                        showVisualFeedback("Devices", devices)
                    }
                    is DeviceVoiceController.VisualFeedback.SceneList -> {
                        val scenes = feedback.sceneNames.joinToString("\n")
                        showVisualFeedback("Scenes", scenes)
                    }
                    is DeviceVoiceController.VisualFeedback.DeviceTurnedOn -> {
                        showVisualFeedback("Device Turned On", feedback.deviceName)
                    }
                    is DeviceVoiceController.VisualFeedback.DeviceTurnedOff -> {
                        showVisualFeedback("Device Turned Off", feedback.deviceName)
                    }
                    is DeviceVoiceController.VisualFeedback.BrightnessChanged -> {
                        showVisualFeedback(
                            "Brightness Changed",
                            "${feedback.deviceName}: ${feedback.brightness}%"
                        )
                    }
                    is DeviceVoiceController.VisualFeedback.TemperatureChanged -> {
                        showVisualFeedback(
                            "Temperature Changed",
                            "${feedback.deviceName}: ${feedback.temperature}°C"
                        )
                    }
                    is DeviceVoiceController.VisualFeedback.DeviceLocked -> {
                        showVisualFeedback("Device Locked", feedback.deviceName)
                    }
                    is DeviceVoiceController.VisualFeedback.DeviceUnlocked -> {
                        showVisualFeedback("Device Unlocked", feedback.deviceName)
                    }
                    is DeviceVoiceController.VisualFeedback.SceneActivated -> {
                        showVisualFeedback("Scene Activated", feedback.sceneName)
                    }
                }
            }
            
            // Refresh the device list to show any changes
            deviceControlView.loadDevices()
        }
    }
    
    /**
     * Create a demo scene
     */
    private fun createDemoScene() {
        if (!::deviceControlFacade.isInitialized) {
            log("Device control system not initialized yet")
            return
        }
        
        lifecycleScope.launch {
            try {
                // Get the device list first
                val devicesResult = suspendCallback<DeviceControlFacade.DeviceOperationResult> { callback ->
                    deviceControlFacade.getDevices(callback)
                }
                
                if (!devicesResult.success || devicesResult.data == null) {
                    log("Failed to get devices: ${devicesResult.message}")
                    return@launch
                }
                
                @Suppress("UNCHECKED_CAST")
                val devices = devicesResult.data as List<com.sallie.core.device.Device>
                
                if (devices.isEmpty()) {
                    log("No devices available to create a scene")
                    return@launch
                }
                
                // Create a scene using the devices
                val sceneName = "Demo Scene ${System.currentTimeMillis() % 1000}"
                
                // Find lights and set them to on with 80% brightness
                val lights = devices.filter { it.type == com.sallie.core.device.DeviceType.LIGHT }
                if (lights.isNotEmpty()) {
                    val lightIds = lights.map { it.id }
                    
                    // TODO: Actual scene creation API call would go here
                    log("Creating scene '$sceneName' with ${lightIds.size} lights at 80% brightness")
                    
                    // For demo purposes, log the devices that would be in the scene
                    val deviceNames = lights.joinToString(", ") { it.name }
                    log("Scene devices: $deviceNames")
                    
                    Toast.makeText(
                        this@DeviceControlDemoActivity,
                        "Created demo scene '$sceneName'",
                        Toast.LENGTH_SHORT
                    ).show()
                } else {
                    log("No light devices found to create a scene")
                }
                
            } catch (e: Exception) {
                log("Error creating scene: ${e.message}")
            }
        }
    }
    
    /**
     * Create a demo automation rule
     */
    private fun createDemoRule() {
        if (!::deviceControlFacade.isInitialized) {
            log("Device control system not initialized yet")
            return
        }
        
        lifecycleScope.launch {
            try {
                // Get the device list first
                val devicesResult = suspendCallback<DeviceControlFacade.DeviceOperationResult> { callback ->
                    deviceControlFacade.getDevices(callback)
                }
                
                if (!devicesResult.success || devicesResult.data == null) {
                    log("Failed to get devices: ${devicesResult.message}")
                    return@launch
                }
                
                @Suppress("UNCHECKED_CAST")
                val devices = devicesResult.data as List<com.sallie.core.device.Device>
                
                if (devices.isEmpty()) {
                    log("No devices available to create a rule")
                    return@launch
                }
                
                // Create a rule using the devices
                val ruleName = "Demo Rule ${System.currentTimeMillis() % 1000}"
                
                // Find a thermostat and a light for a simple temperature-based rule
                val thermostat = devices.find { it.type == com.sallie.core.device.DeviceType.THERMOSTAT }
                val light = devices.find { it.type == com.sallie.core.device.DeviceType.LIGHT }
                
                if (thermostat != null && light != null) {
                    // TODO: Actual rule creation API call would go here
                    log("Creating rule '$ruleName': When $thermostat.name temperature > 25°C, turn on $light.name")
                    
                    Toast.makeText(
                        this@DeviceControlDemoActivity,
                        "Created demo rule '$ruleName'",
                        Toast.LENGTH_SHORT
                    ).show()
                } else {
                    log("Couldn't find required devices (thermostat and light) for the rule")
                }
                
            } catch (e: Exception) {
                log("Error creating rule: ${e.message}")
            }
        }
    }
    
    /**
     * Helper to show visual feedback in the demo UI
     */
    private fun showVisualFeedback(title: String, content: String) {
        val message = "$title:\n$content"
        
        runOnUiThread {
            Toast.makeText(this, title, Toast.LENGTH_SHORT).show()
        }
        
        log(message)
    }
    
    /**
     * Helper to log messages to the demo output and console
     */
    private fun log(message: String) {
        Log.d("DeviceControlDemo", message)
        
        runOnUiThread {
            demoOutput.append("\n$message")
            
            // Auto-scroll to bottom
            val scrollView = findViewById<androidx.core.widget.NestedScrollView>(R.id.scroll_view)
            scrollView.post {
                scrollView.fullScroll(androidx.core.widget.NestedScrollView.FOCUS_DOWN)
            }
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
}


package com.sallie.feature.device

import android.app.Activity
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.sallie.ai.nlpEngine
import com.sallie.core.PluginRegistry
import com.sallie.core.device.DeviceControlFacade
import com.sallie.core.values.ValuesSystem
import com.sallie.ui.device.DeviceControlView
import kotlinx.coroutines.launch

/**
 * Demo activity to showcase the Device Integration & Control System
 */
class DeviceControlDemoActivity : AppCompatActivity() {
    
    private lateinit var deviceControlView: DeviceControlView
    private lateinit var deviceControlFacade: DeviceControlFacade
    private lateinit var voiceController: DeviceVoiceController
    private lateinit var demoOutput: TextView
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_device_control_demo)
        
        // Set up UI
        deviceControlView = findViewById(R.id.device_control_view)
        demoOutput = findViewById(R.id.demo_output)
        
        // Set up demo buttons
        setupDemoButtons()
        
        // Initialize the device control system
        initializeDeviceControl()
    }
    
    private fun initializeDeviceControl() {
        lifecycleScope.launch {
            try {
                // Get dependencies
                val pluginRegistry = PluginRegistry.getInstance(this@DeviceControlDemoActivity)
                val valuesSystem = ValuesSystem.getInstance(this@DeviceControlDemoActivity)
                
                // Initialize the facade
                deviceControlFacade = DeviceControlFacade.getInstance(
                    pluginRegistry,
                    valuesSystem,
                    lifecycleScope
                )
                
                // Initialize the system
                deviceControlFacade.initialize()
                
                // Set up the device control view
                deviceControlView.setDeviceControlFacade(deviceControlFacade)
                
                // Initialize the voice controller
                val nlpEngine = nlpEngine.getInstance(this@DeviceControlDemoActivity)
                voiceController = DeviceVoiceController(
                    deviceControlFacade,
                    nlpEngine,
                    lifecycleScope
                )
                
                // Discover some devices
                deviceControlFacade.discoverDevices { result ->
                    if (result.success) {
                        log("Discovered devices: ${result.message}")
                    } else {
                        log("Failed to discover devices: ${result.message}")
                    }
                }
                
            } catch (e: Exception) {
                log("Error initializing device control system: ${e.message}")
                Toast.makeText(
                    this@DeviceControlDemoActivity,
                    "Error: ${e.message}",
                    Toast.LENGTH_LONG
                ).show()
            }
        }
    }
    
    private fun setupDemoButtons() {
        val voiceCommandButton = findViewById<Button>(R.id.voice_command_button)
        voiceCommandButton.setOnClickListener {
            simulateVoiceCommand()
        }
        
        val createSceneButton = findViewById<Button>(R.id.create_scene_button)
        createSceneButton.setOnClickListener {
            createDemoScene()
        }
        
        val createRuleButton = findViewById<Button>(R.id.create_rule_button)
        createRuleButton.setOnClickListener {
            createDemoRule()
        }
    }
    
    /**
     * Simulate a voice command to demonstrate the voice control functionality
     */
    private fun simulateVoiceCommand() {
        if (!::voiceController.isInitialized) {
            log("Voice controller not initialized yet")
            return
        }
        
        // List of example voice commands
        val exampleCommands = listOf(
            "Turn on the living room lights",
            "Set the kitchen light brightness to 50%",
            "Turn off the bedroom lamp",
            "Set the thermostat to 22 degrees",
            "Lock the front door",
            "Unlock the back door",
            "Activate the movie night scene",
            "What devices do I have?",
            "Show me my scenes"
        )
        
        // Pick a random command
        val randomCommand = exampleCommands.random()
        
        log("Simulating voice command: \"$randomCommand\"")
        
        // Process the voice command
        voiceController.processVoiceCommand(randomCommand) { result ->
            log("Voice command result: ${result.message}")
            
            // Display visual feedback based on the result
            result.visualFeedback?.let { feedback ->
                when (feedback) {
                    is DeviceVoiceController.VisualFeedback.DeviceList -> {
                        val devices = feedback.deviceNames.joinToString("\n")
                        showVisualFeedback("Devices", devices)
                    }
                    is DeviceVoiceController.VisualFeedback.SceneList -> {
                        val scenes = feedback.sceneNames.joinToString("\n")
                        showVisualFeedback("Scenes", scenes)
                    }
                    is DeviceVoiceController.VisualFeedback.DeviceTurnedOn -> {
                        showVisualFeedback("Device Turned On", feedback.deviceName)
                    }
                    is DeviceVoiceController.VisualFeedback.DeviceTurnedOff -> {
                        showVisualFeedback("Device Turned Off", feedback.deviceName)
                    }
                    is DeviceVoiceController.VisualFeedback.BrightnessChanged -> {
                        showVisualFeedback(
                            "Brightness Changed",
                            "${feedback.deviceName}: ${feedback.brightness}%"
                        )
                    }
                    is DeviceVoiceController.VisualFeedback.TemperatureChanged -> {
                        showVisualFeedback(
                            "Temperature Changed",
                            "${feedback.deviceName}: ${feedback.temperature}°C"
                        )
                    }
                    is DeviceVoiceController.VisualFeedback.DeviceLocked -> {
                        showVisualFeedback("Device Locked", feedback.deviceName)
                    }
                    is DeviceVoiceController.VisualFeedback.DeviceUnlocked -> {
                        showVisualFeedback("Device Unlocked", feedback.deviceName)
                    }
                    is DeviceVoiceController.VisualFeedback.SceneActivated -> {
                        showVisualFeedback("Scene Activated", feedback.sceneName)
                    }
                }
            }
            
            // Refresh the device list to show any changes
            deviceControlView.loadDevices()
        }
    }
    
    /**
     * Create a demo scene
     */
    private fun createDemoScene() {
        if (!::deviceControlFacade.isInitialized) {
            log("Device control system not initialized yet")
            return
        }
        
        lifecycleScope.launch {
            try {
                // Get the device list first
                val devicesResult = suspendCallback<DeviceControlFacade.DeviceOperationResult> { callback ->
                    deviceControlFacade.getDevices(callback)
                }
                
                if (!devicesResult.success || devicesResult.data == null) {
                    log("Failed to get devices: ${devicesResult.message}")
                    return@launch
                }
                
                @Suppress("UNCHECKED_CAST")
                val devices = devicesResult.data as List<com.sallie.core.device.Device>
                
                if (devices.isEmpty()) {
                    log("No devices available to create a scene")
                    return@launch
                }
                
                // Create a scene using the devices
                val sceneName = "Demo Scene ${System.currentTimeMillis() % 1000}"
                
                // Find lights and set them to on with 80% brightness
                val lights = devices.filter { it.type == com.sallie.core.device.DeviceType.LIGHT }
                if (lights.isNotEmpty()) {
                    val lightIds = lights.map { it.id }
                    
                    // TODO: Actual scene creation API call would go here
                    log("Creating scene '$sceneName' with ${lightIds.size} lights at 80% brightness")
                    
                    // For demo purposes, log the devices that would be in the scene
                    val deviceNames = lights.joinToString(", ") { it.name }
                    log("Scene devices: $deviceNames")
                    
                    Toast.makeText(
                        this@DeviceControlDemoActivity,
                        "Created demo scene '$sceneName'",
                        Toast.LENGTH_SHORT
                    ).show()
                } else {
                    log("No light devices found to create a scene")
                }
                
            } catch (e: Exception) {
                log("Error creating scene: ${e.message}")
            }
        }
    }
    
    /**
     * Create a demo automation rule
     */
    private fun createDemoRule() {
        if (!::deviceControlFacade.isInitialized) {
            log("Device control system not initialized yet")
            return
        }
        
        lifecycleScope.launch {
            try {
                // Get the device list first
                val devicesResult = suspendCallback<DeviceControlFacade.DeviceOperationResult> { callback ->
                    deviceControlFacade.getDevices(callback)
                }
                
                if (!devicesResult.success || devicesResult.data == null) {
                    log("Failed to get devices: ${devicesResult.message}")
                    return@launch
                }
                
                @Suppress("UNCHECKED_CAST")
                val devices = devicesResult.data as List<com.sallie.core.device.Device>
                
                if (devices.isEmpty()) {
                    log("No devices available to create a rule")
                    return@launch
                }
                
                // Create a rule using the devices
                val ruleName = "Demo Rule ${System.currentTimeMillis() % 1000}"
                
                // Find a thermostat and a light for a simple temperature-based rule
                val thermostat = devices.find { it.type == com.sallie.core.device.DeviceType.THERMOSTAT }
                val light = devices.find { it.type == com.sallie.core.device.DeviceType.LIGHT }
                
                if (thermostat != null && light != null) {
                    // TODO: Actual rule creation API call would go here
                    log("Creating rule '$ruleName': When $thermostat.name temperature > 25°C, turn on $light.name")
                    
                    Toast.makeText(
                        this@DeviceControlDemoActivity,
                        "Created demo rule '$ruleName'",
                        Toast.LENGTH_SHORT
                    ).show()
                } else {
                    log("Couldn't find required devices (thermostat and light) for the rule")
                }
                
            } catch (e: Exception) {
                log("Error creating rule: ${e.message}")
            }
        }
    }
    
    /**
     * Helper to show visual feedback in the demo UI
     */
    private fun showVisualFeedback(title: String, content: String) {
        val message = "$title:\n$content"
        
        runOnUiThread {
            Toast.makeText(this, title, Toast.LENGTH_SHORT).show()
        }
        
        log(message)
    }
    
    /**
     * Helper to log messages to the demo output and console
     */
    private fun log(message: String) {
        Log.d("DeviceControlDemo", message)
        
        runOnUiThread {
            demoOutput.append("\n$message")
            
            // Auto-scroll to bottom
            val scrollView = findViewById<androidx.core.widget.NestedScrollView>(R.id.scroll_view)
            scrollView.post {
                scrollView.fullScroll(androidx.core.widget.NestedScrollView.FOCUS_DOWN)
            }
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
}


/*
 * Persona: Tough love meets soul care.
 * Module: DeviceControlDemoActivity
 * Intent: Handle functionality for DeviceControlDemoActivity
 * Provenance-ID: 7c2775b7-bf3a-457a-be6a-56c62e49fdf6
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

// Salle Persona Module
// DeviceControlDemoActivity.kt
// Migrated for reference only. Not integrated into JS runtime.

// ✔ Enhanced logic added: If needed, port logic to JS for Salle compatibility.


// Salle Persona Module
// DeviceControlDemoActivity.kt
// Migrated for reference only. Not integrated into JS runtime.

// TODO: If needed, port logic to JS for Salle compatibility.

package com.sallie.core.device

import com.sallie.core.values.ValuesSystem
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.time.Instant
import java.util.*
import java.util.concurrent.ConcurrentHashMap

/**
 * Primary implementation of the DeviceControlSystemInterface.
 * Manages device discovery, control, and automation.
 */
class EnhancedDeviceControlSystem(
    private val scope: CoroutineScope,
    private val valuesSystem: ValuesSystem
) : DeviceControlSystemInterface {

    private val deviceConnectors = ConcurrentHashMap<DeviceProtocol, DeviceConnector>()
    private val knownDevices = ConcurrentHashMap<String, Device>()
    private val deviceStates = ConcurrentHashMap<String, DeviceState>()
    private val automationRules = ConcurrentHashMap<String, AutomationRule>()
    private val scenes = ConcurrentHashMap<String, Scene>()
    
    private val deviceStateFlow = MutableSharedFlow<DeviceState>()
    private val deviceMutex = Mutex()
    private val ruleMutex = Mutex()
    private val sceneMutex = Mutex()
    
    private val json = Json { ignoreUnknownKeys = true }
    private val automationEngine = DeviceAutomationEngine(scope, this)
    
    /**
     * Initialize the device control system
     */
    override suspend fun initialize() {
        // Register device connectors
        registerConnector(DeviceProtocol.WIFI, WiFiDeviceConnector(scope))
        registerConnector(DeviceProtocol.BLUETOOTH, BluetoothDeviceConnector(scope))
        registerConnector(DeviceProtocol.ZIGBEE, ZigbeeDeviceConnector(scope))
        registerConnector(DeviceProtocol.ZWAVE, ZWaveDeviceConnector(scope))
        
        // Initialize automation engine
        automationEngine.initialize()
        
        // Load persisted data
        loadPersistedData()
        
        // Start monitoring devices
        startDeviceMonitoring()
    }
    
    /**
     * Register a device connector for a specific protocol
     */
    private fun registerConnector(protocol: DeviceProtocol, connector: DeviceConnector) {
        deviceConnectors[protocol] = connector
        
        // Listen for device discoveries from this connector
        scope.launch(Dispatchers.IO) {
            connector.deviceDiscoveries.collect { device ->
                deviceMutex.withLock {
                    knownDevices[device.id] = device
                }
            }
        }
        
        // Listen for state updates from this connector
        scope.launch(Dispatchers.IO) {
            connector.stateUpdates.collect { state ->
                deviceStates[state.deviceId] = state
                deviceStateFlow.emit(state)
            }
        }
    }
    
    /**
     * Load persisted devices, rules, and scenes from storage
     */
    private suspend fun loadPersistedData() {
        // In a real implementation, this would load from a persistent store
        // For this demo, we'll initialize with some example data
        
        // Example devices
        val livingRoomLight = Device(
            id = "light-001",
            name = "Living Room Light",
            type = DeviceType.LIGHT,
            protocol = DeviceProtocol.WIFI,
            manufacturer = "Philips",
            model = "Hue White",
            firmware = "1.2.3",
            capabilities = setOf(
                DeviceCapability.POWER,
                DeviceCapability.BRIGHTNESS
            ),
            room = "Living Room",
            online = true
        )
        
        val kitchenThermostat = Device(
            id = "thermostat-001",
            name = "Kitchen Thermostat",
            type = DeviceType.THERMOSTAT,
            protocol = DeviceProtocol.ZIGBEE,
            manufacturer = "Nest",
            model = "Learning Thermostat",
            firmware = "5.6.7",
            capabilities = setOf(
                DeviceCapability.TEMPERATURE_SENSOR,
                DeviceCapability.TEMPERATURE_CONTROL,
                DeviceCapability.HUMIDITY_SENSOR
            ),
            room = "Kitchen",
            online = true
        )
        
        deviceMutex.withLock {
            knownDevices["light-001"] = livingRoomLight
            knownDevices["thermostat-001"] = kitchenThermostat
        }
        
        // Example device states
        val lightState = DeviceState(
            deviceId = "light-001",
            timestamp = Instant.now(),
            properties = mapOf(
                "power" to "ON",
                "brightness" to 80
            ),
            online = true
        )
        
        val thermostatState = DeviceState(
            deviceId = "thermostat-001",
            timestamp = Instant.now(),
            properties = mapOf(
                "temperature" to 22.5,
                "targetTemperature" to 21.0,
                "humidity" to 45
            ),
            online = true
        )
        
        deviceStates["light-001"] = lightState
        deviceStates["thermostat-001"] = thermostatState
        
        // Example scene
        val eveningScene = Scene(
            id = "scene-001",
            name = "Evening Mode",
            deviceStates = mapOf(
                "light-001" to mapOf(
                    "power" to "ON",
                    "brightness" to "50"
                ),
                "thermostat-001" to mapOf(
                    "targetTemperature" to "20.0"
                )
            ),
            icon = "evening",
            favorite = true,
            createdAt = System.currentTimeMillis(),
            updatedAt = System.currentTimeMillis()
        )
        
        sceneMutex.withLock {
            scenes["scene-001"] = eveningScene
        }
        
        // Example automation rule
        val eveningRule = AutomationRule(
            id = "rule-001",
            name = "Evening Mode Activation",
            enabled = true,
            triggers = listOf(
                json.encodeToString(Trigger.TimeTrigger("19:00"))
            ),
            actions = listOf(
                json.encodeToString(Action.SceneAction("scene-001"))
            ),
            createdAt = System.currentTimeMillis(),
            updatedAt = System.currentTimeMillis()
        )
        
        ruleMutex.withLock {
            automationRules["rule-001"] = eveningRule
        }
    }
    
    /**
     * Start monitoring connected devices
     */
    private fun startDeviceMonitoring() {
        scope.launch(Dispatchers.IO) {
            deviceConnectors.values.forEach { connector ->
                connector.initialize()
            }
        }
    }
    
    /**
     * Discover devices available on the network
     */
    override fun discoverDevices(protocols: List<DeviceProtocol>?): Flow<Device> = flow {
        val connectorsToUse = if (protocols != null) {
            deviceConnectors.filterKeys { it in protocols }.values
        } else {
            deviceConnectors.values
        }
        
        connectorsToUse.forEach { connector ->
            connector.startDiscovery()
        }
        
        // This flow is backed by the connectors' deviceDiscoveries flows
    }.catch { e ->
        // Log error
        println("Error during device discovery: ${e.message}")
    }
    
    /**
     * Get a list of all known devices
     */
    override suspend fun getDevices(): List<Device> {
        return deviceMutex.withLock {
            knownDevices.values.toList()
        }
    }
    
    /**
     * Get a device by its ID
     */
    override suspend fun getDevice(deviceId: String): Device? {
        return knownDevices[deviceId]
    }
    
    /**
     * Get devices by name
     */
    override suspend fun getDevicesByName(name: String): List<Device> {
        return deviceMutex.withLock {
            knownDevices.values.filter { 
                it.name.equals(name, ignoreCase = true) 
            }
        }
    }
    
    /**
     * Get devices by type
     */
    override suspend fun getDevicesByType(type: DeviceType): List<Device> {
        return deviceMutex.withLock {
            knownDevices.values.filter { it.type == type }
        }
    }
    
    /**
     * Execute a command on a device
     */
    override suspend fun executeCommand(deviceId: String, command: DeviceCommand): DeviceCommandResult {
        val device = knownDevices[deviceId] ?: return DeviceCommandResult(
            success = false,
            message = "Device not found",
            deviceId = deviceId,
            commandType = command.javaClass.simpleName,
            errorCode = 404
        )
        
        // Check if this command is allowed by the values system
        val permissionCheck = valuesSystem.checkPermission(
            action = "device.control",
            parameters = mapOf(
                "deviceId" to deviceId,
                "deviceName" to device.name,
                "deviceType" to device.type.name,
                "commandType" to command.javaClass.simpleName
            )
        )
        
        if (!permissionCheck.permitted) {
            return DeviceCommandResult(
                success = false,
                message = "Command not permitted: ${permissionCheck.reason}",
                deviceId = deviceId,
                commandType = command.javaClass.simpleName,
                errorCode = 403
            )
        }
        
        // Find the appropriate connector for this device
        val connector = deviceConnectors[device.protocol]
        
        return if (connector != null) {
            try {
                val result = connector.executeCommand(device, command)
                
                // Update device state if command was successful
                if (result.success) {
                    val currentState = deviceStates[deviceId]
                    if (currentState != null) {
                        val updatedProperties = updateStateProperties(currentState.properties, command)
                        val newState = currentState.copy(
                            properties = updatedProperties,
                            timestamp = Instant.now()
                        )
                        deviceStates[deviceId] = newState
                        deviceStateFlow.emit(newState)
                    }
                }
                
                result
            } catch (e: Exception) {
                DeviceCommandResult(
                    success = false,
                    message = "Error executing command: ${e.message}",
                    deviceId = deviceId,
                    commandType = command.javaClass.simpleName,
                    errorCode = 500
                )
            }
        } else {
            DeviceCommandResult(
                success = false,
                message = "No connector available for protocol ${device.protocol}",
                deviceId = deviceId,
                commandType = command.javaClass.simpleName,
                errorCode = 501
            )
        }
    }
    
    /**
     * Update state properties based on the executed command
     */
    private fun updateStateProperties(
        currentProperties: Map<String, Any>,
        command: DeviceCommand
    ): Map<String, Any> {
        val mutableProps = currentProperties.toMutableMap()
        
        when (command) {
            is DeviceCommand.PowerCommand -> {
                mutableProps["power"] = if (command.on) "ON" else "OFF"
            }
            is DeviceCommand.BrightnessCommand -> {
                mutableProps["brightness"] = command.brightness
            }
            is DeviceCommand.ColorCommand -> {
                mutableProps["red"] = command.red
                mutableProps["green"] = command.green
                mutableProps["blue"] = command.blue
            }
            is DeviceCommand.ColorTemperatureCommand -> {
                mutableProps["colorTemperature"] = command.temperature
            }
            is DeviceCommand.SetTemperatureCommand -> {
                mutableProps["targetTemperature"] = command.temperature
            }
            is DeviceCommand.LockCommand -> {
                mutableProps["locked"] = command.locked
            }
            is DeviceCommand.VolumeCommand -> {
                mutableProps["volume"] = command.volume
            }
            is DeviceCommand.MediaCommand -> {
                mutableProps["mediaAction"] = command.action.name
            }
            is DeviceCommand.PanTiltCommand -> {
                mutableProps["pan"] = command.pan
                mutableProps["tilt"] = command.tilt
            }
            is DeviceCommand.CustomCommand -> {
                command.parameters.forEach { (key, value) ->
                    mutableProps[key] = value
                }
            }
        }
        
        return mutableProps
    }
    
    /**
     * Monitor device state changes
     */
    override fun monitorDeviceState(deviceId: String?): Flow<DeviceState> {
        return if (deviceId != null) {
            deviceStateFlow.filter { it.deviceId == deviceId }
        } else {
            deviceStateFlow
        }
    }
    
    /**
     * Create an automation rule
     */
    override suspend fun createRule(rule: AutomationRule): AutomationRule {
        val ruleWithId = if (rule.id.isBlank()) {
            rule.copy(id = generateId("rule"))
        } else {
            rule
        }
        
        ruleMutex.withLock {
            automationRules[ruleWithId.id] = ruleWithId
            
            // Register with automation engine if enabled
            if (ruleWithId.enabled) {
                automationEngine.registerRule(ruleWithId)
            }
        }
        
        return ruleWithId
    }
    
    /**
     * Update an existing automation rule
     */
    override suspend fun updateRule(rule: AutomationRule): Boolean {
        return ruleMutex.withLock {
            if (automationRules.containsKey(rule.id)) {
                val oldRule = automationRules[rule.id]
                automationRules[rule.id] = rule.copy(updatedAt = System.currentTimeMillis())
                
                // Update in automation engine
                if (oldRule?.enabled == true) {
                    automationEngine.unregisterRule(oldRule.id)
                }
                
                if (rule.enabled) {
                    automationEngine.registerRule(rule)
                }
                
                true
            } else {
                false
            }
        }
    }
    
    /**
     * Delete an automation rule
     */
    override suspend fun deleteRule(ruleId: String): Boolean {
        return ruleMutex.withLock {
            if (automationRules.containsKey(ruleId)) {
                val rule = automationRules[ruleId]
                automationRules.remove(ruleId)
                
                // Remove from automation engine
                if (rule?.enabled == true) {
                    automationEngine.unregisterRule(ruleId)
                }
                
                true
            } else {
                false
            }
        }
    }
    
    /**
     * Get all automation rules
     */
    override suspend fun getRules(): List<AutomationRule> {
        return ruleMutex.withLock {
            automationRules.values.toList()
        }
    }
    
    /**
     * Trigger a specific rule manually
     */
    override suspend fun triggerRule(ruleId: String): RuleExecutionResult {
        val rule = ruleMutex.withLock {
            automationRules[ruleId]
        } ?: return RuleExecutionResult(
            success = false,
            message = "Rule not found",
            ruleId = ruleId,
            actionResults = emptyList()
        )
        
        return automationEngine.executeRule(rule)
    }
    
    /**
     * Create a scene
     */
    override suspend fun createScene(scene: Scene): Scene {
        val sceneWithId = if (scene.id.isBlank()) {
            scene.copy(id = generateId("scene"))
        } else {
            scene
        }
        
        sceneMutex.withLock {
            scenes[sceneWithId.id] = sceneWithId
        }
        
        return sceneWithId
    }
    
    /**
     * Update an existing scene
     */
    override suspend fun updateScene(scene: Scene): Boolean {
        return sceneMutex.withLock {
            if (scenes.containsKey(scene.id)) {
                scenes[scene.id] = scene.copy(updatedAt = System.currentTimeMillis())
                true
            } else {
                false
            }
        }
    }
    
    /**
     * Delete a scene
     */
    override suspend fun deleteScene(sceneId: String): Boolean {
        return sceneMutex.withLock {
            scenes.remove(sceneId) != null
        }
    }
    
    /**
     * Get all scenes
     */
    override suspend fun getScenes(): List<Scene> {
        return sceneMutex.withLock {
            scenes.values.toList()
        }
    }
    
    /**
     * Execute a scene
     */
    override suspend fun executeScene(sceneId: String): SceneExecutionResult {
        val scene = sceneMutex.withLock {
            scenes[sceneId]
        } ?: return SceneExecutionResult(
            success = false,
            message = "Scene not found",
            sceneId = sceneId,
            deviceResults = emptyMap()
        )
        
        val results = mutableMapOf<String, Boolean>()
        var allSuccess = true
        
        // Execute each device state in the scene
        for ((deviceId, stateMap) in scene.deviceStates) {
            val device = knownDevices[deviceId]
            
            if (device == null) {
                results[deviceId] = false
                allSuccess = false
                continue
            }
            
            // Convert state map to appropriate commands
            val commands = stateMapToCommands(stateMap)
            
            // Execute each command
            var deviceSuccess = true
            for (command in commands) {
                val result = executeCommand(deviceId, command)
                if (!result.success) {
                    deviceSuccess = false
                    allSuccess = false
                    break
                }
            }
            
            results[deviceId] = deviceSuccess
        }
        
        // Update scene's last executed time
        if (allSuccess) {
            sceneMutex.withLock {
                scenes[sceneId] = scene.copy(
                    lastExecuted = System.currentTimeMillis(),
                    updatedAt = scene.updatedAt
                )
            }
        }
        
        return SceneExecutionResult(
            success = allSuccess,
            message = if (allSuccess) "Scene executed successfully" else "Some devices failed to execute",
            sceneId = sceneId,
            deviceResults = results
        )
    }
    
    /**
     * Convert a map of state properties to device commands
     */
    private fun stateMapToCommands(stateMap: Map<String, String>): List<DeviceCommand> {
        val commands = mutableListOf<DeviceCommand>()
        
        stateMap.forEach { (property, value) ->
            when (property) {
                "power" -> {
                    commands.add(DeviceCommand.PowerCommand(value.equals("ON", ignoreCase = true)))
                }
                "brightness" -> {
                    val brightness = value.toIntOrNull()
                    if (brightness != null) {
                        commands.add(DeviceCommand.BrightnessCommand(brightness))
                    }
                }
                "targetTemperature" -> {
                    val temperature = value.toDoubleOrNull()
                    if (temperature != null) {
                        commands.add(DeviceCommand.SetTemperatureCommand(temperature))
                    }
                }
                "locked" -> {
                    commands.add(DeviceCommand.LockCommand(value.toBoolean()))
                }
                "volume" -> {
                    val volume = value.toIntOrNull()
                    if (volume != null) {
                        commands.add(DeviceCommand.VolumeCommand(volume))
                    }
                }
                "mediaAction" -> {
                    try {
                        val action = DeviceCommand.MediaAction.valueOf(value.uppercase())
                        commands.add(DeviceCommand.MediaCommand(action))
                    } catch (e: IllegalArgumentException) {
                        // Invalid media action, ignore
                    }
                }
                "colorTemperature" -> {
                    val temperature = value.toIntOrNull()
                    if (temperature != null) {
                        commands.add(DeviceCommand.ColorTemperatureCommand(temperature))
                    }
                }
                // Custom properties can be handled here
            }
        }
        
        return commands
    }
    
    /**
     * Generate a unique ID
     */
    private fun generateId(prefix: String): String {
        return "$prefix-${UUID.randomUUID().toString().substring(0, 8)}"
    }
}

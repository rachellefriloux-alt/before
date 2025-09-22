/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * Enhanced DeviceControlSystem Implementation
 */

package com.sallie.device

import com.sallie.core.PluginRegistry
import com.sallie.core.featureFlags
import com.sallie.core.runtimeConsent
import com.sallie.core.ValuesSystem
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeout
import java.util.concurrent.ConcurrentHashMap
import kotlin.time.Duration.Companion.seconds

/**
 * System states for the device control
 */
enum class DeviceControlState {
    INITIALIZING,
    IDLE,
    DISCOVERING,
    BUSY,
    ERROR,
    SHUTTING_DOWN,
    DISABLED
}

/**
 * Types of device events
 */
enum class DeviceEventType {
    DEVICE_DISCOVERED,
    DEVICE_CONNECTED,
    DEVICE_DISCONNECTED,
    DEVICE_STATE_CHANGED,
    DEVICE_ERROR,
    SYSTEM_INITIALIZED,
    SYSTEM_SHUTDOWN,
    PERMISSION_DENIED,
    AUTOMATION_TRIGGERED,
    SCENE_ACTIVATED
}

/**
 * Device event classes
 */
sealed class DeviceEvent {
    data class DeviceDiscoveryEvent(
        val deviceId: String,
        val deviceName: String,
        val deviceType: DeviceType,
        val protocol: DeviceProtocol
    ) : DeviceEvent()
    
    data class DeviceStateChangedEvent(
        val deviceId: String,
        val property: String,
        val value: Any,
        val previousValue: Any?
    ) : DeviceEvent()
    
    data class DeviceErrorEvent(
        val deviceId: String,
        val error: String
    ) : DeviceEvent()
    
    data class SystemEvent(
        val type: DeviceEventType,
        val message: String
    ) : DeviceEvent()
    
    data class SecurityEvent(
        val type: DeviceEventType,
        val message: String
    ) : DeviceEvent()
    
    data class AutomationEvent(
        val ruleId: String,
        val ruleName: String,
        val triggered: Boolean,
        val actions: List<String>
    ) : DeviceEvent()
    
    data class SceneEvent(
        val sceneId: String,
        val sceneName: String,
        val activated: Boolean
    ) : DeviceEvent()
    
    data class ErrorEvent(
        val error: Throwable,
        val message: String
    ) : DeviceEvent()
}

/**
 * Device state update
 */
data class DeviceStateUpdate(
    val deviceId: String,
    val property: String,
    val value: Any,
    val previousValue: Any?,
    val timestamp: Long = System.currentTimeMillis()
)

/**
 * Enhanced Device Control System that manages interactions with smart devices
 */
class EnhancedDeviceControlSystem(
    private val pluginRegistry: PluginRegistry,
    private val valuesSystem: ValuesSystem
) : DeviceControlSystem {
    
    // Coroutine scope for device operations
    private val deviceScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    
    // Device registry
    private val deviceRegistry = ConcurrentHashMap<String, SmartDevice>()
    
    // Protocol connectors
    private val connectors = mutableMapOf<DeviceProtocol, DeviceConnector>()
    
    // System state
    private val _systemState = MutableStateFlow(DeviceControlState.INITIALIZING)
    override val systemState: StateFlow<DeviceControlState> = _systemState.asStateFlow()
    
    // Device events
    private val _deviceEvents = MutableSharedFlow<DeviceEvent>(replay = 10)
    override val deviceEvents: SharedFlow<DeviceEvent> = _deviceEvents.asSharedFlow()
    
    // Device updates for automation engine
    private val _deviceUpdates = MutableSharedFlow<DeviceStateUpdate>(replay = 20)
    override val deviceUpdates: SharedFlow<DeviceStateUpdate> = _deviceUpdates.asSharedFlow()
    
    // Automation engine
    private lateinit var automationEngine: DeviceAutomationEngine
    
    /**
     * Initialize the device control system
     */
    override suspend fun initialize() {
        try {
            _systemState.value = DeviceControlState.INITIALIZING
            
            // Check if feature is enabled
            if (!featureFlags.isEnabled("device_control")) {
                _systemState.value = DeviceControlState.DISABLED
                return
            }
            
            // Request necessary permissions
            val permissionGranted = runtimeConsent.requestPermission(
                "device_control",
                "Sallie needs permission to discover and control smart devices on your network. " +
                "This will allow Sallie to help you manage your smart home devices."
            )
            
            if (!permissionGranted) {
                _systemState.value = DeviceControlState.DISABLED
                return
            }
            
            // Register protocol connectors
            registerConnectors()
            
            // Initialize automation engine
            automationEngine = DeviceAutomationEngine(this)
            
            // Create some default rules
            automationEngine.createDefaultRules()
            
            _systemState.value = DeviceControlState.IDLE
            
            // Emit initialization event
            _deviceEvents.emit(
                DeviceEvent.SystemEvent(
                    type = DeviceEventType.SYSTEM_INITIALIZED,
                    message = "Device control system initialized successfully"
                )
            )
            
        } catch (e: Exception) {
            _systemState.value = DeviceControlState.ERROR
            _deviceEvents.emit(
                DeviceEvent.ErrorEvent(
                    error = e,
                    message = "Failed to initialize device control system: ${e.message}"
                )
            )
        }
    }
    
    /**
     * Shut down the device control system
     */
    override suspend fun shutdown() {
        try {
            _systemState.value = DeviceControlState.SHUTTING_DOWN
            
            // Disconnect all devices
            deviceRegistry.keys.forEach { deviceId ->
                disconnectDevice(deviceId)
            }
            
            // Clear device registry
            deviceRegistry.clear()
            
            _systemState.value = DeviceControlState.DISABLED
            
            // Emit shutdown event
            _deviceEvents.emit(
                DeviceEvent.SystemEvent(
                    type = DeviceEventType.SYSTEM_SHUTDOWN,
                    message = "Device control system shut down successfully"
                )
            )
            
        } catch (e: Exception) {
            _systemState.value = DeviceControlState.ERROR
            _deviceEvents.emit(
                DeviceEvent.ErrorEvent(
                    error = e,
                    message = "Error shutting down device control system: ${e.message}"
                )
            )
        }
    }
    
    /**
     * Register device connectors for different protocols
     */
    private fun registerConnectors() {
        connectors[DeviceProtocol.WIFI] = WiFiDeviceConnector()
        connectors[DeviceProtocol.BLUETOOTH] = BluetoothDeviceConnector()
        connectors[DeviceProtocol.ZIGBEE] = ZigBeeDeviceConnector()
        connectors[DeviceProtocol.ZWAVE] = ZWaveDeviceConnector()
        
        // Note: Thread, Matter and Proprietary protocols would need their own connectors
        // in a full implementation
    }
    
    /**
     * Discover devices for the specified protocols
     */
    override suspend fun discoverDevices(
        protocols: Set<DeviceProtocol>,
        timeoutMs: Long
    ): List<SmartDevice> {
        try {
            _systemState.value = DeviceControlState.DISCOVERING
            
            val discoveredDevices = mutableListOf<SmartDevice>()
            
            // Filter only available connectors
            val availableConnectors = protocols
                .filter { connectors.containsKey(it) }
                .map { connectors[it]!! }
            
            // Discover devices for each protocol
            availableConnectors.forEach { connector ->
                val devices = withTimeout(timeoutMs) {
                    connector.discoverDevices(timeoutMs)
                }
                
                // Add to discovered list and registry
                devices.forEach { device ->
                    discoveredDevices.add(device)
                    deviceRegistry[device.id] = device
                    
                    // Emit device found event
                    deviceScope.launch {
                        _deviceEvents.emit(
                            DeviceEvent.DeviceDiscoveryEvent(
                                deviceId = device.id,
                                deviceName = device.name,
                                deviceType = device.type,
                                protocol = device.protocol
                            )
                        )
                    }
                }
            }
            
            _systemState.value = DeviceControlState.IDLE
            return discoveredDevices
            
        } catch (e: Exception) {
            _systemState.value = DeviceControlState.ERROR
            _deviceEvents.emit(
                DeviceEvent.ErrorEvent(
                    error = e,
                    message = "Error during device discovery: ${e.message}"
                )
            )
            return emptyList()
        }
    }
    
    /**
     * Get a list of all known devices
     */
    override fun getAllDevices(): List<SmartDevice> {
        return deviceRegistry.values.toList()
    }
    
    /**
     * Get a device by ID
     */
    override fun getDevice(deviceId: String): SmartDevice? {
        return deviceRegistry[deviceId]
    }
    
    /**
     * Connect to a device
     */
    override suspend fun connectDevice(deviceId: String): Boolean {
        val device = deviceRegistry[deviceId] ?: return false
        val connector = connectors[device.protocol] ?: return false
        
        return try {
            _systemState.value = DeviceControlState.BUSY
            
            val success = connector.connectToDevice(device)
            
            if (success) {
                // Update device in registry with connected state
                val updatedDevice = device.copy(lastConnected = System.currentTimeMillis())
                deviceRegistry[deviceId] = updatedDevice
                
                // Emit connected event
                _deviceEvents.emit(
                    DeviceEvent.SystemEvent(
                        type = DeviceEventType.DEVICE_CONNECTED,
                        message = "Connected to device: ${device.name}"
                    )
                )
            } else {
                _deviceEvents.emit(
                    DeviceEvent.DeviceErrorEvent(
                        deviceId = deviceId,
                        error = "Failed to connect to device: ${device.name}"
                    )
                )
            }
            
            _systemState.value = DeviceControlState.IDLE
            success
            
        } catch (e: Exception) {
            _systemState.value = DeviceControlState.ERROR
            _deviceEvents.emit(
                DeviceEvent.ErrorEvent(
                    error = e,
                    message = "Error connecting to device ${device.name}: ${e.message}"
                )
            )
            false
        }
    }
    
    /**
     * Disconnect from a device
     */
    override suspend fun disconnectDevice(deviceId: String): Boolean {
        val device = deviceRegistry[deviceId] ?: return false
        val connector = connectors[device.protocol] ?: return false
        
        return try {
            _systemState.value = DeviceControlState.BUSY
            
            val success = connector.disconnectFromDevice(device)
            
            if (success) {
                // Emit disconnected event
                _deviceEvents.emit(
                    DeviceEvent.SystemEvent(
                        type = DeviceEventType.DEVICE_DISCONNECTED,
                        message = "Disconnected from device: ${device.name}"
                    )
                )
            } else {
                _deviceEvents.emit(
                    DeviceEvent.DeviceErrorEvent(
                        deviceId = deviceId,
                        error = "Failed to disconnect from device: ${device.name}"
                    )
                )
            }
            
            _systemState.value = DeviceControlState.IDLE
            success
            
        } catch (e: Exception) {
            _systemState.value = DeviceControlState.ERROR
            _deviceEvents.emit(
                DeviceEvent.ErrorEvent(
                    error = e,
                    message = "Error disconnecting from device ${device.name}: ${e.message}"
                )
            )
            false
        }
    }
    
    /**
     * Control a device property
     */
    override suspend fun controlDevice(deviceId: String, property: String, value: Any): DeviceOperationResult {
        val device = deviceRegistry[deviceId] ?: return DeviceOperationResult.Error("Device not found")
        val connector = connectors[device.protocol] ?: return DeviceOperationResult.Error("Protocol not supported")
        
        // Check if the operation is value-aligned
        val permissionCheck = checkDeviceControlPermission(device, property, value)
        if (permissionCheck != null) {
            return permissionCheck
        }
        
        return try {
            _systemState.value = DeviceControlState.BUSY
            
            // Get previous value
            val previousValue = device.state[property]
            
            // Send command to device
            val result = connector.controlDevice(device, property, value)
            
            if (result is DeviceOperationResult.Success) {
                // Update device in registry
                val updatedState = result.newState
                val updatedDevice = device.copy(state = updatedState)
                deviceRegistry[deviceId] = updatedDevice
                
                // Emit state changed event
                _deviceEvents.emit(
                    DeviceEvent.DeviceStateChangedEvent(
                        deviceId = deviceId,
                        property = property,
                        value = value,
                        previousValue = previousValue
                    )
                )
                
                // Emit device update for automation
                _deviceUpdates.emit(
                    DeviceStateUpdate(
                        deviceId = deviceId,
                        property = property,
                        value = value,
                        previousValue = previousValue
                    )
                )
            } else {
                _deviceEvents.emit(
                    DeviceEvent.DeviceErrorEvent(
                        deviceId = deviceId,
                        error = "Failed to control device: ${device.name}, property: $property"
                    )
                )
            }
            
            _systemState.value = DeviceControlState.IDLE
            result
            
        } catch (e: Exception) {
            _systemState.value = DeviceControlState.ERROR
            _deviceEvents.emit(
                DeviceEvent.ErrorEvent(
                    error = e,
                    message = "Error controlling device ${device.name}: ${e.message}"
                )
            )
            DeviceOperationResult.Error("Exception: ${e.message}")
        }
    }
    
    /**
     * Query the current state of a device
     */
    override suspend fun queryDeviceState(deviceId: String): Map<String, Any>? {
        val device = deviceRegistry[deviceId] ?: return null
        val connector = connectors[device.protocol] ?: return null
        
        return try {
            _systemState.value = DeviceControlState.BUSY
            
            val state = connector.queryDeviceState(device)
            
            if (state != null) {
                // Update device in registry
                val updatedDevice = device.copy(state = state)
                deviceRegistry[deviceId] = updatedDevice
            }
            
            _systemState.value = DeviceControlState.IDLE
            state
            
        } catch (e: Exception) {
            _systemState.value = DeviceControlState.ERROR
            _deviceEvents.emit(
                DeviceEvent.ErrorEvent(
                    error = e,
                    message = "Error querying device ${device.name} state: ${e.message}"
                )
            )
            null
        }
    }
    
    /**
     * Check if the device control operation aligns with user values
     */
    private suspend fun checkDeviceControlPermission(
        device: SmartDevice,
        property: String,
        value: Any
    ): DeviceOperationResult? {
        // For high-security devices like locks, require additional confirmation
        if (device.type == DeviceType.LOCK && property == "locked" && value == false) {
            // Request explicit confirmation from user for unlocking
            val permissionGranted = runtimeConsent.requestPermission(
                "unlock_door",
                "Sallie is attempting to unlock ${device.name}. Do you want to allow this?"
            )
            
            if (!permissionGranted) {
                return DeviceOperationResult.Rejected("User denied permission to unlock door")
            }
        }
        
        // Check with values system for any other ethical considerations
        val ethicalConcern = withContext(Dispatchers.Default) {
            valuesSystem.evaluateAction(
                action = "control_device",
                context = mapOf(
                    "device_type" to device.type.name,
                    "device_name" to device.name,
                    "property" to property,
                    "value" to value.toString()
                )
            )
        }
        
        // If there's an ethical concern, reject the operation
        if (!ethicalConcern.isAllowed) {
            return DeviceOperationResult.Rejected("Operation rejected: ${ethicalConcern.reason}")
        }
        
        return null
    }
    
    /**
     * Get the automation engine
     */
    override fun getAutomationEngine(): DeviceAutomationEngine {
        return automationEngine
    }
    
    /**
     * Execute a scene
     */
    override suspend fun executeScene(sceneId: String): Boolean {
        return try {
            _systemState.value = DeviceControlState.BUSY
            
            val success = automationEngine.executeScene(sceneId)
            
            if (success) {
                // Get scene name
                val scene = automationEngine.scenes.value.find { it.id == sceneId }
                
                // Emit scene activated event
                _deviceEvents.emit(
                    DeviceEvent.SceneEvent(
                        sceneId = sceneId,
                        sceneName = scene?.name ?: "Unknown Scene",
                        activated = true
                    )
                )
            }
            
            _systemState.value = DeviceControlState.IDLE
            success
            
        } catch (e: Exception) {
            _systemState.value = DeviceControlState.ERROR
            _deviceEvents.emit(
                DeviceEvent.ErrorEvent(
                    error = e,
                    message = "Error executing scene: ${e.message}"
                )
            )
            false
        }
    }
    
    /**
     * Handle group devices together
     */
    override suspend fun createDeviceGroup(name: String, deviceIds: List<String>): String? {
        // Validate that all devices exist
        if (!deviceIds.all { deviceRegistry.containsKey(it) }) {
            return null
        }
        
        val groupId = "group-${UUID.randomUUID()}"
        val group = DeviceGroup(
            id = groupId,
            name = name,
            deviceIds = deviceIds.toMutableList(),
            createdAt = System.currentTimeMillis()
        )
        
        // In a real implementation, we'd persist this group
        // For now, we just return the ID
        
        return groupId
    }
    
    /**
     * Control all devices in a group
     */
    override suspend fun controlDeviceGroup(
        groupId: String,
        deviceIds: List<String>,
        property: String,
        value: Any
    ): Map<String, DeviceOperationResult> {
        val results = mutableMapOf<String, DeviceOperationResult>()
        
        for (deviceId in deviceIds) {
            val result = controlDevice(deviceId, property, value)
            results[deviceId] = result
        }
        
        return results
    }
}


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


/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * Enhanced DeviceControlSystem Implementation
 */

package com.sallie.device

import com.sallie.core.PluginRegistry
import com.sallie.core.featureFlags
import com.sallie.core.runtimeConsent
import com.sallie.core.ValuesSystem
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeout
import java.util.concurrent.ConcurrentHashMap
import kotlin.time.Duration.Companion.seconds

/**
 * System states for the device control
 */
enum class DeviceControlState {
    INITIALIZING,
    IDLE,
    DISCOVERING,
    BUSY,
    ERROR,
    SHUTTING_DOWN,
    DISABLED
}

/**
 * Types of device events
 */
enum class DeviceEventType {
    DEVICE_DISCOVERED,
    DEVICE_CONNECTED,
    DEVICE_DISCONNECTED,
    DEVICE_STATE_CHANGED,
    DEVICE_ERROR,
    SYSTEM_INITIALIZED,
    SYSTEM_SHUTDOWN,
    PERMISSION_DENIED,
    AUTOMATION_TRIGGERED,
    SCENE_ACTIVATED
}

/**
 * Device event classes
 */
sealed class DeviceEvent {
    data class DeviceDiscoveryEvent(
        val deviceId: String,
        val deviceName: String,
        val deviceType: DeviceType,
        val protocol: DeviceProtocol
    ) : DeviceEvent()
    
    data class DeviceStateChangedEvent(
        val deviceId: String,
        val property: String,
        val value: Any,
        val previousValue: Any?
    ) : DeviceEvent()
    
    data class DeviceErrorEvent(
        val deviceId: String,
        val error: String
    ) : DeviceEvent()
    
    data class SystemEvent(
        val type: DeviceEventType,
        val message: String
    ) : DeviceEvent()
    
    data class SecurityEvent(
        val type: DeviceEventType,
        val message: String
    ) : DeviceEvent()
    
    data class AutomationEvent(
        val ruleId: String,
        val ruleName: String,
        val triggered: Boolean,
        val actions: List<String>
    ) : DeviceEvent()
    
    data class SceneEvent(
        val sceneId: String,
        val sceneName: String,
        val activated: Boolean
    ) : DeviceEvent()
    
    data class ErrorEvent(
        val error: Throwable,
        val message: String
    ) : DeviceEvent()
}

/**
 * Device state update
 */
data class DeviceStateUpdate(
    val deviceId: String,
    val property: String,
    val value: Any,
    val previousValue: Any?,
    val timestamp: Long = System.currentTimeMillis()
)

/**
 * Enhanced Device Control System that manages interactions with smart devices
 */
class EnhancedDeviceControlSystem(
    private val pluginRegistry: PluginRegistry,
    private val valuesSystem: ValuesSystem
) : DeviceControlSystem {
    
    // Coroutine scope for device operations
    private val deviceScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    
    // Device registry
    private val deviceRegistry = ConcurrentHashMap<String, SmartDevice>()
    
    // Protocol connectors
    private val connectors = mutableMapOf<DeviceProtocol, DeviceConnector>()
    
    // System state
    private val _systemState = MutableStateFlow(DeviceControlState.INITIALIZING)
    override val systemState: StateFlow<DeviceControlState> = _systemState.asStateFlow()
    
    // Device events
    private val _deviceEvents = MutableSharedFlow<DeviceEvent>(replay = 10)
    override val deviceEvents: SharedFlow<DeviceEvent> = _deviceEvents.asSharedFlow()
    
    // Device updates for automation engine
    private val _deviceUpdates = MutableSharedFlow<DeviceStateUpdate>(replay = 20)
    override val deviceUpdates: SharedFlow<DeviceStateUpdate> = _deviceUpdates.asSharedFlow()
    
    // Automation engine
    private lateinit var automationEngine: DeviceAutomationEngine
    
    /**
     * Initialize the device control system
     */
    override suspend fun initialize() {
        try {
            _systemState.value = DeviceControlState.INITIALIZING
            
            // Check if feature is enabled
            if (!featureFlags.isEnabled("device_control")) {
                _systemState.value = DeviceControlState.DISABLED
                return
            }
            
            // Request necessary permissions
            val permissionGranted = runtimeConsent.requestPermission(
                "device_control",
                "Sallie needs permission to discover and control smart devices on your network. " +
                "This will allow Sallie to help you manage your smart home devices."
            )
            
            if (!permissionGranted) {
                _systemState.value = DeviceControlState.DISABLED
                return
            }
            
            // Register protocol connectors
            registerConnectors()
            
            // Initialize automation engine
            automationEngine = DeviceAutomationEngine(this)
            
            // Create some default rules
            automationEngine.createDefaultRules()
            
            _systemState.value = DeviceControlState.IDLE
            
            // Emit initialization event
            _deviceEvents.emit(
                DeviceEvent.SystemEvent(
                    type = DeviceEventType.SYSTEM_INITIALIZED,
                    message = "Device control system initialized successfully"
                )
            )
            
        } catch (e: Exception) {
            _systemState.value = DeviceControlState.ERROR
            _deviceEvents.emit(
                DeviceEvent.ErrorEvent(
                    error = e,
                    message = "Failed to initialize device control system: ${e.message}"
                )
            )
        }
    }
    
    /**
     * Shut down the device control system
     */
    override suspend fun shutdown() {
        try {
            _systemState.value = DeviceControlState.SHUTTING_DOWN
            
            // Disconnect all devices
            deviceRegistry.keys.forEach { deviceId ->
                disconnectDevice(deviceId)
            }
            
            // Clear device registry
            deviceRegistry.clear()
            
            _systemState.value = DeviceControlState.DISABLED
            
            // Emit shutdown event
            _deviceEvents.emit(
                DeviceEvent.SystemEvent(
                    type = DeviceEventType.SYSTEM_SHUTDOWN,
                    message = "Device control system shut down successfully"
                )
            )
            
        } catch (e: Exception) {
            _systemState.value = DeviceControlState.ERROR
            _deviceEvents.emit(
                DeviceEvent.ErrorEvent(
                    error = e,
                    message = "Error shutting down device control system: ${e.message}"
                )
            )
        }
    }
    
    /**
     * Register device connectors for different protocols
     */
    private fun registerConnectors() {
        connectors[DeviceProtocol.WIFI] = WiFiDeviceConnector()
        connectors[DeviceProtocol.BLUETOOTH] = BluetoothDeviceConnector()
        connectors[DeviceProtocol.ZIGBEE] = ZigBeeDeviceConnector()
        connectors[DeviceProtocol.ZWAVE] = ZWaveDeviceConnector()
        
        // Note: Thread, Matter and Proprietary protocols would need their own connectors
        // in a full implementation
    }
    
    /**
     * Discover devices for the specified protocols
     */
    override suspend fun discoverDevices(
        protocols: Set<DeviceProtocol>,
        timeoutMs: Long
    ): List<SmartDevice> {
        try {
            _systemState.value = DeviceControlState.DISCOVERING
            
            val discoveredDevices = mutableListOf<SmartDevice>()
            
            // Filter only available connectors
            val availableConnectors = protocols
                .filter { connectors.containsKey(it) }
                .map { connectors[it]!! }
            
            // Discover devices for each protocol
            availableConnectors.forEach { connector ->
                val devices = withTimeout(timeoutMs) {
                    connector.discoverDevices(timeoutMs)
                }
                
                // Add to discovered list and registry
                devices.forEach { device ->
                    discoveredDevices.add(device)
                    deviceRegistry[device.id] = device
                    
                    // Emit device found event
                    deviceScope.launch {
                        _deviceEvents.emit(
                            DeviceEvent.DeviceDiscoveryEvent(
                                deviceId = device.id,
                                deviceName = device.name,
                                deviceType = device.type,
                                protocol = device.protocol
                            )
                        )
                    }
                }
            }
            
            _systemState.value = DeviceControlState.IDLE
            return discoveredDevices
            
        } catch (e: Exception) {
            _systemState.value = DeviceControlState.ERROR
            _deviceEvents.emit(
                DeviceEvent.ErrorEvent(
                    error = e,
                    message = "Error during device discovery: ${e.message}"
                )
            )
            return emptyList()
        }
    }
    
    /**
     * Get a list of all known devices
     */
    override fun getAllDevices(): List<SmartDevice> {
        return deviceRegistry.values.toList()
    }
    
    /**
     * Get a device by ID
     */
    override fun getDevice(deviceId: String): SmartDevice? {
        return deviceRegistry[deviceId]
    }
    
    /**
     * Connect to a device
     */
    override suspend fun connectDevice(deviceId: String): Boolean {
        val device = deviceRegistry[deviceId] ?: return false
        val connector = connectors[device.protocol] ?: return false
        
        return try {
            _systemState.value = DeviceControlState.BUSY
            
            val success = connector.connectToDevice(device)
            
            if (success) {
                // Update device in registry with connected state
                val updatedDevice = device.copy(lastConnected = System.currentTimeMillis())
                deviceRegistry[deviceId] = updatedDevice
                
                // Emit connected event
                _deviceEvents.emit(
                    DeviceEvent.SystemEvent(
                        type = DeviceEventType.DEVICE_CONNECTED,
                        message = "Connected to device: ${device.name}"
                    )
                )
            } else {
                _deviceEvents.emit(
                    DeviceEvent.DeviceErrorEvent(
                        deviceId = deviceId,
                        error = "Failed to connect to device: ${device.name}"
                    )
                )
            }
            
            _systemState.value = DeviceControlState.IDLE
            success
            
        } catch (e: Exception) {
            _systemState.value = DeviceControlState.ERROR
            _deviceEvents.emit(
                DeviceEvent.ErrorEvent(
                    error = e,
                    message = "Error connecting to device ${device.name}: ${e.message}"
                )
            )
            false
        }
    }
    
    /**
     * Disconnect from a device
     */
    override suspend fun disconnectDevice(deviceId: String): Boolean {
        val device = deviceRegistry[deviceId] ?: return false
        val connector = connectors[device.protocol] ?: return false
        
        return try {
            _systemState.value = DeviceControlState.BUSY
            
            val success = connector.disconnectFromDevice(device)
            
            if (success) {
                // Emit disconnected event
                _deviceEvents.emit(
                    DeviceEvent.SystemEvent(
                        type = DeviceEventType.DEVICE_DISCONNECTED,
                        message = "Disconnected from device: ${device.name}"
                    )
                )
            } else {
                _deviceEvents.emit(
                    DeviceEvent.DeviceErrorEvent(
                        deviceId = deviceId,
                        error = "Failed to disconnect from device: ${device.name}"
                    )
                )
            }
            
            _systemState.value = DeviceControlState.IDLE
            success
            
        } catch (e: Exception) {
            _systemState.value = DeviceControlState.ERROR
            _deviceEvents.emit(
                DeviceEvent.ErrorEvent(
                    error = e,
                    message = "Error disconnecting from device ${device.name}: ${e.message}"
                )
            )
            false
        }
    }
    
    /**
     * Control a device property
     */
    override suspend fun controlDevice(deviceId: String, property: String, value: Any): DeviceOperationResult {
        val device = deviceRegistry[deviceId] ?: return DeviceOperationResult.Error("Device not found")
        val connector = connectors[device.protocol] ?: return DeviceOperationResult.Error("Protocol not supported")
        
        // Check if the operation is value-aligned
        val permissionCheck = checkDeviceControlPermission(device, property, value)
        if (permissionCheck != null) {
            return permissionCheck
        }
        
        return try {
            _systemState.value = DeviceControlState.BUSY
            
            // Get previous value
            val previousValue = device.state[property]
            
            // Send command to device
            val result = connector.controlDevice(device, property, value)
            
            if (result is DeviceOperationResult.Success) {
                // Update device in registry
                val updatedState = result.newState
                val updatedDevice = device.copy(state = updatedState)
                deviceRegistry[deviceId] = updatedDevice
                
                // Emit state changed event
                _deviceEvents.emit(
                    DeviceEvent.DeviceStateChangedEvent(
                        deviceId = deviceId,
                        property = property,
                        value = value,
                        previousValue = previousValue
                    )
                )
                
                // Emit device update for automation
                _deviceUpdates.emit(
                    DeviceStateUpdate(
                        deviceId = deviceId,
                        property = property,
                        value = value,
                        previousValue = previousValue
                    )
                )
            } else {
                _deviceEvents.emit(
                    DeviceEvent.DeviceErrorEvent(
                        deviceId = deviceId,
                        error = "Failed to control device: ${device.name}, property: $property"
                    )
                )
            }
            
            _systemState.value = DeviceControlState.IDLE
            result
            
        } catch (e: Exception) {
            _systemState.value = DeviceControlState.ERROR
            _deviceEvents.emit(
                DeviceEvent.ErrorEvent(
                    error = e,
                    message = "Error controlling device ${device.name}: ${e.message}"
                )
            )
            DeviceOperationResult.Error("Exception: ${e.message}")
        }
    }
    
    /**
     * Query the current state of a device
     */
    override suspend fun queryDeviceState(deviceId: String): Map<String, Any>? {
        val device = deviceRegistry[deviceId] ?: return null
        val connector = connectors[device.protocol] ?: return null
        
        return try {
            _systemState.value = DeviceControlState.BUSY
            
            val state = connector.queryDeviceState(device)
            
            if (state != null) {
                // Update device in registry
                val updatedDevice = device.copy(state = state)
                deviceRegistry[deviceId] = updatedDevice
            }
            
            _systemState.value = DeviceControlState.IDLE
            state
            
        } catch (e: Exception) {
            _systemState.value = DeviceControlState.ERROR
            _deviceEvents.emit(
                DeviceEvent.ErrorEvent(
                    error = e,
                    message = "Error querying device ${device.name} state: ${e.message}"
                )
            )
            null
        }
    }
    
    /**
     * Check if the device control operation aligns with user values
     */
    private suspend fun checkDeviceControlPermission(
        device: SmartDevice,
        property: String,
        value: Any
    ): DeviceOperationResult? {
        // For high-security devices like locks, require additional confirmation
        if (device.type == DeviceType.LOCK && property == "locked" && value == false) {
            // Request explicit confirmation from user for unlocking
            val permissionGranted = runtimeConsent.requestPermission(
                "unlock_door",
                "Sallie is attempting to unlock ${device.name}. Do you want to allow this?"
            )
            
            if (!permissionGranted) {
                return DeviceOperationResult.Rejected("User denied permission to unlock door")
            }
        }
        
        // Check with values system for any other ethical considerations
        val ethicalConcern = withContext(Dispatchers.Default) {
            valuesSystem.evaluateAction(
                action = "control_device",
                context = mapOf(
                    "device_type" to device.type.name,
                    "device_name" to device.name,
                    "property" to property,
                    "value" to value.toString()
                )
            )
        }
        
        // If there's an ethical concern, reject the operation
        if (!ethicalConcern.isAllowed) {
            return DeviceOperationResult.Rejected("Operation rejected: ${ethicalConcern.reason}")
        }
        
        return null
    }
    
    /**
     * Get the automation engine
     */
    override fun getAutomationEngine(): DeviceAutomationEngine {
        return automationEngine
    }
    
    /**
     * Execute a scene
     */
    override suspend fun executeScene(sceneId: String): Boolean {
        return try {
            _systemState.value = DeviceControlState.BUSY
            
            val success = automationEngine.executeScene(sceneId)
            
            if (success) {
                // Get scene name
                val scene = automationEngine.scenes.value.find { it.id == sceneId }
                
                // Emit scene activated event
                _deviceEvents.emit(
                    DeviceEvent.SceneEvent(
                        sceneId = sceneId,
                        sceneName = scene?.name ?: "Unknown Scene",
                        activated = true
                    )
                )
            }
            
            _systemState.value = DeviceControlState.IDLE
            success
            
        } catch (e: Exception) {
            _systemState.value = DeviceControlState.ERROR
            _deviceEvents.emit(
                DeviceEvent.ErrorEvent(
                    error = e,
                    message = "Error executing scene: ${e.message}"
                )
            )
            false
        }
    }
    
    /**
     * Handle group devices together
     */
    override suspend fun createDeviceGroup(name: String, deviceIds: List<String>): String? {
        // Validate that all devices exist
        if (!deviceIds.all { deviceRegistry.containsKey(it) }) {
            return null
        }
        
        val groupId = "group-${UUID.randomUUID()}"
        val group = DeviceGroup(
            id = groupId,
            name = name,
            deviceIds = deviceIds.toMutableList(),
            createdAt = System.currentTimeMillis()
        )
        
        // In a real implementation, we'd persist this group
        // For now, we just return the ID
        
        return groupId
    }
    
    /**
     * Control all devices in a group
     */
    override suspend fun controlDeviceGroup(
        groupId: String,
        deviceIds: List<String>,
        property: String,
        value: Any
    ): Map<String, DeviceOperationResult> {
        val results = mutableMapOf<String, DeviceOperationResult>()
        
        for (deviceId in deviceIds) {
            val result = controlDevice(deviceId, property, value)
            results[deviceId] = result
        }
        
        return results
    }
}


/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * Enhanced DeviceControlSystem Implementation
 */

package com.sallie.device

import com.sallie.core.PluginRegistry
import com.sallie.core.featureFlags
import com.sallie.core.runtimeConsent
import com.sallie.core.ValuesSystem
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeout
import java.util.concurrent.ConcurrentHashMap
import kotlin.time.Duration.Companion.seconds

/**
 * System states for the device control
 */
enum class DeviceControlState {
    INITIALIZING,
    IDLE,
    DISCOVERING,
    BUSY,
    ERROR,
    SHUTTING_DOWN,
    DISABLED
}

/**
 * Types of device events
 */
enum class DeviceEventType {
    DEVICE_DISCOVERED,
    DEVICE_CONNECTED,
    DEVICE_DISCONNECTED,
    DEVICE_STATE_CHANGED,
    DEVICE_ERROR,
    SYSTEM_INITIALIZED,
    SYSTEM_SHUTDOWN,
    PERMISSION_DENIED,
    AUTOMATION_TRIGGERED,
    SCENE_ACTIVATED
}

/**
 * Device event classes
 */
sealed class DeviceEvent {
    data class DeviceDiscoveryEvent(
        val deviceId: String,
        val deviceName: String,
        val deviceType: DeviceType,
        val protocol: DeviceProtocol
    ) : DeviceEvent()
    
    data class DeviceStateChangedEvent(
        val deviceId: String,
        val property: String,
        val value: Any,
        val previousValue: Any?
    ) : DeviceEvent()
    
    data class DeviceErrorEvent(
        val deviceId: String,
        val error: String
    ) : DeviceEvent()
    
    data class SystemEvent(
        val type: DeviceEventType,
        val message: String
    ) : DeviceEvent()
    
    data class SecurityEvent(
        val type: DeviceEventType,
        val message: String
    ) : DeviceEvent()
    
    data class AutomationEvent(
        val ruleId: String,
        val ruleName: String,
        val triggered: Boolean,
        val actions: List<String>
    ) : DeviceEvent()
    
    data class SceneEvent(
        val sceneId: String,
        val sceneName: String,
        val activated: Boolean
    ) : DeviceEvent()
    
    data class ErrorEvent(
        val error: Throwable,
        val message: String
    ) : DeviceEvent()
}

/**
 * Device state update
 */
data class DeviceStateUpdate(
    val deviceId: String,
    val property: String,
    val value: Any,
    val previousValue: Any?,
    val timestamp: Long = System.currentTimeMillis()
)

/**
 * Enhanced Device Control System that manages interactions with smart devices
 */
class EnhancedDeviceControlSystem(
    private val pluginRegistry: PluginRegistry,
    private val valuesSystem: ValuesSystem
) : DeviceControlSystem {
    
    // Coroutine scope for device operations
    private val deviceScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    
    // Device registry
    private val deviceRegistry = ConcurrentHashMap<String, SmartDevice>()
    
    // Protocol connectors
    private val connectors = mutableMapOf<DeviceProtocol, DeviceConnector>()
    
    // System state
    private val _systemState = MutableStateFlow(DeviceControlState.INITIALIZING)
    override val systemState: StateFlow<DeviceControlState> = _systemState.asStateFlow()
    
    // Device events
    private val _deviceEvents = MutableSharedFlow<DeviceEvent>(replay = 10)
    override val deviceEvents: SharedFlow<DeviceEvent> = _deviceEvents.asSharedFlow()
    
    // Device updates for automation engine
    private val _deviceUpdates = MutableSharedFlow<DeviceStateUpdate>(replay = 20)
    override val deviceUpdates: SharedFlow<DeviceStateUpdate> = _deviceUpdates.asSharedFlow()
    
    // Automation engine
    private lateinit var automationEngine: DeviceAutomationEngine
    
    /**
     * Initialize the device control system
     */
    override suspend fun initialize() {
        try {
            _systemState.value = DeviceControlState.INITIALIZING
            
            // Check if feature is enabled
            if (!featureFlags.isEnabled("device_control")) {
                _systemState.value = DeviceControlState.DISABLED
                return
            }
            
            // Request necessary permissions
            val permissionGranted = runtimeConsent.requestPermission(
                "device_control",
                "Sallie needs permission to discover and control smart devices on your network. " +
                "This will allow Sallie to help you manage your smart home devices."
            )
            
            if (!permissionGranted) {
                _systemState.value = DeviceControlState.DISABLED
                return
            }
            
            // Register protocol connectors
            registerConnectors()
            
            // Initialize automation engine
            automationEngine = DeviceAutomationEngine(this)
            
            // Create some default rules
            automationEngine.createDefaultRules()
            
            _systemState.value = DeviceControlState.IDLE
            
            // Emit initialization event
            _deviceEvents.emit(
                DeviceEvent.SystemEvent(
                    type = DeviceEventType.SYSTEM_INITIALIZED,
                    message = "Device control system initialized successfully"
                )
            )
            
        } catch (e: Exception) {
            _systemState.value = DeviceControlState.ERROR
            _deviceEvents.emit(
                DeviceEvent.ErrorEvent(
                    error = e,
                    message = "Failed to initialize device control system: ${e.message}"
                )
            )
        }
    }
    
    /**
     * Shut down the device control system
     */
    override suspend fun shutdown() {
        try {
            _systemState.value = DeviceControlState.SHUTTING_DOWN
            
            // Disconnect all devices
            deviceRegistry.keys.forEach { deviceId ->
                disconnectDevice(deviceId)
            }
            
            // Clear device registry
            deviceRegistry.clear()
            
            _systemState.value = DeviceControlState.DISABLED
            
            // Emit shutdown event
            _deviceEvents.emit(
                DeviceEvent.SystemEvent(
                    type = DeviceEventType.SYSTEM_SHUTDOWN,
                    message = "Device control system shut down successfully"
                )
            )
            
        } catch (e: Exception) {
            _systemState.value = DeviceControlState.ERROR
            _deviceEvents.emit(
                DeviceEvent.ErrorEvent(
                    error = e,
                    message = "Error shutting down device control system: ${e.message}"
                )
            )
        }
    }
    
    /**
     * Register device connectors for different protocols
     */
    private fun registerConnectors() {
        connectors[DeviceProtocol.WIFI] = WiFiDeviceConnector()
        connectors[DeviceProtocol.BLUETOOTH] = BluetoothDeviceConnector()
        connectors[DeviceProtocol.ZIGBEE] = ZigBeeDeviceConnector()
        connectors[DeviceProtocol.ZWAVE] = ZWaveDeviceConnector()
        
        // Note: Thread, Matter and Proprietary protocols would need their own connectors
        // in a full implementation
    }
    
    /**
     * Discover devices for the specified protocols
     */
    override suspend fun discoverDevices(
        protocols: Set<DeviceProtocol>,
        timeoutMs: Long
    ): List<SmartDevice> {
        try {
            _systemState.value = DeviceControlState.DISCOVERING
            
            val discoveredDevices = mutableListOf<SmartDevice>()
            
            // Filter only available connectors
            val availableConnectors = protocols
                .filter { connectors.containsKey(it) }
                .map { connectors[it]!! }
            
            // Discover devices for each protocol
            availableConnectors.forEach { connector ->
                val devices = withTimeout(timeoutMs) {
                    connector.discoverDevices(timeoutMs)
                }
                
                // Add to discovered list and registry
                devices.forEach { device ->
                    discoveredDevices.add(device)
                    deviceRegistry[device.id] = device
                    
                    // Emit device found event
                    deviceScope.launch {
                        _deviceEvents.emit(
                            DeviceEvent.DeviceDiscoveryEvent(
                                deviceId = device.id,
                                deviceName = device.name,
                                deviceType = device.type,
                                protocol = device.protocol
                            )
                        )
                    }
                }
            }
            
            _systemState.value = DeviceControlState.IDLE
            return discoveredDevices
            
        } catch (e: Exception) {
            _systemState.value = DeviceControlState.ERROR
            _deviceEvents.emit(
                DeviceEvent.ErrorEvent(
                    error = e,
                    message = "Error during device discovery: ${e.message}"
                )
            )
            return emptyList()
        }
    }
    
    /**
     * Get a list of all known devices
     */
    override fun getAllDevices(): List<SmartDevice> {
        return deviceRegistry.values.toList()
    }
    
    /**
     * Get a device by ID
     */
    override fun getDevice(deviceId: String): SmartDevice? {
        return deviceRegistry[deviceId]
    }
    
    /**
     * Connect to a device
     */
    override suspend fun connectDevice(deviceId: String): Boolean {
        val device = deviceRegistry[deviceId] ?: return false
        val connector = connectors[device.protocol] ?: return false
        
        return try {
            _systemState.value = DeviceControlState.BUSY
            
            val success = connector.connectToDevice(device)
            
            if (success) {
                // Update device in registry with connected state
                val updatedDevice = device.copy(lastConnected = System.currentTimeMillis())
                deviceRegistry[deviceId] = updatedDevice
                
                // Emit connected event
                _deviceEvents.emit(
                    DeviceEvent.SystemEvent(
                        type = DeviceEventType.DEVICE_CONNECTED,
                        message = "Connected to device: ${device.name}"
                    )
                )
            } else {
                _deviceEvents.emit(
                    DeviceEvent.DeviceErrorEvent(
                        deviceId = deviceId,
                        error = "Failed to connect to device: ${device.name}"
                    )
                )
            }
            
            _systemState.value = DeviceControlState.IDLE
            success
            
        } catch (e: Exception) {
            _systemState.value = DeviceControlState.ERROR
            _deviceEvents.emit(
                DeviceEvent.ErrorEvent(
                    error = e,
                    message = "Error connecting to device ${device.name}: ${e.message}"
                )
            )
            false
        }
    }
    
    /**
     * Disconnect from a device
     */
    override suspend fun disconnectDevice(deviceId: String): Boolean {
        val device = deviceRegistry[deviceId] ?: return false
        val connector = connectors[device.protocol] ?: return false
        
        return try {
            _systemState.value = DeviceControlState.BUSY
            
            val success = connector.disconnectFromDevice(device)
            
            if (success) {
                // Emit disconnected event
                _deviceEvents.emit(
                    DeviceEvent.SystemEvent(
                        type = DeviceEventType.DEVICE_DISCONNECTED,
                        message = "Disconnected from device: ${device.name}"
                    )
                )
            } else {
                _deviceEvents.emit(
                    DeviceEvent.DeviceErrorEvent(
                        deviceId = deviceId,
                        error = "Failed to disconnect from device: ${device.name}"
                    )
                )
            }
            
            _systemState.value = DeviceControlState.IDLE
            success
            
        } catch (e: Exception) {
            _systemState.value = DeviceControlState.ERROR
            _deviceEvents.emit(
                DeviceEvent.ErrorEvent(
                    error = e,
                    message = "Error disconnecting from device ${device.name}: ${e.message}"
                )
            )
            false
        }
    }
    
    /**
     * Control a device property
     */
    override suspend fun controlDevice(deviceId: String, property: String, value: Any): DeviceOperationResult {
        val device = deviceRegistry[deviceId] ?: return DeviceOperationResult.Error("Device not found")
        val connector = connectors[device.protocol] ?: return DeviceOperationResult.Error("Protocol not supported")
        
        // Check if the operation is value-aligned
        val permissionCheck = checkDeviceControlPermission(device, property, value)
        if (permissionCheck != null) {
            return permissionCheck
        }
        
        return try {
            _systemState.value = DeviceControlState.BUSY
            
            // Get previous value
            val previousValue = device.state[property]
            
            // Send command to device
            val result = connector.controlDevice(device, property, value)
            
            if (result is DeviceOperationResult.Success) {
                // Update device in registry
                val updatedState = result.newState
                val updatedDevice = device.copy(state = updatedState)
                deviceRegistry[deviceId] = updatedDevice
                
                // Emit state changed event
                _deviceEvents.emit(
                    DeviceEvent.DeviceStateChangedEvent(
                        deviceId = deviceId,
                        property = property,
                        value = value,
                        previousValue = previousValue
                    )
                )
                
                // Emit device update for automation
                _deviceUpdates.emit(
                    DeviceStateUpdate(
                        deviceId = deviceId,
                        property = property,
                        value = value,
                        previousValue = previousValue
                    )
                )
            } else {
                _deviceEvents.emit(
                    DeviceEvent.DeviceErrorEvent(
                        deviceId = deviceId,
                        error = "Failed to control device: ${device.name}, property: $property"
                    )
                )
            }
            
            _systemState.value = DeviceControlState.IDLE
            result
            
        } catch (e: Exception) {
            _systemState.value = DeviceControlState.ERROR
            _deviceEvents.emit(
                DeviceEvent.ErrorEvent(
                    error = e,
                    message = "Error controlling device ${device.name}: ${e.message}"
                )
            )
            DeviceOperationResult.Error("Exception: ${e.message}")
        }
    }
    
    /**
     * Query the current state of a device
     */
    override suspend fun queryDeviceState(deviceId: String): Map<String, Any>? {
        val device = deviceRegistry[deviceId] ?: return null
        val connector = connectors[device.protocol] ?: return null
        
        return try {
            _systemState.value = DeviceControlState.BUSY
            
            val state = connector.queryDeviceState(device)
            
            if (state != null) {
                // Update device in registry
                val updatedDevice = device.copy(state = state)
                deviceRegistry[deviceId] = updatedDevice
            }
            
            _systemState.value = DeviceControlState.IDLE
            state
            
        } catch (e: Exception) {
            _systemState.value = DeviceControlState.ERROR
            _deviceEvents.emit(
                DeviceEvent.ErrorEvent(
                    error = e,
                    message = "Error querying device ${device.name} state: ${e.message}"
                )
            )
            null
        }
    }
    
    /**
     * Check if the device control operation aligns with user values
     */
    private suspend fun checkDeviceControlPermission(
        device: SmartDevice,
        property: String,
        value: Any
    ): DeviceOperationResult? {
        // For high-security devices like locks, require additional confirmation
        if (device.type == DeviceType.LOCK && property == "locked" && value == false) {
            // Request explicit confirmation from user for unlocking
            val permissionGranted = runtimeConsent.requestPermission(
                "unlock_door",
                "Sallie is attempting to unlock ${device.name}. Do you want to allow this?"
            )
            
            if (!permissionGranted) {
                return DeviceOperationResult.Rejected("User denied permission to unlock door")
            }
        }
        
        // Check with values system for any other ethical considerations
        val ethicalConcern = withContext(Dispatchers.Default) {
            valuesSystem.evaluateAction(
                action = "control_device",
                context = mapOf(
                    "device_type" to device.type.name,
                    "device_name" to device.name,
                    "property" to property,
                    "value" to value.toString()
                )
            )
        }
        
        // If there's an ethical concern, reject the operation
        if (!ethicalConcern.isAllowed) {
            return DeviceOperationResult.Rejected("Operation rejected: ${ethicalConcern.reason}")
        }
        
        return null
    }
    
    /**
     * Get the automation engine
     */
    override fun getAutomationEngine(): DeviceAutomationEngine {
        return automationEngine
    }
    
    /**
     * Execute a scene
     */
    override suspend fun executeScene(sceneId: String): Boolean {
        return try {
            _systemState.value = DeviceControlState.BUSY
            
            val success = automationEngine.executeScene(sceneId)
            
            if (success) {
                // Get scene name
                val scene = automationEngine.scenes.value.find { it.id == sceneId }
                
                // Emit scene activated event
                _deviceEvents.emit(
                    DeviceEvent.SceneEvent(
                        sceneId = sceneId,
                        sceneName = scene?.name ?: "Unknown Scene",
                        activated = true
                    )
                )
            }
            
            _systemState.value = DeviceControlState.IDLE
            success
            
        } catch (e: Exception) {
            _systemState.value = DeviceControlState.ERROR
            _deviceEvents.emit(
                DeviceEvent.ErrorEvent(
                    error = e,
                    message = "Error executing scene: ${e.message}"
                )
            )
            false
        }
    }
    
    /**
     * Handle group devices together
     */
    override suspend fun createDeviceGroup(name: String, deviceIds: List<String>): String? {
        // Validate that all devices exist
        if (!deviceIds.all { deviceRegistry.containsKey(it) }) {
            return null
        }
        
        val groupId = "group-${UUID.randomUUID()}"
        val group = DeviceGroup(
            id = groupId,
            name = name,
            deviceIds = deviceIds.toMutableList(),
            createdAt = System.currentTimeMillis()
        )
        
        // In a real implementation, we'd persist this group
        // For now, we just return the ID
        
        return groupId
    }
    
    /**
     * Control all devices in a group
     */
    override suspend fun controlDeviceGroup(
        groupId: String,
        deviceIds: List<String>,
        property: String,
        value: Any
    ): Map<String, DeviceOperationResult> {
        val results = mutableMapOf<String, DeviceOperationResult>()
        
        for (deviceId in deviceIds) {
            val result = controlDevice(deviceId, property, value)
            results[deviceId] = result
        }
        
        return results
    }
}


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


/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * Enhanced DeviceControlSystem Implementation
 */

package com.sallie.device

import com.sallie.core.PluginRegistry
import com.sallie.core.featureFlags
import com.sallie.core.runtimeConsent
import com.sallie.core.ValuesSystem
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeout
import java.util.concurrent.ConcurrentHashMap
import kotlin.time.Duration.Companion.seconds

/**
 * System states for the device control
 */
enum class DeviceControlState {
    INITIALIZING,
    IDLE,
    DISCOVERING,
    BUSY,
    ERROR,
    SHUTTING_DOWN,
    DISABLED
}

/**
 * Types of device events
 */
enum class DeviceEventType {
    DEVICE_DISCOVERED,
    DEVICE_CONNECTED,
    DEVICE_DISCONNECTED,
    DEVICE_STATE_CHANGED,
    DEVICE_ERROR,
    SYSTEM_INITIALIZED,
    SYSTEM_SHUTDOWN,
    PERMISSION_DENIED,
    AUTOMATION_TRIGGERED,
    SCENE_ACTIVATED
}

/**
 * Device event classes
 */
sealed class DeviceEvent {
    data class DeviceDiscoveryEvent(
        val deviceId: String,
        val deviceName: String,
        val deviceType: DeviceType,
        val protocol: DeviceProtocol
    ) : DeviceEvent()
    
    data class DeviceStateChangedEvent(
        val deviceId: String,
        val property: String,
        val value: Any,
        val previousValue: Any?
    ) : DeviceEvent()
    
    data class DeviceErrorEvent(
        val deviceId: String,
        val error: String
    ) : DeviceEvent()
    
    data class SystemEvent(
        val type: DeviceEventType,
        val message: String
    ) : DeviceEvent()
    
    data class SecurityEvent(
        val type: DeviceEventType,
        val message: String
    ) : DeviceEvent()
    
    data class AutomationEvent(
        val ruleId: String,
        val ruleName: String,
        val triggered: Boolean,
        val actions: List<String>
    ) : DeviceEvent()
    
    data class SceneEvent(
        val sceneId: String,
        val sceneName: String,
        val activated: Boolean
    ) : DeviceEvent()
    
    data class ErrorEvent(
        val error: Throwable,
        val message: String
    ) : DeviceEvent()
}

/**
 * Device state update
 */
data class DeviceStateUpdate(
    val deviceId: String,
    val property: String,
    val value: Any,
    val previousValue: Any?,
    val timestamp: Long = System.currentTimeMillis()
)

/**
 * Enhanced Device Control System that manages interactions with smart devices
 */
class EnhancedDeviceControlSystem(
    private val pluginRegistry: PluginRegistry,
    private val valuesSystem: ValuesSystem
) : DeviceControlSystem {
    
    // Coroutine scope for device operations
    private val deviceScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    
    // Device registry
    private val deviceRegistry = ConcurrentHashMap<String, SmartDevice>()
    
    // Protocol connectors
    private val connectors = mutableMapOf<DeviceProtocol, DeviceConnector>()
    
    // System state
    private val _systemState = MutableStateFlow(DeviceControlState.INITIALIZING)
    override val systemState: StateFlow<DeviceControlState> = _systemState.asStateFlow()
    
    // Device events
    private val _deviceEvents = MutableSharedFlow<DeviceEvent>(replay = 10)
    override val deviceEvents: SharedFlow<DeviceEvent> = _deviceEvents.asSharedFlow()
    
    // Device updates for automation engine
    private val _deviceUpdates = MutableSharedFlow<DeviceStateUpdate>(replay = 20)
    override val deviceUpdates: SharedFlow<DeviceStateUpdate> = _deviceUpdates.asSharedFlow()
    
    // Automation engine
    private lateinit var automationEngine: DeviceAutomationEngine
    
    /**
     * Initialize the device control system
     */
    override suspend fun initialize() {
        try {
            _systemState.value = DeviceControlState.INITIALIZING
            
            // Check if feature is enabled
            if (!featureFlags.isEnabled("device_control")) {
                _systemState.value = DeviceControlState.DISABLED
                return
            }
            
            // Request necessary permissions
            val permissionGranted = runtimeConsent.requestPermission(
                "device_control",
                "Sallie needs permission to discover and control smart devices on your network. " +
                "This will allow Sallie to help you manage your smart home devices."
            )
            
            if (!permissionGranted) {
                _systemState.value = DeviceControlState.DISABLED
                return
            }
            
            // Register protocol connectors
            registerConnectors()
            
            // Initialize automation engine
            automationEngine = DeviceAutomationEngine(this)
            
            // Create some default rules
            automationEngine.createDefaultRules()
            
            _systemState.value = DeviceControlState.IDLE
            
            // Emit initialization event
            _deviceEvents.emit(
                DeviceEvent.SystemEvent(
                    type = DeviceEventType.SYSTEM_INITIALIZED,
                    message = "Device control system initialized successfully"
                )
            )
            
        } catch (e: Exception) {
            _systemState.value = DeviceControlState.ERROR
            _deviceEvents.emit(
                DeviceEvent.ErrorEvent(
                    error = e,
                    message = "Failed to initialize device control system: ${e.message}"
                )
            )
        }
    }
    
    /**
     * Shut down the device control system
     */
    override suspend fun shutdown() {
        try {
            _systemState.value = DeviceControlState.SHUTTING_DOWN
            
            // Disconnect all devices
            deviceRegistry.keys.forEach { deviceId ->
                disconnectDevice(deviceId)
            }
            
            // Clear device registry
            deviceRegistry.clear()
            
            _systemState.value = DeviceControlState.DISABLED
            
            // Emit shutdown event
            _deviceEvents.emit(
                DeviceEvent.SystemEvent(
                    type = DeviceEventType.SYSTEM_SHUTDOWN,
                    message = "Device control system shut down successfully"
                )
            )
            
        } catch (e: Exception) {
            _systemState.value = DeviceControlState.ERROR
            _deviceEvents.emit(
                DeviceEvent.ErrorEvent(
                    error = e,
                    message = "Error shutting down device control system: ${e.message}"
                )
            )
        }
    }
    
    /**
     * Register device connectors for different protocols
     */
    private fun registerConnectors() {
        connectors[DeviceProtocol.WIFI] = WiFiDeviceConnector()
        connectors[DeviceProtocol.BLUETOOTH] = BluetoothDeviceConnector()
        connectors[DeviceProtocol.ZIGBEE] = ZigBeeDeviceConnector()
        connectors[DeviceProtocol.ZWAVE] = ZWaveDeviceConnector()
        
        // Note: Thread, Matter and Proprietary protocols would need their own connectors
        // in a full implementation
    }
    
    /**
     * Discover devices for the specified protocols
     */
    override suspend fun discoverDevices(
        protocols: Set<DeviceProtocol>,
        timeoutMs: Long
    ): List<SmartDevice> {
        try {
            _systemState.value = DeviceControlState.DISCOVERING
            
            val discoveredDevices = mutableListOf<SmartDevice>()
            
            // Filter only available connectors
            val availableConnectors = protocols
                .filter { connectors.containsKey(it) }
                .map { connectors[it]!! }
            
            // Discover devices for each protocol
            availableConnectors.forEach { connector ->
                val devices = withTimeout(timeoutMs) {
                    connector.discoverDevices(timeoutMs)
                }
                
                // Add to discovered list and registry
                devices.forEach { device ->
                    discoveredDevices.add(device)
                    deviceRegistry[device.id] = device
                    
                    // Emit device found event
                    deviceScope.launch {
                        _deviceEvents.emit(
                            DeviceEvent.DeviceDiscoveryEvent(
                                deviceId = device.id,
                                deviceName = device.name,
                                deviceType = device.type,
                                protocol = device.protocol
                            )
                        )
                    }
                }
            }
            
            _systemState.value = DeviceControlState.IDLE
            return discoveredDevices
            
        } catch (e: Exception) {
            _systemState.value = DeviceControlState.ERROR
            _deviceEvents.emit(
                DeviceEvent.ErrorEvent(
                    error = e,
                    message = "Error during device discovery: ${e.message}"
                )
            )
            return emptyList()
        }
    }
    
    /**
     * Get a list of all known devices
     */
    override fun getAllDevices(): List<SmartDevice> {
        return deviceRegistry.values.toList()
    }
    
    /**
     * Get a device by ID
     */
    override fun getDevice(deviceId: String): SmartDevice? {
        return deviceRegistry[deviceId]
    }
    
    /**
     * Connect to a device
     */
    override suspend fun connectDevice(deviceId: String): Boolean {
        val device = deviceRegistry[deviceId] ?: return false
        val connector = connectors[device.protocol] ?: return false
        
        return try {
            _systemState.value = DeviceControlState.BUSY
            
            val success = connector.connectToDevice(device)
            
            if (success) {
                // Update device in registry with connected state
                val updatedDevice = device.copy(lastConnected = System.currentTimeMillis())
                deviceRegistry[deviceId] = updatedDevice
                
                // Emit connected event
                _deviceEvents.emit(
                    DeviceEvent.SystemEvent(
                        type = DeviceEventType.DEVICE_CONNECTED,
                        message = "Connected to device: ${device.name}"
                    )
                )
            } else {
                _deviceEvents.emit(
                    DeviceEvent.DeviceErrorEvent(
                        deviceId = deviceId,
                        error = "Failed to connect to device: ${device.name}"
                    )
                )
            }
            
            _systemState.value = DeviceControlState.IDLE
            success
            
        } catch (e: Exception) {
            _systemState.value = DeviceControlState.ERROR
            _deviceEvents.emit(
                DeviceEvent.ErrorEvent(
                    error = e,
                    message = "Error connecting to device ${device.name}: ${e.message}"
                )
            )
            false
        }
    }
    
    /**
     * Disconnect from a device
     */
    override suspend fun disconnectDevice(deviceId: String): Boolean {
        val device = deviceRegistry[deviceId] ?: return false
        val connector = connectors[device.protocol] ?: return false
        
        return try {
            _systemState.value = DeviceControlState.BUSY
            
            val success = connector.disconnectFromDevice(device)
            
            if (success) {
                // Emit disconnected event
                _deviceEvents.emit(
                    DeviceEvent.SystemEvent(
                        type = DeviceEventType.DEVICE_DISCONNECTED,
                        message = "Disconnected from device: ${device.name}"
                    )
                )
            } else {
                _deviceEvents.emit(
                    DeviceEvent.DeviceErrorEvent(
                        deviceId = deviceId,
                        error = "Failed to disconnect from device: ${device.name}"
                    )
                )
            }
            
            _systemState.value = DeviceControlState.IDLE
            success
            
        } catch (e: Exception) {
            _systemState.value = DeviceControlState.ERROR
            _deviceEvents.emit(
                DeviceEvent.ErrorEvent(
                    error = e,
                    message = "Error disconnecting from device ${device.name}: ${e.message}"
                )
            )
            false
        }
    }
    
    /**
     * Control a device property
     */
    override suspend fun controlDevice(deviceId: String, property: String, value: Any): DeviceOperationResult {
        val device = deviceRegistry[deviceId] ?: return DeviceOperationResult.Error("Device not found")
        val connector = connectors[device.protocol] ?: return DeviceOperationResult.Error("Protocol not supported")
        
        // Check if the operation is value-aligned
        val permissionCheck = checkDeviceControlPermission(device, property, value)
        if (permissionCheck != null) {
            return permissionCheck
        }
        
        return try {
            _systemState.value = DeviceControlState.BUSY
            
            // Get previous value
            val previousValue = device.state[property]
            
            // Send command to device
            val result = connector.controlDevice(device, property, value)
            
            if (result is DeviceOperationResult.Success) {
                // Update device in registry
                val updatedState = result.newState
                val updatedDevice = device.copy(state = updatedState)
                deviceRegistry[deviceId] = updatedDevice
                
                // Emit state changed event
                _deviceEvents.emit(
                    DeviceEvent.DeviceStateChangedEvent(
                        deviceId = deviceId,
                        property = property,
                        value = value,
                        previousValue = previousValue
                    )
                )
                
                // Emit device update for automation
                _deviceUpdates.emit(
                    DeviceStateUpdate(
                        deviceId = deviceId,
                        property = property,
                        value = value,
                        previousValue = previousValue
                    )
                )
            } else {
                _deviceEvents.emit(
                    DeviceEvent.DeviceErrorEvent(
                        deviceId = deviceId,
                        error = "Failed to control device: ${device.name}, property: $property"
                    )
                )
            }
            
            _systemState.value = DeviceControlState.IDLE
            result
            
        } catch (e: Exception) {
            _systemState.value = DeviceControlState.ERROR
            _deviceEvents.emit(
                DeviceEvent.ErrorEvent(
                    error = e,
                    message = "Error controlling device ${device.name}: ${e.message}"
                )
            )
            DeviceOperationResult.Error("Exception: ${e.message}")
        }
    }
    
    /**
     * Query the current state of a device
     */
    override suspend fun queryDeviceState(deviceId: String): Map<String, Any>? {
        val device = deviceRegistry[deviceId] ?: return null
        val connector = connectors[device.protocol] ?: return null
        
        return try {
            _systemState.value = DeviceControlState.BUSY
            
            val state = connector.queryDeviceState(device)
            
            if (state != null) {
                // Update device in registry
                val updatedDevice = device.copy(state = state)
                deviceRegistry[deviceId] = updatedDevice
            }
            
            _systemState.value = DeviceControlState.IDLE
            state
            
        } catch (e: Exception) {
            _systemState.value = DeviceControlState.ERROR
            _deviceEvents.emit(
                DeviceEvent.ErrorEvent(
                    error = e,
                    message = "Error querying device ${device.name} state: ${e.message}"
                )
            )
            null
        }
    }
    
    /**
     * Check if the device control operation aligns with user values
     */
    private suspend fun checkDeviceControlPermission(
        device: SmartDevice,
        property: String,
        value: Any
    ): DeviceOperationResult? {
        // For high-security devices like locks, require additional confirmation
        if (device.type == DeviceType.LOCK && property == "locked" && value == false) {
            // Request explicit confirmation from user for unlocking
            val permissionGranted = runtimeConsent.requestPermission(
                "unlock_door",
                "Sallie is attempting to unlock ${device.name}. Do you want to allow this?"
            )
            
            if (!permissionGranted) {
                return DeviceOperationResult.Rejected("User denied permission to unlock door")
            }
        }
        
        // Check with values system for any other ethical considerations
        val ethicalConcern = withContext(Dispatchers.Default) {
            valuesSystem.evaluateAction(
                action = "control_device",
                context = mapOf(
                    "device_type" to device.type.name,
                    "device_name" to device.name,
                    "property" to property,
                    "value" to value.toString()
                )
            )
        }
        
        // If there's an ethical concern, reject the operation
        if (!ethicalConcern.isAllowed) {
            return DeviceOperationResult.Rejected("Operation rejected: ${ethicalConcern.reason}")
        }
        
        return null
    }
    
    /**
     * Get the automation engine
     */
    override fun getAutomationEngine(): DeviceAutomationEngine {
        return automationEngine
    }
    
    /**
     * Execute a scene
     */
    override suspend fun executeScene(sceneId: String): Boolean {
        return try {
            _systemState.value = DeviceControlState.BUSY
            
            val success = automationEngine.executeScene(sceneId)
            
            if (success) {
                // Get scene name
                val scene = automationEngine.scenes.value.find { it.id == sceneId }
                
                // Emit scene activated event
                _deviceEvents.emit(
                    DeviceEvent.SceneEvent(
                        sceneId = sceneId,
                        sceneName = scene?.name ?: "Unknown Scene",
                        activated = true
                    )
                )
            }
            
            _systemState.value = DeviceControlState.IDLE
            success
            
        } catch (e: Exception) {
            _systemState.value = DeviceControlState.ERROR
            _deviceEvents.emit(
                DeviceEvent.ErrorEvent(
                    error = e,
                    message = "Error executing scene: ${e.message}"
                )
            )
            false
        }
    }
    
    /**
     * Handle group devices together
     */
    override suspend fun createDeviceGroup(name: String, deviceIds: List<String>): String? {
        // Validate that all devices exist
        if (!deviceIds.all { deviceRegistry.containsKey(it) }) {
            return null
        }
        
        val groupId = "group-${UUID.randomUUID()}"
        val group = DeviceGroup(
            id = groupId,
            name = name,
            deviceIds = deviceIds.toMutableList(),
            createdAt = System.currentTimeMillis()
        )
        
        // In a real implementation, we'd persist this group
        // For now, we just return the ID
        
        return groupId
    }
    
    /**
     * Control all devices in a group
     */
    override suspend fun controlDeviceGroup(
        groupId: String,
        deviceIds: List<String>,
        property: String,
        value: Any
    ): Map<String, DeviceOperationResult> {
        val results = mutableMapOf<String, DeviceOperationResult>()
        
        for (deviceId in deviceIds) {
            val result = controlDevice(deviceId, property, value)
            results[deviceId] = result
        }
        
        return results
    }
}

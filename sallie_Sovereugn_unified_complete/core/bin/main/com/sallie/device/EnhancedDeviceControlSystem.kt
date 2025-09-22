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

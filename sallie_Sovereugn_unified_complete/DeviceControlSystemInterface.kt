/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * Device Control System Interface
 */

package com.sallie.device

import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import java.util.UUID

/**
 * Interface defining the common operations for device control systems
 */
interface DeviceControlSystemInterface {
    
    /**
     * The current state of the device control system
     */
    val systemState: StateFlow<DeviceControlState>
    
    /**
     * Flow of device events
     */
    val deviceEvents: SharedFlow<DeviceEvent>
    
    /**
     * Flow of device state updates for automation
     */
    val deviceUpdates: SharedFlow<DeviceStateUpdate>
    
    /**
     * Initialize the device control system
     */
    suspend fun initialize()
    
    /**
     * Shut down the device control system
     */
    suspend fun shutdown()
    
    /**
     * Discover devices for the specified protocols
     */
    suspend fun discoverDevices(
        protocols: Set<DeviceProtocol> = setOf(
            DeviceProtocol.WIFI,
            DeviceProtocol.BLUETOOTH,
            DeviceProtocol.ZIGBEE,
            DeviceProtocol.ZWAVE
        ),
        timeoutMs: Long = 10000
    ): List<SmartDevice>
    
    /**
     * Get a list of all known devices
     */
    fun getAllDevices(): List<SmartDevice>
    
    /**
     * Get a device by ID
     */
    fun getDevice(deviceId: String): SmartDevice?
    
    /**
     * Connect to a device
     */
    suspend fun connectDevice(deviceId: String): Boolean
    
    /**
     * Disconnect from a device
     */
    suspend fun disconnectDevice(deviceId: String): Boolean
    
    /**
     * Control a device property
     */
    suspend fun controlDevice(deviceId: String, property: String, value: Any): DeviceOperationResult
    
    /**
     * Query the current state of a device
     */
    suspend fun queryDeviceState(deviceId: String): Map<String, Any>?
    
    /**
     * Get the automation engine
     */
    fun getAutomationEngine(): DeviceAutomationEngine
    
    /**
     * Execute a scene
     */
    suspend fun executeScene(sceneId: String): Boolean
    
    /**
     * Create a device group
     */
    suspend fun createDeviceGroup(name: String, deviceIds: List<String>): String?
    
    /**
     * Control all devices in a group
     */
    suspend fun controlDeviceGroup(
        groupId: String,
        deviceIds: List<String>,
        property: String,
        value: Any
    ): Map<String, DeviceOperationResult>
}


package com.sallie.core.device

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.Flow

/**
 * Interface defining common operations for device control systems.
 * This interface ensures consistency across different implementations
 * of device control functionality.
 */
interface DeviceControlSystemInterface {
    /**
     * Initialize the device control system
     */
    suspend fun initialize()
    
    /**
     * Discover devices available on the network
     * 
     * @param protocols List of protocols to use for discovery (null means all supported protocols)
     * @return A flow of discovered devices
     */
    fun discoverDevices(protocols: List<DeviceProtocol>? = null): Flow<Device>
    
    /**
     * Get a list of all known devices
     * 
     * @return List of devices
     */
    suspend fun getDevices(): List<Device>
    
    /**
     * Get a device by its ID
     * 
     * @param deviceId The unique identifier of the device
     * @return The device if found, null otherwise
     */
    suspend fun getDevice(deviceId: String): Device?
    
    /**
     * Get devices by name (may return multiple if names are not unique)
     * 
     * @param name The name of the device(s) to find
     * @return List of devices matching the name
     */
    suspend fun getDevicesByName(name: String): List<Device>
    
    /**
     * Get devices by type
     * 
     * @param type The type of devices to find
     * @return List of devices of the specified type
     */
    suspend fun getDevicesByType(type: DeviceType): List<Device>
    
    /**
     * Execute a command on a device
     * 
     * @param deviceId The unique identifier of the device
     * @param command The command to execute
     * @return Result of the command execution
     */
    suspend fun executeCommand(deviceId: String, command: DeviceCommand): DeviceCommandResult
    
    /**
     * Monitor device state changes
     * 
     * @param deviceId The unique identifier of the device to monitor (null means all devices)
     * @return A flow of device state changes
     */
    fun monitorDeviceState(deviceId: String? = null): Flow<DeviceState>
    
    /**
     * Create an automation rule
     * 
     * @param rule The automation rule to create
     * @return The created rule with its assigned ID
     */
    suspend fun createRule(rule: AutomationRule): AutomationRule
    
    /**
     * Update an existing automation rule
     * 
     * @param rule The automation rule to update
     * @return Success or failure result
     */
    suspend fun updateRule(rule: AutomationRule): Boolean
    
    /**
     * Delete an automation rule
     * 
     * @param ruleId The ID of the rule to delete
     * @return Success or failure result
     */
    suspend fun deleteRule(ruleId: String): Boolean
    
    /**
     * Get all automation rules
     * 
     * @return List of all automation rules
     */
    suspend fun getRules(): List<AutomationRule>
    
    /**
     * Trigger a specific rule manually
     * 
     * @param ruleId The ID of the rule to trigger
     * @return Result of the rule execution
     */
    suspend fun triggerRule(ruleId: String): RuleExecutionResult
    
    /**
     * Create a scene (a collection of device states)
     * 
     * @param scene The scene to create
     * @return The created scene with its assigned ID
     */
    suspend fun createScene(scene: Scene): Scene
    
    /**
     * Update an existing scene
     * 
     * @param scene The scene to update
     * @return Success or failure result
     */
    suspend fun updateScene(scene: Scene): Boolean
    
    /**
     * Delete a scene
     * 
     * @param sceneId The ID of the scene to delete
     * @return Success or failure result
     */
    suspend fun deleteScene(sceneId: String): Boolean
    
    /**
     * Get all scenes
     * 
     * @return List of all scenes
     */
    suspend fun getScenes(): List<Scene>
    
    /**
     * Execute a scene
     * 
     * @param sceneId The ID of the scene to execute
     * @return Result of the scene execution
     */
    suspend fun executeScene(sceneId: String): SceneExecutionResult
}


/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * Device Control System Interface
 */

package com.sallie.device

import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import java.util.UUID

/**
 * Interface defining the common operations for device control systems
 */
interface DeviceControlSystemInterface {
    
    /**
     * The current state of the device control system
     */
    val systemState: StateFlow<DeviceControlState>
    
    /**
     * Flow of device events
     */
    val deviceEvents: SharedFlow<DeviceEvent>
    
    /**
     * Flow of device state updates for automation
     */
    val deviceUpdates: SharedFlow<DeviceStateUpdate>
    
    /**
     * Initialize the device control system
     */
    suspend fun initialize()
    
    /**
     * Shut down the device control system
     */
    suspend fun shutdown()
    
    /**
     * Discover devices for the specified protocols
     */
    suspend fun discoverDevices(
        protocols: Set<DeviceProtocol> = setOf(
            DeviceProtocol.WIFI,
            DeviceProtocol.BLUETOOTH,
            DeviceProtocol.ZIGBEE,
            DeviceProtocol.ZWAVE
        ),
        timeoutMs: Long = 10000
    ): List<SmartDevice>
    
    /**
     * Get a list of all known devices
     */
    fun getAllDevices(): List<SmartDevice>
    
    /**
     * Get a device by ID
     */
    fun getDevice(deviceId: String): SmartDevice?
    
    /**
     * Connect to a device
     */
    suspend fun connectDevice(deviceId: String): Boolean
    
    /**
     * Disconnect from a device
     */
    suspend fun disconnectDevice(deviceId: String): Boolean
    
    /**
     * Control a device property
     */
    suspend fun controlDevice(deviceId: String, property: String, value: Any): DeviceOperationResult
    
    /**
     * Query the current state of a device
     */
    suspend fun queryDeviceState(deviceId: String): Map<String, Any>?
    
    /**
     * Get the automation engine
     */
    fun getAutomationEngine(): DeviceAutomationEngine
    
    /**
     * Execute a scene
     */
    suspend fun executeScene(sceneId: String): Boolean
    
    /**
     * Create a device group
     */
    suspend fun createDeviceGroup(name: String, deviceIds: List<String>): String?
    
    /**
     * Control all devices in a group
     */
    suspend fun controlDeviceGroup(
        groupId: String,
        deviceIds: List<String>,
        property: String,
        value: Any
    ): Map<String, DeviceOperationResult>
}


/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * Device Control System Interface
 */

package com.sallie.device

import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import java.util.UUID

/**
 * Interface defining the common operations for device control systems
 */
interface DeviceControlSystemInterface {
    
    /**
     * The current state of the device control system
     */
    val systemState: StateFlow<DeviceControlState>
    
    /**
     * Flow of device events
     */
    val deviceEvents: SharedFlow<DeviceEvent>
    
    /**
     * Flow of device state updates for automation
     */
    val deviceUpdates: SharedFlow<DeviceStateUpdate>
    
    /**
     * Initialize the device control system
     */
    suspend fun initialize()
    
    /**
     * Shut down the device control system
     */
    suspend fun shutdown()
    
    /**
     * Discover devices for the specified protocols
     */
    suspend fun discoverDevices(
        protocols: Set<DeviceProtocol> = setOf(
            DeviceProtocol.WIFI,
            DeviceProtocol.BLUETOOTH,
            DeviceProtocol.ZIGBEE,
            DeviceProtocol.ZWAVE
        ),
        timeoutMs: Long = 10000
    ): List<SmartDevice>
    
    /**
     * Get a list of all known devices
     */
    fun getAllDevices(): List<SmartDevice>
    
    /**
     * Get a device by ID
     */
    fun getDevice(deviceId: String): SmartDevice?
    
    /**
     * Connect to a device
     */
    suspend fun connectDevice(deviceId: String): Boolean
    
    /**
     * Disconnect from a device
     */
    suspend fun disconnectDevice(deviceId: String): Boolean
    
    /**
     * Control a device property
     */
    suspend fun controlDevice(deviceId: String, property: String, value: Any): DeviceOperationResult
    
    /**
     * Query the current state of a device
     */
    suspend fun queryDeviceState(deviceId: String): Map<String, Any>?
    
    /**
     * Get the automation engine
     */
    fun getAutomationEngine(): DeviceAutomationEngine
    
    /**
     * Execute a scene
     */
    suspend fun executeScene(sceneId: String): Boolean
    
    /**
     * Create a device group
     */
    suspend fun createDeviceGroup(name: String, deviceIds: List<String>): String?
    
    /**
     * Control all devices in a group
     */
    suspend fun controlDeviceGroup(
        groupId: String,
        deviceIds: List<String>,
        property: String,
        value: Any
    ): Map<String, DeviceOperationResult>
}


package com.sallie.core.device

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.Flow

/**
 * Interface defining common operations for device control systems.
 * This interface ensures consistency across different implementations
 * of device control functionality.
 */
interface DeviceControlSystemInterface {
    /**
     * Initialize the device control system
     */
    suspend fun initialize()
    
    /**
     * Discover devices available on the network
     * 
     * @param protocols List of protocols to use for discovery (null means all supported protocols)
     * @return A flow of discovered devices
     */
    fun discoverDevices(protocols: List<DeviceProtocol>? = null): Flow<Device>
    
    /**
     * Get a list of all known devices
     * 
     * @return List of devices
     */
    suspend fun getDevices(): List<Device>
    
    /**
     * Get a device by its ID
     * 
     * @param deviceId The unique identifier of the device
     * @return The device if found, null otherwise
     */
    suspend fun getDevice(deviceId: String): Device?
    
    /**
     * Get devices by name (may return multiple if names are not unique)
     * 
     * @param name The name of the device(s) to find
     * @return List of devices matching the name
     */
    suspend fun getDevicesByName(name: String): List<Device>
    
    /**
     * Get devices by type
     * 
     * @param type The type of devices to find
     * @return List of devices of the specified type
     */
    suspend fun getDevicesByType(type: DeviceType): List<Device>
    
    /**
     * Execute a command on a device
     * 
     * @param deviceId The unique identifier of the device
     * @param command The command to execute
     * @return Result of the command execution
     */
    suspend fun executeCommand(deviceId: String, command: DeviceCommand): DeviceCommandResult
    
    /**
     * Monitor device state changes
     * 
     * @param deviceId The unique identifier of the device to monitor (null means all devices)
     * @return A flow of device state changes
     */
    fun monitorDeviceState(deviceId: String? = null): Flow<DeviceState>
    
    /**
     * Create an automation rule
     * 
     * @param rule The automation rule to create
     * @return The created rule with its assigned ID
     */
    suspend fun createRule(rule: AutomationRule): AutomationRule
    
    /**
     * Update an existing automation rule
     * 
     * @param rule The automation rule to update
     * @return Success or failure result
     */
    suspend fun updateRule(rule: AutomationRule): Boolean
    
    /**
     * Delete an automation rule
     * 
     * @param ruleId The ID of the rule to delete
     * @return Success or failure result
     */
    suspend fun deleteRule(ruleId: String): Boolean
    
    /**
     * Get all automation rules
     * 
     * @return List of all automation rules
     */
    suspend fun getRules(): List<AutomationRule>
    
    /**
     * Trigger a specific rule manually
     * 
     * @param ruleId The ID of the rule to trigger
     * @return Result of the rule execution
     */
    suspend fun triggerRule(ruleId: String): RuleExecutionResult
    
    /**
     * Create a scene (a collection of device states)
     * 
     * @param scene The scene to create
     * @return The created scene with its assigned ID
     */
    suspend fun createScene(scene: Scene): Scene
    
    /**
     * Update an existing scene
     * 
     * @param scene The scene to update
     * @return Success or failure result
     */
    suspend fun updateScene(scene: Scene): Boolean
    
    /**
     * Delete a scene
     * 
     * @param sceneId The ID of the scene to delete
     * @return Success or failure result
     */
    suspend fun deleteScene(sceneId: String): Boolean
    
    /**
     * Get all scenes
     * 
     * @return List of all scenes
     */
    suspend fun getScenes(): List<Scene>
    
    /**
     * Execute a scene
     * 
     * @param sceneId The ID of the scene to execute
     * @return Result of the scene execution
     */
    suspend fun executeScene(sceneId: String): SceneExecutionResult
}


/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * Device Control System Interface
 */

package com.sallie.device

import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import java.util.UUID

/**
 * Interface defining the common operations for device control systems
 */
interface DeviceControlSystemInterface {
    
    /**
     * The current state of the device control system
     */
    val systemState: StateFlow<DeviceControlState>
    
    /**
     * Flow of device events
     */
    val deviceEvents: SharedFlow<DeviceEvent>
    
    /**
     * Flow of device state updates for automation
     */
    val deviceUpdates: SharedFlow<DeviceStateUpdate>
    
    /**
     * Initialize the device control system
     */
    suspend fun initialize()
    
    /**
     * Shut down the device control system
     */
    suspend fun shutdown()
    
    /**
     * Discover devices for the specified protocols
     */
    suspend fun discoverDevices(
        protocols: Set<DeviceProtocol> = setOf(
            DeviceProtocol.WIFI,
            DeviceProtocol.BLUETOOTH,
            DeviceProtocol.ZIGBEE,
            DeviceProtocol.ZWAVE
        ),
        timeoutMs: Long = 10000
    ): List<SmartDevice>
    
    /**
     * Get a list of all known devices
     */
    fun getAllDevices(): List<SmartDevice>
    
    /**
     * Get a device by ID
     */
    fun getDevice(deviceId: String): SmartDevice?
    
    /**
     * Connect to a device
     */
    suspend fun connectDevice(deviceId: String): Boolean
    
    /**
     * Disconnect from a device
     */
    suspend fun disconnectDevice(deviceId: String): Boolean
    
    /**
     * Control a device property
     */
    suspend fun controlDevice(deviceId: String, property: String, value: Any): DeviceOperationResult
    
    /**
     * Query the current state of a device
     */
    suspend fun queryDeviceState(deviceId: String): Map<String, Any>?
    
    /**
     * Get the automation engine
     */
    fun getAutomationEngine(): DeviceAutomationEngine
    
    /**
     * Execute a scene
     */
    suspend fun executeScene(sceneId: String): Boolean
    
    /**
     * Create a device group
     */
    suspend fun createDeviceGroup(name: String, deviceIds: List<String>): String?
    
    /**
     * Control all devices in a group
     */
    suspend fun controlDeviceGroup(
        groupId: String,
        deviceIds: List<String>,
        property: String,
        value: Any
    ): Map<String, DeviceOperationResult>
}

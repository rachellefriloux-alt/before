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

package com.sallie.core.device

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow

/**
 * Interface for protocol-specific device connectors
 */
interface DeviceConnector {
    /**
     * Flow of discovered devices
     */
    val deviceDiscoveries: SharedFlow<Device>
    
    /**
     * Flow of device state updates
     */
    val stateUpdates: SharedFlow<DeviceState>
    
    /**
     * Initialize the connector
     */
    suspend fun initialize()
    
    /**
     * Start device discovery
     */
    suspend fun startDiscovery()
    
    /**
     * Stop device discovery
     */
    suspend fun stopDiscovery()
    
    /**
     * Connect to a specific device
     */
    suspend fun connectDevice(device: Device): Boolean
    
    /**
     * Disconnect from a specific device
     */
    suspend fun disconnectDevice(device: Device): Boolean
    
    /**
     * Execute a command on a device
     */
    suspend fun executeCommand(device: Device, command: DeviceCommand): DeviceCommandResult
}

/**
 * Base class for device connectors with common functionality
 */
abstract class BaseDeviceConnector(protected val scope: CoroutineScope) : DeviceConnector {
    protected val _deviceDiscoveries = MutableSharedFlow<Device>()
    override val deviceDiscoveries: SharedFlow<Device> = _deviceDiscoveries
    
    protected val _stateUpdates = MutableSharedFlow<DeviceState>()
    override val stateUpdates: SharedFlow<DeviceState> = _stateUpdates
    
    protected var discovering = false
    
    override suspend fun initialize() {
        // Base initialization - override in subclasses
    }
    
    override suspend fun stopDiscovery() {
        discovering = false
    }
}

/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * SystemManager - Interface for system control operations
 */

package com.sallie.phonecontrol.system

import kotlinx.coroutines.flow.Flow

/**
 * Interface for managing and controlling system-level operations
 * This includes settings, connectivity, and general device management
 */
interface SystemManager {

    /**
     * Data class representing system status
     */
    data class SystemStatus(
        val batteryLevel: Int, // 0-100
        val batteryCharging: Boolean,
        val batteryTemperature: Float,
        val availableMemory: Long, // in bytes
        val totalMemory: Long, // in bytes
        val availableStorage: Long, // in bytes
        val totalStorage: Long, // in bytes
        val cpuUsage: Float, // 0-100
        val isInPowerSaveMode: Boolean,
        val isInAirplaneMode: Boolean,
        val isScreenOn: Boolean,
        val deviceUptime: Long // in milliseconds
    )
    
    /**
     * Data class representing connectivity status
     */
    data class ConnectivityStatus(
        val isWifiConnected: Boolean,
        val wifiNetworkName: String?,
        val wifiSignalStrength: Int, // 0-4
        val isMobileDataConnected: Boolean,
        val mobileNetworkType: String?, // "LTE", "5G", etc.
        val mobileSignalStrength: Int, // 0-4
        val isBluetoothEnabled: Boolean,
        val isBluetoothConnected: Boolean,
        val bluetoothDeviceCount: Int,
        val isLocationEnabled: Boolean,
        val isNfcEnabled: Boolean,
        val isHotspotEnabled: Boolean
    )
    
    /**
     * System event types
     */
    sealed class SystemEvent {
        data class BatteryLevelChanged(val level: Int, val isCharging: Boolean) : SystemEvent()
        data class PowerSaveModeChanged(val enabled: Boolean) : SystemEvent()
        data class AirplaneModeChanged(val enabled: Boolean) : SystemEvent()
        data class ConnectivityChanged(val status: ConnectivityStatus) : SystemEvent()
        data class ScreenStateChanged(val isScreenOn: Boolean) : SystemEvent()
        data class BluetoothStateChanged(val isEnabled: Boolean, val isConnected: Boolean) : SystemEvent()
        data class WifiStateChanged(val isEnabled: Boolean, val isConnected: Boolean, val networkName: String?) : SystemEvent()
        data class LocationStateChanged(val isEnabled: Boolean) : SystemEvent()
    }
    
    /**
     * Flow of system events
     */
    val systemEvents: Flow<SystemEvent>
    
    /**
     * Get current system status
     * 
     * @return Result containing SystemStatus or an error
     */
    suspend fun getSystemStatus(): Result<SystemStatus>
    
    /**
     * Get current connectivity status
     * 
     * @return Result containing ConnectivityStatus or an error
     */
    suspend fun getConnectivityStatus(): Result<ConnectivityStatus>
    
    /**
     * Toggle Wi-Fi on or off
     * 
     * @param enable True to enable, false to disable
     * @return Result indicating success or failure
     */
    suspend fun toggleWifi(enable: Boolean): Result<Unit>
    
    /**
     * Toggle Bluetooth on or off
     * 
     * @param enable True to enable, false to disable
     * @return Result indicating success or failure
     */
    suspend fun toggleBluetooth(enable: Boolean): Result<Unit>
    
    /**
     * Toggle mobile data on or off
     * 
     * @param enable True to enable, false to disable
     * @return Result indicating success or failure
     */
    suspend fun toggleMobileData(enable: Boolean): Result<Unit>
    
    /**
     * Toggle airplane mode on or off
     * 
     * @param enable True to enable, false to disable
     * @return Result indicating success or failure
     */
    suspend fun toggleAirplaneMode(enable: Boolean): Result<Unit>
    
    /**
     * Toggle location services on or off
     * 
     * @param enable True to enable, false to disable
     * @return Result indicating success or failure
     */
    suspend fun toggleLocationServices(enable: Boolean): Result<Unit>
    
    /**
     * Set screen brightness
     * 
     * @param brightness Level between 0 and 1
     * @return Result indicating success or failure
     */
    suspend fun setScreenBrightness(brightness: Float): Result<Unit>
    
    /**
     * Get current screen brightness
     * 
     * @return Result containing brightness level between 0 and 1, or an error
     */
    suspend fun getScreenBrightness(): Result<Float>
    
    /**
     * Set screen timeout
     * 
     * @param seconds Timeout in seconds
     * @return Result indicating success or failure
     */
    suspend fun setScreenTimeout(seconds: Int): Result<Unit>
    
    /**
     * Get current screen timeout
     * 
     * @return Result containing timeout in seconds, or an error
     */
    suspend fun getScreenTimeout(): Result<Int>
    
    /**
     * Toggle auto-rotate on or off
     * 
     * @param enable True to enable, false to disable
     * @return Result indicating success or failure
     */
    suspend fun toggleAutoRotate(enable: Boolean): Result<Unit>
    
    /**
     * Check if auto-rotate is enabled
     * 
     * @return Result containing boolean indicating if auto-rotate is enabled, or an error
     */
    suspend fun isAutoRotateEnabled(): Result<Boolean>
    
    /**
     * Set device volume
     * 
     * @param volumeType Type of volume (RING, MEDIA, ALARM, etc.)
     * @param volume Level between 0 and 1
     * @return Result indicating success or failure
     */
    suspend fun setVolume(volumeType: VolumeType, volume: Float): Result<Unit>
    
    /**
     * Get current device volume
     * 
     * @param volumeType Type of volume (RING, MEDIA, ALARM, etc.)
     * @return Result containing volume level between 0 and 1, or an error
     */
    suspend fun getVolume(volumeType: VolumeType): Result<Float>
    
    /**
     * Toggle do not disturb mode on or off
     * 
     * @param enable True to enable, false to disable
     * @return Result indicating success or failure
     */
    suspend fun toggleDoNotDisturb(enable: Boolean): Result<Unit>
    
    /**
     * Check if do not disturb is enabled
     * 
     * @return Result containing boolean indicating if DND is enabled, or an error
     */
    suspend fun isDoNotDisturbEnabled(): Result<Boolean>
    
    /**
     * Check if system control functionality is available on this device
     * 
     * @return true if available, false otherwise
     */
    suspend fun isSystemControlFunctionalityAvailable(): Boolean
    
    /**
     * Volume types
     */
    enum class VolumeType {
        RING,
        MEDIA,
        ALARM,
        NOTIFICATION,
        SYSTEM,
        VOICE_CALL
    }
}

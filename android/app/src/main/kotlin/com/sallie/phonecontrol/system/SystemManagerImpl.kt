/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * SystemManagerImpl - Implementation for system control operations
 */

package com.sallie.phonecontrol.system

import android.Manifest
import android.app.NotificationManager
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.location.LocationManager
import android.media.AudioManager
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import android.net.wifi.WifiManager
import android.os.BatteryManager
import android.os.Build
import android.os.Environment
import android.os.PowerManager
import android.os.StatFs
import android.provider.Settings
import androidx.core.app.ActivityCompat
import com.sallie.phonecontrol.PermissionManager
import com.sallie.phonecontrol.PhoneControlEvent
import com.sallie.phonecontrol.PhoneControlManager
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.merge

/**
 * Implementation of SystemManager for managing system settings and status
 */
class SystemManagerImpl(
    private val context: Context,
    private val permissionManager: PermissionManager,
    private val phoneControlManager: PhoneControlManager
) : SystemManager {

    private val _systemEvents = MutableSharedFlow<SystemManager.SystemEvent>(extraBufferCapacity = 10)
    
    companion object {
        private const val SYSTEM_CONTROL_CONSENT_ACTION = "system_control"
    }
    
    private val batteryEvents = callbackFlow {
        val receiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context, intent: Intent) {
                when (intent.action) {
                    Intent.ACTION_BATTERY_CHANGED -> {
                        val level = intent.getIntExtra(BatteryManager.EXTRA_LEVEL, -1)
                        val scale = intent.getIntExtra(BatteryManager.EXTRA_SCALE, -1)
                        val batteryLevel = level * 100 / scale
                        
                        val status = intent.getIntExtra(BatteryManager.EXTRA_STATUS, -1)
                        val isCharging = status == BatteryManager.BATTERY_STATUS_CHARGING || 
                                         status == BatteryManager.BATTERY_STATUS_FULL
                        
                        val event = SystemManager.SystemEvent.BatteryLevelChanged(batteryLevel, isCharging)
                        trySend(event)
                        _systemEvents.tryEmit(event)
                    }
                    Intent.ACTION_POWER_CONNECTED -> {
                        // Handle power connected
                    }
                    Intent.ACTION_POWER_DISCONNECTED -> {
                        // Handle power disconnected
                    }
                }
            }
        }
        
        val filter = IntentFilter().apply {
            addAction(Intent.ACTION_BATTERY_CHANGED)
            addAction(Intent.ACTION_POWER_CONNECTED)
            addAction(Intent.ACTION_POWER_DISCONNECTED)
        }
        
        context.registerReceiver(receiver, filter)
        
        awaitClose {
            context.unregisterReceiver(receiver)
        }
    }
    
    private val powerSaveModeEvents = callbackFlow {
        val receiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context, intent: Intent) {
                if (intent.action == PowerManager.ACTION_POWER_SAVE_MODE_CHANGED) {
                    val powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager
                    val isPowerSaveMode = powerManager.isPowerSaveMode
                    
                    val event = SystemManager.SystemEvent.PowerSaveModeChanged(isPowerSaveMode)
                    trySend(event)
                    _systemEvents.tryEmit(event)
                }
            }
        }
        
        val filter = IntentFilter(PowerManager.ACTION_POWER_SAVE_MODE_CHANGED)
        context.registerReceiver(receiver, filter)
        
        awaitClose {
            context.unregisterReceiver(receiver)
        }
    }
    
    private val airplaneModeEvents = callbackFlow {
        val receiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context, intent: Intent) {
                if (intent.action == Intent.ACTION_AIRPLANE_MODE_CHANGED) {
                    val isAirplaneModeOn = Settings.System.getInt(
                        context.contentResolver,
                        Settings.Global.AIRPLANE_MODE_ON,
                        0
                    ) != 0
                    
                    val event = SystemManager.SystemEvent.AirplaneModeChanged(isAirplaneModeOn)
                    trySend(event)
                    _systemEvents.tryEmit(event)
                }
            }
        }
        
        val filter = IntentFilter(Intent.ACTION_AIRPLANE_MODE_CHANGED)
        context.registerReceiver(receiver, filter)
        
        awaitClose {
            context.unregisterReceiver(receiver)
        }
    }
    
    private val connectivityEvents = callbackFlow {
        val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        
        val networkCallback = object : ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network: Network) {
                super.onAvailable(network)
                val status = getConnectivityStatus().getOrNull() ?: return
                
                val event = SystemManager.SystemEvent.ConnectivityChanged(status)
                trySend(event)
                _systemEvents.tryEmit(event)
            }
            
            override fun onLost(network: Network) {
                super.onLost(network)
                val status = getConnectivityStatus().getOrNull() ?: return
                
                val event = SystemManager.SystemEvent.ConnectivityChanged(status)
                trySend(event)
                _systemEvents.tryEmit(event)
            }
            
            override fun onCapabilitiesChanged(network: Network, networkCapabilities: NetworkCapabilities) {
                super.onCapabilitiesChanged(network, networkCapabilities)
                val status = getConnectivityStatus().getOrNull() ?: return
                
                val event = SystemManager.SystemEvent.ConnectivityChanged(status)
                trySend(event)
                _systemEvents.tryEmit(event)
            }
        }
        
        val networkRequest = NetworkRequest.Builder()
            .addTransportType(NetworkCapabilities.TRANSPORT_WIFI)
            .addTransportType(NetworkCapabilities.TRANSPORT_CELLULAR)
            .build()
        
        connectivityManager.registerNetworkCallback(networkRequest, networkCallback)
        
        awaitClose {
            connectivityManager.unregisterNetworkCallback(networkCallback)
        }
    }
    
    private val screenEvents = callbackFlow {
        val receiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context, intent: Intent) {
                when (intent.action) {
                    Intent.ACTION_SCREEN_ON -> {
                        val event = SystemManager.SystemEvent.ScreenStateChanged(true)
                        trySend(event)
                        _systemEvents.tryEmit(event)
                    }
                    Intent.ACTION_SCREEN_OFF -> {
                        val event = SystemManager.SystemEvent.ScreenStateChanged(false)
                        trySend(event)
                        _systemEvents.tryEmit(event)
                    }
                }
            }
        }
        
        val filter = IntentFilter().apply {
            addAction(Intent.ACTION_SCREEN_ON)
            addAction(Intent.ACTION_SCREEN_OFF)
        }
        
        context.registerReceiver(receiver, filter)
        
        awaitClose {
            context.unregisterReceiver(receiver)
        }
    }
    
    private val bluetoothEvents = callbackFlow {
        val receiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context, intent: Intent) {
                when (intent.action) {
                    BluetoothAdapter.ACTION_STATE_CHANGED -> {
                        val state = intent.getIntExtra(
                            BluetoothAdapter.EXTRA_STATE,
                            BluetoothAdapter.ERROR
                        )
                        
                        val isEnabled = state == BluetoothAdapter.STATE_ON
                        val bluetoothManager = context.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
                        val isConnected = bluetoothManager.adapter?.bondedDevices?.isNotEmpty() == true
                        
                        val event = SystemManager.SystemEvent.BluetoothStateChanged(isEnabled, isConnected)
                        trySend(event)
                        _systemEvents.tryEmit(event)
                    }
                    BluetoothAdapter.ACTION_CONNECTION_STATE_CHANGED -> {
                        val state = intent.getIntExtra(
                            BluetoothAdapter.EXTRA_CONNECTION_STATE,
                            BluetoothAdapter.STATE_DISCONNECTED
                        )
                        
                        val bluetoothManager = context.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
                        val isEnabled = bluetoothManager.adapter?.isEnabled == true
                        val isConnected = state == BluetoothAdapter.STATE_CONNECTED
                        
                        val event = SystemManager.SystemEvent.BluetoothStateChanged(isEnabled, isConnected)
                        trySend(event)
                        _systemEvents.tryEmit(event)
                    }
                }
            }
        }
        
        val filter = IntentFilter().apply {
            addAction(BluetoothAdapter.ACTION_STATE_CHANGED)
            addAction(BluetoothAdapter.ACTION_CONNECTION_STATE_CHANGED)
        }
        
        context.registerReceiver(receiver, filter)
        
        awaitClose {
            context.unregisterReceiver(receiver)
        }
    }
    
    private val wifiEvents = callbackFlow {
        val receiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context, intent: Intent) {
                when (intent.action) {
                    WifiManager.WIFI_STATE_CHANGED_ACTION -> {
                        val wifiManager = context.getSystemService(Context.WIFI_SERVICE) as WifiManager
                        val isEnabled = wifiManager.isWifiEnabled
                        val isConnected = wifiManager.connectionInfo?.networkId != -1
                        val networkName = if (isConnected) wifiManager.connectionInfo?.ssid else null
                        
                        val event = SystemManager.SystemEvent.WifiStateChanged(isEnabled, isConnected, networkName)
                        trySend(event)
                        _systemEvents.tryEmit(event)
                    }
                    WifiManager.NETWORK_STATE_CHANGED_ACTION -> {
                        val wifiManager = context.getSystemService(Context.WIFI_SERVICE) as WifiManager
                        val isEnabled = wifiManager.isWifiEnabled
                        val isConnected = wifiManager.connectionInfo?.networkId != -1
                        val networkName = if (isConnected) wifiManager.connectionInfo?.ssid else null
                        
                        val event = SystemManager.SystemEvent.WifiStateChanged(isEnabled, isConnected, networkName)
                        trySend(event)
                        _systemEvents.tryEmit(event)
                    }
                }
            }
        }
        
        val filter = IntentFilter().apply {
            addAction(WifiManager.WIFI_STATE_CHANGED_ACTION)
            addAction(WifiManager.NETWORK_STATE_CHANGED_ACTION)
        }
        
        context.registerReceiver(receiver, filter)
        
        awaitClose {
            context.unregisterReceiver(receiver)
        }
    }
    
    private val locationEvents = callbackFlow {
        val receiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context, intent: Intent) {
                if (intent.action == LocationManager.PROVIDERS_CHANGED_ACTION) {
                    val locationManager = context.getSystemService(Context.LOCATION_SERVICE) as LocationManager
                    val isEnabled = isLocationEnabled(locationManager)
                    
                    val event = SystemManager.SystemEvent.LocationStateChanged(isEnabled)
                    trySend(event)
                    _systemEvents.tryEmit(event)
                }
            }
        }
        
        val filter = IntentFilter(LocationManager.PROVIDERS_CHANGED_ACTION)
        context.registerReceiver(receiver, filter)
        
        awaitClose {
            context.unregisterReceiver(receiver)
        }
    }
    
    override val systemEvents: Flow<SystemManager.SystemEvent> = merge(
        batteryEvents,
        powerSaveModeEvents,
        airplaneModeEvents,
        connectivityEvents,
        screenEvents,
        bluetoothEvents,
        wifiEvents,
        locationEvents
    )
    
    override suspend fun getSystemStatus(): Result<SystemManager.SystemStatus> {
        // Check user consent
        if (!permissionManager.hasUserConsent(SYSTEM_CONTROL_CONSENT_ACTION)) {
            return Result.failure(SecurityException("User has not given consent to access system status"))
        }
        
        return try {
            // Battery info
            val batteryManager = context.getSystemService(Context.BATTERY_SERVICE) as BatteryManager
            val batteryLevel = batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
            val batteryCharging = batteryManager.isCharging
            val batteryTemp = batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_TEMPERATURE) / 10f
            
            // Memory info
            val activityManager = context.getSystemService(Context.ACTIVITY_SERVICE) as android.app.ActivityManager
            val memoryInfo = android.app.ActivityManager.MemoryInfo()
            activityManager.getMemoryInfo(memoryInfo)
            val availableMemory = memoryInfo.availMem
            val totalMemory = memoryInfo.totalMem
            
            // Storage info
            val stat = StatFs(Environment.getDataDirectory().path)
            val blockSize = stat.blockSizeLong
            val availableBlocks = stat.availableBlocksLong
            val totalBlocks = stat.blockCountLong
            val availableStorage = availableBlocks * blockSize
            val totalStorage = totalBlocks * blockSize
            
            // CPU usage (approximation, as accurate CPU usage requires native code)
            val cpuUsage = getCpuUsage()
            
            // Power save mode
            val powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager
            val isInPowerSaveMode = powerManager.isPowerSaveMode
            
            // Airplane mode
            val isInAirplaneMode = Settings.System.getInt(
                context.contentResolver,
                Settings.Global.AIRPLANE_MODE_ON,
                0
            ) != 0
            
            // Screen state
            val isScreenOn = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT_WATCH) {
                powerManager.isInteractive
            } else {
                @Suppress("DEPRECATION")
                powerManager.isScreenOn
            }
            
            // Device uptime
            val deviceUptime = android.os.SystemClock.elapsedRealtime()
            
            val systemStatus = SystemManager.SystemStatus(
                batteryLevel = batteryLevel,
                batteryCharging = batteryCharging,
                batteryTemperature = batteryTemp,
                availableMemory = availableMemory,
                totalMemory = totalMemory,
                availableStorage = availableStorage,
                totalStorage = totalStorage,
                cpuUsage = cpuUsage,
                isInPowerSaveMode = isInPowerSaveMode,
                isInAirplaneMode = isInAirplaneMode,
                isScreenOn = isScreenOn,
                deviceUptime = deviceUptime
            )
            
            Result.success(systemStatus)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun getConnectivityStatus(): Result<SystemManager.ConnectivityStatus> {
        // Check user consent
        if (!permissionManager.hasUserConsent(SYSTEM_CONTROL_CONSENT_ACTION)) {
            return Result.failure(SecurityException("User has not given consent to access connectivity status"))
        }
        
        return try {
            val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
            val wifiManager = context.getSystemService(Context.WIFI_SERVICE) as WifiManager
            
            // Wi-Fi status
            val isWifiConnected = false
            var wifiNetworkName: String? = null
            var wifiSignalStrength = 0
            
            if (wifiManager.isWifiEnabled) {
                val wifiInfo = wifiManager.connectionInfo
                if (wifiInfo != null && wifiInfo.networkId != -1) {
                    wifiNetworkName = wifiInfo.ssid?.removeSurrounding("\"")
                    wifiSignalStrength = WifiManager.calculateSignalLevel(
                        wifiInfo.rssi,
                        5 // 5 levels (0-4)
                    )
                }
            }
            
            // Mobile data status
            var isMobileDataConnected = false
            var mobileNetworkType: String? = null
            var mobileSignalStrength = 0
            
            val networkCapabilities = connectivityManager.getNetworkCapabilities(
                connectivityManager.activeNetwork
            )
            
            if (networkCapabilities != null) {
                isWifiConnected = networkCapabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI)
                isMobileDataConnected = networkCapabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR)
            }
            
            // Determine network type and signal strength
            // This is simplified as getting actual values requires telephony API
            if (isMobileDataConnected) {
                mobileNetworkType = "Unknown" // Would need telephony manager to get actual type
                mobileSignalStrength = 2 // Default to medium signal (0-4)
            }
            
            // Bluetooth status
            val bluetoothManager = context.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
            val isBluetoothEnabled = bluetoothManager.adapter?.isEnabled == true
            var isBluetoothConnected = false
            var bluetoothDeviceCount = 0
            
            if (isBluetoothEnabled && bluetoothManager.adapter != null) {
                if (ActivityCompat.checkSelfPermission(
                        context,
                        Manifest.permission.BLUETOOTH_CONNECT
                    ) == PackageManager.PERMISSION_GRANTED
                ) {
                    val bondedDevices = bluetoothManager.adapter.bondedDevices
                    bluetoothDeviceCount = bondedDevices.size
                    isBluetoothConnected = bondedDevices.isNotEmpty()
                }
            }
            
            // Location status
            val locationManager = context.getSystemService(Context.LOCATION_SERVICE) as LocationManager
            val isLocationEnabled = isLocationEnabled(locationManager)
            
            // NFC status
            val packageManager = context.packageManager
            val hasNfc = packageManager.hasSystemFeature(PackageManager.FEATURE_NFC)
            val nfcAdapter = android.nfc.NfcAdapter.getDefaultAdapter(context)
            val isNfcEnabled = hasNfc && nfcAdapter != null && nfcAdapter.isEnabled
            
            // Hotspot status
            var isHotspotEnabled = false
            try {
                // This is not easily accessible through public API
                // Usually requires reflection or system-level permissions
                // Simplified check
                isHotspotEnabled = wifiManager.javaClass.getMethod("isWifiApEnabled").invoke(wifiManager) as Boolean
            } catch (e: Exception) {
                // Couldn't determine hotspot status
            }
            
            val connectivityStatus = SystemManager.ConnectivityStatus(
                isWifiConnected = isWifiConnected,
                wifiNetworkName = wifiNetworkName,
                wifiSignalStrength = wifiSignalStrength,
                isMobileDataConnected = isMobileDataConnected,
                mobileNetworkType = mobileNetworkType,
                mobileSignalStrength = mobileSignalStrength,
                isBluetoothEnabled = isBluetoothEnabled,
                isBluetoothConnected = isBluetoothConnected,
                bluetoothDeviceCount = bluetoothDeviceCount,
                isLocationEnabled = isLocationEnabled,
                isNfcEnabled = isNfcEnabled,
                isHotspotEnabled = isHotspotEnabled
            )
            
            Result.success(connectivityStatus)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun toggleWifi(enable: Boolean): Result<Unit> {
        // Check user consent
        if (!permissionManager.hasUserConsent(SYSTEM_CONTROL_CONSENT_ACTION)) {
            return Result.failure(SecurityException("User has not given consent to control Wi-Fi settings"))
        }
        
        return try {
            val wifiManager = context.getSystemService(Context.WIFI_SERVICE) as WifiManager
            
            // On newer Android versions, you can't directly enable/disable Wi-Fi
            // Instead, direct the user to settings
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                val panelIntent = Intent(Settings.Panel.ACTION_WIFI)
                panelIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                context.startActivity(panelIntent)
                
                // Log the event
                phoneControlManager.logEvent(
                    PhoneControlEvent.SystemSettingChanged(
                        settingName = "Wi-Fi",
                        newValue = if (enable) "Enabled" else "Disabled",
                        initiatedBy = "Sallie"
                    )
                )
                
                // Return success even though we're just showing the panel
                return Result.success(Unit)
            }
            
            // For older versions, we can directly toggle Wi-Fi
            @Suppress("DEPRECATION")
            wifiManager.isWifiEnabled = enable
            
            // Log the event
            phoneControlManager.logEvent(
                PhoneControlEvent.SystemSettingChanged(
                    settingName = "Wi-Fi",
                    newValue = if (enable) "Enabled" else "Disabled",
                    initiatedBy = "Sallie"
                )
            )
            
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun toggleBluetooth(enable: Boolean): Result<Unit> {
        // Check user consent
        if (!permissionManager.hasUserConsent(SYSTEM_CONTROL_CONSENT_ACTION)) {
            return Result.failure(SecurityException("User has not given consent to control Bluetooth settings"))
        }
        
        return try {
            val bluetoothManager = context.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
            val bluetoothAdapter = bluetoothManager.adapter ?: return Result.failure(
                IllegalStateException("Bluetooth adapter not available")
            )
            
            // Check permission
            if (ActivityCompat.checkSelfPermission(
                    context,
                    Manifest.permission.BLUETOOTH_CONNECT
                ) != PackageManager.PERMISSION_GRANTED
            ) {
                return Result.failure(SecurityException("Missing BLUETOOTH_CONNECT permission"))
            }
            
            if (enable) {
                bluetoothAdapter.enable()
            } else {
                bluetoothAdapter.disable()
            }
            
            // Log the event
            phoneControlManager.logEvent(
                PhoneControlEvent.SystemSettingChanged(
                    settingName = "Bluetooth",
                    newValue = if (enable) "Enabled" else "Disabled",
                    initiatedBy = "Sallie"
                )
            )
            
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun toggleMobileData(enable: Boolean): Result<Unit> {
        // Check user consent
        if (!permissionManager.hasUserConsent(SYSTEM_CONTROL_CONSENT_ACTION)) {
            return Result.failure(SecurityException("User has not given consent to control mobile data settings"))
        }
        
        // This operation often requires system privileges
        // For most apps, we need to direct users to settings
        return try {
            // Direct to mobile data settings
            val intent = Intent(Settings.ACTION_DATA_ROAMING_SETTINGS)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(intent)
            
            // Log the event
            phoneControlManager.logEvent(
                PhoneControlEvent.SystemSettingChanged(
                    settingName = "Mobile Data",
                    newValue = if (enable) "Enabled" else "Disabled",
                    initiatedBy = "Sallie"
                )
            )
            
            // Return success even though we're just showing settings
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun toggleAirplaneMode(enable: Boolean): Result<Unit> {
        // Check user consent
        if (!permissionManager.hasUserConsent(SYSTEM_CONTROL_CONSENT_ACTION)) {
            return Result.failure(SecurityException("User has not given consent to control airplane mode settings"))
        }
        
        // This operation often requires system privileges
        // For most apps, we need to direct users to settings
        return try {
            // Direct to airplane mode settings
            val intent = Intent(Settings.ACTION_AIRPLANE_MODE_SETTINGS)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(intent)
            
            // Log the event
            phoneControlManager.logEvent(
                PhoneControlEvent.SystemSettingChanged(
                    settingName = "Airplane Mode",
                    newValue = if (enable) "Enabled" else "Disabled",
                    initiatedBy = "Sallie"
                )
            )
            
            // Return success even though we're just showing settings
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun toggleLocationServices(enable: Boolean): Result<Unit> {
        // Check user consent
        if (!permissionManager.hasUserConsent(SYSTEM_CONTROL_CONSENT_ACTION)) {
            return Result.failure(SecurityException("User has not given consent to control location settings"))
        }
        
        return try {
            // Direct to location settings
            val intent = Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(intent)
            
            // Log the event
            phoneControlManager.logEvent(
                PhoneControlEvent.SystemSettingChanged(
                    settingName = "Location Services",
                    newValue = if (enable) "Enabled" else "Disabled",
                    initiatedBy = "Sallie"
                )
            )
            
            // Return success even though we're just showing settings
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun setScreenBrightness(brightness: Float): Result<Unit> {
        // Check user consent
        if (!permissionManager.hasUserConsent(SYSTEM_CONTROL_CONSENT_ACTION)) {
            return Result.failure(SecurityException("User has not given consent to control screen brightness"))
        }
        
        return try {
            // Ensure brightness is between 0 and 1
            val validBrightness = brightness.coerceIn(0f, 1f)
            
            // Convert to system brightness range (0-255)
            val systemBrightness = (validBrightness * 255).toInt()
            
            // Check if we have permission to modify system settings
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                if (!Settings.System.canWrite(context)) {
                    // If not, direct user to settings
                    val intent = Intent(Settings.ACTION_MANAGE_WRITE_SETTINGS)
                    intent.data = android.net.Uri.parse("package:${context.packageName}")
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    context.startActivity(intent)
                    
                    return Result.failure(SecurityException("Missing WRITE_SETTINGS permission"))
                }
            }
            
            // Set brightness
            Settings.System.putInt(
                context.contentResolver,
                Settings.System.SCREEN_BRIGHTNESS,
                systemBrightness
            )
            
            // Log the event
            phoneControlManager.logEvent(
                PhoneControlEvent.SystemSettingChanged(
                    settingName = "Screen Brightness",
                    newValue = "${(validBrightness * 100).toInt()}%",
                    initiatedBy = "Sallie"
                )
            )
            
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun getScreenBrightness(): Result<Float> {
        // Check user consent
        if (!permissionManager.hasUserConsent(SYSTEM_CONTROL_CONSENT_ACTION)) {
            return Result.failure(SecurityException("User has not given consent to access screen brightness"))
        }
        
        return try {
            // Get system brightness (0-255)
            val systemBrightness = Settings.System.getInt(
                context.contentResolver,
                Settings.System.SCREEN_BRIGHTNESS
            )
            
            // Convert to normalized range (0-1)
            val brightness = systemBrightness / 255f
            
            Result.success(brightness)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun setScreenTimeout(seconds: Int): Result<Unit> {
        // Check user consent
        if (!permissionManager.hasUserConsent(SYSTEM_CONTROL_CONSENT_ACTION)) {
            return Result.failure(SecurityException("User has not given consent to control screen timeout"))
        }
        
        return try {
            // Check if we have permission to modify system settings
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                if (!Settings.System.canWrite(context)) {
                    // If not, direct user to settings
                    val intent = Intent(Settings.ACTION_MANAGE_WRITE_SETTINGS)
                    intent.data = android.net.Uri.parse("package:${context.packageName}")
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    context.startActivity(intent)
                    
                    return Result.failure(SecurityException("Missing WRITE_SETTINGS permission"))
                }
            }
            
            // Set screen timeout (convert seconds to milliseconds)
            Settings.System.putInt(
                context.contentResolver,
                Settings.System.SCREEN_OFF_TIMEOUT,
                seconds * 1000
            )
            
            // Log the event
            phoneControlManager.logEvent(
                PhoneControlEvent.SystemSettingChanged(
                    settingName = "Screen Timeout",
                    newValue = "$seconds seconds",
                    initiatedBy = "Sallie"
                )
            )
            
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun getScreenTimeout(): Result<Int> {
        // Check user consent
        if (!permissionManager.hasUserConsent(SYSTEM_CONTROL_CONSENT_ACTION)) {
            return Result.failure(SecurityException("User has not given consent to access screen timeout"))
        }
        
        return try {
            // Get screen timeout (in milliseconds)
            val timeoutMillis = Settings.System.getInt(
                context.contentResolver,
                Settings.System.SCREEN_OFF_TIMEOUT
            )
            
            // Convert to seconds
            val timeoutSeconds = timeoutMillis / 1000
            
            Result.success(timeoutSeconds)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun toggleAutoRotate(enable: Boolean): Result<Unit> {
        // Check user consent
        if (!permissionManager.hasUserConsent(SYSTEM_CONTROL_CONSENT_ACTION)) {
            return Result.failure(SecurityException("User has not given consent to control auto-rotate settings"))
        }
        
        return try {
            // Check if we have permission to modify system settings
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                if (!Settings.System.canWrite(context)) {
                    // If not, direct user to settings
                    val intent = Intent(Settings.ACTION_MANAGE_WRITE_SETTINGS)
                    intent.data = android.net.Uri.parse("package:${context.packageName}")
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    context.startActivity(intent)
                    
                    return Result.failure(SecurityException("Missing WRITE_SETTINGS permission"))
                }
            }
            
            // Set auto-rotate
            Settings.System.putInt(
                context.contentResolver,
                Settings.System.ACCELEROMETER_ROTATION,
                if (enable) 1 else 0
            )
            
            // Log the event
            phoneControlManager.logEvent(
                PhoneControlEvent.SystemSettingChanged(
                    settingName = "Auto-Rotate",
                    newValue = if (enable) "Enabled" else "Disabled",
                    initiatedBy = "Sallie"
                )
            )
            
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun isAutoRotateEnabled(): Result<Boolean> {
        // Check user consent
        if (!permissionManager.hasUserConsent(SYSTEM_CONTROL_CONSENT_ACTION)) {
            return Result.failure(SecurityException("User has not given consent to access auto-rotate settings"))
        }
        
        return try {
            // Get auto-rotate setting
            val autoRotate = Settings.System.getInt(
                context.contentResolver,
                Settings.System.ACCELEROMETER_ROTATION,
                0
            ) == 1
            
            Result.success(autoRotate)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun setVolume(volumeType: SystemManager.VolumeType, volume: Float): Result<Unit> {
        // Check user consent
        if (!permissionManager.hasUserConsent(SYSTEM_CONTROL_CONSENT_ACTION)) {
            return Result.failure(SecurityException("User has not given consent to control volume settings"))
        }
        
        return try {
            val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
            
            // Convert normalized volume (0-1) to system volume range
            val streamType = when (volumeType) {
                SystemManager.VolumeType.RING -> AudioManager.STREAM_RING
                SystemManager.VolumeType.MEDIA -> AudioManager.STREAM_MUSIC
                SystemManager.VolumeType.ALARM -> AudioManager.STREAM_ALARM
                SystemManager.VolumeType.NOTIFICATION -> AudioManager.STREAM_NOTIFICATION
                SystemManager.VolumeType.SYSTEM -> AudioManager.STREAM_SYSTEM
                SystemManager.VolumeType.VOICE_CALL -> AudioManager.STREAM_VOICE_CALL
            }
            
            val maxVolume = audioManager.getStreamMaxVolume(streamType)
            val systemVolume = (volume.coerceIn(0f, 1f) * maxVolume).toInt()
            
            // Set volume
            audioManager.setStreamVolume(
                streamType,
                systemVolume,
                0 // No flags
            )
            
            // Log the event
            phoneControlManager.logEvent(
                PhoneControlEvent.SystemSettingChanged(
                    settingName = "${volumeType.name} Volume",
                    newValue = "${(volume * 100).toInt()}%",
                    initiatedBy = "Sallie"
                )
            )
            
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun getVolume(volumeType: SystemManager.VolumeType): Result<Float> {
        // Check user consent
        if (!permissionManager.hasUserConsent(SYSTEM_CONTROL_CONSENT_ACTION)) {
            return Result.failure(SecurityException("User has not given consent to access volume settings"))
        }
        
        return try {
            val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
            
            val streamType = when (volumeType) {
                SystemManager.VolumeType.RING -> AudioManager.STREAM_RING
                SystemManager.VolumeType.MEDIA -> AudioManager.STREAM_MUSIC
                SystemManager.VolumeType.ALARM -> AudioManager.STREAM_ALARM
                SystemManager.VolumeType.NOTIFICATION -> AudioManager.STREAM_NOTIFICATION
                SystemManager.VolumeType.SYSTEM -> AudioManager.STREAM_SYSTEM
                SystemManager.VolumeType.VOICE_CALL -> AudioManager.STREAM_VOICE_CALL
            }
            
            // Get current volume and max volume
            val currentVolume = audioManager.getStreamVolume(streamType)
            val maxVolume = audioManager.getStreamMaxVolume(streamType)
            
            // Convert to normalized range (0-1)
            val normalizedVolume = currentVolume / maxVolume.toFloat()
            
            Result.success(normalizedVolume)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun toggleDoNotDisturb(enable: Boolean): Result<Unit> {
        // Check user consent
        if (!permissionManager.hasUserConsent(SYSTEM_CONTROL_CONSENT_ACTION)) {
            return Result.failure(SecurityException("User has not given consent to control do not disturb settings"))
        }
        
        // Check permission
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            if (!notificationManager.isNotificationPolicyAccessGranted) {
                // If not, direct user to settings
                val intent = Intent(Settings.ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS)
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                context.startActivity(intent)
                
                return Result.failure(SecurityException("Missing notification policy access"))
            }
        }
        
        return try {
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                // Set DND mode
                notificationManager.setInterruptionFilter(
                    if (enable) NotificationManager.INTERRUPTION_FILTER_NONE
                    else NotificationManager.INTERRUPTION_FILTER_ALL
                )
                
                // Log the event
                phoneControlManager.logEvent(
                    PhoneControlEvent.SystemSettingChanged(
                        settingName = "Do Not Disturb",
                        newValue = if (enable) "Enabled" else "Disabled",
                        initiatedBy = "Sallie"
                    )
                )
                
                Result.success(Unit)
            } else {
                // Not supported on older Android versions
                Result.failure(UnsupportedOperationException("Do Not Disturb mode not supported on this Android version"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun isDoNotDisturbEnabled(): Result<Boolean> {
        // Check user consent
        if (!permissionManager.hasUserConsent(SYSTEM_CONTROL_CONSENT_ACTION)) {
            return Result.failure(SecurityException("User has not given consent to access do not disturb settings"))
        }
        
        return try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                
                // Check current interruption filter
                val isEnabled = notificationManager.currentInterruptionFilter == NotificationManager.INTERRUPTION_FILTER_NONE
                
                Result.success(isEnabled)
            } else {
                // Not supported on older Android versions
                Result.failure(UnsupportedOperationException("Do Not Disturb mode not supported on this Android version"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun isSystemControlFunctionalityAvailable(): Boolean {
        // Basic system control functionality is always available
        // Specific functions may require additional permissions
        return true
    }
    
    /**
     * Check if location is enabled
     */
    private fun isLocationEnabled(locationManager: LocationManager): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            locationManager.isLocationEnabled
        } else {
            val mode = Settings.Secure.getInt(
                context.contentResolver,
                Settings.Secure.LOCATION_MODE,
                Settings.Secure.LOCATION_MODE_OFF
            )
            mode != Settings.Secure.LOCATION_MODE_OFF
        }
    }
    
    /**
     * Get approximate CPU usage (this is a rough estimation)
     * Accurate CPU usage requires native code or reading /proc/stat
     */
    private fun getCpuUsage(): Float {
        // This is a simplified implementation that doesn't actually measure CPU
        // In a real implementation, you'd use /proc/stat or a native library
        return try {
            val runtime = Runtime.getRuntime()
            val availableProcessors = runtime.availableProcessors()
            
            // This is just a placeholder approximation
            val activityManager = context.getSystemService(Context.ACTIVITY_SERVICE) as android.app.ActivityManager
            val memoryInfo = android.app.ActivityManager.MemoryInfo()
            activityManager.getMemoryInfo(memoryInfo)
            
            // Use memory pressure as a rough proxy for CPU load
            val memoryPressure = 1 - (memoryInfo.availMem.toFloat() / memoryInfo.totalMem)
            
            // Scale between 10% and 90% based on memory pressure
            10f + (memoryPressure * 80f)
        } catch (e: Exception) {
            50f // Default to 50% if we can't calculate
        }
    }
}

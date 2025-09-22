/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * PhoneControlManager - Main coordinator for phone control functions
 */

package com.sallie.phonecontrol

import android.content.Context
import com.sallie.phonecontrol.apps.AppManager
import com.sallie.phonecontrol.call.CallManager
import com.sallie.phonecontrol.calendar.CalendarManager
import com.sallie.phonecontrol.location.LocationManager
import com.sallie.phonecontrol.media.MediaManager
import com.sallie.phonecontrol.messaging.MessageManager
import com.sallie.phonecontrol.screen.ScreenAnalyzer
import com.sallie.phonecontrol.system.SystemSettingsManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlin.coroutines.CoroutineContext

/**
 * Main coordinator for all phone control functions
 * 
 * This manager provides a centralized access point to all phone control capabilities,
 * manages permissions, tracks state, and coordinates between different subsystems.
 */
class PhoneControlManager(
    private val context: Context,
    private val permissionManager: PermissionManager
) : CoroutineScope {
    
    companion object {
        private const val TAG = "PhoneControlManager"
    }
    
    // Coroutine scope for background operations
    private val job = SupervisorJob()
    override val coroutineContext: CoroutineContext
        get() = Dispatchers.Default + job
    
    // State management
    private val _state = MutableStateFlow<PhoneControlState>(PhoneControlState.Initializing)
    val state: StateFlow<PhoneControlState> = _state.asStateFlow()
    
    // Component managers
    private val _callManager: CallManager by lazy { createCallManager() }
    private val _messageManager: MessageManager by lazy { createMessageManager() }
    private val _appManager: AppManager by lazy { createAppManager() }
    private val _systemSettingsManager: SystemSettingsManager by lazy { createSystemSettingsManager() }
    private val _mediaManager: MediaManager by lazy { createMediaManager() }
    private val _calendarManager: CalendarManager by lazy { createCalendarManager() }
    private val _locationManager: LocationManager by lazy { createLocationManager() }
    private val _screenAnalyzer: ScreenAnalyzer by lazy { createScreenAnalyzer() }
    
    // Public accessors for component managers
    val callManager: CallManager get() = _callManager
    val messageManager: MessageManager get() = _messageManager
    val appManager: AppManager get() = _appManager
    val systemSettingsManager: SystemSettingsManager get() = _systemSettingsManager
    val mediaManager: MediaManager get() = _mediaManager
    val calendarManager: CalendarManager get() = _calendarManager
    val locationManager: LocationManager get() = _locationManager
    val screenAnalyzer: ScreenAnalyzer get() = _screenAnalyzer
    
    // Event history for auditing and accountability
    private val eventHistory = mutableListOf<PhoneControlEvent>()
    
    init {
        initialize()
    }
    
    /**
     * Initialize the phone control system
     */
    private fun initialize() {
        launch {
            try {
                _state.value = PhoneControlState.Initializing
                
                // Initialize permission manager
                permissionManager.initialize()
                
                // Check for essential permissions
                val hasEssentialPermissions = checkEssentialPermissions()
                
                if (hasEssentialPermissions) {
                    // Initialize managers that don't require special permissions
                    initializeBaseManagers()
                    _state.value = PhoneControlState.Ready
                } else {
                    _state.value = PhoneControlState.NeedsPermissions
                }
                
                // Register phone state monitors
                registerStateMonitors()
                
                logEvent(PhoneControlEvent.SystemInitialized)
            } catch (e: Exception) {
                _state.value = PhoneControlState.Error(e.message ?: "Unknown error during initialization")
                logEvent(PhoneControlEvent.SystemError("Initialization failed: ${e.message}"))
            }
        }
    }
    
    /**
     * Check if we have the essential permissions to function
     */
    private suspend fun checkEssentialPermissions(): Boolean {
        return permissionManager.checkEssentialPermissions()
    }
    
    /**
     * Initialize managers that don't require special permissions
     */
    private fun initializeBaseManagers() {
        // These can be initialized without special permissions
        _appManager // Initialize app manager
        _systemSettingsManager // Initialize system settings manager
        
        // Other managers will be initialized lazily when accessed
    }
    
    /**
     * Register monitors for phone state changes
     */
    private fun registerStateMonitors() {
        // Monitor permission changes
        launch {
            permissionManager.permissionChanges.collect { change ->
                handlePermissionChange(change)
            }
        }
        
        // Additional state monitors can be added here
    }
    
    /**
     * Handle changes in permissions
     */
    private fun handlePermissionChange(change: PermissionChange) {
        when (change) {
            is PermissionChange.Granted -> {
                logEvent(PhoneControlEvent.PermissionGranted(change.permission))
                refreshCapabilities()
            }
            is PermissionChange.Revoked -> {
                logEvent(PhoneControlEvent.PermissionRevoked(change.permission))
                refreshCapabilities()
            }
        }
    }
    
    /**
     * Refresh the system capabilities based on current permissions
     */
    private fun refreshCapabilities() {
        launch {
            val allPermissionsOk = permissionManager.checkEssentialPermissions()
            
            if (allPermissionsOk) {
                _state.value = PhoneControlState.Ready
            } else {
                _state.value = PhoneControlState.NeedsPermissions
            }
        }
    }
    
    /**
     * Log a phone control event for auditing
     */
    internal fun logEvent(event: PhoneControlEvent) {
        synchronized(eventHistory) {
            // Add timestamp to event if not present
            val timestampedEvent = event.ensureTimestamp()
            
            // Add to history (limited size)
            eventHistory.add(timestampedEvent)
            
            // Keep history to a reasonable size
            if (eventHistory.size > 1000) {
                eventHistory.removeAt(0)
            }
        }
    }
    
    /**
     * Get recent event history for auditing and debugging
     */
    fun getEventHistory(limit: Int = 100): List<PhoneControlEvent> {
        synchronized(eventHistory) {
            return eventHistory.takeLast(limit)
        }
    }
    
    /**
     * Clean up resources
     */
    fun shutdown() {
        job.cancel()
        
        // Clean up each manager
        if (_callManager is AutoCloseable) {
            (_callManager as AutoCloseable).close()
        }
        
        // Log shutdown event
        logEvent(PhoneControlEvent.SystemShutdown)
    }
    
    // Factory methods for component managers
    private fun createCallManager(): CallManager {
        return com.sallie.phonecontrol.call.CallManagerImpl(context, permissionManager, this)
    }
    
    private fun createMessageManager(): MessageManager {
        return com.sallie.phonecontrol.messaging.MessageManagerImpl(context, permissionManager, this)
    }
    
    private fun createAppManager(): AppManager {
        return com.sallie.phonecontrol.apps.AppManagerImpl(context, permissionManager, this)
    }
    
    private fun createSystemSettingsManager(): SystemSettingsManager {
        return com.sallie.phonecontrol.system.SystemSettingsManagerImpl(context, permissionManager, this)
    }
    
    private fun createMediaManager(): MediaManager {
        return com.sallie.phonecontrol.media.MediaManagerImpl(context, permissionManager, this)
    }
    
    private fun createCalendarManager(): CalendarManager {
        return com.sallie.phonecontrol.calendar.CalendarManagerImpl(context, permissionManager, this)
    }
    
    private fun createLocationManager(): LocationManager {
        return com.sallie.phonecontrol.location.LocationManagerImpl(context, permissionManager, this)
    }
    
    private fun createScreenAnalyzer(): ScreenAnalyzer {
        return com.sallie.phonecontrol.screen.ScreenAnalyzerImpl(context, permissionManager, this)
    }
}

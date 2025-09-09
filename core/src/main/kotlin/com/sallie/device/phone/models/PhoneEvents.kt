/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * Values authenticity, respects boundaries, and maintains unwavering devotion
 * 
 * PhoneEvents - Event classes for the PhoneControlSystem
 * Provides event types for phone control system events and notifications
 */

package com.sallie.device.phone.models

import com.sallie.device.phone.PhoneControlState

/**
 * Types of phone events
 */
enum class PhoneEventType {
    SYSTEM_STATE_CHANGED,
    APP_INSTALLED,
    APP_UNINSTALLED,
    APP_UPDATED,
    APP_LAUNCHED,
    APP_CLOSED,
    APP_CRASHED,
    NOTIFICATION_RECEIVED,
    NOTIFICATION_REMOVED,
    NOTIFICATION_CLICKED,
    NOTIFICATION_ACTION,
    CALL_INCOMING,
    CALL_OUTGOING,
    CALL_ENDED,
    BATTERY_CHANGED,
    NETWORK_CHANGED,
    STORAGE_CHANGED,
    SETTINGS_CHANGED,
    PERMISSION_GRANTED,
    PERMISSION_DENIED,
    SECURITY_ALERT,
    ERROR
}

/**
 * Base class for phone events
 */
sealed class PhoneEvent {
    abstract val type: PhoneEventType
    val timestamp: Long = System.currentTimeMillis()
    
    /**
     * System state event
     */
    data class SystemStateEvent(
        val state: PhoneControlState,
        val previousState: PhoneControlState
    ) : PhoneEvent() {
        override val type: PhoneEventType = PhoneEventType.SYSTEM_STATE_CHANGED
    }
    
    /**
     * App event
     */
    data class AppEvent(
        override val type: PhoneEventType,
        val packageName: String,
        val appName: String,
        val version: String? = null
    ) : PhoneEvent()
    
    /**
     * App action event
     */
    data class AppActionEvent(
        val packageName: String,
        val appName: String,
        val action: AppAction,
        val success: Boolean,
        val response: Map<String, Any> = emptyMap()
    ) : PhoneEvent() {
        override val type: PhoneEventType = when (action) {
            is AppAction.Click -> PhoneEventType.APP_LAUNCHED
            is AppAction.LongClick -> PhoneEventType.APP_LAUNCHED
            is AppAction.Scroll -> PhoneEventType.APP_LAUNCHED
            is AppAction.Swipe -> PhoneEventType.APP_LAUNCHED
            is AppAction.TextInput -> PhoneEventType.APP_LAUNCHED
            is AppAction.Navigate -> PhoneEventType.APP_LAUNCHED
            is AppAction.MediaControl -> PhoneEventType.APP_LAUNCHED
            is AppAction.Custom -> PhoneEventType.APP_LAUNCHED
        }
    }
    
    /**
     * Notification event
     */
    data class NotificationEvent(
        val notificationId: String,
        val action: String,
        val success: Boolean
    ) : PhoneEvent() {
        override val type: PhoneEventType = PhoneEventType.NOTIFICATION_ACTION
    }
    
    /**
     * Accessibility event
     */
    data class AccessibilityEvent(
        val actionType: AccessibilityActionType,
        val target: String?,
        val success: Boolean
    ) : PhoneEvent() {
        override val type: PhoneEventType = PhoneEventType.APP_LAUNCHED // Simplification
    }
    
    /**
     * Battery event
     */
    data class BatteryEvent(
        val level: Int,
        val isCharging: Boolean,
        val temperature: Int
    ) : PhoneEvent() {
        override val type: PhoneEventType = PhoneEventType.BATTERY_CHANGED
    }
    
    /**
     * Network event
     */
    data class NetworkEvent(
        val isConnected: Boolean,
        val networkType: String,
        val isWifi: Boolean,
        val isCellular: Boolean
    ) : PhoneEvent() {
        override val type: PhoneEventType = PhoneEventType.NETWORK_CHANGED
    }
    
    /**
     * Storage event
     */
    data class StorageEvent(
        val availableStorage: Long,
        val totalStorage: Long,
        val isLow: Boolean
    ) : PhoneEvent() {
        override val type: PhoneEventType = PhoneEventType.STORAGE_CHANGED
    }
    
    /**
     * Security event
     */
    data class SecurityEvent(
        override val type: PhoneEventType,
        val message: String,
        val details: Map<String, Any> = emptyMap()
    ) : PhoneEvent()
    
    /**
     * Error event
     */
    data class ErrorEvent(
        val error: Exception?,
        val message: String
    ) : PhoneEvent() {
        override val type: PhoneEventType = PhoneEventType.ERROR
    }
    
    /**
     * Apps refreshed event
     */
    data class AppsRefreshedEvent(
        val appCount: Int
    ) : PhoneEvent() {
        override val type: PhoneEventType = PhoneEventType.SYSTEM_STATE_CHANGED
    }
}

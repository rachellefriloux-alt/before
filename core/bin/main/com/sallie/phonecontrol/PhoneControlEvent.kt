/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * PhoneControlEvent - Events for auditing and tracking phone control actions
 */

package com.sallie.phonecontrol

import java.util.Date

/**
 * Represents events in the phone control system for auditing and tracking
 */
sealed class PhoneControlEvent {
    /**
     * Timestamp when the event occurred
     */
    var timestamp: Date = Date()
        private set
    
    /**
     * System initialization completed
     */
    object SystemInitialized : PhoneControlEvent()
    
    /**
     * System shutdown initiated
     */
    object SystemShutdown : PhoneControlEvent()
    
    /**
     * Permission was granted by the user
     * 
     * @param permission The permission that was granted
     */
    data class PermissionGranted(val permission: String) : PhoneControlEvent()
    
    /**
     * Permission was revoked by the user
     * 
     * @param permission The permission that was revoked
     */
    data class PermissionRevoked(val permission: String) : PhoneControlEvent()
    
    /**
     * Call was initiated
     * 
     * @param contactName Name of contact (or phone number if name not available)
     * @param initiatedBy Who initiated the call (user, Sallie, etc.)
     */
    data class CallInitiated(val contactName: String, val initiatedBy: String) : PhoneControlEvent()
    
    /**
     * Incoming call was handled
     * 
     * @param contactName Name of contact (or phone number if name not available)
     * @param action Action taken (answered, rejected, etc.)
     */
    data class CallHandled(val contactName: String, val action: String) : PhoneControlEvent()
    
    /**
     * Message was sent
     * 
     * @param contactName Name of recipient (or phone number if name not available)
     * @param initiatedBy Who initiated the message (user, Sallie, etc.)
     */
    data class MessageSent(val contactName: String, val initiatedBy: String) : PhoneControlEvent()
    
    /**
     * App was launched
     * 
     * @param appName Name of the app that was launched
     * @param initiatedBy Who initiated the launch (user, Sallie, etc.)
     */
    data class AppLaunched(val appName: String, val initiatedBy: String) : PhoneControlEvent()
    
    /**
     * System setting was changed
     * 
     * @param setting Name of the setting that was changed
     * @param initiatedBy Who initiated the change (user, Sallie, etc.)
     */
    data class SettingChanged(val setting: String, val initiatedBy: String) : PhoneControlEvent()
    
    /**
     * System error occurred
     * 
     * @param message Description of the error
     */
    data class SystemError(val message: String) : PhoneControlEvent()
    
    /**
     * User consent was given for an action
     * 
     * @param action Description of the action
     * @param duration How long the consent is valid for (null = indefinitely)
     */
    data class UserConsentGiven(val action: String, val duration: Long? = null) : PhoneControlEvent()
    
    /**
     * User consent was revoked for an action
     * 
     * @param action Description of the action
     */
    data class UserConsentRevoked(val action: String) : PhoneControlEvent()
    
    /**
     * Ensure the event has a timestamp
     */
    fun ensureTimestamp(): PhoneControlEvent {
        if (timestamp == Date(0)) {
            timestamp = Date()
        }
        return this
    }
}

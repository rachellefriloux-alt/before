/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * PermissionManager - Manages runtime permissions and consent
 */

package com.sallie.phonecontrol

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.content.ContextCompat
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableSharedFlow
import java.util.Date
import java.util.concurrent.ConcurrentHashMap

/**
 * Manages runtime permissions and user consent for phone control functions
 * 
 * This class handles:
 * - Android runtime permissions for various phone functions
 * - User consent for specific actions with expiration times
 * - Permission change notifications
 * - Comprehensive permission auditing
 */
class PermissionManager(private val context: Context) {
    
    companion object {
        // Essential permissions for basic functionality
        val ESSENTIAL_PERMISSIONS = listOf(
            Manifest.permission.INTERNET
        )
        
        // Call-related permissions
        val CALL_PERMISSIONS = listOf(
            Manifest.permission.READ_PHONE_STATE,
            Manifest.permission.CALL_PHONE,
            Manifest.permission.READ_CALL_LOG,
            Manifest.permission.ANSWER_PHONE_CALLS
        )
        
        // Messaging-related permissions
        val MESSAGING_PERMISSIONS = listOf(
            Manifest.permission.SEND_SMS,
            Manifest.permission.READ_SMS,
            Manifest.permission.RECEIVE_SMS
        )
        
        // Contact-related permissions
        val CONTACT_PERMISSIONS = listOf(
            Manifest.permission.READ_CONTACTS
        )
        
        // Calendar-related permissions
        val CALENDAR_PERMISSIONS = listOf(
            Manifest.permission.READ_CALENDAR,
            Manifest.permission.WRITE_CALENDAR
        )
        
        // Location-related permissions
        val LOCATION_PERMISSIONS = listOf(
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION
        )
        
        // Storage-related permissions
        val STORAGE_PERMISSIONS = listOf(
            Manifest.permission.READ_EXTERNAL_STORAGE
        )
        
        // Maps permission groups to human-readable names
        val PERMISSION_GROUP_NAMES = mapOf(
            CALL_PERMISSIONS to "Phone calls",
            MESSAGING_PERMISSIONS to "SMS messages",
            CONTACT_PERMISSIONS to "Contacts",
            CALENDAR_PERMISSIONS to "Calendar",
            LOCATION_PERMISSIONS to "Location",
            STORAGE_PERMISSIONS to "Storage"
        )
    }
    
    // Flow for permission changes
    private val _permissionChanges = MutableSharedFlow<PermissionChange>(extraBufferCapacity = 10)
    val permissionChanges: Flow<PermissionChange> = _permissionChanges
    
    // Cached permission status
    private val permissionCache = ConcurrentHashMap<String, Boolean>()
    
    // User consent for specific actions with expiration
    private val userConsent = ConcurrentHashMap<String, Date>()
    
    /**
     * Initialize the permission manager
     */
    fun initialize() {
        // Refresh permission cache on initialization
        refreshPermissionCache()
    }
    
    /**
     * Refresh the cached permission statuses
     */
    fun refreshPermissionCache() {
        // Check all known permissions and update cache
        val allPermissions = ESSENTIAL_PERMISSIONS + 
                            CALL_PERMISSIONS + 
                            MESSAGING_PERMISSIONS + 
                            CONTACT_PERMISSIONS + 
                            CALENDAR_PERMISSIONS + 
                            LOCATION_PERMISSIONS + 
                            STORAGE_PERMISSIONS
        
        for (permission in allPermissions.distinct()) {
            val oldStatus = permissionCache[permission]
            val newStatus = checkPermission(permission)
            
            permissionCache[permission] = newStatus
            
            // Emit permission change events
            if (oldStatus != null && oldStatus != newStatus) {
                val change = if (newStatus) {
                    PermissionChange.Granted(permission)
                } else {
                    PermissionChange.Revoked(permission)
                }
                
                _permissionChanges.tryEmit(change)
            }
        }
    }
    
    /**
     * Check if we have the essential permissions to function
     */
    suspend fun checkEssentialPermissions(): Boolean {
        return ESSENTIAL_PERMISSIONS.all { checkPermission(it) }
    }
    
    /**
     * Check if we have all permissions in a specific group
     */
    suspend fun checkPermissionGroup(group: List<String>): Boolean {
        return group.all { checkPermission(it) }
    }
    
    /**
     * Check if we have a specific permission
     */
    fun checkPermission(permission: String): Boolean {
        return ContextCompat.checkSelfPermission(context, permission) == PackageManager.PERMISSION_GRANTED
    }
    
    /**
     * Grant user consent for a specific action
     * 
     * @param action The action to grant consent for
     * @param durationMillis How long the consent is valid for (null = indefinitely)
     */
    fun grantUserConsent(action: String, durationMillis: Long? = null) {
        val expiration = if (durationMillis != null) {
            Date(System.currentTimeMillis() + durationMillis)
        } else {
            // Far future date for indefinite consent
            Date(Long.MAX_VALUE)
        }
        
        userConsent[action] = expiration
    }
    
    /**
     * Revoke user consent for a specific action
     * 
     * @param action The action to revoke consent for
     */
    fun revokeUserConsent(action: String) {
        userConsent.remove(action)
    }
    
    /**
     * Check if we have user consent for a specific action
     * 
     * @param action The action to check consent for
     * @return True if we have consent, false otherwise
     */
    fun hasUserConsent(action: String): Boolean {
        val expiration = userConsent[action] ?: return false
        
        // Check if consent has expired
        if (expiration.before(Date())) {
            userConsent.remove(action)
            return false
        }
        
        return true
    }
    
    /**
     * Get the human-readable name for a permission
     * 
     * @param permission The permission to get the name for
     * @return Human-readable name for the permission
     */
    fun getPermissionName(permission: String): String {
        return when (permission) {
            Manifest.permission.READ_PHONE_STATE -> "Read phone state"
            Manifest.permission.CALL_PHONE -> "Make phone calls"
            Manifest.permission.READ_CALL_LOG -> "Read call history"
            Manifest.permission.ANSWER_PHONE_CALLS -> "Answer phone calls"
            Manifest.permission.SEND_SMS -> "Send SMS messages"
            Manifest.permission.READ_SMS -> "Read SMS messages"
            Manifest.permission.RECEIVE_SMS -> "Receive SMS notifications"
            Manifest.permission.READ_CONTACTS -> "Access contacts"
            Manifest.permission.READ_CALENDAR -> "Read calendar events"
            Manifest.permission.WRITE_CALENDAR -> "Create calendar events"
            Manifest.permission.ACCESS_FINE_LOCATION -> "Precise location"
            Manifest.permission.ACCESS_COARSE_LOCATION -> "Approximate location"
            Manifest.permission.READ_EXTERNAL_STORAGE -> "Read files and media"
            Manifest.permission.INTERNET -> "Internet access"
            else -> permission.split(".").last()
        }
    }
    
    /**
     * Get the human-readable name for a permission group
     * 
     * @param permissions The permissions in the group
     * @return Human-readable name for the permission group
     */
    fun getPermissionGroupName(permissions: List<String>): String {
        for ((group, name) in PERMISSION_GROUP_NAMES) {
            if (permissions.containsAll(group)) {
                return name
            }
        }
        
        // If no matching group, return first permission name
        return if (permissions.isNotEmpty()) {
            getPermissionName(permissions.first())
        } else {
            "Unknown permissions"
        }
    }
    
    /**
     * Get consent expiration time for an action
     * 
     * @param action The action to check
     * @return The expiration time, or null if no consent or expired
     */
    fun getConsentExpiration(action: String): Date? {
        val expiration = userConsent[action] ?: return null
        
        // Check if consent has expired
        if (expiration.before(Date())) {
            userConsent.remove(action)
            return null
        }
        
        return expiration
    }
    
    /**
     * Clear all user consents
     */
    fun clearAllConsents() {
        userConsent.clear()
    }
}

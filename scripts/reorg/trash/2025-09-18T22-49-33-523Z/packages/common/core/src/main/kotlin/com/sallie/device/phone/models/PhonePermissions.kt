/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * Values authenticity, respects boundaries, and maintains unwavering devotion
 * 
 * PhonePermissions - Permission types for phone control features
 * Defines the permission types needed for different phone control operations
 */

package com.sallie.device.phone.models

/**
 * Types of phone permissions
 */
enum class PhonePermission {
    /**
     * Permission to view installed apps
     */
    APP_LIST,
    
    /**
     * Permission to launch apps
     */
    APP_LAUNCH,
    
    /**
     * Permission to control apps (send actions, interact with UI)
     */
    APP_CONTROL,
    
    /**
     * Permission to access app content (text, media, data)
     */
    APP_CONTENT_ACCESS,
    
    /**
     * Permission to install apps
     */
    APP_INSTALL,
    
    /**
     * Permission to uninstall apps
     */
    APP_UNINSTALL,
    
    /**
     * Permission to access and modify system settings
     */
    SYSTEM_SETTINGS,
    
    /**
     * Permission to access notifications
     */
    NOTIFICATION_ACCESS,
    
    /**
     * Permission to access call information
     */
    CALL_ACCESS,
    
    /**
     * Permission to make calls
     */
    CALL_PHONE,
    
    /**
     * Permission to send SMS
     */
    SEND_SMS,
    
    /**
     * Permission to read SMS
     */
    READ_SMS,
    
    /**
     * Permission to access accessibility services
     */
    ACCESSIBILITY,
    
    /**
     * Permission to capture the screen
     */
    SCREEN_CAPTURE,
    
    /**
     * Permission to record audio
     */
    RECORD_AUDIO,
    
    /**
     * Permission to access the camera
     */
    CAMERA,
    
    /**
     * Permission to access location
     */
    LOCATION,
    
    /**
     * Permission to access contacts
     */
    CONTACTS,
    
    /**
     * Permission to access calendar
     */
    CALENDAR,
    
    /**
     * Permission to execute workflows across multiple apps
     */
    CROSS_APP_WORKFLOW,
    
    /**
     * Permission to access device information
     */
    DEVICE_INFO,
    
    /**
     * Permission to access network information
     */
    NETWORK_INFO,
    
    /**
     * Permission to access storage
     */
    STORAGE,
    
    /**
     * Permission to modify device security settings
     */
    SECURITY_SETTINGS,
    
    /**
     * Permission to access sensors
     */
    SENSORS
}

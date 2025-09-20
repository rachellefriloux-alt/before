/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * AppManager - Interface for application control operations
 */

package com.sallie.phonecontrol.apps

import android.content.pm.ApplicationInfo
import kotlinx.coroutines.flow.Flow
import java.io.File

/**
 * Interface for managing and interacting with applications on the device
 */
interface AppManager {

    /**
     * Data class representing an app installed on the device
     */
    data class AppInfo(
        val packageName: String,
        val appName: String,
        val versionName: String,
        val versionCode: Long,
        val isSystemApp: Boolean,
        val installTime: Long,
        val updateTime: Long,
        val icon: Any?, // This would be a drawable in real implementation
        val size: Long
    )
    
    /**
     * Data class representing app usage statistics
     */
    data class AppUsageStats(
        val packageName: String,
        val appName: String,
        val lastTimeUsed: Long,
        val totalTimeInForeground: Long,
        val launchCount: Int
    )
    
    /**
     * Data class for app launch events
     */
    data class AppLaunchEvent(
        val packageName: String,
        val appName: String,
        val timestamp: Long,
        val launchSource: String // "user", "system", "sallie"
    )
    
    /**
     * Flow of app launch events
     */
    val appLaunchEvents: Flow<AppLaunchEvent>
    
    /**
     * Get a list of all installed applications
     * 
     * @param includeSystemApps Whether to include system apps in the results
     * @return Result containing list of AppInfo objects or an error
     */
    suspend fun getInstalledApps(includeSystemApps: Boolean = false): Result<List<AppInfo>>
    
    /**
     * Get detailed information about a specific app
     * 
     * @param packageName Package name of the app
     * @return Result containing AppInfo or an error if app not found
     */
    suspend fun getAppInfo(packageName: String): Result<AppInfo>
    
    /**
     * Launch an application by its package name
     * 
     * @param packageName Package name of the app to launch
     * @return Result indicating success or failure
     */
    suspend fun launchApp(packageName: String): Result<Unit>
    
    /**
     * Check if an application is currently in the foreground
     * 
     * @param packageName Package name of the app to check
     * @return true if the app is in foreground, false otherwise
     */
    suspend fun isAppInForeground(packageName: String): Boolean
    
    /**
     * Close (force stop) an application
     * Note: This requires special permissions and may not be available on all devices
     * 
     * @param packageName Package name of the app to close
     * @return Result indicating success or failure
     */
    suspend fun closeApp(packageName: String): Result<Unit>
    
    /**
     * Get usage statistics for applications
     * 
     * @param startTime Start time in milliseconds
     * @param endTime End time in milliseconds
     * @return Result containing list of AppUsageStats or an error
     */
    suspend fun getAppUsageStats(startTime: Long, endTime: Long): Result<List<AppUsageStats>>
    
    /**
     * Search for applications matching the given query
     * 
     * @param query Search query (name, package, etc.)
     * @param includeSystemApps Whether to include system apps in the results
     * @return Result containing list of matching AppInfo objects or an error
     */
    suspend fun searchApps(query: String, includeSystemApps: Boolean = false): Result<List<AppInfo>>
    
    /**
     * Check if app control functionality is available on this device
     * 
     * @return true if available, false otherwise
     */
    suspend fun isAppControlFunctionalityAvailable(): Boolean
}

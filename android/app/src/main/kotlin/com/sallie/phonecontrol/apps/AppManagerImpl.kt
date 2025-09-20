/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * AppManagerImpl - Implementation for application control operations
 */

package com.sallie.phonecontrol.apps

import android.Manifest
import android.app.ActivityManager
import android.app.AppOpsManager
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Process
import com.sallie.phonecontrol.PermissionManager
import com.sallie.phonecontrol.PhoneControlEvent
import com.sallie.phonecontrol.PhoneControlManager
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.MutableSharedFlow
import java.io.File
import java.util.Date

/**
 * Implementation of AppManager interface for application control
 */
class AppManagerImpl(
    private val context: Context,
    private val permissionManager: PermissionManager,
    private val phoneControlManager: PhoneControlManager
) : AppManager {

    private val packageManager: PackageManager = context.packageManager
    private val _appLaunchEvents = MutableSharedFlow<AppManager.AppLaunchEvent>(extraBufferCapacity = 10)
    
    companion object {
        private const val APP_CONTROL_CONSENT_ACTION = "app_control"
        private const val APP_USAGE_STATS_CONSENT_ACTION = "app_usage_stats"
    }
    
    override val appLaunchEvents: Flow<AppManager.AppLaunchEvent> = _appLaunchEvents
    
    override suspend fun getInstalledApps(includeSystemApps: Boolean): Result<List<AppManager.AppInfo>> {
        // Check user consent
        if (!permissionManager.hasUserConsent(APP_CONTROL_CONSENT_ACTION)) {
            return Result.failure(SecurityException("User has not given consent to access app information"))
        }
        
        return try {
            val installedApplications = packageManager.getInstalledApplications(PackageManager.GET_META_DATA)
            val appInfoList = mutableListOf<AppManager.AppInfo>()
            
            for (appInfo in installedApplications) {
                // Skip system apps if not requested
                if (!includeSystemApps && (appInfo.flags and ApplicationInfo.FLAG_SYSTEM != 0)) {
                    continue
                }
                
                try {
                    val packageInfo = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                        packageManager.getPackageInfo(
                            appInfo.packageName, 
                            PackageManager.PackageInfoFlags.of(0)
                        )
                    } else {
                        @Suppress("DEPRECATION")
                        packageManager.getPackageInfo(appInfo.packageName, 0)
                    }
                    
                    val appName = packageManager.getApplicationLabel(appInfo).toString()
                    val versionName = packageInfo.versionName ?: ""
                    val versionCode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                        packageInfo.longVersionCode
                    } else {
                        @Suppress("DEPRECATION")
                        packageInfo.versionCode.toLong()
                    }
                    
                    val isSystemApp = appInfo.flags and ApplicationInfo.FLAG_SYSTEM != 0
                    
                    val icon = packageManager.getApplicationIcon(appInfo)
                    
                    val apkFile = File(appInfo.sourceDir)
                    val size = apkFile.length()
                    
                    val installTime = packageInfo.firstInstallTime
                    val updateTime = packageInfo.lastUpdateTime
                    
                    val appInfoObj = AppManager.AppInfo(
                        packageName = appInfo.packageName,
                        appName = appName,
                        versionName = versionName,
                        versionCode = versionCode,
                        isSystemApp = isSystemApp,
                        installTime = installTime,
                        updateTime = updateTime,
                        icon = icon,
                        size = size
                    )
                    
                    appInfoList.add(appInfoObj)
                } catch (e: Exception) {
                    // Skip apps that cause errors
                    continue
                }
            }
            
            Result.success(appInfoList)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun getAppInfo(packageName: String): Result<AppManager.AppInfo> {
        // Check user consent
        if (!permissionManager.hasUserConsent(APP_CONTROL_CONSENT_ACTION)) {
            return Result.failure(SecurityException("User has not given consent to access app information"))
        }
        
        return try {
            val appInfo = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                packageManager.getApplicationInfo(
                    packageName, 
                    PackageManager.ApplicationInfoFlags.of(0)
                )
            } else {
                @Suppress("DEPRECATION")
                packageManager.getApplicationInfo(packageName, 0)
            }
            
            val packageInfo = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                packageManager.getPackageInfo(
                    packageName, 
                    PackageManager.PackageInfoFlags.of(0)
                )
            } else {
                @Suppress("DEPRECATION")
                packageManager.getPackageInfo(packageName, 0)
            }
            
            val appName = packageManager.getApplicationLabel(appInfo).toString()
            val versionName = packageInfo.versionName ?: ""
            val versionCode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                packageInfo.longVersionCode
            } else {
                @Suppress("DEPRECATION")
                packageInfo.versionCode.toLong()
            }
            
            val isSystemApp = appInfo.flags and ApplicationInfo.FLAG_SYSTEM != 0
            
            val icon = packageManager.getApplicationIcon(appInfo)
            
            val apkFile = File(appInfo.sourceDir)
            val size = apkFile.length()
            
            val installTime = packageInfo.firstInstallTime
            val updateTime = packageInfo.lastUpdateTime
            
            val appInfoObj = AppManager.AppInfo(
                packageName = appInfo.packageName,
                appName = appName,
                versionName = versionName,
                versionCode = versionCode,
                isSystemApp = isSystemApp,
                installTime = installTime,
                updateTime = updateTime,
                icon = icon,
                size = size
            )
            
            Result.success(appInfoObj)
        } catch (e: PackageManager.NameNotFoundException) {
            Result.failure(IllegalArgumentException("App not found: $packageName"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun launchApp(packageName: String): Result<Unit> {
        // Check user consent
        if (!permissionManager.hasUserConsent(APP_CONTROL_CONSENT_ACTION)) {
            return Result.failure(SecurityException("User has not given consent to launch apps"))
        }
        
        return try {
            // Get launch intent for package
            val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
                ?: return Result.failure(IllegalArgumentException("No launch activity found for: $packageName"))
            
            // Add flags to start new task
            launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            
            // Launch app
            context.startActivity(launchIntent)
            
            // Emit app launch event
            val appName = try {
                val appInfo = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    packageManager.getApplicationInfo(
                        packageName, 
                        PackageManager.ApplicationInfoFlags.of(0)
                    )
                } else {
                    @Suppress("DEPRECATION")
                    packageManager.getApplicationInfo(packageName, 0)
                }
                packageManager.getApplicationLabel(appInfo).toString()
            } catch (e: Exception) {
                packageName
            }
            
            val launchEvent = AppManager.AppLaunchEvent(
                packageName = packageName,
                appName = appName,
                timestamp = System.currentTimeMillis(),
                launchSource = "sallie"
            )
            
            _appLaunchEvents.tryEmit(launchEvent)
            
            // Log the event
            phoneControlManager.logEvent(
                PhoneControlEvent.AppLaunched(
                    appName = appName,
                    packageName = packageName,
                    initiatedBy = "Sallie"
                )
            )
            
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun isAppInForeground(packageName: String): Boolean {
        // Check if we have usage stats permission
        if (!hasUsageStatsPermission()) {
            return false
        }
        
        // Check user consent
        if (!permissionManager.hasUserConsent(APP_USAGE_STATS_CONSENT_ACTION)) {
            return false
        }
        
        try {
            val activityManager = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
            
            // Get running app processes
            val runningProcesses = activityManager.runningAppProcesses ?: return false
            
            for (processInfo in runningProcesses) {
                if (processInfo.importance == ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND) {
                    for (pkg in processInfo.pkgList) {
                        if (pkg == packageName) {
                            return true
                        }
                    }
                }
            }
            
            return false
        } catch (e: Exception) {
            return false
        }
    }
    
    override suspend fun closeApp(packageName: String): Result<Unit> {
        // This requires special permissions that are typically only available to system apps
        // But we can try to use Force Stop via ActivityManager or an intent
        
        // Check user consent
        if (!permissionManager.hasUserConsent(APP_CONTROL_CONSENT_ACTION)) {
            return Result.failure(SecurityException("User has not given consent to close apps"))
        }
        
        // We can attempt to use force stop via app details settings
        return try {
            val intent = Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS)
            intent.data = Uri.parse("package:$packageName")
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(intent)
            
            // Note: This doesn't actually force stop the app, just takes the user to settings
            // where they can manually force stop it. Actual force stop requires system permissions.
            
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun getAppUsageStats(startTime: Long, endTime: Long): Result<List<AppManager.AppUsageStats>> {
        // Check if we have usage stats permission
        if (!hasUsageStatsPermission()) {
            return Result.failure(SecurityException("Missing PACKAGE_USAGE_STATS permission"))
        }
        
        // Check user consent
        if (!permissionManager.hasUserConsent(APP_USAGE_STATS_CONSENT_ACTION)) {
            return Result.failure(SecurityException("User has not given consent to access app usage stats"))
        }
        
        return try {
            val usageStatsManager = context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
            
            // Query usage stats
            val queryUsageStats = usageStatsManager.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY, 
                startTime, 
                endTime
            )
            
            val appUsageStatsList = mutableListOf<AppManager.AppUsageStats>()
            
            for (usageStats in queryUsageStats) {
                val packageName = usageStats.packageName
                
                // Skip if no foreground time
                if (usageStats.totalTimeInForeground <= 0) {
                    continue
                }
                
                // Get app name
                val appName = try {
                    val appInfo = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                        packageManager.getApplicationInfo(
                            packageName, 
                            PackageManager.ApplicationInfoFlags.of(0)
                        )
                    } else {
                        @Suppress("DEPRECATION")
                        packageManager.getApplicationInfo(packageName, 0)
                    }
                    packageManager.getApplicationLabel(appInfo).toString()
                } catch (e: Exception) {
                    packageName
                }
                
                val appUsageStats = AppManager.AppUsageStats(
                    packageName = packageName,
                    appName = appName,
                    lastTimeUsed = usageStats.lastTimeUsed,
                    totalTimeInForeground = usageStats.totalTimeInForeground,
                    launchCount = usageStats.totalTimeVisible.toInt() // Not exact, but closest approximation
                )
                
                appUsageStatsList.add(appUsageStats)
            }
            
            // Sort by total time in foreground, descending
            appUsageStatsList.sortByDescending { it.totalTimeInForeground }
            
            Result.success(appUsageStatsList)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun searchApps(query: String, includeSystemApps: Boolean): Result<List<AppManager.AppInfo>> {
        // Check user consent
        if (!permissionManager.hasUserConsent(APP_CONTROL_CONSENT_ACTION)) {
            return Result.failure(SecurityException("User has not given consent to access app information"))
        }
        
        return try {
            val allApps = getInstalledApps(includeSystemApps)
                .getOrElse { return Result.failure(it) }
            
            val lowercaseQuery = query.lowercase()
            
            // Filter apps by query
            val matchingApps = allApps.filter { app ->
                app.packageName.lowercase().contains(lowercaseQuery) ||
                app.appName.lowercase().contains(lowercaseQuery)
            }
            
            Result.success(matchingApps)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun isAppControlFunctionalityAvailable(): Boolean {
        // Basic app control requires just PackageManager
        return true
    }
    
    /**
     * Check if we have the PACKAGE_USAGE_STATS permission
     */
    private fun hasUsageStatsPermission(): Boolean {
        val appOpsManager = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
        
        val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            appOpsManager.unsafeCheckOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                Process.myUid(),
                context.packageName
            )
        } else {
            @Suppress("DEPRECATION")
            appOpsManager.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                Process.myUid(),
                context.packageName
            )
        }
        
        return mode == AppOpsManager.MODE_ALLOWED
    }
}

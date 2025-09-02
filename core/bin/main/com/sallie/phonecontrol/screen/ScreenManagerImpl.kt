/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * ScreenManagerImpl - Implementation for ScreenManager
 */

package com.sallie.phonecontrol.screen

import android.Manifest
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.PixelFormat
import android.graphics.Point
import android.hardware.display.DisplayManager
import android.hardware.display.VirtualDisplay
import android.media.Image
import android.media.ImageReader
import android.media.projection.MediaProjection
import android.media.projection.MediaProjectionManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.util.DisplayMetrics
import android.view.Display
import android.view.Surface
import android.view.WindowManager
import android.widget.Toast
import androidx.annotation.RequiresPermission
import androidx.core.content.ContextCompat
import com.sallie.phonecontrol.PermissionManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.withContext
import java.nio.ByteBuffer
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Implementation of ScreenManager interface
 */
@Singleton
class ScreenManagerImpl @Inject constructor(
    private val context: Context,
    private val permissionManager: PermissionManager
) : ScreenManager {

    private val windowManager = context.getSystemService(Context.WINDOW_SERVICE) as WindowManager
    private val displayManager = context.getSystemService(Context.DISPLAY_SERVICE) as DisplayManager
    private val powerManager = context.getSystemService(Context.POWER_SERVICE) as android.os.PowerManager
    
    private val handler = Handler(Looper.getMainLooper())
    
    private var mediaProjection: MediaProjection? = null
    private var virtualDisplay: VirtualDisplay? = null
    private var imageReader: ImageReader? = null
    
    private val _screenStateUpdates = MutableSharedFlow<ScreenManager.ScreenState>()
    override val screenStateUpdates: Flow<ScreenManager.ScreenState> = _screenStateUpdates
    
    init {
        // Register display listener to monitor changes in screen state
        displayManager.registerDisplayListener(object : DisplayManager.DisplayListener {
            override fun onDisplayAdded(displayId: Int) {}
            
            override fun onDisplayRemoved(displayId: Int) {}
            
            override fun onDisplayChanged(displayId: Int) {
                // When display changes, emit updated screen state
                launchScreenStateUpdate()
            }
        }, handler)
        
        // Initialize with current screen state
        launchScreenStateUpdate()
    }
    
    private fun launchScreenStateUpdate() {
        handler.post {
            getScreenState().onSuccess { state ->
                _screenStateUpdates.tryEmit(state)
            }
        }
    }
    
    override suspend fun getScreenState(): Result<ScreenManager.ScreenState> {
        return withContext(Dispatchers.IO) {
            try {
                val display = windowManager.defaultDisplay
                val rotation = display.rotation
                
                val orientation = when (rotation) {
                    Surface.ROTATION_0 -> ScreenManager.Orientation.PORTRAIT
                    Surface.ROTATION_90 -> ScreenManager.Orientation.LANDSCAPE
                    Surface.ROTATION_180 -> ScreenManager.Orientation.REVERSE_PORTRAIT
                    Surface.ROTATION_270 -> ScreenManager.Orientation.REVERSE_LANDSCAPE
                    else -> ScreenManager.Orientation.UNKNOWN
                }
                
                val metrics = DisplayMetrics()
                display.getRealMetrics(metrics)
                val resolution = ScreenManager.ScreenResolution(
                    widthPixels = metrics.widthPixels,
                    heightPixels = metrics.heightPixels,
                    densityDpi = metrics.densityDpi
                )
                
                // Get brightness (0-255)
                val brightness = try {
                    Settings.System.getInt(context.contentResolver, Settings.System.SCREEN_BRIGHTNESS).toFloat() / 255f
                } catch (e: Exception) {
                    0.5f // Default mid-level brightness on failure
                }
                
                // Check if auto-brightness is enabled
                val isAutoBrightnessEnabled = try {
                    Settings.System.getInt(context.contentResolver, Settings.System.SCREEN_BRIGHTNESS_MODE) ==
                            Settings.System.SCREEN_BRIGHTNESS_MODE_AUTOMATIC
                } catch (e: Exception) {
                    false
                }
                
                // Get screen timeout (in milliseconds, convert to seconds)
                val screenTimeoutSeconds = try {
                    Settings.System.getInt(context.contentResolver, Settings.System.SCREEN_OFF_TIMEOUT) / 1000
                } catch (e: Exception) {
                    30 // Default 30 seconds on failure
                }
                
                // Check if rotation lock is enabled
                val isRotationLocked = try {
                    Settings.System.getInt(context.contentResolver, Settings.System.ACCELEROMETER_ROTATION) == 0
                } catch (e: Exception) {
                    false
                }
                
                // Check if blue light filter (night mode) is enabled
                // This is manufacturer specific, and may not be available on all devices
                val isBlueFilterEnabled = try {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                        context.resources.configuration.isNightModeActive
                    } else {
                        // For older devices, try to check Samsung's blue light filter
                        // This is just one example, as each manufacturer might use different settings
                        Settings.System.getInt(context.contentResolver, "blue_light_filter") == 1
                    }
                } catch (e: Exception) {
                    false
                }
                
                val screenState = ScreenManager.ScreenState(
                    isScreenOn = powerManager.isInteractive,
                    brightness = brightness,
                    isAutoBrightnessEnabled = isAutoBrightnessEnabled,
                    orientation = orientation,
                    rotationLocked = isRotationLocked,
                    screenTimeoutSeconds = screenTimeoutSeconds,
                    blueFilterEnabled = isBlueFilterEnabled,
                    screenResolution = resolution
                )
                
                Result.success(screenState)
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    override suspend fun setScreenOn(on: Boolean): Result<Unit> {
        return withContext(Dispatchers.IO) {
            try {
                if (on) {
                    // Turn screen on
                    val wakeLock = powerManager.newWakeLock(
                        android.os.PowerManager.SCREEN_BRIGHT_WAKE_LOCK or 
                        android.os.PowerManager.ACQUIRE_CAUSES_WAKEUP,
                        "Sallie:ScreenWakeLock"
                    )
                    wakeLock.acquire(1000) // Acquire for 1 second
                    wakeLock.release()
                    Result.success(Unit)
                } else {
                    // Turn screen off - requires device admin permission
                    if (!permissionManager.hasDeviceAdminPermission()) {
                        return@withContext Result.failure(SecurityException("Device admin permission required to turn off screen"))
                    }
                    
                    // Using device admin to lock the device (which typically turns off the screen)
                    val devicePolicyManager = context.getSystemService(Context.DEVICE_POLICY_SERVICE) 
                        as android.app.admin.DevicePolicyManager
                    devicePolicyManager.lockNow()
                    Result.success(Unit)
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    override suspend fun setBrightness(brightness: Float): Result<Unit> {
        return withContext(Dispatchers.IO) {
            try {
                if (!permissionManager.hasPermission(Manifest.permission.WRITE_SETTINGS)) {
                    return@withContext Result.failure(SecurityException("WRITE_SETTINGS permission required"))
                }
                
                // Convert brightness from 0.0-1.0 to 0-255
                val brightnessValue = (brightness.coerceIn(0f, 1f) * 255).toInt()
                
                // First set the brightness mode to manual
                Settings.System.putInt(
                    context.contentResolver,
                    Settings.System.SCREEN_BRIGHTNESS_MODE,
                    Settings.System.SCREEN_BRIGHTNESS_MODE_MANUAL
                )
                
                // Then set the brightness value
                Settings.System.putInt(
                    context.contentResolver, 
                    Settings.System.SCREEN_BRIGHTNESS,
                    brightnessValue
                )
                
                Result.success(Unit)
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    override suspend fun setAutoBrightness(enabled: Boolean): Result<Unit> {
        return withContext(Dispatchers.IO) {
            try {
                if (!permissionManager.hasPermission(Manifest.permission.WRITE_SETTINGS)) {
                    return@withContext Result.failure(SecurityException("WRITE_SETTINGS permission required"))
                }
                
                val mode = if (enabled) {
                    Settings.System.SCREEN_BRIGHTNESS_MODE_AUTOMATIC
                } else {
                    Settings.System.SCREEN_BRIGHTNESS_MODE_MANUAL
                }
                
                Settings.System.putInt(
                    context.contentResolver,
                    Settings.System.SCREEN_BRIGHTNESS_MODE,
                    mode
                )
                
                Result.success(Unit)
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    override suspend fun setOrientation(orientation: ScreenManager.Orientation): Result<Unit> {
        return withContext(Dispatchers.IO) {
            try {
                if (context !is Activity) {
                    return@withContext Result.failure(IllegalStateException("Context must be an Activity to set orientation"))
                }
                
                val activity = context as Activity
                val requestedOrientation = when (orientation) {
                    ScreenManager.Orientation.PORTRAIT -> 
                        android.content.pm.ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
                    ScreenManager.Orientation.LANDSCAPE ->
                        android.content.pm.ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE
                    ScreenManager.Orientation.REVERSE_PORTRAIT ->
                        android.content.pm.ActivityInfo.SCREEN_ORIENTATION_REVERSE_PORTRAIT
                    ScreenManager.Orientation.REVERSE_LANDSCAPE ->
                        android.content.pm.ActivityInfo.SCREEN_ORIENTATION_REVERSE_LANDSCAPE
                    ScreenManager.Orientation.UNKNOWN ->
                        android.content.pm.ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED
                }
                
                withContext(Dispatchers.Main) {
                    activity.requestedOrientation = requestedOrientation
                }
                
                Result.success(Unit)
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    override suspend fun setRotationLocked(locked: Boolean): Result<Unit> {
        return withContext(Dispatchers.IO) {
            try {
                if (!permissionManager.hasPermission(Manifest.permission.WRITE_SETTINGS)) {
                    return@withContext Result.failure(SecurityException("WRITE_SETTINGS permission required"))
                }
                
                val value = if (locked) 0 else 1
                
                Settings.System.putInt(
                    context.contentResolver,
                    Settings.System.ACCELEROMETER_ROTATION,
                    value
                )
                
                Result.success(Unit)
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    override suspend fun setScreenTimeout(timeoutSeconds: Int): Result<Unit> {
        return withContext(Dispatchers.IO) {
            try {
                if (!permissionManager.hasPermission(Manifest.permission.WRITE_SETTINGS)) {
                    return@withContext Result.failure(SecurityException("WRITE_SETTINGS permission required"))
                }
                
                // Convert seconds to milliseconds
                val timeoutMillis = timeoutSeconds * 1000
                
                Settings.System.putInt(
                    context.contentResolver,
                    Settings.System.SCREEN_OFF_TIMEOUT,
                    timeoutMillis
                )
                
                Result.success(Unit)
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    override suspend fun setBlueFilter(enabled: Boolean): Result<Unit> {
        return withContext(Dispatchers.IO) {
            try {
                if (!permissionManager.hasPermission(Manifest.permission.WRITE_SETTINGS)) {
                    return@withContext Result.failure(SecurityException("WRITE_SETTINGS permission required"))
                }
                
                // This is highly device-specific
                // For Android Q and above, we can try to use the night mode
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    val appCompatActivity = context as? androidx.appcompat.app.AppCompatActivity
                        ?: return@withContext Result.failure(IllegalStateException("Context must be an AppCompatActivity"))
                    
                    val nightMode = if (enabled) {
                        androidx.appcompat.app.AppCompatDelegate.MODE_NIGHT_YES
                    } else {
                        androidx.appcompat.app.AppCompatDelegate.MODE_NIGHT_NO
                    }
                    
                    withContext(Dispatchers.Main) {
                        androidx.appcompat.app.AppCompatDelegate.setDefaultNightMode(nightMode)
                    }
                    
                    return@withContext Result.success(Unit)
                }
                
                // For Samsung devices, try their specific setting
                try {
                    Settings.System.putInt(
                        context.contentResolver,
                        "blue_light_filter",
                        if (enabled) 1 else 0
                    )
                    return@withContext Result.success(Unit)
                } catch (e: Exception) {
                    // Samsung setting failed, try generic approach
                }
                
                // Generic approach for other devices might not exist
                // Return failure with appropriate message
                Result.failure(UnsupportedOperationException("Blue light filter control not supported on this device"))
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    @RequiresPermission(Manifest.permission.WRITE_EXTERNAL_STORAGE)
    override suspend fun captureScreenshot(options: ScreenManager.ScreenCaptureOptions): Result<Bitmap> {
        return withContext(Dispatchers.IO) {
            try {
                // Screen capture requires MediaProjection permission
                // In a real app, this would be initiated from an Activity
                if (mediaProjection == null) {
                    return@withContext Result.failure(IllegalStateException("MediaProjection permission not granted"))
                }
                
                // Get screen metrics
                val metrics = DisplayMetrics()
                windowManager.defaultDisplay.getRealMetrics(metrics)
                
                // Create ImageReader
                val imageReader = ImageReader.newInstance(
                    metrics.widthPixels,
                    metrics.heightPixels,
                    PixelFormat.RGBA_8888,
                    1
                )
                
                // Create VirtualDisplay
                val virtualDisplay = mediaProjection!!.createVirtualDisplay(
                    "ScreenCapture",
                    metrics.widthPixels,
                    metrics.heightPixels,
                    metrics.densityDpi,
                    DisplayManager.VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR,
                    imageReader.surface,
                    null,
                    handler
                )
                
                // Wait for an image
                var bitmap: Bitmap? = null
                val image: Image? = imageReader.acquireLatestImage()
                
                image?.use { img ->
                    val planes = img.planes
                    val buffer = planes[0].buffer
                    val pixelStride = planes[0].pixelStride
                    val rowStride = planes[0].rowStride
                    val rowPadding = rowStride - pixelStride * metrics.widthPixels
                    
                    // Create bitmap
                    bitmap = Bitmap.createBitmap(
                        metrics.widthPixels + rowPadding / pixelStride,
                        metrics.heightPixels,
                        Bitmap.Config.ARGB_8888
                    )
                    bitmap?.copyPixelsFromBuffer(buffer)
                }
                
                // Clean up
                virtualDisplay?.release()
                imageReader?.close()
                
                if (bitmap != null) {
                    // Apply quality options if needed
                    val finalBitmap = when (options.captureQuality) {
                        ScreenManager.CaptureQuality.LOW -> {
                            Bitmap.createScaledBitmap(
                                bitmap!!, 
                                bitmap!!.width / 2, 
                                bitmap!!.height / 2, 
                                true
                            )
                        }
                        ScreenManager.CaptureQuality.MEDIUM -> bitmap
                        ScreenManager.CaptureQuality.HIGH -> bitmap
                    }
                    
                    Result.success(finalBitmap!!)
                } else {
                    Result.failure(Exception("Failed to capture screenshot"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    override suspend fun keepScreenAwake(keepAwake: Boolean): Result<Unit> {
        return withContext(Dispatchers.IO) {
            try {
                if (context !is Activity) {
                    return@withContext Result.failure(IllegalStateException("Context must be an Activity"))
                }
                
                val activity = context as Activity
                
                withContext(Dispatchers.Main) {
                    if (keepAwake) {
                        activity.window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
                    } else {
                        activity.window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
                    }
                }
                
                Result.success(Unit)
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    override suspend fun showToast(message: String, longDuration: Boolean): Result<Unit> {
        return withContext(Dispatchers.IO) {
            try {
                val duration = if (longDuration) Toast.LENGTH_LONG else Toast.LENGTH_SHORT
                
                withContext(Dispatchers.Main) {
                    Toast.makeText(context, message, duration).show()
                }
                
                Result.success(Unit)
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    /**
     * Set the media projection for screenshot capabilities
     * This should be called from an Activity after requesting media projection permission
     * 
     * @param projection MediaProjection from activity result
     */
    fun setMediaProjection(projection: MediaProjection) {
        mediaProjection = projection
    }
    
    fun cleanup() {
        virtualDisplay?.release()
        imageReader?.close()
        mediaProjection?.stop()
        
        virtualDisplay = null
        imageReader = null
        mediaProjection = null
    }
}

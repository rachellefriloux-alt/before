/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * ScreenManager - Interface for device screen control operations
 */

package com.sallie.phonecontrol.screen

import android.graphics.Bitmap
import kotlinx.coroutines.flow.Flow

/**
 * Interface for managing device screen operations
 */
interface ScreenManager {

    /**
     * Data class representing screen state information
     */
    data class ScreenState(
        val isScreenOn: Boolean,
        val brightness: Float, // 0.0f to 1.0f
        val isAutoBrightnessEnabled: Boolean,
        val orientation: Orientation,
        val rotationLocked: Boolean,
        val screenTimeoutSeconds: Int,
        val blueFilterEnabled: Boolean,
        val screenResolution: ScreenResolution?
    )
    
    /**
     * Screen orientation types
     */
    enum class Orientation {
        PORTRAIT,
        LANDSCAPE,
        REVERSE_PORTRAIT,
        REVERSE_LANDSCAPE,
        UNKNOWN
    }
    
    /**
     * Data class for screen resolution
     */
    data class ScreenResolution(
        val widthPixels: Int,
        val heightPixels: Int,
        val densityDpi: Int
    )
    
    /**
     * Screen capture options
     */
    data class ScreenCaptureOptions(
        val includeStatusBar: Boolean = true,
        val includeNavigationBar: Boolean = true,
        val captureQuality: CaptureQuality = CaptureQuality.MEDIUM
    )
    
    /**
     * Screen capture quality
     */
    enum class CaptureQuality {
        LOW,
        MEDIUM,
        HIGH
    }
    
    /**
     * Flow of screen state changes
     */
    val screenStateUpdates: Flow<ScreenState>
    
    /**
     * Get current screen state
     * 
     * @return Result containing current screen state or an error
     */
    suspend fun getScreenState(): Result<ScreenState>
    
    /**
     * Turn screen on or off
     * Note: Turning the screen off usually requires device admin privileges
     * 
     * @param on True to turn screen on, false to turn it off
     * @return Result indicating success or failure
     */
    suspend fun setScreenOn(on: Boolean): Result<Unit>
    
    /**
     * Set screen brightness
     * 
     * @param brightness Brightness value between 0.0f and 1.0f
     * @return Result indicating success or failure
     */
    suspend fun setBrightness(brightness: Float): Result<Unit>
    
    /**
     * Enable or disable auto brightness
     * 
     * @param enabled True to enable auto brightness, false to disable
     * @return Result indicating success or failure
     */
    suspend fun setAutoBrightness(enabled: Boolean): Result<Unit>
    
    /**
     * Set screen orientation
     * 
     * @param orientation Desired orientation
     * @return Result indicating success or failure
     */
    suspend fun setOrientation(orientation: Orientation): Result<Unit>
    
    /**
     * Lock or unlock screen rotation
     * 
     * @param locked True to lock rotation, false to unlock
     * @return Result indicating success or failure
     */
    suspend fun setRotationLocked(locked: Boolean): Result<Unit>
    
    /**
     * Set screen timeout
     * 
     * @param timeoutSeconds Screen timeout in seconds
     * @return Result indicating success or failure
     */
    suspend fun setScreenTimeout(timeoutSeconds: Int): Result<Unit>
    
    /**
     * Enable or disable blue light filter (night mode)
     * 
     * @param enabled True to enable blue light filter, false to disable
     * @return Result indicating success or failure
     */
    suspend fun setBlueFilter(enabled: Boolean): Result<Unit>
    
    /**
     * Capture screenshot of the current screen
     * 
     * @param options Screenshot capture options
     * @return Result containing the screenshot bitmap or an error
     */
    suspend fun captureScreenshot(options: ScreenCaptureOptions = ScreenCaptureOptions()): Result<Bitmap>
    
    /**
     * Keep the screen awake during specific operations
     * 
     * @param keepAwake True to prevent screen from turning off, false to allow normal timeout
     * @return Result indicating success or failure
     */
    suspend fun keepScreenAwake(keepAwake: Boolean): Result<Unit>
    
    /**
     * Show a system toast message
     * 
     * @param message Message to display
     * @param longDuration True for long duration toast, false for short
     * @return Result indicating success or failure
     */
    suspend fun showToast(message: String, longDuration: Boolean = false): Result<Unit>
}

/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * ScreenManagerImplTest - Unit tests for ScreenManagerImpl
 */

package com.sallie.phonecontrol.screen

import android.content.Context
import android.graphics.Bitmap
import android.hardware.display.DisplayManager
import android.provider.Settings
import android.view.Display
import android.view.Surface
import android.view.WindowManager
import com.sallie.phonecontrol.PermissionManager
import io.mockk.every
import io.mockk.justRun
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

class ScreenManagerImplTest {

    // Mock dependencies
    private val context: Context = mockk(relaxed = true)
    private val permissionManager: PermissionManager = mockk(relaxed = true)
    private val windowManager: WindowManager = mockk(relaxed = true)
    private val displayManager: DisplayManager = mockk(relaxed = true)
    private val powerManager: android.os.PowerManager = mockk(relaxed = true)
    private val contentResolver: android.content.ContentResolver = mockk(relaxed = true)
    private val display: Display = mockk(relaxed = true)
    
    // System under test
    private lateinit var screenManager: ScreenManagerImpl
    
    @Before
    fun setUp() {
        // Mock getSystemService calls
        every { context.getSystemService(Context.WINDOW_SERVICE) } returns windowManager
        every { context.getSystemService(Context.DISPLAY_SERVICE) } returns displayManager
        every { context.getSystemService(Context.POWER_SERVICE) } returns powerManager
        
        // Mock contentResolver
        every { context.contentResolver } returns contentResolver
        
        // Mock display
        every { windowManager.defaultDisplay } returns display
        
        // Mock display listener registration
        val listenerSlot = slot<DisplayManager.DisplayListener>()
        justRun { displayManager.registerDisplayListener(capture(listenerSlot), any()) }
        
        // Set up the ScreenManagerImpl with mocked dependencies
        screenManager = ScreenManagerImpl(context, permissionManager)
        
        // Verify display listener was registered
        verify { displayManager.registerDisplayListener(any(), any()) }
    }
    
    @Test
    fun `getScreenState should return current screen state`() = runTest {
        // Given
        every { display.rotation } returns Surface.ROTATION_0
        every { powerManager.isInteractive } returns true
        
        // Mock Settings.System calls for brightness
        mockSettingsSystemInt(Settings.System.SCREEN_BRIGHTNESS, 128)
        mockSettingsSystemInt(Settings.System.SCREEN_BRIGHTNESS_MODE, Settings.System.SCREEN_BRIGHTNESS_MODE_MANUAL)
        mockSettingsSystemInt(Settings.System.SCREEN_OFF_TIMEOUT, 30000)
        mockSettingsSystemInt(Settings.System.ACCELEROMETER_ROTATION, 1)
        
        // When
        val result = screenManager.getScreenState()
        
        // Then
        assertTrue(result.isSuccess)
        val state = result.getOrNull()!!
        assertEquals(true, state.isScreenOn)
        assertEquals(128f/255f, state.brightness)
        assertEquals(false, state.isAutoBrightnessEnabled)
        assertEquals(ScreenManager.Orientation.PORTRAIT, state.orientation)
        assertEquals(false, state.rotationLocked)
        assertEquals(30, state.screenTimeoutSeconds)
    }
    
    @Test
    fun `setScreenOn should acquire wake lock when turning screen on`() = runTest {
        // Given
        val wakeLock = mockk<android.os.PowerManager.WakeLock>(relaxed = true)
        every { powerManager.newWakeLock(any(), any()) } returns wakeLock
        justRun { wakeLock.acquire(any<Long>()) }
        justRun { wakeLock.release() }
        
        // When
        val result = screenManager.setScreenOn(true)
        
        // Then
        assertTrue(result.isSuccess)
        verify { powerManager.newWakeLock(any(), any()) }
        verify { wakeLock.acquire(any<Long>()) }
        verify { wakeLock.release() }
    }
    
    @Test
    fun `setBrightness should update system settings when permission granted`() = runTest {
        // Given
        every { permissionManager.hasPermission(android.Manifest.permission.WRITE_SETTINGS) } returns true
        justRun { Settings.System.putInt(contentResolver, any(), any()) }
        
        // When
        val result = screenManager.setBrightness(0.5f)
        
        // Then
        assertTrue(result.isSuccess)
        verify { Settings.System.putInt(contentResolver, Settings.System.SCREEN_BRIGHTNESS_MODE, Settings.System.SCREEN_BRIGHTNESS_MODE_MANUAL) }
        verify { Settings.System.putInt(contentResolver, Settings.System.SCREEN_BRIGHTNESS, 127) } // 0.5 * 255 ~= 127
    }
    
    @Test
    fun `setAutoBrightness should update brightness mode when permission granted`() = runTest {
        // Given
        every { permissionManager.hasPermission(android.Manifest.permission.WRITE_SETTINGS) } returns true
        justRun { Settings.System.putInt(contentResolver, any(), any()) }
        
        // When
        val result = screenManager.setAutoBrightness(true)
        
        // Then
        assertTrue(result.isSuccess)
        verify { Settings.System.putInt(contentResolver, Settings.System.SCREEN_BRIGHTNESS_MODE, Settings.System.SCREEN_BRIGHTNESS_MODE_AUTOMATIC) }
    }
    
    @Test
    fun `setScreenTimeout should update timeout setting when permission granted`() = runTest {
        // Given
        every { permissionManager.hasPermission(android.Manifest.permission.WRITE_SETTINGS) } returns true
        justRun { Settings.System.putInt(contentResolver, any(), any()) }
        
        // When
        val result = screenManager.setScreenTimeout(60) // 60 seconds
        
        // Then
        assertTrue(result.isSuccess)
        verify { Settings.System.putInt(contentResolver, Settings.System.SCREEN_OFF_TIMEOUT, 60000) } // 60 seconds in ms
    }
    
    @Test
    fun `showToast should display toast message`() = runTest {
        // When
        val result = screenManager.showToast("Test message", true)
        
        // Then
        assertTrue(result.isSuccess)
    }
    
    private fun mockSettingsSystemInt(name: String, value: Int) {
        every { Settings.System.getInt(contentResolver, name) } returns value
    }
}

/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * PhoneControlManagerTest - Unit tests for PhoneControlManager
 */

package com.sallie.phonecontrol

import com.sallie.phonecontrol.apps.AppManager
import com.sallie.phonecontrol.call.CallManager
import com.sallie.phonecontrol.calendar.CalendarManager
import com.sallie.phonecontrol.location.LocationManager
import com.sallie.phonecontrol.media.MediaManager
import com.sallie.phonecontrol.messaging.MessageManager
import com.sallie.phonecontrol.screen.ScreenManager
import com.sallie.phonecontrol.system.SystemManager
import io.mockk.coVerify
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import kotlinx.coroutines.test.runTest
import org.junit.Before
import org.junit.Test

class PhoneControlManagerTest {

    // Mock dependencies
    private val permissionManager: PermissionManager = mockk(relaxed = true)
    private val callManager: CallManager = mockk(relaxed = true)
    private val messageManager: MessageManager = mockk(relaxed = true)
    private val appManager: AppManager = mockk(relaxed = true)
    private val systemManager: SystemManager = mockk(relaxed = true)
    private val mediaManager: MediaManager = mockk(relaxed = true)
    private val calendarManager: CalendarManager = mockk(relaxed = true)
    private val locationManager: LocationManager = mockk(relaxed = true)
    private val screenManager: ScreenManager = mockk(relaxed = true)
    
    // System under test
    private lateinit var phoneControlManager: PhoneControlManager
    
    @Before
    fun setUp() {
        // Create the PhoneControlManager with mock dependencies
        phoneControlManager = PhoneControlManager(
            permissionManager = permissionManager,
            callManager = callManager,
            messageManager = messageManager,
            appManager = appManager,
            systemManager = systemManager,
            mediaManager = mediaManager,
            calendarManager = calendarManager,
            locationManager = locationManager,
            screenManager = screenManager
        )
    }
    
    @Test
    fun `initialize should check permissions and initialize subsystems`() = runTest {
        // Given
        every { permissionManager.checkInitialPermissions() } returns true
        
        // When
        phoneControlManager.initialize()
        
        // Then
        verify { permissionManager.checkInitialPermissions() }
        verify { callManager.initialize() }
        verify { messageManager.initialize() }
        verify { appManager.initialize() }
        verify { systemManager.initialize() }
        verify { mediaManager.initialize() }
        verify { calendarManager.initialize() }
        verify { locationManager.initialize() }
        verify { screenManager.initialize() }
    }
    
    @Test
    fun `shutdown should call shutdown on all subsystems`() = runTest {
        // When
        phoneControlManager.shutdown()
        
        // Then
        verify { callManager.shutdown() }
        verify { messageManager.shutdown() }
        verify { appManager.shutdown() }
        verify { systemManager.shutdown() }
        verify { mediaManager.shutdown() }
        verify { calendarManager.shutdown() }
        verify { locationManager.shutdown() }
        verify { screenManager.shutdown() }
    }
    
    @Test
    fun `getSystemState should collect state from all subsystems`() = runTest {
        // Given
        val phoneState = PhoneControlManager.PhoneState(
            callActive = true,
            unreadMessages = 2,
            batteryLevel = 75,
            activeAppPackage = "com.example.app",
            mediaPlaying = true,
            nextCalendarEvent = "Meeting at 2pm",
            locationEnabled = true,
            screenOn = true
        )
        
        coVerify { phoneControlManager.getSystemState() }
    }
    
    @Test
    fun `requestPermission should delegate to PermissionManager`() = runTest {
        // Given
        val permission = "android.permission.CALL_PHONE"
        every { permissionManager.requestPermission(permission) } returns true
        
        // When
        val result = phoneControlManager.requestPermission(permission)
        
        // Then
        verify { permissionManager.requestPermission(permission) }
        assert(result)
    }
    
    @Test
    fun `hasPermission should delegate to PermissionManager`() = runTest {
        // Given
        val permission = "android.permission.READ_CONTACTS"
        every { permissionManager.hasPermission(permission) } returns true
        
        // When
        val result = phoneControlManager.hasPermission(permission)
        
        // Then
        verify { permissionManager.hasPermission(permission) }
        assert(result)
    }
}

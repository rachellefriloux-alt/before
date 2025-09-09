/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * Values authenticity, respects boundaries, and maintains unwavering devotion
 * 
 * PhoneControlSystemTest - Unit tests for PhoneControlSystem
 * Tests the app interaction and device control functionality
 */

package com.sallie.device.phone

import com.sallie.core.utils.Logger
import com.sallie.core.security.SecurityManager
import com.sallie.core.consent.RuntimeConsent
import com.sallie.device.phone.managers.*
import com.sallie.device.phone.models.*
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.launch
import kotlinx.coroutines.delay
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeout
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.AfterEach
import org.mockito.kotlin.*
import java.util.concurrent.TimeUnit
import org.junit.jupiter.api.Assertions.*

class PhoneControlSystemTest {

    // Mock dependencies
    private lateinit var appManager: AppManager
    private lateinit var securityManager: SecurityManager
    private lateinit var systemSettingsManager: SystemSettingsManager
    private lateinit var notificationManager: NotificationManager
    private lateinit var appInteractionManager: AppInteractionManager
    private lateinit var contentManager: ContentManager
    private lateinit var accessibilityManager: AccessibilityManager
    private lateinit var automationManager: AutomationManager
    private lateinit var runtimeConsent: RuntimeConsent
    
    // System under test
    private lateinit var phoneControlSystem: PhoneControlSystem
    
    @BeforeEach
    fun setup() {
        appManager = mock()
        securityManager = mock()
        systemSettingsManager = mock()
        notificationManager = mock()
        appInteractionManager = mock()
        contentManager = mock()
        accessibilityManager = mock()
        automationManager = mock()
        runtimeConsent = mock()
        
        // Setup default behavior for mocks
        whenever(securityManager.checkPermission(any())).thenReturn(true)
        whenever(runtimeConsent.requestPermission(any(), any())).thenReturn(true)
        
        // Create sample apps
        val app1 = AppInfo(
            packageName = "com.example.app1",
            name = "Example App 1",
            versionName = "1.0.0",
            versionCode = 1,
            installTime = System.currentTimeMillis() - 86400000, // 1 day ago
            updateTime = System.currentTimeMillis() - 86400000,
            size = 10000000
        )
        
        val app2 = AppInfo(
            packageName = "com.example.app2",
            name = "Example App 2",
            versionName = "2.0.0",
            versionCode = 2,
            installTime = System.currentTimeMillis() - 172800000, // 2 days ago
            updateTime = System.currentTimeMillis() - 86400000,
            size = 20000000
        )
        
        val appList = listOf(app1, app2)
        whenever(appManager.getInstalledApps()).thenReturn(appList)
        
        // Setup app session creation
        whenever(appManager.createAppSession(any())).thenAnswer { invocation ->
            val app = invocation.getArgument<AppInfo>(0)
            AppSession(app = app)
        }
        
        // Setup app launching
        whenever(appManager.launchApp(any(), any())).thenReturn(true)
        
        // Setup app closing
        whenever(appManager.closeAppSession(any())).thenReturn(true)
        whenever(appManager.forceCloseApp(any())).thenReturn(true)
        
        // Setup app action
        whenever(appInteractionManager.sendAppAction(any(), any())).thenReturn(
            AppActionResult(success = true)
        )
        
        // Setup content manager
        whenever(contentManager.getAppContent(any(), any(), any())).thenReturn(
            AppContent.TextContent(text = "Sample content")
        )
        
        // Setup accessibility manager
        whenever(accessibilityManager.getCurrentScreenContent()).thenReturn(
            ScreenContent(
                packageName = "com.example.app1",
                elements = listOf(
                    UIElement(
                        id = "test-element",
                        contentDescription = "Test Element",
                        text = "Test",
                        className = "android.widget.Button",
                        isClickable = true,
                        bounds = UIElement.Bounds(0, 0, 100, 100)
                    )
                )
            )
        )
        
        whenever(accessibilityManager.findElements(any(), any())).thenReturn(
            listOf(
                UIElement(
                    id = "test-element",
                    contentDescription = "Test Element",
                    text = "Test",
                    className = "android.widget.Button",
                    isClickable = true,
                    bounds = UIElement.Bounds(0, 0, 100, 100)
                )
            )
        )
        
        whenever(accessibilityManager.performAction(any())).thenReturn(true)
        
        // Create the system under test
        phoneControlSystem = PhoneControlSystem(
            appManager = appManager,
            securityManager = securityManager,
            systemSettingsManager = systemSettingsManager,
            notificationManager = notificationManager,
            appInteractionManager = appInteractionManager,
            contentManager = contentManager,
            accessibilityManager = accessibilityManager,
            automationManager = automationManager,
            runtimeConsent = runtimeConsent
        )
    }
    
    @AfterEach
    fun tearDown() {
        runBlocking {
            phoneControlSystem.shutdown()
        }
    }
    
    @Test
    fun `test initialize`() = runBlocking {
        // Initialize the system
        phoneControlSystem.initialize()
        
        // Verify that the system is initialized
        assertEquals(PhoneControlState.READY, phoneControlSystem.systemState.value)
        
        // Verify that the managers were initialized
        verify(appManager).initialize()
        verify(securityManager).initialize()
        verify(systemSettingsManager).initialize()
        verify(notificationManager).initialize()
        verify(appInteractionManager).initialize()
        verify(contentManager).initialize()
        verify(accessibilityManager).initialize()
        verify(automationManager).initialize()
    }
    
    @Test
    fun `test shutdown`() = runBlocking {
        // Initialize first
        phoneControlSystem.initialize()
        
        // Shutdown the system
        phoneControlSystem.shutdown()
        
        // Verify that the system is shut down
        assertEquals(PhoneControlState.INACTIVE, phoneControlSystem.systemState.value)
        
        // Verify that the managers were shut down
        verify(appManager).shutdown()
        verify(securityManager).shutdown()
        verify(systemSettingsManager).shutdown()
        verify(notificationManager).shutdown()
        verify(appInteractionManager).shutdown()
        verify(contentManager).shutdown()
        verify(accessibilityManager).shutdown()
        verify(automationManager).shutdown()
    }
    
    @Test
    fun `test refresh installed apps`() = runBlocking {
        // Initialize
        phoneControlSystem.initialize()
        
        // Refresh installed apps
        phoneControlSystem.refreshInstalledApps()
        
        // Verify that apps were retrieved from the app manager
        verify(appManager).getInstalledApps()
        
        // Verify that we have the expected number of apps
        val installedApps = phoneControlSystem.getInstalledApps()
        assertEquals(2, installedApps.size)
    }
    
    @Test
    fun `test launch app`() = runBlocking {
        // Initialize
        phoneControlSystem.initialize()
        
        // Refresh installed apps to populate the cache
        phoneControlSystem.refreshInstalledApps()
        
        // Launch an app
        val result = phoneControlSystem.launchApp("com.example.app1")
        
        // Verify the result
        assertTrue(result)
        
        // Verify that app manager was called
        verify(appManager).launchApp(any(), eq(null))
    }
    
    @Test
    fun `test launch app with parameters`() = runBlocking {
        // Initialize
        phoneControlSystem.initialize()
        
        // Refresh installed apps to populate the cache
        phoneControlSystem.refreshInstalledApps()
        
        // Launch parameters
        val launchParams = mapOf("key" to "value")
        
        // Launch an app with parameters
        val result = phoneControlSystem.launchApp("com.example.app1", launchParams)
        
        // Verify the result
        assertTrue(result)
        
        // Verify that app manager was called with the parameters
        verify(appManager).launchApp(any(), eq(launchParams))
    }
    
    @Test
    fun `test launch app with invalid package`() = runBlocking {
        // Initialize
        phoneControlSystem.initialize()
        
        // Refresh installed apps to populate the cache
        phoneControlSystem.refreshInstalledApps()
        
        // Launch an app with an invalid package
        val result = phoneControlSystem.launchApp("com.invalid.app")
        
        // Verify the result
        assertFalse(result)
        
        // Verify that app manager was not called
        verify(appManager, never()).launchApp(any(), any())
    }
    
    @Test
    fun `test close app`() = runBlocking {
        // Initialize
        phoneControlSystem.initialize()
        
        // Refresh installed apps to populate the cache
        phoneControlSystem.refreshInstalledApps()
        
        // Launch app first to create a session
        phoneControlSystem.launchApp("com.example.app1")
        
        // Close the app
        val result = phoneControlSystem.closeApp("com.example.app1")
        
        // Verify the result
        assertTrue(result)
        
        // Verify that app manager was called to close the session
        verify(appManager).closeAppSession(any())
    }
    
    @Test
    fun `test close app without session`() = runBlocking {
        // Initialize
        phoneControlSystem.initialize()
        
        // Refresh installed apps to populate the cache
        phoneControlSystem.refreshInstalledApps()
        
        // Close the app without launching it first (force close)
        val result = phoneControlSystem.closeApp("com.example.app1")
        
        // Verify the result
        assertTrue(result)
        
        // Verify that app manager was called to force close
        verify(appManager).forceCloseApp(any())
    }
    
    @Test
    fun `test send app action`() = runBlocking {
        // Initialize
        phoneControlSystem.initialize()
        
        // Refresh installed apps to populate the cache
        phoneControlSystem.refreshInstalledApps()
        
        // Launch app first to create a session
        phoneControlSystem.launchApp("com.example.app1")
        
        // Create an app action
        val action = AppAction.Click(targetId = "button", targetDescription = "Test Button")
        
        // Send the action
        val result = phoneControlSystem.sendAppAction("com.example.app1", action)
        
        // Verify the result
        assertTrue(result)
        
        // Verify that app interaction manager was called
        verify(appInteractionManager).sendAppAction(any(), eq(action))
    }
    
    @Test
    fun `test get app content`() = runBlocking {
        // Initialize
        phoneControlSystem.initialize()
        
        // Refresh installed apps to populate the cache
        phoneControlSystem.refreshInstalledApps()
        
        // Get content
        val content = phoneControlSystem.getAppContent("com.example.app1", AppContentType.TEXT)
        
        // Verify the content
        assertNotNull(content)
        assertTrue(content is AppContent.TextContent)
        assertEquals("Sample content", (content as AppContent.TextContent).text)
        
        // Verify that content manager was called
        verify(contentManager).getAppContent(any(), eq(AppContentType.TEXT), eq(null))
    }
    
    @Test
    fun `test get current screen content`() = runBlocking {
        // Initialize
        phoneControlSystem.initialize()
        
        // Get screen content
        val screenContent = phoneControlSystem.getCurrentScreenContent()
        
        // Verify the content
        assertNotNull(screenContent)
        assertEquals("com.example.app1", screenContent?.packageName)
        assertEquals(1, screenContent?.elements?.size)
        
        // Verify that accessibility manager was called
        verify(accessibilityManager).getCurrentScreenContent()
    }
    
    @Test
    fun `test find UI elements`() = runBlocking {
        // Initialize
        phoneControlSystem.initialize()
        
        // Create a query
        val query = UIElementQuery(text = "Test")
        
        // Find elements
        val elements = phoneControlSystem.findUIElements(query)
        
        // Verify the results
        assertEquals(1, elements.size)
        assertEquals("test-element", elements[0].id)
        assertEquals("Test", elements[0].text)
        
        // Verify that accessibility manager was called
        verify(accessibilityManager).getCurrentScreenContent()
        verify(accessibilityManager).findElements(any(), eq(query))
    }
    
    @Test
    fun `test perform accessibility action`() = runBlocking {
        // Initialize
        phoneControlSystem.initialize()
        
        // Create an action
        val action = AccessibilityAction.Click(target = "test-element")
        
        // Perform the action
        val result = phoneControlSystem.performAccessibilityAction(action)
        
        // Verify the result
        assertTrue(result)
        
        // Verify that accessibility manager was called
        verify(accessibilityManager).performAction(eq(action))
    }
    
    @Test
    fun `test get active notifications`() = runBlocking {
        // Initialize
        phoneControlSystem.initialize()
        
        // Get notifications
        val notifications = phoneControlSystem.getActiveNotifications()
        
        // Verify the notifications
        assertEquals(2, notifications.size)
        assertEquals("New Message", notifications[0].title)
        assertEquals("Weekly Newsletter", notifications[1].title)
    }
    
    @Test
    fun `test interact with notification`() = runBlocking {
        // Initialize
        phoneControlSystem.initialize()
        
        // Interact with a notification
        val result = phoneControlSystem.interactWithNotification("notification1", "Reply")
        
        // Verify the result
        assertTrue(result)
    }
    
    @Test
    fun `test execute cross-app workflow`() = runBlocking {
        // Initialize
        phoneControlSystem.initialize()
        
        // Refresh installed apps to populate the cache
        phoneControlSystem.refreshInstalledApps()
        
        // Create a workflow
        val workflow = CrossAppWorkflow(
            name = "Test Workflow",
            steps = listOf(
                WorkflowStep.LaunchAppStep(packageName = "com.example.app1"),
                WorkflowStep.WaitStep(durationMs = 500),
                WorkflowStep.AppActionStep(
                    packageName = "com.example.app1",
                    action = AppAction.Click(targetId = "button")
                ),
                WorkflowStep.AccessibilityStep(
                    action = AccessibilityAction.Click(target = "test-element")
                )
            )
        )
        
        // Execute the workflow
        val result = phoneControlSystem.executeCrossAppWorkflow(workflow)
        
        // Verify the result
        assertTrue(result)
        
        // Verify that app was launched
        verify(appManager).launchApp(any(), eq(null))
        
        // Verify that app action was sent
        verify(appInteractionManager).sendAppAction(any(), any())
        
        // Verify that accessibility action was performed
        verify(accessibilityManager).performAction(any())
    }
}

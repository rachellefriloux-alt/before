/*
 * Salle 1.0 Module Test
 * Persona: Tough love meets soul care.
 * Function: GestureShortcutModule tests.
 * Got it, love.
 */
package com.sallie.gesture

import android.content.Context
import android.view.MotionEvent
import io.mockk.mockk
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

class GestureShortcutModuleTest {

    private lateinit var context: Context

    @Before
    fun setup() {
        context = mockk(relaxed = true)
        GestureShortcutModule.initialize(context)
    }

    @Test
    fun `test module initialization`() {
        // Verify that the module initializes without errors
        assertNotNull(context)
    }

    @Test
    fun `test register shortcut`() {
        val shortcut = GestureShortcutModule.createCustomShortcut(
            id = "test_shortcut",
            name = "Test Shortcut",
            action = GestureShortcutModule.ShortcutAction.START_MORNING_ROUTINE,
            gestureType = GestureShortcutModule.GestureType.SWIPE_UP
        )

        val result = GestureShortcutModule.registerShortcut(shortcut)
        assertTrue("Shortcut should be registered successfully", result)

        val retrievedShortcut = GestureShortcutModule.getShortcut("test_shortcut")
        assertNotNull("Shortcut should be retrievable", retrievedShortcut)
        assertEquals("Test Shortcut", retrievedShortcut?.name)
    }

    @Test
    fun `test get shortcuts`() {
        val shortcuts = GestureShortcutModule.getShortcuts()
        assertNotNull("Shortcuts list should not be null", shortcuts)
        // Should have default shortcuts loaded
        assertTrue("Should have at least default shortcuts", shortcuts.isNotEmpty())
    }

    @Test
    fun `test unregister shortcut`() {
        val shortcut = GestureShortcutModule.createCustomShortcut(
            id = "test_unregister",
            name = "Test Unregister",
            action = GestureShortcutModule.ShortcutAction.TOGGLE_THEME,
            gestureType = GestureShortcutModule.GestureType.DOUBLE_TAP
        )

        GestureShortcutModule.registerShortcut(shortcut)
        val unregisterResult = GestureShortcutModule.unregisterShortcut("test_unregister")
        assertTrue("Shortcut should be unregistered successfully", unregisterResult)

        val retrievedShortcut = GestureShortcutModule.getShortcut("test_unregister")
        assertTrue("Shortcut should be null after unregister", retrievedShortcut == null)
    }

    @Test
    fun `test set shortcut enabled`() {
        val shortcut = GestureShortcutModule.createCustomShortcut(
            id = "test_enable",
            name = "Test Enable",
            action = GestureShortcutModule.ShortcutAction.START_WORK_ROUTINE,
            gestureType = GestureShortcutModule.GestureType.SWIPE_LEFT
        )

        GestureShortcutModule.registerShortcut(shortcut)

        // Disable shortcut
        val disableResult = GestureShortcutModule.setShortcutEnabled("test_enable", false)
        assertTrue("Shortcut should be disabled successfully", disableResult)

        var retrievedShortcut = GestureShortcutModule.getShortcut("test_enable")
        assertEquals("Shortcut should be disabled", false, retrievedShortcut?.isEnabled)

        // Re-enable shortcut
        val enableResult = GestureShortcutModule.setShortcutEnabled("test_enable", true)
        assertTrue("Shortcut should be enabled successfully", enableResult)

        retrievedShortcut = GestureShortcutModule.getShortcut("test_enable")
        assertEquals("Shortcut should be enabled", true, retrievedShortcut?.isEnabled)
    }

    @Test
    fun `test gesture types enum`() {
        // Verify all gesture types are defined
        val gestureTypes = GestureShortcutModule.GestureType.values()
        assertTrue("Should have gesture types defined", gestureTypes.isNotEmpty())

        // Verify specific gesture types exist
        assertNotNull(GestureShortcutModule.GestureType.SWIPE_UP)
        assertNotNull(GestureShortcutModule.GestureType.SWIPE_DOWN)
        assertNotNull(GestureShortcutModule.GestureType.DOUBLE_TAP)
    }

    @Test
    fun `test shortcut actions enum`() {
        // Verify all shortcut actions are defined
        val shortcutActions = GestureShortcutModule.ShortcutAction.values()
        assertTrue("Should have shortcut actions defined", shortcutActions.isNotEmpty())

        // Verify specific actions exist
        assertNotNull(GestureShortcutModule.ShortcutAction.START_MORNING_ROUTINE)
        assertNotNull(GestureShortcutModule.ShortcutAction.TOGGLE_THEME)
        assertNotNull(GestureShortcutModule.ShortcutAction.START_WORK_ROUTINE)
    }

    @Test
    fun `test create custom shortcut`() {
        val shortcut = GestureShortcutModule.createCustomShortcut(
            id = "custom_test",
            name = "Custom Test",
            action = GestureShortcutModule.ShortcutAction.CUSTOM_ACTION,
            gestureType = GestureShortcutModule.GestureType.SWIPE_RIGHT,
            customAction = "test_action"
        )

        assertEquals("custom_test", shortcut.id)
        assertEquals("Custom Test", shortcut.name)
        assertEquals(GestureShortcutModule.ShortcutAction.CUSTOM_ACTION, shortcut.action)
        assertEquals(GestureShortcutModule.GestureType.SWIPE_RIGHT, shortcut.gestureConfig.gestureType)
        assertEquals("test_action", shortcut.customAction)
        assertEquals(true, shortcut.isEnabled)
    }

    @Test
    fun `test gesture statistics`() {
        val stats = GestureShortcutModule.getGestureStatistics()
        assertNotNull("Gesture statistics should not be null", stats)
    }

    @Test
    fun `test clear all shortcuts`() {
        val shortcut = GestureShortcutModule.createCustomShortcut(
            id = "test_clear",
            name = "Test Clear",
            action = GestureShortcutModule.ShortcutAction.START_RELAXATION_ROUTINE,
            gestureType = GestureShortcutModule.GestureType.SWIPE_DOWN
        )

        GestureShortcutModule.registerShortcut(shortcut)
        GestureShortcutModule.clearAllShortcuts()

        val shortcuts = GestureShortcutModule.getShortcuts()
        assertTrue("All shortcuts should be cleared", shortcuts.isEmpty())
    }

    @Test
    fun `test is supported`() {
        val supported = GestureShortcutModule.isSupported()
        assertTrue("Gesture shortcuts should be supported", supported)
    }
}

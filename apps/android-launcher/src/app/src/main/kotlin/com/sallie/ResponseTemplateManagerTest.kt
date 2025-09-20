/*
 * Persona: Tough love meets soul care.
 * Module: ResponseTemplateManagerTest
 * Intent: Handle functionality for ResponseTemplateManagerTest
 * Provenance-ID: 447a1c08-a6a1-4512-bd61-18eca18a4092
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

package responseTemplates

import org.junit.Test
import org.junit.Assert.*

/**
 * ResponseTemplateManagerTest: Unit tests for ResponseTemplateManager
 * - Tests persona-aware, context-sensitive, event-driven, and custom template generation.
 * - Follows Salle standards for test coverage and reporting.
 */
class ResponseTemplateManagerTest {
    private val manager = ResponseTemplateManager()

    @Test
    fun testGetTemplate() {
        val result = manager.getTemplate("onboarding", "Sallie")
        assertEquals("Hello, Sallie! Welcome to onboarding.", result)
    }

    @Test
    fun testGetLocalizedTemplate() {
        val result = manager.getLocalizedTemplate("onboarding", "Sallie", "en-US")
        assertEquals("[en-US] Hello, Sallie! Welcome to onboarding.", result)
    }

    @Test
    fun testGetEventDrivenTemplate() {
        val result = manager.getEventDrivenTemplate("welcome", "Sallie")
        assertEquals("Event: welcome | Persona: Sallie", result)
    }

    @Test
    fun testGetCustomTemplate() {
        val result = manager.getCustomTemplate("custom1")
        assertEquals("Custom template for custom1", result)
    }
}

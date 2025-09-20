/*
 * Persona: Tough love meets soul care.
 * Module: ToneEngineTest
 * Intent: Handle functionality for ToneEngineTest
 * Provenance-ID: 9110c716-6f21-4b59-9cc7-ea0e97762e67
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

package com.sallie.components

import org.junit.Test
import org.junit.Assert.*

/**
 * ToneEngineTest: Unit tests for ToneEngine
 * - Tests emotional tone analysis, adaptation, and supported tones.
 * - Follows Salle standards for test coverage and reporting.
 */
class ToneEngineTest {
    private val engine = ToneEngine()

    @Test
    fun testAnalyzeToneHappy() {
        val result = engine.analyzeTone("I feel joy and delight today!")
        assertEquals("happy", result)
    }

    @Test
    fun testAnalyzeToneSad() {
        val result = engine.analyzeTone("I'm feeling blue and unhappy.")
        assertEquals("sad", result)
    }

    @Test
    fun testAnalyzeToneNeutral() {
        val result = engine.analyzeTone("This is a regular statement.")
        assertEquals("neutral", result)
    }

    @Test
    fun testAdaptTone() {
        val adapted = engine.adaptTone("Sallie", "greeting")
        assertTrue(adapted.contains("Adapted tone"))
    }

    @Test
    fun testGetSupportedTones() {
        val tones = engine.getSupportedTones()
        assertTrue(tones.contains("happy"))
        assertTrue(tones.contains("sad"))
        assertTrue(tones.contains("angry"))
        assertTrue(tones.contains("calm"))
        assertTrue(tones.contains("anxious"))
    }
}

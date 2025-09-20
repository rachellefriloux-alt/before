/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Tone and communication style management.
 * Got it, love.
 */
package com.sallie.tone

/**
 * Defines Sallie's communication tone and style patterns
 */
data class ToneProfile(
    val style: String = "supportive",
    val energy: String = "balanced",
    val formality: String = "casual"
) {
    companion object {
        val DEFAULT = ToneProfile()
        val TOUGH_LOVE = ToneProfile("direct", "high", "casual")
        val SOUL_CARE = ToneProfile("nurturing", "gentle", "warm")
    }
}

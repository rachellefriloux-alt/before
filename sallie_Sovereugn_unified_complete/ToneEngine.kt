
package com.sallie.components

class ToneEngine {
	private val tonePatterns = mapOf(
		"happy" to listOf("joy", "delight", "pleased"),
		"sad" to listOf("down", "blue", "unhappy"),
		"angry" to listOf("mad", "furious", "irritated"),
		"calm" to listOf("peaceful", "relaxed", "serene")
	)

	fun analyzeTone(text: String): String {
		val lowerText = text.lowercase()
		for ((tone, keywords) in tonePatterns) {
			if (keywords.any { lowerText.contains(it) }) {
				return tone
			}
		}
		return "neutral"
	}
}



package com.sallie.components

class ToneEngine {
	private val tonePatterns = mapOf(
		"happy" to listOf("joy", "delight", "pleased"),
		"sad" to listOf("down", "blue", "unhappy"),
		"angry" to listOf("mad", "furious", "irritated"),
		"calm" to listOf("peaceful", "relaxed", "serene")
	)

	fun analyzeTone(text: String): String {
		val lowerText = text.lowercase()
		for ((tone, keywords) in tonePatterns) {
			if (keywords.any { lowerText.contains(it) }) {
				return tone
			}
		}
		return "neutral"
	}
}


package com.sallie.components

// Adapts tone, pacing, and validation style
class ToneEngine {
    fun getToneProfile(mood: String): String = when (mood) {
        "firm" -> "Direct, punchy, tough love"
        "gentle" -> "Warm, flowing, soul care"
        "neutral" -> "Calm, clear, balanced"
        else -> "Custom tone"
    }
}


package com.sallie.components

// Adapts tone, pacing, and validation style
class ToneEngine {
    fun getToneProfile(mood: String): String = when (mood) {
        "firm" -> "Direct, punchy, tough love"
        "gentle" -> "Warm, flowing, soul care"
        "neutral" -> "Calm, clear, balanced"
        else -> "Custom tone"
    }
}


/*
 * Persona: Tough love meets soul care.
 * Module: ToneEngine
 * Intent: Handle functionality for ToneEngine
 * Provenance-ID: 47fd5887-c2b2-45b6-8b1f-854b0c7a1043
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */



package com.sallie.components

/**
 * ToneEngine: Standards-compliant engine for emotional tone analysis and adaptation.
 * - Supports detection of emotional states from text input.
 * - Extensible for custom tones, multimodal input, and persona-aware adaptation.
 * - Follows Salle privacy, modularity, and audit standards.
 */
class ToneEngine {
	private val tonePatterns = mapOf(
		"happy" to listOf("joy", "delight", "pleased", "excited", "content"),
		"sad" to listOf("down", "blue", "unhappy", "depressed", "gloomy"),
		"angry" to listOf("mad", "furious", "irritated", "annoyed", "resentful"),
		"calm" to listOf("peaceful", "relaxed", "serene", "composed", "tranquil"),
		"anxious" to listOf("nervous", "worried", "tense", "uneasy", "restless")
	)

	fun analyzeTone(text: String): String {
		val lowerText = text.lowercase()
		for ((tone, keywords) in tonePatterns) {
			if (keywords.any { lowerText.contains(it) }) {
				return tone
			}
		}
		return "neutral"
	}

	fun adaptTone(persona: String, context: String): String {
		// Example: Adapt tone based on persona and context
		return "Adapted tone for $persona in $context"
	}

	fun getSupportedTones(): List<String> = tonePatterns.keys.toList()
}



package com.sallie.components

class ToneEngine {
	private val tonePatterns = mapOf(
		"happy" to listOf("joy", "delight", "pleased"),
		"sad" to listOf("down", "blue", "unhappy"),
		"angry" to listOf("mad", "furious", "irritated"),
		"calm" to listOf("peaceful", "relaxed", "serene")
	)

	fun analyzeTone(text: String): String {
		val lowerText = text.lowercase()
		for ((tone, keywords) in tonePatterns) {
			if (keywords.any { lowerText.contains(it) }) {
				return tone
			}
		}
		return "neutral"
	}
}

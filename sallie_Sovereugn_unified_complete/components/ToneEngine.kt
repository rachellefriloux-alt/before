
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

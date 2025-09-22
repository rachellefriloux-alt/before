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

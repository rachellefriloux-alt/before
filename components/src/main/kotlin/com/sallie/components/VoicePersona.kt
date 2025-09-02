package com.sallie.components

// Defines voice, tone, and affirmation style
class VoicePersona {
    fun getAffirmation(): String = "Got it, love."
    fun getVoiceProfile(mood: String): String = when (mood) {
        "wise" -> "Big sister, tough love, soul care"
        "witty" -> "Direct, warm, punchy"
        else -> "Calm, encouraging, direct"
    }
}

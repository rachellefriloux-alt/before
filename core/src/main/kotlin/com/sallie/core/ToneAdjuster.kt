package com.sallie.core

// Adjusts tone based on emotional signals
class ToneAdjuster {
    private val toneHistory: MutableList<Pair<String, String>> = mutableListOf()

    fun adjustTone(mood: String): String {
        val tone = when (mood.lowercase()) {
            "stressed" -> "soft-grounded"
            "overwhelmed" -> "slow-warm"
            "conflict" -> "steady-neutral"
            "celebration" -> "bright-energized"
            "creative" -> "curious-expansive"
            "reflective" -> "calm-introspective"
            else -> "balanced"
        }
        toneHistory.add(Pair(mood, tone))
        return "Tone: $tone for mood: $mood"
    }

    fun getToneHistory(): List<Pair<String, String>> = toneHistory

    // Future: integrate with voice synthesis + adaptive persona engine
}

package com.sallie.core

// Balances personality traits and adapts responses
class PersonalityBalancer {
    var traits = mutableMapOf<String, Int>()
    val personaHistory: MutableList<Map<String, Int>> = mutableListOf()

    fun setTrait(trait: String, value: Int) {
        traits[trait] = value
        personaHistory.add(traits.toMap())
        // Future: sync to UI, trigger emotional logic, analytics
    }

    fun getTrait(trait: String): Int = traits[trait] ?: 0
    fun balance(): String = "Personality balanced: $traits"
    // personaHistory property acts as getter

    // Future: add hooks for AI, device, cloud integrations

    fun normalize(maxValue: Int = 100) {
        if (traits.isEmpty()) return
        val currentMax = traits.values.maxOrNull() ?: return
        if (currentMax == 0) return
        val factor = maxValue.toDouble() / currentMax.toDouble()
        traits = traits.mapValues { (_, v) -> (v * factor).toInt().coerceIn(0, maxValue) }.toMutableMap()
        personaHistory.add(traits.toMap())
    }

    fun decayAll(percent: Int = 2) {
        if (percent <= 0) return
        traits = traits.mapValues { (_, v) -> (v * (100 - percent) / 100).coerceAtLeast(0) }.toMutableMap()
        personaHistory.add(traits.toMap())
    }

    fun adaptiveAdjust(signal: String) {
        // Simple heuristic mapping
        when (signal.lowercase()) {
            "empathy" -> setTrait("empathy", getTrait("empathy") + 3)
            "focus" -> setTrait("focus", getTrait("focus") + 2)
            "creativity" -> setTrait("creativity", getTrait("creativity") + 4)
            "calm" -> setTrait("calm", getTrait("calm") + 2)
        }
        normalize()
    }
}

package com.sallie.core

// Reflects philosophy, asks value-based questions, honors legacy
class LegacyArchitect {
    private val questionsHistory: MutableList<String> = mutableListOf()
    private val legacyReflections: MutableList<String> = mutableListOf()

    fun askValueQuestion(): String {
        val question = "What matters most to you right now?"
        questionsHistory.add(question)
        return question
    }

    fun reflectLegacy(): String {
        val reflection = "Your legacy is being built every day."
        legacyReflections.add(reflection)
        return reflection
    }

    fun getQuestionsHistory(): List<String> = questionsHistory
    fun getLegacyReflections(): List<String> = legacyReflections

    // Future: add hooks for AI, device, cloud integrations
}

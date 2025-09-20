package com.sallie.core

// Tracks goals, preferences, and emotional context
class GoalAligner {
    var goals = mutableListOf<String>()
    var preferences = mutableMapOf<String, String>()
    var emotionalContext = mutableMapOf<String, String>()
    val goalHistory: MutableList<String> = mutableListOf()

    fun addGoal(goal: String) {
        goals.add(goal)
        goalHistory.add(goal)
        // Future: sync to memory, trigger emotional logic, analytics
    }

    fun setPreference(key: String, value: String) { preferences[key] = value }
    fun updateEmotion(key: String, value: String) { emotionalContext[key] = value }
    // Properties expose getters; explicit functions removed to avoid JVM signature clash

    // Future: add hooks for AI, device, cloud integrations
}

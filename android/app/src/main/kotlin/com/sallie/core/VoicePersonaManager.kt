package com.sallie.core

// Manages voice persona and profiles
class VoicePersonaManager {
    data class PersonaProfile(val name: String, val toneHint: String, val pacing: String, val warmth: Int)

    private val profiles: MutableMap<String, PersonaProfile> = mutableMapOf(
        "default" to PersonaProfile("default", "balanced", "steady", 5),
        "protective" to PersonaProfile("protective", "grounded", "slow", 7),
        "encouraging" to PersonaProfile("encouraging", "bright", "lively", 8),
        "direct" to PersonaProfile("direct", "neutral", "brisk", 3)
    )

    private val switchHistory: MutableList<String> = mutableListOf()
    var currentProfile: String = "default"

    fun switchProfile(profile: String) {
        if (profiles.containsKey(profile)) {
            currentProfile = profile
            switchHistory.add(profile)
        }
    }

    fun getProfile(): String = currentProfile
    fun getCurrentPersona(): PersonaProfile? = profiles[currentProfile]
    fun getHistory(): List<String> = switchHistory
    fun registerProfile(profile: PersonaProfile) { profiles[profile.name] = profile }

    // Future: integrate with TTS + emotional modulation engine
}

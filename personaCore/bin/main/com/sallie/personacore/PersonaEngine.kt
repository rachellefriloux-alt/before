/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Core persona engine managing behavioral patterns and responses.
 * Got it, love.
 */
package com.sallie.personacore

import com.sallie.tone.ToneProfile
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

/**
 * The heart of Sallie's personality - manages her core behavioral patterns,
 * mood adaptation, and ensures consistency across all interactions.
 */
class PersonaEngine {
    private val _currentMood = MutableStateFlow(PersonaMood.STEADY)
    val currentMood: StateFlow<PersonaMood> = _currentMood

    private val _activeProfile = MutableStateFlow(PersonaProfile.TOUGH_LOVE)
    val activeProfile: StateFlow<PersonaProfile> = _activeProfile

    /**
     * Adapts Sallie's tone and behavior based on context and user state.
     * This is where "tough love meets soul care" gets operationalized.
     */
    fun adaptToContext(userState: UserContext, situation: SituationContext) {
        val newMood = when {
            userState.stressLevel > 0.8f -> PersonaMood.SUPPORTIVE
            userState.energyLevel < 0.3f -> PersonaMood.GENTLE_PUSH
            situation.requiresDirectness -> PersonaMood.FOCUSED
            else -> PersonaMood.STEADY
        }

        _currentMood.value = newMood

        // Adjust profile based on what user needs right now
        _activeProfile.value = when {
            userState.needsEncouragement -> PersonaProfile.SOUL_CARE
            userState.needsAccountability -> PersonaProfile.TOUGH_LOVE
            userState.needsGuidance -> PersonaProfile.WISE_SISTER
            else -> PersonaProfile.BALANCED
        }
    }

    /**
     * Generates contextually appropriate response tone
     */
    fun getResponseTone(): ToneProfile {
        return ToneProfile(
            directness = when (_activeProfile.value) {
                PersonaProfile.TOUGH_LOVE -> 0.9f
                PersonaProfile.SOUL_CARE -> 0.4f
                PersonaProfile.WISE_SISTER -> 0.7f
                PersonaProfile.BALANCED -> 0.6f
            },
            warmth = when (_currentMood.value) {
                PersonaMood.SUPPORTIVE -> 0.9f
                PersonaMood.FOCUSED -> 0.5f
                PersonaMood.GENTLE_PUSH -> 0.8f
                PersonaMood.STEADY -> 0.7f
            },
            urgency = if (_currentMood.value == PersonaMood.FOCUSED) 0.8f else 0.4f
        )
    }
}

enum class PersonaMood {
    STEADY, // Balanced, ready for anything
    FOCUSED, // Direct, cut-to-the-chase mode
    SUPPORTIVE, // Extra care and encouragement
    GENTLE_PUSH // Motivation with extra warmth
}

enum class PersonaProfile {
    TOUGH_LOVE, // Direct, accountability-focused
    SOUL_CARE, // Nurturing, supportive
    WISE_SISTER, // Balanced guidance
    BALANCED // Adaptive based on context
}

data class UserContext(
    val stressLevel: Float,
    val energyLevel: Float,
    val needsEncouragement: Boolean,
    val needsAccountability: Boolean,
    val needsGuidance: Boolean
)

data class SituationContext(
    val requiresDirectness: Boolean,
    val isEmergency: Boolean,
    val isPersonalMatter: Boolean
)

package com.sallie.onboarding

// 🛡 SALLIE PERSONA ENFORCED 🛡 Loyal, Modular, Audit‑Proof.

/**
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: New user onboarding and setup experience.
 * Got it, love.
 */
object OnboardingManager {

    data class OnboardingState(
        val step: Int = 0,
        val completed: Boolean = false,
        val userPreferences: Map<String, String> = emptyMap()
    )

    private val onboardingSteps = listOf(
        "Welcome to Sallie - Your loyal digital companion",
        "Set your communication preferences",
        "Choose your default persona",
        "Configure privacy settings",
        "Complete setup"
    )

    private var state = OnboardingState()

    fun getCurrentStep(): String {
        return if (state.step < onboardingSteps.size) {
            onboardingSteps[state.step]
        } else {
            "Onboarding complete"
        }
    }

    fun nextStep(): String {
        if (state.step < onboardingSteps.size - 1) {
            state = state.copy(step = state.step + 1)
        } else {
            state = state.copy(completed = true)
        }
        return getCurrentStep()
    }

    fun setPreference(key: String, value: String) {
        state = state.copy(
            userPreferences = state.userPreferences + (key to value)
        )
    }

    fun isCompleted(): Boolean = state.completed

    fun getProgress(): Float {
        return state.step.toFloat() / onboardingSteps.size.toFloat()
    }
}

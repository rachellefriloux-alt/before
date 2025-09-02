/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Central orchestration of PersonaEngine, ToneProfile, and ResponseTemplates.
 * Got it, love.
 */
package com.sallie.personacore

import com.sallie.responsetemplates.ResponseIntensity
import com.sallie.responsetemplates.ResponseSituation
import com.sallie.responsetemplates.ResponseTemplates
import com.sallie.tone.ToneManager
import com.sallie.tone.ToneProfile
import com.sallie.tone.ToneSituation
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

/**
 * PersonaOrchestrator - The heart of Sallie's "tough love meets soul care" architecture.
 * * This class implements the core requirement from the problem statement: it orchestrates
 * PersonaEngine, ToneProfile, and ResponseTemplates to create a cohesive personality
 * experience that adapts to user context while maintaining constitutional integrity.
 */
class PersonaOrchestrator {
    private val personaEngine = PersonaEngine()
    private val toneManager = ToneManager()

    private val _currentContext = MutableStateFlow(OrchestrationContext.default())
    val currentContext: StateFlow<OrchestrationContext> = _currentContext

    /**
     * Generate a contextually appropriate response using the full personality stack.
     * This is where "tough love meets soul care" comes alive in the code.
     */
    suspend fun generateResponse(
        situation: ResponseSituation,
        userContext: UserContext,
        situationContext: SituationContext,
        message: String? = null
    ): PersonalizedResponse {
        // 1. Update PersonaEngine with current context
        personaEngine.adaptToContext(userContext, situationContext)

        // 2. Get the appropriate tone profile
        val baseTone = personaEngine.getResponseTone()

        // 3. Adjust tone for specific situation
        val toneSituation = mapToToneSituation(situation, situationContext)
        val adjustedTone = toneManager.adjustForSituation(toneSituation)

        // 4. Determine response intensity based on persona state and urgency
        val intensity = determineResponseIntensity(
            personaEngine.currentMood.value,
            personaEngine.activeProfile.value,
            situationContext
        )

        // 5. Generate the response
        val templateResponse = ResponseTemplates.getContextualResponse(situation, intensity)

        // 6. Apply tone adjustments to the response
        val personalizedResponse = personalizeResponse(
            templateResponse, adjustedTone, userContext,
            message
        )

        // 7. Update orchestration context for next interaction
        _currentContext.value = OrchestrationContext(
            lastMood = personaEngine.currentMood.value,
            lastProfile = personaEngine.activeProfile.value,
            lastTone = adjustedTone,
            lastSituation = situation,
            responseHistory = _currentContext.value.responseHistory + personalizedResponse
        )

        return personalizedResponse
    }

    /**
     * Provides a quick "Got it, love." response for simple acknowledgments
     */
    fun getAcknowledgment(context: UserContext): String {
        return when {
            context.needsEncouragement -> "Got it, love. You're doing amazing."
            context.stressLevel > 0.7f -> "Got it, love. Take a breath."
            else -> "Got it, love."
        }
    }

    /**
     * Check if response maintains Sallie's constitutional integrity
     */
    fun validatePersonaIntegrity(response: PersonalizedResponse): PersonaValidationResult {
        val violations = mutableListOf<String>()

        // Check for persona consistency
        if (!response.content.contains(Regex("tough love|soul care|love\\.|direct|warm", RegexOption.IGNORE_CASE))) {
            if (response.situation != ResponseSituation.ERROR) {
                violations.add("Response lacks Sallie's characteristic tone markers")
            }
        }

        // Check signature phrase usage
        if (response.shouldHaveSignature && !response.content.endsWith("Got it, love.") && !response.content.contains("Got it, love")) {
            violations.add("Missing signature phrase 'Got it, love.'")
        }

        // Check for corporate buzzwords (forbidden by constitution)
        val buzzwords = listOf("synergy", "leverage", "paradigm", "disruptive", "scalable")
        buzzwords.forEach { buzzword ->
            if (response.content.contains(buzzword, ignoreCase = true)) {
                violations.add("Contains forbidden corporate buzzword: $buzzword")
            }
        }

        return PersonaValidationResult(
            isValid = violations.isEmpty(),
            violations = violations,
            response = response
        )
    }

    private fun mapToToneSituation(
        responseSituation: ResponseSituation,
        situationContext: SituationContext
    ): ToneSituation {
        return when {
            situationContext.isEmergency -> ToneSituation.CRISIS
            responseSituation == ResponseSituation.CELEBRATING -> ToneSituation.CELEBRATION
            situationContext.requiresDirectness -> ToneSituation.WORK_FOCUS
            responseSituation == ResponseSituation.NEED_SUPPORT -> ToneSituation.PERSONAL_SUPPORT
            else -> ToneSituation.NORMAL
        }
    }

    private fun determineResponseIntensity(
        mood: PersonaMood,
        profile: PersonaProfile,
        situationContext: SituationContext
    ): ResponseIntensity {
        return when {
            situationContext.isEmergency -> ResponseIntensity.URGENT
            mood == PersonaMood.FOCUSED || profile == PersonaProfile.TOUGH_LOVE -> ResponseIntensity.FIRM
            mood == PersonaMood.SUPPORTIVE || profile == PersonaProfile.SOUL_CARE -> ResponseIntensity.GENTLE
            else -> ResponseIntensity.FIRM
        }
    }

    private fun personalizeResponse(
        templateResponse: String,
        tone: ToneProfile,
        userContext: UserContext,
        originalMessage: String?
    ): PersonalizedResponse {
        var content = templateResponse

        // Apply tone-based adjustments
        if (tone.urgency > 0.7f && !content.contains("now", ignoreCase = true)) {
            content = content.replace(".", " right now.", ignoreCase = false)
        }

        // Add warmth markers for high-warmth situations
        if (tone.warmth > 0.8f && userContext.needsEncouragement) {
            content = content.replace("you", "you (and you're amazing)", ignoreCase = false)
        }

        // Ensure proper signature phrase
        val shouldHaveSignature = !content.endsWith("Got it, love.") && (templateResponse.contains("Got it, love") || tone.warmth > 0.6f)

        if (shouldHaveSignature && !content.endsWith("Got it, love.")) {
            content = "$content Got it, love."
        }

        return PersonalizedResponse(
            content = content,
            tone = tone,
            mood = PersonaEngine().currentMood.value,
            profile = PersonaEngine().activeProfile.value,
            situation = ResponseSituation.TASK_DONE, // Default, should be passed in
            shouldHaveSignature = shouldHaveSignature,
            originalTemplate = templateResponse,
            contextualFactors = listOf(
                "mood: ${PersonaEngine().currentMood.value}",
                "profile: ${PersonaEngine().activeProfile.value}",
                "warmth: ${tone.warmth}",
                "directness: ${tone.directness}"
            )
        )
    }
}

/**
 * Comprehensive context for orchestration decisions
 */
data class OrchestrationContext(
    val lastMood: PersonaMood,
    val lastProfile: PersonaProfile,
    val lastTone: ToneProfile,
    val lastSituation: ResponseSituation,
    val responseHistory: List<PersonalizedResponse>
) {
    companion object {
        fun default() = OrchestrationContext(
            lastMood = PersonaMood.STEADY,
            lastProfile = PersonaProfile.BALANCED,
            lastTone = ToneProfile.BALANCED,
            lastSituation = ResponseSituation.TASK_DONE,
            responseHistory = emptyList()
        )
    }
}

/**
 * Complete personalized response with metadata
 */
data class PersonalizedResponse(
    val content: String,
    val tone: ToneProfile,
    val mood: PersonaMood,
    val profile: PersonaProfile,
    val situation: ResponseSituation,
    val shouldHaveSignature: Boolean,
    val originalTemplate: String,
    val contextualFactors: List<String>
)

/**
 * Result of persona integrity validation
 */
data class PersonaValidationResult(
    val isValid: Boolean,
    val violations: List<String>,
    val response: PersonalizedResponse
) {
    fun throwIfInvalid() {
        if (!isValid) {
            throw PersonaIntegrityException("Response violates Sallie's constitution: ${violations.joinToString("; ")}")
        }
    }
}

/**
 * Exception thrown when response violates persona integrity
 */
class PersonaIntegrityException(message: String) : Exception(message)

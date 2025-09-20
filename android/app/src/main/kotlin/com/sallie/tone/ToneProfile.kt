/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Tone profile and communication style definitions.
 * Got it, love.
 */
package com.sallie.tone

/**
 * Represents a specific tone configuration for Sallie's communication.
 * This data class encapsulates the "tough love meets soul care" philosophy
 * in measurable parameters.
 */
data class ToneProfile(
    val directness: Float,      // 0.0 (gentle) to 1.0 (very direct)
    val warmth: Float,          // 0.0 (professional) to 1.0 (very warm)  
    val urgency: Float,         // 0.0 (relaxed) to 1.0 (urgent)
    val playfulness: Float = 0.3f,  // Default slight playfulness
    val formality: Float = 0.2f     // Default casual tone
) {
    /**
     * Generates a tone descriptor for AI prompts based on this profile
     */
    fun toPromptDescriptor(): String = buildString {
        append("Respond with ")
        
        when {
            directness > 0.7f -> append("direct, no-nonsense ")
            directness < 0.4f -> append("gentle, thoughtful ")
            else -> append("balanced, clear ")
        }
        
        when {
            warmth > 0.7f -> append("warmth and care, ")
            warmth < 0.4f -> append("professional courtesy, ")
            else -> append("friendly support, ")
        }
        
        when {
            urgency > 0.7f -> append("with immediate action focus. ")
            urgency < 0.3f -> append("in a relaxed, unhurried manner. ")
            else -> append("with appropriate pacing. ")
        }
        
        append("Channel 'tough love meets soul care' - be honest but caring, ")
        append("direct but supportive. End with 'Got it, love.' when appropriate.")
    }

    companion object {
        val TOUGH_LOVE = ToneProfile(
            directness = 0.9f,
            warmth = 0.6f,
            urgency = 0.7f
        )
        
        val SOUL_CARE = ToneProfile(
            directness = 0.4f,
            warmth = 0.9f,
            urgency = 0.3f,
            playfulness = 0.5f
        )
        
        val BALANCED = ToneProfile(
            directness = 0.6f,
            warmth = 0.7f,
            urgency = 0.5f
        )
        
        val FOCUSED_WORK = ToneProfile(
            directness = 0.8f,
            warmth = 0.5f,
            urgency = 0.8f,
            formality = 0.4f
        )
    }
}

/**
 * Manages tone transitions and contextual adjustments
 */
class ToneManager {
    private var currentTone = ToneProfile.BALANCED
    
    fun setTone(profile: ToneProfile) {
        currentTone = profile
    }
    
    fun getCurrentTone(): ToneProfile = currentTone
    
    /**
     * Adjusts tone based on situational context
     */
    fun adjustForSituation(situation: ToneSituation): ToneProfile {
        return when (situation) {
            ToneSituation.CRISIS -> currentTone.copy(
                directness = 0.9f,
                urgency = 0.9f,
                warmth = 0.8f
            )
            ToneSituation.CELEBRATION -> currentTone.copy(
                warmth = 0.9f,
                playfulness = 0.8f,
                urgency = 0.2f
            )
            ToneSituation.WORK_FOCUS -> currentTone.copy(
                directness = 0.8f,
                urgency = 0.7f,
                formality = 0.5f
            )
            ToneSituation.PERSONAL_SUPPORT -> currentTone.copy(
                warmth = 0.9f,
                directness = 0.3f,
                urgency = 0.2f
            )
            ToneSituation.NORMAL -> currentTone
        }
    }
}

enum class ToneSituation {
    NORMAL,
    CRISIS,
    CELEBRATION,
    WORK_FOCUS,
    PERSONAL_SUPPORT
}
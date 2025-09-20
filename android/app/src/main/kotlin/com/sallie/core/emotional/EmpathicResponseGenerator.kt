package com.sallie.core.emotional

/**
 * Sallie 2.0 Module
 * Persona: Tough love meets soul care.
 * Function: Empathic response generation system.
 * Got it, love.
 */
import android.content.Context
import com.sallie.core.memory.HierarchicalMemorySystem
import com.sallie.core.personality.AdvancedPersonalitySystem
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * System for generating empathic responses based on recognized emotional states
 */
class EmpathicResponseGenerator private constructor(
    private val context: Context
) {
    companion object {
        @Volatile
        private var instance: EmpathicResponseGenerator? = null
        
        fun getInstance(context: Context): EmpathicResponseGenerator {
            return instance ?: synchronized(this) {
                instance ?: EmpathicResponseGenerator(context.applicationContext).also { instance = it }
            }
        }
    }
    
    private lateinit var emotionalIntelligenceEngine: EmotionalIntelligenceEngine
    private lateinit var personalitySystem: AdvancedPersonalitySystem
    private lateinit var memorySystem: HierarchicalMemorySystem
    
    /**
     * Initialize dependencies
     */
    fun initialize() {
        emotionalIntelligenceEngine = EmotionalIntelligenceEngine.getInstance(context)
        personalitySystem = AdvancedPersonalitySystem.getInstance(context)
        memorySystem = HierarchicalMemorySystem.getInstance(context)
    }
    
    /**
     * Generate an empathic response to the user's emotional state
     * @param emotionalState The recognized emotional state
     * @param userInput The user's original input text
     * @param responseType The type of response to generate
     * @return An empathically appropriate response
     */
    suspend fun generateResponse(
        emotionalState: EmotionalRecognitionResult,
        userInput: String,
        responseType: ResponseType = ResponseType.BALANCED
    ): EmpathicResponse = withContext(Dispatchers.Default) {
        // Get personality traits to influence response style
        val personalityTraits = personalitySystem.getCurrentTraits()
        
        // Get response components based on emotional state
        val acknowledgment = generateAcknowledgment(emotionalState, personalityTraits)
        val validation = generateValidation(emotionalState, userInput, personalityTraits)
        val support = generateSupport(emotionalState, userInput, personalityTraits)
        val encouragement = generateEncouragement(emotionalState, userInput, personalityTraits)
        
        // Compose full response based on requested type
        val fullResponse = composeFullResponse(
            acknowledgment,
            validation,
            support,
            encouragement,
            responseType,
            personalityTraits
        )
        
        // Record response for future reference
        recordResponse(emotionalState, fullResponse)
        
        EmpathicResponse(
            acknowledgment = acknowledgment,
            validation = validation,
            support = support,
            encouragement = encouragement,
            fullResponse = fullResponse,
            emotionalState = emotionalState
        )
    }
    
    /**
     * Generate acknowledgment of the user's emotional state
     */
    private fun generateAcknowledgment(
        emotionalState: EmotionalRecognitionResult,
        personalityTraits: Map<String, Double>
    ): String {
        // Skip acknowledgment if low confidence
        if (emotionalState.confidenceScore < EmotionalIntelligenceEngine.LOW_CONFIDENCE) {
            return ""
        }
        
        val compassion = personalityTraits["COMPASSION"] ?: 0.7
        val directness = personalityTraits["ASSERTIVENESS"] ?: 0.6
        
        // Select appropriate acknowledgment based on emotion
        val baseAcknowledgment = when (emotionalState.primaryEmotion) {
            Emotion.JOY -> listOf(
                "I can tell you're feeling happy about this.",
                "You seem really pleased right now.",
                "I'm sensing a lot of joy from you."
            )
            Emotion.SADNESS -> listOf(
                "I can see that you're feeling down.",
                "You seem sad right now.",
                "I'm noticing that this is bringing you down."
            )
            Emotion.ANGER -> listOf(
                "I can tell you're feeling frustrated.",
                "You seem pretty upset about this.",
                "I'm sensing that you're angry right now."
            )
            Emotion.FEAR -> listOf(
                "I can see you're worried about this.",
                "You seem anxious about the situation.",
                "I'm noticing that this is making you nervous."
            )
            Emotion.SURPRISE -> listOf(
                "That seems to have caught you off guard.",
                "You sound surprised by this.",
                "I can tell this wasn't what you expected."
            )
            Emotion.CONTENTMENT -> listOf(
                "You seem pretty content with how things are.",
                "I'm sensing a peaceful energy from you.",
                "You sound satisfied with this."
            )
            Emotion.DISAPPOINTMENT -> listOf(
                "I can tell you're feeling let down.",
                "You sound disappointed about how this turned out.",
                "I'm sensing that this didn't meet your expectations."
            )
            Emotion.CONFUSION -> listOf(
                "I can see you're trying to make sense of this.",
                "You seem a bit confused right now.",
                "This situation feels unclear to you."
            )
            else -> listOf(
                "I'm listening to how you're feeling.",
                "I'm here with you in this moment.",
                "I'm tuned into what you're expressing."
            )
        }
        
        // Select random acknowledgment
        val selectedAcknowledgment = baseAcknowledgment.random()
        
        // Adjust based on personality traits
        return when {
            compassion > 0.8 -> "I really hear you. $selectedAcknowledgment"
            compassion < 0.4 && directness > 0.7 -> selectedAcknowledgment.replace("I can see", "It's clear").replace("I'm sensing", "Obviously")
            else -> selectedAcknowledgment
        }
    }
    
    /**
     * Generate validation of the user's feelings
     */
    private fun generateValidation(
        emotionalState: EmotionalRecognitionResult,
        userInput: String,
        personalityTraits: Map<String, Double>
    ): String {
        val empathy = personalityTraits["EMOTIONAL_INTELLIGENCE"] ?: 0.6
        val directness = personalityTraits["ASSERTIVENESS"] ?: 0.6
        
        // Generate different validation based on emotion category
        val baseValidation = when {
            emotionalState.primaryEmotion == Emotion.JOY || 
            emotionalState.primaryEmotion == Emotion.EXCITEMENT ||
            emotionalState.primaryEmotion == Emotion.CONTENTMENT -> listOf(
                "It's wonderful to feel that way.",
                "Those positive feelings are definitely worth savoring.",
                "It's great to experience those kinds of moments."
            )
            emotionalState.primaryEmotion == Emotion.SADNESS || 
            emotionalState.primaryEmotion == Emotion.DISAPPOINTMENT -> listOf(
                "It's completely understandable to feel that way given what happened.",
                "Those feelings make a lot of sense in this situation.",
                "Anyone would feel similar in your position."
            )
            emotionalState.primaryEmotion == Emotion.ANGER || 
            emotionalState.primaryEmotion == Emotion.FRUSTRATION -> listOf(
                "Your frustration is valid considering the circumstances.",
                "It's natural to feel that way when things don't go as expected.",
                "That kind of situation would test anyone's patience."
            )
            emotionalState.primaryEmotion == Emotion.FEAR || 
            emotionalState.primaryEmotion == Emotion.ANXIETY -> listOf(
                "Those concerns are completely valid.",
                "It makes sense to feel cautious about this.",
                "That uncertainty would make anyone feel on edge."
            )
            emotionalState.primaryEmotion == Emotion.CONFUSION -> listOf(
                "It's perfectly reasonable to feel uncertain about this.",
                "This kind of situation can definitely be confusing.",
                "It's okay to not have everything figured out yet."
            )
            else -> listOf(
                "What you're feeling is completely valid.",
                "Your emotional response makes sense.",
                "It's natural to have those feelings in this situation."
            )
        }
        
        // Select random validation
        val selectedValidation = baseValidation.random()
        
        // Adjust based on personality traits
        return when {
            empathy > 0.8 -> "$selectedValidation I truly understand why you'd feel that way."
            empathy < 0.4 && directness > 0.7 -> selectedValidation.replace("It's completely understandable", "It makes sense").replace("Your feelings are valid", "That reaction is logical")
            directness > 0.8 -> selectedValidation.replace("It's okay", "It's normal")
            else -> selectedValidation
        }
    }
    
    /**
     * Generate supportive content based on emotional state
     */
    private fun generateSupport(
        emotionalState: EmotionalRecognitionResult,
        userInput: String,
        personalityTraits: Map<String, Double>
    ): String {
        val compassion = personalityTraits["COMPASSION"] ?: 0.7
        val patience = personalityTraits["PATIENCE"] ?: 0.6
        
        // Skip support for neutral or positive emotions
        if (emotionalState.primaryEmotion == Emotion.NEUTRAL || 
            emotionalState.primaryEmotion == Emotion.JOY || 
            emotionalState.primaryEmotion == Emotion.CONTENTMENT) {
            return ""
        }
        
        // Generate different support based on emotion category
        val baseSupport = when (emotionalState.primaryEmotion) {
            Emotion.SADNESS -> listOf(
                "I'm here for you through this difficult time.",
                "Sometimes just acknowledging the sadness is an important step.",
                "It's okay to take time to process these feelings."
            )
            Emotion.ANGER -> listOf(
                "I'm here to listen without judgment.",
                "Let's work through this frustration together.",
                "Sometimes expressing these feelings is the first step to resolving them."
            )
            Emotion.FEAR -> listOf(
                "We can face this uncertainty together.",
                "Let's break this down into more manageable pieces.",
                "I'm here to help you navigate through this."
            )
            Emotion.DISAPPOINTMENT -> listOf(
                "It's okay to feel disappointed when things don't meet expectations.",
                "Let's see if we can find a path forward from here.",
                "Sometimes setbacks lead us to unexpected opportunities."
            )
            Emotion.CONFUSION -> listOf(
                "Let's see if we can bring some clarity to this situation.",
                "I'm here to help you work through these questions.",
                "Sometimes talking it through helps make things clearer."
            )
            Emotion.ANXIETY -> listOf(
                "Let's take this one step at a time.",
                "I'm here to help you manage these anxious feelings.",
                "We can work on strategies to help you feel more centered."
            )
            else -> listOf(
                "I'm here to support you through this.",
                "Let me know how I can best help you right now.",
                "We can work through this together."
            )
        }
        
        // Select random support statement
        val selectedSupport = baseSupport.random()
        
        // Adjust based on personality traits
        return when {
            compassion > 0.8 -> "$selectedSupport Remember that you don't have to face this alone."
            patience > 0.8 -> "$selectedSupport Take all the time you need."
            compassion < 0.4 -> selectedSupport.replace("I'm here for you", "Let's address this").replace("difficult time", "situation")
            else -> selectedSupport
        }
    }
    
    /**
     * Generate encouraging content based on emotional state
     */
    private fun generateEncouragement(
        emotionalState: EmotionalRecognitionResult,
        userInput: String,
        personalityTraits: Map<String, Double>
    ): String {
        val optimism = personalityTraits["OPTIMISM"] ?: 0.6
        val assertiveness = personalityTraits["ASSERTIVENESS"] ?: 0.6
        
        // Skip encouragement for strongly positive emotions
        if (emotionalState.primaryEmotion == Emotion.JOY || 
            emotionalState.primaryEmotion == Emotion.EXCITEMENT) {
            return ""
        }
        
        // Generate different encouragement based on emotion
        val baseEncouragement = when (emotionalState.primaryEmotion) {
            Emotion.SADNESS -> listOf(
                "Even though it's difficult now, things will eventually improve.",
                "It's okay to take time to heal, and tomorrow is a new day.",
                "Small steps forward can lead to meaningful change."
            )
            Emotion.FEAR -> listOf(
                "You've overcome challenges before, and you can navigate this too.",
                "Taking things one step at a time can make this feel more manageable.",
                "Courage isn't the absence of fear, but moving forward despite it."
            )
            Emotion.DISAPPOINTMENT -> listOf(
                "Every setback carries the seeds of new opportunities.",
                "This doesn't define what's possible for you going forward.",
                "Sometimes the best paths reveal themselves after a disappointment."
            )
            Emotion.FRUSTRATION -> listOf(
                "Let's break this down into smaller, more manageable steps.",
                "Sometimes a brief step back gives us a clearer way forward.",
                "Your persistence will eventually pay off."
            )
            Emotion.CONFUSION -> listOf(
                "Clarity often comes with time and reflection.",
                "Let's tackle this one piece at a time.",
                "It's okay not to have all the answers right away."
            )
            Emotion.NEUTRAL -> listOf(
                "I believe in your ability to handle whatever comes next.",
                "You have more strengths than you might realize in this moment.",
                "Each step forward, however small, is progress."
            )
            else -> listOf(
                "You have the inner resources to move through this.",
                "I believe in your capacity to navigate this situation.",
                "Small steps forward can lead to meaningful change."
            )
        }
        
        // Select random encouragement
        val selectedEncouragement = baseEncouragement.random()
        
        // Adjust based on personality traits
        return when {
            optimism > 0.8 -> "I'm confident that $selectedEncouragement Things will get better!"
            assertiveness > 0.8 && optimism < 0.5 -> selectedEncouragement.replace("Eventually", "With effort").replace("will improve", "can improve")
            assertiveness > 0.8 -> "You've got this. $selectedEncouragement"
            else -> selectedEncouragement
        }
    }
    
    /**
     * Compose a full response from individual components
     */
    private fun composeFullResponse(
        acknowledgment: String,
        validation: String,
        support: String,
        encouragement: String,
        responseType: ResponseType,
        personalityTraits: Map<String, Double>
    ): String {
        // Get personality influences
        val directness = personalityTraits["ASSERTIVENESS"] ?: 0.6
        val compassion = personalityTraits["COMPASSION"] ?: 0.7
        
        // Compose based on response type and personality
        return when (responseType) {
            ResponseType.ACKNOWLEDGMENT_FOCUSED -> {
                if (acknowledgment.isNotEmpty()) {
                    "$acknowledgment ${if (validation.isNotEmpty()) "$validation" else ""}"
                } else {
                    validation
                }
            }
            ResponseType.VALIDATION_FOCUSED -> {
                if (validation.isNotEmpty()) {
                    "$validation ${if (support.isNotEmpty()) "$support" else ""}"
                } else {
                    "$acknowledgment ${if (support.isNotEmpty()) "$support" else ""}"
                }
            }
            ResponseType.SUPPORT_FOCUSED -> {
                if (support.isNotEmpty()) {
                    "$acknowledgment $support ${if (encouragement.isNotEmpty()) "$encouragement" else ""}"
                } else {
                    "$acknowledgment $validation"
                }
            }
            ResponseType.ENCOURAGEMENT_FOCUSED -> {
                if (encouragement.isNotEmpty()) {
                    "${if (acknowledgment.isNotEmpty()) "$acknowledgment " else ""}$encouragement"
                } else {
                    "$acknowledgment $support"
                }
            }
            ResponseType.BALANCED -> {
                // Adjust balance based on personality
                when {
                    directness > 0.8 && compassion < 0.5 -> {
                        // More direct, less compassionate
                        "$acknowledgment $validation ${if (encouragement.isNotEmpty()) "$encouragement" else ""}"
                    }
                    compassion > 0.8 -> {
                        // Highly compassionate
                        "$acknowledgment $validation $support ${if (encouragement.isNotEmpty()) "$encouragement" else ""}"
                    }
                    else -> {
                        // Balanced approach
                        val components = mutableListOf<String>()
                        if (acknowledgment.isNotEmpty()) components.add(acknowledgment)
                        if (validation.isNotEmpty()) components.add(validation)
                        if (support.isNotEmpty() && compassion > 0.6) components.add(support)
                        if (encouragement.isNotEmpty()) components.add(encouragement)
                        components.joinToString(" ")
                    }
                }
            }
        }
    }
    
    /**
     * Record generated response for future reference
     */
    private suspend fun recordResponse(
        emotionalState: EmotionalRecognitionResult,
        response: String
    ) {
        if (!::memorySystem.isInitialized) return
        
        val metadata = mapOf(
            "primaryEmotion" to emotionalState.primaryEmotion.name,
            "secondaryEmotion" to (emotionalState.secondaryEmotion?.name ?: "NONE"),
            "confidenceScore" to emotionalState.confidenceScore,
            "responseText" to response,
            "timestamp" to System.currentTimeMillis()
        )
        
        memorySystem.store(
            content = "Empathic response: $response",
            category = "EMPATHIC_RESPONSE",
            metadata = metadata
        )
    }
}

/**
 * Types of empathic responses
 */
enum class ResponseType {
    ACKNOWLEDGMENT_FOCUSED,  // Focus on acknowledging the emotion
    VALIDATION_FOCUSED,      // Focus on validating feelings
    SUPPORT_FOCUSED,         // Focus on providing support
    ENCOURAGEMENT_FOCUSED,   // Focus on encouragement and motivation
    BALANCED                 // Balanced approach using all components
}

/**
 * Complete empathic response with individual components
 */
data class EmpathicResponse(
    val acknowledgment: String,
    val validation: String,
    val support: String,
    val encouragement: String,
    val fullResponse: String,
    val emotionalState: EmotionalRecognitionResult
)

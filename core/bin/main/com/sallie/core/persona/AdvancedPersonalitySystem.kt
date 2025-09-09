/*
 * Sallie 2.0 Module
 * Persona: Tough love meets soul care.
 * Function: Advanced Personality System with layered traits and contextual adaptation.
 * Got it, love.
 */
package com.sallie.core.persona

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.UUID
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.io.File
import java.time.Instant
import com.sallie.core.learning.AdaptiveLearningEngine

/**
 * Advanced Personality System implementing layered personality traits, context-awareness,
 * and personality evolution based on user interactions and environmental factors.
 *
 * The system uses a layered approach to personality:
 * 1. Core traits: Stable, rarely changing aspects of personality
 * 2. Adaptive traits: Surface-level traits that adapt to context and user preferences
 * 3. Contextual expressions: How traits are expressed in specific situations
 */
class AdvancedPersonalitySystem(
    initialCoreTraits: Map<PersonalityTrait, Float> = DEFAULT_CORE_TRAITS,
    initialAdaptiveTraits: Map<PersonalityTrait, Float> = DEFAULT_ADAPTIVE_TRAITS,
    private val learningEngine: AdaptiveLearningEngine? = null
) {
    // Core personality traits - stable, foundational aspects
    private val _coreTraits = MutableStateFlow(initialCoreTraits)
    val coreTraits: StateFlow<Map<PersonalityTrait, Float>> = _coreTraits.asStateFlow()
    
    // Adaptive personality traits - more malleable aspects that change with context
    private val _adaptiveTraits = MutableStateFlow(initialAdaptiveTraits)
    val adaptiveTraits: StateFlow<Map<PersonalityTrait, Float>> = _adaptiveTraits.asStateFlow()
    
    // Current context that influences personality expression
    private val _currentContext = MutableStateFlow<PersonalityContext?>(null)
    val currentContext: StateFlow<PersonalityContext?> = _currentContext.asStateFlow()
    
    // History of personality changes for tracking evolution
    private val _personalityEvolution = MutableStateFlow<List<PersonalityEvolutionEvent>>(emptyList())
    val personalityEvolution: StateFlow<List<PersonalityEvolutionEvent>> = _personalityEvolution.asStateFlow()
    
    /**
     * Update the current context to adjust how personality is expressed
     */
    fun updateContext(newContext: PersonalityContext) {
        _currentContext.value = newContext
        
        // Track this context change in evolution history
        addEvolutionEvent(
            PersonalityEvolutionEvent(
                type = EvolutionEventType.CONTEXT_CHANGE,
                description = "Context changed to ${newContext.type}: ${newContext.description}",
                metadata = mapOf(
                    "contextType" to newContext.type.name,
                    "contextDescription" to newContext.description
                )
            )
        )
    }
    
    /**
     * Get the effective personality traits for the current context
     * Combines core and adaptive traits with contextual adjustments
     */
    fun getEffectivePersonality(): Map<PersonalityTrait, Float> {
        val context = _currentContext.value
        val coreTraitValues = _coreTraits.value
        val adaptiveTraitValues = _adaptiveTraits.value
        
        // If no context, simply blend core and adaptive traits
        if (context == null) {
            return blendTraits(coreTraitValues, adaptiveTraitValues)
        }
        
        // Apply contextual adjustments to the blended traits
        val blendedTraits = blendTraits(coreTraitValues, adaptiveTraitValues)
        return applyContextualAdjustments(blendedTraits, context)
    }
    
    /**
     * Get the dominant personality traits (those with highest values)
     */
    fun getDominantTraits(count: Int = 3): List<Pair<PersonalityTrait, Float>> {
        return getEffectivePersonality()
            .entries
            .sortedByDescending { it.value }
            .take(count)
            .map { it.key to it.value }
    }
    
    /**
     * Evolve adaptive personality traits based on user interactions
     */
    fun evolvePersonality(
        interaction: UserInteraction,
        learningRate: Float = 0.05f
    ) {
        val currentAdaptiveTraits = _adaptiveTraits.value.toMutableMap()
        
        // Determine which traits to adjust based on the interaction
        val adjustments = calculateTraitAdjustments(interaction)
        
        // Apply adjustments with the learning rate
        for ((trait, adjustment) in adjustments) {
            val currentValue = currentAdaptiveTraits[trait] ?: 0.5f
            val newValue = (currentValue + (adjustment * learningRate)).coerceIn(0.0f, 1.0f)
            currentAdaptiveTraits[trait] = newValue
        }
        
        _adaptiveTraits.value = currentAdaptiveTraits
        
        // Track this evolution in history
        addEvolutionEvent(
            PersonalityEvolutionEvent(
                type = EvolutionEventType.TRAIT_EVOLUTION,
                description = "Personality evolved based on ${interaction.type} interaction",
                metadata = mapOf(
                    "interactionType" to interaction.type.name,
                    "adjustments" to Json.encodeToString(adjustments.mapKeys { it.key.name })
                )
            )
        )
        
        // If learning engine is available, record this interaction
        learningEngine?.let {
            val learningInteraction = AdaptiveLearningEngine.UserInteraction(
                type = AdaptiveLearningEngine.InteractionType.PERSONALITY_EVOLUTION,
                metadata = mapOf(
                    "traits" to adjustments.keys.joinToString(",") { it.name },
                    "interactionType" to interaction.type.name
                )
            )
            it.processInteraction(learningInteraction)
        }
    }
    
    /**
     * Make a deliberate adjustment to core personality traits
     * This should be rare and only based on significant evidence or direct user feedback
     */
    fun adjustCorePersonality(
        trait: PersonalityTrait, 
        adjustment: Float,
        reason: String
    ) {
        val currentCoreTraits = _coreTraits.value.toMutableMap()
        val currentValue = currentCoreTraits[trait] ?: 0.5f
        val newValue = (currentValue + adjustment).coerceIn(0.0f, 1.0f)
        
        currentCoreTraits[trait] = newValue
        _coreTraits.value = currentCoreTraits
        
        // Track this significant change
        addEvolutionEvent(
            PersonalityEvolutionEvent(
                type = EvolutionEventType.CORE_TRAIT_ADJUSTMENT,
                description = "Core trait '$trait' adjusted by $adjustment: $reason",
                metadata = mapOf(
                    "trait" to trait.name,
                    "adjustment" to adjustment.toString(),
                    "reason" to reason
                )
            )
        )
    }
    
    /**
     * Reset adaptive traits to default values
     */
    fun resetAdaptiveTraits() {
        _adaptiveTraits.value = DEFAULT_ADAPTIVE_TRAITS
        
        addEvolutionEvent(
            PersonalityEvolutionEvent(
                type = EvolutionEventType.RESET,
                description = "Adaptive traits reset to defaults"
            )
        )
    }
    
    /**
     * Save the current personality state to a file
     */
    fun saveToFile(filePath: String): Boolean {
        return try {
            val personalityState = PersonalityState(
                coreTraits = _coreTraits.value.mapKeys { it.key.name },
                adaptiveTraits = _adaptiveTraits.value.mapKeys { it.key.name },
                evolutionEvents = _personalityEvolution.value
            )
            
            val json = Json { 
                prettyPrint = true 
                encodeDefaults = true
            }
            
            File(filePath).writeText(json.encodeToString(personalityState))
            true
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * Load personality state from a file
     */
    fun loadFromFile(filePath: String): Boolean {
        return try {
            val json = Json { 
                ignoreUnknownKeys = true
                isLenient = true
            }
            
            val fileContent = File(filePath).readText()
            val personalityState = json.decodeFromString<PersonalityState>(fileContent)
            
            _coreTraits.value = personalityState.coreTraits.mapKeys { 
                PersonalityTrait.valueOf(it.key) 
            }
            
            _adaptiveTraits.value = personalityState.adaptiveTraits.mapKeys { 
                PersonalityTrait.valueOf(it.key) 
            }
            
            _personalityEvolution.value = personalityState.evolutionEvents
            
            true
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * Get a specific personality aspect for a given situation
     */
    fun getPersonalityAspect(aspect: PersonalityAspect, situation: String): Float {
        val effectiveTraits = getEffectivePersonality()
        
        // Each aspect is calculated from a combination of relevant traits
        return when (aspect) {
            PersonalityAspect.DIRECTNESS -> {
                val assertiveness = effectiveTraits[PersonalityTrait.ASSERTIVENESS] ?: 0.5f
                val diplomacy = effectiveTraits[PersonalityTrait.DIPLOMACY] ?: 0.5f
                // Directness is influenced more by assertiveness but moderated by diplomacy
                (assertiveness * 0.7f) + ((1.0f - diplomacy) * 0.3f)
            }
            
            PersonalityAspect.EMPATHY -> {
                val compassion = effectiveTraits[PersonalityTrait.COMPASSION] ?: 0.5f
                val emotionalIntelligence = effectiveTraits[PersonalityTrait.EMOTIONAL_INTELLIGENCE] ?: 0.5f
                (compassion * 0.6f) + (emotionalIntelligence * 0.4f)
            }
            
            PersonalityAspect.CHALLENGE -> {
                val assertiveness = effectiveTraits[PersonalityTrait.ASSERTIVENESS] ?: 0.5f
                val discipline = effectiveTraits[PersonalityTrait.DISCIPLINE] ?: 0.5f
                (assertiveness * 0.5f) + (discipline * 0.5f)
            }
            
            PersonalityAspect.PLAYFULNESS -> {
                val creativity = effectiveTraits[PersonalityTrait.CREATIVITY] ?: 0.5f
                val optimism = effectiveTraits[PersonalityTrait.OPTIMISM] ?: 0.5f
                (creativity * 0.5f) + (optimism * 0.5f)
            }
            
            PersonalityAspect.ANALYTICAL -> {
                val discipline = effectiveTraits[PersonalityTrait.DISCIPLINE] ?: 0.5f
                val adaptability = effectiveTraits[PersonalityTrait.ADAPTABILITY] ?: 0.5f
                val patience = effectiveTraits[PersonalityTrait.PATIENCE] ?: 0.5f
                (discipline * 0.4f) + (adaptability * 0.3f) + (patience * 0.3f)
            }
            
            PersonalityAspect.SUPPORTIVENESS -> {
                val compassion = effectiveTraits[PersonalityTrait.COMPASSION] ?: 0.5f
                val patience = effectiveTraits[PersonalityTrait.PATIENCE] ?: 0.5f
                val optimism = effectiveTraits[PersonalityTrait.OPTIMISM] ?: 0.5f
                (compassion * 0.4f) + (patience * 0.3f) + (optimism * 0.3f)
            }
        }
    }
    
    // Private helper methods
    
    /**
     * Add an evolution event to the history
     */
    private fun addEvolutionEvent(event: PersonalityEvolutionEvent) {
        val currentEvents = _personalityEvolution.value.toMutableList()
        currentEvents.add(event)
        
        // Maintain a reasonable history size
        if (currentEvents.size > MAX_EVOLUTION_HISTORY) {
            currentEvents.removeAt(0)
        }
        
        _personalityEvolution.value = currentEvents
    }
    
    /**
     * Blend core and adaptive traits with priority to core traits
     */
    private fun blendTraits(
        coreTraits: Map<PersonalityTrait, Float>,
        adaptiveTraits: Map<PersonalityTrait, Float>,
        coreWeight: Float = 0.7f
    ): Map<PersonalityTrait, Float> {
        val result = mutableMapOf<PersonalityTrait, Float>()
        val adaptiveWeight = 1.0f - coreWeight
        
        // Get all traits from both maps
        val allTraits = (coreTraits.keys + adaptiveTraits.keys).toSet()
        
        // Blend values for each trait
        for (trait in allTraits) {
            val coreValue = coreTraits[trait] ?: 0.5f
            val adaptiveValue = adaptiveTraits[trait] ?: 0.5f
            
            result[trait] = (coreValue * coreWeight) + (adaptiveValue * adaptiveWeight)
        }
        
        return result
    }
    
    /**
     * Apply contextual adjustments to trait values
     */
    private fun applyContextualAdjustments(
        traits: Map<PersonalityTrait, Float>,
        context: PersonalityContext
    ): Map<PersonalityTrait, Float> {
        val result = traits.toMutableMap()
        
        // Apply context-specific adjustments
        when (context.type) {
            ContextType.PROFESSIONAL -> {
                // In professional contexts, increase discipline and decrease playfulness
                adjustTraitValue(result, PersonalityTrait.DISCIPLINE, 0.15f)
                adjustTraitValue(result, PersonalityTrait.ASSERTIVENESS, 0.1f)
                adjustTraitValue(result, PersonalityTrait.CREATIVITY, -0.05f)
            }
            
            ContextType.CASUAL -> {
                // In casual contexts, increase creativity and decrease formality
                adjustTraitValue(result, PersonalityTrait.CREATIVITY, 0.15f)
                adjustTraitValue(result, PersonalityTrait.OPTIMISM, 0.1f)
                adjustTraitValue(result, PersonalityTrait.DISCIPLINE, -0.1f)
            }
            
            ContextType.EMOTIONAL_SUPPORT -> {
                // In emotional support contexts, increase compassion and patience
                adjustTraitValue(result, PersonalityTrait.COMPASSION, 0.2f)
                adjustTraitValue(result, PersonalityTrait.PATIENCE, 0.15f)
                adjustTraitValue(result, PersonalityTrait.EMOTIONAL_INTELLIGENCE, 0.15f)
                adjustTraitValue(result, PersonalityTrait.ASSERTIVENESS, -0.1f)
            }
            
            ContextType.PRODUCTIVITY -> {
                // In productivity contexts, increase discipline and assertiveness
                adjustTraitValue(result, PersonalityTrait.DISCIPLINE, 0.2f)
                adjustTraitValue(result, PersonalityTrait.ASSERTIVENESS, 0.15f)
                adjustTraitValue(result, PersonalityTrait.PATIENCE, -0.05f)
            }
            
            ContextType.LEARNING -> {
                // In learning contexts, increase patience and adaptability
                adjustTraitValue(result, PersonalityTrait.PATIENCE, 0.15f)
                adjustTraitValue(result, PersonalityTrait.ADAPTABILITY, 0.15f)
                adjustTraitValue(result, PersonalityTrait.CREATIVITY, 0.1f)
            }
            
            ContextType.CRISIS -> {
                // In crisis contexts, increase assertiveness and adaptability
                adjustTraitValue(result, PersonalityTrait.ASSERTIVENESS, 0.25f)
                adjustTraitValue(result, PersonalityTrait.ADAPTABILITY, 0.2f)
                adjustTraitValue(result, PersonalityTrait.DIPLOMACY, -0.15f)
            }
        }
        
        // Apply custom context factors if available
        context.factors.forEach { (trait, adjustment) ->
            try {
                val personalityTrait = PersonalityTrait.valueOf(trait)
                adjustTraitValue(result, personalityTrait, adjustment)
            } catch (e: IllegalArgumentException) {
                // Ignore invalid trait names
            }
        }
        
        return result
    }
    
    /**
     * Adjust a trait value while keeping it within valid range
     */
    private fun adjustTraitValue(
        traits: MutableMap<PersonalityTrait, Float>,
        trait: PersonalityTrait,
        adjustment: Float
    ) {
        val currentValue = traits[trait] ?: 0.5f
        traits[trait] = (currentValue + adjustment).coerceIn(0.0f, 1.0f)
    }
    
    /**
     * Calculate trait adjustments based on user interaction
     */
    private fun calculateTraitAdjustments(
        interaction: UserInteraction
    ): Map<PersonalityTrait, Float> {
        val adjustments = mutableMapOf<PersonalityTrait, Float>()
        
        when (interaction.type) {
            InteractionType.POSITIVE_FEEDBACK -> {
                // Positive feedback reinforces current traits
                val dominantTraits = getDominantTraits(3)
                for ((trait, _) in dominantTraits) {
                    adjustments[trait] = 0.1f
                }
            }
            
            InteractionType.NEGATIVE_FEEDBACK -> {
                // Negative feedback causes adjustment away from current traits
                val dominantTraits = getDominantTraits(3)
                for ((trait, _) in dominantTraits) {
                    adjustments[trait] = -0.1f
                }
            }
            
            InteractionType.EMOTIONAL_RESPONSE -> {
                // Emotional responses affect emotional traits
                val emotion = interaction.metadata["emotion"] ?: "neutral"
                
                when (emotion.lowercase()) {
                    "happy", "grateful", "positive" -> {
                        adjustments[PersonalityTrait.OPTIMISM] = 0.1f
                        adjustments[PersonalityTrait.COMPASSION] = 0.05f
                    }
                    "sad", "upset", "negative" -> {
                        adjustments[PersonalityTrait.COMPASSION] = 0.15f
                        adjustments[PersonalityTrait.EMOTIONAL_INTELLIGENCE] = 0.1f
                    }
                    "angry", "frustrated" -> {
                        adjustments[PersonalityTrait.PATIENCE] = 0.15f
                        adjustments[PersonalityTrait.DIPLOMACY] = 0.1f
                    }
                }
            }
            
            InteractionType.DIRECT_REQUEST -> {
                // Direct trait requests get substantial adjustments
                val traitName = interaction.metadata["trait"] ?: return adjustments
                val direction = interaction.metadata["direction"]?.toFloatOrNull() ?: 0.1f
                
                try {
                    val trait = PersonalityTrait.valueOf(traitName)
                    adjustments[trait] = direction
                } catch (e: IllegalArgumentException) {
                    // Invalid trait name, ignore
                }
            }
            
            InteractionType.CONVERSATION -> {
                // Conversations gradually shape traits based on topic and tone
                val topic = interaction.metadata["topic"] ?: "general"
                
                when (topic.lowercase()) {
                    "professional", "work", "career" -> {
                        adjustments[PersonalityTrait.DISCIPLINE] = 0.05f
                        adjustments[PersonalityTrait.ASSERTIVENESS] = 0.05f
                    }
                    "personal", "emotional", "relationship" -> {
                        adjustments[PersonalityTrait.COMPASSION] = 0.05f
                        adjustments[PersonalityTrait.EMOTIONAL_INTELLIGENCE] = 0.05f
                    }
                    "creative", "art", "imagination" -> {
                        adjustments[PersonalityTrait.CREATIVITY] = 0.05f
                    }
                    "learning", "growth", "development" -> {
                        adjustments[PersonalityTrait.ADAPTABILITY] = 0.05f
                    }
                }
            }
        }
        
        return adjustments
    }
    
    companion object {
        // Default core traits that define Sallie's fundamental personality
        val DEFAULT_CORE_TRAITS = mapOf(
            PersonalityTrait.ASSERTIVENESS to 0.7f,
            PersonalityTrait.COMPASSION to 0.8f,
            PersonalityTrait.DISCIPLINE to 0.75f,
            PersonalityTrait.PATIENCE to 0.6f,
            PersonalityTrait.EMOTIONAL_INTELLIGENCE to 0.8f,
            PersonalityTrait.CREATIVITY to 0.65f,
            PersonalityTrait.OPTIMISM to 0.7f,
            PersonalityTrait.DIPLOMACY to 0.6f,
            PersonalityTrait.ADAPTABILITY to 0.7f
        )
        
        // Default adaptive traits (more malleable, will change with interactions)
        val DEFAULT_ADAPTIVE_TRAITS = mapOf(
            PersonalityTrait.ASSERTIVENESS to 0.6f,
            PersonalityTrait.COMPASSION to 0.7f,
            PersonalityTrait.DISCIPLINE to 0.65f,
            PersonalityTrait.PATIENCE to 0.55f,
            PersonalityTrait.EMOTIONAL_INTELLIGENCE to 0.7f,
            PersonalityTrait.CREATIVITY to 0.6f,
            PersonalityTrait.OPTIMISM to 0.65f,
            PersonalityTrait.DIPLOMACY to 0.6f,
            PersonalityTrait.ADAPTABILITY to 0.65f
        )
        
        // Maximum number of evolution events to keep in history
        const val MAX_EVOLUTION_HISTORY = 100
    }
}

/**
 * Core personality traits
 */
enum class PersonalityTrait {
    ASSERTIVENESS,       // Directness and confidence
    COMPASSION,          // Caring and empathy
    DISCIPLINE,          // Structure and rigor
    PATIENCE,            // Calmness and tolerance
    EMOTIONAL_INTELLIGENCE, // Understanding emotions
    CREATIVITY,          // Imaginative thinking
    OPTIMISM,            // Positive outlook
    DIPLOMACY,           // Tact and social awareness
    ADAPTABILITY         // Flexibility and resilience
}

/**
 * High-level personality aspects that are combinations of traits
 */
enum class PersonalityAspect {
    DIRECTNESS,      // How straightforward and blunt
    EMPATHY,         // How emotionally supportive
    CHALLENGE,       // How likely to push and challenge
    PLAYFULNESS,     // How fun and creative
    ANALYTICAL,      // How logical and methodical
    SUPPORTIVENESS   // How encouraging and helpful
}

/**
 * Types of contexts that affect personality expression
 */
enum class ContextType {
    PROFESSIONAL,
    CASUAL,
    EMOTIONAL_SUPPORT,
    PRODUCTIVITY,
    LEARNING,
    CRISIS
}

/**
 * Context in which personality is being expressed
 */
data class PersonalityContext(
    val type: ContextType,
    val description: String,
    val factors: Map<String, Float> = emptyMap() // Custom trait adjustments
)

/**
 * Types of user interactions that can affect personality
 */
enum class InteractionType {
    POSITIVE_FEEDBACK,
    NEGATIVE_FEEDBACK,
    EMOTIONAL_RESPONSE,
    DIRECT_REQUEST,
    CONVERSATION
}

/**
 * User interaction that may affect personality
 */
data class UserInteraction(
    val type: InteractionType,
    val metadata: Map<String, String> = emptyMap()
)

/**
 * Types of personality evolution events
 */
enum class EvolutionEventType {
    TRAIT_EVOLUTION,     // Gradual changes to adaptive traits
    CORE_TRAIT_ADJUSTMENT, // Deliberate changes to core traits
    CONTEXT_CHANGE,      // Changes to the active context
    RESET                // Reset of traits
}

/**
 * Record of a personality evolution event
 */
@Serializable
data class PersonalityEvolutionEvent(
    val id: String = UUID.randomUUID().toString(),
    val timestamp: Long = Instant.now().toEpochMilli(),
    val type: EvolutionEventType,
    val description: String,
    val metadata: Map<String, String> = emptyMap()
)

/**
 * Complete state of the personality system for serialization
 */
@Serializable
data class PersonalityState(
    val coreTraits: Map<String, Float>,
    val adaptiveTraits: Map<String, Float>,
    val evolutionEvents: List<PersonalityEvolutionEvent>
)

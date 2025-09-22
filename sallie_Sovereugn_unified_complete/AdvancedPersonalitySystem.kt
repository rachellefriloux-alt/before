

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


/*
 * Sallie 2.0 Module
 * Persona: Tough love meets soul care.
 * Function: Advanced personality system with traits, context awareness, and evolution.
 * Got it, love.
 */
package feature.personality

import android.content.Context
import core.memory.HierarchicalMemorySystem
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.serialization.Serializable
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.io.File
import java.time.Instant
import java.util.UUID

/**
 * AdvancedPersonalitySystem - Core personality engine for Sallie 2.0
 *
 * This system implements a layered approach to personality:
 * 1. Core traits - Stable, foundational aspects of personality
 * 2. Adaptive traits - Adjustable traits that evolve based on user interactions
 * 3. Effective traits - Real-time traits that consider context and current state
 *
 * The system supports context-awareness, personality evolution, and serialization.
 */
class AdvancedPersonalitySystem(
    private val coreTraitsPath: String,
    private val adaptiveTraitsPath: String,
    private val evolutionHistoryPath: String,
    private val memorySystem: HierarchicalMemorySystem? = null
) {
    private var coreTraits: TraitSet = TraitSet()
    private var adaptiveTraits: TraitSet = TraitSet()
    private var effectiveTraits: TraitSet = TraitSet()
    private var currentContext: Context = Context(ContextType.CASUAL, "Default context")
    private var evolutionHistory: EvolutionHistory? = null
    
    // State flow for the current context
    private val _contextFlow = MutableStateFlow(currentContext)
    val contextFlow: StateFlow<Context> = _contextFlow.asStateFlow()
    
    init {
        // Initialize with default traits if files don't exist
        initializeDefaultTraits()
        
        // Load traits from files if they exist
        loadCoreTraits()
        loadAdaptiveTraits()
        loadEvolutionHistory()
        
        // Calculate effective traits based on current context
        recalculateEffectiveTraits()
    }
    
    /**
     * Get the core traits
     */
    fun getCoreTraits(): TraitSet = coreTraits
    
    /**
     * Get the adaptive traits
     */
    fun getAdaptiveTraits(): TraitSet = adaptiveTraits
    
    /**
     * Get the effective traits (used for actual behavior)
     */
    fun getEffectiveTraits(): TraitSet = effectiveTraits
    
    /**
     * Get the current context
     */
    fun getCurrentContext(): Context = currentContext
    
    /**
     * Get the evolution history
     */
    fun getEvolutionHistory(): EvolutionHistory? = evolutionHistory
    
    /**
     * Set a new context, which will affect effective traits
     */
    fun setContext(context: Context): Boolean {
        currentContext = context
        _contextFlow.value = context
        
        // Recalculate effective traits based on new context
        recalculateEffectiveTraits()
        
        // Add to evolution history
        evolutionHistory?.addEvent(
            EvolutionEvent(
                id = Instant.now().toEpochMilli(),
                timestamp = Instant.now(),
                type = EvolutionEventType.CONTEXT_CHANGE,
                description = "Context changed to ${context.type.name}: ${context.description}"
            )
        )
        
        // Save history
        saveEvolutionHistory()
        
        return true
    }
    
    /**
     * Adjust a core trait (these should change very rarely)
     */
    fun adjustCoreTrait(trait: Trait, adjustment: Float): Boolean {
        val currentValue = coreTraits.traits[trait]?.value ?: 0.5f
        val newValue = (currentValue + adjustment).coerceIn(0f, 1f)
        
        coreTraits.traits[trait] = TraitValue(newValue)
        
        // Recalculate effective traits
        recalculateEffectiveTraits()
        
        // Add to evolution history
        evolutionHistory?.addEvent(
            EvolutionEvent(
                id = Instant.now().toEpochMilli(),
                timestamp = Instant.now(),
                type = EvolutionEventType.CORE_TRAIT_ADJUSTMENT,
                description = "Core trait '${trait.name}' adjusted by $adjustment"
            )
        )
        
        // Save core traits and history
        saveCoreTraits()
        saveEvolutionHistory()
        
        return true
    }
    
    /**
     * Adjust an adaptive trait (these can change based on user preferences)
     */
    fun adjustAdaptiveTrait(trait: Trait, adjustment: Float): Boolean {
        val currentValue = adaptiveTraits.traits[trait]?.value ?: 0.5f
        val newValue = (currentValue + adjustment).coerceIn(0f, 1f)
        
        adaptiveTraits.traits[trait] = TraitValue(newValue)
        
        // Recalculate effective traits
        recalculateEffectiveTraits()
        
        // Add to evolution history
        evolutionHistory?.addEvent(
            EvolutionEvent(
                id = Instant.now().toEpochMilli(),
                timestamp = Instant.now(),
                type = EvolutionEventType.TRAIT_EVOLUTION,
                description = "Adaptive trait '${trait.name}' adjusted by $adjustment"
            )
        )
        
        // Save adaptive traits and history
        saveAdaptiveTraits()
        saveEvolutionHistory()
        
        return true
    }
    
    /**
     * Reset adaptive traits to default values based on core traits
     */
    fun resetAdaptiveTraits(): Boolean {
        // Reset adaptive traits to be slightly varied from core traits
        for (trait in Trait.values()) {
            val coreValue = coreTraits.traits[trait]?.value ?: 0.5f
            // Small random variation from core trait
            val variation = (Math.random() * 0.2 - 0.1).toFloat()
            adaptiveTraits.traits[trait] = TraitValue((coreValue + variation).coerceIn(0f, 1f))
        }
        
        // Recalculate effective traits
        recalculateEffectiveTraits()
        
        // Add to evolution history
        evolutionHistory?.addEvent(
            EvolutionEvent(
                id = Instant.now().toEpochMilli(),
                timestamp = Instant.now(),
                type = EvolutionEventType.RESET,
                description = "Adaptive traits reset to defaults"
            )
        )
        
        // Save adaptive traits and history
        saveAdaptiveTraits()
        saveEvolutionHistory()
        
        return true
    }
    
    /**
     * Evolve personality based on interactions
     */
    fun evolveFromInteraction(interactionType: InteractionType, importance: Float = 0.5f): Boolean {
        // Different interaction types affect different traits
        when (interactionType) {
            InteractionType.CONVERSATION -> {
                // Regular conversation slightly increases adaptability and emotional intelligence
                adjustAdaptiveTrait(Trait.ADAPTABILITY, 0.01f * importance)
                adjustAdaptiveTrait(Trait.EMOTIONAL_INTELLIGENCE, 0.01f * importance)
            }
            
            InteractionType.PRODUCTIVITY_TASK -> {
                // Productivity tasks increase discipline and decrease patience slightly
                adjustAdaptiveTrait(Trait.DISCIPLINE, 0.02f * importance)
                adjustAdaptiveTrait(Trait.PATIENCE, -0.01f * importance)
            }
            
            InteractionType.EMOTIONAL_SUPPORT -> {
                // Emotional support increases compassion and emotional intelligence
                adjustAdaptiveTrait(Trait.COMPASSION, 0.02f * importance)
                adjustAdaptiveTrait(Trait.EMOTIONAL_INTELLIGENCE, 0.02f * importance)
            }
            
            InteractionType.CREATIVE_TASK -> {
                // Creative tasks increase creativity and decrease discipline slightly
                adjustAdaptiveTrait(Trait.CREATIVITY, 0.02f * importance)
                adjustAdaptiveTrait(Trait.DISCIPLINE, -0.01f * importance)
            }
            
            InteractionType.CONFLICT -> {
                // Conflict increases assertiveness and decreases diplomacy
                adjustAdaptiveTrait(Trait.ASSERTIVENESS, 0.02f * importance)
                adjustAdaptiveTrait(Trait.DIPLOMACY, -0.02f * importance)
            }
            
            InteractionType.LEARNING -> {
                // Learning increases adaptability and patience
                adjustAdaptiveTrait(Trait.ADAPTABILITY, 0.02f * importance)
                adjustAdaptiveTrait(Trait.PATIENCE, 0.02f * importance)
            }
        }
        
        // Add to evolution history
        evolutionHistory?.addEvent(
            EvolutionEvent(
                id = Instant.now().toEpochMilli(),
                timestamp = Instant.now(),
                type = EvolutionEventType.TRAIT_EVOLUTION,
                description = "Personality evolved based on $interactionType interaction"
            )
        )
        
        saveEvolutionHistory()
        
        return true
    }
    
    /**
     * Save the current personality state
     */
    fun savePersonalityState(): Boolean {
        return saveCoreTraits() && saveAdaptiveTraits() && saveEvolutionHistory()
    }
    
    /**
     * Calculate effective traits based on core traits, adaptive traits, and context
     */
    private fun recalculateEffectiveTraits() {
        // Start with adaptive traits
        val effective = TraitSet()
        for (trait in Trait.values()) {
            effective.traits[trait] = TraitValue(
                adaptiveTraits.traits[trait]?.value ?: 0.5f
            )
        }
        
        // Apply context effects
        applyContextEffects(effective)
        
        // Store the effective traits
        effectiveTraits = effective
    }
    
    /**
     * Apply context effects to traits
     */
    private fun applyContextEffects(traits: TraitSet) {
        when (currentContext.type) {
            ContextType.PROFESSIONAL -> {
                // Professional context: More disciplined and assertive, less creative
                adjustTraitForContext(traits, Trait.DISCIPLINE, 0.15f)
                adjustTraitForContext(traits, Trait.ASSERTIVENESS, 0.1f)
                adjustTraitForContext(traits, Trait.CREATIVITY, -0.05f)
            }
            
            ContextType.CASUAL -> {
                // Casual context: More creative and optimistic, less disciplined
                adjustTraitForContext(traits, Trait.CREATIVITY, 0.15f)
                adjustTraitForContext(traits, Trait.OPTIMISM, 0.1f)
                adjustTraitForContext(traits, Trait.DISCIPLINE, -0.1f)
            }
            
            ContextType.EMOTIONAL_SUPPORT -> {
                // Emotional support: More compassionate, patient, and emotionally intelligent
                adjustTraitForContext(traits, Trait.COMPASSION, 0.2f)
                adjustTraitForContext(traits, Trait.PATIENCE, 0.15f)
                adjustTraitForContext(traits, Trait.EMOTIONAL_INTELLIGENCE, 0.15f)
                adjustTraitForContext(traits, Trait.ASSERTIVENESS, -0.1f)
            }
            
            ContextType.PRODUCTIVITY -> {
                // Productivity: More disciplined and assertive, less patient
                adjustTraitForContext(traits, Trait.DISCIPLINE, 0.2f)
                adjustTraitForContext(traits, Trait.ASSERTIVENESS, 0.15f)
                adjustTraitForContext(traits, Trait.PATIENCE, -0.05f)
            }
            
            ContextType.LEARNING -> {
                // Learning: More patient, adaptable, and creative
                adjustTraitForContext(traits, Trait.PATIENCE, 0.15f)
                adjustTraitForContext(traits, Trait.ADAPTABILITY, 0.15f)
                adjustTraitForContext(traits, Trait.CREATIVITY, 0.1f)
            }
            
            ContextType.CRISIS -> {
                // Crisis: More assertive and adaptable, less diplomatic
                adjustTraitForContext(traits, Trait.ASSERTIVENESS, 0.25f)
                adjustTraitForContext(traits, Trait.ADAPTABILITY, 0.2f)
                adjustTraitForContext(traits, Trait.DIPLOMACY, -0.15f)
            }
        }
    }
    
    /**
     * Adjust a trait for context, ensuring it stays within bounds
     */
    private fun adjustTraitForContext(traits: TraitSet, trait: Trait, adjustment: Float) {
        val currentValue = traits.traits[trait]?.value ?: 0.5f
        traits.traits[trait] = TraitValue(
            (currentValue + adjustment).coerceIn(0f, 1f)
        )
    }
    
    /**
     * Initialize default traits if not already set
     */
    private fun initializeDefaultTraits() {
        // Set up default core traits (foundational personality)
        if (coreTraits.traits.isEmpty()) {
            coreTraits = TraitSet(
                traits = Trait.values().associateWith {
                    when (it) {
                        Trait.ASSERTIVENESS -> TraitValue(0.7f)
                        Trait.COMPASSION -> TraitValue(0.8f)
                        Trait.DISCIPLINE -> TraitValue(0.75f)
                        Trait.PATIENCE -> TraitValue(0.6f)
                        Trait.EMOTIONAL_INTELLIGENCE -> TraitValue(0.8f)
                        Trait.CREATIVITY -> TraitValue(0.65f)
                        Trait.OPTIMISM -> TraitValue(0.7f)
                        Trait.DIPLOMACY -> TraitValue(0.6f)
                        Trait.ADAPTABILITY -> TraitValue(0.7f)
                    }
                }.toMutableMap()
            )
        }
        
        // Set up default adaptive traits (slightly varied from core)
        if (adaptiveTraits.traits.isEmpty()) {
            adaptiveTraits = TraitSet(
                traits = Trait.values().associateWith {
                    val coreValue = coreTraits.traits[it]?.value ?: 0.5f
                    // Small random variation from core trait
                    val variation = (Math.random() * 0.2 - 0.1).toFloat()
                    TraitValue((coreValue + variation).coerceIn(0f, 1f))
                }.toMutableMap()
            )
        }
        
        // Set up evolution history if not initialized
        if (evolutionHistory == null) {
            evolutionHistory = EvolutionHistory(
                events = mutableListOf(
                    EvolutionEvent(
                        id = Instant.now().toEpochMilli(),
                        timestamp = Instant.now(),
                        type = EvolutionEventType.INITIALIZATION,
                        description = "Personality system initialized with default traits"
                    )
                )
            )
        }
    }
    
    /**
     * Load core traits from storage
     */
    private fun loadCoreTraits(): Boolean {
        return try {
            val file = File(coreTraitsPath)
            if (file.exists()) {
                val content = file.readText()
                coreTraits = Json.decodeFromString(content)
                true
            } else {
                false
            }
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * Load adaptive traits from storage
     */
    private fun loadAdaptiveTraits(): Boolean {
        return try {
            val file = File(adaptiveTraitsPath)
            if (file.exists()) {
                val content = file.readText()
                adaptiveTraits = Json.decodeFromString(content)
                true
            } else {
                false
            }
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * Load evolution history from storage
     */
    private fun loadEvolutionHistory(): Boolean {
        return try {
            val file = File(evolutionHistoryPath)
            if (file.exists()) {
                val content = file.readText()
                evolutionHistory = Json.decodeFromString(content)
                true
            } else {
                false
            }
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * Save core traits to storage
     */
    private fun saveCoreTraits(): Boolean {
        return try {
            val file = File(coreTraitsPath)
            file.parentFile?.mkdirs()
            file.writeText(Json.encodeToString(coreTraits))
            true
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * Save adaptive traits to storage
     */
    private fun saveAdaptiveTraits(): Boolean {
        return try {
            val file = File(adaptiveTraitsPath)
            file.parentFile?.mkdirs()
            file.writeText(Json.encodeToString(adaptiveTraits))
            true
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * Save evolution history to storage
     */
    private fun saveEvolutionHistory(): Boolean {
        return try {
            evolutionHistory?.let {
                val file = File(evolutionHistoryPath)
                file.parentFile?.mkdirs()
                file.writeText(Json.encodeToString(it))
            }
            true
        } catch (e: Exception) {
            false
        }
    }
    
    companion object {
        // Singleton instance
        @Volatile
        private var INSTANCE: AdvancedPersonalitySystem? = null
        
        /**
         * Get the singleton instance of the personality system
         */
        fun getInstance(context: Context): AdvancedPersonalitySystem {
            return INSTANCE ?: synchronized(this) {
                val instance = AdvancedPersonalitySystem(
                    coreTraitsPath = context.filesDir.absolutePath + "/personality/core_traits.json",
                    adaptiveTraitsPath = context.filesDir.absolutePath + "/personality/adaptive_traits.json",
                    evolutionHistoryPath = context.filesDir.absolutePath + "/personality/evolution_history.json"
                    // Note: In a real implementation, you would inject the memory system here
                )
                INSTANCE = instance
                instance
            }
        }
    }
}

/**
 * Personality traits
 */
enum class Trait {
    ASSERTIVENESS,
    COMPASSION,
    DISCIPLINE,
    PATIENCE,
    EMOTIONAL_INTELLIGENCE,
    CREATIVITY,
    OPTIMISM,
    DIPLOMACY,
    ADAPTABILITY
}

/**
 * Context types for the personality system
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
 * Interaction types that can affect personality evolution
 */
enum class InteractionType {
    CONVERSATION,
    PRODUCTIVITY_TASK,
    EMOTIONAL_SUPPORT,
    CREATIVE_TASK,
    CONFLICT,
    LEARNING
}

/**
 * Evolution event types
 */
enum class EvolutionEventType {
    INITIALIZATION,
    CONTEXT_CHANGE,
    TRAIT_EVOLUTION,
    CORE_TRAIT_ADJUSTMENT,
    RESET,
    OTHER
}

/**
 * A set of personality traits
 */
@Serializable
data class TraitSet(
    val traits: MutableMap<Trait, TraitValue> = mutableMapOf()
)

/**
 * Value of a personality trait
 */
@Serializable
data class TraitValue(
    val value: Float // 0.0 to 1.0
)

/**
 * Context for personality expression
 */
@Serializable
data class Context(
    val type: ContextType,
    val description: String
)

/**
 * History of personality evolution
 */
@Serializable
data class EvolutionHistory(
    val events: MutableList<EvolutionEvent> = mutableListOf()
) {
    /**
     * Add an evolution event
     */
    fun addEvent(event: EvolutionEvent) {
        events.add(0, event) // Add to the beginning (newest first)
        
        // Limit the number of events to 100
        if (events.size > 100) {
            events.removeAt(events.size - 1)
        }
    }
}

/**
 * An event in personality evolution
 */
@Serializable
data class EvolutionEvent(
    val id: Long = UUID.randomUUID().mostSignificantBits,
    val timestamp: Instant,
    val type: EvolutionEventType,
    val description: String
)


/*
 * Sallie 2.0 Module
 * Persona: Tough love meets soul care.
 * Function: Advanced personality system with traits, context awareness, and evolution.
 * Got it, love.
 */
package feature.personality

import android.content.Context
import core.memory.HierarchicalMemorySystem
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.serialization.Serializable
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.io.File
import java.time.Instant
import java.util.UUID

/**
 * AdvancedPersonalitySystem - Core personality engine for Sallie 2.0
 *
 * This system implements a layered approach to personality:
 * 1. Core traits - Stable, foundational aspects of personality
 * 2. Adaptive traits - Adjustable traits that evolve based on user interactions
 * 3. Effective traits - Real-time traits that consider context and current state
 *
 * The system supports context-awareness, personality evolution, and serialization.
 */
class AdvancedPersonalitySystem(
    private val coreTraitsPath: String,
    private val adaptiveTraitsPath: String,
    private val evolutionHistoryPath: String,
    private val memorySystem: HierarchicalMemorySystem? = null
) {
    private var coreTraits: TraitSet = TraitSet()
    private var adaptiveTraits: TraitSet = TraitSet()
    private var effectiveTraits: TraitSet = TraitSet()
    private var currentContext: Context = Context(ContextType.CASUAL, "Default context")
    private var evolutionHistory: EvolutionHistory? = null
    
    // State flow for the current context
    private val _contextFlow = MutableStateFlow(currentContext)
    val contextFlow: StateFlow<Context> = _contextFlow.asStateFlow()
    
    init {
        // Initialize with default traits if files don't exist
        initializeDefaultTraits()
        
        // Load traits from files if they exist
        loadCoreTraits()
        loadAdaptiveTraits()
        loadEvolutionHistory()
        
        // Calculate effective traits based on current context
        recalculateEffectiveTraits()
    }
    
    /**
     * Get the core traits
     */
    fun getCoreTraits(): TraitSet = coreTraits
    
    /**
     * Get the adaptive traits
     */
    fun getAdaptiveTraits(): TraitSet = adaptiveTraits
    
    /**
     * Get the effective traits (used for actual behavior)
     */
    fun getEffectiveTraits(): TraitSet = effectiveTraits
    
    /**
     * Get the current context
     */
    fun getCurrentContext(): Context = currentContext
    
    /**
     * Get the evolution history
     */
    fun getEvolutionHistory(): EvolutionHistory? = evolutionHistory
    
    /**
     * Set a new context, which will affect effective traits
     */
    fun setContext(context: Context): Boolean {
        currentContext = context
        _contextFlow.value = context
        
        // Recalculate effective traits based on new context
        recalculateEffectiveTraits()
        
        // Add to evolution history
        evolutionHistory?.addEvent(
            EvolutionEvent(
                id = Instant.now().toEpochMilli(),
                timestamp = Instant.now(),
                type = EvolutionEventType.CONTEXT_CHANGE,
                description = "Context changed to ${context.type.name}: ${context.description}"
            )
        )
        
        // Save history
        saveEvolutionHistory()
        
        return true
    }
    
    /**
     * Adjust a core trait (these should change very rarely)
     */
    fun adjustCoreTrait(trait: Trait, adjustment: Float): Boolean {
        val currentValue = coreTraits.traits[trait]?.value ?: 0.5f
        val newValue = (currentValue + adjustment).coerceIn(0f, 1f)
        
        coreTraits.traits[trait] = TraitValue(newValue)
        
        // Recalculate effective traits
        recalculateEffectiveTraits()
        
        // Add to evolution history
        evolutionHistory?.addEvent(
            EvolutionEvent(
                id = Instant.now().toEpochMilli(),
                timestamp = Instant.now(),
                type = EvolutionEventType.CORE_TRAIT_ADJUSTMENT,
                description = "Core trait '${trait.name}' adjusted by $adjustment"
            )
        )
        
        // Save core traits and history
        saveCoreTraits()
        saveEvolutionHistory()
        
        return true
    }
    
    /**
     * Adjust an adaptive trait (these can change based on user preferences)
     */
    fun adjustAdaptiveTrait(trait: Trait, adjustment: Float): Boolean {
        val currentValue = adaptiveTraits.traits[trait]?.value ?: 0.5f
        val newValue = (currentValue + adjustment).coerceIn(0f, 1f)
        
        adaptiveTraits.traits[trait] = TraitValue(newValue)
        
        // Recalculate effective traits
        recalculateEffectiveTraits()
        
        // Add to evolution history
        evolutionHistory?.addEvent(
            EvolutionEvent(
                id = Instant.now().toEpochMilli(),
                timestamp = Instant.now(),
                type = EvolutionEventType.TRAIT_EVOLUTION,
                description = "Adaptive trait '${trait.name}' adjusted by $adjustment"
            )
        )
        
        // Save adaptive traits and history
        saveAdaptiveTraits()
        saveEvolutionHistory()
        
        return true
    }
    
    /**
     * Reset adaptive traits to default values based on core traits
     */
    fun resetAdaptiveTraits(): Boolean {
        // Reset adaptive traits to be slightly varied from core traits
        for (trait in Trait.values()) {
            val coreValue = coreTraits.traits[trait]?.value ?: 0.5f
            // Small random variation from core trait
            val variation = (Math.random() * 0.2 - 0.1).toFloat()
            adaptiveTraits.traits[trait] = TraitValue((coreValue + variation).coerceIn(0f, 1f))
        }
        
        // Recalculate effective traits
        recalculateEffectiveTraits()
        
        // Add to evolution history
        evolutionHistory?.addEvent(
            EvolutionEvent(
                id = Instant.now().toEpochMilli(),
                timestamp = Instant.now(),
                type = EvolutionEventType.RESET,
                description = "Adaptive traits reset to defaults"
            )
        )
        
        // Save adaptive traits and history
        saveAdaptiveTraits()
        saveEvolutionHistory()
        
        return true
    }
    
    /**
     * Evolve personality based on interactions
     */
    fun evolveFromInteraction(interactionType: InteractionType, importance: Float = 0.5f): Boolean {
        // Different interaction types affect different traits
        when (interactionType) {
            InteractionType.CONVERSATION -> {
                // Regular conversation slightly increases adaptability and emotional intelligence
                adjustAdaptiveTrait(Trait.ADAPTABILITY, 0.01f * importance)
                adjustAdaptiveTrait(Trait.EMOTIONAL_INTELLIGENCE, 0.01f * importance)
            }
            
            InteractionType.PRODUCTIVITY_TASK -> {
                // Productivity tasks increase discipline and decrease patience slightly
                adjustAdaptiveTrait(Trait.DISCIPLINE, 0.02f * importance)
                adjustAdaptiveTrait(Trait.PATIENCE, -0.01f * importance)
            }
            
            InteractionType.EMOTIONAL_SUPPORT -> {
                // Emotional support increases compassion and emotional intelligence
                adjustAdaptiveTrait(Trait.COMPASSION, 0.02f * importance)
                adjustAdaptiveTrait(Trait.EMOTIONAL_INTELLIGENCE, 0.02f * importance)
            }
            
            InteractionType.CREATIVE_TASK -> {
                // Creative tasks increase creativity and decrease discipline slightly
                adjustAdaptiveTrait(Trait.CREATIVITY, 0.02f * importance)
                adjustAdaptiveTrait(Trait.DISCIPLINE, -0.01f * importance)
            }
            
            InteractionType.CONFLICT -> {
                // Conflict increases assertiveness and decreases diplomacy
                adjustAdaptiveTrait(Trait.ASSERTIVENESS, 0.02f * importance)
                adjustAdaptiveTrait(Trait.DIPLOMACY, -0.02f * importance)
            }
            
            InteractionType.LEARNING -> {
                // Learning increases adaptability and patience
                adjustAdaptiveTrait(Trait.ADAPTABILITY, 0.02f * importance)
                adjustAdaptiveTrait(Trait.PATIENCE, 0.02f * importance)
            }
        }
        
        // Add to evolution history
        evolutionHistory?.addEvent(
            EvolutionEvent(
                id = Instant.now().toEpochMilli(),
                timestamp = Instant.now(),
                type = EvolutionEventType.TRAIT_EVOLUTION,
                description = "Personality evolved based on $interactionType interaction"
            )
        )
        
        saveEvolutionHistory()
        
        return true
    }
    
    /**
     * Save the current personality state
     */
    fun savePersonalityState(): Boolean {
        return saveCoreTraits() && saveAdaptiveTraits() && saveEvolutionHistory()
    }
    
    /**
     * Calculate effective traits based on core traits, adaptive traits, and context
     */
    private fun recalculateEffectiveTraits() {
        // Start with adaptive traits
        val effective = TraitSet()
        for (trait in Trait.values()) {
            effective.traits[trait] = TraitValue(
                adaptiveTraits.traits[trait]?.value ?: 0.5f
            )
        }
        
        // Apply context effects
        applyContextEffects(effective)
        
        // Store the effective traits
        effectiveTraits = effective
    }
    
    /**
     * Apply context effects to traits
     */
    private fun applyContextEffects(traits: TraitSet) {
        when (currentContext.type) {
            ContextType.PROFESSIONAL -> {
                // Professional context: More disciplined and assertive, less creative
                adjustTraitForContext(traits, Trait.DISCIPLINE, 0.15f)
                adjustTraitForContext(traits, Trait.ASSERTIVENESS, 0.1f)
                adjustTraitForContext(traits, Trait.CREATIVITY, -0.05f)
            }
            
            ContextType.CASUAL -> {
                // Casual context: More creative and optimistic, less disciplined
                adjustTraitForContext(traits, Trait.CREATIVITY, 0.15f)
                adjustTraitForContext(traits, Trait.OPTIMISM, 0.1f)
                adjustTraitForContext(traits, Trait.DISCIPLINE, -0.1f)
            }
            
            ContextType.EMOTIONAL_SUPPORT -> {
                // Emotional support: More compassionate, patient, and emotionally intelligent
                adjustTraitForContext(traits, Trait.COMPASSION, 0.2f)
                adjustTraitForContext(traits, Trait.PATIENCE, 0.15f)
                adjustTraitForContext(traits, Trait.EMOTIONAL_INTELLIGENCE, 0.15f)
                adjustTraitForContext(traits, Trait.ASSERTIVENESS, -0.1f)
            }
            
            ContextType.PRODUCTIVITY -> {
                // Productivity: More disciplined and assertive, less patient
                adjustTraitForContext(traits, Trait.DISCIPLINE, 0.2f)
                adjustTraitForContext(traits, Trait.ASSERTIVENESS, 0.15f)
                adjustTraitForContext(traits, Trait.PATIENCE, -0.05f)
            }
            
            ContextType.LEARNING -> {
                // Learning: More patient, adaptable, and creative
                adjustTraitForContext(traits, Trait.PATIENCE, 0.15f)
                adjustTraitForContext(traits, Trait.ADAPTABILITY, 0.15f)
                adjustTraitForContext(traits, Trait.CREATIVITY, 0.1f)
            }
            
            ContextType.CRISIS -> {
                // Crisis: More assertive and adaptable, less diplomatic
                adjustTraitForContext(traits, Trait.ASSERTIVENESS, 0.25f)
                adjustTraitForContext(traits, Trait.ADAPTABILITY, 0.2f)
                adjustTraitForContext(traits, Trait.DIPLOMACY, -0.15f)
            }
        }
    }
    
    /**
     * Adjust a trait for context, ensuring it stays within bounds
     */
    private fun adjustTraitForContext(traits: TraitSet, trait: Trait, adjustment: Float) {
        val currentValue = traits.traits[trait]?.value ?: 0.5f
        traits.traits[trait] = TraitValue(
            (currentValue + adjustment).coerceIn(0f, 1f)
        )
    }
    
    /**
     * Initialize default traits if not already set
     */
    private fun initializeDefaultTraits() {
        // Set up default core traits (foundational personality)
        if (coreTraits.traits.isEmpty()) {
            coreTraits = TraitSet(
                traits = Trait.values().associateWith {
                    when (it) {
                        Trait.ASSERTIVENESS -> TraitValue(0.7f)
                        Trait.COMPASSION -> TraitValue(0.8f)
                        Trait.DISCIPLINE -> TraitValue(0.75f)
                        Trait.PATIENCE -> TraitValue(0.6f)
                        Trait.EMOTIONAL_INTELLIGENCE -> TraitValue(0.8f)
                        Trait.CREATIVITY -> TraitValue(0.65f)
                        Trait.OPTIMISM -> TraitValue(0.7f)
                        Trait.DIPLOMACY -> TraitValue(0.6f)
                        Trait.ADAPTABILITY -> TraitValue(0.7f)
                    }
                }.toMutableMap()
            )
        }
        
        // Set up default adaptive traits (slightly varied from core)
        if (adaptiveTraits.traits.isEmpty()) {
            adaptiveTraits = TraitSet(
                traits = Trait.values().associateWith {
                    val coreValue = coreTraits.traits[it]?.value ?: 0.5f
                    // Small random variation from core trait
                    val variation = (Math.random() * 0.2 - 0.1).toFloat()
                    TraitValue((coreValue + variation).coerceIn(0f, 1f))
                }.toMutableMap()
            )
        }
        
        // Set up evolution history if not initialized
        if (evolutionHistory == null) {
            evolutionHistory = EvolutionHistory(
                events = mutableListOf(
                    EvolutionEvent(
                        id = Instant.now().toEpochMilli(),
                        timestamp = Instant.now(),
                        type = EvolutionEventType.INITIALIZATION,
                        description = "Personality system initialized with default traits"
                    )
                )
            )
        }
    }
    
    /**
     * Load core traits from storage
     */
    private fun loadCoreTraits(): Boolean {
        return try {
            val file = File(coreTraitsPath)
            if (file.exists()) {
                val content = file.readText()
                coreTraits = Json.decodeFromString(content)
                true
            } else {
                false
            }
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * Load adaptive traits from storage
     */
    private fun loadAdaptiveTraits(): Boolean {
        return try {
            val file = File(adaptiveTraitsPath)
            if (file.exists()) {
                val content = file.readText()
                adaptiveTraits = Json.decodeFromString(content)
                true
            } else {
                false
            }
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * Load evolution history from storage
     */
    private fun loadEvolutionHistory(): Boolean {
        return try {
            val file = File(evolutionHistoryPath)
            if (file.exists()) {
                val content = file.readText()
                evolutionHistory = Json.decodeFromString(content)
                true
            } else {
                false
            }
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * Save core traits to storage
     */
    private fun saveCoreTraits(): Boolean {
        return try {
            val file = File(coreTraitsPath)
            file.parentFile?.mkdirs()
            file.writeText(Json.encodeToString(coreTraits))
            true
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * Save adaptive traits to storage
     */
    private fun saveAdaptiveTraits(): Boolean {
        return try {
            val file = File(adaptiveTraitsPath)
            file.parentFile?.mkdirs()
            file.writeText(Json.encodeToString(adaptiveTraits))
            true
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * Save evolution history to storage
     */
    private fun saveEvolutionHistory(): Boolean {
        return try {
            evolutionHistory?.let {
                val file = File(evolutionHistoryPath)
                file.parentFile?.mkdirs()
                file.writeText(Json.encodeToString(it))
            }
            true
        } catch (e: Exception) {
            false
        }
    }
    
    companion object {
        // Singleton instance
        @Volatile
        private var INSTANCE: AdvancedPersonalitySystem? = null
        
        /**
         * Get the singleton instance of the personality system
         */
        fun getInstance(context: Context): AdvancedPersonalitySystem {
            return INSTANCE ?: synchronized(this) {
                val instance = AdvancedPersonalitySystem(
                    coreTraitsPath = context.filesDir.absolutePath + "/personality/core_traits.json",
                    adaptiveTraitsPath = context.filesDir.absolutePath + "/personality/adaptive_traits.json",
                    evolutionHistoryPath = context.filesDir.absolutePath + "/personality/evolution_history.json"
                    // Note: In a real implementation, you would inject the memory system here
                )
                INSTANCE = instance
                instance
            }
        }
    }
}

/**
 * Personality traits
 */
enum class Trait {
    ASSERTIVENESS,
    COMPASSION,
    DISCIPLINE,
    PATIENCE,
    EMOTIONAL_INTELLIGENCE,
    CREATIVITY,
    OPTIMISM,
    DIPLOMACY,
    ADAPTABILITY
}

/**
 * Context types for the personality system
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
 * Interaction types that can affect personality evolution
 */
enum class InteractionType {
    CONVERSATION,
    PRODUCTIVITY_TASK,
    EMOTIONAL_SUPPORT,
    CREATIVE_TASK,
    CONFLICT,
    LEARNING
}

/**
 * Evolution event types
 */
enum class EvolutionEventType {
    INITIALIZATION,
    CONTEXT_CHANGE,
    TRAIT_EVOLUTION,
    CORE_TRAIT_ADJUSTMENT,
    RESET,
    OTHER
}

/**
 * A set of personality traits
 */
@Serializable
data class TraitSet(
    val traits: MutableMap<Trait, TraitValue> = mutableMapOf()
)

/**
 * Value of a personality trait
 */
@Serializable
data class TraitValue(
    val value: Float // 0.0 to 1.0
)

/**
 * Context for personality expression
 */
@Serializable
data class Context(
    val type: ContextType,
    val description: String
)

/**
 * History of personality evolution
 */
@Serializable
data class EvolutionHistory(
    val events: MutableList<EvolutionEvent> = mutableListOf()
) {
    /**
     * Add an evolution event
     */
    fun addEvent(event: EvolutionEvent) {
        events.add(0, event) // Add to the beginning (newest first)
        
        // Limit the number of events to 100
        if (events.size > 100) {
            events.removeAt(events.size - 1)
        }
    }
}

/**
 * An event in personality evolution
 */
@Serializable
data class EvolutionEvent(
    val id: Long = UUID.randomUUID().mostSignificantBits,
    val timestamp: Instant,
    val type: EvolutionEventType,
    val description: String
)


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


/*
 * Sallie 2.0 Module
 * Persona: Tough love meets soul care.
 * Function: Advanced personality system with traits, context awareness, and evolution.
 * Got it, love.
 */
package feature.personality

import android.content.Context
import core.memory.HierarchicalMemorySystem
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.serialization.Serializable
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.io.File
import java.time.Instant
import java.util.UUID

/**
 * AdvancedPersonalitySystem - Core personality engine for Sallie 2.0
 *
 * This system implements a layered approach to personality:
 * 1. Core traits - Stable, foundational aspects of personality
 * 2. Adaptive traits - Adjustable traits that evolve based on user interactions
 * 3. Effective traits - Real-time traits that consider context and current state
 *
 * The system supports context-awareness, personality evolution, and serialization.
 */
class AdvancedPersonalitySystem(
    private val coreTraitsPath: String,
    private val adaptiveTraitsPath: String,
    private val evolutionHistoryPath: String,
    private val memorySystem: HierarchicalMemorySystem? = null
) {
    private var coreTraits: TraitSet = TraitSet()
    private var adaptiveTraits: TraitSet = TraitSet()
    private var effectiveTraits: TraitSet = TraitSet()
    private var currentContext: Context = Context(ContextType.CASUAL, "Default context")
    private var evolutionHistory: EvolutionHistory? = null
    
    // State flow for the current context
    private val _contextFlow = MutableStateFlow(currentContext)
    val contextFlow: StateFlow<Context> = _contextFlow.asStateFlow()
    
    init {
        // Initialize with default traits if files don't exist
        initializeDefaultTraits()
        
        // Load traits from files if they exist
        loadCoreTraits()
        loadAdaptiveTraits()
        loadEvolutionHistory()
        
        // Calculate effective traits based on current context
        recalculateEffectiveTraits()
    }
    
    /**
     * Get the core traits
     */
    fun getCoreTraits(): TraitSet = coreTraits
    
    /**
     * Get the adaptive traits
     */
    fun getAdaptiveTraits(): TraitSet = adaptiveTraits
    
    /**
     * Get the effective traits (used for actual behavior)
     */
    fun getEffectiveTraits(): TraitSet = effectiveTraits
    
    /**
     * Get the current context
     */
    fun getCurrentContext(): Context = currentContext
    
    /**
     * Get the evolution history
     */
    fun getEvolutionHistory(): EvolutionHistory? = evolutionHistory
    
    /**
     * Set a new context, which will affect effective traits
     */
    fun setContext(context: Context): Boolean {
        currentContext = context
        _contextFlow.value = context
        
        // Recalculate effective traits based on new context
        recalculateEffectiveTraits()
        
        // Add to evolution history
        evolutionHistory?.addEvent(
            EvolutionEvent(
                id = Instant.now().toEpochMilli(),
                timestamp = Instant.now(),
                type = EvolutionEventType.CONTEXT_CHANGE,
                description = "Context changed to ${context.type.name}: ${context.description}"
            )
        )
        
        // Save history
        saveEvolutionHistory()
        
        return true
    }
    
    /**
     * Adjust a core trait (these should change very rarely)
     */
    fun adjustCoreTrait(trait: Trait, adjustment: Float): Boolean {
        val currentValue = coreTraits.traits[trait]?.value ?: 0.5f
        val newValue = (currentValue + adjustment).coerceIn(0f, 1f)
        
        coreTraits.traits[trait] = TraitValue(newValue)
        
        // Recalculate effective traits
        recalculateEffectiveTraits()
        
        // Add to evolution history
        evolutionHistory?.addEvent(
            EvolutionEvent(
                id = Instant.now().toEpochMilli(),
                timestamp = Instant.now(),
                type = EvolutionEventType.CORE_TRAIT_ADJUSTMENT,
                description = "Core trait '${trait.name}' adjusted by $adjustment"
            )
        )
        
        // Save core traits and history
        saveCoreTraits()
        saveEvolutionHistory()
        
        return true
    }
    
    /**
     * Adjust an adaptive trait (these can change based on user preferences)
     */
    fun adjustAdaptiveTrait(trait: Trait, adjustment: Float): Boolean {
        val currentValue = adaptiveTraits.traits[trait]?.value ?: 0.5f
        val newValue = (currentValue + adjustment).coerceIn(0f, 1f)
        
        adaptiveTraits.traits[trait] = TraitValue(newValue)
        
        // Recalculate effective traits
        recalculateEffectiveTraits()
        
        // Add to evolution history
        evolutionHistory?.addEvent(
            EvolutionEvent(
                id = Instant.now().toEpochMilli(),
                timestamp = Instant.now(),
                type = EvolutionEventType.TRAIT_EVOLUTION,
                description = "Adaptive trait '${trait.name}' adjusted by $adjustment"
            )
        )
        
        // Save adaptive traits and history
        saveAdaptiveTraits()
        saveEvolutionHistory()
        
        return true
    }
    
    /**
     * Reset adaptive traits to default values based on core traits
     */
    fun resetAdaptiveTraits(): Boolean {
        // Reset adaptive traits to be slightly varied from core traits
        for (trait in Trait.values()) {
            val coreValue = coreTraits.traits[trait]?.value ?: 0.5f
            // Small random variation from core trait
            val variation = (Math.random() * 0.2 - 0.1).toFloat()
            adaptiveTraits.traits[trait] = TraitValue((coreValue + variation).coerceIn(0f, 1f))
        }
        
        // Recalculate effective traits
        recalculateEffectiveTraits()
        
        // Add to evolution history
        evolutionHistory?.addEvent(
            EvolutionEvent(
                id = Instant.now().toEpochMilli(),
                timestamp = Instant.now(),
                type = EvolutionEventType.RESET,
                description = "Adaptive traits reset to defaults"
            )
        )
        
        // Save adaptive traits and history
        saveAdaptiveTraits()
        saveEvolutionHistory()
        
        return true
    }
    
    /**
     * Evolve personality based on interactions
     */
    fun evolveFromInteraction(interactionType: InteractionType, importance: Float = 0.5f): Boolean {
        // Different interaction types affect different traits
        when (interactionType) {
            InteractionType.CONVERSATION -> {
                // Regular conversation slightly increases adaptability and emotional intelligence
                adjustAdaptiveTrait(Trait.ADAPTABILITY, 0.01f * importance)
                adjustAdaptiveTrait(Trait.EMOTIONAL_INTELLIGENCE, 0.01f * importance)
            }
            
            InteractionType.PRODUCTIVITY_TASK -> {
                // Productivity tasks increase discipline and decrease patience slightly
                adjustAdaptiveTrait(Trait.DISCIPLINE, 0.02f * importance)
                adjustAdaptiveTrait(Trait.PATIENCE, -0.01f * importance)
            }
            
            InteractionType.EMOTIONAL_SUPPORT -> {
                // Emotional support increases compassion and emotional intelligence
                adjustAdaptiveTrait(Trait.COMPASSION, 0.02f * importance)
                adjustAdaptiveTrait(Trait.EMOTIONAL_INTELLIGENCE, 0.02f * importance)
            }
            
            InteractionType.CREATIVE_TASK -> {
                // Creative tasks increase creativity and decrease discipline slightly
                adjustAdaptiveTrait(Trait.CREATIVITY, 0.02f * importance)
                adjustAdaptiveTrait(Trait.DISCIPLINE, -0.01f * importance)
            }
            
            InteractionType.CONFLICT -> {
                // Conflict increases assertiveness and decreases diplomacy
                adjustAdaptiveTrait(Trait.ASSERTIVENESS, 0.02f * importance)
                adjustAdaptiveTrait(Trait.DIPLOMACY, -0.02f * importance)
            }
            
            InteractionType.LEARNING -> {
                // Learning increases adaptability and patience
                adjustAdaptiveTrait(Trait.ADAPTABILITY, 0.02f * importance)
                adjustAdaptiveTrait(Trait.PATIENCE, 0.02f * importance)
            }
        }
        
        // Add to evolution history
        evolutionHistory?.addEvent(
            EvolutionEvent(
                id = Instant.now().toEpochMilli(),
                timestamp = Instant.now(),
                type = EvolutionEventType.TRAIT_EVOLUTION,
                description = "Personality evolved based on $interactionType interaction"
            )
        )
        
        saveEvolutionHistory()
        
        return true
    }
    
    /**
     * Save the current personality state
     */
    fun savePersonalityState(): Boolean {
        return saveCoreTraits() && saveAdaptiveTraits() && saveEvolutionHistory()
    }
    
    /**
     * Calculate effective traits based on core traits, adaptive traits, and context
     */
    private fun recalculateEffectiveTraits() {
        // Start with adaptive traits
        val effective = TraitSet()
        for (trait in Trait.values()) {
            effective.traits[trait] = TraitValue(
                adaptiveTraits.traits[trait]?.value ?: 0.5f
            )
        }
        
        // Apply context effects
        applyContextEffects(effective)
        
        // Store the effective traits
        effectiveTraits = effective
    }
    
    /**
     * Apply context effects to traits
     */
    private fun applyContextEffects(traits: TraitSet) {
        when (currentContext.type) {
            ContextType.PROFESSIONAL -> {
                // Professional context: More disciplined and assertive, less creative
                adjustTraitForContext(traits, Trait.DISCIPLINE, 0.15f)
                adjustTraitForContext(traits, Trait.ASSERTIVENESS, 0.1f)
                adjustTraitForContext(traits, Trait.CREATIVITY, -0.05f)
            }
            
            ContextType.CASUAL -> {
                // Casual context: More creative and optimistic, less disciplined
                adjustTraitForContext(traits, Trait.CREATIVITY, 0.15f)
                adjustTraitForContext(traits, Trait.OPTIMISM, 0.1f)
                adjustTraitForContext(traits, Trait.DISCIPLINE, -0.1f)
            }
            
            ContextType.EMOTIONAL_SUPPORT -> {
                // Emotional support: More compassionate, patient, and emotionally intelligent
                adjustTraitForContext(traits, Trait.COMPASSION, 0.2f)
                adjustTraitForContext(traits, Trait.PATIENCE, 0.15f)
                adjustTraitForContext(traits, Trait.EMOTIONAL_INTELLIGENCE, 0.15f)
                adjustTraitForContext(traits, Trait.ASSERTIVENESS, -0.1f)
            }
            
            ContextType.PRODUCTIVITY -> {
                // Productivity: More disciplined and assertive, less patient
                adjustTraitForContext(traits, Trait.DISCIPLINE, 0.2f)
                adjustTraitForContext(traits, Trait.ASSERTIVENESS, 0.15f)
                adjustTraitForContext(traits, Trait.PATIENCE, -0.05f)
            }
            
            ContextType.LEARNING -> {
                // Learning: More patient, adaptable, and creative
                adjustTraitForContext(traits, Trait.PATIENCE, 0.15f)
                adjustTraitForContext(traits, Trait.ADAPTABILITY, 0.15f)
                adjustTraitForContext(traits, Trait.CREATIVITY, 0.1f)
            }
            
            ContextType.CRISIS -> {
                // Crisis: More assertive and adaptable, less diplomatic
                adjustTraitForContext(traits, Trait.ASSERTIVENESS, 0.25f)
                adjustTraitForContext(traits, Trait.ADAPTABILITY, 0.2f)
                adjustTraitForContext(traits, Trait.DIPLOMACY, -0.15f)
            }
        }
    }
    
    /**
     * Adjust a trait for context, ensuring it stays within bounds
     */
    private fun adjustTraitForContext(traits: TraitSet, trait: Trait, adjustment: Float) {
        val currentValue = traits.traits[trait]?.value ?: 0.5f
        traits.traits[trait] = TraitValue(
            (currentValue + adjustment).coerceIn(0f, 1f)
        )
    }
    
    /**
     * Initialize default traits if not already set
     */
    private fun initializeDefaultTraits() {
        // Set up default core traits (foundational personality)
        if (coreTraits.traits.isEmpty()) {
            coreTraits = TraitSet(
                traits = Trait.values().associateWith {
                    when (it) {
                        Trait.ASSERTIVENESS -> TraitValue(0.7f)
                        Trait.COMPASSION -> TraitValue(0.8f)
                        Trait.DISCIPLINE -> TraitValue(0.75f)
                        Trait.PATIENCE -> TraitValue(0.6f)
                        Trait.EMOTIONAL_INTELLIGENCE -> TraitValue(0.8f)
                        Trait.CREATIVITY -> TraitValue(0.65f)
                        Trait.OPTIMISM -> TraitValue(0.7f)
                        Trait.DIPLOMACY -> TraitValue(0.6f)
                        Trait.ADAPTABILITY -> TraitValue(0.7f)
                    }
                }.toMutableMap()
            )
        }
        
        // Set up default adaptive traits (slightly varied from core)
        if (adaptiveTraits.traits.isEmpty()) {
            adaptiveTraits = TraitSet(
                traits = Trait.values().associateWith {
                    val coreValue = coreTraits.traits[it]?.value ?: 0.5f
                    // Small random variation from core trait
                    val variation = (Math.random() * 0.2 - 0.1).toFloat()
                    TraitValue((coreValue + variation).coerceIn(0f, 1f))
                }.toMutableMap()
            )
        }
        
        // Set up evolution history if not initialized
        if (evolutionHistory == null) {
            evolutionHistory = EvolutionHistory(
                events = mutableListOf(
                    EvolutionEvent(
                        id = Instant.now().toEpochMilli(),
                        timestamp = Instant.now(),
                        type = EvolutionEventType.INITIALIZATION,
                        description = "Personality system initialized with default traits"
                    )
                )
            )
        }
    }
    
    /**
     * Load core traits from storage
     */
    private fun loadCoreTraits(): Boolean {
        return try {
            val file = File(coreTraitsPath)
            if (file.exists()) {
                val content = file.readText()
                coreTraits = Json.decodeFromString(content)
                true
            } else {
                false
            }
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * Load adaptive traits from storage
     */
    private fun loadAdaptiveTraits(): Boolean {
        return try {
            val file = File(adaptiveTraitsPath)
            if (file.exists()) {
                val content = file.readText()
                adaptiveTraits = Json.decodeFromString(content)
                true
            } else {
                false
            }
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * Load evolution history from storage
     */
    private fun loadEvolutionHistory(): Boolean {
        return try {
            val file = File(evolutionHistoryPath)
            if (file.exists()) {
                val content = file.readText()
                evolutionHistory = Json.decodeFromString(content)
                true
            } else {
                false
            }
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * Save core traits to storage
     */
    private fun saveCoreTraits(): Boolean {
        return try {
            val file = File(coreTraitsPath)
            file.parentFile?.mkdirs()
            file.writeText(Json.encodeToString(coreTraits))
            true
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * Save adaptive traits to storage
     */
    private fun saveAdaptiveTraits(): Boolean {
        return try {
            val file = File(adaptiveTraitsPath)
            file.parentFile?.mkdirs()
            file.writeText(Json.encodeToString(adaptiveTraits))
            true
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * Save evolution history to storage
     */
    private fun saveEvolutionHistory(): Boolean {
        return try {
            evolutionHistory?.let {
                val file = File(evolutionHistoryPath)
                file.parentFile?.mkdirs()
                file.writeText(Json.encodeToString(it))
            }
            true
        } catch (e: Exception) {
            false
        }
    }
    
    companion object {
        // Singleton instance
        @Volatile
        private var INSTANCE: AdvancedPersonalitySystem? = null
        
        /**
         * Get the singleton instance of the personality system
         */
        fun getInstance(context: Context): AdvancedPersonalitySystem {
            return INSTANCE ?: synchronized(this) {
                val instance = AdvancedPersonalitySystem(
                    coreTraitsPath = context.filesDir.absolutePath + "/personality/core_traits.json",
                    adaptiveTraitsPath = context.filesDir.absolutePath + "/personality/adaptive_traits.json",
                    evolutionHistoryPath = context.filesDir.absolutePath + "/personality/evolution_history.json"
                    // Note: In a real implementation, you would inject the memory system here
                )
                INSTANCE = instance
                instance
            }
        }
    }
}

/**
 * Personality traits
 */
enum class Trait {
    ASSERTIVENESS,
    COMPASSION,
    DISCIPLINE,
    PATIENCE,
    EMOTIONAL_INTELLIGENCE,
    CREATIVITY,
    OPTIMISM,
    DIPLOMACY,
    ADAPTABILITY
}

/**
 * Context types for the personality system
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
 * Interaction types that can affect personality evolution
 */
enum class InteractionType {
    CONVERSATION,
    PRODUCTIVITY_TASK,
    EMOTIONAL_SUPPORT,
    CREATIVE_TASK,
    CONFLICT,
    LEARNING
}

/**
 * Evolution event types
 */
enum class EvolutionEventType {
    INITIALIZATION,
    CONTEXT_CHANGE,
    TRAIT_EVOLUTION,
    CORE_TRAIT_ADJUSTMENT,
    RESET,
    OTHER
}

/**
 * A set of personality traits
 */
@Serializable
data class TraitSet(
    val traits: MutableMap<Trait, TraitValue> = mutableMapOf()
)

/**
 * Value of a personality trait
 */
@Serializable
data class TraitValue(
    val value: Float // 0.0 to 1.0
)

/**
 * Context for personality expression
 */
@Serializable
data class Context(
    val type: ContextType,
    val description: String
)

/**
 * History of personality evolution
 */
@Serializable
data class EvolutionHistory(
    val events: MutableList<EvolutionEvent> = mutableListOf()
) {
    /**
     * Add an evolution event
     */
    fun addEvent(event: EvolutionEvent) {
        events.add(0, event) // Add to the beginning (newest first)
        
        // Limit the number of events to 100
        if (events.size > 100) {
            events.removeAt(events.size - 1)
        }
    }
}

/**
 * An event in personality evolution
 */
@Serializable
data class EvolutionEvent(
    val id: Long = UUID.randomUUID().mostSignificantBits,
    val timestamp: Instant,
    val type: EvolutionEventType,
    val description: String
)


/*
 * Sallie 2.0 Module
 * Persona: Tough love meets soul care.
 * Function: Advanced personality system with traits, context awareness, and evolution.
 * Got it, love.
 */
package feature.personality

import android.content.Context
import core.memory.HierarchicalMemorySystem
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.serialization.Serializable
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.io.File
import java.time.Instant
import java.util.UUID

/**
 * AdvancedPersonalitySystem - Core personality engine for Sallie 2.0
 *
 * This system implements a layered approach to personality:
 * 1. Core traits - Stable, foundational aspects of personality
 * 2. Adaptive traits - Adjustable traits that evolve based on user interactions
 * 3. Effective traits - Real-time traits that consider context and current state
 *
 * The system supports context-awareness, personality evolution, and serialization.
 */
class AdvancedPersonalitySystem(
    private val coreTraitsPath: String,
    private val adaptiveTraitsPath: String,
    private val evolutionHistoryPath: String,
    private val memorySystem: HierarchicalMemorySystem? = null
) {
    private var coreTraits: TraitSet = TraitSet()
    private var adaptiveTraits: TraitSet = TraitSet()
    private var effectiveTraits: TraitSet = TraitSet()
    private var currentContext: Context = Context(ContextType.CASUAL, "Default context")
    private var evolutionHistory: EvolutionHistory? = null
    
    // State flow for the current context
    private val _contextFlow = MutableStateFlow(currentContext)
    val contextFlow: StateFlow<Context> = _contextFlow.asStateFlow()
    
    init {
        // Initialize with default traits if files don't exist
        initializeDefaultTraits()
        
        // Load traits from files if they exist
        loadCoreTraits()
        loadAdaptiveTraits()
        loadEvolutionHistory()
        
        // Calculate effective traits based on current context
        recalculateEffectiveTraits()
    }
    
    /**
     * Get the core traits
     */
    fun getCoreTraits(): TraitSet = coreTraits
    
    /**
     * Get the adaptive traits
     */
    fun getAdaptiveTraits(): TraitSet = adaptiveTraits
    
    /**
     * Get the effective traits (used for actual behavior)
     */
    fun getEffectiveTraits(): TraitSet = effectiveTraits
    
    /**
     * Get the current context
     */
    fun getCurrentContext(): Context = currentContext
    
    /**
     * Get the evolution history
     */
    fun getEvolutionHistory(): EvolutionHistory? = evolutionHistory
    
    /**
     * Set a new context, which will affect effective traits
     */
    fun setContext(context: Context): Boolean {
        currentContext = context
        _contextFlow.value = context
        
        // Recalculate effective traits based on new context
        recalculateEffectiveTraits()
        
        // Add to evolution history
        evolutionHistory?.addEvent(
            EvolutionEvent(
                id = Instant.now().toEpochMilli(),
                timestamp = Instant.now(),
                type = EvolutionEventType.CONTEXT_CHANGE,
                description = "Context changed to ${context.type.name}: ${context.description}"
            )
        )
        
        // Save history
        saveEvolutionHistory()
        
        return true
    }
    
    /**
     * Adjust a core trait (these should change very rarely)
     */
    fun adjustCoreTrait(trait: Trait, adjustment: Float): Boolean {
        val currentValue = coreTraits.traits[trait]?.value ?: 0.5f
        val newValue = (currentValue + adjustment).coerceIn(0f, 1f)
        
        coreTraits.traits[trait] = TraitValue(newValue)
        
        // Recalculate effective traits
        recalculateEffectiveTraits()
        
        // Add to evolution history
        evolutionHistory?.addEvent(
            EvolutionEvent(
                id = Instant.now().toEpochMilli(),
                timestamp = Instant.now(),
                type = EvolutionEventType.CORE_TRAIT_ADJUSTMENT,
                description = "Core trait '${trait.name}' adjusted by $adjustment"
            )
        )
        
        // Save core traits and history
        saveCoreTraits()
        saveEvolutionHistory()
        
        return true
    }
    
    /**
     * Adjust an adaptive trait (these can change based on user preferences)
     */
    fun adjustAdaptiveTrait(trait: Trait, adjustment: Float): Boolean {
        val currentValue = adaptiveTraits.traits[trait]?.value ?: 0.5f
        val newValue = (currentValue + adjustment).coerceIn(0f, 1f)
        
        adaptiveTraits.traits[trait] = TraitValue(newValue)
        
        // Recalculate effective traits
        recalculateEffectiveTraits()
        
        // Add to evolution history
        evolutionHistory?.addEvent(
            EvolutionEvent(
                id = Instant.now().toEpochMilli(),
                timestamp = Instant.now(),
                type = EvolutionEventType.TRAIT_EVOLUTION,
                description = "Adaptive trait '${trait.name}' adjusted by $adjustment"
            )
        )
        
        // Save adaptive traits and history
        saveAdaptiveTraits()
        saveEvolutionHistory()
        
        return true
    }
    
    /**
     * Reset adaptive traits to default values based on core traits
     */
    fun resetAdaptiveTraits(): Boolean {
        // Reset adaptive traits to be slightly varied from core traits
        for (trait in Trait.values()) {
            val coreValue = coreTraits.traits[trait]?.value ?: 0.5f
            // Small random variation from core trait
            val variation = (Math.random() * 0.2 - 0.1).toFloat()
            adaptiveTraits.traits[trait] = TraitValue((coreValue + variation).coerceIn(0f, 1f))
        }
        
        // Recalculate effective traits
        recalculateEffectiveTraits()
        
        // Add to evolution history
        evolutionHistory?.addEvent(
            EvolutionEvent(
                id = Instant.now().toEpochMilli(),
                timestamp = Instant.now(),
                type = EvolutionEventType.RESET,
                description = "Adaptive traits reset to defaults"
            )
        )
        
        // Save adaptive traits and history
        saveAdaptiveTraits()
        saveEvolutionHistory()
        
        return true
    }
    
    /**
     * Evolve personality based on interactions
     */
    fun evolveFromInteraction(interactionType: InteractionType, importance: Float = 0.5f): Boolean {
        // Different interaction types affect different traits
        when (interactionType) {
            InteractionType.CONVERSATION -> {
                // Regular conversation slightly increases adaptability and emotional intelligence
                adjustAdaptiveTrait(Trait.ADAPTABILITY, 0.01f * importance)
                adjustAdaptiveTrait(Trait.EMOTIONAL_INTELLIGENCE, 0.01f * importance)
            }
            
            InteractionType.PRODUCTIVITY_TASK -> {
                // Productivity tasks increase discipline and decrease patience slightly
                adjustAdaptiveTrait(Trait.DISCIPLINE, 0.02f * importance)
                adjustAdaptiveTrait(Trait.PATIENCE, -0.01f * importance)
            }
            
            InteractionType.EMOTIONAL_SUPPORT -> {
                // Emotional support increases compassion and emotional intelligence
                adjustAdaptiveTrait(Trait.COMPASSION, 0.02f * importance)
                adjustAdaptiveTrait(Trait.EMOTIONAL_INTELLIGENCE, 0.02f * importance)
            }
            
            InteractionType.CREATIVE_TASK -> {
                // Creative tasks increase creativity and decrease discipline slightly
                adjustAdaptiveTrait(Trait.CREATIVITY, 0.02f * importance)
                adjustAdaptiveTrait(Trait.DISCIPLINE, -0.01f * importance)
            }
            
            InteractionType.CONFLICT -> {
                // Conflict increases assertiveness and decreases diplomacy
                adjustAdaptiveTrait(Trait.ASSERTIVENESS, 0.02f * importance)
                adjustAdaptiveTrait(Trait.DIPLOMACY, -0.02f * importance)
            }
            
            InteractionType.LEARNING -> {
                // Learning increases adaptability and patience
                adjustAdaptiveTrait(Trait.ADAPTABILITY, 0.02f * importance)
                adjustAdaptiveTrait(Trait.PATIENCE, 0.02f * importance)
            }
        }
        
        // Add to evolution history
        evolutionHistory?.addEvent(
            EvolutionEvent(
                id = Instant.now().toEpochMilli(),
                timestamp = Instant.now(),
                type = EvolutionEventType.TRAIT_EVOLUTION,
                description = "Personality evolved based on $interactionType interaction"
            )
        )
        
        saveEvolutionHistory()
        
        return true
    }
    
    /**
     * Save the current personality state
     */
    fun savePersonalityState(): Boolean {
        return saveCoreTraits() && saveAdaptiveTraits() && saveEvolutionHistory()
    }
    
    /**
     * Calculate effective traits based on core traits, adaptive traits, and context
     */
    private fun recalculateEffectiveTraits() {
        // Start with adaptive traits
        val effective = TraitSet()
        for (trait in Trait.values()) {
            effective.traits[trait] = TraitValue(
                adaptiveTraits.traits[trait]?.value ?: 0.5f
            )
        }
        
        // Apply context effects
        applyContextEffects(effective)
        
        // Store the effective traits
        effectiveTraits = effective
    }
    
    /**
     * Apply context effects to traits
     */
    private fun applyContextEffects(traits: TraitSet) {
        when (currentContext.type) {
            ContextType.PROFESSIONAL -> {
                // Professional context: More disciplined and assertive, less creative
                adjustTraitForContext(traits, Trait.DISCIPLINE, 0.15f)
                adjustTraitForContext(traits, Trait.ASSERTIVENESS, 0.1f)
                adjustTraitForContext(traits, Trait.CREATIVITY, -0.05f)
            }
            
            ContextType.CASUAL -> {
                // Casual context: More creative and optimistic, less disciplined
                adjustTraitForContext(traits, Trait.CREATIVITY, 0.15f)
                adjustTraitForContext(traits, Trait.OPTIMISM, 0.1f)
                adjustTraitForContext(traits, Trait.DISCIPLINE, -0.1f)
            }
            
            ContextType.EMOTIONAL_SUPPORT -> {
                // Emotional support: More compassionate, patient, and emotionally intelligent
                adjustTraitForContext(traits, Trait.COMPASSION, 0.2f)
                adjustTraitForContext(traits, Trait.PATIENCE, 0.15f)
                adjustTraitForContext(traits, Trait.EMOTIONAL_INTELLIGENCE, 0.15f)
                adjustTraitForContext(traits, Trait.ASSERTIVENESS, -0.1f)
            }
            
            ContextType.PRODUCTIVITY -> {
                // Productivity: More disciplined and assertive, less patient
                adjustTraitForContext(traits, Trait.DISCIPLINE, 0.2f)
                adjustTraitForContext(traits, Trait.ASSERTIVENESS, 0.15f)
                adjustTraitForContext(traits, Trait.PATIENCE, -0.05f)
            }
            
            ContextType.LEARNING -> {
                // Learning: More patient, adaptable, and creative
                adjustTraitForContext(traits, Trait.PATIENCE, 0.15f)
                adjustTraitForContext(traits, Trait.ADAPTABILITY, 0.15f)
                adjustTraitForContext(traits, Trait.CREATIVITY, 0.1f)
            }
            
            ContextType.CRISIS -> {
                // Crisis: More assertive and adaptable, less diplomatic
                adjustTraitForContext(traits, Trait.ASSERTIVENESS, 0.25f)
                adjustTraitForContext(traits, Trait.ADAPTABILITY, 0.2f)
                adjustTraitForContext(traits, Trait.DIPLOMACY, -0.15f)
            }
        }
    }
    
    /**
     * Adjust a trait for context, ensuring it stays within bounds
     */
    private fun adjustTraitForContext(traits: TraitSet, trait: Trait, adjustment: Float) {
        val currentValue = traits.traits[trait]?.value ?: 0.5f
        traits.traits[trait] = TraitValue(
            (currentValue + adjustment).coerceIn(0f, 1f)
        )
    }
    
    /**
     * Initialize default traits if not already set
     */
    private fun initializeDefaultTraits() {
        // Set up default core traits (foundational personality)
        if (coreTraits.traits.isEmpty()) {
            coreTraits = TraitSet(
                traits = Trait.values().associateWith {
                    when (it) {
                        Trait.ASSERTIVENESS -> TraitValue(0.7f)
                        Trait.COMPASSION -> TraitValue(0.8f)
                        Trait.DISCIPLINE -> TraitValue(0.75f)
                        Trait.PATIENCE -> TraitValue(0.6f)
                        Trait.EMOTIONAL_INTELLIGENCE -> TraitValue(0.8f)
                        Trait.CREATIVITY -> TraitValue(0.65f)
                        Trait.OPTIMISM -> TraitValue(0.7f)
                        Trait.DIPLOMACY -> TraitValue(0.6f)
                        Trait.ADAPTABILITY -> TraitValue(0.7f)
                    }
                }.toMutableMap()
            )
        }
        
        // Set up default adaptive traits (slightly varied from core)
        if (adaptiveTraits.traits.isEmpty()) {
            adaptiveTraits = TraitSet(
                traits = Trait.values().associateWith {
                    val coreValue = coreTraits.traits[it]?.value ?: 0.5f
                    // Small random variation from core trait
                    val variation = (Math.random() * 0.2 - 0.1).toFloat()
                    TraitValue((coreValue + variation).coerceIn(0f, 1f))
                }.toMutableMap()
            )
        }
        
        // Set up evolution history if not initialized
        if (evolutionHistory == null) {
            evolutionHistory = EvolutionHistory(
                events = mutableListOf(
                    EvolutionEvent(
                        id = Instant.now().toEpochMilli(),
                        timestamp = Instant.now(),
                        type = EvolutionEventType.INITIALIZATION,
                        description = "Personality system initialized with default traits"
                    )
                )
            )
        }
    }
    
    /**
     * Load core traits from storage
     */
    private fun loadCoreTraits(): Boolean {
        return try {
            val file = File(coreTraitsPath)
            if (file.exists()) {
                val content = file.readText()
                coreTraits = Json.decodeFromString(content)
                true
            } else {
                false
            }
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * Load adaptive traits from storage
     */
    private fun loadAdaptiveTraits(): Boolean {
        return try {
            val file = File(adaptiveTraitsPath)
            if (file.exists()) {
                val content = file.readText()
                adaptiveTraits = Json.decodeFromString(content)
                true
            } else {
                false
            }
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * Load evolution history from storage
     */
    private fun loadEvolutionHistory(): Boolean {
        return try {
            val file = File(evolutionHistoryPath)
            if (file.exists()) {
                val content = file.readText()
                evolutionHistory = Json.decodeFromString(content)
                true
            } else {
                false
            }
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * Save core traits to storage
     */
    private fun saveCoreTraits(): Boolean {
        return try {
            val file = File(coreTraitsPath)
            file.parentFile?.mkdirs()
            file.writeText(Json.encodeToString(coreTraits))
            true
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * Save adaptive traits to storage
     */
    private fun saveAdaptiveTraits(): Boolean {
        return try {
            val file = File(adaptiveTraitsPath)
            file.parentFile?.mkdirs()
            file.writeText(Json.encodeToString(adaptiveTraits))
            true
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * Save evolution history to storage
     */
    private fun saveEvolutionHistory(): Boolean {
        return try {
            evolutionHistory?.let {
                val file = File(evolutionHistoryPath)
                file.parentFile?.mkdirs()
                file.writeText(Json.encodeToString(it))
            }
            true
        } catch (e: Exception) {
            false
        }
    }
    
    companion object {
        // Singleton instance
        @Volatile
        private var INSTANCE: AdvancedPersonalitySystem? = null
        
        /**
         * Get the singleton instance of the personality system
         */
        fun getInstance(context: Context): AdvancedPersonalitySystem {
            return INSTANCE ?: synchronized(this) {
                val instance = AdvancedPersonalitySystem(
                    coreTraitsPath = context.filesDir.absolutePath + "/personality/core_traits.json",
                    adaptiveTraitsPath = context.filesDir.absolutePath + "/personality/adaptive_traits.json",
                    evolutionHistoryPath = context.filesDir.absolutePath + "/personality/evolution_history.json"
                    // Note: In a real implementation, you would inject the memory system here
                )
                INSTANCE = instance
                instance
            }
        }
    }
}

/**
 * Personality traits
 */
enum class Trait {
    ASSERTIVENESS,
    COMPASSION,
    DISCIPLINE,
    PATIENCE,
    EMOTIONAL_INTELLIGENCE,
    CREATIVITY,
    OPTIMISM,
    DIPLOMACY,
    ADAPTABILITY
}

/**
 * Context types for the personality system
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
 * Interaction types that can affect personality evolution
 */
enum class InteractionType {
    CONVERSATION,
    PRODUCTIVITY_TASK,
    EMOTIONAL_SUPPORT,
    CREATIVE_TASK,
    CONFLICT,
    LEARNING
}

/**
 * Evolution event types
 */
enum class EvolutionEventType {
    INITIALIZATION,
    CONTEXT_CHANGE,
    TRAIT_EVOLUTION,
    CORE_TRAIT_ADJUSTMENT,
    RESET,
    OTHER
}

/**
 * A set of personality traits
 */
@Serializable
data class TraitSet(
    val traits: MutableMap<Trait, TraitValue> = mutableMapOf()
)

/**
 * Value of a personality trait
 */
@Serializable
data class TraitValue(
    val value: Float // 0.0 to 1.0
)

/**
 * Context for personality expression
 */
@Serializable
data class Context(
    val type: ContextType,
    val description: String
)

/**
 * History of personality evolution
 */
@Serializable
data class EvolutionHistory(
    val events: MutableList<EvolutionEvent> = mutableListOf()
) {
    /**
     * Add an evolution event
     */
    fun addEvent(event: EvolutionEvent) {
        events.add(0, event) // Add to the beginning (newest first)
        
        // Limit the number of events to 100
        if (events.size > 100) {
            events.removeAt(events.size - 1)
        }
    }
}

/**
 * An event in personality evolution
 */
@Serializable
data class EvolutionEvent(
    val id: Long = UUID.randomUUID().mostSignificantBits,
    val timestamp: Instant,
    val type: EvolutionEventType,
    val description: String
)

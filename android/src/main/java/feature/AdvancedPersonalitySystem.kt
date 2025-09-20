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

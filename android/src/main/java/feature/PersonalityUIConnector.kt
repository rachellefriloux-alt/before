/*
 * Sallie 2.0 Module
 * Persona: Tough love meets soul care.
 * Function: Integration of the advanced personality system with the UI.
 * Got it, love.
 */
package feature.personality

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.time.Instant

/**
 * PersonalityUIConnector - Connects the Advanced Personality System to UI components
 * 
 * This connector provides UI-friendly data structures and methods for interaction
 * with the personality system from UI components, particularly the PersonalityPanel.
 */
class PersonalityUIConnector(
    private val personalitySystem: AdvancedPersonalitySystem
) {
    // State flows for UI components to observe
    private val _personalityState = MutableStateFlow<PersonalityUIState>(PersonalityUIState.Loading)
    val personalityState: StateFlow<PersonalityUIState> = _personalityState.asStateFlow()
    
    // Track evolution events for the UI timeline
    private val _evolutionEvents = MutableStateFlow<List<PersonalityEvolutionEvent>>(emptyList())
    val evolutionEvents: StateFlow<List<PersonalityEvolutionEvent>> = _evolutionEvents.asStateFlow()
    
    init {
        // Initial data load
        refreshPersonalityState()
    }
    
    /**
     * Refreshes the personality state from the system for UI display
     */
    fun refreshPersonalityState() {
        try {
            val core = personalitySystem.getCoreTraits()
            val adaptive = personalitySystem.getAdaptiveTraits()
            val effective = personalitySystem.getEffectiveTraits()
            val context = personalitySystem.getCurrentContext()
            
            _personalityState.value = PersonalityUIState.Loaded(
                coreTraits = core.traits.mapValues { it.value.value },
                adaptiveTraits = adaptive.traits.mapValues { it.value.value },
                effectiveTraits = effective.traits.mapValues { it.value.value },
                currentContext = PersonalityContext(
                    type = context.type.name,
                    description = context.description
                )
            )
            
            // Update evolution events if available
            personalitySystem.getEvolutionHistory()?.let { history ->
                _evolutionEvents.value = history.events.map { event ->
                    PersonalityEvolutionEvent(
                        id = event.id.toString(),
                        timestamp = event.timestamp.toEpochMilli(),
                        type = event.type.name,
                        description = event.description
                    )
                }
            }
        } catch (e: Exception) {
            _personalityState.value = PersonalityUIState.Error("Failed to load personality: ${e.message}")
        }
    }
    
    /**
     * Adjusts an adaptive trait by a specified amount
     */
    fun adjustTrait(traitName: String, adjustment: Float): Boolean {
        return try {
            val trait = Trait.valueOf(traitName)
            personalitySystem.adjustAdaptiveTrait(trait, adjustment)
            
            // Add evolution event
            val direction = if (adjustment > 0) "increased" else "decreased"
            addEvolutionEvent(
                PersonalityEvolutionEvent(
                    id = "manual-${Instant.now().toEpochMilli()}",
                    timestamp = Instant.now().toEpochMilli(),
                    type = "TRAIT_EVOLUTION",
                    description = "Trait $traitName manually $direction by ${Math.abs(adjustment)}"
                )
            )
            
            // Refresh state for UI
            refreshPersonalityState()
            true
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * Sets the current context for the personality system
     */
    fun setContext(contextType: String, description: String): Boolean {
        return try {
            val type = ContextType.valueOf(contextType)
            personalitySystem.setContext(PersonalityContext(type, description))
            
            // Add evolution event
            addEvolutionEvent(
                PersonalityEvolutionEvent(
                    id = "context-${Instant.now().toEpochMilli()}",
                    timestamp = Instant.now().toEpochMilli(),
                    type = "CONTEXT_CHANGE",
                    description = "Context changed to ${formatContextType(contextType)}: $description"
                )
            )
            
            // Refresh state for UI
            refreshPersonalityState()
            true
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * Resets adaptive traits to their default values
     */
    fun resetAdaptiveTraits(): Boolean {
        return try {
            personalitySystem.resetAdaptiveTraits()
            
            // Add evolution event
            addEvolutionEvent(
                PersonalityEvolutionEvent(
                    id = "reset-${Instant.now().toEpochMilli()}",
                    timestamp = Instant.now().toEpochMilli(),
                    type = "RESET",
                    description = "Adaptive traits reset to defaults"
                )
            )
            
            // Refresh state for UI
            refreshPersonalityState()
            true
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * Saves the current personality state
     */
    fun savePersonalityState(): Boolean {
        return try {
            personalitySystem.savePersonalityState()
            
            // Add evolution event
            addEvolutionEvent(
                PersonalityEvolutionEvent(
                    id = "save-${Instant.now().toEpochMilli()}",
                    timestamp = Instant.now().toEpochMilli(),
                    type = "TRAIT_EVOLUTION",
                    description = "Personality state saved"
                )
            )
            
            true
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * Gets personality aspects (higher-level traits derived from core/adaptive traits)
     */
    fun getPersonalityAspects(): List<PersonalityAspect> {
        val effective = personalitySystem.getEffectiveTraits()
        val traits = effective.traits
        
        return listOf(
            PersonalityAspect(
                name = "DIRECTNESS",
                value = calculateAspectValue(
                    "DIRECTNESS",
                    traits,
                    mapOf(
                        Trait.ASSERTIVENESS to 0.7f,
                        Trait.DIPLOMACY to -0.3f
                    )
                ),
                context = "general"
            ),
            PersonalityAspect(
                name = "EMPATHY",
                value = calculateAspectValue(
                    "EMPATHY",
                    traits,
                    mapOf(
                        Trait.COMPASSION to 0.6f,
                        Trait.EMOTIONAL_INTELLIGENCE to 0.4f
                    )
                ),
                context = "general"
            ),
            PersonalityAspect(
                name = "CHALLENGE",
                value = calculateAspectValue(
                    "CHALLENGE",
                    traits,
                    mapOf(
                        Trait.ASSERTIVENESS to 0.5f,
                        Trait.DISCIPLINE to 0.5f
                    )
                ),
                context = "general"
            ),
            PersonalityAspect(
                name = "PLAYFULNESS",
                value = calculateAspectValue(
                    "PLAYFULNESS",
                    traits,
                    mapOf(
                        Trait.CREATIVITY to 0.5f,
                        Trait.OPTIMISM to 0.5f
                    )
                ),
                context = "general"
            ),
            PersonalityAspect(
                name = "ANALYTICAL",
                value = calculateAspectValue(
                    "ANALYTICAL",
                    traits,
                    mapOf(
                        Trait.DISCIPLINE to 0.4f,
                        Trait.ADAPTABILITY to 0.3f,
                        Trait.PATIENCE to 0.3f
                    )
                ),
                context = "general"
            ),
            PersonalityAspect(
                name = "SUPPORTIVENESS",
                value = calculateAspectValue(
                    "SUPPORTIVENESS",
                    traits,
                    mapOf(
                        Trait.COMPASSION to 0.4f,
                        Trait.PATIENCE to 0.3f,
                        Trait.OPTIMISM to 0.3f
                    )
                ),
                context = "general"
            )
        )
    }
    
    /**
     * Calculates an aspect value from the effective traits
     */
    private fun calculateAspectValue(
        aspect: String,
        traits: Map<Trait, TraitValue>,
        weights: Map<Trait, Float>
    ): Float {
        var total = 0f
        var weightSum = 0f
        
        weights.forEach { (trait, weight) ->
            val actualWeight = if (weight < 0) -weight else weight
            weightSum += actualWeight
            val traitValue = traits[trait]?.value ?: 0.5f
            total += if (weight >= 0) {
                traitValue * weight
            } else {
                (1 - traitValue) * actualWeight
            }
        }
        
        return if (weightSum > 0) total / weightSum else 0.5f
    }
    
    /**
     * Adds an evolution event to the timeline
     */
    private fun addEvolutionEvent(event: PersonalityEvolutionEvent) {
        val current = _evolutionEvents.value.toMutableList()
        current.add(0, event) // Add to beginning (newest first)
        _evolutionEvents.value = current
        
        // Also add to the system history if available
        personalitySystem.getEvolutionHistory()?.addEvent(
            EvolutionEvent(
                id = event.id.toLongOrNull() ?: Instant.now().toEpochMilli(),
                timestamp = Instant.ofEpochMilli(event.timestamp),
                type = try { EvolutionEventType.valueOf(event.type) } catch (e: Exception) { EvolutionEventType.OTHER },
                description = event.description
            )
        )
    }
    
    /**
     * Format a context type for display
     */
    private fun formatContextType(type: String): String {
        return type.replace("_", " ").lowercase()
            .split(" ")
            .joinToString(" ") { it.replaceFirstChar { c -> c.uppercase() } }
    }
    
    /**
     * Export the personality state as JSON for the UI
     */
    fun exportPersonalityStateAsJson(): String {
        val state = personalityState.value
        
        return when (state) {
            is PersonalityUIState.Loaded -> {
                val map = mapOf(
                    "coreTraits" to state.coreTraits,
                    "adaptiveTraits" to state.adaptiveTraits,
                    "effectiveTraits" to state.effectiveTraits,
                    "currentContext" to state.currentContext,
                    "evolutionEvents" to evolutionEvents.value
                )
                
                Json.encodeToString(map)
            }
            else -> "{}"
        }
    }
}

/**
 * UI-friendly representation of personality state
 */
sealed class PersonalityUIState {
    object Loading : PersonalityUIState()
    
    data class Loaded(
        val coreTraits: Map<Trait, Float>,
        val adaptiveTraits: Map<Trait, Float>,
        val effectiveTraits: Map<Trait, Float>,
        val currentContext: PersonalityContext
    ) : PersonalityUIState()
    
    data class Error(val message: String) : PersonalityUIState()
}

/**
 * UI-friendly representation of a personality aspect
 * (higher-level traits derived from core/adaptive traits)
 */
@Serializable
data class PersonalityAspect(
    val name: String,
    val value: Float,
    var context: String
)

/**
 * UI-friendly representation of a personality evolution event
 */
@Serializable
data class PersonalityEvolutionEvent(
    val id: String,
    val timestamp: Long,
    val type: String,
    val description: String
)

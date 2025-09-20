/*
 * Sallie 2.0 Module
 * Persona: Tough love meets soul care.
 * Function: Bridge between UI components and the Kotlin personality system.
 * Got it, love.
 */
package feature.personality

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.launch
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

/**
 * PersonalityBridge - Provides JavaScript-friendly interface for the Personality System
 * 
 * This class serves as the bridge between the Kotlin personality system and the 
 * JavaScript/Vue front-end components. It exposes methods that can be called
 * from JavaScript and handles conversion between Kotlin and JS data structures.
 */
class PersonalityBridge(
    private val connector: PersonalityUIConnector
) {
    private val scope = CoroutineScope(Dispatchers.Main)
    
    // JS-friendly state flows
    private val _jsPersonalityState = MutableStateFlow<String>("{}")
    val jsPersonalityState: StateFlow<String> = _jsPersonalityState.asStateFlow()
    
    private val _jsEvolutionEvents = MutableStateFlow<String>("[]")
    val jsEvolutionEvents: StateFlow<String> = _jsEvolutionEvents.asStateFlow()
    
    private val _jsPersonalityAspects = MutableStateFlow<String>("[]")
    val jsPersonalityAspects: StateFlow<String> = _jsPersonalityAspects.asStateFlow()
    
    init {
        // Subscribe to connector state changes and update JS-friendly states
        scope.launch {
            connector.personalityState.collect { state ->
                when (state) {
                    is PersonalityUIState.Loaded -> {
                        _jsPersonalityState.value = Json.encodeToString(
                            BridgePersonalityState(
                                coreTraits = state.coreTraits.mapKeys { it.key.name },
                                adaptiveTraits = state.adaptiveTraits.mapKeys { it.key.name },
                                effectiveTraits = state.effectiveTraits.mapKeys { it.key.name },
                                currentContext = BridgeContext(
                                    type = state.currentContext.type,
                                    description = state.currentContext.description
                                )
                            )
                        )
                    }
                    is PersonalityUIState.Error -> {
                        _jsPersonalityState.value = Json.encodeToString(
                            mapOf("error" to state.message)
                        )
                    }
                    is PersonalityUIState.Loading -> {
                        _jsPersonalityState.value = Json.encodeToString(
                            mapOf("loading" to true)
                        )
                    }
                }
            }
        }
        
        scope.launch {
            connector.evolutionEvents.collect { events ->
                _jsEvolutionEvents.value = Json.encodeToString(events)
            }
        }
        
        // Initial aspect data
        updateAspects()
    }
    
    /**
     * Refreshes the personality state
     */
    fun refreshPersonality(callback: (Boolean) -> Unit) {
        scope.launch {
            try {
                connector.refreshPersonalityState()
                updateAspects()
                callback(true)
            } catch (e: Exception) {
                callback(false)
            }
        }
    }
    
    /**
     * Adjusts a personality trait
     */
    fun adjustTrait(trait: String, adjustment: Double, callback: (Boolean) -> Unit) {
        scope.launch {
            val success = connector.adjustTrait(trait, adjustment.toFloat())
            if (success) updateAspects()
            callback(success)
        }
    }
    
    /**
     * Sets the context for the personality system
     */
    fun setContext(contextType: String, description: String, callback: (Boolean) -> Unit) {
        scope.launch {
            val success = connector.setContext(contextType, description)
            if (success) updateAspects()
            callback(success)
        }
    }
    
    /**
     * Resets adaptive traits to defaults
     */
    fun resetAdaptiveTraits(callback: (Boolean) -> Unit) {
        scope.launch {
            val success = connector.resetAdaptiveTraits()
            if (success) updateAspects()
            callback(success)
        }
    }
    
    /**
     * Saves the current personality state
     */
    fun savePersonality(callback: (Boolean) -> Unit) {
        scope.launch {
            val success = connector.savePersonalityState()
            callback(success)
        }
    }
    
    /**
     * Updates the personality aspects state
     */
    private fun updateAspects() {
        scope.launch {
            val aspects = connector.getPersonalityAspects()
            _jsPersonalityAspects.value = Json.encodeToString(aspects)
        }
    }
    
    /**
     * Gets the trait description for a trait
     */
    fun getTraitDescription(trait: String): String {
        return when (trait) {
            "ASSERTIVENESS" -> "Confidence in expressing opinions and making decisions"
            "COMPASSION" -> "Ability to care about and understand others' feelings"
            "DISCIPLINE" -> "Structure, rigor, and adherence to principles"
            "PATIENCE" -> "Calmness and tolerance when facing difficulties"
            "EMOTIONAL_INTELLIGENCE" -> "Recognizing and responding to emotions effectively"
            "CREATIVITY" -> "Imaginative thinking and novel approaches"
            "OPTIMISM" -> "Positive outlook and seeing opportunities in challenges"
            "DIPLOMACY" -> "Tact and consideration in social interactions"
            "ADAPTABILITY" -> "Flexibility and resilience when facing change"
            else -> "A component of personality"
        }
    }
    
    /**
     * Gets the aspect description for an aspect
     */
    fun getAspectDescription(aspect: String): String {
        return when (aspect) {
            "DIRECTNESS" -> "How straightforward and blunt in communication"
            "EMPATHY" -> "How emotionally supportive and understanding"
            "CHALLENGE" -> "How likely to push users out of comfort zones"
            "PLAYFULNESS" -> "How fun, creative, and lighthearted"
            "ANALYTICAL" -> "How logical, methodical, and systematic"
            "SUPPORTIVENESS" -> "How encouraging and helpful in difficult times"
            else -> "A high-level personality characteristic"
        }
    }
    
    /**
     * Gets the hint text for a context type
     */
    fun getContextHint(contextType: String): String {
        return when (contextType) {
            "PROFESSIONAL" -> "Business-like, formal, and task-oriented"
            "CASUAL" -> "Relaxed, friendly, and conversational"
            "EMOTIONAL_SUPPORT" -> "Compassionate, empathetic, and supportive"
            "PRODUCTIVITY" -> "Efficient, focused, and results-oriented"
            "LEARNING" -> "Patient, explanatory, and educational"
            "CRISIS" -> "Direct, decisive, and action-oriented"
            else -> "A specific environmental situation"
        }
    }
}

/**
 * JS-friendly data structure for personality state
 */
@Serializable
data class BridgePersonalityState(
    val coreTraits: Map<String, Float>,
    val adaptiveTraits: Map<String, Float>,
    val effectiveTraits: Map<String, Float>,
    val currentContext: BridgeContext
)

/**
 * JS-friendly data structure for context
 */
@Serializable
data class BridgeContext(
    val type: String,
    val description: String
)

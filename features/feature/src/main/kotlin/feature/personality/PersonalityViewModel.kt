/*
 * Sallie 2.0 Module
 * Persona: Tough love meets soul care.
 * Function: ViewModel for the personality system UI.
 * Got it, love.
 */
package feature.personality

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.launch
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive

/**
 * PersonalityViewModel - ViewModel for the personality UI components
 * 
 * This ViewModel provides UI state and actions for personality-related UI components.
 */
class PersonalityViewModel(
    private val connector: PersonalityUIConnector
) : ViewModel() {
    
    // UI state
    private val _personalityState = MutableStateFlow<UiState>(UiState.Loading)
    val personalityState: StateFlow<UiState> = _personalityState.asStateFlow()
    
    // Aspects state
    private val _personalityAspects = MutableStateFlow<List<PersonalityAspect>>(emptyList())
    val personalityAspects: StateFlow<List<PersonalityAspect>> = _personalityAspects.asStateFlow()
    
    // Evolution events
    private val _evolutionEvents = MutableStateFlow<List<PersonalityEvolutionEvent>>(emptyList())
    val evolutionEvents: StateFlow<List<PersonalityEvolutionEvent>> = _evolutionEvents.asStateFlow()
    
    init {
        // Subscribe to personality state changes
        viewModelScope.launch {
            connector.personalityState.collect { state ->
                when (state) {
                    is PersonalityUIState.Loaded -> {
                        _personalityState.value = UiState.Success(
                            PersonalityData(
                                coreTraits = state.coreTraits,
                                adaptiveTraits = state.adaptiveTraits,
                                effectiveTraits = state.effectiveTraits,
                                currentContext = state.currentContext
                            )
                        )
                    }
                    is PersonalityUIState.Error -> {
                        _personalityState.value = UiState.Error(state.message)
                    }
                    is PersonalityUIState.Loading -> {
                        _personalityState.value = UiState.Loading
                    }
                }
            }
        }
        
        // Subscribe to evolution events
        viewModelScope.launch {
            connector.evolutionEvents.collect { events ->
                _evolutionEvents.value = events
            }
        }
        
        // Initial data load
        refreshPersonality()
    }
    
    /**
     * Refreshes the personality state
     */
    fun refreshPersonality() {
        viewModelScope.launch {
            try {
                connector.refreshPersonalityState()
                updateAspects()
            } catch (e: Exception) {
                _personalityState.value = UiState.Error("Failed to refresh: ${e.message}")
            }
        }
    }
    
    /**
     * Adjusts a personality trait
     */
    fun adjustTrait(traitName: String, adjustment: Float) {
        viewModelScope.launch {
            try {
                val success = connector.adjustTrait(traitName, adjustment)
                if (success) {
                    updateAspects()
                }
            } catch (e: Exception) {
                _personalityState.value = UiState.Error("Failed to adjust trait: ${e.message}")
            }
        }
    }
    
    /**
     * Sets the current context
     */
    fun setContext(contextType: String, description: String) {
        viewModelScope.launch {
            try {
                val success = connector.setContext(contextType, description)
                if (success) {
                    updateAspects()
                }
            } catch (e: Exception) {
                _personalityState.value = UiState.Error("Failed to set context: ${e.message}")
            }
        }
    }
    
    /**
     * Resets adaptive traits to default values
     */
    fun resetAdaptiveTraits() {
        viewModelScope.launch {
            try {
                val success = connector.resetAdaptiveTraits()
                if (success) {
                    updateAspects()
                }
            } catch (e: Exception) {
                _personalityState.value = UiState.Error("Failed to reset traits: ${e.message}")
            }
        }
    }
    
    /**
     * Saves the current personality state
     */
    fun savePersonality() {
        viewModelScope.launch {
            try {
                connector.savePersonalityState()
            } catch (e: Exception) {
                _personalityState.value = UiState.Error("Failed to save: ${e.message}")
            }
        }
    }
    
    /**
     * Updates the personality aspects
     */
    private fun updateAspects() {
        viewModelScope.launch {
            try {
                _personalityAspects.value = connector.getPersonalityAspects()
            } catch (e: Exception) {
                // Silently fail, aspects are not critical
            }
        }
    }
    
    /**
     * UI state for personality data
     */
    sealed class UiState {
        object Loading : UiState()
        data class Success(val data: PersonalityData) : UiState()
        data class Error(val message: String) : UiState()
    }
    
    /**
     * Data class for personality information
     */
    data class PersonalityData(
        val coreTraits: Map<Trait, Float>,
        val adaptiveTraits: Map<Trait, Float>,
        val effectiveTraits: Map<Trait, Float>,
        val currentContext: PersonalityContext
    )
}

/**
 * Factory for creating PersonalityViewModel
 */
class PersonalityViewModelFactory(
    private val connector: PersonalityUIConnector
) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(PersonalityViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return PersonalityViewModel(connector) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}

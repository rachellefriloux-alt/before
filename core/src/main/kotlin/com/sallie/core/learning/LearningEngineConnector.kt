/*
 * Sallie 2.0 Module
 * Persona: Tough love meets soul care.
 * Function: Connector between UI components and the Adaptive Learning Engine.
 * Got it, love.
 */
package com.sallie.core.learning

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.sallie.core.learning.AdaptiveLearningEngine
import com.sallie.core.memory.HierarchicalMemorySystem
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * Provides an interface for UI components to interact with the AdaptiveLearningEngine.
 * Abstracts the complex functionality of the learning engine into simpler, UI-friendly methods.
 */
class LearningEngineConnector(
    private val learningEngine: AdaptiveLearningEngine,
    private val coroutineScope: CoroutineScope
) {
    // LiveData for UI components to observe
    private val _insights = MutableLiveData<List<UIInsight>>()
    val insights: LiveData<List<UIInsight>> = _insights
    
    private val _preferenceModels = MutableLiveData<Map<String, UIPreferenceModel>>()
    val preferenceModels: LiveData<Map<String, UIPreferenceModel>> = _preferenceModels
    
    private val _experiments = MutableLiveData<List<UIExperiment>>()
    val experiments: LiveData<List<UIExperiment>> = _experiments
    
    private val _isLoading = MutableLiveData<Boolean>(false)
    val isLoading: LiveData<Boolean> = _isLoading
    
    /**
     * Refresh all learning data from the learning engine
     */
    fun refreshData(minConfidence: Float = 0.5f) {
        _isLoading.value = true
        
        coroutineScope.launch {
            try {
                // Get insights
                val engineInsights = withContext(Dispatchers.IO) {
                    learningEngine.getInsights(minConfidence)
                }
                
                // Map to UI-friendly model
                val uiInsights = engineInsights.map { insight ->
                    UIInsight(
                        id = insight.id,
                        category = insight.category.name,
                        description = insight.description,
                        confidence = insight.confidence,
                        confidenceLevel = insight.confidenceLevel.name,
                        evidence = insight.evidence,
                        evidenceCount = insight.evidence.size,
                        createdAt = insight.createdAt
                    )
                }
                
                _insights.postValue(uiInsights)
                
                // Get preference models
                val enginePreferenceModels = withContext(Dispatchers.IO) {
                    learningEngine.preferenceModels.value
                }
                
                // Map to UI-friendly model
                val uiPreferenceModels = enginePreferenceModels.mapValues { (_, model) ->
                    UIPreferenceModel(
                        updateCount = model.updateCount,
                        preferences = model.preferences
                    )
                }
                
                _preferenceModels.postValue(uiPreferenceModels)
                
                // Get experiments
                val engineExperiments = withContext(Dispatchers.IO) {
                    learningEngine.getActiveExperiments() + learningEngine.getCompletedExperiments()
                }
                
                // Map to UI-friendly model
                val uiExperiments = engineExperiments.map { experiment ->
                    UIExperiment(
                        id = experiment.id,
                        hypothesis = experiment.hypothesis,
                        category = experiment.category.name,
                        status = experiment.status.name,
                        variants = experiment.variants,
                        progress = experiment.progress,
                        conclusion = experiment.conclusion ?: "",
                        startedAt = experiment.startedAt,
                        completedAt = experiment.completedAt
                    )
                }
                
                _experiments.postValue(uiExperiments)
            } catch (e: Exception) {
                // Log error
                e.printStackTrace()
            } finally {
                _isLoading.postValue(false)
            }
        }
    }
    
    /**
     * Process user interaction with the UI
     */
    fun processUserInteraction(interaction: UIInteraction) {
        coroutineScope.launch {
            try {
                val engineInteraction = when (interaction) {
                    is UIInteraction.MessageSent -> AdaptiveLearningEngine.UserInteraction(
                        type = AdaptiveLearningEngine.InteractionType.MESSAGE_SENT,
                        content = interaction.message,
                        contextualFactors = interaction.contextualFactors
                    )
                    
                    is UIInteraction.MessageReceived -> AdaptiveLearningEngine.UserInteraction(
                        type = AdaptiveLearningEngine.InteractionType.MESSAGE_RECEIVED,
                        content = interaction.message,
                        userSentiment = interaction.sentiment,
                        contextualFactors = interaction.contextualFactors
                    )
                    
                    is UIInteraction.FeatureUsed -> AdaptiveLearningEngine.UserInteraction(
                        type = AdaptiveLearningEngine.InteractionType.FEATURE_USED,
                        metadata = mapOf(
                            "feature" to interaction.featureName,
                            "duration" to interaction.duration.toString()
                        ),
                        contextualFactors = interaction.contextualFactors
                    )
                    
                    is UIInteraction.SettingChanged -> AdaptiveLearningEngine.UserInteraction(
                        type = AdaptiveLearningEngine.InteractionType.SETTING_CHANGED,
                        metadata = mapOf(
                            "category" to interaction.category,
                            "setting" to interaction.settingName,
                            "value" to interaction.newValue
                        )
                    )
                    
                    is UIInteraction.FeedbackGiven -> AdaptiveLearningEngine.UserInteraction(
                        type = AdaptiveLearningEngine.InteractionType.EXPLICIT_FEEDBACK,
                        explicitFeedback = AdaptiveLearningEngine.ExplicitFeedback(
                            rating = interaction.rating,
                            feedbackText = interaction.feedbackText,
                            feedbackType = interaction.feedbackType,
                            targetId = interaction.targetId
                        )
                    )
                }
                
                withContext(Dispatchers.IO) {
                    learningEngine.processInteraction(engineInteraction)
                }
                
                // Refresh data if needed
                if (interaction.refreshAfter) {
                    refreshData()
                }
            } catch (e: Exception) {
                // Log error
                e.printStackTrace()
            }
        }
    }
    
    /**
     * Get experiment variant for testing
     */
    fun getExperimentVariant(experimentId: String): String? {
        val experiment = _experiments.value?.find { it.id == experimentId } ?: return null
        return experiment.variants.randomOrNull()
    }
    
    /**
     * Submit experiment result
     */
    fun submitExperimentResult(experimentId: String, variant: String, isSuccess: Boolean) {
        coroutineScope.launch {
            try {
                val rating = if (isSuccess) 5 else 2
                val interaction = AdaptiveLearningEngine.UserInteraction(
                    type = AdaptiveLearningEngine.InteractionType.EXPLICIT_FEEDBACK,
                    explicitFeedback = AdaptiveLearningEngine.ExplicitFeedback(
                        rating = rating,
                        feedbackText = "Experiment feedback for variant $variant",
                        feedbackType = "experiment",
                        targetId = experimentId
                    ),
                    metadata = mapOf(
                        "experimentId" to experimentId,
                        "variant" to variant
                    )
                )
                
                withContext(Dispatchers.IO) {
                    learningEngine.processInteraction(interaction)
                }
            } catch (e: Exception) {
                // Log error
                e.printStackTrace()
            }
        }
    }
    
    // UI-friendly data classes
    
    /**
     * UI-friendly insight model
     */
    data class UIInsight(
        val id: String,
        val category: String,
        val description: String,
        val confidence: Float,
        val confidenceLevel: String,
        val evidence: List<String>,
        val evidenceCount: Int,
        val createdAt: Long
    )
    
    /**
     * UI-friendly preference model
     */
    data class UIPreferenceModel(
        val updateCount: Int,
        val preferences: Map<String, Float>
    )
    
    /**
     * UI-friendly experiment model
     */
    data class UIExperiment(
        val id: String,
        val hypothesis: String,
        val category: String,
        val status: String,
        val variants: List<String>,
        val progress: Float,
        val conclusion: String,
        val startedAt: Long,
        val completedAt: Long?
    )
    
    /**
     * Sealed class for different types of UI interactions
     */
    sealed class UIInteraction {
        abstract val refreshAfter: Boolean
        
        data class MessageSent(
            val message: String,
            val contextualFactors: Map<String, String> = emptyMap(),
            override val refreshAfter: Boolean = false
        ) : UIInteraction()
        
        data class MessageReceived(
            val message: String,
            val sentiment: Float = 0.0f,
            val contextualFactors: Map<String, String> = emptyMap(),
            override val refreshAfter: Boolean = true
        ) : UIInteraction()
        
        data class FeatureUsed(
            val featureName: String,
            val duration: Int = 0,
            val contextualFactors: Map<String, String> = emptyMap(),
            override val refreshAfter: Boolean = false
        ) : UIInteraction()
        
        data class SettingChanged(
            val category: String,
            val settingName: String,
            val newValue: String,
            override val refreshAfter: Boolean = true
        ) : UIInteraction()
        
        data class FeedbackGiven(
            val rating: Int,
            val feedbackText: String,
            val feedbackType: String,
            val targetId: String,
            override val refreshAfter: Boolean = true
        ) : UIInteraction()
    }
}

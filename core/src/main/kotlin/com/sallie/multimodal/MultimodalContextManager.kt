/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * Multimodal Context Management Component
 */

package com.sallie.multimodal

import java.util.UUID
import java.util.concurrent.ConcurrentLinkedQueue

/**
 * Manages context across multiple inputs and modalities
 */
class MultimodalContextManager {
    
    // Queue to store conversation history with a limited size
    private val conversationHistory = ConcurrentLinkedQueue<InputUnderstanding>()
    private val maxHistorySize = 20
    
    // Current context representing the state of the conversation
    private var currentContext = MultimodalContext(
        id = UUID.randomUUID().toString(),
        activeEntities = mutableMapOf(),
        activeTopics = mutableSetOf(),
        primaryIntent = null,
        overallSentiment = null,
        sceneContext = null,
        lastUpdated = System.currentTimeMillis()
    )
    
    /**
     * Update context with a new understanding
     */
    fun updateContext(understanding: InputUnderstanding) {
        // Add to conversation history
        addToHistory(understanding)
        
        // Update the current context based on the new understanding
        updateCurrentContext(understanding)
    }
    
    /**
     * Update context with a multimodal understanding
     */
    fun updateMultimodalContext(multimodalUnderstanding: MultimodalUnderstanding) {
        // Add individual understandings to conversation history
        multimodalUnderstanding.understandings.forEach { understanding ->
            addToHistory(understanding)
        }
        
        // Update the current context with integrated insights
        updateCurrentContextWithIntegratedInsights(multimodalUnderstanding)
    }
    
    /**
     * Get the current context
     */
    fun getCurrentContext(): MultimodalContext {
        return currentContext.copy()
    }
    
    /**
     * Get the conversation history
     */
    fun getConversationHistory(): List<InputUnderstanding> {
        return conversationHistory.toList()
    }
    
    /**
     * Clear the context and history
     */
    fun clearContext() {
        conversationHistory.clear()
        currentContext = MultimodalContext(
            id = UUID.randomUUID().toString(),
            activeEntities = mutableMapOf(),
            activeTopics = mutableSetOf(),
            primaryIntent = null,
            overallSentiment = null,
            sceneContext = null,
            lastUpdated = System.currentTimeMillis()
        )
    }
    
    /**
     * Add an understanding to the conversation history
     */
    private fun addToHistory(understanding: InputUnderstanding) {
        conversationHistory.add(understanding)
        
        // Maintain the max history size
        while (conversationHistory.size > maxHistorySize) {
            conversationHistory.poll()
        }
    }
    
    /**
     * Update the current context based on a new understanding
     */
    private fun updateCurrentContext(understanding: InputUnderstanding) {
        val contextUpdates = mutableMapOf<String, Any?>()
        
        // Process each insight to update the context
        for (insight in understanding.insights) {
            when (insight.category) {
                InsightCategory.ENTITY -> {
                    // Update active entities
                    updateEntity(insight)
                }
                InsightCategory.TOPIC -> {
                    // Update active topics
                    currentContext.activeTopics.add(insight.content)
                }
                InsightCategory.INTENT -> {
                    // Update primary intent if confidence is high enough
                    if (currentContext.primaryIntent == null || 
                        insight.confidence > (currentContext.primaryIntent?.confidence ?: 0f)) {
                        currentContext.primaryIntent = ActiveIntent(
                            content = insight.content,
                            confidence = insight.confidence,
                            source = insight.source,
                            timestamp = System.currentTimeMillis()
                        )
                    }
                }
                InsightCategory.SENTIMENT, InsightCategory.EMOTION, InsightCategory.AUDIO_EMOTION -> {
                    // Update overall sentiment
                    currentContext.overallSentiment = insight.content
                }
                InsightCategory.SCENE_CONTEXT -> {
                    // Update scene context
                    currentContext.sceneContext = insight.content
                }
                else -> {
                    // Other insights might be relevant to context in specific ways
                }
            }
        }
        
        // Update the last updated timestamp
        currentContext.lastUpdated = System.currentTimeMillis()
    }
    
    /**
     * Update the current context with integrated insights from multimodal understanding
     */
    private fun updateCurrentContextWithIntegratedInsights(multimodalUnderstanding: MultimodalUnderstanding) {
        // Update with individual understandings first
        multimodalUnderstanding.understandings.forEach { understanding ->
            updateCurrentContext(understanding)
        }
        
        // Then update with the integrated insights, which take precedence
        for (insight in multimodalUnderstanding.integratedInsights) {
            when (insight.category) {
                InsightCategory.ENTITY -> {
                    updateEntity(insight)
                }
                InsightCategory.TOPIC -> {
                    currentContext.activeTopics.add(insight.content)
                }
                InsightCategory.INTENT -> {
                    // Integrated insights from multiple modalities should have higher precedence
                    currentContext.primaryIntent = ActiveIntent(
                        content = insight.content,
                        confidence = insight.confidence,
                        source = InputType.MULTIMODAL,
                        timestamp = System.currentTimeMillis()
                    )
                }
                InsightCategory.SENTIMENT, InsightCategory.EMOTION, InsightCategory.AUDIO_EMOTION -> {
                    // Update overall sentiment with integrated insight
                    currentContext.overallSentiment = insight.content
                }
                InsightCategory.SCENE_CONTEXT -> {
                    // Update scene context with integrated insight
                    currentContext.sceneContext = insight.content
                }
                InsightCategory.CROSS_REFERENCE -> {
                    // Handle cross-references specially
                    handleCrossReference(insight)
                }
                else -> {
                    // Other insights might be relevant to context in specific ways
                }
            }
        }
        
        // Update the last updated timestamp
        currentContext.lastUpdated = System.currentTimeMillis()
    }
    
    /**
     * Update an entity in the current context
     */
    private fun updateEntity(insight: InputInsight) {
        // Extract entity type and value
        val colonIndex = insight.content.indexOf(':')
        if (colonIndex > 0) {
            val entityType = insight.content.substring(0, colonIndex).trim()
            val entityValue = insight.content.substring(colonIndex + 1).trim()
            
            // Add or update the entity in the active entities map
            currentContext.activeEntities[entityType] = ActiveEntity(
                value = entityValue,
                confidence = insight.confidence,
                source = insight.source,
                timestamp = System.currentTimeMillis()
            )
        } else {
            // If there's no type prefix, use the whole content as a generic entity
            currentContext.activeEntities["GENERIC"] = ActiveEntity(
                value = insight.content,
                confidence = insight.confidence,
                source = insight.source,
                timestamp = System.currentTimeMillis()
            )
        }
    }
    
    /**
     * Handle a cross-reference insight
     */
    private fun handleCrossReference(insight: InputInsight) {
        // For now, we'll just add it as a special entity type
        // In a real implementation, we might handle these differently
        currentContext.activeEntities["CROSS_REFERENCE"] = ActiveEntity(
            value = insight.content,
            confidence = insight.confidence,
            source = InputType.MULTIMODAL,
            timestamp = System.currentTimeMillis()
        )
    }
}

/**
 * Represents the current context of a multimodal conversation
 */
data class MultimodalContext(
    val id: String,
    val activeEntities: MutableMap<String, ActiveEntity>,
    val activeTopics: MutableSet<String>,
    var primaryIntent: ActiveIntent?,
    var overallSentiment: String?,
    var sceneContext: String?,
    var lastUpdated: Long
)

/**
 * Represents an active entity in the current context
 */
data class ActiveEntity(
    val value: String,
    val confidence: Float,
    val source: InputType,
    val timestamp: Long
)

/**
 * Represents an active intent in the current context
 */
data class ActiveIntent(
    val content: String,
    val confidence: Float,
    val source: InputType,
    val timestamp: Long
)

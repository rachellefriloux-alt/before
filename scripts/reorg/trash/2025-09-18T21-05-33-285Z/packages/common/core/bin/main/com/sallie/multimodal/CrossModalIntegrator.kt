/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * Cross-Modal Integration Component
 */

package com.sallie.multimodal

import java.util.UUID

/**
 * Integrates insights from multiple modalities to create a unified understanding
 */
class CrossModalIntegrator {
    
    /**
     * Integrate understandings from different modalities
     */
    fun integrateUnderstandings(understandings: List<InputUnderstanding>): List<InputInsight> {
        if (understandings.isEmpty()) {
            return emptyList()
        }
        
        // If there's only one understanding, there's no integration to do
        if (understandings.size == 1) {
            return understandings[0].insights
        }
        
        val integratedInsights = mutableListOf<InputInsight>()
        
        // Collect all insights from all understandings
        val allInsights = understandings.flatMap { it.insights }
        
        // Extract reference points from each modality
        val referencePoints = extractReferencePoints(allInsights)
        
        // Find cross-modal connections
        val connections = findCrossModalConnections(allInsights, referencePoints)
        integratedInsights.addAll(connections)
        
        // Resolve conflicts between modalities
        val resolvedInsights = resolveModalityConflicts(allInsights)
        integratedInsights.addAll(resolvedInsights)
        
        // Enhance insights with additional context
        val enhancedInsights = enhanceWithCrossModalContext(allInsights)
        integratedInsights.addAll(enhancedInsights)
        
        return integratedInsights
    }
    
    /**
     * Extract reference points that can be used to connect insights across modalities
     */
    private fun extractReferencePoints(insights: List<InputInsight>): Map<String, List<InputInsight>> {
        val referencePoints = mutableMapOf<String, MutableList<InputInsight>>()
        
        // Group by common categories
        insights.forEach { insight ->
            when (insight.category) {
                InsightCategory.ENTITY -> {
                    // Entities can be reference points for cross-modal connections
                    val key = normalizeEntityName(insight.content)
                    referencePoints.getOrPut(key) { mutableListOf() }.add(insight)
                }
                InsightCategory.VISUAL_OBJECT -> {
                    // Visual objects can be reference points
                    referencePoints.getOrPut(insight.content) { mutableListOf() }.add(insight)
                }
                InsightCategory.TOPIC -> {
                    // Topics can be reference points
                    referencePoints.getOrPut(insight.content) { mutableListOf() }.add(insight)
                }
                else -> {
                    // Other categories might also be reference points in specific cases
                }
            }
        }
        
        return referencePoints
    }
    
    /**
     * Normalize entity names for better matching
     */
    private fun normalizeEntityName(entity: String): String {
        // Extract just the entity name without the type prefix
        val colonIndex = entity.indexOf(':')
        return if (colonIndex > 0) {
            entity.substring(colonIndex + 1).trim()
        } else {
            entity.trim()
        }
    }
    
    /**
     * Find connections between insights from different modalities
     */
    private fun findCrossModalConnections(
        insights: List<InputInsight>,
        referencePoints: Map<String, List<InputInsight>>
    ): List<InputInsight> {
        val connections = mutableListOf<InputInsight>()
        
        // Look for reference points that occur across multiple modalities
        referencePoints.forEach { (reference, relatedInsights) ->
            // Check if this reference point appears in multiple modalities
            val modalities = relatedInsights.map { it.source }.toSet()
            if (modalities.size > 1) {
                // Create a cross-reference insight
                connections.add(
                    InputInsight(
                        id = UUID.randomUUID().toString(),
                        category = InsightCategory.CROSS_REFERENCE,
                        content = "Cross-modal reference: $reference appears in ${modalities.joinToString(", ")}",
                        confidence = calculateAverageConfidence(relatedInsights),
                        source = InputType.MULTIMODAL
                    )
                )
            }
        }
        
        // Look for temporal alignments (e.g., speech mentioning an object while it's visible)
        // This would require timestamp information in a real implementation
        
        // Look for spatial alignments (e.g., pointing at an object while talking about it)
        // This would require spatial information in a real implementation
        
        return connections
    }
    
    /**
     * Resolve conflicts between insights from different modalities
     */
    private fun resolveModalityConflicts(insights: List<InputInsight>): List<InputInsight> {
        val resolvedInsights = mutableListOf<InputInsight>()
        
        // Group insights by category for conflict detection
        val insightsByCategory = insights.groupBy { it.category }
        
        // Look for conflicting intent insights
        val intentInsights = insightsByCategory[InsightCategory.INTENT] ?: emptyList()
        if (intentInsights.size > 1) {
            // In a real implementation, we'd use more sophisticated conflict resolution
            // For now, just choose the one with highest confidence
            val primaryIntent = intentInsights.maxByOrNull { it.confidence }
            if (primaryIntent != null) {
                resolvedInsights.add(
                    InputInsight(
                        id = UUID.randomUUID().toString(),
                        category = InsightCategory.INTENT,
                        content = "Resolved intent: ${primaryIntent.content}",
                        confidence = primaryIntent.confidence,
                        source = InputType.MULTIMODAL
                    )
                )
            }
        }
        
        // Look for conflicting sentiment insights
        val sentimentInsights = insightsByCategory[InsightCategory.SENTIMENT] ?: emptyList()
        if (sentimentInsights.size > 1) {
            // For demonstration, we'll prioritize audio emotion over text sentiment
            val audioEmotionInsight = sentimentInsights.find { it.source == InputType.AUDIO }
            val primarySentiment = audioEmotionInsight ?: sentimentInsights.maxByOrNull { it.confidence }
            
            if (primarySentiment != null) {
                resolvedInsights.add(
                    InputInsight(
                        id = UUID.randomUUID().toString(),
                        category = InsightCategory.SENTIMENT,
                        content = "Resolved sentiment: ${primarySentiment.content}",
                        confidence = primarySentiment.confidence,
                        source = InputType.MULTIMODAL
                    )
                )
            }
        }
        
        return resolvedInsights
    }
    
    /**
     * Enhance insights with additional context from other modalities
     */
    private fun enhanceWithCrossModalContext(insights: List<InputInsight>): List<InputInsight> {
        val enhancedInsights = mutableListOf<InputInsight>()
        
        // For demonstration, we'll create a few examples of enhanced insights
        
        // Example: Enhance text understanding with visual context
        val textInsights = insights.filter { it.source == InputType.TEXT }
        val visualInsights = insights.filter { it.source == InputType.IMAGE || it.source == InputType.VIDEO }
        
        if (textInsights.isNotEmpty() && visualInsights.isNotEmpty()) {
            // Look for intents in text that could be enhanced with visual info
            val textIntents = textInsights.filter { it.category == InsightCategory.INTENT }
            val visualObjects = visualInsights.filter { it.category == InsightCategory.VISUAL_OBJECT }
            
            // For demonstration, we'll create an enhanced insight if there's both an intent and objects
            if (textIntents.isNotEmpty() && visualObjects.isNotEmpty()) {
                val primaryIntent = textIntents.maxByOrNull { it.confidence }
                val primaryObject = visualObjects.maxByOrNull { it.confidence }
                
                if (primaryIntent != null && primaryObject != null) {
                    enhancedInsights.add(
                        InputInsight(
                            id = UUID.randomUUID().toString(),
                            category = InsightCategory.INTENT,
                            content = "Enhanced intent: ${primaryIntent.content} with visual context of ${primaryObject.content}",
                            confidence = (primaryIntent.confidence + primaryObject.confidence) / 2,
                            source = InputType.MULTIMODAL
                        )
                    )
                }
            }
        }
        
        // Example: Enhance audio transcription with visual context
        val audioTranscriptions = insights.filter { 
            it.source == InputType.AUDIO && it.category == InsightCategory.AUDIO_TRANSCRIPTION 
        }
        
        if (audioTranscriptions.isNotEmpty() && visualInsights.isNotEmpty()) {
            val transcription = audioTranscriptions.first()
            val visualScene = visualInsights.find { it.category == InsightCategory.SCENE_CONTEXT }
            
            if (visualScene != null) {
                enhancedInsights.add(
                    InputInsight(
                        id = UUID.randomUUID().toString(),
                        category = InsightCategory.CROSS_REFERENCE,
                        content = "Speech in context: Transcription '${transcription.content}' in visual scene '${visualScene.content}'",
                        confidence = (transcription.confidence + visualScene.confidence) / 2,
                        source = InputType.MULTIMODAL
                    )
                )
            }
        }
        
        return enhancedInsights
    }
    
    /**
     * Calculate the average confidence across insights
     */
    private fun calculateAverageConfidence(insights: List<InputInsight>): Float {
        if (insights.isEmpty()) return 0.0f
        
        val totalConfidence = insights.sumOf { it.confidence.toDouble() }
        return (totalConfidence / insights.size).toFloat()
    }
}

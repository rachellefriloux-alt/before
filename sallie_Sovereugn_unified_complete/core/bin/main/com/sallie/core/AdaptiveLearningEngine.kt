/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Advanced learning and adaptation system for human-like intelligence evolution.
 * Got it, love.
 */
package com.sallie.core

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.concurrent.ConcurrentHashMap

/**
 * Advanced learning system that continuously adapts Sallie's responses,
 * behavior patterns, and problem-solving approaches based on user interactions.
 */
class AdaptiveLearningEngine {
    
    data class LearningPattern(
        val context: String,
        val userAction: String,
        val outcome: String,
        var effectiveness: Double, // 0.0 to 1.0
        val timestamp: Long = System.currentTimeMillis(),
        var reinforcementCount: Int = 1
    )
    
    data class AdaptationStrategy(
        val trigger: String,
        val response: String,
        val successRate: Double,
        val usage: Int = 0,
        val lastUsed: Long = 0
    )
    
    private val learningPatterns = ConcurrentHashMap<String, MutableList<LearningPattern>>()
    private val adaptationStrategies = ConcurrentHashMap<String, AdaptationStrategy>()
    private val behaviorTrends = ConcurrentHashMap<String, Double>()
    private val creativeSolutions = mutableSetOf<String>()
    
    // Learning parameters
    private var learningRate = 0.1
    private var decayFactor = 0.95
    private var confidenceThreshold = 0.75
    
    /**
     * Learn from user interaction and outcome
     */
    fun learn(context: String, userAction: String, outcome: String, effectiveness: Double) {
        val pattern = LearningPattern(context, userAction, outcome, effectiveness.coerceIn(0.0, 1.0))
        
        learningPatterns.computeIfAbsent(context) { mutableListOf() }.apply {
            // Check for existing similar patterns
            val existing = find { it.userAction == userAction && it.outcome.startsWith(outcome.take(20)) }
            if (existing != null) {
                // Reinforce existing pattern
                existing.reinforcementCount++
                val newEffectiveness = (existing.effectiveness * decayFactor) + (effectiveness * learningRate)
                existing.effectiveness = newEffectiveness.coerceIn(0.0, 1.0)
            } else {
                add(pattern)
            }
            
            // Maintain reasonable size
            if (size > 50) {
                sortByDescending { it.effectiveness * it.reinforcementCount }
                removeAll(drop(40))
            }
        }
        
        // Update behavior trends
        updateBehaviorTrend(context, effectiveness)
    }
    
    /**
     * Adapt response strategy based on learned patterns
     */
    suspend fun adaptResponse(context: String, baseResponse: String): String = withContext(Dispatchers.Default) {
        val patterns = learningPatterns[context] ?: return@withContext baseResponse
        
        val effectivePatterns = patterns
            .filter { it.effectiveness > confidenceThreshold }
            .sortedByDescending { it.effectiveness * it.reinforcementCount }
        
        if (effectivePatterns.isEmpty()) return@withContext baseResponse
        
        val bestPattern = effectivePatterns.first()
        val adaptedResponse = when {
            bestPattern.outcome.contains("positive") -> enhancePositiveResponse(baseResponse)
            bestPattern.outcome.contains("stress") -> applySoulCareApproach(baseResponse)
            bestPattern.outcome.contains("confusion") -> simplifyResponse(baseResponse)
            bestPattern.outcome.contains("humor") -> addAppropriateHumor(baseResponse)
            else -> baseResponse
        }
        
        // Track strategy usage
        val strategy = AdaptationStrategy(context, adaptedResponse, bestPattern.effectiveness)
        adaptationStrategies[context] = strategy.copy(
            usage = strategy.usage + 1,
            lastUsed = System.currentTimeMillis()
        )
        
        adaptedResponse
    }
    
    /**
     * Predict best approach for new situation based on learned patterns
     */
    fun predictBestApproach(context: String, similarityThreshold: Double = 0.7): String? {
        val allPatterns = learningPatterns.values.flatten()
        val similarPatterns = allPatterns.filter { pattern ->
            calculateSimilarity(context, pattern.context) >= similarityThreshold
        }.sortedByDescending { it.effectiveness }
        
        return similarPatterns.firstOrNull()?.let { pattern ->
            "Based on learned patterns, recommend: ${pattern.outcome}. " +
            "Confidence: ${(pattern.effectiveness * 100).toInt()}%. Got it, love."
        }
    }
    
    /**
     * Generate creative solution by combining learned patterns
     */
    fun generateCreativeSolution(problem: String): String? {
        val relevantPatterns = learningPatterns.values.flatten()
            .filter { it.effectiveness > 0.6 }
            .shuffled()
            .take(3)
        
        if (relevantPatterns.size < 2) return null
        
        val combinedSolution = "Creative approach: " + relevantPatterns
            .joinToString(" + ") { it.outcome.take(30) }
            .plus(". Synthesized from successful patterns. Got it, love.")
        
        creativeSolutions.add(combinedSolution)
        return combinedSolution
    }
    
    /**
     * Evolve learning parameters based on overall success
     */
    fun evolveParameters() {
        val overallEffectiveness = learningPatterns.values.flatten()
            .map { it.effectiveness }
            .average()
        
        when {
            overallEffectiveness > 0.8 -> {
                learningRate = (learningRate * 1.05).coerceAtMost(0.3)
                confidenceThreshold = (confidenceThreshold * 1.02).coerceAtMost(0.9)
            }
            overallEffectiveness < 0.5 -> {
                learningRate = (learningRate * 0.95).coerceAtLeast(0.05)
                confidenceThreshold = (confidenceThreshold * 0.98).coerceAtLeast(0.5)
            }
        }
    }
    
    /**
     * Get learning insights and statistics
     */
    fun getLearningInsights(): Map<String, Any> {
        val totalPatterns = learningPatterns.values.sumOf { it.size }
        val avgEffectiveness = learningPatterns.values.flatten()
            .map { it.effectiveness }
            .average()
        
        return mapOf(
            "totalPatterns" to totalPatterns,
            "averageEffectiveness" to avgEffectiveness,
            "learningRate" to learningRate,
            "confidenceThreshold" to confidenceThreshold,
            "topContexts" to learningPatterns.keys.take(5),
            "creativeSolutions" to creativeSolutions.size,
            "adaptationStrategies" to adaptationStrategies.size
        )
    }
    
    // Private helper methods
    private fun updateBehaviorTrend(context: String, effectiveness: Double) {
        val currentTrend = behaviorTrends[context] ?: 0.5
        val newTrend = (currentTrend * decayFactor) + (effectiveness * learningRate)
        behaviorTrends[context] = newTrend.coerceIn(0.0, 1.0)
    }
    
    private fun calculateSimilarity(context1: String, context2: String): Double {
        val words1 = context1.lowercase().split(" ").toSet()
        val words2 = context2.lowercase().split(" ").toSet()
        val intersection = words1.intersect(words2).size
        val union = words1.union(words2).size
        return if (union > 0) intersection.toDouble() / union else 0.0
    }
    
    private fun enhancePositiveResponse(response: String): String {
        return when {
            !response.contains("amazing") && Math.random() < 0.3 -> 
                "$response You're doing amazing."
            !response.contains("proud") && Math.random() < 0.2 -> 
                "I'm proud of your progress. $response"
            else -> response
        }
    }
    
    private fun applySoulCareApproach(response: String): String {
        return when {
            response.length > 100 -> 
                "Take a breath, love. ${response.take(80)}... Let's focus on one step at a time."
            !response.contains("breath") && Math.random() < 0.4 -> 
                "Take a breath. $response You've got this."
            else -> response
        }
    }
    
    private fun simplifyResponse(response: String): String {
        val sentences = response.split('.', '!', '?').filter { it.trim().isNotEmpty() }
        return if (sentences.size > 2) {
            sentences.take(2).joinToString(". ") + ". Got it, love."
        } else response
    }
    
    private fun addAppropriateHumor(response: String): String {
        val humorPhrases = listOf(
            " (and yes, I'm still funnier than autocorrect)",
            " Trust me, I've seen worse",
            " - but who's counting?",
            " It's giving 'main character energy'",
            " No cap."
        )
        
        return if (Math.random() < 0.3 && !response.contains("love.")) {
            response + humorPhrases.random()
        } else response
    }
}
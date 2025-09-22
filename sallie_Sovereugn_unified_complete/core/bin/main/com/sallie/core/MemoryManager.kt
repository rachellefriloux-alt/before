/*
 * Sallie 1.0 Module  
 * Persona: Tough love meets soul care.
 * Function: Enhanced persistent memory with advanced personalization and long-term learning.
 * Got it, love.
 */
package com.sallie.core

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.concurrent.ConcurrentHashMap

// Advanced persistent memory system with personalization and learning
class MemoryManager {
    data class MemoryItem(
        val key: String,
        var value: String,
        var priority: Int = 50, // 0..100 user / system assigned importance
        val created: Long = System.currentTimeMillis(),
        var lastAccess: Long = System.currentTimeMillis(),
        var category: String = "general",
        var emotionalContext: String = "",
        var relatedMemories: MutableList<String> = mutableListOf(),
        var learningWeight: Double = 1.0,
        var personalRelevance: Double = 0.5
    ) {
        fun ageMillis(now: Long = System.currentTimeMillis()) = now - created
        fun sinceLastAccess(now: Long = System.currentTimeMillis()) = now - lastAccess
        fun decayFactor(now: Long = System.currentTimeMillis()): Double {
            // Exponential decay based on age; half-life ~ 7 days
            val halfLifeMs = 7 * 24 * 60 * 60 * 1000.0
            val decay = Math.pow(0.5, ageMillis(now) / halfLifeMs)
            return decay
        }
        fun effectiveScore(now: Long = System.currentTimeMillis()): Double {
            // Enhanced scoring with personalization and learning weight
            val freshnessBoost = if (sinceLastAccess(now) < 6 * 60 * 60 * 1000) 1.15 else 1.0
            val personalityBoost = 1.0 + (personalRelevance * 0.5)
            val learningBoost = learningWeight
            return priority * decayFactor(now) * freshnessBoost * personalityBoost * learningBoost
        }
    }
    
    data class PersonalizationProfile(
        var preferences: MutableMap<String, Any> = mutableMapOf(),
        var communication_style: MutableMap<String, Double> = mutableMapOf(),
        var task_patterns: MutableMap<String, Int> = mutableMapOf(),
        var emotional_patterns: MutableMap<String, Double> = mutableMapOf(),
        var learning_preferences: MutableMap<String, String> = mutableMapOf(),
        val created: Long = System.currentTimeMillis(),
        var lastUpdated: Long = System.currentTimeMillis()
    )
    
    data class ContextualInsight(
        val insight: String,
        val confidence: Double,
        val category: String,
        val applicableContexts: List<String>,
        val timestamp: Long = System.currentTimeMillis()
    )

    private val quickCapture = mutableListOf<String>()
    private val personalContext = ConcurrentHashMap<String, MemoryItem>()
    private val memoryHistory = mutableListOf<MemoryItem>()
    private val personalizationProfile = PersonalizationProfile()
    private val contextualInsights = mutableListOf<ContextualInsight>()
    private val semanticConnections = ConcurrentHashMap<String, MutableSet<String>>()
    private val conversationHistory = mutableListOf<Pair<String, String>>() // user input, sallie response
    
    // Configuration
    var maxItems: Int = 1000
    var pruneTarget: Int = 800
    private val maxConversationHistory: Int = 500
    
    /**
     * Enhanced memory storage with contextual information
     */
    fun remember(
        key: String, 
        value: String, 
        priority: Int = 50, 
        category: String = "general",
        emotionalContext: String = "",
        personalRelevance: Double = 0.5
    ) {
        val clamped = priority.coerceIn(0, 100)
        val clampedRelevance = personalRelevance.coerceIn(0.0, 1.0)
        
        val existing = personalContext[key]
        if (existing != null) {
            existing.value = value
            existing.priority = clamped
            existing.lastAccess = System.currentTimeMillis()
            existing.category = category
            existing.emotionalContext = emotionalContext
            existing.personalRelevance = clampedRelevance
            memoryHistory.add(existing.copy())
        } else {
            val item = MemoryItem(
                key = key,
                value = value, 
                priority = clamped,
                category = category,
                emotionalContext = emotionalContext,
                personalRelevance = clampedRelevance
            )
            personalContext[key] = item
            memoryHistory.add(item.copy())
            
            // Build semantic connections
            buildSemanticConnections(key, value)
        }
        
        enforceCapacity()
        updatePersonalizationProfile(key, value, category)
    }
    
    /**
     * Enhanced recall with contextual relevance
     */
    suspend fun contextualRecall(
        query: String, 
        context: String = "",
        limit: Int = 5
    ): List<MemoryItem> = withContext(Dispatchers.Default) {
        
        val queryWords = query.lowercase().split(" ").toSet()
        val contextWords = context.lowercase().split(" ").toSet()
        
        val scoredMemories = personalContext.values.map { memory ->
            val relevanceScore = calculateRelevanceScore(memory, queryWords, contextWords)
            memory to relevanceScore
        }.sortedByDescending { it.second }
        
        val results = scoredMemories.take(limit).map { it.first }
        
        // Update access times for recalled memories
        results.forEach { it.lastAccess = System.currentTimeMillis() }
        
        results
    }
    
    /**
     * Store conversation for learning and personalization
     */
    fun recordConversation(userInput: String, sallieResponse: String) {
        conversationHistory.add(Pair(userInput, sallieResponse))
        
        // Maintain conversation history size
        if (conversationHistory.size > maxConversationHistory) {
            conversationHistory.removeFirst()
        }
        
        // Extract and remember important information
        extractAndRememberImportantInfo(userInput, sallieResponse)
        
        // Update personalization based on interaction
        updatePersonalizationFromConversation(userInput, sallieResponse)
    }
    
    /**
     * Generate personalized insights based on memory patterns
     */
    fun generatePersonalizedInsights(): List<ContextualInsight> {
        val insights = mutableListOf<ContextualInsight>()
        
        // Analyze communication patterns
        val commInsights = analyzeCommuicationPatterns()
        insights.addAll(commInsights)
        
        // Analyze task patterns
        val taskInsights = analyzeTaskPatterns()
        insights.addAll(taskInsights)
        
        // Analyze emotional patterns
        val emotionalInsights = analyzeEmotionalPatterns()
        insights.addAll(emotionalInsights)
        
        // Analyze temporal patterns
        val temporalInsights = analyzeTemporalPatterns()
        insights.addAll(temporalInsights)
        
        contextualInsights.addAll(insights)
        return insights.sortedByDescending { it.confidence }
    }
    
    /**
     * Get personalization profile for other systems
     */
    fun getPersonalizationProfile(): PersonalizationProfile = personalizationProfile
    
    /**
     * Update learning weight for memories based on success
     */
    fun reinforceMemory(key: String, effectiveness: Double) {
        personalContext[key]?.let { memory ->
            memory.learningWeight = (memory.learningWeight * 0.9 + effectiveness * 0.1)
                .coerceIn(0.1, 2.0)
            memory.lastAccess = System.currentTimeMillis()
        }
    }
    
    /**
     * Find related memories through semantic connections
     */
    fun findRelatedMemories(key: String, depth: Int = 2): List<MemoryItem> {
        val related = mutableSetOf<String>()
        val toExplore = mutableSetOf(key)
        
        repeat(depth) {
            val currentLevel = toExplore.toSet()
            toExplore.clear()
            
            currentLevel.forEach { currentKey ->
                semanticConnections[currentKey]?.forEach { relatedKey ->
                    if (relatedKey !in related && relatedKey != key) {
                        related.add(relatedKey)
                        toExplore.add(relatedKey)
                    }
                }
            }
        }
        
        return related.mapNotNull { personalContext[it] }
            .sortedByDescending { it.effectiveScore() }
    }
    
    /**
     * Get conversation context for AI systems
     */
    fun getRecentConversationContext(limit: Int = 10): List<Pair<String, String>> {
        return conversationHistory.takeLast(limit)
    }
    
    /**
     * Export personalization data for backup/sync
     */
    fun exportPersonalizationData(): Map<String, Any> {
        return mapOf(
            "preferences" to personalizationProfile.preferences,
            "communication_style" to personalizationProfile.communication_style,
            "task_patterns" to personalizationProfile.task_patterns,
            "emotional_patterns" to personalizationProfile.emotional_patterns,
            "learning_preferences" to personalizationProfile.learning_preferences,
            "key_memories" to topMemories(20).map { 
                mapOf(
                    "key" to it.key,
                    "value" to it.value,
                    "category" to it.category,
                    "priority" to it.priority,
                    "personal_relevance" to it.personalRelevance
                )
            },
            "insights" to contextualInsights.takeLast(10)
        )
    }

    
    fun boost(key: String, delta: Int = 5) {
        personalContext[key]?.let {
            it.priority = (it.priority + delta).coerceIn(0, 100)
            it.lastAccess = System.currentTimeMillis()
        }
    }

    fun recall(key: String): String? {
        val item = personalContext[key]
        if (item != null) item.lastAccess = System.currentTimeMillis()
        return item?.value
    }

    fun addQuickCapture(item: String) {
        quickCapture.add(item)
        // Auto-categorize and remember important captures
        if (item.length > 20) {
            remember("quick_capture_${System.currentTimeMillis()}", item, 60, "capture")
        }
    }
    
    fun getQuickCaptures(): List<String> = quickCapture
    fun getMemoryHistory(): List<MemoryItem> = memoryHistory
    fun fetchRecentMemories(limit: Int): List<String> = memoryHistory.takeLast(limit).map { "${it.key}=${it.value}" }

    fun topMemories(limit: Int = 10): List<MemoryItem> {
        val now = System.currentTimeMillis()
        return personalContext.values
            .sortedByDescending { it.effectiveScore(now) }
            .take(limit)
    }

    fun pruneAged(now: Long = System.currentTimeMillis()) {
        if (personalContext.size <= maxItems) return
        val sorted = personalContext.values.sortedBy { it.effectiveScore(now) }
        val toRemove = personalContext.size - pruneTarget
        sorted.take(toRemove).forEach { personalContext.remove(it.key) }
    }

    private fun enforceCapacity() {
        if (personalContext.size > maxItems) pruneAged()
    }
    
    // Private helper methods for enhanced functionality
    private fun calculateRelevanceScore(
        memory: MemoryItem,
        queryWords: Set<String>,
        contextWords: Set<String>
    ): Double {
        val memoryWords = (memory.key + " " + memory.value + " " + memory.category).lowercase().split(" ").toSet()
        
        // Calculate word overlap scores
        val queryOverlap = queryWords.intersect(memoryWords).size.toDouble() / queryWords.size.coerceAtLeast(1)
        val contextOverlap = if (contextWords.isNotEmpty()) {
            contextWords.intersect(memoryWords).size.toDouble() / contextWords.size
        } else 0.0
        
        // Combine with memory's inherent scores
        val baseScore = memory.effectiveScore()
        val semanticScore = semanticConnections[memory.key]?.size?.toDouble() ?: 0.0
        
        return (queryOverlap * 2.0) + (contextOverlap * 1.0) + (baseScore / 100.0) + (semanticScore / 10.0)
    }
    
    private fun buildSemanticConnections(key: String, value: String) {
        val words = (key + " " + value).lowercase().split(" ").filter { it.length > 3 }.toSet()
        
        personalContext.values.forEach { existingMemory ->
            val existingWords = (existingMemory.key + " " + existingMemory.value).lowercase().split(" ").toSet()
            val commonWords = words.intersect(existingWords)
            
            if (commonWords.size >= 2) {
                semanticConnections.computeIfAbsent(key) { mutableSetOf() }.add(existingMemory.key)
                semanticConnections.computeIfAbsent(existingMemory.key) { mutableSetOf() }.add(key)
            }
        }
    }
    
    private fun updatePersonalizationProfile(key: String, value: String, category: String) {
        personalizationProfile.lastUpdated = System.currentTimeMillis()
        
        // Update task patterns
        if (category == "task" || key.contains("task") || value.contains("complete")) {
            val taskType = extractTaskType(value)
            personalizationProfile.task_patterns[taskType] = 
                (personalizationProfile.task_patterns[taskType] ?: 0) + 1
        }
        
        // Update preferences based on content
        extractPreferences(value).forEach { (pref, weight) ->
            personalizationProfile.preferences[pref] = weight
        }
    }
    
    private fun extractAndRememberImportantInfo(userInput: String, sallieResponse: String) {
        val importantPatterns = listOf(
            "my name is", "i live", "i work", "i like", "i hate", "i prefer", 
            "remember that", "don't forget", "important:", "note:", "family", "birthday"
        )
        
        importantPatterns.forEach { pattern ->
            if (userInput.lowercase().contains(pattern)) {
                val context = extractContextAroundPattern(userInput, pattern)
                if (context.isNotEmpty()) {
                    remember(
                        key = "user_info_${pattern.replace(" ", "_")}", 
                        value = context,
                        priority = 80,
                        category = "personal",
                        personalRelevance = 1.0
                    )
                }
            }
        }
    }
    
    private fun updatePersonalizationFromConversation(userInput: String, sallieResponse: String) {
        // Analyze communication style preferences
        val userTone = analyzeTone(userInput)
        val responseEffectiveness = analyzeResponseEffectiveness(userInput, sallieResponse)
        
        personalizationProfile.communication_style[userTone] = 
            (personalizationProfile.communication_style[userTone] ?: 0.5) + 
            (responseEffectiveness * 0.1)
    }
    
    private fun analyzeCommuicationPatterns(): List<ContextualInsight> {
        val insights = mutableListOf<ContextualInsight>()
        
        val directnessScore = personalizationProfile.communication_style.values.average()
        if (directnessScore > 0.7) {
            insights.add(
                ContextualInsight(
                    "User prefers direct, concise communication",
                    0.8,
                    "communication",
                    listOf("task_assistance", "problem_solving")
                )
            )
        }
        
        return insights
    }
    
    private fun analyzeTaskPatterns(): List<ContextualInsight> {
        val insights = mutableListOf<ContextualInsight>()
        
        val taskFrequency = personalizationProfile.task_patterns
        val mostCommonTask = taskFrequency.maxByOrNull { it.value }
        
        if (mostCommonTask != null && mostCommonTask.value > 5) {
            insights.add(
                ContextualInsight(
                    "User frequently works with ${mostCommonTask.key} tasks",
                    0.9,
                    "task_optimization",
                    listOf("productivity", "automation")
                )
            )
        }
        
        return insights
    }
    
    private fun analyzeEmotionalPatterns(): List<ContextualInsight> {
        val insights = mutableListOf<ContextualInsight>()
        
        val emotionalMemories = personalContext.values.filter { it.emotionalContext.isNotEmpty() }
        if (emotionalMemories.isNotEmpty()) {
            val dominantEmotion = emotionalMemories
                .groupBy { it.emotionalContext }
                .maxByOrNull { it.value.size }?.key
            
            if (dominantEmotion != null) {
                insights.add(
                    ContextualInsight(
                        "User shows patterns of $dominantEmotion in challenging situations",
                        0.7,
                        "emotional_support",
                        listOf("stress_management", "encouragement")
                    )
                )
            }
        }
        
        return insights
    }
    
    private fun analyzeTemporalPatterns(): List<ContextualInsight> {
        val insights = mutableListOf<ContextualInsight>()
        
        val recentMemories = memoryHistory.filter { 
            System.currentTimeMillis() - it.created < 7 * 24 * 60 * 60 * 1000 // Last 7 days
        }
        
        if (recentMemories.size > 10) {
            insights.add(
                ContextualInsight(
                    "High activity level this week - user might benefit from organization support",
                    0.8,
                    "productivity",
                    listOf("task_management", "time_optimization")
                )
            )
        }
        
        return insights
    }
    
    private fun extractTaskType(value: String): String {
        val taskTypes = mapOf(
            "email" to listOf("email", "message", "send", "reply"),
            "meeting" to listOf("meeting", "call", "appointment", "schedule"),
            "document" to listOf("document", "write", "draft", "report"),
            "research" to listOf("research", "find", "look up", "investigate"),
            "organize" to listOf("organize", "sort", "clean", "arrange")
        )
        
        return taskTypes.entries.find { (_, keywords) ->
            keywords.any { value.lowercase().contains(it) }
        }?.key ?: "general"
    }
    
    private fun extractPreferences(value: String): Map<String, Double> {
        val preferences = mutableMapOf<String, Double>()
        
        when {
            value.contains("prefer") && value.contains("direct") -> preferences["directness"] = 0.8
            value.contains("like") && value.contains("detail") -> preferences["detail_level"] = 0.9
            value.contains("quick") || value.contains("fast") -> preferences["speed"] = 0.8
            value.contains("thorough") || value.contains("complete") -> preferences["thoroughness"] = 0.9
        }
        
        return preferences
    }
    
    private fun extractContextAroundPattern(input: String, pattern: String): String {
        val index = input.lowercase().indexOf(pattern)
        if (index == -1) return ""
        
        val start = (index - 10).coerceAtLeast(0)
        val end = (index + pattern.length + 30).coerceAtMost(input.length)
        
        return input.substring(start, end).trim()
    }
    
    private fun analyzeTone(input: String): String {
        return when {
            input.contains("!") || input.any { it.isUpperCase() } -> "assertive"
            input.contains("please") || input.contains("could you") -> "polite"
            input.split(" ").size < 5 -> "concise"
            else -> "conversational"
        }
    }
    
    private fun analyzeResponseEffectiveness(userInput: String, sallieResponse: String): Double {
        // Simple heuristic - in real implementation, this would be more sophisticated
        return when {
            userInput.contains("thank") -> 0.9
            userInput.contains("yes") -> 0.8
            userInput.contains("no") || userInput.contains("wrong") -> 0.3
            else -> 0.6
        }
    }
}

/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Enhanced adaptive learning with pattern recognition and experiential learning.
 * Got it, love.
 */
package com.sallie.core.learning

import com.sallie.core.memory.HierarchicalMemorySystem
import com.sallie.core.memory.EnhancedMemoryManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.concurrent.ConcurrentHashMap
import java.time.Instant

/**
 * EnhancedLearningEngine expands Sallie's adaptive learning capabilities
 * with advanced pattern recognition, experiential learning, and knowledge synthesis.
 */
class EnhancedLearningEngine(
    private val memoryManager: EnhancedMemoryManager
) {
    
    /**
     * Represents a pattern that has been identified through learning
     */
    data class RecognizedPattern(
        val id: String,
        val name: String,
        val description: String,
        val patternType: PatternType,
        val recognitionRules: List<RecognitionRule>,
        val confidence: Double,
        val timesObserved: Int,
        val lastObserved: Long,
        val relatedMemoryIds: MutableList<String>,
        val examples: List<String>
    ) {
        fun matchesInput(input: String, context: Map<String, Any>): Boolean {
            return recognitionRules.any { it.matches(input, context) }
        }
        
        fun incrementObservation() = copy(
            timesObserved = timesObserved + 1,
            lastObserved = System.currentTimeMillis(),
            confidence = calculateNewConfidence(confidence, timesObserved + 1)
        )
        
        private fun calculateNewConfidence(currentConfidence: Double, observations: Int): Double {
            // Sigmoid function that approaches 1.0 as observations increase
            return 1.0 - (1.0 / (1.0 + 0.1 * observations))
        }
    }
    
    /**
     * Defines the type of pattern
     */
    enum class PatternType {
        USER_PREFERENCE, // User likes/dislikes
        BEHAVIORAL,      // User behavior patterns
        LANGUAGE,        // User language patterns
        TEMPORAL,        // Time-based patterns
        CONTEXTUAL,      // Context-specific patterns
        TASK,            // Task execution patterns
        EMOTIONAL        // Emotional response patterns
    }
    
    /**
     * Interface for pattern recognition rules
     */
    interface RecognitionRule {
        fun matches(input: String, context: Map<String, Any>): Boolean
    }
    
    /**
     * Simple keyword-based recognition rule
     */
    data class KeywordRule(val keywords: List<String>, val allRequired: Boolean = false) : RecognitionRule {
        override fun matches(input: String, context: Map<String, Any>): Boolean {
            val lowercaseInput = input.lowercase()
            return if (allRequired) {
                keywords.all { lowercaseInput.contains(it.lowercase()) }
            } else {
                keywords.any { lowercaseInput.contains(it.lowercase()) }
            }
        }
    }
    
    /**
     * Context-based recognition rule
     */
    data class ContextRule(val contextKey: String, val expectedValue: Any) : RecognitionRule {
        override fun matches(input: String, context: Map<String, Any>): Boolean {
            return context[contextKey] == expectedValue
        }
    }
    
    /**
     * Temporal rule based on time conditions
     */
    data class TimeRule(val timeRanges: List<Pair<Int, Int>>) : RecognitionRule {
        override fun matches(input: String, context: Map<String, Any>): Boolean {
            val currentHour = java.time.LocalTime.now().hour
            return timeRanges.any { (start, end) -> currentHour in start..end }
        }
    }
    
    /**
     * Composite rule combining multiple rules with AND logic
     */
    data class CompositeRule(val rules: List<RecognitionRule>) : RecognitionRule {
        override fun matches(input: String, context: Map<String, Any>): Boolean {
            return rules.all { it.matches(input, context) }
        }
    }
    
    /**
     * Represents a learned skill or capability
     */
    data class LearnedSkill(
        val id: String,
        val name: String,
        val description: String,
        val proficiency: Double, // 0.0 to 1.0
        val knowledgeComponents: List<String>, // Memory IDs for knowledge components
        val prerequisites: List<String>, // IDs of prerequisite skills
        val practiceCount: Int,
        val lastPracticed: Long,
        val createdAt: Long = System.currentTimeMillis(),
        val tags: List<String>
    ) {
        fun withIncreasedProficiency(increment: Double): LearnedSkill {
            return copy(
                proficiency = (proficiency + increment).coerceIn(0.0, 1.0),
                practiceCount = practiceCount + 1,
                lastPracticed = System.currentTimeMillis()
            )
        }
    }
    
    /**
     * Represents an insight synthesized from multiple pieces of knowledge
     */
    data class SynthesizedInsight(
        val id: String,
        val insight: String,
        val confidence: Double,
        val sourceMemoryIds: List<String>,
        val createdAt: Long = System.currentTimeMillis(),
        val category: String,
        val applicationDomains: List<String>
    )
    
    // Storage for patterns, skills, and insights
    private val recognizedPatterns = ConcurrentHashMap<String, RecognizedPattern>()
    private val learnedSkills = ConcurrentHashMap<String, LearnedSkill>()
    private val synthesizedInsights = ConcurrentHashMap<String, SynthesizedInsight>()
    
    // Learning parameters
    private var patternConfidenceThreshold = 0.7
    private var insightSynthesisThreshold = 0.6
    private var experientialLearningRate = 0.05 // How quickly proficiency increases with practice
    
    /**
     * Process new user input to identify patterns
     */
    fun processInput(
        input: String, 
        context: Map<String, Any>, 
        outcome: String?,
        effectiveness: Double?
    ) {
        // Check for matches against existing patterns
        val matchingPatterns = recognizedPatterns.values
            .filter { it.matchesInput(input, context) }
            
        // Update existing patterns
        matchingPatterns.forEach { pattern ->
            recognizedPatterns[pattern.id] = pattern.incrementObservation()
            
            // Store memory of this observation
            val memoryContent = "Observed pattern '${pattern.name}' in interaction: $input"
            val memoryId = memoryManager.createSemanticMemory(
                content = memoryContent,
                certainty = pattern.confidence
            )
            
            // Connect to pattern memory
            pattern.relatedMemoryIds.add(memoryId)
        }
        
        // Try to identify new patterns if outcome is provided
        if (outcome != null && effectiveness != null) {
            identifyNewPatterns(input, context, outcome, effectiveness)
        }
    }
    
    /**
     * Attempt to identify new patterns from user interactions
     */
    private fun identifyNewPatterns(
        input: String,
        context: Map<String, Any>,
        outcome: String,
        effectiveness: Double
    ) {
        // Only look for patterns in effective interactions
        if (effectiveness < 0.5) return
        
        // Extract potential keywords
        val keywords = input.lowercase()
            .split(Regex("\\s+|\\p{Punct}"))
            .filter { it.length > 3 }
            .take(5)
        
        // Check if context contains temporal information
        val timeOfDay = extractTimeOfDay(context)
        
        // Create potential pattern types to investigate
        val patternCandidates = mutableListOf<Pair<PatternType, List<RecognitionRule>>>()
        
        // Add keyword pattern
        if (keywords.isNotEmpty()) {
            patternCandidates.add(
                PatternType.LANGUAGE to listOf(KeywordRule(keywords, false))
            )
        }
        
        // Add temporal pattern if time is available
        if (timeOfDay != null) {
            val hourRange = when (timeOfDay) {
                "morning" -> 5 to 11
                "afternoon" -> 12 to 17
                "evening" -> 18 to 22
                else -> 23 to 4
            }
            
            patternCandidates.add(
                PatternType.TEMPORAL to listOf(TimeRule(listOf(hourRange)))
            )
        }
        
        // Add contextual patterns for available context keys
        context.forEach { (key, value) ->
            if (value is String || value is Number || value is Boolean) {
                patternCandidates.add(
                    PatternType.CONTEXTUAL to listOf(ContextRule(key, value))
                )
            }
        }
        
        // Create pattern for each candidate type
        patternCandidates.forEach { (type, rules) ->
            val patternId = "pattern_${System.currentTimeMillis()}_${type.name}"
            val patternName = "Pattern_${type.name}_${System.currentTimeMillis() % 1000}"
            val description = "Automatically identified ${type.name.lowercase()} pattern from user interaction"
            
            val pattern = RecognizedPattern(
                id = patternId,
                name = patternName,
                description = description,
                patternType = type,
                recognitionRules = rules,
                confidence = 0.3, // Start with low confidence
                timesObserved = 1,
                lastObserved = System.currentTimeMillis(),
                relatedMemoryIds = mutableListOf(),
                examples = listOf(input)
            )
            
            // Store initial pattern
            recognizedPatterns[patternId] = pattern
            
            // Create memory for the new pattern
            val memoryContent = "Identified potential new pattern: $description based on interaction: $input"
            val memoryId = memoryManager.createSemanticMemory(
                content = memoryContent,
                certainty = pattern.confidence
            )
            
            // Connect memory to pattern
            pattern.relatedMemoryIds.add(memoryId)
        }
    }
    
    /**
     * Extract time of day from context
     */
    private fun extractTimeOfDay(context: Map<String, Any>): String? {
        // Try to get time from context first
        val contextTime = context["timeOfDay"] as? String
        if (contextTime != null) {
            return contextTime
        }
        
        // Otherwise calculate from current time
        val hour = java.time.LocalTime.now().hour
        return when (hour) {
            in 5..11 -> "morning"
            in 12..17 -> "afternoon"
            in 18..22 -> "evening"
            else -> "night"
        }
    }
    
    /**
     * Learn from structured knowledge to create a new skill
     */
    fun learnSkill(
        skillName: String,
        description: String,
        knowledgeContent: List<String>,
        tags: List<String> = emptyList(),
        prerequisites: List<String> = emptyList()
    ): String {
        // Create memory entries for each knowledge component
        val knowledgeMemoryIds = knowledgeContent.map { content ->
            memoryManager.createProceduralMemory(
                content = content,
                proficiency = 0.3 // Start with basic understanding
            )
        }
        
        // Create the skill
        val skillId = "skill_${System.currentTimeMillis()}"
        val skill = LearnedSkill(
            id = skillId,
            name = skillName,
            description = description,
            proficiency = 0.3, // Start with basic proficiency
            knowledgeComponents = knowledgeMemoryIds,
            prerequisites = prerequisites,
            practiceCount = 0,
            lastPracticed = System.currentTimeMillis(),
            tags = tags
        )
        
        // Store the skill
        learnedSkills[skillId] = skill
        
        // Create a memory for this new skill
        val memoryContent = "Learned new skill: $skillName - $description"
        val memoryId = memoryManager.createProceduralMemory(
            content = memoryContent,
            proficiency = 0.3,
            metadata = mapOf(
                "skillId" to skillId,
                "knowledgeComponents" to knowledgeMemoryIds
            )
        )
        
        // Connect memories
        knowledgeMemoryIds.forEach { componentId ->
            memoryManager.getHierarchicalMemory().connectMemories(memoryId, componentId)
        }
        
        return skillId
    }
    
    /**
     * Practice a skill to improve proficiency
     */
    fun practiceSkill(skillId: String, practiceDescription: String): Double {
        // Get the skill
        val skill = learnedSkills[skillId] ?: return 0.0
        
        // Calculate proficiency increase based on current level
        // Lower proficiency increases faster, higher proficiency increases slower
        val baseIncrease = experientialLearningRate
        val diminishingFactor = skill.proficiency * skill.proficiency // Square to slow down high-end progress
        val actualIncrease = baseIncrease * (1.0 - diminishingFactor)
        
        // Update the skill
        val updatedSkill = skill.withIncreasedProficiency(actualIncrease)
        learnedSkills[skillId] = updatedSkill
        
        // Record practice in memory
        val memoryContent = "Practiced skill: ${skill.name} - $practiceDescription"
        val memoryId = memoryManager.createProceduralMemory(
            content = memoryContent,
            proficiency = updatedSkill.proficiency,
            metadata = mapOf(
                "skillId" to skillId,
                "practiceCount" to updatedSkill.practiceCount
            )
        )
        
        // Connect to existing skill memories
        val skillMemories = getMemoriesForSkill(skillId)
        skillMemories.forEach { skillMemoryId ->
            memoryManager.getHierarchicalMemory().connectMemories(memoryId, skillMemoryId)
        }
        
        return updatedSkill.proficiency
    }
    
    /**
     * Get all memories associated with a skill
     */
    private fun getMemoriesForSkill(skillId: String): List<String> {
        val skill = learnedSkills[skillId] ?: return emptyList()
        
        // Query hierarchical memory for memories mentioning this skill
        val query = HierarchicalMemorySystem.MemoryQuery(
            searchText = skill.name,
            types = setOf(HierarchicalMemorySystem.MemoryType.PROCEDURAL),
            limit = 50
        )
        
        val results = memoryManager.getHierarchicalMemory().searchMemories(query)
        return results.items.map { it.id }
    }
    
    /**
     * Synthesize insights from multiple knowledge components
     */
    fun synthesizeInsight(
        relatedMemoryIds: List<String>,
        category: String,
        applicationDomains: List<String>
    ): SynthesizedInsight? {
        if (relatedMemoryIds.size < 2) {
            return null // Need at least two memories to synthesize
        }
        
        // Get all the related memories
        val memories = relatedMemoryIds.mapNotNull { memoryManager.getHierarchicalMemory().getMemory(it) }
        
        // Check if we have enough valid memories
        if (memories.size < 2) {
            return null
        }
        
        // Extract content from memories
        val memoryContents = memories.map { it.content }
        val memoryTypes = memories.map { it.type }
        
        // Calculate confidence based on source memory certainty and variety of types
        val avgCertainty = memories.map { it.certainty }.average()
        val typeVariety = memoryTypes.toSet().size.toDouble() / memories.size
        val confidence = avgCertainty * (0.5 + 0.5 * typeVariety)
        
        // Only create insight if confidence is high enough
        if (confidence < insightSynthesisThreshold) {
            return null
        }
        
        // Generate insight text by combining related knowledge
        val combinedContext = memoryContents.joinToString(" | ")
        val insightContent = "Synthesized insight ($category): Connection between ${memoryContents.size} " +
                            "knowledge components reveals: ${generateInsightSummary(memoryContents)}"
        
        // Create insight object
        val insightId = "insight_${System.currentTimeMillis()}"
        val insight = SynthesizedInsight(
            id = insightId,
            insight = insightContent,
            confidence = confidence,
            sourceMemoryIds = relatedMemoryIds,
            category = category,
            applicationDomains = applicationDomains
        )
        
        // Store the insight
        synthesizedInsights[insightId] = insight
        
        // Create a memory for this insight
        val memoryId = memoryManager.createSemanticMemory(
            content = insightContent,
            certainty = confidence,
            metadata = mapOf(
                "insightId" to insightId,
                "category" to category,
                "applicationDomains" to applicationDomains
            )
        )
        
        // Connect insight memory to all source memories
        relatedMemoryIds.forEach { sourceId ->
            memoryManager.getHierarchicalMemory().connectMemories(memoryId, sourceId)
        }
        
        return insight
    }
    
    /**
     * Generate a summarized insight from memory contents
     * In a full implementation, this would use more sophisticated NLP techniques
     */
    private fun generateInsightSummary(memoryContents: List<String>): String {
        // Simplified implementation - extract key phrases and combine
        val keyPhrases = memoryContents.flatMap { content ->
            content.split(Regex("[.,;:]"))
                .filter { it.split(" ").size > 2 }
                .map { it.trim() }
        }.take(3)
        
        return "Relationship between ${keyPhrases.joinToString(" and ")} " +
               "suggests a pattern that can be applied across ${memoryContents.size} domains."
    }
    
    /**
     * Identify potential relationships between memories to create insights
     */
    fun discoverRelationships(): List<SynthesizedInsight> {
        val insights = mutableListOf<SynthesizedInsight>()
        
        // Find memories with matching tags or content keywords
        val semanticMemories = memoryManager.getHierarchicalMemory().searchMemories(
            HierarchicalMemorySystem.MemoryQuery(
                types = setOf(HierarchicalMemorySystem.MemoryType.SEMANTIC),
                limit = 100
            )
        ).items
        
        // Group by potential relationships (simplified)
        val contentKeywords = semanticMemories.flatMap { memory ->
            extractKeywords(memory.content).map { keyword -> keyword to memory.id }
        }.groupBy({ it.first }, { it.second })
        
        // Find groups with multiple memories
        contentKeywords.forEach { (keyword, memoryIds) ->
            if (memoryIds.size > 1 && memoryIds.distinct().size > 1) {
                val category = determineCategory(keyword)
                val insight = synthesizeInsight(
                    relatedMemoryIds = memoryIds.distinct(),
                    category = category,
                    applicationDomains = listOf(category)
                )
                
                if (insight != null) {
                    insights.add(insight)
                }
            }
        }
        
        return insights
    }
    
    /**
     * Extract keywords from content
     */
    private fun extractKeywords(content: String): List<String> {
        return content.lowercase()
            .split(Regex("\\s+|\\p{Punct}"))
            .filter { it.length > 4 }
            .distinct()
    }
    
    /**
     * Determine a category based on a keyword
     */
    private fun determineCategory(keyword: String): String {
        // This would be more sophisticated in a real implementation
        return when {
            keyword.contains("work") || keyword.contains("job") || keyword.contains("career") -> "professional"
            keyword.contains("learn") || keyword.contains("study") || keyword.contains("education") -> "educational"
            keyword.contains("family") || keyword.contains("friend") || keyword.contains("relationship") -> "personal"
            keyword.contains("health") || keyword.contains("exercise") || keyword.contains("diet") -> "wellness"
            else -> "general"
        }
    }
    
    /**
     * Get all recognized patterns
     */
    fun getRecognizedPatterns(): List<RecognizedPattern> {
        return recognizedPatterns.values.toList()
    }
    
    /**
     * Get all learned skills
     */
    fun getLearnedSkills(): List<LearnedSkill> {
        return learnedSkills.values.toList()
    }
    
    /**
     * Get all synthesized insights
     */
    fun getSynthesizedInsights(): List<SynthesizedInsight> {
        return synthesizedInsights.values.toList()
    }
    
    /**
     * Get a specific learned skill
     */
    fun getSkill(skillId: String): LearnedSkill? {
        return learnedSkills[skillId]
    }
    
    /**
     * Get skill proficiency
     */
    fun getSkillProficiency(skillId: String): Double {
        return learnedSkills[skillId]?.proficiency ?: 0.0
    }
    
    /**
     * Run learning consolidation - review and strengthen patterns/skills/insights
     */
    fun consolidateLearning() {
        // Prune low-confidence patterns
        val patternsToRemove = recognizedPatterns.values
            .filter { it.confidence < 0.3 && it.timesObserved < 3 && 
                     (System.currentTimeMillis() - it.lastObserved) > 7 * 24 * 60 * 60 * 1000 }
            .map { it.id }
            
        patternsToRemove.forEach { recognizedPatterns.remove(it) }
        
        // Consolidate memory to reflect learning
        memoryManager.consolidateMemories()
        
        // Discover new insights
        discoverRelationships()
    }
}

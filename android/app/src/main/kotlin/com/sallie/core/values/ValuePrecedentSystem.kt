package com.sallie.core.values

import com.sallie.core.memory.EnhancedMemoryManager
import com.sallie.core.memory.MemoryPriority
import com.sallie.core.memory.MemoryQuery

/**
 * ValuePrecedentSystem enables Sallie to learn from past value judgments
 * and build a consistent ethical framework based on precedents.
 * It stores, retrieves, and applies value precedents to ensure
 * consistent ethical reasoning over time.
 */
class ValuePrecedentSystem(
    private val valuesSystem: ValuesSystem,
    private val memoryManager: EnhancedMemoryManager
) {
    // Cache of recently used precedents for quick access
    private val recentPrecedentCache = mutableMapOf<String, ValuePrecedent>()
    
    // Count of each precedent's application
    private val precedentUsageCount = mutableMapOf<String, Int>()
    
    /**
     * Record a new value precedent from a decision
     */
    fun recordPrecedent(
        situation: String,
        decision: String,
        reasoning: String,
        priority: PrecedentPriority,
        relatedValues: List<String>,
        tags: List<String> = emptyList()
    ): ValuePrecedent {
        // Create a unique ID for the precedent
        val precedentId = generatePrecedentId(situation)
        
        // Create the precedent
        val precedent = ValuePrecedent(
            id = precedentId,
            situation = situation,
            decision = decision,
            reasoning = reasoning,
            timestamp = System.currentTimeMillis(),
            priority = priority,
            relatedValues = relatedValues,
            tags = tags,
            usageCount = 0
        )
        
        // Store in memory
        memoryManager.storeMemory(
            type = "VALUE_PRECEDENT",
            content = serializePrecedent(precedent),
            tags = listOf("value-precedent") + tags + relatedValues,
            priority = convertPrecedentPriority(priority),
            metadata = mapOf(
                "precedentId" to precedentId,
                "decision" to decision,
                "relatedValues" to relatedValues.joinToString(",")
            )
        )
        
        // Add to cache
        recentPrecedentCache[precedentId] = precedent
        
        return precedent
    }
    
    /**
     * Find precedents relevant to a given situation
     */
    fun findRelevantPrecedents(situation: String, maxResults: Int = 5): List<ValuePrecedent> {
        // Query memory for relevant precedents
        val query = MemoryQuery(
            type = "VALUE_PRECEDENT",
            contentQuery = situation,
            maxResults = maxResults
        )
        
        val memories = memoryManager.searchMemories(query)
        
        // Convert memories to precedents
        return memories.mapNotNull { memory ->
            val precedentId = memory.metadata["precedentId"] ?: return@mapNotNull null
            
            // Check cache first
            recentPrecedentCache[precedentId] ?: deserializePrecedent(memory.content)
        }
    }
    
    /**
     * Find precedents by related value
     */
    fun findPrecedentsByValue(value: String, maxResults: Int = 10): List<ValuePrecedent> {
        // Query memory for precedents related to this value
        val query = MemoryQuery(
            type = "VALUE_PRECEDENT",
            tags = listOf(value),
            maxResults = maxResults
        )
        
        val memories = memoryManager.searchMemories(query)
        
        // Convert memories to precedents
        return memories.mapNotNull { memory ->
            val precedentId = memory.metadata["precedentId"] ?: return@mapNotNull null
            
            // Check cache first
            recentPrecedentCache[precedentId] ?: deserializePrecedent(memory.content)
        }
    }
    
    /**
     * Apply a precedent to a current situation
     */
    fun applyPrecedent(precedentId: String, situation: String): PrecedentApplication {
        // Get the precedent
        val precedent = getPrecedent(precedentId) ?: return PrecedentApplication(
            applied = false,
            decision = null,
            reasoning = "Precedent not found",
            precedent = null,
            similarityScore = 0.0f
        )
        
        // Calculate similarity between current situation and precedent situation
        val similarityScore = calculateSituationSimilarity(situation, precedent.situation)
        
        // Decide whether to apply the precedent
        val shouldApply = similarityScore > 0.7f
        
        // If applying, update usage count
        if (shouldApply) {
            incrementPrecedentUsage(precedentId)
        }
        
        // Generate reasoning for application or non-application
        val applicationReasoning = if (shouldApply) {
            "Applied precedent '${precedent.id}' due to high similarity (${String.format("%.2f", similarityScore)}) " +
            "with current situation. Previous decision was: ${precedent.decision}"
        } else {
            "Did not apply precedent '${precedent.id}' due to insufficient similarity " +
            "(${String.format("%.2f", similarityScore)}) with current situation."
        }
        
        return PrecedentApplication(
            applied = shouldApply,
            decision = if (shouldApply) precedent.decision else null,
            reasoning = applicationReasoning,
            precedent = precedent,
            similarityScore = similarityScore
        )
    }
    
    /**
     * Get most frequently used precedents
     */
    fun getMostUsedPrecedents(count: Int = 10): List<ValuePrecedent> {
        // Get IDs of most used precedents
        val mostUsedIds = precedentUsageCount.entries
            .sortedByDescending { it.value }
            .take(count)
            .map { it.key }
        
        // Fetch the precedents
        return mostUsedIds.mapNotNull { getPrecedent(it) }
    }
    
    /**
     * Get a precedent by ID
     */
    fun getPrecedent(precedentId: String): ValuePrecedent? {
        // Check cache first
        recentPrecedentCache[precedentId]?.let { return it }
        
        // Query memory
        val query = MemoryQuery(
            metadata = mapOf("precedentId" to precedentId),
            maxResults = 1
        )
        
        val memories = memoryManager.searchMemories(query)
        
        // If found, deserialize, cache, and return
        if (memories.isNotEmpty()) {
            val precedent = deserializePrecedent(memories.first().content) ?: return null
            recentPrecedentCache[precedentId] = precedent
            return precedent
        }
        
        return null
    }
    
    /**
     * Get conflicting precedents for analysis
     */
    fun findConflictingPrecedents(maxPairs: Int = 3): List<Pair<ValuePrecedent, ValuePrecedent>> {
        // In a real implementation, this would use a more sophisticated algorithm
        // to identify genuinely conflicting precedents
        
        // For simplicity, we'll focus on precedents with opposing decisions but similar values
        val allPrecedents = getAllPrecedents(50)
        val conflictPairs = mutableListOf<Pair<ValuePrecedent, ValuePrecedent>>()
        
        // Compare precedents to find conflicts
        for (i in allPrecedents.indices) {
            for (j in i + 1 until allPrecedents.size) {
                val p1 = allPrecedents[i]
                val p2 = allPrecedents[j]
                
                // Check for conflicting decisions
                if (areDecisionsConflicting(p1.decision, p2.decision)) {
                    // Check if they share values
                    val sharedValues = p1.relatedValues.intersect(p2.relatedValues.toSet())
                    
                    if (sharedValues.isNotEmpty()) {
                        conflictPairs.add(Pair(p1, p2))
                        
                        if (conflictPairs.size >= maxPairs) {
                            return conflictPairs
                        }
                    }
                }
            }
        }
        
        return conflictPairs
    }
    
    /**
     * Analyze a value conflict using precedents
     */
    fun analyzeValueConflict(values: List<String>): ValueConflictAnalysis {
        if (values.size < 2) {
            return ValueConflictAnalysis(
                values = values,
                precedentCounts = mapOf(),
                dominantValue = values.firstOrNull(),
                reasoning = "Need at least two values to analyze a conflict",
                conflictResolutionApproach = "N/A"
            )
        }
        
        // Get precedents for each value
        val precedentsByValue = values.associateWith { value ->
            findPrecedentsByValue(value, 10)
        }
        
        // Count precedents
        val precedentCounts = precedentsByValue.mapValues { it.value.size }
        
        // Find dominant value (most precedents)
        val dominantValue = precedentCounts.entries
            .sortedByDescending { it.value }
            .firstOrNull()?.key
        
        // Analyze approach patterns
        val resolutionApproaches = analyzeResolutionApproaches(precedentsByValue)
        
        // Formulate reasoning
        val reasoning = if (dominantValue != null) {
            "Based on precedent analysis, '$dominantValue' has been prioritized in ${precedentCounts[dominantValue]} " +
            "previous situations, making it the dominant value in this conflict."
        } else {
            "No clear dominant value found in the precedent record."
        }
        
        return ValueConflictAnalysis(
            values = values,
            precedentCounts = precedentCounts,
            dominantValue = dominantValue,
            reasoning = reasoning,
            conflictResolutionApproach = resolutionApproaches
        )
    }
    
    /**
     * Get all precedents up to a limit
     */
    private fun getAllPrecedents(limit: Int): List<ValuePrecedent> {
        // Query memory for all precedents
        val query = MemoryQuery(
            type = "VALUE_PRECEDENT",
            maxResults = limit
        )
        
        val memories = memoryManager.searchMemories(query)
        
        // Convert memories to precedents
        return memories.mapNotNull { memory ->
            val precedentId = memory.metadata["precedentId"] ?: return@mapNotNull null
            
            // Check cache first
            recentPrecedentCache[precedentId] ?: deserializePrecedent(memory.content)
        }
    }
    
    /**
     * Increment usage count for a precedent
     */
    private fun incrementPrecedentUsage(precedentId: String) {
        // Update count
        precedentUsageCount[precedentId] = (precedentUsageCount[precedentId] ?: 0) + 1
        
        // Update precedent in cache
        recentPrecedentCache[precedentId]?.let { precedent ->
            recentPrecedentCache[precedentId] = precedent.copy(usageCount = precedent.usageCount + 1)
        }
        
        // Store updated usage in memory
        getPrecedent(precedentId)?.let { precedent ->
            memoryManager.storeMemory(
                type = "VALUE_PRECEDENT",
                content = serializePrecedent(precedent.copy(usageCount = precedent.usageCount + 1)),
                tags = listOf("value-precedent") + precedent.tags + precedent.relatedValues,
                priority = convertPrecedentPriority(precedent.priority),
                metadata = mapOf(
                    "precedentId" to precedentId,
                    "decision" to precedent.decision,
                    "relatedValues" to precedent.relatedValues.joinToString(",")
                )
            )
        }
    }
    
    /**
     * Calculate similarity between two situations
     */
    private fun calculateSituationSimilarity(situation1: String, situation2: String): Float {
        // In a real implementation, this would use semantic similarity
        // For now, use a simple text similarity approach
        
        // Tokenize
        val tokens1 = situation1.toLowerCase().split(Regex("\\W+"))
        val tokens2 = situation2.toLowerCase().split(Regex("\\W+"))
        
        // Calculate Jaccard similarity
        val intersection = tokens1.toSet().intersect(tokens2.toSet()).size
        val union = tokens1.toSet().union(tokens2.toSet()).size
        
        return intersection.toFloat() / union.toFloat()
    }
    
    /**
     * Generate a unique ID for a precedent
     */
    private fun generatePrecedentId(situation: String): String {
        val timestamp = System.currentTimeMillis()
        val hash = situation.hashCode().toString().replace("-", "")
        return "precedent-$hash-$timestamp"
    }
    
    /**
     * Convert precedent priority to memory priority
     */
    private fun convertPrecedentPriority(precedentPriority: PrecedentPriority): MemoryPriority {
        return when (precedentPriority) {
            PrecedentPriority.LOW -> MemoryPriority.LOW
            PrecedentPriority.MEDIUM -> MemoryPriority.MEDIUM
            PrecedentPriority.HIGH -> MemoryPriority.HIGH
            PrecedentPriority.CRITICAL -> MemoryPriority.CRITICAL
        }
    }
    
    /**
     * Analyze value conflict resolution approaches from precedents
     */
    private fun analyzeResolutionApproaches(precedentsByValue: Map<String, List<ValuePrecedent>>): String {
        // In a real implementation, this would use NLP to analyze decision patterns
        // For now, return a simple explanation
        return "Based on past precedents, value conflicts are typically resolved by " +
               "considering precedent count, value priority, and situational context."
    }
    
    /**
     * Determine if two decisions conflict
     */
    private fun areDecisionsConflicting(decision1: String, decision2: String): Boolean {
        // In a real implementation, this would use semantic understanding
        // For now, use a simple heuristic based on negation words
        val negationWords = listOf("not", "avoid", "don't", "doesn't", "cannot", "reject", "refuse")
        
        // Check if one contains negation words and the other doesn't
        val containsNegation1 = negationWords.any { decision1.toLowerCase().contains(it) }
        val containsNegation2 = negationWords.any { decision2.toLowerCase().contains(it) }
        
        return containsNegation1 != containsNegation2
    }
    
    /**
     * Serialize a precedent to string for storage
     */
    private fun serializePrecedent(precedent: ValuePrecedent): String {
        // In a real implementation, this would use proper serialization
        // For now, use a simple format
        return """
            |ID: ${precedent.id}
            |SITUATION: ${precedent.situation}
            |DECISION: ${precedent.decision}
            |REASONING: ${precedent.reasoning}
            |TIMESTAMP: ${precedent.timestamp}
            |PRIORITY: ${precedent.priority}
            |VALUES: ${precedent.relatedValues.joinToString(",")}
            |TAGS: ${precedent.tags.joinToString(",")}
            |USAGE: ${precedent.usageCount}
        """.trimMargin()
    }
    
    /**
     * Deserialize a precedent from string storage
     */
    private fun deserializePrecedent(content: String): ValuePrecedent? {
        // In a real implementation, this would use proper deserialization
        // For now, parse the simple format
        
        try {
            val lines = content.lines()
            val id = lines.find { it.startsWith("ID:") }?.substringAfter("ID:")?.trim()
            val situation = lines.find { it.startsWith("SITUATION:") }?.substringAfter("SITUATION:")?.trim()
            val decision = lines.find { it.startsWith("DECISION:") }?.substringAfter("DECISION:")?.trim()
            val reasoning = lines.find { it.startsWith("REASONING:") }?.substringAfter("REASONING:")?.trim()
            val timestamp = lines.find { it.startsWith("TIMESTAMP:") }?.substringAfter("TIMESTAMP:")?.trim()?.toLongOrNull()
            val priority = lines.find { it.startsWith("PRIORITY:") }?.substringAfter("PRIORITY:")?.trim()
            val values = lines.find { it.startsWith("VALUES:") }?.substringAfter("VALUES:")?.trim()?.split(",")
            val tags = lines.find { it.startsWith("TAGS:") }?.substringAfter("TAGS:")?.trim()?.split(",")
            val usage = lines.find { it.startsWith("USAGE:") }?.substringAfter("USAGE:")?.trim()?.toIntOrNull()
            
            if (id != null && situation != null && decision != null && reasoning != null && timestamp != null) {
                return ValuePrecedent(
                    id = id,
                    situation = situation,
                    decision = decision,
                    reasoning = reasoning,
                    timestamp = timestamp,
                    priority = priorityFromString(priority ?: "MEDIUM"),
                    relatedValues = values ?: emptyList(),
                    tags = tags ?: emptyList(),
                    usageCount = usage ?: 0
                )
            }
        } catch (e: Exception) {
            // Log error in a real implementation
        }
        
        return null
    }
    
    /**
     * Convert string to precedent priority
     */
    private fun priorityFromString(priority: String): PrecedentPriority {
        return when (priority.toUpperCase()) {
            "LOW" -> PrecedentPriority.LOW
            "MEDIUM" -> PrecedentPriority.MEDIUM
            "HIGH" -> PrecedentPriority.HIGH
            "CRITICAL" -> PrecedentPriority.CRITICAL
            else -> PrecedentPriority.MEDIUM
        }
    }
}

/**
 * Precedent priority levels
 */
enum class PrecedentPriority {
    LOW,
    MEDIUM,
    HIGH,
    CRITICAL
}

/**
 * Value precedent data class
 */
data class ValuePrecedent(
    val id: String,
    val situation: String,
    val decision: String,
    val reasoning: String,
    val timestamp: Long,
    val priority: PrecedentPriority,
    val relatedValues: List<String>,
    val tags: List<String> = emptyList(),
    val usageCount: Int = 0
)

/**
 * Result of applying a precedent
 */
data class PrecedentApplication(
    val applied: Boolean,
    val decision: String?,
    val reasoning: String,
    val precedent: ValuePrecedent?,
    val similarityScore: Float
)

/**
 * Analysis of a value conflict
 */
data class ValueConflictAnalysis(
    val values: List<String>,
    val precedentCounts: Map<String, Int>,
    val dominantValue: String?,
    val reasoning: String,
    val conflictResolutionApproach: String
)

package com.sallie.core.memory

import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
import java.util.*
import kotlin.math.exp

/**
 * Sallie's Advanced Memory Retrieval System
 * 
 * Implements sophisticated memory retrieval algorithms for human-like recall,
 * including context-based retrieval, associative retrieval, and emotional context
 * sensitivity. The system mimics human memory by prioritizing recent, emotionally
 * significant, and frequently accessed memories, with capabilities for both
 * targeted and associative recall patterns.
 */
class AdvancedMemoryRetrievalSystem {
    // Memory stores
    private var episodicMemoryStore: EpisodicMemoryStore? = null
    private var semanticMemoryStore: SemanticMemoryStore? = null
    private var emotionalMemoryStore: EmotionalMemoryStore? = null
    private var workingMemoryManager: WorkingMemoryManager? = null
    private var memoryIndexer: MemoryIndexer? = null
    private var memoryAssociationEngine: MemoryAssociationEngine? = null
    
    // Reference to reinforcement system to update access patterns
    private var reinforcementSystem: MemoryReinforcementSystem? = null
    
    /**
     * Initialize the retrieval system with necessary components
     */
    fun initialize(
        episodicStore: EpisodicMemoryStore,
        semanticStore: SemanticMemoryStore,
        emotionalStore: EmotionalMemoryStore,
        workingMemory: WorkingMemoryManager,
        indexer: MemoryIndexer,
        associationEngine: MemoryAssociationEngine,
        reinforcement: MemoryReinforcementSystem
    ) {
        episodicMemoryStore = episodicStore
        semanticMemoryStore = semanticStore
        emotionalMemoryStore = emotionalStore
        workingMemoryManager = workingMemory
        memoryIndexer = indexer
        memoryAssociationEngine = associationEngine
        reinforcementSystem = reinforcement
    }
    
    /**
     * Retrieve memories by query with advanced filtering options
     * 
     * @param query The search query
     * @param memoryTypes Types of memories to search
     * @param filters Additional filters to apply
     * @param limit Max number of results
     * @param emotionalContext Emotional context for retrieval sensitivity
     * @return List of retrieved memories with relevance scores
     */
    suspend fun retrieveMemories(
        query: String,
        memoryTypes: Set<MemoryType> = setOf(MemoryType.EPISODIC, MemoryType.SEMANTIC, MemoryType.EMOTIONAL),
        filters: MemoryFilters = MemoryFilters(),
        limit: Int = 10,
        emotionalContext: EmotionalValence = EmotionalValence.NEUTRAL
    ): List<ScoredMemory> = coroutineScope {
        val indexer = memoryIndexer ?: return@coroutineScope emptyList()
        
        // First, retrieve potentially relevant memories using the indexer
        val retrievalTasks = memoryTypes.map { memoryType ->
            async {
                val indexResults = indexer.searchByQuery(query, memoryType, limit * 2)
                indexResults.mapNotNull { (memoryId, score) ->
                    val memory = getMemoryByTypeAndId(memoryType, memoryId) ?: return@mapNotNull null
                    
                    // Apply filters
                    if (!memory.matchesFilters(filters)) {
                        return@mapNotNull null
                    }
                    
                    // Get the base relevance score from indexer
                    var finalScore = score
                    
                    // Adjust score based on strength factor
                    finalScore *= (0.5f + 0.5f * memory.strengthFactor)
                    
                    // Adjust score based on emotional context if applicable
                    finalScore *= calculateEmotionalContextFactor(memory, emotionalContext)
                    
                    // Adjust score based on recency if applicable
                    if (filters.recencyBias > 0) {
                        val recencyFactor = calculateRecencyFactor(memory.lastAccessTimestamp)
                        finalScore *= (1.0f - filters.recencyBias + filters.recencyBias * recencyFactor)
                    }
                    
                    ScoredMemory(memoryType, memory, finalScore)
                }
            }
        }
        
        // Combine and sort results
        val allResults = retrievalTasks.awaitAll().flatten()
            .sortedByDescending { it.score }
            .take(limit)
        
        // For memories that were retrieved, update access patterns
        allResults.forEach { (type, memory, _) ->
            reinforcementSystem?.reinforceMemoryAccess(type, memory.id, 0.5f)
        }
        
        // Optionally update working memory with new results
        if (filters.updateWorkingMemory) {
            allResults.forEach { (type, memory, _) ->
                workingMemoryManager?.addToWorkingMemory(type, memory.id)
            }
        }
        
        allResults
    }
    
    /**
     * Calculate a factor based on emotional context match
     */
    private fun calculateEmotionalContextFactor(memory: BaseMemory, context: EmotionalValence): Float {
        val memoryEmotionalValence = when (memory) {
            is EpisodicMemory -> memory.emotionalValence
            is EmotionalMemory -> memory.emotionalValence
            else -> EmotionalValence.NEUTRAL
        }
        
        // If contexts match, boost score
        return when {
            context == EmotionalValence.NEUTRAL -> 1.0f // Neutral context doesn't affect scoring
            context == memoryEmotionalValence -> 1.3f // Exact match
            context.isPositive() && memoryEmotionalValence.isPositive() -> 1.15f // Both positive
            context.isNegative() && memoryEmotionalValence.isNegative() -> 1.15f // Both negative
            else -> 0.9f // Emotional mismatch slightly decreases relevance
        }
    }
    
    /**
     * Calculate recency factor - more recent memories get higher scores
     */
    private fun calculateRecencyFactor(timestamp: Long): Float {
        val now = System.currentTimeMillis()
        val ageInDays = (now - timestamp) / (1000.0 * 60 * 60 * 24)
        
        // Apply decay function to get recency factor
        return exp(-0.1f * ageInDays.toFloat()).toFloat().coerceIn(0.1f, 1.0f)
    }
    
    /**
     * Retrieve memories by association from a specific memory
     * 
     * @param memoryType Type of the source memory
     * @param memoryId ID of the source memory
     * @param depth How many degrees of association to traverse
     * @param limit Max number of results
     * @return List of associated memories with relevance scores
     */
    suspend fun retrieveByAssociation(
        memoryType: MemoryType,
        memoryId: String,
        depth: Int = 1,
        limit: Int = 10
    ): List<ScoredMemory> {
        val associationEngine = memoryAssociationEngine ?: return emptyList()
        val sourceMemory = getMemoryByTypeAndId(memoryType, memoryId) ?: return emptyList()
        
        // Update access pattern for source memory
        reinforcementSystem?.reinforceMemoryAccess(memoryType, memoryId)
        
        // Get associations with scores
        val associations = associationEngine.getAssociatedMemories(memoryType, memoryId, depth, limit * 2)
        
        // Convert to scored memories and apply strength adjustments
        val scoredAssociations = associations.mapNotNull { (assocType, assocId, score) ->
            val assocMemory = getMemoryByTypeAndId(assocType, assocId) ?: return@mapNotNull null
            
            // Adjust association score by memory strength
            val adjustedScore = score * (0.5f + 0.5f * assocMemory.strengthFactor)
            
            ScoredMemory(assocType, assocMemory, adjustedScore)
        }
        
        // Sort and limit results
        return scoredAssociations.sortedByDescending { it.score }.take(limit)
    }
    
    /**
     * Retrieve memories related to the current working memory context
     */
    suspend fun retrieveByWorkingMemoryContext(
        limit: Int = 10,
        includeTypes: Set<MemoryType> = setOf(MemoryType.EPISODIC, MemoryType.SEMANTIC, MemoryType.EMOTIONAL)
    ): List<ScoredMemory> = coroutineScope {
        val workingMemory = workingMemoryManager ?: return@coroutineScope emptyList()
        val associationEngine = memoryAssociationEngine ?: return@coroutineScope emptyList()
        
        // Get current working memory items
        val workingMemoryItems = workingMemory.getWorkingMemoryItems()
            .filter { it.memoryType in includeTypes }
        
        if (workingMemoryItems.isEmpty()) {
            return@coroutineScope emptyList()
        }
        
        // For each working memory item, find associations
        val retrievalTasks = workingMemoryItems.map { wmItem ->
            async {
                // Weight by recency in working memory
                val recencyWeight = calculateWorkingMemoryRecencyWeight(wmItem)
                
                // Get associations
                associationEngine.getAssociatedMemories(
                    wmItem.memoryType, 
                    wmItem.memoryId, 
                    depth = 1, 
                    limit = limit
                ).mapNotNull { (assocType, assocId, assocScore) ->
                    val assocMemory = getMemoryByTypeAndId(assocType, assocId) ?: return@mapNotNull null
                    
                    // Don't return memories already in working memory
                    if (workingMemoryItems.any { it.memoryId == assocId && it.memoryType == assocType }) {
                        return@mapNotNull null
                    }
                    
                    // Adjust score by working memory recency and memory strength
                    val finalScore = assocScore * recencyWeight * (0.5f + 0.5f * assocMemory.strengthFactor)
                    
                    ScoredMemory(assocType, assocMemory, finalScore)
                }
            }
        }
        
        // Combine results, removing duplicates by keeping highest score
        val results = retrievalTasks.awaitAll().flatten()
        val dedupedResults = results
            .groupBy { "${it.memoryType}:${it.memory.id}" }
            .mapValues { (_, memories) -> memories.maxByOrNull { it.score }!! }
            .values
            .sortedByDescending { it.score }
            .take(limit)
        
        dedupedResults
    }
    
    /**
     * Calculate weight based on recency in working memory
     */
    private fun calculateWorkingMemoryRecencyWeight(wmItem: WorkingMemoryItem): Float {
        val now = System.currentTimeMillis()
        val ageInMinutes = (now - wmItem.addedTimestamp) / (1000.0 * 60)
        
        // More recent items in working memory have higher weight
        return exp(-0.01f * ageInMinutes.toFloat()).toFloat().coerceIn(0.5f, 1.0f)
    }
    
    /**
     * Retrieve memories from specific time period
     */
    suspend fun retrieveByTimeFrame(
        startTime: Long,
        endTime: Long,
        memoryTypes: Set<MemoryType> = setOf(MemoryType.EPISODIC),
        limit: Int = 20
    ): List<ScoredMemory> {
        val results = mutableListOf<ScoredMemory>()
        
        // Search episodic memories by time frame
        if (MemoryType.EPISODIC in memoryTypes) {
            episodicMemoryStore?.let { store ->
                store.getAllMemories()
                    .filter { it.timestamp in startTime..endTime }
                    .sortedByDescending { it.importance * it.strengthFactor }
                    .take(limit)
                    .forEach { memory ->
                        results.add(ScoredMemory(
                            MemoryType.EPISODIC,
                            memory,
                            calculateTimeRelevanceScore(memory.timestamp, startTime, endTime)
                        ))
                    }
            }
        }
        
        // Search emotional memories by time frame
        if (MemoryType.EMOTIONAL in memoryTypes) {
            emotionalMemoryStore?.let { store ->
                store.getAllMemories()
                    .filter { it.timestamp in startTime..endTime }
                    .sortedByDescending { it.intensity * it.strengthFactor }
                    .take(limit)
                    .forEach { memory ->
                        results.add(ScoredMemory(
                            MemoryType.EMOTIONAL,
                            memory,
                            calculateTimeRelevanceScore(memory.timestamp, startTime, endTime) * 
                                memory.intensity
                        ))
                    }
            }
        }
        
        // Sort and limit results
        return results.sortedByDescending { it.score }.take(limit)
    }
    
    /**
     * Calculate relevance score based on time positioning
     */
    private fun calculateTimeRelevanceScore(timestamp: Long, startTime: Long, endTime: Long): Float {
        // Middle of the time range gets highest score
        val rangeMiddle = startTime + (endTime - startTime) / 2
        val distance = Math.abs(timestamp - rangeMiddle)
        val maxDistance = (endTime - startTime) / 2
        
        if (maxDistance == 0L) return 1.0f
        return 1.0f - (distance.toFloat() / maxDistance)
    }
    
    /**
     * Perform an emotional memory search
     */
    suspend fun retrieveByEmotionalContext(
        emotionalValence: EmotionalValence,
        intensityThreshold: Float = 0.5f,
        limit: Int = 10
    ): List<ScoredMemory> {
        val results = mutableListOf<ScoredMemory>()
        
        // Search emotional memories directly
        emotionalMemoryStore?.let { store ->
            store.getAllMemories()
                .filter { 
                    when {
                        emotionalValence.isPositive() -> it.emotionalValence.isPositive()
                        emotionalValence.isNegative() -> it.emotionalValence.isNegative()
                        else -> it.emotionalValence == emotionalValence
                    } && it.intensity >= intensityThreshold
                }
                .sortedByDescending { it.intensity * it.strengthFactor }
                .take(limit)
                .forEach { memory ->
                    val emotionalMatchScore = calculateEmotionalMatchScore(
                        memory.emotionalValence, 
                        emotionalValence,
                        memory.intensity
                    )
                    results.add(ScoredMemory(
                        MemoryType.EMOTIONAL,
                        memory,
                        emotionalMatchScore
                    ))
                }
        }
        
        // Search episodic memories with emotional content
        episodicMemoryStore?.let { store ->
            store.getAllMemories()
                .filter { 
                    when {
                        emotionalValence.isPositive() -> it.emotionalValence.isPositive()
                        emotionalValence.isNegative() -> it.emotionalValence.isNegative()
                        else -> it.emotionalValence == emotionalValence
                    } && it.importance >= intensityThreshold
                }
                .sortedByDescending { it.importance * it.strengthFactor }
                .take(limit)
                .forEach { memory ->
                    val emotionalMatchScore = calculateEmotionalMatchScore(
                        memory.emotionalValence, 
                        emotionalValence,
                        memory.importance
                    )
                    results.add(ScoredMemory(
                        MemoryType.EPISODIC,
                        memory,
                        emotionalMatchScore * 0.8f // Episodic memories have slightly lower emotional scores
                    ))
                }
        }
        
        // Sort and limit results
        return results.sortedByDescending { it.score }.take(limit)
    }
    
    /**
     * Calculate emotional match score between two emotional valences
     */
    private fun calculateEmotionalMatchScore(
        memoryValence: EmotionalValence,
        queryValence: EmotionalValence,
        intensity: Float
    ): Float {
        val baseScore = when {
            memoryValence == queryValence -> 1.0f // Exact match
            memoryValence.isPositive() && queryValence.isPositive() -> 0.8f // Both positive
            memoryValence.isNegative() && queryValence.isNegative() -> 0.8f // Both negative
            else -> 0.4f // Emotional mismatch
        }
        
        return baseScore * intensity
    }
    
    /**
     * Helper to get a memory by type and ID
     */
    private fun getMemoryByTypeAndId(type: MemoryType, id: String): BaseMemory? {
        return when (type) {
            MemoryType.EPISODIC -> episodicMemoryStore?.getMemoryById(id)
            MemoryType.SEMANTIC -> semanticMemoryStore?.getMemoryById(id)
            MemoryType.EMOTIONAL -> emotionalMemoryStore?.getMemoryById(id)
        }
    }
    
    /**
     * Check if a memory matches the specified filters
     */
    private fun BaseMemory.matchesFilters(filters: MemoryFilters): Boolean {
        // Time range filter
        if (filters.startTime != null && filters.endTime != null) {
            if (this.timestamp !in filters.startTime..filters.endTime) {
                return false
            }
        }
        
        // Strength threshold filter
        if (this.strengthFactor < filters.strengthThreshold) {
            return false
        }
        
        // Additional type-specific filters
        when (this) {
            is EpisodicMemory -> {
                // Importance filter
                if (filters.importanceThreshold != null && this.importance < filters.importanceThreshold) {
                    return false
                }
                
                // Location filter
                if (filters.location != null && this.location != filters.location) {
                    return false
                }
                
                // People filter
                if (filters.people != null && filters.people.isNotEmpty()) {
                    if (this.people.none { it in filters.people }) {
                        return false
                    }
                }
            }
            is EmotionalMemory -> {
                // Emotional valence filter
                if (filters.emotionalValence != null && this.emotionalValence != filters.emotionalValence) {
                    return false
                }
                
                // Intensity filter
                if (filters.intensityThreshold != null && this.intensity < filters.intensityThreshold) {
                    return false
                }
            }
        }
        
        return true
    }
}

/**
 * Helper extension functions for emotional valence
 */
fun EmotionalValence.isPositive(): Boolean = this == EmotionalValence.POSITIVE || this == EmotionalValence.STRONGLY_POSITIVE

fun EmotionalValence.isNegative(): Boolean = this == EmotionalValence.NEGATIVE || this == EmotionalValence.STRONGLY_NEGATIVE

/**
 * Data class representing a memory with a relevance score
 */
data class ScoredMemory(
    val memoryType: MemoryType,
    val memory: BaseMemory,
    val score: Float
)

/**
 * Data class for memory retrieval filters
 */
data class MemoryFilters(
    val startTime: Long? = null,
    val endTime: Long? = null,
    val location: String? = null,
    val people: List<String>? = null,
    val emotionalValence: EmotionalValence? = null,
    val intensityThreshold: Float? = null,
    val importanceThreshold: Float? = null,
    val strengthThreshold: Float = 0.2f,
    val recencyBias: Float = 0.5f,  // 0.0 = no recency bias, 1.0 = strong recency bias
    val updateWorkingMemory: Boolean = true
)

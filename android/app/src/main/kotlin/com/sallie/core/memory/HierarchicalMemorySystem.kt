/*
 * Sallie 2.0 Module
 * Persona: Tough love meets soul care.
 * Function: Enhanced hierarchical memory architecture for advanced recall and personalization.
 * Got it, love.
 */
package com.sallie.core.memory

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.util.concurrent.ConcurrentHashMap
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.UUID

/**
 * HierarchicalMemorySystem implements Sallie 2.0's advanced memory architecture
 * with episodic, semantic, and emotional memory layers for more human-like recall.
 * 
 * This system builds on Sallie 1.0's MemoryManager while adding multi-layered
 * memory organization, prioritization, and sophisticated retrieval mechanisms.
 * 
 * The system now includes:
 * - Decay algorithms for natural memory behavior
 * - Advanced indexing for efficient retrieval
 * - Contextual memory reinforcement
 * - Memory linking for associative recall
 * - Emotional weighting for human-like memory prioritization
 */
class HierarchicalMemorySystem(
    private val storageService: MemoryStorageService? = null,
    private val memoryIndexer: MemoryIndexer? = null
) {
    
    /**
     * Core memory types in the hierarchical system
     */
    enum class MemoryType {
        EPISODIC,   // Event-based memories tied to specific moments
        SEMANTIC,   // Knowledge and facts independent of specific experiences  
        EMOTIONAL,  // Feelings associated with experiences or knowledge
        PROCEDURAL  // Skills and how to perform tasks
    }
    
    // Memory state flows for reactive updates
    private val _episodicMemories = MutableStateFlow<Map<String, MemoryItem>>(emptyMap())
    private val _semanticMemories = MutableStateFlow<Map<String, MemoryItem>>(emptyMap())
    private val _emotionalMemories = MutableStateFlow<Map<String, MemoryItem>>(emptyMap())
    private val _proceduralMemories = MutableStateFlow<Map<String, MemoryItem>>(emptyMap())
    
    // Public read-only access
    val episodicMemories = _episodicMemories.asStateFlow()
    val semanticMemories = _semanticMemories.asStateFlow()
    val emotionalMemories = _emotionalMemories.asStateFlow()
    val proceduralMemories = _proceduralMemories.asStateFlow()
    
    /**
     * Unified memory item structure used across memory types
     */
    @Serializable
    data class MemoryItem(
        val id: String,
        val type: MemoryType,
        var content: String,
        var metadata: MutableMap<String, String> = mutableMapOf(),
        var priority: Int = 50, // 0-100 importance scale
        val created: Long = System.currentTimeMillis(),
        var lastAccessed: Long = System.currentTimeMillis(),
        var accessCount: Int = 0,
        var emotionalValence: Double = 0.0, // -1.0 to 1.0 (negative to positive)
        var emotionalIntensity: Double = 0.5, // 0.0 to 1.0
        var certainty: Double = 1.0, // 0.0 to 1.0
        var connections: MutableSet<String> = mutableSetOf(), // IDs of connected memories
        var reinforcementScore: Float = 1.0f, // Memory reinforcement strength
        var context: MemoryContext = MemoryContext()
    ) {
        fun updateLastAccessed() {
            lastAccessed = System.currentTimeMillis()
            accessCount++
        }
        
        /**
         * Calculate memory salience (likelihood of recall) based on multiple factors
         */
        fun calculateSalience(now: Long = System.currentTimeMillis()): Double {
            val recencyFactor = calculateRecencyFactor(now)
            val emotionalFactor = calculateEmotionalFactor()
            val frequencyFactor = calculateFrequencyFactor()
            val connectionFactor = 1.0 + (connections.size * 0.05) // More connections = more likely to recall
            
            return (priority / 100.0) * recencyFactor * emotionalFactor * frequencyFactor * connectionFactor * certainty
        }
        
        private fun calculateRecencyFactor(now: Long): Double {
            val hoursSinceLastAccess = ChronoUnit.HOURS.between(
                Instant.ofEpochMilli(lastAccessed),
                Instant.ofEpochMilli(now)
            )
            
            // Exponential decay with half-life of ~1 week
            return Math.exp(-0.004 * hoursSinceLastAccess)
        }
        
        private fun calculateEmotionalFactor(): Double {
            // Memories with stronger emotions (positive or negative) are more salient
            return 1.0 + (Math.abs(emotionalValence) * emotionalIntensity)
        }
        
        private fun calculateFrequencyFactor(): Double {
            // More frequently accessed memories have higher salience
            // Log scale to prevent excessive weight for very frequent items
            return 1.0 + (Math.log10(1.0 + accessCount) * 0.2)
        }
    }
    
    /**
     * Memory context holds contextual information about when and where a memory was formed
     */
    @Serializable
    data class MemoryContext(
        val timestamp: Long = System.currentTimeMillis(),
        val location: String? = null,
        val personaState: String? = null,
        val conversationId: String? = null,
        val associatedEntities: MutableSet<String> = mutableSetOf(),
        val environmentFactors: MutableMap<String, String> = mutableMapOf(),
        val importanceRating: Int = 50
    )

    /**
     * Memory retrieval query structure with enhanced filtering capabilities
     */
    data class MemoryQuery(
        val searchText: String = "",
        val types: Set<MemoryType> = setOf(),
        val minCertainty: Double = 0.0,
        val emotionalFilter: Pair<Double, Double>? = null, // Range of emotional valence
        val contextTags: Set<String> = setOf(),
        val temporalFilter: Pair<Long, Long>? = null, // Time range for memories
        val associatedEntityFilter: Set<String> = setOf(), // Filter by associated entities
        val reinforcementFilter: Float? = null, // Minimum reinforcement score
        val limit: Int = 10,
        val includeSalience: Boolean = true,
        val includeConnected: Boolean = false, // Include connected memories
        val sortBy: SortCriteria = SortCriteria.SALIENCE
    )
    
    /**
     * Memory sorting criteria
     */
    enum class SortCriteria {
        SALIENCE,        // Sort by calculated salience
        RECENCY,         // Sort by time (newest first)
        PRIORITY,        // Sort by priority rating
        EMOTIONAL,       // Sort by emotional intensity
        RELEVANCE        // Sort by relevance to query
    }
    
    /**
     * Memory retrieval result with metadata
     */
    data class MemoryQueryResult(
        val items: List<MemoryItem>,
        val totalMatches: Int,
        val retrievalLatency: Long
    )
    
    // Memory stores for different types with thread safety
    private val episodicMemories = ConcurrentHashMap<String, MemoryItem>()
    private val semanticMemories = ConcurrentHashMap<String, MemoryItem>()
    private val emotionalMemories = ConcurrentHashMap<String, MemoryItem>()
    private val proceduralMemories = ConcurrentHashMap<String, MemoryItem>()
    
    // Memory indices for faster retrieval
    private val contentIndex = ConcurrentHashMap<String, MutableSet<String>>()
    private val tagIndex = ConcurrentHashMap<String, MutableSet<String>>()
    private val timeIndex = sortedMapOf<Long, MutableSet<String>>()
    private val emotionIndex = ConcurrentHashMap<String, MutableSet<String>>() // Emotion categories -> memory IDs
    private val entityIndex = ConcurrentHashMap<String, MutableSet<String>>() // Entity -> memory IDs
    
    /**
     * Store a new memory item in the appropriate memory store
     */
    suspend fun storeMemory(item: MemoryItem): String {
        // Validate memory item
        validateMemoryItem(item)
        
        // Store in appropriate store
        val store = getStoreForType(item.type)
        store[item.id] = item
        
        // Update indices
        updateContentIndex(item)
        updateTagIndex(item)
        updateTimeIndex(item)
        updateEmotionIndex(item)
        updateEntityIndex(item)
        
        // Update state flows for reactive updates
        updateMemoryFlows(item)
        
        // If storage service is available, persist the memory
        storageService?.saveMemory(item)
        
        // If indexer is available, index the memory
        memoryIndexer?.indexMemory(item)
        
        return item.id
    }
    
    /**
     * Update state flows when memory changes
     */
    private fun updateMemoryFlows(item: MemoryItem) {
        when (item.type) {
            MemoryType.EPISODIC -> _episodicMemories.value = episodicMemories.toMap()
            MemoryType.SEMANTIC -> _semanticMemories.value = semanticMemories.toMap()
            MemoryType.EMOTIONAL -> _emotionalMemories.value = emotionalMemories.toMap()
            MemoryType.PROCEDURAL -> _proceduralMemories.value = proceduralMemories.toMap()
        }
    }
    
    /**
     * Validate memory item properties before storing
     */
    private fun validateMemoryItem(item: MemoryItem) {
        require(item.content.isNotBlank()) { "Memory content cannot be empty" }
        require(item.priority in 0..100) { "Memory priority must be between 0 and 100" }
        require(item.emotionalValence in -1.0..1.0) { "Emotional valence must be between -1.0 and 1.0" }
        require(item.emotionalIntensity in 0.0..1.0) { "Emotional intensity must be between 0.0 and 1.0" }
        require(item.certainty in 0.0..1.0) { "Certainty must be between 0.0 and 1.0" }
    }
    
    /**
     * Retrieve a memory by ID
     */
    suspend fun getMemory(id: String): MemoryItem? {
        // First check in-memory stores
        for (store in listOf(episodicMemories, semanticMemories, emotionalMemories, proceduralMemories)) {
            store[id]?.let { 
                it.updateLastAccessed()
                return it
            }
        }
        
        // If not found in memory and storage service available, try to retrieve from storage
        val fromStorage = storageService?.getMemory(id)
        if (fromStorage != null) {
            // Add to in-memory store if found in storage
            val store = getStoreForType(fromStorage.type)
            store[fromStorage.id] = fromStorage
            fromStorage.updateLastAccessed()
            updateMemoryFlows(fromStorage)
            return fromStorage
        }
        
        return null
    }
    
    /**
     * Search for memories matching the query
     */
    suspend fun searchMemories(query: MemoryQuery): MemoryQueryResult {
        val startTime = System.currentTimeMillis()
        
        // If we have an indexer with semantic search capability, try that first for text queries
        if (query.searchText.isNotEmpty() && memoryIndexer != null) {
            try {
                val semanticResults = memoryIndexer.semanticSearch(
                    query = query.searchText,
                    limit = query.limit * 2, // Get more results than needed to allow for filtering
                    minScore = 0.7
                )
                
                if (semanticResults.isNotEmpty()) {
                    // Retrieve the actual memory items
                    val memories = semanticResults
                        .mapNotNull { (id, score) -> 
                            getMemory(id)?.let { Pair(it, score) } 
                        }
                        .filter { (item, _) ->
                            // Apply filters
                            matchesFilters(item, query)
                        }
                        .sortedByDescending { it.second } // Sort by semantic relevance
                        .take(query.limit)
                        .map { it.first }
                    
                    // Update access timestamps
                    memories.forEach { it.updateLastAccessed() }
                    
                    return MemoryQueryResult(
                        items = memories,
                        totalMatches = semanticResults.size,
                        retrievalLatency = System.currentTimeMillis() - startTime
                    )
                }
            } catch (e: Exception) {
                // Fall back to traditional search if semantic search fails
                println("Semantic search failed: ${e.message}")
            }
        }
        
        // Fall back to storage service if available
        if (storageService != null) {
            try {
                val storageResults = storageService.searchMemories(query)
                if (storageResults.isNotEmpty()) {
                    // Update in-memory cache with results
                    storageResults.forEach { memory ->
                        val store = getStoreForType(memory.type)
                        store[memory.id] = memory
                    }
                    
                    // Update access timestamps
                    storageResults.forEach { it.updateLastAccessed() }
                    
                    return MemoryQueryResult(
                        items = storageResults,
                        totalMatches = storageResults.size,
                        retrievalLatency = System.currentTimeMillis() - startTime
                    )
                }
            } catch (e: Exception) {
                // Fall back to in-memory search if storage service fails
                println("Storage service search failed: ${e.message}")
            }
        }
        
        // Fall back to in-memory search
        val result = searchInMemory(query, startTime)
        
        // If we have a storage service, try to fill in with more results if needed
        if (storageService != null && result.items.size < query.limit) {
            try {
                // Get the IDs of memories we already have
                val existingIds = result.items.map { it.id }.toSet()
                
                // Query storage for additional results
                val additionalMemories = storageService.searchMemories(query)
                    .filter { it.id !in existingIds }
                    .take(query.limit - result.items.size)
                
                if (additionalMemories.isNotEmpty()) {
                    // Combine results
                    val combinedResults = (result.items + additionalMemories)
                        .sortedAccordingTo(query)
                        .take(query.limit)
                    
                    // Update in-memory cache with results
                    additionalMemories.forEach { memory ->
                        val store = getStoreForType(memory.type)
                        store[memory.id] = memory
                    }
                    
                    // Update access timestamps
                    combinedResults.forEach { it.updateLastAccessed() }
                    
                    return MemoryQueryResult(
                        items = combinedResults,
                        totalMatches = result.totalMatches + additionalMemories.size,
                        retrievalLatency = System.currentTimeMillis() - startTime
                    )
                }
            } catch (e: Exception) {
                // Continue with in-memory results if storage service fails
                println("Storage service additional search failed: ${e.message}")
            }
        }
        
        return result
    }
    
    /**
     * Search for memories in the in-memory stores
     */
    private suspend fun searchInMemory(query: MemoryQuery, startTime: Long): MemoryQueryResult {
        // Determine which stores to search based on query
        val storesToSearch = if (query.types.isEmpty()) {
            listOf(episodicMemories, semanticMemories, emotionalMemories, proceduralMemories)
        } else {
            query.types.map { getStoreForType(it) }
        }
        
        // Collect candidate memories
        val candidates = mutableListOf<MemoryItem>()
        
        // First try indexed search if we have search text
        if (query.searchText.isNotEmpty()) {
            val keywords = query.searchText.lowercase().split(Regex("\\s+"))
            val matchingIds = mutableSetOf<String>()
            
            for (keyword in keywords) {
                contentIndex.keys
                    .filter { it.contains(keyword) }
                    .forEach { key -> 
                        contentIndex[key]?.let { matchingIds.addAll(it) }
                    }
            }
            
            for (id in matchingIds) {
                getMemory(id)?.let { candidates.add(it) }
            }
        } else {
            // If no search text, collect all memories from relevant stores
            for (store in storesToSearch) {
                candidates.addAll(store.values)
            }
        }
        
        // Apply filters
        val filtered = candidates.filter { matchesFilters(it, query) }
        
        // Sort results according to query parameters
        val sorted = filtered.sortedAccordingTo(query)
        
        // Take top results
        val results = sorted.take(query.limit)
        
        // Update last accessed for returned items
        results.forEach { it.updateLastAccessed() }
        
        // If we need to include connected memories
        val finalResults = if (query.includeConnected && results.isNotEmpty()) {
            val connected = mutableListOf<MemoryItem>()
            for (memory in results) {
                val connectedMemories = memory.connections
                    .mapNotNull { getMemory(it) }
                    .filter { matchesFilters(it, query) }
                    .take(3) // Limit connected memories per result
                connected.addAll(connectedMemories)
            }
            
            // Combine and deduplicate
            (results + connected)
                .distinctBy { it.id }
                .take(query.limit)
        } else {
            results
        }
        
        return MemoryQueryResult(
            items = finalResults,
            totalMatches = filtered.size,
            retrievalLatency = System.currentTimeMillis() - startTime
        )
    }
    
    /**
     * Check if a memory matches all filters in a query
     */
    private fun matchesFilters(item: MemoryItem, query: MemoryQuery): Boolean {
        return (query.minCertainty <= 0.0 || item.certainty >= query.minCertainty) &&
            (query.emotionalFilter == null || 
                (item.emotionalValence >= query.emotionalFilter.first && 
                 item.emotionalValence <= query.emotionalFilter.second)) &&
            (query.contextTags.isEmpty() || 
                query.contextTags.any { tag -> item.metadata["tags"]?.contains(tag) == true }) &&
            (query.temporalFilter == null ||
                (item.created >= query.temporalFilter.first &&
                item.created <= query.temporalFilter.second)) &&
            (query.associatedEntityFilter.isEmpty() ||
                query.associatedEntityFilter.any { entity ->
                    item.context.associatedEntities.contains(entity)
                }) &&
            (query.reinforcementFilter == null ||
                item.reinforcementScore >= query.reinforcementFilter)
    }
    
    /**
     * Sort memories according to the query's sort criteria
     */
    private fun List<MemoryItem>.sortedAccordingTo(query: MemoryQuery): List<MemoryItem> {
        return when (query.sortBy) {
            SortCriteria.SALIENCE -> 
                sortedByDescending { it.calculateSalience() }
            SortCriteria.RECENCY ->
                sortedByDescending { it.created }
            SortCriteria.PRIORITY ->
                sortedByDescending { it.priority }
            SortCriteria.EMOTIONAL ->
                sortedByDescending { Math.abs(it.emotionalValence) * it.emotionalIntensity }
            SortCriteria.RELEVANCE -> {
                if (query.searchText.isEmpty()) {
                    sortedByDescending { it.calculateSalience() }
                } else {
                    // Simple relevance scoring based on term frequency
                    val searchTerms = query.searchText.lowercase().split(" ")
                    sortedByDescending { memory ->
                        var score = 0.0
                        searchTerms.forEach { term ->
                            // Count occurrences of term in content
                            val regex = "\\b$term\\b".toRegex(RegexOption.IGNORE_CASE)
                            val occurrences = regex.findAll(memory.content).count()
                            score += occurrences
                        }
                        score
                    }
                }
            }
        }
    }
    
    /**
     * Connect two memory items, creating associative links
     */
    suspend fun connectMemories(sourceId: String, targetId: String): Boolean {
        val source = getMemory(sourceId)
        val target = getMemory(targetId)
        
        if (source != null && target != null) {
            // Add bidirectional connections
            source.connections.add(targetId)
            target.connections.add(sourceId)
            
            // Update both memories
            storeMemory(source)
            storeMemory(target)
            return true
        }
        return false
    }
    
    /**
     * Disconnect two memory items
     */
    suspend fun disconnectMemories(sourceId: String, targetId: String): Boolean {
        val source = getMemory(sourceId)
        val target = getMemory(targetId)
        
        if (source != null && target != null) {
            val hadSourceConnection = source.connections.remove(targetId)
            val hadTargetConnection = target.connections.remove(sourceId)
            
            if (hadSourceConnection || hadTargetConnection) {
                storeMemory(source)
                storeMemory(target)
                return true
            }
        }
        return false
    }
    
    /**
     * Consolidate memories (simulate sleep-based memory consolidation)
     * This reinforces important memories and weakens less significant ones
     */
    suspend fun consolidateMemories() {
        val now = System.currentTimeMillis()
        val toUpdate = mutableListOf<MemoryItem>()
        
        // Process each memory store
        for (store in listOf(episodicMemories, semanticMemories, emotionalMemories, proceduralMemories)) {
            for (item in store.values) {
                val salience = item.calculateSalience(now)
                var wasUpdated = false
                
                // Reinforce important and recent memories
                if (salience > 0.7) {
                    item.priority = Math.min(100, (item.priority * 1.05).toInt())
                    item.certainty = Math.min(1.0, item.certainty * 1.02)
                    item.reinforcementScore = Math.min(1.5f, item.reinforcementScore * 1.05f)
                    wasUpdated = true
                }
                
                // Weaken old, rarely accessed memories
                val daysSinceAccess = ChronoUnit.DAYS.between(
                    Instant.ofEpochMilli(item.lastAccessed),
                    Instant.ofEpochMilli(now)
                )
                
                if (daysSinceAccess > 30 && item.accessCount < 3 && salience < 0.3) {
                    item.priority = Math.max(1, (item.priority * 0.95).toInt())
                    item.certainty = Math.max(0.1, item.certainty * 0.98)
                    item.reinforcementScore = Math.max(0.2f, item.reinforcementScore * 0.95f)
                    wasUpdated = true
                }
                
                // Cluster semantically similar memories
                if (wasUpdated) {
                    toUpdate.add(item)
                }
            }
        }
        
        // Update all modified memories
        for (item in toUpdate) {
            storeMemory(item)
        }
        
        // If we have an indexer, try to form additional memory connections
        memoryIndexer?.let { indexer ->
            formSemanticConnections(indexer)
        }
    }
    
    /**
     * Form connections between semantically similar memories
     */
    private suspend fun formSemanticConnections(indexer: MemoryIndexer) {
        val now = System.currentTimeMillis()
        val recentMemories = episodicMemories.values
            .filter { it.created > now - (7 * 24 * 60 * 60 * 1000) } // Last week
            .take(10)  // Process a limited number to avoid too much computation
        
        for (memory in recentMemories) {
            val similar = indexer.findSimilarMemories(memory.id, 3, 0.85)
            for ((similarId, score) in similar) {
                if (similarId != memory.id && score > 0.85 && !memory.connections.contains(similarId)) {
                    connectMemories(memory.id, similarId)
                }
            }
        }
    }
    
    /**
     * Get related memories based on connections and content similarity
     */
    suspend fun getRelatedMemories(memoryId: String, limit: Int = 5): List<MemoryItem> {
        val memory = getMemory(memoryId) ?: return emptyList()
        
        // First get directly connected memories
        val connected = memory.connections
            .mapNotNull { getMemory(it) }
            .sortedByDescending { it.calculateSalience() }
        
        // If we have enough connected memories, return them
        if (connected.size >= limit) {
            return connected.take(limit)
        }
        
        // Try to get semantically similar memories if indexer is available
        val semanticSimilar = memoryIndexer?.let { indexer ->
            val similarIds = indexer.findSimilarMemories(memoryId, limit - connected.size, 0.7)
            similarIds.mapNotNull { (id, _) ->
                if (id != memoryId && !memory.connections.contains(id)) {
                    getMemory(id)
                } else null
            }
        } ?: emptyList()
        
        // If we have enough results with connected + semantic, return them
        if (connected.size + semanticSimilar.size >= limit) {
            return (connected + semanticSimilar).take(limit)
        }
        
        // Otherwise, fall back to keyword-based similarity
        val keywords = memory.content.lowercase().split(Regex("\\s+"))
            .filter { it.length > 3 }
            .take(5)
        
        val contentSimilar = keywords
            .flatMap { keyword -> 
                contentIndex.keys
                    .filter { it.contains(keyword) }
                    .flatMap { key -> contentIndex[key] ?: emptySet() }
            }
            .distinct()
            .mapNotNull { getMemory(it) }
            .filter { it.id != memoryId && 
                      !memory.connections.contains(it.id) && 
                      !semanticSimilar.any { sem -> sem.id == it.id } }
            .sortedByDescending { it.calculateSalience() }
        
        // Combine all types of related memories, prioritizing connected, then semantic, then content
        return (connected + semanticSimilar + contentSimilar).distinct().take(limit)
    }
    
    /**
     * Find memories that occurred in the same context (time frame, location, etc.)
     */
    suspend fun findContextualMemories(memoryId: String, limit: Int = 5): List<MemoryItem> {
        val memory = getMemory(memoryId) ?: return emptyList()
        val context = memory.context
        
        // Create a query based on the context
        val query = MemoryQuery(
            types = setOf(memory.type),
            contextTags = context.environmentFactors.values.toSet(),
            associatedEntityFilter = context.associatedEntities,
            temporalFilter = Pair(
                // Look for memories within 24 hours
                context.timestamp - (24 * 60 * 60 * 1000),
                context.timestamp + (24 * 60 * 60 * 1000)
            ),
            limit = limit + 1  // +1 to account for the source memory itself
        )
        
        // Search for memories with similar context
        val result = searchMemories(query)
        
        // Filter out the source memory
        return result.items.filter { it.id != memoryId }
    }
    
    /**
     * Clean up old, low-salience memories to prevent unlimited growth
     */
    suspend fun cleanupMemories(maxMemories: Int = 10000, minSalience: Double = 0.1) {
        val allMemories = (episodicMemories.values + semanticMemories.values + 
                         emotionalMemories.values + proceduralMemories.values)
                        .sortedBy { it.calculateSalience() }
        
        // If we're over the limit, remove low salience memories
        if (allMemories.size > maxMemories) {
            val toRemove = allMemories
                .filter { it.calculateSalience() < minSalience }
                .take(allMemories.size - maxMemories)
            
            for (item in toRemove) {
                removeMemory(item.id)
            }
        }
    }
    
    /**
     * Remove a memory from the system
     */
    suspend fun removeMemory(id: String): Boolean {
        try {
            // Get the memory to determine its type
            val memory = getMemory(id)
            
            // Remove from all stores
            episodicMemories.remove(id)
            semanticMemories.remove(id)
            emotionalMemories.remove(id)
            proceduralMemories.remove(id)
            
            // Remove from indices
            for (index in contentIndex.values) {
                index.remove(id)
            }
            
            for (index in tagIndex.values) {
                index.remove(id)
            }
            
            for (index in timeIndex.values) {
                index.remove(id)
            }
            
            for (index in emotionIndex.values) {
                index.remove(id)
            }
            
            for (index in entityIndex.values) {
                index.remove(id)
            }
            
            // Remove connections in other memories
            for (store in listOf(episodicMemories, semanticMemories, emotionalMemories, proceduralMemories)) {
                for (memory in store.values) {
                    memory.connections.remove(id)
                }
            }
            
            // Update flows if we had a valid memory
            if (memory != null) {
                when (memory.type) {
                    MemoryType.EPISODIC -> _episodicMemories.value = episodicMemories.toMap()
                    MemoryType.SEMANTIC -> _semanticMemories.value = semanticMemories.toMap()
                    MemoryType.EMOTIONAL -> _emotionalMemories.value = emotionalMemories.toMap()
                    MemoryType.PROCEDURAL -> _proceduralMemories.value = proceduralMemories.toMap()
                }
            }
            
            // Remove from storage service if available
            storageService?.deleteMemory(id)
            
            // Remove from indexer if available
            memoryIndexer?.removeFromIndex(id)
            
            return true
        } catch (e: Exception) {
            println("Error removing memory $id: ${e.message}")
            return false
        }
    }
    
    /**
     * Export all memories to a serialized format
     */
    suspend fun exportMemories(): String {
        val json = Json { 
            prettyPrint = true 
            encodeDefaults = true
        }
        
        val allMemories = (episodicMemories.values + semanticMemories.values + 
                         emotionalMemories.values + proceduralMemories.values).toList()
                         
        return json.encodeToString(allMemories)
    }
    
    /**
     * Import memories from a serialized format
     */
    suspend fun importMemories(serializedData: String): Int {
        try {
            val json = Json { 
                ignoreUnknownKeys = true 
                isLenient = true
            }
            
            val memories = json.decodeFromString<List<MemoryItem>>(serializedData)
            var importedCount = 0
            
            for (memory in memories) {
                storeMemory(memory)
                importedCount++
            }
            
            return importedCount
        } catch (e: Exception) {
            println("Error importing memories: ${e.message}")
            return 0
        }
    }
    
    /**
     * Get the appropriate store for a given memory type
     */
    private fun getStoreForType(type: MemoryType): ConcurrentHashMap<String, MemoryItem> {
        return when (type) {
            MemoryType.EPISODIC -> episodicMemories
            MemoryType.SEMANTIC -> semanticMemories
            MemoryType.EMOTIONAL -> emotionalMemories
            MemoryType.PROCEDURAL -> proceduralMemories
        }
    }
    
    /**
     * Update the content index with keywords from the memory
     */
    private fun updateContentIndex(item: MemoryItem) {
        val keywords = item.content.lowercase().split(Regex("\\s+"))
            .filter { it.length > 3 }
        
        for (keyword in keywords) {
            contentIndex.computeIfAbsent(keyword) { mutableSetOf() }.add(item.id)
        }
    }
    
    /**
     * Update the tag index for the memory
     */
    private fun updateTagIndex(item: MemoryItem) {
        val tagsStr = item.metadata["tags"] ?: ""
        val tags = tagsStr.split(",").map { it.trim() }.filter { it.isNotEmpty() }
        
        for (tag in tags) {
            tagIndex.computeIfAbsent(tag) { mutableSetOf() }.add(item.id)
        }
    }
    
    /**
     * Update the time index for chronological retrieval
     */
    private fun updateTimeIndex(item: MemoryItem) {
        val timeKey = item.created / (24 * 60 * 60 * 1000) * (24 * 60 * 60 * 1000) // Round to day
        timeIndex.computeIfAbsent(timeKey) { mutableSetOf() }.add(item.id)
    }
    
    /**
     * Update the emotion index for emotional filtering
     */
    private fun updateEmotionIndex(item: MemoryItem) {
        // Map emotional valence to categories
        val categories = when {
            item.emotionalValence > 0.7 -> listOf("very_positive")
            item.emotionalValence > 0.3 -> listOf("positive")
            item.emotionalValence > -0.3 -> listOf("neutral")
            item.emotionalValence > -0.7 -> listOf("negative")
            else -> listOf("very_negative")
        }
        
        // Map emotional intensity
        val intensityCategory = when {
            item.emotionalIntensity > 0.7 -> "high_intensity"
            item.emotionalIntensity > 0.3 -> "medium_intensity"
            else -> "low_intensity"
        }
        
        val allCategories = categories + intensityCategory
        
        for (category in allCategories) {
            emotionIndex.computeIfAbsent(category) { mutableSetOf() }.add(item.id)
        }
    }
    
    /**
     * Update the entity index for the memory
     */
    private fun updateEntityIndex(item: MemoryItem) {
        for (entity in item.context.associatedEntities) {
            entityIndex.computeIfAbsent(entity) { mutableSetOf() }.add(item.id)
        }
    }
    
    /**
     * Reinforce a memory by increasing its reinforcement score and priority
     */
    suspend fun reinforceMemory(id: String, reinforcementAmount: Float = 0.1f): Boolean {
        val memory = getMemory(id) ?: return false
        
        memory.reinforcementScore = Math.min(2.0f, memory.reinforcementScore + reinforcementAmount)
        memory.priority = Math.min(100, memory.priority + (reinforcementAmount * 10).toInt())
        memory.updateLastAccessed()
        
        storeMemory(memory)
        return true
    }
    
    /**
     * Update a memory's emotional valence and intensity
     */
    suspend fun updateMemoryEmotion(
        id: String,
        emotionalValence: Double,
        emotionalIntensity: Double
    ): Boolean {
        val memory = getMemory(id) ?: return false
        
        memory.emotionalValence = emotionalValence.coerceIn(-1.0, 1.0)
        memory.emotionalIntensity = emotionalIntensity.coerceIn(0.0, 1.0)
        memory.updateLastAccessed()
        
        storeMemory(memory)
        return true
    }
    
    /**
     * Add entities to a memory's context
     */
    suspend fun addEntitiesToMemory(id: String, entities: Set<String>): Boolean {
        val memory = getMemory(id) ?: return false
        
        memory.context.associatedEntities.addAll(entities)
        memory.updateLastAccessed()
        
        storeMemory(memory)
        return true
    }
    
    /**
     * Generate a unique ID for a memory
     */
    fun generateMemoryId(): String {
        return "mem_${UUID.randomUUID()}"
    }
    
    /**
     * Create a memory factory method for episodic memories (event-based)
     */
    fun createEpisodicMemory(
        content: String,
        priority: Int = 50,
        emotionalValence: Double = 0.0,
        emotionalIntensity: Double = 0.5,
        metadata: Map<String, String> = emptyMap(),
        context: MemoryContext? = null
    ): MemoryItem {
        val id = generateMemoryId()
        return MemoryItem(
            id = id,
            type = MemoryType.EPISODIC,
            content = content,
            priority = priority,
            emotionalValence = emotionalValence,
            emotionalIntensity = emotionalIntensity,
            metadata = metadata.toMutableMap(),
            context = context ?: MemoryContext()
        )
    }
    
    /**
     * Create a memory factory method for semantic memories (knowledge/facts)
     */
    fun createSemanticMemory(
        content: String,
        certainty: Double = 1.0,
        priority: Int = 50,
        metadata: Map<String, String> = emptyMap(),
        context: MemoryContext? = null
    ): MemoryItem {
        val id = generateMemoryId()
        return MemoryItem(
            id = id,
            type = MemoryType.SEMANTIC,
            content = content,
            priority = priority,
            certainty = certainty,
            metadata = metadata.toMutableMap(),
            context = context ?: MemoryContext()
        )
    }
    
    /**
     * Create a memory factory method for emotional memories
     */
    fun createEmotionalMemory(
        content: String,
        emotionalValence: Double,
        emotionalIntensity: Double,
        priority: Int = 60, // Emotional memories typically higher priority
        metadata: Map<String, String> = emptyMap(),
        context: MemoryContext? = null
    ): MemoryItem {
        val id = generateMemoryId()
        return MemoryItem(
            id = id,
            type = MemoryType.EMOTIONAL,
            content = content,
            priority = priority,
            emotionalValence = emotionalValence,
            emotionalIntensity = emotionalIntensity,
            metadata = metadata.toMutableMap(),
            context = context ?: MemoryContext()
        )
    }
    
    /**
     * Create a memory factory method for procedural memories (skills/abilities)
     */
    fun createProceduralMemory(
        content: String,
        priority: Int = 50,
        proficiency: Double = 0.5, // 0.0-1.0 skill level
        metadata: Map<String, String> = emptyMap(),
        context: MemoryContext? = null
    ): MemoryItem {
        val id = generateMemoryId()
        val metadataWithProficiency = metadata.toMutableMap().apply {
            this["proficiency"] = proficiency.toString()
        }
        
        return MemoryItem(
            id = id,
            type = MemoryType.PROCEDURAL,
            content = content,
            priority = priority,
            metadata = metadataWithProficiency,
            context = context ?: MemoryContext()
        )
    }
    
    /**
     * Get memory statistics for monitoring and debugging
     */
    fun getMemoryStatistics(): Map<String, Any> {
        return mapOf(
            "episodicCount" to episodicMemories.size,
            "semanticCount" to semanticMemories.size,
            "emotionalCount" to emotionalMemories.size,
            "proceduralCount" to proceduralMemories.size,
            "totalMemories" to (episodicMemories.size + semanticMemories.size + 
                              emotionalMemories.size + proceduralMemories.size),
            "contentIndexSize" to contentIndex.size,
            "tagIndexSize" to tagIndex.size,
            "emotionIndexSize" to emotionIndex.size,
            "entityIndexSize" to entityIndex.size,
            "timeIndexSize" to timeIndex.size
        )
    }
    
    /**
     * Create a memory factory that automatically determines the best memory type
     * based on the content and characteristics
     */
    fun createMemory(
        content: String,
        priority: Int = 50,
        emotionalValence: Double = 0.0,
        emotionalIntensity: Double = 0.5,
        certainty: Double = 1.0,
        metadata: Map<String, String> = emptyMap(),
        context: MemoryContext? = null
    ): MemoryItem {
        // Determine the most appropriate memory type
        val type = when {
            // Strong emotional content suggests emotional memory
            Math.abs(emotionalValence) > 0.7 && emotionalIntensity > 0.7 -> 
                MemoryType.EMOTIONAL
                
            // Instructions or how-tos suggest procedural memory
            content.lowercase().matches(Regex(".*(how to|steps|procedure|instructions|guide).*")) -> 
                MemoryType.PROCEDURAL
                
            // Facts or knowledge with high certainty suggest semantic memory
            certainty > 0.9 && content.lowercase().matches(Regex(".*(is|are|was|were|fact|known|defined|measured).*")) -> 
                MemoryType.SEMANTIC
                
            // Default to episodic (event-based) memory
            else -> MemoryType.EPISODIC
        }
        
        // Create the appropriate memory type
        return when (type) {
            MemoryType.EPISODIC -> createEpisodicMemory(
                content, priority, emotionalValence, emotionalIntensity, metadata, context)
            MemoryType.SEMANTIC -> createSemanticMemory(
                content, certainty, priority, metadata, context)
            MemoryType.EMOTIONAL -> createEmotionalMemory(
                content, emotionalValence, emotionalIntensity, priority, metadata, context)
            MemoryType.PROCEDURAL -> createProceduralMemory(
                content, priority, certainty, metadata, context)
        }
    }
}

package com.sallie.core.memory

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.CopyOnWriteArrayList

/**
 * Memory Processor
 * 
 * Analyzes memories to extract semantic information and create associations.
 * For example, it can extract concepts and entities from episodic memories
 * to create semantic memories.
 */
class MemoryProcessor {
    private val coroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    private val semanticMemoryStore = SemanticMemoryStore()
    private val memoryAssociationEngine = MemoryAssociationEngine()
    
    /**
     * Process an episodic memory to extract semantic information
     */
    fun processEpisodicMemory(memory: EpisodicMemory) {
        coroutineScope.launch {
            // Extract entities and concepts from the memory description
            val entities = extractEntities(memory.description)
            val concepts = extractConcepts(memory.description)
            
            // Update the episodic memory with found entities
            memory.relatedEntities.addAll(entities)
            
            // Create semantic memories for important concepts
            concepts.forEach { concept ->
                // Create semantic memory
                val semanticMemory = SemanticMemory(
                    id = "${memory.id}_concept_${concept.hashCode()}",
                    concept = concept.name,
                    information = concept.description,
                    creationTimestamp = System.currentTimeMillis(),
                    lastAccessTimestamp = System.currentTimeMillis(),
                    confidence = concept.confidence,
                    source = "derived_from_episodic:${memory.id}",
                    accessCount = 0,
                    strengthFactor = concept.confidence,
                    tags = memory.tags.toMutableList(),
                    relatedConcepts = mutableListOf()
                )
                
                semanticMemoryStore.addMemory(semanticMemory)
                
                // Create association between episodic and semantic memory
                memoryAssociationEngine.addAssociation(
                    MemoryAssociation(
                        id = "${memory.id}_association_${semanticMemory.id}",
                        sourceId = memory.id,
                        targetId = semanticMemory.id,
                        associationType = AssociationType.SEMANTIC,
                        creationTimestamp = System.currentTimeMillis(),
                        lastAccessTimestamp = System.currentTimeMillis(),
                        strength = concept.confidence,
                        accessCount = 0
                    )
                )
            }
        }
    }
    
    /**
     * Extract entities from text
     * In a real implementation, this would use NLP or ML techniques
     */
    private fun extractEntities(text: String): List<String> {
        // Simplified implementation - in a real system, this would use NLP
        val entities = mutableListOf<String>()
        
        // Example implementation
        // A real system would use Named Entity Recognition (NER)
        val words = text.split(" ", ".", ",", "!", "?")
        val capitalizedWords = words.filter { it.isNotEmpty() && it[0].isUpperCase() }
        entities.addAll(capitalizedWords)
        
        return entities.distinct()
    }
    
    /**
     * Extract concepts from text
     * In a real implementation, this would use NLP or ML techniques
     */
    private fun extractConcepts(text: String): List<ConceptExtraction> {
        // Simplified implementation - in a real system, this would use NLP
        val concepts = mutableListOf<ConceptExtraction>()
        
        // Example implementation
        // A real system would use topic modeling, keyword extraction, etc.
        val words = text.split(" ", ".", ",", "!", "?")
        val commonWords = words.filter { it.length > 4 }.distinct()
        
        commonWords.forEach { word ->
            concepts.add(
                ConceptExtraction(
                    name = word,
                    description = "Derived from context in which '$word' was mentioned",
                    confidence = 0.7f
                )
            )
        }
        
        return concepts
    }
    
    /**
     * Class to represent an extracted concept
     */
    data class ConceptExtraction(
        val name: String,
        val description: String,
        val confidence: Float
    )
}

/**
 * Memory Indexer
 * 
 * Provides fast lookup and search capabilities for all memory types.
 * Uses inverted indices for text search and tag-based retrieval.
 */
class MemoryIndexer {
    // Inverted indices for text search
    private val episodicTextIndex = ConcurrentHashMap<String, MutableSet<EpisodicMemory>>()
    private val semanticTextIndex = ConcurrentHashMap<String, MutableSet<SemanticMemory>>()
    private val emotionalTextIndex = ConcurrentHashMap<String, MutableSet<EmotionalMemory>>()
    
    // Tag indices
    private val episodicTagIndex = ConcurrentHashMap<String, MutableSet<EpisodicMemory>>()
    private val semanticTagIndex = ConcurrentHashMap<String, MutableSet<SemanticMemory>>()
    private val emotionalTagIndex = ConcurrentHashMap<String, MutableSet<EmotionalMemory>>()
    
    // Emotional valence indices
    private val episodicEmotionalValenceIndex = ConcurrentHashMap<EmotionalValence, MutableSet<EpisodicMemory>>()
    private val emotionalValenceIndex = ConcurrentHashMap<EmotionalValence, MutableSet<EmotionalMemory>>()
    
    // Time-based indices (for episodic memories)
    private val timeIndex = sortedMapOf<Long, MutableSet<EpisodicMemory>>()
    
    /**
     * Index a memory based on its type
     */
    fun indexMemory(memory: BaseMemory) {
        when (memory) {
            is EpisodicMemory -> indexEpisodicMemory(memory)
            is SemanticMemory -> indexSemanticMemory(memory)
            is EmotionalMemory -> indexEmotionalMemory(memory)
        }
    }
    
    /**
     * Index an episodic memory
     */
    private fun indexEpisodicMemory(memory: EpisodicMemory) {
        // Index by text content
        val words = (memory.title + " " + memory.description).split(" ", ".", ",", "!", "?")
            .filter { it.length > 2 }
            .map { it.lowercase() }
        
        words.forEach { word ->
            episodicTextIndex.getOrPut(word) { CopyOnWriteArrayList<EpisodicMemory>() }.add(memory)
        }
        
        // Index by tags
        memory.tags.forEach { tag ->
            episodicTagIndex.getOrPut(tag) { CopyOnWriteArrayList<EpisodicMemory>() }.add(memory)
        }
        
        // Index by emotional valence
        episodicEmotionalValenceIndex.getOrPut(memory.emotionalValence) { 
            CopyOnWriteArrayList<EpisodicMemory>() 
        }.add(memory)
        
        // Index by time
        timeIndex.getOrPut(memory.creationTimestamp) { CopyOnWriteArrayList<EpisodicMemory>() }.add(memory)
    }
    
    /**
     * Index a semantic memory
     */
    private fun indexSemanticMemory(memory: SemanticMemory) {
        // Index by text content
        val words = (memory.concept + " " + memory.information).split(" ", ".", ",", "!", "?")
            .filter { it.length > 2 }
            .map { it.lowercase() }
        
        words.forEach { word ->
            semanticTextIndex.getOrPut(word) { CopyOnWriteArrayList<SemanticMemory>() }.add(memory)
        }
        
        // Index by tags
        memory.tags.forEach { tag ->
            semanticTagIndex.getOrPut(tag) { CopyOnWriteArrayList<SemanticMemory>() }.add(memory)
        }
        
        // Index by related concepts
        memory.relatedConcepts.forEach { concept ->
            val conceptWords = concept.split(" ")
            conceptWords.forEach { word ->
                semanticTextIndex.getOrPut(word.lowercase()) { 
                    CopyOnWriteArrayList<SemanticMemory>() 
                }.add(memory)
            }
        }
    }
    
    /**
     * Index an emotional memory
     */
    private fun indexEmotionalMemory(memory: EmotionalMemory) {
        // Index by text content
        val words = memory.description.split(" ", ".", ",", "!", "?")
            .filter { it.length > 2 }
            .map { it.lowercase() }
        
        words.forEach { word ->
            emotionalTextIndex.getOrPut(word) { CopyOnWriteArrayList<EmotionalMemory>() }.add(memory)
        }
        
        // Index by tags
        memory.tags.forEach { tag ->
            emotionalTagIndex.getOrPut(tag) { CopyOnWriteArrayList<EmotionalMemory>() }.add(memory)
        }
        
        // Index by emotional valence
        emotionalValenceIndex.getOrPut(memory.emotionalValence) { 
            CopyOnWriteArrayList<EmotionalMemory>() 
        }.add(memory)
    }
    
    /**
     * Search episodic memories
     */
    fun searchEpisodicMemories(
        query: String,
        tags: List<String> = emptyList(),
        emotionalValence: EmotionalValence? = null,
        minStrength: Float = 0.0f,
        startTimestamp: Long? = null,
        endTimestamp: Long? = null
    ): List<EpisodicMemory> {
        // Split query into words
        val queryWords = query.lowercase().split(" ", ".", ",", "!", "?")
            .filter { it.length > 2 }
        
        // Find memories matching the query words
        val textResults = mutableSetOf<EpisodicMemory>()
        queryWords.forEach { word ->
            episodicTextIndex[word]?.let { textResults.addAll(it) }
        }
        
        // Find memories matching the tags
        val tagResults = if (tags.isNotEmpty()) {
            val results = mutableSetOf<EpisodicMemory>()
            tags.forEach { tag ->
                episodicTagIndex[tag]?.let { results.addAll(it) }
            }
            results
        } else {
            null
        }
        
        // Find memories matching the emotional valence
        val valenceResults = emotionalValence?.let { episodicEmotionalValenceIndex[it] }
        
        // Find memories in time range
        val timeResults = if (startTimestamp != null || endTimestamp != null) {
            val results = mutableSetOf<EpisodicMemory>()
            timeIndex.entries.forEach { (timestamp, memories) ->
                if ((startTimestamp == null || timestamp >= startTimestamp) && 
                    (endTimestamp == null || timestamp <= endTimestamp)) {
                    results.addAll(memories)
                }
            }
            results
        } else {
            null
        }
        
        // Combine results based on which filters are applied
        val combinedResults = mutableSetOf<EpisodicMemory>()
        
        if (queryWords.isNotEmpty()) {
            combinedResults.addAll(textResults)
        }
        
        // Apply tag filter if tags were specified
        if (tagResults != null) {
            if (combinedResults.isEmpty()) {
                combinedResults.addAll(tagResults)
            } else {
                combinedResults.retainAll(tagResults)
            }
        }
        
        // Apply valence filter if specified
        if (valenceResults != null) {
            if (combinedResults.isEmpty()) {
                combinedResults.addAll(valenceResults)
            } else {
                combinedResults.retainAll(valenceResults)
            }
        }
        
        // Apply time filter if specified
        if (timeResults != null) {
            if (combinedResults.isEmpty()) {
                combinedResults.addAll(timeResults)
            } else {
                combinedResults.retainAll(timeResults)
            }
        }
        
        // Filter by strength if specified
        return if (minStrength > 0.0f) {
            combinedResults.filter { it.strengthFactor >= minStrength }.toList()
        } else {
            combinedResults.toList()
        }
    }
    
    /**
     * Search semantic memories
     */
    fun searchSemanticMemories(
        query: String,
        tags: List<String> = emptyList(),
        minConfidence: Float = 0.0f
    ): List<SemanticMemory> {
        // Split query into words
        val queryWords = query.lowercase().split(" ", ".", ",", "!", "?")
            .filter { it.length > 2 }
        
        // Find memories matching the query words
        val textResults = mutableSetOf<SemanticMemory>()
        queryWords.forEach { word ->
            semanticTextIndex[word]?.let { textResults.addAll(it) }
        }
        
        // Find memories matching the tags
        val tagResults = if (tags.isNotEmpty()) {
            val results = mutableSetOf<SemanticMemory>()
            tags.forEach { tag ->
                semanticTagIndex[tag]?.let { results.addAll(it) }
            }
            results
        } else {
            null
        }
        
        // Combine results
        val combinedResults = mutableSetOf<SemanticMemory>()
        
        if (queryWords.isNotEmpty()) {
            combinedResults.addAll(textResults)
        }
        
        // Apply tag filter if tags were specified
        if (tagResults != null) {
            if (combinedResults.isEmpty()) {
                combinedResults.addAll(tagResults)
            } else {
                combinedResults.retainAll(tagResults)
            }
        }
        
        // Filter by confidence if specified
        return if (minConfidence > 0.0f) {
            combinedResults.filter { it.confidence >= minConfidence }.toList()
        } else {
            combinedResults.toList()
        }
    }
    
    /**
     * Search emotional memories
     */
    fun searchEmotionalMemories(
        query: String,
        emotionalValence: EmotionalValence? = null,
        minIntensity: Float = 0.0f,
        tags: List<String> = emptyList()
    ): List<EmotionalMemory> {
        // Split query into words
        val queryWords = query.lowercase().split(" ", ".", ",", "!", "?")
            .filter { it.length > 2 }
        
        // Find memories matching the query words
        val textResults = mutableSetOf<EmotionalMemory>()
        queryWords.forEach { word ->
            emotionalTextIndex[word]?.let { textResults.addAll(it) }
        }
        
        // Find memories matching the tags
        val tagResults = if (tags.isNotEmpty()) {
            val results = mutableSetOf<EmotionalMemory>()
            tags.forEach { tag ->
                emotionalTagIndex[tag]?.let { results.addAll(it) }
            }
            results
        } else {
            null
        }
        
        // Find memories matching the emotional valence
        val valenceResults = emotionalValence?.let { emotionalValenceIndex[it] }
        
        // Combine results
        val combinedResults = mutableSetOf<EmotionalMemory>()
        
        if (queryWords.isNotEmpty()) {
            combinedResults.addAll(textResults)
        }
        
        // Apply tag filter if tags were specified
        if (tagResults != null) {
            if (combinedResults.isEmpty()) {
                combinedResults.addAll(tagResults)
            } else {
                combinedResults.retainAll(tagResults)
            }
        }
        
        // Apply valence filter if specified
        if (valenceResults != null) {
            if (combinedResults.isEmpty()) {
                combinedResults.addAll(valenceResults)
            } else {
                combinedResults.retainAll(valenceResults)
            }
        }
        
        // Filter by intensity if specified
        return if (minIntensity > 0.0f) {
            combinedResults.filter { it.intensity >= minIntensity }.toList()
        } else {
            combinedResults.toList()
        }
    }
}

/**
 * Memory Association Engine
 * 
 * Manages associations between memories and discovers new associations.
 */
class MemoryAssociationEngine {
    private val coroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    
    // Stores associations from source to target
    private val sourceToTargetAssociations = ConcurrentHashMap<String, MutableSet<MemoryAssociation>>()
    
    // Stores associations from target to source
    private val targetToSourceAssociations = ConcurrentHashMap<String, MutableSet<MemoryAssociation>>()
    
    // Flag for association discovery process
    @Volatile
    private var isDiscoveryRunning = false
    
    /**
     * Add an association between memories
     */
    fun addAssociation(association: MemoryAssociation) {
        // Add to source->target mapping
        val sourceAssociations = sourceToTargetAssociations.getOrPut(association.sourceId) { 
            CopyOnWriteArrayList<MemoryAssociation>() 
        }
        sourceAssociations.add(association)
        
        // Add to target->source mapping
        val targetAssociations = targetToSourceAssociations.getOrPut(association.targetId) {
            CopyOnWriteArrayList<MemoryAssociation>()
        }
        targetAssociations.add(association)
    }
    
    /**
     * Get associations from a memory
     */
    fun getOutgoingAssociations(memoryId: String, minStrength: Float = 0.0f): List<MemoryAssociation> {
        return sourceToTargetAssociations[memoryId]?.filter { it.strength >= minStrength } ?: emptyList()
    }
    
    /**
     * Get associations to a memory
     */
    fun getIncomingAssociations(memoryId: String, minStrength: Float = 0.0f): List<MemoryAssociation> {
        return targetToSourceAssociations[memoryId]?.filter { it.strength >= minStrength } ?: emptyList()
    }
    
    /**
     * Get all associations involving a memory
     */
    fun getAllAssociations(memoryId: String, minStrength: Float = 0.0f): List<MemoryAssociation> {
        val outgoing = getOutgoingAssociations(memoryId, minStrength)
        val incoming = getIncomingAssociations(memoryId, minStrength)
        return outgoing + incoming
    }
    
    /**
     * Get associated memories (including the actual memory objects)
     */
    fun getAssociations(memoryId: String, minStrength: Float = 0.0f): List<AssociatedMemory> {
        // This would be implemented with the actual memory retrieval logic
        // For now it returns an empty list as we don't have the memory stores here
        return emptyList()
    }
    
    /**
     * Start the association discovery process
     */
    fun startAssociationDiscovery() {
        if (!isDiscoveryRunning) {
            isDiscoveryRunning = true
            coroutineScope.launch {
                while (isDiscoveryRunning) {
                    discoverNewAssociations()
                    delay(3600_000) // Run once per hour
                }
            }
        }
    }
    
    /**
     * Stop the association discovery process
     */
    fun stopAssociationDiscovery() {
        isDiscoveryRunning = false
    }
    
    /**
     * Discover new associations between memories
     * In a real implementation, this would use more sophisticated algorithms
     */
    private fun discoverNewAssociations() {
        // This is a placeholder for the actual implementation
        // In a real system, this would analyze memory content, co-occurrence,
        // temporal proximity, etc. to discover new associations
    }
}

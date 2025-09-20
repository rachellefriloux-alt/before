package com.sallie.core.memory

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.util.Collections
import java.util.concurrent.ConcurrentHashMap

/**
 * Episodic Memory Store
 * 
 * Manages storage and retrieval of episodic memories.
 * Episodic memories represent specific events and experiences.
 */
class EpisodicMemoryStore {
    private val memories = ConcurrentHashMap<String, EpisodicMemory>()
    
    fun addMemory(memory: EpisodicMemory) {
        memories[memory.id] = memory
    }
    
    fun getMemory(id: String): EpisodicMemory? {
        return memories[id]
    }
    
    fun removeMemory(id: String) {
        memories.remove(id)
    }
    
    fun getAllMemories(): List<EpisodicMemory> {
        return memories.values.toList()
    }
    
    fun getMemoriesByTag(tag: String): List<EpisodicMemory> {
        return memories.values.filter { it.tags.contains(tag) }
    }
    
    fun getMemoriesByEmotionalValence(valence: EmotionalValence): List<EpisodicMemory> {
        return memories.values.filter { it.emotionalValence == valence }
    }
    
    fun getMemoriesInTimeRange(startTime: Long, endTime: Long): List<EpisodicMemory> {
        return memories.values.filter { 
            it.creationTimestamp in startTime..endTime 
        }
    }
    
    fun getMemoriesByMinimumStrength(minStrength: Float): List<EpisodicMemory> {
        return memories.values.filter { it.strengthFactor >= minStrength }
    }
    
    fun count(): Int {
        return memories.size
    }
}

/**
 * Semantic Memory Store
 * 
 * Manages storage and retrieval of semantic memories.
 * Semantic memories represent factual knowledge and concepts.
 */
class SemanticMemoryStore {
    private val memories = ConcurrentHashMap<String, SemanticMemory>()
    
    fun addMemory(memory: SemanticMemory) {
        memories[memory.id] = memory
    }
    
    fun getMemory(id: String): SemanticMemory? {
        return memories[id]
    }
    
    fun removeMemory(id: String) {
        memories.remove(id)
    }
    
    fun getAllMemories(): List<SemanticMemory> {
        return memories.values.toList()
    }
    
    fun getMemoriesByTag(tag: String): List<SemanticMemory> {
        return memories.values.filter { it.tags.contains(tag) }
    }
    
    fun getMemoriesByConcept(concept: String): List<SemanticMemory> {
        return memories.values.filter { 
            it.concept.contains(concept, ignoreCase = true) || 
            it.relatedConcepts.any { rc -> rc.contains(concept, ignoreCase = true) }
        }
    }
    
    fun getMemoriesByMinimumConfidence(minConfidence: Float): List<SemanticMemory> {
        return memories.values.filter { it.confidence >= minConfidence }
    }
    
    fun count(): Int {
        return memories.size
    }
}

/**
 * Emotional Memory Store
 * 
 * Manages storage and retrieval of emotional memories.
 * Emotional memories represent emotional responses to events and experiences.
 */
class EmotionalMemoryStore {
    private val memories = ConcurrentHashMap<String, EmotionalMemory>()
    
    fun addMemory(memory: EmotionalMemory) {
        memories[memory.id] = memory
    }
    
    fun getMemory(id: String): EmotionalMemory? {
        return memories[id]
    }
    
    fun removeMemory(id: String) {
        memories.remove(id)
    }
    
    fun getAllMemories(): List<EmotionalMemory> {
        return memories.values.toList()
    }
    
    fun getMemoriesByTag(tag: String): List<EmotionalMemory> {
        return memories.values.filter { it.tags.contains(tag) }
    }
    
    fun getMemoriesByEmotionalValence(valence: EmotionalValence): List<EmotionalMemory> {
        return memories.values.filter { it.emotionalValence == valence }
    }
    
    fun getMemoriesBySourceId(sourceId: String): List<EmotionalMemory> {
        return memories.values.filter { it.sourceId == sourceId }
    }
    
    fun getMemoriesBySourceType(sourceType: MemorySourceType): List<EmotionalMemory> {
        return memories.values.filter { it.sourceType == sourceType }
    }
    
    fun getMemoriesByMinimumIntensity(minIntensity: Float): List<EmotionalMemory> {
        return memories.values.filter { it.intensity >= minIntensity }
    }
    
    fun count(): Int {
        return memories.size
    }
}

/**
 * Working Memory Manager
 * 
 * Manages Sallie's working memory - a limited-capacity system for temporary
 * storage and manipulation of information necessary for cognitive tasks.
 */
class WorkingMemoryManager {
    companion object {
        // Maximum capacity of working memory (Miller's magic number 7±2)
        private const val WORKING_MEMORY_CAPACITY = 9
        
        // Time in milliseconds after which an item will be considered for removal
        private const val WORKING_MEMORY_RETENTION_TIME = 1000 * 60 * 10 // 10 minutes
    }
    
    private val coroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    
    // Using LinkedHashMap to maintain insertion order
    private val workingMemories = Collections.synchronizedMap(LinkedHashMap<String, WorkingMemoryItem>())
    
    // StateFlow to observe working memory changes
    private val _workingMemoryFlow = MutableStateFlow<List<BaseMemory>>(emptyList())
    val workingMemoryFlow = _workingMemoryFlow.asStateFlow()
    
    init {
        // Start the memory maintenance process
        coroutineScope.launch {
            while (true) {
                cleanupStaleMemories()
                delay(60_000) // Check every minute
            }
        }
    }
    
    /**
     * Add a memory to working memory
     */
    fun <T : BaseMemory> addToWorkingMemory(memory: T) {
        synchronized(workingMemories) {
            // If memory already exists, update it
            if (workingMemories.containsKey(memory.id)) {
                workingMemories[memory.id] = WorkingMemoryItem(memory, System.currentTimeMillis())
            } else {
                // If we're at capacity, remove the oldest memory
                if (workingMemories.size >= WORKING_MEMORY_CAPACITY) {
                    val oldest = workingMemories.entries.minByOrNull { it.value.timestamp }
                    oldest?.let { workingMemories.remove(it.key) }
                }
                
                // Add the new memory
                workingMemories[memory.id] = WorkingMemoryItem(memory, System.currentTimeMillis())
            }
            
            // Update the flow
            _workingMemoryFlow.value = workingMemories.values.map { it.memory }
        }
    }
    
    /**
     * Add multiple memories to working memory
     */
    fun <T : BaseMemory> addToWorkingMemories(memories: List<T>) {
        memories.forEach { addToWorkingMemory(it) }
    }
    
    /**
     * Get all memories in working memory
     */
    fun getWorkingMemories(): List<BaseMemory> {
        return synchronized(workingMemories) {
            workingMemories.values.map { it.memory }
        }
    }
    
    /**
     * Get a specific memory from working memory
     */
    fun getWorkingMemory(id: String): BaseMemory? {
        return workingMemories[id]?.memory
    }
    
    /**
     * Clear all memories from working memory
     */
    fun clearWorkingMemory() {
        synchronized(workingMemories) {
            workingMemories.clear()
            _workingMemoryFlow.value = emptyList()
        }
    }
    
    /**
     * Remove memories that have been in working memory for too long
     */
    private fun cleanupStaleMemories() {
        val currentTime = System.currentTimeMillis()
        val staleCutoff = currentTime - WORKING_MEMORY_RETENTION_TIME
        
        synchronized(workingMemories) {
            val toRemove = workingMemories.entries.filter { it.value.timestamp < staleCutoff }
            toRemove.forEach { workingMemories.remove(it.key) }
            
            if (toRemove.isNotEmpty()) {
                _workingMemoryFlow.value = workingMemories.values.map { it.memory }
            }
        }
    }
    
    /**
     * Data class to hold a memory and its timestamp in working memory
     */
    private data class WorkingMemoryItem(val memory: BaseMemory, val timestamp: Long)
}

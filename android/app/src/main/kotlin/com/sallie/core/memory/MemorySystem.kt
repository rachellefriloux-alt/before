package com.sallie.core.memory

import android.content.Context
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneId
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap

/**
 * Sallie's Memory System
 * 
 * A comprehensive hierarchical memory system implementing human-like memory
 * structures including episodic, semantic, and emotional memory. This system
 * handles memory storage, retrieval, decay, reinforcement, and associations.
 * 
 * The memory system is designed to provide Sallie with natural recall capabilities,
 * contextual awareness, and the ability to form and strengthen connections between
 * memories over time through repeated access and emotional significance.
 */
class MemorySystem private constructor(private val context: Context) {

    companion object {
        @Volatile
        private var instance: MemorySystem? = null

        fun getInstance(context: Context): MemorySystem {
            return instance ?: synchronized(this) {
                instance ?: MemorySystem(context.applicationContext).also { instance = it }
            }
        }
        
        // For testing purposes
        internal fun resetInstance() {
            instance = null
        }
    }

    private val coroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    
    private val episodicMemoryStore = EpisodicMemoryStore()
    private val semanticMemoryStore = SemanticMemoryStore()
    private val emotionalMemoryStore = EmotionalMemoryStore()
    private val workingMemoryManager = WorkingMemoryManager()
    
    private val memoryProcessor = MemoryProcessor()
    private val memoryDecaySystem = MemoryDecaySystem()
    private val memoryIndexer = MemoryIndexer()
    private val memoryAssociationEngine = MemoryAssociationEngine()
    
    // Memory statistics
    private var totalEpisodicMemories = 0
    private var totalSemanticMemories = 0
    private var totalEmotionalMemories = 0
    private var totalAssociations = 0
    
    /**
     * Initialize the memory system
     */
    init {
        // Load existing memories from storage
        coroutineScope.launch {
            loadMemories()
            
            // Start memory maintenance processes
            memoryDecaySystem.startMaintenanceProcess()
            memoryAssociationEngine.startAssociationDiscovery()
        }
    }
    
    /**
     * Store a new episodic memory
     */
    fun storeEpisodicMemory(
        title: String,
        description: String,
        importance: Float,
        emotionalValence: EmotionalValence = EmotionalValence.NEUTRAL,
        tags: List<String> = emptyList(),
        relatedEntities: List<String> = emptyList(),
        timestamp: Long = System.currentTimeMillis()
    ): String {
        val memory = EpisodicMemory(
            id = UUID.randomUUID().toString(),
            title = title,
            description = description,
            creationTimestamp = timestamp,
            lastAccessTimestamp = timestamp,
            importance = importance,
            emotionalValence = emotionalValence,
            accessCount = 0,
            strengthFactor = calculateInitialStrength(importance, emotionalValence),
            tags = tags.toMutableList(),
            relatedEntities = relatedEntities.toMutableList()
        )
        
        episodicMemoryStore.addMemory(memory)
        
        // Add to working memory
        workingMemoryManager.addToWorkingMemory(memory)
        
        // Index the memory
        memoryIndexer.indexMemory(memory)
        
        // Process for semantic extraction
        memoryProcessor.processEpisodicMemory(memory)
        
        // Process for emotional significance
        if (emotionalValence != EmotionalValence.NEUTRAL) {
            storeEmotionalMemory(
                sourceId = memory.id,
                sourceType = MemorySourceType.EPISODIC,
                emotionalValence = emotionalValence,
                intensity = importance,
                description = "Emotional response to: $title",
                tags = tags
            )
        }
        
        totalEpisodicMemories++
        
        return memory.id
    }
    
    /**
     * Store a new semantic memory
     */
    fun storeSemanticMemory(
        concept: String,
        information: String,
        confidence: Float,
        source: String = "direct_input",
        tags: List<String> = emptyList(),
        relatedConcepts: List<String> = emptyList(),
        timestamp: Long = System.currentTimeMillis()
    ): String {
        val memory = SemanticMemory(
            id = UUID.randomUUID().toString(),
            concept = concept,
            information = information,
            creationTimestamp = timestamp,
            lastAccessTimestamp = timestamp,
            confidence = confidence,
            source = source,
            accessCount = 0,
            strengthFactor = calculateInitialStrength(confidence, EmotionalValence.NEUTRAL),
            tags = tags.toMutableList(),
            relatedConcepts = relatedConcepts.toMutableList()
        )
        
        semanticMemoryStore.addMemory(memory)
        
        // Add to working memory
        workingMemoryManager.addToWorkingMemory(memory)
        
        // Index the memory
        memoryIndexer.indexMemory(memory)
        
        totalSemanticMemories++
        
        return memory.id
    }
    
    /**
     * Store a new emotional memory
     */
    fun storeEmotionalMemory(
        sourceId: String,
        sourceType: MemorySourceType,
        emotionalValence: EmotionalValence,
        intensity: Float,
        description: String,
        tags: List<String> = emptyList(),
        timestamp: Long = System.currentTimeMillis()
    ): String {
        val memory = EmotionalMemory(
            id = UUID.randomUUID().toString(),
            sourceId = sourceId,
            sourceType = sourceType,
            emotionalValence = emotionalValence,
            intensity = intensity,
            description = description,
            creationTimestamp = timestamp,
            lastAccessTimestamp = timestamp,
            accessCount = 0,
            strengthFactor = intensity,
            tags = tags.toMutableList()
        )
        
        emotionalMemoryStore.addMemory(memory)
        
        // Add to working memory
        workingMemoryManager.addToWorkingMemory(memory)
        
        // Index the memory
        memoryIndexer.indexMemory(memory)
        
        totalEmotionalMemories++
        
        return memory.id
    }
    
    /**
     * Retrieve an episodic memory by ID
     */
    fun retrieveEpisodicMemory(id: String): EpisodicMemory? {
        val memory = episodicMemoryStore.getMemory(id)
        memory?.let {
            // Record access
            recordMemoryAccess(it)
            
            // Add to working memory
            workingMemoryManager.addToWorkingMemory(it)
        }
        return memory
    }
    
    /**
     * Retrieve a semantic memory by ID
     */
    fun retrieveSemanticMemory(id: String): SemanticMemory? {
        val memory = semanticMemoryStore.getMemory(id)
        memory?.let {
            // Record access
            recordMemoryAccess(it)
            
            // Add to working memory
            workingMemoryManager.addToWorkingMemory(it)
        }
        return memory
    }
    
    /**
     * Retrieve an emotional memory by ID
     */
    fun retrieveEmotionalMemory(id: String): EmotionalMemory? {
        val memory = emotionalMemoryStore.getMemory(id)
        memory?.let {
            // Record access
            recordMemoryAccess(it)
            
            // Add to working memory
            workingMemoryManager.addToWorkingMemory(it)
        }
        return memory
    }
    
    /**
     * Search for episodic memories
     */
    fun searchEpisodicMemories(
        query: String,
        limit: Int = 10,
        minStrength: Float = 0.1f,
        tags: List<String> = emptyList(),
        emotionalValence: EmotionalValence? = null,
        startTimestamp: Long? = null,
        endTimestamp: Long? = null
    ): List<EpisodicMemory> {
        val results = memoryIndexer.searchEpisodicMemories(
            query = query,
            tags = tags,
            emotionalValence = emotionalValence,
            minStrength = minStrength,
            startTimestamp = startTimestamp,
            endTimestamp = endTimestamp
        )
        
        return results.sortedByDescending { it.strengthFactor }.take(limit).also {
            // Record access for retrieved memories
            it.forEach { memory -> recordMemoryAccess(memory) }
            
            // Add to working memory
            workingMemoryManager.addToWorkingMemories(it)
        }
    }
    
    /**
     * Search for semantic memories
     */
    fun searchSemanticMemories(
        query: String,
        limit: Int = 10,
        minConfidence: Float = 0.3f,
        tags: List<String> = emptyList()
    ): List<SemanticMemory> {
        val results = memoryIndexer.searchSemanticMemories(
            query = query,
            tags = tags,
            minConfidence = minConfidence
        )
        
        return results.sortedByDescending { it.confidence }.take(limit).also {
            // Record access for retrieved memories
            it.forEach { memory -> recordMemoryAccess(memory) }
            
            // Add to working memory
            workingMemoryManager.addToWorkingMemories(it)
        }
    }
    
    /**
     * Search for emotional memories
     */
    fun searchEmotionalMemories(
        query: String,
        limit: Int = 10,
        emotionalValence: EmotionalValence? = null,
        minIntensity: Float = 0.3f,
        tags: List<String> = emptyList()
    ): List<EmotionalMemory> {
        val results = memoryIndexer.searchEmotionalMemories(
            query = query,
            emotionalValence = emotionalValence,
            minIntensity = minIntensity,
            tags = tags
        )
        
        return results.sortedByDescending { it.intensity }.take(limit).also {
            // Record access for retrieved memories
            it.forEach { memory -> recordMemoryAccess(memory) }
            
            // Add to working memory
            workingMemoryManager.addToWorkingMemories(it)
        }
    }
    
    /**
     * Get memories in working memory
     */
    fun getWorkingMemories(): List<BaseMemory> {
        return workingMemoryManager.getWorkingMemories()
    }
    
    /**
     * Create association between memories
     */
    fun createAssociation(
        sourceId: String, 
        targetId: String, 
        associationType: AssociationType,
        strength: Float = 0.5f
    ): String {
        val association = MemoryAssociation(
            id = UUID.randomUUID().toString(),
            sourceId = sourceId,
            targetId = targetId,
            associationType = associationType,
            creationTimestamp = System.currentTimeMillis(),
            lastAccessTimestamp = System.currentTimeMillis(),
            strength = strength,
            accessCount = 0
        )
        
        memoryAssociationEngine.addAssociation(association)
        totalAssociations++
        
        return association.id
    }
    
    /**
     * Get associated memories
     */
    fun getAssociatedMemories(memoryId: String, minStrength: Float = 0.1f): List<AssociatedMemory> {
        return memoryAssociationEngine.getAssociations(memoryId, minStrength)
    }
    
    /**
     * Manually reinforce a memory
     */
    fun reinforceMemory(id: String, reinforcementStrength: Float = 0.2f): Boolean {
        // Try to find in each store
        episodicMemoryStore.getMemory(id)?.let {
            it.strengthFactor = (it.strengthFactor + reinforcementStrength).coerceAtMost(1.0f)
            it.lastAccessTimestamp = System.currentTimeMillis()
            it.accessCount++
            return true
        }
        
        semanticMemoryStore.getMemory(id)?.let {
            it.strengthFactor = (it.strengthFactor + reinforcementStrength).coerceAtMost(1.0f)
            it.lastAccessTimestamp = System.currentTimeMillis()
            it.accessCount++
            return true
        }
        
        emotionalMemoryStore.getMemory(id)?.let {
            it.strengthFactor = (it.strengthFactor + reinforcementStrength).coerceAtMost(1.0f)
            it.lastAccessTimestamp = System.currentTimeMillis()
            it.accessCount++
            return true
        }
        
        return false
    }
    
    /**
     * Get memory statistics
     */
    fun getMemoryStatistics(): MemoryStatistics {
        return MemoryStatistics(
            totalEpisodicMemories = totalEpisodicMemories,
            totalSemanticMemories = totalSemanticMemories,
            totalEmotionalMemories = totalEmotionalMemories,
            totalAssociations = totalAssociations,
            workingMemorySize = workingMemoryManager.getWorkingMemories().size
        )
    }
    
    /**
     * Private helper functions
     */
    
    private fun recordMemoryAccess(memory: BaseMemory) {
        memory.lastAccessTimestamp = System.currentTimeMillis()
        memory.accessCount++
        memory.strengthFactor = calculateUpdatedStrength(memory)
    }
    
    private fun calculateInitialStrength(
        importance: Float, 
        emotionalValence: EmotionalValence
    ): Float {
        // Base strength from importance
        var strength = importance
        
        // Emotional memories are naturally stronger
        if (emotionalValence != EmotionalValence.NEUTRAL) {
            val emotionalFactor = when(emotionalValence) {
                EmotionalValence.STRONGLY_NEGATIVE, 
                EmotionalValence.STRONGLY_POSITIVE -> 0.3f
                EmotionalValence.NEGATIVE,
                EmotionalValence.POSITIVE -> 0.2f
                else -> 0f
            }
            strength += emotionalFactor
        }
        
        return strength.coerceIn(0.1f, 1.0f)
    }
    
    private fun calculateUpdatedStrength(memory: BaseMemory): Float {
        // Start with current strength
        var updatedStrength = memory.strengthFactor
        
        // Recently accessed memories get a boost
        val recencyBoost = calculateRecencyBoost(memory.lastAccessTimestamp)
        
        // Frequently accessed memories get a boost
        val frequencyBoost = (memory.accessCount.coerceAtMost(20) / 20f) * 0.2f
        
        updatedStrength += recencyBoost + frequencyBoost
        
        return updatedStrength.coerceIn(0.1f, 1.0f)
    }
    
    private fun calculateRecencyBoost(lastAccessTimestamp: Long): Float {
        val hoursSinceLastAccess = (System.currentTimeMillis() - lastAccessTimestamp) / (1000 * 60 * 60)
        
        // Recent accesses (within 24 hours) get a boost that diminishes over time
        return when {
            hoursSinceLastAccess < 1 -> 0.1f
            hoursSinceLastAccess < 6 -> 0.05f
            hoursSinceLastAccess < 24 -> 0.02f
            else -> 0f
        }
    }
    
    private suspend fun loadMemories() {
        // Implementation to load memories from storage
        // This would use the actual storage system
    }
    
    /**
     * Save all memories to persistent storage
     */
    fun saveMemories() {
        coroutineScope.launch {
            // Implementation to save memories to storage
        }
    }
    
    /**
     * Cleanup and shutdown the memory system
     */
    fun shutdown() {
        coroutineScope.launch {
            saveMemories()
            memoryDecaySystem.stopMaintenanceProcess()
            memoryAssociationEngine.stopAssociationDiscovery()
        }
    }
}

/**
 * Memory statistics data class
 */
data class MemoryStatistics(
    val totalEpisodicMemories: Int,
    val totalSemanticMemories: Int,
    val totalEmotionalMemories: Int,
    val totalAssociations: Int,
    val workingMemorySize: Int
)

/**
 * Associated memory data class
 */
data class AssociatedMemory(
    val memory: BaseMemory,
    val association: MemoryAssociation
)

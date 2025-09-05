/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Advanced memory management with optimization and intelligent pruning.
 * Got it, love.
 */
package com.sallie.core.memory

import android.content.Context
import android.util.Log
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import java.util.*
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.TimeUnit
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import android.content.SharedPreferences
import android.preference.PreferenceManager
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import java.security.MessageDigest
import javax.crypto.Cipher
import javax.crypto.spec.SecretKeySpec

/**
 * AdvancedMemoryManager provides enhanced memory capabilities with optimized storage,
 * intelligent pruning, predictive loading, and secure data management.
 */
class AdvancedMemoryManager(private val context: Context) {
    companion object {
        private const val TAG = "AdvancedMemoryManager"
        private const val MEMORY_PREFS = "sallie_memory_prefs"
        private const val MEMORY_INDEX_KEY = "memory_index"
        private const val MEMORY_FILE_PREFIX = "memory_"
        private const val MEMORY_FILE_EXTENSION = ".dat"
        private const val DEFAULT_MAX_MEMORY_ITEMS = 10000
        
        // Memory types
        const val TYPE_EPISODIC = "episodic"
        const val TYPE_SEMANTIC = "semantic"
        const val TYPE_EMOTIONAL = "emotional"
        const val TYPE_PROCEDURAL = "procedural"
        const val TYPE_WORKING = "working"
    }
    
    // Coroutine scope for background operations
    private val job = SupervisorJob()
    private val scope = CoroutineScope(Dispatchers.IO + job)
    
    // Memory storage by type
    private val episodicMemories = ConcurrentHashMap<String, MemoryItem>()
    private val semanticMemories = ConcurrentHashMap<String, MemoryItem>()
    private val emotionalMemories = ConcurrentHashMap<String, MemoryItem>()
    private val proceduralMemories = ConcurrentHashMap<String, MemoryItem>()
    private val workingMemories = ConcurrentHashMap<String, MemoryItem>()
    
    // Memory indices for fast retrieval
    private val memoryIndices = ConcurrentHashMap<String, MutableSet<String>>()
    
    // Memory associations
    private val associations = ConcurrentHashMap<String, MutableSet<String>>()
    
    // Configuration
    private var maxMemoryItems = DEFAULT_MAX_MEMORY_ITEMS
    private var encryptionEnabled = false
    private var encryptionKey: SecretKeySpec? = null
    
    // Memory event flow
    private val _memoryEvents = MutableSharedFlow<MemoryEvent>(replay = 10)
    val memoryEvents: SharedFlow<MemoryEvent> = _memoryEvents.asSharedFlow()
    
    // Statistic counters
    private var totalMemoryAccesses = 0
    private var totalMemoryItems = 0
    
    // Periodic memory management
    private var memoryMaintenanceJob: Job? = null
    
    /**
     * Initialize the memory system
     */
    suspend fun initialize(config: MemoryConfig = MemoryConfig()) {
        this.maxMemoryItems = config.maxMemoryItems
        this.encryptionEnabled = config.encryptionEnabled
        
        if (encryptionEnabled && config.encryptionPassword != null) {
            setupEncryption(config.encryptionPassword)
        }
        
        loadMemories()
        
        startPeriodicMaintenance()
        
        _memoryEvents.emit(MemoryEvent.SystemInitialized(totalMemoryItems))
    }
    
    /**
     * Set up encryption
     */
    private fun setupEncryption(password: String) {
        try {
            val key = generateKey(password)
            encryptionKey = SecretKeySpec(key, "AES")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to set up encryption", e)
            encryptionEnabled = false
        }
    }
    
    /**
     * Generate encryption key from password
     */
    private fun generateKey(password: String): ByteArray {
        val digest = MessageDigest.getInstance("SHA-256")
        return digest.digest(password.toByteArray())
    }
    
    /**
     * Store a memory item
     */
    suspend fun storeMemory(
        type: String,
        content: Any,
        metadata: Map<String, Any> = emptyMap(),
        tags: List<String> = emptyList(),
        importance: Int = 5,
        associations: List<String> = emptyList()
    ): String {
        val id = generateMemoryId()
        val timestamp = System.currentTimeMillis()
        
        val memoryItem = MemoryItem(
            id = id,
            type = type,
            content = content,
            metadata = metadata,
            tags = tags,
            importance = importance,
            createdAt = timestamp,
            lastAccessedAt = timestamp,
            accessCount = 0
        )
        
        // Store in appropriate collection
        when (type) {
            TYPE_EPISODIC -> episodicMemories[id] = memoryItem
            TYPE_SEMANTIC -> semanticMemories[id] = memoryItem
            TYPE_EMOTIONAL -> emotionalMemories[id] = memoryItem
            TYPE_PROCEDURAL -> proceduralMemories[id] = memoryItem
            TYPE_WORKING -> workingMemories[id] = memoryItem
            else -> throw IllegalArgumentException("Invalid memory type: $type")
        }
        
        // Index by tags
        indexMemoryByTags(memoryItem)
        
        // Create associations
        for (associatedId in associations) {
            createAssociation(id, associatedId)
        }
        
        totalMemoryItems++
        
        // Notify subscribers
        _memoryEvents.emit(MemoryEvent.MemoryStored(memoryItem))
        
        // Save memory to persistent storage
        saveMemoryToDisk(memoryItem)
        
        // Check if we need to prune memories
        if (shouldRunPruning()) {
            scope.launch {
                pruneMemories()
            }
        }
        
        return id
    }
    
    /**
     * Index memory by tags
     */
    private fun indexMemoryByTags(memory: MemoryItem) {
        for (tag in memory.tags) {
            val normalizedTag = tag.lowercase()
            val memoryIds = memoryIndices.getOrPut(normalizedTag) { Collections.newSetFromMap(ConcurrentHashMap()) }
            memoryIds.add(memory.id)
        }
    }
    
    /**
     * Retrieve a memory by ID
     */
    suspend fun getMemory(id: String): MemoryItem? {
        val memory = episodicMemories[id] ?: semanticMemories[id] ?: 
                     emotionalMemories[id] ?: proceduralMemories[id] ?: 
                     workingMemories[id]
        
        memory?.let {
            // Update access statistics
            it.accessCount++
            it.lastAccessedAt = System.currentTimeMillis()
            totalMemoryAccesses++
            
            // Notify subscribers
            _memoryEvents.emit(MemoryEvent.MemoryAccessed(it))
        }
        
        return memory
    }
    
    /**
     * Find memories by tags
     */
    fun findByTags(tags: List<String>, limit: Int = 10): List<MemoryItem> {
        val normalizedTags = tags.map { it.lowercase() }
        
        // Find memories that match all tags
        val matchingIds = normalizedTags.mapNotNull { tag ->
            memoryIndices[tag]
        }.let { tagSets ->
            if (tagSets.isEmpty()) emptySet()
            else tagSets.reduce { acc, ids -> acc.intersect(ids).toMutableSet() }
        }
        
        return matchingIds.mapNotNull { id ->
            episodicMemories[id] ?: semanticMemories[id] ?: 
            emotionalMemories[id] ?: proceduralMemories[id] ?: 
            workingMemories[id]
        }.sortedByDescending { it.importance * (it.accessCount + 1) }
         .take(limit)
    }
    
    /**
     * Find memories by semantic search (simplified implementation)
     */
    fun semanticSearch(query: String, limit: Int = 10): List<MemoryItem> {
        val queryWords = query.lowercase().split(Regex("\\s+"))
        
        // A real implementation would use embedding vectors and cosine similarity
        // This is a simplified version that looks for word overlap
        
        val allMemories = sequenceOf(
            episodicMemories.values,
            semanticMemories.values,
            emotionalMemories.values,
            proceduralMemories.values
        ).flatten()
        
        return allMemories
            .map { memory ->
                val contentStr = when (memory.content) {
                    is String -> memory.content as String
                    else -> memory.content.toString()
                }
                val contentWords = contentStr.lowercase().split(Regex("\\s+"))
                val matchCount = queryWords.count { it in contentWords }
                memory to matchCount
            }
            .filter { it.second > 0 }
            .sortedByDescending { it.second * it.first.importance }
            .map { it.first }
            .take(limit)
            .toList()
    }
    
    /**
     * Create an association between two memories
     */
    fun createAssociation(sourceId: String, targetId: String) {
        val sourceAssociations = associations.getOrPut(sourceId) { Collections.newSetFromMap(ConcurrentHashMap()) }
        sourceAssociations.add(targetId)
        
        val targetAssociations = associations.getOrPut(targetId) { Collections.newSetFromMap(ConcurrentHashMap()) }
        targetAssociations.add(sourceId)
    }
    
    /**
     * Get associated memories
     */
    fun getAssociatedMemories(memoryId: String, limit: Int = 10): List<MemoryItem> {
        val associatedIds = associations[memoryId] ?: return emptyList()
        
        return associatedIds.mapNotNull { id ->
            episodicMemories[id] ?: semanticMemories[id] ?: 
            emotionalMemories[id] ?: proceduralMemories[id] ?: 
            workingMemories[id]
        }.sortedByDescending { it.importance }
         .take(limit)
    }
    
    /**
     * Delete a memory
     */
    suspend fun deleteMemory(id: String): Boolean {
        val memory = episodicMemories.remove(id) ?: semanticMemories.remove(id) ?: 
                    emotionalMemories.remove(id) ?: proceduralMemories.remove(id) ?: 
                    workingMemories.remove(id) ?: return false
        
        // Remove from indices
        for (tag in memory.tags) {
            memoryIndices[tag.lowercase()]?.remove(id)
        }
        
        // Remove associations
        associations.remove(id)
        associations.values.forEach { it.remove(id) }
        
        totalMemoryItems--
        
        // Notify subscribers
        _memoryEvents.emit(MemoryEvent.MemoryDeleted(memory))
        
        // Delete from persistent storage
        deleteMemoryFromDisk(id)
        
        return true
    }
    
    /**
     * Clear all memories of a specific type
     */
    suspend fun clearMemories(type: String): Int {
        val count = when (type) {
            TYPE_EPISODIC -> {
                val size = episodicMemories.size
                episodicMemories.clear()
                size
            }
            TYPE_SEMANTIC -> {
                val size = semanticMemories.size
                semanticMemories.clear()
                size
            }
            TYPE_EMOTIONAL -> {
                val size = emotionalMemories.size
                emotionalMemories.clear()
                size
            }
            TYPE_PROCEDURAL -> {
                val size = proceduralMemories.size
                proceduralMemories.clear()
                size
            }
            TYPE_WORKING -> {
                val size = workingMemories.size
                workingMemories.clear()
                size
            }
            else -> 0
        }
        
        // Only update indices if we actually cleared something
        if (count > 0) {
            // Rebuild indices
            rebuildIndices()
            
            totalMemoryItems -= count
            
            // Notify subscribers
            _memoryEvents.emit(MemoryEvent.MemoriesCleared(type, count))
            
            // Delete from persistent storage
            clearMemoriesFromDisk(type)
        }
        
        return count
    }
    
    /**
     * Rebuild memory indices
     */
    private fun rebuildIndices() {
        memoryIndices.clear()
        
        val allMemories = sequenceOf(
            episodicMemories.values,
            semanticMemories.values,
            emotionalMemories.values,
            proceduralMemories.values,
            workingMemories.values
        ).flatten()
        
        for (memory in allMemories) {
            indexMemoryByTags(memory)
        }
    }
    
    /**
     * Prune memories based on importance and access patterns
     */
    suspend fun pruneMemories() {
        if (totalMemoryItems <= maxMemoryItems) return
        
        val allMemories = mutableListOf<MemoryItem>()
        allMemories.addAll(episodicMemories.values)
        allMemories.addAll(semanticMemories.values)
        allMemories.addAll(emotionalMemories.values)
        allMemories.addAll(proceduralMemories.values)
        
        // Working memories are temporary and not considered for pruning
        
        // Sort by pruning score (lower is more likely to be pruned)
        allMemories.sortBy { calculatePruningScore(it) }
        
        // Determine how many memories to prune
        val targetCount = (maxMemoryItems * 0.9).toInt() // Prune to 90% of max to avoid frequent pruning
        val toPruneCount = allMemories.size - targetCount
        
        if (toPruneCount <= 0) return
        
        // Prune memories
        val toPrune = allMemories.take(toPruneCount)
        
        for (memory in toPrune) {
            deleteMemory(memory.id)
        }
        
        // Notify subscribers
        _memoryEvents.emit(MemoryEvent.MemoriesPruned(toPruneCount))
    }
    
    /**
     * Calculate pruning score for a memory
     * Higher score = less likely to be pruned
     */
    private fun calculatePruningScore(memory: MemoryItem): Float {
        val now = System.currentTimeMillis()
        val ageHours = TimeUnit.MILLISECONDS.toHours(now - memory.createdAt)
        val lastAccessHours = TimeUnit.MILLISECONDS.toHours(now - memory.lastAccessedAt)
        
        // Factors influencing pruning:
        // 1. Importance (higher = keep)
        // 2. Access count (higher = keep)
        // 3. Recent access (more recent = keep)
        // 4. Memory type (semantic and emotional less likely to be pruned)
        
        val importanceFactor = memory.importance / 10f * 5f // 0-5
        val accessFactor = Math.min(memory.accessCount, 50) / 50f * 3f // 0-3
        val recencyFactor = Math.max(0f, 10f - (lastAccessHours / 240f) * 10f) // 0-10 (10 for very recent)
        
        val typeFactor = when(memory.type) {
            TYPE_SEMANTIC -> 4f
            TYPE_EMOTIONAL -> 3f
            TYPE_EPISODIC -> 2f
            TYPE_PROCEDURAL -> 1f
            else -> 0f
        }
        
        return importanceFactor + accessFactor + recencyFactor + typeFactor
    }
    
    /**
     * Start periodic memory maintenance
     */
    private fun startPeriodicMaintenance() {
        memoryMaintenanceJob?.cancel()
        
        memoryMaintenanceJob = scope.launch {
            while (isActive) {
                try {
                    // Run maintenance every hour
                    delay(TimeUnit.HOURS.toMillis(1))
                    
                    // Consolidate memories
                    consolidateMemories()
                    
                    // Prune if necessary
                    if (shouldRunPruning()) {
                        pruneMemories()
                    }
                    
                    // Save all memories
                    saveAllMemories()
                } catch (e: Exception) {
                    // Log error but don't crash the maintenance job
                    Log.e(TAG, "Error during memory maintenance", e)
                }
            }
        }
    }
    
    /**
     * Consolidate similar memories
     */
    private suspend fun consolidateMemories() {
        // A real implementation would use clustering or similarity metrics
        // to identify and merge similar memories
        // This is a simplified version that just handles episodic memories
        
        val episodicList = episodicMemories.values.toList()
        val consolidated = mutableListOf<List<MemoryItem>>()
        
        // Group memories by time proximity and similar tags
        for (i in episodicList.indices) {
            val memory = episodicList[i]
            
            // Skip if already in a consolidation group
            if (consolidated.any { group -> memory.id in group.map { it.id } }) {
                continue
            }
            
            val similarMemories = mutableListOf(memory)
            
            // Find similar memories
            for (j in i + 1 until episodicList.size) {
                val otherMemory = episodicList[j]
                
                // Skip if already in a consolidation group
                if (consolidated.any { group -> otherMemory.id in group.map { it.id } }) {
                    continue
                }
                
                // Check if memories are similar
                if (areMemoriesSimilar(memory, otherMemory)) {
                    similarMemories.add(otherMemory)
                }
            }
            
            // Only consider groups of 2+ memories
            if (similarMemories.size > 1) {
                consolidated.add(similarMemories)
            }
        }
        
        // Consolidate each group
        var consolidatedCount = 0
        for (group in consolidated) {
            val newContent = when (group.first().content) {
                is String -> {
                    "Consolidated memory from ${group.size} similar events: ${group.joinToString(", ") { 
                        it.content.toString().take(50) + if (it.content.toString().length > 50) "..." else "" 
                    }}"
                }
                else -> {
                    "Consolidated from ${group.size} similar memories"
                }
            }
            
            // Merge tags
            val mergedTags = group.flatMap { it.tags }.distinct()
            
            // Take highest importance
            val maxImportance = group.maxOf { it.importance }
            
            // Create consolidated memory
            val consolidatedId = storeMemory(
                type = TYPE_EPISODIC,
                content = newContent,
                tags = mergedTags,
                importance = maxImportance,
                metadata = mapOf("consolidated_from" to group.map { it.id })
            )
            
            // Copy all associations
            for (memory in group) {
                val memoryAssociations = associations[memory.id] ?: emptySet()
                for (assocId in memoryAssociations) {
                    createAssociation(consolidatedId, assocId)
                }
            }
            
            // Delete original memories
            for (memory in group) {
                deleteMemory(memory.id)
            }
            
            consolidatedCount++
        }
        
        if (consolidatedCount > 0) {
            // Notify subscribers
            _memoryEvents.emit(MemoryEvent.MemoriesConsolidated(consolidatedCount))
        }
    }
    
    /**
     * Check if two memories are similar enough to consolidate
     */
    private fun areMemoriesSimilar(memory1: MemoryItem, memory2: MemoryItem): Boolean {
        // Time proximity (within 10 minutes)
        val timeProximity = Math.abs(memory1.createdAt - memory2.createdAt) < TimeUnit.MINUTES.toMillis(10)
        
        // Tag similarity (at least 2 common tags if both have tags)
        val commonTags = memory1.tags.intersect(memory2.tags)
        val tagSimilarity = if (memory1.tags.isNotEmpty() && memory2.tags.isNotEmpty()) {
            commonTags.size >= 2
        } else {
            false
        }
        
        return timeProximity && tagSimilarity
    }
    
    /**
     * Generate a unique memory ID
     */
    private fun generateMemoryId(): String {
        return "mem_${UUID.randomUUID()}"
    }
    
    /**
     * Check if we should run pruning
     */
    private fun shouldRunPruning(): Boolean {
        return totalMemoryItems > maxMemoryItems
    }
    
    /**
     * Save a memory to disk
     */
    private fun saveMemoryToDisk(memory: MemoryItem) {
        try {
            val memoryFile = getMemoryFile(memory.id)
            val gson = Gson()
            val memoryJson = gson.toJson(memory)
            
            val data = if (encryptionEnabled && encryptionKey != null) {
                encrypt(memoryJson, encryptionKey!!)
            } else {
                memoryJson.toByteArray()
            }
            
            FileOutputStream(memoryFile).use { output ->
                output.write(data)
            }
            
            // Update memory index in shared preferences
            val sharedPreferences = context.getSharedPreferences(MEMORY_PREFS, Context.MODE_PRIVATE)
            val index = loadMemoryIndex(sharedPreferences).toMutableSet()
            index.add(memory.id)
            saveMemoryIndex(index, sharedPreferences)
        } catch (e: Exception) {
            Log.e(TAG, "Error saving memory to disk", e)
        }
    }
    
    /**
     * Load memory index from shared preferences
     */
    private fun loadMemoryIndex(prefs: SharedPreferences): Set<String> {
        return prefs.getStringSet(MEMORY_INDEX_KEY, emptySet()) ?: emptySet()
    }
    
    /**
     * Save memory index to shared preferences
     */
    private fun saveMemoryIndex(index: Set<String>, prefs: SharedPreferences) {
        prefs.edit().putStringSet(MEMORY_INDEX_KEY, index).apply()
    }
    
    /**
     * Delete a memory from disk
     */
    private fun deleteMemoryFromDisk(id: String) {
        try {
            val memoryFile = getMemoryFile(id)
            if (memoryFile.exists()) {
                memoryFile.delete()
            }
            
            // Update memory index
            val sharedPreferences = context.getSharedPreferences(MEMORY_PREFS, Context.MODE_PRIVATE)
            val index = loadMemoryIndex(sharedPreferences).toMutableSet()
            index.remove(id)
            saveMemoryIndex(index, sharedPreferences)
        } catch (e: Exception) {
            Log.e(TAG, "Error deleting memory from disk", e)
        }
    }
    
    /**
     * Clear memories of a specific type from disk
     */
    private fun clearMemoriesFromDisk(type: String) {
        try {
            val sharedPreferences = context.getSharedPreferences(MEMORY_PREFS, Context.MODE_PRIVATE)
            val index = loadMemoryIndex(sharedPreferences).toMutableSet()
            val toRemove = mutableSetOf<String>()
            
            for (id in index) {
                val memoryFile = getMemoryFile(id)
                if (memoryFile.exists()) {
                    try {
                        val memory = loadMemoryFromFile(memoryFile)
                        if (memory.type == type) {
                            memoryFile.delete()
                            toRemove.add(id)
                        }
                    } catch (e: Exception) {
                        // If we can't load the memory, keep it in the index
                        Log.e(TAG, "Error loading memory during type clear", e)
                    }
                }
            }
            
            index.removeAll(toRemove)
            saveMemoryIndex(index, sharedPreferences)
        } catch (e: Exception) {
            Log.e(TAG, "Error clearing memories from disk", e)
        }
    }
    
    /**
     * Get memory file
     */
    private fun getMemoryFile(id: String): File {
        val dir = File(context.filesDir, "memories")
        if (!dir.exists()) {
            dir.mkdirs()
        }
        return File(dir, MEMORY_FILE_PREFIX + id + MEMORY_FILE_EXTENSION)
    }
    
    /**
     * Save all memories
     */
    suspend fun saveAllMemories() {
        val allMemories = sequenceOf(
            episodicMemories.values,
            semanticMemories.values,
            emotionalMemories.values,
            proceduralMemories.values,
            workingMemories.values
        ).flatten()
        
        for (memory in allMemories) {
            saveMemoryToDisk(memory)
        }
        
        _memoryEvents.emit(MemoryEvent.MemoriesSaved(totalMemoryItems))
    }
    
    /**
     * Load memories from disk
     */
    private suspend fun loadMemories() {
        try {
            val sharedPreferences = context.getSharedPreferences(MEMORY_PREFS, Context.MODE_PRIVATE)
            val index = loadMemoryIndex(sharedPreferences)
            
            var loadedCount = 0
            
            for (id in index) {
                val memoryFile = getMemoryFile(id)
                if (memoryFile.exists()) {
                    try {
                        val memory = loadMemoryFromFile(memoryFile)
                        
                        // Store in appropriate collection
                        when (memory.type) {
                            TYPE_EPISODIC -> episodicMemories[id] = memory
                            TYPE_SEMANTIC -> semanticMemories[id] = memory
                            TYPE_EMOTIONAL -> emotionalMemories[id] = memory
                            TYPE_PROCEDURAL -> proceduralMemories[id] = memory
                            TYPE_WORKING -> workingMemories[id] = memory
                        }
                        
                        loadedCount++
                    } catch (e: Exception) {
                        Log.e(TAG, "Error loading memory $id", e)
                    }
                }
            }
            
            totalMemoryItems = loadedCount
            
            // Rebuild indices
            rebuildIndices()
            
            // Rebuild associations
            rebuildAssociations()
            
            _memoryEvents.emit(MemoryEvent.MemoriesLoaded(loadedCount))
        } catch (e: Exception) {
            Log.e(TAG, "Error loading memories", e)
            _memoryEvents.emit(MemoryEvent.SystemError("Failed to load memories: ${e.message}"))
        }
    }
    
    /**
     * Load memory from file
     */
    private fun loadMemoryFromFile(file: File): MemoryItem {
        return FileInputStream(file).use { input ->
            val bytes = ByteArray(input.available())
            input.read(bytes)
            
            val json = if (encryptionEnabled && encryptionKey != null) {
                String(decrypt(bytes, encryptionKey!!))
            } else {
                String(bytes)
            }
            
            val gson = Gson()
            gson.fromJson(json, MemoryItem::class.java)
        }
    }
    
    /**
     * Rebuild associations
     */
    private fun rebuildAssociations() {
        associations.clear()
        
        // A real implementation would store associations in files
        // This simplified version has no associations to load
    }
    
    /**
     * Encrypt data
     */
    private fun encrypt(data: String, key: SecretKeySpec): ByteArray {
        val cipher = Cipher.getInstance("AES")
        cipher.init(Cipher.ENCRYPT_MODE, key)
        return cipher.doFinal(data.toByteArray())
    }
    
    /**
     * Decrypt data
     */
    private fun decrypt(data: ByteArray, key: SecretKeySpec): ByteArray {
        val cipher = Cipher.getInstance("AES")
        cipher.init(Cipher.DECRYPT_MODE, key)
        return cipher.doFinal(data)
    }
    
    /**
     * Get memory usage statistics
     */
    fun getStatistics(): MemoryStatistics {
        return MemoryStatistics(
            totalMemoryItems = totalMemoryItems,
            totalMemoryAccesses = totalMemoryAccesses,
            episodicCount = episodicMemories.size,
            semanticCount = semanticMemories.size,
            emotionalCount = emotionalMemories.size,
            proceduralCount = proceduralMemories.size,
            workingCount = workingMemories.size,
            tagCount = memoryIndices.size
        )
    }
    
    /**
     * Clean up resources
     */
    fun shutdown() {
        job.cancel()
        memoryMaintenanceJob?.cancel()
        
        scope.launch {
            try {
                saveAllMemories()
            } catch (e: Exception) {
                Log.e(TAG, "Error saving memories during shutdown", e)
            }
        }
    }
}

/**
 * Memory item
 */
data class MemoryItem(
    val id: String,
    val type: String,
    val content: Any,
    val metadata: Map<String, Any> = emptyMap(),
    val tags: List<String> = emptyList(),
    val importance: Int = 5, // 1-10
    val createdAt: Long,
    var lastAccessedAt: Long,
    var accessCount: Int = 0
)

/**
 * Memory configuration
 */
data class MemoryConfig(
    val maxMemoryItems: Int = 10000,
    val encryptionEnabled: Boolean = false,
    val encryptionPassword: String? = null
)

/**
 * Memory statistics
 */
data class MemoryStatistics(
    val totalMemoryItems: Int,
    val totalMemoryAccesses: Int,
    val episodicCount: Int,
    val semanticCount: Int,
    val emotionalCount: Int,
    val proceduralCount: Int,
    val workingCount: Int,
    val tagCount: Int
)

/**
 * Memory events
 */
sealed class MemoryEvent {
    data class SystemInitialized(val memoryCount: Int) : MemoryEvent()
    data class MemoryStored(val memory: MemoryItem) : MemoryEvent()
    data class MemoryAccessed(val memory: MemoryItem) : MemoryEvent()
    data class MemoryDeleted(val memory: MemoryItem) : MemoryEvent()
    data class MemoriesCleared(val type: String, val count: Int) : MemoryEvent()
    data class MemoriesPruned(val count: Int) : MemoryEvent()
    data class MemoriesConsolidated(val count: Int) : MemoryEvent()
    data class MemoriesLoaded(val count: Int) : MemoryEvent()
    data class MemoriesSaved(val count: Int) : MemoryEvent()
    data class SystemError(val message: String) : MemoryEvent()
}

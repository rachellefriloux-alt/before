/*
 * Sallie 2.0 Module
 * Function: File-based implementation of the Memory Storage Service
 */
package com.sallie.core.memory

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.io.File
import java.nio.file.Files
import java.nio.file.Paths
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.locks.ReentrantReadWriteLock
import kotlin.concurrent.read
import kotlin.concurrent.write

/**
 * FileBasedMemoryStorage provides a simple file-based implementation of MemoryStorageService
 * that stores memories as JSON files in a directory structure.
 */
class FileBasedMemoryStorage(
    private val baseStoragePath: String
) : MemoryStorageService {

    private val json = Json { 
        prettyPrint = true 
        ignoreUnknownKeys = true
    }
    
    private val memoryCache = ConcurrentHashMap<String, HierarchicalMemorySystem.MemoryItem>()
    private val memoryFlows = ConcurrentHashMap<String, MutableStateFlow<HierarchicalMemorySystem.MemoryItem?>>()
    private val typeFlows = mutableMapOf<HierarchicalMemorySystem.MemoryType, MutableStateFlow<List<HierarchicalMemorySystem.MemoryItem>>>()
    
    private val lock = ReentrantReadWriteLock()
    
    init {
        // Initialize directory structure
        HierarchicalMemorySystem.MemoryType.values().forEach { type ->
            val dir = File("$baseStoragePath/${type.name.lowercase()}")
            if (!dir.exists()) {
                dir.mkdirs()
            }
            typeFlows[type] = MutableStateFlow(emptyList())
        }
        
        // Load all memories into cache on initialization
        loadAllMemories()
    }
    
    private fun loadAllMemories() {
        lock.write {
            HierarchicalMemorySystem.MemoryType.values().forEach { type ->
                val typeDir = File("$baseStoragePath/${type.name.lowercase()}")
                if (typeDir.exists()) {
                    typeDir.listFiles()?.filter { it.extension == "json" }?.forEach { file ->
                        try {
                            val content = file.readText()
                            val memory = json.decodeFromString<HierarchicalMemorySystem.MemoryItem>(content)
                            memoryCache[memory.id] = memory
                            memoryFlows.getOrPut(memory.id) { MutableStateFlow(null) }.value = memory
                        } catch (e: Exception) {
                            println("Failed to load memory from ${file.name}: ${e.message}")
                        }
                    }
                }
                updateTypeFlow(type)
            }
        }
    }
    
    private fun getPathForMemory(item: HierarchicalMemorySystem.MemoryItem): String {
        return "$baseStoragePath/${item.type.name.lowercase()}/${item.id}.json"
    }
    
    private fun updateTypeFlow(type: HierarchicalMemorySystem.MemoryType) {
        val memories = memoryCache.values.filter { it.type == type }
        typeFlows[type]?.value = memories
    }
    
    override suspend fun saveMemory(item: HierarchicalMemorySystem.MemoryItem): Boolean = withContext(Dispatchers.IO) {
        try {
            lock.write {
                val path = getPathForMemory(item)
                val file = File(path)
                
                // Ensure directory exists
                file.parentFile.mkdirs()
                
                // Write memory to file
                val content = json.encodeToString(item)
                file.writeText(content)
                
                // Update cache and flows
                memoryCache[item.id] = item
                memoryFlows.getOrPut(item.id) { MutableStateFlow(null) }.value = item
                updateTypeFlow(item.type)
            }
            true
        } catch (e: Exception) {
            println("Failed to save memory ${item.id}: ${e.message}")
            false
        }
    }
    
    override suspend fun saveMemories(items: Collection<HierarchicalMemorySystem.MemoryItem>): Boolean = withContext(Dispatchers.IO) {
        var allSucceeded = true
        
        for (item in items) {
            val success = saveMemory(item)
            if (!success) {
                allSucceeded = false
            }
        }
        
        allSucceeded
    }
    
    override suspend fun getMemory(id: String): HierarchicalMemorySystem.MemoryItem? = withContext(Dispatchers.IO) {
        lock.read {
            memoryCache[id]
        }
    }
    
    override suspend fun getMemoriesByType(type: HierarchicalMemorySystem.MemoryType): List<HierarchicalMemorySystem.MemoryItem> = withContext(Dispatchers.IO) {
        lock.read {
            memoryCache.values.filter { it.type == type }
        }
    }
    
    override suspend fun searchMemories(query: HierarchicalMemorySystem.MemoryQuery): List<HierarchicalMemorySystem.MemoryItem> = withContext(Dispatchers.IO) {
        lock.read {
            var candidates = if (query.types.isEmpty()) {
                memoryCache.values
            } else {
                memoryCache.values.filter { it.type in query.types }
            }
            
            // Apply text search filter
            if (query.searchText.isNotEmpty()) {
                val searchTerms = query.searchText.lowercase().split(" ")
                candidates = candidates.filter { memory ->
                    searchTerms.any { term ->
                        memory.content.lowercase().contains(term)
                    }
                }
            }
            
            // Apply certainty filter
            if (query.minCertainty > 0) {
                candidates = candidates.filter { it.certainty >= query.minCertainty }
            }
            
            // Apply emotional filter
            if (query.emotionalFilter != null) {
                candidates = candidates.filter {
                    it.emotionalValence >= query.emotionalFilter.first &&
                    it.emotionalValence <= query.emotionalFilter.second
                }
            }
            
            // Apply temporal filter
            if (query.temporalFilter != null) {
                candidates = candidates.filter {
                    it.created >= query.temporalFilter.first &&
                    it.created <= query.temporalFilter.second
                }
            }
            
            // Apply context tags filter
            if (query.contextTags.isNotEmpty()) {
                candidates = candidates.filter { memory ->
                    val memoryTags = memory.metadata["tags"]?.split(",") ?: emptyList()
                    query.contextTags.any { tag -> memoryTags.contains(tag) }
                }
            }
            
            // Apply entity filter
            if (query.associatedEntityFilter.isNotEmpty()) {
                candidates = candidates.filter { memory ->
                    query.associatedEntityFilter.any { entity ->
                        memory.context.associatedEntities.contains(entity)
                    }
                }
            }
            
            // Apply reinforcement filter
            if (query.reinforcementFilter != null) {
                candidates = candidates.filter { it.reinforcementScore >= query.reinforcementFilter }
            }
            
            // Sort the results
            candidates = when (query.sortBy) {
                HierarchicalMemorySystem.SortCriteria.SALIENCE -> 
                    candidates.sortedByDescending { it.calculateSalience() }
                HierarchicalMemorySystem.SortCriteria.RECENCY ->
                    candidates.sortedByDescending { it.lastAccessed }
                HierarchicalMemorySystem.SortCriteria.PRIORITY ->
                    candidates.sortedByDescending { it.priority }
                HierarchicalMemorySystem.SortCriteria.EMOTIONAL ->
                    candidates.sortedByDescending { Math.abs(it.emotionalValence) * it.emotionalIntensity }
                HierarchicalMemorySystem.SortCriteria.RELEVANCE -> {
                    if (query.searchText.isEmpty()) {
                        candidates.sortedByDescending { it.calculateSalience() }
                    } else {
                        // Simple relevance scoring based on term frequency
                        val searchTerms = query.searchText.lowercase().split(" ")
                        candidates.sortedByDescending { memory ->
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
            
            // Apply limit
            candidates.take(query.limit)
        }
    }
    
    override suspend fun deleteMemory(id: String): Boolean = withContext(Dispatchers.IO) {
        try {
            lock.write {
                val memory = memoryCache[id] ?: return@withContext false
                val file = File(getPathForMemory(memory))
                
                if (file.exists()) {
                    file.delete()
                }
                
                memoryCache.remove(id)
                memoryFlows[id]?.value = null
                memoryFlows.remove(id)
                updateTypeFlow(memory.type)
            }
            true
        } catch (e: Exception) {
            println("Failed to delete memory $id: ${e.message}")
            false
        }
    }
    
    override suspend fun deleteMemories(ids: Collection<String>): Boolean = withContext(Dispatchers.IO) {
        var allSucceeded = true
        
        for (id in ids) {
            val success = deleteMemory(id)
            if (!success) {
                allSucceeded = false
            }
        }
        
        allSucceeded
    }
    
    override suspend fun exportMemories(): String = withContext(Dispatchers.IO) {
        lock.read {
            val memories = memoryCache.values.toList()
            json.encodeToString(memories)
        }
    }
    
    override suspend fun importMemories(data: String): Int = withContext(Dispatchers.IO) {
        try {
            val memories = json.decodeFromString<List<HierarchicalMemorySystem.MemoryItem>>(data)
            var importedCount = 0
            
            lock.write {
                for (memory in memories) {
                    val path = getPathForMemory(memory)
                    val file = File(path)
                    
                    // Ensure directory exists
                    file.parentFile.mkdirs()
                    
                    // Write memory to file
                    val content = json.encodeToString(memory)
                    file.writeText(content)
                    
                    // Update cache and flows
                    memoryCache[memory.id] = memory
                    memoryFlows.getOrPut(memory.id) { MutableStateFlow(null) }.value = memory
                    
                    importedCount++
                }
                
                // Update all type flows
                HierarchicalMemorySystem.MemoryType.values().forEach { updateTypeFlow(it) }
            }
            
            importedCount
        } catch (e: Exception) {
            println("Failed to import memories: ${e.message}")
            0
        }
    }
    
    override fun observeMemory(id: String): Flow<HierarchicalMemorySystem.MemoryItem?> {
        return memoryFlows.getOrPut(id) { MutableStateFlow(memoryCache[id]) }
    }
    
    override fun observeMemoriesByType(type: HierarchicalMemorySystem.MemoryType): Flow<List<HierarchicalMemorySystem.MemoryItem>> {
        return typeFlows[type] ?: MutableStateFlow(emptyList())
    }
    
    override suspend fun getMemoryCount(): Int = withContext(Dispatchers.IO) {
        lock.read {
            memoryCache.size
        }
    }
    
    override suspend fun clearAllMemories(): Boolean = withContext(Dispatchers.IO) {
        try {
            lock.write {
                // Delete all memory files
                HierarchicalMemorySystem.MemoryType.values().forEach { type ->
                    val typeDir = File("$baseStoragePath/${type.name.lowercase()}")
                    if (typeDir.exists()) {
                        typeDir.listFiles()?.filter { it.extension == "json" }?.forEach { it.delete() }
                    }
                }
                
                // Clear cache and flows
                memoryCache.clear()
                memoryFlows.forEach { (_, flow) -> flow.value = null }
                typeFlows.forEach { (type, flow) -> flow.value = emptyList() }
            }
            true
        } catch (e: Exception) {
            println("Failed to clear memories: ${e.message}")
            false
        }
    }
}

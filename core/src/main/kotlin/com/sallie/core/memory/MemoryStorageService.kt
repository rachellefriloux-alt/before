/*
 * Sallie 2.0 Module
 * Function: Persistent storage for the hierarchical memory system
 */
package com.sallie.core.memory

import kotlinx.coroutines.flow.Flow

/**
 * Interface for memory persistence operations.
 * Implementations may store memories in database, file system, or cloud.
 */
interface MemoryStorageService {
    /**
     * Store a memory item persistently
     */
    suspend fun saveMemory(item: HierarchicalMemorySystem.MemoryItem): Boolean
    
    /**
     * Store multiple memory items in a batch
     */
    suspend fun saveMemories(items: Collection<HierarchicalMemorySystem.MemoryItem>): Boolean
    
    /**
     * Retrieve a memory by ID
     */
    suspend fun getMemory(id: String): HierarchicalMemorySystem.MemoryItem?
    
    /**
     * Retrieve memories by type
     */
    suspend fun getMemoriesByType(
        type: HierarchicalMemorySystem.MemoryType
    ): List<HierarchicalMemorySystem.MemoryItem>
    
    /**
     * Search for memories with advanced filtering
     */
    suspend fun searchMemories(
        query: HierarchicalMemorySystem.MemoryQuery
    ): List<HierarchicalMemorySystem.MemoryItem>
    
    /**
     * Delete a memory permanently
     */
    suspend fun deleteMemory(id: String): Boolean
    
    /**
     * Delete multiple memories in a batch
     */
    suspend fun deleteMemories(ids: Collection<String>): Boolean
    
    /**
     * Export all memories in a serializable format
     */
    suspend fun exportMemories(): String
    
    /**
     * Import memories from a serialized format
     */
    suspend fun importMemories(data: String): Int
    
    /**
     * Get memory as a flow for reactive updates
     */
    fun observeMemory(id: String): Flow<HierarchicalMemorySystem.MemoryItem?>
    
    /**
     * Get memories by type as a flow for reactive updates
     */
    fun observeMemoriesByType(type: HierarchicalMemorySystem.MemoryType): Flow<List<HierarchicalMemorySystem.MemoryItem>>
    
    /**
     * Total count of stored memories
     */
    suspend fun getMemoryCount(): Int
    
    /**
     * Clear all stored memories
     */
    suspend fun clearAllMemories(): Boolean
}

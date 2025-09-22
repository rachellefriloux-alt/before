/*
 * Sallie 2.0 Module
 * Function: Advanced indexing for efficient memory retrieval
 */
package com.sallie.core.memory

/**
 * Interface for advanced memory indexing capabilities.
 * Provides efficient retrieval through sophisticated indexing strategies.
 */
interface MemoryIndexer {
    /**
     * Index a memory item for efficient retrieval
     */
    suspend fun indexMemory(item: HierarchicalMemorySystem.MemoryItem)
    
    /**
     * Update index for an existing memory item
     */
    suspend fun updateIndex(item: HierarchicalMemorySystem.MemoryItem)
    
    /**
     * Remove a memory item from all indices
     */
    suspend fun removeFromIndex(id: String)
    
    /**
     * Search for memories using semantic matching
     */
    suspend fun semanticSearch(
        query: String, 
        limit: Int = 10, 
        minScore: Double = 0.7
    ): List<Pair<String, Double>> // List of (memoryId, matchScore)
    
    /**
     * Find memories with similar content
     */
    suspend fun findSimilarMemories(
        memoryId: String,
        limit: Int = 5,
        minSimilarity: Double = 0.7
    ): List<Pair<String, Double>> // List of (memoryId, similarityScore)
    
    /**
     * Get keyword occurrences across memory store
     */
    suspend fun getKeywordOccurrences(keyword: String): Map<String, Int>
    
    /**
     * Rebuild all indices from scratch
     */
    suspend fun rebuildIndices(memories: Collection<HierarchicalMemorySystem.MemoryItem>)
    
    /**
     * Get memory clusters by similarity
     */
    suspend fun getMemoryClusters(
        threshold: Double = 0.8,
        maxClusters: Int = 10
    ): Map<String, List<String>> // Map of cluster label -> list of memory IDs
    
    /**
     * Find memory chains (sequential memories)
     */
    suspend fun findMemoryChains(
        startMemoryId: String,
        maxDepth: Int = 5
    ): List<List<String>> // List of memory ID chains
    
    /**
     * Get memory index statistics
     */
    suspend fun getIndexStats(): Map<String, Any>
}

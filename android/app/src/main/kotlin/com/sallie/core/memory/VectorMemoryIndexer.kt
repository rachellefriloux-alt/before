/*
 * Sallie 2.0 Module
 * Function: Advanced vector-based memory indexer for efficient semantic retrieval
 */
package com.sallie.core.memory

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.locks.ReentrantReadWriteLock
import kotlin.concurrent.read
import kotlin.concurrent.write
import kotlin.math.sqrt

/**
 * VectorMemoryIndexer provides an implementation of MemoryIndexer that uses
 * vector embeddings for semantic search and similarity detection.
 */
class VectorMemoryIndexer(
    private val embeddingService: EmbeddingService? = null
) : MemoryIndexer {

    // Memory embeddings: memory ID -> vector embedding
    private val memoryEmbeddings = ConcurrentHashMap<String, FloatArray>()
    
    // Keyword index: word -> memory IDs
    private val keywordIndex = ConcurrentHashMap<String, MutableSet<String>>()
    
    // Entity index: entity name -> memory IDs
    private val entityIndex = ConcurrentHashMap<String, MutableSet<String>>()
    
    // Time index: timestamp bucket -> memory IDs
    private val timeIndex = sortedMapOf<Long, MutableSet<String>>()
    
    // Cluster index: cluster ID -> memory IDs
    private val clusterIndex = ConcurrentHashMap<String, MutableSet<String>>()
    
    private val lock = ReentrantReadWriteLock()
    
    override suspend fun indexMemory(item: HierarchicalMemorySystem.MemoryItem) {
        lock.write {
            // Index by keywords from content
            indexKeywords(item)
            
            // Index by entities
            indexEntities(item)
            
            // Index by time bucket (day resolution)
            indexByTime(item)
            
            // Generate and store embedding if embedding service available
            if (embeddingService != null) {
                val embedding = embeddingService.generateEmbedding(item.content)
                if (embedding != null) {
                    memoryEmbeddings[item.id] = embedding
                }
            }
        }
    }
    
    override suspend fun updateIndex(item: HierarchicalMemorySystem.MemoryItem) {
        // First remove from all indices
        removeFromIndex(item.id)
        
        // Then re-index
        indexMemory(item)
    }
    
    override suspend fun removeFromIndex(id: String) {
        lock.write {
            // Remove from embeddings
            memoryEmbeddings.remove(id)
            
            // Remove from keyword index
            keywordIndex.values.forEach { it.remove(id) }
            
            // Remove from entity index
            entityIndex.values.forEach { it.remove(id) }
            
            // Remove from time index
            timeIndex.values.forEach { it.remove(id) }
            
            // Remove from cluster index
            clusterIndex.values.forEach { it.remove(id) }
        }
    }
    
    override suspend fun semanticSearch(
        query: String, 
        limit: Int, 
        minScore: Double
    ): List<Pair<String, Double>> = withContext(Dispatchers.Default) {
        if (embeddingService == null) {
            // Fall back to keyword-based search if no embedding service
            keywordSearch(query, limit)
        } else {
            lock.read {
                val queryEmbedding = embeddingService.generateEmbedding(query) ?: return@withContext emptyList()
                
                val results = memoryEmbeddings.entries
                    .map { (memoryId, embedding) -> 
                        Pair(memoryId, cosineSimilarity(queryEmbedding, embedding))
                    }
                    .filter { it.second >= minScore }
                    .sortedByDescending { it.second }
                    .take(limit)
                
                results
            }
        }
    }
    
    private fun keywordSearch(query: String, limit: Int): List<Pair<String, Double>> {
        val terms = query.lowercase().split(Regex("\\s+"))
            .filter { it.length > 2 }
        
        val scores = mutableMapOf<String, Double>()
        
        lock.read {
            for (term in terms) {
                keywordIndex.keys
                    .filter { it.contains(term) }
                    .forEach { keyword ->
                        val matchScore = term.length.toDouble() / keyword.length.toDouble()
                        keywordIndex[keyword]?.forEach { memoryId ->
                            scores[memoryId] = scores.getOrDefault(memoryId, 0.0) + matchScore
                        }
                    }
            }
        }
        
        return scores.entries
            .sortedByDescending { it.value }
            .take(limit)
            .map { Pair(it.key, it.value / terms.size) } // Normalize score
    }
    
    override suspend fun findSimilarMemories(
        memoryId: String,
        limit: Int,
        minSimilarity: Double
    ): List<Pair<String, Double>> = withContext(Dispatchers.Default) {
        if (embeddingService == null || !memoryEmbeddings.containsKey(memoryId)) {
            return@withContext emptyList()
        }
        
        lock.read {
            val sourceEmbedding = memoryEmbeddings[memoryId] ?: return@withContext emptyList()
            
            val results = memoryEmbeddings.entries
                .filter { it.key != memoryId }
                .map { (id, embedding) -> 
                    Pair(id, cosineSimilarity(sourceEmbedding, embedding))
                }
                .filter { it.second >= minSimilarity }
                .sortedByDescending { it.second }
                .take(limit)
            
            results
        }
    }
    
    override suspend fun getKeywordOccurrences(keyword: String): Map<String, Int> = withContext(Dispatchers.Default) {
        lock.read {
            val matchingKeywords = keywordIndex.keys.filter { it.contains(keyword) }
            val result = mutableMapOf<String, Int>()
            
            for (matchingKeyword in matchingKeywords) {
                keywordIndex[matchingKeyword]?.forEach { memoryId ->
                    result[memoryId] = result.getOrDefault(memoryId, 0) + 1
                }
            }
            
            result
        }
    }
    
    override suspend fun rebuildIndices(memories: Collection<HierarchicalMemorySystem.MemoryItem>) = withContext(Dispatchers.Default) {
        lock.write {
            // Clear all indices
            memoryEmbeddings.clear()
            keywordIndex.clear()
            entityIndex.clear()
            timeIndex.clear()
            clusterIndex.clear()
            
            // Re-index all memories
            for (memory in memories) {
                indexMemory(memory)
            }
            
            // Recalculate clusters if we have embeddings
            if (embeddingService != null && memoryEmbeddings.isNotEmpty()) {
                calculateClusters()
            }
        }
    }
    
    override suspend fun getMemoryClusters(
        threshold: Double,
        maxClusters: Int
    ): Map<String, List<String>> = withContext(Dispatchers.Default) {
        lock.read {
            clusterIndex.entries
                .take(maxClusters)
                .associate { (clusterId, memoryIds) ->
                    clusterId to memoryIds.toList()
                }
        }
    }
    
    override suspend fun findMemoryChains(
        startMemoryId: String,
        maxDepth: Int
    ): List<List<String>> = withContext(Dispatchers.Default) {
        val chains = mutableListOf<List<String>>()
        
        lock.read {
            val visited = mutableSetOf<String>()
            val currentChain = mutableListOf<String>()
            
            fun dfs(memoryId: String, depth: Int) {
                if (depth > maxDepth || memoryId in visited) {
                    return
                }
                
                visited.add(memoryId)
                currentChain.add(memoryId)
                
                if (depth == maxDepth) {
                    chains.add(currentChain.toList())
                } else {
                    // Find semantically connected memories
                    val connected = findSimilarMemories(memoryId, 3, 0.8)
                        .map { it.first }
                        .filter { it !in visited }
                    
                    for (nextMemory in connected) {
                        dfs(nextMemory, depth + 1)
                    }
                }
                
                currentChain.removeAt(currentChain.size - 1)
                visited.remove(memoryId)
            }
            
            dfs(startMemoryId, 1)
        }
        
        chains
    }
    
    override suspend fun getIndexStats(): Map<String, Any> = withContext(Dispatchers.Default) {
        lock.read {
            mapOf(
                "totalEmbeddings" to memoryEmbeddings.size,
                "totalKeywords" to keywordIndex.size,
                "totalEntities" to entityIndex.size,
                "totalTimeBuckets" to timeIndex.size,
                "totalClusters" to clusterIndex.size,
                "averageMemoriesPerCluster" to if (clusterIndex.isEmpty()) 0 else
                    clusterIndex.values.sumOf { it.size } / clusterIndex.size.toDouble()
            )
        }
    }
    
    private fun indexKeywords(item: HierarchicalMemorySystem.MemoryItem) {
        val words = item.content.lowercase()
            .split(Regex("[\\s.,;:!?()\\[\\]{}\"']+"))
            .filter { it.length > 2 }
            .distinct()
        
        for (word in words) {
            keywordIndex.computeIfAbsent(word) { mutableSetOf() }.add(item.id)
        }
    }
    
    private fun indexEntities(item: HierarchicalMemorySystem.MemoryItem) {
        item.context.associatedEntities.forEach { entity ->
            entityIndex.computeIfAbsent(entity) { mutableSetOf() }.add(item.id)
        }
    }
    
    private fun indexByTime(item: HierarchicalMemorySystem.MemoryItem) {
        // Create a daily bucket (divide by milliseconds in a day)
        val dayBucket = item.created / (24 * 60 * 60 * 1000) * (24 * 60 * 60 * 1000)
        timeIndex.computeIfAbsent(dayBucket) { mutableSetOf() }.add(item.id)
    }
    
    private fun calculateClusters() {
        // Simple clustering based on similarity threshold
        // In a real implementation, this would use K-means or DBSCAN
        val threshold = 0.85
        val processedMemories = mutableSetOf<String>()
        var clusterCount = 0
        
        for (sourceId in memoryEmbeddings.keys) {
            if (sourceId in processedMemories) continue
            
            val clusterName = "cluster_${clusterCount++}"
            val cluster = mutableSetOf(sourceId)
            processedMemories.add(sourceId)
            
            val sourceEmbedding = memoryEmbeddings[sourceId] ?: continue
            
            for (targetId in memoryEmbeddings.keys) {
                if (targetId == sourceId || targetId in processedMemories) continue
                
                val targetEmbedding = memoryEmbeddings[targetId] ?: continue
                val similarity = cosineSimilarity(sourceEmbedding, targetEmbedding)
                
                if (similarity >= threshold) {
                    cluster.add(targetId)
                    processedMemories.add(targetId)
                }
            }
            
            if (cluster.size > 1) {
                clusterIndex[clusterName] = cluster
            }
        }
    }
    
    private fun cosineSimilarity(vec1: FloatArray, vec2: FloatArray): Double {
        if (vec1.size != vec2.size) return 0.0
        
        var dotProduct = 0.0
        var norm1 = 0.0
        var norm2 = 0.0
        
        for (i in vec1.indices) {
            dotProduct += vec1[i] * vec2[i]
            norm1 += vec1[i] * vec1[i]
            norm2 += vec2[i] * vec2[i]
        }
        
        if (norm1 <= 0 || norm2 <= 0) return 0.0
        
        return dotProduct / (sqrt(norm1) * sqrt(norm2))
    }
    
    /**
     * Interface for services that generate vector embeddings from text
     */
    interface EmbeddingService {
        /**
         * Generate a vector embedding for the given text
         */
        suspend fun generateEmbedding(text: String): FloatArray?
    }
}

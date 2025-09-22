/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Enhanced memory manager integrating hierarchical memory system.
 * Got it, love.
 */
package com.sallie.core.memory

import com.sallie.core.MemoryManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.concurrent.ConcurrentHashMap

/**
 * EnhancedMemoryManager extends Sallie 1.0's MemoryManager with
 * hierarchical memory capabilities while maintaining backward compatibility.
 * 
 * This integration allows Sallie to maintain her existing memory capabilities
 * while adding sophisticated multi-layered memory organization.
 */
class EnhancedMemoryManager {

    private val legacyMemoryManager = MemoryManager()
    private val hierarchicalMemory = HierarchicalMemorySystem()
    
    /**
     * Legacy memory item wrapper for compatibility
     */
    private fun wrapLegacyItem(item: MemoryManager.MemoryItem): HierarchicalMemorySystem.MemoryItem {
        // Map legacy memory to hierarchical memory (semantic by default)
        val memoryType = when (item.category) {
            "event", "experience" -> HierarchicalMemorySystem.MemoryType.EPISODIC
            "emotion", "feeling" -> HierarchicalMemorySystem.MemoryType.EMOTIONAL
            "skill", "ability" -> HierarchicalMemorySystem.MemoryType.PROCEDURAL
            else -> HierarchicalMemorySystem.MemoryType.SEMANTIC
        }
        
        // Extract emotional data if available
        val emotionalContext = item.emotionalContext
        val emotionalValence = if (emotionalContext.contains("positive")) 0.7
                              else if (emotionalContext.contains("negative")) -0.7
                              else 0.0
        
        val emotionalIntensity = when {
            emotionalContext.contains("strong") -> 0.9
            emotionalContext.contains("mild") -> 0.4
            else -> 0.5
        }
        
        // Build metadata from legacy fields
        val metadata = mutableMapOf<String, Any>()
        metadata["legacyKey"] = item.key
        metadata["legacyCategory"] = item.category
        
        if (item.relatedMemories.isNotEmpty()) {
            metadata["legacyRelated"] = item.relatedMemories
        }
        
        return HierarchicalMemorySystem.MemoryItem(
            id = "legacy_${item.key}",
            type = memoryType,
            content = item.value,
            priority = item.priority,
            created = item.created,
            lastAccessed = item.lastAccess,
            emotionalValence = emotionalValence,
            emotionalIntensity = emotionalIntensity,
            certainty = item.learningWeight,
            metadata = metadata
        )
    }
    
    /**
     * Store a memory item in both legacy and hierarchical systems
     */
    fun storeMemory(key: String, value: String, category: String = "general", priority: Int = 50): String {
        // Store in legacy system
        val legacyItem = MemoryManager.MemoryItem(
            key = key,
            value = value,
            category = category,
            priority = priority
        )
        legacyMemoryManager.storeMemory(key, legacyItem)
        
        // Determine memory type from category
        val memoryType = when (category) {
            "event", "experience" -> HierarchicalMemorySystem.MemoryType.EPISODIC
            "emotion", "feeling" -> HierarchicalMemorySystem.MemoryType.EMOTIONAL
            "skill", "ability" -> HierarchicalMemorySystem.MemoryType.PROCEDURAL
            else -> HierarchicalMemorySystem.MemoryType.SEMANTIC
        }
        
        // Store in hierarchical system
        val hierarchicalItem = HierarchicalMemorySystem.MemoryItem(
            id = "user_${key}",
            type = memoryType,
            content = value,
            priority = priority,
            metadata = mutableMapOf("legacyKey" to key, "category" to category)
        )
        
        return hierarchicalMemory.storeMemory(hierarchicalItem)
    }
    
    /**
     * Retrieve a memory by key using both systems
     */
    fun getMemory(key: String): HierarchicalMemorySystem.MemoryItem? {
        // Try hierarchical first with mapped ID
        val hierarchicalId = "user_${key}"
        val fromHierarchical = hierarchicalMemory.getMemory(hierarchicalId)
        if (fromHierarchical != null) {
            return fromHierarchical
        }
        
        // Fall back to legacy system
        val legacyMemory = legacyMemoryManager.getMemory(key)
        return legacyMemory?.let { wrapLegacyItem(it) }
    }
    
    /**
     * Search memories using enhanced capabilities
     */
    fun searchMemories(
        searchText: String = "",
        category: String? = null,
        limit: Int = 10
    ): List<HierarchicalMemorySystem.MemoryItem> {
        // Map category to memory type if provided
        val types = if (category != null) {
            val type = when (category) {
                "event", "experience" -> HierarchicalMemorySystem.MemoryType.EPISODIC
                "emotion", "feeling" -> HierarchicalMemorySystem.MemoryType.EMOTIONAL
                "skill", "ability" -> HierarchicalMemorySystem.MemoryType.PROCEDURAL
                else -> HierarchicalMemorySystem.MemoryType.SEMANTIC
            }
            setOf(type)
        } else {
            emptySet()
        }
        
        // Create hierarchical query
        val query = HierarchicalMemorySystem.MemoryQuery(
            searchText = searchText,
            types = types,
            limit = limit,
            contextTags = if (category != null) setOf(category) else emptySet()
        )
        
        // Search hierarchical memory
        val hierarchicalResults = hierarchicalMemory.searchMemories(query)
        
        // If we have enough results, return them
        if (hierarchicalResults.items.size >= limit) {
            return hierarchicalResults.items
        }
        
        // Otherwise, supplement with legacy memories
        val legacyResults = if (searchText.isEmpty() && category == null) {
            legacyMemoryManager.getAllMemories()
        } else if (category != null) {
            legacyMemoryManager.getMemoriesByCategory(category)
        } else {
            legacyMemoryManager.searchMemories(searchText)
        }
        
        // Convert legacy results to hierarchical format
        val mappedLegacyResults = legacyResults.map { wrapLegacyItem(it) }
        
        // Combine results, prioritizing hierarchical, and respect limit
        return (hierarchicalResults.items + mappedLegacyResults.filter { legacy ->
            hierarchicalResults.items.none { it.id == legacy.id }
        }).take(limit)
    }
    
    /**
     * Create an episodic memory (event-based)
     */
    fun createEpisodicMemory(
        content: String,
        priority: Int = 50,
        emotionalValence: Double = 0.0,
        emotionalIntensity: Double = 0.5,
        metadata: Map<String, Any> = emptyMap()
    ): String {
        val memory = hierarchicalMemory.createEpisodicMemory(
            content = content,
            priority = priority,
            emotionalValence = emotionalValence,
            emotionalIntensity = emotionalIntensity,
            metadata = metadata
        )
        
        // Store in hierarchical system
        val id = hierarchicalMemory.storeMemory(memory)
        
        // Also store in legacy system for backward compatibility
        val legacyKey = "episodic_${System.currentTimeMillis()}"
        legacyMemoryManager.storeMemory(
            legacyKey,
            MemoryManager.MemoryItem(
                key = legacyKey,
                value = content,
                category = "event",
                priority = priority,
                emotionalContext = if (emotionalValence > 0) "positive" else if (emotionalValence < 0) "negative" else "neutral"
            )
        )
        
        return id
    }
    
    /**
     * Create a semantic memory (knowledge/fact)
     */
    fun createSemanticMemory(
        content: String,
        certainty: Double = 1.0,
        priority: Int = 50,
        metadata: Map<String, Any> = emptyMap()
    ): String {
        val memory = hierarchicalMemory.createSemanticMemory(
            content = content,
            certainty = certainty,
            priority = priority,
            metadata = metadata
        )
        
        // Store in hierarchical system
        val id = hierarchicalMemory.storeMemory(memory)
        
        // Also store in legacy system for backward compatibility
        val legacyKey = "semantic_${System.currentTimeMillis()}"
        legacyMemoryManager.storeMemory(
            legacyKey,
            MemoryManager.MemoryItem(
                key = legacyKey,
                value = content,
                category = "general",
                priority = priority,
                learningWeight = certainty
            )
        )
        
        return id
    }
    
    /**
     * Create an emotional memory
     */
    fun createEmotionalMemory(
        content: String,
        emotionalValence: Double,
        emotionalIntensity: Double,
        priority: Int = 60,
        metadata: Map<String, Any> = emptyMap()
    ): String {
        val memory = hierarchicalMemory.createEmotionalMemory(
            content = content,
            emotionalValence = emotionalValence,
            emotionalIntensity = emotionalIntensity,
            priority = priority,
            metadata = metadata
        )
        
        // Store in hierarchical system
        val id = hierarchicalMemory.storeMemory(memory)
        
        // Also store in legacy system for backward compatibility
        val legacyKey = "emotional_${System.currentTimeMillis()}"
        val emotionalContext = when {
            emotionalValence > 0.5 -> "strong positive"
            emotionalValence > 0 -> "positive"
            emotionalValence > -0.5 -> "negative"
            else -> "strong negative"
        }
        
        legacyMemoryManager.storeMemory(
            legacyKey,
            MemoryManager.MemoryItem(
                key = legacyKey,
                value = content,
                category = "emotion",
                priority = priority,
                emotionalContext = emotionalContext
            )
        )
        
        return id
    }
    
    /**
     * Create a procedural memory (skills/abilities)
     */
    fun createProceduralMemory(
        content: String,
        priority: Int = 50,
        proficiency: Double = 0.5,
        metadata: Map<String, Any> = emptyMap()
    ): String {
        val memory = hierarchicalMemory.createProceduralMemory(
            content = content,
            priority = priority,
            proficiency = proficiency,
            metadata = metadata
        )
        
        // Store in hierarchical system
        val id = hierarchicalMemory.storeMemory(memory)
        
        // Also store in legacy system for backward compatibility
        val legacyKey = "procedural_${System.currentTimeMillis()}"
        legacyMemoryManager.storeMemory(
            legacyKey,
            MemoryManager.MemoryItem(
                key = legacyKey,
                value = content,
                category = "skill",
                priority = priority,
                learningWeight = proficiency
            )
        )
        
        return id
    }
    
    /**
     * Connect two memories to create associations
     */
    fun connectMemories(sourceId: String, targetId: String) {
        hierarchicalMemory.connectMemories(sourceId, targetId)
        
        // Also update legacy connections if possible
        val sourceMetadata = hierarchicalMemory.getMemory(sourceId)?.metadata
        val targetMetadata = hierarchicalMemory.getMemory(targetId)?.metadata
        
        val sourceLegacyKey = sourceMetadata?.get("legacyKey") as? String
        val targetLegacyKey = targetMetadata?.get("legacyKey") as? String
        
        if (sourceLegacyKey != null && targetLegacyKey != null) {
            val sourceMemory = legacyMemoryManager.getMemory(sourceLegacyKey)
            val targetMemory = legacyMemoryManager.getMemory(targetLegacyKey)
            
            if (sourceMemory != null && targetMemory != null) {
                sourceMemory.relatedMemories.add(targetLegacyKey)
                targetMemory.relatedMemories.add(sourceLegacyKey)
                
                legacyMemoryManager.storeMemory(sourceLegacyKey, sourceMemory)
                legacyMemoryManager.storeMemory(targetLegacyKey, targetMemory)
            }
        }
    }
    
    /**
     * Get related memories based on connections
     */
    fun getRelatedMemories(memoryId: String, limit: Int = 5): List<HierarchicalMemorySystem.MemoryItem> {
        return hierarchicalMemory.getRelatedMemories(memoryId, limit)
    }
    
    /**
     * Run memory consolidation (typically during idle time)
     */
    fun consolidateMemories() {
        hierarchicalMemory.consolidateMemories()
    }
    
    /**
     * Clean up old memories to prevent unlimited growth
     */
    fun cleanupMemories(maxMemories: Int = 10000) {
        hierarchicalMemory.cleanupMemories(maxMemories)
    }
    
    /**
     * Direct access to hierarchical memory for advanced operations
     */
    fun getHierarchicalMemory(): HierarchicalMemorySystem {
        return hierarchicalMemory
    }
    
    /**
     * Direct access to legacy memory for backward compatibility
     */
    fun getLegacyMemory(): MemoryManager {
        return legacyMemoryManager
    }
}

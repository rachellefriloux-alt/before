package com.sallie.core.memory

/**
 * Sallie's Memory Reinforcement System
 * 
 * This system handles the reinforcement of memories based on access patterns,
 * emotional significance, and explicit reinforcement. It's designed to simulate
 * natural memory consolidation processes where repeated access and emotional
 * significance strengthen memories over time.
 */
class MemoryReinforcementSystem {
    // Memory stores reference
    private var episodicMemoryStore: EpisodicMemoryStore? = null
    private var semanticMemoryStore: SemanticMemoryStore? = null
    private var emotionalMemoryStore: EmotionalMemoryStore? = null
    
    /**
     * Set memory stores for reinforcement processing
     */
    fun setMemoryStores(
        episodicStore: EpisodicMemoryStore,
        semanticStore: SemanticMemoryStore,
        emotionalStore: EmotionalMemoryStore
    ) {
        episodicMemoryStore = episodicStore
        semanticMemoryStore = semanticStore
        emotionalMemoryStore = emotionalStore
    }
    
    /**
     * Reinforces a memory when it's accessed
     * 
     * @param memoryType The type of memory being reinforced
     * @param memoryId The ID of the memory
     * @param reinforcementFactor Optional additional reinforcement factor
     */
    fun reinforceMemoryAccess(
        memoryType: MemoryType,
        memoryId: String,
        reinforcementFactor: Float = 1.0f
    ) {
        when (memoryType) {
            MemoryType.EPISODIC -> {
                episodicMemoryStore?.getMemoryById(memoryId)?.let { memory ->
                    reinforceMemory(memory, reinforcementFactor)
                }
            }
            MemoryType.SEMANTIC -> {
                semanticMemoryStore?.getMemoryById(memoryId)?.let { memory ->
                    reinforceMemory(memory, reinforcementFactor)
                }
            }
            MemoryType.EMOTIONAL -> {
                emotionalMemoryStore?.getMemoryById(memoryId)?.let { memory ->
                    reinforceMemory(memory, reinforcementFactor * 1.2f) // Emotional memories get stronger reinforcement
                }
            }
        }
    }
    
    /**
     * Apply reinforcement to a specific memory
     */
    private fun <T : BaseMemory> reinforceMemory(memory: T, reinforcementFactor: Float) {
        // Update last access timestamp
        memory.lastAccessTimestamp = System.currentTimeMillis()
        
        // Increment access count
        memory.accessCount++
        
        // Calculate reinforcement amount based on access history and provided factor
        val baseReinforcement = 0.05f * reinforcementFactor
        
        // Access recency bonus (more bonus for memories accessed less recently)
        val recencyBonus = calculateRecencyBonus(memory.lastAccessTimestamp)
        
        // Access frequency adjustment (logarithmic to prevent overreinforcement)
        val frequencyAdjustment = (1.0f + Math.log10(memory.accessCount.toDouble() + 1).toFloat()) / 5.0f
        
        // Calculate total reinforcement (capped to prevent excessive strengthening)
        val totalReinforcement = (baseReinforcement * recencyBonus * frequencyAdjustment).coerceAtMost(0.25f)
        
        // Apply reinforcement
        memory.strengthFactor = (memory.strengthFactor + totalReinforcement).coerceAtMost(1.0f)
        
        // For episodic or emotional memories, propagate reinforcement to associated memories
        propagateReinforcementToAssociatedMemories(memory, totalReinforcement * 0.5f)
    }
    
    /**
     * Calculate recency bonus based on last access time
     */
    private fun calculateRecencyBonus(lastAccessTimestamp: Long): Float {
        val currentTime = System.currentTimeMillis()
        val daysSinceLastAccess = (currentTime - lastAccessTimestamp) / (1000.0 * 60 * 60 * 24)
        
        // More bonus for memories that haven't been accessed in a while
        return when {
            daysSinceLastAccess < 1 -> 1.0f
            daysSinceLastAccess < 7 -> 1.2f
            daysSinceLastAccess < 30 -> 1.5f
            else -> 2.0f
        }
    }
    
    /**
     * Reinforces a memory with emotional significance
     */
    fun reinforceEmotionalMemory(
        memoryId: String, 
        emotionalValence: EmotionalValence,
        intensity: Float
    ) {
        episodicMemoryStore?.getMemoryById(memoryId)?.let { memory ->
            // Stronger reinforcement for more intense emotions
            val emotionalFactor = when (emotionalValence) {
                EmotionalValence.STRONGLY_POSITIVE, 
                EmotionalValence.STRONGLY_NEGATIVE -> 2.0f * intensity
                EmotionalValence.POSITIVE,
                EmotionalValence.NEGATIVE -> 1.5f * intensity
                EmotionalValence.NEUTRAL -> 1.0f * intensity
            }
            
            reinforceMemory(memory, emotionalFactor)
            
            // Update emotional valence if intensity is significant
            if (intensity > 0.7f) {
                memory.emotionalValence = emotionalValence
            }
        }
    }
    
    /**
     * Explicitly reinforce a memory (e.g., through deliberate recall)
     */
    fun explicitReinforcement(
        memoryType: MemoryType,
        memoryId: String,
        intensity: Float = 1.0f
    ) {
        val factor = 1.5f * intensity // Explicit reinforcement is stronger
        reinforceMemoryAccess(memoryType, memoryId, factor)
    }
    
    /**
     * Propagate reinforcement to associated memories
     */
    private fun <T : BaseMemory> propagateReinforcementToAssociatedMemories(
        memory: T,
        propagationFactor: Float
    ) {
        when (memory) {
            is EpisodicMemory -> {
                // Get association IDs
                memory.associations.forEach { associationId ->
                    // Apply weaker reinforcement to associated memories
                    episodicMemoryStore?.getMemoryById(associationId)?.let { associatedMemory ->
                        reinforceMemory(associatedMemory, propagationFactor * 0.3f)
                    }
                    
                    semanticMemoryStore?.getMemoryById(associationId)?.let { associatedMemory ->
                        reinforceMemory(associatedMemory, propagationFactor * 0.2f)
                    }
                    
                    emotionalMemoryStore?.getMemoryById(associationId)?.let { associatedMemory ->
                        reinforceMemory(associatedMemory, propagationFactor * 0.4f)
                    }
                }
            }
            is EmotionalMemory -> {
                // Get association IDs
                memory.associations.forEach { associationId ->
                    // Emotional memories have stronger influence on associated memories
                    episodicMemoryStore?.getMemoryById(associationId)?.let { associatedMemory ->
                        reinforceMemory(associatedMemory, propagationFactor * 0.4f)
                    }
                    
                    semanticMemoryStore?.getMemoryById(associationId)?.let { associatedMemory ->
                        reinforceMemory(associatedMemory, propagationFactor * 0.3f)
                    }
                }
            }
            else -> {
                // For semantic memories, associations are usually weaker
                if (memory is SemanticMemory) {
                    memory.associations.forEach { associationId ->
                        semanticMemoryStore?.getMemoryById(associationId)?.let { associatedMemory ->
                            reinforceMemory(associatedMemory, propagationFactor * 0.1f)
                        }
                    }
                }
            }
        }
    }
    
    /**
     * Contextual reinforcement of memory clusters
     * 
     * This reinforces a group of related memories at once, such as when
     * reviewing a conversation or experience
     */
    fun contextualReinforcement(
        memoryIds: List<Pair<MemoryType, String>>,
        contextualFactor: Float = 1.0f
    ) {
        // First pass - reinforce individual memories
        memoryIds.forEach { (type, id) ->
            reinforceMemoryAccess(type, id, contextualFactor * 0.7f)
        }
        
        // Second pass - strengthen associations between these memories
        strengthenMemoryAssociations(memoryIds)
    }
    
    /**
     * Strengthen associations between memories in the same context
     */
    private fun strengthenMemoryAssociations(memoryIds: List<Pair<MemoryType, String>>) {
        for (i in memoryIds.indices) {
            for (j in (i + 1) until memoryIds.size) {
                val (typeA, idA) = memoryIds[i]
                val (typeB, idB) = memoryIds[j]
                
                // Create or strengthen association between these memories
                createOrStrengthenAssociation(typeA, idA, typeB, idB)
            }
        }
    }
    
    /**
     * Create or strengthen an association between two memories
     */
    private fun createOrStrengthenAssociation(
        typeA: MemoryType,
        idA: String,
        typeB: MemoryType,
        idB: String
    ) {
        // Get the memories
        val memoryA = getMemoryByTypeAndId(typeA, idA) ?: return
        val memoryB = getMemoryByTypeAndId(typeB, idB) ?: return
        
        // Add or update associations
        if (idB !in memoryA.associations) {
            memoryA.associations.add(idB)
        }
        
        if (idA !in memoryB.associations) {
            memoryB.associations.add(idA)
        }
    }
    
    /**
     * Helper to get a memory by type and ID
     */
    private fun getMemoryByTypeAndId(type: MemoryType, id: String): BaseMemory? {
        return when (type) {
            MemoryType.EPISODIC -> episodicMemoryStore?.getMemoryById(id)
            MemoryType.SEMANTIC -> semanticMemoryStore?.getMemoryById(id)
            MemoryType.EMOTIONAL -> emotionalMemoryStore?.getMemoryById(id)
        }
    }
}

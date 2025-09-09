package com.sallie.core.memory

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

/**
 * Memory Decay System
 * 
 * Implements the forgetting curve algorithm to simulate natural memory decay.
 * Memories decay over time unless they are reinforced through access or
 * significance. Higher strength and emotional significance slow decay.
 */
class MemoryDecaySystem {
    private val coroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    
    // Flag for maintenance process
    @Volatile
    private var isMaintenanceRunning = false
    
    // Stores and managers
    private var episodicMemoryStore: EpisodicMemoryStore? = null
    private var semanticMemoryStore: SemanticMemoryStore? = null
    private var emotionalMemoryStore: EmotionalMemoryStore? = null
    
    /**
     * Set memory stores for decay processing
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
     * Start the memory maintenance process
     */
    fun startMaintenanceProcess() {
        if (!isMaintenanceRunning) {
            isMaintenanceRunning = true
            coroutineScope.launch {
                while (isMaintenanceRunning) {
                    applyMemoryDecay()
                    pruneWeakMemories()
                    delay(86400_000) // Run once per day
                }
            }
        }
    }
    
    /**
     * Stop the memory maintenance process
     */
    fun stopMaintenanceProcess() {
        isMaintenanceRunning = false
    }
    
    /**
     * Apply memory decay to all memories
     */
    private fun applyMemoryDecay() {
        val currentTime = System.currentTimeMillis()
        
        // Apply decay to episodic memories
        episodicMemoryStore?.getAllMemories()?.forEach { memory ->
            val decayFactor = calculateDecayFactor(
                lastAccessTimestamp = memory.lastAccessTimestamp,
                currentTime = currentTime,
                strengthFactor = memory.strengthFactor,
                emotionalValence = memory.emotionalValence,
                accessCount = memory.accessCount
            )
            
            memory.strengthFactor = (memory.strengthFactor * decayFactor).coerceAtLeast(0.1f)
        }
        
        // Apply decay to semantic memories
        semanticMemoryStore?.getAllMemories()?.forEach { memory ->
            val decayFactor = calculateDecayFactor(
                lastAccessTimestamp = memory.lastAccessTimestamp,
                currentTime = currentTime,
                strengthFactor = memory.strengthFactor,
                emotionalValence = EmotionalValence.NEUTRAL, // Semantic memories are neutral
                accessCount = memory.accessCount
            )
            
            memory.strengthFactor = (memory.strengthFactor * decayFactor).coerceAtLeast(0.1f)
        }
        
        // Apply decay to emotional memories
        emotionalMemoryStore?.getAllMemories()?.forEach { memory ->
            val decayFactor = calculateDecayFactor(
                lastAccessTimestamp = memory.lastAccessTimestamp,
                currentTime = currentTime,
                strengthFactor = memory.strengthFactor,
                emotionalValence = memory.emotionalValence,
                accessCount = memory.accessCount
            )
            
            memory.strengthFactor = (memory.strengthFactor * decayFactor).coerceAtLeast(0.1f)
        }
    }
    
    /**
     * Calculate memory decay factor based on time elapsed and memory properties
     * Uses a modified Ebbinghaus forgetting curve formula
     */
    private fun calculateDecayFactor(
        lastAccessTimestamp: Long,
        currentTime: Long,
        strengthFactor: Float,
        emotionalValence: EmotionalValence,
        accessCount: Int
    ): Float {
        // Calculate time elapsed in days
        val daysElapsed = (currentTime - lastAccessTimestamp) / (1000.0 * 60 * 60 * 24)
        
        // Base decay rate (lower is slower decay)
        var decayRate = 0.05f
        
        // Adjust decay rate based on memory strength
        decayRate *= (1.0f - (strengthFactor * 0.5f))
        
        // Adjust decay rate based on emotional significance
        decayRate *= when (emotionalValence) {
            EmotionalValence.STRONGLY_NEGATIVE, 
            EmotionalValence.STRONGLY_POSITIVE -> 0.6f
            EmotionalValence.NEGATIVE,
            EmotionalValence.POSITIVE -> 0.8f
            EmotionalValence.NEUTRAL -> 1.0f
        }
        
        // Adjust decay rate based on access count (more accesses = slower decay)
        decayRate *= (1.0f - (accessCount.coerceAtMost(20) / 40f))
        
        // Calculate decay using modified Ebbinghaus formula: e^(-decayRate * t)
        val decay = Math.exp(-decayRate * daysElapsed).toFloat()
        
        return decay.coerceIn(0.5f, 0.99f) // Limit decay to reasonable bounds
    }
    
    /**
     * Prune very weak memories to conserve resources
     */
    private fun pruneWeakMemories() {
        // Define pruning threshold
        val pruneThreshold = 0.05f
        
        // Prune weak episodic memories
        val episodicMemoriesToPrune = episodicMemoryStore?.getAllMemories()
            ?.filter { it.strengthFactor < pruneThreshold }
            ?.filter { !hasEmotionalSignificance(it) }
            ?.map { it.id }
            ?: emptyList()
        
        episodicMemoriesToPrune.forEach { id ->
            episodicMemoryStore?.removeMemory(id)
        }
        
        // Prune weak semantic memories
        val semanticMemoriesToPrune = semanticMemoryStore?.getAllMemories()
            ?.filter { it.strengthFactor < pruneThreshold && it.accessCount < 2 }
            ?.map { it.id }
            ?: emptyList()
        
        semanticMemoriesToPrune.forEach { id ->
            semanticMemoryStore?.removeMemory(id)
        }
        
        // Emotional memories are preserved longer, so higher threshold for pruning
        val emotionalMemoriesToPrune = emotionalMemoryStore?.getAllMemories()
            ?.filter { it.strengthFactor < pruneThreshold / 2 && it.accessCount < 1 }
            ?.map { it.id }
            ?: emptyList()
        
        emotionalMemoriesToPrune.forEach { id ->
            emotionalMemoryStore?.removeMemory(id)
        }
    }
    
    /**
     * Check if an episodic memory has significant emotional content
     */
    private fun hasEmotionalSignificance(memory: EpisodicMemory): Boolean {
        return memory.emotionalValence != EmotionalValence.NEUTRAL && memory.importance > 0.7f
    }
}

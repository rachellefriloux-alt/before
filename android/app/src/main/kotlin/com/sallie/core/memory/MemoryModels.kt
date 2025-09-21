package com.sallie.core.memory

/**
 * Stub implementations for Memory System Demo
 * These are minimal implementations for compilation purposes
 */

enum class MemoryType {
    EPISODIC, SEMANTIC, EMOTIONAL
}

enum class EmotionalValence {
    STRONGLY_NEGATIVE, NEGATIVE, NEUTRAL, POSITIVE, STRONGLY_POSITIVE
}

data class MemoryResult(
    val memory: BaseMemory,
    val relevanceScore: Float
)

abstract class BaseMemory {
    abstract val id: String
}

data class EpisodicMemory(
    override val id: String,
    val content: String,
    val location: String? = null,
    val people: List<String> = emptyList(),
    val emotionalValence: EmotionalValence = EmotionalValence.NEUTRAL,
    val importance: Float = 0.5f
) : BaseMemory()

data class SemanticMemory(
    override val id: String,
    val concept: String,
    val definition: String,
    val confidence: Float = 0.5f
) : BaseMemory()

data class EmotionalMemory(
    override val id: String,
    val trigger: String,
    val response: String,
    val emotionalValence: EmotionalValence = EmotionalValence.NEUTRAL,
    val intensity: Float = 0.5f
) : BaseMemory()

data class WorkingMemoryItem(
    val memoryType: MemoryType,
    val memoryId: String,
    val accessTime: Long = System.currentTimeMillis()
)
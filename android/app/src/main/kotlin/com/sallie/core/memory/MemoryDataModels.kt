package com.sallie.core.memory

import kotlinx.serialization.Serializable
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneId

/**
 * Sallie's Memory Data Models
 * 
 * This file contains the data models for Sallie's memory system, including the
 * different types of memories (episodic, semantic, emotional) and their relationships.
 */

/**
 * Base memory class that all memory types inherit from
 */
@Serializable
abstract class BaseMemory {
    abstract val id: String
    abstract var lastAccessTimestamp: Long
    abstract var accessCount: Int
    abstract var strengthFactor: Float
    abstract val creationTimestamp: Long
    abstract val tags: MutableList<String>
    
    /**
     * Convert a timestamp to LocalDateTime
     */
    fun getCreationDateTime(): LocalDateTime {
        return Instant.ofEpochMilli(creationTimestamp)
            .atZone(ZoneId.systemDefault())
            .toLocalDateTime()
    }
    
    /**
     * Convert a last access timestamp to LocalDateTime
     */
    fun getLastAccessDateTime(): LocalDateTime {
        return Instant.ofEpochMilli(lastAccessTimestamp)
            .atZone(ZoneId.systemDefault())
            .toLocalDateTime()
    }
}

/**
 * Episodic memory represents memories of specific events and experiences
 */
@Serializable
data class EpisodicMemory(
    override val id: String,
    val title: String,
    val description: String,
    override val creationTimestamp: Long,
    override var lastAccessTimestamp: Long,
    val importance: Float,
    val emotionalValence: EmotionalValence,
    override var accessCount: Int,
    override var strengthFactor: Float,
    override val tags: MutableList<String>,
    val relatedEntities: MutableList<String>
) : BaseMemory()

/**
 * Semantic memory represents factual knowledge and concepts
 */
@Serializable
data class SemanticMemory(
    override val id: String,
    val concept: String,
    val information: String,
    override val creationTimestamp: Long,
    override var lastAccessTimestamp: Long,
    val confidence: Float,
    val source: String,
    override var accessCount: Int,
    override var strengthFactor: Float,
    override val tags: MutableList<String>,
    val relatedConcepts: MutableList<String>
) : BaseMemory()

/**
 * Emotional memory represents emotional responses to events and experiences
 */
@Serializable
data class EmotionalMemory(
    override val id: String,
    val sourceId: String,
    val sourceType: MemorySourceType,
    val emotionalValence: EmotionalValence,
    val intensity: Float,
    val description: String,
    override val creationTimestamp: Long,
    override var lastAccessTimestamp: Long,
    override var accessCount: Int,
    override var strengthFactor: Float,
    override val tags: MutableList<String>
) : BaseMemory()

/**
 * Memory association represents connections between memories
 */
@Serializable
data class MemoryAssociation(
    val id: String,
    val sourceId: String,
    val targetId: String,
    val associationType: AssociationType,
    val creationTimestamp: Long,
    var lastAccessTimestamp: Long,
    var strength: Float,
    var accessCount: Int
)

/**
 * Enum representing types of memory sources
 */
enum class MemorySourceType {
    EPISODIC,
    SEMANTIC,
    EXTERNAL
}

/**
 * Enum representing emotional valence categories
 */
enum class EmotionalValence {
    STRONGLY_NEGATIVE,
    NEGATIVE,
    NEUTRAL,
    POSITIVE,
    STRONGLY_POSITIVE
}

/**
 * Enum representing types of associations between memories
 */
enum class AssociationType {
    CAUSAL,         // One memory caused the other
    TEMPORAL,       // Memories occurred around the same time
    SPATIAL,        // Memories occurred in the same location
    SIMILARITY,     // Memories share similar elements
    CONTRAST,       // Memories are opposites or contrasting
    PART_OF,        // One memory is part of the other
    CATEGORY,       // Memories belong to the same category
    SEMANTIC        // Memories are semantically related
}

/**
 * Memory search query for advanced searches
 */
data class MemoryQuery(
    val textQuery: String? = null,
    val tags: List<String>? = null,
    val emotionalValence: EmotionalValence? = null,
    val startDate: LocalDateTime? = null,
    val endDate: LocalDateTime? = null,
    val minStrength: Float? = null,
    val minConfidence: Float? = null,
    val sourceType: MemorySourceType? = null,
    val maxResults: Int = 10
)

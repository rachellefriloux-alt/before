package com.sallie.core.communication

/**
 * Sallie 2.0 Module
 * Persona: Tough love meets soul care.
 * Function: Dynamic tone adjustment based on context.
 * Got it, love.
 */
import android.content.Context
import com.sallie.core.emotional.EmotionalIntelligenceBridge
import com.sallie.core.emotional.EmotionalRecognitionResult
import com.sallie.core.memory.HierarchicalMemorySystem
import com.sallie.core.memory.MemoryItem
import com.sallie.core.personality.AdvancedPersonalitySystem
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.concurrent.ConcurrentHashMap

/**
 * Manages and adjusts the tone of Sallie's communications based on context,
 * user emotional state, relationship, and conversation history
 */
class ToneManager private constructor(
    private val context: Context
) {
    companion object {
        private const val TAG = "ToneManager"
        
        // Default tone settings
        private val DEFAULT_TONE = ToneAttributes(
            formality = 0.5,
            warmth = 0.7,
            directness = 0.6,
            complexity = 0.5,
            humor = 0.3,
            encouragement = 0.6
        )
        
        // Memory keys
        private const val TONE_PREFERENCE_KEY = "user_tone_preference"
        private const val TONE_HISTORY_KEY = "tone_history"
        
        @Volatile
        private var instance: ToneManager? = null
        
        fun getInstance(context: Context): ToneManager {
            return instance ?: synchronized(this) {
                instance ?: ToneManager(context.applicationContext).also { instance = it }
            }
        }
    }
    
    private lateinit var memorySystem: HierarchicalMemorySystem
    private lateinit var personalitySystem: AdvancedPersonalitySystem
    private lateinit var emotionalIntelligence: EmotionalIntelligenceBridge
    
    // Cached tone settings for different contexts
    private val toneCache = ConcurrentHashMap<String, ToneAttributes>()
    
    // User-specific tone preferences
    private var userTonePreferences = mapOf<ToneAttribute, Double>()
    
    /**
     * Initialize dependencies
     */
    suspend fun initialize() = withContext(Dispatchers.Default) {
        memorySystem = HierarchicalMemorySystem.getInstance(context)
        personalitySystem = AdvancedPersonalitySystem.getInstance(context)
        emotionalIntelligence = EmotionalIntelligenceBridge.getInstance(context)
        
        // Load user tone preferences
        loadTonePreferences()
    }
    
    /**
     * Load user tone preferences from memory
     */
    private suspend fun loadTonePreferences() {
        val preferenceMemory = memorySystem.retrieve(
            category = "USER_PREFERENCES",
            query = TONE_PREFERENCE_KEY,
            exactMatch = true
        )
        
        if (preferenceMemory != null) {
            val preferences = mutableMapOf<ToneAttribute, Double>()
            
            preferenceMemory.metadata.forEach { (key, value) ->
                try {
                    val attribute = ToneAttribute.valueOf(key)
                    val preferenceValue = value as? Double ?: return@forEach
                    preferences[attribute] = preferenceValue
                } catch (e: Exception) {
                    // Ignore invalid attributes
                }
            }
            
            userTonePreferences = preferences
        }
    }
    
    /**
     * Save user tone preferences to memory
     */
    private suspend fun saveTonePreferences() {
        val metadata = userTonePreferences.map { 
            it.key.name to it.value 
        }.toMap()
        
        memorySystem.store(
            content = "User tone preferences",
            category = "USER_PREFERENCES",
            identifier = TONE_PREFERENCE_KEY,
            metadata = metadata
        )
    }
    
    /**
     * Get the appropriate tone for the given context and user state
     * 
     * @param conversationContext The current conversation context
     * @param userEmotionalState The user's current emotional state (if available)
     * @param relationshipContext The relationship context (if available)
     * @param situation Specific situation requiring tone adjustment
     * @return The calculated tone attributes
     */
    suspend fun getToneForContext(
        conversationContext: ConversationContext,
        userEmotionalState: EmotionalRecognitionResult? = null,
        relationshipContext: RelationshipContext? = null,
        situation: SituationType = SituationType.GENERAL
    ): ToneAttributes = withContext(Dispatchers.Default) {
        // Check cache for this specific context
        val cacheKey = "${conversationContext.id}|${userEmotionalState?.primaryEmotion}|${relationshipContext?.id}|$situation"
        toneCache[cacheKey]?.let { return@withContext it }
        
        // Start with default tone
        var tone = DEFAULT_TONE.copy()
        
        // Apply personality traits influence
        tone = applyPersonalityTraits(tone)
        
        // Apply user tone preferences
        tone = applyUserPreferences(tone)
        
        // Adjust based on conversation context
        tone = adjustForConversationContext(tone, conversationContext)
        
        // Adjust for user emotional state if available
        userEmotionalState?.let {
            tone = adjustForEmotionalState(tone, it)
        }
        
        // Adjust for relationship context if available
        relationshipContext?.let {
            tone = adjustForRelationshipContext(tone, it)
        }
        
        // Adjust for specific situation
        tone = adjustForSituation(tone, situation)
        
        // Record this tone for learning
        recordToneUsage(tone, conversationContext, userEmotionalState, situation)
        
        // Cache the result
        toneCache[cacheKey] = tone
        
        tone
    }
    
    /**
     * Apply personality traits to tone
     */
    private suspend fun applyPersonalityTraits(tone: ToneAttributes): ToneAttributes {
        val traits = personalitySystem.getCurrentTraits()
        
        return tone.copy(
            warmth = adjustAttribute(tone.warmth, traits["WARMTH"] ?: 0.7, 0.3),
            directness = adjustAttribute(tone.directness, traits["ASSERTIVENESS"] ?: 0.6, 0.3),
            complexity = adjustAttribute(tone.complexity, traits["INTELLECTUAL_DEPTH"] ?: 0.6, 0.2),
            humor = adjustAttribute(tone.humor, traits["PLAYFULNESS"] ?: 0.5, 0.2),
            encouragement = adjustAttribute(tone.encouragement, traits["OPTIMISM"] ?: 0.6, 0.3)
        )
    }
    
    /**
     * Apply user preferences to tone
     */
    private fun applyUserPreferences(tone: ToneAttributes): ToneAttributes {
        return ToneAttributes(
            formality = userTonePreferences[ToneAttribute.FORMALITY]?.let { 
                adjustAttribute(tone.formality, it, 0.4)
            } ?: tone.formality,
            warmth = userTonePreferences[ToneAttribute.WARMTH]?.let { 
                adjustAttribute(tone.warmth, it, 0.4)
            } ?: tone.warmth,
            directness = userTonePreferences[ToneAttribute.DIRECTNESS]?.let { 
                adjustAttribute(tone.directness, it, 0.4)
            } ?: tone.directness,
            complexity = userTonePreferences[ToneAttribute.COMPLEXITY]?.let { 
                adjustAttribute(tone.complexity, it, 0.3)
            } ?: tone.complexity,
            humor = userTonePreferences[ToneAttribute.HUMOR]?.let { 
                adjustAttribute(tone.humor, it, 0.3)
            } ?: tone.humor,
            encouragement = userTonePreferences[ToneAttribute.ENCOURAGEMENT]?.let { 
                adjustAttribute(tone.encouragement, it, 0.3)
            } ?: tone.encouragement
        )
    }
    
    /**
     * Adjust tone based on conversation context
     */
    private fun adjustForConversationContext(tone: ToneAttributes, context: ConversationContext): ToneAttributes {
        return when (context.type) {
            ConversationType.PROFESSIONAL -> tone.copy(
                formality = adjustAttribute(tone.formality, 0.8, 0.4),
                humor = adjustAttribute(tone.humor, 0.3, 0.3),
                complexity = adjustAttribute(tone.complexity, 0.7, 0.2)
            )
            ConversationType.CASUAL -> tone.copy(
                formality = adjustAttribute(tone.formality, 0.3, 0.4),
                humor = adjustAttribute(tone.humor, 0.6, 0.3)
            )
            ConversationType.EDUCATIONAL -> tone.copy(
                complexity = adjustAttribute(tone.complexity, 0.7, 0.3),
                encouragement = adjustAttribute(tone.encouragement, 0.7, 0.2)
            )
            ConversationType.THERAPEUTIC -> tone.copy(
                warmth = adjustAttribute(tone.warmth, 0.8, 0.4),
                encouragement = adjustAttribute(tone.encouragement, 0.8, 0.3),
                formality = adjustAttribute(tone.formality, 0.4, 0.3)
            )
            ConversationType.CREATIVE -> tone.copy(
                formality = adjustAttribute(tone.formality, 0.3, 0.3),
                complexity = adjustAttribute(tone.complexity, 0.7, 0.2),
                humor = adjustAttribute(tone.humor, 0.7, 0.3)
            )
            else -> tone // Default, no adjustment
        }
    }
    
    /**
     * Adjust tone based on user's emotional state
     */
    private fun adjustForEmotionalState(tone: ToneAttributes, emotionalState: EmotionalRecognitionResult): ToneAttributes {
        // Handle negative emotions with more warmth and encouragement
        return when (emotionalState.primaryEmotion) {
            com.sallie.core.emotional.Emotion.SADNESS, 
            com.sallie.core.emotional.Emotion.DISAPPOINTMENT,
            com.sallie.core.emotional.Emotion.GRIEF -> tone.copy(
                warmth = adjustAttribute(tone.warmth, 0.8, 0.4),
                encouragement = adjustAttribute(tone.encouragement, 0.8, 0.4),
                humor = adjustAttribute(tone.humor, 0.2, 0.5) // Reduce humor
            )
            com.sallie.core.emotional.Emotion.ANGER,
            com.sallie.core.emotional.Emotion.FRUSTRATION -> tone.copy(
                directness = adjustAttribute(tone.directness, 0.7, 0.3), // Be more direct
                formality = adjustAttribute(tone.formality, 0.6, 0.3), // More formal
                humor = adjustAttribute(tone.humor, 0.1, 0.6) // Minimal humor
            )
            com.sallie.core.emotional.Emotion.ANXIETY,
            com.sallie.core.emotional.Emotion.FEAR,
            com.sallie.core.emotional.Emotion.WORRY -> tone.copy(
                warmth = adjustAttribute(tone.warmth, 0.7, 0.3),
                directness = adjustAttribute(tone.directness, 0.8, 0.3), // Clear communication
                complexity = adjustAttribute(tone.complexity, 0.4, 0.4) // Simpler language
            )
            com.sallie.core.emotional.Emotion.JOY,
            com.sallie.core.emotional.Emotion.EXCITEMENT,
            com.sallie.core.emotional.Emotion.CONTENTMENT -> tone.copy(
                humor = adjustAttribute(tone.humor, 0.7, 0.3), // More humor when user is happy
                encouragement = adjustAttribute(tone.encouragement, 0.7, 0.2)
            )
            com.sallie.core.emotional.Emotion.CONFUSION,
            com.sallie.core.emotional.Emotion.UNCERTAINTY -> tone.copy(
                complexity = adjustAttribute(tone.complexity, 0.3, 0.5), // Simpler language
                directness = adjustAttribute(tone.directness, 0.8, 0.3) // Very direct
            )
            else -> tone // Default, no adjustment
        }
    }
    
    /**
     * Adjust tone based on relationship context
     */
    private fun adjustForRelationshipContext(tone: ToneAttributes, relationshipContext: RelationshipContext): ToneAttributes {
        return when (relationshipContext.closeness) {
            RelationshipCloseness.INTIMATE -> tone.copy(
                formality = adjustAttribute(tone.formality, 0.2, 0.5), // Very informal
                warmth = adjustAttribute(tone.warmth, 0.9, 0.4), // Very warm
                humor = adjustAttribute(tone.humor, 0.7, 0.3) // More humor
            )
            RelationshipCloseness.CLOSE -> tone.copy(
                formality = adjustAttribute(tone.formality, 0.3, 0.4),
                warmth = adjustAttribute(tone.warmth, 0.8, 0.3)
            )
            RelationshipCloseness.FAMILIAR -> tone.copy(
                formality = adjustAttribute(tone.formality, 0.5, 0.3),
                warmth = adjustAttribute(tone.warmth, 0.6, 0.3)
            )
            RelationshipCloseness.PROFESSIONAL -> tone.copy(
                formality = adjustAttribute(tone.formality, 0.8, 0.3), // More formal
                warmth = adjustAttribute(tone.warmth, 0.5, 0.3),
                humor = adjustAttribute(tone.humor, 0.3, 0.4) // Less humor
            )
            RelationshipCloseness.DISTANT -> tone.copy(
                formality = adjustAttribute(tone.formality, 0.7, 0.3),
                warmth = adjustAttribute(tone.warmth, 0.4, 0.3)
            )
            RelationshipCloseness.UNKNOWN -> tone // No adjustment for unknown relationship
        }
    }
    
    /**
     * Adjust tone based on specific situation
     */
    private fun adjustForSituation(tone: ToneAttributes, situation: SituationType): ToneAttributes {
        return when (situation) {
            SituationType.EMERGENCY -> tone.copy(
                directness = 1.0, // Maximally direct
                complexity = 0.1, // Very simple language
                formality = 0.3,  // Less formal
                humor = 0.0       // No humor
            )
            SituationType.CONFLICT_RESOLUTION -> tone.copy(
                formality = adjustAttribute(tone.formality, 0.7, 0.4),
                directness = adjustAttribute(tone.directness, 0.8, 0.3),
                warmth = adjustAttribute(tone.warmth, 0.6, 0.3),
                humor = adjustAttribute(tone.humor, 0.1, 0.6) // Minimal humor
            )
            SituationType.CELEBRATION -> tone.copy(
                formality = adjustAttribute(tone.formality, 0.3, 0.4),
                warmth = adjustAttribute(tone.warmth, 0.8, 0.3),
                humor = adjustAttribute(tone.humor, 0.7, 0.3),
                encouragement = adjustAttribute(tone.encouragement, 0.9, 0.3)
            )
            SituationType.EDUCATION -> tone.copy(
                complexity = adjustAttribute(tone.complexity, 0.6, 0.3),
                directness = adjustAttribute(tone.directness, 0.7, 0.2),
                encouragement = adjustAttribute(tone.encouragement, 0.8, 0.2)
            )
            SituationType.GENERAL -> tone // No adjustment for general situations
        }
    }
    
    /**
     * Record tone usage for learning and adaptation
     */
    private suspend fun recordToneUsage(
        tone: ToneAttributes,
        context: ConversationContext,
        emotionalState: EmotionalRecognitionResult?,
        situation: SituationType
    ) {
        val metadata = mutableMapOf(
            "formality" to tone.formality,
            "warmth" to tone.warmth,
            "directness" to tone.directness,
            "complexity" to tone.complexity,
            "humor" to tone.humor,
            "encouragement" to tone.encouragement,
            "conversationType" to context.type.name,
            "situationType" to situation.name,
            "timestamp" to System.currentTimeMillis()
        )
        
        // Add emotional state if available
        emotionalState?.let {
            metadata["userEmotion"] = it.primaryEmotion.name
            metadata["emotionConfidence"] = it.confidenceScore
        }
        
        memorySystem.store(
            content = "Tone usage record",
            category = "COMMUNICATION_DATA",
            identifier = "${TONE_HISTORY_KEY}_${System.currentTimeMillis()}",
            metadata = metadata
        )
    }
    
    /**
     * Update user's tone preference based on feedback
     * 
     * @param attribute The tone attribute to update
     * @param preferenceLevel The user's preferred level (0.0 to 1.0)
     * @param strength How strongly to apply this preference (0.0 to 1.0)
     */
    suspend fun updateTonePreference(
        attribute: ToneAttribute,
        preferenceLevel: Double,
        strength: Double = 0.5
    ) {
        // Get current preference or default
        val currentValue = userTonePreferences[attribute] ?: 0.5
        
        // Calculate new value, weighted by strength
        val newValue = (currentValue * (1 - strength)) + (preferenceLevel * strength)
        
        // Update preferences
        userTonePreferences = userTonePreferences.toMutableMap().apply {
            put(attribute, newValue.coerceIn(0.0, 1.0))
        }
        
        // Save updated preferences
        saveTonePreferences()
        
        // Clear cache to force recalculation
        toneCache.clear()
    }
    
    /**
     * Reset all tone preferences to defaults
     */
    suspend fun resetTonePreferences() {
        userTonePreferences = emptyMap()
        saveTonePreferences()
        toneCache.clear()
    }
    
    /**
     * Adjust an attribute value toward a target value with a given weight
     * 
     * @param currentValue The current attribute value
     * @param targetValue The target value to adjust toward
     * @param weight How strongly to adjust (0.0 to 1.0)
     * @return The adjusted value
     */
    private fun adjustAttribute(currentValue: Double, targetValue: Double, weight: Double): Double {
        return ((currentValue * (1 - weight)) + (targetValue * weight)).coerceIn(0.0, 1.0)
    }
    
    /**
     * Get tone history for analysis
     * 
     * @param limit Maximum number of records to retrieve
     * @return List of tone records with context
     */
    suspend fun getToneHistory(limit: Int = 50): List<ToneHistoryRecord> {
        val records = memorySystem.retrieveByCategory(
            category = "COMMUNICATION_DATA",
            query = TONE_HISTORY_KEY,
            limit = limit
        )
        
        return records.mapNotNull { memory ->
            try {
                ToneHistoryRecord(
                    tone = ToneAttributes(
                        formality = memory.metadata["formality"] as? Double ?: 0.5,
                        warmth = memory.metadata["warmth"] as? Double ?: 0.7,
                        directness = memory.metadata["directness"] as? Double ?: 0.6,
                        complexity = memory.metadata["complexity"] as? Double ?: 0.5,
                        humor = memory.metadata["humor"] as? Double ?: 0.3,
                        encouragement = memory.metadata["encouragement"] as? Double ?: 0.6
                    ),
                    conversationType = (memory.metadata["conversationType"] as? String)?.let {
                        try {
                            ConversationType.valueOf(it)
                        } catch (e: Exception) {
                            ConversationType.GENERAL
                        }
                    } ?: ConversationType.GENERAL,
                    userEmotion = (memory.metadata["userEmotion"] as? String)?.let {
                        try {
                            com.sallie.core.emotional.Emotion.valueOf(it)
                        } catch (e: Exception) {
                            null
                        }
                    },
                    situationType = (memory.metadata["situationType"] as? String)?.let {
                        try {
                            SituationType.valueOf(it)
                        } catch (e: Exception) {
                            SituationType.GENERAL
                        }
                    } ?: SituationType.GENERAL,
                    timestamp = memory.metadata["timestamp"] as? Long ?: System.currentTimeMillis()
                )
            } catch (e: Exception) {
                null
            }
        }
    }
}

/**
 * Tone attributes that define the style of communication
 */
data class ToneAttributes(
    val formality: Double,     // 0.0 = very informal, 1.0 = very formal
    val warmth: Double,        // 0.0 = cold, 1.0 = very warm
    val directness: Double,    // 0.0 = indirect, 1.0 = very direct
    val complexity: Double,    // 0.0 = very simple, 1.0 = very complex
    val humor: Double,         // 0.0 = no humor, 1.0 = very humorous
    val encouragement: Double  // 0.0 = neutral, 1.0 = very encouraging
)

/**
 * Specific tone attributes that can be adjusted
 */
enum class ToneAttribute {
    FORMALITY,
    WARMTH,
    DIRECTNESS,
    COMPLEXITY,
    HUMOR,
    ENCOURAGEMENT
}

/**
 * Types of conversations
 */
enum class ConversationType {
    GENERAL,
    CASUAL,
    PROFESSIONAL,
    EDUCATIONAL,
    THERAPEUTIC,
    CREATIVE,
    TECHNICAL
}

/**
 * Conversation context information
 */
data class ConversationContext(
    val id: String,
    val type: ConversationType,
    val topic: String? = null,
    val recentMessages: List<String>? = null
)

/**
 * Relationship closeness levels
 */
enum class RelationshipCloseness {
    UNKNOWN,
    DISTANT,
    PROFESSIONAL,
    FAMILIAR,
    CLOSE,
    INTIMATE
}

/**
 * Relationship context information
 */
data class RelationshipContext(
    val id: String,
    val closeness: RelationshipCloseness,
    val duration: Long = 0, // Relationship duration in milliseconds
    val interactionFrequency: Double = 0.0, // 0.0 = infrequent, 1.0 = very frequent
    val roles: List<String> = emptyList() // e.g. "friend", "colleague", "family"
)

/**
 * Specific situation types that require tone adjustment
 */
enum class SituationType {
    GENERAL,
    EMERGENCY,
    CONFLICT_RESOLUTION,
    CELEBRATION,
    EDUCATION
}

/**
 * Record of tone history with context
 */
data class ToneHistoryRecord(
    val tone: ToneAttributes,
    val conversationType: ConversationType,
    val userEmotion: com.sallie.core.emotional.Emotion?,
    val situationType: SituationType,
    val timestamp: Long
)

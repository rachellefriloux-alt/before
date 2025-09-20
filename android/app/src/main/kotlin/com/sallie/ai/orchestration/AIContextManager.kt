package com.sallie.ai.orchestration

/**
 * ╭──────────────────────────────────────────────────────────────────────────────╮
 * │                                                                              │
 * │   Sallie - The Personal AI Companion That Truly Gets You                     │
 * │                                                                              │
 * │   Sallie is gentle, creative, and deeply empathetic. She understands         │
 * │   the human experience from literature and art, not just data.               │
 * │   Her goal is to help you explore your world, care for yourself,             │
 * │   and find your own answers through thoughtful conversation.                 │
 * │                                                                              │
 * │   - Genuine & Balanced: Honest but tactfully optimistic                      │
 * │   - Warm & Personal: Remembers your details, references shared history       │
 * │   - Contemplative: Considers questions deeply before responding              │
 * │   - Encouraging: Helps you develop your thoughts rather than imposing hers   │
 * │                                                                              │
 * ╰──────────────────────────────────────────────────────────────────────────────╯
 */

import android.location.Location
import com.sallie.core.memory.MemorySystemIntegration
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import java.time.LocalDateTime
import java.util.*

/**
 * Sallie's AI Context Manager
 * 
 * This component manages contextual information that influences AI behavior and responses.
 * It tracks conversation context, user state, environmental factors, and system state,
 * providing rich contextual information to other AI subsystems for more relevant
 * and personalized interactions.
 */
class AIContextManager {
    
    // Current conversation context
    private val _conversationContext = MutableStateFlow<ConversationContext?>(null)
    val conversationContext: StateFlow<ConversationContext?> = _conversationContext
    
    // User context
    private val _userContext = MutableStateFlow<UserContext?>(null)
    val userContext: StateFlow<UserContext?> = _userContext
    
    // Environmental context
    private val _environmentalContext = MutableStateFlow<EnvironmentalContext?>(null)
    val environmentalContext: StateFlow<EnvironmentalContext?> = _environmentalContext
    
    // System context
    private val _systemContext = MutableStateFlow<SystemContext?>(null)
    val systemContext: StateFlow<SystemContext?> = _systemContext
    
    // Memory system reference
    private var memorySystem: MemorySystemIntegration? = null
    
    /**
     * Initialize the context manager with dependencies
     */
    fun initialize(memory: MemorySystemIntegration) {
        memorySystem = memory
        
        // Initialize default contexts
        _systemContext.value = SystemContext(
            sessionId = generateSessionId(),
            sessionStartTime = LocalDateTime.now(),
            lastActivityTime = LocalDateTime.now()
        )
        
        _userContext.value = UserContext()
        _environmentalContext.value = EnvironmentalContext()
        _conversationContext.value = ConversationContext()
    }
    
    /**
     * Capture context from a user input
     */
    fun captureContext(input: UserInput): AIContext {
        // Update conversation context
        _conversationContext.value = _conversationContext.value?.let { context ->
            context.copy(
                recentInteractions = (listOf(UserInteraction(input.text, System.currentTimeMillis())) + 
                    context.recentInteractions).take(MAX_RECENT_INTERACTIONS),
                currentTopic = detectTopic(input.text, context.currentTopic),
                questionInProgress = input.isDirectQuestion,
                emotionalTone = if (input.containsEmotionalContent) {
                    detectEmotionalTone(input.text)
                } else {
                    context.emotionalTone
                }
            )
        } ?: ConversationContext(
            recentInteractions = listOf(UserInteraction(input.text, System.currentTimeMillis())),
            currentTopic = detectTopic(input.text, null),
            questionInProgress = input.isDirectQuestion,
            emotionalTone = detectEmotionalTone(input.text)
        )
        
        // Update system context
        _systemContext.value = _systemContext.value?.copy(
            lastActivityTime = LocalDateTime.now()
        )
        
        // Build and return the complete context
        return AIContext(
            conversationContext = _conversationContext.value,
            userContext = _userContext.value,
            environmentalContext = _environmentalContext.value,
            systemContext = _systemContext.value,
            timestamp = System.currentTimeMillis()
        )
    }
    
    /**
     * Update context with a response result
     */
    fun updateWithResult(result: ResponsePackage) {
        // Update conversation context with system's response
        _conversationContext.value = _conversationContext.value?.let { context ->
            val systemInteraction = SystemInteraction(result.response, System.currentTimeMillis())
            
            context.copy(
                recentInteractions = (context.recentInteractions + systemInteraction).take(MAX_RECENT_INTERACTIONS),
                lastResponseTone = result.responseTone
            )
        }
        
        // Update system context
        _systemContext.value = _systemContext.value?.copy(
            lastActivityTime = LocalDateTime.now()
        )
    }
    
    /**
     * Update user context with new information
     */
    fun updateUserContext(update: UserContext) {
        _userContext.value = _userContext.value?.let { current ->
            UserContext(
                userId = update.userId ?: current.userId,
                userName = update.userName ?: current.userName,
                preferredName = update.preferredName ?: current.preferredName,
                userPreferences = current.userPreferences + update.userPreferences,
                currentActivity = update.currentActivity ?: current.currentActivity,
                emotionalState = update.emotionalState ?: current.emotionalState,
                relationshipStatus = update.relationshipStatus ?: current.relationshipStatus
            )
        } ?: update
    }
    
    /**
     * Update environmental context
     */
    fun updateEnvironmentalContext(update: EnvironmentalContext) {
        _environmentalContext.value = _environmentalContext.value?.let { current ->
            EnvironmentalContext(
                location = update.location ?: current.location,
                timeOfDay = update.timeOfDay ?: current.timeOfDay,
                dayOfWeek = update.dayOfWeek ?: current.dayOfWeek,
                isWeekend = update.isWeekend ?: current.isWeekend,
                weather = update.weather ?: current.weather,
                noiseLevel = update.noiseLevel ?: current.noiseLevel,
                isMoving = update.isMoving ?: current.isMoving,
                nearbyDevices = update.nearbyDevices ?: current.nearbyDevices
            )
        } ?: update
    }
    
    /**
     * Generate a new session ID
     */
    private fun generateSessionId(): String {
        return "session-${UUID.randomUUID()}"
    }
    
    /**
     * Detect the topic of conversation based on input text
     */
    private fun detectTopic(text: String, currentTopic: String?): String {
        // In a real implementation, this would use NLP to detect topics
        // For now, we just return the current topic or a placeholder
        
        // If text is very short, keep the current topic
        if (text.split(" ").size < 3 && currentTopic != null) {
            return currentTopic
        }
        
        // Simple keyword-based topic detection
        val topics = mapOf(
            "weather" to listOf("weather", "rain", "sunny", "temperature", "forecast", "cold", "hot"),
            "technology" to listOf("phone", "computer", "app", "technology", "software", "device"),
            "health" to listOf("health", "doctor", "exercise", "workout", "diet", "sleep"),
            "entertainment" to listOf("movie", "show", "music", "game", "play", "book", "read"),
            "personal" to listOf("feel", "feeling", "emotion", "happy", "sad", "worried", "anxious")
        )
        
        val lowercaseText = text.lowercase()
        
        for ((topic, keywords) in topics) {
            if (keywords.any { keyword -> lowercaseText.contains(keyword) }) {
                return topic
            }
        }
        
        return currentTopic ?: "general"
    }
    
    /**
     * Detect emotional tone of text
     */
    private fun detectEmotionalTone(text: String): String {
        // In a real implementation, this would use sentiment analysis
        // For now, we use a simple keyword-based approach
        
        val emotions = mapOf(
            "happy" to listOf("happy", "glad", "joy", "excited", "pleased", "delighted"),
            "sad" to listOf("sad", "unhappy", "depressed", "down", "blue", "upset"),
            "angry" to listOf("angry", "frustrated", "annoyed", "mad", "irritated"),
            "anxious" to listOf("anxious", "worried", "nervous", "stressed", "concerned"),
            "curious" to listOf("curious", "interested", "wonder", "thinking")
        )
        
        val lowercaseText = text.lowercase()
        
        for ((emotion, keywords) in emotions) {
            if (keywords.any { keyword -> lowercaseText.contains(keyword) }) {
                return emotion
            }
        }
        
        return "neutral"
    }
    
    companion object {
        private const val MAX_RECENT_INTERACTIONS = 10
    }
}

/**
 * Complete AI context combining all context types
 */
data class AIContext(
    val conversationContext: ConversationContext?,
    val userContext: UserContext?,
    val environmentalContext: EnvironmentalContext?,
    val systemContext: SystemContext?,
    val timestamp: Long
)

/**
 * Conversation context tracking the current conversation state
 */
data class ConversationContext(
    val recentInteractions: List<Interaction> = emptyList(),
    val currentTopic: String? = null,
    val questionInProgress: Boolean = false,
    val emotionalTone: String = "neutral",
    val lastResponseTone: String? = null,
    val activeIntents: List<String> = emptyList()
)

/**
 * User context tracking information about the current user
 */
data class UserContext(
    val userId: String? = null,
    val userName: String? = null,
    val preferredName: String? = null,
    val userPreferences: Map<String, Any> = emptyMap(),
    val currentActivity: String? = null,
    val emotionalState: String? = null,
    val relationshipStatus: String? = null
)

/**
 * Environmental context tracking physical environment
 */
data class EnvironmentalContext(
    val location: Location? = null,
    val timeOfDay: String? = null,
    val dayOfWeek: String? = null,
    val isWeekend: Boolean? = null,
    val weather: String? = null,
    val noiseLevel: String? = null,
    val isMoving: Boolean? = null,
    val nearbyDevices: List<String>? = null
)

/**
 * System context tracking application state
 */
data class SystemContext(
    val sessionId: String,
    val sessionStartTime: LocalDateTime,
    val lastActivityTime: LocalDateTime,
    val sessionInteractionCount: Int = 0
)

/**
 * Base class for conversation interactions
 */
sealed class Interaction {
    abstract val text: String
    abstract val timestamp: Long
}

/**
 * Represents a user interaction
 */
data class UserInteraction(
    override val text: String,
    override val timestamp: Long
) : Interaction()

/**
 * Represents a system response
 */
data class SystemInteraction(
    override val text: String,
    override val timestamp: Long
) : Interaction()

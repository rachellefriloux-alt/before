package com.sallie.core.communication

/**
 * Sallie 2.0 Module
 * Persona: Tough love meets soul care.
 * Communication System Bridge.
 */
import android.content.Context
import android.util.Log
import com.sallie.core.emotional.EmotionalIntelligenceBridge
import com.sallie.core.emotional.EmotionalRecognitionResult
import com.sallie.core.memory.HierarchicalMemorySystem
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * Bridge that integrates all components of the Communication System and provides
 * a unified API for the rest of the application to interact with.
 */
class CommunicationBridge private constructor(
    private val context: Context,
    private val coroutineScope: CoroutineScope
) {
    companion object {
        private const val TAG = "CommunicationBridge"
        
        @Volatile
        private var instance: CommunicationBridge? = null
        
        fun getInstance(context: Context, coroutineScope: CoroutineScope): CommunicationBridge {
            return instance ?: synchronized(this) {
                instance ?: CommunicationBridge(context.applicationContext, coroutineScope).also { instance = it }
            }
        }
    }
    
    private lateinit var toneManager: ToneManager
    private lateinit var nlProcessor: NaturalLanguageProcessor
    private lateinit var socialIntelligence: SocialIntelligenceEngine
    private lateinit var emotionalIntelligence: EmotionalIntelligenceBridge
    private lateinit var memorySystem: HierarchicalMemorySystem
    
    private val _communicationState = MutableStateFlow<CommunicationState>(CommunicationState.Initializing)
    val communicationState: StateFlow<CommunicationState> = _communicationState
    
    private val _activeConversation = MutableStateFlow<ConversationState?>(null)
    val activeConversation: StateFlow<ConversationState?> = _activeConversation
    
    /**
     * Initialize the communication bridge and all dependencies
     */
    suspend fun initialize() = withContext(Dispatchers.Default) {
        try {
            _communicationState.value = CommunicationState.Initializing
            
            // Initialize components
            Log.d(TAG, "Initializing ToneManager...")
            toneManager = ToneManager.getInstance(context)
            toneManager.initialize()
            
            Log.d(TAG, "Initializing NaturalLanguageProcessor...")
            nlProcessor = NaturalLanguageProcessor.getInstance(context)
            nlProcessor.initialize()
            
            Log.d(TAG, "Initializing SocialIntelligenceEngine...")
            socialIntelligence = SocialIntelligenceEngine.getInstance(context)
            socialIntelligence.initialize()
            
            Log.d(TAG, "Initializing EmotionalIntelligenceBridge...")
            emotionalIntelligence = EmotionalIntelligenceBridge.getInstance(context)
            
            Log.d(TAG, "Initializing HierarchicalMemorySystem...")
            memorySystem = HierarchicalMemorySystem.getInstance(context)
            
            // Setup observers
            setupObservers()
            
            _communicationState.value = CommunicationState.Ready
            Log.d(TAG, "CommunicationBridge initialized successfully")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to initialize CommunicationBridge", e)
            _communicationState.value = CommunicationState.Error("Failed to initialize: ${e.message}")
            throw e
        }
    }
    
    /**
     * Setup observers for state changes
     */
    private fun setupObservers() {
        coroutineScope.launch {
            socialIntelligence.conversationStateFlow.collect { conversation ->
                _activeConversation.value = conversation
            }
        }
    }
    
    /**
     * Start a new conversation or continue an existing one
     * 
     * @param conversationId Unique ID for the conversation (optional)
     * @param type Type of conversation
     * @param userId User ID associated with this conversation
     * @param initialContext Initial context for the conversation
     * @return The conversation state
     */
    suspend fun startConversation(
        conversationId: String? = null,
        type: ConversationType = ConversationType.GENERAL,
        userId: String = "default_user",
        initialContext: Map<String, Any> = emptyMap()
    ): ConversationState = withContext(Dispatchers.Default) {
        val actualConversationId = conversationId ?: "conversation_${System.currentTimeMillis()}"
        
        try {
            val conversation = socialIntelligence.startConversation(
                conversationId = actualConversationId,
                type = type,
                userId = userId,
                initialContext = initialContext
            )
            
            Log.d(TAG, "Started conversation: ${conversation.id}")
            return@withContext conversation
        } catch (e: Exception) {
            Log.e(TAG, "Error starting conversation", e)
            throw e
        }
    }
    
    /**
     * Process a user message and generate a response
     * 
     * @param userMessage The user's message text
     * @param conversationId Optional conversation ID (uses active conversation if null)
     * @param additionalContext Optional additional context
     * @return The system's response
     */
    suspend fun processMessage(
        userMessage: String,
        conversationId: String? = null,
        additionalContext: Map<String, Any>? = null
    ): CommunicationResponse = withContext(Dispatchers.Default) {
        try {
            // Check for language first
            val languageResult = nlProcessor.detectLanguage(userMessage)
            
            // If not supported language with high confidence, return error
            if (languageResult.confidence > 0.8 && languageResult.languageCode != "en") {
                return@withContext CommunicationResponse.Error(
                    "I'm sorry, I currently only support English. " +
                    "Detected language: ${languageResult.languageCode}"
                )
            }
            
            // Analyze emotional state
            val emotionalResult = emotionalIntelligence.analyzeText(userMessage)
            
            // Process through social intelligence
            val response = socialIntelligence.processMessage(
                message = userMessage,
                conversationId = conversationId,
                emotionalState = emotionalResult,
                additionalContext = additionalContext
            )
            
            // Get current conversation
            val conversation = socialIntelligence.getConversation(response.id.split("_")[0])
            
            // Get intent and response mode
            val intent = conversation?.lastIntent
            val responseMode = response.metadata["responseMode"] as? String
            
            return@withContext CommunicationResponse.Success(
                messageId = response.id,
                text = response.text,
                timestamp = response.timestamp,
                intent = intent?.type?.name ?: "UNKNOWN",
                responseMode = responseMode ?: "INFORMATIONAL",
                emotionalRecognition = emotionalResult
            )
        } catch (e: Exception) {
            Log.e(TAG, "Error processing message", e)
            return@withContext CommunicationResponse.Error(
                "I'm sorry, I couldn't process your message: ${e.message}"
            )
        }
    }
    
    /**
     * End the current conversation
     * 
     * @param conversationId Optional conversation ID (uses active conversation if null)
     * @return True if successful
     */
    suspend fun endConversation(conversationId: String? = null): Boolean = withContext(Dispatchers.Default) {
        try {
            return@withContext socialIntelligence.endConversation(conversationId)
        } catch (e: Exception) {
            Log.e(TAG, "Error ending conversation", e)
            return@withContext false
        }
    }
    
    /**
     * Get all active conversations
     * 
     * @return List of active conversations
     */
    fun getActiveConversations(): List<ConversationState> {
        return socialIntelligence.getActiveConversations()
    }
    
    /**
     * Update user tone preference
     * 
     * @param attribute The tone attribute to update
     * @param level The preferred level (0.0 to 1.0)
     * @param strength How strongly to apply this preference (0.0 to 1.0)
     */
    suspend fun updateTonePreference(
        attribute: ToneAttribute,
        level: Double,
        strength: Double = 0.5
    ) {
        toneManager.updateTonePreference(attribute, level, strength)
    }
    
    /**
     * Get tone attributes for a specific context
     * 
     * @param conversationType Type of conversation
     * @param userId User ID for relationship context
     * @param situationType Specific situation type
     * @param emotionalState User's emotional state if available
     * @return Tone attributes
     */
    suspend fun getToneForContext(
        conversationType: ConversationType,
        userId: String = "default_user",
        situationType: SituationType = SituationType.GENERAL,
        emotionalState: EmotionalRecognitionResult? = null
    ): ToneAttributes = withContext(Dispatchers.Default) {
        val relationshipContext = socialIntelligence.getRelationshipContext(userId)
        
        val conversationContext = ConversationContext(
            id = "temp_${System.currentTimeMillis()}",
            type = conversationType
        )
        
        return@withContext toneManager.getToneForContext(
            conversationContext = conversationContext,
            relationshipContext = relationshipContext,
            userEmotionalState = emotionalState,
            situation = situationType
        )
    }
    
    /**
     * Analyze text for intent and entities
     * 
     * @param text Text to analyze
     * @return Analysis result
     */
    suspend fun analyzeText(text: String): TextAnalysisResult = withContext(Dispatchers.Default) {
        try {
            val intent = nlProcessor.recognizeIntent(text)
            val entities = nlProcessor.extractEntities(text)
            val sentiment = nlProcessor.parseText(text).firstOrNull()?.sentiment ?: Sentiment.NEUTRAL
            val language = nlProcessor.detectLanguage(text)
            
            return@withContext TextAnalysisResult(
                intent = intent,
                entities = entities,
                sentiment = sentiment,
                languageCode = language.languageCode,
                languageConfidence = language.confidence
            )
        } catch (e: Exception) {
            Log.e(TAG, "Error analyzing text", e)
            return@withContext TextAnalysisResult(
                intent = UserIntent(IntentType.UNKNOWN, 0.0f),
                entities = emptyList(),
                sentiment = Sentiment.NEUTRAL,
                languageCode = "en",
                languageConfidence = 0.5f,
                error = e.message
            )
        }
    }
    
    /**
     * Generate a response with specific tone attributes
     * 
     * @param template Response template with placeholders
     * @param context Context values for placeholders
     * @param toneAttributes Tone attributes to apply
     * @return Generated response
     */
    suspend fun generateResponse(
        template: String,
        context: Map<String, Any>,
        toneAttributes: ToneAttributes
    ): String = withContext(Dispatchers.Default) {
        return@withContext nlProcessor.generateResponse(template, context, toneAttributes)
    }
    
    /**
     * Reset all NLP caches
     */
    fun resetCaches() {
        nlProcessor.resetCaches()
    }
}

/**
 * Communication bridge state
 */
sealed class CommunicationState {
    object Initializing : CommunicationState()
    object Ready : CommunicationState()
    data class Error(val message: String) : CommunicationState()
}

/**
 * Response from the communication system
 */
sealed class CommunicationResponse {
    data class Success(
        val messageId: String,
        val text: String,
        val timestamp: Long,
        val intent: String,
        val responseMode: String,
        val emotionalRecognition: EmotionalRecognitionResult?
    ) : CommunicationResponse()
    
    data class Error(val message: String) : CommunicationResponse()
}

/**
 * Text analysis result
 */
data class TextAnalysisResult(
    val intent: UserIntent,
    val entities: List<NamedEntity>,
    val sentiment: Sentiment,
    val languageCode: String,
    val languageConfidence: Float,
    val error: String? = null
)

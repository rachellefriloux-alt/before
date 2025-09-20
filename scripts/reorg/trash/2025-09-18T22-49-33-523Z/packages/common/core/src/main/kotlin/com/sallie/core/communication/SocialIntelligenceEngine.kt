package com.sallie.core.communication

/**
 * Sallie 2.0 Module
 * Persona: Tough love meets soul care.
 * Social Intelligence and Conversational Management
 */
import android.content.Context
import android.util.Log
import com.sallie.core.emotional.EmotionalIntelligenceBridge
import com.sallie.core.emotional.EmotionalRecognitionResult
import com.sallie.core.memory.HierarchicalMemorySystem
import com.sallie.core.memory.MemoryItem
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.withContext
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.atomic.AtomicInteger

/**
 * Manages social interactions, conversation flow, and appropriate responses
 * based on social context, relationship dynamics, and conversation history
 */
class SocialIntelligenceEngine private constructor(
    private val context: Context
) {
    companion object {
        private const val TAG = "SocialIntelligenceEngine"
        
        // Memory keys
        private const val CONVERSATION_HISTORY_KEY = "conversation_history"
        private const val RELATIONSHIP_MEMORY_KEY = "relationship_data"
        private const val SOCIAL_PATTERNS_KEY = "social_patterns"
        
        // Default relationship settings
        private val DEFAULT_RELATIONSHIP = RelationshipContext(
            id = "default",
            closeness = RelationshipCloseness.FAMILIAR,
            duration = 0,
            interactionFrequency = 0.3,
            roles = listOf("assistant")
        )
        
        // Maximum tracked conversation turns
        private const val MAX_CONVERSATION_TURNS = 20
        
        @Volatile
        private var instance: SocialIntelligenceEngine? = null
        
        fun getInstance(context: Context): SocialIntelligenceEngine {
            return instance ?: synchronized(this) {
                instance ?: SocialIntelligenceEngine(context.applicationContext).also { instance = it }
            }
        }
    }
    
    private lateinit var memorySystem: HierarchicalMemorySystem
    private lateinit var nlProcessor: NaturalLanguageProcessor
    private lateinit var toneManager: ToneManager
    private lateinit var emotionalIntelligence: EmotionalIntelligenceBridge
    
    // Active conversations
    private val conversations = ConcurrentHashMap<String, ConversationState>()
    
    // Relationship data
    private val relationships = ConcurrentHashMap<String, RelationshipContext>()
    
    // Current active conversation ID
    private var activeConversationId: String? = null
    
    // Conversation state flow
    private val _conversationStateFlow = MutableStateFlow<ConversationState?>(null)
    val conversationStateFlow: StateFlow<ConversationState?> = _conversationStateFlow
    
    // Next message ID
    private val nextMessageId = AtomicInteger(1)
    
    /**
     * Initialize the social intelligence engine
     */
    suspend fun initialize() = withContext(Dispatchers.Default) {
        memorySystem = HierarchicalMemorySystem.getInstance(context)
        nlProcessor = NaturalLanguageProcessor.getInstance(context)
        toneManager = ToneManager.getInstance(context)
        emotionalIntelligence = EmotionalIntelligenceBridge.getInstance(context)
        
        // Initialize dependencies
        nlProcessor.initialize()
        toneManager.initialize()
        
        // Load relationship data
        loadRelationships()
        
        Log.d(TAG, "SocialIntelligenceEngine initialized")
    }
    
    /**
     * Load relationship data from memory
     */
    private suspend fun loadRelationships() {
        val relationshipMemories = memorySystem.retrieveByCategory(
            category = "USER_RELATIONSHIP",
            query = RELATIONSHIP_MEMORY_KEY,
            limit = 100
        )
        
        relationshipMemories.forEach { memory ->
            try {
                val id = memory.identifier
                val closeness = try {
                    RelationshipCloseness.valueOf(
                        memory.metadata["closeness"] as? String ?: RelationshipCloseness.FAMILIAR.name
                    )
                } catch (e: Exception) {
                    RelationshipCloseness.FAMILIAR
                }
                
                val duration = memory.metadata["duration"] as? Long ?: 0L
                val frequency = memory.metadata["interactionFrequency"] as? Double ?: 0.3
                val rolesString = memory.metadata["roles"] as? String ?: "assistant"
                val roles = rolesString.split(",").map { it.trim() }
                
                val relationship = RelationshipContext(
                    id = id,
                    closeness = closeness,
                    duration = duration,
                    interactionFrequency = frequency,
                    roles = roles
                )
                
                relationships[id] = relationship
            } catch (e: Exception) {
                Log.e(TAG, "Error loading relationship data", e)
            }
        }
        
        Log.d(TAG, "Loaded ${relationships.size} relationships")
    }
    
    /**
     * Save relationship data to memory
     */
    private suspend fun saveRelationship(relationship: RelationshipContext) {
        val metadata = mapOf(
            "closeness" to relationship.closeness.name,
            "duration" to relationship.duration,
            "interactionFrequency" to relationship.interactionFrequency,
            "roles" to relationship.roles.joinToString(",")
        )
        
        memorySystem.store(
            content = "Relationship data for ${relationship.id}",
            category = "USER_RELATIONSHIP",
            identifier = relationship.id,
            metadata = metadata
        )
    }
    
    /**
     * Start a new conversation or continue an existing one
     * 
     * @param conversationId Unique ID for the conversation
     * @param type Type of conversation
     * @param userId User ID associated with this conversation
     * @param initialContext Initial context for the conversation
     * @return The conversation state
     */
    suspend fun startConversation(
        conversationId: String = "conversation_${System.currentTimeMillis()}",
        type: ConversationType = ConversationType.GENERAL,
        userId: String = "default_user",
        initialContext: Map<String, Any> = emptyMap()
    ): ConversationState = withContext(Dispatchers.Default) {
        // Check if conversation already exists
        val existingConversation = conversations[conversationId]
        if (existingConversation != null) {
            activeConversationId = conversationId
            _conversationStateFlow.value = existingConversation
            return@withContext existingConversation
        }
        
        // Get or create relationship context
        val relationship = relationships[userId] ?: DEFAULT_RELATIONSHIP.copy(id = userId)
        
        // Create conversation context
        val conversationContext = ConversationContext(
            id = conversationId,
            type = type,
            topic = initialContext["topic"] as? String
        )
        
        // Create new conversation state
        val newConversation = ConversationState(
            id = conversationId,
            userId = userId,
            context = conversationContext,
            relationshipContext = relationship,
            messages = mutableListOf(),
            startTime = System.currentTimeMillis(),
            lastActivityTime = System.currentTimeMillis(),
            metadata = initialContext.toMutableMap()
        )
        
        // Store conversation
        conversations[conversationId] = newConversation
        activeConversationId = conversationId
        _conversationStateFlow.value = newConversation
        
        // Update relationship data (mark as active)
        relationships[userId] = relationship.copy(
            interactionFrequency = Math.min(1.0, relationship.interactionFrequency + 0.1)
        )
        
        return@withContext newConversation
    }
    
    /**
     * Process a user message and generate a response
     * 
     * @param message The user's message text
     * @param conversationId The conversation ID
     * @param emotionalState Optional detected emotional state
     * @param additionalContext Optional additional context
     * @return The system's response message
     */
    suspend fun processMessage(
        message: String,
        conversationId: String? = activeConversationId,
        emotionalState: EmotionalRecognitionResult? = null,
        additionalContext: Map<String, Any>? = null
    ): Message = withContext(Dispatchers.Default) {
        // Ensure we have a valid conversation ID
        val actualConversationId = conversationId ?: activeConversationId
        if (actualConversationId == null) {
            throw IllegalStateException("No active conversation. Call startConversation first.")
        }
        
        // Get conversation state
        val conversation = conversations[actualConversationId] ?: startConversation(
            conversationId = actualConversationId
        )
        
        // Process emotional state if not provided
        val userEmotionalState = emotionalState ?: detectEmotionalState(message, conversation)
        
        // Create user message
        val userMessage = Message(
            id = "msg_${nextMessageId.getAndIncrement()}",
            text = message,
            sender = MessageSender.USER,
            timestamp = System.currentTimeMillis(),
            emotionalState = userEmotionalState,
            metadata = additionalContext?.toMutableMap() ?: mutableMapOf()
        )
        
        // Add message to conversation
        conversation.messages.add(userMessage)
        
        // Update conversation last activity time
        conversation.lastActivityTime = System.currentTimeMillis()
        
        // Recognize intent
        val userIntent = nlProcessor.recognizeIntent(
            message,
            additionalContext ?: emptyMap()
        )
        
        // Update conversation with recognized intent
        conversation.lastIntent = userIntent
        
        // Get appropriate tone for response
        val responseMode = determineResponseMode(conversation, userIntent, userEmotionalState)
        val toneAttributes = toneManager.getToneForContext(
            conversationContext = conversation.context,
            userEmotionalState = userEmotionalState,
            relationshipContext = conversation.relationshipContext,
            situation = responseMode.situationType
        )
        
        // Generate response based on intent and emotional state
        val response = generateResponse(
            conversation = conversation,
            intent = userIntent,
            emotionalState = userEmotionalState,
            responseMode = responseMode,
            toneAttributes = toneAttributes
        )
        
        // Create system response message
        val systemMessage = Message(
            id = "msg_${nextMessageId.getAndIncrement()}",
            text = response,
            sender = MessageSender.SYSTEM,
            timestamp = System.currentTimeMillis(),
            intentType = responseMode.intentType,
            metadata = mutableMapOf(
                "toneAttributes" to toneAttributes,
                "responseMode" to responseMode.name
            )
        )
        
        // Add response to conversation
        conversation.messages.add(systemMessage)
        
        // Trim conversation history if needed
        if (conversation.messages.size > MAX_CONVERSATION_TURNS * 2) {
            val excessMessages = conversation.messages.size - MAX_CONVERSATION_TURNS * 2
            val removedMessages = conversation.messages.subList(0, excessMessages).toList()
            conversation.messages.subList(0, excessMessages).clear()
            
            // Archive removed messages
            archiveConversationHistory(
                conversationId = actualConversationId,
                userId = conversation.userId,
                messages = removedMessages
            )
        }
        
        // Update relationship based on interaction
        updateRelationship(conversation, userMessage, systemMessage)
        
        // Update conversation state flow
        _conversationStateFlow.value = conversation
        
        // Return the system's response message
        return@withContext systemMessage
    }
    
    /**
     * Detect emotional state from message if not provided
     */
    private suspend fun detectEmotionalState(
        message: String,
        conversation: ConversationState
    ): EmotionalRecognitionResult? {
        return try {
            emotionalIntelligence.analyzeText(message)
        } catch (e: Exception) {
            Log.e(TAG, "Error detecting emotional state", e)
            null
        }
    }
    
    /**
     * Determine the appropriate response mode based on context
     */
    private fun determineResponseMode(
        conversation: ConversationState,
        intent: UserIntent,
        emotionalState: EmotionalRecognitionResult?
    ): ResponseMode {
        // Default response mode
        var responseMode = ResponseMode.INFORMATIONAL
        var situationType = SituationType.GENERAL
        
        // Determine based on intent
        when (intent.type) {
            IntentType.QUERY_GENERAL, 
            IntentType.QUERY_FACT,
            IntentType.QUERY_METHOD,
            IntentType.QUERY_PERSON,
            IntentType.QUERY_REASON,
            IntentType.QUERY_TIME,
            IntentType.QUERY_LOCATION -> {
                responseMode = ResponseMode.INFORMATIONAL
                situationType = SituationType.GENERAL
            }
            
            IntentType.SOCIAL_GREETING -> {
                responseMode = ResponseMode.SOCIAL
                situationType = SituationType.GENERAL
            }
            
            IntentType.SOCIAL_FAREWELL -> {
                responseMode = ResponseMode.SOCIAL
                situationType = SituationType.GENERAL
            }
            
            IntentType.SOCIAL_GRATITUDE -> {
                responseMode = ResponseMode.SUPPORTIVE
                situationType = SituationType.GENERAL
            }
            
            IntentType.EMOTIONAL_POSITIVE -> {
                responseMode = ResponseMode.EMPATHIC_POSITIVE
                situationType = SituationType.GENERAL
            }
            
            IntentType.EMOTIONAL_NEGATIVE -> {
                responseMode = ResponseMode.EMPATHIC_NEGATIVE
                situationType = SituationType.GENERAL
            }
            
            IntentType.SUPPORT_REQUEST -> {
                responseMode = ResponseMode.SUPPORTIVE
                situationType = SituationType.GENERAL
            }
            
            IntentType.FEEDBACK_POSITIVE -> {
                responseMode = ResponseMode.SOCIAL
                situationType = SituationType.GENERAL
            }
            
            IntentType.FEEDBACK_NEGATIVE -> {
                responseMode = ResponseMode.REFLECTIVE
                situationType = SituationType.CONFLICT_RESOLUTION
            }
            
            IntentType.COMMAND_REQUEST -> {
                responseMode = ResponseMode.INSTRUCTIONAL
                situationType = SituationType.GENERAL
            }
            
            else -> {
                responseMode = ResponseMode.INFORMATIONAL
                situationType = SituationType.GENERAL
            }
        }
        
        // Override based on emotional state if present
        emotionalState?.let { emotion ->
            when (emotion.primaryEmotion) {
                com.sallie.core.emotional.Emotion.SADNESS,
                com.sallie.core.emotional.Emotion.GRIEF,
                com.sallie.core.emotional.Emotion.DISAPPOINTMENT -> {
                    responseMode = ResponseMode.EMPATHIC_NEGATIVE
                }
                
                com.sallie.core.emotional.Emotion.FEAR,
                com.sallie.core.emotional.Emotion.ANXIETY,
                com.sallie.core.emotional.Emotion.WORRY -> {
                    responseMode = ResponseMode.SUPPORTIVE
                }
                
                com.sallie.core.emotional.Emotion.ANGER,
                com.sallie.core.emotional.Emotion.FRUSTRATION -> {
                    responseMode = ResponseMode.DEESCALATING
                    situationType = SituationType.CONFLICT_RESOLUTION
                }
                
                com.sallie.core.emotional.Emotion.JOY,
                com.sallie.core.emotional.Emotion.EXCITEMENT,
                com.sallie.core.emotional.Emotion.CONTENTMENT -> {
                    if (responseMode != ResponseMode.INFORMATIONAL) {
                        responseMode = ResponseMode.EMPATHIC_POSITIVE
                    }
                }
                
                com.sallie.core.emotional.Emotion.CONFUSION,
                com.sallie.core.emotional.Emotion.UNCERTAINTY -> {
                    responseMode = ResponseMode.CLARIFYING
                }
                
                else -> {} // No override
            }
        }
        
        return responseMode.copy(situationType = situationType)
    }
    
    /**
     * Generate a response based on conversation context and user message
     */
    private suspend fun generateResponse(
        conversation: ConversationState,
        intent: UserIntent,
        emotionalState: EmotionalRecognitionResult?,
        responseMode: ResponseMode,
        toneAttributes: ToneAttributes
    ): String {
        // Get recent messages as context
        val recentMessages = conversation.messages.takeLast(5)
        val userMessage = recentMessages.lastOrNull { it.sender == MessageSender.USER }?.text ?: ""
        
        // Prepare response based on mode
        val baseResponse = when (responseMode) {
            ResponseMode.INFORMATIONAL -> {
                generateInformationalResponse(intent, conversation)
            }
            
            ResponseMode.SOCIAL -> {
                generateSocialResponse(intent, conversation)
            }
            
            ResponseMode.EMPATHIC_POSITIVE -> {
                generateEmpathicPositiveResponse(emotionalState, conversation)
            }
            
            ResponseMode.EMPATHIC_NEGATIVE -> {
                generateEmpathicNegativeResponse(emotionalState, conversation)
            }
            
            ResponseMode.SUPPORTIVE -> {
                generateSupportiveResponse(intent, emotionalState, conversation)
            }
            
            ResponseMode.INSTRUCTIONAL -> {
                generateInstructionalResponse(intent, conversation)
            }
            
            ResponseMode.REFLECTIVE -> {
                generateReflectiveResponse(conversation)
            }
            
            ResponseMode.DEESCALATING -> {
                generateDeescalatingResponse(emotionalState, conversation)
            }
            
            ResponseMode.CLARIFYING -> {
                generateClarifyingResponse(intent, conversation)
            }
            
            else -> {
                "I understand. Please tell me more."
            }
        }
        
        // Apply tone attributes
        val responseContext = mapOf(
            "userName" to (conversation.metadata["userName"] ?: "there"),
            "intent" to intent.type.name
        )
        
        return nlProcessor.generateResponse(
            template = baseResponse,
            context = responseContext,
            toneAttributes = toneAttributes
        )
    }
    
    /**
     * Generate informational response
     */
    private suspend fun generateInformationalResponse(
        intent: UserIntent,
        conversation: ConversationState
    ): String {
        val userMessage = conversation.messages.lastOrNull { it.sender == MessageSender.USER }?.text ?: ""
        
        return when (intent.type) {
            IntentType.QUERY_FACT -> {
                // Retrieve from memory or generate based on query
                val relevantMemory = retrieveRelevantMemory(userMessage)
                relevantMemory ?: "Based on what I understand, I can tell you that information related to your question may depend on several factors. Would you like me to explore this topic further with you?"
            }
            
            IntentType.QUERY_METHOD -> {
                "Here's how you might approach this: First, understand the context and requirements. Then, break down the process into manageable steps. Start with the fundamentals and build from there, adjusting as needed based on feedback."
            }
            
            IntentType.QUERY_TIME -> {
                val timeEntity = intent.slots["time"] as? String
                timeEntity?.let {
                    "The time you mentioned is $it. Is there something specific about this timing that you'd like to discuss?"
                } ?: "Time-related matters often require careful planning and consideration. What specific timeframe are you thinking about?"
            }
            
            IntentType.QUERY_LOCATION -> {
                val locationEntity = intent.slots["location"] as? String
                locationEntity?.let {
                    "Regarding $it, what would you like to know specifically? I'd be happy to discuss this location further."
                } ?: "Locations can have significant meaning in our lives. Which place are you asking about?"
            }
            
            IntentType.QUERY_REASON -> {
                "Understanding the 'why' behind things helps us make sense of our experiences. From what I can gather, there could be several reasons, including personal values, external circumstances, and underlying motivations."
            }
            
            IntentType.QUERY_PERSON -> {
                val personEntity = intent.slots["person"] as? String
                personEntity?.let {
                    "When it comes to people like $it, each person's unique traits and contributions shape how they interact with the world. What aspect would you like to explore further?"
                } ?: "People are complex and multifaceted. Who specifically are you interested in learning about?"
            }
            
            IntentType.QUERY_SYSTEM -> {
                "I'm Sallie, your personal AI companion. I'm designed to provide support, insights, and assistance across various aspects of life. My approach combines tough love with genuine care for your growth and well-being."
            }
            
            else -> {
                "That's an interesting question. While I don't have all the answers, I can help you explore this topic from different angles and perspectives."
            }
        }
    }
    
    /**
     * Generate social response
     */
    private fun generateSocialResponse(
        intent: UserIntent,
        conversation: ConversationState
    ): String {
        return when (intent.type) {
            IntentType.SOCIAL_GREETING -> {
                val timeOfDay = getTimeOfDay()
                "Hello! Good $timeOfDay. It's nice to connect with you. How are you feeling today?"
            }
            
            IntentType.SOCIAL_FAREWELL -> {
                "Take care! Remember, I'm here whenever you need to talk or work through anything. Until next time!"
            }
            
            IntentType.SOCIAL_GRATITUDE -> {
                "You're welcome! It's my purpose to be here for you. Is there anything else on your mind?"
            }
            
            IntentType.SOCIAL_APOLOGY -> {
                "There's no need to apologize. We all have moments where we need to reflect and recalibrate. What matters is how we move forward."
            }
            
            IntentType.FEEDBACK_POSITIVE -> {
                "I appreciate your positive feedback! It helps me understand what's working well for you. How else can I support you today?"
            }
            
            else -> {
                "I value our conversation and connection. What's been on your mind lately?"
            }
        }
    }
    
    /**
     * Generate empathic positive response
     */
    private fun generateEmpathicPositiveResponse(
        emotionalState: EmotionalRecognitionResult?,
        conversation: ConversationState
    ): String {
        val emotion = emotionalState?.primaryEmotion?.name?.toLowerCase() ?: "positive"
        
        return when (emotion) {
            "joy", "happiness" -> {
                "It's wonderful to hear you're feeling joy! These positive moments are worth celebrating and reflecting on. What specifically brought this happiness your way?"
            }
            
            "excitement" -> {
                "Your excitement is contagious! It's energizing to see you passionate about this. Tell me more about what has you so enthusiastic!"
            }
            
            "contentment" -> {
                "That sense of contentment is so valuable. It reflects a harmony between your expectations and reality. What aspects of your current situation contribute most to this feeling?"
            }
            
            "pride" -> {
                "You have every reason to feel proud of yourself! Acknowledging our accomplishments is important. What journey led you to this achievement?"
            }
            
            else -> {
                "I'm really glad to hear you're in good spirits! These positive emotions can give us energy and perspective. Would you like to explore what's contributing to these feelings?"
            }
        }
    }
    
    /**
     * Generate empathic negative response
     */
    private fun generateEmpathicNegativeResponse(
        emotionalState: EmotionalRecognitionResult?,
        conversation: ConversationState
    ): String {
        val emotion = emotionalState?.primaryEmotion?.name?.toLowerCase() ?: "sadness"
        
        return when (emotion) {
            "sadness" -> {
                "I hear that you're feeling sad. That's a natural response to difficult situations. Would it help to talk about what's behind these feelings? Sometimes naming our struggles is the first step toward addressing them."
            }
            
            "grief" -> {
                "Grief is one of our deepest emotions, and it reflects the significance of what's been lost. There's no timeline for healing, and it's okay to experience this process in your own way. What memories are most present for you right now?"
            }
            
            "disappointment" -> {
                "Disappointment can be particularly challenging because it involves the gap between our expectations and reality. I'm here to listen and support you through this. What had you been hoping for?"
            }
            
            "loneliness" -> {
                "Feeling lonely can be painful, even when we're not physically alone. Connection is such a fundamental human need. What kind of connection are you missing most right now?"
            }
            
            else -> {
                "I recognize you're going through a difficult emotional time. These feelings, while challenging, can sometimes guide us toward what matters most. What support would be most helpful for you right now?"
            }
        }
    }
    
    /**
     * Generate supportive response
     */
    private fun generateSupportiveResponse(
        intent: UserIntent,
        emotionalState: EmotionalRecognitionResult?,
        conversation: ConversationState
    ): String {
        return when (intent.type) {
            IntentType.SUPPORT_REQUEST -> {
                "I'm here for you. Sometimes the challenges we face can feel overwhelming, but you don't have to navigate them alone. Let's break this down together and explore potential approaches."
            }
            
            IntentType.EMOTIONAL_NEGATIVE -> {
                "It takes courage to acknowledge difficult emotions. Remember that all feelings are information - they tell us something important about our needs and values. What do you think these emotions might be telling you?"
            }
            
            else -> {
                "You have more strength than you might realize in this moment. We all need support sometimes, and reaching out shows wisdom, not weakness. What small step might help you feel more grounded right now?"
            }
        }
    }
    
    /**
     * Generate instructional response
     */
    private fun generateInstructionalResponse(
        intent: UserIntent,
        conversation: ConversationState
    ): String {
        val command = conversation.messages.lastOrNull { it.sender == MessageSender.USER }?.text ?: ""
        
        return when {
            command.contains("how to") || command.contains("steps") -> {
                "Here's a step-by-step approach: 1) Start by clearly defining your goal and why it matters to you. 2) Break it down into smaller, manageable tasks. 3) Begin with the simplest elements to build momentum. 4) Track your progress and adjust your approach as needed. 5) Celebrate small wins along the way."
            }
            
            else -> {
                "To accomplish this, focus first on understanding the fundamental principles involved. Then, practice deliberately with attention to detail. Remember that mastery comes through consistent effort and learning from both successes and setbacks."
            }
        }
    }
    
    /**
     * Generate reflective response
     */
    private fun generateReflectiveResponse(conversation: ConversationState): String {
        val recentMessages = conversation.messages.takeLast(5)
        
        return "I notice that we've been discussing this for a while. Sometimes stepping back can give us perspective. What aspects of our conversation have been most valuable for you? And is there anything you'd like to approach differently?"
    }
    
    /**
     * Generate deescalating response
     */
    private fun generateDeescalatingResponse(
        emotionalState: EmotionalRecognitionResult?,
        conversation: ConversationState
    ): String {
        return "I understand this is frustrating. Your feelings are valid and I want to make sure I'm addressing your concerns effectively. Let's take a step back and identify the key issues so we can work through them constructively. What's the most important aspect you'd like to focus on first?"
    }
    
    /**
     * Generate clarifying response
     */
    private fun generateClarifyingResponse(
        intent: UserIntent,
        conversation: ConversationState
    ): String {
        val userMessage = conversation.messages.lastOrNull { it.sender == MessageSender.USER }?.text ?: ""
        
        return "I want to make sure I'm understanding correctly. Are you asking about ${extractTopicFromMessage(userMessage)}? It would help me provide a better response if you could share a bit more context."
    }
    
    /**
     * Extract a topic from a message for clarification
     */
    private fun extractTopicFromMessage(message: String): String {
        // Very simple topic extraction
        val words = message.split(" ")
        if (words.size <= 3) return message
        
        // Try to find noun phrases or key concepts
        val topicWords = words.filter { it.length > 4 }
        return if (topicWords.isNotEmpty()) {
            topicWords.joinToString(" ", limit = 3)
        } else {
            message.take(30) + "..."
        }
    }
    
    /**
     * Get the current time of day greeting
     */
    private fun getTimeOfDay(): String {
        val hour = java.time.LocalTime.now().hour
        return when {
            hour < 12 -> "morning"
            hour < 17 -> "afternoon"
            else -> "evening"
        }
    }
    
    /**
     * Retrieve relevant memory for a query
     */
    private suspend fun retrieveRelevantMemory(query: String): String? {
        try {
            val memories = memorySystem.retrieve(
                category = "KNOWLEDGE",
                query = query,
                exactMatch = false,
                limit = 1
            )
            
            return memories?.content
        } catch (e: Exception) {
            Log.e(TAG, "Error retrieving memory", e)
            return null
        }
    }
    
    /**
     * Archive conversation history to memory
     */
    private suspend fun archiveConversationHistory(
        conversationId: String,
        userId: String,
        messages: List<Message>
    ) {
        try {
            val messageTexts = messages.joinToString("\n") { "${it.sender}: ${it.text}" }
            
            memorySystem.store(
                content = messageTexts,
                category = "CONVERSATION_HISTORY",
                identifier = "${CONVERSATION_HISTORY_KEY}_${conversationId}_${System.currentTimeMillis()}",
                metadata = mapOf(
                    "conversationId" to conversationId,
                    "userId" to userId,
                    "messageCount" to messages.size,
                    "timestamp" to System.currentTimeMillis()
                )
            )
        } catch (e: Exception) {
            Log.e(TAG, "Error archiving conversation history", e)
        }
    }
    
    /**
     * Update relationship based on interaction
     */
    private suspend fun updateRelationship(
        conversation: ConversationState,
        userMessage: Message,
        systemMessage: Message
    ) {
        val relationship = conversation.relationshipContext
        
        // Calculate relationship duration
        val newDuration = relationship.duration + (System.currentTimeMillis() - conversation.lastActivityTime)
        
        // Update interaction frequency (simple algorithm)
        val decay = 0.99 // Slight decay factor
        val boost = 0.05 // Boost for new interaction
        val newFrequency = (relationship.interactionFrequency * decay) + boost
        
        // Update relationship closeness based on interaction quality
        var closenessChange = 0
        
        // Get emotional state from user message
        val emotionalState = userMessage.emotionalState
        
        // Get response mode from system message
        val responseMode = systemMessage.metadata["responseMode"] as? String
        
        // Adjust closeness based on emotional state and response
        if (emotionalState != null && responseMode != null) {
            closenessChange = when (emotionalState.primaryEmotion) {
                com.sallie.core.emotional.Emotion.TRUST,
                com.sallie.core.emotional.Emotion.JOY,
                com.sallie.core.emotional.Emotion.CONTENTMENT -> 1 // Positive emotions increase closeness
                
                com.sallie.core.emotional.Emotion.ANGER,
                com.sallie.core.emotional.Emotion.DISAPPOINTMENT -> -1 // Negative emotions may decrease closeness
                
                else -> 0
            }
            
            // Response mode can mitigate negative emotions
            if (closenessChange < 0 && (
                    responseMode == ResponseMode.EMPATHIC_NEGATIVE.name ||
                    responseMode == ResponseMode.SUPPORTIVE.name ||
                    responseMode == ResponseMode.DEESCALATING.name
                )) {
                closenessChange = 0 // Good response to negative emotion maintains relationship
            }
        }
        
        // Update closeness level if needed
        val newCloseness = if (closenessChange != 0) {
            adjustClosenessLevel(relationship.closeness, closenessChange)
        } else {
            relationship.closeness
        }
        
        // Create updated relationship
        val updatedRelationship = relationship.copy(
            closeness = newCloseness,
            duration = newDuration,
            interactionFrequency = newFrequency.coerceIn(0.0, 1.0)
        )
        
        // Update in memory
        relationships[relationship.id] = updatedRelationship
        conversation.relationshipContext = updatedRelationship
        
        // Save to persistent storage periodically
        if (Math.random() < 0.2) { // 20% chance to save on each update to reduce writes
            saveRelationship(updatedRelationship)
        }
    }
    
    /**
     * Adjust closeness level based on change
     */
    private fun adjustClosenessLevel(current: RelationshipCloseness, change: Int): RelationshipCloseness {
        val levels = RelationshipCloseness.values()
        val currentIndex = levels.indexOf(current)
        val newIndex = (currentIndex + change).coerceIn(0, levels.size - 1)
        return levels[newIndex]
    }
    
    /**
     * End conversation and archive history
     * 
     * @param conversationId The conversation ID to end
     * @return True if conversation was ended, false otherwise
     */
    suspend fun endConversation(conversationId: String? = activeConversationId): Boolean = withContext(Dispatchers.Default) {
        val actualConversationId = conversationId ?: activeConversationId ?: return@withContext false
        
        // Get conversation state
        val conversation = conversations[actualConversationId] ?: return@withContext false
        
        // Archive all messages
        archiveConversationHistory(
            conversationId = actualConversationId,
            userId = conversation.userId,
            messages = conversation.messages
        )
        
        // Remove from active conversations
        conversations.remove(actualConversationId)
        
        // Update active conversation ID if needed
        if (activeConversationId == actualConversationId) {
            activeConversationId = conversations.keys.firstOrNull()
            _conversationStateFlow.value = activeConversationId?.let { conversations[it] }
        }
        
        return@withContext true
    }
    
    /**
     * Get conversation by ID
     * 
     * @param conversationId The conversation ID
     * @return The conversation state or null if not found
     */
    fun getConversation(conversationId: String): ConversationState? {
        return conversations[conversationId]
    }
    
    /**
     * Get all active conversations
     * 
     * @return List of active conversations
     */
    fun getActiveConversations(): List<ConversationState> {
        return conversations.values.toList()
    }
    
    /**
     * Get relationship context for a user
     * 
     * @param userId The user ID
     * @return The relationship context or default if not found
     */
    fun getRelationshipContext(userId: String): RelationshipContext {
        return relationships[userId] ?: DEFAULT_RELATIONSHIP.copy(id = userId)
    }
    
    /**
     * Save social pattern to memory
     * 
     * @param patternType Type of social pattern
     * @param content Description of the pattern
     * @param metadata Additional metadata
     */
    suspend fun saveSocialPattern(
        patternType: String,
        content: String,
        metadata: Map<String, Any> = emptyMap()
    ) {
        val patternId = "${SOCIAL_PATTERNS_KEY}_${patternType}_${System.currentTimeMillis()}"
        
        memorySystem.store(
            content = content,
            category = "SOCIAL_PATTERNS",
            identifier = patternId,
            metadata = metadata + mapOf(
                "patternType" to patternType,
                "timestamp" to System.currentTimeMillis()
            )
        )
    }
}

/**
 * Response modes for the social intelligence engine
 */
data class ResponseMode(
    val name: String,
    val intentType: IntentType,
    val situationType: SituationType = SituationType.GENERAL
) {
    companion object {
        val INFORMATIONAL = ResponseMode("INFORMATIONAL", IntentType.INFORMATION)
        val SOCIAL = ResponseMode("SOCIAL", IntentType.SOCIAL_GREETING)
        val EMPATHIC_POSITIVE = ResponseMode("EMPATHIC_POSITIVE", IntentType.EMOTIONAL_POSITIVE)
        val EMPATHIC_NEGATIVE = ResponseMode("EMPATHIC_NEGATIVE", IntentType.EMOTIONAL_NEGATIVE)
        val SUPPORTIVE = ResponseMode("SUPPORTIVE", IntentType.SUPPORT_REQUEST)
        val INSTRUCTIONAL = ResponseMode("INSTRUCTIONAL", IntentType.COMMAND_REQUEST)
        val REFLECTIVE = ResponseMode("REFLECTIVE", IntentType.FEEDBACK_NEGATIVE)
        val DEESCALATING = ResponseMode("DEESCALATING", IntentType.FEEDBACK_NEGATIVE)
        val CLARIFYING = ResponseMode("CLARIFYING", IntentType.QUERY_GENERAL)
    }
}

/**
 * Message sender types
 */
enum class MessageSender {
    USER,
    SYSTEM
}

/**
 * Message in a conversation
 */
data class Message(
    val id: String,
    val text: String,
    val sender: MessageSender,
    val timestamp: Long,
    val emotionalState: EmotionalRecognitionResult? = null,
    val intentType: IntentType? = null,
    val metadata: MutableMap<String, Any> = mutableMapOf()
)

/**
 * State of a conversation
 */
data class ConversationState(
    val id: String,
    val userId: String,
    val context: ConversationContext,
    var relationshipContext: RelationshipContext,
    val messages: MutableList<Message>,
    val startTime: Long,
    var lastActivityTime: Long,
    var lastIntent: UserIntent? = null,
    val metadata: MutableMap<String, Any> = mutableMapOf()
)

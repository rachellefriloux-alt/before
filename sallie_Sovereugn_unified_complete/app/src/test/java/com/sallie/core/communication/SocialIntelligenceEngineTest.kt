package com.sallie.core.communication

import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.TestCoroutineDispatcher
import kotlinx.coroutines.test.TestCoroutineScope
import kotlinx.coroutines.test.runBlockingTest
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.Mockito.verify
import org.mockito.MockitoAnnotations
import org.mockito.junit.MockitoJUnitRunner
import com.sallie.core.nlp.NLPResult
import com.sallie.core.nlp.IntentClassificationResult
import com.sallie.core.nlp.EntityExtractionResult
import com.sallie.core.nlp.SentimentAnalysisResult

@ExperimentalCoroutinesApi
@RunWith(MockitoJUnitRunner::class)
class SocialIntelligenceEngineTest {

    private val testDispatcher = TestCoroutineDispatcher()
    private val testScope = TestCoroutineScope(testDispatcher)

    @Mock
    private lateinit var mockNlpProcessor: NaturalLanguageProcessor

    private lateinit var socialIntelligenceEngine: SocialIntelligenceEngine

    @Before
    fun setup() {
        MockitoAnnotations.initMocks(this)
        socialIntelligenceEngine = SocialIntelligenceEngine(testScope, mockNlpProcessor)
    }

    @After
    fun tearDown() {
        testScope.cleanupTestCoroutines()
        testDispatcher.cleanupTestCoroutines()
    }

    @Test
    fun `analyze context enriches conversation with social context`() = testScope.runBlockingTest {
        // Setup
        val conversationId = "test-conversation-1"
        val message = Message(
            id = "msg-1",
            conversationId = conversationId,
            text = "Hello, how are you today?",
            timestamp = System.currentTimeMillis(),
            sender = MessageSender.USER,
            metadata = mapOf("userId" to "user-1")
        )
        
        val mockNlpResult = NLPResult(
            rawText = message.text,
            normalizedText = message.text.toLowerCase(),
            intentClassification = IntentClassificationResult(
                primaryIntent = "SOCIAL_GREETING",
                allIntents = mapOf("SOCIAL_GREETING" to 0.9),
                confidence = 0.9
            ),
            entityExtraction = EntityExtractionResult(emptyList()),
            sentimentAnalysis = SentimentAnalysisResult(0.7, "POSITIVE")
        )
        
        `when`(mockNlpProcessor.analyzeText(message.text)).thenReturn(mockNlpResult)
        
        // Action
        val enrichedContext = socialIntelligenceEngine.analyzeContext(
            message,
            ConversationType.CASUAL,
            emptyMap()
        )
        
        // Verify
        assert(enrichedContext.containsKey("socialContext"))
        assert(enrichedContext.containsKey("conversationPhase"))
        assert(enrichedContext["intentType"] == "SOCIAL_GREETING")
        verify(mockNlpProcessor).analyzeText(message.text)
    }
    
    @Test
    fun `detect conversation phase identifies opening phase`() = testScope.runBlockingTest {
        // Setup
        val messages = listOf(
            Message(
                id = "msg-1",
                conversationId = "conv-1",
                text = "Hi there!",
                timestamp = System.currentTimeMillis(),
                sender = MessageSender.USER,
                metadata = emptyMap()
            )
        )
        
        // Action
        val phase = socialIntelligenceEngine.detectConversationPhase(messages)
        
        // Verify
        assert(phase == ConversationPhase.OPENING)
    }
    
    @Test
    fun `detect conversation phase identifies middle phase`() = testScope.runBlockingTest {
        // Setup
        val baseTime = System.currentTimeMillis()
        val messages = listOf(
            Message(
                id = "msg-1",
                conversationId = "conv-1",
                text = "Hi there!",
                timestamp = baseTime - 5000,
                sender = MessageSender.USER,
                metadata = emptyMap()
            ),
            Message(
                id = "msg-2",
                conversationId = "conv-1",
                text = "Hello! How can I help you today?",
                timestamp = baseTime - 4000,
                sender = MessageSender.SYSTEM,
                metadata = emptyMap()
            ),
            Message(
                id = "msg-3",
                conversationId = "conv-1",
                text = "I need help with setting up my profile.",
                timestamp = baseTime - 3000,
                sender = MessageSender.USER,
                metadata = emptyMap()
            ),
            Message(
                id = "msg-4",
                conversationId = "conv-1",
                text = "Sure, I can help with that. What specific aspect are you having trouble with?",
                timestamp = baseTime - 2000,
                sender = MessageSender.SYSTEM,
                metadata = emptyMap()
            )
        )
        
        // Action
        val phase = socialIntelligenceEngine.detectConversationPhase(messages)
        
        // Verify
        assert(phase == ConversationPhase.MIDDLE)
    }
    
    @Test
    fun `detect conversation phase identifies closing phase`() = testScope.runBlockingTest {
        // Setup
        val baseTime = System.currentTimeMillis()
        val messages = listOf(
            Message(
                id = "msg-1",
                conversationId = "conv-1",
                text = "Thanks for your help!",
                timestamp = baseTime - 2000,
                sender = MessageSender.USER,
                metadata = emptyMap()
            ),
            Message(
                id = "msg-2",
                conversationId = "conv-1",
                text = "You're welcome! Is there anything else I can help you with?",
                timestamp = baseTime - 1000,
                sender = MessageSender.SYSTEM,
                metadata = emptyMap()
            ),
            Message(
                id = "msg-3",
                conversationId = "conv-1",
                text = "No, that's all for now. Goodbye!",
                timestamp = baseTime,
                sender = MessageSender.USER,
                metadata = emptyMap()
            )
        )
        
        // Action
        val phase = socialIntelligenceEngine.detectConversationPhase(messages)
        
        // Verify
        assert(phase == ConversationPhase.CLOSING)
    }
    
    @Test
    fun `determine appropriate response mode chooses correctly based on intent`() = testScope.runBlockingTest {
        // Setup
        val intent = "QUERY_INFORMATION"
        val sentiment = 0.6
        val conversationType = ConversationType.EDUCATIONAL
        
        // Action
        val responseMode = socialIntelligenceEngine.determineAppropriateResponseMode(
            intent,
            sentiment,
            conversationType
        )
        
        // Verify
        assert(responseMode == ResponseMode.INFORMATIONAL)
    }
    
    @Test
    fun `determine appropriate response mode chooses empathetic for emotional queries`() = testScope.runBlockingTest {
        // Setup
        val intent = "EMOTIONAL_SUPPORT"
        val sentiment = 0.2 // Negative sentiment
        val conversationType = ConversationType.THERAPEUTIC
        
        // Action
        val responseMode = socialIntelligenceEngine.determineAppropriateResponseMode(
            intent,
            sentiment,
            conversationType
        )
        
        // Verify
        assert(responseMode == ResponseMode.EMPATHETIC)
    }
}

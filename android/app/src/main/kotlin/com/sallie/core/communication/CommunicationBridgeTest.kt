package com.sallie.core.communication

import android.content.Context
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.TestCoroutineDispatcher
import kotlinx.coroutines.test.TestCoroutineScope
import kotlinx.coroutines.test.runBlockingTest
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.Mock
import org.mockito.Mockito.*
import org.mockito.MockitoAnnotations
import org.mockito.junit.MockitoJUnitRunner

@ExperimentalCoroutinesApi
@RunWith(MockitoJUnitRunner::class)
class CommunicationBridgeTest {

    private val testDispatcher = TestCoroutineDispatcher()
    private val testScope = TestCoroutineScope(testDispatcher)

    @Mock
    private lateinit var mockContext: Context
    
    @Mock
    private lateinit var mockToneManager: ToneManager
    
    @Mock
    private lateinit var mockNlpProcessor: NaturalLanguageProcessor
    
    @Mock
    private lateinit var mockSocialIntelligenceEngine: SocialIntelligenceEngine

    private lateinit var communicationBridge: CommunicationBridge

    @Before
    fun setup() {
        MockitoAnnotations.initMocks(this)
        
        // Mock the singleton retrieval methods
        mockkStatic(ToneManager::class)
        mockkStatic(NaturalLanguageProcessor::class)
        mockkStatic(SocialIntelligenceEngine::class)
        
        `when`(ToneManager.getInstance(any())).thenReturn(mockToneManager)
        `when`(NaturalLanguageProcessor.getInstance(any())).thenReturn(mockNlpProcessor)
        `when`(SocialIntelligenceEngine.getInstance(any(), any())).thenReturn(mockSocialIntelligenceEngine)
        
        communicationBridge = CommunicationBridge.getInstance(mockContext, testScope)
    }

    @After
    fun tearDown() {
        testScope.cleanupTestCoroutines()
        testDispatcher.cleanupTestCoroutines()
    }

    @Test
    fun `initialize sets up components correctly`() = testScope.runBlockingTest {
        // Action
        communicationBridge.initialize()
        
        // Verify
        verify(mockToneManager).initialize()
        verify(mockNlpProcessor).initialize()
        verify(mockSocialIntelligenceEngine).initialize()
    }
    
    @Test
    fun `start conversation creates new conversation state`() = testScope.runBlockingTest {
        // Setup
        val userId = "user-123"
        val type = ConversationType.GENERAL
        val metadata = mapOf("source" to "test")
        
        // Action
        val result = communicationBridge.startConversation(
            null, // null ID means generate one
            type,
            userId,
            metadata
        )
        
        // Verify
        assert(result.id.isNotEmpty())
        assert(result.conversationType == type)
        assert(result.userId == userId)
        assert(result.metadata["source"] == "test")
        assert(result.messages.isEmpty())
    }
    
    @Test
    fun `get conversation returns existing conversation`() = testScope.runBlockingTest {
        // Setup
        val userId = "user-123"
        val type = ConversationType.GENERAL
        val metadata = mapOf("source" to "test")
        
        val conversation = communicationBridge.startConversation(
            "test-conv-id",
            type,
            userId,
            metadata
        )
        
        // Action
        val result = communicationBridge.getConversation(conversation.id)
        
        // Verify
        assert(result != null)
        assert(result?.id == conversation.id)
        assert(result?.conversationType == type)
        assert(result?.userId == userId)
    }
    
    @Test
    fun `process message adds message to conversation and returns response`() = testScope.runBlockingTest {
        // Setup
        val conversationId = "test-conv-id"
        val userId = "user-123"
        val type = ConversationType.GENERAL
        
        communicationBridge.startConversation(
            conversationId,
            type,
            userId,
            emptyMap()
        )
        
        val messageText = "Hello, how are you?"
        val additionalContext = mapOf("source" to "unit-test")
        
        val nlpResult = mock(NLPResult::class.java)
        val enrichedContext = mapOf(
            "intentType" to "SOCIAL_GREETING",
            "sentiment" to 0.8,
            "responseMode" to ResponseMode.CONVERSATIONAL.name
        )
        
        `when`(mockNlpProcessor.analyzeText(messageText)).thenReturn(nlpResult)
        `when`(mockSocialIntelligenceEngine.analyzeContext(any(), any(), any())).thenReturn(enrichedContext)
        
        // Action
        val response = communicationBridge.processMessage(
            messageText,
            conversationId,
            additionalContext
        )
        
        // Verify
        assert(response is CommunicationResponse.Success)
        verify(mockNlpProcessor).analyzeText(messageText)
        verify(mockSocialIntelligenceEngine).analyzeContext(any(), any(), any())
        
        val conversation = communicationBridge.getConversation(conversationId)
        assert(conversation?.messages?.size == 2) // User message + system response
    }
    
    @Test
    fun `end conversation removes conversation from active conversations`() = testScope.runBlockingTest {
        // Setup
        val conversationId = "test-conv-id"
        val userId = "user-123"
        val type = ConversationType.GENERAL
        
        communicationBridge.startConversation(
            conversationId,
            type,
            userId,
            emptyMap()
        )
        
        // Verify conversation exists
        assert(communicationBridge.getConversation(conversationId) != null)
        
        // Action
        val result = communicationBridge.endConversation(conversationId)
        
        // Verify
        assert(result)
        assert(communicationBridge.getConversation(conversationId) == null)
    }
    
    @Test
    fun `update tone preference delegates to tone manager`() = testScope.runBlockingTest {
        // Setup
        val attribute = ToneAttribute.WARMTH
        val value = 0.8
        val weight = 0.6
        
        // Action
        communicationBridge.updateTonePreference(attribute, value, weight)
        
        // Verify
        verify(mockToneManager).setTonePreference(attribute, value, weight)
    }
}

// Helper function to mock static methods
private fun <T> mockkStatic(clazz: Class<T>) {
    // This is a dummy implementation since Mockito doesn't support static mocking
    // In a real project, you would use MockK or PowerMock for this
}

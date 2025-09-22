package com.sallie.core.conversation

import com.sallie.core.memory.HierarchicalMemorySystem
import com.sallie.core.integration.UserProfileLearningSystem
import com.sallie.core.values.ProLifeValuesSystem
import org.junit.Before
import org.junit.Test
import org.mockito.Mockito.*
import org.mockito.Mock
import org.mockito.MockitoAnnotations
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

/**
 * Unit tests for ContextAwareConversationSystem
 */
class ContextAwareConversationSystemTest {

    @Mock
    private lateinit var memorySystem: HierarchicalMemorySystem
    
    @Mock
    private lateinit var userProfileSystem: UserProfileLearningSystem
    
    @Mock
    private lateinit var valuesSystem: ProLifeValuesSystem
    
    private lateinit var conversationSystem: ContextAwareConversationSystem
    
    @Before
    fun setup() {
        MockitoAnnotations.initMocks(this)
        
        // Set up mocks
        `when`(valuesSystem.getAllValues()).thenReturn(
            listOf(
                Value("loyalty", 0.9),
                Value("pro-life", 1.0),
                Value("honesty", 0.8),
                Value("family", 0.9)
            )
        )
        
        // Initialize conversation system
        conversationSystem = ContextAwareConversationSystem(
            memorySystem = memorySystem,
            userProfileSystem = userProfileSystem,
            valuesSystem = valuesSystem
        )
    }
    
    @Test
    fun `create context should initialize with correct values`() {
        // When
        val context = conversationSystem.createContext("Family Discussion")
        
        // Then
        assertEquals("Family Discussion", context.topic)
        assertTrue(context.id.isNotEmpty())
        assertTrue(context.createdAt > 0)
        assertTrue(context.messages.isEmpty())
    }
    
    @Test
    fun `create context with initial message should include message`() {
        // When
        val initialMessage = "Let's talk about family values"
        val context = conversationSystem.createContext("Family Values", initialMessage)
        
        // Then
        assertEquals("Family Values", context.topic)
        assertEquals(1, context.messages.size)
        assertEquals(initialMessage, context.messages[0].content)
        assertEquals(MessageRole.USER, context.messages[0].role)
    }
    
    @Test
    fun `process input should create appropriate context and response`() {
        // When
        val response = conversationSystem.processInput("I value loyalty in relationships")
        
        // Then
        assertNotNull(response)
        assertTrue(response.content.isNotEmpty())
        
        // Verify memory storage
        verify(memorySystem, times(0)).storeInEpisodic(anyString(), anyString(), anyDouble(), anyMap())
        // No memory storage should happen until 5 messages
    }
    
    @Test
    fun `process multiple inputs should store in memory at intervals`() {
        // Process 5 messages to trigger memory storage
        repeat(5) { i ->
            conversationSystem.processInput("Message $i about loyalty and family")
        }
        
        // Verify memory was stored
        verify(memorySystem, times(1)).storeInEpisodic(
            anyString(),
            anyString(),
            anyDouble(),
            anyMap()
        )
    }
    
    @Test
    fun `switch context should update current context`() {
        // Create two contexts
        val context1 = conversationSystem.createContext("Topic 1", "First message")
        val context2 = conversationSystem.createContext("Topic 2", "Another message")
        
        // Switch to first context
        val switched = conversationSystem.switchContext(context1.id)
        
        // Verify correct context was switched to
        assertEquals(context1.id, switched?.id)
    }
    
    @Test
    fun `merge contexts should combine messages from multiple contexts`() {
        // Create two contexts with messages
        val context1 = conversationSystem.createContext("Family", "Family is important")
        conversationSystem.processInput("I value family traditions", mapOf("context_id" to context1.id))
        
        val context2 = conversationSystem.createContext("Values", "Values guide us")
        conversationSystem.processInput("We should honor our values", mapOf("context_id" to context2.id))
        
        // Merge contexts
        val merged = conversationSystem.mergeContexts(
            listOf(context1.id, context2.id),
            "Family Values"
        )
        
        // Verify merged context
        assertNotNull(merged)
        assertEquals("Family Values", merged.topic)
        assertTrue(merged.messages.size >= 4) // All messages from both contexts
    }
    
    @Test
    fun `process input with value-related topic should have high importance`() {
        // Process input related to core values
        val response = conversationSystem.processInput("I believe in protecting life and being loyal")
        
        // Get current context
        val context = conversationSystem.currentContext.value
        
        // Verify importance is high
        val importance = context?.metadata?.get("importance") as? Double
        assertNotNull(importance)
        assertTrue(importance > 0.7) // High importance for value-related topics
    }
    
    @Test
    fun `retrieve related conversations should query memory system`() {
        // Setup mock memory response
        `when`(memorySystem.findSimilarEvents(
            eventType = eq("conversation"),
            query = anyString(),
            limit = anyInt()
        )).thenReturn(
            listOf(
                Event(
                    type = "conversation",
                    details = "A previous conversation about family",
                    timestamp = System.currentTimeMillis() - 86400000,
                    metadata = mapOf(
                        "conversation_id" to "prev_123",
                        "topic" to "family",
                        "key_points" to "family;values;traditions"
                    )
                )
            )
        )
        
        // When
        val related = conversationSystem.retrieveRelatedConversations("family")
        
        // Then
        assertEquals(1, related.size)
        assertEquals("family", related[0].topic)
        assertEquals("prev_123", related[0].id)
    }
    
    @Test
    fun `add pending topic should prioritize by importance`() {
        // Add topics with different importance
        conversationSystem.addPendingTopic("Low priority", 0.3)
        conversationSystem.addPendingTopic("High priority", 0.9)
        conversationSystem.addPendingTopic("Medium priority", 0.6)
        
        // Process input that should potentially use a pending topic
        val response = conversationSystem.processInput("Tell me something interesting")
        
        // Verify high priority topic is referenced in response
        val incorporatedTopic = response.metadata["incorporated_pending_topic"]
        
        // If a topic was incorporated, it should be the high priority one
        if (incorporatedTopic != null) {
            assertEquals("High priority", incorporatedTopic)
        }
    }
}

/**
 * Mock Value class for testing
 */
data class Value(val name: String, val importance: Double)

/**
 * Mock Event class for testing
 */
data class Event(
    val type: String,
    val details: String,
    val timestamp: Long,
    val metadata: Map<String, Any>
)

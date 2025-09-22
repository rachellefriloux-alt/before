/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Comprehensive tests for advanced human-like capabilities.
 * Got it, love.
 */
package com.sallie.core

import kotlinx.coroutines.runBlocking
import org.junit.Test
import org.junit.Assert.*

/**
 * Test suite to validate Sallie's enhanced human-like capabilities
 */
class HumanLikeCapabilitiesTest {
    
    @Test
    fun testAdaptiveLearning() {
        val learningEngine = AdaptiveLearningEngine()
        
        // Test learning from positive interaction
        learningEngine.learn("work_stress", "help prioritize", "successful_completion", 0.9)
        
        // Test adaptation based on learned patterns
        runBlocking {
            val adaptedResponse = learningEngine.adaptResponse("work_stress", "I need help organizing tasks")
            assertTrue("Response should be adapted based on learning", 
                adaptedResponse.contains("priority") || adaptedResponse.contains("organize"))
        }
        
        // Test creative solution generation
        val creativeSolution = learningEngine.generateCreativeSolution("Complex project management")
        assertNotNull("Should generate creative solutions", creativeSolution)
        
        // Test learning insights
        val insights = learningEngine.getLearningInsights()
        assertTrue("Should have learning patterns", insights["totalPatterns"] as Int > 0)
        assertTrue("Should track effectiveness", insights["averageEffectiveness"] as Double >= 0.0)
    }
    
    @Test
    fun testAdvancedEmotionalIntelligence() {
        val emotionalIntelligence = AdvancedEmotionalIntelligence()
        
        // Test emotional state analysis
        runBlocking {
            val emotionalState = emotionalIntelligence.analyzeEmotionalState(
                "I'm really stressed about this deadline!", 
                "work_pressure"
            )
            assertEquals("Should detect anxiety", "anxiety", emotionalState.primary)
            assertTrue("Should have high intensity", emotionalState.intensity > 0.5)
        }
        
        // Test empathy response generation
        val stressedState = AdvancedEmotionalIntelligence.EmotionalState(
            "anxiety", null, 0.8, 0.9, "work_deadline"
        )
        val empathyResponse = emotionalIntelligence.generateEmpathyResponse(stressedState, "I'm overwhelmed")
        
        assertNotNull("Should provide acknowledgment", empathyResponse.acknowledgment)
        assertNotNull("Should provide comfort", empathyResponse.comfort)
        assertNotNull("Should provide actionable advice", empathyResponse.actionable)
        assertTrue("Should be supportive", empathyResponse.validation.contains("valid") || 
                  empathyResponse.comfort.contains("breath"))
        
        // Test humor detection
        val humorAnalysis = emotionalIntelligence.analyzeHumor("Oh great, just perfect, another meeting")
        assertTrue("Should detect sarcasm", humorAnalysis.isSarcasm)
        assertEquals("Should identify sarcastic tone", "sarcastic", humorAnalysis.tone)
        
        // Test communication style adaptation
        val adaptedStyle = emotionalIntelligence.adaptCommunicationStyle(
            stressedState, 
            listOf("help me", "I need", "please assist")
        )
        assertTrue("Should increase warmth for stressed users", adaptedStyle["warmth"] as Double > 0.7)
        assertTrue("Should increase empathy", adaptedStyle["empathy_level"] as Double > 0.7)
    }
    
    @Test 
    fun testEnhancedMemorySystem() {
        val memoryManager = MemoryManager()
        
        // Test enhanced memory storage
        memoryManager.remember(
            key = "user_preference",
            value = "prefers direct communication style",
            priority = 80,
            category = "personality", 
            emotionalContext = "confident",
            personalRelevance = 0.9
        )
        
        // Test contextual recall
        runBlocking {
            val memories = memoryManager.contextualRecall(
                "communication style",
                "user preferences"
            )
            assertFalse("Should find relevant memories", memories.isEmpty())
            assertTrue("Should prioritize personal relevance", 
                memories.first().personalRelevance > 0.5)
        }
        
        // Test conversation recording and learning
        memoryManager.recordConversation(
            "I like when you're direct with me",
            "Got it, love. I'll keep that in mind."
        )
        
        val conversationHistory = memoryManager.getRecentConversationContext()
        assertFalse("Should store conversation history", conversationHistory.isEmpty())
        
        // Test personalization insights generation  
        val insights = memoryManager.generatePersonalizedInsights()
        assertNotNull("Should generate insights", insights)
        
        // Test memory reinforcement
        memoryManager.reinforceMemory("user_preference", 0.95)
        val reinforcedMemory = memoryManager.recall("user_preference")
        assertNotNull("Should recall reinforced memory", reinforcedMemory)
    }
    
    @Test
    fun testSystemIntegration() {
        // Test basic system initialization and interaction
        val learningEngine = AdaptiveLearningEngine()
        val emotionalIntelligence = AdvancedEmotionalIntelligence()
        val memoryManager = MemoryManager()
        
        // Test basic learning functionality
        learningEngine.learn("test_context", "test_action", "positive_outcome", 0.8)
        val insights = learningEngine.getLearningInsights()
        assertTrue("Learning engine should track patterns", insights["totalPatterns"] as Int > 0)
        
        // Test emotional intelligence
        runBlocking {
            val emotionalState = emotionalIntelligence.analyzeEmotionalState("I'm happy today!")
            assertEquals("Should detect joy", "joy", emotionalState.primary)
        }
        
        // Test memory system
        memoryManager.remember("test_key", "test_value", 75)
        val recalled = memoryManager.recall("test_key")
        assertEquals("Should recall stored value", "test_value", recalled)
        
        // Test conversation recording
        memoryManager.recordConversation("Hello", "Hi there!")
        val history = memoryManager.getRecentConversationContext(1)
        assertFalse("Should store conversation", history.isEmpty())
    }
    
    @Test
    fun testPersonaConsistency() {
        val learningEngine = AdaptiveLearningEngine()
        val emotionalIntelligence = AdvancedEmotionalIntelligence()
        
        // Test that responses maintain Sallie's persona
        runBlocking {
            val response = learningEngine.adaptResponse("general", "Need some help")
            // Should maintain caring but direct tone
            assertTrue("Should maintain persona consistency", 
                response.contains("love") || response.length > 10)
        }
        
        // Test empathy responses maintain persona
        val testState = AdvancedEmotionalIntelligence.EmotionalState("sadness", null, 0.7, 0.8)
        val empathy = emotionalIntelligence.generateEmpathyResponse(testState, "I'm feeling down")
        assertTrue("Should provide comfort", empathy.comfort.isNotEmpty())
        assertTrue("Should provide validation", empathy.validation.isNotEmpty())
    }
}
package com.sallie.core.emotional

import android.content.Context
import com.sallie.core.memory.HierarchicalMemorySystem
import com.sallie.core.personality.AdvancedPersonalitySystem
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.every
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

class EmpathicResponseGeneratorTest {

    private lateinit var context: Context
    private lateinit var memorySystem: HierarchicalMemorySystem
    private lateinit var personalitySystem: AdvancedPersonalitySystem
    private lateinit var emotionalIntelligenceEngine: EmotionalIntelligenceEngine
    private lateinit var empathicResponseGenerator: EmpathicResponseGenerator

    @Before
    fun setup() {
        context = mockk(relaxed = true)
        memorySystem = mockk(relaxed = true)
        personalitySystem = mockk(relaxed = true)
        emotionalIntelligenceEngine = mockk(relaxed = true)
        
        // Setup mock instances
        every { HierarchicalMemorySystem.getInstance(any()) } returns memorySystem
        every { AdvancedPersonalitySystem.getInstance(any()) } returns personalitySystem
        every { EmotionalIntelligenceEngine.getInstance(any()) } returns emotionalIntelligenceEngine
        
        // Mock personality traits
        every { personalitySystem.getCurrentTraits() } returns mapOf(
            "COMPASSION" to 0.7,
            "ASSERTIVENESS" to 0.6,
            "EMOTIONAL_INTELLIGENCE" to 0.8,
            "EMPATHY" to 0.75,
            "OPTIMISM" to 0.65,
            "PATIENCE" to 0.7
        )
        
        // Initialize the generator
        empathicResponseGenerator = EmpathicResponseGenerator.getInstance(context)
        empathicResponseGenerator.initialize()
    }
    
    @Test
    fun `test generates response for joy emotion`() = runBlocking {
        // Given
        val emotionalState = EmotionalRecognitionResult(
            primaryEmotion = Emotion.JOY,
            confidenceScore = 0.9,
            intensity = 0.8
        )
        val userInput = "I'm so happy today! I got the job!"
        
        // Mock memory storage
        coEvery { memorySystem.store(any(), any(), any(), any()) } returns Unit
        
        // When
        val response = empathicResponseGenerator.generateResponse(emotionalState, userInput)
        
        // Then
        assertNotNull(response)
        assertNotNull(response.acknowledgment)
        assertNotNull(response.fullResponse)
        
        // Joy responses should contain acknowledgment
        assertTrue(response.acknowledgment.contains("happy") || 
                  response.acknowledgment.contains("joy") ||
                  response.acknowledgment.contains("pleased"))
        
        // Verify response was stored in memory
        coVerify { memorySystem.store(
            content = match { it.contains("Empathic response:") },
            category = eq("EMPATHIC_RESPONSE"),
            metadata = any()
        ) }
    }
    
    @Test
    fun `test generates response for sadness emotion`() = runBlocking {
        // Given
        val emotionalState = EmotionalRecognitionResult(
            primaryEmotion = Emotion.SADNESS,
            confidenceScore = 0.85,
            intensity = 0.7
        )
        val userInput = "I'm feeling really down today."
        
        // When
        val response = empathicResponseGenerator.generateResponse(emotionalState, userInput)
        
        // Then
        assertNotNull(response.acknowledgment)
        assertNotNull(response.validation)
        assertNotNull(response.support)
        
        // Sadness responses should have support component
        assertFalse(response.support.isEmpty())
        
        // Support should be empathetic
        assertTrue(response.support.contains("here for you") || 
                  response.support.contains("acknowledge") ||
                  response.support.contains("process") ||
                  response.support.contains("difficult"))
    }
    
    @Test
    fun `test generates response for anger emotion`() = runBlocking {
        // Given
        val emotionalState = EmotionalRecognitionResult(
            primaryEmotion = Emotion.ANGER,
            confidenceScore = 0.8,
            intensity = 0.9
        )
        val userInput = "I'm furious about how they treated me!"
        
        // When
        val response = empathicResponseGenerator.generateResponse(emotionalState, userInput)
        
        // Then
        assertNotNull(response.acknowledgment)
        assertNotNull(response.validation)
        
        // Anger responses should validate the emotion
        assertTrue(response.validation.contains("frustration") || 
                  response.validation.contains("understandable") ||
                  response.validation.contains("valid"))
    }
    
    @Test
    fun `test generates response with different response types`() = runBlocking {
        // Given
        val emotionalState = EmotionalRecognitionResult(
            primaryEmotion = Emotion.FEAR,
            secondaryEmotion = Emotion.ANXIETY,
            confidenceScore = 0.85,
            intensity = 0.7
        )
        val userInput = "I'm worried about my upcoming presentation."
        
        // When - Test different response types
        val acknowledgmentResponse = empathicResponseGenerator.generateResponse(
            emotionalState, userInput, ResponseType.ACKNOWLEDGMENT_FOCUSED
        )
        
        val validationResponse = empathicResponseGenerator.generateResponse(
            emotionalState, userInput, ResponseType.VALIDATION_FOCUSED
        )
        
        val supportResponse = empathicResponseGenerator.generateResponse(
            emotionalState, userInput, ResponseType.SUPPORT_FOCUSED
        )
        
        val encouragementResponse = empathicResponseGenerator.generateResponse(
            emotionalState, userInput, ResponseType.ENCOURAGEMENT_FOCUSED
        )
        
        // Then - Each type should have appropriate emphasis
        assertTrue(acknowledgmentResponse.fullResponse.startsWith(acknowledgmentResponse.acknowledgment))
        
        assertTrue(validationResponse.fullResponse.contains(validationResponse.validation))
        assertTrue(validationResponse.validation.isNotEmpty())
        
        assertTrue(supportResponse.fullResponse.contains(supportResponse.support))
        assertTrue(supportResponse.support.isNotEmpty())
        
        assertTrue(encouragementResponse.fullResponse.contains(encouragementResponse.encouragement))
        assertTrue(encouragementResponse.encouragement.isNotEmpty())
    }
    
    @Test
    fun `test personality traits influence response`() = runBlocking {
        // Given
        val emotionalState = EmotionalRecognitionResult(
            primaryEmotion = Emotion.DISAPPOINTMENT,
            confidenceScore = 0.8,
            intensity = 0.7
        )
        val userInput = "I didn't get the promotion I was hoping for."
        
        // Test with standard personality traits
        val standardResponse = empathicResponseGenerator.generateResponse(emotionalState, userInput)
        
        // Now test with modified traits - more compassionate, less direct
        every { personalitySystem.getCurrentTraits() } returns mapOf(
            "COMPASSION" to 0.95,  // Very high compassion
            "ASSERTIVENESS" to 0.3,  // Low assertiveness/directness
            "EMOTIONAL_INTELLIGENCE" to 0.8,
            "EMPATHY" to 0.9,
            "OPTIMISM" to 0.65,
            "PATIENCE" to 0.85
        )
        
        val compassionateResponse = empathicResponseGenerator.generateResponse(emotionalState, userInput)
        
        // Now test with modified traits - less compassionate, more direct
        every { personalitySystem.getCurrentTraits() } returns mapOf(
            "COMPASSION" to 0.3,  // Low compassion
            "ASSERTIVENESS" to 0.9,  // High assertiveness/directness
            "EMOTIONAL_INTELLIGENCE" to 0.8,
            "EMPATHY" to 0.4,
            "OPTIMISM" to 0.65,
            "PATIENCE" to 0.5
        )
        
        val directResponse = empathicResponseGenerator.generateResponse(emotionalState, userInput)
        
        // Then - Responses should be different based on personality traits
        assertFalse(standardResponse.fullResponse == compassionateResponse.fullResponse)
        assertFalse(standardResponse.fullResponse == directResponse.fullResponse)
        assertFalse(compassionateResponse.fullResponse == directResponse.fullResponse)
        
        // Compassionate response should be longer and contain more supportive language
        assertTrue(compassionateResponse.support.length >= standardResponse.support.length)
        
        // Direct response should be more concise
        assertTrue(directResponse.fullResponse.length <= compassionateResponse.fullResponse.length)
    }
}

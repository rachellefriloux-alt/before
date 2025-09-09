package com.sallie.core.emotional

import android.content.Context
import com.sallie.core.memory.HierarchicalMemorySystem
import com.sallie.core.memory.MemoryItem
import com.sallie.core.personality.AdvancedPersonalitySystem
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

class EmotionalCalibrationSystemTest {

    private lateinit var context: Context
    private lateinit var memorySystem: HierarchicalMemorySystem
    private lateinit var personalitySystem: AdvancedPersonalitySystem
    private lateinit var emotionalIntelligenceEngine: EmotionalIntelligenceEngine
    private lateinit var empathicResponseGenerator: EmpathicResponseGenerator
    private lateinit var calibrationSystem: EmotionalCalibrationSystem
    
    @Before
    fun setup() {
        context = mockk(relaxed = true)
        memorySystem = mockk(relaxed = true)
        personalitySystem = mockk(relaxed = true)
        emotionalIntelligenceEngine = mockk(relaxed = true)
        empathicResponseGenerator = mockk(relaxed = true)
        
        // Setup mock instances
        every { HierarchicalMemorySystem.getInstance(any()) } returns memorySystem
        every { AdvancedPersonalitySystem.getInstance(any()) } returns personalitySystem
        every { EmotionalIntelligenceEngine.getInstance(any()) } returns emotionalIntelligenceEngine
        every { EmpathicResponseGenerator.getInstance(any()) } returns empathicResponseGenerator
        
        // Mock retrieval of calibration data
        coEvery { memorySystem.retrieve(any(), any(), any()) } returns null
        
        // Mock personality trait setting
        coEvery { personalitySystem.setTemporaryTraitModifiers(any(), any()) } returns Unit
        
        // Initialize the calibration system
        calibrationSystem = EmotionalCalibrationSystem.getInstance(context)
        runBlocking { calibrationSystem.initialize() }
    }
    
    @Test
    fun `test initial calibration data has default values`() {
        // When
        val calibrationData = calibrationSystem.getCalibrationData()
        
        // Then
        assertEquals(0.0, calibrationData.compassionAdjustment, 0.01)
        assertEquals(0.0, calibrationData.directnessAdjustment, 0.01)
        assertEquals(0.0, calibrationData.validationAdjustment, 0.01)
        assertEquals(0.0, calibrationData.supportAdjustment, 0.01)
        assertEquals(0, calibrationData.positiveResponseCount)
        assertEquals(0, calibrationData.negativeResponseCount)
        assertEquals(0, calibrationData.neutralResponseCount)
        assertEquals(0, calibrationData.totalInteractions)
    }
    
    @Test
    fun `test loading saved calibration data`() = runBlocking {
        // Given - Mock saved calibration data
        coEvery { memorySystem.retrieve(eq("SYSTEM_DATA"), eq("emotional_calibration_data"), any()) } returns MemoryItem(
            id = "calibration_data",
            content = "Emotional calibration data",
            category = "SYSTEM_DATA",
            timestamp = System.currentTimeMillis(),
            metadata = mapOf(
                "compassionAdjustment" to 0.1,
                "directnessAdjustment" to -0.05,
                "validationAdjustment" to 0.07,
                "supportAdjustment" to 0.03,
                "positiveResponseCount" to 5,
                "negativeResponseCount" to 2,
                "neutralResponseCount" to 3,
                "totalInteractions" to 10,
                "timestamp" to System.currentTimeMillis()
            )
        )
        
        // When
        val newCalibrationSystem = EmotionalCalibrationSystem.getInstance(context)
        newCalibrationSystem.initialize()
        val calibrationData = newCalibrationSystem.getCalibrationData()
        
        // Then
        assertEquals(0.1, calibrationData.compassionAdjustment, 0.01)
        assertEquals(-0.05, calibrationData.directnessAdjustment, 0.01)
        assertEquals(0.07, calibrationData.validationAdjustment, 0.01)
        assertEquals(0.03, calibrationData.supportAdjustment, 0.01)
        assertEquals(5, calibrationData.positiveResponseCount)
        assertEquals(2, calibrationData.negativeResponseCount)
        assertEquals(3, calibrationData.neutralResponseCount)
        assertEquals(10, calibrationData.totalInteractions)
    }
    
    @Test
    fun `test processing positive feedback`() = runBlocking {
        // Given
        val emotionalState = EmotionalRecognitionResult(
            primaryEmotion = Emotion.SADNESS,
            confidenceScore = 0.85,
            intensity = 0.7
        )
        
        val response = EmpathicResponse(
            acknowledgment = "I can see that you're feeling down.",
            validation = "It's completely understandable to feel that way given what happened.",
            support = "I'm here for you through this difficult time.",
            encouragement = "Even though it's difficult now, things will eventually improve.",
            fullResponse = "I can see that you're feeling down. It's completely understandable to feel that way given what happened. I'm here for you through this difficult time. Even though it's difficult now, things will eventually improve.",
            emotionalState = emotionalState
        )
        
        // When - Process multiple pieces of positive feedback to exceed threshold
        calibrationSystem.processFeedback(response, FeedbackType.POSITIVE)
        calibrationSystem.processFeedback(response, FeedbackType.POSITIVE)
        calibrationSystem.processFeedback(response, FeedbackType.POSITIVE)
        calibrationSystem.processFeedback(response, FeedbackType.POSITIVE)
        calibrationSystem.processFeedback(response, FeedbackType.POSITIVE)
        
        // Then
        val calibrationData = calibrationSystem.getCalibrationData()
        assertEquals(5, calibrationData.positiveResponseCount)
        assertEquals(0, calibrationData.negativeResponseCount)
        assertEquals(5, calibrationData.totalInteractions)
        
        // The positive feedback should keep the adjustments near neutral or slightly positive
        assertTrue(calibrationData.compassionAdjustment >= 0.0)
        
        // Verify data was saved
        coVerify { memorySystem.store(
            content = eq("Emotional calibration data"),
            category = eq("SYSTEM_DATA"),
            identifier = eq("emotional_calibration_data"),
            metadata = any()
        ) }
    }
    
    @Test
    fun `test processing negative feedback`() = runBlocking {
        // Given
        val emotionalState = EmotionalRecognitionResult(
            primaryEmotion = Emotion.ANGER,
            confidenceScore = 0.8,
            intensity = 0.9
        )
        
        val response = EmpathicResponse(
            acknowledgment = "I can tell you're feeling frustrated.",
            validation = "Your frustration is valid considering the circumstances.",
            support = "I'm here to listen without judgment.",
            encouragement = "Let's break this down into smaller, more manageable steps.",
            fullResponse = "I can tell you're feeling frustrated. Your frustration is valid considering the circumstances. I'm here to listen without judgment. Let's break this down into smaller, more manageable steps.",
            emotionalState = emotionalState
        )
        
        // When - Process multiple pieces of negative feedback to exceed threshold
        calibrationSystem.processFeedback(response, FeedbackType.NEGATIVE)
        calibrationSystem.processFeedback(response, FeedbackType.NEGATIVE)
        calibrationSystem.processFeedback(response, FeedbackType.NEGATIVE)
        calibrationSystem.processFeedback(response, FeedbackType.NEGATIVE)
        calibrationSystem.processFeedback(response, FeedbackType.NEGATIVE)
        
        // Then
        val calibrationData = calibrationSystem.getCalibrationData()
        assertEquals(0, calibrationData.positiveResponseCount)
        assertEquals(5, calibrationData.negativeResponseCount)
        assertEquals(5, calibrationData.totalInteractions)
        
        // The system should have made some adjustments based on negative feedback
        assertTrue(calibrationData.compassionAdjustment != 0.0 || 
                  calibrationData.directnessAdjustment != 0.0 || 
                  calibrationData.validationAdjustment != 0.0 ||
                  calibrationData.supportAdjustment != 0.0)
    }
    
    @Test
    fun `test determining optimal response type`() {
        // Given - Different emotional states
        val sadnessHigh = EmotionalRecognitionResult(
            primaryEmotion = Emotion.SADNESS,
            confidenceScore = 0.9,
            intensity = 0.8
        )
        
        val joyMedium = EmotionalRecognitionResult(
            primaryEmotion = Emotion.JOY,
            confidenceScore = 0.85,
            intensity = 0.6
        )
        
        val confusionMedium = EmotionalRecognitionResult(
            primaryEmotion = Emotion.CONFUSION,
            confidenceScore = 0.8,
            intensity = 0.5
        )
        
        // When
        val sadnessResponseType = calibrationSystem.determineOptimalResponseType(sadnessHigh)
        val joyResponseType = calibrationSystem.determineOptimalResponseType(joyMedium)
        val confusionResponseType = calibrationSystem.determineOptimalResponseType(confusionMedium)
        
        // Then
        // Sadness with high intensity should get validation or support
        assertTrue(sadnessResponseType == ResponseType.VALIDATION_FOCUSED || 
                  sadnessResponseType == ResponseType.SUPPORT_FOCUSED)
        
        // Joy should get acknowledgment
        assertEquals(ResponseType.ACKNOWLEDGMENT_FOCUSED, joyResponseType)
        
        // Confusion should get acknowledgment or encouragement
        assertTrue(confusionResponseType == ResponseType.ACKNOWLEDGMENT_FOCUSED || 
                  confusionResponseType == ResponseType.ENCOURAGEMENT_FOCUSED)
    }
    
    @Test
    fun `test applying calibration to personality`() = runBlocking {
        // Given - A calibrated system with non-zero adjustments
        val traitsSlot = slot<Map<String, Double>>()
        
        // Mock private fields by resetting and setting with reflection
        calibrationSystem.resetCalibration()
        val field = EmotionalCalibrationSystem::class.java.getDeclaredField("compassionAdjustment")
        field.isAccessible = true
        val atomicRef = field.get(calibrationSystem)
        val setMethod = atomicRef.javaClass.getMethod("set", Double::class.java)
        setMethod.invoke(atomicRef, 0.2) // Set compassion adjustment to 0.2
        
        // When
        calibrationSystem.applyCalibrationToPersonality()
        
        // Then
        // Verify traits were modified with the calibration values
        coVerify { personalitySystem.setTemporaryTraitModifiers(capture(traitsSlot), eq("EMOTIONAL_CALIBRATION")) }
        
        val traits = traitsSlot.captured
        assertTrue(traits.containsKey("COMPASSION"))
        assertTrue(traits["COMPASSION"]!! > 0.7) // Should be increased from default
    }
    
    @Test
    fun `test reset calibration`() = runBlocking {
        // Given - A system with non-default values
        calibrationSystem.processFeedback(
            EmpathicResponse(
                acknowledgment = "Test",
                validation = "Test",
                support = "Test",
                encouragement = "Test",
                fullResponse = "Test full response",
                emotionalState = EmotionalRecognitionResult(
                    primaryEmotion = Emotion.NEUTRAL,
                    confidenceScore = 0.5,
                    intensity = 0.5
                )
            ),
            FeedbackType.POSITIVE
        )
        
        // When
        calibrationSystem.resetCalibration()
        
        // Then
        val calibrationData = calibrationSystem.getCalibrationData()
        assertEquals(0.0, calibrationData.compassionAdjustment, 0.01)
        assertEquals(0.0, calibrationData.directnessAdjustment, 0.01)
        assertEquals(0.0, calibrationData.supportAdjustment, 0.01)
        assertEquals(0, calibrationData.totalInteractions)
        
        // Verify reset was saved
        coVerify { memorySystem.store(
            content = eq("Emotional calibration data"),
            category = eq("SYSTEM_DATA"),
            identifier = eq("emotional_calibration_data"),
            metadata = any()
        ) }
    }
}

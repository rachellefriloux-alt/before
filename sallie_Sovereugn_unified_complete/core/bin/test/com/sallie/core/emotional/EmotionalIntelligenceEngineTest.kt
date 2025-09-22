package com.sallie.core.emotional

import android.content.Context
import com.sallie.core.memory.HierarchicalMemorySystem
import com.sallie.core.memory.MemoryItem
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
import java.util.concurrent.TimeUnit

class EmotionalIntelligenceEngineTest {

    private lateinit var context: Context
    private lateinit var memorySystem: HierarchicalMemorySystem
    private lateinit var emotionalIntelligenceEngine: EmotionalIntelligenceEngine

    @Before
    fun setup() {
        context = mockk(relaxed = true)
        memorySystem = mockk(relaxed = true)
        
        // Setup memory system mock
        every { HierarchicalMemorySystem.getInstance(any()) } returns memorySystem
        
        // Mock memory retrieval for trend analysis
        coEvery { memorySystem.retrieveByCategory(any(), any(), any()) } returns listOf(
            MemoryItem(
                id = "1",
                content = "I'm feeling really happy today",
                category = "USER_EMOTION",
                timestamp = System.currentTimeMillis() - TimeUnit.DAYS.toMillis(2),
                metadata = mapOf(
                    "emotion" to "JOY",
                    "confidence" to 0.92,
                    "intensity" to 0.85
                )
            ),
            MemoryItem(
                id = "2",
                content = "This is making me anxious",
                category = "USER_EMOTION",
                timestamp = System.currentTimeMillis() - TimeUnit.DAYS.toMillis(1),
                metadata = mapOf(
                    "emotion" to "ANXIETY",
                    "confidence" to 0.87,
                    "intensity" to 0.78
                )
            ),
            MemoryItem(
                id = "3",
                content = "I'm so frustrated with this",
                category = "USER_EMOTION",
                timestamp = System.currentTimeMillis() - TimeUnit.HOURS.toMillis(12),
                metadata = mapOf(
                    "emotion" to "FRUSTRATION",
                    "confidence" to 0.89,
                    "intensity" to 0.82
                )
            )
        )
        
        // Initialize the engine
        emotionalIntelligenceEngine = EmotionalIntelligenceEngine.getInstance(context)
        runBlocking { emotionalIntelligenceEngine.initialize() }
    }

    @Test
    fun `test analyze emotion detects joy correctly`() = runBlocking {
        // Given
        val text = "I'm so happy today! Everything is going great and I feel wonderful."
        
        // When
        val result = emotionalIntelligenceEngine.analyzeEmotion(text)
        
        // Then
        assertEquals(Emotion.JOY, result.primaryEmotion)
        assertTrue(result.confidenceScore > 0.7)
        assertTrue(result.intensity > 0.6)
        
        // Verify emotion was stored in memory
        val metadataSlot = slot<Map<String, Any>>()
        coVerify { 
            memorySystem.store(
                content = any(),
                category = eq("USER_EMOTION"),
                metadata = capture(metadataSlot)
            ) 
        }
        
        // Check metadata
        assertEquals("JOY", metadataSlot.captured["emotion"])
    }
    
    @Test
    fun `test analyze emotion detects sadness correctly`() = runBlocking {
        // Given
        val text = "I'm feeling so down and depressed. Nothing is going right for me."
        
        // When
        val result = emotionalIntelligenceEngine.analyzeEmotion(text)
        
        // Then
        assertEquals(Emotion.SADNESS, result.primaryEmotion)
        assertTrue(result.confidenceScore > 0.7)
        
        // Verify emotion was stored
        coVerify { memorySystem.store(any(), eq("USER_EMOTION"), any(), any()) }
    }
    
    @Test
    fun `test analyze emotion detects anger correctly`() = runBlocking {
        // Given
        val text = "This is so frustrating! I'm really annoyed and upset about how this was handled."
        
        // When
        val result = emotionalIntelligenceEngine.analyzeEmotion(text)
        
        // Then
        assertTrue(result.primaryEmotion == Emotion.ANGER || result.primaryEmotion == Emotion.FRUSTRATION)
        assertTrue(result.confidenceScore > 0.7)
    }
    
    @Test
    fun `test analyze emotion with mixed emotions`() = runBlocking {
        // Given
        val text = "I'm happy about the promotion but worried about the new responsibilities."
        
        // When
        val result = emotionalIntelligenceEngine.analyzeEmotion(text)
        
        // Then
        assertNotNull(result.primaryEmotion)
        assertNotNull(result.secondaryEmotion)
        assertTrue(result.allDetectedEmotions.size >= 2)
    }
    
    @Test
    fun `test analyze emotion with context`() = runBlocking {
        // Given
        val text = "It didn't work out."
        val context = "I was really hoping to get that job."
        
        // When
        val result = emotionalIntelligenceEngine.analyzeEmotion(text, context)
        
        // Then
        assertTrue(result.primaryEmotion == Emotion.DISAPPOINTMENT || result.primaryEmotion == Emotion.SADNESS)
    }
    
    @Test
    fun `test analyze trends returns expected data`() = runBlocking {
        // When
        val trends = emotionalIntelligenceEngine.analyzeTrends(TimeUnit.DAYS.toMillis(7))
        
        // Then
        assertTrue(trends.dominantEmotions.isNotEmpty())
        assertTrue(trends.emotionalVariability >= 0.0)
        assertTrue(trends.timeframeMs == TimeUnit.DAYS.toMillis(7))
    }
}

package com.sallie.core.emotion

import com.sallie.core.integration.RelationshipTrackingSystem
import com.sallie.core.integration.UserAdaptationEngine
import com.sallie.core.interaction.InteractionStyleAdapter
import kotlinx.coroutines.flow.MutableStateFlow
import org.junit.Before
import org.junit.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class AdvancedEmotionalIntelligenceTest {

    private lateinit var emotionalIntelligence: AdvancedEmotionalIntelligence
    private lateinit var mockAdaptationEngine: UserAdaptationEngine
    private lateinit var mockRelationshipSystem: RelationshipTrackingSystem
    private lateinit var mockStyleAdapter: InteractionStyleAdapter
    
    @Before
    fun setup() {
        mockAdaptationEngine = mock()
        mockRelationshipSystem = mock()
        mockStyleAdapter = mock()
        
        // Setup default mocked responses
        whenever(mockAdaptationEngine.getUserProfile()).thenReturn(
            UserAdaptationEngine.UserProfile(
                name = "Test User",
                communicationStyle = UserAdaptationEngine.CommunicationStyle.BALANCED,
                interactionPreferences = mapOf("formality" to 0.5f),
                topicPreferences = listOf("technology", "health"),
                valueAlignment = mapOf("loyalty" to 0.9f, "helpfulness" to 0.8f)
            )
        )
        
        whenever(mockRelationshipSystem.getRecentInteractions(any())).thenReturn(
            listOf(
                RelationshipTrackingSystem.Interaction(
                    type = "conversation",
                    context = "technology",
                    outcome = true,
                    metadata = mapOf("emotion" to "Joy:0.7")
                ),
                RelationshipTrackingSystem.Interaction(
                    type = "emotional_response",
                    context = "work",
                    outcome = true,
                    metadata = mapOf("emotion" to "Anger:0.6")
                )
            )
        )
        
        whenever(mockRelationshipSystem.getInteractionsByContext(any(), any())).thenReturn(
            listOf(
                RelationshipTrackingSystem.Interaction(
                    type = "emotional_response",
                    context = "JOY",
                    outcome = true,
                    metadata = mapOf(
                        "emotion" to "Joy:0.8",
                        "trigger" to "success"
                    )
                )
            )
        )
        
        whenever(mockStyleAdapter.getStyleForContext(any())).thenReturn(
            InteractionStyleAdapter.InteractionStyle(
                formalityLevel = InteractionStyleAdapter.FormalityLevel.NEUTRAL,
                expressiveness = InteractionStyleAdapter.Expressiveness.BALANCED,
                detailLevel = InteractionStyleAdapter.DetailLevel.BALANCED,
                personalTone = InteractionStyleAdapter.PersonalTone.FRIENDLY,
                clarityEmphasis = InteractionStyleAdapter.ClarityEmphasis.BALANCED,
                supportiveLanguageLevel = InteractionStyleAdapter.SupportiveLanguageLevel.BALANCED
            )
        )
        
        whenever(mockStyleAdapter.applyStyle(any(), any())).thenAnswer { invocation ->
            // Return the original message to simplify testing
            invocation.arguments[0] as String
        }
        
        emotionalIntelligence = AdvancedEmotionalIntelligence(
            mockAdaptationEngine,
            mockRelationshipSystem,
            mockStyleAdapter
        )
        
        emotionalIntelligence.initialize()
    }
    
    @Test
    fun `detectEmotionalContext identifies joy correctly`() {
        // Setup
        val joyMessage = "I'm so happy today! This is amazing news! 😊"
        
        // Act
        val context = emotionalIntelligence.detectEmotionalContext(joyMessage)
        
        // Assert
        assertTrue(context.primaryEmotion is AdvancedEmotionalIntelligence.EmotionalState.Joy)
        assertEquals(AdvancedEmotionalIntelligence.EmotionalIntensity.HIGH, context.intensity)
    }
    
    @Test
    fun `detectEmotionalContext identifies sadness correctly`() {
        // Setup
        val sadMessage = "I'm feeling so sad and disappointed about what happened"
        
        // Act
        val context = emotionalIntelligence.detectEmotionalContext(sadMessage)
        
        // Assert
        assertTrue(context.primaryEmotion is AdvancedEmotionalIntelligence.EmotionalState.Sadness)
    }
    
    @Test
    fun `detectEmotionalContext identifies anger correctly`() {
        // Setup
        val angryMessage = "This is so frustrating and annoying! I'm really mad about it."
        
        // Act
        val context = emotionalIntelligence.detectEmotionalContext(angryMessage)
        
        // Assert
        assertTrue(context.primaryEmotion is AdvancedEmotionalIntelligence.EmotionalState.Anger)
    }
    
    @Test
    fun `detectEmotionalContext identifies fear correctly`() {
        // Setup
        val fearMessage = "I'm really worried about my upcoming presentation. I'm so anxious!"
        
        // Act
        val context = emotionalIntelligence.detectEmotionalContext(fearMessage)
        
        // Assert
        assertTrue(context.primaryEmotion is AdvancedEmotionalIntelligence.EmotionalState.Fear)
    }
    
    @Test
    fun `detectEmotionalContext calculates emotional intensity based on text markers`() {
        // Setup
        val highIntensityMessage = "I'M SO EXCITED!!!!! This is ABSOLUTELY AMAZING!!!"
        val mediumIntensityMessage = "I'm happy about this! It's really good news."
        val lowIntensityMessage = "This is nice."
        
        // Act
        val highContext = emotionalIntelligence.detectEmotionalContext(highIntensityMessage)
        val mediumContext = emotionalIntelligence.detectEmotionalContext(mediumIntensityMessage)
        val lowContext = emotionalIntelligence.detectEmotionalContext(lowIntensityMessage)
        
        // Assert
        assertEquals(AdvancedEmotionalIntelligence.EmotionalIntensity.HIGH, highContext.intensity)
        assertEquals(AdvancedEmotionalIntelligence.EmotionalIntensity.MEDIUM, mediumContext.intensity)
        assertEquals(AdvancedEmotionalIntelligence.EmotionalIntensity.LOW, lowContext.intensity)
    }
    
    @Test
    fun `detectEmotionalContext identifies potential triggers`() {
        // Setup
        val messageWithTrigger = "I'm so happy about my new job offer!"
        
        // Act
        val context = emotionalIntelligence.detectEmotionalContext(messageWithTrigger)
        
        // Assert
        assertTrue(context.triggers.isNotEmpty())
        assertTrue(context.triggers.contains("work") || context.triggers.contains("success"))
    }
    
    @Test
    fun `generateEmotionalResponse adds celebration for joy`() {
        // Setup
        val baseMessage = "Here's the information you requested."
        val joyContext = AdvancedEmotionalIntelligence.EmotionalContext(
            primaryEmotion = AdvancedEmotionalIntelligence.EmotionalState.Joy(0.8f),
            intensity = AdvancedEmotionalIntelligence.EmotionalIntensity.HIGH,
            emotionalTrend = AdvancedEmotionalIntelligence.EmotionalTrend.STABLE,
            triggers = listOf("success"),
            needsAttention = false
        )
        
        // Act
        val response = emotionalIntelligence.generateEmotionalResponse(baseMessage, joyContext)
        
        // Assert
        assertTrue(response.contains("Wonderful!") || response.contains("fantastic") ||
                 response.contains("happy") || response.contains("Amazing"))
    }
    
    @Test
    fun `generateEmotionalResponse adds empathy for sadness`() {
        // Setup
        val baseMessage = "Here's the information you requested."
        val sadContext = AdvancedEmotionalIntelligence.EmotionalContext(
            primaryEmotion = AdvancedEmotionalIntelligence.EmotionalState.Sadness(0.7f),
            intensity = AdvancedEmotionalIntelligence.EmotionalIntensity.MEDIUM,
            emotionalTrend = AdvancedEmotionalIntelligence.EmotionalTrend.STABLE,
            triggers = listOf("loss"),
            needsAttention = false
        )
        
        // Act
        val response = emotionalIntelligence.generateEmotionalResponse(baseMessage, sadContext)
        
        // Assert
        assertTrue(response.contains("sorry") || response.contains("difficult") || 
                 response.contains("tough") || response.contains("here for you"))
    }
    
    @Test
    fun `generateEmotionalResponse adds calm redirection for anger`() {
        // Setup
        val baseMessage = "Here's the information you requested."
        val angerContext = AdvancedEmotionalIntelligence.EmotionalContext(
            primaryEmotion = AdvancedEmotionalIntelligence.EmotionalState.Anger(0.6f),
            intensity = AdvancedEmotionalIntelligence.EmotionalIntensity.MEDIUM,
            emotionalTrend = AdvancedEmotionalIntelligence.EmotionalTrend.STABLE,
            triggers = listOf("work"),
            needsAttention = false
        )
        
        // Act
        val response = emotionalIntelligence.generateEmotionalResponse(baseMessage, angerContext)
        
        // Assert
        assertTrue(response.contains("step back") || response.contains("calmly") || 
                 response.contains("frustrating"))
    }
    
    @Test
    fun `generateEmotionalResponse adds reassurance for fear`() {
        // Setup
        val baseMessage = "Here's the information you requested."
        val fearContext = AdvancedEmotionalIntelligence.EmotionalContext(
            primaryEmotion = AdvancedEmotionalIntelligence.EmotionalState.Fear(0.7f),
            intensity = AdvancedEmotionalIntelligence.EmotionalIntensity.LOW,
            emotionalTrend = AdvancedEmotionalIntelligence.EmotionalTrend.STABLE,
            triggers = listOf("health"),
            needsAttention = false
        )
        
        // Act
        val response = emotionalIntelligence.generateEmotionalResponse(baseMessage, fearContext)
        
        // Assert
        assertTrue(response.contains("okay") || response.contains("figure this out") || 
                 response.contains("here with you"))
    }
    
    @Test
    fun `recordEmotionalResponseFeedback records interaction in relationship system`() {
        // Setup
        val context = AdvancedEmotionalIntelligence.EmotionalContext(
            primaryEmotion = AdvancedEmotionalIntelligence.EmotionalState.Joy(0.8f),
            intensity = AdvancedEmotionalIntelligence.EmotionalIntensity.HIGH,
            emotionalTrend = AdvancedEmotionalIntelligence.EmotionalTrend.STABLE,
            triggers = listOf("success"),
            needsAttention = false
        )
        
        // Act
        emotionalIntelligence.recordEmotionalResponseFeedback(
            context,
            AdvancedEmotionalIntelligence.EmotionalResponseStrategy.CELEBRATION,
            true
        )
        
        // Assert
        verify(mockRelationshipSystem).recordInteraction(any())
    }
    
    @Test
    fun `strong negative emotions should need attention`() {
        // Setup - use reflection to access private method
        val sadState = AdvancedEmotionalIntelligence.EmotionalState.Sadness(0.8f)
        val method = AdvancedEmotionalIntelligence::class.java.getDeclaredMethod(
            "needsEmotionalAttention", 
            AdvancedEmotionalIntelligence.EmotionalState::class.java
        )
        method.isAccessible = true
        
        // Act
        val needsAttention = method.invoke(emotionalIntelligence, sadState) as Boolean
        
        // Assert
        assertTrue(needsAttention)
    }
    
    @Test
    fun `neutral emotions should not need attention`() {
        // Setup - use reflection to access private method
        val neutralState = AdvancedEmotionalIntelligence.EmotionalState.Neutral()
        val method = AdvancedEmotionalIntelligence::class.java.getDeclaredMethod(
            "needsEmotionalAttention", 
            AdvancedEmotionalIntelligence.EmotionalState::class.java
        )
        method.isAccessible = true
        
        // Act
        val needsAttention = method.invoke(emotionalIntelligence, neutralState) as Boolean
        
        // Assert
        assertFalse(needsAttention)
    }
    
    @Test
    fun `detect emotional trend correctly identifies stable trend`() {
        // Setup - Set recent emotions to establish trend
        val recentEmotionsField = AdvancedEmotionalIntelligence::class.java.getDeclaredField("recentEmotions")
        recentEmotionsField.isAccessible = true
        val emotions = mutableListOf(
            AdvancedEmotionalIntelligence.EmotionalState.Joy(0.6f),
            AdvancedEmotionalIntelligence.EmotionalState.Joy(0.6f),
            AdvancedEmotionalIntelligence.EmotionalState.Joy(0.6f)
        )
        recentEmotionsField.set(emotionalIntelligence, emotions)
        
        // Access private method
        val method = AdvancedEmotionalIntelligence::class.java.getDeclaredMethod("detectEmotionalTrend")
        method.isAccessible = true
        
        // Act
        val trend = method.invoke(emotionalIntelligence) as AdvancedEmotionalIntelligence.EmotionalTrend
        
        // Assert
        assertEquals(AdvancedEmotionalIntelligence.EmotionalTrend.STABLE, trend)
    }
    
    @Test
    fun `detect emotional trend correctly identifies intensifying trend`() {
        // Setup - Set recent emotions to establish trend
        val recentEmotionsField = AdvancedEmotionalIntelligence::class.java.getDeclaredField("recentEmotions")
        recentEmotionsField.isAccessible = true
        val emotions = mutableListOf(
            AdvancedEmotionalIntelligence.EmotionalState.Joy(0.4f),
            AdvancedEmotionalIntelligence.EmotionalState.Joy(0.6f),
            AdvancedEmotionalIntelligence.EmotionalState.Joy(0.8f)
        )
        recentEmotionsField.set(emotionalIntelligence, emotions)
        
        // Access private method
        val method = AdvancedEmotionalIntelligence::class.java.getDeclaredMethod("detectEmotionalTrend")
        method.isAccessible = true
        
        // Act
        val trend = method.invoke(emotionalIntelligence) as AdvancedEmotionalIntelligence.EmotionalTrend
        
        // Assert
        assertEquals(AdvancedEmotionalIntelligence.EmotionalTrend.INTENSIFYING, trend)
    }
    
    @Test
    fun `detect emotional trend correctly identifies improving trend`() {
        // Setup - Set recent emotions to establish trend
        val recentEmotionsField = AdvancedEmotionalIntelligence::class.java.getDeclaredField("recentEmotions")
        recentEmotionsField.isAccessible = true
        val emotions = mutableListOf(
            AdvancedEmotionalIntelligence.EmotionalState.Sadness(0.7f),
            AdvancedEmotionalIntelligence.EmotionalState.Neutral(),
            AdvancedEmotionalIntelligence.EmotionalState.Joy(0.5f)
        )
        recentEmotionsField.set(emotionalIntelligence, emotions)
        
        // Access private method
        val method = AdvancedEmotionalIntelligence::class.java.getDeclaredMethod("detectEmotionalTrend")
        method.isAccessible = true
        
        // Act
        val trend = method.invoke(emotionalIntelligence) as AdvancedEmotionalIntelligence.EmotionalTrend
        
        // Assert
        assertEquals(AdvancedEmotionalIntelligence.EmotionalTrend.IMPROVING, trend)
    }
}

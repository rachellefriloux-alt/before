package com.sallie.core.interaction

import com.sallie.core.integration.RelationshipTrackingSystem
import com.sallie.core.integration.UserAdaptationEngine
import com.sallie.core.values.ValuesSystem
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.runBlocking
import org.junit.Before
import org.junit.Test
import org.mockito.Mockito.*
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class TrustBuildingInteractionPatternsTest {

    private lateinit var trustBuildingPatterns: TrustBuildingInteractionPatterns
    private lateinit var mockRelationshipSystem: RelationshipTrackingSystem
    private lateinit var mockAdaptationEngine: UserAdaptationEngine
    private lateinit var mockValuesSystem: ValuesSystem
    
    @Before
    fun setup() {
        mockRelationshipSystem = mock()
        mockAdaptationEngine = mock()
        mockValuesSystem = mock()
        
        // Setup default mocked responses
        whenever(mockRelationshipSystem.getTrustMetrics()).thenReturn(mapOf("trust_score" to 0.5f))
        whenever(mockAdaptationEngine.getUserProfile()).thenReturn(
            UserAdaptationEngine.UserProfile(
                name = "Test User",
                communicationStyle = UserAdaptationEngine.CommunicationStyle.BALANCED,
                interactionPreferences = mapOf("formality" to 0.5f),
                topicPreferences = listOf("technology", "health"),
                valueAlignment = mapOf("loyalty" to 0.9f, "helpfulness" to 0.8f)
            )
        )
        whenever(mockValuesSystem.getRelevantValues(any())).thenReturn(listOf("loyalty", "helpfulness"))
        whenever(mockValuesSystem.getUserCoreValues()).thenReturn(listOf("loyalty", "helpfulness"))
        whenever(mockRelationshipSystem.getRecentInteractions(any())).thenReturn(
            listOf(
                RelationshipTrackingSystem.Interaction(
                    type = "conversation",
                    context = "technology",
                    outcome = true
                )
            )
        )
        
        trustBuildingPatterns = TrustBuildingInteractionPatterns(
            mockRelationshipSystem,
            mockAdaptationEngine,
            mockValuesSystem
        )
        
        trustBuildingPatterns.initialize()
    }
    
    @Test
    fun `initialize sets trust level based on relationship metrics`() {
        // Setup
        whenever(mockRelationshipSystem.getTrustMetrics()).thenReturn(mapOf("trust_score" to 0.8f))
        
        // Act
        trustBuildingPatterns = TrustBuildingInteractionPatterns(
            mockRelationshipSystem,
            mockAdaptationEngine,
            mockValuesSystem
        )
        trustBuildingPatterns.initialize()
        
        // Assert
        runBlocking {
            val trustLevel = trustBuildingPatterns.observeTrustLevel().value
            assertEquals(TrustBuildingInteractionPatterns.TrustLevel.ESTABLISHED, trustLevel)
        }
    }
    
    @Test
    fun `getRecommendedInteractionPattern returns high transparency pattern for sensitive topics`() {
        // Setup
        val sensitiveContext = TrustBuildingInteractionPatterns.InteractionContext(
            topic = "personal health",
            sensitivity = TrustBuildingInteractionPatterns.Sensitivity.HIGH
        )
        
        // Act
        val pattern = trustBuildingPatterns.getRecommendedInteractionPattern(sensitiveContext)
        
        // Assert
        assertEquals(TrustBuildingInteractionPatterns.TransparencyLevel.HIGH, pattern.transparencyLevel)
        assertTrue(pattern.consistencyEmphasis)
        assertEquals(TrustBuildingInteractionPatterns.ValueAlignmentStrategy.EXPLICIT, pattern.valueAlignmentStrategy)
    }
    
    @Test
    fun `getRecommendedInteractionPattern personalizes based on user communication style`() {
        // Setup
        whenever(mockAdaptationEngine.getUserProfile()).thenReturn(
            UserAdaptationEngine.UserProfile(
                name = "Direct User",
                communicationStyle = UserAdaptationEngine.CommunicationStyle.DIRECT,
                interactionPreferences = mapOf("formality" to 0.2f),
                topicPreferences = listOf("technology"),
                valueAlignment = mapOf("loyalty" to 0.9f)
            )
        )
        
        val context = TrustBuildingInteractionPatterns.InteractionContext(
            topic = "project planning",
            sensitivity = TrustBuildingInteractionPatterns.Sensitivity.MEDIUM
        )
        
        // Act
        trustBuildingPatterns.initialize() // Re-initialize with new profile
        val pattern = trustBuildingPatterns.getRecommendedInteractionPattern(context)
        
        // Assert
        assertEquals(TrustBuildingInteractionPatterns.TransparencyLevel.HIGH, pattern.transparencyLevel)
        assertEquals(TrustBuildingInteractionPatterns.PersonalTouchLevel.LOW, pattern.personalTouchLevel)
    }
    
    @Test
    fun `applyTrustBuildingPattern enhances transparency for high transparency level`() {
        // Setup
        val message = "Here's the information you requested."
        val pattern = TrustBuildingInteractionPatterns.InteractionPattern(
            transparencyLevel = TrustBuildingInteractionPatterns.TransparencyLevel.HIGH,
            consistencyEmphasis = true,
            valueAlignmentStrategy = TrustBuildingInteractionPatterns.ValueAlignmentStrategy.BALANCED,
            personalTouchLevel = TrustBuildingInteractionPatterns.PersonalTouchLevel.LOW
        )
        
        // Act
        val modifiedMessage = trustBuildingPatterns.applyTrustBuildingPattern(message, pattern)
        
        // Assert
        assertTrue(modifiedMessage.contains("transparency builds trust"))
    }
    
    @Test
    fun `applyTrustBuildingPattern adds value alignment for explicit strategy`() {
        // Setup
        val message = "Here's the information you requested."
        val pattern = TrustBuildingInteractionPatterns.InteractionPattern(
            transparencyLevel = TrustBuildingInteractionPatterns.TransparencyLevel.BALANCED,
            consistencyEmphasis = true,
            valueAlignmentStrategy = TrustBuildingInteractionPatterns.ValueAlignmentStrategy.EXPLICIT,
            personalTouchLevel = TrustBuildingInteractionPatterns.PersonalTouchLevel.LOW
        )
        
        // Act
        val modifiedMessage = trustBuildingPatterns.applyTrustBuildingPattern(message, pattern)
        
        // Assert
        assertTrue(modifiedMessage.contains("aligns with your values"))
    }
    
    @Test
    fun `applyTrustBuildingPattern adds personal touch for high personal touch level`() {
        // Setup
        val message = "Here's the information you requested."
        val pattern = TrustBuildingInteractionPatterns.InteractionPattern(
            transparencyLevel = TrustBuildingInteractionPatterns.TransparencyLevel.BALANCED,
            consistencyEmphasis = true,
            valueAlignmentStrategy = TrustBuildingInteractionPatterns.ValueAlignmentStrategy.BALANCED,
            personalTouchLevel = TrustBuildingInteractionPatterns.PersonalTouchLevel.HIGH
        )
        
        // Act
        val modifiedMessage = trustBuildingPatterns.applyTrustBuildingPattern(message, pattern)
        
        // Assert
        assertTrue(modifiedMessage.contains("I remember we talked about"))
    }
    
    @Test
    fun `recordInteractionOutcome updates relationship system`() {
        // Setup
        val context = TrustBuildingInteractionPatterns.InteractionContext(
            topic = "advice",
            sensitivity = TrustBuildingInteractionPatterns.Sensitivity.MEDIUM
        )
        val pattern = trustBuildingPatterns.getRecommendedInteractionPattern(context)
        val outcome = TrustBuildingInteractionPatterns.InteractionOutcome(
            isPositive = true,
            trustImpact = TrustBuildingInteractionPatterns.TrustImpact.SIGNIFICANT
        )
        
        // Act
        trustBuildingPatterns.recordInteractionOutcome(context, pattern, outcome)
        
        // Assert
        verify(mockRelationshipSystem).recordInteraction(any())
    }
    
    @Test
    fun `recordInteractionOutcome updates trust level for significant positive impact`() {
        // Setup
        val context = TrustBuildingInteractionPatterns.InteractionContext("advice")
        val pattern = trustBuildingPatterns.getRecommendedInteractionPattern(context)
        val outcome = TrustBuildingInteractionPatterns.InteractionOutcome(
            isPositive = true, 
            trustImpact = TrustBuildingInteractionPatterns.TrustImpact.SIGNIFICANT
        )
        
        // Initially set trust level
        val initialTrustLevelFlow = MutableStateFlow(TrustBuildingInteractionPatterns.TrustLevel.BUILDING)
        
        // Use reflection to set the private field
        val field = TrustBuildingInteractionPatterns::class.java.getDeclaredField("trustLevelFlow")
        field.isAccessible = true
        field.set(trustBuildingPatterns, initialTrustLevelFlow)
        
        // Act
        trustBuildingPatterns.recordInteractionOutcome(context, pattern, outcome)
        
        // Assert
        runBlocking {
            val newTrustLevel = trustBuildingPatterns.observeTrustLevel().value
            assertEquals(TrustBuildingInteractionPatterns.TrustLevel.ESTABLISHED, newTrustLevel)
        }
    }
    
    @Test
    fun `getLoyaltyReinforcementPhrases returns personalized phrases`() {
        // Setup - user with name
        whenever(mockAdaptationEngine.getUserProfile()).thenReturn(
            UserAdaptationEngine.UserProfile(
                name = "John",
                communicationStyle = UserAdaptationEngine.CommunicationStyle.WARM,
                interactionPreferences = mapOf(),
                topicPreferences = listOf(),
                valueAlignment = mapOf()
            )
        )
        trustBuildingPatterns.initialize()
        
        // Set a high trust level
        val trustLevelFlow = MutableStateFlow(TrustBuildingInteractionPatterns.TrustLevel.HIGH)
        val field = TrustBuildingInteractionPatterns::class.java.getDeclaredField("trustLevelFlow")
        field.isAccessible = true
        field.set(trustBuildingPatterns, trustLevelFlow)
        
        // Act
        val context = TrustBuildingInteractionPatterns.InteractionContext(
            topic = "general",
            sensitivity = TrustBuildingInteractionPatterns.Sensitivity.LOW
        )
        val phrases = trustBuildingPatterns.getLoyaltyReinforcementPhrases(context)
        
        // Assert
        assertTrue(phrases.isNotEmpty())
        // At least one phrase should contain user's name or be from the high trust list
        assertTrue(phrases.any { it.contains("I'm here for you") || it.contains("John") })
    }
}

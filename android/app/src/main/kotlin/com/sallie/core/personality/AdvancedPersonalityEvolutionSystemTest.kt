package com.sallie.core.personality

import com.sallie.core.memory.HierarchicalMemorySystem
import com.sallie.core.integration.UserProfileLearningSystem
import com.sallie.core.integration.RelationshipTrackingSystem
import com.sallie.core.values.ProLifeValuesSystem
import com.sallie.core.values.ValueConflictResolutionFramework
import org.junit.Before
import org.junit.Test
import org.mockito.Mockito.*
import org.mockito.Mock
import org.mockito.MockitoAnnotations
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue
import kotlin.test.assertNotNull

/**
 * Unit tests for AdvancedPersonalityEvolutionSystem
 */
class AdvancedPersonalityEvolutionSystemTest {

    @Mock
    private lateinit var memorySystem: HierarchicalMemorySystem
    
    @Mock
    private lateinit var userProfileSystem: UserProfileLearningSystem
    
    @Mock
    private lateinit var relationshipSystem: RelationshipTrackingSystem
    
    @Mock
    private lateinit var valuesSystem: ProLifeValuesSystem
    
    @Mock
    private lateinit var valueConflictResolver: ValueConflictResolutionFramework
    
    private lateinit var evolutionSystem: AdvancedPersonalityEvolutionSystem
    
    @Before
    fun setup() {
        MockitoAnnotations.initMocks(this)
        
        // Set up mocks
        `when`(valuesSystem.getCoreValues()).thenReturn(
            listOf("loyalty", "pro-life", "family")
        )
        
        `when`(valuesSystem.isProtectedValue(anyString())).thenAnswer { invocation ->
            val value = invocation.getArgument<String>(0)
            value == "loyalty" || value == "pro-life"
        }
        
        `when`(relationshipSystem.getRelationshipDynamics()).thenReturn(
            RelationshipDynamics(closeness = 0.8, trust = 0.9, history = 0.7)
        )
        
        // Initialize the evolution system
        evolutionSystem = AdvancedPersonalityEvolutionSystem(
            memorySystem = memorySystem,
            userProfileSystem = userProfileSystem,
            relationshipSystem = relationshipSystem,
            valuesSystem = valuesSystem,
            valueConflictResolver = valueConflictResolver
        )
    }
    
    @Test
    fun `initialization should set core personality traits`() {
        // When - system is initialized in setup
        
        // Then
        val corePersonality = evolutionSystem.corePersonality.value
        
        // Verify core traits
        assertEquals(0.9, corePersonality.traits["warmth"])
        assertEquals(0.8, corePersonality.traits["playfulness"])
        assertEquals(1.0, corePersonality.traits["loyalty"])
        
        // Verify interaction styles
        assertEquals(0.85, corePersonality.interactionStyles["affectionate"])
        assertEquals(0.9, corePersonality.interactionStyles["supportive"])
        
        // Verify current personality matches core at initialization
        val currentPersonality = evolutionSystem.currentPersonality.value
        assertEquals(corePersonality.traits["warmth"], currentPersonality.traits["warmth"])
    }
    
    @Test
    fun `process interaction should record in memory`() {
        // Given
        val interaction = UserInteraction(
            content = "I love you and will always be here for you, sweetheart",
            context = InteractionContext(
                type = "EMOTIONAL_SUPPORT",
                userMood = "SAD",
                relevantValues = listOf("loyalty")
            ),
            emotionalContent = EmotionalContent(
                emotionType = "compassion",
                intensity = 0.8
            ),
            userResponse = UserResponse(UserResponseType.POSITIVE)
        )
        
        // When
        evolutionSystem.processInteraction(interaction)
        
        // Then
        // Verify memory recording
        verify(memorySystem).storeInEpisodic(
            anyString(),
            anyString(),
            anyDouble(),
            anyMap()
        )
        
        verify(memorySystem).storeInEmotional(
            anyString(),
            eq("compassion"),
            eq(0.8),
            anyString()
        )
    }
    
    @Test
    fun `get personality expression should adapt to context`() {
        // Given
        val context = InteractionContext(
            type = "EMOTIONAL_SUPPORT",
            userMood = "SAD",
            relevantValues = listOf("loyalty")
        )
        
        // When
        val expression = evolutionSystem.getPersonalityExpression(context)
        
        // Then
        // Warmth should be higher in emotional support context
        val baseWarmth = evolutionSystem.currentPersonality.value.traits["warmth"] ?: 0.0
        val expressionWarmth = expression.traits["warmth"] ?: 0.0
        
        assertTrue(expressionWarmth > baseWarmth)
        
        // Sassiness should be lower in emotional support context
        val baseSassiness = evolutionSystem.currentPersonality.value.traits["sassiness"] ?: 0.0
        val expressionSassiness = expression.traits["sassiness"] ?: 0.0
        
        assertTrue(expressionSassiness <= baseSassiness)
        
        // Should include appropriate endearments
        assertTrue(expression.suggestedEndearments.isNotEmpty())
        
        // Should include behavior notes
        assertTrue(expression.behaviorNotes.isNotEmpty())
        assertTrue(expression.behaviorNotes.any { it.contains("feelings") })
    }
    
    @Test
    fun `update core trait should enforce protected values`() {
        // Try to update loyalty (protected)
        val loyaltyResult = evolutionSystem.updateCoreTrait(
            trait = "loyalty",
            newValue = 0.5,
            reason = "Testing loyalty protection"
        )
        
        // Should not allow update
        assertFalse(loyaltyResult)
        
        // Verify loyalty remains unchanged
        assertEquals(1.0, evolutionSystem.corePersonality.value.traits["loyalty"])
        
        // Try to update playfulness (not protected)
        val playfulnessResult = evolutionSystem.updateCoreTrait(
            trait = "playfulness",
            newValue = 0.9,
            reason = "Increasing playfulness"
        )
        
        // Should allow update
        assertTrue(playfulnessResult)
        
        // Verify playfulness was updated
        assertEquals(0.9, evolutionSystem.corePersonality.value.traits["playfulness"])
    }
    
    @Test
    fun `analyze potential conflicts should identify trait tensions`() {
        // When
        val analysis = evolutionSystem.analyzePotentialConflicts()
        
        // Then
        assertNotNull(analysis)
        
        // Should identify at least one tension or conflict
        assertTrue(analysis.conflicts.isNotEmpty() || analysis.tensions.isNotEmpty())
        
        // Should provide harmonizing suggestions
        assertTrue(analysis.harmonizingSuggestions.isNotEmpty())
    }
    
    @Test
    fun `reset adaptive aspects should revert to core personality`() {
        // Given
        val aspectsToReset = listOf("playfulness", "sassiness")
        
        // When
        evolutionSystem.resetAdaptiveAspects(aspectsToReset)
        
        // Then
        val adaptivePersonality = evolutionSystem.adaptivePersonality.value
        
        // Aspects should be removed from adaptive personality
        assertFalse(adaptivePersonality.traits.containsKey("playfulness"))
        assertFalse(adaptivePersonality.traits.containsKey("sassiness"))
        
        // Core traits should remain in current personality
        val currentPersonality = evolutionSystem.currentPersonality.value
        assertEquals(evolutionSystem.corePersonality.value.traits["playfulness"], 
                    currentPersonality.traits["playfulness"])
    }
    
    @Test
    fun `get evolution timeline should return recent evolution events`() {
        // Evolution history should have at least initialization event
        val timeline = evolutionSystem.getEvolutionTimeline()
        
        assertTrue(timeline.isNotEmpty())
        assertEquals(EvolutionType.INITIALIZATION, timeline[0].type)
    }
}

/**
 * Mock class for RelationshipDynamics
 */
data class RelationshipDynamics(
    val closeness: Double,
    val trust: Double,
    val history: Double
)

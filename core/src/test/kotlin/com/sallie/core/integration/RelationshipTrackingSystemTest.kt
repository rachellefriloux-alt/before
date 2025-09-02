package com.sallie.core.integration

import com.sallie.core.memory.EnhancedMemoryManager
import com.sallie.core.memory.MemoryPriority
import com.sallie.core.memory.MemoryQuery
import com.sallie.core.values.ValidationResult
import com.sallie.core.values.ValuesSystem
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.TestScope
import kotlinx.coroutines.test.advanceTimeBy
import kotlinx.coroutines.test.runTest
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.mockito.kotlin.*
import java.time.Duration
import java.time.Instant

@ExperimentalCoroutinesApi
class RelationshipTrackingSystemTest {

    private lateinit var memoryManager: EnhancedMemoryManager
    private lateinit var valuesSystem: ValuesSystem
    private lateinit var relationshipSystem: RelationshipTrackingSystem
    private val testDispatcher = StandardTestDispatcher()
    private val testScope = TestScope(testDispatcher)
    
    @Before
    fun setup() {
        memoryManager = mock()
        valuesSystem = mock()
        
        // Default behavior for values system: allow all activities
        whenever(valuesSystem.validateActivity(any(), any(), any())).thenReturn(
            ValidationResult(allowed = true)
        )
        
        // Setup for memory manager
        whenever(memoryManager.searchMemories(any())).thenReturn(emptyList())
        
        relationshipSystem = RelationshipTrackingSystem(memoryManager, valuesSystem, testScope)
    }
    
    @Test
    fun `test recording interaction`() {
        // Arrange
        val type = InteractionType.CONVERSATION
        val details = "Discussed favorite movies"
        val sentiment = 0.8f
        val importance = InteractionImportance.NORMAL
        
        // Act
        relationshipSystem.recordInteraction(type, details, sentiment, importance)
        
        // Assert
        // Verify memory was stored
        verify(memoryManager).storeMemory(
            type = eq("RELATIONSHIP_INTERACTION"),
            content = any(),
            tags = argThat { contains("relationship") && contains("conversation") },
            priority = eq(MemoryPriority.MEDIUM),
            metadata = argThat { 
                containsKey("type") && containsKey("details") && 
                containsKey("sentiment") && containsKey("importance") 
            }
        )
        
        // Verify relationship metrics changed
        assertTrue(relationshipSystem.relationshipState.value.rapport > 0.5f)
    }
    
    @Test
    fun `test recording milestone`() {
        // Arrange
        val category = MilestoneCategory.TRUST
        val description = "First time user shared personal information"
        val impact = 0.7f
        
        // Act
        relationshipSystem.recordMilestone(category, description, impact)
        
        // Assert
        // Verify memory was stored
        verify(memoryManager).storeMemory(
            type = eq("RELATIONSHIP_MILESTONE"),
            content = any(),
            tags = argThat { contains("relationship") && contains("milestone") && contains("trust") },
            priority = eq(MemoryPriority.HIGH),
            metadata = argThat { 
                containsKey("category") && containsKey("description") && containsKey("impact")
            }
        )
        
        // Verify relationship metrics changed
        val state = relationshipSystem.relationshipState.value
        assertTrue("Trust should increase", state.trust > 0.5f)
        assertTrue("Loyalty should increase", state.loyalty > 0.7f)
    }
    
    @Test
    fun `test recording challenge`() {
        // Arrange
        val type = ChallengeType.COMMUNICATION
        val description = "Miscommunication about task requirements"
        val severity = 0.6f
        
        // Act
        relationshipSystem.recordChallenge(type, description, severity)
        
        // Assert
        // Verify memory was stored
        verify(memoryManager).storeMemory(
            type = eq("RELATIONSHIP_CHALLENGE"),
            content = any(),
            tags = argThat { contains("relationship") && contains("challenge") },
            priority = eq(MemoryPriority.MEDIUM),
            metadata = argThat { 
                containsKey("type") && containsKey("description") && 
                containsKey("severity") && containsKey("resolution")
            }
        )
        
        // Verify relationship metrics changed (negatively)
        val state = relationshipSystem.relationshipState.value
        assertTrue("Understanding should decrease", state.understanding < 0.5f)
        assertTrue("Rapport should decrease", state.rapport < 0.5f)
    }
    
    @Test
    fun `test resolving challenge`() = runTest {
        // Arrange
        val challengeId = "test-challenge-123"
        val resolution = "Clarified expectations and created a detailed plan"
        val successLevel = 0.9f
        
        // Setup memory manager to find the challenge
        val testMemory = createTestMemory(
            type = "RELATIONSHIP_CHALLENGE",
            metadata = mapOf(
                "id" to challengeId,
                "type" to ChallengeType.COMMUNICATION.name,
                "severity" to "0.6"
            )
        )
        
        whenever(memoryManager.searchMemories(argThat { 
            metadata?.get("id") == challengeId 
        })).thenReturn(listOf(testMemory))
        
        // Record a communication challenge first to set metrics
        relationshipSystem.recordChallenge(
            ChallengeType.COMMUNICATION,
            "Miscommunication about task requirements",
            0.6f
        )
        
        // Get state after challenge
        val stateAfterChallenge = relationshipSystem.relationshipState.value
        
        // Act
        relationshipSystem.resolveChallenge(challengeId, resolution, successLevel)
        
        // Assert
        // Verify memory was updated
        verify(memoryManager, times(2)).storeMemory(
            type = eq("RELATIONSHIP_CHALLENGE"),
            content = any(),
            tags = argThat { contains("relationship") && contains("challenge") && contains("resolved") },
            priority = any(),
            metadata = argThat { 
                containsKey("resolution") && containsKey("successLevel") && containsKey("resolutionTimestamp")
            }
        )
        
        // Verify relationship metrics improved
        val stateAfterResolution = relationshipSystem.relationshipState.value
        assertTrue("Understanding should increase after resolution", 
                stateAfterResolution.understanding > stateAfterChallenge.understanding)
        assertTrue("Rapport should increase after resolution", 
                stateAfterResolution.rapport > stateAfterChallenge.rapport)
    }
    
    @Test
    fun `test getting relationship duration`() {
        // Act
        val duration = relationshipSystem.getRelationshipDuration()
        
        // Assert
        assertNotNull(duration)
        assertTrue(duration.isZero || duration.toMillis() > 0)
    }
    
    @Test
    fun `test time since last interaction`() {
        // Act
        val timeSince = relationshipSystem.getTimeSinceLastInteraction()
        
        // Assert
        assertNotNull(timeSince)
        assertTrue(timeSince.isZero || timeSince.toMillis() > 0)
    }
    
    @Test
    fun `test getting overall relationship score`() {
        // Arrange - start with default state
        
        // Act
        val initialScore = relationshipSystem.getOverallRelationshipScore()
        
        // Record positive interactions to increase score
        relationshipSystem.recordInteraction(
            InteractionType.EMOTIONAL_SUPPORT, 
            "Provided support during difficult time",
            0.9f,
            InteractionImportance.HIGH
        )
        
        relationshipSystem.recordInteraction(
            InteractionType.TASK_COMPLETION,
            "Completed important task successfully",
            0.8f,
            InteractionImportance.HIGH
        )
        
        // Get new score
        val improvedScore = relationshipSystem.getOverallRelationshipScore()
        
        // Assert
        assertTrue("Score should be between 0 and 1", initialScore in 0.0f..1.0f)
        assertTrue("Score should improve after positive interactions", improvedScore > initialScore)
    }
    
    @Test
    fun `test generating relationship insight`() {
        // Arrange - create some relationship history
        relationshipSystem.recordInteraction(
            InteractionType.CONVERSATION,
            "Casual conversation about hobbies",
            0.7f
        )
        
        relationshipSystem.recordInteraction(
            InteractionType.TASK_COMPLETION,
            "Helped with project",
            0.8f
        )
        
        relationshipSystem.recordMilestone(
            MilestoneCategory.TRUST,
            "Shared important information",
            0.6f
        )
        
        // Act
        val insight = relationshipSystem.generateRelationshipInsight()
        
        // Assert
        assertNotNull(insight)
        assertNotNull(insight.stage)
        assertNotNull(insight.overallHealth)
        assertTrue(insight.strengths.isNotEmpty() || insight.improvementAreas.isNotEmpty())
        assertTrue(insight.enhancementStrategies.isNotEmpty())
    }
    
    @Test
    fun `test getting recent significant interactions`() {
        // Arrange
        val memories = listOf(
            createTestMemory("RELATIONSHIP_MILESTONE", mapOf("sentiment" to "0.8")),
            createTestMemory("RELATIONSHIP_CHALLENGE", mapOf("sentiment" to "-0.5")),
            createTestMemory("RELATIONSHIP_INTERACTION", mapOf("sentiment" to "0.7"))
        )
        
        whenever(memoryManager.searchMemories(argThat { 
            tags?.contains("relationship") == true 
        })).thenReturn(memories)
        
        // Act
        val interactions = relationshipSystem.getRecentSignificantInteractions(3)
        
        // Assert
        assertEquals(3, interactions.size)
    }
    
    @Test
    fun `test saving relationship state`() {
        // Act
        relationshipSystem.saveRelationshipState()
        
        // Assert
        verify(memoryManager).storeMemory(
            type = eq("RELATIONSHIP_STATE_SNAPSHOT"),
            content = any(),
            tags = argThat { contains("relationship") && contains("snapshot") },
            priority = eq(MemoryPriority.HIGH)
        )
    }
    
    @Test
    fun `test loading existing relationship state`() {
        // Arrange
        // Create a serialized relationship state in a memory
        val existingState = RelationshipState(
            trust = 0.8f,
            rapport = 0.7f,
            understanding = 0.6f,
            loyalty = 0.9f,
            satisfaction = 0.7f
        )
        val serializedState = kotlinx.serialization.json.Json.encodeToString(RelationshipState.serializer(), existingState)
        
        val stateMemory = createTestMemory("RELATIONSHIP_STATE_SNAPSHOT", emptyMap(), serializedState)
        
        // Setup memory manager to return this state
        whenever(memoryManager.searchMemories(argThat { 
            type == "RELATIONSHIP_STATE_SNAPSHOT" 
        })).thenReturn(listOf(stateMemory))
        
        // Act - create a new relationship system that will load the existing state
        val newRelationshipSystem = RelationshipTrackingSystem(memoryManager, valuesSystem, testScope)
        
        // Assert
        val loadedState = newRelationshipSystem.relationshipState.value
        assertEquals(0.8f, loadedState.trust)
        assertEquals(0.7f, loadedState.rapport)
        assertEquals(0.6f, loadedState.understanding)
        assertEquals(0.9f, loadedState.loyalty)
        assertEquals(0.7f, loadedState.satisfaction)
    }
    
    @Test
    fun `test relationship metrics decay over time`() = runTest {
        // Arrange - record some positive interactions to establish metrics
        relationshipSystem.recordInteraction(
            InteractionType.EMOTIONAL_SUPPORT,
            "Provided emotional support",
            0.9f,
            InteractionImportance.HIGH
        )
        
        val initialState = relationshipSystem.relationshipState.value
        
        // Act - advance time by 5 days (should trigger decay)
        advanceTimeBy(5 * 24 * 60 * 60 * 1000L) // 5 days in milliseconds
        
        // Trigger analysis (which would normally happen periodically)
        val analysisMethod = relationshipSystem.javaClass.getDeclaredMethod("analyzeRelationship")
        analysisMethod.isAccessible = true
        analysisMethod.invoke(relationshipSystem)
        
        // Get updated state
        val decayedState = relationshipSystem.relationshipState.value
        
        // Assert
        assertTrue("Trust should decay over time", decayedState.trust < initialState.trust)
        assertTrue("Rapport should decay over time", decayedState.rapport < initialState.rapport)
        assertTrue("Loyalty should decay slower than other metrics",
            (initialState.loyalty - decayedState.loyalty) < (initialState.trust - decayedState.trust))
    }
    
    @Test
    fun `test values system integration`() {
        // Arrange
        val category = MilestoneCategory.VALUE_ALIGNMENT
        val description = "Shared important value"
        
        // Setup values system to block this activity
        whenever(valuesSystem.validateActivity(
            eq("relationship_milestone"),
            eq(category.name),
            any()
        )).thenReturn(ValidationResult(allowed = false))
        
        // Act
        relationshipSystem.recordMilestone(category, description, 0.7f)
        
        // Assert
        // Verify memory was NOT stored
        verify(memoryManager, never()).storeMemory(
            type = eq("RELATIONSHIP_MILESTONE"),
            content = any(),
            tags = any(),
            priority = any(),
            metadata = any()
        )
        
        // Verify relationship state didn't change
        assertEquals(0.7f, relationshipSystem.relationshipState.value.loyalty)
    }
    
    @Test
    fun `test periodic relationship analysis`() = runTest {
        // Arrange - record various interactions
        relationshipSystem.recordInteraction(
            InteractionType.CONVERSATION, "Friendly chat", 0.7f
        )
        
        relationshipSystem.recordInteraction(
            InteractionType.TASK_COMPLETION, "Completed task", 0.8f
        )
        
        relationshipSystem.recordChallenge(
            ChallengeType.COMMUNICATION, "Small misunderstanding", 0.4f
        )
        
        // Setup memories for analysis
        val memories = listOf(
            createTestMemory("RELATIONSHIP_INTERACTION", mapOf(
                "type" to InteractionType.CONVERSATION.name,
                "sentiment" to "0.7"
            )),
            createTestMemory("RELATIONSHIP_INTERACTION", mapOf(
                "type" to InteractionType.TASK_COMPLETION.name,
                "sentiment" to "0.8"
            )),
            createTestMemory("RELATIONSHIP_CHALLENGE", mapOf(
                "type" to ChallengeType.COMMUNICATION.name,
                "severity" to "0.4"
            ))
        )
        
        whenever(memoryManager.searchMemories(argThat { 
            type == "RELATIONSHIP_INTERACTION" 
        })).thenReturn(memories)
        
        val stateBeforeAnalysis = relationshipSystem.relationshipState.value
        
        // Act - trigger periodic analysis
        advanceTimeBy(3700000) // Just over 1 hour
        
        // Assert
        verify(memoryManager).storeMemory(
            type = eq("RELATIONSHIP_STATE_SNAPSHOT"),
            content = any(),
            tags = any(),
            priority = any()
        )
    }
    
    /**
     * Helper method to create test memories
     */
    private fun createTestMemory(
        type: String, 
        metadata: Map<String, String>,
        content: String = "Test content"
    ): com.sallie.core.memory.Memory {
        return object : com.sallie.core.memory.Memory {
            override val id = "test-${System.currentTimeMillis()}-${Math.random()}"
            override val type = type
            override val content = content
            override val timestamp = System.currentTimeMillis()
            override val tags = listOf("relationship", type.lowercase())
            override val priority = MemoryPriority.MEDIUM
            override val metadata = metadata
        }
    }
}

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

@ExperimentalCoroutinesApi
class UserProfileLearningSystemTest {

    private lateinit var memoryManager: EnhancedMemoryManager
    private lateinit var valuesSystem: ValuesSystem
    private lateinit var profileSystem: UserProfileLearningSystem
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
        
        profileSystem = UserProfileLearningSystem(memoryManager, valuesSystem, testScope)
    }
    
    @Test
    fun `test recording user preference`() {
        // Arrange
        val category = "music"
        val preference = "rock"
        val strength = 0.8f
        
        // Act
        profileSystem.recordPreference(category, preference, strength)
        
        // Assert
        // Verify memory was stored
        verify(memoryManager).storeMemory(
            type = eq("USER_PREFERENCE"),
            content = any(),
            tags = argThat { contains("user_profile") && contains("preference") && contains(category) },
            priority = eq(MemoryPriority.MEDIUM),
            metadata = argThat { containsKey("category") && containsKey("preference") && containsKey("strength") }
        )
        
        // Verify preference was added to profile
        val userPreferences = profileSystem.getUserPreference(category)
        assertEquals(strength, userPreferences[preference])
    }
    
    @Test
    fun `test recording behavior pattern`() {
        // Arrange
        val patternType = "work"
        val description = "prefers to work in the morning"
        val frequency = PatternFrequency.FREQUENT
        
        // Act
        profileSystem.recordBehaviorPattern(patternType, description, frequency)
        
        // Assert
        // Verify memory was stored
        verify(memoryManager).storeMemory(
            type = eq("USER_BEHAVIOR"),
            content = any(),
            tags = argThat { contains("user_profile") && contains("behavior") },
            priority = eq(MemoryPriority.MEDIUM),
            metadata = argThat { containsKey("patternType") && containsKey("description") && containsKey("frequency") }
        )
        
        // Verify behavior pattern was added to profile
        val behaviorPatterns = profileSystem.getBehaviorPatterns()
        assertTrue(behaviorPatterns.containsKey(patternType))
        val pattern = behaviorPatterns[patternType]?.find { it.description == description }
        assertNotNull(pattern)
        assertEquals(frequency, pattern?.frequency)
    }
    
    @Test
    fun `test recording communication style`() {
        // Arrange
        val aspect = "feedback"
        val style = "prefers direct feedback"
        
        // Act
        profileSystem.recordCommunicationStyle(aspect, style)
        
        // Assert
        // Verify memory was stored
        verify(memoryManager).storeMemory(
            type = eq("USER_COMMUNICATION"),
            content = any(),
            tags = argThat { contains("user_profile") && contains("communication") },
            priority = eq(MemoryPriority.MEDIUM),
            metadata = argThat { containsKey("aspect") && containsKey("style") }
        )
        
        // Verify communication style was added to profile
        val communicationStyles = profileSystem.getCommunicationStyles()
        assertEquals(style, communicationStyles[aspect])
    }
    
    @Test
    fun `test recording relationship dynamic`() {
        // Arrange
        val dynamic = "trust"
        val observation = "responds well to consistency"
        val impact = RelationshipImpact.POSITIVE
        
        // Act
        profileSystem.recordRelationshipDynamic(dynamic, observation, impact)
        
        // Assert
        // Verify memory was stored
        verify(memoryManager).storeMemory(
            type = eq("USER_RELATIONSHIP"),
            content = any(),
            tags = argThat { contains("user_profile") && contains("relationship") },
            priority = eq(MemoryPriority.HIGH),
            metadata = argThat { containsKey("dynamic") && containsKey("observation") && containsKey("impact") }
        )
        
        // Verify relationship dynamic was added to profile
        val relationshipDynamics = profileSystem.getRelationshipDynamics()
        assertTrue(relationshipDynamics.containsKey(dynamic))
        val dynamicObs = relationshipDynamics[dynamic]?.find { it.observation == observation }
        assertNotNull(dynamicObs)
        assertEquals(impact, dynamicObs?.impact)
    }
    
    @Test
    fun `test recording emotional response`() {
        // Arrange
        val trigger = "unexpected changes"
        val emotion = "anxiety"
        val intensity = 0.7f
        
        // Act
        profileSystem.recordEmotionalResponse(trigger, emotion, intensity)
        
        // Assert
        // Verify memory was stored
        verify(memoryManager).storeMemory(
            type = eq("USER_EMOTION"),
            content = any(),
            tags = argThat { contains("user_profile") && contains("emotion") },
            priority = eq(MemoryPriority.MEDIUM),
            metadata = argThat { 
                containsKey("trigger") && containsKey("emotion") && containsKey("intensity") 
            }
        )
        
        // Verify emotional response was added to profile
        val emotionalResponses = profileSystem.getEmotionalResponses()
        assertTrue(emotionalResponses.containsKey(trigger))
        assertEquals(intensity, emotionalResponses[trigger]?.get(emotion))
    }
    
    @Test
    fun `test values system integration - blocked activity`() {
        // Arrange
        val category = "sensitive"
        val preference = "political"
        
        // Setup values system to block this activity
        whenever(valuesSystem.validateActivity(
            eq("profile_learning"),
            eq("preference_tracking"),
            any()
        )).thenReturn(ValidationResult(allowed = false))
        
        // Act
        profileSystem.recordPreference(category, preference)
        
        // Assert
        // Verify memory was NOT stored
        verify(memoryManager, never()).storeMemory(
            type = any(),
            content = any(),
            tags = any(),
            priority = any(),
            metadata = any()
        )
        
        // Verify preference was NOT added to profile
        val userPreferences = profileSystem.getUserPreference(category)
        assertFalse(userPreferences.containsKey(preference))
    }
    
    @Test
    fun `test profile summary generation`() {
        // Arrange - add various profile elements
        profileSystem.recordPreference("music", "rock", 0.8f)
        profileSystem.recordPreference("music", "pop", 0.4f)
        profileSystem.recordPreference("food", "italian", 0.9f)
        
        profileSystem.recordBehaviorPattern("work", "prefers morning work", PatternFrequency.VERY_FREQUENT)
        profileSystem.recordBehaviorPattern("communication", "checks messages frequently", PatternFrequency.FREQUENT)
        
        profileSystem.recordCommunicationStyle("feedback", "direct")
        profileSystem.recordCommunicationStyle("instructions", "detailed")
        
        profileSystem.recordRelationshipDynamic("trust", "values consistency", RelationshipImpact.POSITIVE)
        profileSystem.recordRelationshipDynamic("collaboration", "prefers clear roles", RelationshipImpact.POSITIVE)
        
        profileSystem.recordEmotionalResponse("unexpected changes", "anxiety", 0.7f)
        profileSystem.recordEmotionalResponse("accomplishments", "pride", 0.9f)
        
        // Act
        val summary = profileSystem.generateProfileSummary()
        
        // Assert
        assertNotNull(summary)
        assertTrue(summary.keyPreferences.isNotEmpty())
        assertTrue(summary.significantBehaviors.isNotEmpty())
        assertTrue(summary.communicationStyle.isNotEmpty())
        assertTrue(summary.relationshipInsights.isNotEmpty())
        assertTrue(summary.emotionalTriggers.isNotEmpty())
        assertTrue(summary.overallProfileCompleteness > 0)
        assertTrue(summary.suggestedAdaptations.isNotEmpty())
    }
    
    @Test
    fun `test profile consolidation`() = runTest {
        // Arrange
        val memories = listOf(
            createTestMemory("USER_PREFERENCE", mapOf("category" to "music", "preference" to "rock", "strength" to "0.7")),
            createTestMemory("USER_PREFERENCE", mapOf("category" to "music", "preference" to "rock", "strength" to "0.8")),
            createTestMemory("USER_PREFERENCE", mapOf("category" to "music", "preference" to "rock", "strength" to "0.9")),
            
            createTestMemory("USER_BEHAVIOR", mapOf("patternType" to "work", "description" to "morning focus", "frequency" to "FREQUENT")),
            createTestMemory("USER_BEHAVIOR", mapOf("patternType" to "work", "description" to "morning focus", "frequency" to "VERY_FREQUENT")),
            
            createTestMemory("USER_COMMUNICATION", mapOf("aspect" to "feedback", "style" to "direct")),
            createTestMemory("USER_COMMUNICATION", mapOf("aspect" to "feedback", "style" to "direct")),
            createTestMemory("USER_COMMUNICATION", mapOf("aspect" to "feedback", "style" to "indirect")),
            
            createTestMemory("USER_RELATIONSHIP", mapOf("dynamic" to "trust", "observation" to "values honesty", "impact" to "POSITIVE")),
            createTestMemory("USER_RELATIONSHIP", mapOf("dynamic" to "trust", "observation" to "values honesty", "impact" to "POSITIVE")),
            
            createTestMemory("USER_EMOTION", mapOf("trigger" to "criticism", "emotion" to "defensive", "intensity" to "0.6")),
            createTestMemory("USER_EMOTION", mapOf("trigger" to "criticism", "emotion" to "defensive", "intensity" to "0.7"))
        )
        
        // Setup memory manager to return these memories
        whenever(memoryManager.searchMemories(argThat { tags?.contains("user_profile") == true })).thenReturn(memories)
        
        // Record initial data to setup profile
        profileSystem.recordPreference("music", "rock", 0.5f)
        profileSystem.recordBehaviorPattern("work", "morning focus", PatternFrequency.OCCASIONAL)
        profileSystem.recordCommunicationStyle("feedback", "mixed")
        profileSystem.recordRelationshipDynamic("trust", "values honesty", RelationshipImpact.NEUTRAL)
        profileSystem.recordEmotionalResponse("criticism", "defensive", 0.5f)
        
        // Trigger consolidation
        advanceTimeBy(3700000) // Just over 1 hour
        
        // Assert
        // Verify profile was updated with consolidated values
        val musicPreferences = profileSystem.getUserPreference("music")
        val rockPreference = musicPreferences["rock"]
        assertTrue("Consolidated rock preference should be close to 0.8", rockPreference!! > 0.75f && rockPreference < 0.85f)
        
        val workPatterns = profileSystem.getBehaviorPatterns()["work"]
        val morningPattern = workPatterns?.find { it.description == "morning focus" }
        assertEquals(PatternFrequency.VERY_FREQUENT, morningPattern?.frequency)
        
        val feedbackStyle = profileSystem.getCommunicationStyles()["feedback"]
        assertEquals("direct", feedbackStyle)
        
        val trustDynamic = profileSystem.getRelationshipDynamics()["trust"]
        val honestyObservation = trustDynamic?.find { it.observation == "values honesty" }
        assertEquals(RelationshipImpact.POSITIVE, honestyObservation?.impact)
        
        val criticismResponse = profileSystem.getEmotionalResponses()["criticism"]?.get("defensive")
        assertTrue("Consolidated emotional intensity should be close to 0.65", 
            criticismResponse!! > 0.6f && criticismResponse < 0.7f)
        
        // Verify profile was saved
        verify(memoryManager).storeMemory(
            type = eq("USER_PROFILE_SNAPSHOT"),
            content = any(),
            tags = argThat { contains("user_profile") && contains("snapshot") },
            priority = eq(MemoryPriority.HIGH)
        )
    }
    
    @Test
    fun `test confidence calculation`() {
        // Arrange - add multiple observations for the same preference
        repeat(5) {
            profileSystem.recordPreference("music", "rock", 0.8f)
        }
        
        // Act
        val confidence = profileSystem.getConfidence("music:rock")
        
        // Assert
        assertTrue(confidence > 0.4f) // Confidence should increase with more observations
    }
    
    @Test
    fun `test loading existing profile`() {
        // Arrange
        // Create a serialized user profile in a memory
        val existingProfile = UserProfile(
            preferences = mapOf("food" to mapOf("italian" to 0.9f)),
            communicationStyles = mapOf("feedback" to "direct")
        )
        val serializedProfile = kotlinx.serialization.json.Json.encodeToString(UserProfile.serializer(), existingProfile)
        
        val profileMemory = createTestMemory("USER_PROFILE_SNAPSHOT", emptyMap(), serializedProfile)
        
        // Setup memory manager to return this memory
        whenever(memoryManager.searchMemories(argThat { type == "USER_PROFILE_SNAPSHOT" })).thenReturn(listOf(profileMemory))
        
        // Act - create a new profile system that will load the existing profile
        val newProfileSystem = UserProfileLearningSystem(memoryManager, valuesSystem, testScope)
        
        // Assert
        val foodPreferences = newProfileSystem.getUserPreference("food")
        assertEquals(0.9f, foodPreferences["italian"])
        
        val communicationStyles = newProfileSystem.getCommunicationStyles()
        assertEquals("direct", communicationStyles["feedback"])
    }
    
    /**
     * Helper method to create test memories
     */
    private fun createTestMemory(
        type: String, 
        metadata: Map<String, String>,
        content: String = "Test content"
    ): Memory {
        return Memory(
            id = "test-${System.currentTimeMillis()}-${Math.random()}",
            type = type,
            content = content,
            timestamp = System.currentTimeMillis(),
            tags = listOf("user_profile", type.lowercase()),
            priority = MemoryPriority.MEDIUM,
            metadata = metadata
        )
    }
}

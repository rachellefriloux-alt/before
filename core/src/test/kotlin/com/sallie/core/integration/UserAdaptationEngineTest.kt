package com.sallie.core.integration

import com.sallie.core.memory.EnhancedMemoryManager
import com.sallie.core.personaEngine.PersonaCharacteristics
import com.sallie.core.values.ValuesSystem
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.TestScope
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.mockito.kotlin.*

class UserAdaptationEngineTest {

    private lateinit var profileLearningSystem: UserProfileLearningSystem
    private lateinit var valuesSystem: ValuesSystem
    private lateinit var memoryManager: EnhancedMemoryManager
    private lateinit var adaptationEngine: UserAdaptationEngine
    private val testDispatcher = StandardTestDispatcher()
    private val testScope = TestScope(testDispatcher)
    
    private val mockUserProfile = MutableStateFlow(
        UserProfile(
            preferences = mapOf(
                "music" to mapOf("rock" to 0.8f, "pop" to 0.4f),
                "food" to mapOf("italian" to 0.9f),
                "communication_style" to mapOf("detailed" to 0.7f, "warm" to 0.8f),
                "topics" to mapOf("technology" to 0.9f, "movies" to 0.7f),
                "sensitive_topics" to mapOf("politics" to 0.8f)
            ),
            behaviorPatterns = mapOf(
                "work" to listOf(
                    BehaviorPattern("prefers morning work", PatternFrequency.VERY_FREQUENT),
                    BehaviorPattern("takes frequent breaks", PatternFrequency.FREQUENT)
                ),
                "communication" to listOf(
                    BehaviorPattern("responds quickly", PatternFrequency.FREQUENT),
                    BehaviorPattern("likes discussions", PatternFrequency.FREQUENT)
                ),
                "information_processing" to listOf(
                    BehaviorPattern("prefers detailed explanations", PatternFrequency.FREQUENT)
                )
            ),
            communicationStyles = mapOf(
                "formality" to "casual",
                "detail" to "detailed",
                "pace" to "fast",
                "tone" to "enthusiastic",
                "feedback" to "direct"
            ),
            relationshipDynamics = mapOf(
                "trust" to listOf(
                    RelationshipObservation("values consistency", RelationshipImpact.POSITIVE)
                ),
                "warmth" to listOf(
                    RelationshipObservation("responds well to friendly tone", RelationshipImpact.POSITIVE)
                ),
                "formality" to listOf(
                    RelationshipObservation("dislikes overly formal communication", RelationshipImpact.NEGATIVE)
                )
            ),
            emotionalResponses = mapOf(
                "unexpected changes" to mapOf("anxiety" to 0.7f),
                "accomplishments" to mapOf("pride" to 0.9f),
                "humor" to mapOf("happiness" to 0.8f, "amusement" to 0.9f),
                "politics" to mapOf("frustration" to 0.8f, "anger" to 0.7f),
                "technology" to mapOf("interest" to 0.9f, "excitement" to 0.8f)
            )
        )
    )
    
    @Before
    fun setup() {
        profileLearningSystem = mock()
        valuesSystem = mock()
        memoryManager = mock()
        
        // Mock profile learning system
        whenever(profileLearningSystem.userProfile).thenReturn(mockUserProfile)
        whenever(profileLearningSystem.getConfidence(any())).thenReturn(0.8f)
        
        // Mock profile summary
        val profileSummary = UserProfileSummary(
            keyPreferences = listOf("music: rock (0.8)", "food: italian (0.9)"),
            significantBehaviors = listOf("work: prefers morning work (VERY_FREQUENT)"),
            communicationStyle = listOf("detail: detailed (0.8)"),
            relationshipInsights = listOf("trust: values consistency (POSITIVE)"),
            emotionalTriggers = listOf("accomplishments → pride (0.9)"),
            overallProfileCompleteness = 0.7f,
            suggestedAdaptations = listOf(
                "Adapt communication to match preference for detailed explanations",
                "Be mindful of strong anxiety response to unexpected changes"
            )
        )
        whenever(profileLearningSystem.generateProfileSummary()).thenReturn(profileSummary)
        
        adaptationEngine = UserAdaptationEngine(profileLearningSystem, valuesSystem, memoryManager)
    }
    
    @Test
    fun `test adaptation level controls`() {
        // Default should be moderate
        assertEquals(AdaptationLevel.MODERATE, adaptationEngine.getAdaptationLevel())
        
        // Set to a new level
        adaptationEngine.setAdaptationLevel(AdaptationLevel.MAXIMUM)
        
        // Verify level was changed
        assertEquals(AdaptationLevel.MAXIMUM, adaptationEngine.getAdaptationLevel())
    }
    
    @Test
    fun `test enabling and disabling adaptation aspects`() {
        // Get current enabled aspects
        val initialAspects = adaptationEngine.getEnabledAdaptationAspects()
        
        // Disable communication aspect
        adaptationEngine.disableAdaptationAspects(setOf(AdaptationAspect.COMMUNICATION))
        
        // Verify it was removed
        val afterDisable = adaptationEngine.getEnabledAdaptationAspects()
        assertFalse(afterDisable.contains(AdaptationAspect.COMMUNICATION))
        
        // Re-enable it
        adaptationEngine.enableAdaptationAspects(setOf(AdaptationAspect.COMMUNICATION))
        
        // Verify it was added back
        val afterEnable = adaptationEngine.getEnabledAdaptationAspects()
        assertTrue(afterEnable.contains(AdaptationAspect.COMMUNICATION))
    }
    
    @Test
    fun `test communication style adaptation`() {
        // Base style
        val baseStyle = CommunicationStyle(
            formality = 0.7f,
            detailLevel = 0.5f,
            tone = 0.5f,
            pacing = 0.5f
        )
        
        // Adapt the style
        val adapted = adaptationEngine.adaptCommunicationStyle(baseStyle)
        
        // Check that adaptation occurred
        assertNotEquals(baseStyle, adapted)
        
        // According to our mock profile:
        // - formality should be lower (casual preference)
        assertTrue(adapted.formality < baseStyle.formality)
        
        // - detail level should be higher (detailed preference)
        assertTrue(adapted.detailLevel > baseStyle.detailLevel)
        
        // - tone should be more enthusiastic
        assertTrue(adapted.tone > baseStyle.tone)
        
        // - pacing should be faster
        assertTrue(adapted.pacing > baseStyle.pacing)
    }
    
    @Test
    fun `test persona characteristics adaptation`() {
        // Base characteristics
        val baseCharacteristics = PersonaCharacteristics(
            warmth = 0.5f,
            humor = 0.5f,
            formality = 0.7f,
            detailOrientation = 0.5f
        )
        
        // Adapt characteristics
        val adapted = adaptationEngine.adaptPersonaCharacteristics(baseCharacteristics)
        
        // Check that adaptation occurred
        assertNotEquals(baseCharacteristics, adapted)
        
        // According to our mock profile:
        // - warmth should be higher (prefers friendly tone)
        assertTrue(adapted.warmth > baseCharacteristics.warmth)
        
        // - humor should be higher (positive response to humor)
        assertTrue(adapted.humor > baseCharacteristics.humor)
        
        // - formality should be lower (dislikes formal communication)
        assertTrue(adapted.formality < baseCharacteristics.formality)
        
        // - detail orientation should be higher (prefers detailed explanations)
        assertTrue(adapted.detailOrientation > baseCharacteristics.detailOrientation)
    }
    
    @Test
    fun `test conversation pacing adaptation`() {
        // Base pacing
        val baseResponseSpeed = 1000L
        val baseThinkingIndicatorFrequency = 0.5f
        
        // Adapt pacing
        val adapted = adaptationEngine.adaptConversationPacing(
            baseResponseSpeed,
            baseThinkingIndicatorFrequency
        )
        
        // Check that adaptation occurred
        assertNotEquals(baseResponseSpeed, adapted.responseSpeed)
        
        // According to our mock profile:
        // - response speed should be faster (prefers fast pace)
        assertTrue(adapted.responseSpeed < baseResponseSpeed)
    }
    
    @Test
    fun `test topic recommendations`() {
        // Get topic recommendations
        val recommendations = adaptationEngine.getTopicRecommendations()
        
        // Check that we got recommendations
        assertTrue(recommendations.isNotEmpty())
        
        // Should include technology and movies from preferences
        val topics = recommendations.map { it.topic }
        assertTrue(topics.contains("technology"))
        assertTrue(topics.contains("movies"))
        
        // Technology should have high confidence
        val techRec = recommendations.find { it.topic == "technology" }
        assertNotNull(techRec)
        assertTrue(techRec!!.confidence > 0.7f)
    }
    
    @Test
    fun `test topics to avoid`() {
        // Get topics to avoid
        val avoidances = adaptationEngine.getTopicsToAvoid()
        
        // Check that we got recommendations
        assertTrue(avoidances.isNotEmpty())
        
        // Should include politics from preferences and emotional responses
        val topics = avoidances.map { it.topic }
        assertTrue(topics.contains("politics"))
        
        // Politics should have high confidence and severity
        val politicsAvoid = avoidances.find { it.topic == "politics" }
        assertNotNull(politicsAvoid)
        assertTrue(politicsAvoid!!.confidence > 0.6f)
        assertEquals(AvoidanceSeverity.HIGH, politicsAvoid.severity)
    }
    
    @Test
    fun `test adaptation recommendations`() {
        // Get adaptation recommendations
        val recommendations = adaptationEngine.generateAdaptationRecommendations()
        
        // Check that we got recommendations
        assertTrue(recommendations.isNotEmpty())
        
        // Should include recommendations about communication style and emotional triggers
        val recTexts = recommendations.map { it.recommendation }
        assertTrue(recTexts.any { it.contains("communication", ignoreCase = true) })
        assertTrue(recTexts.any { it.contains("unexpected changes", ignoreCase = true) })
    }
    
    @Test
    fun `test adaptation feedback recording`() {
        // Record positive feedback
        adaptationEngine.recordAdaptationFeedback(
            adaptationAspect = AdaptationAspect.COMMUNICATION,
            isPositive = true,
            details = "Communication style was perfect"
        )
        
        // Verify memory was stored
        verify(memoryManager).storeMemory(
            type = eq("ADAPTATION_FEEDBACK"),
            content = any(),
            tags = argThat { 
                contains("user_profile") && contains("adaptation") && 
                contains("feedback") && contains("communication") 
            },
            priority = any(),
            metadata = argThat { 
                get("aspect") == "COMMUNICATION" && get("isPositive") == "true"
            }
        )
    }
    
    @Test
    fun `test adaptation is disabled when aspect is disabled`() {
        // Disable communication adaptation
        adaptationEngine.disableAdaptationAspects(setOf(AdaptationAspect.COMMUNICATION))
        
        // Base style
        val baseStyle = CommunicationStyle(
            formality = 0.7f,
            detailLevel = 0.5f,
            tone = 0.5f,
            pacing = 0.5f
        )
        
        // Adapt the style
        val adapted = adaptationEngine.adaptCommunicationStyle(baseStyle)
        
        // Style should be unchanged since adaptation is disabled
        assertEquals(baseStyle, adapted)
    }
    
    @Test
    fun `test context-sensitive topic recommendations`() {
        // Get recommendations with context
        val recommendations = adaptationEngine.getTopicRecommendations("Let's talk about technology")
        
        // Technology should be at the top with high confidence
        assertTrue(recommendations.isNotEmpty())
        assertEquals("technology", recommendations[0].topic)
        assertTrue(recommendations[0].confidence > 0.7f)
    }
}

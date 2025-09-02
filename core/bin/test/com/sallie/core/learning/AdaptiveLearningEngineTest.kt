/*
 * Sallie 2.0 Module
 * Persona: Tough love meets soul care.
 * Function: Tests for the Adaptive Learning Engine.
 * Got it, love.
 */
package com.sallie.core.learning

import com.sallie.core.memory.HierarchicalMemorySystem
import com.sallie.core.memory.FileBasedMemoryStorage
import com.sallie.core.memory.VectorMemoryIndexer
import com.sallie.core.memory.SimpleEmbeddingService
import kotlinx.coroutines.runBlocking
import org.junit.Before
import org.junit.Test
import org.junit.After
import org.junit.Rule
import org.junit.rules.TemporaryFolder
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertTrue
import kotlin.test.assertFalse
import java.io.File

class AdaptiveLearningEngineTest {

    @get:Rule
    val tempFolder = TemporaryFolder()
    
    private lateinit var storageService: FileBasedMemoryStorage
    private lateinit var memoryIndexer: VectorMemoryIndexer
    private lateinit var memorySystem: HierarchicalMemorySystem
    private lateinit var learningEngine: AdaptiveLearningEngine
    
    @Before
    fun setup() {
        val storagePath = tempFolder.newFolder("memory_test").absolutePath
        storageService = FileBasedMemoryStorage(storagePath)
        val embeddingService = SimpleEmbeddingService()
        memoryIndexer = VectorMemoryIndexer(embeddingService)
        memorySystem = HierarchicalMemorySystem(storageService, memoryIndexer)
        
        val config = AdaptiveLearningEngine.LearningConfiguration(
            learningRate = 0.2f, // Higher for testing
            minInteractionsForInsight = 3, // Lower for testing
            insightConfidenceThreshold = 0.6f,
            experimentationRate = 0.1f
        )
        
        learningEngine = AdaptiveLearningEngine(memorySystem, config)
    }
    
    @After
    fun cleanup() {
        // Additional cleanup if needed
    }
    
    @Test
    fun `initial state should be properly initialized`() {
        // Check initial state
        val initialState = learningEngine.learningState.value
        
        assertEquals(0, initialState.totalInteractionsObserved)
        assertEquals(0, initialState.totalInsightsGenerated)
        assertTrue(initialState.activeExperiments.isEmpty())
        
        // Check preference models are empty
        assertTrue(learningEngine.preferenceModels.value.isEmpty())
        
        // Check no insights initially
        val insights = learningEngine.getInsights()
        assertTrue(insights.isEmpty())
    }
    
    @Test
    fun `processing interactions should update learning state`() = runBlocking {
        // Process a few interactions
        val interaction1 = AdaptiveLearningEngine.UserInteraction(
            type = AdaptiveLearningEngine.InteractionType.MESSAGE_RECEIVED,
            content = "I prefer direct and concise communication"
        )
        
        val interaction2 = AdaptiveLearningEngine.UserInteraction(
            type = AdaptiveLearningEngine.InteractionType.SETTING_CHANGED,
            metadata = mapOf(
                "category" to "communication",
                "setting" to "responseStyle",
                "value" to "direct"
            )
        )
        
        learningEngine.processInteraction(interaction1)
        learningEngine.processInteraction(interaction2)
        
        // Check if state was updated
        val updatedState = learningEngine.learningState.value
        assertEquals(2, updatedState.totalInteractionsObserved)
    }
    
    @Test
    fun `explicit feedback should be properly processed`() = runBlocking {
        // Process some feedback
        val feedback = AdaptiveLearningEngine.UserInteraction(
            type = AdaptiveLearningEngine.InteractionType.EXPLICIT_FEEDBACK,
            explicitFeedback = AdaptiveLearningEngine.ExplicitFeedback(
                rating = 5,
                feedbackText = "I like this direct style of communication",
                feedbackType = "tone",
                targetId = "direct"
            )
        )
        
        learningEngine.processInteraction(feedback)
        
        // Verify it was counted
        val state = learningEngine.learningState.value
        assertEquals(1, state.totalInteractionsObserved)
        
        // After sufficient interactions with the same pattern, a preference model should form
        for (i in 1..5) {
            learningEngine.processInteraction(feedback)
        }
        
        // Now check if preference models contain relevant data
        val preferenceModels = learningEngine.preferenceModels.value
        assertFalse(preferenceModels.isEmpty())
        
        // The specific preference model for communication style should exist
        val communicationModel = preferenceModels[AdaptiveLearningEngine.LearningCategory.COMMUNICATION_STYLE]
        assertNotNull(communicationModel)
        
        // "direct" should have a high preference value due to positive feedback
        val directPreference = communicationModel.preferences["direct"]
        assertNotNull(directPreference)
        assertTrue(directPreference > 0.5f)
    }
    
    @Test
    fun `creating and managing experiments should work`() = runBlocking {
        // Create an experiment
        val experiment = learningEngine.startExperiment(
            hypothesis = "User responds better to direct communication style",
            category = AdaptiveLearningEngine.LearningCategory.COMMUNICATION_STYLE,
            variants = listOf("direct", "indirect", "supportive")
        )
        
        // Verify experiment was created properly
        assertNotNull(experiment)
        assertEquals("User responds better to direct communication style", experiment.hypothesis)
        assertEquals(AdaptiveLearningEngine.LearningCategory.COMMUNICATION_STYLE, experiment.category)
        assertEquals(3, experiment.variants.size)
        assertEquals(AdaptiveLearningEngine.ExperimentStatus.ACTIVE, experiment.status)
        
        // Verify experiment is in active experiments
        val activeExperiments = learningEngine.getActiveExperiments()
        assertEquals(1, activeExperiments.size)
        assertEquals(experiment.id, activeExperiments[0].id)
        
        // Simulate feedback for experiment
        val directFeedback = AdaptiveLearningEngine.UserInteraction(
            type = AdaptiveLearningEngine.InteractionType.EXPLICIT_FEEDBACK,
            explicitFeedback = AdaptiveLearningEngine.ExplicitFeedback(
                rating = 5,
                feedbackText = "I like this direct style",
                feedbackType = "experiment",
                targetId = experiment.id
            ),
            metadata = mapOf(
                "experimentId" to experiment.id,
                "variant" to "direct"
            )
        )
        
        // Process several feedback entries (we need enough to complete the experiment)
        repeat(5) { learningEngine.processInteraction(directFeedback) }
        
        // Provide some feedback for other variants
        val indirectFeedback = directFeedback.copy(
            explicitFeedback = directFeedback.explicitFeedback?.copy(rating = 3),
            metadata = mapOf("experimentId" to experiment.id, "variant" to "indirect")
        )
        
        val supportiveFeedback = directFeedback.copy(
            explicitFeedback = directFeedback.explicitFeedback?.copy(rating = 4),
            metadata = mapOf("experimentId" to experiment.id, "variant" to "supportive")
        )
        
        repeat(5) { learningEngine.processInteraction(indirectFeedback) }
        repeat(5) { learningEngine.processInteraction(supportiveFeedback) }
        
        // Complete the experiment manually to ensure it's completed
        learningEngine.completeExperiment(experiment.id)
        
        // Check that it's now in completed experiments
        val completedExperiments = learningEngine.getCompletedExperiments()
        assertEquals(1, completedExperiments.size)
        
        // Check conclusion exists
        val completedExperiment = completedExperiments[0]
        assertNotNull(completedExperiment.conclusion)
        assertTrue(completedExperiment.conclusion!!.isNotBlank())
    }
    
    @Test
    fun `insights should be generated after sufficient interactions`() = runBlocking {
        // Create interactions that establish a pattern
        repeat(10) {
            // Message about fitness
            val fitnessMessage = AdaptiveLearningEngine.UserInteraction(
                type = AdaptiveLearningEngine.InteractionType.MESSAGE_RECEIVED,
                content = "I really enjoy my morning workout routine",
                contextualFactors = mapOf(
                    "time_of_day" to "morning",
                    "topic" to "fitness"
                )
            )
            learningEngine.processInteraction(fitnessMessage)
            
            // Feature usage related to fitness
            val featureUsage = AdaptiveLearningEngine.UserInteraction(
                type = AdaptiveLearningEngine.InteractionType.FEATURE_USED,
                metadata = mapOf(
                    "feature" to "workout_tracker",
                    "duration" to "${(1 + Math.random() * 10).toInt()} min"
                ),
                contextualFactors = mapOf(
                    "time_of_day" to "morning"
                )
            )
            learningEngine.processInteraction(featureUsage)
            
            // Positive feedback for fitness content
            val fitnessFeedback = AdaptiveLearningEngine.UserInteraction(
                type = AdaptiveLearningEngine.InteractionType.EXPLICIT_FEEDBACK,
                explicitFeedback = AdaptiveLearningEngine.ExplicitFeedback(
                    rating = 5,
                    feedbackText = "Great workout tip!",
                    feedbackType = "content",
                    targetId = "fitness_tip"
                )
            )
            learningEngine.processInteraction(fitnessFeedback)
        }
        
        // Now check for insights
        val insights = learningEngine.getInsights(minConfidence = 0.6f)
        
        // Should have at least one insight about fitness interest
        assertFalse(insights.isEmpty())
        
        // Find fitness-related insight
        val fitnessInsight = insights.find { 
            it.category == AdaptiveLearningEngine.LearningCategory.TOPIC_INTEREST && 
            it.description.contains("fitness", ignoreCase = true)
        }
        
        assertNotNull(fitnessInsight)
        assertTrue(fitnessInsight.confidence >= 0.6f)
    }
    
    @Test
    fun `saving and loading state should preserve learning data`() = runBlocking {
        // Process some interactions
        val interaction = AdaptiveLearningEngine.UserInteraction(
            type = AdaptiveLearningEngine.InteractionType.MESSAGE_RECEIVED,
            content = "I prefer direct communication"
        )
        
        repeat(5) { learningEngine.processInteraction(interaction) }
        
        // Start an experiment
        learningEngine.startExperiment(
            hypothesis = "User responds better to direct communication style",
            category = AdaptiveLearningEngine.LearningCategory.COMMUNICATION_STYLE,
            variants = listOf("direct", "indirect")
        )
        
        // Save state
        val saved = learningEngine.saveToMemory()
        assertTrue(saved)
        
        // Create a new engine instance
        val newConfig = AdaptiveLearningEngine.LearningConfiguration()
        val newEngine = AdaptiveLearningEngine(memorySystem, newConfig)
        
        // Load the saved state
        val loaded = newEngine.loadFromMemory()
        assertTrue(loaded)
        
        // Verify state was restored
        val newState = newEngine.learningState.value
        assertEquals(5, newState.totalInteractionsObserved)
        
        // Verify experiments were restored
        val activeExperiments = newEngine.getActiveExperiments()
        assertEquals(1, activeExperiments.size)
    }
}

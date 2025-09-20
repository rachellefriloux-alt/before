/*
 * Sallie 2.0 Module
 * Persona: Tough love meets soul care.
 * Function: Tests for the Learning Engine Connector.
 * Got it, love.
 */
package com.sallie.core.learning

import com.sallie.core.memory.HierarchicalMemorySystem
import com.sallie.core.memory.FileBasedMemoryStorage
import com.sallie.core.memory.VectorMemoryIndexer
import com.sallie.core.memory.SimpleEmbeddingService
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.test.runBlockingTest
import org.junit.Before
import org.junit.Test
import org.junit.After
import org.junit.Rule
import org.junit.rules.TemporaryFolder
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertTrue
import androidx.arch.core.executor.testing.InstantTaskExecutorRule
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.TestCoroutineDispatcher
import kotlinx.coroutines.test.TestCoroutineScope
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.setMain
import org.junit.rules.TestRule
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit

@ExperimentalCoroutinesApi
class LearningEngineConnectorTest {

    @get:Rule
    val tempFolder = TemporaryFolder()
    
    @get:Rule
    val instantTaskExecutorRule = InstantTaskExecutorRule() as TestRule
    
    private val testDispatcher = TestCoroutineDispatcher()
    private val testScope = TestCoroutineScope(testDispatcher)
    
    private lateinit var learningEngine: AdaptiveLearningEngine
    private lateinit var connector: LearningEngineConnector
    
    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)
        
        val storagePath = tempFolder.newFolder("memory_test").absolutePath
        val storageService = FileBasedMemoryStorage(storagePath)
        val embeddingService = SimpleEmbeddingService()
        val memoryIndexer = VectorMemoryIndexer(embeddingService)
        val memorySystem = HierarchicalMemorySystem(storageService, memoryIndexer)
        
        val config = AdaptiveLearningEngine.LearningConfiguration(
            learningRate = 0.2f, // Higher for testing
            minInteractionsForInsight = 3, // Lower for testing
            insightConfidenceThreshold = 0.6f,
            experimentationRate = 0.1f
        )
        
        learningEngine = AdaptiveLearningEngine(memorySystem, config)
        connector = LearningEngineConnector(learningEngine, testScope)
    }
    
    @After
    fun tearDown() {
        Dispatchers.resetMain()
        testDispatcher.cleanupTestCoroutines()
    }
    
    @Test
    fun `refreshData should update LiveData objects`() = runBlockingTest {
        // Prepare some insights and experiments in the learning engine
        val interaction = AdaptiveLearningEngine.UserInteraction(
            type = AdaptiveLearningEngine.InteractionType.MESSAGE_RECEIVED,
            content = "I prefer direct and concise communication"
        )
        
        // Process several interactions to generate insights
        repeat(10) { learningEngine.processInteraction(interaction) }
        
        // Start an experiment
        learningEngine.startExperiment(
            hypothesis = "User responds better to direct communication style",
            category = AdaptiveLearningEngine.LearningCategory.COMMUNICATION_STYLE,
            variants = listOf("direct", "indirect")
        )
        
        // Now refresh data through connector
        var insightsUpdated = false
        var experimentsUpdated = false
        
        val latch = CountDownLatch(2)
        
        connector.insights.observeForever {
            if (it.isNotEmpty()) {
                insightsUpdated = true
                latch.countDown()
            }
        }
        
        connector.experiments.observeForever {
            if (it.isNotEmpty()) {
                experimentsUpdated = true
                latch.countDown()
            }
        }
        
        connector.refreshData(0.5f)
        
        // Wait for LiveData to be updated
        latch.await(3, TimeUnit.SECONDS)
        
        assertTrue(insightsUpdated)
        assertTrue(experimentsUpdated)
    }
    
    @Test
    fun `processUserInteraction should convert and forward to learning engine`() = runBlockingTest {
        // Create a test UI interaction
        val messageSentInteraction = LearningEngineConnector.UIInteraction.MessageSent(
            message = "Hello, I'm testing the connector",
            contextualFactors = mapOf("test_context" to "unit_test")
        )
        
        // Process it through connector
        connector.processUserInteraction(messageSentInteraction)
        
        // Verify it was processed by checking the learning state
        val state = learningEngine.learningState.value
        assertEquals(1, state.totalInteractionsObserved)
        
        // Try a different interaction type
        val feedbackInteraction = LearningEngineConnector.UIInteraction.FeedbackGiven(
            rating = 5,
            feedbackText = "Great response!",
            feedbackType = "content",
            targetId = "test_response"
        )
        
        connector.processUserInteraction(feedbackInteraction)
        
        // Verify again
        val updatedState = learningEngine.learningState.value
        assertEquals(2, updatedState.totalInteractionsObserved)
    }
    
    @Test
    fun `getExperimentVariant should return valid variant`() = runBlockingTest {
        // Create an experiment
        val experiment = learningEngine.startExperiment(
            hypothesis = "Test hypothesis",
            category = AdaptiveLearningEngine.LearningCategory.COMMUNICATION_STYLE,
            variants = listOf("A", "B", "C")
        )
        
        // Refresh connector data to load experiments
        connector.refreshData()
        
        // Get a variant for the experiment
        val variant = connector.getExperimentVariant(experiment.id)
        
        // Should return one of the variants
        assertNotNull(variant)
        assertTrue(variant in listOf("A", "B", "C"))
    }
    
    @Test
    fun `submitExperimentResult should process feedback correctly`() = runBlockingTest {
        // Create an experiment
        val experiment = learningEngine.startExperiment(
            hypothesis = "Test hypothesis",
            category = AdaptiveLearningEngine.LearningCategory.COMMUNICATION_STYLE,
            variants = listOf("A", "B")
        )
        
        // Submit a result
        connector.submitExperimentResult(experiment.id, "A", true)
        
        // Verify interaction was processed
        val state = learningEngine.learningState.value
        assertEquals(1, state.totalInteractionsObserved)
        
        // Submit another result
        connector.submitExperimentResult(experiment.id, "B", false)
        
        // Verify again
        val updatedState = learningEngine.learningState.value
        assertEquals(2, updatedState.totalInteractionsObserved)
    }
}

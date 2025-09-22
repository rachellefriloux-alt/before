package com.sallie.core.input

import com.sallie.ai.nlpEngine
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.TestCoroutineScope
import kotlinx.coroutines.test.runBlockingTest
import org.junit.Before
import org.junit.Test
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.Mockito.verify
import org.mockito.MockitoAnnotations
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

@ExperimentalCoroutinesApi
class InputProcessingManagerTest {

    @Mock
    private lateinit var mockNlpEngine: com.sallie.ai.nlpEngine
    
    private lateinit var testScope: TestCoroutineScope
    private lateinit var manager: InputProcessingManager
    
    @Before
    fun setup() {
        MockitoAnnotations.initMocks(this)
        
        testScope = TestCoroutineScope()
        manager = InputProcessingManager(testScope, mockNlpEngine)
    }
    
    @Test
    fun `initialize creates and initializes multimodal input processor`() = testScope.runBlockingTest {
        // Initialize the manager
        manager.initialize()
        
        // Verify capabilities are available
        val capabilities = manager.getCapabilities()
        assertNotNull(capabilities)
    }
    
    @Test
    fun `processText delegates to multimodal input processor`() = testScope.runBlockingTest {
        // Initialize the manager
        manager.initialize()
        
        // Setup mock for NLP engine (simplified for test)
        val mockIntent = com.sallie.ai.nlpEngine.IntentResult(
            action = "greeting",
            confidence = 0.9f,
            parameters = mapOf("target" to "Sallie")
        )
        `when`(mockNlpEngine.extractIntent("Hello")).thenReturn(mockIntent)
        
        // Process text
        val result = manager.processText("Hello").first()
        
        // Verify result
        assertNotNull(result)
        assertEquals("Hello", result.textContent?.text)
        assertEquals(InputType.TEXT, result.sourceType)
    }
    
    @Test
    fun `registerInputListener adds listener`() = testScope.runBlockingTest {
        // Initialize the manager
        manager.initialize()
        
        // Create test listener
        val testListener = object : InputResultListener {
            var resultReceived = false
            var errorReceived = false
            
            override fun onInputResult(result: ProcessedInput) {
                resultReceived = true
            }
            
            override fun onInputError(inputType: InputType, error: InputProcessingError, contextId: String?) {
                errorReceived = true
            }
        }
        
        // Register the listener
        manager.registerInputListener(testListener)
        
        // Setup mock for NLP engine (simplified for test)
        val mockIntent = com.sallie.ai.nlpEngine.IntentResult(
            action = "greeting",
            confidence = 0.9f,
            parameters = mapOf()
        )
        `when`(mockNlpEngine.extractIntent("Test")).thenReturn(mockIntent)
        
        // Process text to trigger listener
        val _ = manager.processText("Test").first()
        
        // Wait for events to propagate
        testScope.advanceTimeBy(100)
        
        // Verify listener was called
        assertEquals(true, testListener.resultReceived)
    }
    
    @Test
    fun `setPreprocessingOptions delegates to multimodal input processor`() = testScope.runBlockingTest {
        // Initialize the manager
        manager.initialize()
        
        // Set preprocessing options
        val options = InputPreprocessingOptions(
            contentFiltering = true,
            correctTypos = true,
            expandAbbreviations = false,
            faceDetection = true,
            objectDetection = false,
            noiseReduction = true,
            speakerDiarization = false,
            confidenceThreshold = 0.75f,
            contextRetentionSeconds = 90L
        )
        
        manager.setPreprocessingOptions(options)
        
        // Retrieve options and verify
        val retrievedOptions = manager.getPreprocessingOptions()
        assertEquals(options.contentFiltering, retrievedOptions.contentFiltering)
        assertEquals(options.correctTypos, retrievedOptions.correctTypos)
        assertEquals(options.expandAbbreviations, retrievedOptions.expandAbbreviations)
        assertEquals(options.faceDetection, retrievedOptions.faceDetection)
        assertEquals(options.objectDetection, retrievedOptions.objectDetection)
        assertEquals(options.noiseReduction, retrievedOptions.noiseReduction)
        assertEquals(options.speakerDiarization, retrievedOptions.speakerDiarization)
        assertEquals(options.confidenceThreshold, retrievedOptions.confidenceThreshold)
        assertEquals(options.contextRetentionSeconds, retrievedOptions.contextRetentionSeconds)
    }
}

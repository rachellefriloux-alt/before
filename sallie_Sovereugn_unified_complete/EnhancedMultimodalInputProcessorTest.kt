package com.sallie.core.input

import com.sallie.ai.nlpEngine
import com.sallie.core.input.speech.SpeechProcessor
import com.sallie.core.input.vision.VisionProcessor
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.toList
import kotlinx.coroutines.launch
import kotlinx.coroutines.test.TestCoroutineScope
import kotlinx.coroutines.test.runBlockingTest
import org.junit.Before
import org.junit.Test
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.MockitoAnnotations
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

@ExperimentalCoroutinesApi
class EnhancedMultimodalInputProcessorTest {

    @Mock
    private lateinit var mockSpeechProcessor: SpeechProcessor
    
    @Mock
    private lateinit var mockVisionProcessor: VisionProcessor
    
    @Mock
    private lateinit var mockTextAnalysisProcessor: TextAnalysisProcessor
    
    @Mock
    private lateinit var mockNlpEngine: com.sallie.ai.nlpEngine
    
    private lateinit var testScope: TestCoroutineScope
    private lateinit var processor: EnhancedMultimodalInputProcessor
    
    @Before
    fun setup() {
        MockitoAnnotations.initMocks(this)
        
        testScope = TestCoroutineScope()
        
        processor = EnhancedMultimodalInputProcessor(
            scope = testScope,
            speechProcessor = mockSpeechProcessor,
            visionProcessor = mockVisionProcessor,
            textAnalysisProcessor = mockTextAnalysisProcessor,
            nlpEngine = mockNlpEngine
        )
    }
    
    @Test
    fun `initialize sets capabilities based on underlying processors`() = testScope.runBlockingTest {
        // Setup speech processor capabilities
        val speechCapabilities = setOf(
            com.sallie.core.input.speech.SpeechCapability.SPEECH_RECOGNITION,
            com.sallie.core.input.speech.SpeechCapability.EMOTION_DETECTION
        )
        `when`(mockSpeechProcessor.getCapabilities()).thenReturn(speechCapabilities)
        
        // Setup vision processor capabilities
        val visionCapabilities = setOf(
            com.sallie.core.input.vision.VisionCapability.OBJECT_DETECTION,
            com.sallie.core.input.vision.VisionCapability.FACE_DETECTION
        )
        `when`(mockVisionProcessor.getCapabilities()).thenReturn(visionCapabilities)
        
        // Initialize the processor
        processor.initialize()
        
        // Verify capabilities
        val capabilities = processor.getCapabilities()
        assertTrue(capabilities.contains(InputCapability.SPEECH_RECOGNITION))
        assertTrue(capabilities.contains(InputCapability.EMOTION_RECOGNITION))
        assertTrue(capabilities.contains(InputCapability.OBJECT_DETECTION))
        assertTrue(capabilities.contains(InputCapability.FACE_RECOGNITION))
        assertTrue(capabilities.contains(InputCapability.MULTIMODAL_FUSION))
    }
    
    @Test
    fun `processTextInput returns valid processed input`() = testScope.runBlockingTest {
        // Setup sentiment analysis mock
        val mockSentiment = Sentiment(
            score = 0.5f,
            magnitude = 0.8f,
            language = "en"
        )
        `when`(mockTextAnalysisProcessor.analyzeSentiment("Hello Sallie")).thenReturn(mockSentiment)
        
        // Setup entities mock
        val mockEntities = listOf(
            Entity(
                text = "Sallie",
                type = "PERSON",
                startPosition = 6,
                endPosition = 12,
                confidence = 0.9f
            )
        )
        `when`(mockTextAnalysisProcessor.extractEntities("Hello Sallie")).thenReturn(mockEntities)
        
        // Setup topics mock
        val mockTopics = listOf(
            Topic(
                name = "greeting",
                confidence = 0.8f,
                keywords = listOf("hello")
            )
        )
        `when`(mockTextAnalysisProcessor.extractTopics("Hello Sallie")).thenReturn(mockTopics)
        
        // Setup intent mock
        val mockIntent = com.sallie.ai.nlpEngine.IntentResult(
            action = "greeting",
            confidence = 0.9f,
            parameters = mapOf("target" to "Sallie")
        )
        `when`(mockNlpEngine.extractIntent("Hello Sallie")).thenReturn(mockIntent)
        
        // Process text input
        val results = mutableListOf<ProcessedInput>()
        val job = launch {
            processor.processTextInput("Hello Sallie").toList(results)
        }
        
        // Wait for job to complete
        job.join()
        
        // Verify results
        assertEquals(2, results.size, "Should receive two results (initial and final)")
        
        val finalResult = results.last()
        assertNotNull(finalResult)
        assertEquals(InputType.TEXT, finalResult.sourceType)
        assertEquals("Hello Sallie", finalResult.textContent?.text)
        
        val semanticAnalysis = finalResult.semanticAnalysis
        assertNotNull(semanticAnalysis)
        assertEquals("greeting", semanticAnalysis.intent?.name)
        assertEquals(0.9f, semanticAnalysis.intent?.confidence)
        assertEquals(1, semanticAnalysis.entities.size)
        assertEquals("Sallie", semanticAnalysis.entities[0].text)
        assertEquals(0.5f, semanticAnalysis.sentiment?.score)
    }
    
    @Test
    fun `registerInputListener successfully registers listeners`() = testScope.runBlockingTest {
        // Create a test listener
        val testListener = object : InputListener {
            var processingStarted = false
            var processingComplete = false
            var processingError = false
            
            override fun onInputProcessingStarted(inputType: InputType, contextId: String?) {
                processingStarted = true
            }
            
            override fun onInputProcessingComplete(processedInput: ProcessedInput) {
                processingComplete = true
            }
            
            override fun onInputProcessingError(
                inputType: InputType,
                error: InputProcessingError,
                contextId: String?
            ) {
                processingError = true
            }
            
            override fun onPartialInputProcessed(partialInput: ProcessedInput) {
                // Not testing partial results
            }
        }
        
        // Register the listener
        processor.registerInputListener(testListener)
        
        // Setup sentiment analysis mock (same as previous test)
        val mockSentiment = Sentiment(
            score = 0.5f,
            magnitude = 0.8f,
            language = "en"
        )
        `when`(mockTextAnalysisProcessor.analyzeSentiment("Hello")).thenReturn(mockSentiment)
        
        // Process text input
        val results = mutableListOf<ProcessedInput>()
        val job = launch {
            processor.processTextInput("Hello").toList(results)
        }
        
        // Wait for job to complete
        job.join()
        
        // Verify listener was called
        assertTrue(testListener.processingStarted)
        assertTrue(testListener.processingComplete)
    }
    
    @Test
    fun `setPreprocessingOptions updates options`() {
        // Set preprocessing options
        val options = InputPreprocessingOptions(
            contentFiltering = true,
            correctTypos = true,
            expandAbbreviations = true,
            faceDetection = true,
            objectDetection = true,
            noiseReduction = true,
            speakerDiarization = true,
            confidenceThreshold = 0.8f,
            contextRetentionSeconds = 120L
        )
        
        processor.setPreprocessingOptions(options)
        
        // Verify options were set
        val retrievedOptions = processor.getPreprocessingOptions()
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

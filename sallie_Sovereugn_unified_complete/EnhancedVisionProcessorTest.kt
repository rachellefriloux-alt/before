package com.sallie.core.input.vision

import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.TestCoroutineScope
import kotlinx.coroutines.test.runBlockingTest
import org.junit.Before
import org.junit.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

@ExperimentalCoroutinesApi
class EnhancedVisionProcessorTest {

    private lateinit var testScope: TestCoroutineScope
    private lateinit var processor: EnhancedVisionProcessor
    
    @Before
    fun setup() {
        testScope = TestCoroutineScope()
        processor = EnhancedVisionProcessor(
            faceRecognitionEnabled = true,
            objectDetectionEnabled = true,
            textRecognitionEnabled = true,
            sceneUnderstandingEnabled = true
        )
    }
    
    @Test
    fun `initialize sets capabilities based on enabled features`() = testScope.runBlockingTest {
        // Initialize the processor
        processor.initialize()
        
        // Verify capabilities
        val capabilities = processor.getCapabilities()
        assertTrue(capabilities.contains(VisionCapability.OBJECT_DETECTION))
        assertTrue(capabilities.contains(VisionCapability.FACE_DETECTION))
        assertTrue(capabilities.contains(VisionCapability.TEXT_RECOGNITION))
        assertTrue(capabilities.contains(VisionCapability.SCENE_UNDERSTANDING))
        assertTrue(capabilities.contains(VisionCapability.IMAGE_DESCRIPTION))
    }
    
    @Test
    fun `analyzeImage returns complete analysis result`() = testScope.runBlockingTest {
        // Initialize the processor
        processor.initialize()
        
        // Create dummy image data
        val imageData = "test image data".toByteArray()
        
        // Set analysis options
        val options = ImageAnalysisOptions(
            detectFaces = true,
            detectObjects = true,
            confidenceThreshold = 0.7f
        )
        
        // Analyze the image
        val result = processor.analyzeImage(imageData, options)
        
        // Verify result contains expected components
        assertNotNull(result.id)
        assertNotNull(result.objects)
        assertNotNull(result.faces)
        assertNotNull(result.tags)
        assertNotNull(result.text)
        assertNotNull(result.imageDescription)
        
        // Verify objects are detected
        assertTrue(result.objects.isNotEmpty())
        
        // Verify faces are detected
        assertTrue(result.faces.isNotEmpty())
        
        // Verify scene tags are created
        assertTrue(result.tags.isNotEmpty())
        
        // Verify text is recognized
        assertTrue(result.text.isNotEmpty())
        
        // Verify image description is generated
        assertTrue(result.imageDescription.isNotEmpty())
    }
    
    @Test
    fun `detectObjects respects confidence threshold`() = testScope.runBlockingTest {
        // Initialize the processor
        processor.initialize()
        
        // Create dummy image data
        val imageData = "test image data".toByteArray()
        
        // Detect objects with high confidence threshold
        val highThreshold = 0.9f
        val highConfidenceObjects = processor.detectObjects(imageData, highThreshold)
        
        // Detect objects with low confidence threshold
        val lowThreshold = 0.5f
        val lowConfidenceObjects = processor.detectObjects(imageData, lowThreshold)
        
        // Verify that low threshold returns more objects than high threshold
        assertTrue(lowConfidenceObjects.size >= highConfidenceObjects.size)
        
        // Verify all objects in high confidence result have confidence >= highThreshold
        for (obj in highConfidenceObjects) {
            assertTrue(obj.confidence >= highThreshold)
        }
    }
    
    @Test
    fun `analyzeScene returns relevant tags`() = testScope.runBlockingTest {
        // Initialize the processor
        processor.initialize()
        
        // Create dummy image data
        val imageData = "test image data".toByteArray()
        
        // Analyze scene
        val tags = processor.analyzeScene(imageData)
        
        // Verify tags
        assertTrue(tags.isNotEmpty())
        assertTrue(tags.any { it.name == "indoor" })
        
        // Verify all tags have confidence scores
        for (tag in tags) {
            assertTrue(tag.confidence > 0f && tag.confidence <= 1.0f)
        }
    }
    
    @Test
    fun `disabled features are not included in capabilities`() = testScope.runBlockingTest {
        // Create processor with limited features
        val limitedProcessor = EnhancedVisionProcessor(
            faceRecognitionEnabled = false,
            objectDetectionEnabled = true,
            textRecognitionEnabled = false,
            sceneUnderstandingEnabled = true
        )
        
        // Initialize the processor
        limitedProcessor.initialize()
        
        // Verify capabilities
        val capabilities = limitedProcessor.getCapabilities()
        assertTrue(capabilities.contains(VisionCapability.OBJECT_DETECTION))
        assertTrue(capabilities.contains(VisionCapability.SCENE_UNDERSTANDING))
        assertTrue(capabilities.contains(VisionCapability.IMAGE_DESCRIPTION))
        assertTrue(!capabilities.contains(VisionCapability.FACE_DETECTION))
        assertTrue(!capabilities.contains(VisionCapability.TEXT_RECOGNITION))
    }
}

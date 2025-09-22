package com.sallie.core.input

import com.sallie.ai.nlpEngine
import com.sallie.core.input.speech.EnhancedSpeechProcessor
import com.sallie.core.input.speech.SpeechProcessor
import com.sallie.core.input.vision.EnhancedVisionProcessor
import com.sallie.core.input.vision.VisionProcessor
import kotlinx.coroutines.CoroutineScope

/**
 * Sallie's Input Processor Factory
 * 
 * This class provides factory methods for creating various input processors
 * that make up the multimodal input processing system.
 */
object InputProcessorFactory {
    
    /**
     * Create a complete multimodal input processor with all available processors
     */
    fun createMultimodalInputProcessor(
        scope: CoroutineScope,
        nlpEngine: com.sallie.ai.nlpEngine
    ): MultimodalInputProcessor {
        // Create the speech processor
        val speechProcessor = createSpeechProcessor()
        
        // Create the vision processor
        val visionProcessor = createVisionProcessor()
        
        // Create the text analysis processor
        val textAnalysisProcessor = createTextAnalysisProcessor(nlpEngine)
        
        // Create the multimodal input processor
        return EnhancedMultimodalInputProcessor(
            scope = scope,
            speechProcessor = speechProcessor,
            visionProcessor = visionProcessor,
            textAnalysisProcessor = textAnalysisProcessor,
            nlpEngine = nlpEngine
        )
    }
    
    /**
     * Create a speech processor with default settings
     */
    fun createSpeechProcessor(
        speechRecognitionEnabled: Boolean = true,
        speakerIdentificationEnabled: Boolean = true,
        emotionDetectionEnabled: Boolean = true,
        voiceAnalysisEnabled: Boolean = true
    ): SpeechProcessor {
        return EnhancedSpeechProcessor(
            speechRecognitionEnabled = speechRecognitionEnabled,
            speakerIdentificationEnabled = speakerIdentificationEnabled,
            emotionDetectionEnabled = emotionDetectionEnabled,
            voiceAnalysisEnabled = voiceAnalysisEnabled
        )
    }
    
    /**
     * Create a vision processor with default settings
     */
    fun createVisionProcessor(
        faceRecognitionEnabled: Boolean = true,
        objectDetectionEnabled: Boolean = true,
        textRecognitionEnabled: Boolean = true,
        sceneUnderstandingEnabled: Boolean = true
    ): VisionProcessor {
        return EnhancedVisionProcessor(
            faceRecognitionEnabled = faceRecognitionEnabled,
            objectDetectionEnabled = objectDetectionEnabled,
            textRecognitionEnabled = textRecognitionEnabled,
            sceneUnderstandingEnabled = sceneUnderstandingEnabled
        )
    }
    
    /**
     * Create a text analysis processor with default settings
     */
    fun createTextAnalysisProcessor(
        nlpEngine: com.sallie.ai.nlpEngine
    ): TextAnalysisProcessor {
        return DefaultTextAnalysisProcessor(nlpEngine)
    }
}

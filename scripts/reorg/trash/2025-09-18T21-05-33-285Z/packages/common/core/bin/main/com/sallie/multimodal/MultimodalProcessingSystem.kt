/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * Multimodal Input Processing System
 */

package com.sallie.multimodal

import com.sallie.core.values.ValuesSystem
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.UUID

/**
 * The main multimodal processing system that coordinates different input modalities
 * and provides a unified processing pipeline.
 */
class MultimodalProcessingSystem(
    private val valueSystem: ValuesSystem
) {
    // Individual processors for different modalities
    private val textProcessor = TextInputProcessor()
    private val imageProcessor = ImageInputProcessor(valueSystem)
    private val audioProcessor = AudioInputProcessor(valueSystem)
    private val videoProcessor = VideoInputProcessor(valueSystem)
    
    // Cross-modal integrator for combining insights from different modalities
    private val crossModalIntegrator = CrossModalIntegrator()
    
    // Context manager to maintain conversation and interaction context
    private val contextManager = MultimodalContextManager()
    
    // Mutable state flow for processing status
    private val _processingStatus = MutableStateFlow<ProcessingStatus>(ProcessingStatus.Idle)
    val processingStatus = _processingStatus.asStateFlow()
    
    /**
     * Process a text input and return a structured understanding
     */
    suspend fun processText(text: String): InputUnderstanding {
        _processingStatus.value = ProcessingStatus.Processing(InputType.TEXT)
        
        // Check if the text content aligns with values
        val valueCheck = valueSystem.checkUserInput(text)
        if (!valueCheck.isApproved) {
            _processingStatus.value = ProcessingStatus.Rejected(
                reason = valueCheck.explanation,
                inputType = InputType.TEXT
            )
            return InputUnderstanding(
                id = UUID.randomUUID().toString(),
                inputType = InputType.TEXT,
                status = UnderstandingStatus.REJECTED,
                reason = valueCheck.explanation,
                insights = emptyList(),
                confidence = 0.0f,
                timestamp = System.currentTimeMillis()
            )
        }
        
        // Process the text
        val textUnderstanding = textProcessor.processText(text)
        
        // Update context with new understanding
        contextManager.updateContext(textUnderstanding)
        
        _processingStatus.value = ProcessingStatus.Completed(InputType.TEXT)
        return textUnderstanding
    }
    
    /**
     * Process an image input and return a structured understanding
     */
    suspend fun processImage(imageData: ByteArray, metadata: Map<String, String>?): InputUnderstanding {
        _processingStatus.value = ProcessingStatus.Processing(InputType.IMAGE)
        
        // Process the image
        val imageUnderstanding = imageProcessor.processImage(imageData, metadata)
        
        // Check if the content aligns with values
        if (imageUnderstanding.status == UnderstandingStatus.CONTAINS_SENSITIVE_CONTENT) {
            _processingStatus.value = ProcessingStatus.Rejected(
                reason = imageUnderstanding.reason ?: "Image contains sensitive content",
                inputType = InputType.IMAGE
            )
            return imageUnderstanding
        }
        
        // Update context with new understanding
        contextManager.updateContext(imageUnderstanding)
        
        _processingStatus.value = ProcessingStatus.Completed(InputType.IMAGE)
        return imageUnderstanding
    }
    
    /**
     * Process an audio input and return a structured understanding
     */
    suspend fun processAudio(audioData: ByteArray, metadata: Map<String, String>?): InputUnderstanding {
        _processingStatus.value = ProcessingStatus.Processing(InputType.AUDIO)
        
        // Process the audio
        val audioUnderstanding = audioProcessor.processAudio(audioData, metadata)
        
        // Check if the content aligns with values
        if (audioUnderstanding.status == UnderstandingStatus.CONTAINS_SENSITIVE_CONTENT) {
            _processingStatus.value = ProcessingStatus.Rejected(
                reason = audioUnderstanding.reason ?: "Audio contains sensitive content",
                inputType = InputType.AUDIO
            )
            return audioUnderstanding
        }
        
        // Update context with new understanding
        contextManager.updateContext(audioUnderstanding)
        
        _processingStatus.value = ProcessingStatus.Completed(InputType.AUDIO)
        return audioUnderstanding
    }
    
    /**
     * Process a video input and return a structured understanding
     */
    suspend fun processVideo(videoData: ByteArray, metadata: Map<String, String>?): InputUnderstanding {
        _processingStatus.value = ProcessingStatus.Processing(InputType.VIDEO)
        
        // Process the video
        val videoUnderstanding = videoProcessor.processVideo(videoData, metadata)
        
        // Check if the content aligns with values
        if (videoUnderstanding.status == UnderstandingStatus.CONTAINS_SENSITIVE_CONTENT) {
            _processingStatus.value = ProcessingStatus.Rejected(
                reason = videoUnderstanding.reason ?: "Video contains sensitive content",
                inputType = InputType.VIDEO
            )
            return videoUnderstanding
        }
        
        // Update context with new understanding
        contextManager.updateContext(videoUnderstanding)
        
        _processingStatus.value = ProcessingStatus.Completed(InputType.VIDEO)
        return videoUnderstanding
    }
    
    /**
     * Process multiple inputs of different modalities together
     */
    suspend fun processMultimodalInput(
        inputs: List<MultimodalInput>
    ): MultimodalUnderstanding {
        _processingStatus.value = ProcessingStatus.Processing(InputType.MULTIMODAL)
        
        val understandings = mutableListOf<InputUnderstanding>()
        
        // Process each input
        for (input in inputs) {
            val understanding = when (input) {
                is MultimodalInput.TextInput -> processText(input.text)
                is MultimodalInput.ImageInput -> processImage(input.imageData, input.metadata)
                is MultimodalInput.AudioInput -> processAudio(input.audioData, input.metadata)
                is MultimodalInput.VideoInput -> processVideo(input.videoData, input.metadata)
            }
            
            // If any input is rejected, the entire multimodal input is rejected
            if (understanding.status == UnderstandingStatus.REJECTED) {
                _processingStatus.value = ProcessingStatus.Rejected(
                    reason = understanding.reason ?: "Content rejected",
                    inputType = InputType.MULTIMODAL
                )
                
                return MultimodalUnderstanding(
                    id = UUID.randomUUID().toString(),
                    understandings = understandings + understanding,
                    status = UnderstandingStatus.REJECTED,
                    reason = understanding.reason,
                    integratedInsights = emptyList(),
                    timestamp = System.currentTimeMillis()
                )
            }
            
            understandings.add(understanding)
        }
        
        // Integrate understandings across modalities
        val integratedInsights = crossModalIntegrator.integrateUnderstandings(understandings)
        
        // Create the multimodal understanding
        val multimodalUnderstanding = MultimodalUnderstanding(
            id = UUID.randomUUID().toString(),
            understandings = understandings,
            status = UnderstandingStatus.UNDERSTOOD,
            reason = null,
            integratedInsights = integratedInsights,
            timestamp = System.currentTimeMillis()
        )
        
        // Update context with the integrated understanding
        contextManager.updateMultimodalContext(multimodalUnderstanding)
        
        _processingStatus.value = ProcessingStatus.Completed(InputType.MULTIMODAL)
        return multimodalUnderstanding
    }
    
    /**
     * Get the current conversation context
     */
    fun getCurrentContext(): MultimodalContext {
        return contextManager.getCurrentContext()
    }
    
    /**
     * Get the conversation history
     */
    fun getConversationHistory(): List<InputUnderstanding> {
        return contextManager.getConversationHistory()
    }
    
    /**
     * Clear the conversation history and context
     */
    fun clearContext() {
        contextManager.clearContext()
    }
}

/**
 * Types of input that can be processed
 */
enum class InputType {
    TEXT,
    IMAGE,
    AUDIO,
    VIDEO,
    MULTIMODAL
}

/**
 * Status of processing an input
 */
sealed class ProcessingStatus {
    /**
     * System is idle, not processing anything
     */
    object Idle : ProcessingStatus()
    
    /**
     * System is processing an input
     */
    data class Processing(val inputType: InputType) : ProcessingStatus()
    
    /**
     * Processing completed successfully
     */
    data class Completed(val inputType: InputType) : ProcessingStatus()
    
    /**
     * Input was rejected
     */
    data class Rejected(val reason: String, val inputType: InputType) : ProcessingStatus()
    
    /**
     * An error occurred during processing
     */
    data class Error(val error: String, val inputType: InputType) : ProcessingStatus()
}

/**
 * Status of understanding an input
 */
enum class UnderstandingStatus {
    UNDERSTOOD,
    PARTIALLY_UNDERSTOOD,
    NOT_UNDERSTOOD,
    CONTAINS_SENSITIVE_CONTENT,
    REJECTED
}

/**
 * Represents a single insight extracted from an input
 */
data class InputInsight(
    val id: String,
    val category: InsightCategory,
    val content: String,
    val confidence: Float,
    val source: InputType
)

/**
 * Categories of insights that can be extracted from inputs
 */
enum class InsightCategory {
    INTENT,
    ENTITY,
    SENTIMENT,
    EMOTION,
    TOPIC,
    ACTION_REQUEST,
    INFORMATION_REQUEST,
    VISUAL_OBJECT,
    SCENE_CONTEXT,
    AUDIO_TRANSCRIPTION,
    AUDIO_EMOTION,
    CROSS_REFERENCE
}

/**
 * A structured understanding of an input
 */
data class InputUnderstanding(
    val id: String,
    val inputType: InputType,
    val status: UnderstandingStatus,
    val reason: String? = null,
    val insights: List<InputInsight>,
    val confidence: Float,
    val timestamp: Long
)

/**
 * A structured understanding of multiple inputs
 */
data class MultimodalUnderstanding(
    val id: String,
    val understandings: List<InputUnderstanding>,
    val status: UnderstandingStatus,
    val reason: String? = null,
    val integratedInsights: List<InputInsight>,
    val timestamp: Long
)

/**
 * Sealed class for different types of multimodal inputs
 */
sealed class MultimodalInput {
    data class TextInput(val text: String) : MultimodalInput()
    data class ImageInput(val imageData: ByteArray, val metadata: Map<String, String>?) : MultimodalInput() {
        override fun equals(other: Any?): Boolean {
            if (this === other) return true
            if (javaClass != other?.javaClass) return false
            
            other as ImageInput
            
            if (!imageData.contentEquals(other.imageData)) return false
            if (metadata != other.metadata) return false
            
            return true
        }
        
        override fun hashCode(): Int {
            var result = imageData.contentHashCode()
            result = 31 * result + (metadata?.hashCode() ?: 0)
            return result
        }
    }
    data class AudioInput(val audioData: ByteArray, val metadata: Map<String, String>?) : MultimodalInput() {
        override fun equals(other: Any?): Boolean {
            if (this === other) return true
            if (javaClass != other?.javaClass) return false
            
            other as AudioInput
            
            if (!audioData.contentEquals(other.audioData)) return false
            if (metadata != other.metadata) return false
            
            return true
        }
        
        override fun hashCode(): Int {
            var result = audioData.contentHashCode()
            result = 31 * result + (metadata?.hashCode() ?: 0)
            return result
        }
    }
    data class VideoInput(val videoData: ByteArray, val metadata: Map<String, String>?) : MultimodalInput() {
        override fun equals(other: Any?): Boolean {
            if (this === other) return true
            if (javaClass != other?.javaClass) return false
            
            other as VideoInput
            
            if (!videoData.contentEquals(other.videoData)) return false
            if (metadata != other.metadata) return false
            
            return true
        }
        
        override fun hashCode(): Int {
            var result = videoData.contentHashCode()
            result = 31 * result + (metadata?.hashCode() ?: 0)
            return result
        }
    }
}

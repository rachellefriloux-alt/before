package com.sallie.core.input

import com.sallie.core.input.vision.ImageAnalysisResult
import java.time.Instant

/**
 * Sallie's Multimodal Input Models
 * 
 * This file defines the core data structures used by the multimodal input processing system.
 */

/**
 * Types of input that Sallie can process
 */
enum class InputType {
    TEXT,
    VOICE,
    IMAGE,
    VIDEO,
    SENSOR
}

/**
 * Input processing capabilities that may be available
 */
enum class InputCapability {
    SPEECH_RECOGNITION,
    IMAGE_UNDERSTANDING,
    EMOTION_RECOGNITION,
    GESTURE_RECOGNITION,
    SENTIMENT_ANALYSIS,
    ENTITY_EXTRACTION,
    INTENT_DETECTION,
    LANGUAGE_DETECTION,
    OBJECT_DETECTION,
    OCR_TEXT_RECOGNITION,
    FACE_RECOGNITION,
    SCENE_UNDERSTANDING,
    MULTIMODAL_FUSION
}

/**
 * Options for input preprocessing
 */
data class InputPreprocessingOptions(
    // Text-specific options
    val normalizeText: Boolean = true,
    val removeDiacritics: Boolean = false,
    val correctTypos: Boolean = true,
    val expandAbbreviations: Boolean = true,
    
    // Voice-specific options
    val noiseReduction: Boolean = true,
    val voiceActivityDetection: Boolean = true,
    val speakerDiarization: Boolean = false,
    
    // Image-specific options
    val imageResizing: Boolean = true,
    val colorCorrection: Boolean = true,
    val faceDetection: Boolean = true,
    val objectDetection: Boolean = true,
    
    // General options
    val privacyFiltering: Boolean = true,
    val contentFiltering: Boolean = true,
    val confidenceThreshold: Float = 0.7f,
    val cachingEnabled: Boolean = true,
    val contextRetentionSeconds: Int = 300 // 5 minutes
)

/**
 * Represents processed input after going through the input processing pipeline
 */
data class ProcessedInput(
    val id: String,
    val timestamp: Instant,
    val sourceType: InputType,
    val confidence: Float,
    val contextId: String? = null,
    
    // Primary content - only one of these will typically be set depending on the input type
    val textContent: TextContent? = null,
    val voiceContent: VoiceContent? = null,
    val imageContent: ImageContent? = null,
    val videoContent: VideoContent? = null,
    val sensorContent: SensorContent? = null,
    
    // Semantic enrichment common to all input types
    val semanticAnalysis: SemanticAnalysis? = null,
    
    // Optional metadata
    val metadata: Map<String, Any> = emptyMap(),
    
    // Processing information
    val processingTimeMs: Long = 0,
    val preprocessingApplied: Set<String> = emptySet(),
    val qualityScore: Float = 0.0f,
    val errors: List<InputProcessingError> = emptyList()
)

/**
 * Represents text content from text input or speech-to-text
 */
data class TextContent(
    val text: String,
    val language: String? = null,
    val isPartial: Boolean = false,
    val segments: List<TextSegment> = emptyList()
)

/**
 * A segment of text, typically a sentence or meaningful unit
 */
data class TextSegment(
    val text: String,
    val startIndex: Int,
    val endIndex: Int,
    val confidence: Float = 1.0f
)

/**
 * Represents voice content from speech input
 */
data class VoiceContent(
    val transcript: String,
    val language: String? = null,
    val isPartial: Boolean = false,
    val speakerId: String? = null,
    val confidenceScore: Float = 0.0f,
    val emotionalTone: String? = null,
    val audioFeatures: AudioFeatures? = null,
    val segments: List<VoiceSegment> = emptyList()
)

/**
 * A segment of voice content
 */
data class VoiceSegment(
    val text: String,
    val startTimeMs: Long,
    val endTimeMs: Long,
    val confidence: Float = 1.0f,
    val speakerId: String? = null
)

/**
 * Audio features extracted from voice input
 */
data class AudioFeatures(
    val volume: Float = 0.0f, // 0.0 to 1.0
    val pitch: Float = 0.0f,  // Hz
    val speechRate: Float = 0.0f, // words per minute
    val emotionScores: Map<String, Float> = emptyMap(),
    val backgroundNoise: Float = 0.0f, // 0.0 to 1.0
    val voiceCharacteristics: Map<String, Float> = emptyMap()
)

/**
 * Represents image content
 */
data class ImageContent(
    val description: String? = null,
    val analysisResult: ImageAnalysisResult? = null,
    val recognizedText: List<RecognizedText> = emptyList(),
    val recognizedFaces: List<RecognizedFace> = emptyList(),
    val recognizedObjects: List<RecognizedObject> = emptyList(),
    val sceneLabels: List<SceneLabel> = emptyList(),
    val imageQuality: ImageQuality? = null,
    val colorPalette: List<ColorInfo> = emptyList()
)

/**
 * Text recognized within an image (OCR)
 */
data class RecognizedText(
    val text: String,
    val confidence: Float,
    val boundingBox: BoundingBox,
    val language: String? = null
)

/**
 * A face recognized in an image
 */
data class RecognizedFace(
    val boundingBox: BoundingBox,
    val confidence: Float,
    val landmarks: Map<FaceLandmark, Point> = emptyMap(),
    val attributes: Map<String, Float> = emptyMap(),
    val identityId: String? = null
)

/**
 * A recognized object in an image
 */
data class RecognizedObject(
    val label: String,
    val confidence: Float,
    val boundingBox: BoundingBox,
    val attributes: Map<String, Any> = emptyMap()
)

/**
 * A scene label for an image
 */
data class SceneLabel(
    val label: String,
    val confidence: Float
)

/**
 * Image quality metrics
 */
data class ImageQuality(
    val brightness: Float, // 0.0 to 1.0
    val contrast: Float, // 0.0 to 1.0
    val sharpness: Float, // 0.0 to 1.0
    val noise: Float, // 0.0 to 1.0
    val colorBalance: Float // 0.0 to 1.0
)

/**
 * Color information
 */
data class ColorInfo(
    val color: Int, // ARGB color
    val percentage: Float, // 0.0 to 1.0
    val name: String? = null
)

/**
 * Represents video content
 */
data class VideoContent(
    val description: String? = null,
    val keyFrames: List<VideoKeyFrame> = emptyList(),
    val transcription: String? = null,
    val duration: Long = 0, // milliseconds
    val scenes: List<VideoScene> = emptyList(),
    val activities: List<RecognizedActivity> = emptyList()
)

/**
 * A key frame in a video
 */
data class VideoKeyFrame(
    val timestamp: Long, // milliseconds
    val imageContent: ImageContent
)

/**
 * A scene in a video
 */
data class VideoScene(
    val startTimeMs: Long,
    val endTimeMs: Long,
    val description: String? = null
)

/**
 * A recognized activity in a video
 */
data class RecognizedActivity(
    val activity: String,
    val confidence: Float,
    val startTimeMs: Long,
    val endTimeMs: Long
)

/**
 * Represents sensor data
 */
data class SensorContent(
    val sensorType: String,
    val values: List<Float>,
    val timestamp: Long,
    val interpretation: String? = null
)

/**
 * Semantic analysis of the input
 */
data class SemanticAnalysis(
    val intent: Intent? = null,
    val entities: List<Entity> = emptyList(),
    val sentiment: Sentiment? = null,
    val topics: List<Topic> = emptyList(),
    val summary: String? = null,
    val emotions: Map<String, Float> = emptyMap(),
    val urgency: Float = 0.0f, // 0.0 to 1.0
    val importance: Float = 0.0f // 0.0 to 1.0
)

/**
 * An intent detected in the input
 */
data class Intent(
    val name: String,
    val confidence: Float,
    val parameters: Map<String, String> = emptyMap()
)

/**
 * An entity detected in the input
 */
data class Entity(
    val type: String,
    val value: String,
    val confidence: Float,
    val startIndex: Int = -1,
    val endIndex: Int = -1,
    val metadata: Map<String, Any> = emptyMap()
)

/**
 * Sentiment analysis result
 */
data class Sentiment(
    val score: Float, // -1.0 (negative) to 1.0 (positive)
    val magnitude: Float, // 0.0 to 1.0
    val label: String // "positive", "negative", "neutral", etc.
)

/**
 * A topic detected in the input
 */
data class Topic(
    val name: String,
    val confidence: Float
)

/**
 * Geometric primitives
 */
data class Point(val x: Float, val y: Float)
data class BoundingBox(val left: Float, val top: Float, val width: Float, val height: Float)

/**
 * Face landmarks
 */
enum class FaceLandmark {
    LEFT_EYE,
    RIGHT_EYE,
    NOSE,
    MOUTH_LEFT,
    MOUTH_RIGHT,
    LEFT_EYEBROW,
    RIGHT_EYEBROW,
    MOUTH_CENTER
}

/**
 * Error during input processing
 */
data class InputProcessingError(
    val code: String,
    val message: String,
    val severity: ErrorSeverity
)

/**
 * Severity of an input processing error
 */
enum class ErrorSeverity {
    INFO,
    WARNING,
    ERROR,
    CRITICAL
}

/**
 * Listener for input events
 */
interface InputListener {
    /**
     * Called when input processing begins
     * 
     * @param inputType The type of input being processed
     * @param contextId Optional context identifier
     */
    fun onInputProcessingStarted(inputType: InputType, contextId: String?)
    
    /**
     * Called when partial input processing results are available
     * 
     * @param partialInput The partial processed input
     */
    fun onPartialInputProcessed(partialInput: ProcessedInput)
    
    /**
     * Called when input processing is complete
     * 
     * @param processedInput The fully processed input
     */
    fun onInputProcessingComplete(processedInput: ProcessedInput)
    
    /**
     * Called when an error occurs during input processing
     * 
     * @param inputType The type of input being processed
     * @param error The error that occurred
     * @param contextId Optional context identifier
     */
    fun onInputProcessingError(inputType: InputType, error: InputProcessingError, contextId: String?)
}

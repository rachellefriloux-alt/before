package com.sallie.core.input.vision

import com.sallie.core.input.BoundingBox
import com.sallie.core.input.Point
import com.sallie.core.input.RecognizedFace
import com.sallie.core.input.RecognizedObject
import com.sallie.core.input.RecognizedText

/**
 * Sallie's Vision System
 * 
 * This system provides computer vision capabilities for analyzing images and extracting
 * meaningful information from visual input.
 */
interface VisionProcessor {
    /**
     * Initialize the vision processor
     */
    suspend fun initialize()
    
    /**
     * Analyze an image and extract information from it
     * 
     * @param imageData The raw image data to analyze
     * @param analysisOptions Options controlling what types of analysis to perform
     * @return An ImageAnalysisResult containing the results of the analysis
     */
    suspend fun analyzeImage(
        imageData: ByteArray, 
        analysisOptions: ImageAnalysisOptions = ImageAnalysisOptions()
    ): ImageAnalysisResult
    
    /**
     * Detect and recognize objects in an image
     * 
     * @param imageData The raw image data to analyze
     * @param options Options for object detection
     * @return A list of recognized objects
     */
    suspend fun detectObjects(
        imageData: ByteArray,
        options: ObjectDetectionOptions = ObjectDetectionOptions()
    ): List<RecognizedObject>
    
    /**
     * Detect and recognize text in an image (OCR)
     * 
     * @param imageData The raw image data to analyze
     * @param options Options for text recognition
     * @return A list of recognized text elements
     */
    suspend fun recognizeText(
        imageData: ByteArray,
        options: TextRecognitionOptions = TextRecognitionOptions()
    ): List<RecognizedText>
    
    /**
     * Detect and analyze faces in an image
     * 
     * @param imageData The raw image data to analyze
     * @param options Options for face detection and analysis
     * @return A list of recognized faces
     */
    suspend fun detectFaces(
        imageData: ByteArray,
        options: FaceDetectionOptions = FaceDetectionOptions()
    ): List<RecognizedFace>
    
    /**
     * Generate a description of an image
     * 
     * @param imageData The raw image data to analyze
     * @param options Options for description generation
     * @return A textual description of the image
     */
    suspend fun generateDescription(
        imageData: ByteArray,
        options: DescriptionOptions = DescriptionOptions()
    ): String
    
    /**
     * Check if the image contains inappropriate content
     * 
     * @param imageData The raw image data to analyze
     * @return A ContentSafetyResult with safety scores for different categories
     */
    suspend fun checkContentSafety(imageData: ByteArray): ContentSafetyResult
    
    /**
     * Analyze a video file
     * 
     * @param videoData The raw video data to analyze
     * @param options Options for video analysis
     * @return A VideoAnalysisResult containing the results of the analysis
     */
    suspend fun analyzeVideo(
        videoData: ByteArray,
        options: VideoAnalysisOptions = VideoAnalysisOptions()
    ): VideoAnalysisResult
    
    /**
     * Get the capabilities of the vision processor
     * 
     * @return A set of VisionCapability values indicating what the processor can do
     */
    fun getCapabilities(): Set<VisionCapability>
}

/**
 * Result of image analysis
 */
data class ImageAnalysisResult(
    val imageDescription: String? = null,
    val tags: List<ImageTag> = emptyList(),
    val objects: List<RecognizedObject> = emptyList(),
    val faces: List<RecognizedFace> = emptyList(),
    val text: List<RecognizedText> = emptyList(),
    val landmarks: List<Landmark> = emptyList(),
    val logos: List<Logo> = emptyList(),
    val safetyResults: ContentSafetyResult? = null,
    val metadataExtracted: Map<String, Any> = emptyMap(),
    val processingTimeMs: Long = 0
)

/**
 * Result of video analysis
 */
data class VideoAnalysisResult(
    val description: String? = null,
    val keyFrames: List<KeyFrame> = emptyList(),
    val transcript: String? = null,
    val topics: List<VideoTopic> = emptyList(),
    val persons: List<Person> = emptyList(),
    val objects: List<TrackedObject> = emptyList(),
    val scenes: List<Scene> = emptyList(),
    val safetyResults: List<TimestampedContentSafetyResult> = emptyList(),
    val metadataExtracted: Map<String, Any> = emptyMap(),
    val processingTimeMs: Long = 0
)

/**
 * A key frame from a video with its analysis
 */
data class KeyFrame(
    val timestampMs: Long,
    val imageAnalysis: ImageAnalysisResult
)

/**
 * A topic detected in a video
 */
data class VideoTopic(
    val name: String,
    val confidence: Float,
    val firstAppearanceMs: Long,
    val appearances: List<TimeRange>
)

/**
 * A time range within a video
 */
data class TimeRange(
    val startMs: Long,
    val endMs: Long
)

/**
 * A person identified in a video
 */
data class Person(
    val id: String,
    val appearances: List<TimeRange>,
    val faceId: String? = null,
    val name: String? = null
)

/**
 * An object tracked through a video
 */
data class TrackedObject(
    val id: String,
    val label: String,
    val positions: List<TimestampedPosition>
)

/**
 * A position at a specific timestamp
 */
data class TimestampedPosition(
    val timestampMs: Long,
    val boundingBox: BoundingBox
)

/**
 * A scene detected in a video
 */
data class Scene(
    val timeRange: TimeRange,
    val description: String? = null,
    val confidence: Float
)

/**
 * A landmark recognized in an image
 */
data class Landmark(
    val name: String,
    val confidence: Float,
    val boundingBox: BoundingBox? = null,
    val location: GeoLocation? = null
)

/**
 * A logo recognized in an image
 */
data class Logo(
    val name: String,
    val confidence: Float,
    val boundingBox: BoundingBox
)

/**
 * A tag assigned to an image
 */
data class ImageTag(
    val name: String,
    val confidence: Float
)

/**
 * Geographic location
 */
data class GeoLocation(
    val latitude: Double,
    val longitude: Double
)

/**
 * Content safety analysis result
 */
data class ContentSafetyResult(
    val adult: Float = 0.0f,        // 0.0 (safe) to 1.0 (explicit)
    val violence: Float = 0.0f,     // 0.0 (safe) to 1.0 (violent)
    val hate: Float = 0.0f,         // 0.0 (safe) to 1.0 (hateful)
    val harassment: Float = 0.0f,   // 0.0 (safe) to 1.0 (harassing)
    val selfHarm: Float = 0.0f,     // 0.0 (safe) to 1.0 (concerning)
    val sexualContent: Float = 0.0f // 0.0 (safe) to 1.0 (sexual)
)

/**
 * Content safety result with timestamp information
 */
data class TimestampedContentSafetyResult(
    val timestampMs: Long,
    val safetyResult: ContentSafetyResult
)

/**
 * Options for image analysis
 */
data class ImageAnalysisOptions(
    val generateDescription: Boolean = true,
    val detectObjects: Boolean = true,
    val detectFaces: Boolean = true,
    val recognizeText: Boolean = true,
    val detectLandmarks: Boolean = false,
    val detectLogos: Boolean = false,
    val checkContentSafety: Boolean = true,
    val extractMetadata: Boolean = true,
    val maxResults: Int = 20,
    val confidenceThreshold: Float = 0.6f
)

/**
 * Options for object detection
 */
data class ObjectDetectionOptions(
    val maxResults: Int = 20,
    val confidenceThreshold: Float = 0.6f,
    val modelType: ObjectDetectionModel = ObjectDetectionModel.STANDARD
)

/**
 * Options for text recognition
 */
data class TextRecognitionOptions(
    val languages: List<String> = emptyList(),
    val confidenceThreshold: Float = 0.5f,
    val detectHandwriting: Boolean = false
)

/**
 * Options for face detection
 */
data class FaceDetectionOptions(
    val detectLandmarks: Boolean = true,
    val detectEmotions: Boolean = true,
    val detectAgeGender: Boolean = true,
    val performRecognition: Boolean = false,
    val maxFaces: Int = 10,
    val confidenceThreshold: Float = 0.7f
)

/**
 * Options for image description generation
 */
data class DescriptionOptions(
    val maxLength: Int = 100,
    val preferredLanguage: String? = null,
    val includeObjects: Boolean = true,
    val includeActivities: Boolean = true,
    val includeAttributes: Boolean = true
)

/**
 * Options for video analysis
 */
data class VideoAnalysisOptions(
    val extractKeyFrames: Boolean = true,
    val keyFrameIntervalSeconds: Float = 5.0f,
    val generateDescription: Boolean = true,
    val detectScenes: Boolean = true,
    val trackObjects: Boolean = true,
    val trackPersons: Boolean = true,
    val recognizeSpeech: Boolean = false,
    val checkContentSafety: Boolean = true,
    val maxResults: Int = 20,
    val confidenceThreshold: Float = 0.6f
)

/**
 * Object detection model types
 */
enum class ObjectDetectionModel {
    STANDARD,      // General-purpose object detection
    FAST,          // Optimized for speed with some accuracy tradeoff
    ACCURATE,      // Optimized for accuracy with speed tradeoff
    SPECIALIZED    // Domain-specific models (e.g. medical, retail)
}

/**
 * Vision system capabilities
 */
enum class VisionCapability {
    OBJECT_DETECTION,
    TEXT_RECOGNITION,
    FACE_DETECTION,
    FACE_RECOGNITION,
    LANDMARK_DETECTION,
    LOGO_DETECTION,
    IMAGE_DESCRIPTION,
    CONTENT_SAFETY,
    EMOTION_DETECTION,
    ACTIVITY_RECOGNITION,
    SCENE_UNDERSTANDING,
    VIDEO_ANALYSIS,
    HANDWRITING_RECOGNITION,
    DOCUMENT_ANALYSIS
}

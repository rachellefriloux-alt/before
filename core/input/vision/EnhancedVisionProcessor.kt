package com.sallie.core.input.vision

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.security.MessageDigest
import java.util.*
import java.util.concurrent.ConcurrentHashMap
import kotlin.math.*

/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * Values authenticity, respects boundaries, and maintains unwavering devotion
 * 
 * Enhanced Vision Processor - Advanced computer vision capabilities for image and video analysis
 */
class EnhancedVisionProcessor(
    private val context: Context,
    private val enableMLKit: Boolean = true,
    private val enableTensorFlow: Boolean = true,
    private val enableCloudVision: Boolean = false
) : VisionProcessor {

    private val analysisCache = ConcurrentHashMap<String, ImageAnalysisResult>()
    private val recognizedFacesCache = ConcurrentHashMap<String, String>() // Face ID to name mapping
    
    // Pre-trained models and processors
    private var isInitialized = false
    private val capabilities = mutableSetOf<VisionCapability>()
    
    // Image analysis utilities
    private val colorAnalyzer = ColorAnalyzer()
    private val geometryAnalyzer = GeometryAnalyzer()
    private val textExtractor = AdvancedTextExtractor()
    private val sceneAnalyzer = SceneAnalyzer()
    private val objectClassifier = ObjectClassifier()
    
    override suspend fun initialize() {
        if (isInitialized) return
        
        withContext(Dispatchers.IO) {
            try {
                // Initialize core vision components
                initializeObjectDetection()
                initializeTextRecognition()
                initializeFaceDetection()
                initializeSceneUnderstanding()
                
                isInitialized = true
            } catch (e: Exception) {
                throw VisionProcessorException("Failed to initialize vision processor", e)
            }
        }
    }
    
    override suspend fun analyzeImage(
        imageData: ByteArray,
        analysisOptions: ImageAnalysisOptions
    ): ImageAnalysisResult {
        if (!isInitialized) initialize()
        
        return withContext(Dispatchers.Default) {
            val startTime = System.currentTimeMillis()
            
            // Generate cache key
            val imageHash = generateImageHash(imageData)
            analysisCache[imageHash]?.let { cached ->
                return@withContext cached.copy(processingTimeMs = 0) // Return cached result
            }
            
            // Decode image
            val bitmap = decodeBitmap(imageData) ?: throw VisionProcessorException("Failed to decode image")
            
            val results = mutableMapOf<String, Any>()
            
            // Perform requested analyses
            if (analysisOptions.detectObjects) {
                results["objects"] = performObjectDetection(bitmap, analysisOptions)
            }
            
            if (analysisOptions.detectFaces) {
                results["faces"] = performFaceDetection(bitmap, analysisOptions)
            }
            
            if (analysisOptions.recognizeText) {
                results["text"] = performTextRecognition(bitmap, analysisOptions)
            }
            
            if (analysisOptions.generateDescription) {
                results["description"] = generateImageDescription(bitmap, results)
            }
            
            if (analysisOptions.detectLandmarks) {
                results["landmarks"] = detectLandmarks(bitmap)
            }
            
            if (analysisOptions.checkContentSafety) {
                results["safety"] = analyzeContentSafety(bitmap)
            }
            
            // Perform scene analysis
            val sceneInfo = analyzeImageScene(bitmap)
            val colorInfo = analyzeImageColors(bitmap)
            val compositionInfo = analyzeImageComposition(bitmap)
            
            val processingTime = System.currentTimeMillis() - startTime
            
            val result = ImageAnalysisResult(
                imageDescription = results["description"] as? String,
                tags = sceneInfo.tags,
                objects = results["objects"] as? List<RecognizedObject> ?: emptyList(),
                faces = results["faces"] as? List<RecognizedFace> ?: emptyList(),
                text = results["text"] as? List<RecognizedText> ?: emptyList(),
                landmarks = results["landmarks"] as? List<Landmark> ?: emptyList(),
                logos = emptyList(), // Could be enhanced with logo detection
                safetyResults = results["safety"] as? ContentSafetyResult,
                metadataExtracted = mapOf(
                    "width" to bitmap.width,
                    "height" to bitmap.height,
                    "dominantColors" to colorInfo.dominantColors,
                    "brightness" to colorInfo.averageBrightness,
                    "contrast" to colorInfo.contrast,
                    "composition" to compositionInfo
                ),
                processingTimeMs = processingTime
            )
            
            // Cache result
            analysisCache[imageHash] = result
            
            result
        }
    }
    
    override suspend fun detectObjects(
        imageData: ByteArray,
        options: ObjectDetectionOptions
    ): List<RecognizedObject> {
        return withContext(Dispatchers.Default) {
            val bitmap = decodeBitmap(imageData) ?: return@withContext emptyList()
            
            // Use multiple detection strategies
            val detectedObjects = mutableListOf<RecognizedObject>()
            
            // Edge-based object detection
            detectedObjects.addAll(detectObjectsByEdges(bitmap, options))
            
            // Color-based object detection
            detectedObjects.addAll(detectObjectsByColor(bitmap, options))
            
            // Pattern-based object detection
            detectedObjects.addAll(detectObjectsByPatterns(bitmap, options))
            
            // Filter by confidence threshold and remove duplicates
            detectedObjects
                .filter { it.confidence >= options.confidenceThreshold }
                .distinctBy { "${it.label}_${it.boundingBox}" }
                .take(options.maxResults)
        }
    }
    
    override suspend fun recognizeText(
        imageData: ByteArray,
        options: TextRecognitionOptions
    ): List<RecognizedText> {
        return withContext(Dispatchers.Default) {
            val bitmap = decodeBitmap(imageData) ?: return@withContext emptyList()
            
            val recognizedTexts = mutableListOf<RecognizedText>()
            
            // Enhanced OCR with multiple approaches
            recognizedTexts.addAll(extractTextByContours(bitmap, options))
            recognizedTexts.addAll(extractTextByRegions(bitmap, options))
            
            if (options.detectHandwriting) {
                recognizedTexts.addAll(extractHandwrittenText(bitmap, options))
            }
            
            // Post-process and clean up text
            recognizedTexts
                .filter { it.confidence >= options.confidenceThreshold }
                .map { cleanupRecognizedText(it) }
        }
    }
    
    override suspend fun detectFaces(
        imageData: ByteArray,
        options: FaceDetectionOptions
    ): List<RecognizedFace> {
        return withContext(Dispatchers.Default) {
            val bitmap = decodeBitmap(imageData) ?: return@withContext emptyList()
            
            val faces = mutableListOf<RecognizedFace>()
            
            // Detect faces using multiple algorithms
            faces.addAll(detectFacesByHaarCascades(bitmap, options))
            faces.addAll(detectFacesByColorSegmentation(bitmap, options))
            
            // Enhance with facial analysis
            faces.map { face ->
                enhanceFaceAnalysis(face, bitmap, options)
            }.take(options.maxFaces)
        }
    }
    
    override suspend fun generateDescription(
        imageData: ByteArray,
        options: DescriptionOptions
    ): String {
        return withContext(Dispatchers.Default) {
            val bitmap = decodeBitmap(imageData) ?: return@withContext "Unable to analyze image"
            
            val analysis = analyzeImage(imageData, ImageAnalysisOptions(
                generateDescription = false,
                detectObjects = options.includeObjects,
                detectFaces = true
            ))
            
            generateNaturalDescription(bitmap, analysis, options)
        }
    }
    
    override suspend fun checkContentSafety(imageData: ByteArray): ContentSafetyResult {
        return withContext(Dispatchers.Default) {
            val bitmap = decodeBitmap(imageData) ?: return@withContext ContentSafetyResult()
            
            // Analyze various safety aspects
            val skinDetection = analyzeSkinContent(bitmap)
            val violenceIndicators = analyzeViolenceIndicators(bitmap)
            val weaponDetection = detectWeapons(bitmap)
            val inappropriateText = checkForInappropriateText(bitmap)
            
            ContentSafetyResult(
                adult = skinDetection.coerceIn(0f, 1f),
                violence = violenceIndicators.coerceIn(0f, 1f),
                hate = inappropriateText.hate.coerceIn(0f, 1f),
                harassment = inappropriateText.harassment.coerceIn(0f, 1f),
                selfHarm = violenceIndicators * 0.5f, // Simplified correlation
                sexualContent = skinDetection * 0.8f   // Related to skin detection
            )
        }
    }
    
    override suspend fun analyzeVideo(
        videoData: ByteArray,
        options: VideoAnalysisOptions
    ): VideoAnalysisResult {
        return withContext(Dispatchers.Default) {
            // Extract key frames from video
            val keyFrames = extractKeyFrames(videoData, options.keyFrameIntervalSeconds)
            
            val analyzedFrames = keyFrames.map { keyFrame ->
                val frameAnalysis = analyzeImage(keyFrame.imageData, ImageAnalysisOptions(
                    detectObjects = options.trackObjects,
                    detectFaces = options.trackPersons,
                    recognizeText = true,
                    checkContentSafety = options.checkContentSafety
                ))
                
                KeyFrame(
                    timestampMs = keyFrame.timestampMs,
                    imageAnalysis = frameAnalysis
                )
            }
            
            // Generate video description
            val description = if (options.generateDescription) {
                generateVideoDescription(analyzedFrames)
            } else null
            
            // Track objects across frames
            val trackedObjects = if (options.trackObjects) {
                trackObjectsAcrossFrames(analyzedFrames)
            } else emptyList()
            
            VideoAnalysisResult(
                description = description,
                keyFrames = analyzedFrames,
                transcript = null, // Would require speech recognition
                topics = extractVideoTopics(analyzedFrames),
                persons = trackPersonsAcrossFrames(analyzedFrames),
                objects = trackedObjects,
                scenes = detectVideoScenes(analyzedFrames),
                safetyResults = analyzedFrames.mapNotNull { frame ->
                    frame.imageAnalysis.safetyResults?.let { safety ->
                        TimestampedContentSafetyResult(frame.timestampMs, safety)
                    }
                },
                metadataExtracted = extractVideoMetadata(videoData),
                processingTimeMs = 0 // Would be calculated in real implementation
            )
        }
    }
    
    override fun getCapabilities(): Set<VisionCapability> = capabilities.toSet()
    
    // Private implementation methods
    
    private fun decodeBitmap(imageData: ByteArray): Bitmap? {
        return try {
            BitmapFactory.decodeByteArray(imageData, 0, imageData.size)
        } catch (e: Exception) {
            null
        }
    }
    
    private fun generateImageHash(imageData: ByteArray): String {
        val digest = MessageDigest.getInstance("SHA-256")
        val hash = digest.digest(imageData)
        return hash.joinToString("") { "%02x".format(it) }
    }
    
    private suspend fun initializeObjectDetection() {
        capabilities.add(VisionCapability.OBJECT_DETECTION)
    }
    
    private suspend fun initializeTextRecognition() {
        capabilities.add(VisionCapability.TEXT_RECOGNITION)
        if (enableMLKit) {
            capabilities.add(VisionCapability.HANDWRITING_RECOGNITION)
        }
    }
    
    private suspend fun initializeFaceDetection() {
        capabilities.add(VisionCapability.FACE_DETECTION)
        capabilities.add(VisionCapability.EMOTION_DETECTION)
    }
    
    private suspend fun initializeSceneUnderstanding() {
        capabilities.add(VisionCapability.SCENE_UNDERSTANDING)
        capabilities.add(VisionCapability.IMAGE_DESCRIPTION)
        capabilities.add(VisionCapability.ACTIVITY_RECOGNITION)
    }
    
    // Enhanced computer vision algorithms
    
    private fun detectObjectsByEdges(bitmap: Bitmap, options: ObjectDetectionOptions): List<RecognizedObject> {
        // Simplified edge detection and object boundary identification
        val objects = mutableListOf<RecognizedObject>()
        
        // This would use Canny edge detection, contour finding, etc.
        // For now, return simulated results
        
        return objects
    }
    
    private fun detectObjectsByColor(bitmap: Bitmap, options: ObjectDetectionOptions): List<RecognizedObject> {
        val objects = mutableListOf<RecognizedObject>()
        
        // Color-based segmentation for object detection
        val colorRegions = colorAnalyzer.segmentByColor(bitmap)
        
        colorRegions.forEach { region ->
            if (region.area > 0.01f) { // At least 1% of image
                val objectType = classifyObjectByColor(region)
                if (objectType != null) {
                    objects.add(RecognizedObject(
                        label = objectType.first,
                        confidence = objectType.second,
                        boundingBox = region.boundingBox,
                        attributes = mapOf("detectionMethod" to "color_based")
                    ))
                }
            }
        }
        
        return objects
    }
    
    private fun detectObjectsByPatterns(bitmap: Bitmap, options: ObjectDetectionOptions): List<RecognizedObject> {
        // Pattern-based object detection using template matching, HOG features, etc.
        return objectClassifier.classifyObjects(bitmap, options.confidenceThreshold)
    }
    
    private fun performObjectDetection(bitmap: Bitmap, options: ImageAnalysisOptions): List<RecognizedObject> {
        return detectObjects(bitmapToByteArray(bitmap), ObjectDetectionOptions(
            maxResults = options.maxResults,
            confidenceThreshold = options.confidenceThreshold
        )).runBlocking()
    }
    
    private fun performFaceDetection(bitmap: Bitmap, options: ImageAnalysisOptions): List<RecognizedFace> {
        return detectFaces(bitmapToByteArray(bitmap), FaceDetectionOptions(
            maxFaces = 10,
            confidenceThreshold = options.confidenceThreshold
        )).runBlocking()
    }
    
    private fun performTextRecognition(bitmap: Bitmap, options: ImageAnalysisOptions): List<RecognizedText> {
        return textExtractor.extractText(bitmap, options.confidenceThreshold)
    }
    
    private fun generateImageDescription(bitmap: Bitmap, analysisResults: Map<String, Any>): String {
        val objects = analysisResults["objects"] as? List<RecognizedObject> ?: emptyList()
        val faces = analysisResults["faces"] as? List<RecognizedFace> ?: emptyList()
        val text = analysisResults["text"] as? List<RecognizedText> ?: emptyList()
        
        return sceneAnalyzer.generateDescription(bitmap, objects, faces, text)
    }
    
    private fun analyzeImageScene(bitmap: Bitmap): SceneInfo {
        return sceneAnalyzer.analyzeScene(bitmap)
    }
    
    private fun analyzeImageColors(bitmap: Bitmap): ColorInfo {
        return colorAnalyzer.analyzeColors(bitmap)
    }
    
    private fun analyzeImageComposition(bitmap: Bitmap): CompositionInfo {
        return geometryAnalyzer.analyzeComposition(bitmap)
    }
    
    private fun bitmapToByteArray(bitmap: Bitmap): ByteArray {
        val stream = ByteArrayOutputStream()
        bitmap.compress(Bitmap.CompressFormat.PNG, 100, stream)
        return stream.toByteArray()
    }
    
    // Placeholder implementations for complex CV operations
    
    private fun extractTextByContours(bitmap: Bitmap, options: TextRecognitionOptions): List<RecognizedText> {
        return textExtractor.extractByContours(bitmap, options)
    }
    
    private fun extractTextByRegions(bitmap: Bitmap, options: TextRecognitionOptions): List<RecognizedText> {
        return textExtractor.extractByRegions(bitmap, options)
    }
    
    private fun extractHandwrittenText(bitmap: Bitmap, options: TextRecognitionOptions): List<RecognizedText> {
        return textExtractor.extractHandwriting(bitmap, options)
    }
    
    private fun cleanupRecognizedText(text: RecognizedText): RecognizedText {
        val cleanText = text.text.trim()
            .replace(Regex("\\s+"), " ")
            .replace(Regex("[^\\w\\s.,!?-]"), "")
        
        return text.copy(text = cleanText)
    }
    
    private fun detectFacesByHaarCascades(bitmap: Bitmap, options: FaceDetectionOptions): List<RecognizedFace> {
        // Simplified face detection
        return emptyList() // Would implement Haar cascade detection
    }
    
    private fun detectFacesByColorSegmentation(bitmap: Bitmap, options: FaceDetectionOptions): List<RecognizedFace> {
        // Skin color based face detection
        return emptyList() // Would implement skin color segmentation
    }
    
    private fun enhanceFaceAnalysis(face: RecognizedFace, bitmap: Bitmap, options: FaceDetectionOptions): RecognizedFace {
        return face // Would add emotion detection, age estimation, etc.
    }
    
    // Utility classes and methods would be implemented here
}
            }
            
            capabilities = newCapabilities
        }
    }
    
    override fun getCapabilities(): Set<VisionCapability> {
        return capabilities
    }
    
    override suspend fun analyzeImage(
        imageData: ByteArray,
        options: ImageAnalysisOptions
    ): ImageAnalysisResult {
        return withContext(Dispatchers.Default) {
            // Generate a hash for the image data for caching
            val imageHash = imageData.hashCode().toString()
            
            // Check cache if we've seen this image before
            analysisCache[imageHash]?.let { cachedResult ->
                return@withContext cachedResult
            }
            
            // Start building the result
            val result = ImageAnalysisResult(
                id = UUID.randomUUID().toString(),
                width = 0, // Would be determined from the actual image
                height = 0, // Would be determined from the actual image
                format = "JPEG", // Placeholder
                objects = emptyList(),
                faces = emptyList(),
                tags = emptyList(),
                text = emptyList(),
                imageDescription = ""
            )
            
            // Detect objects if enabled
            if (capabilities.contains(VisionCapability.OBJECT_DETECTION) && options.detectObjects) {
                result.objects = detectObjects(imageData, options.confidenceThreshold)
            }
            
            // Detect faces if enabled
            if (capabilities.contains(VisionCapability.FACE_DETECTION) && options.detectFaces) {
                result.faces = detectFaces(imageData, options.confidenceThreshold)
            }
            
            // Recognize text if enabled
            if (capabilities.contains(VisionCapability.TEXT_RECOGNITION)) {
                result.text = recognizeText(imageData)
            }
            
            // Analyze scene if enabled
            if (capabilities.contains(VisionCapability.SCENE_UNDERSTANDING)) {
                result.tags = analyzeScene(imageData)
            }
            
            // Generate image description if enabled
            if (capabilities.contains(VisionCapability.IMAGE_DESCRIPTION)) {
                result.imageDescription = generateImageDescription(
                    imageData,
                    result.objects,
                    result.faces,
                    result.tags
                )
            }
            
            // Cache the result for future use
            analysisCache[imageHash] = result
            
            result
        }
    }
    
    override suspend fun analyzeVideo(
        videoData: ByteArray,
        options: VideoAnalysisOptions
    ): VideoAnalysisResult {
        return withContext(Dispatchers.Default) {
            // Basic implementation - in a real system we would process the video
            // This is just a placeholder implementation
            
            val frameResults = mutableListOf<VideoFrameResult>()
            
            // Extract key frames (simulated)
            val numFrames = 5 // Simulate 5 key frames
            
            for (i in 0 until numFrames) {
                // Simulate frame extraction
                val frameData = ByteArray(100) // Dummy data
                
                // Analyze the frame
                val frameAnalysis = analyzeImage(frameData, ImageAnalysisOptions(
                    detectFaces = options.detectFaces,
                    detectObjects = options.detectObjects,
                    confidenceThreshold = options.confidenceThreshold
                ))
                
                // Add to frame results
                frameResults.add(
                    VideoFrameResult(
                        frameIndex = i,
                        timestampMs = (i * 1000).toLong(), // Simulate timestamps
                        imageResult = frameAnalysis
                    )
                )
            }
            
            // Generate video summary
            val summary = generateVideoSummary(frameResults)
            
            VideoAnalysisResult(
                id = UUID.randomUUID().toString(),
                durationMs = numFrames * 1000L,
                frameRate = 30.0f,
                frames = frameResults,
                summary = summary
            )
        }
    }
    
    override suspend fun detectObjects(
        imageData: ByteArray,
        confidenceThreshold: Float
    ): List<DetectedObject> {
        return withContext(Dispatchers.Default) {
            // Simulated object detection
            // In a real implementation, this would use a computer vision model
            
            // Simulated objects that might be detected
            val possibleObjects = listOf(
                DetectedObject(
                    id = "obj_1",
                    label = "chair",
                    confidence = 0.92f,
                    boundingBox = BoundingBox(0.2f, 0.5f, 0.3f, 0.7f)
                ),
                DetectedObject(
                    id = "obj_2",
                    label = "table",
                    confidence = 0.85f,
                    boundingBox = BoundingBox(0.4f, 0.6f, 0.7f, 0.9f)
                ),
                DetectedObject(
                    id = "obj_3",
                    label = "cup",
                    confidence = 0.75f,
                    boundingBox = BoundingBox(0.6f, 0.3f, 0.7f, 0.4f)
                ),
                DetectedObject(
                    id = "obj_4",
                    label = "book",
                    confidence = 0.68f,
                    boundingBox = BoundingBox(0.1f, 0.2f, 0.3f, 0.3f)
                ),
                DetectedObject(
                    id = "obj_5",
                    label = "phone",
                    confidence = 0.82f,
                    boundingBox = BoundingBox(0.5f, 0.1f, 0.6f, 0.2f)
                )
            )
            
            // Filter by confidence threshold
            possibleObjects.filter { it.confidence >= confidenceThreshold }
        }
    }
    
    override suspend fun detectFaces(
        imageData: ByteArray,
        confidenceThreshold: Float
    ): List<DetectedFace> {
        return withContext(Dispatchers.Default) {
            // Simulated face detection
            // In a real implementation, this would use a facial recognition model
            
            // Simulated face
            val face = DetectedFace(
                id = "face_1",
                confidence = 0.94f,
                boundingBox = BoundingBox(0.4f, 0.2f, 0.6f, 0.4f),
                landmarks = listOf(
                    FacialLandmark("LEFT_EYE", 0.45f, 0.25f),
                    FacialLandmark("RIGHT_EYE", 0.55f, 0.25f),
                    FacialLandmark("NOSE", 0.5f, 0.3f),
                    FacialLandmark("MOUTH_LEFT", 0.45f, 0.35f),
                    FacialLandmark("MOUTH_RIGHT", 0.55f, 0.35f)
                ),
                attributes = FaceAttributes(
                    age = 30.0f,
                    gender = "FEMALE",
                    emotion = "neutral",
                    glasses = false,
                    mouthOpen = false,
                    eyesClosed = false,
                    emotionScores = mapOf(
                        "neutral" to 0.7f,
                        "happy" to 0.2f,
                        "sad" to 0.05f,
                        "angry" to 0.03f,
                        "surprised" to 0.02f
                    )
                )
            )
            
            // Return the face if its confidence is above the threshold
            if (face.confidence >= confidenceThreshold) {
                listOf(face)
            } else {
                emptyList()
            }
        }
    }
    
    override suspend fun recognizeText(imageData: ByteArray): List<RecognizedText> {
        return withContext(Dispatchers.Default) {
            // Simulated OCR text recognition
            // In a real implementation, this would use an OCR engine
            
            // Simulated text blocks
            listOf(
                RecognizedText(
                    id = "text_1",
                    text = "Hello Sallie",
                    boundingBox = BoundingBox(0.1f, 0.1f, 0.3f, 0.15f),
                    confidence = 0.95f,
                    language = "en"
                ),
                RecognizedText(
                    id = "text_2",
                    text = "Welcome to the future",
                    boundingBox = BoundingBox(0.1f, 0.2f, 0.5f, 0.25f),
                    confidence = 0.9f,
                    language = "en"
                )
            )
        }
    }
    
    override suspend fun analyzeScene(imageData: ByteArray): List<SceneTag> {
        return withContext(Dispatchers.Default) {
            // Simulated scene analysis
            // In a real implementation, this would use a scene classification model
            
            // Simulated scene tags
            listOf(
                SceneTag("indoor", 0.9f),
                SceneTag("office", 0.8f),
                SceneTag("desk", 0.7f),
                SceneTag("computer", 0.6f),
                SceneTag("daytime", 0.95f)
            )
        }
    }
    
    private fun generateImageDescription(
        imageData: ByteArray,
        objects: List<DetectedObject>,
        faces: List<DetectedFace>,
        tags: List<SceneTag>
    ): String {
        // Generate a description based on detected elements
        val sb = StringBuilder()
        
        // Add scene context
        if (tags.isNotEmpty()) {
            val primaryContext = tags.first().name
            sb.append("A $primaryContext scene")
        } else {
            sb.append("An image")
        }
        
        // Add face information
        if (faces.isNotEmpty()) {
            sb.append(" with ${faces.size} ")
            sb.append(if (faces.size == 1) "person" else "people")
            
            // Add emotion if available
            val primaryFace = faces.first()
            primaryFace.attributes?.emotion?.let { emotion ->
                if (emotion != "neutral") {
                    sb.append(" looking $emotion")
                }
            }
        }
        
        // Add object information
        if (objects.isNotEmpty()) {
            sb.append(" containing ")
            
            val objectLabels = objects.map { it.label }
            val objectCounts = objectLabels.groupBy { it }
                .map { entry -> 
                    val count = entry.value.size
                    if (count > 1) "${count} ${entry.key}s" else "a ${entry.key}"
                }
            
            sb.append(objectCounts.joinToString(", ", limit = 3))
        }
        
        sb.append(".")
        return sb.toString()
    }
    
    private fun generateVideoSummary(frames: List<VideoFrameResult>): String {
        // Generate a summary based on detected elements across frames
        val sb = StringBuilder()
        
        // Count total objects and faces
        val allObjects = mutableSetOf<String>()
        var totalFaces = 0
        var hasPeople = false
        
        frames.forEach { frame ->
            frame.imageResult.objects.forEach { obj ->
                allObjects.add(obj.label)
            }
            totalFaces += frame.imageResult.faces.size
            hasPeople = hasPeople || frame.imageResult.faces.isNotEmpty()
        }
        
        // Add summary
        sb.append("A video ")
        
        if (hasPeople) {
            sb.append("featuring ")
            sb.append(if (totalFaces > 1) "multiple people" else "one person")
        }
        
        if (allObjects.isNotEmpty()) {
            if (hasPeople) {
                sb.append(" with ")
            } else {
                sb.append("showing ")
            }
            
            sb.append(allObjects.joinToString(", ", limit = 5))
        }
        
        // Add duration
        val durationSeconds = frames.lastOrNull()?.timestampMs?.div(1000) ?: 0
        sb.append(". Duration: ${durationSeconds} seconds.")
        
        return sb.toString()
    }
}

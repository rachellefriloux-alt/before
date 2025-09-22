package com.sallie.core.input

import com.sallie.core.input.speech.SpeechProcessor
import com.sallie.core.input.vision.VisionProcessor
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.time.Instant
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.CopyOnWriteArrayList

/**
 * Sallie's Multimodal Input Processing System Implementation
 * 
 * This class provides a comprehensive implementation of the MultimodalInputProcessor
 * interface, integrating the various input processors (speech, vision, text)
 * and providing a unified API for processing multimodal inputs.
 */
class EnhancedMultimodalInputProcessor(
    private val scope: CoroutineScope,
    private val speechProcessor: SpeechProcessor,
    private val visionProcessor: com.sallie.core.input.vision.VisionProcessor,
    private val textAnalysisProcessor: TextAnalysisProcessor,
    private val nlpEngine: com.sallie.ai.nlpEngine
) : MultimodalInputProcessor {

    private val listeners = CopyOnWriteArrayList<InputListener>()
    private var preprocessingOptions = InputPreprocessingOptions()
    
    // Context tracking
    private val contextTracker = ConcurrentHashMap<String, InputContext>()
    
    // Input capabilities
    private var capabilities: Set<InputCapability> = emptySet()
    
    override suspend fun initialize() {
        try {
            // Initialize the individual processors
            withContext(Dispatchers.IO) {
                speechProcessor.initialize()
                visionProcessor.initialize()
            }
            
            // Determine capabilities based on underlying processors
            val newCapabilities = mutableSetOf<InputCapability>()
            
            // Map speech capabilities
            val speechCapabilities = speechProcessor.getCapabilities()
            if (speechCapabilities.contains(com.sallie.core.input.speech.SpeechCapability.SPEECH_RECOGNITION)) {
                newCapabilities.add(InputCapability.SPEECH_RECOGNITION)
            }
            if (speechCapabilities.contains(com.sallie.core.input.speech.SpeechCapability.EMOTION_DETECTION)) {
                newCapabilities.add(InputCapability.EMOTION_RECOGNITION)
            }
            
            // Map vision capabilities
            val visionCapabilities = visionProcessor.getCapabilities()
            if (visionCapabilities.contains(com.sallie.core.input.vision.VisionCapability.OBJECT_DETECTION)) {
                newCapabilities.add(InputCapability.OBJECT_DETECTION)
            }
            if (visionCapabilities.contains(com.sallie.core.input.vision.VisionCapability.FACE_DETECTION)) {
                newCapabilities.add(InputCapability.FACE_RECOGNITION)
            }
            if (visionCapabilities.contains(com.sallie.core.input.vision.VisionCapability.TEXT_RECOGNITION)) {
                newCapabilities.add(InputCapability.OCR_TEXT_RECOGNITION)
            }
            if (visionCapabilities.contains(com.sallie.core.input.vision.VisionCapability.IMAGE_DESCRIPTION)) {
                newCapabilities.add(InputCapability.IMAGE_UNDERSTANDING)
            }
            if (visionCapabilities.contains(com.sallie.core.input.vision.VisionCapability.SCENE_UNDERSTANDING)) {
                newCapabilities.add(InputCapability.SCENE_UNDERSTANDING)
            }
            
            // Additional capabilities
            newCapabilities.add(InputCapability.SENTIMENT_ANALYSIS)
            newCapabilities.add(InputCapability.ENTITY_EXTRACTION)
            newCapabilities.add(InputCapability.INTENT_DETECTION)
            newCapabilities.add(InputCapability.LANGUAGE_DETECTION)
            
            // If we have multiple modalities, add fusion capability
            if (newCapabilities.size > 2) {
                newCapabilities.add(InputCapability.MULTIMODAL_FUSION)
            }
            
            capabilities = newCapabilities
            
        } catch (e: Exception) {
            throw InputProcessingException("Failed to initialize multimodal input processor", e)
        }
    }
    
    override fun processTextInput(text: String, contextId: String?): Flow<ProcessedInput> = flow {
        try {
            // Notify listeners that processing has started
            val effectiveContextId = contextId ?: generateContextId()
            notifyProcessingStarted(InputType.TEXT, effectiveContextId)
            
            // Get or create context
            val context = getOrCreateContext(effectiveContextId)
            
            // Preprocess the text if needed
            val processedText = if (preprocessingOptions.normalizeText) {
                preprocessText(text)
            } else {
                text
            }
            
            // Create basic text content
            val textContent = TextContent(
                text = processedText,
                isPartial = false
            )
            
            // Create basic processed input
            val initialProcessedInput = createProcessedInput(
                inputType = InputType.TEXT,
                contextId = effectiveContextId,
                textContent = textContent
            )
            
            // Emit initial processed input
            emit(initialProcessedInput)
            
            // Perform semantic analysis
            val semanticAnalysis = performSemanticAnalysis(processedText, context)
            
            // Create final processed input with semantic analysis
            val finalProcessedInput = initialProcessedInput.copy(
                semanticAnalysis = semanticAnalysis,
                confidence = calculateConfidence(textContent, semanticAnalysis)
            )
            
            // Update context with new input
            context.addInput(finalProcessedInput)
            
            // Emit final processed input
            emit(finalProcessedInput)
            
            // Notify listeners that processing is complete
            notifyProcessingComplete(finalProcessedInput)
            
        } catch (e: Exception) {
            val error = InputProcessingError(
                code = "TEXT_PROCESSING_ERROR",
                message = "Error processing text input: ${e.message}",
                severity = ErrorSeverity.ERROR
            )
            
            notifyProcessingError(InputType.TEXT, error, contextId)
            throw InputProcessingException("Failed to process text input", e)
        }
    }
    
    override fun processVoiceInput(
        audioData: ByteArray, 
        languageHint: String?,
        contextId: String?
    ): Flow<ProcessedInput> = flow {
        try {
            // Notify listeners that processing has started
            val effectiveContextId = contextId ?: generateContextId()
            notifyProcessingStarted(InputType.VOICE, effectiveContextId)
            
            // Get or create context
            val context = getOrCreateContext(effectiveContextId)
            
            // Configure speech recognition options
            val speechOptions = com.sallie.core.input.speech.SpeechRecognitionOptions(
                language = languageHint,
                enableAutomaticPunctuation = true,
                enableSpeakerDiarization = preprocessingOptions.speakerDiarization,
                profanityFilter = preprocessingOptions.contentFiltering,
                noiseHandling = if (preprocessingOptions.noiseReduction) {
                    com.sallie.core.input.speech.NoiseHandlingMode.MEDIUM
                } else {
                    com.sallie.core.input.speech.NoiseHandlingMode.OFF
                }
            )
            
            // Perform speech recognition
            val speechResult = speechProcessor.recognizeSpeech(audioData, speechOptions)
            
            // Create voice content
            val voiceContent = VoiceContent(
                transcript = speechResult.transcript,
                language = speechResult.languageDetected,
                isPartial = false,
                confidenceScore = speechResult.confidence,
                segments = speechResult.segments.map { segment ->
                    VoiceSegment(
                        text = segment.text,
                        startTimeMs = segment.startTimeMs,
                        endTimeMs = segment.endTimeMs,
                        confidence = segment.confidence,
                        speakerId = segment.speakerId
                    )
                }
            )
            
            // Create basic processed input
            val initialProcessedInput = createProcessedInput(
                inputType = InputType.VOICE,
                contextId = effectiveContextId,
                voiceContent = voiceContent
            )
            
            // Emit initial processed input
            emit(initialProcessedInput)
            
            // Analyze voice for emotional tone if available
            val emotionDetection = if (capabilities.contains(InputCapability.EMOTION_RECOGNITION)) {
                try {
                    speechProcessor.detectEmotions(audioData)
                } catch (e: Exception) {
                    null
                }
            } else {
                null
            }
            
            // Update voice content with emotional tone
            val updatedVoiceContent = voiceContent.copy(
                emotionalTone = emotionDetection?.dominantEmotion,
                audioFeatures = emotionDetection?.let { emotion ->
                    AudioFeatures(
                        emotionScores = emotion.emotions
                    )
                }
            )
            
            // Perform semantic analysis on the transcript
            val semanticAnalysis = performSemanticAnalysis(speechResult.transcript, context)
            
            // Create intermediate processed input with emotional tone
            val intermediateProcessedInput = initialProcessedInput.copy(
                voiceContent = updatedVoiceContent,
                semanticAnalysis = semanticAnalysis,
                confidence = calculateConfidence(voiceContent, semanticAnalysis)
            )
            
            // Emit intermediate processed input
            emit(intermediateProcessedInput)
            
            // Perform voice analysis if needed
            val voiceAnalysis = try {
                speechProcessor.analyzeVoice(audioData)
            } catch (e: Exception) {
                null
            }
            
            // Update voice content with voice analysis
            val finalVoiceContent = updatedVoiceContent.copy(
                audioFeatures = voiceAnalysis?.let { analysis ->
                    AudioFeatures(
                        volume = analysis.volume?.meanDb ?: 0.0f,
                        pitch = analysis.pitch?.meanHz ?: 0.0f,
                        speechRate = analysis.speechRate?.wordsPerMinute ?: 0.0f,
                        emotionScores = emotionDetection?.emotions ?: emptyMap(),
                        voiceCharacteristics = mapOf(
                            "breathiness" to (analysis.voiceQuality?.breathiness ?: 0.0f),
                            "hoarseness" to (analysis.voiceQuality?.hoarseness ?: 0.0f),
                            "clarity" to (analysis.voiceQuality?.clarity ?: 0.0f)
                        )
                    )
                } ?: updatedVoiceContent.audioFeatures
            )
            
            // Create final processed input with voice analysis
            val finalProcessedInput = intermediateProcessedInput.copy(
                voiceContent = finalVoiceContent,
                confidence = calculateConfidence(finalVoiceContent, semanticAnalysis)
            )
            
            // Update context with new input
            context.addInput(finalProcessedInput)
            
            // Emit final processed input
            emit(finalProcessedInput)
            
            // Notify listeners that processing is complete
            notifyProcessingComplete(finalProcessedInput)
            
        } catch (e: Exception) {
            val error = InputProcessingError(
                code = "VOICE_PROCESSING_ERROR",
                message = "Error processing voice input: ${e.message}",
                severity = ErrorSeverity.ERROR
            )
            
            notifyProcessingError(InputType.VOICE, error, contextId)
            throw InputProcessingException("Failed to process voice input", e)
        }
    }
    
    override fun processImageInput(imageData: ByteArray, contextId: String?): Flow<ProcessedInput> = flow {
        try {
            // Notify listeners that processing has started
            val effectiveContextId = contextId ?: generateContextId()
            notifyProcessingStarted(InputType.IMAGE, effectiveContextId)
            
            // Get or create context
            val context = getOrCreateContext(effectiveContextId)
            
            // Configure image analysis options
            val imageOptions = com.sallie.core.input.vision.ImageAnalysisOptions(
                detectFaces = preprocessingOptions.faceDetection,
                detectObjects = preprocessingOptions.objectDetection,
                confidenceThreshold = preprocessingOptions.confidenceThreshold
            )
            
            // Analyze the image
            val imageAnalysis = visionProcessor.analyzeImage(imageData, imageOptions)
            
            // Create image content
            val imageContent = ImageContent(
                description = imageAnalysis.imageDescription,
                analysisResult = imageAnalysis,
                recognizedObjects = imageAnalysis.objects,
                recognizedFaces = imageAnalysis.faces,
                recognizedText = imageAnalysis.text,
                sceneLabels = imageAnalysis.tags.map { tag ->
                    SceneLabel(tag.name, tag.confidence)
                }
            )
            
            // Create basic processed input
            val initialProcessedInput = createProcessedInput(
                inputType = InputType.IMAGE,
                contextId = effectiveContextId,
                imageContent = imageContent
            )
            
            // Emit initial processed input
            emit(initialProcessedInput)
            
            // Extract text from image for semantic analysis if available
            val extractedText = imageAnalysis.text.joinToString(" ") { it.text }
            
            // Perform semantic analysis on extracted text if it's substantial
            val semanticAnalysis = if (extractedText.length > 10) {
                performSemanticAnalysis(extractedText, context)
            } else {
                null
            }
            
            // Create final processed input with semantic analysis
            val finalProcessedInput = initialProcessedInput.copy(
                semanticAnalysis = semanticAnalysis,
                confidence = calculateConfidence(imageContent, semanticAnalysis)
            )
            
            // Update context with new input
            context.addInput(finalProcessedInput)
            
            // Emit final processed input
            emit(finalProcessedInput)
            
            // Notify listeners that processing is complete
            notifyProcessingComplete(finalProcessedInput)
            
        } catch (e: Exception) {
            val error = InputProcessingError(
                code = "IMAGE_PROCESSING_ERROR",
                message = "Error processing image input: ${e.message}",
                severity = ErrorSeverity.ERROR
            )
            
            notifyProcessingError(InputType.IMAGE, error, contextId)
            throw InputProcessingException("Failed to process image input", e)
        }
    }
    
    override fun processMultimodalInput(
        inputs: Map<InputType, ByteArray>,
        contextId: String?
    ): Flow<ProcessedInput> = flow {
        try {
            // Validate that we have at least one input
            if (inputs.isEmpty()) {
                throw IllegalArgumentException("No inputs provided for multimodal processing")
            }
            
            // Notify listeners that processing has started
            val effectiveContextId = contextId ?: generateContextId()
            
            // Choose primary input type for notifications (prefer TEXT > VOICE > IMAGE)
            val primaryInputType = when {
                inputs.containsKey(InputType.TEXT) -> InputType.TEXT
                inputs.containsKey(InputType.VOICE) -> InputType.VOICE
                inputs.containsKey(InputType.IMAGE) -> InputType.IMAGE
                else -> inputs.keys.first()
            }
            
            notifyProcessingStarted(primaryInputType, effectiveContextId)
            
            // Get or create context
            val context = getOrCreateContext(effectiveContextId)
            
            // Process each input individually
            val processedInputs = mutableMapOf<InputType, ProcessedInput>()
            
            // Track the last emitted fusion result
            var lastFusionResult: ProcessedInput? = null
            
            // Process text input if available
            inputs[InputType.TEXT]?.let { textData ->
                val text = String(textData, Charsets.UTF_8)
                processTextInput(text, effectiveContextId).collect { processedText ->
                    processedInputs[InputType.TEXT] = processedText
                    
                    // Emit fusion result after each update
                    val fusionResult = fuseInputs(processedInputs, effectiveContextId)
                    if (fusionResult != lastFusionResult) {
                        emit(fusionResult)
                        lastFusionResult = fusionResult
                    }
                }
            }
            
            // Process voice input if available
            inputs[InputType.VOICE]?.let { voiceData ->
                processVoiceInput(voiceData, null, effectiveContextId).collect { processedVoice ->
                    processedInputs[InputType.VOICE] = processedVoice
                    
                    // Emit fusion result after each update
                    val fusionResult = fuseInputs(processedInputs, effectiveContextId)
                    if (fusionResult != lastFusionResult) {
                        emit(fusionResult)
                        lastFusionResult = fusionResult
                    }
                }
            }
            
            // Process image input if available
            inputs[InputType.IMAGE]?.let { imageData ->
                processImageInput(imageData, effectiveContextId).collect { processedImage ->
                    processedInputs[InputType.IMAGE] = processedImage
                    
                    // Emit fusion result after each update
                    val fusionResult = fuseInputs(processedInputs, effectiveContextId)
                    if (fusionResult != lastFusionResult) {
                        emit(fusionResult)
                        lastFusionResult = fusionResult
                    }
                }
            }
            
            // Final fusion result
            val finalFusionResult = fuseInputs(processedInputs, effectiveContextId)
            
            // Update context with new input
            context.addInput(finalFusionResult)
            
            // Emit final fusion result if it hasn't been emitted yet
            if (finalFusionResult != lastFusionResult) {
                emit(finalFusionResult)
            }
            
            // Notify listeners that processing is complete
            notifyProcessingComplete(finalFusionResult)
            
        } catch (e: Exception) {
            val inputType = inputs.keys.firstOrNull() ?: InputType.TEXT
            
            val error = InputProcessingError(
                code = "MULTIMODAL_PROCESSING_ERROR",
                message = "Error processing multimodal input: ${e.message}",
                severity = ErrorSeverity.ERROR
            )
            
            notifyProcessingError(inputType, error, contextId)
            throw InputProcessingException("Failed to process multimodal input", e)
        }
    }
    
    override fun getCapabilities(): Set<InputCapability> {
        return capabilities
    }
    
    override fun registerInputListener(listener: InputListener) {
        listeners.add(listener)
    }
    
    override fun unregisterInputListener(listener: InputListener) {
        listeners.remove(listener)
    }
    
    override fun setPreprocessingOptions(options: InputPreprocessingOptions) {
        this.preprocessingOptions = options
    }
    
    override fun getPreprocessingOptions(): InputPreprocessingOptions {
        return preprocessingOptions
    }
    
    /**
     * Preprocess text input based on preprocessing options
     */
    private fun preprocessText(text: String): String {
        var result = text
        
        // Apply preprocessing options
        if (preprocessingOptions.correctTypos) {
            result = correctTypos(result)
        }
        
        if (preprocessingOptions.expandAbbreviations) {
            result = expandAbbreviations(result)
        }
        
        if (preprocessingOptions.removeDiacritics) {
            result = removeDiacritics(result)
        }
        
        return result
    }
    
    /**
     * Simple typo correction
     */
    private fun correctTypos(text: String): String {
        // This would be a more complex implementation in production
        // Using a simple placeholder implementation for now
        return text.replace(" teh ", " the ")
            .replace(" adn ", " and ")
            .replace(" fo ", " of ")
            .replace(" te ", " the ")
    }
    
    /**
     * Expand common abbreviations
     */
    private fun expandAbbreviations(text: String): String {
        // This would be a more complex implementation in production
        // Using a simple placeholder implementation for now
        return text.replace(" btw ", " by the way ")
            .replace(" imo ", " in my opinion ")
            .replace(" afaik ", " as far as I know ")
            .replace(" b/c ", " because ")
    }
    
    /**
     * Remove diacritical marks from text
     */
    private fun removeDiacritics(text: String): String {
        // This would be a more complex implementation in production
        // Using a simple placeholder implementation for now
        return text.replace('é', 'e')
            .replace('è', 'e')
            .replace('ê', 'e')
            .replace('ë', 'e')
            .replace('à', 'a')
            .replace('á', 'a')
            .replace('ä', 'a')
    }
    
    /**
     * Perform semantic analysis on text
     */
    private suspend fun performSemanticAnalysis(text: String, context: InputContext): SemanticAnalysis {
        // Extract intent
        val intent = extractIntent(text, context)
        
        // Extract entities
        val entities = extractEntities(text)
        
        // Analyze sentiment
        val sentiment = analyzeSentiment(text)
        
        // Extract topics
        val topics = extractTopics(text)
        
        return SemanticAnalysis(
            intent = intent,
            entities = entities,
            sentiment = sentiment,
            topics = topics,
            emotions = mapOf(), // Would be populated in a full implementation
            urgency = calculateUrgency(text, intent),
            importance = calculateImportance(text, intent, entities)
        )
    }
    
    /**
     * Extract intent from text
     */
    private suspend fun extractIntent(text: String, context: InputContext): Intent? {
        // Use the NLP engine to extract intent
        return try {
            val intentResult = nlpEngine.extractIntent(text)
            
            // Map NLP engine result to our model
            Intent(
                name = intentResult.action,
                confidence = intentResult.confidence ?: 0.7f,
                parameters = intentResult.parameters ?: emptyMap()
            )
        } catch (e: Exception) {
            null
        }
    }
    
    /**
     * Extract entities from text
     */
    private suspend fun extractEntities(text: String): List<Entity> {
        // Use text analysis processor to extract entities
        return try {
            textAnalysisProcessor.extractEntities(text)
        } catch (e: Exception) {
            emptyList()
        }
    }
    
    /**
     * Analyze sentiment in text
     */
    private suspend fun analyzeSentiment(text: String): Sentiment? {
        // Use text analysis processor to analyze sentiment
        return try {
            textAnalysisProcessor.analyzeSentiment(text)
        } catch (e: Exception) {
            null
        }
    }
    
    /**
     * Extract topics from text
     */
    private suspend fun extractTopics(text: String): List<Topic> {
        // Use text analysis processor to extract topics
        return try {
            textAnalysisProcessor.extractTopics(text)
        } catch (e: Exception) {
            emptyList()
        }
    }
    
    /**
     * Calculate urgency score based on text and intent
     */
    private fun calculateUrgency(text: String, intent: Intent?): Float {
        // This would be a more complex implementation in production
        var urgency = 0.0f
        
        // Urgency keywords
        val urgentWords = listOf("urgent", "emergency", "immediately", "asap", "help", "now", "quick")
        for (word in urgentWords) {
            if (text.contains(word, ignoreCase = true)) {
                urgency += 0.2f
            }
        }
        
        // Intent-based urgency
        if (intent?.name?.contains("emergency") == true) {
            urgency += 0.5f
        }
        
        return (urgency).coerceIn(0.0f, 1.0f)
    }
    
    /**
     * Calculate importance score based on text, intent, and entities
     */
    private fun calculateImportance(text: String, intent: Intent?, entities: List<Entity>): Float {
        // This would be a more complex implementation in production
        var importance = 0.0f
        
        // Length-based importance (longer inputs might be more important)
        importance += (text.length.coerceAtMost(500) / 500.0f) * 0.2f
        
        // Intent-based importance
        if (intent != null) {
            importance += intent.confidence * 0.3f
        }
        
        // Entity-based importance (more entities might indicate more important content)
        importance += (entities.size.coerceAtMost(5) / 5.0f) * 0.2f
        
        // Entity type-based importance
        for (entity in entities) {
            if (entity.type == "PERSON" || entity.type == "ORGANIZATION") {
                importance += 0.1f
            }
        }
        
        return importance.coerceIn(0.0f, 1.0f)
    }
    
    /**
     * Fuse multiple inputs into a single processed input
     */
    private fun fuseInputs(inputs: Map<InputType, ProcessedInput>, contextId: String): ProcessedInput {
        // Start with default values
        var textContent: TextContent? = null
        var voiceContent: VoiceContent? = null
        var imageContent: ImageContent? = null
        var semanticAnalysis: SemanticAnalysis? = null
        
        // Collect content from each input
        inputs[InputType.TEXT]?.let { processedText ->
            textContent = processedText.textContent
            if (semanticAnalysis == null) {
                semanticAnalysis = processedText.semanticAnalysis
            }
        }
        
        inputs[InputType.VOICE]?.let { processedVoice ->
            voiceContent = processedVoice.voiceContent
            
            // If voice input converted to text, and we don't have text input, use it
            if (textContent == null && processedVoice.voiceContent?.transcript != null) {
                textContent = TextContent(
                    text = processedVoice.voiceContent.transcript,
                    language = processedVoice.voiceContent.language
                )
            }
            
            // Merge semantic analysis if needed
            if (semanticAnalysis == null) {
                semanticAnalysis = processedVoice.semanticAnalysis
            } else if (processedVoice.semanticAnalysis != null) {
                semanticAnalysis = mergeSemanticAnalysis(
                    semanticAnalysis!!,
                    processedVoice.semanticAnalysis
                )
            }
        }
        
        inputs[InputType.IMAGE]?.let { processedImage ->
            imageContent = processedImage.imageContent
            
            // If image input contains text via OCR, and we don't have text input, use it
            if (textContent == null && !processedImage.imageContent?.recognizedText.isNullOrEmpty()) {
                val ocrText = processedImage.imageContent?.recognizedText?.joinToString(" ") { it.text }
                if (!ocrText.isNullOrBlank()) {
                    textContent = TextContent(
                        text = ocrText
                    )
                }
            }
            
            // Merge semantic analysis if needed
            if (semanticAnalysis == null) {
                semanticAnalysis = processedImage.semanticAnalysis
            } else if (processedImage.semanticAnalysis != null) {
                semanticAnalysis = mergeSemanticAnalysis(
                    semanticAnalysis!!,
                    processedImage.semanticAnalysis
                )
            }
        }
        
        // Calculate combined confidence
        val confidence = calculateFusionConfidence(inputs)
        
        // Create fused input
        return ProcessedInput(
            id = UUID.randomUUID().toString(),
            timestamp = Instant.now(),
            sourceType = determineMainSourceType(inputs),
            confidence = confidence,
            contextId = contextId,
            textContent = textContent,
            voiceContent = voiceContent,
            imageContent = imageContent,
            semanticAnalysis = semanticAnalysis,
            metadata = createFusionMetadata(inputs)
        )
    }
    
    /**
     * Merge two semantic analyses
     */
    private fun mergeSemanticAnalysis(primary: SemanticAnalysis, secondary: SemanticAnalysis): SemanticAnalysis {
        // Use the intent with higher confidence
        val mergedIntent = when {
            primary.intent == null -> secondary.intent
            secondary.intent == null -> primary.intent
            primary.intent.confidence >= secondary.intent.confidence -> primary.intent
            else -> secondary.intent
        }
        
        // Combine entities, avoiding duplicates
        val allEntities = mutableSetOf<Entity>()
        allEntities.addAll(primary.entities)
        allEntities.addAll(secondary.entities)
        
        // Combine topics, avoiding duplicates
        val allTopics = mutableSetOf<Topic>()
        allTopics.addAll(primary.topics)
        allTopics.addAll(secondary.topics)
        
        // Choose the sentiment with higher magnitude or use primary if equal
        val mergedSentiment = when {
            primary.sentiment == null -> secondary.sentiment
            secondary.sentiment == null -> primary.sentiment
            primary.sentiment.magnitude >= secondary.sentiment.magnitude -> primary.sentiment
            else -> secondary.sentiment
        }
        
        // Combine emotions, taking the higher value for each emotion
        val mergedEmotions = mutableMapOf<String, Float>()
        mergedEmotions.putAll(primary.emotions)
        for ((emotion, score) in secondary.emotions) {
            val existingScore = mergedEmotions[emotion] ?: 0.0f
            if (score > existingScore) {
                mergedEmotions[emotion] = score
            }
        }
        
        // Take the higher value for urgency and importance
        val mergedUrgency = maxOf(primary.urgency, secondary.urgency)
        val mergedImportance = maxOf(primary.importance, secondary.importance)
        
        return SemanticAnalysis(
            intent = mergedIntent,
            entities = allEntities.toList(),
            sentiment = mergedSentiment,
            topics = allTopics.toList(),
            summary = primary.summary ?: secondary.summary,
            emotions = mergedEmotions,
            urgency = mergedUrgency,
            importance = mergedImportance
        )
    }
    
    /**
     * Calculate confidence for fused inputs
     */
    private fun calculateFusionConfidence(inputs: Map<InputType, ProcessedInput>): Float {
        if (inputs.isEmpty()) return 0.0f
        
        var weightedSum = 0.0f
        var totalWeight = 0.0f
        
        // Assign weights to different input types
        val weights = mapOf(
            InputType.TEXT to 1.0f,
            InputType.VOICE to 0.8f,
            InputType.IMAGE to 0.7f,
            InputType.VIDEO to 0.6f,
            InputType.SENSOR to 0.5f
        )
        
        // Calculate weighted average of confidence scores
        for ((inputType, processedInput) in inputs) {
            val weight = weights[inputType] ?: 0.5f
            weightedSum += processedInput.confidence * weight
            totalWeight += weight
        }
        
        // Return weighted average, with a small boost for multimodal inputs
        val baseConfidence = if (totalWeight > 0) weightedSum / totalWeight else 0.0f
        val multimodalBoost = if (inputs.size > 1) 0.1f else 0.0f
        
        return (baseConfidence + multimodalBoost).coerceIn(0.0f, 1.0f)
    }
    
    /**
     * Determine the main source type for a multimodal input
     */
    private fun determineMainSourceType(inputs: Map<InputType, ProcessedInput>): InputType {
        // Prefer text input, then voice, then image, etc.
        return inputs[InputType.TEXT]?.sourceType
            ?: inputs[InputType.VOICE]?.sourceType
            ?: inputs[InputType.IMAGE]?.sourceType
            ?: inputs.values.firstOrNull()?.sourceType
            ?: InputType.TEXT
    }
    
    /**
     * Create metadata for fused inputs
     */
    private fun createFusionMetadata(inputs: Map<InputType, ProcessedInput>): Map<String, Any> {
        val metadata = mutableMapOf<String, Any>()
        
        // Add number of inputs
        metadata["inputCount"] = inputs.size
        
        // Add input types
        metadata["inputTypes"] = inputs.keys.map { it.name }
        
        return metadata
    }
    
    /**
     * Calculate confidence for a processed input based on content type and semantic analysis
     */
    private fun calculateConfidence(content: Any?, semanticAnalysis: SemanticAnalysis?): Float {
        // Base confidence on content type
        val contentConfidence = when (content) {
            is TextContent -> 0.9f
            is VoiceContent -> content.confidenceScore
            is ImageContent -> 0.7f
            else -> 0.5f
        }
        
        // Adjust based on semantic analysis
        val semanticConfidence = semanticAnalysis?.intent?.confidence ?: 0.5f
        
        // Weight 70% content confidence, 30% semantic confidence
        return (contentConfidence * 0.7f + semanticConfidence * 0.3f).coerceIn(0.0f, 1.0f)
    }
    
    /**
     * Create a basic processed input with the given content
     */
    private fun createProcessedInput(
        inputType: InputType,
        contextId: String,
        textContent: TextContent? = null,
        voiceContent: VoiceContent? = null,
        imageContent: ImageContent? = null,
        videoContent: VideoContent? = null,
        sensorContent: SensorContent? = null
    ): ProcessedInput {
        return ProcessedInput(
            id = UUID.randomUUID().toString(),
            timestamp = Instant.now(),
            sourceType = inputType,
            confidence = 0.7f, // Default confidence
            contextId = contextId,
            textContent = textContent,
            voiceContent = voiceContent,
            imageContent = imageContent,
            videoContent = videoContent,
            sensorContent = sensorContent
        )
    }
    
    /**
     * Generate a unique context ID
     */
    private fun generateContextId(): String {
        return "ctx_${UUID.randomUUID()}"
    }
    
    /**
     * Get or create an input context for the given ID
     */
    private fun getOrCreateContext(contextId: String): InputContext {
        return contextTracker.getOrPut(contextId) {
            // Create a new context
            val newContext = InputContext(contextId)
            
            // Schedule cleanup after retention period
            scheduleContextCleanup(contextId)
            
            newContext
        }
    }
    
    /**
     * Schedule cleanup for a context after its retention period
     */
    private fun scheduleContextCleanup(contextId: String) {
        scope.launch {
            kotlinx.coroutines.delay(preprocessingOptions.contextRetentionSeconds * 1000L)
            contextTracker.remove(contextId)
        }
    }
    
    /**
     * Notify listeners that input processing has started
     */
    private fun notifyProcessingStarted(inputType: InputType, contextId: String?) {
        listeners.forEach { listener ->
            try {
                listener.onInputProcessingStarted(inputType, contextId)
            } catch (e: Exception) {
                // Log error but don't propagate
                println("Error notifying listener of processing start: ${e.message}")
            }
        }
    }
    
    /**
     * Notify listeners that input processing is complete
     */
    private fun notifyProcessingComplete(processedInput: ProcessedInput) {
        listeners.forEach { listener ->
            try {
                listener.onInputProcessingComplete(processedInput)
            } catch (e: Exception) {
                // Log error but don't propagate
                println("Error notifying listener of processing completion: ${e.message}")
            }
        }
    }
    
    /**
     * Notify listeners of partial input processing results
     */
    private fun notifyPartialProcessing(partialInput: ProcessedInput) {
        listeners.forEach { listener ->
            try {
                listener.onPartialInputProcessed(partialInput)
            } catch (e: Exception) {
                // Log error but don't propagate
                println("Error notifying listener of partial processing: ${e.message}")
            }
        }
    }
    
    /**
     * Notify listeners of an error during input processing
     */
    private fun notifyProcessingError(inputType: InputType, error: InputProcessingError, contextId: String?) {
        listeners.forEach { listener ->
            try {
                listener.onInputProcessingError(inputType, error, contextId)
            } catch (e: Exception) {
                // Log error but don't propagate
                println("Error notifying listener of processing error: ${e.message}")
            }
        }
    }
    
    /**
     * Class representing an input context
     */
    private inner class InputContext(val id: String) {
        private val inputs = mutableListOf<ProcessedInput>()
        private val lastUpdated = MutableStateFlow(Instant.now())
        
        /**
         * Add a new input to this context
         */
        fun addInput(input: ProcessedInput) {
            inputs.add(input)
            lastUpdated.value = Instant.now()
        }
        
        /**
         * Get all inputs in this context
         */
        fun getAllInputs(): List<ProcessedInput> {
            return inputs.toList()
        }
        
        /**
         * Get the most recent input
         */
        fun getMostRecentInput(): ProcessedInput? {
            return inputs.lastOrNull()
        }
    }
}

/**
 * Interface for text analysis processing
 */
interface TextAnalysisProcessor {
    /**
     * Extract entities from text
     */
    suspend fun extractEntities(text: String): List<Entity>
    
    /**
     * Analyze sentiment in text
     */
    suspend fun analyzeSentiment(text: String): Sentiment?
    
    /**
     * Extract topics from text
     */
    suspend fun extractTopics(text: String): List<Topic>
}

/**
 * Exception thrown during input processing
 */
class InputProcessingException(message: String, cause: Throwable? = null) : Exception(message, cause)

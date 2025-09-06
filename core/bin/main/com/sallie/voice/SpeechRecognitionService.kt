/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * Speech Recognition System
 */

package com.sallie.voice

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import com.google.cloud.speech.v1.*
import com.google.protobuf.ByteString
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.*
import java.io.File
import java.io.InputStream
import java.util.*
import java.util.concurrent.CopyOnWriteArraySet

/**
 * Interface for speech recognition services
 */
interface SpeechRecognitionService {
    
    /**
     * Get the current state of the recognition service
     */
    val recognitionState: StateFlow<RecognitionState>
    
    /**
     * Initialize the speech recognition service
     */
    suspend fun initialize()
    
    /**
     * Start listening for speech with the given configuration
     */
    suspend fun startListening(config: RecognitionConfig): Flow<RecognitionResult>
    
    /**
     * Stop listening for speech
     */
    suspend fun stopListening()
    
    /**
     * Recognize speech from audio data
     */
    suspend fun recognizeAudio(audioData: ByteArray, config: RecognitionConfig): RecognitionResult
    
    /**
     * Recognize speech from an audio file
     */
    suspend fun recognizeFile(file: File, config: RecognitionConfig): RecognitionResult
    
    /**
     * Recognize speech from an audio stream
     */
    suspend fun recognizeStream(audioStream: InputStream, config: RecognitionConfig): Flow<RecognitionResult>
    
    /**
     * Cancel the current recognition operation
     */
    suspend fun cancel()
    
    /**
     * Release resources used by the recognition service
     */
    suspend fun shutdown()
}

/**
 * Configuration for speech recognition
 */
data class RecognitionConfig(
    val languageCode: LanguageCode = LanguageCode.ENGLISH_US,
    val audioFormat: AudioFormat,
    val enablePunctuation: Boolean = true,
    val enableWordTimestamps: Boolean = false,
    val enableInterimResults: Boolean = false,
    val maxAlternatives: Int = 1,
    val speechContext: List<String> = emptyList(),
    val profanityFilter: Boolean = false,
    val vadSensitivity: Float = 0.5f,
    val timeoutMs: Long = 60000
)

/**
 * Implementation of the speech recognition service using on-device and cloud capabilities
 */
class EnhancedSpeechRecognitionService(
    private val context: Context
) : SpeechRecognitionService {
    
    private val _recognitionState = MutableStateFlow(RecognitionState.INACTIVE)
    override val recognitionState: StateFlow<RecognitionState> = _recognitionState.asStateFlow()
    
    // Recognition engines for different modes
    private val onDeviceRecognizer = OnDeviceSpeechRecognizer(context)
    private val cloudRecognizer = CloudSpeechRecognizer()
    
    // Default to on-device for privacy unless cloud is needed for accuracy
    private var primaryRecognizer: BaseSpeechRecognizer = onDeviceRecognizer
    
    /**
     * Initialize the speech recognition service
     */
    override suspend fun initialize() {
        onDeviceRecognizer.initialize()
        cloudRecognizer.initialize()
        _recognitionState.value = RecognitionState.INACTIVE
    }
    
    /**
     * Start listening for speech with the given configuration
     */
    override suspend fun startListening(config: RecognitionConfig): Flow<RecognitionResult> {
        _recognitionState.value = RecognitionState.LISTENING
        
        // Choose appropriate recognizer based on config complexity
        primaryRecognizer = selectRecognizer(config)
        
        return primaryRecognizer.startListening(config)
    }
    
    /**
     * Stop listening for speech
     */
    override suspend fun stopListening() {
        primaryRecognizer.stopListening()
        _recognitionState.value = RecognitionState.INACTIVE
    }
    
    /**
     * Recognize speech from audio data
     */
    override suspend fun recognizeAudio(audioData: ByteArray, config: RecognitionConfig): RecognitionResult {
        _recognitionState.value = RecognitionState.PROCESSING
        
        val recognizer = selectRecognizer(config)
        val result = recognizer.recognizeAudio(audioData, config)
        
        _recognitionState.value = RecognitionState.INACTIVE
        return result
    }
    
    /**
     * Recognize speech from an audio file
     */
    override suspend fun recognizeFile(file: File, config: RecognitionConfig): RecognitionResult {
        _recognitionState.value = RecognitionState.PROCESSING
        
        val recognizer = selectRecognizer(config)
        val result = recognizer.recognizeFile(file, config)
        
        _recognitionState.value = RecognitionState.INACTIVE
        return result
    }
    
    /**
     * Recognize speech from an audio stream
     */
    override suspend fun recognizeStream(audioStream: InputStream, config: RecognitionConfig): Flow<RecognitionResult> {
        _recognitionState.value = RecognitionState.PROCESSING
        
        val recognizer = selectRecognizer(config)
        return recognizer.recognizeStream(audioStream, config)
    }
    
    /**
     * Cancel the current recognition operation
     */
    override suspend fun cancel() {
        primaryRecognizer.cancel()
        _recognitionState.value = RecognitionState.INACTIVE
    }
    
    /**
     * Release resources used by the recognition service
     */
    override suspend fun shutdown() {
        onDeviceRecognizer.shutdown()
        cloudRecognizer.shutdown()
        _recognitionState.value = RecognitionState.INACTIVE
    }
    
    /**
     * Select the appropriate recognizer based on configuration
     */
    private fun selectRecognizer(config: RecognitionConfig): BaseSpeechRecognizer {
        // Use cloud recognizer for complex requirements
        return if (needsCloudRecognition(config)) {
            cloudRecognizer
        } else {
            onDeviceRecognizer
        }
    }
    
    /**
     * Determine if cloud recognition is needed based on config
     */
    private fun needsCloudRecognition(config: RecognitionConfig): Boolean {
        // Cloud is needed for non-English languages or complex features
        return when {
            config.languageCode.language != "en" -> true
            config.enableWordTimestamps -> true
            config.maxAlternatives > 3 -> true
            config.speechContext.isNotEmpty() -> true
            else -> false
        }
    }
}

/**
 * Base class for speech recognizers
 */
abstract class BaseSpeechRecognizer {
    abstract suspend fun initialize()
    abstract suspend fun startListening(config: RecognitionConfig): Flow<RecognitionResult>
    abstract suspend fun stopListening()
    abstract suspend fun recognizeAudio(audioData: ByteArray, config: RecognitionConfig): RecognitionResult
    abstract suspend fun recognizeFile(file: File, config: RecognitionConfig): RecognitionResult
    abstract suspend fun recognizeStream(audioStream: InputStream, config: RecognitionConfig): Flow<RecognitionResult>
    abstract suspend fun cancel()
    abstract suspend fun shutdown()
}

/**
 * On-device speech recognizer implementation
 */
class OnDeviceSpeechRecognizer(
    private val context: Context
) : BaseSpeechRecognizer() {
    // Implementation details for on-device ASR
    // This would integrate with the device's native ASR capabilities

    private var speechRecognizer: SpeechRecognizer? = null
    private var currentConfig: RecognitionConfig? = null
    private val recognitionResults = MutableStateFlow<RecognitionResult?>(null)

    override suspend fun initialize() {
        withContext(Dispatchers.Main) {
            try {
                speechRecognizer = SpeechRecognizer.createSpeechRecognizer(context)
                speechRecognizer?.setRecognitionListener(createRecognitionListener())
                isInitialized = true
                _recognitionState.value = RecognitionState.READY
            } catch (e: Exception) {
                isInitialized = false
                _recognitionState.value = RecognitionState.ERROR
                throw SpeechRecognitionException(
                    "Failed to initialize on-device speech recognizer: ${e.message}"
                )
            }
        }
    }

    override suspend fun startListening(config: RecognitionConfig): Flow<RecognitionResult> {
        return callbackFlow {
            if (!isInitialized) {
                throw SpeechRecognitionException("Speech recognizer not initialized")
            }

            currentConfig = config
            recognitionResults.value = null

            val intent = createRecognizerIntent(config)

            withContext(Dispatchers.Main) {
                speechRecognizer?.startListening(intent)
            }

            // Collect results
            val job = launch {
                recognitionResults.collect { result ->
                    result?.let { trySend(it) }
                }
            }

            awaitClose {
                job.cancel()
                withContext(Dispatchers.Main) {
                    speechRecognizer?.stopListening()
                }
            }
        }
    }

    override suspend fun stopListening() {
        withContext(Dispatchers.Main) {
            speechRecognizer?.stopListening()
        }
    }

    override suspend fun recognizeAudio(audioData: ByteArray, config: RecognitionConfig): RecognitionResult {
        // On-device recognition doesn't support direct audio data processing
        // This would require additional processing or a different approach
        return RecognitionResult.Error(
            error = SpeechRecognitionError(
                code = "UNSUPPORTED_OPERATION",
                message = "On-device recognition does not support direct audio data processing"
            ),
            timestamp = System.currentTimeMillis()
        )
    }

    override suspend fun recognizeFile(file: File, config: RecognitionConfig): RecognitionResult {
        // On-device recognition doesn't support file-based recognition
        // This would require audio file processing or conversion
        return RecognitionResult.Error(
            error = SpeechRecognitionError(
                code = "UNSUPPORTED_OPERATION",
                message = "On-device recognition does not support file-based recognition"
            ),
            timestamp = System.currentTimeMillis()
        )
    }

    override suspend fun recognizeStream(audioStream: InputStream, config: RecognitionConfig): Flow<RecognitionResult> {
        // On-device recognition doesn't support streaming from InputStream
        return flow {
            emit(RecognitionResult.Error(
                error = SpeechRecognitionError(
                    code = "UNSUPPORTED_OPERATION",
                    message = "On-device recognition does not support streaming from InputStream"
                ),
                timestamp = System.currentTimeMillis()
            ))
        }
    }

    override suspend fun cancel() {
        withContext(Dispatchers.Main) {
            speechRecognizer?.cancel()
        }
        recognitionResults.value = null
    }

    override suspend fun shutdown() {
        try {
            withContext(Dispatchers.Main) {
                speechRecognizer?.destroy()
                speechRecognizer = null
            }
            isInitialized = false
            _recognitionState.value = RecognitionState.SHUTDOWN
            recognitionResults.value = null
        } catch (e: Exception) {
            // Log error but don't throw during shutdown
        }
    }

    /**
     * Create recognition listener for Android SpeechRecognizer
     */
    private fun createRecognitionListener(): RecognitionListener {
        return object : RecognitionListener {
            override fun onReadyForSpeech(params: Bundle?) {
                _recognitionState.value = RecognitionState.LISTENING
            }

            override fun onBeginningOfSpeech() {
                _recognitionState.value = RecognitionState.PROCESSING
            }

            override fun onRmsChanged(rmsdB: Float) {
                // RMS change - could be used for visual feedback
            }

            override fun onBufferReceived(buffer: ByteArray?) {
                // Audio buffer received
            }

            override fun onEndOfSpeech() {
                _recognitionState.value = RecognitionState.PROCESSING
            }

            override fun onError(error: Int) {
                val errorMessage = getErrorMessage(error)
                recognitionResults.value = RecognitionResult.Error(
                    error = SpeechRecognitionError(
                        code = "RECOGNITION_ERROR",
                        message = errorMessage
                    ),
                    timestamp = System.currentTimeMillis()
                )
                _recognitionState.value = RecognitionState.ERROR
            }

            override fun onResults(results: Bundle?) {
                val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                val confidences = results?.getFloatArray(SpeechRecognizer.CONFIDENCE_SCORES)

                if (!matches.isNullOrEmpty()) {
                    val bestMatch = matches[0]
                    val confidence = confidences?.getOrNull(0) ?: 0f

                    val alternatives = matches.mapIndexed { index, transcript ->
                        RecognitionAlternative(
                            transcript = transcript,
                            confidence = confidences?.getOrNull(index) ?: 0f
                        )
                    }

                    recognitionResults.value = RecognitionResult.Final(
                        transcript = bestMatch,
                        confidence = confidence,
                        alternatives = alternatives,
                        timestamp = System.currentTimeMillis()
                    )
                } else {
                    recognitionResults.value = RecognitionResult.NoSpeech(
                        timestamp = System.currentTimeMillis()
                    )
                }

                _recognitionState.value = RecognitionState.READY
            }

            override fun onPartialResults(partialResults: Bundle?) {
                val matches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                val confidences = partialResults?.getFloatArray(SpeechRecognizer.CONFIDENCE_SCORES)

                matches?.getOrNull(0)?.let { partial ->
                    val confidence = confidences?.getOrNull(0) ?: 0f
                    recognitionResults.value = RecognitionResult.Interim(
                        transcript = partial,
                        confidence = confidence,
                        timestamp = System.currentTimeMillis()
                    )
                }
            }

            override fun onEvent(eventType: Int, params: Bundle?) {
                // Handle other events if needed
            }
        }
    }

    /**
     * Create intent for speech recognition
     */
    private fun createRecognizerIntent(config: RecognitionConfig): Intent {
        return Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, config.languageCode.code)
            putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, config.maxAlternatives)
            putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, config.enableInterimResults)

            if (config.speechContext.isNotEmpty()) {
                putExtra(RecognizerIntent.EXTRA_PROMPT, config.speechContext.joinToString(", "))
            }

            // Set timeout if specified
            config.timeoutMs?.let { timeout ->
                putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, timeout)
                putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS, timeout)
            }
        }
    }

    /**
     * Get error message from error code
     */
    private fun getErrorMessage(error: Int): String {
        return when (error) {
            SpeechRecognizer.ERROR_AUDIO -> "Audio recording error"
            SpeechRecognizer.ERROR_CLIENT -> "Client side error"
            SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> "Insufficient permissions"
            SpeechRecognizer.ERROR_NETWORK -> "Network error"
            SpeechRecognizer.ERROR_NETWORK_TIMEOUT -> "Network timeout"
            SpeechRecognizer.ERROR_NO_MATCH -> "No speech detected"
            SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> "Recognition service busy"
            SpeechRecognizer.ERROR_SERVER -> "Server error"
            SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> "Speech timeout"
            else -> "Unknown error: $error"
        }
    }
}

/**
 * Cloud-based speech recognizer implementation
 */
class CloudSpeechRecognizer : BaseSpeechRecognizer() {
    // Implementation details for cloud-based ASR
    // This integrates with Google Cloud Speech-to-Text API

    private var speechClient: SpeechClient? = null
    private var isInitialized = false
    private val activeOperations = mutableSetOf<String>()

    override suspend fun initialize() {
        try {
            // Initialize Google Cloud Speech client
            // Note: In production, this would use proper authentication
            speechClient = SpeechClient.create()
            isInitialized = true
        } catch (e: Exception) {
            throw SpeechRecognitionException("Failed to initialize cloud speech recognition: ${e.message}")
        }
    }

    override suspend fun startListening(config: RecognitionConfig): Flow<RecognitionResult> {
        return flow {
            val operationId = generateOperationId()
            activeOperations.add(operationId)

            try {
                val streamingConfig = createStreamingConfig(config)
                val requestStream = createRequestStream(config)

                speechClient?.let { client ->
                    val responseStream = client.streamingRecognizeCallable()
                        .call(requestStream)

                    responseStream.forEach { response ->
                        if (!activeOperations.contains(operationId)) {
                            // Operation was cancelled
                            return@forEach
                        }

                        val result = processStreamingResponse(response, config)
                        emit(result)
                    }
                } ?: throw SpeechRecognitionException("Speech client not initialized")

            } catch (e: Exception) {
                emit(RecognitionResult.Error(
                    error = SpeechRecognitionError(
                        code = "STREAMING_FAILED",
                        message = "Cloud streaming recognition failed: ${e.message}"
                    ),
                    timestamp = System.currentTimeMillis()
                ))
            } finally {
                activeOperations.remove(operationId)
            }
        }
    }

    override suspend fun stopListening() {
        // For cloud streaming, we rely on the flow completion
        // In a real implementation, you might need to send an END_OF_STREAM message
    }

    override suspend fun recognizeAudio(audioData: ByteArray, config: RecognitionConfig): RecognitionResult {
        return withContext(Dispatchers.IO) {
            try {
                val recognitionConfig = createRecognitionConfig(config)
                val audio = createAudioSource(audioData)

                val request = RecognizeRequest.newBuilder()
                    .setConfig(recognitionConfig)
                    .setAudio(audio)
                    .build()

                val response = speechClient?.recognize(request)
                    ?: throw SpeechRecognitionException("Speech client not initialized")

                processRecognitionResponse(response, config)

            } catch (e: Exception) {
                RecognitionResult.Error(
                    error = SpeechRecognitionError(
                        code = "RECOGNITION_FAILED",
                        message = "Cloud audio recognition failed: ${e.message}"
                    ),
                    timestamp = System.currentTimeMillis()
                )
            }
        }
    }

    override suspend fun recognizeFile(file: File, config: RecognitionConfig): RecognitionResult {
        return withContext(Dispatchers.IO) {
            try {
                val audioData = file.readBytes()
                recognizeAudio(audioData, config)
            } catch (e: Exception) {
                RecognitionResult.Error(
                    error = SpeechRecognitionError(
                        code = "FILE_READ_FAILED",
                        message = "Failed to read audio file: ${e.message}"
                    ),
                    timestamp = System.currentTimeMillis()
                )
            }
        }
    }

    override suspend fun recognizeStream(audioStream: InputStream, config: RecognitionConfig): Flow<RecognitionResult> {
        return flow {
            val operationId = generateOperationId()
            activeOperations.add(operationId)

            try {
                val audioData = audioStream.readBytes()
                val result = recognizeAudio(audioData, config)
                emit(result)

            } catch (e: Exception) {
                emit(RecognitionResult.Error(
                    error = SpeechRecognitionError(
                        code = "STREAM_RECOGNITION_FAILED",
                        message = "Cloud stream recognition failed: ${e.message}"
                    ),
                    timestamp = System.currentTimeMillis()
                ))
            } finally {
                activeOperations.remove(operationId)
            }
        }
    }

    override suspend fun cancel() {
        activeOperations.clear()
        // In a real implementation, you might need to cancel ongoing cloud operations
    }

    override suspend fun shutdown() {
        try {
            speechClient?.close()
            speechClient = null
            isInitialized = false
            activeOperations.clear()
        } catch (e: Exception) {
            // Log error but don't throw during shutdown
        }
    }

    /**
     * Create streaming recognition config for Google Cloud Speech
     */
    private fun createStreamingConfig(config: RecognitionConfig): StreamingRecognitionConfig {
        val recognitionConfig = RecognitionConfig.newBuilder()
            .setEncoding(getEncoding(config.audioFormat))
            .setSampleRateHertz(config.audioFormat.sampleRate)
            .setLanguageCode(config.languageCode.code)
            .setEnableAutomaticPunctuation(config.enablePunctuation)
            .setEnableWordTimeOffsets(config.enableWordTimestamps)
            .setMaxAlternatives(config.maxAlternatives)

        if (config.speechContext.isNotEmpty()) {
            val speechContexts = config.speechContext.map { phrase ->
                SpeechContext.newBuilder().addPhrases(phrase).build()
            }
            recognitionConfig.addAllSpeechContexts(speechContexts)
        }

        return StreamingRecognitionConfig.newBuilder()
            .setConfig(recognitionConfig)
            .setInterimResults(config.enableInterimResults)
            .build()
    }

    /**
     * Create request stream for streaming recognition
     */
    private fun createRequestStream(config: RecognitionConfig): Flow<StreamingRecognizeRequest> {
        return flow {
            // Send initial config
            val streamingConfig = createStreamingConfig(config)
            val initialRequest = StreamingRecognizeRequest.newBuilder()
                .setStreamingConfig(streamingConfig)
                .build()
            emit(initialRequest)

            // In a real implementation, you would stream audio data here
            // For now, this is a placeholder
        }
    }

    /**
     * Create recognition config for non-streaming recognition
     */
    private fun createRecognitionConfig(config: RecognitionConfig): RecognitionConfig {
        val builder = RecognitionConfig.newBuilder()
            .setEncoding(getEncoding(config.audioFormat))
            .setSampleRateHertz(config.audioFormat.sampleRate)
            .setLanguageCode(config.languageCode.code)
            .setEnableAutomaticPunctuation(config.enablePunctuation)
            .setEnableWordTimeOffsets(config.enableWordTimestamps)
            .setMaxAlternatives(config.maxAlternatives)

        if (config.speechContext.isNotEmpty()) {
            val speechContexts = config.speechContext.map { phrase ->
                SpeechContext.newBuilder().addPhrases(phrase).build()
            }
            builder.addAllSpeechContexts(speechContexts)
        }

        return builder.build()
    }

    /**
     * Create audio source from byte array
     */
    private fun createAudioSource(audioData: ByteArray): RecognitionAudio {
        return RecognitionAudio.newBuilder()
            .setContent(ByteString.copyFrom(audioData))
            .build()
    }

    /**
     * Process streaming recognition response
     */
    private fun processStreamingResponse(
        response: StreamingRecognizeResponse,
        config: RecognitionConfig
    ): RecognitionResult {
        val results = response.resultsList

        if (results.isEmpty()) {
            return RecognitionResult.NoSpeech(
                timestamp = System.currentTimeMillis()
            )
        }

        val bestResult = results[0]
        val transcript = bestResult.alternativesList.getOrNull(0)?.transcript ?: ""

        return if (bestResult.isFinal) {
            RecognitionResult.Final(
                transcript = transcript,
                confidence = bestResult.alternativesList.getOrNull(0)?.confidence ?: 0f,
                alternatives = bestResult.alternativesList.map { alt ->
                    RecognitionAlternative(
                        transcript = alt.transcript,
                        confidence = alt.confidence
                    )
                },
                timestamp = System.currentTimeMillis()
            )
        } else {
            RecognitionResult.Interim(
                transcript = transcript,
                confidence = bestResult.alternativesList.getOrNull(0)?.confidence ?: 0f,
                timestamp = System.currentTimeMillis()
            )
        }
    }

    /**
     * Process recognition response for non-streaming
     */
    private fun processRecognitionResponse(
        response: RecognizeResponse,
        config: RecognitionConfig
    ): RecognitionResult {
        val results = response.resultsList

        if (results.isEmpty()) {
            return RecognitionResult.NoSpeech(
                timestamp = System.currentTimeMillis()
            )
        }

        val bestResult = results[0]
        val transcript = bestResult.alternativesList.getOrNull(0)?.transcript ?: ""

        return RecognitionResult.Final(
            transcript = transcript,
            confidence = bestResult.alternativesList.getOrNull(0)?.confidence ?: 0f,
            alternatives = bestResult.alternativesList.map { alt ->
                RecognitionAlternative(
                    transcript = alt.transcript,
                    confidence = alt.confidence
                )
            },
            timestamp = System.currentTimeMillis()
        )
    }

    /**
     * Get encoding from audio format
     */
    private fun getEncoding(audioFormat: AudioFormat): RecognitionConfig.AudioEncoding {
        return when (audioFormat.encoding) {
            AudioEncoding.LINEAR16 -> RecognitionConfig.AudioEncoding.LINEAR16
            AudioEncoding.FLAC -> RecognitionConfig.AudioEncoding.FLAC
            AudioEncoding.MULAW -> RecognitionConfig.AudioEncoding.MULAW
            AudioEncoding.AMR -> RecognitionConfig.AudioEncoding.AMR
            AudioEncoding.AMR_WB -> RecognitionConfig.AudioEncoding.AMR_WB
            AudioEncoding.OGG_OPUS -> RecognitionConfig.AudioEncoding.OGG_OPUS
            AudioEncoding.SPEEX_WITH_HEADER_BYTE -> RecognitionConfig.AudioEncoding.SPEEX_WITH_HEADER_BYTE
            AudioEncoding.WEBM_OPUS -> RecognitionConfig.AudioEncoding.WEBM_OPUS
            else -> RecognitionConfig.AudioEncoding.LINEAR16
        }
    }

    /**
     * Generate unique operation ID
     */
    private fun generateOperationId(): String {
        return "cloud_recognition_${System.currentTimeMillis()}_${Math.random()}"
    }
}

// =============================================================================
// DATA CLASSES AND ENUMS
// =============================================================================

/**
 * Language codes for speech recognition
 */
enum class LanguageCode(val code: String) {
    ENGLISH_US("en-US"),
    ENGLISH_GB("en-GB"),
    SPANISH_ES("es-ES"),
    FRENCH_FR("fr-FR"),
    GERMAN_DE("de-DE"),
    ITALIAN_IT("it-IT"),
    PORTUGUESE_BR("pt-BR"),
    JAPANESE_JP("ja-JP"),
    KOREAN_KR("ko-KR"),
    CHINESE_CN("zh-CN"),
    CHINESE_TW("zh-TW"),
    RUSSIAN_RU("ru-RU"),
    ARABIC_SA("ar-SA"),
    HINDI_IN("hi-IN")
}

/**
 * Audio encoding formats
 */
enum class AudioEncoding {
    LINEAR16,
    FLAC,
    MULAW,
    AMR,
    AMR_WB,
    OGG_OPUS,
    SPEEX_WITH_HEADER_BYTE,
    WEBM_OPUS
}

/**
 * Audio format configuration
 */
data class AudioFormat(
    val encoding: AudioEncoding = AudioEncoding.LINEAR16,
    val sampleRate: Int = 16000,
    val channels: Int = 1
)

/**
 * Speech recognition states
 */
enum class RecognitionState {
    INACTIVE,
    INITIALIZING,
    READY,
    LISTENING,
    PROCESSING,
    ERROR,
    SHUTDOWN
}

/**
 * Sealed class for recognition results
 */
sealed class RecognitionResult {
    abstract val timestamp: Long

    data class Final(
        val transcript: String,
        val confidence: Float,
        val alternatives: List<RecognitionAlternative> = emptyList(),
        override val timestamp: Long
    ) : RecognitionResult()

    data class Interim(
        val transcript: String,
        val confidence: Float,
        override val timestamp: Long
    ) : RecognitionResult()

    data class NoSpeech(
        override val timestamp: Long
    ) : RecognitionResult()

    data class Error(
        val error: SpeechRecognitionError,
        override val timestamp: Long
    ) : RecognitionResult()
}

/**
 * Recognition alternative
 */
data class RecognitionAlternative(
    val transcript: String,
    val confidence: Float
)

/**
 * Speech recognition error
 */
data class SpeechRecognitionError(
    val code: String,
    val message: String
)

/**
 * Exception for speech recognition operations
 */
class SpeechRecognitionException(message: String) : Exception(message)

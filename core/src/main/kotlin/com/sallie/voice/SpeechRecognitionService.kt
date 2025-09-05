/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * Speech Recognition System
 */

package com.sallie.voice

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.withContext
import org.slf4j.LoggerFactory
import java.io.File
import java.io.InputStream

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
    val enableAutomaticPunctuation: Boolean = true,
    val enableWordTimestamps: Boolean = false,
    val enableInterimResults: Boolean = false,
    val maxAlternatives: Int = 1,
    val speechContext: List<String> = emptyList(),
    val profanityFilter: Boolean = false,
    val vadSensitivity: Float = 0.5f,
    val timeoutMs: Long = 60000
)

/**
 * Audio format configuration
 */
data class AudioFormat(
    val sampleRate: Int = 16000,
    val channels: Int = 1,
    val bitsPerSample: Int = 16,
    val encoding: AudioEncoding = AudioEncoding.PCM_16BIT
)

/**
 * Audio encoding formats
 */
enum class AudioEncoding {
    PCM_16BIT,
    PCM_24BIT,
    PCM_32BIT,
    FLOAT,
    OPUS,
    FLAC,
    MP3
}

/**
 * Language codes for recognition
 */
enum class LanguageCode(val code: String, val language: String) {
    ENGLISH_US("en-US", "en"),
    ENGLISH_UK("en-GB", "en"),
    ENGLISH_AU("en-AU", "en"),
    FRENCH("fr-FR", "fr"),
    GERMAN("de-DE", "de"),
    SPANISH("es-ES", "es"),
    ITALIAN("it-IT", "it"),
    PORTUGUESE("pt-BR", "pt"),
    JAPANESE("ja-JP", "ja"),
    KOREAN("ko-KR", "ko"),
    CHINESE_SIMPLIFIED("zh-CN", "zh"),
    CHINESE_TRADITIONAL("zh-TW", "zh"),
    RUSSIAN("ru-RU", "ru"),
    HINDI("hi-IN", "hi")
}

/**
 * Recognition state
 */
enum class RecognitionState {
    INACTIVE,
    INITIALIZING,
    LISTENING,
    PROCESSING,
    STOPPED,
    ERROR
}

/**
 * Result of speech recognition
 */
data class RecognitionResult(
    val text: String,
    val confidence: Float,
    val isFinal: Boolean,
    val alternatives: List<RecognitionAlternative> = emptyList()
)

/**
 * Alternative recognition result
 */
data class RecognitionAlternative(
    val text: String,
    val confidence: Float
)

/**
 * Custom exception for speech recognition errors
 */
class SpeechRecognitionException(message: String, cause: Throwable? = null) : 
    Exception(message, cause)

/**
 * Implementation of the speech recognition service using on-device and cloud capabilities
 */
class EnhancedSpeechRecognitionService : SpeechRecognitionService {
    
    private val _recognitionState = MutableStateFlow(RecognitionState.INACTIVE)
    override val recognitionState: StateFlow<RecognitionState> = _recognitionState.asStateFlow()
    
    // Recognition engines for different modes
    private val onDeviceRecognizer = OnDeviceSpeechRecognizer()
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
class OnDeviceSpeechRecognizer : BaseSpeechRecognizer() {
    // Implementation details for on-device ASR
    // This would integrate with the device's native ASR capabilities
    
    override suspend fun initialize() {
        // Initialize on-device recognition resources
        try {
            // Check if necessary models are available
            OnDeviceRecognizerProvider.initialize(
                OnDeviceInitConfig(
                    preferredModels = listOf("standard", "enhanced"),
                    autoDownloadModels = true
                )
            )
            
            _recognitionState.value = RecognitionState.INACTIVE
            logger.debug("On-device speech recognition initialized")
        } catch (e: Exception) {
            logger.error("Failed to initialize on-device speech recognition", e)
            throw SpeechRecognitionException("Could not initialize on-device recognizer", e)
        }
    }
    
    /**
     * Select appropriate model based on recognition config
     */
    private fun selectAppropriateModel(config: RecognitionConfig): String {
        // Choose appropriate model based on language and requirements
        return when {
            // For English, we can use the enhanced model
            config.languageCode.language == "en" -> "enhanced"
            // For other languages, use standard model or language-specific model
            else -> "${config.languageCode.language}_standard"
        }
    }
    
    override suspend fun startListening(config: RecognitionConfig): Flow<RecognitionResult> {
        // Start on-device recognition
        // Return flow of recognition results
        return flow {
            val recognizer = OnDeviceRecognizerProvider.getRecognizer()
            recognizer.configure(
                OnDeviceRecognizerConfig(
                    language = config.languageCode,
                    model = selectAppropriateModel(config),
                    enhancedPunctuation = config.enableAutomaticPunctuation,
                    partialResults = config.enableInterimResults
                )
            )
            
            recognizer.startContinuousRecognition { result ->
                emit(
                    RecognitionResult(
                        text = result.text,
                        confidence = result.confidence,
                        isFinal = result.isFinal,
                        alternatives = result.alternatives.map { alt ->
                            RecognitionAlternative(alt.text, alt.confidence)
                        }
                    )
                )
            }
        }
    }
    
    private var recognizer: OnDeviceRecognizer? = null
    private var recognitionJob: Job? = null
    private var audioRecorder: AudioRecorder? = null
    private val _recognitionResults = MutableSharedFlow<RecognitionResult>(replay = 0)
    private val _recognitionState = MutableStateFlow(RecognitionState.INACTIVE)
    private val logger = LoggerFactory.getLogger(OnDeviceSpeechRecognizer::class.java)
    
    override suspend fun stopListening() {
        // Stop on-device recognition
        recognizer?.let {
            try {
                it.stopRecognition()
                recognitionJob?.cancel()
                recognitionJob = null
                
                // Process any final results
                val finalResults = it.getFinalResults()
                if (finalResults.isNotEmpty()) {
                    val result = finalResults.last()
                    _recognitionResults.emit(
                        RecognitionResult(
                            text = result.text,
                            confidence = result.confidence,
                            isFinal = true,
                            alternatives = result.alternatives.map { alt ->
                                RecognitionAlternative(alt.text, alt.confidence)
                            }
                        )
                    )
                }
                
                audioRecorder?.release()
                audioRecorder = null
                recognizer = null
                
                logger.debug("On-device speech recognition stopped")
            } catch (e: Exception) {
                logger.error("Error stopping on-device speech recognition", e)
            }
        }
    }
    
    override suspend fun recognizeAudio(audioData: ByteArray, config: RecognitionConfig): RecognitionResult {
        // Recognize speech from audio data on-device
        val recognizer = OnDeviceRecognizerProvider.getRecognizer()
        recognizer.configure(
            OnDeviceRecognizerConfig(
                language = config.languageCode,
                model = selectAppropriateModel(config),
                enhancedPunctuation = config.enableAutomaticPunctuation,
                partialResults = false
            )
        )
        
        val result = recognizer.recognizeBatch(audioData)
        return RecognitionResult(
            text = result.text,
            confidence = result.confidence,
            isFinal = true,
            alternatives = result.alternatives.map { alt ->
                RecognitionAlternative(alt.text, alt.confidence)
            }
        )
    }
    
    override suspend fun recognizeFile(file: File, config: RecognitionConfig): RecognitionResult {
        // Recognize speech from audio file on-device
        val recognizer = OnDeviceRecognizerProvider.getRecognizer()
        recognizer.configure(
            OnDeviceRecognizerConfig(
                language = config.languageCode,
                model = selectAppropriateModel(config),
                enhancedPunctuation = config.enableAutomaticPunctuation,
                partialResults = false
            )
        )
        
        val audioData = withContext(Dispatchers.IO) {
            file.readBytes()
        }
        
        val result = recognizer.recognizeBatch(audioData)
        return RecognitionResult(
            text = result.text,
            confidence = result.confidence,
            isFinal = true,
            alternatives = result.alternatives.map { alt ->
                RecognitionAlternative(alt.text, alt.confidence)
            }
        )
    }
    
    override suspend fun recognizeStream(audioStream: InputStream, config: RecognitionConfig): Flow<RecognitionResult> {
        // Recognize speech from audio stream on-device
        val recognizer = OnDeviceRecognizerProvider.getRecognizer()
        recognizer.configure(
            OnDeviceRecognizerConfig(
                language = config.languageCode,
                model = selectAppropriateModel(config),
                enhancedPunctuation = config.enableAutomaticPunctuation,
                partialResults = true
            )
        )
        
        // Buffer size for reading chunks from the input stream
        val bufferSize = 4096
        
        return flow {
            val buffer = ByteArray(bufferSize)
            var bytesRead: Int
            
            withContext(Dispatchers.IO) {
                while (audioStream.read(buffer).also { bytesRead = it } != -1) {
                    if (bytesRead > 0) {
                        val chunk = buffer.copyOf(bytesRead)
                        val results = recognizer.processStreamingChunk(chunk)
                        
                        results.forEach { result ->
                            emit(
                                RecognitionResult(
                                    text = result.text,
                                    confidence = result.confidence,
                                    isFinal = result.isFinal,
                                    alternatives = result.alternatives.map { alt ->
                                        RecognitionAlternative(alt.text, alt.confidence)
                                    }
                                )
                            )
                        }
                    }
                }
                
                // Process final chunk and get final results
                val finalResults = recognizer.finalizeStreamingSession()
                if (finalResults.isNotEmpty()) {
                    val lastResult = finalResults.last()
                    emit(
                        RecognitionResult(
                            text = lastResult.text,
                            confidence = lastResult.confidence,
                            isFinal = true,
                            alternatives = lastResult.alternatives.map { alt ->
                                RecognitionAlternative(alt.text, alt.confidence)
                            }
                        )
                    )
                }
            }
        }
    }
    
    override suspend fun cancel() {
        // Cancel on-device recognition
        recognitionJob?.cancel()
        recognitionJob = null
        
        recognizer?.let {
            it.cancelRecognition()
            recognizer = null
        }
        
        audioRecorder?.let {
            it.stop()
            it.release()
            audioRecorder = null
        }
        
        _recognitionState.value = RecognitionState.INACTIVE
        logger.debug("On-device speech recognition canceled")
    }
    
    override suspend fun shutdown() {
        // Release on-device resources
        cancel()
        
        // Clean up any additional resources
        OnDeviceRecognizerProvider.releaseResources()
        
        _recognitionState.value = RecognitionState.INACTIVE
        logger.debug("On-device speech recognition resources released")
    }
}

/**
 * Cloud-based speech recognizer implementation
 */
class CloudSpeechRecognizer : BaseSpeechRecognizer() {
    // Implementation details for cloud-based ASR
    // This would integrate with cloud ASR services
    
    private var cloudClient: CloudSpeechClient? = null
    private var streamingRecognitionJob: Job? = null
    private val _recognitionResults = MutableSharedFlow<RecognitionResult>(replay = 0)
    private val _recognitionState = MutableStateFlow(RecognitionState.INACTIVE)
    private val logger = LoggerFactory.getLogger(CloudSpeechRecognizer::class.java)
    
    override suspend fun initialize() {
        // Initialize cloud recognition resources
        try {
            cloudClient = CloudSpeechClientFactory.createClient(
                CloudClientConfig(
                    apiKey = SecureKeyStore.getCloudSpeechApiKey(),
                    region = ConfigurationManager.getCloudRegion(),
                    timeout = 30000 // 30 seconds timeout
                )
            )
            logger.debug("Cloud speech recognition client initialized")
        } catch (e: Exception) {
            logger.error("Failed to initialize cloud speech recognition client", e)
            throw SpeechRecognitionException("Could not initialize cloud speech recognizer", e)
        }
    }
    
    override suspend fun startListening(config: RecognitionConfig): Flow<RecognitionResult> {
        // Start cloud recognition
        // Return flow of recognition results
        return flow {
            try {
                _recognitionState.value = RecognitionState.LISTENING
                
                // Check if client is initialized
                val client = cloudClient ?: throw SpeechRecognitionException("Cloud client not initialized")
                
                // Create streaming recognition session
                val cloudConfig = convertToCloudConfig(config)
                val streamingSession = client.createStreamingSession(cloudConfig)
                
                // Start audio recorder
                val audioRecorder = AudioRecorderFactory.createRecorder(
                    AudioRecorderConfig(
                        sampleRate = config.audioFormat.sampleRate,
                        channels = config.audioFormat.channels,
                        bitsPerSample = config.audioFormat.bitsPerSample
                    )
                )
                
                // Set up job to process audio and get recognition results
                streamingRecognitionJob = CoroutineScope(Dispatchers.IO).launch {
                    try {
                        audioRecorder.startRecording { audioData ->
                            streamingSession.addAudio(audioData)
                            
                            // Get interim results
                            val results = streamingSession.getInterimResults()
                            results.forEach { result ->
                                val recognitionResult = convertToRecognitionResult(result)
                                emit(recognitionResult)
                            }
                        }
                    } catch (e: Exception) {
                        logger.error("Error in cloud streaming recognition", e)
                    }
                }
                
                // Monitor for job completion
                streamingRecognitionJob?.join()
            } catch (e: Exception) {
                logger.error("Failed to start cloud speech recognition", e)
                _recognitionState.value = RecognitionState.ERROR
                throw SpeechRecognitionException("Error in cloud speech recognition", e)
            }
        }
    }
    
    override suspend fun stopListening() {
        // Stop cloud recognition
        try {
            streamingRecognitionJob?.cancel()
            streamingRecognitionJob = null
            
            // Get final results
            cloudClient?.let { client ->
                val finalResults = client.getFinalResults()
                if (finalResults.isNotEmpty()) {
                    val result = convertToRecognitionResult(finalResults.last())
                    _recognitionResults.emit(result)
                }
            }
            
            _recognitionState.value = RecognitionState.INACTIVE
            logger.debug("Cloud speech recognition stopped")
        } catch (e: Exception) {
            logger.error("Error stopping cloud speech recognition", e)
        }
    }
    
    override suspend fun recognizeAudio(audioData: ByteArray, config: RecognitionConfig): RecognitionResult {
        // Recognize speech from audio data via cloud
        try {
            _recognitionState.value = RecognitionState.PROCESSING
            
            // Check if client is initialized
            val client = cloudClient ?: throw SpeechRecognitionException("Cloud client not initialized")
            
            // Convert config and send request
            val cloudConfig = convertToCloudConfig(config)
            val result = client.recognizeAudio(audioData, cloudConfig)
            
            _recognitionState.value = RecognitionState.INACTIVE
            return convertToRecognitionResult(result)
        } catch (e: Exception) {
            logger.error("Error in cloud audio recognition", e)
            _recognitionState.value = RecognitionState.ERROR
            throw SpeechRecognitionException("Error in cloud speech recognition", e)
        }
    }
    
    override suspend fun recognizeFile(file: File, config: RecognitionConfig): RecognitionResult {
        // Recognize speech from audio file via cloud
        try {
            _recognitionState.value = RecognitionState.PROCESSING
            
            // Check if client is initialized
            val client = cloudClient ?: throw SpeechRecognitionException("Cloud client not initialized")
            
            // Read file bytes
            val audioData = withContext(Dispatchers.IO) {
                file.readBytes()
            }
            
            // Convert config and send request
            val cloudConfig = convertToCloudConfig(config)
            val result = client.recognizeAudio(audioData, cloudConfig)
            
            _recognitionState.value = RecognitionState.INACTIVE
            return convertToRecognitionResult(result)
        } catch (e: Exception) {
            logger.error("Error in cloud file recognition", e)
            _recognitionState.value = RecognitionState.ERROR
            throw SpeechRecognitionException("Error in cloud speech recognition", e)
        }
    }
    
    override suspend fun recognizeStream(audioStream: InputStream, config: RecognitionConfig): Flow<RecognitionResult> {
        // Recognize speech from audio stream via cloud
        return flow {
            try {
                _recognitionState.value = RecognitionState.PROCESSING
                
                // Check if client is initialized
                val client = cloudClient ?: throw SpeechRecognitionException("Cloud client not initialized")
                
                // Create streaming recognition session
                val cloudConfig = convertToCloudConfig(config)
                val streamingSession = client.createStreamingSession(cloudConfig)
                
                // Buffer size for reading chunks from the input stream
                val bufferSize = 8192
                
                withContext(Dispatchers.IO) {
                    val buffer = ByteArray(bufferSize)
                    var bytesRead: Int
                    
                    // Read and process audio chunks
                    while (audioStream.read(buffer).also { bytesRead = it } != -1) {
                        if (bytesRead > 0) {
                            val chunk = buffer.copyOf(bytesRead)
                            streamingSession.addAudio(chunk)
                            
                            // Get interim results
                            val results = streamingSession.getInterimResults()
                            results.forEach { result ->
                                emit(convertToRecognitionResult(result))
                            }
                        }
                    }
                    
                    // Finalize and get final results
                    val finalResults = streamingSession.finalize()
                    finalResults.forEach { result ->
                        emit(convertToRecognitionResult(result))
                    }
                    
                    _recognitionState.value = RecognitionState.INACTIVE
                }
            } catch (e: Exception) {
                logger.error("Error in cloud stream recognition", e)
                _recognitionState.value = RecognitionState.ERROR
                throw SpeechRecognitionException("Error in cloud speech recognition", e)
            }
        }
    }
    
    override suspend fun cancel() {
        // Cancel cloud recognition
        streamingRecognitionJob?.cancel()
        streamingRecognitionJob = null
        
        cloudClient?.let { client ->
            client.cancelRecognition()
        }
        
        _recognitionState.value = RecognitionState.INACTIVE
        logger.debug("Cloud speech recognition canceled")
    }
    
    override suspend fun shutdown() {
        // Release cloud resources
        cancel()
        
        cloudClient?.let { client ->
            client.close()
            cloudClient = null
        }
        
        logger.debug("Cloud speech recognition resources released")
    }
    
    /**
     * Convert from our internal config to cloud-specific config
     */
    private fun convertToCloudConfig(config: RecognitionConfig): CloudRecognitionConfig {
        return CloudRecognitionConfig(
            language = config.languageCode.code,
            model = selectCloudModel(config),
            enablePunctuation = config.enablePunctuation,
            enableWordTimestamps = config.enableWordTimestamps,
            maxAlternatives = config.maxAlternatives,
            profanityFilter = config.profanityFilter,
            speechContext = config.speechContext,
            interimResults = config.enableInterimResults
        )
    }
    
    /**
     * Convert from cloud result to our internal result model
     */
    private fun convertToRecognitionResult(cloudResult: CloudRecognitionResult): RecognitionResult {
        return RecognitionResult(
            text = cloudResult.transcript,
            confidence = cloudResult.confidence,
            isFinal = cloudResult.isFinal,
            alternatives = cloudResult.alternatives.map { alt ->
                RecognitionAlternative(alt.transcript, alt.confidence)
            }
        )
    }
    
    /**
     * Select appropriate cloud model based on config
     */
    private fun selectCloudModel(config: RecognitionConfig): String {
        // Choose model based on language and requirements
        return when {
            config.enableWordTimestamps -> "enhanced"
            config.languageCode.language != "en" -> "standard" 
            else -> "standard"
        }
    }
}
}

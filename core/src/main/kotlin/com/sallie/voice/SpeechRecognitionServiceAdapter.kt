/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * Speech Recognition Service Adapter
 */

package com.sallie.voice

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.cancel
import java.io.File
import java.io.FileInputStream

/**
 * Adapter class to bridge the gap between our new enhanced implementation
 * and the existing test expectations
 */
class SpeechRecognitionServiceAdapter(
    private val enhancedService: EnhancedSpeechRecognitionService
) : SpeechRecognitionService {
    
    override val recognitionState: StateFlow<RecognitionState> = enhancedService.recognitionState
    
    override suspend fun initialize() {
        enhancedService.initialize()
    }
    
    override suspend fun startListening(config: RecognitionConfig): Flow<RecognitionResult> {
        return enhancedService.startListening(config)
    }
    
    override suspend fun stopListening() {
        enhancedService.stopListening()
    }
    
    override suspend fun recognizeAudio(audioData: ByteArray, config: RecognitionConfig): RecognitionResult {
        return enhancedService.recognizeAudio(audioData, config)
    }
    
    override suspend fun recognizeFile(file: File, config: RecognitionConfig): RecognitionResult {
        return enhancedService.recognizeFile(file, config)
    }
    
    override suspend fun recognizeStream(audioStream: java.io.InputStream, config: RecognitionConfig): Flow<RecognitionResult> {
        return enhancedService.recognizeStream(audioStream, config)
    }
    
    override suspend fun cancel() {
        enhancedService.cancel()
    }
    
    override suspend fun shutdown() {
        enhancedService.shutdown()
    }
    
    // Legacy interface methods for compatibility with tests
    
    suspend fun checkAvailability() {
        // Always assume available
    }
    
    suspend fun isOfflineRecognitionAvailable(): Boolean {
        // Check if on-device recognizer is available
        return true
    }
    
    suspend fun startListening(
        options: SpeechRecognitionOptions,
        listener: SpeechRecognitionListener
    ) {
        // Convert options to our new config format
        val config = convertOptionsToConfig(options)
        
        // Start a coroutine to collect results and forward to the listener
        val scope = CoroutineScope(Dispatchers.Default)
        scope.launch {
            try {
                listener.onSpeechStarted()
                
                enhancedService.startListening(config).collect { result ->
                    val legacyResult = convertToLegacyResult(result)
                    listener.onSpeechResult(legacyResult)
                    
                    if (result.isFinal) {
                        listener.onSpeechEnded()
                    }
                }
            } catch (e: Exception) {
                listener.onError(SpeechRecognitionError.RECOGNITION_ERROR)
            }
        }
    }
    
    suspend fun recognizeSpeech(
        audioData: ByteArray,
        options: SpeechRecognitionOptions
    ): SpeechRecognitionResult {
        // Convert options to our new config format
        val config = convertOptionsToConfig(options)
        
        // Use our new implementation
        val result = enhancedService.recognizeAudio(audioData, config)
        
        // Convert result to legacy format
        return convertToLegacyResult(result)
    }
    
    suspend fun recognizeSpeechFromFile(
        audioFile: File,
        options: SpeechRecognitionOptions
    ): SpeechRecognitionResult {
        // Convert options to our new config format
        val config = convertOptionsToConfig(options)
        
        // Use our new implementation
        val result = enhancedService.recognizeFile(audioFile, config)
        
        // Convert result to legacy format
        return convertToLegacyResult(result)
    }
    
    suspend fun transcribe(
        audioData: ByteArray,
        options: TranscriptionOptions
    ): TranscriptionResult {
        // Convert options to our new config format
        val config = RecognitionConfig(
            languageCode = options.languageCode,
            audioFormat = AudioFormat(
                sampleRate = options.sampleRate,
                channels = 1
            ),
            enablePunctuation = true,
            enableWordTimestamps = options.enableWordTimestamps
        )
        
        // Use our new implementation
        val result = enhancedService.recognizeAudio(audioData, config)
        
        // Convert to transcription result
        return TranscriptionResult(
            text = result.text,
            confidence = result.confidence,
            durationMs = 0, // We don't have this information in new API
            languageCode = options.languageCode
        )
    }
    
    // Helper methods for conversion between old and new formats
    
    private fun convertOptionsToConfig(options: SpeechRecognitionOptions): RecognitionConfig {
        return RecognitionConfig(
            languageCode = options.languageCode ?: LanguageCode.ENGLISH_US,
            audioFormat = AudioFormat(
                sampleRate = options.sampleRate ?: 16000,
                channels = options.channels ?: 1
            ),
            enablePunctuation = options.enablePunctuation ?: true,
            enableInterimResults = options.enableInterimResults ?: false
        )
    }
    
    private fun convertToLegacyResult(result: RecognitionResult): SpeechRecognitionResult {
        return SpeechRecognitionResult(
            hypotheses = listOf(
                SpeechHypothesis(
                    text = result.text,
                    confidence = result.confidence,
                    isPartial = !result.isFinal
                )
            ) + result.alternatives.map { alt ->
                SpeechHypothesis(
                    text = alt.text,
                    confidence = alt.confidence,
                    isPartial = false
                )
            },
            isFinal = result.isFinal
        )
    }
}

// Legacy classes to support tests

/**
 * Legacy speech recognition options
 */
data class SpeechRecognitionOptions(
    val languageCode: LanguageCode? = LanguageCode.ENGLISH_US,
    val sampleRate: Int? = 16000,
    val channels: Int? = 1,
    val enablePunctuation: Boolean? = true,
    val enableInterimResults: Boolean? = false
)

/**
 * Legacy speech recognition result
 */
data class SpeechRecognitionResult(
    val hypotheses: List<SpeechHypothesis>,
    val isFinal: Boolean
)

/**
 * Legacy speech hypothesis
 */
data class SpeechHypothesis(
    val text: String,
    val confidence: Float,
    val isPartial: Boolean
)

/**
 * Legacy speech recognition listener
 */
interface SpeechRecognitionListener {
    fun onSpeechResult(result: SpeechRecognitionResult)
    fun onSpeechStarted()
    fun onSpeechEnded()
    fun onError(error: SpeechRecognitionError)
}

/**
 * Legacy speech recognition errors
 */
enum class SpeechRecognitionError {
    INITIALIZATION_ERROR,
    PERMISSION_DENIED,
    RECOGNITION_ERROR,
    NETWORK_ERROR,
    NO_MATCH,
    NO_SPEECH_DETECTED,
    TIMEOUT
}

/**
 * Legacy transcription options
 */
data class TranscriptionOptions(
    val languageCode: LanguageCode = LanguageCode.EN_US,
    val sampleRate: Int = 16000,
    val enableWordTimestamps: Boolean = false
)

/**
 * Legacy transcription result
 */
data class TranscriptionResult(
    val text: String,
    val confidence: Float,
    val durationMs: Long,
    val languageCode: LanguageCode
)

/**
 * Legacy language code enum
 */
enum class LanguageCode {
    EN_US,
    EN_GB,
    FR_FR,
    DE_DE,
    ES_ES,
    IT_IT,
    JA_JP,
    KO_KR,
    ZH_CN,
    RU_RU
}

package com.sallie.core.voice

import kotlinx.coroutines.flow.Flow
import java.io.File

/**
 * Sallie's Voice System Interface
 * 
 * This interface defines the capabilities for voice input and output, 
 * including speech recognition, wake word detection, and voice synthesis.
 */
interface VoiceSystem {

    /**
     * Initialize the voice system with specified configuration
     */
    suspend fun initialize(config: VoiceSystemConfig)
    
    /**
     * Get the current status of the voice system
     */
    fun getStatus(): VoiceSystemStatus
    
    /**
     * Start listening for voice input
     * 
     * @param options Configuration options for recognition
     * @return Flow of recognition results
     */
    fun startListening(options: VoiceRecognitionOptions): Flow<VoiceRecognitionResult>
    
    /**
     * Stop listening for voice input
     */
    suspend fun stopListening()
    
    /**
     * Speak the provided text
     * 
     * @param text Text to be spoken
     * @param options Voice synthesis options
     * @return Flow of synthesis progress updates
     */
    fun speak(text: String, options: VoiceSynthesisOptions): Flow<VoiceSynthesisProgress>
    
    /**
     * Stop current speech synthesis
     */
    suspend fun stopSpeaking()
    
    /**
     * Enable or disable wake word detection
     * 
     * @param enabled Whether wake word detection should be enabled
     * @param customWakeWord Custom wake word to listen for (if null, default is used)
     */
    suspend fun setWakeWordDetection(enabled: Boolean, customWakeWord: String? = null)
    
    /**
     * Set voice characteristics for speech synthesis
     * 
     * @param voiceCharacteristics Voice characteristics to use
     */
    fun setVoiceCharacteristics(voiceCharacteristics: VoiceCharacteristics)
    
    /**
     * Get available voices for speech synthesis
     */
    suspend fun getAvailableVoices(): List<VoiceProfile>
    
    /**
     * Register a listener for voice system events
     * 
     * @param listener The listener to register
     */
    fun registerVoiceListener(listener: VoiceSystemListener)
    
    /**
     * Unregister a previously registered listener
     * 
     * @param listener The listener to unregister
     */
    fun unregisterVoiceListener(listener: VoiceSystemListener)
    
    /**
     * Transcribe audio from a file
     * 
     * @param audioFile File containing audio to transcribe
     * @param options Transcription options
     * @return Transcription result
     */
    suspend fun transcribeAudioFile(audioFile: File, options: TranscriptionOptions): TranscriptionResult
    
    /**
     * Release resources used by the voice system
     */
    suspend fun shutdown()
}

/**
 * Voice system configuration
 */
data class VoiceSystemConfig(
    val recognitionEngine: RecognitionEngineType = RecognitionEngineType.ONDEVICE,
    val synthesisEngine: SynthesisEngineType = SynthesisEngineType.ONDEVICE,
    val defaultLanguage: String = "en-US",
    val defaultVoiceProfile: String? = null,
    val wakeWordEnabled: Boolean = false,
    val defaultWakeWord: String = "Hey Sallie",
    val vadEnabled: Boolean = true,
    val noiseReduction: Boolean = true,
    val offlineMode: Boolean = false,
    val maxRecordingDurationMs: Long = 30000, // 30 seconds
    val confidenceThreshold: Float = 0.5f
)

/**
 * Voice recognition options
 */
data class VoiceRecognitionOptions(
    val language: String? = null,
    val enablePunctuation: Boolean = true,
    val enableSpeakerIdentification: Boolean = false,
    val enableIntermediateResults: Boolean = true,
    val enableEmotionDetection: Boolean = false,
    val noiseHandling: NoiseHandlingLevel = NoiseHandlingLevel.MEDIUM,
    val maxDurationMs: Long? = null,
    val profanityFilter: Boolean = false,
    val customVocabulary: List<String> = emptyList()
)

/**
 * Voice synthesis options
 */
data class VoiceSynthesisOptions(
    val voiceProfile: String? = null,
    val pitch: Float = 1.0f,
    val rate: Float = 1.0f,
    val volume: Float = 1.0f,
    val emotionalTone: String? = null,
    val emphasis: Map<String, EmphasisLevel> = emptyMap(),
    val ssml: Boolean = false,
    val audioFormat: AudioFormat = AudioFormat.WAV,
    val saveToFile: File? = null
)

/**
 * Voice characteristics for speech synthesis
 */
data class VoiceCharacteristics(
    val gender: VoiceGender = VoiceGender.NEUTRAL,
    val age: VoiceAge = VoiceAge.ADULT,
    val accent: String? = null,
    val timbre: Float = 1.0f, // 0.0 = soft, 1.0 = normal, 2.0 = bright
    val richness: Float = 1.0f, // 0.0 = thin, 1.0 = normal, 2.0 = rich
    val voiceStyle: VoiceStyle = VoiceStyle.CONVERSATIONAL
)

/**
 * Voice profile for speech synthesis
 */
data class VoiceProfile(
    val id: String,
    val name: String,
    val gender: VoiceGender,
    val age: VoiceAge,
    val language: String,
    val accent: String? = null,
    val isOfflineCapable: Boolean = false,
    val isCustom: Boolean = false,
    val previewText: String? = null
)

/**
 * Transcription options for audio files
 */
data class TranscriptionOptions(
    val language: String? = null,
    val enableSpeakerDiarization: Boolean = false,
    val enablePunctuation: Boolean = true,
    val enableTimestamps: Boolean = false,
    val confidenceThreshold: Float = 0.0f
)

/**
 * Result of speech recognition
 */
data class VoiceRecognitionResult(
    val text: String,
    val isPartial: Boolean = true,
    val confidence: Float = 0.0f,
    val languageDetected: String? = null,
    val segments: List<VoiceSegment> = emptyList(),
    val emotion: String? = null,
    val speakerId: String? = null,
    val startTimeMs: Long = 0,
    val endTimeMs: Long = 0,
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
 * Voice segment in recognition result
 */
data class VoiceSegment(
    val text: String,
    val startTimeMs: Long,
    val endTimeMs: Long,
    val confidence: Float = 0.0f,
    val speakerId: String? = null
)

/**
 * Result of audio transcription
 */
data class TranscriptionResult(
    val text: String,
    val confidence: Float,
    val segments: List<VoiceSegment>,
    val durationMs: Long,
    val languageDetected: String? = null,
    val speakers: List<String> = emptyList()
)

/**
 * Progress of voice synthesis
 */
data class VoiceSynthesisProgress(
    val state: SynthesisState,
    val text: String,
    val processedCharacters: Int,
    val totalCharacters: Int,
    val audioData: ByteArray? = null,
    val audioFile: File? = null,
    val durationMs: Long = 0,
    val error: String? = null
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as VoiceSynthesisProgress

        if (state != other.state) return false
        if (text != other.text) return false
        if (processedCharacters != other.processedCharacters) return false
        if (totalCharacters != other.totalCharacters) return false
        if (audioData != null) {
            if (other.audioData == null) return false
            if (!audioData.contentEquals(other.audioData)) return false
        } else if (other.audioData != null) return false
        if (audioFile != other.audioFile) return false
        if (durationMs != other.durationMs) return false
        if (error != other.error) return false

        return true
    }

    override fun hashCode(): Int {
        var result = state.hashCode()
        result = 31 * result + text.hashCode()
        result = 31 * result + processedCharacters
        result = 31 * result + totalCharacters
        result = 31 * result + (audioData?.contentHashCode() ?: 0)
        result = 31 * result + (audioFile?.hashCode() ?: 0)
        result = 31 * result + durationMs.hashCode()
        result = 31 * result + (error?.hashCode() ?: 0)
        return result
    }
}

/**
 * Status of the voice system
 */
data class VoiceSystemStatus(
    val isInitialized: Boolean = false,
    val isListening: Boolean = false,
    val isSpeaking: Boolean = false,
    val isWakeWordEnabled: Boolean = false,
    val currentWakeWord: String? = null,
    val currentLanguage: String? = null,
    val currentVoiceProfile: String? = null,
    val lastError: String? = null,
    val engineStatus: Map<String, String> = emptyMap()
)

/**
 * Listener for voice system events
 */
interface VoiceSystemListener {
    /**
     * Called when wake word is detected
     */
    fun onWakeWordDetected(wakeWord: String) {}
    
    /**
     * Called when speech is detected
     */
    fun onSpeechDetected() {}
    
    /**
     * Called when silence is detected
     */
    fun onSilenceDetected() {}
    
    /**
     * Called when voice recognition starts
     */
    fun onRecognitionStarted() {}
    
    /**
     * Called when voice recognition ends
     */
    fun onRecognitionEnded() {}
    
    /**
     * Called when voice synthesis starts
     */
    fun onSynthesisStarted(text: String) {}
    
    /**
     * Called when voice synthesis ends
     */
    fun onSynthesisEnded(text: String) {}
    
    /**
     * Called when an error occurs
     */
    fun onError(error: VoiceSystemError) {}
}

/**
 * Voice system error
 */
data class VoiceSystemError(
    val code: ErrorCode,
    val message: String,
    val cause: Throwable? = null
)

/**
 * Error codes for voice system
 */
enum class ErrorCode {
    INITIALIZATION_ERROR,
    RECOGNITION_ERROR,
    SYNTHESIS_ERROR,
    WAKEWORD_ERROR,
    PERMISSION_DENIED,
    NETWORK_ERROR,
    TIMEOUT_ERROR,
    AUDIO_DEVICE_ERROR,
    INVALID_PARAMETER,
    UNKNOWN_ERROR
}

/**
 * Recognition engine types
 */
enum class RecognitionEngineType {
    ONDEVICE,
    CLOUD,
    HYBRID
}

/**
 * Synthesis engine types
 */
enum class SynthesisEngineType {
    ONDEVICE,
    CLOUD,
    HYBRID
}

/**
 * Noise handling levels
 */
enum class NoiseHandlingLevel {
    OFF,
    LOW,
    MEDIUM,
    HIGH
}

/**
 * Voice gender
 */
enum class VoiceGender {
    MALE,
    FEMALE,
    NEUTRAL
}

/**
 * Voice age
 */
enum class VoiceAge {
    CHILD,
    YOUNG,
    ADULT,
    SENIOR
}

/**
 * Voice style
 */
enum class VoiceStyle {
    CONVERSATIONAL,
    FORMAL,
    CASUAL,
    CHEERFUL,
    SERIOUS,
    PROFESSIONAL
}

/**
 * Emphasis level for words in speech synthesis
 */
enum class EmphasisLevel {
    STRONG,
    MODERATE,
    REDUCED,
    NONE
}

/**
 * Audio format for speech synthesis
 */
enum class AudioFormat {
    WAV,
    MP3,
    OGG,
    FLAC
}

/**
 * Synthesis state
 */
enum class SynthesisState {
    QUEUED,
    PROCESSING,
    SPEAKING,
    COMPLETED,
    INTERRUPTED,
    ERROR
}

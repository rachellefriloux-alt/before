package com.sallie.core.input.speech

import kotlinx.coroutines.flow.Flow
import java.time.Duration
import java.time.Instant

/**
 * Sallie's Speech Processing System
 * 
 * This system provides speech recognition, speaker identification, and
 * voice analysis capabilities for processing voice input.
 */
interface SpeechProcessor {
    /**
     * Initialize the speech processor
     */
    suspend fun initialize()
    
    /**
     * Start streaming speech recognition
     * 
     * @param options Configuration options for speech recognition
     * @return Flow of SpeechRecognitionResults that includes partial and final results
     */
    fun startStreamingRecognition(options: SpeechRecognitionOptions = SpeechRecognitionOptions()): Flow<SpeechRecognitionResult>
    
    /**
     * Stop the current streaming speech recognition session
     */
    fun stopStreamingRecognition()
    
    /**
     * Process a complete audio file or buffer for speech recognition
     * 
     * @param audioData The raw audio data to process
     * @param options Configuration options for speech recognition
     * @return A SpeechRecognitionResult containing the transcription
     */
    suspend fun recognizeSpeech(
        audioData: ByteArray, 
        options: SpeechRecognitionOptions = SpeechRecognitionOptions()
    ): SpeechRecognitionResult
    
    /**
     * Analyze voice characteristics
     * 
     * @param audioData The raw audio data to analyze
     * @return A VoiceAnalysisResult containing the analysis
     */
    suspend fun analyzeVoice(audioData: ByteArray): VoiceAnalysisResult
    
    /**
     * Identify the speaker from a voice sample
     * 
     * @param audioData The raw audio data to analyze
     * @param options Configuration options for speaker identification
     * @return A SpeakerIdentificationResult containing possible speaker matches
     */
    suspend fun identifySpeaker(
        audioData: ByteArray, 
        options: SpeakerIdentificationOptions = SpeakerIdentificationOptions()
    ): SpeakerIdentificationResult
    
    /**
     * Enroll a new speaker for future identification
     * 
     * @param audioData The raw audio data for the speaker
     * @param speakerName A unique name/identifier for the speaker
     * @param options Configuration options for speaker enrollment
     * @return A SpeakerEnrollmentResult indicating success or failure
     */
    suspend fun enrollSpeaker(
        audioData: ByteArray, 
        speakerId: String, 
        options: SpeakerEnrollmentOptions = SpeakerEnrollmentOptions()
    ): SpeakerEnrollmentResult
    
    /**
     * Detect segments in audio where different speakers are talking
     * 
     * @param audioData The raw audio data to analyze
     * @param options Configuration options for diarization
     * @return A list of speaker segments with timestamps
     */
    suspend fun performDiarization(
        audioData: ByteArray, 
        options: DiarizationOptions = DiarizationOptions()
    ): List<SpeakerSegment>
    
    /**
     * Detect emotions in speech
     * 
     * @param audioData The raw audio data to analyze
     * @return An EmotionDetectionResult containing the detected emotions
     */
    suspend fun detectEmotions(audioData: ByteArray): EmotionDetectionResult
    
    /**
     * Get the capabilities of the speech processor
     * 
     * @return A set of SpeechCapability values indicating what the processor can do
     */
    fun getCapabilities(): Set<SpeechCapability>
}

/**
 * Result of speech recognition
 */
data class SpeechRecognitionResult(
    val transcript: String,
    val isPartial: Boolean = false,
    val confidence: Float = 0.0f,
    val languageDetected: String? = null,
    val segments: List<TranscriptSegment> = emptyList(),
    val alternatives: List<TranscriptAlternative> = emptyList(),
    val processingTimeMs: Long = 0,
    val totalAudioDuration: Duration? = null
)

/**
 * A segment of the transcription with timing information
 */
data class TranscriptSegment(
    val text: String,
    val startTimeMs: Long,
    val endTimeMs: Long,
    val confidence: Float,
    val speakerId: String? = null
)

/**
 * An alternative transcription hypothesis
 */
data class TranscriptAlternative(
    val transcript: String,
    val confidence: Float
)

/**
 * Result of voice analysis
 */
data class VoiceAnalysisResult(
    val pitch: PitchAnalysis? = null,
    val volume: VolumeAnalysis? = null,
    val speechRate: SpeechRateAnalysis? = null,
    val voiceQuality: VoiceQualityAnalysis? = null,
    val emotionalTone: EmotionDetectionResult? = null,
    val stressLevel: Float = 0.0f, // 0.0 to 1.0
    val confidence: Float = 0.0f,
    val processingTimeMs: Long = 0
)

/**
 * Pitch analysis
 */
data class PitchAnalysis(
    val meanHz: Float,
    val minHz: Float,
    val maxHz: Float,
    val variability: Float // 0.0 (monotone) to 1.0 (highly variable)
)

/**
 * Volume analysis
 */
data class VolumeAnalysis(
    val meanDb: Float,
    val minDb: Float,
    val maxDb: Float,
    val variability: Float // 0.0 (consistent) to 1.0 (highly variable)
)

/**
 * Speech rate analysis
 */
data class SpeechRateAnalysis(
    val wordsPerMinute: Float,
    val syllablesPerSecond: Float,
    val pauseCount: Int,
    val meanPauseDurationMs: Long,
    val articulation: Float // 0.0 (unclear) to 1.0 (very clear)
)

/**
 * Voice quality analysis
 */
data class VoiceQualityAnalysis(
    val breathiness: Float, // 0.0 to 1.0
    val hoarseness: Float, // 0.0 to 1.0
    val nasality: Float, // 0.0 to 1.0
    val clarity: Float, // 0.0 to 1.0
    val stability: Float // 0.0 to 1.0
)

/**
 * Result of emotion detection in speech
 */
data class EmotionDetectionResult(
    val dominantEmotion: String? = null,
    val emotions: Map<String, Float> = emptyMap(), // Emotion name to confidence score
    val valence: Float = 0.0f, // -1.0 (negative) to 1.0 (positive)
    val arousal: Float = 0.0f, // 0.0 (calm) to 1.0 (excited)
    val confidence: Float = 0.0f,
    val timeline: List<EmotionTimepoint> = emptyList()
)

/**
 * An emotion at a specific point in time
 */
data class EmotionTimepoint(
    val timeMs: Long,
    val emotion: String,
    val confidence: Float
)

/**
 * Result of speaker identification
 */
data class SpeakerIdentificationResult(
    val matches: List<SpeakerMatch> = emptyList(),
    val confidence: Float = 0.0f,
    val processingTimeMs: Long = 0
)

/**
 * A potential speaker match
 */
data class SpeakerMatch(
    val speakerId: String,
    val confidence: Float,
    val metadata: Map<String, Any> = emptyMap()
)

/**
 * Result of speaker enrollment
 */
data class SpeakerEnrollmentResult(
    val success: Boolean,
    val speakerId: String,
    val qualityScore: Float = 0.0f, // 0.0 to 1.0
    val message: String? = null,
    val needsMoreData: Boolean = false,
    val processingTimeMs: Long = 0
)

/**
 * A segment of speech from a specific speaker
 */
data class SpeakerSegment(
    val speakerId: String?,
    val startTimeMs: Long,
    val endTimeMs: Long,
    val confidence: Float
)

/**
 * Options for speech recognition
 */
data class SpeechRecognitionOptions(
    val language: String? = null,
    val enableAutomaticPunctuation: Boolean = true,
    val enableSpeakerDiarization: Boolean = false,
    val maxAlternatives: Int = 1,
    val profanityFilter: Boolean = true,
    val enableWordTimestamps: Boolean = false,
    val singleUtterance: Boolean = false,
    val useEnhancedModel: Boolean = false,
    val adaptationPhrases: List<String> = emptyList(),
    val noiseHandling: NoiseHandlingMode = NoiseHandlingMode.AUTO,
    val timeout: Duration? = null
)

/**
 * Noise handling modes for speech recognition
 */
enum class NoiseHandlingMode {
    OFF,     // No noise handling
    LOW,     // Basic noise suppression
    MEDIUM,  // Balanced noise suppression
    HIGH,    // Aggressive noise suppression
    AUTO     // Automatically adjust based on audio
}

/**
 * Options for speaker identification
 */
data class SpeakerIdentificationOptions(
    val minConfidence: Float = 0.7f,
    val maxResults: Int = 3,
    val adaptationMode: SpeakerAdaptationMode = SpeakerAdaptationMode.NORMAL
)

/**
 * Speaker adaptation modes for identification
 */
enum class SpeakerAdaptationMode {
    NORMAL,       // Standard adaptation
    CONSERVATIVE, // Less adaptive, more consistent
    AGGRESSIVE    // More adaptive, updates quickly
}

/**
 * Options for speaker enrollment
 */
data class SpeakerEnrollmentOptions(
    val minQuality: Float = 0.6f,
    val createVoiceprint: Boolean = true,
    val updateExisting: Boolean = true,
    val metadata: Map<String, String> = emptyMap()
)

/**
 * Options for speaker diarization
 */
data class DiarizationOptions(
    val minSpeakers: Int = 1,
    val maxSpeakers: Int = 10,
    val speakerLabels: Map<String, String> = emptyMap()
)

/**
 * Speech processor capabilities
 */
enum class SpeechCapability {
    SPEECH_RECOGNITION,
    SPEAKER_IDENTIFICATION,
    SPEAKER_ENROLLMENT,
    SPEAKER_DIARIZATION,
    EMOTION_DETECTION,
    VOICE_ANALYSIS,
    STREAMING_RECOGNITION,
    LANGUAGE_DETECTION,
    PROFANITY_FILTERING,
    NOISE_SUPPRESSION,
    AUTOMATIC_PUNCTUATION
}

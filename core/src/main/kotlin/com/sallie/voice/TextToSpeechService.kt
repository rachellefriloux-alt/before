/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 *
 * Text-to-Speech Synthesis Service for Android Launcher React Native AI Hybrid
 */

package com.sallie.voice

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.withContext
import org.slf4j.LoggerFactory
import java.io.Closeable
import java.io.File
import java.io.OutputStream

/**
 * Interface for text-to-speech synthesis services
 */
interface TextToSpeechService {

    /**
     * Get the current state of the synthesis service
     */
    val synthesisState: StateFlow<SynthesisState>

    /**
     * Initialize the text-to-speech service
     */
    suspend fun initialize()

    /**
     * Get available voices
     */
    suspend fun getAvailableVoices(): List<VoiceInfo>

    /**
     * Synthesize speech from text and play it
     */
    suspend fun speak(text: String, options: SpeechSynthesisOptions): SynthesisResult

    /**
     * Synthesize speech from SSML markup and play it
     */
    suspend fun speakSsml(ssml: String, options: SpeechSynthesisOptions): SynthesisResult

    /**
     * Synthesize speech from text to audio data
     */
    suspend fun synthesize(text: String, options: SpeechSynthesisOptions): ByteArray

    /**
     * Synthesize speech from SSML markup to audio data
     */
    suspend fun synthesizeSsml(ssml: String, options: SpeechSynthesisOptions): ByteArray

    /**
     * Stream synthesized speech to an output stream
     */
    suspend fun synthesizeToStream(text: String, options: SpeechSynthesisOptions, outputStream: OutputStream)

    /**
     * Save synthesized speech to a file
     */
    suspend fun synthesizeToFile(text: String, options: SpeechSynthesisOptions, outputFile: File): File

    /**
     * Stop current speech synthesis
     */
    suspend fun stop()

    /**
     * Release resources used by the synthesis service
     */
    suspend fun shutdown()
}

/**
 * State of the speech synthesis process
 */
enum class SynthesisState {
    IDLE,
    SYNTHESIZING,
    SPEAKING,
    ERROR
}

/**
 * Result of speech synthesis
 */
data class SynthesisResult(
    val id: String,
    val audioData: ByteArray?,
    val duration: Long,  // in milliseconds
    val wordBoundaries: List<WordBoundary> = emptyList()
) {
    /**
     * Word timing information for synchronization
     */
    data class WordBoundary(
        val word: String,
        val startTimeMs: Long,
        val endTimeMs: Long
    )
    
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as SynthesisResult

        if (id != other.id) return false
        if (audioData != null) {
            if (other.audioData == null) return false
            if (!audioData.contentEquals(other.audioData)) return false
        } else if (other.audioData != null) return false
        if (duration != other.duration) return false
        if (wordBoundaries != other.wordBoundaries) return false

        return true
    }

    override fun hashCode(): Int {
        var result = id.hashCode()
        result = 31 * result + (audioData?.contentHashCode() ?: 0)
        result = 31 * result + duration.hashCode()
        result = 31 * result + wordBoundaries.hashCode()
        return result
    }
}

/**
 * Information about an available voice
 */
data class VoiceInfo(
    val id: String,
    val name: String,
    val gender: VoiceGender,
    val age: VoiceAge,
    val languageCodes: List<LanguageCode>,
    val sampleRateHertz: Int,
    val naturalness: Float,  // 0.0 to 1.0 where 1.0 is most natural
    val isNeural: Boolean,   // Neural vs. parametric synthesis
    val requiresNetwork: Boolean,  // Whether voice requires internet
    val customizationSupport: Boolean  // Whether voice supports customization
)

/**
 * Implementation of the text-to-speech service using on-device and cloud capabilities
 */
class EnhancedTextToSpeechService : TextToSpeechService {
    
    private val _synthesisState = MutableStateFlow(SynthesisState.IDLE)
    override val synthesisState: StateFlow<SynthesisState> = _synthesisState.asStateFlow()
    
    // TTS engines for different modes
    private val onDeviceTts = OnDeviceTextToSpeech()
    private val cloudTts = CloudTextToSpeech()
    
    // Default to on-device for privacy unless cloud is needed for quality
    private var primaryTts: BaseTextToSpeech = onDeviceTts
    
    // Available voices
    private val voices = mutableListOf<VoiceInfo>()
    
    /**
     * Initialize the text-to-speech service
     */
    override suspend fun initialize() {
        onDeviceTts.initialize()
        cloudTts.initialize()
        
        // Load available voices
        val onDeviceVoices = onDeviceTts.getAvailableVoices()
        val cloudVoices = cloudTts.getAvailableVoices()
        
        voices.clear()
        voices.addAll(onDeviceVoices)
        voices.addAll(cloudVoices)
        
        _synthesisState.value = SynthesisState.IDLE
    }
    
    /**
     * Get available voices
     */
    override suspend fun getAvailableVoices(): List<VoiceInfo> {
        return voices
    }
    
    /**
     * Synthesize speech from text and play it
     */
    override suspend fun speak(text: String, options: SpeechSynthesisOptions): SynthesisResult {
        _synthesisState.value = SynthesisState.SPEAKING
        
        try {
            // Choose appropriate TTS engine based on options
            primaryTts = selectTtsEngine(options)
            
            val result = primaryTts.speak(text, options)
            _synthesisState.value = SynthesisState.IDLE
            return result
        } catch (e: Exception) {
            _synthesisState.value = SynthesisState.ERROR
            throw e
        }
    }
    
    /**
     * Synthesize speech from SSML markup and play it
     */
    override suspend fun speakSsml(ssml: String, options: SpeechSynthesisOptions): SynthesisResult {
        _synthesisState.value = SynthesisState.SPEAKING
        
        try {
            // Choose appropriate TTS engine based on options
            primaryTts = selectTtsEngine(options)
            
            val result = primaryTts.speakSsml(ssml, options)
            _synthesisState.value = SynthesisState.IDLE
            return result
        } catch (e: Exception) {
            _synthesisState.value = SynthesisState.ERROR
            throw e
        }
    }
    
    /**
     * Synthesize speech from text to audio data
     */
    override suspend fun synthesize(text: String, options: SpeechSynthesisOptions): ByteArray {
        _synthesisState.value = SynthesisState.SYNTHESIZING
        
        try {
            // Choose appropriate TTS engine based on options
            primaryTts = selectTtsEngine(options)
            
            val result = primaryTts.synthesize(text, options)
            _synthesisState.value = SynthesisState.IDLE
            return result
        } catch (e: Exception) {
            _synthesisState.value = SynthesisState.ERROR
            throw e
        }
    }
    
    /**
     * Synthesize speech from SSML markup to audio data
     */
    override suspend fun synthesizeSsml(ssml: String, options: SpeechSynthesisOptions): ByteArray {
        _synthesisState.value = SynthesisState.SYNTHESIZING
        
        try {
            // Choose appropriate TTS engine based on options
            primaryTts = selectTtsEngine(options)
            
            val result = primaryTts.synthesizeSsml(ssml, options)
            _synthesisState.value = SynthesisState.IDLE
            return result
        } catch (e: Exception) {
            _synthesisState.value = SynthesisState.ERROR
            throw e
        }
    }
    
    /**
     * Stream synthesized speech to an output stream
     */
    override suspend fun synthesizeToStream(text: String, options: SpeechSynthesisOptions, outputStream: OutputStream) {
        _synthesisState.value = SynthesisState.SYNTHESIZING
        
        try {
            // Choose appropriate TTS engine based on options
            primaryTts = selectTtsEngine(options)
            
            primaryTts.synthesizeToStream(text, options, outputStream)
            _synthesisState.value = SynthesisState.IDLE
        } catch (e: Exception) {
            _synthesisState.value = SynthesisState.ERROR
            throw e
        }
    }
    
    /**
     * Save synthesized speech to a file
     */
    override suspend fun synthesizeToFile(text: String, options: SpeechSynthesisOptions, outputFile: File): File {
        _synthesisState.value = SynthesisState.SYNTHESIZING
        
        try {
            // Choose appropriate TTS engine based on options
            primaryTts = selectTtsEngine(options)
            
            val file = primaryTts.synthesizeToFile(text, options, outputFile)
            _synthesisState.value = SynthesisState.IDLE
            return file
        } catch (e: Exception) {
            _synthesisState.value = SynthesisState.ERROR
            throw e
        }
    }
    
    /**
     * Stop current speech synthesis
     */
    override suspend fun stop() {
        primaryTts.stop()
        _synthesisState.value = SynthesisState.IDLE
    }
    
    /**
     * Release resources used by the synthesis service
     */
    override suspend fun shutdown() {
        onDeviceTts.shutdown()
        cloudTts.shutdown()
        _synthesisState.value = SynthesisState.IDLE
    }
    
    /**
     * Select the appropriate TTS engine based on options
     */
    private fun selectTtsEngine(options: SpeechSynthesisOptions): BaseTextToSpeech {
        val voiceInfo = findVoiceInfo(options.voiceId)
        
        // Use cloud TTS for neural voices or when high quality is required
        return when {
            voiceInfo?.isNeural == true -> cloudTts
            voiceInfo?.requiresNetwork == true -> cloudTts
            options.pitch != 1.0f || options.speakingRate != 1.0f -> cloudTts
            else -> onDeviceTts
        }
    }
    
    /**
     * Find voice info by ID
     */
    private fun findVoiceInfo(voiceId: String): VoiceInfo? {
        return voices.find { it.id == voiceId }
    }
}

/**
 * Base class for text-to-speech engines
 */
abstract class BaseTextToSpeech {
    abstract suspend fun initialize()
    abstract suspend fun getAvailableVoices(): List<VoiceInfo>
    abstract suspend fun speak(text: String, options: SpeechSynthesisOptions): SynthesisResult
    abstract suspend fun speakSsml(ssml: String, options: SpeechSynthesisOptions): SynthesisResult
    abstract suspend fun synthesize(text: String, options: SpeechSynthesisOptions): ByteArray
    abstract suspend fun synthesizeSsml(ssml: String, options: SpeechSynthesisOptions): ByteArray
    abstract suspend fun synthesizeToStream(text: String, options: SpeechSynthesisOptions, outputStream: OutputStream)
    abstract suspend fun synthesizeToFile(text: String, options: SpeechSynthesisOptions, outputFile: File): File
    abstract suspend fun stop()
    abstract suspend fun shutdown()
}

/**
 * On-device text-to-speech implementation
 */
class OnDeviceTextToSpeech : BaseTextToSpeech() {
    // Implementation details for on-device TTS
    // This would integrate with the device's native TTS capabilities
    
    override suspend fun initialize() {
        // Initialize on-device TTS resources
    }
    
    // Engine instance for on-device synthesis
    private var ttsEngine: OnDeviceTtsEngine? = null
    private val logger = LoggerFactory.getLogger(OnDeviceTextToSpeech::class.java)
    
    override suspend fun initialize() {
        // Initialize on-device TTS resources
        try {
            ttsEngine = OnDeviceTtsEngineFactory.createEngine()
            logger.debug("On-device TTS engine initialized")
        } catch (e: Exception) {
            logger.error("Failed to initialize on-device TTS engine", e)
            throw TtsSynthesisException("Could not initialize on-device TTS", e)
        }
    }
    
    override suspend fun getAvailableVoices(): List<VoiceInfo> {
        // Get available on-device voices
        val engine = ttsEngine ?: throw TtsSynthesisException("TTS engine not initialized")
        
        return withContext(Dispatchers.IO) {
            try {
                val nativeVoices = engine.getAvailableVoices()
                nativeVoices.map { nativeVoice ->
                    VoiceInfo(
                        id = nativeVoice.id,
                        name = nativeVoice.name,
                        gender = mapGender(nativeVoice.gender),
                        age = mapAge(nativeVoice.age),
                        languageCodes = listOf(mapLanguage(nativeVoice.locale)),
                        sampleRateHertz = nativeVoice.sampleRate,
                        naturalness = nativeVoice.quality / 100f,
                        isNeural = false, // On-device voices are typically not neural
                        requiresNetwork = false,
                        customizationSupport = false
                    )
                }
            } catch (e: Exception) {
                logger.error("Failed to get available on-device voices", e)
                emptyList()
            }
        }
    }
    
    override suspend fun speak(text: String, options: SpeechSynthesisOptions): SynthesisResult {
        // Speak text using on-device TTS
        val engine = ttsEngine ?: throw TtsSynthesisException("TTS engine not initialized")
        
        return withContext(Dispatchers.IO) {
            try {
                val utteranceId = "speak_${System.currentTimeMillis()}"
                val engineOptions = mapToEngineOptions(options)
                
                val audioData = engine.synthesize(text, engineOptions)
                engine.play(audioData)
                
                SynthesisResult(
                    id = utteranceId,
                    audioData = audioData,
                    duration = estimateDuration(text, options.speakingRate)
                )
            } catch (e: Exception) {
                logger.error("Failed to speak text using on-device TTS", e)
                throw TtsSynthesisException("On-device speech synthesis failed", e)
            }
        }
    }
    
    override suspend fun speakSsml(ssml: String, options: SpeechSynthesisOptions): SynthesisResult {
        // Speak SSML using on-device TTS
        val engine = ttsEngine ?: throw TtsSynthesisException("TTS engine not initialized")
        
        return withContext(Dispatchers.IO) {
            try {
                val utteranceId = "speak_ssml_${System.currentTimeMillis()}"
                val engineOptions = mapToEngineOptions(options)
                
                // Convert SSML to plain text if engine doesn't support SSML
                val plainText = if (engine.supportsSsml()) {
                    ssml
                } else {
                    SsmlParser.extractTextFromSsml(ssml)
                }
                
                val audioData = if (engine.supportsSsml()) {
                    engine.synthesizeSsml(ssml, engineOptions)
                } else {
                    engine.synthesize(plainText, engineOptions)
                }
                
                engine.play(audioData)
                
                SynthesisResult(
                    id = utteranceId,
                    audioData = audioData,
                    duration = estimateDuration(plainText, options.speakingRate)
                )
            } catch (e: Exception) {
                logger.error("Failed to speak SSML using on-device TTS", e)
                throw TtsSynthesisException("On-device SSML synthesis failed", e)
            }
        }
    }
    
    override suspend fun synthesize(text: String, options: SpeechSynthesisOptions): ByteArray {
        // Synthesize text to audio data using on-device TTS
        val engine = ttsEngine ?: throw TtsSynthesisException("TTS engine not initialized")
        
        return withContext(Dispatchers.IO) {
            try {
                val engineOptions = mapToEngineOptions(options)
                engine.synthesize(text, engineOptions)
            } catch (e: Exception) {
                logger.error("Failed to synthesize text using on-device TTS", e)
                throw TtsSynthesisException("On-device text synthesis failed", e)
            }
        }
    }
    
    override suspend fun synthesizeSsml(ssml: String, options: SpeechSynthesisOptions): ByteArray {
        // Synthesize SSML to audio data using on-device TTS
        val engine = ttsEngine ?: throw TtsSynthesisException("TTS engine not initialized")
        
        return withContext(Dispatchers.IO) {
            try {
                val engineOptions = mapToEngineOptions(options)
                
                if (engine.supportsSsml()) {
                    engine.synthesizeSsml(ssml, engineOptions)
                } else {
                    val plainText = SsmlParser.extractTextFromSsml(ssml)
                    engine.synthesize(plainText, engineOptions)
                }
            } catch (e: Exception) {
                logger.error("Failed to synthesize SSML using on-device TTS", e)
                throw TtsSynthesisException("On-device SSML synthesis failed", e)
            }
        }
    }
    
    override suspend fun synthesizeToStream(text: String, options: SpeechSynthesisOptions, outputStream: OutputStream) {
        // Synthesize text to output stream using on-device TTS
        val engine = ttsEngine ?: throw TtsSynthesisException("TTS engine not initialized")
        
        withContext(Dispatchers.IO) {
            try {
                val engineOptions = mapToEngineOptions(options)
                val audioData = engine.synthesize(text, engineOptions)
                outputStream.write(audioData)
                outputStream.flush()
            } catch (e: Exception) {
                logger.error("Failed to synthesize text to stream using on-device TTS", e)
                throw TtsSynthesisException("On-device stream synthesis failed", e)
            }
        }
    }
    
    override suspend fun synthesizeToFile(text: String, options: SpeechSynthesisOptions, outputFile: File): File {
        // Synthesize text to file using on-device TTS
        val engine = ttsEngine ?: throw TtsSynthesisException("TTS engine not initialized")
        
        return withContext(Dispatchers.IO) {
            try {
                val engineOptions = mapToEngineOptions(options)
                val audioData = engine.synthesize(text, engineOptions)
                
                outputFile.outputStream().use { stream ->
                    stream.write(audioData)
                    stream.flush()
                }
                
                outputFile
            } catch (e: Exception) {
                logger.error("Failed to synthesize text to file using on-device TTS", e)
                throw TtsSynthesisException("On-device file synthesis failed", e)
            }
        }
    }
    
    override suspend fun stop() {
        // Stop on-device TTS
        ttsEngine?.let {
            try {
                it.stop()
                logger.debug("On-device TTS playback stopped")
            } catch (e: Exception) {
                logger.error("Failed to stop on-device TTS", e)
            }
        }
    }
    
    override suspend fun shutdown() {
        // Release on-device TTS resources
        ttsEngine?.let {
            try {
                it.shutdown()
                ttsEngine = null
                logger.debug("On-device TTS engine shut down")
            } catch (e: Exception) {
                logger.error("Failed to shut down on-device TTS engine", e)
            }
        }
    }
    
    // Helper methods
    
    private fun mapToEngineOptions(options: SpeechSynthesisOptions): OnDeviceTtsOptions {
        return OnDeviceTtsOptions(
            voiceId = options.voiceId,
            pitch = options.pitch,
            speakingRate = options.speakingRate,
            volume = options.volume,
            audioFormat = mapAudioFormat(options.audioFormat)
        )
    }
    
    private fun mapAudioFormat(format: TtsAudioFormat): OnDeviceTtsAudioFormat {
        return when (format) {
            TtsAudioFormat.WAV -> OnDeviceTtsAudioFormat.WAV
            TtsAudioFormat.MP3 -> OnDeviceTtsAudioFormat.MP3
            TtsAudioFormat.OGG_OPUS -> OnDeviceTtsAudioFormat.OGG
            TtsAudioFormat.RAW_PCM -> OnDeviceTtsAudioFormat.PCM
        }
    }
    
    private fun mapGender(gender: String): VoiceGender {
        return when (gender.toLowerCase()) {
            "female" -> VoiceGender.FEMALE
            "male" -> VoiceGender.MALE
            else -> VoiceGender.NEUTRAL
        }
    }
    
    private fun mapAge(age: String): VoiceAge {
        return when (age.toLowerCase()) {
            "child" -> VoiceAge.CHILD
            "young", "young_adult" -> VoiceAge.YOUNG_ADULT
            "middle_aged", "middle-aged" -> VoiceAge.MIDDLE_AGED
            "older", "senior" -> VoiceAge.SENIOR
            else -> VoiceAge.ADULT
        }
    }
    
    private fun mapLanguage(locale: String): LanguageCode {
        return when (locale) {
            "en-US" -> LanguageCode.ENGLISH_US
            "en-GB" -> LanguageCode.ENGLISH_UK
            "fr-FR" -> LanguageCode.FRENCH
            "de-DE" -> LanguageCode.GERMAN
            "es-ES" -> LanguageCode.SPANISH
            "it-IT" -> LanguageCode.ITALIAN
            "ja-JP" -> LanguageCode.JAPANESE
            "ko-KR" -> LanguageCode.KOREAN
            "zh-CN" -> LanguageCode.CHINESE_SIMPLIFIED
            "ru-RU" -> LanguageCode.RUSSIAN
            else -> LanguageCode.ENGLISH_US // Default to US English
        }
    }
    
    /**
     * Estimate speech duration based on text length and speaking rate
     */
    private fun estimateDuration(text: String, speakingRate: Float): Long {
        // Average speaking rate is about 150 words per minute or 2.5 words per second
        // This is a rough estimate and will vary by language, voice, content, etc.
        val words = text.trim().split(Regex("\\s+")).size
        val wordsPerSecond = 2.5f * speakingRate
        val durationSeconds = words / wordsPerSecond
        return (durationSeconds * 1000).toLong() // Convert to milliseconds
    }
}
}

/**
 * Cloud-based text-to-speech implementation
 */
class CloudTextToSpeech : BaseTextToSpeech() {
    // Implementation details for cloud-based TTS
    // This would integrate with cloud TTS services
    
    override suspend fun initialize() {
        // Initialize cloud TTS resources
    }
    
    // Client for cloud TTS API
    private var cloudClient: CloudTtsClient? = null
    private val logger = LoggerFactory.getLogger(CloudTextToSpeech::class.java)
    private val availableVoices = mutableListOf<VoiceInfo>()
    
    override suspend fun initialize() {
        // Initialize cloud TTS resources
        try {
            cloudClient = CloudTtsClientFactory.createClient(
                CloudTtsConfig(
                    apiKey = SecureKeyStore.getCloudTtsApiKey(),
                    region = ConfigurationManager.getCloudRegion(),
                    timeout = 30000 // 30 seconds timeout
                )
            )
            
            // Cache available voices
            refreshAvailableVoices()
            
            logger.debug("Cloud TTS client initialized")
        } catch (e: Exception) {
            logger.error("Failed to initialize cloud TTS client", e)
            throw TtsSynthesisException("Could not initialize cloud TTS", e)
        }
    }
    
    override suspend fun getAvailableVoices(): List<VoiceInfo> {
        // Get available cloud voices
        return availableVoices
    }
    
    /**
     * Refresh the list of available voices from the cloud service
     */
    private suspend fun refreshAvailableVoices() {
        val client = cloudClient ?: return
        
        withContext(Dispatchers.IO) {
            try {
                val cloudVoices = client.listVoices()
                
                availableVoices.clear()
                availableVoices.addAll(cloudVoices.map { cloudVoice ->
                    VoiceInfo(
                        id = cloudVoice.id,
                        name = cloudVoice.name,
                        gender = mapGender(cloudVoice.gender),
                        age = mapAge(cloudVoice.age),
                        languageCodes = cloudVoice.languageCodes.map { mapLanguageCode(it) },
                        sampleRateHertz = cloudVoice.sampleRateHertz,
                        naturalness = cloudVoice.naturalness,
                        isNeural = cloudVoice.isNeural,
                        requiresNetwork = true, // Cloud voices always require network
                        customizationSupport = cloudVoice.supportsCustomization
                    )
                })
                
                logger.debug("Refreshed ${availableVoices.size} cloud voices")
            } catch (e: Exception) {
                logger.error("Failed to refresh cloud voices", e)
            }
        }
    }
    
    override suspend fun speak(text: String, options: SpeechSynthesisOptions): SynthesisResult {
        // Speak text using cloud TTS
        val client = cloudClient ?: throw TtsSynthesisException("Cloud TTS client not initialized")
        
        return withContext(Dispatchers.IO) {
            try {
                val cloudOptions = mapToCloudOptions(options)
                val result = client.synthesize(text, cloudOptions)
                
                // Play the synthesized audio
                val audioPlayer = AudioPlayerFactory.createPlayer()
                audioPlayer.playAudio(result.audioData)
                
                SynthesisResult(
                    id = result.id,
                    audioData = result.audioData,
                    duration = result.durationMs,
                    wordBoundaries = result.wordBoundaries.map { boundary ->
                        SynthesisResult.WordBoundary(
                            word = boundary.word,
                            startTimeMs = boundary.startTimeMs,
                            endTimeMs = boundary.endTimeMs
                        )
                    }
                )
            } catch (e: Exception) {
                logger.error("Failed to speak text using cloud TTS", e)
                throw TtsSynthesisException("Cloud speech synthesis failed", e)
            }
        }
    }
    
    override suspend fun speakSsml(ssml: String, options: SpeechSynthesisOptions): SynthesisResult {
        // Speak SSML using cloud TTS
        val client = cloudClient ?: throw TtsSynthesisException("Cloud TTS client not initialized")
        
        return withContext(Dispatchers.IO) {
            try {
                val cloudOptions = mapToCloudOptions(options)
                val result = client.synthesizeSsml(ssml, cloudOptions)
                
                // Play the synthesized audio
                val audioPlayer = AudioPlayerFactory.createPlayer()
                audioPlayer.playAudio(result.audioData)
                
                SynthesisResult(
                    id = result.id,
                    audioData = result.audioData,
                    duration = result.durationMs,
                    wordBoundaries = result.wordBoundaries.map { boundary ->
                        SynthesisResult.WordBoundary(
                            word = boundary.word,
                            startTimeMs = boundary.startTimeMs,
                            endTimeMs = boundary.endTimeMs
                        )
                    }
                )
            } catch (e: Exception) {
                logger.error("Failed to speak SSML using cloud TTS", e)
                throw TtsSynthesisException("Cloud SSML synthesis failed", e)
            }
        }
    }
    
    override suspend fun synthesize(text: String, options: SpeechSynthesisOptions): ByteArray {
        // Synthesize text to audio data using cloud TTS
        val client = cloudClient ?: throw TtsSynthesisException("Cloud TTS client not initialized")
        
        return withContext(Dispatchers.IO) {
            try {
                val cloudOptions = mapToCloudOptions(options)
                val result = client.synthesize(text, cloudOptions)
                result.audioData
            } catch (e: Exception) {
                logger.error("Failed to synthesize text using cloud TTS", e)
                throw TtsSynthesisException("Cloud text synthesis failed", e)
            }
        }
    }
    
    override suspend fun synthesizeSsml(ssml: String, options: SpeechSynthesisOptions): ByteArray {
        // Synthesize SSML to audio data using cloud TTS
        val client = cloudClient ?: throw TtsSynthesisException("Cloud TTS client not initialized")
        
        return withContext(Dispatchers.IO) {
            try {
                val cloudOptions = mapToCloudOptions(options)
                val result = client.synthesizeSsml(ssml, cloudOptions)
                result.audioData
            } catch (e: Exception) {
                logger.error("Failed to synthesize SSML using cloud TTS", e)
                throw TtsSynthesisException("Cloud SSML synthesis failed", e)
            }
        }
    }
    
    override suspend fun synthesizeToStream(text: String, options: SpeechSynthesisOptions, outputStream: OutputStream) {
        // Synthesize text to output stream using cloud TTS
        val client = cloudClient ?: throw TtsSynthesisException("Cloud TTS client not initialized")
        
        withContext(Dispatchers.IO) {
            try {
                val cloudOptions = mapToCloudOptions(options)
                client.synthesizeToStream(text, cloudOptions, outputStream)
            } catch (e: Exception) {
                logger.error("Failed to synthesize text to stream using cloud TTS", e)
                throw TtsSynthesisException("Cloud stream synthesis failed", e)
            }
        }
    }
    
    override suspend fun synthesizeToFile(text: String, options: SpeechSynthesisOptions, outputFile: File): File {
        // Synthesize text to file using cloud TTS
        val client = cloudClient ?: throw TtsSynthesisException("Cloud TTS client not initialized")
        
        return withContext(Dispatchers.IO) {
            try {
                val cloudOptions = mapToCloudOptions(options)
                client.synthesizeToFile(text, cloudOptions, outputFile)
            } catch (e: Exception) {
                logger.error("Failed to synthesize text to file using cloud TTS", e)
                throw TtsSynthesisException("Cloud file synthesis failed", e)
            }
        }
    }
    
    override suspend fun stop() {
        // Stop cloud TTS
    }
    
    override suspend fun shutdown() {
        // Release cloud TTS resources
    }
}

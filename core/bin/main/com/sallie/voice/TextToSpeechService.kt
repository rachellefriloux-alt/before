/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * Text-to-Speech Synthesis Service
 */

package com.sallie.voice

import android.content.Context
import android.media.AudioManager
import android.media.MediaPlayer
import android.speech.tts.TextToSpeech
import android.speech.tts.Voice
import com.google.cloud.texttospeech.v1.*
import kotlinx.coroutines.*
import java.io.File
import java.io.OutputStream
import java.util.*
import java.util.Locale

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
class EnhancedTextToSpeechService(
    private val context: Context
) : TextToSpeechService {
    
    private val _synthesisState = MutableStateFlow(SynthesisState.IDLE)
    override val synthesisState: StateFlow<SynthesisState> = _synthesisState.asStateFlow()
    
    // TTS engines for different modes
    private val onDeviceTts = OnDeviceTextToSpeech(context)
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
class OnDeviceTextToSpeech(
    private val context: Context
) : BaseTextToSpeech() {
    // Implementation details for on-device TTS
    // This would integrate with the device's native TTS capabilities

    private var textToSpeech: android.speech.tts.TextToSpeech? = null
    private var isInitialized = false
    private val availableVoices = mutableListOf<VoiceInfo>()
    private var currentSynthesisId: String? = null

    override suspend fun initialize() {
        withContext(Dispatchers.Main) {
            textToSpeech = android.speech.tts.TextToSpeech(context) { status ->
                if (status == android.speech.tts.TextToSpeech.SUCCESS) {
                    isInitialized = true
                    loadAvailableVoices()
                }
            }
        }
    }

    override suspend fun getAvailableVoices(): List<VoiceInfo> {
        // Get available on-device voices
        if (!isInitialized) {
            throw IllegalStateException("TTS not initialized")
        }

        return availableVoices.toList()
    }

    override suspend fun speak(text: String, options: SpeechSynthesisOptions): SynthesisResult {
        // Speak text using on-device TTS
        if (!isInitialized) {
            throw IllegalStateException("TTS not initialized")
        }

        val synthesisId = generateSynthesisId()
        currentSynthesisId = synthesisId

        // Apply speech options
        applySpeechOptions(options)

        // Start speaking
        val result = textToSpeech?.speak(text, android.speech.tts.TextToSpeech.QUEUE_FLUSH, null, synthesisId)

        return if (result == android.speech.tts.TextToSpeech.SUCCESS) {
            SynthesisResult(
                id = synthesisId,
                audioData = null, // On-device TTS doesn't provide audio data directly
                duration = estimateSpeechDuration(text, options),
                wordBoundaries = emptyList() // On-device TTS doesn't provide word boundaries
            )
        } else {
            throw RuntimeException("Failed to start speech synthesis")
        }
    }

    override suspend fun speakSsml(ssml: String, options: SpeechSynthesisOptions): SynthesisResult {
        // Speak SSML using on-device TTS
        if (!isInitialized) {
            throw IllegalStateException("TTS not initialized")
        }

        // Check if device supports SSML
        if (android.os.Build.VERSION.SDK_INT < android.os.Build.VERSION_CODES.LOLLIPOP) {
            throw UnsupportedOperationException("SSML not supported on this Android version")
        }

        val synthesisId = generateSynthesisId()
        currentSynthesisId = synthesisId

        // Apply speech options
        applySpeechOptions(options)

        // Start speaking SSML
        val result = textToSpeech?.speak(ssml, android.speech.tts.TextToSpeech.QUEUE_FLUSH, null, synthesisId)

        return if (result == android.speech.tts.TextToSpeech.SUCCESS) {
            SynthesisResult(
                id = synthesisId,
                audioData = null,
                duration = estimateSpeechDuration(ssml, options),
                wordBoundaries = emptyList()
            )
        } else {
            throw RuntimeException("Failed to start SSML synthesis")
        }
    }

    override suspend fun synthesize(text: String, options: SpeechSynthesisOptions): ByteArray {
        // Synthesize text to audio data using on-device TTS
        // Note: Android's on-device TTS doesn't directly support synthesizing to byte array
        // This would require additional processing or using a different approach
        throw UnsupportedOperationException("On-device TTS does not support direct audio data synthesis")
    }

    override suspend fun synthesizeSsml(ssml: String, options: SpeechSynthesisOptions): ByteArray {
        // Synthesize SSML to audio data using on-device TTS
        throw UnsupportedOperationException("On-device TTS does not support direct SSML audio data synthesis")
    }

    override suspend fun synthesizeToStream(text: String, options: SpeechSynthesisOptions, outputStream: OutputStream) {
        // Synthesize text to output stream using on-device TTS
        // This would require synthesizing to a temporary file first, then streaming
        throw UnsupportedOperationException("On-device TTS does not support direct stream synthesis")
    }

    override suspend fun synthesizeToFile(text: String, options: SpeechSynthesisOptions, outputFile: File): File {
        // Synthesize text to file using on-device TTS
        if (!isInitialized) {
            throw IllegalStateException("TTS not initialized")
        }

        val synthesisId = generateSynthesisId()
        currentSynthesisId = synthesisId

        // Apply speech options
        applySpeechOptions(options)

        // Create temporary file for synthesis
        val tempFile = File.createTempFile("tts_", ".wav")

        // Note: Android's on-device TTS doesn't have a direct synthesizeToFile method
        // This would require using the speak method with a file output or alternative approach
        throw UnsupportedOperationException("On-device TTS file synthesis requires additional implementation")
    }

    override suspend fun stop() {
        // Stop on-device TTS
        textToSpeech?.stop()
        currentSynthesisId = null
    }

    override suspend fun shutdown() {
        // Release on-device TTS resources
        textToSpeech?.shutdown()
        textToSpeech = null
        isInitialized = false
        availableVoices.clear()
        currentSynthesisId = null
    }

    /**
     * Apply speech synthesis options to the TTS engine
     */
    private fun applySpeechOptions(options: SpeechSynthesisOptions) {
        textToSpeech?.apply {
            // Set voice
            if (options.voiceId.isNotEmpty()) {
                val voice = android.speech.tts.Voice(options.voiceId, Locale.getDefault(), Voice.QUALITY_NORMAL, Voice.LATENCY_NORMAL, false, null)
                setVoice(voice)
            }

            // Set speech rate
            setSpeechRate(options.speakingRate)

            // Set pitch
            setPitch(options.pitch)

            // Set volume (if supported)
            // Note: Android TTS doesn't have direct volume control in older versions
        }
    }

    /**
     * Estimate speech duration based on text length and speaking rate
     */
    private fun estimateSpeechDuration(text: String, options: SpeechSynthesisOptions): Long {
        // Rough estimation: ~150 words per minute average speaking rate
        val wordsPerMinute = 150
        val wordCount = text.split("\\s+".toRegex()).size
        val baseDurationMinutes = wordCount.toDouble() / wordsPerMinute.toDouble()
        val adjustedDurationMinutes = baseDurationMinutes / options.speakingRate

        return (adjustedDurationMinutes * 60 * 1000).toLong()
    }

    /**
     * Generate a unique synthesis ID
     */
    private fun generateSynthesisId(): String {
        return "tts_${System.currentTimeMillis()}_${Math.random().toString(36).substring(2, 9)}"
    }

    /**
     * Load available voices from the device
     */
    private fun loadAvailableVoices() {
        textToSpeech?.let { tts ->
            availableVoices.clear()

            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.LOLLIPOP) {
                val voices = tts.voices
                if (voices != null) {
                    for (voice in voices) {
                        val voiceInfo = VoiceInfo(
                            id = voice.name,
                            name = voice.name,
                            gender = when {
                                voice.name.contains("male", ignoreCase = true) -> VoiceGender.MALE
                                voice.name.contains("female", ignoreCase = true) -> VoiceGender.FEMALE
                                else -> VoiceGender.NEUTRAL
                            },
                            age = VoiceAge.ADULT, // Default assumption
                            languageCodes = listOf(LanguageCode(voice.locale.toString())),
                            sampleRateHertz = 22050, // Default sample rate
                            naturalness = 0.7f, // On-device voices are generally less natural than cloud
                            isNeural = false, // On-device voices are typically not neural
                            requiresNetwork = false,
                            customizationSupport = false
                        )
                        availableVoices.add(voiceInfo)
                    }
                }
            }

            // Fallback for older Android versions
            if (availableVoices.isEmpty()) {
                val defaultVoice = VoiceInfo(
                    id = "default",
                    name = "Default Voice",
                    gender = VoiceGender.NEUTRAL,
                    age = VoiceAge.ADULT,
                    languageCodes = listOf(LanguageCode(Locale.getDefault().toString())),
                    sampleRateHertz = 22050,
                    naturalness = 0.6f,
                    isNeural = false,
                    requiresNetwork = false,
                    customizationSupport = false
                )
                availableVoices.add(defaultVoice)
            }
        }
    }

    /**
     * Check if TTS is ready for use
     */
    fun isReady(): Boolean {
        return isInitialized && textToSpeech != null
    }

    /**
     * Get current synthesis status
     */
    fun getCurrentSynthesisId(): String? {
        return currentSynthesisId
    }
}

/**
 * Cloud-based text-to-speech implementation
 */
class CloudTextToSpeech : BaseTextToSpeech() {
    // Implementation details for cloud-based TTS
    // This integrates with Google Cloud Text-to-Speech API

    private var textToSpeechClient: TextToSpeechClient? = null
    private var isInitialized = false
    private val availableVoices = mutableListOf<VoiceInfo>()
    private var currentSynthesisId: String? = null
    private var mediaPlayer: MediaPlayer? = null

    override suspend fun initialize() {
        withContext(Dispatchers.IO) {
            try {
                // Initialize Google Cloud Text-to-Speech client
                // Note: In production, this would use proper authentication
                textToSpeechClient = TextToSpeechClient.create()
                isInitialized = true
                loadAvailableVoices()
            } catch (e: Exception) {
                isInitialized = false
                throw RuntimeException("Failed to initialize cloud TTS: ${e.message}")
            }
        }
    }

    override suspend fun getAvailableVoices(): List<VoiceInfo> {
        if (!isInitialized) {
            throw IllegalStateException("Cloud TTS not initialized")
        }
        return availableVoices.toList()
    }

    override suspend fun speak(text: String, options: SpeechSynthesisOptions): SynthesisResult {
        if (!isInitialized) {
            throw IllegalStateException("Cloud TTS not initialized")
        }

        val synthesisId = generateSynthesisId()
        currentSynthesisId = synthesisId

        return withContext(Dispatchers.IO) {
            try {
                val audioData = synthesize(text, options)

                // Play the audio data
                playAudioData(audioData)

                SynthesisResult(
                    id = synthesisId,
                    audioData = audioData,
                    duration = estimateSpeechDuration(text, options),
                    wordBoundaries = emptyList() // Cloud TTS doesn't provide word boundaries in basic implementation
                )
            } catch (e: Exception) {
                throw RuntimeException("Failed to speak text: ${e.message}")
            }
        }
    }

    override suspend fun speakSsml(ssml: String, options: SpeechSynthesisOptions): SynthesisResult {
        if (!isInitialized) {
            throw IllegalStateException("Cloud TTS not initialized")
        }

        val synthesisId = generateSynthesisId()
        currentSynthesisId = synthesisId

        return withContext(Dispatchers.IO) {
            try {
                val audioData = synthesizeSsml(ssml, options)

                // Play the audio data
                playAudioData(audioData)

                SynthesisResult(
                    id = synthesisId,
                    audioData = audioData,
                    duration = estimateSpeechDuration(ssml, options),
                    wordBoundaries = emptyList()
                )
            } catch (e: Exception) {
                throw RuntimeException("Failed to speak SSML: ${e.message}")
            }
        }
    }

    override suspend fun synthesize(text: String, options: SpeechSynthesisOptions): ByteArray {
        if (!isInitialized) {
            throw IllegalStateException("Cloud TTS not initialized")
        }

        return withContext(Dispatchers.IO) {
            try {
                val synthesisInput = SynthesisInput.newBuilder()
                    .setText(text)
                    .build()

                val voice = createVoiceSelectionParams(options)
                val audioConfig = createAudioConfig(options)

                val request = SynthesizeSpeechRequest.newBuilder()
                    .setInput(synthesisInput)
                    .setVoice(voice)
                    .setAudioConfig(audioConfig)
                    .build()

                val response = textToSpeechClient?.synthesizeSpeech(request)
                    ?: throw RuntimeException("Text-to-speech client not available")

                response.audioContent.toByteArray()
            } catch (e: Exception) {
                throw RuntimeException("Failed to synthesize text: ${e.message}")
            }
        }
    }

    override suspend fun synthesizeSsml(ssml: String, options: SpeechSynthesisOptions): ByteArray {
        if (!isInitialized) {
            throw IllegalStateException("Cloud TTS not initialized")
        }

        return withContext(Dispatchers.IO) {
            try {
                val synthesisInput = SynthesisInput.newBuilder()
                    .setSsml(ssml)
                    .build()

                val voice = createVoiceSelectionParams(options)
                val audioConfig = createAudioConfig(options)

                val request = SynthesizeSpeechRequest.newBuilder()
                    .setInput(synthesisInput)
                    .setVoice(voice)
                    .setAudioConfig(audioConfig)
                    .build()

                val response = textToSpeechClient?.synthesizeSpeech(request)
                    ?: throw RuntimeException("Text-to-speech client not available")

                response.audioContent.toByteArray()
            } catch (e: Exception) {
                throw RuntimeException("Failed to synthesize SSML: ${e.message}")
            }
        }
    }

    override suspend fun synthesizeToStream(text: String, options: SpeechSynthesisOptions, outputStream: OutputStream) {
        if (!isInitialized) {
            throw IllegalStateException("Cloud TTS not initialized")
        }

        return withContext(Dispatchers.IO) {
            try {
                val audioData = synthesize(text, options)
                outputStream.write(audioData)
                outputStream.flush()
            } catch (e: Exception) {
                throw RuntimeException("Failed to synthesize to stream: ${e.message}")
            }
        }
    }

    override suspend fun synthesizeToFile(text: String, options: SpeechSynthesisOptions, outputFile: File): File {
        if (!isInitialized) {
            throw IllegalStateException("Cloud TTS not initialized")
        }

        return withContext(Dispatchers.IO) {
            try {
                val audioData = synthesize(text, options)
                outputFile.writeBytes(audioData)
                outputFile
            } catch (e: Exception) {
                throw RuntimeException("Failed to synthesize to file: ${e.message}")
            }
        }
    }

    override suspend fun stop() {
        withContext(Dispatchers.Main) {
            mediaPlayer?.stop()
            mediaPlayer?.reset()
            currentSynthesisId = null
        }
    }

    override suspend fun shutdown() {
        try {
            withContext(Dispatchers.Main) {
                mediaPlayer?.release()
                mediaPlayer = null
            }
            textToSpeechClient?.close()
            textToSpeechClient = null
            isInitialized = false
            availableVoices.clear()
            currentSynthesisId = null
        } catch (e: Exception) {
            // Log error but don't throw during shutdown
        }
    }

    /**
     * Load available voices from Google Cloud Text-to-Speech
     */
    private suspend fun loadAvailableVoices() {
        withContext(Dispatchers.IO) {
            try {
                val request = ListVoicesRequest.getDefaultInstance()
                val response = textToSpeechClient?.listVoices(request)

                response?.voicesList?.forEach { voice ->
                    val voiceInfo = VoiceInfo(
                        id = voice.name,
                        name = voice.name,
                        gender = when (voice.ssmlGender) {
                            SsmlVoiceGender.MALE -> VoiceGender.MALE
                            SsmlVoiceGender.FEMALE -> VoiceGender.FEMALE
                            else -> VoiceGender.NEUTRAL
                        },
                        age = VoiceAge.ADULT, // Default assumption for cloud voices
                        languageCodes = voice.languageCodesList.map { LanguageCode(it) },
                        sampleRateHertz = 24000, // Default sample rate for cloud TTS
                        naturalness = 0.9f, // Cloud voices are generally more natural
                        isNeural = voice.name.contains("Neural2") || voice.name.contains("Wavenet"),
                        requiresNetwork = true,
                        customizationSupport = false
                    )
                    availableVoices.add(voiceInfo)
                }
            } catch (e: Exception) {
                // Fallback voices if API call fails
                addFallbackVoices()
            }
        }
    }

    /**
     * Add fallback voices when API is not available
     */
    private fun addFallbackVoices() {
        val fallbackVoices = listOf(
            VoiceInfo(
                id = "en-US-Neural2-F",
                name = "English US Female Neural",
                gender = VoiceGender.FEMALE,
                age = VoiceAge.ADULT,
                languageCodes = listOf(LanguageCode("en-US")),
                sampleRateHertz = 24000,
                naturalness = 0.95f,
                isNeural = true,
                requiresNetwork = true,
                customizationSupport = false
            ),
            VoiceInfo(
                id = "en-US-Neural2-D",
                name = "English US Male Neural",
                gender = VoiceGender.MALE,
                age = VoiceAge.ADULT,
                languageCodes = listOf(LanguageCode("en-US")),
                sampleRateHertz = 24000,
                naturalness = 0.95f,
                isNeural = true,
                requiresNetwork = true,
                customizationSupport = false
            )
        )
        availableVoices.addAll(fallbackVoices)
    }

    /**
     * Create voice selection parameters for Google Cloud TTS
     */
    private fun createVoiceSelectionParams(options: SpeechSynthesisOptions): VoiceSelectionParams {
        val builder = VoiceSelectionParams.newBuilder()
            .setLanguageCode(options.languageCode.code)

        if (options.voiceId.isNotEmpty()) {
            builder.setName(options.voiceId)
        }

        return builder.build()
    }

    /**
     * Create audio configuration for Google Cloud TTS
     */
    private fun createAudioConfig(options: SpeechSynthesisOptions): AudioConfig {
        return AudioConfig.newBuilder()
            .setAudioEncoding(AudioEncoding.LINEAR16)
            .setSpeakingRate(options.speakingRate.toDouble())
            .setPitch(options.pitch.toDouble())
            .setVolumeGainDb((20 * Math.log10(options.volume.toDouble())).toFloat())
            .build()
    }

    /**
     * Play audio data using MediaPlayer
     */
    private suspend fun playAudioData(audioData: ByteArray) {
        withContext(Dispatchers.Main) {
            try {
                mediaPlayer?.release()
                mediaPlayer = MediaPlayer().apply {
                    setAudioStreamType(AudioManager.STREAM_MUSIC)
                    setDataSource(audioData.inputStream().fd)
                    prepare()
                    start()
                }
            } catch (e: Exception) {
                throw RuntimeException("Failed to play audio: ${e.message}")
            }
        }
    }

    /**
     * Estimate speech duration based on text length and speaking rate
     */
    private fun estimateSpeechDuration(text: String, options: SpeechSynthesisOptions): Long {
        // Rough estimation: ~150 words per minute average speaking rate
        val wordsPerMinute = 150
        val wordCount = text.split("\\s+".toRegex()).size
        val baseDurationMinutes = wordCount.toDouble() / wordsPerMinute.toDouble()
        val adjustedDurationMinutes = baseDurationMinutes / options.speakingRate

        return (adjustedDurationMinutes * 60 * 1000).toLong()
    }

    /**
     * Generate a unique synthesis ID
     */
    private fun generateSynthesisId(): String {
        return "cloud_tts_${System.currentTimeMillis()}_${Math.random().toString(36).substring(2, 9)}"
    }
}

// =============================================================================
// DATA CLASSES AND ENUMS
// =============================================================================

/**
 * Voice gender options
 */
enum class VoiceGender {
    MALE,
    FEMALE,
    NEUTRAL
}

/**
 * Voice age categories
 */
enum class VoiceAge {
    CHILD,
    TEEN,
    ADULT,
    SENIOR
}

/**
 * Language code for voice synthesis
 */
data class LanguageCode(val code: String)

/**
 * Speech synthesis options
 */
data class SpeechSynthesisOptions(
    val voiceId: String = "",
    val speakingRate: Float = 1.0f,
    val pitch: Float = 1.0f,
    val volume: Float = 1.0f,
    val languageCode: LanguageCode = LanguageCode("en-US")
)

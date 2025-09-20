/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * Text-to-Speech Synthesis Service
 */

package com.sallie.voice

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.flow
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
    
    override suspend fun getAvailableVoices(): List<VoiceInfo> {
        // Get available on-device voices from system TTS engine
        return listOf(
            VoiceInfo(
                id = "ondevice-en-us-female",
                name = "On-device English (US) Female",
                gender = VoiceGender.FEMALE,
                age = VoiceAge.ADULT,
                languageCodes = listOf(LanguageCode.EN_US),
                sampleRateHertz = 22050,
                naturalness = 0.7f,
                isNeural = false,
                requiresNetwork = false,
                customizationSupport = false
            ),
            VoiceInfo(
                id = "ondevice-en-us-male",
                name = "On-device English (US) Male",
                gender = VoiceGender.MALE,
                age = VoiceAge.ADULT,
                languageCodes = listOf(LanguageCode.EN_US),
                sampleRateHertz = 22050,
                naturalness = 0.7f,
                isNeural = false,
                requiresNetwork = false,
                customizationSupport = false
            )
        )
    }
    
    override suspend fun speak(text: String, options: SpeechSynthesisOptions): SynthesisResult {
        val audioData = synthesize(text, options)
        playAudio(audioData)
        
        // Generate word boundaries based on text length and duration
        val words = text.split(" ")
        val avgDuration = 250L // average ms per word
        val wordBoundaries = words.mapIndexed { index, word ->
            SynthesisResult.WordBoundary(
                word = word,
                startTimeMs = index * avgDuration,
                endTimeMs = (index + 1) * avgDuration
            )
        }
        
        return SynthesisResult(
            id = "speech-${System.currentTimeMillis()}",
            audioData = audioData,
            duration = words.size * avgDuration,
            wordBoundaries = wordBoundaries
        )
    }
    
    override suspend fun speakSsml(ssml: String, options: SpeechSynthesisOptions): SynthesisResult {
        // Extract plain text from SSML for fallback
        val plainText = extractTextFromSsml(ssml)
        return speak(plainText, options)
    }
    
    override suspend fun synthesize(text: String, options: SpeechSynthesisOptions): ByteArray {
        // Generate audio data based on text and options
        // For implementation, would connect to platform's TTS engine
        val sampleRate = 22050
        val bitDepth = 16
        val channels = 1
        
        // Calculate rough size for audio data (text length * average bytes per character)
        val estimatedSize = text.length * 100
        return ByteArray(estimatedSize).also { 
            // In a real implementation, would fill with actual audio data
            // This is just a placeholder
            it[0] = 'R'.code.toByte()
            it[1] = 'I'.code.toByte()
            it[2] = 'F'.code.toByte()
            it[3] = 'F'.code.toByte()
        }
    }
    
    override suspend fun synthesizeSsml(ssml: String, options: SpeechSynthesisOptions): ByteArray {
        val plainText = extractTextFromSsml(ssml)
        return synthesize(plainText, options)
    }
    
    override suspend fun synthesizeToStream(text: String, options: SpeechSynthesisOptions, outputStream: OutputStream) {
        val audioData = synthesize(text, options)
        outputStream.write(audioData)
        outputStream.flush()
    }
    
    override suspend fun synthesizeToFile(text: String, options: SpeechSynthesisOptions, outputFile: File): File {
        val audioData = synthesize(text, options)
        outputFile.writeBytes(audioData)
        return outputFile
    }
    
    override suspend fun stop() {
        // Stop any ongoing speech synthesis
        // Would connect to platform TTS engine's stop method
    }
    
    override suspend fun shutdown() {
        // Release on-device TTS resources
        // Would properly dispose of platform TTS engine
    }
    
    // Helper methods
    private fun extractTextFromSsml(ssml: String): String {
        // Simple regex to extract text content from SSML
        return ssml.replace(Regex("<[^>]*>"), "").trim()
    }
    
    private fun playAudio(audioData: ByteArray) {
        // Would use platform's audio playback capabilities
        // For implementation, would create an AudioTrack or similar
    }
}

/**
 * Cloud-based text-to-speech implementation
 */
class CloudTextToSpeech : BaseTextToSpeech() {
    // Mock API client for cloud TTS services
    private val apiClient = CloudTtsApiClient()
    private var isInitialized = false
    private var currentRequestId: String? = null
    
    override suspend fun initialize() {
        // Initialize cloud connection and authentication
        apiClient.authenticate()
        isInitialized = true
    }
    
    override suspend fun getAvailableVoices(): List<VoiceInfo> {
        if (!isInitialized) initialize()
        
        return listOf(
            VoiceInfo(
                id = "cloud-en-us-female-neural",
                name = "Cloud Neural English (US) Female",
                gender = VoiceGender.FEMALE,
                age = VoiceAge.ADULT,
                languageCodes = listOf(LanguageCode.EN_US),
                sampleRateHertz = 48000,
                naturalness = 0.95f,
                isNeural = true,
                requiresNetwork = true,
                customizationSupport = true
            ),
            VoiceInfo(
                id = "cloud-en-us-male-neural",
                name = "Cloud Neural English (US) Male",
                gender = VoiceGender.MALE,
                age = VoiceAge.ADULT,
                languageCodes = listOf(LanguageCode.EN_US),
                sampleRateHertz = 48000,
                naturalness = 0.95f,
                isNeural = true,
                requiresNetwork = true,
                customizationSupport = true
            )
        )
    }
    
    override suspend fun speak(text: String, options: SpeechSynthesisOptions): SynthesisResult {
        if (!isInitialized) initialize()
        
        val requestId = "req-${System.currentTimeMillis()}"
        currentRequestId = requestId
        
        val apiRequest = CloudTtsRequest(
            text = text,
            voiceId = options.voiceId,
            pitch = options.pitch,
            speakingRate = options.speakingRate,
            volume = options.volume
        )
        
        val apiResponse = apiClient.synthesize(apiRequest)
        playAudio(apiResponse.audioData)
        
        return SynthesisResult(
            id = requestId,
            audioData = apiResponse.audioData,
            duration = apiResponse.durationMs,
            wordBoundaries = apiResponse.wordTimings.map { 
                SynthesisResult.WordBoundary(
                    word = it.word,
                    startTimeMs = it.startMs,
                    endTimeMs = it.endMs
                ) 
            }
        )
    }
    
    override suspend fun speakSsml(ssml: String, options: SpeechSynthesisOptions): SynthesisResult {
        if (!isInitialized) initialize()
        
        val requestId = "req-${System.currentTimeMillis()}"
        currentRequestId = requestId
        
        val apiRequest = CloudTtsSsmlRequest(
            ssml = ssml,
            voiceId = options.voiceId,
            pitch = options.pitch,
            speakingRate = options.speakingRate,
            volume = options.volume
        )
        
        val apiResponse = apiClient.synthesizeSsml(apiRequest)
        playAudio(apiResponse.audioData)
        
        return SynthesisResult(
            id = requestId,
            audioData = apiResponse.audioData,
            duration = apiResponse.durationMs,
            wordBoundaries = apiResponse.wordTimings.map { 
                SynthesisResult.WordBoundary(
                    word = it.word,
                    startTimeMs = it.startMs,
                    endTimeMs = it.endMs
                ) 
            }
        )
    }
    
    override suspend fun synthesize(text: String, options: SpeechSynthesisOptions): ByteArray {
        if (!isInitialized) initialize()
        
        val apiRequest = CloudTtsRequest(
            text = text,
            voiceId = options.voiceId,
            pitch = options.pitch,
            speakingRate = options.speakingRate,
            volume = options.volume
        )
        
        val apiResponse = apiClient.synthesize(apiRequest)
        return apiResponse.audioData
    }
    
    override suspend fun synthesizeSsml(ssml: String, options: SpeechSynthesisOptions): ByteArray {
        if (!isInitialized) initialize()
        
        val apiRequest = CloudTtsSsmlRequest(
            ssml = ssml,
            voiceId = options.voiceId,
            pitch = options.pitch,
            speakingRate = options.speakingRate,
            volume = options.volume
        )
        
        val apiResponse = apiClient.synthesizeSsml(apiRequest)
        return apiResponse.audioData
    }
    
    override suspend fun synthesizeToStream(text: String, options: SpeechSynthesisOptions, outputStream: OutputStream) {
        val audioData = synthesize(text, options)
        outputStream.write(audioData)
        outputStream.flush()
    }
    
    override suspend fun synthesizeToFile(text: String, options: SpeechSynthesisOptions, outputFile: File): File {
        val audioData = synthesize(text, options)
        outputFile.writeBytes(audioData)
        return outputFile
    }
    
    override suspend fun stop() {
        currentRequestId?.let {
            apiClient.cancelRequest(it)
            currentRequestId = null
        }
    }
    
    override suspend fun shutdown() {
        apiClient.disconnect()
        isInitialized = false
    }
    
    private fun playAudio(audioData: ByteArray) {
        // Would use platform's audio playback capabilities
    }
    
    // Mock cloud API client (would be replaced with actual client implementation)
    private inner class CloudTtsApiClient {
        fun authenticate() {
            // Would authenticate with cloud service
        }
        
        fun synthesize(request: CloudTtsRequest): CloudTtsResponse {
            // Would make API call to cloud service
            return CloudTtsResponse(
                audioData = ByteArray(request.text.length * 500),
                durationMs = request.text.length * 100L,
                wordTimings = generateWordTimings(request.text)
            )
        }
        
        fun synthesizeSsml(request: CloudTtsSsmlRequest): CloudTtsResponse {
            // Would make API call to cloud service
            val plainText = request.ssml.replace(Regex("<[^>]*>"), "").trim()
            return CloudTtsResponse(
                audioData = ByteArray(plainText.length * 500),
                durationMs = plainText.length * 100L,
                wordTimings = generateWordTimings(plainText)
            )
        }
        
        fun cancelRequest(requestId: String) {
            // Would cancel ongoing request
        }
        
        fun disconnect() {
            // Would disconnect from cloud service
        }
        
        private fun generateWordTimings(text: String): List<WordTiming> {
            val words = text.split(" ")
            var currentTime = 0L
            return words.map { word ->
                val startMs = currentTime
                val duration = word.length * 80L
                currentTime += duration
                WordTiming(word, startMs, currentTime)
            }
        }
    }
    
    private data class CloudTtsRequest(
        val text: String,
        val voiceId: String,
        val pitch: Float = 1.0f,
        val speakingRate: Float = 1.0f,
        val volume: Float = 1.0f
    )
    
    private data class CloudTtsSsmlRequest(
        val ssml: String,
        val voiceId: String,
        val pitch: Float = 1.0f,
        val speakingRate: Float = 1.0f,
        val volume: Float = 1.0f
    )
    
    private data class CloudTtsResponse(
        val audioData: ByteArray,
        val durationMs: Long,
        val wordTimings: List<WordTiming>
    ) {
        override fun equals(other: Any?): Boolean {
            if (this === other) return true
            if (javaClass != other?.javaClass) return false

            other as CloudTtsResponse

            if (!audioData.contentEquals(other.audioData)) return false
            if (durationMs != other.durationMs) return false
            if (wordTimings != other.wordTimings) return false

            return true
        }

        override fun hashCode(): Int {
            var result = audioData.contentHashCode()
            result = 31 * result + durationMs.hashCode()
            result = 31 * result + wordTimings.hashCode()
            return result
        }
    }
    
    private data class WordTiming(
        val word: String,
        val startMs: Long,
        val endMs: Long
    )
}

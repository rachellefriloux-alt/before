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
        // A simplified implementation of on-device voice listing
        return listOf(
            VoiceInfo(
                id = "ondevice-en-us-female-1",
                name = "Samantha",
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
                id = "ondevice-en-us-male-1",
                name = "David",
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
        // Simulate speaking with on-device TTS
        val audioData = synthesize(text, options)
        // Calculate duration based on text length and speaking rate
        val duration = (text.length * 50 * (1.0f / options.speakingRate)).toLong()
        
        return SynthesisResult(
            id = "ondevice-${System.currentTimeMillis()}",
            audioData = audioData,
            duration = duration,
            wordBoundaries = generateWordBoundaries(text, duration)
        )
    }
    
    override suspend fun speakSsml(ssml: String, options: SpeechSynthesisOptions): SynthesisResult {
        // Extract plain text from SSML for simple implementation
        val plainText = ssml.replace(Regex("<[^>]*>"), "")
        return speak(plainText, options)
    }
    
    override suspend fun synthesize(text: String, options: SpeechSynthesisOptions): ByteArray {
        // Simulate audio data generation
        // In a real implementation, this would use the device's TTS engine
        // For now, we're just creating dummy audio data
        val dummyAudioData = ByteArray(text.length * 500) { 0 }
        
        // Apply voice, pitch and rate options to the synthesis
        // (This is a placeholder - real implementation would use these settings)
        println("Synthesizing with voice: ${options.voiceId}, pitch: ${options.pitch}, rate: ${options.speakingRate}")
        
        return dummyAudioData
    }
    
    override suspend fun synthesizeSsml(ssml: String, options: SpeechSynthesisOptions): ByteArray {
        // Extract plain text from SSML for simple implementation
        val plainText = ssml.replace(Regex("<[^>]*>"), "")
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
        // Stop any ongoing on-device TTS playback
        println("Stopping on-device TTS playback")
    }
    
    override suspend fun shutdown() {
        // Release on-device TTS resources
        println("Shutting down on-device TTS engine and releasing resources")
    }
    
    // Helper method to generate word boundaries for synchronization
    private fun generateWordBoundaries(text: String, totalDuration: Long): List<SynthesisResult.WordBoundary> {
        val words = text.split(Regex("\\s+"))
        val boundaries = mutableListOf<SynthesisResult.WordBoundary>()
        val wordDuration = totalDuration / words.size
        
        var currentTime = 0L
        for (word in words) {
            if (word.isNotEmpty()) {
                boundaries.add(
                    SynthesisResult.WordBoundary(
                        word = word,
                        startTimeMs = currentTime,
                        endTimeMs = currentTime + wordDuration
                    )
                )
                currentTime += wordDuration
            }
        }
        
        return boundaries
    }
}

/**
 * Cloud-based text-to-speech implementation
 */
class CloudTextToSpeech : BaseTextToSpeech() {
    private val apiEndpoint = "https://api.tts.cloud.example.com/v1/synthesize"
    private var apiKey = "simulated-api-key"
    
    override suspend fun initialize() {
        // Initialize cloud TTS resources
        println("Initializing cloud TTS service connection")
        // In a real implementation, this might fetch API keys from secure storage
    }
    
    override suspend fun getAvailableVoices(): List<VoiceInfo> {
        // Simulated list of cloud-based voices
        return listOf(
            VoiceInfo(
                id = "cloud-en-us-female-1",
                name = "Claire",
                gender = VoiceGender.FEMALE,
                age = VoiceAge.ADULT,
                languageCodes = listOf(LanguageCode.EN_US),
                sampleRateHertz = 24000,
                naturalness = 0.95f,
                isNeural = true,
                requiresNetwork = true,
                customizationSupport = true
            ),
            VoiceInfo(
                id = "cloud-en-us-male-1",
                name = "James",
                gender = VoiceGender.MALE,
                age = VoiceAge.ADULT,
                languageCodes = listOf(LanguageCode.EN_US),
                sampleRateHertz = 24000,
                naturalness = 0.95f,
                isNeural = true,
                requiresNetwork = true,
                customizationSupport = true
            ),
            VoiceInfo(
                id = "cloud-en-gb-female-1",
                name = "Emma",
                gender = VoiceGender.FEMALE,
                age = VoiceAge.ADULT,
                languageCodes = listOf(LanguageCode.EN_GB),
                sampleRateHertz = 24000,
                naturalness = 0.92f,
                isNeural = true,
                requiresNetwork = true,
                customizationSupport = true
            )
        )
    }
    
    override suspend fun speak(text: String, options: SpeechSynthesisOptions): SynthesisResult {
        // Simulate API call for speech synthesis
        println("Cloud TTS API call: $apiEndpoint")
        println("Text: $text")
        println("Voice: ${options.voiceId}")
        
        // Simulate network delay
        kotlinx.coroutines.delay(300)
        
        val audioData = synthesize(text, options)
        val duration = (text.length * 60 * (1.0f / options.speakingRate)).toLong()
        
        return SynthesisResult(
            id = "cloud-${System.currentTimeMillis()}",
            audioData = audioData,
            duration = duration,
            wordBoundaries = generateDetailedWordBoundaries(text, duration)
        )
    }
    
    override suspend fun speakSsml(ssml: String, options: SpeechSynthesisOptions): SynthesisResult {
        println("Cloud TTS API call with SSML: $apiEndpoint")
        println("SSML: $ssml")
        println("Voice: ${options.voiceId}")
        
        // Simulate network delay
        kotlinx.coroutines.delay(350)
        
        val audioData = synthesizeSsml(ssml, options)
        // Extract plain text to estimate duration
        val plainText = ssml.replace(Regex("<[^>]*>"), "")
        val duration = (plainText.length * 60 * (1.0f / options.speakingRate)).toLong()
        
        return SynthesisResult(
            id = "cloud-ssml-${System.currentTimeMillis()}",
            audioData = audioData,
            duration = duration,
            wordBoundaries = generateDetailedWordBoundaries(plainText, duration)
        )
    }
    
    override suspend fun synthesize(text: String, options: SpeechSynthesisOptions): ByteArray {
        // Simulate cloud API call for synthesis
        println("Cloud TTS synthesis request for text: ${text.take(50)}${if (text.length > 50) "..." else ""}")
        
        // Simulate network delay
        kotlinx.coroutines.delay(text.length / 5L)
        
        // Create mock audio data with higher quality than on-device
        return ByteArray(text.length * 800) { (it % 256).toByte() }
    }
    
    override suspend fun synthesizeSsml(ssml: String, options: SpeechSynthesisOptions): ByteArray {
        // Simulate cloud API call for SSML synthesis
        println("Cloud TTS synthesis request for SSML: ${ssml.take(50)}${if (ssml.length > 50) "..." else ""}")
        
        // Simulate network delay
        kotlinx.coroutines.delay(ssml.length / 5L)
        
        // Create mock audio data
        return ByteArray(ssml.length * 800) { (it % 256).toByte() }
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
        // Stop any ongoing cloud TTS synthesis or playback
        println("Cancelling cloud TTS requests")
    }
    
    override suspend fun shutdown() {
        // Release cloud TTS resources
        println("Closing cloud TTS connections and releasing resources")
        apiKey = ""
    }
    
    // Helper method to generate more detailed word boundaries for neural voices
    private fun generateDetailedWordBoundaries(text: String, totalDuration: Long): List<SynthesisResult.WordBoundary> {
        val words = text.split(Regex("\\s+"))
        val boundaries = mutableListOf<SynthesisResult.WordBoundary>()
        
        var currentTime = 0L
        for (word in words) {
            if (word.isNotEmpty()) {
                // Make word durations proportional to length for more realistic timing
                val wordDuration = (word.length * 75 + 50).toLong()
                boundaries.add(
                    SynthesisResult.WordBoundary(
                        word = word,
                        startTimeMs = currentTime,
                        endTimeMs = currentTime + wordDuration
                    )
                )
                currentTime += wordDuration
            }
        }
        
        return boundaries
    }
}

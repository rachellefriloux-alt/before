package com.sallie.core.voice.synthesis

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioManager
import android.media.AudioTrack
import android.os.Build
import android.os.Handler
import android.os.Looper
import com.sallie.core.voice.*
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import java.util.concurrent.atomic.AtomicBoolean
import java.util.concurrent.atomic.AtomicInteger

/**
 * Sallie's On-Device Voice Synthesizer
 * 
 * Provides high quality text-to-speech synthesis entirely on device
 * without requiring network connectivity.
 */
class OnDeviceVoiceSynthesizer(
    private val context: Context
) : VoiceSynthesizer {
    
    private val coroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    private val mainHandler = Handler(Looper.getMainLooper())
    
    private val isInitialized = AtomicBoolean(false)
    private val isSpeaking = AtomicBoolean(false)
    private val isShuttingDown = AtomicBoolean(false)
    private val activeJob = AtomicInteger(0)
    
    private val synthesisFlow = MutableSharedFlow<VoiceSynthesisProgress>(replay = 0)
    private val listeners = mutableSetOf<VoiceSystemListener>()
    
    private var voiceCharacteristics = VoiceCharacteristics()
    private var audioTrack: AudioTrack? = null
    
    private var currentVoiceProfile: String? = null
    private val availableVoices = mutableListOf<VoiceProfile>()
    
    override suspend fun initialize(config: VoiceSynthesizerConfig) {
        if (isInitialized.get()) {
            return
        }
        
        // Load voice profiles
        loadVoiceProfiles()
        
        // Set default voice profile if specified
        config.defaultVoiceProfile?.let { profileId ->
            availableVoices.find { it.id == profileId }?.let {
                currentVoiceProfile = it.id
            }
        }
        
        isInitialized.set(true)
    }
    
    override fun getStatus(): VoiceSynthesizerStatus {
        return VoiceSynthesizerStatus(
            isInitialized = isInitialized.get(),
            isSpeaking = isSpeaking.get(),
            currentVoiceProfile = currentVoiceProfile
        )
    }
    
    override fun speak(text: String, options: VoiceSynthesisOptions): Flow<VoiceSynthesisProgress> {
        if (!isInitialized.get()) {
            coroutineScope.launch {
                synthesisFlow.emit(
                    VoiceSynthesisProgress(
                        state = SynthesisState.ERROR,
                        text = text,
                        processedCharacters = 0,
                        totalCharacters = text.length,
                        error = "Voice synthesizer not initialized"
                    )
                )
            }
            return synthesisFlow.asSharedFlow()
        }
        
        // If already speaking, stop current synthesis
        if (isSpeaking.getAndSet(true)) {
            coroutineScope.launch {
                stopSpeaking()
            }
        }
        
        val jobId = activeJob.incrementAndGet()
        
        coroutineScope.launch {
            try {
                // Apply voice profile if specified
                val voiceProfileId = options.voiceProfile ?: currentVoiceProfile
                
                // Emit queued state
                synthesisFlow.emit(
                    VoiceSynthesisProgress(
                        state = SynthesisState.QUEUED,
                        text = text,
                        processedCharacters = 0,
                        totalCharacters = text.length
                    )
                )
                
                // If this job was canceled, exit
                if (jobId != activeJob.get() || isShuttingDown.get()) {
                    return@launch
                }
                
                // Emit processing state
                synthesisFlow.emit(
                    VoiceSynthesisProgress(
                        state = SynthesisState.PROCESSING,
                        text = text,
                        processedCharacters = 0,
                        totalCharacters = text.length
                    )
                )
                
                // Notify listeners
                notifyListeners { it.onSynthesisStarted(text) }
                
                // Generate speech audio data
                val audioData = generateSpeechAudio(text, options)
                
                // If this job was canceled, exit
                if (jobId != activeJob.get() || isShuttingDown.get()) {
                    return@launch
                }
                
                // Save to file if requested
                var audioFile: File? = null
                options.saveToFile?.let { file ->
                    try {
                        audioFile = saveAudioToFile(audioData, file, options.audioFormat)
                    } catch (e: IOException) {
                        synthesisFlow.emit(
                            VoiceSynthesisProgress(
                                state = SynthesisState.ERROR,
                                text = text,
                                processedCharacters = text.length,
                                totalCharacters = text.length,
                                error = "Failed to save audio to file: ${e.message}"
                            )
                        )
                        return@launch
                    }
                }
                
                // Play audio if not saving to file or if both options are requested
                if (options.saveToFile == null || options.playAudio) {
                    // Emit speaking state
                    synthesisFlow.emit(
                        VoiceSynthesisProgress(
                            state = SynthesisState.SPEAKING,
                            text = text,
                            processedCharacters = text.length,
                            totalCharacters = text.length,
                            audioData = audioData,
                            audioFile = audioFile
                        )
                    )
                    
                    // Play the audio
                    playAudio(audioData)
                }
                
                // If this job was canceled, exit
                if (jobId != activeJob.get() || isShuttingDown.get()) {
                    return@launch
                }
                
                // Emit completed state
                synthesisFlow.emit(
                    VoiceSynthesisProgress(
                        state = SynthesisState.COMPLETED,
                        text = text,
                        processedCharacters = text.length,
                        totalCharacters = text.length,
                        audioData = audioData,
                        audioFile = audioFile,
                        durationMs = estimateDuration(audioData)
                    )
                )
                
                // Notify listeners
                notifyListeners { it.onSynthesisEnded(text) }
            } catch (e: Exception) {
                if (jobId != activeJob.get() || isShuttingDown.get()) {
                    return@launch
                }
                
                // Emit error state
                synthesisFlow.emit(
                    VoiceSynthesisProgress(
                        state = SynthesisState.ERROR,
                        text = text,
                        processedCharacters = 0,
                        totalCharacters = text.length,
                        error = "Synthesis error: ${e.message}"
                    )
                )
                
                // Notify listeners
                val error = VoiceSystemError(
                    code = ErrorCode.SYNTHESIS_ERROR,
                    message = "Synthesis error: ${e.message}",
                    cause = e
                )
                notifyListenersError(error)
            } finally {
                isSpeaking.set(false)
            }
        }
        
        return synthesisFlow.asSharedFlow()
    }
    
    override suspend fun stopSpeaking() {
        if (!isSpeaking.getAndSet(false)) {
            return
        }
        
        // Increment job ID to cancel current job
        activeJob.incrementAndGet()
        
        // Stop audio playback
        withContext(Dispatchers.Main) {
            audioTrack?.apply {
                if (playState == AudioTrack.PLAYSTATE_PLAYING) {
                    stop()
                }
                release()
            }
            audioTrack = null
        }
        
        // Emit interrupted state
        synthesisFlow.emit(
            VoiceSynthesisProgress(
                state = SynthesisState.INTERRUPTED,
                text = "",
                processedCharacters = 0,
                totalCharacters = 0
            )
        )
    }
    
    override suspend fun getAvailableVoices(): List<VoiceProfile> {
        if (!isInitialized.get()) {
            throw VoiceSystemError(
                code = ErrorCode.INITIALIZATION_ERROR,
                message = "Voice synthesizer not initialized"
            )
        }
        
        return availableVoices.toList()
    }
    
    override fun setVoiceCharacteristics(voiceCharacteristics: VoiceCharacteristics) {
        this.voiceCharacteristics = voiceCharacteristics
    }
    
    override fun registerVoiceListener(listener: VoiceSystemListener) {
        synchronized(listeners) {
            listeners.add(listener)
        }
    }
    
    override fun unregisterVoiceListener(listener: VoiceSystemListener) {
        synchronized(listeners) {
            listeners.remove(listener)
        }
    }
    
    override suspend fun shutdown() {
        isShuttingDown.set(true)
        stopSpeaking()
        coroutineScope.cancel()
        isInitialized.set(false)
        isShuttingDown.set(false)
    }
    
    private fun loadVoiceProfiles() {
        availableVoices.clear()
        
        // Add default voice profiles
        availableVoices.add(
            VoiceProfile(
                id = "default_female",
                name = "Emma",
                gender = VoiceGender.FEMALE,
                age = VoiceAge.ADULT,
                language = "en-US",
                isOfflineCapable = true,
                previewText = "Hello, I'm Emma, a default voice for Sallie."
            )
        )
        
        availableVoices.add(
            VoiceProfile(
                id = "default_male",
                name = "James",
                gender = VoiceGender.MALE,
                age = VoiceAge.ADULT,
                language = "en-US",
                isOfflineCapable = true,
                previewText = "Hello, I'm James, a default voice for Sallie."
            )
        )
        
        availableVoices.add(
            VoiceProfile(
                id = "default_neutral",
                name = "Alex",
                gender = VoiceGender.NEUTRAL,
                age = VoiceAge.ADULT,
                language = "en-US",
                isOfflineCapable = true,
                previewText = "Hello, I'm Alex, a default voice for Sallie."
            )
        )
        
        // Set default voice profile if not already set
        if (currentVoiceProfile == null) {
            currentVoiceProfile = "default_female"
        }
    }
    
    private fun generateSpeechAudio(text: String, options: VoiceSynthesisOptions): ByteArray {
        // This is a placeholder implementation for demonstration
        // In a real implementation, this would use a TTS engine
        
        // Simulate processing time proportional to text length
        val processingTime = 100L + text.length * 10L
        try {
            Thread.sleep(processingTime)
        } catch (e: InterruptedException) {
            Thread.currentThread().interrupt()
        }
        
        // For demonstration, generate a simple tone as audio data
        // In a real implementation, this would be the synthesized speech
        val sampleRate = 16000
        val durationSeconds = 0.5 + text.length * 0.05 // Rough duration based on text length
        val numSamples = (sampleRate * durationSeconds).toInt()
        val audioData = ByteArray(numSamples * 2) // 16-bit samples = 2 bytes per sample
        
        // Generate a simple tone
        val frequency = 440.0 // A4 note
        for (i in 0 until numSamples) {
            val time = i.toDouble() / sampleRate
            val amplitude = 0.5 * kotlin.math.sin(2.0 * Math.PI * frequency * time) * Short.MAX_VALUE
            val sample = amplitude.toInt().toShort()
            
            // Convert short to bytes (little endian)
            audioData[i * 2] = (sample.toInt() and 0xFF).toByte()
            audioData[i * 2 + 1] = (sample.toInt() shr 8 and 0xFF).toByte()
        }
        
        return audioData
    }
    
    private suspend fun saveAudioToFile(
        audioData: ByteArray, 
        file: File, 
        format: AudioFormat
    ): File {
        return withContext(Dispatchers.IO) {
            try {
                val outputFile = when (format) {
                    AudioFormat.WAV -> addWavHeader(audioData, file)
                    else -> {
                        // For other formats, just write raw audio for demo
                        FileOutputStream(file).use { it.write(audioData) }
                        file
                    }
                }
                outputFile
            } catch (e: IOException) {
                throw VoiceSystemError(
                    code = ErrorCode.SYNTHESIS_ERROR,
                    message = "Failed to save audio file: ${e.message}",
                    cause = e
                )
            }
        }
    }
    
    private fun addWavHeader(audioData: ByteArray, file: File): File {
        FileOutputStream(file).use { fos ->
            // WAV header (44 bytes)
            val sampleRate = 16000
            val channels = 1
            val bitsPerSample = 16
            val headerSize = 44
            val totalDataLen = audioData.size + headerSize - 8
            val audioFormat = 1 // PCM
            val byteRate = sampleRate * channels * bitsPerSample / 8
            
            // RIFF chunk
            fos.write("RIFF".toByteArray())
            fos.write(intToBytes(totalDataLen, 4))
            fos.write("WAVE".toByteArray())
            
            // fmt chunk
            fos.write("fmt ".toByteArray())
            fos.write(intToBytes(16, 4)) // fmt chunk size
            fos.write(intToBytes(audioFormat, 2)) // audio format
            fos.write(intToBytes(channels, 2)) // channels
            fos.write(intToBytes(sampleRate, 4)) // sample rate
            fos.write(intToBytes(byteRate, 4)) // byte rate
            fos.write(intToBytes(channels * bitsPerSample / 8, 2)) // block align
            fos.write(intToBytes(bitsPerSample, 2)) // bits per sample
            
            // data chunk
            fos.write("data".toByteArray())
            fos.write(intToBytes(audioData.size, 4)) // data chunk size
            fos.write(audioData)
        }
        
        return file
    }
    
    private fun intToBytes(value: Int, bytes: Int): ByteArray {
        val result = ByteArray(bytes)
        for (i in 0 until bytes) {
            result[i] = (value shr (i * 8) and 0xFF).toByte()
        }
        return result
    }
    
    private suspend fun playAudio(audioData: ByteArray) {
        withContext(Dispatchers.Main) {
            try {
                val minBufferSize = AudioTrack.getMinBufferSize(
                    16000,
                    AudioFormat.CHANNEL_OUT_MONO,
                    AudioFormat.ENCODING_PCM_16BIT
                )
                
                audioTrack = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    AudioTrack.Builder()
                        .setAudioAttributes(
                            AudioAttributes.Builder()
                                .setUsage(AudioAttributes.USAGE_MEDIA)
                                .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                                .build()
                        )
                        .setAudioFormat(
                            android.media.AudioFormat.Builder()
                                .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                                .setSampleRate(16000)
                                .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                                .build()
                        )
                        .setBufferSizeInBytes(minBufferSize)
                        .build()
                } else {
                    @Suppress("DEPRECATION")
                    AudioTrack(
                        AudioManager.STREAM_MUSIC,
                        16000,
                        AudioFormat.CHANNEL_OUT_MONO,
                        AudioFormat.ENCODING_PCM_16BIT,
                        minBufferSize,
                        AudioTrack.MODE_STREAM
                    )
                }
                
                audioTrack?.play()
                audioTrack?.write(audioData, 0, audioData.size)
                
                // Wait for playback to complete
                withContext(Dispatchers.Default) {
                    while (audioTrack?.playState == AudioTrack.PLAYSTATE_PLAYING && 
                           !isShuttingDown.get() &&
                           activeJob.get() == activeJob.get()) {
                        delay(100)
                    }
                }
                
                audioTrack?.stop()
                audioTrack?.release()
                audioTrack = null
            } catch (e: Exception) {
                // Handle playback errors
                val error = VoiceSystemError(
                    code = ErrorCode.AUDIO_DEVICE_ERROR,
                    message = "Audio playback error: ${e.message}",
                    cause = e
                )
                notifyListenersError(error)
            }
        }
    }
    
    private fun estimateDuration(audioData: ByteArray): Long {
        // 16-bit samples, mono, 16kHz
        val bytesPerMs = (16000 * 2) / 1000
        return audioData.size / bytesPerMs.toLong()
    }
    
    private fun notifyListeners(action: (VoiceSystemListener) -> Unit) {
        val listenersCopy: Set<VoiceSystemListener>
        synchronized(listeners) {
            listenersCopy = listeners.toSet()
        }
        
        mainHandler.post {
            for (listener in listenersCopy) {
                action(listener)
            }
        }
    }
    
    private fun notifyListenersError(error: VoiceSystemError) {
        notifyListeners { it.onError(error) }
    }
}

/**
 * Configuration for voice synthesizer
 */
data class VoiceSynthesizerConfig(
    val defaultVoiceProfile: String? = null,
    val defaultLanguage: String = "en-US",
    val offlineMode: Boolean = false
)

/**
 * Status of voice synthesizer
 */
data class VoiceSynthesizerStatus(
    val isInitialized: Boolean = false,
    val isSpeaking: Boolean = false,
    val currentVoiceProfile: String? = null
)

/**
 * Interface for voice synthesizer
 */
interface VoiceSynthesizer {
    suspend fun initialize(config: VoiceSynthesizerConfig)
    fun getStatus(): VoiceSynthesizerStatus
    fun speak(text: String, options: VoiceSynthesisOptions): Flow<VoiceSynthesisProgress>
    suspend fun stopSpeaking()
    suspend fun getAvailableVoices(): List<VoiceProfile>
    fun setVoiceCharacteristics(voiceCharacteristics: VoiceCharacteristics)
    fun registerVoiceListener(listener: VoiceSystemListener)
    fun unregisterVoiceListener(listener: VoiceSystemListener)
    suspend fun shutdown()
}

/**
 * Extension to VoiceSynthesisOptions to specify playback behavior
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
    val saveToFile: File? = null,
    val playAudio: Boolean = true
)

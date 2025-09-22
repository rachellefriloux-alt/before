package com.sallie.core.voice.recognition

import android.content.Context
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import android.os.Handler
import android.os.Looper
import com.sallie.core.voice.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.util.concurrent.atomic.AtomicBoolean
import java.util.concurrent.atomic.AtomicInteger
import kotlin.math.abs

/**
 * Sallie's On-Device Voice Recognition
 * 
 * A privacy-focused implementation that performs speech recognition 
 * entirely on-device without requiring network connectivity.
 */
class OnDeviceVoiceRecognizer(
    private val context: Context,
    private val voiceProcessor: VoiceProcessor = DefaultVoiceProcessor()
) : VoiceRecognizer {
    
    private val coroutineScope = CoroutineScope(Dispatchers.Default + SupervisorJob())
    private val isInitialized = AtomicBoolean(false)
    private val isListening = AtomicBoolean(false)
    private val isProcessing = AtomicBoolean(false)
    private var audioRecord: AudioRecord? = null
    private val mainHandler = Handler(Looper.getMainLooper())
    
    private val listeners = mutableSetOf<VoiceSystemListener>()
    private val recognitionFlow = MutableSharedFlow<VoiceRecognitionResult>(replay = 0)
    
    private var vadEnabled = true
    private var noiseReduction = true
    private var confidenceThreshold = 0.5f
    private var currentLanguage = "en-US"
    private var bufferSize = 0
    private var recordingThread: Thread? = null
    private val speechDetected = AtomicBoolean(false)
    private val silenceCounter = AtomicInteger(0)
    
    private val wakeWordDetector = OnDeviceWakeWordDetector()
    private var wakeWordEnabled = false
    private var currentWakeWord = "Hey Sallie"
    private var wakeWordDetected = AtomicBoolean(false)
    
    override suspend fun initialize(config: VoiceRecognizerConfig) {
        if (isInitialized.get()) {
            return
        }
        
        bufferSize = AudioRecord.getMinBufferSize(
            SAMPLE_RATE,
            AudioFormat.CHANNEL_IN_MONO,
            AudioFormat.ENCODING_PCM_16BIT
        )
        
        if (bufferSize == AudioRecord.ERROR || bufferSize == AudioRecord.ERROR_BAD_VALUE) {
            throw VoiceSystemError(
                code = ErrorCode.INITIALIZATION_ERROR,
                message = "Failed to get minimum buffer size"
            )
        }
        
        vadEnabled = config.vadEnabled
        noiseReduction = config.noiseReduction
        confidenceThreshold = config.confidenceThreshold
        currentLanguage = config.language
        wakeWordEnabled = config.wakeWordEnabled
        currentWakeWord = config.wakeWord ?: "Hey Sallie"
        
        wakeWordDetector.initialize(currentWakeWord)
        voiceProcessor.initialize(currentLanguage)
        
        isInitialized.set(true)
    }
    
    override fun getStatus(): VoiceRecognizerStatus {
        return VoiceRecognizerStatus(
            isInitialized = isInitialized.get(),
            isListening = isListening.get(),
            isProcessing = isProcessing.get(),
            currentLanguage = currentLanguage,
            wakeWordEnabled = wakeWordEnabled,
            currentWakeWord = if (wakeWordEnabled) currentWakeWord else null
        )
    }
    
    override fun startListening(options: VoiceRecognitionOptions): Flow<VoiceRecognitionResult> {
        if (isListening.getAndSet(true)) {
            return recognitionFlow.asSharedFlow()
        }
        
        if (!isInitialized.get()) {
            coroutineScope.launch {
                recognitionFlow.emit(
                    VoiceRecognitionResult(
                        text = "",
                        isPartial = false,
                        confidence = 0f,
                        error = "Voice recognizer not initialized"
                    )
                )
            }
            isListening.set(false)
            return recognitionFlow.asSharedFlow()
        }
        
        // Apply options
        options.language?.let { currentLanguage = it }
        
        try {
            startAudioCapture()
            silenceCounter.set(0)
            speechDetected.set(false)
            wakeWordDetected.set(false)
            
            notifyListeners { it.onRecognitionStarted() }
        } catch (e: Exception) {
            isListening.set(false)
            val error = VoiceSystemError(
                code = ErrorCode.AUDIO_DEVICE_ERROR,
                message = "Failed to start audio recording: ${e.message}",
                cause = e
            )
            notifyListenersError(error)
            coroutineScope.launch {
                recognitionFlow.emit(
                    VoiceRecognitionResult(
                        text = "",
                        isPartial = false,
                        confidence = 0f,
                        error = error.message
                    )
                )
            }
        }
        
        return recognitionFlow.asSharedFlow()
    }
    
    override suspend fun stopListening() {
        if (!isListening.getAndSet(false)) {
            return
        }
        
        stopAudioCapture()
        
        // Process any remaining audio buffer
        if (isProcessing.get()) {
            val finalResult = voiceProcessor.finalize()
            if (finalResult.confidence >= confidenceThreshold) {
                recognitionFlow.emit(finalResult.copy(isPartial = false))
            }
        }
        
        notifyListeners { it.onRecognitionEnded() }
    }
    
    override suspend fun transcribeAudioFile(
        audioFile: File,
        options: TranscriptionOptions
    ): TranscriptionResult {
        if (!isInitialized.get()) {
            throw VoiceSystemError(
                code = ErrorCode.INITIALIZATION_ERROR,
                message = "Voice recognizer not initialized"
            )
        }
        
        isProcessing.set(true)
        
        try {
            val language = options.language ?: currentLanguage
            return withContext(Dispatchers.Default) {
                voiceProcessor.transcribeFile(audioFile, language, options)
            }
        } finally {
            isProcessing.set(false)
        }
    }
    
    override suspend fun setWakeWordDetection(enabled: Boolean, customWakeWord: String?) {
        wakeWordEnabled = enabled
        customWakeWord?.let { 
            currentWakeWord = it
            wakeWordDetector.initialize(currentWakeWord)
        }
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
        stopListening()
        coroutineScope.cancel()
        isInitialized.set(false)
    }
    
    private fun startAudioCapture() {
        if (audioRecord != null) {
            stopAudioCapture()
        }
        
        audioRecord = AudioRecord(
            MediaRecorder.AudioSource.VOICE_RECOGNITION,
            SAMPLE_RATE,
            AudioFormat.CHANNEL_IN_MONO,
            AudioFormat.ENCODING_PCM_16BIT,
            bufferSize * 2
        )
        
        if (audioRecord?.state != AudioRecord.STATE_INITIALIZED) {
            throw VoiceSystemError(
                code = ErrorCode.AUDIO_DEVICE_ERROR,
                message = "AudioRecord initialization failed"
            )
        }
        
        audioRecord?.startRecording()
        
        isProcessing.set(true)
        voiceProcessor.reset()
        
        // Start processing audio in a separate thread
        recordingThread = Thread(AudioCaptureRunnable()).apply { start() }
    }
    
    private fun stopAudioCapture() {
        recordingThread?.interrupt()
        recordingThread = null
        
        audioRecord?.apply {
            if (state == AudioRecord.STATE_INITIALIZED) {
                stop()
                release()
            }
        }
        audioRecord = null
        isProcessing.set(false)
    }
    
    private inner class AudioCaptureRunnable : Runnable {
        override fun run() {
            val buffer = ShortArray(bufferSize)
            val audioData = ByteArray(bufferSize * 2)
            
            while (isListening.get() && !Thread.interrupted()) {
                val readSize = audioRecord?.read(buffer, 0, bufferSize) ?: -1
                
                if (readSize > 0) {
                    // Convert short array to byte array
                    ByteBuffer.wrap(audioData).order(ByteOrder.LITTLE_ENDIAN)
                        .asShortBuffer().put(buffer, 0, readSize)
                    
                    // Check for wake word if enabled and not already detected
                    if (wakeWordEnabled && !wakeWordDetected.get() && !speechDetected.get()) {
                        val isWakeWordDetected = wakeWordDetector.detect(buffer)
                        if (isWakeWordDetected) {
                            wakeWordDetected.set(true)
                            notifyListeners { it.onWakeWordDetected(currentWakeWord) }
                        }
                    }
                    
                    // Process audio only if wake word detected or wake word not enabled
                    if (!wakeWordEnabled || wakeWordDetected.get()) {
                        // Voice activity detection
                        if (vadEnabled) {
                            val energy = calculateEnergy(buffer, readSize)
                            if (energy > VAD_THRESHOLD) {
                                if (!speechDetected.getAndSet(true)) {
                                    notifyListeners { it.onSpeechDetected() }
                                }
                                silenceCounter.set(0)
                            } else if (speechDetected.get()) {
                                silenceCounter.incrementAndGet()
                                if (silenceCounter.get() > SILENCE_DURATION_FRAMES) {
                                    notifyListeners { it.onSilenceDetected() }
                                    
                                    // Auto-stop after silence detected
                                    if (speechDetected.getAndSet(false)) {
                                        coroutineScope.launch {
                                            stopListening()
                                        }
                                        break
                                    }
                                }
                            }
                        }
                        
                        // Process audio through voice processor
                        coroutineScope.launch {
                            try {
                                val result = voiceProcessor.processAudio(buffer, readSize)
                                if (result.confidence >= confidenceThreshold || result.isPartial) {
                                    recognitionFlow.emit(result)
                                }
                            } catch (e: Exception) {
                                val error = VoiceSystemError(
                                    code = ErrorCode.RECOGNITION_ERROR,
                                    message = "Error processing audio: ${e.message}",
                                    cause = e
                                )
                                notifyListenersError(error)
                            }
                        }
                    }
                }
            }
        }
    }
    
    private fun calculateEnergy(buffer: ShortArray, readSize: Int): Double {
        var sum = 0.0
        for (i in 0 until readSize) {
            sum += abs(buffer[i].toDouble())
        }
        return sum / readSize
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
    
    companion object {
        private const val SAMPLE_RATE = 16000
        private const val VAD_THRESHOLD = 1000.0
        private const val SILENCE_DURATION_MS = 1500
        private const val SILENCE_DURATION_FRAMES = (SILENCE_DURATION_MS / 1000.0 * SAMPLE_RATE / 160).toInt()
    }
}

/**
 * Configuration for voice recognizer
 */
data class VoiceRecognizerConfig(
    val language: String = "en-US",
    val vadEnabled: Boolean = true,
    val noiseReduction: Boolean = true,
    val confidenceThreshold: Float = 0.5f,
    val wakeWordEnabled: Boolean = false,
    val wakeWord: String? = null
)

/**
 * Status of voice recognizer
 */
data class VoiceRecognizerStatus(
    val isInitialized: Boolean = false,
    val isListening: Boolean = false,
    val isProcessing: Boolean = false,
    val currentLanguage: String? = null,
    val wakeWordEnabled: Boolean = false,
    val currentWakeWord: String? = null
)

/**
 * Interface for voice recognizer
 */
interface VoiceRecognizer {
    suspend fun initialize(config: VoiceRecognizerConfig)
    fun getStatus(): VoiceRecognizerStatus
    fun startListening(options: VoiceRecognitionOptions): Flow<VoiceRecognitionResult>
    suspend fun stopListening()
    suspend fun transcribeAudioFile(audioFile: File, options: TranscriptionOptions): TranscriptionResult
    suspend fun setWakeWordDetection(enabled: Boolean, customWakeWord: String? = null)
    fun registerVoiceListener(listener: VoiceSystemListener)
    fun unregisterVoiceListener(listener: VoiceSystemListener)
    suspend fun shutdown()
}

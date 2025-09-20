package com.sallie.core.voice

import android.Manifest
import android.app.Activity
import android.content.Context
import android.content.pm.PackageManager
import android.media.AudioManager
import android.os.Build
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.lifecycle.DefaultLifecycleObserver
import androidx.lifecycle.LifecycleOwner
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import java.io.File
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Sallie's Voice System Manager
 * 
 * Manages voice system lifecycle, permissions, and provides a simplified API
 * for voice interactions in the application.
 */
class VoiceSystemManager(
    private val context: Context,
    private val config: VoiceSystemConfig = VoiceSystemFactory.buildDefaultConfig()
) : DefaultLifecycleObserver {
    
    private val coroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private val voiceSystem: VoiceSystem by lazy {
        VoiceSystemFactory.getVoiceSystem(context)
    }
    
    private val _voiceState = MutableStateFlow(VoiceState.IDLE)
    val voiceState: StateFlow<VoiceState> = _voiceState.asStateFlow()
    
    private val _voiceEvent = MutableSharedFlow<VoiceEvent>()
    val voiceEvent: SharedFlow<VoiceEvent> = _voiceEvent.asSharedFlow()
    
    private val _transcription = MutableStateFlow<String>("")
    val transcription: StateFlow<String> = _transcription.asStateFlow()
    
    private val isInitialized = AtomicBoolean(false)
    private val isListening = AtomicBoolean(false)
    private val isSpeaking = AtomicBoolean(false)
    
    private val audioManager by lazy {
        context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
    }
    
    /**
     * Initialize the voice system
     */
    suspend fun initialize() {
        if (isInitialized.getAndSet(true)) {
            return
        }
        
        try {
            voiceSystem.initialize(config)
            
            // Register as listener for voice events
            voiceSystem.registerVoiceListener(object : VoiceSystemListener {
                override fun onWakeWordDetected(wakeWord: String) {
                    coroutineScope.launch {
                        _voiceEvent.emit(VoiceEvent.WakeWordDetected(wakeWord))
                    }
                }
                
                override fun onSpeechDetected() {
                    coroutineScope.launch {
                        _voiceEvent.emit(VoiceEvent.SpeechDetected)
                    }
                }
                
                override fun onSilenceDetected() {
                    coroutineScope.launch {
                        _voiceEvent.emit(VoiceEvent.SilenceDetected)
                    }
                }
                
                override fun onRecognitionStarted() {
                    coroutineScope.launch {
                        _voiceState.emit(VoiceState.LISTENING)
                    }
                }
                
                override fun onRecognitionEnded() {
                    coroutineScope.launch {
                        if (_voiceState.value == VoiceState.LISTENING) {
                            _voiceState.emit(VoiceState.IDLE)
                        }
                    }
                }
                
                override fun onSynthesisStarted(text: String) {
                    coroutineScope.launch {
                        _voiceState.emit(VoiceState.SPEAKING)
                    }
                }
                
                override fun onSynthesisEnded(text: String) {
                    coroutineScope.launch {
                        _voiceState.emit(VoiceState.IDLE)
                    }
                }
                
                override fun onError(error: VoiceSystemError) {
                    coroutineScope.launch {
                        _voiceEvent.emit(VoiceEvent.Error(error))
                        if (error.code == ErrorCode.RECOGNITION_ERROR) {
                            _voiceState.emit(VoiceState.IDLE)
                        } else if (error.code == ErrorCode.SYNTHESIS_ERROR) {
                            _voiceState.emit(VoiceState.IDLE)
                        }
                    }
                }
            })
        } catch (e: Exception) {
            isInitialized.set(false)
            throw VoiceSystemError(
                code = ErrorCode.INITIALIZATION_ERROR,
                message = "Failed to initialize voice system: ${e.message}",
                cause = e
            )
        }
    }
    
    /**
     * Check if voice recognition permissions are granted
     * 
     * @return True if all required permissions are granted
     */
    fun hasRequiredPermissions(): Boolean {
        return ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.RECORD_AUDIO
        ) == PackageManager.PERMISSION_GRANTED
    }
    
    /**
     * Request voice recognition permissions
     * 
     * @param activity Activity to request permissions from
     */
    fun requestPermissions(activity: Activity) {
        ActivityCompat.requestPermissions(
            activity,
            arrayOf(Manifest.permission.RECORD_AUDIO),
            PERMISSION_REQUEST_CODE
        )
    }
    
    /**
     * Start listening for voice input
     */
    fun startListening(options: VoiceRecognitionOptions = VoiceRecognitionOptions()) {
        if (!hasRequiredPermissions()) {
            coroutineScope.launch {
                _voiceEvent.emit(
                    VoiceEvent.Error(
                        VoiceSystemError(
                            code = ErrorCode.PERMISSION_DENIED,
                            message = "Record audio permission not granted"
                        )
                    )
                )
            }
            return
        }
        
        if (isListening.getAndSet(true)) {
            return
        }
        
        coroutineScope.launch {
            _transcription.value = ""
            
            try {
                voiceSystem.startListening(options)
                    .onEach { result ->
                        if (!result.text.isNullOrEmpty()) {
                            _transcription.value = result.text
                        }
                        
                        if (!result.isPartial) {
                            isListening.set(false)
                            _voiceEvent.emit(VoiceEvent.FinalTranscription(result.text))
                        }
                    }
                    .catch { e ->
                        isListening.set(false)
                        _voiceEvent.emit(
                            VoiceEvent.Error(
                                VoiceSystemError(
                                    code = ErrorCode.RECOGNITION_ERROR,
                                    message = "Recognition error: ${e.message}",
                                    cause = e
                                )
                            )
                        )
                    }
                    .collect()
            } catch (e: Exception) {
                isListening.set(false)
                _voiceEvent.emit(
                    VoiceEvent.Error(
                        VoiceSystemError(
                            code = ErrorCode.RECOGNITION_ERROR,
                            message = "Recognition error: ${e.message}",
                            cause = e
                        )
                    )
                )
            }
        }
    }
    
    /**
     * Stop listening for voice input
     */
    fun stopListening() {
        if (!isListening.getAndSet(false)) {
            return
        }
        
        coroutineScope.launch {
            try {
                voiceSystem.stopListening()
            } catch (e: Exception) {
                _voiceEvent.emit(
                    VoiceEvent.Error(
                        VoiceSystemError(
                            code = ErrorCode.RECOGNITION_ERROR,
                            message = "Error stopping recognition: ${e.message}",
                            cause = e
                        )
                    )
                )
            }
        }
    }
    
    /**
     * Speak the provided text
     * 
     * @param text Text to speak
     * @param options Voice synthesis options
     */
    fun speak(text: String, options: VoiceSynthesisOptions = VoiceSynthesisOptions()) {
        if (text.isBlank()) {
            return
        }
        
        if (isSpeaking.getAndSet(true)) {
            coroutineScope.launch {
                voiceSystem.stopSpeaking()
                delay(100) // Brief delay to ensure previous speech is stopped
                startSpeaking(text, options)
            }
            return
        }
        
        startSpeaking(text, options)
    }
    
    /**
     * Stop speaking
     */
    fun stopSpeaking() {
        if (!isSpeaking.getAndSet(false)) {
            return
        }
        
        coroutineScope.launch {
            try {
                voiceSystem.stopSpeaking()
            } catch (e: Exception) {
                _voiceEvent.emit(
                    VoiceEvent.Error(
                        VoiceSystemError(
                            code = ErrorCode.SYNTHESIS_ERROR,
                            message = "Error stopping synthesis: ${e.message}",
                            cause = e
                        )
                    )
                )
            }
        }
    }
    
    /**
     * Enable or disable wake word detection
     * 
     * @param enabled Whether wake word detection should be enabled
     * @param customWakeWord Custom wake word to listen for
     */
    fun setWakeWordDetection(enabled: Boolean, customWakeWord: String? = null) {
        coroutineScope.launch {
            try {
                voiceSystem.setWakeWordDetection(enabled, customWakeWord)
                _voiceEvent.emit(VoiceEvent.WakeWordStatusChanged(enabled))
            } catch (e: Exception) {
                _voiceEvent.emit(
                    VoiceEvent.Error(
                        VoiceSystemError(
                            code = ErrorCode.WAKEWORD_ERROR,
                            message = "Error setting wake word detection: ${e.message}",
                            cause = e
                        )
                    )
                )
            }
        }
    }
    
    /**
     * Set voice characteristics for speech synthesis
     * 
     * @param voiceCharacteristics Voice characteristics to use
     */
    fun setVoiceCharacteristics(voiceCharacteristics: VoiceCharacteristics) {
        voiceSystem.setVoiceCharacteristics(voiceCharacteristics)
    }
    
    /**
     * Get available voices for speech synthesis
     * 
     * @return List of available voice profiles
     */
    suspend fun getAvailableVoices(): List<VoiceProfile> {
        return voiceSystem.getAvailableVoices()
    }
    
    /**
     * Transcribe audio from a file
     * 
     * @param audioFile File containing audio to transcribe
     * @param options Transcription options
     * @return Transcription result
     */
    suspend fun transcribeAudioFile(
        audioFile: File,
        options: TranscriptionOptions = TranscriptionOptions()
    ): TranscriptionResult {
        return voiceSystem.transcribeAudioFile(audioFile, options)
    }
    
    /**
     * Get the current status of the voice system
     * 
     * @return Voice system status
     */
    fun getStatus(): VoiceSystemStatus {
        return voiceSystem.getStatus()
    }
    
    /**
     * Release resources used by the voice system manager
     */
    fun release() {
        coroutineScope.launch {
            try {
                stopListening()
                stopSpeaking()
                voiceSystem.shutdown()
                isInitialized.set(false)
            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                coroutineScope.cancel()
            }
        }
    }
    
    private fun startSpeaking(text: String, options: VoiceSynthesisOptions) {
        coroutineScope.launch {
            try {
                // Adjust volume if needed
                ensureAudioVolume()
                
                voiceSystem.speak(text, options)
                    .onEach { progress ->
                        when (progress.state) {
                            SynthesisState.SPEAKING -> {
                                // Already handled by listener
                            }
                            SynthesisState.COMPLETED -> {
                                isSpeaking.set(false)
                            }
                            SynthesisState.ERROR -> {
                                isSpeaking.set(false)
                                _voiceEvent.emit(
                                    VoiceEvent.Error(
                                        VoiceSystemError(
                                            code = ErrorCode.SYNTHESIS_ERROR,
                                            message = progress.error ?: "Unknown synthesis error"
                                        )
                                    )
                                )
                            }
                            SynthesisState.INTERRUPTED -> {
                                isSpeaking.set(false)
                            }
                            else -> {
                                // Ignore other states
                            }
                        }
                    }
                    .catch { e ->
                        isSpeaking.set(false)
                        _voiceEvent.emit(
                            VoiceEvent.Error(
                                VoiceSystemError(
                                    code = ErrorCode.SYNTHESIS_ERROR,
                                    message = "Synthesis error: ${e.message}",
                                    cause = e
                                )
                            )
                        )
                    }
                    .collect()
            } catch (e: Exception) {
                isSpeaking.set(false)
                _voiceEvent.emit(
                    VoiceEvent.Error(
                        VoiceSystemError(
                            code = ErrorCode.SYNTHESIS_ERROR,
                            message = "Synthesis error: ${e.message}",
                            cause = e
                        )
                    )
                )
            }
        }
    }
    
    private fun ensureAudioVolume() {
        // Ensure volume is audible
        val currentVolume = audioManager.getStreamVolume(AudioManager.STREAM_MUSIC)
        val maxVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC)
        
        if (currentVolume < maxVolume * 0.2) { // If volume is less than 20% of max
            val targetVolume = (maxVolume * 0.3).toInt() // Set to 30% of max
            audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, targetVolume, 0)
        }
    }
    
    /**
     * Lifecycle methods
     */
    override fun onPause(owner: LifecycleOwner) {
        // Stop listening when app goes to background
        if (isListening.get()) {
            stopListening()
        }
    }
    
    override fun onDestroy(owner: LifecycleOwner) {
        release()
    }
    
    companion object {
        private const val PERMISSION_REQUEST_CODE = 1001
    }
}

/**
 * Voice system state
 */
enum class VoiceState {
    IDLE,
    LISTENING,
    PROCESSING,
    SPEAKING
}

/**
 * Voice events
 */
sealed class VoiceEvent {
    data class Error(val error: VoiceSystemError) : VoiceEvent()
    data class WakeWordDetected(val wakeWord: String) : VoiceEvent()
    data class FinalTranscription(val text: String) : VoiceEvent()
    data class WakeWordStatusChanged(val enabled: Boolean) : VoiceEvent()
    object SpeechDetected : VoiceEvent()
    object SilenceDetected : VoiceEvent()
}

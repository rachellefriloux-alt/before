/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * Voice Integration Facade
 */

package com.sallie.voice

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.launch
import java.io.File

/**
 * VoiceFacade provides a unified interface to the Voice/ASR integration system.
 * This facade serves as the main entry point for other components to interact
 * with voice recognition, speech synthesis, voice identity verification, and
 * voice commands.
 */
class VoiceFacade(
    private val speechRecognitionService: SpeechRecognitionService = EnhancedSpeechRecognitionService(),
    private val textToSpeechService: TextToSpeechService = EnhancedTextToSpeechService(),
    private val voiceIdentityService: VoiceIdentityVerificationService = EnhancedVoiceIdentityVerificationService()
) {
    private val coroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    
    // Voice command processor
    private val voiceCommandProcessor = EnhancedVoiceCommandProcessor(
        speechRecognitionService = speechRecognitionService,
        textToSpeechService = textToSpeechService
    )
    
    // System state
    private val _voiceSystemState = MutableStateFlow(VoiceSystemState.INACTIVE)
    val voiceSystemState: StateFlow<VoiceSystemState> = _voiceSystemState.asStateFlow()
    
    // Feature support flags
    private val _supportedFeatures = MutableStateFlow<Set<VoiceFeature>>(emptySet())
    val supportedFeatures: StateFlow<Set<VoiceFeature>> = _supportedFeatures.asStateFlow()
    
    /**
     * Initialize the voice system
     */
    suspend fun initialize() {
        try {
            _voiceSystemState.value = VoiceSystemState.INITIALIZING
            
            // Initialize all services
            speechRecognitionService.initialize()
            textToSpeechService.initialize()
            voiceIdentityService.initialize()
            voiceCommandProcessor.initialize()
            
            // Detect supported features
            detectSupportedFeatures()
            
            _voiceSystemState.value = VoiceSystemState.READY
        } catch (e: Exception) {
            _voiceSystemState.value = VoiceSystemState.ERROR
        }
    }
    
    /**
     * Start voice activation (wake word detection)
     */
    suspend fun startVoiceActivation() {
        if (_voiceSystemState.value == VoiceSystemState.READY) {
            voiceCommandProcessor.startWakeWordDetection()
            _voiceSystemState.value = VoiceSystemState.LISTENING_FOR_ACTIVATION
        }
    }
    
    /**
     * Stop voice activation
     */
    suspend fun stopVoiceActivation() {
        if (_voiceSystemState.value == VoiceSystemState.LISTENING_FOR_ACTIVATION) {
            voiceCommandProcessor.stopWakeWordDetection()
            _voiceSystemState.value = VoiceSystemState.READY
        }
    }
    
    /**
     * Start listening for speech input
     */
    suspend fun startListening(options: SpeechRecognitionOptions = SpeechRecognitionOptions(), 
                              listener: SpeechRecognitionListener? = null) {
        if (_voiceSystemState.value == VoiceSystemState.READY || 
            _voiceSystemState.value == VoiceSystemState.LISTENING_FOR_ACTIVATION) {
            
            // Stop wake word detection if active
            if (_voiceSystemState.value == VoiceSystemState.LISTENING_FOR_ACTIVATION) {
                voiceCommandProcessor.stopWakeWordDetection()
            }
            
            // Start listening
            if (listener != null) {
                speechRecognitionService.startListening(options, listener)
            } else {
                voiceCommandProcessor.startListening()
            }
            
            _voiceSystemState.value = VoiceSystemState.LISTENING
        }
    }
    
    /**
     * Stop listening for speech input
     */
    suspend fun stopListening() {
        if (_voiceSystemState.value == VoiceSystemState.LISTENING) {
            speechRecognitionService.stopListening()
            voiceCommandProcessor.stopListening()
            _voiceSystemState.value = VoiceSystemState.READY
        }
    }
    
    /**
     * Speak text using text-to-speech
     */
    suspend fun speak(text: String, options: SpeechSynthesisOptions = SpeechSynthesisOptions()): SynthesisResult {
        _voiceSystemState.value = VoiceSystemState.SPEAKING
        
        try {
            val result = textToSpeechService.speak(text, options)
            _voiceSystemState.value = VoiceSystemState.READY
            return result
        } catch (e: Exception) {
            _voiceSystemState.value = VoiceSystemState.ERROR
            throw e
        }
    }
    
    /**
     * Speak SSML using text-to-speech
     */
    suspend fun speakSsml(ssml: String, options: SpeechSynthesisOptions = SpeechSynthesisOptions()): SynthesisResult {
        _voiceSystemState.value = VoiceSystemState.SPEAKING
        
        try {
            val result = textToSpeechService.speakSsml(ssml, options)
            _voiceSystemState.value = VoiceSystemState.READY
            return result
        } catch (e: Exception) {
            _voiceSystemState.value = VoiceSystemState.ERROR
            throw e
        }
    }
    
    /**
     * Stop current speech synthesis
     */
    suspend fun stopSpeaking() {
        if (_voiceSystemState.value == VoiceSystemState.SPEAKING) {
            textToSpeechService.stop()
            _voiceSystemState.value = VoiceSystemState.READY
        }
    }
    
    /**
     * Enroll a user's voice for identity verification
     */
    suspend fun enrollUserVoice(userId: String, audioData: ByteArray, 
                               options: EnrollmentOptions = EnrollmentOptions()): EnrollmentResult {
        _voiceSystemState.value = VoiceSystemState.PROCESSING
        
        try {
            val result = voiceIdentityService.enrollVoice(userId, audioData, options)
            _voiceSystemState.value = VoiceSystemState.READY
            return result
        } catch (e: Exception) {
            _voiceSystemState.value = VoiceSystemState.ERROR
            throw e
        }
    }
    
    /**
     * Verify a user's voice against their enrolled profile
     */
    suspend fun verifyUserVoice(userId: String, audioData: ByteArray, 
                               options: VerificationOptions = VerificationOptions()): VerificationResult {
        _voiceSystemState.value = VoiceSystemState.PROCESSING
        
        try {
            val result = voiceIdentityService.verifyVoice(userId, audioData, options)
            _voiceSystemState.value = VoiceSystemState.READY
            return result
        } catch (e: Exception) {
            _voiceSystemState.value = VoiceSystemState.ERROR
            throw e
        }
    }
    
    /**
     * Identify a voice from enrolled profiles
     */
    suspend fun identifyVoice(audioData: ByteArray, 
                             options: IdentificationOptions = IdentificationOptions()): IdentificationResult {
        _voiceSystemState.value = VoiceSystemState.PROCESSING
        
        try {
            val result = voiceIdentityService.identifyVoice(audioData, options)
            _voiceSystemState.value = VoiceSystemState.READY
            return result
        } catch (e: Exception) {
            _voiceSystemState.value = VoiceSystemState.ERROR
            throw e
        }
    }
    
    /**
     * Process a voice command
     */
    suspend fun processVoiceCommand(audioData: ByteArray): CommandResult {
        _voiceSystemState.value = VoiceSystemState.PROCESSING
        
        try {
            val result = voiceCommandProcessor.processVoiceCommand(audioData)
            _voiceSystemState.value = VoiceSystemState.READY
            return result
        } catch (e: Exception) {
            _voiceSystemState.value = VoiceSystemState.ERROR
            throw e
        }
    }
    
    /**
     * Process a text command
     */
    suspend fun processTextCommand(text: String): CommandResult {
        _voiceSystemState.value = VoiceSystemState.PROCESSING
        
        try {
            val result = voiceCommandProcessor.processTextCommand(text)
            _voiceSystemState.value = VoiceSystemState.READY
            return result
        } catch (e: Exception) {
            _voiceSystemState.value = VoiceSystemState.ERROR
            throw e
        }
    }
    
    /**
     * Register a command handler
     */
    fun registerCommandHandler(handler: CommandHandler) {
        voiceCommandProcessor.registerCommandHandler(handler)
    }
    
    /**
     * Unregister a command handler
     */
    fun unregisterCommandHandler(handler: CommandHandler) {
        voiceCommandProcessor.unregisterCommandHandler(handler)
    }
    
    /**
     * Get available voices for speech synthesis
     */
    suspend fun getAvailableVoices(): List<VoiceInfo> {
        return textToSpeechService.getAvailableVoices()
    }
    
    /**
     * Get enrolled voice profiles
     */
    suspend fun getEnrolledVoiceProfiles(): List<VoiceProfile> {
        return voiceIdentityService.getEnrolledVoiceProfiles()
    }
    
    /**
     * Add a custom wake word
     */
    suspend fun addWakeWord(wakeWord: String, sensitivity: Float = 0.5f): Boolean {
        return voiceCommandProcessor.addWakeWord(wakeWord, sensitivity)
    }
    
    /**
     * Get active wake words
     */
    suspend fun getActiveWakeWords(): List<String> {
        return voiceCommandProcessor.getActiveWakeWords()
    }
    
    /**
     * Shutdown the voice system and release all resources
     */
    suspend fun shutdown() {
        speechRecognitionService.shutdown()
        textToSpeechService.shutdown()
        voiceIdentityService.shutdown()
        voiceCommandProcessor.shutdown()
        _voiceSystemState.value = VoiceSystemState.INACTIVE
    }
    
    /**
     * Detect supported voice features
     */
    private suspend fun detectSupportedFeatures() {
        val features = mutableSetOf<VoiceFeature>()
        
        // Check speech recognition support
        try {
            speechRecognitionService.checkAvailability()
            features.add(VoiceFeature.SPEECH_RECOGNITION)
            
            if (speechRecognitionService.isOfflineRecognitionAvailable()) {
                features.add(VoiceFeature.OFFLINE_SPEECH_RECOGNITION)
            }
        } catch (_: Exception) {}
        
        // Check TTS support by getting available voices
        try {
            val voices = textToSpeechService.getAvailableVoices()
            if (voices.isNotEmpty()) {
                features.add(VoiceFeature.TEXT_TO_SPEECH)
                
                // Check for high-quality neural voices
                if (voices.any { it.isNeural }) {
                    features.add(VoiceFeature.HIGH_QUALITY_VOICES)
                }
                
                // Check for offline TTS
                if (voices.any { !it.requiresNetwork }) {
                    features.add(VoiceFeature.OFFLINE_TEXT_TO_SPEECH)
                }
            }
        } catch (_: Exception) {}
        
        // Other features
        features.add(VoiceFeature.WAKE_WORD_DETECTION)  // Assumed to be available
        features.add(VoiceFeature.VOICE_COMMANDS)       // Assumed to be available
        
        _supportedFeatures.value = features
    }
}

/**
 * State of the voice system
 */
enum class VoiceSystemState {
    INACTIVE,
    INITIALIZING,
    READY,
    LISTENING_FOR_ACTIVATION,
    LISTENING,
    SPEAKING,
    PROCESSING,
    ERROR
}

/**
 * Voice features
 */
enum class VoiceFeature {
    SPEECH_RECOGNITION,
    OFFLINE_SPEECH_RECOGNITION,
    TEXT_TO_SPEECH,
    OFFLINE_TEXT_TO_SPEECH,
    HIGH_QUALITY_VOICES,
    WAKE_WORD_DETECTION,
    VOICE_COMMANDS,
    VOICE_IDENTIFICATION
}

/**
 * Options for speech synthesis
 */
data class SpeechSynthesisOptions(
    val voiceId: String = "",
    val languageCode: LanguageCode = LanguageCode.EN_US,
    val pitch: Float = 1.0f,
    val speakingRate: Float = 1.0f,
    val volume: Float = 1.0f,
    val audioFormat: AudioFormat = AudioFormat.WAV_PCM_16KHZ_16BIT
)

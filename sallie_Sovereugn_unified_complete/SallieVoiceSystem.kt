

package com.sallie.core.voice

import android.content.Context
import com.sallie.core.voice.recognition.OnDeviceVoiceRecognizer
import com.sallie.core.voice.recognition.VoiceRecognizer
import com.sallie.core.voice.recognition.VoiceRecognizerConfig
import com.sallie.core.voice.synthesis.OnDeviceVoiceSynthesizer
import com.sallie.core.voice.synthesis.VoiceSynthesizer
import com.sallie.core.voice.synthesis.VoiceSynthesizerConfig
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.launch
import java.io.File
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Sallie's Voice System Implementation
 * 
 * Implements the voice system interface, providing a unified API for voice 
 * input and output capabilities using on-device recognition and synthesis engines.
 */
class SallieVoiceSystem(
    private val context: Context
) : VoiceSystem {
    
    private val coroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    private val isInitialized = AtomicBoolean(false)
    
    private lateinit var recognizer: VoiceRecognizer
    private lateinit var synthesizer: VoiceSynthesizer
    
    private val listeners = mutableSetOf<VoiceSystemListener>()
    private val recognitionFlow = MutableSharedFlow<VoiceRecognitionResult>(replay = 0)
    
    override suspend fun initialize(config: VoiceSystemConfig) {
        if (isInitialized.get()) {
            return
        }
        
        // Initialize speech recognizer
        val recognizerConfig = VoiceRecognizerConfig(
            language = config.defaultLanguage,
            vadEnabled = config.vadEnabled,
            noiseReduction = config.noiseReduction,
            confidenceThreshold = config.confidenceThreshold,
            wakeWordEnabled = config.wakeWordEnabled,
            wakeWord = config.defaultWakeWord
        )
        
        recognizer = createRecognizer(config.recognitionEngine)
        recognizer.initialize(recognizerConfig)
        
        // Register as listener for recognition events
        recognizer.registerVoiceListener(object : VoiceSystemListener {
            override fun onWakeWordDetected(wakeWord: String) {
                notifyListeners { it.onWakeWordDetected(wakeWord) }
            }
            
            override fun onSpeechDetected() {
                notifyListeners { it.onSpeechDetected() }
            }
            
            override fun onSilenceDetected() {
                notifyListeners { it.onSilenceDetected() }
            }
            
            override fun onRecognitionStarted() {
                notifyListeners { it.onRecognitionStarted() }
            }
            
            override fun onRecognitionEnded() {
                notifyListeners { it.onRecognitionEnded() }
            }
            
            override fun onError(error: VoiceSystemError) {
                notifyListeners { it.onError(error) }
            }
        })
        
        // Initialize speech synthesizer
        val synthesizerConfig = VoiceSynthesizerConfig(
            defaultVoiceProfile = config.defaultVoiceProfile,
            defaultLanguage = config.defaultLanguage,
            offlineMode = config.offlineMode
        )
        
        synthesizer = createSynthesizer(config.synthesisEngine)
        synthesizer.initialize(synthesizerConfig)
        
        // Register as listener for synthesis events
        synthesizer.registerVoiceListener(object : VoiceSystemListener {
            override fun onSynthesisStarted(text: String) {
                notifyListeners { it.onSynthesisStarted(text) }
            }
            
            override fun onSynthesisEnded(text: String) {
                notifyListeners { it.onSynthesisEnded(text) }
            }
            
            override fun onError(error: VoiceSystemError) {
                notifyListeners { it.onError(error) }
            }
        })
        
        isInitialized.set(true)
    }
    
    override fun getStatus(): VoiceSystemStatus {
        val recognizerStatus = if (::recognizer.isInitialized) {
            recognizer.getStatus()
        } else {
            null
        }
        
        val synthesizerStatus = if (::synthesizer.isInitialized) {
            synthesizer.getStatus()
        } else {
            null
        }
        
        return VoiceSystemStatus(
            isInitialized = isInitialized.get(),
            isListening = recognizerStatus?.isListening ?: false,
            isSpeaking = synthesizerStatus?.isSpeaking ?: false,
            isWakeWordEnabled = recognizerStatus?.wakeWordEnabled ?: false,
            currentWakeWord = recognizerStatus?.currentWakeWord,
            currentLanguage = recognizerStatus?.currentLanguage,
            currentVoiceProfile = synthesizerStatus?.currentVoiceProfile
        )
    }
    
    override fun startListening(options: VoiceRecognitionOptions): Flow<VoiceRecognitionResult> {
        if (!isInitialized.get()) {
            coroutineScope.launch {
                recognitionFlow.emit(
                    VoiceRecognitionResult(
                        text = "",
                        isPartial = false,
                        confidence = 0f,
                        error = "Voice system not initialized"
                    )
                )
            }
            return recognitionFlow.asSharedFlow()
        }
        
        // Start recognition and forward results to our flow
        coroutineScope.launch {
            recognizer.startListening(options)
                .onEach { result ->
                    recognitionFlow.emit(result)
                }
                .collect()
        }
        
        return recognitionFlow.asSharedFlow()
    }
    
    override suspend fun stopListening() {
        if (isInitialized.get()) {
            recognizer.stopListening()
        }
    }
    
    override fun speak(text: String, options: VoiceSynthesisOptions): Flow<VoiceSynthesisProgress> {
        if (!isInitialized.get()) {
            throw VoiceSystemError(
                code = ErrorCode.INITIALIZATION_ERROR,
                message = "Voice system not initialized"
            )
        }
        
        return synthesizer.speak(text, options)
    }
    
    override suspend fun stopSpeaking() {
        if (isInitialized.get()) {
            synthesizer.stopSpeaking()
        }
    }
    
    override suspend fun setWakeWordDetection(enabled: Boolean, customWakeWord: String?) {
        if (isInitialized.get()) {
            recognizer.setWakeWordDetection(enabled, customWakeWord)
        }
    }
    
    override fun setVoiceCharacteristics(voiceCharacteristics: VoiceCharacteristics) {
        if (isInitialized.get()) {
            synthesizer.setVoiceCharacteristics(voiceCharacteristics)
        }
    }
    
    override suspend fun getAvailableVoices(): List<VoiceProfile> {
        if (!isInitialized.get()) {
            throw VoiceSystemError(
                code = ErrorCode.INITIALIZATION_ERROR,
                message = "Voice system not initialized"
            )
        }
        
        return synthesizer.getAvailableVoices()
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
    
    override suspend fun transcribeAudioFile(
        audioFile: File,
        options: TranscriptionOptions
    ): TranscriptionResult {
        if (!isInitialized.get()) {
            throw VoiceSystemError(
                code = ErrorCode.INITIALIZATION_ERROR,
                message = "Voice system not initialized"
            )
        }
        
        return recognizer.transcribeAudioFile(audioFile, options)
    }
    
    override suspend fun shutdown() {
        if (!isInitialized.getAndSet(false)) {
            return
        }
        
        if (::recognizer.isInitialized) {
            recognizer.shutdown()
        }
        
        if (::synthesizer.isInitialized) {
            synthesizer.stopSpeaking()
            synthesizer.shutdown()
        }
        
        coroutineScope.cancel()
    }
    
    private fun createRecognizer(engineType: RecognitionEngineType): VoiceRecognizer {
        return when (engineType) {
            RecognitionEngineType.ONDEVICE -> OnDeviceVoiceRecognizer(context)
            RecognitionEngineType.CLOUD -> throw NotImplementedError("Cloud recognition not implemented")
            RecognitionEngineType.HYBRID -> throw NotImplementedError("Hybrid recognition not implemented")
        }
    }
    
    private fun createSynthesizer(engineType: SynthesisEngineType): VoiceSynthesizer {
        return when (engineType) {
            SynthesisEngineType.ONDEVICE -> OnDeviceVoiceSynthesizer(context)
            SynthesisEngineType.CLOUD -> throw NotImplementedError("Cloud synthesis not implemented")
            SynthesisEngineType.HYBRID -> throw NotImplementedError("Hybrid synthesis not implemented")
        }
    }
    
    private fun notifyListeners(action: (VoiceSystemListener) -> Unit) {
        val listenersCopy: Set<VoiceSystemListener>
        synchronized(listeners) {
            listenersCopy = listeners.toSet()
        }
        
        for (listener in listenersCopy) {
            action(listener)
        }
    }
    
    companion object {
        private const val TAG = "SallieVoiceSystem"
    }
}


package com.sallie.core.voice

import android.content.Context
import com.sallie.core.voice.recognition.OnDeviceVoiceRecognizer
import com.sallie.core.voice.recognition.VoiceRecognizer
import com.sallie.core.voice.recognition.VoiceRecognizerConfig
import com.sallie.core.voice.synthesis.OnDeviceVoiceSynthesizer
import com.sallie.core.voice.synthesis.VoiceSynthesizer
import com.sallie.core.voice.synthesis.VoiceSynthesizerConfig
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.launch
import java.io.File
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Sallie's Voice System Implementation
 * 
 * Implements the voice system interface, providing a unified API for voice 
 * input and output capabilities using on-device recognition and synthesis engines.
 */
class SallieVoiceSystem(
    private val context: Context
) : VoiceSystem {
    
    private val coroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    private val isInitialized = AtomicBoolean(false)
    
    private lateinit var recognizer: VoiceRecognizer
    private lateinit var synthesizer: VoiceSynthesizer
    
    private val listeners = mutableSetOf<VoiceSystemListener>()
    private val recognitionFlow = MutableSharedFlow<VoiceRecognitionResult>(replay = 0)
    
    override suspend fun initialize(config: VoiceSystemConfig) {
        if (isInitialized.get()) {
            return
        }
        
        // Initialize speech recognizer
        val recognizerConfig = VoiceRecognizerConfig(
            language = config.defaultLanguage,
            vadEnabled = config.vadEnabled,
            noiseReduction = config.noiseReduction,
            confidenceThreshold = config.confidenceThreshold,
            wakeWordEnabled = config.wakeWordEnabled,
            wakeWord = config.defaultWakeWord
        )
        
        recognizer = createRecognizer(config.recognitionEngine)
        recognizer.initialize(recognizerConfig)
        
        // Register as listener for recognition events
        recognizer.registerVoiceListener(object : VoiceSystemListener {
            override fun onWakeWordDetected(wakeWord: String) {
                notifyListeners { it.onWakeWordDetected(wakeWord) }
            }
            
            override fun onSpeechDetected() {
                notifyListeners { it.onSpeechDetected() }
            }
            
            override fun onSilenceDetected() {
                notifyListeners { it.onSilenceDetected() }
            }
            
            override fun onRecognitionStarted() {
                notifyListeners { it.onRecognitionStarted() }
            }
            
            override fun onRecognitionEnded() {
                notifyListeners { it.onRecognitionEnded() }
            }
            
            override fun onError(error: VoiceSystemError) {
                notifyListeners { it.onError(error) }
            }
        })
        
        // Initialize speech synthesizer
        val synthesizerConfig = VoiceSynthesizerConfig(
            defaultVoiceProfile = config.defaultVoiceProfile,
            defaultLanguage = config.defaultLanguage,
            offlineMode = config.offlineMode
        )
        
        synthesizer = createSynthesizer(config.synthesisEngine)
        synthesizer.initialize(synthesizerConfig)
        
        // Register as listener for synthesis events
        synthesizer.registerVoiceListener(object : VoiceSystemListener {
            override fun onSynthesisStarted(text: String) {
                notifyListeners { it.onSynthesisStarted(text) }
            }
            
            override fun onSynthesisEnded(text: String) {
                notifyListeners { it.onSynthesisEnded(text) }
            }
            
            override fun onError(error: VoiceSystemError) {
                notifyListeners { it.onError(error) }
            }
        })
        
        isInitialized.set(true)
    }
    
    override fun getStatus(): VoiceSystemStatus {
        val recognizerStatus = if (::recognizer.isInitialized) {
            recognizer.getStatus()
        } else {
            null
        }
        
        val synthesizerStatus = if (::synthesizer.isInitialized) {
            synthesizer.getStatus()
        } else {
            null
        }
        
        return VoiceSystemStatus(
            isInitialized = isInitialized.get(),
            isListening = recognizerStatus?.isListening ?: false,
            isSpeaking = synthesizerStatus?.isSpeaking ?: false,
            isWakeWordEnabled = recognizerStatus?.wakeWordEnabled ?: false,
            currentWakeWord = recognizerStatus?.currentWakeWord,
            currentLanguage = recognizerStatus?.currentLanguage,
            currentVoiceProfile = synthesizerStatus?.currentVoiceProfile
        )
    }
    
    override fun startListening(options: VoiceRecognitionOptions): Flow<VoiceRecognitionResult> {
        if (!isInitialized.get()) {
            coroutineScope.launch {
                recognitionFlow.emit(
                    VoiceRecognitionResult(
                        text = "",
                        isPartial = false,
                        confidence = 0f,
                        error = "Voice system not initialized"
                    )
                )
            }
            return recognitionFlow.asSharedFlow()
        }
        
        // Start recognition and forward results to our flow
        coroutineScope.launch {
            recognizer.startListening(options)
                .onEach { result ->
                    recognitionFlow.emit(result)
                }
                .collect()
        }
        
        return recognitionFlow.asSharedFlow()
    }
    
    override suspend fun stopListening() {
        if (isInitialized.get()) {
            recognizer.stopListening()
        }
    }
    
    override fun speak(text: String, options: VoiceSynthesisOptions): Flow<VoiceSynthesisProgress> {
        if (!isInitialized.get()) {
            throw VoiceSystemError(
                code = ErrorCode.INITIALIZATION_ERROR,
                message = "Voice system not initialized"
            )
        }
        
        return synthesizer.speak(text, options)
    }
    
    override suspend fun stopSpeaking() {
        if (isInitialized.get()) {
            synthesizer.stopSpeaking()
        }
    }
    
    override suspend fun setWakeWordDetection(enabled: Boolean, customWakeWord: String?) {
        if (isInitialized.get()) {
            recognizer.setWakeWordDetection(enabled, customWakeWord)
        }
    }
    
    override fun setVoiceCharacteristics(voiceCharacteristics: VoiceCharacteristics) {
        if (isInitialized.get()) {
            synthesizer.setVoiceCharacteristics(voiceCharacteristics)
        }
    }
    
    override suspend fun getAvailableVoices(): List<VoiceProfile> {
        if (!isInitialized.get()) {
            throw VoiceSystemError(
                code = ErrorCode.INITIALIZATION_ERROR,
                message = "Voice system not initialized"
            )
        }
        
        return synthesizer.getAvailableVoices()
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
    
    override suspend fun transcribeAudioFile(
        audioFile: File,
        options: TranscriptionOptions
    ): TranscriptionResult {
        if (!isInitialized.get()) {
            throw VoiceSystemError(
                code = ErrorCode.INITIALIZATION_ERROR,
                message = "Voice system not initialized"
            )
        }
        
        return recognizer.transcribeAudioFile(audioFile, options)
    }
    
    override suspend fun shutdown() {
        if (!isInitialized.getAndSet(false)) {
            return
        }
        
        if (::recognizer.isInitialized) {
            recognizer.shutdown()
        }
        
        if (::synthesizer.isInitialized) {
            synthesizer.stopSpeaking()
            synthesizer.shutdown()
        }
        
        coroutineScope.cancel()
    }
    
    private fun createRecognizer(engineType: RecognitionEngineType): VoiceRecognizer {
        return when (engineType) {
            RecognitionEngineType.ONDEVICE -> OnDeviceVoiceRecognizer(context)
            RecognitionEngineType.CLOUD -> throw NotImplementedError("Cloud recognition not implemented")
            RecognitionEngineType.HYBRID -> throw NotImplementedError("Hybrid recognition not implemented")
        }
    }
    
    private fun createSynthesizer(engineType: SynthesisEngineType): VoiceSynthesizer {
        return when (engineType) {
            SynthesisEngineType.ONDEVICE -> OnDeviceVoiceSynthesizer(context)
            SynthesisEngineType.CLOUD -> throw NotImplementedError("Cloud synthesis not implemented")
            SynthesisEngineType.HYBRID -> throw NotImplementedError("Hybrid synthesis not implemented")
        }
    }
    
    private fun notifyListeners(action: (VoiceSystemListener) -> Unit) {
        val listenersCopy: Set<VoiceSystemListener>
        synchronized(listeners) {
            listenersCopy = listeners.toSet()
        }
        
        for (listener in listenersCopy) {
            action(listener)
        }
    }
    
    companion object {
        private const val TAG = "SallieVoiceSystem"
    }
}

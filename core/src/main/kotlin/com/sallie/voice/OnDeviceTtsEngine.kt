/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * Values authenticity, respects boundaries, and maintains unwavering devotion
 * 
 * On-Device Text-to-Speech Engine - Privacy-first local TTS implementation
 */

package com.sallie.voice

import android.content.Context
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.util.Log
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.io.File
import java.io.OutputStream
import java.util.*
import java.util.concurrent.atomic.AtomicInteger
import kotlin.coroutines.resume
import kotlin.coroutines.suspendCoroutine

/**
 * On-device text-to-speech implementation using Android's native TTS
 * Provides privacy-focused speech synthesis without requiring internet connectivity
 */
class OnDeviceTtsEngine(private val context: Context) : BaseTextToSpeech() {
    
    companion object {
        private const val TAG = "OnDeviceTtsEngine"
        private const val TTS_INIT_TIMEOUT_MS = 5000L
    }
    
    private val _isInitialized = MutableStateFlow(false)
    val isInitialized: StateFlow<Boolean> = _isInitialized.asStateFlow()
    
    private var textToSpeech: TextToSpeech? = null
    private val utteranceIdCounter = AtomicInteger(0)
    private val pendingSynthesisJobs = mutableMapOf<String, CompletableDeferred<SynthesisResult>>()
    
    private val _voiceEvents = MutableStateFlow<VoiceEvent?>(null)
    val voiceEvents: StateFlow<VoiceEvent?> = _voiceEvents.asStateFlow()
    
    /**
     * Initialize the on-device TTS engine
     */
    override suspend fun initialize() {
        if (_isInitialized.value) return
        
        try {
            val initResult = initializeTts()
            if (initResult == TextToSpeech.SUCCESS) {
                _isInitialized.value = true
                Log.d(TAG, "On-device TTS initialized successfully")
            } else {
                throw TtsSynthesisException("Failed to initialize TTS: $initResult")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error initializing TTS", e)
            throw TtsSynthesisException("TTS initialization failed", e)
        }
    }
    
    /**
     * Get available on-device voices
     */
    override suspend fun getAvailableVoices(): List<VoiceInfo> {
        if (!_isInitialized.value) {
            throw TtsSynthesisException("TTS not initialized")
        }
        
        val tts = textToSpeech ?: throw TtsSynthesisException("TTS instance not available")
        
        return withContext(Dispatchers.Default) {
            try {
                val voices = tts.voices?.mapNotNull { voice ->
                    voice?.let {
                        VoiceInfo(
                            id = it.name,
                            name = it.name,
                            gender = when {
                                it.name.contains("female", ignoreCase = true) -> VoiceGender.FEMALE
                                it.name.contains("male", ignoreCase = true) -> VoiceGender.MALE
                                else -> VoiceGender.NEUTRAL
                            },
                            age = VoiceAge.ADULT,
                            languageCodes = listOf(LanguageCode.fromCode(it.locale.toString()) ?: LanguageCode.EN_US),
                            sampleRateHertz = 22050,
                            naturalness = if (it.name.contains("neural", ignoreCase = true)) 0.9f else 0.7f,
                            isNeural = it.name.contains("neural", ignoreCase = true),
                            requiresNetwork = false,  // On-device voices don't require network
                            customizationSupport = false
                        )
                    }
                } ?: emptyList()
                
                voices
            } catch (e: Exception) {
                Log.e(TAG, "Error getting available voices", e)
                emptyList()
            }
        }
    }
    
    /**
     * Speak text using on-device TTS
     */
    override suspend fun speak(text: String, options: SpeechSynthesisOptions): SynthesisResult {
        if (!_isInitialized.value) {
            throw TtsSynthesisException("TTS not initialized")
        }
        
        val tts = textToSpeech ?: throw TtsSynthesisException("TTS instance not available")
        val utteranceId = generateUtteranceId()
        
        return withContext(Dispatchers.Main) {
            try {
                // Configure TTS settings
                configureTtsSettings(tts, options)
                
                // Create a deferred to wait for completion
                val completionDeferred = CompletableDeferred<SynthesisResult>()
                pendingSynthesisJobs[utteranceId] = completionDeferred
                
                // Emit synthesis started event
                _voiceEvents.value = VoiceEvent.SynthesisStarted(text)
                
                // Start synthesis
                val result = tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, utteranceId)
                
                if (result == TextToSpeech.SUCCESS) {
                    // Wait for synthesis to complete
                    completionDeferred.await()
                } else {
                    pendingSynthesisJobs.remove(utteranceId)
                    throw TtsSynthesisException("Failed to start speech synthesis: $result")
                }
            } catch (e: Exception) {
                pendingSynthesisJobs.remove(utteranceId)
                _voiceEvents.value = VoiceEvent.SynthesisError("SYNTHESIS_FAILED", e.message ?: "Unknown error")
                throw TtsSynthesisException("Speech synthesis failed", e)
            }
        }
    }
    
    /**
     * Speak SSML using on-device TTS
     */
    override suspend fun speakSsml(ssml: String, options: SpeechSynthesisOptions): SynthesisResult {
        // For now, strip SSML tags and speak as plain text
        // Future enhancement: Parse SSML and apply appropriate TTS settings
        val plainText = stripSsmlTags(ssml)
        return speak(plainText, options)
    }
    
    /**
     * Synthesize text to audio data using on-device TTS
     */
    override suspend fun synthesize(text: String, options: SpeechSynthesisOptions): ByteArray {
        if (!_isInitialized.value) {
            throw TtsSynthesisException("TTS not initialized")
        }
        
        val tts = textToSpeech ?: throw TtsSynthesisException("TTS instance not available")
        val utteranceId = generateUtteranceId()
        
        return withContext(Dispatchers.IO) {
            try {
                // Create temporary file for synthesis
                val tempFile = File.createTempFile("tts_synthesis_", ".wav", context.cacheDir)
                
                // Configure TTS settings
                configureTtsSettings(tts, options)
                
                // Create a deferred to wait for completion
                val completionDeferred = CompletableDeferred<ByteArray>()
                
                // Set up progress listener for file synthesis
                val progressListener = object : UtteranceProgressListener() {
                    override fun onStart(utteranceId: String?) {
                        Log.d(TAG, "Synthesis started: $utteranceId")
                    }
                    
                    override fun onDone(utteranceId: String?) {
                        try {
                            val audioData = tempFile.readBytes()
                            tempFile.delete() // Clean up
                            completionDeferred.complete(audioData)
                        } catch (e: Exception) {
                            completionDeferred.completeExceptionally(e)
                        }
                    }
                    
                    override fun onError(utteranceId: String?) {
                        tempFile.delete() // Clean up
                        completionDeferred.completeExceptionally(
                            TtsSynthesisException("Synthesis failed for utterance: $utteranceId")
                        )
                    }
                }
                
                withContext(Dispatchers.Main) {
                    tts.setOnUtteranceProgressListener(progressListener)
                    
                    // Start synthesis to file
                    val result = tts.synthesizeToFile(text, null, tempFile, utteranceId)
                    
                    if (result != TextToSpeech.SUCCESS) {
                        tempFile.delete()
                        throw TtsSynthesisException("Failed to start synthesis to file: $result")
                    }
                }
                
                // Wait for synthesis to complete
                completionDeferred.await()
                
            } catch (e: Exception) {
                Log.e(TAG, "Error synthesizing audio data", e)
                throw TtsSynthesisException("Audio synthesis failed", e)
            }
        }
    }
    
    /**
     * Synthesize SSML to audio data using on-device TTS
     */
    override suspend fun synthesizeSsml(ssml: String, options: SpeechSynthesisOptions): ByteArray {
        val plainText = stripSsmlTags(ssml)
        return synthesize(plainText, options)
    }
    
    /**
     * Synthesize text to output stream using on-device TTS
     */
    override suspend fun synthesizeToStream(text: String, options: SpeechSynthesisOptions, outputStream: OutputStream) {
        val audioData = synthesize(text, options)
        outputStream.write(audioData)
        outputStream.flush()
    }
    
    /**
     * Synthesize text to file using on-device TTS
     */
    override suspend fun synthesizeToFile(text: String, options: SpeechSynthesisOptions, outputFile: File): File {
        if (!_isInitialized.value) {
            throw TtsSynthesisException("TTS not initialized")
        }
        
        val tts = textToSpeech ?: throw TtsSynthesisException("TTS instance not available")
        val utteranceId = generateUtteranceId()
        
        return withContext(Dispatchers.Main) {
            try {
                // Configure TTS settings
                configureTtsSettings(tts, options)
                
                // Create a deferred to wait for completion
                val completionDeferred = CompletableDeferred<File>()
                
                // Set up progress listener
                val progressListener = object : UtteranceProgressListener() {
                    override fun onStart(utteranceId: String?) {
                        Log.d(TAG, "File synthesis started: $utteranceId")
                    }
                    
                    override fun onDone(utteranceId: String?) {
                        completionDeferred.complete(outputFile)
                    }
                    
                    override fun onError(utteranceId: String?) {
                        completionDeferred.completeExceptionally(
                            TtsSynthesisException("File synthesis failed for utterance: $utteranceId")
                        )
                    }
                }
                
                tts.setOnUtteranceProgressListener(progressListener)
                
                // Start synthesis to file
                val result = tts.synthesizeToFile(text, null, outputFile, utteranceId)
                
                if (result == TextToSpeech.SUCCESS) {
                    completionDeferred.await()
                } else {
                    throw TtsSynthesisException("Failed to start file synthesis: $result")
                }
                
            } catch (e: Exception) {
                Log.e(TAG, "Error synthesizing to file", e)
                throw TtsSynthesisException("File synthesis failed", e)
            }
        }
    }
    
    /**
     * Stop current speech synthesis
     */
    override suspend fun stop() {
        withContext(Dispatchers.Main) {
            textToSpeech?.stop()
            pendingSynthesisJobs.values.forEach { deferred ->
                deferred.cancel()
            }
            pendingSynthesisJobs.clear()
        }
    }
    
    /**
     * Release TTS resources
     */
    override suspend fun shutdown() {
        stop()
        withContext(Dispatchers.Main) {
            textToSpeech?.shutdown()
            textToSpeech = null
        }
        _isInitialized.value = false
    }
    
    /**
     * Initialize TTS with proper coroutine handling
     */
    private suspend fun initializeTts(): Int = suspendCoroutine { continuation ->
        val initListener = TextToSpeech.OnInitListener { status ->
            if (status == TextToSpeech.SUCCESS) {
                setupUtteranceProgressListener()
            }
            continuation.resume(status)
        }
        
        try {
            textToSpeech = TextToSpeech(context, initListener)
        } catch (e: Exception) {
            continuation.resume(TextToSpeech.ERROR)
        }
    }
    
    /**
     * Configure TTS settings based on synthesis options
     */
    private fun configureTtsSettings(tts: TextToSpeech, options: SpeechSynthesisOptions) {
        try {
            // Set language
            val locale = Locale.forLanguageTag(options.languageCode.code)
            tts.language = locale
            
            // Set speech rate
            tts.setSpeechRate(options.speakingRate)
            
            // Set pitch
            tts.setPitch(options.pitch)
            
            // Try to set voice if specified
            if (options.voiceId != "default") {
                val voice = tts.voices?.find { it.name == options.voiceId }
                voice?.let { tts.voice = it }
            }
            
        } catch (e: Exception) {
            Log.w(TAG, "Error configuring TTS settings", e)
        }
    }
    
    /**
     * Set up utterance progress listener for synthesis callbacks
     */
    private fun setupUtteranceProgressListener() {
        textToSpeech?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
            override fun onStart(utteranceId: String?) {
                Log.d(TAG, "Utterance started: $utteranceId")
            }
            
            override fun onDone(utteranceId: String?) {
                utteranceId?.let { id ->
                    val deferred = pendingSynthesisJobs.remove(id)
                    val result = SynthesisResult(
                        id = id,
                        audioData = null, // For speak operations, audio data is not captured
                        duration = 0L,    // Duration not available for speak operations
                        wordBoundaries = emptyList()
                    )
                    deferred?.complete(result)
                    
                    _voiceEvents.value = VoiceEvent.SynthesisCompleted(byteArrayOf(), 0L)
                }
            }
            
            override fun onError(utteranceId: String?) {
                utteranceId?.let { id ->
                    val deferred = pendingSynthesisJobs.remove(id)
                    deferred?.completeExceptionally(
                        TtsSynthesisException("Synthesis failed for utterance: $id")
                    )
                    
                    _voiceEvents.value = VoiceEvent.SynthesisError("SYNTHESIS_FAILED", "Utterance failed: $id")
                }
            }
        })
    }
    
    /**
     * Generate unique utterance ID
     */
    private fun generateUtteranceId(): String {
        return "utterance_${System.currentTimeMillis()}_${utteranceIdCounter.incrementAndGet()}"
    }
    
    /**
     * Strip SSML tags from text (basic implementation)
     */
    private fun stripSsmlTags(ssml: String): String {
        return ssml.replace(Regex("<[^>]*>"), "").trim()
    }
}

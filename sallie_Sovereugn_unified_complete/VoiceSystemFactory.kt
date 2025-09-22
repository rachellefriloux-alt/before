package com.sallie.core.voice

import android.content.Context
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import java.util.concurrent.ConcurrentHashMap

/**
 * Sallie's Voice System Factory
 * 
 * Factory for creating and managing voice system instances
 */
object VoiceSystemFactory {
    
    private val voiceSystems = ConcurrentHashMap<String, VoiceSystem>()
    private val coroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    
    /**
     * Get or create a voice system instance
     * 
     * @param context Application context
     * @param instanceId Optional identifier for the voice system instance
     * @param config Voice system configuration
     * @return VoiceSystem instance
     */
    fun getVoiceSystem(
        context: Context,
        instanceId: String = DEFAULT_INSTANCE_ID,
        config: VoiceSystemConfig? = null
    ): VoiceSystem {
        return voiceSystems.getOrPut(instanceId) {
            val voiceSystem = SallieVoiceSystem(context.applicationContext)
            
            // Initialize in background if config provided
            if (config != null) {
                coroutineScope.launch {
                    try {
                        voiceSystem.initialize(config)
                    } catch (e: Exception) {
                        // Log initialization error
                        e.printStackTrace()
                    }
                }
            }
            
            voiceSystem
        }
    }
    
    /**
     * Release a voice system instance
     * 
     * @param instanceId Identifier for the voice system instance to release
     */
    fun releaseVoiceSystem(instanceId: String = DEFAULT_INSTANCE_ID) {
        voiceSystems[instanceId]?.let { voiceSystem ->
            coroutineScope.launch {
                try {
                    voiceSystem.shutdown()
                } catch (e: Exception) {
                    // Log shutdown error
                    e.printStackTrace()
                } finally {
                    voiceSystems.remove(instanceId)
                }
            }
        }
    }
    
    /**
     * Release all voice system instances
     */
    fun releaseAllVoiceSystems() {
        val systems = voiceSystems.values.toList()
        voiceSystems.clear()
        
        coroutineScope.launch {
            systems.forEach { voiceSystem ->
                try {
                    voiceSystem.shutdown()
                } catch (e: Exception) {
                    // Log shutdown error
                    e.printStackTrace()
                }
            }
        }
    }
    
    /**
     * Build a default voice system configuration
     * 
     * @return Default VoiceSystemConfig
     */
    fun buildDefaultConfig(): VoiceSystemConfig {
        return VoiceSystemConfig(
            recognitionEngine = RecognitionEngineType.ONDEVICE,
            synthesisEngine = SynthesisEngineType.ONDEVICE,
            defaultLanguage = "en-US",
            defaultVoiceProfile = null,
            wakeWordEnabled = false,
            defaultWakeWord = "Hey Sallie",
            vadEnabled = true,
            noiseReduction = true,
            offlineMode = true
        )
    }
    
    /**
     * Create a configuration builder for customizing voice system configuration
     * 
     * @return VoiceSystemConfigBuilder
     */
    fun configBuilder(): VoiceSystemConfigBuilder {
        return VoiceSystemConfigBuilder()
    }
    
    const val DEFAULT_INSTANCE_ID = "default"
}

/**
 * Builder for voice system configuration
 */
class VoiceSystemConfigBuilder {
    private var recognitionEngine: RecognitionEngineType = RecognitionEngineType.ONDEVICE
    private var synthesisEngine: SynthesisEngineType = SynthesisEngineType.ONDEVICE
    private var defaultLanguage: String = "en-US"
    private var defaultVoiceProfile: String? = null
    private var wakeWordEnabled: Boolean = false
    private var defaultWakeWord: String = "Hey Sallie"
    private var vadEnabled: Boolean = true
    private var noiseReduction: Boolean = true
    private var offlineMode: Boolean = false
    private var maxRecordingDurationMs: Long = 30000
    private var confidenceThreshold: Float = 0.5f
    
    /**
     * Set recognition engine type
     */
    fun setRecognitionEngine(engine: RecognitionEngineType) = apply {
        recognitionEngine = engine
    }
    
    /**
     * Set synthesis engine type
     */
    fun setSynthesisEngine(engine: SynthesisEngineType) = apply {
        synthesisEngine = engine
    }
    
    /**
     * Set default language
     */
    fun setDefaultLanguage(language: String) = apply {
        defaultLanguage = language
    }
    
    /**
     * Set default voice profile
     */
    fun setDefaultVoiceProfile(profile: String?) = apply {
        defaultVoiceProfile = profile
    }
    
    /**
     * Enable or disable wake word detection
     */
    fun setWakeWordEnabled(enabled: Boolean) = apply {
        wakeWordEnabled = enabled
    }
    
    /**
     * Set default wake word
     */
    fun setDefaultWakeWord(wakeWord: String) = apply {
        defaultWakeWord = wakeWord
    }
    
    /**
     * Enable or disable voice activity detection
     */
    fun setVadEnabled(enabled: Boolean) = apply {
        vadEnabled = enabled
    }
    
    /**
     * Enable or disable noise reduction
     */
    fun setNoiseReduction(enabled: Boolean) = apply {
        noiseReduction = enabled
    }
    
    /**
     * Enable or disable offline mode
     */
    fun setOfflineMode(enabled: Boolean) = apply {
        offlineMode = enabled
    }
    
    /**
     * Set maximum recording duration in milliseconds
     */
    fun setMaxRecordingDurationMs(durationMs: Long) = apply {
        maxRecordingDurationMs = durationMs
    }
    
    /**
     * Set confidence threshold for recognition results
     */
    fun setConfidenceThreshold(threshold: Float) = apply {
        confidenceThreshold = threshold
    }
    
    /**
     * Build the voice system configuration
     */
    fun build(): VoiceSystemConfig {
        return VoiceSystemConfig(
            recognitionEngine = recognitionEngine,
            synthesisEngine = synthesisEngine,
            defaultLanguage = defaultLanguage,
            defaultVoiceProfile = defaultVoiceProfile,
            wakeWordEnabled = wakeWordEnabled,
            defaultWakeWord = defaultWakeWord,
            vadEnabled = vadEnabled,
            noiseReduction = noiseReduction,
            offlineMode = offlineMode,
            maxRecordingDurationMs = maxRecordingDurationMs,
            confidenceThreshold = confidenceThreshold
        )
    }
}

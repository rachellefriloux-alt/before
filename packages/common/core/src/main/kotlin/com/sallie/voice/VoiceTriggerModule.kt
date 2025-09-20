/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: VoiceTriggerModule - Voice trigger support for God-Mode commands and routines.
 * Got it, love.
 */
package com.sallie.voice

import android.content.Context
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import android.os.Handler
import android.os.Looper
import android.util.Log
import kotlinx.coroutines.*
import java.util.concurrent.ConcurrentHashMap
import kotlin.math.abs

object VoiceTriggerModule {
    private const val TAG = "VoiceTriggerModule"
    private const val SAMPLE_RATE = 16000
    private const val BUFFER_SIZE = 1024
    private const val DETECTION_THRESHOLD = 0.6f

    private var isListening = false
    private var audioRecord: AudioRecord? = null
    private var detectionJob: Job? = null
    private val mainHandler = Handler(Looper.getMainLooper())

    // Voice trigger phrases and their associated actions
    private val voiceTriggers = ConcurrentHashMap<String, VoiceTrigger>()

    data class VoiceTrigger(
        val phrase: String,
        val action: String,
        val parameters: Map<String, Any> = emptyMap(),
        val isActive: Boolean = true,
        val sensitivity: Float = 0.7f
    )

    data class TriggerResult(
        val detected: Boolean,
        val trigger: VoiceTrigger? = null,
        val confidence: Float = 0f,
        val detectedPhrase: String? = null
    )

    /**
     * Initialize the voice trigger module
     */
    fun initialize(context: Context) {
        // Register default voice triggers
        registerDefaultTriggers()

        // Initialize audio recording permissions would be checked here
        Log.i(TAG, "Voice trigger module initialized with ${voiceTriggers.size} triggers")
    }

    /**
     * Start listening for voice triggers
     */
    fun startListening(): Boolean {
        if (isListening) return true

        try {
            val minBufferSize = AudioRecord.getMinBufferSize(
                SAMPLE_RATE,
                AudioFormat.CHANNEL_IN_MONO,
                AudioFormat.ENCODING_PCM_16BIT
            )

            audioRecord = AudioRecord(
                MediaRecorder.AudioSource.MIC,
                SAMPLE_RATE,
                AudioFormat.CHANNEL_IN_MONO,
                AudioFormat.ENCODING_PCM_16BIT,
                minBufferSize * 2
            )

            if (audioRecord?.state != AudioRecord.STATE_INITIALIZED) {
                Log.e(TAG, "Failed to initialize AudioRecord")
                return false
            }

            audioRecord?.startRecording()
            isListening = true

            // Start detection in background
            detectionJob = CoroutineScope(Dispatchers.Default).launch {
                detectVoiceTriggers()
            }

            Log.i(TAG, "Voice trigger listening started")
            return true

        } catch (e: Exception) {
            Log.e(TAG, "Failed to start voice trigger listening", e)
            return false
        }
    }

    /**
     * Stop listening for voice triggers
     */
    fun stopListening() {
        if (!isListening) return

        isListening = false
        detectionJob?.cancel()
        detectionJob = null

        audioRecord?.stop()
        audioRecord?.release()
        audioRecord = null

        Log.i(TAG, "Voice trigger listening stopped")
    }

    /**
     * Register a new voice trigger
     */
    fun registerTrigger(phrase: String, action: String, parameters: Map<String, Any> = emptyMap()): Boolean {
        val trigger = VoiceTrigger(phrase.lowercase(), action, parameters)
        voiceTriggers[phrase.lowercase()] = trigger
        Log.i(TAG, "Registered voice trigger: '$phrase' -> $action")
        return true
    }

    /**
     * Unregister a voice trigger
     */
    fun unregisterTrigger(phrase: String): Boolean {
        val removed = voiceTriggers.remove(phrase.lowercase()) != null
        if (removed) {
            Log.i(TAG, "Unregistered voice trigger: '$phrase'")
        }
        return removed
    }

    /**
     * Get all registered triggers
     */
    fun getRegisteredTriggers(): List<VoiceTrigger> {
        return voiceTriggers.values.toList()
    }

    /**
     * Check if a phrase matches any registered trigger
     */
    fun checkTrigger(phrase: String): TriggerResult {
        val normalizedPhrase = phrase.lowercase().trim()

        for ((triggerPhrase, trigger) in voiceTriggers) {
            if (!trigger.isActive) continue

            val similarity = calculateSimilarity(normalizedPhrase, triggerPhrase)
            if (similarity >= trigger.sensitivity) {
                return TriggerResult(
                    detected = true,
                    trigger = trigger,
                    confidence = similarity,
                    detectedPhrase = phrase
                )
            }
        }

        return TriggerResult(detected = false)
    }

    private fun registerDefaultTriggers() {
        // God-mode commands
        registerTrigger("god mode", "enter_god_mode")
        registerTrigger("exit god mode", "exit_god_mode")
        registerTrigger("maximum power", "activate_max_power")

        // Routine triggers
        registerTrigger("good morning", "start_morning_routine")
        registerTrigger("good night", "start_evening_routine")
        registerTrigger("time to work", "start_work_routine")
        registerTrigger("break time", "start_break_routine")

        // Theme triggers
        registerTrigger("dark theme", "switch_theme", mapOf("theme" to "dark"))
        registerTrigger("light theme", "switch_theme", mapOf("theme" to "light"))
        registerTrigger("ocean theme", "switch_theme", mapOf("theme" to "ocean"))
        registerTrigger("forest theme", "switch_theme", mapOf("theme" to "forest"))

        // Quick actions
        registerTrigger("take a break", "remind_break")
        registerTrigger("hydrate", "remind_water")
        registerTrigger("stretch", "remind_stretch")
        registerTrigger("breathe", "start_breathing_exercise")
    }

    private suspend fun detectVoiceTriggers() {
        val buffer = ShortArray(BUFFER_SIZE)
        val speechProcessor = SpeechProcessor()

        while (isListening && isActive) {
            try {
                val readResult = audioRecord?.read(buffer, 0, buffer.size) ?: 0
                if (readResult > 0) {
                    // Process audio buffer for speech detection
                    val speechDetected = speechProcessor.processAudioBuffer(buffer)

                    if (speechDetected) {
                        // Extract speech text (simplified - would use actual speech recognition)
                        val detectedText = speechProcessor.extractSpeechText(buffer)

                        if (detectedText.isNotEmpty()) {
                            val result = checkTrigger(detectedText)

                            if (result.detected) {
                                // Execute trigger action on main thread
                                mainHandler.post {
                                    executeTriggerAction(result)
                                }
                            }
                        }
                    }
                }

                // Small delay to prevent excessive CPU usage
                delay(100)

            } catch (e: Exception) {
                Log.e(TAG, "Error in voice trigger detection", e)
                delay(1000) // Longer delay on error
            }
        }
    }

    private fun executeTriggerAction(result: TriggerResult) {
        result.trigger?.let { trigger ->
            Log.i(TAG, "Executing voice trigger: ${trigger.phrase} -> ${trigger.action}")

            when (trigger.action) {
                "enter_god_mode" -> enterGodMode()
                "exit_god_mode" -> exitGodMode()
                "activate_max_power" -> activateMaxPower()
                "start_morning_routine" -> startMorningRoutine()
                "start_evening_routine" -> startEveningRoutine()
                "start_work_routine" -> startWorkRoutine()
                "start_break_routine" -> startBreakRoutine()
                "switch_theme" -> switchTheme(trigger.parameters["theme"] as? String)
                "remind_break" -> remindBreak()
                "remind_water" -> remindWater()
                "remind_stretch" -> remindStretch()
                "start_breathing_exercise" -> startBreathingExercise()
                else -> Log.w(TAG, "Unknown trigger action: ${trigger.action}")
            }
        }
    }

    // Action implementations (simplified - would integrate with actual app systems)
    private fun enterGodMode() { /* Implementation */ }
    private fun exitGodMode() { /* Implementation */ }
    private fun activateMaxPower() { /* Implementation */ }
    private fun startMorningRoutine() { /* Implementation */ }
    private fun startEveningRoutine() { /* Implementation */ }
    private fun startWorkRoutine() { /* Implementation */ }
    private fun startBreakRoutine() { /* Implementation */ }
    private fun switchTheme(theme: String?) { /* Implementation */ }
    private fun remindBreak() { /* Implementation */ }
    private fun remindWater() { /* Implementation */ }
    private fun remindStretch() { /* Implementation */ }
    private fun startBreathingExercise() { /* Implementation */ }

    private fun calculateSimilarity(text1: String, text2: String): Float {
        // Simple Levenshtein distance-based similarity
        val maxLength = maxOf(text1.length, text2.length)
        if (maxLength == 0) return 1f

        val distance = levenshteinDistance(text1, text2)
        return 1f - (distance.toFloat() / maxLength)
    }

    private fun levenshteinDistance(s1: String, s2: String): Int {
        val costs = IntArray(s1.length + 1) { it }
        var lastValue: Int
        var newValue: Int

        for (i2 in 1..s2.length) {
            lastValue = costs[0]
            costs[0] = i2

            for (i1 in 1..s1.length) {
                newValue = costs[i1 - 1]
                if (s1[i1 - 1] != s2[i2 - 1]) {
                    newValue = minOf(
                        minOf(newValue, lastValue),
                        costs[i1]
                    ) + 1
                }
                lastValue = costs[i1]
                costs[i1] = newValue
            }
        }

        return lastValue
    }

    /**
     * Simple speech processor (would be replaced with actual speech recognition)
     */
    private class SpeechProcessor {
        private var speechBuffer = mutableListOf<Short>()
        private var isInSpeech = false

        fun processAudioBuffer(buffer: ShortArray): Boolean {
            // Simple voice activity detection based on amplitude
            val averageAmplitude = buffer.map { abs(it.toInt()) }.average()
            val threshold = 500 // Adjust based on testing

            if (averageAmplitude > threshold) {
                if (!isInSpeech) {
                    isInSpeech = true
                    speechBuffer.clear()
                }
                speechBuffer.addAll(buffer.toList())
                return true
            } else if (isInSpeech) {
                // End of speech detected
                isInSpeech = false
                return true
            }

            return false
        }

        fun extractSpeechText(buffer: ShortArray): String {
            // Placeholder - would integrate with actual speech-to-text
            // For demo, return some sample phrases that might trigger actions
            val samplePhrases = listOf(
                "good morning", "good night", "god mode", "take a break",
                "dark theme", "light theme", "time to work"
            )

            return if (speechBuffer.size > BUFFER_SIZE * 2) {
                samplePhrases.random()
            } else ""
        }
    }
}

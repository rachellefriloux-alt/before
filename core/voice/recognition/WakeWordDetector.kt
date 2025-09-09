package com.sallie.core.voice.recognition

import java.util.concurrent.atomic.AtomicBoolean
import kotlin.math.abs

/**
 * Sallie's Wake Word Detector
 * 
 * Detects wake words or phrases in an audio stream to trigger voice interactions
 */
interface WakeWordDetector {
    /**
     * Initialize the wake word detector with the specified wake word
     * 
     * @param wakeWord The wake word or phrase to detect
     */
    fun initialize(wakeWord: String)
    
    /**
     * Detect whether the wake word is present in the audio buffer
     * 
     * @param buffer Audio buffer to analyze
     * @return True if wake word detected, false otherwise
     */
    fun detect(buffer: ShortArray): Boolean
    
    /**
     * Reset the detector state
     */
    fun reset()
    
    /**
     * Add a custom wake word to the detector
     * 
     * @param wakeWord New wake word or phrase
     * @return True if successfully added, false otherwise
     */
    fun addCustomWakeWord(wakeWord: String): Boolean
    
    /**
     * Remove a custom wake word from the detector
     * 
     * @param wakeWord Wake word to remove
     */
    fun removeCustomWakeWord(wakeWord: String)
    
    /**
     * Get the list of active wake words
     * 
     * @return List of active wake words
     */
    fun getActiveWakeWords(): List<String>
}

/**
 * On-device implementation of wake word detection
 */
class OnDeviceWakeWordDetector : WakeWordDetector {
    private var activeWakeWord = "Hey Sallie"
    private val customWakeWords = mutableSetOf<String>()
    private val isInitialized = AtomicBoolean(false)
    private val detectionBuffer = mutableListOf<DetectionFrame>()
    
    // Pattern matching state
    private var patternMatchState = 0
    private var consecutiveMatches = 0
    private var energyThreshold = DEFAULT_ENERGY_THRESHOLD
    private var silenceCounter = 0
    
    override fun initialize(wakeWord: String) {
        activeWakeWord = wakeWord
        reset()
        isInitialized.set(true)
    }
    
    override fun detect(buffer: ShortArray): Boolean {
        if (!isInitialized.get()) {
            return false
        }
        
        // Add new detection frame
        val energy = calculateEnergy(buffer)
        val frame = DetectionFrame(energy, System.currentTimeMillis())
        detectionBuffer.add(frame)
        
        // Keep buffer at maximum size
        if (detectionBuffer.size > MAX_BUFFER_SIZE) {
            detectionBuffer.removeAt(0)
        }
        
        // Simple energy-based detection for demo purposes
        // In a real implementation, this would use more sophisticated audio pattern matching
        return detectWakeWordPattern()
    }
    
    override fun reset() {
        detectionBuffer.clear()
        patternMatchState = 0
        consecutiveMatches = 0
        silenceCounter = 0
    }
    
    override fun addCustomWakeWord(wakeWord: String): Boolean {
        if (wakeWord.isBlank()) {
            return false
        }
        customWakeWords.add(wakeWord)
        return true
    }
    
    override fun removeCustomWakeWord(wakeWord: String) {
        customWakeWords.remove(wakeWord)
    }
    
    override fun getActiveWakeWords(): List<String> {
        val result = mutableListOf(activeWakeWord)
        result.addAll(customWakeWords)
        return result
    }
    
    private fun calculateEnergy(buffer: ShortArray): Double {
        var sum = 0.0
        for (sample in buffer) {
            sum += abs(sample.toDouble())
        }
        return sum / buffer.size
    }
    
    private fun detectWakeWordPattern(): Boolean {
        // This is a simplified detection algorithm for demonstration
        // In a real implementation, this would use a neural network or other ML model
        
        // Look for pattern of rising energy followed by silence
        if (detectionBuffer.size < MIN_BUFFER_SIZE) {
            return false
        }
        
        // Get recent frames
        val recentFrames = detectionBuffer.takeLast(MIN_BUFFER_SIZE)
        
        // Calculate average energy
        val avgEnergy = recentFrames.map { it.energy }.average()
        
        when (patternMatchState) {
            // Look for initial high energy
            0 -> {
                if (avgEnergy > energyThreshold) {
                    patternMatchState = 1
                    consecutiveMatches = 1
                }
            }
            
            // Look for sustained high energy
            1 -> {
                if (avgEnergy > energyThreshold) {
                    consecutiveMatches++
                    if (consecutiveMatches >= SUSTAINED_MATCH_COUNT) {
                        patternMatchState = 2
                        silenceCounter = 0
                    }
                } else {
                    // Fall back to initial state on energy drop
                    patternMatchState = 0
                    consecutiveMatches = 0
                }
            }
            
            // Look for silence after high energy
            2 -> {
                if (avgEnergy < energyThreshold * 0.3) {
                    silenceCounter++
                    if (silenceCounter >= SILENCE_COUNT) {
                        // Pattern detected - reset state
                        patternMatchState = 0
                        consecutiveMatches = 0
                        silenceCounter = 0
                        
                        // Detect wake word with 30% probability for demo
                        // In real implementation, this would be an actual pattern match
                        if (Math.random() < 0.3) {
                            return true
                        }
                    }
                } else {
                    // Continue in high energy state
                    consecutiveMatches++
                }
            }
        }
        
        return false
    }
    
    data class DetectionFrame(val energy: Double, val timestamp: Long)
    
    companion object {
        private const val MAX_BUFFER_SIZE = 50
        private const val MIN_BUFFER_SIZE = 10
        private const val DEFAULT_ENERGY_THRESHOLD = 2000.0
        private const val SUSTAINED_MATCH_COUNT = 5
        private const val SILENCE_COUNT = 3
    }
}

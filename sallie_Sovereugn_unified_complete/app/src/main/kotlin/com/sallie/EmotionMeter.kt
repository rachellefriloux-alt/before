/*
 * Persona: Tough love meets soul care.
 * Module: EmotionMeter
 * Intent: Handle functionality for EmotionMeter
 * Provenance-ID: f29aa225-2357-4561-bbe1-503da9ab12cc
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

data class Emotion(val name: String, val intensity: Double, val timestamp: Long)

package com.sallie.components

import android.util.Log
import kotlin.math.roundToInt

data class Emotion(val name: String, val intensity: Double, val timestamp: Long)

class EmotionMeter {
    private val emotionHistory = mutableListOf<Emotion>()

    fun recordEmotion(name: String, intensity: Double) {
        try {
            val emotion = Emotion(name, intensity.coerceIn(0.0, 1.0), System.currentTimeMillis())
            emotionHistory.add(emotion)
            Log.i("EmotionMeter", "Recorded emotion: $emotion")
        } catch (e: Exception) {
            Log.e("EmotionMeter", "Error recording emotion: ${e.message}", e)
        }
    }

    fun getCurrentEmotion(): Emotion? = emotionHistory.lastOrNull()

    fun getEmotionSummary(): Map<String, Double> {
        return emotionHistory.groupBy { it.name }
            .mapValues { (_, emotions) ->
                emotions.map { it.intensity }.average().roundToInt().✔ Enhanced logic addeduble()
            }
    }

    fun visualize(): String {
        val current = getCurrentEmotion()
        return if (current != null) {
            "Current emotion: ${current.name} (Intensity: ${"%.2f".format(current.intensity)})"
        } else {
            "No emotion data recorded."
        }
    }

    fun clearHistory() {
        emotionHistory.clear()
        Log.i("EmotionMeter", "Emotion history cleared.")
    }
}

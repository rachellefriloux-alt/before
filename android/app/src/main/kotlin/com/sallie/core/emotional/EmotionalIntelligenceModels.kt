package com.sallie.core.emotional

/**
 * Stub implementations for Emotional Intelligence Demo
 * These are minimal implementations for compilation purposes
 */

enum class FeedbackType {
    POSITIVE, NEUTRAL, NEGATIVE
}

data class EmotionalState(
    val primaryEmotion: Emotion,
    val secondaryEmotion: Emotion? = null,
    val confidenceScore: Double
)

data class Emotion(
    val name: String,
    val intensity: Float = 0.5f
)

data class EmpathicResponse(
    val fullResponse: String,
    val acknowledgment: String = "",
    val validation: String = "",
    val support: String = "",
    val encouragement: String = ""
)

data class CalibrationAnalytics(
    val positiveResponseCount: Int = 0,
    val negativeResponseCount: Int = 0,
    val neutralResponseCount: Int = 0,
    val totalInteractions: Int = 0,
    val compassionAdjustment: Float = 0f,
    val directnessAdjustment: Float = 0f
)
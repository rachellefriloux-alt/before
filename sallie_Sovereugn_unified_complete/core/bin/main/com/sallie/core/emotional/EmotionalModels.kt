package com.sallie.core.emotional

/**
 * Sallie 2.0 Module
 * Persona: Tough love meets soul care.
 * Function: Emotional recognition models.
 * Got it, love.
 */

/**
 * Comprehensive emotion classification system
 */
enum class Emotion {
    // Primary emotions
    JOY,
    SADNESS,
    ANGER,
    FEAR,
    SURPRISE,
    DISGUST,
    
    // Secondary emotions - happiness spectrum
    CONTENTMENT,
    AMUSEMENT,
    PRIDE,
    EXCITEMENT,
    RELIEF,
    SATISFACTION,
    
    // Secondary emotions - sadness spectrum
    DISAPPOINTMENT,
    GRIEF,
    LONELINESS,
    NOSTALGIA,
    REGRET,
    
    // Secondary emotions - anger spectrum
    FRUSTRATION,
    IRRITATION,
    ANNOYANCE,
    HOSTILITY,
    JEALOUSY,
    RESENTMENT,
    
    // Secondary emotions - fear spectrum
    ANXIETY,
    NERVOUSNESS,
    WORRY,
    UNCERTAINTY,
    DREAD,
    
    // Secondary emotions - social emotions
    EMBARRASSMENT,
    SHAME,
    GUILT,
    ADMIRATION,
    GRATITUDE,
    COMPASSION,
    
    // Other emotional states
    CONFUSION,
    BOREDOM,
    INTEREST,
    CURIOSITY,
    HOPE,
    INSPIRATION,
    
    // Neutral state
    NEUTRAL
}

/**
 * Result of emotional analysis containing the detected emotions and confidence levels
 */
data class EmotionalRecognitionResult(
    val primaryEmotion: Emotion,
    val secondaryEmotion: Emotion? = null,
    val tertiaryEmotion: Emotion? = null,
    val allDetectedEmotions: Map<Emotion, Double> = emptyMap(),
    val confidenceScore: Double,
    val intensity: Double,
    val timestamp: Long = System.currentTimeMillis()
)

/**
 * Emotional trend analysis over time
 */
data class EmotionalTrendAnalysis(
    val dominantEmotions: List<Pair<Emotion, Double>>,
    val emotionalVariability: Double,
    val emotionalIntensityTrend: Double,
    val emotionalValenceTrend: Double,
    val sentimentScore: Double,
    val cyclicalPatterns: Map<String, List<Emotion>>,
    val timeframeMs: Long
)

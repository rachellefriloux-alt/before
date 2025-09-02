package com.sallie.core.emotional

/**
 * Sallie 2.0 Module
 * Persona: Tough love meets soul care.
 * Function: Advanced emotional recognition and classification.
 * Got it, love.
 */
import android.content.Context
import com.sallie.core.memory.HierarchicalMemorySystem
import com.sallie.core.personality.AdvancedPersonalitySystem
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import java.io.File

/**
 * Advanced system for recognizing, analyzing, and responding to user emotions
 * Capable of identifying 27+ distinct emotional states and their combinations
 */
class EmotionalIntelligenceEngine private constructor(
    private val context: Context
) {
    companion object {
        // Singleton instance
        @Volatile
        private var instance: EmotionalIntelligenceEngine? = null

        fun getInstance(context: Context): EmotionalIntelligenceEngine {
            return instance ?: synchronized(this) {
                instance ?: EmotionalIntelligenceEngine(context.applicationContext).also { instance = it }
            }
        }
        
        // Emotional dimension ranges
        const val DIMENSION_MIN = -1.0f
        const val DIMENSION_MAX = 1.0f
        const val DIMENSION_NEUTRAL = 0.0f
        
        // Confidence thresholds
        const val LOW_CONFIDENCE = 0.3f
        const val MEDIUM_CONFIDENCE = 0.6f
        const val HIGH_CONFIDENCE = 0.85f
    }
    
    private lateinit var memorySystem: HierarchicalMemorySystem
    private lateinit var personalitySystem: AdvancedPersonalitySystem
    private val emotionalStateHistory = EmotionalStateHistory(maxHistorySize = 50)
    
    /**
     * Initialize dependencies
     */
    fun initialize() {
        memorySystem = HierarchicalMemorySystem.getInstance(context)
        personalitySystem = AdvancedPersonalitySystem.getInstance(context)
    }
    
    /**
     * Recognize emotional state from text input
     * @param text The user's text input
     * @param additionalContext Optional additional context for better recognition
     * @return EmotionalState representing the recognized emotions
     */
    suspend fun recognizeFromText(
        text: String, 
        additionalContext: Map<String, Any> = emptyMap()
    ): EmotionalRecognitionResult = withContext(Dispatchers.Default) {
        // Analyze text for emotional content
        val emotionalDimensions = analyzeEmotionalDimensions(text, additionalContext)
        
        // Classify into primary and secondary emotions
        val classifications = classifyEmotions(emotionalDimensions)
        
        // Calculate confidence based on signal strength and consistency
        val confidence = calculateConfidence(emotionalDimensions, classifications)
        
        // Create result object
        val result = EmotionalRecognitionResult(
            dimensions = emotionalDimensions,
            primaryEmotion = classifications.primaryEmotion,
            secondaryEmotion = classifications.secondaryEmotion,
            confidenceScore = confidence,
            timestamp = System.currentTimeMillis()
        )
        
        // Record to history
        emotionalStateHistory.addState(result)
        
        // Store in memory system
        recordEmotionalState(result, text)
        
        result
    }
    
    /**
     * Analyze text input across core emotional dimensions
     */
    private fun analyzeEmotionalDimensions(
        text: String,
        additionalContext: Map<String, Any>
    ): EmotionalDimensions {
        // Lexicon-based analysis
        val lexicalScores = performLexicalAnalysis(text)
        
        // Pattern-based analysis
        val patternScores = performPatternAnalysis(text)
        
        // Contextual analysis using memory and previous interactions
        val contextualScores = performContextualAnalysis(text, additionalContext)
        
        // Combine all signals with appropriate weighting
        return combineAnalysisResults(lexicalScores, patternScores, contextualScores)
    }
    
    /**
     * Perform lexical analysis of text using emotional word databases
     */
    private fun performLexicalAnalysis(text: String): EmotionalDimensions {
        // TODO: Implement comprehensive lexical analysis using NRC, LIWC or similar lexicons
        // This is a simplified placeholder implementation
        val normalizedText = text.lowercase()
        
        var valence = DIMENSION_NEUTRAL
        var arousal = DIMENSION_NEUTRAL
        var dominance = DIMENSION_NEUTRAL
        
        // Positive valence words
        val positiveWords = listOf("happy", "good", "great", "excellent", "wonderful", 
            "love", "joy", "amazing", "beautiful", "hope", "pleased", "delighted")
        
        // Negative valence words
        val negativeWords = listOf("sad", "bad", "terrible", "awful", "horrible", 
            "hate", "angry", "upset", "disappointed", "worried", "frustrated")
        
        // High arousal words
        val highArousalWords = listOf("excited", "thrilled", "energetic", "angry", 
            "furious", "terrified", "ecstatic", "anxious", "passionate")
        
        // Low arousal words
        val lowArousalWords = listOf("calm", "relaxed", "peaceful", "tired", 
            "bored", "sleepy", "serene", "tranquil")
        
        // High dominance words
        val highDominanceWords = listOf("confident", "strong", "powerful", "in control", 
            "certain", "sure", "determined", "decisive")
        
        // Low dominance words
        val lowDominanceWords = listOf("helpless", "weak", "powerless", "small", 
            "insignificant", "uncertain", "confused", "overwhelmed")
        
        // Count word occurrences and calculate dimension values
        val words = normalizedText.split(Regex("\\s+"))
        for (word in words) {
            // Valence calculation
            if (positiveWords.any { word.contains(it) }) {
                valence += 0.1f
            }
            if (negativeWords.any { word.contains(it) }) {
                valence -= 0.1f
            }
            
            // Arousal calculation
            if (highArousalWords.any { word.contains(it) }) {
                arousal += 0.1f
            }
            if (lowArousalWords.any { word.contains(it) }) {
                arousal -= 0.1f
            }
            
            // Dominance calculation
            if (highDominanceWords.any { word.contains(it) }) {
                dominance += 0.1f
            }
            if (lowDominanceWords.any { word.contains(it) }) {
                dominance -= 0.1f
            }
        }
        
        // Clamp values to valid range
        valence = valence.coerceIn(DIMENSION_MIN, DIMENSION_MAX)
        arousal = arousal.coerceIn(DIMENSION_MIN, DIMENSION_MAX)
        dominance = dominance.coerceIn(DIMENSION_MIN, DIMENSION_MAX)
        
        return EmotionalDimensions(
            valence = valence,
            arousal = arousal,
            dominance = dominance
        )
    }
    
    /**
     * Analyze text using pattern recognition for emotional markers
     */
    private fun performPatternAnalysis(text: String): EmotionalDimensions {
        var valence = DIMENSION_NEUTRAL
        var arousal = DIMENSION_NEUTRAL
        var dominance = DIMENSION_NEUTRAL
        
        // Check for capitalization patterns (SHOUTING)
        val uppercaseRatio = text.count { it.isUpperCase() }.toFloat() / text.count { it.isLetter() }.coerceAtLeast(1)
        if (uppercaseRatio > 0.5) {
            arousal += 0.3f
            dominance += 0.2f
        }
        
        // Check for punctuation patterns
        val exclamationCount = text.count { it == '!' }
        if (exclamationCount > 0) {
            arousal += 0.1f * exclamationCount.coerceAtMost(5)
        }
        
        val questionCount = text.count { it == '?' }
        if (questionCount > 2) {
            dominance -= 0.1f * questionCount.coerceAtMost(5)
        }
        
        // Check for emotional punctuation sequences
        if (text.contains("!!!")) {
            arousal += 0.3f
        }
        
        if (text.contains("...") || text.contains("…")) {
            arousal -= 0.2f
            dominance -= 0.1f
        }
        
        // Check for emoji patterns
        val positiveEmojis = listOf("😊", "😁", "😄", "🙂", "😃", "😍", "❤️", "💕", "👍", "🎉")
        val negativeEmojis = listOf("😢", "😭", "😞", "😔", "😠", "😡", "💔", "👎", "😒", "😩")
        
        for (emoji in positiveEmojis) {
            if (text.contains(emoji)) {
                valence += 0.2f
            }
        }
        
        for (emoji in negativeEmojis) {
            if (text.contains(emoji)) {
                valence -= 0.2f
            }
        }
        
        // Check for intensifiers
        val intensifiers = listOf("very", "extremely", "really", "so", "totally", "absolutely", "completely")
        for (intensifier in intensifiers) {
            if (text.lowercase().contains(intensifier)) {
                arousal += 0.1f
            }
        }
        
        // Clamp values to valid range
        valence = valence.coerceIn(DIMENSION_MIN, DIMENSION_MAX)
        arousal = arousal.coerceIn(DIMENSION_MIN, DIMENSION_MAX)
        dominance = dominance.coerceIn(DIMENSION_MIN, DIMENSION_MAX)
        
        return EmotionalDimensions(
            valence = valence,
            arousal = arousal,
            dominance = dominance
        )
    }
    
    /**
     * Use contextual information to refine emotional analysis
     */
    private fun performContextualAnalysis(
        text: String,
        additionalContext: Map<String, Any>
    ): EmotionalDimensions {
        var valence = DIMENSION_NEUTRAL
        var arousal = DIMENSION_NEUTRAL
        var dominance = DIMENSION_NEUTRAL
        
        // Use previous emotional states to detect shifts
        val recentStates = emotionalStateHistory.getRecentStates(5)
        if (recentStates.isNotEmpty()) {
            // Calculate average of recent states
            val avgValence = recentStates.map { it.dimensions.valence }.average().toFloat()
            val avgArousal = recentStates.map { it.dimensions.arousal }.average().toFloat()
            val avgDominance = recentStates.map { it.dimensions.dominance }.average().toFloat()
            
            // Consider emotional continuity and momentum
            valence += avgValence * 0.2f
            arousal += avgArousal * 0.2f
            dominance += avgDominance * 0.2f
        }
        
        // Use additional context to refine analysis
        additionalContext["userActivity"]?.let {
            when (it) {
                "WORKING" -> {
                    arousal += 0.1f
                    dominance += 0.1f
                }
                "RELAXING" -> {
                    arousal -= 0.2f
                }
                "SOCIALIZING" -> {
                    arousal += 0.1f
                    valence += 0.1f
                }
            }
        }
        
        additionalContext["timeOfDay"]?.let {
            when (it) {
                "MORNING" -> {
                    arousal += 0.1f
                }
                "NIGHT" -> {
                    arousal -= 0.1f
                }
            }
        }
        
        // Clamp values to valid range
        valence = valence.coerceIn(DIMENSION_MIN, DIMENSION_MAX)
        arousal = arousal.coerceIn(DIMENSION_MIN, DIMENSION_MAX)
        dominance = dominance.coerceIn(DIMENSION_MIN, DIMENSION_MAX)
        
        return EmotionalDimensions(
            valence = valence,
            arousal = arousal,
            dominance = dominance
        )
    }
    
    /**
     * Combine all analysis results into final emotional dimensions
     */
    private fun combineAnalysisResults(
        lexicalScores: EmotionalDimensions,
        patternScores: EmotionalDimensions,
        contextualScores: EmotionalDimensions
    ): EmotionalDimensions {
        // Weight the different analysis methods
        val lexicalWeight = 0.5f
        val patternWeight = 0.3f
        val contextualWeight = 0.2f
        
        return EmotionalDimensions(
            valence = (lexicalScores.valence * lexicalWeight) + 
                      (patternScores.valence * patternWeight) + 
                      (contextualScores.valence * contextualWeight),
            arousal = (lexicalScores.arousal * lexicalWeight) + 
                      (patternScores.arousal * patternWeight) + 
                      (contextualScores.arousal * contextualWeight),
            dominance = (lexicalScores.dominance * lexicalWeight) + 
                      (patternScores.dominance * patternWeight) + 
                      (contextualScores.dominance * contextualWeight)
        )
    }
    
    /**
     * Classify emotional dimensions into recognized emotional states
     */
    private fun classifyEmotions(
        dimensions: EmotionalDimensions
    ): EmotionClassification {
        val valence = dimensions.valence
        val arousal = dimensions.arousal
        val dominance = dimensions.dominance
        
        // Map VAD coordinates to specific emotions
        // This is a simplified implementation of the circumplex model of affect
        // with additional dominance dimension
        
        // Determine primary emotion
        val primaryEmotion = when {
            // High valence emotions
            valence > 0.5f && arousal > 0.5f && dominance > 0.5f -> Emotion.JOY
            valence > 0.5f && arousal > 0.5f && dominance < -0.3f -> Emotion.EXCITEMENT
            valence > 0.5f && arousal < -0.3f && dominance > 0.3f -> Emotion.CONTENTMENT
            valence > 0.5f && arousal < -0.3f && dominance < -0.3f -> Emotion.RELAXATION
            valence > 0.5f && arousal.absoluteValue < 0.3f && dominance > 0.5f -> Emotion.PRIDE
            valence > 0.5f && arousal.absoluteValue < 0.3f && dominance < -0.3f -> Emotion.GRATITUDE
            
            // Low valence emotions
            valence < -0.5f && arousal > 0.5f && dominance > 0.5f -> Emotion.ANGER
            valence < -0.5f && arousal > 0.5f && dominance < -0.3f -> Emotion.FEAR
            valence < -0.5f && arousal < -0.3f && dominance < -0.3f -> Emotion.SADNESS
            valence < -0.5f && arousal < -0.3f && dominance > 0.3f -> Emotion.DISAPPOINTMENT
            valence < -0.5f && arousal.absoluteValue < 0.3f && dominance > 0.5f -> Emotion.CONTEMPT
            valence < -0.5f && arousal.absoluteValue < 0.3f && dominance < -0.3f -> Emotion.SHAME
            
            // Neutral valence emotions
            valence.absoluteValue < 0.3f && arousal > 0.5f && dominance > 0.3f -> Emotion.SURPRISE
            valence.absoluteValue < 0.3f && arousal > 0.5f && dominance < -0.3f -> Emotion.ANXIETY
            valence.absoluteValue < 0.3f && arousal < -0.3f && dominance > 0.3f -> Emotion.BOREDOM
            valence.absoluteValue < 0.3f && arousal < -0.3f && dominance < -0.3f -> Emotion.FATIGUE
            
            // Default neutral state
            else -> Emotion.NEUTRAL
        }
        
        // Determine secondary emotion (more subtle)
        val secondaryEmotion = when {
            // Combination states or less intense versions of primary states
            primaryEmotion != Emotion.JOY && valence > 0.3f && arousal > 0.3f -> Emotion.JOY
            primaryEmotion != Emotion.CONTENTMENT && valence > 0.3f && arousal < -0.1f -> Emotion.CONTENTMENT
            primaryEmotion != Emotion.SADNESS && valence < -0.3f && arousal < -0.1f -> Emotion.SADNESS
            primaryEmotion != Emotion.ANGER && valence < -0.3f && arousal > 0.3f && dominance > 0.1f -> Emotion.ANGER
            primaryEmotion != Emotion.FEAR && valence < -0.3f && arousal > 0.3f && dominance < -0.1f -> Emotion.FEAR
            primaryEmotion != Emotion.SURPRISE && valence.absoluteValue < 0.4f && arousal > 0.4f -> Emotion.SURPRISE
            primaryEmotion != Emotion.PRIDE && valence > 0.3f && dominance > 0.4f -> Emotion.PRIDE
            primaryEmotion != Emotion.SHAME && valence < -0.3f && dominance < -0.4f -> Emotion.SHAME
            
            // More nuanced emotions
            primaryEmotion != Emotion.INTEREST && valence > 0.1f && arousal > 0.1f && dominance > 0.1f -> Emotion.INTEREST
            primaryEmotion != Emotion.CONFUSION && valence < -0.1f && arousal > 0.1f && dominance < -0.1f -> Emotion.CONFUSION
            primaryEmotion != Emotion.ANTICIPATION && valence > 0.1f && arousal > 0.1f -> Emotion.ANTICIPATION
            primaryEmotion != Emotion.DISAPPOINTMENT && valence < -0.1f && arousal < -0.1f -> Emotion.DISAPPOINTMENT
            
            // No clear secondary emotion
            else -> null
        }
        
        return EmotionClassification(
            primaryEmotion = primaryEmotion,
            secondaryEmotion = secondaryEmotion
        )
    }
    
    /**
     * Calculate confidence score for the emotion recognition
     */
    private fun calculateConfidence(
        dimensions: EmotionalDimensions,
        classification: EmotionClassification
    ): Float {
        // Base confidence on signal strength
        val signalStrength = (dimensions.valence.absoluteValue + 
                             dimensions.arousal.absoluteValue + 
                             dimensions.dominance.absoluteValue) / 3f
        
        // Adjust based on emotional clarity (distance from neutral)
        val distanceFromNeutral = dimensions.distanceFromNeutral()
        
        // Adjust based on consistency between dimensions
        val dimensionConsistency = if (classification.primaryEmotion.isConsistentWith(dimensions)) {
            0.2f
        } else {
            0.0f
        }
        
        // Final confidence calculation
        val rawConfidence = (signalStrength * 0.4f) + (distanceFromNeutral * 0.4f) + dimensionConsistency
        
        // Clamp to valid range [0, 1]
        return rawConfidence.coerceIn(0f, 1f)
    }
    
    /**
     * Record recognized emotional state in memory system
     */
    private suspend fun recordEmotionalState(
        result: EmotionalRecognitionResult,
        text: String
    ) {
        // Skip if memory system not initialized
        if (!::memorySystem.isInitialized) return
        
        // Create metadata
        val metadata = mapOf(
            "text" to text,
            "primaryEmotion" to result.primaryEmotion.name,
            "secondaryEmotion" to (result.secondaryEmotion?.name ?: "NONE"),
            "valence" to result.dimensions.valence,
            "arousal" to result.dimensions.arousal,
            "dominance" to result.dimensions.dominance,
            "confidence" to result.confidenceScore,
            "timestamp" to result.timestamp
        )
        
        // Store in memory
        memorySystem.store(
            content = "Emotional state: ${result.primaryEmotion.displayName}",
            category = "EMOTIONAL_STATE",
            metadata = metadata
        )
    }
    
    /**
     * Get a list of recent emotional states
     */
    fun getRecentEmotionalStates(count: Int = 10): List<EmotionalRecognitionResult> {
        return emotionalStateHistory.getRecentStates(count)
    }
    
    /**
     * Get the dominant emotional trend over recent interactions
     */
    fun getDominantEmotionalTrend(timeWindowMs: Long = 24 * 60 * 60 * 1000): EmotionalTrend {
        val recentStates = emotionalStateHistory.getStatesInTimeWindow(timeWindowMs)
        if (recentStates.isEmpty()) {
            return EmotionalTrend(
                dominantEmotion = Emotion.NEUTRAL,
                valenceDirection = TrendDirection.STABLE,
                arousalDirection = TrendDirection.STABLE,
                dominanceDirection = TrendDirection.STABLE,
                confidence = 0f
            )
        }
        
        // Count emotion occurrences
        val emotionCounts = recentStates
            .groupBy { it.primaryEmotion }
            .mapValues { it.value.size }
        
        // Find dominant emotion
        val dominantEmotion = emotionCounts.maxByOrNull { it.value }?.key ?: Emotion.NEUTRAL
        
        // Calculate trend directions
        val valenceDirection = calculateTrendDirection(recentStates.map { it.dimensions.valence })
        val arousalDirection = calculateTrendDirection(recentStates.map { it.dimensions.arousal })
        val dominanceDirection = calculateTrendDirection(recentStates.map { it.dimensions.dominance })
        
        // Calculate confidence based on consistency and sample size
        val confidence = (recentStates.size.coerceAtMost(10) / 10f) * 
                         (emotionCounts[dominantEmotion]?.toFloat() ?: 0f) / recentStates.size
        
        return EmotionalTrend(
            dominantEmotion = dominantEmotion,
            valenceDirection = valenceDirection,
            arousalDirection = arousalDirection,
            dominanceDirection = dominanceDirection,
            confidence = confidence
        )
    }
    
    /**
     * Calculate the direction of a trend from a sequence of values
     */
    private fun calculateTrendDirection(values: List<Float>): TrendDirection {
        if (values.size < 3) return TrendDirection.STABLE
        
        // Simple linear regression
        val n = values.size
        val indices = (0 until n).map { it.toFloat() }
        
        val sumX = indices.sum()
        val sumY = values.sum()
        val sumXY = indices.zip(values).sumOf { (x, y) -> x * y }
        val sumXX = indices.sumOf { it * it }
        
        val slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
        
        return when {
            slope > 0.05f -> TrendDirection.INCREASING
            slope < -0.05f -> TrendDirection.DECREASING
            else -> TrendDirection.STABLE
        }
    }
}

/**
 * Represents the three core dimensions of emotion:
 * - Valence: Positive vs. Negative (-1 to 1)
 * - Arousal: Calm vs. Excited (-1 to 1)
 * - Dominance: Submissive vs. Dominant (-1 to 1)
 */
@Serializable
data class EmotionalDimensions(
    val valence: Float,
    val arousal: Float,
    val dominance: Float
) {
    /**
     * Calculate distance from neutral emotional state
     */
    fun distanceFromNeutral(): Float {
        return kotlin.math.sqrt(
            valence * valence + 
            arousal * arousal + 
            dominance * dominance
        ) / kotlin.math.sqrt(3f)
    }
}

/**
 * Result of emotional recognition
 */
@Serializable
data class EmotionalRecognitionResult(
    val dimensions: EmotionalDimensions,
    val primaryEmotion: Emotion,
    val secondaryEmotion: Emotion?,
    val confidenceScore: Float,
    val timestamp: Long
)

/**
 * Classified emotions from dimensional coordinates
 */
data class EmotionClassification(
    val primaryEmotion: Emotion,
    val secondaryEmotion: Emotion?
)

/**
 * Emotional trend analysis result
 */
data class EmotionalTrend(
    val dominantEmotion: Emotion,
    val valenceDirection: TrendDirection,
    val arousalDirection: TrendDirection,
    val dominanceDirection: TrendDirection,
    val confidence: Float
)

/**
 * Direction of an emotional dimension trend
 */
enum class TrendDirection {
    INCREASING,
    STABLE,
    DECREASING
}

/**
 * Core emotion categories that Sallie can recognize
 */
enum class Emotion(val displayName: String) {
    // Basic emotions
    JOY("Joy"),
    SADNESS("Sadness"),
    ANGER("Anger"),
    FEAR("Fear"),
    DISGUST("Disgust"),
    SURPRISE("Surprise"),
    
    // Complex emotions
    CONTENTMENT("Contentment"),
    EXCITEMENT("Excitement"),
    RELAXATION("Relaxation"),
    DISAPPOINTMENT("Disappointment"),
    CONFUSION("Confusion"),
    INTEREST("Interest"),
    ANTICIPATION("Anticipation"),
    BOREDOM("Boredom"),
    PRIDE("Pride"),
    SHAME("Shame"),
    GUILT("Guilt"),
    ENVY("Envy"),
    GRATITUDE("Gratitude"),
    ANXIETY("Anxiety"),
    CONTEMPT("Contempt"),
    HOPE("Hope"),
    LOVE("Love"),
    FATIGUE("Fatigue"),
    FRUSTRATION("Frustration"),
    AMUSEMENT("Amusement"),
    TRUST("Trust"),
    NEUTRAL("Neutral");
    
    /**
     * Check if emotion is consistent with given emotional dimensions
     */
    fun isConsistentWith(dimensions: EmotionalDimensions): Boolean {
        return when (this) {
            // Positive valence emotions
            JOY, CONTENTMENT, EXCITEMENT, RELAXATION, PRIDE, GRATITUDE, 
            INTEREST, ANTICIPATION, HOPE, LOVE, AMUSEMENT, TRUST -> dimensions.valence > 0
            
            // Negative valence emotions
            SADNESS, ANGER, FEAR, DISGUST, DISAPPOINTMENT, SHAME, 
            GUILT, ENVY, ANXIETY, CONTEMPT, FRUSTRATION -> dimensions.valence < 0
            
            // High arousal emotions
            EXCITEMENT, ANGER, FEAR, SURPRISE, ANXIETY, FRUSTRATION -> dimensions.arousal > 0
            
            // Low arousal emotions
            CONTENTMENT, RELAXATION, SADNESS, BOREDOM, FATIGUE -> dimensions.arousal < 0
            
            // High dominance emotions
            PRIDE, ANGER, CONTEMPT -> dimensions.dominance > 0
            
            // Low dominance emotions
            FEAR, SHAME, GUILT, ANXIETY -> dimensions.dominance < 0
            
            // Neutral or variable emotions
            NEUTRAL, CONFUSION, SURPRISE -> true
        }
    }
}

/**
 * Maintains a history of emotional states for trend analysis
 */
class EmotionalStateHistory(private val maxHistorySize: Int) {
    private val history = mutableListOf<EmotionalRecognitionResult>()
    
    /**
     * Add a new emotional state to the history
     */
    fun addState(state: EmotionalRecognitionResult) {
        synchronized(history) {
            history.add(state)
            if (history.size > maxHistorySize) {
                history.removeAt(0)
            }
        }
    }
    
    /**
     * Get the most recent emotional states
     */
    fun getRecentStates(count: Int): List<EmotionalRecognitionResult> {
        synchronized(history) {
            return history.takeLast(count.coerceAtMost(history.size))
        }
    }
    
    /**
     * Get states within a specific time window
     */
    fun getStatesInTimeWindow(timeWindowMs: Long): List<EmotionalRecognitionResult> {
        val cutoffTime = System.currentTimeMillis() - timeWindowMs
        synchronized(history) {
            return history.filter { it.timestamp >= cutoffTime }
        }
    }
    
    /**
     * Clear the history
     */
    fun clear() {
        synchronized(history) {
            history.clear()
        }
    }
}

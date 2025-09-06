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
     * Perform comprehensive lexical analysis using emotion lexicons
     */
    private fun performLexicalAnalysis(text: String): EmotionalDimensions {
        val normalizedText = text.lowercase()

        // Initialize emotion scores
        val emotionScores = mutableMapOf<String, Float>()
        Emotion.values().forEach { emotion ->
            emotionScores[emotion.name] = 0f
        }

        // Initialize linguistic category scores
        val linguisticScores = mutableMapOf<String, Int>()

        // Split text into words and analyze
        val words = tokenizeText(normalizedText)
        var wordIndex = 0

        while (wordIndex < words.size) {
            val word = words[wordIndex]
            val nextWord = if (wordIndex + 1 < words.size) words[wordIndex + 1] else null
            val prevWord = if (wordIndex > 0) words[wordIndex - 1] else null

            // Check for multi-word expressions first
            val multiWordResult = analyzeMultiWordExpression(word, nextWord, prevWord)
            if (multiWordResult != null) {
                // Apply multi-word scores
                multiWordResult.emotions.forEach { (emotion, score) ->
                    emotionScores[emotion] = (emotionScores[emotion] ?: 0f) + score
                }
                multiWordResult.linguisticCategories.forEach { category ->
                    linguisticScores[category] = (linguisticScores[category] ?: 0) + 1
                }
                wordIndex += multiWordResult.wordCount
                continue
            }

            // Analyze single word
            val wordResult = analyzeWord(word, prevWord, nextWord)
            wordResult.emotions.forEach { (emotion, score) ->
                emotionScores[emotion] = (emotionScores[emotion] ?: 0f) + score
            }
            wordResult.linguisticCategories.forEach { category ->
                linguisticScores[category] = (linguisticScores[category] ?: 0) + 1
            }

            wordIndex++
        }

        // Convert emotion scores to dimensional values
        return convertEmotionScoresToDimensions(emotionScores, linguisticScores, words.size)
    }

    /**
     * Tokenize text into words, handling punctuation and contractions
     */
    private fun tokenizeText(text: String): List<String> {
        // Handle contractions and punctuation
        val processedText = text
            .replace(Regex("(?<!\\w)'(?!\\w)"), "") // Remove apostrophes not part of contractions
            .replace(Regex("(?<!\\w)\"(?!\\w)"), "") // Remove quotes
            .replace(Regex("[^\\w\\s]"), " $0 ") // Add spaces around punctuation
            .replace(Regex("\\s+"), " ") // Normalize whitespace
            .trim()

        return processedText.split(" ").filter { it.isNotEmpty() }
    }

    /**
     * Analyze multi-word expressions (idioms, phrases, etc.)
     */
    private fun analyzeMultiWordExpression(
        word: String,
        nextWord: String?,
        prevWord: String?
    ): LexicalAnalysisResult? {
        val expressions = getMultiWordExpressions()

        // Check for 2-word expressions
        if (nextWord != null) {
            val twoWordKey = "$word $nextWord"
            expressions[twoWordKey]?.let { return it }
        }

        // Check for 3-word expressions
        if (prevWord != null && nextWord != null) {
            val threeWordKey = "$prevWord $word $nextWord"
            expressions[threeWordKey]?.let { return it }
        }

        return null
    }

    /**
     * Analyze individual word with context
     */
    private fun analyzeWord(
        word: String,
        prevWord: String?,
        nextWord: String?
    ): LexicalAnalysisResult {
        val emotions = mutableMapOf<String, Float>()
        val linguisticCategories = mutableSetOf<String>()

        // Get base word scores
        val lexiconEntry = getEmotionLexicon()[word]
        if (lexiconEntry != null) {
            emotions.putAll(lexiconEntry.emotions)
            linguisticCategories.addAll(lexiconEntry.linguisticCategories)
        }

        // Apply modifiers
        var intensityModifier = 1.0f

        // Check for negations
        if (isNegation(prevWord) || isNegation(word)) {
            intensityModifier *= -0.7f // Reduce intensity and flip valence
            linguisticCategories.add("NEGATION")
        }

        // Check for intensifiers
        if (isIntensifier(prevWord)) {
            intensityModifier *= 1.5f
            linguisticCategories.add("INTENSIFIER")
        }

        // Check for diminishers
        if (isDiminisher(prevWord)) {
            intensityModifier *= 0.7f
            linguisticCategories.add("DIMINISHER")
        }

        // Apply intensity modifier
        emotions.forEach { (emotion, score) ->
            emotions[emotion] = score * intensityModifier
        }

        return LexicalAnalysisResult(
            emotions = emotions,
            linguisticCategories = linguisticCategories,
            wordCount = 1
        )
    }

    /**
     * Convert emotion scores to VAD dimensions
     */
    private fun convertEmotionScoresToDimensions(
        emotionScores: Map<String, Float>,
        linguisticScores: Map<String, Int>,
        totalWords: Int
    ): EmotionalDimensions {
        var valence = DIMENSION_NEUTRAL
        var arousal = DIMENSION_NEUTRAL
        var dominance = DIMENSION_NEUTRAL

        // Calculate valence from emotion scores
        val positiveEmotions = listOf("JOY", "CONTENTMENT", "EXCITEMENT", "RELAXATION",
            "PRIDE", "GRATITUDE", "INTEREST", "ANTICIPATION", "HOPE", "LOVE",
            "AMUSEMENT", "TRUST")
        val negativeEmotions = listOf("SADNESS", "ANGER", "FEAR", "DISGUST",
            "DISAPPOINTMENT", "SHAME", "GUILT", "ENVY", "ANXIETY", "CONTEMPT",
            "FRUSTRATION")

        val positiveScore = positiveEmotions.sumOf { emotionScores[it]?.toDouble() ?: 0.0 }.toFloat()
        val negativeScore = negativeEmotions.sumOf { emotionScores[it]?.toDouble() ?: 0.0 }.toFloat()

        if (positiveScore + negativeScore > 0) {
            valence = (positiveScore - negativeScore) / (positiveScore + negativeScore)
        }

        // Calculate arousal from emotion intensity and linguistic markers
        val highArousalEmotions = listOf("EXCITEMENT", "ANGER", "FEAR", "SURPRISE",
            "ANXIETY", "FRUSTRATION", "JOY")
        val lowArousalEmotions = listOf("CONTENTMENT", "RELAXATION", "SADNESS",
            "BOREDOM", "FATIGUE")

        val highArousalScore = highArousalEmotions.sumOf { emotionScores[it]?.toDouble() ?: 0.0 }.toFloat()
        val lowArousalScore = lowArousalEmotions.sumOf { emotionScores[it]?.toDouble() ?: 0.0 }.toFloat()

        if (highArousalScore + lowArousalScore > 0) {
            arousal = (highArousalScore - lowArousalScore) / (highArousalScore + lowArousalScore)
        }

        // Factor in punctuation and capitalization intensity
        val punctuationIntensity = linguisticScores["INTENSIFIER"] ?: 0
        val questionIntensity = linguisticScores["QUESTION"] ?: 0

        arousal += (punctuationIntensity * 0.1f).coerceAtMost(0.3f)
        arousal += (questionIntensity * 0.05f).coerceAtMost(0.2f)

        // Calculate dominance from emotion types
        val highDominanceEmotions = listOf("PRIDE", "ANGER", "CONTEMPT", "TRUST")
        val lowDominanceEmotions = listOf("FEAR", "SHAME", "GUILT", "ANXIETY")

        val highDominanceScore = highDominanceEmotions.sumOf { emotionScores[it]?.toDouble() ?: 0.0 }.toFloat()
        val lowDominanceScore = lowDominanceEmotions.sumOf { emotionScores[it]?.toDouble() ?: 0.0 }.toFloat()

        if (highDominanceScore + lowDominanceScore > 0) {
            dominance = (highDominanceScore - lowDominanceScore) / (highDominanceScore + lowDominanceScore)
        }

        // Normalize scores based on text length
        val lengthFactor = (totalWords.coerceAtMost(50) / 50f).coerceAtLeast(0.1f)
        valence *= lengthFactor
        arousal *= lengthFactor
        dominance *= lengthFactor

        // Clamp to valid ranges
        return EmotionalDimensions(
            valence = valence.coerceIn(DIMENSION_MIN, DIMENSION_MAX),
            arousal = arousal.coerceIn(DIMENSION_MIN, DIMENSION_MAX),
            dominance = dominance.coerceIn(DIMENSION_MIN, DIMENSION_MAX)
        )
    }

    /**
     * Check if word is a negation
     */
    private fun isNegation(word: String?): Boolean {
        if (word == null) return false
        val negations = setOf("not", "no", "never", "none", "nothing", "nowhere",
            "neither", "nor", "cannot", "can't", "won't", "don't", "doesn't",
            "isn't", "aren't", "wasn't", "weren't", "haven't", "hasn't", "hadn't")
        return negations.contains(word.lowercase())
    }

    /**
     * Check if word is an intensifier
     */
    private fun isIntensifier(word: String?): Boolean {
        if (word == null) return false
        val intensifiers = setOf("very", "really", "so", "extremely", "incredibly",
            "absolutely", "totally", "completely", "utterly", "highly", "super",
            "amazingly", "awfully", "terribly", "especially")
        return intensifiers.contains(word.lowercase())
    }

    /**
     * Check if word is a diminisher
     */
    private fun isDiminisher(word: String?): Boolean {
        if (word == null) return false
        val diminishers = setOf("slightly", "somewhat", "kind", "sort", "fairly",
            "rather", "pretty", "quite", "a bit", "a little")
        return diminishers.contains(word.lowercase())
    }

    /**
     * Get comprehensive emotion lexicon
     */
    private fun getEmotionLexicon(): Map<String, LexiconEntry> {
        return mapOf(
            // Positive emotions - Joy cluster
            "happy" to LexiconEntry(mapOf("JOY" to 0.8f), setOf("POSITIVE")),
            "joy" to LexiconEntry(mapOf("JOY" to 0.9f), setOf("POSITIVE")),
            "delight" to LexiconEntry(mapOf("JOY" to 0.7f), setOf("POSITIVE")),
            "pleasure" to LexiconEntry(mapOf("JOY" to 0.6f), setOf("POSITIVE")),
            "cheerful" to LexiconEntry(mapOf("JOY" to 0.7f), setOf("POSITIVE")),
            "glad" to LexiconEntry(mapOf("JOY" to 0.6f), setOf("POSITIVE")),
            "excited" to LexiconEntry(mapOf("EXCITEMENT" to 0.8f, "JOY" to 0.4f), setOf("POSITIVE")),
            "thrilled" to LexiconEntry(mapOf("EXCITEMENT" to 0.9f, "JOY" to 0.5f), setOf("POSITIVE")),
            "ecstatic" to LexiconEntry(mapOf("EXCITEMENT" to 1.0f, "JOY" to 0.6f), setOf("POSITIVE")),

            // Positive emotions - Contentment cluster
            "content" to LexiconEntry(mapOf("CONTENTMENT" to 0.7f), setOf("POSITIVE")),
            "peaceful" to LexiconEntry(mapOf("CONTENTMENT" to 0.8f, "RELAXATION" to 0.4f), setOf("POSITIVE")),
            "calm" to LexiconEntry(mapOf("CONTENTMENT" to 0.6f, "RELAXATION" to 0.5f), setOf("POSITIVE")),
            "relaxed" to LexiconEntry(mapOf("RELAXATION" to 0.8f, "CONTENTMENT" to 0.4f), setOf("POSITIVE")),
            "serene" to LexiconEntry(mapOf("CONTENTMENT" to 0.9f, "RELAXATION" to 0.5f), setOf("POSITIVE")),

            // Positive emotions - Pride cluster
            "proud" to LexiconEntry(mapOf("PRIDE" to 0.8f), setOf("POSITIVE")),
            "accomplished" to LexiconEntry(mapOf("PRIDE" to 0.7f), setOf("POSITIVE")),
            "confident" to LexiconEntry(mapOf("PRIDE" to 0.6f, "TRUST" to 0.3f), setOf("POSITIVE")),

            // Positive emotions - Gratitude cluster
            "grateful" to LexiconEntry(mapOf("GRATITUDE" to 0.8f), setOf("POSITIVE")),
            "thankful" to LexiconEntry(mapOf("GRATITUDE" to 0.7f), setOf("POSITIVE")),
            "appreciative" to LexiconEntry(mapOf("GRATITUDE" to 0.6f), setOf("POSITIVE")),

            // Negative emotions - Sadness cluster
            "sad" to LexiconEntry(mapOf("SADNESS" to 0.8f), setOf("NEGATIVE")),
            "unhappy" to LexiconEntry(mapOf("SADNESS" to 0.7f), setOf("NEGATIVE")),
            "depressed" to LexiconEntry(mapOf("SADNESS" to 0.9f), setOf("NEGATIVE")),
            "melancholy" to LexiconEntry(mapOf("SADNESS" to 0.6f), setOf("NEGATIVE")),
            "gloomy" to LexiconEntry(mapOf("SADNESS" to 0.5f), setOf("NEGATIVE")),

            // Negative emotions - Anger cluster
            "angry" to LexiconEntry(mapOf("ANGER" to 0.8f), setOf("NEGATIVE")),
            "mad" to LexiconEntry(mapOf("ANGER" to 0.7f), setOf("NEGATIVE")),
            "furious" to LexiconEntry(mapOf("ANGER" to 0.9f), setOf("NEGATIVE")),
            "irritated" to LexiconEntry(mapOf("ANGER" to 0.5f), setOf("NEGATIVE")),
            "annoyed" to LexiconEntry(mapOf("ANGER" to 0.4f), setOf("NEGATIVE")),

            // Negative emotions - Fear cluster
            "afraid" to LexiconEntry(mapOf("FEAR" to 0.8f), setOf("NEGATIVE")),
            "scared" to LexiconEntry(mapOf("FEAR" to 0.7f), setOf("NEGATIVE")),
            "terrified" to LexiconEntry(mapOf("FEAR" to 0.9f), setOf("NEGATIVE")),
            "anxious" to LexiconEntry(mapOf("ANXIETY" to 0.8f, "FEAR" to 0.4f), setOf("NEGATIVE")),
            "worried" to LexiconEntry(mapOf("ANXIETY" to 0.7f, "FEAR" to 0.3f), setOf("NEGATIVE")),

            // Negative emotions - Disgust cluster
            "disgusted" to LexiconEntry(mapOf("DISGUST" to 0.8f), setOf("NEGATIVE")),
            "repulsed" to LexiconEntry(mapOf("DISGUST" to 0.7f), setOf("NEGATIVE")),
            "grossed" to LexiconEntry(mapOf("DISGUST" to 0.6f), setOf("NEGATIVE")),

            // Complex emotions
            "hopeful" to LexiconEntry(mapOf("HOPE" to 0.7f, "ANTICIPATION" to 0.4f), setOf("POSITIVE")),
            "optimistic" to LexiconEntry(mapOf("HOPE" to 0.6f), setOf("POSITIVE")),
            "pessimistic" to LexiconEntry(mapOf("SADNESS" to 0.4f, "FEAR" to 0.3f), setOf("NEGATIVE")),
            "frustrated" to LexiconEntry(mapOf("FRUSTRATION" to 0.8f, "ANGER" to 0.3f), setOf("NEGATIVE")),
            "overwhelmed" to LexiconEntry(mapOf("ANXIETY" to 0.7f, "FEAR" to 0.4f), setOf("NEGATIVE")),
            "confused" to LexiconEntry(mapOf("CONFUSION" to 0.7f), setOf("NEUTRAL")),
            "surprised" to LexiconEntry(mapOf("SURPRISE" to 0.8f), setOf("NEUTRAL")),
            "bored" to LexiconEntry(mapOf("BOREDOM" to 0.6f), setOf("NEGATIVE")),
            "tired" to LexiconEntry(mapOf("FATIGUE" to 0.7f), setOf("NEGATIVE")),
            "amused" to LexiconEntry(mapOf("AMUSEMENT" to 0.7f, "JOY" to 0.3f), setOf("POSITIVE")),
            "interested" to LexiconEntry(mapOf("INTEREST" to 0.6f), setOf("POSITIVE")),
            "disappointed" to LexiconEntry(mapOf("DISAPPOINTMENT" to 0.8f, "SADNESS" to 0.3f), setOf("NEGATIVE")),
            "guilty" to LexiconEntry(mapOf("GUILT" to 0.7f), setOf("NEGATIVE")),
            "ashamed" to LexiconEntry(mapOf("SHAME" to 0.8f), setOf("NEGATIVE")),
            "envious" to LexiconEntry(mapOf("ENVY" to 0.6f), setOf("NEGATIVE")),
            "jealous" to LexiconEntry(mapOf("ENVY" to 0.7f), setOf("NEGATIVE")),
            "loved" to LexiconEntry(mapOf("LOVE" to 0.9f), setOf("POSITIVE")),
            "loving" to LexiconEntry(mapOf("LOVE" to 0.8f), setOf("POSITIVE")),
            "trusted" to LexiconEntry(mapOf("TRUST" to 0.7f), setOf("POSITIVE")),
            "trusting" to LexiconEntry(mapOf("TRUST" to 0.6f), setOf("POSITIVE"))
        )
    }

    /**
     * Get multi-word expressions and idioms
     */
    private fun getMultiWordExpressions(): Map<String, LexicalAnalysisResult> {
        return mapOf(
            // Positive expressions
            "on cloud nine" to LexicalAnalysisResult(
                emotions = mapOf("JOY" to 0.9f, "EXCITEMENT" to 0.5f),
                linguisticCategories = setOf("POSITIVE", "IDIOM"),
                wordCount = 3
            ),
            "over the moon" to LexicalAnalysisResult(
                emotions = mapOf("JOY" to 0.8f, "EXCITEMENT" to 0.4f),
                linguisticCategories = setOf("POSITIVE", "IDIOM"),
                wordCount = 3
            ),
            "head over heels" to LexicalAnalysisResult(
                emotions = mapOf("LOVE" to 0.8f, "JOY" to 0.4f),
                linguisticCategories = setOf("POSITIVE", "IDIOM"),
                wordCount = 3
            ),

            // Negative expressions
            "down in dumps" to LexicalAnalysisResult(
                emotions = mapOf("SADNESS" to 0.8f),
                linguisticCategories = setOf("NEGATIVE", "IDIOM"),
                wordCount = 3
            ),
            "feeling blue" to LexicalAnalysisResult(
                emotions = mapOf("SADNESS" to 0.7f),
                linguisticCategories = setOf("NEGATIVE", "IDIOM"),
                wordCount = 2
            ),
            "at wits end" to LexiconEntry(
                emotions = mapOf("FRUSTRATION" to 0.8f, "ANGER" to 0.3f),
                linguisticCategories = setOf("NEGATIVE", "IDIOM"),
                wordCount = 3
            ),

            // Anxiety expressions
            "on pins needles" to LexicalAnalysisResult(
                emotions = mapOf("ANXIETY" to 0.8f, "FEAR" to 0.3f),
                linguisticCategories = setOf("NEGATIVE", "IDIOM"),
                wordCount = 3
            ),
            "biting nails" to LexicalAnalysisResult(
                emotions = mapOf("ANXIETY" to 0.7f),
                linguisticCategories = setOf("NEGATIVE", "IDIOM"),
                wordCount = 2
            ),

            // Anger expressions
            "seeing red" to LexicalAnalysisResult(
                emotions = mapOf("ANGER" to 0.9f),
                linguisticCategories = setOf("NEGATIVE", "IDIOM"),
                wordCount = 2
            ),
            "hot under collar" to LexicalAnalysisResult(
                emotions = mapOf("ANGER" to 0.8f),
                linguisticCategories = setOf("NEGATIVE", "IDIOM"),
                wordCount = 3
            )
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

/**
 * Result of lexical analysis for a word or phrase
 */
data class LexicalAnalysisResult(
    val emotions: Map<String, Float>,
    val linguisticCategories: Set<String>,
    val wordCount: Int
)

/**
 * Entry in the emotion lexicon
 */
data class LexiconEntry(
    val emotions: Map<String, Float>,
    val linguisticCategories: Set<String>,
    val wordCount: Int = 1
)

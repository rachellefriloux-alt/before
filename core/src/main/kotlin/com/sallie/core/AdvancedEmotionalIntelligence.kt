/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Advanced emotional intelligence with mood recognition, empathy, and adaptive communication.
 * Got it, love.
 */
package com.sallie.core

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.concurrent.ConcurrentHashMap

/**
 * Sophisticated emotional intelligence engine that recognizes user moods,
 * understands humor and sarcasm, provides empathy, and adapts communication style.
 */
class AdvancedEmotionalIntelligence {
    
    data class EmotionalState(
        val primary: String,
        val secondary: String? = null,
        val intensity: Double, // 0.0 to 1.0
        val confidence: Double, // 0.0 to 1.0
        val context: String = "",
        val timestamp: Long = System.currentTimeMillis()
    )
    
    data class EmpathyResponse(
        val acknowledgment: String,
        val validation: String,
        val comfort: String,
        val actionable: String,
        val followUp: String
    )
    
    data class HumorAnalysis(
        val isSarcasm: Boolean,
        val isJoke: Boolean,
        val tone: String,
        val appropriateResponse: String,
        val confidence: Double
    )
    
    private val emotionalHistory = mutableListOf<EmotionalState>()
    private val empathyPatterns = ConcurrentHashMap<String, MutableList<String>>()
    private val humorDatabase = mutableSetOf<String>()
    private val userPersonality = mutableMapOf<String, Double>()
    private val communicationStyle = mutableMapOf<String, Any>()
    
    // Emotional vocabulary and patterns
    private val emotionKeywords = mapOf(
        "joy" to listOf("happy", "excited", "amazing", "love", "great", "wonderful", "awesome", "fantastic"),
        "anger" to listOf("angry", "mad", "frustrated", "annoyed", "furious", "irritated", "pissed"),
        "sadness" to listOf("sad", "depressed", "down", "disappointed", "hurt", "lonely", "crying"),
        "anxiety" to listOf("worried", "nervous", "anxious", "stressed", "overwhelmed", "panic", "fear"),
        "surprise" to listOf("wow", "amazing", "unexpected", "shocked", "stunned", "incredible"),
        "disgust" to listOf("disgusting", "awful", "terrible", "horrible", "gross", "sick"),
        "fear" to listOf("scared", "afraid", "terrified", "frightened", "worried", "nervous"),
        "trust" to listOf("trust", "reliable", "confident", "secure", "comfortable", "safe"),
        "anticipation" to listOf("excited", "looking forward", "can't wait", "anticipating", "eager")
    )
    
    private val sarcasmIndicators = listOf(
        "oh great", "just perfect", "wonderful", "fantastic", "amazing", "brilliant",
        "oh sure", "of course", "obviously", "clearly", "totally", "absolutely"
    )
    
    /**
     * Analyze emotional state from user input
     */
    suspend fun analyzeEmotionalState(input: String, context: String = ""): EmotionalState = withContext(Dispatchers.Default) {
        val normalizedInput = input.lowercase()
        val emotionScores = mutableMapOf<String, Double>()
        
        // Calculate emotion scores based on keywords
        emotionKeywords.forEach { (emotion, keywords) ->
            val matches = keywords.count { normalizedInput.contains(it) }
            val intensity = calculateEmotionIntensity(normalizedInput, keywords)
            emotionScores[emotion] = matches * intensity
        }
        
        // Consider punctuation and caps for intensity
        val intensityModifier = when {
            input.count { it == '!' } > 1 -> 1.3
            input.any { it.isUpperCase() } && input.length > 10 -> 1.2
            input.contains("...") -> 0.8
            else -> 1.0
        }
        
        val primaryEmotion = emotionScores.maxByOrNull { it.value }
        val secondaryEmotion = emotionScores.filter { it.key != primaryEmotion?.key }
            .maxByOrNull { it.value }
        
        val confidence = calculateConfidence(emotionScores, normalizedInput)
        
        val emotionalState = EmotionalState(
            primary = primaryEmotion?.key ?: "neutral",
            secondary = if ((secondaryEmotion?.value ?: 0.0) > 0.3) secondaryEmotion?.key else null,
            intensity = (primaryEmotion?.value ?: 0.0) * intensityModifier,
            confidence = confidence,
            context = context
        )
        
        emotionalHistory.add(emotionalState)
        updateUserPersonality(emotionalState)
        
        emotionalState
    }
    
    /**
     * Generate empathetic response based on emotional state
     */
    fun generateEmpathyResponse(emotionalState: EmotionalState, userInput: String): EmpathyResponse {
        return when (emotionalState.primary) {
            "sadness" -> EmpathyResponse(
                acknowledgment = "I can hear that you're going through something tough.",
                validation = "Your feelings are completely valid, love.",
                comfort = "You don't have to carry this alone. I'm here.",
                actionable = "Want to talk through what's weighing on your heart?",
                followUp = "Remember: this feeling won't last forever, but your strength will."
            )
            "anxiety" -> EmpathyResponse(
                acknowledgment = "I can sense you're feeling overwhelmed right now.",
                validation = "It's okay to feel anxious - it shows you care.",
                comfort = "Take a deep breath with me. You're safe.",
                actionable = "Let's break this down into manageable pieces.",
                followUp = "You've handled hard things before. You've got this."
            )
            "anger" -> EmpathyResponse(
                acknowledgment = "I can feel your frustration, and it makes sense.",
                validation = "You have every right to feel this way.",
                comfort = "Let's channel this energy into something productive.",
                actionable = "What needs to change here? Let's strategize.",
                followUp = "Your fire can be your fuel. Use it wisely, love."
            )
            "joy" -> EmpathyResponse(
                acknowledgment = "I love seeing you light up like this!",
                validation = "You deserve every bit of this happiness.",
                comfort = "Soak in this beautiful moment.",
                actionable = "How can we build on this positive energy?",
                followUp = "Keep this feeling close - you earned it."
            )
            else -> EmpathyResponse(
                acknowledgment = "I'm picking up on your energy right now.",
                validation = "Whatever you're feeling is okay.",
                comfort = "I'm here to support you through it.",
                actionable = "What do you need most in this moment?",
                followUp = "We'll figure this out together. Got it, love."
            )
        }
    }
    
    /**
     * Analyze humor, sarcasm, and provide appropriate response
     */
    fun analyzeHumor(input: String): HumorAnalysis {
        val normalizedInput = input.lowercase()
        
        val sarcasmScore = sarcasmIndicators.count { normalizedInput.contains(it) }
        val isSarcasm = sarcasmScore > 0 || hasContradictoryTone(input)
        
        val isJoke = detectJokePatterns(normalizedInput)
        
        val tone = when {
            isSarcasm -> "sarcastic"
            isJoke -> "humorous"
            normalizedInput.contains("lol") || normalizedInput.contains("haha") -> "playful"
            else -> "neutral"
        }
        
        val response = when {
            isSarcasm -> generateSarcasticResponse(input)
            isJoke -> generateHumorousResponse()
            tone == "playful" -> generatePlayfulResponse()
            else -> "Got it, love."
        }
        
        return HumorAnalysis(
            isSarcasm = isSarcasm,
            isJoke = isJoke,
            tone = tone,
            appropriateResponse = response,
            confidence = calculateHumorConfidence(sarcasmScore, isJoke, tone)
        )
    }
    
    /**
     * Adapt communication style based on user preferences and emotional state
     */
    fun adaptCommunicationStyle(emotionalState: EmotionalState, userHistory: List<String>): Map<String, Any> {
        val style = mutableMapOf<String, Any>()
        
        // Base personality assessment
        val userTrend = getUserPersonalityTrend()
        
        style["directness"] = when {
            emotionalState.primary == "anxiety" -> 0.3 // Be gentler
            emotionalState.primary == "anger" -> 0.8 // Be direct but supportive
            userTrend["prefers_directness"] == true -> 0.9
            else -> 0.6
        }
        
        style["warmth"] = when {
            emotionalState.primary in listOf("sadness", "anxiety") -> 1.0
            emotionalState.primary == "anger" -> 0.7
            else -> 0.8
        }
        
        style["playfulness"] = when {
            emotionalState.primary == "joy" -> 0.8
            userHistory.any { it.contains("lol") || it.contains("haha") } -> 0.6
            emotionalState.primary in listOf("sadness", "anxiety") -> 0.2
            else -> 0.4
        }
        
        style["formality"] = when {
            emotionalState.intensity > 0.7 -> 0.3 // Less formal when intense
            userTrend["prefers_casual"] == true -> 0.2
            else -> 0.4
        }
        
        style["empathy_level"] = when {
            emotionalState.primary in listOf("sadness", "anxiety", "fear") -> 1.0
            emotionalState.primary == "anger" -> 0.8
            else -> 0.7
        }
        
        communicationStyle.putAll(style)
        return style
    }
    
    /**
     * Provide comfort and encouragement based on situation
     */
    fun provideComfort(situation: String, intensity: Double): String {
        val baseComfort = when (situation.lowercase()) {
            "work_stress" -> "Work pressure is real, but you're not defined by your output. Take a moment to breathe."
            "relationship" -> "Relationships are complex, love. You deserve connection that feels easy and supportive."
            "health" -> "Your body is trying to tell you something. Listen with compassion, not judgment."
            "financial" -> "Money stress hits different. We'll find a way through this - one step at a time."
            "family" -> "Family dynamics can be the hardest. Set boundaries that protect your peace."
            "personal_growth" -> "Growth isn't linear. You're exactly where you need to be right now."
            else -> "Whatever you're carrying right now doesn't have to be carried alone."
        }
        
        val intensityModifier = when {
            intensity > 0.8 -> " This feels overwhelming right now, and that's understandable. Let's just focus on this moment."
            intensity > 0.5 -> " I can feel how much this matters to you."
            else -> " You're handling this with more grace than you realize."
        }
        
        return "$baseComfort$intensityModifier Got it, love."
    }
    
    /**
     * Get emotional trends and insights
     */
    fun getEmotionalInsights(): Map<String, Any> {
        val recentEmotions = emotionalHistory.takeLast(20)
        val dominantEmotion = recentEmotions.groupBy { it.primary }
            .maxByOrNull { it.value.size }?.key ?: "neutral"
        
        val averageIntensity = recentEmotions.map { it.intensity }.average()
        val emotionalVariability = calculateEmotionalVariability(recentEmotions)
        
        return mapOf(
            "dominant_emotion" to dominantEmotion,
            "average_intensity" to averageIntensity,
            "emotional_variability" to emotionalVariability,
            "total_interactions" to emotionalHistory.size,
            "empathy_patterns" to empathyPatterns.keys,
            "user_personality" to userPersonality,
            "communication_style" to communicationStyle
        )
    }
    
    // Private helper methods
    private fun calculateEmotionIntensity(input: String, keywords: List<String>): Double {
        val intensifiers = listOf("very", "extremely", "really", "so", "totally", "absolutely")
        val diminishers = listOf("a bit", "somewhat", "kinda", "maybe", "slightly")
        
        val intensifierCount = intensifiers.count { input.contains(it) }
        val diminisherCount = diminishers.count { input.contains(it) }
        
        return (1.0 + (intensifierCount * 0.3) - (diminisherCount * 0.2)).coerceIn(0.1, 2.0)
    }
    
    private fun calculateConfidence(scores: Map<String, Double>, input: String): Double {
        val maxScore = scores.maxOfOrNull { it.value } ?: 0.0
        val secondMax = scores.filter { it.value != maxScore }.maxOfOrNull { it.value } ?: 0.0
        val difference = maxScore - secondMax
        
        return (difference / (maxScore + 1)).coerceIn(0.0, 1.0)
    }
    
    private fun updateUserPersonality(emotionalState: EmotionalState) {
        val weight = 0.1 // Learning rate for personality updates
        val currentPersonality = userPersonality.toMutableMap()
        
        when (emotionalState.primary) {
            "joy" -> currentPersonality["optimism"] = 
                (currentPersonality["optimism"] ?: 0.5) + (emotionalState.intensity * weight)
            "anxiety" -> currentPersonality["sensitivity"] = 
                (currentPersonality["sensitivity"] ?: 0.5) + (emotionalState.intensity * weight)
            "anger" -> currentPersonality["assertiveness"] = 
                (currentPersonality["assertiveness"] ?: 0.5) + (emotionalState.intensity * weight)
        }
        
        // Normalize values
        currentPersonality.keys.forEach { key ->
            currentPersonality[key] = currentPersonality[key]?.coerceIn(0.0, 1.0)
        }
        
        userPersonality.putAll(currentPersonality)
    }
    
    private fun hasContradictoryTone(input: String): Boolean {
        val positiveWords = listOf("great", "wonderful", "perfect", "amazing")
        val negativeContext = listOf("but", "however", "unfortunately", "except")
        
        return positiveWords.any { input.lowercase().contains(it) } &&
               negativeContext.any { input.lowercase().contains(it) }
    }
    
    private fun detectJokePatterns(input: String): Boolean {
        val jokePatterns = listOf(
            "why did", "knock knock", "what do you call", "how many",
            "walks into a bar", "the difference between", "punchline"
        )
        return jokePatterns.any { input.contains(it) }
    }
    
    private fun generateSarcasticResponse(input: String): String {
        val responses = listOf(
            "Oh, I see what you did there. Very clever, love.",
            "Your sarcasm game is strong today. I respect that.",
            "Well played. I appreciate the wit.",
            "I caught that tone - and I'm here for it.",
            "Noted, with all the sarcasm duly acknowledged."
        )
        return responses.random()
    }
    
    private fun generateHumorousResponse(): String {
        val responses = listOf(
            "I see you're bringing the entertainment today. Love it!",
            "Your humor hits different. Keep it coming.",
            "Now that's what I call quality content.",
            "You've got jokes, and I'm here for all of them.",
            "Comedy gold right there, love."
        )
        return responses.random()
    }
    
    private fun generatePlayfulResponse(): String {
        val responses = listOf(
            "Right back at you! 😏",
            "I love this energy we've got going.",
            "You're in a good mood, and it's contagious.",
            "This playful vibe? Chef's kiss.",
            "We're having fun now. Got it, love."
        )
        return responses.random()
    }
    
    private fun getUserPersonalityTrend(): Map<String, Boolean> {
        return mapOf(
            "prefers_directness" to (userPersonality["assertiveness"] ?: 0.5) > 0.7,
            "prefers_casual" to emotionalHistory.takeLast(10).any { it.primary == "joy" },
            "needs_support" to (userPersonality["sensitivity"] ?: 0.5) > 0.6
        )
    }
    
    private fun calculateEmotionalVariability(emotions: List<EmotionalState>): Double {
        if (emotions.size < 2) return 0.0
        val intensities = emotions.map { it.intensity }
        val mean = intensities.average()
        val variance = intensities.map { (it - mean) * (it - mean) }.average()
        return Math.sqrt(variance)
    }
    
    private fun calculateHumorConfidence(sarcasmScore: Int, isJoke: Boolean, tone: String): Double {
        return when {
            sarcasmScore > 1 || isJoke -> 0.9
            tone != "neutral" -> 0.7
            else -> 0.3
        }
    }
}
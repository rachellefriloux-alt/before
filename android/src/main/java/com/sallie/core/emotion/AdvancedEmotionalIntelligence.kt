package com.sallie.core.emotion

import com.sallie.core.integration.UserAdaptationEngine
import com.sallie.core.integration.RelationshipTrackingSystem
import com.sallie.core.interaction.InteractionStyleAdapter
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

/**
 * AdvancedEmotionalIntelligence provides sophisticated emotional understanding and
 * response capabilities to enhance Sallie's interactions with the user.
 * 
 * This system detects emotional context from user messages, tracks emotional patterns
 * over time, and generates empathetic responses that align with Sallie's values
 * while building deeper connection with the user.
 */
class AdvancedEmotionalIntelligence(
    private val userAdaptationEngine: UserAdaptationEngine,
    private val relationshipSystem: RelationshipTrackingSystem,
    private val interactionStyleAdapter: InteractionStyleAdapter
) {
    // Current detected emotional state of the user
    private val _userEmotionalState = MutableStateFlow<EmotionalState>(EmotionalState.Neutral())
    val userEmotionalState: StateFlow<EmotionalState> = _userEmotionalState
    
    // Tracks emotional patterns over time
    private val emotionalPatterns = mutableListOf<EmotionalPattern>()
    
    // Recent emotional transitions to recognize patterns
    private val recentEmotions = mutableListOf<EmotionalState>()
    
    /**
     * Initialize emotional intelligence system with user profile data
     */
    fun initialize() {
        val userProfile = userAdaptationEngine.getUserProfile()
        
        // Use relationship history to establish baseline emotional patterns
        val interactions = relationshipSystem.getRecentInteractions(20)
        interactions.forEach { interaction ->
            if (interaction.metadata.containsKey("emotion")) {
                val emotion = parseEmotion(interaction.metadata["emotion"] as String)
                recentEmotions.add(emotion)
            }
        }
        
        // Analyze patterns from history
        if (recentEmotions.size >= 3) {
            identifyEmotionalPatterns()
        }
    }
    
    /**
     * Detects emotional context from a user message using multiple signals
     */
    fun detectEmotionalContext(
        message: String,
        metadata: Map<String, Any> = emptyMap()
    ): EmotionalContext {
        // Analyze message text for emotional signals
        val textEmotion = analyzeTextEmotions(message)
        
        // Consider metadata signals if available (typing speed, input force, etc)
        val metadataEmotion = analyzeMetadataEmotions(metadata)
        
        // Consider recent emotional context for continuity
        val recentEmotion = if (recentEmotions.isNotEmpty()) recentEmotions.last() else EmotionalState.Neutral()
        
        // Combine signals with weights
        val detectedEmotion = combineEmotionalSignals(textEmotion, metadataEmotion, recentEmotion)
        
        // Update current emotional state
        _userEmotionalState.value = detectedEmotion
        
        // Track this emotion in history
        recentEmotions.add(detectedEmotion)
        if (recentEmotions.size > MAX_EMOTION_HISTORY) {
            recentEmotions.removeFirst()
        }
        
        // Check for patterns after new data
        if (recentEmotions.size >= 3) {
            identifyEmotionalPatterns()
        }
        
        // Create full emotional context
        return EmotionalContext(
            primaryEmotion = detectedEmotion,
            intensity = calculateEmotionalIntensity(detectedEmotion, message, metadata),
            emotionalTrend = detectEmotionalTrend(),
            triggers = identifyEmotionalTriggers(message, detectedEmotion),
            needsAttention = needsEmotionalAttention(detectedEmotion)
        )
    }
    
    /**
     * Generate an emotionally appropriate response to the detected context
     */
    fun generateEmotionalResponse(
        baseMessage: String,
        emotionalContext: EmotionalContext
    ): String {
        // Get user adaptation profile to personalize response
        val userProfile = userAdaptationEngine.getUserProfile()
        
        // Choose appropriate emotional response strategy
        val responseStrategy = selectResponseStrategy(emotionalContext, userProfile)
        
        // Choose interaction style based on emotional context
        val interactionStyle = interactionStyleAdapter.getStyleForContext(
            InteractionStyleAdapter.InteractionContext(
                topic = "emotional_response",
                emotionalState = mapEmotionalState(emotionalContext.primaryEmotion),
                sensitivity = if (emotionalContext.needsAttention) 
                    InteractionStyleAdapter.Sensitivity.HIGH else 
                    InteractionStyleAdapter.Sensitivity.MEDIUM
            )
        )
        
        // Apply emotional response strategy
        val emotionallyEnhancedMessage = applyEmotionalResponseStrategy(
            baseMessage, 
            emotionalContext, 
            responseStrategy
        )
        
        // Apply interaction style
        return interactionStyleAdapter.applyStyle(emotionallyEnhancedMessage, interactionStyle)
    }
    
    /**
     * Records feedback about emotional response effectiveness
     */
    fun recordEmotionalResponseFeedback(
        emotionalContext: EmotionalContext,
        responseStrategy: EmotionalResponseStrategy,
        effective: Boolean
    ) {
        // Track effectiveness of response strategy
        if (effective) {
            // Add to effective strategies for this emotional state
            val emotionType = emotionalContext.primaryEmotion.emotionType
            val pattern = emotionalPatterns.find { it.emotionType == emotionType }
            if (pattern != null) {
                pattern.effectiveStrategies.add(responseStrategy)
            } else {
                emotionalPatterns.add(
                    EmotionalPattern(
                        emotionType = emotionType,
                        effectiveStrategies = mutableSetOf(responseStrategy)
                    )
                )
            }
        }
        
        // Record in relationship tracking
        relationshipSystem.recordInteraction(
            RelationshipTrackingSystem.Interaction(
                type = "emotional_response",
                context = emotionalContext.primaryEmotion.emotionType.name,
                outcome = effective,
                metadata = mapOf(
                    "emotion" to emotionalContext.primaryEmotion.toString(),
                    "strategy" to responseStrategy.name,
                    "intensity" to emotionalContext.intensity.toString()
                )
            )
        )
    }
    
    /**
     * Private helper methods
     */
    
    private fun analyzeTextEmotions(message: String): EmotionalState {
        // Simplified emotion detection from text
        val lowerMessage = message.lowercase()
        
        // Check for explicit emotion words
        return when {
            // Joy indicators
            lowerMessage.containsAny("happy", "excited", "great", "wonderful", "love", "joy", "yay", "😊", "😃", "❤️") -> {
                EmotionalState.Joy(determinePotency(message))
            }
            // Sadness indicators
            lowerMessage.containsAny("sad", "upset", "unhappy", "depressed", "disappointed", "miss", "lost", "😢", "😭", "😔") -> {
                EmotionalState.Sadness(determinePotency(message))
            }
            // Anger indicators
            lowerMessage.containsAny("angry", "mad", "furious", "annoyed", "frustrated", "hate", "😠", "😡", "🤬") -> {
                EmotionalState.Anger(determinePotency(message))
            }
            // Fear indicators
            lowerMessage.containsAny("scared", "afraid", "worried", "anxious", "nervous", "fear", "terrified", "😨", "😱", "😰") -> {
                EmotionalState.Fear(determinePotency(message))
            }
            // Surprise indicators
            lowerMessage.containsAny("wow", "surprised", "amazed", "shocked", "unexpected", "omg", "😲", "😮", "😯") -> {
                EmotionalState.Surprise(determinePotency(message))
            }
            // Confusion indicators
            lowerMessage.containsAny("confused", "don't understand", "what do you mean", "unclear", "huh", "🤔", "❓") -> {
                EmotionalState.Confusion(determinePotency(message))
            }
            // Gratitude indicators
            lowerMessage.containsAny("thank", "thanks", "grateful", "appreciate", "helped", "🙏") -> {
                EmotionalState.Gratitude(determinePotency(message))
            }
            // Curiosity indicators
            lowerMessage.containsAny("curious", "interested", "wonder", "how does", "tell me about", "?") -> {
                EmotionalState.Curiosity(determinePotency(message))
            }
            // Default to neutral
            else -> EmotionalState.Neutral()
        }
    }
    
    private fun analyzeMetadataEmotions(metadata: Map<String, Any>): EmotionalState {
        // Analyze additional metadata signals if available
        if (metadata.isEmpty()) {
            return EmotionalState.Neutral() // Default when no metadata
        }
        
        // Example metadata analysis (typing speed, input pressure, etc)
        val typingSpeed = metadata["typing_speed"] as? Float
        val inputPressure = metadata["input_pressure"] as? Float
        val deleteCount = metadata["delete_count"] as? Int
        
        // Infer emotional state from metadata
        return when {
            // Fast typing + high pressure might indicate excitement or anger
            typingSpeed != null && inputPressure != null && typingSpeed > 0.8f && inputPressure > 0.7f -> {
                // Differentiate between positive/negative with other signals
                if (metadata["positive_words"]?.toString()?.toBoolean() == true) {
                    EmotionalState.Joy(0.7f)
                } else {
                    EmotionalState.Anger(0.7f)
                }
            }
            // Slow typing with many deletes might indicate confusion or careful thought
            typingSpeed != null && deleteCount != null && typingSpeed < 0.4f && deleteCount > 5 -> {
                EmotionalState.Confusion(0.6f)
            }
            // Moderate speed with low pressure might indicate neutral or slight curiosity
            typingSpeed != null && inputPressure != null && typingSpeed.isBetween(0.4f, 0.7f) && inputPressure < 0.4f -> {
                EmotionalState.Curiosity(0.5f)
            }
            // Default
            else -> EmotionalState.Neutral()
        }
    }
    
    private fun combineEmotionalSignals(
        textEmotion: EmotionalState,
        metadataEmotion: EmotionalState,
        recentEmotion: EmotionalState
    ): EmotionalState {
        // Weights for different signals
        val TEXT_WEIGHT = 0.7f
        val METADATA_WEIGHT = 0.2f
        val RECENT_WEIGHT = 0.1f
        
        // If text emotion is strong, prioritize it
        if (textEmotion.potency > 0.7f && textEmotion !is EmotionalState.Neutral) {
            return textEmotion
        }
        
        // If text and metadata agree, strengthen that emotion
        if (textEmotion.emotionType == metadataEmotion.emotionType && 
            textEmotion !is EmotionalState.Neutral) {
            return textEmotion.withPotency((textEmotion.potency + metadataEmotion.potency) / 2 * 1.2f)
        }
        
        // If current emotion continues recent emotion, strengthen it
        if (textEmotion.emotionType == recentEmotion.emotionType && 
            textEmotion !is EmotionalState.Neutral) {
            return textEmotion.withPotency(
                minOf(1.0f, textEmotion.potency * 1.1f)
            )
        }
        
        // Otherwise, weight the signals
        val weightedEmotions = mapOf(
            textEmotion to TEXT_WEIGHT,
            metadataEmotion to METADATA_WEIGHT,
            recentEmotion to RECENT_WEIGHT
        )
        
        // Find highest weighted emotion
        return weightedEmotions.entries
            .filter { it.key !is EmotionalState.Neutral || weightedEmotions.size == 1 }
            .maxByOrNull { it.value }?.key ?: EmotionalState.Neutral()
    }
    
    private fun calculateEmotionalIntensity(
        emotion: EmotionalState,
        message: String,
        metadata: Map<String, Any>
    ): EmotionalIntensity {
        // Base intensity on emotion potency
        val basePotency = emotion.potency
        
        // Increase for indicators like exclamation marks, all caps, etc.
        val textIntensifiers = countOf(message, "!") * 0.1f +
                              (if (message == message.uppercase() && message.length > 5) 0.3f else 0.0f) +
                              countOf(message, "?") * 0.05f
        
        // Factor in repeated punctuation (!!!, ???)
        val repeatedPunctuation = Regex("[!?]{2,}").findAll(message).count() * 0.15f
        
        // Factor in emotional modifiers
        val emotionalModifiers = countWordsIn(
            message, 
            listOf("very", "really", "extremely", "absolutely", "completely", "totally")
        ) * 0.1f
        
        // Calculate final intensity
        val intensityValue = minOf(1.0f, basePotency + textIntensifiers + repeatedPunctuation + emotionalModifiers)
        
        return when {
            intensityValue < 0.3f -> EmotionalIntensity.LOW
            intensityValue < 0.7f -> EmotionalIntensity.MEDIUM
            else -> EmotionalIntensity.HIGH
        }
    }
    
    private fun detectEmotionalTrend(): EmotionalTrend {
        // Need at least 3 emotions to detect a trend
        if (recentEmotions.size < 3) return EmotionalTrend.STABLE
        
        val lastThreeEmotions = recentEmotions.takeLast(3)
        
        // Check for consistent emotion type (same emotion repeated)
        val sameEmotionType = lastThreeEmotions.distinctBy { it.emotionType }.size == 1
        if (sameEmotionType) {
            // Check if potency is increasing
            val potencies = lastThreeEmotions.map { it.potency }
            return when {
                potencies[2] > potencies[0] + 0.2f -> EmotionalTrend.INTENSIFYING
                potencies[2] < potencies[0] - 0.2f -> EmotionalTrend.DIMINISHING
                else -> EmotionalTrend.STABLE
            }
        }
        
        // Check for transition between emotion types
        val firstType = lastThreeEmotions.first().emotionType
        val lastType = lastThreeEmotions.last().emotionType
        
        return when {
            // Transition from negative to positive emotions
            (firstType in NEGATIVE_EMOTIONS && lastType in POSITIVE_EMOTIONS) -> 
                EmotionalTrend.IMPROVING
                
            // Transition from positive to negative emotions
            (firstType in POSITIVE_EMOTIONS && lastType in NEGATIVE_EMOTIONS) -> 
                EmotionalTrend.DETERIORATING
                
            // Neutral to any emotion
            (firstType == EmotionType.NEUTRAL && lastType != EmotionType.NEUTRAL) ->
                EmotionalTrend.EMERGING
                
            // Any emotion to neutral
            (firstType != EmotionType.NEUTRAL && lastType == EmotionType.NEUTRAL) ->
                EmotionalTrend.RESOLVING
                
            // Default
            else -> EmotionalTrend.FLUCTUATING
        }
    }
    
    private fun identifyEmotionalTriggers(
        message: String, 
        emotion: EmotionalState
    ): List<String> {
        val triggers = mutableListOf<String>()
        
        // Skip for neutral emotions
        if (emotion is EmotionalState.Neutral) {
            return triggers
        }
        
        // Topic-based triggers
        val topics = extractTopics(message)
        if (topics.isNotEmpty()) {
            triggers.addAll(topics)
        }
        
        // Check relationship history for similar emotional patterns
        val similarInteractions = relationshipSystem.getInteractionsByContext(emotion.emotionType.name, 5)
        similarInteractions.forEach { interaction ->
            interaction.metadata["trigger"]?.toString()?.let { previousTrigger ->
                if (!triggers.contains(previousTrigger)) {
                    triggers.add(previousTrigger)
                }
            }
        }
        
        return triggers.take(3) // Limit to top 3 triggers
    }
    
    private fun needsEmotionalAttention(emotion: EmotionalState): Boolean {
        // Strong negative emotions need attention
        if (emotion.emotionType in NEGATIVE_EMOTIONS && emotion.potency > 0.6f) {
            return true
        }
        
        // Consistent negative trend needs attention
        if (recentEmotions.size >= 3 &&
            recentEmotions.takeLast(3).all { it.emotionType in NEGATIVE_EMOTIONS }) {
            return true
        }
        
        // Sudden emotional shifts need attention
        if (recentEmotions.size >= 2) {
            val previous = recentEmotions[recentEmotions.size - 2]
            val current = recentEmotions.last()
            
            if (previous.emotionType in POSITIVE_EMOTIONS &&
                current.emotionType in NEGATIVE_EMOTIONS &&
                current.potency > 0.5f) {
                return true
            }
        }
        
        return false
    }
    
    private fun selectResponseStrategy(
        emotionalContext: EmotionalContext,
        userProfile: UserAdaptationEngine.UserProfile
    ): EmotionalResponseStrategy {
        val emotionType = emotionalContext.primaryEmotion.emotionType
        
        // Check if we have learned effective strategies for this emotion
        val pattern = emotionalPatterns.find { it.emotionType == emotionType }
        if (pattern != null && pattern.effectiveStrategies.isNotEmpty()) {
            return pattern.effectiveStrategies.random()
        }
        
        // Default strategies based on emotion type
        return when (emotionType) {
            EmotionType.JOY -> EmotionalResponseStrategy.CELEBRATION
            EmotionType.SADNESS -> {
                when (emotionalContext.intensity) {
                    EmotionalIntensity.LOW -> EmotionalResponseStrategy.GENTLE_ACKNOWLEDGMENT
                    EmotionalIntensity.MEDIUM -> EmotionalResponseStrategy.EMPATHETIC_LISTENING
                    EmotionalIntensity.HIGH -> EmotionalResponseStrategy.COMPASSIONATE_SUPPORT
                }
            }
            EmotionType.ANGER -> {
                when (emotionalContext.intensity) {
                    EmotionalIntensity.LOW -> EmotionalResponseStrategy.GENTLE_ACKNOWLEDGMENT
                    EmotionalIntensity.MEDIUM -> EmotionalResponseStrategy.CALM_REDIRECTION
                    EmotionalIntensity.HIGH -> EmotionalResponseStrategy.SPACE_AND_VALIDATION
                }
            }
            EmotionType.FEAR -> {
                when (emotionalContext.intensity) {
                    EmotionalIntensity.LOW -> EmotionalResponseStrategy.REASSURANCE
                    EmotionalIntensity.MEDIUM -> EmotionalResponseStrategy.SOLUTION_FOCUS
                    EmotionalIntensity.HIGH -> EmotionalResponseStrategy.COMPASSIONATE_SUPPORT
                }
            }
            EmotionType.SURPRISE -> EmotionalResponseStrategy.CURIOUS_EXPLORATION
            EmotionType.CONFUSION -> EmotionalResponseStrategy.CLARIFICATION
            EmotionType.GRATITUDE -> EmotionalResponseStrategy.RECIPROCATION
            EmotionType.CURIOSITY -> EmotionalResponseStrategy.CURIOUS_EXPLORATION
            EmotionType.NEUTRAL -> EmotionalResponseStrategy.MIRRORING
        }
    }
    
    private fun applyEmotionalResponseStrategy(
        baseMessage: String,
        emotionalContext: EmotionalContext,
        strategy: EmotionalResponseStrategy
    ): String {
        return when (strategy) {
            EmotionalResponseStrategy.CELEBRATION -> {
                enhanceWithCelebration(baseMessage)
            }
            EmotionalResponseStrategy.GENTLE_ACKNOWLEDGMENT -> {
                prependAcknowledgment(baseMessage, emotionalContext.primaryEmotion)
            }
            EmotionalResponseStrategy.EMPATHETIC_LISTENING -> {
                prependEmpathy(baseMessage, emotionalContext.primaryEmotion)
            }
            EmotionalResponseStrategy.COMPASSIONATE_SUPPORT -> {
                wrapWithCompassion(baseMessage, emotionalContext.primaryEmotion)
            }
            EmotionalResponseStrategy.CALM_REDIRECTION -> {
                prependCalmingMessage(baseMessage)
            }
            EmotionalResponseStrategy.SPACE_AND_VALIDATION -> {
                prependValidation(baseMessage, emotionalContext.primaryEmotion)
            }
            EmotionalResponseStrategy.REASSURANCE -> {
                prependReassurance(baseMessage)
            }
            EmotionalResponseStrategy.SOLUTION_FOCUS -> {
                baseMessage // Solution is already in the base message
            }
            EmotionalResponseStrategy.CURIOUS_EXPLORATION -> {
                enhanceWithCuriosity(baseMessage)
            }
            EmotionalResponseStrategy.CLARIFICATION -> {
                prependClarification(baseMessage)
            }
            EmotionalResponseStrategy.RECIPROCATION -> {
                prependGratitude(baseMessage)
            }
            EmotionalResponseStrategy.MIRRORING -> {
                baseMessage // Keep neutral
            }
        }
    }
    
    private fun enhanceWithCelebration(message: String): String {
        val celebratoryPrefixes = listOf(
            "Wonderful! ",
            "That's fantastic! ",
            "I'm so happy to hear that! ",
            "Amazing! "
        )
        return celebratoryPrefixes.random() + message
    }
    
    private fun prependAcknowledgment(message: String, emotion: EmotionalState): String {
        val acknowledgments = when (emotion.emotionType) {
            EmotionType.SADNESS -> listOf(
                "I understand that you're feeling down. ",
                "I see that you're feeling sad. ",
                "I can tell this is difficult. "
            )
            EmotionType.ANGER -> listOf(
                "I understand you're frustrated. ",
                "I can see why this would be annoying. ",
                "That does sound frustrating. "
            )
            EmotionType.FEAR -> listOf(
                "I understand your concern. ",
                "I see why you might be worried. ",
                "Those concerns make sense. "
            )
            else -> listOf(
                "I understand how you feel. ",
                "I see where you're coming from. ",
                "That makes sense. "
            )
        }
        return acknowledgments.random() + message
    }
    
    private fun prependEmpathy(message: String, emotion: EmotionalState): String {
        val empathyMessages = when (emotion.emotionType) {
            EmotionType.SADNESS -> listOf(
                "I'm really sorry you're going through this. It's okay to feel sad sometimes. ",
                "That sounds really difficult, and I'm here with you through it. ",
                "I'm here for you during this tough time. "
            )
            EmotionType.ANGER -> listOf(
                "I understand why you'd feel frustrated about this. Anyone would be. ",
                "That situation would make anyone upset. I'm listening. ",
                "Your feelings are completely valid. I'm here to help work through this. "
            )
            EmotionType.FEAR -> listOf(
                "It's natural to feel anxious about this. I'm here to help however I can. ",
                "Those worries make perfect sense. Let's think about this together. ",
                "I understand why you're concerned, and we'll figure this out together. "
            )
            else -> listOf(
                "I'm here for you and I understand. ",
                "I really appreciate you sharing how you feel. ",
                "Thank you for trusting me with your feelings. "
            )
        }
        return empathyMessages.random() + "\n\n" + message
    }
    
    private fun wrapWithCompassion(message: String, emotion: EmotionalState): String {
        val prefix = when (emotion.emotionType) {
            EmotionType.SADNESS -> "I'm truly sorry you're feeling this way. Your feelings are important and valid. "
            EmotionType.FEAR -> "I understand this is causing you worry. It's okay to feel this way. "
            EmotionType.ANGER -> "I can see this is really frustrating for you, and you have every right to feel that way. "
            else -> "I'm here for you through whatever you're feeling. "
        }
        
        val suffix = "\n\nRemember that I'm here for you anytime you want to talk more about this."
        
        return prefix + message + suffix
    }
    
    private fun prependCalmingMessage(message: String): String {
        val calmingMessages = listOf(
            "Let's take a step back and look at this together. ",
            "I understand this is frustrating. Let's approach this calmly. ",
            "I hear your concern. Let's think about this clearly. "
        )
        return calmingMessages.random() + message
    }
    
    private fun prependValidation(message: String, emotion: EmotionalState): String {
        val validationMessages = when (emotion.emotionType) {
            EmotionType.ANGER -> listOf(
                "Your frustration is completely understandable. Anyone would feel this way in your situation. ",
                "You have every right to feel upset about this. Your feelings are valid. ",
                "I completely understand why this would make you angry. I would feel the same way. "
            )
            else -> listOf(
                "What you're feeling makes perfect sense. ",
                "Your reaction is completely valid. ",
                "I understand why you feel this way. "
            )
        }
        return validationMessages.random() + "\n\n" + message
    }
    
    private fun prependReassurance(message: String): String {
        val reassuranceMessages = listOf(
            "Everything's going to be okay. ",
            "We can figure this out together. ",
            "I'm here with you, and we'll get through this. "
        )
        return reassuranceMessages.random() + message
    }
    
    private fun enhanceWithCuriosity(message: String): String {
        val curiosityEnhancers = listOf(
            "That's an interesting point! ",
            "What a fascinating question. ",
            "I'm curious about that too! "
        )
        return curiosityEnhancers.random() + message
    }
    
    private fun prependClarification(message: String): String {
        val clarificationMessages = listOf(
            "Let me explain this more clearly. ",
            "I understand that might be confusing. Here's what I mean: ",
            "To clarify: "
        )
        return clarificationMessages.random() + message
    }
    
    private fun prependGratitude(message: String): String {
        val gratitudeMessages = listOf(
            "Thank you so much! I appreciate your kind words. ",
            "I'm so glad I could help! ",
            "It means a lot to hear that. Thank you! "
        )
        return gratitudeMessages.random() + message
    }
    
    private fun identifyEmotionalPatterns() {
        // Need sufficient history to detect patterns
        if (recentEmotions.size < MIN_EMOTIONS_FOR_PATTERN) return
        
        // Find frequent emotional transitions
        val transitions = mutableMapOf<Pair<EmotionType, EmotionType>, Int>()
        for (i in 1 until recentEmotions.size) {
            val from = recentEmotions[i-1].emotionType
            val to = recentEmotions[i].emotionType
            val transition = Pair(from, to)
            transitions[transition] = (transitions[transition] ?: 0) + 1
        }
        
        // Find most common emotion
        val emotionCounts = recentEmotions
            .groupBy { it.emotionType }
            .mapValues { it.value.size }
        
        val mostCommonEmotion = emotionCounts.maxByOrNull { it.value }?.key
        if (mostCommonEmotion != null && mostCommonEmotion != EmotionType.NEUTRAL) {
            // Ensure we have a pattern entry for most common emotion
            if (emotionalPatterns.none { it.emotionType == mostCommonEmotion }) {
                emotionalPatterns.add(
                    EmotionalPattern(
                        emotionType = mostCommonEmotion,
                        effectiveStrategies = mutableSetOf()
                    )
                )
            }
        }
        
        // Find most common transitions
        val commonTransitions = transitions.entries
            .sortedByDescending { it.value }
            .take(3)
            .map { it.key }
            
        // Store patterns for future reference
        commonTransitions.forEach { (from, to) ->
            val existingPattern = emotionalPatterns.find { it.emotionType == from }
            if (existingPattern != null) {
                existingPattern.commonTransitions.add(to)
            } else {
                emotionalPatterns.add(
                    EmotionalPattern(
                        emotionType = from,
                        effectiveStrategies = mutableSetOf(),
                        commonTransitions = mutableListOf(to)
                    )
                )
            }
        }
    }
    
    private fun extractTopics(message: String): List<String> {
        // Simple keyword-based topic extraction
        val topics = mutableSetOf<String>()
        
        // Check for common topic keywords
        TOPIC_KEYWORDS.forEach { (topic, keywords) ->
            if (keywords.any { keyword -> message.lowercase().contains(keyword) }) {
                topics.add(topic)
            }
        }
        
        return topics.toList()
    }
    
    private fun parseEmotion(emotionString: String): EmotionalState {
        // Parse stored emotion string back into EmotionalState
        val parts = emotionString.split(":")
        val type = parts[0]
        val potency = if (parts.size > 1) parts[1].toFloatOrNull() ?: 0.5f else 0.5f
        
        return when (type) {
            "Joy" -> EmotionalState.Joy(potency)
            "Sadness" -> EmotionalState.Sadness(potency)
            "Anger" -> EmotionalState.Anger(potency)
            "Fear" -> EmotionalState.Fear(potency)
            "Surprise" -> EmotionalState.Surprise(potency)
            "Confusion" -> EmotionalState.Confusion(potency)
            "Gratitude" -> EmotionalState.Gratitude(potency)
            "Curiosity" -> EmotionalState.Curiosity(potency)
            else -> EmotionalState.Neutral()
        }
    }
    
    private fun mapEmotionalState(emotion: EmotionalState): InteractionStyleAdapter.EmotionalState {
        return when (emotion.emotionType) {
            EmotionType.JOY, EmotionType.GRATITUDE -> 
                InteractionStyleAdapter.EmotionalState.POSITIVE
            EmotionType.SADNESS, EmotionType.ANGER, EmotionType.FEAR -> 
                InteractionStyleAdapter.EmotionalState.NEGATIVE
            else -> 
                InteractionStyleAdapter.EmotionalState.NEUTRAL
        }
    }
    
    private fun determinePotency(message: String): Float {
        // Analyze text for emotional intensity markers
        var potency = 0.5f // Default potency
        
        // Increase for exclamation marks
        potency += countOf(message, "!") * 0.1f
        
        // Increase for all caps
        if (message == message.uppercase() && message.length > 3) {
            potency += 0.2f
        }
        
        // Increase for intensity modifiers
        val intensifiers = listOf("very", "really", "so", "extremely", "absolutely")
        intensifiers.forEach { word ->
            if (message.lowercase().contains(" $word ")) {
                potency += 0.1f
            }
        }
        
        // Increase for repeated letters (e.g., "sooooo good")
        if (Regex("[a-zA-Z]{3}\\1{2,}").containsMatchIn(message)) {
            potency += 0.15f
        }
        
        // Ensure potency stays in 0-1 range
        return minOf(1.0f, potency)
    }
    
    private fun countOf(text: String, substring: String): Int {
        var count = 0
        var index = 0
        while (index != -1) {
            index = text.indexOf(substring, index)
            if (index != -1) {
                count++
                index += substring.length
            }
        }
        return count
    }
    
    private fun countWordsIn(text: String, words: List<String>): Int {
        val lowerText = text.lowercase()
        return words.count { word -> lowerText.contains(" $word ") }
    }
    
    private fun String.containsAny(vararg keywords: String): Boolean {
        return keywords.any { this.contains(it) }
    }
    
    private fun Float.isBetween(min: Float, max: Float): Boolean {
        return this in min..max
    }
    
    companion object {
        // Constants
        private const val MAX_EMOTION_HISTORY = 10
        private const val MIN_EMOTIONS_FOR_PATTERN = 5
        
        // Emotion categories
        private val POSITIVE_EMOTIONS = setOf(
            EmotionType.JOY, 
            EmotionType.GRATITUDE,
            EmotionType.CURIOSITY
        )
        
        private val NEGATIVE_EMOTIONS = setOf(
            EmotionType.SADNESS, 
            EmotionType.ANGER, 
            EmotionType.FEAR
        )
        
        // Topic keywords for trigger identification
        private val TOPIC_KEYWORDS = mapOf(
            "work" to listOf("job", "career", "workplace", "boss", "coworker", "office"),
            "family" to listOf("mom", "dad", "parent", "child", "sister", "brother", "family"),
            "relationship" to listOf("boyfriend", "girlfriend", "partner", "marriage", "divorce", "date"),
            "health" to listOf("sick", "doctor", "health", "hospital", "pain", "symptom", "illness"),
            "finance" to listOf("money", "debt", "pay", "afford", "cost", "expense", "budget"),
            "education" to listOf("school", "study", "exam", "college", "university", "course", "homework"),
            "technology" to listOf("computer", "phone", "app", "software", "internet", "website", "tech")
        )
    }
    
    /**
     * Data classes and enums for emotional intelligence
     */
    
    enum class EmotionType {
        JOY, SADNESS, ANGER, FEAR, SURPRISE, CONFUSION, GRATITUDE, CURIOSITY, NEUTRAL
    }
    
    enum class EmotionalIntensity {
        LOW, MEDIUM, HIGH
    }
    
    enum class EmotionalTrend {
        STABLE, INTENSIFYING, DIMINISHING, IMPROVING, DETERIORATING, FLUCTUATING, EMERGING, RESOLVING
    }
    
    enum class EmotionalResponseStrategy {
        CELEBRATION,
        GENTLE_ACKNOWLEDGMENT,
        EMPATHETIC_LISTENING,
        COMPASSIONATE_SUPPORT,
        CALM_REDIRECTION,
        SPACE_AND_VALIDATION,
        REASSURANCE,
        SOLUTION_FOCUS,
        CURIOUS_EXPLORATION,
        CLARIFICATION,
        RECIPROCATION,
        MIRRORING
    }
    
    sealed class EmotionalState {
        abstract val emotionType: EmotionType
        abstract val potency: Float
        
        abstract fun withPotency(newPotency: Float): EmotionalState
        
        data class Joy(override val potency: Float = 0.5f) : EmotionalState() {
            override val emotionType = EmotionType.JOY
            override fun withPotency(newPotency: Float) = Joy(minOf(1.0f, maxOf(0.0f, newPotency)))
            override fun toString() = "Joy:$potency"
        }
        
        data class Sadness(override val potency: Float = 0.5f) : EmotionalState() {
            override val emotionType = EmotionType.SADNESS
            override fun withPotency(newPotency: Float) = Sadness(minOf(1.0f, maxOf(0.0f, newPotency)))
            override fun toString() = "Sadness:$potency"
        }
        
        data class Anger(override val potency: Float = 0.5f) : EmotionalState() {
            override val emotionType = EmotionType.ANGER
            override fun withPotency(newPotency: Float) = Anger(minOf(1.0f, maxOf(0.0f, newPotency)))
            override fun toString() = "Anger:$potency"
        }
        
        data class Fear(override val potency: Float = 0.5f) : EmotionalState() {
            override val emotionType = EmotionType.FEAR
            override fun withPotency(newPotency: Float) = Fear(minOf(1.0f, maxOf(0.0f, newPotency)))
            override fun toString() = "Fear:$potency"
        }
        
        data class Surprise(override val potency: Float = 0.5f) : EmotionalState() {
            override val emotionType = EmotionType.SURPRISE
            override fun withPotency(newPotency: Float) = Surprise(minOf(1.0f, maxOf(0.0f, newPotency)))
            override fun toString() = "Surprise:$potency"
        }
        
        data class Confusion(override val potency: Float = 0.5f) : EmotionalState() {
            override val emotionType = EmotionType.CONFUSION
            override fun withPotency(newPotency: Float) = Confusion(minOf(1.0f, maxOf(0.0f, newPotency)))
            override fun toString() = "Confusion:$potency"
        }
        
        data class Gratitude(override val potency: Float = 0.5f) : EmotionalState() {
            override val emotionType = EmotionType.GRATITUDE
            override fun withPotency(newPotency: Float) = Gratitude(minOf(1.0f, maxOf(0.0f, newPotency)))
            override fun toString() = "Gratitude:$potency"
        }
        
        data class Curiosity(override val potency: Float = 0.5f) : EmotionalState() {
            override val emotionType = EmotionType.CURIOSITY
            override fun withPotency(newPotency: Float) = Curiosity(minOf(1.0f, maxOf(0.0f, newPotency)))
            override fun toString() = "Curiosity:$potency"
        }
        
        class Neutral : EmotionalState() {
            override val emotionType = EmotionType.NEUTRAL
            override val potency = 0.0f
            override fun withPotency(newPotency: Float) = this
            override fun toString() = "Neutral"
            override fun equals(other: Any?): Boolean = other is Neutral
            override fun hashCode(): Int = emotionType.hashCode()
        }
    }
    
    data class EmotionalContext(
        val primaryEmotion: EmotionalState,
        val intensity: EmotionalIntensity,
        val emotionalTrend: EmotionalTrend,
        val triggers: List<String>,
        val needsAttention: Boolean
    )
    
    data class EmotionalPattern(
        val emotionType: EmotionType,
        val effectiveStrategies: MutableSet<EmotionalResponseStrategy> = mutableSetOf(),
        val commonTransitions: MutableList<EmotionType> = mutableListOf()
    )
}

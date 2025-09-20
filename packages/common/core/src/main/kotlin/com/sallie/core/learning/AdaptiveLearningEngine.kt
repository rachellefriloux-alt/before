/*
 * Sallie 2.0 Module
 * Persona: Tough love meets soul care.
 * Function: Adaptive learning system that evolves with the user.
 * Got it, love.
 */
package com.sallie.core.learning

import com.sallie.core.memory.HierarchicalMemorySystem
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.serialization.Serializable
import java.time.LocalDateTime
import java.util.UUID

/**
 * AdaptiveLearningEngine implements Sallie 2.0's dynamic learning capabilities.
 * It identifies patterns in user behavior, preferences, and interactions to
 * continuously improve personalization and response quality.
 *
 * This system connects directly with the Hierarchical Memory System to store
 * and retrieve learned insights.
 */
class AdaptiveLearningEngine(
    private val memorySystem: HierarchicalMemorySystem? = null,
    private val learningConfig: LearningConfiguration = LearningConfiguration()
) {
    // Learning state and metrics tracking
    private val _learningState = MutableStateFlow<LearningState>(LearningState())
    val learningState = _learningState.asStateFlow()

    // Learning insights repository
    private val _insights = MutableStateFlow<List<UserInsight>>(emptyList())
    val insights = _insights.asStateFlow()

    // User preference models
    private val _preferenceModels = MutableStateFlow<Map<String, UserPreferenceModel>>(emptyMap())
    val preferenceModels = _preferenceModels.asStateFlow()

    /**
     * Configuration for the adaptive learning engine
     */
    @Serializable
    data class LearningConfiguration(
        val learningRate: Float = 0.1f,
        val minInteractionsForInsight: Int = 5,
        val insightConfidenceThreshold: Float = 0.7f,
        val maxInsightsPerCategory: Int = 50,
        val preferenceDecayRate: Float = 0.01f,
        val experimentationRate: Float = 0.05f,
        val enabledCategories: Set<LearningCategory> = LearningCategory.values().toSet()
    )

    /**
     * Categories of learning the engine can focus on
     */
    enum class LearningCategory {
        COMMUNICATION_STYLE,
        TONE_PREFERENCES,
        SUBJECT_INTERESTS,
        DAILY_PATTERNS,
        SOCIAL_CONTEXT,
        EMOTIONAL_TRIGGERS,
        DECISION_MAKING,
        TIME_MANAGEMENT,
        ACTIVITY_PREFERENCES,
        CONVERSATION_FLOW,
        EXPERT_KNOWLEDGE_AREAS,
        CREATIVE_EXPRESSION,
        HEALTH_WELLNESS
    }

    /**
     * Confidence levels for insights
     */
    enum class ConfidenceLevel {
        HYPOTHESIS,  // Initial guess with minimal evidence
        EMERGING,    // Some supporting evidence
        PROBABLE,    // Strong but not definitive evidence
        CONFIRMED,   // Well-established through multiple observations
        VERIFIED     // Explicitly confirmed by user
    }

    /**
     * State of the learning engine
     */
    @Serializable
    data class LearningState(
        val totalInteractionsObserved: Int = 0,
        val totalInsightsGenerated: Int = 0,
        val categoryCoverage: Map<LearningCategory, Float> = emptyMap(),
        val lastUpdateTimestamp: Long = System.currentTimeMillis(),
        val activeExperiments: List<LearningExperiment> = emptyList()
    )

    /**
     * An insight discovered about the user
     */
    @Serializable
    data class UserInsight(
        val id: String = UUID.randomUUID().toString(),
        val category: LearningCategory,
        val description: String,
        val evidence: MutableList<String> = mutableListOf(),
        var confidence: Float = 0.0f,
        var confidenceLevel: ConfidenceLevel = ConfidenceLevel.HYPOTHESIS,
        val createdAt: Long = System.currentTimeMillis(),
        var lastUpdatedAt: Long = System.currentTimeMillis(),
        var timesReinforced: Int = 0,
        var timesContradicted: Int = 0,
        var isActive: Boolean = true,
        val metaTags: MutableSet<String> = mutableSetOf()
    )

    /**
     * Model for a specific user preference category
     */
    @Serializable
    data class UserPreferenceModel(
        val category: String,
        val preferences: MutableMap<String, Float> = mutableMapOf(), // option -> strength (0.0-1.0)
        val createdAt: Long = System.currentTimeMillis(),
        var lastUpdatedAt: Long = System.currentTimeMillis(),
        var updateCount: Int = 0
    )

    /**
     * Learning experiment to validate hypotheses
     */
    @Serializable
    data class LearningExperiment(
        val id: String = UUID.randomUUID().toString(),
        val hypothesis: String,
        val targetInsightId: String? = null,
        val category: LearningCategory,
        val variants: List<String>,
        val startedAt: Long = System.currentTimeMillis(),
        var completedAt: Long? = null,
        var results: Map<String, Float> = emptyMap(), // variant -> success rate
        var status: ExperimentStatus = ExperimentStatus.ACTIVE,
        var conclusionNotes: String = ""
    )

    /**
     * Status of a learning experiment
     */
    enum class ExperimentStatus {
        ACTIVE,
        COMPLETED_CONFIRMED,
        COMPLETED_REJECTED,
        INCONCLUSIVE,
        ABORTED
    }

    /**
     * User interaction record for learning
     */
    @Serializable
    data class UserInteraction(
        val id: String = UUID.randomUUID().toString(),
        val timestamp: Long = System.currentTimeMillis(),
        val type: InteractionType,
        val content: String = "",
        val metadata: Map<String, String> = emptyMap(),
        val contextualFactors: Map<String, String> = emptyMap(),
        val userSentiment: Float? = null, // -1.0 to 1.0
        val explicitFeedback: ExplicitFeedback? = null
    )

    /**
     * Types of user interactions
     */
    enum class InteractionType {
        MESSAGE_RECEIVED,
        MESSAGE_SENT,
        FEATURE_USED,
        SETTING_CHANGED,
        EXPLICIT_FEEDBACK,
        ACTION_TAKEN,
        SESSION_START,
        SESSION_END,
        CONTENT_ENGAGEMENT
    }

    /**
     * Explicit feedback from the user
     */
    @Serializable
    data class ExplicitFeedback(
        val rating: Int? = null, // e.g., 1-5 scale
        val feedbackText: String = "",
        val targetId: String? = null, // what the feedback relates to
        val feedbackType: String = "" // e.g., "response", "recommendation", "insight"
    )

    /**
     * Process a user interaction for learning
     */
    suspend fun processInteraction(interaction: UserInteraction) {
        // Update total interaction count
        val currentState = _learningState.value
        _learningState.value = currentState.copy(
            totalInteractionsObserved = currentState.totalInteractionsObserved + 1,
            lastUpdateTimestamp = System.currentTimeMillis()
        )

        // Extract features from the interaction
        val extractedFeatures = extractFeatures(interaction)
        
        // Update preference models
        updatePreferenceModels(extractedFeatures, interaction)
        
        // Analyze for potential insights
        analyzeForInsights(interaction, extractedFeatures)
        
        // Record interaction in memory system if available
        memorySystem?.let { memory ->
            val memoryItem = memory.createMemory(
                content = "User interaction: ${interaction.type} - ${interaction.content}",
                priority = calculateInteractionPriority(interaction),
                emotionalValence = interaction.userSentiment ?: 0.0,
                emotionalIntensity = Math.abs(interaction.userSentiment ?: 0.0),
                metadata = mapOf(
                    "interactionType" to interaction.type.toString(),
                    "timestamp" to interaction.timestamp.toString(),
                    "tags" to "user_interaction,learning_data,${interaction.type.toString().lowercase()}"
                )
            )
            memory.storeMemory(memoryItem)
        }
        
        // Check if experiments need to be updated
        updateExperiments(interaction)
    }
    
    /**
     * Extract learning features from a user interaction
     */
    private fun extractFeatures(interaction: UserInteraction): Map<String, Float> {
        val features = mutableMapOf<String, Float>()
        
        // Extract features based on interaction type
        when (interaction.type) {
            InteractionType.MESSAGE_RECEIVED -> {
                // Extract linguistic features
                val text = interaction.content.lowercase()
                
                // Simple sentiment analysis based on keywords
                val positiveWords = setOf("good", "great", "excellent", "happy", "love", "like", "thanks")
                val negativeWords = setOf("bad", "awful", "terrible", "sad", "hate", "dislike", "sorry")
                
                var sentimentScore = 0.0f
                for (word in positiveWords) {
                    if (text.contains(word)) sentimentScore += 0.1f
                }
                for (word in negativeWords) {
                    if (text.contains(word)) sentimentScore -= 0.1f
                }
                features["sentiment"] = sentimentScore.coerceIn(-1.0f, 1.0f)
                
                // Message length as a feature
                features["message_length"] = text.length.toFloat().coerceAtMost(500f) / 500f
                
                // Question detection
                features["is_question"] = if (text.contains("?")) 1.0f else 0.0f
                
                // Time of day (normalized to 0-1 over 24 hours)
                val hour = LocalDateTime.now().hour
                features["time_of_day"] = hour.toFloat() / 24f
            }
            
            InteractionType.EXPLICIT_FEEDBACK -> {
                interaction.explicitFeedback?.let { feedback ->
                    // Convert rating to normalized score
                    feedback.rating?.let { rating ->
                        features["explicit_rating"] = (rating.toFloat() - 1) / 4f // Assuming 1-5 scale
                    }
                    
                    // Feedback sentiment
                    val text = feedback.feedbackText.lowercase()
                    val positiveWords = setOf("good", "great", "excellent", "happy", "love", "like", "thanks")
                    val negativeWords = setOf("bad", "awful", "terrible", "sad", "hate", "dislike", "sorry")
                    
                    var sentimentScore = 0.0f
                    for (word in positiveWords) {
                        if (text.contains(word)) sentimentScore += 0.1f
                    }
                    for (word in negativeWords) {
                        if (text.contains(word)) sentimentScore -= 0.1f
                    }
                    features["feedback_sentiment"] = sentimentScore.coerceIn(-1.0f, 1.0f)
                }
            }
            
            InteractionType.FEATURE_USED -> {
                // Feature usage as a binary feature
                val feature = interaction.metadata["feature"] ?: "unknown"
                features["feature_$feature"] = 1.0f
            }
            
            else -> {
                // Default feature extraction
                features["interaction_type_${interaction.type}"] = 1.0f
            }
        }
        
        // Add contextual factors as features
        interaction.contextualFactors.forEach { (factor, value) ->
            // Try to convert numeric values
            try {
                val numValue = value.toFloat()
                features["context_${factor}_value"] = numValue
            } catch (e: NumberFormatException) {
                // For non-numeric values, use binary indicator
                features["context_${factor}_${value}"] = 1.0f
            }
        }
        
        return features
    }
    
    /**
     * Update preference models based on new interaction data
     */
    private fun updatePreferenceModels(features: Map<String, Float>, interaction: UserInteraction) {
        // Get existing preference models
        val currentModels = _preferenceModels.value.toMutableMap()
        
        // Update or create models based on interaction type
        when (interaction.type) {
            InteractionType.SETTING_CHANGED -> {
                val category = interaction.metadata["category"] ?: "general"
                val setting = interaction.metadata["setting"] ?: return
                val value = interaction.metadata["value"] ?: return
                
                // Get or create the preference model
                val model = currentModels.getOrPut(category) {
                    UserPreferenceModel(category = category)
                }
                
                // Update the preference value
                val currentValue = model.preferences.getOrDefault(setting, 0.5f)
                val newValue = when (value) {
                    "true" -> minOf(currentValue + learningConfig.learningRate, 1.0f)
                    "false" -> maxOf(currentValue - learningConfig.learningRate, 0.0f)
                    else -> {
                        try {
                            value.toFloat().coerceIn(0.0f, 1.0f)
                        } catch (e: NumberFormatException) {
                            // If not a boolean or float, use normalized text length as a weight
                            (value.length.toFloat().coerceAtMost(100f) / 100f)
                        }
                    }
                }
                
                // Update the model
                val updatedPreferences = model.preferences.toMutableMap().apply {
                    put(setting, newValue)
                }
                
                currentModels[category] = model.copy(
                    preferences = updatedPreferences,
                    lastUpdatedAt = System.currentTimeMillis(),
                    updateCount = model.updateCount + 1
                )
            }
            
            InteractionType.EXPLICIT_FEEDBACK -> {
                interaction.explicitFeedback?.let { feedback ->
                    val feedbackType = feedback.feedbackType
                    if (feedbackType.isNotEmpty()) {
                        val category = "feedback_$feedbackType"
                        val model = currentModels.getOrPut(category) {
                            UserPreferenceModel(category = category)
                        }
                        
                        // Update based on rating or sentiment
                        val score = feedback.rating?.let { (it.toFloat() - 1) / 4f } ?: // Convert from 1-5 scale
                                features["feedback_sentiment"] ?: 0.5f
                        
                        // Target of feedback
                        val target = feedback.targetId ?: "general"
                        
                        // Update the preference
                        val currentValue = model.preferences.getOrDefault(target, 0.5f)
                        val newValue = (currentValue * 0.9f) + (score * 0.1f) // Weighted average
                        
                        val updatedPreferences = model.preferences.toMutableMap().apply {
                            put(target, newValue)
                        }
                        
                        currentModels[category] = model.copy(
                            preferences = updatedPreferences,
                            lastUpdatedAt = System.currentTimeMillis(),
                            updateCount = model.updateCount + 1
                        )
                    }
                }
            }
            
            else -> {
                // Update feature-based preferences
                if (features.isNotEmpty()) {
                    val category = "interaction_${interaction.type.name.lowercase()}"
                    val model = currentModels.getOrPut(category) {
                        UserPreferenceModel(category = category)
                    }
                    
                    // Extract key features for this interaction type
                    val updatedPreferences = model.preferences.toMutableMap()
                    features.forEach { (feature, value) ->
                        val currentValue = model.preferences.getOrDefault(feature, 0.5f)
                        val newValue = (currentValue * (1 - learningConfig.learningRate)) + 
                                       (value * learningConfig.learningRate)
                        updatedPreferences[feature] = newValue.coerceIn(0.0f, 1.0f)
                    }
                    
                    currentModels[category] = model.copy(
                        preferences = updatedPreferences,
                        lastUpdatedAt = System.currentTimeMillis(),
                        updateCount = model.updateCount + 1
                    )
                }
            }
        }
        
        // Update the preference models state
        _preferenceModels.value = currentModels
    }
    
    /**
     * Analyze interactions to generate potential insights
     */
    private fun analyzeForInsights(interaction: UserInteraction, features: Map<String, Float>) {
        // Only analyze if we have enough data
        val currentState = _learningState.value
        if (currentState.totalInteractionsObserved < learningConfig.minInteractionsForInsight) {
            return
        }
        
        // Get current insights
        val currentInsights = _insights.value.toMutableList()
        
        // Check if this interaction reinforces or contradicts existing insights
        updateExistingInsights(interaction, features, currentInsights)
        
        // Try to generate new insights based on patterns
        val newInsights = generateNewInsights(interaction, features, currentInsights)
        if (newInsights.isNotEmpty()) {
            currentInsights.addAll(newInsights)
            
            // Update state with new insights count
            _learningState.value = currentState.copy(
                totalInsightsGenerated = currentState.totalInsightsGenerated + newInsights.size
            )
        }
        
        // Update insights state
        _insights.value = currentInsights
    }
    
    /**
     * Update existing insights based on new interaction data
     */
    private fun updateExistingInsights(
        interaction: UserInteraction, 
        features: Map<String, Float>,
        insights: MutableList<UserInsight>
    ) {
        val now = System.currentTimeMillis()
        
        // Check each insight for reinforcement or contradiction
        for (i in insights.indices) {
            val insight = insights[i]
            
            // Skip inactive insights
            if (!insight.isActive) continue
            
            // Check if the interaction is relevant to this insight
            val isRelevant = isInteractionRelevantToInsight(interaction, insight)
            if (!isRelevant) continue
            
            // Check if interaction reinforces or contradicts the insight
            val reinforcementScore = calculateReinforcementScore(interaction, features, insight)
            
            // Strong positive reinforcement
            if (reinforcementScore > 0.7) {
                val updatedInsight = insight.copy(
                    confidence = minOf(insight.confidence + 0.05f, 1.0f),
                    timesReinforced = insight.timesReinforced + 1,
                    lastUpdatedAt = now
                ).apply {
                    // Add this interaction as evidence if it's a strong reinforcement
                    if (reinforcementScore > 0.9) {
                        evidence.add("Reinforced by ${interaction.type} at ${now}: ${interaction.content.take(50)}")
                    }
                    
                    // Update confidence level based on reinforcement count
                    confidenceLevel = when {
                        timesReinforced >= 10 && timesContradicted <= 1 -> ConfidenceLevel.CONFIRMED
                        timesReinforced >= 5 && timesContradicted <= 2 -> ConfidenceLevel.PROBABLE
                        timesReinforced >= 3 -> ConfidenceLevel.EMERGING
                        else -> ConfidenceLevel.HYPOTHESIS
                    }
                }
                insights[i] = updatedInsight
            } 
            // Strong contradiction
            else if (reinforcementScore < -0.5) {
                val updatedInsight = insight.copy(
                    confidence = maxOf(insight.confidence - 0.1f, 0.0f),
                    timesContradicted = insight.timesContradicted + 1,
                    lastUpdatedAt = now
                ).apply {
                    // Add this interaction as contradicting evidence
                    evidence.add("Contradicted by ${interaction.type} at ${now}: ${interaction.content.take(50)}")
                    
                    // Deactivate insights that are consistently contradicted
                    if (timesContradicted > 3 && timesContradicted > timesReinforced) {
                        isActive = false
                        evidence.add("Insight deactivated due to consistent contradictions")
                    }
                    
                    // Downgrade confidence level based on contradictions
                    confidenceLevel = when {
                        timesContradicted > timesReinforced -> ConfidenceLevel.HYPOTHESIS
                        timesContradicted > 3 -> {
                            if (confidenceLevel == ConfidenceLevel.CONFIRMED) ConfidenceLevel.PROBABLE
                            else if (confidenceLevel == ConfidenceLevel.PROBABLE) ConfidenceLevel.EMERGING
                            else confidenceLevel
                        }
                        else -> confidenceLevel
                    }
                }
                insights[i] = updatedInsight
            }
            // Explicit verification from user feedback
            else if (interaction.type == InteractionType.EXPLICIT_FEEDBACK && 
                     interaction.explicitFeedback?.targetId == insight.id) {
                
                val feedback = interaction.explicitFeedback
                val rating = feedback?.rating ?: 0
                
                // Update insight based on explicit feedback
                val updatedInsight = insight.copy(
                    lastUpdatedAt = now
                ).apply {
                    // Strong positive feedback confirms the insight
                    if (rating >= 4) {
                        confidenceLevel = ConfidenceLevel.VERIFIED
                        confidence = 1.0f
                        evidence.add("Explicitly verified by user feedback: ${feedback.feedbackText}")
                    } 
                    // Strong negative feedback contradicts the insight
                    else if (rating <= 2) {
                        isActive = false
                        evidence.add("Explicitly rejected by user feedback: ${feedback.feedbackText}")
                    }
                }
                insights[i] = updatedInsight
            }
        }
    }
    
    /**
     * Generate new insights based on observed patterns
     */
    private fun generateNewInsights(
        interaction: UserInteraction,
        features: Map<String, Float>,
        existingInsights: List<UserInsight>
    ): List<UserInsight> {
        val newInsights = mutableListOf<UserInsight>()
        
        // Only generate new insights for enabled categories
        for (category in learningConfig.enabledCategories) {
            // Skip categories that have reached their maximum insight count
            val categoryCount = existingInsights.count { 
                it.category == category && it.isActive 
            }
            
            if (categoryCount >= learningConfig.maxInsightsPerCategory) {
                continue
            }
            
            // Generate category-specific insights
            when (category) {
                LearningCategory.COMMUNICATION_STYLE -> {
                    // Only analyze message interactions
                    if (interaction.type == InteractionType.MESSAGE_RECEIVED) {
                        val text = interaction.content.lowercase()
                        
                        // Check for message length preference pattern
                        val msgLength = text.length
                        if (msgLength > 200 && 
                            hasConsistentPattern("long_messages", features, existingInsights)) {
                            newInsights.add(
                                UserInsight(
                                    category = category,
                                    description = "User tends to write detailed, longer messages",
                                    confidence = 0.6f,
                                    confidenceLevel = ConfidenceLevel.EMERGING,
                                    evidence = mutableListOf(
                                        "Message with length $msgLength at ${interaction.timestamp}"
                                    ),
                                    metaTags = mutableSetOf("communication", "verbose", "detailed")
                                )
                            )
                        } else if (msgLength < 50 && 
                                  hasConsistentPattern("short_messages", features, existingInsights)) {
                            newInsights.add(
                                UserInsight(
                                    category = category,
                                    description = "User prefers concise, brief communications",
                                    confidence = 0.6f,
                                    confidenceLevel = ConfidenceLevel.EMERGING,
                                    evidence = mutableListOf(
                                        "Message with length $msgLength at ${interaction.timestamp}"
                                    ),
                                    metaTags = mutableSetOf("communication", "concise", "brief")
                                )
                            )
                        }
                        
                        // Check for question frequency pattern
                        if (text.contains("?") && 
                            hasConsistentPattern("asks_questions", features, existingInsights)) {
                            newInsights.add(
                                UserInsight(
                                    category = category,
                                    description = "User frequently asks questions in conversations",
                                    confidence = 0.55f,
                                    confidenceLevel = ConfidenceLevel.HYPOTHESIS,
                                    evidence = mutableListOf(
                                        "Question detected at ${interaction.timestamp}: ${text.take(50)}..."
                                    ),
                                    metaTags = mutableSetOf("communication", "inquisitive", "questions")
                                )
                            )
                        }
                    }
                }
                
                LearningCategory.TONE_PREFERENCES -> {
                    // Analyze explicit feedback for tone preferences
                    if (interaction.type == InteractionType.EXPLICIT_FEEDBACK) {
                        val feedback = interaction.explicitFeedback
                        if (feedback != null && feedback.feedbackType == "tone" && feedback.rating != null) {
                            val tone = feedback.targetId ?: "unknown"
                            val rating = feedback.rating
                            
                            if (rating >= 4) {
                                newInsights.add(
                                    UserInsight(
                                        category = category,
                                        description = "User responds positively to $tone tone",
                                        confidence = 0.7f,
                                        confidenceLevel = ConfidenceLevel.PROBABLE,
                                        evidence = mutableListOf(
                                            "Explicit positive feedback on $tone tone: ${feedback.feedbackText}"
                                        ),
                                        metaTags = mutableSetOf("tone", tone, "preference")
                                    )
                                )
                            } else if (rating <= 2) {
                                newInsights.add(
                                    UserInsight(
                                        category = category,
                                        description = "User responds negatively to $tone tone",
                                        confidence = 0.7f,
                                        confidenceLevel = ConfidenceLevel.PROBABLE,
                                        evidence = mutableListOf(
                                            "Explicit negative feedback on $tone tone: ${feedback.feedbackText}"
                                        ),
                                        metaTags = mutableSetOf("tone", tone, "dislike")
                                    )
                                )
                            }
                        }
                    }
                }
                
                LearningCategory.SUBJECT_INTERESTS -> {
                    // Detect topics of interest from messages
                    if (interaction.type == InteractionType.MESSAGE_RECEIVED) {
                        val text = interaction.content.lowercase()
                        
                        // Simple keyword-based topic detection
                        val topics = detectTopics(text)
                        for (topic in topics) {
                            if (hasConsistentPattern("interest_in_$topic", features, existingInsights)) {
                                newInsights.add(
                                    UserInsight(
                                        category = category,
                                        description = "User shows interest in $topic",
                                        confidence = 0.5f,
                                        confidenceLevel = ConfidenceLevel.HYPOTHESIS,
                                        evidence = mutableListOf(
                                            "Topic mention at ${interaction.timestamp}: ${text.take(50)}..."
                                        ),
                                        metaTags = mutableSetOf("interest", topic, "subject")
                                    )
                                )
                            }
                        }
                    }
                }
                
                // Add more categories as needed
                else -> {
                    // Generic insight generation for other categories
                }
            }
        }
        
        return newInsights
    }
    
    /**
     * Detect topics of interest in user text
     */
    private fun detectTopics(text: String): List<String> {
        val topics = mutableListOf<String>()
        
        // Simple keyword-based topic detection
        val topicKeywords = mapOf(
            "technology" to setOf("tech", "computer", "software", "hardware", "app", "digital", "code"),
            "health" to setOf("health", "fitness", "exercise", "diet", "nutrition", "wellness"),
            "finance" to setOf("money", "finance", "invest", "budget", "saving", "financial"),
            "travel" to setOf("travel", "trip", "vacation", "visit", "touring", "destination"),
            "food" to setOf("food", "cook", "recipe", "meal", "restaurant", "dish", "cuisine"),
            "entertainment" to setOf("movie", "show", "music", "game", "book", "concert", "entertainment"),
            "education" to setOf("learn", "study", "course", "class", "education", "knowledge"),
            "career" to setOf("job", "work", "career", "profession", "business", "company")
        )
        
        // Count keyword occurrences for each topic
        val topicCounts = mutableMapOf<String, Int>()
        
        for ((topic, keywords) in topicKeywords) {
            var count = 0
            for (keyword in keywords) {
                if (text.contains(keyword)) {
                    count++
                }
            }
            if (count > 0) {
                topicCounts[topic] = count
            }
        }
        
        // Return topics with sufficient keyword matches
        return topicCounts.entries
            .filter { it.value >= 2 } // At least 2 keywords to identify a topic
            .sortedByDescending { it.value }
            .map { it.key }
    }
    
    /**
     * Check if an interaction is relevant to a specific insight
     */
    private fun isInteractionRelevantToInsight(interaction: UserInteraction, insight: UserInsight): Boolean {
        // Check if interaction type is relevant to the insight category
        return when (insight.category) {
            LearningCategory.COMMUNICATION_STYLE -> 
                interaction.type == InteractionType.MESSAGE_RECEIVED ||
                interaction.type == InteractionType.MESSAGE_SENT
                
            LearningCategory.TONE_PREFERENCES ->
                interaction.type == InteractionType.EXPLICIT_FEEDBACK ||
                interaction.type == InteractionType.MESSAGE_RECEIVED
                
            LearningCategory.SUBJECT_INTERESTS ->
                interaction.type == InteractionType.MESSAGE_RECEIVED ||
                interaction.type == InteractionType.CONTENT_ENGAGEMENT
            
            LearningCategory.DAILY_PATTERNS ->
                true // All interactions help establish daily patterns
                
            LearningCategory.EMOTIONAL_TRIGGERS ->
                interaction.userSentiment != null ||
                interaction.type == InteractionType.EXPLICIT_FEEDBACK
                
            // Add more category-specific relevance checks
            
            else -> false
        }
    }
    
    /**
     * Calculate reinforcement score for an insight based on interaction
     * Returns positive value for reinforcement, negative for contradiction
     */
    private fun calculateReinforcementScore(
        interaction: UserInteraction,
        features: Map<String, Float>,
        insight: UserInsight
    ): Double {
        // Basic score based on explicit feedback
        if (interaction.type == InteractionType.EXPLICIT_FEEDBACK &&
            interaction.explicitFeedback?.targetId == insight.id) {
            
            val rating = interaction.explicitFeedback.rating
            return if (rating != null) {
                (rating - 3) / 2.0 // Convert 1-5 scale to -1 to 1 range
            } else {
                0.0
            }
        }
        
        // Category-specific reinforcement calculation
        return when (insight.category) {
            LearningCategory.COMMUNICATION_STYLE -> {
                when {
                    insight.description.contains("longer messages") -> {
                        val length = interaction.content.length
                        if (length > 200) 0.5 else if (length < 50) -0.5 else 0.0
                    }
                    insight.description.contains("brief communications") -> {
                        val length = interaction.content.length
                        if (length < 50) 0.5 else if (length > 200) -0.5 else 0.0
                    }
                    insight.description.contains("asks questions") -> {
                        if (interaction.content.contains("?")) 0.5 else 0.0
                    }
                    else -> 0.0
                }
            }
            
            LearningCategory.TONE_PREFERENCES -> {
                val sentiment = interaction.userSentiment ?: features["sentiment"] ?: 0.0f
                
                if (insight.description.contains("positively to")) {
                    sentiment.toDouble()
                } else if (insight.description.contains("negatively to")) {
                    -sentiment.toDouble()
                } else {
                    0.0
                }
            }
            
            LearningCategory.SUBJECT_INTERESTS -> {
                // Extract topic from insight
                val topic = insight.metaTags.find { it != "interest" && it != "subject" } ?: ""
                if (topic.isEmpty()) return 0.0
                
                // Check if the topic is mentioned in the interaction
                val topicKeywords = when (topic) {
                    "technology" -> setOf("tech", "computer", "software", "hardware", "app", "digital", "code")
                    "health" -> setOf("health", "fitness", "exercise", "diet", "nutrition", "wellness")
                    "finance" -> setOf("money", "finance", "invest", "budget", "saving", "financial")
                    "travel" -> setOf("travel", "trip", "vacation", "visit", "touring", "destination")
                    "food" -> setOf("food", "cook", "recipe", "meal", "restaurant", "dish", "cuisine")
                    "entertainment" -> setOf("movie", "show", "music", "game", "book", "concert")
                    "education" -> setOf("learn", "study", "course", "class", "education", "knowledge")
                    "career" -> setOf("job", "work", "career", "profession", "business", "company")
                    else -> emptySet()
                }
                
                val text = interaction.content.lowercase()
                var matchCount = 0
                for (keyword in topicKeywords) {
                    if (text.contains(keyword)) {
                        matchCount++
                    }
                }
                
                if (matchCount >= 2) 0.5 else 0.0
            }
            
            // Add more category-specific calculations
            
            else -> 0.0
        }
    }
    
    /**
     * Check if there's a consistent pattern in the user's behavior
     */
    private fun hasConsistentPattern(
        patternName: String, 
        currentFeatures: Map<String, Float>,
        existingInsights: List<UserInsight>
    ): Boolean {
        // Check if we already have an insight about this pattern
        val hasExistingInsight = existingInsights.any { insight ->
            insight.isActive && 
            insight.metaTags.contains(patternName) ||
            insight.description.contains(patternName)
        }
        
        // Don't duplicate insights
        if (hasExistingInsight) {
            return false
        }
        
        // Get preference models that might be relevant
        val relevantModels = _preferenceModels.value.filter { (category, _) ->
            category.contains(patternName) ||
            (patternName.contains("message") && category.contains("message")) ||
            (patternName.contains("topic") && category.contains("content"))
        }
        
        // Check if any model shows a strong pattern
        for ((_, model) in relevantModels) {
            val relevantPreferences = model.preferences.filter { (key, _) ->
                key.contains(patternName) || 
                (patternName.contains("message") && key.contains("message")) ||
                (patternName.contains("question") && key.contains("question"))
            }
            
            for ((_, value) in relevantPreferences) {
                // Strong pattern detected
                if (value > 0.7f && model.updateCount > 3) {
                    return true
                }
            }
        }
        
        // Default - not enough evidence yet
        return false
    }
    
    /**
     * Calculate priority for storing an interaction in memory
     */
    private fun calculateInteractionPriority(interaction: UserInteraction): Int {
        // Base priority
        var priority = 50
        
        // Adjust based on interaction type
        priority += when (interaction.type) {
            InteractionType.EXPLICIT_FEEDBACK -> 30 // Explicit feedback is high priority
            InteractionType.SETTING_CHANGED -> 20 // Direct user preferences
            InteractionType.MESSAGE_RECEIVED -> 10 // User messages are important
            InteractionType.ACTION_TAKEN -> 10 // User actions are important
            else -> 0
        }
        
        // Adjust based on sentiment if available
        interaction.userSentiment?.let { sentiment ->
            // Strong emotions (positive or negative) increase priority
            priority += (Math.abs(sentiment) * 20).toInt()
        }
        
        // Cap at 1-100 range
        return priority.coerceIn(1, 100)
    }
    
    /**
     * Update ongoing learning experiments
     */
    private fun updateExperiments(interaction: UserInteraction) {
        val currentState = _learningState.value
        val activeExperiments = currentState.activeExperiments.toMutableList()
        var updated = false
        
        // Process each active experiment
        for (i in activeExperiments.indices) {
            val experiment = activeExperiments[i]
            
            // Skip completed experiments
            if (experiment.status != ExperimentStatus.ACTIVE) {
                continue
            }
            
            // Check if this interaction provides results for the experiment
            if (interaction.type == InteractionType.EXPLICIT_FEEDBACK &&
                interaction.metadata["experimentId"] == experiment.id) {
                
                // Extract the variant and result
                val variant = interaction.metadata["variant"] ?: continue
                val success = interaction.explicitFeedback?.rating?.let { it >= 4 } ?: false
                
                // Update experiment results
                val currentResults = experiment.results.toMutableMap()
                val currentSuccessRate = currentResults.getOrDefault(variant, 0.0f)
                val newSuccessRate = if (success) {
                    (currentSuccessRate + 1.0f) / 2.0f // Average with 100% success
                } else {
                    currentSuccessRate / 2.0f // Average with 0% success
                }
                
                currentResults[variant] = newSuccessRate
                
                // Update the experiment
                activeExperiments[i] = experiment.copy(
                    results = currentResults
                )
                
                updated = true
                
                // Check if experiment has enough data to complete
                if (currentResults.size >= experiment.variants.size &&
                    currentResults.values.all { it > 0 }) {
                    
                    // Find the best variant
                    val bestVariant = currentResults.entries.maxByOrNull { it.value }?.key
                    val bestScore = bestVariant?.let { currentResults[it] } ?: 0.0f
                    
                    // Complete experiment if we have a clear winner
                    if (bestVariant != null && bestScore > 0.7f) {
                        activeExperiments[i] = experiment.copy(
                            status = ExperimentStatus.COMPLETED_CONFIRMED,
                            completedAt = System.currentTimeMillis(),
                            conclusionNotes = "Experiment confirmed hypothesis with variant: $bestVariant (score: $bestScore)"
                        )
                        
                        // If this experiment was testing an insight, update the insight
                        experiment.targetInsightId?.let { insightId ->
                            updateInsightFromExperiment(insightId, true, experiment.hypothesis)
                        }
                    }
                    // Complete experiment if no variant is performing well
                    else if (currentResults.values.all { it < 0.3f }) {
                        activeExperiments[i] = experiment.copy(
                            status = ExperimentStatus.COMPLETED_REJECTED,
                            completedAt = System.currentTimeMillis(),
                            conclusionNotes = "Experiment rejected hypothesis - all variants performed poorly"
                        )
                        
                        // If this experiment was testing an insight, update the insight
                        experiment.targetInsightId?.let { insightId ->
                            updateInsightFromExperiment(insightId, false, experiment.hypothesis)
                        }
                    }
                }
            }
        }
        
        // Update state if any experiments were updated
        if (updated) {
            _learningState.value = currentState.copy(
                activeExperiments = activeExperiments
            )
        }
    }
    
    /**
     * Update an insight based on experiment results
     */
    private fun updateInsightFromExperiment(insightId: String, confirmed: Boolean, hypothesis: String) {
        val currentInsights = _insights.value.toMutableList()
        val index = currentInsights.indexOfFirst { it.id == insightId }
        
        if (index >= 0) {
            val insight = currentInsights[index]
            val updatedInsight = if (confirmed) {
                insight.copy(
                    confidence = 0.95f,
                    confidenceLevel = ConfidenceLevel.CONFIRMED,
                    timesReinforced = insight.timesReinforced + 1,
                    lastUpdatedAt = System.currentTimeMillis()
                ).apply {
                    evidence.add("Confirmed by experiment: $hypothesis")
                }
            } else {
                insight.copy(
                    confidence = 0.2f,
                    confidenceLevel = ConfidenceLevel.HYPOTHESIS,
                    timesContradicted = insight.timesContradicted + 1,
                    isActive = false,
                    lastUpdatedAt = System.currentTimeMillis()
                ).apply {
                    evidence.add("Rejected by experiment: $hypothesis")
                }
            }
            
            currentInsights[index] = updatedInsight
            _insights.value = currentInsights
        }
    }
    
    /**
     * Start a new learning experiment to test a hypothesis
     */
    fun startExperiment(
        hypothesis: String,
        targetInsightId: String? = null,
        category: LearningCategory,
        variants: List<String>
    ): LearningExperiment {
        // Create new experiment
        val experiment = LearningExperiment(
            hypothesis = hypothesis,
            targetInsightId = targetInsightId,
            category = category,
            variants = variants
        )
        
        // Add to active experiments
        val currentState = _learningState.value
        val activeExperiments = currentState.activeExperiments.toMutableList()
        activeExperiments.add(experiment)
        
        _learningState.value = currentState.copy(
            activeExperiments = activeExperiments
        )
        
        return experiment
    }
    
    /**
     * Get insights matching certain criteria
     */
    fun getInsights(
        categories: Set<LearningCategory>? = null,
        minConfidence: Float = 0.0f,
        activeOnly: Boolean = true,
        limit: Int = 10
    ): List<UserInsight> {
        return _insights.value
            .filter { insight ->
                (categories == null || categories.contains(insight.category)) &&
                insight.confidence >= minConfidence &&
                (!activeOnly || insight.isActive)
            }
            .sortedByDescending { it.confidence }
            .take(limit)
    }
    
    /**
     * Get user preferences for a specific category
     */
    fun getPreferences(category: String): UserPreferenceModel? {
        return _preferenceModels.value[category]
    }
    
    /**
     * Save current learning state to memory
     */
    suspend fun saveToMemory(): Boolean {
        val memorySystem = memorySystem ?: return false
        
        try {
            // Save insights as semantic memories
            for (insight in _insights.value) {
                if (insight.isActive && insight.confidence > learningConfig.insightConfidenceThreshold) {
                    val memory = memorySystem.createSemanticMemory(
                        content = "User insight: ${insight.description}",
                        certainty = insight.confidence.toDouble(),
                        priority = 70, // Insights are important
                        metadata = mapOf(
                            "insightId" to insight.id,
                            "category" to insight.category.toString(),
                            "confidenceLevel" to insight.confidenceLevel.toString(),
                            "tags" to "user_insight,learning,${insight.category.toString().lowercase()}"
                        )
                    )
                    memorySystem.storeMemory(memory)
                }
            }
            
            // Save preference models as semantic memories
            for ((category, model) in _preferenceModels.value) {
                if (model.preferences.isNotEmpty() && model.updateCount > 2) {
                    val preferencesJson = model.preferences.entries
                        .sortedByDescending { it.value }
                        .joinToString(", ") { "${it.key}: ${it.value}" }
                    
                    val memory = memorySystem.createSemanticMemory(
                        content = "User preferences for $category: $preferencesJson",
                        certainty = 0.8,
                        priority = 65,
                        metadata = mapOf(
                            "preferenceCategory" to category,
                            "updateCount" to model.updateCount.toString(),
                            "tags" to "user_preference,learning,$category"
                        )
                    )
                    memorySystem.storeMemory(memory)
                }
            }
            
            return true
        } catch (e: Exception) {
            println("Error saving learning state to memory: ${e.message}")
            return false
        }
    }
    
    /**
     * Load learning state from memory system
     */
    suspend fun loadFromMemory(): Boolean {
        val memorySystem = memorySystem ?: return false
        
        try {
            // Load insights from semantic memory with learning tags
            val learningMemories = memorySystem.searchSemanticMemories(
                query = "user_insight",
                includeMetadata = true,
                limit = 100
            )
            
            // Restore insights from memory
            val restoredInsights = learningMemories.mapNotNull { memory ->
                val metadata = memory.metadata
                val insightId = metadata["insightId"] as? String
                val categoryStr = metadata["category"] as? String
                val confidenceLevelStr = metadata["confidenceLevel"] as? String
                
                if (insightId != null && categoryStr != null && confidenceLevelStr != null) {
                    try {
                        val category = LearningCategory.valueOf(categoryStr)
                        val confidenceLevel = com.sallie.core.learning.AdaptiveLearningEngine.ConfidenceLevel.valueOf(confidenceLevelStr)
                        
                        UserInsight(
                            id = insightId,
                            category = category,
                            description = memory.content.removePrefix("User insight: "),
                            confidence = memory.certainty.toFloat(),
                            confidenceLevel = confidenceLevel,
                            isActive = true,
                            createdAt = LocalDateTime.now(), // Could extract from metadata if stored
                            lastUpdatedAt = LocalDateTime.now()
                        )
                    } catch (e: Exception) {
                        null // Skip malformed insights
                    }
                } else null
            }
            
            // Update the insights state
            _insights.value = restoredInsights
            
            println("Loaded ${restoredInsights.size} insights from memory")
            return true
        } catch (e: Exception) {
            println("Error loading learning state from memory: ${e.message}")
            return false
        }
    }
}

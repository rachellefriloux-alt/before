/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * Values authenticity, respects boundaries, and maintains unwavering devotion
 * 
 * Intelligence Layer Module - Predictive assistance, contextual suggestions, and learning from user patterns
 */
package com.sallie.intelligence

import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.concurrent.ConcurrentHashMap
import kotlin.math.max
import kotlin.math.min

/**
 * Advanced intelligence layer that provides predictive assistance and learns from user patterns
 */
class IntelligenceLayerModule {
    
    private val userPatterns = ConcurrentHashMap<String, MutableList<UserAction>>()
    private val contextualSuggestions = ConcurrentHashMap<String, MutableList<Suggestion>>()
    private val learningScope = CoroutineScope(Dispatchers.Default + SupervisorJob())
    
    private val _predictions = MutableStateFlow<List<Prediction>>(emptyList())
    val predictions: StateFlow<List<Prediction>> = _predictions.asStateFlow()
    
    private val _insights = MutableStateFlow<List<UserInsight>>(emptyList())
    val insights: StateFlow<List<UserInsight>> = _insights.asStateFlow()
    
    /**
     * Initialize the intelligence layer
     */
    suspend fun initialize() {
        // Start background learning processes
        startPatternAnalysis()
        startContextualLearning()
        loadHistoricalPatterns()
    }
    
    /**
     * Record a user action for pattern learning
     */
    suspend fun recordUserAction(action: UserAction) {
        val context = action.context
        
        // Add to pattern history
        userPatterns.computeIfAbsent(context) { mutableListOf() }.add(action)
        
        // Limit history size
        userPatterns[context]?.let { actions ->
            if (actions.size > MAX_PATTERN_HISTORY) {
                actions.removeFirst()
            }
        }
        
        // Trigger pattern analysis
        analyzePatterns(context)
    }
    
    /**
     * Get predictive suggestions based on current context
     */
    suspend fun getPredictiveSuggestions(currentContext: String, timeOfDay: String = getCurrentTimeContext()): List<Suggestion> {
        return withContext(Dispatchers.Default) {
            val suggestions = mutableListOf<Suggestion>()
            
            // Get pattern-based suggestions
            suggestions.addAll(getPatternBasedSuggestions(currentContext, timeOfDay))
            
            // Get contextual suggestions
            suggestions.addAll(getContextualSuggestions(currentContext))
            
            // Get time-based suggestions
            suggestions.addAll(getTimeBasedSuggestions(timeOfDay))
            
            // Sort by confidence and return top suggestions
            suggestions.sortedByDescending { it.confidence }.take(MAX_SUGGESTIONS)
        }
    }
    
    /**
     * Provide proactive assistance based on learned patterns
     */
    suspend fun provideProactiveAssistance(currentState: UserState): List<ProactiveAssistance> {
        return withContext(Dispatchers.Default) {
            val assistance = mutableListOf<ProactiveAssistance>()
            
            // Analyze current state against learned patterns
            val patterns = userPatterns[currentState.context] ?: emptyList()
            
            // Look for patterns that suggest user might need help
            val frequentActions = patterns.groupBy { it.type }
                .mapValues { it.value.size }
                .filter { it.value >= MIN_PATTERN_FREQUENCY }
            
            // Generate assistance based on frequent actions
            frequentActions.forEach { (actionType, frequency) ->
                val confidence = calculatePatternConfidence(frequency, patterns.size)
                
                when (actionType) {
                    "app_launch" -> {
                        assistance.add(ProactiveAssistance(
                            type = "app_suggestion",
                            message = "Based on your patterns, you might want to open an app",
                            action = "suggest_frequent_apps",
                            confidence = confidence,
                            priority = if (confidence > 0.8f) Priority.HIGH else Priority.MEDIUM
                        ))
                    }
                    "search" -> {
                        assistance.add(ProactiveAssistance(
                            type = "search_suggestion",
                            message = "I notice you often search at this time. Need help finding something?",
                            action = "offer_search_assistance",
                            confidence = confidence,
                            priority = Priority.MEDIUM
                        ))
                    }
                    "communication" -> {
                        assistance.add(ProactiveAssistance(
                            type = "communication_suggestion",
                            message = "Would you like me to help with messages or calls?",
                            action = "offer_communication_help",
                            confidence = confidence,
                            priority = Priority.MEDIUM
                        ))
                    }
                }
            }
            
            assistance.sortedByDescending { it.confidence }
        }
    }
    
    /**
     * Learn from user feedback on suggestions
     */
    suspend fun recordFeedback(suggestionId: String, feedback: Feedback) {
        // Update suggestion confidence based on feedback
        contextualSuggestions.values.flatten().find { it.id == suggestionId }?.let { suggestion ->
            when (feedback.type) {
                FeedbackType.POSITIVE -> {
                    suggestion.confidence = min(1.0f, suggestion.confidence + 0.1f)
                }
                FeedbackType.NEGATIVE -> {
                    suggestion.confidence = max(0.0f, suggestion.confidence - 0.2f)
                }
                FeedbackType.NEUTRAL -> {
                    // No change
                }
            }
        }
        
        // Record feedback for future learning
        recordUserAction(UserAction(
            type = "feedback",
            context = feedback.context,
            data = mapOf(
                "suggestion_id" to suggestionId,
                "feedback_type" to feedback.type.name,
                "rating" to feedback.rating.toString()
            ),
            timestamp = System.currentTimeMillis()
        ))
    }
    
    /**
     * Generate insights about user behavior patterns
     */
    suspend fun generateUserInsights(): List<UserInsight> {
        return withContext(Dispatchers.Default) {
            val insights = mutableListOf<UserInsight>()
            
            // Analyze most frequent contexts
            val contextFrequency = userPatterns.mapValues { it.value.size }
                .toList().sortedByDescending { it.second }
            
            if (contextFrequency.isNotEmpty()) {
                val mostFrequent = contextFrequency.first()
                insights.add(UserInsight(
                    type = "usage_pattern",
                    title = "Primary Usage Context",
                    description = "You use Sallie most often in the '${mostFrequent.first}' context",
                    confidence = calculatePatternConfidence(mostFrequent.second, userPatterns.values.sumOf { it.size }),
                    actionable = true,
                    suggestions = listOf("I can optimize my responses for this context")
                ))
            }
            
            // Analyze time patterns
            val timePatterns = analyzeTimePatterns()
            if (timePatterns.isNotEmpty()) {
                insights.add(UserInsight(
                    type = "time_pattern",
                    title = "Active Hours",
                    description = "You're most active during: ${timePatterns.joinToString(", ")}",
                    confidence = 0.8f,
                    actionable = true,
                    suggestions = listOf("I can be more proactive during these times")
                ))
            }
            
            insights
        }
    }
    
    private suspend fun startPatternAnalysis() {
        learningScope.launch {
            while (isActive) {
                try {
                    // Periodic pattern analysis
                    userPatterns.keys.forEach { context ->
                        analyzePatterns(context)
                    }
                    
                    // Update predictions
                    updatePredictions()
                    
                    delay(PATTERN_ANALYSIS_INTERVAL)
                } catch (e: Exception) {
                    // Log error but continue
                    delay(ERROR_RETRY_INTERVAL)
                }
            }
        }
    }
    
    private suspend fun startContextualLearning() {
        learningScope.launch {
            while (isActive) {
                try {
                    // Learn from recent interactions
                    updateContextualSuggestions()
                    
                    // Generate new insights
                    _insights.value = generateUserInsights()
                    
                    delay(CONTEXTUAL_LEARNING_INTERVAL)
                } catch (e: Exception) {
                    delay(ERROR_RETRY_INTERVAL)
                }
            }
        }
    }
    
    private suspend fun analyzePatterns(context: String) {
        val actions = userPatterns[context] ?: return
        
        if (actions.size < MIN_PATTERN_SIZE) return
        
        // Find recurring sequences
        val sequences = findRecurringSequences(actions)
        
        // Generate predictions based on sequences
        sequences.forEach { sequence ->
            val prediction = Prediction(
                context = context,
                nextAction = sequence.nextPredictedAction,
                confidence = sequence.confidence,
                timeWindow = sequence.timeWindow,
                description = "Based on your ${sequence.name} pattern"
            )
            
            updatePredictionsList(prediction)
        }
    }
    
    private fun findRecurringSequences(actions: List<UserAction>): List<ActionSequence> {
        val sequences = mutableListOf<ActionSequence>()
        
        // Simple pattern detection - look for repeated action types
        val actionTypes = actions.map { it.type }
        val frequencyMap = actionTypes.groupBy { it }.mapValues { it.value.size }
        
        frequencyMap.filter { it.value >= MIN_PATTERN_FREQUENCY }.forEach { (actionType, frequency) ->
            val confidence = calculatePatternConfidence(frequency, actions.size)
            
            sequences.add(ActionSequence(
                name = "${actionType}_pattern",
                actions = listOf(actionType),
                nextPredictedAction = actionType,
                confidence = confidence,
                timeWindow = "anytime"
            ))
        }
        
        return sequences
    }
    
    private fun getPatternBasedSuggestions(context: String, timeOfDay: String): List<Suggestion> {
        val patterns = userPatterns[context] ?: return emptyList()
        val suggestions = mutableListOf<Suggestion>()
        
        // Analyze patterns for this time of day
        val timeFilteredPatterns = patterns.filter { 
            getTimeContext(it.timestamp) == timeOfDay 
        }
        
        if (timeFilteredPatterns.isNotEmpty()) {
            val mostCommonAction = timeFilteredPatterns.groupBy { it.type }
                .maxByOrNull { it.value.size }
            
            mostCommonAction?.let { (actionType, actions) ->
                val confidence = calculatePatternConfidence(actions.size, timeFilteredPatterns.size)
                
                suggestions.add(Suggestion(
                    id = "pattern_${actionType}_${timeOfDay}",
                    type = "pattern_based",
                    title = "Continue Your Routine",
                    description = "You usually $actionType around this time",
                    action = actionType,
                    confidence = confidence,
                    priority = if (confidence > 0.7f) Priority.HIGH else Priority.MEDIUM
                ))
            }
        }
        
        return suggestions
    }
    
    private fun getContextualSuggestions(context: String): List<Suggestion> {
        return contextualSuggestions[context] ?: emptyList()
    }
    
    private fun getTimeBasedSuggestions(timeOfDay: String): List<Suggestion> {
        val suggestions = mutableListOf<Suggestion>()
        
        when (timeOfDay.lowercase()) {
            "morning" -> {
                suggestions.add(Suggestion(
                    id = "morning_routine",
                    type = "time_based",
                    title = "Good Morning!",
                    description = "Ready to start your day? I can help you check your schedule",
                    action = "check_schedule",
                    confidence = 0.8f,
                    priority = Priority.MEDIUM
                ))
            }
            "evening" -> {
                suggestions.add(Suggestion(
                    id = "evening_routine",
                    type = "time_based",
                    title = "Evening Wind Down",
                    description = "Time to relax? I can help you set up a calming environment",
                    action = "evening_routine",
                    confidence = 0.7f,
                    priority = Priority.LOW
                ))
            }
        }
        
        return suggestions
    }
    
    private fun updatePredictionsList(newPrediction: Prediction) {
        val currentPredictions = _predictions.value.toMutableList()
        
        // Remove old prediction for same context if exists
        currentPredictions.removeAll { it.context == newPrediction.context }
        
        // Add new prediction
        currentPredictions.add(newPrediction)
        
        // Keep only top predictions
        val sortedPredictions = currentPredictions.sortedByDescending { it.confidence }.take(MAX_PREDICTIONS)
        _predictions.value = sortedPredictions
    }
    
    private suspend fun updatePredictions() {
        val allPredictions = mutableListOf<Prediction>()
        
        userPatterns.forEach { (context, actions) ->
            if (actions.size >= MIN_PATTERN_SIZE) {
                val sequences = findRecurringSequences(actions)
                sequences.forEach { sequence ->
                    allPredictions.add(Prediction(
                        context = context,
                        nextAction = sequence.nextPredictedAction,
                        confidence = sequence.confidence,
                        timeWindow = sequence.timeWindow,
                        description = "Predicted based on ${sequence.name}"
                    ))
                }
            }
        }
        
        _predictions.value = allPredictions.sortedByDescending { it.confidence }.take(MAX_PREDICTIONS)
    }
    
    private suspend fun updateContextualSuggestions() {
        // Update suggestions based on recent learning
        userPatterns.forEach { (context, actions) ->
            val recentActions = actions.takeLast(RECENT_ACTIONS_WINDOW)
            
            if (recentActions.isNotEmpty()) {
                val suggestions = generateSuggestionsFromActions(context, recentActions)
                contextualSuggestions[context] = suggestions.toMutableList()
            }
        }
    }
    
    private fun generateSuggestionsFromActions(context: String, actions: List<UserAction>): List<Suggestion> {
        val suggestions = mutableListOf<Suggestion>()
        
        // Group actions by type and find most common
        val actionGroups = actions.groupBy { it.type }
        
        actionGroups.forEach { (actionType, typeActions) ->
            if (typeActions.size >= 2) { // Need at least 2 occurrences
                val confidence = calculatePatternConfidence(typeActions.size, actions.size)
                
                suggestions.add(Suggestion(
                    id = "contextual_${context}_${actionType}",
                    type = "contextual",
                    title = "Continue With $actionType",
                    description = "You've been doing this frequently in $context",
                    action = actionType,
                    confidence = confidence,
                    priority = Priority.MEDIUM
                ))
            }
        }
        
        return suggestions
    }
    
    private fun analyzeTimePatterns(): List<String> {
        val timePatterns = mutableListOf<String>()
        val hourCounts = mutableMapOf<Int, Int>()
        
        userPatterns.values.flatten().forEach { action ->
            val hour = getHourFromTimestamp(action.timestamp)
            hourCounts[hour] = hourCounts.getOrDefault(hour, 0) + 1
        }
        
        // Find peak hours
        val averageActivity = hourCounts.values.average()
        hourCounts.filter { it.value > averageActivity * 1.5 }.keys.sorted().forEach { hour ->
            timePatterns.add(formatHour(hour))
        }
        
        return timePatterns
    }
    
    private fun calculatePatternConfidence(occurrences: Int, total: Int): Float {
        if (total == 0) return 0f
        val frequency = occurrences.toFloat() / total.toFloat()
        return min(1.0f, frequency * 2.0f) // Scale up frequency for confidence
    }
    
    private suspend fun loadHistoricalPatterns() {
        // In a real implementation, this would load from persistent storage
        // For now, we'll start with empty patterns
    }
    
    private fun getCurrentTimeContext(): String {
        val hour = LocalDateTime.now().hour
        return when (hour) {
            in 6..11 -> "morning"
            in 12..17 -> "afternoon"
            in 18..21 -> "evening"
            else -> "night"
        }
    }
    
    private fun getTimeContext(timestamp: Long): String {
        val hour = getHourFromTimestamp(timestamp)
        return when (hour) {
            in 6..11 -> "morning"
            in 12..17 -> "afternoon"
            in 18..21 -> "evening"
            else -> "night"
        }
    }
    
    private fun getHourFromTimestamp(timestamp: Long): Int {
        return java.time.Instant.ofEpochMilli(timestamp)
            .atZone(java.time.ZoneId.systemDefault())
            .hour
    }
    
    private fun formatHour(hour: Int): String {
        return String.format("%02d:00", hour)
    }
    
    fun shutdown() {
        learningScope.cancel()
    }
    
    companion object {
        private const val MAX_PATTERN_HISTORY = 1000
        private const val MIN_PATTERN_SIZE = 5
        private const val MIN_PATTERN_FREQUENCY = 3
        private const val MAX_SUGGESTIONS = 10
        private const val MAX_PREDICTIONS = 5
        private const val RECENT_ACTIONS_WINDOW = 20
        private const val PATTERN_ANALYSIS_INTERVAL = 30_000L // 30 seconds
        private const val CONTEXTUAL_LEARNING_INTERVAL = 60_000L // 1 minute
        private const val ERROR_RETRY_INTERVAL = 5_000L // 5 seconds
    }
}

// Data classes for the intelligence system
data class UserAction(
    val type: String,
    val context: String,
    val data: Map<String, String> = emptyMap(),
    val timestamp: Long = System.currentTimeMillis()
)

data class Suggestion(
    val id: String,
    val type: String,
    val title: String,
    val description: String,
    val action: String,
    var confidence: Float,
    val priority: Priority = Priority.MEDIUM
)

data class Prediction(
    val context: String,
    val nextAction: String,
    val confidence: Float,
    val timeWindow: String,
    val description: String
)

data class UserInsight(
    val type: String,
    val title: String,
    val description: String,
    val confidence: Float,
    val actionable: Boolean = false,
    val suggestions: List<String> = emptyList()
)

data class ProactiveAssistance(
    val type: String,
    val message: String,
    val action: String,
    val confidence: Float,
    val priority: Priority = Priority.MEDIUM
)

data class UserState(
    val context: String,
    val timeOfDay: String,
    val recentActions: List<String> = emptyList(),
    val emotionalState: String = "neutral"
)

data class Feedback(
    val type: FeedbackType,
    val rating: Int, // 1-5 scale
    val context: String,
    val comment: String = ""
)

data class ActionSequence(
    val name: String,
    val actions: List<String>,
    val nextPredictedAction: String,
    val confidence: Float,
    val timeWindow: String
)

enum class FeedbackType {
    POSITIVE,
    NEGATIVE,
    NEUTRAL
}

enum class Priority {
    LOW,
    MEDIUM,
    HIGH,
    URGENT
}

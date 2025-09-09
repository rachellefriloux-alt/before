/*
 * Sallie 2.0 Module
 * Persona: Tough love meets soul care.
 * Function: Demonstration of the Adaptive Learning Engine capabilities.
 * Got it, love.
 */
package com.sallie.core.learning

import com.sallie.core.memory.FileBasedMemoryStorage
import com.sallie.core.memory.HierarchicalMemorySystem
import com.sallie.core.memory.SimpleEmbeddingService
import com.sallie.core.memory.VectorMemoryIndexer
import kotlinx.coroutines.runBlocking
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.concurrent.TimeUnit

/**
 * Demonstration of the Adaptive Learning Engine's capabilities.
 * Shows how the engine learns from user interactions and generates insights.
 */
class AdaptiveLearningEngineDemo {

    /**
     * Run a comprehensive demonstration of the learning engine's features
     */
    fun runDemo() = runBlocking {
        println("Starting Adaptive Learning Engine Demo")
        println("======================================")
        
        // Initialize memory system
        val storageService = FileBasedMemoryStorage("./memory_storage")
        val embeddingService = SimpleEmbeddingService()
        val memoryIndexer = VectorMemoryIndexer(embeddingService)
        val memorySystem = HierarchicalMemorySystem(storageService, memoryIndexer)
        
        // Create learning engine with custom configuration
        val learningConfig = AdaptiveLearningEngine.LearningConfiguration(
            learningRate = 0.2f, // Higher learning rate for demo purposes
            minInteractionsForInsight = 3, // Lower threshold for demo purposes
            insightConfidenceThreshold = 0.6f,
            experimentationRate = 0.1f
        )
        
        val learningEngine = AdaptiveLearningEngine(memorySystem, learningConfig)
        
        println("\n1. Simulating initial user interactions...")
        simulateInitialInteractions(learningEngine)
        
        // Get initial learning state
        val initialState = learningEngine.learningState.value
        println("\nInitial Learning State:")
        println("- Total interactions: ${initialState.totalInteractionsObserved}")
        println("- Total insights generated: ${initialState.totalInsightsGenerated}")
        
        // Get any early insights
        val earlyInsights = learningEngine.getInsights(minConfidence = 0.5f)
        if (earlyInsights.isNotEmpty()) {
            println("\nEarly Insights (confidence >= 0.5):")
            earlyInsights.forEach { insight ->
                println("- [${insight.category}] ${insight.description} " +
                      "(Confidence: ${insight.confidence}, Level: ${insight.confidenceLevel})")
            }
        } else {
            println("\nNo significant insights generated yet.")
        }
        
        // Continue with more focused interactions
        println("\n2. Simulating more focused interactions around specific topics...")
        simulateTopicFocusedInteractions(learningEngine)
        
        // Check updated insights
        val updatedInsights = learningEngine.getInsights(minConfidence = 0.6f)
        println("\nUpdated Insights (confidence >= 0.6):")
        updatedInsights.forEach { insight ->
            println("- [${insight.category}] ${insight.description} " +
                  "(Confidence: ${insight.confidence}, Level: ${insight.confidenceLevel})")
            
            // Show some evidence for the highest confidence insights
            if (insight.confidence >= 0.7f) {
                println("  Evidence: ${insight.evidence.take(2).joinToString("; ")}")
            }
        }
        
        // Check preference models
        val preferenceModels = learningEngine.preferenceModels.value
        println("\n3. User Preference Models:")
        if (preferenceModels.isNotEmpty()) {
            preferenceModels.forEach { (category, model) ->
                println("- $category (updates: ${model.updateCount}):")
                
                // Show top preferences
                val topPreferences = model.preferences.entries
                    .sortedByDescending { it.value }
                    .take(3)
                
                topPreferences.forEach { (key, value) ->
                    println("  • $key: ${String.format("%.2f", value)}")
                }
            }
        } else {
            println("No preference models generated yet.")
        }
        
        // Start an experiment
        println("\n4. Starting a learning experiment...")
        val experiment = learningEngine.startExperiment(
            hypothesis = "User responds better to direct communication style",
            category = AdaptiveLearningEngine.LearningCategory.COMMUNICATION_STYLE,
            variants = listOf("direct", "indirect", "supportive")
        )
        
        println("Experiment started: ${experiment.id}")
        println("Hypothesis: ${experiment.hypothesis}")
        println("Testing variants: ${experiment.variants.joinToString(", ")}")
        
        // Simulate experiment feedback
        simulateExperimentFeedback(learningEngine, experiment)
        
        // Save to memory
        println("\n5. Saving learning state to memory system...")
        val saved = learningEngine.saveToMemory()
        println("Save successful: $saved")
        
        // Final statistics
        val finalState = learningEngine.learningState.value
        println("\nFinal Learning State:")
        println("- Total interactions: ${finalState.totalInteractionsObserved}")
        println("- Total insights generated: ${finalState.totalInsightsGenerated}")
        println("- Active experiments: ${finalState.activeExperiments.size}")
        
        println("\nAdaptive Learning Engine Demo Complete")
    }
    
    /**
     * Simulate initial user interactions to seed the learning engine
     */
    private suspend fun simulateInitialInteractions(learningEngine: AdaptiveLearningEngine) {
        // Simulate a series of message interactions
        val messages = listOf(
            "Hi there! I'm new to this app and trying to figure out how it works.",
            "I'm interested in improving my productivity and time management skills.",
            "Do you have any good book recommendations on personal development?",
            "I usually work out in the mornings around 7am before starting work.",
            "I've been trying meditation lately but finding it hard to stay consistent.",
            "What's the best way to track my fitness progress?",
            "I'm planning a trip to Japan next spring. Any tips on places to visit?",
            "I love cooking Italian food on weekends. Do you have any good pasta recipes?",
            "Can you remind me about my doctor's appointment tomorrow at 2pm?",
            "I prefer getting straight to the point in conversations."
        )
        
        // Process each message with some delay
        for (message in messages) {
            val interaction = AdaptiveLearningEngine.UserInteraction(
                type = AdaptiveLearningEngine.InteractionType.MESSAGE_RECEIVED,
                content = message,
                userSentiment = estimateSentiment(message)
            )
            
            learningEngine.processInteraction(interaction)
            
            // Simulate system response and user feedback occasionally
            if (Math.random() < 0.3) {
                simulateResponseAndFeedback(learningEngine, message)
            }
            
            // Simulate feature usage occasionally
            if (Math.random() < 0.2) {
                simulateFeatureUsage(learningEngine)
            }
            
            // Add a small delay to simulate real-time interactions
            TimeUnit.MILLISECONDS.sleep(50)
        }
        
        // Simulate some settings changes
        val settingsInteraction = AdaptiveLearningEngine.UserInteraction(
            type = AdaptiveLearningEngine.InteractionType.SETTING_CHANGED,
            metadata = mapOf(
                "category" to "communication",
                "setting" to "responseLength",
                "value" to "concise"
            )
        )
        learningEngine.processInteraction(settingsInteraction)
        
        // Another setting change
        val settingsInteraction2 = AdaptiveLearningEngine.UserInteraction(
            type = AdaptiveLearningEngine.InteractionType.SETTING_CHANGED,
            metadata = mapOf(
                "category" to "notifications",
                "setting" to "reminderFrequency",
                "value" to "high"
            )
        )
        learningEngine.processInteraction(settingsInteraction2)
    }
    
    /**
     * Simulate interactions focused on specific topics to establish patterns
     */
    private suspend fun simulateTopicFocusedInteractions(learningEngine: AdaptiveLearningEngine) {
        // Fitness topic interactions
        val fitnessMessages = listOf(
            "I'm trying to improve my running endurance. Any tips?",
            "Just finished a 5k run in 25 minutes! Personal best.",
            "Do you think HIIT or steady-state cardio is more effective for fat loss?",
            "I need to find a good gym near downtown.",
            "What's a good workout split for someone training 4 days a week?"
        )
        
        for (message in fitnessMessages) {
            val interaction = AdaptiveLearningEngine.UserInteraction(
                type = AdaptiveLearningEngine.InteractionType.MESSAGE_RECEIVED,
                content = message,
                userSentiment = estimateSentiment(message),
                contextualFactors = mapOf(
                    "time_of_day" to "morning",
                    "topic" to "fitness"
                )
            )
            learningEngine.processInteraction(interaction)
        }
        
        // Add positive feedback to fitness content
        val fitnessFeedback = AdaptiveLearningEngine.UserInteraction(
            type = AdaptiveLearningEngine.InteractionType.EXPLICIT_FEEDBACK,
            explicitFeedback = AdaptiveLearningEngine.ExplicitFeedback(
                rating = 5,
                feedbackText = "This workout advice was really helpful, thanks!",
                feedbackType = "content",
                targetId = "fitness_recommendation"
            )
        )
        learningEngine.processInteraction(fitnessFeedback)
        
        // Technology topic interactions
        val techMessages = listOf(
            "I'm thinking about buying a new laptop. Any recommendations?",
            "What do you think about the latest iPhone release?",
            "I'm having trouble with my WiFi connection. Any troubleshooting tips?",
            "Have you tried any good productivity apps lately?",
            "I need to learn about machine learning. Where should I start?"
        )
        
        for (message in techMessages) {
            val interaction = AdaptiveLearningEngine.UserInteraction(
                type = AdaptiveLearningEngine.InteractionType.MESSAGE_RECEIVED,
                content = message,
                userSentiment = estimateSentiment(message),
                contextualFactors = mapOf(
                    "time_of_day" to "evening",
                    "topic" to "technology"
                )
            )
            learningEngine.processInteraction(interaction)
        }
        
        // Add some mixed feedback on technology content
        val techFeedback = AdaptiveLearningEngine.UserInteraction(
            type = AdaptiveLearningEngine.InteractionType.EXPLICIT_FEEDBACK,
            explicitFeedback = AdaptiveLearningEngine.ExplicitFeedback(
                rating = 3,
                feedbackText = "This was okay, but I was hoping for more specific advice.",
                feedbackType = "content",
                targetId = "tech_recommendation"
            )
        )
        learningEngine.processInteraction(techFeedback)
        
        // Communication style preference
        val directMessages = listOf(
            "Just give me the facts, no fluff please.",
            "I prefer when you get straight to the point.",
            "Can you be more direct with your responses?"
        )
        
        for (message in directMessages) {
            val interaction = AdaptiveLearningEngine.UserInteraction(
                type = AdaptiveLearningEngine.InteractionType.MESSAGE_RECEIVED,
                content = message,
                userSentiment = 0.3f
            )
            learningEngine.processInteraction(interaction)
        }
        
        // Explicit feedback on communication style
        val toneFeedback = AdaptiveLearningEngine.UserInteraction(
            type = AdaptiveLearningEngine.InteractionType.EXPLICIT_FEEDBACK,
            explicitFeedback = AdaptiveLearningEngine.ExplicitFeedback(
                rating = 5,
                feedbackText = "I like this direct style much better!",
                feedbackType = "tone",
                targetId = "direct"
            )
        )
        learningEngine.processInteraction(toneFeedback)
        
        // Another tone feedback
        val toneFeedback2 = AdaptiveLearningEngine.UserInteraction(
            type = AdaptiveLearningEngine.InteractionType.EXPLICIT_FEEDBACK,
            explicitFeedback = AdaptiveLearningEngine.ExplicitFeedback(
                rating = 2,
                feedbackText = "This was too wordy and indirect.",
                feedbackType = "tone",
                targetId = "supportive"
            )
        )
        learningEngine.processInteraction(toneFeedback2)
    }
    
    /**
     * Simulate response to a user message and potential feedback
     */
    private suspend fun simulateResponseAndFeedback(
        learningEngine: AdaptiveLearningEngine, 
        userMessage: String
    ) {
        // Simulate system response (not actually used, just for demonstration)
        val responseType = when {
            userMessage.contains("?") -> "answer"
            userMessage.length > 100 -> "detailed_response"
            else -> "acknowledgement"
        }
        
        // Simulate user feedback
        val sentiment = estimateSentiment(userMessage)
        val rating = when {
            sentiment > 0.5 -> 5 // Very positive
            sentiment > 0.1 -> 4 // Positive
            sentiment > -0.1 -> 3 // Neutral
            sentiment > -0.5 -> 2 // Negative
            else -> 1 // Very negative
        }
        
        // Create feedback interaction
        val feedback = AdaptiveLearningEngine.UserInteraction(
            type = AdaptiveLearningEngine.InteractionType.EXPLICIT_FEEDBACK,
            explicitFeedback = AdaptiveLearningEngine.ExplicitFeedback(
                rating = rating,
                feedbackText = "This response was " + when(rating) {
                    5 -> "excellent"
                    4 -> "good"
                    3 -> "okay"
                    2 -> "not very helpful"
                    else -> "unhelpful"
                },
                feedbackType = "response",
                targetId = responseType
            )
        )
        
        learningEngine.processInteraction(feedback)
    }
    
    /**
     * Simulate feature usage
     */
    private suspend fun simulateFeatureUsage(learningEngine: AdaptiveLearningEngine) {
        val features = listOf(
            "calendar", "reminder", "notes", "voice_assistant", 
            "weather", "productivity_report", "meditation_timer"
        )
        
        val feature = features.random()
        val interaction = AdaptiveLearningEngine.UserInteraction(
            type = AdaptiveLearningEngine.InteractionType.FEATURE_USED,
            metadata = mapOf(
                "feature" to feature,
                "duration" to "${(1 + Math.random() * 5).toInt()} min"
            ),
            contextualFactors = mapOf(
                "time_of_day" to getCurrentTimePeriod()
            )
        )
        
        learningEngine.processInteraction(interaction)
    }
    
    /**
     * Simulate feedback for an experiment
     */
    private suspend fun simulateExperimentFeedback(
        learningEngine: AdaptiveLearningEngine,
        experiment: AdaptiveLearningEngine.LearningExperiment
    ) {
        // Simulate feedback for each variant
        for (variant in experiment.variants) {
            // Success is high for "direct" style, medium for "supportive", low for "indirect"
            val successRate = when (variant) {
                "direct" -> 0.9
                "supportive" -> 0.6
                "indirect" -> 0.3
                else -> 0.5
            }
            
            // Create feedback
            val rating = if (Math.random() < successRate) 5 else 2
            
            val feedback = AdaptiveLearningEngine.UserInteraction(
                type = AdaptiveLearningEngine.InteractionType.EXPLICIT_FEEDBACK,
                explicitFeedback = AdaptiveLearningEngine.ExplicitFeedback(
                    rating = rating,
                    feedbackText = if (rating == 5) 
                        "I like this $variant style" 
                    else 
                        "This $variant style isn't working well for me",
                    feedbackType = "experiment",
                    targetId = experiment.id
                ),
                metadata = mapOf(
                    "experimentId" to experiment.id,
                    "variant" to variant
                )
            )
            
            learningEngine.processInteraction(feedback)
        }
    }
    
    /**
     * Simple sentiment estimation for demo purposes
     */
    private fun estimateSentiment(text: String): Float {
        val text = text.lowercase()
        
        val positiveWords = setOf(
            "good", "great", "excellent", "amazing", "wonderful", "fantastic",
            "happy", "love", "like", "enjoy", "thanks", "thank", "best", "better",
            "helpful", "interesting", "excited", "positive"
        )
        
        val negativeWords = setOf(
            "bad", "terrible", "awful", "horrible", "poor", "worst",
            "sad", "hate", "dislike", "sorry", "frustrated", "difficult", "hard",
            "trouble", "problem", "issue", "unfortunately", "negative"
        )
        
        var score = 0.0f
        
        // Count positive and negative words
        for (word in positiveWords) {
            if (text.contains(word)) {
                score += 0.1f
            }
        }
        
        for (word in negativeWords) {
            if (text.contains(word)) {
                score -= 0.1f
            }
        }
        
        // Cap between -1 and 1
        return score.coerceIn(-1.0f, 1.0f)
    }
    
    /**
     * Get the current time period (morning, afternoon, evening, night)
     */
    private fun getCurrentTimePeriod(): String {
        val hour = LocalDateTime.now().hour
        return when {
            hour in 5..11 -> "morning"
            hour in 12..16 -> "afternoon"
            hour in 17..21 -> "evening"
            else -> "night"
        }
    }
    
    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            AdaptiveLearningEngineDemo().runDemo()
        }
    }
}

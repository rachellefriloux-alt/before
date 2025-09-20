/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * Text Input Processing Component
 */

package com.sallie.multimodal

import java.util.UUID

/**
 * Processor for text inputs that performs natural language understanding
 */
class TextInputProcessor {
    
    /**
     * Process text input and extract structured insights
     */
    suspend fun processText(text: String): InputUnderstanding {
        // In a real implementation, this would use NLP models to extract
        // intents, entities, sentiment, etc.
        
        val insights = mutableListOf<InputInsight>()
        
        // Extract intent (simplified example)
        val intent = detectIntent(text)
        insights.add(
            InputInsight(
                id = UUID.randomUUID().toString(),
                category = InsightCategory.INTENT,
                content = intent,
                confidence = 0.85f,
                source = InputType.TEXT
            )
        )
        
        // Extract entities (simplified example)
        val entities = extractEntities(text)
        entities.forEach { entity ->
            insights.add(
                InputInsight(
                    id = UUID.randomUUID().toString(),
                    category = InsightCategory.ENTITY,
                    content = entity,
                    confidence = 0.8f,
                    source = InputType.TEXT
                )
            )
        }
        
        // Extract sentiment (simplified example)
        val sentiment = analyzeSentiment(text)
        insights.add(
            InputInsight(
                id = UUID.randomUUID().toString(),
                category = InsightCategory.SENTIMENT,
                content = sentiment,
                confidence = 0.75f,
                source = InputType.TEXT
            )
        )
        
        // Extract topics (simplified example)
        val topics = identifyTopics(text)
        topics.forEach { topic ->
            insights.add(
                InputInsight(
                    id = UUID.randomUUID().toString(),
                    category = InsightCategory.TOPIC,
                    content = topic,
                    confidence = 0.7f,
                    source = InputType.TEXT
                )
            )
        }
        
        return InputUnderstanding(
            id = UUID.randomUUID().toString(),
            inputType = InputType.TEXT,
            status = UnderstandingStatus.UNDERSTOOD,
            insights = insights,
            confidence = 0.8f,
            timestamp = System.currentTimeMillis()
        )
    }
    
    /**
     * Detect the intent of the text
     */
    private fun detectIntent(text: String): String {
        // In a real implementation, this would use a trained intent classifier
        
        return when {
            text.contains("weather", ignoreCase = true) -> "GET_WEATHER"
            text.contains("time", ignoreCase = true) -> "GET_TIME"
            text.contains("help", ignoreCase = true) -> "REQUEST_HELP"
            text.contains("thank", ignoreCase = true) -> "EXPRESS_GRATITUDE"
            text.contains("hello", ignoreCase = true) || 
                    text.contains("hi ", ignoreCase = true) ||
                    text.startsWith("hi", ignoreCase = true) -> "GREETING"
            text.contains("bye", ignoreCase = true) -> "FAREWELL"
            text.contains("how are you", ignoreCase = true) -> "ASK_WELLBEING"
            text.contains("what can you do", ignoreCase = true) -> "CAPABILITY_INQUIRY"
            text.contains("name is", ignoreCase = true) -> "INTRODUCE_SELF"
            else -> "GENERAL_QUERY"
        }
    }
    
    /**
     * Extract entities from the text
     */
    private fun extractEntities(text: String): List<String> {
        // In a real implementation, this would use NER (Named Entity Recognition)
        
        val entities = mutableListOf<String>()
        
        // Simple regex patterns to detect some common entities (very simplified)
        
        // Look for dates
        val datePattern = Regex(
            "(\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4})|(January|February|March|April|May|June|July|August|September|October|November|December)\\s+\\d{1,2}(st|nd|rd|th)?(,\\s+\\d{4})?",
            RegexOption.IGNORE_CASE
        )
        datePattern.findAll(text).forEach {
            entities.add("DATE: ${it.value}")
        }
        
        // Look for times
        val timePattern = Regex(
            "\\d{1,2}:\\d{2}\\s*(am|pm)?",
            RegexOption.IGNORE_CASE
        )
        timePattern.findAll(text).forEach {
            entities.add("TIME: ${it.value}")
        }
        
        // Look for locations
        val locationPattern = Regex(
            "in\\s+(\\w+\\s*)+(city|town|village|country|state|province|county)",
            RegexOption.IGNORE_CASE
        )
        locationPattern.findAll(text).forEach {
            entities.add("LOCATION: ${it.value.substring(3)}")
        }
        
        // Look for names (very simplified)
        val namePattern = Regex(
            "\\b[A-Z][a-z]+\\s+[A-Z][a-z]+\\b"
        )
        namePattern.findAll(text).forEach {
            entities.add("PERSON: ${it.value}")
        }
        
        return entities
    }
    
    /**
     * Analyze the sentiment of the text
     */
    private fun analyzeSentiment(text: String): String {
        // In a real implementation, this would use a sentiment analysis model
        
        // Simple keyword-based sentiment analysis (very simplified)
        val positiveWords = setOf(
            "good", "great", "excellent", "amazing", "wonderful", "fantastic",
            "happy", "joy", "love", "like", "beautiful", "best", "awesome"
        )
        
        val negativeWords = setOf(
            "bad", "terrible", "awful", "horrible", "poor", "worst",
            "hate", "dislike", "sad", "unhappy", "disappointed", "angry"
        )
        
        val words = text.lowercase().split(Regex("\\W+"))
        val positiveCount = words.count { it in positiveWords }
        val negativeCount = words.count { it in negativeWords }
        
        return when {
            positiveCount > negativeCount -> "POSITIVE"
            negativeCount > positiveCount -> "NEGATIVE"
            positiveCount > 0 || negativeCount > 0 -> "MIXED"
            else -> "NEUTRAL"
        }
    }
    
    /**
     * Identify topics in the text
     */
    private fun identifyTopics(text: String): List<String> {
        // In a real implementation, this would use topic modeling or keyword extraction
        
        // Simple keyword-based topic identification (very simplified)
        val topicKeywords = mapOf(
            "WEATHER" to setOf("weather", "rain", "sunny", "cloudy", "forecast", "temperature"),
            "TECHNOLOGY" to setOf("computer", "phone", "app", "software", "hardware", "tech"),
            "FOOD" to setOf("food", "eat", "meal", "restaurant", "cooking", "recipe"),
            "TRAVEL" to setOf("travel", "trip", "vacation", "flight", "hotel", "destination"),
            "HEALTH" to setOf("health", "doctor", "exercise", "diet", "fitness", "medical"),
            "ENTERTAINMENT" to setOf("movie", "show", "music", "book", "game", "entertainment")
        )
        
        val lowercaseText = text.lowercase()
        
        return topicKeywords
            .filter { (_, keywords) -> keywords.any { lowercaseText.contains(it) } }
            .map { it.key }
    }
}

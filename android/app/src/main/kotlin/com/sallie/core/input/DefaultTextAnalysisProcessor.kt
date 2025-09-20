package com.sallie.core.input

import com.sallie.ai.nlpEngine
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.regex.Pattern
import kotlin.math.abs

/**
 * Sallie's Text Analysis Processor Implementation
 * 
 * This class provides natural language processing capabilities for analyzing
 * text input, including entity extraction, sentiment analysis, and topic extraction.
 */
class DefaultTextAnalysisProcessor(
    private val nlpEngine: com.sallie.ai.nlpEngine
) : TextAnalysisProcessor {

    // Common patterns for entity extraction fallbacks
    private val emailPattern = Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}")
    private val phonePattern = Pattern.compile("(\\+\\d{1,2}\\s?)?\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4}")
    private val urlPattern = Pattern.compile("(https?|ftp)://[^\\s/$.?#].[^\\s]*")
    
    // Common name prefixes and suffixes for person name detection fallback
    private val nameIndicators = listOf(
        "Mr.", "Mrs.", "Ms.", "Dr.", "Prof.", "Sir", "Madam", "Miss", "Jr.", "Sr."
    )
    
    // Positive and negative word lists for sentiment analysis fallback
    private val positiveWords = setOf(
        "good", "great", "excellent", "amazing", "wonderful", "fantastic", "terrific", "outstanding",
        "superb", "brilliant", "spectacular", "impressive", "fabulous", "incredible", "awesome",
        "perfect", "happy", "glad", "pleased", "delighted", "satisfied", "love", "like", "enjoy"
    )
    
    private val negativeWords = setOf(
        "bad", "awful", "terrible", "horrible", "disappointing", "poor", "mediocre", "lousy", 
        "atrocious", "unacceptable", "substandard", "inadequate", "inferior", "unsatisfactory",
        "sad", "angry", "upset", "frustrated", "annoyed", "dislike", "hate", "displeased"
    )
    
    override suspend fun extractEntities(text: String): List<Entity> {
        return withContext(Dispatchers.Default) {
            try {
                // Try using the NLP engine first
                val nlpEntities = nlpEngine.extractEntities(text)
                
                // Map NLP entities to our model
                val entities = nlpEntities.map { nlpEntity ->
                    Entity(
                        text = nlpEntity.text,
                        type = mapEntityType(nlpEntity.type),
                        startPosition = nlpEntity.startOffset,
                        endPosition = nlpEntity.endOffset,
                        confidence = nlpEntity.confidence ?: 0.8f,
                        metadata = nlpEntity.metadata?.toMap() ?: emptyMap()
                    )
                }
                
                // If NLP engine failed to extract entities, use fallback
                if (entities.isEmpty()) {
                    fallbackEntityExtraction(text)
                } else {
                    entities
                }
            } catch (e: Exception) {
                // Use fallback entity extraction if NLP engine fails
                fallbackEntityExtraction(text)
            }
        }
    }
    
    override suspend fun analyzeSentiment(text: String): Sentiment? {
        return withContext(Dispatchers.Default) {
            try {
                // Try using the NLP engine first
                val nlpSentiment = nlpEngine.analyzeSentiment(text)
                
                // Map NLP sentiment to our model
                Sentiment(
                    score = nlpSentiment.score,
                    magnitude = nlpSentiment.magnitude,
                    language = nlpSentiment.language
                )
            } catch (e: Exception) {
                // Use fallback sentiment analysis if NLP engine fails
                fallbackSentimentAnalysis(text)
            }
        }
    }
    
    override suspend fun extractTopics(text: String): List<Topic> {
        return withContext(Dispatchers.Default) {
            try {
                // Try using the NLP engine first
                val nlpTopics = nlpEngine.extractTopics(text)
                
                // Map NLP topics to our model
                nlpTopics.map { nlpTopic ->
                    Topic(
                        name = nlpTopic.name,
                        confidence = nlpTopic.confidence ?: 0.7f,
                        keywords = nlpTopic.keywords ?: emptyList()
                    )
                }
            } catch (e: Exception) {
                // Use fallback topic extraction if NLP engine fails
                fallbackTopicExtraction(text)
            }
        }
    }
    
    /**
     * Map entity types from NLP engine to our standard types
     */
    private fun mapEntityType(type: String): String {
        return when (type.uppercase()) {
            "PERSON" -> "PERSON"
            "LOCATION", "ADDRESS", "GPE", "LOC" -> "LOCATION"
            "ORGANIZATION", "ORG" -> "ORGANIZATION"
            "DATE", "TIME", "DATETIME" -> "DATETIME"
            "MONEY", "CURRENCY" -> "MONEY"
            "PERCENT" -> "PERCENT"
            "PHONE", "PHONE_NUMBER" -> "PHONE_NUMBER"
            "EMAIL" -> "EMAIL"
            "URL", "URI" -> "URL"
            "PRODUCT" -> "PRODUCT"
            else -> type
        }
    }
    
    /**
     * Fallback entity extraction using regex patterns
     */
    private fun fallbackEntityExtraction(text: String): List<Entity> {
        val entities = mutableListOf<Entity>()
        
        // Extract emails
        val emailMatcher = emailPattern.matcher(text)
        while (emailMatcher.find()) {
            val email = emailMatcher.group()
            entities.add(
                Entity(
                    text = email,
                    type = "EMAIL",
                    startPosition = emailMatcher.start(),
                    endPosition = emailMatcher.end(),
                    confidence = 0.9f
                )
            )
        }
        
        // Extract phone numbers
        val phoneMatcher = phonePattern.matcher(text)
        while (phoneMatcher.find()) {
            val phone = phoneMatcher.group()
            entities.add(
                Entity(
                    text = phone,
                    type = "PHONE_NUMBER",
                    startPosition = phoneMatcher.start(),
                    endPosition = phoneMatcher.end(),
                    confidence = 0.8f
                )
            )
        }
        
        // Extract URLs
        val urlMatcher = urlPattern.matcher(text)
        while (urlMatcher.find()) {
            val url = urlMatcher.group()
            entities.add(
                Entity(
                    text = url,
                    type = "URL",
                    startPosition = urlMatcher.start(),
                    endPosition = urlMatcher.end(),
                    confidence = 0.9f
                )
            )
        }
        
        // Try to extract person names (very basic approach)
        for (indicator in nameIndicators) {
            val index = text.indexOf(indicator)
            if (index >= 0) {
                // Find the end of the potential name (end of word or end of sentence)
                var endIndex = text.indexOf(' ', index + indicator.length)
                if (endIndex < 0) endIndex = text.indexOf('.', index + indicator.length)
                if (endIndex < 0) endIndex = text.length
                
                // Extract the potential name
                val name = text.substring(index, endIndex).trim()
                if (name.length > indicator.length) {
                    entities.add(
                        Entity(
                            text = name,
                            type = "PERSON",
                            startPosition = index,
                            endPosition = endIndex,
                            confidence = 0.6f
                        )
                    )
                }
            }
        }
        
        return entities
    }
    
    /**
     * Fallback sentiment analysis using word lists
     */
    private fun fallbackSentimentAnalysis(text: String): Sentiment {
        // Split text into words and convert to lowercase
        val words = text.split(" ", ".", ",", "!", "?", ";", ":")
            .map { it.trim().lowercase() }
            .filter { it.isNotEmpty() }
        
        var positiveCount = 0
        var negativeCount = 0
        
        // Count positive and negative words
        for (word in words) {
            if (positiveWords.contains(word)) {
                positiveCount++
            } else if (negativeWords.contains(word)) {
                negativeCount++
            }
        }
        
        // Calculate sentiment score (-1.0 to 1.0)
        val totalWords = words.size.toFloat()
        val score = if (totalWords > 0) {
            (positiveCount - negativeCount) / totalWords
        } else {
            0.0f
        }
        
        // Calculate magnitude (0.0 to 1.0)
        val magnitude = if (totalWords > 0) {
            (positiveCount + negativeCount) / totalWords
        } else {
            0.0f
        }
        
        return Sentiment(
            score = score.coerceIn(-1.0f, 1.0f),
            magnitude = magnitude.coerceIn(0.0f, 1.0f),
            language = "en"
        )
    }
    
    /**
     * Fallback topic extraction using word frequency
     */
    private fun fallbackTopicExtraction(text: String): List<Topic> {
        // Split text into words and convert to lowercase
        val words = text.split(" ", ".", ",", "!", "?", ";", ":")
            .map { it.trim().lowercase() }
            .filter { it.isNotEmpty() }
            .filter { it.length > 3 } // Filter out short words
            .filter { it !in setOf("this", "that", "with", "from", "your", "have", "what", "about", "which") } // Filter common words
        
        // Count word frequency
        val wordFrequency = mutableMapOf<String, Int>()
        for (word in words) {
            wordFrequency[word] = (wordFrequency[word] ?: 0) + 1
        }
        
        // Sort by frequency
        val sortedWords = wordFrequency.entries
            .sortedByDescending { it.value }
            .take(5) // Take top 5 words
            .filter { it.value > 1 } // Only include words that appear more than once
        
        // Create topics from most frequent words
        return sortedWords.mapIndexed { index, entry ->
            Topic(
                name = entry.key,
                confidence = (1.0f - (0.1f * index)).coerceIn(0.5f, 0.9f), // Decrease confidence for lower ranked topics
                keywords = listOf(entry.key)
            )
        }
    }
}

/*
 * Sallie 2.0 Module
 * Function: Basic embedding service for vector representations of memory content
 */
package com.sallie.core.memory

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlin.math.sqrt
import kotlin.random.Random

/**
 * SimpleEmbeddingService provides a basic implementation of the EmbeddingService interface
 * for generating vector embeddings of text content.
 * 
 * In a production environment, this would be replaced with a more sophisticated embedding
 * service using NLP models (like BERT, GPT, etc.). This implementation provides a simplified
 * approach that generates embeddings based on simple text characteristics.
 */
class SimpleEmbeddingService : VectorMemoryIndexer.EmbeddingService {
    
    private val embeddingSize = 128
    private val stopWords = setOf("the", "and", "a", "an", "in", "on", "at", "to", "for", "with", "by")
    private val seed = 42
    private val random = Random(seed)
    
    // Cache of word -> embedding vector
    private val wordEmbeddingCache = mutableMapOf<String, FloatArray>()
    
    override suspend fun generateEmbedding(text: String): FloatArray? = withContext(Dispatchers.Default) {
        if (text.isBlank()) return@withContext null
        
        val words = tokenize(text)
        if (words.isEmpty()) return@withContext null
        
        // Create a combined embedding from individual word embeddings
        val embedding = FloatArray(embeddingSize) { 0f }
        
        for (word in words) {
            val wordEmbedding = getWordEmbedding(word)
            for (i in 0 until embeddingSize) {
                embedding[i] += wordEmbedding[i]
            }
        }
        
        // Normalize the embedding to unit length
        normalize(embedding)
        
        embedding
    }
    
    /**
     * Generate a consistent embedding for a word
     */
    private fun getWordEmbedding(word: String): FloatArray {
        // Return from cache if available
        wordEmbeddingCache[word]?.let { return it }
        
        // Generate a deterministic embedding based on the word
        val embedding = FloatArray(embeddingSize)
        
        // Use word as seed for deterministic randomness
        val wordSeed = word.hashCode()
        val wordRandom = Random(wordSeed)
        
        for (i in 0 until embeddingSize) {
            embedding[i] = (wordRandom.nextFloat() * 2) - 1 // Range: -1 to 1
        }
        
        normalize(embedding)
        
        // Cache the result
        wordEmbeddingCache[word] = embedding
        
        return embedding
    }
    
    /**
     * Normalize a vector to unit length
     */
    private fun normalize(vector: FloatArray) {
        var sumOfSquares = 0f
        for (value in vector) {
            sumOfSquares += value * value
        }
        
        val magnitude = sqrt(sumOfSquares)
        if (magnitude > 0) {
            for (i in vector.indices) {
                vector[i] /= magnitude
            }
        }
    }
    
    /**
     * Tokenize text into meaningful words
     */
    private fun tokenize(text: String): List<String> {
        return text.lowercase()
            .replace(Regex("[^a-z0-9\\s]"), " ")
            .split(Regex("\\s+"))
            .filter { it.length > 2 && it !in stopWords }
    }
}

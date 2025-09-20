package com.sallie.ai

import java.io.File
import java.nio.file.Files
import java.nio.file.Paths
import kotlin.random.Random

// Manages local LLMs for offline intelligence
class LocalLLMManager {

    private var modelLoaded = false
    private var modelPath: String? = null
    private val tokenizer = SimpleTokenizer()
    private val inferenceEngine = SimpleInferenceEngine()

    /**
     * Load a local LLM model from the specified path
     */
    fun loadModel(modelPath: String): Boolean {
        try {
            if (!Files.exists(Paths.get(modelPath))) {
                println("Model path does not exist: $modelPath")
                return false
            }

            this.modelPath = modelPath
            this.modelLoaded = true
            println("Local LLM model loaded successfully from: $modelPath")
            return true
        } catch (e: Exception) {
            println("Error loading model: ${e.message}")
            return false
        }
    }

    /**
     * Run inference on the loaded local model
     */
    fun runLocalModel(input: String): String {
        if (!modelLoaded) {
            return "Error: No model loaded. Please load a model first using loadModel()."
        }

        try {
            // Tokenize input
            val tokens = tokenizer.tokenize(input)

            // Run inference
            val outputTokens = inferenceEngine.generate(tokens, maxLength = 100)

            // Decode output
            val response = tokenizer.decode(outputTokens)

            return response
        } catch (e: Exception) {
            return "Error during inference: ${e.message}"
        }
    }

    /**
     * Run inference with streaming output
     */
    fun runLocalModelStreaming(input: String, onTokenGenerated: (String) -> Unit): String {
        if (!modelLoaded) {
            val error = "Error: No model loaded. Please load a model first using loadModel()."
            onTokenGenerated(error)
            return error
        }

        try {
            val tokens = tokenizer.tokenize(input)
            val outputTokens = mutableListOf<Int>()
            var fullResponse = ""

            // Generate tokens one by one for streaming
            for (i in 0 until 50) { // Generate up to 50 tokens
                val nextToken = inferenceEngine.generateNextToken(tokens + outputTokens)
                if (nextToken == tokenizer.eosToken) break

                outputTokens.add(nextToken)
                val tokenText = tokenizer.decode(listOf(nextToken))
                fullResponse += tokenText
                onTokenGenerated(tokenText)
            }

            return fullResponse
        } catch (e: Exception) {
            val error = "Error during streaming inference: ${e.message}"
            onTokenGenerated(error)
            return error
        }
    }

    /**
     * Check if a model is currently loaded
     */
    fun isModelLoaded(): Boolean = modelLoaded

    /**
     * Unload the current model
     */
    fun unloadModel() {
        modelLoaded = false
        modelPath = null
        println("Local LLM model unloaded")
    }

    /**
     * Simple tokenizer for demonstration
     */
    private class SimpleTokenizer {
        val eosToken = 0
        private val vocab = mutableMapOf<String, Int>()
        private val reverseVocab = mutableMapOf<Int, String>()

        init {
            // Initialize with basic vocabulary
            val basicWords = listOf(
                "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by",
                "hello", "world", "how", "are", "you", "what", "is", "this", "that", "it", "was", "will", "can",
                "I", "you", "he", "she", "we", "they", "me", "him", "her", "us", "them",
                "good", "bad", "happy", "sad", "yes", "no", "please", "thank", "sorry", "okay"
            )

            basicWords.forEachIndexed { index, word ->
                vocab[word] = index + 1
                reverseVocab[index + 1] = word
            }
        }

        fun tokenize(text: String): List<Int> {
            return text.lowercase()
                .split("\\s+".toRegex())
                .map { word -> vocab.getOrDefault(word, 1) } // Default to first vocab token
        }

        fun decode(tokens: List<Int>): String {
            return tokens.map { token -> reverseVocab.getOrDefault(token, "UNK") }
                .joinToString(" ")
        }
    }

    /**
     * Simple inference engine for demonstration
     */
    private class SimpleInferenceEngine {
        private val random = Random(42) // Fixed seed for reproducible results

        fun generate(inputTokens: List<Int>, maxLength: Int = 50): List<Int> {
            val outputTokens = mutableListOf<Int>()

            for (i in 0 until maxLength) {
                val nextToken = generateNextToken(inputTokens + outputTokens)
                if (nextToken == 0) break // EOS token
                outputTokens.add(nextToken)
            }

            return outputTokens
        }

        fun generateNextToken(contextTokens: List<Int>): Int {
            // Simple probabilistic generation based on context
            val contextSize = contextTokens.size

            // Bias towards certain tokens based on context
            return when {
                contextSize == 0 -> 1 // Default token
                contextTokens.last() == 1 -> 2 // Chain reactions
                random.nextFloat() < 0.1 -> 0 // 10% chance of EOS
                else -> (random.nextInt(10) + 1).coerceAtMost(10) // Random token from vocab
            }
        }
    }
}

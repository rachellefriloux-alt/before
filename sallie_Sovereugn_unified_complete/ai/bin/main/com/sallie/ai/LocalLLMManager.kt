package com.sallie.ai

// Manages local LLMs for offline intelligence
class LocalLLMManager {
    /**
     * TODO Implement actual local inference pipeline (model load, tokenize, run, stream output).
     * Kept simple for now to allow upstream orchestration & UI work without blocking.
     */
    fun runLocalModel(input: String): String = "Local LLM response for: $input"
}

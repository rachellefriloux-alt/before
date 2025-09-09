package com.sallie.ai

// Routes requests to Gemini, ChatGPT, Copilot, or local LLM
class AIModelRouter {
    enum class Model { GEMINI, CHATGPT, COPILOT, LOCAL }

    fun selectModel(intent: String): Model = when {
        intent.contains("code", true) -> Model.COPILOT
        intent.contains("chat", true) -> Model.CHATGPT
        intent.contains("search", true) -> Model.GEMINI
        else -> Model.LOCAL
    }
}

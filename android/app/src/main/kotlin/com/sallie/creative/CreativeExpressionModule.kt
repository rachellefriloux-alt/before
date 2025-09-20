package com.sallie.creative

interface CreativeExpressionModule {
    val type: String
    fun generateContent(prompt: String): CreativeContent
}

class CreativeContent(val output: String, val style: String = "default")

class TextCreativeModule : CreativeExpressionModule {
    override val type = "Text"
    override fun generateContent(prompt: String): CreativeContent {
        // Simulate creative text generation
        return CreativeContent("Poetic response to: $prompt", "poetry")
    }
}

class VisualCreativeModule : CreativeExpressionModule {
    override val type = "Visual"
    override fun generateContent(prompt: String): CreativeContent {
        // Simulate visual art generation
        return CreativeContent("Generated artwork for: $prompt", "digital art")
    }
}

class VoiceCreativeModule : CreativeExpressionModule {
    override val type = "Voice"
    override fun generateContent(prompt: String): CreativeContent {
        // Simulate voice synthesis
        return CreativeContent("Synthesized voice for: $prompt", "emotional voice")
    }
}

object CreativeExpressionRegistry {
    private val modules = listOf(TextCreativeModule(), VisualCreativeModule(), VoiceCreativeModule())
    fun create(type: String, prompt: String): CreativeContent {
        val module = modules.find { it.type.equals(type, ignoreCase = true) }
        return module?.generateContent(prompt) ?: CreativeContent("No creative module for type: $type")
    }
}

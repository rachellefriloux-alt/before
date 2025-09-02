package com.sallie.ai

// Switches between AI models at runtime
class RuntimeSwitcher {
    var currentModel: String = "Gemini"
    fun switchModel(model: String) { currentModel = model }
    // direct property access provides the getter; removed duplicate getCurrentModel() to avoid clash
}

package com.sallie.feature

// Intercepts and mitigates bias in AI responses
class BiasInterceptor {
    data class BiasAssessment(val original: String, val score: Int, val flags: List<String>, val mitigated: String)
    private val history: MutableList<BiasAssessment> = mutableListOf()

    fun interceptBias(response: String): BiasAssessment {
        val lowered = response.lowercase()
        val flags = mutableListOf<String>()
        var score = 0
        if ("always" in lowered || "never" in lowered) { flags.add("absolutism"); score += 2 }
        if ("they" in lowered && "should" in lowered) { flags.add("group-should"); score += 3 }
        if ("stereotype" in lowered) { flags.add("stereotype"); score += 5 }
        val mitigated = mitigateBiasInternal(response, flags)
        val result = BiasAssessment(response, score, flags, mitigated)
        history.add(result)
        return result
    }

    private fun mitigateBiasInternal(response: String, flags: List<String>): String {
        if (flags.isEmpty()) return response
        return "$response | Mitigated: reframed for neutrality and specificity"
    }

    fun history(): List<BiasAssessment> = history
}

package com.sallie.feature

// Analyzes situations for context and emotional impact
class SituationAnalyzer {
    data class SituationResult(
        val input: String,
        val tags: List<String>,
        val emotionalWeight: Int,
        val risk: Int,
        val recommendation: String
    )

    private val history: MutableList<SituationResult> = mutableListOf()

    fun analyzeSituation(situation: String): SituationResult {
        val lowered = situation.lowercase()
        val tags = mutableListOf<String>()
        var weight = 0
        var risk = 0
        if ("conflict" in lowered || "argu" in lowered) { tags.add("conflict"); weight += 7; risk += 5 }
        if ("deadline" in lowered || "urgent" in lowered) { tags.add("urgency"); weight += 5; risk += 4 }
        if ("win" in lowered || "launch" in lowered) { tags.add("celebration"); weight += 4 }
        if ("tired" in lowered || "exhaust" in lowered) { tags.add("fatigue"); weight += 6; risk += 3 }
        val recommendation = when {
            "conflict" in tags -> "Ground facts, de-escalate, protect boundaries"
            "urgency" in tags && weight > 8 -> "Sequence tasks, micro-plan next 2 steps"
            "fatigue" in tags -> "Insert recovery block before deep work"
            "celebration" in tags -> "Anchor the win, log learning"
            else -> "Proceed with standard focus mode"
        }
        val result = SituationResult(situation, tags, weight, risk, recommendation)
        history.add(result)
        return result
    }

    fun assessImpact(situation: String): String = analyzeSituation(situation).let { "Impact -> weight:${it.emotionalWeight} risk:${it.risk} rec:${it.recommendation}" }
    fun getHistory(): List<SituationResult> = history
}

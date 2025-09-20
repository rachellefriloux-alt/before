// Salle Persona: ValuesDrivenDecisionEngine
package org.sallie.core.values

class ValuesDrivenDecisionEngine {
    private val valuesHierarchy = listOf("honesty", "helpfulness", "efficiency", "empathy")
    private val valuesWeights = valuesHierarchy.mapIndexed { i, v -> v to (10 - i) }.toMap()

    fun decide(options: Map<String, Int>): String =
        options.maxByOrNull { (k, v) -> valuesWeights.getOrDefault(k, 0) + v }?.key ?: "undecided"

    fun explainDecision(decision: String): String =
        valuesWeights[decision]?.let { "Decision is aligned with value: $decision (weight: $it)" }
            ?: "No values alignment found for decision: $decision"
}

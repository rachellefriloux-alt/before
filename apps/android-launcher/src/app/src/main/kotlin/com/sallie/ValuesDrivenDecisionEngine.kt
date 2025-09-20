/*
 * Persona: Tough love meets soul care.
 * Module: ValuesDrivenDecisionEngine
 * Intent: Handle functionality for ValuesDrivenDecisionEngine
 * Provenance-ID: 8982f92f-a6c3-4eb4-bb00-99fbc2851af8
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

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

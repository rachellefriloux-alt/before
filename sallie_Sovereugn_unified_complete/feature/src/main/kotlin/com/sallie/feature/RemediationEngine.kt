package com.sallie.feature

// Maps device state fragments to recommended remediation actions.
object RemediationEngine {
    private val rules: List<Pair<Regex, String>> = listOf(
        Regex("battery=low") to "Reduce screen brightness and close background apps",
        Regex("network=offline") to "Enable Wi‑Fi or mobile data to restore connectivity",
        Regex("thermal=hot") to "Pause intensive tasks to cool device",
        Regex("battery=medium;.*thermal=hot") to "Consider enabling battery saver while cooling"
    )

    fun suggest(state: String): String {
        val matches = rules.filter { it.first.containsMatchIn(state) }.map { it.second }
        if (matches.isEmpty()) return "All systems nominal"
        return matches.joinToString(" | ")
    }
}

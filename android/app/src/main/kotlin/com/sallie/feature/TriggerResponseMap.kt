package com.sallie.feature

// Maps triggers to responses for emotional intelligence
class TriggerResponseMap {
    data class TriggerEntry(val trigger: String, val response: String, val priority: Int)
    private val entries: MutableList<TriggerEntry> = mutableListOf()
    private val lookup: MutableMap<String, TriggerEntry> = mutableMapOf()

    fun addTrigger(trigger: String, response: String, priority: Int = 0) {
        val entry = TriggerEntry(trigger, response, priority)
        entries.add(entry)
        lookup[trigger] = entry
    }

    fun getResponse(trigger: String): String {
        lookup[trigger]?.let { return it.response }
        // Fuzzy fallback
        val lowered = trigger.lowercase()
        val candidate = entries
            .filter { lowered.contains(it.trigger.lowercase()) }
            .maxByOrNull { it.priority }
        return candidate?.response ?: "No response found"
    }

    fun listTriggers(): List<TriggerEntry> = entries.sortedByDescending { it.priority }
}

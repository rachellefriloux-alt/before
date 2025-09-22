package com.sallie.feature

// Logs impact of actions and decisions
class ImpactLog {
    data class ImpactEntry(val action: String, val impact: String, val category: String, val timestamp: Long)
    private val log = mutableListOf<ImpactEntry>()

    fun addImpact(action: String, impact: String, category: String = "general") {
        log.add(ImpactEntry(action, impact, category, System.currentTimeMillis()))
    }

    fun getLog(): List<ImpactEntry> = log
    fun filterByCategory(category: String): List<ImpactEntry> = log.filter { it.category == category }
    fun recent(limit: Int = 10): List<ImpactEntry> = log.takeLast(limit)
}

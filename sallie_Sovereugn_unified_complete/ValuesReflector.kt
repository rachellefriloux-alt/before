package com.sallie.feature

// Reflects user values and philosophy
class ValuesReflector {
    private var values = listOf<String>()
    private val history: MutableList<List<String>> = mutableListOf()

    fun updateValues(newValues: List<String>) {
        history.add(newValues)
        values = newValues
    }

    fun reflect(): String = "Values: ${values.joinToString()}"
    fun getHistory(): List<List<String>> = history
    fun deltaFromPrevious(): List<String> = if (history.size < 2) emptyList() else history[history.size - 1] - history[history.size - 2].toSet()
    fun alignmentScore(target: List<String>): Int = values.count { target.contains(it) }
}

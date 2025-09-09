package com.sallie.feature

/** Basic in-memory NLP utilities (lightweight, offline) */
object NLPEngine {
    private val stopWords = setOf("the", "and", "a", "to", "of", "in", "is", "it", "for", "on", "that", "this")

    fun summarize(text: String, maxSentences: Int = 2): String {
        if (text.isBlank()) return ""
        val sentences = text.split('.', '!', '?').map { it.trim() }.filter { it.isNotEmpty() }
        return sentences.take(maxSentences).joinToString(". ").let { if (it.isNotEmpty()) "$it." else it }
    }

    fun keywords(text: String, top: Int = 5): List<String> {
        val freq = mutableMapOf<String, Int>()
        text.lowercase().split(" ", "\n", "\t", ",", ".", ";", ":").forEach { raw ->
            val w = raw.filter { it.isLetter() }
            if (w.length > 2 && w !in stopWords) freq[w] = (freq[w] ?: 0) + 1
        }
        return freq.entries.sortedByDescending { it.value }.take(top).map { it.key }
    }

    fun sentiment(text: String): Double { // naive sentiment score [-1,1]
        val positive = listOf("love", "great", "happy", "calm", "progress", "win")
        val negative = listOf("sad", "tired", "angry", "blocked", "fail", "stress")
        val words = text.lowercase().split(" ")
        val score = words.count { it in positive } - words.count { it in negative }
        return (score.toDouble() / (words.size.coerceAtLeast(1))).coerceIn(-1.0, 1.0)
    }
}

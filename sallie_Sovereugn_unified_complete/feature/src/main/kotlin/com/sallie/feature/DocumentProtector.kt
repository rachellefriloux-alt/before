package com.sallie.feature

// Tags, summarizes, and protects documents
class DocumentProtector {
    data class DocSummary(val originalLength: Int, val summary: String, val compressionRatio: Double, val tags: List<String>)

    private val tagIndex: MutableMap<String, MutableSet<String>> = mutableMapOf()
    private val summaryHistory: MutableList<DocSummary> = mutableListOf()
    private val redactionLog: MutableList<String> = mutableListOf()

    fun tagDocument(docId: String, tag: String): String {
        val set = tagIndex.getOrPut(tag) { mutableSetOf() }
        set.add(docId)
        return "Document $docId tagged with $tag"
    }

    fun summarize(doc: String, tags: List<String> = emptyList()): DocSummary {
        val raw = NLPEngine.summarize(doc)
        val summary = raw.trim()
        val result = DocSummary(doc.length, summary, if (doc.isNotEmpty()) summary.length.toDouble() / doc.length else 1.0, tags)
        summaryHistory.add(result)
        return result
    }

    fun redact(doc: String): String {
        redactionLog.add("Redacted at ${System.currentTimeMillis()} len=${doc.length}")
        return "[REDACTED]"
    }

    fun docsForTag(tag: String): Set<String> = tagIndex[tag] ?: emptySet()
    fun getSummaryHistory(): List<DocSummary> = summaryHistory
    fun getRedactionLog(): List<String> = redactionLog
}

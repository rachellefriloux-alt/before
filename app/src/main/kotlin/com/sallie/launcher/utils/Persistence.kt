package com.sallie.launcher

import android.content.Context

class SalliePersistence(context: Context) {
    private val prefs = context.getSharedPreferences("sallie_state", Context.MODE_PRIVATE)

    fun saveMood(mood: String) = prefs.edit().apply { putString("mood", mood) }.apply()

    fun loadMood(): String? = prefs.getString("mood", null)

    fun saveFatigue(f: Int) = prefs.edit().apply { putInt("fatigue", f) }.apply()

    fun loadFatigue(): Int? = if (prefs.contains("fatigue")) prefs.getInt("fatigue", 0) else null

    fun saveTheme(theme: String) = prefs.edit().apply { putString("theme", theme) }.apply()

    fun loadTheme(): String? = prefs.getString("theme", null)

    fun saveTasks(ids: List<String>) = prefs.edit().apply { putString("tasks", ids.joinToString(",")) }.apply()

    fun loadTasks(): List<String> = prefs.getString("tasks", "")?.split(",")?.filter { it.isNotBlank() } ?: emptyList()

    fun saveConversationEntries(entries: List<ConversationEntry>) = prefs.edit().apply {
        val serialized = entries.joinToString("\n") { e ->
            listOf(
                e.timestamp.toString(),
                e.speaker.replace("\n", " "),
                e.text.replace("\n", " ")
            ).joinToString("|")
        }
        putString("conversation_entries", serialized)
    }.apply()

    fun loadConversationEntries(): List<ConversationEntry> =
        prefs.getString("conversation_entries", null)
            ?.lineSequence()
            ?.mapNotNull { line ->
                val parts = line.split("|")
                if (parts.size < 3) null else ConversationEntry(parts[0].toLongOrNull() ?: 0L, parts[1], parts.drop(2).joinToString("|").trim())
            }?.toList() ?: emptyList()

    fun exportConversation(entries: List<ConversationEntry>): String {
        return entries.joinToString("\n") { e ->
            "${e.timestamp},${e.speaker},\"${e.text.replace("\"", "'")}\""
        }
    }

    fun exportConversationJson(
        entries: List<ConversationEntry>,
        speaker: String? = null,
        startTs: Long? = null,
        endTs: Long? = null,
        limit: Int? = null,
    ): String {
        val filtered =
            entries.asSequence()
                .filter { speaker == null || it.speaker.equals(speaker, true) }
                .filter { startTs == null || it.timestamp >= startTs }
                .filter { endTs == null || it.timestamp <= endTs }
                .toList()
                .let { list -> if (limit != null) list.takeLast(limit) else list }
        val sb = StringBuilder()
        sb.append('[')
        filtered.forEachIndexed { idx, e ->
            if (idx > 0) sb.append(',')
            sb.append('{')
            sb.append("\"ts\":").append(e.timestamp).append(',')
            sb.append("\"speaker\":\"").append(e.speaker.replace("\"", "'"))
                .append("\",")
            val textEsc = e.text.replace("\\", "\\\\").replace("\"", "'")
            sb.append("\"text\":\"").append(textEsc).append('\"')
            sb.append('}')
        }
        sb.append(']')
        return sb.toString()
    }
}

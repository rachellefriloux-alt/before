package com.sallie.core.data.datastore

data class UserPreferences(
    val persona: String,
    val theme: String,
    val privacy: String
)

object UserPreferencesSerializer {
    fun serialize(p: UserPreferences): String = buildString {
        append('{')
        append("\"persona\":\"").append(escape(p.persona)).append('\"').append(',')
        append("\"theme\":\"").append(escape(p.theme)).append('\"').append(',')
        append("\"privacy\":\"").append(escape(p.privacy)).append('\"')
        append('}')
    }

    fun deserialize(json: String): UserPreferences {
        val body = json.trim().removePrefix("{").removeSuffix("}")
        val parts = mutableListOf<String>()
        if (body.isNotBlank()) {
            val sb = StringBuilder()
            var inQuotes = false
            var escapeNext = false
            for (c in body) {
                if (escapeNext) {
                    sb.append(c); escapeNext = false; continue
                }
                when (c) {
                    '\\' -> { sb.append(c); escapeNext = true }
                    '"' -> { sb.append(c); inQuotes = !inQuotes }
                    ',' -> if (!inQuotes) { parts += sb.toString(); sb.clear(); continue } else sb.append(c)
                    else -> sb.append(c)
                }
            }
            if (sb.isNotEmpty()) parts += sb.toString()
        }
        val map = mutableMapOf<String, String>()
        parts.forEach { part ->
            val kv = part.split(":", limit = 2)
            if (kv.size == 2) {
                val k = kv[0].trim().removeSurrounding("\"")
                val v = kv[1].trim().removeSurrounding("\"")
                map[k] = unescape(v)
            }
        }
        return UserPreferences(
            persona = map["persona"] ?: "unknown",
            theme = map["theme"] ?: "default",
            privacy = map["privacy"] ?: "standard"
        )
    }

    private fun escape(s: String) = s.replace("\\", "\\\\").replace("\"", "\\\"")
    private fun unescape(s: String) = s.replace("\\\"", "\"").replace("\\\\", "\\")
}

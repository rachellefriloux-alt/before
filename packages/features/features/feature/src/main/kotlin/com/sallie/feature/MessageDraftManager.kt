package com.sallie.feature

// Drafts respectful messages, tracks deadlines, mirrors dignity
class MessageDraftManager {
    data class Draft(
        val id: String,
        var content: String,
        var tone: String = "neutral",
        val created: Long = System.currentTimeMillis(),
        val revisions: MutableList<Pair<Long, String>> = mutableListOf()
    )

    private val drafts: MutableMap<String, Draft> = mutableMapOf()

    fun createDraft(content: String, tone: String = "neutral"): Draft {
        val id = "d" + (drafts.size + 1)
        val draft = Draft(id, content, tone).also { it.revisions.add(it.created to content) }
        drafts[id] = draft
        return draft
    }

    fun editDraft(draftId: String, newContent: String, newTone: String? = null): Draft? {
        val draft = drafts[draftId] ?: return null
        val now = System.currentTimeMillis()
        draft.content = newContent
        newTone?.let { draft.tone = it }
        draft.revisions.add(now to newContent)
        return draft
    }

    fun adjustTone(draftId: String, targetTone: String): Draft? {
        val draft = drafts[draftId] ?: return null

        // Advanced tone adaptation logic
        val adaptedContent = adaptContentToTone(draft.content, draft.tone, targetTone)
        draft.tone = targetTone
        draft.content = adaptedContent
        draft.revisions.add(System.currentTimeMillis() to adaptedContent)
        return draft
    }

    private fun adaptContentToTone(content: String, currentTone: String, targetTone: String): String {
        // Tone adaptation mapping
        val toneMappings = mapOf(
            "formal" to mapOf(
                "casual" to listOf(
                    "Hello" to "Hey",
                    "I would like" to "I want",
                    "Please" to "",
                    "Thank you" to "Thanks",
                    "I am" to "I'm",
                    "Do not" to "Don't",
                    "Cannot" to "Can't",
                    "It is" to "It's",
                    "That is" to "That's",
                    "What is" to "What's",
                    "How is" to "How's"
                ),
                "professional" to listOf(
                    "Hello" to "Dear",
                    "I would like" to "I request",
                    "Please" to "Kindly",
                    "Thank you" to "I appreciate",
                    "I am" to "I am",
                    "Regards" to "Sincerely"
                )
            ),
            "casual" to mapOf(
                "formal" to listOf(
                    "Hey" to "Hello",
                    "I want" to "I would like",
                    "" to "Please",
                    "Thanks" to "Thank you",
                    "I'm" to "I am",
                    "Don't" to "Do not",
                    "Can't" to "Cannot",
                    "It's" to "It is",
                    "That's" to "That is",
                    "What's" to "What is",
                    "How's" to "How is"
                ),
                "professional" to listOf(
                    "Hey" to "Dear",
                    "I want" to "I request",
                    "Thanks" to "I appreciate",
                    "I'm" to "I am",
                    "Don't" to "Do not",
                    "Can't" to "Cannot"
                )
            ),
            "professional" to mapOf(
                "formal" to listOf(
                    "Dear" to "Hello",
                    "I request" to "I would like",
                    "Kindly" to "Please",
                    "I appreciate" to "Thank you",
                    "Sincerely" to "Regards"
                ),
                "casual" to listOf(
                    "Dear" to "Hey",
                    "I request" to "I want",
                    "Kindly" to "",
                    "I appreciate" to "Thanks",
                    "Sincerely" to "Regards"
                )
            )
        )

        var adaptedContent = content

        // Apply tone transformations
        toneMappings[currentTone.lowercase()]?.get(targetTone.lowercase())?.forEach { (from, to) ->
            if (from.isNotEmpty()) {
                adaptedContent = adaptedContent.replace(from, to, ignoreCase = true)
            }
        }

        // Add tone-specific prefixes/suffixes
        adaptedContent = when (targetTone.lowercase()) {
            "formal" -> {
                if (!adaptedContent.startsWith("Dear") && !adaptedContent.startsWith("Hello")) {
                    "Hello,\n\n$adaptedContent\n\nRegards,"
                } else {
                    adaptedContent
                }
            }
            "professional" -> {
                if (!adaptedContent.contains("Dear") && !adaptedContent.contains("Sincerely")) {
                    "Dear Recipient,\n\n$adaptedContent\n\nSincerely,"
                } else {
                    adaptedContent
                }
            }
            "casual" -> {
                adaptedContent.trimStart('D', 'e', 'a', 'r', ',').trimStart()
                    .replace(Regex("Sincerely,.*$"), "")
                    .replace(Regex("Regards,.*$"), "")
                    .trim()
            }
            else -> adaptedContent
        }

        return adaptedContent
    }

    fun deleteDraft(draftId: String): Boolean = drafts.remove(draftId) != null
    fun getDraft(draftId: String): Draft? = drafts[draftId]
    fun listDrafts(): List<Draft> = drafts.values.sortedBy { it.created }
}

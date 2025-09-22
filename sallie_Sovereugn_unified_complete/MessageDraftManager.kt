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
        // simple tone adaptation placeholder logic
        draft.tone = targetTone
        val adapted = "[${targetTone.uppercase()}] ${draft.content}"
        draft.content = adapted
        draft.revisions.add(System.currentTimeMillis() to adapted)
        return draft
    }

    fun deleteDraft(draftId: String): Boolean = drafts.remove(draftId) != null
    fun getDraft(draftId: String): Draft? = drafts[draftId]
    fun listDrafts(): List<Draft> = drafts.values.sortedBy { it.created }
}

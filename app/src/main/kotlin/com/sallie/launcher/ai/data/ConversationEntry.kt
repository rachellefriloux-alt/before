package com.sallie.launcher

data class ConversationEntry(
    val timestamp: Long,
    val speaker: String, // "user" or "sallie"
    val text: String,
)

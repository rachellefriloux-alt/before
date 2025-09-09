package com.sallie.feature

// Manages emotional backup and restore
class EmotionalBackupManager {
    data class EmotionalSnapshot(val state: String, val timestamp: Long)
    private val backup = ArrayDeque<EmotionalSnapshot>()
    private val maxSnapshots = 50

    fun backupEmotion(state: String) {
        if (backup.size >= maxSnapshots) backup.removeFirst()
        backup.addLast(EmotionalSnapshot(state, System.currentTimeMillis()))
    }

    fun restoreEmotion(): String = backup.lastOrNull()?.state ?: "No backup found"
    fun history(): List<EmotionalSnapshot> = backup.toList()
}

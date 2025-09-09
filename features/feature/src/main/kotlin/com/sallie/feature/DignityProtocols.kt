package com.sallie.feature

// Protocols to protect user dignity and privacy
class DignityProtocols {
    data class ProtocolEvent(val action: String, val enforced: Boolean, val timestamp: Long, val notes: String)
    private val auditTrail: MutableList<ProtocolEvent> = mutableListOf()
    private val rollbackRegistry: MutableSet<String> = mutableSetOf()

    fun enforceProtocol(action: String, notes: String = ""): ProtocolEvent {
        val event = ProtocolEvent(action, true, System.currentTimeMillis(), notes)
        auditTrail.add(event)
        rollbackRegistry.add(action)
        return event
    }

    fun logDecision(action: String, notes: String = ""): ProtocolEvent {
        val event = ProtocolEvent(action, false, System.currentTimeMillis(), notes)
        auditTrail.add(event)
        return event
    }

    fun offerRollback(action: String): String = if (rollbackRegistry.contains(action)) {
        "Rollback available for: $action"
    } else {
        "No rollback recorded for: $action"
    }

    fun audit(): List<ProtocolEvent> = auditTrail
}

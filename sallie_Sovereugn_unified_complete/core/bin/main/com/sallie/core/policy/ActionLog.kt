package com.sallie.core.policy

import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

// 🛡 SALLE PERSONA ENFORCED 🛡 Loyal, Modular, Audit‑Proof.

/**
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Audit trail of all capability access and policy decisions.
 * Got it, love.
 */
object ActionLog {

    data class LogEntry(
        val timestamp: String,
        val capability: String,
        val params: String,
        val allowed: Boolean,
        val reason: String
    )

    private val log = mutableListOf<LogEntry>()
    private val dateFormat = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.US)

    fun append(capability: String, params: Any?, allowed: Boolean, reason: String) {
        val entry = LogEntry(
            timestamp = dateFormat.format(Date()),
            capability = capability,
            params = params?.toString() ?: "none",
            allowed = allowed,
            reason = reason
        )

        log.add(entry)

        // Keep log size reasonable (last 1000 entries)
        if (log.size > 1000) {
            log.removeAt(0)
        }

        // Print for debugging (in production, this might go to secure logging)
        val status = if (allowed) "✅" else "🚫"
        println("$status [${entry.timestamp}] $capability(${entry.params}) - ${entry.reason}")
    }

    fun getRecent(count: Int = 50): List<LogEntry> {
        return log.takeLast(count)
    }

    fun getByCapability(capability: String): List<LogEntry> {
        return log.filter { it.capability == capability }
    }

    fun clear() {
        log.clear()
        println("🧹 Action log cleared")
    }

    fun export(): String {
        return log.joinToString("\n") { entry ->
            "${entry.timestamp},${entry.capability},${entry.params},${entry.allowed},${entry.reason}"
        }
    }
}

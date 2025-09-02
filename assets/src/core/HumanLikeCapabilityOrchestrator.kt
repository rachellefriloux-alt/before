// Salle Persona: HumanLikeCapabilityOrchestrator
package org.sallie.core

import org.sallie.core.engine.ProactiveAssistanceEngine
import org.sallie.core.interfaces.IProactiveAssistanceEngine


class HumanLikeCapabilityOrchestrator(private val engine: IProactiveAssistanceEngine) {
    init {
        try {
            engine.initialize()
        } catch (e: Exception) {
            println("Error initializing engine: ${e.message}")
        }
    }

    fun handleTask(taskName: String, context: Map<String, Any>): Boolean {
        return try {
            engine.performTask(taskName, context)
            true
        } catch (e: Exception) {
            println("Error handling task '$taskName': ${e.message}")
            false
        }
    }

    fun saveState(): Boolean {
        return try {
            engine.saveToMemory()
            true
        } catch (e: Exception) {
            println("Error saving state: ${e.message}")
            false
        }
    }

    fun reportStatus(): String {
        return try {
            engine.status
        } catch (e: Exception) {
            "Error retrieving status: ${e.message}"
        }
    }
}

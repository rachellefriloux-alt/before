/*
 * Persona: Tough love meets soul care.
 * Module: IProactiveAssistanceEngine
 * Intent: Handle functionality for IProactiveAssistanceEngine
 * Provenance-ID: 4fcff017-971c-4ab8-b3ec-1155769e466f
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

// Salle Persona: IProactiveAssistanceEngine
package org.sallie.core.interfaces

interface IProactiveAssistanceEngine {
    fun initialize()
    fun loadFromMemory()
    fun saveToMemory()
    fun performTask(taskName: String, context: Map<String, Any>)
    val status: String
}

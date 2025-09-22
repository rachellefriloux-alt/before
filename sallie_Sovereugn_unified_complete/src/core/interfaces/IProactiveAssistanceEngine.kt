// Salle Persona: IProactiveAssistanceEngine
package org.sallie.core.interfaces

interface IProactiveAssistanceEngine {
    fun initialize()
    fun loadFromMemory()
    fun saveToMemory()
    fun performTask(taskName: String, context: Map<String, Any>)
    val status: String
}

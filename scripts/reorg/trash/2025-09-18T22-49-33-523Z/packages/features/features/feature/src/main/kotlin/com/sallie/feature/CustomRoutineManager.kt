package com.sallie.feature

// Manages user-defined routines and multi-step actions
class CustomRoutineManager {
    data class Routine(
        val name: String,
        val steps: MutableList<String>,
        val created: Long = System.currentTimeMillis(),
        val executions: MutableList<Long> = mutableListOf(),
        var lastDurationMs: Long? = null,
        var active: Boolean = true
    )

    private val routines: MutableMap<String, Routine> = mutableMapOf()

    fun createRoutine(name: String, steps: List<String>): Routine {
        require(name.isNotBlank()) { "Routine name cannot be blank" }
        require(steps.isNotEmpty()) { "Routine must have at least one step" }
        val routine = Routine(name, steps.toMutableList())
        routines[name] = routine
        return routine
    }

    fun addStep(name: String, step: String): Routine? {
        val r = routines[name] ?: return null
        r.steps.add(step)
        return r
    }

    fun removeStep(name: String, step: String): Routine? {
        val r = routines[name] ?: return null
        r.steps.remove(step)
        return r
    }

    fun runRoutine(name: String): Pair<Routine?, List<String>> {
        val r = routines[name] ?: return null to emptyList()
        if (!r.active) return r to listOf("Routine inactive")
        val start = System.currentTimeMillis()
        val outputs = r.steps.map { s -> "Executed: $s" }
        val duration = System.currentTimeMillis() - start
        r.lastDurationMs = duration
        r.executions.add(start)
        return r to outputs
    }

    fun deactivate(name: String): Routine? { val r = routines[name]; r?.active = false; return r }
    fun activate(name: String): Routine? { val r = routines[name]; r?.active = true; return r }
    fun listRoutines(): List<Routine> = routines.values.sortedBy { it.created }
    fun getRoutine(name: String): Routine? = routines[name]
}

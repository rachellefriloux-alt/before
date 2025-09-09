package com.sallie.feature

// Plans, prioritizes, and protects user focus
class TaskOrchestrator {
    data class Task(
        val id: String,
        val title: String,
        val urgency: Int,
        val importance: Int,
        val stressImpact: Int,
        val estimatedMinutes: Int
    )

    private val history: MutableList<List<Task>> = mutableListOf()
    private val taskPool: MutableList<Task> = mutableListOf()

    fun addTask(id: String, title: String, urgency: Int, importance: Int, stressImpact: Int = 1, estimatedMinutes: Int): Task {
        val t = Task(id, title, urgency, importance, stressImpact, estimatedMinutes)
        taskPool.add(t)
        return t
    }

    fun selectTasks(maxStress: Int = 5, maxTotalMinutes: Int): List<Task> = planTasks(taskPool, maxStress, maxTotalMinutes)

    fun planTasks(tasks: List<Task>, maxStress: Int, timeBudgetMinutes: Int): List<Task> {
        val prioritized = tasks
            .sortedByDescending { (it.urgency * 2) + it.importance }
            .filter { it.stressImpact <= maxStress }
        val selected = mutableListOf<Task>()
        var used = 0
        for (t in prioritized) {
            if (used + t.estimatedMinutes <= timeBudgetMinutes) {
                selected.add(t)
                used += t.estimatedMinutes
            }
        }
        history.add(selected)
        return selected
    }

    fun getHistory(): List<List<Task>> = history
}

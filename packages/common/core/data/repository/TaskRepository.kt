package core.data.repository

import core.data.model.Task

class TaskRepository {
    private val tasks = mutableListOf<Task>()

    fun addTask(task: Task) {
        tasks.add(task)
    }

    fun getTasks(): List<Task> = tasks

    fun completeTask(id: String) {
        tasks.find { it.id == id }?.let { it.completed = true }
    }

    fun removeTask(id: String) {
        tasks.removeIf { it.id == id }
    }
}

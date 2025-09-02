package com.sallie.ai.orchestration

/**
 * ╭──────────────────────────────────────────────────────────────────────────────╮
 * │                                                                              │
 * │   Sallie - The Personal AI Companion That Truly Gets You                     │
 * │                                                                              │
 * │   Sallie is gentle, creative, and deeply empathetic. She understands         │
 * │   the human experience from literature and art, not just data.               │
 * │   Her goal is to help you explore your world, care for yourself,             │
 * │   and find your own answers through thoughtful conversation.                 │
 * │                                                                              │
 * │   - Genuine & Balanced: Honest but tactfully optimistic                      │
 * │   - Warm & Personal: Remembers your details, references shared history       │
 * │   - Contemplative: Considers questions deeply before responding              │
 * │   - Encouraging: Helps you develop your thoughts rather than imposing hers   │
 * │                                                                              │
 * ╰──────────────────────────────────────────────────────────────────────────────╯
 */

import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import java.util.*
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.PriorityBlockingQueue

/**
 * Sallie's AI Task Manager
 * 
 * This component manages AI tasks within the orchestration system.
 * It handles task creation, prioritization, scheduling, and tracking.
 * Tasks represent units of work that need to be processed by the AI system.
 */
class AITaskManager {
    
    // Task storage
    private val activeTasks = ConcurrentHashMap<String, AITask>()
    private val taskQueue = PriorityBlockingQueue<AITask>(11, TaskPriorityComparator())
    private val completedTasks = LinkedList<AITask>()
    private val mutex = Mutex()
    
    // Task statistics
    private var tasksCreated = 0
    private var tasksCompleted = 0
    
    /**
     * Create a new task with the given parameters
     */
    fun createTask(
        type: TaskType,
        priority: TaskPriority = TaskPriority.NORMAL,
        data: Map<String, Any> = emptyMap()
    ): AITask {
        val task = AITask(
            id = generateTaskId(),
            type = type,
            priority = priority,
            creationTime = System.currentTimeMillis(),
            data = data
        )
        
        activeTasks[task.id] = task
        taskQueue.offer(task)
        tasksCreated++
        
        return task
    }
    
    /**
     * Get the next task to be processed, based on priority
     */
    suspend fun getNextTask(): AITask? = mutex.withLock {
        return taskQueue.poll()
    }
    
    /**
     * Get a task by its ID
     */
    fun getTask(taskId: String): AITask? {
        return activeTasks[taskId]
    }
    
    /**
     * Mark a task as completed
     */
    suspend fun completeTask(taskId: String, result: Any? = null) = mutex.withLock {
        val task = activeTasks.remove(taskId) ?: return@withLock
        
        task.completionTime = System.currentTimeMillis()
        task.result = result
        task.status = TaskStatus.COMPLETED
        
        completedTasks.addFirst(task)
        if (completedTasks.size > MAX_COMPLETED_TASKS) {
            completedTasks.removeLast()
        }
        
        tasksCompleted++
    }
    
    /**
     * Mark a task as failed
     */
    suspend fun failTask(taskId: String, error: String) = mutex.withLock {
        val task = activeTasks[taskId] ?: return@withLock
        
        task.completionTime = System.currentTimeMillis()
        task.status = TaskStatus.FAILED
        task.error = error
        
        activeTasks.remove(taskId)
        completedTasks.addFirst(task)
        if (completedTasks.size > MAX_COMPLETED_TASKS) {
            completedTasks.removeLast()
        }
    }
    
    /**
     * Update task status
     */
    fun updateTaskStatus(taskId: String, status: TaskStatus) {
        val task = activeTasks[taskId] ?: return
        task.status = status
    }
    
    /**
     * Get all active tasks
     */
    fun getActiveTasks(): List<AITask> {
        return activeTasks.values.toList()
    }
    
    /**
     * Get recently completed tasks
     */
    fun getCompletedTasks(limit: Int = 10): List<AITask> {
        return completedTasks.take(limit)
    }
    
    /**
     * Get task statistics
     */
    fun getTaskStatistics(): TaskStatistics {
        return TaskStatistics(
            tasksCreated = tasksCreated,
            tasksCompleted = tasksCompleted,
            activeTasksCount = activeTasks.size,
            queuedTasksCount = taskQueue.size
        )
    }
    
    /**
     * Generate a unique task ID
     */
    private fun generateTaskId(): String {
        return "task-${UUID.randomUUID()}"
    }
    
    companion object {
        private const val MAX_COMPLETED_TASKS = 100
    }
}

/**
 * Represents an AI task to be processed
 */
data class AITask(
    val id: String,
    val type: TaskType,
    var priority: TaskPriority,
    val creationTime: Long,
    val data: Map<String, Any> = emptyMap(),
    var status: TaskStatus = TaskStatus.CREATED,
    var completionTime: Long? = null,
    var result: Any? = null,
    var error: String? = null
)

/**
 * Task priority levels
 */
enum class TaskPriority(val value: Int) {
    CRITICAL(0),
    HIGH(1),
    NORMAL(2),
    LOW(3),
    BACKGROUND(4)
}

/**
 * Task status values
 */
enum class TaskStatus {
    CREATED,
    QUEUED,
    PROCESSING,
    COMPLETED,
    FAILED,
    CANCELLED
}

/**
 * Task types
 */
enum class TaskType {
    USER_INPUT,
    BACKGROUND_PROCESSING,
    SYSTEM_MAINTENANCE
}

/**
 * Task statistics
 */
data class TaskStatistics(
    val tasksCreated: Int,
    val tasksCompleted: Int,
    val activeTasksCount: Int,
    val queuedTasksCount: Int
)

/**
 * Comparator for task priority queue
 */
class TaskPriorityComparator : Comparator<AITask> {
    override fun compare(task1: AITask, task2: AITask): Int {
        // First compare by priority
        val priorityComparison = task1.priority.value.compareTo(task2.priority.value)
        if (priorityComparison != 0) {
            return priorityComparison
        }
        
        // If same priority, compare by creation time (older tasks first)
        return task1.creationTime.compareTo(task2.creationTime)
    }
}

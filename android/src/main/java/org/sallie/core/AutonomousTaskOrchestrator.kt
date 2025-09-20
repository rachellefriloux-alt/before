/*
 * Persona: Tough love meets soul care.
 * Module: AutonomousTaskOrchestrator
 * Intent: Handle functionality for AutonomousTaskOrchestrator
 * Provenance-ID: 0e94e6db-446f-4c60-adbc-dd491780afca
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

// Salle Persona: AutonomousTaskOrchestrator
package org.sallie.core.task

import java.util.concurrent.Executors
import java.util.concurrent.LinkedBlockingQueue
import java.util.concurrent.TimeUnit

class AutonomousTaskOrchestrator {
    private val taskQueue = LinkedBlockingQueue<() -> Unit>()
    private val executor = Executors.newFixedThreadPool(4)

    fun scheduleTask(task: () -> Unit) {
        taskQueue.add(task)
    }

    fun executeAll() {
        while (taskQueue.isNotEmpty()) {
            executor.submit(taskQueue.poll())
        }
    }

    fun shutdown() {
        executor.shutdown()
        try {
            if (!executor.awaitTermination(5, TimeUnit.SECONDS)) {
                executor.shutdownNow()
            }
        } catch (e: InterruptedException) {
            executor.shutdownNow()
        }
    }

    fun getPendingTaskCount(): Int = taskQueue.size
}

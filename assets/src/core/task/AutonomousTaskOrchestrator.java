package org.sallie.core.task;

import java.util.*;
import java.util.concurrent.*;

public class AutonomousTaskOrchestrator {
    private final Queue<Runnable> taskQueue = new LinkedList<>();
    private final ExecutorService executor = Executors.newFixedThreadPool(4);

    public void scheduleTask(Runnable task) {
        taskQueue.add(task);
    }

    public void executeAll() {
        while (!taskQueue.isEmpty()) {
            executor.submit(taskQueue.poll());
        }
    }

    public void shutdown() {
        executor.shutdown();
        try {
            if (!executor.awaitTermination(5, TimeUnit.SECONDS)) {
                executor.shutdownNow();
            }
        } catch (InterruptedException e) {
            executor.shutdownNow();
        }
    }

    public int getPendingTaskCount() {
        return taskQueue.size();
    }
}
/*
 * Persona: Tough love meets soul care.
 * Module: TaskPanel
 * Intent: Handle functionality for TaskPanel
 * Provenance-ID: 2ccaefbd-b685-4b0a-a015-3e0a31e63831
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

<template>
  <div class="task-panel" :class="theme">
    <div class="task-panel-header">
      <h3>Task Panel</h3>
      <span class="task-count">{{ tasks.length }} tasks</span>
    </div>

    <div class="task-list" v-if="tasks.length > 0">
      <div
        v-for="(task, index) in tasks"
        :key="index"
        class="task-item"
        :class="{ completed: task.completed }"
      >
        <div class="task-content">
          <h4>{{ task.title || 'Untitled Task' }}</h4>
          <p v-if="task.description">{{ task.description }}</p>
          <div class="task-meta" v-if="task.priority || task.dueDate">
            <span v-if="task.priority" class="task-priority" :class="task.priority.toLowerCase()">
              {{ task.priority }}
            </span>
            <span v-if="task.dueDate" class="task-due-date">
              Due: {{ formatDate(task.dueDate) }}
            </span>
          </div>
        </div>
        <div class="task-actions">
          <button
            @click="executeTask(task, index)"
            class="task-btn execute-btn"
            :disabled="task.completed"
          >
            {{ task.completed ? 'Completed' : 'Execute' }}
          </button>
        </div>
      </div>
    </div>

    <div class="no-tasks" v-else>
      <p>No tasks available. Complete onboarding to get started!</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TaskPanel',
  props: {
    tasks: {
      type: Array,
      default: () => []
    },
    theme: {
      type: String,
      default: 'light'
    }
  },
  methods: {
    executeTask(task, index) {
      if (task.completed) return;

      // Mark task as completed
      task.completed = true;

      // Emit executeGoal event with task data
      this.$emit('executeGoal', {
        task,
        index,
        goal: task.title || 'Execute task'
      });
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString();
    }
  }
};
</script>

<style scoped>
.task-panel {
  background: var(--bg-color, #f8f9fa);
  border: 1px solid var(--border-color, #dee2e6);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.task-panel.dark {
  --bg-color: #2a2a2a;
  --border-color: #444;
  --text-color: #e0e0e0;
  --text-secondary: #b0b0b0;
  --primary-color: #4a9eff;
  --primary-hover: #3a8eff;
  --success-color: #28a745;
  --warning-color: #ffc107;
  --danger-color: #dc3545;
}

.task-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--border-color, #dee2e6);
  padding-bottom: 0.5rem;
}

.task-panel h3 {
  margin: 0;
  color: var(--text-color, #333);
  font-size: 1.1rem;
}

.task-count {
  background: var(--primary-color, #007bff);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.75rem;
  background: var(--item-bg, #fff);
  border: 1px solid var(--border-color, #dee2e6);
  border-radius: 6px;
  transition: all 0.2s;
}

.task-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.task-item.completed {
  opacity: 0.7;
  background: var(--completed-bg, #f8f9fa);
}

.task-content {
  flex: 1;
  margin-right: 1rem;
}

.task-content h4 {
  margin: 0 0 0.25rem 0;
  color: var(--text-color, #333);
  font-size: 1rem;
}

.task-content p {
  margin: 0 0 0.5rem 0;
  color: var(--text-secondary, #666);
  font-size: 0.9rem;
}

.task-meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.task-priority {
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.task-priority.low {
  background: var(--success-color, #28a745);
  color: white;
}

.task-priority.medium {
  background: var(--warning-color, #ffc107);
  color: #000;
}

.task-priority.high {
  background: var(--danger-color, #dc3545);
  color: white;
}

.task-due-date {
  color: var(--text-secondary, #666);
  font-size: 0.8rem;
}

.task-actions {
  display: flex;
  align-items: center;
}

.task-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.execute-btn {
  background: var(--primary-color, #007bff);
  color: white;
}

.execute-btn:hover:not(:disabled) {
  background: var(--primary-hover, #0056b3);
}

.execute-btn:disabled {
  background: var(--text-secondary, #666);
  cursor: not-allowed;
}

.no-tasks {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary, #666);
}

.no-tasks p {
  margin: 0;
  font-style: italic;
}
</style>

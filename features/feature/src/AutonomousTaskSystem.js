
// Sallie Persona Module
// AutonomousTaskSystem.js

class AutonomousTaskSystem {
    constructor() {
        this.tasks = [];
        this.completedTasks = [];
    }

    addTask(task) {
        this.tasks.push({ ...task, status: 'pending', created: Date.now() });
        return `Task '${task.name}' added.`;
    }

    completeTask(taskName) {
        const idx = this.tasks.findIndex(t => t.name === taskName && t.status === 'pending');
        if (idx === -1) return `Task '${taskName}' not found or already completed.`;
        this.tasks[idx].status = 'completed';
        this.tasks[idx].completed = Date.now();
        this.completedTasks.push(this.tasks[idx]);
        return `Task '${taskName}' marked as completed.`;
    }

    getPendingTasks() {
        return this.tasks.filter(t => t.status === 'pending');
    }

    getCompletedTasks() {
        return this.completedTasks;
    }

    removeTask(taskName) {
        const idx = this.tasks.findIndex(t => t.name === taskName);
        if (idx === -1) return `Task '${taskName}' not found.`;
        this.tasks.splice(idx, 1);
        return `Task '${taskName}' removed.`;
    }

    getTaskStatus(taskName) {
        const task = this.tasks.find(t => t.name === taskName);
        if (!task) return `Task '${taskName}' not found.`;
        return `Task '${taskName}' status: ${task.status}`;
    }
}

module.exports = AutonomousTaskSystem;

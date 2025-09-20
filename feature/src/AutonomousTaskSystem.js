/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\feature\src\AutonomousTaskSystem.js) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\feature\src\AutonomousTaskSystem.js) */
/* --- dest (C:\Users\chell\Desktop\newsal\feature\src\AutonomousTaskSystem.js) --- */
/* Merged master for logical file: feature\src\AutonomousTaskSystem
Sources:
 - C:\Users\chell\Desktop\Sallie\merged_sallie\feature\src\AutonomousTaskSystem.js (hash:B4757E376A2D46D0B92AF984260EB5CB59DA005AAED57052F7BE34E31CD6B0F2)
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\feature\src\AutonomousTaskSystem.js (hash:23095512401E269B2E2B4408561CD996BCBFAB042754CA47C0C8AE964600119D)
 */

/* ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\feature\src\AutonomousTaskSystem.js | ext: .js | sha: B4757E376A2D46D0B92AF984260EB5CB59DA005AAED57052F7BE34E31CD6B0F2 ---- */
[BINARY FILE - original copied to merged_sources: feature\src\AutonomousTaskSystem.js]
/* ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\feature\src\AutonomousTaskSystem.js | ext: .js | sha: 23095512401E269B2E2B4408561CD996BCBFAB042754CA47C0C8AE964600119D ---- */
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\feature\src\AutonomousTaskSystem.js --- */
// Salle Persona Module
// AutonomousTaskSystem.js
class AutonomousTaskSystem {
    constructor() {
        this.tasks = [];
        this.completedTasks = [];
    }
    addTask(task) {
        this.tasks.push({ ...task, status: 'pending', created: Date.now() });
        return `Task '${task.name}' added.`;
    completeTask(taskName) {
        const idx = this.tasks.findIndex(t => t.name === taskName && t.status === 'pending');
        if (idx === -1) return `Task '${taskName}' not found or already completed.`;
        this.tasks[idx].status = 'completed';
        this.tasks[idx].completed = Date.now();
        this.completedTasks.push(this.tasks[idx]);
        return `Task '${taskName}' marked as completed.`;
    getPendingTasks() {
        return this.tasks.filter(t => t.status === 'pending');
    getCompletedTasks() {
        return this.completedTasks;
    removeTask(taskName) {
        const idx = this.tasks.findIndex(t => t.name === taskName);
        if (idx === -1) return `Task '${taskName}' not found.`;
        this.tasks.splice(idx, 1);
        return `Task '${taskName}' removed.`;
    getTaskStatus(taskName) {
        const task = this.tasks.find(t => t.name === taskName);
        if (!task) return `Task '${taskName}' not found.`;
        return `Task '${taskName}' status: ${task.status}`;
}
module.exports = AutonomousTaskSystem;

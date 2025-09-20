/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\feature\src\HumanizedSalleBridge.js) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\feature\src\HumanizedSalleBridge.js) */
/* --- dest (C:\Users\chell\Desktop\newsal\feature\src\HumanizedSalleBridge.js) --- */
/* Merged master for logical file: feature\src\HumanizedSalleBridge
Sources:
 - C:\Users\chell\Desktop\Sallie\merged_sallie\feature\src\HumanizedSalleBridge.js (hash:23947ADDC6323C0A1E0B30B503F78C012C71CA0529C075F1A9D5CC328C5426D8)
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\feature\src\HumanizedSalleBridge.js (hash:7EA3A72DFD09703EB0A54D88EFE30570D98BF2D141C59DDFA53298529AB6F3AE)
 */

/* ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\feature\src\HumanizedSalleBridge.js | ext: .js | sha: 23947ADDC6323C0A1E0B30B503F78C012C71CA0529C075F1A9D5CC328C5426D8 ---- */
[BINARY FILE - original copied to merged_sources: feature\src\HumanizedSalleBridge.js]
/* ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\feature\src\HumanizedSalleBridge.js | ext: .js | sha: 7EA3A72DFD09703EB0A54D88EFE30570D98BF2D141C59DDFA53298529AB6F3AE ---- */
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\feature\src\HumanizedSalleBridge.js --- */
/*
Salle Persona Module: HumanizedSalleBridge
Connects the humanized Salle modules with the core system.
Follows Salle architecture, modularity, and privacy rules.
*/
const { HumanizedSalleOrchestrator } = require('./HumanizedSalleOrchestrator');
class HumanizedSalleBridge {
    constructor() {
        this.orchestrator = new HumanizedSalleOrchestrator();
        this.activeUserIds = new Map();
    }
    handleMessage(userId, message) {
        this.trackUserActivity(userId);
        return this.orchestrator.processInput(userId, message);
    provideFeedback(userId, feedback) {
        this.orchestrator.learnFromFeedback(userId, feedback);
    getProactiveSuggestion(userId) {
        return this.orchestrator.generateProactiveSuggestion(userId);
    completeTask(userId, task) {
        return this.orchestrator.completeTaskForUser(userId, task);
    trackUserActivity(userId) {
        this.activeUserIds.set(userId, { lastActive: Date.now() });
    isUserActive(userId, thresholdMinutes = 30) {
        const userData = this.activeUserIds.get(userId);
        if (!userData) return false;
        const thresholdMs = thresholdMinutes * 60 * 1000;
        return (Date.now() - userData.lastActive) < thresholdMs;
}
module.exports = HumanizedSalleBridge;

/*
Sallie Persona Module: HumanizedSallieBridge
Connects the humanized Sallie modules with the core system.
Follows Sallie architecture, modularity, and privacy rules.
*/

const { HumanizedSallieOrchestrator } = require('./HumanizedSallieOrchestrator');

class HumanizedSallieBridge {
    constructor() {
        this.orchestrator = new HumanizedSallieOrchestrator();
        this.activeUserIds = new Map();
    }

    handleMessage(userId, message) {
        this.trackUserActivity(userId);
        return this.orchestrator.processInput(userId, message);
    }

    provideFeedback(userId, feedback) {
        this.orchestrator.learnFromFeedback(userId, feedback);
    }

    getProactiveSuggestion(userId) {
        this.trackUserActivity(userId);
        return this.orchestrator.generateProactiveSuggestion(userId);
    }

    completeTask(userId, task) {
        return this.orchestrator.completeTaskForUser(userId, task);
    }

    trackUserActivity(userId) {
        this.activeUserIds.set(userId, { lastActive: Date.now() });
    }

    isUserActive(userId, thresholdMinutes = 30) {
        const userData = this.activeUserIds.get(userId);
        if (!userData) return false;
        const thresholdMs = thresholdMinutes * 60 * 1000;
        return (Date.now() - userData.lastActive) < thresholdMs;
    }
}

module.exports = HumanizedSallieBridge;

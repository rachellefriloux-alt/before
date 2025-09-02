/*
 * Persona: Tough love meets soul care.
 * Module: HumanizedSalleBridge
 * Intent: Handle functionality for HumanizedSalleBridge
 * Provenance-ID: 33a81b88-5f56-4a14-8c82-d70cbf3c7300
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

/*
Salle Persona Module: HumanizedSalleBridge
Connects the humanized Salle modules with the core system.
Follows Salle architecture, modularity, and privacy rules.
*/

import HumanizedSalleOrchestrator from './HumanizedSalleOrchestrator.js';

class HumanizedSalleBridge {
    constructor() {
        this.orchestrator = new HumanizedSalleOrchestrator();
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

export default HumanizedSalleBridge;

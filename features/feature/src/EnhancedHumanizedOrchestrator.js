// Sallie Persona Module
// EnhancedHumanizedOrchestrator.js (converted from TypeScript)
// JavaScript compatibility verified - no TypeScript-specific logic requiring adaptation

class EnhancedHumanizedOrchestrator {
    constructor(personalizationModule, proactiveSystem) {
        this.personalization = personalizationModule;
        this.proactive = proactiveSystem;
        this.userActivity = new Map();
        this.feedbackHistory = [];
    }

    handleMessage(userId, message) {
        this.trackUserActivity(userId);
        return this.personalization.personalizeResponse(userId, message);
    }

    provideFeedback(userId, feedback) {
        this.feedbackHistory.push({ userId, feedback, timestamp: Date.now() });
        this.learnFromFeedback(userId, feedback);
    }

    getProactiveSuggestion(userId) {
        return this.proactive.suggestNextAction(userId);
    }

    completeTask(userId, task) {
        this.trackUserActivity(userId);
        return this.proactive.completeTask(userId, task);
    }

    trackUserActivity(userId) {
        const now = Date.now();
        if (!this.userActivity.has(userId)) {
            this.userActivity.set(userId, []);
        }
        this.userActivity.get(userId).push(now);
    }

    isUserActive(userId, thresholdMinutes = 30) {
        const activity = this.userActivity.get(userId) || [];
        if (activity.length === 0) return false;
        const lastActive = activity[activity.length - 1];
        return (Date.now() - lastActive) < thresholdMinutes * 60 * 1000;
    }

    learnFromFeedback(userId, feedback) {
        if (feedback.toLowerCase().includes('like') || feedback.toLowerCase().includes('good')) {
            this.personalization.updateProfile(userId, 'satisfaction', 'high');
        } else if (feedback.toLowerCase().includes('dislike') || feedback.toLowerCase().includes('bad')) {
            this.personalization.updateProfile(userId, 'satisfaction', 'low');
        }
        this.personalization.evolveHelpfulness(userId);
    }
}

module.exports = EnhancedHumanizedOrchestrator;

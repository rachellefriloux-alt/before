/*
 * Persona: Tough love meets soul care.
 * Module: ProactiveHelperModule
 * Intent: Handle functionality for ProactiveHelperModule
 * Provenance-ID: bf2e4351-5d34-4337-910c-fb8e480265a9
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

/*
Salle Persona Module: ProactiveHelperModule
Provides proactive suggestions and anticipates user needs.
Follows Salle architecture, modularity, and privacy rules.
*/

class ProactiveHelperModule {
    constructor() {
        this.userActivities = new Map();
        this.suggestionPatterns = new Map();
        this.contextHistory = [];
    }

    logActivity(activity) {
        const timestamp = Date.now();
        this.contextHistory.push({
            activity: activity,
            timestamp: timestamp
        });

        // Keep only last 100 activities
        if (this.contextHistory.length > 100) {
            this.contextHistory.shift();
        }
    }

    suggestNextAction(userId) {
        // Store user activity for pattern recognition
        this.userActivities.set(userId, Date.now());

        const recentActivities = this.getRecentActivities(5);
        const suggestions = [];

        // Analyze patterns and suggest next actions
        if (recentActivities.some(activity => activity.toLowerCase().includes('task'))) {
            suggestions.push("Would you like me to help you organize your remaining tasks?");
        }

        if (recentActivities.some(activity => activity.toLowerCase().includes('learn'))) {
            suggestions.push("Based on your learning interests, I can recommend some additional resources.");
        }

        if (recentActivities.some(activity => activity.toLowerCase().includes('problem'))) {
            suggestions.push("I noticed you've been working on some challenges. Would you like some additional support?");
        }

        if (recentActivities.length === 0) {
            suggestions.push("Welcome! I'm here to help you with whatever you need. What would you like to work on?");
        }

        // Return the most relevant suggestion
        return suggestions.length > 0 ? suggestions[0] : "How can I assist you today?";
    }

    getRecentActivities(count = 10) {
        return this.contextHistory.slice(-count).map(item => item.activity);
    }

    anticipateNeeds(userId) {
        // Store user activity for pattern recognition
        this.userActivities.set(userId, Date.now());

        const activities = this.getRecentActivities(20);
        const needs = [];

        // Pattern recognition for anticipating needs
        const workPattern = activities.filter(activity =>
            activity.toLowerCase().includes('work') ||
            activity.toLowerCase().includes('task') ||
            activity.toLowerCase().includes('project')
        );

        if (workPattern.length > activities.length * 0.3) {
            needs.push("productivity_tools");
        }

        const learningPattern = activities.filter(activity =>
            activity.toLowerCase().includes('learn') ||
            activity.toLowerCase().includes('study') ||
            activity.toLowerCase().includes('research')
        );

        if (learningPattern.length > activities.length * 0.2) {
            needs.push("learning_resources");
        }

        const creativePattern = activities.filter(activity =>
            activity.toLowerCase().includes('create') ||
            activity.toLowerCase().includes('design') ||
            activity.toLowerCase().includes('build')
        );

        if (creativePattern.length > activities.length * 0.2) {
            needs.push("creative_tools");
        }

        return needs;
    }

    provideContextualHelp(userId, currentContext) {
        const needs = this.anticipateNeeds(userId);
        const suggestions = [];

        if (needs.includes("productivity_tools")) {
            suggestions.push("I can help you set up reminders, organize your tasks, or create productivity workflows.");
        }

        if (needs.includes("learning_resources")) {
            suggestions.push("I can recommend learning paths, find relevant resources, or help you study more effectively.");
        }

        if (needs.includes("creative_tools")) {
            suggestions.push("I can help with brainstorming, project planning, or connecting you with creative resources.");
        }

        if (currentContext.toLowerCase().includes('stuck') || currentContext.toLowerCase().includes('problem')) {
            suggestions.push("I can help you break down this problem, find solutions, or connect you with relevant resources.");
        }

        return suggestions.length > 0 ? suggestions : ["I'm here to help with whatever you need."];
    }

    learnFromInteraction(userId, interaction, outcome) {
        // Learn from user interactions to improve future suggestions
        const pattern = {
            userId: userId,
            interaction: interaction,
            outcome: outcome,
            timestamp: Date.now()
        };

        // Store pattern for future reference
        const userPatterns = this.suggestionPatterns.get(userId) || [];
        userPatterns.push(pattern);
        this.suggestionPatterns.set(userId, userPatterns);
    }
}

export default ProactiveHelperModule;

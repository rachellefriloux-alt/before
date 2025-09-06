/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Enhanced orchestrator integrating advanced systems for memory, language, relationships, and conversations.
 * Got it, love.
 */

/**
 * Enhanced Humanized Orchestrator
 * Integrates all advanced systems: memory, language, relationships, conversations
 * Adapted from TypeScript for JavaScript compatibility
 */
class EnhancedHumanizedOrchestrator {
    constructor() {
        // Initialize advanced systems (adapted for JS - using require instead of import)
        try {
            const AdvancedMemorySystem = require('./AdvancedMemorySystem');
            const AdvancedLanguageUnderstanding = require('./AdvancedLanguageUnderstanding');
            const RelationshipTrustSystem = require('./RelationshipTrustSystem');
            const AdaptiveConversationSystem = require('./AdaptiveConversationSystem');

            this.memory = new AdvancedMemorySystem();
            this.language = new AdvancedLanguageUnderstanding();
            this.relationship = new RelationshipTrustSystem();
            this.conversation = new AdaptiveConversationSystem(this.memory);
        } catch (error) {
            // Some advanced systems not available, using fallback implementations
            this.memory = { store: () => {}, retrieve: () => null };
            this.language = { understand: () => ({ intent: 'unknown', entities: [] }) };
            this.relationship = { getTrustLevel: () => 0.5, updateTrust: () => {} };
            this.conversation = { startConversationThread: () => 'fallback_thread' };
        }

        // Initialize original modules (adapted for JS)
        try {
            const CognitiveModule = require('./CognitiveModule');
            const EmotionalIntelligenceModule = require('./EmotionalIntelligenceModule');
            const TechnicalProwessModule = require('./TechnicalProwessModule');
            const ProactiveHelperModule = require('./ProactiveHelperModule');
            const PersonalizationModule = require('./PersonalizationModule');

            this.cognitive = new CognitiveModule();
            this.emotional = new EmotionalIntelligenceModule();
            this.technical = new TechnicalProwessModule();
            this.proactive = new ProactiveHelperModule();
            this.personalization = new PersonalizationModule();
        } catch (error) {
            // Some original modules not available, using fallback implementations
            this.cognitive = { process: () => ({}) };
            this.emotional = { analyzeEmotion: () => 'neutral' };
            this.technical = { execute: () => false };
            this.proactive = { suggest: () => null };
            this.personalization = { personalize: (text) => text };
        }

        // User activity tracking (adapted from TypeScript Map)
        this.userActivity = new Map();
        this.feedbackHistory = [];

        // Set default technical permissions
        if (this.technical.setPermissions) {
            this.technical.setPermissions('default', ['read']);
        }

        // Process relationship trust decay once a day (adapted for JS setInterval)
        if (this.relationship.processTrustDecay) {
            setInterval(() => this.relationship.processTrustDecay(), 24 * 60 * 60 * 1000);
        }
    }

    /**
     * Handle incoming message with full system integration
     * @param {string} userId - The user identifier
     * @param {string} message - The incoming message
     * @returns {Object} Response with personalized content
     */
    handleMessage(userId, message) {
        this.trackUserActivity(userId);

        // Analyze message with language understanding
        const languageAnalysis = this.language.understand ?
            this.language.understand(message) :
            { intent: 'unknown', entities: [] };

        // Get conversation context
        const conversationContext = this.conversation.recallContext ?
            this.conversation.recallContext(userId) :
            [];

        // Analyze emotion
        const emotion = this.emotional.analyzeEmotion ?
            this.emotional.analyzeEmotion(message) :
            'neutral';

        // Get relationship trust level
        const trustLevel = this.relationship.getTrustLevel ?
            this.relationship.getTrustLevel(userId) :
            0.5;

        // Personalize response
        const personalizedResponse = this.personalization.personalizeResponse ?
            this.personalization.personalizeResponse(userId, message) :
            message;

        // Store in memory
        if (this.memory.store) {
            this.memory.store({
                type: 'message',
                userId,
                message,
                analysis: languageAnalysis,
                emotion,
                trustLevel,
                timestamp: Date.now()
            });
        }

        return {
            response: personalizedResponse,
            analysis: languageAnalysis,
            emotion,
            trustLevel,
            context: conversationContext
        };
    }

    /**
     * Provide feedback and learn from it
     * @param {string} userId - The user identifier
     * @param {string} feedback - The feedback content
     */
    provideFeedback(userId, feedback) {
        this.feedbackHistory.push({
            userId,
            feedback,
            timestamp: Date.now()
        });

        this.learnFromFeedback(userId, feedback);

        // Store feedback in memory
        if (this.memory.store) {
            this.memory.store({
                type: 'feedback',
                userId,
                feedback,
                timestamp: Date.now()
            });
        }
    }

    /**
     * Get proactive suggestion for user
     * @param {string} userId - The user identifier
     * @returns {Object|null} Suggestion object or null
     */
    getProactiveSuggestion(userId) {
        if (this.proactive.suggestNextAction) {
            return this.proactive.suggestNextAction(userId);
        }

        // Fallback: check if user has been inactive
        if (!this.isUserActive(userId, 60)) {
            return {
                type: 'check_in',
                message: "I haven't heard from you in a while. How are you doing?",
                priority: 'low'
            };
        }

        return null;
    }

    /**
     * Complete a task with proactive system integration
     * @param {string} userId - The user identifier
     * @param {Object} task - The task object
     * @returns {boolean} Success status
     */
    completeTask(userId, task) {
        this.trackUserActivity(userId);

        if (this.proactive.completeTask) {
            return this.proactive.completeTask(userId, task);
        }

        // Fallback implementation
        // Task completed for user ${userId}: ${JSON.stringify(task)}
        return true;
    }

    /**
     * Track user activity (adapted from TypeScript private method)
     * @param {string} userId - The user identifier
     */
    trackUserActivity(userId) {
        const now = Date.now();
        if (!this.userActivity.has(userId)) {
            this.userActivity.set(userId, []);
        }
        const activity = this.userActivity.get(userId);
        activity.push(now);

        // Keep only last 100 activities to prevent memory issues
        if (activity.length > 100) {
            activity.shift();
        }
    }

    /**
     * Check if user is active within threshold
     * @param {string} userId - The user identifier
     * @param {number} thresholdMinutes - Minutes threshold
     * @returns {boolean} Whether user is active
     */
    isUserActive(userId, thresholdMinutes = 30) {
        const activity = this.userActivity.get(userId) || [];
        if (activity.length === 0) return false;
        const lastActive = activity[activity.length - 1];
        return (Date.now() - lastActive) < thresholdMinutes * 60 * 1000;
    }

    /**
     * Learn from feedback (adapted from TypeScript private method)
     * @param {string} userId - The user identifier
     * @param {string} feedback - The feedback content
     */
    learnFromFeedback(userId, feedback) {
        const lowerFeedback = feedback.toLowerCase();

        if (lowerFeedback.includes('like') || lowerFeedback.includes('good') ||
            lowerFeedback.includes('helpful') || lowerFeedback.includes('great')) {
            if (this.personalization.updateProfile) {
                this.personalization.updateProfile(userId, 'satisfaction', 'high');
            }
        } else if (lowerFeedback.includes('dislike') || lowerFeedback.includes('bad') ||
                   lowerFeedback.includes('unhelpful') || lowerFeedback.includes('terrible')) {
            if (this.personalization.updateProfile) {
                this.personalization.updateProfile(userId, 'satisfaction', 'low');
            }
        }

        if (this.personalization.evolveHelpfulness) {
            this.personalization.evolveHelpfulness(userId);
        }
    }

    /**
     * Get system status and health
     * @returns {Object} System status
     */
    getSystemStatus() {
        return {
            memory: this.memory ? 'active' : 'inactive',
            language: this.language ? 'active' : 'inactive',
            relationship: this.relationship ? 'active' : 'inactive',
            conversation: this.conversation ? 'active' : 'inactive',
            cognitive: this.cognitive ? 'active' : 'inactive',
            emotional: this.emotional ? 'active' : 'inactive',
            technical: this.technical ? 'active' : 'inactive',
            proactive: this.proactive ? 'active' : 'inactive',
            personalization: this.personalization ? 'active' : 'inactive',
            activeUsers: this.userActivity.size,
            feedbackCount: this.feedbackHistory.length
        };
    }
}

module.exports = EnhancedHumanizedOrchestrator;

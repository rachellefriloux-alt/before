/*
Sallie Persona Module: HumanizedSallieOrchestrator
Integrates all advanced human-like features (cognitive, emotional, technical, proactive, personalization)
into a cohesive system that functions with human-like qualities and awareness.
Follows Sallie architecture, modularity, and privacy rules.
*/

const CognitiveModule = require('./CognitiveModule');
const EmotionalIntelligenceModule = require('./EmotionalIntelligenceModule');
const TechnicalProwessModule = require('./TechnicalProwessModule');
const ProactiveHelperModule = require('./ProactiveHelperModule');
const PersonalizationModule = require('./PersonalizationModule');

class HumanizedSallieOrchestrator {
    constructor() {
        this.cognitive = new CognitiveModule();
        this.emotional = new EmotionalIntelligenceModule();
        this.technical = new TechnicalProwessModule();
        this.proactive = new ProactiveHelperModule();
        this.personalization = new PersonalizationModule();
        this.technical.setPermissions('default', ['read']);
    }

    processInput(userId, input) {
        this.proactive.logActivity(input);
        const mood = this.emotional.detectMood(input);
        let response = '';
        if (input.toLowerCase().includes('task') || input.toLowerCase().includes('automation')) {
            response = this.technical.automateTask(input, userId);
        } else if (mood === 'sad' || mood === 'angry') {
            response = this.emotional.respondWithEmpathy(input);
        } else if (input.toLowerCase().includes('problem') || input.toLowerCase().includes('help with')) {
            const knowledge = this.cognitive.recallKnowledge(userId, 'preferences');
            response = this.cognitive.solveProblem(input, { userId, preferences: knowledge });
        } else if (input.toLowerCase().includes('joke') || input.toLowerCase().includes('funny')) {
            response = this.emotional.interpretHumor(input);
        } else {
            response = this.personalization.personalizeResponse(userId, "I'm considering how best to help you.");
        }
        this.cognitive.logInteraction(userId, input, response);
        this.personalization.logInteraction(userId, input);
        return response;
    }

    generateProactiveSuggestion() {
        return this.proactive.suggestNextAction();
    }

    learnFromFeedback(userId, feedback) {
        if (feedback.toLowerCase().includes('like') || feedback.toLowerCase().includes('good')) {
            this.personalization.updateProfile(userId, 'satisfaction', 'high');
        } else if (feedback.toLowerCase().includes('dislike') || feedback.toLowerCase().includes('bad')) {
            this.personalization.updateProfile(userId, 'satisfaction', 'low');
        }
        this.cognitive.adaptResponse(userId, feedback);
    }

    integrateSystem(userId, system, data) {
        return this.technical.integrateWithAPI(system, data, userId);
    }

    completeTaskForUser(userId, task) {
        return this.technical.completeTaskIndependently(task, userId);
    }
}

module.exports = HumanizedSallieOrchestrator;

/*
 * Persona: Tough love meets soul care.
 * Module: HumanizedSalleOrchestrator
 * Intent: Handle functionality for HumanizedSalleOrchestrator
 * Provenance-ID: aa543c0f-08e8-48f2-8f80-f85050f6bbb3
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

/*
Salle Persona Module: HumanizedSalleOrchestrator
Integrates all advanced human-like features (cognitive, emotional, technical, proactive, personalization)
into a cohesive system that functions with human-like qualities and awareness.
Follows Salle architecture, modularity, and privacy rules.
*/

import CognitiveModule from './CognitiveModule.js';
import EmotionalIntelligenceModule from './EmotionalIntelligenceModule.js';
import TechnicalProwessModule from './TechnicalProwessModule.js';
import ProactiveHelperModule from './ProactiveHelperModule.js';
import PersonalizationModule from './PersonalizationModule.js';

class HumanizedSalleOrchestrator {
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

    // eslint-disable-next-line no-unused-vars
    generateProactiveSuggestion(userId) {
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

export default HumanizedSalleOrchestrator;

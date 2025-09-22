/*
 * Persona: Tough love meets soul care.
 * Module: AdaptivePersonaEngine
 * Intent: Handle functionality for AdaptivePersonaEngine
 * Provenance-ID: b72950fa-0a0e-4983-98e8-8c92034403d9
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */


class AdaptivePersonaEngine {
    constructor(config = {}) {
        this.personaState = config.personaState || {};
        this.evolutionRules = config.evolutionRules || [];
        this.history = [];
    }

    updatePersona(input) {
        // Analyze input and update persona state
        let changes = this.evolutionRules.map(rule => rule(input, this.personaState)).filter(Boolean);
        // Advanced: handle emotional triggers and asset switching
        if (input.intent && input.intent.name) {
            switch (input.intent.name) {
                case 'celebrate':
                    changes.push({ emotion: 'celebrate', mode: 'playful' });
                    this.triggerCustomEvent('onCelebrate', { intent: input.intent });
                    break;
                case 'critical':
                    changes.push({ emotion: 'critical', mode: 'critical' });
                    this.triggerCustomEvent('onCritical', { intent: input.intent });
                    break;
                case 'calm':
                    changes.push({ emotion: 'calm', mode: 'loyal' });
                    this.triggerCustomEvent('onCalm', { intent: input.intent });
                    break;
                case 'alert':
                    changes.push({ emotion: 'alert', mode: 'strategic' });
                    this.triggerCustomEvent('onAlert', { intent: input.intent });
                    break;
                case 'achievement':
                    changes.push({ emotion: 'achievement', mode: 'playful' });
                    this.triggerCustomEvent('onAchievement', { intent: input.intent });
                    break;
                case 'milestone':
                    changes.push({ emotion: 'milestone', mode: 'resourceful' });
                    this.triggerCustomEvent('onMilestone', { intent: input.intent });
                    break;
                case 'motivated':
                    changes.push({ emotion: 'motivated', mode: 'strategic' });
                    this.triggerCustomEvent('onMotivated', { intent: input.intent });
                    break;
                case 'reflective':
                    changes.push({ emotion: 'reflective', mode: 'empathic' });
                    this.triggerCustomEvent('onReflective', { intent: input.intent });
                    break;
                default:
                    break;
            }
        }
        changes.forEach(change => {
            Object.assign(this.personaState, change);
            this.history.push({ input, change });
        });
        return this.personaState;
    }

    addEvolutionRule(rule) {
        this.evolutionRules.push(rule);
    }

    // Advanced: custom extension hooks
    onCustomEvent(event, handler) {
        if (!this.customEvents) this.customEvents = {};
        this.customEvents[event] = handler;
    }

    triggerCustomEvent(event, payload) {
        if (this.customEvents && typeof this.customEvents[event] === 'function') {
            this.customEvents[event](payload, this.personaState);
        }
    }

    getPersonaState() {
        return { ...this.personaState };
    }

    getHistory() {
        return [...this.history];
    }
}

export default AdaptivePersonaEngine;

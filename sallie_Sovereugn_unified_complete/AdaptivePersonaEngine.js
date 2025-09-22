
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

module.exports = AdaptivePersonaEngine;



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

module.exports = AdaptivePersonaEngine;


/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\core\AdaptivePersonaEngine.js) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\core\AdaptivePersonaEngine.js) */
/* --- dest (C:\Users\chell\Desktop\newsal\core\AdaptivePersonaEngine.js) --- */
/* Merged master for logical file: core\AdaptivePersonaEngine
Sources:
 - C:\Users\chell\Desktop\Sallie\merged_sallie\core\AdaptivePersonaEngine.js (hash:FE1FB0A08CB3F91A70CD1D55B43BC678AA0150B8C3F48D309CC82C0E54F6A340)
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\core\AdaptivePersonaEngine.js (hash:BC191B06C863CA925641FBF24ACEE77739E1F4832E90D878D7AE92CC0DA00346)
 */

/* ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\core\AdaptivePersonaEngine.js | ext: .js | sha: FE1FB0A08CB3F91A70CD1D55B43BC678AA0150B8C3F48D309CC82C0E54F6A340 ---- */
[BINARY FILE - original copied to merged_sources: core\AdaptivePersonaEngine.js]
/* ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\core\AdaptivePersonaEngine.js | ext: .js | sha: BC191B06C863CA925641FBF24ACEE77739E1F4832E90D878D7AE92CC0DA00346 ---- */
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\core\AdaptivePersonaEngine.js --- */
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
                case 'calm':
                    changes.push({ emotion: 'calm', mode: 'loyal' });
                    this.triggerCustomEvent('onCalm', { intent: input.intent });
                case 'alert':
                    changes.push({ emotion: 'alert', mode: 'strategic' });
                    this.triggerCustomEvent('onAlert', { intent: input.intent });
                case 'achievement':
                    changes.push({ emotion: 'achievement', mode: 'playful' });
                    this.triggerCustomEvent('onAchievement', { intent: input.intent });
                case 'milestone':
                    changes.push({ emotion: 'milestone', mode: 'resourceful' });
                    this.triggerCustomEvent('onMilestone', { intent: input.intent });
                case 'motivated':
                    changes.push({ emotion: 'motivated', mode: 'strategic' });
                    this.triggerCustomEvent('onMotivated', { intent: input.intent });
                case 'reflective':
                    changes.push({ emotion: 'reflective', mode: 'empathic' });
                    this.triggerCustomEvent('onReflective', { intent: input.intent });
                default:
            }
        }
        changes.forEach(change => {
            Object.assign(this.personaState, change);
            this.history.push({ input, change });
        });
        return this.personaState;
    addEvolutionRule(rule) {
        this.evolutionRules.push(rule);
    // Advanced: custom extension hooks
    onCustomEvent(event, handler) {
        if (!this.customEvents) this.customEvents = {};
        this.customEvents[event] = handler;
    triggerCustomEvent(event, payload) {
        if (this.customEvents && typeof this.customEvents[event] === 'function') {
            this.customEvents[event](payload, this.personaState);
    getPersonaState() {
        return { ...this.personaState };
    getHistory() {
        return [...this.history];
}
module.exports = AdaptivePersonaEngine;

/*
 * Persona: Tough love meets soul care.
 * Module: visualStateManager
 * Intent: Handle functionality for visualStateManager
 * Provenance-ID: 7a4b0410-4921-4d00-b963-82fb58c2162e
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

// Salle Persona Module
// visualStateManager.js (converted from TypeScript)
// ✔ Enhanced logic added: Review and adapt TypeScript-specific logic for JS compatibility

class VisualStateManager {
    constructor() {
        this.state = {};
        this.theme = 'light';
        this.animationsEnabled = true;
        this.accessibility = { highContrast: false, reducedMotion: false };
    }

    setState(key, value) {
        this.state[key] = value;
    }

    getState(key) {
        return this.state[key];
    }

    setTheme(theme) {
        this.theme = theme;
        this.setState('theme', theme);
    }

    getTheme() {
        return this.theme;
    }

    enableAnimations(flag) {
        this.animationsEnabled = !!flag;
        this.setState('animationsEnabled', this.animationsEnabled);
    }

    setAccessibility(options) {
        this.accessibility = { ...this.accessibility, ...options };
        this.setState('accessibility', this.accessibility);
    }

    getAccessibility() {
        return { ...this.accessibility };
    }

    resetState() {
        this.state = {};
        this.theme = 'light';
        this.animationsEnabled = true;
        this.accessibility = { highContrast: false, reducedMotion: false };
    }
}

module.exports = VisualStateManager;

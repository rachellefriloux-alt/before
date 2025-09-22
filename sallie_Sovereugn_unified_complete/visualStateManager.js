// Salle Persona Module
// visualStateManager.js (converted from TypeScript)
// TODO: Review and adapt TypeScript-specific logic for JS compatibility

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


// Salle Persona Module
// visualStateManager.js (converted from TypeScript)
// TODO: Review and adapt TypeScript-specific logic for JS compatibility

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


/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\core\visualStateManager.js) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\core\visualStateManager.js) */
/* --- dest (C:\Users\chell\Desktop\newsal\core\visualStateManager.js) --- */
/* Merged master for logical file: core\visualStateManager
Sources:
 - C:\Users\chell\Desktop\Sallie\merged_sallie\core\visualStateManager.js (hash:D655B26DD04FDAF316D26C1E1F6383DDE5335B9F15EADDA19D530F6B56316AED)
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\core\visualStateManager.js (hash:083B5C6C5E8AD63CF42A90D102E7353238167A2958F27EC0AF7F05B17A18658E)
 */

/* ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\core\visualStateManager.js | ext: .js | sha: D655B26DD04FDAF316D26C1E1F6383DDE5335B9F15EADDA19D530F6B56316AED ---- */
[BINARY FILE - original copied to merged_sources: core\visualStateManager.js]
/* ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\core\visualStateManager.js | ext: .js | sha: 083B5C6C5E8AD63CF42A90D102E7353238167A2958F27EC0AF7F05B17A18658E ---- */
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\core\visualStateManager.js --- */
// Salle Persona Module
// visualStateManager.js (converted from TypeScript)
// TODO: Review and adapt TypeScript-specific logic for JS compatibility
class VisualStateManager {
    constructor() {
        this.state = {};
        this.theme = 'light';
        this.animationsEnabled = true;
        this.accessibility = { highContrast: false, reducedMotion: false };
    }
    setState(key, value) {
        this.state[key] = value;
    getState(key) {
        return this.state[key];
    setTheme(theme) {
        this.theme = theme;
        this.setState('theme', theme);
    getTheme() {
        return this.theme;
    enableAnimations(flag) {
        this.animationsEnabled = !!flag;
        this.setState('animationsEnabled', this.animationsEnabled);
    setAccessibility(options) {
        this.accessibility = { ...this.accessibility, ...options };
        this.setState('accessibility', this.accessibility);
    getAccessibility() {
        return { ...this.accessibility };
    resetState() {
}
module.exports = VisualStateManager;

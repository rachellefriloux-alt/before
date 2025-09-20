/**
 * Manages visual state for the Sallie AI interface
 */
class VisualStateManager {
    /**
     * Creates a new VisualStateManager instance
     */
    constructor() {
        this.state = {};
        this.theme = 'light';
        this.animationsEnabled = true;
        this.accessibility = { highContrast: false, reducedMotion: false };
    }

    /**
     * Sets a state value
     * @param {string} key - The state key
     * @param {any} value - The state value
     */
    setState(key, value) {
        this.state[key] = value;
    }

    /**
     * Gets a state value
     * @param {string} key - The state key
     * @return {any} The state value
     */
    getState(key) {
        return this.state[key];
    }

    /**
     * Sets the current theme
     * @param {string} theme - The theme name
     */
    setTheme(theme) {
        this.theme = theme;
        this.setState('theme', theme);
    }

    /**
     * Gets the current theme
     * @return {string} The current theme
     */
    getTheme() {
        return this.theme;
    }

    /**
     * Enables or disables animations
     * @param {boolean} flag - Whether animations should be enabled
     */
    enableAnimations(flag) {
        this.animationsEnabled = Boolean(flag);
        this.setState('animationsEnabled', this.animationsEnabled);
    }

    /**
     * Sets accessibility options
     * @param {Object} options - Accessibility options
     */
    setAccessibility(options) {
        if (typeof options !== 'object') {
            throw new Error('Accessibility options must be an object');
        }
        this.accessibility = { ...this.accessibility, ...options };
        this.setState('accessibility', this.accessibility);
    }

    /**
     * Gets current accessibility settings
     * @return {Object} The accessibility settings
     */
    getAccessibility() {
        return { ...this.accessibility };
    }

    /**
     * Resets the state to default values
     */
    resetState() {
        this.state = {};
        this.theme = 'light';
        this.animationsEnabled = true;
        this.accessibility = { highContrast: false, reducedMotion: false };
    }
}

module.exports = VisualStateManager;

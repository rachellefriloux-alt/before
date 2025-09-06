/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Visual state management for UI themes, animations, and accessibility.
 * Got it, love.
 */

/**
 * Visual State Manager for managing UI visual states, themes, and accessibility
 * Handles theme switching, animation controls, and accessibility preferences
 */
class VisualStateManager {
    /**
     * @param {Object} options - Configuration options
     * @param {string} options.defaultTheme - Default theme ('light', 'dark', 'auto')
     * @param {boolean} options.animationsEnabled - Whether animations are enabled
     * @param {Object} options.accessibility - Accessibility settings
     */
    constructor(options = {}) {
        this.state = {};
        this.theme = options.defaultTheme || 'light';
        this.animationsEnabled = options.animationsEnabled !== false;
        this.accessibility = {
            highContrast: false,
            reducedMotion: false,
            largeText: false,
            ...options.accessibility
        };
        this.listeners = new Set();
        this.history = []; // Track state changes for undo functionality
    }

    /**
     * Set a state value and notify listeners
     * @param {string} key - State key
     * @param {*} value - State value
     */
    setState(key, value) {
        const oldValue = this.state[key];
        this.state[key] = value;

        // Track history for potential undo
        this.history.push({
            type: 'state',
            key,
            oldValue,
            newValue: value,
            timestamp: Date.now()
        });

        this.notifyListeners('stateChanged', { key, value, oldValue });
    }

    /**
     * Get a state value
     * @param {string} key - State key
     * @returns {*} State value
     */
    getState(key) {
        return this.state[key];
    }

    /**
     * Set the current theme
     * @param {string} theme - Theme name ('light', 'dark', 'auto', 'nature', etc.)
     */
    setTheme(theme) {
        if (!theme) {
            console.warn('VisualStateManager: Theme name is required');
            return;
        }

        const oldTheme = this.theme;
        this.theme = theme;
        this.setState('theme', theme);

        // Apply theme to document if in browser environment
        if (typeof document !== 'undefined') {
            this.applyThemeToDocument(theme);
        }

        this.notifyListeners('themeChanged', { theme, oldTheme });
    }

    /**
     * Get the current theme
     * @returns {string} Current theme
     */
    getTheme() {
        return this.theme;
    }

    /**
     * Enable or disable animations
     * @param {boolean} flag - Whether animations should be enabled
     */
    enableAnimations(flag) {
        this.animationsEnabled = !!flag;
        this.setState('animationsEnabled', this.animationsEnabled);
        this.notifyListeners('animationsToggled', this.animationsEnabled);

        // Apply to document if in browser
        if (typeof document !== 'undefined') {
            document.documentElement.style.setProperty('--animations-enabled', flag ? '1' : '0');
        }
    }

    /**
     * Set accessibility options
     * @param {Object} options - Accessibility options
     * @param {boolean} options.highContrast - High contrast mode
     * @param {boolean} options.reducedMotion - Reduced motion
     * @param {boolean} options.largeText - Large text mode
     */
    setAccessibility(options) {
        this.accessibility = { ...this.accessibility, ...options };
        this.setState('accessibility', this.accessibility);
        this.notifyListeners('accessibilityChanged', this.accessibility);

        // Apply accessibility settings to document
        if (typeof document !== 'undefined') {
            this.applyAccessibilityToDocument();
        }
    }

    /**
     * Get current accessibility settings
     * @returns {Object} Accessibility settings
     */
    getAccessibility() {
        return { ...this.accessibility };
    }

    /**
     * Reset all state to defaults
     */
    resetState() {
        this.state = {};
        this.theme = 'light';
        this.animationsEnabled = true;
        this.accessibility = { highContrast: false, reducedMotion: false, largeText: false };
        this.history = [];
        this.notifyListeners('stateReset', {});
    }

    /**
     * Add a change listener
     * @param {Function} callback - Callback function (event, data) => void
     */
    addListener(callback) {
        if (typeof callback === 'function') {
            this.listeners.add(callback);
        } else {
            console.warn('VisualStateManager: Listener must be a function');
        }
    }

    /**
     * Remove a change listener
     * @param {Function} callback - Callback function to remove
     */
    removeListener(callback) {
        this.listeners.delete(callback);
    }

    /**
     * Notify all listeners of a change
     * @param {string} event - Event type
     * @param {*} data - Event data
     */
    notifyListeners(event, data) {
        this.listeners.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('VisualStateManager: Error in listener:', error);
            }
        });
    }

    /**
     * Get all current state
     * @returns {Object} Complete state object
     */
    getAllState() {
        return {
            state: { ...this.state },
            theme: this.theme,
            animationsEnabled: this.animationsEnabled,
            accessibility: { ...this.accessibility }
        };
    }

    /**
     * Apply a complete state object
     * @param {Object} newState - New state to apply
     */
    applyState(newState) {
        if (!newState || typeof newState !== 'object') {
            console.warn('VisualStateManager: Invalid state object');
            return;
        }

        if (newState.theme) this.setTheme(newState.theme);
        if (newState.animationsEnabled !== undefined) this.enableAnimations(newState.animationsEnabled);
        if (newState.accessibility) this.setAccessibility(newState.accessibility);
        if (newState.state) {
            Object.assign(this.state, newState.state);
        }
    }

    /**
     * Apply theme to document (browser only)
     * @param {string} theme - Theme name
     * @private
     */
    applyThemeToDocument(theme) {
        try {
            document.documentElement.setAttribute('data-theme', theme);

            // Update CSS custom properties for theme
            const root = document.documentElement;
            const themeColors = this.getThemeColors(theme);
            Object.entries(themeColors).forEach(([property, value]) => {
                root.style.setProperty(`--theme-${property}`, value);
            });
        } catch (error) {
            console.error('VisualStateManager: Failed to apply theme to document:', error);
        }
    }

    /**
     * Apply accessibility settings to document (browser only)
     * @private
     */
    applyAccessibilityToDocument() {
        try {
            const root = document.documentElement;

            // High contrast
            root.setAttribute('data-high-contrast', this.accessibility.highContrast);

            // Reduced motion
            root.setAttribute('data-reduced-motion', this.accessibility.reducedMotion);

            // Large text
            root.setAttribute('data-large-text', this.accessibility.largeText);

        } catch (error) {
            console.error('VisualStateManager: Failed to apply accessibility to document:', error);
        }
    }

    /**
     * Get theme color palette
     * @param {string} theme - Theme name
     * @returns {Object} Color palette
     * @private
     */
    getThemeColors(theme) {
        const palettes = {
            light: {
                background: '#ffffff',
                surface: '#f8f9fa',
                text: '#333333',
                primary: '#007AFF',
                secondary: '#6c757d'
            },
            dark: {
                background: '#1a1a1a',
                surface: '#2d2d2d',
                text: '#ffffff',
                primary: '#0A84FF',
                secondary: '#98989d'
            },
            nature: {
                background: '#f0f8e7',
                surface: '#e8f5e8',
                text: '#2e4d2e',
                primary: '#4CAF50',
                secondary: '#8BC34A'
            }
        };

        return palettes[theme] || palettes.light;
    }

    /**
     * Undo last change
     * @returns {boolean} Whether undo was successful
     */
    undo() {
        const lastChange = this.history.pop();
        if (!lastChange) return false;

        switch (lastChange.type) {
            case 'state':
                this.state[lastChange.key] = lastChange.oldValue;
                this.notifyListeners('stateChanged', {
                    key: lastChange.key,
                    value: lastChange.oldValue,
                    undone: true
                });
                break;
            case 'theme':
                this.setTheme(lastChange.oldValue);
                break;
        }

        return true;
    }

    /**
     * Get state change history
     * @returns {Array} History of changes
     */
    getHistory() {
        return [...this.history];
    }
}

// Export for both CommonJS and ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VisualStateManager;
}

if (typeof exports !== 'undefined') {
    exports.VisualStateManager = VisualStateManager;
}

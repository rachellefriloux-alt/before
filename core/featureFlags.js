/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Feature flags system for enabling/disabling features dynamically
 * Got it, love.
 */

const featureFlags = {
    // Core Features
    VOICE_INTERACTION: true,
    AI_INTEGRATION: true,
    MEMORY_SYSTEM: true,
    THEME_SYSTEM: true,
    
    // Advanced Features
    CODE_OPTIMIZATION: true,
    AUTONOMOUS_PROGRAMMING: true,
    EMOTIONAL_INTELLIGENCE: true,
    DEVICE_INTEGRATION: true,
    
    // Experimental Features
    ADVANCED_VOICE_COMMANDS: true,
    PREDICTIVE_ASSISTANCE: true,
    CROSS_DEVICE_SYNC: false, // Not yet implemented
    MACHINE_LEARNING_ADAPTATION: false, // Not yet implemented
    
    // Privacy & Security
    LOCAL_ONLY_MODE: true,
    ENCRYPTED_STORAGE: true,
    BIOMETRIC_AUTH: true,
    
    // Performance Features
    PERFORMANCE_MONITORING: true,
    OPTIMIZATION_SUGGESTIONS: true,
    REAL_TIME_ANALYTICS: true,
    
    // UI/UX Features
    DYNAMIC_THEMING: true,
    HAPTIC_FEEDBACK: true,
    GESTURE_CONTROLS: true,
    ACCESSIBILITY_ENHANCED: true,
    
    // Development Features
    DEBUG_MODE: process.env.NODE_ENV === 'development',
    FEATURE_TESTING: process.env.NODE_ENV === 'development',
    PERFORMANCE_PROFILING: process.env.NODE_ENV === 'development',
};

// Helper functions for feature flag management
const FeatureFlagManager = {
    isEnabled(flagName) {
        return featureFlags[flagName] === true;
    },
    
    enable(flagName) {
        if (flagName in featureFlags) {
            featureFlags[flagName] = true;
            return true;
        }
        return false;
    },
    
    disable(flagName) {
        if (flagName in featureFlags) {
            featureFlags[flagName] = false;
            return true;
        }
        return false;
    },
    
    getAllFlags() {
        return { ...featureFlags };
    },
    
    getEnabledFlags() {
        return Object.entries(featureFlags)
            .filter(([, value]) => value === true)
            .map(([flagName]) => flagName);
    }
};

module.exports = { featureFlags, FeatureFlagManager };

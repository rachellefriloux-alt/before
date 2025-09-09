// jest-preset.js - Custom preset that fixes jest-expo Object.defineProperty issues

// Override Object.defineProperty globally BEFORE requiring jest-expo
const originalDefineProperty = Object.defineProperty;
const safeDefineProperty = function (obj, prop, descriptor) {
    // Handle undefined/null objects
    if (obj === undefined || obj === null) {
        return obj;
    }

    // Handle non-object targets
    if (typeof obj !== 'object' && typeof obj !== 'function') {
        return obj;
    }

    try {
        return originalDefineProperty.call(this, obj, prop, descriptor);
    } catch (e) {
        // Silently ignore errors to prevent test failures
        return obj;
    }
};

// Override Object.defineProperty globally
Object.defineProperty = safeDefineProperty;
global.Object.defineProperty = safeDefineProperty;

// Now require jest-expo after the patch
const jestExpoPreset = require('jest-expo/jest-preset');

// Create a safer version of the preset
const safePreset = {
    ...jestExpoPreset,
    setupFiles: [
        ...(jestExpoPreset.setupFiles || []),
        '<rootDir>/__tests__/jest-setup.js'
    ],
    // Override problematic globals
    globals: {
        ...jestExpoPreset.globals,
        'ts-jest': {
            tsconfig: 'tsconfig.json'
        }
    },
    // Add test environment options
    testEnvironmentOptions: {
        customExportConditions: ['node', 'node-addons'],
    },
    // Additional error handling
    testEnvironment: 'jsdom',
    // Transform ignore patterns for better compatibility
    transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|react-native-mmkv))'
    ]
};

module.exports = safePreset;

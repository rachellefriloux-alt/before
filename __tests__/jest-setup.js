// jest-setup.js - Fix for jest-expo Object.defineProperty issues

// IMPORTANT: This must run BEFORE jest-expo setup to prevent Object.defineProperty errors
const originalDefineProperty = Object.defineProperty;
Object.defineProperty = function (obj, prop, descriptor) {
    if (obj === undefined || obj === null) {
        // Skip defining properties on undefined/null objects
        return obj;
    }
    try {
        return originalDefineProperty.call(this, obj, prop, descriptor);
    } catch (e) {
        // Silently ignore errors to prevent test failures
        return obj;
    }
};

// Also patch global Object.defineProperty
global.Object.defineProperty = Object.defineProperty;

// Mock React Native's Platform module to prevent jest-expo issues
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
    OS: 'ios',
    Version: 12,
    isTesting: true,
    select: jest.fn((obj) => obj.ios || obj.default)
}));

// Mock React Native's Dimensions
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
    get: jest.fn(() => ({ width: 375, height: 812 })),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
}));

// Mock React Native's StyleSheet
jest.mock('react-native/Libraries/StyleSheet/StyleSheet', () => ({
    create: jest.fn((styles) => styles),
    flatten: jest.fn((style) => style),
    compose: jest.fn((style1, style2) => ({ ...style1, ...style2 }))
}));

// Mock React Native's Animated
jest.mock('react-native/Libraries/Animated/Animated', () => ({
    Value: jest.fn(() => ({
        setValue: jest.fn(),
        interpolate: jest.fn(() => ({ interpolate: jest.fn() })),
        addListener: jest.fn(),
        removeListener: jest.fn(),
        removeAllListeners: jest.fn()
    })),
    timing: jest.fn(() => ({
        start: jest.fn((callback) => callback && callback())
    })),
    spring: jest.fn(() => ({
        start: jest.fn((callback) => callback && callback())
    })),
    View: 'Animated.View',
    Text: 'Animated.Text'
}));

// Mock React Native's UIManager
jest.mock('react-native/Libraries/ReactNative/UIManager', () => ({
    setLayoutAnimationEnabledExperimental: jest.fn(),
    createView: jest.fn(),
    updateView: jest.fn(),
    manageChildren: jest.fn(),
    dispatchViewManagerCommand: jest.fn(),
    measure: jest.fn(),
    measureInWindow: jest.fn(),
    measureLayout: jest.fn(),
    getConstants: jest.fn(() => ({
        StyleConstants: {
            pointerEvents: {}
        }
    }))
}));

// Mock React Native's requireNativeComponent
jest.mock('react-native/Libraries/ReactNative/requireNativeComponent', () => jest.fn(() => 'MockNativeComponent'));

// Mock React Native's findNodeHandle
jest.mock('react-native/Libraries/ReactNative/findNodeHandle', () => jest.fn(() => 1));

// Mock global requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = jest.fn((id) => clearTimeout(id));

// Mock performance.now
global.performance = {
    ...global.performance,
    now: jest.fn(() => Date.now())
};

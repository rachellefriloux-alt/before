/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Runtime fingerprinting for system state tracking and performance monitoring.
 * Got it, love.
 */

/**
 * Runtime Fingerprint Generator for Salle AI
 * Generates comprehensive system fingerprints for monitoring and analytics
 * Tracks memory, performance, network, storage, and battery metrics
 */

/**
 * Get comprehensive runtime fingerprint
 * @returns {Object} Runtime fingerprint with system metrics
 */
function getRuntimeFingerprint() {
    const runtimeFingerprint = {
        timestamp: Date.now(),
        sessionId: generateSessionId(),
        salleVersion: '1.0',
        environment: getEnvironmentInfo(),
        memory: getMemoryInfo(),
        performance: getPerformanceMetrics(),
        network: getNetworkInfo(),
        storage: getStorageInfo(),
        battery: getBatteryInfo()
    };

    // Add runtime-specific identifiers
    runtimeFingerprint.processId = process?.pid || 'browser';
    runtimeFingerprint.threadId = getThreadId();
    runtimeFingerprint.uptime = getUptime();

    // Generate runtime hash for integrity
    runtimeFingerprint.hash = generateRuntimeHash(runtimeFingerprint);

    // Add Salle-specific metadata
    runtimeFingerprint.salleMetadata = {
        persona: 'tough_love_meets_soul_care',
        features: ['voice_control', 'routine_management', 'theme_system', 'god_mode'],
        lastInteraction: Date.now()
    };

    return runtimeFingerprint;
}

/**
 * Generate unique session identifier
 * @returns {string} Session ID
 */
function generateSessionId() {
    return 'salle_session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Get environment information
 * @returns {Object} Environment details
 */
function getEnvironmentInfo() {
    return {
        platform: typeof process !== 'undefined' ? process.platform : navigator?.platform || 'unknown',
        userAgent: navigator?.userAgent || 'unknown',
        language: navigator?.language || 'unknown',
        timezone: Intl?.DateTimeFormat()?.resolvedOptions()?.timeZone || 'unknown',
        screen: typeof screen !== 'undefined' ? {
            width: screen.width,
            height: screen.height,
            colorDepth: screen.colorDepth
        } : null
    };
}

/**
 * Get memory usage information
 * @returns {Object} Memory metrics
 */
function getMemoryInfo() {
    try {
        if (typeof performance !== 'undefined' && performance.memory) {
            return {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit,
                usedPercent: Math.round((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100)
            };
        }
    } catch (error) {
        console.warn('Memory info not available:', error.message);
    }

    // Fallback for environments without performance.memory
    return {
        used: 'unknown',
        total: 'unknown',
        limit: 'unknown',
        usedPercent: 'unknown'
    };
}

/**
 * Get performance metrics
 * @returns {Object} Performance data
 */
function getPerformanceMetrics() {
    try {
        if (typeof performance !== 'undefined') {
            const navigation = performance.getEntriesByType('navigation')[0];
            return {
                timing: performance.timing,
                navigation: performance.navigation,
                entries: performance.getEntries(),
                pageLoadTime: navigation ? navigation.loadEventEnd - navigation.fetchStart : 'unknown',
                domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.fetchStart : 'unknown'
            };
        }
    } catch (error) {
        console.warn('Performance metrics not available:', error.message);
    }

    return {
        timing: 'not-available',
        navigation: 'not-available',
        entries: [],
        pageLoadTime: 'unknown',
        domContentLoaded: 'unknown'
    };
}

/**
 * Get network information
 * @returns {Object} Network metrics
 */
function getNetworkInfo() {
    try {
        if (navigator?.connection) {
            return {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt,
                saveData: navigator.connection.saveData || false
            };
        }

        // Fallback for basic connectivity check
        return {
            effectiveType: navigator?.onLine ? 'online' : 'offline',
            downlink: 'unknown',
            rtt: 'unknown',
            saveData: false
        };
    } catch (error) {
        console.warn('Network info not available:', error.message);
        return {
            effectiveType: 'unknown',
            downlink: 'unknown',
            rtt: 'unknown',
            saveData: false
        };
    }
}

/**
 * Get storage information
 * @returns {Promise<Object>} Storage metrics
 */
function getStorageInfo() {
    try {
        if (navigator?.storage && navigator.storage.estimate) {
            return navigator.storage.estimate().then(estimate => ({
                quota: estimate.quota,
                usage: estimate.usage,
                usagePercent: estimate.quota ? Math.round((estimate.usage / estimate.quota) * 100) : 'unknown'
            })).catch(() => ({
                quota: 'unknown',
                usage: 'unknown',
                usagePercent: 'unknown'
            }));
        }
    } catch (error) {
        console.warn('Storage estimation not supported:', error.message);
    }

    return Promise.resolve({
        quota: 'unknown',
        usage: 'unknown',
        usagePercent: 'unknown'
    });
}

/**
 * Get battery information
 * @returns {Promise<Object>} Battery metrics
 */
async function getBatteryInfo() {
    try {
        if (navigator?.getBattery) {
            const battery = await navigator.getBattery();
            return {
                charging: battery.charging,
                chargingTime: battery.chargingTime,
                dischargingTime: battery.dischargingTime,
                level: battery.level,
                levelPercent: Math.round(battery.level * 100)
            };
        }
    } catch (error) {
        console.warn('Battery API not available:', error.message);
    }

    return {
        charging: 'unknown',
        chargingTime: 'unknown',
        dischargingTime: 'unknown',
        level: 'unknown',
        levelPercent: 'unknown'
    };
}

/**
 * Get thread identifier
 * @returns {string} Thread ID
 */
function getThreadId() {
    // In browser environment, we don't have thread IDs
    // In Node.js, this would be process.threadId
    return process?.threadId || 'main';
}

/**
 * Get system uptime
 * @returns {number} Uptime in seconds
 */
function getUptime() {
    try {
        if (typeof process !== 'undefined' && process.uptime) {
            return process.uptime();
        }

        // For browser, use performance.now()
        if (typeof performance !== 'undefined') {
            return performance.now() / 1000;
        }
    } catch (error) {
        console.warn('Uptime calculation failed:', error.message);
    }

    return Date.now() / 1000;
}

/**
 * Generate runtime hash for integrity verification
 * @param {Object} fingerprint - Runtime fingerprint object
 * @returns {string} Hash string
 */
function generateRuntimeHash(fingerprint) {
    try {
        // Create a simplified version for hashing (exclude dynamic values)
        const hashData = {
            salleVersion: fingerprint.salleVersion,
            environment: fingerprint.environment,
            processId: fingerprint.processId,
            salleMetadata: fingerprint.salleMetadata
        };

        const str = JSON.stringify(hashData);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return 'salle_runtime_' + hash.toString(36);
    } catch (error) {
        console.warn('Hash generation failed:', error.message);
        return 'salle_runtime_error_' + Date.now();
    }
}

/**
 * Validate runtime fingerprint integrity
 * @param {Object} fingerprint - Fingerprint to validate
 * @returns {boolean} Whether fingerprint is valid
 */
function validateFingerprint(fingerprint) {
    if (!fingerprint || !fingerprint.hash) {
        return false;
    }

    const expectedHash = generateRuntimeHash(fingerprint);
    return fingerprint.hash === expectedHash;
}

/**
 * Export runtime fingerprint utilities
 */
const RuntimeFingerprint = {
    getRuntimeFingerprint,
    validateFingerprint,
    generateSessionId,
    getEnvironmentInfo
};

// Export for both CommonJS and ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RuntimeFingerprint;
}

if (typeof exports !== 'undefined') {
    exports.RuntimeFingerprint = RuntimeFingerprint;
}

// Also export as default for ES6
export default RuntimeFingerprint;

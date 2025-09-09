// Sallie Persona Module
// fingerprint.js

/**
 * Generates a unique device/browser fingerprint for Sallie integration
 * @returns {string} A unique identifier based on browser and device characteristics
 */
function getFingerprint() {
    const components = [];
    
    // Collect browser information
    components.push(navigator.userAgent);
    components.push(navigator.language);
    components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);
    
    // Screen properties
    components.push(`${screen.width}x${screen.height}x${screen.colorDepth}`);
    
    // System capabilities
    if (navigator.hardwareConcurrency) {
        components.push(navigator.hardwareConcurrency);
    }
    
    if (navigator.deviceMemory) {
        components.push(navigator.deviceMemory);
    }
    
    // Canvas fingerprinting
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Sallie Fingerprint', 0, 0);
        components.push(canvas.toDataURL());
    } catch (e) {
        components.push('canvas-not-supported');
    }
    
    // Generate hash from components
    return hashString(components.join('###'));
}

/**
 * Simple hash function for fingerprint generation
 * @param {string} str - String to hash
 * @returns {string} - Hashed string
 */
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
}

module.exports = { getFingerprint };

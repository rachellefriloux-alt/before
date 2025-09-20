// Sallie Persona Module
// runtimeConsent.js (converted from TypeScript)

class RuntimeConsent {
    constructor() {
        // Initialize properties that would have types in TypeScript
        this.consents = {};
        this.listeners = [];
        this.isInitialized = false;
    }
    
    initialize() {
        // In TypeScript this might have a return type
        this.isInitialized = true;
        return true;
    }
    
    getConsent(consentKey) {
        // In TypeScript, consentKey might be typed and return value specified
        return this.consents[consentKey] || false;
    }
    
    setConsent(consentKey, value) {
        // In JavaScript we don't need to validate types at compile time
        this.consents[consentKey] = Boolean(value);
        this._notifyListeners(consentKey, Boolean(value));
    }
    
    addConsentListener(listener) {
        // In TypeScript, listener would have a function type signature
        if (typeof listener === 'function') {
            this.listeners.push(listener);
        }
    }
    
    _notifyListeners(key, value) {
        // Private methods in JS don't have the private keyword (use # for truly private)
        this.listeners.forEach(listener => listener(key, value));
    }
}

module.exports = RuntimeConsent;

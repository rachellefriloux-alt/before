
class AdvancedMemorySystem {
    constructor() {
        this.memoryStore = {};
        this.recallHistory = [];
    }

    store(key, value) {
        this.memoryStore[key] = value;
        this.recallHistory.push({ action: 'store', key, value, timestamp: Date.now() });
        return `Stored value for '${key}'.`;
    }

    recall(key) {
        const value = this.memoryStore[key];
        this.recallHistory.push({ action: 'recall', key, value, timestamp: Date.now() });
        return value !== undefined ? value : `No memory found for '${key}'.`;
    }

    forget(key) {
        if (this.memoryStore[key] !== undefined) {
            delete this.memoryStore[key];
            this.recallHistory.push({ action: 'forget', key, timestamp: Date.now() });
            return `Forgot memory for '${key}'.`;
        }
        return `No memory found for '${key}'.`;
    }

    getRecallHistory() {
        return [...this.recallHistory];
    }
}

module.exports = AdvancedMemorySystem;

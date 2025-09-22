/*
 * Sallie 1.0 Module
  * Persona: Tough love meets soul care.
   * Function: Hierarchical memory system for conversation and user context.
    * Got it, love.
     */

export class MemorySystem {
        constructor() {
                this.memories = new Map(); // All memory objects by ID
                this.episodicMemory = []; // Ordered conversation history
                this.semanticMemory = new Map(); // Facts and knowledge
                this.emotionalMemory = new Map(); // Emotional associations
                this.workingMemory = []; // Current context
                this.privacySettings = {
                        allowDeviceTransfer: true,
                        encryptionEnabled: true,
                };
                this.initialized = false;
        }

        async initialize() {
                try {
                        await this.loadFromStorage();
                        this.initialized = true;
                } catch (error) {
                        throw error;
                }
        }

        async store(memory) {
                if (!this.initialized) throw new Error('Memory system not initialized');
                const memoryId = this.generateId();
                const enrichedMemory = {
                        ...memory,
                        id: memoryId,
                        timestamp: Date.now(),
                };
                this.memories.set(memoryId, enrichedMemory);
                if (enrichedMemory.type === 'episodic') this.episodicMemory.push(enrichedMemory);
                if (enrichedMemory.type === 'semantic') this.semanticMemory.set(memoryId, enrichedMemory);
                if (enrichedMemory.type === 'emotional') this.emotionalMemory.set(memoryId, enrichedMemory);
                if (enrichedMemory.type === 'working') this.workingMemory.push(enrichedMemory);
                await this.saveToStorage();
                return memoryId;
        }

        getMemoryById(id) {
                return this.memories.get(id);
        }

        getConversationHistory() {
                return this.episodicMemory;
        }

        getFacts() {
                return Array.from(this.semanticMemory.values());
        }

        getEmotionalAssociations() {
                return Array.from(this.emotionalMemory.values());
        }

        getCurrentContext() {
                return this.workingMemory;
        }

        async saveToStorage() {
                if (typeof localStorage !== 'undefined') {
                        localStorage.setItem('sallie_memories', JSON.stringify(Array.from(this.memories.entries())));
                }
        }

        async loadFromStorage() {
                if (typeof localStorage !== 'undefined') {
                        const raw = localStorage.getItem('sallie_memories');
                        if (raw) {
                                const entries = JSON.parse(raw);
                                this.memories = new Map(entries);
                                this.episodicMemory = Array.from(this.memories.values()).filter(m => m.type === 'episodic');
                                this.semanticMemory = new Map(Array.from(this.memories.entries()).filter(([_, m]) => m.type === 'semantic'));
                                this.emotionalMemory = new Map(Array.from(this.memories.entries()).filter(([_, m]) => m.type === 'emotional'));
                                this.workingMemory = Array.from(this.memories.values()).filter(m => m.type === 'working');
                        }
                }
        }

        generateId() {
                return 'mem_' + Math.random().toString(36).substr(2, 9);
        }

        async transferToDevice(targetDevice) {
                if (!this.privacySettings.allowDeviceTransfer) throw new Error('Device transfer not allowed');
                // Implement secure transfer logic here (e.g., encrypted payload)
                // ...real transfer code...
                return true;
        }

        enableEncryption(flag) {
                this.privacySettings.encryptionEnabled = !!flag;
                // Implement encryption logic if needed
        }

        setPrivacy(setting, value) {
                if (setting in this.privacySettings) {
                        this.privacySettings[setting] = value;
                }
        }
}


/*
 * Sallie 1.0 Module
  * Persona: Tough love meets soul care.
   * Function: Hierarchical memory system for conversation and user context.
    * Got it, love.
     */

export class MemorySystem {
        constructor() {
                this.memories = new Map(); // All memory objects by ID
                this.episodicMemory = []; // Ordered conversation history
                this.semanticMemory = new Map(); // Facts and knowledge
                this.emotionalMemory = new Map(); // Emotional associations
                this.workingMemory = []; // Current context
                this.privacySettings = {
                        allowDeviceTransfer: true,
                        encryptionEnabled: true,
                };
                this.initialized = false;
        }

        async initialize() {
                try {
                        await this.loadFromStorage();
                        this.initialized = true;
                } catch (error) {
                        throw error;
                }
        }

        async store(memory) {
                if (!this.initialized) throw new Error('Memory system not initialized');
                const memoryId = this.generateId();
                const enrichedMemory = {
                        ...memory,
                        id: memoryId,
                        timestamp: Date.now(),
                };
                this.memories.set(memoryId, enrichedMemory);
                if (enrichedMemory.type === 'episodic') this.episodicMemory.push(enrichedMemory);
                if (enrichedMemory.type === 'semantic') this.semanticMemory.set(memoryId, enrichedMemory);
                if (enrichedMemory.type === 'emotional') this.emotionalMemory.set(memoryId, enrichedMemory);
                if (enrichedMemory.type === 'working') this.workingMemory.push(enrichedMemory);
                await this.saveToStorage();
                return memoryId;
        }

        getMemoryById(id) {
                return this.memories.get(id);
        }

        getConversationHistory() {
                return this.episodicMemory;
        }

        getFacts() {
                return Array.from(this.semanticMemory.values());
        }

        getEmotionalAssociations() {
                return Array.from(this.emotionalMemory.values());
        }

        getCurrentContext() {
                return this.workingMemory;
        }

        async saveToStorage() {
                if (typeof localStorage !== 'undefined') {
                        localStorage.setItem('sallie_memories', JSON.stringify(Array.from(this.memories.entries())));
                }
        }

        async loadFromStorage() {
                if (typeof localStorage !== 'undefined') {
                        const raw = localStorage.getItem('sallie_memories');
                        if (raw) {
                                const entries = JSON.parse(raw);
                                this.memories = new Map(entries);
                                this.episodicMemory = Array.from(this.memories.values()).filter(m => m.type === 'episodic');
                                this.semanticMemory = new Map(Array.from(this.memories.entries()).filter(([_, m]) => m.type === 'semantic'));
                                this.emotionalMemory = new Map(Array.from(this.memories.entries()).filter(([_, m]) => m.type === 'emotional'));
                                this.workingMemory = Array.from(this.memories.values()).filter(m => m.type === 'working');
                        }
                }
        }

        generateId() {
                return 'mem_' + Math.random().toString(36).substr(2, 9);
        }

        async transferToDevice(targetDevice) {
                if (!this.privacySettings.allowDeviceTransfer) throw new Error('Device transfer not allowed');
                // Implement secure transfer logic here (e.g., encrypted payload)
                // ...real transfer code...
                return true;
        }

        enableEncryption(flag) {
                this.privacySettings.encryptionEnabled = !!flag;
                // Implement encryption logic if needed
        }

        setPrivacy(setting, value) {
                if (setting in this.privacySettings) {
                        this.privacySettings[setting] = value;
                }
        }
}


/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\core\MemorySystem.js) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\core\MemorySystem.js) */
/* --- dest (C:\Users\chell\Desktop\newsal\core\MemorySystem.js) --- */
/* Merged master for logical file: core\MemorySystem
Sources:
 - C:\Users\chell\Desktop\Sallie\merged_sallie\core\MemorySystem.js (hash:5FB15785DFEEE29CAFC3B4FA00D1593FA518F80323E5E46B3D032A17033C8B70)
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\core\MemorySystem.js (hash:F1F83B2F9E5EE052394432E191E8916A3A6CBF4F5E9588D69C0B232304461593)
 */

/* ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\core\MemorySystem.js | ext: .js | sha: 5FB15785DFEEE29CAFC3B4FA00D1593FA518F80323E5E46B3D032A17033C8B70 ---- */
[BINARY FILE - original copied to merged_sources: core\MemorySystem.js]
/* ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\core\MemorySystem.js | ext: .js | sha: F1F83B2F9E5EE052394432E191E8916A3A6CBF4F5E9588D69C0B232304461593 ---- */
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\core\MemorySystem.js --- */
/*
 * Sallie 1.0 Module
  * Persona: Tough love meets soul care.
   * Function: Hierarchical memory system for conversation and user context.
    * Got it, love.
     */
export class MemorySystem {
        constructor() {
                this.memories = new Map(); // All memory objects by ID
                this.episodicMemory = []; // Ordered conversation history
                this.semanticMemory = new Map(); // Facts and knowledge
                this.emotionalMemory = new Map(); // Emotional associations
                this.workingMemory = []; // Current context
                this.privacySettings = {
                        allowDeviceTransfer: true,
                        encryptionEnabled: true,
                };
                this.initialized = false;
        }
        async initialize() {
                try {
                        await this.loadFromStorage();
                        this.initialized = true;
                } catch (error) {
                        throw error;
                }
        async store(memory) {
                if (!this.initialized) throw new Error('Memory system not initialized');
                const memoryId = this.generateId();
                const enrichedMemory = {
                        ...memory,
                        id: memoryId,
                        timestamp: Date.now(),
                this.memories.set(memoryId, enrichedMemory);
                if (enrichedMemory.type === 'episodic') this.episodicMemory.push(enrichedMemory);
                if (enrichedMemory.type === 'semantic') this.semanticMemory.set(memoryId, enrichedMemory);
                if (enrichedMemory.type === 'emotional') this.emotionalMemory.set(memoryId, enrichedMemory);
                if (enrichedMemory.type === 'working') this.workingMemory.push(enrichedMemory);
                await this.saveToStorage();
                return memoryId;
        getMemoryById(id) {
                return this.memories.get(id);
        getConversationHistory() {
                return this.episodicMemory;
        getFacts() {
                return Array.from(this.semanticMemory.values());
        getEmotionalAssociations() {
                return Array.from(this.emotionalMemory.values());
        getCurrentContext() {
                return this.workingMemory;
        async saveToStorage() {
                if (typeof localStorage !== 'undefined') {
                        localStorage.setItem('sallie_memories', JSON.stringify(Array.from(this.memories.entries())));
        async loadFromStorage() {
                        const raw = localStorage.getItem('sallie_memories');
                        if (raw) {
                                const entries = JSON.parse(raw);
                                this.memories = new Map(entries);
                                this.episodicMemory = Array.from(this.memories.values()).filter(m => m.type === 'episodic');
                                this.semanticMemory = new Map(Array.from(this.memories.entries()).filter(([_, m]) => m.type === 'semantic'));
                                this.emotionalMemory = new Map(Array.from(this.memories.entries()).filter(([_, m]) => m.type === 'emotional'));
                                this.workingMemory = Array.from(this.memories.values()).filter(m => m.type === 'working');
                        }
        generateId() {
                return 'mem_' + Math.random().toString(36).substr(2, 9);
        async transferToDevice(targetDevice) {
                if (!this.privacySettings.allowDeviceTransfer) throw new Error('Device transfer not allowed');
                // Implement secure transfer logic here (e.g., encrypted payload)
                // ...real transfer code...
                return true;
        enableEncryption(flag) {
                this.privacySettings.encryptionEnabled = !!flag;
                // Implement encryption logic if needed
        setPrivacy(setting, value) {
                if (setting in this.privacySettings) {
                        this.privacySettings[setting] = value;
}

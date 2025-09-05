// Salle Persona Module
// AdaptiveConversationSystem.js (converted from TypeScript)
// TypeScript compatibility adapted for JS

/**
 * @typedef {Object} ConversationThread
 * @property {string} id - Unique identifier for the thread
 * @property {Message[]} messages - Messages in the thread
 * @property {Object} metadata - Additional data about the thread
 * @property {number} lastUpdated - Timestamp of last update
 */

/**
 * @typedef {Object} Message
 * @property {string} id - Unique identifier for the message
 * @property {string} content - Content of the message
 * @property {string} role - Role of the sender (user or assistant)
 * @property {number} timestamp - When the message was sent
 * @property {Object} metadata - Additional data about the message
 */

/**
 * Adaptive Conversation System provides conversation thread management
 * with memory integration and context adaptation
 */
class AdaptiveConversationSystem {
    /**
     * Create a new AdaptiveConversationSystem
     * @param {Object} memorySystem - Memory system for conversation context
     */
    constructor(memorySystem) {
        this.memorySystem = memorySystem;
        this.threads = new Map();
        this.activeThreadId = null;
    }

    startConversationThread(topic, userId) {
        const threadId = `thread_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        this.threads.set(threadId, {
            id: threadId,
            topic,
            userId,
            messages: [],
            createdAt: Date.now(),
            lastActive: Date.now()
        });
        this.activeThreadId = threadId;
        return threadId;
    }

    addMessageToThread(threadId, message, sender) {
        const thread = this.threads.get(threadId);
        if (!thread) throw new Error('Thread not found');
        thread.messages.push({ sender, message, timestamp: Date.now() });
        thread.lastActive = Date.now();
        this.memorySystem.store({ type: 'conversation', threadId, message, sender, timestamp: Date.now() });
    }

    switchThread(threadId) {
        if (!this.threads.has(threadId)) throw new Error('Thread not found');
        this.activeThreadId = threadId;
    }

    getActiveThread() {
        return this.threads.get(this.activeThreadId);
    }

    getThreadMessages(threadId) {
        const thread = this.threads.get(threadId);
        return thread ? thread.messages : [];
    }

    getAllThreads() {
        return Array.from(this.threads.values());
    }

    recallContext(threadId) {
        // Retrieve context from memory system for this thread
        return this.memorySystem.getConversationHistory().filter(m => m.threadId === threadId);
    }

    mergeThreads(threadIdA, threadIdB) {
        const threadA = this.threads.get(threadIdA);
        const threadB = this.threads.get(threadIdB);
        if (!threadA || !threadB) throw new Error('Thread not found');
        threadA.messages = threadA.messages.concat(threadB.messages);
        threadA.lastActive = Math.max(threadA.lastActive, threadB.lastActive);
        this.threads.delete(threadIdB);
    }

    modelTopicSwitch(message) {
        // Simple topic modeling: switch if message contains new topic keyword
        const keywords = ['switch', 'change topic', 'new subject'];
        if (keywords.some(k => message.toLowerCase().includes(k))) {
            this.activeThreadId = null;
        }
    }
}

module.exports = AdaptiveConversationSystem;

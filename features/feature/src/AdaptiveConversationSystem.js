/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Adaptive conversation system for managing conversation threads and context.
 * Got it, love.
 */

/**
 * Adaptive Conversation System for managing conversation threads and memory
 * Handles conversation flow, context switching, and memory integration
 */
class AdaptiveConversationSystem {
    /**
     * @param {Object} memorySystem - The memory system for storing conversation data
     */
    constructor(memorySystem) {
        if (!memorySystem) {
            throw new Error('Memory system is required for AdaptiveConversationSystem');
        }

        this.memorySystem = memorySystem;
        this.threads = new Map();
        this.activeThreadId = null;
    }

    /**
     * Start a new conversation thread
     * @param {string} topic - The topic of the conversation
     * @param {string} userId - The user ID
     * @returns {string} The thread ID
     */
    startConversationThread(topic, userId) {
        if (!topic || !userId) {
            throw new Error('Topic and userId are required to start a conversation thread');
        }

        const threadId = `thread_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const thread = {
            id: threadId,
            topic,
            userId,
            messages: [],
            createdAt: Date.now(),
            lastActive: Date.now()
        };

        this.threads.set(threadId, thread);
        this.activeThreadId = threadId;

        console.log(`Started conversation thread: ${threadId} for topic: ${topic}`); // eslint-disable-line no-console
        return threadId;
    }

    /**
     * Add a message to a conversation thread
     * @param {string} threadId - The thread ID
     * @param {string} message - The message content
     * @param {string} sender - The sender identifier
     */
    addMessageToThread(threadId, message, sender) {
        if (!threadId || !message || !sender) {
            throw new Error('ThreadId, message, and sender are required');
        }

        const thread = this.threads.get(threadId);
        if (!thread) {
            throw new Error(`Thread not found: ${threadId}`);
        }

        const messageObj = {
            sender,
            message,
            timestamp: Date.now()
        };

        thread.messages.push(messageObj);
        thread.lastActive = Date.now();

        // Store in memory system
        try {
            this.memorySystem.store({
                type: 'conversation',
                threadId,
                message,
                sender,
                timestamp: Date.now()
            });
        } catch (error) {
            console.error('Failed to store message in memory system:', error); // eslint-disable-line no-console
        }
    }

    /**
     * Switch to a different conversation thread
     * @param {string} threadId - The thread ID to switch to
     */
    switchThread(threadId) {
        if (!threadId) {
            throw new Error('ThreadId is required');
        }

        if (!this.threads.has(threadId)) {
            throw new Error(`Thread not found: ${threadId}`);
        }

        this.activeThreadId = threadId;
        console.log(`Switched to thread: ${threadId}`); // eslint-disable-line no-console
    }

    /**
     * Get the currently active thread
     * @returns {Object|null} The active thread object
     */
    getActiveThread() {
        return this.activeThreadId ? this.threads.get(this.activeThreadId) : null;
    }

    /**
     * Get messages from a specific thread
     * @param {string} threadId - The thread ID
     * @returns {Array} Array of messages
     */
    getThreadMessages(threadId) {
        if (!threadId) {
            return [];
        }

        const thread = this.threads.get(threadId);
        return thread ? thread.messages : [];
    }

    /**
     * Get all conversation threads
     * @returns {Array} Array of all threads
     */
    getAllThreads() {
        return Array.from(this.threads.values());
    }

    /**
     * Recall context from memory system for a thread
     * @param {string} threadId - The thread ID
     * @returns {Array} Array of historical messages
     */
    recallContext(threadId) {
        if (!threadId) {
            return [];
        }

        try {
            // Retrieve context from memory system for this thread
            const history = this.memorySystem.getConversationHistory();
            return history.filter(m => m.threadId === threadId);
        } catch (error) {
            console.error('Failed to recall context:', error);
            return [];
        }
    }

    /**
     * Merge two conversation threads
     * @param {string} threadIdA - First thread ID
     * @param {string} threadIdB - Second thread ID
     */
    mergeThreads(threadIdA, threadIdB) {
        if (!threadIdA || !threadIdB) {
            throw new Error('Both thread IDs are required');
        }

        const threadA = this.threads.get(threadIdA);
        const threadB = this.threads.get(threadIdB);

        if (!threadA || !threadB) {
            throw new Error('One or both threads not found');
        }

        // Merge messages and update timestamps
        threadA.messages = threadA.messages.concat(threadB.messages);
        threadA.lastActive = Math.max(threadA.lastActive, threadB.lastActive);

        // Remove the second thread
        this.threads.delete(threadIdB);

        console.log(`Merged thread ${threadIdB} into ${threadIdA}`);
    }

    /**
     * Model topic switching based on message content
     * @param {string} message - The message to analyze
     */
    modelTopicSwitch(message) {
        if (!message) {
            return;
        }

        // Simple topic modeling: switch if message contains new topic keyword
        const keywords = ['switch', 'change topic', 'new subject', 'new topic'];
        if (keywords.some(k => message.toLowerCase().includes(k))) {
            console.log('Topic switch detected, clearing active thread');
            this.activeThreadId = null;
        }
    }

    /**
     * Clean up old threads (older than specified days)
     * @param {number} daysOld - Number of days to keep threads
     * @returns {number} Number of threads cleaned up
     */
    cleanupOldThreads(daysOld = 30) {
        const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
        let cleanedCount = 0;

        for (const [threadId, thread] of this.threads) {
            if (thread.lastActive < cutoffTime) {
                this.threads.delete(threadId);
                cleanedCount++;
            }
        }

        if (cleanedCount > 0) {
            console.log(`Cleaned up ${cleanedCount} old threads`);
        }

        return cleanedCount;
    }

    /**
     * Get statistics about the conversation system
     * @returns {Object} Statistics object
     */
    getStats() {
        const threads = Array.from(this.threads.values());
        const totalMessages = threads.reduce((sum, thread) => sum + thread.messages.length, 0);

        return {
            totalThreads: threads.length,
            totalMessages,
            activeThread: this.activeThreadId,
            averageMessagesPerThread: threads.length > 0 ? totalMessages / threads.length : 0
        };
    }
}

// Export for both CommonJS and ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdaptiveConversationSystem;
}

if (typeof exports !== 'undefined') {
    exports.AdaptiveConversationSystem = AdaptiveConversationSystem;
}

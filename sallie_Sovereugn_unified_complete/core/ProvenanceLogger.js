/*
 * Persona: Tough love meets soul care.
 * Module: Provenance Logger
 * Intent: Track all changes, decisions, and interactions with unique IDs and timestamps for audit and debugging.
 * Provenance-ID: 550e8400-e29b-41d4-a716-446655440001
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

export class ProvenanceLogger {
    constructor() {
        this.logEntries = new Map();
        this.activeSessions = new Map();
    }

    generateProvenanceId() {
        return crypto.randomUUID();
    }

    logEvent(eventType, details, userId = null) {
        const entry = {
            id: this.generateProvenanceId(),
            timestamp: new Date().toISOString(),
            eventType,
            details,
            userId,
            sessionId: this.getSessionId(userId)
        };

        this.logEntries.set(entry.id, entry);
        console.log(`[PROVENANCE] ${eventType}: ${JSON.stringify(details)} (ID: ${entry.id})`);

        return entry.id;
    }

    startSession(userId) {
        const sessionId = this.generateProvenanceId();
        this.activeSessions.set(userId, {
            sessionId,
            startTime: new Date().toISOString(),
            events: []
        });
        return sessionId;
    }

    endSession(userId) {
        const session = this.activeSessions.get(userId);
        if (session) {
            session.endTime = new Date().toISOString();
            this.logEvent('session_end', { sessionId: session.sessionId }, userId);
            this.activeSessions.delete(userId);
        }
    }

    getSessionId(userId) {
        const session = this.activeSessions.get(userId);
        return session ? session.sessionId : null;
    }

    getEntriesForUser(userId) {
        return Array.from(this.logEntries.values()).filter(entry => entry.userId === userId);
    }

    getEntriesByType(eventType) {
        return Array.from(this.logEntries.values()).filter(entry => entry.eventType === eventType);
    }

    exportLog() {
        return {
            entries: Array.from(this.logEntries.values()),
            sessions: Array.from(this.activeSessions.values()),
            exportTime: new Date().toISOString()
        };
    }
}

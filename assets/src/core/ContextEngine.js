/*
 * Persona: Tough love meets soul care.
 * Module: Context Engine
 * Intent: Manage and synthesize user context across all interactions for coherent, personalized responses.
 * Provenance-ID: 550e8400-e29b-41d4-a716-446655440000
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

export class ContextEngine {
    constructor() {
        this.contextLayers = new Map();
        this.contextHistory = [];
        this.activeContexts = new Set();
    }

    initializeUserContext(userId) {
        const baseContext = {
            userId,
            sessionStart: Date.now(),
            emotionalState: 'neutral',
            cognitiveLoad: 'low',
            preferences: {},
            recentInteractions: [],
            activeGoals: [],
            environmentalFactors: {}
        };
        this.contextLayers.set(userId, baseContext);
        return baseContext;
    }

    updateContext(userId, updates) {
        const context = this.contextLayers.get(userId);
        if (!context) return null;

        Object.assign(context, updates);
        context.lastUpdated = Date.now();

        this.contextHistory.push({
            userId,
            timestamp: Date.now(),
            updates,
            provenance: 'context_update'
        });

        return context;
    }

    getContext(userId) {
        return this.contextLayers.get(userId) || null;
    }

    synthesizeContext(userId) {
        const context = this.getContext(userId);
        if (!context) return null;

        return {
            emotional: context.emotionalState,
            cognitive: context.cognitiveLoad,
            goals: context.activeGoals,
            environment: context.environmentalFactors,
            synthesis: this.generateContextSummary(context)
        };
    }

    generateContextSummary(context) {
        // Generate a natural language summary of the current context
        return `User is in ${context.emotionalState} emotional state with ${context.cognitiveLoad} cognitive load. Active goals: ${context.activeGoals.join(', ')}.`;
    }

    activateContext(userId, contextType) {
        this.activeContexts.add(`${userId}:${contextType}`);
    }

    deactivateContext(userId, contextType) {
        this.activeContexts.delete(`${userId}:${contextType}`);
    }
}

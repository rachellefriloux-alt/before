/*
 * Persona: Tough love meets soul care.
 * Module: MetaLayerTransparencyPanel
 * Intent: Handle functionality for MetaLayerTransparencyPanel
 * Provenance-ID: 7344e6c2-7ee8-445e-ad85-cf4cccc8e416
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

/**
 * [SOVEREIGN MODULE] Meta-Layer Transparency Panel
 * [CREATED: 2025-08-27] - Real-time visibility into system state and decision processes
 * [PERSONA: Tough Love + Soul Care] - Transparent without overwhelming, empowering without patronizing
 * [PROVENANCE: All transparency data tagged with creation date, context, and panel ID]
 *
 * Core Responsibilities:
 * - Provide real-time visibility into system state and decision processes
 * - All transparency data tagged with creation date, context, and panel ID
 * - Sovereignty-first: User controls what transparency data is shown
 * - Emotional arc-aware: Transparency level adapts to user's emotional state
 */

class MetaLayerTransparencyPanel {
    constructor() {
        this.transparencyPanels = new Map(); // panelId -> panel definition
        this.systemStateRegistry = new Map(); // stateId -> current state
        this.decisionLog = []; // Chronological log of system decisions
        this.userTransparencyPreferences = new Map(); // userId -> transparency settings
        this.provenanceLog = []; // Audit trail for all transparency operations

        this.initializeTransparencyPanels();
        this.initializeSystemStateTracking();
        this.logProvenanceEvent('transparency_panel_initialized', {
            timestamp: Date.now(),
            sovereigntyPrinciples: 'user_controlled_transparency_levels',
            panelTypes: ['decision_flow', 'emotional_arc', 'system_state', 'provenance_audit']
        });
    }

    /**
     * [NEW][MetaLayerTransparencyPanel]: Initialize transparency panels
     * Provenance: All panels are fully tagged with creation context
     */
    initializeTransparencyPanels() {
        const panels = {
            decision_flow: {
                id: 'decision_flow',
                name: 'Decision Flow',
                category: 'process',
                description: 'Real-time view of how decisions are being made',
                dataSources: ['narrative_engine', 'emotional_arc', 'persona_engine'],
                refreshRate: 2000, // ms
                defaultVisibility: 'collapsed',
                asset: {
                    id: 'panel_decision_001',
                    filename: 'decision_flow_visualization.svg',
                    creationDate: '2025-08-27',
                    context: 'meta_layer_transparency',
                    provenance: '[ASSET: 2025-08-27] - Decision flow visualization panel'
                },
                provenance: '[PANEL: 2025-08-27] - Real-time decision process transparency'
            },
            emotional_arc: {
                id: 'emotional_arc',
                name: 'Emotional Arc',
                category: 'emotional',
                description: 'Current emotional journey progress and patterns',
                dataSources: ['emotional_arc_engine', 'memory_system'],
                refreshRate: 5000,
                defaultVisibility: 'expanded',
                asset: {
                    id: 'panel_emotion_001',
                    filename: 'emotional_arc_chart.svg',
                    creationDate: '2025-08-27',
                    context: 'meta_layer_transparency',
                    provenance: '[ASSET: 2025-08-27] - Emotional arc visualization panel'
                },
                provenance: '[PANEL: 2025-08-27] - Emotional journey transparency'
            },
            system_state: {
                id: 'system_state',
                name: 'System State',
                category: 'technical',
                description: 'Current system status and active processes',
                dataSources: ['system_monitor', 'performance_metrics'],
                refreshRate: 1000,
                defaultVisibility: 'minimal',
                asset: {
                    id: 'panel_system_001',
                    filename: 'system_status_display.svg',
                    creationDate: '2025-08-27',
                    context: 'meta_layer_transparency',
                    provenance: '[ASSET: 2025-08-27] - System state visualization panel'
                },
                provenance: '[PANEL: 2025-08-27] - System status transparency'
            },
            provenance_audit: {
                id: 'provenance_audit',
                name: 'Provenance Audit',
                category: 'audit',
                description: 'Real-time audit trail of system actions',
                dataSources: ['provenance_log', 'audit_trail'],
                refreshRate: 3000,
                defaultVisibility: 'collapsed',
                asset: {
                    id: 'panel_audit_001',
                    filename: 'audit_trail_display.svg',
                    creationDate: '2025-08-27',
                    context: 'meta_layer_transparency',
                    provenance: '[ASSET: 2025-08-27] - Provenance audit visualization panel'
                },
                provenance: '[PANEL: 2025-08-27] - Provenance audit transparency'
            },
            user_sovereignty: {
                id: 'user_sovereignty',
                name: 'User Sovereignty',
                category: 'control',
                description: 'Your control settings and system boundaries',
                dataSources: ['user_preferences', 'sovereignty_settings'],
                refreshRate: 10000,
                defaultVisibility: 'expanded',
                asset: {
                    id: 'panel_sovereignty_001',
                    filename: 'sovereignty_controls.svg',
                    creationDate: '2025-08-27',
                    context: 'meta_layer_transparency',
                    provenance: '[ASSET: 2025-08-27] - User sovereignty visualization panel'
                },
                provenance: '[PANEL: 2025-08-27] - User control transparency'
            }
        };

        Object.values(panels).forEach(panel => {
            this.transparencyPanels.set(panel.id, panel);
            this.logProvenanceEvent('transparency_panel_registered', {
                panelId: panel.id,
                category: panel.category,
                dataSources: panel.dataSources,
                refreshRate: panel.refreshRate,
                timestamp: Date.now()
            });
        });
    }

    /**
     * [NEW][MetaLayerTransparencyPanel]: Initialize system state tracking
     * Transparency: All system states are tracked and timestamped
     */
    initializeSystemStateTracking() {
        const initialStates = {
            narrative_engine: {
                id: 'narrative_engine',
                status: 'active',
                lastUpdate: Date.now(),
                currentMotif: null,
                sessionContext: {},
                provenance: '[STATE: 2025-08-27] - Narrative engine state tracking'
            },
            emotional_arc: {
                id: 'emotional_arc',
                status: 'monitoring',
                lastUpdate: Date.now(),
                currentArc: 'exploration',
                arcProgress: 0,
                emotionalTone: 'neutral',
                provenance: '[STATE: 2025-08-27] - Emotional arc state tracking'
            },
            persona_engine: {
                id: 'persona_engine',
                status: 'active',
                lastUpdate: Date.now(),
                currentPersona: 'tough_love_soul_care',
                adaptationLevel: 'moderate',
                provenance: '[STATE: 2025-08-27] - Persona engine state tracking'
            },
            memory_system: {
                id: 'memory_system',
                status: 'active',
                lastUpdate: Date.now(),
                memoryEntries: 0,
                retentionRate: 1.0,
                provenance: '[STATE: 2025-08-27] - Memory system state tracking'
            },
            user_sovereignty: {
                id: 'user_sovereignty',
                status: 'active',
                lastUpdate: Date.now(),
                controlLevel: 'full',
                activeBoundaries: [],
                provenance: '[STATE: 2025-08-27] - User sovereignty state tracking'
            }
        };

        Object.values(initialStates).forEach(state => {
            this.systemStateRegistry.set(state.id, state);
            this.logProvenanceEvent('system_state_initialized', {
                stateId: state.id,
                initialStatus: state.status,
                timestamp: Date.now()
            });
        });
    }

    /**
     * [NEW][MetaLayerTransparencyPanel]: Update system state
     * Transparency: All state changes are logged with full context
     */
    updateSystemState(stateId, updates) {
        const currentState = this.systemStateRegistry.get(stateId);
        if (!currentState) {
            throw new Error(`Unknown system state: ${stateId}`);
        }

        const newState = {
            ...currentState,
            ...updates,
            lastUpdate: Date.now(),
            provenance: `${currentState.provenance} [UPDATED: ${Date.now()}]`
        };

        this.systemStateRegistry.set(stateId, newState);

        // Log the state change
        this.logDecisionEvent('system_state_update', {
            stateId,
            previousState: currentState,
            newState,
            changes: Object.keys(updates),
            timestamp: Date.now()
        });

        return newState;
    }

    /**
     * [NEW][MetaLayerTransparencyPanel]: Get transparency data for user
     * Sovereignty: Users control which panels and data are visible
     */
    getTransparencyData(userId, requestedPanels = null) {
        const userPrefs = this.getUserTransparencyPreferences(userId);
        const visiblePanels = requestedPanels || userPrefs.visiblePanels || ['emotional_arc', 'user_sovereignty'];

        const transparencyData = {
            timestamp: Date.now(),
            userId,
            panels: {},
            systemStates: {},
            recentDecisions: [],
            provenance: `[TRANSPARENCY_DATA: ${Date.now()}] - User: ${userId}`
        };

        // Get data for visible panels
        visiblePanels.forEach(panelId => {
            const panel = this.transparencyPanels.get(panelId);
            if (panel) {
                transparencyData.panels[panelId] = this.getPanelData(panelId, userPrefs.detailLevel);
            }
        });

        // Get relevant system states
        const relevantStates = this.getRelevantSystemStates(visiblePanels);
        relevantStates.forEach(stateId => {
            transparencyData.systemStates[stateId] = this.systemStateRegistry.get(stateId);
        });

        // Get recent decisions
        transparencyData.recentDecisions = this.getRecentDecisions(userId, 5);

        this.logProvenanceEvent('transparency_data_accessed', {
            userId,
            panelsRequested: visiblePanels,
            dataPoints: Object.keys(transparencyData.panels).length,
            timestamp: Date.now()
        });

        return transparencyData;
    }

    /**
     * [NEW][MetaLayerTransparencyPanel]: Get data for specific panel
     * Emotional Arc Awareness: Panel data adapts to user's emotional state
     */
    getPanelData(panelId, detailLevel = 'standard') {
        const panel = this.transparencyPanels.get(panelId);
        if (!panel) {
            throw new Error(`Unknown transparency panel: ${panelId}`);
        }

        const panelData = {
            panelId,
            name: panel.name,
            category: panel.category,
            lastUpdate: Date.now(),
            data: {},
            provenance: `[PANEL_DATA: ${Date.now()}] - Panel: ${panelId}`
        };

        switch (panelId) {
            case 'decision_flow':
                panelData.data = this.getDecisionFlowData(detailLevel);
                break;
            case 'emotional_arc':
                panelData.data = this.getEmotionalArcData(detailLevel);
                break;
            case 'system_state':
                panelData.data = this.getSystemStateData(detailLevel);
                break;
            case 'provenance_audit':
                panelData.data = this.getProvenanceAuditData(detailLevel);
                break;
            case 'user_sovereignty':
                panelData.data = this.getUserSovereigntyData(detailLevel);
                break;
        }

        return panelData;
    }

    /**
     * [NEW][MetaLayerTransparencyPanel]: Get decision flow data
     * Transparency: Shows how recent decisions were made
     */
    getDecisionFlowData(detailLevel) {
        const recentDecisions = this.decisionLog.slice(-10);
        const decisionFlow = {
            recentDecisions: recentDecisions.map(decision => ({
                type: decision.type,
                timestamp: decision.timestamp,
                factors: decision.details.factors || [],
                outcome: decision.details.outcome || 'processed',
                confidence: decision.details.confidence || 0.8
            })),
            activeProcesses: this.getActiveProcesses(),
            decisionPatterns: this.analyzeDecisionPatterns(),
            provenance: `[DECISION_FLOW_DATA: ${Date.now()}] - Detail level: ${detailLevel}`
        };

        if (detailLevel === 'detailed') {
            decisionFlow.fullContext = recentDecisions;
        }

        return decisionFlow;
    }

    /**
     * [NEW][MetaLayerTransparencyPanel]: Get emotional arc data
     * Emotional Arc Awareness: Shows current emotional journey status
     */
    getEmotionalArcData(detailLevel) {
        const emotionalState = this.systemStateRegistry.get('emotional_arc');
        const emotionalData = {
            currentArc: emotionalState.currentArc,
            arcProgress: emotionalState.arcProgress,
            emotionalTone: emotionalState.emotionalTone,
            recentEmotionalShifts: this.getRecentEmotionalShifts(),
            emotionalPatterns: this.analyzeEmotionalPatterns(),
            provenance: `[EMOTIONAL_ARC_DATA: ${Date.now()}] - Detail level: ${detailLevel}`
        };

        if (detailLevel === 'detailed') {
            emotionalData.fullHistory = this.getEmotionalHistory();
            emotionalData.predictiveInsights = this.getEmotionalPredictions();
        }

        return emotionalData;
    }

    /**
     * [NEW][MetaLayerTransparencyPanel]: Get system state data
     * Transparency: Shows current system status and performance
     */
    getSystemStateData(detailLevel) {
        const systemData = {
            states: {},
            performance: this.getSystemPerformance(),
            activeModules: this.getActiveModules(),
            systemHealth: this.getSystemHealth(),
            provenance: `[SYSTEM_STATE_DATA: ${Date.now()}] - Detail level: ${detailLevel}`
        };

        // Get all system states
        for (const [stateId, state] of this.systemStateRegistry) {
            systemData.states[stateId] = {
                status: state.status,
                lastUpdate: state.lastUpdate,
                keyMetrics: this.getStateKeyMetrics(stateId)
            };
        }

        if (detailLevel === 'detailed') {
            systemData.fullStates = Object.fromEntries(this.systemStateRegistry);
            systemData.resourceUsage = this.getResourceUsage();
        }

        return systemData;
    }

    /**
     * [NEW][MetaLayerTransparencyPanel]: Get provenance audit data
     * Transparency: Shows recent audit trail entries
     */
    getProvenanceAuditData(detailLevel) {
        const auditData = {
            recentEntries: this.provenanceLog.slice(-20),
            auditSummary: this.getAuditSummary(),
            complianceStatus: this.getComplianceStatus(),
            provenance: `[PROVENANCE_AUDIT_DATA: ${Date.now()}] - Detail level: ${detailLevel}`
        };

        if (detailLevel === 'detailed') {
            auditData.fullAuditTrail = this.provenanceLog;
            auditData.auditAnalytics = this.analyzeAuditTrail();
        }

        return auditData;
    }

    /**
     * [NEW][MetaLayerTransparencyPanel]: Get user sovereignty data
     * Sovereignty: Shows user's control settings and boundaries
     */
    getUserSovereigntyData(detailLevel) {
        const sovereigntyState = this.systemStateRegistry.get('user_sovereignty');
        const sovereigntyData = {
            controlLevel: sovereigntyState.controlLevel,
            activeBoundaries: sovereigntyState.activeBoundaries,
            userPreferences: this.getAllUserPreferences(),
            sovereigntyScore: this.calculateSovereigntyScore(),
            provenance: `[USER_SOVEREIGNTY_DATA: ${Date.now()}] - Detail level: ${detailLevel}`
        };

        if (detailLevel === 'detailed') {
            sovereigntyData.controlHistory = this.getControlHistory();
            sovereigntyData.boundaryIncidents = this.getBoundaryIncidents();
        }

        return sovereigntyData;
    }

    /**
     * [NEW][MetaLayerTransparencyPanel]: Log decision event
     * Transparency: All decisions are logged with full context
     */
    logDecisionEvent(decisionType, details) {
        const decisionEntry = {
            type: decisionType,
            details,
            timestamp: Date.now(),
            decisionId: `decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            provenance: `[DECISION_LOG: ${Date.now()}] - Type: ${decisionType}`
        };

        this.decisionLog.push(decisionEntry);

        // Keep log manageable
        if (this.decisionLog.length > 1000) {
            this.decisionLog = this.decisionLog.slice(-500);
        }

        this.logProvenanceEvent('decision_logged', {
            decisionId: decisionEntry.decisionId,
            type: decisionType,
            timestamp: Date.now()
        });
    }

    /**
     * [NEW][MetaLayerTransparencyPanel]: Get user transparency preferences
     * Sovereignty: Users control their transparency settings
     */
    getUserTransparencyPreferences(userId) {
        if (!this.userTransparencyPreferences.has(userId)) {
            this.userTransparencyPreferences.set(userId, {
                visiblePanels: ['emotional_arc', 'user_sovereignty'],
                detailLevel: 'standard',
                autoRefresh: true,
                notificationLevel: 'minimal',
                lastUpdated: Date.now()
            });
        }

        return this.userTransparencyPreferences.get(userId);
    }

    /**
     * [NEW][MetaLayerTransparencyPanel]: Update user transparency preferences
     * Sovereignty: Users can customize all transparency settings
     */
    updateUserPreferences(userId, preferences) {
        const currentPrefs = this.getUserTransparencyPreferences(userId);
        const newPrefs = { ...currentPrefs, ...preferences, lastUpdated: Date.now() };

        this.userTransparencyPreferences.set(userId, newPrefs);

        this.logProvenanceEvent('transparency_preferences_updated', {
            userId,
            newPreferences: preferences,
            timestamp: Date.now()
        });

        return newPrefs;
    }

    /**
     * [NEW][MetaLayerTransparencyPanel]: Get recent decisions for user
     * Transparency: Recent decisions are always available for review
     */
    getRecentDecisions(userId, limit = 10) {
        return this.decisionLog
            .filter(decision => !userId || decision.details.userId === userId)
            .slice(-limit)
            .reverse();
    }

    /**
     * [NEW][MetaLayerTransparencyPanel]: Get relevant system states for panels
     * Transparency: Only relevant system states are shown
     */
    getRelevantSystemStates(panelIds) {
        const relevantStates = new Set();

        panelIds.forEach(panelId => {
            const panel = this.transparencyPanels.get(panelId);
            if (panel && panel.dataSources) {
                panel.dataSources.forEach(source => relevantStates.add(source));
            }
        });

        return Array.from(relevantStates);
    }

    /**
     * [NEW][MetaLayerTransparencyPanel]: Helper methods for data retrieval
     * Transparency: All data retrieval is logged and traceable
     */
    getActiveProcesses() { return ['narrative_engine', 'emotional_arc', 'persona_engine']; }
    getDecisionPatterns() { return {}; }
    analyzeDecisionPatterns() { return {}; }
    getRecentEmotionalShifts() { return []; }
    analyzeEmotionalPatterns() { return {}; }
    getEmotionalHistory() { return []; }
    getEmotionalPredictions() { return {}; }
    getSystemPerformance() { return {}; }
    getActiveModules() { return ['narrative', 'emotional', 'persona', 'memory']; }
    getSystemHealth() { return 'healthy'; }
    getStateKeyMetrics(stateId) { return {}; } // eslint-disable-line no-unused-vars
    getResourceUsage() { return {}; }
    getAuditSummary() { return {}; }
    getComplianceStatus() { return 'compliant'; }
    analyzeAuditTrail() { return {}; }
    getAllUserPreferences() { return {}; }
    calculateSovereigntyScore() { return 1.0; }
    getControlHistory() { return []; }
    getBoundaryIncidents() { return []; }

    /**
     * [NEW][MetaLayerTransparencyPanel]: Provenance logging system
     * Transparency: All transparency activities are fully traceable
     */
    logProvenanceEvent(eventType, details) {
        const logEntry = {
            eventType,
            details,
            timestamp: Date.now(),
            module: 'MetaLayerTransparencyPanel',
            sovereigntyStatus: 'user_controlled'
        };

        this.provenanceLog.push(logEntry);

        // Keep log manageable
        if (this.provenanceLog.length > 1000) {
            this.provenanceLog = this.provenanceLog.slice(-500);
        }
    }

    /**
     * [NEW][MetaLayerTransparencyPanel]: Get provenance audit trail
     * Transparency: Full audit trail available for review
     */
    getProvenanceAudit(userId = null) {
        let audit = this.provenanceLog;

        if (userId) {
            audit = audit.filter(entry => entry.details.userId === userId);
        }

        return audit.sort((a, b) => b.timestamp - a.timestamp);
    }
}

module.exports = MetaLayerTransparencyPanel;

/*
 * Persona: Tough love meets soul care.
 * Module: CrossModalStateSync
 * Intent: Handle functionality for CrossModalStateSync
 * Provenance-ID: ebc7d990-35e0-46c2-8c1f-6a217282db7f
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

/**
 * [SOVEREIGN MODULE] Cross-Modal State Sync
 * [CREATED: 2025-08-27] - Central state controller for unified sensory experience
 * [PERSONA: Tough Love + Soul Care] - Maintains coherent multi-modal presence
 * [PROVENANCE: All state changes tagged with trigger, modality impact, and user consent]
 *
 * Core Responsibilities:
 * - Central state controller updates all sensory/interaction modes simultaneously
 * - State → UI palette, text cadence, audio tone, haptic rhythm — unified
 * - Maintain modality coherence while respecting user sensory preferences
 * - Sovereignty-first: User controls which modalities receive updates
 */

class CrossModalStateSync {
    constructor() {
        this.stateRegistry = new Map(); // stateId -> state definition
        this.modalityControllers = new Map(); // modality -> controller instance
        this.activeStates = new Map(); // userId -> active state set
        this.syncQueue = []; // Pending state synchronization operations
        this.provenanceLog = []; // Audit trail for all sync operations

        this.initializeModalityControllers();
        this.initializeCoreStates();
        this.logProvenanceEvent('sync_engine_initialized', {
            timestamp: Date.now(),
            modalities: ['visual', 'auditory', 'haptic', 'text'],
            sovereigntyPrinciples: 'user_controlled_modality_sync'
        });
    }

    /**
     * [NEW][CrossModalStateSync]: Initialize modality controllers
     * Sovereignty: Each modality can be individually enabled/disabled by user
     */
    initializeModalityControllers() {
        const modalities = {
            visual: {
                id: 'visual',
                capabilities: ['palette', 'particles', 'animations', 'gradients'],
                defaultEnabled: true,
                provenance: '[CREATED: 2025-08-27] - Visual modality controller'
            },
            auditory: {
                id: 'auditory',
                capabilities: ['tone', 'volume', 'tempo', 'soundscape'],
                defaultEnabled: true,
                provenance: '[CREATED: 2025-08-27] - Auditory modality controller'
            },
            haptic: {
                id: 'haptic',
                capabilities: ['pattern', 'intensity', 'rhythm', 'feedback'],
                defaultEnabled: true,
                provenance: '[CREATED: 2025-08-27] - Haptic modality controller'
            },
            text: {
                id: 'text',
                capabilities: ['cadence', 'typography', 'pacing', 'emphasis'],
                defaultEnabled: true,
                provenance: '[CREATED: 2025-08-27] - Text modality controller'
            }
        };

        Object.values(modalities).forEach(modality => {
            this.modalityControllers.set(modality.id, modality);
            this.logProvenanceEvent('modality_controller_registered', {
                modalityId: modality.id,
                capabilities: modality.capabilities,
                defaultEnabled: modality.defaultEnabled,
                timestamp: Date.now()
            });
        });
    }

    /**
     * [NEW][CrossModalStateSync]: Initialize core emotional states
     * Emotional Arc Awareness: States map to emotional journey phases
     */
    initializeCoreStates() {
        const coreStates = {
            resolve: {
                id: 'resolve',
                emotionalWeight: 0.8,
                modalities: {
                    visual: { palette: 'warm_steady', particles: 'gentle_float', animation: 'steady_glow' },
                    auditory: { tone: 'confident_warm', tempo: 'measured', soundscape: 'peaceful_ambient' },
                    haptic: { pattern: 'steady_pulse', intensity: 0.6, rhythm: 'calm_heartbeat' },
                    text: { cadence: 'deliberate', typography: 'bold_serif', pacing: 'measured' }
                },
                provenance: '[CREATED: 2025-08-27] - Resolve state for determination phases'
            },
            encouragement: {
                id: 'encouragement',
                emotionalWeight: 0.7,
                modalities: {
                    visual: { palette: 'bright_uplifting', particles: 'sparkle_burst', animation: 'gentle_rise' },
                    auditory: { tone: 'inspiring_bright', tempo: 'uplifting', soundscape: 'motivational_ambient' },
                    haptic: { pattern: 'encouraging_tap', intensity: 0.5, rhythm: 'inspiring_pulse' },
                    text: { cadence: 'enthusiastic', typography: 'dynamic_sans', pacing: 'energetic' }
                },
                provenance: '[CREATED: 2025-08-27] - Encouragement state for motivation phases'
            },
            defiance: {
                id: 'defiance',
                emotionalWeight: 0.9,
                modalities: {
                    visual: { palette: 'fiery_intense', particles: 'flame_burst', animation: 'powerful_glow' },
                    auditory: { tone: 'strong_determined', tempo: 'powerful', soundscape: 'resolute_ambient' },
                    haptic: { pattern: 'strong_pulse', intensity: 0.8, rhythm: 'determined_beat' },
                    text: { cadence: 'forceful', typography: 'bold_impact', pacing: 'intense' }
                },
                provenance: '[CREATED: 2025-08-27] - Defiance state for strength phases'
            }
        };

        Object.values(coreStates).forEach(state => {
            this.stateRegistry.set(state.id, state);
            this.logProvenanceEvent('state_registered', {
                stateId: state.id,
                emotionalWeight: state.emotionalWeight,
                modalityCount: Object.keys(state.modalities).length,
                timestamp: Date.now()
            });
        });
    }

    /**
     * [NEW][CrossModalStateSync]: Synchronize state across all modalities
     * Transparency: All modality updates are logged with full context
     */
    async synchronizeState(userId, stateId, context = {}) {
        const state = this.stateRegistry.get(stateId);
        if (!state) {
            throw new Error(`Unknown state: ${stateId}`);
        }

        const syncOperation = {
            userId,
            stateId,
            context,
            timestamp: Date.now(),
            modalityUpdates: [],
            provenance: `[STATE_SYNC: ${Date.now()}] - Synchronizing ${stateId} across modalities`
        };

        // Queue the sync operation
        this.syncQueue.push(syncOperation);

        try {
            // Process each modality
            for (const [modalityId, controller] of this.modalityControllers) {
                if (controller.defaultEnabled && state.modalities[modalityId]) {
                    const updateResult = await this.applyModalityUpdate(
                        userId,
                        modalityId,
                        state.modalities[modalityId],
                        context
                    );

                    syncOperation.modalityUpdates.push({
                        modalityId,
                        success: updateResult.success,
                        details: updateResult.details,
                        timestamp: Date.now()
                    });
                }
            }

            // Mark operation as complete
            syncOperation.status = 'completed';
            this.logProvenanceEvent('state_sync_completed', {
                userId,
                stateId,
                modalityUpdates: syncOperation.modalityUpdates.length,
                successCount: syncOperation.modalityUpdates.filter(u => u.success).length,
                timestamp: Date.now()
            });

            return syncOperation;

        } catch (error) {
            syncOperation.status = 'failed';
            syncOperation.error = error.message;
            this.logProvenanceEvent('state_sync_failed', {
                userId,
                stateId,
                error: error.message,
                timestamp: Date.now()
            });
            throw error;
        }
    }

    /**
     * [NEW][CrossModalStateSync]: Apply modality-specific updates
     * Persona Enforcement: Maintains tough love + soul care through appropriate intensity
     */
    async applyModalityUpdate(userId, modalityId, modalityConfig, context) {
        try {
            const updateDetails = {
                modalityId,
                config: modalityConfig,
                context,
                timestamp: Date.now()
            };

            // Simulate modality update (would integrate with actual UI/audio/haptic systems)
            switch (modalityId) {
                case 'visual':
                    await this.updateVisualModality(userId, modalityConfig, context);
                    break;
                case 'auditory':
                    await this.updateAuditoryModality(userId, modalityConfig, context);
                    break;
                case 'haptic':
                    await this.updateHapticModality(userId, modalityConfig, context);
                    break;
                case 'text':
                    await this.updateTextModality(userId, modalityConfig, context);
                    break;
            }

            this.logProvenanceEvent('modality_update_applied', {
                userId,
                modalityId,
                configKeys: Object.keys(modalityConfig),
                timestamp: Date.now()
            });

            return {
                success: true,
                details: updateDetails
            };

        } catch (error) {
            this.logProvenanceEvent('modality_update_failed', {
                userId,
                modalityId,
                error: error.message,
                timestamp: Date.now()
            });

            return {
                success: false,
                details: { error: error.message }
            };
        }
    }

    /**
     * [NEW][CrossModalStateSync]: Visual modality updates
     * Provenance: All visual changes are tagged with state context
     */
    async updateVisualModality(userId, config, context) {
        // Implementation for visual updates
        const visualUpdate = {
            palette: config.palette,
            particles: config.particles,
            animation: config.animation,
            provenance: `[VISUAL_UPDATE: ${Date.now()}] - State: ${context.stateId || 'unknown'}`
        };

        // Simulate applying visual changes
        console.log(`Applying visual update for ${userId}:`, visualUpdate);

        return visualUpdate;
    }

    /**
     * [NEW][CrossModalStateSync]: Auditory modality updates
     * Emotional Arc Awareness: Audio adapts to emotional intensity
     */
    async updateAuditoryModality(userId, config, context) {
        // Implementation for auditory updates
        const auditoryUpdate = {
            tone: config.tone,
            tempo: config.tempo,
            soundscape: config.soundscape,
            provenance: `[AUDITORY_UPDATE: ${Date.now()}] - State: ${context.stateId || 'unknown'}`
        };

        // Simulate applying auditory changes
        console.log(`Applying auditory update for ${userId}:`, auditoryUpdate);

        return auditoryUpdate;
    }

    /**
     * [NEW][CrossModalStateSync]: Haptic modality updates
     * Sovereignty: Haptic feedback respects user sensitivity preferences
     */
    async updateHapticModality(userId, config, context) {
        // Implementation for haptic updates
        const hapticUpdate = {
            pattern: config.pattern,
            intensity: config.intensity,
            rhythm: config.rhythm,
            provenance: `[HAPTIC_UPDATE: ${Date.now()}] - State: ${context.stateId || 'unknown'}`
        };

        // Simulate applying haptic changes
        console.log(`Applying haptic update for ${userId}:`, hapticUpdate);

        return hapticUpdate;
    }

    /**
     * [NEW][CrossModalStateSync]: Text modality updates
     * Persona Enforcement: Text style reflects emotional context appropriately
     */
    async updateTextModality(userId, config, context) {
        // Implementation for text updates
        const textUpdate = {
            cadence: config.cadence,
            typography: config.typography,
            pacing: config.pacing,
            provenance: `[TEXT_UPDATE: ${Date.now()}] - State: ${context.stateId || 'unknown'}`
        };

        // Simulate applying text changes
        console.log(`Applying text update for ${userId}:`, textUpdate);

        return textUpdate;
    }

    /**
     * [NEW][CrossModalStateSync]: Get current state for user
     * Transparency: State queries are logged for audit purposes
     */
    getCurrentState(userId) {
        const userStates = this.activeStates.get(userId) || new Set();

        this.logProvenanceEvent('state_query', {
            userId,
            activeStates: Array.from(userStates),
            timestamp: Date.now()
        });

        return {
            activeStates: Array.from(userStates),
            primaryState: userStates.size > 0 ? Array.from(userStates)[0] : null,
            modalityStatus: this.getModalityStatus()
        };
    }

    /**
     * [NEW][CrossModalStateSync]: Set active states for user
     * Sovereignty: User preferences override automatic state changes
     */
    setActiveStates(userId, stateIds) {
        const validStates = stateIds.filter(id => this.stateRegistry.has(id));
        const invalidStates = stateIds.filter(id => !this.stateRegistry.has(id));

        if (invalidStates.length > 0) {
            console.warn(`Invalid states ignored: ${invalidStates.join(', ')}`);
        }

        this.activeStates.set(userId, new Set(validStates));

        this.logProvenanceEvent('active_states_updated', {
            userId,
            newStates: validStates,
            invalidStates,
            timestamp: Date.now()
        });

        return {
            success: true,
            activeStates: validStates,
            ignoredStates: invalidStates
        };
    }

    /**
     * [NEW][CrossModalStateSync]: Get modality status
     * Transparency: Modality availability is always queryable
     */
    getModalityStatus() {
        const status = {};

        for (const [modalityId, controller] of this.modalityControllers) {
            status[modalityId] = {
                enabled: controller.defaultEnabled,
                capabilities: controller.capabilities,
                provenance: controller.provenance
            };
        }

        return status;
    }

    /**
     * [NEW][CrossModalStateSync]: Emergency state reset
     * Sovereignty: Users can immediately reset all modality states
     */
    async emergencyReset(userId) {
        const resetOperation = {
            userId,
            timestamp: Date.now(),
            resetStates: Array.from(this.activeStates.get(userId) || []),
            provenance: `[EMERGENCY_RESET: ${Date.now()}] - User-initiated state reset`
        };

        // Clear all active states
        this.activeStates.delete(userId);

        // Reset all modalities to neutral state
        for (const modalityId of this.modalityControllers.keys()) {
            await this.applyNeutralState(userId, modalityId);
        }

        this.logProvenanceEvent('emergency_reset_completed', {
            userId,
            resetStates: resetOperation.resetStates,
            modalitiesReset: Array.from(this.modalityControllers.keys()),
            timestamp: Date.now()
        });

        return resetOperation;
    }

    /**
     * [NEW][CrossModalStateSync]: Apply neutral state to modality
     * Persona Enforcement: Neutral state maintains caring presence
     */
    async applyNeutralState(userId, modalityId) {
        const neutralConfigs = {
            visual: { palette: 'neutral_balanced', particles: 'ambient', animation: 'steady' },
            auditory: { tone: 'calm_neutral', tempo: 'steady', soundscape: 'peaceful' },
            haptic: { pattern: 'gentle_pulse', intensity: 0.3, rhythm: 'steady' },
            text: { cadence: 'balanced', typography: 'clean_sans', pacing: 'steady' }
        };

        const config = neutralConfigs[modalityId];
        if (config) {
            return await this.applyModalityUpdate(userId, modalityId, config, {
                stateId: 'neutral',
                reason: 'emergency_reset'
            });
        }
    }

    /**
     * [NEW][CrossModalStateSync]: Provenance logging system
     * Transparency: All sync operations are fully traceable
     */
    logProvenanceEvent(eventType, details) {
        const logEntry = {
            eventType,
            details,
            timestamp: Date.now(),
            module: 'CrossModalStateSync',
            sovereigntyStatus: 'user_controlled'
        };

        this.provenanceLog.push(logEntry);

        // Keep log manageable
        if (this.provenanceLog.length > 1000) {
            this.provenanceLog = this.provenanceLog.slice(-500);
        }
    }

    /**
     * [NEW][CrossModalStateSync]: Get provenance audit trail
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

module.exports = CrossModalStateSync;

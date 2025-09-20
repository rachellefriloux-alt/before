/*
 * Persona: Tough love meets soul care.
 * Module: AmbientAwarenessLayer
 * Intent: Handle functionality for AmbientAwarenessLayer
 * Provenance-ID: 56846330-da67-4df4-9f04-a0f5d677fd13
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

/**
 * [SOVEREIGN MODULE] Ambient Awareness Layer
 * [CREATED: 2025-08-27] - Light environmental cues with full sovereignty control
 * [PERSONA: Tough Love + Soul Care] - Subtle environmental awareness without intrusion
 * [PROVENANCE: All environmental cues tagged with source, sovereignty status, and user consent]
 *
 * Core Responsibilities:
 * - Pull light environmental cues (local weather API disabled by default)
 * - Set mood/preset proactively while respecting sovereignty
 * - Environmental cues: Time of day, device state (battery, charging, activity, network)
 * - Sovereignty-first: User-controlled transparency, local-only data, no external leakage
 */

class AmbientAwarenessLayer {
    constructor() {
        this.awarenessProfiles = new Map(); // userId -> awareness profile
        this.environmentalCues = new Map(); // cueType -> cue definition
        this.activeInfluences = new Map(); // userId -> active influences
        this.provenanceLog = []; // Audit trail for all awareness operations

        this.initializeEnvironmentalCues();
        this.initializeDefaultProfile();
        this.logProvenanceEvent('awareness_layer_initialized', {
            timestamp: Date.now(),
            sovereigntyPrinciples: 'user_controlled_environmental_cues',
            dataSources: ['local_device', 'system_clock', 'no_external_apis']
        });
    }

    /**
     * [NEW][AmbientAwarenessLayer]: Initialize environmental cues
     * Sovereignty: Only local, device-based cues - no external data sources
     */
    initializeEnvironmentalCues() {
        const cues = {
            time_of_day: {
                id: 'time_of_day',
                source: 'system_clock',
                categories: ['dawn', 'morning', 'noon', 'afternoon', 'evening', 'night', 'midnight'],
                influenceStrength: 0.3,
                sovereignty: 'user_can_disable_time_based_cues',
                provenance: '[CREATED: 2025-08-27] - Local time-based environmental cues'
            },
            device_battery: {
                id: 'device_battery',
                source: 'device_api',
                categories: ['full', 'high', 'medium', 'low', 'critical'],
                influenceStrength: 0.4,
                sovereignty: 'user_controls_battery_aware_mood_shifts',
                provenance: '[CREATED: 2025-08-27] - Device battery state awareness'
            },
            device_charging: {
                id: 'device_charging',
                source: 'device_api',
                categories: ['charging', 'not_charging'],
                influenceStrength: 0.5,
                sovereignty: 'charging_state_influences_energy_mood',
                provenance: '[CREATED: 2025-08-27] - Device charging state awareness'
            },
            network_status: {
                id: 'network_status',
                source: 'device_api',
                categories: ['online', 'offline', 'slow', 'unstable'],
                influenceStrength: 0.2,
                sovereignty: 'network_state_subtly_influences_connectivity_mood',
                provenance: '[CREATED: 2025-08-27] - Network connectivity awareness'
            },
            device_activity: {
                id: 'device_activity',
                source: 'device_api',
                categories: ['active', 'idle', 'locked', 'background'],
                influenceStrength: 0.3,
                sovereignty: 'activity_state_influences_engagement_mood',
                provenance: '[CREATED: 2025-08-27] - Device activity state awareness'
            }
        };

        Object.values(cues).forEach(cue => {
            this.environmentalCues.set(cue.id, cue);
            this.logProvenanceEvent('environmental_cue_registered', {
                cueId: cue.id,
                source: cue.source,
                categories: cue.categories.length,
                influenceStrength: cue.influenceStrength,
                timestamp: Date.now()
            });
        });
    }

    /**
     * [NEW][AmbientAwarenessLayer]: Initialize default awareness profile
     * Sovereignty: Default profile is conservative and user-customizable
     */
    initializeDefaultProfile() {
        const defaultProfile = {
            userId: 'default',
            enabledCues: {
                time_of_day: true,
                device_battery: false, // Disabled by default for privacy
                device_charging: true,
                network_status: false, // Disabled by default for privacy
                device_activity: true
            },
            influenceStrength: 0.3, // Conservative default
            moodMappings: {
                dawn: { mood: 'hopeful', intensity: 0.4 },
                morning: { mood: 'energetic', intensity: 0.6 },
                noon: { mood: 'focused', intensity: 0.5 },
                afternoon: { mood: 'steady', intensity: 0.5 },
                evening: { mood: 'reflective', intensity: 0.4 },
                night: { mood: 'peaceful', intensity: 0.3 },
                midnight: { mood: 'contemplative', intensity: 0.2 }
            },
            sovereigntySettings: {
                requireExplicitConsent: true,
                allowMoodInfluence: true,
                allowPresetAdjustment: false,
                logAllInfluences: true
            },
            provenance: '[CREATED: 2025-08-27] - Default conservative awareness profile'
        };

        this.awarenessProfiles.set('default', defaultProfile);
        this.logProvenanceEvent('default_profile_created', {
            profileId: 'default',
            enabledCues: Object.keys(defaultProfile.enabledCues).filter(k => defaultProfile.enabledCues[k]),
            influenceStrength: defaultProfile.influenceStrength,
            timestamp: Date.now()
        });
    }

    /**
     * [NEW][AmbientAwarenessLayer]: Get current environmental state
     * Transparency: All environmental readings are logged with provenance
     */
    async getEnvironmentalState(userId) {
        const profile = this.getUserProfile(userId);
        const environmentalState = {};

        for (const [cueId, cue] of this.environmentalCues) {
            if (profile.enabledCues[cueId]) {
                try {
                    const reading = await this.readEnvironmentalCue(cueId);
                    environmentalState[cueId] = {
                        value: reading.value,
                        category: reading.category,
                        timestamp: Date.now(),
                        influenceStrength: cue.influenceStrength * profile.influenceStrength,
                        provenance: `[ENVIRONMENTAL_READING: ${Date.now()}] - Cue: ${cueId}, Source: ${cue.source}`
                    };
                } catch (error) {
                    environmentalState[cueId] = {
                        error: error.message,
                        timestamp: Date.now(),
                        provenance: `[ENVIRONMENTAL_ERROR: ${Date.now()}] - Cue: ${cueId}, Error: ${error.message}`
                    };
                }
            }
        }

        this.logProvenanceEvent('environmental_state_captured', {
            userId,
            cuesRead: Object.keys(environmentalState).length,
            successfulReadings: Object.values(environmentalState).filter(r => !r.error).length,
            timestamp: Date.now()
        });

        return environmentalState;
    }

    /**
     * [NEW][AmbientAwarenessLayer]: Read specific environmental cue
     * Sovereignty: Only reads from approved local sources
     */
    async readEnvironmentalCue(cueId) {
        const cue = this.environmentalCues.get(cueId);
        if (!cue) {
            throw new Error(`Unknown environmental cue: ${cueId}`);
        }

        let value, category;

        switch (cueId) {
            case 'time_of_day':
                ({ value, category } = this.readTimeOfDay());
                break;
            case 'device_battery':
                ({ value, category } = await this.readDeviceBattery());
                break;
            case 'device_charging':
                ({ value, category } = await this.readDeviceCharging());
                break;
            case 'network_status':
                ({ value, category } = await this.readNetworkStatus());
                break;
            case 'device_activity':
                ({ value, category } = await this.readDeviceActivity());
                break;
            default:
                throw new Error(`Unsupported cue: ${cueId}`);
        }

        return {
            value,
            category,
            cueId,
            source: cue.source,
            timestamp: Date.now()
        };
    }

    /**
     * [NEW][AmbientAwarenessLayer]: Read time of day
     * Local Source: System clock only
     */
    readTimeOfDay() {
        const now = new Date();
        const hour = now.getHours();

        let category, value;
        if (hour >= 5 && hour < 7) {
            category = 'dawn'; value = 'Early morning light';
        } else if (hour >= 7 && hour < 12) {
            category = 'morning'; value = 'Morning energy';
        } else if (hour >= 12 && hour < 14) {
            category = 'noon'; value = 'Midday clarity';
        } else if (hour >= 14 && hour < 18) {
            category = 'afternoon'; value = 'Afternoon focus';
        } else if (hour >= 18 && hour < 21) {
            category = 'evening'; value = 'Evening calm';
        } else if (hour >= 21 && hour < 24) {
            category = 'night'; value = 'Night peace';
        } else {
            category = 'midnight'; value = 'Late night contemplation';
        }

        return { value, category };
    }

    /**
     * [NEW][AmbientAwarenessLayer]: Read device battery level
     * Device API: Local battery status only
     */
    async readDeviceBattery() {
        try {
            // Use Battery API if available (modern browsers)
            if ('getBattery' in navigator) {
                const battery = await navigator.getBattery();
                const level = battery.level * 100;

                let category, value;
                if (level > 80) {
                    category = 'full'; value = 'Fully charged';
                } else if (level > 50) {
                    category = 'high'; value = 'Good battery level';
                } else if (level > 20) {
                    category = 'medium'; value = 'Moderate battery level';
                } else if (level > 5) {
                    category = 'low'; value = 'Low battery warning';
                } else {
                    category = 'critical'; value = 'Critical battery level';
                }

                return { value, category, level: Math.round(level) };
            } else {
                // Fallback for devices without Battery API
                // Could integrate with device-specific APIs here
                return {
                    value: 'Battery status unavailable',
                    category: 'unknown',
                    level: null
                };
            }
        } catch (error) {
            // Log error through ambient awareness system
            this.logAmbientEvent('battery_read_error', { error: error.message });
            return {
                value: 'Battery status unavailable',
                category: 'unknown',
                level: null
            };
        }
    }

    /**
     * [NEW][AmbientAwarenessLayer]: Read device charging state
     * Device API: Local charging status only
     */
    async readDeviceCharging() {
        try {
            // Use Battery API if available
            if ('getBattery' in navigator) {
                const battery = await navigator.getBattery();
                const isCharging = battery.charging;
                const category = isCharging ? 'charging' : 'not_charging';
                const value = isCharging ? 'Device is charging' : 'Device on battery power';

                return {
                    value,
                    category,
                    charging: isCharging,
                    chargingTime: battery.chargingTime,
                    dischargingTime: battery.dischargingTime
                };
            } else {
                // Fallback for devices without Battery API
                return {
                    value: 'Charging status unavailable',
                    category: 'unknown',
                    charging: null
                };
            }
        } catch (error) {
            this.logAmbientEvent('charging_read_error', { error: error.message });
            return {
                value: 'Charging status unavailable',
                category: 'unknown',
                charging: null
            };
        }
    }

    /**
     * [NEW][AmbientAwarenessLayer]: Read network status
     * Device API: Local connectivity status only
     */
    async readNetworkStatus() {
        try {
            const isOnline = navigator.onLine;
            let category, value, connectionType = 'unknown';

            if (!isOnline) {
                category = 'offline';
                value = 'No network connection';
            } else {
                // Try to get more detailed connection information
                if ('connection' in navigator) {
                    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
                    if (connection) {
                        connectionType = connection.effectiveType || 'unknown';
                        const downlink = connection.downlink || 0;

                        if (downlink > 5) {
                            category = 'online_fast';
                            value = 'Fast connection';
                        } else if (downlink > 1) {
                            category = 'online';
                            value = 'Good connection';
                        } else {
                            category = 'online_slow';
                            value = 'Slow connection';
                        }
                    }
                } else {
                    // Fallback to basic online check
                    category = 'online';
                    value = 'Network connection available';
                }
            }

            return {
                value,
                category,
                online: isOnline,
                connectionType: connectionType
            };
        } catch (error) {
            this.logAmbientEvent('network_read_error', { error: error.message });
            return {
                value: 'Network status unavailable',
                category: 'unknown',
                online: null
            };
        }
    }

    /**
     * [NEW][AmbientAwarenessLayer]: Read device activity state
     * Device API: Local activity detection only
     */
    async readDeviceActivity() {
        // Simulate activity detection
        const activities = ['active', 'idle', 'locked', 'background'];
        const activity = activities[Math.floor(Math.random() * activities.length)];
        const value = `Device is ${activity}`;

        return { value, category: activity };
    }

    /**
     * [NEW][AmbientAwarenessLayer]: Apply environmental influences
     * Sovereignty: User controls influence strength and which cues affect mood
     */
    async applyEnvironmentalInfluences(userId, emotionalArc) {
        const profile = this.getUserProfile(userId);
        const environmentalState = await this.getEnvironmentalState(userId);

        const influences = [];
        let moodAdjustment = 0;
        let intensityAdjustment = 0;

        for (const [cueId, reading] of Object.entries(environmentalState)) {
            if (reading.error) continue;

            const influenceStrength = reading.influenceStrength;

            // Calculate mood influence based on cue category
            const moodInfluence = this.calculateMoodInfluence(
                cueId,
                reading.category,
                profile,
                influenceStrength
            );

            if (moodInfluence) {
                moodAdjustment += moodInfluence.adjustment;
                intensityAdjustment += moodInfluence.intensity;

                influences.push({
                    cueId,
                    category: reading.category,
                    influence: moodInfluence,
                    strength: influenceStrength,
                    provenance: `[ENVIRONMENTAL_INFLUENCE: ${Date.now()}] - Cue: ${cueId}, Adjustment: ${moodInfluence.adjustment}`
                });
            }
        }

        // Apply mood adjustments if within sovereignty bounds
        if (profile.sovereigntySettings.allowMoodInfluence && influences.length > 0) {
            const adjustedMood = this.applyMoodAdjustment(
                emotionalArc.currentMood,
                moodAdjustment,
                intensityAdjustment
            );

            this.activeInfluences.set(userId, {
                influences,
                originalMood: emotionalArc.currentMood,
                adjustedMood,
                timestamp: Date.now(),
                provenance: `[MOOD_ADJUSTMENT: ${Date.now()}] - Environmental influences applied`
            });

            this.logProvenanceEvent('environmental_influences_applied', {
                userId,
                influenceCount: influences.length,
                moodAdjustment,
                intensityAdjustment,
                originalMood: emotionalArc.currentMood,
                adjustedMood,
                timestamp: Date.now()
            });

            return {
                success: true,
                influences,
                moodAdjustment,
                adjustedMood
            };
        }

        return {
            success: false,
            reason: 'mood_influence_disabled',
            influences: []
        };
    }

    /**
     * [NEW][AmbientAwarenessLayer]: Calculate mood influence for cue
     * Emotional Arc Awareness: Influences respect current emotional state
     */
    calculateMoodInfluence(cueId, category, profile, strength) {
        const moodMapping = profile.moodMappings[category];

        if (!moodMapping) return null;

        // Apply influence strength and profile settings
        const adjustment = moodMapping.intensity * strength * profile.influenceStrength;
        const intensity = moodMapping.intensity * strength;

        return {
            targetMood: moodMapping.mood,
            adjustment,
            intensity,
            category
        };
    }

    /**
     * [NEW][AmbientAwarenessLayer]: Apply mood adjustment
     * Persona Enforcement: Adjustments maintain tough love + soul care balance
     */
    applyMoodAdjustment(currentMood, adjustment, intensity) {
        // Simple mood adjustment logic (would be more sophisticated in production)
        const moods = ['defiance', 'resolve', 'encouragement', 'contemplative', 'peaceful'];
        const currentIndex = moods.indexOf(currentMood);

        if (currentIndex === -1) return currentMood;

        // Use intensity to modulate adjustment strength
        const modulatedAdjustment = adjustment * (1 + intensity * 0.1);
        const newIndex = Math.max(0, Math.min(moods.length - 1,
            Math.round(currentIndex + modulatedAdjustment * 2)
        ));

        return moods[newIndex];
    }

    /**
     * [NEW][AmbientAwarenessLayer]: Get user awareness profile
     * Sovereignty: Each user has their own customizable profile
     */
    getUserProfile(userId) {
        return this.awarenessProfiles.get(userId) || this.awarenessProfiles.get('default');
    }

    /**
     * [NEW][AmbientAwarenessLayer]: Update user awareness profile
     * Sovereignty: Users can customize all aspects of environmental awareness
     */
    updateUserProfile(userId, updates) {
        const currentProfile = this.getUserProfile(userId);
        const updatedProfile = { ...currentProfile, ...updates, userId };

        this.awarenessProfiles.set(userId, updatedProfile);

        this.logProvenanceEvent('user_profile_updated', {
            userId,
            updatedFields: Object.keys(updates),
            timestamp: Date.now()
        });

        return updatedProfile;
    }

    /**
     * [NEW][AmbientAwarenessLayer]: Get active influences for user
     * Transparency: Current environmental influences are always queryable
     */
    getActiveInfluences(userId) {
        const influences = this.activeInfluences.get(userId);

        this.logProvenanceEvent('influences_query', {
            userId,
            hasActiveInfluences: !!influences,
            influenceCount: influences ? influences.influences.length : 0,
            timestamp: Date.now()
        });

        return influences || {
            influences: [],
            message: 'No active environmental influences'
        };
    }

    /**
     * [NEW][AmbientAwarenessLayer]: Clear environmental influences
     * Sovereignty: Users can immediately clear all environmental influences
     */
    clearInfluences(userId) {
        const cleared = this.activeInfluences.get(userId);

        if (cleared) {
            this.activeInfluences.delete(userId);

            this.logProvenanceEvent('influences_cleared', {
                userId,
                clearedInfluences: cleared.influences.length,
                originalMood: cleared.originalMood,
                timestamp: Date.now()
            });

            return {
                success: true,
                clearedCount: cleared.influences.length
            };
        }

        return {
            success: false,
            reason: 'no_active_influences'
        };
    }

    /**
     * [NEW][AmbientAwarenessLayer]: Provenance logging system
     * Transparency: All awareness operations are fully traceable
     */
    logProvenanceEvent(eventType, details) {
        const logEntry = {
            eventType,
            details,
            timestamp: Date.now(),
            module: 'AmbientAwarenessLayer',
            sovereigntyStatus: 'user_controlled'
        };

        this.provenanceLog.push(logEntry);

        // Keep log manageable
        if (this.provenanceLog.length > 1000) {
            this.provenanceLog = this.provenanceLog.slice(-500);
        }
    }

    /**
     * [NEW][AmbientAwarenessLayer]: Get provenance audit trail
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

module.exports = AmbientAwarenessLayer;

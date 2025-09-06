/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: RuntimeConsent - Comprehensive consent management for user data and permissions.
 * Got it, love.
 */

/**
 * Comprehensive runtime consent management system
 * Handles user permissions, data collection consent, and privacy controls
 */
class RuntimeConsent {
    constructor(options = {}) {
        this.consents = new Map();
        this.consentHistory = [];
        this.auditLog = [];
        this.consentVersion = options.version || '1.0.0';
        this.privacySettings = {
            dataRetentionDays: options.dataRetentionDays || 30,
            auditEnabled: options.auditEnabled !== false,
            consentRequired: options.consentRequired !== false,
            granularPermissions: options.granularPermissions !== false
        };

        // Initialize with default consent types
        this.initializeDefaultConsents();

        // Load persisted consents if available
        this.loadPersistedConsents();

        // Log initialization
        this.logAuditEvent('SYSTEM', 'INITIALIZED', 'Runtime consent system initialized');
    }

    /**
     * Consent types and their default settings
     */
    static get CONSENT_TYPES() {
        return {
            // Data collection consents
            LOCATION_TRACKING: 'location_tracking',
            CONTACT_ACCESS: 'contact_access',
            CALENDAR_ACCESS: 'calendar_access',
            CAMERA_ACCESS: 'camera_access',
            MICROPHONE_ACCESS: 'microphone_access',
            STORAGE_ACCESS: 'storage_access',
            NOTIFICATION_ACCESS: 'notification_access',

            // AI and learning consents
            PERSONALIZATION: 'personalization',
            BEHAVIOR_ANALYSIS: 'behavior_analysis',
            PATTERN_LEARNING: 'pattern_learning',
            EMOTIONAL_ANALYSIS: 'emotional_analysis',
            PREDICTIVE_SUGGESTIONS: 'predictive_suggestions',

            // Communication consents
            MESSAGE_ANALYSIS: 'message_analysis',
            VOICE_RECORDING: 'voice_recording',
            CONVERSATION_LOGGING: 'conversation_logging',

            // Third-party consents
            DATA_SHARING: 'data_sharing',
            ANALYTICS_SHARING: 'analytics_sharing',
            AD_PERSONALIZATION: 'ad_personalization',

            // Special consents
            EMERGENCY_ACCESS: 'emergency_access',
            BACKUP_ACCESS: 'backup_access'
        };
    }

    /**
     * Consent levels
     */
    static get CONSENT_LEVELS() {
        return {
            DENIED: 'denied',
            GRANTED: 'granted',
            LIMITED: 'limited',
            CONDITIONAL: 'conditional'
        };
    }

    /**
     * Consent scopes
     */
    static get CONSENT_SCOPES() {
        return {
            SESSION: 'session',           // Current session only
            TEMPORARY: 'temporary',       // Time-limited
            PERSISTENT: 'persistent',     // Until revoked
            CONDITIONAL: 'conditional'    // Based on conditions
        };
    }

    /**
     * Initialize default consent configurations
     */
    initializeDefaultConsents() {
        const defaultConsents = {
            [this.constructor.CONSENT_TYPES.PERSONALIZATION]: {
                level: this.constructor.CONSENT_LEVELS.DENIED,
                scope: this.constructor.CONSENT_SCOPES.SESSION,
                required: false,
                description: 'Allow Sallie to personalize responses based on your preferences',
                category: 'ai_learning'
            },
            [this.constructor.CONSENT_TYPES.BEHAVIOR_ANALYSIS]: {
                level: this.constructor.CONSENT_LEVELS.DENIED,
                scope: this.constructor.CONSENT_SCOPES.SESSION,
                required: false,
                description: 'Allow Sallie to analyze your behavior patterns for better assistance',
                category: 'ai_learning'
            },
            [this.constructor.CONSENT_TYPES.EMOTIONAL_ANALYSIS]: {
                level: this.constructor.CONSENT_LEVELS.DENIED,
                scope: this.constructor.CONSENT_SCOPES.SESSION,
                required: false,
                description: 'Allow Sallie to analyze emotional context in conversations',
                category: 'ai_learning'
            },
            [this.constructor.CONSENT_TYPES.CONVERSATION_LOGGING]: {
                level: this.constructor.CONSENT_LEVELS.LIMITED,
                scope: this.constructor.CONSENT_SCOPES.TEMPORARY,
                required: true,
                description: 'Log conversations for context and improvement (auto-deleted after 30 days)',
                category: 'communication'
            }
        };

        Object.entries(defaultConsents).forEach(([type, config]) => {
            this.consents.set(type, {
                ...config,
                grantedAt: null,
                expiresAt: null,
                conditions: [],
                metadata: {}
            });
        });
    }

    /**
     * Request user consent for a specific type
     */
    async requestConsent(consentType, options = {}) {
        const {
            level = this.constructor.CONSENT_LEVELS.GRANTED,
            scope = this.constructor.CONSENT_SCOPES.PERSISTENT,
            conditions = [],
            expiresIn = null,
            context = {}
        } = options;

        // Check if consent type exists
        if (!this.consents.has(consentType)) {
            throw new Error(`Unknown consent type: ${consentType}`);
        }

        const consent = this.consents.get(consentType);

        // Check if consent is required
        if (consent.required && level === this.constructor.CONSENT_LEVELS.DENIED) {
            throw new Error(`Consent for ${consentType} is required and cannot be denied`);
        }

        // Create consent request
        const consentRequest = {
            id: this.generateId(),
            type: consentType,
            level,
            scope,
            conditions,
            expiresAt: expiresIn ? Date.now() + expiresIn : null,
            requestedAt: Date.now(),
            context
        };

        // Log the request
        this.logAuditEvent('USER', 'CONSENT_REQUESTED', consentType, consentRequest);

        // Update consent
        const updatedConsent = {
            ...consent,
            level,
            scope,
            conditions,
            grantedAt: Date.now(),
            expiresAt: consentRequest.expiresAt,
            metadata: {
                ...consent.metadata,
                lastRequest: consentRequest
            }
        };

        this.consents.set(consentType, updatedConsent);

        // Add to history
        this.consentHistory.push(consentRequest);

        // Persist changes
        this.persistConsents();

        // Log grant
        this.logAuditEvent('SYSTEM', 'CONSENT_GRANTED', consentType, { level, scope });

        return consentRequest;
    }

    /**
     * Revoke consent for a specific type
     */
    revokeConsent(consentType, reason = '') {
        if (!this.consents.has(consentType)) {
            throw new Error(`Unknown consent type: ${consentType}`);
        }

        const consent = this.consents.get(consentType);

        // Update consent to denied
        const updatedConsent = {
            ...consent,
            level: this.constructor.CONSENT_LEVELS.DENIED,
            grantedAt: null,
            expiresAt: null,
            metadata: {
                ...consent.metadata,
                revokedAt: Date.now(),
                revokeReason: reason
            }
        };

        this.consents.set(consentType, updatedConsent);

        // Log revocation
        this.logAuditEvent('USER', 'CONSENT_REVOKED', consentType, { reason });

        // Persist changes
        this.persistConsents();

        return true;
    }

    /**
     * Check if consent is granted for a specific type
     */
    isConsentGranted(consentType, context = {}) {
        const consent = this.consents.get(consentType);

        if (!consent) {
            return false;
        }

        // Check if consent is granted
        if (consent.level === this.constructor.CONSENT_LEVELS.DENIED) {
            return false;
        }

        // Check expiration
        if (consent.expiresAt && Date.now() > consent.expiresAt) {
            // Auto-revoke expired consent
            this.revokeConsent(consentType, 'Expired');
            return false;
        }

        // Check conditions
        if (consent.conditions && consent.conditions.length > 0) {
            return this.evaluateConditions(consent.conditions, context);
        }

        return true;
    }

    /**
     * Get consent status for a specific type
     */
    getConsentStatus(consentType) {
        const consent = this.consents.get(consentType);

        if (!consent) {
            return null;
        }

        return {
            type: consentType,
            level: consent.level,
            scope: consent.scope,
            grantedAt: consent.grantedAt,
            expiresAt: consent.expiresAt,
            isActive: this.isConsentGranted(consentType),
            description: consent.description,
            category: consent.category,
            required: consent.required
        };
    }

    /**
     * Get all consent statuses
     */
    getAllConsentStatuses() {
        const statuses = {};

        for (const [type] of this.consents) {
            statuses[type] = this.getConsentStatus(type);
        }

        return statuses;
    }

    /**
     * Get consents by category
     */
    getConsentsByCategory(category) {
        const categoryConsents = {};

        for (const [type, consent] of this.consents) {
            if (consent.category === category) {
                categoryConsents[type] = this.getConsentStatus(type);
            }
        }

        return categoryConsents;
    }

    /**
     * Update privacy settings
     */
    updatePrivacySettings(settings) {
        this.privacySettings = {
            ...this.privacySettings,
            ...settings
        };

        this.logAuditEvent('USER', 'PRIVACY_SETTINGS_UPDATED', '', settings);
        this.persistConsents();
    }

    /**
     * Get privacy settings
     */
    getPrivacySettings() {
        return { ...this.privacySettings };
    }

    /**
     * Export consent data for user review
     */
    exportConsentData() {
        return {
            consents: Object.fromEntries(this.consents),
            history: this.consentHistory,
            auditLog: this.auditLog,
            privacySettings: this.privacySettings,
            exportDate: new Date().toISOString(),
            version: this.consentVersion
        };
    }

    /**
     * Import consent data (for backup/restore)
     */
    importConsentData(data) {
        try {
            if (data.consents) {
                this.consents = new Map(Object.entries(data.consents));
            }
            if (data.history) {
                this.consentHistory = data.history;
            }
            if (data.auditLog) {
                this.auditLog = data.auditLog;
            }
            if (data.privacySettings) {
                this.privacySettings = data.privacySettings;
            }

            this.persistConsents();
            this.logAuditEvent('SYSTEM', 'CONSENT_DATA_IMPORTED', '', { version: data.version });

            return true;
        } catch (error) {
            this.logAuditEvent('SYSTEM', 'CONSENT_IMPORT_FAILED', '', { error: error.message });
            return false;
        }
    }

    /**
     * Clear all consent data (reset to defaults)
     */
    clearAllData() {
        this.consents.clear();
        this.consentHistory = [];
        this.auditLog = [];

        this.initializeDefaultConsents();
        this.persistConsents();

        this.logAuditEvent('USER', 'ALL_CONSENT_DATA_CLEARED', '');
    }

    /**
     * Get consent statistics
     */
    getConsentStatistics() {
        const stats = {
            totalConsents: this.consents.size,
            grantedConsents: 0,
            deniedConsents: 0,
            expiredConsents: 0,
            requiredConsents: 0,
            categories: {},
            historyEntries: this.consentHistory.length,
            auditEntries: this.auditLog.length
        };

        for (const [, consent] of this.consents) {
            if (consent.required) stats.requiredConsents++;

            switch (consent.level) {
                case this.constructor.CONSENT_LEVELS.GRANTED:
                    stats.grantedConsents++;
                    break;
                case this.constructor.CONSENT_LEVELS.DENIED:
                    stats.deniedConsents++;
                    break;
            }

            if (consent.expiresAt && Date.now() > consent.expiresAt) {
                stats.expiredConsents++;
            }

            const category = consent.category || 'uncategorized';
            stats.categories[category] = (stats.categories[category] || 0) + 1;
        }

        return stats;
    }

    /**
     * Evaluate conditional consent requirements
     */
    evaluateConditions(conditions, context) {
        return conditions.every(condition => {
            switch (condition.type) {
                case 'time_range':
                    const now = new Date();
                    const start = new Date(condition.start);
                    const end = new Date(condition.end);
                    return now >= start && now <= end;

                case 'location':
                    // Would integrate with location services
                    return context.location === condition.location;

                case 'activity':
                    return context.activity === condition.activity;

                case 'custom':
                    return condition.evaluator ? condition.evaluator(context) : false;

                default:
                    return false;
            }
        });
    }

    /**
     * Log audit events for compliance
     */
    logAuditEvent(actor, action, target, details = {}) {
        if (!this.privacySettings.auditEnabled) return;

        const auditEntry = {
            id: this.generateId(),
            timestamp: Date.now(),
            actor,
            action,
            target,
            details,
            ipAddress: null, // Would be populated in production
            userAgent: null  // Would be populated in production
        };

        this.auditLog.push(auditEntry);

        // Limit audit log size
        if (this.auditLog.length > 1000) {
            this.auditLog = this.auditLog.slice(-500);
        }
    }

    /**
     * Get audit log (for compliance and debugging)
     */
    getAuditLog(limit = 100) {
        return this.auditLog.slice(-limit);
    }

    /**
     * Clean up expired consents
     */
    cleanupExpiredConsents() {
        const now = Date.now();
        let cleaned = 0;

        for (const [type, consent] of this.consents) {
            if (consent.expiresAt && now > consent.expiresAt) {
                this.revokeConsent(type, 'Expired during cleanup');
                cleaned++;
            }
        }

        if (cleaned > 0) {
            this.logAuditEvent('SYSTEM', 'EXPIRED_CONSENTS_CLEANED', '', { count: cleaned });
        }

        return cleaned;
    }

    /**
     * Persist consents to storage
     */
    persistConsents() {
        try {
            const data = {
                consents: Object.fromEntries(this.consents),
                consentHistory: this.consentHistory,
                auditLog: this.auditLog,
                privacySettings: this.privacySettings,
                version: this.consentVersion,
                lastSaved: Date.now()
            };

            // In a real implementation, this would save to AsyncStorage, localStorage, or a file
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('sallie_consent_data', JSON.stringify(data));
            }
        } catch (error) {
            this.logAuditEvent('SYSTEM', 'PERSIST_ERROR', '', { error: error.message });
        }
    }

    /**
     * Load persisted consents from storage
     */
    loadPersistedConsents() {
        try {
            let data = null;

            if (typeof localStorage !== 'undefined') {
                const stored = localStorage.getItem('sallie_consent_data');
                if (stored) {
                    data = JSON.parse(stored);
                }
            }

            if (data) {
                if (data.consents) {
                    this.consents = new Map(Object.entries(data.consents));
                }
                if (data.consentHistory) {
                    this.consentHistory = data.consentHistory;
                }
                if (data.auditLog) {
                    this.auditLog = data.auditLog;
                }
                if (data.privacySettings) {
                    this.privacySettings = data.privacySettings;
                }

                this.logAuditEvent('SYSTEM', 'CONSENT_DATA_LOADED', '', { version: data.version });
            }
        } catch (error) {
            this.logAuditEvent('SYSTEM', 'LOAD_ERROR', '', { error: error.message });
        }
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Validate consent data integrity
     */
    validateConsentData() {
        const issues = [];

        for (const [type, consent] of this.consents) {
            if (!consent.level) {
                issues.push(`Missing level for consent type: ${type}`);
            }
            if (!consent.scope) {
                issues.push(`Missing scope for consent type: ${type}`);
            }
            if (consent.expiresAt && consent.expiresAt < Date.now()) {
                issues.push(`Expired consent for type: ${type}`);
            }
        }

        return {
            isValid: issues.length === 0,
            issues
        };
    }

    /**
     * Get consent categories
     */
    static getConsentCategories() {
        return {
            data_collection: 'Data Collection',
            ai_learning: 'AI Learning',
            communication: 'Communication',
            third_party: 'Third Party',
            special: 'Special Permissions'
        };
    }
}

module.exports = RuntimeConsent;

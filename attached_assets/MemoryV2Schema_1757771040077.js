"use strict";
/**
 * ╭──────────────────────────────────────────────────────────────────────────────╮
 * │                                                                              │
 * │   Sallie - Memory v2 Schema                                                   │
 * │                                                                              │
 * │   Rich memory storage with provenance, emotional tags, and narrative graphs  │
 * │                                                                              │
 * ╰──────────────────────────────────────────────────────────────────────────────╯
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryError = exports.MemoryErrorCode = exports.MEMORY_EVENTS = exports.MEMORY_CONSTANTS = void 0;
exports.isMemoryItem = isMemoryItem;
exports.isValidMemoryType = isValidMemoryType;
exports.isValidPermission = isValidPermission;
exports.createMemoryItem = createMemoryItem;
exports.createMemoryQuery = createMemoryQuery;
exports.validateMemoryItem = validateMemoryItem;
/**
 * Memory System Constants
 */
exports.MEMORY_CONSTANTS = {
    MAX_CONTENT_LENGTH: 10000,
    MAX_LINKS_PER_MEMORY: 50,
    MAX_EMOTIONAL_TAGS: 10,
    DEFAULT_CONFIDENCE: 0.8,
    MIN_CONFIDENCE: 0.1,
    MAX_CONFIDENCE: 1.0,
    DEFAULT_RETENTION_DAYS: 365,
    MAX_RETENTION_DAYS: 3650, // 10 years
    COMPRESSION_THRESHOLD: 1024, // bytes
    SYNC_BATCH_SIZE: 100,
    HEALTH_CHECK_INTERVAL: 3600000, // 1 hour in milliseconds
    BACKUP_INTERVAL: 86400000, // 24 hours in milliseconds
    // Enhanced constants
    MAX_NARRATIVE_DEPTH: 10,
    MAX_SIMULTANEOUS_QUERIES: 5,
    CACHE_TTL_DEFAULT: 300000, // 5 minutes
    MAX_PLUGIN_INSTANCES: 20,
    ANALYTICS_RETENTION_DAYS: 90,
    MAX_EMOTIONAL_INTENSITY: 1.0,
    MIN_EMOTIONAL_INTENSITY: 0.0,
    SEMANTIC_SIMILARITY_THRESHOLD: 0.7,
    PREDICTIVE_HORIZON_DAYS: 30,
    MAX_CONCURRENT_BACKUPS: 3,
    SYNC_RETRY_ATTEMPTS: 3,
    HEALTH_ALERT_THRESHOLD: 0.8,
};
/**
 * Memory System Events
 */
exports.MEMORY_EVENTS = {
    MEMORY_CREATED: 'memory.created',
    MEMORY_UPDATED: 'memory.updated',
    MEMORY_DELETED: 'memory.deleted',
    MEMORY_QUERIED: 'memory.queried',
    MEMORY_LINKED: 'memory.linked',
    MEMORY_BACKUP_STARTED: 'memory.backup.started',
    MEMORY_BACKUP_COMPLETED: 'memory.backup.completed',
    MEMORY_SYNC_STARTED: 'memory.sync.started',
    MEMORY_SYNC_COMPLETED: 'memory.sync.completed',
    MEMORY_HEALTH_CHECK: 'memory.health.check',
    MEMORY_ERROR: 'memory.error',
    NARRATIVE_THREAD_CREATED: 'narrative.thread.created',
    NARRATIVE_THREAD_UPDATED: 'narrative.thread.updated',
    EMOTIONAL_PATTERN_DETECTED: 'emotional.pattern.detected',
};
/**
 * Memory System Error Types
 */
var MemoryErrorCode;
(function (MemoryErrorCode) {
    MemoryErrorCode["INVALID_MEMORY_ITEM"] = "INVALID_MEMORY_ITEM";
    MemoryErrorCode["MEMORY_NOT_FOUND"] = "MEMORY_NOT_FOUND";
    MemoryErrorCode["ACCESS_DENIED"] = "ACCESS_DENIED";
    MemoryErrorCode["STORAGE_ERROR"] = "MEMORY_STORAGE_ERROR";
    MemoryErrorCode["SYNC_ERROR"] = "SYNC_ERROR";
    MemoryErrorCode["VALIDATION_ERROR"] = "MEMORY_VALIDATION_FAILED";
    MemoryErrorCode["BACKUP_ERROR"] = "BACKUP_ERROR";
    MemoryErrorCode["MIGRATION_ERROR"] = "MIGRATION_ERROR";
    MemoryErrorCode["HEALTH_CHECK_FAILED"] = "HEALTH_CHECK_FAILED";
})(MemoryErrorCode || (exports.MemoryErrorCode = MemoryErrorCode = {}));
/**
 * Memory System Error Types
 */
class MemoryError extends Error {
    constructor(message, code, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'MemoryError';
    }
}
exports.MemoryError = MemoryError;
/**
 * Type Guards
 */
function isMemoryItem(obj) {
    return obj &&
        typeof obj.id === 'string' &&
        typeof obj.type === 'string' &&
        typeof obj.content === 'string' &&
        obj.provenance &&
        Array.isArray(obj.emotionalTags) &&
        obj.linkage &&
        obj.accessControl &&
        typeof obj.version === 'number' &&
        obj.lastModified instanceof Date;
}
function isValidMemoryType(type) {
    const validTypes = [
        'conversation', 'user_preference', 'emotional_state', 'learning_pattern',
        'decision_context', 'relationship_data', 'goal_progress', 'system_interaction', 'custom'
    ];
    return validTypes.includes(type);
}
function isValidPermission(permission) {
    const validPermissions = ['read', 'write', 'delete', 'share', 'analyze', 'export'];
    return validPermissions.includes(permission);
}
/**
 * Factory Functions
 */
function createMemoryItem(type, content, ownerId, source = 'system') {
    return {
        type,
        content,
        provenance: {
            createdAt: new Date(),
            source,
            confidence: exports.MEMORY_CONSTANTS.DEFAULT_CONFIDENCE,
            metadata: {
                userId: ownerId,
            },
        },
        emotionalTags: [],
        linkage: {
            narrativeThread: `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            relatedMemories: [],
            contextWindow: {
                before: [],
                after: [],
            },
            semanticLinks: [],
        },
        accessControl: {
            ownerId,
            permissions: ['read', 'write', 'delete'],
            encryptionLevel: 'standard',
            retentionPolicy: {
                duration: exports.MEMORY_CONSTANTS.DEFAULT_RETENTION_DAYS,
                autoDelete: false,
                archivalRequired: false,
                complianceTags: [],
            },
        },
        metadata: {},
    };
}
function createMemoryQuery(ownerId, type) {
    return {
        ownerId,
        type,
        limit: 50,
        sortBy: 'createdAt',
        sortOrder: 'desc',
    };
}
/**
 * Validation Functions
 */
function validateMemoryItem(memory) {
    const errors = [];
    const warnings = [];
    const suggestions = [];
    if (!memory.type) {
        errors.push('Memory type is required');
    }
    else if (!isValidMemoryType(memory.type)) {
        errors.push(`Invalid memory type: ${memory.type}`);
    }
    if (!memory.content) {
        errors.push('Memory content is required');
    }
    else if (memory.content.length > exports.MEMORY_CONSTANTS.MAX_CONTENT_LENGTH) {
        errors.push(`Content exceeds maximum length of ${exports.MEMORY_CONSTANTS.MAX_CONTENT_LENGTH} characters`);
    }
    if (!memory.provenance) {
        errors.push('Provenance data is required');
    }
    else {
        if (!memory.provenance.createdAt) {
            errors.push('Creation timestamp is required');
        }
        if (!memory.provenance.source) {
            errors.push('Source information is required');
        }
        if (memory.provenance.confidence < exports.MEMORY_CONSTANTS.MIN_CONFIDENCE ||
            memory.provenance.confidence > exports.MEMORY_CONSTANTS.MAX_CONFIDENCE) {
            errors.push(`Confidence must be between ${exports.MEMORY_CONSTANTS.MIN_CONFIDENCE} and ${exports.MEMORY_CONSTANTS.MAX_CONFIDENCE}`);
        }
    }
    if (!memory.accessControl) {
        errors.push('Access control is required');
    }
    else if (!memory.accessControl.ownerId) {
        errors.push('Owner ID is required');
    }
    if (memory.emotionalTags && memory.emotionalTags.length > exports.MEMORY_CONSTANTS.MAX_EMOTIONAL_TAGS) {
        warnings.push(`Too many emotional tags (${memory.emotionalTags.length}). Consider consolidating.`);
    }
    if (memory.linkage && memory.linkage.relatedMemories &&
        memory.linkage.relatedMemories.length > exports.MEMORY_CONSTANTS.MAX_LINKS_PER_MEMORY) {
        warnings.push(`Too many related memories (${memory.linkage.relatedMemories.length}). Consider creating a narrative thread.`);
    }
    if (errors.length === 0) {
        suggestions.push('Consider adding emotional tags for better categorization');
        suggestions.push('Consider adding semantic links for richer relationships');
    }
    return {
        isValid: errors.length === 0,
        errors,
        warnings,
        suggestions,
    };
}

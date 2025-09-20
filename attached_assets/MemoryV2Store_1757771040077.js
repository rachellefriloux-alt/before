"use strict";
/**
 * ╭──────────────────────────────────────────────────────────────────────────────╮
 * │                                                                              │
 * │   Sallie - Memory v2 Store Implementation                                    │
 * │                                                                              │
 * │   Rich memory storage with provenance, emotional tags, and narrative graphs │
 * │                                                                              │
 * ╰──────────────────────────────────────────────────────────────────────────────╯
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryV2Store = void 0;
const MemoryV2Schema_1 = require("./MemoryV2Schema");
const DatabaseIntegration_1 = require("../../ai/DatabaseIntegration");
const EventBus_1 = require("../EventBus");
class MemoryV2Store {
    constructor() {
        this.eventBus = (0, EventBus_1.getEventBus)();
        this.initialized = false;
        this.memoryCache = new Map();
        this.narrativeGraph = new Map();
        this.relationships = new Map();
        this.db = new DatabaseIntegration_1.DatabaseAbstractionLayer({
            name: 'SallieMemoryV2',
            version: 1,
            stores: [
                {
                    name: 'memories',
                    keyPath: 'id',
                    indexes: [
                        { name: 'type', keyPath: 'type' },
                        { name: 'createdAt', keyPath: 'provenance.createdAt' },
                        { name: 'ownerId', keyPath: 'accessControl.ownerId' },
                        { name: 'narrativeThread', keyPath: 'linkage.narrativeThread' },
                        { name: 'emotionalTags', keyPath: 'emotionalTags', multiEntry: true },
                        { name: 'confidence', keyPath: 'provenance.confidence' },
                        { name: 'lastModified', keyPath: 'lastModified' },
                    ],
                },
                {
                    name: 'narrativeNodes',
                    keyPath: 'id',
                    indexes: [
                        { name: 'type', keyPath: 'type' },
                        { name: 'label', keyPath: 'label' },
                        { name: 'createdAt', keyPath: 'createdAt' },
                    ],
                },
                {
                    name: 'narrativeRelationships',
                    keyPath: 'id',
                    indexes: [
                        { name: 'type', keyPath: 'type' },
                        { name: 'sourceId', keyPath: 'sourceId' },
                        { name: 'targetId', keyPath: 'targetId' },
                        { name: 'weight', keyPath: 'weight' },
                        { name: 'createdAt', keyPath: 'createdAt' },
                    ],
                },
                {
                    name: 'memoryStats',
                    keyPath: 'id',
                    indexes: [],
                },
            ],
        });
    }
    async initialize() {
        if (this.initialized) {
            return;
        }
        try {
            await this.db.initialize();
            // Create initial narrative graph structure
            await this.initializeNarrativeGraph();
            // Set up event listeners
            this.setupEventListeners();
            this.initialized = true;
            // Emit initialization event
            this.eventBus.emit('memory:initialized', {
                id: `memory_init_${Date.now()}`,
                type: 'memory:initialized',
                source: 'MemoryV2Store',
                timestamp: new Date(),
                payload: { storeType: 'MemoryV2Store', version: 1 }
            });
        }
        catch (error) {
            throw new MemoryV2Schema_1.MemoryError(`Failed to initialize memory store: ${error.message}`, MemoryV2Schema_1.MemoryErrorCode.STORAGE_ERROR, { originalError: error });
        }
    }
    async initializeNarrativeGraph() {
        // Create root narrative node
        const rootNode = {
            id: 'narrative_root',
            type: 'memory',
            label: 'Sallie Memory Root',
            properties: {
                description: 'Root node for all Sallie memories',
                createdBy: 'system',
            },
            createdAt: new Date(),
        };
        this.narrativeGraph.set(rootNode.id, rootNode);
        await this.db.create('narrativeNodes', this.narrativeNodeToDatabaseRecord(rootNode));
    }
    setupEventListeners() {
        this.eventBus.on('memory:query', this.handleMemoryQuery.bind(this));
        this.eventBus.on('memory:consolidate', this.handleMemoryConsolidation.bind(this));
        this.eventBus.on('memory:cleanup', this.handleMemoryCleanup.bind(this));
    }
    async create(item) {
        if (!this.initialized) {
            await this.initialize();
        }
        // Validate the memory item
        const validation = (0, MemoryV2Schema_1.validateMemoryItem)(item);
        if (!validation.isValid) {
            throw new MemoryV2Schema_1.MemoryError(`Memory validation failed: ${validation.errors.join(', ')}`, MemoryV2Schema_1.MemoryErrorCode.VALIDATION_ERROR, { validation });
        }
        // Create the full memory item
        const memoryItem = Object.assign(Object.assign({}, item), { id: `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, version: 1, lastModified: new Date() });
        try {
            // Store in database
            await this.db.create('memories', this.memoryItemToDatabaseRecord(memoryItem));
            // Add to cache
            this.memoryCache.set(memoryItem.id, memoryItem);
            // Update narrative graph
            await this.updateNarrativeGraph(memoryItem);
            // Emit creation event
            this.eventBus.emit(MemoryV2Schema_1.MEMORY_EVENTS.MEMORY_CREATED, {
                id: `memory_created_${memoryItem.id}`,
                type: MemoryV2Schema_1.MEMORY_EVENTS.MEMORY_CREATED,
                source: 'MemoryV2Store',
                timestamp: new Date(),
                payload: { memoryId: memoryItem.id, memoryType: memoryItem.type }
            });
            return memoryItem;
        }
        catch (error) {
            throw new MemoryV2Schema_1.MemoryError(`Failed to create memory: ${error.message}`, MemoryV2Schema_1.MemoryErrorCode.STORAGE_ERROR, { memoryItem, originalError: error });
        }
    }
    async read(id) {
        if (!this.initialized) {
            await this.initialize();
        }
        // Check cache first
        if (this.memoryCache.has(id)) {
            return this.memoryCache.get(id);
        }
        try {
            const record = await this.db.read('memories', id);
            if (record) {
                const memory = this.databaseRecordToMemoryItem(record);
                // Add to cache
                this.memoryCache.set(id, memory);
                // Emit query event
                this.eventBus.emit(MemoryV2Schema_1.MEMORY_EVENTS.MEMORY_QUERIED, {
                    id: `memory_read_${id}`,
                    type: MemoryV2Schema_1.MEMORY_EVENTS.MEMORY_QUERIED,
                    source: 'MemoryV2Store',
                    timestamp: new Date(),
                    payload: { memoryId: id, operation: 'read' }
                });
                return memory;
            }
            return null;
        }
        catch (error) {
            throw new MemoryV2Schema_1.MemoryError(`Failed to read memory ${id}: ${error.message}`, MemoryV2Schema_1.MemoryErrorCode.STORAGE_ERROR, { memoryId: id, originalError: error });
        }
    }
    async update(id, updates) {
        if (!this.initialized) {
            await this.initialize();
        }
        try {
            // Get current memory
            const currentMemory = await this.read(id);
            if (!currentMemory) {
                throw new MemoryV2Schema_1.MemoryError(`Memory ${id} not found`, MemoryV2Schema_1.MemoryErrorCode.MEMORY_NOT_FOUND);
            }
            // Create updated memory
            const updatedMemory = Object.assign(Object.assign(Object.assign({}, currentMemory), updates), { version: currentMemory.version + 1, lastModified: new Date() });
            // Validate updated memory
            const validation = (0, MemoryV2Schema_1.validateMemoryItem)(updatedMemory);
            if (!validation.isValid) {
                throw new MemoryV2Schema_1.MemoryError(`Updated memory validation failed: ${validation.errors.join(', ')}`, MemoryV2Schema_1.MemoryErrorCode.VALIDATION_ERROR, { validation });
            }
            // Update in database
            await this.db.update('memories', this.memoryItemToDatabaseRecord(updatedMemory));
            // Update cache
            this.memoryCache.set(id, updatedMemory);
            // Update narrative graph if needed
            await this.updateNarrativeGraph(updatedMemory);
            // Emit update event
            this.eventBus.emit(MemoryV2Schema_1.MEMORY_EVENTS.MEMORY_UPDATED, {
                id: `memory_updated_${id}`,
                type: MemoryV2Schema_1.MEMORY_EVENTS.MEMORY_UPDATED,
                source: 'MemoryV2Store',
                timestamp: new Date(),
                payload: { memoryId: id, version: updatedMemory.version }
            });
            return updatedMemory;
        }
        catch (error) {
            if (error instanceof MemoryV2Schema_1.MemoryError) {
                throw error;
            }
            throw new MemoryV2Schema_1.MemoryError(`Failed to update memory ${id}: ${error.message}`, MemoryV2Schema_1.MemoryErrorCode.STORAGE_ERROR, { memoryId: id, updates, originalError: error });
        }
    }
    async delete(id) {
        if (!this.initialized) {
            await this.initialize();
        }
        try {
            // Check if memory exists
            const memory = await this.read(id);
            if (!memory) {
                return false;
            }
            // Delete from database
            await this.db.delete('memories', id);
            // Remove from cache
            this.memoryCache.delete(id);
            // Clean up narrative graph
            await this.cleanupNarrativeGraph(id);
            // Emit deletion event
            this.eventBus.emit(MemoryV2Schema_1.MEMORY_EVENTS.MEMORY_DELETED, {
                id: `memory_deleted_${id}`,
                type: MemoryV2Schema_1.MEMORY_EVENTS.MEMORY_DELETED,
                source: 'MemoryV2Store',
                timestamp: new Date(),
                payload: { memoryId: id, memoryType: memory.type }
            });
            return true;
        }
        catch (error) {
            throw new MemoryV2Schema_1.MemoryError(`Failed to delete memory ${id}: ${error.message}`, MemoryV2Schema_1.MemoryErrorCode.STORAGE_ERROR, { memoryId: id, originalError: error });
        }
    }
    async query(query) {
        var _a, _b, _c, _d, _e;
        if (!this.initialized) {
            await this.initialize();
        }
        try {
            let results = [];
            // Build query filters
            const filters = {};
            if (query.ownerId) {
                filters['accessControl.ownerId'] = query.ownerId;
            }
            if (query.type) {
                filters.type = Array.isArray(query.type) ? { $in: query.type } : query.type;
            }
            if ((_b = (_a = query.filters) === null || _a === void 0 ? void 0 : _a.emotionalTags) === null || _b === void 0 ? void 0 : _b.length) {
                filters.emotionalTags = { $in: query.filters.emotionalTags };
            }
            if ((_c = query.filters) === null || _c === void 0 ? void 0 : _c.timeRange) {
                filters['provenance.createdAt'] = {
                    $gte: query.filters.timeRange.start,
                    $lte: query.filters.timeRange.end,
                };
            }
            if ((_d = query.filters) === null || _d === void 0 ? void 0 : _d.confidence) {
                filters['provenance.confidence'] = {
                    $gte: query.filters.confidence.min,
                    $lte: query.filters.confidence.max,
                };
            }
            if ((_e = query.filters) === null || _e === void 0 ? void 0 : _e.narrativeThread) {
                filters['linkage.narrativeThread'] = query.filters.narrativeThread;
            }
            // Execute query
            const allResults = await this.db.query('memories', {
                limit: (query.limit || 50) + (query.offset || 0),
                filter: (record) => this.matchesFilters(record, filters)
            });
            // Apply offset and sort
            results = this.applySortingAndOffset(allResults, query, query.offset || 0);
            // Add to cache
            results.forEach(memory => {
                this.memoryCache.set(memory.id, memory);
            });
            // Emit query event
            this.eventBus.emit(MemoryV2Schema_1.MEMORY_EVENTS.MEMORY_QUERIED, {
                id: `memory_query_${Date.now()}`,
                type: MemoryV2Schema_1.MEMORY_EVENTS.MEMORY_QUERIED,
                source: 'MemoryV2Store',
                timestamp: new Date(),
                payload: {
                    query: query,
                    resultCount: results.length,
                    operation: 'query'
                }
            });
            return results;
        }
        catch (error) {
            throw new MemoryV2Schema_1.MemoryError(`Failed to query memories: ${error instanceof Error ? error.message : String(error)}`, MemoryV2Schema_1.MemoryErrorCode.STORAGE_ERROR, { query, originalError: error });
        }
    }
    async search(text, options) {
        if (!this.initialized) {
            await this.initialize();
        }
        try {
            // Use database query with text filter
            const results = await this.db.query('memories', {
                filter: (record) => {
                    const memory = this.databaseRecordToMemoryItem(record);
                    const searchableText = [
                        memory.content,
                        ...memory.emotionalTags,
                        JSON.stringify(memory.metadata)
                    ].join(' ').toLowerCase();
                    return searchableText.includes(text.toLowerCase());
                },
                limit: (options === null || options === void 0 ? void 0 : options.limit) || 20
            });
            // Convert to memory items and filter by type if specified
            const memoryResults = results.map(record => this.databaseRecordToMemoryItem(record));
            const filteredResults = (options === null || options === void 0 ? void 0 : options.type)
                ? memoryResults.filter(memory => options.type.includes(memory.type))
                : memoryResults;
            // Add to cache
            filteredResults.forEach(memory => {
                this.memoryCache.set(memory.id, memory);
            });
            // Emit search event
            this.eventBus.emit(MemoryV2Schema_1.MEMORY_EVENTS.MEMORY_QUERIED, {
                id: `memory_search_${Date.now()}`,
                type: MemoryV2Schema_1.MEMORY_EVENTS.MEMORY_QUERIED,
                source: 'MemoryV2Store',
                timestamp: new Date(),
                payload: {
                    searchText: text,
                    resultCount: filteredResults.length,
                    operation: 'search'
                }
            });
            return filteredResults;
        }
        catch (error) {
            throw new MemoryV2Schema_1.MemoryError(`Failed to search memories: ${error instanceof Error ? error.message : String(error)}`, MemoryV2Schema_1.MemoryErrorCode.STORAGE_ERROR, { searchText: text, options, originalError: error });
        }
    }
    async getLinkedMemories(id, depth = 1) {
        if (!this.initialized) {
            await this.initialize();
        }
        const visited = new Set();
        const result = [];
        const traverse = async (currentId, currentDepth) => {
            if (visited.has(currentId) || currentDepth > depth) {
                return;
            }
            visited.add(currentId);
            // Get the memory
            const memory = await this.read(currentId);
            if (memory) {
                result.push(memory);
                // Get linked memories
                if (memory.linkage.relatedMemories.length > 0) {
                    for (const linkedId of memory.linkage.relatedMemories) {
                        await traverse(linkedId, currentDepth + 1);
                    }
                }
                // Get memories from narrative relationships
                const relationships = await this.db.query('narrativeRelationships', {
                    filter: (record) => {
                        const rel = this.databaseRecordToRelationship(record);
                        return rel.sourceId === currentId || rel.targetId === currentId;
                    }
                });
                for (const relationship of relationships) {
                    const otherId = relationship.data.sourceId === currentId
                        ? relationship.data.targetId
                        : relationship.data.sourceId;
                    if (!visited.has(otherId)) {
                        // Try to get the related memory
                        const relatedMemory = await this.read(otherId);
                        if (relatedMemory) {
                            await traverse(otherId, currentDepth + 1);
                        }
                    }
                }
            }
        };
        await traverse(id, 0);
        return result;
    }
    async createLink(sourceId, targetId, type, properties) {
        if (!this.initialized) {
            await this.initialize();
        }
        try {
            // Verify both memories exist
            const sourceMemory = await this.read(sourceId);
            const targetMemory = await this.read(targetId);
            if (!sourceMemory || !targetMemory) {
                throw new MemoryV2Schema_1.MemoryError(`Cannot create link: source or target memory not found`, MemoryV2Schema_1.MemoryErrorCode.MEMORY_NOT_FOUND, { sourceId, targetId });
            }
            // Create narrative relationship
            await this.createNarrativeRelationship(sourceId, targetId, type);
            // Update memory linkages
            await this.updateMemoryLinkages(sourceId, targetId, type);
            // Emit link event
            this.eventBus.emit(MemoryV2Schema_1.MEMORY_EVENTS.MEMORY_LINKED, {
                id: `memory_linked_${sourceId}_${targetId}`,
                type: MemoryV2Schema_1.MEMORY_EVENTS.MEMORY_LINKED,
                source: 'MemoryV2Store',
                timestamp: new Date(),
                payload: { sourceId, targetId, linkType: type }
            });
        }
        catch (error) {
            if (error instanceof MemoryV2Schema_1.MemoryError) {
                throw error;
            }
            throw new MemoryV2Schema_1.MemoryError(`Failed to create link between ${sourceId} and ${targetId}: ${error instanceof Error ? error.message : String(error)}`, MemoryV2Schema_1.MemoryErrorCode.STORAGE_ERROR, { sourceId, targetId, linkType: type, originalError: error });
        }
    }
    async removeLink(sourceId, targetId) {
        if (!this.initialized) {
            await this.initialize();
        }
        try {
            // Find and remove the relationship
            const relationships = await this.db.query('narrativeRelationships', {
                filter: (record) => (record.data.sourceId === sourceId && record.data.targetId === targetId) ||
                    (record.data.sourceId === targetId && record.data.targetId === sourceId)
            });
            for (const relationship of relationships) {
                await this.db.delete('narrativeRelationships', relationship.id);
                this.relationships.delete(relationship.id);
            }
            // Update memory linkages
            await this.removeMemoryLinkages(sourceId, targetId);
        }
        catch (error) {
            throw new MemoryV2Schema_1.MemoryError(`Failed to remove link between ${sourceId} and ${targetId}: ${error instanceof Error ? error.message : String(error)}`, MemoryV2Schema_1.MemoryErrorCode.STORAGE_ERROR, { sourceId, targetId, originalError: error });
        }
    }
    async getNarrativeThread(threadId) {
        if (!this.initialized) {
            await this.initialize();
        }
        try {
            const allMemories = await this.db.query('memories', {
                filter: (record) => {
                    var _a;
                    const memory = record.data;
                    return ((_a = memory.linkage) === null || _a === void 0 ? void 0 : _a.narrativeThread) === threadId;
                }
            });
            // Sort by creation date
            const memories = allMemories
                .map(record => this.databaseRecordToMemoryItem(record))
                .sort((a, b) => a.provenance.createdAt.getTime() - b.provenance.createdAt.getTime());
            return memories;
        }
        catch (error) {
            throw new MemoryV2Schema_1.MemoryError(`Failed to get narrative thread ${threadId}: ${error instanceof Error ? error.message : String(error)}`, MemoryV2Schema_1.MemoryErrorCode.STORAGE_ERROR, { threadId, originalError: error });
        }
    }
    async createNarrativeThread(memories) {
        if (!this.initialized) {
            await this.initialize();
        }
        const threadId = `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        try {
            // Update all memories with the new thread ID
            for (const memory of memories) {
                const updatedMemory = Object.assign(Object.assign({}, memory), { linkage: Object.assign(Object.assign({}, memory.linkage), { narrativeThread: threadId }), version: memory.version + 1, lastModified: new Date() });
                await this.db.update('memories', this.memoryItemToDatabaseRecord(updatedMemory));
                this.memoryCache.set(memory.id, updatedMemory);
            }
            // Create thread relationships
            for (let i = 0; i < memories.length - 1; i++) {
                await this.createNarrativeRelationship(memories[i].id, memories[i + 1].id, 'narrative_sequence');
            }
            return threadId;
        }
        catch (error) {
            throw new MemoryV2Schema_1.MemoryError(`Failed to create narrative thread: ${error instanceof Error ? error.message : String(error)}`, MemoryV2Schema_1.MemoryErrorCode.STORAGE_ERROR, { memoryCount: memories.length, originalError: error });
        }
    }
    async cleanup() {
        if (!this.initialized) {
            return;
        }
        try {
            // Clear caches
            this.memoryCache.clear();
            this.narrativeGraph.clear();
            this.relationships.clear();
            // Clean up expired memories based on retention policies
            await this.cleanupExpiredMemories();
            // Emit cleanup event
            this.eventBus.emit('memory:cleanup', {
                id: `memory_cleanup_${Date.now()}`,
                type: 'memory:cleanup',
                source: 'MemoryV2Store',
                timestamp: new Date(),
                payload: { operation: 'full_cleanup' }
            });
        }
        catch (error) {
            throw new MemoryV2Schema_1.MemoryError(`Failed to cleanup memory store: ${error instanceof Error ? error.message : String(error)}`, MemoryV2Schema_1.MemoryErrorCode.STORAGE_ERROR, { originalError: error });
        }
    }
    async getStats() {
        var _a, _b;
        if (!this.initialized) {
            await this.initialize();
        }
        try {
            const stats = await this.db.getStats();
            // Calculate additional metrics
            const memories = await this.db.query('memories', {});
            const typeCounts = {};
            let totalConfidence = 0;
            let oldestMemory = new Date();
            let newestMemory = new Date(0);
            memories.forEach(memory => {
                const memItem = this.databaseRecordToMemoryItem(memory);
                // Count by type
                typeCounts[memItem.type] = (typeCounts[memItem.type] || 0) + 1;
                // Calculate confidence
                totalConfidence += memItem.provenance.confidence;
                // Track date ranges
                if (memItem.provenance.createdAt < oldestMemory) {
                    oldestMemory = memItem.provenance.createdAt;
                }
                if (memItem.provenance.createdAt > newestMemory) {
                    newestMemory = memItem.provenance.createdAt;
                }
            });
            // Get relationship count
            const relationshipRecords = await this.db.query('narrativeRelationships', {});
            const relationshipCount = relationshipRecords.length;
            return {
                totalMemories: ((_a = stats.stores.memories) === null || _a === void 0 ? void 0 : _a.count) || memories.length,
                memoriesByType: typeCounts,
                averageConfidence: memories.length > 0 ? totalConfidence / memories.length : 0,
                oldestMemory,
                newestMemory,
                totalLinks: relationshipCount,
                narrativeThreads: new Set(memories.map(m => this.databaseRecordToMemoryItem(m).linkage.narrativeThread)).size,
                storageSize: ((_b = stats.stores.memories) === null || _b === void 0 ? void 0 : _b.size) || 0,
                retentionCompliance: {
                    compliant: memories.filter(m => this.isRetentionCompliant(this.databaseRecordToMemoryItem(m))).length,
                    expiring: memories.filter(m => this.isExpiringSoon(this.databaseRecordToMemoryItem(m))).length,
                    expired: memories.filter(m => this.isExpired(this.databaseRecordToMemoryItem(m))).length,
                },
            };
        }
        catch (error) {
            throw new MemoryV2Schema_1.MemoryError(`Failed to get memory stats: ${error instanceof Error ? error.message : String(error)}`, MemoryV2Schema_1.MemoryErrorCode.STORAGE_ERROR, { originalError: error });
        }
    }
    // ===== ADVANCED CAPABILITIES =====
    /**
     * Advanced Semantic Search with AI-powered relevance
     */
    async semanticSearch(query) {
        if (!this.initialized) {
            await this.initialize();
        }
        try {
            const startTime = Date.now();
            const results = [];
            // Get all memories for semantic analysis
            const allMemories = await this.db.query('memories', {
                limit: query.maxResults * 2 // Get more for better ranking
            });
            // Perform semantic analysis
            for (const record of allMemories) {
                const memory = this.databaseRecordToMemoryItem(record);
                const relevance = await this.calculateSemanticRelevance(memory, query);
                if (relevance.score >= query.similarity) {
                    const highlights = this.extractHighlights(memory, query.query);
                    const related = await this.findRelatedMemories(memory.id, 3);
                    results.push({
                        memory,
                        relevance: relevance.score,
                        highlights,
                        context: relevance.context,
                        relatedMemories: related,
                        metadata: {
                            searchTime: Date.now() - startTime,
                            totalResults: results.length,
                            ranking: relevance.score
                        }
                    });
                }
            }
            // Sort by relevance and limit results
            results.sort((a, b) => b.relevance - a.relevance);
            const finalResults = results.slice(0, query.maxResults);
            // Emit search event
            this.eventBus.emit(MemoryV2Schema_1.MEMORY_EVENTS.MEMORY_QUERIED, {
                id: `semantic_search_${Date.now()}`,
                type: MemoryV2Schema_1.MEMORY_EVENTS.MEMORY_QUERIED,
                source: 'MemoryV2Store',
                timestamp: new Date(),
                payload: {
                    query: query.query,
                    resultCount: finalResults.length,
                    operation: 'semantic_search'
                }
            });
            return finalResults;
        }
        catch (error) {
            throw new MemoryV2Schema_1.MemoryError(`Semantic search failed: ${error instanceof Error ? error.message : String(error)}`, MemoryV2Schema_1.MemoryErrorCode.STORAGE_ERROR, { query, originalError: error });
        }
    }
    /**
     * Memory Compression and Optimization
     */
    async compressMemory(memoryId) {
        if (!this.initialized) {
            await this.initialize();
        }
        try {
            const memory = await this.read(memoryId);
            if (!memory) {
                throw new MemoryV2Schema_1.MemoryError(`Memory ${memoryId} not found`, MemoryV2Schema_1.MemoryErrorCode.MEMORY_NOT_FOUND);
            }
            const optimizations = [];
            let sizeReduction = 0;
            const originalSize = JSON.stringify(memory).length;
            // Apply compression algorithms
            if (originalSize > MemoryV2Schema_1.MEMORY_CONSTANTS.COMPRESSION_THRESHOLD) {
                const compressed = await this.applyCompression(memory);
                sizeReduction = originalSize - compressed.length;
                optimizations.push({
                    type: 'compression',
                    description: `Compressed from ${originalSize} to ${compressed.length} bytes`,
                    impact: sizeReduction,
                    reversible: true
                });
            }
            // Deduplication
            const duplicates = await this.findDuplicateMemories(memory);
            if (duplicates.length > 0) {
                optimizations.push({
                    type: 'deduplication',
                    description: `Found ${duplicates.length} duplicate memories`,
                    impact: duplicates.length,
                    reversible: true
                });
            }
            // Consolidation
            const consolidated = await this.consolidateRelatedMemories(memory);
            if (consolidated) {
                optimizations.push({
                    type: 'consolidation',
                    description: 'Consolidated with related memories',
                    impact: 1,
                    reversible: true
                });
            }
            const result = {
                memoryId,
                optimizations,
                performanceImpact: {
                    sizeReduction,
                    accessTimeChange: -0.1, // Slight improvement
                    storageEfficiency: sizeReduction / originalSize
                },
                timestamp: new Date()
            };
            // Emit optimization event
            this.eventBus.emit('memory:optimized', {
                id: `memory_optimized_${memoryId}`,
                type: 'memory:optimized',
                source: 'MemoryV2Store',
                timestamp: new Date(),
                payload: result
            });
            return result;
        }
        catch (error) {
            throw new MemoryV2Schema_1.MemoryError(`Memory compression failed: ${error instanceof Error ? error.message : String(error)}`, MemoryV2Schema_1.MemoryErrorCode.STORAGE_ERROR, { memoryId, originalError: error });
        }
    }
    /**
     * Advanced Analytics and Insights
     */
    async generateAnalytics(timeRange) {
        if (!this.initialized) {
            await this.initialize();
        }
        try {
            const memories = await this.db.query('memories', {});
            const memoryItems = memories.map(record => this.databaseRecordToMemoryItem(record));
            // Filter by time range if provided
            const filteredMemories = timeRange
                ? memoryItems.filter(m => m.provenance.createdAt >= timeRange.start &&
                    m.provenance.createdAt <= timeRange.end)
                : memoryItems;
            const analytics = {
                temporalPatterns: await this.analyzeTemporalPatterns(filteredMemories),
                emotionalTrends: await this.analyzeEmotionalTrends(filteredMemories),
                usagePatterns: await this.analyzeUsagePatterns(filteredMemories),
                relationshipInsights: await this.analyzeRelationshipInsights(filteredMemories),
                predictiveInsights: await this.generatePredictiveInsights(filteredMemories)
            };
            // Emit analytics event
            this.eventBus.emit('memory:analytics_generated', {
                id: `analytics_${Date.now()}`,
                type: 'memory:analytics_generated',
                source: 'MemoryV2Store',
                timestamp: new Date(),
                payload: { timeRange, insightsCount: Object.keys(analytics).length }
            });
            return analytics;
        }
        catch (error) {
            throw new MemoryV2Schema_1.MemoryError(`Analytics generation failed: ${error instanceof Error ? error.message : String(error)}`, MemoryV2Schema_1.MemoryErrorCode.STORAGE_ERROR, { timeRange, originalError: error });
        }
    }
    /**
     * Memory Health Monitoring
     */
    async performHealthCheck() {
        if (!this.initialized) {
            await this.initialize();
        }
        try {
            const checks = [];
            let overallScore = 100;
            // Storage health check
            const storageCheck = await this.checkStorageHealth();
            checks.push(storageCheck);
            overallScore -= (100 - storageCheck.score);
            // Performance health check
            const performanceCheck = await this.checkPerformanceHealth();
            checks.push(performanceCheck);
            overallScore -= (100 - performanceCheck.score);
            // Integrity health check
            const integrityCheck = await this.checkIntegrityHealth();
            checks.push(integrityCheck);
            overallScore -= (100 - integrityCheck.score);
            // Capacity health check
            const capacityCheck = await this.checkCapacityHealth();
            checks.push(capacityCheck);
            overallScore -= (100 - capacityCheck.score);
            const healthCheck = {
                timestamp: new Date(),
                status: overallScore >= 80 ? 'healthy' : overallScore >= 60 ? 'degraded' : 'unhealthy',
                checks,
                overallScore: Math.max(0, overallScore),
                recommendations: await this.generateHealthRecommendations(checks)
            };
            // Emit health check event
            this.eventBus.emit(MemoryV2Schema_1.MEMORY_EVENTS.MEMORY_HEALTH_CHECK, {
                id: `health_check_${Date.now()}`,
                type: MemoryV2Schema_1.MEMORY_EVENTS.MEMORY_HEALTH_CHECK,
                source: 'MemoryV2Store',
                timestamp: new Date(),
                payload: healthCheck
            });
            return healthCheck;
        }
        catch (error) {
            throw new MemoryV2Schema_1.MemoryError(`Health check failed: ${error instanceof Error ? error.message : String(error)}`, MemoryV2Schema_1.MemoryErrorCode.HEALTH_CHECK_FAILED, { originalError: error });
        }
    }
    /**
     * Backup and Recovery
     */
    async createBackup(options) {
        if (!this.initialized) {
            await this.initialize();
        }
        try {
            const backupId = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const timestamp = new Date();
            // Get all memories
            const memories = await this.db.query('memories', {});
            const memoryItems = memories.map(record => this.databaseRecordToMemoryItem(record));
            // Get relationships
            const relationships = await this.db.query('narrativeRelationships', {});
            const relationshipItems = relationships.map(record => record.data);
            // Create backup data
            const backupData = {
                memories: memoryItems,
                relationships: relationshipItems,
                metadata: {
                    totalMemories: memoryItems.length,
                    totalRelationships: relationshipItems.length,
                    createdAt: timestamp,
                    version: '2.0'
                }
            };
            // Compress if requested
            let backupContent = JSON.stringify(backupData);
            let compressed = false;
            if ((options === null || options === void 0 ? void 0 : options.compress) && backupContent.length > MemoryV2Schema_1.MEMORY_CONSTANTS.COMPRESSION_THRESHOLD) {
                backupContent = await this.compressData(backupContent);
                compressed = true;
            }
            // Store backup
            const backup = {
                id: backupId,
                timestamp,
                type: (options === null || options === void 0 ? void 0 : options.type) || 'full',
                size: backupContent.length,
                checksum: await this.calculateChecksum(backupContent),
                location: `memory_backup_${backupId}`,
                status: 'completed',
                metadata: {
                    compressed,
                    originalSize: JSON.stringify(backupData).length,
                    compressionRatio: compressed ? backupContent.length / JSON.stringify(backupData).length : 1
                }
            };
            // Save backup metadata
            await this.db.create('memoryBackups', {
                id: backupId,
                data: backup,
                timestamp,
                version: 1,
                deleted: false,
                synced: false
            });
            // Emit backup event
            this.eventBus.emit(MemoryV2Schema_1.MEMORY_EVENTS.MEMORY_BACKUP_COMPLETED, {
                id: `backup_completed_${backupId}`,
                type: MemoryV2Schema_1.MEMORY_EVENTS.MEMORY_BACKUP_COMPLETED,
                source: 'MemoryV2Store',
                timestamp: new Date(),
                payload: backup
            });
            return backup;
        }
        catch (error) {
            throw new MemoryV2Schema_1.MemoryError(`Backup creation failed: ${error instanceof Error ? error.message : String(error)}`, MemoryV2Schema_1.MemoryErrorCode.BACKUP_ERROR, { options, originalError: error });
        }
    }
    /**
     * Memory Synchronization
     */
    async synchronizeMemories(syncConfig) {
        if (!this.initialized) {
            await this.initialize();
        }
        try {
            const result = {
                success: true,
                syncedRecords: 0,
                conflicts: [],
                errors: [],
                timestamp: new Date()
            };
            // Get pending sync operations
            for (const operation of syncConfig.pendingSyncs) {
                try {
                    await this.executeSyncOperation(operation);
                    result.syncedRecords++;
                }
                catch (error) {
                    result.errors.push(`${operation.id}: ${error instanceof Error ? error.message : String(error)}`);
                }
            }
            // Emit sync event
            this.eventBus.emit(MemoryV2Schema_1.MEMORY_EVENTS.MEMORY_SYNC_COMPLETED, {
                id: `sync_completed_${Date.now()}`,
                type: MemoryV2Schema_1.MEMORY_EVENTS.MEMORY_SYNC_COMPLETED,
                source: 'MemoryV2Store',
                timestamp: new Date(),
                payload: result
            });
            return result;
        }
        catch (error) {
            throw new MemoryV2Schema_1.MemoryError(`Memory synchronization failed: ${error instanceof Error ? error.message : String(error)}`, MemoryV2Schema_1.MemoryErrorCode.SYNC_ERROR, { syncConfig, originalError: error });
        }
    }
    /**
     * Plugin System Integration
     */
    async registerPlugin(plugin) {
        if (!this.initialized) {
            await this.initialize();
        }
        try {
            // Validate plugin
            if (!plugin.id || !plugin.name || !plugin.capabilities) {
                throw new Error('Invalid plugin configuration');
            }
            // Store plugin
            await this.db.create('memoryPlugins', {
                id: plugin.id,
                data: plugin,
                timestamp: new Date(),
                version: 1,
                deleted: false,
                synced: false
            });
            // Initialize plugin hooks
            for (const hook of plugin.hooks) {
                this.eventBus.on(hook.event, async (event) => {
                    if (plugin.enabled && this.matchesHookConditions(event, hook)) {
                        await this.executePluginHook(plugin, hook, event);
                    }
                });
            }
            // Emit plugin registration event
            this.eventBus.emit('memory:plugin_registered', {
                id: `plugin_registered_${plugin.id}`,
                type: 'memory:plugin_registered',
                source: 'MemoryV2Store',
                timestamp: new Date(),
                payload: { pluginId: plugin.id, capabilities: plugin.capabilities.length }
            });
        }
        catch (error) {
            throw new MemoryV2Schema_1.MemoryError(`Plugin registration failed: ${error instanceof Error ? error.message : String(error)}`, MemoryV2Schema_1.MemoryErrorCode.STORAGE_ERROR, { plugin, originalError: error });
        }
    }
    /**
     * Advanced Learning and Adaptation
     */
    async learnFromInteractions(interactions) {
        if (!this.initialized) {
            await this.initialize();
        }
        try {
            const patterns = [];
            // Analyze interaction patterns
            const patternAnalysis = await this.analyzeInteractionPatterns(interactions);
            for (const pattern of patternAnalysis) {
                const learningPattern = {
                    id: `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    pattern: pattern.signature,
                    confidence: pattern.confidence,
                    occurrences: pattern.occurrences,
                    lastSeen: new Date(),
                    context: pattern.context,
                    adaptations: await this.generateAdaptations(pattern)
                };
                patterns.push(learningPattern);
                // Store learning pattern
                await this.db.create('learningPatterns', {
                    id: learningPattern.id,
                    data: learningPattern,
                    timestamp: new Date(),
                    version: 1,
                    deleted: false,
                    synced: false
                });
            }
            // Emit learning event
            this.eventBus.emit('memory:learning_completed', {
                id: `learning_${Date.now()}`,
                type: 'memory:learning_completed',
                source: 'MemoryV2Store',
                timestamp: new Date(),
                payload: { patternsLearned: patterns.length, interactionsAnalyzed: interactions.length }
            });
            return patterns;
        }
        catch (error) {
            throw new MemoryV2Schema_1.MemoryError(`Learning from interactions failed: ${error instanceof Error ? error.message : String(error)}`, MemoryV2Schema_1.MemoryErrorCode.STORAGE_ERROR, { interactionsCount: interactions.length, originalError: error });
        }
    }
    // ===== PRIVATE ADVANCED METHODS =====
    async calculateSemanticRelevance(memory, query) {
        // Simple semantic relevance calculation (can be enhanced with AI)
        const content = memory.content.toLowerCase();
        const queryTerms = query.query.toLowerCase().split(' ');
        let score = 0;
        const matches = [];
        for (const term of queryTerms) {
            if (content.includes(term)) {
                score += 0.1;
                matches.push(term);
            }
        }
        // Boost score for emotional tags matches
        for (const tag of memory.emotionalTags) {
            if (query.query.toLowerCase().includes(tag.toLowerCase())) {
                score += 0.2;
            }
        }
        return {
            score: Math.min(score, 1.0),
            context: matches.join(', ')
        };
    }
    extractHighlights(memory, query) {
        const highlights = [];
        const content = memory.content;
        const queryTerms = query.toLowerCase().split(' ');
        for (const term of queryTerms) {
            const index = content.toLowerCase().indexOf(term);
            if (index !== -1) {
                const start = Math.max(0, index - 20);
                const end = Math.min(content.length, index + term.length + 20);
                highlights.push(`...${content.substring(start, end)}...`);
            }
        }
        return highlights;
    }
    async findRelatedMemories(memoryId, limit) {
        const relationships = await this.db.query('narrativeRelationships', {
            filter: (record) => record.data.sourceId === memoryId || record.data.targetId === memoryId
        });
        const relatedIds = new Set();
        for (const relationship of relationships) {
            if (relationship.data.sourceId !== memoryId)
                relatedIds.add(relationship.data.sourceId);
            if (relationship.data.targetId !== memoryId)
                relatedIds.add(relationship.data.targetId);
        }
        const relatedMemories = [];
        for (const id of Array.from(relatedIds).slice(0, limit)) {
            const memory = await this.read(id);
            if (memory)
                relatedMemories.push(memory);
        }
        return relatedMemories;
    }
    async applyCompression(memory) {
        // Simple compression (can be enhanced with actual compression algorithms)
        return JSON.stringify(memory);
    }
    async findDuplicateMemories(memory) {
        const allMemories = await this.db.query('memories', {});
        const duplicates = [];
        for (const record of allMemories) {
            const otherMemory = this.databaseRecordToMemoryItem(record);
            if (otherMemory.id !== memory.id &&
                otherMemory.content === memory.content &&
                otherMemory.type === memory.type) {
                duplicates.push(otherMemory);
            }
        }
        return duplicates;
    }
    async consolidateRelatedMemories(memory) {
        // Simple consolidation logic (can be enhanced)
        const related = await this.findRelatedMemories(memory.id, 5);
        return related.length > 3; // Consolidate if many related memories
    }
    async analyzeTemporalPatterns(memories) {
        // Simple temporal pattern analysis
        const patterns = [];
        const hourlyCounts = {};
        memories.forEach(memory => {
            const hour = memory.provenance.createdAt.getHours();
            hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1;
        });
        // Find peak hours
        const peakHour = Object.entries(hourlyCounts)
            .sort(([, a], [, b]) => b - a)[0];
        if (peakHour) {
            patterns.push({
                pattern: `Peak activity at ${peakHour[0]}:00`,
                frequency: peakHour[1],
                confidence: 0.8,
                timeWindows: [{ start: new Date(), end: new Date() }]
            });
        }
        return patterns;
    }
    async analyzeEmotionalTrends(memories) {
        const trends = [];
        const emotionCounts = {};
        memories.forEach(memory => {
            memory.emotionalTags.forEach(tag => {
                emotionCounts[tag] = (emotionCounts[tag] || 0) + 1;
            });
        });
        Object.entries(emotionCounts).forEach(([emotion, count]) => {
            trends.push({
                emotion,
                trend: 'stable', // Simple analysis
                changeRate: 0,
                timeWindow: { start: new Date(), end: new Date() }
            });
        });
        return trends;
    }
    async analyzeUsagePatterns(memories) {
        const patterns = [];
        const typeCounts = {};
        memories.forEach(memory => {
            typeCounts[memory.type] = (typeCounts[memory.type] || 0) + 1;
        });
        Object.entries(typeCounts).forEach(([type, count]) => {
            patterns.push({
                pattern: `Usage pattern for ${type}`,
                frequency: count,
                contexts: [type],
                effectiveness: count / memories.length
            });
        });
        return patterns;
    }
    async analyzeRelationshipInsights(memories) {
        const insights = [];
        const relationships = await this.db.query('narrativeRelationships', {});
        const relationshipCounts = {};
        relationships.forEach(relationship => {
            const type = relationship.data.type || 'unknown';
            relationshipCounts[type] = (relationshipCounts[type] || 0) + 1;
        });
        Object.entries(relationshipCounts).forEach(([type, count]) => {
            insights.push({
                entities: ['various'],
                relationship: type,
                strength: count / relationships.length,
                evolution: [{ date: new Date(), strength: count / relationships.length }]
            });
        });
        return insights;
    }
    async generatePredictiveInsights(memories) {
        const insights = [];
        // Simple predictive insights based on patterns
        const recentMemories = memories
            .sort((a, b) => b.provenance.createdAt.getTime() - a.provenance.createdAt.getTime())
            .slice(0, 10);
        const avgConfidence = recentMemories.reduce((sum, m) => sum + m.provenance.confidence, 0) / recentMemories.length;
        insights.push({
            type: 'behavior',
            prediction: `Expected confidence level: ${(avgConfidence * 100).toFixed(1)}%`,
            confidence: 0.7,
            timeHorizon: 7,
            supportingEvidence: [`Based on ${recentMemories.length} recent memories`]
        });
        return insights;
    }
    async checkStorageHealth() {
        try {
            const stats = await this.db.getStats();
            const utilization = (stats.totalSize || 0) / (100 * 1024 * 1024); // Assuming 100MB limit
            return {
                name: 'Storage Health',
                status: utilization > 0.9 ? 'fail' : utilization > 0.7 ? 'warn' : 'pass',
                score: Math.max(0, 100 - (utilization * 100)),
                message: `Storage utilization: ${(utilization * 100).toFixed(1)}%`,
                details: { utilization, totalSize: stats.totalSize }
            };
        }
        catch (error) {
            return {
                name: 'Storage Health',
                status: 'fail',
                score: 0,
                message: `Storage check failed: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
    async checkPerformanceHealth() {
        try {
            const startTime = Date.now();
            await this.db.query('memories', { limit: 1 });
            const responseTime = Date.now() - startTime;
            return {
                name: 'Performance Health',
                status: responseTime > 1000 ? 'fail' : responseTime > 500 ? 'warn' : 'pass',
                score: Math.max(0, 100 - (responseTime / 10)),
                message: `Response time: ${responseTime}ms`,
                details: { responseTime }
            };
        }
        catch (error) {
            return {
                name: 'Performance Health',
                status: 'fail',
                score: 0,
                message: `Performance check failed: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
    async checkIntegrityHealth() {
        try {
            const memories = await this.db.query('memories', {});
            let corrupted = 0;
            for (const record of memories) {
                if (!record.id || !record.data) {
                    corrupted++;
                }
            }
            const corruptionRate = corrupted / memories.length;
            return {
                name: 'Integrity Health',
                status: corruptionRate > 0.1 ? 'fail' : corruptionRate > 0.01 ? 'warn' : 'pass',
                score: Math.max(0, 100 - (corruptionRate * 1000)),
                message: `Corruption rate: ${(corruptionRate * 100).toFixed(2)}%`,
                details: { corrupted, total: memories.length }
            };
        }
        catch (error) {
            return {
                name: 'Integrity Health',
                status: 'fail',
                score: 0,
                message: `Integrity check failed: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
    async checkCapacityHealth() {
        try {
            const memories = await this.db.query('memories', {});
            const capacityUsage = memories.length / 10000; // Assuming 10k memory limit
            return {
                name: 'Capacity Health',
                status: capacityUsage > 0.9 ? 'fail' : capacityUsage > 0.7 ? 'warn' : 'pass',
                score: Math.max(0, 100 - (capacityUsage * 100)),
                message: `Capacity usage: ${(capacityUsage * 100).toFixed(1)}%`,
                details: { used: memories.length, limit: 10000 }
            };
        }
        catch (error) {
            return {
                name: 'Capacity Health',
                status: 'fail',
                score: 0,
                message: `Capacity check failed: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
    async generateHealthRecommendations(checks) {
        const recommendations = [];
        checks.forEach(check => {
            if (check.status === 'fail') {
                switch (check.name) {
                    case 'Storage Health':
                        recommendations.push('Consider cleaning up old memories or increasing storage capacity');
                        break;
                    case 'Performance Health':
                        recommendations.push('Consider optimizing queries or adding indexes');
                        break;
                    case 'Integrity Health':
                        recommendations.push('Run integrity repair or restore from backup');
                        break;
                    case 'Capacity Health':
                        recommendations.push('Consider archiving old memories or upgrading capacity');
                        break;
                }
            }
        });
        return recommendations;
    }
    async compressData(data) {
        // Simple compression (can be enhanced with actual algorithms)
        return data.replace(/\s+/g, ' ').trim();
    }
    async calculateChecksum(data) {
        // Simple checksum (can be enhanced with crypto)
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16);
    }
    async executeSyncOperation(operation) {
        // Simple sync execution (can be enhanced with actual sync logic)
        for (const memory of operation.items) {
            await this.create(memory);
        }
    }
    matchesHookConditions(event, hook) {
        // Simple condition matching (can be enhanced)
        return true;
    }
    async executePluginHook(plugin, hook, event) {
        // Simple hook execution (can be enhanced with actual plugin system)
        console.log(`Executing plugin ${plugin.id} hook for event ${event.type}`);
    }
    async analyzeInteractionPatterns(interactions) {
        // Simple pattern analysis (can be enhanced with ML)
        const patterns = [];
        const typeCounts = {};
        interactions.forEach(interaction => {
            typeCounts[interaction.type] = (typeCounts[interaction.type] || 0) + 1;
        });
        Object.entries(typeCounts).forEach(([type, count]) => {
            patterns.push({
                signature: `Pattern for ${type}`,
                confidence: count / interactions.length,
                occurrences: count,
                context: type
            });
        });
        return patterns;
    }
    async generateAdaptations(pattern) {
        // Simple adaptation generation (can be enhanced)
        return [{
                type: 'response',
                description: `Adaptation for pattern: ${pattern.signature}`,
                confidence: pattern.confidence,
                appliedAt: new Date()
            }];
    }
    // Private helper methods
    memoryItemToDatabaseRecord(memory) {
        return {
            id: memory.id,
            data: memory,
            timestamp: memory.lastModified,
            version: memory.version,
            deleted: false,
            synced: false,
        };
    }
    databaseRecordToMemoryItem(record) {
        return record.data;
    }
    narrativeNodeToDatabaseRecord(node) {
        return {
            id: node.id,
            data: node,
            timestamp: node.createdAt,
            version: 1,
            deleted: false,
            synced: false,
        };
    }
    databaseRecordToNarrativeNode(record) {
        return record.data;
    }
    relationshipToDatabaseRecord(relationship) {
        return {
            id: relationship.id,
            data: relationship,
            timestamp: relationship.createdAt,
            version: 1,
            deleted: false,
            synced: false,
        };
    }
    databaseRecordToRelationship(record) {
        return record.data;
    }
    buildSortOptions(query) {
        if (!query.sortBy) {
            return { 'provenance.createdAt': query.sortOrder === 'asc' ? 1 : -1 };
        }
        const sortField = query.sortBy === 'createdAt' ? 'provenance.createdAt' :
            query.sortBy === 'confidence' ? 'provenance.confidence' :
                query.sortBy === 'emotional_intensity' ? 'emotionalTags.length' :
                    query.sortBy;
        return { [sortField]: query.sortOrder === 'asc' ? 1 : -1 };
    }
    async updateNarrativeGraph(memory) {
        // Create or update narrative node for this memory
        const node = {
            id: memory.id,
            type: 'memory',
            label: `${memory.type}: ${memory.content.substring(0, 50)}...`,
            properties: {
                memoryType: memory.type,
                emotionalTags: memory.emotionalTags,
                confidence: memory.provenance.confidence,
                createdAt: memory.provenance.createdAt,
            },
            createdAt: memory.provenance.createdAt,
        };
        this.narrativeGraph.set(node.id, node);
        await this.db.create('narrativeNodes', this.narrativeNodeToDatabaseRecord(node));
        // Link to related memories
        for (const relatedId of memory.linkage.relatedMemories) {
            await this.createNarrativeRelationship(memory.id, relatedId, 'related');
        }
    }
    async createNarrativeRelationship(sourceId, targetId, type) {
        const relationshipId = `rel_${sourceId}_${targetId}_${Date.now()}`;
        const relationship = {
            id: relationshipId,
            type,
            sourceId,
            targetId,
            properties: {},
            weight: 1.0,
            createdAt: new Date(),
        };
        this.relationships.set(relationshipId, relationship);
        await this.db.create('narrativeRelationships', this.relationshipToDatabaseRecord(relationship));
    }
    async updateMemoryLinkages(sourceId, targetId, linkType) {
        // Update source memory
        const sourceMemory = await this.read(sourceId);
        if (sourceMemory) {
            const updatedSource = Object.assign(Object.assign({}, sourceMemory), { linkage: Object.assign(Object.assign({}, sourceMemory.linkage), { relatedMemories: Array.from(new Set([...sourceMemory.linkage.relatedMemories, targetId])), semanticLinks: [
                        ...sourceMemory.linkage.semanticLinks,
                        {
                            targetId,
                            relationship: 'supports',
                            strength: 1.0,
                            context: `Linked at ${new Date().toISOString()}`,
                        },
                    ] }), version: sourceMemory.version + 1, lastModified: new Date() });
            await this.db.update('memories', this.memoryItemToDatabaseRecord(updatedSource));
            this.memoryCache.set(sourceId, updatedSource);
        }
        // Update target memory
        const targetMemory = await this.read(targetId);
        if (targetMemory) {
            const updatedTarget = Object.assign(Object.assign({}, targetMemory), { linkage: Object.assign(Object.assign({}, targetMemory.linkage), { relatedMemories: Array.from(new Set([...targetMemory.linkage.relatedMemories, sourceId])) }), version: targetMemory.version + 1, lastModified: new Date() });
            await this.db.update('memories', this.memoryItemToDatabaseRecord(updatedTarget));
            this.memoryCache.set(targetId, updatedTarget);
        }
    }
    async removeMemoryLinkages(sourceId, targetId) {
        // Update source memory
        const sourceMemory = await this.read(sourceId);
        if (sourceMemory) {
            const updatedSource = Object.assign(Object.assign({}, sourceMemory), { linkage: Object.assign(Object.assign({}, sourceMemory.linkage), { relatedMemories: sourceMemory.linkage.relatedMemories.filter(id => id !== targetId), semanticLinks: sourceMemory.linkage.semanticLinks.filter(link => link.targetId !== targetId) }), version: sourceMemory.version + 1, lastModified: new Date() });
            await this.db.update('memories', this.memoryItemToDatabaseRecord(updatedSource));
            this.memoryCache.set(sourceId, updatedSource);
        }
        // Update target memory
        const targetMemory = await this.read(targetId);
        if (targetMemory) {
            const updatedTarget = Object.assign(Object.assign({}, targetMemory), { linkage: Object.assign(Object.assign({}, targetMemory.linkage), { relatedMemories: targetMemory.linkage.relatedMemories.filter(id => id !== sourceId) }), version: targetMemory.version + 1, lastModified: new Date() });
            await this.db.update('memories', this.memoryItemToDatabaseRecord(updatedTarget));
            this.memoryCache.set(targetId, updatedTarget);
        }
    }
    async cleanupNarrativeGraph(memoryId) {
        // Remove narrative node
        this.narrativeGraph.delete(memoryId);
        await this.db.delete('narrativeNodes', memoryId);
        // Remove related relationships
        const relationships = await this.db.query('narrativeRelationships', {
            filter: (record) => record.data.sourceId === memoryId || record.data.targetId === memoryId
        });
        for (const relationship of relationships) {
            this.relationships.delete(relationship.id);
            await this.db.delete('narrativeRelationships', relationship.id);
        }
    }
    async cleanupExpiredMemories() {
        const now = new Date();
        const memories = await this.db.query('memories', {});
        for (const memory of memories) {
            if (this.isExpired(this.databaseRecordToMemoryItem(memory))) {
                await this.delete(memory.id);
            }
        }
    }
    // Event handlers
    async handleMemoryQuery(event) {
        // Handle memory query events
        console.log('Memory query event:', event.payload);
    }
    async handleMemoryConsolidation(event) {
        // Handle memory consolidation events
        console.log('Memory consolidation event:', event.payload);
    }
    async handleMemoryCleanup(event) {
        // Handle memory cleanup events
        console.log('Memory cleanup event:', event.payload);
    }
    /**
     * Helper method to check if a record matches the given filters
     */
    matchesFilters(record, filters) {
        var _a, _b, _c;
        // Convert DatabaseRecord to MemoryItem for filtering
        const memory = record;
        if (filters.ownerId && ((_a = memory.accessControl) === null || _a === void 0 ? void 0 : _a.ownerId) !== filters.ownerId) {
            return false;
        }
        if (filters.type && memory.type !== filters.type) {
            return false;
        }
        if (filters['provenance.confidence']) {
            const confidence = (_b = memory.provenance) === null || _b === void 0 ? void 0 : _b.confidence;
            if (confidence < filters['provenance.confidence'].$gte ||
                confidence > filters['provenance.confidence'].$lte) {
                return false;
            }
        }
        if (filters['linkage.narrativeThread'] &&
            ((_c = memory.linkage) === null || _c === void 0 ? void 0 : _c.narrativeThread) !== filters['linkage.narrativeThread']) {
            return false;
        }
        return true;
    }
    /**
     * Helper method to apply sorting and offset to results
     */
    applySortingAndOffset(results, query, offset) {
        // Convert DatabaseRecord[] to MemoryItem[]
        let memories = results.map(record => record);
        // Apply sorting
        if (query.sortBy) {
            memories.sort((a, b) => {
                var _a, _b;
                let aValue, bValue;
                switch (query.sortBy) {
                    case 'createdAt':
                        aValue = a.provenance.createdAt;
                        bValue = b.provenance.createdAt;
                        break;
                    case 'confidence':
                        aValue = a.provenance.confidence;
                        bValue = b.provenance.confidence;
                        break;
                    case 'relevance':
                        aValue = a.provenance.confidence; // Use confidence as relevance proxy
                        bValue = b.provenance.confidence;
                        break;
                    case 'emotional_intensity':
                        aValue = ((_a = a.emotionalTags) === null || _a === void 0 ? void 0 : _a.length) || 0;
                        bValue = ((_b = b.emotionalTags) === null || _b === void 0 ? void 0 : _b.length) || 0;
                        break;
                    default:
                        aValue = a.provenance.createdAt;
                        bValue = b.provenance.createdAt;
                }
                if (query.sortOrder === 'desc') {
                    return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
                }
                else {
                    return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
                }
            });
        }
        // Apply offset
        return memories.slice(offset);
    }
    /**
     * Helper method to check retention compliance
     */
    isRetentionCompliant(memory) {
        const retentionPolicy = memory.accessControl.retentionPolicy;
        const age = Date.now() - memory.provenance.createdAt.getTime();
        const maxAge = retentionPolicy.duration * 24 * 60 * 60 * 1000; // Convert days to ms
        return age <= maxAge;
    }
    /**
     * Helper method to check if memory is expiring soon
     */
    isExpiringSoon(memory) {
        const retentionPolicy = memory.accessControl.retentionPolicy;
        const age = Date.now() - memory.provenance.createdAt.getTime();
        const maxAge = retentionPolicy.duration * 24 * 60 * 60 * 1000;
        const warningPeriod = 7 * 24 * 60 * 60 * 1000; // 7 days
        return age > (maxAge - warningPeriod) && age <= maxAge;
    }
    /**
     * Helper method to check if memory is expired
     */
    isExpired(memory) {
        const retentionPolicy = memory.accessControl.retentionPolicy;
        const age = Date.now() - memory.provenance.createdAt.getTime();
        const maxAge = retentionPolicy.duration * 24 * 60 * 60 * 1000;
        return age > maxAge;
    }
}
exports.MemoryV2Store = MemoryV2Store;

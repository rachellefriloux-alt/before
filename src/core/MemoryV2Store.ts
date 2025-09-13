/**
 * ╭──────────────────────────────────────────────────────────────────────────────╮
 * │                                                                              │
 * │   Sallie - Memory v2 Store Implementation                                    │
 * │                                                                              │
 * │   Rich memory storage with provenance, emotional tags, and narrative graphs │
 * │                                                                              │
 * ╰──────────────────────────────────────────────────────────────────────────────╯
 */

import {
  MemoryV2Item,
  MemoryProvenance,
  MemoryLinkage,
  MemoryRelationship,
  NarrativeNode,
  NarrativeRelationship,
  EmotionalContext,
  MemoryQuery,
  MemorySearchResult,
  ConsolidationRule,
  MemoryAnalytics,
  MemoryBackup,
  DEFAULT_ACCESS_CONTROL,
} from './MemoryV2Schema';
import { DatabaseAbstractionLayer } from './DatabaseIntegration';
import { getEventBus, SallieEventBus } from './EventBus';

export class MemoryV2Store {
  private eventBus: SallieEventBus;
  private db: DatabaseAbstractionLayer;
  private initialized = false;

  // In-memory caches for performance
  private memoryCache = new Map<string, MemoryV2Item>();
  private narrativeGraph = new Map<string, NarrativeNode>();
  private relationships = new Map<string, NarrativeRelationship[]>();

  // Consolidation and analytics
  private consolidationRules: ConsolidationRule[] = [];
  private analytics: MemoryAnalytics;

  constructor() {
    this.eventBus = getEventBus();
    this.db = new DatabaseAbstractionLayer({
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
          ],
        },
        {
          name: 'analytics',
          keyPath: 'id',
        },
      ],
    });

    this.analytics = this.initializeAnalytics();
    this.setupConsolidationRules();
  }

  // ==============================================================================
  // INITIALIZATION
  // ==============================================================================

  async initialize(): Promise<void> {
    await this.db.initialize();
    await this.loadCaches();
    await this.loadAnalytics();
    this.initialized = true;
    this.eventBus.emit('memoryV2:initialized');
  }

  private async loadCaches(): Promise<void> {
    // Load recent memories into cache
    const recentMemories = await this.db.query('memories', {
      limit: 1000,
      direction: 'prev',
    });

    for (const record of recentMemories) {
      this.memoryCache.set(record.id, record.data);
    }

    // Load narrative graph
    const nodes = await this.db.query('narrativeNodes');
    for (const record of nodes) {
      this.narrativeGraph.set(record.id, record.data);
    }

    // Load relationships
    const relationships = await this.db.query('narrativeRelationships');
    for (const record of relationships) {
      const sourceId = record.data.sourceId;
      if (!this.relationships.has(sourceId)) {
        this.relationships.set(sourceId, []);
      }
      this.relationships.get(sourceId)!.push(record.data);
    }
  }

  private async loadAnalytics(): Promise<void> {
    try {
      const analyticsRecord = await this.db.read('analytics', 'current');
      if (analyticsRecord) {
        this.analytics = analyticsRecord.data;
      }
    } catch (error) {
      console.warn('Failed to load analytics, using defaults');
    }
  }

  private initializeAnalytics(): MemoryAnalytics {
    return {
      totalMemories: 0,
      memoryTypeDistribution: {},
      averageImportance: 0,
      averageConfidence: 0,
      narrativeThreadCount: 0,
      relationshipCount: 0,
      emotionalDistribution: {},
      topTags: [],
      memoryGrowthRate: 0,
      consolidationStats: {
        lastRun: new Date(),
        memoriesConsolidated: 0,
        duplicatesRemoved: 0,
        relationshipsCreated: 0,
      },
    };
  }

  // ==============================================================================
  // CORE MEMORY OPERATIONS
  // ==============================================================================

  async storeMemory(memory: Omit<MemoryV2Item, 'id' | 'version' | 'lastModified'>): Promise<string> {
    if (!this.initialized) {
      throw new Error('MemoryV2Store not initialized');
    }

    const id = this.generateMemoryId();
    const now = new Date();

    const fullMemory: MemoryV2Item = {
      ...memory,
      id,
      version: 1,
      lastModified: now,
      timestamp: memory.timestamp || now,
      accessControl: memory.accessControl || DEFAULT_ACCESS_CONTROL,
    };

    // Store in database
    await this.db.create('memories', {
      id,
      data: fullMemory,
      timestamp: now,
      version: 1,
    });

    // Update cache
    this.memoryCache.set(id, fullMemory);

    // Update analytics
    this.updateAnalytics(fullMemory, 'created');

    // Process linkage and narrative connections
    await this.processMemoryLinkage(fullMemory);

    // Emit event
    this.eventBus.emit('memoryV2:stored', { id, memory: fullMemory });

    return id;
  }

  async retrieveMemory(id: string): Promise<MemoryV2Item | null> {
    if (!this.initialized) {
      throw new Error('MemoryV2Store not initialized');
    }

    // Check cache first
    if (this.memoryCache.has(id)) {
      return this.memoryCache.get(id)!;
    }

    // Read from database
    const record = await this.db.read('memories', id);
    if (!record) {
      return null;
    }

    // Update cache
    this.memoryCache.set(id, record.data);
    return record.data;
  }

  async updateMemory(id: string, updates: Partial<MemoryV2Item>): Promise<boolean> {
    if (!this.initialized) {
      throw new Error('MemoryV2Store not initialized');
    }

    const existingMemory = await this.retrieveMemory(id);
    if (!existingMemory) {
      return false;
    }

    const updatedMemory: MemoryV2Item = {
      ...existingMemory,
      ...updates,
      id, // Ensure ID doesn't change
      version: existingMemory.version + 1,
      lastModified: new Date(),
    };

    // Update database
    await this.db.update('memories', {
      id,
      data: updatedMemory,
      timestamp: updatedMemory.lastModified,
      version: updatedMemory.version,
    });

    // Update cache
    this.memoryCache.set(id, updatedMemory);

    // Update analytics
    this.updateAnalytics(updatedMemory, 'updated');

    // Emit event
    this.eventBus.emit('memoryV2:updated', { id, memory: updatedMemory });

    return true;
  }

  async deleteMemory(id: string): Promise<boolean> {
    if (!this.initialized) {
      throw new Error('MemoryV2Store not initialized');
    }

    const memory = await this.retrieveMemory(id);
    if (!memory) {
      return false;
    }

    // Remove from database
    const deleted = await this.db.delete('memories', id);
    
    // Remove from cache
    this.memoryCache.delete(id);

    // Update analytics
    this.updateAnalytics(memory, 'deleted');

    // Clean up narrative connections
    await this.cleanupNarrativeConnections(id);

    // Emit event
    this.eventBus.emit('memoryV2:deleted', { id });

    return deleted;
  }

  // ==============================================================================
  // ADVANCED SEARCH AND QUERY
  // ==============================================================================

  async searchMemories(query: MemoryQuery): Promise<MemorySearchResult[]> {
    if (!this.initialized) {
      throw new Error('MemoryV2Store not initialized');
    }

    const results: MemorySearchResult[] = [];
    let memories: MemoryV2Item[] = [];

    // Build database query based on search criteria
    const dbQuery: any = {
      limit: query.limit || 50,
      offset: query.offset || 0,
    };

    // Apply filters
    if (query.timeRange) {
      dbQuery.keyRange = IDBKeyRange.bound(query.timeRange.start, query.timeRange.end);
      dbQuery.index = 'createdAt';
    }

    if (query.memoryTypes && query.memoryTypes.length > 0) {
      // Filter by memory types
      const typePromises = query.memoryTypes.map(type =>
        this.db.query('memories', { index: 'type', keyRange: IDBKeyRange.only(type) })
      );
      const typeResults = await Promise.all(typePromises);
      memories = typeResults.flat().map(record => record.data);
    } else {
      const records = await this.db.query('memories', dbQuery);
      memories = records.map(record => record.data);
    }

    // Apply additional filters
    memories = this.applyQueryFilters(memories, query);

    // Calculate relevance scores and build results
    for (const memory of memories) {
      const relevanceScore = this.calculateRelevanceScore(memory, query);
      const matchReasons = this.getMatchReasons(memory, query);
      const relatedMemories = await this.findRelatedMemories(memory.id);

      results.push({
        memory,
        relevanceScore,
        matchReasons,
        relatedMemories,
        narrativeContext: await this.getNarrativeContext(memory.id),
      });
    }

    // Sort by relevance
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Emit search event
    this.eventBus.emit('memoryV2:searched', { query, resultCount: results.length });

    return results;
  }

  private applyQueryFilters(memories: MemoryV2Item[], query: MemoryQuery): MemoryV2Item[] {
    return memories.filter(memory => {
      // Text search
      if (query.text) {
        const searchText = query.text.toLowerCase();
        const contentMatch = memory.content.toLowerCase().includes(searchText);
        const tagMatch = memory.tags.some(tag => tag.toLowerCase().includes(searchText));
        if (!contentMatch && !tagMatch) return false;
      }

      // Importance range
      if (query.importance) {
        if (memory.importance < query.importance.min || memory.importance > query.importance.max) {
          return false;
        }
      }

      // Confidence range
      if (query.confidence) {
        if (memory.confidence < query.confidence.min || memory.confidence > query.confidence.max) {
          return false;
        }
      }

      // Tags filter
      if (query.tags && query.tags.length > 0) {
        const hasRequiredTags = query.tags.some(tag => memory.tags.includes(tag));
        if (!hasRequiredTags) return false;
      }

      // Emotional tags filter
      if (query.emotionalTags && query.emotionalTags.length > 0) {
        const hasRequiredEmotionalTags = query.emotionalTags.some(tag => 
          memory.emotionalTags.includes(tag)
        );
        if (!hasRequiredEmotionalTags) return false;
      }

      return true;
    });
  }

  private calculateRelevanceScore(memory: MemoryV2Item, query: MemoryQuery): number {
    let score = 0;

    // Base score from importance and confidence
    score += memory.importance * 0.3;
    score += memory.confidence * 0.2;

    // Text relevance
    if (query.text) {
      const searchText = query.text.toLowerCase();
      const content = memory.content.toLowerCase();
      
      if (content.includes(searchText)) {
        score += 0.3;
        
        // Boost for exact matches
        if (content === searchText) {
          score += 0.2;
        }
      }
      
      // Tag matches
      const tagMatches = memory.tags.filter(tag => 
        tag.toLowerCase().includes(searchText)
      ).length;
      score += tagMatches * 0.1;
    }

    // Recency boost
    const daysSinceCreation = (Date.now() - memory.timestamp.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation < 7) {
      score += 0.1;
    }

    // Narrative thread boost
    if (memory.linkage.narrativeThread) {
      score += 0.1;
    }

    return Math.min(1, score);
  }

  private getMatchReasons(memory: MemoryV2Item, query: MemoryQuery): string[] {
    const reasons: string[] = [];

    if (query.text) {
      const searchText = query.text.toLowerCase();
      if (memory.content.toLowerCase().includes(searchText)) {
        reasons.push('Content match');
      }
      if (memory.tags.some(tag => tag.toLowerCase().includes(searchText))) {
        reasons.push('Tag match');
      }
    }

    if (query.memoryTypes && query.memoryTypes.includes(memory.type)) {
      reasons.push('Type match');
    }

    if (query.emotionalTags && query.emotionalTags.some(tag => memory.emotionalTags.includes(tag))) {
      reasons.push('Emotional tag match');
    }

    if (memory.importance > 0.8) {
      reasons.push('High importance');
    }

    return reasons;
  }

  // ==============================================================================
  // NARRATIVE GRAPH OPERATIONS
  // ==============================================================================

  async createNarrativeNode(node: Omit<NarrativeNode, 'id' | 'createdAt' | 'lastUpdated'>): Promise<string> {
    const id = this.generateNodeId();
    const now = new Date();

    const fullNode: NarrativeNode = {
      ...node,
      id,
      createdAt: now,
      lastUpdated: now,
    };

    // Store in database
    await this.db.create('narrativeNodes', {
      id,
      data: fullNode,
      timestamp: now,
      version: 1,
    });

    // Update cache
    this.narrativeGraph.set(id, fullNode);

    // Emit event
    this.eventBus.emit('memoryV2:narrativeNodeCreated', { id, node: fullNode });

    return id;
  }

  async createNarrativeRelationship(
    relationship: Omit<NarrativeRelationship, 'id' | 'createdAt'>
  ): Promise<string> {
    const id = this.generateRelationshipId();
    const now = new Date();

    const fullRelationship: NarrativeRelationship = {
      ...relationship,
      id,
      createdAt: now,
    };

    // Store in database
    await this.db.create('narrativeRelationships', {
      id,
      data: fullRelationship,
      timestamp: now,
      version: 1,
    });

    // Update cache
    if (!this.relationships.has(fullRelationship.sourceId)) {
      this.relationships.set(fullRelationship.sourceId, []);
    }
    this.relationships.get(fullRelationship.sourceId)!.push(fullRelationship);

    // Update analytics
    this.analytics.relationshipCount++;

    // Emit event
    this.eventBus.emit('memoryV2:narrativeRelationshipCreated', { id, relationship: fullRelationship });

    return id;
  }

  async getNarrativeContext(memoryId: string): Promise<string[]> {
    const memory = await this.retrieveMemory(memoryId);
    if (!memory || !memory.linkage.narrativeThread) {
      return [];
    }

    // Find all memories in the same narrative thread
    const threadMemories = await this.db.query('memories', {
      index: 'narrativeThread',
      keyRange: IDBKeyRange.only(memory.linkage.narrativeThread),
    });

    return threadMemories
      .map(record => record.data)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .map(m => m.content);
  }

  private async findRelatedMemories(memoryId: string): Promise<string[]> {
    const memory = await this.retrieveMemory(memoryId);
    if (!memory) return [];

    const related: string[] = [];

    // Find memories with shared tags
    const tagMemories = await Promise.all(
      memory.tags.map(tag =>
        this.db.query('memories', {
          filter: (record) => record.data.tags.includes(tag) && record.data.id !== memoryId,
          limit: 3,
        })
      )
    );

    for (const memories of tagMemories) {
      related.push(...memories.map(record => record.data.id));
    }

    // Find memories in the same narrative thread
    if (memory.linkage.narrativeThread) {
      const threadMemories = await this.db.query('memories', {
        index: 'narrativeThread',
        keyRange: IDBKeyRange.only(memory.linkage.narrativeThread),
        filter: (record) => record.data.id !== memoryId,
        limit: 5,
      });
      related.push(...threadMemories.map(record => record.data.id));
    }

    // Remove duplicates and return
    return [...new Set(related)].slice(0, 10);
  }

  // ==============================================================================
  // CONSOLIDATION AND ANALYTICS
  // ==============================================================================

  private async processMemoryLinkage(memory: MemoryV2Item): Promise<void> {
    // Auto-generate narrative threads based on content similarity and temporal proximity
    if (!memory.linkage.narrativeThread) {
      const thread = await this.findOrCreateNarrativeThread(memory);
      if (thread) {
        await this.updateMemory(memory.id, {
          linkage: {
            ...memory.linkage,
            narrativeThread: thread,
          },
        });
      }
    }

    // Create semantic relationships
    await this.createSemanticRelationships(memory);
  }

  private async findOrCreateNarrativeThread(memory: MemoryV2Item): Promise<string | null> {
    // Find recent memories with similar content or tags
    const recentMemories = await this.db.query('memories', {
      index: 'createdAt',
      keyRange: IDBKeyRange.lowerBound(new Date(Date.now() - 24 * 60 * 60 * 1000)), // Last 24 hours
      limit: 20,
    });

    for (const record of recentMemories) {
      const otherMemory = record.data;
      if (this.areSemanticallyRelated(memory, otherMemory)) {
        return otherMemory.linkage.narrativeThread || this.generateNarrativeThreadId();
      }
    }

    return null;
  }

  private areSemanticallyRelated(memory1: MemoryV2Item, memory2: MemoryV2Item): boolean {
    // Check for shared tags
    const sharedTags = memory1.tags.filter(tag => memory2.tags.includes(tag));
    if (sharedTags.length >= 2) return true;

    // Check for similar emotional context
    const sharedEmotionalTags = memory1.emotionalTags.filter(tag => 
      memory2.emotionalTags.includes(tag)
    );
    if (sharedEmotionalTags.length >= 1) return true;

    // Simple content similarity (could be enhanced with NLP)
    const words1 = memory1.content.toLowerCase().split(/\s+/);
    const words2 = memory2.content.toLowerCase().split(/\s+/);
    const commonWords = words1.filter(word => words2.includes(word) && word.length > 3);
    
    return commonWords.length >= 3;
  }

  private async createSemanticRelationships(memory: MemoryV2Item): Promise<void> {
    // This is a simplified implementation - could be enhanced with more sophisticated NLP
    const relatedMemories = await this.findRelatedMemories(memory.id);
    
    for (const relatedId of relatedMemories.slice(0, 3)) {
      await this.createNarrativeRelationship({
        sourceId: memory.id,
        targetId: relatedId,
        type: 'similar_to',
        weight: 0.7,
        properties: { auto_generated: true },
        evidenceScore: 0.6,
      });
    }
  }

  private async cleanupNarrativeConnections(memoryId: string): Promise<void> {
    // Remove relationships where this memory was involved
    const relationships = await this.db.query('narrativeRelationships', {
      filter: (record) => 
        record.data.sourceId === memoryId || record.data.targetId === memoryId,
    });

    for (const record of relationships) {
      await this.db.delete('narrativeRelationships', record.id);
      
      // Update cache
      const sourceRelationships = this.relationships.get(record.data.sourceId);
      if (sourceRelationships) {
        const index = sourceRelationships.findIndex(r => r.id === record.id);
        if (index >= 0) {
          sourceRelationships.splice(index, 1);
        }
      }
    }
  }

  private updateAnalytics(memory: MemoryV2Item, operation: 'created' | 'updated' | 'deleted'): void {
    switch (operation) {
      case 'created':
        this.analytics.totalMemories++;
        this.analytics.memoryTypeDistribution[memory.type] = 
          (this.analytics.memoryTypeDistribution[memory.type] || 0) + 1;
        
        // Update emotional distribution
        for (const emotionalTag of memory.emotionalTags) {
          this.analytics.emotionalDistribution[emotionalTag] = 
            (this.analytics.emotionalDistribution[emotionalTag] || 0) + 1;
        }
        break;
        
      case 'deleted':
        this.analytics.totalMemories--;
        this.analytics.memoryTypeDistribution[memory.type] = 
          Math.max(0, (this.analytics.memoryTypeDistribution[memory.type] || 0) - 1);
        break;
    }

    // Recalculate averages
    this.recalculateAverages();
    
    // Save analytics periodically
    this.saveAnalytics();
  }

  private recalculateAverages(): void {
    // This would be expensive to do every time, so we do it periodically
    // For now, just approximate based on cached memories
    const cachedMemories = Array.from(this.memoryCache.values());
    if (cachedMemories.length > 0) {
      this.analytics.averageImportance = 
        cachedMemories.reduce((sum, m) => sum + m.importance, 0) / cachedMemories.length;
      this.analytics.averageConfidence = 
        cachedMemories.reduce((sum, m) => sum + m.confidence, 0) / cachedMemories.length;
    }
  }

  private async saveAnalytics(): Promise<void> {
    await this.db.update('analytics', {
      id: 'current',
      data: this.analytics,
      timestamp: new Date(),
      version: 1,
    });
  }

  // ==============================================================================
  // CONSOLIDATION RULES
  // ==============================================================================

  private setupConsolidationRules(): void {
    this.consolidationRules = [
      {
        id: 'duplicate_removal',
        name: 'Remove Duplicate Memories',
        condition: (memories) => this.hasDuplicates(memories),
        action: (memories) => this.removeDuplicates(memories),
        priority: 1,
        enabled: true,
      },
      {
        id: 'semantic_clustering',
        name: 'Cluster Semantically Similar Memories',
        condition: (memories) => this.hasSemanticClusters(memories),
        action: (memories) => this.createSemanticClusters(memories),
        priority: 2,
        enabled: true,
      },
      {
        id: 'temporal_grouping',
        name: 'Group Temporally Related Memories',
        condition: (memories) => this.hasTemporalGroups(memories),
        action: (memories) => this.createTemporalGroups(memories),
        priority: 3,
        enabled: true,
      },
    ];
  }

  async runConsolidation(): Promise<void> {
    const allMemories = Array.from(this.memoryCache.values());
    
    for (const rule of this.consolidationRules.filter(r => r.enabled).sort((a, b) => a.priority - b.priority)) {
      if (rule.condition(allMemories)) {
        const consolidatedMemories = rule.action(allMemories);
        
        // Update memories that were modified
        for (const memory of consolidatedMemories) {
          await this.updateMemory(memory.id, memory);
        }
        
        this.analytics.consolidationStats.memoriesConsolidated += consolidatedMemories.length;
      }
    }
    
    this.analytics.consolidationStats.lastRun = new Date();
    await this.saveAnalytics();
    
    this.eventBus.emit('memoryV2:consolidationCompleted', {
      rulesApplied: this.consolidationRules.filter(r => r.enabled).length,
    });
  }

  private hasDuplicates(memories: MemoryV2Item[]): boolean {
    const contentSet = new Set();
    for (const memory of memories) {
      if (contentSet.has(memory.content)) {
        return true;
      }
      contentSet.add(memory.content);
    }
    return false;
  }

  private removeDuplicates(memories: MemoryV2Item[]): MemoryV2Item[] {
    const seen = new Set<string>();
    const unique: MemoryV2Item[] = [];
    
    for (const memory of memories) {
      if (!seen.has(memory.content)) {
        seen.add(memory.content);
        unique.push(memory);
      } else {
        // Delete the duplicate
        this.deleteMemory(memory.id);
        this.analytics.consolidationStats.duplicatesRemoved++;
      }
    }
    
    return unique;
  }

  private hasSemanticClusters(memories: MemoryV2Item[]): boolean {
    // Simple heuristic: if we have many memories without narrative threads
    const unthreaded = memories.filter(m => !m.linkage.narrativeThread);
    return unthreaded.length > 10;
  }

  private createSemanticClusters(memories: MemoryV2Item[]): MemoryV2Item[] {
    // Group memories by similar tags and content
    const clusters = new Map<string, MemoryV2Item[]>();
    
    for (const memory of memories) {
      const clusterKey = memory.tags.slice(0, 2).sort().join('-') || 'misc';
      if (!clusters.has(clusterKey)) {
        clusters.set(clusterKey, []);
      }
      clusters.get(clusterKey)!.push(memory);
    }
    
    // Create narrative threads for clusters with multiple memories
    const updated: MemoryV2Item[] = [];
    for (const [clusterKey, clusterMemories] of clusters) {
      if (clusterMemories.length > 1) {
        const threadId = this.generateNarrativeThreadId();
        for (const memory of clusterMemories) {
          memory.linkage.narrativeThread = threadId;
          updated.push(memory);
        }
      }
    }
    
    return updated;
  }

  private hasTemporalGroups(memories: MemoryV2Item[]): boolean {
    // Check if there are memories that occurred close in time but aren't linked
    return true; // Simplified for now
  }

  private createTemporalGroups(memories: MemoryV2Item[]): MemoryV2Item[] {
    // Group memories that occurred within the same time window
    memories.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    const groups: MemoryV2Item[][] = [];
    let currentGroup: MemoryV2Item[] = [];
    let lastTimestamp = 0;
    
    for (const memory of memories) {
      const timeDiff = memory.timestamp.getTime() - lastTimestamp;
      
      if (timeDiff < 60 * 60 * 1000) { // Within 1 hour
        currentGroup.push(memory);
      } else {
        if (currentGroup.length > 1) {
          groups.push(currentGroup);
        }
        currentGroup = [memory];
      }
      
      lastTimestamp = memory.timestamp.getTime();
    }
    
    if (currentGroup.length > 1) {
      groups.push(currentGroup);
    }
    
    // Create temporal sequences for groups
    const updated: MemoryV2Item[] = [];
    for (const group of groups) {
      const sequenceId = this.generateSequenceId();
      for (let i = 0; i < group.length; i++) {
        const memory = group[i];
        memory.linkage.temporalSequence = [sequenceId];
        
        if (i > 0) {
          memory.linkage.causalConnections = memory.linkage.causalConnections || [];
          memory.linkage.causalConnections.push(group[i - 1].id);
        }
        
        updated.push(memory);
      }
    }
    
    return updated;
  }

  // ==============================================================================
  // UTILITY METHODS
  // ==============================================================================

  async getAnalytics(): Promise<MemoryAnalytics> {
    return { ...this.analytics };
  }

  async createBackup(): Promise<MemoryBackup> {
    const allMemories = await this.db.query('memories');
    const allNodes = await this.db.query('narrativeNodes');
    const allRelationships = await this.db.query('narrativeRelationships');

    const backup: MemoryBackup = {
      id: this.generateBackupId(),
      timestamp: new Date(),
      version: '2.0',
      memories: allMemories.map(record => record.data),
      narrativeNodes: allNodes.map(record => record.data),
      narrativeRelationships: allRelationships.map(record => record.data),
      analytics: this.analytics,
      checksum: this.calculateChecksum(allMemories.length.toString()),
    };

    return backup;
  }

  private generateMemoryId(): string {
    return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateNodeId(): string {
    return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRelationshipId(): string {
    return `rel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateNarrativeThreadId(): string {
    return `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSequenceId(): string {
    return `seq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateBackupId(): string {
    return `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateChecksum(data: string): string {
    // Simple checksum - in production, use a proper hashing algorithm
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }
}
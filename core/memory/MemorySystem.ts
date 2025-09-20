/*
 * Sallie Sovereign - Memory System
 * Advanced memory management for conversations, experiences, and learning
 */

import { EventEmitter } from 'events';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MemoryItem {
  id: string;
  content: string;
  type: 'conversation' | 'experience' | 'fact' | 'preference' | 'emotion';
  importance: number; // 0.0 to 1.0
  timestamp: number;
  tags: string[];
  associations: string[]; // Links to other memory IDs
  emotionalContext?: any;
  accessCount: number;
  lastAccessed: number;
}

export interface MemoryContext {
  recentConversation: MemoryItem[];
  relevantExperiences: MemoryItem[];
  userPreferences: MemoryItem[];
  emotionalHistory: MemoryItem[];
}

export class MemorySystem extends EventEmitter {
  private shortTermMemory: Map<string, MemoryItem> = new Map();
  private longTermIndex: Map<string, MemoryItem> = new Map();
  private initialized = false;
  
  // Memory configuration
  private readonly SHORT_TERM_LIMIT = 100;
  private readonly LONG_TERM_CONSOLIDATION_THRESHOLD = 0.7;
  private readonly MEMORY_DECAY_FACTOR = 0.95;

  constructor() {
    super();
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('💭 Initializing Memory System...');

    // Load existing memories
    await this.loadMemories();
    
    // Start memory consolidation process
    this.startMemoryConsolidation();

    this.initialized = true;
    this.emit('initialized');
    console.log('✅ Memory System initialized');
  }

  private async loadMemories(): Promise<void> {
    try {
      // Load short-term memory
      const shortTermData = await AsyncStorage.getItem('sallie_short_term_memory');
      if (shortTermData) {
        const memories = JSON.parse(shortTermData);
        memories.forEach((memory: MemoryItem) => {
          this.shortTermMemory.set(memory.id, memory);
        });
      }

      // Load long-term memory index
      const longTermData = await AsyncStorage.getItem('sallie_long_term_memory');
      if (longTermData) {
        const memories = JSON.parse(longTermData);
        memories.forEach((memory: MemoryItem) => {
          this.longTermIndex.set(memory.id, memory);
        });
      }

      console.log(`📚 Loaded ${this.shortTermMemory.size} short-term and ${this.longTermIndex.size} long-term memories`);
    } catch (error) {
      console.warn('Failed to load memories:', error);
    }
  }

  private startMemoryConsolidation(): void {
    // Run memory consolidation every 5 minutes
    setInterval(() => {
      this.consolidateMemories();
    }, 5 * 60 * 1000);
  }

  /**
   * Store a new memory item
   */
  async storeMemory(
    content: string,
    type: MemoryItem['type'],
    importance: number = 0.5,
    tags: string[] = [],
    emotionalContext?: any
  ): Promise<string> {
    const memoryId = this.generateMemoryId();
    
    const memory: MemoryItem = {
      id: memoryId,
      content,
      type,
      importance: Math.max(0, Math.min(1, importance)),
      timestamp: Date.now(),
      tags,
      associations: [],
      emotionalContext,
      accessCount: 0,
      lastAccessed: Date.now()
    };

    // Store in short-term memory first
    this.shortTermMemory.set(memoryId, memory);
    
    // Find and create associations
    await this.createAssociations(memory);

    // Emit memory stored event
    this.emit('memoryStored', memory);

    // Save to persistent storage
    await this.saveMemories();

    return memoryId;
  }

  private generateMemoryId(): string {
    return `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async createAssociations(newMemory: MemoryItem): Promise<void> {
    const allMemories = [...this.shortTermMemory.values(), ...this.longTermIndex.values()];
    
    for (const existingMemory of allMemories) {
      if (existingMemory.id === newMemory.id) continue;
      
      const similarity = this.calculateSimilarity(newMemory, existingMemory);
      if (similarity > 0.6) {
        newMemory.associations.push(existingMemory.id);
        existingMemory.associations.push(newMemory.id);
      }
    }
  }

  private calculateSimilarity(memory1: MemoryItem, memory2: MemoryItem): number {
    // Simple similarity calculation based on tags and content
    const tagSimilarity = this.calculateTagSimilarity(memory1.tags, memory2.tags);
    const contentSimilarity = this.calculateContentSimilarity(memory1.content, memory2.content);
    const typeSimilarity = memory1.type === memory2.type ? 0.3 : 0;
    
    return (tagSimilarity * 0.4 + contentSimilarity * 0.4 + typeSimilarity) / 1.1;
  }

  private calculateTagSimilarity(tags1: string[], tags2: string[]): number {
    if (tags1.length === 0 && tags2.length === 0) return 0;
    
    const intersection = tags1.filter(tag => tags2.includes(tag));
    const union = [...new Set([...tags1, ...tags2])];
    
    return intersection.length / union.length;
  }

  private calculateContentSimilarity(content1: string, content2: string): number {
    const words1 = content1.toLowerCase().split(/\s+/);
    const words2 = content2.toLowerCase().split(/\s+/);
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return intersection.length / union.length;
  }

  /**
   * Retrieve relevant memories based on context
   */
  async retrieveRelevantMemories(
    query: string,
    type?: MemoryItem['type'],
    limit: number = 10
  ): Promise<MemoryItem[]> {
    const queryWords = query.toLowerCase().split(/\s+/);
    const allMemories = [...this.shortTermMemory.values(), ...this.longTermIndex.values()];
    
    // Score memories based on relevance
    const scoredMemories = allMemories
      .filter(memory => !type || memory.type === type)
      .map(memory => ({
        memory,
        score: this.calculateRelevanceScore(memory, queryWords)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Update access information
    scoredMemories.forEach(({ memory }) => {
      memory.accessCount++;
      memory.lastAccessed = Date.now();
    });

    return scoredMemories.map(({ memory }) => memory);
  }

  private calculateRelevanceScore(memory: MemoryItem, queryWords: string[]): number {
    const contentWords = memory.content.toLowerCase().split(/\s+/);
    const tagWords = memory.tags.flatMap(tag => tag.toLowerCase().split(/\s+/));
    
    let score = 0;
    
    // Content matching
    queryWords.forEach(word => {
      if (contentWords.some(contentWord => contentWord.includes(word))) {
        score += 1;
      }
      if (tagWords.some(tagWord => tagWord.includes(word))) {
        score += 0.5;
      }
    });
    
    // Factor in importance, recency, and access frequency
    score *= memory.importance;
    score *= Math.log(memory.accessCount + 1) / 10; // Access frequency boost
    
    // Recency boost (more recent memories get higher scores)
    const daysSinceCreation = (Date.now() - memory.timestamp) / (1000 * 60 * 60 * 24);
    score *= Math.exp(-daysSinceCreation / 30); // Exponential decay over 30 days
    
    return score;
  }

  /**
   * Get memory context for conversations
   */
  async getMemoryContext(query: string = ''): Promise<MemoryContext> {
    const [
      recentConversation,
      relevantExperiences,
      userPreferences,
      emotionalHistory
    ] = await Promise.all([
      this.retrieveRelevantMemories(query, 'conversation', 5),
      this.retrieveRelevantMemories(query, 'experience', 3),
      this.retrieveRelevantMemories(query, 'preference', 5),
      this.retrieveRelevantMemories(query, 'emotion', 3)
    ]);

    return {
      recentConversation,
      relevantExperiences,
      userPreferences,
      emotionalHistory
    };
  }

  /**
   * Consolidate memories from short-term to long-term
   */
  private async consolidateMemories(): Promise<void> {
    console.log('🧠 Starting memory consolidation...');
    
    const memoriesToConsolidate: MemoryItem[] = [];
    
    for (const memory of this.shortTermMemory.values()) {
      // Check if memory should be consolidated
      if (this.shouldConsolidateMemory(memory)) {
        memoriesToConsolidate.push(memory);
      }
    }

    // Move to long-term memory
    for (const memory of memoriesToConsolidate) {
      this.longTermIndex.set(memory.id, memory);
      this.shortTermMemory.delete(memory.id);
    }

    // Clean up old short-term memories
    await this.cleanupShortTermMemory();
    
    // Apply decay to memories
    this.applyMemoryDecay();

    // Save consolidated memories
    await this.saveMemories();

    console.log(`🧠 Consolidated ${memoriesToConsolidate.length} memories`);
    this.emit('memoriesConsolidated', memoriesToConsolidate.length);
  }

  private shouldConsolidateMemory(memory: MemoryItem): boolean {
    const age = Date.now() - memory.timestamp;
    const ageInHours = age / (1000 * 60 * 60);
    
    // Consolidate based on importance, age, and access patterns
    return (
      memory.importance >= this.LONG_TERM_CONSOLIDATION_THRESHOLD ||
      (ageInHours > 24 && memory.accessCount > 2) ||
      ageInHours > 168 // One week
    );
  }

  private async cleanupShortTermMemory(): Promise<void> {
    if (this.shortTermMemory.size <= this.SHORT_TERM_LIMIT) return;

    const memories = Array.from(this.shortTermMemory.values())
      .sort((a, b) => a.importance * a.accessCount - b.importance * b.accessCount);

    const memoriesToRemove = memories.slice(0, memories.length - this.SHORT_TERM_LIMIT);
    
    memoriesToRemove.forEach(memory => {
      this.shortTermMemory.delete(memory.id);
    });
  }

  private applyMemoryDecay(): void {
    // Apply gradual decay to memory importance over time
    const now = Date.now();
    
    for (const memory of [...this.shortTermMemory.values(), ...this.longTermIndex.values()]) {
      const daysSinceAccess = (now - memory.lastAccessed) / (1000 * 60 * 60 * 24);
      
      if (daysSinceAccess > 7) { // Start decay after a week
        memory.importance *= this.MEMORY_DECAY_FACTOR;
        memory.importance = Math.max(0.1, memory.importance); // Don't let it go below 0.1
      }
    }
  }

  private async saveMemories(): Promise<void> {
    try {
      // Save short-term memory
      const shortTermArray = Array.from(this.shortTermMemory.values());
      await AsyncStorage.setItem('sallie_short_term_memory', JSON.stringify(shortTermArray));

      // Save long-term memory
      const longTermArray = Array.from(this.longTermIndex.values());
      await AsyncStorage.setItem('sallie_long_term_memory', JSON.stringify(longTermArray));
    } catch (error) {
      console.error('Failed to save memories:', error);
    }
  }

  /**
   * Get memory statistics
   */
  getMemoryStats(): Record<string, number> {
    return {
      shortTermCount: this.shortTermMemory.size,
      longTermCount: this.longTermIndex.size,
      totalMemories: this.shortTermMemory.size + this.longTermIndex.size,
      averageImportance: this.calculateAverageImportance()
    };
  }

  private calculateAverageImportance(): number {
    const allMemories = [...this.shortTermMemory.values(), ...this.longTermIndex.values()];
    if (allMemories.length === 0) return 0;
    
    const totalImportance = allMemories.reduce((sum, memory) => sum + memory.importance, 0);
    return totalImportance / allMemories.length;
  }
}
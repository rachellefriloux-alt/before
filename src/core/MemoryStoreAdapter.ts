/**
 * ╭──────────────────────────────────────────────────────────────────────────────╮
 * │                                                                              │
 * │   Memory Store Adapter for PersonaEngine                                     │
 * │                                                                              │
 * │   Bridges the existing Zustand memory store with PersonaEngine interface     │
 * │                                                                              │
 * ╰──────────────────────────────────────────────────────────────────────────────╯
 */

import { MemoryStore } from './PersonaEngine.types';
import { useMemoryStore, MemoryItem } from '../../store/memory';

export class MemoryStoreAdapter implements MemoryStore {
  private memoryStore: ReturnType<typeof useMemoryStore.getState>;

  constructor() {
    this.memoryStore = useMemoryStore.getState();
  }

  async store(key: string, data: any): Promise<void> {
    try {
      const memoryItem: Omit<MemoryItem, 'id' | 'timestamp' | 'type'> = {
        content: typeof data === 'string' ? data : JSON.stringify(data),
        importance: data.importance || 0.5,
        tags: data.tags || ['persona_engine'],
        emotion: data.emotion || 'neutral',
        confidence: data.confidence || 0.7,
        associations: data.associations || [],
        context: data.context || {},
        source: data.source || 'persona_engine',
        sha256: key,
      };

      // Determine memory type based on data characteristics
      const memoryType = this.determineMemoryType(data);

      switch (memoryType) {
        case 'episodic':
          this.memoryStore.addEpisodic(memoryItem);
          break;
        case 'semantic':
          this.memoryStore.addSemantic(memoryItem);
          break;
        case 'emotional':
          this.memoryStore.addEmotional(memoryItem);
          break;
        case 'procedural':
          this.memoryStore.addProcedural(memoryItem);
          break;
        default:
          this.memoryStore.addShortTerm(memoryItem);
      }
    } catch (error) {
      console.error('MemoryStoreAdapter store error:', error);
      throw error;
    }
  }

  async retrieve(key: string): Promise<any> {
    try {
      const state = useMemoryStore.getState();
      const allMemories = [
        ...state.shortTerm,
        ...state.episodic,
        ...state.semantic,
        ...state.emotional,
        ...state.procedural,
      ];

      const memory = allMemories.find(m => m.sha256 === key || m.id === key);
      return memory || null;
    } catch (error) {
      console.error('MemoryStoreAdapter retrieve error:', error);
      return null;
    }
  }

  async search(query: { pattern?: string; tags?: string[]; emotion?: string }): Promise<any[]> {
    try {
      const state = useMemoryStore.getState();
      const allMemories = [
        ...state.shortTerm,
        ...state.episodic,
        ...state.semantic,
        ...state.emotional,
        ...state.procedural,
      ];

      let results = allMemories;

      // Filter by pattern
      if (query.pattern) {
        const pattern = query.pattern.toLowerCase();
        results = results.filter(memory => 
          memory.content.toLowerCase().includes(pattern) ||
          memory.tags.some(tag => tag.toLowerCase().includes(pattern))
        );
      }

      // Filter by tags
      if (query.tags && query.tags.length > 0) {
        results = results.filter(memory =>
          query.tags!.some(tag => memory.tags.includes(tag))
        );
      }

      // Filter by emotion
      if (query.emotion) {
        results = results.filter(memory => memory.emotion === query.emotion);
      }

      // Sort by relevance (importance * confidence)
      results.sort((a, b) => 
        (b.importance * b.confidence) - (a.importance * a.confidence)
      );

      return results.slice(0, 20); // Return top 20 results
    } catch (error) {
      console.error('MemoryStoreAdapter search error:', error);
      return [];
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const memory = await this.retrieve(key);
      if (memory) {
        this.memoryStore.removeMemory(memory.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('MemoryStoreAdapter delete error:', error);
      return false;
    }
  }

  async getStats(): Promise<{ totalItems: number; lastModified: Date }> {
    try {
      const state = useMemoryStore.getState();
      const totalItems = 
        state.shortTerm.length +
        state.episodic.length +
        state.semantic.length +
        state.emotional.length +
        state.procedural.length;

      // Find the most recent timestamp
      const allMemories = [
        ...state.shortTerm,
        ...state.episodic,
        ...state.semantic,
        ...state.emotional,
        ...state.procedural,
      ];

      const lastModified = allMemories.length > 0
        ? new Date(Math.max(...allMemories.map(m => m.timestamp)))
        : new Date();

      return { totalItems, lastModified };
    } catch (error) {
      console.error('MemoryStoreAdapter getStats error:', error);
      return { totalItems: 0, lastModified: new Date() };
    }
  }

  // Helper method to determine memory type
  private determineMemoryType(data: any): MemoryItem['type'] {
    if (data.type) return data.type;

    // Determine based on content and tags
    const tags = data.tags || [];
    const content = data.content || '';

    if (tags.includes('conversation') || tags.includes('experience')) {
      return 'episodic';
    }

    if (tags.includes('emotion') || data.emotion !== 'neutral') {
      return 'emotional';
    }

    if (tags.includes('learning') || tags.includes('knowledge')) {
      return 'semantic';
    }

    if (tags.includes('skill') || tags.includes('procedure')) {
      return 'procedural';
    }

    // Default to short-term
    return 'shortTerm';
  }

  // Method to sync with the latest store state
  refreshStore(): void {
    this.memoryStore = useMemoryStore.getState();
  }
}
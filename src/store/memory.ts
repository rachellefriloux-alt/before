/**
 * Memory Store - Zustand store for Sallie's advanced memory system
 */

import { create } from 'zustand';
import { EmotionType } from './persona';

export interface MemoryFragment {
  id: string;
  content: string;
  timestamp: Date;
  tags: string[];
  importance: number; // 0-1 scale
  emotion: EmotionType;
  confidence: number; // 0-1 scale
  source: string;
  sha256: string;
  type?: string; // Optional type field for compatibility
}

export interface EpisodicMemory {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  participants: string[];
  location?: string;
  emotion: EmotionType;
  significance: number; // 0-1 scale
  fragments: string[]; // IDs of related memory fragments
  tags: string[];
}

export interface SemanticMemory {
  id: string;
  concept: string;
  definition: string;
  associations: string[];
  examples: string[];
  confidence: number;
  lastUpdated: Date;
  usage_count: number;
}

export interface ConversationContext {
  id: string;
  userId: string;
  startTime: Date;
  lastActivity: Date;
  messageCount: number;
  topics: string[];
  sentiment: EmotionType;
  summary?: string;
}

interface MemoryState {
  // Short-term working memory (recent interactions)
  shortTerm: MemoryFragment[];
  
  // Long-term episodic memory (experiences and events)
  episodic: EpisodicMemory[];
  
  // Semantic memory (facts and concepts)
  semantic: SemanticMemory[];
  
  // Current conversation context
  currentContext?: ConversationContext;
  
  // Actions
  addShortTerm: (memory: Omit<MemoryFragment, 'id' | 'timestamp'>) => void;
  addEpisodic: (memory: Omit<EpisodicMemory, 'id' | 'timestamp'>) => void;
  addSemantic: (memory: Omit<SemanticMemory, 'id' | 'lastUpdated' | 'usage_count'>) => void;
  
  // Context management
  startConversation: (userId: string) => void;
  updateContext: (updates: Partial<ConversationContext>) => void;
  endConversation: () => void;
  
  // Memory retrieval
  searchMemories: (query: string, type?: 'all' | 'shortTerm' | 'episodic' | 'semantic') => any[];
  getRecentMemories: (count?: number) => MemoryFragment[];
  getMemoriesByTag: (tag: string) => MemoryFragment[];
  getMemoriesByEmotion: (emotion: EmotionType) => MemoryFragment[];
  
  // Memory management
  consolidateMemories: () => void;
  clearShortTerm: () => void;
  archiveOldMemories: () => void;
}

export const useMemoryStore = create<MemoryState>((set, get) => ({
  shortTerm: [],
  episodic: [],
  semantic: [],
  currentContext: undefined,
  
  addShortTerm: (memory) => {
    const newMemory: MemoryFragment = {
      ...memory,
      id: `short_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };
    
    set((state) => ({
      shortTerm: [...state.shortTerm, newMemory].slice(-50), // Keep last 50 memories
    }));
  },
  
  addEpisodic: (memory) => {
    const newMemory: EpisodicMemory = {
      ...memory,
      id: `episodic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };
    
    set((state) => ({
      episodic: [...state.episodic, newMemory],
    }));
  },
  
  addSemantic: (memory) => {
    const newMemory: SemanticMemory = {
      ...memory,
      id: `semantic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      lastUpdated: new Date(),
      usage_count: 1,
    };
    
    set((state) => {
      // Check if concept already exists
      const existingIndex = state.semantic.findIndex(m => m.concept.toLowerCase() === memory.concept.toLowerCase());
      
      if (existingIndex >= 0) {
        // Update existing concept
        const updated = [...state.semantic];
        updated[existingIndex] = {
          ...updated[existingIndex],
          ...memory,
          usage_count: updated[existingIndex].usage_count + 1,
          lastUpdated: new Date(),
        };
        return { semantic: updated };
      } else {
        // Add new concept
        return { semantic: [...state.semantic, newMemory] };
      }
    });
  },
  
  startConversation: (userId: string) => {
    const context: ConversationContext = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      startTime: new Date(),
      lastActivity: new Date(),
      messageCount: 0,
      topics: [],
      sentiment: 'neutral',
    };
    
    set({ currentContext: context });
  },
  
  updateContext: (updates) => {
    set((state) => ({
      currentContext: state.currentContext ? {
        ...state.currentContext,
        ...updates,
        lastActivity: new Date(),
      } : undefined,
    }));
  },
  
  endConversation: () => {
    const state = get();
    if (state.currentContext) {
      // Archive conversation as episodic memory if significant
      if (state.currentContext.messageCount > 5) {
        get().addEpisodic({
          title: `Conversation on ${state.currentContext.startTime.toLocaleDateString()}`,
          description: state.currentContext.summary || 'Conversation with user',
          participants: [state.currentContext.userId, 'Sallie'],
          emotion: state.currentContext.sentiment,
          significance: Math.min(state.currentContext.messageCount / 20, 1),
          fragments: [], // Would link to relevant memory fragments
          tags: ['conversation', ...state.currentContext.topics],
        });
      }
    }
    
    set({ currentContext: undefined });
  },
  
  searchMemories: (query: string, type = 'all') => {
    const state = get();
    const queryLower = query.toLowerCase();
    const results: any[] = [];
    
    if (type === 'all' || type === 'shortTerm') {
      const shortTermResults = state.shortTerm.filter(m => 
        m.content.toLowerCase().includes(queryLower) ||
        m.tags.some(tag => tag.toLowerCase().includes(queryLower))
      );
      results.push(...shortTermResults);
    }
    
    if (type === 'all' || type === 'episodic') {
      const episodicResults = state.episodic.filter(m => 
        m.title.toLowerCase().includes(queryLower) ||
        m.description.toLowerCase().includes(queryLower) ||
        m.tags.some(tag => tag.toLowerCase().includes(queryLower))
      );
      results.push(...episodicResults);
    }
    
    if (type === 'all' || type === 'semantic') {
      const semanticResults = state.semantic.filter(m => 
        m.concept.toLowerCase().includes(queryLower) ||
        m.definition.toLowerCase().includes(queryLower) ||
        m.associations.some(assoc => assoc.toLowerCase().includes(queryLower))
      );
      results.push(...semanticResults);
    }
    
    return results.sort((a, b) => {
      // Sort by relevance (importance/significance) and recency
      const scoreA = (a.importance || a.significance || a.confidence || 0) * 0.7 + 
                    (Date.now() - new Date(a.timestamp || a.lastUpdated).getTime()) / (1000 * 60 * 60 * 24) * 0.3;
      const scoreB = (b.importance || b.significance || b.confidence || 0) * 0.7 + 
                    (Date.now() - new Date(b.timestamp || b.lastUpdated).getTime()) / (1000 * 60 * 60 * 24) * 0.3;
      return scoreB - scoreA;
    });
  },
  
  getRecentMemories: (count = 10) => {
    return get().shortTerm
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, count);
  },
  
  getMemoriesByTag: (tag: string) => {
    return get().shortTerm.filter(m => m.tags.includes(tag));
  },
  
  getMemoriesByEmotion: (emotion: EmotionType) => {
    return get().shortTerm.filter(m => m.emotion === emotion);
  },
  
  consolidateMemories: () => {
    // Move important short-term memories to long-term storage
    const state = get();
    const importantMemories = state.shortTerm.filter(m => m.importance > 0.7);
    
    importantMemories.forEach(memory => {
      get().addEpisodic({
        title: `Important memory: ${memory.content.substring(0, 50)}...`,
        description: memory.content,
        participants: ['user', 'Sallie'],
        emotion: memory.emotion,
        significance: memory.importance,
        fragments: [memory.id],
        tags: memory.tags,
      });
    });
  },
  
  clearShortTerm: () => {
    set({ shortTerm: [] });
  },
  
  archiveOldMemories: () => {
    // Archive old short-term memories (older than 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    set((state) => ({
      shortTerm: state.shortTerm.filter(m => m.timestamp > oneDayAgo),
    }));
  },
}));
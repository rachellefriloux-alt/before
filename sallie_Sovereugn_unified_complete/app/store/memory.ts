import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

export interface MemoryItem {
  id: string;
  timestamp: number;
  type: 'episodic' | 'semantic' | 'emotional' | 'procedural';
  content: string;
  tags: string[];
  importance: number; // 0-1 scale
  emotion: string;
  confidence: number;
  source: string;
  sha256: string;
}

export interface MemoryState {
  // Short-term memory (session-based)
  shortTerm: MemoryItem[];
  
  // Episodic memory (events and experiences)
  episodic: MemoryItem[];
  
  // Semantic memory (facts and knowledge)
  semantic: MemoryItem[];
  
  // Emotional memory (emotional experiences)
  emotional: MemoryItem[];
  
  // Actions
  addShortTerm: (item: Omit<MemoryItem, 'id' | 'timestamp'>) => void;
  addEpisodic: (item: Omit<MemoryItem, 'id' | 'timestamp'>) => void;
  addSemantic: (item: Omit<MemoryItem, 'id' | 'timestamp'>) => void;
  addEmotional: (item: Omit<MemoryItem, 'id' | 'timestamp'>) => void;
  
  // Memory retrieval
  getMemoriesByTag: (tag: string) => MemoryItem[];
  getMemoriesByType: (type: MemoryItem['type']) => MemoryItem[];
  getMemoriesByEmotion: (emotion: string) => MemoryItem[];
  searchMemories: (query: string) => MemoryItem[];
  
  // Memory management
  clearShortTerm: () => void;
  removeMemory: (id: string) => void;
  updateMemory: (id: string, updates: Partial<MemoryItem>) => void;
}

export const useMemoryStore = create<MemoryState>()(
  persist(
    (set, get) => ({
      // Initial state
      shortTerm: [],
      episodic: [],
      semantic: [],
      emotional: [],
      
      // Actions
      addShortTerm: (item) => {
        const memoryItem: MemoryItem = {
          ...item,
          id: `st_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
        };
        
        set((state) => ({
          shortTerm: [...state.shortTerm.slice(-49), memoryItem] // Keep last 50 items
        }));
      },
      
      addEpisodic: (item) => {
        const memoryItem: MemoryItem = {
          ...item,
          id: `ep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
        };
        
        set((state) => ({
          episodic: [...state.episodic, memoryItem]
        }));
      },
      
      addSemantic: (item) => {
        const memoryItem: MemoryItem = {
          ...item,
          id: `se_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
        };
        
        set((state) => ({
          semantic: [...state.semantic, memoryItem]
        }));
      },
      
      addEmotional: (item) => {
        const memoryItem: MemoryItem = {
          ...item,
          id: `em_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
        };
        
        set((state) => ({
          emotional: [...state.emotional, memoryItem]
        }));
      },
      
      // Memory retrieval
      getMemoriesByTag: (tag: string) => {
        const state = get();
        return [...state.shortTerm, ...state.episodic, ...state.semantic, ...state.emotional]
          .filter(memory => memory.tags.includes(tag))
          .sort((a, b) => b.timestamp - a.timestamp);
      },
      
      getMemoriesByType: (type: MemoryItem['type']) => {
        const state = get();
        switch (type) {
          case 'episodic': return state.episodic;
          case 'semantic': return state.semantic;
          case 'emotional': return state.emotional;
          default: return [];
        }
      },
      
      getMemoriesByEmotion: (emotion: string) => {
        const state = get();
        return [...state.shortTerm, ...state.episodic, ...state.emotional]
          .filter(memory => memory.emotion === emotion)
          .sort((a, b) => b.timestamp - a.timestamp);
      },
      
      searchMemories: (query: string) => {
        const state = get();
        const allMemories = [...state.shortTerm, ...state.episodic, ...state.semantic, ...state.emotional];
        const lowercaseQuery = query.toLowerCase();
        
        return allMemories.filter(memory => 
          memory.content.toLowerCase().includes(lowercaseQuery) ||
          memory.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
        ).sort((a, b) => b.timestamp - a.timestamp);
      },
      
      // Memory management
      clearShortTerm: () => set({ shortTerm: [] }),
      
      removeMemory: (id: string) => {
        set((state) => ({
          shortTerm: state.shortTerm.filter(m => m.id !== id),
          episodic: state.episodic.filter(m => m.id !== id),
          semantic: state.semantic.filter(m => m.id !== id),
          emotional: state.emotional.filter(m => m.id !== id),
        }));
      },
      
      updateMemory: (id: string, updates: Partial<MemoryItem>) => {
        set((state) => ({
          shortTerm: state.shortTerm.map(m => m.id === id ? { ...m, ...updates } : m),
          episodic: state.episodic.map(m => m.id === id ? { ...m, ...updates } : m),
          semantic: state.semantic.map(m => m.id === id ? { ...m, ...updates } : m),
          emotional: state.emotional.map(m => m.id === id ? { ...m, ...updates } : m),
        }));
      }
    }),
    {
      name: 'memory-storage',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          const value = storage.getString(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: (name, value) => {
          storage.set(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          storage.delete(name);
        },
      })),
    }
  )
);

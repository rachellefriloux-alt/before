import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

export interface MemoryItem {
  id: string;
  type: 'episodic' | 'semantic' | 'emotional' | 'procedural' | 'shortTerm';
  content: string;
  timestamp: number;
  importance: number; // 0-1 scale
  tags: string[];
  emotion: string;
  confidence: number; // 0-1 scale
  associations?: string[];
  context?: Record<string, any>;
  source?: string;
  sha256?: string;
}

interface MemoryState {
  shortTerm: MemoryItem[];
  episodic: MemoryItem[];
  semantic: MemoryItem[];
  emotional: MemoryItem[];
  procedural: MemoryItem[];
  maxMemories: number;

  // Actions
  addShortTerm: (memory: Omit<MemoryItem, 'id' | 'timestamp' | 'type'>) => void;
  addEpisodic: (memory: Omit<MemoryItem, 'id' | 'timestamp' | 'type'>) => void;
  addSemantic: (memory: Omit<MemoryItem, 'id' | 'timestamp' | 'type'>) => void;
  addEmotional: (memory: Omit<MemoryItem, 'id' | 'timestamp' | 'type'>) => void;
  addProcedural: (memory: Omit<MemoryItem, 'id' | 'timestamp' | 'type'>) => void;
  removeMemory: (id: string) => void;
  updateMemory: (id: string, updates: Partial<MemoryItem>) => void;
  consolidateMemories: () => void;
  clearMemories: (type?: MemoryItem['type']) => void;
  getMemoriesByTag: (tag: string) => MemoryItem[];
  getMemoriesByEmotion: (emotion: string) => MemoryItem[];
}

export const useMemoryStore = create<MemoryState>()(
  persist(
    (set, get) => ({
      shortTerm: [],
      episodic: [],
      semantic: [],
      emotional: [],
      procedural: [],
      maxMemories: 1000,

      addShortTerm: (memoryData) => {
        const newMemory: MemoryItem = {
          ...memoryData,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
          type: 'shortTerm',
        };

        set((state) => {
          const newShortTerm = [newMemory, ...state.shortTerm];
          // Keep only the most recent memories
          if (newShortTerm.length > 50) {
            newShortTerm.splice(50);
          }
          return { shortTerm: newShortTerm };
        });
      },

      addEpisodic: (memoryData) => {
        const newMemory: MemoryItem = {
          ...memoryData,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
          type: 'episodic',
        };

        set((state) => ({
          episodic: [newMemory, ...state.episodic].slice(0, 200),
        }));
      },

      addSemantic: (memoryData) => {
        const newMemory: MemoryItem = {
          ...memoryData,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
          type: 'semantic',
        };

        set((state) => ({
          semantic: [newMemory, ...state.semantic].slice(0, 300),
        }));
      },

      addEmotional: (memoryData) => {
        const newMemory: MemoryItem = {
          ...memoryData,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
          type: 'emotional',
        };

        set((state) => ({
          emotional: [newMemory, ...state.emotional].slice(0, 100),
        }));
      },

      addProcedural: (memoryData) => {
        const newMemory: MemoryItem = {
          ...memoryData,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
          type: 'procedural',
        };

        set((state) => ({
          procedural: [newMemory, ...state.procedural].slice(0, 150),
        }));
      },

      removeMemory: (id) => set((state) => ({
        shortTerm: state.shortTerm.filter(m => m.id !== id),
        episodic: state.episodic.filter(m => m.id !== id),
        semantic: state.semantic.filter(m => m.id !== id),
        emotional: state.emotional.filter(m => m.id !== id),
        procedural: state.procedural.filter(m => m.id !== id),
      })),

      updateMemory: (id, updates) => {
        const updateMemoryArray = (memories: MemoryItem[]) =>
          memories.map(m => m.id === id ? { ...m, ...updates } : m);

        set((state) => ({
          shortTerm: updateMemoryArray(state.shortTerm),
          episodic: updateMemoryArray(state.episodic),
          semantic: updateMemoryArray(state.semantic),
          emotional: updateMemoryArray(state.emotional),
          procedural: updateMemoryArray(state.procedural),
        }));
      },

      consolidateMemories: () => {
        set((state) => {
          // Move important short-term memories to long-term
          const importantShortTerm = state.shortTerm.filter(m => m.importance > 0.7);
          const remainingShortTerm = state.shortTerm.filter(m => m.importance <= 0.7);

          return {
            shortTerm: remainingShortTerm,
            episodic: [...importantShortTerm, ...state.episodic].slice(0, 200),
          };
        });
      },

      clearMemories: (type) => {
        if (type) {
          set((state) => ({ [type]: [] }));
        } else {
          set({
            shortTerm: [],
            episodic: [],
            semantic: [],
            emotional: [],
            procedural: [],
          });
        }
      },

      getMemoriesByTag: (tag) => {
        const state = get();
        const allMemories = [
          ...state.shortTerm,
          ...state.episodic,
          ...state.semantic,
          ...state.emotional,
          ...state.procedural,
        ];
        return allMemories.filter(m => m.tags.includes(tag));
      },

      getMemoriesByEmotion: (emotion) => {
        const state = get();
        const allMemories = [
          ...state.shortTerm,
          ...state.episodic,
          ...state.semantic,
          ...state.emotional,
          ...state.procedural,
        ];
        return allMemories.filter(m => m.emotion === emotion);
      },
    }),
    {
      name: 'memory-store',
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
/*
 * Sallie Sovereign - Memory Context
 * React context for managing conversation memory and experiences
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getSallieSystem } from '../../../core/init';
import { MemorySystem, MemoryItem, MemoryContext } from '../../../core/memory/MemorySystem';

interface MemoryContextType {
  // Memory operations
  storeMemory: (content: string, type: MemoryItem['type'], importance?: number, tags?: string[]) => Promise<string>;
  retrieveMemories: (query: string, type?: MemoryItem['type'], limit?: number) => Promise<MemoryItem[]>;
  getMemoryContext: (query?: string) => Promise<MemoryContext>;
  
  // Memory stats
  memoryStats: Record<string, number>;
  
  // Recent conversations
  recentConversations: MemoryItem[];
  userPreferences: MemoryItem[];
}

const MemoryContext = createContext<MemoryContextType | undefined>(undefined);

interface MemoryProviderProps {
  children: ReactNode;
}

export function MemoryProvider({ children }: MemoryProviderProps) {
  const [memorySystem, setMemorySystem] = useState<MemorySystem | null>(null);
  const [memoryStats, setMemoryStats] = useState<Record<string, number>>({});
  const [recentConversations, setRecentConversations] = useState<MemoryItem[]>([]);
  const [userPreferences, setUserPreferences] = useState<MemoryItem[]>([]);

  useEffect(() => {
    initializeMemorySystem();
  }, []);

  const initializeMemorySystem = async () => {
    try {
      const sallieSystem = getSallieSystem();
      const memory = sallieSystem.getMemorySystem();
      
      setMemorySystem(memory);
      updateMemoryStats(memory);
      
      // Load initial data
      const [conversations, preferences] = await Promise.all([
        memory.retrieveRelevantMemories('', 'conversation', 10),
        memory.retrieveRelevantMemories('', 'preference', 20)
      ]);
      
      setRecentConversations(conversations);
      setUserPreferences(preferences);

      // Listen for memory updates
      memory.on('memoryStored', (memoryItem: MemoryItem) => {
        updateMemoryStats(memory);
        
        if (memoryItem.type === 'conversation') {
          setRecentConversations(prev => [memoryItem, ...prev.slice(0, 9)]);
        } else if (memoryItem.type === 'preference') {
          setUserPreferences(prev => [memoryItem, ...prev.slice(0, 19)]);
        }
      });

      memory.on('memoriesConsolidated', () => {
        updateMemoryStats(memory);
      });

    } catch (error) {
      console.error('Failed to initialize memory system:', error);
    }
  };

  const updateMemoryStats = (memory: MemorySystem) => {
    setMemoryStats(memory.getMemoryStats());
  };

  const storeMemory = async (
    content: string, 
    type: MemoryItem['type'], 
    importance: number = 0.5, 
    tags: string[] = []
  ): Promise<string> => {
    if (!memorySystem) {
      throw new Error('Memory system not initialized');
    }
    
    return await memorySystem.storeMemory(content, type, importance, tags);
  };

  const retrieveMemories = async (
    query: string, 
    type?: MemoryItem['type'], 
    limit: number = 10
  ): Promise<MemoryItem[]> => {
    if (!memorySystem) {
      return [];
    }
    
    return await memorySystem.retrieveRelevantMemories(query, type, limit);
  };

  const getMemoryContext = async (query: string = ''): Promise<MemoryContext> => {
    if (!memorySystem) {
      return {
        recentConversation: [],
        relevantExperiences: [],
        userPreferences: [],
        emotionalHistory: []
      };
    }
    
    return await memorySystem.getMemoryContext(query);
  };

  const contextValue: MemoryContextType = {
    storeMemory,
    retrieveMemories,
    getMemoryContext,
    memoryStats,
    recentConversations,
    userPreferences,
  };

  return (
    <MemoryContext.Provider value={contextValue}>
      {children}
    </MemoryContext.Provider>
  );
}

export function useMemory() {
  const context = useContext(MemoryContext);
  if (context === undefined) {
    throw new Error('useMemory must be used within a MemoryProvider');
  }
  return context;
}
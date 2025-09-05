/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Advanced memory system with context awareness, quick capture, and retrieval.
 * Got it, love.
 */


import AsyncStorage from '@react-native-async-storage/async-storage';
import { encryptData, decryptData } from '../utils/securityUtils';
import { debounce, memoize } from '../utils/performanceUtils';
import { formatDate } from '../utils/dateUtils';
import { MemoryItem, MemoryType, SearchOptions } from '../types/MemoryTypes';

/**
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Advanced memory system with context awareness, quick capture, and retrieval.
 * Got it, love.
 */
class MemoryManager {
  private static instance: MemoryManager;
  private memoryCache: Map<string, MemoryItem[]>;
  private encryptionEnabled: boolean;
  private cacheTtl: number;
  private initialized: boolean;
  
  private constructor() {
    this.memoryCache = new Map();
    this.encryptionEnabled = true; // Default to true
    this.cacheTtl = 15 * 60 * 1000; // 15 minutes default
    this.initialized = false;
    
    // Initialize debounced save
    this.debouncedSave = debounce(this.saveMemoriesByType.bind(this), 2000);
    
    // Initialize memoized search
    this.memoizedSearch = memoize(
      this.performSearch.bind(this), 
      (options) => JSON.stringify(options),
      30 * 1000 // 30 seconds TTL for search cache
    );
  }
  
  /**
   * Get the singleton instance of MemoryManager
   */
  public static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }
  
  /**
   * Initialize the memory manager and preload caches
   */
  public async initialize(): Promise<boolean> {
    if (this.initialized) {
      return true;
    }
    
    try {
      // Load encryption setting
      const encryptionSetting = await AsyncStorage.getItem('SALLIE_MEMORY_ENCRYPTION');
      this.encryptionEnabled = encryptionSetting !== 'false';
      
      // Pre-load frequently used memory types to cache
      await this.loadMemoriesIntoCache(MemoryType.QUICK_CAPTURE);
      await this.loadMemoriesIntoCache(MemoryType.PREFERENCE);
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize MemoryManager:', error);
      return false;
    }
  }
  
  /**
   * Enable or disable encryption for memory storage
   */
  public async setEncryptionEnabled(enabled: boolean): Promise<void> {
    if (this.encryptionEnabled === enabled) {
      return;
    }
    
    this.encryptionEnabled = enabled;
    await AsyncStorage.setItem('SALLIE_MEMORY_ENCRYPTION', enabled.toString());
    
    // Re-save all cached memories with new encryption setting
    for (const [type, memories] of this.memoryCache.entries()) {
      await this.saveMemoriesByType(type as MemoryType, memories);
    }
  }
  
  private getStorageKeyForType(type: MemoryType): string {
    return `SALLIE_MEMORIES_${type.toUpperCase()}`;
  }
  
  private async loadMemoriesIntoCache(type: MemoryType): Promise<MemoryItem[]> {
    if (this.memoryCache.has(type)) {
      return this.memoryCache.get(type) || [];
    }
    
    try {
      const storageKey = this.getStorageKeyForType(type);
      const rawData = await AsyncStorage.getItem(storageKey);
      
      if (!rawData) {
        this.memoryCache.set(type, []);
        return [];
      }
      
      let memories: MemoryItem[];
      
      if (this.encryptionEnabled) {
        const decrypted = await decryptData(rawData);
        memories = JSON.parse(decrypted);
      } else {
        memories = JSON.parse(rawData);
      }
      
      this.memoryCache.set(type, memories);
      return memories;
    } catch (error) {
      console.error(`Failed to load memories of type ${type}:`, error);
      this.memoryCache.set(type, []);
      return [];
    }
  }
  
  private debouncedSave: (type: MemoryType, memories: MemoryItem[]) => void;
  
  private async saveMemoriesByType(type: MemoryType, memories: MemoryItem[]): Promise<void> {
    try {
      const storageKey = this.getStorageKeyForType(type);
      let dataToStore: string;
      
      if (this.encryptionEnabled) {
        dataToStore = await encryptData(JSON.stringify(memories));
      } else {
        dataToStore = JSON.stringify(memories);
      }
      
      await AsyncStorage.setItem(storageKey, dataToStore);
    } catch (error) {
      console.error(`Failed to save memories of type ${type}:`, error);
    }
  }
  
  /**
   * Add a new memory item
   */
  public async addMemory(memory: Omit<MemoryItem, 'id' | 'timestamp'>): Promise<MemoryItem> {
    await this.ensureInitialized();
    
    const newMemory: MemoryItem = {
      ...memory,
      id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: Date.now()
    };
    
    const memories = await this.loadMemoriesIntoCache(newMemory.type);
    memories.push(newMemory);
    
    // Sort by timestamp, newest first
    memories.sort((a, b) => b.timestamp - a.timestamp);
    
    // Debounced save to avoid frequent writes
    this.debouncedSave(newMemory.type, memories);
    
    return newMemory;
  }
  
  /**
   * Retrieve a memory item by its ID
   */
  public async getMemoryById(id: string): Promise<MemoryItem | null> {
    await this.ensureInitialized();
    
    // Search through all cached memory types
    for (const [type, memories] of this.memoryCache.entries()) {
      const found = memories.find(memory => memory.id === id);
      if (found) {
        return found;
      }
    }
    
    // If not found in cache, try loading all memory types
    for (const type of Object.values(MemoryType)) {
      const memories = await this.loadMemoriesIntoCache(type);
      const found = memories.find(memory => memory.id === id);
      if (found) {
        return found;
      }
    }
    
    return null;
  }
  
  /**
   * Update a memory item by its ID
   */
  public async updateMemory(id: string, updates: Partial<Omit<MemoryItem, 'id' | 'timestamp'>>): Promise<MemoryItem | null> {
    await this.ensureInitialized();
    
    const memory = await this.getMemoryById(id);
    
    if (!memory) {
      return null;
    }
    
    // Apply updates
    const updatedMemory: MemoryItem = {
      ...memory,
      ...updates,
      timestamp: Date.now() // Update timestamp
    };
    
    // Get all memories of this type
    const memories = await this.loadMemoriesIntoCache(memory.type);
    
    // Replace the old memory with the updated one
    const index = memories.findIndex(m => m.id === id);
    if (index !== -1) {
      memories[index] = updatedMemory;
      
      // Save changes
      this.debouncedSave(memory.type, memories);
      
      return updatedMemory;
    }
    
    return null;
  }
  
  /**
   * Delete a memory item by its ID
   */
  public async deleteMemory(id: string): Promise<boolean> {
    await this.ensureInitialized();
    
    const memory = await this.getMemoryById(id);
    
    if (!memory) {
      return false;
    }
    
    // Get all memories of this type
    const memories = await this.loadMemoriesIntoCache(memory.type);
    
    // Filter out the memory to delete
    const filteredMemories = memories.filter(m => m.id !== id);
    
    if (filteredMemories.length < memories.length) {
      // Memory was found and filtered out
      this.memoryCache.set(memory.type, filteredMemories);
      this.debouncedSave(memory.type, filteredMemories);
      return true;
    }
    
    return false;
  }
  
  /**
   * Get all memories of a specific type
   */
  public async getAllMemoriesByType(type: MemoryType): Promise<MemoryItem[]> {
    await this.ensureInitialized();
    
    return await this.loadMemoriesIntoCache(type);
  }
  
  private memoizedSearch: (options: SearchOptions) => Promise<MemoryItem[]>;
  
  private async performSearch(options: SearchOptions): Promise<MemoryItem[]> {
    const memoryTypes = options.type 
      ? [options.type] 
      : Object.values(MemoryType);
    
    let allMatches: MemoryItem[] = [];
    
    for (const type of memoryTypes) {
      const memories = await this.loadMemoriesIntoCache(type);
      
      const matches = memories.filter(memory => {
        // Filter by date range if specified
        if (options.fromDate && memory.timestamp < options.fromDate) {
          return false;
        }
        if (options.toDate && memory.timestamp > options.toDate) {
          return false;
        }
        
        // Filter by importance if specified
        if (options.importance !== undefined && memory.importance < options.importance) {
          return false;
        }
        
        // Filter by tags if specified
        if (options.tags && options.tags.length > 0) {
          if (!options.tags.some(tag => memory.tags.includes(tag))) {
            return false;
          }
        }
        
        // Filter by context if specified
        if (options.context) {
          if (options.context.location && 
              memory.context?.location !== options.context.location) {
            return false;
          }
          
          if (options.context.activity && 
              memory.context?.activity !== options.context.activity) {
            return false;
          }
          
          if (options.context.emotion && 
              memory.context?.emotion !== options.context.emotion) {
            return false;
          }
          
          if (options.context.associatedPersons && 
              options.context.associatedPersons.length > 0) {
            const memoryPersons = memory.context?.associatedPersons || [];
            if (!options.context.associatedPersons.some(p => memoryPersons.includes(p))) {
              return false;
            }
          }
        }
        
        return true;
      });
      
      allMatches = [...allMatches, ...matches];
    }
    
    // Sort by timestamp, newest first
    allMatches.sort((a, b) => b.timestamp - a.timestamp);
    
    // Apply limit if specified
    if (options.limit && options.limit > 0 && allMatches.length > options.limit) {
      allMatches = allMatches.slice(0, options.limit);
    }
    
    return allMatches;
  }
  
  /**
   * Search memories using various filters
   */
  public async searchMemories(options: SearchOptions): Promise<MemoryItem[]> {
    await this.ensureInitialized();
    
    return this.memoizedSearch(options);
  }
  
  /**
   * Quickly capture a memory
   */
  public async quickCapture(content: string, tags: string[] = []): Promise<MemoryItem> {
    return this.addMemory({
      content,
      type: MemoryType.QUICK_CAPTURE,
      importance: 2, // Medium importance by default
      tags
    });
  }
  
  /**
   * Get quick capture memories
   */
  public async getQuickCaptures(limit: number = 10): Promise<MemoryItem[]> {
    const options: SearchOptions = {
      type: MemoryType.QUICK_CAPTURE,
      limit
    };
    
    return this.searchMemories(options);
  }
  
  /**
   * Add a preference memory
   */
  public async addPreference(key: string, value: string, importance: number = 3): Promise<MemoryItem> {
    return this.addMemory({
      content: JSON.stringify({ key, value }),
      type: MemoryType.PREFERENCE,
      importance,
      tags: [key]
    });
  }
  
  /**
   * Get a preference value by key
   */
  public async getPreference(key: string): Promise<string | null> {
    const options: SearchOptions = {
      type: MemoryType.PREFERENCE,
      tags: [key],
      limit: 1
    };
    
    const results = await this.searchMemories(options);
    
    if (results.length === 0) {
      return null;
    }
    
    try {
      const { value } = JSON.parse(results[0].content);
      return value;
    } catch (error) {
      console.error('Failed to parse preference:', error);
      return null;
    }
  }
  
  /**
   * Clear all memories of a specific type
   */
  public async clearMemoriesByType(type: MemoryType): Promise<void> {
    await this.ensureInitialized();
    
    this.memoryCache.set(type, []);
    this.debouncedSave(type, []);
  }
  
  /**
   * Clear all memories of all types
   */
  public async clearAllMemories(): Promise<void> {
    await this.ensureInitialized();
    
    for (const type of Object.values(MemoryType)) {
      await this.clearMemoriesByType(type);
    }
  }
  
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }
  
  /**
   * Format a memory item for display
   */
  public formatMemoryForDisplay(memory: MemoryItem): {
    formattedDate: string;
    title: string;
    subtitle: string;
  } {
    const formattedDate = formatDate(memory.timestamp);
    let title = '';
    let subtitle = '';
    
    switch (memory.type) {
      case MemoryType.QUICK_CAPTURE:
        title = memory.content;
        subtitle = `Quick capture • ${memory.tags.join(', ')}`;
        break;
      case MemoryType.PERSON:
        try {
          const personData = JSON.parse(memory.content);
          title = personData.name || 'Unnamed person';
          subtitle = personData.relationship || '';
        } catch {
          title = memory.content;
          subtitle = 'Person';
        }
        break;
      case MemoryType.PREFERENCE:
        try {
          const { key, value } = JSON.parse(memory.content);
          title = key;
          subtitle = value;
        } catch {
          title = memory.content;
          subtitle = 'Preference';
        }
        break;
      default:
        title = memory.content;
        subtitle = memory.type;
    }
    
    return { formattedDate, title, subtitle };
  }
  
  /**
   * Clear all memories and reset the manager (for testing)
   */
  /**
   * Clear all memories and reset the manager (for testing)
   */
  public async clearAll(): Promise<void> {
    this.memoryCache.clear();
    
    // Clear AsyncStorage
    const keys = ['memories_TASK', 'memories_QUICK_CAPTURE', 'memories_EMOTION', 'memories_PREFERENCE'];
    for (const key of keys) {
      await AsyncStorage.removeItem(key);
    }
  }
}

export default MemoryManager;

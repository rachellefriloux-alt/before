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
import { MemoryItem, MemoryType, SearchOptions, PersonData, TaskData, EmotionData, MemoryPriority } from '../types/MemoryTypes';
import MemoryAnalytics from './MemoryAnalytics';
import LocalEncryptedStorage from './LocalEncryptedStorage';

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
  private localStorage: LocalEncryptedStorage | null = null;
  private isLocalOnly: boolean = false;
  
  private constructor() {
    this.memoryCache = new Map();
    this.encryptionEnabled = true; // Default to true
    this.cacheTtl = 15 * 60 * 1000; // 15 minutes default
    this.initialized = false;
    
    // Check if we're in local-only mode
    this.isLocalOnly = this.checkLocalOnlyMode();
    
    if (this.isLocalOnly) {
      this.initializeLocalStorage();
    }
    
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
    const startTime = Date.now();
    await this.ensureInitialized();
    
    const newMemory: MemoryItem = {
      ...memory,
      id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: Date.now()
    };
    
    const memories = await this.loadMemoriesIntoCache(newMemory.type);
    memories.push(newMemory);
    
    // Sort by timestamp, newest first
    memories.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    
    // Debounced save to avoid frequent writes
    this.debouncedSave(newMemory.type, memories);
    
    // Track analytics
    MemoryAnalytics.getInstance().trackOperation('add_memory', Date.now() - startTime);
    
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
        if (options.fromDate && memory.timestamp && memory.timestamp < options.fromDate) {
          return false;
        }
        if (options.toDate && memory.timestamp && memory.timestamp > options.toDate) {
          return false;
        }
        
        // Filter by importance if specified (return items with importance >= specified value)
        if (options.importance !== undefined && memory.importance && memory.importance < options.importance) {
          return false;
        }
        
        // Filter by tags if specified
        if (options.tags && options.tags.length > 0) {
          if (!options.tags.some((tag: string) => memory.tags?.includes(tag))) {
            return false;
          }
        }
        
        // Enhanced content search with fuzzy matching
        if (options.contentKeywords && options.contentKeywords.length > 0) {
          const content = memory.content.toLowerCase();
          const hasMatch = options.contentKeywords.some((keyword: string) => {
            if (options.fuzzySearch) {
              // Simple fuzzy search - check if all characters of keyword appear in order
              return this.fuzzyMatch(content, keyword.toLowerCase());
            } else {
              return content.includes(keyword.toLowerCase());
            }
          });
          if (!hasMatch) return false;
        }
        
        // Semantic search (basic implementation)
        if (options.semanticQuery) {
          if (!this.semanticMatch(memory, options.semanticQuery)) {
            return false;
          }
        }
        
        // Enhanced context filters
        if (options.contextFilters) {
          if (options.contextFilters.location && 
              memory.context?.location !== options.contextFilters.location) {
            return false;
          }
          
          if (options.contextFilters.activity && 
              memory.context?.activity !== options.contextFilters.activity) {
            return false;
          }
          
          if (options.contextFilters.emotion && 
              memory.context?.emotion !== options.contextFilters.emotion) {
            return false;
          }
          
          if (options.contextFilters.associatedPersons && 
              options.contextFilters.associatedPersons.length > 0) {
            const memoryPersons = memory.context?.associatedPersons || [];
            if (!options.contextFilters.associatedPersons.some((p: string) => memoryPersons.includes(p))) {
              return false;
            }
          }
        }
        
        return true;
      });
      
      allMatches = [...allMatches, ...matches];
    }
    
    // Enhanced sorting
    if (options.sortBy) {
      allMatches.sort((a, b) => {
        let comparison = 0;
        
        switch (options.sortBy) {
          case 'timestamp':
            comparison = (a.timestamp || 0) - (b.timestamp || 0);
            break;
          case 'importance':
            comparison = (a.importance || 0) - (b.importance || 0);
            break;
          case 'relevance':
            // Basic relevance scoring based on recency and importance
            comparison = ((b.importance || 0) * 0.6 + ((b.timestamp || 0) / Date.now()) * 0.4) -
                        ((a.importance || 0) * 0.6 + ((a.timestamp || 0) / Date.now()) * 0.4);
            break;
        }
        
        return options.sortOrder === 'asc' ? comparison : -comparison;
      });
    } else {
      // Default sort by timestamp, newest first
      allMatches.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    }
    
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
    const startTime = Date.now();
    await this.ensureInitialized();
    
    const results = await this.memoizedSearch(options);
    
    // Track analytics
    MemoryAnalytics.getInstance().trackSearch(
      options.contentKeywords?.join(' ') || options.semanticQuery || 'no-query',
      results.length,
      Date.now() - startTime
    );
    
    return results;
  }
  
  /**
   * Quickly capture a memory
   */
  public async quickCapture(content: string, tags: string[] = []): Promise<MemoryItem> {
    return this.addMemory({
      content,
      type: MemoryType.QUICK_CAPTURE,
      createdAt: new Date().toISOString(),
      priority: MemoryPriority.MEDIUM,
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
  public async addPreference(key: string, value: string, priority: MemoryPriority = MemoryPriority.MEDIUM): Promise<MemoryItem> {
    return this.addMemory({
      content: JSON.stringify({ key, value }),
      type: MemoryType.PREFERENCE,
      createdAt: new Date().toISOString(),
      priority,
      tags: [key]
    });
  }
  
  /**
   * Add a person memory
   */
  public async addPerson(personData: PersonData, tags: string[] = []): Promise<MemoryItem> {
    return this.addMemory({
      content: `Person: ${personData.name}`,
      type: MemoryType.PERSON,
      createdAt: new Date().toISOString(),
      priority: MemoryPriority.HIGH,
      tags,
      personData
    });
  }

  /**
   * Add a task memory
   */
  public async addTask(taskData: TaskData, tags: string[] = []): Promise<MemoryItem> {
    const memoryPriority = taskData.priority === 'urgent' ? MemoryPriority.HIGH :
                          taskData.priority === 'high' ? MemoryPriority.HIGH :
                          taskData.priority === 'medium' ? MemoryPriority.MEDIUM : MemoryPriority.LOW;

    return this.addMemory({
      content: `Task: ${taskData.title}`,
      type: MemoryType.TASK,
      createdAt: new Date().toISOString(),
      priority: memoryPriority,
      tags,
      taskData
    });
  }

  /**
   * Add an emotion memory
   */
  public async addEmotion(emotionData: EmotionData, tags: string[] = []): Promise<MemoryItem> {
    return this.addMemory({
      content: `Emotion: ${emotionData.emotion} (${emotionData.intensity}/10)`,
      type: MemoryType.EMOTION,
      createdAt: new Date().toISOString(),
      priority: emotionData.intensity > 7 ? MemoryPriority.HIGH : MemoryPriority.MEDIUM,
      tags,
      emotionData
    });
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
    const formattedDate = formatDate(memory.timestamp || Date.now());
    let title = '';
    let subtitle = '';
    
    switch (memory.type) {
      case MemoryType.QUICK_CAPTURE:
        title = memory.content;
        subtitle = `Quick capture • ${memory.tags?.join(', ') || 'No tags'}`;
        break;
      case MemoryType.PERSON:
        if (memory.personData) {
          title = memory.personData.name;
          subtitle = `${memory.personData.relationship} • Last interaction: ${memory.personData.lastInteraction || 'Unknown'}`;
        } else {
          // Fallback for legacy format
          try {
            const personData = JSON.parse(memory.content);
            title = personData.name || 'Unnamed person';
            subtitle = personData.relationship || '';
          } catch {
            title = memory.content;
            subtitle = 'Person';
          }
        }
        break;
      case MemoryType.TASK:
        if (memory.taskData) {
          title = memory.taskData.title;
          subtitle = `${memory.taskData.status} • Due: ${memory.taskData.dueDate || 'No due date'} • Priority: ${memory.taskData.priority}`;
        } else {
          title = memory.content;
          subtitle = 'Task';
        }
        break;
      case MemoryType.EMOTION:
        if (memory.emotionData) {
          title = `${memory.emotionData.emotion} (${memory.emotionData.intensity}/10)`;
          subtitle = `Trigger: ${memory.emotionData.trigger || 'Unknown'} • Duration: ${memory.emotionData.duration || 0} min`;
        } else {
          title = memory.content;
          subtitle = 'Emotion';
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
      case MemoryType.FACT:
        title = memory.content;
        subtitle = `Fact • ${memory.tags?.join(', ') || 'No tags'}`;
        break;
      default:
        title = memory.content;
        subtitle = memory.type;
    }
    
    return { formattedDate, title, subtitle };
  }
  
  /**
   * Simple fuzzy string matching
   */
  private fuzzyMatch(text: string, pattern: string): boolean {
    let patternIndex = 0;
    for (let i = 0; i < text.length && patternIndex < pattern.length; i++) {
      if (text[i] === pattern[patternIndex]) {
        patternIndex++;
      }
    }
    return patternIndex === pattern.length;
  }

  /**
   * Basic semantic matching for memory content
   */
  private semanticMatch(memory: MemoryItem, query: string): boolean {
    const queryWords = query.toLowerCase().split(' ');
    const content = memory.content.toLowerCase();
    
    // Check for semantic relationships
    const semanticMatches = queryWords.some((word: string) => {
      // Direct word match
      if (content.includes(word)) return true;
      
      // Check tags for semantic matches
      if (memory.tags?.some((tag: string) => tag.toLowerCase().includes(word))) return true;
      
      // Check person data
      if (memory.personData) {
        if (memory.personData.name.toLowerCase().includes(word) ||
            memory.personData.relationship.toLowerCase().includes(word)) {
          return true;
        }
      }
      
      // Check task data
      if (memory.taskData) {
        if (memory.taskData.title.toLowerCase().includes(word) ||
            memory.taskData.description?.toLowerCase().includes(word)) {
          return true;
        }
      }
      
      return false;
    });
    
    return semanticMatches;
  }
  
  /**
   * Advanced search with fuzzy matching
   */
  public async fuzzySearch(query: string, options: Partial<SearchOptions> = {}): Promise<MemoryItem[]> {
    return this.searchMemories({
      ...options,
      contentKeywords: [query],
      fuzzySearch: true
    });
  }

  /**
   * Semantic search for related memories
   */
  public async semanticSearch(query: string, options: Partial<SearchOptions> = {}): Promise<MemoryItem[]> {
    return this.searchMemories({
      ...options,
      semanticQuery: query
    });
  }

  /**
   * Check if we're running in local-only mode
   */
  private checkLocalOnlyMode(): boolean {
    // Check for React Native build config
    if (typeof global !== 'undefined' && (global as any).__DEV__ !== undefined) {
      // In development, check for environment variable
      return process.env.EXPO_PUBLIC_LOCAL_ONLY === 'true';
    }
    
    // For production builds, this would be set by the build.gradle
    // For now, default to false in web/development
    return false;
  }

  /**
   * Initialize local encrypted storage
   */
  private async initializeLocalStorage(): Promise<void> {
    try {
      this.localStorage = new LocalEncryptedStorage({
        databaseName: 'sallie_memories.db',
        encryptionKey: 'sallie_local_encryption_key_2024', // In production, this should be dynamically generated
        tableName: 'memories'
      });
      
      await this.localStorage.initialize();
    } catch (error) {
      console.error('Failed to initialize local storage:', error);
      // Fallback to AsyncStorage if local storage fails
      this.isLocalOnly = false;
    }
  }

  /**
   * Clear all memories (for testing purposes)
   */
  public async clearAll(): Promise<void> {
    await this.ensureInitialized();
    
    // Clear all memory types
    for (const type of Object.values(MemoryType)) {
      this.memoryCache.set(type, []);
      const storageKey = this.getStorageKeyForType(type);
      await AsyncStorage.removeItem(storageKey);
    }
    
    // Clear local storage if in local-only mode
    if (this.isLocalOnly && this.localStorage) {
      await this.localStorage.clearAll();
    }
  }

  /**
   * Get a preference value
   */
  public async getPreference(key: string): Promise<any> {
    const preferences = await this.searchMemories({
      type: MemoryType.PREFERENCE,
      contentKeywords: [key]
    });
    
    if (preferences.length > 0) {
      const pref = preferences[0];
      try {
        const parsed = JSON.parse(pref.content);
        return parsed.value;
      } catch {
        return pref.content;
      }
    }
    
    return null;
  }
}

export default MemoryManager;
export { MemoryType };

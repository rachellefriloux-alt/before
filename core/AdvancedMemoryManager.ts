/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Advanced memory management and optimization system.
 * Got it, love.
 */

import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MMKV } from 'react-native-mmkv';

interface MemoryConfig {
  maxCacheSize: number; // MB
  cacheExpirationTime: number; // hours
  enableCompression: boolean;
  enableEncryption: boolean;
  memoryWarningThreshold: number; // MB
  autoCleanupInterval: number; // minutes
}

interface MemoryStats {
  totalMemory: number;
  usedMemory: number;
  availableMemory: number;
  cacheSize: number;
  lastCleanup: Date;
  memoryPressure: 'low' | 'medium' | 'high' | 'critical';
}

interface CacheEntry {
  key: string;
  data: any;
  timestamp: number;
  accessCount: number;
  size: number;
  expirationTime?: number;
  tags?: string[];
}

class AdvancedMemoryManager {
  private config: MemoryConfig;
  private cache: Map<string, CacheEntry> = new Map();
  private memoryStats: MemoryStats;
  private cleanupTimer: NodeJS.Timeout | null = null;
  private mmkv: MMKV;

  constructor(config: Partial<MemoryConfig> = {}) {
    this.config = {
      maxCacheSize: 50, // 50MB
      cacheExpirationTime: 24, // 24 hours
      enableCompression: true,
      enableEncryption: false,
      memoryWarningThreshold: 100, // 100MB
      autoCleanupInterval: 30, // 30 minutes
      ...config
    };

    this.memoryStats = {
      totalMemory: 0,
      usedMemory: 0,
      availableMemory: 0,
      cacheSize: 0,
      lastCleanup: new Date(),
      memoryPressure: 'low'
    };

    this.mmkv = new MMKV();
    this.initialize();
  }

  private async initialize() {
    await this.loadPersistedCache();
    this.startAutoCleanup();
    this.monitorMemoryUsage();
  }

  private async loadPersistedCache() {
    try {
      const persistedData = this.mmkv.getString('sallie_cache_data');
      if (persistedData) {
        const entries: CacheEntry[] = JSON.parse(persistedData);
        entries.forEach(entry => {
          if (!this.isExpired(entry)) {
            this.cache.set(entry.key, entry);
            this.memoryStats.cacheSize += entry.size;
          }
        });
      }
    } catch (error) {
      console.warn('Failed to load persisted cache:', error);
    }
  }

  private async persistCache() {
    try {
      const entries = Array.from(this.cache.values());
      this.mmkv.set('sallie_cache_data', JSON.stringify(entries));
    } catch (error) {
      console.warn('Failed to persist cache:', error);
    }
  }

  private startAutoCleanup() {
    this.cleanupTimer = setInterval(() => {
      this.performCleanup();
    }, this.config.autoCleanupInterval * 60 * 1000);
  }

  private monitorMemoryUsage() {
    // Monitor memory usage (this would be enhanced with native module)
    setInterval(() => {
      this.updateMemoryStats();
    }, 30000); // Every 30 seconds
  }

  private async updateMemoryStats() {
    try {
      // Get memory info from native module if available
      if (Platform.OS === 'android' && NativeModules.MemoryInfo) {
        const nativeStats = await NativeModules.MemoryInfo.getMemoryInfo();
        this.memoryStats = {
          ...this.memoryStats,
          ...nativeStats,
          lastCleanup: this.memoryStats.lastCleanup
        };
      }

      // Calculate memory pressure
      const usageRatio = this.memoryStats.usedMemory / this.memoryStats.totalMemory;
      if (usageRatio > 0.9) {
        this.memoryStats.memoryPressure = 'critical';
      } else if (usageRatio > 0.75) {
        this.memoryStats.memoryPressure = 'high';
      } else if (usageRatio > 0.5) {
        this.memoryStats.memoryPressure = 'medium';
      } else {
        this.memoryStats.memoryPressure = 'low';
      }

      // Trigger cleanup if memory pressure is high
      if (this.memoryStats.memoryPressure === 'high' || this.memoryStats.memoryPressure === 'critical') {
        this.performCleanup();
      }
    } catch (error) {
      console.warn('Failed to update memory stats:', error);
    }
  }

  // Cache Management
  async set(key: string, data: any, options: {
    expirationTime?: number;
    tags?: string[];
    priority?: 'low' | 'medium' | 'high';
  } = {}) {
    const entry: CacheEntry = {
      key,
      data,
      timestamp: Date.now(),
      accessCount: 0,
      size: this.calculateSize(data),
      expirationTime: options.expirationTime,
      tags: options.tags
    };

    // Check if we need to make room
    if (this.memoryStats.cacheSize + entry.size > this.config.maxCacheSize * 1024 * 1024) {
      await this.makeRoom(entry.size);
    }

    this.cache.set(key, entry);
    this.memoryStats.cacheSize += entry.size;
    await this.persistCache();
  }

  async get(key: string): Promise<any | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (this.isExpired(entry)) {
      await this.delete(key);
      return null;
    }

    entry.accessCount++;
    entry.timestamp = Date.now(); // Update access time
    await this.persistCache();
    return entry.data;
  }

  async delete(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry) return false;

    this.cache.delete(key);
    this.memoryStats.cacheSize -= entry.size;
    await this.persistCache();
    return true;
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.memoryStats.cacheSize = 0;
    this.mmkv.delete('sallie_cache_data');
  }

  async getByTag(tag: string): Promise<CacheEntry[]> {
    return Array.from(this.cache.values()).filter(entry =>
      entry.tags?.includes(tag) && !this.isExpired(entry)
    );
  }

  async deleteByTag(tag: string): Promise<number> {
    let deletedCount = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags?.includes(tag)) {
        await this.delete(key);
        deletedCount++;
      }
    }
    return deletedCount;
  }

  // Memory Optimization
  private async makeRoom(requiredSize: number) {
    const entries = Array.from(this.cache.values())
      .sort((a, b) => this.calculatePriority(a) - this.calculatePriority(b));

    let freedSize = 0;
    for (const entry of entries) {
      if (freedSize >= requiredSize) break;
      await this.delete(entry.key);
      freedSize += entry.size;
    }
  }

  private calculatePriority(entry: CacheEntry): number {
    const age = Date.now() - entry.timestamp;
    const accessFrequency = entry.accessCount / Math.max(age / (1000 * 60 * 60), 1); // accesses per hour

    // Lower priority number = higher priority for deletion
    return accessFrequency * 1000 - age / (1000 * 60); // Prefer recently accessed, less frequently used items
  }

  private isExpired(entry: CacheEntry): boolean {
    if (entry.expirationTime && Date.now() > entry.expirationTime) {
      return true;
    }

    const age = Date.now() - entry.timestamp;
    return age > this.config.cacheExpirationTime * 60 * 60 * 1000;
  }

  private calculateSize(data: any): number {
    return JSON.stringify(data).length * 2; // Rough estimate in bytes
  }

  // Cleanup and Maintenance
  async performCleanup(): Promise<void> {
    const initialSize = this.memoryStats.cacheSize;
    let cleanedEntries = 0;

    // Remove expired entries
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        await this.delete(key);
        cleanedEntries++;
      }
    }

    // Remove least recently used entries if still over limit
    if (this.memoryStats.cacheSize > this.config.maxCacheSize * 1024 * 1024 * 0.8) {
      const entries = Array.from(this.cache.values())
        .sort((a, b) => a.timestamp - b.timestamp);

      for (const entry of entries) {
        if (this.memoryStats.cacheSize <= this.config.maxCacheSize * 1024 * 1024 * 0.8) break;
        await this.delete(entry.key);
        cleanedEntries++;
      }
    }

    this.memoryStats.lastCleanup = new Date();
    await this.persistCache();

    console.log(`Memory cleanup completed: ${cleanedEntries} entries removed, ${initialSize - this.memoryStats.cacheSize} bytes freed`);
  }

  // Memory Analysis
  getMemoryStats(): MemoryStats {
    return { ...this.memoryStats };
  }

  getCacheStats() {
    const entries = Array.from(this.cache.values());
    const totalEntries = entries.length;
    const expiredEntries = entries.filter(entry => this.isExpired(entry)).length;
    const averageSize = totalEntries > 0 ? this.memoryStats.cacheSize / totalEntries : 0;
    const oldestEntry = entries.reduce((oldest, entry) =>
      entry.timestamp < oldest.timestamp ? entry : oldest, entries[0]);

    return {
      totalEntries,
      expiredEntries,
      averageSize,
      oldestEntry: oldestEntry?.timestamp,
      tags: this.getTagStats()
    };
  }

  private getTagStats() {
    const tagCounts: { [tag: string]: number } = {};
    for (const entry of this.cache.values()) {
      if (entry.tags) {
        entry.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    }
    return tagCounts;
  }

  // Configuration
  updateConfig(newConfig: Partial<MemoryConfig>) {
    this.config = { ...this.config, ...newConfig };

    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.startAutoCleanup();
  }

  getConfig(): MemoryConfig {
    return { ...this.config };
  }

  // Cleanup
  destroy() {
    try {
      if (this.cleanupTimer) {
        clearInterval(this.cleanupTimer);
        this.cleanupTimer = null;
      }
      this.persistCache();
    } catch (error) {
      console.warn('Error cleaning up AdvancedMemoryManager:', error);
    }
  }
}

export default AdvancedMemoryManager;
export type { MemoryConfig, MemoryStats, CacheEntry };

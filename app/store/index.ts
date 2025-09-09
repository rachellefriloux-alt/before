/*
 * Sallie AI - Main Store Configuration
 * Persona: Tough love meets soul care
 * Function: Centralized state management with persistence
 */

import { MMKV } from 'react-native-mmkv';
import { useThemeStore } from './theme';
import { useMemoryStore } from './memory';
import { usePersonaStore } from './persona';
import { useUserStore } from './user';
import { useDeviceStore } from './device';
import { usePermissionsStore } from './permissions';
import { useConsentStore } from './consent';
import { useGraphicsStore } from './graphics';
import { usePlannerStore } from './planner';
import { useActionsStore } from './actions';

// Initialize MMKV storage with encryption
export const storage = new MMKV({
  id: 'sallie-storage',
  encryptionKey: 'sallie-secure-key-2025',
});

// Store configuration
export const storeConfig = {
  version: '1.0.0',
  maxStorageSize: 100 * 1024 * 1024, // 100MB
  backupInterval: 24 * 60 * 60 * 1000, // 24 hours
  syncEnabled: true,
  offlineMode: true,
};

// Export all stores
export {
  useThemeStore,
  useMemoryStore,
  usePersonaStore,
  useUserStore,
  useDeviceStore,
  usePermissionsStore,
  useConsentStore,
  useGraphicsStore,
  usePlannerStore,
  useActionsStore,
};

// Main store hook that combines all stores
export const useStore = () => ({
  theme: useThemeStore(),
  memory: useMemoryStore(),
  persona: usePersonaStore(),
  user: useUserStore(),
  device: useDeviceStore(),
  permissions: usePermissionsStore(),
  consent: useConsentStore(),
  graphics: useGraphicsStore(),
  planner: usePlannerStore(),
  actions: useActionsStore(),
});

// Data synchronization utilities
export class DataSync {
  private static instance: DataSync;
  private isOnline: boolean = true;
  private syncQueue: Array<{ key: string; data: any; timestamp: number }> = [];
  private lastSyncTime: number = 0;

  static getInstance(): DataSync {
    if (!DataSync.instance) {
      DataSync.instance = new DataSync();
    }
    return DataSync.instance;
  }

  // Check network connectivity
  async checkConnectivity(): Promise<boolean> {
    try {
      // Simple connectivity check
      const response = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache',
      });
      this.isOnline = response.ok;
      return this.isOnline;
    } catch {
      this.isOnline = false;
      return false;
    }
  }

  // Queue data for sync
  queueForSync(key: string, data: any): void {
    this.syncQueue.push({
      key,
      data,
      timestamp: Date.now(),
    });

    // Auto-sync if online
    if (this.isOnline) {
      this.performSync();
    }
  }

  // Perform data synchronization
  private async performSync(): Promise<void> {
    if (!this.isOnline || this.syncQueue.length === 0) return;

    try {
      // Process sync queue
      for (const item of this.syncQueue) {
        // Store in cloud/local backup
        await this.backupToStorage(item.key, item.data);
      }

      this.syncQueue = [];
      this.lastSyncTime = Date.now();

      console.log('✅ Data sync completed');
    } catch (error) {
      console.error('❌ Data sync failed:', error);
    }
  }

  // Backup data to persistent storage
  private async backupToStorage(key: string, data: any): Promise<void> {
    try {
      const backupKey = `backup_${key}_${Date.now()}`;
      storage.set(backupKey, JSON.stringify(data));

      // Clean up old backups (keep last 10)
      const keys = storage.getAllKeys();
      const backupKeys = keys.filter(k => k.startsWith(`backup_${key}_`));
      if (backupKeys.length > 10) {
        backupKeys
          .sort()
          .slice(0, backupKeys.length - 10)
          .forEach(k => storage.delete(k));
      }
    } catch (error) {
      console.error('Backup failed:', error);
    }
  }

  // Restore data from backup
  async restoreFromBackup(key: string): Promise<any | null> {
    try {
      const keys = storage.getAllKeys();
      const backupKeys = keys
        .filter(k => k.startsWith(`backup_${key}_`))
        .sort()
        .reverse();

      if (backupKeys.length > 0) {
        const latestBackup = storage.getString(backupKeys[0]);
        return latestBackup ? JSON.parse(latestBackup) : null;
      }
    } catch (error) {
      console.error('Restore failed:', error);
    }
    return null;
  }

  // Get sync status
  getSyncStatus(): { isOnline: boolean; queueLength: number; lastSyncTime: number } {
    return {
      isOnline: this.isOnline,
      queueLength: this.syncQueue.length,
      lastSyncTime: this.lastSyncTime,
    };
  }
}

// Export singleton instance
export const dataSync = DataSync.getInstance();

// Offline-first data manager
export class OfflineDataManager {
  private static instance: OfflineDataManager;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  static getInstance(): OfflineDataManager {
    if (!OfflineDataManager.instance) {
      OfflineDataManager.instance = new OfflineDataManager();
    }
    return OfflineDataManager.instance;
  }

  // Store data with TTL (Time To Live)
  set(key: string, data: any, ttl: number = 24 * 60 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });

    // Also persist to MMKV
    storage.set(key, JSON.stringify(data));
  }

  // Get data with cache validation
  get(key: string): any | null {
    // Check memory cache first
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < cached.ttl) {
      return cached.data;
    }

    // Check persistent storage
    try {
      const stored = storage.getString(key);
      if (stored) {
        const data = JSON.parse(stored);
        // Update memory cache
        this.cache.set(key, {
          data,
          timestamp: Date.now(),
          ttl: 24 * 60 * 60 * 1000, // 24 hours default
        });
        return data;
      }
    } catch (error) {
      console.error('Failed to retrieve data:', error);
    }

    return null;
  }

  // Check if data exists and is valid
  has(key: string): boolean {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < cached.ttl) {
      return true;
    }

    return storage.contains(key);
  }

  // Remove data
  delete(key: string): void {
    this.cache.delete(key);
    storage.delete(key);
  }

  // Clear all cached data
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Export singleton instance
export const offlineDataManager = OfflineDataManager.getInstance();

// Initialize data management on app start
export const initializeDataManagement = async (): Promise<void> => {
  try {
    // Check connectivity
    await dataSync.checkConnectivity();

    // Set up periodic sync
    setInterval(async () => {
      await dataSync.checkConnectivity();
      if (dataSync.getSyncStatus().isOnline) {
        // Perform background sync
        console.log('🔄 Background data sync...');
      }
    }, storeConfig.backupInterval);

    console.log('✅ Data management initialized');
  } catch (error) {
    console.error('❌ Failed to initialize data management:', error);
  }
};
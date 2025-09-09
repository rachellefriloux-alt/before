/**
 * ╭──────────────────────────────────────────────────────────────────────────────╮
 * │                                                                              │
 * │   Sallie - Database Integration System                                       │
 * │                                                                              │
 * │   Robust database solutions for data persistence and synchronization         │
 * │                                                                              │
 * ╰──────────────────────────────────────────────────────────────────────────────╯
 */

// Database Integration System for Sallie
// Provides comprehensive database solutions with synchronization and offline support

import { EventEmitter } from 'events';

export interface DatabaseConfig {
  name: string;
  version: number;
  stores: DatabaseStore[];
  migrationPath?: string;
}

export interface DatabaseStore {
  name: string;
  keyPath: string;
  indexes: DatabaseIndex[];
  autoIncrement?: boolean;
}

export interface DatabaseIndex {
  name: string;
  keyPath: string | string[];
  unique?: boolean;
  multiEntry?: boolean;
}

export interface DatabaseRecord {
  id: string;
  data: any;
  timestamp: Date;
  version: number;
  deleted?: boolean;
  synced?: boolean;
}

export interface SyncConfig {
  endpoint: string;
  authToken?: string;
  batchSize: number;
  retryAttempts: number;
  syncInterval: number;
  conflictResolution: 'client-wins' | 'server-wins' | 'manual';
}

export interface SyncResult {
  success: boolean;
  syncedRecords: number;
  conflicts: SyncConflict[];
  errors: string[];
  timestamp: Date;
}

export interface SyncConflict {
  recordId: string;
  localVersion: DatabaseRecord;
  remoteVersion: DatabaseRecord;
  resolution?: 'local' | 'remote' | 'merge';
}

export interface OfflineQueue {
  id: string;
  operation: 'create' | 'update' | 'delete';
  store: string;
  record: DatabaseRecord;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
}

export interface MigrationScript {
  version: number;
  description: string;
  up: (db: IDBDatabase) => Promise<void>;
  down?: (db: IDBDatabase) => Promise<void>;
}

/**
 * Database Abstraction Layer
 */
export class DatabaseAbstractionLayer extends EventEmitter {
  private db: IDBDatabase | null = null;
  private config: DatabaseConfig;
  private isInitialized: boolean = false;

  constructor(config: DatabaseConfig) {
    super();
    this.config = config;
  }

  /**
   * Initialize database
   */
  public async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.name, this.config.version);

      request.onerror = () => {
        reject(new Error(`Failed to open database: ${request.error?.message}`));
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        this.emit('initialized', this.config.name);
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.upgradeDatabase(db, event.oldVersion, event.newVersion || this.config.version);
      };
    });
  }

  /**
   * Create record
   */
  public async create(storeName: string, record: DatabaseRecord): Promise<string> {
    this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      const request = store.add(record);

      request.onsuccess = () => {
        this.emit('record-created', { store: storeName, id: record.id });
        resolve(record.id);
      };

      request.onerror = () => {
        reject(new Error(`Failed to create record: ${request.error?.message}`));
      };
    });
  }

  /**
   * Read record
   */
  public async read(storeName: string, id: string): Promise<DatabaseRecord | null> {
    this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);

      const request = store.get(id);

      request.onsuccess = () => {
        const record = request.result;
        if (record && !record.deleted) {
          resolve(record);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        reject(new Error(`Failed to read record: ${request.error?.message}`));
      };
    });
  }

  /**
   * Update record
   */
  public async update(storeName: string, record: DatabaseRecord): Promise<void> {
    this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      // Increment version
      record.version = (record.version || 0) + 1;
      record.timestamp = new Date();

      const request = store.put(record);

      request.onsuccess = () => {
        this.emit('record-updated', { store: storeName, id: record.id });
        resolve();
      };

      request.onerror = () => {
        reject(new Error(`Failed to update record: ${request.error?.message}`));
      };
    });
  }

  /**
   * Delete record
   */
  public async delete(storeName: string, id: string): Promise<void> {
    this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      // Soft delete - mark as deleted
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const record = getRequest.result;
        if (record) {
          record.deleted = true;
          record.timestamp = new Date();
          record.version = (record.version || 0) + 1;

          const putRequest = store.put(record);
          putRequest.onsuccess = () => {
            this.emit('record-deleted', { store: storeName, id });
            resolve();
          };
          putRequest.onerror = () => {
            reject(new Error(`Failed to delete record: ${putRequest.error?.message}`));
          };
        } else {
          resolve(); // Record doesn't exist
        }
      };

      getRequest.onerror = () => {
        reject(new Error(`Failed to delete record: ${getRequest.error?.message}`));
      };
    });
  }

  /**
   * Query records
   */
  public async query(
    storeName: string,
    query?: {
      index?: string;
      range?: IDBKeyRange;
      limit?: number;
      offset?: number;
      filter?: (record: DatabaseRecord) => boolean;
    }
  ): Promise<DatabaseRecord[]> {
    this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);

      let request: IDBRequest;

      if (query?.index) {
        const index = store.index(query.index);
        request = index.openCursor(query.range);
      } else {
        request = store.openCursor(query?.range);
      }

      const results: DatabaseRecord[] = [];
      let count = 0;
      const offset = query?.offset || 0;
      const limit = query?.limit || Infinity;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor && count < (offset + limit)) {
          const record = cursor.value;

          if (!record.deleted && (!query?.filter || query.filter(record))) {
            if (count >= offset) {
              results.push(record);
            }
            count++;
          }

          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => {
        reject(new Error(`Failed to query records: ${request.error?.message}`));
      };
    });
  }

  /**
   * Get database statistics
   */
  public async getStats(): Promise<{
    stores: Record<string, { count: number; size: number }>;
    totalSize: number;
  }> {
    this.ensureInitialized();

    const stats: Record<string, { count: number; size: number }> = {};
    let totalSize = 0;

    for (const store of this.config.stores) {
      const records = await this.query(store.name);
      const size = records.reduce((sum, record) =>
        sum + JSON.stringify(record).length, 0
      );

      stats[store.name] = { count: records.length, size };
      totalSize += size;
    }

    return { stores: stats, totalSize };
  }

  /**
   * Close database
   */
  public close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.isInitialized = false;
      this.emit('closed');
    }
  }

  private ensureInitialized(): void {
    if (!this.isInitialized || !this.db) {
      throw new Error('Database not initialized');
    }
  }

  private upgradeDatabase(db: IDBDatabase, oldVersion: number, newVersion: number): void {
    // Create object stores
    for (const store of this.config.stores) {
      if (!db.objectStoreNames.contains(store.name)) {
        const objectStore = db.createObjectStore(store.name, {
          keyPath: store.keyPath,
          autoIncrement: store.autoIncrement
        });

        // Create indexes
        for (const index of store.indexes) {
          objectStore.createIndex(index.name, index.keyPath, {
            unique: index.unique,
            multiEntry: index.multiEntry
          });
        }
      }
    }

    this.emit('upgraded', { oldVersion, newVersion });
  }
}

/**
 * Data Synchronization Manager
 */
export class DataSynchronizationManager extends EventEmitter {
  private db: DatabaseAbstractionLayer;
  private config: SyncConfig;
  private syncTimer: NodeJS.Timeout | null = null;
  private isOnline: boolean = navigator.onLine;

  constructor(db: DatabaseAbstractionLayer, config: SyncConfig) {
    super();
    this.db = db;
    this.config = config;
    this.setupNetworkMonitoring();
  }

  /**
   * Start synchronization
   */
  public startSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    this.syncTimer = setInterval(() => {
      if (this.isOnline) {
        this.performSync();
      }
    }, this.config.syncInterval);

    // Perform initial sync
    if (this.isOnline) {
      this.performSync();
    }

    this.emit('sync-started');
  }

  /**
   * Stop synchronization
   */
  public stopSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
    this.emit('sync-stopped');
  }

  /**
   * Perform manual sync
   */
  public async performSync(): Promise<SyncResult> {
    try {
      const result: SyncResult = {
        success: false,
        syncedRecords: 0,
        conflicts: [],
        errors: [],
        timestamp: new Date()
      };

      // Get unsynced records
      const unsyncedRecords = await this.getUnsyncedRecords();

      if (unsyncedRecords.length === 0) {
        result.success = true;
        return result;
      }

      // Send to server
      const response = await this.sendToServer(unsyncedRecords);

      if (response.success) {
        // Update local records as synced
        await this.markRecordsAsSynced(unsyncedRecords);
        result.syncedRecords = unsyncedRecords.length;
        result.success = true;
      } else {
        result.errors = response.errors || ['Sync failed'];
      }

      // Check for conflicts
      if (response.conflicts) {
        result.conflicts = response.conflicts;
        await this.handleConflicts(result.conflicts);
      }

      this.emit('sync-completed', result);
      return result;
    } catch (error) {
      const result: SyncResult = {
        success: false,
        syncedRecords: 0,
        conflicts: [],
        errors: [error instanceof Error ? error.message : 'Unknown sync error'],
        timestamp: new Date()
      };

      this.emit('sync-error', result);
      return result;
    }
  }

  /**
   * Resolve sync conflict
   */
  public async resolveConflict(conflict: SyncConflict, resolution: 'local' | 'remote' | 'merge'): Promise<void> {
    conflict.resolution = resolution;

    switch (resolution) {
      case 'local':
        // Keep local version, mark as synced
        await this.markRecordAsSynced(conflict.localVersion);
        break;
      case 'remote':
        // Update with remote version
        await this.db.update(conflict.localVersion.id.split('_')[0], conflict.remoteVersion);
        break;
      case 'merge':
        // Merge the two versions
        const merged = await this.mergeRecords(conflict.localVersion, conflict.remoteVersion);
        await this.db.update(merged.id.split('_')[0], merged);
        break;
    }

    this.emit('conflict-resolved', conflict);
  }

  /**
   * Get sync status
   */
  public async getSyncStatus(): Promise<{
    isOnline: boolean;
    lastSync: Date | null;
    pendingRecords: number;
    conflicts: number;
  }> {
    const pendingRecords = await this.getUnsyncedRecords();
    const conflicts = await this.getSyncConflicts();

    return {
      isOnline: this.isOnline,
      lastSync: null, // Would need to track this
      pendingRecords: pendingRecords.length,
      conflicts: conflicts.length
    };
  }

  private setupNetworkMonitoring(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.emit('network-online');
      // Perform sync when coming back online
      this.performSync();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.emit('network-offline');
    });
  }

  private async getUnsyncedRecords(): Promise<DatabaseRecord[]> {
    const allRecords: DatabaseRecord[] = [];

    // Get unsynced records from all stores
    for (const store of this.db['config'].stores) {
      const records = await this.db.query(store.name, {
        filter: (record) => !record.synced
      });
      allRecords.push(...records);
    }

    return allRecords;
  }

  private async sendToServer(records: DatabaseRecord[]): Promise<{
    success: boolean;
    conflicts?: SyncConflict[];
    errors?: string[];
  }> {
    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.authToken && { 'Authorization': `Bearer ${this.config.authToken}` })
        },
        body: JSON.stringify({ records })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Network error']
      };
    }
  }

  private async markRecordsAsSynced(records: DatabaseRecord[]): Promise<void> {
    for (const record of records) {
      record.synced = true;
      await this.db.update(record.id.split('_')[0], record);
    }
  }

  private async markRecordAsSynced(record: DatabaseRecord): Promise<void> {
    record.synced = true;
    await this.db.update(record.id.split('_')[0], record);
  }

  private async handleConflicts(conflicts: SyncConflict[]): Promise<void> {
    // Auto-resolve conflicts based on configuration
    for (const conflict of conflicts) {
      switch (this.config.conflictResolution) {
        case 'client-wins':
          await this.resolveConflict(conflict, 'local');
          break;
        case 'server-wins':
          await this.resolveConflict(conflict, 'remote');
          break;
        case 'manual':
          // Emit event for manual resolution
          this.emit('conflict-detected', conflict);
          break;
      }
    }
  }

  private async mergeRecords(local: DatabaseRecord, remote: DatabaseRecord): Promise<DatabaseRecord> {
    // Simple merge strategy - remote wins for conflicts
    const merged: DatabaseRecord = {
      ...remote,
      data: { ...local.data, ...remote.data },
      version: Math.max(local.version, remote.version) + 1,
      timestamp: new Date()
    };

    return merged;
  }

  private async getSyncConflicts(): Promise<SyncConflict[]> {
    // In a real implementation, this would track conflicts
    return [];
  }
}

/**
 * Offline Storage Manager
 */
export class OfflineStorageManager extends EventEmitter {
  private db: DatabaseAbstractionLayer;
  private queue: OfflineQueue[] = [];
  private isOnline: boolean = navigator.onLine;
  private maxQueueSize: number = 1000;

  constructor(db: DatabaseAbstractionLayer) {
    super();
    this.db = db;
    this.setupNetworkMonitoring();
    this.loadQueueFromStorage();
  }

  /**
   * Queue operation for offline execution
   */
  public async queueOperation(
    operation: OfflineQueue['operation'],
    store: string,
    record: DatabaseRecord
  ): Promise<void> {
    const queueItem: OfflineQueue = {
      id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      operation,
      store,
      record,
      timestamp: new Date(),
      retryCount: 0,
      maxRetries: 3
    };

    this.queue.push(queueItem);
    await this.saveQueueToStorage();

    // Try to execute immediately if online
    if (this.isOnline) {
      await this.processQueueItem(queueItem);
    }

    this.emit('operation-queued', queueItem);
  }

  /**
   * Process offline queue
   */
  public async processQueue(): Promise<void> {
    if (!this.isOnline || this.queue.length === 0) {
      return;
    }

    const itemsToProcess = [...this.queue];

    for (const item of itemsToProcess) {
      await this.processQueueItem(item);
    }
  }

  /**
   * Get queue status
   */
  public getQueueStatus(): {
    queued: number;
    processing: number;
    failed: number;
  } {
    const queued = this.queue.filter(item => item.retryCount === 0).length;
    const processing = this.queue.filter(item => item.retryCount > 0 && item.retryCount < item.maxRetries).length;
    const failed = this.queue.filter(item => item.retryCount >= item.maxRetries).length;

    return { queued, processing, failed };
  }

  /**
   * Clear failed operations
   */
  public clearFailedOperations(): void {
    this.queue = this.queue.filter(item => item.retryCount < item.maxRetries);
    this.saveQueueToStorage();
    this.emit('failed-operations-cleared');
  }

  /**
   * Check if operation can be performed offline
   */
  public canPerformOffline(operation: string, store: string): boolean {
    // Define which operations can be performed offline
    const offlineOperations = ['create', 'update', 'delete', 'read'];
    const offlineStores = ['user_data', 'preferences', 'cache'];

    return offlineOperations.includes(operation) && offlineStores.includes(store);
  }

  private setupNetworkMonitoring(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.emit('network-online');
      // Process queue when coming back online
      this.processQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.emit('network-offline');
    });
  }

  private async processQueueItem(item: OfflineQueue): Promise<void> {
    try {
      switch (item.operation) {
        case 'create':
          await this.db.create(item.store, item.record);
          break;
        case 'update':
          await this.db.update(item.store, item.record);
          break;
        case 'delete':
          await this.db.delete(item.store, item.record.id);
          break;
      }

      // Remove from queue
      this.queue = this.queue.filter(q => q.id !== item.id);
      await this.saveQueueToStorage();

      this.emit('operation-processed', item);
    } catch (error) {
      item.retryCount++;

      if (item.retryCount >= item.maxRetries) {
        this.emit('operation-failed', { item, error });
      } else {
        // Retry later
        setTimeout(() => this.processQueueItem(item), 5000 * item.retryCount);
      }

      await this.saveQueueToStorage();
    }
  }

  private async saveQueueToStorage(): Promise<void> {
    // Maintain max queue size
    if (this.queue.length > this.maxQueueSize) {
      this.queue = this.queue.slice(-this.maxQueueSize);
    }

    const queueData = JSON.stringify(this.queue);
    localStorage.setItem('offline_queue', queueData);
  }

  private async loadQueueFromStorage(): Promise<void> {
    try {
      const queueData = localStorage.getItem('offline_queue');
      if (queueData) {
        this.queue = JSON.parse(queueData).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
      this.queue = [];
    }
  }
}

/**
 * Data Migration Manager
 */
export class DataMigrationManager extends EventEmitter {
  private db: DatabaseAbstractionLayer;
  private migrations: MigrationScript[] = [];
  private currentVersion: number = 0;

  constructor(db: DatabaseAbstractionLayer) {
    super();
    this.db = db;
  }

  /**
   * Add migration script
   */
  public addMigration(migration: MigrationScript): void {
    this.migrations.push(migration);
    this.migrations.sort((a, b) => a.version - b.version);
  }

  /**
   * Run pending migrations
   */
  public async runMigrations(targetVersion?: number): Promise<void> {
    const target = targetVersion || Math.max(...this.migrations.map(m => m.version));

    if (target <= this.currentVersion) {
      return; // Already up to date
    }

    const pendingMigrations = this.migrations.filter(m => m.version > this.currentVersion && m.version <= target);

    for (const migration of pendingMigrations) {
      try {
        this.emit('migration-starting', migration);

        // Run migration
        await this.runMigration(migration);

        this.currentVersion = migration.version;
        this.emit('migration-completed', migration);

      } catch (error) {
        this.emit('migration-failed', { migration, error });
        throw error;
      }
    }

    this.emit('migrations-completed', { from: this.currentVersion, to: target });
  }

  /**
   * Rollback migration
   */
  public async rollbackMigration(version: number): Promise<void> {
    const migration = this.migrations.find(m => m.version === version);

    if (!migration || !migration.down) {
      throw new Error(`Migration ${version} not found or has no rollback script`);
    }

    if (version > this.currentVersion) {
      throw new Error(`Cannot rollback to version ${version} (current: ${this.currentVersion})`);
    }

    try {
      this.emit('rollback-starting', migration);

      // Access the internal database
      const db = (this.db as any).db;
      await migration.down(db);

      this.currentVersion = version - 1;
      this.emit('rollback-completed', migration);

    } catch (error) {
      this.emit('rollback-failed', { migration, error });
      throw error;
    }
  }

  /**
   * Get migration status
   */
  public getMigrationStatus(): {
    currentVersion: number;
    availableVersions: number[];
    pendingMigrations: number;
  } {
    const availableVersions = this.migrations.map(m => m.version);
    const pendingMigrations = this.migrations.filter(m => m.version > this.currentVersion).length;

    return {
      currentVersion: this.currentVersion,
      availableVersions,
      pendingMigrations
    };
  }

  /**
   * Create backup before migration
   */
  public async createBackup(): Promise<string> {
    const stats = await this.db.getStats();
    const backupId = `backup_${Date.now()}`;

    // In a real implementation, this would create a full database backup
    console.log(`Creating backup ${backupId} with ${stats.totalSize} bytes`);

    this.emit('backup-created', backupId);
    return backupId;
  }

  /**
   * Restore from backup
   */
  public async restoreBackup(backupId: string): Promise<void> {
    // In a real implementation, this would restore from backup
    console.log(`Restoring from backup ${backupId}`);

    this.emit('backup-restored', backupId);
  }

  private async runMigration(migration: MigrationScript): Promise<void> {
    // Access the internal database
    const db = (this.db as any).db;

    if (!db) {
      throw new Error('Database not accessible for migration');
    }

    await migration.up(db);
  }
}

// Default database configuration
export const defaultDatabaseConfig: DatabaseConfig = {
  name: 'SallieAI',
  version: 1,
  stores: [
    {
      name: 'conversations',
      keyPath: 'id',
      indexes: [
        { name: 'timestamp', keyPath: 'timestamp' },
        { name: 'userId', keyPath: 'userId' },
        { name: 'synced', keyPath: 'synced' }
      ]
    },
    {
      name: 'user_data',
      keyPath: 'id',
      indexes: [
        { name: 'userId', keyPath: 'userId' },
        { name: 'type', keyPath: 'type' },
        { name: 'synced', keyPath: 'synced' }
      ]
    },
    {
      name: 'preferences',
      keyPath: 'id',
      indexes: [
        { name: 'userId', keyPath: 'userId' },
        { name: 'category', keyPath: 'category' }
      ]
    },
    {
      name: 'cache',
      keyPath: 'id',
      indexes: [
        { name: 'expires', keyPath: 'expires' },
        { name: 'type', keyPath: 'type' }
      ]
    }
  ]
};

// Export singleton instances
export const databaseLayer = new DatabaseAbstractionLayer(defaultDatabaseConfig);
export const offlineStorageManager = new OfflineStorageManager(databaseLayer);
export const dataMigrationManager = new DataMigrationManager(databaseLayer);

// Create sync manager (requires configuration)
export function createSyncManager(config: SyncConfig): DataSynchronizationManager {
  return new DataSynchronizationManager(databaseLayer, config);
}

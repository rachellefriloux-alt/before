/*
 * Sallie AI Offline Data Synchronization System
 * Handles offline data storage, sync, and conflict resolution
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';
import { EventEmitter } from 'events';

export interface SyncableData {
    id: string;
    type: string;
    data: any;
    timestamp: number;
    version: number;
    synced: boolean;
}

export interface SyncConflict {
    local: SyncableData;
    remote: SyncableData;
    resolution?: 'local' | 'remote' | 'merge';
}

export class OfflineSyncManager extends EventEmitter {
    private static instance: OfflineSyncManager;
    private isOnline: boolean = false;
    private pendingSync: SyncableData[] = [];
    private syncQueue: SyncableData[] = [];
    private conflictResolver?: (conflict: SyncConflict) => Promise<SyncableData>;

    private readonly STORAGE_KEYS = {
        OFFLINE_DATA: 'sallie_offline_data',
        SYNC_QUEUE: 'sallie_sync_queue',
        LAST_SYNC: 'sallie_last_sync',
        CONFLICTS: 'sallie_conflicts'
    };

    static getInstance(): OfflineSyncManager {
        if (!OfflineSyncManager.instance) {
            OfflineSyncManager.instance = new OfflineSyncManager();
        }
        return OfflineSyncManager.instance;
    }

    constructor() {
        super();
        this.initialize();
    }

    private async initialize(): Promise<void> {
        // Set up network listener
        Network.addNetworkStateListener(async (state: any) => {
            const wasOnline = this.isOnline;
            this.isOnline = state.isConnected ?? false;

            if (!wasOnline && this.isOnline) {
                this.handleReconnection();
            } else if (wasOnline && !this.isOnline) {
                this.emit('offline');
            }
        });

        // Load persisted data
        await this.loadPersistedData();

        // Set up periodic sync
        setInterval(() => {
            if (this.isOnline) {
                this.performSync();
            }
        }, 30000); // Sync every 30 seconds when online
    }

    private async loadPersistedData(): Promise<void> {
        try {
            const [offlineData, syncQueue, conflicts] = await Promise.all([
                AsyncStorage.getItem(this.STORAGE_KEYS.OFFLINE_DATA),
                AsyncStorage.getItem(this.STORAGE_KEYS.SYNC_QUEUE),
                AsyncStorage.getItem(this.STORAGE_KEYS.CONFLICTS)
            ]);

            if (offlineData) {
                this.pendingSync = JSON.parse(offlineData);
            }

            if (syncQueue) {
                this.syncQueue = JSON.parse(syncQueue);
            }

            if (conflicts) {
                const conflictList = JSON.parse(conflicts);
                // Handle existing conflicts
                for (const conflict of conflictList) {
                    this.emit('conflict', conflict);
                }
            }
        } catch (error) {
            console.warn('Failed to load persisted offline data:', error);
        }
    }

    async storeOffline(data: SyncableData): Promise<void> {
        try {
            // Add to pending sync
            this.pendingSync.push(data);

            // Persist to storage
            await AsyncStorage.setItem(
                this.STORAGE_KEYS.OFFLINE_DATA,
                JSON.stringify(this.pendingSync)
            );

            this.emit('dataStored', data);
        } catch (error) {
            console.error('Failed to store offline data:', error);
            throw error;
        }
    }

    async getOfflineData(type?: string): Promise<SyncableData[]> {
        if (type) {
            return this.pendingSync.filter(item => item.type === type);
        }
        return [...this.pendingSync];
    }

    async updateOfflineData(id: string, updates: Partial<SyncableData>): Promise<void> {
        const index = this.pendingSync.findIndex(item => item.id === id);
        if (index !== -1) {
            this.pendingSync[index] = { ...this.pendingSync[index], ...updates };
            await AsyncStorage.setItem(
                this.STORAGE_KEYS.OFFLINE_DATA,
                JSON.stringify(this.pendingSync)
            );
            this.emit('dataUpdated', this.pendingSync[index]);
        }
    }

    async deleteOfflineData(id: string): Promise<void> {
        const index = this.pendingSync.findIndex(item => item.id === id);
        if (index !== -1) {
            const deletedItem = this.pendingSync.splice(index, 1)[0];
            await AsyncStorage.setItem(
                this.STORAGE_KEYS.OFFLINE_DATA,
                JSON.stringify(this.pendingSync)
            );
            this.emit('dataDeleted', deletedItem);
        }
    }

    private async handleReconnection(): Promise<void> {
        this.emit('online');
        await this.performSync();
    }

    private async performSync(): Promise<void> {
        if (!this.isOnline || this.pendingSync.length === 0) {
            return;
        }

        try {
            this.emit('syncStarted');

            // Process pending sync items
            const syncResults: { id: string; conflict?: SyncConflict }[] = [];
            const conflicts: SyncConflict[] = [];

            for (const item of this.pendingSync) {
                try {
                    const result = await this.syncItem(item);
                    if (result.conflict) {
                        conflicts.push(result.conflict);
                    } else {
                        syncResults.push(result);
                    }
                } catch (error) {
                    console.warn(`Failed to sync item ${item.id}:`, error);
                    // Keep item in pending sync for retry
                }
            }

            // Update sync queue
            this.syncQueue = this.pendingSync.filter(item =>
                !syncResults.some(result => result.id === item.id)
            );

            // Handle conflicts
            if (conflicts.length > 0) {
                await this.handleConflicts(conflicts);
            }

            // Persist updated state
            await Promise.all([
                AsyncStorage.setItem(this.STORAGE_KEYS.OFFLINE_DATA, JSON.stringify(this.syncQueue)),
                AsyncStorage.setItem(this.STORAGE_KEYS.LAST_SYNC, Date.now().toString())
            ]);

            this.pendingSync = [...this.syncQueue];

            this.emit('syncCompleted', {
                synced: syncResults.length,
                conflicts: conflicts.length,
                remaining: this.syncQueue.length
            });

        } catch (error) {
            console.error('Sync failed:', error);
            this.emit('syncFailed', error);
        }
    }

    private async syncItem(item: SyncableData): Promise<{ id: string; conflict?: SyncConflict }> {
        // This would typically make an API call to sync with server
        // For now, we'll simulate the sync process

        // Simulate potential conflict detection
        const serverVersion = await this.getServerVersion(item.id);

        if (serverVersion && serverVersion.version > item.version) {
            // Conflict detected
            return {
                id: item.id,
                conflict: {
                    local: item,
                    remote: serverVersion
                }
            };
        }

        // No conflict, mark as synced
        item.synced = true;
        item.timestamp = Date.now();

        return { id: item.id };
    }

    private async getServerVersion(id: string): Promise<SyncableData | null> {
        // This would make an actual API call
        // For simulation, return null (no conflict)
        return null;
    }

    private async handleConflicts(conflicts: SyncConflict[]): Promise<void> {
        const resolvedConflicts: SyncableData[] = [];

        for (const conflict of conflicts) {
            try {
                if (this.conflictResolver) {
                    const resolved = await this.conflictResolver(conflict);
                    resolvedConflicts.push(resolved);
                } else {
                    // Default resolution: prefer server version
                    resolvedConflicts.push(conflict.remote);
                }
            } catch (error) {
                console.warn('Failed to resolve conflict:', error);
                // Keep original conflict
                this.emit('unresolvedConflict', conflict);
            }
        }

        // Store unresolved conflicts
        await AsyncStorage.setItem(
            this.STORAGE_KEYS.CONFLICTS,
            JSON.stringify(conflicts.filter(c => !resolvedConflicts.some(r => r.id === c.local.id)))
        );
    }

    setConflictResolver(resolver: (conflict: SyncConflict) => Promise<SyncableData>): void {
        this.conflictResolver = resolver;
    }

    async forceSync(): Promise<void> {
        if (this.isOnline) {
            await this.performSync();
        } else {
            throw new Error('Cannot force sync while offline');
        }
    }

    getSyncStatus(): {
        isOnline: boolean;
        pendingItems: number;
        lastSync?: number;
    } {
        return {
            isOnline: this.isOnline,
            pendingItems: this.pendingSync.length
            // Note: lastSync would need to be stored as instance variable for synchronous access
        };
    }

    async clearOfflineData(): Promise<void> {
        this.pendingSync = [];
        this.syncQueue = [];

        await Promise.all([
            AsyncStorage.removeItem(this.STORAGE_KEYS.OFFLINE_DATA),
            AsyncStorage.removeItem(this.STORAGE_KEYS.SYNC_QUEUE),
            AsyncStorage.removeItem(this.STORAGE_KEYS.CONFLICTS)
        ]);

        this.emit('dataCleared');
    }
}

// Export singleton instance
export const offlineSyncManager = OfflineSyncManager.getInstance();

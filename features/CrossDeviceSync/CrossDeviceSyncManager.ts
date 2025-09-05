/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Cross-device synchronization of user preferences and data.
 * Got it, love.
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Salle 1.0: Define SyncOperation, DeviceInfo, and SyncResult types locally if not exported from CrossDeviceSyncTypes
enum SyncError {
    SYNC_UNAVAILABLE = 'SYNC_UNAVAILABLE',
    PUSH_FAILED = 'PUSH_FAILED',
    PULL_FAILED = 'PULL_FAILED',
    UNKNOWN = 'UNKNOWN'
}

type SyncOperation = {
    operationId: string;
    type: string;
    payload: any;
    timestamp: number;
};

type SyncResult = {
    success: boolean;
    timestamp: number;
    message: string;
    operations?: number;
    error?: SyncError;
};

type DeviceInfo = {
    deviceId: string;
    deviceName: string;
    deviceType: string;
    lastActive: number;
    osVersion: string;
};

type DeviceSession = {
    sessionId: string;
    deviceId: string;
    startTimestamp: number;
    lastActiveTimestamp: number;
};
import { generateUniqueId, encryptData, decryptData } from '../../utils/securityUtils';
import { debounce } from '../../utils/performanceUtils';

class CrossDeviceSyncManager {
    private static instance: CrossDeviceSyncManager;
    private deviceId: string;
    private sessionId: string;
    private syncEnabled: boolean;
    private lastSyncTimestamp: number;
    private syncInProgress: boolean;
    private syncQueue: SyncOperation[];
    private syncListeners: ((result: SyncResult) => void)[];
    private syncInterval: NodeJS.Timeout | null;
    private syncIntervalMs: number;
    
    private constructor() {
        this.deviceId = '';
        this.sessionId = '';
        this.syncEnabled = false;
        this.lastSyncTimestamp = 0;
        this.syncInProgress = false;
        this.syncQueue = [];
        this.syncListeners = [];
        this.syncInterval = null;
        this.syncIntervalMs = 15 * 60 * 1000; // 15 minutes default
        
        // Initialize debounced sync to prevent rapid consecutive syncs
        this.debouncedSync = debounce(this.performSync.bind(this), 5000);
    }
    
    public static getInstance(): CrossDeviceSyncManager {
        if (!CrossDeviceSyncManager.instance) {
            CrossDeviceSyncManager.instance = new CrossDeviceSyncManager();
        }
        return CrossDeviceSyncManager.instance;
    }
    
    public async initialize(): Promise<boolean> {
        try {
            // Load or generate device ID
            this.deviceId = await this.getOrCreateDeviceId();
            
            // Create new session ID for this app launch
            this.sessionId = generateUniqueId();
            
            // Load sync settings
            await this.loadSyncSettings();
            
            // Start sync interval if enabled
            if (this.syncEnabled) {
                this.startSyncInterval();
            }
            
            console.log(`CrossDeviceSyncManager initialized: Device ${this.deviceId}, Session ${this.sessionId}`);
            return true;
        } catch (error) {
            console.error('Failed to initialize CrossDeviceSyncManager:', error);
            return false;
        }
    }
    
    private async getOrCreateDeviceId(): Promise<string> {
        try {
            const storedDeviceId = await AsyncStorage.getItem('SALLIE_DEVICE_ID');
            
            if (storedDeviceId) {
                return storedDeviceId;
            }
            
            // Generate new device ID
            const newDeviceId = generateUniqueId();
            await AsyncStorage.setItem('SALLIE_DEVICE_ID', newDeviceId);
            return newDeviceId;
        } catch (error) {
            console.error('Error getting/creating device ID:', error);
            return `device-${Date.now()}`; // Fallback
        }
    }
    
    private async loadSyncSettings(): Promise<void> {
        try {
            const syncEnabledStr = await AsyncStorage.getItem('SALLIE_SYNC_ENABLED');
            this.syncEnabled = syncEnabledStr === 'true';
            
            const syncIntervalStr = await AsyncStorage.getItem('SALLIE_SYNC_INTERVAL');
            if (syncIntervalStr) {
                this.syncIntervalMs = parseInt(syncIntervalStr, 10);
            }
            
            const lastSyncStr = await AsyncStorage.getItem('SALLIE_LAST_SYNC');
            if (lastSyncStr) {
                this.lastSyncTimestamp = parseInt(lastSyncStr, 10);
            }
        } catch (error) {
            console.error('Error loading sync settings:', error);
            this.syncEnabled = false;
        }
    }
    
    public async setSyncEnabled(enabled: boolean): Promise<void> {
        this.syncEnabled = enabled;
        
        try {
            await AsyncStorage.setItem('SALLIE_SYNC_ENABLED', enabled.toString());
            
            if (enabled) {
                this.startSyncInterval();
                // Trigger immediate sync
                this.debouncedSync();
            } else {
                this.stopSyncInterval();
            }
        } catch (error) {
            console.error('Error saving sync enabled setting:', error);
        }
    }
    
    public async setSyncInterval(intervalMs: number): Promise<void> {
        this.syncIntervalMs = intervalMs;
        
        try {
            await AsyncStorage.setItem('SALLIE_SYNC_INTERVAL', intervalMs.toString());
            
            if (this.syncEnabled) {
                this.restartSyncInterval();
            }
        } catch (error) {
            console.error('Error saving sync interval setting:', error);
        }
    }
    
    private startSyncInterval(): void {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        
        this.syncInterval = setInterval(() => {
            this.performSync();
        }, this.syncIntervalMs);
    }
    
    private stopSyncInterval(): void {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }
    
    private restartSyncInterval(): void {
        this.stopSyncInterval();
        this.startSyncInterval();
    }
    
    public getDeviceInfo(): DeviceInfo {
        return {
            deviceId: this.deviceId,
            deviceName: Platform.OS === 'ios' ? 'iOS Device' : 'Android Device',
            deviceType: Platform.OS,
            lastActive: Date.now(),
            osVersion: Platform.Version.toString()
        };
    }
    
    public getCurrentSession(): DeviceSession {
        return {
            sessionId: this.sessionId,
            deviceId: this.deviceId,
            startTimestamp: Date.now(),
            lastActiveTimestamp: Date.now()
        };
    }
    
    public async queueSyncOperation(operation: SyncOperation): Promise<void> {
        this.syncQueue.push(operation);
        
        if (this.syncEnabled && !this.syncInProgress) {
            this.debouncedSync();
        }
    }
    
    private debouncedSync: () => void;
    
    private async performSync(): Promise<SyncResult> {
        if (this.syncInProgress || !this.syncEnabled) {
            return {
                success: false,
                timestamp: Date.now(),
                message: this.syncInProgress ? 'Sync already in progress' : 'Sync disabled',
                error: SyncError.SYNC_UNAVAILABLE
            };
        }
        
        this.syncInProgress = true;
        
        try {
            // Process operations in queue
            const operationsToSync = [...this.syncQueue];
            this.syncQueue = [];
            
            if (operationsToSync.length === 0) {
                console.log('No operations to sync');
                
                // Still perform pull sync even if no operations to push
                const pullResult = await this.pullFromRemote();
                
                const result: SyncResult = {
                    success: pullResult.success,
                    timestamp: Date.now(),
                    message: pullResult.success ? 'Pull sync completed successfully' : (pullResult.message || 'Pull sync failed'),
                    operations: 0,
                    error: pullResult.success ? undefined : SyncError.PULL_FAILED
                };
                
                this.notifySyncListeners(result);
                
                return result;
            }
            
            console.log(`Syncing ${operationsToSync.length} operations`);
            
            // Encrypt operations before sending
            const encryptedOperations = await this.encryptSyncOperations(operationsToSync);
            
            // Push operations to remote
            const pushResult = await this.pushToRemote(encryptedOperations);
            
            if (!pushResult.success) {
                // Re-queue failed operations
                this.syncQueue = [...operationsToSync, ...this.syncQueue];
                
                const result: SyncResult = {
                    success: false,
                    timestamp: Date.now(),
                    message: pushResult.message || 'Push sync failed',
                    operations: 0,
                    error: SyncError.PUSH_FAILED
                };
                
                this.notifySyncListeners(result);
                
                return result;
            }
            
            // Pull updates from remote
            const pullResult = await this.pullFromRemote();
            
            // Update last sync timestamp
            this.lastSyncTimestamp = Date.now();
            await AsyncStorage.setItem('SALLIE_LAST_SYNC', this.lastSyncTimestamp.toString());
            
            const result: SyncResult = {
                success: pushResult.success && pullResult.success,
                timestamp: this.lastSyncTimestamp,
                message: `Sync ${pullResult.success ? 'completed successfully' : 'partially completed'}`,
                operations: operationsToSync.length,
                error: pullResult.success ? undefined : SyncError.PULL_FAILED
            };
            
            this.notifySyncListeners(result);
            
            return result;
        } catch (error) {
            console.error('Error during sync:', error);
            
            const result: SyncResult = {
                success: false,
                timestamp: Date.now(),
                message: `Sync error: ${error.message || 'Unknown error'}`,
                operations: 0,
                error: SyncError.UNKNOWN
            };
            
            this.notifySyncListeners(result);
            
            return result;
        } finally {
            this.syncInProgress = false;
        }
    }
    
    private async encryptSyncOperations(operations: SyncOperation[]): Promise<string> {
        try {
            const data = JSON.stringify({
                deviceId: this.deviceId,
                sessionId: this.sessionId,
                timestamp: Date.now(),
                operations
            });
            
            return await encryptData(data);
        } catch (error) {
            console.error('Error encrypting sync operations:', error);
            throw error;
        }
    }
    
    private async pushToRemote(encryptedData: string): Promise<{success: boolean, message?: string}> {
        // Implementation will depend on your backend service
        // This is a placeholder that simulates a successful push
        try {
            // Simulated API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            return { success: true };
        } catch (error) {
            console.error('Error pushing data to remote:', error);
            return { 
                success: false, 
                message: error.message || 'Failed to push data to remote server'
            };
        }
    }
    
    private async pullFromRemote(): Promise<{success: boolean, message?: string}> {
        // Implementation will depend on your backend service
        // This is a placeholder that simulates a successful pull
        try {
            // Simulated API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Process received data here
            
            return { success: true };
        } catch (error) {
            console.error('Error pulling data from remote:', error);
            return { 
                success: false, 
                message: error.message || 'Failed to pull data from remote server'
            };
        }
    }
    
    public addSyncListener(listener: (result: SyncResult) => void): () => void {
        this.syncListeners.push(listener);
        
        // Return function to remove this listener
        return () => {
            this.syncListeners = this.syncListeners.filter(l => l !== listener);
        };
    }
    
    private notifySyncListeners(result: SyncResult): void {
        this.syncListeners.forEach(listener => {
            try {
                listener(result);
            } catch (error) {
                console.error('Error in sync listener:', error);
            }
        });
    }
    
    public getLastSyncInfo(): {
        lastSyncTimestamp: number;
        syncEnabled: boolean;
        syncIntervalMs: number;
    } {
        return {
            lastSyncTimestamp: this.lastSyncTimestamp,
            syncEnabled: this.syncEnabled,
            syncIntervalMs: this.syncIntervalMs
        };
    }
    
    public async forceSync(): Promise<SyncResult> {
        return await this.performSync();
    }
    
    public async clearSyncData(): Promise<void> {
        try {
            this.syncQueue = [];
            this.lastSyncTimestamp = 0;
            await AsyncStorage.removeItem('SALLIE_LAST_SYNC');
            console.log('Sync data cleared');
        } catch (error) {
            console.error('Error clearing sync data:', error);
            throw error;
        }
    }
    
    public async cleanup(): Promise<void> {
        this.stopSyncInterval();
        this.syncListeners = [];
    }
}

export default CrossDeviceSyncManager;

/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Cross-device synchronization and data management system.
 * Got it, love.
 */

import { NativeModules, Platform, DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';
import * as Device from 'expo-device';
import { MMKV } from 'react-native-mmkv';
import BackendSyncService from './BackendSyncService';

interface SyncConfig {
  enableAutoSync: boolean;
  syncInterval: number; // minutes
  maxRetries: number;
  enableConflictResolution: boolean;
  syncOnWifiOnly: boolean;
  enableBackgroundSync: boolean;
  dataRetentionDays: number;
}

interface DeviceInfo {
  id: string;
  name: string;
  platform: string;
  version: string;
  lastSync: Date;
  isOnline: boolean;
}

interface SyncData {
  id: string;
  type: 'settings' | 'conversations' | 'memories' | 'preferences' | 'custom';
  data: any;
  timestamp: number;
  deviceId: string;
  version: number;
  checksum: string;
}

interface SyncState {
  isSyncing: boolean;
  lastSyncTime: Date | null;
  pendingChanges: number;
  conflicts: SyncData[];
  connectedDevices: DeviceInfo[];
}

class CrossDeviceSyncManager {
  private config: SyncConfig;
  private syncState: SyncState;
  private syncTimer: NodeJS.Timeout | null = null;
  private mmkv: MMKV;
  private deviceId: string;
  private isOnline: boolean = false;
  private backendService: BackendSyncService;

  constructor(config: Partial<SyncConfig> = {}) {
    this.config = {
      enableAutoSync: true,
      syncInterval: 15, // 15 minutes
      maxRetries: 3,
      enableConflictResolution: true,
      syncOnWifiOnly: true,
      enableBackgroundSync: false,
      dataRetentionDays: 30,
      ...config
    };

    this.syncState = {
      isSyncing: false,
      lastSyncTime: null,
      pendingChanges: 0,
      conflicts: [],
      connectedDevices: []
    };

    this.mmkv = new MMKV();
    this.deviceId = Device.modelId || `device_${Date.now()}`;
    this.backendService = new BackendSyncService();
    this.initialize();
  }

  private async initialize() {
    await this.checkNetworkStatus();
    await this.loadSyncState();
    this.setupNetworkMonitoring();
    this.startAutoSync();
  }

  private async checkNetworkStatus() {
    try {
      const networkState = await Network.getNetworkStateAsync();
      this.isOnline = networkState.isConnected || false;

      if (this.config.syncOnWifiOnly) {
        this.isOnline = this.isOnline && networkState.type === Network.NetworkStateType.WIFI;
      }
    } catch (error) {
      console.warn('Failed to check network status:', error);
      this.isOnline = false;
    }
  }

  private setupNetworkMonitoring() {
    // Monitor network changes
    const subscription = Network.addNetworkStateListener((state) => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected || false;

      if (this.config.syncOnWifiOnly) {
        this.isOnline = this.isOnline && state.type === Network.NetworkStateType.WIFI;
      }

      // Trigger sync if we just came online
      if (!wasOnline && this.isOnline && this.config.enableAutoSync) {
        this.performSync();
      }
    });
  }

  private startAutoSync() {
    if (this.config.enableAutoSync) {
      this.syncTimer = setInterval(() => {
        if (this.isOnline) {
          this.performSync();
        }
      }, this.config.syncInterval * 60 * 1000);
    }
  }

  private async loadSyncState() {
    try {
      const savedState = this.mmkv.getString('sallie_sync_state');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        this.syncState = {
          ...this.syncState,
          ...parsed,
          lastSyncTime: parsed.lastSyncTime ? new Date(parsed.lastSyncTime) : null
        };
      }
    } catch (error) {
      console.warn('Failed to load sync state:', error);
    }
  }

  private async saveSyncState() {
    try {
      this.mmkv.set('sallie_sync_state', JSON.stringify({
        ...this.syncState,
        lastSyncTime: this.syncState.lastSyncTime?.toISOString()
      }));
    } catch (error) {
      console.warn('Failed to save sync state:', error);
    }
  }

  // Sync Management
  async performSync(): Promise<boolean> {
    if (this.syncState.isSyncing || !this.isOnline) {
      return false;
    }

    this.syncState.isSyncing = true;
    DeviceEventEmitter.emit('syncStarted');

    try {
      await this.saveSyncState();

      // Get local changes
      const localChanges = await this.getLocalChanges();

      // Sync with remote/server
      const success = await this.syncWithRemote(localChanges);

      if (success) {
        this.syncState.lastSyncTime = new Date();
        this.syncState.pendingChanges = 0;
        await this.saveSyncState();
        DeviceEventEmitter.emit('syncCompleted', { success: true });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Sync failed:', error);
      DeviceEventEmitter.emit('syncCompleted', { success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      return false;
    } finally {
      this.syncState.isSyncing = false;
    }
  }

  private async getLocalChanges(): Promise<SyncData[]> {
    try {
      const changes = this.mmkv.getString('sallie_pending_changes');
      return changes ? JSON.parse(changes) : [];
    } catch (error) {
      console.warn('Failed to get local changes:', error);
      return [];
    }
  }

  private async syncWithRemote(localChanges: SyncData[]): Promise<boolean> {
    try {
      // Upload local changes
      const uploadSuccess = await this.backendService.uploadSyncData(localChanges);
      if (!uploadSuccess) {
        console.warn('Failed to upload local changes');
        return false;
      }

      // Download remote changes
      const remoteChanges = await this.backendService.downloadSyncData(this.deviceId, this.syncState.lastSyncTime || undefined);
      if (remoteChanges.length > 0) {
        await this.processRemoteChanges(remoteChanges);
      }

      // Check for conflicts
      const conflicts = await this.backendService.getConflicts(this.deviceId);
      if (conflicts.length > 0) {
        this.syncState.conflicts = conflicts;
        await this.saveSyncState();
      }

      // Update device status
      await this.backendService.updateDeviceStatus(this.deviceId, {
        lastSync: new Date(),
        isOnline: this.isOnline
      });

      return true;
    } catch (error) {
      console.error('Remote sync failed:', error);
      return false;
    }
  }

  private async processRemoteChanges(remoteChanges: SyncData[]) {
    // Process and merge remote changes
    for (const change of remoteChanges) {
      // Store remote data (implementation depends on your data structure)
      await this.storeRemoteData(change);
    }
  }

  private async storeRemoteData(change: SyncData) {
    // Implementation for storing remote data
    // This would depend on your specific data storage strategy
    const key = `remote_${change.type}_${change.id}`;
    this.mmkv.set(key, JSON.stringify(change));
  }

  // Data Management
  async queueDataForSync(data: Omit<SyncData, 'id' | 'timestamp' | 'deviceId' | 'version' | 'checksum'>): Promise<void> {
    const syncData: SyncData = {
      ...data,
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      deviceId: this.deviceId,
      version: 1,
      checksum: this.calculateChecksum(data.data)
    };

    const pendingChanges = await this.getLocalChanges();
    pendingChanges.push(syncData);

    this.mmkv.set('sallie_pending_changes', JSON.stringify(pendingChanges));
    this.syncState.pendingChanges = pendingChanges.length;
    await this.saveSyncState();

    // Trigger immediate sync if online
    if (this.isOnline && this.config.enableAutoSync) {
      this.performSync();
    }
  }

  async getSyncedData(type?: string): Promise<SyncData[]> {
    try {
      const allData = this.mmkv.getString('sallie_synced_data');
      const data: SyncData[] = allData ? JSON.parse(allData) : [];

      if (type) {
        return data.filter(item => item.type === type);
      }

      return data;
    } catch (error) {
      console.warn('Failed to get synced data:', error);
      return [];
    }
  }

  // Device Management
  async registerDevice(deviceInfo: Partial<DeviceInfo>): Promise<void> {
    const device: DeviceInfo = {
      id: deviceInfo.id || this.deviceId,
      name: deviceInfo.name || Device.deviceName || 'Unknown Device',
      platform: deviceInfo.platform || Platform.OS,
      version: deviceInfo.version || Device.osVersion || 'Unknown',
      lastSync: deviceInfo.lastSync || new Date(),
      isOnline: deviceInfo.isOnline || this.isOnline,
      ...deviceInfo
    };

    // Register with backend
    const backendSuccess = await this.backendService.registerDevice(device);
    if (!backendSuccess) {
      console.warn('Failed to register device with backend');
    }

    // Store locally
    const devices = await this.getRegisteredDevices();
    const existingIndex = devices.findIndex(d => d.id === device.id);

    if (existingIndex >= 0) {
      devices[existingIndex] = device;
    } else {
      devices.push(device);
    }

    this.mmkv.set('sallie_registered_devices', JSON.stringify(devices));
    this.syncState.connectedDevices = devices;
    await this.saveSyncState();
  }

  async getRegisteredDevices(): Promise<DeviceInfo[]> {
    try {
      // Try to get from backend first
      if (this.backendService.isConnected()) {
        const backendDevices = await this.backendService.getConnectedDevices();
        if (backendDevices.length > 0) {
          this.mmkv.set('sallie_registered_devices', JSON.stringify(backendDevices));
          this.syncState.connectedDevices = backendDevices;
          return backendDevices;
        }
      }

      // Fallback to local storage
      const devices = this.mmkv.getString('sallie_registered_devices');
      return devices ? JSON.parse(devices) : [];
    } catch (error) {
      console.warn('Failed to get registered devices:', error);
      return [];
    }
  }

  // Conflict Resolution
  async resolveConflict(conflictId: string, resolution: 'local' | 'remote' | 'merge'): Promise<void> {
    const conflictIndex = this.syncState.conflicts.findIndex(c => c.id === conflictId);
    if (conflictIndex >= 0) {
      const conflict = this.syncState.conflicts[conflictIndex];

      switch (resolution) {
        case 'local':
          // Keep local version
          await this.queueDataForSync({
            type: conflict.type,
            data: conflict.data
          });
          break;
        case 'remote':
          // Accept remote version (would be handled by sync process)
          break;
        case 'merge':
          // Merge data (implementation depends on data type)
          const mergedData = await this.mergeData(conflict);
          await this.queueDataForSync({
            type: conflict.type,
            data: mergedData
          });
          break;
      }

      this.syncState.conflicts.splice(conflictIndex, 1);
      await this.saveSyncState();
    }
  }

  private async mergeData(conflict: SyncData): Promise<any> {
    // Basic merge strategy - can be enhanced based on data type
    if (typeof conflict.data === 'object' && conflict.data !== null) {
      // For objects, merge properties
      return { ...conflict.data, _merged: true, _mergeTime: Date.now() };
    }
    return conflict.data;
  }

  // Utility Methods
  private calculateChecksum(data: any): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  // State Getters
  getSyncState(): SyncState {
    return { ...this.syncState };
  }

  isDeviceOnline(): boolean {
    return this.isOnline;
  }

  getDeviceId(): string {
    return this.deviceId;
  }

  // Configuration
  updateConfig(newConfig: Partial<SyncConfig>) {
    this.config = { ...this.config, ...newConfig };

    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }
    this.startAutoSync();
  }

  getConfig(): SyncConfig {
    return { ...this.config };
  }

  // Cleanup
  async cleanupOldData(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.dataRetentionDays);

    try {
      const allData = await this.getSyncedData();
      const filteredData = allData.filter(item =>
        new Date(item.timestamp) > cutoffDate
      );

      this.mmkv.set('sallie_synced_data', JSON.stringify(filteredData));
    } catch (error) {
      console.warn('Failed to cleanup old data:', error);
    }
  }

  destroy() {
    try {
      if (this.syncTimer) {
        clearInterval(this.syncTimer);
        this.syncTimer = null;
      }
      this.saveSyncState();
    } catch (error) {
      console.warn('Error cleaning up CrossDeviceSyncManager:', error);
    }
  }
}

export default CrossDeviceSyncManager;
export type { SyncConfig, DeviceInfo, SyncData, SyncState };

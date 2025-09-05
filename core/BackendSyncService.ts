/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Backend service integration for cross-device sync.
 * Got it, love.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';
import { SyncData, DeviceInfo } from './CrossDeviceSyncManager';

interface BackendConfig {
  baseUrl: string;
  apiKey: string;
  timeout: number;
  retryAttempts: number;
  enableEncryption: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

class BackendSyncService {
  private config: BackendConfig;
  private isOnline: boolean = false;

  constructor(config: Partial<BackendConfig> = {}) {
    this.config = {
      baseUrl: 'https://api.sallie.ai', // Replace with your actual backend URL
      apiKey: process.env.EXPO_PUBLIC_API_KEY || '',
      timeout: 30000,
      retryAttempts: 3,
      enableEncryption: true,
      ...config
    };

    this.initialize();
  }

  private async initialize() {
    await this.checkConnectivity();
    this.setupConnectivityMonitoring();
  }

  private async checkConnectivity() {
    try {
      const networkState = await Network.getNetworkStateAsync();
      this.isOnline = networkState.isConnected || false;
    } catch (error) {
      console.warn('Failed to check connectivity:', error);
      this.isOnline = false;
    }
  }

  private networkSubscription: any;

  private setupConnectivityMonitoring() {
    this.networkSubscription = Network.addNetworkStateListener((state) => {
      this.isOnline = state.isConnected || false;
    });
  }

  // Authentication
  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('sallie_auth_token');
    } catch (error) {
      console.warn('Failed to get auth token:', error);
      return null;
    }
  }

  private async setAuthToken(token: string) {
    try {
      await AsyncStorage.setItem('sallie_auth_token', token);
    } catch (error) {
      console.warn('Failed to set auth token:', error);
    }
  }

  // API Request Helper
  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any,
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    if (!this.isOnline) {
      return {
        success: false,
        error: 'No internet connection',
        timestamp: Date.now()
      };
    }

    try {
      const url = `${this.config.baseUrl}${endpoint}`;
      const authToken = await this.getAuthToken();

      const headers: { [key: string]: string } = {
        'Content-Type': 'application/json',
        'X-API-Key': this.config.apiKey,
      };

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const requestOptions: RequestInit = {
        method,
        headers,
        signal: AbortSignal.timeout(this.config.timeout)
      };

      if (data && (method === 'POST' || method === 'PUT')) {
        requestOptions.body = JSON.stringify(data);
      }

      const response = await fetch(url, requestOptions);
      const responseData = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: responseData,
          timestamp: Date.now()
        };
      } else {
        throw new Error(responseData.message || `HTTP ${response.status}`);
      }
    } catch (error: any) {
      console.warn(`API request failed (attempt ${retryCount + 1}):`, error);

      if (retryCount < this.config.retryAttempts && this.isOnline) {
        // Exponential backoff
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequest(endpoint, method, data, retryCount + 1);
      }

      return {
        success: false,
        error: error.message || 'Unknown error',
        timestamp: Date.now()
      };
    }
  }

  // Device Registration
  async registerDevice(deviceInfo: DeviceInfo): Promise<boolean> {
    const response = await this.makeRequest('/devices/register', 'POST', deviceInfo);
    return response.success;
  }

  async updateDeviceStatus(deviceId: string, status: Partial<DeviceInfo>): Promise<boolean> {
    const response = await this.makeRequest(`/devices/${deviceId}/status`, 'PUT', status);
    return response.success;
  }

  async getConnectedDevices(): Promise<DeviceInfo[]> {
    const response = await this.makeRequest<DeviceInfo[]>('/devices/connected');
    return response.success && response.data ? response.data : [];
  }

  // Data Synchronization
  async uploadSyncData(syncData: SyncData[]): Promise<boolean> {
    const response = await this.makeRequest('/sync/upload', 'POST', { data: syncData });
    return response.success;
  }

  async downloadSyncData(deviceId: string, lastSync?: Date): Promise<SyncData[]> {
    const params = lastSync ? `?since=${lastSync.toISOString()}` : '';
    const response = await this.makeRequest<SyncData[]>(`/sync/download/${deviceId}${params}`);
    return response.success && response.data ? response.data : [];
  }

  async resolveConflict(conflictId: string, resolution: 'local' | 'remote' | 'merge'): Promise<boolean> {
    const response = await this.makeRequest(`/sync/conflicts/${conflictId}/resolve`, 'POST', { resolution });
    return response.success;
  }

  async getConflicts(deviceId: string): Promise<SyncData[]> {
    const response = await this.makeRequest<SyncData[]>(`/sync/conflicts/${deviceId}`);
    return response.success && response.data ? response.data : [];
  }

  // User Preferences
  async getUserPreferences(): Promise<any> {
    const response = await this.makeRequest('/user/preferences');
    return response.success && response.data ? response.data : {};
  }

  async updateUserPreferences(preferences: any): Promise<boolean> {
    const response = await this.makeRequest('/user/preferences', 'PUT', preferences);
    return response.success;
  }

  // Analytics and Monitoring
  async sendAnalytics(event: string, data: any): Promise<boolean> {
    const response = await this.makeRequest('/analytics/track', 'POST', {
      event,
      data,
      timestamp: Date.now(),
      deviceId: await this.getDeviceId()
    });
    return response.success;
  }

  async getSyncStats(deviceId: string): Promise<any> {
    const response = await this.makeRequest(`/sync/stats/${deviceId}`);
    return response.success && response.data ? response.data : {};
  }

  // Utility Methods
  private async getDeviceId(): Promise<string> {
    try {
      let deviceId = await AsyncStorage.getItem('sallie_device_id');
      if (!deviceId) {
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem('sallie_device_id', deviceId);
      }
      return deviceId;
    } catch (error) {
      console.warn('Failed to get device ID:', error);
      return 'unknown_device';
    }
  }

  // Health Check
  async healthCheck(): Promise<boolean> {
    const response = await this.makeRequest('/health');
    return response.success;
  }

  // Configuration
  updateConfig(newConfig: Partial<BackendConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): BackendConfig {
    return { ...this.config };
  }

  isConnected(): boolean {
    return this.isOnline;
  }

  // Cleanup resources
  destroy() {
    try {
      if (this.networkSubscription && typeof this.networkSubscription.remove === 'function') {
        this.networkSubscription.remove();
        this.networkSubscription = null;
      }
    } catch (error) {
      console.warn('Error cleaning up BackendSyncService:', error);
    }
  }
}

export default BackendSyncService;
export type { BackendConfig, ApiResponse };

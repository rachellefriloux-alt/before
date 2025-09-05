/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: User preferences management with backend sync.
 * Got it, love.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { MMKV } from 'react-native-mmkv';
import BackendSyncService from './BackendSyncService';

interface UserPreferences {
  // Phone Control Preferences
  phoneControl: {
    enableBatteryOptimization: boolean;
    enableLocationTracking: boolean;
    enableNetworkMonitoring: boolean;
    enableNotificationManagement: boolean;
    vibrationIntensity: 'light' | 'medium' | 'heavy';
    screenTimeout: number;
  };

  // Memory Management Preferences
  memoryManager: {
    maxCacheSize: number;
    cacheExpirationTime: number;
    enableCompression: boolean;
    enableEncryption: boolean;
    memoryWarningThreshold: number;
    autoCleanupInterval: number;
  };

  // Sync Preferences
  syncManager: {
    enableAutoSync: boolean;
    syncInterval: number;
    maxRetries: number;
    enableConflictResolution: boolean;
    syncOnWifiOnly: boolean;
    enableBackgroundSync: boolean;
    dataRetentionDays: number;
  };

  // UI Preferences
  ui: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    enableHaptics: boolean;
    enableSounds: boolean;
    fontSize: 'small' | 'medium' | 'large';
  };

  // Privacy Preferences
  privacy: {
    enableAnalytics: boolean;
    enableCrashReporting: boolean;
    dataRetentionPeriod: number;
    shareUsageStats: boolean;
  };

  // Notification Preferences
  notifications: {
    enablePushNotifications: boolean;
    enableInAppNotifications: boolean;
    quietHours: {
      enabled: boolean;
      start: string; // HH:MM format
      end: string;   // HH:MM format
    };
  };
}

interface PreferencesConfig {
  enableBackendSync: boolean;
  localStorageKey: string;
  autoSaveInterval: number;
}

class UserPreferencesManager {
  private preferences: UserPreferences;
  private config: PreferencesConfig;
  private mmkv: MMKV;
  private backendService: BackendSyncService;
  private autoSaveTimer: NodeJS.Timeout | null = null;
  private isDirty: boolean = false;

  constructor(config: Partial<PreferencesConfig> = {}) {
    this.config = {
      enableBackendSync: true,
      localStorageKey: 'sallie_user_preferences',
      autoSaveInterval: 30000, // 30 seconds
      ...config
    };

    this.mmkv = new MMKV();
    this.backendService = new BackendSyncService();

    // Default preferences
    this.preferences = this.getDefaultPreferences();
    this.initialize();
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      phoneControl: {
        enableBatteryOptimization: true,
        enableLocationTracking: false,
        enableNetworkMonitoring: true,
        enableNotificationManagement: true,
        vibrationIntensity: 'medium',
        screenTimeout: 5
      },
      memoryManager: {
        maxCacheSize: 50,
        cacheExpirationTime: 24,
        enableCompression: true,
        enableEncryption: false,
        memoryWarningThreshold: 100,
        autoCleanupInterval: 30
      },
      syncManager: {
        enableAutoSync: true,
        syncInterval: 15,
        maxRetries: 3,
        enableConflictResolution: true,
        syncOnWifiOnly: true,
        enableBackgroundSync: false,
        dataRetentionDays: 30
      },
      ui: {
        theme: 'auto',
        language: 'en',
        enableHaptics: true,
        enableSounds: true,
        fontSize: 'medium'
      },
      privacy: {
        enableAnalytics: true,
        enableCrashReporting: true,
        dataRetentionPeriod: 365,
        shareUsageStats: false
      },
      notifications: {
        enablePushNotifications: true,
        enableInAppNotifications: true,
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00'
        }
      }
    };
  }

  private async initialize() {
    await this.loadPreferences();
    this.startAutoSave();
  }

  private async loadPreferences() {
    try {
      // Try to load from backend first
      if (this.config.enableBackendSync && this.backendService.isConnected()) {
        const backendPrefs = await this.backendService.getUserPreferences();
        if (backendPrefs && Object.keys(backendPrefs).length > 0) {
          this.preferences = { ...this.preferences, ...backendPrefs };
          this.saveLocally();
          return;
        }
      }

      // Fallback to local storage
      const localPrefs = this.mmkv.getString(this.config.localStorageKey);
      if (localPrefs) {
        const parsed = JSON.parse(localPrefs);
        this.preferences = { ...this.preferences, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load preferences:', error);
    }
  }

  private async saveLocally() {
    try {
      this.mmkv.set(this.config.localStorageKey, JSON.stringify(this.preferences));
    } catch (error) {
      console.warn('Failed to save preferences locally:', error);
    }
  }

  private async saveToBackend() {
    if (this.config.enableBackendSync && this.backendService.isConnected()) {
      try {
        await this.backendService.updateUserPreferences(this.preferences);
      } catch (error) {
        console.warn('Failed to save preferences to backend:', error);
      }
    }
  }

  private startAutoSave() {
    this.autoSaveTimer = setInterval(() => {
      if (this.isDirty) {
        this.saveLocally();
        this.saveToBackend();
        this.isDirty = false;
      }
    }, this.config.autoSaveInterval);
  }

  // Public API
  getPreferences(): UserPreferences {
    return { ...this.preferences };
  }

  async updatePreferences(updates: Partial<UserPreferences>) {
    this.preferences = { ...this.preferences, ...updates };
    this.isDirty = true;
    await this.saveLocally();

    // Immediate backend sync for important changes
    if (this.shouldSyncImmediately(updates)) {
      await this.saveToBackend();
    }
  }

  private shouldSyncImmediately(updates: Partial<UserPreferences>): boolean {
    // Sync immediately for privacy and security related changes
    return !!(updates.privacy || updates.notifications);
  }

  // Specific preference getters
  getPhoneControlPrefs() {
    return { ...this.preferences.phoneControl };
  }

  getMemoryManagerPrefs() {
    return { ...this.preferences.memoryManager };
  }

  getSyncManagerPrefs() {
    return { ...this.preferences.syncManager };
  }

  getUIPrefs() {
    return { ...this.preferences.ui };
  }

  getPrivacyPrefs() {
    return { ...this.preferences.privacy };
  }

  getNotificationPrefs() {
    return { ...this.preferences.notifications };
  }

  // Specific preference updaters
  async updatePhoneControlPrefs(updates: Partial<UserPreferences['phoneControl']>) {
    await this.updatePreferences({
      phoneControl: { ...this.preferences.phoneControl, ...updates }
    });
  }

  async updateMemoryManagerPrefs(updates: Partial<UserPreferences['memoryManager']>) {
    await this.updatePreferences({
      memoryManager: { ...this.preferences.memoryManager, ...updates }
    });
  }

  async updateSyncManagerPrefs(updates: Partial<UserPreferences['syncManager']>) {
    await this.updatePreferences({
      syncManager: { ...this.preferences.syncManager, ...updates }
    });
  }

  async updateUIPrefs(updates: Partial<UserPreferences['ui']>) {
    await this.updatePreferences({
      ui: { ...this.preferences.ui, ...updates }
    });
  }

  async updatePrivacyPrefs(updates: Partial<UserPreferences['privacy']>) {
    await this.updatePreferences({
      privacy: { ...this.preferences.privacy, ...updates }
    });
  }

  async updateNotificationPrefs(updates: Partial<UserPreferences['notifications']>) {
    await this.updatePreferences({
      notifications: { ...this.preferences.notifications, ...updates }
    });
  }

  // Utility methods
  async resetToDefaults() {
    this.preferences = this.getDefaultPreferences();
    this.isDirty = true;
    await this.saveLocally();
    await this.saveToBackend();
  }

  async exportPreferences(): Promise<string> {
    return JSON.stringify(this.preferences, null, 2);
  }

  async importPreferences(preferencesJson: string) {
    try {
      const imported = JSON.parse(preferencesJson);
      // Validate the imported preferences
      if (this.validatePreferences(imported)) {
        this.preferences = { ...this.preferences, ...imported };
        this.isDirty = true;
        await this.saveLocally();
        await this.saveToBackend();
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Failed to import preferences:', error);
      return false;
    }
  }

  private validatePreferences(prefs: any): boolean {
    // Basic validation - you can enhance this
    return !!(prefs && typeof prefs === 'object');
  }

  // Sync methods
  async forceSync() {
    await this.saveToBackend();
  }

  async refreshFromBackend() {
    if (this.config.enableBackendSync && this.backendService.isConnected()) {
      const backendPrefs = await this.backendService.getUserPreferences();
      if (backendPrefs && Object.keys(backendPrefs).length > 0) {
        this.preferences = { ...this.preferences, ...backendPrefs };
        await this.saveLocally();
      }
    }
  }

  // Cleanup
  destroy() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }
    if (this.isDirty) {
      this.saveLocally();
      this.saveToBackend();
    }
  }
}

export default UserPreferencesManager;
export type { UserPreferences, PreferencesConfig };

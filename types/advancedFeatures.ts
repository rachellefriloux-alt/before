/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: TypeScript type definitions for advanced features.
 * Got it, love.
 */

// Phone Control Types
export interface PhoneControlConfig {
  enableBatteryOptimization: boolean;
  enableLocationTracking: boolean;
  enableNetworkMonitoring: boolean;
  enableNotificationManagement: boolean;
  vibrationIntensity: 'light' | 'medium' | 'heavy';
  screenTimeout: number;
}

export interface DeviceState {
  batteryLevel: number;
  isCharging: boolean;
  networkType: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null;
  isScreenOn: boolean;
  brightness: number;
  volume: number;
  airplaneMode: boolean;
  wifiEnabled: boolean;
  bluetoothEnabled: boolean;
}

// Memory Management Types
export interface MemoryConfig {
  maxCacheSize: number;
  cacheExpirationTime: number;
  enableCompression: boolean;
  enableEncryption: boolean;
  memoryWarningThreshold: number;
  autoCleanupInterval: number;
}

export interface MemoryStats {
  totalMemory: number;
  usedMemory: number;
  availableMemory: number;
  cacheSize: number;
  lastCleanup: Date;
  memoryPressure: 'low' | 'medium' | 'high' | 'critical';
}

export interface CacheEntry {
  key: string;
  data: any;
  timestamp: number;
  accessCount: number;
  size: number;
  expirationTime?: number;
  tags?: string[];
}

// Cross-Device Sync Types
export interface SyncConfig {
  enableAutoSync: boolean;
  syncInterval: number;
  maxRetries: number;
  enableConflictResolution: boolean;
  syncOnWifiOnly: boolean;
  enableBackgroundSync: boolean;
  dataRetentionDays: number;
}

export interface DeviceInfo {
  id: string;
  name: string;
  platform: string;
  version: string;
  lastSync: Date;
  isOnline: boolean;
}

export interface SyncData {
  id: string;
  type: 'settings' | 'conversations' | 'memories' | 'preferences' | 'custom';
  data: any;
  timestamp: number;
  deviceId: string;
  version: number;
  checksum: string;
}

export interface SyncState {
  isSyncing: boolean;
  lastSyncTime: Date | null;
  pendingChanges: number;
  conflicts: SyncData[];
  connectedDevices: DeviceInfo[];
}

// Advanced Features Component Types
export interface AdvancedFeaturesProps {
  onFeatureToggle?: (feature: string, enabled: boolean) => void;
}

export interface FeatureToggleEvent {
  feature: 'phoneControl' | 'memoryManager' | 'syncManager';
  enabled: boolean;
}

// Event Types for Device Communication
export interface DeviceEventData {
  type: 'deviceStateChanged' | 'syncStarted' | 'syncCompleted' | 'memoryWarning';
  payload: any;
  timestamp: number;
}

// Error Types
export interface FeatureError {
  feature: string;
  error: string;
  timestamp: number;
  recoverable: boolean;
}

// Configuration Types
export interface AdvancedFeaturesConfig {
  phoneControl: PhoneControlConfig;
  memoryManager: MemoryConfig;
  syncManager: SyncConfig;
  enabledFeatures: string[];
  permissions: {
    location: boolean;
    storage: boolean;
    notifications: boolean;
    phone: boolean;
  };
}

// Analytics Types
export interface FeatureUsageStats {
  feature: string;
  usageCount: number;
  lastUsed: Date;
  averageSessionTime: number;
  errorCount: number;
}

export interface PerformanceMetrics {
  feature: string;
  operation: string;
  duration: number;
  success: boolean;
  timestamp: number;
}

// Integration Types
export interface FeatureIntegration {
  name: string;
  version: string;
  dependencies: string[];
  permissions: string[];
  isEnabled: boolean;
}

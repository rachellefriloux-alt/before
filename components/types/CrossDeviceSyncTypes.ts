/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Type definitions for cross-device synchronization.
 * Got it, love.
 */

export interface SyncConfiguration {
  enableAutoSync: boolean;
  syncInterval: number;
  maxRetries: number;
  enableConflictResolution: boolean;
  syncOnWifiOnly: boolean;
  enableBackgroundSync: boolean;
  dataRetentionDays: number;
  // Legacy / UI-friendly keys (optional)
  syncMemory?: boolean;
  syncPreferences?: boolean;
  syncPersonality?: boolean;
  wifiOnly?: boolean;
  autoSync?: boolean;
  autoSyncInterval?: number;
}

// Backwards-compatible keys used by UI components (legacy and new names)
export type SyncConfigurationKey =
  | 'enableAutoSync'
  | 'syncInterval'
  | 'maxRetries'
  | 'enableConflictResolution'
  | 'syncOnWifiOnly'
  | 'enableBackgroundSync'
  | 'dataRetentionDays'
  | 'syncMemory'
  | 'syncPreferences'
  | 'syncPersonality'
  | 'wifiOnly'
  | 'autoSync';

export interface PairedDevice {
  id: string;
  name: string;
  // legacy 'type' field sometimes used in UI
  type?: DeviceType | string;
  deviceType?: DeviceType;
  // lastSeen may be a Date or a numeric timestamp in older data
  lastSeen?: Date | number;
  // Keep lastSyncTime used by UI
  lastSyncTime?: Date | number;
  isOnline?: boolean;
  capabilities?: string[];
  // transport type reported by underlying native module
  transportType?: TransportType | string;
}

export interface SyncSession {
  id: string;
  deviceId: string;
  startTime: Date | number;
  endTime?: Date | number;
  // Keep a compact set of statuses but allow legacy upper-case values
  status: 'pending' | 'active' | 'completed' | 'failed' | string;
  dataTransferred: number;
  transportType: TransportType | string;
  // Optional runtime fields used by UI
  progress?: number; // 0-100
  error?: any;
  remoteDeviceId?: string;
}

export type TransportType = 'wifi' | 'bluetooth' | 'usb' | 'cloud' | string;

export type DeviceType = 'phone' | 'tablet' | 'laptop' | 'desktop' | 'wearable';

export interface SyncState {
  isSyncing: boolean;
  lastSyncTime: Date | null;
  pendingChanges: number;
  conflicts: any[];
  connectedDevices: PairedDevice[];
}

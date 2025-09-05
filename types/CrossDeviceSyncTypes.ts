/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Type definitions for cross-device sync system.
 * Got it, love.
 */

/**
 * Sync configuration options
 */
export type SyncConfiguration = {
  /**
   * Whether to sync memory data (conversations, interactions, etc.)
   */
  syncMemory: boolean;
  
  /**
   * Whether to sync user preferences (settings, UI preferences, etc.)
   */
  syncPreferences: boolean;
  
  /**
   * Whether to sync personality data (Sallie's personality adaptations)
   */
  syncPersonality: boolean;
  
  /**
   * Whether to sync only on WiFi networks
   */
  wifiOnly: boolean;
  
  /**
   * Whether to automatically sync periodically
   */
  autoSync: boolean;
  
  /**
   * Auto-sync interval in milliseconds
   */
  autoSyncInterval: number;
};

/**
 * Device type enumeration
 */
export enum DeviceType {
  PHONE = 'PHONE',
  TABLET = 'TABLET',
  DESKTOP = 'DESKTOP',
  OTHER = 'OTHER'
}

/**
 * Transport type enumeration
 */
export enum TransportType {
  BLUETOOTH = 'BLUETOOTH',
  WIFI_DIRECT = 'WIFI_DIRECT',
  WIFI = 'WIFI',
  CLOUD = 'CLOUD',
  USB = 'USB'
}

/**
 * Device status enumeration
 */
export enum DeviceStatus {
  DISCOVERED = 'DISCOVERED',
  PAIRED = 'PAIRED',
  SYNCED = 'SYNCED',
  OFFLINE = 'OFFLINE',
  ERROR = 'ERROR'
}

/**
 * Sync status enumeration
 */
export enum SyncStatus {
  PREPARING = 'PREPARING',
  CONNECTING = 'CONNECTING',
  TRANSFERRING = 'TRANSFERRING',
  VERIFYING = 'VERIFYING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

/**
 * Discovered device information
 */
export type DiscoveredDevice = {
  /**
   * Unique device identifier
   */
  id: string;
  
  /**
   * User-friendly device name
   */
  name: string;
  
  /**
   * Type of device (phone, tablet, desktop, etc.)
   */
  type: DeviceType;
  
  /**
   * Available transport method for this device
   */
  transportType: TransportType;
};

/**
 * Paired device information
 */
export type PairedDevice = {
  /**
   * Unique device identifier
   */
  id: string;
  
  /**
   * User-friendly device name
   */
  name: string;
  
  /**
   * Type of device (phone, tablet, desktop, etc.)
   */
  type: DeviceType;
  
  /**
   * Transport method used for this device
   */
  transportType: TransportType;
  
  /**
   * Timestamp of last successful sync
   */
  lastSyncTime: number;
  
  /**
   * Current status of the device
   */
  status: DeviceStatus;
};

/**
 * Sync session information
 */
export type SyncSession = {
  /**
   * Unique session identifier
   */
  id: string;
  
  /**
   * Remote device identifier
   */
  remoteDeviceId: string;
  
  /**
   * Remote device name
   */
  remoteDeviceName: string;
  
  /**
   * Session start timestamp
   */
  startTime?: number;
  
  /**
   * Current sync status
   */
  status: SyncStatus;
  
  /**
   * Transport method used for this session
   */
  transportType: TransportType;
  
  /**
   * Current progress (0-100)
   */
  progress?: number;
  
  /**
   * Session end timestamp
   */
  endTime?: number;
  
  /**
   * Error message if sync failed
   */
  error?: string | null;
};

/**
 * Transfer result information
 */
export type TransferResult = {
  /**
   * Number of bytes sent
   */
  bytesSent: number;
  
  /**
   * Number of bytes received
   */
  bytesReceived: number;
  
  /**
   * Number of items synced
   */
  itemsSynced: number;
};

/**
 * Memory data structure
 */
export type MemoryData = {
  /**
   * Memory content (can be any serializable data)
   */
  content: any;
  
  /**
   * Memory metadata
   */
  metadata: Record<string, any>;
};

/**
 * Sync event types
 */
export type SyncEvent = 
  | { type: 'SystemInitialized'; syncEnabled: boolean }
  | { type: 'SyncEnabledChanged'; enabled: boolean }
  | { type: 'SyncConfigChanged'; config: SyncConfiguration }
  | { type: 'DeviceNameChanged'; name: string }
  | { type: 'DevicesDiscovered'; discoveryId: string; devices: DiscoveredDevice[] }
  | { type: 'DevicePaired'; device: PairedDevice }
  | { type: 'DeviceUnpaired'; device: PairedDevice }
  | { type: 'SyncStarted'; sessionId: string; deviceId: string }
  | { type: 'SyncProgress'; sessionId: string; progress: number }
  | { type: 'SyncCompleted'; sessionId: string; deviceId: string; bytesSent: number; bytesReceived: number; itemsSynced: number }
  | { type: 'SyncFailed'; sessionId: string; error: string }
  | { type: 'SyncCancelled'; sessionId: string }
  | { type: 'BackgroundSyncStarted' }
  | { type: 'BackgroundSyncCompleted'; deviceCount: number }
  | { type: 'BackgroundSyncFailed'; error: string }
  | { type: 'BackgroundSyncSkipped'; reason: string };

/**
 * Cross Device Sync Module interface
 */
export interface CrossDeviceSyncModuleInterface {
  /**
   * Initialize the sync system
   */
  initialize(): Promise<void>;
  
  /**
   * Check if sync is enabled
   */
  isSyncEnabled(): Promise<boolean>;
  
  /**
   * Enable or disable sync
   */
  setSyncEnabled(enabled: boolean): Promise<void>;
  
  /**
   * Get current sync configuration
   */
  getSyncConfig(): Promise<SyncConfiguration>;
  
  /**
   * Update sync configuration
   */
  updateSyncConfig(config: SyncConfiguration): Promise<void>;
  
  /**
   * Get device ID
   */
  getDeviceId(): Promise<string>;
  
  /**
   * Set device name
   */
  setDeviceName(name: string): Promise<void>;
  
  /**
   * Get device name
   */
  getDeviceName(): Promise<string>;
  
  /**
   * Start device discovery for pairing
   * @returns Discovery session ID
   */
  startDeviceDiscovery(): Promise<string>;
  
  /**
   * Pair with a discovered device
   */
  pairDevice(deviceId: string, deviceName: string, transportType: TransportType): Promise<boolean>;
  
  /**
   * Unpair a device
   */
  unpairDevice(deviceId: string): Promise<boolean>;
  
  /**
   * Get all paired devices
   */
  getPairedDevices(): Promise<PairedDevice[]>;
  
  /**
   * Start a sync with a specific device
   * @returns Session ID
   */
  syncWithDevice(deviceId: string): Promise<string>;
  
  /**
   * Start a sync with all paired devices
   * @returns List of session IDs
   */
  syncWithAllDevices(): Promise<string[]>;
  
  /**
   * Get sync session status
   */
  getSyncSessionStatus(sessionId: string): Promise<SyncSession | null>;
  
  /**
   * Cancel an active sync session
   */
  cancelSync(sessionId: string): Promise<boolean>;
  
  /**
   * Add sync event listener
   * @returns Listener ID
   */
  addSyncEventListener(listener: (event: SyncEvent) => void): number;
  
  /**
   * Remove sync event listener
   */
  removeSyncEventListener(listenerId: number): void;
}

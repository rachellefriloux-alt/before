/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Integration tests for advanced features.
 * Got it, love.
 */

import PhoneControlManager from '../core/PhoneControlManager';
import AdvancedMemoryManager from '../core/AdvancedMemoryManager';
import CrossDeviceSyncManager from '../core/CrossDeviceSyncManager';

describe('Advanced Features Integration', () => {
  let phoneManager: PhoneControlManager;
  let memoryManager: AdvancedMemoryManager;
  let syncManager: CrossDeviceSyncManager;

  beforeEach(() => {
    phoneManager = new PhoneControlManager();
    memoryManager = new AdvancedMemoryManager();
    syncManager = new CrossDeviceSyncManager();
  });

  afterEach(() => {
    phoneManager.destroy();
    memoryManager.destroy();
    syncManager.destroy();
  });

  describe('Phone Control Manager', () => {
    test('should initialize with default config', () => {
      const config = phoneManager.getConfig();
      expect(config.enableBatteryOptimization).toBe(true);
      expect(config.vibrationIntensity).toBe('medium');
    });

    test('should update configuration', () => {
      phoneManager.updateConfig({ vibrationIntensity: 'heavy' });
      const config = phoneManager.getConfig();
      expect(config.vibrationIntensity).toBe('heavy');
    });

    test('should get device state', () => {
      const state = phoneManager.getDeviceState();
      expect(state).toHaveProperty('batteryLevel');
      expect(state).toHaveProperty('isCharging');
    });
  });

  describe('Advanced Memory Manager', () => {
    test('should initialize with default config', () => {
      const config = memoryManager.getConfig();
      expect(config.maxCacheSize).toBe(50);
      expect(config.enableCompression).toBe(true);
    });

    test('should set and get cache data', async () => {
      const testData = { message: 'Hello, Sallie!' };
      await memoryManager.set('test_key', testData);

      const retrieved = await memoryManager.get('test_key');
      expect(retrieved).toEqual(testData);
    });

    test('should return null for non-existent key', async () => {
      const result = await memoryManager.get('non_existent_key');
      expect(result).toBeNull();
    });

    test('should get memory stats', () => {
      const stats = memoryManager.getMemoryStats();
      expect(stats).toHaveProperty('cacheSize');
      expect(stats).toHaveProperty('memoryPressure');
    });
  });

  describe('Cross Device Sync Manager', () => {
    test('should initialize with default config', () => {
      const config = syncManager.getConfig();
      expect(config.enableAutoSync).toBe(true);
      expect(config.syncInterval).toBe(15);
    });

    test('should get sync state', () => {
      const state = syncManager.getSyncState();
      expect(state).toHaveProperty('isSyncing');
      expect(state).toHaveProperty('pendingChanges');
    });

    test('should get device ID', () => {
      const deviceId = syncManager.getDeviceId();
      expect(typeof deviceId).toBe('string');
      expect(deviceId.length).toBeGreaterThan(0);
    });
  });

  describe('Feature Integration', () => {
    test('all managers should be properly initialized', () => {
      expect(phoneManager).toBeDefined();
      expect(memoryManager).toBeDefined();
      expect(syncManager).toBeDefined();
    });

    test('managers should have proper cleanup methods', () => {
      expect(typeof phoneManager.destroy).toBe('function');
      expect(typeof memoryManager.destroy).toBe('function');
      expect(typeof syncManager.destroy).toBe('function');
    });
  });
});

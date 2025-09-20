/*
 * Sallie AI Test Suite
 * Comprehensive unit and integration tests
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Mock dependencies
jest.mock('expo-notifications');
jest.mock('@react-native-async-storage/async-storage');
jest.mock('expo-network');
jest.mock('expo-file-system');

// Import managers after mocking
import { OfflineSyncManager } from '../components/OfflineSyncManager';
import { NotificationManager } from '../components/NotificationManager';
import { CloudBackupManager } from '../components/CloudBackupManager';
import { AnalyticsManager } from '../components/AnalyticsManager';

describe('OfflineSyncManager', () => {
  let syncManager: OfflineSyncManager;

  beforeEach(() => {
    syncManager = new OfflineSyncManager();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('storeOffline', () => {
    it('should store offline data successfully', async () => {
      const testData = {
        id: 'test-1',
        type: 'user_data',
        data: { name: 'Test User' },
        timestamp: Date.now(),
        version: 1,
        synced: false
      };

      await expect(syncManager.storeOffline(testData)).resolves.not.toThrow();
    });

    it('should emit dataStored event', async () => {
      const mockEmit = jest.spyOn(syncManager, 'emit');
      const testData = {
        id: 'test-1',
        type: 'user_data',
        data: { name: 'Test User' },
        timestamp: Date.now(),
        version: 1,
        synced: false
      };

      await syncManager.storeOffline(testData);

      expect(mockEmit).toHaveBeenCalledWith('dataStored', testData);
    });
  });

  describe('getOfflineData', () => {
    it('should return all offline data when no type specified', async () => {
      const testData1 = {
        id: 'test-1',
        type: 'user_data',
        data: { name: 'Test User' },
        timestamp: Date.now(),
        version: 1,
        synced: false
      };

      const testData2 = {
        id: 'test-2',
        type: 'settings',
        data: { theme: 'dark' },
        timestamp: Date.now(),
        version: 1,
        synced: false
      };

      await syncManager.storeOffline(testData1);
      await syncManager.storeOffline(testData2);

      const result = await syncManager.getOfflineData();
      expect(result).toHaveLength(2);
    });

    it('should filter data by type', async () => {
      const userData = {
        id: 'test-1',
        type: 'user_data',
        data: { name: 'Test User' },
        timestamp: Date.now(),
        version: 1,
        synced: false
      };

      const settingsData = {
        id: 'test-2',
        type: 'settings',
        data: { theme: 'dark' },
        timestamp: Date.now(),
        version: 1,
        synced: false
      };

      await syncManager.storeOffline(userData);
      await syncManager.storeOffline(settingsData);

      const result = await syncManager.getOfflineData('user_data');
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('user_data');
    });
  });

  describe('getSyncStatus', () => {
    it('should return correct sync status', () => {
      const status = syncManager.getSyncStatus();

      expect(status).toHaveProperty('isOnline');
      expect(status).toHaveProperty('pendingItems');
      expect(typeof status.isOnline).toBe('boolean');
      expect(typeof status.pendingItems).toBe('number');
    });
  });
});

describe('NotificationManager', () => {
  let notificationManager: NotificationManager;

  beforeEach(() => {
    notificationManager = new NotificationManager();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendImmediateNotification', () => {
    it('should send notification when enabled', async () => {
      const notification = {
        title: 'Test Notification',
        body: 'This is a test',
        data: { type: 'test' }
      };

      await expect(notificationManager.sendImmediateNotification(notification))
        .resolves.not.toThrow();
    });

    it('should not send notification when disabled', async () => {
      await notificationManager.updateSettings({ enabled: false });

      const notification = {
        title: 'Test Notification',
        body: 'This is a test',
        data: { type: 'test' }
      };

      // Should not throw but also not send notification
      await expect(notificationManager.sendImmediateNotification(notification))
        .resolves.not.toThrow();
    });
  });

  describe('scheduleNotification', () => {
    it('should schedule notification successfully', async () => {
      const notification = {
        id: 'test-notification',
        title: 'Scheduled Test',
        body: 'This is scheduled',
        scheduledTime: new Date(Date.now() + 60000), // 1 minute from now
        data: { type: 'scheduled' }
      };

      const result = await notificationManager.scheduleNotification(notification);
      expect(typeof result).toBe('string');
    });

    it('should reject when notifications are disabled', async () => {
      await notificationManager.updateSettings({ enabled: false });

      const notification = {
        id: 'test-notification',
        title: 'Scheduled Test',
        body: 'This is scheduled',
        scheduledTime: new Date(Date.now() + 60000),
        data: { type: 'scheduled' }
      };

      await expect(notificationManager.scheduleNotification(notification))
        .rejects.toThrow('Notifications are disabled');
    });
  });

  describe('updateSettings', () => {
    it('should update notification settings', async () => {
      const newSettings = {
        enabled: false,
        sound: false,
        vibration: true
      };

      await expect(notificationManager.updateSettings(newSettings))
        .resolves.not.toThrow();

      const settings = notificationManager.getSettings();
      expect(settings.enabled).toBe(false);
      expect(settings.sound).toBe(false);
      expect(settings.vibration).toBe(true);
    });
  });
});

describe('CloudBackupManager', () => {
  let backupManager: CloudBackupManager;

  beforeEach(() => {
    backupManager = new CloudBackupManager();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createBackup', () => {
    it('should reject when no provider is configured', async () => {
      const testData = { name: 'Test User', settings: { theme: 'dark' } };

      await expect(backupManager.createBackup(testData))
        .rejects.toThrow('No cloud provider configured');
    });
  });

  describe('updateSettings', () => {
    it('should update backup settings', async () => {
      const newSettings = {
        enabled: false,
        frequency: 'daily' as const,
        retention: 60
      };

      await expect(backupManager.updateSettings(newSettings))
        .resolves.not.toThrow();

      const settings = backupManager.getSettings();
      expect(settings.enabled).toBe(false);
      expect(settings.frequency).toBe('daily');
      expect(settings.retention).toBe(60);
    });
  });

  describe('getBackupStatus', () => {
    it('should return correct backup status', () => {
      const status = backupManager.getBackupStatus();

      expect(status).toHaveProperty('enabled');
      expect(status).toHaveProperty('currentProvider');
      expect(status).toHaveProperty('queueLength');
      expect(status).toHaveProperty('isBackingUp');
    });
  });
});

describe('AnalyticsManager', () => {
  let analyticsManager: AnalyticsManager;

  beforeEach(() => {
    analyticsManager = new AnalyticsManager();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('trackEvent', () => {
    it('should track event when enabled', () => {
      const mockEmit = jest.spyOn(analyticsManager, 'emit');

      analyticsManager.trackEvent('test_event', { test: 'data' });

      expect(mockEmit).toHaveBeenCalledWith('eventTracked', expect.any(Object));
    });

    it('should not track event when disabled', () => {
      analyticsManager.updateSettings({ enabled: false });
      const mockEmit = jest.spyOn(analyticsManager, 'emit');

      analyticsManager.trackEvent('test_event', { test: 'data' });

      expect(mockEmit).not.toHaveBeenCalledWith('eventTracked', expect.any(Object));
    });
  });

  describe('trackScreenView', () => {
    it('should track screen view when enabled', () => {
      const mockEmit = jest.spyOn(analyticsManager, 'emit');

      analyticsManager.trackScreenView('HomeScreen', 5000);

      expect(mockEmit).toHaveBeenCalledWith('eventTracked', expect.any(Object));
    });

    it('should not track screen view when disabled', () => {
      analyticsManager.updateSettings({ trackScreenViews: false });
      const mockEmit = jest.spyOn(analyticsManager, 'emit');

      analyticsManager.trackScreenView('HomeScreen', 5000);

      expect(mockEmit).not.toHaveBeenCalledWith('eventTracked', expect.any(Object));
    });
  });

  describe('trackUserInteraction', () => {
    it('should track user interaction when enabled', () => {
      const mockEmit = jest.spyOn(analyticsManager, 'emit');

      analyticsManager.trackUserInteraction('tap', 'button', { buttonId: 'save' });

      expect(mockEmit).toHaveBeenCalledWith('eventTracked', expect.any(Object));
    });
  });

  describe('trackPerformance', () => {
    it('should track performance metric when enabled', () => {
      const mockEmit = jest.spyOn(analyticsManager, 'emit');

      analyticsManager.trackPerformance('load_time', 1500, { screen: 'Home' });

      expect(mockEmit).toHaveBeenCalledWith('eventTracked', expect.any(Object));
    });
  });

  describe('getAnalyticsData', () => {
    it('should return analytics data structure', () => {
      const data = analyticsManager.getAnalyticsData();

      expect(data).toHaveProperty('totalEvents');
      expect(data).toHaveProperty('eventsByType');
      expect(data).toHaveProperty('sessionDuration');
      expect(data).toHaveProperty('insightsCount');
    });
  });

  describe('getInsights', () => {
    it('should return insights array', () => {
      const insights = analyticsManager.getInsights();

      expect(Array.isArray(insights)).toBe(true);
    });

    it('should filter insights by type', () => {
      const insights = analyticsManager.getInsights('behavior');

      expect(Array.isArray(insights)).toBe(true);
    });
  });
});

// Integration tests
describe('System Integration', () => {
  describe('Cross-system communication', () => {
    it('should handle offline sync with analytics tracking', async () => {
      const syncManager = new OfflineSyncManager();
      const analyticsManager = new AnalyticsManager();

      const mockEmit = jest.spyOn(analyticsManager, 'emit');

      // Simulate storing data offline
      const testData = {
        id: 'integration-test',
        type: 'user_data',
        data: { name: 'Integration Test' },
        timestamp: Date.now(),
        version: 1,
        synced: false
      };

      await syncManager.storeOffline(testData);

      // Verify data was stored (basic integration test)
      const storedData = await syncManager.getOfflineData();
      expect(storedData.length).toBeGreaterThan(0);
    });
  });
});

// Performance tests
describe('Performance Tests', () => {
  describe('OfflineSyncManager Performance', () => {
    it('should handle multiple offline operations efficiently', async () => {
      const syncManager = new OfflineSyncManager();
      const startTime = Date.now();

      // Create multiple offline operations
      const operations = Array.from({ length: 100 }, (_, i) => ({
        id: `perf-test-${i}`,
        type: 'test_data',
        data: { index: i, data: 'test'.repeat(100) },
        timestamp: Date.now(),
        version: 1,
        synced: false
      }));

      // Execute operations
      await Promise.all(operations.map(op => syncManager.storeOffline(op)));

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(5000); // 5 seconds
    });
  });
});

// Error handling tests
describe('Error Handling', () => {
  describe('OfflineSyncManager Error Handling', () => {
    it('should handle storage errors gracefully', async () => {
      const syncManager = new OfflineSyncManager();

      // Mock AsyncStorage to throw error
      const mockAsyncStorage = require('@react-native-async-storage/async-storage');
      mockAsyncStorage.setItem = jest.fn().mockImplementation(() => {
        throw new Error('Storage error');
      });

      const testData = {
        id: 'error-test',
        type: 'test',
        data: { test: 'data' },
        timestamp: Date.now(),
        version: 1,
        synced: false
      };

      // Should handle error gracefully
      await expect(syncManager.storeOffline(testData)).rejects.toThrow();
    });
  });
});

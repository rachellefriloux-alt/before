/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Advanced features integration component for React Native UI.
 * Got it, love.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  ActivityIndicator,
  DeviceEventEmitter,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PhoneControlManager from '../core/PhoneControlManager';
import AdvancedMemoryManager from '../core/AdvancedMemoryManager';
import CrossDeviceSyncManager from '../core/CrossDeviceSyncManager';

const { width } = Dimensions.get('window');

interface AdvancedFeaturesProps {
  onFeatureToggle?: (feature: string, enabled: boolean) => void;
}

const AdvancedFeatures: React.FC<AdvancedFeaturesProps> = ({ onFeatureToggle }) => {
  const [phoneControlEnabled, setPhoneControlEnabled] = useState(false);
  const [memoryManagerEnabled, setMemoryManagerEnabled] = useState(false);
  const [syncManagerEnabled, setSyncManagerEnabled] = useState(false);

  const [phoneManager, setPhoneManager] = useState<PhoneControlManager | null>(null);
  const [memoryManager, setMemoryManager] = useState<AdvancedMemoryManager | null>(null);
  const [syncManager, setSyncManager] = useState<CrossDeviceSyncManager | null>(null);

  const [deviceState, setDeviceState] = useState<any>(null);
  const [memoryStats, setMemoryStats] = useState<any>(null);
  const [syncState, setSyncState] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Listen for device state changes
    const deviceSubscription = DeviceEventEmitter.addListener('deviceStateChanged', (state) => {
      setDeviceState(state);
    });

    // Listen for sync events
    const syncStartSubscription = DeviceEventEmitter.addListener('syncStarted', () => {
      setIsLoading(true);
    });

    const syncCompleteSubscription = DeviceEventEmitter.addListener('syncCompleted', (result) => {
      setIsLoading(false);
      if (result.success) {
        Alert.alert('Sync Complete', 'Data synchronized successfully!');
      } else {
        Alert.alert('Sync Failed', result.error || 'Unknown error occurred');
      }
    });

    return () => {
      deviceSubscription.remove();
      syncStartSubscription.remove();
      syncCompleteSubscription.remove();
    };
  }, []);

  const initializePhoneControl = useCallback(async () => {
    try {
      const manager = new PhoneControlManager({
        enableBatteryOptimization: true,
        enableLocationTracking: false,
        enableNetworkMonitoring: true,
        enableNotificationManagement: true,
        vibrationIntensity: 'medium',
        screenTimeout: 5
      });
      setPhoneManager(manager);
      setDeviceState(manager.getDeviceState());
      return true;
    } catch (error) {
      Alert.alert('Error', 'Failed to initialize phone control');
      return false;
    }
  }, []);

  const initializeMemoryManager = useCallback(async () => {
    try {
      const manager = new AdvancedMemoryManager({
        maxCacheSize: 50,
        cacheExpirationTime: 24,
        enableCompression: true,
        enableEncryption: false,
        memoryWarningThreshold: 100,
        autoCleanupInterval: 30
      });
      setMemoryManager(manager);
      setMemoryStats(manager.getMemoryStats());
      return true;
    } catch (error) {
      Alert.alert('Error', 'Failed to initialize memory manager');
      return false;
    }
  }, []);

  const initializeSyncManager = useCallback(async () => {
    try {
      const manager = new CrossDeviceSyncManager({
        enableAutoSync: true,
        syncInterval: 15,
        maxRetries: 3,
        enableConflictResolution: true,
        syncOnWifiOnly: true,
        enableBackgroundSync: false,
        dataRetentionDays: 30
      });
      setSyncManager(manager);
      setSyncState(manager.getSyncState());
      return true;
    } catch (error) {
      Alert.alert('Error', 'Failed to initialize sync manager');
      return false;
    }
  }, []);

  const togglePhoneControl = useCallback(async (enabled: boolean) => {
    setPhoneControlEnabled(enabled);
    onFeatureToggle?.('phoneControl', enabled);

    if (enabled) {
      const success = await initializePhoneControl();
      if (!success) {
        setPhoneControlEnabled(false);
      }
    } else {
      phoneManager?.destroy();
      setPhoneManager(null);
      setDeviceState(null);
    }
  }, [phoneManager, initializePhoneControl, onFeatureToggle]);

  const toggleMemoryManager = useCallback(async (enabled: boolean) => {
    setMemoryManagerEnabled(enabled);
    onFeatureToggle?.('memoryManager', enabled);

    if (enabled) {
      const success = await initializeMemoryManager();
      if (!success) {
        setMemoryManagerEnabled(false);
      }
    } else {
      memoryManager?.destroy();
      setMemoryManager(null);
      setMemoryStats(null);
    }
  }, [memoryManager, initializeMemoryManager, onFeatureToggle]);

  const toggleSyncManager = useCallback(async (enabled: boolean) => {
    setSyncManagerEnabled(enabled);
    onFeatureToggle?.('syncManager', enabled);

    if (enabled) {
      const success = await initializeSyncManager();
      if (!success) {
        setSyncManagerEnabled(false);
      }
    } else {
      syncManager?.destroy();
      setSyncManager(null);
      setSyncState(null);
    }
  }, [syncManager, initializeSyncManager, onFeatureToggle]);

  const performSync = useCallback(async () => {
    if (syncManager) {
      setIsLoading(true);
      const success = await syncManager.performSync();
      setIsLoading(false);

      if (success) {
        setSyncState(syncManager.getSyncState());
      }
    }
  }, [syncManager]);

  const clearMemoryCache = useCallback(async () => {
    if (memoryManager) {
      await memoryManager.clear();
      setMemoryStats(memoryManager.getMemoryStats());
      Alert.alert('Success', 'Memory cache cleared');
    }
  }, [memoryManager]);

  const renderPhoneControlSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Phone Control</Text>
        <Switch
          value={phoneControlEnabled}
          onValueChange={togglePhoneControl}
        />
      </View>

      {phoneControlEnabled && deviceState && (
        <View style={styles.sectionContent}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Battery Level:</Text>
            <Text style={styles.statValue}>{Math.round(deviceState.batteryLevel * 100)}%</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Charging:</Text>
            <Text style={styles.statValue}>{deviceState.isCharging ? 'Yes' : 'No'}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Network:</Text>
            <Text style={styles.statValue}>{deviceState.networkType}</Text>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => phoneManager?.vibrate()}
            >
              <Text style={styles.buttonText}>Vibrate</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => phoneManager?.takeScreenshot()}
            >
              <Text style={styles.buttonText}>Screenshot</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  const renderMemorySection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Memory Management</Text>
        <Switch
          value={memoryManagerEnabled}
          onValueChange={toggleMemoryManager}
        />
      </View>

      {memoryManagerEnabled && memoryStats && (
        <View style={styles.sectionContent}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Cache Size:</Text>
            <Text style={styles.statValue}>{Math.round(memoryStats.cacheSize / 1024)} KB</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Memory Pressure:</Text>
            <Text style={[styles.statValue, {
              color: memoryStats.memoryPressure === 'critical' ? '#ff4444' :
                     memoryStats.memoryPressure === 'high' ? '#ff8800' : '#44aa44'
            }]}>
              {memoryStats.memoryPressure.toUpperCase()}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Last Cleanup:</Text>
            <Text style={styles.statValue}>
              {memoryStats.lastCleanup.toLocaleTimeString()}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.actionButton, styles.dangerButton]}
            onPress={clearMemoryCache}
          >
            <Text style={styles.buttonText}>Clear Cache</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderSyncSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Cross-Device Sync</Text>
        <Switch
          value={syncManagerEnabled}
          onValueChange={toggleSyncManager}
        />
      </View>

      {syncManagerEnabled && syncState && (
        <View style={styles.sectionContent}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Status:</Text>
            <Text style={styles.statValue}>
              {syncState.isSyncing ? 'Syncing...' : 'Ready'}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Last Sync:</Text>
            <Text style={styles.statValue}>
              {syncState.lastSyncTime ? syncState.lastSyncTime.toLocaleString() : 'Never'}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Pending Changes:</Text>
            <Text style={styles.statValue}>{syncState.pendingChanges}</Text>
          </View>

          <TouchableOpacity
            style={[styles.actionButton, { opacity: isLoading ? 0.6 : 1 }]}
            onPress={performSync}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sync Now</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Advanced Features</Text>
        <Text style={styles.subtitle}>
          Control your device, manage memory, and sync across devices
        </Text>

        {renderPhoneControlSection()}
        {renderMemorySection()}
        {renderSyncSection()}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            These features require appropriate permissions and may not be available on all devices.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  sectionContent: {
    gap: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default AdvancedFeatures;

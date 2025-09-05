/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Cross-device synchronization management interface.
 * Got it, love.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

import { Colors } from '../../constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { NativeModules } from 'react-native';
import type {
  SyncConfiguration,
  PairedDevice,
  SyncSession,
  TransportType,
  DeviceType
} from '../../components/types/CrossDeviceSyncTypes';

const { CrossDeviceSyncModule } = NativeModules;

type DeviceSyncCardProps = {
  device: PairedDevice;
  onSyncPress: (deviceId: string) => void;
  onUnpairPress: (deviceId: string) => void;
  syncSession?: SyncSession;
};

/**
 * Card component to display a paired device with sync controls
 */
const DeviceSyncCard: React.FC<DeviceSyncCardProps> = ({ 
  device, 
  onSyncPress, 
  onUnpairPress,
  syncSession 
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  // Normalize device type (supports legacy uppercase and new lowercase values)
  const getDeviceIcon = () => {
    const rawType = (device.type || device.deviceType || '').toString().toUpperCase();
    switch (rawType) {
      case 'PHONE':
      case 'PHONE'.toUpperCase():
        return 'phone-portrait';
      case 'TABLET':
        return 'tablet-portrait';
      case 'DESKTOP':
      case 'LAPTOP':
        return 'desktop';
      case 'WEARABLE':
        return 'watch-outline';
      default:
        return 'hardware-chip';
    }
  };
  
  // Get transport icon (normalize legacy uppercase names)
  const getTransportIcon = () => {
    const tt = (device.transportType || '').toString().toUpperCase();
    switch (tt) {
      case 'BLUETOOTH':
        return 'bluetooth' as const;
      case 'WIFI_DIRECT':
      case 'WIFI':
      case 'WIFI_DIRECT'.toUpperCase():
        return 'wifi' as const;
      case 'CLOUD':
        return 'cloud' as const;
      case 'USB':
        return 'hardware-chip' as const;
      default:
        return 'swap-horizontal' as const;
    }
  };
  
  // Format last sync time
  const getLastSyncText = () => {
    const ts = device.lastSyncTime ?? device.lastSeen ?? 0;
    if (!ts || ts === 0) return 'Never synced';
    const date = new Date(typeof ts === 'number' ? ts : new Date(ts).getTime());
    return `Last synced: ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };
  
  return (
    <View style={[styles.deviceCard, { backgroundColor: colors.card }]}>
      <View style={styles.deviceHeader}>
        <View style={styles.deviceInfo}>
          <Ionicons name={getDeviceIcon()} size={24} color={colors.text} style={styles.deviceIcon} />
          <View>
            <Text style={[styles.deviceName, { color: colors.text }]}>{device.name}</Text>
            <View style={styles.transportRow}>
              <Ionicons name={getTransportIcon()} size={16} color={colors.text} style={styles.transportIcon} />
              <Text style={[styles.lastSync, { color: colors.textSecondary }]}>
                {getLastSyncText()}
              </Text>
            </View>
          </View>
        </View>
        
        {syncSession ? (
          <View style={styles.syncStatusContainer}>
            {(syncSession && (syncSession.status === 'TRANSFERRING' || syncSession.status === 'active' || syncSession.status === 'ACTIVE')) ? (
              <>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.syncProgress, { color: colors.primary }]}>
                  {Number(syncSession.progress ?? 0)}%
                </Text>
              </>
            ) : (syncSession.status === 'COMPLETED' || syncSession.status === 'completed' || syncSession.status === 'COMPLETED') ? (
              <Ionicons name="checkmark-circle" size={24} color="green" />
            ) : (syncSession.status === 'FAILED' || syncSession.status === 'failed' || syncSession.status === 'FAILED') ? (
              <Ionicons name="alert-circle" size={24} color="red" />
            ) : (
              <ActivityIndicator size="small" color={colors.primary} />
            )}
          </View>
        ) : (
          <View style={styles.actionsRow}>
            <TouchableOpacity 
              style={[styles.syncButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onSyncPress(device.id);
              }}
            >
              <Text style={styles.syncButtonText}>Sync</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.unpairButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onUnpairPress(device.id);
              }}
            >
              <Ionicons name="trash-outline" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      {syncSession && (syncSession.error || syncSession.status === 'FAILED') && (
        <Text style={[styles.errorText, { color: 'red' }]}>
          {syncSession.error || 'Sync failed'}
        </Text>
      )}
    </View>
  );
};

/**
 * Cross-Device Sync Screen component
 */
export default function CrossDeviceSyncScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [syncConfig, setSyncConfig] = useState<Partial<SyncConfiguration>>({
    syncMemory: true,
    syncPreferences: true,
    syncPersonality: true,
    wifiOnly: true,
    autoSync: true,
    autoSyncInterval: 21600000 // 6 hours
  });
  const [pairedDevices, setPairedDevices] = useState<PairedDevice[]>([]);
  const [syncSessions, setSyncSessions] = useState<Record<string, SyncSession>>({});
  const [isDiscovering, setIsDiscovering] = useState(false);
  
  // Initialize
  useEffect(() => {
    const initSync = async () => {
      try {
        await CrossDeviceSyncModule.initialize();
        const enabled = await CrossDeviceSyncModule.isSyncEnabled();
        setSyncEnabled(enabled);
        
        const config = await CrossDeviceSyncModule.getSyncConfig();
        setSyncConfig(config);
        
        const devices = await CrossDeviceSyncModule.getPairedDevices();
        setPairedDevices(devices);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing sync:', error);
        Alert.alert('Sync Error', 'Failed to initialize sync system.');
        setIsLoading(false);
      }
    };
    
    initSync();
    
    // Setup event listener for sync events
    const eventListener = CrossDeviceSyncModule.addSyncEventListener((event: { type: any; sessionId: string | number; progress: any; error: any; device: { id: any; }; }) => {
      switch (event.type) {
        case 'SyncProgress':
          setSyncSessions(prev => ({
            ...prev,
            [event.sessionId]: {
              ...prev[event.sessionId],
              progress: event.progress
            }
          }));
          break;
        
        case 'SyncCompleted':
          setSyncSessions(prev => ({
            ...prev,
            [event.sessionId]: {
              ...prev[event.sessionId],
              status: 'COMPLETED',
              progress: 100
            }
          }));
          
          // Refresh paired devices to update last sync time
          CrossDeviceSyncModule.getPairedDevices()
            .then((devices: React.SetStateAction<PairedDevice[]>) => setPairedDevices(devices))
            .catch((err: any) => console.error('Failed to refresh devices:', err));
          break;
          
        case 'SyncFailed':
          setSyncSessions(prev => ({
            ...prev,
            [event.sessionId]: {
              ...prev[event.sessionId],
              status: 'FAILED',
              error: event.error
            }
          }));
          break;
          
        case 'DevicePaired':
          // Cast incoming event.device to PairedDevice shape (some native events are partial)
          setPairedDevices(prev => [...prev, (event.device as PairedDevice)]);
          setIsDiscovering(false);
          break;
          
        case 'DeviceUnpaired':
          setPairedDevices(prev => prev.filter(d => d.id !== event.device.id));
          break;
      }
    });
    
    return () => {
      CrossDeviceSyncModule.removeSyncEventListener(eventListener);
    };
  }, []);
  
  // Handle toggle sync
  const handleToggleSync = async (value: boolean) => {
    try {
      await CrossDeviceSyncModule.setSyncEnabled(value);
      setSyncEnabled(value);
      Haptics.notificationAsync(
        value 
          ? Haptics.NotificationFeedbackType.Success 
          : Haptics.NotificationFeedbackType.Warning
      );
    } catch (error) {
      console.error('Error toggling sync:', error);
      Alert.alert('Sync Error', 'Failed to toggle sync.');
    }
  };
  
  // Handle sync config change
  const handleConfigChange = async (key: keyof Partial<SyncConfiguration>, value: boolean) => {
    try {
      const newConfig: Partial<SyncConfiguration> = { ...(syncConfig || {}), [key]: value };
      // Native module expects a plain object; cast to any to accommodate legacy keys
      await CrossDeviceSyncModule.updateSyncConfig(newConfig as any);
      setSyncConfig(newConfig);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Error updating sync config:', error);
      Alert.alert('Sync Error', 'Failed to update sync configuration.');
    }
  };
  
  // Start device discovery
  const handleStartDiscovery = async () => {
    if (isDiscovering) return;
    
    setIsDiscovering(true);
    try {
      await CrossDeviceSyncModule.startDeviceDiscovery();
      // The paired device will be added via the event listener when pairing is completed
    } catch (error) {
      console.error('Error discovering devices:', error);
      Alert.alert('Discovery Error', 'Failed to discover devices.');
      setIsDiscovering(false);
    }
  };
  
  // Sync with device
  const handleSyncWithDevice = async (deviceId: string) => {
    try {
      const sessionId = await CrossDeviceSyncModule.syncWithDevice(deviceId);
      
      // Create initial session state
      const device = pairedDevices.find(d => d.id === deviceId);
      if (device) {
        setSyncSessions(prev => ({
          ...prev,
          [sessionId]: {
            id: sessionId,
            remoteDeviceId: deviceId,
            remoteDeviceName: device.name,
            status: 'PREPARING',
            progress: 0,
            transportType: device.transportType
          }
        }));
      }
    } catch (error) {
      console.error('Error syncing with device:', error);
      Alert.alert('Sync Error', `Failed to sync with device: ${error}`);
    }
  };
  
  // Sync with all devices
  const handleSyncAll = async () => {
    try {
      await CrossDeviceSyncModule.syncWithAllDevices();
    } catch (error) {
      console.error('Error syncing with all devices:', error);
      Alert.alert('Sync Error', 'Failed to sync with all devices.');
    }
  };
  
  // Unpair device
  const handleUnpairDevice = async (deviceId: string) => {
    Alert.alert(
      'Unpair Device',
      'Are you sure you want to unpair this device?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Unpair',
          style: 'destructive',
          onPress: async () => {
            try {
              await CrossDeviceSyncModule.unpairDevice(deviceId);
              setPairedDevices(prev => prev.filter(d => d.id !== deviceId));
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error('Error unpairing device:', error);
              Alert.alert('Unpair Error', 'Failed to unpair device.');
            }
          },
        },
      ]
    );
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingBottom: insets.bottom + 20,
        paddingTop: 20,
      }}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Cross-Device Sync</Text>
        <Switch
          value={syncEnabled}
          onValueChange={handleToggleSync}
          trackColor={{ false: colors.switchTrackFalse, true: colors.switchTrackTrue }}
          thumbColor={colors.switchThumb}
        />
      </View>
      
      {/* Info Card */}
      <BlurView intensity={30} style={[styles.infoCard, { backgroundColor: colors.cardTransparent }]}>
        <Ionicons name="information-circle" size={24} color={colors.primary} style={styles.infoIcon} />
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          Sync your data, preferences, and Sallie's persona across all your devices.
          Enable sync to keep your experience consistent everywhere.
        </Text>
      </BlurView>
      
      {syncEnabled && (
        <>
          {/* Sync Settings */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Sync Settings</Text>
            
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Sync Memory</Text>
              <Switch
                value={syncConfig.syncMemory}
                onValueChange={(value) => handleConfigChange('syncMemory', value)}
                trackColor={{ false: colors.switchTrackFalse, true: colors.switchTrackTrue }}
                thumbColor={colors.switchThumb}
              />
            </View>
            
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Sync Preferences</Text>
              <Switch
                value={syncConfig.syncPreferences}
                onValueChange={(value) => handleConfigChange('syncPreferences', value)}
                trackColor={{ false: colors.switchTrackFalse, true: colors.switchTrackTrue }}
                thumbColor={colors.switchThumb}
              />
            </View>
            
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Sync Personality</Text>
              <Switch
                value={syncConfig.syncPersonality}
                onValueChange={(value) => handleConfigChange('syncPersonality', value)}
                trackColor={{ false: colors.switchTrackFalse, true: colors.switchTrackTrue }}
                thumbColor={colors.switchThumb}
              />
            </View>
            
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>WiFi Only</Text>
              <Switch
                value={syncConfig.wifiOnly}
                onValueChange={(value) => handleConfigChange('wifiOnly', value)}
                trackColor={{ false: colors.switchTrackFalse, true: colors.switchTrackTrue }}
                thumbColor={colors.switchThumb}
              />
            </View>
            
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Auto Sync</Text>
              <Switch
                value={syncConfig.autoSync}
                onValueChange={(value) => handleConfigChange('autoSync', value)}
                trackColor={{ false: colors.switchTrackFalse, true: colors.switchTrackTrue }}
                thumbColor={colors.switchThumb}
              />
            </View>
          </View>
          
          {/* Paired Devices */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Paired Devices</Text>
              {pairedDevices.length > 0 && (
                <TouchableOpacity 
                  style={[styles.syncAllButton, { backgroundColor: colors.primary }]}
                  onPress={handleSyncAll}
                >
                  <Text style={styles.syncAllButtonText}>Sync All</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {pairedDevices.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No devices paired yet
              </Text>
            ) : (
              pairedDevices.map(device => (
                <DeviceSyncCard
                  key={device.id}
                  device={device}
                  onSyncPress={handleSyncWithDevice}
                  onUnpairPress={handleUnpairDevice}
                  syncSession={Object.values(syncSessions).find(
                    session => session.remoteDeviceId === device.id
                  )}
                />
              ))
            )}
            
            <TouchableOpacity 
              style={[styles.addDeviceButton, { borderColor: colors.border }]}
              onPress={handleStartDiscovery}
              disabled={isDiscovering}
            >
              {isDiscovering ? (
                <>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={[styles.addDeviceText, { color: colors.primary }]}>
                    Discovering...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                  <Text style={[styles.addDeviceText, { color: colors.primary }]}>
                    Add New Device
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
          
          {/* Advanced Options */}
          <TouchableOpacity 
            style={[styles.advancedButton, { borderColor: colors.border }]}
            onPress={() => {
              // Navigate to advanced options screen
              // This would be implemented in a real app
              Alert.alert('Advanced Options', 'This would navigate to advanced sync options.');
            }}
          >
            <Text style={[styles.advancedButtonText, { color: colors.text }]}>Advanced Options</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  infoCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
    overflow: 'hidden',
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    marginBottom: 1,
  },
  settingLabel: {
    fontSize: 16,
  },
  deviceCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deviceIcon: {
    marginRight: 12,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
  },
  transportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  transportIcon: {
    marginRight: 6,
  },
  lastSync: {
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  syncButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  unpairButton: {
    padding: 8,
  },
  syncStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncProgress: {
    marginLeft: 8,
    fontWeight: '600',
  },
  errorText: {
    marginTop: 8,
    fontSize: 12,
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
  },
  addDeviceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 12,
    borderStyle: 'dashed',
    padding: 16,
    marginTop: 8,
  },
  addDeviceText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  syncAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  syncAllButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  advancedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  advancedButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

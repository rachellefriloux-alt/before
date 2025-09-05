/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 *
 * Device Control Panel Component - React/TypeScript Version
 * Converted from Vue.js to React Native compatible TSX
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, Switch } from 'react-native';
import { getFirestore, collection, updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { FirebaseApp } from 'firebase/app';

interface DeviceControlPanelProps {
  firebaseApp: FirebaseApp;
  theme?: 'light' | 'dark';
}

interface Device {
  id: string;
  name: string;
  on: boolean;
  type?: string;
  location?: string;
}

interface AnalyticsEvent {
  event: string;
  data: any;
  timestamp: number;
}

const DeviceControlPanel: React.FC<DeviceControlPanelProps> = ({
  firebaseApp,
  theme = 'light'
}) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsEvent[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load devices from Firebase
  useEffect(() => {
    const db = getFirestore(firebaseApp);
    const devicesRef = collection(db, 'devices');

    const unsubscribe = onSnapshot(devicesRef, (snapshot) => {
      const deviceList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Device[];

      setDevices(deviceList);
      logAnalytics('devices_update', { count: deviceList.length });
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [firebaseApp]);

  // Toggle device state
  const toggleDevice = async (device: Device) => {
    setIsLoading(true);
    setError('');

    try {
      const db = getFirestore(firebaseApp);
      const deviceRef = doc(db, 'devices', device.id);
      const newState = !device.on;

      await updateDoc(deviceRef, { on: newState });

      logAnalytics('device_toggle', {
        deviceId: device.id,
        deviceName: device.name,
        oldState: device.on,
        newState
      });

      // Update local state immediately for better UX
      setDevices(prev =>
        prev.map(d =>
          d.id === device.id ? { ...d, on: newState } : d
        )
      );

    } catch (e: any) {
      const errorMsg = 'Device toggle failed.';
      setError(errorMsg);
      logAnalytics('error', { error: errorMsg, deviceId: device.id });
      Alert.alert('Error', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Log analytics event
  const logAnalytics = (event: string, data: any) => {
    const analyticsEvent: AnalyticsEvent = {
      event,
      data,
      timestamp: Date.now()
    };

    setAnalytics(prev => [...prev, analyticsEvent]);
  };

  // Get device icon based on type
  const getDeviceIcon = (device: Device): string => {
    if (device.type === 'light') return '💡';
    if (device.type === 'thermostat') return '🌡️';
    if (device.type === 'lock') return '🔒';
    if (device.type === 'camera') return '📹';
    if (device.type === 'speaker') return '🔊';
    return '📱'; // Default device icon
  };

  // Render device item
  const renderDeviceItem = ({ item }: { item: Device }) => (
    <View style={[styles.deviceItem, theme === 'dark' && styles.deviceItemDark]}>
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceIcon}>{getDeviceIcon(item)}</Text>
        <View style={styles.deviceDetails}>
          <Text style={[styles.deviceName, theme === 'dark' && styles.deviceNameDark]}>
            {item.name}
          </Text>
          {item.location && (
            <Text style={[styles.deviceLocation, theme === 'dark' && styles.deviceLocationDark]}>
              {item.location}
            </Text>
          )}
        </View>
      </View>

      <Switch
        value={item.on}
        onValueChange={() => toggleDevice(item)}
        disabled={isLoading}
        trackColor={{ false: '#767577', true: '#81b0ff' }}
        thumbColor={item.on ? '#f5dd4b' : '#f4f3f4'}
        ios_backgroundColor="#3e3e3e"
      />
    </View>
  );

  return (
    <View style={[styles.container, theme === 'dark' && styles.containerDark]}>
      <Text style={[styles.title, theme === 'dark' && styles.titleDark]}>
        Device Control Panel
      </Text>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}

      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={renderDeviceItem}
        style={styles.deviceList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={[styles.emptyText, theme === 'dark' && styles.emptyTextDark]}>
            No devices found. Add devices to control them here.
          </Text>
        }
      />

      {/* Device summary */}
      <View style={styles.summary}>
        <Text style={[styles.summaryText, theme === 'dark' && styles.summaryTextDark]}>
          {devices.filter(d => d.on).length} of {devices.length} devices are on
        </Text>
      </View>

      {/* Debug info for analytics (can be removed in production) */}
      {__DEV__ && analytics.length > 0 && (
        <View style={styles.debugContainer}>
          <Text style={styles.debugTitle}>Analytics Events: {analytics.length}</Text>
          <Text style={styles.debugText}>
            Last event: {analytics[analytics.length - 1]?.event}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f7fafc',
    borderRadius: 12,
    padding: 16,
    margin: 8,
  },
  containerDark: {
    backgroundColor: '#1a202c',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 16,
    textAlign: 'center',
  },
  titleDark: {
    color: '#e2e8f0',
  },
  errorText: {
    color: '#e53e3e',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#fed7d7',
    borderRadius: 4,
  },
  deviceList: {
    maxHeight: 400,
  },
  deviceItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deviceItemDark: {
    backgroundColor: '#2d3748',
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deviceIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  deviceDetails: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 2,
  },
  deviceNameDark: {
    color: '#e2e8f0',
  },
  deviceLocation: {
    fontSize: 14,
    color: '#718096',
  },
  deviceLocationDark: {
    color: '#a0aec0',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#718096',
    fontStyle: 'italic',
    padding: 40,
  },
  emptyTextDark: {
    color: '#a0aec0',
  },
  summary: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#edf2f7',
    borderRadius: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#4a5568',
    textAlign: 'center',
    fontWeight: '500',
  },
  summaryTextDark: {
    color: '#a0aec0',
  },
  debugContainer: {
    marginTop: 16,
    padding: 8,
    backgroundColor: '#edf2f7',
    borderRadius: 4,
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4a5568',
  },
  debugText: {
    fontSize: 10,
    color: '#718096',
  },
});

export default DeviceControlPanel;

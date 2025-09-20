/*
 * Sallie Sovereign - Device Control Screen
 * Interface for managing device automation and phone control
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useDevice } from '../contexts/DeviceContext';
import { DeviceCapability } from '../../../core/device/DeviceController';

export default function DeviceControlScreen() {
  const { theme } = useTheme();
  const {
    availableCapabilities,
    permissionStatus,
    requestPermissions,
    canPerformAction,
    getInstalledApps,
    getDeviceInfo,
  } = useDevice();

  const [installedApps, setInstalledApps] = useState<any[]>([]);
  const [deviceInfo, setDeviceInfo] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  const styles = createStyles(theme);

  useEffect(() => {
    loadDeviceData();
  }, []);

  const loadDeviceData = async () => {
    try {
      setLoading(true);
      const [apps, info] = await Promise.all([
        getInstalledApps(),
        getDeviceInfo()
      ]);
      
      setInstalledApps(apps);
      setDeviceInfo(info);
    } catch (error) {
      console.error('Failed to load device data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = async (capability: DeviceCapability) => {
    if (permissionStatus[capability.name]) {
      Alert.alert(
        'Permission Already Granted',
        `${capability.name} permission is already enabled.`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Request Permission',
      `Sallie needs ${capability.name} permission to ${capability.description.toLowerCase()}. Grant this permission?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Grant',
          onPress: async () => {
            const granted = await requestPermissions([capability.name]);
            if (!granted) {
              Alert.alert('Permission Denied', 'Permission was not granted. Some features may not work properly.');
            }
          }
        }
      ]
    );
  };

  const getCapabilityIcon = (name: string): keyof typeof Ionicons.glyphMap => {
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
      phone_calls: 'call',
      sms_messages: 'chatbubbles',
      contacts_access: 'people',
      app_management: 'apps',
      system_settings: 'settings',
      notifications: 'notifications',
      device_admin: 'shield-checkmark',
    };
    return iconMap[name] || 'phone-portrait';
  };

  const renderCapabilityItem = ({ item }: { item: DeviceCapability }) => {
    const isGranted = permissionStatus[item.name];
    const isAvailable = item.available;
    
    return (
      <TouchableOpacity
        style={[
          styles.capabilityItem,
          !isAvailable && styles.disabledItem
        ]}
        onPress={() => isAvailable && handlePermissionToggle(item)}
        disabled={!isAvailable}
      >
        <View style={styles.capabilityIcon}>
          <Ionicons
            name={getCapabilityIcon(item.name)}
            size={24}
            color={isAvailable ? (isGranted ? theme.colors.success : theme.colors.warning) : theme.colors.textSecondary}
          />
        </View>
        
        <View style={styles.capabilityContent}>
          <Text style={[styles.capabilityName, !isAvailable && styles.disabledText]}>
            {item.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Text>
          <Text style={[styles.capabilityDescription, !isAvailable && styles.disabledText]}>
            {item.description}
          </Text>
          {!isAvailable && (
            <Text style={styles.unavailableText}>Not available on this platform</Text>
          )}
        </View>
        
        <View style={styles.capabilityStatus}>
          {isAvailable ? (
            <View style={styles.statusIndicator}>
              <Ionicons
                name={isGranted ? 'checkmark-circle' : 'alert-circle'}
                size={20}
                color={isGranted ? theme.colors.success : theme.colors.warning}
              />
              <Text style={[styles.statusText, { color: isGranted ? theme.colors.success : theme.colors.warning }]}>
                {isGranted ? 'Granted' : 'Required'}
              </Text>
            </View>
          ) : (
            <Text style={styles.unavailableText}>N/A</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading device information...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Device Control</Text>
          <Text style={styles.subtitle}>
            Manage device permissions and automation features
          </Text>
        </View>

        {/* Device Status Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status Overview</Text>
          <View style={styles.statusGrid}>
            <View style={styles.statusCard}>
              <Text style={styles.statusValue}>
                {Object.values(permissionStatus).filter(Boolean).length}
              </Text>
              <Text style={styles.statusLabel}>Permissions Granted</Text>
            </View>
            <View style={styles.statusCard}>
              <Text style={styles.statusValue}>
                {availableCapabilities.filter(cap => cap.available).length}
              </Text>
              <Text style={styles.statusLabel}>Available Features</Text>
            </View>
            <View style={styles.statusCard}>
              <Text style={styles.statusValue}>
                {installedApps.length}
              </Text>
              <Text style={styles.statusLabel}>Installed Apps</Text>
            </View>
          </View>
        </View>

        {/* Capabilities List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Device Capabilities</Text>
          <FlatList
            data={availableCapabilities}
            renderItem={renderCapabilityItem}
            keyExtractor={(item) => item.name}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                !canPerformAction('system_settings') && styles.disabledButton
              ]}
              disabled={!canPerformAction('system_settings')}
            >
              <Ionicons name="wifi" size={24} color={theme.colors.primary} />
              <Text style={styles.actionText}>Toggle WiFi</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                !canPerformAction('system_settings') && styles.disabledButton
              ]}
              disabled={!canPerformAction('system_settings')}
            >
              <Ionicons name="bluetooth" size={24} color={theme.colors.primary} />
              <Text style={styles.actionText}>Toggle Bluetooth</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                !canPerformAction('phone_calls') && styles.disabledButton
              ]}
              disabled={!canPerformAction('phone_calls')}
            >
              <Ionicons name="call" size={24} color={theme.colors.primary} />
              <Text style={styles.actionText}>Emergency Call</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                !canPerformAction('app_management') && styles.disabledButton
              ]}
              disabled={!canPerformAction('app_management')}
            >
              <Ionicons name="apps" size={24} color={theme.colors.primary} />
              <Text style={styles.actionText}>App Launcher</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Device Information */}
        {Object.keys(deviceInfo).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Device Information</Text>
            <View style={styles.infoContainer}>
              {Object.entries(deviceInfo).map(([key, value]) => (
                <View key={key} style={styles.infoRow}>
                  <Text style={styles.infoKey}>
                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                  </Text>
                  <Text style={styles.infoValue}>{String(value)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.md,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    header: {
      marginBottom: theme.spacing.xl,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    statusGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    statusCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      alignItems: 'center',
      flex: 1,
      marginHorizontal: theme.spacing.xs,
    },
    statusValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: 4,
    },
    statusLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    capabilityItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    disabledItem: {
      opacity: 0.6,
    },
    capabilityIcon: {
      marginRight: theme.spacing.md,
    },
    capabilityContent: {
      flex: 1,
    },
    capabilityName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    capabilityDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    disabledText: {
      color: theme.colors.textSecondary,
      opacity: 0.7,
    },
    unavailableText: {
      fontSize: 12,
      color: theme.colors.warning,
      fontStyle: 'italic',
    },
    capabilityStatus: {
      alignItems: 'center',
    },
    statusIndicator: {
      alignItems: 'center',
    },
    statusText: {
      fontSize: 12,
      marginTop: 4,
      fontWeight: '500',
    },
    actionGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    actionButton: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      alignItems: 'center',
      width: '48%',
      marginBottom: theme.spacing.md,
    },
    disabledButton: {
      opacity: 0.5,
    },
    actionText: {
      fontSize: 14,
      color: theme.colors.text,
      marginTop: theme.spacing.sm,
      textAlign: 'center',
    },
    infoContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    infoKey: {
      fontSize: 14,
      color: theme.colors.text,
      flex: 1,
    },
    infoValue: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      flex: 1,
      textAlign: 'right',
    },
  });
}
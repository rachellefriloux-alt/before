import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, ScrollView } from 'react-native';
import * as Brightness from 'expo-brightness';
import * as Battery from 'expo-battery';
import * as Network from 'expo-network';
import EnhancedAndroidLauncher, { SystemInfo } from './utils/EnhancedAndroidLauncher';

interface SystemControlPanelProps {
  launcher: EnhancedAndroidLauncher | null;
  isEnhanced: boolean;
  systemInfo: SystemInfo | null;
  onSystemInfoUpdate: (info: SystemInfo) => void;
}

export default function SystemControlPanel({ 
  launcher, 
  isEnhanced, 
  systemInfo, 
  onSystemInfoUpdate 
}: SystemControlPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [quickActions, setQuickActions] = useState([
    { id: 'optimize', title: 'System Optimize', icon: '⚡', enabled: true },
    { id: 'cleanup', title: 'Cache Cleanup', icon: '🧹', enabled: true },
    { id: 'battery_save', title: 'Battery Saver', icon: '🔋', enabled: false },
    { id: 'ai_assist', title: 'AI Assistant', icon: '🧠', enabled: true },
  ]);

  const adjustBrightness = async (delta: number) => {
    if (!isEnhanced) return;
    
    try {
      setIsLoading(true);
      const currentBrightness = await Brightness.getBrightnessAsync();
      const newBrightness = Math.max(0, Math.min(1, currentBrightness + delta));
      await Brightness.setBrightnessAsync(newBrightness);
      
      if (systemInfo) {
        const updatedInfo = { ...systemInfo, brightness: newBrightness };
        onSystemInfoUpdate(updatedInfo);
      }
    } catch (error) {
      console.error('Failed to adjust brightness:', error);
      Alert.alert('Error', 'Failed to adjust brightness');
    } finally {
      setIsLoading(false);
    }
  };

  const performSystemOptimization = async () => {
    if (!launcher || !isEnhanced) return;
    
    try {
      setIsLoading(true);
      const success = await launcher.optimizeSystem();
      
      if (success) {
        Alert.alert('Success', 'System optimization completed!');
        // Refresh system info
        const newSystemInfo = launcher.getSystemInfo();
        if (newSystemInfo) {
          onSystemInfoUpdate(newSystemInfo);
        }
      } else {
        Alert.alert('Error', 'System optimization failed');
      }
    } catch (error) {
      console.error('System optimization failed:', error);
      Alert.alert('Error', 'System optimization failed');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleQuickAction = (actionId: string) => {
    setQuickActions(actions => 
      actions.map(action => 
        action.id === actionId 
          ? { ...action, enabled: !action.enabled }
          : action
      )
    );

    // Handle specific actions
    switch (actionId) {
      case 'battery_save':
        handleBatterySaver();
        break;
      case 'ai_assist':
        handleAIAssistant();
        break;
    }
  };

  const handleBatterySaver = async () => {
    if (!isEnhanced) return;
    
    try {
      // Reduce brightness for battery saving
      await Brightness.setBrightnessAsync(0.3);
      Alert.alert('Battery Saver', 'Battery optimization mode activated');
    } catch (error) {
      console.error('Failed to activate battery saver:', error);
    }
  };

  const handleAIAssistant = () => {
    Alert.alert(
      'AI Assistant', 
      'AI Assistant is ready to help optimize your device usage patterns!',
      [{ text: 'OK' }]
    );
  };

  const getSystemHealthColor = () => {
    if (!systemInfo) return '#4CAF50';
    
    const batteryHealth = systemInfo.batteryLevel > 20 ? 1 : 0.5;
    const memoryHealth = 0.8; // Would be calculated from actual memory usage
    const overallHealth = (batteryHealth + memoryHealth) / 2;
    
    if (overallHealth > 0.8) return '#4CAF50';
    if (overallHealth > 0.5) return '#FF9800';
    return '#FF4444';
  };

  const getSystemHealthPercentage = () => {
    if (!systemInfo) return 85;
    
    const batteryScore = systemInfo.batteryLevel;
    const networkScore = systemInfo.networkInfo.isWifiConnected ? 90 : 70;
    const brightnessScore = systemInfo.brightness > 0.1 ? 80 : 60;
    
    return Math.round((batteryScore + networkScore + brightnessScore) / 3);
  };

  if (!isEnhanced) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          ⚙️ System controls require enhanced mode
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>⚙️ System Control Center</Text>
        <View style={[styles.healthIndicator, { backgroundColor: getSystemHealthColor() }]}>
          <Text style={styles.healthText}>{getSystemHealthPercentage()}%</Text>
        </View>
      </View>

      {systemInfo && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* System Status Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 System Status</Text>
            <View style={styles.statusGrid}>
              <View style={styles.statusCard}>
                <Text style={styles.statusIcon}>🔋</Text>
                <Text style={styles.statusLabel}>Battery</Text>
                <Text style={styles.statusValue}>
                  {systemInfo.batteryLevel}%
                </Text>
                <Text style={styles.statusDetail}>
                  {systemInfo.batteryCharging ? 'Charging' : 'Discharging'}
                </Text>
              </View>

              <View style={styles.statusCard}>
                <Text style={styles.statusIcon}>📶</Text>
                <Text style={styles.statusLabel}>Network</Text>
                <Text style={styles.statusValue}>
                  {systemInfo.networkInfo.isWifiConnected ? 'WiFi' : 'Mobile'}
                </Text>
                <Text style={styles.statusDetail}>
                  Signal: {systemInfo.networkInfo.signalStrength}/4
                </Text>
              </View>

              <View style={styles.statusCard}>
                <Text style={styles.statusIcon}>💡</Text>
                <Text style={styles.statusLabel}>Brightness</Text>
                <Text style={styles.statusValue}>
                  {Math.round(systemInfo.brightness * 100)}%
                </Text>
                <View style={styles.brightnessControls}>
                  <TouchableOpacity 
                    style={styles.brightnessButton}
                    onPress={() => adjustBrightness(-0.2)}
                    disabled={isLoading}
                  >
                    <Text style={styles.brightnessButtonText}>-</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.brightnessButton}
                    onPress={() => adjustBrightness(0.2)}
                    disabled={isLoading}
                  >
                    <Text style={styles.brightnessButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Quick Actions Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={[
                    styles.quickActionCard,
                    { backgroundColor: action.enabled ? '#4CAF50' : '#2a2a2a' }
                  ]}
                  onPress={() => {
                    if (action.id === 'optimize') {
                      performSystemOptimization();
                    } else {
                      toggleQuickAction(action.id);
                    }
                  }}
                  disabled={isLoading}
                >
                  <Text style={styles.quickActionIcon}>{action.icon}</Text>
                  <Text style={styles.quickActionTitle}>{action.title}</Text>
                  {action.id !== 'optimize' && action.id !== 'cleanup' && (
                    <Switch
                      value={action.enabled}
                      onValueChange={() => toggleQuickAction(action.id)}
                      trackColor={{ false: '#444444', true: '#FFFFFF' }}
                      thumbColor={action.enabled ? '#4CAF50' : '#CCCCCC'}
                      style={styles.quickActionSwitch}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Advanced Controls Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔧 Advanced Controls</Text>
            <View style={styles.advancedControls}>
              <TouchableOpacity 
                style={styles.advancedButton}
                onPress={() => Alert.alert('Info', 'Connectivity settings would open here')}
              >
                <Text style={styles.advancedButtonIcon}>📶</Text>
                <Text style={styles.advancedButtonText}>Network Settings</Text>
                <Text style={styles.advancedButtonArrow}>→</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.advancedButton}
                onPress={() => Alert.alert('Info', 'Volume controls would open here')}
              >
                <Text style={styles.advancedButtonIcon}>🔊</Text>
                <Text style={styles.advancedButtonText}>Volume Control</Text>
                <Text style={styles.advancedButtonArrow}>→</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.advancedButton}
                onPress={() => Alert.alert('Info', 'Power management would open here')}
              >
                <Text style={styles.advancedButtonIcon}>⚡</Text>
                <Text style={styles.advancedButtonText}>Power Management</Text>
                <Text style={styles.advancedButtonArrow}>→</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    margin: 10,
    padding: 15,
    maxHeight: 500,
  },
  emptyContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    margin: 10,
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  healthIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  healthText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 2,
  },
  statusIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  statusLabel: {
    color: '#AAAAAA',
    fontSize: 10,
    marginBottom: 2,
  },
  statusValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statusDetail: {
    color: '#888888',
    fontSize: 8,
  },
  brightnessControls: {
    flexDirection: 'row',
    marginTop: 4,
  },
  brightnessButton: {
    backgroundColor: '#444444',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  brightnessButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  quickActionTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  quickActionSwitch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  advancedControls: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    overflow: 'hidden',
  },
  advancedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  advancedButtonIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  advancedButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    flex: 1,
  },
  advancedButtonArrow: {
    color: '#AAAAAA',
    fontSize: 16,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});
/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: DeviceControlDemo - Comprehensive device control demonstration.
 * Got it, love.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  Dimensions,
  Platform
} from 'react-native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import * as Brightness from 'expo-brightness';
import * as Battery from 'expo-battery';
import * as Device from 'expo-device';
import DeviceVoiceController from './DeviceVoiceController';
import { godModeManager } from '../../../core/GodModeManager';

const { width } = Dimensions.get('window');

interface DeviceState {
  brightness: number;
  batteryLevel: number;
  isCharging: boolean;
  audioMode: 'normal' | 'silent' | 'vibrate';
  hapticEnabled: boolean;
  voiceEnabled: boolean;
}

const DeviceControlDemo: React.FC = () => {
  const [deviceState, setDeviceState] = useState<DeviceState>({
    brightness: 0.5,
    batteryLevel: 0,
    isCharging: false,
    audioMode: 'normal',
    hapticEnabled: true,
    voiceEnabled: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [voiceCommands, setVoiceCommands] = useState<string[]>([]);

  useEffect(() => {
    initializeDeviceState();
    setupBatteryListener();

    return () => {
      // Cleanup
    };
  }, []);

  const initializeDeviceState = async () => {
    try {
      // Get current brightness
      if (Platform.OS !== 'web') {
        const brightness = await Brightness.getBrightnessAsync();
        setDeviceState(prev => ({ ...prev, brightness }));
      }

      // Get battery info
      const batteryLevel = await Battery.getBatteryLevelAsync();
      const batteryState = await Battery.getBatteryStateAsync();

      setDeviceState(prev => ({
        ...prev,
        batteryLevel,
        isCharging: batteryState === Battery.BatteryState.CHARGING
      }));

    } catch (error) {
      console.error('Failed to initialize device state:', error);
    }
  };

  const setupBatteryListener = () => {
    const batteryListener = Battery.addBatteryStateListener(({ batteryState }) => {
      setDeviceState(prev => ({
        ...prev,
        isCharging: batteryState === Battery.BatteryState.CHARGING
      }));
    });

    const levelListener = Battery.addBatteryLevelListener(({ batteryLevel }) => {
      setDeviceState(prev => ({ ...prev, batteryLevel }));
    });

    return () => {
      batteryListener.remove();
      levelListener.remove();
    };
  };

  const handleBrightnessChange = async (value: number) => {
    if (Platform.OS === 'web') return;

    try {
      setIsLoading(true);
      await Brightness.setBrightnessAsync(value);
      setDeviceState(prev => ({ ...prev, brightness: value }));

      if (deviceState.hapticEnabled) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to change brightness');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHapticFeedback = async (style: 'light' | 'medium' | 'heavy') => {
    if (!deviceState.hapticEnabled) return;

    try {
      switch (style) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
      }
    } catch (error) {
      console.error('Haptic feedback failed:', error);
    }
  };

  const handleAudioModeChange = async (mode: 'normal' | 'silent' | 'vibrate') => {
    try {
      setDeviceState(prev => ({ ...prev, audioMode: mode }));

      if (deviceState.hapticEnabled) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert('Audio Mode Changed', `Switched to ${mode} mode`);
    } catch (error) {
      console.error('Audio mode change failed:', error);
    }
  };

  const handleVoiceCommand = async (command: string, params?: any) => {
    setVoiceCommands(prev => [...prev.slice(-4), `${command}${params ? ` (${JSON.stringify(params)})` : ''}`]);

    switch (command) {
      case 'wake_up':
        if (deviceState.hapticEnabled) {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        break;
      case 'goodbye':
        if (deviceState.hapticEnabled) {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        break;
      case 'status':
        const batteryPercent = (deviceState.batteryLevel * 100).toFixed(0);
        const chargingStatus = deviceState.isCharging ? ' (Charging)' : '';
        const brightnessInfo = Platform.OS !== 'web' ? `\nBrightness: ${(deviceState.brightness * 100).toFixed(0)}%` : '';

        Alert.alert(
          'Device Status',
          `Battery: ${batteryPercent}%${chargingStatus}${brightnessInfo}\nAudio Mode: ${deviceState.audioMode}`,
          [
            {
              text: 'Run Diagnostics',
              onPress: runDeviceDiagnostics
            },
            { text: 'OK' }
          ]
        );
        break;
      case 'native_routine':
        const routineName = params?.routineName || 'unknown';
        if (deviceState.hapticEnabled) {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        Alert.alert('Routine Triggered', `Starting ${routineName} routine`, [
          {
            text: 'View Progress',
            onPress: () => {
              console.log('Navigate to routine progress screen');
              // TODO: Implement navigation to routine progress
            }
          },
          { text: 'OK' }
        ]);
        break;
      case 'native_theme':
        const themeName = params?.themeName || 'default';
        if (deviceState.hapticEnabled) {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        Alert.alert('Theme Changed', `Switched to ${themeName} theme`, [
          {
            text: 'View Theme',
            onPress: () => {
              console.log('Navigate to theme preview screen');
              // TODO: Implement navigation to theme preview
            }
          },
          { text: 'OK' }
        ]);
        break;
      case 'native_godmode':
        try {
          const userId = 'default_user'; // TODO: Get from user context/store
          const godModeSuccess = await godModeManager.activateGodMode(userId, 'Demo activation');

          if (godModeSuccess) {
            const features = godModeManager.getEnabledFeatures();
            const featureCount = features.length;
            const featureNames = features.map(f => f.name).join(', ');

            // Provide haptic feedback for God-Mode activation
            if (deviceState.hapticEnabled) {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }

            Alert.alert(
              'God-Mode Activated! ⚡',
              `Advanced features enabled!\n\n${featureCount} features activated:\n${featureNames}`,
              [
                {
                  text: 'Manage Features',
                  onPress: () => {
                    console.log('Navigate to God-Mode management screen');
                    // TODO: Implement navigation to God-Mode management
                  }
                },
                { text: 'OK' }
              ]
            );
          } else {
            Alert.alert('God-Mode Activation Failed', 'Could not activate God-Mode. Please try again.');
          }
        } catch (error) {
          console.error('Error activating God-Mode:', error);
          Alert.alert('Error', 'An error occurred while activating God-Mode.');
        }
        break;
    }
  };

  const runDeviceDiagnostics = async () => {
    try {
      setIsLoading(true);

      const diagnostics = {
        device: Device.deviceName || 'Unknown',
        os: `${Device.osName} ${Device.osVersion}`,
        platform: Platform.OS,
        battery: `${(deviceState.batteryLevel * 100).toFixed(0)}%`,
        charging: deviceState.isCharging ? 'Yes' : 'No',
        brightness: Platform.OS !== 'web' ? `${(deviceState.brightness * 100).toFixed(0)}%` : 'N/A'
      };

      const message = Object.entries(diagnostics)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');

      Alert.alert('Device Diagnostics', message);

      if (deviceState.hapticEnabled) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to run diagnostics');
    } finally {
      setIsLoading(false);
    }
  };

  const emergencyStop = async () => {
    try {
      setIsLoading(true);

      // Stop all active features
      setDeviceState(prev => ({
        ...prev,
        voiceEnabled: false,
        audioMode: 'normal'
      }));

      if (Platform.OS !== 'web') {
        await Brightness.setBrightnessAsync(0.5); // Reset to 50%
      }

      Alert.alert('Emergency Stop', 'All device controls have been reset to safe defaults.');

      if (deviceState.hapticEnabled) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to perform emergency stop');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Device Control Demo</Text>
      <Text style={styles.subtitle}>Experience comprehensive device integration</Text>

      {/* Device Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Device Status</Text>
        <View style={styles.statusGrid}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Battery</Text>
            <Text style={styles.statusValue}>
              {(deviceState.batteryLevel * 100).toFixed(0)}%
              {deviceState.isCharging && ' ⚡'}
            </Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Brightness</Text>
            <Text style={styles.statusValue}>
              {Platform.OS !== 'web' ? `${(deviceState.brightness * 100).toFixed(0)}%` : 'N/A'}
            </Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Audio Mode</Text>
            <Text style={styles.statusValue}>{deviceState.audioMode}</Text>
          </View>
        </View>
      </View>

      {/* Brightness Control */}
      {Platform.OS !== 'web' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Brightness Control</Text>
          <View style={styles.sliderContainer}>
            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() => handleBrightnessChange(Math.max(0.1, deviceState.brightness - 0.1))}
            >
              <Text style={styles.sliderButtonText}>-</Text>
            </TouchableOpacity>

            <View style={styles.sliderTrack}>
              <View
                style={[
                  styles.sliderFill,
                  { width: `${deviceState.brightness * 100}%` }
                ]}
              />
            </View>

            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() => handleBrightnessChange(Math.min(1, deviceState.brightness + 0.1))}
            >
              <Text style={styles.sliderButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Haptic Feedback */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Haptic Feedback</Text>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Enable Haptics</Text>
          <Switch
            value={deviceState.hapticEnabled}
            onValueChange={(value) =>
              setDeviceState(prev => ({ ...prev, hapticEnabled: value }))
            }
          />
        </View>

        {deviceState.hapticEnabled && (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.hapticButton}
              onPress={() => handleHapticFeedback('light')}
            >
              <Text style={styles.buttonText}>Light</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.hapticButton}
              onPress={() => handleHapticFeedback('medium')}
            >
              <Text style={styles.buttonText}>Medium</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.hapticButton}
              onPress={() => handleHapticFeedback('heavy')}
            >
              <Text style={styles.buttonText}>Heavy</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Audio Mode */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Audio Mode</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              deviceState.audioMode === 'normal' && styles.modeButtonActive
            ]}
            onPress={() => handleAudioModeChange('normal')}
          >
            <Text style={styles.buttonText}>Normal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeButton,
              deviceState.audioMode === 'silent' && styles.modeButtonActive
            ]}
            onPress={() => handleAudioModeChange('silent')}
          >
            <Text style={styles.buttonText}>Silent</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeButton,
              deviceState.audioMode === 'vibrate' && styles.modeButtonActive
            ]}
            onPress={() => handleAudioModeChange('vibrate')}
          >
            <Text style={styles.buttonText}>Vibrate</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Voice Control */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Voice Control</Text>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Enable Voice Commands</Text>
          <Switch
            value={deviceState.voiceEnabled}
            onValueChange={(value) =>
              setDeviceState(prev => ({ ...prev, voiceEnabled: value }))
            }
          />
        </View>

        {deviceState.voiceEnabled && (
          <DeviceVoiceController
            autoStart={true}
            onVoiceCommand={handleVoiceCommand}
          />
        )}

        {voiceCommands.length > 0 && (
          <View style={styles.voiceLog}>
            <Text style={styles.voiceLogTitle}>Recent Commands:</Text>
            {voiceCommands.map((command, index) => (
              <Text key={index} style={styles.voiceLogItem}>• {command}</Text>
            ))}
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionButton, isLoading && styles.buttonDisabled]}
            onPress={runDeviceDiagnostics}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Running...' : 'Run Diagnostics'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.emergencyButton, isLoading && styles.buttonDisabled]}
            onPress={emergencyStop}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Emergency Stop</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 5,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  section: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusItem: {
    alignItems: 'center',
    flex: 1,
  },
  statusLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  sliderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  sliderButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  sliderTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  hapticButton: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  modeButton: {
    backgroundColor: '#8E8E93',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#007AFF',
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  emergencyButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  voiceLog: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  voiceLogTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  voiceLogItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
});

export default DeviceControlDemo;

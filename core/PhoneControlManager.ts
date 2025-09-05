/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Advanced phone control and device management system.
 * Got it, love.
 */

import { NativeModules, Platform, DeviceEventEmitter } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Battery from 'expo-battery';
import * as Device from 'expo-device';
import * as Network from 'expo-network';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { PermissionsAndroid } from 'react-native';

interface PhoneControlConfig {
  enableBatteryOptimization: boolean;
  enableLocationTracking: boolean;
  enableNetworkMonitoring: boolean;
  enableNotificationManagement: boolean;
  vibrationIntensity: 'light' | 'medium' | 'heavy';
  screenTimeout: number; // in minutes
}

interface DeviceState {
  batteryLevel: number;
  isCharging: boolean;
  networkType: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null;
  isScreenOn: boolean;
  brightness: number;
  volume: number;
  airplaneMode: boolean;
  wifiEnabled: boolean;
  bluetoothEnabled: boolean;
}

class PhoneControlManager {
  private config: PhoneControlConfig;
  private deviceState: DeviceState;
  private batterySubscription: any;
  private locationSubscription: any;
  private networkSubscription: any;

  constructor(config: Partial<PhoneControlConfig> = {}) {
    this.config = {
      enableBatteryOptimization: true,
      enableLocationTracking: false,
      enableNetworkMonitoring: true,
      enableNotificationManagement: true,
      vibrationIntensity: 'medium',
      screenTimeout: 5,
      ...config
    };

    this.deviceState = {
      batteryLevel: 0,
      isCharging: false,
      networkType: 'unknown',
      location: null,
      isScreenOn: true,
      brightness: 0.5,
      volume: 0.7,
      airplaneMode: false,
      wifiEnabled: true,
      bluetoothEnabled: false
    };

    this.initialize();
  }

  private async initialize() {
    await this.requestPermissions();
    await this.setupSubscriptions();
    await this.updateDeviceState();
  }

  private async requestPermissions() {
    if (Platform.OS === 'android' && PermissionsAndroid && PermissionsAndroid.requestMultiple) {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
        PermissionsAndroid.PERMISSIONS.WRITE_SETTINGS,
      ]);
    }

    if (this.config.enableLocationTracking) {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Location permission denied');
      }
    }
  }

  private async setupSubscriptions() {
    // Battery monitoring
    if (this.config.enableBatteryOptimization) {
      this.batterySubscription = Battery.addBatteryStateListener((state) => {
        this.deviceState.isCharging = state.batteryState === Battery.BatteryState.CHARGING;
        this.updateDeviceState();
      });

      const batteryLevel = await Battery.getBatteryLevelAsync();
      this.deviceState.batteryLevel = batteryLevel;
    }

    // Network monitoring
    if (this.config.enableNetworkMonitoring) {
      this.networkSubscription = Network.addNetworkStateListener((state) => {
        this.deviceState.networkType = state.type || 'unknown';
        this.deviceState.wifiEnabled = (state.isConnected || false) && state.type === Network.NetworkStateType.WIFI;
        this.updateDeviceState();
      });
    }

    // Location tracking
    if (this.config.enableLocationTracking) {
      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 30000, // 30 seconds
          distanceInterval: 100, // 100 meters
        },
        (location) => {
          this.deviceState.location = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy || 0,
          };
          this.updateDeviceState();
        }
      );
    }
  }

  private async updateDeviceState() {
    // Emit device state changes
    DeviceEventEmitter.emit('deviceStateChanged', this.deviceState);
  }

  // Phone Control Methods
  async setScreenBrightness(level: number) {
    if (Platform.OS === 'android') {
      // Use Android intent to set brightness
      const intent = {
        action: 'android.settings.DISPLAY_SETTINGS',
        // Note: Actual brightness control requires system permissions
      };
      await IntentLauncher.startActivityAsync('android.settings.DISPLAY_SETTINGS');
    }
  }

  async setScreenTimeout(minutes: number) {
    if (Platform.OS === 'android') {
      await IntentLauncher.startActivityAsync('android.settings.SOUND_SETTINGS');
    }
    this.config.screenTimeout = minutes;
  }

  async toggleAirplaneMode() {
    if (Platform.OS === 'android') {
      await IntentLauncher.startActivityAsync('android.settings.AIRPLANE_MODE_SETTINGS');
    }
  }

  async toggleWifi() {
    if (Platform.OS === 'android') {
      await IntentLauncher.startActivityAsync('android.settings.WIFI_SETTINGS');
    }
  }

  async toggleBluetooth() {
    if (Platform.OS === 'android') {
      await IntentLauncher.startActivityAsync('android.settings.BLUETOOTH_SETTINGS');
    }
  }

  async vibrate(pattern: number[] = [0, 100, 50, 100]) {
    // Use expo-haptics for vibration
    const Haptics = require('expo-haptics');
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  async setVolume(level: number) {
    if (Platform.OS === 'android') {
      await IntentLauncher.startActivityAsync('android.settings.SOUND_SETTINGS');
    }
    this.deviceState.volume = level;
  }

  async openApp(packageName: string) {
    if (Platform.OS === 'android') {
      try {
        await IntentLauncher.startActivityAsync(packageName);
      } catch (error) {
        console.warn(`Failed to open app: ${packageName}`, error);
      }
    }
  }

  async killApp(packageName: string) {
    if (Platform.OS === 'android') {
      // This requires system permissions and is not directly available
      // Would need to use Android's ActivityManager
      console.warn('App killing requires system permissions');
    }
  }

  async getInstalledApps() {
    // This would require additional native module implementation
    return [];
  }

  async takeScreenshot() {
    if (Platform.OS === 'android') {
      // Use Android's screenshot functionality
      const intent = {
        action: 'android.intent.action.TAKE_SCREENSHOT',
      };
      await IntentLauncher.startActivityAsync('android.intent.action.TAKE_SCREENSHOT');
    }
  }

  // Device State Getters
  getDeviceState(): DeviceState {
    return { ...this.deviceState };
  }

  getBatteryInfo() {
    return {
      level: this.deviceState.batteryLevel,
      isCharging: this.deviceState.isCharging,
    };
  }

  getNetworkInfo() {
    return {
      type: this.deviceState.networkType,
      wifiEnabled: this.deviceState.wifiEnabled,
    };
  }

  getLocationInfo() {
    return this.deviceState.location;
  }

  // Configuration
  updateConfig(newConfig: Partial<PhoneControlConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.initialize(); // Reinitialize with new config
  }

  getConfig(): PhoneControlConfig {
    return { ...this.config };
  }

  // Cleanup
  destroy() {
    try {
      if (this.batterySubscription && typeof this.batterySubscription.remove === 'function') {
        this.batterySubscription.remove();
        this.batterySubscription = null;
      }
      
      if (this.locationSubscription && typeof this.locationSubscription.remove === 'function') {
        this.locationSubscription.remove();
        this.locationSubscription = null;
      }
      
      if (this.networkSubscription && typeof this.networkSubscription.remove === 'function') {
        this.networkSubscription.remove();
        this.networkSubscription = null;
      }
    } catch (error) {
      console.warn('Error cleaning up PhoneControlManager subscriptions:', error);
    }
  }
}

export default PhoneControlManager;
export type { PhoneControlConfig, DeviceState };

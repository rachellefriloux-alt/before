import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';
import { Dimensions, Platform } from 'react-native';

const storage = new MMKV();

interface DeviceInfo {
  platform: 'ios' | 'android' | 'web';
  version: string;
  deviceId: string;
  deviceName: string;
  screenWidth: number;
  screenHeight: number;
  isTablet: boolean;
  hasNotch: boolean;
  statusBarHeight: number;
}

interface ConnectivityInfo {
  isConnected: boolean;
  connectionType: 'wifi' | 'cellular' | 'ethernet' | 'bluetooth' | 'unknown';
  isInternetReachable: boolean;
}

interface PermissionsState {
  camera: 'granted' | 'denied' | 'undetermined';
  microphone: 'granted' | 'denied' | 'undetermined';
  location: 'granted' | 'denied' | 'undetermined';
  notifications: 'granted' | 'denied' | 'undetermined';
  contacts: 'granted' | 'denied' | 'undetermined';
  storage: 'granted' | 'denied' | 'undetermined';
}

interface DeviceState {
  deviceInfo: DeviceInfo;
  connectivity: ConnectivityInfo;
  permissions: PermissionsState;
  isLowPowerMode: boolean;
  batteryLevel: number; // 0-1
  orientation: 'portrait' | 'landscape';
  isKeyboardVisible: boolean;
  isLauncher: boolean;
  settings: {
    hapticFeedback: boolean;
    soundEnabled: boolean;
    darkMode: boolean;
    animations: boolean;
    notificationsEnabled: boolean;
  };
  safeAreaInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };

  // Actions
  updateDeviceInfo: (info: Partial<DeviceInfo>) => void;
  updateConnectivity: (connectivity: Partial<ConnectivityInfo>) => void;
  updatePermission: (permission: keyof PermissionsState, status: PermissionsState[keyof PermissionsState]) => void;
  setLowPowerMode: (enabled: boolean) => void;
  setBatteryLevel: (level: number) => void;
  setOrientation: (orientation: 'portrait' | 'landscape') => void;
  setKeyboardVisible: (visible: boolean) => void;
  updateSafeAreaInsets: (insets: Partial<DeviceState['safeAreaInsets']>) => void;
  getDeviceCapabilities: () => {
    hasCamera: boolean;
    hasMicrophone: boolean;
    hasGPS: boolean;
    hasBiometrics: boolean;
    supportsNotifications: boolean;
  };
}

const { width, height } = Dimensions.get('window');

const defaultDeviceInfo: DeviceInfo = {
  platform: Platform.OS as 'ios' | 'android' | 'web',
  version: Platform.Version?.toString() || '0',
  deviceId: 'unknown',
  deviceName: 'Unknown Device',
  screenWidth: width,
  screenHeight: height,
  isTablet: Math.min(width, height) >= 768,
  hasNotch: false,
  statusBarHeight: Platform.OS === 'ios' ? 44 : 24,
};

const defaultConnectivity: ConnectivityInfo = {
  isConnected: true,
  connectionType: 'unknown',
  isInternetReachable: true,
};

const defaultPermissions: PermissionsState = {
  camera: 'undetermined',
  microphone: 'undetermined',
  location: 'undetermined',
  notifications: 'undetermined',
  contacts: 'undetermined',
  storage: 'undetermined',
};

export const useDeviceStore = create<DeviceState>()(
  persist(
    (set, get) => ({
      deviceInfo: defaultDeviceInfo,
      connectivity: defaultConnectivity,
      permissions: defaultPermissions,
      isLowPowerMode: false,
      batteryLevel: 1.0,
      orientation: width > height ? 'landscape' : 'portrait',
      isKeyboardVisible: false,
      isLauncher: true,
      settings: {
        hapticFeedback: true,
        soundEnabled: true,
        darkMode: true,
        animations: true,
        notificationsEnabled: true,
      },
      safeAreaInsets: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      },

      updateDeviceInfo: (info) => set((state) => ({
        deviceInfo: { ...state.deviceInfo, ...info },
      })),

      updateConnectivity: (connectivity) => set((state) => ({
        connectivity: { ...state.connectivity, ...connectivity },
      })),

      updatePermission: (permission, status) => set((state) => ({
        permissions: { ...state.permissions, [permission]: status },
      })),

      setLowPowerMode: (enabled) => set({
        isLowPowerMode: enabled,
      }),

      setBatteryLevel: (level) => set({
        batteryLevel: Math.max(0, Math.min(1, level)),
      }),

      setOrientation: (orientation) => set({
        orientation,
      }),

      setKeyboardVisible: (visible) => set({
        isKeyboardVisible: visible,
      }),

      updateSafeAreaInsets: (insets) => set((state) => ({
        safeAreaInsets: { ...state.safeAreaInsets, ...insets },
      })),

      getDeviceCapabilities: () => {
        const state = get();
        return {
          hasCamera: state.deviceInfo.platform !== 'web',
          hasMicrophone: state.deviceInfo.platform !== 'web',
          hasGPS: state.deviceInfo.platform !== 'web',
          hasBiometrics: state.deviceInfo.platform === 'ios' || state.deviceInfo.platform === 'android',
          supportsNotifications: true,
        };
      },
    }),
    {
      name: 'device-store',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          const value = storage.getString(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: (name, value) => {
          storage.set(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          storage.delete(name);
        },
      })),
      partialize: (state) => ({
        // Don't persist dynamic values
        deviceInfo: state.deviceInfo,
        permissions: state.permissions,
        isLowPowerMode: state.isLowPowerMode,
      }),
    }
  )
);
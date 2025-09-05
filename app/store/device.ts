import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

export interface DeviceState {
  // Device info
  isLauncher: boolean;
  deviceId: string;
  platform: 'android' | 'ios' | 'web';
  version: string;
  
  // App state
  isActive: boolean;
  lastActive: number;
  sessionStart: number;
  
  // Permissions
  permissions: {
    contacts: boolean;
    camera: boolean;
    microphone: boolean;
    location: boolean;
    notifications: boolean;
    storage: boolean;
  };
  
  // Settings
  settings: {
    autoLaunch: boolean;
    keepAwake: boolean;
    batteryOptimization: boolean;
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
  };
  
  // Actions
  setLauncherMode: (isLauncher: boolean) => void;
  setDeviceInfo: (info: Partial<DeviceState>) => void;
  setPermission: (permission: keyof DeviceState['permissions'], granted: boolean) => void;
  updateSettings: (settings: Partial<DeviceState['settings']>) => void;
  setActive: (active: boolean) => void;
  getSessionDuration: () => number;
}

export const useDeviceStore = create<DeviceState>()(
  persist(
    (set, get) => ({
      // Initial state
      isLauncher: false,
      deviceId: '',
      platform: 'android',
      version: '1.0.0',
      isActive: true,
      lastActive: Date.now(),
      sessionStart: Date.now(),
      
      permissions: {
        contacts: false,
        camera: false,
        microphone: false,
        location: false,
        notifications: false,
        storage: false,
      },
      
      settings: {
        autoLaunch: true,
        keepAwake: false,
        batteryOptimization: false,
        theme: 'auto',
        language: 'en',
        timezone: 'UTC',
      },
      
      // Actions
      setLauncherMode: (isLauncher: boolean) => set({ isLauncher }),
      
      setDeviceInfo: (info: Partial<DeviceState>) => set(info),
      
      setPermission: (permission: keyof DeviceState['permissions'], granted: boolean) => {
        set((state) => ({
          permissions: {
            ...state.permissions,
            [permission]: granted
          }
        }));
      },
      
      updateSettings: (settings: Partial<DeviceState['settings']>) => {
        set((state) => ({
          settings: {
            ...state.settings,
            ...settings
          }
        }));
      },
      
      setActive: (active: boolean) => {
        const now = Date.now();
        set((state) => ({
          isActive: active,
          lastActive: active ? now : state.lastActive,
          sessionStart: active && !state.isActive ? now : state.sessionStart
        }));
      },
      
      getSessionDuration: () => {
        const state = get();
        return Date.now() - state.sessionStart;
      }
    }),
    {
      name: 'device-storage',
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
    }
  )
);

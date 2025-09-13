/**
 * Device Store - Zustand store for device state and launcher functionality
 */

import { create } from 'zustand';

export interface DeviceSettings {
  brightness: number;
  volume: number;
  wifiEnabled: boolean;
  bluetoothEnabled: boolean;
  locationEnabled: boolean;
  notificationsEnabled: boolean;
  darkMode: boolean;
  doNotDisturb: boolean;
}

export interface AppInfo {
  id: string;
  name: string;
  packageName?: string;
  icon?: string;
  isSystemApp: boolean;
  lastUsed?: Date;
  usageCount: number;
  category: string;
}

export interface QuickAction {
  id: string;
  title: string;
  icon: string;
  action: string;
  params?: any;
  enabled: boolean;
}

interface DeviceState {
  // Device state
  isLauncher: boolean;
  batteryLevel: number;
  isCharging: boolean;
  networkType: 'wifi' | 'mobile' | 'none';
  signalStrength: number;
  
  // Settings
  settings: DeviceSettings;
  
  // Apps and launcher
  installedApps: AppInfo[];
  favoriteApps: string[];
  recentApps: string[];
  quickActions: QuickAction[];
  
  // Actions
  setLauncherMode: (isLauncher: boolean) => void;
  updateBatteryInfo: (level: number, isCharging: boolean) => void;
  updateNetworkInfo: (type: 'wifi' | 'mobile' | 'none', strength: number) => void;
  updateSettings: (updates: Partial<DeviceSettings>) => void;
  
  // App management
  addApp: (app: Omit<AppInfo, 'id'>) => void;
  updateApp: (id: string, updates: Partial<AppInfo>) => void;
  addToFavorites: (appId: string) => void;
  removeFromFavorites: (appId: string) => void;
  addToRecent: (appId: string) => void;
  
  // Quick actions
  addQuickAction: (action: Omit<QuickAction, 'id'>) => void;
  updateQuickAction: (id: string, updates: Partial<QuickAction>) => void;
  removeQuickAction: (id: string) => void;
}

const defaultSettings: DeviceSettings = {
  brightness: 0.7,
  volume: 0.5,
  wifiEnabled: true,
  bluetoothEnabled: true,
  locationEnabled: true,
  notificationsEnabled: true,
  darkMode: false,
  doNotDisturb: false,
};

const defaultQuickActions: QuickAction[] = [
  {
    id: 'flashlight',
    title: 'Flashlight',
    icon: 'flashlight',
    action: 'toggle_flashlight',
    enabled: true,
  },
  {
    id: 'wifi',
    title: 'Wi-Fi',
    icon: 'wifi',
    action: 'toggle_wifi',
    enabled: true,
  },
  {
    id: 'bluetooth',
    title: 'Bluetooth',
    icon: 'bluetooth',
    action: 'toggle_bluetooth',
    enabled: true,
  },
  {
    id: 'camera',
    title: 'Camera',
    icon: 'camera',
    action: 'open_camera',
    enabled: true,
  },
  {
    id: 'calculator',
    title: 'Calculator',
    icon: 'calculator',
    action: 'open_calculator',
    enabled: true,
  },
  {
    id: 'notes',
    title: 'Notes',
    icon: 'create',
    action: 'open_notes',
    enabled: true,
  },
];

export const useDeviceStore = create<DeviceState>((set, get) => ({
  // Initial state
  isLauncher: true,
  batteryLevel: 0.85,
  isCharging: false,
  networkType: 'wifi',
  signalStrength: 0.8,
  
  settings: defaultSettings,
  
  installedApps: [],
  favoriteApps: [],
  recentApps: [],
  quickActions: defaultQuickActions,
  
  // Actions
  setLauncherMode: (isLauncher: boolean) => set({ isLauncher }),
  
  updateBatteryInfo: (level: number, isCharging: boolean) => 
    set({ batteryLevel: Math.max(0, Math.min(1, level)), isCharging }),
  
  updateNetworkInfo: (type: 'wifi' | 'mobile' | 'none', strength: number) => 
    set({ networkType: type, signalStrength: Math.max(0, Math.min(1, strength)) }),
  
  updateSettings: (updates: Partial<DeviceSettings>) => 
    set((state) => ({ settings: { ...state.settings, ...updates } })),
  
  // App management
  addApp: (app) => {
    const newApp: AppInfo = {
      ...app,
      id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    
    set((state) => ({
      installedApps: [...state.installedApps, newApp],
    }));
  },
  
  updateApp: (id: string, updates: Partial<AppInfo>) => {
    set((state) => ({
      installedApps: state.installedApps.map(app => 
        app.id === id ? { ...app, ...updates } : app
      ),
    }));
  },
  
  addToFavorites: (appId: string) => {
    set((state) => ({
      favoriteApps: state.favoriteApps.includes(appId) 
        ? state.favoriteApps 
        : [...state.favoriteApps, appId],
    }));
  },
  
  removeFromFavorites: (appId: string) => {
    set((state) => ({
      favoriteApps: state.favoriteApps.filter(id => id !== appId),
    }));
  },
  
  addToRecent: (appId: string) => {
    set((state) => {
      const filtered = state.recentApps.filter(id => id !== appId);
      return {
        recentApps: [appId, ...filtered].slice(0, 10), // Keep last 10
      };
    });
    
    // Update usage count
    get().updateApp(appId, { 
      lastUsed: new Date(),
      usageCount: (get().installedApps.find(app => app.id === appId)?.usageCount || 0) + 1,
    });
  },
  
  // Quick actions
  addQuickAction: (action) => {
    const newAction: QuickAction = {
      ...action,
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    
    set((state) => ({
      quickActions: [...state.quickActions, newAction],
    }));
  },
  
  updateQuickAction: (id: string, updates: Partial<QuickAction>) => {
    set((state) => ({
      quickActions: state.quickActions.map(action => 
        action.id === id ? { ...action, ...updates } : action
      ),
    }));
  },
  
  removeQuickAction: (id: string) => {
    set((state) => ({
      quickActions: state.quickActions.filter(action => action.id !== id),
    }));
  },
}));
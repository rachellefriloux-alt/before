import { Platform, Alert, Linking } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Device from 'expo-device';

export interface AppInfo {
  packageName: string;
  appName: string;
  icon?: string;
  category: string;
  isSystemApp: boolean;
  versionName?: string;
  lastUpdateTime?: number;
  installTime?: number;
}

export interface LauncherConfig {
  showSystemApps: boolean;
  categorizeApps: boolean;
  customCategories: Record<string, string[]>;
  hiddenApps: string[];
  favoriteApps: string[];
}

export class AndroidLauncher {
  private config: LauncherConfig;
  private installedApps: AppInfo[] = [];
  private isInitialized = false;

  constructor(config?: Partial<LauncherConfig>) {
    this.config = {
      showSystemApps: false,
      categorizeApps: true,
      customCategories: {
        communication: ['com.whatsapp', 'com.telegram.messenger', 'com.discord'],
        social: ['com.instagram.android', 'com.twitter.android', 'com.facebook.katana'],
        productivity: ['com.microsoft.office.word', 'com.google.android.apps.docs'],
        entertainment: ['com.netflix.mediaclient', 'com.spotify.music', 'com.youtube'],
        games: ['com.supercell.clashofclans', 'com.android.chrome'],
        utilities: ['com.android.calculator2', 'com.android.camera'],
      },
      hiddenApps: [],
      favoriteApps: [],
      ...config,
    };
  }

  async initialize(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      console.warn('AndroidLauncher only works on Android platform');
      return false;
    }

    try {
      // Check if we have the necessary permissions
      const hasPermissions = await this.checkPermissions();
      if (!hasPermissions) {
        console.warn('AndroidLauncher requires additional permissions');
        return false;
      }

      // Load installed apps
      await this.loadInstalledApps();
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('AndroidLauncher initialization failed:', error);
      return false;
    }
  }

  private async checkPermissions(): Promise<boolean> {
    // For Expo, we'll use IntentLauncher which handles permissions
    // In a bare React Native project, you might need additional permissions
    return true;
  }

  private async loadInstalledApps(): Promise<void> {
    try {
      // Note: This is a mock implementation for Expo
      // In a real Android launcher, you would use native modules to query installed apps
      // For now, we'll provide a comprehensive list of common apps

      this.installedApps = this.getMockInstalledApps();
      console.log(`Loaded ${this.installedApps.length} apps`);
    } catch (error) {
      console.error('Failed to load installed apps:', error);
      this.installedApps = this.getMockInstalledApps();
    }
  }

  private getMockInstalledApps(): AppInfo[] {
    return [
      // Communication
      { packageName: 'com.android.dialer', appName: 'Phone', category: 'communication', isSystemApp: true },
      { packageName: 'com.android.mms', appName: 'Messages', category: 'communication', isSystemApp: true },
      { packageName: 'com.whatsapp', appName: 'WhatsApp', category: 'communication', isSystemApp: false },
      { packageName: 'com.telegram.messenger', appName: 'Telegram', category: 'communication', isSystemApp: false },
      { packageName: 'com.discord', appName: 'Discord', category: 'communication', isSystemApp: false },
      
      // Social
      { packageName: 'com.instagram.android', appName: 'Instagram', category: 'social', isSystemApp: false },
      { packageName: 'com.twitter.android', appName: 'Twitter', category: 'social', isSystemApp: false },
      { packageName: 'com.facebook.katana', appName: 'Facebook', category: 'social', isSystemApp: false },
      { packageName: 'com.linkedin.android', appName: 'LinkedIn', category: 'social', isSystemApp: false },
      
      // Productivity
      { packageName: 'com.google.android.gm', appName: 'Gmail', category: 'productivity', isSystemApp: false },
      { packageName: 'com.google.android.calendar', appName: 'Calendar', category: 'productivity', isSystemApp: true },
      { packageName: 'com.microsoft.office.word', appName: 'Word', category: 'productivity', isSystemApp: false },
      { packageName: 'com.google.android.apps.docs', appName: 'Google Docs', category: 'productivity', isSystemApp: false },
      
      // Entertainment
      { packageName: 'com.netflix.mediaclient', appName: 'Netflix', category: 'entertainment', isSystemApp: false },
      { packageName: 'com.spotify.music', appName: 'Spotify', category: 'entertainment', isSystemApp: false },
      { packageName: 'com.youtube', appName: 'YouTube', category: 'entertainment', isSystemApp: false },
      { packageName: 'com.android.music', appName: 'Music', category: 'entertainment', isSystemApp: true },
      
      // Utilities
      { packageName: 'com.android.calculator2', appName: 'Calculator', category: 'utilities', isSystemApp: true },
      { packageName: 'com.android.camera', appName: 'Camera', category: 'utilities', isSystemApp: true },
      { packageName: 'com.android.settings', appName: 'Settings', category: 'utilities', isSystemApp: true },
      { packageName: 'com.android.documentsui', appName: 'Files', category: 'utilities', isSystemApp: true },
      
      // Navigation
      { packageName: 'com.google.android.apps.maps', appName: 'Maps', category: 'navigation', isSystemApp: false },
      { packageName: 'com.waze', appName: 'Waze', category: 'navigation', isSystemApp: false },
      
      // Gaming
      { packageName: 'com.supercell.clashofclans', appName: 'Clash of Clans', category: 'games', isSystemApp: false },
      { packageName: 'com.king.candycrushsaga', appName: 'Candy Crush', category: 'games', isSystemApp: false },
      
      // Web browsers
      { packageName: 'com.android.chrome', appName: 'Chrome', category: 'internet', isSystemApp: false },
      { packageName: 'com.mozilla.firefox', appName: 'Firefox', category: 'internet', isSystemApp: false },
    ];
  }

  async launchApp(packageName: string): Promise<boolean> {
    if (!this.isInitialized) {
      console.warn('AndroidLauncher not initialized');
      return false;
    }

    try {
      // Find the app
      const app = this.installedApps.find(a => a.packageName === packageName);
      if (!app) {
        Alert.alert('App Not Found', `Could not find app with package name: ${packageName}`);
        return false;
      }

      console.log(`Launching app: ${app.appName} (${packageName})`);

      // Use IntentLauncher to open the app
      await IntentLauncher.startActivityAsync('android.intent.action.MAIN', {
        className: `${packageName}.MainActivity`,
        packageName: packageName,
        flags: 0x10000000 | 0x02000000, // NEW_TASK | RESET_TASK_IF_NEEDED
      });

      return true;
    } catch (error) {
      console.error(`Failed to launch app ${packageName}:`, error);
      
      // Fallback: try to open with Linking
      try {
        const canOpen = await Linking.canOpenURL(`package:${packageName}`);
        if (canOpen) {
          await Linking.openURL(`package:${packageName}`);
          return true;
        }
      } catch (linkingError) {
        console.error('Linking fallback failed:', linkingError);
      }

      Alert.alert(
        'Launch Failed',
        `Could not launch ${packageName}. The app might not be installed or accessible.`,
        [{ text: 'OK' }]
      );
      return false;
    }
  }

  async openAppSettings(packageName: string): Promise<boolean> {
    try {
      await IntentLauncher.startActivityAsync('android.settings.APPLICATION_DETAILS_SETTINGS', {
        data: `package:${packageName}`,
      });
      return true;
    } catch (error) {
      console.error('Failed to open app settings:', error);
      return false;
    }
  }

  async uninstallApp(packageName: string): Promise<boolean> {
    try {
      await IntentLauncher.startActivityAsync('android.intent.action.DELETE', {
        data: `package:${packageName}`,
      });
      return true;
    } catch (error) {
      console.error('Failed to uninstall app:', error);
      return false;
    }
  }

  // App management
  getInstalledApps(): AppInfo[] {
    if (!this.isInitialized) {
      console.warn('AndroidLauncher not initialized');
      return [];
    }

    let apps = [...this.installedApps];

    // Filter out hidden apps
    apps = apps.filter(app => !this.config.hiddenApps.includes(app.packageName));

    // Filter out system apps if configured
    if (!this.config.showSystemApps) {
      apps = apps.filter(app => !app.isSystemApp);
    }

    return apps;
  }

  getAppsByCategory(category: string): AppInfo[] {
    return this.getInstalledApps().filter(app => app.category === category);
  }

  getFavoriteApps(): AppInfo[] {
    return this.getInstalledApps().filter(app => 
      this.config.favoriteApps.includes(app.packageName)
    );
  }

  getRecentApps(): AppInfo[] {
    // Mock implementation - in real launcher, this would track actual usage
    return this.getInstalledApps().slice(0, 6);
  }

  searchApps(query: string): AppInfo[] {
    const lowercaseQuery = query.toLowerCase();
    return this.getInstalledApps().filter(app =>
      app.appName.toLowerCase().includes(lowercaseQuery) ||
      app.packageName.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Configuration management
  updateConfig(newConfig: Partial<LauncherConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): LauncherConfig {
    return { ...this.config };
  }

  // App organization
  addToFavorites(packageName: string): void {
    if (!this.config.favoriteApps.includes(packageName)) {
      this.config.favoriteApps.push(packageName);
    }
  }

  removeFromFavorites(packageName: string): void {
    const index = this.config.favoriteApps.indexOf(packageName);
    if (index > -1) {
      this.config.favoriteApps.splice(index, 1);
    }
  }

  hideApp(packageName: string): void {
    if (!this.config.hiddenApps.includes(packageName)) {
      this.config.hiddenApps.push(packageName);
    }
  }

  unhideApp(packageName: string): void {
    const index = this.config.hiddenApps.indexOf(packageName);
    if (index > -1) {
      this.config.hiddenApps.splice(index, 1);
    }
  }

  setAppCategory(packageName: string, category: string): void {
    const app = this.installedApps.find(a => a.packageName === packageName);
    if (app) {
      app.category = category;
    }
  }

  // System integration
  async openSettings(): Promise<boolean> {
    try {
      await IntentLauncher.startActivityAsync('android.settings.SETTINGS');
      return true;
    } catch (error) {
      console.error('Failed to open settings:', error);
      return false;
    }
  }

  async openWifiSettings(): Promise<boolean> {
    try {
      await IntentLauncher.startActivityAsync('android.settings.WIFI_SETTINGS');
      return true;
    } catch (error) {
      console.error('Failed to open WiFi settings:', error);
      return false;
    }
  }

  async openBluetoothSettings(): Promise<boolean> {
    try {
      await IntentLauncher.startActivityAsync('android.settings.BLUETOOTH_SETTINGS');
      return true;
    } catch (error) {
      console.error('Failed to open Bluetooth settings:', error);
      return false;
    }
  }

  // Device information
  async getDeviceInfo(): Promise<{
    deviceName: string;
    manufacturer: string;
    modelName: string;
    osVersion: string;
    totalMemory?: number;
    batteryLevel?: number;
  }> {
    return {
      deviceName: Device.deviceName || 'Unknown Device',
      manufacturer: Device.manufacturer || 'Unknown',
      modelName: Device.modelName || 'Unknown Model',
      osVersion: Device.osVersion || 'Unknown',
      // Additional device info would require native modules
    };
  }

  // Utility methods
  getAppIcon(packageName: string): string {
    // In a real implementation, this would return the actual app icon
    // For now, return emoji based on category
    const app = this.installedApps.find(a => a.packageName === packageName);
    if (!app) return '📱';

    const categoryIcons: Record<string, string> = {
      communication: '💬',
      social: '👥',
      productivity: '📊',
      entertainment: '🎵',
      utilities: '🛠️',
      navigation: '🗺️',
      games: '🎮',
      internet: '🌐',
      default: '📱',
    };

    return categoryIcons[app.category] || categoryIcons.default;
  }

  isAppInstalled(packageName: string): boolean {
    return this.installedApps.some(app => app.packageName === packageName);
  }

  getAppInfo(packageName: string): AppInfo | null {
    return this.installedApps.find(app => app.packageName === packageName) || null;
  }
}

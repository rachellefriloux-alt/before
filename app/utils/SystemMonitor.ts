import * as Battery from 'expo-battery';
import * as Network from 'expo-network';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import { Platform } from 'react-native';

export interface BatteryInfo {
  batteryLevel: number;
  isCharging: boolean;
  isLowPowerMode: boolean;
  batteryState: Battery.BatteryState;
  lastUpdated: number;
}

export interface NetworkInfo {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: Network.NetworkStateType;
  details?: {
    isConnectionExpensive?: boolean;
  };
}

export interface DeviceInfo {
  name: string;
  modelName: string;
  osVersion: string;
  platformApiLevel: number;
  deviceYearClass: number;
  totalMemory: number;
  manufacturer: string;
  brand: string;
  isDevice: boolean;
}

export interface PerformanceMetrics {
  memoryUsage: number;
  cpuUsage: number;
  batteryDrainRate: number;
  networkLatency: number;
  timestamp: number;
}

export interface SystemHealth {
  overall: 'excellent' | 'good' | 'fair' | 'poor';
  battery: 'excellent' | 'good' | 'fair' | 'poor';
  network: 'excellent' | 'good' | 'fair' | 'poor';
  performance: 'excellent' | 'good' | 'fair' | 'poor';
  recommendations: string[];
}

export class SystemMonitor {
  private static instance: SystemMonitor;
  private batterySubscription: Battery.Subscription | null = null;
  private networkSubscription: any | null = null;
  private performanceInterval: NodeJS.Timeout | null = null;
  
  private currentBatteryInfo: BatteryInfo | null = null;
  private currentNetworkInfo: NetworkInfo | null = null;
  private performanceHistory: PerformanceMetrics[] = [];
  private readonly MAX_HISTORY_SIZE = 100;

  static getInstance(): SystemMonitor {
    if (!SystemMonitor.instance) {
      SystemMonitor.instance = new SystemMonitor();
    }
    return SystemMonitor.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Initialize battery monitoring
      await this.initializeBatteryMonitoring();
      
      // Initialize network monitoring
      await this.initializeNetworkMonitoring();
      
      // Initialize performance monitoring
      await this.initializePerformanceMonitoring();
      
      // Get initial system information
      await this.updateSystemInfo();
      
    } catch (error) {
      console.error('Error initializing system monitor:', error);
    }
  }

  private async initializeBatteryMonitoring(): Promise<void> {
    try {
      // Get initial battery state
      const batteryLevel = await Battery.getBatteryLevelAsync();
      const batteryState = await Battery.getBatteryStateAsync();
      const isLowPowerMode = await Battery.isLowPowerModeEnabledAsync();

      this.currentBatteryInfo = {
        batteryLevel,
        isCharging: batteryState === Battery.BatteryState.CHARGING,
        isLowPowerMode,
        batteryState,
        lastUpdated: Date.now(),
      };

      // Subscribe to battery changes
      this.batterySubscription = Battery.addBatteryStateListener(({ batteryState }) => {
        this.currentBatteryInfo = {
          ...this.currentBatteryInfo!,
          isCharging: batteryState === Battery.BatteryState.CHARGING,
          batteryState,
          lastUpdated: Date.now(),
        };
      });

    } catch (error) {
      console.error('Error initializing battery monitoring:', error);
    }
  }

  private async initializeNetworkMonitoring(): Promise<void> {
    try {
      // Get initial network state
      const networkState = await Network.getNetworkStateAsync();
      
      this.currentNetworkInfo = {
        isConnected: networkState.isConnected ?? false,
        isInternetReachable: networkState.isInternetReachable ?? false,
        type: networkState.type ?? Network.NetworkStateType.UNKNOWN,
        details: {
          isConnectionExpensive: false,
        },
      };

      // Subscribe to network changes
      this.networkSubscription = Network.addNetworkStateListener(({ isConnected, isInternetReachable, type }) => {
        this.currentNetworkInfo = {
          isConnected: isConnected ?? false,
          isInternetReachable: isInternetReachable ?? false,
          type: type ?? Network.NetworkStateType.UNKNOWN,
        };
      });

    } catch (error) {
      console.error('Error initializing network monitoring:', error);
    }
  }

  private async initializePerformanceMonitoring(): Promise<void> {
    try {
      // Start performance monitoring interval
      this.performanceInterval = setInterval(async () => {
        await this.updatePerformanceMetrics();
      }, 30000); // Update every 30 seconds

      // Get initial performance metrics
      await this.updatePerformanceMetrics();

    } catch (error) {
      console.error('Error initializing performance monitoring:', error);
    }
  }

  private async updateSystemInfo(): Promise<void> {
    try {
      // This method can be used to update any additional system information
      // that doesn't change frequently
      console.log('System info updated');
    } catch (error) {
      console.error('Error updating system info:', error);
    }
  }

  private async updatePerformanceMetrics(): Promise<void> {
    try {
      const metrics: PerformanceMetrics = {
        memoryUsage: await this.getMemoryUsage(),
        cpuUsage: await this.getCPUUsage(),
        batteryDrainRate: await this.getBatteryDrainRate(),
        networkLatency: await this.getNetworkLatency(),
        timestamp: Date.now(),
      };

      this.performanceHistory.push(metrics);

      // Keep only the most recent metrics
      if (this.performanceHistory.length > this.MAX_HISTORY_SIZE) {
        this.performanceHistory = this.performanceHistory.slice(-this.MAX_HISTORY_SIZE);
      }

    } catch (error) {
      console.error('Error updating performance metrics:', error);
    }
  }

  private async getMemoryUsage(): Promise<number> {
    try {
      // This is a simplified memory usage calculation
      // In a real implementation, you might use native modules or other methods
      return Math.random() * 100; // Placeholder
    } catch (error) {
      console.error('Error getting memory usage:', error);
      return 0;
    }
  }

  private async getCPUUsage(): Promise<number> {
    try {
      // This is a simplified CPU usage calculation
      // In a real implementation, you might use native modules or other methods
      return Math.random() * 100; // Placeholder
    } catch (error) {
      console.error('Error getting CPU usage:', error);
      return 0;
    }
  }

  private async getBatteryDrainRate(): Promise<number> {
    try {
      if (this.performanceHistory.length < 2) return 0;

      const recent = this.performanceHistory[this.performanceHistory.length - 1];
      const previous = this.performanceHistory[this.performanceHistory.length - 2];
      
      const timeDiff = (recent.timestamp - previous.timestamp) / 1000; // seconds
      const batteryDiff = Math.abs(recent.batteryDrainRate - previous.batteryDrainRate);
      
      return batteryDiff / timeDiff; // battery units per second
    } catch (error) {
      console.error('Error getting battery drain rate:', error);
      return 0;
    }
  }

  private async getNetworkLatency(): Promise<number> {
    try {
      // This is a simplified network latency calculation
      // In a real implementation, you might ping a server or use other methods
      return Math.random() * 100; // Placeholder
    } catch (error) {
      console.error('Error getting network latency:', error);
      return 0;
    }
  }

  getBatteryInfo(): BatteryInfo | null {
    return this.currentBatteryInfo;
  }

  getNetworkInfo(): NetworkInfo | null {
    return this.currentNetworkInfo;
  }

  getDeviceInfo(): DeviceInfo {
    return {
      name: Device.deviceName || 'Unknown',
      modelName: Device.modelName || 'Unknown',
      osVersion: Device.osVersion || 'Unknown',
      platformApiLevel: Device.platformApiLevel || 0,
      deviceYearClass: Device.deviceYearClass || 0,
      totalMemory: Device.totalMemory || 0,
      manufacturer: Device.manufacturer || 'Unknown',
      brand: Device.brand || 'Unknown',
      isDevice: Device.isDevice,
    };
  }

  getPerformanceMetrics(): PerformanceMetrics[] {
    return [...this.performanceHistory];
  }

  getCurrentPerformanceMetrics(): PerformanceMetrics | null {
    if (this.performanceHistory.length === 0) return null;
    return this.performanceHistory[this.performanceHistory.length - 1];
  }

  getSystemHealth(): SystemHealth {
    const recommendations: string[] = [];
    let overallScore = 0;
    let scoreCount = 0;

    // Battery health
    let batteryScore = 0;
    if (this.currentBatteryInfo) {
      if (this.currentBatteryInfo.batteryLevel > 0.8) batteryScore = 4;
      else if (this.currentBatteryInfo.batteryLevel > 0.5) batteryScore = 3;
      else if (this.currentBatteryInfo.batteryLevel > 0.2) batteryScore = 2;
      else batteryScore = 1;

      if (this.currentBatteryInfo.isLowPowerMode) {
        recommendations.push('Low power mode is enabled');
      }
      if (this.currentBatteryInfo.batteryLevel < 0.2) {
        recommendations.push('Battery level is low, consider charging');
      }
    }
    overallScore += batteryScore;
    scoreCount++;

    // Network health
    let networkScore = 0;
    if (this.currentNetworkInfo) {
      if (this.currentNetworkInfo.isConnected && this.currentNetworkInfo.isInternetReachable) {
        networkScore = 4;
      } else if (this.currentNetworkInfo.isConnected) {
        networkScore = 2;
        recommendations.push('Connected to network but internet is not reachable');
      } else {
        networkScore = 1;
        recommendations.push('No network connection available');
      }
    }
    overallScore += networkScore;
    scoreCount++;

    // Performance health
    let performanceScore = 0;
    const currentMetrics = this.getCurrentPerformanceMetrics();
    if (currentMetrics) {
      if (currentMetrics.memoryUsage < 70 && currentMetrics.cpuUsage < 70) {
        performanceScore = 4;
      } else if (currentMetrics.memoryUsage < 85 && currentMetrics.cpuUsage < 85) {
        performanceScore = 3;
      } else if (currentMetrics.memoryUsage < 95 && currentMetrics.cpuUsage < 95) {
        performanceScore = 2;
        recommendations.push('System performance is degraded');
      } else {
        performanceScore = 1;
        recommendations.push('System performance is poor, consider restarting');
      }
    }
    overallScore += performanceScore;
    scoreCount++;

    // Calculate overall score
    const averageScore = scoreCount > 0 ? overallScore / scoreCount : 0;
    let overall: 'excellent' | 'good' | 'fair' | 'poor';
    if (averageScore >= 3.5) overall = 'excellent';
    else if (averageScore >= 2.5) overall = 'good';
    else if (averageScore >= 1.5) overall = 'fair';
    else overall = 'poor';

    // Convert scores to health levels
    const getHealthLevel = (score: number): 'excellent' | 'good' | 'fair' | 'poor' => {
      if (score >= 3.5) return 'excellent';
      if (score >= 2.5) return 'good';
      if (score >= 1.5) return 'fair';
      return 'poor';
    };

    return {
      overall,
      battery: getHealthLevel(batteryScore),
      network: getHealthLevel(networkScore),
      performance: getHealthLevel(performanceScore),
      recommendations,
    };
  }

  async getAppVersion(): Promise<string> {
    try {
      return Application.nativeApplicationVersion || 'Unknown';
    } catch (error) {
      console.error('Error getting app version:', error);
      return 'Unknown';
    }
  }

  async getBuildNumber(): Promise<string> {
    try {
      return Application.nativeBuildVersion || 'Unknown';
    } catch (error) {
      console.error('Error getting build number:', error);
      return 'Unknown';
    }
  }

  async getInstallationTime(): Promise<Date | null> {
    try {
      const installationTime = await Application.getInstallationTimeAsync();
      return installationTime ? new Date(installationTime) : null;
    } catch (error) {
      console.error('Error getting installation time:', error);
      return null;
    }
  }

  async getLastUpdateTime(): Promise<Date | null> {
    try {
      const lastUpdateTime = await Application.getLastUpdateTimeAsync();
      return lastUpdateTime ? new Date(lastUpdateTime) : null;
    } catch (error) {
      console.error('Error getting last update time:', error);
      return null;
    }
  }

  async isLowPowerModeEnabled(): Promise<boolean> {
    try {
      return await Battery.isLowPowerModeEnabledAsync();
    } catch (error) {
      console.error('Error checking low power mode:', error);
      return false;
    }
  }

  async getBatteryState(): Promise<Battery.BatteryState> {
    try {
      return await Battery.getBatteryStateAsync();
    } catch (error) {
      console.error('Error getting battery state:', error);
      return Battery.BatteryState.UNKNOWN;
    }
  }

  async getBatteryLevel(): Promise<number> {
    try {
      return await Battery.getBatteryLevelAsync();
    } catch (error) {
      console.error('Error getting battery level:', error);
      return 0;
    }
  }

  async getNetworkState(): Promise<Network.NetworkState> {
    try {
      return await Network.getNetworkStateAsync();
    } catch (error) {
      console.error('Error getting network state:', error);
      return {
        isConnected: false,
        isInternetReachable: false,
        type: Network.NetworkStateType.NONE,
      };
    }
  }

  async getNetworkStatus(): Promise<boolean> {
    try {
      const networkState = await Network.getNetworkStateAsync();
      return networkState.isConnected ?? false;
    } catch (error) {
      console.error('Error checking network connection:', error);
      return false;
    }
  }

  async isInternetReachable(): Promise<boolean> {
    try {
      const networkState = await Network.getNetworkStateAsync();
      return networkState.isInternetReachable ?? false;
    } catch (error) {
      console.error('Error checking internet reachability:', error);
      return false;
    }
  }

  cleanup(): void {
    if (this.batterySubscription) {
      this.batterySubscription.remove();
      this.batterySubscription = null;
    }

    if (this.networkSubscription) {
      this.networkSubscription.remove();
      this.networkSubscription = null;
    }

    if (this.performanceInterval) {
      clearInterval(this.performanceInterval);
      this.performanceInterval = null;
    }

    this.performanceHistory = [];
    this.currentBatteryInfo = null;
    this.currentNetworkInfo = null;
  }
}

export default SystemMonitor;

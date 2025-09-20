/*
 * Sallie Sovereign - Local-Only Mode TypeScript Interface
 * Provides JavaScript/TypeScript access to local-only functionality
 */

import { NativeModules, Platform } from 'react-native';

interface LocalOnlyModeNative {
  isLocalModeEnabled(): Promise<boolean>;
  setLocalModeEnabled(enabled: boolean): Promise<void>;
  getLocalAIConfig(): Promise<Record<string, any>>;
  getMockProvider(feature: string): Promise<any>;
}

// Native module interface
const LocalOnlyModeNative: LocalOnlyModeNative = NativeModules.LocalOnlyMode;

export class LocalOnlyMode {
  private static isEnabled = false;
  private static config: Record<string, any> = {};

  /**
   * Check if local-only mode is enabled
   */
  static async isEnabled(): Promise<boolean> {
    if (Platform.OS === 'android' && LocalOnlyModeNative) {
      try {
        this.isEnabled = await LocalOnlyModeNative.isLocalModeEnabled();
        return this.isEnabled;
      } catch (error) {
        console.warn('Failed to check local mode status:', error);
      }
    }
    return this.isEnabled;
  }

  /**
   * Enable or disable local-only mode
   */
  static async setEnabled(enabled: boolean): Promise<void> {
    this.isEnabled = enabled;
    
    if (Platform.OS === 'android' && LocalOnlyModeNative) {
      try {
        await LocalOnlyModeNative.setLocalModeEnabled(enabled);
      } catch (error) {
        console.warn('Failed to set local mode:', error);
      }
    }

    if (enabled) {
      await this.loadLocalConfig();
    }
  }

  /**
   * Load local-only configuration
   */
  private static async loadLocalConfig(): Promise<void> {
    if (Platform.OS === 'android' && LocalOnlyModeNative) {
      try {
        this.config = await LocalOnlyModeNative.getLocalAIConfig();
      } catch (error) {
        console.warn('Failed to load local config:', error);
        // Fallback config
        this.config = {
          useLocalModels: true,
          enableCloudFallback: false,
          encryptionEnabled: true,
        };
      }
    } else {
      // Web/iOS fallback config
      this.config = {
        useLocalModels: false, // Limited local processing on web
        enableCloudFallback: false,
        encryptionEnabled: true,
      };
    }
  }

  /**
   * Get local-only configuration
   */
  static getConfig(): Record<string, any> {
    return this.config;
  }

  /**
   * Get a mock provider for cloud features when in local mode
   */
  static async getMockProvider(feature: string): Promise<any> {
    if (Platform.OS === 'android' && LocalOnlyModeNative) {
      try {
        return await LocalOnlyModeNative.getMockProvider(feature);
      } catch (error) {
        console.warn(`Failed to get mock provider for ${feature}:`, error);
      }
    }

    // JavaScript fallback mock providers
    const mockProviders: Record<string, any> = {
      cloudStorage: {
        upload: (data: any) => Promise.resolve(`Local storage: ${JSON.stringify(data).substring(0, 50)}...`),
        download: (id: string) => Promise.resolve(`Local cached data for: ${id}`),
      },
      analytics: {
        track: (event: string) => console.log(`[Local Analytics] ${event}`),
      },
      cloudSync: {
        sync: () => Promise.resolve('Sync disabled in local mode'),
      },
      remoteAI: {
        query: (prompt: string) => Promise.resolve(`Local processing: ${prompt.substring(0, 50)}...`),
      },
    };

    return mockProviders[feature] || {
      call: () => `Mock local provider for: ${feature}`,
    };
  }

  /**
   * Check if a feature should use local processing
   */
  static shouldUseLocal(feature: string): boolean {
    if (!this.isEnabled) return false;

    const localFeatures = [
      'ai_processing',
      'memory_storage',
      'personality_data',
      'conversation_history',
      'user_preferences',
    ];

    return localFeatures.includes(feature);
  }

  /**
   * Get local storage encryption status
   */
  static isEncryptionEnabled(): boolean {
    return this.config.encryptionEnabled === true;
  }
}
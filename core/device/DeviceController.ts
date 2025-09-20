/*
 * Sallie Sovereign - Device Controller
 * Manages Android device control, phone automation, and system integrations
 */

import { EventEmitter } from 'events';
import { Platform, PermissionsAndroid, NativeModules } from 'react-native';
import { PersonalitySystem } from '../personality/PersonalitySystem';

export interface DeviceCapability {
  name: string;
  available: boolean;
  permissionRequired: string;
  description: string;
}

export interface PhoneControlAction {
  id: string;
  type: 'call' | 'sms' | 'app_launch' | 'setting_toggle' | 'notification';
  target: string;
  parameters: Record<string, any>;
  requiresConfirmation: boolean;
}

export class DeviceController extends EventEmitter {
  private personalitySystem: PersonalitySystem | null = null;
  private initialized = false;
  private capabilities: Map<string, DeviceCapability> = new Map();
  private permissionsGranted: Set<string> = new Set();

  // Native module interfaces
  private phoneControlModule = NativeModules.SalliePhoneControl;
  private deviceAutomationModule = NativeModules.SallieDeviceAutomation;

  constructor() {
    super();
    this.initializeCapabilities();
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('📱 Initializing Device Controller...');

    if (Platform.OS === 'android') {
      await this.initializeAndroidFeatures();
    }

    await this.checkPermissions();
    this.initialized = true;
    this.emit('initialized');
    console.log('✅ Device Controller initialized');
  }

  private initializeCapabilities(): void {
    const baseCapabilities: DeviceCapability[] = [
      {
        name: 'phone_calls',
        available: Platform.OS === 'android',
        permissionRequired: 'android.permission.CALL_PHONE',
        description: 'Make and manage phone calls'
      },
      {
        name: 'sms_messages',
        available: Platform.OS === 'android',
        permissionRequired: 'android.permission.SEND_SMS',
        description: 'Send and read SMS messages'
      },
      {
        name: 'contacts_access',
        available: Platform.OS === 'android',
        permissionRequired: 'android.permission.READ_CONTACTS',
        description: 'Access and manage contacts'
      },
      {
        name: 'app_management',
        available: Platform.OS === 'android',
        permissionRequired: 'android.permission.QUERY_ALL_PACKAGES',
        description: 'Launch and manage applications'
      },
      {
        name: 'system_settings',
        available: Platform.OS === 'android',
        permissionRequired: 'android.permission.WRITE_SETTINGS',
        description: 'Modify system settings'
      },
      {
        name: 'notifications',
        available: true,
        permissionRequired: 'android.permission.POST_NOTIFICATIONS',
        description: 'Create and manage notifications'
      },
      {
        name: 'device_admin',
        available: Platform.OS === 'android',
        permissionRequired: 'android.permission.DEVICE_ADMIN',
        description: 'Advanced device control features'
      }
    ];

    baseCapabilities.forEach(capability => {
      this.capabilities.set(capability.name, capability);
    });
  }

  private async initializeAndroidFeatures(): Promise<void> {
    try {
      // Check if native modules are available
      if (!this.phoneControlModule) {
        console.warn('⚠️ Phone control native module not available');
      }

      if (!this.deviceAutomationModule) {
        console.warn('⚠️ Device automation native module not available');
      }

      console.log('📱 Android-specific features initialized');
    } catch (error) {
      console.error('Failed to initialize Android features:', error);
    }
  }

  private async checkPermissions(): Promise<void> {
    if (Platform.OS !== 'android') return;

    console.log('🔐 Checking device permissions...');

    for (const capability of this.capabilities.values()) {
      if (!capability.available) continue;

      try {
        const granted = await PermissionsAndroid.check(capability.permissionRequired);
        if (granted) {
          this.permissionsGranted.add(capability.name);
        }
      } catch (error) {
        console.warn(`Failed to check permission for ${capability.name}:`, error);
      }
    }

    console.log(`✅ ${this.permissionsGranted.size} permissions granted`);
  }

  setPersonalitySystem(personality: PersonalitySystem): void {
    this.personalitySystem = personality;
  }

  /**
   * Request specific device permissions
   */
  async requestPermissions(capabilityNames: string[]): Promise<boolean> {
    if (Platform.OS !== 'android') return false;

    const permissionsToRequest: string[] = [];
    
    for (const name of capabilityNames) {
      const capability = this.capabilities.get(name);
      if (capability && capability.available && !this.permissionsGranted.has(name)) {
        permissionsToRequest.push(capability.permissionRequired);
      }
    }

    if (permissionsToRequest.length === 0) return true;

    try {
      const results = await PermissionsAndroid.requestMultiple(permissionsToRequest);
      
      // Update granted permissions
      for (const [permission, granted] of Object.entries(results)) {
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          const capability = Array.from(this.capabilities.values())
            .find(cap => cap.permissionRequired === permission);
          if (capability) {
            this.permissionsGranted.add(capability.name);
          }
        }
      }

      this.emit('permissionsUpdated', this.permissionsGranted);
      return Object.values(results).every(result => result === PermissionsAndroid.RESULTS.GRANTED);
    } catch (error) {
      console.error('Failed to request permissions:', error);
      return false;
    }
  }

  /**
   * Make a phone call
   */
  async makeCall(phoneNumber: string, requireConfirmation: boolean = true): Promise<boolean> {
    if (!this.canPerformAction('phone_calls')) {
      throw new Error('Phone call capability not available or permission not granted');
    }

    // Use personality system to determine if confirmation is needed
    if (this.personalitySystem && requireConfirmation) {
      const protectiveness = this.personalitySystem.getTraitValue('protectiveness');
      if (protectiveness > 0.7) {
        console.log('🛡️ High protectiveness - requesting user confirmation for call');
        // In a real implementation, this would show a confirmation dialog
      }
    }

    try {
      if (this.phoneControlModule) {
        const result = await this.phoneControlModule.makeCall(phoneNumber);
        this.emit('actionPerformed', { type: 'call', target: phoneNumber, success: result });
        return result;
      }
      return false;
    } catch (error) {
      console.error('Failed to make call:', error);
      return false;
    }
  }

  /**
   * Send SMS message
   */
  async sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    if (!this.canPerformAction('sms_messages')) {
      throw new Error('SMS capability not available or permission not granted');
    }

    try {
      if (this.phoneControlModule) {
        const result = await this.phoneControlModule.sendSMS(phoneNumber, message);
        this.emit('actionPerformed', { type: 'sms', target: phoneNumber, message, success: result });
        return result;
      }
      return false;
    } catch (error) {
      console.error('Failed to send SMS:', error);
      return false;
    }
  }

  /**
   * Launch an application
   */
  async launchApp(packageName: string): Promise<boolean> {
    if (!this.canPerformAction('app_management')) {
      throw new Error('App management capability not available');
    }

    try {
      if (this.deviceAutomationModule) {
        const result = await this.deviceAutomationModule.launchApp(packageName);
        this.emit('actionPerformed', { type: 'app_launch', target: packageName, success: result });
        return result;
      }
      return false;
    } catch (error) {
      console.error('Failed to launch app:', error);
      return false;
    }
  }

  /**
   * Toggle system setting
   */
  async toggleSystemSetting(setting: string, value: boolean): Promise<boolean> {
    if (!this.canPerformAction('system_settings')) {
      throw new Error('System settings capability not available');
    }

    try {
      if (this.deviceAutomationModule) {
        const result = await this.deviceAutomationModule.toggleSetting(setting, value);
        this.emit('actionPerformed', { type: 'setting_toggle', target: setting, value, success: result });
        return result;
      }
      return false;
    } catch (error) {
      console.error('Failed to toggle setting:', error);
      return false;
    }
  }

  /**
   * Get installed applications
   */
  async getInstalledApps(): Promise<any[]> {
    if (!this.canPerformAction('app_management')) {
      return [];
    }

    try {
      if (this.deviceAutomationModule) {
        return await this.deviceAutomationModule.getInstalledApps();
      }
      return [];
    } catch (error) {
      console.error('Failed to get installed apps:', error);
      return [];
    }
  }

  /**
   * Get device information
   */
  async getDeviceInfo(): Promise<Record<string, any>> {
    try {
      if (this.deviceAutomationModule) {
        return await this.deviceAutomationModule.getDeviceInfo();
      }
      return {};
    } catch (error) {
      console.error('Failed to get device info:', error);
      return {};
    }
  }

  /**
   * Check if a specific action can be performed
   */
  canPerformAction(capability: string): boolean {
    const cap = this.capabilities.get(capability);
    return !!(cap && cap.available && this.permissionsGranted.has(capability));
  }

  /**
   * Get available capabilities
   */
  getAvailableCapabilities(): DeviceCapability[] {
    return Array.from(this.capabilities.values()).filter(cap => cap.available);
  }

  /**
   * Get permission status
   */
  getPermissionStatus(): Record<string, boolean> {
    const status: Record<string, boolean> = {};
    for (const [name] of this.capabilities) {
      status[name] = this.permissionsGranted.has(name);
    }
    return status;
  }

  /**
   * Process natural language device commands
   */
  async processNaturalLanguageCommand(command: string): Promise<{ action?: PhoneControlAction; response: string }> {
    const lowerCommand = command.toLowerCase();

    // Simple pattern matching for common commands
    if (lowerCommand.includes('call') && lowerCommand.includes('mom')) {
      return {
        action: {
          id: 'call_mom',
          type: 'call',
          target: 'mom', // This would be resolved to actual number
          parameters: {},
          requiresConfirmation: true
        },
        response: "I'll help you call mom. Let me check your contacts for her number."
      };
    }

    if (lowerCommand.includes('text') || lowerCommand.includes('message')) {
      return {
        response: "I can help you send a message. Who would you like to text and what message should I send?"
      };
    }

    if (lowerCommand.includes('wifi') && lowerCommand.includes('on')) {
      return {
        action: {
          id: 'wifi_on',
          type: 'setting_toggle',
          target: 'wifi',
          parameters: { enabled: true },
          requiresConfirmation: false
        },
        response: "I'll turn on WiFi for you."
      };
    }

    return {
      response: "I'm not sure how to help with that device command yet. I'm still learning!"
    };
  }

  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down Device Controller...');
    this.initialized = false;
    this.emit('shutdown');
  }
}
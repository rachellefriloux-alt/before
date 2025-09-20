/**
 * Sallie AI - Main System Orchestrator
 * Coordinates all core modules: Device Control, Memory, Personality, and Technical Services
 */

import { DeviceControlSystem } from './device/DeviceControlSystem';
import { PluginRegistry } from './PluginRegistry';
import { personalityBridge, getTraits, setTraits } from './PersonalityBridge';

class SystemOrchestrator {
  private static instance: SystemOrchestrator;
  private deviceControl: DeviceControlSystem;
  private pluginRegistry: PluginRegistry;
  private initialized: boolean = false;

  private constructor() {
    this.pluginRegistry = PluginRegistry.getInstance();
    this.deviceControl = new DeviceControlSystem(this.pluginRegistry);
  }

  static getInstance(): SystemOrchestrator {
    if (!SystemOrchestrator.instance) {
      SystemOrchestrator.instance = new SystemOrchestrator();
    }
    return SystemOrchestrator.instance;
  }

  /**
   * Initialize all system modules
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      console.log('Initializing Sallie AI System Orchestrator...');

      // Initialize device control system
      await this.deviceControl.initialize();

      this.initialized = true;
      console.log('Sallie AI System Orchestrator initialized successfully');
    } catch (error) {
      console.error('Failed to initialize System Orchestrator:', error);
      throw error;
    }
  }

  /**
   * Get device control system
   */
  getDeviceControl(): DeviceControlSystem {
    return this.deviceControl;
  }

  /**
   * Get plugin registry
   */
  getPluginRegistry(): PluginRegistry {
    return this.pluginRegistry;
  }

  /**
   * Get personality traits
   */
  getPersonalityTraits() {
    return getTraits();
  }

  /**
   * Set personality traits
   */
  setPersonalityTraits(traits: any) {
    setTraits(traits);
  }
}

// Export singleton instance
export const systemOrchestrator = SystemOrchestrator.getInstance();
export default systemOrchestrator;

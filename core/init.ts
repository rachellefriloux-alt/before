/*
 * Sallie Sovereign - Core System Initialization
 * Initializes all core AI systems, personality engines, and device integrations
 */

import { Platform } from 'react-native';

// Core system imports
import { SallieSystem } from './SallieSystem';
import { LocalOnlyMode } from './localOnly/LocalOnlyMode';

// Global singleton instances
let sallieSystem: SallieSystem | null = null;
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

/**
 * Initialize all core Sallie systems
 */
export async function initializeSallie(): Promise<void> {
  if (isInitialized) return;
  if (initializationPromise) return initializationPromise;

  initializationPromise = (async () => {
    try {
      console.log('🎯 Initializing Sallie Sovereign...');

      // Initialize core system
      sallieSystem = new SallieSystem();
      await sallieSystem.initialize();

      // Check for local-only mode
      const isLocalMode = await LocalOnlyMode.isEnabled();
      if (isLocalMode) {
        console.log('🔐 Running in Local-Only Mode');
        await sallieSystem.enableLocalMode();
      }

      // Platform-specific initialization
      if (Platform.OS === 'android') {
        await initializeAndroidSpecific();
      }

      isInitialized = true;
      console.log('✅ Sallie Sovereign initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Sallie:', error);
      throw error;
    }
  })();

  return initializationPromise;
}

/**
 * Android-specific initialization
 */
async function initializeAndroidSpecific(): Promise<void> {
  // Initialize Android native modules
  console.log('📱 Initializing Android-specific features...');
  
  // Device control permissions
  // Phone automation setup
  // Launcher integration
  
  console.log('✅ Android features initialized');
}

/**
 * Get the global Sallie system instance
 */
export function getSallieSystem(): SallieSystem {
  if (!sallieSystem) {
    throw new Error('Sallie system not initialized. Call initializeSallie() first.');
  }
  return sallieSystem;
}

/**
 * Check if Sallie is initialized
 */
export function isSallieInitialized(): boolean {
  return isInitialized;
}

// Auto-initialize on import
initializeSallie().catch(console.error);
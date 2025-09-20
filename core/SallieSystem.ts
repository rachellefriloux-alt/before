/*
 * Sallie Sovereign - Main System Orchestrator
 * Coordinates all AI systems, personality engines, and device control
 */

import { EventEmitter } from 'events';
import { AIOrchestrationSystem } from '../ai/orchestration/AIOrchestrationIndex';
import { PersonalitySystem } from './personality/PersonalitySystem';
import { MemorySystem } from './memory/MemorySystem';
import { EmotionalEngine } from './emotional/EmotionalEngine';
import { DeviceController } from './device/DeviceController';

export class SallieSystem extends EventEmitter {
  private aiOrchestrator!: AIOrchestrationSystem;
  private personalitySystem!: PersonalitySystem;
  private memorySystem!: MemorySystem;
  private emotionalEngine!: EmotionalEngine;
  private deviceController!: DeviceController;
  private initialized = false;
  private localMode = false;

  constructor() {
    super();
    console.log('🧠 Creating Sallie System...');
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      console.log('⚡ Initializing Sallie System components...');

      // Initialize core systems in order
      await this.initializeMemorySystem();
      await this.initializeEmotionalEngine();
      await this.initializePersonalitySystem();
      await this.initializeAIOrchestrator();
      await this.initializeDeviceController();

      // Connect systems
      this.connectSystems();

      this.initialized = true;
      this.emit('initialized');
      console.log('✅ Sallie System fully initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Sallie System:', error);
      throw error;
    }
  }

  private async initializeMemorySystem(): Promise<void> {
    console.log('💭 Initializing Memory System...');
    this.memorySystem = new MemorySystem();
    await this.memorySystem.initialize();
  }

  private async initializeEmotionalEngine(): Promise<void> {
    console.log('❤️ Initializing Emotional Engine...');
    this.emotionalEngine = new EmotionalEngine();
    await this.emotionalEngine.initialize();
  }

  private async initializePersonalitySystem(): Promise<void> {
    console.log('🎭 Initializing Personality System...');
    this.personalitySystem = new PersonalitySystem();
    await this.personalitySystem.initialize();
  }

  private async initializeAIOrchestrator(): Promise<void> {
    console.log('🤖 Initializing AI Orchestrator...');
    // Will be implemented with the AI orchestration system
    console.log('⚠️ AI Orchestrator initialization deferred');
  }

  private async initializeDeviceController(): Promise<void> {
    console.log('📱 Initializing Device Controller...');
    this.deviceController = new DeviceController();
    await this.deviceController.initialize();
  }

  private connectSystems(): void {
    console.log('🔗 Connecting system interfaces...');

    // Connect memory to emotional engine
    this.emotionalEngine.setMemorySystem(this.memorySystem);

    // Connect personality to emotional engine
    this.personalitySystem.setEmotionalEngine(this.emotionalEngine);

    // Connect device controller to personality
    this.deviceController.setPersonalitySystem(this.personalitySystem);

    console.log('✅ Systems connected');
  }

  async enableLocalMode(): Promise<void> {
    console.log('🔐 Enabling Local-Only Mode...');
    this.localMode = true;
    
    // Disable cloud features
    if (this.aiOrchestrator) {
      await this.aiOrchestrator.enableLocalMode();
    }

    this.emit('localModeEnabled');
    console.log('✅ Local-Only Mode enabled');
  }

  // Getters for system access
  getMemorySystem(): MemorySystem {
    return this.memorySystem;
  }

  getEmotionalEngine(): EmotionalEngine {
    return this.emotionalEngine;
  }

  getPersonalitySystem(): PersonalitySystem {
    return this.personalitySystem;
  }

  getDeviceController(): DeviceController {
    return this.deviceController;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  isLocalMode(): boolean {
    return this.localMode;
  }

  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down Sallie System...');
    
    if (this.deviceController) {
      await this.deviceController.shutdown();
    }

    this.initialized = false;
    this.emit('shutdown');
    console.log('✅ Sallie System shutdown complete');
  }
}
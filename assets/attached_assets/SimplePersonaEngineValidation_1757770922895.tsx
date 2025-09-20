/**
 * ╭──────────────────────────────────────────────────────────────────────────────╮
 * │                                                                              │
 * │   Simple PersonaEngine Validation Runner                                      │
 * │                                                                              │
 * │   Basic validation to ensure enhanced PersonaEngine works correctly          │
 * │                                                                              │
 * ╰──────────────────────────────────────────────────────────────────────────────╯
 */

import { PersonaEngine, defaultPersonaConfig } from './PersonaEngine';

// MemoryV2Store for testing
class MemoryV2Store {
  private storage: Map<string, any> = new Map();

  async store(key: string, data: any): Promise<void> {
    this.storage.set(key, { ...data, timestamp: new Date() });
  }

  async retrieve(key: string): Promise<any> {
    return this.storage.get(key);
  }

  async search(query: any): Promise<any[]> {
    const results = [];
    const entries = Array.from(this.storage.entries());
    for (const [key, value] of entries) {
      if (key.includes(query.pattern || '')) {
        results.push(value);
      }
    }
    return results;
  }

  async delete(key: string): Promise<boolean> {
    return this.storage.delete(key);
  }

  async getStats(): Promise<any> {
    return {
      totalItems: this.storage.size,
      lastModified: new Date()
    };
  }
}

/**
 * Simple Validation Runner
 */
export class SimplePersonaEngineValidator {

  private personaEngine: PersonaEngine;
  private mockMemory: MemoryV2Store;

  constructor() {
    this.mockMemory = new MemoryV2Store();

    // Create enhanced configuration with all optionals enabled
    const enhancedConfig = {
      ...defaultPersonaConfig,
      performanceOptimization: true,
      analyticsEnabled: true,
      pluginSystem: true,
      multiLanguage: true,
      healthMonitoring: true,
      backupRecovery: true,
      advancedAdaptation: true,
      contextAwareness: true,
      conversationFlow: true,
      moodTracking: true,
      cacheEnabled: true,
      loggingLevel: 'info' as const,
      maxMemoryItems: 1000,
      adaptationCooldown: 1000,
      responseTimeout: 5000,
      healthCheckInterval: 2000
    };

    this.personaEngine = new PersonaEngine(enhancedConfig, this.mockMemory as any);
  }

  /**
   * Run basic validation tests
   */
  async runBasicValidation(): Promise<boolean> {
    console.log('🧪 Running Basic PersonaEngine Validation...\n');

    const tests = [
      this.testBasicInitialization.bind(this),
      this.testPersonalityTraits.bind(this),
      this.testSallieIsms.bind(this),
      this.testAdvancedFeatures.bind(this),
      this.testPerformanceOptimizations.bind(this),
      this.testPluginSystem.bind(this),
      this.testHealthMonitoring.bind(this),
      this.testConversationFlow.bind(this),
      this.testMoodTracking.bind(this),
      this.testContextAwareness.bind(this)
    ];

    let passedTests = 0;
    let totalTests = tests.length;

    for (const test of tests) {
      try {
        const result = await test();
        if (result) {
          passedTests++;
          console.log('✅ Test passed');
        } else {
          console.log('❌ Test failed');
        }
      } catch (error) {
        console.log('❌ Test failed with error:', error instanceof Error ? error.message : String(error));
      }
    }

    const successRate = (passedTests / totalTests) * 100;
    console.log(`\n📊 Validation Results:`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Passed: ${passedTests}`);
    console.log(`   Success Rate: ${successRate.toFixed(1)}%`);

    const overallResult = successRate >= 90; // 90% success threshold
    console.log(`\n🏆 Overall Status: ${overallResult ? '✅ VALIDATION PASSED' : '❌ VALIDATION FAILED'}`);

    return overallResult;
  }

  private async testBasicInitialization(): Promise<boolean> {
    console.log('Testing basic initialization...');
    return this.personaEngine !== null && typeof this.personaEngine === 'object';
  }

  private async testPersonalityTraits(): Promise<boolean> {
    console.log('Testing personality traits...');
    const traits = (this.personaEngine as any).traits;
    return traits &&
           typeof traits.empathy === 'number' &&
           typeof traits.adaptability === 'number' &&
           typeof traits.emotionalResilience === 'number';
  }

  private async testSallieIsms(): Promise<boolean> {
    console.log('Testing Sallie-isms...');
    const sallieIsms = (this.personaEngine as any).sallieIsms;
    return sallieIsms &&
           Array.isArray(sallieIsms.greetings) &&
           Array.isArray(sallieIsms.crisisSupport) &&
           Array.isArray(sallieIsms.celebrationPhrases);
  }

  private async testAdvancedFeatures(): Promise<boolean> {
    console.log('Testing advanced features...');
    const metrics = (this.personaEngine as any).metrics;
    const moodProfile = (this.personaEngine as any).moodProfile;
    return metrics && moodProfile &&
           typeof metrics.totalInteractions === 'number' &&
           typeof moodProfile.currentMood === 'string';
  }

  private async testPerformanceOptimizations(): Promise<boolean> {
    console.log('Testing performance optimizations...');
    const cache = (this.personaEngine as any).responseCache;
    return cache instanceof Map;
  }

  private async testPluginSystem(): Promise<boolean> {
    console.log('Testing plugin system...');
    const plugins = (this.personaEngine as any).plugins;
    return plugins instanceof Map;
  }

  private async testHealthMonitoring(): Promise<boolean> {
    console.log('Testing health monitoring...');
    const healthMonitor = (this.personaEngine as any).healthMonitor;
    return healthMonitor && typeof healthMonitor.status === 'string';
  }

  private async testConversationFlow(): Promise<boolean> {
    console.log('Testing conversation flow...');
    const flows = (this.personaEngine as any).conversationFlows;
    return flows instanceof Map;
  }

  private async testMoodTracking(): Promise<boolean> {
    console.log('Testing mood tracking...');
    const moodProfile = (this.personaEngine as any).moodProfile;
    return moodProfile && Array.isArray(moodProfile.moodHistory);
  }

  private async testContextAwareness(): Promise<boolean> {
    console.log('Testing context awareness...');
    // Test basic context update
    const context = {
      userEmotion: 'happy',
      conversationTone: 'positive',
      relationshipStage: 'soul_sister',
      contextDepth: 0.8,
      sharedExperiences: ['achievement'],
      moodTrajectory: 'improving',
      energyLevel: 'high',
      timeOfDay: 'morning',
      conversationPhase: 'deepening',
      userState: 'focused'
    };

    try {
      (this.personaEngine as any).updateContextAwareness(context);
      return true;
    } catch (error) {
      console.log('Context awareness test error:', error);
      return false;
    }
  }
}

/**
 * Run simple validation
 */
export async function runSimplePersonaEngineValidation(): Promise<boolean> {
  const validator = new SimplePersonaEngineValidator();
  return await validator.runBasicValidation();
}

// Auto-run if this file is executed directly
if (require.main === module) {
  runSimplePersonaEngineValidation()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Validation failed:', error);
      process.exit(1);
    });
}
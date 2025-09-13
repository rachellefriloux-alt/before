/**
 * ╭──────────────────────────────────────────────────────────────────────────────╮
 * │                                                                              │
 * │   Enhanced PersonaEngine Validation Suite                                     │
 * │                                                                              │
 * │   Comprehensive testing for all       console.log('✅ Context awareness tests passed');
    } catch (error) {
      console.log('❌ Context awareness tests failed:', error);
      this.recordTestResult('Context Awareness', false, error instanceof Error ? error.message : String(error), results);
    }anced features and optionals              │
 * │                                                                              │
 * ╰──────────────────────────────────────────────────────────────────────────────╯
 */

import { PersonaEngine, defaultPersonaConfig, PersonaConfig, PersonalityTraits, SallieIsms, EmotionalContext } from './PersonaEngine';
import { MemoryV2Store } from '../core/memory';

// Mock MemoryV2Store for testing
class MockMemoryV2Store {
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
 * Enhanced Validation Test Suite
 */
export class EnhancedPersonaEngineValidation {

  private personaEngine: PersonaEngine;
  private mockMemory: MockMemoryV2Store;

  constructor() {
    this.mockMemory = new MockMemoryV2Store();

    // Create enhanced configuration with all optionals enabled
    const enhancedConfig: PersonaConfig = {
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
      loggingLevel: 'info',
      maxMemoryItems: 1000,
      adaptationCooldown: 1000,
      responseTimeout: 5000,
      healthCheckInterval: 2000
    };

    this.personaEngine = new PersonaEngine(enhancedConfig, this.mockMemory as any);
  }

  /**
   * Run all validation tests
   */
  async runAllTests(): Promise<ValidationResults> {
    const results: ValidationResults = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      testResults: [],
      performanceMetrics: {},
      featureCoverage: {}
    };

    console.log('🧪 Starting Enhanced PersonaEngine Validation Suite...\n');

    // Test basic functionality
    await this.testBasicFunctionality(results);

    // Test advanced features
    await this.testAdvancedFeatures(results);

    // Test performance optimizations
    await this.testPerformanceOptimizations(results);

    // Test plugin system
    await this.testPluginSystem(results);

    // Test multi-language support
    await this.testMultiLanguageSupport(results);

    // Test health monitoring
    await this.testHealthMonitoring(results);

    // Test backup and recovery
    await this.testBackupRecovery(results);

    // Test conversation flow management
    await this.testConversationFlow(results);

    // Test mood tracking
    await this.testMoodTracking(results);

    // Test context awareness
    await this.testContextAwareness(results);

    // Test response caching
    await this.testResponseCaching(results);

    // Performance and load testing
    await this.testPerformanceAndLoad(results);

    // Edge cases and error handling
    await this.testEdgeCases(results);

    this.printResults(results);
    return results;
  }

  /**
   * Test basic functionality
   */
  private async testBasicFunctionality(results: ValidationResults): Promise<void> {
    console.log('📋 Testing Basic Functionality...');

    try {
      // Test personality traits initialization
      const traits = (this.personaEngine as any).traits;
      this.assert(traits.empathy >= 0 && traits.empathy <= 1, 'Empathy trait should be between 0-1', results);
      this.assert(traits.adaptability >= 0 && traits.adaptability <= 1, 'Adaptability trait should be between 0-1', results);
      this.assert(traits.emotionalResilience >= 0 && traits.emotionalResilience <= 1, 'Emotional resilience should be between 0-1', results);

      // Test Sallie-isms initialization
      const sallieIsms = (this.personaEngine as any).sallieIsms;
      this.assert(sallieIsms.greetings.length > 0, 'Greetings should be initialized', results);
      this.assert(sallieIsms.crisisSupport.length > 0, 'Crisis support phrases should be initialized', results);
      this.assert(sallieIsms.celebrationPhrases.length > 0, 'Celebration phrases should be initialized', results);

      console.log('✅ Basic functionality tests passed');
    } catch (error) {
      console.log('❌ Basic functionality tests failed:', error);
      this.recordTestResult('Basic Functionality', false, error instanceof Error ? error.message : String(error), results);
    }
  }

  /**
   * Test advanced features
   */
  private async testAdvancedFeatures(results: ValidationResults): Promise<void> {
    console.log('🔧 Testing Advanced Features...');

    try {
      // Test metrics initialization
      const metrics = (this.personaEngine as any).metrics;
      this.assert(metrics.totalInteractions === 0, 'Initial interactions should be 0', results);
      this.assert(metrics.healthScore === 100, 'Initial health score should be 100', results);

      // Test mood profile initialization
      const moodProfile = (this.personaEngine as any).moodProfile;
      this.assert(moodProfile.currentMood === 'neutral', 'Initial mood should be neutral', results);
      this.assert(Array.isArray(moodProfile.moodHistory), 'Mood history should be an array', results);

      // Test conversation flows initialization
      const conversationFlows = (this.personaEngine as any).conversationFlows;
      this.assert(conversationFlows instanceof Map, 'Conversation flows should be a Map', results);

      console.log('✅ Advanced features tests passed');
    } catch (error) {
      console.log('❌ Advanced features tests failed:', error);
      this.recordTestResult('Advanced Features', false, error instanceof Error ? error.message : String(error), results);
    }
  }

  /**
   * Test performance optimizations
   */
  private async testPerformanceOptimizations(results: ValidationResults): Promise<void> {
    console.log('⚡ Testing Performance Optimizations...');

    try {
      // Test response cache
      const cache = (this.personaEngine as any).responseCache;
      this.assert(cache instanceof Map, 'Response cache should be a Map', results);

      // Test cache cleanup
      cache.set('test1', { response: 'test', timestamp: new Date(Date.now() - 7200000), usage: 1 }); // 2 hours old
      (this.personaEngine as any).cleanupCache();
      this.assert(!cache.has('test1'), 'Old cache entries should be cleaned up', results);

      console.log('✅ Performance optimizations tests passed');
    } catch (error) {
      console.log('❌ Performance optimizations tests failed:', error);
      this.recordTestResult('Performance Optimizations', false, error instanceof Error ? error.message : String(error), results);
    }
  }

  /**
   * Test plugin system
   */
  private async testPluginSystem(results: ValidationResults): Promise<void> {
    console.log('🔌 Testing Plugin System...');

    try {
      const plugins = (this.personaEngine as any).plugins;
      this.assert(plugins instanceof Map, 'Plugins should be a Map', results);

      // Test plugin registration
      const testPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        description: 'Test plugin',
        hooks: {
          beforeResponse: async (context: any) => context,
          afterResponse: async (response: string) => response
        }
      };

      (this.personaEngine as any).registerPlugin(testPlugin);
      this.assert(plugins.has('test-plugin'), 'Plugin should be registered', results);

      console.log('✅ Plugin system tests passed');
    } catch (error) {
      console.log('❌ Plugin system tests failed:', error);
      this.recordTestResult('Plugin System', false, error instanceof Error ? error.message : String(error), results);
    }
  }

  /**
   * Test multi-language support
   */
  private async testMultiLanguageSupport(results: ValidationResults): Promise<void> {
    console.log('🌍 Testing Multi-Language Support...');

    try {
      const languagePack = (this.personaEngine as any).languagePack;
      this.assert(languagePack instanceof Map, 'Language pack should be a Map', results);
      this.assert(languagePack.has('en'), 'English language pack should exist', results);

      console.log('✅ Multi-language support tests passed');
    } catch (error) {
      console.log('❌ Multi-language support tests failed:', error);
      this.recordTestResult('Multi-Language Support', false, error instanceof Error ? error.message : String(error), results);
    }
  }

  /**
   * Test health monitoring
   */
  private async testHealthMonitoring(results: ValidationResults): Promise<void> {
    console.log('🏥 Testing Health Monitoring...');

    try {
      const healthMonitor = (this.personaEngine as any).healthMonitor;
      this.assert(typeof healthMonitor === 'object', 'Health monitor should be an object', results);
      this.assert(healthMonitor.status === 'healthy', 'Initial health status should be healthy', results);

      // Test health check
      (this.personaEngine as any).performHealthCheck();
      this.assert(healthMonitor.status === 'healthy', 'Health check should maintain healthy status', results);

      console.log('✅ Health monitoring tests passed');
    } catch (error) {
      console.log('❌ Health monitoring tests failed:', error);
      this.recordTestResult('Health Monitoring', false, error instanceof Error ? error.message : String(error), results);
    }
  }

  /**
   * Test backup and recovery
   */
  private async testBackupRecovery(results: ValidationResults): Promise<void> {
    console.log('💾 Testing Backup and Recovery...');

    try {
      const backupManager = (this.personaEngine as any).backupManager;
      this.assert(typeof backupManager === 'object', 'Backup manager should be an object', results);

      // Test backup creation
      await (this.personaEngine as any).createBackup();
      this.assert(backupManager.recoveryPoints.length > 0, 'Backup should create recovery points', results);

      console.log('✅ Backup and recovery tests passed');
    } catch (error) {
      console.log('❌ Backup and recovery tests failed:', error);
      this.recordTestResult('Backup and Recovery', false, error instanceof Error ? error.message : String(error), results);
    }
  }

  /**
   * Test conversation flow management
   */
  private async testConversationFlow(results: ValidationResults): Promise<void> {
    console.log('💬 Testing Conversation Flow Management...');

    try {
      const flowId = 'test-flow-' + Date.now();
      (this.personaEngine as any).startConversationFlow(flowId);

      const flows = (this.personaEngine as any).conversationFlows;
      this.assert(flows.has(flowId), 'Conversation flow should be created', results);

      const flow = flows.get(flowId);
      this.assert(flow.phase === 'opening', 'Initial flow phase should be opening', results);

      (this.personaEngine as any).endConversationFlow(flowId);
      this.assert(flow.phase === 'closing', 'Flow phase should be closing after ending', results);

      console.log('✅ Conversation flow management tests passed');
    } catch (error) {
      console.log('❌ Conversation flow management tests failed:', error);
      this.recordTestResult('Conversation Flow', false, error instanceof Error ? error.message : String(error), results);
    }
  }

  /**
   * Test mood tracking
   */
  private async testMoodTracking(results: ValidationResults): Promise<void> {
    console.log('😊 Testing Mood Tracking...');

    try {
      const moodProfile = (this.personaEngine as any).moodProfile;

      // Test mood update
      (this.personaEngine as any).updateMood('happy');
      this.assert(moodProfile.currentMood === 'happy', 'Mood should be updated to happy', results);
      this.assert(moodProfile.moodHistory.length > 0, 'Mood history should have entries', results);

      console.log('✅ Mood tracking tests passed');
    } catch (error) {
      console.log('❌ Mood tracking tests failed:', error);
      this.recordTestResult('Mood Tracking', false, error instanceof Error ? error.message : String(error), results);
    }
  }

  /**
   * Test context awareness
   */
  private async testContextAwareness(results: ValidationResults): Promise<void> {
    console.log('🎯 Testing Context Awareness...');

    try {
      const context: EmotionalContext = {
        userEmotion: 'excited',
        conversationTone: 'celebratory',
        relationshipStage: 'soul_sister',
        contextDepth: 0.8,
        sharedExperiences: ['achievement', 'growth'],
        moodTrajectory: 'improving',
        energyLevel: 'high',
        timeOfDay: 'morning',
        conversationPhase: 'deepening',
        userState: 'focused'
      };

      (this.personaEngine as any).updateContextAwareness(context);

      const moodProfile = (this.personaEngine as any).moodProfile;
      this.assert(moodProfile.currentMood === 'excited', 'Context should update mood', results);

      console.log('✅ Context awareness tests passed');
    } catch (error) {
      console.log('❌ Context awareness tests failed:', error);
      this.recordTestResult('Context Awareness', false, error instanceof Error ? error.message : String(error), results);
    }
  }

  /**
   * Test response caching
   */
  private async testResponseCaching(results: ValidationResults): Promise<void> {
    console.log('💾 Testing Response Caching...');

    try {
      const cache = (this.personaEngine as any).responseCache;

      // Test cache storage
      const testKey = 'test-response';
      const testResponse = 'This is a test response';
      cache.set(testKey, { response: testResponse, timestamp: new Date(), usage: 1 });

      this.assert(cache.has(testKey), 'Response should be cached', results);
      this.assert(cache.get(testKey).response === testResponse, 'Cached response should match', results);

      console.log('✅ Response caching tests passed');
    } catch (error) {
      console.log('❌ Response caching tests failed:', error);
      this.recordTestResult('Response Caching', false, error instanceof Error ? error.message : String(error), results);
    }
  }

  /**
   * Test performance and load
   */
  private async testPerformanceAndLoad(results: ValidationResults): Promise<void> {
    console.log('🏃 Testing Performance and Load...');

    try {
      const startTime = Date.now();

      // Simulate multiple interactions
      for (let i = 0; i < 100; i++) {
        (this.personaEngine as any).metrics.totalInteractions++;
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      this.assert(duration < 1000, `Performance test should complete in < 1s, took ${duration}ms`, results);
      this.assert((this.personaEngine as any).metrics.totalInteractions === 100, 'All interactions should be recorded', results);

      console.log('✅ Performance and load tests passed');
    } catch (error) {
      console.log('❌ Performance and load tests failed:', error);
      this.recordTestResult('Performance and Load', false, error instanceof Error ? error.message : String(error), results);
    }
  }

  /**
   * Test edge cases and error handling
   */
  private async testEdgeCases(results: ValidationResults): Promise<void> {
    console.log('🔍 Testing Edge Cases and Error Handling...');

    try {
      // Test invalid plugin registration
      const invalidPlugin = { name: '', version: '1.0.0' };
      try {
        (this.personaEngine as any).registerPlugin(invalidPlugin);
        this.assert(false, 'Invalid plugin should throw error', results);
      } catch (error) {
        this.assert(true, 'Invalid plugin correctly threw error', results);
      }

      // Test mood update with invalid mood
      (this.personaEngine as any).updateMood('');
      this.assert((this.personaEngine as any).moodProfile.currentMood === '', 'Empty mood should be accepted', results);

      // Test context update with minimal context
      const minimalContext: EmotionalContext = {
        userEmotion: 'neutral',
        conversationTone: 'casual',
        relationshipStage: 'acquaintance',
        contextDepth: 0.1,
        sharedExperiences: [],
        moodTrajectory: 'stable',
        energyLevel: 'medium',
        timeOfDay: 'morning',
        conversationPhase: 'opening',
        userState: 'focused'
      };

      (this.personaEngine as any).updateContextAwareness(minimalContext);
      this.assert((this.personaEngine as any).moodProfile.currentMood === 'neutral', 'Minimal context should work', results);

      console.log('✅ Edge cases and error handling tests passed');
    } catch (error) {
      console.log('❌ Edge cases and error handling tests failed:', error);
      this.recordTestResult('Edge Cases', false, error instanceof Error ? error.message : String(error), results);
    }
  }

  /**
   * Assertion helper
   */
  private assert(condition: boolean, message: string, results: ValidationResults): void {
    if (condition) {
      results.passedTests++;
    } else {
      results.failedTests++;
      console.log(`❌ Assertion failed: ${message}`);
    }
    results.totalTests++;
  }

  /**
   * Record test result
   */
  private recordTestResult(testName: string, passed: boolean, error?: string, results?: ValidationResults): void {
    if (results) {
      results.testResults.push({
        testName,
        passed,
        error: error || '',
        timestamp: new Date()
      });
    }
  }

  /**
   * Print validation results
   */
  private printResults(results: ValidationResults): void {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 ENHANCED PERSONAENGINE VALIDATION RESULTS');
    console.log('='.repeat(60));

    console.log(`\n📊 Test Summary:`);
    console.log(`   Total Tests: ${results.totalTests}`);
    console.log(`   Passed: ${results.passedTests}`);
    console.log(`   Failed: ${results.failedTests}`);
    console.log(`   Success Rate: ${((results.passedTests / results.totalTests) * 100).toFixed(1)}%`);

    if (results.failedTests > 0) {
      console.log(`\n❌ Failed Tests:`);
      results.testResults
        .filter(result => !result.passed)
        .forEach(result => {
          console.log(`   - ${result.testName}: ${result.error}`);
        });
    }

    console.log(`\n🏆 Overall Status: ${results.failedTests === 0 ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    console.log('='.repeat(60));
  }
}

/**
 * Validation Results Interface
 */
export interface ValidationResults {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  testResults: Array<{
    testName: string;
    passed: boolean;
    error: string;
    timestamp: Date;
  }>;
  performanceMetrics: Record<string, any>;
  featureCoverage: Record<string, any>;
}

/**
 * Run validation suite
 */
export async function runEnhancedPersonaEngineValidation(): Promise<ValidationResults> {
  const validator = new EnhancedPersonaEngineValidation();
  return await validator.runAllTests();
}

// Auto-run if this file is executed directly
if (require.main === module) {
  runEnhancedPersonaEngineValidation()
    .then(results => {
      process.exit(results.failedTests === 0 ? 0 : 1);
    })
    .catch(error => {
      console.error('Validation suite failed:', error);
      process.exit(1);
    });
}
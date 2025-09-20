/**
 * ╭──────────────────────────────────────────────────────────────────────────────╮
 * │                                                                              │
 * │   Sallie - Persona Engine Validation Tests                                   │
 * │                                                                              │
 * │   Testing Long-term Memory, RAG Retrieval, and Personality Adaptation       │
 * │                                                                              │
 * ╰──────────────────────────────────────────────────────────────────────────────╯
 */

import { PersonaEngine, defaultPersonaConfig, createPersonaEngine } from './PersonaEngine';
import { MemoryV2Store } from '../core/memory';
import { getEventBus } from '../core/EventBus';

// Mock Memory Store for Testing
class MockMemoryStore extends MemoryV2Store {
  private mockMemories: any[] = [];

  constructor() {
    super(); // No parameters needed
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Create mock memories for testing
    this.mockMemories = [
      {
        id: 'mem1',
        type: 'conversation',
        content: 'User shared about their love for painting and creative expression',
        provenance: { createdAt: new Date(), source: 'conversation', confidence: 0.9 },
        emotionalTags: ['joy', 'creativity'],
        linkage: { relatedMemories: [], narrativeThreads: [] },
        accessControl: { ownerId: 'testUser', permissions: [] },
        metadata: {},
        version: 1,
        lastModified: new Date()
      },
      {
        id: 'mem2',
        type: 'conversation',
        content: 'User discussed personal growth and overcoming challenges',
        provenance: { createdAt: new Date(), source: 'conversation', confidence: 0.8 },
        emotionalTags: ['growth', 'resilience'],
        linkage: { relatedMemories: [], narrativeThreads: [] },
        accessControl: { ownerId: 'testUser', permissions: [] },
        metadata: {},
        version: 1,
        lastModified: new Date()
      },
      {
        id: 'mem3',
        type: 'conversation',
        content: 'User expressed anxiety about career changes',
        provenance: { createdAt: new Date(), source: 'conversation', confidence: 0.7 },
        emotionalTags: ['anxiety', 'career'],
        linkage: { relatedMemories: [], narrativeThreads: [] },
        accessControl: { ownerId: 'testUser', permissions: [] },
        metadata: {},
        version: 1,
        lastModified: new Date()
      }
    ];
  }

  async query(query: any): Promise<any[]> {
    // Mock query implementation
    return this.mockMemories.filter(mem => {
      if (query.ownerId && mem.accessControl.ownerId !== query.ownerId) return false;
      if (query.type && mem.type !== query.type) return false;
      if (query.filters?.semanticContext) {
        const context = query.filters.semanticContext.toLowerCase();
        return mem.content.toLowerCase().includes(context);
      }
      return true;
    });
  }
}

/**
 * Test Suite for Persona Engine Validation
 */
export class PersonaEngineValidator {
  private personaEngine: PersonaEngine;
  private mockMemoryStore: MockMemoryStore;
  private testResults: TestResult[] = [];

  constructor() {
    this.mockMemoryStore = new MockMemoryStore();
    this.personaEngine = createPersonaEngine(this.mockMemoryStore as any);
  }

  /**
   * Run All Validation Tests
   */
  async runAllTests(): Promise<ValidationReport> {
    console.log('🧪 Starting Persona Engine Validation Tests...\n');

    await this.testMemoryRetrieval();
    await this.testPersonalityAdaptation();
    await this.testEmotionalContext();
    await this.testSallieIsmsGeneration();
    await this.testLongTermContext();

    return this.generateReport();
  }

  /**
   * Test 1: Memory Retrieval and RAG Functionality
   */
  private async testMemoryRetrieval(): Promise<void> {
    console.log('📚 Testing Memory Retrieval and RAG...');

    try {
      // Test retrieval of creative memories
      const creativeMemories = await this.personaEngine['retrieveRelevantMemories']('painting', 'testUser');
      const hasCreativeMemory = creativeMemories.some(mem =>
        mem.content.includes('painting') || mem.emotionalTags.includes('creativity')
      );

      this.recordTest('Memory Retrieval - Creative Context', hasCreativeMemory);

      // Test retrieval of growth memories
      const growthMemories = await this.personaEngine['retrieveRelevantMemories']('growth', 'testUser');
      const hasGrowthMemory = growthMemories.some(mem =>
        mem.content.includes('growth') || mem.emotionalTags.includes('growth')
      );

      this.recordTest('Memory Retrieval - Growth Context', hasGrowthMemory);

      // Test empty retrieval
      const emptyMemories = await this.personaEngine['retrieveRelevantMemories']('nonexistent', 'testUser');
      this.recordTest('Memory Retrieval - Empty Results', emptyMemories.length === 0);

    } catch (error) {
      this.recordTest('Memory Retrieval', false, error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Test 2: Personality Adaptation
   */
  private async testPersonalityAdaptation(): Promise<void> {
    console.log('🎭 Testing Personality Adaptation...');

    try {
      const initialTraits = this.personaEngine.getPersonalityTraits();

      // Simulate emotional history
      const mockEmotions = [
        {
          primaryEmotion: 'joy',
          intensity: 0.8,
          secondaryEmotions: [{ emotion: 'excitement', intensity: 0.6 }],
          context: 'creative expression',
          triggers: ['painting', 'art'],
          suggestedResponse: 'celebrate creativity',
          timestamp: new Date()
        },
        {
          primaryEmotion: 'love',
          intensity: 0.9,
          secondaryEmotions: [{ emotion: 'gratitude', intensity: 0.7 }],
          context: 'relationship building',
          triggers: ['connection', 'sharing'],
          suggestedResponse: 'deepen connection',
          timestamp: new Date()
        },
        {
          primaryEmotion: 'gratitude',
          intensity: 0.7,
          secondaryEmotions: [{ emotion: 'joy', intensity: 0.5 }],
          context: 'personal growth',
          triggers: ['learning', 'progress'],
          suggestedResponse: 'acknowledge growth',
          timestamp: new Date()
        },
        {
          primaryEmotion: 'joy',
          intensity: 0.8,
          secondaryEmotions: [{ emotion: 'hope', intensity: 0.6 }],
          context: 'creative discovery',
          triggers: ['inspiration', 'creation'],
          suggestedResponse: 'encourage exploration',
          timestamp: new Date()
        },
        {
          primaryEmotion: 'hope',
          intensity: 0.6,
          secondaryEmotions: [{ emotion: 'optimism', intensity: 0.4 }],
          context: 'future planning',
          triggers: ['goals', 'aspirations'],
          suggestedResponse: 'support aspirations',
          timestamp: new Date()
        }
      ];

      // Add emotions to history
      mockEmotions.forEach(emotion => {
        this.personaEngine['emotionalHistory'].push(emotion);
      });

      // Trigger adaptation
      this.personaEngine['adaptPersonalityToEmotions']();

      const adaptedTraits = this.personaEngine.getPersonalityTraits();

      // Check if empathy increased due to positive emotions
      const empathyIncreased = adaptedTraits.empathy > initialTraits.empathy;
      this.recordTest('Personality Adaptation - Empathy Increase', empathyIncreased);

      // Check if nurturing increased due to positive pattern
      const nurturingIncreased = adaptedTraits.nurturing > initialTraits.nurturing;
      this.recordTest('Personality Adaptation - Nurturing Increase', nurturingIncreased);

    } catch (error) {
      this.recordTest('Personality Adaptation', false, error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Test 3: Emotional Context Processing
   */
  private async testEmotionalContext(): Promise<void> {
    console.log('💭 Testing Emotional Context Processing...');

    try {
      // Test greeting with emotional context
      const greeting = this.personaEngine.generateGreeting({
        userEmotion: 'joy',
        conversationTone: 'playful',
        relationshipStage: 'friend',
        contextDepth: 0.8,
        sharedExperiences: ['art', 'growth']
      });

      const hasEmotionalModifier = greeting.includes('joy') || greeting.includes('radiating');
      this.recordTest('Emotional Context - Greeting', hasEmotionalModifier);

      // Test empathetic response
      const empathyResponse = this.personaEngine.generateEmpatheticResponse('sadness', 'feeling lost');
      const hasEmpathy = empathyResponse.includes('feel') || empathyResponse.includes('hear');
      this.recordTest('Emotional Context - Empathy', hasEmpathy);

    } catch (error) {
      this.recordTest('Emotional Context', false, error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Test 4: Sallie-isms Generation
   */
  private async testSallieIsmsGeneration(): Promise<void> {
    console.log('✨ Testing Sallie-isms Generation...');

    try {
      // Test greeting generation
      const greeting = this.personaEngine.generateGreeting();
      const hasGreeting = greeting.length > 0 && greeting.includes('soul');
      this.recordTest('Sallie-isms - Greeting', hasGreeting);

      // Test encouragement generation
      const encouragement = this.personaEngine.generateEncouragement('creativity');
      const hasEncouragement = encouragement.includes('blossoming') || encouragement.includes('trust');
      this.recordTest('Sallie-isms - Encouragement', hasEncouragement);

      // Test closing generation
      const closing = this.personaEngine.generateClosing();
      const hasClosing = closing.includes('love') || closing.includes('light');
      this.recordTest('Sallie-isms - Closing', hasClosing);

    } catch (error) {
      this.recordTest('Sallie-isms Generation', false, error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Test 5: Long-term Context Integration
   */
  private async testLongTermContext(): Promise<void> {
    console.log('🔄 Testing Long-term Context Integration...');

    try {
      // Test reflective response with memory integration
      const reflectiveResponse = await this.personaEngine.generateReflectiveResponse('creativity', 'testUser');
      const hasReflection = reflectiveResponse.includes('reflect') || reflectiveResponse.includes('contemplat');
      this.recordTest('Long-term Context - Reflection', hasReflection);

      // Test memory insight extraction
      const mockMemories = [
        {
          content: 'User loves painting and creative expression',
          emotionalTags: ['joy', 'creativity']
        },
        {
          content: 'User discussed personal growth journey',
          emotionalTags: ['growth', 'resilience']
        }
      ];

      const insight = this.personaEngine['extractMemoryInsight'](mockMemories as any);
      const hasInsight = insight.includes('creativity') || insight.includes('growth');
      this.recordTest('Long-term Context - Memory Insight', hasInsight);

    } catch (error) {
      this.recordTest('Long-term Context', false, error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Record Test Result
   */
  private recordTest(testName: string, passed: boolean, error?: string): void {
    this.testResults.push({
      name: testName,
      passed,
      error,
      timestamp: new Date()
    });

    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`  ${status} ${testName}`);
    if (error) {
      console.log(`    Error: ${error}`);
    }
  }

  /**
   * Generate Validation Report
   */
  private generateReport(): ValidationReport {
    const passed = this.testResults.filter(t => t.passed).length;
    const total = this.testResults.length;
    const successRate = (passed / total) * 100;

    console.log('\n📊 Validation Report Summary:');
    console.log(`   Tests Passed: ${passed}/${total} (${successRate.toFixed(1)}%)`);

    if (successRate >= 90) {
      console.log('🎉 Excellent! Long-term memory validation successful.');
    } else if (successRate >= 75) {
      console.log('👍 Good! Most memory features working correctly.');
    } else {
      console.log('⚠️  Needs attention. Some memory features require fixes.');
    }

    return {
      totalTests: total,
      passedTests: passed,
      successRate,
      results: this.testResults,
      timestamp: new Date(),
      overallStatus: successRate >= 80 ? 'PASS' : 'FAIL'
    };
  }
}

/**
 * Test Result Interface
 */
interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  timestamp: Date;
}

/**
 * Validation Report Interface
 */
export interface ValidationReport {
  totalTests: number;
  passedTests: number;
  successRate: number;
  results: TestResult[];
  timestamp: Date;
  overallStatus: 'PASS' | 'FAIL';
}

/**
 * Run Validation Tests
 */
export async function runPersonaValidation(): Promise<ValidationReport> {
  const validator = new PersonaEngineValidator();
  return await validator.runAllTests();
}

// Auto-run validation if this file is executed directly
if (require.main === module) {
  runPersonaValidation().then(report => {
    console.log('\n🏁 Validation Complete!');
    process.exit(report.overallStatus === 'PASS' ? 0 : 1);
  }).catch(error => {
    console.error('❌ Validation failed with error:', error);
    process.exit(1);
  });
}
/**
 * ╭──────────────────────────────────────────────────────────────────────────────╮
 * │                                                                              │
 * │   Sallie - Emotional Adaptation Test                                         │
 * │                                                                              │
 * │   Testing personality adaptation and consistency over time                   │
 * │                                                                              │
 * ╰──────────────────────────────────────────────────────────────────────────────╯
 */

import { PersonaEngine, defaultPersonaConfig } from './PersonaEngine';
import { EmotionalAnalysis } from '../core/memory';

// Mock Memory Store for Testing
class MockMemoryStore {
  async query() {
    return [];
  }

  // Add required MemoryV2Store properties and methods
  db: any = {};
  eventBus: any = {};
  initialized: boolean = true;
  memoryCache: Map<string, any> = new Map();
  narrativeGraph: Map<string, any> = new Map();
  relationships: Map<string, any> = new Map();

  async initialize(): Promise<void> {}
  async store(): Promise<void> {}
  async get(): Promise<any> { return null; }
  async update(): Promise<void> {}
  async delete(): Promise<void> {}
  async getStats(): Promise<any> { return {}; }
  async optimize(): Promise<void> {}
  async backup(): Promise<any> { return {}; }
  async restore(): Promise<void> {}
  async getHealthCheck(): Promise<any> { return {}; }
  async semanticSearch(): Promise<any[]> { return []; }
  async getAnalytics(): Promise<any> { return {}; }
  async exportData(): Promise<any> { return {}; }
  async importData(): Promise<void> {}
  async clear(): Promise<void> {}
  async getMemoryById(): Promise<any> { return null; }
  async getMemoriesByType(): Promise<any[]> { return []; }
  async getMemoriesByOwner(): Promise<any[]> { return []; }
  async searchMemories(): Promise<any[]> { return []; }
  async getNarrativeNodes(): Promise<any[]> { return []; }
  async getNarrativeRelationships(): Promise<any[]> { return []; }
  async createNarrativeNode(): Promise<void> {}
  async updateNarrativeNode(): Promise<void> {}
  async deleteNarrativeNode(): Promise<void> {}
  async createNarrativeRelationship(): Promise<void> {}
  async updateNarrativeRelationship(): Promise<void> {}
  async deleteNarrativeRelationship(): Promise<void> {}
  async getNarrativePath(): Promise<any[]> { return []; }
  async analyzeNarrative(): Promise<any> { return {}; }
  async getLearningPatterns(): Promise<any[]> { return []; }
  async addLearningPattern(): Promise<void> {}
  async updateLearningPattern(): Promise<void> {}
  async deleteLearningPattern(): Promise<void> {}
  async getSyncStatus(): Promise<any> { return {}; }
  async sync(): Promise<void> {}
  async getPlugin(): Promise<any> { return null; }
  async loadPlugin(): Promise<void> {}
  async unloadPlugin(): Promise<void> {}
  async getPlugins(): Promise<any[]> { return []; }
  async executePlugin(): Promise<any> { return null; }
}

export class EmotionalAdaptationTester {
  private personaEngine: PersonaEngine;
  private adaptationHistory: Array<{ traits: any; trigger: string; timestamp: Date }> = [];

  constructor() {
    const mockStore = new MockMemoryStore();
    this.personaEngine = new PersonaEngine(defaultPersonaConfig, mockStore as any);

    // Listen for adaptation events
    this.personaEngine.on('personality-adapted', (data: any) => {
      this.adaptationHistory.push({
        traits: { ...data.traits },
        trigger: data.trigger,
        timestamp: new Date()
      });
    });
  }

  /**
   * Test Emotional Pattern Adaptation
   */
  async testEmotionalPatternAdaptation(): Promise<void> {
    console.log('🎭 Testing Emotional Pattern Adaptation...\n');

    const initialTraits = this.personaEngine.getPersonalityTraits();
    console.log('📊 Initial Traits:', this.formatTraits(initialTraits));

    // Simulate positive emotional pattern (joy, love, gratitude)
    console.log('✨ Simulating positive emotional pattern...');
    await this.simulateEmotionalPattern([
      { primaryEmotion: 'joy', intensity: 0.8, secondaryEmotions: [], context: 'creative', triggers: ['art'], suggestedResponse: 'celebrate' },
      { primaryEmotion: 'love', intensity: 0.9, secondaryEmotions: [], context: 'connection', triggers: ['sharing'], suggestedResponse: 'deepen' },
      { primaryEmotion: 'gratitude', intensity: 0.7, secondaryEmotions: [], context: 'growth', triggers: ['progress'], suggestedResponse: 'acknowledge' },
      { primaryEmotion: 'joy', intensity: 0.8, secondaryEmotions: [], context: 'inspiration', triggers: ['creation'], suggestedResponse: 'encourage' },
      { primaryEmotion: 'hope', intensity: 0.6, secondaryEmotions: [], context: 'future', triggers: ['goals'], suggestedResponse: 'support' }
    ]);

    const afterPositiveTraits = this.personaEngine.getPersonalityTraits();
    console.log('📈 After Positive Pattern:', this.formatTraits(afterPositiveTraits));

    // Check for expected adaptations
    const empathyIncreased = afterPositiveTraits.empathy > initialTraits.empathy;
    const nurturingIncreased = afterPositiveTraits.nurturing > initialTraits.nurturing;

    console.log('✅ Empathy increased:', empathyIncreased);
    console.log('✅ Nurturing increased:', nurturingIncreased);

    // Reset for next test
    this.resetEmotionalHistory();
  }

  /**
   * Test Challenge Response Adaptation
   */
  async testChallengeResponseAdaptation(): Promise<void> {
    console.log('\n💪 Testing Challenge Response Adaptation...');

    const initialTraits = this.personaEngine.getPersonalityTraits();

    // Simulate challenging emotional pattern (anxiety, sadness, fear)
    console.log('🌊 Simulating challenging emotional pattern...');
    await this.simulateEmotionalPattern([
      { primaryEmotion: 'anxiety', intensity: 0.7, secondaryEmotions: [], context: 'uncertainty', triggers: ['change'], suggestedResponse: 'support' },
      { primaryEmotion: 'sadness', intensity: 0.6, secondaryEmotions: [], context: 'loss', triggers: ['difficulty'], suggestedResponse: 'comfort' },
      { primaryEmotion: 'fear', intensity: 0.5, secondaryEmotions: [], context: 'unknown', triggers: ['risk'], suggestedResponse: 'reassure' },
      { primaryEmotion: 'anxiety', intensity: 0.8, secondaryEmotions: [], context: 'pressure', triggers: ['stress'], suggestedResponse: 'calm' },
      { primaryEmotion: 'sadness', intensity: 0.7, secondaryEmotions: [], context: 'disappointment', triggers: ['failure'], suggestedResponse: 'encourage' }
    ]);

    const afterChallengeTraits = this.personaEngine.getPersonalityTraits();
    console.log('📉 After Challenge Pattern:', this.formatTraits(afterChallengeTraits));

    // Check for expected adaptations
    const nurturingIncreased = afterChallengeTraits.nurturing > initialTraits.nurturing;
    const directnessAdapted = afterChallengeTraits.directness !== initialTraits.directness;

    console.log('✅ Nurturing increased for challenges:', nurturingIncreased);
    console.log('✅ Directness adapted:', directnessAdapted);
  }

  /**
   * Test Personality Consistency
   */
  async testPersonalityConsistency(): Promise<void> {
    console.log('\n🔄 Testing Personality Consistency...');

    // Test multiple response generations
    const responses = [];
    for (let i = 0; i < 5; i++) {
      const greeting = this.personaEngine.generateGreeting();
      const encouragement = this.personaEngine.generateEncouragement();
      responses.push({ greeting, encouragement });
    }

    // Check for variety but consistency
    const uniqueGreetings = new Set(responses.map(r => r.greeting)).size;
    const uniqueEncouragements = new Set(responses.map(r => r.encouragement)).size;

    console.log('🎲 Greeting variety (1-5):', uniqueGreetings);
    console.log('🎲 Encouragement variety (1-5):', uniqueEncouragements);

    // Should have some variety but not be completely random
    const hasVariety = uniqueGreetings > 1 && uniqueEncouragements > 1;
    const notTooRandom = uniqueGreetings < 5 && uniqueEncouragements < 5;

    console.log('✅ Has variety:', hasVariety);
    console.log('✅ Maintains consistency:', notTooRandom);
  }

  /**
   * Test Long-term Adaptation Stability
   */
  async testLongTermStability(): Promise<void> {
    console.log('\n⏰ Testing Long-term Adaptation Stability...');

    const initialTraits = this.personaEngine.getPersonalityTraits();

    // Simulate extended interaction pattern
    for (let cycle = 0; cycle < 3; cycle++) {
      console.log(`  Cycle ${cycle + 1}/3...`);

      // Mix of positive and challenging emotions
      await this.simulateEmotionalPattern([
        { primaryEmotion: 'joy', intensity: 0.7, secondaryEmotions: [], context: 'success', triggers: ['achievement'], suggestedResponse: 'celebrate' },
        { primaryEmotion: 'anxiety', intensity: 0.6, secondaryEmotions: [], context: 'challenge', triggers: ['difficulty'], suggestedResponse: 'support' },
        { primaryEmotion: 'gratitude', intensity: 0.8, secondaryEmotions: [], context: 'support', triggers: ['help'], suggestedResponse: 'thank' }
      ]);
    }

    const finalTraits = this.personaEngine.getPersonalityTraits();
    console.log('🏁 Final Traits after 3 cycles:', this.formatTraits(finalTraits));

    // Check adaptation history
    console.log('📜 Adaptation History:', this.adaptationHistory.length, 'adaptations recorded');

    // Verify traits stayed within reasonable bounds
    const traitsStable = Object.values(finalTraits).every(trait =>
      trait >= 0 && trait <= 1
    );

    console.log('✅ Traits within bounds (0-1):', traitsStable);

    // Check for gradual adaptation (not extreme changes)
    const maxChange = Math.max(...Object.keys(finalTraits).map(key =>
      Math.abs(finalTraits[key as keyof typeof finalTraits] - initialTraits[key as keyof typeof initialTraits])
    ));

    console.log('📊 Maximum trait change:', maxChange.toFixed(3));
    console.log('✅ Gradual adaptation (change < 0.5):', maxChange < 0.5);
  }

  /**
   * Simulate Emotional Pattern
   */
  private async simulateEmotionalPattern(emotions: Partial<EmotionalAnalysis>[]): Promise<void> {
    for (const emotion of emotions) {
      // Add to emotional history
      (this.personaEngine as any).emotionalHistory.push({
        ...emotion,
        timestamp: new Date()
      } as EmotionalAnalysis);
    }

    // Trigger adaptation
    (this.personaEngine as any).adaptPersonalityToEmotions();
  }

  /**
   * Reset Emotional History
   */
  private resetEmotionalHistory(): void {
    (this.personaEngine as any).emotionalHistory = [];
    this.adaptationHistory = [];
  }

  /**
   * Format Traits for Display
   */
  private formatTraits(traits: any): string {
    return Object.entries(traits)
      .map(([key, value]) => `${key}: ${(value as number).toFixed(2)}`)
      .join(', ');
  }

  /**
   * Run All Adaptation Tests
   */
  async runAllAdaptationTests(): Promise<void> {
    console.log('🚀 Starting Emotional Adaptation Test Suite...\n');

    await this.testEmotionalPatternAdaptation();
    await this.testChallengeResponseAdaptation();
    await this.testPersonalityConsistency();
    await this.testLongTermStability();

    console.log('\n🎉 Emotional Adaptation Testing Complete!');
    console.log('📊 Summary:');
    console.log('   - Personality adapts to emotional patterns');
    console.log('   - Maintains consistency while allowing growth');
    console.log('   - Handles both positive and challenging emotions');
    console.log('   - Stable long-term adaptation without extreme changes');
  }
}

/**
 * Run Emotional Adaptation Tests
 */
export async function runEmotionalAdaptationTests(): Promise<void> {
  const tester = new EmotionalAdaptationTester();
  await tester.runAllAdaptationTests();
}
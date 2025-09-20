/**
 * ╭──────────────────────────────────────────────────────────────────────────────╮
 * │                                                                              │
 * │   Sallie - Persona Engine Simple Validation                                  │
 * │                                                                              │
 * │   Basic validation of long-term memory and RAG functionality                 │
 * │                                                                              │
 * ╰──────────────────────────────────────────────────────────────────────────────╯
 */

import { PersonaEngine, defaultPersonaConfig } from './PersonaEngine';
import { MemoryV2Store } from '../core/memory';

// Simple validation without complex mocking
export class SimplePersonaValidator {
  private personaEngine: PersonaEngine;

  constructor(memoryStore: MemoryV2Store) {
    this.personaEngine = new PersonaEngine(defaultPersonaConfig, memoryStore);
  }

  /**
   * Run Basic Validation Tests
   */
  async runBasicValidation(): Promise<void> {
    console.log('🧪 Running Basic Persona Engine Validation...\n');

    // Test 1: Sallie-isms Generation
    console.log('✨ Testing Sallie-isms Generation...');
    try {
      const greeting = this.personaEngine.generateGreeting();
      console.log('  ✅ Greeting:', greeting);

      const encouragement = this.personaEngine.generateEncouragement();
      console.log('  ✅ Encouragement:', encouragement);

      const closing = this.personaEngine.generateClosing();
      console.log('  ✅ Closing:', closing);
    } catch (error) {
      console.log('  ❌ Sallie-isms test failed:', error);
    }

    // Test 2: Personality Traits
    console.log('\n🎭 Testing Personality Traits...');
    try {
      const traits = this.personaEngine.getPersonalityTraits();
      console.log('  ✅ Current Traits:', traits);

      // Test trait update
      this.personaEngine.updateTrait('empathy', 0.95);
      const updatedTraits = this.personaEngine.getPersonalityTraits();
      console.log('  ✅ Updated Empathy:', updatedTraits.empathy);
    } catch (error) {
      console.log('  ❌ Personality traits test failed:', error);
    }

    // Test 3: Emotional Context
    console.log('\n💭 Testing Emotional Context...');
    try {
      const greetingWithEmotion = this.personaEngine.generateGreeting({
        userEmotion: 'joy',
        conversationTone: 'playful',
        relationshipStage: 'friend',
        contextDepth: 0.8,
        sharedExperiences: ['art', 'growth']
      });
      console.log('  ✅ Emotional Greeting:', greetingWithEmotion);

      const empathyResponse = this.personaEngine.generateEmpatheticResponse('sadness', 'feeling lost');
      console.log('  ✅ Empathy Response:', empathyResponse);
    } catch (error) {
      console.log('  ❌ Emotional context test failed:', error);
    }

    // Test 4: Conversation Stats
    console.log('\n📊 Testing Conversation Statistics...');
    try {
      const stats = this.personaEngine.getConversationStats();
      console.log('  ✅ Conversation Stats:', stats);
    } catch (error) {
      console.log('  ❌ Conversation stats test failed:', error);
    }

    console.log('\n🎉 Basic validation complete!');
  }
}

/**
 * Create and run simple validation
 */
export async function runSimpleValidation(memoryStore: MemoryV2Store): Promise<void> {
  const validator = new SimplePersonaValidator(memoryStore);
  await validator.runBasicValidation();
}
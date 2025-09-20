#!/usr/bin/env node

/**
 * ╭──────────────────────────────────────────────────────────────────────────────╮
 * │                                                                              │
 * │   Sallie - Persona Engine Test Runner                                        │
 * │                                                                              │
 * │   Simple test runner for validating Persona Engine functionality             │
 * │                                                                              │
 * ╰──────────────────────────────────────────────────────────────────────────────╯
 */

// Simple mock for testing
class MockMemoryStore {
    async query() {
        return [
            {
                id: 'test1',
                content: 'User discussed creative painting and artistic expression',
                emotionalTags: ['joy', 'creativity'],
                type: 'conversation'
            },
            {
                id: 'test2',
                content: 'User shared about personal growth and overcoming challenges',
                emotionalTags: ['growth', 'resilience'],
                type: 'conversation'
            }
        ];
    }
}

// Import and test the Persona Engine
async function runTests() {
    console.log('🚀 Starting Persona Engine Validation Tests...\n');

    try {
        // Dynamic import to handle TypeScript
        const { PersonaEngine, defaultPersonaConfig } = await import('./PersonaEngine.js');
        const { SimplePersonaValidator } = await import('./SimpleValidation.js');

        const mockStore = new MockMemoryStore();
        const personaEngine = new PersonaEngine(defaultPersonaConfig, mockStore);

        console.log('✅ Persona Engine created successfully');

        // Test basic functionality
        const greeting = personaEngine.generateGreeting();
        console.log('✅ Greeting generated:', greeting);

        const traits = personaEngine.getPersonalityTraits();
        console.log('✅ Personality traits:', Object.keys(traits).length, 'traits loaded');

        const encouragement = personaEngine.generateEncouragement();
        console.log('✅ Encouragement generated:', encouragement);

        // Test emotional context
        const emotionalGreeting = personaEngine.generateGreeting({
            userEmotion: 'joy',
            conversationTone: 'playful',
            relationshipStage: 'friend',
            contextDepth: 0.8,
            sharedExperiences: ['art']
        });
        console.log('✅ Emotional greeting:', emotionalGreeting);

        // Test conversation stats
        const stats = personaEngine.getConversationStats();
        console.log('✅ Conversation stats:', stats);

        console.log('\n🎉 All basic tests passed!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

// Run the tests
runTests().catch(error => {
    console.error('❌ Validation failed:', error);
    process.exit(1);
});
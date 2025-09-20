"use strict";
/**
 * ╭──────────────────────────────────────────────────────────────────────────────╮
 * │                                                                              │
 * │   Simple PersonaEngine Validation Runner                                      │
 * │                                                                              │
 * │   Basic validation to ensure enhanced PersonaEngine works correctly          │
 * │                                                                              │
 * ╰──────────────────────────────────────────────────────────────────────────────╯
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimplePersonaEngineValidator = void 0;
exports.runSimplePersonaEngineValidation = runSimplePersonaEngineValidation;
const PersonaEngine_1 = require("./PersonaEngine");
// Mock MemoryV2Store for testing
class MockMemoryV2Store {
    constructor() {
        this.storage = new Map();
    }
    async store(key, data) {
        this.storage.set(key, Object.assign(Object.assign({}, data), { timestamp: new Date() }));
    }
    async retrieve(key) {
        return this.storage.get(key);
    }
    async search(query) {
        const results = [];
        const entries = Array.from(this.storage.entries());
        for (const [key, value] of entries) {
            if (key.includes(query.pattern || '')) {
                results.push(value);
            }
        }
        return results;
    }
    async delete(key) {
        return this.storage.delete(key);
    }
    async getStats() {
        return {
            totalItems: this.storage.size,
            lastModified: new Date()
        };
    }
}
/**
 * Simple Validation Runner
 */
class SimplePersonaEngineValidator {
    constructor() {
        this.mockMemory = new MockMemoryV2Store();
        // Create enhanced configuration with all optionals enabled
        const enhancedConfig = Object.assign(Object.assign({}, PersonaEngine_1.defaultPersonaConfig), { performanceOptimization: true, analyticsEnabled: true, pluginSystem: true, multiLanguage: true, healthMonitoring: true, backupRecovery: true, advancedAdaptation: true, contextAwareness: true, conversationFlow: true, moodTracking: true, cacheEnabled: true, loggingLevel: 'info', maxMemoryItems: 1000, adaptationCooldown: 1000, responseTimeout: 5000, healthCheckInterval: 2000 });
        this.personaEngine = new PersonaEngine_1.PersonaEngine(enhancedConfig, this.mockMemory);
    }
    /**
     * Run basic validation tests
     */
    async runBasicValidation() {
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
                }
                else {
                    console.log('❌ Test failed');
                }
            }
            catch (error) {
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
    async testBasicInitialization() {
        console.log('Testing basic initialization...');
        return this.personaEngine !== null && typeof this.personaEngine === 'object';
    }
    async testPersonalityTraits() {
        console.log('Testing personality traits...');
        const traits = this.personaEngine.traits;
        return traits &&
            typeof traits.empathy === 'number' &&
            typeof traits.adaptability === 'number' &&
            typeof traits.emotionalResilience === 'number';
    }
    async testSallieIsms() {
        console.log('Testing Sallie-isms...');
        const sallieIsms = this.personaEngine.sallieIsms;
        return sallieIsms &&
            Array.isArray(sallieIsms.greetings) &&
            Array.isArray(sallieIsms.crisisSupport) &&
            Array.isArray(sallieIsms.celebrationPhrases);
    }
    async testAdvancedFeatures() {
        console.log('Testing advanced features...');
        const metrics = this.personaEngine.metrics;
        const moodProfile = this.personaEngine.moodProfile;
        return metrics && moodProfile &&
            typeof metrics.totalInteractions === 'number' &&
            typeof moodProfile.currentMood === 'string';
    }
    async testPerformanceOptimizations() {
        console.log('Testing performance optimizations...');
        const cache = this.personaEngine.responseCache;
        return cache instanceof Map;
    }
    async testPluginSystem() {
        console.log('Testing plugin system...');
        const plugins = this.personaEngine.plugins;
        return plugins instanceof Map;
    }
    async testHealthMonitoring() {
        console.log('Testing health monitoring...');
        const healthMonitor = this.personaEngine.healthMonitor;
        return healthMonitor && typeof healthMonitor.status === 'string';
    }
    async testConversationFlow() {
        console.log('Testing conversation flow...');
        const flows = this.personaEngine.conversationFlows;
        return flows instanceof Map;
    }
    async testMoodTracking() {
        console.log('Testing mood tracking...');
        const moodProfile = this.personaEngine.moodProfile;
        return moodProfile && Array.isArray(moodProfile.moodHistory);
    }
    async testContextAwareness() {
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
            this.personaEngine.updateContextAwareness(context);
            return true;
        }
        catch (error) {
            console.log('Context awareness test error:', error);
            return false;
        }
    }
}
exports.SimplePersonaEngineValidator = SimplePersonaEngineValidator;
/**
 * Run simple validation
 */
async function runSimplePersonaEngineValidation() {
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

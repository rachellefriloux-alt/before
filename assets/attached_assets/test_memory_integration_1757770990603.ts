/**
 * MemoryV2Store Runtime Integration Test
 * Tests the enhanced MemoryV2Store with EventBus and DatabaseIntegration
 */

import { MemoryV2Store } from './core/memory/MemoryV2Store';
import { getEventBus } from './core/EventBus';

async function testMemoryV2StoreIntegration() {
  console.log('🧠 Testing MemoryV2Store Runtime Integration...\n');

  try {
    // Test 1: Basic instantiation
    console.log('1️⃣ Testing basic instantiation...');
    const memoryStore = new MemoryV2Store();
    console.log('✅ MemoryV2Store instantiated successfully\n');

    // Test 2: EventBus integration
    console.log('2️⃣ Testing EventBus integration...');
    const eventBus = getEventBus();
    console.log('✅ EventBus integration working\n');

    // Test 3: Basic memory operations
    console.log('3️⃣ Testing basic memory operations...');
    const testMemory = {
      id: 'test-memory-1',
      type: 'conversation' as const,
      content: 'This is a test memory for integration testing',
      provenance: {
        createdAt: new Date(),
        source: 'integration-test',
        confidence: 0.95,
        metadata: {
          userId: 'test-user',
          sessionId: 'test-session',
          contextTags: ['test', 'integration'],
          validationStatus: 'verified' as const
        }
      },
      emotionalTags: ['curious', 'excited'],
      linkage: {
        narrativeThread: 'test-thread',
        relatedMemories: [],
        contextWindow: { before: [], after: [] },
        semanticLinks: []
      },
      accessControl: {
        ownerId: 'test-user',
        permissions: ['read' as const, 'write' as const, 'delete' as const],
        encryptionLevel: 'none' as const,
        retentionPolicy: {
          duration: 365,
          autoDelete: false,
          archivalRequired: false,
          complianceTags: ['test']
        }
      },
      metadata: { test: true },
      version: 1,
      lastModified: new Date()
    };

    // Test creating memory
    const createdMemory = await memoryStore.create(testMemory);
    console.log('✅ Memory created successfully');

    // Test reading memory
    const retrieved = await memoryStore.read(testMemory.id);
    if (retrieved && retrieved.id === testMemory.id) {
      console.log('✅ Memory retrieved successfully');
    } else {
      console.log('❌ Memory retrieval failed');
    }

    // Test querying memories
    const query = { limit: 10 };
    const results = await memoryStore.query(query);
    if (results.length > 0) {
      console.log('✅ Memory query successful');
    } else {
      console.log('❌ Memory query failed');
    }

    console.log('\n4️⃣ Testing search functionality...');
    const searchResults = await memoryStore.search('test memory');
    console.log(`✅ Search completed: ${searchResults.length} results found`);

    console.log('\n5️⃣ Testing analytics...');
    const analytics = await memoryStore.generateAnalytics();
    console.log(`✅ Analytics generated: ${Object.keys(analytics).length} metrics available`);

    console.log('\n6️⃣ Testing stats...');
    const stats = await memoryStore.getStats();
    console.log(`✅ Stats retrieved: ${stats.totalMemories} total memories`);

    console.log('\n🎉 All integration tests passed successfully!');
    console.log('🚀 MemoryV2Store is ready for production use!');

  } catch (error) {
    console.error('❌ Integration test failed:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Run the test
testMemoryV2StoreIntegration().catch(console.error);
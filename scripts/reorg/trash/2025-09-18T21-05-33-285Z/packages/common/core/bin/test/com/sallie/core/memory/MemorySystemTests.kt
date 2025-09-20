package com.sallie.core.memory

import kotlinx.coroutines.runBlocking
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.mockito.Mockito.*
import java.util.concurrent.TimeUnit

/**
 * Unit tests for the Memory System components
 */
class MemorySystemTests {

    // Test components
    private lateinit var episodicMemoryStore: EpisodicMemoryStore
    private lateinit var semanticMemoryStore: SemanticMemoryStore
    private lateinit var emotionalMemoryStore: EmotionalMemoryStore
    private lateinit var workingMemoryManager: WorkingMemoryManager
    private lateinit var memoryIndexer: MemoryIndexer
    private lateinit var memoryAssociationEngine: MemoryAssociationEngine
    private lateinit var memoryReinforcementSystem: MemoryReinforcementSystem
    private lateinit var memoryDecaySystem: MemoryDecaySystem
    
    @Before
    fun setup() {
        // Initialize test components
        episodicMemoryStore = EpisodicMemoryStore()
        semanticMemoryStore = SemanticMemoryStore()
        emotionalMemoryStore = EmotionalMemoryStore()
        workingMemoryManager = WorkingMemoryManager()
        memoryIndexer = MemoryIndexer()
        memoryAssociationEngine = MemoryAssociationEngine()
        memoryReinforcementSystem = MemoryReinforcementSystem()
        memoryDecaySystem = MemoryDecaySystem()
        
        // Set up dependencies
        memoryIndexer.setMemoryStores(episodicMemoryStore, semanticMemoryStore, emotionalMemoryStore)
        memoryAssociationEngine.setMemoryStores(episodicMemoryStore, semanticMemoryStore, emotionalMemoryStore)
        memoryReinforcementSystem.setMemoryStores(episodicMemoryStore, semanticMemoryStore, emotionalMemoryStore)
        memoryDecaySystem.setMemoryStores(episodicMemoryStore, semanticMemoryStore, emotionalMemoryStore)
    }
    
    @Test
    fun `test memory creation`() {
        // Create episodic memory
        val episodicMemory = EpisodicMemory(
            content = "Test memory content",
            location = "Test location",
            people = mutableListOf("Person 1", "Person 2"),
            emotionalValence = EmotionalValence.POSITIVE,
            importance = 0.8f
        )
        
        episodicMemoryStore.addMemory(episodicMemory)
        
        // Verify memory was added correctly
        val retrievedMemory = episodicMemoryStore.getMemoryById(episodicMemory.id)
        assertNotNull("Memory should be retrieved", retrievedMemory)
        assertEquals("Content should match", "Test memory content", retrievedMemory?.content)
        assertEquals("Location should match", "Test location", retrievedMemory?.location)
        assertEquals("People count should match", 2, retrievedMemory?.people?.size)
        assertEquals("Emotional valence should match", EmotionalValence.POSITIVE, retrievedMemory?.emotionalValence)
    }
    
    @Test
    fun `test working memory management`() {
        // Create test memories
        val memory1 = EpisodicMemory(content = "Memory 1")
        val memory2 = EpisodicMemory(content = "Memory 2")
        val memory3 = EpisodicMemory(content = "Memory 3")
        
        episodicMemoryStore.addMemory(memory1)
        episodicMemoryStore.addMemory(memory2)
        episodicMemoryStore.addMemory(memory3)
        
        // Add to working memory
        workingMemoryManager.addToWorkingMemory(MemoryType.EPISODIC, memory1.id)
        workingMemoryManager.addToWorkingMemory(MemoryType.EPISODIC, memory2.id)
        
        // Check working memory contents
        val workingMemoryItems = workingMemoryManager.getWorkingMemoryItems()
        assertEquals("Should have 2 items in working memory", 2, workingMemoryItems.size)
        assertTrue("Memory 1 should be in working memory", 
            workingMemoryItems.any { it.memoryId == memory1.id })
        assertTrue("Memory 2 should be in working memory", 
            workingMemoryItems.any { it.memoryId == memory2.id })
        
        // Test working memory capacity
        // Add more memories to reach capacity
        for (i in 4..30) {
            val memory = EpisodicMemory(content = "Memory $i")
            episodicMemoryStore.addMemory(memory)
            workingMemoryManager.addToWorkingMemory(MemoryType.EPISODIC, memory.id)
        }
        
        // Verify working memory capacity limit is enforced
        val updatedWorkingMemory = workingMemoryManager.getWorkingMemoryItems()
        assertTrue("Working memory should not exceed capacity",
            updatedWorkingMemory.size <= WorkingMemoryManager.DEFAULT_CAPACITY)
        
        // Memory 1 should have been displaced due to LRU policy
        assertFalse("Memory 1 should have been displaced from working memory",
            updatedWorkingMemory.any { it.memoryId == memory1.id })
    }
    
    @Test
    fun `test memory associations`() {
        // Create memories
        val episodicMemory = EpisodicMemory(content = "Meeting at coffee shop")
        val semanticMemory = SemanticMemory(concept = "Coffee", definition = "A brewed drink")
        
        episodicMemoryStore.addMemory(episodicMemory)
        semanticMemoryStore.addMemory(semanticMemory)
        
        // Create association
        memoryAssociationEngine.createAssociation(
            MemoryType.EPISODIC, episodicMemory.id,
            MemoryType.SEMANTIC, semanticMemory.id,
            0.8f
        )
        
        // Verify association exists
        val associations = memoryAssociationEngine.getAssociatedMemories(
            MemoryType.EPISODIC, episodicMemory.id, 1, 10
        )
        
        assertEquals("Should have 1 association", 1, associations.size)
        assertEquals("Association should be with semantic memory", 
            MemoryType.SEMANTIC, associations[0].first)
        assertEquals("Associated ID should match", 
            semanticMemory.id, associations[0].second)
        
        // Check bidirectional association
        val reverseAssociations = memoryAssociationEngine.getAssociatedMemories(
            MemoryType.SEMANTIC, semanticMemory.id, 1, 10
        )
        
        assertEquals("Should have 1 reverse association", 1, reverseAssociations.size)
        assertEquals("Reverse association should be with episodic memory", 
            MemoryType.EPISODIC, reverseAssociations[0].first)
    }
    
    @Test
    fun `test memory reinforcement`() {
        // Create a memory
        val episodicMemory = EpisodicMemory(
            content = "Test memory",
            strengthFactor = 0.5f
        )
        
        episodicMemoryStore.addMemory(episodicMemory)
        
        // Initial strength
        val initialStrength = episodicMemory.strengthFactor
        
        // Apply reinforcement
        memoryReinforcementSystem.reinforceMemoryAccess(MemoryType.EPISODIC, episodicMemory.id, 1.0f)
        
        // Verify memory was reinforced
        val updatedMemory = episodicMemoryStore.getMemoryById(episodicMemory.id)
        assertNotNull("Memory should exist", updatedMemory)
        assertTrue("Memory strength should increase", 
            updatedMemory!!.strengthFactor > initialStrength)
        assertEquals("Access count should be incremented", 
            1, updatedMemory.accessCount)
    }
    
    @Test
    fun `test memory decay`() {
        // Create memories with different timestamps
        val recentMemory = EpisodicMemory(
            content = "Recent memory",
            strengthFactor = 0.8f,
            timestamp = System.currentTimeMillis()
        )
        
        val olderMemory = EpisodicMemory(
            content = "Older memory",
            strengthFactor = 0.8f,
            timestamp = System.currentTimeMillis() - TimeUnit.DAYS.toMillis(30),
            lastAccessTimestamp = System.currentTimeMillis() - TimeUnit.DAYS.toMillis(30)
        )
        
        episodicMemoryStore.addMemory(recentMemory)
        episodicMemoryStore.addMemory(olderMemory)
        
        // Store initial strengths
        val initialRecentStrength = recentMemory.strengthFactor
        val initialOlderStrength = olderMemory.strengthFactor
        
        // Apply memory decay
        memoryDecaySystem.setMemoryStores(episodicMemoryStore, semanticMemoryStore, emotionalMemoryStore)
        
        // Use reflection to call the private method for testing
        val decayMethod = MemoryDecaySystem::class.java.getDeclaredMethod("applyMemoryDecay")
        decayMethod.isAccessible = true
        decayMethod.invoke(memoryDecaySystem)
        
        // Verify decay was applied
        val updatedRecentMemory = episodicMemoryStore.getMemoryById(recentMemory.id)
        val updatedOlderMemory = episodicMemoryStore.getMemoryById(olderMemory.id)
        
        assertNotNull("Recent memory should exist", updatedRecentMemory)
        assertNotNull("Older memory should exist", updatedOlderMemory)
        
        // Recent memory should decay less than older memory
        assertTrue("Recent memory strength should not decrease significantly", 
            updatedRecentMemory!!.strengthFactor >= initialRecentStrength * 0.9f)
        
        assertTrue("Older memory strength should decrease more", 
            updatedOlderMemory!!.strengthFactor < initialOlderStrength * 0.9f)
    }
    
    @Test
    fun `test advanced memory retrieval`() = runBlocking {
        // Create test memories
        val memoryProcessor = MemoryProcessor()
        memoryProcessor.setDependencies(
            episodicMemoryStore, semanticMemoryStore, emotionalMemoryStore,
            memoryIndexer, memoryAssociationEngine
        )
        
        val memory1 = EpisodicMemory(content = "Coffee meeting with John")
        val memory2 = EpisodicMemory(content = "Conference about machine learning")
        val memory3 = SemanticMemory(concept = "Coffee", definition = "A popular beverage")
        
        episodicMemoryStore.addMemory(memory1)
        episodicMemoryStore.addMemory(memory2)
        semanticMemoryStore.addMemory(memory3)
        
        // Process memories to build indices
        memoryProcessor.processNewMemory(MemoryType.EPISODIC, memory1.id)
        memoryProcessor.processNewMemory(MemoryType.EPISODIC, memory2.id)
        memoryProcessor.processNewMemory(MemoryType.SEMANTIC, memory3.id)
        
        // Create associations
        memoryAssociationEngine.createAssociation(
            MemoryType.EPISODIC, memory1.id,
            MemoryType.SEMANTIC, memory3.id,
            0.8f
        )
        
        // Set up retrieval system
        val retrievalSystem = AdvancedMemoryRetrievalSystem()
        retrievalSystem.initialize(
            episodicMemoryStore, semanticMemoryStore, emotionalMemoryStore,
            workingMemoryManager, memoryIndexer, memoryAssociationEngine, memoryReinforcementSystem
        )
        
        // Test query-based retrieval
        val queryResults = retrievalSystem.retrieveMemories(
            query = "coffee",
            memoryTypes = setOf(MemoryType.EPISODIC, MemoryType.SEMANTIC),
            limit = 5
        )
        
        assertTrue("Should find coffee-related memories", queryResults.isNotEmpty())
        assertTrue("Coffee meeting memory should be found",
            queryResults.any { it.memory.id == memory1.id })
        assertTrue("Coffee concept memory should be found",
            queryResults.any { it.memory.id == memory3.id })
            
        // Test association-based retrieval
        val associationResults = retrievalSystem.retrieveByAssociation(
            MemoryType.EPISODIC, memory1.id
        )
        
        assertTrue("Should find associated memories", associationResults.isNotEmpty())
        assertTrue("Coffee concept should be associated with coffee meeting",
            associationResults.any { it.memory.id == memory3.id })
    }
}

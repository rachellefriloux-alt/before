/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Tests for the hierarchical memory system.
 * Got it, love.
 */
package com.sallie.core.memory

import org.junit.Test
import org.junit.Assert.*
import kotlin.test.assertTrue
import kotlin.test.assertNotNull
import kotlin.test.assertNull

class HierarchicalMemorySystemTest {
    
    @Test
    fun testBasicMemoryOperations() {
        val memory = HierarchicalMemorySystem()
        
        // Create memories of different types
        val episodicMemory = memory.createEpisodicMemory(
            content = "Today I learned how to make pasta from scratch",
            priority = 70,
            emotionalValence = 0.8,
            emotionalIntensity = 0.7
        )
        
        val semanticMemory = memory.createSemanticMemory(
            content = "Pasta is made primarily from durum wheat flour and water",
            certainty = 0.95
        )
        
        val emotionalMemory = memory.createEmotionalMemory(
            content = "I felt accomplished when everyone enjoyed the pasta I made",
            emotionalValence = 0.9,
            emotionalIntensity = 0.8
        )
        
        val proceduralMemory = memory.createProceduralMemory(
            content = "To make pasta dough, mix flour and water, knead until elastic, rest for 30 minutes",
            proficiency = 0.6
        )
        
        // Store memories
        val episodicId = memory.storeMemory(episodicMemory)
        val semanticId = memory.storeMemory(semanticMemory)
        val emotionalId = memory.storeMemory(emotionalMemory)
        val proceduralId = memory.storeMemory(proceduralMemory)
        
        // Test retrieval
        val retrievedEpisodic = memory.getMemory(episodicId)
        val retrievedSemantic = memory.getMemory(semanticId)
        val retrievedEmotional = memory.getMemory(emotionalId)
        val retrievedProcedural = memory.getMemory(proceduralId)
        
        assertNotNull(retrievedEpisodic)
        assertNotNull(retrievedSemantic)
        assertNotNull(retrievedEmotional)
        assertNotNull(retrievedProcedural)
        
        assertEquals("Today I learned how to make pasta from scratch", retrievedEpisodic?.content)
        assertEquals("Pasta is made primarily from durum wheat flour and water", retrievedSemantic?.content)
        assertEquals(HierarchicalMemorySystem.MemoryType.EMOTIONAL, retrievedEmotional?.type)
        assertEquals(0.6, retrievedProcedural?.metadata?.get("proficiency"))
        
        // Test memory connections
        memory.connectMemories(episodicId, semanticId)
        memory.connectMemories(episodicId, proceduralId)
        
        val updatedEpisodic = memory.getMemory(episodicId)
        assertTrue(updatedEpisodic?.connections?.contains(semanticId) == true)
        assertTrue(updatedEpisodic?.connections?.contains(proceduralId) == true)
        
        // Test retrieval of related memories
        val relatedToEpisodic = memory.getRelatedMemories(episodicId)
        assertTrue(relatedToEpisodic.size >= 2)
        assertTrue(relatedToEpisodic.any { it.id == semanticId })
        assertTrue(relatedToEpisodic.any { it.id == proceduralId })
    }
    
    @Test
    fun testMemorySearch() {
        val memory = HierarchicalMemorySystem()
        
        // Create a set of memories about different topics
        val memories = listOf(
            memory.createEpisodicMemory("The conference in Seattle was fascinating", emotionalValence = 0.7),
            memory.createEpisodicMemory("My trip to Paris last summer was amazing", emotionalValence = 0.9),
            memory.createSemanticMemory("Paris is the capital of France"),
            memory.createSemanticMemory("Seattle is known for its coffee and tech industry"),
            memory.createEmotionalMemory("I feel nostalgic about my childhood trips", emotionalValence = 0.3, emotionalIntensity = 0.6),
            memory.createProceduralMemory("How to book international flights", proficiency = 0.8)
        )
        
        // Store all memories
        memories.forEach { memory.storeMemory(it) }
        
        // Test search by text
        val parisResults = memory.searchMemories(HierarchicalMemorySystem.MemoryQuery(searchText = "Paris"))
        assertTrue(parisResults.items.size >= 2)
        assertTrue(parisResults.items.any { it.content.contains("Paris") })
        
        // Test search by type
        val episodicResults = memory.searchMemories(
            HierarchicalMemorySystem.MemoryQuery(types = setOf(HierarchicalMemorySystem.MemoryType.EPISODIC))
        )
        assertEquals(2, episodicResults.items.size)
        assertTrue(episodicResults.items.all { it.type == HierarchicalMemorySystem.MemoryType.EPISODIC })
        
        // Test search by emotion
        val positiveResults = memory.searchMemories(
            HierarchicalMemorySystem.MemoryQuery(emotionalFilter = Pair(0.5, 1.0))
        )
        assertTrue(positiveResults.items.size >= 2)
        assertTrue(positiveResults.items.all { it.emotionalValence >= 0.5 })
        
        // Test combined search
        val combinedResults = memory.searchMemories(
            HierarchicalMemorySystem.MemoryQuery(
                searchText = "trip",
                types = setOf(HierarchicalMemorySystem.MemoryType.EPISODIC, HierarchicalMemorySystem.MemoryType.EMOTIONAL)
            )
        )
        assertTrue(combinedResults.items.size >= 2)
        assertTrue(combinedResults.items.all { it.content.contains("trip") })
    }
    
    @Test
    fun testMemorySalience() {
        val memory = HierarchicalMemorySystem()
        
        // Create memories with different characteristics
        val highPriorityMemory = memory.createEpisodicMemory(
            "Important business meeting tomorrow",
            priority = 90,
            emotionalValence = 0.5,
            emotionalIntensity = 0.7
        )
        
        val highEmotionMemory = memory.createEmotionalMemory(
            "I was overjoyed when I got the promotion",
            emotionalValence = 0.9,
            emotionalIntensity = 0.9,
            priority = 70
        )
        
        val lowPriorityMemory = memory.createEpisodicMemory(
            "Casual conversation with the barista",
            priority = 20,
            emotionalValence = 0.1,
            emotionalIntensity = 0.2
        )
        
        // Store memories
        memory.storeMemory(highPriorityMemory)
        memory.storeMemory(highEmotionMemory)
        memory.storeMemory(lowPriorityMemory)
        
        // Manually calculate expected salience (simplified for testing)
        val highPrioritySalience = highPriorityMemory.calculateSalience()
        val highEmotionSalience = highEmotionMemory.calculateSalience()
        val lowPrioritySalience = lowPriorityMemory.calculateSalience()
        
        // Verify high priority and emotional memories have higher salience
        assertTrue(highPrioritySalience > lowPrioritySalience)
        assertTrue(highEmotionSalience > lowPrioritySalience)
        
        // Test search with salience sorting
        val results = memory.searchMemories(
            HierarchicalMemorySystem.MemoryQuery(includeSalience = true)
        )
        
        // The high priority or high emotion memory should be first
        assertTrue(
            results.items.first().content == highPriorityMemory.content ||
            results.items.first().content == highEmotionMemory.content
        )
        
        // Low priority memory should be last
        assertEquals(lowPriorityMemory.content, results.items.last().content)
    }
    
    @Test
    fun testMemoryConsolidation() {
        val memory = HierarchicalMemorySystem()
        
        // Create memories
        val memory1 = memory.createSemanticMemory("Facts about quantum physics", priority = 60)
        val memory2 = memory.createSemanticMemory("Shopping list for the weekend", priority = 40)
        
        // Store memories
        val id1 = memory.storeMemory(memory1)
        val id2 = memory.storeMemory(memory2)
        
        // Simulate memory access patterns
        val mem1 = memory.getMemory(id1)
        assertNotNull(mem1)
        
        // Access memory1 multiple times to increase its access count
        repeat(5) { memory.getMemory(id1) }
        
        // Run consolidation
        memory.consolidateMemories()
        
        // Retrieve updated memories
        val updatedMem1 = memory.getMemory(id1)
        val updatedMem2 = memory.getMemory(id2)
        
        assertNotNull(updatedMem1)
        assertNotNull(updatedMem2)
        
        // Memory1 should have maintained or increased priority due to frequent access
        assertTrue(updatedMem1!!.priority >= memory1.priority)
        
        // Clean up test
        memory.cleanupMemories(maxMemories = 1, minSalience = 0.5)
        
        // Only the high-salience memory should remain
        assertNotNull(memory.getMemory(id1))
    }
}

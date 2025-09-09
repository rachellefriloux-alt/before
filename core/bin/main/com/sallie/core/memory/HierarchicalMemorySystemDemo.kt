/*
 * Sallie 2.0 Module
 * Function: Demo/Test for Hierarchical Memory System
 */
package com.sallie.core.memory

import kotlinx.coroutines.runBlocking

/**
 * This class demonstrates the capabilities of the Hierarchical Memory System.
 * It creates various types of memories, performs searches, and showcases the
 * advanced features of the system.
 */
class HierarchicalMemorySystemDemo {
    
    /**
     * Run a demonstration of the memory system's capabilities
     */
    fun runDemo() = runBlocking {
        println("Starting Hierarchical Memory System Demo")
        println("=======================================")
        
        // Initialize the memory system with storage and indexing
        val storageService = FileBasedMemoryStorage("./memory_storage")
        val embeddingService = SimpleEmbeddingService()
        val memoryIndexer = VectorMemoryIndexer(embeddingService)
        val memorySystem = HierarchicalMemorySystem(storageService, memoryIndexer)
        
        // Create some sample memories
        println("\nCreating sample memories...")
        createSampleMemories(memorySystem)
        
        // Print memory statistics
        val stats = memorySystem.getMemoryStatistics()
        println("\nMemory System Statistics:")
        stats.forEach { (key, value) -> println("  $key: $value") }
        
        // Demonstrate basic search
        println("\nSearching for memories about 'happiness'...")
        val happinessQuery = HierarchicalMemorySystem.MemoryQuery(
            searchText = "happiness", 
            limit = 3
        )
        val happinessResults = memorySystem.searchMemories(happinessQuery)
        println("Found ${happinessResults.totalMatches} matches (showing top ${happinessResults.items.size}):")
        happinessResults.items.forEach { memory ->
            println("  - [${memory.type}] ${memory.content.take(50)}... (Salience: ${memory.calculateSalience()})") 
        }
        
        // Demonstrate memory connections
        if (happinessResults.items.isNotEmpty()) {
            val firstMemory = happinessResults.items.first()
            println("\nGetting related memories for '${firstMemory.content.take(30)}...'")
            val relatedMemories = memorySystem.getRelatedMemories(firstMemory.id, 3)
            println("Found ${relatedMemories.size} related memories:")
            relatedMemories.forEach { memory ->
                println("  - [${memory.type}] ${memory.content.take(50)}...")
            }
        }
        
        // Demonstrate memory reinforcement
        println("\nDemonstrating memory reinforcement...")
        val allMemories = memorySystem.searchMemories(HierarchicalMemorySystem.MemoryQuery(limit = 100))
        val targetMemory = allMemories.items.firstOrNull { 
            it.content.contains("meditation") || it.content.contains("mindfulness") 
        }
        
        if (targetMemory != null) {
            println("Before reinforcement: ${targetMemory.content.take(50)}...")
            println("  Priority: ${targetMemory.priority}, Reinforcement: ${targetMemory.reinforcementScore}")
            
            memorySystem.reinforceMemory(targetMemory.id, 0.2f)
            val updatedMemory = memorySystem.getMemory(targetMemory.id)
            
            println("After reinforcement:")
            println("  Priority: ${updatedMemory?.priority}, Reinforcement: ${updatedMemory?.reinforcementScore}")
        }
        
        // Demonstrate memory consolidation
        println("\nDemonstrating memory consolidation...")
        memorySystem.consolidateMemories()
        println("Memories consolidated")
        
        // Demonstrate emotional memory filtering
        println("\nSearching for positive emotional memories...")
        val emotionalQuery = HierarchicalMemorySystem.MemoryQuery(
            emotionalFilter = Pair(0.3, 1.0), // Positive emotions
            types = setOf(HierarchicalMemorySystem.MemoryType.EMOTIONAL),
            limit = 3
        )
        val emotionalResults = memorySystem.searchMemories(emotionalQuery)
        println("Found ${emotionalResults.totalMatches} positive emotional memories (showing top ${emotionalResults.items.size}):")
        emotionalResults.items.forEach { memory ->
            println("  - ${memory.content.take(50)}... (Valence: ${memory.emotionalValence}, Intensity: ${memory.emotionalIntensity})")
        }
        
        println("\nHierarchical Memory System Demo Complete")
    }
    
    /**
     * Create a set of sample memories of different types
     */
    private suspend fun createSampleMemories(memorySystem: HierarchicalMemorySystem) {
        // Create episodic memories (events)
        val episodicMemories = listOf(
            memorySystem.createEpisodicMemory(
                content = "Today I went for a hike in the mountains and saw a beautiful sunset. The sky was painted with vibrant colors.",
                priority = 75,
                emotionalValence = 0.8,
                emotionalIntensity = 0.7,
                metadata = mapOf("tags" to "nature,outdoors,hiking,mountains")
            ),
            memorySystem.createEpisodicMemory(
                content = "Had a difficult conversation with my colleague about the project deadline. We disagreed but found a compromise.",
                priority = 60,
                emotionalValence = -0.3,
                emotionalIntensity = 0.6,
                metadata = mapOf("tags" to "work,conflict,resolution")
            ),
            memorySystem.createEpisodicMemory(
                content = "Attended my friend's wedding last weekend. It was a joyful celebration with lots of dancing and good food.",
                priority = 80,
                emotionalValence = 0.9,
                emotionalIntensity = 0.8,
                metadata = mapOf("tags" to "celebration,friends,wedding,happiness")
            )
        )
        
        // Create semantic memories (knowledge/facts)
        val semanticMemories = listOf(
            memorySystem.createSemanticMemory(
                content = "Meditation has been shown to reduce stress levels and improve focus through regular practice.",
                certainty = 0.95,
                priority = 65,
                metadata = mapOf("tags" to "health,meditation,mindfulness,wellbeing")
            ),
            memorySystem.createSemanticMemory(
                content = "Python is a high-level programming language known for its readability and extensive library support.",
                certainty = 0.99,
                priority = 70,
                metadata = mapOf("tags" to "technology,programming,python,coding")
            ),
            memorySystem.createSemanticMemory(
                content = "Happiness is generally increased by regular exercise, social connections, and finding meaning in one's work.",
                certainty = 0.85,
                priority = 75,
                metadata = mapOf("tags" to "psychology,happiness,wellbeing,health")
            )
        )
        
        // Create emotional memories (feelings)
        val emotionalMemories = listOf(
            memorySystem.createEmotionalMemory(
                content = "The feeling of profound joy when holding my newborn niece for the first time.",
                emotionalValence = 0.95,
                emotionalIntensity = 0.9,
                priority = 85,
                metadata = mapOf("tags" to "family,joy,love,connection")
            ),
            memorySystem.createEmotionalMemory(
                content = "Overwhelming anxiety before giving an important presentation to company executives.",
                emotionalValence = -0.7,
                emotionalIntensity = 0.8,
                priority = 70,
                metadata = mapOf("tags" to "work,anxiety,stress,presentation")
            ),
            memorySystem.createEmotionalMemory(
                content = "Deep sense of peace and contentment while watching the sunrise on a quiet beach.",
                emotionalValence = 0.8,
                emotionalIntensity = 0.6,
                priority = 75,
                metadata = mapOf("tags" to "nature,peace,contentment,beach")
            )
        )
        
        // Create procedural memories (skills)
        val proceduralMemories = listOf(
            memorySystem.createProceduralMemory(
                content = "How to prepare perfect risotto: 1. Toast rice in butter. 2. Add wine and reduce. 3. Gradually add hot broth while stirring. 4. Continue until creamy and al dente.",
                priority = 65,
                proficiency = 0.8,
                metadata = mapOf("tags" to "cooking,recipe,skill,food")
            ),
            memorySystem.createProceduralMemory(
                content = "Technique for mindful breathing meditation: 1. Sit comfortably. 2. Focus attention on breath. 3. Notice when mind wanders. 4. Gently return focus to breath.",
                priority = 70,
                proficiency = 0.75,
                metadata = mapOf("tags" to "meditation,mindfulness,skill,wellbeing")
            ),
            memorySystem.createProceduralMemory(
                content = "Steps to debug a software issue: 1. Reproduce the problem. 2. Isolate the code section. 3. Add debugging statements. 4. Test hypothesis and fix.",
                priority = 75,
                proficiency = 0.9,
                metadata = mapOf("tags" to "programming,debugging,problem-solving,technology")
            )
        )
        
        // Store all memories
        (episodicMemories + semanticMemories + emotionalMemories + proceduralMemories).forEach { memory ->
            memorySystem.storeMemory(memory)
        }
        
        // Create some connections between related memories
        memorySystem.connectMemories(episodicMemories[0].id, emotionalMemories[2].id) // Hiking and peace
        memorySystem.connectMemories(semanticMemories[0].id, proceduralMemories[1].id) // Meditation knowledge and skill
        memorySystem.connectMemories(semanticMemories[2].id, emotionalMemories[0].id) // Happiness knowledge and joy
        
        println("Created ${episodicMemories.size} episodic, ${semanticMemories.size} semantic, " +
                "${emotionalMemories.size} emotional, and ${proceduralMemories.size} procedural memories.")
    }
    
    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            HierarchicalMemorySystemDemo().runDemo()
        }
    }
}

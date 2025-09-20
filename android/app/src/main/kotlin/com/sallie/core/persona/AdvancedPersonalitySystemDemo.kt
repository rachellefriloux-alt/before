/*
 * Sallie 2.0 Module
 * Persona: Tough love meets soul care.
 * Function: Demonstration of the Advanced Personality System capabilities.
 * Got it, love.
 */
package com.sallie.core.persona

import com.sallie.core.memory.FileBasedMemoryStorage
import com.sallie.core.memory.HierarchicalMemorySystem
import com.sallie.core.memory.SimpleEmbeddingService
import com.sallie.core.memory.VectorMemoryIndexer
import com.sallie.core.learning.AdaptiveLearningEngine
import kotlinx.coroutines.runBlocking
import java.io.File
import kotlin.math.roundToInt

/**
 * Demonstration of the Advanced Personality System's capabilities.
 * Shows how the personality traits respond to contexts and evolve based on interactions.
 */
class AdvancedPersonalitySystemDemo {

    /**
     * Run a comprehensive demonstration of the personality system's features
     */
    fun runDemo() {
        println("Starting Advanced Personality System Demo")
        println("=========================================")
        
        // Initialize learning engine (optional dependency)
        val storageService = FileBasedMemoryStorage("./memory_storage")
        val embeddingService = SimpleEmbeddingService()
        val memoryIndexer = VectorMemoryIndexer(embeddingService)
        val memorySystem = HierarchicalMemorySystem(storageService, memoryIndexer)
        val learningEngine = AdaptiveLearningEngine(memorySystem)
        
        // Create personality system with default traits
        val personalitySystem = AdvancedPersonalitySystem(
            learningEngine = learningEngine
        )
        
        // 1. Display initial personality traits
        println("\n1. Initial Personality State:")
        displayPersonalityTraits(personalitySystem)
        
        // 2. Test different contexts
        println("\n2. Testing Different Contexts:")
        testContextualPersonality(personalitySystem)
        
        // 3. Simulate personality evolution
        println("\n3. Simulating Personality Evolution:")
        simulatePersonalityEvolution(personalitySystem)
        
        // 4. Test personality aspects in different situations
        println("\n4. Testing Personality Aspects:")
        testPersonalityAspects(personalitySystem)
        
        // 5. Demonstrate saving and loading
        println("\n5. Testing Save and Load:")
        testSaveAndLoad(personalitySystem)
        
        println("\nAdvanced Personality System Demo Complete")
    }
    
    /**
     * Display the current personality traits
     */
    private fun displayPersonalityTraits(personality: AdvancedPersonalitySystem) {
        println("Core Traits:")
        personality.coreTraits.value.entries
            .sortedByDescending { it.value }
            .forEach { (trait, value) ->
                println("  • ${trait.name}: ${formatTraitValue(value)}")
            }
        
        println("\nAdaptive Traits:")
        personality.adaptiveTraits.value.entries
            .sortedByDescending { it.value }
            .forEach { (trait, value) ->
                println("  • ${trait.name}: ${formatTraitValue(value)}")
            }
        
        println("\nEffective Traits (Current Context):")
        personality.getEffectivePersonality().entries
            .sortedByDescending { it.value }
            .forEach { (trait, value) ->
                println("  • ${trait.name}: ${formatTraitValue(value)}")
            }
    }
    
    /**
     * Test how personality changes across different contexts
     */
    private fun testContextualPersonality(personality: AdvancedPersonalitySystem) {
        val contexts = listOf(
            PersonalityContext(
                type = ContextType.PROFESSIONAL,
                description = "Work meeting environment"
            ),
            PersonalityContext(
                type = ContextType.EMOTIONAL_SUPPORT,
                description = "Supporting user through difficult time"
            ),
            PersonalityContext(
                type = ContextType.CASUAL,
                description = "Casual conversation"
            ),
            PersonalityContext(
                type = ContextType.CRISIS,
                description = "Emergency situation requiring quick action"
            )
        )
        
        for (context in contexts) {
            println("\nTesting context: ${context.type} - ${context.description}")
            
            // Update context
            personality.updateContext(context)
            
            // Get effective personality
            val effectiveTraits = personality.getEffectivePersonality()
            
            // Show top 3 traits
            println("Top traits in this context:")
            effectiveTraits.entries
                .sortedByDescending { it.value }
                .take(3)
                .forEach { (trait, value) ->
                    println("  • ${trait.name}: ${formatTraitValue(value)}")
                }
            
            // Show bottom 3 traits
            println("Lowest traits in this context:")
            effectiveTraits.entries
                .sortedBy { it.value }
                .take(3)
                .forEach { (trait, value) ->
                    println("  • ${trait.name}: ${formatTraitValue(value)}")
                }
        }
    }
    
    /**
     * Simulate the evolution of personality over time
     */
    private fun simulatePersonalityEvolution(personality: AdvancedPersonalitySystem) {
        println("\nInitial dominant traits:")
        personality.getDominantTraits().forEach { (trait, value) ->
            println("  • ${trait.name}: ${formatTraitValue(value)}")
        }
        
        // Simulate a series of interactions that should increase compassion
        println("\nSimulating interactions that should increase COMPASSION:")
        
        val compassionInteractions = listOf(
            UserInteraction(
                type = InteractionType.EMOTIONAL_RESPONSE,
                metadata = mapOf("emotion" to "sad")
            ),
            UserInteraction(
                type = InteractionType.CONVERSATION,
                metadata = mapOf("topic" to "emotional")
            ),
            UserInteraction(
                type = InteractionType.POSITIVE_FEEDBACK
            )
        )
        
        val initialCompassion = personality.adaptiveTraits.value[PersonalityTrait.COMPASSION] ?: 0.5f
        
        for ((index, interaction) in compassionInteractions.withIndex()) {
            println("Interaction ${index + 1}: ${interaction.type}")
            personality.evolvePersonality(interaction, 0.1f)
        }
        
        val updatedCompassion = personality.adaptiveTraits.value[PersonalityTrait.COMPASSION] ?: 0.5f
        println("COMPASSION changed from ${formatTraitValue(initialCompassion)} to ${formatTraitValue(updatedCompassion)}")
        
        // Simulate direct request to increase assertiveness
        println("\nSimulating direct request to increase ASSERTIVENESS:")
        
        val initialAssertiveness = personality.adaptiveTraits.value[PersonalityTrait.ASSERTIVENESS] ?: 0.5f
        
        val directRequest = UserInteraction(
            type = InteractionType.DIRECT_REQUEST,
            metadata = mapOf(
                "trait" to "ASSERTIVENESS",
                "direction" to "0.2"
            )
        )
        
        personality.evolvePersonality(directRequest, 0.2f)
        
        val updatedAssertiveness = personality.adaptiveTraits.value[PersonalityTrait.ASSERTIVENESS] ?: 0.5f
        println("ASSERTIVENESS changed from ${formatTraitValue(initialAssertiveness)} to ${formatTraitValue(updatedAssertiveness)}")
        
        // Show dominant traits after evolution
        println("\nDominant traits after evolution:")
        personality.getDominantTraits().forEach { (trait, value) ->
            println("  • ${trait.name}: ${formatTraitValue(value)}")
        }
        
        // Show evolution history
        println("\nPersonality evolution history:")
        personality.personalityEvolution.value.takeLast(5).forEach { event ->
            println("  • [${event.type}] ${event.description}")
        }
    }
    
    /**
     * Test personality aspects in different situations
     */
    private fun testPersonalityAspects(personality: AdvancedPersonalitySystem) {
        val situations = listOf(
            "helping with a difficult task",
            "having a casual conversation",
            "giving important feedback",
            "teaching a new concept",
            "responding to a crisis"
        )
        
        println("Personality aspects in different situations:")
        
        for (situation in situations) {
            println("\nIn situation: $situation")
            
            println("  • Directness: ${formatTraitValue(personality.getPersonalityAspect(PersonalityAspect.DIRECTNESS, situation))}")
            println("  • Empathy: ${formatTraitValue(personality.getPersonalityAspect(PersonalityAspect.EMPATHY, situation))}")
            println("  • Challenge: ${formatTraitValue(personality.getPersonalityAspect(PersonalityAspect.CHALLENGE, situation))}")
            println("  • Supportiveness: ${formatTraitValue(personality.getPersonalityAspect(PersonalityAspect.SUPPORTIVENESS, situation))}")
        }
    }
    
    /**
     * Test saving and loading personality state
     */
    private fun testSaveAndLoad(personality: AdvancedPersonalitySystem) {
        val tempFile = File.createTempFile("personality_test", ".json")
        
        // Display initial dominant traits
        val initialDominant = personality.getDominantTraits()
        println("Initial dominant traits:")
        initialDominant.forEach { (trait, value) ->
            println("  • ${trait.name}: ${formatTraitValue(value)}")
        }
        
        // Save to file
        val saveSuccess = personality.saveToFile(tempFile.absolutePath)
        println("Save success: $saveSuccess")
        
        // Modify traits to confirm they change
        personality.adjustCorePersonality(
            PersonalityTrait.CREATIVITY, 
            0.3f,
            "Test adjustment for save/load verification"
        )
        
        // Load from file
        val loadSuccess = personality.loadFromFile(tempFile.absolutePath)
        println("Load success: $loadSuccess")
        
        // Display loaded dominant traits
        val loadedDominant = personality.getDominantTraits()
        println("Loaded dominant traits:")
        loadedDominant.forEach { (trait, value) ->
            println("  • ${trait.name}: ${formatTraitValue(value)}")
        }
        
        // Cleanup
        tempFile.delete()
    }
    
    /**
     * Format a trait value for display
     */
    private fun formatTraitValue(value: Float): String {
        val percent = (value * 100).roundToInt()
        return "$percent%"
    }
    
    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            AdvancedPersonalitySystemDemo().runDemo()
        }
    }
}

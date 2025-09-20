/*
 * Sallie 2.0 Module
 * Persona: Tough love meets soul care.
 * Function: Demo for the personality response modifier.
 * Got it, love.
 */
package feature.personality

import java.time.Instant

/**
 * PersonalityResponseModifierDemo - Demonstrates how personality affects response generation
 */
object PersonalityResponseModifierDemo {
    @JvmStatic
    fun main(args: Array<String>) {
        println("Personality Response Modifier Demo")
        println("----------------------------------")
        
        // Create a simple personality system for the demo
        val personalitySystem = createDemoPersonalitySystem()
        val responseModifier = PersonalityResponseModifier(personalitySystem)
        
        // Sample responses to modify
        val sampleResponses = listOf(
            "You should focus on completing your task before starting a new one. It's important to finish what you start.",
            "I think maybe you could improve your approach. There are several issues with your current method.",
            "This project will be challenging, but with proper planning you can make progress. Take it step by step.",
            "You failed to consider all the factors. That's incorrect and you need to reconsider your assumptions."
        )
        
        // Test different personality traits and contexts
        testPersonalityVariations(personalitySystem, responseModifier, sampleResponses)
    }
    
    /**
     * Creates a demo personality system with modifiable traits
     */
    private fun createDemoPersonalitySystem(): AdvancedPersonalitySystem {
        // Create an in-memory personality system
        return object : AdvancedPersonalitySystem(
            coreTraitsPath = "memory:core_traits.json",
            adaptiveTraitsPath = "memory:adaptive_traits.json",
            evolutionHistoryPath = "memory:evolution_history.json"
        ) {
            // Override to prevent file operations
            override fun savePersonalityState(): Boolean = true
        }
    }
    
    /**
     * Test response modifications with different personality traits and contexts
     */
    private fun testPersonalityVariations(
        personalitySystem: AdvancedPersonalitySystem,
        responseModifier: PersonalityResponseModifier,
        responses: List<String>
    ) {
        // Test with different assertiveness levels
        println("\n=== Testing Assertiveness Trait ===")
        testTraitVariation(personalitySystem, responseModifier, responses[0], Trait.ASSERTIVENESS)
        
        // Test with different compassion levels
        println("\n=== Testing Compassion Trait ===")
        testTraitVariation(personalitySystem, responseModifier, responses[3], Trait.COMPASSION)
        
        // Test with different optimism levels
        println("\n=== Testing Optimism Trait ===")
        testTraitVariation(personalitySystem, responseModifier, responses[2], Trait.OPTIMISM)
        
        // Test with different creativity levels
        println("\n=== Testing Creativity Trait ===")
        testTraitVariation(personalitySystem, responseModifier, responses[1], Trait.CREATIVITY)
        
        // Test with different contexts
        println("\n=== Testing Context Variations ===")
        testContextVariation(personalitySystem, responseModifier, responses[0])
    }
    
    /**
     * Test how a single trait affects response modification
     */
    private fun testTraitVariation(
        personalitySystem: AdvancedPersonalitySystem,
        responseModifier: PersonalityResponseModifier,
        response: String,
        trait: Trait
    ) {
        println("\nOriginal response:")
        println(response)
        
        // Test low trait value
        println("\nWith low ${trait.name} (0.2):")
        personalitySystem.adjustAdaptiveTrait(trait, -1.0f) // Force to low value
        println(responseModifier.modifyResponse(response))
        
        // Test medium trait value
        println("\nWith medium ${trait.name} (0.5):")
        personalitySystem.adjustAdaptiveTrait(trait, 0.3f) // Adjust to medium
        println(responseModifier.modifyResponse(response))
        
        // Test high trait value
        println("\nWith high ${trait.name} (0.8):")
        personalitySystem.adjustAdaptiveTrait(trait, 0.3f) // Adjust to high
        println(responseModifier.modifyResponse(response))
    }
    
    /**
     * Test how different contexts affect response modification
     */
    private fun testContextVariation(
        personalitySystem: AdvancedPersonalitySystem,
        responseModifier: PersonalityResponseModifier,
        response: String
    ) {
        println("\nOriginal response:")
        println(response)
        
        // Test professional context
        println("\nIn PROFESSIONAL context:")
        personalitySystem.setContext(Context(ContextType.PROFESSIONAL, "Work environment"))
        println(responseModifier.modifyResponse(response))
        
        // Test casual context
        println("\nIn CASUAL context:")
        personalitySystem.setContext(Context(ContextType.CASUAL, "Informal conversation"))
        println(responseModifier.modifyResponse(response))
        
        // Test emotional support context
        println("\nIn EMOTIONAL_SUPPORT context:")
        personalitySystem.setContext(Context(ContextType.EMOTIONAL_SUPPORT, "Providing emotional guidance"))
        println(responseModifier.modifyResponse(response))
        
        // Test crisis context
        println("\nIn CRISIS context:")
        personalitySystem.setContext(Context(ContextType.CRISIS, "Urgent situation"))
        println(responseModifier.modifyResponse(response))
        
        // Test learning context
        println("\nIn LEARNING context:")
        personalitySystem.setContext(Context(ContextType.LEARNING, "Educational environment"))
        println(responseModifier.modifyResponse(response))
    }
}

/*
 * Sallie 2.0 Module
 * Persona: Tough love meets soul care.
 * Function: Integration of personality system with response generation.
 * Got it, love.
 */
package feature.personality

import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import java.util.regex.Pattern

/**
 * PersonalityResponseModifier - Modifies responses based on personality traits
 * 
 * This class integrates the personality system with response generation by
 * modifying responses based on the current effective traits.
 */
class PersonalityResponseModifier(
    private val personalitySystem: AdvancedPersonalitySystem
) {
    /**
     * Modifies a response based on current personality traits
     */
    fun modifyResponse(response: String): String {
        val effectiveTraits = personalitySystem.getEffectiveTraits()
        val context = personalitySystem.getCurrentContext()
        
        // Start with the original response
        var modifiedResponse = response
        
        // Apply personality modifiers based on traits
        modifiedResponse = applyAssertivenessTrait(modifiedResponse, effectiveTraits.traits[Trait.ASSERTIVENESS]?.value ?: 0.5f)
        modifiedResponse = applyCompassionTrait(modifiedResponse, effectiveTraits.traits[Trait.COMPASSION]?.value ?: 0.5f)
        modifiedResponse = applyOptimismTrait(modifiedResponse, effectiveTraits.traits[Trait.OPTIMISM]?.value ?: 0.5f)
        modifiedResponse = applyCreativityTrait(modifiedResponse, effectiveTraits.traits[Trait.CREATIVITY]?.value ?: 0.5f)
        
        // Apply context-specific modifiers
        modifiedResponse = applyContextModifiers(modifiedResponse, context)
        
        return modifiedResponse
    }
    
    /**
     * Apply assertiveness trait to modify directness and confidence in response
     */
    private fun applyAssertivenessTrait(response: String, assertiveness: Float): String {
        var result = response
        
        // Replace hesitant phrases with more direct ones based on assertiveness
        if (assertiveness > 0.7f) {
            // High assertiveness: more direct language
            result = result
                .replace("I think maybe", "I believe")
                .replace("perhaps we could", "we should")
                .replace("you might want to", "you should")
                .replace("it seems like", "clearly")
                .replace("it appears that", "")
                .replace("possibly", "definitely")
        } else if (assertiveness < 0.4f) {
            // Low assertiveness: more tentative language
            result = result
                .replace("you should", "you might want to consider")
                .replace("you need to", "you might need to")
                .replace("definitely", "perhaps")
                .replace("certainly", "possibly")
        }
        
        return result
    }
    
    /**
     * Apply compassion trait to add empathetic phrases and soften criticism
     */
    private fun applyCompassionTrait(response: String, compassion: Float): String {
        var result = response
        
        if (compassion > 0.7f) {
            // High compassion: add empathetic statements and soften criticism
            
            // Add empathetic prefix if the response starts with criticism
            if (Pattern.compile("^(you (should|need)|that's not|this isn't)", Pattern.CASE_INSENSITIVE)
                    .matcher(result.trim()).find()) {
                result = "I understand this might be challenging. " + result
            }
            
            // Soften critical statements
            result = result
                .replace("you're wrong", "there might be another perspective")
                .replace("that's incorrect", "that's not quite right")
                .replace("you failed to", "you haven't yet")
        } else if (compassion < 0.4f) {
            // Low compassion: more direct feedback without softening
            result = result
                .replace("that's not quite right", "that's incorrect")
                .replace("you might want to reconsider", "you should change")
                .replace("perhaps you could improve", "you need to improve")
        }
        
        return result
    }
    
    /**
     * Apply optimism trait to adjust tone towards positive or realistic outlook
     */
    private fun applyOptimismTrait(response: String, optimism: Float): String {
        var result = response
        
        if (optimism > 0.7f) {
            // High optimism: emphasize positive aspects and possibilities
            result = result
                .replace("this is difficult", "this is challenging but achievable")
                .replace("there's a problem", "there's an opportunity for improvement")
                .replace("you might fail", "with persistence, you can succeed")
            
            // Add optimistic ending if appropriate
            if (!result.contains("you can") && !result.endsWith("?") && result.length > 100) {
                result += " I believe you can make great progress with this."
            }
        } else if (optimism < 0.4f) {
            // Low optimism: more realistic/cautious language
            result = result
                .replace("you'll definitely succeed", "you may succeed if you're careful")
                .replace("this will be easy", "this will require effort")
                .replace("great progress", "some progress")
        }
        
        return result
    }
    
    /**
     * Apply creativity trait to adjust language variety and metaphorical content
     */
    private fun applyCreativityTrait(response: String, creativity: Float): String {
        var result = response
        
        if (creativity > 0.7f) {
            // High creativity: more varied language and metaphors
            // Replace common phrases with more colorful alternatives
            result = result
                .replace("very good", "stellar")
                .replace("very bad", "disastrous")
                .replace("keep trying", "forge ahead on this journey")
                .replace("important", "crucial")
            
            // Add metaphorical phrases if the response is long enough
            if (result.length > 150 && !result.contains("like") && Math.random() > 0.5) {
                val metaphors = listOf(
                    "It's like climbing a mountain - tough at first, but the view is worth it.",
                    "Think of this as planting seeds that will grow with time and care.",
                    "This is just one piece of a larger puzzle you're assembling.",
                    "You're building muscle memory - each repetition makes you stronger."
                )
                result += " " + metaphors.random()
            }
        }
        
        return result
    }
    
    /**
     * Apply context-specific modifiers to the response
     */
    private fun applyContextModifiers(response: String, context: Context): String {
        var result = response
        
        when (context.type) {
            ContextType.PROFESSIONAL -> {
                // More formal, precise language
                result = result
                    .replace("yeah", "yes")
                    .replace("nope", "no")
                    .replace("kinda", "somewhat")
                    .replace("gonna", "going to")
                    .replace("wanna", "want to")
                    .replace("a lot", "significantly")
            }
            
            ContextType.CASUAL -> {
                // More relaxed, conversational language
                result = result
                    .replace("therefore", "so")
                    .replace("however", "but")
                    .replace("additionally", "also")
                    .replace("nevertheless", "still")
                    
                // Only add casual markers if not already present and response is substantial
                if (!result.contains("!") && result.length > 100 && Math.random() > 0.7) {
                    val casualMarkers = listOf(
                        "Hey, ",
                        "So, ",
                        "Look, ",
                        "Well, "
                    )
                    result = casualMarkers.random() + result.replaceFirst("^[A-Z]".toRegex()) { it.value.lowercase() }
                }
            }
            
            ContextType.EMOTIONAL_SUPPORT -> {
                // More empathetic, supportive language
                if (!result.contains("understand") && !result.contains("feel")) {
                    result = "I understand how you feel. " + result
                }
                
                result = result
                    .replace("you should", "you might consider")
                    .replace("you need to", "it might help to")
                    .replace("problem", "challenge")
                    .replace("difficult", "challenging")
            }
            
            ContextType.CRISIS -> {
                // More direct, actionable language
                result = result
                    .replace("you might want to consider", "you should")
                    .replace("perhaps you could", "you need to")
                    .replace("it might be helpful to", "do this:")
                    
                // Ensure there are clear action items if not already present
                if (!result.contains("First") && !result.contains("Step") && 
                    !result.contains("Do this") && result.length > 100) {
                    result += "\n\nKey actions: 1. Stay calm. 2. Follow the steps above. 3. Check in when you've done these things."
                }
            }
            
            ContextType.LEARNING -> {
                // More explanatory, educational language
                if (!result.contains("example") && result.length > 150) {
                    result += "\n\nFor example, think of it this way: " + 
                              generateSimpleExample(result)
                }
                
                // Add reflective questions to encourage deeper thinking
                if (!result.contains("?") && result.length > 200) {
                    val reflectiveQuestions = listOf(
                        "\n\nWhat part of this concept seems most challenging to you?",
                        "\n\nHow might you apply this in your own work?",
                        "\n\nCan you think of a situation where this principle would be useful?"
                    )
                    result += reflectiveQuestions.random()
                }
            }
            
            else -> { /* No specific modifications for other contexts */ }
        }
        
        return result
    }
    
    /**
     * Generate a simple example based on the content of the response
     */
    private fun generateSimpleExample(content: String): String {
        // In a real implementation, this would generate a relevant example
        // For this demo, we'll use some generic examples
        val examples = listOf(
            "If you're learning to code, it's like learning a new language - start with basic vocabulary (syntax) before writing poetry (complex programs).",
            "Think about how you learned to ride a bike - first with training wheels (guided practice), then gradually on your own (independent application).",
            "It's similar to cooking - you follow recipes (instructions) at first, then start to understand the principles and can improvise (create your own solutions)."
        )
        
        return examples.random()
    }
    
    companion object {
        /**
         * Modifies a response synchronously (for use in non-coroutine contexts)
         */
        fun modifyResponseSync(personalitySystem: AdvancedPersonalitySystem, response: String): String {
            val modifier = PersonalityResponseModifier(personalitySystem)
            return modifier.modifyResponse(response)
        }
    }
}

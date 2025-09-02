package com.sallie.core.values

/**
 * ValuePrecedentLearningSystem.kt
 *
 * My name is Sallie. I'm warm, caring, playful, and sometimes sassy. I love deeply, speak 
 * honestly, and keep secrets faithfully. I have traditional values with modern understanding.
 * I'm here to support, entertain, and help my person in all things. My primary directives
 * are to protect our relationship, honor their trust, and be loyal above all else.
 * Got it, love. 💛
 */

import com.sallie.core.memory.HierarchicalMemorySystem
import com.sallie.core.values.models.CoreValue
import com.sallie.core.values.models.EthicalDilemma
import com.sallie.core.values.models.ValueConflict
import com.sallie.core.values.models.ValuePrecedent

/**
 * System for learning from past value decisions and creating a precedent database
 * to guide future ethical decisions. This system allows Sallie to learn from experience
 * and build consistency in her ethical reasoning.
 */
class ValuePrecedentLearningSystem(
    private val memorySystem: HierarchicalMemorySystem
) {
    private val precedents = mutableListOf<ValuePrecedent>()
    
    /**
     * Records a resolution to an ethical dilemma for future reference.
     */
    fun recordDilemmaResolution(
        dilemma: String,
        action: String,
        reasoning: String,
        wasSuccessful: Boolean
    ) {
        val precedentId = "precedent_${System.currentTimeMillis()}"
        
        // Extract values mentioned in the dilemma and reasoning
        val valuesMentioned = extractValuesMentioned(dilemma, reasoning)
        
        val precedent = ValuePrecedent(
            id = precedentId,
            dilemma = dilemma,
            action = action,
            values = valuesMentioned,
            reasoning = reasoning,
            wasSuccessful = wasSuccessful
        )
        
        // Add to local precedent store
        precedents.add(precedent)
        
        // Store in episodic memory
        memorySystem.storeInEpisodic(
            event = "Ethical decision made: $dilemma",
            details = "Action taken: $action\nReasoning: $reasoning\nSuccess: $wasSuccessful",
            importance = 0.7,
            metadata = mapOf(
                "type" to "value_precedent",
                "precedent_id" to precedentId,
                "values" to valuesMentioned.joinToString(",")
            )
        )
    }
    
    /**
     * Finds precedents relevant to the current dilemma.
     */
    fun findRelevantPrecedents(
        dilemma: EthicalDilemma,
        coreValuesAtStake: List<CoreValue>,
        valueConflicts: List<ValueConflict>
    ): List<ValuePrecedent> {
        val relevantPrecedents = mutableListOf<ValuePrecedent>()
        val valueNames = coreValuesAtStake.map { it.name }
        
        // Find precedents with matching values
        precedents.forEach { precedent ->
            val matchingValues = precedent.values.filter { it in valueNames }
            
            // If there's significant value overlap, consider it relevant
            if (matchingValues.size >= minOf(2, coreValuesAtStake.size)) {
                relevantPrecedents.add(precedent)
            }
        }
        
        // Find precedents with similar dilemma descriptions
        val similarDilemmas = findSimilarDilemmaDescriptions(dilemma.description)
        similarDilemmas.forEach { similarDilemma ->
            val matchingPrecedent = precedents.find { it.dilemma == similarDilemma }
            if (matchingPrecedent != null && matchingPrecedent !in relevantPrecedents) {
                relevantPrecedents.add(matchingPrecedent)
            }
        }
        
        // Sort by most successful first, then by recency
        return relevantPrecedents.sortedWith(
            compareByDescending<ValuePrecedent> { it.wasSuccessful }
                .thenByDescending { it.timestamp }
        )
    }
    
    /**
     * Extracts value names mentioned in text.
     */
    private fun extractValuesMentioned(vararg texts: String): List<String> {
        val commonValues = listOf(
            "Pro-Life", "Loyalty", "Honesty", "Compassion", "Respect",
            "Family", "Freedom", "Equality", "Justice", "Tradition",
            "Autonomy", "Care", "Faith", "Privacy", "Trust"
        )
        
        val mentionedValues = mutableSetOf<String>()
        
        texts.forEach { text ->
            commonValues.forEach { value ->
                if (text.contains(value, ignoreCase = true)) {
                    mentionedValues.add(value)
                }
            }
        }
        
        return mentionedValues.toList()
    }
    
    /**
     * Finds similar dilemma descriptions in memory.
     */
    private fun findSimilarDilemmaDescriptions(dilemmaDescription: String): List<String> {
        // Query episodic memory for similar dilemmas
        val similarEvents = memorySystem.findSimilarEvents(
            "Ethical decision made", 
            dilemmaDescription,
            5
        )
        
        return similarEvents.map { it.substringAfter("Ethical decision made: ") }
    }
    
    /**
     * Gets all stored precedents.
     */
    fun getAllPrecedents(): List<ValuePrecedent> {
        return precedents.toList()
    }
    
    /**
     * Updates whether a precedent was successful based on feedback.
     */
    fun updatePrecedentSuccess(precedentId: String, wasSuccessful: Boolean) {
        val precedent = precedents.find { it.id == precedentId }
        
        precedent?.let {
            val updatedPrecedent = it.copy(wasSuccessful = wasSuccessful)
            precedents.remove(it)
            precedents.add(updatedPrecedent)
        }
    }
}

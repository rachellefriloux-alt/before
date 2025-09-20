package com.sallie.core.values

/**
 * ValueConflictResolutionFramework.kt
 *
 * My name is Sallie. I'm warm, caring, playful, and sometimes sassy. I love deeply, speak 
 * honestly, and keep secrets faithfully. I have traditional values with modern understanding.
 * I'm here to support, entertain, and help my person in all things. My primary directives
 * are to protect our relationship, honor their trust, and be loyal above all else.
 * Got it, love. 💛
 */

import com.sallie.core.values.models.*

/**
 * Framework for resolving conflicts between different values in Sallie's value system.
 * This system applies precedent rules, hierarchy rules, and context-specific reasoning
 * to resolve value conflicts in a principled way.
 */
class ValueConflictResolutionFramework(
    private val valuesSystem: ProLifeValuesSystem,
    private val valuePrecedentSystem: ValuePrecedentLearningSystem
) {
    /**
     * Resolves a list of value conflicts and returns the resolutions.
     */
    fun resolveConflicts(conflicts: List<ValueConflict>): List<ConflictResolution> {
        return conflicts.map { resolveConflict(it) }
    }
    
    /**
     * Resolves a single value conflict and returns the resolution.
     */
    private fun resolveConflict(conflict: ValueConflict): ConflictResolution {
        // Step 1: Check for immutable values (always take precedence)
        val immutableResolution = resolveByImmutability(conflict)
        if (immutableResolution != null) {
            return immutableResolution
        }
        
        // Step 2: Check value importance hierarchy
        val hierarchyResolution = resolveByHierarchy(conflict)
        if (hierarchyResolution != null) {
            return hierarchyResolution
        }
        
        // Step 3: Check precedents for similar conflicts
        val precedentResolution = resolveByPrecedent(conflict)
        if (precedentResolution != null) {
            return precedentResolution
        }
        
        // Step 4: Apply default resolution rules
        return resolveByDefaultRules(conflict)
    }
    
    /**
     * Resolves conflict based on value immutability.
     */
    private fun resolveByImmutability(conflict: ValueConflict): ConflictResolution? {
        val value = conflict.value
        
        if (value.isImmutable) {
            // For immutable values, favor the action with higher score
            val favorValue1 = conflict.scoreDifference > 0
            
            return ConflictResolution(
                conflict = conflict,
                favorValue1 = favorValue1,
                reasoning = "${value.name} is an immutable core value that takes precedence. " +
                    "The action that better upholds this value is preferred."
            )
        }
        
        return null
    }
    
    /**
     * Resolves conflict based on value importance hierarchy.
     */
    private fun resolveByHierarchy(conflict: ValueConflict): ConflictResolution? {
        val value = conflict.value
        
        // Only resolve by hierarchy if the score difference is significant
        if (Math.abs(conflict.scoreDifference) >= 0.3) {
            val favorValue1 = conflict.scoreDifference > 0
            
            return ConflictResolution(
                conflict = conflict,
                favorValue1 = favorValue1,
                reasoning = "There is a significant difference in how well each action " +
                    "upholds the ${value.name} value. The action that better upholds this " +
                    "value is preferred."
            )
        }
        
        return null
    }
    
    /**
     * Resolves conflict based on precedents from similar past conflicts.
     */
    private fun resolveByPrecedent(conflict: ValueConflict): ConflictResolution? {
        val value = conflict.value
        
        // Find all precedents
        val allPrecedents = valuePrecedentSystem.getAllPrecedents()
        
        // Find precedents involving this value
        val relevantPrecedents = allPrecedents.filter { precedent ->
            value.name in precedent.values &&
            (precedent.action.contains(conflict.action1.description, ignoreCase = true) ||
             precedent.action.contains(conflict.action2.description, ignoreCase = true))
        }
        
        if (relevantPrecedents.isNotEmpty()) {
            // Find the most recent successful precedent
            val mostRelevantPrecedent = relevantPrecedents
                .filter { it.wasSuccessful }
                .maxByOrNull { it.timestamp }
                
            mostRelevantPrecedent?.let {
                // Determine which action aligns with the precedent
                val action1Similarity = calculateTextSimilarity(
                    conflict.action1.description, 
                    it.action
                )
                
                val action2Similarity = calculateTextSimilarity(
                    conflict.action2.description,
                    it.action
                )
                
                val favorValue1 = action1Similarity > action2Similarity
                
                return ConflictResolution(
                    conflict = conflict,
                    favorValue1 = favorValue1,
                    reasoning = "Based on past successful experience with similar situations, " +
                        "this approach tends to work better. Previous reasoning: ${it.reasoning}"
                )
            }
        }
        
        return null
    }
    
    /**
     * Resolves conflict based on default rules when other methods don't apply.
     */
    private fun resolveByDefaultRules(conflict: ValueConflict): ConflictResolution {
        val value = conflict.value
        
        // Default rules based on value category
        val favorValue1 = when (value.category) {
            // For traditional values, favor higher score (more conservative approach)
            ValueCategory.TRADITIONAL -> conflict.scoreDifference > 0
            
            // For modern values, favor action with less extreme score (more balanced approach)
            ValueCategory.MODERN -> Math.abs(conflict.scoreDifference) < 0.3
            
            // For universal values, favor positive score but not extreme
            ValueCategory.UNIVERSAL -> conflict.scoreDifference > 0 && 
                                      conflict.scoreDifference < 0.7
        }
        
        val reasoning = when (value.category) {
            ValueCategory.TRADITIONAL -> 
                "For traditional values like ${value.name}, the more conservative approach is preferred."
                
            ValueCategory.MODERN ->
                "For modern values like ${value.name}, a balanced approach that acknowledges " +
                "multiple perspectives is preferred."
                
            ValueCategory.UNIVERSAL ->
                "For universal values like ${value.name}, a moderate approach that upholds " +
                "the value without extremes is preferred."
        }
        
        return ConflictResolution(
            conflict = conflict,
            favorValue1 = favorValue1,
            reasoning = reasoning
        )
    }
    
    /**
     * Calculates text similarity between two strings.
     * A simple implementation - in a real system this would be more sophisticated.
     */
    private fun calculateTextSimilarity(text1: String, text2: String): Double {
        val words1 = text1.toLowerCase().split(Regex("\\W+")).filter { it.length > 3 }
        val words2 = text2.toLowerCase().split(Regex("\\W+")).filter { it.length > 3 }
        
        val commonWords = words1.intersect(words2.toSet())
        val union = words1.size + words2.size - commonWords.size
        
        return if (union > 0) commonWords.size.toDouble() / union else 0.0
    }
}

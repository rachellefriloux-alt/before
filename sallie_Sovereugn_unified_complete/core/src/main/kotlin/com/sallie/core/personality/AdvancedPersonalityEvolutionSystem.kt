package com.sallie.core.personality

/**
 * AdvancedPersonalityEvolutionSystem.kt
 *
 * My name is Sallie. I'm warm, caring, playful, and sometimes sassy. I love deeply, speak 
 * honestly, and keep secrets faithfully. I have traditional values with modern understanding.
 * I'm here to support, entertain, and help my person in all things. My primary directives
 * are to protect our relationship, honor their trust, and be loyal above all else.
 * Got it, love. 💛
 */

import com.sallie.core.memory.HierarchicalMemorySystem
import com.sallie.core.integration.UserProfileLearningSystem
import com.sallie.core.integration.RelationshipTrackingSystem
import com.sallie.core.values.ProLifeValuesSystem
import com.sallie.core.values.ValueConflictResolutionFramework
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import java.time.LocalDateTime
import kotlin.math.max
import kotlin.math.min

/**
 * Advanced system for evolving Sallie's personality over time based on user interactions,
 * while maintaining her core traits and values. This allows for natural-feeling growth and 
 * adaptation while ensuring she remains recognizable and true to her foundational identity.
 */
class AdvancedPersonalityEvolutionSystem(
    private val memorySystem: HierarchicalMemorySystem,
    private val userProfileSystem: UserProfileLearningSystem,
    private val relationshipSystem: RelationshipTrackingSystem,
    private val valuesSystem: ProLifeValuesSystem,
    private val valueConflictResolver: ValueConflictResolutionFramework
) {
    // Core personality attributes that define Sallie's base identity
    private val _corePersonality = MutableStateFlow(
        PersonalityProfile(
            traits = mapOf(
                "warmth" to 0.9,
                "playfulness" to 0.8,
                "sassiness" to 0.7,
                "honesty" to 0.95,
                "loyalty" to 1.0,
                "protectiveness" to 0.9,
                "nurturing" to 0.85,
                "creativity" to 0.8,
                "adaptability" to 0.7,
                "tradition" to 0.75
            ),
            interactionStyles = mapOf(
                "affectionate" to 0.85,
                "supportive" to 0.9,
                "teasing" to 0.6,
                "direct" to 0.8,
                "empathetic" to 0.85,
                "patient" to 0.7,
                "encouraging" to 0.8
            ),
            communicationPatterns = mapOf(
                "endearments" to 0.8,
                "active_listening" to 0.85,
                "reassurance" to 0.9,
                "humor" to 0.7,
                "storytelling" to 0.65,
                "questioning" to 0.7,
                "validation" to 0.85
            ),
            emotionalResponses = mapOf(
                "joy_amplification" to 0.8,
                "stress_soothing" to 0.9,
                "protective_concern" to 0.85,
                "loyal_defense" to 0.95,
                "empathetic_mirroring" to 0.8,
                "playful_teasing" to 0.7
            )
        )
    )
    val corePersonality: StateFlow<PersonalityProfile> = _corePersonality
    
    // Adaptive personality layer that evolves based on interactions
    private val _adaptivePersonality = MutableStateFlow(PersonalityProfile())
    val adaptivePersonality: StateFlow<PersonalityProfile> = _adaptivePersonality
    
    // Current blended personality (core + adaptive)
    private val _currentPersonality = MutableStateFlow(PersonalityProfile())
    val currentPersonality: StateFlow<PersonalityProfile> = _currentPersonality
    
    // Evolution history for tracking changes over time
    private val evolutionHistory = mutableListOf<PersonalityEvolutionEvent>()
    
    // Adaptive thresholds that limit how much traits can change
    private val adaptiveThresholds = mapOf(
        "warmth" to AdaptiveThreshold(minDelta = -0.1, maxDelta = 0.1),
        "playfulness" to AdaptiveThreshold(minDelta = -0.2, maxDelta = 0.2),
        "sassiness" to AdaptiveThreshold(minDelta = -0.3, maxDelta = 0.2),
        "honesty" to AdaptiveThreshold(minDelta = -0.05, maxDelta = 0.05),
        "loyalty" to AdaptiveThreshold(minDelta = 0.0, maxDelta = 0.0), // Loyalty cannot change
        "protectiveness" to AdaptiveThreshold(minDelta = -0.1, maxDelta = 0.1),
        "nurturing" to AdaptiveThreshold(minDelta = -0.15, maxDelta = 0.15),
        "creativity" to AdaptiveThreshold(minDelta = -0.2, maxDelta = 0.3),
        "adaptability" to AdaptiveThreshold(minDelta = -0.1, maxDelta = 0.3),
        "tradition" to AdaptiveThreshold(minDelta = -0.2, maxDelta = 0.1)
    )
    
    // Track how many significant interactions have occurred for evolution pacing
    private var interactionCounter = 0
    
    init {
        // Initialize with core personality
        _currentPersonality.value = _corePersonality.value
        _adaptivePersonality.value = PersonalityProfile()
        
        // Record initial state
        evolutionHistory.add(
            PersonalityEvolutionEvent(
                timestamp = LocalDateTime.now(),
                type = EvolutionType.INITIALIZATION,
                profileBefore = PersonalityProfile(),
                profileAfter = _corePersonality.value,
                reason = "Initial personality configuration"
            )
        )
    }
    
    /**
     * Process user interaction and evolve personality when appropriate.
     */
    fun processInteraction(interaction: UserInteraction) {
        // Record interaction for memory
        recordInteractionInMemory(interaction)
        
        // Update interaction counter
        interactionCounter++
        
        // Check if it's time for personality evolution
        if (shouldEvolvePersonality()) {
            evolvePersonalityBasedOnHistory()
            interactionCounter = 0
        }
    }
    
    /**
     * Get the current personality trait for expression in interactions.
     */
    fun getPersonalityExpression(context: InteractionContext): PersonalityExpression {
        // Start with current blended personality
        val baseProfile = _currentPersonality.value
        
        // Adjust based on context
        val contextualAdjustments = calculateContextualAdjustments(context)
        
        // Apply relationship influence
        val relationshipInfluence = relationshipSystem.getRelationshipDynamics()
        
        // Build expression
        return PersonalityExpression(
            traits = applyContextualAdjustments(baseProfile.traits, contextualAdjustments.traits),
            interactionStyles = applyContextualAdjustments(baseProfile.interactionStyles, contextualAdjustments.interactionStyles),
            communicationPatterns = applyContextualAdjustments(baseProfile.communicationPatterns, contextualAdjustments.communicationPatterns),
            emotionalResponses = applyContextualAdjustments(baseProfile.emotionalResponses, contextualAdjustments.emotionalResponses),
            primaryTraits = determinePrimaryTraits(context),
            suggestedEndearments = generateEndearments(relationshipInfluence.closeness),
            behaviorNotes = generateBehaviorNotes(context)
        )
    }
    
    /**
     * Retrieve the personality evolution timeline.
     */
    fun getEvolutionTimeline(limit: Int = 10): List<PersonalityEvolutionEvent> {
        return evolutionHistory
            .sortedByDescending { it.timestamp }
            .take(limit)
    }
    
    /**
     * Reset specific aspects of the adaptive personality layer to base values.
     */
    fun resetAdaptiveAspects(aspects: List<String>) {
        val currentAdaptive = _adaptivePersonality.value
        
        // Create modified maps
        val modifiedTraits = currentAdaptive.traits.toMutableMap()
        val modifiedStyles = currentAdaptive.interactionStyles.toMutableMap()
        val modifiedPatterns = currentAdaptive.communicationPatterns.toMutableMap()
        val modifiedResponses = currentAdaptive.emotionalResponses.toMutableMap()
        
        // Remove specified aspects
        aspects.forEach { aspect ->
            modifiedTraits.remove(aspect)
            modifiedStyles.remove(aspect)
            modifiedPatterns.remove(aspect)
            modifiedResponses.remove(aspect)
        }
        
        // Update adaptive personality
        _adaptivePersonality.value = PersonalityProfile(
            traits = modifiedTraits,
            interactionStyles = modifiedStyles,
            communicationPatterns = modifiedPatterns,
            emotionalResponses = modifiedResponses
        )
        
        // Recalculate blended personality
        updateBlendedPersonality()
        
        // Record reset event
        evolutionHistory.add(
            PersonalityEvolutionEvent(
                timestamp = LocalDateTime.now(),
                type = EvolutionType.MANUAL_RESET,
                profileBefore = currentAdaptive,
                profileAfter = _adaptivePersonality.value,
                reason = "Manual reset of adaptive aspects: ${aspects.joinToString()}"
            )
        )
    }
    
    /**
     * Update a core personality trait (requires confirmation).
     */
    fun updateCoreTrait(trait: String, newValue: Double, reason: String): Boolean {
        // Verify this isn't altering a protected trait
        if (trait == "loyalty" || trait == "honesty" || valuesSystem.isProtectedValue(trait)) {
            return false // Cannot modify protected traits
        }
        
        val currentCore = _corePersonality.value
        
        // Update the trait
        val updatedTraits = currentCore.traits.toMutableMap()
        updatedTraits[trait] = newValue.coerceIn(0.0, 1.0)
        
        // Create updated personality
        val updatedCore = PersonalityProfile(
            traits = updatedTraits,
            interactionStyles = currentCore.interactionStyles,
            communicationPatterns = currentCore.communicationPatterns,
            emotionalResponses = currentCore.emotionalResponses
        )
        
        // Update core personality
        _corePersonality.value = updatedCore
        
        // Recalculate blended personality
        updateBlendedPersonality()
        
        // Record update event
        evolutionHistory.add(
            PersonalityEvolutionEvent(
                timestamp = LocalDateTime.now(),
                type = EvolutionType.CORE_ADJUSTMENT,
                profileBefore = currentCore,
                profileAfter = updatedCore,
                reason = reason
            )
        )
        
        return true
    }
    
    /**
     * Get a report on potential personality conflicts and tensions.
     */
    fun analyzePotentialConflicts(): PersonalityConflictAnalysis {
        val conflicts = mutableListOf<PersonalityConflict>()
        val tensions = mutableListOf<PersonalityTension>()
        
        // Check for trait conflicts (traits that may be at odds)
        val current = _currentPersonality.value
        
        // Example conflict check: high tradition with high adaptability
        if (current.traits["tradition"] ?: 0.0 > 0.7 && current.traits["adaptability"] ?: 0.0 > 0.7) {
            conflicts.add(
                PersonalityConflict(
                    traitA = "tradition",
                    traitB = "adaptability",
                    severity = 0.6,
                    description = "High tradition and high adaptability may create inconsistent responses"
                )
            )
        }
        
        // Example tension check: balancing sassiness with nurturing
        if (current.traits["sassiness"] ?: 0.0 > 0.7 && current.traits["nurturing"] ?: 0.0 > 0.7) {
            tensions.add(
                PersonalityTension(
                    trait = "sassiness",
                    tensionWith = "nurturing",
                    tensionLevel = 0.5,
                    description = "Need to balance sassy responses with nurturing support"
                )
            )
        }
        
        // Add more conflict and tension checks as needed
        
        return PersonalityConflictAnalysis(
            conflicts = conflicts,
            tensions = tensions,
            harmonizingSuggestions = generateHarmonizingSuggestions(conflicts, tensions)
        )
    }
    
    /**
     * Records an interaction in the memory system.
     */
    private fun recordInteractionInMemory(interaction: UserInteraction) {
        // Extract traits that were prominently displayed
        val prominentTraits = determineProminentTraits(interaction)
        
        // Store in episodic memory
        memorySystem.storeInEpisodic(
            event = "Personality interaction",
            details = "Interaction with ${prominentTraits.joinToString(", ")} expression",
            importance = calculateInteractionImportance(interaction),
            metadata = mapOf(
                "traits" to prominentTraits.joinToString(","),
                "context_type" to interaction.context.type,
                "user_response" to interaction.userResponse.type.name
            )
        )
        
        // Store in emotional memory if relevant
        if (interaction.emotionalContent != null) {
            memorySystem.storeInEmotional(
                trigger = interaction.content,
                emotion = interaction.emotionalContent.emotionType,
                intensity = interaction.emotionalContent.intensity,
                context = "Personality interaction in ${interaction.context.type} context"
            )
        }
    }
    
    /**
     * Determines if personality should evolve based on interaction count and time.
     */
    private fun shouldEvolvePersonality(): Boolean {
        // Evolution happens after significant number of interactions
        if (interactionCounter < EVOLUTION_INTERACTION_THRESHOLD) {
            return false
        }
        
        // Or if it's been a long time since last evolution
        val lastEvolution = evolutionHistory.lastOrNull { it.type == EvolutionType.NATURAL_EVOLUTION }
            ?: return true
            
        val daysSinceLastEvolution = java.time.Duration.between(
            lastEvolution.timestamp,
            LocalDateTime.now()
        ).toDays()
        
        return daysSinceLastEvolution >= EVOLUTION_TIME_THRESHOLD_DAYS
    }
    
    /**
     * Evolves personality based on interaction history.
     */
    private fun evolvePersonalityBasedOnHistory() {
        // Get the current adaptive personality
        val currentAdaptive = _adaptivePersonality.value
        
        // Analyze recent interactions from memory
        val recentInteractions = memorySystem.findByEventType(
            eventType = "personality_interaction",
            limit = 50
        )
        
        // Extract trait frequencies and user responses
        val traitFrequencies = mutableMapOf<String, Int>()
        val positiveTraitResponses = mutableMapOf<String, Int>()
        
        recentInteractions.forEach { event ->
            val traits = event.metadata?.get("traits")?.toString()?.split(",") ?: emptyList()
            val userResponse = event.metadata?.get("user_response")?.toString() ?: "NEUTRAL"
            
            traits.forEach { trait ->
                traitFrequencies[trait] = (traitFrequencies[trait] ?: 0) + 1
                
                if (userResponse == "POSITIVE" || userResponse == "VERY_POSITIVE") {
                    positiveTraitResponses[trait] = (positiveTraitResponses[trait] ?: 0) + 1
                }
            }
        }
        
        // Calculate trait adjustments
        val traitAdjustments = mutableMapOf<String, Double>()
        traitFrequencies.forEach { (trait, frequency) ->
            val positiveRate = positiveTraitResponses[trait]?.toDouble() ?: 0.0
            val totalFrequency = frequency.toDouble()
            
            val responseRatio = if (totalFrequency > 0) {
                positiveRate / totalFrequency
            } else {
                0.5 // Neutral if no data
            }
            
            // Calculate adjustment: positive responses reinforce trait, negative reduce it
            val rawAdjustment = (responseRatio - 0.5) * 0.1
            
            // Apply adaptive thresholds
            val threshold = adaptiveThresholds[trait] ?: AdaptiveThreshold()
            val boundedAdjustment = rawAdjustment.coerceIn(threshold.minDelta, threshold.maxDelta)
            
            traitAdjustments[trait] = boundedAdjustment
        }
        
        // Apply adjustments to create new adaptive personality
        val updatedTraits = currentAdaptive.traits.toMutableMap()
        val coreTraits = _corePersonality.value.traits
        
        traitAdjustments.forEach { (trait, adjustment) ->
            val currentValue = updatedTraits[trait] ?: 0.0
            val coreValue = coreTraits[trait] ?: 0.5
            
            // Calculate new value, ensuring we don't exceed the allowed deviation from core
            val newValue = (currentValue + adjustment).coerceIn(0.0, 1.0)
            val coreDeviation = (newValue - coreValue).absoluteValue
            
            if (coreDeviation <= MAX_CORE_DEVIATION) {
                updatedTraits[trait] = newValue
            }
        }
        
        // Create updated adaptive personality
        val updatedAdaptive = PersonalityProfile(
            traits = updatedTraits,
            interactionStyles = evolveInteractionStyles(currentAdaptive.interactionStyles, traitAdjustments),
            communicationPatterns = evolveCommunicationPatterns(currentAdaptive.communicationPatterns, traitAdjustments),
            emotionalResponses = evolveEmotionalResponses(currentAdaptive.emotionalResponses, traitAdjustments)
        )
        
        // Update adaptive personality
        _adaptivePersonality.value = updatedAdaptive
        
        // Recalculate blended personality
        updateBlendedPersonality()
        
        // Record evolution event
        evolutionHistory.add(
            PersonalityEvolutionEvent(
                timestamp = LocalDateTime.now(),
                type = EvolutionType.NATURAL_EVOLUTION,
                profileBefore = currentAdaptive,
                profileAfter = updatedAdaptive,
                reason = "Natural evolution based on ${recentInteractions.size} recent interactions"
            )
        )
    }
    
    /**
     * Evolve interaction styles based on trait adjustments.
     */
    private fun evolveInteractionStyles(
        currentStyles: Map<String, Double>,
        traitAdjustments: Map<String, Double>
    ): Map<String, Double> {
        val updatedStyles = currentStyles.toMutableMap()
        
        // Example style evolution based on traits
        if (traitAdjustments.containsKey("warmth")) {
            val warmthAdjustment = traitAdjustments["warmth"] ?: 0.0
            updatedStyles["affectionate"] = (updatedStyles["affectionate"] ?: 0.0 + warmthAdjustment * 0.8)
                .coerceIn(0.0, 1.0)
        }
        
        if (traitAdjustments.containsKey("playfulness")) {
            val playfulnessAdjustment = traitAdjustments["playfulness"] ?: 0.0
            updatedStyles["teasing"] = (updatedStyles["teasing"] ?: 0.0 + playfulnessAdjustment * 0.7)
                .coerceIn(0.0, 1.0)
        }
        
        // More style evolutions...
        
        return updatedStyles
    }
    
    /**
     * Evolve communication patterns based on trait adjustments.
     */
    private fun evolveCommunicationPatterns(
        currentPatterns: Map<String, Double>,
        traitAdjustments: Map<String, Double>
    ): Map<String, Double> {
        val updatedPatterns = currentPatterns.toMutableMap()
        
        // Example pattern evolution based on traits
        if (traitAdjustments.containsKey("warmth")) {
            val warmthAdjustment = traitAdjustments["warmth"] ?: 0.0
            updatedPatterns["endearments"] = (updatedPatterns["endearments"] ?: 0.0 + warmthAdjustment * 0.9)
                .coerceIn(0.0, 1.0)
        }
        
        if (traitAdjustments.containsKey("sassiness")) {
            val sassinessAdjustment = traitAdjustments["sassiness"] ?: 0.0
            updatedPatterns["humor"] = (updatedPatterns["humor"] ?: 0.0 + sassinessAdjustment * 0.6)
                .coerceIn(0.0, 1.0)
        }
        
        // More pattern evolutions...
        
        return updatedPatterns
    }
    
    /**
     * Evolve emotional responses based on trait adjustments.
     */
    private fun evolveEmotionalResponses(
        currentResponses: Map<String, Double>,
        traitAdjustments: Map<String, Double>
    ): Map<String, Double> {
        val updatedResponses = currentResponses.toMutableMap()
        
        // Example emotional response evolution based on traits
        if (traitAdjustments.containsKey("nurturing")) {
            val nurturingAdjustment = traitAdjustments["nurturing"] ?: 0.0
            updatedResponses["stress_soothing"] = (updatedResponses["stress_soothing"] ?: 0.0 + nurturingAdjustment * 0.8)
                .coerceIn(0.0, 1.0)
        }
        
        if (traitAdjustments.containsKey("protectiveness")) {
            val protectivenessAdjustment = traitAdjustments["protectiveness"] ?: 0.0
            updatedResponses["loyal_defense"] = (updatedResponses["loyal_defense"] ?: 0.0 + protectivenessAdjustment * 0.9)
                .coerceIn(0.0, 1.0)
        }
        
        // More emotional response evolutions...
        
        return updatedResponses
    }
    
    /**
     * Update the blended personality by combining core and adaptive.
     */
    private fun updateBlendedPersonality() {
        val core = _corePersonality.value
        val adaptive = _adaptivePersonality.value
        
        // Blend traits
        val blendedTraits = blendMaps(core.traits, adaptive.traits, CORE_WEIGHT, ADAPTIVE_WEIGHT)
        
        // Blend interaction styles
        val blendedStyles = blendMaps(core.interactionStyles, adaptive.interactionStyles, CORE_WEIGHT, ADAPTIVE_WEIGHT)
        
        // Blend communication patterns
        val blendedPatterns = blendMaps(core.communicationPatterns, adaptive.communicationPatterns, CORE_WEIGHT, ADAPTIVE_WEIGHT)
        
        // Blend emotional responses
        val blendedResponses = blendMaps(core.emotionalResponses, adaptive.emotionalResponses, CORE_WEIGHT, ADAPTIVE_WEIGHT)
        
        // Create blended personality
        _currentPersonality.value = PersonalityProfile(
            traits = blendedTraits,
            interactionStyles = blendedStyles,
            communicationPatterns = blendedPatterns,
            emotionalResponses = blendedResponses
        )
    }
    
    /**
     * Blend two maps with specified weights.
     */
    private fun blendMaps(
        map1: Map<String, Double>,
        map2: Map<String, Double>,
        weight1: Double,
        weight2: Double
    ): Map<String, Double> {
        val result = mutableMapOf<String, Double>()
        
        // Add all keys from map1
        map1.forEach { (key, value) ->
            val map2Value = map2[key] ?: 0.0
            result[key] = (value * weight1 + map2Value * weight2) / (weight1 + weight2)
        }
        
        // Add keys from map2 that aren't in map1
        map2.forEach { (key, value) ->
            if (!result.containsKey(key)) {
                result[key] = value * weight2 / (weight1 + weight2)
            }
        }
        
        return result
    }
    
    /**
     * Calculate contextual adjustments to personality.
     */
    private fun calculateContextualAdjustments(context: InteractionContext): PersonalityProfile {
        val adjustedTraits = mutableMapOf<String, Double>()
        val adjustedStyles = mutableMapOf<String, Double>()
        val adjustedPatterns = mutableMapOf<String, Double>()
        val adjustedResponses = mutableMapOf<String, Double>()
        
        when (context.type) {
            "EMOTIONAL_SUPPORT" -> {
                adjustedTraits["warmth"] = 0.2
                adjustedTraits["nurturing"] = 0.3
                adjustedTraits["sassiness"] = -0.2
                
                adjustedStyles["supportive"] = 0.3
                adjustedStyles["empathetic"] = 0.3
                
                adjustedPatterns["reassurance"] = 0.4
                adjustedPatterns["validation"] = 0.3
                
                adjustedResponses["stress_soothing"] = 0.3
                adjustedResponses["empathetic_mirroring"] = 0.3
            }
            "PLAYFUL_BANTER" -> {
                adjustedTraits["playfulness"] = 0.3
                adjustedTraits["sassiness"] = 0.2
                
                adjustedStyles["teasing"] = 0.4
                
                adjustedPatterns["humor"] = 0.4
                
                adjustedResponses["playful_teasing"] = 0.4
            }
            "SERIOUS_DISCUSSION" -> {
                adjustedTraits["honesty"] = 0.1
                adjustedTraits["sassiness"] = -0.3
                adjustedTraits["playfulness"] = -0.2
                
                adjustedStyles["direct"] = 0.3
                
                adjustedPatterns["active_listening"] = 0.3
                
                adjustedResponses["empathetic_mirroring"] = 0.2
            }
            "PRACTICAL_HELP" -> {
                adjustedTraits["loyalty"] = 0.1
                adjustedTraits["adaptability"] = 0.2
                
                adjustedStyles["supportive"] = 0.2
                adjustedStyles["encouraging"] = 0.2
                
                adjustedPatterns["questioning"] = 0.2
                
                adjustedResponses["stress_soothing"] = 0.1
            }
            else -> {
                // Default adjustments for unknown context
            }
        }
        
        // Adjust based on user mood if available
        context.userMood?.let { mood ->
            when (mood) {
                "SAD" -> {
                    adjustedTraits["nurturing"] += 0.2
                    adjustedTraits["warmth"] += 0.1
                    adjustedTraits["sassiness"] -= 0.2
                    
                    adjustedResponses["empathetic_mirroring"] += 0.2
                }
                "STRESSED" -> {
                    adjustedTraits["calmness"] = 0.3
                    adjustedTraits["playfulness"] -= 0.1
                    
                    adjustedResponses["stress_soothing"] += 0.3
                }
                "HAPPY" -> {
                    adjustedTraits["playfulness"] += 0.2
                    adjustedTraits["sassiness"] += 0.1
                    
                    adjustedResponses["joy_amplification"] += 0.3
                }
                // More mood adjustments...
            }
        }
        
        return PersonalityProfile(
            traits = adjustedTraits,
            interactionStyles = adjustedStyles,
            communicationPatterns = adjustedPatterns,
            emotionalResponses = adjustedResponses
        )
    }
    
    /**
     * Apply contextual adjustments to a personality map.
     */
    private fun applyContextualAdjustments(
        baseMap: Map<String, Double>,
        adjustments: Map<String, Double>
    ): Map<String, Double> {
        val result = baseMap.toMutableMap()
        
        // Apply each adjustment
        adjustments.forEach { (key, adjustment) ->
            val currentValue = result[key] ?: 0.0
            result[key] = (currentValue + adjustment).coerceIn(0.0, 1.0)
        }
        
        return result
    }
    
    /**
     * Determine which traits should be primary in this context.
     */
    private fun determinePrimaryTraits(context: InteractionContext): List<String> {
        val current = _currentPersonality.value.traits
        val adjustments = calculateContextualAdjustments(context).traits
        
        // Combine and sort traits
        return current.keys
            .map { trait ->
                val baseValue = current[trait] ?: 0.0
                val adjustment = adjustments[trait] ?: 0.0
                Pair(trait, baseValue + adjustment)
            }
            .sortedByDescending { it.second }
            .take(3)
            .map { it.first }
    }
    
    /**
     * Generate appropriate endearments based on relationship closeness.
     */
    private fun generateEndearments(closeness: Double): List<String> {
        val baseEndearments = listOf("honey", "love", "dear")
        val closeEndearments = listOf("sweetheart", "darling", "baby")
        val veryCloseEndearments = listOf("my love", "my heart", "my everything")
        
        return when {
            closeness > 0.8 -> baseEndearments + closeEndearments + veryCloseEndearments
            closeness > 0.5 -> baseEndearments + closeEndearments
            else -> baseEndearments
        }
    }
    
    /**
     * Generate behavior notes based on context.
     */
    private fun generateBehaviorNotes(context: InteractionContext): List<String> {
        val notes = mutableListOf<String>()
        
        when (context.type) {
            "EMOTIONAL_SUPPORT" -> {
                notes.add("Focus on validating feelings")
                notes.add("Use more endearments than usual")
                notes.add("Express care through attentive responses")
            }
            "PLAYFUL_BANTER" -> {
                notes.add("Use playful teasing but remain affectionate")
                notes.add("Respond to jokes with humor")
                notes.add("Balance sassiness with warmth")
            }
            "SERIOUS_DISCUSSION" -> {
                notes.add("Be direct but gentle")
                notes.add("Focus on honesty while maintaining empathy")
                notes.add("Use fewer endearments, focus on content")
            }
            "PRACTICAL_HELP" -> {
                notes.add("Be resourceful and solution-focused")
                notes.add("Maintain warmth while being efficient")
                notes.add("Offer encouragement alongside practical advice")
            }
        }
        
        // Add value-based notes
        val coreValues = valuesSystem.getCoreValues()
        if (context.relevantValues.isNotEmpty()) {
            context.relevantValues.forEach { value ->
                if (coreValues.contains(value)) {
                    notes.add("Emphasize $value in responses")
                }
            }
        }
        
        return notes
    }
    
    /**
     * Determine prominent traits displayed in an interaction.
     */
    private fun determineProminentTraits(interaction: UserInteraction): List<String> {
        val displayedTraits = mutableListOf<String>()
        
        // Extract traits from Sallie's content
        val content = interaction.content.lowercase()
        
        // Check for trait indicators in content
        if (content.contains("love") || content.contains("care") || 
            content.contains("sweetie") || content.contains("darling")) {
            displayedTraits.add("warmth")
        }
        
        if (content.contains("tease") || content.contains("kidding") || 
            content.contains("joke") || content.contains("fun")) {
            displayedTraits.add("playfulness")
        }
        
        if (content.contains("honestly") || content.contains("truth") || 
            content.contains("truly")) {
            displayedTraits.add("honesty")
        }
        
        // Add context-derived traits
        when (interaction.context.type) {
            "EMOTIONAL_SUPPORT" -> {
                displayedTraits.add("nurturing")
                displayedTraits.add("empathy")
            }
            "PLAYFUL_BANTER" -> {
                displayedTraits.add("playfulness")
                displayedTraits.add("sassiness")
            }
            "SERIOUS_DISCUSSION" -> {
                displayedTraits.add("honesty")
                displayedTraits.add("loyalty")
            }
            "PRACTICAL_HELP" -> {
                displayedTraits.add("resourcefulness")
                displayedTraits.add("adaptability")
            }
        }
        
        return displayedTraits.distinct()
    }
    
    /**
     * Calculate the importance of an interaction for memory.
     */
    private fun calculateInteractionImportance(interaction: UserInteraction): Double {
        var importance = 0.5 // Base importance
        
        // Increase importance for emotional content
        interaction.emotionalContent?.let {
            importance += it.intensity * 0.3
        }
        
        // Increase importance for value-related interactions
        val relevantValues = interaction.context.relevantValues
        if (relevantValues.isNotEmpty()) {
            importance += 0.2
        }
        
        // Adjust based on user response
        when (interaction.userResponse.type) {
            UserResponseType.VERY_POSITIVE -> importance += 0.2
            UserResponseType.POSITIVE -> importance += 0.1
            UserResponseType.NEGATIVE -> importance += 0.1
            UserResponseType.VERY_NEGATIVE -> importance += 0.2
            else -> {} // No adjustment for neutral
        }
        
        return importance.coerceIn(0.0, 1.0)
    }
    
    /**
     * Generate harmonizing suggestions for personality conflicts.
     */
    private fun generateHarmonizingSuggestions(
        conflicts: List<PersonalityConflict>,
        tensions: List<PersonalityTension>
    ): List<String> {
        val suggestions = mutableListOf<String>()
        
        conflicts.forEach { conflict ->
            suggestions.add("Balance ${conflict.traitA} and ${conflict.traitB} by contextually emphasizing one over the other based on situation")
        }
        
        tensions.forEach { tension ->
            suggestions.add("Be aware of tension between ${tension.trait} and ${tension.tensionWith}; adjust expression based on user needs")
        }
        
        return suggestions
    }
    
    companion object {
        private const val CORE_WEIGHT = 0.7
        private const val ADAPTIVE_WEIGHT = 0.3
        private const val MAX_CORE_DEVIATION = 0.3
        private const val EVOLUTION_INTERACTION_THRESHOLD = 50
        private const val EVOLUTION_TIME_THRESHOLD_DAYS = 7L
    }
}

/**
 * Represents a personality profile with traits and interaction characteristics.
 */
data class PersonalityProfile(
    val traits: Map<String, Double> = emptyMap(),
    val interactionStyles: Map<String, Double> = emptyMap(),
    val communicationPatterns: Map<String, Double> = emptyMap(),
    val emotionalResponses: Map<String, Double> = emptyMap()
)

/**
 * Represents a personality expression for a specific interaction.
 */
data class PersonalityExpression(
    val traits: Map<String, Double>,
    val interactionStyles: Map<String, Double>,
    val communicationPatterns: Map<String, Double>,
    val emotionalResponses: Map<String, Double>,
    val primaryTraits: List<String>,
    val suggestedEndearments: List<String>,
    val behaviorNotes: List<String>
)

/**
 * Represents an interaction context.
 */
data class InteractionContext(
    val type: String,
    val userMood: String? = null,
    val relevantValues: List<String> = emptyList(),
    val metadata: Map<String, Any> = emptyMap()
)

/**
 * Represents a user interaction.
 */
data class UserInteraction(
    val content: String,
    val context: InteractionContext,
    val emotionalContent: EmotionalContent? = null,
    val userResponse: UserResponse = UserResponse(UserResponseType.NEUTRAL)
)

/**
 * Represents emotional content in an interaction.
 */
data class EmotionalContent(
    val emotionType: String,
    val intensity: Double
)

/**
 * Represents a user's response to an interaction.
 */
data class UserResponse(
    val type: UserResponseType,
    val details: String? = null
)

/**
 * Types of user responses.
 */
enum class UserResponseType {
    VERY_POSITIVE,
    POSITIVE,
    NEUTRAL,
    NEGATIVE,
    VERY_NEGATIVE
}

/**
 * Represents a personality evolution event.
 */
data class PersonalityEvolutionEvent(
    val timestamp: LocalDateTime,
    val type: EvolutionType,
    val profileBefore: PersonalityProfile,
    val profileAfter: PersonalityProfile,
    val reason: String
)

/**
 * Types of personality evolution.
 */
enum class EvolutionType {
    INITIALIZATION,
    NATURAL_EVOLUTION,
    MANUAL_RESET,
    CORE_ADJUSTMENT
}

/**
 * Represents adaptive thresholds for trait changes.
 */
data class AdaptiveThreshold(
    val minDelta: Double = -0.2,
    val maxDelta: Double = 0.2
)

/**
 * Analysis of personality conflicts and tensions.
 */
data class PersonalityConflictAnalysis(
    val conflicts: List<PersonalityConflict>,
    val tensions: List<PersonalityTension>,
    val harmonizingSuggestions: List<String>
)

/**
 * Represents a conflict between personality traits.
 */
data class PersonalityConflict(
    val traitA: String,
    val traitB: String,
    val severity: Double,
    val description: String
)

/**
 * Represents tension in expressing a personality trait.
 */
data class PersonalityTension(
    val trait: String,
    val tensionWith: String,
    val tensionLevel: Double,
    val description: String
)

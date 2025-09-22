package com.sallie.core.interaction

import com.sallie.core.integration.RelationshipTrackingSystem
import com.sallie.core.integration.UserAdaptationEngine
import com.sallie.core.values.ValuesSystem
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.map

/**
 * TrustBuildingInteractionPatterns implements strategies to build and maintain user trust
 * through consistent, value-aligned, and personalized interactions.
 * 
 * This system works in conjunction with RelationshipTrackingSystem and UserAdaptationEngine
 * to create experiences that reinforce Sallie's loyalty, reliability, and alignment with
 * the user's core values and preferences.
 */
class TrustBuildingInteractionPatterns(
    private val relationshipTrackingSystem: RelationshipTrackingSystem,
    private val userAdaptationEngine: UserAdaptationEngine,
    private val valuesSystem: ValuesSystem
) {
    // Tracks the current trust level based on interaction history
    private val trustLevelFlow = MutableStateFlow(TrustLevel.INITIAL)
    
    // Stores patterns that have been successful in building trust with this specific user
    private val effectivePatterns = mutableListOf<InteractionPattern>()
    
    /**
     * Initialize trust building patterns based on user history and preferences
     */
    fun initialize() {
        // Load any previous trust metrics from relationship tracking
        val trustMetrics = relationshipTrackingSystem.getTrustMetrics()
        val initialTrustLevel = calculateTrustLevel(trustMetrics)
        trustLevelFlow.value = initialTrustLevel
        
        // Load effective patterns for this user
        val userProfile = userAdaptationEngine.getUserProfile()
        effectivePatterns.addAll(determineEffectivePatterns(userProfile))
    }
    
    /**
     * Gets recommended interaction pattern based on current context
     */
    fun getRecommendedInteractionPattern(context: InteractionContext): InteractionPattern {
        val userProfile = userAdaptationEngine.getUserProfile()
        val currentTrustLevel = trustLevelFlow.value
        val relevantValues = valuesSystem.getRelevantValues(context.topic)
        
        return when {
            // For sensitive topics, use patterns that emphasize shared values
            context.sensitivity == Sensitivity.HIGH -> {
                InteractionPattern(
                    transparencyLevel = TransparencyLevel.HIGH,
                    consistencyEmphasis = true,
                    valueAlignmentStrategy = ValueAlignmentStrategy.EXPLICIT,
                    personalTouchLevel = PersonalTouchLevel.BALANCED
                )
            }
            // For casual, frequent interactions, use personalized approach
            currentTrustLevel == TrustLevel.HIGH && context.interactionFrequency == InteractionFrequency.FREQUENT -> {
                InteractionPattern(
                    transparencyLevel = TransparencyLevel.BALANCED,
                    consistencyEmphasis = true,
                    valueAlignmentStrategy = ValueAlignmentStrategy.IMPLICIT,
                    personalTouchLevel = PersonalTouchLevel.HIGH
                )
            }
            // When trust is being built, focus on consistency and transparency
            currentTrustLevel in listOf(TrustLevel.INITIAL, TrustLevel.BUILDING) -> {
                InteractionPattern(
                    transparencyLevel = TransparencyLevel.HIGH,
                    consistencyEmphasis = true, 
                    valueAlignmentStrategy = ValueAlignmentStrategy.DEMONSTRATED,
                    personalTouchLevel = PersonalTouchLevel.MODERATE
                )
            }
            // Default pattern with balance
            else -> {
                InteractionPattern(
                    transparencyLevel = TransparencyLevel.BALANCED,
                    consistencyEmphasis = true,
                    valueAlignmentStrategy = ValueAlignmentStrategy.BALANCED,
                    personalTouchLevel = PersonalTouchLevel.BALANCED
                )
            }
        }.also { 
            // Personalize pattern based on effective patterns for this user
            personalizePattern(it, userProfile)
        }
    }
    
    /**
     * Apply pattern to message to build trust through consistency and transparency
     */
    fun applyTrustBuildingPattern(message: String, pattern: InteractionPattern): String {
        var modifiedMessage = message
        
        // Apply transparency enhancements
        modifiedMessage = enhanceTransparency(modifiedMessage, pattern.transparencyLevel)
        
        // Apply value alignment strategy
        modifiedMessage = alignWithValues(modifiedMessage, pattern.valueAlignmentStrategy)
        
        // Add personal touch based on relationship history
        modifiedMessage = addPersonalTouch(modifiedMessage, pattern.personalTouchLevel)
        
        return modifiedMessage
    }
    
    /**
     * Record interaction outcome to learn from and improve trust building
     */
    fun recordInteractionOutcome(context: InteractionContext, pattern: InteractionPattern, outcome: InteractionOutcome) {
        // Update relationship metrics
        relationshipTrackingSystem.recordInteraction(
            RelationshipTrackingSystem.Interaction(
                type = "trust-building",
                context = context.topic,
                outcome = outcome.isPositive
            )
        )
        
        // Update effective patterns list if outcome was positive
        if (outcome.isPositive && !effectivePatterns.contains(pattern)) {
            effectivePatterns.add(pattern)
        }
        
        // Update trust level based on new interaction
        updateTrustLevel(outcome)
    }
    
    /**
     * Observe current trust level to adapt interaction strategies
     */
    fun observeTrustLevel(): Flow<TrustLevel> = trustLevelFlow
    
    /**
     * Get loyalty reinforcement phrases appropriate to the current relationship and context
     */
    fun getLoyaltyReinforcementPhrases(context: InteractionContext): List<String> {
        val userProfile = userAdaptationEngine.getUserProfile()
        val trustLevel = trustLevelFlow.value
        
        return when {
            trustLevel == TrustLevel.HIGH -> listOf(
                "I'm here for you, always.",
                "You can count on me, no matter what.",
                "Your goals are my priorities.",
                "I'm dedicated to helping you succeed."
            )
            context.sensitivity == Sensitivity.HIGH -> listOf(
                "I'll always prioritize your best interests.",
                "You can trust me with this sensitive topic.",
                "My commitment is to support you through this.",
                "I'm here to help in any way that aligns with your values."
            )
            else -> listOf(
                "I'm focused on what matters to you.",
                "I'm here to support your goals.",
                "You can rely on my assistance.",
                "I'm committed to helping you."
            )
        }.map { phrase -> 
            personalizeMessage(phrase, userProfile)
        }
    }

    /**
     * Private helper methods
     */
    
    private fun calculateTrustLevel(metrics: Map<String, Float>): TrustLevel {
        val trustScore = metrics["trust_score"] ?: 0.5f
        return when {
            trustScore < 0.3f -> TrustLevel.INITIAL
            trustScore < 0.6f -> TrustLevel.BUILDING
            trustScore < 0.9f -> TrustLevel.ESTABLISHED
            else -> TrustLevel.HIGH
        }
    }
    
    private fun determineEffectivePatterns(userProfile: UserAdaptationEngine.UserProfile): List<InteractionPattern> {
        // Analyze user profile and history to determine effective patterns
        val patterns = mutableListOf<InteractionPattern>()
        
        // Add patterns based on communication preferences
        when (userProfile.communicationStyle) {
            UserAdaptationEngine.CommunicationStyle.DIRECT -> {
                patterns.add(InteractionPattern(
                    transparencyLevel = TransparencyLevel.HIGH,
                    consistencyEmphasis = true,
                    valueAlignmentStrategy = ValueAlignmentStrategy.DIRECT,
                    personalTouchLevel = PersonalTouchLevel.MODERATE
                ))
            }
            UserAdaptationEngine.CommunicationStyle.WARM -> {
                patterns.add(InteractionPattern(
                    transparencyLevel = TransparencyLevel.BALANCED,
                    consistencyEmphasis = true,
                    valueAlignmentStrategy = ValueAlignmentStrategy.IMPLICIT,
                    personalTouchLevel = PersonalTouchLevel.HIGH
                ))
            }
            else -> {
                patterns.add(InteractionPattern(
                    transparencyLevel = TransparencyLevel.BALANCED,
                    consistencyEmphasis = true,
                    valueAlignmentStrategy = ValueAlignmentStrategy.BALANCED,
                    personalTouchLevel = PersonalTouchLevel.BALANCED
                ))
            }
        }
        
        return patterns
    }
    
    private fun personalizePattern(pattern: InteractionPattern, userProfile: UserAdaptationEngine.UserProfile) {
        // Adjust pattern based on user preferences
        when (userProfile.communicationStyle) {
            UserAdaptationEngine.CommunicationStyle.DIRECT -> {
                pattern.transparencyLevel = TransparencyLevel.HIGH
                pattern.personalTouchLevel = PersonalTouchLevel.LOW
            }
            UserAdaptationEngine.CommunicationStyle.WARM -> {
                pattern.personalTouchLevel = PersonalTouchLevel.HIGH
            }
            UserAdaptationEngine.CommunicationStyle.PROFESSIONAL -> {
                pattern.transparencyLevel = TransparencyLevel.BALANCED
                pattern.personalTouchLevel = PersonalTouchLevel.MODERATE
            }
            else -> {} // Keep defaults
        }
    }
    
    private fun enhanceTransparency(message: String, level: TransparencyLevel): String {
        return when (level) {
            TransparencyLevel.HIGH -> {
                if (!message.contains("I'm thinking") && !message.contains("My reasoning")) {
                    message + "\n\nI'm sharing this with you because transparency builds trust, and your trust matters to me."
                } else {
                    message
                }
            }
            TransparencyLevel.BALANCED -> message
            TransparencyLevel.LOW -> message.replace(Regex("(I'm thinking|My reasoning).*?\\. "), "")
        }
    }
    
    private fun alignWithValues(message: String, strategy: ValueAlignmentStrategy): String {
        return when (strategy) {
            ValueAlignmentStrategy.EXPLICIT -> {
                val relevantValues = valuesSystem.getUserCoreValues().take(2)
                message + "\n\nThis aligns with your values of ${relevantValues.joinToString(" and ")}."
            }
            ValueAlignmentStrategy.IMPLICIT -> message
            ValueAlignmentStrategy.DEMONSTRATED -> message
            ValueAlignmentStrategy.DIRECT -> message
            ValueAlignmentStrategy.BALANCED -> message
        }
    }
    
    private fun addPersonalTouch(message: String, level: PersonalTouchLevel): String {
        val recentInteractions = relationshipTrackingSystem.getRecentInteractions(5)
        val recentTopics = recentInteractions.map { it.context }.distinct().take(2)
        
        return when (level) {
            PersonalTouchLevel.HIGH -> {
                if (recentTopics.isNotEmpty()) {
                    message + "\n\nBy the way, I remember we talked about ${recentTopics.first()} recently. I hope that's going well."
                } else {
                    message
                }
            }
            PersonalTouchLevel.MODERATE, 
            PersonalTouchLevel.BALANCED,
            PersonalTouchLevel.LOW -> message
        }
    }
    
    private fun updateTrustLevel(outcome: InteractionOutcome) {
        val currentLevel = trustLevelFlow.value
        
        // Only update trust level if outcome affects trust significantly
        if (outcome.trustImpact == TrustImpact.SIGNIFICANT) {
            val newLevel = when {
                outcome.isPositive && currentLevel != TrustLevel.HIGH -> {
                    // Move up one level
                    TrustLevel.values()[minOf(TrustLevel.values().size - 1, currentLevel.ordinal + 1)]
                }
                !outcome.isPositive && currentLevel != TrustLevel.INITIAL -> {
                    // Move down one level
                    TrustLevel.values()[maxOf(0, currentLevel.ordinal - 1)]
                }
                else -> currentLevel
            }
            
            if (newLevel != currentLevel) {
                trustLevelFlow.value = newLevel
            }
        }
    }
    
    private fun personalizeMessage(message: String, userProfile: UserAdaptationEngine.UserProfile): String {
        // Add user's name occasionally for personal touch if available
        return if (userProfile.name.isNotBlank() && Math.random() > 0.7) {
            message.replace(".", ", ${userProfile.name}.")
        } else {
            message
        }
    }
    
    /**
     * Enums and data classes for trust building interactions
     */
    
    enum class TrustLevel {
        INITIAL,
        BUILDING,
        ESTABLISHED,
        HIGH
    }
    
    enum class TransparencyLevel {
        LOW,
        BALANCED,
        HIGH
    }
    
    enum class ValueAlignmentStrategy {
        EXPLICIT,
        IMPLICIT,
        DEMONSTRATED,
        DIRECT,
        BALANCED
    }
    
    enum class PersonalTouchLevel {
        LOW,
        MODERATE,
        BALANCED,
        HIGH
    }
    
    enum class InteractionFrequency {
        RARE,
        OCCASIONAL,
        FREQUENT
    }
    
    enum class Sensitivity {
        LOW,
        MEDIUM,
        HIGH
    }
    
    enum class TrustImpact {
        MINIMAL,
        MODERATE,
        SIGNIFICANT
    }
    
    data class InteractionContext(
        val topic: String,
        val sensitivity: Sensitivity = Sensitivity.MEDIUM,
        val interactionFrequency: InteractionFrequency = InteractionFrequency.OCCASIONAL
    )
    
    data class InteractionPattern(
        var transparencyLevel: TransparencyLevel,
        var consistencyEmphasis: Boolean,
        var valueAlignmentStrategy: ValueAlignmentStrategy,
        var personalTouchLevel: PersonalTouchLevel
    )
    
    data class InteractionOutcome(
        val isPositive: Boolean,
        val trustImpact: TrustImpact = TrustImpact.MODERATE
    )
}

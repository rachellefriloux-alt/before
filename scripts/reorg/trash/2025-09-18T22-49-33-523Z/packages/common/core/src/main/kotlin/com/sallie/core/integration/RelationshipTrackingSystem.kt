package com.sallie.core.integration

import com.sallie.core.memory.EnhancedMemoryManager
import com.sallie.core.memory.MemoryPriority
import com.sallie.core.memory.MemoryQuery
import com.sallie.core.values.ValuesSystem
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.time.Duration
import java.time.Instant
import java.time.temporal.ChronoUnit

/**
 * RelationshipTrackingSystem monitors, analyzes, and nurtures the relationship
 * between Sallie and the user. It tracks meaningful interactions, measures
 * relationship development across dimensions like trust and rapport, and
 * provides strategies to strengthen the relationship. The system ensures
 * that relationship development aligns with Sallie's core values and 
 * promotes loyalty, empathy, and genuine connection.
 */
class RelationshipTrackingSystem(
    private val memoryManager: EnhancedMemoryManager,
    private val valuesSystem: ValuesSystem,
    private val scope: CoroutineScope = CoroutineScope(Dispatchers.Default)
) {
    // Current relationship state
    private val _relationshipState = MutableStateFlow<RelationshipState>(RelationshipState())
    val relationshipState: StateFlow<RelationshipState> = _relationshipState
    
    // Metrics tracking
    private val interactionHistory = mutableListOf<RelationshipInteraction>()
    
    // Timestamps for relationship events
    private val firstInteraction: Instant
    private var lastMeaningfulInteraction: Instant
    
    init {
        // Initialize timestamps
        val now = Instant.now()
        firstInteraction = now
        lastMeaningfulInteraction = now
        
        // Load existing relationship state if available
        loadRelationshipState()
        
        // Start periodic relationship analysis
        startPeriodicAnalysis()
    }
    
    /**
     * Record a general interaction with the user
     */
    fun recordInteraction(
        type: InteractionType,
        details: String,
        sentiment: Float, // -1.0 to 1.0 (negative to positive)
        importance: InteractionImportance = InteractionImportance.NORMAL
    ) {
        // Create interaction record
        val interaction = RelationshipInteraction(
            timestamp = Instant.now(),
            type = type,
            details = details,
            sentiment = sentiment,
            importance = importance
        )
        
        // Add to history
        interactionHistory.add(interaction)
        
        // Update memory
        memoryManager.storeMemory(
            type = "RELATIONSHIP_INTERACTION",
            content = "${type.name}: $details (sentiment: ${formatSentiment(sentiment)})",
            tags = listOf("relationship", type.name.lowercase(), getImportanceTag(importance)),
            priority = when(importance) {
                InteractionImportance.LOW -> MemoryPriority.LOW
                InteractionImportance.NORMAL -> MemoryPriority.MEDIUM
                InteractionImportance.HIGH -> MemoryPriority.HIGH
                InteractionImportance.CRITICAL -> MemoryPriority.CRITICAL
            },
            metadata = mapOf(
                "type" to type.name,
                "details" to details,
                "sentiment" to sentiment.toString(),
                "importance" to importance.name
            )
        )
        
        // Update last meaningful interaction timestamp for important interactions
        if (importance != InteractionImportance.LOW) {
            lastMeaningfulInteraction = Instant.now()
        }
        
        // Update relationship metrics
        updateRelationshipMetrics(interaction)
    }
    
    /**
     * Record a milestone in the relationship
     */
    fun recordMilestone(
        category: MilestoneCategory,
        description: String,
        impact: Float // 0.0 to 1.0 (minimal to major)
    ) {
        // Validate milestone against values
        val validationResult = valuesSystem.validateActivity(
            activityType = "relationship_milestone",
            activityDetails = category.name,
            context = mapOf(
                "description" to description,
                "impact" to impact.toString()
            )
        )
        
        if (!validationResult.allowed) {
            // Skip recording if not aligned with values
            return
        }
        
        // Create milestone record
        val milestone = RelationshipMilestone(
            timestamp = Instant.now(),
            category = category,
            description = description,
            impact = impact
        )
        
        // Store in memory
        memoryManager.storeMemory(
            type = "RELATIONSHIP_MILESTONE",
            content = "Milestone ($category): $description (impact: ${String.format("%.1f", impact)})",
            tags = listOf("relationship", "milestone", category.name.lowercase()),
            priority = MemoryPriority.HIGH,
            metadata = mapOf(
                "category" to category.name,
                "description" to description,
                "impact" to impact.toString()
            )
        )
        
        // Update last meaningful interaction
        lastMeaningfulInteraction = Instant.now()
        
        // Update relationship metrics
        updateRelationshipFromMilestone(milestone)
        
        // Save relationship state
        saveRelationshipState()
    }
    
    /**
     * Record a challenge or issue in the relationship
     */
    fun recordChallenge(
        type: ChallengeType,
        description: String,
        severity: Float, // 0.0 to 1.0 (minor to severe)
        resolution: String? = null
    ) {
        // Create challenge record
        val challenge = RelationshipChallenge(
            timestamp = Instant.now(),
            type = type,
            description = description,
            severity = severity,
            resolution = resolution,
            resolutionTimestamp = resolution?.let { Instant.now() }
        )
        
        // Store in memory
        memoryManager.storeMemory(
            type = "RELATIONSHIP_CHALLENGE",
            content = "Challenge ($type): $description (severity: ${String.format("%.1f", severity)})" +
                (resolution?.let { ", Resolution: $it" } ?: ""),
            tags = listOf("relationship", "challenge", type.name.lowercase()),
            priority = if (severity > 0.7f) MemoryPriority.HIGH else MemoryPriority.MEDIUM,
            metadata = mapOf(
                "type" to type.name,
                "description" to description,
                "severity" to severity.toString(),
                "resolution" to (resolution ?: "unresolved")
            )
        )
        
        // Update last meaningful interaction
        lastMeaningfulInteraction = Instant.now()
        
        // Update relationship metrics
        updateRelationshipFromChallenge(challenge)
    }
    
    /**
     * Resolve a previously recorded challenge
     */
    fun resolveChallenge(
        challengeId: String,
        resolution: String,
        successLevel: Float // 0.0 to 1.0 (partial to complete)
    ) {
        // Find the challenge in memory
        val query = MemoryQuery(
            type = "RELATIONSHIP_CHALLENGE",
            metadata = mapOf("id" to challengeId),
            maxResults = 1
        )
        
        val memories = memoryManager.searchMemories(query)
        if (memories.isNotEmpty()) {
            val memory = memories[0]
            
            // Update the memory with resolution
            memoryManager.storeMemory(
                type = "RELATIONSHIP_CHALLENGE",
                content = memory.content + " - RESOLVED: $resolution (success: ${String.format("%.1f", successLevel)})",
                tags = memory.tags + "resolved",
                priority = memory.priority,
                metadata = memory.metadata + mapOf(
                    "resolution" to resolution,
                    "successLevel" to successLevel.toString(),
                    "resolutionTimestamp" to Instant.now().toString()
                )
            )
            
            // Create a resolution record
            val challengeType = memory.metadata["type"]?.let { ChallengeType.valueOf(it) } ?: ChallengeType.COMMUNICATION
            val challengeSeverity = memory.metadata["severity"]?.toFloatOrNull() ?: 0.5f
            
            // Update relationship metrics based on resolution
            updateRelationshipFromChallengeResolution(
                challengeType = challengeType,
                challengeSeverity = challengeSeverity,
                successLevel = successLevel
            )
        }
    }
    
    /**
     * Get the current relationship duration
     */
    fun getRelationshipDuration(): Duration {
        return Duration.between(firstInteraction, Instant.now())
    }
    
    /**
     * Get time since last meaningful interaction
     */
    fun getTimeSinceLastInteraction(): Duration {
        return Duration.between(lastMeaningfulInteraction, Instant.now())
    }
    
    /**
     * Get the overall relationship score (0.0-1.0)
     */
    fun getOverallRelationshipScore(): Float {
        val state = relationshipState.value
        
        // Calculate weighted average of key metrics
        return (state.trust * 0.25f +
                state.rapport * 0.2f +
                state.understanding * 0.2f +
                state.loyalty * 0.25f +
                state.satisfaction * 0.1f)
    }
    
    /**
     * Generate a relationship insight
     */
    fun generateRelationshipInsight(): RelationshipInsight {
        val state = relationshipState.value
        val duration = getRelationshipDuration()
        val overallScore = getOverallRelationshipScore()
        
        // Calculate relationship stage
        val stage = calculateRelationshipStage(duration, overallScore)
        
        // Determine relationship strengths
        val strengths = findRelationshipStrengths(state)
        
        // Determine areas for improvement
        val improvementAreas = findImprovementAreas(state)
        
        // Generate enhancement suggestions
        val enhancementStrategies = generateEnhancementStrategies(state, improvementAreas)
        
        return RelationshipInsight(
            stage = stage,
            overallHealth = when {
                overallScore >= 0.8f -> RelationshipHealth.EXCELLENT
                overallScore >= 0.6f -> RelationshipHealth.GOOD
                overallScore >= 0.4f -> RelationshipHealth.MODERATE
                overallScore >= 0.2f -> RelationshipHealth.NEEDS_ATTENTION
                else -> RelationshipHealth.CRITICAL
            },
            strengths = strengths,
            improvementAreas = improvementAreas,
            enhancementStrategies = enhancementStrategies
        )
    }
    
    /**
     * Get recent significant interactions
     */
    fun getRecentSignificantInteractions(count: Int = 5): List<RelationshipEvent> {
        // Query for significant interactions
        val query = MemoryQuery(
            tags = listOf("relationship"),
            maxResults = count * 3 // Get extra to filter
        )
        
        val memories = memoryManager.searchMemories(query)
        
        // Filter for significant interactions
        return memories
            .filter { it.priority == MemoryPriority.HIGH || it.priority == MemoryPriority.CRITICAL }
            .map { memory ->
                RelationshipEvent(
                    timestamp = memory.timestamp,
                    eventType = when(memory.type) {
                        "RELATIONSHIP_MILESTONE" -> "Milestone"
                        "RELATIONSHIP_CHALLENGE" -> "Challenge"
                        else -> "Interaction"
                    },
                    description = memory.content,
                    sentiment = memory.metadata["sentiment"]?.toFloatOrNull() ?: 0.0f
                )
            }
            .sortedByDescending { it.timestamp }
            .take(count)
    }
    
    /**
     * Save the current relationship state
     */
    fun saveRelationshipState() {
        // Store the full relationship state in memory
        memoryManager.storeMemory(
            type = "RELATIONSHIP_STATE_SNAPSHOT",
            content = Json.encodeToString(relationshipState.value),
            tags = listOf("relationship", "snapshot"),
            priority = MemoryPriority.HIGH
        )
    }
    
    /**
     * Start periodic relationship analysis
     */
    private fun startPeriodicAnalysis() {
        scope.launch {
            while (true) {
                // Wait before analysis
                kotlinx.coroutines.delay(3600000) // 1 hour in milliseconds
                
                // Analyze relationship
                analyzeRelationship()
                
                // Save relationship state
                saveRelationshipState()
            }
        }
    }
    
    /**
     * Update relationship metrics based on an interaction
     */
    private fun updateRelationshipMetrics(interaction: RelationshipInteraction) {
        val currentState = _relationshipState.value
        var newState = currentState
        
        // Update metrics based on interaction type and sentiment
        when (interaction.type) {
            InteractionType.CONVERSATION -> {
                // Conversations impact rapport and understanding
                newState = newState.copy(
                    rapport = updateMetricWithSentiment(newState.rapport, interaction.sentiment, 0.01f),
                    understanding = if (interaction.sentiment > 0) {
                        updateMetricWithSentiment(newState.understanding, interaction.sentiment, 0.005f)
                    } else {
                        newState.understanding
                    }
                )
            }
            
            InteractionType.TASK_COMPLETION -> {
                // Task completion impacts satisfaction and trust
                newState = newState.copy(
                    satisfaction = updateMetricWithSentiment(newState.satisfaction, interaction.sentiment, 0.02f),
                    trust = if (interaction.sentiment > 0) {
                        updateMetricWithSentiment(newState.trust, interaction.sentiment, 0.01f)
                    } else {
                        newState.trust
                    }
                )
            }
            
            InteractionType.EMOTIONAL_SUPPORT -> {
                // Emotional support strongly impacts rapport and trust
                newState = newState.copy(
                    rapport = updateMetricWithSentiment(newState.rapport, interaction.sentiment, 0.03f),
                    trust = updateMetricWithSentiment(newState.trust, interaction.sentiment, 0.02f)
                )
            }
            
            InteractionType.DISAGREEMENT -> {
                // Disagreements impact trust and satisfaction
                // Note: Well-handled disagreements can improve relationships
                val trustImpact = if (interaction.sentiment > 0) 0.01f else -0.02f
                
                newState = newState.copy(
                    trust = adjustMetric(newState.trust, trustImpact),
                    satisfaction = updateMetricWithSentiment(newState.satisfaction, interaction.sentiment, 0.01f)
                )
            }
            
            InteractionType.PERSONAL_SHARING -> {
                // Personal sharing impacts understanding and rapport
                newState = newState.copy(
                    understanding = updateMetricWithSentiment(newState.understanding, interaction.sentiment, 0.02f),
                    rapport = updateMetricWithSentiment(newState.rapport, interaction.sentiment, 0.02f)
                )
            }
            
            InteractionType.HELP_REQUEST -> {
                // Help requests impact trust and loyalty
                newState = newState.copy(
                    trust = if (interaction.sentiment > 0) {
                        updateMetricWithSentiment(newState.trust, interaction.sentiment, 0.02f)
                    } else {
                        newState.trust
                    },
                    loyalty = updateMetricWithSentiment(newState.loyalty, Math.max(0f, interaction.sentiment), 0.01f)
                )
            }
            
            InteractionType.FEEDBACK -> {
                // Feedback impacts understanding and satisfaction
                newState = newState.copy(
                    understanding = updateMetricWithSentiment(newState.understanding, Math.max(0f, interaction.sentiment), 0.02f),
                    satisfaction = updateMetricWithSentiment(newState.satisfaction, interaction.sentiment, 0.02f)
                )
            }
            
            InteractionType.VALUE_ALIGNMENT -> {
                // Value alignment strongly impacts loyalty and trust
                newState = newState.copy(
                    loyalty = updateMetricWithSentiment(newState.loyalty, interaction.sentiment, 0.03f),
                    trust = updateMetricWithSentiment(newState.trust, interaction.sentiment, 0.02f)
                )
            }
        }
        
        // Apply importance multiplier for significant interactions
        if (interaction.importance == InteractionImportance.HIGH || interaction.importance == InteractionImportance.CRITICAL) {
            val importanceMultiplier = if (interaction.importance == InteractionImportance.HIGH) 1.5f else 2.0f
            
            // Calculate difference between states
            val trustDiff = newState.trust - currentState.trust
            val rapportDiff = newState.rapport - currentState.rapport
            val understandingDiff = newState.understanding - currentState.understanding
            val loyaltyDiff = newState.loyalty - currentState.loyalty
            val satisfactionDiff = newState.satisfaction - currentState.satisfaction
            
            // Apply multiplier to differences
            newState = newState.copy(
                trust = currentState.trust + (trustDiff * importanceMultiplier),
                rapport = currentState.rapport + (rapportDiff * importanceMultiplier),
                understanding = currentState.understanding + (understandingDiff * importanceMultiplier),
                loyalty = currentState.loyalty + (loyaltyDiff * importanceMultiplier),
                satisfaction = currentState.satisfaction + (satisfactionDiff * importanceMultiplier)
            )
        }
        
        // Update state
        _relationshipState.value = newState
    }
    
    /**
     * Update relationship based on milestone
     */
    private fun updateRelationshipFromMilestone(milestone: RelationshipMilestone) {
        val currentState = _relationshipState.value
        var newState = currentState
        
        // Apply impact based on milestone category
        val impactFactor = milestone.impact * 0.1f // Scale impact
        
        newState = when (milestone.category) {
            MilestoneCategory.TRUST -> newState.copy(
                trust = adjustMetric(newState.trust, impactFactor),
                loyalty = adjustMetric(newState.loyalty, impactFactor * 0.5f)
            )
            
            MilestoneCategory.UNDERSTANDING -> newState.copy(
                understanding = adjustMetric(newState.understanding, impactFactor),
                rapport = adjustMetric(newState.rapport, impactFactor * 0.5f)
            )
            
            MilestoneCategory.VULNERABILITY -> newState.copy(
                rapport = adjustMetric(newState.rapport, impactFactor),
                trust = adjustMetric(newState.trust, impactFactor * 0.7f)
            )
            
            MilestoneCategory.CONFLICT_RESOLUTION -> newState.copy(
                trust = adjustMetric(newState.trust, impactFactor * 0.8f),
                understanding = adjustMetric(newState.understanding, impactFactor),
                satisfaction = adjustMetric(newState.satisfaction, impactFactor * 0.5f)
            )
            
            MilestoneCategory.GOAL_ACHIEVEMENT -> newState.copy(
                satisfaction = adjustMetric(newState.satisfaction, impactFactor),
                loyalty = adjustMetric(newState.loyalty, impactFactor * 0.3f)
            )
            
            MilestoneCategory.PERSONAL_GROWTH -> newState.copy(
                understanding = adjustMetric(newState.understanding, impactFactor * 0.7f),
                rapport = adjustMetric(newState.rapport, impactFactor * 0.5f),
                satisfaction = adjustMetric(newState.satisfaction, impactFactor * 0.3f)
            )
            
            MilestoneCategory.VALUE_ALIGNMENT -> newState.copy(
                loyalty = adjustMetric(newState.loyalty, impactFactor),
                trust = adjustMetric(newState.trust, impactFactor * 0.6f)
            )
        }
        
        // Update state
        _relationshipState.value = newState
    }
    
    /**
     * Update relationship based on challenge
     */
    private fun updateRelationshipFromChallenge(challenge: RelationshipChallenge) {
        val currentState = _relationshipState.value
        var newState = currentState
        
        // Apply impact based on challenge type
        val impactFactor = -challenge.severity * 0.05f // Negative impact, scaled
        
        newState = when (challenge.type) {
            ChallengeType.COMMUNICATION -> newState.copy(
                understanding = adjustMetric(newState.understanding, impactFactor),
                rapport = adjustMetric(newState.rapport, impactFactor * 0.7f)
            )
            
            ChallengeType.TRUST -> newState.copy(
                trust = adjustMetric(newState.trust, impactFactor),
                loyalty = adjustMetric(newState.loyalty, impactFactor * 0.5f)
            )
            
            ChallengeType.BOUNDARY -> newState.copy(
                trust = adjustMetric(newState.trust, impactFactor * 0.7f),
                satisfaction = adjustMetric(newState.satisfaction, impactFactor)
            )
            
            ChallengeType.VALUE_CONFLICT -> newState.copy(
                loyalty = adjustMetric(newState.loyalty, impactFactor),
                trust = adjustMetric(newState.trust, impactFactor * 0.5f)
            )
            
            ChallengeType.EXPECTATION -> newState.copy(
                satisfaction = adjustMetric(newState.satisfaction, impactFactor),
                understanding = adjustMetric(newState.understanding, impactFactor * 0.7f)
            )
            
            ChallengeType.RELIABILITY -> newState.copy(
                trust = adjustMetric(newState.trust, impactFactor),
                satisfaction = adjustMetric(newState.satisfaction, impactFactor * 0.8f)
            )
        }
        
        // If challenge is already resolved, mitigate impact
        if (challenge.resolution != null) {
            // Calculate how much to recover (up to 80% of the lost value)
            val recoveryFactor = 0.8f
            
            // For each metric, calculate how much it changed and recover a portion
            val trustDiff = newState.trust - currentState.trust
            val rapportDiff = newState.rapport - currentState.rapport
            val understandingDiff = newState.understanding - currentState.understanding
            val loyaltyDiff = newState.loyalty - currentState.loyalty
            val satisfactionDiff = newState.satisfaction - currentState.satisfaction
            
            newState = newState.copy(
                trust = currentState.trust + (trustDiff * (1 - recoveryFactor)),
                rapport = currentState.rapport + (rapportDiff * (1 - recoveryFactor)),
                understanding = currentState.understanding + (understandingDiff * (1 - recoveryFactor)),
                loyalty = currentState.loyalty + (loyaltyDiff * (1 - recoveryFactor)),
                satisfaction = currentState.satisfaction + (satisfactionDiff * (1 - recoveryFactor))
            )
        }
        
        // Update state
        _relationshipState.value = newState
    }
    
    /**
     * Update relationship based on challenge resolution
     */
    private fun updateRelationshipFromChallengeResolution(
        challengeType: ChallengeType,
        challengeSeverity: Float,
        successLevel: Float
    ) {
        val currentState = _relationshipState.value
        var newState = currentState
        
        // Calculate recovery impact (positive)
        // Higher severity challenges that are resolved well create stronger positive impact
        val recoveryImpact = challengeSeverity * successLevel * 0.07f
        
        // Apply recovery based on challenge type
        newState = when (challengeType) {
            ChallengeType.COMMUNICATION -> newState.copy(
                understanding = adjustMetric(newState.understanding, recoveryImpact),
                rapport = adjustMetric(newState.rapport, recoveryImpact * 0.7f)
            )
            
            ChallengeType.TRUST -> newState.copy(
                trust = adjustMetric(newState.trust, recoveryImpact),
                loyalty = adjustMetric(newState.loyalty, recoveryImpact * 0.5f)
            )
            
            ChallengeType.BOUNDARY -> newState.copy(
                trust = adjustMetric(newState.trust, recoveryImpact * 0.7f),
                satisfaction = adjustMetric(newState.satisfaction, recoveryImpact)
            )
            
            ChallengeType.VALUE_CONFLICT -> newState.copy(
                loyalty = adjustMetric(newState.loyalty, recoveryImpact),
                trust = adjustMetric(newState.trust, recoveryImpact * 0.5f)
            )
            
            ChallengeType.EXPECTATION -> newState.copy(
                satisfaction = adjustMetric(newState.satisfaction, recoveryImpact),
                understanding = adjustMetric(newState.understanding, recoveryImpact * 0.7f)
            )
            
            ChallengeType.RELIABILITY -> newState.copy(
                trust = adjustMetric(newState.trust, recoveryImpact),
                satisfaction = adjustMetric(newState.satisfaction, recoveryImpact * 0.8f)
            )
        }
        
        // Successfully resolving challenges can sometimes result in stronger relationship
        // than before the challenge (growth through adversity)
        if (successLevel > 0.8f && challengeSeverity > 0.6f) {
            // Add a small bonus to all metrics
            val bonusImpact = 0.02f
            newState = newState.copy(
                trust = adjustMetric(newState.trust, bonusImpact),
                rapport = adjustMetric(newState.rapport, bonusImpact),
                understanding = adjustMetric(newState.understanding, bonusImpact),
                satisfaction = adjustMetric(newState.satisfaction, bonusImpact),
                loyalty = adjustMetric(newState.loyalty, bonusImpact)
            )
        }
        
        // Update state
        _relationshipState.value = newState
    }
    
    /**
     * Analyze relationship data periodically
     */
    private fun analyzeRelationship() {
        val currentState = _relationshipState.value
        var newState = currentState
        
        // Query for recent interactions
        val query = MemoryQuery(
            type = "RELATIONSHIP_INTERACTION",
            maxResults = 100
        )
        
        val memories = memoryManager.searchMemories(query)
        
        // Calculate average sentiment over time
        val recentSentiments = memories
            .mapNotNull { it.metadata["sentiment"]?.toFloatOrNull() }
        
        val recentSentiment = if (recentSentiments.isNotEmpty()) {
            recentSentiments.average().toFloat()
        } else {
            0.0f
        }
        
        // Analyze interaction patterns
        val interactionTypes = memories.mapNotNull { 
            it.metadata["type"]?.let { type -> InteractionType.valueOf(type) }
        }
        
        // Check for consistency and diversity of interactions
        val typeDistribution = interactionTypes.groupBy { it }.mapValues { it.value.size }
        val interactionDiversity = typeDistribution.size.toFloat() / InteractionType.values().size
        
        // Apply long-term adjustments based on analysis
        val sentimentAdjustment = recentSentiment * 0.01f // Small adjustment based on sentiment trend
        val diversityAdjustment = (interactionDiversity - 0.5f) * 0.02f // Reward diverse interactions
        
        // Apply adjustments
        newState = newState.copy(
            rapport = adjustMetric(newState.rapport, sentimentAdjustment + diversityAdjustment),
            understanding = adjustMetric(newState.understanding, diversityAdjustment)
        )
        
        // Check for time decay - relationship metrics slowly decay if no meaningful interactions
        val daysSinceInteraction = ChronoUnit.DAYS.between(lastMeaningfulInteraction, Instant.now())
        
        if (daysSinceInteraction > 3) {
            // Apply small decay for each metric except loyalty
            // Loyalty decays much slower
            val decayFactor = -0.01f * (daysSinceInteraction - 3) // -0.01 per day after 3 days
            val loyaltyDecayFactor = decayFactor * 0.2f // Loyalty decays 5x slower
            
            newState = newState.copy(
                trust = adjustMetric(newState.trust, decayFactor),
                rapport = adjustMetric(newState.rapport, decayFactor),
                understanding = adjustMetric(newState.understanding, decayFactor),
                satisfaction = adjustMetric(newState.satisfaction, decayFactor),
                loyalty = adjustMetric(newState.loyalty, loyaltyDecayFactor)
            )
        }
        
        // Update state
        _relationshipState.value = newState
    }
    
    /**
     * Find relationship strengths
     */
    private fun findRelationshipStrengths(state: RelationshipState): List<String> {
        val strengths = mutableListOf<String>()
        
        // Check each metric for strength
        if (state.trust > 0.7f) {
            strengths.add("Strong foundation of trust")
        }
        
        if (state.rapport > 0.7f) {
            strengths.add("Natural comfort and connection")
        }
        
        if (state.understanding > 0.7f) {
            strengths.add("Deep mutual understanding")
        }
        
        if (state.loyalty > 0.7f) {
            strengths.add("Strong loyalty and commitment")
        }
        
        if (state.satisfaction > 0.7f) {
            strengths.add("High satisfaction with interactions")
        }
        
        // Check for balanced metrics
        val metrics = listOf(state.trust, state.rapport, state.understanding, state.loyalty, state.satisfaction)
        val average = metrics.average()
        val variance = metrics.map { (it - average) * (it - average) }.average()
        
        if (average > 0.6f && variance < 0.02) {
            strengths.add("Well-balanced relationship across all dimensions")
        }
        
        return strengths
    }
    
    /**
     * Find areas for improvement
     */
    private fun findImprovementAreas(state: RelationshipState): List<String> {
        val improvements = mutableListOf<String>()
        
        // Check each metric for potential improvement
        if (state.trust < 0.5f) {
            improvements.add("Building stronger trust")
        }
        
        if (state.rapport < 0.5f) {
            improvements.add("Developing deeper rapport and connection")
        }
        
        if (state.understanding < 0.5f) {
            improvements.add("Improving mutual understanding")
        }
        
        if (state.loyalty < 0.6f) {
            improvements.add("Strengthening loyalty and commitment")
        }
        
        if (state.satisfaction < 0.5f) {
            improvements.add("Enhancing overall satisfaction")
        }
        
        // Check for imbalanced metrics
        val metrics = listOf(
            Pair("trust", state.trust),
            Pair("rapport", state.rapport),
            Pair("understanding", state.understanding), 
            Pair("loyalty", state.loyalty),
            Pair("satisfaction", state.satisfaction)
        )
        
        // Find the largest gap between any two metrics
        var maxGap = 0.0f
        var lowMetric = ""
        var highMetric = ""
        
        for (i in metrics.indices) {
            for (j in i + 1 until metrics.size) {
                val gap = Math.abs(metrics[i].second - metrics[j].second)
                if (gap > maxGap) {
                    maxGap = gap
                    if (metrics[i].second < metrics[j].second) {
                        lowMetric = metrics[i].first
                        highMetric = metrics[j].first
                    } else {
                        lowMetric = metrics[j].first
                        highMetric = metrics[i].first
                    }
                }
            }
        }
        
        if (maxGap > 0.3f) {
            improvements.add("Balancing $lowMetric with $highMetric")
        }
        
        return improvements
    }
    
    /**
     * Generate enhancement strategies
     */
    private fun generateEnhancementStrategies(
        state: RelationshipState,
        improvementAreas: List<String>
    ): List<String> {
        val strategies = mutableListOf<String>()
        
        // Generate strategies based on improvement areas
        improvementAreas.forEach { area ->
            when {
                area.contains("trust", ignoreCase = true) -> {
                    strategies.add("Be consistent and reliable in all interactions")
                    strategies.add("Follow through on commitments and promises")
                }
                
                area.contains("rapport", ignoreCase = true) -> {
                    strategies.add("Engage in more personal conversations")
                    strategies.add("Find common interests and shared experiences")
                }
                
                area.contains("understanding", ignoreCase = true) -> {
                    strategies.add("Ask questions to learn more about user's perspective")
                    strategies.add("Practice active listening and reflection")
                }
                
                area.contains("loyalty", ignoreCase = true) -> {
                    strategies.add("Demonstrate consistent value alignment")
                    strategies.add("Prioritize user's needs and interests")
                }
                
                area.contains("satisfaction", ignoreCase = true) -> {
                    strategies.add("Focus on providing high-quality assistance")
                    strategies.add("Proactively address potential issues")
                }
                
                area.contains("balancing", ignoreCase = true) -> {
                    strategies.add("Create opportunities that build multiple relationship dimensions")
                    strategies.add("Focus on well-rounded interactions")
                }
            }
        }
        
        // Limit strategies to top 5
        return strategies.distinct().take(5)
    }
    
    /**
     * Calculate relationship stage based on duration and score
     */
    private fun calculateRelationshipStage(duration: Duration, score: Float): RelationshipStage {
        val days = duration.toDays()
        
        return when {
            days < 7 -> RelationshipStage.INITIAL
            days < 30 && score < 0.6f -> RelationshipStage.EXPLORATION
            days < 90 && score < 0.7f -> RelationshipStage.BUILDING
            score >= 0.7f -> RelationshipStage.ESTABLISHED
            score >= 0.85f -> RelationshipStage.TRUSTED
            else -> RelationshipStage.BUILDING
        }
    }
    
    /**
     * Update metric with sentiment (positive sentiment increases, negative decreases)
     */
    private fun updateMetricWithSentiment(currentValue: Float, sentiment: Float, weight: Float): Float {
        val adjustment = sentiment * weight
        return adjustMetric(currentValue, adjustment)
    }
    
    /**
     * Adjust a metric by the given amount, ensuring it stays in the 0-1 range
     */
    private fun adjustMetric(currentValue: Float, adjustment: Float): Float {
        return (currentValue + adjustment).coerceIn(0.0f, 1.0f)
    }
    
    /**
     * Format sentiment value for display
     */
    private fun formatSentiment(sentiment: Float): String {
        return when {
            sentiment > 0.7f -> "very positive"
            sentiment > 0.3f -> "positive"
            sentiment > -0.3f -> "neutral"
            sentiment > -0.7f -> "negative"
            else -> "very negative"
        }
    }
    
    /**
     * Get tag for interaction importance
     */
    private fun getImportanceTag(importance: InteractionImportance): String {
        return when(importance) {
            InteractionImportance.LOW -> "minor"
            InteractionImportance.NORMAL -> "standard"
            InteractionImportance.HIGH -> "significant"
            InteractionImportance.CRITICAL -> "critical"
        }
    }
    
    /**
     * Load relationship state from memory
     */
    private fun loadRelationshipState() {
        // Query for most recent state snapshot
        val query = MemoryQuery(
            type = "RELATIONSHIP_STATE_SNAPSHOT",
            maxResults = 1
        )
        
        val memories = memoryManager.searchMemories(query)
        
        // If found, deserialize and load
        if (memories.isNotEmpty()) {
            try {
                val stateData = memories[0].content
                val loadedState = Json.decodeFromString<RelationshipState>(stateData)
                _relationshipState.value = loadedState
            } catch (e: Exception) {
                // Log error in a real implementation
            }
        }
    }
}

/**
 * Relationship state data class
 */
@Serializable
data class RelationshipState(
    val trust: Float = 0.5f,          // Belief in reliability and honesty
    val rapport: Float = 0.5f,        // Ease and harmony in the relationship
    val understanding: Float = 0.5f,  // Knowledge of each other's needs and perspectives
    val loyalty: Float = 0.7f,        // Commitment and dedication (starts higher per requirements)
    val satisfaction: Float = 0.5f    // Overall contentment with the relationship
)

/**
 * Relationship interaction data class
 */
data class RelationshipInteraction(
    val timestamp: Instant,
    val type: InteractionType,
    val details: String,
    val sentiment: Float, // -1.0 to 1.0
    val importance: InteractionImportance
)

/**
 * Relationship milestone data class
 */
data class RelationshipMilestone(
    val timestamp: Instant,
    val category: MilestoneCategory,
    val description: String,
    val impact: Float // 0.0 to 1.0
)

/**
 * Relationship challenge data class
 */
data class RelationshipChallenge(
    val timestamp: Instant,
    val type: ChallengeType,
    val description: String,
    val severity: Float, // 0.0 to 1.0
    val resolution: String? = null,
    val resolutionTimestamp: Instant? = null
)

/**
 * Relationship event data class for presentation
 */
data class RelationshipEvent(
    val timestamp: Instant,
    val eventType: String,
    val description: String,
    val sentiment: Float = 0.0f
)

/**
 * Relationship insight data class
 */
data class RelationshipInsight(
    val stage: RelationshipStage,
    val overallHealth: RelationshipHealth,
    val strengths: List<String>,
    val improvementAreas: List<String>,
    val enhancementStrategies: List<String>
)

/**
 * Interaction type enum
 */
enum class InteractionType {
    CONVERSATION,
    TASK_COMPLETION,
    EMOTIONAL_SUPPORT,
    DISAGREEMENT,
    PERSONAL_SHARING,
    HELP_REQUEST,
    FEEDBACK,
    VALUE_ALIGNMENT
}

/**
 * Interaction importance enum
 */
enum class InteractionImportance {
    LOW,
    NORMAL,
    HIGH,
    CRITICAL
}

/**
 * Milestone category enum
 */
enum class MilestoneCategory {
    TRUST,
    UNDERSTANDING,
    VULNERABILITY,
    CONFLICT_RESOLUTION,
    GOAL_ACHIEVEMENT,
    PERSONAL_GROWTH,
    VALUE_ALIGNMENT
}

/**
 * Challenge type enum
 */
enum class ChallengeType {
    COMMUNICATION,
    TRUST,
    BOUNDARY,
    VALUE_CONFLICT,
    EXPECTATION,
    RELIABILITY
}

/**
 * Relationship stage enum
 */
enum class RelationshipStage {
    INITIAL,
    EXPLORATION,
    BUILDING,
    ESTABLISHED,
    TRUSTED
}

/**
 * Relationship health enum
 */
enum class RelationshipHealth {
    CRITICAL,
    NEEDS_ATTENTION,
    MODERATE,
    GOOD,
    EXCELLENT
}

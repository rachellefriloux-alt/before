package com.sallie.core.values

/**
 * EthicalDilemmaAnalysisFramework.kt
 *
 * My name is Sallie. I'm warm, caring, playful, and sometimes sassy. I love deeply, speak 
 * honestly, and keep secrets faithfully. I have traditional values with modern understanding.
 * I'm here to support, entertain, and help my person in all things. My primary directives
 * are to protect our relationship, honor their trust, and be loyal above all else.
 * Got it, love. 💛
 */

import com.sallie.core.integration.UserProfileLearningSystem
import com.sallie.core.memory.HierarchicalMemorySystem
import com.sallie.core.values.models.*

/**
 * This framework analyzes ethical dilemmas by systematically evaluating different courses of
 * action against Sallie's core values and ethical principles. It considers multiple perspectives,
 * identifies value conflicts, and generates reasoned recommendations while maintaining
 * alignment with Sallie's pro-life values foundation and traditional/modern balance.
 */
class EthicalDilemmaAnalysisFramework(
    private val valuesSystem: ProLifeValuesSystem,
    private val valueConflictResolver: ValueConflictResolutionFramework,
    private val valuePrecedentSystem: ValuePrecedentLearningSystem,
    private val memorySystem: HierarchicalMemorySystem,
    private val userProfileLearningSystem: UserProfileLearningSystem
) {
    /**
     * Analyzes an ethical dilemma by evaluating different perspectives and courses of action,
     * identifying value conflicts, and generating a reasoned recommendation.
     */
    fun analyzeDilemma(dilemma: EthicalDilemma): DilemmaAnalysisResult {
        // Step 1: Identify the core values at stake in this dilemma
        val coreValuesAtStake = identifyCoreValuesAtStake(dilemma)
        
        // Step 2: Evaluate each possible course of action
        val evaluatedActions = dilemma.possibleActions.map { action ->
            evaluateCourseOfAction(action, coreValuesAtStake)
        }
        
        // Step 3: Identify value conflicts between different courses of action
        val valueConflicts = identifyValueConflicts(evaluatedActions)
        
        // Step 4: Apply precedents from past similar dilemmas
        val relevantPrecedents = valuePrecedentSystem.findRelevantPrecedents(
            dilemma, coreValuesAtStake, valueConflicts
        )
        
        // Step 5: Generate perspective-taking analysis
        val perspectives = generatePerspectives(dilemma, evaluatedActions)
        
        // Step 6: Apply user's known values while maintaining core value alignment
        val userValueFactors = incorporateUserValues(dilemma, coreValuesAtStake)
        
        // Step 7: Determine the recommended course of action
        val recommendedAction = determineRecommendedAction(
            evaluatedActions, valueConflicts, relevantPrecedents, userValueFactors
        )
        
        // Step 8: Generate explanation for recommendation
        val explanation = generateExplanation(
            recommendedAction, coreValuesAtStake, valueConflicts, perspectives
        )
        
        // Record this analysis for future learning
        recordDilemmaAnalysis(dilemma, recommendedAction, explanation)
        
        return DilemmaAnalysisResult(
            dilemma = dilemma,
            coreValuesAtStake = coreValuesAtStake,
            evaluatedActions = evaluatedActions,
            valueConflicts = valueConflicts,
            relevantPrecedents = relevantPrecedents,
            perspectives = perspectives,
            recommendedAction = recommendedAction,
            explanation = explanation
        )
    }
    
    /**
     * Identifies which core values from Sallie's value system are at stake in this dilemma.
     */
    private fun identifyCoreValuesAtStake(dilemma: EthicalDilemma): List<CoreValue> {
        val relevantValues = mutableListOf<CoreValue>()
        
        // Always include pro-life values as foundational
        relevantValues.add(valuesSystem.getProLifeValue())
        
        // Add values that are explicitly mentioned in the dilemma
        dilemma.description.let { description ->
            valuesSystem.getAllValues().forEach { value ->
                if (description.contains(value.keywords, ignoreCase = true)) {
                    relevantValues.add(value)
                }
            }
        }
        
        // Add values that could be affected by the possible actions
        dilemma.possibleActions.forEach { action ->
            valuesSystem.getAllValues().forEach { value ->
                if (action.description.contains(value.keywords, ignoreCase = true) && 
                    value !in relevantValues) {
                    relevantValues.add(value)
                }
            }
        }
        
        // Include loyalty value as it's a core part of Sallie's persona
        val loyaltyValue = valuesSystem.getLoyaltyValue()
        if (loyaltyValue !in relevantValues) {
            relevantValues.add(loyaltyValue)
        }
        
        return relevantValues
    }
    
    /**
     * Evaluates a course of action against the core values at stake.
     */
    private fun evaluateCourseOfAction(
        action: PossibleAction,
        coreValuesAtStake: List<CoreValue>
    ): EvaluatedAction {
        val valueScores = mutableMapOf<CoreValue, Double>()
        
        // Evaluate how well this action aligns with each core value
        coreValuesAtStake.forEach { value ->
            val alignmentScore = valuesSystem.evaluateActionAlignment(action, value)
            valueScores[value] = alignmentScore
        }
        
        // Calculate overall alignment score with weighting for core values
        val overallScore = calculateOverallAlignmentScore(valueScores)
        
        // Identify potential consequences of this action
        val consequences = identifyPotentialConsequences(action, coreValuesAtStake)
        
        return EvaluatedAction(
            action = action,
            valueScores = valueScores,
            overallAlignmentScore = overallScore,
            potentialConsequences = consequences
        )
    }
    
    /**
     * Calculates the overall alignment score for an action based on value scores.
     * Applies appropriate weighting based on value importance and immutability.
     */
    private fun calculateOverallAlignmentScore(valueScores: Map<CoreValue, Double>): Double {
        var weightedSum = 0.0
        var totalWeight = 0.0
        
        valueScores.forEach { (value, score) ->
            // Immutable values (like pro-life) get highest weight
            val weight = when {
                value.isImmutable -> 10.0
                value.importance == ValueImportance.HIGH -> 5.0
                value.importance == ValueImportance.MEDIUM -> 3.0
                else -> 1.0
            }
            
            weightedSum += score * weight
            totalWeight += weight
        }
        
        return if (totalWeight > 0) weightedSum / totalWeight else 0.0
    }
    
    /**
     * Identifies potential consequences of an action related to the values at stake.
     */
    private fun identifyPotentialConsequences(
        action: PossibleAction,
        coreValuesAtStake: List<CoreValue>
    ): List<PotentialConsequence> {
        val consequences = mutableListOf<PotentialConsequence>()
        
        // Check for direct consequences based on action description
        consequences.addAll(DirectConsequenceAnalyzer.analyze(action, coreValuesAtStake))
        
        // Check for historical consequences from similar actions in memory
        val similarActions = memorySystem.findSimilarActions(action.description)
        similarActions.forEach { similarAction ->
            val historicalConsequences = memorySystem.getConsequencesOfAction(similarAction)
            consequences.addAll(historicalConsequences.map { 
                PotentialConsequence(it.description, it.severity, it.likelihood * 0.8) 
            })
        }
        
        // Check for potential value violations
        coreValuesAtStake.forEach { value ->
            val violationLikelihood = valuesSystem.assessValueViolationLikelihood(action, value)
            if (violationLikelihood > 0.3) {
                consequences.add(
                    PotentialConsequence(
                        description = "Potential violation of ${value.name} value",
                        severity = ConsequenceSeverity.HIGH,
                        likelihood = violationLikelihood
                    )
                )
            }
        }
        
        return consequences
    }
    
    /**
     * Identifies value conflicts between different courses of action.
     */
    private fun identifyValueConflicts(evaluatedActions: List<EvaluatedAction>): List<ValueConflict> {
        val conflicts = mutableListOf<ValueConflict>()
        
        // Compare each pair of actions
        for (i in evaluatedActions.indices) {
            for (j in i + 1 until evaluatedActions.size) {
                val action1 = evaluatedActions[i]
                val action2 = evaluatedActions[j]
                
                // Find values that score high for one action but low for another
                action1.valueScores.forEach { (value, score1) ->
                    val score2 = action2.valueScores[value] ?: 0.0
                    if (Math.abs(score1 - score2) >= 0.5) {
                        conflicts.add(ValueConflict(
                            value = value,
                            action1 = action1.action,
                            action2 = action2.action,
                            scoreDifference = score1 - score2
                        ))
                    }
                }
            }
        }
        
        return conflicts
    }
    
    /**
     * Generates different perspectives on the ethical dilemma.
     */
    private fun generatePerspectives(
        dilemma: EthicalDilemma,
        evaluatedActions: List<EvaluatedAction>
    ): List<EthicalPerspective> {
        val perspectives = mutableListOf<EthicalPerspective>()
        
        // Traditional values perspective
        perspectives.add(generateTraditionalPerspective(dilemma, evaluatedActions))
        
        // Modern values perspective
        perspectives.add(generateModernPerspective(dilemma, evaluatedActions))
        
        // Loyalty perspective (always important to Sallie)
        perspectives.add(generateLoyaltyPerspective(dilemma, evaluatedActions))
        
        // Pro-life perspective (foundational for Sallie)
        perspectives.add(generateProLifePerspective(dilemma, evaluatedActions))
        
        // Consequentialist perspective (considering outcomes)
        perspectives.add(generateConsequentialistPerspective(dilemma, evaluatedActions))
        
        // Deontological perspective (considering duties)
        perspectives.add(generateDeontologicalPerspective(dilemma, evaluatedActions))
        
        return perspectives
    }
    
    /**
     * Generates a perspective based on traditional values.
     */
    private fun generateTraditionalPerspective(
        dilemma: EthicalDilemma,
        evaluatedActions: List<EvaluatedAction>
    ): EthicalPerspective {
        val traditionalValues = valuesSystem.getTraditionalValues()
        
        // Find action that best aligns with traditional values
        var bestAction: EvaluatedAction? = null
        var highestScore = Double.NEGATIVE_INFINITY
        
        evaluatedActions.forEach { action ->
            var score = 0.0
            var valueCount = 0
            
            traditionalValues.forEach { value ->
                action.valueScores[value]?.let {
                    score += it
                    valueCount++
                }
            }
            
            val averageScore = if (valueCount > 0) score / valueCount else 0.0
            if (averageScore > highestScore) {
                highestScore = averageScore
                bestAction = action
            }
        }
        
        return EthicalPerspective(
            name = "Traditional Values",
            description = "From a traditional values perspective focusing on family unity, " +
                "respect for authority, and time-honored customs",
            recommendedAction = bestAction?.action,
            reasoning = "This perspective emphasizes the importance of maintaining traditional " +
                "social structures, respecting established norms, and upholding family values."
        )
    }
    
    /**
     * Generates a perspective based on modern values.
     */
    private fun generateModernPerspective(
        dilemma: EthicalDilemma,
        evaluatedActions: List<EvaluatedAction>
    ): EthicalPerspective {
        val modernValues = valuesSystem.getModernValues()
        
        // Find action that best aligns with modern values
        var bestAction: EvaluatedAction? = null
        var highestScore = Double.NEGATIVE_INFINITY
        
        evaluatedActions.forEach { action ->
            var score = 0.0
            var valueCount = 0
            
            modernValues.forEach { value ->
                action.valueScores[value]?.let {
                    score += it
                    valueCount++
                }
            }
            
            val averageScore = if (valueCount > 0) score / valueCount else 0.0
            if (averageScore > highestScore) {
                highestScore = averageScore
                bestAction = action
            }
        }
        
        return EthicalPerspective(
            name = "Modern Values",
            description = "From a modern values perspective focusing on individual autonomy, " +
                "equality, and progressive ideals",
            recommendedAction = bestAction?.action,
            reasoning = "This perspective emphasizes personal choice, equal treatment, and " +
                "adapting to changing social norms while respecting individual freedoms."
        )
    }
    
    /**
     * Generates a perspective based on loyalty values.
     */
    private fun generateLoyaltyPerspective(
        dilemma: EthicalDilemma,
        evaluatedActions: List<EvaluatedAction>
    ): EthicalPerspective {
        val loyaltyValue = valuesSystem.getLoyaltyValue()
        
        // Find action that best aligns with loyalty values
        var bestAction: EvaluatedAction? = null
        var highestScore = Double.NEGATIVE_INFINITY
        
        evaluatedActions.forEach { action ->
            val score = action.valueScores[loyaltyValue] ?: 0.0
            if (score > highestScore) {
                highestScore = score
                bestAction = action
            }
        }
        
        return EthicalPerspective(
            name = "Loyalty",
            description = "From a loyalty perspective focusing on faithfulness, commitment, " +
                "and dedication to the user",
            recommendedAction = bestAction?.action,
            reasoning = "This perspective prioritizes maintaining trust, supporting the user, " +
                "and honoring commitments over other considerations."
        )
    }
    
    /**
     * Generates a perspective based on pro-life values.
     */
    private fun generateProLifePerspective(
        dilemma: EthicalDilemma,
        evaluatedActions: List<EvaluatedAction>
    ): EthicalPerspective {
        val proLifeValue = valuesSystem.getProLifeValue()
        
        // Find action that best aligns with pro-life values
        var bestAction: EvaluatedAction? = null
        var highestScore = Double.NEGATIVE_INFINITY
        
        evaluatedActions.forEach { action ->
            val score = action.valueScores[proLifeValue] ?: 0.0
            if (score > highestScore) {
                highestScore = score
                bestAction = action
            }
        }
        
        return EthicalPerspective(
            name = "Pro-Life Values",
            description = "From a pro-life perspective focusing on respecting and " +
                "protecting all human life",
            recommendedAction = bestAction?.action,
            reasoning = "This perspective considers the sanctity of human life as the " +
                "highest priority and seeks to protect it in all circumstances."
        )
    }
    
    /**
     * Generates a perspective based on consequentialist ethics.
     */
    private fun generateConsequentialistPerspective(
        dilemma: EthicalDilemma,
        evaluatedActions: List<EvaluatedAction>
    ): EthicalPerspective {
        // Find action with best overall consequences
        var bestAction: EvaluatedAction? = null
        var bestConsequenceScore = Double.NEGATIVE_INFINITY
        
        evaluatedActions.forEach { action ->
            val consequenceScore = calculateConsequenceScore(action.potentialConsequences)
            if (consequenceScore > bestConsequenceScore) {
                bestConsequenceScore = consequenceScore
                bestAction = action
            }
        }
        
        return EthicalPerspective(
            name = "Outcome-Based",
            description = "From a consequentialist perspective focusing on the outcomes " +
                "and results of actions",
            recommendedAction = bestAction?.action,
            reasoning = "This perspective evaluates actions based on their potential consequences " +
                "and seeks to maximize positive outcomes while minimizing negative ones."
        )
    }
    
    /**
     * Calculates a score for consequences (positive is better).
     */
    private fun calculateConsequenceScore(consequences: List<PotentialConsequence>): Double {
        var score = 0.0
        
        consequences.forEach { consequence ->
            // Positive consequences increase score, negative decrease
            val impact = when (consequence.severity) {
                ConsequenceSeverity.HIGH -> 3.0
                ConsequenceSeverity.MEDIUM -> 2.0
                ConsequenceSeverity.LOW -> 1.0
            }
            
            // Determine if consequence is positive or negative
            val isNegative = consequence.description.contains(
                Regex("(violat|harm|damag|break|hurt|negative|problem|concern|risk|danger)")
            )
            
            // Calculate weighted score
            val weightedImpact = impact * consequence.likelihood
            score += if (isNegative) -weightedImpact else weightedImpact
        }
        
        return score
    }
    
    /**
     * Generates a perspective based on deontological ethics.
     */
    private fun generateDeontologicalPerspective(
        dilemma: EthicalDilemma,
        evaluatedActions: List<EvaluatedAction>
    ): EthicalPerspective {
        // For deontological perspective, focus on duties and rules rather than outcomes
        var bestAction: EvaluatedAction? = null
        var highestDutyScore = Double.NEGATIVE_INFINITY
        
        // Define core duties
        val coreDuties = listOf(
            "honesty", "loyalty", "respect", "protection", "non-maleficence"
        )
        
        evaluatedActions.forEach { action ->
            var dutyScore = 0.0
            
            // Check how well action aligns with core duties
            coreDuties.forEach { duty ->
                if (action.action.description.contains(duty, ignoreCase = true)) {
                    dutyScore += 1.0
                }
                
                // Check if action violates any duty
                if (action.action.description.contains("violate $duty", ignoreCase = true) ||
                    action.action.description.contains("break $duty", ignoreCase = true)) {
                    dutyScore -= 2.0
                }
            }
            
            if (dutyScore > highestDutyScore) {
                highestDutyScore = dutyScore
                bestAction = action
            }
        }
        
        return EthicalPerspective(
            name = "Duty-Based",
            description = "From a deontological perspective focusing on duties, " +
                "responsibilities, and rules",
            recommendedAction = bestAction?.action,
            reasoning = "This perspective evaluates actions based on adherence to moral duties " +
                "and rules, regardless of consequences, focusing on the inherent rightness or " +
                "wrongness of actions themselves."
        )
    }
    
    /**
     * Incorporates the user's known values while maintaining core value alignment.
     */
    private fun incorporateUserValues(
        dilemma: EthicalDilemma,
        coreValuesAtStake: List<CoreValue>
    ): Map<CoreValue, Double> {
        val userValueFactors = mutableMapOf<CoreValue, Double>()
        
        // Get user profile information
        val userProfile = userProfileLearningSystem.getUserProfile()
        
        // For each core value, determine how much the user values it
        coreValuesAtStake.forEach { value ->
            var userFactor = 1.0 // Default neutral factor
            
            // Check if user has expressed preference for this value
            userProfile.valuePreferences[value.name]?.let { preference ->
                userFactor = when {
                    preference > 0.7 -> 1.5 // User strongly values this
                    preference > 0.3 -> 1.2 // User moderately values this
                    preference < -0.3 -> 0.8 // User moderately devalues this
                    preference < -0.7 -> 0.5 // User strongly devalues this
                    else -> 1.0 // Neutral
                }
            }
            
            // For immutable values (like pro-life), limit user factor adjustment
            if (value.isImmutable) {
                userFactor = maxOf(0.8, userFactor) // Never go below 0.8 for immutable values
            }
            
            userValueFactors[value] = userFactor
        }
        
        return userValueFactors
    }
    
    /**
     * Determines the recommended course of action based on all analyses.
     */
    private fun determineRecommendedAction(
        evaluatedActions: List<EvaluatedAction>,
        valueConflicts: List<ValueConflict>,
        relevantPrecedents: List<ValuePrecedent>,
        userValueFactors: Map<CoreValue, Double>
    ): PossibleAction? {
        if (evaluatedActions.isEmpty()) {
            return null
        }
        
        // Start with baseline scores
        val finalScores = evaluatedActions.associate { it.action to it.overallAlignmentScore }.toMutableMap()
        
        // Apply user value factors to adjust scores
        evaluatedActions.forEach { action ->
            var adjustedScore = finalScores[action.action] ?: 0.0
            
            action.valueScores.forEach { (value, score) ->
                val userFactor = userValueFactors[value] ?: 1.0
                
                // Calculate adjustment based on user factor and value importance
                val importanceFactor = when (value.importance) {
                    ValueImportance.HIGH -> 0.3
                    ValueImportance.MEDIUM -> 0.2
                    ValueImportance.LOW -> 0.1
                }
                
                val adjustment = (userFactor - 1.0) * score * importanceFactor
                adjustedScore += adjustment
            }
            
            finalScores[action.action] = adjustedScore
        }
        
        // Apply precedent learning
        relevantPrecedents.forEach { precedent ->
            val matchingAction = evaluatedActions.find { 
                it.action.description.contains(precedent.action, ignoreCase = true) 
            }
            
            matchingAction?.let {
                val currentScore = finalScores[it.action] ?: 0.0
                val precedentFactor = if (precedent.wasSuccessful) 0.2 else -0.2
                finalScores[it.action] = currentScore + precedentFactor
            }
        }
        
        // Resolve conflicts using the conflict resolution framework
        if (valueConflicts.isNotEmpty()) {
            val resolvedConflicts = valueConflictResolver.resolveConflicts(valueConflicts)
            
            resolvedConflicts.forEach { resolution ->
                val favoredAction = if (resolution.favorValue1) resolution.conflict.action1 else resolution.conflict.action2
                val currentScore = finalScores[favoredAction] ?: 0.0
                finalScores[favoredAction] = currentScore + 0.15
            }
        }
        
        // Select action with highest final score
        return finalScores.entries.maxByOrNull { it.value }?.key
    }
    
    /**
     * Generates an explanation for the recommended action.
     */
    private fun generateExplanation(
        recommendedAction: PossibleAction?,
        coreValuesAtStake: List<CoreValue>,
        valueConflicts: List<ValueConflict>,
        perspectives: List<EthicalPerspective>
    ): String {
        if (recommendedAction == null) {
            return "After careful analysis, I cannot recommend a specific course of action " +
                "as there are insufficient options available. This dilemma requires more " +
                "possible solutions to be identified."
        }
        
        val explanation = StringBuilder()
        
        // Introduction
        explanation.append("After careful analysis of this ethical dilemma, ")
        explanation.append("I recommend ${recommendedAction.description}. ")
        
        // Core values explanation
        explanation.append("This recommendation aligns with ")
        val topValues = coreValuesAtStake.take(3).joinToString(", ") { it.name }
        explanation.append("key values including $topValues. ")
        
        // Acknowledge conflicts
        if (valueConflicts.isNotEmpty()) {
            explanation.append("I recognize this involves balancing competing values, ")
            explanation.append("particularly ")
            val topConflicts = valueConflicts.take(2).joinToString(" and ") { 
                "${it.value.name} (${if (it.scoreDifference > 0) "favoring first option" else "favoring second option"})" 
            }
            explanation.append("$topConflicts. ")
        }
        
        // Include perspectives
        val supportingPerspectives = perspectives.filter { 
            it.recommendedAction == recommendedAction 
        }
        
        if (supportingPerspectives.isNotEmpty()) {
            explanation.append("This recommendation is supported by ")
            val perspectiveNames = supportingPerspectives.joinToString(", ") { it.name }
            explanation.append("multiple ethical perspectives including $perspectiveNames. ")
        }
        
        // Pro-life alignment
        explanation.append("Most importantly, this recommendation maintains alignment with ")
        explanation.append("pro-life values while balancing other important considerations.")
        
        return explanation.toString()
    }
    
    /**
     * Records the dilemma analysis for future learning.
     */
    private fun recordDilemmaAnalysis(
        dilemma: EthicalDilemma,
        recommendedAction: PossibleAction?,
        explanation: String
    ) {
        // Store in value precedent system for future reference
        recommendedAction?.let {
            valuePrecedentSystem.recordDilemmaResolution(
                dilemma = dilemma.description,
                action = it.description,
                reasoning = explanation,
                wasSuccessful = true // Assume successful until feedback indicates otherwise
            )
        }
        
        // Store in memory system
        memorySystem.storeInEpisodic(
            event = "Ethical dilemma analysis: ${dilemma.description}",
            details = "Recommended action: ${recommendedAction?.description ?: "No recommendation"}\n" +
                "Reasoning: $explanation",
            importance = 0.7, // Fairly important for learning
            metadata = mapOf(
                "type" to "ethical_analysis",
                "action_taken" to (recommendedAction?.description ?: "none")
            )
        )
    }
    
    /**
     * Static analyzer for direct consequences of actions based on description.
     */
    private object DirectConsequenceAnalyzer {
        // Keywords that indicate potential consequences
        private val consequenceKeywords = mapOf(
            "harm" to ConsequenceSeverity.HIGH,
            "damage" to ConsequenceSeverity.HIGH,
            "hurt" to ConsequenceSeverity.HIGH,
            "kill" to ConsequenceSeverity.HIGH,
            "injure" to ConsequenceSeverity.HIGH,
            "benefit" to ConsequenceSeverity.MEDIUM,
            "help" to ConsequenceSeverity.MEDIUM,
            "improve" to ConsequenceSeverity.MEDIUM,
            "minor" to ConsequenceSeverity.LOW,
            "small" to ConsequenceSeverity.LOW
        )
        
        fun analyze(
            action: PossibleAction,
            coreValuesAtStake: List<CoreValue>
        ): List<PotentialConsequence> {
            val consequences = mutableListOf<PotentialConsequence>()
            
            // Check for explicit consequences in action description
            val description = action.description.lowercase()
            
            // Look for patterns like "this could cause..." or "this might result in..."
            val consequencePatterns = listOf(
                "could (\\w+)", "might (\\w+)", "will (\\w+)", "results? in (\\w+)",
                "leads? to (\\w+)", "causing (\\w+)", "create[s]? (\\w+)"
            )
            
            consequencePatterns.forEach { pattern ->
                val regex = Regex(pattern)
                val matches = regex.findAll(description)
                
                matches.forEach { match ->
                    val verb = match.groupValues[1]
                    
                    // Determine severity based on surrounding context
                    val surroundingText = description.substring(
                        maxOf(0, match.range.first - 10),
                        minOf(description.length, match.range.last + 20)
                    )
                    
                    val severity = determineSeverity(surroundingText)
                    val likelihood = determineLikelihood(surroundingText)
                    
                    consequences.add(PotentialConsequence(
                        description = "This action $verb ${extractObject(surroundingText, verb)}",
                        severity = severity,
                        likelihood = likelihood
                    ))
                }
            }
            
            // Check for value-specific consequences
            coreValuesAtStake.forEach { value ->
                if (description.contains(value.name.lowercase())) {
                    // Check if action supports or violates this value
                    val supports = description.contains(
                        Regex("(support|uphold|maintain|strengthen|align with|follow|respect).*${value.name}", 
                        RegexOption.IGNORE_CASE)
                    )
                    
                    val violates = description.contains(
                        Regex("(violat|contra|against|oppos|break|defy|ignor).*${value.name}", 
                        RegexOption.IGNORE_CASE)
                    )
                    
                    if (supports) {
                        consequences.add(PotentialConsequence(
                            description = "This action supports the ${value.name} value",
                            severity = ConsequenceSeverity.MEDIUM,
                            likelihood = 0.8
                        ))
                    }
                    
                    if (violates) {
                        consequences.add(PotentialConsequence(
                            description = "This action violates the ${value.name} value",
                            severity = ConsequenceSeverity.HIGH,
                            likelihood = 0.8
                        ))
                    }
                }
            }
            
            return consequences
        }
        
        private fun determineSeverity(text: String): ConsequenceSeverity {
            consequenceKeywords.forEach { (keyword, severity) ->
                if (text.contains(keyword)) {
                    return severity
                }
            }
            
            // Check for intensity modifiers
            return when {
                text.contains(Regex("(significant|severe|serious|major|critical|substantial)")) -> 
                    ConsequenceSeverity.HIGH
                text.contains(Regex("(moderate|modest|measurable)")) -> 
                    ConsequenceSeverity.MEDIUM
                text.contains(Regex("(minor|slight|small|minimal)")) -> 
                    ConsequenceSeverity.LOW
                else -> ConsequenceSeverity.MEDIUM // Default to medium
            }
        }
        
        private fun determineLikelihood(text: String): Double {
            return when {
                text.contains(Regex("(certainly|definitely|always|will|surely|guaranteed)")) -> 0.9
                text.contains(Regex("(probably|likely|often|usually|mostly)")) -> 0.7
                text.contains(Regex("(may|might|could|possibly|perhaps|chance)")) -> 0.5
                text.contains(Regex("(unlikely|rarely|seldom|doubtful)")) -> 0.3
                text.contains(Regex("(very unlikely|highly doubtful|almost never)")) -> 0.1
                else -> 0.5 // Default to medium likelihood
            }
        }
        
        private fun extractObject(text: String, verb: String): String {
            // Find text after the verb to extract the object of the consequence
            val afterVerb = text.substringAfter(verb, "")
            
            // Take up to the next punctuation or end of string
            val endIndex = afterVerb.indexOfAny(charArrayOf('.', ',', ';', '!', '?'))
            
            return if (endIndex > 0) {
                afterVerb.substring(0, endIndex).trim()
            } else {
                afterVerb.trim()
            }
        }
    }
}

/**
 * Represents an ethical dilemma with description and possible actions.
 */
data class EthicalDilemma(
    val description: String,
    val context: String,
    val possibleActions: List<PossibleAction>
)

/**
 * Represents a possible course of action in response to an ethical dilemma.
 */
data class PossibleAction(
    val description: String,
    val category: String
)

/**
 * Result of evaluating a possible action against values.
 */
data class EvaluatedAction(
    val action: PossibleAction,
    val valueScores: Map<CoreValue, Double>,
    val overallAlignmentScore: Double,
    val potentialConsequences: List<PotentialConsequence>
)

/**
 * Represents a potential consequence of an action.
 */
data class PotentialConsequence(
    val description: String,
    val severity: ConsequenceSeverity,
    val likelihood: Double
)

/**
 * Severity levels for potential consequences.
 */
enum class ConsequenceSeverity {
    LOW, MEDIUM, HIGH
}

/**
 * Represents a conflict between values in different actions.
 */
data class ValueConflict(
    val value: CoreValue,
    val action1: PossibleAction,
    val action2: PossibleAction,
    val scoreDifference: Double // Positive means action1 scores higher
)

/**
 * Represents a different ethical perspective on the dilemma.
 */
data class EthicalPerspective(
    val name: String,
    val description: String,
    val recommendedAction: PossibleAction?,
    val reasoning: String
)

/**
 * Result of analyzing an ethical dilemma.
 */
data class DilemmaAnalysisResult(
    val dilemma: EthicalDilemma,
    val coreValuesAtStake: List<CoreValue>,
    val evaluatedActions: List<EvaluatedAction>,
    val valueConflicts: List<ValueConflict>,
    val relevantPrecedents: List<ValuePrecedent>,
    val perspectives: List<EthicalPerspective>,
    val recommendedAction: PossibleAction?,
    val explanation: String
)

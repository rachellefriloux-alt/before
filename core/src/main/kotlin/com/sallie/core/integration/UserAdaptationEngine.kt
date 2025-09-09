package com.sallie.core.integration

import com.sallie.core.memory.EnhancedMemoryManager
import com.sallie.core.personaEngine.PersonaCharacteristics
import com.sallie.core.values.ValuesSystem
import kotlinx.coroutines.flow.StateFlow
import kotlinx.serialization.Serializable

/**
 * UserAdaptationEngine adapts Sallie's behavior, communication style, and responses
 * based on learned user profile data. This creates a personalized experience that
 * evolves over time as Sallie learns more about the user's preferences, patterns,
 * and relationship dynamics.
 */
class UserAdaptationEngine(
    private val profileLearningSystem: UserProfileLearningSystem,
    private val valuesSystem: ValuesSystem,
    private val memoryManager: EnhancedMemoryManager
) {
    // Access to user profile data
    val userProfile: StateFlow<UserProfile> = profileLearningSystem.userProfile
    
    // Adaptation settings
    private var adaptationSettings = AdaptationSettings()
    
    /**
     * Get current adaptation level
     */
    fun getAdaptationLevel(): AdaptationLevel {
        return adaptationSettings.adaptationLevel
    }
    
    /**
     * Set adaptation level
     */
    fun setAdaptationLevel(level: AdaptationLevel) {
        adaptationSettings = adaptationSettings.copy(adaptationLevel = level)
    }
    
    /**
     * Get currently enabled adaptation aspects
     */
    fun getEnabledAdaptationAspects(): Set<AdaptationAspect> {
        return adaptationSettings.enabledAspects
    }
    
    /**
     * Enable specific adaptation aspects
     */
    fun enableAdaptationAspects(aspects: Set<AdaptationAspect>) {
        adaptationSettings = adaptationSettings.copy(
            enabledAspects = adaptationSettings.enabledAspects + aspects
        )
    }
    
    /**
     * Disable specific adaptation aspects
     */
    fun disableAdaptationAspects(aspects: Set<AdaptationAspect>) {
        adaptationSettings = adaptationSettings.copy(
            enabledAspects = adaptationSettings.enabledAspects - aspects
        )
    }
    
    /**
     * Adapt communication style based on user profile
     * @param baseStyle The default communication style
     * @return Adapted communication style
     */
    fun adaptCommunicationStyle(baseStyle: CommunicationStyle): CommunicationStyle {
        if (!isAspectEnabled(AdaptationAspect.COMMUNICATION)) {
            return baseStyle
        }
        
        val profile = userProfile.value
        val adaptationStrength = getAdaptationStrengthFactor()
        
        // Start with the base style
        var adapted = baseStyle
        
        // Get relevant communication preferences from profile
        val formality = determineFormality(profile)
        val detailLevel = determineDetailLevel(profile)
        val tone = determineTone(profile)
        val pacing = determinePacing(profile)
        
        // Apply adaptations based on profile and adaptation strength
        adapted = adapted.copy(
            formality = blendAttributes(baseStyle.formality, formality, adaptationStrength),
            detailLevel = blendAttributes(baseStyle.detailLevel, detailLevel, adaptationStrength),
            tone = blendAttributes(baseStyle.tone, tone, adaptationStrength),
            pacing = blendAttributes(baseStyle.pacing, pacing, adaptationStrength)
        )
        
        return adapted
    }
    
    /**
     * Adapt persona characteristics based on user profile
     * @param baseCharacteristics The base persona characteristics
     * @return Adapted persona characteristics
     */
    fun adaptPersonaCharacteristics(baseCharacteristics: PersonaCharacteristics): PersonaCharacteristics {
        if (!isAspectEnabled(AdaptationAspect.PERSONA)) {
            return baseCharacteristics
        }
        
        val profile = userProfile.value
        val adaptationStrength = getAdaptationStrengthFactor()
        
        // Adaptation logic based on profile data
        // This is a simplified example - a real implementation would have more sophisticated adaptation
        
        // Determine optimal warmth based on user preference and relationship dynamics
        val optimalWarmth = determineOptimalWarmth(profile)
        
        // Determine optimal humor based on user responses to humor
        val optimalHumor = determineOptimalHumor(profile)
        
        // Determine optimal formality based on communication preferences
        val optimalFormality = determineOptimalFormality(profile)
        
        // Determine optimal detail orientation based on user information processing
        val optimalDetailOrientation = determineOptimalDetailOrientation(profile)
        
        // Blend base characteristics with adapted ones based on adaptation strength
        return baseCharacteristics.copy(
            warmth = blendAttributes(baseCharacteristics.warmth, optimalWarmth, adaptationStrength),
            humor = blendAttributes(baseCharacteristics.humor, optimalHumor, adaptationStrength),
            formality = blendAttributes(baseCharacteristics.formality, optimalFormality, adaptationStrength),
            detailOrientation = blendAttributes(baseCharacteristics.detailOrientation, optimalDetailOrientation, adaptationStrength)
        )
    }
    
    /**
     * Adapt conversation pacing based on user profile
     * @param baseResponseSpeed The base response speed (in milliseconds)
     * @param baseThinkingIndicatorFrequency Base frequency of thinking indicators
     * @return Adapted conversation pacing
     */
    fun adaptConversationPacing(
        baseResponseSpeed: Long,
        baseThinkingIndicatorFrequency: Float
    ): ConversationPacing {
        if (!isAspectEnabled(AdaptationAspect.PACING)) {
            return ConversationPacing(baseResponseSpeed, baseThinkingIndicatorFrequency)
        }
        
        val profile = userProfile.value
        val adaptationStrength = getAdaptationStrengthFactor()
        
        // Determine optimal response speed based on user communication patterns
        val optimalResponseSpeed = determineOptimalResponseSpeed(profile)
        
        // Determine optimal thinking indicator frequency based on user preferences
        val optimalIndicatorFrequency = determineOptimalIndicatorFrequency(profile)
        
        // Blend base values with optimal ones based on adaptation strength
        val adaptedSpeed = blendValues(
            baseResponseSpeed.toFloat(),
            optimalResponseSpeed.toFloat(),
            adaptationStrength
        ).toLong()
        
        val adaptedFrequency = blendValues(
            baseThinkingIndicatorFrequency,
            optimalIndicatorFrequency,
            adaptationStrength
        )
        
        return ConversationPacing(adaptedSpeed, adaptedFrequency)
    }
    
    /**
     * Get topic recommendations based on user interests
     * @param context The current conversation context
     * @return List of recommended topics with confidence scores
     */
    fun getTopicRecommendations(context: String? = null): List<TopicRecommendation> {
        if (!isAspectEnabled(AdaptationAspect.TOPICS)) {
            return emptyList()
        }
        
        val profile = userProfile.value
        val recommendations = mutableListOf<TopicRecommendation>()
        
        // Extract interests from preferences
        val interestCategories = listOf("topics", "interests", "activities", "hobbies")
        
        interestCategories.forEach { category ->
            profile.preferences[category]?.forEach { (interest, strength) ->
                // Only recommend topics with sufficient strength
                if (strength > 0.6f) {
                    val confidence = strength * profileLearningSystem.getConfidence("$category:$interest")
                    if (confidence > 0.4f) {
                        recommendations.add(TopicRecommendation(
                            topic = interest,
                            confidence = confidence,
                            category = category
                        ))
                    }
                }
            }
        }
        
        // Check emotional triggers for context-sensitive recommendations
        if (context != null) {
            profile.emotionalResponses.forEach { (trigger, emotions) ->
                if (context.contains(trigger, ignoreCase = true)) {
                    // Find positive emotional triggers
                    val positiveEmotions = emotions.filter { (emotion, intensity) -> 
                        POSITIVE_EMOTIONS.contains(emotion.lowercase()) && intensity > 0.6f
                    }
                    
                    // Add these as potential topics
                    positiveEmotions.forEach { (emotion, intensity) ->
                        val confidence = intensity * 0.8f
                        recommendations.add(TopicRecommendation(
                            topic = trigger,
                            confidence = confidence,
                            category = "emotionalTrigger",
                            metadata = mapOf("emotion" to emotion)
                        ))
                    }
                }
            }
        }
        
        return recommendations.sortedByDescending { it.confidence }
    }
    
    /**
     * Get topic avoidance recommendations
     * @param context The current conversation context
     * @return List of topics to avoid with confidence scores
     */
    fun getTopicsToAvoid(context: String? = null): List<TopicAvoidance> {
        if (!isAspectEnabled(AdaptationAspect.TOPICS)) {
            return emptyList()
        }
        
        val profile = userProfile.value
        val avoidances = mutableListOf<TopicAvoidance>()
        
        // Check emotional triggers for negative responses
        profile.emotionalResponses.forEach { (trigger, emotions) ->
            // Find negative emotional triggers
            val negativeEmotions = emotions.filter { (emotion, intensity) -> 
                NEGATIVE_EMOTIONS.contains(emotion.lowercase()) && intensity > 0.6f
            }
            
            // Add these as topics to avoid
            if (negativeEmotions.isNotEmpty()) {
                val worstEmotion = negativeEmotions.maxByOrNull { it.value }
                if (worstEmotion != null) {
                    val confidence = worstEmotion.value * 0.8f
                    avoidances.add(TopicAvoidance(
                        topic = trigger,
                        confidence = confidence,
                        reason = "Triggers ${worstEmotion.key} emotion",
                        severity = if (worstEmotion.value > 0.8f) AvoidanceSeverity.HIGH else AvoidanceSeverity.MEDIUM
                    ))
                }
            }
        }
        
        // Add topics explicitly marked as sensitive or disliked in preferences
        val sensitiveCategories = listOf("sensitive_topics", "dislikes", "triggers")
        
        sensitiveCategories.forEach { category ->
            profile.preferences[category]?.forEach { (topic, strength) ->
                if (strength > 0.5f) {
                    val confidence = strength * profileLearningSystem.getConfidence("$category:$topic")
                    if (confidence > 0.4f) {
                        avoidances.add(TopicAvoidance(
                            topic = topic,
                            confidence = confidence,
                            reason = "Marked as ${category.replace("_", " ")}",
                            severity = if (strength > 0.8f) AvoidanceSeverity.HIGH else AvoidanceSeverity.MEDIUM
                        ))
                    }
                }
            }
        }
        
        return avoidances.sortedByDescending { it.confidence }
    }
    
    /**
     * Generate adaptation recommendations for improving user experience
     */
    fun generateAdaptationRecommendations(): List<AdaptationRecommendation> {
        val profile = userProfile.value
        val recommendations = mutableListOf<AdaptationRecommendation>()
        
        // Get profile summary for high-level insights
        val profileSummary = profileLearningSystem.generateProfileSummary()
        
        // Convert profile summary suggestions to adaptation recommendations
        profileSummary.suggestedAdaptations.forEach { suggestion ->
            recommendations.add(AdaptationRecommendation(
                aspect = determineAspectFromSuggestion(suggestion),
                recommendation = suggestion,
                confidence = profileSummary.overallProfileCompleteness * 0.8f,
                implementationDifficulty = ImplementationDifficulty.MEDIUM
            ))
        }
        
        // Add communication style recommendations
        if (profile.communicationStyles.isNotEmpty()) {
            // Find strongest communication preference
            val topStyle = profile.communicationStyles.entries
                .maxByOrNull { profileLearningSystem.getConfidence("communication:${it.key}") }
            
            topStyle?.let {
                recommendations.add(AdaptationRecommendation(
                    aspect = AdaptationAspect.COMMUNICATION,
                    recommendation = "Adjust communication style to match user preference for ${it.key}: ${it.value}",
                    confidence = profileLearningSystem.getConfidence("communication:${it.key}"),
                    implementationDifficulty = ImplementationDifficulty.EASY
                ))
            }
        }
        
        // Add persona recommendations based on relationship dynamics
        val positiveDynamics = profile.relationshipDynamics.flatMap { (type, obs) ->
            obs.filter { it.impact == RelationshipImpact.POSITIVE }
                .map { Pair(type, it) }
        }
        
        if (positiveDynamics.isNotEmpty()) {
            val bestDynamic = positiveDynamics.maxByOrNull { 
                profileLearningSystem.getConfidence("relationship:${it.first}")
            }
            
            bestDynamic?.let {
                recommendations.add(AdaptationRecommendation(
                    aspect = AdaptationAspect.PERSONA,
                    recommendation = "Emphasize ${it.first} dynamic through ${it.second.observation}",
                    confidence = profileLearningSystem.getConfidence("relationship:${it.first}"),
                    implementationDifficulty = ImplementationDifficulty.MEDIUM
                ))
            }
        }
        
        return recommendations.sortedByDescending { it.confidence }
    }
    
    /**
     * Record user feedback on adaptation
     */
    fun recordAdaptationFeedback(
        adaptationAspect: AdaptationAspect,
        isPositive: Boolean,
        details: String? = null
    ) {
        // Store feedback in memory
        memoryManager.storeMemory(
            type = "ADAPTATION_FEEDBACK",
            content = "User provided ${if (isPositive) "positive" else "negative"} feedback on $adaptationAspect adaptation${details?.let { ": $it" } ?: ""}",
            tags = listOf("user_profile", "adaptation", "feedback", adaptationAspect.toString().lowercase()),
            priority = com.sallie.core.memory.MemoryPriority.HIGH,
            metadata = mapOf(
                "aspect" to adaptationAspect.toString(),
                "isPositive" to isPositive.toString(),
                "details" to (details ?: "")
            )
        )
        
        // Adjust adaptation settings based on feedback
        if (isPositive) {
            // Positive feedback could gradually increase adaptation level
            if (adaptationSettings.adaptationLevel.ordinal < AdaptationLevel.values().size - 1) {
                adaptationSettings = adaptationSettings.copy(
                    aspectConfidence = adaptationSettings.aspectConfidence + mapOf(
                        adaptationAspect to (adaptationSettings.aspectConfidence[adaptationAspect] ?: 0.5f) + 0.1f
                    )
                )
            }
        } else {
            // Negative feedback could decrease adaptation strength for this aspect
            adaptationSettings = adaptationSettings.copy(
                aspectConfidence = adaptationSettings.aspectConfidence + mapOf(
                    adaptationAspect to (adaptationSettings.aspectConfidence[adaptationAspect] ?: 0.5f) - 0.2f
                )
            )
            
            // If confidence gets too low, disable this aspect
            if ((adaptationSettings.aspectConfidence[adaptationAspect] ?: 0.0f) < 0.2f) {
                disableAdaptationAspects(setOf(adaptationAspect))
            }
        }
    }
    
    /**
     * Check if an adaptation aspect is enabled
     */
    private fun isAspectEnabled(aspect: AdaptationAspect): Boolean {
        return adaptationSettings.enabledAspects.contains(aspect)
    }
    
    /**
     * Get adaptation strength factor based on current adaptation level
     */
    private fun getAdaptationStrengthFactor(): Float {
        val baseFactor = when (adaptationSettings.adaptationLevel) {
            AdaptationLevel.MINIMAL -> 0.2f
            AdaptationLevel.MODERATE -> 0.5f
            AdaptationLevel.SIGNIFICANT -> 0.8f
            AdaptationLevel.MAXIMUM -> 1.0f
        }
        
        // Profile completeness affects strength - incomplete profiles should have less influence
        val profileCompleteness = profileLearningSystem.generateProfileSummary().overallProfileCompleteness
        
        return baseFactor * profileCompleteness
    }
    
    /**
     * Determine formality from user profile
     */
    private fun determineFormality(profile: UserProfile): Float {
        // Check explicit communication preferences
        val formalityPreference = profile.communicationStyles["formality"]
        
        return when {
            formalityPreference == "formal" -> 0.8f
            formalityPreference == "very formal" -> 1.0f
            formalityPreference == "casual" -> 0.3f
            formalityPreference == "very casual" -> 0.1f
            
            // If no explicit preference, infer from behavior and preferences
            profile.preferences["communication_style"]?.get("formal") != null ->
                profile.preferences["communication_style"]?.get("formal") ?: 0.5f
                
            // Default to medium formality
            else -> 0.5f
        }
    }
    
    /**
     * Determine detail level from user profile
     */
    private fun determineDetailLevel(profile: UserProfile): Float {
        // Check explicit communication preferences
        val detailPreference = profile.communicationStyles["detail"]
        
        return when {
            detailPreference == "detailed" -> 0.8f
            detailPreference == "very detailed" -> 1.0f
            detailPreference == "concise" -> 0.3f
            detailPreference == "very concise" -> 0.1f
            
            // If no explicit preference, infer from behavior
            profile.behaviorPatterns["information_processing"]?.any { 
                it.description.contains("detail", ignoreCase = true) && 
                (it.frequency == PatternFrequency.FREQUENT || it.frequency == PatternFrequency.VERY_FREQUENT) 
            } == true -> 0.8f
            
            profile.behaviorPatterns["information_processing"]?.any { 
                it.description.contains("summary", ignoreCase = true) && 
                (it.frequency == PatternFrequency.FREQUENT || it.frequency == PatternFrequency.VERY_FREQUENT) 
            } == true -> 0.3f
            
            // Default to medium detail
            else -> 0.5f
        }
    }
    
    /**
     * Determine tone from user profile
     */
    private fun determineTone(profile: UserProfile): Float {
        // Check for tone preferences (where higher values = more positive/enthusiastic tone)
        val tonePreference = profile.communicationStyles["tone"]
        
        return when {
            tonePreference == "enthusiastic" -> 0.8f
            tonePreference == "very enthusiastic" -> 1.0f
            tonePreference == "neutral" -> 0.5f
            tonePreference == "serious" -> 0.3f
            tonePreference == "very serious" -> 0.1f
            
            // If no explicit preference, look at emotional responses
            profile.emotionalResponses.any { (_, emotions) ->
                emotions["annoyance"]?.let { it > 0.7f } == true || 
                emotions["irritation"]?.let { it > 0.7f } == true
            } -> 0.4f // More neutral/serious if user gets annoyed easily
            
            // Default to slightly positive
            else -> 0.6f
        }
    }
    
    /**
     * Determine pacing from user profile
     */
    private fun determinePacing(profile: UserProfile): Float {
        // Check for pace preferences (where higher values = faster pace)
        val pacePreference = profile.communicationStyles["pace"]
        
        return when {
            pacePreference == "fast" -> 0.8f
            pacePreference == "very fast" -> 1.0f
            pacePreference == "moderate" -> 0.5f
            pacePreference == "slow" -> 0.3f
            pacePreference == "very slow" -> 0.1f
            
            // If no explicit preference, infer from behavior
            profile.behaviorPatterns["communication"]?.any { 
                it.description.contains("quick", ignoreCase = true) && 
                (it.frequency == PatternFrequency.FREQUENT || it.frequency == PatternFrequency.VERY_FREQUENT) 
            } == true -> 0.7f
            
            profile.behaviorPatterns["communication"]?.any { 
                it.description.contains("deliberate", ignoreCase = true) && 
                (it.frequency == PatternFrequency.FREQUENT || it.frequency == PatternFrequency.VERY_FREQUENT) 
            } == true -> 0.3f
            
            // Default to moderate pace
            else -> 0.5f
        }
    }
    
    /**
     * Determine optimal warmth for persona based on profile
     */
    private fun determineOptimalWarmth(profile: UserProfile): Float {
        // Start with default
        var warmth = 0.6f
        
        // Check relationship dynamics
        profile.relationshipDynamics["warmth"]?.forEach { observation ->
            if (observation.impact == RelationshipImpact.POSITIVE && 
                observation.observation.contains("warm", ignoreCase = true)) {
                warmth += 0.2f
            } else if (observation.impact == RelationshipImpact.NEGATIVE && 
                observation.observation.contains("warm", ignoreCase = true)) {
                warmth -= 0.2f
            }
        }
        
        // Check communication preferences
        if (profile.communicationStyles["style"]?.contains("warm", ignoreCase = true) == true) {
            warmth += 0.1f
        } else if (profile.communicationStyles["style"]?.contains("professional", ignoreCase = true) == true) {
            warmth -= 0.1f
        }
        
        return warmth.coerceIn(0.1f, 1.0f)
    }
    
    /**
     * Determine optimal humor for persona based on profile
     */
    private fun determineOptimalHumor(profile: UserProfile): Float {
        // Start with default
        var humor = 0.5f
        
        // Check emotional responses to humor
        profile.emotionalResponses.forEach { (trigger, emotions) ->
            if (trigger.contains("humor", ignoreCase = true) || 
                trigger.contains("joke", ignoreCase = true)) {
                
                // Positive response to humor
                if (emotions["happiness"]?.let { it > 0.7f } == true ||
                    emotions["amusement"]?.let { it > 0.7f } == true) {
                    humor += 0.2f
                }
                
                // Negative response to humor
                if (emotions["annoyance"]?.let { it > 0.7f } == true ||
                    emotions["discomfort"]?.let { it > 0.7f } == true) {
                    humor -= 0.2f
                }
            }
        }
        
        // Check preferences
        profile.preferences["communication_style"]?.get("humorous")?.let { humor += it * 0.3f }
        profile.preferences["communication_style"]?.get("serious")?.let { humor -= it * 0.3f }
        
        return humor.coerceIn(0.1f, 1.0f)
    }
    
    /**
     * Determine optimal formality for persona based on profile
     */
    private fun determineOptimalFormality(profile: UserProfile): Float {
        // Start with default
        var formality = 0.5f
        
        // Check communication style preferences
        if (profile.communicationStyles["formality"]?.contains("formal", ignoreCase = true) == true) {
            formality += 0.2f
        } else if (profile.communicationStyles["formality"]?.contains("casual", ignoreCase = true) == true) {
            formality -= 0.2f
        }
        
        // Check relationship dynamics related to formality
        profile.relationshipDynamics["formality"]?.forEach { observation ->
            if (observation.impact == RelationshipImpact.POSITIVE && 
                observation.observation.contains("formal", ignoreCase = true)) {
                formality += 0.2f
            } else if (observation.impact == RelationshipImpact.NEGATIVE && 
                observation.observation.contains("formal", ignoreCase = true)) {
                formality -= 0.2f
            }
        }
        
        return formality.coerceIn(0.1f, 1.0f)
    }
    
    /**
     * Determine optimal detail orientation for persona based on profile
     */
    private fun determineOptimalDetailOrientation(profile: UserProfile): Float {
        // Start with default
        var detailOrientation = 0.5f
        
        // Check preferences
        profile.preferences["communication_style"]?.get("detailed")?.let { detailOrientation += it * 0.3f }
        profile.preferences["communication_style"]?.get("concise")?.let { detailOrientation -= it * 0.3f }
        
        // Check behavior patterns related to information processing
        profile.behaviorPatterns["information_processing"]?.forEach { pattern ->
            if ((pattern.frequency == PatternFrequency.FREQUENT || 
                pattern.frequency == PatternFrequency.VERY_FREQUENT) &&
                pattern.description.contains("detail", ignoreCase = true)) {
                detailOrientation += 0.2f
            } else if ((pattern.frequency == PatternFrequency.FREQUENT || 
                pattern.frequency == PatternFrequency.VERY_FREQUENT) &&
                pattern.description.contains("summary", ignoreCase = true)) {
                detailOrientation -= 0.2f
            }
        }
        
        return detailOrientation.coerceIn(0.1f, 1.0f)
    }
    
    /**
     * Determine optimal response speed based on profile
     */
    private fun determineOptimalResponseSpeed(profile: UserProfile): Long {
        // Default response speed (milliseconds)
        var baseSpeed = 800L
        
        // Check pace preferences
        when (profile.communicationStyles["pace"]) {
            "very fast" -> baseSpeed = 400L
            "fast" -> baseSpeed = 600L
            "moderate" -> baseSpeed = 800L
            "slow" -> baseSpeed = 1000L
            "very slow" -> baseSpeed = 1200L
        }
        
        // Adjust based on behavior patterns
        profile.behaviorPatterns["communication"]?.forEach { pattern ->
            if ((pattern.frequency == PatternFrequency.FREQUENT || 
                pattern.frequency == PatternFrequency.VERY_FREQUENT)) {
                
                if (pattern.description.contains("quick", ignoreCase = true) || 
                    pattern.description.contains("fast", ignoreCase = true)) {
                    baseSpeed -= 100
                } else if (pattern.description.contains("slow", ignoreCase = true) || 
                    pattern.description.contains("deliberate", ignoreCase = true)) {
                    baseSpeed += 100
                }
            }
        }
        
        // Ensure reasonable bounds
        return baseSpeed.coerceIn(300L, 1500L)
    }
    
    /**
     * Determine optimal thinking indicator frequency based on profile
     */
    private fun determineOptimalIndicatorFrequency(profile: UserProfile): Float {
        // Default frequency (0-1 scale, higher = more frequent)
        var frequency = 0.5f
        
        // Adjust based on detail preference (more detail-oriented users may appreciate more "thinking" indicators)
        if (profile.communicationStyles["detail"] == "detailed" || 
            profile.communicationStyles["detail"] == "very detailed") {
            frequency += 0.2f
        } else if (profile.communicationStyles["detail"] == "concise" || 
            profile.communicationStyles["detail"] == "very concise") {
            frequency -= 0.2f
        }
        
        // Adjust based on pace preference
        if (profile.communicationStyles["pace"] == "fast" || 
            profile.communicationStyles["pace"] == "very fast") {
            frequency -= 0.2f
        } else if (profile.communicationStyles["pace"] == "slow" || 
            profile.communicationStyles["pace"] == "very slow") {
            frequency += 0.1f
        }
        
        return frequency.coerceIn(0.1f, 0.9f)
    }
    
    /**
     * Determine aspect from suggestion text
     */
    private fun determineAspectFromSuggestion(suggestion: String): AdaptationAspect {
        return when {
            suggestion.contains("communication", ignoreCase = true) -> AdaptationAspect.COMMUNICATION
            suggestion.contains("persona", ignoreCase = true) -> AdaptationAspect.PERSONA
            suggestion.contains("pace", ignoreCase = true) || 
            suggestion.contains("speed", ignoreCase = true) -> AdaptationAspect.PACING
            suggestion.contains("topic", ignoreCase = true) -> AdaptationAspect.TOPICS
            suggestion.contains("emotional", ignoreCase = true) -> AdaptationAspect.EMOTIONAL_RESPONSES
            suggestion.contains("visual", ignoreCase = true) || 
            suggestion.contains("appearance", ignoreCase = true) -> AdaptationAspect.VISUAL
            else -> AdaptationAspect.GENERAL
        }
    }
    
    /**
     * Blend two attribute values based on adaptation strength
     */
    private fun blendAttributes(baseValue: Float, adaptedValue: Float, strength: Float): Float {
        return baseValue * (1 - strength) + adaptedValue * strength
    }
    
    /**
     * Blend two values based on adaptation strength
     */
    private fun blendValues(baseValue: Float, adaptedValue: Float, strength: Float): Float {
        return baseValue * (1 - strength) + adaptedValue * strength
    }
    
    companion object {
        // List of positive emotions for topic recommendations
        private val POSITIVE_EMOTIONS = setOf(
            "happiness", "joy", "interest", "excitement", "enthusiasm",
            "contentment", "satisfaction", "pride", "amusement", "hope"
        )
        
        // List of negative emotions for topic avoidance
        private val NEGATIVE_EMOTIONS = setOf(
            "anger", "frustration", "sadness", "anxiety", "fear",
            "disgust", "shame", "guilt", "embarrassment", "discomfort"
        )
    }
}

/**
 * Communication style data class
 */
data class CommunicationStyle(
    val formality: Float, // 0.0 = very casual, 1.0 = very formal
    val detailLevel: Float, // 0.0 = very concise, 1.0 = very detailed
    val tone: Float, // 0.0 = very serious, 1.0 = very enthusiastic
    val pacing: Float // 0.0 = very slow, 1.0 = very fast
)

/**
 * Conversation pacing data class
 */
data class ConversationPacing(
    val responseSpeed: Long, // in milliseconds
    val thinkingIndicatorFrequency: Float // 0.0 = never, 1.0 = very frequent
)

/**
 * Topic recommendation data class
 */
data class TopicRecommendation(
    val topic: String,
    val confidence: Float,
    val category: String,
    val metadata: Map<String, String> = emptyMap()
)

/**
 * Topic avoidance data class
 */
data class TopicAvoidance(
    val topic: String,
    val confidence: Float,
    val reason: String,
    val severity: AvoidanceSeverity
)

/**
 * Avoidance severity enum
 */
enum class AvoidanceSeverity {
    LOW,
    MEDIUM,
    HIGH
}

/**
 * Adaptation recommendation data class
 */
data class AdaptationRecommendation(
    val aspect: AdaptationAspect,
    val recommendation: String,
    val confidence: Float,
    val implementationDifficulty: ImplementationDifficulty
)

/**
 * Implementation difficulty enum
 */
enum class ImplementationDifficulty {
    EASY,
    MEDIUM,
    HARD
}

/**
 * Adaptation level enum
 */
enum class AdaptationLevel {
    MINIMAL,
    MODERATE,
    SIGNIFICANT,
    MAXIMUM
}

/**
 * Adaptation aspect enum
 */
enum class AdaptationAspect {
    COMMUNICATION,
    PERSONA,
    PACING,
    TOPICS,
    EMOTIONAL_RESPONSES,
    VISUAL,
    GENERAL
}

/**
 * Adaptation settings data class
 */
@Serializable
data class AdaptationSettings(
    val adaptationLevel: AdaptationLevel = AdaptationLevel.MODERATE,
    val enabledAspects: Set<AdaptationAspect> = setOf(
        AdaptationAspect.COMMUNICATION,
        AdaptationAspect.PERSONA,
        AdaptationAspect.PACING,
        AdaptationAspect.TOPICS
    ),
    val aspectConfidence: Map<AdaptationAspect, Float> = AdaptationAspect.values().associateWith { 0.5f }
)

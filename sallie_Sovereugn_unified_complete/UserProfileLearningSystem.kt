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

/**
 * UserProfileLearningSystem enables Sallie to learn about the user over time,
 * building a comprehensive profile that includes preferences, patterns,
 * relationship dynamics, and communication styles. The system ensures
 * that all profile learning aligns with core values and privacy principles.
 */
class UserProfileLearningSystem(
    private val memoryManager: EnhancedMemoryManager,
    private val valuesSystem: ValuesSystem,
    private val scope: CoroutineScope = CoroutineScope(Dispatchers.Default)
) {
    // Current profile state
    private val _userProfile = MutableStateFlow<UserProfile>(UserProfile())
    val userProfile: StateFlow<UserProfile> = _userProfile
    
    // Confidence levels for different profile aspects
    private val profileConfidence = mutableMapOf<String, Float>()
    
    // Observation counters
    private val observationCounts = mutableMapOf<String, Int>()
    
    init {
        // Load existing profile if available
        loadUserProfile()
        
        // Start periodic profile consolidation
        startProfileConsolidation()
    }
    
    /**
     * Record a user preference observation
     */
    fun recordPreference(
        category: String,
        preference: String,
        strength: Float = 0.5f,
        context: String? = null
    ) {
        // Validate against values system
        val validationResult = valuesSystem.validateActivity(
            activityType = "profile_learning",
            activityDetails = "preference_tracking",
            context = mapOf(
                "category" to category,
                "preference" to preference
            )
        )
        
        if (!validationResult.allowed) {
            // Skip recording if not aligned with values
            return
        }
        
        // Store observation in memory
        memoryManager.storeMemory(
            type = "USER_PREFERENCE",
            content = "User showed preference for '$preference' in category '$category'${context?.let { " during $it" } ?: ""}",
            tags = listOf("user_profile", "preference", category, preference),
            priority = MemoryPriority.MEDIUM,
            metadata = mapOf(
                "category" to category,
                "preference" to preference,
                "strength" to strength.toString(),
                "context" to (context ?: "none")
            )
        )
        
        // Update profile
        updatePreference(category, preference, strength)
        
        // Update observation count
        val key = "$category:$preference"
        observationCounts[key] = (observationCounts[key] ?: 0) + 1
        
        // Update confidence based on observation count
        updateConfidence(key)
    }
    
    /**
     * Record a user behavior pattern
     */
    fun recordBehaviorPattern(
        patternType: String,
        description: String,
        frequency: PatternFrequency,
        context: String? = null
    ) {
        // Validate against values system
        val validationResult = valuesSystem.validateActivity(
            activityType = "profile_learning",
            activityDetails = "behavior_tracking",
            context = mapOf(
                "patternType" to patternType,
                "description" to description
            )
        )
        
        if (!validationResult.allowed) {
            // Skip recording if not aligned with values
            return
        }
        
        // Store observation in memory
        memoryManager.storeMemory(
            type = "USER_BEHAVIOR",
            content = "User exhibited '$description' pattern with $frequency frequency${context?.let { " during $it" } ?: ""}",
            tags = listOf("user_profile", "behavior", patternType),
            priority = MemoryPriority.MEDIUM,
            metadata = mapOf(
                "patternType" to patternType,
                "description" to description,
                "frequency" to frequency.toString(),
                "context" to (context ?: "none")
            )
        )
        
        // Update profile
        updateBehaviorPattern(patternType, description, frequency)
        
        // Update observation count
        val key = "behavior:$patternType"
        observationCounts[key] = (observationCounts[key] ?: 0) + 1
        
        // Update confidence
        updateConfidence(key)
    }
    
    /**
     * Record a communication style observation
     */
    fun recordCommunicationStyle(
        aspect: String,
        style: String,
        context: String? = null
    ) {
        // Validate against values system
        val validationResult = valuesSystem.validateActivity(
            activityType = "profile_learning",
            activityDetails = "communication_tracking",
            context = mapOf(
                "aspect" to aspect,
                "style" to style
            )
        )
        
        if (!validationResult.allowed) {
            // Skip recording if not aligned with values
            return
        }
        
        // Store observation in memory
        memoryManager.storeMemory(
            type = "USER_COMMUNICATION",
            content = "User demonstrated '$style' communication style for aspect '$aspect'${context?.let { " during $it" } ?: ""}",
            tags = listOf("user_profile", "communication", aspect, style),
            priority = MemoryPriority.MEDIUM,
            metadata = mapOf(
                "aspect" to aspect,
                "style" to style,
                "context" to (context ?: "none")
            )
        )
        
        // Update profile
        updateCommunicationStyle(aspect, style)
        
        // Update observation count
        val key = "communication:$aspect"
        observationCounts[key] = (observationCounts[key] ?: 0) + 1
        
        // Update confidence
        updateConfidence(key)
    }
    
    /**
     * Record relationship dynamic observation
     */
    fun recordRelationshipDynamic(
        dynamic: String,
        observation: String,
        impact: RelationshipImpact = RelationshipImpact.NEUTRAL,
        context: String? = null
    ) {
        // Validate against values system
        val validationResult = valuesSystem.validateActivity(
            activityType = "profile_learning",
            activityDetails = "relationship_tracking",
            context = mapOf(
                "dynamic" to dynamic,
                "observation" to observation
            )
        )
        
        if (!validationResult.allowed) {
            // Skip recording if not aligned with values
            return
        }
        
        // Store observation in memory
        memoryManager.storeMemory(
            type = "USER_RELATIONSHIP",
            content = "Observed '$observation' in relationship dynamic '$dynamic' with $impact impact${context?.let { " during $it" } ?: ""}",
            tags = listOf("user_profile", "relationship", dynamic),
            priority = MemoryPriority.HIGH, // Relationship dynamics are high priority
            metadata = mapOf(
                "dynamic" to dynamic,
                "observation" to observation,
                "impact" to impact.toString(),
                "context" to (context ?: "none")
            )
        )
        
        // Update profile
        updateRelationshipDynamic(dynamic, observation, impact)
        
        // Update observation count
        val key = "relationship:$dynamic"
        observationCounts[key] = (observationCounts[key] ?: 0) + 1
        
        // Update confidence
        updateConfidence(key)
    }
    
    /**
     * Record user emotional response
     */
    fun recordEmotionalResponse(
        trigger: String,
        emotion: String,
        intensity: Float,
        context: String? = null
    ) {
        // Validate against values system
        val validationResult = valuesSystem.validateActivity(
            activityType = "profile_learning",
            activityDetails = "emotion_tracking",
            context = mapOf(
                "trigger" to trigger,
                "emotion" to emotion
            )
        )
        
        if (!validationResult.allowed) {
            // Skip recording if not aligned with values
            return
        }
        
        // Store observation in memory
        memoryManager.storeMemory(
            type = "USER_EMOTION",
            content = "User responded with '$emotion' (intensity: ${String.format("%.1f", intensity)}) to '$trigger'${context?.let { " during $it" } ?: ""}",
            tags = listOf("user_profile", "emotion", emotion, trigger),
            priority = MemoryPriority.MEDIUM,
            metadata = mapOf(
                "trigger" to trigger,
                "emotion" to emotion,
                "intensity" to intensity.toString(),
                "context" to (context ?: "none")
            )
        )
        
        // Update profile
        updateEmotionalResponse(trigger, emotion, intensity)
        
        // Update observation count
        val key = "emotion:$trigger:$emotion"
        observationCounts[key] = (observationCounts[key] ?: 0) + 1
        
        // Update confidence
        updateConfidence(key)
    }
    
    /**
     * Get user preference for a category
     */
    fun getUserPreference(category: String): Map<String, Float> {
        return userProfile.value.preferences[category] ?: emptyMap()
    }
    
    /**
     * Get user behavior patterns
     */
    fun getBehaviorPatterns(): Map<String, List<BehaviorPattern>> {
        return userProfile.value.behaviorPatterns
    }
    
    /**
     * Get user communication styles
     */
    fun getCommunicationStyles(): Map<String, String> {
        return userProfile.value.communicationStyles
    }
    
    /**
     * Get relationship dynamics
     */
    fun getRelationshipDynamics(): Map<String, List<RelationshipObservation>> {
        return userProfile.value.relationshipDynamics
    }
    
    /**
     * Get emotional responses
     */
    fun getEmotionalResponses(): Map<String, Map<String, Float>> {
        return userProfile.value.emotionalResponses
    }
    
    /**
     * Get confidence for a specific profile aspect
     */
    fun getConfidence(key: String): Float {
        return profileConfidence[key] ?: 0.0f
    }
    
    /**
     * Generate a profile summary
     */
    fun generateProfileSummary(): UserProfileSummary {
        val profile = userProfile.value
        
        // Extract key preferences
        val topPreferences = profile.preferences.flatMap { (category, prefs) ->
            prefs.entries
                .sortedByDescending { it.value }
                .take(3)
                .map { Triple(category, it.key, it.value) }
        }.sortedByDescending { it.third }.take(5)
        
        // Extract key behavior patterns
        val significantBehaviors = profile.behaviorPatterns.flatMap { (type, patterns) ->
            patterns.filter { it.frequency == PatternFrequency.FREQUENT || it.frequency == PatternFrequency.VERY_FREQUENT }
                .take(3)
                .map { Pair(type, it) }
        }
        
        // Extract key communication styles
        val keyStyles = profile.communicationStyles.entries.toList()
        
        // Extract key relationship dynamics
        val significantDynamics = profile.relationshipDynamics.flatMap { (type, obs) ->
            obs.filter { it.impact != RelationshipImpact.NEUTRAL }
                .take(3)
                .map { Pair(type, it) }
        }
        
        // Extract key emotional triggers
        val strongEmotions = profile.emotionalResponses.flatMap { (trigger, emotions) ->
            emotions.entries
                .filter { it.value > 0.7f }
                .map { Triple(trigger, it.key, it.value) }
        }.sortedByDescending { it.third }.take(5)
        
        return UserProfileSummary(
            keyPreferences = topPreferences.map { 
                "${it.first}: ${it.second} (${String.format("%.1f", it.third)})" 
            },
            significantBehaviors = significantBehaviors.map { (type, pattern) ->
                "$type: ${pattern.description} (${pattern.frequency})"
            },
            communicationStyle = keyStyles.map { (aspect, style) ->
                "$aspect: $style (${String.format("%.1f", getConfidence("communication:$aspect"))})"
            },
            relationshipInsights = significantDynamics.map { (type, obs) ->
                "$type: ${obs.observation} (${obs.impact})"
            },
            emotionalTriggers = strongEmotions.map {
                "${it.first} → ${it.second} (${String.format("%.1f", it.third)})"
            },
            overallProfileCompleteness = calculateProfileCompleteness(),
            suggestedAdaptations = generateAdaptationSuggestions()
        )
    }
    
    /**
     * Save the current profile
     */
    fun saveProfile() {
        // Store the full profile in memory
        memoryManager.storeMemory(
            type = "USER_PROFILE_SNAPSHOT",
            content = Json.encodeToString(userProfile.value),
            tags = listOf("user_profile", "snapshot"),
            priority = MemoryPriority.HIGH
        )
    }
    
    /**
     * Start periodic profile consolidation
     */
    private fun startProfileConsolidation() {
        scope.launch {
            while (true) {
                // Wait before consolidation
                kotlinx.coroutines.delay(3600000) // 1 hour in milliseconds
                
                // Perform consolidation
                consolidateProfile()
                
                // Save consolidated profile
                saveProfile()
            }
        }
    }
    
    /**
     * Consolidate profile by analyzing memory patterns
     */
    private fun consolidateProfile() {
        // Query recent memories for pattern analysis
        val query = MemoryQuery(
            tags = listOf("user_profile"),
            maxResults = 1000
        )
        
        val memories = memoryManager.searchMemories(query)
        
        // Group memories by type for analysis
        val preferenceMemories = memories.filter { it.type == "USER_PREFERENCE" }
        val behaviorMemories = memories.filter { it.type == "USER_BEHAVIOR" }
        val communicationMemories = memories.filter { it.type == "USER_COMMUNICATION" }
        val relationshipMemories = memories.filter { it.type == "USER_RELATIONSHIP" }
        val emotionMemories = memories.filter { it.type == "USER_EMOTION" }
        
        // Analyze preference consistency
        analyzePreferenceConsistency(preferenceMemories)
        
        // Analyze behavior patterns for trends
        analyzeBehaviorTrends(behaviorMemories)
        
        // Analyze communication style consistency
        analyzeCommunicationConsistency(communicationMemories)
        
        // Analyze relationship dynamics evolution
        analyzeRelationshipEvolution(relationshipMemories)
        
        // Analyze emotional response patterns
        analyzeEmotionalPatterns(emotionMemories)
        
        // Update overall profile confidence
        updateOverallConfidence()
    }
    
    /**
     * Analyze preferences for consistency
     */
    private fun analyzePreferenceConsistency(memories: List<Memory>) {
        // Group by category and preference
        val groupedPreferences = memories.groupBy { 
            it.metadata["category"] to it.metadata["preference"] 
        }
        
        // For each preference, analyze consistency
        groupedPreferences.forEach { (key, observations) ->
            val (category, preference) = key
            
            if (category != null && preference != null) {
                // Calculate average strength
                val strengths = observations.mapNotNull { it.metadata["strength"]?.toFloatOrNull() }
                if (strengths.isNotEmpty()) {
                    val avgStrength = strengths.average().toFloat()
                    
                    // Update profile with consolidated value
                    updatePreference(category, preference, avgStrength)
                    
                    // Update confidence based on consistency
                    val consistency = calculateConsistency(strengths)
                    val key = "$category:$preference"
                    profileConfidence[key] = consistency
                }
            }
        }
    }
    
    /**
     * Analyze behavior trends
     */
    private fun analyzeBehaviorTrends(memories: List<Memory>) {
        // Group by pattern type
        val groupedBehaviors = memories.groupBy { it.metadata["patternType"] }
        
        // For each pattern type, analyze trends
        groupedBehaviors.forEach { (patternType, observations) ->
            if (patternType != null) {
                // Group by description
                val patternsByDescription = observations.groupBy { it.metadata["description"] }
                
                patternsByDescription.forEach { (description, instances) ->
                    if (description != null) {
                        // Analyze frequency trend
                        val frequencies = instances.mapNotNull { 
                            it.metadata["frequency"]?.let { freq -> PatternFrequency.valueOf(freq) }
                        }
                        
                        if (frequencies.isNotEmpty()) {
                            // Determine most common frequency
                            val frequencyMap = frequencies.groupBy { it }.mapValues { it.value.size }
                            val mostCommonFrequency = frequencyMap.entries.maxByOrNull { it.value }?.key
                                ?: PatternFrequency.OCCASIONAL
                            
                            // Update profile
                            updateBehaviorPattern(patternType, description, mostCommonFrequency)
                            
                            // Update confidence based on consistency
                            val consistency = frequencyMap[mostCommonFrequency]!!.toFloat() / frequencies.size
                            profileConfidence["behavior:$patternType"] = consistency
                        }
                    }
                }
            }
        }
    }
    
    /**
     * Analyze communication style consistency
     */
    private fun analyzeCommunicationConsistency(memories: List<Memory>) {
        // Group by aspect
        val groupedStyles = memories.groupBy { it.metadata["aspect"] }
        
        // For each aspect, analyze consistency
        groupedStyles.forEach { (aspect, observations) ->
            if (aspect != null) {
                // Group by style
                val stylesByType = observations.groupBy { it.metadata["style"] }
                
                // Find most common style
                val styleCount = stylesByType.mapValues { it.value.size }
                val mostCommonStyle = styleCount.entries.maxByOrNull { it.value }
                
                if (mostCommonStyle != null && mostCommonStyle.key != null) {
                    // Update profile
                    updateCommunicationStyle(aspect, mostCommonStyle.key)
                    
                    // Update confidence based on consistency
                    val consistency = mostCommonStyle.value.toFloat() / observations.size
                    profileConfidence["communication:$aspect"] = consistency
                }
            }
        }
    }
    
    /**
     * Analyze relationship dynamics evolution
     */
    private fun analyzeRelationshipEvolution(memories: List<Memory>) {
        // Group by dynamic
        val groupedDynamics = memories.groupBy { it.metadata["dynamic"] }
        
        // For each dynamic, analyze evolution
        groupedDynamics.forEach { (dynamic, observations) ->
            if (dynamic != null) {
                // Sort by timestamp to see evolution
                val sortedObservations = observations.sortedBy { it.timestamp }
                
                // Focus on most recent observations (last 30%)
                val recentCount = (sortedObservations.size * 0.3).toInt().coerceAtLeast(1)
                val recentObservations = sortedObservations.takeLast(recentCount)
                
                // Group recent observations by impact
                val recentImpacts = recentObservations.mapNotNull { 
                    it.metadata["impact"]?.let { impact -> RelationshipImpact.valueOf(impact) }
                }
                
                // Group by observation
                val observationGroups = recentObservations.groupBy { it.metadata["observation"] }
                
                observationGroups.forEach { (observation, instances) ->
                    if (observation != null) {
                        // Determine most common impact
                        val impacts = instances.mapNotNull { 
                            it.metadata["impact"]?.let { impact -> RelationshipImpact.valueOf(impact) } 
                        }
                        
                        if (impacts.isNotEmpty()) {
                            val impactCount = impacts.groupBy { it }.mapValues { it.value.size }
                            val mostCommonImpact = impactCount.entries.maxByOrNull { it.value }?.key
                                ?: RelationshipImpact.NEUTRAL
                            
                            // Update profile
                            updateRelationshipDynamic(dynamic, observation, mostCommonImpact)
                            
                            // Update confidence based on consistency
                            val consistency = impactCount[mostCommonImpact]!!.toFloat() / impacts.size
                            profileConfidence["relationship:$dynamic"] = consistency
                        }
                    }
                }
            }
        }
    }
    
    /**
     * Analyze emotional response patterns
     */
    private fun analyzeEmotionalPatterns(memories: List<Memory>) {
        // Group by trigger
        val groupedEmotions = memories.groupBy { it.metadata["trigger"] }
        
        // For each trigger, analyze emotional responses
        groupedEmotions.forEach { (trigger, observations) ->
            if (trigger != null) {
                // Group by emotion
                val emotionsByType = observations.groupBy { it.metadata["emotion"] }
                
                emotionsByType.forEach { (emotion, instances) ->
                    if (emotion != null) {
                        // Calculate average intensity
                        val intensities = instances.mapNotNull { it.metadata["intensity"]?.toFloatOrNull() }
                        
                        if (intensities.isNotEmpty()) {
                            val avgIntensity = intensities.average().toFloat()
                            
                            // Update profile
                            updateEmotionalResponse(trigger, emotion, avgIntensity)
                            
                            // Update confidence based on consistency
                            val consistency = calculateConsistency(intensities)
                            profileConfidence["emotion:$trigger:$emotion"] = consistency
                        }
                    }
                }
            }
        }
    }
    
    /**
     * Calculate consistency of numeric values (0 = inconsistent, 1 = perfectly consistent)
     */
    private fun calculateConsistency(values: List<Float>): Float {
        if (values.isEmpty()) return 0.0f
        if (values.size == 1) return 0.5f
        
        // Calculate standard deviation
        val mean = values.average()
        val variance = values.map { (it - mean) * (it - mean) }.average()
        val stdDev = kotlin.math.sqrt(variance)
        
        // Convert to consistency score (lower stdDev = higher consistency)
        // Range is 0-1, where 1 is perfectly consistent
        return (1.0 - (stdDev / 1.0)).coerceIn(0.0, 1.0).toFloat()
    }
    
    /**
     * Update overall confidence
     */
    private fun updateOverallConfidence() {
        // Calculate average confidence across all profile aspects
        if (profileConfidence.isNotEmpty()) {
            val avgConfidence = profileConfidence.values.average().toFloat()
            profileConfidence["overall"] = avgConfidence
        }
    }
    
    /**
     * Update confidence based on observation count
     */
    private fun updateConfidence(key: String) {
        val count = observationCounts[key] ?: 0
        
        // Calculate confidence based on observation count
        // More observations = higher confidence (up to a point)
        val observationConfidence = minOf(count / 10.0f, 1.0f)
        
        // Existing confidence from consistency
        val consistencyConfidence = profileConfidence[key] ?: 0.0f
        
        // Weighted combination (observation count matters more initially)
        val weightedConfidence = if (count < 5) {
            observationConfidence * 0.7f + consistencyConfidence * 0.3f
        } else {
            observationConfidence * 0.4f + consistencyConfidence * 0.6f
        }
        
        // Update confidence
        profileConfidence[key] = weightedConfidence
        
        // Update overall confidence
        updateOverallConfidence()
    }
    
    /**
     * Update user preference in profile
     */
    private fun updatePreference(category: String, preference: String, strength: Float) {
        val currentPreferences = userProfile.value.preferences.toMutableMap()
        val categoryPreferences = currentPreferences[category]?.toMutableMap() ?: mutableMapOf()
        
        // Update or add preference
        categoryPreferences[preference] = strength
        
        // Update category
        currentPreferences[category] = categoryPreferences
        
        // Update profile
        _userProfile.value = userProfile.value.copy(preferences = currentPreferences)
    }
    
    /**
     * Update behavior pattern in profile
     */
    private fun updateBehaviorPattern(patternType: String, description: String, frequency: PatternFrequency) {
        val currentPatterns = userProfile.value.behaviorPatterns.toMutableMap()
        val typePatterns = currentPatterns[patternType]?.toMutableList() ?: mutableListOf()
        
        // Check if pattern already exists
        val existingIndex = typePatterns.indexOfFirst { it.description == description }
        
        if (existingIndex >= 0) {
            // Update existing pattern
            typePatterns[existingIndex] = typePatterns[existingIndex].copy(frequency = frequency)
        } else {
            // Add new pattern
            typePatterns.add(BehaviorPattern(description = description, frequency = frequency))
        }
        
        // Update pattern type
        currentPatterns[patternType] = typePatterns
        
        // Update profile
        _userProfile.value = userProfile.value.copy(behaviorPatterns = currentPatterns)
    }
    
    /**
     * Update communication style in profile
     */
    private fun updateCommunicationStyle(aspect: String, style: String) {
        val currentStyles = userProfile.value.communicationStyles.toMutableMap()
        
        // Update or add style
        currentStyles[aspect] = style
        
        // Update profile
        _userProfile.value = userProfile.value.copy(communicationStyles = currentStyles)
    }
    
    /**
     * Update relationship dynamic in profile
     */
    private fun updateRelationshipDynamic(
        dynamic: String,
        observation: String,
        impact: RelationshipImpact
    ) {
        val currentDynamics = userProfile.value.relationshipDynamics.toMutableMap()
        val dynamicObservations = currentDynamics[dynamic]?.toMutableList() ?: mutableListOf()
        
        // Check if observation already exists
        val existingIndex = dynamicObservations.indexOfFirst { it.observation == observation }
        
        if (existingIndex >= 0) {
            // Update existing observation
            dynamicObservations[existingIndex] = dynamicObservations[existingIndex].copy(impact = impact)
        } else {
            // Add new observation
            dynamicObservations.add(RelationshipObservation(observation = observation, impact = impact))
        }
        
        // Update dynamic
        currentDynamics[dynamic] = dynamicObservations
        
        // Update profile
        _userProfile.value = userProfile.value.copy(relationshipDynamics = currentDynamics)
    }
    
    /**
     * Update emotional response in profile
     */
    private fun updateEmotionalResponse(trigger: String, emotion: String, intensity: Float) {
        val currentResponses = userProfile.value.emotionalResponses.toMutableMap()
        val triggerEmotions = currentResponses[trigger]?.toMutableMap() ?: mutableMapOf()
        
        // Update or add emotion
        triggerEmotions[emotion] = intensity
        
        // Update trigger
        currentResponses[trigger] = triggerEmotions
        
        // Update profile
        _userProfile.value = userProfile.value.copy(emotionalResponses = currentResponses)
    }
    
    /**
     * Calculate overall profile completeness
     */
    private fun calculateProfileCompleteness(): Float {
        val profile = userProfile.value
        val aspects = mutableListOf<Float>()
        
        // Preference completeness (based on number of categories)
        aspects.add(minOf(profile.preferences.size / 5.0f, 1.0f))
        
        // Behavior pattern completeness
        aspects.add(minOf(profile.behaviorPatterns.size / 3.0f, 1.0f))
        
        // Communication style completeness
        aspects.add(minOf(profile.communicationStyles.size / 5.0f, 1.0f))
        
        // Relationship dynamics completeness
        aspects.add(minOf(profile.relationshipDynamics.size / 3.0f, 1.0f))
        
        // Emotional response completeness
        aspects.add(minOf(profile.emotionalResponses.size / 5.0f, 1.0f))
        
        // Overall confidence
        aspects.add(profileConfidence["overall"] ?: 0.0f)
        
        // Calculate average
        return aspects.average().toFloat()
    }
    
    /**
     * Generate adaptation suggestions based on profile
     */
    private fun generateAdaptationSuggestions(): List<String> {
        val suggestions = mutableListOf<String>()
        val profile = userProfile.value
        
        // Suggest communication style adaptations
        if (profile.communicationStyles.isNotEmpty()) {
            val dominantStyle = profile.communicationStyles.entries
                .maxByOrNull { getConfidence("communication:${it.key}") }
            
            dominantStyle?.let {
                suggestions.add("Adapt communication to match preference for ${it.key}: ${it.value}")
            }
        }
        
        // Suggest emotional response adaptations
        val strongEmotions = profile.emotionalResponses.flatMap { (trigger, emotions) ->
            emotions.entries
                .filter { it.value > 0.7f }
                .map { Triple(trigger, it.key, it.value) }
        }.sortedByDescending { it.third }.take(2)
        
        if (strongEmotions.isNotEmpty()) {
            suggestions.add("Be mindful of strong ${strongEmotions[0].second} response to ${strongEmotions[0].first}")
        }
        
        // Suggest relationship dynamic adaptations
        val positiveDynamics = profile.relationshipDynamics.flatMap { (type, obs) ->
            obs.filter { it.impact == RelationshipImpact.POSITIVE }
                .map { Pair(type, it) }
        }
        
        if (positiveDynamics.isNotEmpty()) {
            val example = positiveDynamics.random()
            suggestions.add("Continue fostering positive ${example.first} dynamic through ${example.second.observation}")
        }
        
        return suggestions
    }
    
    /**
     * Load existing profile from memory
     */
    private fun loadUserProfile() {
        // Query for most recent profile snapshot
        val query = MemoryQuery(
            type = "USER_PROFILE_SNAPSHOT",
            maxResults = 1
        )
        
        val memories = memoryManager.searchMemories(query)
        
        // If found, deserialize and load
        if (memories.isNotEmpty()) {
            try {
                val profileData = memories[0].content
                val loadedProfile = Json.decodeFromString<UserProfile>(profileData)
                _userProfile.value = loadedProfile
                
                // Load observation counts
                loadObservationCounts()
                
            } catch (e: Exception) {
                // Log error in a real implementation
            }
        }
    }
    
    /**
     * Load observation counts from memory
     */
    private fun loadObservationCounts() {
        // For preferences
        userProfile.value.preferences.forEach { (category, prefs) ->
            prefs.forEach { (preference, _) ->
                val key = "$category:$preference"
                
                // Query for this preference
                val query = MemoryQuery(
                    type = "USER_PREFERENCE",
                    metadata = mapOf(
                        "category" to category,
                        "preference" to preference
                    ),
                    maxResults = 100
                )
                
                val memories = memoryManager.searchMemories(query)
                observationCounts[key] = memories.size
                updateConfidence(key)
            }
        }
        
        // Similar approach for other profile aspects
        // For brevity, not implementing all of them here
    }
}

/**
 * User profile data class
 */
@Serializable
data class UserProfile(
    val preferences: Map<String, Map<String, Float>> = emptyMap(),
    val behaviorPatterns: Map<String, List<BehaviorPattern>> = emptyMap(),
    val communicationStyles: Map<String, String> = emptyMap(),
    val relationshipDynamics: Map<String, List<RelationshipObservation>> = emptyMap(),
    val emotionalResponses: Map<String, Map<String, Float>> = emptyMap()
)

/**
 * Behavior pattern data class
 */
@Serializable
data class BehaviorPattern(
    val description: String,
    val frequency: PatternFrequency
)

/**
 * Relationship observation data class
 */
@Serializable
data class RelationshipObservation(
    val observation: String,
    val impact: RelationshipImpact
)

/**
 * Pattern frequency enum
 */
@Serializable
enum class PatternFrequency {
    RARE,
    OCCASIONAL,
    FREQUENT,
    VERY_FREQUENT
}

/**
 * Relationship impact enum
 */
@Serializable
enum class RelationshipImpact {
    NEGATIVE,
    NEUTRAL,
    POSITIVE
}

/**
 * User profile summary data class
 */
data class UserProfileSummary(
    val keyPreferences: List<String>,
    val significantBehaviors: List<String>,
    val communicationStyle: List<String>,
    val relationshipInsights: List<String>,
    val emotionalTriggers: List<String>,
    val overallProfileCompleteness: Float,
    val suggestedAdaptations: List<String>
)

/**
 * Memory class for testing - replace with actual implementation
 */
private data class Memory(
    val id: String,
    val type: String,
    val content: String,
    val timestamp: Long,
    val tags: List<String>,
    val priority: MemoryPriority,
    val metadata: Map<String, String> = emptyMap()
)

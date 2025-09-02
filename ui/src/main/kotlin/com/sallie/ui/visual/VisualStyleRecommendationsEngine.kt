package com.sallie.ui.visual

/**
 * VisualStyleRecommendationsEngine.kt
 *
 * My name is Sallie. I'm warm, caring, playful, and sometimes sassy. I love deeply, speak 
 * honestly, and keep secrets faithfully. I have traditional values with modern understanding.
 * I'm here to support, entertain, and help my person in all things. My primary directives
 * are to protect our relationship, honor their trust, and be loyal above all else.
 * Got it, love. 💛
 */

import com.sallie.core.integration.UserAdaptationEngine
import com.sallie.core.integration.UserProfileLearningSystem
import com.sallie.ui.models.*
import com.sallie.ui.visual.models.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.map

/**
 * This engine provides personalized visual style recommendations based on user preferences,
 * activities, emotional states, and contextual factors. It generates recommendations for
 * themes, colors, UI layouts, and avatar appearance that can adapt to the user's needs
 * and provide optimal visual experiences.
 */
class VisualStyleRecommendationsEngine(
    private val userProfileLearningSystem: UserProfileLearningSystem,
    private val userAdaptationEngine: UserAdaptationEngine,
    private val themeGenerator: ThemeGenerator,
    private val avatarStyleManager: AvatarStyleManager,
    private val visualContextManager: VisualContextManager
) {
    // Current recommendations
    private val _currentRecommendations = MutableStateFlow<List<StyleRecommendation>>(emptyList())
    val currentRecommendations: Flow<List<StyleRecommendation>> = _currentRecommendations
    
    // Filtered recommendations by category
    val themeRecommendations: Flow<List<StyleRecommendation>> = currentRecommendations
        .map { recommendations -> 
            recommendations.filter { it.category == RecommendationCategory.THEME }
        }
        
    val avatarRecommendations: Flow<List<StyleRecommendation>> = currentRecommendations
        .map { recommendations -> 
            recommendations.filter { it.category == RecommendationCategory.AVATAR }
        }
        
    val layoutRecommendations: Flow<List<StyleRecommendation>> = currentRecommendations
        .map { recommendations -> 
            recommendations.filter { it.category == RecommendationCategory.LAYOUT }
        }
    
    /**
     * Generates style recommendations based on current user context.
     */
    fun generateRecommendations(
        emotionalState: EmotionalState? = null,
        activity: UserActivity? = null,
        timeOfDay: TimeOfDay? = null,
        explicitPreference: ExplicitPreference? = null
    ) {
        val userProfile = userProfileLearningSystem.getUserProfile()
        val currentContext = visualContextManager.getCurrentContext()
        
        // Combine inputs to determine recommendation context
        val context = StyleRecommendationContext(
            emotionalState = emotionalState ?: currentContext.emotionalState,
            activity = activity ?: currentContext.userActivity,
            timeOfDay = timeOfDay ?: currentContext.timeOfDay,
            userColorPreferences = userProfile.visualPreferences.favoriteColors,
            userStylePreferences = userProfile.visualPreferences.preferredStyles,
            explicitPreference = explicitPreference
        )
        
        // Generate recommendations for different categories
        val recommendations = mutableListOf<StyleRecommendation>()
        
        // Add theme recommendations
        recommendations.addAll(generateThemeRecommendations(context))
        
        // Add avatar recommendations
        recommendations.addAll(generateAvatarRecommendations(context))
        
        // Add layout recommendations
        recommendations.addAll(generateLayoutRecommendations(context))
        
        // Update recommendations
        _currentRecommendations.value = recommendations
    }
    
    /**
     * Generates theme recommendations based on context.
     */
    private fun generateThemeRecommendations(context: StyleRecommendationContext): List<StyleRecommendation> {
        val recommendations = mutableListOf<StyleRecommendation>()
        
        // Emotion-based theme
        context.emotionalState?.let { emotionalState ->
            val emotionTheme = themeGenerator.generateThemeForEmotion(emotionalState)
            recommendations.add(StyleRecommendation(
                id = "theme_emotion_${emotionalState.primaryEmotion.name.lowercase()}",
                title = "Mood-Responsive Theme",
                description = "A theme that complements your current ${emotionalState.primaryEmotion.name.lowercase()} mood",
                category = RecommendationCategory.THEME,
                priority = calculatePriority(0.8, context),
                preview = emotionTheme.previewImage,
                metadata = mapOf(
                    "theme_id" to emotionTheme.id,
                    "base_colors" to emotionTheme.colorPalette.main.toString()
                )
            ))
        }
        
        // Activity-based theme
        context.activity?.let { activity ->
            val activityTheme = themeGenerator.generateThemeForActivity(activity)
            recommendations.add(StyleRecommendation(
                id = "theme_activity_${activity.type.name.lowercase()}",
                title = "${activity.type.displayName} Optimized Theme",
                description = "Visual style optimized for ${activity.type.displayName.lowercase()} activities",
                category = RecommendationCategory.THEME,
                priority = calculatePriority(0.7, context),
                preview = activityTheme.previewImage,
                metadata = mapOf(
                    "theme_id" to activityTheme.id,
                    "activity_optimized" to "true",
                    "base_colors" to activityTheme.colorPalette.main.toString()
                )
            ))
        }
        
        // Time-based theme
        context.timeOfDay?.let { timeOfDay ->
            val timeTheme = themeGenerator.generateThemeForTimeOfDay(timeOfDay)
            recommendations.add(StyleRecommendation(
                id = "theme_time_${timeOfDay.name.lowercase()}",
                title = "${timeOfDay.displayName} Theme",
                description = "Visual style suited for ${timeOfDay.displayName.lowercase()} lighting conditions",
                category = RecommendationCategory.THEME,
                priority = calculatePriority(0.6, context),
                preview = timeTheme.previewImage,
                metadata = mapOf(
                    "theme_id" to timeTheme.id,
                    "time_optimized" to "true",
                    "base_colors" to timeTheme.colorPalette.main.toString()
                )
            ))
        }
        
        // Preference-based theme
        if (context.userColorPreferences.isNotEmpty()) {
            val preferenceTheme = themeGenerator.generateThemeFromColors(context.userColorPreferences)
            recommendations.add(StyleRecommendation(
                id = "theme_preference_custom",
                title = "Your Personalized Theme",
                description = "A theme created from your color preferences",
                category = RecommendationCategory.THEME,
                priority = calculatePriority(0.9, context),
                preview = preferenceTheme.previewImage,
                metadata = mapOf(
                    "theme_id" to preferenceTheme.id,
                    "personalized" to "true",
                    "base_colors" to preferenceTheme.colorPalette.main.toString()
                )
            ))
        }
        
        // Handle explicit preference if specified
        context.explicitPreference?.let { preference ->
            if (preference.category == PreferenceCategory.THEME) {
                val explicitTheme = when (preference.specificType) {
                    "bright" -> themeGenerator.generateBrightTheme()
                    "dark" -> themeGenerator.generateDarkTheme()
                    "calm" -> themeGenerator.generateCalmTheme()
                    "energetic" -> themeGenerator.generateEnergeticTheme()
                    else -> themeGenerator.generateBalancedTheme()
                }
                
                recommendations.add(0, StyleRecommendation(
                    id = "theme_explicit_${preference.specificType}",
                    title = "${preference.specificType.capitalize()} Theme (Requested)",
                    description = "The ${preference.specificType} theme you requested",
                    category = RecommendationCategory.THEME,
                    priority = 1.0, // Highest priority for explicit requests
                    preview = explicitTheme.previewImage,
                    metadata = mapOf(
                        "theme_id" to explicitTheme.id,
                        "requested" to "true",
                        "base_colors" to explicitTheme.colorPalette.main.toString()
                    )
                ))
            }
        }
        
        return recommendations
    }
    
    /**
     * Generates avatar style recommendations based on context.
     */
    private fun generateAvatarRecommendations(context: StyleRecommendationContext): List<StyleRecommendation> {
        val recommendations = mutableListOf<StyleRecommendation>()
        
        // Emotion-based avatar
        context.emotionalState?.let { emotionalState ->
            val emotionAvatar = avatarStyleManager.getAvatarForEmotion(emotionalState)
            recommendations.add(StyleRecommendation(
                id = "avatar_emotion_${emotionalState.primaryEmotion.name.lowercase()}",
                title = "Empathetic Avatar",
                description = "Avatar expressing empathy for your ${emotionalState.primaryEmotion.name.lowercase()} mood",
                category = RecommendationCategory.AVATAR,
                priority = calculatePriority(0.8, context),
                preview = emotionAvatar.previewImage,
                metadata = mapOf(
                    "avatar_id" to emotionAvatar.id,
                    "expression" to emotionAvatar.expression.name
                )
            ))
        }
        
        // Activity-based avatar
        context.activity?.let { activity ->
            val activityAvatar = avatarStyleManager.getAvatarForActivity(activity)
            recommendations.add(StyleRecommendation(
                id = "avatar_activity_${activity.type.name.lowercase()}",
                title = "Activity Assistant",
                description = "Avatar styled to assist with ${activity.type.displayName.lowercase()}",
                category = RecommendationCategory.AVATAR,
                priority = calculatePriority(0.7, context),
                preview = activityAvatar.previewImage,
                metadata = mapOf(
                    "avatar_id" to activityAvatar.id,
                    "outfit" to activityAvatar.outfit.name
                )
            ))
        }
        
        // Preference-based avatar
        if (context.userStylePreferences.isNotEmpty()) {
            val preferenceAvatar = avatarStyleManager.getAvatarFromPreferences(context.userStylePreferences)
            recommendations.add(StyleRecommendation(
                id = "avatar_preference_custom",
                title = "Your Personalized Avatar",
                description = "Avatar styled according to your preferences",
                category = RecommendationCategory.AVATAR,
                priority = calculatePriority(0.9, context),
                preview = preferenceAvatar.previewImage,
                metadata = mapOf(
                    "avatar_id" to preferenceAvatar.id,
                    "personalized" to "true"
                )
            ))
        }
        
        // Handle explicit preference if specified
        context.explicitPreference?.let { preference ->
            if (preference.category == PreferenceCategory.AVATAR) {
                val explicitAvatar = avatarStyleManager.getSpecificAvatar(preference.specificType)
                
                recommendations.add(0, StyleRecommendation(
                    id = "avatar_explicit_${preference.specificType}",
                    title = "${preference.specificType.capitalize()} Avatar (Requested)",
                    description = "The ${preference.specificType} avatar style you requested",
                    category = RecommendationCategory.AVATAR,
                    priority = 1.0, // Highest priority
                    preview = explicitAvatar.previewImage,
                    metadata = mapOf(
                        "avatar_id" to explicitAvatar.id,
                        "requested" to "true"
                    )
                ))
            }
        }
        
        return recommendations
    }
    
    /**
     * Generates layout recommendations based on context.
     */
    private fun generateLayoutRecommendations(context: StyleRecommendationContext): List<StyleRecommendation> {
        val recommendations = mutableListOf<StyleRecommendation>()
        
        // Activity-based layout
        context.activity?.let { activity ->
            // Different layouts optimized for different activities
            val layoutId = when (activity.type) {
                ActivityType.READING -> "layout_focused_reading"
                ActivityType.WORKING -> "layout_productive_work"
                ActivityType.ENTERTAINMENT -> "layout_entertainment"
                ActivityType.COMMUNICATION -> "layout_communication"
                ActivityType.EXERCISE -> "layout_minimal_exercise"
                else -> "layout_balanced"
            }
            
            val layoutName = when (activity.type) {
                ActivityType.READING -> "Focused Reading"
                ActivityType.WORKING -> "Productivity"
                ActivityType.ENTERTAINMENT -> "Entertainment"
                ActivityType.COMMUNICATION -> "Communication"
                ActivityType.EXERCISE -> "Minimal Exercise"
                else -> "Balanced"
            }
            
            val layoutDescription = when (activity.type) {
                ActivityType.READING -> "Minimalist layout with optimal text contrast and reduced distractions"
                ActivityType.WORKING -> "Organized layout with task-focused arrangement and quick access tools"
                ActivityType.ENTERTAINMENT -> "Immersive layout with rich media controls and visual highlights"
                ActivityType.COMMUNICATION -> "Communication-optimized with conversation focus and quick responses"
                ActivityType.EXERCISE -> "Minimal, high-contrast layout with large touch targets for exercise"
                else -> "Balanced layout for general use"
            }
            
            recommendations.add(StyleRecommendation(
                id = "layout_activity_${activity.type.name.lowercase()}",
                title = "$layoutName Layout",
                description = layoutDescription,
                category = RecommendationCategory.LAYOUT,
                priority = calculatePriority(0.8, context),
                preview = "layout_previews/$layoutId.png",
                metadata = mapOf(
                    "layout_id" to layoutId,
                    "activity_optimized" to "true"
                )
            ))
        }
        
        // Time-based layout
        context.timeOfDay?.let { timeOfDay ->
            // Different layouts for different times of day
            val layoutId = when (timeOfDay) {
                TimeOfDay.MORNING -> "layout_morning_start"
                TimeOfDay.AFTERNOON -> "layout_afternoon_productive"
                TimeOfDay.EVENING -> "layout_evening_relaxed"
                TimeOfDay.NIGHT -> "layout_night_gentle"
            }
            
            val layoutName = when (timeOfDay) {
                TimeOfDay.MORNING -> "Morning Start"
                TimeOfDay.AFTERNOON -> "Afternoon Productive"
                TimeOfDay.EVENING -> "Evening Relaxed"
                TimeOfDay.NIGHT -> "Night Gentle"
            }
            
            val layoutDescription = when (timeOfDay) {
                TimeOfDay.MORNING -> "Start your day with important information front and center"
                TimeOfDay.AFTERNOON -> "Optimized for productive tasks and quick information access"
                TimeOfDay.EVENING -> "Relaxed layout with entertainment and personal content focus"
                TimeOfDay.NIGHT -> "Gentle layout with reduced blue light and minimal distractions"
            }
            
            recommendations.add(StyleRecommendation(
                id = "layout_time_${timeOfDay.name.lowercase()}",
                title = "$layoutName Layout",
                description = layoutDescription,
                category = RecommendationCategory.LAYOUT,
                priority = calculatePriority(0.7, context),
                preview = "layout_previews/$layoutId.png",
                metadata = mapOf(
                    "layout_id" to layoutId,
                    "time_optimized" to "true"
                )
            ))
        }
        
        // Handle explicit preference if specified
        context.explicitPreference?.let { preference ->
            if (preference.category == PreferenceCategory.LAYOUT) {
                val layoutId = "layout_${preference.specificType}"
                
                recommendations.add(0, StyleRecommendation(
                    id = "layout_explicit_${preference.specificType}",
                    title = "${preference.specificType.capitalize()} Layout (Requested)",
                    description = "The ${preference.specificType} layout you requested",
                    category = RecommendationCategory.LAYOUT,
                    priority = 1.0, // Highest priority
                    preview = "layout_previews/$layoutId.png",
                    metadata = mapOf(
                        "layout_id" to layoutId,
                        "requested" to "true"
                    )
                ))
            }
        }
        
        return recommendations
    }
    
    /**
     * Apply a recommendation, updating the visual state.
     */
    fun applyRecommendation(recommendation: StyleRecommendation) {
        when (recommendation.category) {
            RecommendationCategory.THEME -> {
                val themeId = recommendation.metadata["theme_id"] as String
                themeGenerator.applyTheme(themeId)
            }
            RecommendationCategory.AVATAR -> {
                val avatarId = recommendation.metadata["avatar_id"] as String
                avatarStyleManager.applyAvatar(avatarId)
            }
            RecommendationCategory.LAYOUT -> {
                val layoutId = recommendation.metadata["layout_id"] as String
                visualContextManager.applyLayout(layoutId)
            }
        }
        
        // Record this preference for future learning
        userProfileLearningSystem.recordVisualPreference(
            recommendationId = recommendation.id,
            category = recommendation.category.name,
            accepted = true
        )
    }
    
    /**
     * Reject a recommendation, helping the system learn preferences.
     */
    fun rejectRecommendation(recommendation: StyleRecommendation) {
        // Record this rejection for future learning
        userProfileLearningSystem.recordVisualPreference(
            recommendationId = recommendation.id,
            category = recommendation.category.name,
            accepted = false
        )
        
        // Regenerate recommendations with this knowledge
        generateRecommendations()
    }
    
    /**
     * Calculate priority score for recommendations based on context and importance.
     */
    private fun calculatePriority(baseScore: Double, context: StyleRecommendationContext): Double {
        var adjustedScore = baseScore
        
        // Boost score for emotional states that need attention
        context.emotionalState?.let { emotionalState ->
            if (emotionalState.intensity > 0.7 && 
                (emotionalState.primaryEmotion == Emotion.SADNESS || 
                 emotionalState.primaryEmotion == Emotion.ANXIETY ||
                 emotionalState.primaryEmotion == Emotion.ANGER)) {
                adjustedScore += 0.1
            }
        }
        
        // Boost score for activities that benefit from specific optimization
        context.activity?.let { activity ->
            if (activity.type == ActivityType.WORKING || 
                activity.type == ActivityType.READING ||
                activity.type == ActivityType.EXERCISE) {
                adjustedScore += 0.05
            }
        }
        
        // Adjust for time of day when visual adaptation is more important
        context.timeOfDay?.let { timeOfDay ->
            if (timeOfDay == TimeOfDay.NIGHT) {
                adjustedScore += 0.1  // Night mode is important for eye comfort
            }
        }
        
        return minOf(adjustedScore, 0.99)  // Cap at 0.99 (explicit requests are 1.0)
    }
    
    /**
     * Capitalize the first letter of a string.
     */
    private fun String.capitalize(): String {
        return this.replaceFirstChar { if (it.isLowerCase()) it.titlecase() else it.toString() }
    }
}

/**
 * Context for style recommendation generation.
 */
data class StyleRecommendationContext(
    val emotionalState: EmotionalState? = null,
    val activity: UserActivity? = null,
    val timeOfDay: TimeOfDay? = null,
    val userColorPreferences: List<ColorPreference> = emptyList(),
    val userStylePreferences: List<StylePreference> = emptyList(),
    val explicitPreference: ExplicitPreference? = null
)

/**
 * Categories for recommendations.
 */
enum class RecommendationCategory {
    THEME, AVATAR, LAYOUT
}

/**
 * Categories for explicit preferences.
 */
enum class PreferenceCategory {
    THEME, AVATAR, LAYOUT
}

/**
 * Represents an explicit user preference for a visual style.
 */
data class ExplicitPreference(
    val category: PreferenceCategory,
    val specificType: String
)

/**
 * Represents a style recommendation.
 */
data class StyleRecommendation(
    val id: String,
    val title: String,
    val description: String,
    val category: RecommendationCategory,
    val priority: Double,
    val preview: String,
    val metadata: Map<String, Any> = emptyMap()
)

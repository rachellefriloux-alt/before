package com.sallie.ui.visual

/**
 * EmotionalVisualFeedbackSystem.kt
 *
 * My name is Sallie. I'm warm, caring, playful, and sometimes sassy. I love deeply, speak 
 * honestly, and keep secrets faithfully. I have traditional values with modern understanding.
 * I'm here to support, entertain, and help my person in all things. My primary directives
 * are to protect our relationship, honor their trust, and be loyal above all else.
 * Got it, love. 💛
 */

import com.sallie.core.memory.HierarchicalMemorySystem
import com.sallie.ui.models.*
import com.sallie.ui.visual.models.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

/**
 * Provides visual feedback based on detected user emotional states. This system
 * adapts Sallie's visual presentation to respond to user emotions in ways that
 * provide comfort, support, and appropriate responsiveness.
 */
class EmotionalVisualFeedbackSystem(
    private val themeGenerator: ThemeGenerator,
    private val avatarStyleManager: AvatarStyleManager,
    private val animationSystem: AnimationSystem,
    private val memorySystem: HierarchicalMemorySystem
) {
    // Current visual feedback state
    private val _currentFeedbackState = MutableStateFlow<EmotionalVisualFeedback?>(null)
    val currentFeedbackState: StateFlow<EmotionalVisualFeedback?> = _currentFeedbackState
    
    // Feedback effectiveness tracking
    private val feedbackEffectiveness = mutableMapOf<Emotion, MutableList<FeedbackEffectivenessEntry>>()
    
    /**
     * Generate visual feedback for a detected emotional state.
     */
    fun generateFeedback(emotionalState: EmotionalState): EmotionalVisualFeedback {
        // Step 1: Determine appropriate feedback strategy
        val strategy = determineStrategy(emotionalState)
        
        // Step 2: Apply color modifications based on emotion
        val colorModifications = generateColorModifications(emotionalState, strategy)
        
        // Step 3: Create avatar expression and animation
        val avatarResponse = generateAvatarResponse(emotionalState, strategy)
        
        // Step 4: Create subtle UI animations
        val uiAnimations = generateUIAnimations(emotionalState, strategy)
        
        // Step 5: Create ambient effects
        val ambientEffects = generateAmbientEffects(emotionalState, strategy)
        
        // Create the combined feedback
        val feedback = EmotionalVisualFeedback(
            targetEmotion = emotionalState,
            strategy = strategy,
            colorModifications = colorModifications,
            avatarResponse = avatarResponse,
            uiAnimations = uiAnimations,
            ambientEffects = ambientEffects
        )
        
        // Update current state
        _currentFeedbackState.value = feedback
        
        // Record this emotional response in memory
        recordEmotionalFeedback(emotionalState, feedback)
        
        return feedback
    }
    
    /**
     * Apply the generated feedback to the UI.
     */
    fun applyFeedback(feedback: EmotionalVisualFeedback) {
        // Apply color modifications
        themeGenerator.applyColorModifications(feedback.colorModifications)
        
        // Apply avatar response
        avatarStyleManager.setExpression(feedback.avatarResponse.expression)
        animationSystem.playAnimation(feedback.avatarResponse.animation)
        
        // Apply UI animations
        feedback.uiAnimations.forEach { animation ->
            animationSystem.applyUIAnimation(animation.type, animation.parameters)
        }
        
        // Apply ambient effects
        feedback.ambientEffects.forEach { effect ->
            animationSystem.applyAmbientEffect(effect.type, effect.parameters)
        }
    }
    
    /**
     * Record user response to the feedback.
     */
    fun recordFeedbackResponse(
        originalEmotion: Emotion,
        feedback: EmotionalVisualFeedback,
        effectiveScore: Double,
        subsequentEmotion: Emotion? = null
    ) {
        val entry = FeedbackEffectivenessEntry(
            strategy = feedback.strategy,
            effectiveScore = effectiveScore,
            subsequentEmotion = subsequentEmotion
        )
        
        // Add to effectiveness tracking
        val entries = feedbackEffectiveness.getOrPut(originalEmotion) { mutableListOf() }
        entries.add(entry)
        
        // Limit list size to maintain efficiency
        if (entries.size > MAX_EFFECTIVENESS_ENTRIES) {
            entries.removeAt(0)
        }
        
        // Record in memory system
        memorySystem.storeInEpisodic(
            event = "Visual feedback for ${originalEmotion.name}",
            details = "Strategy: ${feedback.strategy.name}, Effectiveness: $effectiveScore",
            importance = 0.5,
            metadata = mapOf(
                "emotion" to originalEmotion.name,
                "strategy" to feedback.strategy.name,
                "effectiveness" to effectiveScore.toString()
            )
        )
    }
    
    /**
     * Determine the best feedback strategy for this emotional state.
     */
    private fun determineStrategy(emotionalState: EmotionalState): EmotionalFeedbackStrategy {
        val emotion = emotionalState.primaryEmotion
        val intensity = emotionalState.intensity
        
        // First, check for past effectiveness if available
        val pastEntries = feedbackEffectiveness[emotion]
        if (pastEntries != null && pastEntries.isNotEmpty()) {
            // Find most effective strategy used in the past
            val bestEntry = pastEntries.maxByOrNull { it.effectiveScore }
            if (bestEntry != null && bestEntry.effectiveScore > 0.7) {
                return bestEntry.strategy
            }
        }
        
        // Default strategies based on emotion and intensity
        return when (emotion) {
            Emotion.JOY -> EmotionalFeedbackStrategy.AMPLIFY
            Emotion.SADNESS -> when {
                intensity > 0.7 -> EmotionalFeedbackStrategy.COMFORT
                else -> EmotionalFeedbackStrategy.GENTLE_UPLIFT
            }
            Emotion.ANGER -> when {
                intensity > 0.7 -> EmotionalFeedbackStrategy.CALM
                else -> EmotionalFeedbackStrategy.REDIRECT
            }
            Emotion.FEAR, Emotion.ANXIETY -> when {
                intensity > 0.7 -> EmotionalFeedbackStrategy.STABILIZE
                else -> EmotionalFeedbackStrategy.REASSURE
            }
            Emotion.SURPRISE -> EmotionalFeedbackStrategy.ACKNOWLEDGE
            Emotion.DISGUST -> EmotionalFeedbackStrategy.REDIRECT
            Emotion.TRUST -> EmotionalFeedbackStrategy.REINFORCE
            Emotion.ANTICIPATION -> EmotionalFeedbackStrategy.ENERGIZE
            Emotion.CONFUSION -> EmotionalFeedbackStrategy.CLARIFY
            Emotion.NEUTRAL -> EmotionalFeedbackStrategy.MIRROR
        }
    }
    
    /**
     * Generate color modifications based on emotion and strategy.
     */
    private fun generateColorModifications(
        emotionalState: EmotionalState,
        strategy: EmotionalFeedbackStrategy
    ): ColorModifications {
        val emotion = emotionalState.primaryEmotion
        val intensity = emotionalState.intensity
        
        // Base colors associated with emotions
        val emotionColors = when (emotion) {
            Emotion.JOY -> ColorPair(primary = "#FFD700", secondary = "#FFA500") // Gold and orange
            Emotion.SADNESS -> ColorPair(primary = "#4682B4", secondary = "#B0C4DE") // Steel blue and light blue
            Emotion.ANGER -> ColorPair(primary = "#B22222", secondary = "#CD5C5C") // Firebrick and indian red
            Emotion.FEAR -> ColorPair(primary = "#483D8B", secondary = "#9370DB") // Dark slate blue and medium purple
            Emotion.ANXIETY -> ColorPair(primary = "#5F9EA0", secondary = "#E0FFFF") // Cadet blue and light cyan
            Emotion.SURPRISE -> ColorPair(primary = "#9932CC", secondary = "#DDA0DD") // Dark orchid and plum
            Emotion.DISGUST -> ColorPair(primary = "#556B2F", secondary = "#8FBC8F") // Dark olive green and dark sea green
            Emotion.TRUST -> ColorPair(primary = "#008080", secondary = "#20B2AA") // Teal and light sea green
            Emotion.ANTICIPATION -> ColorPair(primary = "#DAA520", secondary = "#F0E68C") // Goldenrod and khaki
            Emotion.CONFUSION -> ColorPair(primary = "#778899", secondary = "#B0C4DE") // Light slate gray and light steel blue
            Emotion.NEUTRAL -> ColorPair(primary = "#708090", secondary = "#C0C0C0") // Slate gray and silver
        }
        
        // Modify color attributes based on strategy
        val saturation = when (strategy) {
            EmotionalFeedbackStrategy.AMPLIFY -> 0.2
            EmotionalFeedbackStrategy.GENTLE_UPLIFT -> 0.1
            EmotionalFeedbackStrategy.COMFORT -> -0.15
            EmotionalFeedbackStrategy.CALM -> -0.2
            EmotionalFeedbackStrategy.STABILIZE -> -0.25
            EmotionalFeedbackStrategy.REASSURE -> -0.1
            EmotionalFeedbackStrategy.ACKNOWLEDGE -> 0.05
            EmotionalFeedbackStrategy.REDIRECT -> -0.05
            EmotionalFeedbackStrategy.REINFORCE -> 0.15
            EmotionalFeedbackStrategy.ENERGIZE -> 0.25
            EmotionalFeedbackStrategy.CLARIFY -> -0.05
            EmotionalFeedbackStrategy.MIRROR -> 0.0
        }
        
        val brightness = when (strategy) {
            EmotionalFeedbackStrategy.AMPLIFY -> 0.1
            EmotionalFeedbackStrategy.GENTLE_UPLIFT -> 0.15
            EmotionalFeedbackStrategy.COMFORT -> 0.1
            EmotionalFeedbackStrategy.CALM -> 0.05
            EmotionalFeedbackStrategy.STABILIZE -> 0.1
            EmotionalFeedbackStrategy.REASSURE -> 0.15
            EmotionalFeedbackStrategy.ACKNOWLEDGE -> 0.0
            EmotionalFeedbackStrategy.REDIRECT -> 0.05
            EmotionalFeedbackStrategy.REINFORCE -> 0.1
            EmotionalFeedbackStrategy.ENERGIZE -> 0.2
            EmotionalFeedbackStrategy.CLARIFY -> 0.15
            EmotionalFeedbackStrategy.MIRROR -> 0.0
        }
        
        // Scale modifications by intensity
        val scaledSaturation = saturation * intensity
        val scaledBrightness = brightness * intensity
        
        // Create color modifications
        return ColorModifications(
            accentColor = emotionColors.primary,
            secondaryColor = emotionColors.secondary,
            saturationAdjustment = scaledSaturation,
            brightnessAdjustment = scaledBrightness,
            contrastAdjustment = 0.0 // No contrast changes by default
        )
    }
    
    /**
     * Generate avatar response based on emotion and strategy.
     */
    private fun generateAvatarResponse(
        emotionalState: EmotionalState,
        strategy: EmotionalFeedbackStrategy
    ): AvatarResponse {
        val emotion = emotionalState.primaryEmotion
        
        // Determine appropriate avatar expression
        val expression = when (strategy) {
            EmotionalFeedbackStrategy.AMPLIFY -> AvatarExpression.JOYFUL
            EmotionalFeedbackStrategy.GENTLE_UPLIFT -> AvatarExpression.ENCOURAGING
            EmotionalFeedbackStrategy.COMFORT -> AvatarExpression.COMPASSIONATE
            EmotionalFeedbackStrategy.CALM -> AvatarExpression.CALMING
            EmotionalFeedbackStrategy.STABILIZE -> AvatarExpression.SUPPORTIVE
            EmotionalFeedbackStrategy.REASSURE -> AvatarExpression.REASSURING
            EmotionalFeedbackStrategy.ACKNOWLEDGE -> AvatarExpression.ATTENTIVE
            EmotionalFeedbackStrategy.REDIRECT -> AvatarExpression.PLAYFUL
            EmotionalFeedbackStrategy.REINFORCE -> AvatarExpression.AFFIRMING
            EmotionalFeedbackStrategy.ENERGIZE -> AvatarExpression.ENERGETIC
            EmotionalFeedbackStrategy.CLARIFY -> AvatarExpression.THOUGHTFUL
            EmotionalFeedbackStrategy.MIRROR -> when (emotion) {
                Emotion.JOY -> AvatarExpression.JOYFUL
                Emotion.SADNESS -> AvatarExpression.SYMPATHETIC
                Emotion.ANGER -> AvatarExpression.UNDERSTANDING
                Emotion.FEAR, Emotion.ANXIETY -> AvatarExpression.CONCERNED
                Emotion.SURPRISE -> AvatarExpression.SURPRISED
                Emotion.DISGUST -> AvatarExpression.UNDERSTANDING
                Emotion.TRUST -> AvatarExpression.APPRECIATIVE
                Emotion.ANTICIPATION -> AvatarExpression.EXCITED
                Emotion.CONFUSION -> AvatarExpression.THOUGHTFUL
                Emotion.NEUTRAL -> AvatarExpression.NEUTRAL
            }
        }
        
        // Determine appropriate animation
        val animation = when (strategy) {
            EmotionalFeedbackStrategy.AMPLIFY -> "avatar_celebrate"
            EmotionalFeedbackStrategy.GENTLE_UPLIFT -> "avatar_encouraging_nod"
            EmotionalFeedbackStrategy.COMFORT -> "avatar_comforting_gesture"
            EmotionalFeedbackStrategy.CALM -> "avatar_calming_breath"
            EmotionalFeedbackStrategy.STABILIZE -> "avatar_steady_presence"
            EmotionalFeedbackStrategy.REASSURE -> "avatar_reassuring_smile"
            EmotionalFeedbackStrategy.ACKNOWLEDGE -> "avatar_attentive_nod"
            EmotionalFeedbackStrategy.REDIRECT -> "avatar_playful_gesture"
            EmotionalFeedbackStrategy.REINFORCE -> "avatar_affirming_nod"
            EmotionalFeedbackStrategy.ENERGIZE -> "avatar_energetic_movement"
            EmotionalFeedbackStrategy.CLARIFY -> "avatar_thoughtful_gesture"
            EmotionalFeedbackStrategy.MIRROR -> "avatar_empathetic_presence"
        }
        
        return AvatarResponse(expression, animation)
    }
    
    /**
     * Generate UI animations based on emotion and strategy.
     */
    private fun generateUIAnimations(
        emotionalState: EmotionalState,
        strategy: EmotionalFeedbackStrategy
    ): List<UIAnimation> {
        val animations = mutableListOf<UIAnimation>()
        val intensity = emotionalState.intensity
        
        // Add appropriate animations based on strategy
        when (strategy) {
            EmotionalFeedbackStrategy.AMPLIFY -> {
                animations.add(UIAnimation(
                    type = UIAnimationType.ELEMENT_PULSE,
                    parameters = mapOf(
                        "elements" to "positive_feedback",
                        "duration" to 800,
                        "scale" to 1.05 + (intensity * 0.1)
                    )
                ))
                animations.add(UIAnimation(
                    type = UIAnimationType.COLOR_TRANSITION,
                    parameters = mapOf(
                        "duration" to 1000,
                        "easing" to "easeInOut"
                    )
                ))
            }
            EmotionalFeedbackStrategy.GENTLE_UPLIFT -> {
                animations.add(UIAnimation(
                    type = UIAnimationType.GENTLE_FLOAT,
                    parameters = mapOf(
                        "elements" to "ui_elements",
                        "duration" to 1500,
                        "distance" to 3.0 + (intensity * 2.0)
                    )
                ))
            }
            EmotionalFeedbackStrategy.COMFORT -> {
                animations.add(UIAnimation(
                    type = UIAnimationType.SOFT_GLOW,
                    parameters = mapOf(
                        "elements" to "content_container",
                        "duration" to 2000,
                        "intensity" to 0.2 + (intensity * 0.2)
                    )
                ))
                animations.add(UIAnimation(
                    type = UIAnimationType.GENTLE_FLOAT,
                    parameters = mapOf(
                        "elements" to "supportive_elements",
                        "duration" to 2500,
                        "distance" to 2.0
                    )
                ))
            }
            EmotionalFeedbackStrategy.CALM -> {
                animations.add(UIAnimation(
                    type = UIAnimationType.SLOW_BREATHE,
                    parameters = mapOf(
                        "elements" to "background_elements",
                        "duration" to 4000,
                        "scale" to 1.02
                    )
                ))
            }
            EmotionalFeedbackStrategy.STABILIZE -> {
                animations.add(UIAnimation(
                    type = UIAnimationType.GROUNDING_FRAME,
                    parameters = mapOf(
                        "elements" to "content_container",
                        "duration" to 1000,
                        "width" to 2.0 + (intensity * 2.0)
                    )
                ))
            }
            // Additional animations for other strategies
            else -> {
                // Default subtle animation
                animations.add(UIAnimation(
                    type = UIAnimationType.SUBTLE_HIGHLIGHT,
                    parameters = mapOf(
                        "elements" to "interaction_elements",
                        "duration" to 1000,
                        "intensity" to 0.2
                    )
                ))
            }
        }
        
        return animations
    }
    
    /**
     * Generate ambient effects based on emotion and strategy.
     */
    private fun generateAmbientEffects(
        emotionalState: EmotionalState,
        strategy: EmotionalFeedbackStrategy
    ): List<AmbientEffect> {
        val effects = mutableListOf<AmbientEffect>()
        val intensity = emotionalState.intensity
        
        // Add appropriate effects based on strategy
        when (strategy) {
            EmotionalFeedbackStrategy.AMPLIFY -> {
                effects.add(AmbientEffect(
                    type = AmbientEffectType.PARTICLE_BURST,
                    parameters = mapOf(
                        "density" to (10 + (intensity * 20)).toInt(),
                        "duration" to 2000,
                        "color" to "#FFD700"
                    )
                ))
            }
            EmotionalFeedbackStrategy.GENTLE_UPLIFT -> {
                effects.add(AmbientEffect(
                    type = AmbientEffectType.GENTLE_WAVES,
                    parameters = mapOf(
                        "amplitude" to 2.0 + (intensity * 3.0),
                        "duration" to 3000,
                        "color" to "#87CEEB"
                    )
                ))
            }
            EmotionalFeedbackStrategy.COMFORT -> {
                effects.add(AmbientEffect(
                    type = AmbientEffectType.WARM_GLOW,
                    parameters = mapOf(
                        "intensity" to 0.3 + (intensity * 0.2),
                        "radius" to 20.0,
                        "color" to "#FFA07A"
                    )
                ))
            }
            EmotionalFeedbackStrategy.CALM -> {
                effects.add(AmbientEffect(
                    type = AmbientEffectType.SLOW_PULSE,
                    parameters = mapOf(
                        "frequency" to 0.1,
                        "opacity" to 0.15 + (intensity * 0.1),
                        "color" to "#E6E6FA"
                    )
                ))
            }
            // Additional effects for other strategies
            else -> {
                // Default subtle effect
                effects.add(AmbientEffect(
                    type = AmbientEffectType.SUBTLE_BACKGROUND,
                    parameters = mapOf(
                        "intensity" to 0.1 + (intensity * 0.1),
                        "duration" to 2000
                    )
                ))
            }
        }
        
        return effects
    }
    
    /**
     * Record emotional feedback in memory for learning.
     */
    private fun recordEmotionalFeedback(
        emotionalState: EmotionalState,
        feedback: EmotionalVisualFeedback
    ) {
        memorySystem.storeInEpisodic(
            event = "Visual response to ${emotionalState.primaryEmotion.name}",
            details = "Used ${feedback.strategy.name} strategy with " +
                      "${feedback.avatarResponse.expression.name} expression",
            importance = 0.3,
            metadata = mapOf(
                "emotion" to emotionalState.primaryEmotion.name,
                "intensity" to emotionalState.intensity.toString(),
                "strategy" to feedback.strategy.name,
                "expression" to feedback.avatarResponse.expression.name
            )
        )
    }
    
    companion object {
        private const val MAX_EFFECTIVENESS_ENTRIES = 10
    }
}

/**
 * Strategies for responding to emotional states.
 */
enum class EmotionalFeedbackStrategy {
    AMPLIFY,      // Enhance positive emotions
    GENTLE_UPLIFT, // Gently improve negative emotions
    COMFORT,      // Provide comfort for distress
    CALM,         // Calm intense negative emotions
    STABILIZE,    // Help stabilize fluctuating emotions
    REASSURE,     // Provide reassurance for worry or anxiety
    ACKNOWLEDGE,  // Simply acknowledge the emotion
    REDIRECT,     // Redirect focus from negative emotions
    REINFORCE,    // Reinforce positive associations
    ENERGIZE,     // Provide energy and motivation
    CLARIFY,      // Help clarify confusion
    MIRROR        // Match the user's emotional state
}

/**
 * Represents a visual feedback response to an emotional state.
 */
data class EmotionalVisualFeedback(
    val targetEmotion: EmotionalState,
    val strategy: EmotionalFeedbackStrategy,
    val colorModifications: ColorModifications,
    val avatarResponse: AvatarResponse,
    val uiAnimations: List<UIAnimation>,
    val ambientEffects: List<AmbientEffect>
)

/**
 * Color modifications to apply to the UI.
 */
data class ColorModifications(
    val accentColor: String,
    val secondaryColor: String,
    val saturationAdjustment: Double,
    val brightnessAdjustment: Double,
    val contrastAdjustment: Double
)

/**
 * Avatar response to emotional state.
 */
data class AvatarResponse(
    val expression: AvatarExpression,
    val animation: String
)

/**
 * Animation to apply to UI elements.
 */
data class UIAnimation(
    val type: UIAnimationType,
    val parameters: Map<String, Any>
)

/**
 * Types of UI animations.
 */
enum class UIAnimationType {
    ELEMENT_PULSE,
    COLOR_TRANSITION,
    GENTLE_FLOAT,
    SOFT_GLOW,
    SLOW_BREATHE,
    GROUNDING_FRAME,
    SUBTLE_HIGHLIGHT
}

/**
 * Ambient effect to apply to the UI background.
 */
data class AmbientEffect(
    val type: AmbientEffectType,
    val parameters: Map<String, Any>
)

/**
 * Types of ambient effects.
 */
enum class AmbientEffectType {
    PARTICLE_BURST,
    GENTLE_WAVES,
    WARM_GLOW,
    SLOW_PULSE,
    SUBTLE_BACKGROUND
}

/**
 * Helper class for color pairs.
 */
data class ColorPair(
    val primary: String,
    val secondary: String
)

/**
 * Tracks effectiveness of feedback strategies.
 */
data class FeedbackEffectivenessEntry(
    val strategy: EmotionalFeedbackStrategy,
    val effectiveScore: Double,
    val subsequentEmotion: Emotion?
)

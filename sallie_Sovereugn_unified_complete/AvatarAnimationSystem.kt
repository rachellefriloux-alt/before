package com.sallie.ui.visual.animation

import com.sallie.core.emotion.EmotionState
import com.sallie.core.context.InteractionContext
import com.sallie.core.values.ValuesSystem
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow

/**
 * AvatarAnimationSystem provides advanced animation capabilities for Sallie's avatar,
 * allowing expressive movements based on emotional context, interaction state, and current activity.
 * The system supports smooth transitions between states and can adapt animations based on user feedback.
 */
class AvatarAnimationSystem(
    private val valuesSystem: ValuesSystem
) {
    // Animation state flow that UI components can observe
    private val _animationState = MutableStateFlow<AnimationState>(AnimationState.Neutral())
    val animationState: Flow<AnimationState> = _animationState

    // Tracks current emotion to provide appropriate transitions
    private var currentEmotion: EmotionState = EmotionState.NEUTRAL
    
    // Animation settings that can be adjusted based on user preferences
    private val settings = AnimationSettings(
        transitionSpeed = 0.75f, // 0.0-1.0 scale
        expressiveness = 0.8f,   // 0.0-1.0 scale
        subtlety = 0.7f         // 0.0-1.0 scale
    )

    /**
     * Updates the avatar animation based on the new emotion state and interaction context
     */
    fun updateAnimation(newEmotion: EmotionState, context: InteractionContext) {
        // Ensure animations respect core values
        if (!valuesSystem.isEmotionAllowed(newEmotion, context)) {
            // Use a more appropriate fallback emotion
            val adjustedEmotion = valuesSystem.getSuggestedAlternativeEmotion(newEmotion, context)
            applyAnimationTransition(currentEmotion, adjustedEmotion, context)
            currentEmotion = adjustedEmotion
            return
        }

        applyAnimationTransition(currentEmotion, newEmotion, context)
        currentEmotion = newEmotion
    }

    /**
     * Creates a smooth transition between emotion states
     */
    private fun applyAnimationTransition(fromEmotion: EmotionState, toEmotion: EmotionState, context: InteractionContext) {
        // Calculate appropriate transition parameters
        val transitionDuration = calculateTransitionDuration(fromEmotion, toEmotion)
        val transitionType = determineTransitionType(fromEmotion, toEmotion, context)
        
        // Create the animation sequence
        val animationSequence = when (toEmotion) {
            EmotionState.HAPPY -> createHappyAnimation(context, transitionType)
            EmotionState.SAD -> createSadAnimation(context, transitionType)
            EmotionState.EXCITED -> createExcitedAnimation(context, transitionType)
            EmotionState.CALM -> createCalmAnimation(context, transitionType)
            EmotionState.FOCUSED -> createFocusedAnimation(context, transitionType)
            EmotionState.PROTECTIVE -> createProtectiveAnimation(context, transitionType)
            EmotionState.EMPATHETIC -> createEmpatheticAnimation(context, transitionType)
            else -> createNeutralAnimation(context, transitionType)
        }
        
        // Apply the new animation state
        _animationState.value = animationSequence
    }

    /**
     * Calculate appropriate transition duration based on emotional distance
     */
    private fun calculateTransitionDuration(fromEmotion: EmotionState, toEmotion: EmotionState): Float {
        // Emotional distance determines transition time (larger changes take longer)
        val emotionalDistance = calculateEmotionalDistance(fromEmotion, toEmotion)
        return BASE_TRANSITION_DURATION * emotionalDistance * settings.transitionSpeed
    }

    /**
     * Determines the appropriate transition type based on context and emotion change
     */
    private fun determineTransitionType(
        fromEmotion: EmotionState, 
        toEmotion: EmotionState,
        context: InteractionContext
    ): TransitionType {
        return when {
            // Urgent situations require quick transitions
            context.urgency > 0.8f -> TransitionType.QUICK
            
            // Significant emotional shifts use dissolve transitions
            calculateEmotionalDistance(fromEmotion, toEmotion) > 0.7f -> TransitionType.DISSOLVE
            
            // Subtle emotional changes use morphing
            calculateEmotionalDistance(fromEmotion, toEmotion) < 0.3f -> TransitionType.MORPH
            
            // Default to smooth transitions
            else -> TransitionType.SMOOTH
        }
    }

    /**
     * Calculates the "distance" between two emotions for transition purposes
     */
    private fun calculateEmotionalDistance(from: EmotionState, to: EmotionState): Float {
        // Emotional mapping to 2D space for distance calculation
        val emotionCoordinates = mapOf(
            EmotionState.NEUTRAL to Pair(0.5f, 0.5f),
            EmotionState.HAPPY to Pair(0.8f, 0.8f),
            EmotionState.SAD to Pair(0.2f, 0.2f),
            EmotionState.EXCITED to Pair(1.0f, 0.7f),
            EmotionState.CALM to Pair(0.3f, 0.7f),
            EmotionState.FOCUSED to Pair(0.6f, 0.4f),
            EmotionState.PROTECTIVE to Pair(0.7f, 0.3f),
            EmotionState.EMPATHETIC to Pair(0.4f, 0.8f)
        )
        
        val fromCoord = emotionCoordinates[from] ?: emotionCoordinates[EmotionState.NEUTRAL]!!
        val toCoord = emotionCoordinates[to] ?: emotionCoordinates[EmotionState.NEUTRAL]!!
        
        // Calculate Euclidean distance in emotion space
        val xDist = fromCoord.first - toCoord.first
        val yDist = fromCoord.second - toCoord.second
        return kotlin.math.sqrt(xDist * xDist + yDist * yDist)
    }

    // Animation creation methods for different emotions
    
    private fun createHappyAnimation(context: InteractionContext, transitionType: TransitionType): AnimationState {
        return AnimationState.Happy(
            intensity = calculateIntensity(EmotionState.HAPPY, context),
            eyeExpression = EyeExpression.SMILING,
            mouthExpression = MouthExpression.WIDE_SMILE,
            bodyPose = BodyPose.UPRIGHT_OPEN,
            transitionType = transitionType
        )
    }
    
    private fun createSadAnimation(context: InteractionContext, transitionType: TransitionType): AnimationState {
        return AnimationState.Sad(
            intensity = calculateIntensity(EmotionState.SAD, context),
            eyeExpression = EyeExpression.DOWNCAST,
            mouthExpression = MouthExpression.SLIGHT_FROWN,
            bodyPose = BodyPose.SLOUCHED,
            transitionType = transitionType
        )
    }
    
    private fun createExcitedAnimation(context: InteractionContext, transitionType: TransitionType): AnimationState {
        return AnimationState.Excited(
            intensity = calculateIntensity(EmotionState.EXCITED, context),
            eyeExpression = EyeExpression.WIDE_OPEN,
            mouthExpression = MouthExpression.OPEN_SMILE,
            bodyPose = BodyPose.ENERGETIC,
            transitionType = transitionType
        )
    }
    
    private fun createCalmAnimation(context: InteractionContext, transitionType: TransitionType): AnimationState {
        return AnimationState.Calm(
            intensity = calculateIntensity(EmotionState.CALM, context),
            eyeExpression = EyeExpression.RELAXED,
            mouthExpression = MouthExpression.GENTLE_SMILE,
            bodyPose = BodyPose.RELAXED,
            transitionType = transitionType
        )
    }
    
    private fun createFocusedAnimation(context: InteractionContext, transitionType: TransitionType): AnimationState {
        return AnimationState.Focused(
            intensity = calculateIntensity(EmotionState.FOCUSED, context),
            eyeExpression = EyeExpression.CONCENTRATED,
            mouthExpression = MouthExpression.NEUTRAL,
            bodyPose = BodyPose.ATTENTIVE,
            transitionType = transitionType
        )
    }
    
    private fun createProtectiveAnimation(context: InteractionContext, transitionType: TransitionType): AnimationState {
        return AnimationState.Protective(
            intensity = calculateIntensity(EmotionState.PROTECTIVE, context),
            eyeExpression = EyeExpression.ALERT,
            mouthExpression = MouthExpression.FIRM,
            bodyPose = BodyPose.PROTECTIVE,
            transitionType = transitionType
        )
    }
    
    private fun createEmpatheticAnimation(context: InteractionContext, transitionType: TransitionType): AnimationState {
        return AnimationState.Empathetic(
            intensity = calculateIntensity(EmotionState.EMPATHETIC, context),
            eyeExpression = EyeExpression.WARM,
            mouthExpression = MouthExpression.COMPASSIONATE,
            bodyPose = BodyPose.OPEN_RECEPTIVE,
            transitionType = transitionType
        )
    }
    
    private fun createNeutralAnimation(context: InteractionContext, transitionType: TransitionType): AnimationState {
        return AnimationState.Neutral(
            intensity = 0.5f,
            eyeExpression = EyeExpression.NEUTRAL,
            mouthExpression = MouthExpression.NEUTRAL,
            bodyPose = BodyPose.NEUTRAL,
            transitionType = transitionType
        )
    }
    
    /**
     * Calculate the appropriate intensity of an emotion based on context
     */
    private fun calculateIntensity(emotion: EmotionState, context: InteractionContext): Float {
        // Base intensity from context intensity
        var intensity = context.intensity * settings.expressiveness
        
        // Adjust based on mood
        intensity *= when (context.userMood) {
            // Amplify matching emotions
            emotion -> 1.2f
            
            // Dampen opposing emotions
            getOpposingEmotion(emotion) -> 0.8f
            
            // No effect for other emotions
            else -> 1.0f
        }
        
        // Ensure intensity stays within bounds
        return intensity.coerceIn(0.1f, 1.0f)
    }
    
    /**
     * Gets the opposing emotion for a given emotion
     */
    private fun getOpposingEmotion(emotion: EmotionState): EmotionState {
        return when (emotion) {
            EmotionState.HAPPY -> EmotionState.SAD
            EmotionState.SAD -> EmotionState.HAPPY
            EmotionState.EXCITED -> EmotionState.CALM
            EmotionState.CALM -> EmotionState.EXCITED
            EmotionState.FOCUSED -> EmotionState.DISTRACTED
            EmotionState.PROTECTIVE -> EmotionState.VULNERABLE
            EmotionState.EMPATHETIC -> EmotionState.DETACHED
            else -> EmotionState.NEUTRAL
        }
    }
    
    /**
     * Update animation settings based on user preferences
     */
    fun updateSettings(newSettings: AnimationSettings) {
        settings.apply {
            transitionSpeed = newSettings.transitionSpeed.coerceIn(0.1f, 1.0f)
            expressiveness = newSettings.expressiveness.coerceIn(0.1f, 1.0f)
            subtlety = newSettings.subtlety.coerceIn(0.1f, 1.0f)
        }
    }
    
    /**
     * Get a copy of the current animation settings
     */
    fun getSettings(): AnimationSettings {
        return AnimationSettings(
            transitionSpeed = settings.transitionSpeed,
            expressiveness = settings.expressiveness,
            subtlety = settings.subtlety
        )
    }
    
    /**
     * Calculates the "distance" between two emotions for transition purposes
     * Made internal for testing
     */
    internal fun calculateEmotionalDistance(from: EmotionState, to: EmotionState): Float {
        // Emotional mapping to 2D space for distance calculation
        val emotionCoordinates = mapOf(
            EmotionState.NEUTRAL to Pair(0.5f, 0.5f),
            EmotionState.HAPPY to Pair(0.8f, 0.8f),
            EmotionState.SAD to Pair(0.2f, 0.2f),
            EmotionState.EXCITED to Pair(1.0f, 0.7f),
            EmotionState.CALM to Pair(0.3f, 0.7f),
            EmotionState.FOCUSED to Pair(0.6f, 0.4f),
            EmotionState.PROTECTIVE to Pair(0.7f, 0.3f),
            EmotionState.EMPATHETIC to Pair(0.4f, 0.8f)
        )
        
        val fromCoord = emotionCoordinates[from] ?: emotionCoordinates[EmotionState.NEUTRAL]!!
        val toCoord = emotionCoordinates[to] ?: emotionCoordinates[EmotionState.NEUTRAL]!!
        
        // Calculate Euclidean distance in emotion space
        val xDist = fromCoord.first - toCoord.first
        val yDist = fromCoord.second - toCoord.second
        return kotlin.math.sqrt(xDist * xDist + yDist * yDist)
    }
    
    companion object {
        private const val BASE_TRANSITION_DURATION = 0.75f // in seconds
    }
}

/**
 * Animation settings that control how the animations are rendered
 */
data class AnimationSettings(
    var transitionSpeed: Float, // 0.0-1.0 scale
    var expressiveness: Float,  // 0.0-1.0 scale
    var subtlety: Float         // 0.0-1.0 scale
)

/**
 * Types of transitions between animation states
 */
enum class TransitionType {
    SMOOTH,  // Gradual smooth transition
    QUICK,   // Faster transition for urgent situations
    MORPH,   // Morphing transition for related emotions
    DISSOLVE // Dissolve transition for contrasting emotions
}

/**
 * Expressions for the avatar's eyes
 */
enum class EyeExpression {
    NEUTRAL,
    SMILING,
    DOWNCAST,
    WIDE_OPEN,
    RELAXED,
    CONCENTRATED,
    ALERT,
    WARM
}

/**
 * Expressions for the avatar's mouth
 */
enum class MouthExpression {
    NEUTRAL,
    WIDE_SMILE,
    SLIGHT_FROWN,
    OPEN_SMILE,
    GENTLE_SMILE,
    FIRM,
    COMPASSIONATE
}

/**
 * Body poses for the avatar
 */
enum class BodyPose {
    NEUTRAL,
    UPRIGHT_OPEN,
    SLOUCHED,
    ENERGETIC,
    RELAXED,
    ATTENTIVE,
    PROTECTIVE,
    OPEN_RECEPTIVE
}

/**
 * Sealed class representing different animation states
 */
sealed class AnimationState {
    abstract val intensity: Float
    abstract val eyeExpression: EyeExpression
    abstract val mouthExpression: MouthExpression
    abstract val bodyPose: BodyPose
    abstract val transitionType: TransitionType
    
    data class Neutral(
        override val intensity: Float = 0.5f,
        override val eyeExpression: EyeExpression = EyeExpression.NEUTRAL,
        override val mouthExpression: MouthExpression = MouthExpression.NEUTRAL,
        override val bodyPose: BodyPose = BodyPose.NEUTRAL,
        override val transitionType: TransitionType = TransitionType.SMOOTH
    ) : AnimationState()
    
    data class Happy(
        override val intensity: Float,
        override val eyeExpression: EyeExpression,
        override val mouthExpression: MouthExpression,
        override val bodyPose: BodyPose,
        override val transitionType: TransitionType
    ) : AnimationState()
    
    data class Sad(
        override val intensity: Float,
        override val eyeExpression: EyeExpression,
        override val mouthExpression: MouthExpression,
        override val bodyPose: BodyPose,
        override val transitionType: TransitionType
    ) : AnimationState()
    
    data class Excited(
        override val intensity: Float,
        override val eyeExpression: EyeExpression,
        override val mouthExpression: MouthExpression,
        override val bodyPose: BodyPose,
        override val transitionType: TransitionType
    ) : AnimationState()
    
    data class Calm(
        override val intensity: Float,
        override val eyeExpression: EyeExpression,
        override val mouthExpression: MouthExpression,
        override val bodyPose: BodyPose,
        override val transitionType: TransitionType
    ) : AnimationState()
    
    data class Focused(
        override val intensity: Float,
        override val eyeExpression: EyeExpression,
        override val mouthExpression: MouthExpression,
        override val bodyPose: BodyPose,
        override val transitionType: TransitionType
    ) : AnimationState()
    
    data class Protective(
        override val intensity: Float,
        override val eyeExpression: EyeExpression,
        override val mouthExpression: MouthExpression,
        override val bodyPose: BodyPose,
        override val transitionType: TransitionType
    ) : AnimationState()
    
    data class Empathetic(
        override val intensity: Float,
        override val eyeExpression: EyeExpression,
        override val mouthExpression: MouthExpression,
        override val bodyPose: BodyPose,
        override val transitionType: TransitionType
    ) : AnimationState()
}

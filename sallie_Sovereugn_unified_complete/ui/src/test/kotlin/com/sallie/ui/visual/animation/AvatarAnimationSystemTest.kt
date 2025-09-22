package com.sallie.ui.visual.animation

import com.sallie.core.emotion.EmotionState
import com.sallie.core.context.InteractionContext
import com.sallie.core.values.ValuesSystem
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import org.junit.Before
import org.junit.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever

class AvatarAnimationSystemTest {

    private lateinit var valuesSystem: ValuesSystem
    private lateinit var animationSystem: AvatarAnimationSystem

    @Before
    fun setUp() {
        valuesSystem = mock()
        animationSystem = AvatarAnimationSystem(valuesSystem)
    }

    @Test
    fun `updateAnimation should respect values system restrictions`() = runBlocking {
        // Given
        val newEmotion = EmotionState.EXCITED
        val context = InteractionContext(intensity = 0.8f, urgency = 0.3f, userMood = EmotionState.HAPPY)
        val alternativeEmotion = EmotionState.HAPPY
        
        // When
        whenever(valuesSystem.isEmotionAllowed(newEmotion, context)).thenReturn(false)
        whenever(valuesSystem.getSuggestedAlternativeEmotion(newEmotion, context)).thenReturn(alternativeEmotion)
        
        // Then
        animationSystem.updateAnimation(newEmotion, context)
        
        // Verify values system was consulted
        verify(valuesSystem).isEmotionAllowed(newEmotion, context)
        verify(valuesSystem).getSuggestedAlternativeEmotion(newEmotion, context)
        
        // Verify the animation state was updated with the alternative emotion
        val currentState = animationSystem.animationState.first()
        assert(currentState is AnimationState.Happy)
    }

    @Test
    fun `updateAnimation should apply direct emotion when allowed`() = runBlocking {
        // Given
        val newEmotion = EmotionState.CALM
        val context = InteractionContext(intensity = 0.6f, urgency = 0.2f, userMood = EmotionState.NEUTRAL)
        
        // When
        whenever(valuesSystem.isEmotionAllowed(newEmotion, context)).thenReturn(true)
        
        // Then
        animationSystem.updateAnimation(newEmotion, context)
        
        // Verify the animation state was updated with the original emotion
        val currentState = animationSystem.animationState.first()
        assert(currentState is AnimationState.Calm)
    }

    @Test
    fun `emotional distance calculation should be consistent`() {
        // Calculate distance between HAPPY and SAD (should be relatively large)
        val happySadDistance = animationSystem.calculateEmotionalDistance(
            EmotionState.HAPPY, 
            EmotionState.SAD
        )
        
        // Calculate distance between HAPPY and EXCITED (should be smaller)
        val happyExcitedDistance = animationSystem.calculateEmotionalDistance(
            EmotionState.HAPPY, 
            EmotionState.EXCITED
        )
        
        // Calculate distance between NEUTRAL and any emotion (should be moderate)
        val neutralHappyDistance = animationSystem.calculateEmotionalDistance(
            EmotionState.NEUTRAL, 
            EmotionState.HAPPY
        )
        
        // Assert expected relative distances
        assert(happySadDistance > happyExcitedDistance)
        assert(happySadDistance > neutralHappyDistance)
        assert(neutralHappyDistance > 0.2f) // Should be a meaningful distance
    }

    @Test
    fun `animation settings should be properly constrained`() {
        // Given
        val extremeSettings = AnimationSettings(
            transitionSpeed = 2.0f,  // Beyond max of 1.0
            expressiveness = -0.5f,  // Below min of 0.1
            subtlety = 1.5f          // Beyond max of 1.0
        )
        
        // When
        animationSystem.updateSettings(extremeSettings)
        
        // Then
        // Values should be constrained to allowed ranges
        assert(animationSystem.getSettings().transitionSpeed <= 1.0f)
        assert(animationSystem.getSettings().transitionSpeed >= 0.1f)
        assert(animationSystem.getSettings().expressiveness <= 1.0f)
        assert(animationSystem.getSettings().expressiveness >= 0.1f)
        assert(animationSystem.getSettings().subtlety <= 1.0f)
        assert(animationSystem.getSettings().subtlety >= 0.1f)
    }
}

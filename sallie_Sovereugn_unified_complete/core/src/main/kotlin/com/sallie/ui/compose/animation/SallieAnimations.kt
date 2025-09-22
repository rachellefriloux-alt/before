/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * SallieAnimations - Animation utilities for Sallie UI
 */

package com.sallie.ui.compose.animation

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.AnimatedVisibilityScope
import androidx.compose.animation.EnterTransition
import androidx.compose.animation.ExitTransition
import androidx.compose.animation.core.CubicBezierEasing
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.VisibilityThreshold
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.animation.expandIn
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
import androidx.compose.animation.scaleOut
import androidx.compose.animation.shrinkOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.animation.slideOutVertically
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.unit.IntOffset
import com.sallie.ui.compose.theme.AnimationSpeed
import com.sallie.ui.compose.theme.EmotionalState
import com.sallie.ui.compose.theme.LocalAnimationSpeed

/**
 * Animation durations based on animation speed setting
 */
object SallieAnimationDurations {
    fun short(animationSpeed: AnimationSpeed): Int = when(animationSpeed) {
        AnimationSpeed.NORMAL -> 300
        AnimationSpeed.SLOW -> 500
        AnimationSpeed.FAST -> 150
        AnimationSpeed.NONE -> 0
    }
    
    fun medium(animationSpeed: AnimationSpeed): Int = when(animationSpeed) {
        AnimationSpeed.NORMAL -> 500
        AnimationSpeed.SLOW -> 800
        AnimationSpeed.FAST -> 250
        AnimationSpeed.NONE -> 0
    }
    
    fun long(animationSpeed: AnimationSpeed): Int = when(animationSpeed) {
        AnimationSpeed.NORMAL -> 800
        AnimationSpeed.SLOW -> 1200
        AnimationSpeed.FAST -> 400
        AnimationSpeed.NONE -> 0
    }
}

/**
 * Standard animation presets for Sallie UI
 */
object SallieAnimations {
    /**
     * Get enter transition based on animation speed and emotional state
     */
    @Composable
    fun enterTransition(
        emotionalState: EmotionalState = EmotionalState.Neutral,
        animationSpeed: AnimationSpeed = LocalAnimationSpeed.current
    ): EnterTransition {
        // Skip animations if animation speed is NONE
        if (animationSpeed == AnimationSpeed.NONE) {
            return EnterTransition.None
        }
        
        val duration = SallieAnimationDurations.medium(animationSpeed)
        
        return when(emotionalState) {
            EmotionalState.Neutral -> fadeIn(tween(duration)) + 
                expandIn(tween(duration), expandFrom = Alignment.Center)
                
            EmotionalState.Happy -> fadeIn(tween(duration)) + 
                scaleIn(tween(duration, easing = CubicBezierEasing(0.2f, 0f, 0.2f, 1f)))
                
            EmotionalState.Calm -> fadeIn(tween(duration + 100)) + 
                expandVertically(tween(duration + 100))
                
            EmotionalState.Concerned -> fadeIn(tween(duration)) + 
                slideInVertically(tween(duration)) { it / 2 }
                
            EmotionalState.Excited -> fadeIn(tween(duration - 100)) + 
                scaleIn(tween(duration - 100), initialScale = 1.1f)
                
            EmotionalState.Focused -> fadeIn(tween(duration)) + 
                slideInHorizontally(tween(duration)) { it / 4 }
        }
    }
    
    /**
     * Get exit transition based on animation speed and emotional state
     */
    @Composable
    fun exitTransition(
        emotionalState: EmotionalState = EmotionalState.Neutral,
        animationSpeed: AnimationSpeed = LocalAnimationSpeed.current
    ): ExitTransition {
        // Skip animations if animation speed is NONE
        if (animationSpeed == AnimationSpeed.NONE) {
            return ExitTransition.None
        }
        
        val duration = SallieAnimationDurations.medium(animationSpeed)
        
        return when(emotionalState) {
            EmotionalState.Neutral -> fadeOut(tween(duration)) + 
                shrinkOut(tween(duration), shrinkTowards = Alignment.Center)
                
            EmotionalState.Happy -> fadeOut(tween(duration)) + 
                scaleOut(tween(duration, easing = CubicBezierEasing(0.2f, 0f, 0.2f, 1f)))
                
            EmotionalState.Calm -> fadeOut(tween(duration + 100)) + 
                shrinkVertically(tween(duration + 100))
                
            EmotionalState.Concerned -> fadeOut(tween(duration)) + 
                slideOutVertically(tween(duration)) { it / 2 }
                
            EmotionalState.Excited -> fadeOut(tween(duration - 100)) + 
                scaleOut(tween(duration - 100), targetScale = 1.1f)
                
            EmotionalState.Focused -> fadeOut(tween(duration)) + 
                slideOutHorizontally(tween(duration)) { it / 4 }
        }
    }
}

/**
 * AnimatedVisibility composable that uses Sallie's animation system
 * 
 * @param visible Whether the content should be visible
 * @param emotionalState Emotional state to base animations on
 * @param content Content to be animated
 */
@Composable
fun SallieAnimatedVisibility(
    visible: Boolean,
    emotionalState: EmotionalState = EmotionalState.Neutral,
    content: @Composable AnimatedVisibilityScope.() -> Unit
) {
    val animationSpeed = LocalAnimationSpeed.current
    val enterTransition = remember(emotionalState, animationSpeed) {
        SallieAnimations.enterTransition(emotionalState, animationSpeed)
    }
    val exitTransition = remember(emotionalState, animationSpeed) {
        SallieAnimations.exitTransition(emotionalState, animationSpeed)
    }
    
    AnimatedVisibility(
        visible = visible,
        enter = enterTransition,
        exit = exitTransition,
        content = content
    )
}

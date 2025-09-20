/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * SallieButton - Button components for Sallie UI
 */

package com.sallie.ui.compose.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ElevatedButton
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.sallie.ui.compose.theme.AnimationSpeed
import com.sallie.ui.compose.theme.EmotionalState
import com.sallie.ui.compose.theme.LocalAccessibilityLevel
import com.sallie.ui.compose.theme.LocalAnimationSpeed
import com.sallie.ui.compose.theme.LocalEmotionalPalette
import com.sallie.ui.compose.theme.SallieDimensions
import com.sallie.ui.compose.theme.AccessibilityLevel

/**
 * Primary button styled according to Sallie's design system
 * Responds to emotional state with subtle color adjustments
 * 
 * @param onClick Click handler
 * @param modifier Modifier for the button
 * @param emotionalState Optional emotional state override
 * @param enabled Whether the button is enabled
 * @param text Button text
 */
@Composable
fun SalliePrimaryButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    emotionalState: EmotionalState? = null,
    enabled: Boolean = true,
    text: String
) {
    val emotionalPalette = LocalEmotionalPalette.current
    val animationSpeed = LocalAnimationSpeed.current
    val currentEmotionalState = emotionalState ?: EmotionalState.Neutral
    val accessibility = LocalAccessibilityLevel.current
    
    // Calculate animation duration based on speed setting
    val animationDuration = remember(animationSpeed) {
        when (animationSpeed) {
            AnimationSpeed.NORMAL -> 300
            AnimationSpeed.SLOW -> 500
            AnimationSpeed.FAST -> 150
            AnimationSpeed.NONE -> 0
        }
    }
    
    // Color animation for emotional state
    val containerColor by animateColorAsState(
        targetValue = emotionalPalette.primary,
        animationSpec = tween(durationMillis = animationDuration),
        label = "ButtonColor"
    )
    
    // Size adjustments for accessibility
    val contentPadding = remember(accessibility) {
        when (accessibility) {
            AccessibilityLevel.HIGH_CONTRAST -> PaddingValues(horizontal = 20.dp, vertical = 12.dp)
            AccessibilityLevel.STANDARD -> PaddingValues(horizontal = 16.dp, vertical = 8.dp)
            AccessibilityLevel.REDUCED_MOTION -> PaddingValues(horizontal = 16.dp, vertical = 8.dp)
        }
    }
    
    Button(
        onClick = onClick,
        modifier = modifier.defaultMinSize(
            minWidth = SallieDimensions.button_height_medium * 2,
            minHeight = if (accessibility == AccessibilityLevel.HIGH_CONTRAST) 
                SallieDimensions.button_height_large else SallieDimensions.button_height_medium
        ),
        enabled = enabled,
        colors = ButtonDefaults.buttonColors(
            containerColor = containerColor,
            contentColor = Color.White
        ),
        contentPadding = contentPadding
    ) {
        Text(text = text)
    }
}

/**
 * Secondary button styled according to Sallie's design system
 * 
 * @param onClick Click handler
 * @param modifier Modifier for the button
 * @param emotionalState Optional emotional state override
 * @param enabled Whether the button is enabled
 * @param text Button text
 */
@Composable
fun SallieSecondaryButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    emotionalState: EmotionalState? = null,
    enabled: Boolean = true,
    text: String
) {
    val emotionalPalette = LocalEmotionalPalette.current
    val animationSpeed = LocalAnimationSpeed.current
    val currentEmotionalState = emotionalState ?: EmotionalState.Neutral
    val accessibility = LocalAccessibilityLevel.current
    
    // Calculate animation duration based on speed setting
    val animationDuration = remember(animationSpeed) {
        when (animationSpeed) {
            AnimationSpeed.NORMAL -> 300
            AnimationSpeed.SLOW -> 500
            AnimationSpeed.FAST -> 150
            AnimationSpeed.NONE -> 0
        }
    }
    
    // Color animation for emotional state
    val containerColor by animateColorAsState(
        targetValue = emotionalPalette.secondary,
        animationSpec = tween(durationMillis = animationDuration),
        label = "ButtonColor"
    )
    
    // Size adjustments for accessibility
    val contentPadding = remember(accessibility) {
        when (accessibility) {
            AccessibilityLevel.HIGH_CONTRAST -> PaddingValues(horizontal = 20.dp, vertical = 12.dp)
            AccessibilityLevel.STANDARD -> PaddingValues(horizontal = 16.dp, vertical = 8.dp)
            AccessibilityLevel.REDUCED_MOTION -> PaddingValues(horizontal = 16.dp, vertical = 8.dp)
        }
    }
    
    FilledTonalButton(
        onClick = onClick,
        modifier = modifier.defaultMinSize(
            minWidth = SallieDimensions.button_height_medium * 2,
            minHeight = if (accessibility == AccessibilityLevel.HIGH_CONTRAST) 
                SallieDimensions.button_height_large else SallieDimensions.button_height_medium
        ),
        enabled = enabled,
        colors = ButtonDefaults.filledTonalButtonColors(
            containerColor = containerColor,
            contentColor = MaterialTheme.colorScheme.onSecondaryContainer
        ),
        contentPadding = contentPadding
    ) {
        Text(text = text)
    }
}

/**
 * Tertiary (text) button styled according to Sallie's design system
 * 
 * @param onClick Click handler
 * @param modifier Modifier for the button
 * @param emotionalState Optional emotional state override
 * @param enabled Whether the button is enabled
 * @param text Button text
 */
@Composable
fun SallieTertiaryButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    emotionalState: EmotionalState? = null,
    enabled: Boolean = true,
    text: String
) {
    val emotionalPalette = LocalEmotionalPalette.current
    val animationSpeed = LocalAnimationSpeed.current
    val currentEmotionalState = emotionalState ?: EmotionalState.Neutral
    val accessibility = LocalAccessibilityLevel.current
    
    // Calculate animation duration based on speed setting
    val animationDuration = remember(animationSpeed) {
        when (animationSpeed) {
            AnimationSpeed.NORMAL -> 300
            AnimationSpeed.SLOW -> 500
            AnimationSpeed.FAST -> 150
            AnimationSpeed.NONE -> 0
        }
    }
    
    // Color animation for emotional state
    val contentColor by animateColorAsState(
        targetValue = emotionalPalette.accent,
        animationSpec = tween(durationMillis = animationDuration),
        label = "ButtonColor"
    )
    
    // Size adjustments for accessibility
    val contentPadding = remember(accessibility) {
        when (accessibility) {
            AccessibilityLevel.HIGH_CONTRAST -> PaddingValues(horizontal = 16.dp, vertical = 10.dp)
            AccessibilityLevel.STANDARD -> PaddingValues(horizontal = 12.dp, vertical = 6.dp)
            AccessibilityLevel.REDUCED_MOTION -> PaddingValues(horizontal = 12.dp, vertical = 6.dp)
        }
    }
    
    TextButton(
        onClick = onClick,
        modifier = modifier.defaultMinSize(
            minWidth = SallieDimensions.button_height_medium * 1.5f,
            minHeight = if (accessibility == AccessibilityLevel.HIGH_CONTRAST) 
                SallieDimensions.button_height_medium else SallieDimensions.button_height_small
        ),
        enabled = enabled,
        colors = ButtonDefaults.textButtonColors(
            contentColor = contentColor
        ),
        contentPadding = contentPadding
    ) {
        Text(text = text)
    }
}

/**
 * Outlined button styled according to Sallie's design system
 * 
 * @param onClick Click handler
 * @param modifier Modifier for the button
 * @param emotionalState Optional emotional state override
 * @param enabled Whether the button is enabled
 * @param text Button text
 */
@Composable
fun SallieOutlinedButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    emotionalState: EmotionalState? = null,
    enabled: Boolean = true,
    text: String
) {
    val emotionalPalette = LocalEmotionalPalette.current
    val animationSpeed = LocalAnimationSpeed.current
    val currentEmotionalState = emotionalState ?: EmotionalState.Neutral
    val accessibility = LocalAccessibilityLevel.current
    
    // Calculate animation duration based on speed setting
    val animationDuration = remember(animationSpeed) {
        when (animationSpeed) {
            AnimationSpeed.NORMAL -> 300
            AnimationSpeed.SLOW -> 500
            AnimationSpeed.FAST -> 150
            AnimationSpeed.NONE -> 0
        }
    }
    
    // Color animation for emotional state
    val contentColor by animateColorAsState(
        targetValue = emotionalPalette.primary,
        animationSpec = tween(durationMillis = animationDuration),
        label = "ButtonColor"
    )
    
    // Size adjustments for accessibility
    val contentPadding = remember(accessibility) {
        when (accessibility) {
            AccessibilityLevel.HIGH_CONTRAST -> PaddingValues(horizontal = 20.dp, vertical = 12.dp)
            AccessibilityLevel.STANDARD -> PaddingValues(horizontal = 16.dp, vertical = 8.dp)
            AccessibilityLevel.REDUCED_MOTION -> PaddingValues(horizontal = 16.dp, vertical = 8.dp)
        }
    }
    
    OutlinedButton(
        onClick = onClick,
        modifier = modifier.defaultMinSize(
            minWidth = SallieDimensions.button_height_medium * 2,
            minHeight = if (accessibility == AccessibilityLevel.HIGH_CONTRAST) 
                SallieDimensions.button_height_large else SallieDimensions.button_height_medium
        ),
        enabled = enabled,
        colors = ButtonDefaults.outlinedButtonColors(
            contentColor = contentColor
        ),
        contentPadding = contentPadding
    ) {
        Text(text = text)
    }
}

/**
 * Elevated button styled according to Sallie's design system
 * 
 * @param onClick Click handler
 * @param modifier Modifier for the button
 * @param emotionalState Optional emotional state override
 * @param enabled Whether the button is enabled
 * @param text Button text
 */
@Composable
fun SallieElevatedButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    emotionalState: EmotionalState? = null,
    enabled: Boolean = true,
    text: String
) {
    val emotionalPalette = LocalEmotionalPalette.current
    val animationSpeed = LocalAnimationSpeed.current
    val currentEmotionalState = emotionalState ?: EmotionalState.Neutral
    val accessibility = LocalAccessibilityLevel.current
    
    // Calculate animation duration based on speed setting
    val animationDuration = remember(animationSpeed) {
        when (animationSpeed) {
            AnimationSpeed.NORMAL -> 300
            AnimationSpeed.SLOW -> 500
            AnimationSpeed.FAST -> 150
            AnimationSpeed.NONE -> 0
        }
    }
    
    // Color animation for emotional state
    val containerColor by animateColorAsState(
        targetValue = MaterialTheme.colorScheme.surface,
        animationSpec = tween(durationMillis = animationDuration),
        label = "ButtonColor"
    )
    
    val contentColor by animateColorAsState(
        targetValue = emotionalPalette.primary,
        animationSpec = tween(durationMillis = animationDuration),
        label = "ButtonContentColor"
    )
    
    // Size adjustments for accessibility
    val contentPadding = remember(accessibility) {
        when (accessibility) {
            AccessibilityLevel.HIGH_CONTRAST -> PaddingValues(horizontal = 20.dp, vertical = 12.dp)
            AccessibilityLevel.STANDARD -> PaddingValues(horizontal = 16.dp, vertical = 8.dp)
            AccessibilityLevel.REDUCED_MOTION -> PaddingValues(horizontal = 16.dp, vertical = 8.dp)
        }
    }
    
    ElevatedButton(
        onClick = onClick,
        modifier = modifier.defaultMinSize(
            minWidth = SallieDimensions.button_height_medium * 2,
            minHeight = if (accessibility == AccessibilityLevel.HIGH_CONTRAST) 
                SallieDimensions.button_height_large else SallieDimensions.button_height_medium
        ),
        enabled = enabled,
        colors = ButtonDefaults.elevatedButtonColors(
            containerColor = containerColor,
            contentColor = contentColor
        ),
        contentPadding = contentPadding
    ) {
        Text(text = text)
    }
}

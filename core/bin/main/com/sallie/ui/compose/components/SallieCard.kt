/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * SallieCard - Card components for Sallie UI
 */

package com.sallie.ui.compose.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedCard
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.unit.dp
import com.sallie.ui.compose.theme.AnimationSpeed
import com.sallie.ui.compose.theme.EmotionalState
import com.sallie.ui.compose.theme.LocalAnimationSpeed
import com.sallie.ui.compose.theme.LocalEmotionalPalette
import com.sallie.ui.compose.theme.SallieDimensions

/**
 * Standard card component styled according to Sallie's design system
 * Subtly responds to emotional state with color accents
 * 
 * @param modifier Modifier for the card
 * @param emotionalState Optional emotional state override
 * @param content Card content
 */
@Composable
fun SallieCard(
    modifier: Modifier = Modifier,
    emotionalState: EmotionalState? = null,
    content: @Composable () -> Unit
) {
    val emotionalPalette = LocalEmotionalPalette.current
    val animationSpeed = LocalAnimationSpeed.current
    val currentEmotionalState = emotionalState ?: EmotionalState.Neutral
    
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
        label = "CardColor"
    )
    
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(
            containerColor = containerColor
        ),
        shape = MaterialTheme.shapes.medium
    ) {
        // Subtle accent bar on top reflecting emotional state
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    brush = Brush.horizontalGradient(
                        colors = listOf(
                            emotionalPalette.primary,
                            emotionalPalette.accent
                        )
                    )
                )
                .padding(2.dp)
        ) {}
        
        // Card content
        Box(modifier = Modifier.padding(SallieDimensions.spacing_16)) {
            content()
        }
    }
}

/**
 * Elevated card component with shadow
 * 
 * @param modifier Modifier for the card
 * @param emotionalState Optional emotional state override
 * @param content Card content
 */
@Composable
fun SallieElevatedCard(
    modifier: Modifier = Modifier,
    emotionalState: EmotionalState? = null,
    content: @Composable () -> Unit
) {
    val emotionalPalette = LocalEmotionalPalette.current
    val animationSpeed = LocalAnimationSpeed.current
    val currentEmotionalState = emotionalState ?: EmotionalState.Neutral
    
    // Calculate animation duration based on speed setting
    val animationDuration = remember(animationSpeed) {
        when (animationSpeed) {
            AnimationSpeed.NORMAL -> 300
            AnimationSpeed.SLOW -> 500
            AnimationSpeed.FAST -> 150
            AnimationSpeed.NONE -> 0
        }
    }
    
    // Elevation animation based on emotional state
    val elevation by animateFloatAsState(
        targetValue = when(currentEmotionalState) {
            EmotionalState.Excited -> 8f
            EmotionalState.Happy -> 6f 
            EmotionalState.Neutral -> 4f
            EmotionalState.Calm -> 2f
            EmotionalState.Concerned -> 3f
            EmotionalState.Focused -> 5f
        },
        animationSpec = tween(durationMillis = animationDuration),
        label = "CardElevation"
    )
    
    ElevatedCard(
        modifier = modifier,
        colors = CardDefaults.elevatedCardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.elevatedCardElevation(
            defaultElevation = elevation.dp
        ),
        shape = MaterialTheme.shapes.medium
    ) {
        // Subtle accent bar on top reflecting emotional state
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    brush = Brush.horizontalGradient(
                        colors = listOf(
                            emotionalPalette.primary,
                            emotionalPalette.accent
                        )
                    )
                )
                .padding(2.dp)
        ) {}
        
        // Card content
        Box(modifier = Modifier.padding(SallieDimensions.spacing_16)) {
            content()
        }
    }
}

/**
 * Outlined card component with border
 * 
 * @param modifier Modifier for the card
 * @param emotionalState Optional emotional state override
 * @param content Card content
 */
@Composable
fun SallieOutlinedCard(
    modifier: Modifier = Modifier,
    emotionalState: EmotionalState? = null,
    content: @Composable () -> Unit
) {
    val emotionalPalette = LocalEmotionalPalette.current
    val animationSpeed = LocalAnimationSpeed.current
    val currentEmotionalState = emotionalState ?: EmotionalState.Neutral
    
    // Calculate animation duration based on speed setting
    val animationDuration = remember(animationSpeed) {
        when (animationSpeed) {
            AnimationSpeed.NORMAL -> 300
            AnimationSpeed.SLOW -> 500
            AnimationSpeed.FAST -> 150
            AnimationSpeed.NONE -> 0
        }
    }
    
    // Border color based on emotional state
    val borderColor by animateColorAsState(
        targetValue = emotionalPalette.primary.copy(alpha = 0.6f),
        animationSpec = tween(durationMillis = animationDuration),
        label = "BorderColor"
    )
    
    OutlinedCard(
        modifier = modifier,
        colors = CardDefaults.outlinedCardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        border = BorderStroke(1.dp, borderColor),
        shape = MaterialTheme.shapes.medium
    ) {
        // Card content
        Box(modifier = Modifier.padding(SallieDimensions.spacing_16)) {
            content()
        }
    }
}

/**
 * Interactive card component that can be clicked
 * 
 * @param onClick Click handler
 * @param modifier Modifier for the card
 * @param emotionalState Optional emotional state override
 * @param content Card content
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SallieClickableCard(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    emotionalState: EmotionalState? = null,
    content: @Composable () -> Unit
) {
    val emotionalPalette = LocalEmotionalPalette.current
    val animationSpeed = LocalAnimationSpeed.current
    val currentEmotionalState = emotionalState ?: EmotionalState.Neutral
    
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
        label = "CardColor"
    )
    
    // Elevation animation based on emotional state
    val elevation by animateFloatAsState(
        targetValue = when(currentEmotionalState) {
            EmotionalState.Excited -> 8f
            EmotionalState.Happy -> 6f 
            EmotionalState.Neutral -> 4f
            EmotionalState.Calm -> 2f
            EmotionalState.Concerned -> 3f
            EmotionalState.Focused -> 5f
        },
        animationSpec = tween(durationMillis = animationDuration),
        label = "CardElevation"
    )
    
    Card(
        onClick = onClick,
        modifier = modifier,
        colors = CardDefaults.cardColors(
            containerColor = containerColor
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = elevation.dp,
            pressedElevation = (elevation + 2).dp,
            hoveredElevation = (elevation + 4).dp
        ),
        shape = MaterialTheme.shapes.medium
    ) {
        // Subtle accent bar on top reflecting emotional state
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    brush = Brush.horizontalGradient(
                        colors = listOf(
                            emotionalPalette.primary,
                            emotionalPalette.accent
                        )
                    )
                )
                .padding(2.dp)
        ) {}
        
        // Card content
        Box(modifier = Modifier.padding(SallieDimensions.spacing_16)) {
            content()
        }
    }
}

/**
 * Accent card with background color based on emotional state
 * 
 * @param modifier Modifier for the card
 * @param emotionalState Optional emotional state override
 * @param content Card content
 */
@Composable
fun SallieAccentCard(
    modifier: Modifier = Modifier,
    emotionalState: EmotionalState? = null,
    content: @Composable () -> Unit
) {
    val emotionalPalette = LocalEmotionalPalette.current
    val animationSpeed = LocalAnimationSpeed.current
    val currentEmotionalState = emotionalState ?: EmotionalState.Neutral
    
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
        targetValue = emotionalPalette.primary.copy(alpha = 0.1f),
        animationSpec = tween(durationMillis = animationDuration),
        label = "CardColor"
    )
    
    val borderColor by animateColorAsState(
        targetValue = emotionalPalette.primary.copy(alpha = 0.3f),
        animationSpec = tween(durationMillis = animationDuration),
        label = "BorderColor"
    )
    
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(
            containerColor = containerColor
        ),
        border = BorderStroke(1.dp, borderColor),
        shape = MaterialTheme.shapes.medium
    ) {
        // Card content
        Box(modifier = Modifier.padding(SallieDimensions.spacing_16)) {
            content()
        }
    }
}

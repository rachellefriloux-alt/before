/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * SallieTheme - Core theming for Compose UI components
 */

package com.sallie.ui.compose.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.remember
import androidx.compose.runtime.staticCompositionLocalOf

/**
 * Sallie theme provider that sets up MaterialTheme with Sallie's design language
 * and provides additional theming constructs like emotion and accessibility modifiers
 */
@Composable
fun SallieTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = true,
    emotionalState: EmotionalState = EmotionalState.Neutral,
    personaType: PersonaType = PersonaType.DEFAULT,
    accessibility: AccessibilityLevel = AccessibilityLevel.STANDARD,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        darkTheme -> DarkColorSchemes.getScheme(personaType)
        else -> LightColorSchemes.getScheme(personaType)
    }
    
    val typography = getTypography(accessibility)
    
    val emotionalPalette = remember(emotionalState, darkTheme) {
        EmotionalPalettes.getEmotionalPalette(emotionalState, darkTheme)
    }
    
    val animationSpeed = remember(accessibility) {
        when (accessibility) {
            AccessibilityLevel.REDUCED_MOTION -> AnimationSpeed.SLOW
            AccessibilityLevel.HIGH_CONTRAST -> AnimationSpeed.NORMAL
            AccessibilityLevel.STANDARD -> AnimationSpeed.NORMAL
        }
    }
    
    // Provide emotion and accessibility modifiers
    CompositionLocalProvider(
        LocalEmotionalPalette provides emotionalPalette,
        LocalAnimationSpeed provides animationSpeed,
        LocalPersonaType provides personaType,
        LocalAccessibilityLevel provides accessibility
    ) {
        MaterialTheme(
            colorScheme = colorScheme,
            typography = typography,
            shapes = SallieShapes,
            content = content
        )
    }
}

/**
 * Composition local for emotional palette
 */
val LocalEmotionalPalette = staticCompositionLocalOf<EmotionalPalette> { 
    error("No EmotionalPalette provided")
}

/**
 * Composition local for animation speed
 */
val LocalAnimationSpeed = staticCompositionLocalOf<AnimationSpeed> { 
    AnimationSpeed.NORMAL
}

/**
 * Composition local for persona type
 */
val LocalPersonaType = staticCompositionLocalOf<PersonaType> {
    PersonaType.DEFAULT
}

/**
 * Composition local for accessibility level
 */
val LocalAccessibilityLevel = staticCompositionLocalOf<AccessibilityLevel> {
    AccessibilityLevel.STANDARD
}

/**
 * Get appropriate typography based on accessibility level
 */
@Composable
private fun getTypography(accessibility: AccessibilityLevel) = when (accessibility) {
    AccessibilityLevel.STANDARD -> SallieTypography
    AccessibilityLevel.HIGH_CONTRAST -> SallieTypography.copy(
        // Increase contrast by making text slightly bolder
        bodyLarge = SallieTypography.bodyLarge.copy(fontWeight = androidx.compose.ui.text.font.FontWeight.Medium),
        bodyMedium = SallieTypography.bodyMedium.copy(fontWeight = androidx.compose.ui.text.font.FontWeight.Medium),
        bodySmall = SallieTypography.bodySmall.copy(fontWeight = androidx.compose.ui.text.font.FontWeight.Medium)
    )
    AccessibilityLevel.REDUCED_MOTION -> SallieTypography
}

# Compose UI Components

This document describes the implementation of the Compose UI Components system for Sallie 1.0.

## Overview

Sallie's Compose UI Components system provides a cohesive, emotion-responsive UI toolkit built on Jetpack Compose. This system allows Sallie to express its emotional states and persona types through subtle visual cues while maintaining accessibility and a consistent user experience.

The implementation follows these core principles:

1. **Emotion-responsive** - UI elements subtly reflect Sallie's emotional state
2. **Persona-aligned** - Theme adapts to different persona types (Default, Warm, Cool)
3. **Accessibility-first** - Full support for different accessibility needs
4. **Consistent Design Language** - Unified visual system with shared theme parameters
5. **Performance-optimized** - Efficient animations and rendering

## Directory Structure

```
/core/src/main/kotlin/com/sallie/ui/compose/
├── theme/
│   ├── SallieTheme.kt           # Main theme composable
│   ├── Color.kt                 # Color definitions
│   ├── Typography.kt            # Typography system
│   ├── Dimensions.kt            # Spacing and sizing
│   ├── SallieShapes.kt          # Shape definitions
│   ├── EmotionalPalettes.kt     # Emotion-based color palettes
│   ├── PersonaType.kt           # Persona type definitions
│   ├── AccessibilityLevel.kt    # Accessibility customization levels
│   └── AnimationSpeed.kt        # Animation speed settings
├── components/
│   ├── SallieButton.kt          # Button components
│   ├── SallieCard.kt            # Card components
│   └── SallieTextField.kt       # Text field components
├── animation/
│   └── SallieAnimations.kt      # Animation utilities
└── test/
    ├── SallieThemeTest.kt       # Theme tests
    ├── SallieComponentTest.kt   # Component tests
    └── SallieAnimationTest.kt   # Animation tests
```

## Key Features

### Emotional Expression

The UI system allows Sallie to express its current emotional state through subtle color and animation changes. Six emotional states are supported:

1. **Neutral** - Default balanced state with the standard color scheme
2. **Happy** - Brighter, warmer colors with lively animations
3. **Calm** - Cooler, softer colors with gentle animations
4. **Concerned** - More muted colors with reserved animations
5. **Excited** - Vibrant colors with energetic animations
6. **Focused** - Higher contrast colors with direct, efficient animations

Each state has its own color palette that affects UI elements such as buttons, cards, and text fields. Animations also adapt to reflect the emotional tone.

### Persona Types

Sallie supports different persona types to adapt to user preferences:

1. **DEFAULT** - Balanced persona with modern purple/gold theme
2. **WARM** - Traditional persona with warmer amber/gold colors
3. **COOL** - Modern persona with cool blue/teal colors

The persona type affects the overall color scheme, shape roundness, and subtle UI behaviors.

### Accessibility Support

The UI system prioritizes accessibility with:

1. **Multiple text sizes** - Standard and enlarged typography options
2. **High contrast mode** - Enhanced contrast for better visibility
3. **Reduced motion** - Reduced or eliminated animations
4. **Touch target sizing** - Appropriately sized interactive elements

### Component System

The implementation includes the following components:

#### Buttons
- `SalliePrimaryButton` - Main action button
- `SallieSecondaryButton` - Secondary action button
- `SallieTertiaryButton` - Text button for minor actions
- `SallieOutlinedButton` - Outlined style button
- `SallieElevatedButton` - Button with elevation

#### Cards
- `SallieCard` - Standard card
- `SallieElevatedCard` - Card with elevation
- `SallieOutlinedCard` - Card with border
- `SallieClickableCard` - Interactive card
- `SallieAccentCard` - Card with emotional accent color

#### Text Fields
- `SallieTextField` - Standard text input
- `SallieOutlinedTextField` - Outlined text input
- `SallieSearchTextField` - Text field optimized for search

#### Animations
- `SallieAnimatedVisibility` - Content visibility animations
- Animation utilities for different emotional states

## Integration with Material 3

The Sallie UI system extends Material 3 to provide a consistent design language while adding emotion-responsive elements. It uses:

- MaterialTheme as the foundation
- Extends with custom color palettes
- Adds emotional state-specific styling
- Maintains compatibility with standard Material components

## Testing

Comprehensive tests are included to ensure:
- Proper theme application
- Component rendering and interaction
- Animation behavior
- Accessibility support

## Usage Example

```kotlin
@Composable
fun SallieScreen() {
    SallieTheme(
        darkTheme = isSystemInDarkTheme(),
        emotionalState = EmotionalState.Happy,
        personaType = PersonaType.DEFAULT,
        accessibility = AccessibilityLevel.STANDARD
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            SalliePrimaryButton(
                onClick = { /* action */ },
                text = "Welcome"
            )
            
            SallieCard {
                Text("Hello! I'm Sallie, your personal AI companion.")
            }
            
            SallieOutlinedTextField(
                value = "",
                onValueChange = { /* update */ },
                label = "Tell me something"
            )
        }
    }
}
```

## Future Enhancements

Future enhancements for the UI system may include:

1. More specialized components for specific use cases
2. Additional emotional states for finer-grained expression
3. Animation presets for transitions between screens
4. Enhanced theme customization options
5. Component preview catalog

## Conclusion

The Compose UI Components system provides Sallie with a flexible, expressive visual language that adapts to emotional states and user preferences while maintaining accessibility and consistent design. It serves as the foundation for Sallie's user interface across all platforms that support Jetpack Compose.

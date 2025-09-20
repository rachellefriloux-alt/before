/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * EmotionalPalette - Colors that reflect Sallie's emotional state
 */

package com.sallie.ui.compose.theme

import androidx.compose.ui.graphics.Color

/**
 * Emotional state for Sallie's UI, influencing color accents and animations
 */
enum class EmotionalState {
    NEUTRAL,   // Balanced, default state
    HAPPY,     // Joyful, positive response
    CALM,      // Serene, reassuring state
    CONCERNED, // Careful, thoughtful state
    EXCITED,   // Enthusiastic, energetic state
    FOCUSED    // Attentive, determined state
}

/**
 * Emotional color palette that provides accent colors based on Sallie's emotional state
 * These colors subtly influence UI elements to reflect Sallie's current emotional state
 */
class EmotionalPalette(private val isDark: Boolean) {
    
    // Color mappings for emotional states
    private val neutralColors = if (isDark) {
        listOf(SallieColors.PrimaryPurpleLight, SallieColors.AccentTealLight)
    } else {
        listOf(SallieColors.PrimaryPurple, SallieColors.AccentTeal)
    }
    
    private val happyColors = if (isDark) {
        listOf(Color(0xFFFFD54F), Color(0xFF81C784))
    } else {
        listOf(Color(0xFFFFB300), Color(0xFF66BB6A))
    }
    
    private val calmColors = if (isDark) {
        listOf(Color(0xFF90CAF9), Color(0xFF80DEEA))
    } else {
        listOf(Color(0xFF42A5F5), Color(0xFF26C6DA))
    }
    
    private val concernedColors = if (isDark) {
        listOf(Color(0xFFFFB74D), Color(0xFFCE93D8))
    } else {
        listOf(Color(0xFFFF9800), Color(0xFFAB47BC))
    }
    
    private val excitedColors = if (isDark) {
        listOf(Color(0xFFFFAB91), Color(0xFFFFF176))
    } else {
        listOf(Color(0xFFFF7043), Color(0xFFFDD835))
    }
    
    private val focusedColors = if (isDark) {
        listOf(Color(0xFFB39DDB), Color(0xFF4FC3F7))
    } else {
        listOf(Color(0xFF7E57C2), Color(0xFF29B6F6))
    }
    
    /**
     * Get primary accent color for the current emotional state
     * @param state Current emotional state
     * @return Color for that state
     */
    fun getPrimaryAccent(state: EmotionalState): Color {
        return when(state) {
            EmotionalState.NEUTRAL -> neutralColors[0]
            EmotionalState.HAPPY -> happyColors[0]
            EmotionalState.CALM -> calmColors[0]
            EmotionalState.CONCERNED -> concernedColors[0]
            EmotionalState.EXCITED -> excitedColors[0]
            EmotionalState.FOCUSED -> focusedColors[0]
        }
    }
    
    /**
     * Get secondary accent color for the current emotional state
     * @param state Current emotional state
     * @return Color for that state
     */
    fun getSecondaryAccent(state: EmotionalState): Color {
        return when(state) {
            EmotionalState.NEUTRAL -> neutralColors[1]
            EmotionalState.HAPPY -> happyColors[1]
            EmotionalState.CALM -> calmColors[1]
            EmotionalState.CONCERNED -> concernedColors[1]
            EmotionalState.EXCITED -> excitedColors[1]
            EmotionalState.FOCUSED -> focusedColors[1]
        }
    }
    
    /**
     * Get gradient colors for background effects based on emotional state
     * @param state Current emotional state
     * @return List of colors forming a gradient
     */
    fun getGradientColors(state: EmotionalState): List<Color> {
        return when(state) {
            EmotionalState.NEUTRAL -> listOf(
                getPrimaryAccent(state).copy(alpha = 0.2f),
                getSecondaryAccent(state).copy(alpha = 0.1f)
            )
            EmotionalState.HAPPY -> listOf(
                getPrimaryAccent(state).copy(alpha = 0.3f),
                getSecondaryAccent(state).copy(alpha = 0.2f)
            )
            EmotionalState.CALM -> listOf(
                getPrimaryAccent(state).copy(alpha = 0.2f),
                getSecondaryAccent(state).copy(alpha = 0.2f)
            )
            EmotionalState.CONCERNED -> listOf(
                getPrimaryAccent(state).copy(alpha = 0.15f),
                getSecondaryAccent(state).copy(alpha = 0.1f)
            )
            EmotionalState.EXCITED -> listOf(
                getPrimaryAccent(state).copy(alpha = 0.4f),
                getSecondaryAccent(state).copy(alpha = 0.3f)
            )
            EmotionalState.FOCUSED -> listOf(
                getPrimaryAccent(state).copy(alpha = 0.25f),
                getSecondaryAccent(state).copy(alpha = 0.15f)
            )
        }
    }
}

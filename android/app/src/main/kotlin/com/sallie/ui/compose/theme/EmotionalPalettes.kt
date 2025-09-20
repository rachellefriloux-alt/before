/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * EmotionalPalettes - Provides color palettes based on emotional states
 */

package com.sallie.ui.compose.theme

import androidx.compose.ui.graphics.Color

/**
 * Different emotional states that influence UI appearance
 */
enum class EmotionalState {
    Neutral,   // Default balanced state
    Happy,     // Joyful, positive state
    Calm,      // Serene, peaceful state
    Concerned, // Cautious, attentive state
    Excited,   // Enthusiastic, energetic state
    Focused    // Determined, attentive state
}

/**
 * Emotional palette for UI elements
 */
class EmotionalPalette(
    val primary: Color,
    val secondary: Color,
    val accent: Color,
    val background: Color,
    val surface: Color
)

/**
 * Provider for emotional palettes based on emotional states
 */
object EmotionalPalettes {
    
    /**
     * Get emotional color palette based on state and theme
     * @param state Current emotional state
     * @param isDarkTheme Whether dark theme is active
     * @return EmotionalPalette for the given state
     */
    fun getEmotionalPalette(state: EmotionalState, isDarkTheme: Boolean): EmotionalPalette {
        return when (state) {
            EmotionalState.Neutral -> getNeutralPalette(isDarkTheme)
            EmotionalState.Happy -> getHappyPalette(isDarkTheme)
            EmotionalState.Calm -> getCalmPalette(isDarkTheme)
            EmotionalState.Concerned -> getConcernedPalette(isDarkTheme)
            EmotionalState.Excited -> getExcitedPalette(isDarkTheme)
            EmotionalState.Focused -> getFocusedPalette(isDarkTheme)
        }
    }
    
    private fun getNeutralPalette(isDarkTheme: Boolean): EmotionalPalette {
        return if (isDarkTheme) {
            EmotionalPalette(
                primary = SallieColors.PrimaryPurpleLight,
                secondary = SallieColors.SecondaryGoldLight,
                accent = SallieColors.AccentTealLight,
                background = Color(0xFF121212),
                surface = Color(0xFF1E1E1E)
            )
        } else {
            EmotionalPalette(
                primary = SallieColors.PrimaryPurple,
                secondary = SallieColors.SecondaryGold,
                accent = SallieColors.AccentTeal,
                background = Color(0xFFF9F9F9),
                surface = Color.White
            )
        }
    }
    
    private fun getHappyPalette(isDarkTheme: Boolean): EmotionalPalette {
        return if (isDarkTheme) {
            EmotionalPalette(
                primary = Color(0xFFFFD54F),
                secondary = Color(0xFF81C784),
                accent = Color(0xFFFFB74D),
                background = Color(0xFF121212),
                surface = Color(0xFF1E1E1E)
            )
        } else {
            EmotionalPalette(
                primary = Color(0xFFFFB300),
                secondary = Color(0xFF66BB6A),
                accent = Color(0xFFFF9800),
                background = Color(0xFFFFFBE6),
                surface = Color.White
            )
        }
    }
    
    private fun getCalmPalette(isDarkTheme: Boolean): EmotionalPalette {
        return if (isDarkTheme) {
            EmotionalPalette(
                primary = Color(0xFF90CAF9),
                secondary = Color(0xFF80DEEA),
                accent = Color(0xFFB39DDB),
                background = Color(0xFF101418),
                surface = Color(0xFF1A1F24)
            )
        } else {
            EmotionalPalette(
                primary = Color(0xFF42A5F5),
                secondary = Color(0xFF26C6DA),
                accent = Color(0xFF7E57C2),
                background = Color(0xFFEFF8FF),
                surface = Color.White
            )
        }
    }
    
    private fun getConcernedPalette(isDarkTheme: Boolean): EmotionalPalette {
        return if (isDarkTheme) {
            EmotionalPalette(
                primary = Color(0xFFFFB74D),
                secondary = Color(0xFFCE93D8),
                accent = Color(0xFFFFF176),
                background = Color(0xFF14120F),
                surface = Color(0xFF1E1C18)
            )
        } else {
            EmotionalPalette(
                primary = Color(0xFFFF9800),
                secondary = Color(0xFFAB47BC),
                accent = Color(0xFFFBC02D),
                background = Color(0xFFFFF8E1),
                surface = Color.White
            )
        }
    }
    
    private fun getExcitedPalette(isDarkTheme: Boolean): EmotionalPalette {
        return if (isDarkTheme) {
            EmotionalPalette(
                primary = Color(0xFFFFAB91),
                secondary = Color(0xFFFFF176),
                accent = Color(0xFF90CAF9),
                background = Color(0xFF14110F),
                surface = Color(0xFF1E1A17)
            )
        } else {
            EmotionalPalette(
                primary = Color(0xFFFF7043),
                secondary = Color(0xFFFDD835),
                accent = Color(0xFF42A5F5),
                background = Color(0xFFFFF3E0),
                surface = Color.White
            )
        }
    }
    
    private fun getFocusedPalette(isDarkTheme: Boolean): EmotionalPalette {
        return if (isDarkTheme) {
            EmotionalPalette(
                primary = Color(0xFFB39DDB),
                secondary = Color(0xFF4FC3F7),
                accent = Color(0xFF9FA8DA),
                background = Color(0xFF10121A),
                surface = Color(0xFF1A1C26)
            )
        } else {
            EmotionalPalette(
                primary = Color(0xFF7E57C2),
                secondary = Color(0xFF29B6F6),
                accent = Color(0xFF5C6BC0),
                background = Color(0xFFF3F0FF),
                surface = Color.White
            )
        }
    }
}

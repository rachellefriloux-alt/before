package com.sallie.components

// Dynamic theming engine
class ThemeManager {
    // suggestTheme function now uses the centralized availableThemes list for default
    // and correctly suggests "Southern Grit".
    fun suggestTheme(mood: String): String {
        return when (mood.lowercase()) { // Added lowercase() for robustness
            "energetic" -> "Grace & Grind"
            "focused" -> "Hustle Legacy"
            "calm" -> "Soul Care"
            "night" -> "Midnight Hustle"
            "grit" -> "Southern Grit" // Added this line
            else -> availableThemes.firstOrNull() ?: "Grace & Grind" // Default to first available or a hardcoded default
        }
    }

    // You might also want a function to get all available theme names,
    // which can now directly return the `availableThemes` list from ThemeDefinitions.kt
    fun getAvailableThemeNames(): List<String> {
        return availableThemes
    }

    // Function to get the ThemeColors object for a given theme name
    // This now delegates to the schemeFor function in ThemeDefinitions.kt
    fun getThemeColors(themeName: String): ThemeColors {
        return schemeFor(themeName)
    }
}

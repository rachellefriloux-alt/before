

package com.sallie.components

import android.content.Context
import android.content.SharedPreferences

data class Theme(val name: String, val primaryColor: Int, val accentColor: Int, val backgroundColor: Int)

class ThemeManager(context: Context) {
	private val prefs: SharedPreferences = context.getSharedPreferences("sallie_theme_prefs", Context.MODE_PRIVATE)
	private val themes = listOf(
		Theme("Light", 0xFFFFFFFF.toInt(), 0xFF6200EE.toInt(), 0xFFF5F5F5.toInt()),
		Theme("Dark", 0xFF121212.toInt(), 0xFFBB86FC.toInt(), 0xFF1F1F1F.toInt()),
		Theme("SoulCare", 0xFFB3E5FC.toInt(), 0xFF0097A7.toInt(), 0xFFE1F5FE.toInt()),
		Theme("ToughLove", 0xFFFFCDD2.toInt(), 0xFFD32F2F.toInt(), 0xFFFFEBEE.toInt())
	)

	fun getCurrentTheme(): Theme {
		val name = prefs.getString("theme_name", "Light") ?: "Light"
		return themes.find { it.name == name } ?: themes[0]
	}

	fun setTheme(themeName: String) {
		val theme = themes.find { it.name == themeName } ?: themes[0]
		prefs.edit().putString("theme_name", theme.name).apply()
	}

	fun getAllThemes(): List<Theme> = themes
}


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


/*
 * Persona: Tough love meets soul care.
 * Module: ThemeManager
 * Intent: Handle functionality for ThemeManager
 * Provenance-ID: a2e3e566-fb71-4266-9625-d18f4476b5e4
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */


package com.sallie.components

import android.content.Context
import android.content.SharedPreferences

/**
 * ThemeManager: Dynamic theming engine (persona/mood/event aware).
 * - Responsive, adaptive, and accessible component library.
 * - Custom icons and vector assets.
 * - Context-aware UI adaptation and event-driven updates.
 * - Integration with accessibility features and voice controls.
 */
data class Theme(val name: String, val primaryColor: Int, val accentColor: Int, val backgroundColor: Int)

class ThemeManager(context: Context) {
	private val prefs: SharedPreferences = context.getSharedPreferences("sallie_theme_prefs", Context.MODE_PRIVATE)
	private val themes = listOf(
		Theme("Light", 0xFFFFFFFF.toInt(), 0xFF6200EE.toInt(), 0xFFF5F5F5.toInt()),
		Theme("Dark", 0xFF121212.toInt(), 0xFFBB86FC.toInt(), 0xFF1F1F1F.toInt()),
		Theme("SoulCare", 0xFFB3E5FC.toInt(), 0xFF0097A7.toInt(), 0xFFE1F5FE.toInt()),
		Theme("ToughLove", 0xFFFFCDD2.toInt(), 0xFFD32F2F.toInt(), 0xFFFFEBEE.toInt())
	)

	fun getCurrentTheme(): Theme {
		val name = prefs.getString("theme_name", "Light") ?: "Light"
		return themes.find { it.name == name } ?: themes[0]
	}

	fun setTheme(themeName: String) {
		val theme = themes.find { it.name == themeName } ?: themes[0]
		prefs.edit().putString("theme_name", theme.name).apply()
	}

	fun getAllThemes(): List<Theme> = themes
}



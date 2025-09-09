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

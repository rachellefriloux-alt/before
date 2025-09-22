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

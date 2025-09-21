package com.sallie.launcher

import androidx.compose.material3.ColorScheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.ui.graphics.Color

object ThemeColorsMapper {
    fun schemeFor(theme: String): ColorScheme =
        when (theme) {
            "Grace & Grind" ->
                lightColorScheme(
                    primary = Color(0xFF5E33CC),
                    secondary = Color(0xFF8F6BFF),
                    tertiary = Color(0xFFFFC107),
                )
            "Hustle Legacy" ->
                lightColorScheme(
                    primary = Color(0xFF0D47A1),
                    secondary = Color(0xFF1976D2),
                    tertiary = Color(0xFFFFA000),
                )
            "Soul Care" ->
                lightColorScheme(
                    primary = Color(0xFF00695C),
                    secondary = Color(0xFF26A69A),
                    tertiary = Color(0xFFFF7043),
                )
            "Midnight Hustle" ->
                darkColorScheme(
                    primary = Color(0xFF90CAF9),
                    secondary = Color(0xFFCE93D8),
                    tertiary = Color(0xFFFFF59D),
                )
            else -> lightColorScheme()
        }
}

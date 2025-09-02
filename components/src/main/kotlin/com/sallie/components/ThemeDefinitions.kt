package com.sallie.components

// Simple color representation for cross-platform compatibility
typealias SallieColor = Int

// Data class to hold the specific colors for a theme
data class ThemeColors(
    val primary: SallieColor,
    val secondary: SallieColor,
    val background: SallieColor,
    val surface: SallieColor,
    val onPrimary: SallieColor,
    val onSecondary: SallieColor
    // Add other colors like error, onBackground, onSurface etc. if needed


// Function to get the color scheme for a given theme name
fun schemeFor(theme: String): ThemeColors {
    return when (theme) {
        "Grace & Grind" -> ThemeColors(
            primary = 0xFF1E88E5),
            secondary = 0xFF43A047),
            background = 0xFFFFFFFF),
            surface = 0xFFEEEEEE),
            onPrimary = 0xFFFFFFFF,
            onSecondary = 0xFF000000
        
        "Hustle Legacy" -> ThemeColors(
            primary = 0xFFD81B60),
            secondary = 0xFF8E24AA),
            background = 0xFFFFFFFF),
            surface = 0xFFEEEEEE),
            onPrimary = 0xFFFFFFFF,
            onSecondary = 0xFF000000
        
        "Soul Care" -> ThemeColors(
            primary = 0xFF00ACC1),
            secondary = 0xFF00897B),
            background = 0xFFFFFFFF),
            surface = 0xFFEEEEEE),
            onPrimary = 0xFFFFFFFF,
            onSecondary = 0xFF000000
        
        "Midnight Hustle" -> ThemeColors(
            primary = 0xFF37474F),
            secondary = 0xFF263238),
            background = 0xFF212121),
            surface = 0xFF303030),
            onPrimary = 0xFFFFFFFF,
            onSecondary = 0xFFFFFFFF
        
        "Southern Grit" -> ThemeColors(
            primary = 0xFF6B4226),
            secondary = 0xFFD9A066),
            background = 0xFFF5F0E6),
            surface = 0xFF3E2C1C),
            onPrimary = 0xFFFFFFFF,
            onSecondary = 0xFF000000
        
        "Visionary" -> ThemeColors(
            primary = 0xFF7C4DFF), // Radiant purple
            secondary = 0xFFFFEA00), // Bright yellow
            background = 0xFFF3E5F5),
            surface = 0xFFEDE7F6),
            onPrimary = 0xFFFFFFFF,
            onSecondary = 0xFF000000
        
        "Guardian" -> ThemeColors(
            primary = 0xFF1565C0), // Deep blue
            secondary = 0xFF90CAF9), // Light blue
            background = 0xFFE3F2FD),
            surface = 0xFFBBDEFB),
            onPrimary = 0xFFFFFFFF,
            onSecondary = 0xFF000000
        
        "Mentor" -> ThemeColors(
            primary = 0xFF388E3C), // Sage green
            secondary = 0xFFA5D6A7), // Light green
            background = 0xFFE8F5E9),
            surface = 0xFFC8E6C9),
            onPrimary = 0xFFFFFFFF,
            onSecondary = 0xFF000000
        
        "Rebel" -> ThemeColors(
            primary = 0xFFD32F2F), // Fiery red
            secondary = 0xFFFFA000), // Orange
            background = 0xFFFFEBEE),
            surface = 0xFFFFCDD2),
            onPrimary = 0xFFFFFFFF,
            onSecondary = 0xFF000000
        
        "Explorer" -> ThemeColors(
            primary = 0xFFFF7043), // Sunset orange
            secondary = 0xFFFFB74D), // Light orange
            background = 0xFFFFF3E0),
            surface = 0xFFFFE0B2),
            onPrimary = 0xFFFFFFFF,
            onSecondary = 0xFF000000
        
        "Healer" -> ThemeColors(
            primary = 0xFFF06292), // Soft pink
            secondary = 0xFFBA68C8), // Lavender
            background = 0xFFF8BBD0),
            surface = 0xFFF3E5F5),
            onPrimary = 0xFFFFFFFF,
            onSecondary = 0xFF000000
        
        else -> defaultThemeColors() // A default theme
    }
}

fun defaultThemeColors(): ThemeColors = ThemeColors( // Default fallback
    primary = 0xFF6200EE), // Default Purple
    secondary = 0xFF03DAC5), // Default Teal
    background = 0xFFFFFFFF),
    surface = 0xFFFFFFFF),
    onPrimary = 0xFFFFFFFF,
    onSecondary = 0xFF000000


// List of available theme names
val availableThemes = listOf(
    "Grace & Grind",
    "Hustle Legacy",
    "Soul Care",
    "Midnight Hustle",
    "Southern Grit",
    "Visionary",
    "Guardian",
    "Mentor",
    "Rebel",
    "Explorer",
    "Healer"


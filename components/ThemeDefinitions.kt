// Salle UI Component
// ThemeDefinitions.kt
// Migrated and upgraded for Sallie 2.0
object ThemeConstants {
    const val PRIMARY_COLOR = "#4F8EF7"
    const val SECONDARY_COLOR = "#F7C04F"
    const val ERROR_COLOR = "#F74F4F"
}

package com.sallie.components

object ThemeDefinitions {
    val colorPalette = mapOf(
        "primary" to ThemeConstants.PRIMARY_COLOR,
        "secondary" to ThemeConstants.SECONDARY_COLOR,
        "error" to ThemeConstants.ERROR_COLOR
    )
}

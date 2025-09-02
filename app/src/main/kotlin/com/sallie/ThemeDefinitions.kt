/*
 * Persona: Tough love meets soul care.
 * Module: ThemeDefinitions
 * Intent: Handle functionality for ThemeDefinitions
 * Provenance-ID: 6056a845-e042-49aa-99e7-6591e3c6a3d6
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

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

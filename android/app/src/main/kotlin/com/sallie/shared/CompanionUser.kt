/*
 * Persona: Tough love meets soul care.
 * Module: CompanionUser
 * Intent: Handle functionality for CompanionUser
 * Provenance-ID: 5f511e2c-2c79-4fd0-806c-6e43cbfafb3d
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

package com.sallie.shared

/**
 * Data class representing a companion user
 * Provenance: Created for Sallie companion app on 2025-08-27
 */
data class CompanionUser(
    val id: String,
    val name: String,
    val avatarUrl: String? = null,
    val status: String = "active",
    val lastActive: Long = System.currentTimeMillis()
)

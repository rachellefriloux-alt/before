/*
 * Persona: Tough love meets soul care.
 * Module: ValidationUtils
 * Intent: Handle functionality for ValidationUtils
 * Provenance-ID: 99b1f5ee-be9a-46d0-b213-3d8885d1bd9b
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

package com.sallie.shared

/**
 * Utility class for data validation
 * Provenance: Created for Sallie companion app on 2025-08-27
 */
object ValidationUtils {

    /**
     * Validate if a string is not null or empty
     */
    fun isNotEmpty(value: String?): Boolean {
        return !value.isNullOrEmpty()
    }

    /**
     * Validate email format
     */
    fun isValidEmail(email: String?): Boolean {
        if (email.isNullOrEmpty()) return false
        val emailRegex = Regex("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")
        return emailRegex.matches(email)
    }

    /**
     * Validate user name (not empty, reasonable length)
     */
    fun isValidUserName(name: String?): Boolean {
        if (name.isNullOrEmpty()) return false
        return name.length in 2..50
    }

    /**
     * Validate user ID format
     */
    fun isValidUserId(userId: String?): Boolean {
        if (userId.isNullOrEmpty()) return false
        // User ID should be alphanumeric, no special characters except underscore
        val userIdRegex = Regex("^[A-Za-z0-9_]+$")
        return userIdRegex.matches(userId) && userId.length in 1..20
    }
}

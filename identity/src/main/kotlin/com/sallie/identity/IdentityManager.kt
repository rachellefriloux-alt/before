package com.sallie.identity

// 🛡 SALLIE PERSONA ENFORCED 🛡 Loyal, Modular, Audit‑Proof.

/**
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: User identity management and profile handling.
 * Got it, love.
 */
object IdentityManager {

    data class UserIdentity(
        val name: String = "User",
        val preferences: Map<String, String> = emptyMap(),
        val values: List<String> = emptyList()
    )

    private var identity = UserIdentity()

    fun setIdentity(newIdentity: UserIdentity) {
        identity = newIdentity
    }

    fun getIdentity(): UserIdentity = identity

    fun updatePreference(key: String, value: String) {
        identity = identity.copy(
            preferences = identity.preferences + (key to value)
        )
    }

    fun addValue(value: String) {
        identity = identity.copy(
            values = identity.values + value
        )
    }
}

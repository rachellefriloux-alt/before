package com.sallie.core.data.model

/**
 * ╭──────────────────────────────────────────────────────────────────────────────╮
 * │                                                                              │
 * │   Sallie - The Personal AI Companion That Truly Gets You                     │
 * │                                                                              │
 * │   Sallie is gentle, creative, and deeply empathetic. She understands         │
 * │   the human experience from literature and art, not just data.               │
 * │   Her goal is to help you explore your world, care for yourself,             │
 * │   and find your own answers through thoughtful conversation.                 │
 * │                                                                              │
 * │   - Genuine & Balanced: Honest but tactfully optimistic                      │
 * │   - Warm & Personal: Remembers your details, references shared history       │
 * │   - Contemplative: Considers questions deeply before responding              │
 * │   - Encouraging: Helps you develop your thoughts rather than imposing hers   │
 * │                                                                              │
 * ╰──────────────────────────────────────────────────────────────────────────────╯
 */

/**
 * Secure Data Entity
 * 
 * Base model for all secure data stored by the Data Security System.
 * This entity is encrypted before storage and decrypted upon retrieval.
 */
data class SecureDataEntity(
    val id: String? = null,
    val type: String,
    val data: String,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis(),
    val metadata: String = "{}"
)

/**
 * Types of secure data that can be stored
 */
object SecureDataTypes {
    const val USER_PROFILE = "user_profile"
    const val AUTHENTICATION = "authentication"
    const val PERSONAL_INFO = "personal_info"
    const val HEALTH_DATA = "health_data"
    const val FINANCIAL_DATA = "financial_data"
    const val SENSITIVE_NOTE = "sensitive_note"
    const val CREDENTIALS = "credentials"
    const val SECURITY_SETTINGS = "security_settings"
    const val API_KEY = "api_key"
}

/**
 * User Profile Secure Entity
 */
data class UserProfileSecure(
    val userId: String,
    val fullName: String,
    val email: String,
    val phoneNumber: String? = null,
    val address: String? = null,
    val dateOfBirth: String? = null,
    val preferences: Map<String, Any> = emptyMap()
) {
    fun toSecureDataEntity(): SecureDataEntity {
        val data = """
            {
                "userId": "$userId",
                "fullName": "$fullName",
                "email": "$email",
                "phoneNumber": ${phoneNumber?.let { "\"$it\"" } ?: "null"},
                "address": ${address?.let { "\"$it\"" } ?: "null"},
                "dateOfBirth": ${dateOfBirth?.let { "\"$it\"" } ?: "null"},
                "preferences": ${preferences.toString()}
            }
        """.trimIndent()
        
        return SecureDataEntity(
            type = SecureDataTypes.USER_PROFILE,
            data = data
        )
    }
}

/**
 * Authentication Secure Entity
 */
data class AuthenticationSecure(
    val userId: String,
    val tokenHash: String,
    val refreshTokenHash: String? = null,
    val expiresAt: Long,
    val authMethod: String
) {
    fun toSecureDataEntity(): SecureDataEntity {
        val data = """
            {
                "userId": "$userId",
                "tokenHash": "$tokenHash",
                "refreshTokenHash": ${refreshTokenHash?.let { "\"$it\"" } ?: "null"},
                "expiresAt": $expiresAt,
                "authMethod": "$authMethod"
            }
        """.trimIndent()
        
        return SecureDataEntity(
            type = SecureDataTypes.AUTHENTICATION,
            data = data
        )
    }
}

/**
 * API Key Secure Entity
 */
data class ApiKeySecure(
    val service: String,
    val keyName: String,
    val keyValue: String,
    val expiresAt: Long? = null
) {
    fun toSecureDataEntity(): SecureDataEntity {
        val data = """
            {
                "service": "$service",
                "keyName": "$keyName",
                "keyValue": "$keyValue",
                "expiresAt": ${expiresAt ?: "null"}
            }
        """.trimIndent()
        
        return SecureDataEntity(
            type = SecureDataTypes.API_KEY,
            data = data
        )
    }
}

/**
 * Sensitive Note Secure Entity
 */
data class SensitiveNoteSecure(
    val title: String,
    val content: String,
    val tags: List<String> = emptyList()
) {
    fun toSecureDataEntity(): SecureDataEntity {
        val data = """
            {
                "title": "$title",
                "content": "$content",
                "tags": [${tags.joinToString { "\"$it\"" }}]
            }
        """.trimIndent()
        
        return SecureDataEntity(
            type = SecureDataTypes.SENSITIVE_NOTE,
            data = data
        )
    }
}

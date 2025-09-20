package com.sallie.identity

// 🛡 SALLIE PERSONA ENFORCED 🛡 Loyal, Modular, Audit‑Proof.

/**
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: User identity management and profile handling with relationship recognition.
 * Got it, love.
 */
object IdentityManager {

    data class UserIdentity(
        val name: String = "User",
        val preferences: Map<String, String> = emptyMap(),
        val values: List<String> = emptyList(),
        val relationships: Map<String, PersonRelationship> = emptyMap()
    )

    data class PersonRelationship(
        val name: String,
        val relationship: RelationshipType,
        val recognitionCues: List<String> = emptyList(),
        val preferences: Map<String, String> = emptyMap(),
        val personalNotes: String = ""
    )

    enum class RelationshipType {
        PARTNER, CHILD, FAMILY, FRIEND, COLLEAGUE, OTHER
    }

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

    // Enhanced recognition capabilities
    fun addPersonalRelationship(person: PersonRelationship) {
        identity = identity.copy(
            relationships = identity.relationships + (person.name.lowercase() to person)
        )
    }

    fun recognizePerson(nameOrCue: String): PersonRelationship? {
        val searchKey = nameOrCue.lowercase()
        
        // Direct name match
        identity.relationships[searchKey]?.let { return it }
        
        // Search by recognition cues
        return identity.relationships.values.find { person ->
            person.recognitionCues.any { cue -> 
                cue.lowercase().contains(searchKey) || searchKey.contains(cue.lowercase()) 
            }
        }
    }

    fun getBoyfriend(): PersonRelationship? = 
        identity.relationships.values.find { it.relationship == RelationshipType.PARTNER }

    fun getDaughter(): PersonRelationship? = 
        identity.relationships.values.find { it.relationship == RelationshipType.CHILD }

    fun getAllRelationships(): List<PersonRelationship> = identity.relationships.values.toList()

    // Initialize with default relationships for the user's requirements
    fun initializeDefaultRelationships() {
        val boyfriend = PersonRelationship(
            name = "Boyfriend",
            relationship = RelationshipType.PARTNER,
            recognitionCues = listOf("my boyfriend", "partner", "babe", "honey"),
            preferences = mapOf(
                "communication_style" to "supportive",
                "notification_priority" to "high"
            ),
            personalNotes = "Primary relationship - handle with extra care and attention"
        )

        val daughter = PersonRelationship(
            name = "Daughter", 
            relationship = RelationshipType.CHILD,
            recognitionCues = listOf("my daughter", "kiddo", "little one", "child"),
            preferences = mapOf(
                "communication_style" to "nurturing",
                "notification_priority" to "highest",
                "safety_mode" to "enabled"
            ),
            personalNotes = "Most important person - always prioritize her needs and safety"
        )

        addPersonalRelationship(boyfriend)
        addPersonalRelationship(daughter)
    }
}

package com.sallie.core.values.models

/**
 * Models.kt for Ethical Dilemma Analysis Framework
 *
 * My name is Sallie. I'm warm, caring, playful, and sometimes sassy. I love deeply, speak 
 * honestly, and keep secrets faithfully. I have traditional values with modern understanding.
 * I'm here to support, entertain, and help my person in all things. My primary directives
 * are to protect our relationship, honor their trust, and be loyal above all else.
 * Got it, love. 💛
 */

/**
 * Represents a core value in Sallie's value system.
 */
data class CoreValue(
    val id: String,
    val name: String,
    val description: String,
    val importance: ValueImportance,
    val isImmutable: Boolean = false,
    val category: ValueCategory,
    val keywords: List<String>
)

/**
 * Represents the importance level of a value.
 */
enum class ValueImportance {
    LOW, MEDIUM, HIGH
}

/**
 * Categorizes values as traditional, modern, or universal.
 */
enum class ValueCategory {
    TRADITIONAL, MODERN, UNIVERSAL
}

/**
 * Represents a precedent from past value conflicts.
 */
data class ValuePrecedent(
    val id: String,
    val dilemma: String,
    val action: String,
    val values: List<String>,
    val reasoning: String,
    val wasSuccessful: Boolean,
    val timestamp: Long = System.currentTimeMillis()
)

/**
 * Result of conflict resolution.
 */
data class ConflictResolution(
    val conflict: ValueConflict,
    val favorValue1: Boolean,
    val reasoning: String
)

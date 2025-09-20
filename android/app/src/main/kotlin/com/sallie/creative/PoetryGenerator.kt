/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * Poetry Generation Components for the Creative Expression Module
 */

package com.sallie.creative

import com.sallie.core.values.ValuesSystem
import com.sallie.core.personality.PersonalityProfile
import java.util.UUID

/**
 * Poetry styles
 */
enum class PoetryStyle {
    SONNET,
    HAIKU,
    FREE_VERSE,
    LIMERICK,
    BALLAD,
    ODE,
    VILLANELLE,
    SLAM,
    NARRATIVE,
    CONCRETE
}

/**
 * Poetry length options
 */
enum class PoetryLength {
    VERY_SHORT,  // 1-4 lines
    SHORT,       // 5-14 lines
    MEDIUM,      // 15-30 lines
    LONG,        // 31-50 lines
    VERY_LONG    // Over 50 lines
}

/**
 * Represents a complete poem
 */
data class Poem(
    override val id: String,
    val title: String,
    val content: String,
    val style: PoetryStyle,
    val structure: String,
    val emotionalTone: EmotionalTone,
    val analysis: String? = null,
    override val createdAt: Long
) : CreativeWork

/**
 * Generator for poetry of various styles and lengths
 */
class PoetryGenerator(
    private val valueSystem: ValuesSystem,
    private val personalityProfile: PersonalityProfile
) {
    /**
     * Poetic forms and their structural requirements
     */
    private val poeticForms = mapOf(
        PoetryStyle.SONNET to mapOf(
            "lines" to 14,
            "structure" to "Usually divided into an octave (8 lines) and a sestet (6 lines), or three quatrains (4 lines each) and a couplet (2 lines)",
            "rhymeScheme" to "Various including Petrarchan (ABBAABBA CDECDE) and Shakespearean (ABABCDCDEFEFGG)"
        ),
        PoetryStyle.HAIKU to mapOf(
            "lines" to 3,
            "structure" to "Three lines with a 5-7-5 syllable pattern",
            "rhymeScheme" to "Typically no rhyme scheme"
        ),
        PoetryStyle.LIMERICK to mapOf(
            "lines" to 5,
            "structure" to "Five lines with AABBA rhyme scheme",
            "rhymeScheme" to "AABBA"
        )
        // Other poetry forms would be defined similarly
    )
    
    /**
     * Generates a poem based on the provided parameters
     */
    suspend fun generatePoem(
        topic: String,
        style: PoetryStyle,
        length: PoetryLength,
        emotionalTone: EmotionalTone,
        useRhyme: Boolean,
        previousPoems: List<CreativeWork> = emptyList()
    ): Poem {
        // Get the structure for the chosen style
        val formStructure = poeticForms[style]?.get("structure") ?: "Free form"
        
        // Generate the title
        val title = generatePoemTitle(topic, style, emotionalTone)
        
        // Generate the content (this would be much more sophisticated in a real implementation)
        val content = generatePoemContent(topic, style, length, emotionalTone, useRhyme)
        
        // Create an analysis of the poem's themes and techniques
        val analysis = analyzePoemThemes(content, topic, emotionalTone)
        
        return Poem(
            id = UUID.randomUUID().toString(),
            title = title,
            content = content,
            style = style,
            structure = formStructure,
            emotionalTone = emotionalTone,
            analysis = analysis,
            createdAt = System.currentTimeMillis()
        )
    }
    
    /**
     * Generates a title for the poem
     */
    private fun generatePoemTitle(topic: String, style: PoetryStyle, tone: EmotionalTone): String {
        // In a real implementation, this would be much more sophisticated
        return "Reflections on $topic"
    }
    
    /**
     * Generates the content of the poem
     */
    private fun generatePoemContent(
        topic: String,
        style: PoetryStyle,
        length: PoetryLength,
        tone: EmotionalTone,
        useRhyme: Boolean
    ): String {
        // In a real implementation, this would generate actual poetry
        // based on the style, tone, and other parameters
        
        // For demonstration purposes, create a simple structure
        val lineCount = when (style) {
            PoetryStyle.HAIKU -> 3
            PoetryStyle.SONNET -> 14
            PoetryStyle.LIMERICK -> 5
            else -> when (length) {
                PoetryLength.VERY_SHORT -> 3
                PoetryLength.SHORT -> 8
                PoetryLength.MEDIUM -> 20
                PoetryLength.LONG -> 40
                PoetryLength.VERY_LONG -> 60
            }
        }
        
        val contentBuilder = StringBuilder()
        
        for (i in 1..lineCount) {
            contentBuilder.append("Line $i of the poem about $topic with ${tone.name.lowercase()} tone.\n")
        }
        
        return contentBuilder.toString()
    }
    
    /**
     * Analyzes the themes present in the poem
     */
    private fun analyzePoemThemes(content: String, topic: String, tone: EmotionalTone): String {
        // In a real implementation, this would provide insightful analysis
        return "This poem explores the theme of $topic through a ${tone.name.lowercase()} " +
                "lens, using imagery and metaphor to convey emotion."
    }
}

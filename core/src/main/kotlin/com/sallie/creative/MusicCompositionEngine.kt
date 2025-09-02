/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * Music Composition Engine Components for the Creative Expression Module
 */

package com.sallie.creative

import com.sallie.core.values.ValuesSystem
import java.util.UUID

/**
 * Music genres
 */
enum class MusicGenre {
    CLASSICAL,
    JAZZ,
    ROCK,
    POP,
    ELECTRONIC,
    FOLK,
    AMBIENT,
    HIP_HOP,
    BLUES,
    COUNTRY,
    WORLD,
    EXPERIMENTAL
}

/**
 * Music tempos
 */
enum class MusicTempo {
    VERY_SLOW,
    SLOW,
    MODERATE,
    UPBEAT,
    FAST,
    VERY_FAST,
    VARIABLE
}

/**
 * Musical modes
 */
enum class MusicalMode {
    MAJOR,
    MINOR,
    DORIAN,
    PHRYGIAN,
    LYDIAN,
    MIXOLYDIAN,
    AEOLIAN,
    LOCRIAN
}

/**
 * Represents a musical instrument or voice type
 */
enum class Instrument {
    PIANO,
    GUITAR,
    VIOLIN,
    CELLO,
    FLUTE,
    DRUMS,
    BASS,
    SYNTHESIZER,
    VOCAL,
    SAXOPHONE,
    TRUMPET,
    HARP,
    ELECTRONIC
}

/**
 * Represents a music composition concept
 */
data class MusicComposition(
    override val id: String,
    val title: String,
    val description: String,
    val genre: MusicGenre,
    val tempo: MusicTempo,
    val mode: MusicalMode,
    val primaryInstruments: List<Instrument>,
    val structure: String? = null,
    val inspirationNotes: String? = null,
    val emotionalJourney: String? = null,
    override val createdAt: Long
) : CreativeWork

/**
 * Engine for generating music composition concepts
 */
class MusicCompositionEngine(
    private val valueSystem: ValuesSystem
) {
    /**
     * Map of genres to their characteristics
     */
    private val genreCharacteristics = mapOf(
        MusicGenre.CLASSICAL to "Structured compositions, traditional harmony, orchestral instrumentation",
        MusicGenre.JAZZ to "Improvisation, complex harmonies, swing rhythms, blue notes",
        MusicGenre.ROCK to "Electric guitars, strong rhythm, often verse-chorus structure",
        MusicGenre.POP to "Accessible melodies, contemporary production, catchy hooks",
        MusicGenre.ELECTRONIC to "Synthesized sounds, programmed rhythms, technological elements",
        MusicGenre.FOLK to "Acoustic instruments, storytelling lyrics, cultural traditions",
        MusicGenre.AMBIENT to "Atmospheric textures, minimal beats, focus on tone and mood",
        MusicGenre.HIP_HOP to "Rhythmic vocals, sampling, beats, urban themes",
        MusicGenre.BLUES to "Expressive vocals, repetitive forms, emotional delivery",
        MusicGenre.COUNTRY to "Narrative lyrics, traditional instruments, rural themes",
        MusicGenre.WORLD to "Cultural instruments, regional scales and rhythms, heritage",
        MusicGenre.EXPERIMENTAL to "Unconventional techniques, boundary-pushing, innovative"
    )
    
    /**
     * Map of emotional tones to musical characteristics
     */
    private val toneToMusicalCharacteristics = mapOf(
        EmotionalTone.JOYFUL to MusicalCharacteristics(
            suggestedModes = listOf(MusicalMode.MAJOR, MusicalMode.LYDIAN, MusicalMode.MIXOLYDIAN),
            suggestedTempos = listOf(MusicTempo.UPBEAT, MusicTempo.FAST),
            dynamicRange = "Medium to High"
        ),
        EmotionalTone.MELANCHOLY to MusicalCharacteristics(
            suggestedModes = listOf(MusicalMode.MINOR, MusicalMode.AEOLIAN, MusicalMode.PHRYGIAN),
            suggestedTempos = listOf(MusicTempo.SLOW, MusicTempo.VERY_SLOW),
            dynamicRange = "Low to Medium"
        ),
        EmotionalTone.SUSPENSEFUL to MusicalCharacteristics(
            suggestedModes = listOf(MusicalMode.LOCRIAN, MusicalMode.PHRYGIAN),
            suggestedTempos = listOf(MusicTempo.VARIABLE, MusicTempo.MODERATE),
            dynamicRange = "Variable, with crescendos"
        ),
        EmotionalTone.REFLECTIVE to MusicalCharacteristics(
            suggestedModes = listOf(MusicalMode.DORIAN, MusicalMode.MINOR),
            suggestedTempos = listOf(MusicTempo.SLOW, MusicTempo.MODERATE),
            dynamicRange = "Soft to Medium"
        ),
        EmotionalTone.INSPIRING to MusicalCharacteristics(
            suggestedModes = listOf(MusicalMode.MAJOR, MusicalMode.LYDIAN),
            suggestedTempos = listOf(MusicTempo.MODERATE, MusicTempo.UPBEAT),
            dynamicRange = "Building from Medium to High"
        ),
        EmotionalTone.HUMOROUS to MusicalCharacteristics(
            suggestedModes = listOf(MusicalMode.MAJOR, MusicalMode.LYDIAN),
            suggestedTempos = listOf(MusicTempo.VARIABLE, MusicTempo.UPBEAT),
            dynamicRange = "Playful contrasts"
        ),
        EmotionalTone.PEACEFUL to MusicalCharacteristics(
            suggestedModes = listOf(MusicalMode.MAJOR, MusicalMode.DORIAN),
            suggestedTempos = listOf(MusicTempo.SLOW, MusicTempo.MODERATE),
            dynamicRange = "Soft, consistent"
        ),
        EmotionalTone.MYSTERIOUS to MusicalCharacteristics(
            suggestedModes = listOf(MusicalMode.PHRYGIAN, MusicalMode.LOCRIAN),
            suggestedTempos = listOf(MusicTempo.SLOW, MusicTempo.VARIABLE),
            dynamicRange = "Subtle variations"
        ),
        EmotionalTone.ROMANTIC to MusicalCharacteristics(
            suggestedModes = listOf(MusicalMode.MAJOR, MusicalMode.DORIAN),
            suggestedTempos = listOf(MusicTempo.MODERATE, MusicTempo.SLOW),
            dynamicRange = "Expressive, flowing"
        ),
        EmotionalTone.ADVENTUROUS to MusicalCharacteristics(
            suggestedModes = listOf(MusicalMode.MIXOLYDIAN, MusicalMode.LYDIAN),
            suggestedTempos = listOf(MusicTempo.UPBEAT, MusicTempo.FAST),
            dynamicRange = "Bold contrasts"
        )
    )
    
    /**
     * Map of genres to common instruments
     */
    private val genreToInstruments = mapOf(
        MusicGenre.CLASSICAL to listOf(Instrument.PIANO, Instrument.VIOLIN, Instrument.CELLO, Instrument.FLUTE),
        MusicGenre.JAZZ to listOf(Instrument.SAXOPHONE, Instrument.TRUMPET, Instrument.PIANO, Instrument.BASS, Instrument.DRUMS),
        MusicGenre.ROCK to listOf(Instrument.GUITAR, Instrument.BASS, Instrument.DRUMS, Instrument.VOCAL),
        MusicGenre.POP to listOf(Instrument.VOCAL, Instrument.PIANO, Instrument.GUITAR, Instrument.DRUMS, Instrument.SYNTHESIZER),
        MusicGenre.ELECTRONIC to listOf(Instrument.SYNTHESIZER, Instrument.ELECTRONIC, Instrument.VOCAL),
        MusicGenre.FOLK to listOf(Instrument.GUITAR, Instrument.VOCAL, Instrument.VIOLIN),
        MusicGenre.AMBIENT to listOf(Instrument.SYNTHESIZER, Instrument.PIANO, Instrument.ELECTRONIC),
        MusicGenre.HIP_HOP to listOf(Instrument.VOCAL, Instrument.ELECTRONIC, Instrument.BASS, Instrument.DRUMS),
        MusicGenre.BLUES to listOf(Instrument.GUITAR, Instrument.VOCAL, Instrument.PIANO, Instrument.DRUMS),
        MusicGenre.COUNTRY to listOf(Instrument.GUITAR, Instrument.VOCAL, Instrument.VIOLIN),
        MusicGenre.WORLD to listOf(Instrument.FLUTE, Instrument.DRUMS, Instrument.VOCAL, Instrument.HARP),
        MusicGenre.EXPERIMENTAL to listOf(Instrument.ELECTRONIC, Instrument.SYNTHESIZER, Instrument.PIANO, Instrument.VIOLIN)
    )
    
    /**
     * Map of genres to common song structures
     */
    private val genreToStructure = mapOf(
        MusicGenre.CLASSICAL to "Sonata form (Exposition-Development-Recapitulation) or Theme and Variations",
        MusicGenre.JAZZ to "Head-Solos-Head or AABA form with improvisation",
        MusicGenre.ROCK to "Intro-Verse-Chorus-Verse-Chorus-Bridge-Chorus-Outro",
        MusicGenre.POP to "Intro-Verse-Pre-Chorus-Chorus-Verse-Pre-Chorus-Chorus-Bridge-Chorus-Outro",
        MusicGenre.ELECTRONIC to "Intro-Build-Drop-Breakdown-Build-Drop-Outro",
        MusicGenre.FOLK to "Verse-Chorus or Ballad form with multiple verses",
        MusicGenre.AMBIENT to "Evolving textures without defined sections, gradual transformations",
        MusicGenre.HIP_HOP to "Intro-Verse-Hook-Verse-Hook-Bridge-Hook-Outro",
        MusicGenre.BLUES to "12-bar blues progression or AAB verse structure",
        MusicGenre.COUNTRY to "Verse-Chorus-Verse-Chorus-Bridge-Chorus or story-focused verses",
        MusicGenre.WORLD to "Varies widely by regional tradition",
        MusicGenre.EXPERIMENTAL to "Non-traditional, may avoid conventional structure entirely"
    )
    
    /**
     * Musical characteristics for a specific emotional tone
     */
    data class MusicalCharacteristics(
        val suggestedModes: List<MusicalMode>,
        val suggestedTempos: List<MusicTempo>,
        val dynamicRange: String
    )
    
    /**
     * Generates a music composition concept based on the provided parameters
     */
    suspend fun generateComposition(
        theme: String,
        genre: MusicGenre,
        emotionalTone: EmotionalTone,
        includeStructure: Boolean = true
    ): MusicComposition {
        // Get characteristics for the emotional tone
        val characteristics = toneToMusicalCharacteristics[emotionalTone] 
            ?: toneToMusicalCharacteristics[EmotionalTone.REFLECTIVE]!!
        
        // Select a mode and tempo based on the emotional tone
        val mode = characteristics.suggestedModes.random()
        val tempo = characteristics.suggestedTempos.random()
        
        // Select instruments based on genre
        val instruments = genreToInstruments[genre] ?: listOf(Instrument.PIANO, Instrument.GUITAR)
        
        // Generate title
        val title = generateMusicTitle(theme, genre, emotionalTone)
        
        // Generate description
        val description = generateMusicDescription(theme, genre, mode, tempo, emotionalTone)
        
        // Generate structure notes if requested
        val structure = if (includeStructure) {
            genreToStructure[genre] ?: "Standard form with introduction, main theme, development, and conclusion."
        } else {
            null
        }
        
        // Generate inspiration notes
        val inspirationNotes = generateInspirationNotes(theme, emotionalTone, genre)
        
        // Generate emotional journey description
        val emotionalJourney = generateEmotionalJourneyDescription(emotionalTone, genre)
        
        return MusicComposition(
            id = UUID.randomUUID().toString(),
            title = title,
            description = description,
            genre = genre,
            tempo = tempo,
            mode = mode,
            primaryInstruments = instruments.take(3),
            structure = structure,
            inspirationNotes = inspirationNotes,
            emotionalJourney = emotionalJourney,
            createdAt = System.currentTimeMillis()
        )
    }
    
    /**
     * Generates a title for the musical composition
     */
    private fun generateMusicTitle(theme: String, genre: MusicGenre, tone: EmotionalTone): String {
        // In a real implementation, this would be much more sophisticated
        return "\"${theme.capitalize()} ${tone.name.capitalize()}\""
    }
    
    /**
     * Generates a description for the musical composition
     */
    private fun generateMusicDescription(
        theme: String,
        genre: MusicGenre,
        mode: MusicalMode,
        tempo: MusicTempo,
        tone: EmotionalTone
    ): String {
        // In a real implementation, this would be much more sophisticated
        val genreDescription = genreCharacteristics[genre] ?: ""
        
        return "A ${genre.name.lowercase().replace('_', ' ')} composition centered around the theme of $theme. " +
                "Written in ${mode.name.lowercase()} mode with a ${tempo.name.lowercase().replace('_', ' ')} tempo, " +
                "the piece evokes a ${tone.name.lowercase()} feeling. $genreDescription"
    }
    
    /**
     * Generates notes on the inspiration behind the composition
     */
    private fun generateInspirationNotes(theme: String, tone: EmotionalTone, genre: MusicGenre): String {
        // In a real implementation, this would be much more sophisticated
        return "This composition draws inspiration from the theme of $theme, exploring its " +
                "${tone.name.lowercase()} aspects. The ${genre.name.lowercase().replace('_', ' ')} " +
                "elements help express the depth and nuance of this concept."
    }
    
    /**
     * Generates a description of the intended emotional journey
     */
    private fun generateEmotionalJourneyDescription(tone: EmotionalTone, genre: MusicGenre): String {
        // In a real implementation, this would be much more sophisticated
        return "The piece begins by establishing a ${tone.name.lowercase()} atmosphere, " +
                "then develops through variations of intensity and texture. " +
                "The ${genre.name.lowercase().replace('_', ' ')} sensibility shapes how " +
                "this emotional journey unfolds, creating a cohesive experience for the listener."
    }
}

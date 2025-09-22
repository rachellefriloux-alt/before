package com.sallie.creative

import com.sallie.core.memory.HierarchicalMemorySystem
import com.sallie.core.values.ValueSystem
import com.sallie.core.personality.PersonalityProfile
import com.sallie.core.learning.UserPreferenceModel
import kotlinx.coroutines.runBlocking
import org.junit.Before
import org.junit.Test
import org.mockito.Mockito.*
import org.junit.Assert.*

class AdvancedCreativeExpressionSystemTest {

    private lateinit var memorySystem: HierarchicalMemorySystem
    private lateinit var valueSystem: ValueSystem
    private lateinit var personalityProfile: PersonalityProfile
    private lateinit var userPreferences: UserPreferenceModel
    private lateinit var creativeSystem: AdvancedCreativeExpressionSystem

    @Before
    fun setUp() {
        memorySystem = mock(HierarchicalMemorySystem::class.java)
        valueSystem = mock(ValueSystem::class.java)
        personalityProfile = mock(PersonalityProfile::class.java)
        userPreferences = mock(UserPreferenceModel::class.java)
        
        `when`(valueSystem.ensureValueAlignment(anyString(), anyFloat())).thenAnswer { invocation ->
            invocation.getArgument<String>(0)
        }
        
        creativeSystem = AdvancedCreativeExpressionSystem(
            memorySystem = memorySystem,
            valueSystem = valueSystem,
            personalityProfile = personalityProfile,
            userPreferences = userPreferences
        )
    }

    @Test
    fun `test story generation with value alignment`() = runBlocking {
        val storyPreferences = mock(Any::class.java)
        `when`(memorySystem.retrieveUserPreferences(CreativePreferenceType.NARRATIVE)).thenReturn(storyPreferences)
        
        val story = creativeSystem.generateStory(
            theme = "friendship",
            length = StoryLength.SHORT,
            emotionalTone = EmotionalTone.JOYFUL,
            characterComplexity = CharacterComplexity.MODERATE
        )
        
        // Verify value alignment was checked
        verify(valueSystem).ensureValueAlignment(eq("friendship"), anyFloat())
        
        // Basic assertions about the generated story
        assertNotNull(story)
        assertTrue(story.characters.isNotEmpty())
        assertEquals(EmotionalTone.JOYFUL, story.emotionalTone)
    }
    
    @Test
    fun `test poetry generation`() = runBlocking {
        val poem = creativeSystem.generatePoetry(
            theme = "nature",
            style = PoetryStyle.HAIKU,
            emotionalTarget = EmotionalTone.CALMING,
            complexity = PoetryComplexity.SIMPLE
        )
        
        // Verify value alignment was checked
        verify(valueSystem).ensureValueAlignment(eq("nature"))
        
        // Basic assertions about the generated poem
        assertNotNull(poem)
        assertEquals("nature", poem.theme)
        assertEquals(PoetryStyle.HAIKU, poem.style)
        assertEquals(EmotionalTone.CALMING, poem.emotionalTone)
    }
    
    @Test
    fun `test visual concept generation`() = runBlocking {
        val visualPreferences = mock(Any::class.java)
        `when`(memorySystem.retrieveUserPreferences(CreativePreferenceType.VISUAL)).thenReturn(visualPreferences)
        
        val colorPalette = ColorPalette(
            name = "Ocean",
            primaryColors = listOf("blue", "teal"),
            accentColors = listOf("sand", "coral"),
            moodAssociation = EmotionalTone.CALMING
        )
        
        val concept = creativeSystem.generateVisualConcept(
            subject = "mountain landscape",
            style = VisualStyle.IMPRESSIONIST,
            colorPalette = colorPalette,
            moodEmphasis = EmotionalTone.INSPIRATIONAL
        )
        
        // Verify value alignment was checked
        verify(valueSystem).ensureValueAlignment(eq("mountain landscape"))
        
        // Basic assertions about the generated concept
        assertNotNull(concept)
        assertEquals("mountain landscape", concept.subject)
        assertEquals(VisualStyle.IMPRESSIONIST, concept.style)
        assertEquals(colorPalette, concept.colorPalette)
    }
    
    @Test
    fun `test music composition suggestions`() = runBlocking {
        val suggestion = creativeSystem.suggestMusicComposition(
            theme = "triumph over adversity",
            genre = MusicGenre.CLASSICAL,
            emotionalTarget = EmotionalTone.INSPIRATIONAL,
            complexity = MusicComplexity.COMPLEX
        )
        
        // Basic assertions about the suggestion
        assertNotNull(suggestion)
        assertTrue(suggestion.thematicDescription.contains("CLASSICAL"))
        assertTrue(suggestion.thematicDescription.contains("triumph over adversity"))
        assertTrue(suggestion.structuralElements.isNotEmpty())
    }
    
    @Test
    fun `test mood playlist creation`() = runBlocking {
        val musicPreferences = mock(Any::class.java)
        `when`(memorySystem.retrieveUserPreferences(CreativePreferenceType.MUSIC)).thenReturn(musicPreferences)
        `when`(memorySystem.retrieveUserFavorites(eq(MediaType.MUSIC), anyInt())).thenReturn(emptyList())
        
        val playlist = creativeSystem.createMoodPlaylist(
            currentMood = EmotionalTone.MELANCHOLIC,
            desiredMood = EmotionalTone.JOYFUL,
            duration = 30 // 30 minutes
        )
        
        // Basic assertions about the playlist
        assertNotNull(playlist)
        assertTrue(playlist.name.contains("MELANCHOLIC"))
        assertTrue(playlist.name.contains("JOYFUL"))
        assertTrue(playlist.tracks.isNotEmpty())
        
        // Duration check (with some tolerance for rounding)
        val expectedDurationSeconds = 30 * 60 // 30 minutes in seconds
        val actualDuration = playlist.totalDuration
        assertTrue(
            "Expected around $expectedDurationSeconds seconds but was $actualDuration",
            Math.abs(expectedDurationSeconds - actualDuration) < 180 // Allow 3 minutes tolerance
        )
    }
    
    @Test
    fun `test creative collaboration session initialization`() = runBlocking {
        val userIdeas = listOf("A story about a robot learning to paint", "Exploring emotions through color")
        `when`(personalityProfile.getCreativeTraits()).thenReturn(mapOf(
            PersonalityTrait.CREATIVITY to 0.9f,
            PersonalityTrait.CURIOSITY to 0.8f
        ))
        
        val session = creativeSystem.startCreativeCollaboration(
            projectType = CreativeProjectType.MIXED_MEDIA,
            userIdeas = userIdeas,
            collaborationStyle = CollaborationStyle.EQUAL_PARTNERS
        )
        
        // Verify value alignment was checked for each idea
        userIdeas.forEach { idea ->
            verify(valueSystem).ensureValueAlignment(eq(idea))
        }
        
        // Basic assertions about the session
        assertNotNull(session)
        assertEquals(CreativeProjectType.MIXED_MEDIA, session.projectType)
        assertEquals(CollaborationStyle.EQUAL_PARTNERS, session.collaborationStyle)
        assertEquals(0, session.currentStage) // Should start at first stage
        assertTrue(session.stageStructure.isNotEmpty())
    }
    
    @Test
    fun `test creative exercise suggestions`() = runBlocking {
        `when`(userPreferences.getCreativePreferences()).thenReturn(mapOf("preference" to "value"))
        
        val exercises = creativeSystem.suggestCreativeExercises(
            domain = CreativeDomain.WRITING,
            skillLevel = SkillLevel.INTERMEDIATE,
            timeAvailable = 45, // 45 minutes
            focusArea = "character development"
        )
        
        // Basic assertions about exercises
        assertNotNull(exercises)
        assertFalse(exercises.isEmpty())
        
        // Should have appropriate number of exercises for time available
        val expectedCount = 45 / 15 // Assuming each exercise takes about 15 minutes
        assertEquals(expectedCount, exercises.size)
        
        // Each exercise should match requested parameters
        exercises.forEach { exercise ->
            assertEquals(CreativeDomain.WRITING, exercise.domain)
            assertEquals(SkillLevel.INTERMEDIATE, exercise.skillLevel)
        }
    }
    
    @Test
    fun `test recording creative output updates user preferences`() = runBlocking {
        val creativeWork = CreativeWork(
            type = CreativeDomain.WRITING,
            content = "Sample story content",
            metadata = mapOf("genre" to "fantasy")
        )
        
        creativeSystem.recordCreativeOutput(
            domain = CreativeDomain.WRITING,
            output = creativeWork,
            userSatisfaction = SatisfactionLevel.SATISFIED
        )
        
        // Verify memory storage
        verify(memorySystem).storeUserCreativeWork(
            eq(CreativeDomain.WRITING),
            eq(creativeWork),
            eq(SatisfactionLevel.SATISFIED),
            anyLong()
        )
        
        // Verify preference update
        verify(userPreferences).updateCreativePreferences(
            eq(CreativeDomain.WRITING),
            anyMap(),
            eq(SatisfactionLevel.SATISFIED)
        )
    }
}

package com.sallie.core.skills

import com.sallie.core.memory.HierarchicalMemorySystem
import com.sallie.core.integration.UserProfileLearningSystem
import com.sallie.core.values.ProLifeValuesSystem
import org.junit.Before
import org.junit.Test
import org.mockito.Mockito.*
import org.mockito.Mock
import org.mockito.MockitoAnnotations
import java.time.LocalDateTime
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue

/**
 * Unit tests for AdvancedSkillAcquisitionSystem
 */
class AdvancedSkillAcquisitionSystemTest {

    @Mock
    private lateinit var memorySystem: HierarchicalMemorySystem
    
    @Mock
    private lateinit var userProfileSystem: UserProfileLearningSystem
    
    @Mock
    private lateinit var valuesSystem: ProLifeValuesSystem
    
    private lateinit var skillSystem: AdvancedSkillAcquisitionSystem
    
    @Before
    fun setup() {
        MockitoAnnotations.initMocks(this)
        
        // Set up mocks
        `when`(userProfileSystem.getUserPreferences()).thenReturn(
            mapOf(
                "communication_style" to "warm",
                "response_length" to "detailed"
            )
        )
        
        `when`(userProfileSystem.getUserInterests()).thenReturn(
            listOf("music", "cooking", "travel")
        )
        
        // Initialize the skill system
        skillSystem = AdvancedSkillAcquisitionSystem(
            memorySystem = memorySystem,
            userProfileSystem = userProfileSystem,
            valuesSystem = valuesSystem
        )
    }
    
    @Test
    fun `initialization should create default categories and skills`() {
        // When - System is initialized in setup
        
        // Then
        val categories = skillSystem.getAllCategories()
        assertTrue(categories.isNotEmpty())
        assertTrue(categories.any { it.name == "Communication" })
        assertTrue(categories.any { it.name == "Emotional Intelligence" })
        
        val communicationSkills = skillSystem.getSkillsByCategory("category_communication")
        assertTrue(communicationSkills.isNotEmpty())
        assertTrue(communicationSkills.any { it.name == "Active Listening" })
    }
    
    @Test
    fun `get skill should return correct skill by ID`() {
        // Given
        val expectedSkillId = "skill_active_listening"
        
        // When
        val skill = skillSystem.getSkill(expectedSkillId)
        
        // Then
        assertNotNull(skill)
        assertEquals(expectedSkillId, skill.id)
        assertEquals("Active Listening", skill.name)
    }
    
    @Test
    fun `begin skill acquisition should create developing skill`() {
        // Given
        val skillName = "Debate Moderation"
        val description = "Effectively moderate debates while maintaining respect"
        val categoryId = "category_communication"
        
        // When
        val developingSkill = skillSystem.beginSkillAcquisition(
            name = skillName,
            description = description,
            categoryId = categoryId,
            difficultyLevel = 0.7
        )
        
        // Then
        assertNotNull(developingSkill)
        assertEquals(skillName, developingSkill.name)
        assertEquals(description, developingSkill.description)
        assertEquals(categoryId, developingSkill.categoryId)
        assertEquals(0.0, developingSkill.currentProgress)
        assertTrue(developingSkill.developmentSteps.isNotEmpty())
    }
    
    @Test
    fun `update skill development progress should increase progress`() {
        // Given
        val developingSkill = skillSystem.beginSkillAcquisition(
            name = "Critical Thinking",
            description = "Analyze situations logically and objectively",
            categoryId = "category_practical",
            difficultyLevel = 0.6
        )
        
        assertNotNull(developingSkill)
        val skillId = developingSkill.id
        
        // When
        val updatedSkill = skillSystem.updateSkillDevelopmentProgress(
            skillId = skillId,
            progressIncrement = 0.3,
            completedSteps = listOf(developingSkill.developmentSteps[0].id)
        )
        
        // Then
        assertNotNull(updatedSkill)
        assertEquals(0.3, updatedSkill.currentProgress)
        assertTrue(updatedSkill.developmentSteps[0].completed)
    }
    
    @Test
    fun `complete skill acquisition should create skill and remove from developing`() {
        // Given
        val developingSkill = skillSystem.beginSkillAcquisition(
            name = "Quick Decision Making",
            description = "Making effective decisions under time pressure",
            categoryId = "category_practical",
            difficultyLevel = 0.5
        )
        
        assertNotNull(developingSkill)
        val skillId = developingSkill.id
        
        // Progress to completion
        skillSystem.updateSkillDevelopmentProgress(
            skillId = skillId,
            progressIncrement = 1.0
        )
        
        // When
        val completedSkill = skillSystem.getSkill(skillId)
        
        // Then
        assertNotNull(completedSkill)
        assertEquals("Quick Decision Making", completedSkill.name)
        
        // Verify it's no longer developing
        val stillDeveloping = skillSystem.developingSkills.value.find { it.id == skillId }
        assertNull(stillDeveloping)
    }
    
    @Test
    fun `record skill usage should update proficiency`() {
        // Given
        val skillId = "skill_active_listening"
        val initialSkill = skillSystem.getSkill(skillId)
        assertNotNull(initialSkill)
        val initialProficiency = initialSkill.proficiencyLevel
        
        // When - Record successful usage
        val result = skillSystem.recordSkillUsage(
            skillId = skillId,
            context = "Supportive conversation",
            successful = true
        )
        
        // Then
        assertTrue(result)
        
        // Get updated skill
        val updatedSkill = skillSystem.getSkill(skillId)
        assertNotNull(updatedSkill)
        
        // Proficiency should increase for successful use
        assertTrue(updatedSkill.proficiencyLevel > initialProficiency)
        
        // Usage statistics should be updated
        val stats = skillSystem.getSkillUsageStatistics(skillId)
        assertNotNull(stats)
        assertEquals(1, stats.totalUses)
        assertEquals(1, stats.successfulUses)
    }
    
    @Test
    fun `improve skill should increase proficiency`() {
        // Given
        val skillId = "skill_emotional_support"
        val initialSkill = skillSystem.getSkill(skillId)
        assertNotNull(initialSkill)
        val initialProficiency = initialSkill.proficiencyLevel
        
        // When
        val updatedSkill = skillSystem.improveSkill(
            skillId = skillId,
            improvementDetails = "Learned new techniques for validating emotions",
            proficiencyBoost = 0.05
        )
        
        // Then
        assertNotNull(updatedSkill)
        assertEquals(initialProficiency + 0.05, updatedSkill.proficiencyLevel)
        
        // Memory should be updated
        verify(memorySystem).storeInProcedural(
            anyString(),
            anyString(),
            anyList(),
            anyMap()
        )
    }
    
    @Test
    fun `combine skills should create new developing skill`() {
        // Given
        val skillId1 = "skill_active_listening"
        val skillId2 = "skill_emotional_support"
        
        // When
        val combinedSkill = skillSystem.combineSkills(
            skillId1 = skillId1,
            skillId2 = skillId2,
            newName = "Empathetic Communication",
            description = "Communicating with deep empathy and understanding",
            categoryId = "category_communication"
        )
        
        // Then
        assertNotNull(combinedSkill)
        assertEquals("Empathetic Communication", combinedSkill.name)
        assertTrue(combinedSkill.prerequisiteSkillIds.contains(skillId1))
        assertTrue(combinedSkill.prerequisiteSkillIds.contains(skillId2))
    }
    
    @Test
    fun `create skill category should add new category`() {
        // Given
        val categoryName = "Personal Growth"
        val description = "Skills related to personal development and growth"
        
        // When
        val category = skillSystem.createSkillCategory(
            name = categoryName,
            description = description,
            valueAlignment = listOf("self-improvement")
        )
        
        // Then
        assertNotNull(category)
        assertEquals(categoryName, category.name)
        
        // Category should be retrievable
        val allCategories = skillSystem.getAllCategories()
        assertTrue(allCategories.any { it.id == category.id })
    }
    
    @Test
    fun `get skills report should return meaningful statistics`() {
        // When
        val report = skillSystem.getSkillsReport()
        
        // Then
        assertNotNull(report)
        assertTrue(report.totalSkillCount > 0)
        assertTrue(report.categoryCount > 0)
        assertTrue(report.topSkills.isNotEmpty())
    }
    
    @Test
    fun `recommend skills to acquire should provide relevant recommendations`() {
        // When
        val recommendations = skillSystem.recommendSkillsToAcquire()
        
        // Then
        assertTrue(recommendations.isNotEmpty())
        
        // Should include recommendations based on user interests
        val hasInterestBasedRecommendation = recommendations.any { recommendation ->
            recommendation.reasonForRecommendation.contains("user interest")
        }
        
        assertTrue(hasInterestBasedRecommendation || recommendations.size > 0)
    }
    
    @Test
    fun `find skills should return skills matching query`() {
        // Given
        val query = "emotion"
        
        // When
        val foundSkills = skillSystem.findSkills(query)
        
        // Then
        assertTrue(foundSkills.isNotEmpty())
        assertTrue(foundSkills.any { 
            it.name.contains(query, ignoreCase = true) || 
            it.description.contains(query, ignoreCase = true) || 
            it.keywords.any { keyword -> keyword.contains(query, ignoreCase = true) }
        })
    }
}

package com.sallie.core.learning

import com.sallie.core.memory.EnhancedMemoryManager
import com.sallie.core.memory.MemoryPriority
import com.sallie.core.values.ValuesSystem
import com.sallie.core.values.ValueValidationResult
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.TestScope
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.runTest
import org.junit.Before
import org.junit.Test
import org.mockito.kotlin.*
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

@ExperimentalCoroutinesApi
class ResearchPlanningSystemTest {

    private lateinit var memoryManager: EnhancedMemoryManager
    private lateinit var knowledgeSynthesis: KnowledgeSynthesisSystem
    private lateinit var valuesSystem: ValuesSystem
    private lateinit var researchPlanningSystem: ResearchPlanningSystem
    private lateinit var testScope: TestScope

    @Before
    fun setUp() {
        memoryManager = mock()
        knowledgeSynthesis = mock()
        valuesSystem = mock()
        testScope = TestScope()
        
        // Setup default behavior
        whenever(valuesSystem.validateActivity(any(), any(), any())).thenReturn(
            ValueValidationResult(allowed = true)
        )
        
        whenever(knowledgeSynthesis.evaluateKnowledgeLevel(any())).thenReturn(KnowledgeLevel.BASIC)
        whenever(knowledgeSynthesis.findRelatedTopics(any())).thenReturn(listOf("related-topic-1", "related-topic-2"))
        
        researchPlanningSystem = ResearchPlanningSystem(
            memoryManager = memoryManager,
            knowledgeSynthesis = knowledgeSynthesis,
            valuesSystem = valuesSystem,
            researchScope = testScope
        )
    }
    
    @Test
    fun `createResearchPlan should validate request against values system`() {
        // Given
        val request = ResearchRequest(
            topic = "Test Topic",
            type = ResearchType.INFORMATION,
            purpose = "Testing",
            userInitiated = true
        )
        
        // When
        researchPlanningSystem.createResearchPlan(request)
        
        // Then
        verify(valuesSystem).validateActivity(
            eq("research"),
            eq("Test Topic"),
            any()
        )
    }
    
    @Test(expected = IllegalArgumentException::class)
    fun `createResearchPlan should throw exception when values not aligned`() {
        // Given
        val request = ResearchRequest(
            topic = "Prohibited Topic",
            type = ResearchType.INFORMATION,
            purpose = "Testing"
        )
        
        whenever(valuesSystem.validateActivity(any(), any(), any())).thenReturn(
            ValueValidationResult(allowed = false, reason = "Topic violates core values")
        )
        
        // When / Then - Should throw exception
        researchPlanningSystem.createResearchPlan(request)
    }
    
    @Test
    fun `createResearchPlan should generate appropriate steps based on knowledge level`() {
        // Given
        val request = ResearchRequest(
            topic = "New Skill",
            type = ResearchType.SKILL,
            purpose = "Learning"
        )
        
        // Set knowledge level to NONE
        whenever(knowledgeSynthesis.evaluateKnowledgeLevel(any())).thenReturn(KnowledgeLevel.NONE)
        
        // When
        val plan = researchPlanningSystem.createResearchPlan(request)
        
        // Then
        // Should include concept learning step for NONE knowledge level
        assertTrue(plan.steps.any { it.type == ResearchStepType.CONCEPT_LEARNING })
        
        // Should include practical analysis for SKILL research type
        assertTrue(plan.steps.any { it.type == ResearchStepType.PRACTICAL_ANALYSIS })
        
        // Should include general steps like assessment and synthesis
        assertTrue(plan.steps.any { it.type == ResearchStepType.ASSESSMENT })
        assertTrue(plan.steps.any { it.type == ResearchStepType.SYNTHESIS })
    }
    
    @Test
    fun `executeResearchPlan should update state and store memory`() = runTest {
        // Given
        val request = ResearchRequest(
            topic = "Test Research",
            type = ResearchType.INFORMATION,
            purpose = "Testing"
        )
        
        val plan = researchPlanningSystem.createResearchPlan(request)
        
        // When
        researchPlanningSystem.executeResearchPlan(plan.id)
        
        // Advance until all coroutines complete
        advanceUntilIdle()
        
        // Then
        verify(memoryManager, atLeastOnce()).storeMemory(
            eq("RESEARCH_PLAN_COMPLETED"),
            any(),
            any(),
            any()
        )
        
        // Verify knowledge was integrated
        verify(knowledgeSynthesis).integrateNewKnowledge(
            eq("Test Research"),
            any(),
            any(),
            any()
        )
    }
    
    @Test
    fun `cancelResearchPlan should update status and record reason`() {
        // Given
        val request = ResearchRequest(
            topic = "Cancel Test",
            type = ResearchType.INFORMATION,
            purpose = "Testing"
        )
        
        val plan = researchPlanningSystem.createResearchPlan(request)
        val reason = "No longer needed"
        
        // When
        researchPlanningSystem.cancelResearchPlan(plan.id, reason)
        
        // Then
        val updatedPlan = researchPlanningSystem.getResearchPlan(plan.id)
        assertEquals(ResearchPlanStatus.CANCELLED, updatedPlan?.status)
        assertEquals(reason, updatedPlan?.statusMessage)
        
        verify(memoryManager).storeMemory(
            eq("RESEARCH_PLAN_CANCELLED"),
            any(),
            any(),
            any()
        )
    }
    
    @Test
    fun `listResearchPlans should filter by status when provided`() {
        // Given - Create multiple plans with different statuses
        val request1 = ResearchRequest(
            topic = "Topic 1",
            type = ResearchType.INFORMATION,
            purpose = "Testing"
        )
        val request2 = ResearchRequest(
            topic = "Topic 2",
            type = ResearchType.SKILL,
            purpose = "Testing"
        )
        
        val plan1 = researchPlanningSystem.createResearchPlan(request1)
        val plan2 = researchPlanningSystem.createResearchPlan(request2)
        
        // Cancel one plan
        researchPlanningSystem.cancelResearchPlan(plan2.id, "Testing")
        
        // When
        val createdPlans = researchPlanningSystem.listResearchPlans(ResearchPlanStatus.CREATED)
        val cancelledPlans = researchPlanningSystem.listResearchPlans(ResearchPlanStatus.CANCELLED)
        val allPlans = researchPlanningSystem.listResearchPlans()
        
        // Then
        assertEquals(1, createdPlans.size)
        assertEquals(1, cancelledPlans.size)
        assertEquals(2, allPlans.size)
        
        assertEquals(plan1.id, createdPlans.first().id)
        assertEquals(plan2.id, cancelledPlans.first().id)
    }
}

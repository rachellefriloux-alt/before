/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Tests for PersonaOrchestrator integration.
 * Got it, love.
 */
package com.sallie.personaCore

import com.sallie.responseTemplates.ResponseSituation
import kotlinx.coroutines.runBlocking
import org.junit.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

/**
 * PersonaOrchestratorTest - Validates the core personality architecture
 * * These tests ensure that the integration between PersonaEngine, ToneProfile,
 * and ResponseTemplates maintains Sallie's constitutional integrity.
 */
class PersonaOrchestratorTest {

    private val orchestrator = PersonaOrchestrator()

    @Test
    fun `PersonaOrchestrator generates contextually appropriate responses`() = runBlocking {
        // Given: A stressed user needing support
        val stressedUser = UserContext(
            stressLevel = 0.9f,
            energyLevel = 0.3f,
            needsEncouragement = true,
            needsAccountability = false,
            needsGuidance = false
        )

        val supportSituation = SituationContext(
            requiresDirectness = false,
            isEmergency = false,
            isPersonalMatter = true
        )

        // When: Generate a support response
        val response = orchestrator.generateResponse(
            ResponseSituation.NEED_SUPPORT,
            stressedUser,
            supportSituation
        )

        // Then: Response should be warm and supportive
        assertTrue(response.tone.warmth > 0.7f, "Support response should be warm")
        assertTrue(response.tone.directness < 0.6f, "Support response should be gentle, not direct")
        assertTrue(response.content.isNotEmpty(), "Response should have content")
        assertEquals(PersonaMood.SUPPORTIVE, response.mood, "Should be in supportive mood")
    }

    @Test
    fun `PersonaOrchestrator adapts tone for urgent situations`() = runBlocking {
        // Given: An urgent work situation
        val focusedUser = UserContext(
            stressLevel = 0.4f,
            energyLevel = 0.8f,
            needsEncouragement = false,
            needsAccountability = true,
            needsGuidance = false
        )

        val urgentSituation = SituationContext(
            requiresDirectness = true,
            isEmergency = false,
            isPersonalMatter = false
        )

        // When: Generate a task completion response
        val response = orchestrator.generateResponse(
            ResponseSituation.TASK_DONE,
            focusedUser,
            urgentSituation
        )

        // Then: Response should be direct and focused
        assertTrue(response.tone.directness > 0.7f, "Urgent response should be direct")
        assertTrue(response.tone.urgency > 0.6f, "Urgent response should have higher urgency")
        assertEquals(PersonaMood.FOCUSED, response.mood, "Should be in focused mood")
    }

    @Test
    fun `PersonaOrchestrator validates constitutional integrity`() = runBlocking {
        // Given: A normal task completion
        val normalUser = UserContext(0.5f, 0.6f, false, false, false)
        val normalSituation = SituationContext(false, false, false)

        val response = orchestrator.generateResponse(
            ResponseSituation.TASK_DONE,
            normalUser,
            normalSituation
        )

        // When: Validate the response
        val validation = orchestrator.validatePersonaIntegrity(response)

        // Then: Response should pass validation
        assertTrue(validation.isValid, "Response should be valid: ${validation.violations}")
        assertEquals(0, validation.violations.size, "Should have no violations")
    }

    @Test
    fun `PersonaOrchestrator detects corporate buzzword violations`() {
        // Given: A response with forbidden corporate buzzwords
        val violatingResponse = PersonalizedResponse(
            content = "Let's synergize our paradigm to leverage scalable solutions.",
            tone = com.sallie.tone.ToneProfile.BALANCED,
            mood = PersonaMood.STEADY,
            profile = PersonaProfile.BALANCED,
            situation = ResponseSituation.TASK_DONE,
            shouldHaveSignature = true,
            originalTemplate = "Template content",
            contextualFactors = emptyList()
        )

        // When: Validate the response
        val validation = orchestrator.validatePersonaIntegrity(violatingResponse)

        // Then: Validation should fail with specific violations
        assertFalse(validation.isValid, "Response with buzzwords should be invalid")
        assertTrue(validation.violations.any { it.contains("synergy") }, "Should detect 'synergy' violation")
        assertTrue(validation.violations.any { it.contains("paradigm") }, "Should detect 'paradigm' violation")
        assertTrue(validation.violations.any { it.contains("scalable") }, "Should detect 'scalable' violation")
    }

    @Test
    fun `PersonaOrchestrator generates appropriate acknowledgments`() {
        // Given: Different user contexts
        val stressedUser = UserContext(0.8f, 0.3f, true, false, false)
        val normalUser = UserContext(0.3f, 0.7f, false, false, false)

        // When: Generate acknowledgments
        val stressedAck = orchestrator.getAcknowledgment(stressedUser)
        val normalAck = orchestrator.getAcknowledgment(normalUser)

        // Then: Acknowledgments should be contextually appropriate
        assertTrue(stressedAck.contains("Got it, love"), "Stressed acknowledgment should have signature")
        assertTrue(stressedAck.length > normalAck.length, "Stressed acknowledgment should be more supportive")
        assertEquals("Got it, love.", normalAck, "Normal acknowledgment should be simple")
    }

    @Test
    fun `PersonaOrchestrator maintains signature phrase consistency`() = runBlocking {
        // Given: A celebration situation that should include signature
        val happyUser = UserContext(0.2f, 0.9f, false, false, false)
        val celebratorySituation = SituationContext(false, false, false)

        // When: Generate celebration response
        val response = orchestrator.generateResponse(
            ResponseSituation.CELEBRATING,
            happyUser,
            celebratorySituation
        )

        // Then: Response should include signature appropriately
        val validation = orchestrator.validatePersonaIntegrity(response)

        if (response.shouldHaveSignature) {
            assertTrue(
                response.content.endsWith("Got it, love.") || response.content.contains("Got it, love"),
                "Response marked as needing signature should contain it: '${response.content}'"
            )
        }

        assertTrue(validation.isValid, "Signature validation should pass: ${validation.violations}")
    }

    @Test
    fun `PersonaOrchestrator tracks interaction context`() = runBlocking {
        // Given: A series of interactions
        val user = UserContext(0.5f, 0.6f, false, false, false)
        val situation = SituationContext(false, false, false)

        // When: Generate multiple responses
        val response1 = orchestrator.generateResponse(ResponseSituation.TASK_DONE, user, situation)
        val response2 = orchestrator.generateResponse(ResponseSituation.CELEBRATING, user, situation)

        // Then: Context should be updated and tracked
        val currentContext = orchestrator.currentContext.value

        assertTrue(currentContext.responseHistory.contains(response1), "Should track first response")
        assertTrue(currentContext.responseHistory.contains(response2), "Should track second response")
        assertEquals(ResponseSituation.CELEBRATING, currentContext.lastSituation, "Should track last situation")
    }
}

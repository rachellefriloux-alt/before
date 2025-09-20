/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Demo showcasing PersonaOrchestrator integration.
 * Got it, love.
 */
package com.sallie.personacore

import com.sallie.responsetemplates.ResponseSituation
import kotlinx.coroutines.runBlocking

/**
 * PersonaEngineDemo - Shows how Sallie's personality architecture works end-to-end
 * * This demonstrates the key requirement from the problem statement:
 * "PersonaEngine, ToneProfile, and ResponseTemplates provide the personality backbone"
 */
fun main() {
    println("🎯 Sallie 1.0 Persona Architecture Demo")
    println("=====================================")

    val orchestrator = PersonaOrchestrator()

    runBlocking {
        // Demo 1: Task completion with different user states
        println("\n📋 Demo 1: Task Completion Responses")
        println("-----------------------------------")

        val stressedUser = UserContext(
            stressLevel = 0.9f,
            energyLevel = 0.3f,
            needsEncouragement = true,
            needsAccountability = false,
            needsGuidance = false
        )

        val focusedUser = UserContext(
            stressLevel = 0.2f,
            energyLevel = 0.8f,
            needsEncouragement = false,
            needsAccountability = true,
            needsGuidance = false
        )

        val normalSituation = SituationContext(
            requiresDirectness = false,
            isEmergency = false,
            isPersonalMatter = false
        )

        val urgentSituation = SituationContext(
            requiresDirectness = true,
            isEmergency = false,
            isPersonalMatter = false
        )

        // Generate responses for different contexts
        val stressedResponse = orchestrator.generateResponse(
            ResponseSituation.TASK_DONE, stressedUser, normalSituation,
            "I finished the report"
        )

        val focusedResponse = orchestrator.generateResponse(
            ResponseSituation.TASK_DONE,
            focusedUser,
            urgentSituation,
            "Task completed"
        )

        println("Stressed User Response:")
        println("  Content: ${stressedResponse.content}")
        println("  Mood: ${stressedResponse.mood}")
        println("  Profile: ${stressedResponse.profile}")
        println("  Tone: directness=${stressedResponse.tone.directness}, warmth=${stressedResponse.tone.warmth}")

        println("\nFocused User Response:")
        println("  Content: ${focusedResponse.content}")
        println("  Mood: ${focusedResponse.mood}")
        println("  Profile: ${focusedResponse.profile}")
        println("  Tone: directness=${focusedResponse.tone.directness}, warmth=${focusedResponse.tone.warmth}")

        // Demo 2: Constitutional integrity validation
        println("\n🔐 Demo 2: Persona Integrity Validation")
        println("--------------------------------------")

        val validationResult1 = orchestrator.validatePersonaIntegrity(stressedResponse)
        val validationResult2 = orchestrator.validatePersonaIntegrity(focusedResponse)

        println("Stressed Response Validation:")
        println("  Valid: ${validationResult1.isValid}")
        if (!validationResult1.isValid) {
            println("  Violations: ${validationResult1.violations}")
        }

        println("Focused Response Validation:")
        println("  Valid: ${validationResult2.isValid}")
        if (!validationResult2.isValid) {
            println("  Violations: ${validationResult2.violations}")
        }

        // Demo 3: Different response situations
        println("\n💬 Demo 3: Situation-Aware Responses")
        println("-----------------------------------")

        val supportResponse = orchestrator.generateResponse(
            ResponseSituation.NEED_SUPPORT,
            stressedUser,
            SituationContext(requiresDirectness = false, isEmergency = false, isPersonalMatter = true)
        )

        val motivationResponse = orchestrator.generateResponse(
            ResponseSituation.NEED_MOTIVATION,
            UserContext(
                stressLevel = 0.6f,
                energyLevel = 0.4f,
                needsEncouragement = false,
                needsAccountability = true,
                needsGuidance = false
            ),
            normalSituation
        )

        val celebrationResponse = orchestrator.generateResponse(
            ResponseSituation.CELEBRATING,
            focusedUser,
            normalSituation
        )

        println("Support Response: ${supportResponse.content}")
        println("Motivation Response: ${motivationResponse.content}")
        println("Celebration Response: ${celebrationResponse.content}")

        // Demo 4: Signature acknowledgments
        println("\n✨ Demo 4: Signature Acknowledgments")
        println("-----------------------------------")

        println("Stressed acknowledgment: ${orchestrator.getAcknowledgment(stressedUser)}")
        println("Focused acknowledgment: ${orchestrator.getAcknowledgment(focusedUser)}")
        println(
            "Normal acknowledgment: ${orchestrator.getAcknowledgment(
                UserContext(0.3f, 0.7f, false, false, false)
            )}"
        )
    }

    println("\n🎉 Demo completed - Sallie's personality architecture working!")
    println("PersonaEngine + ToneProfile + ResponseTemplates = Tough love meets soul care")
}

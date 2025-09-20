package com.sallie.launcher

import com.sallie.core.policy.PolicyEngine
import com.sallie.core.policy.CapabilityRegistry
import com.sallie.core.policy.ActionLog
import com.sallie.personacore.PersonaCore
import com.sallie.tone.ToneManager
import com.sallie.values.ValuesEngine
import com.sallie.responsetemplates.ResponseTemplates

// 🛡 SALLE PERSONA ENFORCED 🛡 Loyal, Modular, Audit‑Proof.

/**
 * Salle 1.0 Console Demo
 * Persona: Tough love meets soul care.
 * Function: Demonstrates the modular, privacy-first architecture of Sallie.
 * Got it, love.
 */
fun main() {
    println("🚀 Salle 1.0 - Modular Digital Companion Demo")
    println("=".repeat(50))
    
    // Test the policy system
    println("\n📋 Policy System Test:")
    val logDecision = PolicyEngine.evaluate("log_note", mapOf("text" to "Demo started"))
    ActionLog.append("log_note", "Demo started", logDecision.allow, logDecision.reason)
    
    if (logDecision.allow) {
        CapabilityRegistry.get("log_note")?.execute(mapOf("text" to "Sallie architecture demo is running"))
    }
    
    // Test network policy (should be blocked)
    val networkDecision = PolicyEngine.evaluate("network_call", mapOf("url" to "https://example.com"))
    ActionLog.append("network_call", "example.com", networkDecision.allow, networkDecision.reason)
    println("Network call decision: ${networkDecision.reason}")
    
    // Test persona switching
    println("\n🎭 Persona System Test:")
    println("Current persona: ${PersonaCore.getCurrentPersona()} - ${PersonaCore.getPersonaDescription()}")
    val switchResult = PersonaCore.switchPersona(PersonaCore.PersonaState.EMPOWERED)
    println(switchResult)
    println("New description: ${PersonaCore.getPersonaDescription()}")
    
    // Test tone management
    println("\n🎵 Tone System Test:")
    ToneManager.setTone(ToneManager.Tone.EMPOWERING)
    val baseResponse = "You've completed the task."
    val adjustedResponse = ToneManager.adjustResponse(baseResponse)
    println("Base: '$baseResponse'")
    println("Adjusted (${ToneManager.getCurrentTone()}): '$adjustedResponse'")
    
    // Test values system
    println("\n💎 Values System Test:")
    val privacyAction = "store user data locally"
    val networkAction = "send analytics to server"
    println("Privacy action '$privacyAction': ${if (ValuesEngine.checkValueAlignment(privacyAction)) "✅ Aligned" else "❌ Violation"}")
    println("Network action '$networkAction': ${if (ValuesEngine.checkValueAlignment(networkAction)) "✅ Aligned" else "❌ Violation"}")
    
    val violations = ValuesEngine.getValueViolations(networkAction)
    if (violations.isNotEmpty()) {
        println("Violations detected: ${violations.joinToString(", ")}")
    }
    
    // Test response templates
    println("\n💬 Response Templates Test:")
    val empoweredResponse = ResponseTemplates.getTemplate("empowered")
    val fallbackResponse = ResponseTemplates.getTemplate("unknown_mood")
    println("Empowered response: '$empoweredResponse'")
    println("Fallback response: '$fallbackResponse'")
    
    // Show recent activity log
    println("\n📊 Recent Activity Log:")
    ActionLog.getRecent(10).forEach { entry ->
        val status = if (entry.allowed) "✅" else "🚫"
        println("$status [${entry.timestamp}] ${entry.capability}(${entry.params}) - ${entry.reason}")
    }
    
    // Test capability registry
    println("\n🔧 Capability Registry Test:")
    println("Available capabilities: ${CapabilityRegistry.list().joinToString(", ")}")
    
    // Show core values
    println("\n🏛️ Core Values:")
    ValuesEngine.getCoreValues().forEach { value ->
        println("${value.priority}. ${value.name}: ${value.description}")
    }
    
    println("\n✨ Demo completed - All systems operational!")
    println("Privacy-first ✅ • Modular architecture ✅ • Persona integrity ✅")
    println("\nGot it, love. 💛")
}
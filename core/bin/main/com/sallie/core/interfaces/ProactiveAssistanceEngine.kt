/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Interface for proactive assistance capabilities.
 * Got it, love.
 */
package com.sallie.core.interfaces

/**
 * Interface defining the contract for proactive assistance capabilities.
 * This resolves circular dependency issues between core and feature modules.
 */
interface IProactiveAssistanceEngine {
    fun generateProactiveInsights(userContext: Map<String, Any>): List<String>
    fun suggestAutomation(taskDescription: String): List<String>
    fun anticipateUserNeeds(recentActions: List<String>): List<String>
    fun prioritizeSuggestions(suggestions: List<String>, urgency: Int): List<String>
}

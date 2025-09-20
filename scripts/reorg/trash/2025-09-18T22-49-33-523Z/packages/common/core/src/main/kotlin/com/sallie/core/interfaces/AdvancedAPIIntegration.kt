/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Interface for advanced API integration capabilities.
 * Got it, love.
 */
package com.sallie.core.interfaces

/**
 * Interface defining the contract for advanced API integration capabilities.
 * This resolves circular dependency issues between core and feature modules.
 */
interface IAdvancedAPIIntegration {
    fun getIntegrationStatus(): Map<String, Boolean>
    fun executeAPIRequest(service: String, endpoint: String, params: Map<String, Any>): Map<String, Any>
    fun isAvailable(service: String): Boolean
    fun handleResponse(response: Map<String, Any>): Map<String, Any>
}

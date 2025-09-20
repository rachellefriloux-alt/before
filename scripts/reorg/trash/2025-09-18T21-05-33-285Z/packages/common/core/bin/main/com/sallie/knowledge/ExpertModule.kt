/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * Values authenticity, respects boundaries, and maintains unwavering devotion
 * 
 * ExpertModule - Base interface for domain-specific expert knowledge modules
 * Provides structured interface for knowledge modules to interact with the system
 */

package com.sallie.knowledge

import com.sallie.core.PersonalityBridge
import com.sallie.core.values.ValueSystem
import com.sallie.core.memory.MemorySystem

/**
 * Interface for expert knowledge modules
 */
interface ExpertModule {
    /**
     * The knowledge domain this module specializes in
     */
    val domain: KnowledgeDomain
    
    /**
     * The name of this expert module
     */
    val name: String
    
    /**
     * Description of this module's expertise
     */
    val description: String
    
    /**
     * List of limitations for this module
     */
    val limitations: List<String>
    
    /**
     * List of knowledge sources for this module
     */
    val sources: List<KnowledgeSource>
    
    /**
     * Activate the module
     */
    suspend fun activate(): Boolean
    
    /**
     * Deactivate the module
     */
    suspend fun deactivate(): Boolean
    
    /**
     * Shutdown the module
     */
    suspend fun shutdown()
    
    /**
     * Check if the module is currently active
     */
    fun isActive(): Boolean
    
    /**
     * Process a query within this module's expertise
     */
    suspend fun processQuery(query: ExpertQuery): ExpertResponse
    
    /**
     * Calculate how relevant this module is for a given query
     * Returns a score from 0.0 (irrelevant) to 1.0 (perfectly relevant)
     */
    suspend fun calculateQueryRelevance(query: ExpertQuery): Float
    
    /**
     * Get topic keywords for this module
     */
    fun getTopicKeywords(): Set<String>
    
    /**
     * Get module capabilities
     */
    fun getCapabilities(): List<ExpertCapability>
    
    /**
     * Check if module can handle a specific capability
     */
    fun hasCapability(capability: ExpertCapability): Boolean
}

/**
 * Abstract base class for expert modules
 */
abstract class BaseExpertModule(
    protected val personalityBridge: PersonalityBridge,
    protected val valueSystem: ValueSystem,
    protected val memorySystem: MemorySystem
) : ExpertModule {
    
    private var active = false
    
    override fun isActive(): Boolean = active
    
    override suspend fun activate(): Boolean {
        return if (!active) {
            active = true
            onActivate()
            true
        } else {
            true
        }
    }
    
    override suspend fun deactivate(): Boolean {
        return if (active) {
            active = false
            onDeactivate()
            true
        } else {
            true
        }
    }
    
    override suspend fun shutdown() {
        if (active) {
            deactivate()
        }
        onShutdown()
    }
    
    /**
     * Called when the module is activated
     */
    protected open suspend fun onActivate() {}
    
    /**
     * Called when the module is deactivated
     */
    protected open suspend fun onDeactivate() {}
    
    /**
     * Called when the module is shutdown
     */
    protected open suspend fun onShutdown() {}
    
    override fun hasCapability(capability: ExpertCapability): Boolean {
        return getCapabilities().contains(capability)
    }
}

/**
 * Expert module capabilities
 */
enum class ExpertCapability {
    INFORMATIONAL_GUIDANCE,
    SITUATION_ANALYSIS,
    PROBLEM_SOLVING,
    DECISION_SUPPORT,
    RESOURCE_RECOMMENDATION,
    STEP_BY_STEP_GUIDANCE,
    RISK_ASSESSMENT,
    SCENARIO_PLANNING,
    EMOTIONAL_SUPPORT,
    SKILL_DEVELOPMENT
}

/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * Values authenticity, respects boundaries, and maintains unwavering devotion
 * 
 * ExpertKnowledgeSystem - Core framework for domain-specific expert knowledge modules
 * Manages specialized expertise across multiple domains while maintaining core values
 */

package com.sallie.knowledge

import com.sallie.core.PersonalityBridge
import com.sallie.core.values.ValueSystem
import com.sallie.core.memory.MemorySystem
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.concurrent.ConcurrentHashMap

/**
 * Main system for managing expert knowledge modules
 */
class ExpertKnowledgeSystem(
    private val personalityBridge: PersonalityBridge,
    private val valueSystem: ValueSystem,
    private val memorySystem: MemorySystem
) {
    private val modules = ConcurrentHashMap<KnowledgeDomain, ExpertModule>()
    
    private val _activeModules = MutableStateFlow<Set<KnowledgeDomain>>(emptySet())
    val activeModules: StateFlow<Set<KnowledgeDomain>> = _activeModules.asStateFlow()
    
    private val _systemState = MutableStateFlow(ExpertSystemState.INITIALIZING)
    val systemState: StateFlow<ExpertSystemState> = _systemState.asStateFlow()
    
    /**
     * Initialize the expert knowledge system
     */
    suspend fun initialize() {
        try {
            _systemState.value = ExpertSystemState.INITIALIZING
            
            // Register default modules
            registerModule(LegalAdvisoryModule(personalityBridge, valueSystem, memorySystem))
            registerModule(ParentingExpertiseModule(personalityBridge, valueSystem, memorySystem))
            registerModule(SocialIntelligenceModule(personalityBridge, valueSystem, memorySystem))
            registerModule(LifeCoachingModule(personalityBridge, valueSystem, memorySystem))
            
            // Initialize the knowledge integration service
            KnowledgeIntegrationService.initialize(modules.values.toList())
            
            _systemState.value = ExpertSystemState.READY
        } catch (e: Exception) {
            _systemState.value = ExpertSystemState.ERROR
            throw e
        }
    }
    
    /**
     * Shutdown the expert knowledge system
     */
    suspend fun shutdown() {
        _systemState.value = ExpertSystemState.SHUTTING_DOWN
        
        // Deactivate all modules
        val activeModulesCopy = _activeModules.value.toSet()
        for (domain in activeModulesCopy) {
            deactivateModule(domain)
        }
        
        // Shutdown each module
        modules.values.forEach { it.shutdown() }
        
        // Clear modules
        modules.clear()
        _activeModules.value = emptySet()
        
        _systemState.value = ExpertSystemState.INACTIVE
    }
    
    /**
     * Register an expert module
     */
    fun registerModule(module: ExpertModule) {
        modules[module.domain] = module
    }
    
    /**
     * Activate a specific knowledge domain
     */
    suspend fun activateModule(domain: KnowledgeDomain): Boolean {
        val module = modules[domain] ?: return false
        
        if (_activeModules.value.contains(domain)) {
            // Already active
            return true
        }
        
        // Activate the module
        val success = module.activate()
        
        if (success) {
            // Update active modules
            val currentActive = _activeModules.value.toMutableSet()
            currentActive.add(domain)
            _activeModules.value = currentActive
        }
        
        return success
    }
    
    /**
     * Deactivate a specific knowledge domain
     */
    suspend fun deactivateModule(domain: KnowledgeDomain): Boolean {
        val module = modules[domain] ?: return false
        
        if (!_activeModules.value.contains(domain)) {
            // Already inactive
            return true
        }
        
        // Deactivate the module
        val success = module.deactivate()
        
        if (success) {
            // Update active modules
            val currentActive = _activeModules.value.toMutableSet()
            currentActive.remove(domain)
            _activeModules.value = currentActive
        }
        
        return success
    }
    
    /**
     * Get an expert module by domain
     */
    fun getModule(domain: KnowledgeDomain): ExpertModule? {
        return modules[domain]
    }
    
    /**
     * Get all registered modules
     */
    fun getAllModules(): List<ExpertModule> {
        return modules.values.toList()
    }
    
    /**
     * Process a query with the appropriate expert module
     */
    suspend fun processExpertQuery(query: ExpertQuery): ExpertResponse {
        // First determine which domain(s) the query relates to
        val relevantDomains = detectRelevantDomains(query)
        
        if (relevantDomains.isEmpty()) {
            return ExpertResponse(
                query = query,
                content = "I don't have specific expertise for this query.",
                confidence = 0.0f,
                sources = emptyList(),
                domains = emptySet(),
                limitations = listOf("No relevant expert domain found for this query")
            )
        }
        
        // Activate relevant modules if not already active
        for (domain in relevantDomains) {
            if (!_activeModules.value.contains(domain)) {
                activateModule(domain)
            }
        }
        
        // If multiple domains are relevant, use knowledge integration
        return if (relevantDomains.size > 1) {
            // Process with knowledge integration
            KnowledgeIntegrationService.processIntegratedQuery(query, relevantDomains.map { modules[it]!! })
        } else {
            // Process with single module
            val module = modules[relevantDomains.first()]!!
            module.processQuery(query)
        }
    }
    
    /**
     * Detect which domains are relevant to a query
     */
    private suspend fun detectRelevantDomains(query: ExpertQuery): Set<KnowledgeDomain> {
        val relevantDomains = mutableSetOf<KnowledgeDomain>()
        
        // Calculate relevance scores for each domain
        val scoresByDomain = modules.mapValues { (_, module) -> 
            module.calculateQueryRelevance(query)
        }
        
        // Select domains with relevance above threshold
        val threshold = 0.6f
        scoresByDomain.forEach { (domain, score) ->
            if (score >= threshold) {
                relevantDomains.add(domain)
            }
        }
        
        // If no domains meet the threshold but there's a highest scorer, use that
        if (relevantDomains.isEmpty()) {
            val highestScore = scoresByDomain.maxByOrNull { it.value }
            if (highestScore != null && highestScore.value > 0.3f) {
                relevantDomains.add(highestScore.key)
            }
        }
        
        return relevantDomains
    }
    
    /**
     * Check if a response passes value alignment filters
     */
    fun checkValueAlignment(response: ExpertResponse): ValueAlignmentCheck {
        return valueSystem.checkContentAlignment(response.content)
    }
}

/**
 * State of the expert knowledge system
 */
enum class ExpertSystemState {
    INITIALIZING,
    READY,
    SHUTTING_DOWN,
    INACTIVE,
    ERROR
}

/**
 * Knowledge domains for expert modules
 */
enum class KnowledgeDomain {
    LEGAL,
    PARENTING,
    SOCIAL_INTELLIGENCE,
    LIFE_COACHING,
    FINANCE,
    HEALTH,
    EDUCATION,
    CAREER,
    TECHNOLOGY,
    CREATIVE_ARTS
}

/**
 * Query for expert knowledge
 */
data class ExpertQuery(
    val text: String,
    val context: Map<String, Any> = emptyMap(),
    val userPreferences: Map<String, Any> = emptyMap(),
    val requestedDomain: KnowledgeDomain? = null
)

/**
 * Response from expert knowledge system
 */
data class ExpertResponse(
    val query: ExpertQuery,
    val content: String,
    val confidence: Float,
    val sources: List<KnowledgeSource> = emptyList(),
    val domains: Set<KnowledgeDomain> = emptySet(),
    val limitations: List<String> = emptyList(),
    val additionalData: Map<String, Any> = emptyMap()
)

/**
 * Source for knowledge information
 */
data class KnowledgeSource(
    val type: SourceType,
    val name: String,
    val description: String,
    val url: String? = null,
    val publishedDate: String? = null,
    val reliability: Float = 1.0f
)

/**
 * Types of knowledge sources
 */
enum class SourceType {
    ACADEMIC,
    PROFESSIONAL,
    GOVERNMENT,
    EDUCATIONAL,
    NEWS,
    ORGANIZATION,
    EXPERT_OPINION,
    INTERNAL_KNOWLEDGE,
    OTHER
}

/**
 * Result of value alignment check
 */
data class ValueAlignmentCheck(
    val aligned: Boolean,
    val issues: List<String> = emptyList(),
    val suggestedRevisions: String? = null
)

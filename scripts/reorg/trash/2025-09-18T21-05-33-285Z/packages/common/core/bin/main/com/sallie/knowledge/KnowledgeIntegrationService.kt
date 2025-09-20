/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * Values authenticity, respects boundaries, and maintains unwavering devotion
 * 
 * KnowledgeIntegrationService - Service for integrating knowledge across multiple expert domains
 * Handles cross-domain queries and ensures consistent value alignment
 */

package com.sallie.knowledge

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlin.math.max

/**
 * Service for integrating knowledge from multiple expert modules
 */
object KnowledgeIntegrationService {
    private var initialized = false
    private var moduleMap = mapOf<KnowledgeDomain, ExpertModule>()
    private var topicToDomainMap = mapOf<String, Set<KnowledgeDomain>>()
    
    /**
     * Initialize the knowledge integration service
     */
    fun initialize(modules: List<ExpertModule>) {
        // Create module map for quick access by domain
        moduleMap = modules.associateBy { it.domain }
        
        // Create topic to domain mapping for better query routing
        val tempMap = mutableMapOf<String, MutableSet<KnowledgeDomain>>()
        modules.forEach { module ->
            module.getTopicKeywords().forEach { keyword ->
                tempMap.getOrPut(keyword.lowercase()) { mutableSetOf() }.add(module.domain)
            }
        }
        topicToDomainMap = tempMap
        
        initialized = true
    }
    
    /**
     * Process a query using multiple expert modules
     */
    suspend fun processIntegratedQuery(
        query: ExpertQuery,
        modules: List<ExpertModule>
    ): ExpertResponse = withContext(Dispatchers.Default) {
        require(initialized) { "KnowledgeIntegrationService not initialized" }
        require(modules.isNotEmpty()) { "No modules provided for integration" }
        
        // If only one module, process directly with that module
        if (modules.size == 1) {
            return@withContext modules.first().processQuery(query)
        }
        
        // Process the query with each module
        val responses = modules.map { module -> module.processQuery(query) }
        
        // Integrate the responses based on confidence and relevance
        integrateResponses(query, responses)
    }
    
    /**
     * Integrate responses from multiple modules
     */
    private fun integrateResponses(
        query: ExpertQuery,
        responses: List<ExpertResponse>
    ): ExpertResponse {
        // If no responses, return empty response
        if (responses.isEmpty()) {
            return ExpertResponse(
                query = query,
                content = "No expert modules provided a response.",
                confidence = 0.0f
            )
        }
        
        // Get the highest confidence response
        val highestConfidence = responses.maxByOrNull { it.confidence }!!
        
        // If one response has significantly higher confidence, use it directly
        if (highestConfidence.confidence >= 0.8f &&
            responses.all { it == highestConfidence || it.confidence <= highestConfidence.confidence * 0.6f }) {
            return highestConfidence
        }
        
        // Otherwise, integrate information from all relevant responses
        val relevantResponses = responses.filter { it.confidence >= 0.4f }
        if (relevantResponses.isEmpty()) {
            return highestConfidence
        }
        
        // Build an integrated response
        val domains = relevantResponses.flatMap { it.domains }.toSet()
        val allSources = relevantResponses.flatMap { it.sources }.distinctBy { it.name }
        val allLimitations = relevantResponses.flatMap { it.limitations }.distinct()
        
        // Combine the content from all relevant responses
        val integratedContent = buildIntegratedContent(query, relevantResponses)
        
        // Calculate an overall confidence score
        val overallConfidence = relevantResponses.sumOf { it.confidence.toDouble() } / max(1, relevantResponses.size)
        
        return ExpertResponse(
            query = query,
            content = integratedContent,
            confidence = overallConfidence.toFloat(),
            sources = allSources,
            domains = domains,
            limitations = allLimitations
        )
    }
    
    /**
     * Build integrated content from multiple responses
     */
    private fun buildIntegratedContent(
        query: ExpertQuery,
        responses: List<ExpertResponse>
    ): String {
        // Sort responses by confidence, highest first
        val sortedResponses = responses.sortedByDescending { it.confidence }
        
        val contentBuilder = StringBuilder()
        
        // Add introduction that mentions the domains
        val domains = sortedResponses.flatMap { it.domains }.toSet()
        contentBuilder.append("Based on expertise from ")
        contentBuilder.append(domains.joinToString(", ") { domainName(it) })
        contentBuilder.append(":\n\n")
        
        // Analyze if there are conflicting viewpoints
        val hasConflicts = detectConflicts(responses)
        
        if (hasConflicts) {
            contentBuilder.append("There are different perspectives on this topic:\n\n")
            
            // Add content from each response, attributing the domain
            sortedResponses.forEach { response ->
                contentBuilder.append("From a ${domainName(response.domains.first())} perspective:\n")
                contentBuilder.append(response.content)
                contentBuilder.append("\n\n")
            }
        } else {
            // Integrate the content without attributing domains
            // Use highest confidence response as main content
            contentBuilder.append(sortedResponses.first().content)
            
            // Add supplemental information from other responses
            val supplementalInfo = extractSupplementalInfo(sortedResponses)
            if (supplementalInfo.isNotEmpty()) {
                contentBuilder.append("\n\nAdditional insights:\n")
                contentBuilder.append(supplementalInfo)
            }
        }
        
        // Add any common limitations
        val commonLimitations = responses.map { it.limitations }.flatten().distinct()
        if (commonLimitations.isNotEmpty()) {
            contentBuilder.append("\n\nImportant considerations:\n")
            commonLimitations.take(3).forEach { limitation ->
                contentBuilder.append("- $limitation\n")
            }
        }
        
        return contentBuilder.toString()
    }
    
    /**
     * Detect if there are conflicting viewpoints in the responses
     */
    private fun detectConflicts(responses: List<ExpertResponse>): Boolean {
        // This is a simplified conflict detection
        // In a real implementation, this would use NLP to detect semantic conflicts
        
        // For now, assume conflicts if confidence scores are close but from different domains
        if (responses.size <= 1) return false
        
        val highestConfidence = responses.maxOf { it.confidence }
        val competingResponses = responses.filter { it.confidence >= highestConfidence * 0.8f }
        
        return competingResponses.size > 1 && competingResponses.map { it.domains }.distinct().size > 1
    }
    
    /**
     * Extract supplemental information from lower confidence responses
     */
    private fun extractSupplementalInfo(sortedResponses: List<ExpertResponse>): String {
        if (sortedResponses.size <= 1) return ""
        
        // Skip the highest confidence response as it's already used as main content
        val supplementalResponses = sortedResponses.drop(1)
        
        // This is a simplified extraction
        // In a real implementation, this would use NLP to extract novel information
        
        val supplementalBuilder = StringBuilder()
        supplementalResponses.forEach { response ->
            // Extract a short summary (first 100 words or so)
            val summary = response.content.split(" ")
                .take(100)
                .joinToString(" ")
                .trim()
            
            if (summary.isNotEmpty()) {
                supplementalBuilder.append("- ")
                supplementalBuilder.append(summary)
                if (!summary.endsWith(".")) supplementalBuilder.append("...")
                supplementalBuilder.append("\n")
            }
        }
        
        return supplementalBuilder.toString()
    }
    
    /**
     * Get a user-friendly domain name
     */
    private fun domainName(domain: KnowledgeDomain): String {
        return when (domain) {
            KnowledgeDomain.LEGAL -> "legal expertise"
            KnowledgeDomain.PARENTING -> "parenting expertise"
            KnowledgeDomain.SOCIAL_INTELLIGENCE -> "social intelligence"
            KnowledgeDomain.LIFE_COACHING -> "life coaching"
            KnowledgeDomain.FINANCE -> "financial expertise"
            KnowledgeDomain.HEALTH -> "health expertise"
            KnowledgeDomain.EDUCATION -> "educational expertise"
            KnowledgeDomain.CAREER -> "career expertise"
            KnowledgeDomain.TECHNOLOGY -> "technology expertise"
            KnowledgeDomain.CREATIVE_ARTS -> "creative arts expertise"
        }
    }
}

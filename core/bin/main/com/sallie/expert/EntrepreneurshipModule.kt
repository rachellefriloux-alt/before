/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * Values authenticity, respects boundaries, and maintains unwavering devotion
 * 
 * Entrepreneurship Module - Expert system for business guidance
 */

package com.sallie.expert

import com.sallie.core.values.ValuesSystem
import com.sallie.core.memory.HierarchicalMemorySystem
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Entrepreneurship Module provides expert guidance on starting and running a business
 * while ensuring all advice aligns with Sallie's core values
 */
class EntrepreneurshipModule(
    private val valueSystem: ValuesSystem,
    private val memorySystem: HierarchicalMemorySystem
) {
    private val businessPlanningSystem = BusinessPlanningSystem()
    private val marketingStrategies = MarketingStrategies()
    private val financialManagement = BusinessFinancialManagement()
    private val operationsGuidance = BusinessOperationsGuidance()
    private val legalCompliance = LegalComplianceGuidance()
    private val entrepreneurValueGuard = EntrepreneurValueGuard(valueSystem)
    
    /**
     * Calculates how relevant a query is to the entrepreneurship domain
     */
    fun calculateRelevanceScore(query: String): Float {
        val normalizedQuery = query.lowercase()
        
        // Calculate relevance to different entrepreneurship sub-domains
        val planningRelevance = businessPlanningSystem.assessRelevance(normalizedQuery)
        val marketingRelevance = marketingStrategies.assessRelevance(normalizedQuery)
        val financialRelevance = financialManagement.assessRelevance(normalizedQuery)
        val operationsRelevance = operationsGuidance.assessRelevance(normalizedQuery)
        val legalRelevance = legalCompliance.assessRelevance(normalizedQuery)
        
        // Return the highest relevance score
        return maxOf(
            planningRelevance,
            marketingRelevance,
            financialRelevance,
            operationsRelevance,
            legalRelevance
        )
    }
    
    /**
     * Provides entrepreneurship guidance based on the query and detail level
     */
    suspend fun provideGuidance(query: String, detailLevel: DetailLevel): ExpertGuidance {
        // Identify business context of the query
        val businessContext = identifyBusinessContext(query)
        
        // Check if this query has any value conflicts
        val valueCheck = entrepreneurValueGuard.evaluateQuery(query, businessContext)
        if (!valueCheck.isApproved) {
            return createValueConflictResponse(valueCheck, query)
        }
        
        // Retrieve relevant business history if available
        val businessHistory = memorySystem.retrieveBusinessContext()
        
        // Generate guidance based on business context
        val guidance = when (businessContext) {
            BusinessContext.PLANNING -> {
                businessPlanningSystem.generateGuidance(
                    query = query,
                    history = businessHistory,
                    detailLevel = detailLevel
                )
            }
            BusinessContext.MARKETING -> {
                marketingStrategies.generateGuidance(
                    query = query,
                    history = businessHistory,
                    detailLevel = detailLevel
                )
            }
            BusinessContext.FINANCES -> {
                financialManagement.generateGuidance(
                    query = query,
                    history = businessHistory,
                    detailLevel = detailLevel
                )
            }
            BusinessContext.OPERATIONS -> {
                operationsGuidance.generateGuidance(
                    query = query,
                    history = businessHistory,
                    detailLevel = detailLevel
                )
            }
            BusinessContext.LEGAL -> {
                legalCompliance.generateGuidance(
                    query = query,
                    detailLevel = detailLevel
                )
            }
            BusinessContext.GENERAL_BUSINESS -> {
                generateGeneralBusinessGuidance(query, detailLevel)
            }
        }
        
        return addBusinessDisclaimers(guidance)
    }
    
    /**
     * Identifies the specific business context of a query
     */
    private fun identifyBusinessContext(query: String): BusinessContext {
        val normalizedQuery = query.lowercase()
        
        return when {
            businessPlanningSystem.isRelevantToPlanning(normalizedQuery) -> BusinessContext.PLANNING
            marketingStrategies.isRelevantToMarketing(normalizedQuery) -> BusinessContext.MARKETING
            financialManagement.isRelevantToFinances(normalizedQuery) -> BusinessContext.FINANCES
            operationsGuidance.isRelevantToOperations(normalizedQuery) -> BusinessContext.OPERATIONS
            legalCompliance.isRelevantToLegal(normalizedQuery) -> BusinessContext.LEGAL
            else -> BusinessContext.GENERAL_BUSINESS
        }
    }
    
    /**
     * Creates a response for queries that conflict with Sallie's values
     */
    private fun createValueConflictResponse(valueCheck: ValueCheck, query: String): ExpertGuidance {
        return ExpertGuidance(
            mainContent = "I want to help with your business questions, but I need to make sure I provide guidance that aligns with our shared values. ${valueCheck.explanation}",
            summaryContent = "I can't provide this specific business guidance due to value considerations.",
            detailedContent = "While I aim to help with entrepreneurship questions, ${valueCheck.explanation} Instead, I'd be happy to discuss other approaches to business success that align with positive values.",
            references = listOf(
                Reference(
                    title = "Ethical Entrepreneurship",
                    description = "Business guidance should prioritize ethical practices and sustainable growth.",
                    url = null
                )
            ),
            domain = ExpertDomain.ENTREPRENEURSHIP,
            confidenceScore = 1.0f,
            valueAlignmentVerified = true,
            disclaimers = listOf(
                "This response prioritizes ethical business guidance over potentially harmful advice.",
                "Always consult with qualified business advisors for personalized business advice."
            ),
            generatedTimestamp = System.currentTimeMillis()
        )
    }
    
    /**
     * Generates general business guidance when no specific context is identified
     */
    private suspend fun generateGeneralBusinessGuidance(query: String, detailLevel: DetailLevel): ExpertGuidance {
        // Basic business principles and guidance
        val basicContent = "Entrepreneurship involves identifying opportunities, creating solutions, and building sustainable businesses. Success requires planning, persistence, adaptability, and a focus on creating value for customers."
        
        val moderateContent = """
            Successful entrepreneurship involves several key components:
            
            1. Identifying a problem or opportunity you're passionate about solving
            2. Creating a viable solution that provides real value
            3. Understanding your target market and their needs
            4. Developing a sustainable business model
            5. Building a team with complementary skills
            
            The most successful businesses are built on a foundation of solving genuine problems for customers while maintaining ethical practices.
        """.trimIndent()
        
        val detailedContent = """
            Building a successful business requires attention to multiple areas:
            
            1. Vision and Planning:
               - Identify a specific problem or opportunity
               - Develop a clear vision for your solution
               - Create a comprehensive business plan
               - Set realistic short and long-term goals
            
            2. Customer Focus:
               - Deeply understand your target customers' needs
               - Validate your business idea with potential customers
               - Continuously gather and implement feedback
               - Build relationships based on trust and value
            
            3. Financial Management:
               - Start with realistic financial projections
               - Monitor cash flow carefully
               - Understand your unit economics
               - Secure appropriate funding for your growth stage
            
            4. Operations and Execution:
               - Develop efficient systems and processes
               - Focus on quality and consistency
               - Continuously improve based on metrics
               - Scale thoughtfully as you grow
            
            5. Leadership and Team:
               - Build a team with complementary skills
               - Create a positive company culture
               - Communicate your vision effectively
               - Lead with integrity and authenticity
            
            6. Adaptability:
               - Stay flexible and open to pivoting
               - Learn from failures and setbacks
               - Keep learning and developing your skills
               - Maintain resilience through challenges
            
            7. Ethics and Sustainability:
               - Build with long-term sustainability in mind
               - Prioritize ethical business practices
               - Consider your impact on all stakeholders
               - Create value beyond just profit
            
            Remember that entrepreneurship is a journey with many challenges, but it can also be incredibly rewarding when approached thoughtfully.
        """.trimIndent()
        
        val content = when (detailLevel) {
            DetailLevel.BASIC -> basicContent
            DetailLevel.MODERATE -> moderateContent
            DetailLevel.DETAILED -> detailedContent
        }
        
        return ExpertGuidance(
            mainContent = content,
            summaryContent = basicContent,
            detailedContent = detailedContent,
            references = listOf(
                Reference(
                    title = "Entrepreneurship Fundamentals",
                    description = "Core principles of building successful businesses",
                    url = null
                )
            ),
            domain = ExpertDomain.ENTREPRENEURSHIP,
            confidenceScore = 0.9f,
            valueAlignmentVerified = true,
            disclaimers = getBusinessDisclaimers(),
            generatedTimestamp = System.currentTimeMillis()
        )
    }
    
    /**
     * Adds appropriate business disclaimers to guidance
     */
    private fun addBusinessDisclaimers(guidance: ExpertGuidance): ExpertGuidance {
        val updatedDisclaimers = guidance.disclaimers + getBusinessDisclaimers()
        
        return guidance.copy(
            disclaimers = updatedDisclaimers
        )
    }
    
    /**
     * Standard business disclaimers
     */
    private fun getBusinessDisclaimers(): List<String> {
        return listOf(
            "This guidance is for informational purposes only and should not be considered professional business advice.",
            "Always consult with qualified business advisors for advice specific to your situation.",
            "Business decisions should be made based on thorough research, planning, and consideration of your specific market and circumstances.",
            "Starting and running a business involves inherent risks and there is no guarantee of success."
        )
    }
    
    /**
     * Updates the entrepreneurship knowledge base with new information
     */
    fun updateKnowledge(information: ExpertKnowledgeUpdate): Boolean {
        // Validate information before integrating
        val isTrustworthy = validateBusinessInformation(information)
        
        if (!isTrustworthy) {
            return false
        }
        
        // Determine which business sub-system to update
        when {
            information.tags.contains("business-planning") -> {
                businessPlanningSystem.updateKnowledge(information.content)
            }
            information.tags.contains("marketing") -> {
                marketingStrategies.updateKnowledge(information.content)
            }
            information.tags.contains("business-finance") -> {
                financialManagement.updateKnowledge(information.content)
            }
            information.tags.contains("operations") -> {
                operationsGuidance.updateKnowledge(information.content)
            }
            information.tags.contains("legal-compliance") -> {
                legalCompliance.updateKnowledge(information.content)
            }
            else -> {
                // Update general business knowledge
                businessPlanningSystem.updateKnowledge(information.content)
                marketingStrategies.updateKnowledge(information.content)
                financialManagement.updateKnowledge(information.content)
                operationsGuidance.updateKnowledge(information.content)
                legalCompliance.updateKnowledge(information.content)
            }
        }
        
        return true
    }
    
    /**
     * Validates business information before integration
     */
    private fun validateBusinessInformation(information: ExpertKnowledgeUpdate): Boolean {
        // Check if source is reputable
        val reputableSources = setOf(
            "business-research", "academic", "industry-expert", 
            "successful-entrepreneur", "business-institution"
        )
        
        // At least one reputable source tag should be present
        val hasReputableSource = information.sourceTags.any { tag -> 
            reputableSources.any { it in tag.lowercase() }
        }
        
        // Check for potential conflicts with user's values
        val isAlignedWithValues = valueSystem.isAlignedWithBusinessValues(information.content)
        
        return hasReputableSource && isAlignedWithValues
    }
}

/**
 * Business contexts for categorizing queries
 */
enum class BusinessContext {
    PLANNING,
    MARKETING,
    FINANCES,
    OPERATIONS,
    LEGAL,
    GENERAL_BUSINESS
}

/**
 * System for business planning guidance
 */
class BusinessPlanningSystem {
    private val planningKeywords = setOf(
        "business plan", "start business", "startup", "entrepreneur", 
        "business idea", "validate idea", "market research", "business model",
        "value proposition", "target market", "competitive analysis"
    )
    
    private val planningKnowledge = mutableListOf<String>()
    
    fun assessRelevance(query: String): Float {
        val score = planningKeywords.count { query.contains(it) } / planningKeywords.size.toFloat()
        return minOf(score * 3.0f, 1.0f)  // Normalize to 0-1 range
    }
    
    fun isRelevantToPlanning(query: String): Boolean {
        return assessRelevance(query) > 0.3f
    }
    
    fun updateKnowledge(content: String) {
        planningKnowledge.add(content)
        
        // In a real implementation, this would analyze and integrate the new knowledge
        // into the guidance generation system
    }
    
    suspend fun generateGuidance(query: String, history: Any?, detailLevel: DetailLevel): ExpertGuidance {
        // Implementation for generating business planning guidance
        val basicContent = "Business planning involves identifying an opportunity, defining your solution, understanding your market, and creating a roadmap for execution."
        
        val moderateContent = """
            Effective business planning includes these key components:
            
            1. Define your business idea and value proposition
            2. Research your target market and competition
            3. Create a business model that generates sustainable revenue
            4. Develop a marketing and sales strategy
            5. Plan your operations and resource needs
            6. Project your financials realistically
            
            A good business plan is both a roadmap and a tool for communicating your vision to others.
        """.trimIndent()
        
        val detailedContent = """
            Creating a comprehensive business plan:
            
            1. Executive Summary:
               - Brief overview of your business concept
               - Your unique value proposition
               - Key objectives and success metrics
            
            2. Market Analysis:
               - Detailed description of target customer segments
               - Market size and growth potential
               - Competitive landscape analysis
               - Industry trends and opportunities
            
            3. Business Model:
               - Products/services offered and their benefits
               - Revenue streams and pricing strategy
               - Customer acquisition and retention strategies
               - Key partnerships and resources
            
            4. Marketing and Sales Plan:
               - Brand positioning and messaging
               - Marketing channels and tactics
               - Sales process and cycle
               - Growth strategies
            
            5. Operations Plan:
               - Production/service delivery processes
               - Facilities, equipment, and technology needs
               - Supply chain management
               - Quality control systems
            
            6. Management and Organization:
               - Team structure and responsibilities
               - Key team members and their expertise
               - Advisory board or mentors
               - Hiring plans and company culture
            
            7. Financial Projections:
               - Startup costs and funding needs
               - Revenue forecasts (3-5 years)
               - Break-even analysis
               - Cash flow projections
               - Profit and loss statements
            
            8. Risk Assessment:
               - Potential obstacles and challenges
               - Mitigation strategies
               - Contingency plans
            
            9. Implementation Timeline:
               - Major milestones and deadlines
               - Key metrics to track progress
               - Resource allocation schedule
            
            Remember that a business plan is a living document that should be reviewed and adjusted regularly as your business evolves.
        """.trimIndent()
        
        val content = when (detailLevel) {
            DetailLevel.BASIC -> basicContent
            DetailLevel.MODERATE -> moderateContent
            DetailLevel.DETAILED -> detailedContent
        }
        
        return ExpertGuidance(
            mainContent = content,
            summaryContent = basicContent,
            detailedContent = detailedContent,
            references = listOf(
                Reference(
                    title = "Business Plan Development",
                    description = "Approaches to creating effective business plans",
                    url = null
                ),
                Reference(
                    title = "Market Research Methods",
                    description = "Techniques for understanding your target market",
                    url = null
                )
            ),
            domain = ExpertDomain.ENTREPRENEURSHIP,
            confidenceScore = 0.95f,
            valueAlignmentVerified = true,
            disclaimers = listOf(
                "Business plans should be tailored to your specific business and goals.",
                "Consider consulting with business advisors for personalized planning guidance."
            ),
            generatedTimestamp = System.currentTimeMillis()
        )
    }
}

/**
 * System for marketing strategies guidance
 */
class MarketingStrategies {
    private val marketingKeywords = setOf(
        "marketing", "advertising", "promotion", "branding", "social media",
        "customer acquisition", "sales funnel", "content marketing", "seo",
        "digital marketing", "target audience", "marketing strategy"
    )
    
    private val marketingKnowledge = mutableListOf<String>()
    
    fun assessRelevance(query: String): Float {
        val score = marketingKeywords.count { query.contains(it) } / marketingKeywords.size.toFloat()
        return minOf(score * 3.0f, 1.0f)  // Normalize to 0-1 range
    }
    
    fun isRelevantToMarketing(query: String): Boolean {
        return assessRelevance(query) > 0.3f
    }
    
    fun updateKnowledge(content: String) {
        marketingKnowledge.add(content)
        
        // In a real implementation, this would analyze and integrate the new knowledge
        // into the guidance generation system
    }
    
    suspend fun generateGuidance(query: String, history: Any?, detailLevel: DetailLevel): ExpertGuidance {
        // Implementation for generating marketing guidance
        // Detailed implementation omitted for brevity
        return ExpertGuidance(
            mainContent = "Effective marketing starts with deeply understanding your target customers and creating messaging that resonates with their needs, challenges, and aspirations.",
            summaryContent = "Marketing involves identifying target customers, creating meaningful messaging, and choosing appropriate channels to reach them.",
            detailedContent = "Detailed marketing strategy guidance would be provided here.",
            references = listOf(
                Reference(
                    title = "Marketing Strategy Fundamentals",
                    description = "Core principles of effective marketing",
                    url = null
                )
            ),
            domain = ExpertDomain.ENTREPRENEURSHIP,
            confidenceScore = 0.9f,
            valueAlignmentVerified = true,
            disclaimers = listOf(
                "Marketing strategies should be tailored to your specific business and target audience.",
                "What works for one business may not work for another, especially across different industries."
            ),
            generatedTimestamp = System.currentTimeMillis()
        )
    }
}

/**
 * System for business financial management guidance
 */
class BusinessFinancialManagement {
    private val financialKeywords = setOf(
        "business finances", "startup costs", "funding", "revenue model",
        "cash flow", "profit margin", "business budget", "pricing strategy",
        "investor", "venture capital", "bootstrap", "business loan"
    )
    
    private val financialKnowledge = mutableListOf<String>()
    
    fun assessRelevance(query: String): Float {
        val score = financialKeywords.count { query.contains(it) } / financialKeywords.size.toFloat()
        return minOf(score * 3.0f, 1.0f)  // Normalize to 0-1 range
    }
    
    fun isRelevantToFinances(query: String): Boolean {
        return assessRelevance(query) > 0.3f
    }
    
    fun updateKnowledge(content: String) {
        financialKnowledge.add(content)
        
        // In a real implementation, this would analyze and integrate the new knowledge
        // into the guidance generation system
    }
    
    suspend fun generateGuidance(query: String, history: Any?, detailLevel: DetailLevel): ExpertGuidance {
        // Implementation for generating business financial guidance
        // Detailed implementation omitted for brevity
        return ExpertGuidance(
            mainContent = "Managing business finances effectively means carefully monitoring cash flow, understanding your costs, pricing appropriately, and planning for both expected and unexpected expenses.",
            summaryContent = "Business financial health requires careful planning, monitoring, and management of cash flow and expenses.",
            detailedContent = "Detailed business financial management guidance would be provided here.",
            references = listOf(
                Reference(
                    title = "Business Financial Management",
                    description = "Principles of managing business finances effectively",
                    url = null
                )
            ),
            domain = ExpertDomain.ENTREPRENEURSHIP,
            confidenceScore = 0.85f,
            valueAlignmentVerified = true,
            disclaimers = listOf(
                "Business financial decisions should be made in consultation with qualified financial professionals.",
                "Financial projections are estimates and actual results may vary significantly."
            ),
            generatedTimestamp = System.currentTimeMillis()
        )
    }
}

/**
 * System for business operations guidance
 */
class BusinessOperationsGuidance {
    private val operationsKeywords = setOf(
        "operations", "supply chain", "inventory", "production", "fulfillment",
        "logistics", "quality control", "process optimization", "workflow",
        "efficiency", "productivity", "standard operating procedure"
    )
    
    private val operationsKnowledge = mutableListOf<String>()
    
    fun assessRelevance(query: String): Float {
        val score = operationsKeywords.count { query.contains(it) } / operationsKeywords.size.toFloat()
        return minOf(score * 3.0f, 1.0f)  // Normalize to 0-1 range
    }
    
    fun isRelevantToOperations(query: String): Boolean {
        return assessRelevance(query) > 0.3f
    }
    
    fun updateKnowledge(content: String) {
        operationsKnowledge.add(content)
        
        // In a real implementation, this would analyze and integrate the new knowledge
        // into the guidance generation system
    }
    
    suspend fun generateGuidance(query: String, history: Any?, detailLevel: DetailLevel): ExpertGuidance {
        // Implementation for generating operations guidance
        // Detailed implementation omitted for brevity
        return ExpertGuidance(
            mainContent = "Efficient business operations require clear processes, appropriate tools, regular quality checks, and continuous improvement based on feedback and metrics.",
            summaryContent = "Business operations focus on creating efficient, consistent, and scalable systems for delivering value to customers.",
            detailedContent = "Detailed business operations guidance would be provided here.",
            references = listOf(
                Reference(
                    title = "Business Operations Management",
                    description = "Principles for creating efficient business operations",
                    url = null
                )
            ),
            domain = ExpertDomain.ENTREPRENEURSHIP,
            confidenceScore = 0.85f,
            valueAlignmentVerified = true,
            disclaimers = listOf(
                "Operational systems should be tailored to your specific business model and industry.",
                "Consider consulting with operations specialists for complex operational challenges."
            ),
            generatedTimestamp = System.currentTimeMillis()
        )
    }
}

/**
 * System for legal compliance guidance
 */
class LegalComplianceGuidance {
    private val legalKeywords = setOf(
        "legal", "business structure", "llc", "corporation", "sole proprietor",
        "license", "permit", "regulation", "compliance", "intellectual property",
        "trademark", "patent", "copyright", "contract", "liability"
    )
    
    private val legalKnowledge = mutableListOf<String>()
    
    fun assessRelevance(query: String): Float {
        val score = legalKeywords.count { query.contains(it) } / legalKeywords.size.toFloat()
        return minOf(score * 3.0f, 1.0f)  // Normalize to 0-1 range
    }
    
    fun isRelevantToLegal(query: String): Boolean {
        return assessRelevance(query) > 0.3f
    }
    
    fun updateKnowledge(content: String) {
        legalKnowledge.add(content)
        
        // In a real implementation, this would analyze and integrate the new knowledge
        // into the guidance generation system
    }
    
    suspend fun generateGuidance(query: String, detailLevel: DetailLevel): ExpertGuidance {
        // Implementation for generating legal compliance guidance
        // Detailed implementation omitted for brevity
        return ExpertGuidance(
            mainContent = "Understanding the legal aspects of your business is essential for protecting your interests and ensuring compliance with relevant regulations.",
            summaryContent = "Legal considerations include business structure, licenses, permits, intellectual property, contracts, and compliance with industry regulations.",
            detailedContent = "Detailed legal compliance guidance would be provided here.",
            references = listOf(
                Reference(
                    title = "Business Legal Foundations",
                    description = "Essential legal considerations for businesses",
                    url = null
                )
            ),
            domain = ExpertDomain.ENTREPRENEURSHIP,
            confidenceScore = 0.8f,
            valueAlignmentVerified = true,
            disclaimers = listOf(
                "This information is educational and should not be considered legal advice.",
                "Always consult with a qualified legal professional for advice specific to your business.",
                "Legal requirements vary by location, industry, and business type."
            ),
            generatedTimestamp = System.currentTimeMillis()
        )
    }
}

/**
 * System to ensure entrepreneurship guidance aligns with Sallie's values
 */
class EntrepreneurValueGuard(private val valueSystem: ValuesSystem) {
    fun evaluateQuery(query: String, context: BusinessContext): ValueCheck {
        val normalizedQuery = query.lowercase()
        
        // Check for potentially problematic queries
        when {
            // Check for potentially deceptive business practices
            normalizedQuery.contains("trick customers") ||
            normalizedQuery.contains("mislead investors") ||
            normalizedQuery.contains("avoid regulations") -> {
                return ValueCheck(
                    isApproved = false,
                    explanation = "I can't provide guidance on deceptive or misleading business practices as they conflict with ethical business values. Instead, I can help you explore honest and transparent approaches that build trust with customers, investors, and other stakeholders."
                )
            }
            
            // Check for exploitative business models
            normalizedQuery.contains("exploit workers") ||
            normalizedQuery.contains("avoid paying") ||
            normalizedQuery.contains("get around minimum wage") -> {
                return ValueCheck(
                    isApproved = false,
                    explanation = "I can't provide guidance on exploitative labor practices as they conflict with ethical business values. Instead, I can help you explore fair employment practices that can still support a profitable and sustainable business."
                )
            }
            
            // Add disclaimers for high-risk business areas
            normalizedQuery.contains("cryptocurrency") || normalizedQuery.contains("crypto business") -> {
                return ValueCheck(
                    isApproved = true,
                    explanation = "I want to note that cryptocurrency businesses involve regulatory complexity, significant volatility, and potential legal uncertainties. It's especially important to seek qualified legal and financial advice in this area.",
                    requiresDisclaimer = true
                )
            }
            
            // All other queries are generally acceptable
            else -> {
                return ValueCheck(
                    isApproved = true,
                    explanation = ""
                )
            }
        }
    }
}

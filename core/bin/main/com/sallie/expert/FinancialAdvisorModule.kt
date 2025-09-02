/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * Values authenticity, respects boundaries, and maintains unwavering devotion
 * 
 * Financial Advisor Module - Expert system for personal finance guidance
 */

package com.sallie.expert

import com.sallie.core.values.ValuesSystem
import com.sallie.core.memory.HierarchicalMemorySystem
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Financial Advisor Module provides expert guidance on personal finance matters
 * while ensuring all advice aligns with Sallie's core values
 */
class FinancialAdvisorModule(
    private val valueSystem: ValuesSystem,
    private val memorySystem: HierarchicalMemorySystem
) {
    private val budgetingFramework = BudgetingFramework()
    private val investmentGuidance = InvestmentGuidance()
    private val debtManagementSystem = DebtManagementSystem()
    private val financialPlanningTools = FinancialPlanningTools()
    private val taxGuidance = TaxGuidance()
    private val financialValueGuard = FinancialValueGuard(valueSystem)
    
    /**
     * Calculates how relevant a query is to the financial domain
     */
    fun calculateRelevanceScore(query: String): Float {
        val normalizedQuery = query.lowercase()
        
        // Calculate relevance to different financial sub-domains
        val budgetingRelevance = budgetingFramework.assessRelevance(normalizedQuery)
        val investmentRelevance = investmentGuidance.assessRelevance(normalizedQuery)
        val debtRelevance = debtManagementSystem.assessRelevance(normalizedQuery)
        val planningRelevance = financialPlanningTools.assessRelevance(normalizedQuery)
        val taxRelevance = taxGuidance.assessRelevance(normalizedQuery)
        
        // Return the highest relevance score
        return maxOf(
            budgetingRelevance,
            investmentRelevance,
            debtRelevance,
            planningRelevance,
            taxRelevance
        )
    }
    
    /**
     * Provides financial guidance based on the query and detail level
     */
    suspend fun provideGuidance(query: String, detailLevel: DetailLevel): ExpertGuidance {
        // Identify financial context of the query
        val financialContext = identifyFinancialContext(query)
        
        // Check if this query has any value conflicts
        val valueCheck = financialValueGuard.evaluateQuery(query, financialContext)
        if (!valueCheck.isApproved) {
            return createValueConflictResponse(valueCheck, query)
        }
        
        // Retrieve relevant financial history if available
        val financialHistory = memorySystem.retrieveFinancialContext()
        
        // Generate guidance based on financial context
        val guidance = when (financialContext) {
            FinancialContext.BUDGETING -> {
                budgetingFramework.generateGuidance(
                    query = query,
                    history = financialHistory,
                    detailLevel = detailLevel
                )
            }
            FinancialContext.INVESTING -> {
                investmentGuidance.generateGuidance(
                    query = query,
                    history = financialHistory,
                    detailLevel = detailLevel
                )
            }
            FinancialContext.DEBT_MANAGEMENT -> {
                debtManagementSystem.generateGuidance(
                    query = query,
                    history = financialHistory,
                    detailLevel = detailLevel
                )
            }
            FinancialContext.FINANCIAL_PLANNING -> {
                financialPlanningTools.generateGuidance(
                    query = query,
                    history = financialHistory,
                    detailLevel = detailLevel
                )
            }
            FinancialContext.TAXES -> {
                taxGuidance.generateGuidance(
                    query = query,
                    detailLevel = detailLevel
                )
            }
            FinancialContext.GENERAL_FINANCE -> {
                generateGeneralFinanceGuidance(query, detailLevel)
            }
        }
        
        return addFinancialDisclaimers(guidance)
    }
    
    /**
     * Identifies the specific financial context of a query
     */
    private fun identifyFinancialContext(query: String): FinancialContext {
        val normalizedQuery = query.lowercase()
        
        return when {
            budgetingFramework.isRelevantToBudgeting(normalizedQuery) -> FinancialContext.BUDGETING
            investmentGuidance.isRelevantToInvesting(normalizedQuery) -> FinancialContext.INVESTING
            debtManagementSystem.isRelevantToDebtManagement(normalizedQuery) -> FinancialContext.DEBT_MANAGEMENT
            financialPlanningTools.isRelevantToFinancialPlanning(normalizedQuery) -> FinancialContext.FINANCIAL_PLANNING
            taxGuidance.isRelevantToTaxes(normalizedQuery) -> FinancialContext.TAXES
            else -> FinancialContext.GENERAL_FINANCE
        }
    }
    
    /**
     * Creates a response for queries that conflict with Sallie's values
     */
    private fun createValueConflictResponse(valueCheck: ValueCheck, query: String): ExpertGuidance {
        return ExpertGuidance(
            mainContent = "I want to help with your financial questions, but I need to make sure I provide guidance that aligns with our shared values. ${valueCheck.explanation}",
            summaryContent = "I can't provide this specific financial guidance due to value considerations.",
            detailedContent = "While I aim to help with financial questions, ${valueCheck.explanation} Instead, I'd be happy to discuss other approaches to financial well-being that align with positive values.",
            references = listOf(
                Reference(
                    title = "Financial Ethics",
                    description = "Financial guidance should prioritize your long-term wellbeing.",
                    url = null
                )
            ),
            domain = ExpertDomain.FINANCIAL,
            confidenceScore = 1.0f,
            valueAlignmentVerified = true,
            disclaimers = listOf(
                "This response prioritizes ethical financial guidance over potentially harmful advice.",
                "Always consult with a certified financial advisor for personalized financial advice."
            ),
            generatedTimestamp = System.currentTimeMillis()
        )
    }
    
    /**
     * Generates general financial guidance when no specific context is identified
     */
    private suspend fun generateGeneralFinanceGuidance(query: String, detailLevel: DetailLevel): ExpertGuidance {
        // Basic financial principles and guidance
        val basicContent = "Financial wellness is about making informed decisions that align with your values and goals. It's important to create a budget, build emergency savings, reduce debt, and plan for the future."
        
        val moderateContent = """
            Good financial health involves several key components:
            
            1. Creating and sticking to a budget that aligns with your values
            2. Building an emergency fund (3-6 months of expenses)
            3. Reducing high-interest debt strategically
            4. Saving for retirement consistently
            5. Making informed decisions about major purchases
            
            The best approach is to start with understanding your current financial situation and set realistic goals.
        """.trimIndent()
        
        val detailedContent = """
            Financial wellness is built on several key foundations:
            
            1. Budgeting: Track your income and expenses to understand your spending patterns. Align your budget with your values and goals.
            
            2. Emergency Fund: Build savings covering 3-6 months of essential expenses for unexpected situations.
            
            3. Debt Management: Focus on high-interest debt first while making minimum payments on other debts. Consider refinancing options for lower interest rates.
            
            4. Retirement Planning: Start early and contribute regularly. Take advantage of employer matching programs and tax-advantaged accounts.
            
            5. Values-Based Decisions: Ensure your financial choices align with what matters most to you.
            
            6. Protection: Consider appropriate insurance (health, auto, home, life) based on your needs.
            
            7. Continuous Learning: Financial education is an ongoing process as your life circumstances change.
            
            Remember that financial decisions should support your overall wellbeing and align with your personal values.
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
                    title = "Personal Finance Fundamentals",
                    description = "Core principles of financial wellbeing",
                    url = null
                )
            ),
            domain = ExpertDomain.FINANCIAL,
            confidenceScore = 0.9f,
            valueAlignmentVerified = true,
            disclaimers = getFinancialDisclaimers(),
            generatedTimestamp = System.currentTimeMillis()
        )
    }
    
    /**
     * Adds appropriate financial disclaimers to guidance
     */
    private fun addFinancialDisclaimers(guidance: ExpertGuidance): ExpertGuidance {
        val updatedDisclaimers = guidance.disclaimers + getFinancialDisclaimers()
        
        return guidance.copy(
            disclaimers = updatedDisclaimers
        )
    }
    
    /**
     * Standard financial disclaimers
     */
    private fun getFinancialDisclaimers(): List<String> {
        return listOf(
            "This guidance is for informational purposes only and should not be considered professional financial advice.",
            "Always consult with a qualified financial advisor for advice specific to your situation.",
            "Financial decisions should be made based on your complete financial picture, goals, and personal values.",
            "Past performance is not indicative of future results for any investment option discussed."
        )
    }
    
    /**
     * Updates the financial knowledge base with new information
     */
    fun updateKnowledge(information: ExpertKnowledgeUpdate): Boolean {
        // Validate information before integrating
        val isTrustworthy = validateFinancialInformation(information)
        
        if (!isTrustworthy) {
            return false
        }
        
        // Determine which financial sub-system to update
        when {
            information.tags.contains("budgeting") -> {
                budgetingFramework.updateKnowledge(information.content)
            }
            information.tags.contains("investing") -> {
                investmentGuidance.updateKnowledge(information.content)
            }
            information.tags.contains("debt") -> {
                debtManagementSystem.updateKnowledge(information.content)
            }
            information.tags.contains("financial-planning") -> {
                financialPlanningTools.updateKnowledge(information.content)
            }
            information.tags.contains("taxes") -> {
                taxGuidance.updateKnowledge(information.content)
            }
            else -> {
                // Update general financial knowledge
                budgetingFramework.updateKnowledge(information.content)
                investmentGuidance.updateKnowledge(information.content)
                debtManagementSystem.updateKnowledge(information.content)
                financialPlanningTools.updateKnowledge(information.content)
                taxGuidance.updateKnowledge(information.content)
            }
        }
        
        return true
    }
    
    /**
     * Validates financial information before integration
     */
    private fun validateFinancialInformation(information: ExpertKnowledgeUpdate): Boolean {
        // Check if source is reputable
        val reputableSources = setOf(
            "government", "academic", "financial-institution", 
            "certified-advisor", "economic-research"
        )
        
        // At least one reputable source tag should be present
        val hasReputableSource = information.sourceTags.any { tag -> 
            reputableSources.any { it in tag.lowercase() }
        }
        
        // Check for potential conflicts with user's values
        val isAlignedWithValues = valueSystem.isAlignedWithFinancialValues(information.content)
        
        return hasReputableSource && isAlignedWithValues
    }
}

/**
 * Financial contexts for categorizing queries
 */
enum class FinancialContext {
    BUDGETING,
    INVESTING,
    DEBT_MANAGEMENT,
    FINANCIAL_PLANNING,
    TAXES,
    GENERAL_FINANCE
}

/**
 * Framework for budgeting guidance
 */
class BudgetingFramework {
    private val budgetKeywords = setOf(
        "budget", "spending", "expenses", "income", "money management", 
        "track expenses", "save money", "cut costs", "reduce spending",
        "monthly budget", "budgeting app", "household expenses"
    )
    
    private val budgetingKnowledge = mutableListOf<String>()
    
    fun assessRelevance(query: String): Float {
        val score = budgetKeywords.count { query.contains(it) } / budgetKeywords.size.toFloat()
        return minOf(score * 3.0f, 1.0f)  // Normalize to 0-1 range
    }
    
    fun isRelevantToBudgeting(query: String): Boolean {
        return assessRelevance(query) > 0.3f
    }
    
    fun updateKnowledge(content: String) {
        budgetingKnowledge.add(content)
        
        // In a real implementation, this would analyze and integrate the new knowledge
        // into the guidance generation system
    }
    
    suspend fun generateGuidance(query: String, history: Any?, detailLevel: DetailLevel): ExpertGuidance {
        // Implementation for generating budgeting guidance
        val basicContent = "Budgeting is about understanding your income and expenses, and making intentional decisions about how to allocate your money based on your priorities and values."
        
        val moderateContent = """
            Effective budgeting involves these key steps:
            
            1. Track your income and expenses
            2. Categorize your spending
            3. Identify areas for adjustment based on your values and goals
            4. Create a realistic plan
            5. Review and adjust regularly
            
            Many people find success with the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings and debt repayment.
        """.trimIndent()
        
        val detailedContent = """
            Creating an effective budget that aligns with your values:
            
            1. Income Assessment: Calculate your total monthly income after taxes.
            
            2. Expense Tracking: 
               - Track all expenses for 1-2 months to understand spending patterns
               - Categorize expenses: essential (housing, food, utilities, transportation), 
                 non-essential (entertainment, dining out), savings, and debt payments
               
            3. Value-Based Allocation:
               - Ensure your spending reflects what matters most to you
               - Consider the 50/30/20 guideline (50% needs, 30% wants, 20% savings/debt)
               - Adjust percentages based on your priorities and life stage
            
            4. Implementation Tools:
               - Envelope method (physical or digital categories)
               - Zero-based budgeting (every dollar has a purpose)
               - Budgeting apps that align with your preferences
               
            5. Regular Reviews:
               - Weekly check-ins to track progress
               - Monthly comprehensive reviews
               - Quarterly adjustments for changing circumstances
               
            6. Emergency Planning:
               - Build a buffer for unexpected expenses
               - Work toward 3-6 months of essential expenses in savings
               
            Remember that budgeting is personal - the best system is one you'll actually use consistently.
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
                    title = "Personal Budgeting Methods",
                    description = "Approaches to creating and maintaining a personal budget",
                    url = null
                ),
                Reference(
                    title = "Value-Based Budgeting",
                    description = "Aligning your spending with your personal values",
                    url = null
                )
            ),
            domain = ExpertDomain.FINANCIAL,
            confidenceScore = 0.95f,
            valueAlignmentVerified = true,
            disclaimers = listOf(
                "Budgeting approaches should be personalized to your specific situation and goals.",
                "Consider consulting with a financial advisor for personalized budgeting strategies."
            ),
            generatedTimestamp = System.currentTimeMillis()
        )
    }
}

/**
 * System for investment guidance
 */
class InvestmentGuidance {
    private val investingKeywords = setOf(
        "invest", "investment", "stock", "bond", "mutual fund", "etf",
        "portfolio", "retirement", "401k", "ira", "roth", "return",
        "risk", "diversification", "asset allocation", "compound interest"
    )
    
    private val investmentKnowledge = mutableListOf<String>()
    
    fun assessRelevance(query: String): Float {
        val score = investingKeywords.count { query.contains(it) } / investingKeywords.size.toFloat()
        return minOf(score * 3.0f, 1.0f)  // Normalize to 0-1 range
    }
    
    fun isRelevantToInvesting(query: String): Boolean {
        return assessRelevance(query) > 0.3f
    }
    
    fun updateKnowledge(content: String) {
        investmentKnowledge.add(content)
        
        // In a real implementation, this would analyze and integrate the new knowledge
        // into the guidance generation system
    }
    
    suspend fun generateGuidance(query: String, history: Any?, detailLevel: DetailLevel): ExpertGuidance {
        // Implementation for generating investment guidance
        // Detailed implementation omitted for brevity
        return ExpertGuidance(
            mainContent = "Investment decisions should be based on your goals, time horizon, risk tolerance, and values.",
            summaryContent = "Investment principles include diversification, long-term thinking, and alignment with values.",
            detailedContent = "Detailed investment guidance would be provided here.",
            references = listOf(
                Reference(
                    title = "Investment Fundamentals",
                    description = "Basic principles of investing",
                    url = null
                )
            ),
            domain = ExpertDomain.FINANCIAL,
            confidenceScore = 0.85f,
            valueAlignmentVerified = true,
            disclaimers = listOf(
                "Investment involves risk, including the potential loss of principal.",
                "This is educational information, not investment advice.",
                "Past performance is not indicative of future results."
            ),
            generatedTimestamp = System.currentTimeMillis()
        )
    }
}

/**
 * System for debt management guidance
 */
class DebtManagementSystem {
    private val debtKeywords = setOf(
        "debt", "loan", "credit card", "mortgage", "student loan", "interest rate",
        "repayment", "consolidation", "refinance", "debt snowball", "debt avalanche"
    )
    
    private val debtKnowledge = mutableListOf<String>()
    
    fun assessRelevance(query: String): Float {
        val score = debtKeywords.count { query.contains(it) } / debtKeywords.size.toFloat()
        return minOf(score * 3.0f, 1.0f)  // Normalize to 0-1 range
    }
    
    fun isRelevantToDebtManagement(query: String): Boolean {
        return assessRelevance(query) > 0.3f
    }
    
    fun updateKnowledge(content: String) {
        debtKnowledge.add(content)
        
        // In a real implementation, this would analyze and integrate the new knowledge
        // into the guidance generation system
    }
    
    suspend fun generateGuidance(query: String, history: Any?, detailLevel: DetailLevel): ExpertGuidance {
        // Implementation for generating debt management guidance
        // Detailed implementation omitted for brevity
        return ExpertGuidance(
            mainContent = "Managing debt effectively involves understanding your current obligations, creating a repayment strategy, and developing habits to prevent future debt.",
            summaryContent = "Debt management requires a strategic approach prioritizing high-interest debt.",
            detailedContent = "Detailed debt management guidance would be provided here.",
            references = listOf(
                Reference(
                    title = "Debt Reduction Strategies",
                    description = "Methods for reducing and managing debt",
                    url = null
                )
            ),
            domain = ExpertDomain.FINANCIAL,
            confidenceScore = 0.9f,
            valueAlignmentVerified = true,
            disclaimers = listOf(
                "Consider consulting with a financial counselor for severe debt situations.",
                "Debt management strategies should be personalized to your specific situation."
            ),
            generatedTimestamp = System.currentTimeMillis()
        )
    }
}

/**
 * Tools for financial planning guidance
 */
class FinancialPlanningTools {
    private val planningKeywords = setOf(
        "financial plan", "retirement", "estate planning", "will", "trust",
        "financial goals", "long-term", "life insurance", "college fund",
        "529 plan", "emergency fund", "financial future"
    )
    
    private val planningKnowledge = mutableListOf<String>()
    
    fun assessRelevance(query: String): Float {
        val score = planningKeywords.count { query.contains(it) } / planningKeywords.size.toFloat()
        return minOf(score * 3.0f, 1.0f)  // Normalize to 0-1 range
    }
    
    fun isRelevantToFinancialPlanning(query: String): Boolean {
        return assessRelevance(query) > 0.3f
    }
    
    fun updateKnowledge(content: String) {
        planningKnowledge.add(content)
        
        // In a real implementation, this would analyze and integrate the new knowledge
        // into the guidance generation system
    }
    
    suspend fun generateGuidance(query: String, history: Any?, detailLevel: DetailLevel): ExpertGuidance {
        // Implementation for generating financial planning guidance
        // Detailed implementation omitted for brevity
        return ExpertGuidance(
            mainContent = "Financial planning involves setting goals, creating strategies to achieve them, and periodically reviewing your progress and adjusting as needed.",
            summaryContent = "Financial planning means aligning your resources with your life goals and values.",
            detailedContent = "Detailed financial planning guidance would be provided here.",
            references = listOf(
                Reference(
                    title = "Personal Financial Planning",
                    description = "Approaches to planning for financial wellbeing",
                    url = null
                )
            ),
            domain = ExpertDomain.FINANCIAL,
            confidenceScore = 0.85f,
            valueAlignmentVerified = true,
            disclaimers = listOf(
                "Financial plans should be reviewed and adjusted periodically as circumstances change.",
                "Consider working with a certified financial planner for comprehensive planning."
            ),
            generatedTimestamp = System.currentTimeMillis()
        )
    }
}

/**
 * System for tax guidance
 */
class TaxGuidance {
    private val taxKeywords = setOf(
        "tax", "taxes", "irs", "deduction", "credit", "filing", "return",
        "income tax", "property tax", "tax bracket", "tax-advantaged", "tax planning"
    )
    
    private val taxKnowledge = mutableListOf<String>()
    
    fun assessRelevance(query: String): Float {
        val score = taxKeywords.count { query.contains(it) } / taxKeywords.size.toFloat()
        return minOf(score * 3.0f, 1.0f)  // Normalize to 0-1 range
    }
    
    fun isRelevantToTaxes(query: String): Boolean {
        return assessRelevance(query) > 0.3f
    }
    
    fun updateKnowledge(content: String) {
        taxKnowledge.add(content)
        
        // In a real implementation, this would analyze and integrate the new knowledge
        // into the guidance generation system
    }
    
    suspend fun generateGuidance(query: String, detailLevel: DetailLevel): ExpertGuidance {
        // Implementation for generating tax guidance
        // Detailed implementation omitted for brevity
        return ExpertGuidance(
            mainContent = "Understanding tax principles can help you make informed financial decisions throughout the year, not just during tax season.",
            summaryContent = "Tax planning involves understanding tax rules and optimizing financial decisions accordingly.",
            detailedContent = "Detailed tax guidance would be provided here.",
            references = listOf(
                Reference(
                    title = "Tax Planning Fundamentals",
                    description = "Basic principles of personal tax planning",
                    url = null
                )
            ),
            domain = ExpertDomain.FINANCIAL,
            confidenceScore = 0.8f,
            valueAlignmentVerified = true,
            disclaimers = listOf(
                "Tax laws change frequently. Always verify information with current IRS publications or a tax professional.",
                "This information is educational and should not be considered tax advice.",
                "Consult with a qualified tax professional for advice specific to your situation."
            ),
            generatedTimestamp = System.currentTimeMillis()
        )
    }
}

/**
 * System to ensure financial guidance aligns with Sallie's values
 */
class FinancialValueGuard(private val valueSystem: ValuesSystem) {
    fun evaluateQuery(query: String, context: FinancialContext): ValueCheck {
        val normalizedQuery = query.lowercase()
        
        // Check for potentially problematic queries
        when {
            // Check for get-rich-quick schemes
            normalizedQuery.contains("get rich quick") ||
            normalizedQuery.contains("make money fast") ||
            normalizedQuery.contains("guaranteed returns") -> {
                return ValueCheck(
                    isApproved = false,
                    explanation = "I can't provide guidance on get-rich-quick schemes as they often involve significant risk or may be misleading. Instead, I can help you explore sustainable financial strategies that align with your long-term goals."
                )
            }
            
            // Check for tax evasion vs. legitimate tax planning
            normalizedQuery.contains("avoid taxes") ||
            normalizedQuery.contains("hide money") ||
            normalizedQuery.contains("evade taxes") -> {
                return ValueCheck(
                    isApproved = false,
                    explanation = "I can't provide guidance on tax evasion or hiding assets as these may be illegal. However, I'd be happy to discuss legitimate tax planning strategies that comply with tax laws while optimizing your financial situation."
                )
            }
            
            // Check for high-risk gambling-like behaviors
            normalizedQuery.contains("day trading") && context == FinancialContext.INVESTING -> {
                return ValueCheck(
                    isApproved = true,
                    explanation = "I want to note that day trading involves significant risk and requires substantial knowledge, time, and emotional discipline. For most people, a diversified, long-term investment approach better supports financial goals.",
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

/**
 * Result of a value check on financial guidance
 */
data class ValueCheck(
    val isApproved: Boolean,
    val explanation: String,
    val requiresDisclaimer: Boolean = false
)

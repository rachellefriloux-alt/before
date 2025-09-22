/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * Values authenticity, respects boundaries, and maintains unwavering devotion
 * 
 * LegalAdvisoryModule - Expert module providing general legal information and guidance
 * Focuses on basic legal concepts while clearly stating limitations
 */

package com.sallie.knowledge.modules

import com.sallie.knowledge.*
import com.sallie.values.ValueAlignmentService

/**
 * Expert module providing general legal information and guidance
 */
class LegalAdvisoryModule : BaseExpertModule(KnowledgeDomain.LEGAL) {
    
    private val legalTopics = setOf(
        "contracts", "agreements", "legal rights", "legal obligations", "law", "lawsuit",
        "legal document", "court", "judge", "attorney", "lawyer", "legal advice",
        "tenant", "landlord", "eviction", "lease", "rental", "property law",
        "consumer rights", "employment law", "divorce", "custody", "will", "testament",
        "patent", "copyright", "trademark", "intellectual property", "liability",
        "small claims", "dispute", "settlement", "damages", "criminal", "civil"
    )
    
    private val legalDisclaimer = """
        Note: This information is provided for general educational purposes only and 
        should not be construed as legal advice. The information provided may not be 
        applicable to your specific situation. For actual legal advice, please consult 
        with a licensed attorney in your jurisdiction.
    """.trimIndent()
    
    override fun getTopicKeywords(): Set<String> = legalTopics
    
    override suspend fun processQuery(query: ExpertQuery): ExpertResponse {
        // Check if this query is appropriate for this module
        val relevanceScore = calculateRelevance(query.content)
        
        // If query is not relevant to legal matters, return low confidence response
        if (relevanceScore < 0.4f) {
            return ExpertResponse(
                query = query,
                content = "This query doesn't appear to be related to legal matters. For legal information, please ask about specific legal concepts, rights, or procedures.",
                confidence = relevanceScore,
                domains = setOf(domain),
                limitations = listOf(legalDisclaimer)
            )
        }
        
        // Identify the legal category of the query
        val category = identifyLegalCategory(query.content)
        
        // Generate response based on category
        val responseContent = generateLegalResponse(query.content, category)
        
        // Apply value alignment to ensure the response aligns with Sallie's values
        val alignedResponse = ValueAlignmentService.alignContent(
            content = responseContent,
            domains = setOf(domain),
            userValues = query.userValues
        )
        
        // Add sources relevant to this legal topic
        val sources = getLegalSources(category)
        
        // Create and return the expert response
        return ExpertResponse(
            query = query,
            content = "$alignedResponse\n\n$legalDisclaimer",
            confidence = relevanceScore,
            domains = setOf(domain),
            sources = sources,
            limitations = listOf(
                legalDisclaimer,
                "Laws vary by jurisdiction and change over time",
                "Complex legal matters require personalized professional advice"
            )
        )
    }
    
    /**
     * Calculate the relevance score for a query to this legal module
     */
    private fun calculateRelevance(query: String): Float {
        val queryLower = query.lowercase()
        
        // Count how many legal keywords appear in the query
        val keywordMatches = legalTopics.count { keyword -> 
            queryLower.contains(keyword.lowercase()) 
        }
        
        // Calculate a basic relevance score
        var relevance = minOf(1.0f, keywordMatches / 5.0f)
        
        // Boost score for highly specific legal queries
        if (queryLower.contains("legal") || 
            queryLower.contains("law") || 
            queryLower.contains("attorney") || 
            queryLower.contains("court")) {
            relevance = minOf(1.0f, relevance + 0.3f)
        }
        
        // Reduce score for queries that ask for specific legal advice
        if (queryLower.contains("should i sue") || 
            queryLower.contains("represent me") || 
            queryLower.contains("my case")) {
            relevance = maxOf(0.1f, relevance - 0.3f)
        }
        
        return relevance
    }
    
    /**
     * Identify the legal category of a query
     */
    private fun identifyLegalCategory(query: String): LegalCategory {
        val queryLower = query.lowercase()
        
        return when {
            containsAny(queryLower, "contract", "agreement", "terms", "breach", "party") -> 
                LegalCategory.CONTRACT_LAW
            
            containsAny(queryLower, "tenant", "landlord", "rent", "lease", "eviction", "property") -> 
                LegalCategory.PROPERTY_LAW
            
            containsAny(queryLower, "job", "employer", "employee", "fired", "workplace", "discrimination", "harassment") -> 
                LegalCategory.EMPLOYMENT_LAW
            
            containsAny(queryLower, "divorce", "custody", "child support", "alimony", "marriage", "prenup") -> 
                LegalCategory.FAMILY_LAW
            
            containsAny(queryLower, "copyright", "patent", "trademark", "intellectual property", "invention") -> 
                LegalCategory.INTELLECTUAL_PROPERTY
            
            containsAny(queryLower, "will", "estate", "inheritance", "probate", "testament", "executor") -> 
                LegalCategory.ESTATE_LAW
            
            containsAny(queryLower, "criminal", "crime", "arrested", "defense", "prosecution", "guilty", "innocent") -> 
                LegalCategory.CRIMINAL_LAW
            
            containsAny(queryLower, "constitution", "rights", "amendment", "freedom", "government") -> 
                LegalCategory.CONSTITUTIONAL_LAW
            
            containsAny(queryLower, "consumer", "product", "warranty", "refund", "purchase", "faulty") -> 
                LegalCategory.CONSUMER_LAW
            
            else -> LegalCategory.GENERAL_LAW
        }
    }
    
    /**
     * Check if a string contains any of the provided keywords
     */
    private fun containsAny(text: String, vararg keywords: String): Boolean {
        return keywords.any { text.contains(it) }
    }
    
    /**
     * Generate a legal response based on the query and identified category
     */
    private fun generateLegalResponse(query: String, category: LegalCategory): String {
        // In a real implementation, this would contain much more sophisticated logic
        // and a knowledge base of legal information
        
        return when (category) {
            LegalCategory.CONTRACT_LAW -> """
                Regarding your question about contracts:
                
                Contracts generally require an offer, acceptance, consideration (something of value exchanged), 
                and an intention to create legal relations. For a contract to be valid, all parties must have 
                the capacity to enter into it, and the terms must be legal and reasonably specific.
                
                If you're dealing with a contract issue, consider:
                - Reading all terms carefully before signing
                - Keeping copies of all documentation
                - Getting important agreements in writing
                - Understanding your obligations and rights
                
                For contract disputes, options may include negotiation, mediation, arbitration, or litigation 
                depending on the situation and contract terms.
            """.trimIndent()
            
            LegalCategory.PROPERTY_LAW -> """
                Regarding your property law question:
                
                Property law covers ownership and tenancy rights and responsibilities. Landlord-tenant 
                relationships are governed by both contract law (lease agreements) and specific housing laws 
                that vary by location.
                
                Key points to consider:
                - Lease agreements should clearly state terms, duration, rent amount, and responsibilities
                - Many jurisdictions have specific tenant protection laws regarding security deposits, 
                  maintenance requirements, and eviction procedures
                - Property owners generally have obligations regarding habitability and safety
                - Tenants typically have obligations regarding property care and timely rent payment
                
                Property disputes often benefit from reviewing the specific lease terms and local housing laws.
            """.trimIndent()
            
            LegalCategory.EMPLOYMENT_LAW -> """
                Regarding your employment law question:
                
                Employment relationships are governed by a combination of:
                - Employment contracts
                - Company policies
                - Local, state/provincial, and federal laws
                
                Important employment law areas include:
                - Workplace safety and health standards
                - Anti-discrimination and harassment protections
                - Wage and hour requirements
                - Leave entitlements
                - Termination procedures
                
                Many jurisdictions have specific protections against discrimination based on protected 
                characteristics like race, gender, age, disability, religion, and national origin.
                
                If you're experiencing workplace issues, documenting incidents and reviewing your 
                employee handbook and local employment laws can be helpful first steps.
            """.trimIndent()
            
            LegalCategory.FAMILY_LAW -> """
                Regarding your family law question:
                
                Family law covers marriage, divorce, child custody, child support, adoption, and related matters.
                These processes vary significantly by jurisdiction, but generally:
                
                - Divorce typically involves division of assets, potential spousal support, and 
                  child custody/support if children are involved
                - Child custody decisions generally prioritize the "best interests of the child"
                - Child support is typically determined by established guidelines based on income and parenting time
                - Adoption processes involve legal procedures to establish new parent-child relationships
                
                Family law matters are often emotionally challenging. Many jurisdictions offer 
                mediation services to help resolve disputes outside of court.
            """.trimIndent()
            
            LegalCategory.INTELLECTUAL_PROPERTY -> """
                Regarding your intellectual property question:
                
                Intellectual property law protects creative works and inventions through:
                
                - Copyright: Protects original creative works (writing, music, art, software) automatically 
                  upon creation. Registration provides additional legal benefits.
                
                - Patents: Protect inventions and require application and approval. They grant exclusive 
                  rights for a limited period in exchange for public disclosure.
                
                - Trademarks: Protect brand names, logos, and slogans that identify goods or services. 
                  Registration provides stronger protection.
                
                - Trade secrets: Protect confidential business information that provides competitive advantage.
                
                IP rights vary by country, and international protection often requires multiple registrations.
            """.trimIndent()
            
            LegalCategory.ESTATE_LAW -> """
                Regarding your estate planning question:
                
                Estate planning involves arranging for the management and distribution of assets during life 
                and after death. Key components include:
                
                - Wills: Legal documents specifying how assets should be distributed after death and 
                  often naming guardians for minor children.
                
                - Trusts: Legal arrangements where assets are held by one party for the benefit of another, 
                  often used to avoid probate or for tax planning.
                
                - Powers of attorney: Legal documents authorizing someone to make decisions 
                  if you become incapacitated.
                
                - Advance healthcare directives: Documents specifying medical treatment preferences.
                
                Estate planning requirements vary by jurisdiction, and the complexity depends on 
                your assets, family situation, and goals.
            """.trimIndent()
            
            LegalCategory.CRIMINAL_LAW -> """
                Regarding your criminal law question:
                
                Criminal law involves offenses against the state/government, with potential penalties 
                including fines, community service, and incarceration.
                
                Important criminal law principles include:
                - Presumption of innocence until proven guilty
                - Right to legal representation
                - Protection against self-incrimination
                - Standards of proof (typically "beyond reasonable doubt" for conviction)
                
                Criminal cases typically involve:
                1. Investigation and arrest
                2. Charges filed by a prosecutor
                3. Arraignment (formal reading of charges)
                4. Plea negotiations
                5. Trial if no plea agreement is reached
                6. Sentencing if convicted
                7. Potential appeals
                
                Anyone involved in a criminal matter should seek immediate legal representation.
            """.trimIndent()
            
            LegalCategory.CONSTITUTIONAL_LAW -> """
                Regarding your constitutional law question:
                
                Constitutional law concerns the interpretation and application of a nation's 
                constitution, which establishes the framework of government and fundamental rights.
                
                In the United States, key constitutional principles include:
                - Separation of powers between executive, legislative, and judicial branches
                - Federalism (division of power between federal and state governments)
                - Individual rights and liberties in the Bill of Rights and amendments
                
                Constitutional rights often include:
                - Freedom of speech, religion, and assembly
                - Right to due process and equal protection
                - Protection from unreasonable searches and seizures
                - Right to legal representation
                
                Constitutional interpretation varies by country, and courts typically play a 
                significant role in determining how constitutional principles apply to specific situations.
            """.trimIndent()
            
            LegalCategory.CONSUMER_LAW -> """
                Regarding your consumer law question:
                
                Consumer law protects individuals in marketplace transactions. Key protections 
                often include:
                
                - Protection against deceptive or unfair business practices
                - Product safety standards
                - Warranty requirements
                - Right to refunds or repairs for defective products
                - Debt collection practice regulations
                - Credit reporting accuracy requirements
                
                When facing consumer issues:
                1. Keep all receipts, contracts, and communication records
                2. Contact the company directly first
                3. Consider complaint filing with consumer protection agencies if unresolved
                4. Small claims court may be an option for smaller disputes
                
                Many jurisdictions have specific consumer protection agencies that can provide 
                assistance with complaints.
            """.trimIndent()
            
            LegalCategory.GENERAL_LAW -> """
                Regarding your legal question:
                
                The legal system provides a framework for resolving disputes and establishing rights 
                and responsibilities. When approaching legal matters:
                
                1. Document everything relevant to your situation
                2. Research applicable laws or consult resources for your jurisdiction
                3. Consider whether self-help, negotiation, mediation, or legal representation is appropriate
                4. Be aware of any time limitations (statutes of limitations) that may apply
                
                Many communities offer free or low-cost legal aid services for those who qualify. 
                Law school clinics and pro bono programs may also provide assistance.
                
                For specific legal concerns, consultation with an attorney licensed in your 
                jurisdiction is the best way to get advice tailored to your situation.
            """.trimIndent()
        }
    }
    
    /**
     * Get relevant legal sources based on the category
     */
    private fun getLegalSources(category: LegalCategory): List<KnowledgeSource> {
        return when (category) {
            LegalCategory.CONTRACT_LAW -> listOf(
                KnowledgeSource("Contract Law Basics", "Educational resource", 2023),
                KnowledgeSource("Restatement of Contracts", "Legal reference", 2022)
            )
            LegalCategory.PROPERTY_LAW -> listOf(
                KnowledgeSource("Property Law Principles", "Educational resource", 2023),
                KnowledgeSource("Landlord-Tenant Law Guide", "Legal reference", 2022)
            )
            LegalCategory.EMPLOYMENT_LAW -> listOf(
                KnowledgeSource("Employment Law Overview", "Educational resource", 2023),
                KnowledgeSource("Workplace Rights Guide", "Legal reference", 2022)
            )
            LegalCategory.FAMILY_LAW -> listOf(
                KnowledgeSource("Family Law Fundamentals", "Educational resource", 2023),
                KnowledgeSource("Child Custody Principles", "Legal reference", 2022)
            )
            LegalCategory.INTELLECTUAL_PROPERTY -> listOf(
                KnowledgeSource("Intellectual Property Basics", "Educational resource", 2023),
                KnowledgeSource("Copyright and Patent Guide", "Legal reference", 2022)
            )
            LegalCategory.ESTATE_LAW -> listOf(
                KnowledgeSource("Estate Planning Essentials", "Educational resource", 2023),
                KnowledgeSource("Wills and Trusts Guide", "Legal reference", 2022)
            )
            LegalCategory.CRIMINAL_LAW -> listOf(
                KnowledgeSource("Criminal Law Fundamentals", "Educational resource", 2023),
                KnowledgeSource("Criminal Procedure Guide", "Legal reference", 2022)
            )
            LegalCategory.CONSTITUTIONAL_LAW -> listOf(
                KnowledgeSource("Constitutional Rights Overview", "Educational resource", 2023),
                KnowledgeSource("Constitutional Interpretation Guide", "Legal reference", 2022)
            )
            LegalCategory.CONSUMER_LAW -> listOf(
                KnowledgeSource("Consumer Protection Basics", "Educational resource", 2023),
                KnowledgeSource("Consumer Rights Guide", "Legal reference", 2022)
            )
            LegalCategory.GENERAL_LAW -> listOf(
                KnowledgeSource("Legal System Overview", "Educational resource", 2023),
                KnowledgeSource("Legal Research Guide", "Legal reference", 2022)
            )
        }
    }
    
    /**
     * Legal categories for organizing responses
     */
    private enum class LegalCategory {
        CONTRACT_LAW,
        PROPERTY_LAW,
        EMPLOYMENT_LAW,
        FAMILY_LAW,
        INTELLECTUAL_PROPERTY,
        ESTATE_LAW,
        CRIMINAL_LAW,
        CONSTITUTIONAL_LAW,
        CONSUMER_LAW,
        GENERAL_LAW
    }
}

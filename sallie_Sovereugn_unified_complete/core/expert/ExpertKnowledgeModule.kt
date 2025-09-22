package com.sallie.expert

interface ExpertKnowledgeModule {
    val domain: String
    fun getExpertAdvice(query: String): ExpertAdvice
}

class ExpertAdvice(val answer: String, val sources: List<String> = emptyList())

class MedicalExpertModule : ExpertKnowledgeModule {
    override val domain = "Medical"
    override fun getExpertAdvice(query: String): ExpertAdvice {
        // Simulate medical advice logic
        return ExpertAdvice("For medical questions, always consult a licensed professional. Query: $query", listOf("CDC", "WHO"))
    }
}

class LegalExpertModule : ExpertKnowledgeModule {
    override val domain = "Legal"
    override fun getExpertAdvice(query: String): ExpertAdvice {
        // Simulate legal advice logic
        return ExpertAdvice("For legal questions, consult a qualified attorney. Query: $query", listOf("ABA", "FindLaw"))
    }
}

class TechnicalExpertModule : ExpertKnowledgeModule {
    override val domain = "Technical"
    override fun getExpertAdvice(query: String): ExpertAdvice {
        // Simulate technical advice logic
        return ExpertAdvice("For technical questions, refer to official documentation. Query: $query", listOf("Stack Overflow", "MDN"))
    }
}

object ExpertKnowledgeRegistry {
    private val modules = listOf(MedicalExpertModule(), LegalExpertModule(), TechnicalExpertModule())
    fun getAdvice(domain: String, query: String): ExpertAdvice {
        val module = modules.find { it.domain.equals(domain, ignoreCase = true) }
        return module?.getExpertAdvice(query) ?: ExpertAdvice("No expert available for domain: $domain")
    }
}

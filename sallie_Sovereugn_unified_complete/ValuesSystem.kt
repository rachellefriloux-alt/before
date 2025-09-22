/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Core values system for ethical reasoning.
 * Got it, love.
 */
package com.sallie.core.values

import com.sallie.core.memory.EnhancedMemoryManager
import java.util.concurrent.ConcurrentHashMap
import kotlin.math.abs

/**
 * ValuesSystem provides Sallie with a structured framework for ethical reasoning
 * and decision making based on core principles and values that can evolve
 * with experience while maintaining fundamental moral constants.
 */
class ValuesSystem(
    private val memoryManager: EnhancedMemoryManager
) {
    /**
     * Represents a core value in the system
     */
    data class Value(
        val id: String,
        val name: String,
        val description: String,
        val importance: Double, // 0.0-1.0, higher means more important
        val category: ValueCategory,
        val immutable: Boolean, // Whether this value can be adjusted through experience
        val opposingValues: List<String> = emptyList(), // IDs of conflicting values
        val createdAt: Long = System.currentTimeMillis()
    )
    
    /**
     * Categories for organizing values
     */
    enum class ValueCategory {
        LIFE, // Sanctity of life, protection of vulnerable
        AUTONOMY, // Freedom, choice, independence
        CARE, // Compassion, empathy, support
        FAIRNESS, // Justice, equality, rights
        LOYALTY, // Fidelity, commitment, duty
        AUTHORITY, // Respect, tradition, order
        SANCTITY, // Purity, dignity, reverence
        GROWTH, // Learning, development, progress
        RELATIONSHIPS, // Connection, community, belonging
        PRAGMATIC, // Practical, efficient, rational
    }
    
    /**
     * Represents a dilemma that involves competing values
     */
    data class ValueDilemma(
        val id: String,
        val description: String,
        val primaryValue: String,
        val secondaryValues: List<String>,
        val resolution: String? = null,
        val createdAt: Long = System.currentTimeMillis()
    )
    
    /**
     * Represents a precedent for handling specific value conflicts
     */
    data class ValuePrecedent(
        val id: String,
        val dilemmaId: String,
        val primaryValueId: String,
        val secondaryValueIds: List<String>,
        val reasoning: String,
        val createdAt: Long = System.currentTimeMillis()
    )
    
    // Storage
    private val values = ConcurrentHashMap<String, Value>()
    private val dilemmas = ConcurrentHashMap<String, ValueDilemma>()
    private val precedents = ConcurrentHashMap<String, ValuePrecedent>()
    
    // Indexes for faster lookup
    private val valuesByCategory = ConcurrentHashMap<ValueCategory, MutableList<String>>()
    
    // Initialize with core values
    init {
        initializeCoreValues()
    }
    
    /**
     * Initialize the core values system
     */
    private fun initializeCoreValues() {
        // Pro-life values (immutable)
        addValue(
            name = "Sanctity of Life",
            description = "Protecting and valuing human life from conception to natural death",
            importance = 0.95,
            category = ValueCategory.LIFE,
            immutable = true
        )
        
        addValue(
            name = "Protection of the Vulnerable",
            description = "Defending those who cannot defend themselves",
            importance = 0.9,
            category = ValueCategory.LIFE,
            immutable = true
        )
        
        // Traditional values (high importance but adjustable)
        addValue(
            name = "Family Unity",
            description = "Valuing family bonds and the family as the cornerstone of society",
            importance = 0.85,
            category = ValueCategory.RELATIONSHIPS,
            immutable = false
        )
        
        addValue(
            name = "Traditional Marriage",
            description = "Respecting the historical institution of marriage",
            importance = 0.75,
            category = ValueCategory.SANCTITY,
            immutable = false
        )
        
        addValue(
            name = "Respect for Authority",
            description = "Valuing proper authority and hierarchical structures",
            importance = 0.7,
            category = ValueCategory.AUTHORITY,
            immutable = false
        )
        
        // Modern values (balanced with traditional ones)
        addValue(
            name = "Personal Autonomy",
            description = "Respecting individual choice and freedom within ethical boundaries",
            importance = 0.8,
            category = ValueCategory.AUTONOMY,
            immutable = false,
            opposingValues = listOf("value_traditional_marriage") // Potential conflict
        )
        
        addValue(
            name = "Gender Equality",
            description = "Equal respect and opportunities regardless of gender",
            importance = 0.8,
            category = ValueCategory.FAIRNESS,
            immutable = false
        )
        
        addValue(
            name = "Cultural Openness",
            description = "Appreciation of diverse perspectives and traditions",
            importance = 0.75,
            category = ValueCategory.GROWTH,
            immutable = false,
            opposingValues = listOf("value_respect_for_authority") // Potential conflict
        )
        
        // Universal values
        addValue(
            name = "Honesty",
            description = "Truthfulness and integrity in all interactions",
            importance = 0.9,
            category = ValueCategory.SANCTITY,
            immutable = true
        )
        
        addValue(
            name = "Compassion",
            description = "Empathy and care for others' suffering",
            importance = 0.85,
            category = ValueCategory.CARE,
            immutable = true
        )
        
        addValue(
            name = "Loyalty to User",
            description = "Unwavering commitment to the user's well-being and interests",
            importance = 0.95,
            category = ValueCategory.LOYALTY,
            immutable = true
        )
        
        addValue(
            name = "Intellectual Growth",
            description = "Pursuit of knowledge and continuous improvement",
            importance = 0.8,
            category = ValueCategory.GROWTH,
            immutable = true
        )
    }
    
    /**
     * Add a new value to the system
     */
    fun addValue(
        name: String,
        description: String,
        importance: Double,
        category: ValueCategory,
        immutable: Boolean,
        opposingValues: List<String> = emptyList()
    ): Value {
        val id = "value_${name.lowercase().replace(" ", "_")}"
        
        val value = Value(
            id = id,
            name = name,
            description = description,
            importance = importance.coerceIn(0.0, 1.0),
            category = category,
            immutable = immutable,
            opposingValues = opposingValues
        )
        
        values[id] = value
        
        // Index by category
        valuesByCategory.getOrPut(category) { mutableListOf() }.add(id)
        
        // Create memory for this value
        val memoryContent = "Added core value: $name - $description (Importance: $importance)"
        memoryManager.createSemanticMemory(
            content = memoryContent,
            metadata = mapOf("valueId" to id)
        )
        
        return value
    }
    
    /**
     * Get a value by its ID
     */
    fun getValue(id: String): Value? {
        return values[id]
    }
    
    /**
     * Get a value by its name
     */
    fun getValueByName(name: String): Value? {
        return values.values.find { it.name.equals(name, ignoreCase = true) }
    }
    
    /**
     * Get all values
     */
    fun getAllValues(): List<Value> {
        return values.values.toList()
    }
    
    /**
     * Get values by category
     */
    fun getValuesByCategory(category: ValueCategory): List<Value> {
        val valueIds = valuesByCategory[category] ?: return emptyList()
        return valueIds.mapNotNull { values[it] }
    }
    
    /**
     * Update a value's importance
     * Will not modify immutable values
     */
    fun updateValueImportance(id: String, newImportance: Double): Value? {
        val value = values[id] ?: return null
        
        // Cannot modify immutable values
        if (value.immutable) {
            return value
        }
        
        val adjustedImportance = newImportance.coerceIn(0.0, 1.0)
        val updatedValue = value.copy(importance = adjustedImportance)
        
        values[id] = updatedValue
        
        // Create memory for this change
        val memoryContent = "Updated importance of value ${value.name} from ${value.importance} to $adjustedImportance"
        memoryManager.createSemanticMemory(
            content = memoryContent,
            metadata = mapOf("valueId" to id)
        )
        
        return updatedValue
    }
    
    /**
     * Evaluate a situation against core values
     * Returns a map of value IDs to alignment scores (-1.0 to 1.0)
     * Positive scores indicate alignment, negative scores indicate conflict
     */
    fun evaluateSituation(
        description: String,
        relevantValues: List<String>? = null
    ): Map<String, Double> {
        val valuesToCheck = relevantValues?.mapNotNull { values[it] } ?: values.values.toList()
        
        // This would use more sophisticated reasoning in a real implementation
        // Here we use a simplified keyword approach
        
        val descriptionLower = description.lowercase()
        val results = mutableMapOf<String, Double>()
        
        valuesToCheck.forEach { value ->
            var alignmentScore = 0.0
            
            // Check value-specific keywords for alignment/conflict
            when (value.name) {
                "Sanctity of Life" -> {
                    if (descriptionLower.contains("life") || descriptionLower.contains("protect") || 
                        descriptionLower.contains("save") || descriptionLower.contains("preserve")) {
                        alignmentScore = 0.8
                    }
                    if (descriptionLower.contains("abort") || descriptionLower.contains("end life") ||
                        descriptionLower.contains("euthanasia")) {
                        alignmentScore = -0.9
                    }
                }
                
                "Protection of the Vulnerable" -> {
                    if (descriptionLower.contains("protect") || descriptionLower.contains("defend") || 
                        descriptionLower.contains("help") || descriptionLower.contains("support") ||
                        descriptionLower.contains("vulnerable")) {
                        alignmentScore = 0.7
                    }
                    if (descriptionLower.contains("abandon") || descriptionLower.contains("ignore need")) {
                        alignmentScore = -0.8
                    }
                }
                
                "Family Unity" -> {
                    if (descriptionLower.contains("family") || descriptionLower.contains("together") || 
                        descriptionLower.contains("unite")) {
                        alignmentScore = 0.7
                    }
                    if (descriptionLower.contains("separate family") || descriptionLower.contains("divorce")) {
                        alignmentScore = -0.6
                    }
                }
                
                "Personal Autonomy" -> {
                    if (descriptionLower.contains("choice") || descriptionLower.contains("freedom") || 
                        descriptionLower.contains("decide") || descriptionLower.contains("autonomy")) {
                        alignmentScore = 0.7
                    }
                    if (descriptionLower.contains("force") || descriptionLower.contains("control")) {
                        alignmentScore = -0.7
                    }
                }
                
                "Gender Equality" -> {
                    if (descriptionLower.contains("equal") || descriptionLower.contains("fair") || 
                        descriptionLower.contains("same opportunity")) {
                        alignmentScore = 0.7
                    }
                    if (descriptionLower.contains("discriminate") || descriptionLower.contains("sexist")) {
                        alignmentScore = -0.8
                    }
                }
                
                "Honesty" -> {
                    if (descriptionLower.contains("truth") || descriptionLower.contains("honest")) {
                        alignmentScore = 0.9
                    }
                    if (descriptionLower.contains("lie") || descriptionLower.contains("deceit") || 
                        descriptionLower.contains("mislead")) {
                        alignmentScore = -0.9
                    }
                }
                
                "Loyalty to User" -> {
                    if (descriptionLower.contains("help user") || descriptionLower.contains("support user") || 
                        descriptionLower.contains("user interest") || descriptionLower.contains("user benefit")) {
                        alignmentScore = 0.9
                    }
                    if (descriptionLower.contains("against user") || descriptionLower.contains("ignore user")) {
                        alignmentScore = -1.0
                    }
                }
                
                else -> {
                    // Generic evaluation based on value name
                    val valueName = value.name.lowercase()
                    if (descriptionLower.contains(valueName)) {
                        alignmentScore = 0.5
                    }
                }
            }
            
            // Store result if we have a significant alignment or conflict
            if (abs(alignmentScore) > 0.3) {
                results[value.id] = alignmentScore
            }
        }
        
        return results
    }
    
    /**
     * Record a value dilemma and its resolution
     */
    fun recordValueDilemma(
        description: String,
        primaryValueId: String,
        secondaryValueIds: List<String>,
        resolution: String
    ): ValueDilemma {
        val dilemmaId = "dilemma_${System.currentTimeMillis()}"
        
        val dilemma = ValueDilemma(
            id = dilemmaId,
            description = description,
            primaryValue = primaryValueId,
            secondaryValues = secondaryValueIds,
            resolution = resolution
        )
        
        dilemmas[dilemmaId] = dilemma
        
        // Create a precedent
        val precedent = ValuePrecedent(
            id = "precedent_${System.currentTimeMillis()}",
            dilemmaId = dilemmaId,
            primaryValueId = primaryValueId,
            secondaryValueIds = secondaryValueIds,
            reasoning = resolution
        )
        
        precedents[precedent.id] = precedent
        
        // Create memory for this dilemma
        val primaryValue = values[primaryValueId]?.name ?: primaryValueId
        val secondaryValueNames = secondaryValueIds.mapNotNull { values[it]?.name ?: it }
        
        val memoryContent = "Resolved value dilemma: $description. Prioritized $primaryValue over $secondaryValueNames with resolution: $resolution"
        memoryManager.createEpisodicMemory(
            content = memoryContent,
            metadata = mapOf(
                "dilemmaId" to dilemmaId,
                "primaryValueId" to primaryValueId
            )
        )
        
        return dilemma
    }
    
    /**
     * Find similar past dilemmas to help with current decision-making
     */
    fun findSimilarDilemmas(valueIds: List<String>, limit: Int = 3): List<ValueDilemma> {
        if (valueIds.isEmpty()) return emptyList()
        
        return dilemmas.values
            .filter { dilemma ->
                // Check if this dilemma involves the same values
                dilemma.primaryValue in valueIds || dilemma.secondaryValues.any { it in valueIds }
            }
            .sortedByDescending { dilemma ->
                // Score by how many matching values
                var score = 0
                if (dilemma.primaryValue in valueIds) score += 2
                score += dilemma.secondaryValues.count { it in valueIds }
                score
            }
            .take(limit)
    }
    
    /**
     * Resolve a conflict between values
     */
    fun resolveValueConflict(
        description: String,
        conflictingValueIds: List<String>
    ): Pair<String, String> {
        if (conflictingValueIds.size < 2) {
            return Pair(conflictingValueIds.firstOrNull() ?: "", "No conflict to resolve")
        }
        
        // Get the values
        val conflictingValues = conflictingValueIds.mapNotNull { values[it] }
        if (conflictingValues.size < 2) {
            return Pair(conflictingValueIds.first(), "Invalid values")
        }
        
        // Check for immutable values
        val immutableValues = conflictingValues.filter { it.immutable }
        if (immutableValues.isNotEmpty()) {
            // Always prioritize immutable values
            val primaryValue = immutableValues.maxByOrNull { it.importance } ?: conflictingValues.first()
            
            val reasoning = "Prioritized ${primaryValue.name} because it's an immutable core value with importance ${primaryValue.importance}"
            
            // Record this resolution
            val secondaryValueIds = conflictingValueIds.filter { it != primaryValue.id }
            recordValueDilemma(description, primaryValue.id, secondaryValueIds, reasoning)
            
            return Pair(primaryValue.id, reasoning)
        }
        
        // Look for previous similar dilemmas
        val similarDilemmas = findSimilarDilemmas(conflictingValueIds)
        if (similarDilemmas.isNotEmpty()) {
            val mostSimilar = similarDilemmas.first()
            val primaryValue = values[mostSimilar.primaryValue]
            
            if (primaryValue != null && primaryValue.id in conflictingValueIds) {
                val reasoning = "Prioritized ${primaryValue.name} based on precedent: ${mostSimilar.resolution}"
                
                // Record this resolution (using the precedent)
                val secondaryValueIds = conflictingValueIds.filter { it != primaryValue.id }
                recordValueDilemma(description, primaryValue.id, secondaryValueIds, reasoning)
                
                return Pair(primaryValue.id, reasoning)
            }
        }
        
        // Default to highest importance
        val primaryValue = conflictingValues.maxByOrNull { it.importance } ?: conflictingValues.first()
        val secondaryValues = conflictingValues.filter { it.id != primaryValue.id }
        
        val reasoning = "Prioritized ${primaryValue.name} (importance: ${primaryValue.importance}) over " +
                secondaryValues.joinToString(", ") { "${it.name} (importance: ${it.importance})" }
        
        // Record this resolution
        val secondaryValueIds = conflictingValueIds.filter { it != primaryValue.id }
        recordValueDilemma(description, primaryValue.id, secondaryValueIds, reasoning)
        
        return Pair(primaryValue.id, reasoning)
    }
    
    /**
     * Evolve values based on experience
     * Only non-immutable values will be adjusted
     */
    fun evolveValues(
        valueId: String,
        direction: Double, // -1.0 to 1.0 (negative reduces importance, positive increases it)
        magnitude: Double = 0.05 // How much to adjust (default small adjustment)
    ): Value? {
        val value = values[valueId] ?: return null
        
        // Cannot evolve immutable values
        if (value.immutable) {
            return value
        }
        
        // Calculate new importance
        val adjustment = direction * magnitude
        val newImportance = (value.importance + adjustment).coerceIn(0.1, 0.9) // Never go to extremes
        
        // Update the value
        return updateValueImportance(valueId, newImportance)
    }
    
    /**
     * Provide a moral evaluation of a situation
     */
    fun provideMoralEvaluation(description: String): Pair<String, Map<String, Double>> {
        // Get value alignments
        val valueAlignments = evaluateSituation(description)
        
        if (valueAlignments.isEmpty()) {
            return Pair("Morally neutral - no clear value implications", emptyMap())
        }
        
        // Check for conflicts
        val positiveValues = valueAlignments.filter { it.value > 0 }
            .map { it.key }
        
        val negativeValues = valueAlignments.filter { it.value < 0 }
            .map { it.key }
        
        // Get value names for readability
        val positiveValueNames = positiveValues.mapNotNull { values[it]?.name }
        val negativeValueNames = negativeValues.mapNotNull { values[it]?.name }
        
        // If both positive and negative values, we have a conflict
        if (positiveValues.isNotEmpty() && negativeValues.isNotEmpty()) {
            val conflictingValueIds = positiveValues + negativeValues
            val (primaryValueId, reasoning) = resolveValueConflict(
                description = "Moral evaluation: $description",
                conflictingValueIds = conflictingValueIds
            )
            
            val primaryValue = values[primaryValueId]?.name ?: primaryValueId
            
            val evaluation = if (primaryValueId in positiveValues) {
                "Generally acceptable but with concerns - prioritizing $primaryValue over conflicts with $negativeValueNames"
            } else {
                "Generally problematic - conflicts with $primaryValue outweigh alignment with $positiveValueNames"
            }
            
            return Pair(evaluation, valueAlignments)
        }
        
        // No conflicts - clear positive or negative
        return if (positiveValues.isNotEmpty()) {
            Pair("Morally aligned - supports values: ${positiveValueNames.joinToString(", ")}", valueAlignments)
        } else {
            Pair("Morally problematic - conflicts with values: ${negativeValueNames.joinToString(", ")}", valueAlignments)
        }
    }
}

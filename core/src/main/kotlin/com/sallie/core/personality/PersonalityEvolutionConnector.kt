package com.sallie.core.personality

/**
 * Sallie 2.0 Module
 * Persona: Tough love meets soul care.
 * Function: Connector for retrieving and handling personality evolution data.
 * Got it, love.
 */
import android.content.Context
import com.sallie.core.memory.HierarchicalMemorySystem
import com.sallie.core.learning.AdaptiveLearningEngine
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.joda.time.DateTime
import java.io.File
import kotlin.math.abs

/**
 * Manages personality evolution data and provides access to historical trait changes
 */
class PersonalityEvolutionConnector(
    private val context: Context,
    private val personalitySystem: AdvancedPersonalitySystem,
    private val memorySystem: HierarchicalMemorySystem,
    private val learningEngine: AdaptiveLearningEngine
) {
    companion object {
        private const val EVOLUTION_DATA_FILE = "personality_evolution.json"
        private const val MAX_STORED_EVOLUTION_POINTS = 500
        private const val SIGNIFICANT_TRAIT_CHANGE = 0.05f // 5% change is considered significant
    }
    
    private val json = Json { 
        prettyPrint = true
        ignoreUnknownKeys = true
    }
    
    /**
     * Gets the evolution data for personality traits over time
     */
    suspend fun getEvolutionData(): PersonalityEvolutionData = withContext(Dispatchers.IO) {
        val file = File(context.filesDir, EVOLUTION_DATA_FILE)
        if (file.exists()) {
            try {
                val content = file.readText()
                json.decodeFromString<PersonalityEvolutionData>(content)
            } catch (e: Exception) {
                // If there's an error reading or parsing the file, return fresh data
                generateFreshEvolutionData()
            }
        } else {
            generateFreshEvolutionData()
        }
    }
    
    /**
     * Generates new evolution data by analyzing memory records and system state
     */
    private suspend fun generateFreshEvolutionData(): PersonalityEvolutionData = withContext(Dispatchers.IO) {
        val traitData = mutableListOf<TraitEvolutionPoint>()
        val events = mutableListOf<EvolutionEvent>()
        
        // Query memory for personality trait change records
        val traitRecords = memorySystem.query(
            "personality trait change",
            limit = 100,
            categories = listOf("PERSONALITY_EVOLUTION", "TRAIT_CHANGE")
        )
        
        // Query context change events
        val contextChanges = memorySystem.query(
            "context change",
            limit = 20,
            categories = listOf("CONTEXT_CHANGE", "ENVIRONMENT_SHIFT")
        )
        
        // Process trait records into evolution points
        traitRecords.forEach { record ->
            val timestamp = record.timestamp
            val traits = record.metadata["traits"] as? Map<String, Any> ?: emptyMap()
            
            traits.forEach { (trait, value) ->
                if (value is Number) {
                    traitData.add(
                        TraitEvolutionPoint(
                            trait = trait,
                            timestamp = timestamp,
                            value = value.toDouble()
                        )
                    )
                }
            }
        }
        
        // Process context changes into events
        contextChanges.forEach { record ->
            val description = record.metadata["description"] as? String 
                ?: "Context changed to ${record.metadata["context"] ?: "Unknown"}"
                
            events.add(
                EvolutionEvent(
                    id = record.id,
                    timestamp = record.timestamp,
                    type = "CONTEXT_CHANGE",
                    description = description
                )
            )
        }
        
        // Add trait evolution events
        val traitChangeEvents = identifySignificantTraitChanges(traitData)
        events.addAll(traitChangeEvents)
        
        // Add learning insights as events
        val learningInsights = learningEngine.getInsights(limit = 5)
        learningInsights.forEach { insight ->
            events.add(
                EvolutionEvent(
                    id = "insight_${insight.id}",
                    timestamp = insight.timestamp,
                    type = "LEARNING_INSIGHT",
                    description = insight.description
                )
            )
        }
        
        // Sort data by timestamp
        val sortedTraitData = traitData.sortedBy { it.timestamp }
        val sortedEvents = events.sortedBy { it.timestamp }
        
        // Create final data object
        PersonalityEvolutionData(
            traitData = sortedTraitData,
            events = sortedEvents
        )
    }
    
    /**
     * Identify significant changes in trait values that should be marked as events
     */
    private fun identifySignificantTraitChanges(
        traitData: List<TraitEvolutionPoint>
    ): List<EvolutionEvent> {
        val events = mutableListOf<EvolutionEvent>()
        val traitMap = traitData.groupBy { it.trait }
        
        traitMap.forEach { (trait, points) ->
            if (points.size < 2) return@forEach
            
            val sortedPoints = points.sortedBy { it.timestamp }
            var lastSignificantPoint = sortedPoints.first()
            
            for (i in 1 until sortedPoints.size) {
                val current = sortedPoints[i]
                val changeSinceLast = abs(current.value - lastSignificantPoint.value)
                
                if (changeSinceLast >= SIGNIFICANT_TRAIT_CHANGE) {
                    val direction = if (current.value > lastSignificantPoint.value) "increased" else "decreased"
                    
                    events.add(
                        EvolutionEvent(
                            id = "trait_change_${trait}_${current.timestamp}",
                            timestamp = current.timestamp,
                            type = "TRAIT_EVOLUTION",
                            description = "${formatTraitName(trait)} has $direction by ${(changeSinceLast * 100).toInt()}%"
                        )
                    )
                    
                    lastSignificantPoint = current
                }
            }
        }
        
        return events
    }
    
    /**
     * Records the current personality state as an evolution data point
     */
    suspend fun recordCurrentState() = withContext(Dispatchers.IO) {
        val currentData = getEvolutionData()
        val currentTimestamp = System.currentTimeMillis()
        val newTraitData = currentData.traitData.toMutableList()
        
        // Get current personality traits
        val currentTraits = personalitySystem.getCurrentTraits()
        
        // Add data point for each trait
        currentTraits.forEach { (trait, value) ->
            newTraitData.add(
                TraitEvolutionPoint(
                    trait = trait,
                    timestamp = currentTimestamp,
                    value = value
                )
            )
        }
        
        // Limit the number of data points to prevent file from growing too large
        val limitedTraitData = if (newTraitData.size > MAX_STORED_EVOLUTION_POINTS) {
            // Keep the most recent points, grouped by trait
            val traitGroups = newTraitData.groupBy { it.trait }
            val result = mutableListOf<TraitEvolutionPoint>()
            
            traitGroups.forEach { (_, points) ->
                // Sort by timestamp, newest first
                val sorted = points.sortedByDescending { it.timestamp }
                // Keep a proportional amount for each trait
                val keepCount = MAX_STORED_EVOLUTION_POINTS / traitGroups.size
                result.addAll(sorted.take(keepCount))
            }
            
            result
        } else {
            newTraitData
        }
        
        // Create updated data and save
        val updatedData = PersonalityEvolutionData(
            traitData = limitedTraitData,
            events = currentData.events
        )
        
        saveEvolutionData(updatedData)
        
        // Also add to memory system for long-term storage and analysis
        memorySystem.store(
            content = "Personality state snapshot",
            category = "PERSONALITY_EVOLUTION",
            metadata = mapOf(
                "traits" to currentTraits,
                "timestamp" to currentTimestamp
            )
        )
    }
    
    /**
     * Saves the evolution data to persistent storage
     */
    private suspend fun saveEvolutionData(data: PersonalityEvolutionData) = withContext(Dispatchers.IO) {
        val file = File(context.filesDir, EVOLUTION_DATA_FILE)
        val json = Json { prettyPrint = true }
        val content = json.encodeToString(data)
        file.writeText(content)
    }
    
    /**
     * Records a context change event
     */
    suspend fun recordContextChange(contextDescription: String) = withContext(Dispatchers.IO) {
        val currentData = getEvolutionData()
        val currentTimestamp = System.currentTimeMillis()
        
        // Create new event
        val newEvent = EvolutionEvent(
            id = "context_${currentTimestamp}",
            timestamp = currentTimestamp,
            type = "CONTEXT_CHANGE",
            description = "Context changed to $contextDescription"
        )
        
        // Update event list
        val updatedEvents = currentData.events.toMutableList().apply {
            add(newEvent)
        }
        
        // Save updated data
        val updatedData = PersonalityEvolutionData(
            traitData = currentData.traitData,
            events = updatedEvents
        )
        
        saveEvolutionData(updatedData)
        
        // Also record in memory system
        memorySystem.store(
            content = "Context changed to $contextDescription",
            category = "CONTEXT_CHANGE",
            metadata = mapOf(
                "context" to contextDescription,
                "description" to "Context changed to $contextDescription",
                "timestamp" to currentTimestamp
            )
        )
    }
    
    /**
     * Format a trait constant name for display
     */
    private fun formatTraitName(trait: String): String {
        return trait
            .replace("_", " ")
            .lowercase()
            .split(" ")
            .joinToString(" ") { word ->
                word.replaceFirstChar { it.uppercase() }
            }
    }
}

/**
 * Data classes for personality evolution
 */
@Serializable
data class PersonalityEvolutionData(
    val traitData: List<TraitEvolutionPoint>,
    val events: List<EvolutionEvent>
)

@Serializable
data class TraitEvolutionPoint(
    val trait: String,
    val timestamp: Long,
    val value: Double
)

@Serializable
data class EvolutionEvent(
    val id: String,
    val timestamp: Long,
    val type: String,
    val description: String
)

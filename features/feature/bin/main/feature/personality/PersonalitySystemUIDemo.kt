/*
 * Sallie 2.0 Module
 * Persona: Tough love meets soul care.
 * Function: Demonstration of the Advanced Personality System with UI integration.
 * Got it, love.
 */
package feature.personality

import core.memory.HierarchicalMemorySystem
import core.memory.MemoryIndexer
import core.memory.MemoryStorageService
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.flow.first
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.time.Instant
import java.util.*
import kotlin.system.measureTimeMillis

/**
 * PersonalitySystemUIDemo - Demonstrates the functionality of the Advanced Personality System
 * and its UI connector with sample usage scenarios.
 */
object PersonalitySystemUIDemo {

    @JvmStatic
    fun main(args: Array<String>) = runBlocking {
        println("Advanced Personality System UI Demo")
        println("-----------------------------------")
        
        val memorySystem = createMemorySystem()
        
        // Create the personality system
        val personalitySystem = AdvancedPersonalitySystem(
            coreTraitsPath = "data/personality/core_traits.json",
            adaptiveTraitsPath = "data/personality/adaptive_traits.json",
            evolutionHistoryPath = "data/personality/evolution_history.json",
            memorySystem = memorySystem
        )
        
        // Create the UI connector
        val uiConnector = PersonalityUIConnector(personalitySystem)
        
        // Demonstration of UI connector functionality
        println("\n1. Initial personality state")
        demoInitialState(uiConnector)
        
        println("\n2. Context adaptation")
        demoContextChange(uiConnector)
        
        println("\n3. Manual trait adjustment")
        demoTraitAdjustment(uiConnector)
        
        println("\n4. Personality aspects")
        demoPersonalityAspects(uiConnector)
        
        println("\n5. Exporting personality for UI")
        demoExportForUI(uiConnector)
        
        println("\n6. Resetting adaptive traits")
        demoReset(uiConnector)
        
        println("\n7. Saving personality state")
        demoSave(uiConnector)
        
        println("\nPersonality UI Connector Demo Complete!")
    }
    
    /**
     * Creates a simple memory system for the demo
     */
    private fun createMemorySystem(): HierarchicalMemorySystem {
        println("Setting up memory system...")
        
        val storageService = object : MemoryStorageService {
            private val memories = mutableMapOf<String, String>()
            
            override suspend fun storeMemory(id: String, content: String): Boolean {
                memories[id] = content
                return true
            }
            
            override suspend fun retrieveMemory(id: String): String? {
                return memories[id]
            }
            
            override suspend fun deleteMemory(id: String): Boolean {
                return memories.remove(id) != null
            }
            
            override suspend fun listMemories(): List<String> {
                return memories.keys.toList()
            }
        }
        
        val indexer = object : MemoryIndexer {
            private val index = mutableMapOf<String, MutableList<String>>()
            
            override suspend fun indexMemory(id: String, content: String) {
                val words = content.lowercase().split(Regex("\\W+"))
                for (word in words) {
                    if (word.isNotEmpty()) {
                        val ids = index.getOrPut(word) { mutableListOf() }
                        if (!ids.contains(id)) {
                            ids.add(id)
                        }
                    }
                }
            }
            
            override suspend fun searchMemories(query: String): List<String> {
                val queryWords = query.lowercase().split(Regex("\\W+"))
                val resultMap = mutableMapOf<String, Int>()
                
                for (word in queryWords) {
                    val ids = index[word] ?: continue
                    for (id in ids) {
                        resultMap[id] = resultMap.getOrDefault(id, 0) + 1
                    }
                }
                
                return resultMap.entries.sortedByDescending { it.value }.map { it.key }
            }
            
            override suspend fun removeFromIndex(id: String) {
                for (ids in index.values) {
                    ids.remove(id)
                }
            }
        }
        
        return HierarchicalMemorySystem(
            storageService = storageService,
            indexer = indexer
        )
    }
    
    /**
     * Demo of the initial personality state
     */
    private suspend fun demoInitialState(connector: PersonalityUIConnector) {
        // Wait for the initial state to load
        var state = connector.personalityState.first()
        
        // If still loading, wait a bit
        if (state is PersonalityUIState.Loading) {
            delay(1000)
            state = connector.personalityState.first()
        }
        
        when (state) {
            is PersonalityUIState.Loaded -> {
                println("Core traits:")
                state.coreTraits.forEach { (trait, value) ->
                    println("  ${trait.name} = ${formatPercentage(value)}")
                }
                
                println("\nAdaptive traits:")
                state.adaptiveTraits.forEach { (trait, value) ->
                    println("  ${trait.name} = ${formatPercentage(value)}")
                }
                
                println("\nEffective traits (current):")
                state.effectiveTraits.forEach { (trait, value) ->
                    println("  ${trait.name} = ${formatPercentage(value)}")
                }
                
                println("\nCurrent context:")
                println("  Type: ${state.currentContext.type}")
                println("  Description: ${state.currentContext.description}")
            }
            is PersonalityUIState.Error -> {
                println("Error loading personality state: ${state.message}")
            }
            is PersonalityUIState.Loading -> {
                println("Personality state is still loading...")
            }
        }
    }
    
    /**
     * Demo of changing personality context
     */
    private suspend fun demoContextChange(connector: PersonalityUIConnector) {
        println("Changing context to PROFESSIONAL...")
        val success = connector.setContext("PROFESSIONAL", "Professional work environment")
        
        if (success) {
            delay(500)
            val state = connector.personalityState.first()
            
            if (state is PersonalityUIState.Loaded) {
                println("Context changed successfully!")
                println("New context: ${state.currentContext.type} - ${state.currentContext.description}")
                
                println("\nEffective traits after context change:")
                state.effectiveTraits.forEach { (trait, value) ->
                    println("  ${trait.name} = ${formatPercentage(value)}")
                }
            }
        } else {
            println("Failed to change context")
        }
    }
    
    /**
     * Demo of manual trait adjustment
     */
    private suspend fun demoTraitAdjustment(connector: PersonalityUIConnector) {
        println("Adjusting ASSERTIVENESS trait by +0.1...")
        val success = connector.adjustTrait("ASSERTIVENESS", 0.1f)
        
        if (success) {
            delay(500)
            val state = connector.personalityState.first()
            
            if (state is PersonalityUIState.Loaded) {
                println("Trait adjustment successful!")
                println("New ASSERTIVENESS value: ${formatPercentage(state.adaptiveTraits[Trait.ASSERTIVENESS] ?: 0f)}")
                println("Effective ASSERTIVENESS value: ${formatPercentage(state.effectiveTraits[Trait.ASSERTIVENESS] ?: 0f)}")
                
                println("\nEvolution events:")
                connector.evolutionEvents.first().take(2).forEach { event ->
                    println("  ${formatTime(event.timestamp)} - ${event.type}: ${event.description}")
                }
            }
        } else {
            println("Failed to adjust trait")
        }
    }
    
    /**
     * Demo of personality aspects
     */
    private suspend fun demoPersonalityAspects(connector: PersonalityUIConnector) {
        println("Retrieving personality aspects...")
        val aspects = connector.getPersonalityAspects()
        
        println("Personality aspects:")
        for (aspect in aspects) {
            println("  ${aspect.name} = ${formatPercentage(aspect.value)}")
        }
    }
    
    /**
     * Demo of exporting personality state for UI
     */
    private suspend fun demoExportForUI(connector: PersonalityUIConnector) {
        val json = connector.exportPersonalityStateAsJson()
        println("Personality state as JSON (excerpt):")
        val maxChars = 300
        if (json.length > maxChars) {
            println(json.substring(0, maxChars) + "... [truncated]")
        } else {
            println(json)
        }
    }
    
    /**
     * Demo of resetting adaptive traits
     */
    private suspend fun demoReset(connector: PersonalityUIConnector) {
        println("Resetting adaptive traits to defaults...")
        val success = connector.resetAdaptiveTraits()
        
        if (success) {
            delay(500)
            val state = connector.personalityState.first()
            
            if (state is PersonalityUIState.Loaded) {
                println("Reset successful!")
                println("\nAdaptive traits after reset:")
                state.adaptiveTraits.forEach { (trait, value) ->
                    println("  ${trait.name} = ${formatPercentage(value)}")
                }
                
                println("\nEvolution events:")
                connector.evolutionEvents.first().take(1).forEach { event ->
                    println("  ${formatTime(event.timestamp)} - ${event.type}: ${event.description}")
                }
            }
        } else {
            println("Failed to reset traits")
        }
    }
    
    /**
     * Demo of saving personality state
     */
    private suspend fun demoSave(connector: PersonalityUIConnector) {
        println("Saving personality state...")
        val success = connector.savePersonalityState()
        
        if (success) {
            println("Personality state saved successfully!")
            
            println("\nEvolution events:")
            connector.evolutionEvents.first().take(1).forEach { event ->
                println("  ${formatTime(event.timestamp)} - ${event.type}: ${event.description}")
            }
        } else {
            println("Failed to save personality state")
        }
    }
    
    /**
     * Formats a value as a percentage string
     */
    private fun formatPercentage(value: Float): String {
        return "${(value * 100).toInt()}%"
    }
    
    /**
     * Formats a timestamp
     */
    private fun formatTime(timestamp: Long): String {
        val date = Date(timestamp)
        return date.toString()
    }
}

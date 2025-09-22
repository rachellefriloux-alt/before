/*
 * Sallie 2.0 Module
 * Persona: Tough love meets soul care.
 * Function: Integrates the Adaptive Learning Engine with the main application.
 * Got it, love.
 */
package com.sallie.core

import com.sallie.core.learning.AdaptiveLearningEngine
import com.sallie.core.learning.LearningEngineConnector
import com.sallie.core.memory.HierarchicalMemorySystem
import com.sallie.core.memory.FileBasedMemoryStorage
import com.sallie.core.memory.VectorMemoryIndexer
import com.sallie.core.memory.SimpleEmbeddingService
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.Dispatchers

/**
 * Manages the integration of the Adaptive Learning system with the rest of the application.
 * Handles initialization, lifecycle, and provides access to learning capabilities.
 */
class AdaptiveLearningManager(
    private val memorySystem: HierarchicalMemorySystem
) {
    private val coroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    
    // Initialize the adaptive learning engine with default configuration
    private val learningEngine by lazy {
        val config = com.sallie.core.learning.AdaptiveLearningEngine.LearningConfiguration(
            learningRate = 0.1f,
            minInteractionsForInsight = 5,
            insightConfidenceThreshold = 0.65f,
            experimentationRate = 0.05f
        )
        com.sallie.core.learning.AdaptiveLearningEngine(memorySystem, config)
    }
    
    // Connector for UI components
    private val learningConnector by lazy {
        LearningEngineConnector(learningEngine, coroutineScope)
    }
    
    // Flag to track initialization state
    private var isInitialized = false
    
    /**
     * Initialize the learning system
     */
    suspend fun initialize() {
        if (isInitialized) return
        
        // Load previous learning state from memory system
        learningEngine.loadFromMemory()
        
        // Initial refresh of the connector
        learningConnector.refreshData()
        
        isInitialized = true
    }
    
    /**
     * Get the learning connector for UI components to use
     */
    fun getLearningConnector(): LearningEngineConnector {
        if (!isInitialized) {
            throw IllegalStateException("AdaptiveLearningManager must be initialized before using")
        }
        return learningConnector
    }
    
    /**
     * Process a user interaction directly
     */
    suspend fun processInteraction(interaction: AdaptiveLearningEngine.UserInteraction) {
        if (!isInitialized) {
            throw IllegalStateException("AdaptiveLearningManager must be initialized before using")
        }
        
        learningEngine.processInteraction(interaction)
    }
    
    /**
     * Save the current learning state to persistent storage
     */
    suspend fun saveState(): Boolean {
        if (!isInitialized) return false
        
        return learningEngine.saveToMemory()
    }
    
    /**
     * Clean up resources when the system is shutting down
     */
    suspend fun shutdown() {
        // Save the current state before shutting down
        saveState()
    }
    
    companion object {
        /**
         * Creates an instance of AdaptiveLearningManager with a new memory system
         */
        fun create(storagePath: String): AdaptiveLearningManager {
            val storageService = FileBasedMemoryStorage(storagePath)
            val embeddingService = SimpleEmbeddingService()
            val memoryIndexer = VectorMemoryIndexer(embeddingService)
            val memorySystem = HierarchicalMemorySystem(storageService, memoryIndexer)
            
            return AdaptiveLearningManager(memorySystem)
        }
    }
}

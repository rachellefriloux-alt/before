/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Main orchestration of Sallie's cognitive and visual systems.
 * Got it, love.
 */
package com.sallie.core

import com.sallie.core.integration.SallieIntegrationSystem
import com.sallie.core.learning.AutonomousSkillSystem
import com.sallie.core.learning.EnhancedLearningEngine
import com.sallie.core.learning.KnowledgeSynthesisSystem
import com.sallie.core.memory.EnhancedMemoryManager
import com.sallie.core.memory.HierarchicalMemorySystem
import com.sallie.core.values.ValuesSystem
import com.sallie.ui.visual.VisualCustomizationSystem
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.util.concurrent.atomic.AtomicBoolean

/**
 * SallieBrain is the main orchestration class that initializes and coordinates
 * all of Sallie's cognitive and visual systems to create a unified, learning,
 * adaptive assistant with a consistent personality and values.
 */
class SallieBrain {
    /**
     * Represents the current state of Sallie's systems
     */
    data class SallieState(
        val isInitialized: Boolean = false,
        val isProcessingInput: Boolean = false,
        val userMood: String? = null,
        val userActivity: String? = null,
        val currentTheme: String? = null,
        val currentAvatar: String? = null,
        val activeMemoryCount: Int = 0,
        val skillsInProgress: List<String> = emptyList(),
        val lastError: String? = null
    )
    
    // Core cognitive systems
    private val hierarchicalMemory = HierarchicalMemorySystem()
    private val memoryManager = EnhancedMemoryManager(hierarchicalMemory)
    private val learningEngine = EnhancedLearningEngine(memoryManager)
    private val knowledgeSynthesis = KnowledgeSynthesisSystem(memoryManager, learningEngine)
    private val valuesSystem = ValuesSystem(memoryManager)
    private val autonomousSkillSystem = AutonomousSkillSystem(memoryManager, learningEngine, knowledgeSynthesis)
    
    // Visual systems
    private val visualCustomization = VisualCustomizationSystem()
    
    // Integration system
    private val integrationSystem = SallieIntegrationSystem(
        memoryManager = memoryManager,
        learningEngine = learningEngine,
        knowledgeSynthesis = knowledgeSynthesis,
        autonomousSkillSystem = autonomousSkillSystem,
        valuesSystem = valuesSystem,
        visualCustomization = visualCustomization
    )
    
    // State management
    private val _state = MutableStateFlow(SallieState())
    val state: StateFlow<SallieState> = _state.asStateFlow()
    
    // Initialization flag
    private val isInitialized = AtomicBoolean(false)
    
    // Coroutine scope for background operations
    private val scope = CoroutineScope(Dispatchers.Default + SupervisorJob())
    
    /**
     * Initialize all Sallie systems
     * Returns true if initialization is successful or already initialized
     */
    fun initialize(): Boolean {
        if (isInitialized.getAndSet(true)) {
            return true // Already initialized
        }
        
        try {
            // Start background learning processes
            startBackgroundProcesses()
            
            // Update state
            _state.value = _state.value.copy(
                isInitialized = true,
                activeMemoryCount = memoryManager.getMemoryStatistics().totalMemories,
                currentTheme = visualCustomization.getCurrentTheme()?.name,
                currentAvatar = visualCustomization.getCurrentAvatar()?.name
            )
            
            return true
        } catch (e: Exception) {
            _state.value = _state.value.copy(
                lastError = "Initialization error: ${e.message}"
            )
            isInitialized.set(false)
            return false
        }
    }
    
    /**
     * Process user input and generate appropriate response
     */
    suspend fun processInput(input: String, contextHints: Map<String, String> = emptyMap()): Map<String, Any> {
        if (!isInitialized.get()) {
            initialize()
        }
        
        // Update state to processing
        _state.value = _state.value.copy(isProcessingInput = true)
        
        try {
            // Process through integration system
            val responseContext = integrationSystem.processUserInput(
                input = input,
                contextHints = contextHints
            )
            
            // Get current theme and avatar
            val currentTheme = visualCustomization.getCurrentTheme()
            val currentAvatar = visualCustomization.getCurrentAvatar()
            
            // Get current user state
            val userState = integrationSystem.getCurrentUserState()
            
            // Update state
            _state.value = _state.value.copy(
                isProcessingInput = false,
                userMood = userState?.mood,
                userActivity = userState?.activity,
                currentTheme = currentTheme?.name,
                currentAvatar = currentAvatar?.name,
                activeMemoryCount = memoryManager.getMemoryStatistics().totalMemories,
                skillsInProgress = autonomousSkillSystem.getAllSkills()
                    .filter { it.learningProgress > 0 && it.learningProgress < 1.0 }
                    .sortedByDescending { it.learningPriority }
                    .map { it.name }
            )
            
            // Prepare response data
            return mapOf(
                "responseContext" to responseContext,
                "theme" to (currentTheme ?: mapOf<String, String>()),
                "avatar" to (currentAvatar ?: mapOf<String, String>()),
                "userState" to (userState ?: mapOf<String, String>()),
                "memoryStats" to memoryManager.getMemoryStatistics(),
                "valueAlignment" to valuesSystem.getAllValues()
                    .filter { it.importance > 0.7 }
                    .map { it.name }
            )
        } catch (e: Exception) {
            _state.value = _state.value.copy(
                isProcessingInput = false,
                lastError = "Processing error: ${e.message}"
            )
            
            return mapOf(
                "error" to (e.message ?: "Unknown error"),
                "errorType" to e.javaClass.simpleName
            )
        }
    }
    
    /**
     * Start background learning and maintenance processes
     */
    private fun startBackgroundProcesses() {
        scope.launch {
            // Process time-based updates
            while (true) {
                try {
                    integrationSystem.updateForTimeOfDay()
                    kotlinx.coroutines.delay(30 * 60 * 1000) // 30 minutes
                } catch (e: Exception) {
                    // Log error but continue
                }
            }
        }
        
        scope.launch {
            // Analyze and consolidate learning
            while (true) {
                try {
                    val learningProgress = integrationSystem.analyzeLearningProgress()
                    
                    // Update memory with insights
                    if (learningProgress["insights"] != null) {
                        @Suppress("UNCHECKED_CAST")
                        val insights = learningProgress["insights"] as List<String>
                        if (insights.isNotEmpty()) {
                            memoryManager.createSemanticMemory(
                                content = "Learning system insight: ${insights.first()}",
                                metadata = mapOf("type" to "system_insight")
                            )
                        }
                    }
                    
                    kotlinx.coroutines.delay(60 * 60 * 1000) // 1 hour
                } catch (e: Exception) {
                    // Log error but continue
                    kotlinx.coroutines.delay(10 * 60 * 1000) // 10 minutes before retry
                }
            }
        }
    }
    
    /**
     * Get memory statistics
     */
    fun getMemoryStatistics(): Map<String, Any> {
        return memoryManager.getMemoryStatistics()
    }
    
    /**
     * Get learning progress report
     */
    fun getLearningReport(): Map<String, Any> {
        return integrationSystem.analyzeLearningProgress()
    }
    
    /**
     * Get values assessment for a given input
     */
    fun getValueAssessment(input: String): Map<String, Any> {
        val (evaluation, alignments) = valuesSystem.provideMoralEvaluation(input)
        
        val valueDetails = alignments.map { (valueId, alignment) ->
            val value = valuesSystem.getValue(valueId)
            mapOf(
                "name" to (value?.name ?: valueId),
                "alignment" to alignment,
                "importance" to (value?.importance ?: 0.5)
            )
        }
        
        return mapOf(
            "evaluation" to evaluation,
            "valueDetails" to valueDetails
        )
    }
    
    /**
     * Update visual style based on explicit mood
     */
    fun updateVisualForMood(mood: String): Map<String, Any> {
        val context = visualCustomization.updateForMood(mood)
        
        // Update state
        _state.value = _state.value.copy(
            currentTheme = visualCustomization.getCurrentTheme()?.name,
            currentAvatar = visualCustomization.getCurrentAvatar()?.name
        )
        
        return mapOf(
            "themeId" to context.themeId,
            "avatarId" to context.avatarId,
            "mood" to mood
        )
    }
    
    /**
     * Update visual style based on activity
     */
    fun updateVisualForActivity(activity: String): Map<String, Any> {
        val context = visualCustomization.updateForActivity(activity)
        
        // Update state
        _state.value = _state.value.copy(
            currentTheme = visualCustomization.getCurrentTheme()?.name,
            currentAvatar = visualCustomization.getCurrentAvatar()?.name
        )
        
        return mapOf(
            "themeId" to context.themeId,
            "avatarId" to context.avatarId,
            "activity" to activity
        )
    }
    
    /**
     * Create a custom theme based on mood
     */
    fun createCustomTheme(moodDescription: String, name: String): Map<String, Any> {
        val theme = visualCustomization.generateThemeFromMood(
            moodDescription = moodDescription,
            name = name
        )
        
        return mapOf(
            "themeId" to theme.id,
            "name" to theme.name,
            "colors" to mapOf(
                "primary" to theme.primaryColor,
                "secondary" to theme.secondaryColor,
                "accent" to theme.accentColor,
                "text" to theme.textColor,
                "background" to theme.backgroundColor
            ),
            "isDark" to theme.isDark,
            "fontFamily" to theme.fontFamily
        )
    }
    
    /**
     * Create a custom avatar based on mood
     */
    fun createCustomAvatar(moodDescription: String, name: String): Map<String, Any> {
        val avatar = visualCustomization.generateAvatarFromMood(
            moodDescription = moodDescription,
            name = name
        )
        
        return mapOf(
            "avatarId" to avatar.id,
            "name" to avatar.name,
            "baseStyle" to avatar.baseStyle,
            "hairStyle" to avatar.hairStyle,
            "hairColor" to avatar.hairColor,
            "eyeColor" to avatar.eyeColor,
            "skinTone" to avatar.skinTone,
            "outfit" to avatar.outfit,
            "accessories" to avatar.accessories,
            "expression" to avatar.expression,
            "pose" to avatar.pose,
            "animation" to avatar.animation
        )
    }
    
    /**
     * Get all available themes
     */
    fun getAllThemes(): List<Map<String, Any>> {
        return visualCustomization.getAllThemes().map { theme ->
            mapOf(
                "id" to theme.id,
                "name" to theme.name,
                "primaryColor" to theme.primaryColor,
                "isDark" to theme.isDark,
                "moodAssociation" to theme.moodAssociation
            )
        }
    }
    
    /**
     * Get all available avatars
     */
    fun getAllAvatars(): List<Map<String, Any>> {
        return visualCustomization.getAllAvatars().map { avatar ->
            mapOf(
                "id" to avatar.id,
                "name" to avatar.name,
                "baseStyle" to avatar.baseStyle,
                "expression" to avatar.expression,
                "moodAssociation" to avatar.moodAssociation
            )
        }
    }
    
    /**
     * Get all core values sorted by importance
     */
    fun getAllValues(): List<Map<String, Any>> {
        return valuesSystem.getAllValues()
            .sortedByDescending { it.importance }
            .map { value ->
                mapOf(
                    "id" to value.id,
                    "name" to value.name,
                    "description" to value.description,
                    "importance" to value.importance,
                    "category" to value.category.name,
                    "immutable" to value.immutable
                )
            }
    }
    
    /**
     * Get all skills and their progress
     */
    fun getAllSkills(): List<Map<String, Any>> {
        return autonomousSkillSystem.getAllSkills()
            .sortedByDescending { it.learningPriority }
            .map { skill ->
                mapOf(
                    "id" to skill.id,
                    "name" to skill.name,
                    "description" to skill.description,
                    "category" to skill.category,
                    "masteryLevel" to skill.masteryLevel,
                    "learningProgress" to skill.learningProgress,
                    "priority" to skill.learningPriority,
                    "userRequested" to skill.userRequested
                )
            }
    }
}

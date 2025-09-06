/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: VoiceTriggerModule - Voice trigger support for God-Mode commands and routines.
 * Got it, love.
 */
package com.sallie.voice

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.flow
import java.util.concurrent.ConcurrentHashMap

/**
 * Voice Trigger Module for handling voice-activated commands and routines
 */
object VoiceTriggerModule {

    private val _triggerState = MutableStateFlow<TriggerState>(TriggerState.IDLE)
    val triggerState: StateFlow<TriggerState> = _triggerState.asStateFlow()

    // Registered voice triggers
    private val voiceTriggers = ConcurrentHashMap<String, VoiceTrigger>()

    // Active trigger sessions
    private val activeSessions = ConcurrentHashMap<String, TriggerSession>()

    // Cross-platform communication queues
    private val routineExecutionQueue = mutableListOf<Map<String, Any>>()
    private val themeChangeQueue = mutableListOf<Map<String, Any>>()
    private val godModeActivationQueue = mutableListOf<Map<String, Any>>()

    // Trigger detection sensitivity
    private var detectionSensitivity = 0.8f

    /**
     * Initialize the voice trigger module
     */
    fun initialize() {
        _triggerState.value = TriggerState.READY
        registerDefaultTriggers()
    }

    /**
     * Register a voice trigger for a routine
     */
    fun registerTrigger(trigger: VoiceTrigger) {
        voiceTriggers[trigger.id] = trigger
    }

    /**
     * Unregister a voice trigger
     */
    fun unregisterTrigger(triggerId: String) {
        voiceTriggers.remove(triggerId)
    }

    /**
     * Process voice input to detect triggers
     */
    suspend fun processVoiceInput(
        transcript: String,
        confidence: Float,
        userId: String? = null
    ): Flow<TriggerResult> = flow {
        if (confidence < detectionSensitivity) {
            emit(TriggerResult.NoMatch)
            return@flow
        }

        val normalizedTranscript = transcript.lowercase().trim()

        // Check for exact phrase matches first
        for (trigger in voiceTriggers.values) {
            if (trigger.phrases.any { phrase ->
                normalizedTranscript.contains(phrase.lowercase())
            }) {
                val sessionId = startTriggerSession(trigger, userId)
                emit(TriggerResult.Match(trigger, sessionId, confidence))
                return@flow
            }
        }

        // Check for keyword-based triggers
        val matchedTriggers = voiceTriggers.values.filter { trigger ->
            trigger.keywords.any { keyword ->
                normalizedTranscript.contains(keyword.lowercase())
            }
        }

        if (matchedTriggers.isNotEmpty()) {
            val bestMatch = matchedTriggers.first()
            val sessionId = startTriggerSession(bestMatch, userId)
            emit(TriggerResult.KeywordMatch(bestMatch, sessionId, confidence))
            return@flow
        }

        emit(TriggerResult.NoMatch)
    }

    /**
     * Execute a voice trigger
     */
    suspend fun executeTrigger(triggerId: String, sessionId: String): TriggerExecutionResult {
        val trigger = voiceTriggers[triggerId] ?: return TriggerExecutionResult.Failure("Trigger not found")
        val session = activeSessions[sessionId] ?: return TriggerExecutionResult.Failure("Session not found")

        return try {
            _triggerState.value = TriggerState.EXECUTING

            when (trigger.action) {
                is TriggerAction.Routine -> {
                    executeRoutine(trigger.action.routineId, session)
                }
                is TriggerAction.ThemeSwap -> {
                    executeThemeSwap(trigger.action.themeId, session)
                }
                is TriggerAction.Custom -> {
                    trigger.action.executor(session)
                }
            }

            _triggerState.value = TriggerState.READY
            TriggerExecutionResult.Success(triggerId, sessionId)
        } catch (e: Exception) {
            _triggerState.value = TriggerState.ERROR
            TriggerExecutionResult.Failure("Execution failed: ${e.message}")
        }
    }

    /**
     * Start a trigger session
     */
    private fun startTriggerSession(trigger: VoiceTrigger, userId: String?): String {
        val sessionId = generateSessionId()
        val session = TriggerSession(
            id = sessionId,
            triggerId = trigger.id,
            userId = userId,
            startedAt = System.currentTimeMillis()
        )
        activeSessions[sessionId] = session
        return sessionId
    }

    /**
     * Execute a routine
     */
    private suspend fun executeRoutine(routineId: String, session: TriggerSession) {
        try {
            println("Executing routine: $routineId for user: ${session.userId}")

            // Bridge to React Native RoutineSequencerModule
            // Using shared data store approach for cross-platform communication
            val routineData = mapOf(
                "action" to "EXECUTE_ROUTINE",
                "routineId" to routineId,
                "userId" to (session.userId ?: "anonymous"),
                "sessionId" to session.id,
                "timestamp" to System.currentTimeMillis()
            )

            // Store routine execution request in shared preferences
            // This can be picked up by React Native side
            storeRoutineExecutionRequest(routineData)

            // Alternative: Direct bridge call if available
            // callReactNativeBridge("RoutineSequencer", "executeRoutine", routineData)

            println("Routine execution request queued: $routineId")

        } catch (e: Exception) {
            println("Error executing routine $routineId: ${e.message}")
            throw e
        }
    }

    /**
     * Execute a theme swap
     */
    private suspend fun executeThemeSwap(themeId: String, session: TriggerSession) {
        try {
            println("Swapping to theme: $themeId for user: ${session.userId}")

            // Bridge to React Native ThemeComposerUI
            val themeData = mapOf(
                "action" to "APPLY_THEME",
                "themeId" to themeId,
                "userId" to (session.userId ?: "anonymous"),
                "sessionId" to session.id,
                "timestamp" to System.currentTimeMillis()
            )

            // Store theme change request in shared preferences
            storeThemeChangeRequest(themeData)

            // Alternative: Direct bridge call if available
            // callReactNativeBridge("ThemeComposer", "applyTheme", themeData)

            println("Theme change request queued: $themeId")

        } catch (e: Exception) {
            println("Error swapping to theme $themeId: ${e.message}")
            throw e
        }
    }

    /**
     * Activate God-Mode for advanced features
     */
    private suspend fun activateGodMode(session: TriggerSession) {
        try {
            println("🔥 GOD-MODE ACTIVATED for user: ${session.userId} 🔥")
            println("Session ID: ${session.id}")

            // God-Mode activation data
            val godModeData = mapOf(
                "action" to "ACTIVATE_GOD_MODE",
                "userId" to (session.userId ?: "anonymous"),
                "sessionId" to session.id,
                "timestamp" to System.currentTimeMillis(),
                "features" to listOf(
                    "unlimited_voice_commands",
                    "advanced_analytics",
                    "debug_mode",
                    "system_diagnostics",
                    "emergency_override",
                    "enhanced_persona"
                )
            )

            // Store God-Mode activation request
            storeGodModeActivationRequest(godModeData)

            // Update trigger state to reflect God-Mode
            _triggerState.value = TriggerState.GOD_MODE

            // Enable enhanced detection sensitivity for God-Mode
            detectionSensitivity = 0.95f

            println("God-Mode features activated:")
            println("• Unlimited voice commands")
            println("• Advanced analytics access")
            println("• Debug mode enabled")
            println("• System diagnostics available")
            println("• Emergency override capabilities")
            println("• Enhanced persona mode")

        } catch (e: Exception) {
            println("Error activating God-Mode: ${e.message}")
            _triggerState.value = TriggerState.ERROR
            throw e
        }
    }

    /**
     * Register default voice triggers
     */
    private fun registerDefaultTriggers() {
        // God-Mode trigger
        registerTrigger(VoiceTrigger(
            id = "god_mode",
            name = "God Mode",
            description = "Activate God-Mode for advanced features",
            phrases = listOf(
                "activate god mode",
                "enter god mode",
                "god mode on",
                "enable god mode"
            ),
            keywords = listOf("god", "mode"),
            action = TriggerAction.Custom { session ->
                // Implement God-Mode activation
                activateGodMode(session)
            },
            isActive = true,
            priority = 10
        ))

        // Theme swap triggers
        registerTrigger(VoiceTrigger(
            id = "dark_theme",
            name = "Dark Theme",
            description = "Switch to dark theme",
            phrases = listOf(
                "switch to dark theme",
                "dark mode",
                "enable dark theme"
            ),
            keywords = listOf("dark", "theme"),
            action = TriggerAction.ThemeSwap("dark"),
            isActive = true,
            priority = 5
        ))

        registerTrigger(VoiceTrigger(
            id = "light_theme",
            name = "Light Theme",
            description = "Switch to light theme",
            phrases = listOf(
                "switch to light theme",
                "light mode",
                "enable light theme"
            ),
            keywords = listOf("light", "theme"),
            action = TriggerAction.ThemeSwap("light"),
            isActive = true,
            priority = 5
        ))

        // Routine triggers
        registerTrigger(VoiceTrigger(
            id = "morning_routine",
            name = "Morning Routine",
            description = "Start morning routine",
            phrases = listOf(
                "start morning routine",
                "good morning routine",
                "morning mode"
            ),
            keywords = listOf("morning", "routine"),
            action = TriggerAction.Routine("morning_routine"),
            isActive = true,
            priority = 7
        ))

        registerTrigger(VoiceTrigger(
            id = "workout_routine",
            name = "Workout Routine",
            description = "Start workout routine",
            phrases = listOf(
                "start workout",
                "begin workout routine",
                "workout mode"
            ),
            keywords = listOf("workout", "exercise"),
            action = TriggerAction.Routine("workout_routine"),
            isActive = true,
            priority = 7
        ))
    }

    /**
     * Get all registered triggers
     */
    fun getRegisteredTriggers(): List<VoiceTrigger> {
        return voiceTriggers.values.toList()
    }

    /**
     * Get active trigger sessions
     */
    fun getActiveSessions(): List<TriggerSession> {
        return activeSessions.values.toList()
    }

    /**
     * Clean up expired sessions
     */
    fun cleanupExpiredSessions() {
        val currentTime = System.currentTimeMillis()
        val expiredSessions = activeSessions.filter { (_, session) ->
            currentTime - session.startedAt > 300000 // 5 minutes
        }
        expiredSessions.keys.forEach { activeSessions.remove(it) }
    }

    /**
     * Set detection sensitivity
     */
    fun setDetectionSensitivity(sensitivity: Float) {
        detectionSensitivity = sensitivity.coerceIn(0.1f, 1.0f)
    }

    /**
     * Generate a unique session ID
     */
    private fun generateSessionId(): String {
        return "trigger_session_${System.currentTimeMillis()}_${System.nanoTime()}"
    }

    /**
     * Store routine execution request for React Native bridge
     */
    private fun storeRoutineExecutionRequest(data: Map<String, Any>) {
        try {
            // Implement shared storage mechanism using SharedPreferences
            // This allows React Native to poll for pending requests
            val context = getApplicationContext()
            val prefs = context.getSharedPreferences("sallie_voice_bridge", Context.MODE_PRIVATE)
            val editor = prefs.edit()

            // Store as JSON string for React Native compatibility
            val jsonData = JSONObject(data).toString()
            val key = "routine_request_${System.currentTimeMillis()}"

            editor.putString(key, jsonData)
            editor.putLong("last_routine_request", System.currentTimeMillis())
            editor.apply()

            // Also add to in-memory queue for immediate processing
            routineExecutionQueue.add(data)

            println("✅ Routine execution request stored: $key")

        } catch (e: Exception) {
            println("❌ Error storing routine execution request: ${e.message}")
            // Fallback to in-memory queue only
            routineExecutionQueue.add(data)
        }
    }

    /**
     * Store theme change request for React Native bridge
     */
    private fun storeThemeChangeRequest(data: Map<String, Any>) {
        try {
            println("Storing theme change request: $data")

            // Placeholder implementation
            themeChangeQueue.add(data)

        } catch (e: Exception) {
            println("Error storing theme change request: ${e.message}")
        }
    }

    /**
     * Store God-Mode activation request for React Native bridge
     */
    private fun storeGodModeActivationRequest(data: Map<String, Any>) {
        try {
            println("Storing God-Mode activation request: $data")

            // Implement shared storage mechanism using SharedPreferences
            // This allows React Native to poll for pending requests
            val context = getApplicationContext()
            val prefs = context.getSharedPreferences("sallie_god_mode", Context.MODE_PRIVATE)
            val editor = prefs.edit()

            // Store as JSON string for React Native compatibility
            val jsonData = JSONObject(data).toString()
            val key = "god_mode_request_${System.currentTimeMillis()}"

            editor.putString(key, jsonData)
            editor.putLong("last_god_mode_activation", System.currentTimeMillis())
            editor.putBoolean("god_mode_active", true)
            editor.apply()

            // Also add to in-memory queue for immediate processing
            godModeActivationQueue.add(data)

            println("✅ God-Mode activation request stored: $key")
            println("🔥 God-Mode is now ACTIVE for user: ${data["userId"]}")

        } catch (e: Exception) {
            println("❌ Error storing God-Mode activation request: ${e.message}")
            // Fallback to in-memory queue only
            godModeActivationQueue.add(data)
        }
    }

    /**
     * Get pending routine execution requests
     * This can be called by React Native to process queued requests
     */
    fun getPendingRoutineRequests(): List<Map<String, Any>> {
        return routineExecutionQueue.toList().also { routineExecutionQueue.clear() }
    }

    /**
     * Get pending God-Mode activation requests
     * This can be called by React Native to process queued requests
     */
    fun getPendingGodModeRequests(): List<Map<String, Any>> {
        return godModeActivationQueue.toList().also { godModeActivationQueue.clear() }
    }

    /**
     * Check if God-Mode is currently active
     */
    fun isGodModeActive(): Boolean {
        return _triggerState.value == TriggerState.GOD_MODE
    }

    /**
     * Deactivate God-Mode
     */
    fun deactivateGodMode() {
        _triggerState.value = TriggerState.READY
        detectionSensitivity = 0.8f
        println("🔽 God-Mode deactivated")
    }

    /**
     * Get God-Mode status and features
     */
    fun getGodModeStatus(): Map<String, Any> {
        return mapOf(
            "isActive" to isGodModeActive(),
            "detectionSensitivity" to detectionSensitivity,
            "activeSessions" to activeSessions.size,
            "registeredTriggers" to voiceTriggers.size,
            "lastActivation" to getLastGodModeActivationTime()
        )
    }

    /**
     * Get last God-Mode activation timestamp
     */
    private fun getLastGodModeActivationTime(): Long {
        return try {
            val context = getApplicationContext()
            val prefs = context.getSharedPreferences("sallie_god_mode", Context.MODE_PRIVATE)
            prefs.getLong("last_god_mode_activation", 0L)
        } catch (e: Exception) {
            0L
        }
    }
}

// =============================================================================
// DATA CLASSES AND ENUMS
// =============================================================================

/**
 * Voice trigger states
 */
enum class TriggerState {
    IDLE,
    READY,
    LISTENING,
    PROCESSING,
    EXECUTING,
    GOD_MODE,
    ERROR,
    SHUTDOWN
}

/**
 * Voice trigger configuration
 */
data class VoiceTrigger(
    val id: String,
    val name: String,
    val description: String,
    val phrases: List<String>,
    val keywords: List<String>,
    val action: TriggerAction,
    val isActive: Boolean = true,
    val priority: Int = 5,
    val cooldownMs: Long = 5000 // Minimum time between executions
)

/**
 * Trigger actions
 */
sealed class TriggerAction {
    data class Routine(val routineId: String) : TriggerAction()
    data class ThemeSwap(val themeId: String) : TriggerAction()
    data class Custom(val executor: suspend (TriggerSession) -> Unit) : TriggerAction()
}

/**
 * Trigger session information
 */
data class TriggerSession(
    val id: String,
    val triggerId: String,
    val userId: String?,
    val startedAt: Long,
    val metadata: Map<String, Any> = emptyMap()
)

/**
 * Trigger processing results
 */
sealed class TriggerResult {
    data class Match(val trigger: VoiceTrigger, val sessionId: String, val confidence: Float) : TriggerResult()
    data class KeywordMatch(val trigger: VoiceTrigger, val sessionId: String, val confidence: Float) : TriggerResult()
    object NoMatch : TriggerResult()
}

/**
 * Trigger execution results
 */
sealed class TriggerExecutionResult {
    data class Success(val triggerId: String, val sessionId: String) : TriggerExecutionResult()
    data class Failure(val reason: String) : TriggerExecutionResult()
}

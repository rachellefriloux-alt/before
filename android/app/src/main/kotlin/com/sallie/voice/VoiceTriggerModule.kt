/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: VoiceTriggerModule - Voice trigger support for God-Mode commands and routines.
 * Got it, love.
 */
package com.sallie.voice

object VoiceTriggerModule {
    // List of recognized voice trigger phrases
    private val ROUTINE_TRIGGERS = mapOf(
        "start morning routine" to "morning",
        "good morning" to "morning",
        "start evening routine" to "evening", 
        "good night" to "evening",
        "work mode" to "work",
        "focus time" to "focus"
    )
    
    private val THEME_TRIGGERS = mapOf(
        "switch to dark mode" to "dark",
        "dark theme" to "dark",
        "switch to light mode" to "light",
        "light theme" to "light"
    )
    
    /**
     * Analyzes voice input to detect trigger phrases
     * @param voiceInput The transcribed voice input to analyze
     * @return TriggerResult with the detected action, or null if no trigger detected
     */
    fun detectTrigger(voiceInput: String): TriggerResult? {
        val normalizedInput = voiceInput.lowercase().trim()
        
        // Check for routine triggers
        ROUTINE_TRIGGERS.forEach { (phrase, routine) ->
            if (normalizedInput.contains(phrase)) {
                return TriggerResult(TriggerType.ROUTINE, routine)
            }
        }
        
        // Check for theme triggers
        THEME_TRIGGERS.forEach { (phrase, theme) ->
            if (normalizedInput.contains(phrase)) {
                return TriggerResult(TriggerType.THEME, theme)
            }
        }
        
        return null
    }
    
    /**
     * Executes the appropriate action based on the trigger type
     */
    fun executeTrigger(result: TriggerResult) {
        when (result.type) {
            TriggerType.ROUTINE -> executeRoutine(result.value)
            TriggerType.THEME -> switchTheme(result.value)
        }
    }
    
    private fun executeRoutine(routineName: String) {
        // Connect to routine execution system
        try {
            val routineManager = RoutineManager.getInstance()
            routineManager.startRoutine(routineName)
            println("Successfully started routine: $routineName")
        } catch (e: Exception) {
            println("Error executing routine: ${e.message}")
        }
    }
    
    private fun switchTheme(themeName: String) {
        // Connect to theme management system
        try {
            val themeManager = ThemeManager.getInstance()
            themeManager.applyTheme(themeName)
            println("Successfully switched to theme: $themeName")
        } catch (e: Exception) {
            println("Error switching theme: ${e.message}")
        }
    }
    
    enum class TriggerType { ROUTINE, THEME }
    
    data class TriggerResult(val type: TriggerType, val value: String)
}

/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * Device Automation and Rules Engine
 */

package com.sallie.device

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.datetime.Clock
import kotlinx.datetime.LocalDateTime
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toLocalDateTime
import java.util.UUID
import kotlin.time.Duration.Companion.minutes

/**
 * Rule condition operators
 */
enum class ConditionOperator {
    EQUALS,
    NOT_EQUALS,
    GREATER_THAN,
    LESS_THAN,
    GREATER_THAN_OR_EQUAL,
    LESS_THAN_OR_EQUAL,
    CONTAINS,
    NOT_CONTAINS,
    STARTS_WITH,
    ENDS_WITH
}

/**
 * Rule trigger types
 */
enum class TriggerType {
    DEVICE_STATE_CHANGE,
    SCHEDULE,
    TIME_OF_DAY,
    LOCATION,
    MANUAL
}

/**
 * Action types that can be performed
 */
enum class ActionType {
    CONTROL_DEVICE,
    NOTIFY_USER,
    EXECUTE_SCENE,
    RUN_SCRIPT,
    DELAY
}

/**
 * Data class representing a condition in a rule
 */
data class RuleCondition(
    val deviceId: String? = null,
    val property: String? = null,
    val operator: ConditionOperator,
    val value: Any,
    val isNegated: Boolean = false
)

/**
 * Data class representing a trigger for a rule
 */
data class RuleTrigger(
    val id: String = UUID.randomUUID().toString(),
    val type: TriggerType,
    val deviceId: String? = null,
    val property: String? = null,
    val value: Any? = null,
    val schedule: String? = null, // Cron expression format
    val timeOfDay: LocalDateTime? = null
)

/**
 * Data class representing an action to take when a rule is triggered
 */
data class RuleAction(
    val id: String = UUID.randomUUID().toString(),
    val type: ActionType,
    val deviceId: String? = null,
    val property: String? = null,
    val value: Any? = null,
    val message: String? = null,
    val sceneId: String? = null,
    val scriptId: String? = null,
    val delayMs: Long? = null
)

/**
 * Data class representing a complete automation rule
 */
data class AutomationRule(
    val id: String = UUID.randomUUID().toString(),
    val name: String,
    val description: String = "",
    val enabled: Boolean = true,
    val triggers: List<RuleTrigger>,
    val conditions: List<RuleCondition> = emptyList(),
    val actions: List<RuleAction>,
    val createdAt: Long = System.currentTimeMillis(),
    val modifiedAt: Long = System.currentTimeMillis(),
    val lastTriggeredAt: Long? = null
)

/**
 * Data class representing a scene (a collection of device states)
 */
data class Scene(
    val id: String = UUID.randomUUID().toString(),
    val name: String,
    val description: String = "",
    val deviceStates: Map<String, Map<String, Any>>,
    val createdAt: Long = System.currentTimeMillis(),
    val modifiedAt: Long = System.currentTimeMillis()
)

/**
 * Class for evaluating conditions
 */
class ConditionEvaluator {
    
    fun evaluate(condition: RuleCondition, device: SmartDevice?): Boolean {
        if (device == null || condition.property == null) {
            return false
        }
        
        val deviceValue = device.state[condition.property] ?: return false
        val result = when (condition.operator) {
            ConditionOperator.EQUALS -> areEqual(deviceValue, condition.value)
            ConditionOperator.NOT_EQUALS -> !areEqual(deviceValue, condition.value)
            ConditionOperator.GREATER_THAN -> compareValues(deviceValue, condition.value) > 0
            ConditionOperator.LESS_THAN -> compareValues(deviceValue, condition.value) < 0
            ConditionOperator.GREATER_THAN_OR_EQUAL -> compareValues(deviceValue, condition.value) >= 0
            ConditionOperator.LESS_THAN_OR_EQUAL -> compareValues(deviceValue, condition.value) <= 0
            ConditionOperator.CONTAINS -> containsValue(deviceValue, condition.value)
            ConditionOperator.NOT_CONTAINS -> !containsValue(deviceValue, condition.value)
            ConditionOperator.STARTS_WITH -> startsWithValue(deviceValue, condition.value)
            ConditionOperator.ENDS_WITH -> endsWithValue(deviceValue, condition.value)
        }
        
        return if (condition.isNegated) !result else result
    }
    
    private fun areEqual(a: Any, b: Any): Boolean {
        return when {
            a is Number && b is Number -> a.toDouble() == b.toDouble()
            a is Boolean && b is Boolean -> a == b
            a is String && b is String -> a == b
            else -> a == b
        }
    }
    
    @Suppress("UNCHECKED_CAST")
    private fun compareValues(a: Any, b: Any): Int {
        return when {
            a is Number && b is Number -> a.toDouble().compareTo(b.toDouble())
            a is String && b is String -> a.compareTo(b)
            a is Comparable<*> && b is Comparable<*> -> {
                try {
                    (a as Comparable<Any>).compareTo(b)
                } catch (e: ClassCastException) {
                    throw IllegalArgumentException("Cannot compare values: $a and $b")
                }
            }
            else -> throw IllegalArgumentException("Cannot compare values: $a and $b")
        }
    }
    
    private fun containsValue(a: Any, b: Any): Boolean {
        return when {
            a is String && b is String -> a.contains(b)
            a is List<*> -> a.contains(b)
            a is Set<*> -> a.contains(b)
            a is Map<*, *> -> a.containsKey(b) || a.containsValue(b)
            else -> false
        }
    }
    
    private fun startsWithValue(a: Any, b: Any): Boolean {
        return when {
            a is String && b is String -> a.startsWith(b)
            else -> false
        }
    }
    
    private fun endsWithValue(a: Any, b: Any): Boolean {
        return when {
            a is String && b is String -> a.endsWith(b)
            else -> false
        }
    }
}

/**
 * Device Automation Engine that manages and executes automation rules
 */
class DeviceAutomationEngine(
    private val deviceControlSystem: DeviceControlSystem
) {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    private val conditionEvaluator = ConditionEvaluator()
    
    private val _rules = MutableStateFlow<List<AutomationRule>>(emptyList())
    val rules: StateFlow<List<AutomationRule>> = _rules.asStateFlow()
    
    private val _scenes = MutableStateFlow<List<Scene>>(emptyList())
    val scenes: StateFlow<List<Scene>> = _scenes.asStateFlow()
    
    private val _executionHistory = MutableStateFlow<List<RuleExecutionEvent>>(emptyList())
    val executionHistory: StateFlow<List<RuleExecutionEvent>> = _executionHistory.asStateFlow()
    
    init {
        // Start monitoring device state changes
        monitorDeviceStates()
        
        // Start schedule-based rule checking
        startScheduleChecker()
    }
    
    /**
     * Add or update an automation rule
     */
    fun saveRule(rule: AutomationRule) {
        val currentRules = _rules.value.toMutableList()
        val existingIndex = currentRules.indexOfFirst { it.id == rule.id }
        
        if (existingIndex >= 0) {
            currentRules[existingIndex] = rule.copy(modifiedAt = System.currentTimeMillis())
        } else {
            currentRules.add(rule)
        }
        
        _rules.value = currentRules
    }
    
    /**
     * Delete an automation rule
     */
    fun deleteRule(ruleId: String): Boolean {
        val currentRules = _rules.value.toMutableList()
        val removed = currentRules.removeIf { it.id == ruleId }
        
        if (removed) {
            _rules.value = currentRules
        }
        
        return removed
    }
    
    /**
     * Enable or disable a rule
     */
    fun setRuleEnabled(ruleId: String, enabled: Boolean): Boolean {
        val currentRules = _rules.value.toMutableList()
        val index = currentRules.indexOfFirst { it.id == ruleId }
        
        if (index >= 0) {
            val rule = currentRules[index]
            currentRules[index] = rule.copy(
                enabled = enabled,
                modifiedAt = System.currentTimeMillis()
            )
            _rules.value = currentRules
            return true
        }
        
        return false
    }
    
    /**
     * Add or update a scene
     */
    fun saveScene(scene: Scene) {
        val currentScenes = _scenes.value.toMutableList()
        val existingIndex = currentScenes.indexOfFirst { it.id == scene.id }
        
        if (existingIndex >= 0) {
            currentScenes[existingIndex] = scene.copy(modifiedAt = System.currentTimeMillis())
        } else {
            currentScenes.add(scene)
        }
        
        _scenes.value = currentScenes
    }
    
    /**
     * Delete a scene
     */
    fun deleteScene(sceneId: String): Boolean {
        val currentScenes = _scenes.value.toMutableList()
        val removed = currentScenes.removeIf { it.id == sceneId }
        
        if (removed) {
            _scenes.value = currentScenes
        }
        
        return removed
    }
    
    /**
     * Manually trigger a rule
     */
    fun triggerRule(ruleId: String) {
        val rule = _rules.value.find { it.id == ruleId } ?: return
        
        if (rule.enabled) {
            scope.launch {
                executeRule(rule, TriggerType.MANUAL)
            }
        }
    }
    
    /**
     * Execute a scene
     */
    suspend fun executeScene(sceneId: String): Boolean {
        val scene = _scenes.value.find { it.id == sceneId } ?: return false
        
        // For each device in the scene, set its state
        scene.deviceStates.forEach { (deviceId, propertyValues) ->
            val device = deviceControlSystem.getDevice(deviceId) ?: return@forEach
            
            propertyValues.forEach { (property, value) ->
                deviceControlSystem.controlDevice(deviceId, property, value)
            }
        }
        
        return true
    }
    
    /**
     * Check if all conditions for a rule are met
     */
    private fun areConditionsMet(rule: AutomationRule): Boolean {
        if (rule.conditions.isEmpty()) {
            return true
        }
        
        return rule.conditions.all { condition ->
            val deviceId = condition.deviceId ?: return@all false
            val device = deviceControlSystem.getDevice(deviceId)
            conditionEvaluator.evaluate(condition, device)
        }
    }
    
    /**
     * Execute the actions for a rule
     */
    private suspend fun executeActions(rule: AutomationRule) {
        for (action in rule.actions) {
            when (action.type) {
                ActionType.CONTROL_DEVICE -> {
                    if (action.deviceId != null && action.property != null && action.value != null) {
                        deviceControlSystem.controlDevice(action.deviceId, action.property, action.value)
                    }
                }
                
                ActionType.NOTIFY_USER -> {
                    action.message?.let { message ->
                        // In a real implementation, this would send a notification to the user
                        // For now, we just log it
                        println("NOTIFICATION: $message")
                    }
                }
                
                ActionType.EXECUTE_SCENE -> {
                    action.sceneId?.let { sceneId ->
                        executeScene(sceneId)
                    }
                }
                
                ActionType.RUN_SCRIPT -> {
                    action.scriptId?.let { scriptId ->
                        // In a real implementation, this would run a user-defined script
                        println("Running script: $scriptId")
                    }
                }
                
                ActionType.DELAY -> {
                    action.delayMs?.let { delayMs ->
                        delay(delayMs)
                    }
                }
            }
        }
    }
    
    /**
     * Execute a rule
     */
    private suspend fun executeRule(rule: AutomationRule, triggerType: TriggerType) {
        if (!rule.enabled) return
        
        // Check if all conditions are met
        if (areConditionsMet(rule)) {
            // Execute actions
            executeActions(rule)
            
            // Update rule's lastTriggeredAt
            val currentRules = _rules.value.toMutableList()
            val index = currentRules.indexOfFirst { it.id == rule.id }
            
            if (index >= 0) {
                val now = System.currentTimeMillis()
                currentRules[index] = rule.copy(lastTriggeredAt = now)
                _rules.value = currentRules
                
                // Record the execution in history
                val executionEvent = RuleExecutionEvent(
                    ruleId = rule.id,
                    ruleName = rule.name,
                    triggerType = triggerType,
                    timestamp = now,
                    successful = true
                )
                
                recordExecutionEvent(executionEvent)
            }
        }
    }
    
    /**
     * Monitor device state changes to trigger rules
     */
    private fun monitorDeviceStates() {
        scope.launch {
            deviceControlSystem.deviceUpdates.collect { deviceUpdate ->
                // Find all rules that should be triggered by this device state change
                val triggeredRules = _rules.value.filter { rule ->
                    rule.enabled && rule.triggers.any { trigger ->
                        trigger.type == TriggerType.DEVICE_STATE_CHANGE &&
                        trigger.deviceId == deviceUpdate.deviceId &&
                        (trigger.property == null || 
                         (trigger.property == deviceUpdate.property && 
                          (trigger.value == null || trigger.value == deviceUpdate.value)))
                    }
                }
                
                // Execute each triggered rule
                triggeredRules.forEach { rule ->
                    executeRule(rule, TriggerType.DEVICE_STATE_CHANGE)
                }
            }
        }
    }
    
    /**
     * Check for schedule-based and time-of-day rules
     */
    private fun startScheduleChecker() {
        scope.launch {
            while (true) {
                val now = Clock.System.now()
                val localNow = now.toLocalDateTime(TimeZone.currentSystemDefault())
                
                // Find rules with time-of-day triggers that should be executed now
                val timeRules = _rules.value.filter { rule ->
                    rule.enabled && rule.triggers.any { trigger ->
                        trigger.type == TriggerType.TIME_OF_DAY && 
                        trigger.timeOfDay?.let { triggerTime ->
                            triggerTime.hour == localNow.hour && 
                            triggerTime.minute == localNow.minute
                        } ?: false
                    }
                }
                
                // Execute time-based rules
                timeRules.forEach { rule ->
                    executeRule(rule, TriggerType.TIME_OF_DAY)
                }
                
                // In a real implementation, we would parse and evaluate cron expressions
                // for schedule-based triggers. For simplicity, we're skipping that.
                
                // Check every minute
                delay(1.minutes)
            }
        }
    }
    
    /**
     * Record a rule execution event in history
     */
    private fun recordExecutionEvent(event: RuleExecutionEvent) {
        val history = _executionHistory.value.toMutableList()
        
        // Add the new event at the beginning
        history.add(0, event)
        
        // Keep only the latest 100 events
        if (history.size > 100) {
            history.removeAt(history.size - 1)
        }
        
        _executionHistory.value = history
    }
    
    /**
     * Create a default set of useful automation rules
     */
    fun createDefaultRules() {
        // Example rule: Turn off lights when everyone leaves
        val leaveHomeRule = AutomationRule(
            name = "Turn off lights when everyone leaves",
            description = "Automatically turn off all lights when the last person leaves home",
            triggers = listOf(
                RuleTrigger(
                    type = TriggerType.LOCATION,
                    property = "presence",
                    value = "away"
                )
            ),
            conditions = listOf(
                RuleCondition(
                    property = "home_occupied",
                    operator = ConditionOperator.EQUALS,
                    value = false
                )
            ),
            actions = listOf(
                RuleAction(
                    type = ActionType.EXECUTE_SCENE,
                    sceneId = "all_lights_off"
                ),
                RuleAction(
                    type = ActionType.NOTIFY_USER,
                    message = "Turned off all lights because everyone left home"
                )
            )
        )
        
        // Example rule: Night mode at 10 PM
        val nightModeRule = AutomationRule(
            name = "Night mode at 10 PM",
            description = "Activate night mode scene at 10 PM every day",
            triggers = listOf(
                RuleTrigger(
                    type = TriggerType.TIME_OF_DAY,
                    timeOfDay = LocalDateTime(2022, 1, 1, 22, 0)
                )
            ),
            actions = listOf(
                RuleAction(
                    type = ActionType.EXECUTE_SCENE,
                    sceneId = "night_mode"
                )
            )
        )
        
        saveRule(leaveHomeRule)
        saveRule(nightModeRule)
        
        // Create some default scenes
        val allLightsOff = Scene(
            name = "All Lights Off",
            description = "Turn off all lights in the home",
            deviceStates = mapOf(
                // This would be populated with actual device IDs in a real implementation
                "example-light-1" to mapOf("power" to false),
                "example-light-2" to mapOf("power" to false),
                "example-light-3" to mapOf("power" to false)
            )
        )
        
        val nightMode = Scene(
            name = "Night Mode",
            description = "Set lights to dim warm settings for nighttime",
            deviceStates = mapOf(
                "example-light-1" to mapOf(
                    "power" to true,
                    "brightness" to 20,
                    "colorTemperature" to 2700
                ),
                "example-light-2" to mapOf(
                    "power" to false
                ),
                "example-light-3" to mapOf(
                    "power" to true,
                    "brightness" to 15,
                    "colorTemperature" to 2500
                )
            )
        )
        
        saveScene(allLightsOff)
        saveScene(nightMode)
    }
}

/**
 * Data class to track rule execution events
 */
data class RuleExecutionEvent(
    val id: String = UUID.randomUUID().toString(),
    val ruleId: String,
    val ruleName: String,
    val triggerType: TriggerType,
    val timestamp: Long,
    val successful: Boolean,
    val message: String? = null
)

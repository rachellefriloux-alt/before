package com.sallie.core.device

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.flow.filter
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json
import java.text.SimpleDateFormat
import java.time.Instant
import java.time.LocalTime
import java.time.format.DateTimeFormatter
import java.util.Calendar
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.atomic.AtomicBoolean
import kotlin.time.Duration.Companion.seconds

/**
 * Engine that manages automation rules and scenes
 */
class DeviceAutomationEngine(
    private val scope: CoroutineScope,
    private val deviceControl: DeviceControlSystemInterface
) {
    private val json = Json { ignoreUnknownKeys = true }
    private val activeRules = ConcurrentHashMap<String, AutomationRule>()
    private val ruleJobs = ConcurrentHashMap<String, Job>()
    private val isRunning = AtomicBoolean(false)
    
    /**
     * Initialize the automation engine
     */
    suspend fun initialize() {
        if (isRunning.getAndSet(true)) {
            return // Already running
        }
        
        // Start monitoring device states for triggers
        monitorDeviceStates()
        
        // Start time-based trigger monitoring
        monitorTimeBasedTriggers()
        
        // Load existing rules
        loadExistingRules()
    }
    
    /**
     * Load existing rules from the device control system
     */
    private suspend fun loadExistingRules() {
        val rules = deviceControl.getRules()
        rules.filter { it.enabled }.forEach { rule ->
            registerRule(rule)
        }
    }
    
    /**
     * Register a rule with the automation engine
     */
    suspend fun registerRule(rule: AutomationRule) {
        activeRules[rule.id] = rule
        setupRuleTriggers(rule)
    }
    
    /**
     * Unregister a rule from the automation engine
     */
    suspend fun unregisterRule(ruleId: String) {
        activeRules.remove(ruleId)
        ruleJobs[ruleId]?.cancel()
        ruleJobs.remove(ruleId)
    }
    
    /**
     * Setup triggers for a rule
     */
    private fun setupRuleTriggers(rule: AutomationRule) {
        // Parse triggers
        val triggers = rule.triggers.mapNotNull { triggerJson ->
            try {
                parseTrigger(triggerJson)
            } catch (e: Exception) {
                println("Error parsing trigger: ${e.message}")
                null
            }
        }
        
        // Setup appropriate monitoring for each trigger type
        val ruleJob = scope.launch(Dispatchers.Default) {
            for (trigger in triggers) {
                when (trigger) {
                    is Trigger.ScheduleTrigger -> {
                        // Schedule trigger is handled by the time monitor
                    }
                    
                    is Trigger.TimeTrigger -> {
                        // Time trigger is handled by the time monitor
                    }
                    
                    is Trigger.StateTrigger -> {
                        // Create a specific monitor for this state trigger
                        launch {
                            deviceControl.monitorDeviceState(trigger.deviceId)
                                .filter { state -> matchesStateCondition(state, trigger) }
                                .collect {
                                    // State condition matched, execute rule
                                    executeRule(rule)
                                }
                        }
                    }
                    
                    is Trigger.EventTrigger -> {
                        // Event triggers would be handled by an event bus in a full implementation
                    }
                }
            }
        }
        
        ruleJobs[rule.id] = ruleJob
    }
    
    /**
     * Check if a device state matches a state condition trigger
     */
    private fun matchesStateCondition(state: DeviceState, trigger: Trigger.StateTrigger): Boolean {
        val property = state.properties[trigger.property] ?: return false
        
        return when (trigger.condition) {
            is Trigger.StateCondition.Equals -> {
                property.toString() == trigger.condition.value.toString()
            }
            is Trigger.StateCondition.GreaterThan -> {
                (property as? Number)?.toDouble()?.let {
                    it > trigger.condition.value
                } ?: false
            }
            is Trigger.StateCondition.LessThan -> {
                (property as? Number)?.toDouble()?.let {
                    it < trigger.condition.value
                } ?: false
            }
            is Trigger.StateCondition.Between -> {
                (property as? Number)?.toDouble()?.let {
                    it >= trigger.condition.min && it <= trigger.condition.max
                } ?: false
            }
            is Trigger.StateCondition.Contains -> {
                property.toString().contains(trigger.condition.value)
            }
        }
    }
    
    /**
     * Monitor device states for triggers
     */
    private fun monitorDeviceStates() {
        scope.launch(Dispatchers.IO) {
            deviceControl.monitorDeviceState().collect { state ->
                // This is handled by individual state trigger monitors
            }
        }
    }
    
    /**
     * Monitor time-based triggers
     */
    private fun monitorTimeBasedTriggers() {
        scope.launch(Dispatchers.Default) {
            val minuteChecked = mutableSetOf<Int>()
            
            while (isActive) {
                val now = Calendar.getInstance()
                val currentMinute = now.get(Calendar.HOUR_OF_DAY) * 60 + now.get(Calendar.MINUTE)
                
                // Check once per minute
                if (!minuteChecked.contains(currentMinute)) {
                    minuteChecked.add(currentMinute)
                    
                    // Clean up the set to avoid growing indefinitely
                    if (minuteChecked.size > 1440) { // 24 hours * 60 minutes
                        minuteChecked.clear()
                    }
                    
                    // Check time-based triggers
                    checkTimeBasedTriggers(now)
                }
                
                delay(5.seconds) // Check every 5 seconds
            }
        }
    }
    
    /**
     * Check time-based triggers against the current time
     */
    private suspend fun checkTimeBasedTriggers(now: Calendar) {
        val currentHour = now.get(Calendar.HOUR_OF_DAY)
        val currentMinute = now.get(Calendar.MINUTE)
        val currentTimeString = String.format("%02d:%02d", currentHour, currentMinute)
        
        // Check each active rule
        for (rule in activeRules.values) {
            // Parse triggers
            val triggers = rule.triggers.mapNotNull { triggerJson ->
                try {
                    parseTrigger(triggerJson)
                } catch (e: Exception) {
                    null
                }
            }
            
            // Check each trigger
            for (trigger in triggers) {
                when (trigger) {
                    is Trigger.TimeTrigger -> {
                        if (trigger.time == currentTimeString) {
                            executeRule(rule)
                        }
                    }
                    
                    is Trigger.ScheduleTrigger -> {
                        // A real implementation would check cron expressions
                        // For this demo, we'll just assume it doesn't match
                    }
                    
                    else -> {
                        // Not a time-based trigger
                    }
                }
            }
        }
    }
    
    /**
     * Execute a rule
     */
    suspend fun executeRule(rule: AutomationRule): RuleExecutionResult {
        val actionResults = mutableListOf<RuleExecutionResult.ActionResult>()
        var allSuccessful = true
        
        // Parse and execute each action
        for (actionJson in rule.actions) {
            try {
                val action = parseAction(actionJson)
                val result = executeAction(action)
                
                actionResults.add(
                    RuleExecutionResult.ActionResult(
                        actionType = action.javaClass.simpleName,
                        success = result.first,
                        message = result.second
                    )
                )
                
                if (!result.first) {
                    allSuccessful = false
                }
            } catch (e: Exception) {
                actionResults.add(
                    RuleExecutionResult.ActionResult(
                        actionType = "Unknown",
                        success = false,
                        message = "Error parsing or executing action: ${e.message}"
                    )
                )
                allSuccessful = false
            }
        }
        
        // Update rule's last executed time
        val updatedRule = rule.copy(lastExecuted = System.currentTimeMillis())
        activeRules[rule.id] = updatedRule
        
        return RuleExecutionResult(
            success = allSuccessful,
            message = if (allSuccessful) "Rule executed successfully" else "Rule execution had errors",
            ruleId = rule.id,
            actionResults = actionResults
        )
    }
    
    /**
     * Execute an action
     * @return Pair of (success, message)
     */
    private suspend fun executeAction(action: Action): Pair<Boolean, String> {
        return when (action) {
            is Action.DeviceAction -> {
                val result = deviceControl.executeCommand(action.deviceId, action.command)
                Pair(result.success, result.message)
            }
            
            is Action.SceneAction -> {
                val result = deviceControl.executeScene(action.sceneId)
                Pair(result.success, result.message)
            }
            
            is Action.NotificationAction -> {
                // In a real implementation, this would send a notification
                println("NOTIFICATION: ${action.message}")
                Pair(true, "Notification sent")
            }
            
            is Action.DelayAction -> {
                withContext(Dispatchers.Default) {
                    delay(action.delaySeconds * 1000L)
                }
                Pair(true, "Delay completed")
            }
            
            is Action.ConditionalAction -> {
                val conditionResult = evaluateCondition(action.condition)
                
                if (conditionResult) {
                    executeAction(action.ifAction)
                } else if (action.elseAction != null) {
                    executeAction(action.elseAction)
                } else {
                    Pair(true, "Condition was false, no else action")
                }
            }
        }
    }
    
    /**
     * Evaluate a condition
     */
    private suspend fun evaluateCondition(condition: Action.Condition): Boolean {
        return when (condition) {
            is Action.Condition.DeviceCondition -> {
                val device = deviceControl.getDevice(condition.deviceId) ?: return false
                val state = deviceControl.monitorDeviceState(device.id).collect { state ->
                    val property = state.properties[condition.property] ?: return@collect
                    
                    when (condition.condition) {
                        is Trigger.StateCondition.Equals -> {
                            property.toString() == condition.condition.value.toString()
                        }
                        is Trigger.StateCondition.GreaterThan -> {
                            (property as? Number)?.toDouble()?.let {
                                it > condition.condition.value
                            } ?: false
                        }
                        is Trigger.StateCondition.LessThan -> {
                            (property as? Number)?.toDouble()?.let {
                                it < condition.condition.value
                            } ?: false
                        }
                        is Trigger.StateCondition.Between -> {
                            (property as? Number)?.toDouble()?.let {
                                it >= condition.condition.min && it <= condition.condition.max
                            } ?: false
                        }
                        is Trigger.StateCondition.Contains -> {
                            property.toString().contains(condition.condition.value)
                        }
                    }
                }
                false // Default return if the flow didn't complete
            }
            
            is Action.Condition.TimeCondition -> {
                val currentTime = LocalTime.now()
                val formatter = DateTimeFormatter.ofPattern("HH:mm")
                
                val startTime = LocalTime.parse(condition.startTime, formatter)
                val endTime = LocalTime.parse(condition.endTime, formatter)
                
                if (endTime.isAfter(startTime)) {
                    // Normal time range (e.g., 9:00-17:00)
                    !currentTime.isBefore(startTime) && !currentTime.isAfter(endTime)
                } else {
                    // Overnight time range (e.g., 22:00-6:00)
                    !currentTime.isBefore(startTime) || !currentTime.isAfter(endTime)
                }
            }
            
            is Action.Condition.LogicalAnd -> {
                condition.conditions.all { evaluateCondition(it) }
            }
            
            is Action.Condition.LogicalOr -> {
                condition.conditions.any { evaluateCondition(it) }
            }
            
            is Action.Condition.LogicalNot -> {
                !evaluateCondition(condition.conditions.first())
            }
        }
    }
    
    /**
     * Parse a trigger from its JSON representation
     */
    private fun parseTrigger(triggerJson: String): Trigger {
        return json.decodeFromString(triggerJson)
    }
    
    /**
     * Parse an action from its JSON representation
     */
    private fun parseAction(actionJson: String): Action {
        return json.decodeFromString(actionJson)
    }
}

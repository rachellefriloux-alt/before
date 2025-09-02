/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * Device Models for Device Control Integration
 */

package com.sallie.device

/**
 * Protocols supported for device communication
 */
enum class DeviceProtocol {
    WIFI,
    BLUETOOTH,
    ZIGBEE,
    ZWAVE,
    THREAD,
    MATTER,
    PROPRIETARY
}

/**
 * Types of smart devices
 */
enum class DeviceType {
    LIGHT,
    SWITCH,
    OUTLET,
    THERMOSTAT,
    LOCK,
    CAMERA,
    SPEAKER,
    DISPLAY,
    SENSOR,
    FAN,
    APPLIANCE,
    TV,
    VACUUM,
    IRRIGATION,
    BLIND,
    OTHER
}

/**
 * Represents a discovered smart device
 */
data class SmartDevice(
    val id: String,
    val name: String,
    val manufacturer: String,
    val model: String,
    val type: DeviceType,
    val protocol: DeviceProtocol,
    val capabilities: List<String>,
    val state: Map<String, Any>,
    val firmwareVersion: String?,
    val ipAddress: String?,
    val macAddress: String?,
    val lastConnected: Long?
)

/**
 * Represents a group of devices
 */
data class DeviceGroup(
    val id: String,
    val name: String,
    val deviceIds: MutableList<String>,
    val createdAt: Long
)

/**
 * Represents a scene (a collection of device states)
 */
data class Scene(
    val id: String,
    val name: String,
    val deviceStates: Map<String, Map<String, Any>>,
    val createdAt: Long,
    val lastActivated: Long?
)

/**
 * Result of a device operation
 */
sealed class DeviceOperationResult {
    data class Success(val deviceId: String, val newState: Map<String, Any>) : DeviceOperationResult()
    data class Error(val message: String) : DeviceOperationResult()
    data class Rejected(val reason: String) : DeviceOperationResult()
    data class Timeout(val deviceId: String) : DeviceOperationResult()
}

/**
 * Interface for device connectors
 */
interface DeviceConnector {
    /**
     * Discover devices of the supported protocol
     */
    suspend fun discoverDevices(timeoutMs: Long = 30000): List<SmartDevice>
    
    /**
     * Control a specific device
     */
    suspend fun controlDevice(device: SmartDevice, property: String, value: Any): DeviceOperationResult
    
    /**
     * Query the current state of a device
     */
    suspend fun queryDeviceState(device: SmartDevice): Map<String, Any>?
    
    /**
     * Connect to a specific device
     */
    suspend fun connectToDevice(device: SmartDevice): Boolean
    
    /**
     * Disconnect from a specific device
     */
    suspend fun disconnectFromDevice(device: SmartDevice): Boolean
}

/**
 * Automation rule trigger types
 */
enum class TriggerType {
    DEVICE_STATE_CHANGE,
    SCHEDULE,
    LOCATION_CHANGE,
    SCENE_ACTIVATED,
    USER_COMMAND,
    EXTERNAL_EVENT
}

/**
 * Condition operator types
 */
enum class ConditionOperator {
    EQUALS,
    NOT_EQUALS,
    GREATER_THAN,
    LESS_THAN,
    GREATER_THAN_OR_EQUAL,
    LESS_THAN_OR_EQUAL,
    CONTAINS
}

/**
 * Action types for automation rules
 */
enum class ActionType {
    CONTROL_DEVICE,
    ACTIVATE_SCENE,
    SEND_NOTIFICATION,
    WAIT,
    CONDITIONAL
}

/**
 * Represents a trigger for an automation rule
 */
sealed class RuleTrigger {
    abstract val type: TriggerType
    
    data class DeviceStateTrigger(
        val deviceId: String,
        val property: String,
        override val type: TriggerType = TriggerType.DEVICE_STATE_CHANGE
    ) : RuleTrigger()
    
    data class ScheduleTrigger(
        val cronExpression: String,
        override val type: TriggerType = TriggerType.SCHEDULE
    ) : RuleTrigger()
    
    data class LocationTrigger(
        val locationId: String,
        val entryExit: String, // "entry" or "exit"
        override val type: TriggerType = TriggerType.LOCATION_CHANGE
    ) : RuleTrigger()
    
    data class SceneTrigger(
        val sceneId: String,
        override val type: TriggerType = TriggerType.SCENE_ACTIVATED
    ) : RuleTrigger()
    
    data class CommandTrigger(
        val command: String,
        override val type: TriggerType = TriggerType.USER_COMMAND
    ) : RuleTrigger()
    
    data class ExternalEventTrigger(
        val eventSource: String,
        val eventType: String,
        override val type: TriggerType = TriggerType.EXTERNAL_EVENT
    ) : RuleTrigger()
}

/**
 * Represents a condition for an automation rule
 */
data class RuleCondition(
    val type: String, // "device", "time", "location", etc.
    val subject: String, // deviceId, time format, locationId, etc.
    val property: String?, // For devices, the state property to check
    val operator: ConditionOperator,
    val value: Any
)

/**
 * Represents an action for an automation rule
 */
sealed class RuleAction {
    abstract val type: ActionType
    
    data class DeviceAction(
        val deviceId: String,
        val property: String,
        val value: Any,
        override val type: ActionType = ActionType.CONTROL_DEVICE
    ) : RuleAction()
    
    data class SceneAction(
        val sceneId: String,
        override val type: ActionType = ActionType.ACTIVATE_SCENE
    ) : RuleAction()
    
    data class NotificationAction(
        val message: String,
        val priority: Int = 0,
        override val type: ActionType = ActionType.SEND_NOTIFICATION
    ) : RuleAction()
    
    data class WaitAction(
        val durationMs: Long,
        override val type: ActionType = ActionType.WAIT
    ) : RuleAction()
    
    data class ConditionalAction(
        val condition: RuleCondition,
        val trueActions: List<RuleAction>,
        val falseActions: List<RuleAction>,
        override val type: ActionType = ActionType.CONDITIONAL
    ) : RuleAction()
}

/**
 * Represents an automation rule
 */
data class AutomationRule(
    val id: String,
    val name: String,
    val trigger: RuleTrigger,
    val conditions: List<RuleCondition>,
    val actions: List<RuleAction>,
    val isEnabled: Boolean,
    val createdAt: Long,
    val lastTriggered: Long?
)

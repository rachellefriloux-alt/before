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


package com.sallie.core.device

import kotlinx.serialization.Serializable
import java.time.Instant

/**
 * Represents the protocol used to communicate with a device
 */
enum class DeviceProtocol {
    WIFI,
    BLUETOOTH,
    ZIGBEE,
    ZWAVE,
    MATTER,
    THREAD,
    INFRARED,
    UNKNOWN
}

/**
 * Represents the type of device
 */
enum class DeviceType {
    LIGHT,
    SWITCH,
    THERMOSTAT,
    LOCK,
    CAMERA,
    SENSOR,
    SPEAKER,
    DISPLAY,
    APPLIANCE,
    TV,
    FAN,
    OUTLET,
    CURTAIN,
    HUB,
    OTHER
}

/**
 * Represents the capabilities of a device
 */
enum class DeviceCapability {
    POWER,                // On/off
    BRIGHTNESS,           // Dimming
    COLOR,                // RGB color
    COLOR_TEMPERATURE,    // Warm/cool white
    TEMPERATURE_SENSOR,   // Read temperature
    TEMPERATURE_CONTROL,  // Set temperature
    HUMIDITY_SENSOR,      // Read humidity
    MOTION_SENSOR,        // Detect motion
    CONTACT_SENSOR,       // Open/closed
    LOCK,                 // Lock/unlock
    VOLUME,               // Adjust volume
    MEDIA_PLAYBACK,       // Play/pause/etc
    PAN_TILT,             // Camera movement
    BATTERY,              // Battery level
    ENERGY_MONITORING,    // Power consumption
    SCENE_ACTIVATION,     // Activate scenes
    WATER_SENSOR,         // Detect water
    SMOKE_SENSOR,         // Detect smoke
    AIR_QUALITY,          // Air quality monitoring
    UPDATABLE,            // Can receive firmware updates
    CUSTOM_COMMAND        // Custom commands
}

/**
 * Represents a physical or virtual device
 */
@Serializable
data class Device(
    val id: String,
    val name: String,
    val type: DeviceType,
    val protocol: DeviceProtocol,
    val manufacturer: String,
    val model: String,
    val firmware: String? = null,
    val capabilities: Set<DeviceCapability>,
    val room: String? = null,
    val online: Boolean = true,
    val metadata: Map<String, String> = emptyMap()
)

/**
 * Represents a device command
 */
sealed class DeviceCommand {
    data class PowerCommand(val on: Boolean) : DeviceCommand()
    data class BrightnessCommand(val brightness: Int) : DeviceCommand() // 0-100
    data class ColorCommand(val red: Int, val green: Int, val blue: Int) : DeviceCommand() // 0-255 each
    data class ColorTemperatureCommand(val temperature: Int) : DeviceCommand() // Kelvin
    data class SetTemperatureCommand(val temperature: Double) : DeviceCommand() // Celsius
    data class LockCommand(val locked: Boolean) : DeviceCommand()
    data class VolumeCommand(val volume: Int) : DeviceCommand() // 0-100
    data class MediaCommand(
        val action: MediaAction
    ) : DeviceCommand()
    data class PanTiltCommand(val pan: Int, val tilt: Int) : DeviceCommand() // Degrees
    data class CustomCommand(val command: String, val parameters: Map<String, Any>) : DeviceCommand()
    
    enum class MediaAction {
        PLAY, PAUSE, STOP, NEXT, PREVIOUS
    }
}

/**
 * Result of a device command execution
 */
data class DeviceCommandResult(
    val success: Boolean,
    val message: String,
    val deviceId: String,
    val commandType: String,
    val timestamp: Instant = Instant.now(),
    val errorCode: Int? = null
)

/**
 * Represents the current state of a device
 */
data class DeviceState(
    val deviceId: String,
    val timestamp: Instant,
    val properties: Map<String, Any>,
    val online: Boolean
)

/**
 * Represents a trigger for an automation rule
 */
sealed class Trigger {
    data class ScheduleTrigger(val cronExpression: String) : Trigger()
    data class StateTrigger(
        val deviceId: String, 
        val property: String, 
        val condition: StateCondition
    ) : Trigger()
    data class TimeTrigger(val time: String) : Trigger() // HH:MM format
    data class EventTrigger(val eventType: String) : Trigger()
    
    sealed class StateCondition {
        data class Equals(val value: Any) : StateCondition()
        data class GreaterThan(val value: Double) : StateCondition()
        data class LessThan(val value: Double) : StateCondition()
        data class Between(val min: Double, val max: Double) : StateCondition()
        data class Contains(val value: String) : StateCondition()
    }
}

/**
 * Represents an action for an automation rule
 */
sealed class Action {
    data class DeviceAction(val deviceId: String, val command: DeviceCommand) : Action()
    data class SceneAction(val sceneId: String) : Action()
    data class NotificationAction(val message: String) : Action()
    data class DelayAction(val delaySeconds: Int) : Action()
    data class ConditionalAction(
        val condition: Condition,
        val ifAction: Action,
        val elseAction: Action? = null
    ) : Action()
    
    sealed class Condition {
        data class DeviceCondition(
            val deviceId: String, 
            val property: String, 
            val condition: Trigger.StateCondition
        ) : Condition()
        data class TimeCondition(val startTime: String, val endTime: String) : Condition() // HH:MM format
        data class LogicalAnd(val conditions: List<Condition>) : Condition()
        data class LogicalOr(val conditions: List<Condition>) : Condition()
        data object LogicalNot : Condition()
    }
}

/**
 * Represents an automation rule
 */
@Serializable
data class AutomationRule(
    val id: String,
    val name: String,
    val enabled: Boolean,
    val triggers: List<String>, // Serialized Trigger objects
    val actions: List<String>,  // Serialized Action objects
    val conditions: List<String> = emptyList(), // Serialized Condition objects
    val createdAt: Long,
    val updatedAt: Long,
    val lastExecuted: Long? = null
)

/**
 * Result of a rule execution
 */
data class RuleExecutionResult(
    val success: Boolean,
    val message: String,
    val ruleId: String,
    val actionResults: List<ActionResult>,
    val timestamp: Instant = Instant.now()
) {
    data class ActionResult(
        val actionType: String,
        val success: Boolean,
        val message: String
    )
}

/**
 * Represents a scene (collection of device states)
 */
@Serializable
data class Scene(
    val id: String,
    val name: String,
    val deviceStates: Map<String, Map<String, String>>, // DeviceId -> (Property -> Value)
    val icon: String? = null,
    val favorite: Boolean = false,
    val createdAt: Long,
    val updatedAt: Long,
    val lastExecuted: Long? = null
)

/**
 * Result of a scene execution
 */
data class SceneExecutionResult(
    val success: Boolean,
    val message: String,
    val sceneId: String,
    val deviceResults: Map<String, Boolean>, // DeviceId -> Success
    val timestamp: Instant = Instant.now()
)


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


package com.sallie.core.device

import kotlinx.serialization.Serializable
import java.time.Instant

/**
 * Represents the protocol used to communicate with a device
 */
enum class DeviceProtocol {
    WIFI,
    BLUETOOTH,
    ZIGBEE,
    ZWAVE,
    MATTER,
    THREAD,
    INFRARED,
    UNKNOWN
}

/**
 * Represents the type of device
 */
enum class DeviceType {
    LIGHT,
    SWITCH,
    THERMOSTAT,
    LOCK,
    CAMERA,
    SENSOR,
    SPEAKER,
    DISPLAY,
    APPLIANCE,
    TV,
    FAN,
    OUTLET,
    CURTAIN,
    HUB,
    OTHER
}

/**
 * Represents the capabilities of a device
 */
enum class DeviceCapability {
    POWER,                // On/off
    BRIGHTNESS,           // Dimming
    COLOR,                // RGB color
    COLOR_TEMPERATURE,    // Warm/cool white
    TEMPERATURE_SENSOR,   // Read temperature
    TEMPERATURE_CONTROL,  // Set temperature
    HUMIDITY_SENSOR,      // Read humidity
    MOTION_SENSOR,        // Detect motion
    CONTACT_SENSOR,       // Open/closed
    LOCK,                 // Lock/unlock
    VOLUME,               // Adjust volume
    MEDIA_PLAYBACK,       // Play/pause/etc
    PAN_TILT,             // Camera movement
    BATTERY,              // Battery level
    ENERGY_MONITORING,    // Power consumption
    SCENE_ACTIVATION,     // Activate scenes
    WATER_SENSOR,         // Detect water
    SMOKE_SENSOR,         // Detect smoke
    AIR_QUALITY,          // Air quality monitoring
    UPDATABLE,            // Can receive firmware updates
    CUSTOM_COMMAND        // Custom commands
}

/**
 * Represents a physical or virtual device
 */
@Serializable
data class Device(
    val id: String,
    val name: String,
    val type: DeviceType,
    val protocol: DeviceProtocol,
    val manufacturer: String,
    val model: String,
    val firmware: String? = null,
    val capabilities: Set<DeviceCapability>,
    val room: String? = null,
    val online: Boolean = true,
    val metadata: Map<String, String> = emptyMap()
)

/**
 * Represents a device command
 */
sealed class DeviceCommand {
    data class PowerCommand(val on: Boolean) : DeviceCommand()
    data class BrightnessCommand(val brightness: Int) : DeviceCommand() // 0-100
    data class ColorCommand(val red: Int, val green: Int, val blue: Int) : DeviceCommand() // 0-255 each
    data class ColorTemperatureCommand(val temperature: Int) : DeviceCommand() // Kelvin
    data class SetTemperatureCommand(val temperature: Double) : DeviceCommand() // Celsius
    data class LockCommand(val locked: Boolean) : DeviceCommand()
    data class VolumeCommand(val volume: Int) : DeviceCommand() // 0-100
    data class MediaCommand(
        val action: MediaAction
    ) : DeviceCommand()
    data class PanTiltCommand(val pan: Int, val tilt: Int) : DeviceCommand() // Degrees
    data class CustomCommand(val command: String, val parameters: Map<String, Any>) : DeviceCommand()
    
    enum class MediaAction {
        PLAY, PAUSE, STOP, NEXT, PREVIOUS
    }
}

/**
 * Result of a device command execution
 */
data class DeviceCommandResult(
    val success: Boolean,
    val message: String,
    val deviceId: String,
    val commandType: String,
    val timestamp: Instant = Instant.now(),
    val errorCode: Int? = null
)

/**
 * Represents the current state of a device
 */
data class DeviceState(
    val deviceId: String,
    val timestamp: Instant,
    val properties: Map<String, Any>,
    val online: Boolean
)

/**
 * Represents a trigger for an automation rule
 */
sealed class Trigger {
    data class ScheduleTrigger(val cronExpression: String) : Trigger()
    data class StateTrigger(
        val deviceId: String, 
        val property: String, 
        val condition: StateCondition
    ) : Trigger()
    data class TimeTrigger(val time: String) : Trigger() // HH:MM format
    data class EventTrigger(val eventType: String) : Trigger()
    
    sealed class StateCondition {
        data class Equals(val value: Any) : StateCondition()
        data class GreaterThan(val value: Double) : StateCondition()
        data class LessThan(val value: Double) : StateCondition()
        data class Between(val min: Double, val max: Double) : StateCondition()
        data class Contains(val value: String) : StateCondition()
    }
}

/**
 * Represents an action for an automation rule
 */
sealed class Action {
    data class DeviceAction(val deviceId: String, val command: DeviceCommand) : Action()
    data class SceneAction(val sceneId: String) : Action()
    data class NotificationAction(val message: String) : Action()
    data class DelayAction(val delaySeconds: Int) : Action()
    data class ConditionalAction(
        val condition: Condition,
        val ifAction: Action,
        val elseAction: Action? = null
    ) : Action()
    
    sealed class Condition {
        data class DeviceCondition(
            val deviceId: String, 
            val property: String, 
            val condition: Trigger.StateCondition
        ) : Condition()
        data class TimeCondition(val startTime: String, val endTime: String) : Condition() // HH:MM format
        data class LogicalAnd(val conditions: List<Condition>) : Condition()
        data class LogicalOr(val conditions: List<Condition>) : Condition()
        data object LogicalNot : Condition()
    }
}

/**
 * Represents an automation rule
 */
@Serializable
data class AutomationRule(
    val id: String,
    val name: String,
    val enabled: Boolean,
    val triggers: List<String>, // Serialized Trigger objects
    val actions: List<String>,  // Serialized Action objects
    val conditions: List<String> = emptyList(), // Serialized Condition objects
    val createdAt: Long,
    val updatedAt: Long,
    val lastExecuted: Long? = null
)

/**
 * Result of a rule execution
 */
data class RuleExecutionResult(
    val success: Boolean,
    val message: String,
    val ruleId: String,
    val actionResults: List<ActionResult>,
    val timestamp: Instant = Instant.now()
) {
    data class ActionResult(
        val actionType: String,
        val success: Boolean,
        val message: String
    )
}

/**
 * Represents a scene (collection of device states)
 */
@Serializable
data class Scene(
    val id: String,
    val name: String,
    val deviceStates: Map<String, Map<String, String>>, // DeviceId -> (Property -> Value)
    val icon: String? = null,
    val favorite: Boolean = false,
    val createdAt: Long,
    val updatedAt: Long,
    val lastExecuted: Long? = null
)

/**
 * Result of a scene execution
 */
data class SceneExecutionResult(
    val success: Boolean,
    val message: String,
    val sceneId: String,
    val deviceResults: Map<String, Boolean>, // DeviceId -> Success
    val timestamp: Instant = Instant.now()
)


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

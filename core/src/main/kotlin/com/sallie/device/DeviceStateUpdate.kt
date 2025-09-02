/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * Device State Update Model for Device Control Integration
 */

package com.sallie.device

/**
 * Represents a device state update for automation rules
 */
data class DeviceStateUpdate(
    val deviceId: String,
    val property: String,
    val value: Any,
    val previousValue: Any?,
    val timestamp: Long = System.currentTimeMillis()
)

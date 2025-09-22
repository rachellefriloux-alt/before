/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * Mock Device Data Provider
 */

package com.sallie.device.test

import com.sallie.device.DeviceProtocol
import com.sallie.device.DeviceType
import com.sallie.device.SmartDevice
import java.util.UUID
import kotlin.random.Random

/**
 * Provider class for mock device data to use in tests
 */
object MockDeviceDataProvider {
    
    /**
     * Create a mock light device
     */
    fun createMockLight(
        id: String = "light-${UUID.randomUUID()}",
        name: String = "Mock Light",
        protocol: DeviceProtocol = DeviceProtocol.WIFI
    ): SmartDevice {
        return SmartDevice(
            id = id,
            name = name,
            manufacturer = "Mock Manufacturer",
            model = "Smart Light v1",
            type = DeviceType.LIGHT,
            protocol = protocol,
            capabilities = listOf("power", "brightness", "color"),
            state = mapOf(
                "power" to false,
                "brightness" to 50,
                "color" to "#FFFFFF"
            ),
            firmwareVersion = "1.0.0",
            ipAddress = if (protocol == DeviceProtocol.WIFI) "192.168.1.${Random.nextInt(2, 254)}" else null,
            macAddress = generateRandomMacAddress(),
            lastConnected = System.currentTimeMillis()
        )
    }
    
    /**
     * Create a mock thermostat device
     */
    fun createMockThermostat(
        id: String = "therm-${UUID.randomUUID()}",
        name: String = "Mock Thermostat",
        protocol: DeviceProtocol = DeviceProtocol.WIFI
    ): SmartDevice {
        return SmartDevice(
            id = id,
            name = name,
            manufacturer = "Mock Manufacturer",
            model = "Smart Thermostat v1",
            type = DeviceType.THERMOSTAT,
            protocol = protocol,
            capabilities = listOf("power", "targetTemperature", "mode"),
            state = mapOf(
                "power" to true,
                "targetTemperature" to 72,
                "currentTemperature" to 70,
                "mode" to "cool"
            ),
            firmwareVersion = "1.0.0",
            ipAddress = if (protocol == DeviceProtocol.WIFI) "192.168.1.${Random.nextInt(2, 254)}" else null,
            macAddress = generateRandomMacAddress(),
            lastConnected = System.currentTimeMillis()
        )
    }
    
    /**
     * Create a mock lock device
     */
    fun createMockLock(
        id: String = "lock-${UUID.randomUUID()}",
        name: String = "Mock Lock",
        protocol: DeviceProtocol = DeviceProtocol.ZWAVE
    ): SmartDevice {
        return SmartDevice(
            id = id,
            name = name,
            manufacturer = "Mock Manufacturer",
            model = "Smart Lock v1",
            type = DeviceType.LOCK,
            protocol = protocol,
            capabilities = listOf("locked", "batteryLevel"),
            state = mapOf(
                "locked" to true,
                "batteryLevel" to 80
            ),
            firmwareVersion = "1.0.0",
            ipAddress = null,
            macAddress = generateRandomMacAddress(),
            lastConnected = System.currentTimeMillis()
        )
    }
    
    /**
     * Create a mock camera device
     */
    fun createMockCamera(
        id: String = "cam-${UUID.randomUUID()}",
        name: String = "Mock Camera",
        protocol: DeviceProtocol = DeviceProtocol.WIFI
    ): SmartDevice {
        return SmartDevice(
            id = id,
            name = name,
            manufacturer = "Mock Manufacturer",
            model = "Smart Camera v1",
            type = DeviceType.CAMERA,
            protocol = protocol,
            capabilities = listOf("power", "record", "motionDetection"),
            state = mapOf(
                "power" to true,
                "record" to false,
                "motionDetection" to true,
                "streamUrl" to "http://192.168.1.${Random.nextInt(2, 254)}:8080/video"
            ),
            firmwareVersion = "1.0.0",
            ipAddress = if (protocol == DeviceProtocol.WIFI) "192.168.1.${Random.nextInt(2, 254)}" else null,
            macAddress = generateRandomMacAddress(),
            lastConnected = System.currentTimeMillis()
        )
    }
    
    /**
     * Create a collection of mock devices of different types
     */
    fun createMockDeviceCollection(count: Int = 10): List<SmartDevice> {
        val devices = mutableListOf<SmartDevice>()
        
        repeat(count) { index ->
            val device = when (index % 5) {
                0 -> createMockLight(name = "Light ${index / 5 + 1}")
                1 -> createMockThermostat(name = "Thermostat ${index / 5 + 1}")
                2 -> createMockLock(name = "Lock ${index / 5 + 1}")
                3 -> createMockCamera(name = "Camera ${index / 5 + 1}")
                else -> createMockLight(
                    name = "Special Light ${index / 5 + 1}",
                    protocol = DeviceProtocol.ZIGBEE
                )
            }
            devices.add(device)
        }
        
        return devices
    }
    
    /**
     * Generate a random MAC address
     */
    private fun generateRandomMacAddress(): String {
        val bytes = ByteArray(6)
        Random.nextBytes(bytes)
        return bytes.joinToString(":") { byte -> "%02X".format(byte) }
    }
}

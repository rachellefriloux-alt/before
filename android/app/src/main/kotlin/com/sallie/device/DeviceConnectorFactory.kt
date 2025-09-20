/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * Device Connector Factory for Device Control Integration
 */

package com.sallie.device

/**
 * Factory for creating device connectors based on protocol
 */
object DeviceConnectorFactory {
    
    /**
     * Get a connector for the specified protocol
     */
    fun getConnector(protocol: DeviceProtocol): DeviceConnector? {
        return when (protocol) {
            DeviceProtocol.WIFI -> WiFiDeviceConnector()
            DeviceProtocol.BLUETOOTH -> BluetoothDeviceConnector()
            DeviceProtocol.ZIGBEE -> ZigBeeDeviceConnector()
            DeviceProtocol.ZWAVE -> ZWaveDeviceConnector()
            DeviceProtocol.THREAD -> null // Not implemented yet
            DeviceProtocol.MATTER -> null // Not implemented yet
            DeviceProtocol.PROPRIETARY -> null // Not implemented yet
        }
    }
    
    /**
     * Get all available connectors
     */
    fun getAllConnectors(): Map<DeviceProtocol, DeviceConnector> {
        return mapOf(
            DeviceProtocol.WIFI to WiFiDeviceConnector(),
            DeviceProtocol.BLUETOOTH to BluetoothDeviceConnector(),
            DeviceProtocol.ZIGBEE to ZigBeeDeviceConnector(),
            DeviceProtocol.ZWAVE to ZWaveDeviceConnector()
        )
    }
}

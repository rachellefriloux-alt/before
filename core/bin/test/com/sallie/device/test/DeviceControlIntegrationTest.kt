/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * Device Control Integration Test
 */

package com.sallie.device.test

import com.sallie.core.PluginRegistry
import com.sallie.core.ValuesSystem
import com.sallie.device.DeviceConnectorFactory
import com.sallie.device.DeviceControlState
import com.sallie.device.DeviceEventType
import com.sallie.device.DeviceOperationResult
import com.sallie.device.DeviceProtocol
import com.sallie.device.EnhancedDeviceControlSystem
import com.sallie.device.SmartDevice
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withTimeout
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import kotlin.time.Duration.Companion.seconds

/**
 * Integration test for the Device Control System
 */
class DeviceControlIntegrationTest {
    
    private lateinit var pluginRegistry: PluginRegistry
    private lateinit var valuesSystem: ValuesSystem
    private lateinit var deviceControlSystem: EnhancedDeviceControlSystem
    private lateinit var discoveredDevices: List<SmartDevice>
    
    @Before
    fun setUp() {
        // Create mocks
        pluginRegistry = mock()
        valuesSystem = mock()
        
        // Setup valuesSystem to accept all actions by default
        whenever(valuesSystem.evaluateAction(any(), any())).thenReturn(
            ValuesSystem.EvaluationResult(true, null)
        )
        
        // Create the device control system
        deviceControlSystem = EnhancedDeviceControlSystem(pluginRegistry, valuesSystem)
        
        // Initialize the system
        runBlocking {
            deviceControlSystem.initialize()
        }
    }
    
    @Test
    fun testSystemInitialization() {
        assertEquals(DeviceControlState.IDLE, deviceControlSystem.systemState.value)
    }
    
    @Test
    fun testDeviceDiscovery() = runBlocking {
        // Discover WiFi and Bluetooth devices
        discoveredDevices = deviceControlSystem.discoverDevices(
            setOf(DeviceProtocol.WIFI, DeviceProtocol.BLUETOOTH),
            5000
        )
        
        // Verify we found devices
        assertTrue("Should discover devices", discoveredDevices.isNotEmpty())
        
        // Verify devices are added to registry
        val allDevices = deviceControlSystem.getAllDevices()
        assertTrue("Registry should contain all discovered devices", allDevices.containsAll(discoveredDevices))
    }
    
    @Test
    fun testDeviceControl() = runBlocking {
        // First discover devices
        val devices = deviceControlSystem.discoverDevices(
            setOf(DeviceProtocol.WIFI),
            5000
        )
        
        // Get a light device to control
        val lightDevice = devices.firstOrNull { it.type == DeviceType.LIGHT }
        assertNotNull("Should find a light device", lightDevice)
        
        if (lightDevice != null) {
            // Control the light (turn it on)
            val result = deviceControlSystem.controlDevice(lightDevice.id, "power", true)
            
            // Verify the operation was successful
            assertTrue("Device control operation should succeed", result is DeviceOperationResult.Success)
            
            // Query the device state
            val state = deviceControlSystem.queryDeviceState(lightDevice.id)
            assertNotNull("Should get device state", state)
            
            // Verify the state was updated
            assertEquals("Light should be on", true, state?.get("power"))
        }
    }
    
    @Test
    fun testDeviceGroup() = runBlocking {
        // First discover devices
        val devices = deviceControlSystem.discoverDevices(
            setOf(DeviceProtocol.WIFI, DeviceProtocol.BLUETOOTH),
            5000
        )
        
        // Create a device group
        val deviceIds = devices.take(3).map { it.id }
        val groupId = deviceControlSystem.createDeviceGroup("Test Group", deviceIds)
        
        // Verify group was created
        assertNotNull("Group should be created", groupId)
        
        // Get the group
        val group = deviceControlSystem.getDeviceGroup(groupId!!)
        assertNotNull("Should retrieve the group", group)
        assertEquals("Group should have correct name", "Test Group", group?.name)
        assertEquals("Group should have correct devices", deviceIds.size, group?.deviceIds?.size)
    }
    
    @Test
    fun testAutomationEngine() = runBlocking {
        // Get automation engine
        val automationEngine = deviceControlSystem.getAutomationEngine()
        
        // Create default rules and scenes
        automationEngine.createDefaultRules()
        
        // Verify rules were created
        val rules = automationEngine.rules.value
        assertTrue("Should create rules", rules.isNotEmpty())
        
        // Verify scenes were created
        val scenes = automationEngine.scenes.value
        assertTrue("Should create scenes", scenes.isNotEmpty())
    }
    
    @Test
    fun testExecuteScene() = runBlocking {
        // Get automation engine
        val automationEngine = deviceControlSystem.getAutomationEngine()
        
        // Create default rules and scenes
        automationEngine.createDefaultRules()
        
        // Get a scene
        val scene = automationEngine.scenes.value.firstOrNull()
        assertNotNull("Should have a scene", scene)
        
        if (scene != null) {
            // Execute the scene
            val result = deviceControlSystem.executeScene(scene.id)
            
            // Verify scene execution
            assertTrue("Scene should execute successfully", result)
        }
    }
    
    @Test
    fun testSystemShutdown() = runBlocking {
        // Shut down the system
        deviceControlSystem.shutdown()
        
        // Verify the system state
        assertEquals(DeviceControlState.DISABLED, deviceControlSystem.systemState.value)
    }
}

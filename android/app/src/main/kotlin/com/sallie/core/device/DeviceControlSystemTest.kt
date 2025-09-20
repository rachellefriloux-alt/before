package com.sallie.core.device

import com.sallie.core.PluginRegistry
import com.sallie.core.values.ValuesSystem
import io.mockk.coEvery
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

@ExperimentalCoroutinesApi
class DeviceControlSystemTest {

    private lateinit var deviceControlSystem: DeviceControlSystemInterface
    private lateinit var valuesSystem: ValuesSystem
    private lateinit var wifiConnector: DeviceConnector
    private lateinit var bluetoothConnector: DeviceConnector
    private lateinit var zigbeeConnector: DeviceConnector
    private lateinit var zwaveConnector: DeviceConnector
    
    private val testDevice1 = Device(
        id = "light-1",
        name = "Living Room Light",
        type = DeviceType.LIGHT,
        manufacturer = "Test Manufacturer",
        model = "Test Light",
        protocol = DeviceProtocol.WIFI,
        capabilities = setOf(
            DeviceCapability.POWER,
            DeviceCapability.BRIGHTNESS
        ),
        state = DeviceState(
            powerState = PowerState(isOn = true),
            brightnessState = BrightnessState(level = 75)
        )
    )
    
    private val testDevice2 = Device(
        id = "thermostat-1",
        name = "Living Room Thermostat",
        type = DeviceType.THERMOSTAT,
        manufacturer = "Test Manufacturer",
        model = "Test Thermostat",
        protocol = DeviceProtocol.ZIGBEE,
        capabilities = setOf(
            DeviceCapability.POWER,
            DeviceCapability.TEMPERATURE
        ),
        state = DeviceState(
            powerState = PowerState(isOn = true),
            temperatureState = TemperatureState(
                currentTemperature = 22.5,
                targetTemperature = 21.0,
                mode = ThermostatMode.AUTO
            )
        )
    )
    
    @Before
    fun setup() {
        // Mock the values system
        valuesSystem = mockk(relaxed = true)
        
        // Mock device connectors
        wifiConnector = mockk<DeviceConnector>()
        bluetoothConnector = mockk<DeviceConnector>()
        zigbeeConnector = mockk<DeviceConnector>()
        zwaveConnector = mockk<DeviceConnector>()
        
        // Set up connector behavior
        every { wifiConnector.protocol } returns DeviceProtocol.WIFI
        every { bluetoothConnector.protocol } returns DeviceProtocol.BLUETOOTH
        every { zigbeeConnector.protocol } returns DeviceProtocol.ZIGBEE
        every { zwaveConnector.protocol } returns DeviceProtocol.ZWAVE
        
        // Create the device control system with test dispatcher
        deviceControlSystem = EnhancedDeviceControlSystem(
            scope = kotlinx.coroutines.CoroutineScope(UnconfinedTestDispatcher()),
            valuesSystem = valuesSystem,
            testConnectors = listOf(
                wifiConnector,
                bluetoothConnector,
                zigbeeConnector,
                zwaveConnector
            )
        )
    }
    
    @Test
    fun `test initialize sets up connectors`() = runTest {
        // Mock connector initialization
        coEvery { wifiConnector.initialize() } returns Unit
        coEvery { bluetoothConnector.initialize() } returns Unit
        coEvery { zigbeeConnector.initialize() } returns Unit
        coEvery { zwaveConnector.initialize() } returns Unit
        
        // Initialize the system
        deviceControlSystem.initialize()
        
        // Assert that all connectors were initialized
        coEvery { wifiConnector.initialize() }
        coEvery { bluetoothConnector.initialize() }
        coEvery { zigbeeConnector.initialize() }
        coEvery { zwaveConnector.initialize() }
    }
    
    @Test
    fun `test device discovery`() = runTest {
        // Mock device discovery
        coEvery { wifiConnector.discoverDevices() } returns flowOf(testDevice1)
        coEvery { zigbeeConnector.discoverDevices() } returns flowOf(testDevice2)
        coEvery { bluetoothConnector.discoverDevices() } returns flowOf()
        coEvery { zwaveConnector.discoverDevices() } returns flowOf()
        
        // Discover devices
        val devices = deviceControlSystem.discoverDevices().first()
        
        // Assert the discovered devices
        assertEquals(1, devices.size)
        assertEquals(testDevice1.id, devices[0].id)
        
        // Assert that all connectors were used for discovery
        coEvery { wifiConnector.discoverDevices() }
        coEvery { bluetoothConnector.discoverDevices() }
        coEvery { zigbeeConnector.discoverDevices() }
        coEvery { zwaveConnector.discoverDevices() }
    }
    
    @Test
    fun `test get devices returns known devices`() = runBlocking {
        // Add some test devices to the system
        addTestDevicesToSystem()
        
        // Get devices
        val devices = deviceControlSystem.getDevices()
        
        // Assert the devices
        assertEquals(2, devices.size)
        assertTrue(devices.any { it.id == testDevice1.id })
        assertTrue(devices.any { it.id == testDevice2.id })
    }
    
    @Test
    fun `test get device by ID`() = runBlocking {
        // Add some test devices to the system
        addTestDevicesToSystem()
        
        // Get a specific device
        val device = deviceControlSystem.getDevice(testDevice1.id)
        
        // Assert the device
        assertNotNull(device)
        assertEquals(testDevice1.id, device?.id)
        assertEquals(testDevice1.name, device?.name)
    }
    
    @Test
    fun `test get devices by name`() = runBlocking {
        // Add some test devices to the system
        addTestDevicesToSystem()
        
        // Get devices by name
        val devices = deviceControlSystem.getDevicesByName("Living Room")
        
        // Assert the devices
        assertEquals(2, devices.size)
        assertTrue(devices.any { it.id == testDevice1.id })
        assertTrue(devices.any { it.id == testDevice2.id })
    }
    
    @Test
    fun `test execute command sends command to appropriate connector`() = runBlocking {
        // Add some test devices to the system
        addTestDevicesToSystem()
        
        // Prepare mock response
        val commandSlot = slot<DeviceCommand>()
        every { 
            wifiConnector.executeCommand(testDevice1.id, capture(commandSlot)) 
        } returns DeviceCommandResult(true, "Command executed successfully")
        
        // Execute a command
        val command = DeviceCommand.PowerCommand(false)
        val result = deviceControlSystem.executeCommand(testDevice1.id, command)
        
        // Assert the result
        assertTrue(result.success)
        assertEquals("Command executed successfully", result.message)
        
        // Assert the captured command
        assertEquals(command, commandSlot.captured)
    }
    
    @Test
    fun `test execute scene`() = runBlocking {
        // Add some test devices to the system
        addTestDevicesToSystem()
        
        // Create a test scene
        val scene = Scene(
            id = "scene-1",
            name = "Movie Night",
            deviceStates = mapOf(
                testDevice1.id to DeviceState(
                    powerState = PowerState(isOn = true),
                    brightnessState = BrightnessState(level = 30)
                ),
                testDevice2.id to DeviceState(
                    powerState = PowerState(isOn = true),
                    temperatureState = TemperatureState(
                        currentTemperature = 22.5,
                        targetTemperature = 22.0,
                        mode = ThermostatMode.AUTO
                    )
                )
            )
        )
        
        // Add the scene to the system
        (deviceControlSystem as EnhancedDeviceControlSystem).addScene(scene)
        
        // Prepare mock responses for command execution
        every { 
            wifiConnector.executeCommand(eq(testDevice1.id), any()) 
        } returns DeviceCommandResult(true, "Command executed successfully")
        
        every { 
            zigbeeConnector.executeCommand(eq(testDevice2.id), any()) 
        } returns DeviceCommandResult(true, "Command executed successfully")
        
        // Execute the scene
        val result = deviceControlSystem.executeScene(scene.id)
        
        // Assert the result
        assertTrue(result.success)
        assertTrue(result.message.contains("successfully"))
    }
    
    @Test
    fun `test automation rules`() = runBlocking {
        // Add some test devices to the system
        addTestDevicesToSystem()
        
        // Create a test rule
        val rule = AutomationRule(
            id = "rule-1",
            name = "Light On When Hot",
            enabled = true,
            triggerType = TriggerType.DEVICE_STATE,
            triggerParams = mapOf(
                "deviceId" to testDevice2.id,
                "propertyPath" to "temperatureState.currentTemperature",
                "operator" to "greaterThan",
                "value" to "23.0"
            ),
            actions = listOf(
                Action(
                    actionType = ActionType.DEVICE_COMMAND,
                    actionParams = mapOf(
                        "deviceId" to testDevice1.id,
                        "commandType" to "power",
                        "commandParams" to mapOf("isOn" to "true")
                    )
                )
            )
        )
        
        // Add the rule to the system
        (deviceControlSystem as EnhancedDeviceControlSystem).addRule(rule)
        
        // Get rules
        val rules = deviceControlSystem.getRules()
        
        // Assert the rules
        assertEquals(1, rules.size)
        assertEquals(rule.id, rules[0].id)
        
        // Prepare mock for command execution
        every { 
            wifiConnector.executeCommand(eq(testDevice1.id), any()) 
        } returns DeviceCommandResult(true, "Command executed successfully")
        
        // Trigger the rule
        val result = deviceControlSystem.triggerRule(rule.id)
        
        // Assert the result
        assertTrue(result.success)
    }
    
    @Test
    fun `test device control facade`() = runTest {
        // Mock PluginRegistry
        val pluginRegistry = mockk<PluginRegistry>(relaxed = true)
        
        // Create the facade with test dispatcher
        val facade = DeviceControlFacade.getInstance(
            pluginRegistry,
            valuesSystem,
            kotlinx.coroutines.CoroutineScope(UnconfinedTestDispatcher())
        )
        
        // Add test devices
        addTestDevicesToSystem()
        
        // Test getDevices through facade
        var resultCapture: DeviceControlFacade.DeviceOperationResult? = null
        facade.getDevices { result ->
            resultCapture = result
        }
        
        // Assert the result
        assertNotNull(resultCapture)
        assertTrue(resultCapture!!.success)
        assertNotNull(resultCapture!!.data)
        
        @Suppress("UNCHECKED_CAST")
        val devices = resultCapture!!.data as List<Device>
        assertEquals(2, devices.size)
    }
    
    /**
     * Helper method to add test devices to the system
     */
    private suspend fun addTestDevicesToSystem() {
        // Mock device discovery
        coEvery { wifiConnector.discoverDevices() } returns flowOf(testDevice1)
        coEvery { zigbeeConnector.discoverDevices() } returns flowOf(testDevice2)
        coEvery { bluetoothConnector.discoverDevices() } returns flowOf()
        coEvery { zwaveConnector.discoverDevices() } returns flowOf()
        
        // Discover devices to add them to the system
        deviceControlSystem.discoverDevices().first()
        
        // Set connector for each device
        every { wifiConnector.getDeviceById(testDevice1.id) } returns testDevice1
        every { zigbeeConnector.getDeviceById(testDevice2.id) } returns testDevice2
    }
}

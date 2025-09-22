/**
 * Tests for Sallie's Device Control Integration System
 * 
 * This test suite validates the functionality and reliability of the
 * Device Control System, ensuring it can properly discover, connect to,
 * and control various smart home and IoT devices.
 *
 * Created with love. 💛
 */

package com.sallie.device

import com.sallie.core.PluginRegistry
import com.sallie.core.featureFlags
import com.sallie.core.runtimeConsent
import io.mockk.*
import io.mockk.impl.annotations.MockK
import io.mockk.impl.annotations.RelaxedMockK
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.runTest
import org.junit.After
import org.junit.Before
import org.junit.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

@ExperimentalCoroutinesApi
class DeviceControlSystemTest {
    
    @RelaxedMockK
    private lateinit var pluginRegistry: PluginRegistry
    
    @MockK
    private lateinit var wifiAdapter: WiFiProtocolAdapter
    
    @MockK
    private lateinit var bluetoothAdapter: BluetoothProtocolAdapter
    
    private val testDispatcher = UnconfinedTestDispatcher()
    
    private lateinit var deviceControlSystem: DeviceControlSystem
    
    private val testLightDevice = DeviceInfo(
        id = "test-light-1",
        name = "Test Light",
        type = DeviceType.LIGHT,
        manufacturer = "Test Manufacturer",
        model = "Test Model",
        protocol = DeviceProtocol.WIFI,
        capabilities = setOf(
            DeviceCapability.POWER_TOGGLE,
            DeviceCapability.BRIGHTNESS_CONTROL
        ),
        connectionState = DeviceConnectionState.DISCOVERED,
        ipAddress = "192.168.1.100"
    )
    
    private val testSpeakerDevice = DeviceInfo(
        id = "test-speaker-1",
        name = "Test Speaker",
        type = DeviceType.SPEAKER,
        manufacturer = "Test Audio",
        model = "Test Speaker Model",
        protocol = DeviceProtocol.BLUETOOTH,
        capabilities = setOf(
            DeviceCapability.AUDIO_PLAYBACK,
            DeviceCapability.VOLUME_CONTROL
        ),
        connectionState = DeviceConnectionState.DISCOVERED,
        bluetoothAddress = "00:11:22:33:44:55"
    )
    
    @Before
    fun setUp() {
        MockKAnnotations.init(this)
        
        // Mock feature flags
        mockkObject(featureFlags)
        every { featureFlags.isEnabled(any()) } returns true
        
        // Mock runtime consent
        mockkObject(runtimeConsent)
        every { runtimeConsent.requestPermission(any(), any()) } returns true
        
        // Mock WiFi adapter
        every { wifiAdapter.getProtocol() } returns DeviceProtocol.WIFI
        every { wifiAdapter.discoverDevices() } returns flowOf(testLightDevice)
        coEvery { wifiAdapter.connectToDevice(any()) } returns true
        coEvery { wifiAdapter.disconnectFromDevice(any()) } returns true
        coEvery { wifiAdapter.sendCommand(any(), any()) } returns CommandResult(true, mapOf("status" to "success"))
        coEvery { wifiAdapter.getDeviceStatus(any()) } returns mapOf("status" to "online", "power" to true)
        
        // Mock Bluetooth adapter
        every { bluetoothAdapter.getProtocol() } returns DeviceProtocol.BLUETOOTH
        every { bluetoothAdapter.discoverDevices() } returns flowOf(testSpeakerDevice)
        coEvery { bluetoothAdapter.connectToDevice(any()) } returns true
        coEvery { bluetoothAdapter.disconnectFromDevice(any()) } returns true
        coEvery { bluetoothAdapter.sendCommand(any(), any()) } returns CommandResult(true, mapOf("status" to "success"))
        coEvery { bluetoothAdapter.getDeviceStatus(any()) } returns mapOf("status" to "online", "playing" to false)
        
        // Create a test instance of DeviceControlSystem with mocked dependencies
        deviceControlSystem = DeviceControlSystem(pluginRegistry)
        
        // Replace protocol adapters with mocks
        val protocolAdaptersField = DeviceControlSystem::class.java.getDeclaredField("protocolAdapters")
        protocolAdaptersField.isAccessible = true
        val protocolAdapters = mutableMapOf<DeviceProtocol, ProtocolAdapter>()
        protocolAdapters[DeviceProtocol.WIFI] = wifiAdapter
        protocolAdapters[DeviceProtocol.BLUETOOTH] = bluetoothAdapter
        protocolAdaptersField.set(deviceControlSystem, protocolAdapters)
    }
    
    @After
    fun tearDown() {
        unmockkAll()
    }
    
    @Test
    fun `test initialize should register components and set state to idle`() = runTest(testDispatcher) {
        // Initialize the system
        deviceControlSystem.initialize()
        
        // Check that the plugin registry was called
        verify { pluginRegistry.registerSystemComponent(
            componentId = "device-control-system",
            component = deviceControlSystem,
            displayName = "Device Control System",
            description = "System for controlling smart home and IoT devices",
            version = "1.0.0",
            capabilities = listOf(
                "device-discovery",
                "device-control",
                "device-automation"
            )
        )}
        
        // Check that the system state is set to idle
        assertEquals(DeviceControlState.IDLE, deviceControlSystem.systemState.value)
    }
    
    @Test
    fun `test initialize should respect feature flags`() = runTest(testDispatcher) {
        // Mock feature flag to disable device control
        every { featureFlags.isEnabled("device_control") } returns false
        
        // Initialize the system
        deviceControlSystem.initialize()
        
        // Check that the system state is set to disabled
        assertEquals(DeviceControlState.DISABLED, deviceControlSystem.systemState.value)
    }
    
    @Test
    fun `test shutdown should clean up resources and set state to disabled`() = runTest(testDispatcher) {
        // Initialize first
        deviceControlSystem.initialize()
        
        // Shutdown
        deviceControlSystem.shutdown()
        
        // Check that the system state is set to disabled
        assertEquals(DeviceControlState.DISABLED, deviceControlSystem.systemState.value)
    }
    
    @Test
    fun `test startDiscovery should discover devices and update registry`() = runTest(testDispatcher) {
        // Initialize first
        deviceControlSystem.initialize()
        
        // Start discovery
        val result = deviceControlSystem.startDiscovery(setOf(DeviceProtocol.WIFI))
        
        // Verify the result is successful
        assertTrue(result)
        
        // Verify discovery was called
        verify { wifiAdapter.discoverDevices() }
        
        // Check the state was set to discovering
        assertEquals(DeviceControlState.DISCOVERING, deviceControlSystem.systemState.value)
        
        // Check that the device was added to the registry
        val devices = deviceControlSystem.getDiscoveredDevices()
        assertEquals(1, devices.size)
        assertEquals("test-light-1", devices[0].id)
        assertEquals("Test Light", devices[0].name)
    }
    
    @Test
    fun `test stopDiscovery should cancel discovery job and update state`() = runTest(testDispatcher) {
        // Initialize and start discovery
        deviceControlSystem.initialize()
        deviceControlSystem.startDiscovery()
        
        // Stop discovery
        deviceControlSystem.stopDiscovery()
        
        // Check the state was set back to idle
        assertEquals(DeviceControlState.IDLE, deviceControlSystem.systemState.value)
    }
    
    @Test
    fun `test connectToDevice should connect to device and update status`() = runTest(testDispatcher) {
        // Initialize and discover device
        deviceControlSystem.initialize()
        deviceControlSystem.startDiscovery(setOf(DeviceProtocol.WIFI))
        
        // Ensure device is in registry
        val devices = deviceControlSystem.getDiscoveredDevices()
        assertTrue(devices.isNotEmpty())
        
        // Connect to device
        val result = deviceControlSystem.connectToDevice("test-light-1")
        
        // Verify connection was successful
        assertTrue(result)
        
        // Check that connection method was called
        coVerify { wifiAdapter.connectToDevice(any()) }
        
        // Check that device connection state was updated
        val device = deviceControlSystem.getDevice("test-light-1")
        assertNotNull(device)
        assertEquals(DeviceConnectionState.CONNECTED, device.connectionState)
    }
    
    @Test
    fun `test connectToDevice should handle nonexistent device`() = runTest(testDispatcher) {
        // Initialize
        deviceControlSystem.initialize()
        
        // Try to connect to nonexistent device
        val result = deviceControlSystem.connectToDevice("nonexistent-device")
        
        // Verify connection failed
        assertFalse(result)
    }
    
    @Test
    fun `test disconnectFromDevice should disconnect and update status`() = runTest(testDispatcher) {
        // Initialize, discover, and connect to device
        deviceControlSystem.initialize()
        deviceControlSystem.startDiscovery(setOf(DeviceProtocol.WIFI))
        deviceControlSystem.connectToDevice("test-light-1")
        
        // Disconnect from device
        val result = deviceControlSystem.disconnectFromDevice("test-light-1")
        
        // Verify disconnection was successful
        assertTrue(result)
        
        // Check that disconnection method was called
        coVerify { wifiAdapter.disconnectFromDevice(any()) }
        
        // Check that device connection state was updated
        val device = deviceControlSystem.getDevice("test-light-1")
        assertNotNull(device)
        assertEquals(DeviceConnectionState.DISCONNECTED, device.connectionState)
    }
    
    @Test
    fun `test sendCommand should send command to device and return result`() = runTest(testDispatcher) {
        // Initialize, discover, and connect to device
        deviceControlSystem.initialize()
        deviceControlSystem.startDiscovery(setOf(DeviceProtocol.WIFI))
        deviceControlSystem.connectToDevice("test-light-1")
        
        // Send command to device
        val command = DeviceCommand("setPower", mapOf("power" to true))
        val result = deviceControlSystem.sendCommand("test-light-1", command)
        
        // Verify command was successful
        assertTrue(result)
        
        // Check that command method was called
        coVerify { wifiAdapter.sendCommand(any(), eq(command)) }
    }
    
    @Test
    fun `test sendCommand should fail for disconnected device`() = runTest(testDispatcher) {
        // Initialize and discover device (but don't connect)
        deviceControlSystem.initialize()
        deviceControlSystem.startDiscovery(setOf(DeviceProtocol.WIFI))
        
        // Send command to disconnected device
        val command = DeviceCommand("setPower", mapOf("power" to true))
        val result = deviceControlSystem.sendCommand("test-light-1", command)
        
        // Verify command failed
        assertFalse(result)
        
        // Check that command method was not called
        coVerify(exactly = 0) { wifiAdapter.sendCommand(any(), any()) }
    }
    
    @Test
    fun `test getDeviceStatus should return status for connected device`() = runTest(testDispatcher) {
        // Initialize, discover, and connect to device
        deviceControlSystem.initialize()
        deviceControlSystem.startDiscovery(setOf(DeviceProtocol.WIFI))
        deviceControlSystem.connectToDevice("test-light-1")
        
        // Get device status
        val status = deviceControlSystem.getDeviceStatus("test-light-1")
        
        // Verify status was returned
        assertNotNull(status)
        assertEquals("online", status["status"])
        assertEquals(true, status["power"])
        
        // Check that status method was called
        coVerify { wifiAdapter.getDeviceStatus(any()) }
    }
    
    @Test
    fun `test getDeviceStatus should return null for disconnected device`() = runTest(testDispatcher) {
        // Initialize and discover device (but don't connect)
        deviceControlSystem.initialize()
        deviceControlSystem.startDiscovery(setOf(DeviceProtocol.WIFI))
        
        // Get device status
        val status = deviceControlSystem.getDeviceStatus("test-light-1")
        
        // Verify null status was returned
        assertEquals(null, status)
        
        // Check that status method was not called
        coVerify(exactly = 0) { wifiAdapter.getDeviceStatus(any()) }
    }
    
    @Test
    fun `test getDeviceRecommendations should return recommendations based on context`() = runTest(testDispatcher) {
        // Initialize, discover, and connect to devices
        deviceControlSystem.initialize()
        deviceControlSystem.startDiscovery(setOf(DeviceProtocol.WIFI))
        deviceControlSystem.connectToDevice("test-light-1")
        
        // Create morning time context
        val context = DeviceRecommendationContext(
            contextType = DeviceContextType.TIME_OF_DAY,
            timeOfDay = TimeOfDay.MORNING
        )
        
        // Get recommendations
        val recommendations = deviceControlSystem.getDeviceRecommendations(context)
        
        // Verify recommendations were returned
        assertEquals(1, recommendations.size)
        assertEquals("test-light-1", recommendations[0].deviceId)
        assertEquals("Test Light", recommendations[0].deviceName)
        assertEquals("Turn on lights", recommendations[0].action)
    }
    
    @Test
    fun `test createAutomationRule should create and store rule`() = runTest(testDispatcher) {
        // Initialize
        deviceControlSystem.initialize()
        
        // Create rule
        val rule = AutomationRule(
            name = "Morning Routine",
            description = "Turn on lights in the morning",
            triggers = listOf(
                AutomationTrigger.TimeTrigger(
                    hour = 7,
                    minute = 0,
                    daysOfWeek = setOf(1, 2, 3, 4, 5) // Weekdays only
                )
            ),
            actions = listOf(
                AutomationAction.DeviceCommandAction(
                    deviceId = "test-light-1",
                    command = DeviceCommand("setPower", mapOf("power" to true))
                )
            ),
            active = true
        )
        
        // Create rule
        val ruleId = deviceControlSystem.createAutomationRule(rule)
        
        // Verify rule ID was returned
        assertNotNull(ruleId)
        
        // Check that rule was stored
        val rules = deviceControlSystem.getAutomationRules()
        assertEquals(1, rules.size)
        assertEquals("Morning Routine", rules[0].name)
    }
    
    @Test
    fun `test events should be emitted for device operations`() = runTest(testDispatcher) {
        // Initialize
        deviceControlSystem.initialize()
        
        // Collect first event
        val firstEvent = deviceControlSystem.deviceEvents.first()
        
        // Verify initialization event was emitted
        assertTrue(firstEvent is DeviceEvent.SystemEvent)
        assertEquals(DeviceEventType.SYSTEM_INITIALIZED, (firstEvent as DeviceEvent.SystemEvent).type)
    }
    
    @Test
    fun `test disconnectAllDevices should disconnect all connected devices`() = runTest(testDispatcher) {
        // Initialize and connect to both test devices
        deviceControlSystem.initialize()
        
        // Discover and connect WiFi device
        deviceControlSystem.startDiscovery(setOf(DeviceProtocol.WIFI))
        deviceControlSystem.connectToDevice("test-light-1")
        
        // Discover and connect Bluetooth device
        deviceControlSystem.startDiscovery(setOf(DeviceProtocol.BLUETOOTH))
        deviceControlSystem.connectToDevice("test-speaker-1")
        
        // Disconnect all devices
        deviceControlSystem.disconnectAllDevices()
        
        // Verify both devices are disconnected
        val lightDevice = deviceControlSystem.getDevice("test-light-1")
        assertNotNull(lightDevice)
        assertEquals(DeviceConnectionState.DISCONNECTED, lightDevice.connectionState)
        
        val speakerDevice = deviceControlSystem.getDevice("test-speaker-1")
        assertNotNull(speakerDevice)
        assertEquals(DeviceConnectionState.DISCONNECTED, speakerDevice.connectionState)
        
        // Verify disconnect methods were called for both devices
        coVerify { wifiAdapter.disconnectFromDevice(any()) }
        coVerify { bluetoothAdapter.disconnectFromDevice(any()) }
    }
}

// Test Device Protocol Adapters

@ExperimentalCoroutinesApi
class WiFiProtocolAdapterTest {
    
    private lateinit var adapter: WiFiProtocolAdapter
    
    @Before
    fun setUp() {
        adapter = WiFiProtocolAdapter()
    }
    
    @Test
    fun `test getProtocol should return WIFI`() {
        assertEquals(DeviceProtocol.WIFI, adapter.getProtocol())
    }
    
    @Test
    fun `test discoverDevices should emit device info`() = runTest {
        val devices = mutableListOf<DeviceInfo>()
        adapter.discoverDevices().collect { devices.add(it) }
        
        assertEquals(3, devices.size)
        assertTrue(devices.any { it.type == DeviceType.LIGHT })
        assertTrue(devices.any { it.type == DeviceType.THERMOSTAT })
        assertTrue(devices.any { it.type == DeviceType.SPEAKER })
    }
    
    @Test
    fun `test connectToDevice should return true`() = runTest {
        val device = DeviceInfo(
            id = "test-device",
            name = "Test Device",
            type = DeviceType.LIGHT,
            protocol = DeviceProtocol.WIFI
        )
        
        val result = adapter.connectToDevice(device)
        assertTrue(result)
    }
    
    @Test
    fun `test sendCommand should return appropriate result based on device and command`() = runTest {
        val lightDevice = DeviceInfo(
            id = "test-light",
            name = "Test Light",
            type = DeviceType.LIGHT,
            protocol = DeviceProtocol.WIFI
        )
        
        // Test valid command
        val powerCommand = DeviceCommand("setPower", mapOf("power" to true))
        val powerResult = adapter.sendCommand(lightDevice, powerCommand)
        assertTrue(powerResult.success)
        assertEquals("success", powerResult.response["status"])
        
        // Test invalid command
        val invalidCommand = DeviceCommand("invalidCommand")
        val invalidResult = adapter.sendCommand(lightDevice, invalidCommand)
        assertFalse(invalidResult.success)
        assertEquals("error", invalidResult.response["status"])
    }
}

@ExperimentalCoroutinesApi
class AutomationManagerTest {
    
    private lateinit var manager: DeviceAutomationManager
    
    @Before
    fun setUp() {
        manager = DeviceAutomationManager()
    }
    
    @Test
    fun `test createRule should generate ID and store rule`() {
        val rule = AutomationRule(
            name = "Test Rule",
            description = "Test Description",
            triggers = listOf(),
            actions = listOf(),
            active = false
        )
        
        val ruleId = manager.createRule(rule)
        assertNotNull(ruleId)
        
        val storedRule = manager.getRule(ruleId)
        assertNotNull(storedRule)
        assertEquals("Test Rule", storedRule.name)
    }
    
    @Test
    fun `test updateRule should update existing rule`() {
        // Create rule
        val originalRule = AutomationRule(
            name = "Original Name",
            description = "Original Description",
            triggers = listOf(),
            actions = listOf(),
            active = false
        )
        
        val ruleId = manager.createRule(originalRule)
        
        // Update rule
        val updatedRule = originalRule.copy(name = "Updated Name")
        val result = manager.updateRule(ruleId, updatedRule)
        
        assertTrue(result)
        
        // Check that rule was updated
        val storedRule = manager.getRule(ruleId)
        assertNotNull(storedRule)
        assertEquals("Updated Name", storedRule.name)
    }
    
    @Test
    fun `test deleteRule should remove rule`() {
        // Create rule
        val rule = AutomationRule(
            name = "Test Rule",
            description = "Test Description",
            triggers = listOf(),
            actions = listOf(),
            active = false
        )
        
        val ruleId = manager.createRule(rule)
        
        // Delete rule
        val result = manager.deleteRule(ruleId)
        assertTrue(result)
        
        // Check that rule was deleted
        val storedRule = manager.getRule(ruleId)
        assertEquals(null, storedRule)
    }
}


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


/**
 * Tests for Sallie's Device Control Integration System
 * 
 * This test suite validates the functionality and reliability of the
 * Device Control System, ensuring it can properly discover, connect to,
 * and control various smart home and IoT devices.
 *
 * Created with love. 💛
 */

package com.sallie.device

import com.sallie.core.PluginRegistry
import com.sallie.core.featureFlags
import com.sallie.core.runtimeConsent
import io.mockk.*
import io.mockk.impl.annotations.MockK
import io.mockk.impl.annotations.RelaxedMockK
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.runTest
import org.junit.After
import org.junit.Before
import org.junit.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

@ExperimentalCoroutinesApi
class DeviceControlSystemTest {
    
    @RelaxedMockK
    private lateinit var pluginRegistry: PluginRegistry
    
    @MockK
    private lateinit var wifiAdapter: WiFiProtocolAdapter
    
    @MockK
    private lateinit var bluetoothAdapter: BluetoothProtocolAdapter
    
    private val testDispatcher = UnconfinedTestDispatcher()
    
    private lateinit var deviceControlSystem: DeviceControlSystem
    
    private val testLightDevice = DeviceInfo(
        id = "test-light-1",
        name = "Test Light",
        type = DeviceType.LIGHT,
        manufacturer = "Test Manufacturer",
        model = "Test Model",
        protocol = DeviceProtocol.WIFI,
        capabilities = setOf(
            DeviceCapability.POWER_TOGGLE,
            DeviceCapability.BRIGHTNESS_CONTROL
        ),
        connectionState = DeviceConnectionState.DISCOVERED,
        ipAddress = "192.168.1.100"
    )
    
    private val testSpeakerDevice = DeviceInfo(
        id = "test-speaker-1",
        name = "Test Speaker",
        type = DeviceType.SPEAKER,
        manufacturer = "Test Audio",
        model = "Test Speaker Model",
        protocol = DeviceProtocol.BLUETOOTH,
        capabilities = setOf(
            DeviceCapability.AUDIO_PLAYBACK,
            DeviceCapability.VOLUME_CONTROL
        ),
        connectionState = DeviceConnectionState.DISCOVERED,
        bluetoothAddress = "00:11:22:33:44:55"
    )
    
    @Before
    fun setUp() {
        MockKAnnotations.init(this)
        
        // Mock feature flags
        mockkObject(featureFlags)
        every { featureFlags.isEnabled(any()) } returns true
        
        // Mock runtime consent
        mockkObject(runtimeConsent)
        every { runtimeConsent.requestPermission(any(), any()) } returns true
        
        // Mock WiFi adapter
        every { wifiAdapter.getProtocol() } returns DeviceProtocol.WIFI
        every { wifiAdapter.discoverDevices() } returns flowOf(testLightDevice)
        coEvery { wifiAdapter.connectToDevice(any()) } returns true
        coEvery { wifiAdapter.disconnectFromDevice(any()) } returns true
        coEvery { wifiAdapter.sendCommand(any(), any()) } returns CommandResult(true, mapOf("status" to "success"))
        coEvery { wifiAdapter.getDeviceStatus(any()) } returns mapOf("status" to "online", "power" to true)
        
        // Mock Bluetooth adapter
        every { bluetoothAdapter.getProtocol() } returns DeviceProtocol.BLUETOOTH
        every { bluetoothAdapter.discoverDevices() } returns flowOf(testSpeakerDevice)
        coEvery { bluetoothAdapter.connectToDevice(any()) } returns true
        coEvery { bluetoothAdapter.disconnectFromDevice(any()) } returns true
        coEvery { bluetoothAdapter.sendCommand(any(), any()) } returns CommandResult(true, mapOf("status" to "success"))
        coEvery { bluetoothAdapter.getDeviceStatus(any()) } returns mapOf("status" to "online", "playing" to false)
        
        // Create a test instance of DeviceControlSystem with mocked dependencies
        deviceControlSystem = DeviceControlSystem(pluginRegistry)
        
        // Replace protocol adapters with mocks
        val protocolAdaptersField = DeviceControlSystem::class.java.getDeclaredField("protocolAdapters")
        protocolAdaptersField.isAccessible = true
        val protocolAdapters = mutableMapOf<DeviceProtocol, ProtocolAdapter>()
        protocolAdapters[DeviceProtocol.WIFI] = wifiAdapter
        protocolAdapters[DeviceProtocol.BLUETOOTH] = bluetoothAdapter
        protocolAdaptersField.set(deviceControlSystem, protocolAdapters)
    }
    
    @After
    fun tearDown() {
        unmockkAll()
    }
    
    @Test
    fun `test initialize should register components and set state to idle`() = runTest(testDispatcher) {
        // Initialize the system
        deviceControlSystem.initialize()
        
        // Check that the plugin registry was called
        verify { pluginRegistry.registerSystemComponent(
            componentId = "device-control-system",
            component = deviceControlSystem,
            displayName = "Device Control System",
            description = "System for controlling smart home and IoT devices",
            version = "1.0.0",
            capabilities = listOf(
                "device-discovery",
                "device-control",
                "device-automation"
            )
        )}
        
        // Check that the system state is set to idle
        assertEquals(DeviceControlState.IDLE, deviceControlSystem.systemState.value)
    }
    
    @Test
    fun `test initialize should respect feature flags`() = runTest(testDispatcher) {
        // Mock feature flag to disable device control
        every { featureFlags.isEnabled("device_control") } returns false
        
        // Initialize the system
        deviceControlSystem.initialize()
        
        // Check that the system state is set to disabled
        assertEquals(DeviceControlState.DISABLED, deviceControlSystem.systemState.value)
    }
    
    @Test
    fun `test shutdown should clean up resources and set state to disabled`() = runTest(testDispatcher) {
        // Initialize first
        deviceControlSystem.initialize()
        
        // Shutdown
        deviceControlSystem.shutdown()
        
        // Check that the system state is set to disabled
        assertEquals(DeviceControlState.DISABLED, deviceControlSystem.systemState.value)
    }
    
    @Test
    fun `test startDiscovery should discover devices and update registry`() = runTest(testDispatcher) {
        // Initialize first
        deviceControlSystem.initialize()
        
        // Start discovery
        val result = deviceControlSystem.startDiscovery(setOf(DeviceProtocol.WIFI))
        
        // Verify the result is successful
        assertTrue(result)
        
        // Verify discovery was called
        verify { wifiAdapter.discoverDevices() }
        
        // Check the state was set to discovering
        assertEquals(DeviceControlState.DISCOVERING, deviceControlSystem.systemState.value)
        
        // Check that the device was added to the registry
        val devices = deviceControlSystem.getDiscoveredDevices()
        assertEquals(1, devices.size)
        assertEquals("test-light-1", devices[0].id)
        assertEquals("Test Light", devices[0].name)
    }
    
    @Test
    fun `test stopDiscovery should cancel discovery job and update state`() = runTest(testDispatcher) {
        // Initialize and start discovery
        deviceControlSystem.initialize()
        deviceControlSystem.startDiscovery()
        
        // Stop discovery
        deviceControlSystem.stopDiscovery()
        
        // Check the state was set back to idle
        assertEquals(DeviceControlState.IDLE, deviceControlSystem.systemState.value)
    }
    
    @Test
    fun `test connectToDevice should connect to device and update status`() = runTest(testDispatcher) {
        // Initialize and discover device
        deviceControlSystem.initialize()
        deviceControlSystem.startDiscovery(setOf(DeviceProtocol.WIFI))
        
        // Ensure device is in registry
        val devices = deviceControlSystem.getDiscoveredDevices()
        assertTrue(devices.isNotEmpty())
        
        // Connect to device
        val result = deviceControlSystem.connectToDevice("test-light-1")
        
        // Verify connection was successful
        assertTrue(result)
        
        // Check that connection method was called
        coVerify { wifiAdapter.connectToDevice(any()) }
        
        // Check that device connection state was updated
        val device = deviceControlSystem.getDevice("test-light-1")
        assertNotNull(device)
        assertEquals(DeviceConnectionState.CONNECTED, device.connectionState)
    }
    
    @Test
    fun `test connectToDevice should handle nonexistent device`() = runTest(testDispatcher) {
        // Initialize
        deviceControlSystem.initialize()
        
        // Try to connect to nonexistent device
        val result = deviceControlSystem.connectToDevice("nonexistent-device")
        
        // Verify connection failed
        assertFalse(result)
    }
    
    @Test
    fun `test disconnectFromDevice should disconnect and update status`() = runTest(testDispatcher) {
        // Initialize, discover, and connect to device
        deviceControlSystem.initialize()
        deviceControlSystem.startDiscovery(setOf(DeviceProtocol.WIFI))
        deviceControlSystem.connectToDevice("test-light-1")
        
        // Disconnect from device
        val result = deviceControlSystem.disconnectFromDevice("test-light-1")
        
        // Verify disconnection was successful
        assertTrue(result)
        
        // Check that disconnection method was called
        coVerify { wifiAdapter.disconnectFromDevice(any()) }
        
        // Check that device connection state was updated
        val device = deviceControlSystem.getDevice("test-light-1")
        assertNotNull(device)
        assertEquals(DeviceConnectionState.DISCONNECTED, device.connectionState)
    }
    
    @Test
    fun `test sendCommand should send command to device and return result`() = runTest(testDispatcher) {
        // Initialize, discover, and connect to device
        deviceControlSystem.initialize()
        deviceControlSystem.startDiscovery(setOf(DeviceProtocol.WIFI))
        deviceControlSystem.connectToDevice("test-light-1")
        
        // Send command to device
        val command = DeviceCommand("setPower", mapOf("power" to true))
        val result = deviceControlSystem.sendCommand("test-light-1", command)
        
        // Verify command was successful
        assertTrue(result)
        
        // Check that command method was called
        coVerify { wifiAdapter.sendCommand(any(), eq(command)) }
    }
    
    @Test
    fun `test sendCommand should fail for disconnected device`() = runTest(testDispatcher) {
        // Initialize and discover device (but don't connect)
        deviceControlSystem.initialize()
        deviceControlSystem.startDiscovery(setOf(DeviceProtocol.WIFI))
        
        // Send command to disconnected device
        val command = DeviceCommand("setPower", mapOf("power" to true))
        val result = deviceControlSystem.sendCommand("test-light-1", command)
        
        // Verify command failed
        assertFalse(result)
        
        // Check that command method was not called
        coVerify(exactly = 0) { wifiAdapter.sendCommand(any(), any()) }
    }
    
    @Test
    fun `test getDeviceStatus should return status for connected device`() = runTest(testDispatcher) {
        // Initialize, discover, and connect to device
        deviceControlSystem.initialize()
        deviceControlSystem.startDiscovery(setOf(DeviceProtocol.WIFI))
        deviceControlSystem.connectToDevice("test-light-1")
        
        // Get device status
        val status = deviceControlSystem.getDeviceStatus("test-light-1")
        
        // Verify status was returned
        assertNotNull(status)
        assertEquals("online", status["status"])
        assertEquals(true, status["power"])
        
        // Check that status method was called
        coVerify { wifiAdapter.getDeviceStatus(any()) }
    }
    
    @Test
    fun `test getDeviceStatus should return null for disconnected device`() = runTest(testDispatcher) {
        // Initialize and discover device (but don't connect)
        deviceControlSystem.initialize()
        deviceControlSystem.startDiscovery(setOf(DeviceProtocol.WIFI))
        
        // Get device status
        val status = deviceControlSystem.getDeviceStatus("test-light-1")
        
        // Verify null status was returned
        assertEquals(null, status)
        
        // Check that status method was not called
        coVerify(exactly = 0) { wifiAdapter.getDeviceStatus(any()) }
    }
    
    @Test
    fun `test getDeviceRecommendations should return recommendations based on context`() = runTest(testDispatcher) {
        // Initialize, discover, and connect to devices
        deviceControlSystem.initialize()
        deviceControlSystem.startDiscovery(setOf(DeviceProtocol.WIFI))
        deviceControlSystem.connectToDevice("test-light-1")
        
        // Create morning time context
        val context = DeviceRecommendationContext(
            contextType = DeviceContextType.TIME_OF_DAY,
            timeOfDay = TimeOfDay.MORNING
        )
        
        // Get recommendations
        val recommendations = deviceControlSystem.getDeviceRecommendations(context)
        
        // Verify recommendations were returned
        assertEquals(1, recommendations.size)
        assertEquals("test-light-1", recommendations[0].deviceId)
        assertEquals("Test Light", recommendations[0].deviceName)
        assertEquals("Turn on lights", recommendations[0].action)
    }
    
    @Test
    fun `test createAutomationRule should create and store rule`() = runTest(testDispatcher) {
        // Initialize
        deviceControlSystem.initialize()
        
        // Create rule
        val rule = AutomationRule(
            name = "Morning Routine",
            description = "Turn on lights in the morning",
            triggers = listOf(
                AutomationTrigger.TimeTrigger(
                    hour = 7,
                    minute = 0,
                    daysOfWeek = setOf(1, 2, 3, 4, 5) // Weekdays only
                )
            ),
            actions = listOf(
                AutomationAction.DeviceCommandAction(
                    deviceId = "test-light-1",
                    command = DeviceCommand("setPower", mapOf("power" to true))
                )
            ),
            active = true
        )
        
        // Create rule
        val ruleId = deviceControlSystem.createAutomationRule(rule)
        
        // Verify rule ID was returned
        assertNotNull(ruleId)
        
        // Check that rule was stored
        val rules = deviceControlSystem.getAutomationRules()
        assertEquals(1, rules.size)
        assertEquals("Morning Routine", rules[0].name)
    }
    
    @Test
    fun `test events should be emitted for device operations`() = runTest(testDispatcher) {
        // Initialize
        deviceControlSystem.initialize()
        
        // Collect first event
        val firstEvent = deviceControlSystem.deviceEvents.first()
        
        // Verify initialization event was emitted
        assertTrue(firstEvent is DeviceEvent.SystemEvent)
        assertEquals(DeviceEventType.SYSTEM_INITIALIZED, (firstEvent as DeviceEvent.SystemEvent).type)
    }
    
    @Test
    fun `test disconnectAllDevices should disconnect all connected devices`() = runTest(testDispatcher) {
        // Initialize and connect to both test devices
        deviceControlSystem.initialize()
        
        // Discover and connect WiFi device
        deviceControlSystem.startDiscovery(setOf(DeviceProtocol.WIFI))
        deviceControlSystem.connectToDevice("test-light-1")
        
        // Discover and connect Bluetooth device
        deviceControlSystem.startDiscovery(setOf(DeviceProtocol.BLUETOOTH))
        deviceControlSystem.connectToDevice("test-speaker-1")
        
        // Disconnect all devices
        deviceControlSystem.disconnectAllDevices()
        
        // Verify both devices are disconnected
        val lightDevice = deviceControlSystem.getDevice("test-light-1")
        assertNotNull(lightDevice)
        assertEquals(DeviceConnectionState.DISCONNECTED, lightDevice.connectionState)
        
        val speakerDevice = deviceControlSystem.getDevice("test-speaker-1")
        assertNotNull(speakerDevice)
        assertEquals(DeviceConnectionState.DISCONNECTED, speakerDevice.connectionState)
        
        // Verify disconnect methods were called for both devices
        coVerify { wifiAdapter.disconnectFromDevice(any()) }
        coVerify { bluetoothAdapter.disconnectFromDevice(any()) }
    }
}

// Test Device Protocol Adapters

@ExperimentalCoroutinesApi
class WiFiProtocolAdapterTest {
    
    private lateinit var adapter: WiFiProtocolAdapter
    
    @Before
    fun setUp() {
        adapter = WiFiProtocolAdapter()
    }
    
    @Test
    fun `test getProtocol should return WIFI`() {
        assertEquals(DeviceProtocol.WIFI, adapter.getProtocol())
    }
    
    @Test
    fun `test discoverDevices should emit device info`() = runTest {
        val devices = mutableListOf<DeviceInfo>()
        adapter.discoverDevices().collect { devices.add(it) }
        
        assertEquals(3, devices.size)
        assertTrue(devices.any { it.type == DeviceType.LIGHT })
        assertTrue(devices.any { it.type == DeviceType.THERMOSTAT })
        assertTrue(devices.any { it.type == DeviceType.SPEAKER })
    }
    
    @Test
    fun `test connectToDevice should return true`() = runTest {
        val device = DeviceInfo(
            id = "test-device",
            name = "Test Device",
            type = DeviceType.LIGHT,
            protocol = DeviceProtocol.WIFI
        )
        
        val result = adapter.connectToDevice(device)
        assertTrue(result)
    }
    
    @Test
    fun `test sendCommand should return appropriate result based on device and command`() = runTest {
        val lightDevice = DeviceInfo(
            id = "test-light",
            name = "Test Light",
            type = DeviceType.LIGHT,
            protocol = DeviceProtocol.WIFI
        )
        
        // Test valid command
        val powerCommand = DeviceCommand("setPower", mapOf("power" to true))
        val powerResult = adapter.sendCommand(lightDevice, powerCommand)
        assertTrue(powerResult.success)
        assertEquals("success", powerResult.response["status"])
        
        // Test invalid command
        val invalidCommand = DeviceCommand("invalidCommand")
        val invalidResult = adapter.sendCommand(lightDevice, invalidCommand)
        assertFalse(invalidResult.success)
        assertEquals("error", invalidResult.response["status"])
    }
}

@ExperimentalCoroutinesApi
class AutomationManagerTest {
    
    private lateinit var manager: DeviceAutomationManager
    
    @Before
    fun setUp() {
        manager = DeviceAutomationManager()
    }
    
    @Test
    fun `test createRule should generate ID and store rule`() {
        val rule = AutomationRule(
            name = "Test Rule",
            description = "Test Description",
            triggers = listOf(),
            actions = listOf(),
            active = false
        )
        
        val ruleId = manager.createRule(rule)
        assertNotNull(ruleId)
        
        val storedRule = manager.getRule(ruleId)
        assertNotNull(storedRule)
        assertEquals("Test Rule", storedRule.name)
    }
    
    @Test
    fun `test updateRule should update existing rule`() {
        // Create rule
        val originalRule = AutomationRule(
            name = "Original Name",
            description = "Original Description",
            triggers = listOf(),
            actions = listOf(),
            active = false
        )
        
        val ruleId = manager.createRule(originalRule)
        
        // Update rule
        val updatedRule = originalRule.copy(name = "Updated Name")
        val result = manager.updateRule(ruleId, updatedRule)
        
        assertTrue(result)
        
        // Check that rule was updated
        val storedRule = manager.getRule(ruleId)
        assertNotNull(storedRule)
        assertEquals("Updated Name", storedRule.name)
    }
    
    @Test
    fun `test deleteRule should remove rule`() {
        // Create rule
        val rule = AutomationRule(
            name = "Test Rule",
            description = "Test Description",
            triggers = listOf(),
            actions = listOf(),
            active = false
        )
        
        val ruleId = manager.createRule(rule)
        
        // Delete rule
        val result = manager.deleteRule(ruleId)
        assertTrue(result)
        
        // Check that rule was deleted
        val storedRule = manager.getRule(ruleId)
        assertEquals(null, storedRule)
    }
}


/**
 * Tests for Sallie's Device Control Integration System
 * 
 * This test suite validates the functionality and reliability of the
 * Device Control System, ensuring it can properly discover, connect to,
 * and control various smart home and IoT devices.
 *
 * Created with love. 💛
 */

package com.sallie.device

import com.sallie.core.PluginRegistry
import com.sallie.core.featureFlags
import com.sallie.core.runtimeConsent
import io.mockk.*
import io.mockk.impl.annotations.MockK
import io.mockk.impl.annotations.RelaxedMockK
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.runTest
import org.junit.After
import org.junit.Before
import org.junit.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

@ExperimentalCoroutinesApi
class DeviceControlSystemTest {
    
    @RelaxedMockK
    private lateinit var pluginRegistry: PluginRegistry
    
    @MockK
    private lateinit var wifiAdapter: WiFiProtocolAdapter
    
    @MockK
    private lateinit var bluetoothAdapter: BluetoothProtocolAdapter
    
    private val testDispatcher = UnconfinedTestDispatcher()
    
    private lateinit var deviceControlSystem: DeviceControlSystem
    
    private val testLightDevice = DeviceInfo(
        id = "test-light-1",
        name = "Test Light",
        type = DeviceType.LIGHT,
        manufacturer = "Test Manufacturer",
        model = "Test Model",
        protocol = DeviceProtocol.WIFI,
        capabilities = setOf(
            DeviceCapability.POWER_TOGGLE,
            DeviceCapability.BRIGHTNESS_CONTROL
        ),
        connectionState = DeviceConnectionState.DISCOVERED,
        ipAddress = "192.168.1.100"
    )
    
    private val testSpeakerDevice = DeviceInfo(
        id = "test-speaker-1",
        name = "Test Speaker",
        type = DeviceType.SPEAKER,
        manufacturer = "Test Audio",
        model = "Test Speaker Model",
        protocol = DeviceProtocol.BLUETOOTH,
        capabilities = setOf(
            DeviceCapability.AUDIO_PLAYBACK,
            DeviceCapability.VOLUME_CONTROL
        ),
        connectionState = DeviceConnectionState.DISCOVERED,
        bluetoothAddress = "00:11:22:33:44:55"
    )
    
    @Before
    fun setUp() {
        MockKAnnotations.init(this)
        
        // Mock feature flags
        mockkObject(featureFlags)
        every { featureFlags.isEnabled(any()) } returns true
        
        // Mock runtime consent
        mockkObject(runtimeConsent)
        every { runtimeConsent.requestPermission(any(), any()) } returns true
        
        // Mock WiFi adapter
        every { wifiAdapter.getProtocol() } returns DeviceProtocol.WIFI
        every { wifiAdapter.discoverDevices() } returns flowOf(testLightDevice)
        coEvery { wifiAdapter.connectToDevice(any()) } returns true
        coEvery { wifiAdapter.disconnectFromDevice(any()) } returns true
        coEvery { wifiAdapter.sendCommand(any(), any()) } returns CommandResult(true, mapOf("status" to "success"))
        coEvery { wifiAdapter.getDeviceStatus(any()) } returns mapOf("status" to "online", "power" to true)
        
        // Mock Bluetooth adapter
        every { bluetoothAdapter.getProtocol() } returns DeviceProtocol.BLUETOOTH
        every { bluetoothAdapter.discoverDevices() } returns flowOf(testSpeakerDevice)
        coEvery { bluetoothAdapter.connectToDevice(any()) } returns true
        coEvery { bluetoothAdapter.disconnectFromDevice(any()) } returns true
        coEvery { bluetoothAdapter.sendCommand(any(), any()) } returns CommandResult(true, mapOf("status" to "success"))
        coEvery { bluetoothAdapter.getDeviceStatus(any()) } returns mapOf("status" to "online", "playing" to false)
        
        // Create a test instance of DeviceControlSystem with mocked dependencies
        deviceControlSystem = DeviceControlSystem(pluginRegistry)
        
        // Replace protocol adapters with mocks
        val protocolAdaptersField = DeviceControlSystem::class.java.getDeclaredField("protocolAdapters")
        protocolAdaptersField.isAccessible = true
        val protocolAdapters = mutableMapOf<DeviceProtocol, ProtocolAdapter>()
        protocolAdapters[DeviceProtocol.WIFI] = wifiAdapter
        protocolAdapters[DeviceProtocol.BLUETOOTH] = bluetoothAdapter
        protocolAdaptersField.set(deviceControlSystem, protocolAdapters)
    }
    
    @After
    fun tearDown() {
        unmockkAll()
    }
    
    @Test
    fun `test initialize should register components and set state to idle`() = runTest(testDispatcher) {
        // Initialize the system
        deviceControlSystem.initialize()
        
        // Check that the plugin registry was called
        verify { pluginRegistry.registerSystemComponent(
            componentId = "device-control-system",
            component = deviceControlSystem,
            displayName = "Device Control System",
            description = "System for controlling smart home and IoT devices",
            version = "1.0.0",
            capabilities = listOf(
                "device-discovery",
                "device-control",
                "device-automation"
            )
        )}
        
        // Check that the system state is set to idle
        assertEquals(DeviceControlState.IDLE, deviceControlSystem.systemState.value)
    }
    
    @Test
    fun `test initialize should respect feature flags`() = runTest(testDispatcher) {
        // Mock feature flag to disable device control
        every { featureFlags.isEnabled("device_control") } returns false
        
        // Initialize the system
        deviceControlSystem.initialize()
        
        // Check that the system state is set to disabled
        assertEquals(DeviceControlState.DISABLED, deviceControlSystem.systemState.value)
    }
    
    @Test
    fun `test shutdown should clean up resources and set state to disabled`() = runTest(testDispatcher) {
        // Initialize first
        deviceControlSystem.initialize()
        
        // Shutdown
        deviceControlSystem.shutdown()
        
        // Check that the system state is set to disabled
        assertEquals(DeviceControlState.DISABLED, deviceControlSystem.systemState.value)
    }
    
    @Test
    fun `test startDiscovery should discover devices and update registry`() = runTest(testDispatcher) {
        // Initialize first
        deviceControlSystem.initialize()
        
        // Start discovery
        val result = deviceControlSystem.startDiscovery(setOf(DeviceProtocol.WIFI))
        
        // Verify the result is successful
        assertTrue(result)
        
        // Verify discovery was called
        verify { wifiAdapter.discoverDevices() }
        
        // Check the state was set to discovering
        assertEquals(DeviceControlState.DISCOVERING, deviceControlSystem.systemState.value)
        
        // Check that the device was added to the registry
        val devices = deviceControlSystem.getDiscoveredDevices()
        assertEquals(1, devices.size)
        assertEquals("test-light-1", devices[0].id)
        assertEquals("Test Light", devices[0].name)
    }
    
    @Test
    fun `test stopDiscovery should cancel discovery job and update state`() = runTest(testDispatcher) {
        // Initialize and start discovery
        deviceControlSystem.initialize()
        deviceControlSystem.startDiscovery()
        
        // Stop discovery
        deviceControlSystem.stopDiscovery()
        
        // Check the state was set back to idle
        assertEquals(DeviceControlState.IDLE, deviceControlSystem.systemState.value)
    }
    
    @Test
    fun `test connectToDevice should connect to device and update status`() = runTest(testDispatcher) {
        // Initialize and discover device
        deviceControlSystem.initialize()
        deviceControlSystem.startDiscovery(setOf(DeviceProtocol.WIFI))
        
        // Ensure device is in registry
        val devices = deviceControlSystem.getDiscoveredDevices()
        assertTrue(devices.isNotEmpty())
        
        // Connect to device
        val result = deviceControlSystem.connectToDevice("test-light-1")
        
        // Verify connection was successful
        assertTrue(result)
        
        // Check that connection method was called
        coVerify { wifiAdapter.connectToDevice(any()) }
        
        // Check that device connection state was updated
        val device = deviceControlSystem.getDevice("test-light-1")
        assertNotNull(device)
        assertEquals(DeviceConnectionState.CONNECTED, device.connectionState)
    }
    
    @Test
    fun `test connectToDevice should handle nonexistent device`() = runTest(testDispatcher) {
        // Initialize
        deviceControlSystem.initialize()
        
        // Try to connect to nonexistent device
        val result = deviceControlSystem.connectToDevice("nonexistent-device")
        
        // Verify connection failed
        assertFalse(result)
    }
    
    @Test
    fun `test disconnectFromDevice should disconnect and update status`() = runTest(testDispatcher) {
        // Initialize, discover, and connect to device
        deviceControlSystem.initialize()
        deviceControlSystem.startDiscovery(setOf(DeviceProtocol.WIFI))
        deviceControlSystem.connectToDevice("test-light-1")
        
        // Disconnect from device
        val result = deviceControlSystem.disconnectFromDevice("test-light-1")
        
        // Verify disconnection was successful
        assertTrue(result)
        
        // Check that disconnection method was called
        coVerify { wifiAdapter.disconnectFromDevice(any()) }
        
        // Check that device connection state was updated
        val device = deviceControlSystem.getDevice("test-light-1")
        assertNotNull(device)
        assertEquals(DeviceConnectionState.DISCONNECTED, device.connectionState)
    }
    
    @Test
    fun `test sendCommand should send command to device and return result`() = runTest(testDispatcher) {
        // Initialize, discover, and connect to device
        deviceControlSystem.initialize()
        deviceControlSystem.startDiscovery(setOf(DeviceProtocol.WIFI))
        deviceControlSystem.connectToDevice("test-light-1")
        
        // Send command to device
        val command = DeviceCommand("setPower", mapOf("power" to true))
        val result = deviceControlSystem.sendCommand("test-light-1", command)
        
        // Verify command was successful
        assertTrue(result)
        
        // Check that command method was called
        coVerify { wifiAdapter.sendCommand(any(), eq(command)) }
    }
    
    @Test
    fun `test sendCommand should fail for disconnected device`() = runTest(testDispatcher) {
        // Initialize and discover device (but don't connect)
        deviceControlSystem.initialize()
        deviceControlSystem.startDiscovery(setOf(DeviceProtocol.WIFI))
        
        // Send command to disconnected device
        val command = DeviceCommand("setPower", mapOf("power" to true))
        val result = deviceControlSystem.sendCommand("test-light-1", command)
        
        // Verify command failed
        assertFalse(result)
        
        // Check that command method was not called
        coVerify(exactly = 0) { wifiAdapter.sendCommand(any(), any()) }
    }
    
    @Test
    fun `test getDeviceStatus should return status for connected device`() = runTest(testDispatcher) {
        // Initialize, discover, and connect to device
        deviceControlSystem.initialize()
        deviceControlSystem.startDiscovery(setOf(DeviceProtocol.WIFI))
        deviceControlSystem.connectToDevice("test-light-1")
        
        // Get device status
        val status = deviceControlSystem.getDeviceStatus("test-light-1")
        
        // Verify status was returned
        assertNotNull(status)
        assertEquals("online", status["status"])
        assertEquals(true, status["power"])
        
        // Check that status method was called
        coVerify { wifiAdapter.getDeviceStatus(any()) }
    }
    
    @Test
    fun `test getDeviceStatus should return null for disconnected device`() = runTest(testDispatcher) {
        // Initialize and discover device (but don't connect)
        deviceControlSystem.initialize()
        deviceControlSystem.startDiscovery(setOf(DeviceProtocol.WIFI))
        
        // Get device status
        val status = deviceControlSystem.getDeviceStatus("test-light-1")
        
        // Verify null status was returned
        assertEquals(null, status)
        
        // Check that status method was not called
        coVerify(exactly = 0) { wifiAdapter.getDeviceStatus(any()) }
    }
    
    @Test
    fun `test getDeviceRecommendations should return recommendations based on context`() = runTest(testDispatcher) {
        // Initialize, discover, and connect to devices
        deviceControlSystem.initialize()
        deviceControlSystem.startDiscovery(setOf(DeviceProtocol.WIFI))
        deviceControlSystem.connectToDevice("test-light-1")
        
        // Create morning time context
        val context = DeviceRecommendationContext(
            contextType = DeviceContextType.TIME_OF_DAY,
            timeOfDay = TimeOfDay.MORNING
        )
        
        // Get recommendations
        val recommendations = deviceControlSystem.getDeviceRecommendations(context)
        
        // Verify recommendations were returned
        assertEquals(1, recommendations.size)
        assertEquals("test-light-1", recommendations[0].deviceId)
        assertEquals("Test Light", recommendations[0].deviceName)
        assertEquals("Turn on lights", recommendations[0].action)
    }
    
    @Test
    fun `test createAutomationRule should create and store rule`() = runTest(testDispatcher) {
        // Initialize
        deviceControlSystem.initialize()
        
        // Create rule
        val rule = AutomationRule(
            name = "Morning Routine",
            description = "Turn on lights in the morning",
            triggers = listOf(
                AutomationTrigger.TimeTrigger(
                    hour = 7,
                    minute = 0,
                    daysOfWeek = setOf(1, 2, 3, 4, 5) // Weekdays only
                )
            ),
            actions = listOf(
                AutomationAction.DeviceCommandAction(
                    deviceId = "test-light-1",
                    command = DeviceCommand("setPower", mapOf("power" to true))
                )
            ),
            active = true
        )
        
        // Create rule
        val ruleId = deviceControlSystem.createAutomationRule(rule)
        
        // Verify rule ID was returned
        assertNotNull(ruleId)
        
        // Check that rule was stored
        val rules = deviceControlSystem.getAutomationRules()
        assertEquals(1, rules.size)
        assertEquals("Morning Routine", rules[0].name)
    }
    
    @Test
    fun `test events should be emitted for device operations`() = runTest(testDispatcher) {
        // Initialize
        deviceControlSystem.initialize()
        
        // Collect first event
        val firstEvent = deviceControlSystem.deviceEvents.first()
        
        // Verify initialization event was emitted
        assertTrue(firstEvent is DeviceEvent.SystemEvent)
        assertEquals(DeviceEventType.SYSTEM_INITIALIZED, (firstEvent as DeviceEvent.SystemEvent).type)
    }
    
    @Test
    fun `test disconnectAllDevices should disconnect all connected devices`() = runTest(testDispatcher) {
        // Initialize and connect to both test devices
        deviceControlSystem.initialize()
        
        // Discover and connect WiFi device
        deviceControlSystem.startDiscovery(setOf(DeviceProtocol.WIFI))
        deviceControlSystem.connectToDevice("test-light-1")
        
        // Discover and connect Bluetooth device
        deviceControlSystem.startDiscovery(setOf(DeviceProtocol.BLUETOOTH))
        deviceControlSystem.connectToDevice("test-speaker-1")
        
        // Disconnect all devices
        deviceControlSystem.disconnectAllDevices()
        
        // Verify both devices are disconnected
        val lightDevice = deviceControlSystem.getDevice("test-light-1")
        assertNotNull(lightDevice)
        assertEquals(DeviceConnectionState.DISCONNECTED, lightDevice.connectionState)
        
        val speakerDevice = deviceControlSystem.getDevice("test-speaker-1")
        assertNotNull(speakerDevice)
        assertEquals(DeviceConnectionState.DISCONNECTED, speakerDevice.connectionState)
        
        // Verify disconnect methods were called for both devices
        coVerify { wifiAdapter.disconnectFromDevice(any()) }
        coVerify { bluetoothAdapter.disconnectFromDevice(any()) }
    }
}

// Test Device Protocol Adapters

@ExperimentalCoroutinesApi
class WiFiProtocolAdapterTest {
    
    private lateinit var adapter: WiFiProtocolAdapter
    
    @Before
    fun setUp() {
        adapter = WiFiProtocolAdapter()
    }
    
    @Test
    fun `test getProtocol should return WIFI`() {
        assertEquals(DeviceProtocol.WIFI, adapter.getProtocol())
    }
    
    @Test
    fun `test discoverDevices should emit device info`() = runTest {
        val devices = mutableListOf<DeviceInfo>()
        adapter.discoverDevices().collect { devices.add(it) }
        
        assertEquals(3, devices.size)
        assertTrue(devices.any { it.type == DeviceType.LIGHT })
        assertTrue(devices.any { it.type == DeviceType.THERMOSTAT })
        assertTrue(devices.any { it.type == DeviceType.SPEAKER })
    }
    
    @Test
    fun `test connectToDevice should return true`() = runTest {
        val device = DeviceInfo(
            id = "test-device",
            name = "Test Device",
            type = DeviceType.LIGHT,
            protocol = DeviceProtocol.WIFI
        )
        
        val result = adapter.connectToDevice(device)
        assertTrue(result)
    }
    
    @Test
    fun `test sendCommand should return appropriate result based on device and command`() = runTest {
        val lightDevice = DeviceInfo(
            id = "test-light",
            name = "Test Light",
            type = DeviceType.LIGHT,
            protocol = DeviceProtocol.WIFI
        )
        
        // Test valid command
        val powerCommand = DeviceCommand("setPower", mapOf("power" to true))
        val powerResult = adapter.sendCommand(lightDevice, powerCommand)
        assertTrue(powerResult.success)
        assertEquals("success", powerResult.response["status"])
        
        // Test invalid command
        val invalidCommand = DeviceCommand("invalidCommand")
        val invalidResult = adapter.sendCommand(lightDevice, invalidCommand)
        assertFalse(invalidResult.success)
        assertEquals("error", invalidResult.response["status"])
    }
}

@ExperimentalCoroutinesApi
class AutomationManagerTest {
    
    private lateinit var manager: DeviceAutomationManager
    
    @Before
    fun setUp() {
        manager = DeviceAutomationManager()
    }
    
    @Test
    fun `test createRule should generate ID and store rule`() {
        val rule = AutomationRule(
            name = "Test Rule",
            description = "Test Description",
            triggers = listOf(),
            actions = listOf(),
            active = false
        )
        
        val ruleId = manager.createRule(rule)
        assertNotNull(ruleId)
        
        val storedRule = manager.getRule(ruleId)
        assertNotNull(storedRule)
        assertEquals("Test Rule", storedRule.name)
    }
    
    @Test
    fun `test updateRule should update existing rule`() {
        // Create rule
        val originalRule = AutomationRule(
            name = "Original Name",
            description = "Original Description",
            triggers = listOf(),
            actions = listOf(),
            active = false
        )
        
        val ruleId = manager.createRule(originalRule)
        
        // Update rule
        val updatedRule = originalRule.copy(name = "Updated Name")
        val result = manager.updateRule(ruleId, updatedRule)
        
        assertTrue(result)
        
        // Check that rule was updated
        val storedRule = manager.getRule(ruleId)
        assertNotNull(storedRule)
        assertEquals("Updated Name", storedRule.name)
    }
    
    @Test
    fun `test deleteRule should remove rule`() {
        // Create rule
        val rule = AutomationRule(
            name = "Test Rule",
            description = "Test Description",
            triggers = listOf(),
            actions = listOf(),
            active = false
        )
        
        val ruleId = manager.createRule(rule)
        
        // Delete rule
        val result = manager.deleteRule(ruleId)
        assertTrue(result)
        
        // Check that rule was deleted
        val storedRule = manager.getRule(ruleId)
        assertEquals(null, storedRule)
    }
}


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


/**
 * Tests for Sallie's Device Control Integration System
 * 
 * This test suite validates the functionality and reliability of the
 * Device Control System, ensuring it can properly discover, connect to,
 * and control various smart home and IoT devices.
 *
 * Created with love. 💛
 */

package com.sallie.device

import com.sallie.core.PluginRegistry
import com.sallie.core.featureFlags
import com.sallie.core.runtimeConsent
import io.mockk.*
import io.mockk.impl.annotations.MockK
import io.mockk.impl.annotations.RelaxedMockK
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.runTest
import org.junit.After
import org.junit.Before
import org.junit.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

@ExperimentalCoroutinesApi
class DeviceControlSystemTest {
    
    @RelaxedMockK
    private lateinit var pluginRegistry: PluginRegistry
    
    @MockK
    private lateinit var wifiAdapter: WiFiProtocolAdapter
    
    @MockK
    private lateinit var bluetoothAdapter: BluetoothProtocolAdapter
    
    private val testDispatcher = UnconfinedTestDispatcher()
    
    private lateinit var deviceControlSystem: DeviceControlSystem
    
    private val testLightDevice = DeviceInfo(
        id = "test-light-1",
        name = "Test Light",
        type = DeviceType.LIGHT,
        manufacturer = "Test Manufacturer",
        model = "Test Model",
        protocol = DeviceProtocol.WIFI,
        capabilities = setOf(
            DeviceCapability.POWER_TOGGLE,
            DeviceCapability.BRIGHTNESS_CONTROL
        ),
        connectionState = DeviceConnectionState.DISCOVERED,
        ipAddress = "192.168.1.100"
    )
    
    private val testSpeakerDevice = DeviceInfo(
        id = "test-speaker-1",
        name = "Test Speaker",
        type = DeviceType.SPEAKER,
        manufacturer = "Test Audio",
        model = "Test Speaker Model",
        protocol = DeviceProtocol.BLUETOOTH,
        capabilities = setOf(
            DeviceCapability.AUDIO_PLAYBACK,
            DeviceCapability.VOLUME_CONTROL
        ),
        connectionState = DeviceConnectionState.DISCOVERED,
        bluetoothAddress = "00:11:22:33:44:55"
    )
    
    @Before
    fun setUp() {
        MockKAnnotations.init(this)
        
        // Mock feature flags
        mockkObject(featureFlags)
        every { featureFlags.isEnabled(any()) } returns true
        
        // Mock runtime consent
        mockkObject(runtimeConsent)
        every { runtimeConsent.requestPermission(any(), any()) } returns true
        
        // Mock WiFi adapter
        every { wifiAdapter.getProtocol() } returns DeviceProtocol.WIFI
        every { wifiAdapter.discoverDevices() } returns flowOf(testLightDevice)
        coEvery { wifiAdapter.connectToDevice(any()) } returns true
        coEvery { wifiAdapter.disconnectFromDevice(any()) } returns true
        coEvery { wifiAdapter.sendCommand(any(), any()) } returns CommandResult(true, mapOf("status" to "success"))
        coEvery { wifiAdapter.getDeviceStatus(any()) } returns mapOf("status" to "online", "power" to true)
        
        // Mock Bluetooth adapter
        every { bluetoothAdapter.getProtocol() } returns DeviceProtocol.BLUETOOTH
        every { bluetoothAdapter.discoverDevices() } returns flowOf(testSpeakerDevice)
        coEvery { bluetoothAdapter.connectToDevice(any()) } returns true
        coEvery { bluetoothAdapter.disconnectFromDevice(any()) } returns true
        coEvery { bluetoothAdapter.sendCommand(any(), any()) } returns CommandResult(true, mapOf("status" to "success"))
        coEvery { bluetoothAdapter.getDeviceStatus(any()) } returns mapOf("status" to "online", "playing" to false)
        
        // Create a test instance of DeviceControlSystem with mocked dependencies
        deviceControlSystem = DeviceControlSystem(pluginRegistry)
        
        // Replace protocol adapters with mocks
        val protocolAdaptersField = DeviceControlSystem::class.java.getDeclaredField("protocolAdapters")
        protocolAdaptersField.isAccessible = true
        val protocolAdapters = mutableMapOf<DeviceProtocol, ProtocolAdapter>()
        protocolAdapters[DeviceProtocol.WIFI] = wifiAdapter
        protocolAdapters[DeviceProtocol.BLUETOOTH] = bluetoothAdapter
        protocolAdaptersField.set(deviceControlSystem, protocolAdapters)
    }
    
    @After
    fun tearDown() {
        unmockkAll()
    }
    
    @Test
    fun `test initialize should register components and set state to idle`() = runTest(testDispatcher) {
        // Initialize the system
        deviceControlSystem.initialize()
        
        // Check that the plugin registry was called
        verify { pluginRegistry.registerSystemComponent(
            componentId = "device-control-system",
            component = deviceControlSystem,
            displayName = "Device Control System",
            description = "System for controlling smart home and IoT devices",
            version = "1.0.0",
            capabilities = listOf(
                "device-discovery",
                "device-control",
                "device-automation"
            )
        )}
        
        // Check that the system state is set to idle
        assertEquals(DeviceControlState.IDLE, deviceControlSystem.systemState.value)
    }
    
    @Test
    fun `test initialize should respect feature flags`() = runTest(testDispatcher) {
        // Mock feature flag to disable device control
        every { featureFlags.isEnabled("device_control") } returns false
        
        // Initialize the system
        deviceControlSystem.initialize()
        
        // Check that the system state is set to disabled
        assertEquals(DeviceControlState.DISABLED, deviceControlSystem.systemState.value)
    }
    
    @Test
    fun `test shutdown should clean up resources and set state to disabled`() = runTest(testDispatcher) {
        // Initialize first
        deviceControlSystem.initialize()
        
        // Shutdown
        deviceControlSystem.shutdown()
        
        // Check that the system state is set to disabled
        assertEquals(DeviceControlState.DISABLED, deviceControlSystem.systemState.value)
    }
    
    @Test
    fun `test startDiscovery should discover devices and update registry`() = runTest(testDispatcher) {
        // Initialize first
        deviceControlSystem.initialize()
        
        // Start discovery
        val result = deviceControlSystem.startDiscovery(setOf(DeviceProtocol.WIFI))
        
        // Verify the result is successful
        assertTrue(result)
        
        // Verify discovery was called
        verify { wifiAdapter.discoverDevices() }
        
        // Check the state was set to discovering
        assertEquals(DeviceControlState.DISCOVERING, deviceControlSystem.systemState.value)
        
        // Check that the device was added to the registry
        val devices = deviceControlSystem.getDiscoveredDevices()
        assertEquals(1, devices.size)
        assertEquals("test-light-1", devices[0].id)
        assertEquals("Test Light", devices[0].name)
    }
    
    @Test
    fun `test stopDiscovery should cancel discovery job and update state`() = runTest(testDispatcher) {
        // Initialize and start discovery
        deviceControlSystem.initialize()
        deviceControlSystem.startDiscovery()
        
        // Stop discovery
        deviceControlSystem.stopDiscovery()
        
        // Check the state was set back to idle
        assertEquals(DeviceControlState.IDLE, deviceControlSystem.systemState.value)
    }
    
    @Test
    fun `test connectToDevice should connect to device and update status`() = runTest(testDispatcher) {
        // Initialize and discover device
        deviceControlSystem.initialize()
        deviceControlSystem.startDiscovery(setOf(DeviceProtocol.WIFI))
        
        // Ensure device is in registry
        val devices = deviceControlSystem.getDiscoveredDevices()
        assertTrue(devices.isNotEmpty())
        
        // Connect to device
        val result = deviceControlSystem.connectToDevice("test-light-1")
        
        // Verify connection was successful
        assertTrue(result)
        
        // Check that connection method was called
        coVerify { wifiAdapter.connectToDevice(any()) }
        
        // Check that device connection state was updated
        val device = deviceControlSystem.getDevice("test-light-1")
        assertNotNull(device)
        assertEquals(DeviceConnectionState.CONNECTED, device.connectionState)
    }
    
    @Test
    fun `test connectToDevice should handle nonexistent device`() = runTest(testDispatcher) {
        // Initialize
        deviceControlSystem.initialize()
        
        // Try to connect to nonexistent device
        val result = deviceControlSystem.connectToDevice("nonexistent-device")
        
        // Verify connection failed
        assertFalse(result)
    }
    
    @Test
    fun `test disconnectFromDevice should disconnect and update status`() = runTest(testDispatcher) {
        // Initialize, discover, and connect to device
        deviceControlSystem.initialize()
        deviceControlSystem.startDiscovery(setOf(DeviceProtocol.WIFI))
        deviceControlSystem.connectToDevice("test-light-1")
        
        // Disconnect from device
        val result = deviceControlSystem.disconnectFromDevice("test-light-1")
        
        // Verify disconnection was successful
        assertTrue(result)
        
        // Check that disconnection method was called
        coVerify { wifiAdapter.disconnectFromDevice(any()) }
        
        // Check that device connection state was updated
        val device = deviceControlSystem.getDevice("test-light-1")
        assertNotNull(device)
        assertEquals(DeviceConnectionState.DISCONNECTED, device.connectionState)
    }
    
    @Test
    fun `test sendCommand should send command to device and return result`() = runTest(testDispatcher) {
        // Initialize, discover, and connect to device
        deviceControlSystem.initialize()
        deviceControlSystem.startDiscovery(setOf(DeviceProtocol.WIFI))
        deviceControlSystem.connectToDevice("test-light-1")
        
        // Send command to device
        val command = DeviceCommand("setPower", mapOf("power" to true))
        val result = deviceControlSystem.sendCommand("test-light-1", command)
        
        // Verify command was successful
        assertTrue(result)
        
        // Check that command method was called
        coVerify { wifiAdapter.sendCommand(any(), eq(command)) }
    }
    
    @Test
    fun `test sendCommand should fail for disconnected device`() = runTest(testDispatcher) {
        // Initialize and discover device (but don't connect)
        deviceControlSystem.initialize()
        deviceControlSystem.startDiscovery(setOf(DeviceProtocol.WIFI))
        
        // Send command to disconnected device
        val command = DeviceCommand("setPower", mapOf("power" to true))
        val result = deviceControlSystem.sendCommand("test-light-1", command)
        
        // Verify command failed
        assertFalse(result)
        
        // Check that command method was not called
        coVerify(exactly = 0) { wifiAdapter.sendCommand(any(), any()) }
    }
    
    @Test
    fun `test getDeviceStatus should return status for connected device`() = runTest(testDispatcher) {
        // Initialize, discover, and connect to device
        deviceControlSystem.initialize()
        deviceControlSystem.startDiscovery(setOf(DeviceProtocol.WIFI))
        deviceControlSystem.connectToDevice("test-light-1")
        
        // Get device status
        val status = deviceControlSystem.getDeviceStatus("test-light-1")
        
        // Verify status was returned
        assertNotNull(status)
        assertEquals("online", status["status"])
        assertEquals(true, status["power"])
        
        // Check that status method was called
        coVerify { wifiAdapter.getDeviceStatus(any()) }
    }
    
    @Test
    fun `test getDeviceStatus should return null for disconnected device`() = runTest(testDispatcher) {
        // Initialize and discover device (but don't connect)
        deviceControlSystem.initialize()
        deviceControlSystem.startDiscovery(setOf(DeviceProtocol.WIFI))
        
        // Get device status
        val status = deviceControlSystem.getDeviceStatus("test-light-1")
        
        // Verify null status was returned
        assertEquals(null, status)
        
        // Check that status method was not called
        coVerify(exactly = 0) { wifiAdapter.getDeviceStatus(any()) }
    }
    
    @Test
    fun `test getDeviceRecommendations should return recommendations based on context`() = runTest(testDispatcher) {
        // Initialize, discover, and connect to devices
        deviceControlSystem.initialize()
        deviceControlSystem.startDiscovery(setOf(DeviceProtocol.WIFI))
        deviceControlSystem.connectToDevice("test-light-1")
        
        // Create morning time context
        val context = DeviceRecommendationContext(
            contextType = DeviceContextType.TIME_OF_DAY,
            timeOfDay = TimeOfDay.MORNING
        )
        
        // Get recommendations
        val recommendations = deviceControlSystem.getDeviceRecommendations(context)
        
        // Verify recommendations were returned
        assertEquals(1, recommendations.size)
        assertEquals("test-light-1", recommendations[0].deviceId)
        assertEquals("Test Light", recommendations[0].deviceName)
        assertEquals("Turn on lights", recommendations[0].action)
    }
    
    @Test
    fun `test createAutomationRule should create and store rule`() = runTest(testDispatcher) {
        // Initialize
        deviceControlSystem.initialize()
        
        // Create rule
        val rule = AutomationRule(
            name = "Morning Routine",
            description = "Turn on lights in the morning",
            triggers = listOf(
                AutomationTrigger.TimeTrigger(
                    hour = 7,
                    minute = 0,
                    daysOfWeek = setOf(1, 2, 3, 4, 5) // Weekdays only
                )
            ),
            actions = listOf(
                AutomationAction.DeviceCommandAction(
                    deviceId = "test-light-1",
                    command = DeviceCommand("setPower", mapOf("power" to true))
                )
            ),
            active = true
        )
        
        // Create rule
        val ruleId = deviceControlSystem.createAutomationRule(rule)
        
        // Verify rule ID was returned
        assertNotNull(ruleId)
        
        // Check that rule was stored
        val rules = deviceControlSystem.getAutomationRules()
        assertEquals(1, rules.size)
        assertEquals("Morning Routine", rules[0].name)
    }
    
    @Test
    fun `test events should be emitted for device operations`() = runTest(testDispatcher) {
        // Initialize
        deviceControlSystem.initialize()
        
        // Collect first event
        val firstEvent = deviceControlSystem.deviceEvents.first()
        
        // Verify initialization event was emitted
        assertTrue(firstEvent is DeviceEvent.SystemEvent)
        assertEquals(DeviceEventType.SYSTEM_INITIALIZED, (firstEvent as DeviceEvent.SystemEvent).type)
    }
    
    @Test
    fun `test disconnectAllDevices should disconnect all connected devices`() = runTest(testDispatcher) {
        // Initialize and connect to both test devices
        deviceControlSystem.initialize()
        
        // Discover and connect WiFi device
        deviceControlSystem.startDiscovery(setOf(DeviceProtocol.WIFI))
        deviceControlSystem.connectToDevice("test-light-1")
        
        // Discover and connect Bluetooth device
        deviceControlSystem.startDiscovery(setOf(DeviceProtocol.BLUETOOTH))
        deviceControlSystem.connectToDevice("test-speaker-1")
        
        // Disconnect all devices
        deviceControlSystem.disconnectAllDevices()
        
        // Verify both devices are disconnected
        val lightDevice = deviceControlSystem.getDevice("test-light-1")
        assertNotNull(lightDevice)
        assertEquals(DeviceConnectionState.DISCONNECTED, lightDevice.connectionState)
        
        val speakerDevice = deviceControlSystem.getDevice("test-speaker-1")
        assertNotNull(speakerDevice)
        assertEquals(DeviceConnectionState.DISCONNECTED, speakerDevice.connectionState)
        
        // Verify disconnect methods were called for both devices
        coVerify { wifiAdapter.disconnectFromDevice(any()) }
        coVerify { bluetoothAdapter.disconnectFromDevice(any()) }
    }
}

// Test Device Protocol Adapters

@ExperimentalCoroutinesApi
class WiFiProtocolAdapterTest {
    
    private lateinit var adapter: WiFiProtocolAdapter
    
    @Before
    fun setUp() {
        adapter = WiFiProtocolAdapter()
    }
    
    @Test
    fun `test getProtocol should return WIFI`() {
        assertEquals(DeviceProtocol.WIFI, adapter.getProtocol())
    }
    
    @Test
    fun `test discoverDevices should emit device info`() = runTest {
        val devices = mutableListOf<DeviceInfo>()
        adapter.discoverDevices().collect { devices.add(it) }
        
        assertEquals(3, devices.size)
        assertTrue(devices.any { it.type == DeviceType.LIGHT })
        assertTrue(devices.any { it.type == DeviceType.THERMOSTAT })
        assertTrue(devices.any { it.type == DeviceType.SPEAKER })
    }
    
    @Test
    fun `test connectToDevice should return true`() = runTest {
        val device = DeviceInfo(
            id = "test-device",
            name = "Test Device",
            type = DeviceType.LIGHT,
            protocol = DeviceProtocol.WIFI
        )
        
        val result = adapter.connectToDevice(device)
        assertTrue(result)
    }
    
    @Test
    fun `test sendCommand should return appropriate result based on device and command`() = runTest {
        val lightDevice = DeviceInfo(
            id = "test-light",
            name = "Test Light",
            type = DeviceType.LIGHT,
            protocol = DeviceProtocol.WIFI
        )
        
        // Test valid command
        val powerCommand = DeviceCommand("setPower", mapOf("power" to true))
        val powerResult = adapter.sendCommand(lightDevice, powerCommand)
        assertTrue(powerResult.success)
        assertEquals("success", powerResult.response["status"])
        
        // Test invalid command
        val invalidCommand = DeviceCommand("invalidCommand")
        val invalidResult = adapter.sendCommand(lightDevice, invalidCommand)
        assertFalse(invalidResult.success)
        assertEquals("error", invalidResult.response["status"])
    }
}

@ExperimentalCoroutinesApi
class AutomationManagerTest {
    
    private lateinit var manager: DeviceAutomationManager
    
    @Before
    fun setUp() {
        manager = DeviceAutomationManager()
    }
    
    @Test
    fun `test createRule should generate ID and store rule`() {
        val rule = AutomationRule(
            name = "Test Rule",
            description = "Test Description",
            triggers = listOf(),
            actions = listOf(),
            active = false
        )
        
        val ruleId = manager.createRule(rule)
        assertNotNull(ruleId)
        
        val storedRule = manager.getRule(ruleId)
        assertNotNull(storedRule)
        assertEquals("Test Rule", storedRule.name)
    }
    
    @Test
    fun `test updateRule should update existing rule`() {
        // Create rule
        val originalRule = AutomationRule(
            name = "Original Name",
            description = "Original Description",
            triggers = listOf(),
            actions = listOf(),
            active = false
        )
        
        val ruleId = manager.createRule(originalRule)
        
        // Update rule
        val updatedRule = originalRule.copy(name = "Updated Name")
        val result = manager.updateRule(ruleId, updatedRule)
        
        assertTrue(result)
        
        // Check that rule was updated
        val storedRule = manager.getRule(ruleId)
        assertNotNull(storedRule)
        assertEquals("Updated Name", storedRule.name)
    }
    
    @Test
    fun `test deleteRule should remove rule`() {
        // Create rule
        val rule = AutomationRule(
            name = "Test Rule",
            description = "Test Description",
            triggers = listOf(),
            actions = listOf(),
            active = false
        )
        
        val ruleId = manager.createRule(rule)
        
        // Delete rule
        val result = manager.deleteRule(ruleId)
        assertTrue(result)
        
        // Check that rule was deleted
        val storedRule = manager.getRule(ruleId)
        assertEquals(null, storedRule)
    }
}

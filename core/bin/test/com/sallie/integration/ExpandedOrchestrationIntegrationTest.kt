package com.sallie.integration

import com.sallie.core.PluginRegistry
import com.sallie.orchestration.ExpandedOrchestrationController
import io.mockk.*
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.test.TestCoroutineDispatcher
import kotlinx.coroutines.test.TestCoroutineScope
import kotlinx.coroutines.test.runBlockingTest
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import kotlin.reflect.full.declaredMemberFunctions
import kotlin.test.assertEquals
import kotlin.test.assertTrue

@ExperimentalCoroutinesApi
class ExpandedOrchestrationIntegrationTest {

    private lateinit var integration: ExpandedOrchestrationIntegration
    private lateinit var pluginRegistry: PluginRegistry
    private val testDispatcher = TestCoroutineDispatcher()
    private val testScope = TestCoroutineScope(testDispatcher)
    
    // Mock components
    private lateinit var visualStateManager: Any
    private lateinit var personalityBridge: Any
    private lateinit var adaptivePersonaEngine: Any
    private lateinit var researchService: Any

    @BeforeEach
    fun setUp() {
        pluginRegistry = mockk(relaxed = true)
        
        // Mock the orchestration controller
        mockkConstructor(ExpandedOrchestrationController::class)
        every { anyConstructed<ExpandedOrchestrationController>().initialize() } just Runs
        every { anyConstructed<ExpandedOrchestrationController>().shutdown() } just Runs
        
        // Create mock components
        visualStateManager = mockk(relaxed = true)
        personalityBridge = mockk(relaxed = true)
        adaptivePersonaEngine = mockk(relaxed = true)
        researchService = mockk(relaxed = true)
        
        // Setup mock components with reflective method calls
        every { 
            visualStateManager.javaClass.getMethod(
                "registerDashboard", 
                String::class.java, 
                Any::class.java
            )
        } returns MockMethod()
        
        every { 
            visualStateManager.javaClass.getMethod(
                "unregisterDashboard", 
                String::class.java
            )
        } returns MockMethod()
        
        every { 
            personalityBridge.javaClass.getMethod(
                "registerSystemMonitor", 
                String::class.java, 
                Any::class.java
            )
        } returns MockMethod()
        
        every { 
            personalityBridge.javaClass.getMethod(
                "unregisterSystemMonitor", 
                String::class.java
            )
        } returns MockMethod()
        
        every { 
            adaptivePersonaEngine.javaClass.getMethod(
                "registerResourceManager", 
                Any::class.java
            )
        } returns MockMethod()
        
        every { 
            adaptivePersonaEngine.javaClass.getMethod(
                "unregisterResourceManager", 
                Any::class.java
            )
        } returns MockMethod()
        
        every { 
            researchService.javaClass.getMethod("getSystemEventsFlow")
        } returns MockMethod()
        
        every { 
            researchService.javaClass.getMethod("getSystemEventsFlow").invoke(researchService)
        } returns flowOf("test.event")
        
        // Setup plugin registry to return mock components
        every { pluginRegistry.getComponent("visual-state-manager") } returns visualStateManager
        every { pluginRegistry.getComponent("personality-bridge") } returns personalityBridge
        every { pluginRegistry.getComponent("adaptive-persona-engine") } returns adaptivePersonaEngine
        every { pluginRegistry.getComponent("research-service") } returns researchService
        
        integration = ExpandedOrchestrationIntegration(pluginRegistry)
    }

    @AfterEach
    fun tearDown() {
        testDispatcher.cleanupTestCoroutines()
        unmockkAll()
    }

    @Test
    fun `initialize should set up orchestration controller and register integration hooks`() = testScope.runBlockingTest {
        // Act
        integration.initialize()
        
        // Assert
        assertEquals(IntegrationState.INITIALIZED, integration.integrationState.value)
        
        verify(exactly = 1) { anyConstructed<ExpandedOrchestrationController>().initialize() }
        verify(exactly = 1) { pluginRegistry.getComponent("visual-state-manager") }
        verify(exactly = 1) { pluginRegistry.getComponent("personality-bridge") }
        verify(exactly = 1) { pluginRegistry.getComponent("adaptive-persona-engine") }
        verify(exactly = 1) { pluginRegistry.getComponent("research-service") }
    }

    @Test
    fun `shutdown should unregister hooks and shut down controller`() = testScope.runBlockingTest {
        // Arrange
        integration.initialize()
        
        // Act
        integration.shutdown()
        
        // Assert
        assertEquals(IntegrationState.SHUT_DOWN, integration.integrationState.value)
        
        verify(exactly = 1) { anyConstructed<ExpandedOrchestrationController>().shutdown() }
        verify(exactly = 2) { pluginRegistry.getComponent("visual-state-manager") } // One for init, one for shutdown
        verify(exactly = 2) { pluginRegistry.getComponent("personality-bridge") } // One for init, one for shutdown
        verify(exactly = 2) { pluginRegistry.getComponent("adaptive-persona-engine") } // One for init, one for shutdown
    }

    @Test
    fun `getOrchestrationController should return initialized controller`() = testScope.runBlockingTest {
        // Arrange
        integration.initialize()
        
        // Act
        val controller = integration.getOrchestrationController()
        
        // Assert
        assertTrue(controller is ExpandedOrchestrationController)
    }

    // Mock class for Java reflection
    class MockMethod : java.lang.reflect.Method() {
        override fun invoke(obj: Any?, vararg args: Any?): Any? = null
        override fun getName(): String = "mockMethod"
        override fun getParameterTypes(): Array<Class<*>> = arrayOf()
        override fun getReturnType(): Class<*> = Any::class.java
        override fun getDeclaringClass(): Class<*> = Any::class.java
    }
}

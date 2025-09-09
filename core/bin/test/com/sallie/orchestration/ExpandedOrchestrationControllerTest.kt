package com.sallie.orchestration

import com.sallie.core.PluginRegistry
import io.mockk.*
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.TestCoroutineDispatcher
import kotlinx.coroutines.test.TestCoroutineScope
import kotlinx.coroutines.test.runBlockingTest
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.util.*
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

@ExperimentalCoroutinesApi
class ExpandedOrchestrationControllerTest {

    private lateinit var controller: ExpandedOrchestrationController
    private lateinit var pluginRegistry: PluginRegistry
    private val testDispatcher = TestCoroutineDispatcher()
    private val testScope = TestCoroutineScope(testDispatcher)

    @BeforeEach
    fun setUp() {
        pluginRegistry = mockk(relaxed = true)
        
        mockkConstructor(ResourceAllocationManager::class)
        mockkConstructor(InterModuleCommunicationBus::class)
        mockkConstructor(SystemHealthMonitor::class)
        mockkConstructor(PerformanceAnalyticsEngine::class)
        
        // Mock initialization methods to do nothing
        every { anyConstructed<ResourceAllocationManager>().initialize() } just Runs
        every { anyConstructed<InterModuleCommunicationBus>().initialize() } just Runs
        every { anyConstructed<SystemHealthMonitor>().initialize() } just Runs
        every { anyConstructed<PerformanceAnalyticsEngine>().initialize() } just Runs
        
        every { anyConstructed<ResourceAllocationManager>().shutdown() } just Runs
        every { anyConstructed<InterModuleCommunicationBus>().shutdown() } just Runs
        every { anyConstructed<SystemHealthMonitor>().shutdown() } just Runs
        every { anyConstructed<PerformanceAnalyticsEngine>().shutdown() } just Runs
        
        // Mock plugin registry methods
        val mockComponents = listOf(
            TestComponent("test-component-1"),
            TestComponent("test-component-2")
        )
        val mockMetadata = mapOf(
            "test-component-1" to TestComponentMetadata("Test Component 1", 2, listOf("topic1", "topic2")),
            "test-component-2" to TestComponentMetadata("Test Component 2", 1, listOf("topic3"))
        )
        
        every { pluginRegistry.getAllComponents() } returns mockComponents
        every { pluginRegistry.getComponentMetadata(any()) } answers { 
            val id = firstArg<String>()
            mockMetadata[id]
        }
        
        controller = ExpandedOrchestrationController(pluginRegistry)
    }

    @AfterEach
    fun tearDown() {
        testDispatcher.cleanupTestCoroutines()
        unmockkAll()
    }

    @Test
    fun `initialize should start all subsystems and register components`() = testScope.runBlockingTest {
        // Arrange
        val componentCaptor = slot<String>()
        val requirementsCaptor = slot<ResourceRequirements>()
        val topicsCaptor = slot<List<String>>()
        
        every { 
            anyConstructed<ResourceAllocationManager>()
            .registerComponent(capture(componentCaptor), capture(requirementsCaptor)) 
        } just Runs
        
        every { 
            anyConstructed<InterModuleCommunicationBus>()
            .registerComponent(any(), capture(topicsCaptor)) 
        } just Runs
        
        every { 
            anyConstructed<SystemHealthMonitor>().registerComponent(any()) 
        } just Runs
        
        every { 
            anyConstructed<PerformanceAnalyticsEngine>().registerComponent(any()) 
        } just Runs
        
        // Act
        controller.initialize()
        
        // Assert
        assertEquals(SystemState.RUNNING, controller.systemState.value)
        
        verify(exactly = 1) { anyConstructed<ResourceAllocationManager>().initialize() }
        verify(exactly = 1) { anyConstructed<InterModuleCommunicationBus>().initialize() }
        verify(exactly = 1) { anyConstructed<SystemHealthMonitor>().initialize() }
        verify(exactly = 1) { anyConstructed<PerformanceAnalyticsEngine>().initialize() }
        
        verify(exactly = 1) { pluginRegistry.getAllComponents() }
        verify(exactly = 2) { pluginRegistry.getComponentMetadata(any()) }
        
        // Verify that components were registered with all subsystems
        verify(exactly = 2) { anyConstructed<ResourceAllocationManager>().registerComponent(any(), any()) }
        verify(exactly = 2) { anyConstructed<InterModuleCommunicationBus>().registerComponent(any(), any()) }
        verify(exactly = 2) { anyConstructed<SystemHealthMonitor>().registerComponent(any()) }
        verify(exactly = 2) { anyConstructed<PerformanceAnalyticsEngine>().registerComponent(any()) }
    }

    @Test
    fun `shutdown should stop all subsystems and notify components`() = testScope.runBlockingTest {
        // Arrange
        controller.initialize()
        
        // Act
        controller.shutdown()
        
        // Assert
        assertEquals(SystemState.SHUTDOWN, controller.systemState.value)
        
        verify(exactly = 1) { anyConstructed<ResourceAllocationManager>().shutdown() }
        verify(exactly = 1) { anyConstructed<InterModuleCommunicationBus>().shutdown() }
        verify(exactly = 1) { anyConstructed<SystemHealthMonitor>().shutdown() }
        verify(exactly = 1) { anyConstructed<PerformanceAnalyticsEngine>().shutdown() }
    }

    @Test
    fun `startTask should allocate resources and release them after completion`() = testScope.runBlockingTest {
        // Arrange
        controller.initialize()
        
        val componentId = "test-component"
        val taskName = "Test Task"
        val taskId = UUID.randomUUID().toString()
        
        mockkStatic(UUID::class)
        every { UUID.randomUUID().toString() } returns taskId
        
        every { 
            anyConstructed<ResourceAllocationManager>()
            .allocateResources(componentId, taskId, TaskPriority.NORMAL) 
        } returns true
        
        every { 
            anyConstructed<ResourceAllocationManager>()
            .releaseResources(componentId, taskId) 
        } just Runs
        
        every { 
            anyConstructed<PerformanceAnalyticsEngine>()
            .recordTaskStart(componentId, taskId, taskName, TaskPriority.NORMAL) 
        } just Runs
        
        every { 
            anyConstructed<PerformanceAnalyticsEngine>()
            .recordTaskCompletion(componentId, taskId, taskName, any(), any()) 
        } just Runs
        
        // Act
        val result = controller.startTask(componentId, taskName) {
            "Task completed"
        }
        
        // Assert
        assertEquals("Task completed", result)
        
        verify(exactly = 1) { 
            anyConstructed<ResourceAllocationManager>()
            .allocateResources(componentId, taskId, TaskPriority.NORMAL) 
        }
        
        verify(exactly = 1) { 
            anyConstructed<ResourceAllocationManager>()
            .releaseResources(componentId, taskId) 
        }
        
        verify(exactly = 1) { 
            anyConstructed<PerformanceAnalyticsEngine>()
            .recordTaskStart(componentId, taskId, taskName, TaskPriority.NORMAL) 
        }
        
        verify(exactly = 1) { 
            anyConstructed<PerformanceAnalyticsEngine>()
            .recordTaskCompletion(componentId, taskId, taskName, any(), any()) 
        }
    }

    @Test
    fun `startTask should handle errors and release resources`() = testScope.runBlockingTest {
        // Arrange
        controller.initialize()
        
        val componentId = "test-component"
        val taskName = "Test Task"
        val taskId = UUID.randomUUID().toString()
        val testException = RuntimeException("Test error")
        
        mockkStatic(UUID::class)
        every { UUID.randomUUID().toString() } returns taskId
        
        every { 
            anyConstructed<ResourceAllocationManager>()
            .allocateResources(componentId, taskId, TaskPriority.NORMAL) 
        } returns true
        
        every { 
            anyConstructed<ResourceAllocationManager>()
            .releaseResources(componentId, taskId) 
        } just Runs
        
        every { 
            anyConstructed<PerformanceAnalyticsEngine>()
            .recordTaskStart(componentId, taskId, taskName, TaskPriority.NORMAL) 
        } just Runs
        
        every { 
            anyConstructed<PerformanceAnalyticsEngine>()
            .recordTaskFailure(componentId, taskId, taskName, any()) 
        } just Runs
        
        every {
            anyConstructed<SystemHealthMonitor>()
            .recordComponentError(componentId, any()) 
        } just Runs
        
        // Act & Assert
        try {
            controller.startTask(componentId, taskName) {
                throw testException
            }
        } catch (e: Exception) {
            assertEquals(testException, e)
        }
        
        // Assert
        verify(exactly = 1) { 
            anyConstructed<ResourceAllocationManager>()
            .allocateResources(componentId, taskId, TaskPriority.NORMAL) 
        }
        
        verify(exactly = 1) { 
            anyConstructed<ResourceAllocationManager>()
            .releaseResources(componentId, taskId) 
        }
        
        verify(exactly = 1) { 
            anyConstructed<PerformanceAnalyticsEngine>()
            .recordTaskStart(componentId, taskId, taskName, TaskPriority.NORMAL) 
        }
        
        verify(exactly = 1) { 
            anyConstructed<PerformanceAnalyticsEngine>()
            .recordTaskFailure(componentId, taskId, taskName, any()) 
        }
        
        verify(exactly = 1) { 
            anyConstructed<SystemHealthMonitor>()
            .recordComponentError(componentId, any()) 
        }
    }

    @Test
    fun `sendMessage should delegate to communicationBus`() = testScope.runBlockingTest {
        // Arrange
        controller.initialize()
        
        val message = InterModuleMessage(
            senderId = "sender",
            recipientId = "recipient",
            payload = mapOf("key" to "value")
        )
        
        every { 
            anyConstructed<InterModuleCommunicationBus>()
            .sendMessage(message) 
        } returns true
        
        // Act
        val result = controller.sendMessage(message)
        
        // Assert
        assertTrue(result)
        
        verify(exactly = 1) { 
            anyConstructed<InterModuleCommunicationBus>()
            .sendMessage(message) 
        }
    }

    @Test
    fun `publishToTopic should delegate to communicationBus`() = testScope.runBlockingTest {
        // Arrange
        controller.initialize()
        
        val message = InterModuleMessage(
            senderId = "sender",
            topic = "test-topic",
            payload = mapOf("key" to "value")
        )
        
        every { 
            anyConstructed<InterModuleCommunicationBus>()
            .publishToTopic(message) 
        } returns true
        
        // Act
        val result = controller.publishToTopic(message)
        
        // Assert
        assertTrue(result)
        
        verify(exactly = 1) { 
            anyConstructed<InterModuleCommunicationBus>()
            .publishToTopic(message) 
        }
    }

    @Test
    fun `getSystemHealth should delegate to healthMonitor`() = testScope.runBlockingTest {
        // Arrange
        controller.initialize()
        
        val healthReport = SystemHealthReport(
            status = SystemStatus.HEALTHY,
            componentStatuses = emptyList(),
            recentErrors = emptyList(),
            timestamp = System.currentTimeMillis()
        )
        
        every { 
            anyConstructed<SystemHealthMonitor>()
            .getHealthReport() 
        } returns healthReport
        
        // Act
        val result = controller.getSystemHealth()
        
        // Assert
        assertEquals(healthReport, result)
        
        verify(exactly = 1) { 
            anyConstructed<SystemHealthMonitor>()
            .getHealthReport() 
        }
    }

    @Test
    fun `getPerformanceReport should delegate to performanceAnalytics`() = testScope.runBlockingTest {
        // Arrange
        controller.initialize()
        
        val performanceReport = PerformanceReport(
            timestamp = System.currentTimeMillis(),
            totalTasks = 10,
            successfulTasks = 8,
            failedTasks = 2,
            successRatePercent = 80.0,
            averageExecutionTimeMs = 150.0,
            componentMetrics = emptyList(),
            recentTasks = emptyList()
        )
        
        every { 
            anyConstructed<PerformanceAnalyticsEngine>()
            .generateReport() 
        } returns performanceReport
        
        // Act
        val result = controller.getPerformanceReport()
        
        // Assert
        assertEquals(performanceReport, result)
        
        verify(exactly = 1) { 
            anyConstructed<PerformanceAnalyticsEngine>()
            .generateReport() 
        }
    }

    @Test
    fun `optimizeSystem should apply optimization recommendations`() = testScope.runBlockingTest {
        // Arrange
        controller.initialize()
        
        val performanceReport = mockk<PerformanceReport>()
        
        val recommendations = listOf(
            OptimizationRecommendation(
                type = OptimizationType.RESOURCE_ALLOCATION,
                componentId = "component1",
                parameter = "memoryMb",
                currentValue = 100.0,
                newValue = 150.0,
                reason = "Test reason"
            ),
            OptimizationRecommendation(
                type = OptimizationType.HEALTH_CHECK_FREQUENCY,
                componentId = "system",
                parameter = "checkFrequencyMs",
                currentValue = 5000.0,
                newValue = 2500.0,
                reason = "Test reason"
            )
        )
        
        every { 
            anyConstructed<PerformanceAnalyticsEngine>()
            .generateReport() 
        } returns performanceReport
        
        every { 
            anyConstructed<PerformanceAnalyticsEngine>()
            .generateOptimizationRecommendations(performanceReport) 
        } returns recommendations
        
        every { 
            anyConstructed<ResourceAllocationManager>()
            .applyOptimization(any()) 
        } just Runs
        
        every { 
            anyConstructed<SystemHealthMonitor>()
            .applyOptimization(any()) 
        } just Runs
        
        // Act
        controller.optimizeSystem()
        
        // Assert
        verify(exactly = 1) { 
            anyConstructed<PerformanceAnalyticsEngine>()
            .generateReport() 
        }
        
        verify(exactly = 1) { 
            anyConstructed<PerformanceAnalyticsEngine>()
            .generateOptimizationRecommendations(performanceReport) 
        }
        
        verify(exactly = 1) { 
            anyConstructed<ResourceAllocationManager>()
            .applyOptimization(recommendations[0]) 
        }
        
        verify(exactly = 1) { 
            anyConstructed<SystemHealthMonitor>()
            .applyOptimization(recommendations[1]) 
        }
    }

    // Helper classes for testing
    
    private class TestComponent(val id: String)
    
    private class TestComponentMetadata(
        val displayName: String,
        val priority: Int,
        val topics: List<String>
    ) {
        fun getPriorityLevel() = priority
        fun getResourceRequirements() = ResourceRequirements()
        fun getTopics() = topics
    }
}

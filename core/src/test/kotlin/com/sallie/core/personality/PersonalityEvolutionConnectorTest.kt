package com.sallie.core.personality

/**
 * Sallie 2.0 Module
 * Persona: Tough love meets soul care.
 * Function: Unit tests for the Personality Evolution Connector.
 * Got it, love.
 */
import android.content.Context
import com.google.gson.Gson
import com.sallie.core.learning.AdaptiveLearningEngine
import com.sallie.core.learning.Insight
import com.sallie.core.memory.HierarchicalMemorySystem
import com.sallie.core.memory.MemoryRecord
import io.mockk.*
import io.mockk.impl.annotations.MockK
import kotlinx.coroutines.runBlocking
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import java.io.File
import java.io.FileWriter
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

@RunWith(RobolectricTestRunner::class)
@Config(manifest = Config.NONE)
class PersonalityEvolutionConnectorTest {

    @MockK
    private lateinit var context: Context

    @MockK
    private lateinit var personalitySystem: AdvancedPersonalitySystem

    @MockK
    private lateinit var memorySystem: HierarchicalMemorySystem

    @MockK
    private lateinit var learningEngine: AdaptiveLearningEngine

    @MockK
    private lateinit var mockFile: File

    @MockK
    private lateinit var mockFileWriter: FileWriter

    private lateinit var connector: PersonalityEvolutionConnector

    private val gson = Gson()
    
    @Before
    fun setUp() {
        MockKAnnotations.init(this)
        
        // Mock file system operations
        val filesDir = mockk<File>()
        every { context.filesDir } returns filesDir
        every { filesDir.path } returns "/test/files"
        
        // Setup the personality system mock
        every { personalitySystem.getCurrentTraits() } returns mapOf(
            "ASSERTIVENESS" to 0.7,
            "COMPASSION" to 0.8,
            "CREATIVITY" to 0.6
        )
        every { personalitySystem.getAvailableTraits() } returns listOf(
            "ASSERTIVENESS", "COMPASSION", "CREATIVITY", "PATIENCE"
        )
        
        // Create the connector with mocked dependencies
        connector = PersonalityEvolutionConnector(
            context = context,
            personalitySystem = personalitySystem,
            memorySystem = memorySystem,
            learningEngine = learningEngine
        )
        
        // Mock the file operations
        val evolutionDataFile = File("/test/files", "personality_evolution.json")
        every { File(filesDir, "personality_evolution.json") } returns evolutionDataFile
        every { evolutionDataFile.exists() } returns false
        every { evolutionDataFile.readText() } returns ""
        every { evolutionDataFile.writeText(any()) } just Runs
    }
    
    @Test
    fun `getEvolutionData should generate fresh data when file doesn't exist`() = runBlocking {
        // Mock memory system responses
        val traitRecords = listOf(
            MemoryRecord(
                id = "trait1",
                content = "Personality trait change",
                timestamp = System.currentTimeMillis() - 3000,
                category = "PERSONALITY_EVOLUTION",
                metadata = mapOf(
                    "traits" to mapOf(
                        "ASSERTIVENESS" to 0.65,
                        "COMPASSION" to 0.75
                    )
                )
            ),
            MemoryRecord(
                id = "trait2",
                content = "Another trait change",
                timestamp = System.currentTimeMillis() - 2000,
                category = "TRAIT_CHANGE",
                metadata = mapOf(
                    "traits" to mapOf(
                        "ASSERTIVENESS" to 0.7,
                        "COMPASSION" to 0.8
                    )
                )
            )
        )
        
        val contextChanges = listOf(
            MemoryRecord(
                id = "context1",
                content = "Context change to Work",
                timestamp = System.currentTimeMillis() - 5000,
                category = "CONTEXT_CHANGE",
                metadata = mapOf(
                    "context" to "Work",
                    "description" to "Context changed to Work environment"
                )
            )
        )
        
        val insights = listOf(
            Insight(
                id = "insight1",
                timestamp = System.currentTimeMillis() - 4000,
                description = "User prefers assertive responses in work contexts",
                confidence = 0.85,
                category = "PERSONALITY"
            )
        )
        
        // Configure mock responses
        coEvery { 
            memorySystem.query(
                match = "personality trait change",
                limit = 100,
                categories = listOf("PERSONALITY_EVOLUTION", "TRAIT_CHANGE")
            ) 
        } returns traitRecords
        
        coEvery { 
            memorySystem.query(
                match = "context change",
                limit = 20,
                categories = listOf("CONTEXT_CHANGE", "ENVIRONMENT_SHIFT")
            ) 
        } returns contextChanges
        
        coEvery { 
            learningEngine.getInsights(limit = 5)
        } returns insights
        
        // Call the method
        val result = connector.getEvolutionData()
        
        // Verify the result
        assertNotNull(result)
        assertTrue(result.traitData.isNotEmpty())
        assertTrue(result.events.isNotEmpty())
        
        // Verify trait data points were generated
        assertEquals(4, result.traitData.size) // 2 traits from 2 records
        
        // Verify events were generated
        val eventTypes = result.events.map { it.type }
        assertTrue(eventTypes.contains("CONTEXT_CHANGE"))
        assertTrue(eventTypes.contains("LEARNING_INSIGHT"))
        
        // Verify the interactions
        coVerify { memorySystem.query(any(), any(), any()) }
        coVerify { learningEngine.getInsights(any()) }
    }
    
    @Test
    fun `recordCurrentState should store current traits`() = runBlocking {
        // Setup mocks
        val currentTimestamp = System.currentTimeMillis()
        
        // Empty evolution data for the first call
        coEvery { connector.getEvolutionData() } returns PersonalityEvolutionData(
            traitData = emptyList(),
            events = emptyList()
        )
        
        // Mock the memory store operation
        coEvery { 
            memorySystem.store(
                content = any(), 
                category = any(), 
                metadata = any()
            ) 
        } just Runs
        
        // Call the method
        connector.recordCurrentState()
        
        // Verify memory storage was called
        coVerify { 
            memorySystem.store(
                content = "Personality state snapshot",
                category = "PERSONALITY_EVOLUTION",
                metadata = match { 
                    it.containsKey("traits") && it.containsKey("timestamp")
                }
            )
        }
    }
    
    @Test
    fun `recordContextChange should add event and store in memory`() = runBlocking {
        // Setup mocks
        val currentTimestamp = System.currentTimeMillis()
        
        // Empty evolution data for the first call
        coEvery { connector.getEvolutionData() } returns PersonalityEvolutionData(
            traitData = emptyList(),
            events = emptyList()
        )
        
        // Mock the memory store operation
        coEvery { 
            memorySystem.store(
                content = any(), 
                category = any(), 
                metadata = any()
            ) 
        } just Runs
        
        // Call the method
        connector.recordContextChange("Work environment")
        
        // Verify memory storage was called
        coVerify { 
            memorySystem.store(
                content = "Context changed to Work environment",
                category = "CONTEXT_CHANGE",
                metadata = match { 
                    it["context"] == "Work environment" && 
                    it["description"] == "Context changed to Work environment" &&
                    it.containsKey("timestamp")
                }
            )
        }
    }
}

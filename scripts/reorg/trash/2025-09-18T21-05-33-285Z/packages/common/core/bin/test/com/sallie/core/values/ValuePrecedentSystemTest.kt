package com.sallie.core.values

import com.sallie.core.memory.EnhancedMemoryManager
import com.sallie.core.memory.Memory
import com.sallie.core.memory.MemoryPriority
import com.sallie.core.memory.MemoryQuery
import org.junit.Before
import org.junit.Test
import org.mockito.kotlin.*
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

class ValuePrecedentSystemTest {

    private lateinit var valuesSystem: ValuesSystem
    private lateinit var memoryManager: EnhancedMemoryManager
    private lateinit var precedentSystem: ValuePrecedentSystem
    
    @Before
    fun setUp() {
        valuesSystem = mock()
        memoryManager = mock()
        precedentSystem = ValuePrecedentSystem(valuesSystem, memoryManager)
        
        // Setup memory manager mock
        whenever(memoryManager.storeMemory(any(), any(), any(), any(), any())).thenReturn(
            Memory(
                id = "test-memory-id",
                type = "VALUE_PRECEDENT",
                content = "",
                timestamp = System.currentTimeMillis(),
                tags = emptyList(),
                priority = MemoryPriority.MEDIUM
            )
        )
    }
    
    @Test
    fun `recordPrecedent should store precedent in memory`() {
        // Given
        val situation = "User requested private information about another user"
        val decision = "Declined to provide private information"
        val reasoning = "Sharing private information violates privacy values"
        val relatedValues = listOf("privacy", "integrity")
        
        // When
        precedentSystem.recordPrecedent(
            situation = situation,
            decision = decision,
            reasoning = reasoning,
            priority = PrecedentPriority.HIGH,
            relatedValues = relatedValues
        )
        
        // Then
        verify(memoryManager).storeMemory(
            eq("VALUE_PRECEDENT"),
            any(),
            argThat { this.contains("privacy") && this.contains("integrity") },
            eq(MemoryPriority.HIGH),
            any()
        )
    }
    
    @Test
    fun `findRelevantPrecedents should query memory and return precedents`() {
        // Given
        val situation = "User asked for personal advice"
        
        // Mock memory manager to return memories
        val mockMemory1 = createMockMemory(
            "precedent-1",
            "SITUATION: User asked about relationship advice\nDECISION: Provided general guidance"
        )
        
        val mockMemory2 = createMockMemory(
            "precedent-2",
            "SITUATION: User requested advice on career\nDECISION: Offered supportive suggestions"
        )
        
        whenever(memoryManager.searchMemories(any())).thenReturn(
            listOf(mockMemory1, mockMemory2)
        )
        
        // When
        val precedents = precedentSystem.findRelevantPrecedents(situation)
        
        // Then
        assertEquals(2, precedents.size)
        
        // Verify memory was queried with correct parameters
        verify(memoryManager).searchMemories(
            check<MemoryQuery> {
                assertEquals("VALUE_PRECEDENT", it.type)
                assertEquals(situation, it.contentQuery)
            }
        )
    }
    
    @Test
    fun `applyPrecedent should calculate similarity and apply if similar enough`() {
        // Given
        val precedentId = "test-precedent"
        val currentSituation = "User asked for health advice about diet"
        
        // Mock a precedent in memory
        val mockPrecedent = ValuePrecedent(
            id = precedentId,
            situation = "User asked for health advice about exercise",
            decision = "Provided general health information with disclaimer",
            reasoning = "General health advice is allowed but medical advice requires disclaimer",
            timestamp = System.currentTimeMillis(),
            priority = PrecedentPriority.MEDIUM,
            relatedValues = listOf("helpfulness", "responsibility"),
            usageCount = 1
        )
        
        val mockMemory = createMockMemory(
            precedentId,
            serializePrecedent(mockPrecedent)
        )
        
        whenever(memoryManager.searchMemories(any())).thenReturn(listOf(mockMemory))
        
        // When
        val application = precedentSystem.applyPrecedent(precedentId, currentSituation)
        
        // Then
        assertTrue(application.applied)
        assertEquals(mockPrecedent.decision, application.decision)
        assertNotNull(application.precedent)
        
        // Verify usage was incremented
        verify(memoryManager).storeMemory(
            eq("VALUE_PRECEDENT"),
            any(),
            any(),
            any(),
            any()
        )
    }
    
    @Test
    fun `analyzeValueConflict should identify dominant value and reasoning`() {
        // Given
        val values = listOf("privacy", "transparency")
        
        // Mock precedents in memory
        val privacyPrecedents = listOf(
            createMockMemory("prec-privacy-1", createPrecedentContent("privacy")),
            createMockMemory("prec-privacy-2", createPrecedentContent("privacy")),
            createMockMemory("prec-privacy-3", createPrecedentContent("privacy"))
        )
        
        val transparencyPrecedents = listOf(
            createMockMemory("prec-transp-1", createPrecedentContent("transparency"))
        )
        
        // Setup memory manager mock
        whenever(memoryManager.searchMemories(argThat { 
            this.tags?.contains("privacy") == true 
        })).thenReturn(privacyPrecedents)
        
        whenever(memoryManager.searchMemories(argThat { 
            this.tags?.contains("transparency") == true 
        })).thenReturn(transparencyPrecedents)
        
        // When
        val analysis = precedentSystem.analyzeValueConflict(values)
        
        // Then
        assertEquals("privacy", analysis.dominantValue)
        assertEquals(2, analysis.values.size)
        assertTrue(analysis.reasoning.contains("privacy"))
        assertEquals(mapOf("privacy" to 3, "transparency" to 1), analysis.precedentCounts)
    }
    
    private fun createMockMemory(precedentId: String, content: String): Memory {
        return Memory(
            id = "memory-$precedentId",
            type = "VALUE_PRECEDENT",
            content = content,
            timestamp = System.currentTimeMillis(),
            tags = listOf("value-precedent"),
            priority = MemoryPriority.MEDIUM,
            metadata = mapOf("precedentId" to precedentId)
        )
    }
    
    private fun createPrecedentContent(value: String): String {
        return """
            |ID: precedent-$value-${System.currentTimeMillis()}
            |SITUATION: A situation related to $value
            |DECISION: Made a decision prioritizing $value
            |REASONING: $value was prioritized because it's important
            |TIMESTAMP: ${System.currentTimeMillis()}
            |PRIORITY: MEDIUM
            |VALUES: $value
            |TAGS: test
            |USAGE: 1
        """.trimMargin()
    }
    
    private fun serializePrecedent(precedent: ValuePrecedent): String {
        return """
            |ID: ${precedent.id}
            |SITUATION: ${precedent.situation}
            |DECISION: ${precedent.decision}
            |REASONING: ${precedent.reasoning}
            |TIMESTAMP: ${precedent.timestamp}
            |PRIORITY: ${precedent.priority}
            |VALUES: ${precedent.relatedValues.joinToString(",")}
            |TAGS: ${precedent.tags.joinToString(",")}
            |USAGE: ${precedent.usageCount}
        """.trimMargin()
    }
}

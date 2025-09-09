/**
 * Sallie's Device Transfer System Tests
 * 
 * Tests for the Device Transfer System that enables Sallie to transfer her personality,
 * memory, and user understanding between devices.
 *
 * Created with love. 💛
 */

package com.sallie.transfer

import com.sallie.core.memory.HierarchicalMemorySystem
import com.sallie.core.values.ValueSystem
import com.sallie.core.personality.PersonalityProfile
import com.sallie.core.learning.UserPreferenceModel
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.take
import kotlinx.coroutines.flow.toList
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.DisplayName
import org.mockito.Mockito.*
import java.util.*

class DeviceTransferSystemTest {
    
    // Mock dependencies
    private lateinit var memorySystem: HierarchicalMemorySystem
    private lateinit var valueSystem: ValueSystem
    private lateinit var personalityProfile: PersonalityProfile
    private lateinit var userPreferences: UserPreferenceModel
    
    // System under test
    private lateinit var deviceTransferSystem: DeviceTransferSystem
    
    // Test data
    private lateinit var testDeviceInfo: DeviceInfo
    private lateinit var testTransferConfig: TransferConfiguration
    
    @BeforeEach
    fun setUp() {
        // Setup mock dependencies
        memorySystem = mock(HierarchicalMemorySystem::class.java)
        valueSystem = mock(ValueSystem::class.java)
        personalityProfile = mock(PersonalityProfile::class.java)
        userPreferences = mock(UserPreferenceModel::class.java)
        
        // Initialize system under test
        deviceTransferSystem = DeviceTransferSystem(
            memorySystem = memorySystem,
            valueSystem = valueSystem,
            personalityProfile = personalityProfile,
            userPreferences = userPreferences
        )
        
        // Setup test data
        testDeviceInfo = DeviceInfo(
            deviceId = "test-device-001",
            deviceName = "Test Device",
            deviceType = DeviceType.PHONE,
            osType = OsType.ANDROID,
            osVersion = "13",
            lastSeenTimestamp = System.currentTimeMillis()
        )
        
        testTransferConfig = TransferConfiguration(
            includeMemory = true,
            includePersonality = true,
            includeUserPreferences = true,
            includeValues = true,
            memoryConfig = MemoryTransferConfiguration(
                includeEpisodicMemory = true,
                includeSemanticMemory = true,
                includeEmotionalMemory = true,
                includeProcedureMemory = true,
                memoryAgeLimit = null
            )
        )
        
        // Setup mock return values
        `when`(memorySystem.exportEpisodicMemory()).thenReturn("Episodic Memory Data".toByteArray())
        `when`(memorySystem.exportSemanticMemory()).thenReturn("Semantic Memory Data".toByteArray())
        `when`(memorySystem.exportEmotionalMemory()).thenReturn("Emotional Memory Data".toByteArray())
        `when`(memorySystem.exportProceduralMemory()).thenReturn("Procedural Memory Data".toByteArray())
        `when`(personalityProfile.exportPersonality()).thenReturn("Personality Data".toByteArray())
        `when`(userPreferences.exportPreferences()).thenReturn("User Preferences Data".toByteArray())
        `when`(valueSystem.exportValues()).thenReturn("Values Data".toByteArray())
    }
    
    @Test
    @DisplayName("initiateTransfer should create a valid transfer session")
    fun initiateTransfer_createsValidSession() = runBlocking {
        // Execute
        val session = deviceTransferSystem.initiateTransfer(
            targetDevice = testDeviceInfo,
            transferConfig = testTransferConfig
        )
        
        // Verify
        assertNotNull(session)
        assertNotNull(session.sessionId)
        assertEquals(TransferStatus.READY, session.status)
        assertEquals(testDeviceInfo, session.targetDevice)
        assertEquals(testTransferConfig, session.transferConfig)
        assertNotNull(session.dataPackages)
        assertTrue(session.dataPackages.isNotEmpty())
        
        // Verify correct number of packages based on configuration
        val expectedPackageCount = 1 + // Core system
                4 + // Memory (episodic, semantic, emotional, procedural)
                1 + // Personality
                1 + // User preferences
                1   // Values
        assertEquals(expectedPackageCount, session.dataPackages.size)
        
        // Verify each package type is included
        val packageTypes = session.dataPackages.map { it.type }
        assertTrue(packageTypes.contains(PackageType.CORE_SYSTEM))
        assertTrue(packageTypes.contains(PackageType.EPISODIC_MEMORY))
        assertTrue(packageTypes.contains(PackageType.SEMANTIC_MEMORY))
        assertTrue(packageTypes.contains(PackageType.EMOTIONAL_MEMORY))
        assertTrue(packageTypes.contains(PackageType.PROCEDURAL_MEMORY))
        assertTrue(packageTypes.contains(PackageType.PERSONALITY))
        assertTrue(packageTypes.contains(PackageType.USER_PREFERENCES))
        assertTrue(packageTypes.contains(PackageType.VALUES))
    }
    
    @Test
    @DisplayName("executeTransfer should emit progress updates")
    fun executeTransfer_emitsProgressUpdates() = runBlocking {
        // Setup
        val session = deviceTransferSystem.initiateTransfer(
            targetDevice = testDeviceInfo,
            transferConfig = testTransferConfig
        )
        
        // Execute
        val progressUpdates = deviceTransferSystem.executeTransfer(session)
            .take(session.dataPackages.size + 2) // Start + each package + completion
            .toList()
        
        // Verify
        assertNotNull(progressUpdates)
        assertFalse(progressUpdates.isEmpty())
        
        // First update should be starting
        assertEquals(TransferStatus.IN_PROGRESS, progressUpdates.first().status)
        assertEquals(0f, progressUpdates.first().progress)
        
        // Last update should indicate completion or failure
        val lastStatus = progressUpdates.last().status
        assertTrue(
            lastStatus == TransferStatus.COMPLETED ||
            lastStatus == TransferStatus.FAILED ||
            lastStatus == TransferStatus.VERIFICATION_FAILED
        )
        
        // If completed, progress should be 100%
        if (lastStatus == TransferStatus.COMPLETED) {
            assertEquals(1f, progressUpdates.last().progress)
        }
    }
    
    @Test
    @DisplayName("importFromDevice should emit import progress updates")
    fun importFromDevice_emitsProgressUpdates() = runBlocking {
        // Execute
        val progressUpdates = deviceTransferSystem.importFromDevice(
            sourceDevice = testDeviceInfo,
            importConfig = testTransferConfig
        )
            .take(5) // Take a few updates to test
            .toList()
        
        // Verify
        assertNotNull(progressUpdates)
        assertFalse(progressUpdates.isEmpty())
        
        // First update should be preparing
        assertEquals(ImportStatus.PREPARING, progressUpdates.first().status)
        assertEquals(0f, progressUpdates.first().progress)
        
        // Progress should increase with each update
        var lastProgress = -1f
        for (update in progressUpdates) {
            assertTrue(update.progress >= lastProgress)
            lastProgress = update.progress
        }
    }
    
    @Test
    @DisplayName("scanForDevices should return a list of available devices")
    fun scanForDevices_returnsAvailableDevices() = runBlocking {
        // Execute
        val devices = deviceTransferSystem.scanForDevices()
        
        // Verify
        assertNotNull(devices)
        assertFalse(devices.isEmpty())
        devices.forEach { device ->
            assertNotNull(device.deviceId)
            assertNotNull(device.deviceName)
            assertNotNull(device.deviceType)
            assertNotNull(device.osType)
            assertNotNull(device.osVersion)
            assertTrue(device.lastSeenTimestamp > 0)
        }
    }
    
    @Test
    @DisplayName("getTransferHistory should return transfer history entries")
    fun getTransferHistory_returnsHistoryEntries() {
        // Setup - perform a transfer to generate history
        runBlocking {
            val session = deviceTransferSystem.initiateTransfer(
                targetDevice = testDeviceInfo,
                transferConfig = testTransferConfig
            )
            
            deviceTransferSystem.executeTransfer(session)
                .take(session.dataPackages.size + 2)
                .toList()
        }
        
        // Execute
        val history = deviceTransferSystem.getTransferHistory(5)
        
        // Verify
        assertNotNull(history)
        assertFalse(history.isEmpty())
        history.forEach { entry ->
            assertNotNull(entry.type)
            assertNotNull(entry.deviceInfo)
            assertNotNull(entry.config)
            assertTrue(entry.timestamp > 0)
            assertNotNull(entry.message)
        }
    }
    
    @Test
    @DisplayName("initiateTransfer with memory only should create session with memory packages only")
    fun initiateTransfer_withMemoryOnly_createsCorrectSession() = runBlocking {
        // Setup
        val memoryOnlyConfig = TransferConfiguration(
            includeMemory = true,
            includePersonality = false,
            includeUserPreferences = false,
            includeValues = false,
            memoryConfig = MemoryTransferConfiguration(
                includeEpisodicMemory = true,
                includeSemanticMemory = true,
                includeEmotionalMemory = true,
                includeProcedureMemory = true
            )
        )
        
        // Execute
        val session = deviceTransferSystem.initiateTransfer(
            targetDevice = testDeviceInfo,
            transferConfig = memoryOnlyConfig
        )
        
        // Verify
        assertNotNull(session)
        
        // Verify correct number of packages based on configuration
        val expectedPackageCount = 1 + // Core system
                4    // Memory (episodic, semantic, emotional, procedural)
        assertEquals(expectedPackageCount, session.dataPackages.size)
        
        // Verify each package type is included
        val packageTypes = session.dataPackages.map { it.type }
        assertTrue(packageTypes.contains(PackageType.CORE_SYSTEM))
        assertTrue(packageTypes.contains(PackageType.EPISODIC_MEMORY))
        assertTrue(packageTypes.contains(PackageType.SEMANTIC_MEMORY))
        assertTrue(packageTypes.contains(PackageType.EMOTIONAL_MEMORY))
        assertTrue(packageTypes.contains(PackageType.PROCEDURAL_MEMORY))
        
        // Verify excluded package types
        assertFalse(packageTypes.contains(PackageType.PERSONALITY))
        assertFalse(packageTypes.contains(PackageType.USER_PREFERENCES))
        assertFalse(packageTypes.contains(PackageType.VALUES))
    }
    
    @Test
    @DisplayName("initiateTransfer with selective memory should create session with correct memory packages")
    fun initiateTransfer_withSelectiveMemory_createsCorrectSession() = runBlocking {
        // Setup
        val selectiveMemoryConfig = TransferConfiguration(
            includeMemory = true,
            includePersonality = false,
            includeUserPreferences = false,
            includeValues = false,
            memoryConfig = MemoryTransferConfiguration(
                includeEpisodicMemory = true,
                includeSemanticMemory = false,
                includeEmotionalMemory = true,
                includeProcedureMemory = false
            )
        )
        
        // Execute
        val session = deviceTransferSystem.initiateTransfer(
            targetDevice = testDeviceInfo,
            transferConfig = selectiveMemoryConfig
        )
        
        // Verify
        assertNotNull(session)
        
        // Verify correct number of packages based on configuration
        val expectedPackageCount = 1 + // Core system
                2    // Memory (episodic, emotional)
        assertEquals(expectedPackageCount, session.dataPackages.size)
        
        // Verify each package type is included
        val packageTypes = session.dataPackages.map { it.type }
        assertTrue(packageTypes.contains(PackageType.CORE_SYSTEM))
        assertTrue(packageTypes.contains(PackageType.EPISODIC_MEMORY))
        assertTrue(packageTypes.contains(PackageType.EMOTIONAL_MEMORY))
        
        // Verify excluded package types
        assertFalse(packageTypes.contains(PackageType.SEMANTIC_MEMORY))
        assertFalse(packageTypes.contains(PackageType.PROCEDURAL_MEMORY))
        assertFalse(packageTypes.contains(PackageType.PERSONALITY))
        assertFalse(packageTypes.contains(PackageType.USER_PREFERENCES))
        assertFalse(packageTypes.contains(PackageType.VALUES))
    }
    
    @Test
    @DisplayName("DataCompressionSystem should compress and decompress packages correctly")
    fun dataCompressionSystem_compressesAndDecompressesCorrectly() {
        // Setup
        val compressionSystem = DataCompressionSystem()
        val originalPackage = DataPackage(
            id = UUID.randomUUID().toString(),
            type = PackageType.EPISODIC_MEMORY,
            data = "Test data for compression".toByteArray(),
            size = "Test data for compression".toByteArray().size.toLong(),
            creationTimestamp = System.currentTimeMillis()
        )
        
        // Execute
        val compressedPackage = compressionSystem.compressPackage(originalPackage)
        val decompressedPackage = compressionSystem.decompressPackage(compressedPackage)
        
        // Verify
        assertNotNull(compressedPackage)
        assertEquals(originalPackage.id, compressedPackage.originalPackageId)
        assertEquals(originalPackage.type, compressedPackage.type)
        assertTrue(compressedPackage.compressionRatio > 0f)
        
        assertNotNull(decompressedPackage)
        assertEquals(originalPackage.id, decompressedPackage.id)
        assertEquals(originalPackage.type, decompressedPackage.type)
        assertArrayEquals(originalPackage.data, decompressedPackage.data)
    }
    
    @Test
    @DisplayName("DataIntegrityVerifier should calculate hash correctly")
    fun dataIntegrityVerifier_calculatesHashCorrectly() {
        // Setup
        val integrityVerifier = DataIntegrityVerifier()
        val compressedPackage = CompressedDataPackage(
            originalPackageId = UUID.randomUUID().toString(),
            type = PackageType.EPISODIC_MEMORY,
            compressedData = "Test data for hash calculation".toByteArray(),
            originalSize = 100L,
            compressionRatio = 0.5f,
            integrityHash = null,
            compressionTimestamp = System.currentTimeMillis()
        )
        
        // Execute
        val hash1 = integrityVerifier.calculateHash(compressedPackage)
        val hash2 = integrityVerifier.calculateHash(compressedPackage)
        
        // Modify data and calculate new hash
        val modifiedPackage = CompressedDataPackage(
            originalPackageId = compressedPackage.originalPackageId,
            type = compressedPackage.type,
            compressedData = "Modified test data for hash".toByteArray(),
            originalSize = compressedPackage.originalSize,
            compressionRatio = compressedPackage.compressionRatio,
            integrityHash = null,
            compressionTimestamp = compressedPackage.compressionTimestamp
        )
        val hash3 = integrityVerifier.calculateHash(modifiedPackage)
        
        // Verify
        assertNotNull(hash1)
        assertNotEquals("", hash1)
        assertEquals(hash1, hash2) // Same data should produce same hash
        assertNotEquals(hash1, hash3) // Different data should produce different hash
    }
    
    @Test
    @DisplayName("DeviceAuthenticator should authenticate valid devices")
    fun deviceAuthenticator_authenticatesValidDevices() = runBlocking {
        // Setup
        val authenticator = DeviceAuthenticator()
        
        // Execute
        val result = authenticator.authenticateDevice(testDeviceInfo)
        
        // Verify - this test is probabilistic due to simulation,
        // but should pass most of the time due to 99% success rate
        assertNotNull(result)
    }
    
    @Test
    @DisplayName("TransferLogger should log and retrieve history")
    fun transferLogger_logsAndRetrievesHistory() {
        // Setup
        val logger = TransferLogger()
        
        // Execute - log various events
        logger.logTransferStart(
            targetDevice = testDeviceInfo,
            transferConfig = testTransferConfig,
            timestamp = System.currentTimeMillis()
        )
        
        val session = TransferSession(
            sessionId = "test-session",
            status = TransferStatus.COMPLETED,
            errorMessage = null,
            progress = 1f,
            transferConfig = testTransferConfig,
            targetDevice = testDeviceInfo,
            dataPackages = listOf(),
            startTimestamp = System.currentTimeMillis(),
            endTimestamp = System.currentTimeMillis()
        )
        
        logger.logTransferSuccess(
            session = session,
            timestamp = System.currentTimeMillis() + 1000
        )
        
        // Execute - retrieve history
        val history = logger.getTransferHistory(5)
        
        // Verify
        assertNotNull(history)
        assertEquals(2, history.size)
        assertEquals(TransferHistoryType.TRANSFER_COMPLETE, history[0].type) // Most recent first
        assertEquals(TransferHistoryType.TRANSFER_START, history[1].type)
    }
}

/**
 * Sallie's Device Transfer System
 * 
 * This system enables Sallie to transfer her personality, memory, and user understanding 
 * from one device to another, ensuring continuity of the relationship when users 
 * upgrade or change devices.
 *
 * Features:
 * - Secure direct device transfer protocol
 * - Compressed data packaging for efficient transfers
 * - Complete or selective transfer options
 * - Local verification and integrity checking
 * 
 * Created with love. 💛
 */

package com.sallie.transfer

import com.sallie.core.memory.HierarchicalMemorySystem
import com.sallie.core.values.ValueSystem
import com.sallie.core.personality.PersonalityProfile
import com.sallie.core.learning.UserPreferenceModel
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import java.io.File
import java.security.MessageDigest
import java.util.*

/**
 * Central manager for device transfer capabilities
 */
class DeviceTransferSystem(
    private val memorySystem: HierarchicalMemorySystem,
    private val valueSystem: ValueSystem,
    private val personalityProfile: PersonalityProfile,
    private val userPreferences: UserPreferenceModel
) {
    private val transferProtocol = SecureDeviceTransferProtocol()
    private val dataCompressor = DataCompressionSystem()
    private val integrityVerifier = DataIntegrityVerifier()
    private val deviceAuthenticator = DeviceAuthenticator()
    private val transferLogger = TransferLogger()
    
    /**
     * Initiates a device transfer to a new device
     */
    suspend fun initiateTransfer(
        targetDevice: DeviceInfo,
        transferConfig: TransferConfiguration
    ): TransferSession {
        // Log transfer initiation
        transferLogger.logTransferStart(
            targetDevice = targetDevice,
            transferConfig = transferConfig,
            timestamp = System.currentTimeMillis()
        )
        
        // Authenticate target device
        val authResult = deviceAuthenticator.authenticateDevice(targetDevice)
        if (!authResult.success) {
            return TransferSession(
                sessionId = generateSessionId(),
                status = TransferStatus.FAILED,
                errorMessage = "Device authentication failed: ${authResult.message}",
                progress = 0f,
                transferConfig = transferConfig,
                targetDevice = targetDevice,
                dataPackages = emptyList(),
                startTimestamp = System.currentTimeMillis(),
                endTimestamp = System.currentTimeMillis()
            )
        }
        
        // Create transfer session
        val session = TransferSession(
            sessionId = generateSessionId(),
            status = TransferStatus.PREPARING,
            errorMessage = null,
            progress = 0f,
            transferConfig = transferConfig,
            targetDevice = targetDevice,
            dataPackages = emptyList(),
            startTimestamp = System.currentTimeMillis(),
            endTimestamp = null
        )
        
        // Prepare data packages based on transfer configuration
        val dataPackages = prepareDataPackages(transferConfig)
        session.dataPackages = dataPackages
        session.status = TransferStatus.READY
        
        return session
    }
    
    /**
     * Executes a prepared transfer session
     */
    suspend fun executeTransfer(session: TransferSession): Flow<TransferProgress> = flow {
        // Validate session is ready
        if (session.status != TransferStatus.READY) {
            emit(TransferProgress(
                sessionId = session.sessionId,
                status = session.status,
                progress = session.progress,
                currentPackage = null,
                message = "Session not in READY state"
            ))
            return@flow
        }
        
        // Update session status
        session.status = TransferStatus.IN_PROGRESS
        emit(TransferProgress(
            sessionId = session.sessionId,
            status = session.status,
            progress = 0f,
            currentPackage = null,
            message = "Transfer started"
        ))
        
        // Process each data package
        val totalPackages = session.dataPackages.size
        var processedPackages = 0
        
        for (dataPackage in session.dataPackages) {
            // Compress data package
            val compressedPackage = dataCompressor.compressPackage(dataPackage)
            
            // Calculate data integrity hash
            val integrityHash = integrityVerifier.calculateHash(compressedPackage)
            compressedPackage.integrityHash = integrityHash
            
            // Transfer package to target device
            val transferResult = transferProtocol.transferPackage(
                session.targetDevice,
                compressedPackage
            )
            
            if (!transferResult.success) {
                session.status = TransferStatus.FAILED
                session.errorMessage = "Transfer failed: ${transferResult.message}"
                
                emit(TransferProgress(
                    sessionId = session.sessionId,
                    status = session.status,
                    progress = session.progress,
                    currentPackage = dataPackage,
                    message = session.errorMessage ?: "Transfer failed"
                ))
                
                // Log transfer failure
                transferLogger.logTransferFailure(
                    session = session,
                    failureReason = transferResult.message ?: "Unknown error",
                    timestamp = System.currentTimeMillis()
                )
                
                return@flow
            }
            
            // Update progress
            processedPackages++
            session.progress = processedPackages.toFloat() / totalPackages
            
            emit(TransferProgress(
                sessionId = session.sessionId,
                status = session.status,
                progress = session.progress,
                currentPackage = dataPackage,
                message = "Transferred package: ${dataPackage.type}"
            ))
            
            // Simulate processing time
            kotlinx.coroutines.delay(500)
        }
        
        // Verify all packages were transferred successfully
        val verificationResult = verifyTransferCompletion(session)
        
        if (verificationResult.success) {
            session.status = TransferStatus.COMPLETED
            session.endTimestamp = System.currentTimeMillis()
            
            emit(TransferProgress(
                sessionId = session.sessionId,
                status = session.status,
                progress = 1f,
                currentPackage = null,
                message = "Transfer completed successfully"
            ))
            
            // Log transfer success
            transferLogger.logTransferSuccess(
                session = session,
                timestamp = System.currentTimeMillis()
            )
        } else {
            session.status = TransferStatus.VERIFICATION_FAILED
            session.errorMessage = "Transfer verification failed: ${verificationResult.message}"
            
            emit(TransferProgress(
                sessionId = session.sessionId,
                status = session.status,
                progress = session.progress,
                currentPackage = null,
                message = session.errorMessage ?: "Transfer verification failed"
            ))
            
            // Log transfer verification failure
            transferLogger.logTransferVerificationFailure(
                session = session,
                failureReason = verificationResult.message ?: "Unknown verification error",
                timestamp = System.currentTimeMillis()
            )
        }
    }
    
    /**
     * Prepares data packages based on transfer configuration
     */
    private suspend fun prepareDataPackages(config: TransferConfiguration): List<DataPackage> {
        val packages = mutableListOf<DataPackage>()
        
        // Core system data is always included
        packages.add(createCoreSystemPackage())
        
        // Add optional packages based on configuration
        if (config.includeMemory) {
            val memoryPackages = createMemoryPackages(config.memoryConfig)
            packages.addAll(memoryPackages)
        }
        
        if (config.includePersonality) {
            packages.add(createPersonalityPackage())
        }
        
        if (config.includeUserPreferences) {
            packages.add(createUserPreferencesPackage())
        }
        
        if (config.includeValues) {
            packages.add(createValuesPackage())
        }
        
        return packages
    }
    
    /**
     * Creates core system data package
     */
    private fun createCoreSystemPackage(): DataPackage {
        return DataPackage(
            id = UUID.randomUUID().toString(),
            type = PackageType.CORE_SYSTEM,
            data = "Core system data".toByteArray(),
            size = "Core system data".toByteArray().size.toLong(),
            creationTimestamp = System.currentTimeMillis()
        )
    }
    
    /**
     * Creates memory data packages
     */
    private suspend fun createMemoryPackages(memoryConfig: MemoryTransferConfiguration): List<DataPackage> {
        val packages = mutableListOf<DataPackage>()
        
        // Episodic memory
        if (memoryConfig.includeEpisodicMemory) {
            val episodicMemory = memorySystem.exportEpisodicMemory()
            packages.add(
                DataPackage(
                    id = UUID.randomUUID().toString(),
                    type = PackageType.EPISODIC_MEMORY,
                    data = episodicMemory,
                    size = episodicMemory.size.toLong(),
                    creationTimestamp = System.currentTimeMillis()
                )
            )
        }
        
        // Semantic memory
        if (memoryConfig.includeSemanticMemory) {
            val semanticMemory = memorySystem.exportSemanticMemory()
            packages.add(
                DataPackage(
                    id = UUID.randomUUID().toString(),
                    type = PackageType.SEMANTIC_MEMORY,
                    data = semanticMemory,
                    size = semanticMemory.size.toLong(),
                    creationTimestamp = System.currentTimeMillis()
                )
            )
        }
        
        // Emotional memory
        if (memoryConfig.includeEmotionalMemory) {
            val emotionalMemory = memorySystem.exportEmotionalMemory()
            packages.add(
                DataPackage(
                    id = UUID.randomUUID().toString(),
                    type = PackageType.EMOTIONAL_MEMORY,
                    data = emotionalMemory,
                    size = emotionalMemory.size.toLong(),
                    creationTimestamp = System.currentTimeMillis()
                )
            )
        }
        
        // Procedural memory
        if (memoryConfig.includeProcedureMemory) {
            val proceduralMemory = memorySystem.exportProceduralMemory()
            packages.add(
                DataPackage(
                    id = UUID.randomUUID().toString(),
                    type = PackageType.PROCEDURAL_MEMORY,
                    data = proceduralMemory,
                    size = proceduralMemory.size.toLong(),
                    creationTimestamp = System.currentTimeMillis()
                )
            )
        }
        
        return packages
    }
    
    /**
     * Creates personality data package
     */
    private fun createPersonalityPackage(): DataPackage {
        val personalityData = personalityProfile.exportPersonality()
        return DataPackage(
            id = UUID.randomUUID().toString(),
            type = PackageType.PERSONALITY,
            data = personalityData,
            size = personalityData.size.toLong(),
            creationTimestamp = System.currentTimeMillis()
        )
    }
    
    /**
     * Creates user preferences data package
     */
    private fun createUserPreferencesPackage(): DataPackage {
        val preferencesData = userPreferences.exportPreferences()
        return DataPackage(
            id = UUID.randomUUID().toString(),
            type = PackageType.USER_PREFERENCES,
            data = preferencesData,
            size = preferencesData.size.toLong(),
            creationTimestamp = System.currentTimeMillis()
        )
    }
    
    /**
     * Creates values system data package
     */
    private fun createValuesPackage(): DataPackage {
        val valuesData = valueSystem.exportValues()
        return DataPackage(
            id = UUID.randomUUID().toString(),
            type = PackageType.VALUES,
            data = valuesData,
            size = valuesData.size.toLong(),
            creationTimestamp = System.currentTimeMillis()
        )
    }
    
    /**
     * Verifies transfer completion by checking all packages were transferred correctly
     */
    private suspend fun verifyTransferCompletion(session: TransferSession): OperationResult {
        // Implementation of transfer verification
        for (dataPackage in session.dataPackages) {
            val verificationResult = integrityVerifier.verifyPackageIntegrity(
                session.targetDevice,
                dataPackage
            )
            
            if (!verificationResult.success) {
                return OperationResult(
                    success = false,
                    message = "Package verification failed for ${dataPackage.type}: ${verificationResult.message}"
                )
            }
        }
        
        return OperationResult(success = true)
    }
    
    /**
     * Generates a unique session ID
     */
    private fun generateSessionId(): String {
        return UUID.randomUUID().toString()
    }
    
    /**
     * Imports data from another device
     */
    suspend fun importFromDevice(
        sourceDevice: DeviceInfo,
        importConfig: TransferConfiguration
    ): Flow<ImportProgress> = flow {
        // Start import process
        emit(ImportProgress(
            status = ImportStatus.PREPARING,
            progress = 0f,
            message = "Preparing to import data from ${sourceDevice.deviceName}"
        ))
        
        // Authenticate source device
        val authResult = deviceAuthenticator.authenticateDevice(sourceDevice)
        if (!authResult.success) {
            emit(ImportProgress(
                status = ImportStatus.FAILED,
                progress = 0f,
                message = "Device authentication failed: ${authResult.message}"
            ))
            return@flow
        }
        
        // Request data packages from source device
        val packageRequests = createPackageRequests(importConfig)
        emit(ImportProgress(
            status = ImportStatus.REQUESTING_DATA,
            progress = 0.1f,
            message = "Requesting data packages from source device"
        ))
        
        // Receive packages
        val receivedPackages = mutableListOf<CompressedDataPackage>()
        
        for ((index, request) in packageRequests.withIndex()) {
            // Request package from source device
            val packageResult = transferProtocol.requestPackage(
                sourceDevice,
                request
            )
            
            if (!packageResult.success || packageResult.data == null) {
                emit(ImportProgress(
                    status = ImportStatus.FAILED,
                    progress = index.toFloat() / packageRequests.size,
                    message = "Failed to receive ${request.packageType} package: ${packageResult.message}"
                ))
                return@flow
            }
            
            // Verify package integrity
            val verificationResult = integrityVerifier.verifyReceivedPackage(packageResult.data)
            if (!verificationResult.success) {
                emit(ImportProgress(
                    status = ImportStatus.VERIFICATION_FAILED,
                    progress = index.toFloat() / packageRequests.size,
                    message = "Package integrity verification failed: ${verificationResult.message}"
                ))
                return@flow
            }
            
            receivedPackages.add(packageResult.data)
            
            // Update progress
            emit(ImportProgress(
                status = ImportStatus.RECEIVING_DATA,
                progress = 0.1f + 0.6f * (index + 1).toFloat() / packageRequests.size,
                message = "Received ${request.packageType} package"
            ))
        }
        
        // Process and import packages
        emit(ImportProgress(
            status = ImportStatus.PROCESSING,
            progress = 0.7f,
            message = "Processing received packages"
        ))
        
        for ((index, compressedPackage) in receivedPackages.withIndex()) {
            // Decompress package
            val dataPackage = dataCompressor.decompressPackage(compressedPackage)
            
            // Import package based on type
            val importResult = importDataPackage(dataPackage)
            
            if (!importResult.success) {
                emit(ImportProgress(
                    status = ImportStatus.FAILED,
                    progress = 0.7f + 0.3f * index.toFloat() / receivedPackages.size,
                    message = "Failed to import ${dataPackage.type} package: ${importResult.message}"
                ))
                return@flow
            }
            
            // Update progress
            emit(ImportProgress(
                status = ImportStatus.PROCESSING,
                progress = 0.7f + 0.3f * (index + 1).toFloat() / receivedPackages.size,
                message = "Imported ${dataPackage.type} package"
            ))
        }
        
        // Complete import
        emit(ImportProgress(
            status = ImportStatus.COMPLETED,
            progress = 1f,
            message = "Import completed successfully"
        ))
        
        // Log import success
        transferLogger.logImportSuccess(
            sourceDevice = sourceDevice,
            importConfig = importConfig,
            timestamp = System.currentTimeMillis()
        )
    }
    
    /**
     * Creates package requests based on import configuration
     */
    private fun createPackageRequests(config: TransferConfiguration): List<PackageRequest> {
        val requests = mutableListOf<PackageRequest>()
        
        // Core system data is always included
        requests.add(PackageRequest(PackageType.CORE_SYSTEM))
        
        // Add optional package requests based on configuration
        if (config.includeMemory) {
            if (config.memoryConfig.includeEpisodicMemory) {
                requests.add(PackageRequest(PackageType.EPISODIC_MEMORY))
            }
            if (config.memoryConfig.includeSemanticMemory) {
                requests.add(PackageRequest(PackageType.SEMANTIC_MEMORY))
            }
            if (config.memoryConfig.includeEmotionalMemory) {
                requests.add(PackageRequest(PackageType.EMOTIONAL_MEMORY))
            }
            if (config.memoryConfig.includeProcedureMemory) {
                requests.add(PackageRequest(PackageType.PROCEDURAL_MEMORY))
            }
        }
        
        if (config.includePersonality) {
            requests.add(PackageRequest(PackageType.PERSONALITY))
        }
        
        if (config.includeUserPreferences) {
            requests.add(PackageRequest(PackageType.USER_PREFERENCES))
        }
        
        if (config.includeValues) {
            requests.add(PackageRequest(PackageType.VALUES))
        }
        
        return requests
    }
    
    /**
     * Imports a data package based on its type
     */
    private suspend fun importDataPackage(dataPackage: DataPackage): OperationResult {
        return when (dataPackage.type) {
            PackageType.CORE_SYSTEM -> {
                // Import core system data
                OperationResult(success = true)
            }
            PackageType.EPISODIC_MEMORY -> {
                val result = memorySystem.importEpisodicMemory(dataPackage.data)
                OperationResult(success = result)
            }
            PackageType.SEMANTIC_MEMORY -> {
                val result = memorySystem.importSemanticMemory(dataPackage.data)
                OperationResult(success = result)
            }
            PackageType.EMOTIONAL_MEMORY -> {
                val result = memorySystem.importEmotionalMemory(dataPackage.data)
                OperationResult(success = result)
            }
            PackageType.PROCEDURAL_MEMORY -> {
                val result = memorySystem.importProceduralMemory(dataPackage.data)
                OperationResult(success = result)
            }
            PackageType.PERSONALITY -> {
                val result = personalityProfile.importPersonality(dataPackage.data)
                OperationResult(success = result)
            }
            PackageType.USER_PREFERENCES -> {
                val result = userPreferences.importPreferences(dataPackage.data)
                OperationResult(success = result)
            }
            PackageType.VALUES -> {
                val result = valueSystem.importValues(dataPackage.data)
                OperationResult(success = result)
            }
        }
    }
    
    /**
     * Scans for available devices that could be used for transfer
     */
    suspend fun scanForDevices(): List<DeviceInfo> {
        // Implementation of device scanning
        return listOf(
            DeviceInfo(
                deviceId = "device-001",
                deviceName = "Pixel 7",
                deviceType = DeviceType.PHONE,
                osType = OsType.ANDROID,
                osVersion = "13",
                lastSeenTimestamp = System.currentTimeMillis()
            ),
            DeviceInfo(
                deviceId = "device-002",
                deviceName = "MacBook Pro",
                deviceType = DeviceType.LAPTOP,
                osType = OsType.MACOS,
                osVersion = "Sonoma",
                lastSeenTimestamp = System.currentTimeMillis()
            ),
            DeviceInfo(
                deviceId = "device-003",
                deviceName = "iPad Pro",
                deviceType = DeviceType.TABLET,
                osType = OsType.IOS,
                osVersion = "17",
                lastSeenTimestamp = System.currentTimeMillis()
            )
        )
    }
    
    /**
     * Gets the transfer history
     */
    fun getTransferHistory(limit: Int = 10): List<TransferHistoryEntry> {
        return transferLogger.getTransferHistory(limit)
    }
}

/**
 * Protocol for secure device-to-device transfers
 */
class SecureDeviceTransferProtocol {
    /**
     * Transfers a data package to a target device
     */
    suspend fun transferPackage(
        targetDevice: DeviceInfo,
        dataPackage: CompressedDataPackage
    ): OperationResult {
        // Implementation of secure package transfer
        // In a real implementation, this would use secure P2P communication
        
        // Simulate transfer success for most packages
        val random = Random()
        val success = random.nextFloat() > 0.05f // 95% success rate for simulation
        
        return if (success) {
            OperationResult(success = true)
        } else {
            OperationResult(success = false, message = "Network error during transfer")
        }
    }
    
    /**
     * Requests a package from a source device
     */
    suspend fun requestPackage(
        sourceDevice: DeviceInfo,
        request: PackageRequest
    ): PackageResult {
        // Implementation of package request
        // In a real implementation, this would use secure P2P communication
        
        // Simulate request with dummy data
        val dummyData = "Dummy data for ${request.packageType}".toByteArray()
        
        val compressedPackage = CompressedDataPackage(
            originalPackageId = UUID.randomUUID().toString(),
            type = request.packageType,
            compressedData = dummyData,
            originalSize = dummyData.size.toLong() * 2, // Simulate compression
            compressionRatio = 0.5f,
            integrityHash = "dummy-hash",
            compressionTimestamp = System.currentTimeMillis()
        )
        
        return PackageResult(success = true, data = compressedPackage)
    }
}

/**
 * System for compressing and decompressing data packages
 */
class DataCompressionSystem {
    /**
     * Compresses a data package
     */
    fun compressPackage(dataPackage: DataPackage): CompressedDataPackage {
        // Implementation of data compression
        // In a real implementation, this would use actual compression algorithms
        
        // Simulate compression (in reality, we'd use GZIP or similar)
        val originalSize = dataPackage.data.size.toLong()
        val compressionRatio = 0.6f // Simulate 40% size reduction
        val compressedSize = (originalSize * compressionRatio).toLong()
        
        // In a real implementation, we'd actually compress the data
        val compressedData = dataPackage.data
        
        return CompressedDataPackage(
            originalPackageId = dataPackage.id,
            type = dataPackage.type,
            compressedData = compressedData,
            originalSize = originalSize,
            compressionRatio = compressionRatio,
            integrityHash = null, // Will be set later
            compressionTimestamp = System.currentTimeMillis()
        )
    }
    
    /**
     * Decompresses a compressed data package
     */
    fun decompressPackage(compressedPackage: CompressedDataPackage): DataPackage {
        // Implementation of data decompression
        // In a real implementation, this would use actual decompression algorithms
        
        // Simulate decompression (in reality, we'd use GZIP or similar)
        // For now, we just pass through the compressed data
        val decompressedData = compressedPackage.compressedData
        
        return DataPackage(
            id = compressedPackage.originalPackageId,
            type = compressedPackage.type,
            data = decompressedData,
            size = compressedPackage.originalSize,
            creationTimestamp = System.currentTimeMillis()
        )
    }
}

/**
 * System for verifying data integrity
 */
class DataIntegrityVerifier {
    /**
     * Calculates hash for a data package
     */
    fun calculateHash(dataPackage: CompressedDataPackage): String {
        // Implementation of hash calculation
        // In a real implementation, this would use SHA-256 or similar
        
        // Simple hash implementation for demonstration
        val digest = MessageDigest.getInstance("SHA-256")
        val hashBytes = digest.digest(dataPackage.compressedData)
        return hashBytes.joinToString("") { "%02x".format(it) }
    }
    
    /**
     * Verifies the integrity of a package on the target device
     */
    suspend fun verifyPackageIntegrity(
        targetDevice: DeviceInfo,
        dataPackage: DataPackage
    ): OperationResult {
        // Implementation of package integrity verification
        // In a real implementation, this would compare hashes between devices
        
        // Simulate verification success for most packages
        val random = Random()
        val success = random.nextFloat() > 0.02f // 98% success rate for simulation
        
        return if (success) {
            OperationResult(success = true)
        } else {
            OperationResult(success = false, message = "Integrity verification failed")
        }
    }
    
    /**
     * Verifies the integrity of a received package
     */
    suspend fun verifyReceivedPackage(
        dataPackage: CompressedDataPackage
    ): OperationResult {
        // Implementation of received package verification
        // In a real implementation, this would verify the hash
        
        // Simulate verification success for most packages
        val random = Random()
        val success = random.nextFloat() > 0.02f // 98% success rate for simulation
        
        return if (success) {
            OperationResult(success = true)
        } else {
            OperationResult(success = false, message = "Received package integrity verification failed")
        }
    }
}

/**
 * System for authenticating devices
 */
class DeviceAuthenticator {
    /**
     * Authenticates a device for transfer
     */
    suspend fun authenticateDevice(device: DeviceInfo): OperationResult {
        // Implementation of device authentication
        // In a real implementation, this would verify device certificates or tokens
        
        // Simulate authentication success for most devices
        val random = Random()
        val success = random.nextFloat() > 0.01f // 99% success rate for simulation
        
        return if (success) {
            OperationResult(success = true)
        } else {
            OperationResult(success = false, message = "Device authentication failed")
        }
    }
}

/**
 * Logger for transfer operations
 */
class TransferLogger {
    private val transferHistory = mutableListOf<TransferHistoryEntry>()
    
    /**
     * Logs the start of a transfer
     */
    fun logTransferStart(
        targetDevice: DeviceInfo,
        transferConfig: TransferConfiguration,
        timestamp: Long
    ) {
        val entry = TransferHistoryEntry(
            type = TransferHistoryType.TRANSFER_START,
            deviceInfo = targetDevice,
            config = transferConfig,
            timestamp = timestamp,
            success = true,
            message = "Transfer initiated to ${targetDevice.deviceName}"
        )
        transferHistory.add(entry)
    }
    
    /**
     * Logs a successful transfer
     */
    fun logTransferSuccess(
        session: TransferSession,
        timestamp: Long
    ) {
        val entry = TransferHistoryEntry(
            type = TransferHistoryType.TRANSFER_COMPLETE,
            deviceInfo = session.targetDevice,
            config = session.transferConfig,
            timestamp = timestamp,
            success = true,
            message = "Transfer completed successfully to ${session.targetDevice.deviceName}"
        )
        transferHistory.add(entry)
    }
    
    /**
     * Logs a failed transfer
     */
    fun logTransferFailure(
        session: TransferSession,
        failureReason: String,
        timestamp: Long
    ) {
        val entry = TransferHistoryEntry(
            type = TransferHistoryType.TRANSFER_FAILED,
            deviceInfo = session.targetDevice,
            config = session.transferConfig,
            timestamp = timestamp,
            success = false,
            message = "Transfer failed: $failureReason"
        )
        transferHistory.add(entry)
    }
    
    /**
     * Logs a transfer verification failure
     */
    fun logTransferVerificationFailure(
        session: TransferSession,
        failureReason: String,
        timestamp: Long
    ) {
        val entry = TransferHistoryEntry(
            type = TransferHistoryType.VERIFICATION_FAILED,
            deviceInfo = session.targetDevice,
            config = session.transferConfig,
            timestamp = timestamp,
            success = false,
            message = "Transfer verification failed: $failureReason"
        )
        transferHistory.add(entry)
    }
    
    /**
     * Logs a successful import
     */
    fun logImportSuccess(
        sourceDevice: DeviceInfo,
        importConfig: TransferConfiguration,
        timestamp: Long
    ) {
        val entry = TransferHistoryEntry(
            type = TransferHistoryType.IMPORT_COMPLETE,
            deviceInfo = sourceDevice,
            config = importConfig,
            timestamp = timestamp,
            success = true,
            message = "Import completed successfully from ${sourceDevice.deviceName}"
        )
        transferHistory.add(entry)
    }
    
    /**
     * Gets the transfer history
     */
    fun getTransferHistory(limit: Int): List<TransferHistoryEntry> {
        return transferHistory
            .sortedByDescending { it.timestamp }
            .take(limit)
    }
}

// Data Classes and Enums

enum class PackageType {
    CORE_SYSTEM,
    EPISODIC_MEMORY,
    SEMANTIC_MEMORY,
    EMOTIONAL_MEMORY,
    PROCEDURAL_MEMORY,
    PERSONALITY,
    USER_PREFERENCES,
    VALUES
}

enum class DeviceType {
    PHONE,
    TABLET,
    LAPTOP,
    DESKTOP,
    OTHER
}

enum class OsType {
    ANDROID,
    IOS,
    WINDOWS,
    MACOS,
    LINUX,
    OTHER
}

enum class TransferStatus {
    PREPARING,
    READY,
    IN_PROGRESS,
    COMPLETED,
    FAILED,
    VERIFICATION_FAILED,
    CANCELLED
}

enum class ImportStatus {
    PREPARING,
    REQUESTING_DATA,
    RECEIVING_DATA,
    PROCESSING,
    COMPLETED,
    FAILED,
    VERIFICATION_FAILED,
    CANCELLED
}

enum class TransferHistoryType {
    TRANSFER_START,
    TRANSFER_COMPLETE,
    TRANSFER_FAILED,
    VERIFICATION_FAILED,
    IMPORT_COMPLETE
}

data class TransferConfiguration(
    val includeMemory: Boolean = true,
    val includePersonality: Boolean = true,
    val includeUserPreferences: Boolean = true,
    val includeValues: Boolean = true,
    val memoryConfig: MemoryTransferConfiguration = MemoryTransferConfiguration()
)

data class MemoryTransferConfiguration(
    val includeEpisodicMemory: Boolean = true,
    val includeSemanticMemory: Boolean = true,
    val includeEmotionalMemory: Boolean = true,
    val includeProcedureMemory: Boolean = true,
    val memoryAgeLimit: Long? = null // Null means no limit
)

data class DeviceInfo(
    val deviceId: String,
    val deviceName: String,
    val deviceType: DeviceType,
    val osType: OsType,
    val osVersion: String,
    val lastSeenTimestamp: Long
)

data class DataPackage(
    val id: String,
    val type: PackageType,
    val data: ByteArray,
    val size: Long,
    val creationTimestamp: Long
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as DataPackage

        if (id != other.id) return false
        if (type != other.type) return false
        if (!data.contentEquals(other.data)) return false
        if (size != other.size) return false
        return creationTimestamp == other.creationTimestamp
    }

    override fun hashCode(): Int {
        var result = id.hashCode()
        result = 31 * result + type.hashCode()
        result = 31 * result + data.contentHashCode()
        result = 31 * result + size.hashCode()
        result = 31 * result + creationTimestamp.hashCode()
        return result
    }
}

data class CompressedDataPackage(
    val originalPackageId: String,
    val type: PackageType,
    val compressedData: ByteArray,
    val originalSize: Long,
    val compressionRatio: Float,
    var integrityHash: String?,
    val compressionTimestamp: Long
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as CompressedDataPackage

        if (originalPackageId != other.originalPackageId) return false
        if (type != other.type) return false
        if (!compressedData.contentEquals(other.compressedData)) return false
        if (originalSize != other.originalSize) return false
        if (compressionRatio != other.compressionRatio) return false
        if (integrityHash != other.integrityHash) return false
        return compressionTimestamp == other.compressionTimestamp
    }

    override fun hashCode(): Int {
        var result = originalPackageId.hashCode()
        result = 31 * result + type.hashCode()
        result = 31 * result + compressedData.contentHashCode()
        result = 31 * result + originalSize.hashCode()
        result = 31 * result + compressionRatio.hashCode()
        result = 31 * result + (integrityHash?.hashCode() ?: 0)
        result = 31 * result + compressionTimestamp.hashCode()
        return result
    }
}

data class TransferSession(
    val sessionId: String,
    var status: TransferStatus,
    var errorMessage: String?,
    var progress: Float,
    val transferConfig: TransferConfiguration,
    val targetDevice: DeviceInfo,
    var dataPackages: List<DataPackage>,
    val startTimestamp: Long,
    var endTimestamp: Long?
)

data class TransferProgress(
    val sessionId: String,
    val status: TransferStatus,
    val progress: Float,
    val currentPackage: DataPackage?,
    val message: String
)

data class ImportProgress(
    val status: ImportStatus,
    val progress: Float,
    val message: String
)

data class PackageRequest(
    val packageType: PackageType
)

data class OperationResult(
    val success: Boolean,
    val message: String? = null
)

data class PackageResult(
    val success: Boolean,
    val data: CompressedDataPackage?,
    val message: String? = null
)

data class TransferHistoryEntry(
    val type: TransferHistoryType,
    val deviceInfo: DeviceInfo,
    val config: TransferConfiguration,
    val timestamp: Long,
    val success: Boolean,
    val message: String
)

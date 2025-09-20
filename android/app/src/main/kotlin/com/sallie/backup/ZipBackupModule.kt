/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: ZipBackupModule - ZIP backup to SD card or USB.
 * Got it, love.
 */
package com.sallie.backup

import android.content.Context
import android.os.Environment
import android.os.StatFs
import com.sallie.core.memory.HierarchicalMemorySystem
import com.sallie.core.memory.MemoryStorageService
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.io.*
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream
import kotlin.math.roundToInt

object ZipBackupModule {

    private const val BUFFER_SIZE = 8192
    private const val BACKUP_DIR = "SallieBackup"
    private const val METADATA_FILE = "backup_metadata.json"

    private val json = Json {
        prettyPrint = true
        ignoreUnknownKeys = true
    }

    /**
     * Create a ZIP backup of all memory data to external storage
     * @param context Android context
     * @param storageService Memory storage service to backup
     * @param backupName Optional custom name for the backup file
     * @return Success status with backup path or error message
     */
    suspend fun createZipBackup(
        context: Context,
        storageService: MemoryStorageService,
        backupName: String? = null
    ): Result<BackupResult> = withContext(Dispatchers.IO) {
        try {
            // Find available external storage
            val externalDir = findAvailableExternalStorage(context)
                ?: return@withContext Result.failure(Exception("No external storage available"))

            // Create backup directory
            val backupDir = File(externalDir, BACKUP_DIR)
            if (!backupDir.exists()) {
                backupDir.mkdirs()
            }

            // Generate backup filename
            val timestamp = System.currentTimeMillis()
            val filename = backupName ?: "sallie_backup_${timestamp}.zip"
            val backupFile = File(backupDir, filename)

            // Check available space
            val requiredSpace = estimateBackupSize(storageService)
            if (!hasEnoughSpace(backupDir, requiredSpace)) {
                return@withContext Result.failure(Exception("Insufficient storage space. Required: ${formatBytes(requiredSpace)}"))
            }

            // Gather all memory data
            val allMemories = gatherAllMemories(storageService)
            if (allMemories.isEmpty()) {
                return@withContext Result.failure(Exception("No memory data to backup"))
            }

            // Create backup metadata
            val metadata = BackupMetadata(
                version = "1.0",
                timestamp = timestamp,
                memoryCount = allMemories.size,
                totalSize = estimateBackupSize(storageService)
            )

            // Create ZIP file
            val progress = createZipFile(backupFile, allMemories, metadata)

            val result = BackupResult(
                backupPath = backupFile.absolutePath,
                fileSize = backupFile.length(),
                memoryCount = allMemories.size,
                timestamp = timestamp,
                compressionRatio = progress.compressionRatio
            )

            Result.success(result)

        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * List all available backups on external storage
     * @param context Android context
     * @return List of available backup files with metadata
     */
    suspend fun listAvailableBackups(context: Context): Result<List<BackupInfo>> = withContext(Dispatchers.IO) {
        try {
            val backups = mutableListOf<BackupInfo>()

            // Check all possible external storage locations
            val externalDirs = getAllExternalStorageDirs(context)

            for (dir in externalDirs) {
                val backupDir = File(dir, BACKUP_DIR)
                if (backupDir.exists() && backupDir.isDirectory) {
                    backupDir.listFiles { file ->
                        file.isFile && file.name.endsWith(".zip")
                    }?.forEach { backupFile ->
                        try {
                            val info = extractBackupInfo(backupFile)
                            backups.add(info)
                        } catch (e: Exception) {
                            // Skip corrupted backup files
                        }
                    }
                }
            }

            // Sort by timestamp (newest first)
            backups.sortByDescending { it.timestamp }

            Result.success(backups)

        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Restore from a ZIP backup
     * @param context Android context
     * @param storageService Memory storage service to restore into
     * @param backupPath Path to the backup ZIP file
     * @param restoreStrategy How to handle existing data
     * @return Success status with restore statistics
     */
    suspend fun restoreFromZipBackup(
        context: Context,
        storageService: MemoryStorageService,
        backupPath: String,
        restoreStrategy: RestoreStrategy = RestoreStrategy.MERGE
    ): Result<RestoreResult> = withContext(Dispatchers.IO) {
        try {
            val backupFile = File(backupPath)
            if (!backupFile.exists()) {
                return@withContext Result.failure(Exception("Backup file does not exist: $backupPath"))
            }

            // Extract and parse backup
            val (memories, metadata) = extractBackupData(backupFile)

            // Restore memories based on strategy
            var restored = 0
            var skipped = 0
            var errors = 0

            for (memory in memories) {
                try {
                    when (restoreStrategy) {
                        RestoreStrategy.REPLACE -> {
                            storageService.storeMemory(memory)
                            restored++
                        }
                        RestoreStrategy.MERGE -> {
                            val existing = storageService.getMemory(memory.id)
                            if (existing == null) {
                                storageService.storeMemory(memory)
                                restored++
                            } else {
                                skipped++
                            }
                        }
                        RestoreStrategy.SKIP -> {
                            val existing = storageService.getMemory(memory.id)
                            if (existing == null) {
                                storageService.storeMemory(memory)
                                restored++
                            } else {
                                skipped++
                            }
                        }
                    }
                } catch (e: Exception) {
                    errors++
                }
            }

            val result = RestoreResult(
                totalMemories = memories.size,
                restored = restored,
                skipped = skipped,
                errors = errors,
                backupTimestamp = metadata.timestamp
            )

            Result.success(result)

        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Delete a backup file
     * @param backupPath Path to the backup file to delete
     * @return Success status
     */
    suspend fun deleteBackup(backupPath: String): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val backupFile = File(backupPath)
            if (backupFile.exists()) {
                val deleted = backupFile.delete()
                if (!deleted) {
                    return@withContext Result.failure(Exception("Failed to delete backup file"))
                }
            }
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Find available external storage directory
     */
    private fun findAvailableExternalStorage(context: Context): File? {
        val externalDirs = getAllExternalStorageDirs(context)

        // Prefer external SD card, then USB, then any available external storage
        return externalDirs.firstOrNull { dir ->
            dir.exists() && dir.canWrite() && hasEnoughSpace(dir, 100 * 1024 * 1024) // 100MB minimum
        }
    }

    /**
     * Get all possible external storage directories
     */
    private fun getAllExternalStorageDirs(context: Context): List<File> {
        val dirs = mutableListOf<File>()

        // Primary external storage
        context.getExternalFilesDir(null)?.let { dirs.add(it.parentFile!!) }

        // Additional external storage locations
        val externalFilesDirs = context.getExternalFilesDirs(null)
        dirs.addAll(externalFilesDirs.mapNotNull { it?.parentFile })

        // Legacy external storage
        Environment.getExternalStorageDirectory()?.let { dirs.add(it) }

        return dirs.distinct()
    }

    /**
     * Estimate the size of the backup
     */
    private suspend fun estimateBackupSize(storageService: MemoryStorageService): Long {
        val memories = gatherAllMemories(storageService)
        val jsonSize = json.encodeToString(memories).toByteArray().size
        // Estimate compression ratio of ~70%
        return (jsonSize * 1.5).toLong()
    }

    /**
     * Gather all memories from storage service
     */
    private suspend fun gatherAllMemories(storageService: MemoryStorageService): List<HierarchicalMemorySystem.MemoryItem> {
        val allMemories = mutableListOf<HierarchicalMemorySystem.MemoryItem>()

        HierarchicalMemorySystem.MemoryType.values().forEach { type ->
            try {
                val memories = storageService.getMemoriesByType(type)
                allMemories.addAll(memories)
            } catch (e: Exception) {
                // Continue with other types if one fails
            }
        }

        return allMemories
    }

    /**
     * Check if there's enough space for the backup
     */
    private fun hasEnoughSpace(directory: File, requiredBytes: Long): Boolean {
        return try {
            val stat = StatFs(directory.absolutePath)
            val availableBytes = stat.availableBytes
            availableBytes > requiredBytes
        } catch (e: Exception) {
            false
        }
    }

    /**
     * Create the ZIP file with memories and metadata
     */
    private fun createZipFile(
        zipFile: File,
        memories: List<HierarchicalMemorySystem.MemoryItem>,
        metadata: BackupMetadata
    ): ZipProgress {
        var totalUncompressedSize = 0L
        var totalCompressedSize = 0L

        ZipOutputStream(BufferedOutputStream(FileOutputStream(zipFile))).use { zos ->
            // Add metadata
            val metadataJson = json.encodeToString(metadata)
            totalUncompressedSize += metadataJson.length.toLong()

            zos.putNextEntry(ZipEntry(METADATA_FILE))
            zos.write(metadataJson.toByteArray())
            zos.closeEntry()

            // Add memories in batches to avoid memory issues
            val batchSize = 100
            memories.chunked(batchSize).forEachIndexed { index, batch ->
                val batchJson = json.encodeToString(batch)
                totalUncompressedSize += batchJson.length.toLong()

                zos.putNextEntry(ZipEntry("memories_batch_${index + 1}.json"))
                zos.write(batchJson.toByteArray())
                zos.closeEntry()
            }
        }

        totalCompressedSize = zipFile.length()
        val compressionRatio = if (totalUncompressedSize > 0) {
            (totalCompressedSize.toDouble() / totalUncompressedSize.toDouble()) * 100.0
        } else {
            0.0
        }

        return ZipProgress(compressionRatio.roundToInt())
    }

    /**
     * Extract backup information from a ZIP file
     */
    private fun extractBackupInfo(backupFile: File): BackupInfo {
        ZipOutputStream(FileOutputStream(backupFile)).use { zos ->
            // Read metadata from ZIP
            zos.use { zip ->
                val entries = zip.entries()
                while (entries.hasMoreElements()) {
                    val entry = entries.nextElement()
                    if (entry.name == METADATA_FILE) {
                        val metadataJson = zip.readBytes().toString(Charsets.UTF_8)
                        val metadata = json.decodeFromString<BackupMetadata>(metadataJson)

                        return BackupInfo(
                            filePath = backupFile.absolutePath,
                            fileName = backupFile.name,
                            fileSize = backupFile.length(),
                            timestamp = metadata.timestamp,
                            memoryCount = metadata.memoryCount,
                            version = metadata.version
                        )
                    }
                }
            }
        }

        // Fallback if metadata not found
        return BackupInfo(
            filePath = backupFile.absolutePath,
            fileName = backupFile.name,
            fileSize = backupFile.length(),
            timestamp = backupFile.lastModified(),
            memoryCount = 0,
            version = "unknown"
        )
    }

    /**
     * Extract backup data from ZIP file
     */
    private fun extractBackupData(backupFile: File): Pair<List<HierarchicalMemorySystem.MemoryItem>, BackupMetadata> {
        val memories = mutableListOf<HierarchicalMemorySystem.MemoryItem>()
        var metadata = BackupMetadata("1.0", 0L, 0, 0L)

        ZipOutputStream(FileOutputStream(backupFile)).use { zos ->
            zos.use { zip ->
                val entries = zip.entries()
                while (entries.hasMoreElements()) {
                    val entry = entries.nextElement()
                    val content = zip.readBytes().toString(Charsets.UTF_8)

                    when {
                        entry.name == METADATA_FILE -> {
                            metadata = json.decodeFromString(content)
                        }
                        entry.name.startsWith("memories_batch_") -> {
                            val batch = json.decodeFromString<List<HierarchicalMemorySystem.MemoryItem>>(content)
                            memories.addAll(batch)
                        }
                    }
                }
            }
        }

        return Pair(memories, metadata)
    }

    /**
     * Format bytes to human readable format
     */
    private fun formatBytes(bytes: Long): String {
        val units = arrayOf("B", "KB", "MB", "GB", "TB")
        var size = bytes.toDouble()
        var unitIndex = 0

        while (size >= 1024 && unitIndex < units.size - 1) {
            size /= 1024
            unitIndex++
        }

        return "%.2f %s".format(size, units[unitIndex])
    }

    /**
     * Data structures for backup operations
     */
    private data class BackupMetadata(
        val version: String,
        val timestamp: Long,
        val memoryCount: Int,
        val totalSize: Long
    )

    data class BackupResult(
        val backupPath: String,
        val fileSize: Long,
        val memoryCount: Int,
        val timestamp: Long,
        val compressionRatio: Int // Percentage
    )

    data class BackupInfo(
        val filePath: String,
        val fileName: String,
        val fileSize: Long,
        val timestamp: Long,
        val memoryCount: Int,
        val version: String
    )

    data class RestoreResult(
        val totalMemories: Int,
        val restored: Int,
        val skipped: Int,
        val errors: Int,
        val backupTimestamp: Long
    )

    enum class RestoreStrategy {
        REPLACE, // Replace existing memories
        MERGE,   // Merge with existing (skip duplicates)
        SKIP     // Skip all existing memories
    }

    private data class ZipProgress(
        val compressionRatio: Int
    )
}

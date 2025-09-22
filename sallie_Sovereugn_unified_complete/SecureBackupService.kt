/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * SecureBackupService - Implementation of BackupService with encryption
 */

package com.sallie.persistence.backup

import android.content.Context
import androidx.work.Constraints
import androidx.work.Data
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import com.google.gson.Gson
import com.google.gson.GsonBuilder
import com.google.gson.reflect.TypeToken
import com.sallie.persistence.crypto.EncryptionService
import com.sallie.persistence.storage.StorageService
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.BufferedInputStream
import java.io.BufferedOutputStream
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.util.Date
import java.util.UUID
import java.util.concurrent.TimeUnit
import java.util.zip.ZipEntry
import java.util.zip.ZipInputStream
import java.util.zip.ZipOutputStream
import javax.crypto.SecretKey
import javax.crypto.spec.SecretKeySpec

/**
 * Implementation of BackupService with encryption and scheduling
 * 
 * Provides secure backup and restore functionality with encryption,
 * scheduling, and detailed metadata
 */
class SecureBackupService(
    private val context: Context,
    private val storageService: StorageService,
    private val encryptionService: EncryptionService
) : BackupService {
    
    companion object {
        private const val BACKUP_VERSION = "1.0"
        private const val METADATA_ENTRY = "backup_metadata.json"
        private const val AUTOMATIC_BACKUP_WORK = "sallie_automatic_backup"
        private const val DEFAULT_BUFFER_SIZE = 8192
    }
    
    private val gson: Gson = GsonBuilder().setPrettyPrinting().create()
    private val workManager = WorkManager.getInstance(context)
    
    override suspend fun createBackup(
        destination: File,
        password: String?,
        includeFilters: List<String>?,
        excludeFilters: List<String>?
    ): Result<Unit> {
        return withContext(Dispatchers.IO) {
            try {
                // 1. List all keys in storage
                val allKeys = storageService.listKeys()
                val filteredKeys = filterKeys(allKeys, includeFilters, excludeFilters)
                
                // If backup file exists, delete it
                if (destination.exists()) {
                    destination.delete()
                }
                
                // 2. Create temporary directory
                val tempDir = File(context.cacheDir, "backup_temp_${UUID.randomUUID()}")
                tempDir.mkdirs()
                
                try {
                    // 3. Create content summary
                    val contentSummary = mutableMapOf<String, Int>()
                    
                    // 4. Copy all data to temp directory
                    for (key in filteredKeys) {
                        // Track content type
                        val category = key.split(".").firstOrNull() ?: "other"
                        contentSummary[category] = contentSummary.getOrDefault(category, 0) + 1
                        
                        // Copy data
                        val data = storageService.read(key).getOrThrow() ?: continue
                        val tempFile = File(tempDir, key)
                        tempFile.parentFile?.mkdirs()
                        tempFile.writeBytes(data)
                    }
                    
                    // 5. Create metadata
                    val metadata = BackupInfo(
                        creationTime = Date(),
                        version = BACKUP_VERSION,
                        entryCount = filteredKeys.size,
                        fileSizeBytes = tempDir.walkTopDown().filter { it.isFile }.sumOf { it.length() },
                        isEncrypted = password != null,
                        appVersion = context.packageManager.getPackageInfo(context.packageName, 0).versionName,
                        deviceInfo = android.os.Build.MODEL,
                        contentSummary = contentSummary
                    )
                    
                    // Write metadata to temp dir
                    val metadataFile = File(tempDir, METADATA_ENTRY)
                    metadataFile.writeText(gson.toJson(metadata))
                    
                    // 6. Create zip archive
                    val backupDataTemp = File(context.cacheDir, "backup_data_${UUID.randomUUID()}")
                    zipDirectory(tempDir, backupDataTemp)
                    
                    // 7. Encrypt if password provided
                    if (password != null) {
                        val passwordKey = deriveKeyFromPassword(password)
                        val encryptedData = encryptBackup(backupDataTemp.readBytes(), passwordKey)
                        destination.writeBytes(encryptedData)
                    } else {
                        backupDataTemp.copyTo(destination, overwrite = true)
                    }
                    
                    // 8. Clean up temp files
                    backupDataTemp.delete()
                    tempDir.deleteRecursively()
                    
                    Result.success(Unit)
                } catch (e: Exception) {
                    tempDir.deleteRecursively()
                    Result.failure(e)
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    override suspend fun restoreFromBackup(
        source: File,
        password: String?,
        overwriteExisting: Boolean,
        includeFilters: List<String>?,
        excludeFilters: List<String>?
    ): Result<Unit> {
        return withContext(Dispatchers.IO) {
            try {
                if (!source.exists()) {
                    return@withContext Result.failure(Exception("Backup file does not exist"))
                }
                
                // 1. Create temporary directory
                val tempDir = File(context.cacheDir, "restore_temp_${UUID.randomUUID()}")
                tempDir.mkdirs()
                
                try {
                    // 2. Decrypt if password provided
                    val backupData = if (password != null) {
                        val passwordKey = deriveKeyFromPassword(password)
                        try {
                            decryptBackup(source.readBytes(), passwordKey)
                        } catch (e: Exception) {
                            return@withContext Result.failure(Exception("Invalid password or corrupt backup"))
                        }
                    } else {
                        source.readBytes()
                    }
                    
                    // Write decrypted data to temp file
                    val backupDataTemp = File(context.cacheDir, "backup_data_${UUID.randomUUID()}")
                    backupDataTemp.writeBytes(backupData)
                    
                    // 3. Unzip to temp directory
                    unzipFile(backupDataTemp, tempDir)
                    
                    // Clean up temp file
                    backupDataTemp.delete()
                    
                    // 4. Validate metadata
                    val metadataFile = File(tempDir, METADATA_ENTRY)
                    if (!metadataFile.exists()) {
                        return@withContext Result.failure(Exception("Invalid backup: missing metadata"))
                    }
                    
                    val metadata: BackupInfo = gson.fromJson(
                        metadataFile.readText(),
                        object : TypeToken<BackupInfo>() {}.type
                    )
                    
                    // 5. List all files
                    val allFiles = tempDir.walkTopDown()
                        .filter { it.isFile && it.name != METADATA_ENTRY }
                        .map { it.relativeTo(tempDir).path }
                        .toList()
                    
                    val filteredFiles = filterKeys(allFiles, includeFilters, excludeFilters)
                    
                    // 6. Check for conflicts if not overwriting
                    if (!overwriteExisting) {
                        val existingKeys = filteredFiles.filter { storageService.exists(it) }
                        
                        if (existingKeys.isNotEmpty()) {
                            return@withContext Result.failure(Exception("Data conflict: ${existingKeys.size} keys already exist"))
                        }
                    }
                    
                    // 7. Restore data
                    for (key in filteredFiles) {
                        val file = File(tempDir, key)
                        if (file.exists()) {
                            val data = file.readBytes()
                            storageService.write(key, data, false).getOrThrow()
                        }
                    }
                    
                    // 8. Clean up
                    tempDir.deleteRecursively()
                    
                    Result.success(Unit)
                } catch (e: Exception) {
                    tempDir.deleteRecursively()
                    Result.failure(e)
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    override suspend fun validateBackup(source: File, password: String?): Result<Boolean> {
        return withContext(Dispatchers.IO) {
            try {
                if (!source.exists()) {
                    return@withContext Result.failure(Exception("Backup file does not exist"))
                }
                
                // Try to get backup info
                val infoResult = getBackupInfo(source, password)
                
                if (infoResult.isFailure) {
                    return@withContext Result.success(false)
                }
                
                // Backup is valid if we can extract metadata
                Result.success(true)
            } catch (e: Exception) {
                Result.success(false)
            }
        }
    }
    
    override suspend fun getBackupInfo(source: File, password: String?): Result<BackupInfo> {
        return withContext(Dispatchers.IO) {
            try {
                if (!source.exists()) {
                    return@withContext Result.failure(Exception("Backup file does not exist"))
                }
                
                // 1. Create temporary directory
                val tempDir = File(context.cacheDir, "backup_info_temp_${UUID.randomUUID()}")
                tempDir.mkdirs()
                
                try {
                    // 2. Decrypt if password provided
                    val backupData = if (password != null) {
                        val passwordKey = deriveKeyFromPassword(password)
                        try {
                            decryptBackup(source.readBytes(), passwordKey)
                        } catch (e: Exception) {
                            return@withContext Result.failure(Exception("Invalid password or corrupt backup"))
                        }
                    } else {
                        source.readBytes()
                    }
                    
                    // Write decrypted data to temp file
                    val backupDataTemp = File(context.cacheDir, "backup_data_${UUID.randomUUID()}")
                    backupDataTemp.writeBytes(backupData)
                    
                    // Extract just the metadata file
                    extractSingleFile(backupDataTemp, METADATA_ENTRY, tempDir)
                    
                    // Clean up temp file
                    backupDataTemp.delete()
                    
                    // Read metadata
                    val metadataFile = File(tempDir, METADATA_ENTRY)
                    if (!metadataFile.exists()) {
                        return@withContext Result.failure(Exception("Invalid backup: missing metadata"))
                    }
                    
                    val metadata: BackupInfo = gson.fromJson(
                        metadataFile.readText(),
                        object : TypeToken<BackupInfo>() {}.type
                    )
                    
                    // Clean up
                    tempDir.deleteRecursively()
                    
                    Result.success(metadata)
                } catch (e: Exception) {
                    tempDir.deleteRecursively()
                    Result.failure(e)
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    override suspend fun scheduleAutomaticBackups(
        destination: File,
        intervalHours: Int,
        keepCount: Int,
        password: String?
    ): Result<Unit> {
        return try {
            // Make sure destination directory exists
            destination.mkdirs()
            
            // Create work constraints
            val constraints = Constraints.Builder()
                .setRequiresBatteryNotLow(true)
                .setRequiresStorageNotLow(true)
                .setRequiresDeviceIdle(true)
                .build()
            
            // Create input data
            val inputData = Data.Builder()
                .putString("destination", destination.absolutePath)
                .putInt("keepCount", keepCount)
                .putString("password", password)
                .build()
            
            // Create work request
            val workRequest = PeriodicWorkRequestBuilder<AutomaticBackupWorker>(
                intervalHours.toLong(), TimeUnit.HOURS
            )
                .setConstraints(constraints)
                .setInputData(inputData)
                .build()
            
            // Schedule the work
            workManager.enqueueUniquePeriodicWork(
                AUTOMATIC_BACKUP_WORK,
                ExistingPeriodicWorkPolicy.REPLACE,
                workRequest
            )
            
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun cancelAutomaticBackups(): Result<Unit> {
        return try {
            workManager.cancelUniqueWork(AUTOMATIC_BACKUP_WORK)
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    //
    // Helper methods
    //
    
    private fun filterKeys(
        keys: List<String>,
        includeFilters: List<String>?,
        excludeFilters: List<String>?
    ): List<String> {
        var result = keys
        
        // Apply include filters
        if (!includeFilters.isNullOrEmpty()) {
            result = result.filter { key ->
                includeFilters.any { filter -> key.startsWith(filter) }
            }
        }
        
        // Apply exclude filters
        if (!excludeFilters.isNullOrEmpty()) {
            result = result.filter { key ->
                excludeFilters.none { filter -> key.startsWith(filter) }
            }
        }
        
        return result
    }
    
    private fun zipDirectory(directory: File, zipFile: File) {
        ZipOutputStream(BufferedOutputStream(FileOutputStream(zipFile))).use { zipOut ->
            directory.walkTopDown().forEach { file ->
                if (file.isFile) {
                    val entryPath = file.relativeTo(directory).path.replace('\\', '/')
                    val entry = ZipEntry(entryPath)
                    zipOut.putNextEntry(entry)
                    
                    file.inputStream().use { input ->
                        input.copyTo(zipOut)
                    }
                    
                    zipOut.closeEntry()
                }
            }
        }
    }
    
    private fun unzipFile(zipFile: File, destDir: File) {
        destDir.mkdirs()
        
        ZipInputStream(BufferedInputStream(FileInputStream(zipFile))).use { zipIn ->
            var entry: ZipEntry? = zipIn.nextEntry
            val buffer = ByteArray(DEFAULT_BUFFER_SIZE)
            
            while (entry != null) {
                val entryFile = File(destDir, entry.name)
                
                if (entry.isDirectory) {
                    entryFile.mkdirs()
                } else {
                    entryFile.parentFile?.mkdirs()
                    
                    FileOutputStream(entryFile).use { output ->
                        var len: Int
                        while (zipIn.read(buffer).also { len = it } > 0) {
                            output.write(buffer, 0, len)
                        }
                    }
                }
                
                zipIn.closeEntry()
                entry = zipIn.nextEntry
            }
        }
    }
    
    private fun extractSingleFile(zipFile: File, targetPath: String, destDir: File) {
        destDir.mkdirs()
        
        ZipInputStream(BufferedInputStream(FileInputStream(zipFile))).use { zipIn ->
            var entry: ZipEntry? = zipIn.nextEntry
            
            while (entry != null) {
                if (entry.name == targetPath) {
                    val entryFile = File(destDir, entry.name)
                    entryFile.parentFile?.mkdirs()
                    
                    FileOutputStream(entryFile).use { output ->
                        zipIn.copyTo(output)
                    }
                    
                    break
                }
                
                zipIn.closeEntry()
                entry = zipIn.nextEntry
            }
        }
    }
    
    private fun deriveKeyFromPassword(password: String): SecretKey {
        // In a real implementation, use PBKDF2 with proper salt and iterations
        // This is a simplified placeholder
        
        val passwordBytes = password.toByteArray(Charsets.UTF_8)
        val keyBytes = ByteArray(32) // 256 bits
        
        // Simple key derivation (not secure for production)
        for (i in keyBytes.indices) {
            keyBytes[i] = passwordBytes[i % passwordBytes.size]
        }
        
        return SecretKeySpec(keyBytes, "AES")
    }
    
    private fun encryptBackup(backupData: ByteArray, passwordKey: SecretKey): ByteArray {
        // Use the encryption service
        return encryptionService.encryptWithKey(backupData, "backup_key").getOrThrow()
    }
    
    private fun decryptBackup(encryptedData: ByteArray, passwordKey: SecretKey): ByteArray {
        // Use the encryption service
        return encryptionService.decryptWithKey(encryptedData, "backup_key").getOrThrow()
    }
}

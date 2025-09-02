/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * SalliePersistenceService - Main implementation of the PersistenceService
 */

package com.sallie.persistence

import android.content.Context
import com.sallie.persistence.backup.BackupService
import com.sallie.persistence.backup.SecureBackupService
import com.sallie.persistence.crypto.EncryptionService
import com.sallie.persistence.crypto.AesGcmEncryptionService
import com.sallie.persistence.migration.MigrationManager
import com.sallie.persistence.migration.impl.SchemaMigrationV1
import com.sallie.persistence.storage.StorageService
import com.sallie.persistence.storage.SecureStorageService
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.util.Date
import java.util.regex.Pattern

/**
 * Main implementation of PersistenceService that integrates all components
 * 
 * This service provides:
 * - High-level persistence operations
 * - Integration of storage, encryption, backup, and migration
 * - Data access with namespacing and versioning
 * - Automatic migration handling
 */
class SalliePersistenceService(
    private val context: Context
) : PersistenceService {
    
    companion object {
        private const val CURRENT_SCHEMA_VERSION = 1
        private val VALID_KEY_PATTERN = Pattern.compile("^[a-zA-Z0-9_./\\-]+$")
    }
    
    private val storageService: StorageService by lazy {
        SecureStorageService(context)
    }
    
    private val encryptionService: EncryptionService by lazy {
        AesGcmEncryptionService()
    }
    
    private val backupService: BackupService by lazy {
        SecureBackupService(context, storageService, encryptionService)
    }
    
    private val migrationManager: MigrationManager by lazy {
        MigrationManager(context).apply {
            // Register all migrations
            registerMigration(SchemaMigrationV1(context, storageService))
            
            // Add more migrations as needed...
        }
    }
    
    override suspend fun initialize(): Result<Unit> {
        return withContext(Dispatchers.IO) {
            try {
                // Initialize the storage service
                storageService.initialize().getOrThrow()
                
                // Check if migration is needed and perform if necessary
                if (migrationManager.isMigrationNeeded(CURRENT_SCHEMA_VERSION)) {
                    migrationManager.migrateToVersion(CURRENT_SCHEMA_VERSION).getOrThrow()
                }
                
                Result.success(Unit)
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    override suspend fun set(key: String, value: String, secure: Boolean): Result<Unit> {
        return withContext(Dispatchers.IO) {
            try {
                validateKey(key)
                
                val data = value.toByteArray(Charsets.UTF_8)
                
                if (secure) {
                    // Encrypt the data first
                    val encryptedData = encryptionService.encrypt(data).getOrThrow()
                    storageService.write("secure.$key", encryptedData)
                } else {
                    storageService.write("regular.$key", data)
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    override suspend fun setObject(key: String, value: Any, secure: Boolean): Result<Unit> {
        return withContext(Dispatchers.IO) {
            try {
                val json = toJson(value)
                set("object.$key", json, secure)
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    override suspend fun get(key: String, secure: Boolean): Result<String?> {
        return withContext(Dispatchers.IO) {
            try {
                validateKey(key)
                
                val prefix = if (secure) "secure." else "regular."
                val data = storageService.read("$prefix$key").getOrThrow() ?: return@withContext Result.success(null)
                
                if (secure) {
                    // Decrypt the data
                    val decryptedData = encryptionService.decrypt(data).getOrThrow()
                    Result.success(String(decryptedData, Charsets.UTF_8))
                } else {
                    Result.success(String(data, Charsets.UTF_8))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    override suspend fun <T> getObject(key: String, clazz: Class<T>, secure: Boolean): Result<T?> {
        return withContext(Dispatchers.IO) {
            try {
                val json = get("object.$key", secure).getOrThrow() ?: return@withContext Result.success(null)
                val obj = fromJson(json, clazz)
                Result.success(obj)
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    override suspend fun remove(key: String): Result<Boolean> {
        return withContext(Dispatchers.IO) {
            try {
                validateKey(key)
                
                // Try to delete both secure and regular versions
                var deleted = false
                
                val regularResult = storageService.delete("regular.$key")
                if (regularResult.isSuccess && regularResult.getOrThrow()) {
                    deleted = true
                }
                
                val secureResult = storageService.delete("secure.$key")
                if (secureResult.isSuccess && secureResult.getOrThrow()) {
                    deleted = true
                }
                
                val objectResult = storageService.delete("object.$key")
                if (objectResult.isSuccess && objectResult.getOrThrow()) {
                    deleted = true
                }
                
                Result.success(deleted)
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    override suspend fun exists(key: String): Result<Boolean> {
        return withContext(Dispatchers.IO) {
            try {
                validateKey(key)
                
                // Check both secure and regular storage
                val regularExists = storageService.exists("regular.$key")
                val secureExists = storageService.exists("secure.$key")
                val objectExists = storageService.exists("object.$key")
                
                Result.success(regularExists || secureExists || objectExists)
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    override suspend fun listKeys(prefix: String): Result<List<String>> {
        return withContext(Dispatchers.IO) {
            try {
                val allKeys = storageService.listKeys()
                
                // Extract the original keys (without the regular/secure/object prefix)
                val uniqueKeys = mutableSetOf<String>()
                
                for (key in allKeys) {
                    when {
                        key.startsWith("regular.") -> {
                            val originalKey = key.substring("regular.".length)
                            if (originalKey.startsWith(prefix)) {
                                uniqueKeys.add(originalKey)
                            }
                        }
                        key.startsWith("secure.") -> {
                            val originalKey = key.substring("secure.".length)
                            if (originalKey.startsWith(prefix)) {
                                uniqueKeys.add(originalKey)
                            }
                        }
                        key.startsWith("object.") -> {
                            val originalKey = key.substring("object.".length)
                            if (originalKey.startsWith(prefix)) {
                                uniqueKeys.add(originalKey)
                            }
                        }
                    }
                }
                
                Result.success(uniqueKeys.toList())
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    override suspend fun createBackup(file: File, password: String?): Result<Unit> {
        return backupService.createBackup(file, password, null, null)
    }
    
    override suspend fun restoreBackup(file: File, password: String?): Result<Unit> {
        return backupService.restoreFromBackup(file, password, true, null, null)
    }
    
    override suspend fun scheduleAutomaticBackups(
        directory: File, 
        intervalHours: Int, 
        keepCount: Int, 
        password: String?
    ): Result<Unit> {
        return backupService.scheduleAutomaticBackups(directory, intervalHours, keepCount, password)
    }
    
    override suspend fun clearAll(): Result<Unit> {
        return withContext(Dispatchers.IO) {
            try {
                // Create a backup before clearing everything
                val backupDir = File(context.getExternalFilesDir(null), "automatic_backups")
                backupDir.mkdirs()
                
                val timestamp = System.currentTimeMillis()
                val backupFile = File(backupDir, "pre_clear_backup_$timestamp.sb")
                
                // Try to create backup but proceed even if it fails
                try {
                    createBackup(backupFile, null)
                } catch (e: Exception) {
                    // Log but continue
                    e.printStackTrace()
                }
                
                // Clear all data
                storageService.clear().getOrThrow()
                
                Result.success(Unit)
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    // Helper methods
    
    private fun validateKey(key: String) {
        require(key.isNotBlank()) { "Key cannot be blank" }
        require(key.length <= 128) { "Key length cannot exceed 128 characters" }
        require(VALID_KEY_PATTERN.matcher(key).matches()) { 
            "Key can only contain letters, numbers, underscores, periods, slashes, and hyphens" 
        }
    }
    
    private fun <T> toJson(value: T): String {
        // In a real implementation, use a proper JSON serializer like Gson or Moshi
        // This is a placeholder implementation
        return value.toString()
    }
    
    private fun <T> fromJson(json: String, clazz: Class<T>): T? {
        // In a real implementation, use a proper JSON serializer like Gson or Moshi
        // This is a placeholder implementation
        return null
    }
}

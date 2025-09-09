/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * AutomaticBackupWorker - Worker for scheduled automatic backups
 */

package com.sallie.persistence.backup

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Worker implementation for scheduled automatic backups
 * 
 * This worker is responsible for:
 * - Creating automatic backups on schedule
 * - Managing backup retention (keeping only N most recent backups)
 * - Logging backup status and errors
 */
class AutomaticBackupWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {
    
    companion object {
        private const val BACKUP_FILENAME_FORMAT = "sallie_backup_%s.sb"
        private const val DATE_FORMAT = "yyyyMMdd_HHmmss"
    }
    
    private val backupService: BackupService by lazy {
        // In a real implementation, this would be injected via DI
        // This is a placeholder that assumes SecureBackupService is available via ServiceLocator
        ServiceLocator.getBackupService(applicationContext)
    }
    
    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        try {
            // Get input data
            val destinationPath = inputData.getString("destination") ?: return@withContext Result.failure()
            val keepCount = inputData.getInt("keepCount", 5)
            val password = inputData.getString("password")
            
            val destinationDir = File(destinationPath)
            
            // Generate backup filename with timestamp
            val timestamp = SimpleDateFormat(DATE_FORMAT, Locale.US).format(Date())
            val backupFile = File(destinationDir, String.format(BACKUP_FILENAME_FORMAT, timestamp))
            
            // Create the backup
            val backupResult = backupService.createBackup(
                destination = backupFile,
                password = password,
                includeFilters = null,  // Include everything
                excludeFilters = listOf("temp.", "cache.")  // Exclude temp and cache
            )
            
            if (backupResult.isFailure) {
                // Log error
                val exception = backupResult.exceptionOrNull()
                logBackupError(exception)
                return@withContext Result.failure()
            }
            
            // Clean up old backups if we have more than keepCount
            cleanupOldBackups(destinationDir, keepCount)
            
            // Log successful backup
            logBackupSuccess(backupFile)
            
            Result.success()
        } catch (e: Exception) {
            logBackupError(e)
            Result.failure()
        }
    }
    
    private fun cleanupOldBackups(backupDir: File, keepCount: Int) {
        val backupFiles = backupDir.listFiles { file ->
            file.isFile && file.name.startsWith("sallie_backup_") && file.name.endsWith(".sb")
        } ?: return
        
        if (backupFiles.size <= keepCount) {
            return
        }
        
        // Sort by last modified date (newest first)
        val sortedBackups = backupFiles.sortedByDescending { it.lastModified() }
        
        // Delete the oldest backups beyond our keep count
        sortedBackups.subList(keepCount, sortedBackups.size).forEach { file ->
            file.delete()
        }
    }
    
    private fun logBackupSuccess(backupFile: File) {
        // In a real implementation, this would use a proper logging system
        // This is a placeholder implementation
        
        val logMessage = """
            Automatic backup created successfully
            File: ${backupFile.absolutePath}
            Size: ${backupFile.length()} bytes
            Time: ${SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.US).format(Date())}
        """.trimIndent()
        
        println(logMessage)
    }
    
    private fun logBackupError(exception: Throwable?) {
        // In a real implementation, this would use a proper logging system
        // This is a placeholder implementation
        
        val logMessage = """
            Automatic backup failed
            Error: ${exception?.message ?: "Unknown error"}
            Time: ${SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.US).format(Date())}
        """.trimIndent()
        
        println(logMessage)
    }
}

/**
 * Placeholder for dependency injection
 * In a real implementation, this would be replaced with proper DI
 */
object ServiceLocator {
    fun getBackupService(context: Context): BackupService {
        val storageService = ServiceLocator.getStorageService(context)
        val encryptionService = ServiceLocator.getEncryptionService()
        return SecureBackupService(context, storageService, encryptionService)
    }
    
    fun getStorageService(context: Context): StorageService {
        // Placeholder: In a real app, this would be injected
        return com.sallie.persistence.storage.SecureStorageService(context)
    }
    
    fun getEncryptionService(): com.sallie.persistence.crypto.EncryptionService {
        // Placeholder: In a real app, this would be injected
        return com.sallie.persistence.crypto.AesGcmEncryptionService()
    }
}

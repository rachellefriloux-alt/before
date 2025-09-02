/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * BackupService - Interface for backup and restore operations
 */

package com.sallie.persistence.backup

import java.io.File

/**
 * Interface for backup and restore operations
 * 
 * Provides functionality to create backups of user data and restore from backups
 * with proper security and encryption
 */
interface BackupService {
    
    /**
     * Create a backup of all user data
     * 
     * @param destination The file to save the backup to
     * @param password Optional password for additional encryption
     * @param includeFilters Optional filters to include specific data
     * @param excludeFilters Optional filters to exclude specific data
     * @return Success or failure
     */
    suspend fun createBackup(
        destination: File,
        password: String? = null,
        includeFilters: List<String>? = null,
        excludeFilters: List<String>? = null
    ): Result<Unit>
    
    /**
     * Restore from a backup file
     * 
     * @param source The backup file to restore from
     * @param password Optional password for decryption
     * @param overwriteExisting Whether to overwrite existing data
     * @param includeFilters Optional filters to include specific data
     * @param excludeFilters Optional filters to exclude specific data
     * @return Success or failure
     */
    suspend fun restoreFromBackup(
        source: File,
        password: String? = null,
        overwriteExisting: Boolean = false,
        includeFilters: List<String>? = null,
        excludeFilters: List<String>? = null
    ): Result<Unit>
    
    /**
     * Validate a backup file
     * 
     * @param source The backup file to validate
     * @param password Optional password for decryption
     * @return Whether the backup is valid
     */
    suspend fun validateBackup(source: File, password: String? = null): Result<Boolean>
    
    /**
     * Get information about a backup
     * 
     * @param source The backup file to get information about
     * @param password Optional password for decryption
     * @return Information about the backup
     */
    suspend fun getBackupInfo(source: File, password: String? = null): Result<BackupInfo>
    
    /**
     * Schedule automatic backups
     * 
     * @param destination Directory to save backups to
     * @param intervalHours Interval between backups in hours
     * @param keepCount Number of backups to keep
     * @param password Optional password for encryption
     * @return Success or failure
     */
    suspend fun scheduleAutomaticBackups(
        destination: File,
        intervalHours: Int,
        keepCount: Int,
        password: String? = null
    ): Result<Unit>
    
    /**
     * Cancel scheduled automatic backups
     * 
     * @return Success or failure
     */
    suspend fun cancelAutomaticBackups(): Result<Unit>
}

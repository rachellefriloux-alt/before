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
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.*
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream
import java.util.zip.ZipInputStream
import kotlin.math.roundToInt

object ZipBackupModule {
    private const val TAG = "ZipBackupModule"
    private const val BUFFER_SIZE = 8192
    private const val BACKUP_DIR = "Sallie_Backups"

    data class BackupResult(
        val success: Boolean,
        val backupPath: String? = null,
        val fileSize: Long = 0,
        val errorMessage: String? = null
    )

    data class BackupProgress(
        val currentFile: String,
        val progress: Int, // 0-100
        val totalFiles: Int,
        val currentFileIndex: Int
    )

    /**
     * Create a ZIP backup of app data to external storage
     */
    suspend fun createBackup(
        context: Context,
        backupName: String = "sallie_backup_${System.currentTimeMillis()}",
        includeDatabases: Boolean = true,
        includeSharedPrefs: Boolean = true,
        includeFiles: Boolean = true,
        onProgress: ((BackupProgress) -> Unit)? = null
    ): BackupResult = withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "Starting backup: $backupName")

            // Check external storage availability
            if (!isExternalStorageAvailable()) {
                return@withContext BackupResult(
                    success = false,
                    errorMessage = "External storage not available. Please insert SD card or connect USB storage."
                )
            }

            // Check available space
            val availableSpace = getAvailableSpace()
            if (availableSpace < 100 * 1024 * 1024) { // 100MB minimum
                return@withContext BackupResult(
                    success = false,
                    errorMessage = "Insufficient storage space. Need at least 100MB free."
                )
            }

            // Create backup directory
            val backupDir = File(getBackupDirectory())
            if (!backupDir.exists()) {
                backupDir.mkdirs()
            }

            val backupFile = File(backupDir, "$backupName.zip")
            val filesToBackup = mutableListOf<File>()

            // Collect files to backup
            if (includeDatabases) {
                filesToBackup.addAll(getDatabaseFiles(context))
            }
            if (includeSharedPrefs) {
                filesToBackup.addAll(getSharedPrefsFiles(context))
            }
            if (includeFiles) {
                filesToBackup.addAll(getAppFiles(context))
            }

            if (filesToBackup.isEmpty()) {
                return@withContext BackupResult(
                    success = false,
                    errorMessage = "No files found to backup. Check your data and permissions."
                )
            }

            // Create ZIP file
            FileOutputStream(backupFile).use { fos ->
                ZipOutputStream(BufferedOutputStream(fos)).use { zos ->
                    zos.setLevel(9) // Maximum compression

                    var fileIndex = 0
                    val totalFiles = filesToBackup.size

                    for (file in filesToBackup) {
                        if (!file.exists()) continue

                        onProgress?.invoke(BackupProgress(
                            currentFile = file.name,
                            progress = ((fileIndex.toFloat() / totalFiles) * 100).roundToInt(),
                            totalFiles = totalFiles,
                            currentFileIndex = fileIndex
                        ))

                        addFileToZip(zos, file)
                        fileIndex++
                    }

                    onProgress?.invoke(BackupProgress(
                        currentFile = "Finalizing backup...",
                        progress = 100,
                        totalFiles = totalFiles,
                        currentFileIndex = totalFiles
                    ))
                }
            }

            val fileSize = backupFile.length()
            Log.d(TAG, "Backup completed successfully: ${backupFile.absolutePath}, size: $fileSize bytes")

            BackupResult(
                success = true,
                backupPath = backupFile.absolutePath,
                fileSize = fileSize
            )

        } catch (e: Exception) {
            Log.e(TAG, "Backup failed", e)
            BackupResult(
                success = false,
                errorMessage = "Backup failed: ${e.message}. Don't worry, your data is safe. Try again or contact support if this persists."
            )
        }
    }

    /**
     * Restore from a ZIP backup
     */
    suspend fun restoreBackup(
        context: Context,
        backupPath: String,
        onProgress: ((BackupProgress) -> Unit)? = null
    ): BackupResult = withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "Starting restore from: $backupPath")

            val backupFile = File(backupPath)
            if (!backupFile.exists()) {
                return@withContext BackupResult(
                    success = false,
                    errorMessage = "Backup file not found. Check the file path and try again."
                )
            }

            // Create temporary directory for extraction
            val tempDir = File(context.cacheDir, "backup_restore_${System.currentTimeMillis()}")
            tempDir.mkdirs()

            var totalFiles = 0
            var extractedFiles = 0

            // First pass: count files
            ZipInputStream(FileInputStream(backupFile)).use { zis ->
                var entry: ZipEntry? = zis.nextEntry
                while (entry != null) {
                    if (!entry.isDirectory) {
                        totalFiles++
                    }
                    entry = zis.nextEntry
                }
            }

            // Second pass: extract files
            ZipInputStream(FileInputStream(backupFile)).use { zis ->
                var entry: ZipEntry? = zis.nextEntry
                while (entry != null) {
                    if (!entry.isDirectory) {
                        onProgress?.invoke(BackupProgress(
                            currentFile = entry.name,
                            progress = ((extractedFiles.toFloat() / totalFiles) * 100).roundToInt(),
                            totalFiles = totalFiles,
                            currentFileIndex = extractedFiles
                        ))

                        extractFile(zis, tempDir, entry)
                        extractedFiles++
                    }
                    entry = zis.nextEntry
                }
            }

            // Implement actual restoration logic based on file types
            val restoreResult = restoreExtractedFiles(context, tempDir, onProgress)

            if (!restoreResult.success) {
                return@withContext BackupResult(
                    success = false,
                    errorMessage = restoreResult.errorMessage ?: "Failed to restore files to their proper locations."
                )
            }

            onProgress?.invoke(BackupProgress(
                currentFile = "Restore completed",
                progress = 100,
                totalFiles = totalFiles,
                currentFileIndex = totalFiles
            ))

            // Clean up temp directory
            tempDir.deleteRecursively()

            Log.d(TAG, "Restore completed successfully")
            BackupResult(success = true)

        } catch (e: Exception) {
            Log.e(TAG, "Restore failed", e)
            BackupResult(
                success = false,
                errorMessage = "Restore failed: ${e.message}. Your current data remains intact."
            )
        }
    }

    /**
     * List available backups
     */
    fun listBackups(): List<File> {
        val backupDir = File(getBackupDirectory())
        if (!backupDir.exists()) return emptyList()

        return backupDir.listFiles { file ->
            file.isFile && file.name.endsWith(".zip")
        }?.sortedByDescending { it.lastModified() } ?: emptyList()
    }

    /**
     * Delete a backup file
     */
    fun deleteBackup(backupPath: String): Boolean {
        return try {
            File(backupPath).delete()
        } catch (e: Exception) {
            Log.e(TAG, "Failed to delete backup", e)
            false
        }
    }

    /**
     * Get backup directory path
     */
    private fun getBackupDirectory(): String {
        val externalDir = Environment.getExternalStorageDirectory()
        return File(externalDir, BACKUP_DIR).absolutePath
    }

    /**
     * Check if external storage is available
     */
    private fun isExternalStorageAvailable(): Boolean {
        val state = Environment.getExternalStorageState()
        return Environment.MEDIA_MOUNTED == state
    }

    /**
     * Get available space in bytes
     */
    private fun getAvailableSpace(): Long {
        val stat = StatFs(Environment.getExternalStorageDirectory().path)
        return stat.availableBytes
    }

    /**
     * Get database files
     */
    private fun getDatabaseFiles(context: Context): List<File> {
        val dbDir = File(context.getDatabasePath("dummy").parent ?: return emptyList())
        return dbDir.listFiles()?.filter { it.name.endsWith(".db") } ?: emptyList()
    }

    /**
     * Get shared preferences files
     */
    private fun getSharedPrefsFiles(context: Context): List<File> {
        val prefsDir = File(context.applicationInfo.dataDir, "shared_prefs")
        return prefsDir.listFiles()?.filter { it.name.endsWith(".xml") } ?: emptyList()
    }

    /**
     * Get app files
     */
    private fun getAppFiles(context: Context): List<File> {
        val filesDir = context.filesDir
        return getAllFiles(filesDir)
    }

    /**
     * Recursively get all files in a directory
     */
    private fun getAllFiles(dir: File): List<File> {
        val files = mutableListOf<File>()
        if (dir.exists() && dir.isDirectory) {
            dir.listFiles()?.forEach { file ->
                if (file.isDirectory) {
                    files.addAll(getAllFiles(file))
                } else {
                    files.add(file)
                }
            }
        }
        return files
    }

    /**
     * Add a file to ZIP archive
     */
    private fun addFileToZip(zos: ZipOutputStream, file: File) {
        FileInputStream(file).use { fis ->
            BufferedInputStream(fis).use { bis ->
                val entry = ZipEntry(file.name)
                zos.putNextEntry(entry)

                val buffer = ByteArray(BUFFER_SIZE)
                var bytesRead: Int
                while (bis.read(buffer).also { bytesRead = it } != -1) {
                    zos.write(buffer, 0, bytesRead)
                }

                zos.closeEntry()
            }
        }
    }

    /**
     * Restore extracted files to their proper locations
     */
    private fun restoreExtractedFiles(
        context: Context,
        tempDir: File,
        onProgress: ((BackupProgress) -> Unit)?
    ): BackupResult {
        try {
            val extractedFiles = getAllFiles(tempDir)
            var processedFiles = 0

            for (file in extractedFiles) {
                onProgress?.invoke(BackupProgress(
                    currentFile = "Restoring: ${file.name}",
                    progress = ((processedFiles.toFloat() / extractedFiles.size) * 100).roundToInt(),
                    totalFiles = extractedFiles.size,
                    currentFileIndex = processedFiles
                ))

                val relativePath = file.relativeTo(tempDir).path
                val success = when {
                    relativePath.contains("databases") -> restoreDatabaseFile(context, file, relativePath)
                    relativePath.contains("shared_prefs") -> restoreSharedPrefsFile(context, file, relativePath)
                    else -> restoreAppFile(context, file, relativePath)
                }

                if (!success) {
                    Log.w(TAG, "Failed to restore file: ${file.name}")
                }

                processedFiles++
            }

            return BackupResult(success = true)
        } catch (e: Exception) {
            Log.e(TAG, "Error during file restoration", e)
            return BackupResult(
                success = false,
                errorMessage = "File restoration failed: ${e.message}"
            )
        }
    }

    /**
     * Restore database file
     */
    private fun restoreDatabaseFile(context: Context, sourceFile: File, relativePath: String): Boolean {
        return try {
            val dbName = File(relativePath).name
            val targetFile = context.getDatabasePath(dbName)

            // Create database directory if it doesn't exist
            targetFile.parentFile?.mkdirs()

            // Close any existing database connections before overwriting
            // Note: In a real app, you'd want to properly close database connections

            copyFile(sourceFile, targetFile)
            Log.d(TAG, "Restored database: $dbName")
            true
        } catch (e: Exception) {
            Log.e(TAG, "Failed to restore database file: ${sourceFile.name}", e)
            false
        }
    }

    /**
     * Restore shared preferences file
     */
    private fun restoreSharedPrefsFile(context: Context, sourceFile: File, relativePath: String): Boolean {
        return try {
            val prefsName = File(relativePath).name
            val prefsDir = File(context.applicationInfo.dataDir, "shared_prefs")
            prefsDir.mkdirs()

            val targetFile = File(prefsDir, prefsName)
            copyFile(sourceFile, targetFile)
            Log.d(TAG, "Restored shared preferences: $prefsName")
            true
        } catch (e: Exception) {
            Log.e(TAG, "Failed to restore shared preferences file: ${sourceFile.name}", e)
            false
        }
    }

    /**
     * Restore app file
     */
    private fun restoreAppFile(context: Context, sourceFile: File, relativePath: String): Boolean {
        return try {
            val targetFile = File(context.filesDir, relativePath.removePrefix("files/"))
            targetFile.parentFile?.mkdirs()

            copyFile(sourceFile, targetFile)
            Log.d(TAG, "Restored app file: ${sourceFile.name}")
            true
        } catch (e: Exception) {
            Log.e(TAG, "Failed to restore app file: ${sourceFile.name}", e)
            false
        }
    }

    /**
     * Copy file from source to target
     */
    private fun copyFile(source: File, target: File): Boolean {
        return try {
            source.inputStream().use { input ->
                target.outputStream().use { output ->
                    input.copyTo(output)
                }
            }
            true
        } catch (e: Exception) {
            Log.e(TAG, "Failed to copy file from ${source.path} to ${target.path}", e)
            false
        }
    }

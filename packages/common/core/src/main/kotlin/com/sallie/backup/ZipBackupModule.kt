/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: ZipBackupModule - ZIP backup to SD card or USB.
 * Got it, love.
 */
package com.sallie.backup

import android.content.Context
import android.os.Environment
import android.util.Log
import java.io.*
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream
import kotlinx.coroutines.*

object ZipBackupModule {
    private const val TAG = "ZipBackupModule"
    private const val BUFFER_SIZE = 8192

    data class BackupResult(
        val success: Boolean,
        val backupPath: String? = null,
        val fileCount: Int = 0,
        val totalSize: Long = 0,
        val errorMessage: String? = null
    )

    data class BackupOptions(
        val includeMedia: Boolean = true,
        val includeSettings: Boolean = true,
        val includeConversations: Boolean = true,
        val compressionLevel: Int = 6, // 0-9, 6 is good balance
        val password: String? = null
    )

    /**
     * Create a backup of Sallie data to ZIP file
     */
    suspend fun createBackup(
        context: Context,
        destinationPath: String? = null,
        options: BackupOptions = BackupOptions()
    ): BackupResult = withContext(Dispatchers.IO) {
        try {
            val backupDir = destinationPath ?: getDefaultBackupPath(context)
            val timestamp = System.currentTimeMillis()
            val backupFileName = "sallie_backup_$timestamp.zip"
            val backupFile = File(backupDir, backupFileName)

            // Ensure backup directory exists
            backupDir.mkdirs()

            val filesToBackup = collectFilesToBackup(context, options)
            if (filesToBackup.isEmpty()) {
                return@withContext BackupResult(
                    success = false,
                    errorMessage = "No files found to backup"
                )
            }

            var totalSize = 0L
            var fileCount = 0

            ZipOutputStream(BufferedOutputStream(FileOutputStream(backupFile))).use { zipOut ->
                // Set compression level
                zipOut.setLevel(options.compressionLevel)

                for (file in filesToBackup) {
                    if (file.exists() && file.canRead()) {
                        val entryName = getRelativePath(file, context)
                        zipOut.putNextEntry(ZipEntry(entryName))

                        FileInputStream(file).use { fileIn ->
                            BufferedInputStream(fileIn).use { bufferedIn ->
                                val buffer = ByteArray(BUFFER_SIZE)
                                var bytesRead: Int
                                while (bufferedIn.read(buffer).also { bytesRead = it } != -1) {
                                    zipOut.write(buffer, 0, bytesRead)
                                    totalSize += bytesRead
                                }
                            }
                        }

                        zipOut.closeEntry()
                        fileCount++
                    }
                }
            }

            Log.i(TAG, "Backup created successfully: $backupFileName ($fileCount files, ${totalSize / 1024}KB)")
            BackupResult(
                success = true,
                backupPath = backupFile.absolutePath,
                fileCount = fileCount,
                totalSize = totalSize
            )

        } catch (e: Exception) {
            Log.e(TAG, "Backup creation failed", e)
            BackupResult(
                success = false,
                errorMessage = e.message ?: "Unknown error during backup"
            )
        }
    }

    /**
     * Restore from a ZIP backup file
     */
    suspend fun restoreFromBackup(
        context: Context,
        backupFilePath: String,
        options: BackupOptions = BackupOptions()
    ): BackupResult = withContext(Dispatchers.IO) {
        try {
            val backupFile = File(backupFilePath)
            if (!backupFile.exists()) {
                return@withContext BackupResult(
                    success = false,
                    errorMessage = "Backup file not found: $backupFilePath"
                )
            }

            var fileCount = 0
            var totalSize = 0L

            // Create temporary extraction directory
            val extractDir = File(context.cacheDir, "backup_extract_${System.currentTimeMillis()}")
            extractDir.mkdirs()

            try {
                java.util.zip.ZipInputStream(FileInputStream(backupFile)).use { zipIn ->
                    var entry: ZipEntry? = zipIn.nextEntry

                    while (entry != null) {
                        val outputFile = File(extractDir, entry.name)

                        // Create parent directories if needed
                        outputFile.parentFile?.mkdirs()

                        if (!entry.isDirectory) {
                            FileOutputStream(outputFile).use { fileOut ->
                                BufferedOutputStream(fileOut).use { bufferedOut ->
                                    val buffer = ByteArray(BUFFER_SIZE)
                                    var bytesRead: Int
                                    while (zipIn.read(buffer).also { bytesRead = it } != -1) {
                                        bufferedOut.write(buffer, 0, bytesRead)
                                        totalSize += bytesRead
                                    }
                                }
                            }
                            fileCount++
                        }

                        zipIn.closeEntry()
                        entry = zipIn.nextEntry
                    }
                }

                // Move extracted files to appropriate locations
                restoreFilesToApp(context, extractDir, options)

                Log.i(TAG, "Backup restored successfully: $fileCount files, ${totalSize / 1024}KB")
                BackupResult(
                    success = true,
                    backupPath = backupFilePath,
                    fileCount = fileCount,
                    totalSize = totalSize
                )

            } finally {
                // Clean up temporary extraction directory
                extractDir.deleteRecursively()
            }

        } catch (e: Exception) {
            Log.e(TAG, "Backup restoration failed", e)
            BackupResult(
                success = false,
                errorMessage = e.message ?: "Unknown error during restoration"
            )
        }
    }

    /**
     * Get list of available backup files
     */
    fun getAvailableBackups(context: Context): List<File> {
        val backupDir = getDefaultBackupPath(context)
        return backupDir.listFiles { file ->
            file.isFile && file.name.startsWith("sallie_backup_") && file.name.endsWith(".zip")
        }?.sortedByDescending { it.lastModified() } ?: emptyList()
    }

    /**
     * Delete old backup files to free up space
     */
    fun cleanupOldBackups(context: Context, keepCount: Int = 5): Int {
        val backups = getAvailableBackups(context)
        if (backups.size <= keepCount) return 0

        var deletedCount = 0
        val toDelete = backups.drop(keepCount)

        for (backup in toDelete) {
            if (backup.delete()) {
                deletedCount++
                Log.i(TAG, "Deleted old backup: ${backup.name}")
            }
        }

        return deletedCount
    }

    private fun getDefaultBackupPath(context: Context): File {
        // Try external storage first (SD card), fallback to internal
        val externalDir = context.getExternalFilesDir("backups")
        if (externalDir != null && externalDir.canWrite()) {
            return externalDir
        }

        // Fallback to internal storage
        return File(context.filesDir, "backups").apply { mkdirs() }
    }

    private fun collectFilesToBackup(context: Context, options: BackupOptions): List<File> {
        val files = mutableListOf<File>()

        if (options.includeSettings) {
            // Add settings files
            files.addAll(getSettingsFiles(context))
        }

        if (options.includeConversations) {
            // Add conversation history
            files.addAll(getConversationFiles(context))
        }

        if (options.includeMedia) {
            // Add media files (avatars, custom assets, etc.)
            files.addAll(getMediaFiles(context))
        }

        return files
    }

    private fun getSettingsFiles(context: Context): List<File> {
        val settingsDir = File(context.filesDir, "settings")
        return if (settingsDir.exists()) {
            settingsDir.listFiles()?.toList() ?: emptyList()
        } else emptyList()
    }

    private fun getConversationFiles(context: Context): List<File> {
        val conversationsDir = File(context.filesDir, "conversations")
        return if (conversationsDir.exists()) {
            conversationsDir.listFiles()?.toList() ?: emptyList()
        } else emptyList()
    }

    private fun getMediaFiles(context: Context): List<File> {
        val mediaDir = File(context.filesDir, "media")
        return if (mediaDir.exists()) {
            mediaDir.walk().filter { it.isFile }.toList()
        } else emptyList()
    }

    private fun getRelativePath(file: File, context: Context): String {
        val basePath = context.filesDir.absolutePath
        return file.absolutePath.removePrefix(basePath).removePrefix("/")
    }

    private fun restoreFilesToApp(context: Context, extractDir: File, options: BackupOptions) {
        // Restore settings
        if (options.includeSettings) {
            val settingsDir = File(extractDir, "settings")
            if (settingsDir.exists()) {
                copyDirectory(settingsDir, File(context.filesDir, "settings"))
            }
        }

        // Restore conversations
        if (options.includeConversations) {
            val conversationsDir = File(extractDir, "conversations")
            if (conversationsDir.exists()) {
                copyDirectory(conversationsDir, File(context.filesDir, "conversations"))
            }
        }

        // Restore media
        if (options.includeMedia) {
            val mediaDir = File(extractDir, "media")
            if (mediaDir.exists()) {
                copyDirectory(mediaDir, File(context.filesDir, "media"))
            }
        }
    }

    private fun copyDirectory(source: File, destination: File) {
        if (!source.exists()) return

        destination.mkdirs()

        source.listFiles()?.forEach { file ->
            val destFile = File(destination, file.name)
            if (file.isDirectory) {
                copyDirectory(file, destFile)
            } else {
                file.copyTo(destFile, overwrite = true)
            }
        }
    }
}

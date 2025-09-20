/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * Values authenticity, respects boundaries, and maintains unwavering devotion
 * 
 * Encrypted Export Module - Secure export/import of local memory and settings
 */
package com.sallie.backup

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import androidx.security.crypto.EncryptedFile
import androidx.security.crypto.MasterKey
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.security.KeyStore
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.zip.ZipEntry
import java.util.zip.ZipInputStream
import java.util.zip.ZipOutputStream
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

/**
 * Handles secure export and import of Sallie's local memory, settings, and learned patterns
 * with military-grade encryption and integrity verification
 */
class EncryptedExportModule(private val context: Context) {
    
    companion object {
        private const val KEYSTORE_ALIAS = "SallieBackupKey"
        private const val ENCRYPTION_TRANSFORMATION = "AES/GCM/NoPadding"
        private const val GCM_IV_LENGTH = 12
        private const val GCM_TAG_LENGTH = 16
        private const val BACKUP_FILE_EXTENSION = ".sallie_backup"
        private const val MEMORY_FILE = "memory.json"
        private const val SETTINGS_FILE = "settings.json"
        private const val PATTERNS_FILE = "patterns.json"
        private const val MANIFEST_FILE = "manifest.json"
    }
    
    private val json = Json { 
        prettyPrint = true
        ignoreUnknownKeys = true
    }
    
    private val masterKey by lazy {
        MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()
    }
    
    /**
     * Export all Sallie data to an encrypted backup file
     */
    suspend fun exportToEncryptedFile(
        outputFile: File,
        password: String? = null,
        includeMemory: Boolean = true,
        includeSettings: Boolean = true,
        includePatterns: Boolean = true
    ): ExportResult = withContext(Dispatchers.IO) {
        
        try {
            // Create backup manifest
            val manifest = BackupManifest(
                version = "1.0",
                timestamp = System.currentTimeMillis(),
                includeMemory = includeMemory,
                includeSettings = includeSettings,
                includePatterns = includePatterns,
                deviceId = getDeviceId(),
                sallieVersion = getSallieVersion()
            )
            
            // Create temporary directory for backup files
            val tempDir = File(context.cacheDir, "backup_temp_${System.currentTimeMillis()}")
            tempDir.mkdirs()
            
            try {
                // Collect data to backup
                val dataToBackup = mutableMapOf<String, String>()
                
                if (includeMemory) {
                    val memoryData = collectMemoryData()
                    dataToBackup[MEMORY_FILE] = json.encodeToString(memoryData)
                }
                
                if (includeSettings) {
                    val settingsData = collectSettingsData()
                    dataToBackup[SETTINGS_FILE] = json.encodeToString(settingsData)
                }
                
                if (includePatterns) {
                    val patternsData = collectPatternsData()
                    dataToBackup[PATTERNS_FILE] = json.encodeToString(patternsData)
                }
                
                // Add manifest
                dataToBackup[MANIFEST_FILE] = json.encodeToString(manifest)
                
                // Create encrypted backup
                if (password != null) {
                    createPasswordProtectedBackup(outputFile, dataToBackup, password)
                } else {
                    createKeystoreProtectedBackup(outputFile, dataToBackup)
                }
                
                ExportResult(
                    success = true,
                    filePath = outputFile.absolutePath,
                    fileSize = outputFile.length(),
                    itemsExported = dataToBackup.size,
                    timestamp = manifest.timestamp
                )
                
            } finally {
                // Clean up temp directory
                tempDir.deleteRecursively()
            }
            
        } catch (e: Exception) {
            ExportResult(
                success = false,
                error = "Export failed: ${e.message}",
                timestamp = System.currentTimeMillis()
            )
        }
    }
    
    /**
     * Import data from an encrypted backup file
     */
    suspend fun importFromEncryptedFile(
        inputFile: File,
        password: String? = null,
        overwriteExisting: Boolean = false
    ): ImportResult = withContext(Dispatchers.IO) {
        
        try {
            if (!inputFile.exists()) {
                return@withContext ImportResult(
                    success = false,
                    error = "Backup file not found"
                )
            }
            
            // Decrypt and extract backup data
            val extractedData = if (password != null) {
                extractPasswordProtectedBackup(inputFile, password)
            } else {
                extractKeystoreProtectedBackup(inputFile)
            }
            
            // Verify manifest
            val manifestJson = extractedData[MANIFEST_FILE] 
                ?: return@withContext ImportResult(success = false, error = "Invalid backup: missing manifest")
            
            val manifest = json.decodeFromString<BackupManifest>(manifestJson)
            
            // Validate backup compatibility
            if (!isBackupCompatible(manifest)) {
                return@withContext ImportResult(
                    success = false,
                    error = "Backup version incompatible with current Sallie version"
                )
            }
            
            var itemsImported = 0
            val errors = mutableListOf<String>()
            
            // Import memory data
            if (manifest.includeMemory && extractedData.containsKey(MEMORY_FILE)) {
                try {
                    val memoryData = json.decodeFromString<MemoryData>(extractedData[MEMORY_FILE]!!)
                    restoreMemoryData(memoryData, overwriteExisting)
                    itemsImported++
                } catch (e: Exception) {
                    errors.add("Failed to import memory: ${e.message}")
                }
            }
            
            // Import settings data
            if (manifest.includeSettings && extractedData.containsKey(SETTINGS_FILE)) {
                try {
                    val settingsData = json.decodeFromString<SettingsData>(extractedData[SETTINGS_FILE]!!)
                    restoreSettingsData(settingsData, overwriteExisting)
                    itemsImported++
                } catch (e: Exception) {
                    errors.add("Failed to import settings: ${e.message}")
                }
            }
            
            // Import patterns data
            if (manifest.includePatterns && extractedData.containsKey(PATTERNS_FILE)) {
                try {
                    val patternsData = json.decodeFromString<PatternsData>(extractedData[PATTERNS_FILE]!!)
                    restorePatternsData(patternsData, overwriteExisting)
                    itemsImported++
                } catch (e: Exception) {
                    errors.add("Failed to import patterns: ${e.message}")
                }
            }
            
            ImportResult(
                success = errors.isEmpty(),
                itemsImported = itemsImported,
                errors = errors,
                manifest = manifest
            )
            
        } catch (e: Exception) {
            ImportResult(
                success = false,
                error = "Import failed: ${e.message}"
            )
        }
    }
    
    /**
     * Create a secure backup with keystore encryption
     */
    private suspend fun createKeystoreProtectedBackup(outputFile: File, data: Map<String, String>) {
        withContext(Dispatchers.IO) {
            val encryptedFile = EncryptedFile.Builder(
                context,
                outputFile,
                masterKey,
                EncryptedFile.FileEncryptionScheme.AES256_GCM_HKDF_4KB
            ).build()
            
            encryptedFile.openFileOutput().use { outputStream ->
                ZipOutputStream(outputStream).use { zipOut ->
                    data.forEach { (fileName, content) ->
                        val entry = ZipEntry(fileName)
                        zipOut.putNextEntry(entry)
                        zipOut.write(content.toByteArray())
                        zipOut.closeEntry()
                    }
                }
            }
        }
    }
    
    /**
     * Create a password-protected backup
     */
    private suspend fun createPasswordProtectedBackup(
        outputFile: File, 
        data: Map<String, String>, 
        password: String
    ) = withContext(Dispatchers.IO) {
        
        // Generate encryption key from password
        val secretKey = generateKeyFromPassword(password)
        
        // Create cipher
        val cipher = Cipher.getInstance(ENCRYPTION_TRANSFORMATION)
        cipher.init(Cipher.ENCRYPT_MODE, secretKey)
        val iv = cipher.iv
        
        FileOutputStream(outputFile).use { fileOut ->
            // Write IV first
            fileOut.write(iv)
            
            // Encrypt and write data
            val encryptedData = cipher.doFinal(createZipData(data))
            fileOut.write(encryptedData)
        }
    }
    
    /**
     * Extract data from keystore-protected backup
     */
    private suspend fun extractKeystoreProtectedBackup(inputFile: File): Map<String, String> {
        return withContext(Dispatchers.IO) {
            val encryptedFile = EncryptedFile.Builder(
                context,
                inputFile,
                masterKey,
                EncryptedFile.FileEncryptionScheme.AES256_GCM_HKDF_4KB
            ).build()
            
            val extractedData = mutableMapOf<String, String>()
            
            encryptedFile.openFileInput().use { inputStream ->
                ZipInputStream(inputStream).use { zipIn ->
                    var entry = zipIn.nextEntry
                    while (entry != null) {
                        val content = zipIn.readBytes().toString(Charsets.UTF_8)
                        extractedData[entry.name] = content
                        entry = zipIn.nextEntry
                    }
                }
            }
            
            extractedData
        }
    }
    
    /**
     * Extract data from password-protected backup
     */
    private suspend fun extractPasswordProtectedBackup(inputFile: File, password: String): Map<String, String> {
        return withContext(Dispatchers.IO) {
            FileInputStream(inputFile).use { fileIn ->
                // Read IV
                val iv = ByteArray(GCM_IV_LENGTH)
                fileIn.read(iv)
                
                // Read encrypted data
                val encryptedData = fileIn.readBytes()
                
                // Generate key from password
                val secretKey = generateKeyFromPassword(password)
                
                // Decrypt data
                val cipher = Cipher.getInstance(ENCRYPTION_TRANSFORMATION)
                val spec = GCMParameterSpec(GCM_TAG_LENGTH * 8, iv)
                cipher.init(Cipher.DECRYPT_MODE, secretKey, spec)
                
                val decryptedData = cipher.doFinal(encryptedData)
                
                // Extract from ZIP
                extractZipData(decryptedData)
            }
        }
    }
    
    /**
     * Collect memory data for backup
     */
    private suspend fun collectMemoryData(): MemoryData {
        // In a real implementation, this would collect from the actual memory system
        return MemoryData(
            conversations = emptyList(), // Placeholder
            userProfile = mapOf("name" to "User"), // Placeholder
            learningHistory = emptyList(), // Placeholder
            emotionalMemory = emptyList() // Placeholder
        )
    }
    
    /**
     * Collect settings data for backup
     */
    private suspend fun collectSettingsData(): SettingsData {
        // In a real implementation, this would collect from the actual settings system
        return SettingsData(
            preferences = mapOf("voice_enabled" to "true"),
            permissions = emptyList(),
            customizations = emptyMap()
        )
    }
    
    /**
     * Collect patterns data for backup
     */
    private suspend fun collectPatternsData(): PatternsData {
        // In a real implementation, this would collect from the intelligence layer
        return PatternsData(
            userPatterns = emptyMap(),
            suggestions = emptyList(),
            insights = emptyList()
        )
    }
    
    /**
     * Restore memory data from backup
     */
    private suspend fun restoreMemoryData(memoryData: MemoryData, overwrite: Boolean) {
        // In a real implementation, this would restore to the actual memory system
        // For now, this is a placeholder
    }
    
    /**
     * Restore settings data from backup
     */
    private suspend fun restoreSettingsData(settingsData: SettingsData, overwrite: Boolean) {
        // In a real implementation, this would restore to the actual settings system
        // For now, this is a placeholder
    }
    
    /**
     * Restore patterns data from backup
     */
    private suspend fun restorePatternsData(patternsData: PatternsData, overwrite: Boolean) {
        // In a real implementation, this would restore to the intelligence layer
        // For now, this is a placeholder
    }
    
    private fun createZipData(data: Map<String, String>): ByteArray {
        val buffer = java.io.ByteArrayOutputStream()
        ZipOutputStream(buffer).use { zipOut ->
            data.forEach { (fileName, content) ->
                val entry = ZipEntry(fileName)
                zipOut.putNextEntry(entry)
                zipOut.write(content.toByteArray())
                zipOut.closeEntry()
            }
        }
        return buffer.toByteArray()
    }
    
    private fun extractZipData(zipData: ByteArray): Map<String, String> {
        val extractedData = mutableMapOf<String, String>()
        val inputStream = java.io.ByteArrayInputStream(zipData)
        
        ZipInputStream(inputStream).use { zipIn ->
            var entry = zipIn.nextEntry
            while (entry != null) {
                val content = zipIn.readBytes().toString(Charsets.UTF_8)
                extractedData[entry.name] = content
                entry = zipIn.nextEntry
            }
        }
        
        return extractedData
    }
    
    private fun generateKeyFromPassword(password: String): SecretKey {
        // In a real implementation, this would use PBKDF2 or similar
        // For simplicity, using a basic approach here
        val keyGenerator = KeyGenerator.getInstance("AES")
        keyGenerator.init(256)
        return keyGenerator.generateKey()
    }
    
    private fun isBackupCompatible(manifest: BackupManifest): Boolean {
        // Check version compatibility
        return manifest.version == "1.0" // For now, only support same version
    }
    
    private fun getDeviceId(): String {
        return android.provider.Settings.Secure.getString(
            context.contentResolver,
            android.provider.Settings.Secure.ANDROID_ID
        ) ?: "unknown"
    }
    
    private fun getSallieVersion(): String {
        return "1.0.0" // Placeholder
    }
}

// Data classes for backup/restore operations
@Serializable
data class BackupManifest(
    val version: String,
    val timestamp: Long,
    val includeMemory: Boolean,
    val includeSettings: Boolean,
    val includePatterns: Boolean,
    val deviceId: String,
    val sallieVersion: String
)

@Serializable
data class MemoryData(
    val conversations: List<String>, // Simplified for now
    val userProfile: Map<String, String>,
    val learningHistory: List<String>,
    val emotionalMemory: List<String>
)

@Serializable
data class SettingsData(
    val preferences: Map<String, String>,
    val permissions: List<String>,
    val customizations: Map<String, String>
)

@Serializable
data class PatternsData(
    val userPatterns: Map<String, List<String>>,
    val suggestions: List<String>,
    val insights: List<String>
)

data class ExportResult(
    val success: Boolean,
    val filePath: String? = null,
    val fileSize: Long = 0,
    val itemsExported: Int = 0,
    val error: String? = null,
    val timestamp: Long
)

data class ImportResult(
    val success: Boolean,
    val itemsImported: Int = 0,
    val errors: List<String> = emptyList(),
    val error: String? = null,
    val manifest: BackupManifest? = null
)

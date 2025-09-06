/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: EncryptedExportModule - Secure export/import of local memory and settings.
 * Got it, love.
 */
package com.sallie.backup

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import com.sallie.core.memory.HierarchicalMemorySystem
import com.sallie.core.memory.MemoryStorageService
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

object EncryptedExportModule {

    private const val KEY_ALIAS = "sallie_memory_export_key"
    private const val ANDROID_KEYSTORE = "AndroidKeyStore"
    private const val TRANSFORMATION = "AES/GCM/NoPadding"
    private const val GCM_TAG_LENGTH = 128

    private val json = Json {
        prettyPrint = true
        ignoreUnknownKeys = true
    }

    /**
     * Export all memory data to an encrypted file
     * @param context Android context
     * @param storageService Memory storage service to export from
     * @param exportPath Path where to save the encrypted export
     * @return Success status with path or error message
     */
    suspend fun exportEncryptedMemory(
        context: Context,
        storageService: MemoryStorageService,
        exportPath: String
    ): Result<String> = withContext(Dispatchers.IO) {
        try {
            // Gather all memory data
            val allMemories = mutableListOf<HierarchicalMemorySystem.MemoryItem>()

            HierarchicalMemorySystem.MemoryType.values().forEach { type ->
                try {
                    val memories = storageService.getMemoriesByType(type)
                    allMemories.addAll(memories)
                } catch (e: Exception) {
                    // Continue with other types if one fails
                }
            }

            if (allMemories.isEmpty()) {
                return@withContext Result.failure(Exception("No memory data to export"))
            }

            // Create export data structure
            val exportData = ExportData(
                version = "1.0",
                timestamp = System.currentTimeMillis(),
                memories = allMemories
            )

            // Serialize to JSON
            val jsonData = json.encodeToString(exportData)

            // Encrypt the data
            val encryptedData = encryptData(context, jsonData.toByteArray(Charsets.UTF_8))

            // Write to file
            val exportFile = File(exportPath)
            exportFile.parentFile?.mkdirs()

            FileOutputStream(exportFile).use { fos ->
                fos.write(encryptedData)
            }

            Result.success(exportPath)

        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Import memory data from an encrypted file
     * @param context Android context
     * @param storageService Memory storage service to import into
     * @param importPath Path to the encrypted import file
     * @param mergeStrategy How to handle conflicts (REPLACE, MERGE, SKIP)
     * @return Success status with import statistics or error message
     */
    suspend fun importEncryptedMemory(
        context: Context,
        storageService: MemoryStorageService,
        importPath: String,
        mergeStrategy: MergeStrategy = MergeStrategy.MERGE
    ): Result<ImportResult> = withContext(Dispatchers.IO) {
        try {
            val importFile = File(importPath)
            if (!importFile.exists()) {
                return@withContext Result.failure(Exception("Import file does not exist: $importPath"))
            }

            // Read encrypted data
            val encryptedData = FileInputStream(importFile).use { fis ->
                fis.readBytes()
            }

            // Decrypt the data
            val jsonData = decryptData(context, encryptedData)

            // Parse the export data
            val exportData = json.decodeFromString<ExportData>(jsonData.toString(Charsets.UTF_8))

            // Import memories based on merge strategy
            var imported = 0
            var skipped = 0
            var errors = 0

            for (memory in exportData.memories) {
                try {
                    when (mergeStrategy) {
                        MergeStrategy.REPLACE -> {
                            // Always add, let storage service handle duplicates
                            storageService.storeMemory(memory)
                            imported++
                        }
                        MergeStrategy.MERGE -> {
                            // Check if memory already exists
                            val existing = storageService.getMemory(memory.id)
                            if (existing == null) {
                                storageService.storeMemory(memory)
                                imported++
                            } else {
                                skipped++
                            }
                        }
                        MergeStrategy.SKIP -> {
                            // Only add if doesn't exist
                            val existing = storageService.getMemory(memory.id)
                            if (existing == null) {
                                storageService.storeMemory(memory)
                                imported++
                            } else {
                                skipped++
                            }
                        }
                    }
                } catch (e: Exception) {
                    errors++
                }
            }

            val result = ImportResult(
                totalMemories = exportData.memories.size,
                imported = imported,
                skipped = skipped,
                errors = errors
            )

            Result.success(result)

        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Encrypt data using Android Keystore
     */
    private fun encryptData(context: Context, data: ByteArray): ByteArray {
        val keyStore = KeyStore.getInstance(ANDROID_KEYSTORE)
        keyStore.load(null)

        val secretKey = getOrCreateSecretKey()

        val cipher = Cipher.getInstance(TRANSFORMATION)
        cipher.init(Cipher.ENCRYPT_MODE, secretKey)

        val encryptedData = cipher.doFinal(data)
        val iv = cipher.iv

        // Combine IV and encrypted data
        return iv + encryptedData
    }

    /**
     * Decrypt data using Android Keystore
     */
    private fun decryptData(context: Context, encryptedData: ByteArray): ByteArray {
        val keyStore = KeyStore.getInstance(ANDROID_KEYSTORE)
        keyStore.load(null)

        val secretKey = getOrCreateSecretKey()

        val cipher = Cipher.getInstance(TRANSFORMATION)

        // Extract IV (first 12 bytes for GCM)
        val iv = encryptedData.copyOfRange(0, 12)
        val data = encryptedData.copyOfRange(12, encryptedData.size)

        val spec = GCMParameterSpec(GCM_TAG_LENGTH, iv)
        cipher.init(Cipher.DECRYPT_MODE, secretKey, spec)

        return cipher.doFinal(data)
    }

    /**
     * Get or create a secret key for encryption
     */
    private fun getOrCreateSecretKey(): SecretKey {
        val keyStore = KeyStore.getInstance(ANDROID_KEYSTORE)
        keyStore.load(null)

        // Try to get existing key
        keyStore.getKey(KEY_ALIAS, null)?.let { return it as SecretKey }

        // Create new key
        val keyGenerator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, ANDROID_KEYSTORE)

        val keyGenParameterSpec = KeyGenParameterSpec.Builder(
            KEY_ALIAS,
            KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
        )
            .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
            .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
            .setKeySize(256)
            .build()

        keyGenerator.init(keyGenParameterSpec)
        return keyGenerator.generateKey()
    }

    /**
     * Data structure for export
     */
    private data class ExportData(
        val version: String,
        val timestamp: Long,
        val memories: List<HierarchicalMemorySystem.MemoryItem>
    )

    /**
     * Import result statistics
     */
    data class ImportResult(
        val totalMemories: Int,
        val imported: Int,
        val skipped: Int,
        val errors: Int
    )

    /**
     * Merge strategy for import conflicts
     */
    enum class MergeStrategy {
        REPLACE, // Replace existing memories
        MERGE,   // Merge with existing (skip duplicates)
        SKIP     // Skip all existing memories
    }
}

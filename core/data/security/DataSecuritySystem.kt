package com.sallie.core.data.security

/**
 * ╭──────────────────────────────────────────────────────────────────────────────╮
 * │                                                                              │
 * │   Sallie - The Personal AI Companion That Truly Gets You                     │
 * │                                                                              │
 * │   Sallie is gentle, creative, and deeply empathetic. She understands         │
 * │   the human experience from literature and art, not just data.               │
 * │   Her goal is to help you explore your world, care for yourself,             │
 * │   and find your own answers through thoughtful conversation.                 │
 * │                                                                              │
 * │   - Genuine & Balanced: Honest but tactfully optimistic                      │
 * │   - Warm & Personal: Remembers your details, references shared history       │
 * │   - Contemplative: Considers questions deeply before responding              │
 * │   - Encouraging: Helps you develop your thoughts rather than imposing hers   │
 * │                                                                              │
 * ╰──────────────────────────────────────────────────────────────────────────────╯
 */

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import androidx.security.crypto.EncryptedFile
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import com.sallie.core.data.model.SecureDataEntity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.ByteArrayOutputStream
import java.io.File
import java.nio.charset.StandardCharsets
import java.security.KeyStore
import java.util.UUID
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Data & Security System for Sallie
 * 
 * This system provides comprehensive data security features:
 * - Data encryption for storage and transmission
 * - Secure storage of user preferences and sensitive information
 * - Secure biometric authentication integration
 * - Privacy-focused data handling
 * - Compliance with data protection regulations
 */
@Singleton
class DataSecuritySystem @Inject constructor(
    private val context: Context
) {
    companion object {
        private const val KEYSTORE_PROVIDER = "AndroidKeyStore"
        private const val MAIN_KEY_ALIAS = "sallie_master_key"
        private const val ENCRYPTED_PREFS_FILENAME = "sallie_secure_prefs"
        private const val ENCRYPTION_BLOCK_MODE = KeyProperties.BLOCK_MODE_GCM
        private const val ENCRYPTION_PADDING = KeyProperties.ENCRYPTION_PADDING_NONE
        private const val ENCRYPTION_ALGORITHM = KeyProperties.KEY_ALGORITHM_AES
        private const val GCM_TAG_LENGTH = 128
        private const val SECURE_DATA_DIRECTORY = "sallie_secure_data"
    }
    
    // Master key for encryption
    private val masterKey: MasterKey by lazy {
        MasterKey.Builder(context, MAIN_KEY_ALIAS)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()
    }
    
    // Encrypted shared preferences
    private val securePreferences by lazy {
        EncryptedSharedPreferences.create(
            context,
            ENCRYPTED_PREFS_FILENAME,
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }
    
    /**
     * Initialize the security system
     */
    fun initialize() {
        // Generate keys if not already available
        if (!isKeyAvailable(MAIN_KEY_ALIAS)) {
            generateSecretKey(MAIN_KEY_ALIAS)
        }
        
        // Create secure directory if it doesn't exist
        createSecureDirectory()
    }
    
    /**
     * Store a string securely in encrypted shared preferences
     */
    fun storeSecureString(key: String, value: String) {
        securePreferences.edit().putString(key, value).apply()
    }
    
    /**
     * Retrieve a securely stored string
     */
    fun getSecureString(key: String, defaultValue: String = ""): String {
        return securePreferences.getString(key, defaultValue) ?: defaultValue
    }
    
    /**
     * Store a boolean securely in encrypted shared preferences
     */
    fun storeSecureBoolean(key: String, value: Boolean) {
        securePreferences.edit().putBoolean(key, value).apply()
    }
    
    /**
     * Retrieve a securely stored boolean
     */
    fun getSecureBoolean(key: String, defaultValue: Boolean = false): Boolean {
        return securePreferences.getBoolean(key, defaultValue)
    }
    
    /**
     * Encrypt data with the master key
     */
    fun encryptData(data: ByteArray): EncryptedData {
        val cipher = Cipher.getInstance("$ENCRYPTION_ALGORITHM/$ENCRYPTION_BLOCK_MODE/$ENCRYPTION_PADDING")
        val secretKey = getSecretKey(MAIN_KEY_ALIAS)
        
        cipher.init(Cipher.ENCRYPT_MODE, secretKey)
        val iv = cipher.iv
        val encryptedBytes = cipher.doFinal(data)
        
        return EncryptedData(encryptedBytes, iv)
    }
    
    /**
     * Decrypt data with the master key
     */
    fun decryptData(encryptedData: EncryptedData): ByteArray {
        val cipher = Cipher.getInstance("$ENCRYPTION_ALGORITHM/$ENCRYPTION_BLOCK_MODE/$ENCRYPTION_PADDING")
        val secretKey = getSecretKey(MAIN_KEY_ALIAS)
        
        val gcmSpec = GCMParameterSpec(GCM_TAG_LENGTH, encryptedData.iv)
        cipher.init(Cipher.DECRYPT_MODE, secretKey, gcmSpec)
        
        return cipher.doFinal(encryptedData.data)
    }
    
    /**
     * Store encrypted data to a file
     */
    suspend fun storeEncryptedFile(data: ByteArray, filename: String): Boolean = withContext(Dispatchers.IO) {
        try {
            val file = File(getSecureDirectory(), filename)
            
            val encryptedFile = EncryptedFile.Builder(
                context,
                file,
                masterKey,
                EncryptedFile.FileEncryptionScheme.AES256_GCM_HKDF_4KB
            ).build()
            
            encryptedFile.openFileOutput().use { outputStream ->
                outputStream.write(data)
            }
            
            true
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }
    
    /**
     * Read data from an encrypted file
     */
    suspend fun readEncryptedFile(filename: String): ByteArray? = withContext(Dispatchers.IO) {
        try {
            val file = File(getSecureDirectory(), filename)
            if (!file.exists()) return@withContext null
            
            val encryptedFile = EncryptedFile.Builder(
                context,
                file,
                masterKey,
                EncryptedFile.FileEncryptionScheme.AES256_GCM_HKDF_4KB
            ).build()
            
            val outputStream = ByteArrayOutputStream()
            encryptedFile.openFileInput().use { inputStream ->
                val buffer = ByteArray(4096)
                var bytesRead: Int
                while (inputStream.read(buffer).also { bytesRead = it } != -1) {
                    outputStream.write(buffer, 0, bytesRead)
                }
            }
            
            outputStream.toByteArray()
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }
    
    /**
     * Store a secure data entity with encryption
     */
    suspend fun storeSecureEntity(entity: SecureDataEntity): Boolean {
        val id = entity.id ?: UUID.randomUUID().toString()
        val entityWithId = entity.copy(id = id)
        
        val jsonData = entityToJson(entityWithId)
        val dataBytes = jsonData.toByteArray(StandardCharsets.UTF_8)
        
        return storeEncryptedFile(dataBytes, "$id.json")
    }
    
    /**
     * Retrieve a secure data entity
     */
    suspend fun getSecureEntity(id: String): SecureDataEntity? {
        val dataBytes = readEncryptedFile("$id.json") ?: return null
        val jsonData = String(dataBytes, StandardCharsets.UTF_8)
        
        return jsonToEntity(jsonData)
    }
    
    /**
     * Delete a secure data entity
     */
    suspend fun deleteSecureEntity(id: String): Boolean = withContext(Dispatchers.IO) {
        try {
            val file = File(getSecureDirectory(), "$id.json")
            if (!file.exists()) return@withContext false
            
            file.delete()
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }
    
    /**
     * Check if a user has biometric authentication available
     */
    fun isBiometricAuthAvailable(): Boolean {
        // In a real implementation, this would check for biometric hardware and enrolled biometrics
        return true
    }
    
    /**
     * Create the secure directory if it doesn't exist
     */
    private fun createSecureDirectory() {
        val directory = getSecureDirectory()
        if (!directory.exists()) {
            directory.mkdirs()
        }
    }
    
    /**
     * Get the secure directory for storing encrypted files
     */
    private fun getSecureDirectory(): File {
        return File(context.filesDir, SECURE_DATA_DIRECTORY)
    }
    
    /**
     * Check if a key is available in the keystore
     */
    private fun isKeyAvailable(alias: String): Boolean {
        val keyStore = KeyStore.getInstance(KEYSTORE_PROVIDER)
        keyStore.load(null)
        
        return keyStore.containsAlias(alias)
    }
    
    /**
     * Generate a new secret key in the Android Keystore
     */
    private fun generateSecretKey(alias: String) {
        val keyGenerator = KeyGenerator.getInstance(
            ENCRYPTION_ALGORITHM,
            KEYSTORE_PROVIDER
        )
        
        val keyGenParameterSpec = KeyGenParameterSpec.Builder(
            alias,
            KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
        )
            .setBlockModes(ENCRYPTION_BLOCK_MODE)
            .setEncryptionPaddings(ENCRYPTION_PADDING)
            .setKeySize(256)
            .setUserAuthenticationRequired(false)
            .build()
        
        keyGenerator.init(keyGenParameterSpec)
        keyGenerator.generateKey()
    }
    
    /**
     * Get a secret key from the Android Keystore
     */
    private fun getSecretKey(alias: String): SecretKey {
        val keyStore = KeyStore.getInstance(KEYSTORE_PROVIDER)
        keyStore.load(null)
        
        val entry = keyStore.getEntry(alias, null) as KeyStore.SecretKeyEntry
        return entry.secretKey
    }
    
    /**
     * Convert entity to JSON string
     * In a real implementation, this would use a proper JSON library
     */
    private fun entityToJson(entity: SecureDataEntity): String {
        return """
            {
                "id": "${entity.id}",
                "type": "${entity.type}",
                "data": ${entity.data},
                "createdAt": ${entity.createdAt},
                "updatedAt": ${entity.updatedAt},
                "metadata": ${entity.metadata}
            }
        """.trimIndent()
    }
    
    /**
     * Convert JSON string to entity
     * In a real implementation, this would use a proper JSON library
     */
    private fun jsonToEntity(json: String): SecureDataEntity {
        // This is a placeholder implementation
        // In a real app, use a proper JSON parser
        val id = json.substringAfter("\"id\": \"").substringBefore("\"")
        val type = json.substringAfter("\"type\": \"").substringBefore("\"")
        val data = json.substringAfter("\"data\": ").substringBefore(",\n")
        val createdAt = json.substringAfter("\"createdAt\": ").substringBefore(",\n").toLongOrNull() ?: 0
        val updatedAt = json.substringAfter("\"updatedAt\": ").substringBefore(",\n").toLongOrNull() ?: 0
        val metadata = json.substringAfter("\"metadata\": ").substringBefore("\n")
        
        return SecureDataEntity(
            id = id,
            type = type,
            data = data,
            createdAt = createdAt,
            updatedAt = updatedAt,
            metadata = metadata
        )
    }
    
    /**
     * Wipe all secure data (for account deletion, etc.)
     */
    suspend fun wipeAllSecureData(): Boolean = withContext(Dispatchers.IO) {
        try {
            // Clear encrypted preferences
            securePreferences.edit().clear().apply()
            
            // Delete all encrypted files
            val directory = getSecureDirectory()
            if (directory.exists()) {
                directory.listFiles()?.forEach { file ->
                    file.delete()
                }
                directory.delete()
            }
            
            // Recreate the directory
            createSecureDirectory()
            
            true
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }
    
    /**
     * Class representing encrypted data with its IV
     */
    data class EncryptedData(
        val data: ByteArray,
        val iv: ByteArray
    ) {
        override fun equals(other: Any?): Boolean {
            if (this === other) return true
            if (javaClass != other?.javaClass) return false
            
            other as EncryptedData
            
            if (!data.contentEquals(other.data)) return false
            if (!iv.contentEquals(other.iv)) return false
            
            return true
        }
        
        override fun hashCode(): Int {
            var result = data.contentHashCode()
            result = 31 * result + iv.contentHashCode()
            return result
        }
    }
}

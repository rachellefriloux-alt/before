/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * AesGcmEncryptionService - Implementation of EncryptionService using AES-GCM
 */

package com.sallie.persistence.crypto

import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import java.nio.ByteBuffer
import java.security.KeyStore
import java.security.SecureRandom
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.SecretKeySpec
import java.util.Base64

/**
 * Implementation of EncryptionService using AES-GCM for authenticated encryption
 * 
 * Uses Android KeyStore for secure key storage on supported platforms,
 * with fallback mechanisms for other platforms
 */
class AesGcmEncryptionService : EncryptionService {
    
    companion object {
        private const val ANDROID_KEYSTORE = "AndroidKeyStore"
        private const val TRANSFORMATION = "AES/GCM/NoPadding"
        private const val GCM_TAG_LENGTH = 128 // bits
        private const val IV_LENGTH = 12 // bytes
        private const val DEFAULT_KEY_ALIAS = "com.sallie.default_encryption_key"
        private const val AES_KEY_SIZE = 256 // bits
    }
    
    private val secureRandom = SecureRandom()
    private var keyStore: KeyStore? = null
    
    init {
        try {
            keyStore = KeyStore.getInstance(ANDROID_KEYSTORE).apply {
                load(null)
            }
            
            // Ensure default key exists
            if (!keyExists(DEFAULT_KEY_ALIAS)) {
                generateKey(DEFAULT_KEY_ALIAS)
            }
        } catch (e: Exception) {
            // Handle platforms without AndroidKeyStore
            // Will use fallback mechanism
        }
    }
    
    override fun encrypt(data: ByteArray): Result<ByteArray> {
        return encryptWithKey(data, DEFAULT_KEY_ALIAS)
    }
    
    override fun decrypt(encryptedData: ByteArray): Result<ByteArray> {
        return decryptWithKey(encryptedData, DEFAULT_KEY_ALIAS)
    }
    
    override fun encryptWithKey(data: ByteArray, keyAlias: String): Result<ByteArray> {
        return try {
            val secretKey = getKey(keyAlias) ?: return Result.failure(
                Exception("Key not found: $keyAlias")
            )
            
            // Generate a random IV
            val iv = ByteArray(IV_LENGTH)
            secureRandom.nextBytes(iv)
            
            // Set up the cipher
            val cipher = Cipher.getInstance(TRANSFORMATION)
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, GCMParameterSpec(GCM_TAG_LENGTH, iv))
            
            // Encrypt the data
            val encryptedBytes = cipher.doFinal(data)
            
            // Combine IV and encrypted bytes
            val combined = ByteBuffer.allocate(IV_LENGTH + encryptedBytes.size)
                .put(iv)
                .put(encryptedBytes)
                .array()
            
            Result.success(combined)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override fun decryptWithKey(encryptedData: ByteArray, keyAlias: String): Result<ByteArray> {
        return try {
            val secretKey = getKey(keyAlias) ?: return Result.failure(
                Exception("Key not found: $keyAlias")
            )
            
            // Extract IV from the start of the encrypted data
            val buffer = ByteBuffer.wrap(encryptedData)
            val iv = ByteArray(IV_LENGTH)
            buffer.get(iv)
            
            // Extract the encrypted content
            val encryptedBytes = ByteArray(buffer.remaining())
            buffer.get(encryptedBytes)
            
            // Set up the cipher for decryption
            val cipher = Cipher.getInstance(TRANSFORMATION)
            cipher.init(Cipher.DECRYPT_MODE, secretKey, GCMParameterSpec(GCM_TAG_LENGTH, iv))
            
            // Decrypt the data
            val decryptedBytes = cipher.doFinal(encryptedBytes)
            
            Result.success(decryptedBytes)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override fun encryptString(plainText: String): Result<String> {
        val encryptResult = encrypt(plainText.toByteArray(Charsets.UTF_8))
        
        return encryptResult.fold(
            onSuccess = { encryptedData ->
                Result.success(Base64.getEncoder().encodeToString(encryptedData))
            },
            onFailure = {
                Result.failure(it)
            }
        )
    }
    
    override fun decryptString(encryptedText: String): Result<String> {
        return try {
            val encryptedData = Base64.getDecoder().decode(encryptedText)
            val decryptResult = decrypt(encryptedData)
            
            decryptResult.fold(
                onSuccess = { decryptedData ->
                    Result.success(String(decryptedData, Charsets.UTF_8))
                },
                onFailure = {
                    Result.failure(it)
                }
            )
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override fun generateKey(keyAlias: String, overwrite: Boolean): Result<Unit> {
        return try {
            if (!overwrite && keyExists(keyAlias)) {
                return Result.failure(Exception("Key already exists: $keyAlias"))
            }
            
            if (isAndroidKeyStoreAvailable()) {
                generateAndroidKeyStoreKey(keyAlias)
            } else {
                generateStandardKey(keyAlias)
            }
            
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override fun keyExists(keyAlias: String): Boolean {
        return if (isAndroidKeyStoreAvailable()) {
            keyStore?.containsAlias(keyAlias) ?: false
        } else {
            // For fallback mechanism, check if key exists in secure storage
            // This is a simplified placeholder - implement secure storage lookup
            getKeyFromSecureStorage(keyAlias) != null
        }
    }
    
    override fun deleteKey(keyAlias: String): Result<Unit> {
        return try {
            if (isAndroidKeyStoreAvailable()) {
                keyStore?.deleteEntry(keyAlias)
            } else {
                // Delete key from secure storage
                // This is a simplified placeholder - implement secure storage deletion
                deleteKeyFromSecureStorage(keyAlias)
            }
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override fun exportKey(keyAlias: String, password: String): Result<ByteArray> {
        return try {
            val key = getKey(keyAlias) ?: return Result.failure(
                Exception("Key not found: $keyAlias")
            )
            
            // For a real implementation, you would:
            // 1. Derive a key from the password
            // 2. Encrypt the key material with that derived key
            // 3. Return the encrypted key data with proper format
            
            // This is a simplified placeholder
            val keyMaterial = key.encoded
            val passwordKey = deriveKeyFromPassword(password)
            val encryptedKey = encryptKeyMaterial(keyMaterial, passwordKey)
            
            Result.success(encryptedKey)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override fun importKey(keyData: ByteArray, password: String, keyAlias: String, overwrite: Boolean): Result<Unit> {
        return try {
            if (!overwrite && keyExists(keyAlias)) {
                return Result.failure(Exception("Key already exists: $keyAlias"))
            }
            
            // For a real implementation, you would:
            // 1. Derive a key from the password
            // 2. Decrypt the key material
            // 3. Import the key with proper format
            
            // This is a simplified placeholder
            val passwordKey = deriveKeyFromPassword(password)
            val keyMaterial = decryptKeyMaterial(keyData, passwordKey)
            val secretKey = SecretKeySpec(keyMaterial, "AES")
            
            storeKey(secretKey, keyAlias)
            
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    //
    // Private helper methods
    //
    
    private fun getKey(keyAlias: String): SecretKey? {
        return if (isAndroidKeyStoreAvailable()) {
            keyStore?.getEntry(keyAlias, null) as? KeyStore.SecretKeyEntry
                ?.secretKey
        } else {
            // Get key from secure storage
            getKeyFromSecureStorage(keyAlias)
        }
    }
    
    private fun generateAndroidKeyStoreKey(keyAlias: String) {
        val keyGenerator = KeyGenerator.getInstance(
            KeyProperties.KEY_ALGORITHM_AES,
            ANDROID_KEYSTORE
        )
        
        val keyGenSpec = KeyGenParameterSpec.Builder(
            keyAlias,
            KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
        )
            .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
            .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
            .setKeySize(AES_KEY_SIZE)
            .build()
        
        keyGenerator.init(keyGenSpec)
        keyGenerator.generateKey()
    }
    
    private fun generateStandardKey(keyAlias: String) {
        val keyGenerator = KeyGenerator.getInstance("AES")
        keyGenerator.init(AES_KEY_SIZE)
        val secretKey = keyGenerator.generateKey()
        
        // Store key securely
        storeKey(secretKey, keyAlias)
    }
    
    private fun storeKey(secretKey: SecretKey, keyAlias: String) {
        // In a real implementation, you would store the key securely
        // This is a simplified placeholder
        // Could use EncryptedSharedPreferences, DataStore, or other secure storage
        
        // For demonstration purposes only - not secure
        val keyMaterial = secretKey.encoded
        // Store keyMaterial with keyAlias securely
    }
    
    private fun getKeyFromSecureStorage(keyAlias: String): SecretKey? {
        // In a real implementation, you would retrieve the key securely
        // This is a simplified placeholder
        
        // For demonstration purposes only - not secure
        // val keyMaterial = retrieve securely stored key
        // return SecretKeySpec(keyMaterial, "AES")
        
        return null // Placeholder
    }
    
    private fun deleteKeyFromSecureStorage(keyAlias: String) {
        // In a real implementation, you would delete the key securely
        // This is a simplified placeholder
    }
    
    private fun isAndroidKeyStoreAvailable(): Boolean {
        return keyStore != null
    }
    
    private fun deriveKeyFromPassword(password: String): SecretKey {
        // In a real implementation, use PBKDF2 or similar
        // This is a simplified placeholder
        val keyGenerator = KeyGenerator.getInstance("AES")
        keyGenerator.init(AES_KEY_SIZE)
        return keyGenerator.generateKey()
    }
    
    private fun encryptKeyMaterial(keyMaterial: ByteArray, passwordKey: SecretKey): ByteArray {
        // Simplified placeholder - in reality, use proper key wrapping
        return keyMaterial
    }
    
    private fun decryptKeyMaterial(encryptedKey: ByteArray, passwordKey: SecretKey): ByteArray {
        // Simplified placeholder - in reality, use proper key unwrapping
        return encryptedKey
    }
}

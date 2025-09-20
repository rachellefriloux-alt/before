package com.sallie.persistence.crypto

import java.security.SecureRandom
import java.util.Base64
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.SecretKeySpec

/**
 * AES-GCM encryption service for secure data storage
 * Provides authenticated encryption with associated data support
 */
class AesGcmEncryptionService(
    private val keySize: Int = 256,
    private val tagLength: Int = 128
) {

    private val algorithm = "AES/GCM/NoPadding"
    private val keyGenerator = KeyGenerator.getInstance("AES").apply {
        init(keySize, SecureRandom())
    }

    /**
     * Encrypt data with optional associated data (AAD)
     */
    fun encrypt(data: ByteArray, key: SecretKey, associatedData: ByteArray? = null): EncryptedData {
        val cipher = Cipher.getInstance(algorithm)

        // Generate random IV
        val iv = ByteArray(12) // GCM recommended IV size
        SecureRandom().nextBytes(iv)
        val gcmSpec = GCMParameterSpec(tagLength, iv)

        cipher.init(Cipher.ENCRYPT_MODE, key, gcmSpec)

        // Add associated data if provided
        associatedData?.let { aad ->
            cipher.updateAAD(aad)
        }

        // Encrypt the data
        val encryptedBytes = cipher.doFinal(data)

        return EncryptedData(
            ciphertext = encryptedBytes,
            iv = iv,
            associatedData = associatedData
        )
    }

    /**
     * Decrypt data with optional associated data (AAD)
     */
    fun decrypt(encryptedData: EncryptedData, key: SecretKey): ByteArray {
        val cipher = Cipher.getInstance(algorithm)

        val gcmSpec = GCMParameterSpec(tagLength, encryptedData.iv)
        cipher.init(Cipher.DECRYPT_MODE, key, gcmSpec)

        // Add associated data if provided
        encryptedData.associatedData?.let { aad ->
            cipher.updateAAD(aad)
        }

        // Decrypt the data
        return cipher.doFinal(encryptedData.ciphertext)
    }

    /**
     * Generate a new AES key
     */
    fun generateKey(): SecretKey {
        return keyGenerator.generateKey()
    }

    /**
     * Create a SecretKey from key bytes
     */
    fun keyFromBytes(keyBytes: ByteArray): SecretKey {
        return SecretKeySpec(keyBytes, "AES")
    }

    /**
     * Get key bytes from a SecretKey
     */
    fun keyToBytes(key: SecretKey): ByteArray {
        return key.encoded
    }

    /**
     * Encrypt string data with base64 encoding
     */
    fun encryptString(data: String, key: SecretKey, associatedData: String? = null): String {
        val dataBytes = data.toByteArray(Charsets.UTF_8)
        val aadBytes = associatedData?.toByteArray(Charsets.UTF_8)

        val encryptedData = encrypt(dataBytes, key, aadBytes)

        // Combine IV + ciphertext for storage
        val combined = encryptedData.iv + encryptedData.ciphertext
        return Base64.getEncoder().encodeToString(combined)
    }

    /**
     * Decrypt string data from base64 encoded string
     */
    fun decryptString(encryptedString: String, key: SecretKey, associatedData: String? = null): String {
        val combined = Base64.getDecoder().decode(encryptedString)

        // Extract IV (first 12 bytes for GCM)
        val iv = combined.copyOfRange(0, 12)
        val ciphertext = combined.copyOfRange(12, combined.size)

        val encryptedData = EncryptedData(
            ciphertext = ciphertext,
            iv = iv,
            associatedData = associatedData?.toByteArray(Charsets.UTF_8)
        )

        val decryptedBytes = decrypt(encryptedData, key)
        return String(decryptedBytes, Charsets.UTF_8)
    }

    /**
     * Secure key storage simulation (in production, use Android Keystore or similar)
     */
    private val keyStore = mutableMapOf<String, ByteArray>()

    fun storeKeySecurely(keyAlias: String, key: SecretKey): Boolean {
        return try {
            keyStore[keyAlias] = key.encoded
            true
        } catch (e: Exception) {
            false
        }
    }

    fun getKeyFromSecureStorage(keyAlias: String): SecretKey? {
        return try {
            keyStore[keyAlias]?.let { keyBytes ->
                SecretKeySpec(keyBytes, "AES")
            }
        } catch (e: Exception) {
            null
        }
    }

    fun deleteKeyFromSecureStorage(keyAlias: String): Boolean {
        return try {
            keyStore.remove(keyAlias) != null
        } catch (e: Exception) {
            false
        }
    }

    fun hasKey(keyAlias: String): Boolean {
        return keyStore.containsKey(keyAlias)
    }

    fun listStoredKeys(): Set<String> {
        return keyStore.keys
    }

    fun clearAllKeys(): Int {
        val count = keyStore.size
        keyStore.clear()
        return count
    }
}

/**
 * Data class for encrypted data
 */
data class EncryptedData(
    val ciphertext: ByteArray,
    val iv: ByteArray,
    val associatedData: ByteArray? = null
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as EncryptedData

        if (!ciphertext.contentEquals(other.ciphertext)) return false
        if (!iv.contentEquals(other.iv)) return false
        if (associatedData != null) {
            if (other.associatedData == null) return false
            if (!associatedData.contentEquals(other.associatedData)) return false
        } else if (other.associatedData != null) return false

        return true
    }

    override fun hashCode(): Int {
        var result = ciphertext.contentHashCode()
        result = 31 * result + iv.contentHashCode()
        result = 31 * result + (associatedData?.contentHashCode() ?: 0)
        return result
    }
}

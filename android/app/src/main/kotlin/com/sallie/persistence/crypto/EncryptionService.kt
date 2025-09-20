/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * EncryptionService - Handles encryption and decryption for Sallie's data
 */

package com.sallie.persistence.crypto

import java.security.KeyStore
import java.security.SecureRandom
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.SecretKeySpec
import java.util.Base64

/**
 * Provides strong encryption capabilities for Sallie's data
 * 
 * Uses AES-GCM for symmetric encryption with proper key management
 * and secure storage of keys
 */
interface EncryptionService {
    
    /**
     * Encrypt data with the default key
     * 
     * @param data Data to encrypt
     * @return Encrypted data
     */
    fun encrypt(data: ByteArray): Result<ByteArray>
    
    /**
     * Decrypt data with the default key
     * 
     * @param encryptedData Encrypted data to decrypt
     * @return Decrypted data
     */
    fun decrypt(encryptedData: ByteArray): Result<ByteArray>
    
    /**
     * Encrypt data with a specific key
     * 
     * @param data Data to encrypt
     * @param keyAlias Alias of the key to use
     * @return Encrypted data
     */
    fun encryptWithKey(data: ByteArray, keyAlias: String): Result<ByteArray>
    
    /**
     * Decrypt data with a specific key
     * 
     * @param encryptedData Encrypted data to decrypt
     * @param keyAlias Alias of the key to use
     * @return Decrypted data
     */
    fun decryptWithKey(encryptedData: ByteArray, keyAlias: String): Result<ByteArray>
    
    /**
     * Encrypt a string with the default key
     * 
     * @param plainText String to encrypt
     * @return Base64-encoded encrypted string
     */
    fun encryptString(plainText: String): Result<String>
    
    /**
     * Decrypt a Base64-encoded encrypted string
     * 
     * @param encryptedText Base64-encoded encrypted string
     * @return Decrypted string
     */
    fun decryptString(encryptedText: String): Result<String>
    
    /**
     * Generate a new encryption key
     * 
     * @param keyAlias Alias to store the key under
     * @param overwrite Whether to overwrite an existing key
     * @return Success or failure
     */
    fun generateKey(keyAlias: String, overwrite: Boolean = false): Result<Unit>
    
    /**
     * Check if a key exists
     * 
     * @param keyAlias Alias of the key to check
     * @return Whether the key exists
     */
    fun keyExists(keyAlias: String): Boolean
    
    /**
     * Delete a key
     * 
     * @param keyAlias Alias of the key to delete
     * @return Success or failure
     */
    fun deleteKey(keyAlias: String): Result<Unit>
    
    /**
     * Export a key in a secure, encrypted format
     * 
     * @param keyAlias Alias of the key to export
     * @param password Password to protect the exported key
     * @return Encrypted key data
     */
    fun exportKey(keyAlias: String, password: String): Result<ByteArray>
    
    /**
     * Import a previously exported key
     * 
     * @param keyData Encrypted key data
     * @param password Password to decrypt the key
     * @param keyAlias Alias to store the imported key under
     * @param overwrite Whether to overwrite an existing key
     * @return Success or failure
     */
    fun importKey(keyData: ByteArray, password: String, keyAlias: String, overwrite: Boolean = false): Result<Unit>
}

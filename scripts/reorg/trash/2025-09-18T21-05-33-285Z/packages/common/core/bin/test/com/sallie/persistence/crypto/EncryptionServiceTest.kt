/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * EncryptionServiceTest - Tests for the encryption system
 */

package com.sallie.persistence.crypto

import kotlinx.coroutines.runBlocking
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import kotlin.test.assertContentEquals
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotNull
import kotlin.test.assertTrue
import java.security.SecureRandom
import javax.crypto.spec.SecretKeySpec

@RunWith(RobolectricTestRunner::class)
class EncryptionServiceTest {
    
    private lateinit var encryptionService: AesGcmEncryptionService
    
    @Before
    fun setup() {
        encryptionService = AesGcmEncryptionService()
    }
    
    @Test
    fun testEncryptDecrypt() = runBlocking {
        // Arrange
        val original = "This is sensitive data that should be encrypted".toByteArray()
        
        // Act
        val encrypted = encryptionService.encrypt(original).getOrThrow()
        val decrypted = encryptionService.decrypt(encrypted).getOrThrow()
        
        // Assert
        assertNotNull(encrypted)
        assertNotNull(decrypted)
        assertFalse(original.contentEquals(encrypted), "Encrypted data should be different from original")
        assertContentEquals(original, decrypted, "Decrypted data should match original")
    }
    
    @Test
    fun testEncryptDecryptWithKey() = runBlocking {
        // Arrange
        val original = "This is sensitive data with a specific key".toByteArray()
        val keyId = "test_key_1"
        
        // Act
        val encrypted = encryptionService.encryptWithKey(original, keyId).getOrThrow()
        val decrypted = encryptionService.decryptWithKey(encrypted, keyId).getOrThrow()
        
        // Assert
        assertNotNull(encrypted)
        assertNotNull(decrypted)
        assertFalse(original.contentEquals(encrypted), "Encrypted data should be different from original")
        assertContentEquals(original, decrypted, "Decrypted data should match original")
    }
    
    @Test
    fun testEncryptDecryptMultipleKeys() = runBlocking {
        // Arrange
        val original1 = "Data for key 1".toByteArray()
        val original2 = "Data for key 2".toByteArray()
        val keyId1 = "test_key_1"
        val keyId2 = "test_key_2"
        
        // Act
        val encrypted1 = encryptionService.encryptWithKey(original1, keyId1).getOrThrow()
        val encrypted2 = encryptionService.encryptWithKey(original2, keyId2).getOrThrow()
        
        val decrypted1 = encryptionService.decryptWithKey(encrypted1, keyId1).getOrThrow()
        val decrypted2 = encryptionService.decryptWithKey(encrypted2, keyId2).getOrThrow()
        
        // Assert
        assertContentEquals(original1, decrypted1, "Decrypted data 1 should match original 1")
        assertContentEquals(original2, decrypted2, "Decrypted data 2 should match original 2")
        
        // Try to decrypt with wrong key
        val decryptWrongKey = encryptionService.decryptWithKey(encrypted1, keyId2)
        assertTrue(decryptWrongKey.isFailure, "Decryption with wrong key should fail")
    }
    
    @Test
    fun testEncryptLargeData() = runBlocking {
        // Arrange - Create 1MB of random data
        val random = SecureRandom()
        val original = ByteArray(1024 * 1024) // 1MB
        random.nextBytes(original)
        
        // Act
        val encrypted = encryptionService.encrypt(original).getOrThrow()
        val decrypted = encryptionService.decrypt(encrypted).getOrThrow()
        
        // Assert
        assertContentEquals(original, decrypted, "Decrypted large data should match original")
    }
    
    @Test
    fun testEncryptEmptyData() = runBlocking {
        // Arrange
        val original = ByteArray(0) // Empty array
        
        // Act
        val encrypted = encryptionService.encrypt(original).getOrThrow()
        val decrypted = encryptionService.decrypt(encrypted).getOrThrow()
        
        // Assert
        assertTrue(encrypted.isNotEmpty(), "Encrypted data should not be empty (should include IV and auth tag)")
        assertEquals(0, decrypted.size, "Decrypted empty data should be empty")
    }
    
    @Test
    fun testInvalidData() = runBlocking {
        // Arrange
        val invalidData = "Not valid encrypted data".toByteArray()
        
        // Act
        val result = encryptionService.decrypt(invalidData)
        
        // Assert
        assertTrue(result.isFailure, "Decryption of invalid data should fail")
    }
    
    @Test
    fun testEncryptWithExternalKey() = runBlocking {
        // Arrange
        val original = "Test with external key".toByteArray()
        val keyBytes = ByteArray(32) // 256-bit key
        SecureRandom().nextBytes(keyBytes)
        val key = SecretKeySpec(keyBytes, "AES")
        
        // Act
        val encrypted = encryptionService.encryptWithExternalKey(original, key).getOrThrow()
        val decrypted = encryptionService.decryptWithExternalKey(encrypted, key).getOrThrow()
        
        // Assert
        assertContentEquals(original, decrypted, "Decrypted data should match original with external key")
    }
    
    @Test
    fun testDifferentKeysProduceDifferentResults() = runBlocking {
        // Arrange
        val data = "Same data, different keys".toByteArray()
        
        // Act
        val encrypted1 = encryptionService.encryptWithKey(data, "key1").getOrThrow()
        val encrypted2 = encryptionService.encryptWithKey(data, "key2").getOrThrow()
        
        // Assert
        assertFalse(encrypted1.contentEquals(encrypted2), 
            "Same data encrypted with different keys should produce different results")
    }
}

/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * PersistenceServiceTest - Tests for the persistence system
 */

package com.sallie.persistence

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import com.sallie.persistence.backup.BackupInfo
import com.sallie.persistence.crypto.AesGcmEncryptionService
import com.sallie.persistence.storage.SecureStorageService
import kotlinx.coroutines.runBlocking
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import java.io.File
import java.util.UUID
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue

@RunWith(RobolectricTestRunner::class)
class PersistenceServiceTest {
    
    private lateinit var context: Context
    private lateinit var persistenceService: SalliePersistenceService
    private lateinit var tempDir: File
    
    @Before
    fun setup() {
        context = ApplicationProvider.getApplicationContext()
        persistenceService = SalliePersistenceService(context)
        tempDir = File(context.cacheDir, "test_" + UUID.randomUUID().toString())
        tempDir.mkdirs()
        
        runBlocking {
            persistenceService.initialize().getOrThrow()
        }
    }
    
    @After
    fun tearDown() {
        runBlocking {
            persistenceService.clearAll().getOrThrow()
        }
        tempDir.deleteRecursively()
    }
    
    @Test
    fun testStoreAndRetrieveValue() = runBlocking {
        // Arrange
        val key = "test_key"
        val value = "test_value"
        
        // Act
        persistenceService.set(key, value, false).getOrThrow()
        val retrieved = persistenceService.get(key, false).getOrThrow()
        
        // Assert
        assertEquals(value, retrieved)
    }
    
    @Test
    fun testStoreAndRetrieveSecureValue() = runBlocking {
        // Arrange
        val key = "secure_key"
        val value = "secret_value"
        
        // Act
        persistenceService.set(key, value, true).getOrThrow()
        val retrieved = persistenceService.get(key, true).getOrThrow()
        
        // Assert
        assertEquals(value, retrieved)
    }
    
    @Test
    fun testRemoveValue() = runBlocking {
        // Arrange
        val key = "removable_key"
        val value = "removable_value"
        persistenceService.set(key, value, false).getOrThrow()
        
        // Verify it exists first
        assertTrue(persistenceService.exists(key).getOrThrow())
        
        // Act
        persistenceService.remove(key).getOrThrow()
        
        // Assert
        assertFalse(persistenceService.exists(key).getOrThrow())
        val retrieved = persistenceService.get(key, false).getOrThrow()
        assertNull(retrieved)
    }
    
    @Test
    fun testListKeys() = runBlocking {
        // Arrange
        val prefix = "list_test"
        persistenceService.set("${prefix}_1", "value1", false).getOrThrow()
        persistenceService.set("${prefix}_2", "value2", true).getOrThrow()
        persistenceService.set("other_key", "other", false).getOrThrow()
        
        // Act
        val keys = persistenceService.listKeys(prefix).getOrThrow()
        
        // Assert
        assertEquals(2, keys.size)
        assertTrue(keys.contains("${prefix}_1"))
        assertTrue(keys.contains("${prefix}_2"))
        assertFalse(keys.contains("other_key"))
    }
    
    @Test
    fun testBackupAndRestore() = runBlocking {
        // Arrange
        val key1 = "backup_test_1"
        val value1 = "value1"
        val key2 = "backup_test_2"
        val value2 = "value2"
        
        persistenceService.set(key1, value1, false).getOrThrow()
        persistenceService.set(key2, value2, true).getOrThrow()
        
        val backupFile = File(tempDir, "backup.sb")
        
        // Act - Create backup
        persistenceService.createBackup(backupFile, "password123").getOrThrow()
        
        // Verify backup file exists
        assertTrue(backupFile.exists())
        assertTrue(backupFile.length() > 0)
        
        // Clear data
        persistenceService.clearAll().getOrThrow()
        
        // Verify data is gone
        assertNull(persistenceService.get(key1, false).getOrThrow())
        assertNull(persistenceService.get(key2, true).getOrThrow())
        
        // Act - Restore backup
        persistenceService.restoreBackup(backupFile, "password123").getOrThrow()
        
        // Assert
        assertEquals(value1, persistenceService.get(key1, false).getOrThrow())
        assertEquals(value2, persistenceService.get(key2, true).getOrThrow())
    }
    
    @Test
    fun testInvalidKeys() = runBlocking {
        // These should throw exceptions
        try {
            persistenceService.set("", "empty key", false).getOrThrow()
            throw AssertionError("Should have thrown for empty key")
        } catch (e: IllegalArgumentException) {
            // Expected
        }
        
        try {
            persistenceService.set("invalid*key", "invalid character", false).getOrThrow()
            throw AssertionError("Should have thrown for invalid character")
        } catch (e: IllegalArgumentException) {
            // Expected
        }
        
        val longKey = "a".repeat(129)
        try {
            persistenceService.set(longKey, "too long", false).getOrThrow()
            throw AssertionError("Should have thrown for too long key")
        } catch (e: IllegalArgumentException) {
            // Expected
        }
    }
    
    @Test
    fun testEncryptionService() = runBlocking {
        // Test the encryption service directly
        val encryptionService = AesGcmEncryptionService()
        val originalText = "This is a secret message"
        val originalData = originalText.toByteArray()
        
        // Encrypt
        val encrypted = encryptionService.encrypt(originalData).getOrThrow()
        
        // Make sure encrypted data is different from original
        assertFalse(originalData.contentEquals(encrypted))
        
        // Decrypt
        val decrypted = encryptionService.decrypt(encrypted).getOrThrow()
        
        // Verify decryption works
        assertTrue(originalData.contentEquals(decrypted))
        assertEquals(originalText, String(decrypted))
    }
    
    @Test
    fun testStorageService() = runBlocking {
        // Test the storage service directly
        val storageService = SecureStorageService(context)
        
        // Initialize
        storageService.initialize().getOrThrow()
        
        // Write
        val key = "storage_test_key"
        val value = "storage_test_value".toByteArray()
        storageService.write(key, value).getOrThrow()
        
        // Read
        val retrieved = storageService.read(key).getOrThrow()
        
        // Verify
        assertNotNull(retrieved)
        assertTrue(value.contentEquals(retrieved!!))
        
        // Delete
        assertTrue(storageService.delete(key).getOrThrow())
        
        // Verify deletion
        assertFalse(storageService.exists(key))
        assertNull(storageService.read(key).getOrThrow())
    }
}

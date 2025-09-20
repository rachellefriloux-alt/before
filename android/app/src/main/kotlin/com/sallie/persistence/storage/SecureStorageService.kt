/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * SecureStorageService - Implementation of StorageService with encryption
 */

package com.sallie.persistence.storage

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.sallie.persistence.crypto.EncryptionService
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import java.io.File
import java.util.Base64

/**
 * Implementation of StorageService using DataStore with encryption
 * 
 * Provides secure storage with automatic encryption and DataStore persistence
 */
class SecureStorageService(
    private val context: Context,
    private val encryptionService: EncryptionService
) : StorageService {
    
    companion object {
        private const val DATA_STORE_NAME = "sallie_secure_storage"
        private const val FILE_DIRECTORY = "sallie_secure_files"
        private const val CLEAR_CONFIRMATION = "DELETE_ALL_STORAGE"
    }
    
    // Create the DataStore
    private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = DATA_STORE_NAME)
    
    // File directory for storing files
    private val fileDirectory: File by lazy {
        File(context.filesDir, FILE_DIRECTORY).apply {
            if (!exists()) {
                mkdirs()
            }
        }
    }
    
    override suspend fun write(key: String, data: ByteArray, encrypted: Boolean): Result<Unit> {
        return try {
            val finalData = if (encrypted) {
                encryptionService.encrypt(data).getOrThrow()
            } else {
                data
            }
            
            // Convert to base64 for text storage
            val base64Data = Base64.getEncoder().encodeToString(finalData)
            val prefKey = stringPreferencesKey(key)
            
            context.dataStore.edit { preferences ->
                preferences[prefKey] = base64Data
            }
            
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun read(key: String): Result<ByteArray?> {
        return try {
            val prefKey = stringPreferencesKey(key)
            val base64Data = context.dataStore.data.map { preferences ->
                preferences[prefKey]
            }.firstOrNull() ?: return Result.success(null)
            
            val data = Base64.getDecoder().decode(base64Data)
            
            // Try to decrypt - if it fails, assume data was not encrypted
            val decryptResult = encryptionService.decrypt(data)
            
            if (decryptResult.isSuccess) {
                Result.success(decryptResult.getOrThrow())
            } else {
                Result.success(data)
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun delete(key: String): Result<Unit> {
        return try {
            val prefKey = stringPreferencesKey(key)
            
            context.dataStore.edit { preferences ->
                preferences.remove(prefKey)
            }
            
            // Also delete any file with this key
            val file = File(fileDirectory, key)
            if (file.exists()) {
                file.delete()
            }
            
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun exists(key: String): Boolean {
        val prefKey = stringPreferencesKey(key)
        
        // Check DataStore
        val inDataStore = context.dataStore.data.map { preferences ->
            preferences.contains(prefKey)
        }.firstOrNull() ?: false
        
        if (inDataStore) {
            return true
        }
        
        // Check file storage
        val file = File(fileDirectory, key)
        return file.exists()
    }
    
    override suspend fun listKeys(prefix: String?): List<String> {
        // Get keys from DataStore
        val dataStoreKeys = context.dataStore.data.map { preferences ->
            preferences.asMap().keys.map { it.name }
        }.firstOrNull() ?: emptyList()
        
        // Get keys from file directory
        val fileKeys = fileDirectory.listFiles()?.map { it.name } ?: emptyList()
        
        // Combine and filter by prefix
        val allKeys = (dataStoreKeys + fileKeys).distinct()
        
        return if (prefix != null) {
            allKeys.filter { it.startsWith(prefix) }
        } else {
            allKeys
        }
    }
    
    override fun observe(key: String): Flow<ByteArray?> {
        val prefKey = stringPreferencesKey(key)
        
        return context.dataStore.data.map { preferences ->
            val base64Data = preferences[prefKey] ?: return@map null
            val data = Base64.getDecoder().decode(base64Data)
            
            // Try to decrypt - if it fails, assume data was not encrypted
            val decryptResult = encryptionService.decrypt(data)
            
            if (decryptResult.isSuccess) {
                decryptResult.getOrThrow()
            } else {
                data
            }
        }
    }
    
    override suspend fun copyFile(key: String, file: File, encrypted: Boolean): Result<Unit> {
        return try {
            if (!file.exists()) {
                return Result.failure(Exception("Source file does not exist"))
            }
            
            val data = file.readBytes()
            
            if (encrypted) {
                // For large files, stream encryption would be better
                // This is simplified for demonstration
                val encryptedData = encryptionService.encrypt(data).getOrThrow()
                val targetFile = File(fileDirectory, key)
                targetFile.writeBytes(encryptedData)
            } else {
                val targetFile = File(fileDirectory, key)
                file.copyTo(targetFile, overwrite = true)
            }
            
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun getFile(key: String, destination: File): Result<Unit> {
        return try {
            val sourceFile = File(fileDirectory, key)
            
            if (!sourceFile.exists()) {
                return Result.failure(Exception("File not found: $key"))
            }
            
            val data = sourceFile.readBytes()
            
            // Try to decrypt - if it fails, assume data was not encrypted
            val decryptResult = encryptionService.decrypt(data)
            
            if (decryptResult.isSuccess) {
                destination.writeBytes(decryptResult.getOrThrow())
            } else {
                sourceFile.copyTo(destination, overwrite = true)
            }
            
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun clear(confirmation: String): Result<Unit> {
        if (confirmation != CLEAR_CONFIRMATION) {
            return Result.failure(Exception("Invalid confirmation for clearing storage"))
        }
        
        return try {
            // Clear DataStore
            context.dataStore.edit { preferences ->
                preferences.clear()
            }
            
            // Clear file directory
            fileDirectory.listFiles()?.forEach { it.delete() }
            
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

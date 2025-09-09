/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * StorageService - Interface for data storage operations
 */

package com.sallie.persistence.storage

import kotlinx.coroutines.flow.Flow
import java.io.File

/**
 * Interface for low-level storage operations
 * 
 * Provides the basic functionality to store and retrieve data
 * from various storage backends
 */
interface StorageService {
    
    /**
     * Write data to storage
     * 
     * @param key The key to store data under
     * @param data The data to store
     * @param encrypted Whether the data should be encrypted
     * @return Success or failure
     */
    suspend fun write(key: String, data: ByteArray, encrypted: Boolean): Result<Unit>
    
    /**
     * Read data from storage
     * 
     * @param key The key to read data from
     * @return The data or null if not found
     */
    suspend fun read(key: String): Result<ByteArray?>
    
    /**
     * Delete data from storage
     * 
     * @param key The key to delete data for
     * @return Success or failure
     */
    suspend fun delete(key: String): Result<Unit>
    
    /**
     * Check if data exists for a key
     * 
     * @param key The key to check for
     * @return Whether data exists for the key
     */
    suspend fun exists(key: String): Boolean
    
    /**
     * List all keys in storage
     * 
     * @param prefix Optional prefix to filter keys
     * @return List of keys
     */
    suspend fun listKeys(prefix: String? = null): List<String>
    
    /**
     * Observe changes to data for a key
     * 
     * @param key The key to observe
     * @return Flow of data changes
     */
    fun observe(key: String): Flow<ByteArray?>
    
    /**
     * Copy a file to storage
     * 
     * @param key The key to store the file under
     * @param file The file to copy
     * @param encrypted Whether the file should be encrypted
     * @return Success or failure
     */
    suspend fun copyFile(key: String, file: File, encrypted: Boolean): Result<Unit>
    
    /**
     * Get a file from storage
     * 
     * @param key The key to get the file for
     * @param destination The destination to save the file to
     * @return Success or failure
     */
    suspend fun getFile(key: String, destination: File): Result<Unit>
    
    /**
     * Clear all data in storage
     * 
     * @param confirmation Confirmation string for safety
     * @return Success or failure
     */
    suspend fun clear(confirmation: String): Result<Unit>
}

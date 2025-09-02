/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * PersistenceService - Main interface for all persistence operations
 */

package com.sallie.persistence

import kotlinx.coroutines.flow.Flow
import java.io.File

/**
 * Main interface for Sallie's persistence operations
 * 
 * Handles storage, retrieval, backup, and migration of user data
 * with strong encryption and privacy guarantees
 */
interface PersistenceService {
    
    /**
     * Store a value with the given key
     * 
     * @param key The key to store the value under
     * @param value The value to store
     * @param encrypted Whether to encrypt the value (default: true)
     * @return Success or failure
     */
    suspend fun storeValue(key: String, value: String, encrypted: Boolean = true): Result<Unit>
    
    /**
     * Retrieve a value for the given key
     * 
     * @param key The key to retrieve the value for
     * @param defaultValue The default value to return if key not found
     * @return The retrieved value or defaultValue if not found
     */
    suspend fun retrieveValue(key: String, defaultValue: String? = null): Result<String?>
    
    /**
     * Store an object with the given key (will be serialized)
     * 
     * @param key The key to store the object under
     * @param obj The object to store
     * @param encrypted Whether to encrypt the object (default: true)
     * @return Success or failure
     */
    suspend fun <T : Any> storeObject(key: String, obj: T, encrypted: Boolean = true): Result<Unit>
    
    /**
     * Retrieve an object for the given key
     * 
     * @param key The key to retrieve the object for
     * @param clazz The class of the object to retrieve
     * @return The retrieved object or null if not found
     */
    suspend fun <T : Any> retrieveObject(key: String, clazz: Class<T>): Result<T?>
    
    /**
     * Store a binary file with the given key
     * 
     * @param key The key to store the file under
     * @param file The file to store
     * @param encrypted Whether to encrypt the file (default: true)
     * @return Success or failure
     */
    suspend fun storeFile(key: String, file: File, encrypted: Boolean = true): Result<Unit>
    
    /**
     * Retrieve a file for the given key
     * 
     * @param key The key to retrieve the file for
     * @param destination The destination to save the file to
     * @return Success or failure
     */
    suspend fun retrieveFile(key: String, destination: File): Result<Unit>
    
    /**
     * Delete a value with the given key
     * 
     * @param key The key to delete
     * @return Success or failure
     */
    suspend fun delete(key: String): Result<Unit>
    
    /**
     * Check if a key exists
     * 
     * @param key The key to check
     * @return Whether the key exists
     */
    suspend fun exists(key: String): Boolean
    
    /**
     * Listen for changes to a value
     * 
     * @param key The key to listen for
     * @return Flow of value changes
     */
    fun observeValue(key: String): Flow<String?>
    
    /**
     * Listen for changes to an object
     * 
     * @param key The key to listen for
     * @param clazz The class of the object
     * @return Flow of object changes
     */
    fun <T : Any> observeObject(key: String, clazz: Class<T>): Flow<T?>
    
    /**
     * Create a backup of all user data
     * 
     * @param destination The destination to save the backup to
     * @param password Optional password for additional encryption
     * @return Success or failure
     */
    suspend fun createBackup(destination: File, password: String? = null): Result<Unit>
    
    /**
     * Restore from a backup
     * 
     * @param source The backup file to restore from
     * @param password Optional password for decryption
     * @param overwrite Whether to overwrite existing data
     * @return Success or failure
     */
    suspend fun restoreFromBackup(source: File, password: String? = null, overwrite: Boolean = false): Result<Unit>
    
    /**
     * Export specific data to a file
     * 
     * @param keys The keys to export
     * @param destination The destination to export to
     * @param format The format to export in (e.g., "json", "csv")
     * @return Success or failure
     */
    suspend fun exportData(keys: List<String>, destination: File, format: String): Result<Unit>
    
    /**
     * Import data from a file
     * 
     * @param source The source to import from
     * @param format The format to import from (e.g., "json", "csv")
     * @param overwrite Whether to overwrite existing data
     * @return Success or failure
     */
    suspend fun importData(source: File, format: String, overwrite: Boolean = false): Result<Unit>
    
    /**
     * Clear all stored data
     * 
     * @param confirmation Confirmation string for safety (must be "DELETE_ALL")
     * @return Success or failure
     */
    suspend fun clearAllData(confirmation: String): Result<Unit>
}

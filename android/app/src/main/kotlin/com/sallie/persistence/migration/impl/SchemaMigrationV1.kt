/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * SchemaMigrationV1 - Example migration from initial schema to v1
 */

package com.sallie.persistence.migration.impl

import android.content.Context
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.sallie.persistence.migration.Migration
import com.sallie.persistence.storage.StorageService
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.lang.reflect.Type

/**
 * Example migration for upgrading from initial schema to version 1
 * 
 * This migration demonstrates how to:
 * 1. Read legacy data format
 * 2. Transform it to new format
 * 3. Save in the new format
 * 4. Clean up legacy data
 */
class SchemaMigrationV1(
    private val context: Context,
    private val storageService: StorageService
) : Migration {
    
    private val gson = Gson()
    
    override fun getVersion(): Int = 1
    
    override fun getName(): String = "Update to Schema v1"
    
    override suspend fun migrate(): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            // 1. Check if we have legacy data to migrate
            val legacyKeys = storageService.listKeys()
                .filter { it.startsWith("legacy.") }
            
            if (legacyKeys.isEmpty()) {
                // No legacy data to migrate
                return@withContext Result.success(Unit)
            }
            
            // 2. Process each legacy key
            for (legacyKey in legacyKeys) {
                // Skip any keys we've already processed to make the migration resumable
                val newKey = getNewKeyName(legacyKey)
                if (storageService.exists(newKey)) {
                    continue
                }
                
                // Read legacy data
                val legacyData = storageService.read(legacyKey)
                    .getOrElse { return@withContext Result.failure(it) }
                    ?: continue // Skip if null
                
                // Convert legacy data to string
                val legacyDataString = String(legacyData, Charsets.UTF_8)
                
                // 3. Transform data based on key type
                when {
                    legacyKey.startsWith("legacy.preferences") -> {
                        migratePreferences(legacyKey, legacyDataString)
                            .getOrElse { return@withContext Result.failure(it) }
                    }
                    
                    legacyKey.startsWith("legacy.user") -> {
                        migrateUserData(legacyKey, legacyDataString)
                            .getOrElse { return@withContext Result.failure(it) }
                    }
                    
                    legacyKey.startsWith("legacy.conversations") -> {
                        migrateConversations(legacyKey, legacyDataString)
                            .getOrElse { return@withContext Result.failure(it) }
                    }
                    
                    // Add more specialized handlers as needed
                    
                    else -> {
                        // Generic migration for other data types
                        val newData = transformGenericData(legacyDataString)
                            .getOrElse { return@withContext Result.failure(it) }
                        
                        storageService.write(newKey, newData.toByteArray(Charsets.UTF_8))
                            .getOrElse { return@withContext Result.failure(it) }
                    }
                }
                
                // Optional: Delete legacy data after successful migration
                // Uncomment when sure the migration is working correctly
                // storageService.delete(legacyKey)
            }
            
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Get the new key name from a legacy key
     */
    private fun getNewKeyName(legacyKey: String): String {
        // Convert "legacy.some.key" to "v1.some.key"
        return legacyKey.replaceFirst("legacy.", "v1.")
    }
    
    /**
     * Migrate preferences data to new format
     */
    private suspend fun migratePreferences(legacyKey: String, legacyData: String): Result<Unit> {
        try {
            val type: Type = object : TypeToken<Map<String, Any>>() {}.type
            val legacyPrefs: Map<String, Any> = gson.fromJson(legacyData, type)
            
            // Transform preferences
            val newPrefs = legacyPrefs.mapValues { (key, value) ->
                // Apply transformations to values if needed
                when (key) {
                    "theme" -> transformThemeValue(value)
                    "notifications" -> transformNotificationSettings(value)
                    else -> value
                }
            }
            
            // Add new fields or defaults for missing values
            val updatedPrefs = newPrefs.toMutableMap().apply {
                // Add new fields that didn't exist in legacy format
                if (!containsKey("privacyOptionsEnabled")) {
                    put("privacyOptionsEnabled", true)
                }
            }
            
            // Save the new preferences
            val newKey = getNewKeyName(legacyKey)
            val newData = gson.toJson(updatedPrefs)
            
            return storageService.write(newKey, newData.toByteArray(Charsets.UTF_8))
        } catch (e: Exception) {
            return Result.failure(e)
        }
    }
    
    /**
     * Migrate user data to new format
     */
    private suspend fun migrateUserData(legacyKey: String, legacyData: String): Result<Unit> {
        try {
            val type: Type = object : TypeToken<Map<String, Any>>() {}.type
            val legacyUser: Map<String, Any> = gson.fromJson(legacyData, type)
            
            // Transform the user object (example)
            val updatedUser = legacyUser.toMutableMap().apply {
                // Transform and rename fields
                if (containsKey("lastLoginDate")) {
                    put("lastSessionDate", get("lastLoginDate"))
                    remove("lastLoginDate")
                }
                
                // Add new fields
                if (!containsKey("privacyConsent")) {
                    put("privacyConsent", false)
                }
                
                // Set version
                put("schemaVersion", 1)
            }
            
            // Save the new user data
            val newKey = getNewKeyName(legacyKey)
            val newData = gson.toJson(updatedUser)
            
            return storageService.write(newKey, newData.toByteArray(Charsets.UTF_8))
        } catch (e: Exception) {
            return Result.failure(e)
        }
    }
    
    /**
     * Migrate conversation data to new format
     */
    private suspend fun migrateConversations(legacyKey: String, legacyData: String): Result<Unit> {
        try {
            val type: Type = object : TypeToken<List<Map<String, Any>>>() {}.type
            val legacyConversations: List<Map<String, Any>> = gson.fromJson(legacyData, type)
            
            // Transform conversation objects
            val newConversations = legacyConversations.map { conversation ->
                val updatedConversation = conversation.toMutableMap()
                
                // Transform conversation structure
                if (conversation.containsKey("messages")) {
                    val messages = conversation["messages"] as? List<Map<String, Any>>
                    if (messages != null) {
                        // Transform each message
                        val updatedMessages = messages.map { message ->
                            val updatedMessage = message.toMutableMap()
                            
                            // Example: Add metadata to each message
                            if (!updatedMessage.containsKey("metadata")) {
                                updatedMessage["metadata"] = mapOf(
                                    "schemaVersion" to 1,
                                    "migrated" to true
                                )
                            }
                            
                            updatedMessage
                        }
                        
                        updatedConversation["messages"] = updatedMessages
                    }
                }
                
                // Add schema version
                updatedConversation["schemaVersion"] = 1
                
                updatedConversation
            }
            
            // Save the new conversations
            val newKey = getNewKeyName(legacyKey)
            val newData = gson.toJson(newConversations)
            
            return storageService.write(newKey, newData.toByteArray(Charsets.UTF_8))
        } catch (e: Exception) {
            return Result.failure(e)
        }
    }
    
    /**
     * Transform generic data (fallback for data types without special handling)
     */
    private fun transformGenericData(legacyData: String): Result<String> {
        // For generic data, we simply add a version marker
        // In a real implementation, we might need more complex transformations
        return try {
            val jsonObject = gson.fromJson(legacyData, Map::class.java) as? MutableMap<String, Any>
            
            if (jsonObject != null) {
                jsonObject["schemaVersion"] = 1
                jsonObject["migrated"] = true
                Result.success(gson.toJson(jsonObject))
            } else {
                // If it's not a JSON object, return as-is
                Result.success(legacyData)
            }
        } catch (e: Exception) {
            // If it's not valid JSON, return as-is
            Result.success(legacyData)
        }
    }
    
    /**
     * Example of transforming a specific value type
     */
    private fun transformThemeValue(value: Any): Any {
        // Example: Convert old string theme values to new format
        return when (value) {
            "dark" -> "theme_dark_v1"
            "light" -> "theme_light_v1"
            "system" -> "theme_system"
            else -> value
        }
    }
    
    /**
     * Example of transforming notification settings
     */
    private fun transformNotificationSettings(value: Any): Any {
        // Example: Expand notification settings from boolean to object
        return when (value) {
            is Boolean -> {
                mapOf(
                    "enabled" to value,
                    "showPreview" to value,
                    "sound" to true,
                    "vibration" to true
                )
            }
            else -> value
        }
    }
}

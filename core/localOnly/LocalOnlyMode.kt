package com.sallie.localOnly

import net.sqlcipher.database.SQLiteDatabase
import android.content.Context
import android.content.SharedPreferences

object LocalOnlyMode {
    private const val PREFS_NAME = "sallie_local_mode"
    private const val KEY_LOCAL_MODE_ENABLED = "local_mode_enabled"
    private const val KEY_ENCRYPTED_DB_ENABLED = "encrypted_db_enabled"

    fun enableEncryptedDB(context: Context, passphrase: String): SQLiteDatabase {
        // Initialize SQLCipher encrypted database
        SQLiteDatabase.loadLibs(context)
        val dbPath = context.getDatabasePath("sallie_local.db").absolutePath
        return SQLiteDatabase.openOrCreateDatabase(dbPath, passphrase, null)
    }

    fun isLocalModeEnabled(context: Context): Boolean {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        return prefs.getBoolean(KEY_LOCAL_MODE_ENABLED, false)
    }

    fun setLocalModeEnabled(context: Context, enabled: Boolean) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().putBoolean(KEY_LOCAL_MODE_ENABLED, enabled).apply()
    }

    fun isInternetPermissionRemoved(manifest: String): Boolean {
        // Check manifest for INTERNET permission
        return !manifest.contains("android.permission.INTERNET")
    }

    fun getMockProvider(feature: String): Any {
        // Return mock provider for non-essential cloud features
        return when (feature) {
            "cloudStorage" -> object { 
                fun upload(data: Any) = "Mock upload complete - Local Mode"
                fun download(id: String) = "Mock download - Local Mode: $id" 
            }
            "analytics" -> object { 
                fun track(event: String) = "Mock analytics tracked - Local Mode: $event" 
            }
            "cloudSync" -> object {
                fun sync() = "Mock sync disabled - Local Mode"
            }
            "remoteAI" -> object {
                fun query(prompt: String) = "Local AI processing: $prompt"
            }
            else -> object { fun call() = "Mock feature - Local Mode: $feature" }
        }
    }

    fun getLocalAIConfig(): Map<String, Any> {
        return mapOf(
            "useLocalModels" to true,
            "enableCloudFallback" to false,
            "localModelPath" to "assets/models/",
            "encryptionEnabled" to true
        )
    }
}

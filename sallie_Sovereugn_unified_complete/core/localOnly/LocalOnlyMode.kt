package com.sallie.localOnly

import net.sqlcipher.database.SQLiteDatabase

object LocalOnlyMode {
    fun enableEncryptedDB(passphrase: String): SQLiteDatabase {
        // Initialize SQLCipher encrypted database
        SQLiteDatabase.loadLibs(/* context */)
        return SQLiteDatabase.openOrCreateDatabase("local.db", passphrase, null)
    }

    fun isInternetPermissionRemoved(manifest: String): Boolean {
        // Check manifest for INTERNET permission
        return !manifest.contains("android.permission.INTERNET")
    }

    fun getMockProvider(feature: String): Any {
        // Return mock provider for non-essential cloud features
        return when (feature) {
            "cloudStorage" -> object { fun upload(data: Any) = "Mock upload complete" }
            "analytics" -> object { fun track(event: String) = "Mock analytics tracked: $event" }
            else -> object { fun call() = "Mock feature: $feature" }
        }
    }
}

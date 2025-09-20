/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * MigrationManager - Manages data migrations between schema versions
 */

package com.sallie.persistence.migration

import android.content.Context
import android.content.SharedPreferences
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Manager for data migrations between schema versions
 * 
 * Handles the registration, discovery, and execution of migrations
 * to update data schemas when the application is upgraded
 */
class MigrationManager(private val context: Context) {
    
    companion object {
        private const val PREFS_NAME = "sallie_migration_prefs"
        private const val KEY_SCHEMA_VERSION = "schema_version"
        private const val INITIAL_VERSION = 0
    }
    
    private val prefs: SharedPreferences by lazy {
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }
    
    private val migrations = mutableListOf<Migration>()
    
    /**
     * Register a migration to be applied when necessary
     * 
     * @param migration The migration to register
     */
    fun registerMigration(migration: Migration) {
        migrations.add(migration)
    }
    
    /**
     * Register multiple migrations at once
     * 
     * @param migrations The list of migrations to register
     */
    fun registerMigrations(migrations: List<Migration>) {
        this.migrations.addAll(migrations)
    }
    
    /**
     * Get the current schema version from preferences
     */
    fun getCurrentVersion(): Int {
        return prefs.getInt(KEY_SCHEMA_VERSION, INITIAL_VERSION)
    }
    
    /**
     * Update the stored schema version
     */
    private fun updateSchemaVersion(version: Int) {
        prefs.edit().putInt(KEY_SCHEMA_VERSION, version).apply()
    }
    
    /**
     * Check if migrations are needed
     * 
     * @param targetVersion The target version to check against
     * @return True if migrations are needed, false otherwise
     */
    fun isMigrationNeeded(targetVersion: Int): Boolean {
        val currentVersion = getCurrentVersion()
        return currentVersion < targetVersion
    }
    
    /**
     * Execute all necessary migrations to reach the target version
     * 
     * @param targetVersion The target schema version
     * @return Result with success if all migrations succeeded, or failure with details
     */
    suspend fun migrateToVersion(targetVersion: Int): Result<Unit> = withContext(Dispatchers.IO) {
        val currentVersion = getCurrentVersion()
        
        if (currentVersion >= targetVersion) {
            return@withContext Result.success(Unit)
        }
        
        // Sort migrations by version
        val sortedMigrations = migrations.sortedBy { it.getVersion() }
        
        // Find applicable migrations
        val applicableMigrations = sortedMigrations.filter { 
            it.isApplicable(currentVersion, targetVersion)
        }
        
        try {
            // Execute migrations in order
            for (migration in applicableMigrations) {
                val migrationResult = migration.migrate()
                
                if (migrationResult.isFailure) {
                    return@withContext Result.failure(
                        Exception("Migration ${migration.getName()} failed: ${migrationResult.exceptionOrNull()?.message}")
                    )
                }
                
                // Update the schema version after each successful migration
                updateSchemaVersion(migration.getVersion())
            }
            
            // Final update to target version if it's higher than any migration
            if (targetVersion > (applicableMigrations.lastOrNull()?.getVersion() ?: currentVersion)) {
                updateSchemaVersion(targetVersion)
            }
            
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Convenience method to create a simple migration
     */
    fun createMigration(version: Int, name: String, migrationBlock: suspend () -> Result<Unit>): Migration {
        return object : Migration {
            override fun getVersion(): Int = version
            override fun getName(): String = name
            override suspend fun migrate(): Result<Unit> = migrationBlock()
        }
    }
}

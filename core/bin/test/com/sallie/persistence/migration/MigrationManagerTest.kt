/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * MigrationManagerTest - Tests for the migration system
 */

package com.sallie.persistence.migration

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import kotlinx.coroutines.runBlocking
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

@RunWith(RobolectricTestRunner::class)
class MigrationManagerTest {
    
    private lateinit var context: Context
    private lateinit var migrationManager: MigrationManager
    
    @Before
    fun setup() {
        context = ApplicationProvider.getApplicationContext()
        
        // Create a fresh migration manager for each test
        context.getSharedPreferences("sallie_migration_prefs", Context.MODE_PRIVATE)
            .edit()
            .clear()
            .apply()
        
        migrationManager = MigrationManager(context)
    }
    
    @Test
    fun testInitialVersion() {
        // Initial version should be 0
        assertEquals(0, migrationManager.getCurrentVersion())
    }
    
    @Test
    fun testMigrationNeeded() {
        // Should need migration from 0 to any higher version
        assertTrue(migrationManager.isMigrationNeeded(1))
        
        // Update version manually
        context.getSharedPreferences("sallie_migration_prefs", Context.MODE_PRIVATE)
            .edit()
            .putInt("schema_version", 2)
            .apply()
        
        // Should not need migration from 2 to 2
        assertFalse(migrationManager.isMigrationNeeded(2))
        
        // Should need migration from 2 to 3
        assertTrue(migrationManager.isMigrationNeeded(3))
        
        // Should not need migration from 2 to 1
        assertFalse(migrationManager.isMigrationNeeded(1))
    }
    
    @Test
    fun testRegisterAndRunMigrations() = runBlocking {
        // Track migrations that were executed
        val migrationsExecuted = mutableListOf<Int>()
        
        // Create and register test migrations
        migrationManager.registerMigration(
            migrationManager.createMigration(1, "Test Migration 1") {
                migrationsExecuted.add(1)
                Result.success(Unit)
            }
        )
        
        migrationManager.registerMigration(
            migrationManager.createMigration(2, "Test Migration 2") {
                migrationsExecuted.add(2)
                Result.success(Unit)
            }
        )
        
        migrationManager.registerMigration(
            migrationManager.createMigration(3, "Test Migration 3") {
                migrationsExecuted.add(3)
                Result.success(Unit)
            }
        )
        
        // Execute migrations to version 2
        val result = migrationManager.migrateToVersion(2)
        assertTrue(result.isSuccess)
        
        // Check that migrations 1 and 2 were executed
        assertEquals(2, migrationsExecuted.size)
        assertTrue(migrationsExecuted.contains(1))
        assertTrue(migrationsExecuted.contains(2))
        assertFalse(migrationsExecuted.contains(3))
        
        // Check that version was updated
        assertEquals(2, migrationManager.getCurrentVersion())
        
        // Clear the executed migrations list
        migrationsExecuted.clear()
        
        // Migrate to version 3
        val result2 = migrationManager.migrateToVersion(3)
        assertTrue(result2.isSuccess)
        
        // Only migration 3 should have been executed this time
        assertEquals(1, migrationsExecuted.size)
        assertTrue(migrationsExecuted.contains(3))
        
        // Check that version was updated
        assertEquals(3, migrationManager.getCurrentVersion())
    }
    
    @Test
    fun testMigrationOrder() = runBlocking {
        // Track migrations in order
        val executionOrder = mutableListOf<Int>()
        
        // Register migrations in reverse order to ensure they're sorted
        migrationManager.registerMigration(
            migrationManager.createMigration(3, "Test Migration 3") {
                executionOrder.add(3)
                Result.success(Unit)
            }
        )
        
        migrationManager.registerMigration(
            migrationManager.createMigration(1, "Test Migration 1") {
                executionOrder.add(1)
                Result.success(Unit)
            }
        )
        
        migrationManager.registerMigration(
            migrationManager.createMigration(2, "Test Migration 2") {
                executionOrder.add(2)
                Result.success(Unit)
            }
        )
        
        // Run migrations
        migrationManager.migrateToVersion(3)
        
        // Verify execution order
        assertEquals(3, executionOrder.size)
        assertEquals(1, executionOrder[0])
        assertEquals(2, executionOrder[1])
        assertEquals(3, executionOrder[2])
    }
    
    @Test
    fun testFailedMigration() = runBlocking {
        // Register a failing migration
        migrationManager.registerMigration(
            migrationManager.createMigration(1, "Failing Migration") {
                Result.failure(Exception("Intentional test failure"))
            }
        )
        
        // Try to migrate
        val result = migrationManager.migrateToVersion(1)
        
        // Should have failed
        assertTrue(result.isFailure)
        
        // Version should not have changed
        assertEquals(0, migrationManager.getCurrentVersion())
    }
    
    @Test
    fun testIsApplicable() {
        // Create a test migration
        val migration = object : Migration {
            override fun getVersion(): Int = 2
            override fun getName(): String = "Test Migration"
            override suspend fun migrate(): Result<Unit> = Result.success(Unit)
        }
        
        // Should be applicable when going from version 0 to 3
        assertTrue(migration.isApplicable(0, 3))
        assertTrue(migration.isApplicable(1, 2))
        
        // Should not be applicable when already at or past version 2
        assertFalse(migration.isApplicable(2, 3))
        assertFalse(migration.isApplicable(3, 4))
        
        // Should not be applicable when target is less than migration version
        assertFalse(migration.isApplicable(0, 1))
    }
}

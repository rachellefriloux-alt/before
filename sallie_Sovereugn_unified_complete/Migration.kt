/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * Migration - Interface for data migration operations
 */

package com.sallie.persistence.migration

/**
 * Interface for data migration operations
 * 
 * Defines operations for migrating data between different versions
 * of the application schema
 */
interface Migration {
    /**
     * Get the migration version number
     * 
     * @return The migration version as a numeric value
     */
    fun getVersion(): Int
    
    /**
     * Get the migration name or description
     * 
     * @return A human-readable name or description
     */
    fun getName(): String
    
    /**
     * Execute the migration
     * 
     * @return Result indicating success or failure with error details
     */
    suspend fun migrate(): Result<Unit>
    
    /**
     * Check if this migration is applicable for the given version transition
     * 
     * @param fromVersion The source schema version
     * @param toVersion The target schema version
     * @return True if this migration should be applied, false otherwise
     */
    fun isApplicable(fromVersion: Int, toVersion: Int): Boolean {
        return fromVersion < getVersion() && toVersion >= getVersion()
    }
}

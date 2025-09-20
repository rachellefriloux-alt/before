/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * PermissionChange - Events for permission changes
 */

package com.sallie.phonecontrol

/**
 * Represents changes in permission status
 */
sealed class PermissionChange {
    /**
     * A permission was granted
     * 
     * @param permission The permission that was granted
     */
    data class Granted(val permission: String) : PermissionChange()
    
    /**
     * A permission was revoked
     * 
     * @param permission The permission that was revoked
     */
    data class Revoked(val permission: String) : PermissionChange()
}

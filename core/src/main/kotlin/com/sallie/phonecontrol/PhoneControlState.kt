/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * PhoneControlState - States for the phone control system
 */

package com.sallie.phonecontrol

/**
 * Represents the current state of the phone control system
 */
sealed class PhoneControlState {
    /**
     * System is starting up and initializing components
     */
    object Initializing : PhoneControlState()
    
    /**
     * System is ready and fully operational
     */
    object Ready : PhoneControlState()
    
    /**
     * System requires additional permissions to function
     */
    object NeedsPermissions : PhoneControlState()
    
    /**
     * System is in limited functionality mode due to some constraints
     */
    object LimitedFunctionality : PhoneControlState()
    
    /**
     * System encountered an error
     * 
     * @param message Description of the error
     */
    data class Error(val message: String) : PhoneControlState()
}

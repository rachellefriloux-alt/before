/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * PersonaType - Defines the different persona styles available in Sallie UI
 */

package com.sallie.ui.compose.theme

/**
 * Different persona styles for Sallie, affecting visual appearance and tone
 */
enum class PersonaType {
    /**
     * Default balanced persona, combines modern and traditional elements
     * Features purple/gold color scheme and balanced animations
     */
    DEFAULT,
    
    /**
     * Warm, traditional persona with warmer colors
     * Features amber/gold colors and gentle animations
     */
    WARM,
    
    /**
     * Cool, modern persona with cooler colors
     * Features blue/teal colors and more dynamic animations
     */
    COOL;
    
    companion object {
        /**
         * Convert from string to PersonaType safely
         * @param value String value to convert
         * @return PersonaType (DEFAULT if invalid)
         */
        fun fromString(value: String): PersonaType {
            return try {
                valueOf(value.uppercase())
            } catch (e: IllegalArgumentException) {
                DEFAULT
            }
        }
    }
}

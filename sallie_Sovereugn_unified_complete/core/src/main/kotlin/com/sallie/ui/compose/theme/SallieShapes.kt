/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * SallieShapes - Shape definitions for Sallie UI components
 */

package com.sallie.ui.compose.theme

import androidx.compose.foundation.shape.CornerBasedShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Shapes
import androidx.compose.ui.unit.dp

/**
 * Shapes for Sallie UI components
 */
val SallieShapes = Shapes(
    // Small components like chips, small buttons
    small = RoundedCornerShape(4.dp),
    
    // Medium components like cards, dialogs
    medium = RoundedCornerShape(8.dp),
    
    // Large components like bottom sheets, modal dialogs
    large = RoundedCornerShape(16.dp),
)

/**
 * Alternative shape sets for different personas
 */
object SalliePersonaShapes {
    /**
     * Warm, traditional persona shapes with softer corners
     */
    val WARM = Shapes(
        small = RoundedCornerShape(6.dp),
        medium = RoundedCornerShape(12.dp),
        large = RoundedCornerShape(20.dp),
    )
    
    /**
     * Cool, modern persona shapes with sharper corners
     */
    val COOL = Shapes(
        small = RoundedCornerShape(2.dp),
        medium = RoundedCornerShape(6.dp),
        large = RoundedCornerShape(12.dp),
    )
    
    /**
     * Get shapes based on persona type
     * @param personaType Current persona type
     * @return Shapes for that persona
     */
    fun getShapes(personaType: PersonaType): Shapes {
        return when(personaType) {
            PersonaType.DEFAULT -> SallieShapes
            PersonaType.WARM -> WARM
            PersonaType.COOL -> COOL
        }
    }
}

/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * Dimensions - Size and spacing definitions for Sallie UI
 */

package com.sallie.ui.compose.theme

import androidx.compose.ui.unit.dp

/**
 * Dimensions system for Sallie UI
 * Provides consistent spacing and sizing throughout the UI
 */
object SallieDimensions {
    // Spacing values
    val spacing_2 = 2.dp
    val spacing_4 = 4.dp
    val spacing_8 = 8.dp
    val spacing_12 = 12.dp
    val spacing_16 = 16.dp
    val spacing_20 = 20.dp
    val spacing_24 = 24.dp
    val spacing_32 = 32.dp
    val spacing_40 = 40.dp
    val spacing_48 = 48.dp
    val spacing_56 = 56.dp
    val spacing_64 = 64.dp
    
    // Icon sizes
    val icon_small = 16.dp
    val icon_medium = 24.dp
    val icon_large = 32.dp
    val icon_xlarge = 48.dp
    
    // Component heights
    val button_height_small = 32.dp
    val button_height_medium = 40.dp
    val button_height_large = 48.dp
    
    val input_height_small = 40.dp
    val input_height_medium = 48.dp
    val input_height_large = 56.dp
    
    // Border radius
    val radius_small = 4.dp
    val radius_medium = 8.dp
    val radius_large = 16.dp
    val radius_xlarge = 24.dp
    
    // Border widths
    val border_thin = 1.dp
    val border_medium = 2.dp
    val border_thick = 3.dp
    
    // Element sizes
    val avatar_small = 32.dp
    val avatar_medium = 48.dp
    val avatar_large = 64.dp
    val avatar_xlarge = 96.dp
    
    // Card dimensions
    val card_min_width = 120.dp
    val card_padding = spacing_16
    val card_elevation = 4.dp
    val card_elevation_raised = 8.dp
    
    // Navigation elements
    val bottomNav_height = 56.dp
    val topBar_height = 56.dp
    val sideNav_width = 240.dp
    val sideNav_width_compact = 72.dp
    
    // Accessibility adjustments - larger touch targets
    val accessibility_min_touch_target = 48.dp
    
    /**
     * Get adjusted dimensions for accessibility needs
     * @param factor Scaling factor for accessibility (1.0 is default)
     * @return Adjusted spacing
     */
    fun getAccessibilitySpacing(base: Float, factor: Float): Float {
        // Never go below base value, but scale up as needed
        return base * maxOf(1f, factor)
    }
}

package com.sallie.ui.adaptation

/**
 * Sallie's User Interaction Modes
 * 
 * Defines the different modes of user interaction that the UI can adapt to.
 * These modes influence the complexity, style, and behavior of UI components.
 */
enum class InteractionMode {
    /**
     * Standard interaction mode with balanced UI complexity.
     * Suitable for most users.
     */
    STANDARD,
    
    /**
     * Simplified mode with reduced UI complexity.
     * Suitable for first-time users or those who prefer minimalist interfaces.
     * - Fewer options visible at once
     * - More guidance and explanations
     * - Larger, more obvious touch targets
     */
    SIMPLIFIED,
    
    /**
     * Expert mode with maximum functionality exposed.
     * Suitable for power users and advanced scenarios.
     * - More options and controls visible
     * - Increased information density
     * - Advanced features exposed
     * - Keyboard shortcuts and gestures
     */
    EXPERT,
    
    /**
     * Child-friendly mode with simplified language and playful elements.
     * Suitable for young users.
     * - Simplified vocabulary
     * - More colorful, engaging visuals
     * - Larger touch targets
     * - Limited functionality
     * - Educational elements
     */
    CHILD_FRIENDLY,
    
    /**
     * Optimized for elderly users with accessibility considerations.
     * Suitable for seniors or those with limited technology experience.
     * - Larger text and controls
     * - Higher contrast
     * - Simplified interactions
     * - Reduced motion
     * - Clear, direct language
     */
    ELDERLY_OPTIMIZED;
    
    companion object {
        /**
         * Get the appropriate interaction mode based on user characteristics
         */
        fun fromUserCharacteristics(
            age: Int? = null,
            isFirstTimeUser: Boolean = false,
            isPowerUser: Boolean = false,
            hasAccessibilityNeeds: Boolean = false
        ): InteractionMode {
            return when {
                age != null && age < 12 -> CHILD_FRIENDLY
                age != null && age > 65 -> ELDERLY_OPTIMIZED
                hasAccessibilityNeeds -> ELDERLY_OPTIMIZED // Similar optimizations often help
                isPowerUser -> EXPERT
                isFirstTimeUser -> SIMPLIFIED
                else -> STANDARD
            }
        }
    }
}

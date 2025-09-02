package com.sallie.ui.components

import android.content.Context
import android.graphics.Color
import android.util.AttributeSet
import android.view.ViewGroup
import android.view.accessibility.AccessibilityNodeInfo
import android.widget.FrameLayout
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.updatePadding
import com.sallie.ui.adaptation.AdaptableComponent
import com.sallie.ui.adaptation.UIAdaptationState

/**
 * Sallie's Adaptive UI Components
 *
 * Base class for all adaptive UI components in the Sallie system.
 * Provides core adaptation capabilities, accessibility features, and responsive design.
 */
abstract class AdaptiveLayout @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr), AdaptableComponent {

    // Current adaptation state
    protected var currentState: UIAdaptationState = UIAdaptationState.Default
    
    // Accessibility focus handling
    private var isAccessibilityFocused = false
    
    init {
        // Set up edge-to-edge design with insets handling
        ViewCompat.setOnApplyWindowInsetsListener(this) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.updatePadding(
                systemBars.left,
                systemBars.top,
                systemBars.right,
                systemBars.bottom
            )
            insets
        }
    }
    
    /**
     * Apply UI adaptation based on the provided state
     */
    override fun applyAdaptation(state: UIAdaptationState) {
        currentState = state
        
        // Apply theme configuration
        applyTheme(state)
        
        // Apply accessibility configuration
        applyAccessibility(state)
        
        // Apply device context adaptations
        applyDeviceContext(state)
        
        // Apply user context adaptations
        applyUserContext(state)
    }
    
    /**
     * Apply theme configuration
     */
    protected open fun applyTheme(state: UIAdaptationState) {
        val theme = state.themeConfig
        
        // Apply background color based on dark mode
        setBackgroundColor(if (theme.isDarkMode) {
            darkenColor(theme.backgroundColor)
        } else {
            theme.backgroundColor
        })
        
        // Apply corner radius if this is a card-like component
        if (this is ViewGroup) {
            clipToOutline = true
            outlineProvider = AdaptiveOutlineProvider(theme.cornerRadius.toFloat())
        }
        
        // Apply elevation
        elevation = theme.elevationLevel * resources.displayMetrics.density
    }
    
    /**
     * Apply accessibility configuration
     */
    protected open fun applyAccessibility(state: UIAdaptationState) {
        val accessibility = state.accessibilityConfig
        
        // Set content description for screen readers if not already set
        if (contentDescription == null) {
            contentDescription = getDefaultContentDescription()
        }
        
        // Increase touch target size if needed
        val minTargetSize = accessibility.touchTargetSize
        if (minimumWidth < minTargetSize) {
            minimumWidth = minTargetSize
        }
        if (minimumHeight < minTargetSize) {
            minimumHeight = minTargetSize
        }
        
        // Enhanced contrast mode
        if (accessibility.contrastEnhanced) {
            ViewCompat.setAccessibilityHeading(this, true)
        }
        
        // Enable screen reader feedback
        importantForAccessibility = if (accessibility.screenReaderCompatible) {
            IMPORTANT_FOR_ACCESSIBILITY_YES
        } else {
            IMPORTANT_FOR_ACCESSIBILITY_AUTO
        }
    }
    
    /**
     * Apply device context adaptations
     */
    protected open fun applyDeviceContext(state: UIAdaptationState) {
        val device = state.deviceContext
        
        // Adjust layout based on device type
        if (device.isTablet) {
            applyTabletLayout()
        } else {
            applyPhoneLayout()
        }
        
        // Adjust layout based on orientation
        if (device.isLandscape) {
            applyLandscapeLayout()
        } else {
            applyPortraitLayout()
        }
    }
    
    /**
     * Apply user context adaptations
     */
    protected open fun applyUserContext(state: UIAdaptationState) {
        val user = state.userContext
        
        // Apply simplified UI for first-time users
        if (user.isFirstTimeUser) {
            applySimplifiedLayout()
        }
        
        // Apply advanced UI for power users
        if (user.isPowerUser) {
            applyAdvancedLayout()
        }
        
        // Apply interaction mode specific changes
        when (user.preferredInteractionMode) {
            InteractionMode.SIMPLIFIED -> applySimplifiedLayout()
            InteractionMode.EXPERT -> applyAdvancedLayout()
            InteractionMode.CHILD_FRIENDLY -> applyChildFriendlyLayout()
            InteractionMode.ELDERLY_OPTIMIZED -> applyElderlyOptimizedLayout()
            else -> {} // Standard mode requires no special handling
        }
    }
    
    /**
     * Apply tablet-specific layout adaptations
     */
    protected open fun applyTabletLayout() {
        // Default implementation does nothing
        // Override in subclasses for tablet-specific layouts
    }
    
    /**
     * Apply phone-specific layout adaptations
     */
    protected open fun applyPhoneLayout() {
        // Default implementation does nothing
        // Override in subclasses for phone-specific layouts
    }
    
    /**
     * Apply landscape orientation layout adaptations
     */
    protected open fun applyLandscapeLayout() {
        // Default implementation does nothing
        // Override in subclasses for landscape-specific layouts
    }
    
    /**
     * Apply portrait orientation layout adaptations
     */
    protected open fun applyPortraitLayout() {
        // Default implementation does nothing
        // Override in subclasses for portrait-specific layouts
    }
    
    /**
     * Apply simplified layout for first-time users or simplified mode
     */
    protected open fun applySimplifiedLayout() {
        // Default implementation does nothing
        // Override in subclasses for simplified layouts
    }
    
    /**
     * Apply advanced layout for power users or expert mode
     */
    protected open fun applyAdvancedLayout() {
        // Default implementation does nothing
        // Override in subclasses for advanced layouts
    }
    
    /**
     * Apply child-friendly layout
     */
    protected open fun applyChildFriendlyLayout() {
        // Default implementation does nothing
        // Override in subclasses for child-friendly layouts
    }
    
    /**
     * Apply elderly-optimized layout
     */
    protected open fun applyElderlyOptimizedLayout() {
        // Default implementation does nothing
        // Override in subclasses for elderly-optimized layouts
    }
    
    /**
     * Get default content description for accessibility
     */
    protected open fun getDefaultContentDescription(): String {
        return ""
    }
    
    /**
     * Enhanced accessibility handling
     */
    override fun onInitializeAccessibilityNodeInfo(info: AccessibilityNodeInfo) {
        super.onInitializeAccessibilityNodeInfo(info)
        
        // Add custom actions for accessibility services
        addCustomAccessibilityActions(info)
    }
    
    /**
     * Add custom accessibility actions
     */
    protected open fun addCustomAccessibilityActions(info: AccessibilityNodeInfo) {
        // Default implementation does nothing
        // Override in subclasses to add custom accessibility actions
    }
    
    /**
     * Darken a color for dark mode
     */
    protected fun darkenColor(color: Int): Int {
        val hsv = FloatArray(3)
        Color.colorToHSV(color, hsv)
        hsv[2] *= 0.8f // Reduce value/brightness by 20%
        return Color.HSVToColor(hsv)
    }
    
    /**
     * Lighten a color for light mode
     */
    protected fun lightenColor(color: Int): Int {
        val hsv = FloatArray(3)
        Color.colorToHSV(color, hsv)
        hsv[2] = 0.2f + (hsv[2] * 0.8f) // Increase value/brightness
        return Color.HSVToColor(hsv)
    }
    
    /**
     * Create a higher contrast version of a color
     */
    protected fun enhanceContrast(color: Int): Int {
        val luminance = calculateLuminance(color)
        return if (luminance > 0.5) {
            darkenColor(color) // If color is light, darken it
        } else {
            lightenColor(color) // If color is dark, lighten it
        }
    }
    
    /**
     * Calculate luminance value of a color (0.0-1.0)
     */
    private fun calculateLuminance(color: Int): Double {
        val r = Color.red(color) / 255.0
        val g = Color.green(color) / 255.0
        val b = Color.blue(color) / 255.0
        
        val rLinear = if (r <= 0.03928) r / 12.92 else Math.pow((r + 0.055) / 1.055, 2.4)
        val gLinear = if (g <= 0.03928) g / 12.92 else Math.pow((g + 0.055) / 1.055, 2.4)
        val bLinear = if (b <= 0.03928) b / 12.92 else Math.pow((b + 0.055) / 1.055, 2.4)
        
        return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear
    }
}

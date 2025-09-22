package com.sallie.ui.components

import android.content.Context
import android.util.AttributeSet
import android.view.View
import android.view.accessibility.AccessibilityEvent
import androidx.appcompat.widget.AppCompatButton
import androidx.appcompat.widget.AppCompatImageView
import androidx.appcompat.widget.AppCompatTextView
import androidx.cardview.widget.CardView
import androidx.constraintlayout.widget.ConstraintLayout
import com.sallie.ui.adaptation.AmbientLight
import com.sallie.ui.adaptation.ContextualFactors
import com.sallie.ui.adaptation.DeviceOrientation
import com.sallie.ui.adaptation.MotionState
import com.sallie.ui.adaptation.UIAdaptationManager
import com.sallie.ui.adaptation.UIState

/**
 * Sallie's Adaptive UI Component Library
 * 
 * A collection of UI components that adapt to different contexts and user needs.
 * These components automatically adjust their appearance and behavior based on
 * environmental factors, accessibility needs, and user preferences.
 */

/**
 * Base interface for all adaptive components
 */
interface AdaptiveComponent {
    fun adaptToUIState(uiState: UIState)
    fun adaptToContextualFactors(contextualFactors: ContextualFactors)
}

/**
 * AdaptiveButton - A button that adapts to different contexts
 * 
 * Features:
 * - Automatically adjusts size based on device and user motion
 * - Changes contrast based on ambient light
 * - Increases touch target when user is in motion
 * - Enhances visibility in different lighting conditions
 */
class AdaptiveButton @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : AppCompatButton(context, attrs, defStyleAttr), AdaptiveComponent {

    private var uiAdaptationManager: UIAdaptationManager = UIAdaptationManager.getInstance(context)
    
    init {
        uiAdaptationManager.registerComponent(this)
    }
    
    override fun adaptToUIState(uiState: UIState) {
        when (uiState) {
            UIState.NORMAL -> {
                // Default styling
                textSize = 16f
                setPadding(24, 12, 24, 12)
            }
            UIState.HIGH_CONTRAST -> {
                // High contrast styling
                setTextColor(0xFFFFFFFF.toInt())
                setBackgroundColor(0xFF000000.toInt())
                textSize = 18f
            }
            UIState.LARGER_TEXT -> {
                // Larger text styling
                textSize = 20f
                setPadding(32, 16, 32, 16)
            }
            UIState.SIMPLIFIED -> {
                // Simplified styling
                textSize = 16f
                setPadding(24, 12, 24, 12)
                // Remove any complex backgrounds or effects
            }
        }
    }
    
    override fun adaptToContextualFactors(contextualFactors: ContextualFactors) {
        // Adapt to ambient light
        when (contextualFactors.ambientLight) {
            AmbientLight.DARK, AmbientLight.LOW -> {
                // Lower brightness setting
                alpha = 0.85f
                // Potentially adjust colors for low light
            }
            AmbientLight.NORMAL -> {
                // Default brightness
                alpha = 1.0f
            }
            AmbientLight.BRIGHT, AmbientLight.DIRECT_SUNLIGHT -> {
                // Enhance contrast for bright environments
                // Assuming darker background in bright light
                setTextColor(0xFF000000.toInt())
                setBackgroundColor(0xFFFFFFFF.toInt())
            }
        }
        
        // Adapt to motion state
        when (contextualFactors.motionState) {
            MotionState.STATIONARY -> {
                // Default size
                val defaultPadding = 24
                setPadding(defaultPadding, defaultPadding / 2, defaultPadding, defaultPadding / 2)
            }
            MotionState.WALKING -> {
                // Larger touch target for walking
                val largerPadding = 32
                setPadding(largerPadding, largerPadding / 2, largerPadding, largerPadding / 2)
                textSize = 18f
            }
            MotionState.RUNNING -> {
                // Even larger touch target for running
                val runningPadding = 40
                setPadding(runningPadding, runningPadding / 2, runningPadding, runningPadding / 2)
                textSize = 20f
            }
        }
        
        // Adapt to device orientation
        when (contextualFactors.deviceOrientation) {
            DeviceOrientation.PORTRAIT -> {
                // Default styling optimized for portrait
            }
            DeviceOrientation.LANDSCAPE -> {
                // Adjust styling for landscape
                // Make button slightly wider but less tall
                val currentPaddingHorizontal = paddingLeft
                val currentPaddingVertical = paddingTop
                setPadding(
                    (currentPaddingHorizontal * 1.2).toInt(),
                    (currentPaddingVertical * 0.9).toInt(),
                    (currentPaddingHorizontal * 1.2).toInt(),
                    (currentPaddingVertical * 0.9).toInt()
                )
            }
        }
        
        invalidate()
    }
    
    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        uiAdaptationManager.unregisterComponent(this)
    }
    
    override fun onInitializeAccessibilityEvent(event: AccessibilityEvent) {
        super.onInitializeAccessibilityEvent(event)
        // Additional accessibility information
        event.className = AdaptiveButton::class.java.name
    }
}

/**
 * AdaptiveCard - A card view that adapts to different contexts
 * 
 * Features:
 * - Adjusts elevation and shadow based on device motion
 * - Changes contrast based on ambient light
 * - Adjusts size and layout based on device orientation
 */
class AdaptiveCard @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : CardView(context, attrs, defStyleAttr), AdaptiveComponent {

    private var uiAdaptationManager: UIAdaptationManager = UIAdaptationManager.getInstance(context)
    
    init {
        uiAdaptationManager.registerComponent(this)
    }
    
    override fun adaptToUIState(uiState: UIState) {
        when (uiState) {
            UIState.NORMAL -> {
                // Default styling
                radius = 16f
                cardElevation = 4f
            }
            UIState.HIGH_CONTRAST -> {
                // High contrast styling
                radius = 8f
                cardElevation = 8f
                setCardBackgroundColor(0xFFFFFFFF.toInt())
            }
            UIState.LARGER_TEXT -> {
                // Larger content area
                radius = 16f
                cardElevation = 4f
                // The content inside should be set to larger text by parent
            }
            UIState.SIMPLIFIED -> {
                // Simplified styling
                radius = 0f
                cardElevation = 0f
                // Simple flat card with no decoration
            }
        }
    }
    
    override fun adaptToContextualFactors(contextualFactors: ContextualFactors) {
        // Adapt to ambient light
        when (contextualFactors.ambientLight) {
            AmbientLight.DARK, AmbientLight.LOW -> {
                // Lower brightness, darker card for dark environments
                setCardBackgroundColor(0xFF202020.toInt())
            }
            AmbientLight.NORMAL -> {
                // Default brightness
                setCardBackgroundColor(0xFFFFFFFF.toInt())
            }
            AmbientLight.BRIGHT, AmbientLight.DIRECT_SUNLIGHT -> {
                // Higher contrast for bright environments
                setCardBackgroundColor(0xFFF0F0F0.toInt())
                cardElevation = 8f
            }
        }
        
        // Adapt to motion state
        when (contextualFactors.motionState) {
            MotionState.STATIONARY -> {
                // Default elevation
                cardElevation = 4f
            }
            MotionState.WALKING -> {
                // Increase elevation slightly for better visibility
                cardElevation = 6f
            }
            MotionState.RUNNING -> {
                // Maximum elevation for high visibility
                cardElevation = 10f
            }
        }
        
        // Adapt to device orientation
        when (contextualFactors.deviceOrientation) {
            DeviceOrientation.PORTRAIT -> {
                // Default styling optimized for portrait
            }
            DeviceOrientation.LANDSCAPE -> {
                // Adjust styling for landscape
                // Potentially adjust content padding
            }
        }
        
        invalidate()
    }
    
    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        uiAdaptationManager.unregisterComponent(this)
    }
}

/**
 * AdaptiveText - A text view that adapts to different contexts
 * 
 * Features:
 * - Automatically adjusts text size based on user preferences
 * - Changes contrast based on ambient light
 * - Adjusts line spacing when device is in motion
 */
class AdaptiveText @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : AppCompatTextView(context, attrs, defStyleAttr), AdaptiveComponent {

    private var uiAdaptationManager: UIAdaptationManager = UIAdaptationManager.getInstance(context)
    private var baseTextSize: Float = textSize / resources.displayMetrics.scaledDensity
    
    init {
        uiAdaptationManager.registerComponent(this)
    }
    
    override fun adaptToUIState(uiState: UIState) {
        when (uiState) {
            UIState.NORMAL -> {
                // Default styling
                textSize = baseTextSize
                setLineSpacing(0f, 1.2f)
            }
            UIState.HIGH_CONTRAST -> {
                // High contrast styling
                setTextColor(0xFFFFFFFF.toInt())
                setBackgroundColor(0xFF000000.toInt())
            }
            UIState.LARGER_TEXT -> {
                // Larger text styling
                textSize = baseTextSize * 1.5f
                setLineSpacing(2f, 1.3f)
            }
            UIState.SIMPLIFIED -> {
                // Simplified styling
                textSize = baseTextSize
                setLineSpacing(0f, 1.2f)
            }
        }
    }
    
    override fun adaptToContextualFactors(contextualFactors: ContextualFactors) {
        // Adapt to ambient light
        when (contextualFactors.ambientLight) {
            AmbientLight.DARK, AmbientLight.LOW -> {
                // Higher contrast for low light
                setTextColor(0xFFFFFFFF.toInt())
                setShadowLayer(1.5f, 0f, 0f, 0x33000000)
            }
            AmbientLight.NORMAL -> {
                // Default styling
                setTextColor(0xFF000000.toInt())
                setShadowLayer(0f, 0f, 0f, 0)
            }
            AmbientLight.BRIGHT, AmbientLight.DIRECT_SUNLIGHT -> {
                // Maximum contrast for bright environments
                setTextColor(0xFF000000.toInt())
                setShadowLayer(0f, 0f, 0f, 0)
            }
        }
        
        // Adapt to motion state
        when (contextualFactors.motionState) {
            MotionState.STATIONARY -> {
                // Default line spacing
                setLineSpacing(0f, 1.2f)
            }
            MotionState.WALKING -> {
                // Increase line spacing for better readability
                setLineSpacing(2f, 1.3f)
            }
            MotionState.RUNNING -> {
                // Maximum line spacing and larger text
                setLineSpacing(4f, 1.4f)
                textSize = baseTextSize * 1.2f
            }
        }
        
        invalidate()
    }
    
    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        uiAdaptationManager.unregisterComponent(this)
    }
}

/**
 * AdaptiveLayout - A constraint layout that adapts to different contexts
 * 
 * Features:
 * - Automatically adjusts spacing based on device orientation
 * - Changes padding and element distribution based on device type
 * - Simplifies layout in motion or low visibility conditions
 */
class AdaptiveLayout @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : ConstraintLayout(context, attrs, defStyleAttr), AdaptiveComponent {

    private var uiAdaptationManager: UIAdaptationManager = UIAdaptationManager.getInstance(context)
    
    init {
        uiAdaptationManager.registerComponent(this)
    }
    
    override fun adaptToUIState(uiState: UIState) {
        when (uiState) {
            UIState.NORMAL -> {
                // Default styling
                setPadding(16, 16, 16, 16)
            }
            UIState.HIGH_CONTRAST -> {
                // High contrast styling
                setBackgroundColor(0xFF000000.toInt())
            }
            UIState.LARGER_TEXT -> {
                // More spacing for larger text
                setPadding(24, 24, 24, 24)
            }
            UIState.SIMPLIFIED -> {
                // Simplified styling with more padding
                setPadding(32, 32, 32, 32)
            }
        }
    }
    
    override fun adaptToContextualFactors(contextualFactors: ContextualFactors) {
        // Adapt to device orientation
        when (contextualFactors.deviceOrientation) {
            DeviceOrientation.PORTRAIT -> {
                // Default styling optimized for portrait
                setPadding(16, 16, 16, 16)
            }
            DeviceOrientation.LANDSCAPE -> {
                // Adjust for landscape - wider horizontal margins
                setPadding(32, 8, 32, 8)
            }
        }
        
        // Adapt to motion state
        when (contextualFactors.motionState) {
            MotionState.STATIONARY -> {
                // Default state
                // Full complexity layout
            }
            MotionState.WALKING -> {
                // Slightly simplified
                // Could hide some non-essential elements
            }
            MotionState.RUNNING -> {
                // Maximize simplicity
                // Hide all non-essential elements
                // Increase spacing
                setPadding(paddingLeft + 8, paddingTop + 8, paddingRight + 8, paddingBottom + 8)
            }
        }
        
        invalidate()
        requestLayout()
    }
    
    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        uiAdaptationManager.unregisterComponent(this)
    }
}

/**
 * AdaptiveImage - An image view that adapts to different contexts
 * 
 * Features:
 * - Automatically adjusts brightness based on ambient light
 * - Changes size based on device orientation
 * - Simplifies or hides non-essential images during motion
 */
class AdaptiveImage @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : AppCompatImageView(context, attrs, defStyleAttr), AdaptiveComponent {

    private var uiAdaptationManager: UIAdaptationManager = UIAdaptationManager.getInstance(context)
    private var isEssential = false
    
    init {
        uiAdaptationManager.registerComponent(this)
    }
    
    fun setEssential(essential: Boolean) {
        isEssential = essential
    }
    
    override fun adaptToUIState(uiState: UIState) {
        when (uiState) {
            UIState.NORMAL -> {
                // Default styling
                visibility = View.VISIBLE
                alpha = 1.0f
            }
            UIState.HIGH_CONTRAST -> {
                // High contrast may need to adjust image processing
                alpha = 1.0f
            }
            UIState.LARGER_TEXT -> {
                // Default styling, text changes don't affect images
                alpha = 1.0f
            }
            UIState.SIMPLIFIED -> {
                // In simplified mode, hide non-essential images
                visibility = if (isEssential) View.VISIBLE else View.GONE
            }
        }
    }
    
    override fun adaptToContextualFactors(contextualFactors: ContextualFactors) {
        // Adapt to ambient light
        when (contextualFactors.ambientLight) {
            AmbientLight.DARK, AmbientLight.LOW -> {
                // Lower brightness in dark environments
                alpha = 0.7f
            }
            AmbientLight.NORMAL -> {
                // Default brightness
                alpha = 1.0f
            }
            AmbientLight.BRIGHT, AmbientLight.DIRECT_SUNLIGHT -> {
                // Increase contrast/brightness in bright environments
                alpha = 1.0f
                // Could apply a high contrast color filter
            }
        }
        
        // Adapt to motion state
        when (contextualFactors.motionState) {
            MotionState.STATIONARY -> {
                // Default state - show all images
                visibility = View.VISIBLE
            }
            MotionState.WALKING -> {
                // Show only if essential when walking
                if (!isEssential) {
                    alpha = 0.7f
                }
            }
            MotionState.RUNNING -> {
                // Hide non-essential images when running
                if (!isEssential) {
                    visibility = View.GONE
                } else {
                    visibility = View.VISIBLE
                }
            }
        }
        
        invalidate()
    }
    
    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        uiAdaptationManager.unregisterComponent(this)
    }
}

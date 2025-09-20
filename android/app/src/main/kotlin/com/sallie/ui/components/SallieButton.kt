package com.sallie.ui.components

import android.content.Context
import android.content.res.ColorStateList
import android.graphics.drawable.GradientDrawable
import android.graphics.drawable.RippleDrawable
import android.os.Build
import android.util.AttributeSet
import android.view.MotionEvent
import android.view.View
import android.view.accessibility.AccessibilityNodeInfo
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.core.view.AccessibilityDelegateCompat
import androidx.core.view.ViewCompat
import androidx.core.view.accessibility.AccessibilityNodeInfoCompat
import com.sallie.ui.adaptation.InteractionMode
import com.sallie.ui.adaptation.UIAdaptationState

/**
 * Sallie's Adaptive Button
 * 
 * A fully adaptive button component that adjusts its appearance and behavior
 * based on theme, accessibility, device, and user context.
 */
class SallieButton @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : AdaptiveLayout(context, attrs, defStyleAttr) {

    // UI elements
    private val buttonText: TextView
    
    // Button state
    private var isPressed = false
    private var isEnabled = true
    private var buttonType = ButtonType.PRIMARY
    private var buttonSize = ButtonSize.MEDIUM
    
    // Button text
    var text: CharSequence
        get() = buttonText.text
        set(value) {
            buttonText.text = value
        }
    
    init {
        // Inflate button layout
        View.inflate(context, R.layout.sallie_button, this)
        
        // Get references to views
        buttonText = findViewById(R.id.button_text)
        
        // Set default touch feedback
        isClickable = true
        isFocusable = true
        
        // Parse attributes
        val typedArray = context.obtainStyledAttributes(
            attrs, R.styleable.SallieButton, defStyleAttr, 0
        )
        
        try {
            // Get button type
            val typeOrdinal = typedArray.getInt(
                R.styleable.SallieButton_buttonType,
                ButtonType.PRIMARY.ordinal
            )
            buttonType = ButtonType.values()[typeOrdinal]
            
            // Get button size
            val sizeOrdinal = typedArray.getInt(
                R.styleable.SallieButton_buttonSize,
                ButtonSize.MEDIUM.ordinal
            )
            buttonSize = ButtonSize.values()[sizeOrdinal]
            
            // Get button text
            val text = typedArray.getString(R.styleable.SallieButton_text)
            if (text != null) {
                buttonText.text = text
            }
            
            // Get enabled state
            isEnabled = typedArray.getBoolean(R.styleable.SallieButton_android_enabled, true)
        } finally {
            typedArray.recycle()
        }
        
        // Set up enhanced accessibility
        setupAccessibility()
        
        // Apply initial state
        updateButtonAppearance()
    }
    
    /**
     * Set button type
     */
    fun setButtonType(type: ButtonType) {
        buttonType = type
        updateButtonAppearance()
    }
    
    /**
     * Set button size
     */
    fun setButtonSize(size: ButtonSize) {
        buttonSize = size
        updateButtonAppearance()
    }
    
    /**
     * Override to handle enabled state changes
     */
    override fun setEnabled(enabled: Boolean) {
        super.setEnabled(enabled)
        isEnabled = enabled
        updateButtonAppearance()
    }
    
    /**
     * Handle touch events for visual feedback
     */
    override fun onTouchEvent(event: MotionEvent): Boolean {
        if (!isEnabled) {
            return super.onTouchEvent(event)
        }
        
        when (event.action) {
            MotionEvent.ACTION_DOWN -> {
                isPressed = true
                updateButtonAppearance()
            }
            MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                isPressed = false
                updateButtonAppearance()
            }
        }
        
        return super.onTouchEvent(event)
    }
    
    /**
     * Apply theme-specific styling
     */
    override fun applyTheme(state: UIAdaptationState) {
        super.applyTheme(state)
        
        // Update button appearance
        updateButtonAppearance()
    }
    
    /**
     * Apply accessibility adaptations
     */
    override fun applyAccessibility(state: UIAdaptationState) {
        super.applyAccessibility(state)
        
        val accessibility = state.accessibilityConfig
        
        // Adjust text size for accessibility
        buttonText.textSize = 14 * accessibility.fontScale
        
        // For increased contrast in high-contrast mode
        if (accessibility.contrastEnhanced) {
            when (buttonType) {
                ButtonType.PRIMARY -> {
                    // Ensure primary buttons have maximum contrast
                    setBackgroundGradient(
                        enhanceContrast(currentState.themeConfig.primaryColor),
                        enhanceContrast(currentState.themeConfig.primaryColor)
                    )
                    buttonText.setTextColor(getContrastingTextColor(currentState.themeConfig.primaryColor))
                }
                ButtonType.SECONDARY -> {
                    // Make secondary buttons more visually distinct
                    setBackgroundGradient(
                        enhanceContrast(currentState.themeConfig.accentColor),
                        enhanceContrast(currentState.themeConfig.accentColor)
                    )
                    buttonText.setTextColor(getContrastingTextColor(currentState.themeConfig.accentColor))
                }
                else -> {
                    // Ensure tertiary buttons are still visible
                    buttonText.setTextColor(enhanceContrast(currentState.themeConfig.textColor))
                }
            }
        }
        
        // Reduce motion for animations if needed
        if (accessibility.reduceMotion) {
            animateScale(1.0f) // Reset to normal scale
        }
    }
    
    /**
     * Apply user context adaptations
     */
    override fun applyUserContext(state: UIAdaptationState) {
        super.applyUserContext(state)
        
        val user = state.userContext
        
        // Simplified layout for first-time users
        if (user.isFirstTimeUser) {
            // Use primary button type for clarity
            buttonType = ButtonType.PRIMARY
            updateButtonAppearance()
        }
        
        // Apply interaction mode specific changes
        when (user.preferredInteractionMode) {
            InteractionMode.CHILD_FRIENDLY -> {
                // Larger, more colorful buttons for children
                buttonSize = ButtonSize.LARGE
                applyChildFriendlyStyle()
            }
            InteractionMode.ELDERLY_OPTIMIZED -> {
                // Larger, high contrast buttons for elderly users
                buttonSize = ButtonSize.LARGE
                applyElderlyOptimizedStyle()
            }
            else -> {
                // Use current button size and style
            }
        }
    }
    
    /**
     * Apply child-friendly styling
     */
    private fun applyChildFriendlyStyle() {
        // Use bright, friendly colors
        val startColor = 0xFF42A5F5.toInt()  // Bright blue
        val endColor = 0xFF2196F3.toInt()    // Slightly darker blue
        
        setBackgroundGradient(startColor, endColor)
        buttonText.setTextColor(0xFFFFFFFF.toInt()) // White text
        
        // Make text slightly larger
        buttonText.textSize = 16f
    }
    
    /**
     * Apply elderly-optimized styling
     */
    private fun applyElderlyOptimizedStyle() {
        // Use high contrast colors
        val backgroundColor = 0xFF000000.toInt() // Black background
        val textColor = 0xFFFFFFFF.toInt()      // White text
        
        setBackgroundColor(backgroundColor)
        buttonText.setTextColor(textColor)
        
        // Make text larger
        buttonText.textSize = 18f
    }
    
    /**
     * Get default content description
     */
    override fun getDefaultContentDescription(): String {
        return buttonText.text.toString() + " button"
    }
    
    /**
     * Set up enhanced accessibility
     */
    private fun setupAccessibility() {
        // Set up accessibility delegate
        ViewCompat.setAccessibilityDelegate(this, object : AccessibilityDelegateCompat() {
            override fun onInitializeAccessibilityNodeInfo(
                host: View,
                info: AccessibilityNodeInfoCompat
            ) {
                super.onInitializeAccessibilityNodeInfo(host, info)
                
                // Mark this as a button
                info.className = android.widget.Button::class.java.name
                
                // Add click action description
                info.addAction(
                    AccessibilityNodeInfoCompat.Action(
                        AccessibilityNodeInfoCompat.ACTION_CLICK,
                        "Activate"
                    )
                )
            }
        })
    }
    
    /**
     * Update the button appearance based on current state
     */
    private fun updateButtonAppearance() {
        // Apply style based on button type
        when (buttonType) {
            ButtonType.PRIMARY -> applyPrimaryStyle()
            ButtonType.SECONDARY -> applySecondaryStyle()
            ButtonType.TERTIARY -> applyTertiaryStyle()
            ButtonType.DANGER -> applyDangerStyle()
            ButtonType.SUCCESS -> applySuccessStyle()
        }
        
        // Apply size based on button size
        when (buttonSize) {
            ButtonSize.SMALL -> applySmallSize()
            ButtonSize.MEDIUM -> applyMediumSize()
            ButtonSize.LARGE -> applyLargeSize()
        }
        
        // Apply state-based appearance
        if (!isEnabled) {
            applyDisabledState()
        } else if (isPressed) {
            applyPressedState()
        }
    }
    
    /**
     * Apply primary button style
     */
    private fun applyPrimaryStyle() {
        // Use theme's primary color
        val primaryColor = if (currentState.themeConfig != null) {
            currentState.themeConfig.primaryColor
        } else {
            ContextCompat.getColor(context, R.color.sallie_primary)
        }
        
        // Create gradient effect
        val darkerPrimary = darkenColor(primaryColor)
        setBackgroundGradient(primaryColor, darkerPrimary)
        
        // Set text color
        buttonText.setTextColor(getContrastingTextColor(primaryColor))
    }
    
    /**
     * Apply secondary button style
     */
    private fun applySecondaryStyle() {
        // Use theme's accent color
        val accentColor = if (currentState.themeConfig != null) {
            currentState.themeConfig.accentColor
        } else {
            ContextCompat.getColor(context, R.color.sallie_accent)
        }
        
        // Create gradient effect
        val darkerAccent = darkenColor(accentColor)
        setBackgroundGradient(accentColor, darkerAccent)
        
        // Set text color
        buttonText.setTextColor(getContrastingTextColor(accentColor))
    }
    
    /**
     * Apply tertiary button style (outline)
     */
    private fun applyTertiaryStyle() {
        // Use transparent background with outline
        background = GradientDrawable().apply {
            shape = GradientDrawable.RECTANGLE
            
            val cornerRadius = if (currentState.themeConfig != null) {
                currentState.themeConfig.cornerRadius.toFloat()
            } else {
                8f
            }
            
            val outlineColor = if (currentState.themeConfig != null) {
                currentState.themeConfig.primaryColor
            } else {
                ContextCompat.getColor(context, R.color.sallie_primary)
            }
            
            setColor(0x00000000) // Transparent
            cornerRadius = cornerRadius
            setStroke(2, outlineColor)
        }
        
        // Set text color to match outline
        val textColor = if (currentState.themeConfig != null) {
            currentState.themeConfig.primaryColor
        } else {
            ContextCompat.getColor(context, R.color.sallie_primary)
        }
        
        buttonText.setTextColor(textColor)
    }
    
    /**
     * Apply danger button style
     */
    private fun applyDangerStyle() {
        val dangerColor = ContextCompat.getColor(context, R.color.sallie_danger)
        val darkerDanger = darkenColor(dangerColor)
        
        setBackgroundGradient(dangerColor, darkerDanger)
        buttonText.setTextColor(getContrastingTextColor(dangerColor))
    }
    
    /**
     * Apply success button style
     */
    private fun applySuccessStyle() {
        val successColor = ContextCompat.getColor(context, R.color.sallie_success)
        val darkerSuccess = darkenColor(successColor)
        
        setBackgroundGradient(successColor, darkerSuccess)
        buttonText.setTextColor(getContrastingTextColor(successColor))
    }
    
    /**
     * Apply small button size
     */
    private fun applySmallSize() {
        val horizontalPadding = (8 * resources.displayMetrics.density).toInt()
        val verticalPadding = (4 * resources.displayMetrics.density).toInt()
        
        setPadding(horizontalPadding, verticalPadding, horizontalPadding, verticalPadding)
        buttonText.textSize = 12f
    }
    
    /**
     * Apply medium button size
     */
    private fun applyMediumSize() {
        val horizontalPadding = (16 * resources.displayMetrics.density).toInt()
        val verticalPadding = (8 * resources.displayMetrics.density).toInt()
        
        setPadding(horizontalPadding, verticalPadding, horizontalPadding, verticalPadding)
        buttonText.textSize = 14f
    }
    
    /**
     * Apply large button size
     */
    private fun applyLargeSize() {
        val horizontalPadding = (24 * resources.displayMetrics.density).toInt()
        val verticalPadding = (12 * resources.displayMetrics.density).toInt()
        
        setPadding(horizontalPadding, verticalPadding, horizontalPadding, verticalPadding)
        buttonText.textSize = 16f
    }
    
    /**
     * Apply disabled state styling
     */
    private fun applyDisabledState() {
        // Make button appear faded
        alpha = 0.5f
        
        // Remove ripple effect
        background = GradientDrawable().apply {
            shape = GradientDrawable.RECTANGLE
            
            val cornerRadius = if (currentState.themeConfig != null) {
                currentState.themeConfig.cornerRadius.toFloat()
            } else {
                8f
            }
            
            setColor(0xFFCCCCCC.toInt()) // Grey color
            this.cornerRadius = cornerRadius
        }
        
        buttonText.setTextColor(0xFF666666.toInt()) // Dark grey text
    }
    
    /**
     * Apply pressed state styling
     */
    private fun applyPressedState() {
        // Scale down slightly
        if (currentState.accessibilityConfig == null || !currentState.accessibilityConfig.reduceMotion) {
            animateScale(0.95f)
        }
    }
    
    /**
     * Set background gradient for button
     */
    private fun setBackgroundGradient(startColor: Int, endColor: Int) {
        val cornerRadius = if (currentState.themeConfig != null) {
            currentState.themeConfig.cornerRadius.toFloat()
        } else {
            8f
        }
        
        // Create base shape with gradient
        val baseDrawable = GradientDrawable(
            GradientDrawable.Orientation.TOP_BOTTOM,
            intArrayOf(startColor, endColor)
        ).apply {
            shape = GradientDrawable.RECTANGLE
            this.cornerRadius = cornerRadius
        }
        
        // Add ripple effect for feedback
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            val rippleColor = getRippleColor(startColor)
            background = RippleDrawable(
                ColorStateList.valueOf(rippleColor),
                baseDrawable,
                null
            )
        } else {
            background = baseDrawable
        }
    }
    
    /**
     * Get text color that contrasts with background
     */
    private fun getContrastingTextColor(backgroundColor: Int): Int {
        val luminance = calculateLuminance(backgroundColor)
        return if (luminance > 0.5) {
            0xFF000000.toInt() // Black for light backgrounds
        } else {
            0xFFFFFFFF.toInt() // White for dark backgrounds
        }
    }
    
    /**
     * Get ripple color based on background color
     */
    private fun getRippleColor(backgroundColor: Int): Int {
        val luminance = calculateLuminance(backgroundColor)
        return if (luminance > 0.5) {
            0x33000000 // Dark ripple for light backgrounds
        } else {
            0x33FFFFFF // Light ripple for dark backgrounds
        }
    }
    
    /**
     * Animate button scale
     */
    private fun animateScale(scale: Float) {
        animate()
            .scaleX(scale)
            .scaleY(scale)
            .setDuration(100)
            .start()
    }
    
    /**
     * Button types
     */
    enum class ButtonType {
        PRIMARY,
        SECONDARY,
        TERTIARY,
        DANGER,
        SUCCESS
    }
    
    /**
     * Button sizes
     */
    enum class ButtonSize {
        SMALL,
        MEDIUM,
        LARGE
    }
}

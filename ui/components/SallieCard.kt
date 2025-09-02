package com.sallie.ui.components

import android.content.Context
import android.graphics.drawable.GradientDrawable
import android.util.AttributeSet
import android.view.View
import android.view.accessibility.AccessibilityNodeInfo
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.view.AccessibilityDelegateCompat
import androidx.core.view.ViewCompat
import androidx.core.view.accessibility.AccessibilityNodeInfoCompat
import com.sallie.ui.adaptation.UIAdaptationState

/**
 * Sallie's Adaptive Card
 * 
 * A container component that displays content in a card format with adaptive
 * styling based on theme, accessibility, device, and user context.
 */
class SallieCard @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : AdaptiveLayout(context, attrs, defStyleAttr) {

    // UI elements
    private var cardTitle: TextView? = null
    private var cardContent: LinearLayout? = null
    
    // Card properties
    private var cardElevation = 4f
    private var hasHeader = false
    
    init {
        // Inflate the card layout
        View.inflate(context, R.layout.sallie_card, this)
        
        // Get references to views
        cardTitle = findViewById(R.id.card_title)
        cardContent = findViewById(R.id.card_content)
        
        // Set default card properties
        clipToOutline = true
        
        // Parse attributes
        val typedArray = context.obtainStyledAttributes(
            attrs, R.styleable.SallieCard, defStyleAttr, 0
        )
        
        try {
            // Get card title
            val title = typedArray.getString(R.styleable.SallieCard_cardTitle)
            if (title != null) {
                setCardTitle(title)
            } else {
                cardTitle?.visibility = View.GONE
                hasHeader = false
            }
            
            // Get card elevation
            cardElevation = typedArray.getDimension(
                R.styleable.SallieCard_cardElevation,
                resources.getDimension(R.dimen.card_default_elevation)
            )
            elevation = cardElevation
        } finally {
            typedArray.recycle()
        }
        
        // Setup enhanced accessibility
        setupAccessibility()
    }
    
    /**
     * Set card title
     */
    fun setCardTitle(title: String) {
        cardTitle?.text = title
        cardTitle?.visibility = View.VISIBLE
        hasHeader = true
    }
    
    /**
     * Add content to the card
     */
    fun addContent(view: View) {
        cardContent?.addView(view)
    }
    
    /**
     * Remove all content from the card
     */
    fun clearContent() {
        cardContent?.removeAllViews()
    }
    
    /**
     * Apply theme adaptations
     */
    override fun applyTheme(state: UIAdaptationState) {
        super.applyTheme(state)
        
        val theme = state.themeConfig
        
        // Apply card styling
        val background = GradientDrawable().apply {
            shape = GradientDrawable.RECTANGLE
            cornerRadius = theme.cornerRadius.toFloat()
            setColor(if (theme.isDarkMode) darkenColor(theme.backgroundColor) else theme.backgroundColor)
        }
        this.background = background
        
        // Apply elevation based on theme
        elevation = theme.elevationLevel * resources.displayMetrics.density
        
        // Apply header styling if present
        if (hasHeader) {
            cardTitle?.setTextColor(theme.textColor)
        }
    }
    
    /**
     * Apply accessibility adaptations
     */
    override fun applyAccessibility(state: UIAdaptationState) {
        super.applyAccessibility(state)
        
        val accessibility = state.accessibilityConfig
        
        // Adjust text size for accessibility
        if (hasHeader) {
            cardTitle?.textSize = 18 * accessibility.fontScale
        }
        
        // Increase contrast if needed
        if (accessibility.contrastEnhanced) {
            if (hasHeader) {
                cardTitle?.setTextColor(enhanceContrast(state.themeConfig.textColor))
            }
        }
    }
    
    /**
     * Apply tablet-specific layout adaptations
     */
    override fun applyTabletLayout() {
        val horizontalPadding = (24 * resources.displayMetrics.density).toInt()
        val verticalPadding = (16 * resources.displayMetrics.density).toInt()
        
        cardContent?.setPadding(horizontalPadding, verticalPadding, horizontalPadding, verticalPadding)
        
        if (hasHeader) {
            val headerPadding = (24 * resources.displayMetrics.density).toInt()
            cardTitle?.setPadding(headerPadding, headerPadding, headerPadding, headerPadding / 2)
            cardTitle?.textSize = 20f
        }
    }
    
    /**
     * Apply phone-specific layout adaptations
     */
    override fun applyPhoneLayout() {
        val horizontalPadding = (16 * resources.displayMetrics.density).toInt()
        val verticalPadding = (12 * resources.displayMetrics.density).toInt()
        
        cardContent?.setPadding(horizontalPadding, verticalPadding, horizontalPadding, verticalPadding)
        
        if (hasHeader) {
            val headerPadding = (16 * resources.displayMetrics.density).toInt()
            cardTitle?.setPadding(headerPadding, headerPadding, headerPadding, headerPadding / 2)
            cardTitle?.textSize = 18f
        }
    }
    
    /**
     * Apply simplified layout for first-time users
     */
    override fun applySimplifiedLayout() {
        // Reduce visual complexity by simplifying the card
        val simpleBackground = GradientDrawable().apply {
            shape = GradientDrawable.RECTANGLE
            cornerRadius = 8f
            setColor(currentState.themeConfig.backgroundColor)
        }
        background = simpleBackground
        
        // Reduce elevation for simpler look
        elevation = 2 * resources.displayMetrics.density
        
        // Increase padding for better readability
        val padding = (16 * resources.displayMetrics.density).toInt()
        cardContent?.setPadding(padding, padding, padding, padding)
    }
    
    /**
     * Get default content description
     */
    override fun getDefaultContentDescription(): String {
        return if (hasHeader) {
            cardTitle?.text.toString() + " card"
        } else {
            "Information card"
        }
    }
    
    /**
     * Add custom accessibility actions
     */
    override fun addCustomAccessibilityActions(info: AccessibilityNodeInfo) {
        // Could add expand/collapse action if the card supports it
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
                
                // Mark this as a card
                info.roleDescription = "card"
                
                // Set the heading property for the title if present
                if (hasHeader) {
                    ViewCompat.setAccessibilityHeading(cardTitle!!, true)
                }
            }
        })
    }
}

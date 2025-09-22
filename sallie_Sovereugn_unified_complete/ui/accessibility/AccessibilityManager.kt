package com.sallie.ui.accessibility

import android.accessibilityservice.AccessibilityServiceInfo
import android.content.Context
import android.content.SharedPreferences
import android.content.res.Configuration
import android.os.Build
import android.provider.Settings
import android.view.View
import android.view.accessibility.AccessibilityManager
import androidx.core.content.ContextCompat
import com.sallie.ui.adaptation.UIAdaptationManager
import com.sallie.ui.adaptation.UIState

/**
 * Sallie's Accessibility Manager
 * 
 * A comprehensive system for managing accessibility features and settings.
 * This helps ensure Sallie's UI is accessible to all users regardless of
 * their abilities or preferences.
 */
class AccessibilityManager private constructor(private val context: Context) {
    
    companion object {
        private const val PREFS_NAME = "sallie_accessibility_prefs"
        private const val KEY_FONT_SCALE = "font_scale"
        private const val KEY_HIGH_CONTRAST = "high_contrast"
        private const val KEY_SIMPLIFIED_UI = "simplified_ui"
        
        @Volatile
        private var instance: AccessibilityManager? = null
        
        fun getInstance(context: Context): AccessibilityManager {
            return instance ?: synchronized(this) {
                instance ?: AccessibilityManager(context.applicationContext).also {
                    instance = it
                }
            }
        }
    }
    
    private val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    private val systemAccessibilityManager = context.getSystemService(Context.ACCESSIBILITY_SERVICE) as AccessibilityManager
    private val uiAdaptationManager = UIAdaptationManager.getInstance(context)
    
    private var currentFontScale: Float = 1.0f
    private var isHighContrastEnabled: Boolean = false
    private var isSimplifiedUIEnabled: Boolean = false
    
    init {
        // Load saved preferences
        currentFontScale = prefs.getFloat(KEY_FONT_SCALE, 1.0f)
        isHighContrastEnabled = prefs.getBoolean(KEY_HIGH_CONTRAST, false)
        isSimplifiedUIEnabled = prefs.getBoolean(KEY_SIMPLIFIED_UI, false)
        
        // Initial check of system settings
        detectSystemAccessibilitySettings()
    }
    
    /**
     * Detect and apply system accessibility settings
     */
    fun detectSystemAccessibilitySettings() {
        // Get font scale from system
        val systemFontScale = context.resources.configuration.fontScale
        if (systemFontScale != currentFontScale) {
            setFontScale(systemFontScale)
        }
        
        // Check for high contrast
        val isSystemHighContrast = isSystemHighContrastEnabled()
        if (isSystemHighContrast != isHighContrastEnabled) {
            setHighContrastEnabled(isSystemHighContrast)
        }
        
        // Check for various accessibility services
        val hasAccessibilityServicesRunning = hasAccessibilityServicesEnabled()
        if (hasAccessibilityServicesRunning && !isSimplifiedUIEnabled) {
            setSimplifiedUIEnabled(true)
        }
        
        // Apply the current accessibility state to the UI
        applyAccessibilitySettings()
    }
    
    /**
     * Check if system high contrast mode is enabled
     */
    private fun isSystemHighContrastEnabled(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val uiModeManager = context.getSystemService(Context.UI_MODE_SERVICE) as android.app.UiModeManager
            uiModeManager.nightMode == android.app.UiModeManager.MODE_NIGHT_YES
        } else {
            // For older versions, approximate using night mode
            (context.resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK) == 
                Configuration.UI_MODE_NIGHT_YES
        }
    }
    
    /**
     * Check if any accessibility services are enabled
     */
    private fun hasAccessibilityServicesEnabled(): Boolean {
        val accessibilityEnabled = try {
            Settings.Secure.getInt(
                context.contentResolver,
                Settings.Secure.ACCESSIBILITY_ENABLED
            )
        } catch (e: Settings.SettingNotFoundException) {
            0
        }
        
        if (accessibilityEnabled == 1) {
            val enabledServices = systemAccessibilityManager.getEnabledAccessibilityServiceList(
                AccessibilityServiceInfo.FEEDBACK_ALL_MASK
            )
            return enabledServices.isNotEmpty()
        }
        
        return false
    }
    
    /**
     * Set the font scale factor
     */
    fun setFontScale(scale: Float) {
        currentFontScale = scale
        prefs.edit().putFloat(KEY_FONT_SCALE, scale).apply()
        applyAccessibilitySettings()
    }
    
    /**
     * Set high contrast mode
     */
    fun setHighContrastEnabled(enabled: Boolean) {
        isHighContrastEnabled = enabled
        prefs.edit().putBoolean(KEY_HIGH_CONTRAST, enabled).apply()
        applyAccessibilitySettings()
    }
    
    /**
     * Set simplified UI mode
     */
    fun setSimplifiedUIEnabled(enabled: Boolean) {
        isSimplifiedUIEnabled = enabled
        prefs.edit().putBoolean(KEY_SIMPLIFIED_UI, enabled).apply()
        applyAccessibilitySettings()
    }
    
    /**
     * Toggle high contrast mode
     */
    fun toggleHighContrast() {
        setHighContrastEnabled(!isHighContrastEnabled)
    }
    
    /**
     * Toggle simplified UI mode
     */
    fun toggleSimplifiedUI() {
        setSimplifiedUIEnabled(!isSimplifiedUIEnabled)
    }
    
    /**
     * Get current font scale
     */
    fun getCurrentFontScale(): Float {
        return currentFontScale
    }
    
    /**
     * Check if high contrast mode is enabled
     */
    fun isHighContrastEnabled(): Boolean {
        return isHighContrastEnabled
    }
    
    /**
     * Check if simplified UI mode is enabled
     */
    fun isSimplifiedUIEnabled(): Boolean {
        return isSimplifiedUIEnabled
    }
    
    /**
     * Apply current accessibility settings to the UI
     */
    private fun applyAccessibilitySettings() {
        val newUiState = when {
            isSimplifiedUIEnabled -> UIState.SIMPLIFIED
            isHighContrastEnabled -> UIState.HIGH_CONTRAST
            currentFontScale > 1.2f -> UIState.LARGER_TEXT
            else -> UIState.NORMAL
        }
        
        uiAdaptationManager.updateUIState(newUiState)
    }
    
    /**
     * Configure a view for accessibility
     */
    fun configureViewForAccessibility(view: View, contentDescription: String, isClickable: Boolean = false) {
        view.contentDescription = contentDescription
        
        if (isClickable) {
            view.isFocusable = true
            view.isClickable = true
        }
        
        if (currentFontScale > 1.2f) {
            // Increase touch target size for better accessibility
            val extraPadding = (8 * currentFontScale).toInt()
            view.setPadding(
                view.paddingLeft + extraPadding,
                view.paddingTop + extraPadding,
                view.paddingRight + extraPadding,
                view.paddingBottom + extraPadding
            )
        }
    }
    
    /**
     * Set up TalkBack announcements for important UI changes
     */
    fun announceForAccessibility(view: View, announcement: String) {
        view.announceForAccessibility(announcement)
    }
    
    /**
     * Setup live region for a view
     */
    fun setupLiveRegion(view: View) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            view.accessibilityLiveRegion = View.ACCESSIBILITY_LIVE_REGION_POLITE
        }
    }
}

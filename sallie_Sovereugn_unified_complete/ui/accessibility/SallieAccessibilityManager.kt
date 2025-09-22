package com.sallie.ui.accessibility

import android.content.Context
import android.os.Build
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityManager
import androidx.core.view.ViewCompat
import com.sallie.ui.adaptation.AccessibilityConfig
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * Sallie's Accessibility Manager
 * 
 * Manages accessibility features and provides tools for enhancing
 * application accessibility. This class detects system accessibility settings
 * and provides an interface for components to adjust their behavior accordingly.
 */
class SallieAccessibilityManager(private val context: Context) {
    
    private val coroutineScope = CoroutineScope(Dispatchers.Main)
    private val systemAccessibilityManager = context.getSystemService(Context.ACCESSIBILITY_SERVICE) as AccessibilityManager
    
    // Current accessibility configuration
    private val _accessibilityConfig = MutableStateFlow(AccessibilityConfig.Default)
    val accessibilityConfig: StateFlow<AccessibilityConfig> = _accessibilityConfig.asStateFlow()
    
    // Active accessibility services
    private val _activeServices = MutableStateFlow<List<String>>(emptyList())
    val activeServices: StateFlow<List<String>> = _activeServices.asStateFlow()
    
    // Is a screen reader active
    private val _isScreenReaderActive = MutableStateFlow(false)
    val isScreenReaderActive: StateFlow<Boolean> = _isScreenReaderActive.asStateFlow()
    
    init {
        // Initial detection of system settings
        detectSystemAccessibilitySettings()
        
        // Set up listeners for accessibility changes
        setupAccessibilityChangeListeners()
    }
    
    /**
     * Update the accessibility configuration
     */
    fun updateAccessibilityConfig(config: AccessibilityConfig) {
        _accessibilityConfig.value = config
        
        // Announce changes to screen readers if active
        if (isScreenReaderActive.value) {
            announceConfigChanges()
        }
    }
    
    /**
     * Set font scaling
     */
    fun setFontScale(scale: Float) {
        _accessibilityConfig.value = _accessibilityConfig.value.copy(
            fontScale = scale.coerceIn(0.75f, 2.0f)
        )
    }
    
    /**
     * Set enhanced contrast mode
     */
    fun setEnhancedContrast(enabled: Boolean) {
        _accessibilityConfig.value = _accessibilityConfig.value.copy(
            contrastEnhanced = enabled
        )
    }
    
    /**
     * Set reduced motion mode
     */
    fun setReducedMotion(enabled: Boolean) {
        _accessibilityConfig.value = _accessibilityConfig.value.copy(
            reduceMotion = enabled
        )
    }
    
    /**
     * Set touch target size
     */
    fun setTouchTargetSize(size: Int) {
        _accessibilityConfig.value = _accessibilityConfig.value.copy(
            touchTargetSize = size.coerceIn(32, 64)
        )
    }
    
    /**
     * Set screen reader compatible mode
     */
    fun setScreenReaderCompatible(enabled: Boolean) {
        _accessibilityConfig.value = _accessibilityConfig.value.copy(
            screenReaderCompatible = enabled
        )
    }
    
    /**
     * Set simple animations mode
     */
    fun setSimpleAnimations(enabled: Boolean) {
        _accessibilityConfig.value = _accessibilityConfig.value.copy(
            useSimpleAnimations = enabled
        )
    }
    
    /**
     * Check if the device has a specific accessibility service enabled
     */
    fun isAccessibilityServiceEnabled(serviceName: String): Boolean {
        return activeServices.value.contains(serviceName)
    }
    
    /**
     * Announce a message to screen readers
     */
    fun announce(message: String) {
        if (isScreenReaderActive.value) {
            val event = AccessibilityEvent.obtain(AccessibilityEvent.TYPE_ANNOUNCEMENT)
            event.text.add(message)
            systemAccessibilityManager.sendAccessibilityEvent(event)
        }
    }
    
    /**
     * Get accessibility recommendations for current user
     */
    suspend fun getAccessibilityRecommendations(): List<AccessibilityRecommendation> {
        return withContext(Dispatchers.Default) {
            val recommendations = mutableListOf<AccessibilityRecommendation>()
            
            // Font size recommendations
            if (systemHasFontScaleEnabled() && accessibilityConfig.value.fontScale < 1.2f) {
                recommendations.add(
                    AccessibilityRecommendation(
                        type = RecommendationType.FONT_SIZE,
                        title = "Increase Text Size",
                        description = "Larger text may improve readability",
                        implementationAction = { setFontScale(1.3f) }
                    )
                )
            }
            
            // Contrast recommendations
            if (systemHasHighContrastEnabled() && !accessibilityConfig.value.contrastEnhanced) {
                recommendations.add(
                    AccessibilityRecommendation(
                        type = RecommendationType.CONTRAST,
                        title = "Enable High Contrast",
                        description = "Improves text visibility",
                        implementationAction = { setEnhancedContrast(true) }
                    )
                )
            }
            
            // Motion reduction
            if (systemHasReducedMotionEnabled() && !accessibilityConfig.value.reduceMotion) {
                recommendations.add(
                    AccessibilityRecommendation(
                        type = RecommendationType.MOTION,
                        title = "Reduce Motion Effects",
                        description = "Disables unnecessary animations",
                        implementationAction = { setReducedMotion(true) }
                    )
                )
            }
            
            // Touch targets
            if (isScreenReaderActive.value && accessibilityConfig.value.touchTargetSize < 48) {
                recommendations.add(
                    AccessibilityRecommendation(
                        type = RecommendationType.TOUCH_TARGET,
                        title = "Larger Touch Targets",
                        description = "Makes buttons and controls easier to tap",
                        implementationAction = { setTouchTargetSize(52) }
                    )
                )
            }
            
            recommendations
        }
    }
    
    /**
     * Perform an accessibility scan of the provided layout
     */
    suspend fun performAccessibilityScan(rootViewId: Int): List<AccessibilityIssue> {
        return withContext(Dispatchers.Default) {
            // In a real implementation, this would scan the view hierarchy
            // and report accessibility issues
            emptyList()
        }
    }
    
    /**
     * Detect system accessibility settings
     */
    private fun detectSystemAccessibilitySettings() {
        coroutineScope.launch {
            // Check for screen reader
            val screenReaderActive = systemAccessibilityManager.isEnabled && 
                (systemAccessibilityManager.isTouchExplorationEnabled ||
                        isServiceEnabled("com.google.android.marvin.talkback"))
            
            _isScreenReaderActive.value = screenReaderActive
            
            // Get list of enabled services
            val services = getEnabledAccessibilityServices()
            _activeServices.value = services
            
            // Update config based on system settings
            _accessibilityConfig.value = _accessibilityConfig.value.copy(
                fontScale = systemGetFontScale(),
                contrastEnhanced = systemHasHighContrastEnabled(),
                reduceMotion = systemHasReducedMotionEnabled(),
                screenReaderCompatible = screenReaderActive
            )
        }
    }
    
    /**
     * Set up listeners for accessibility changes
     */
    private fun setupAccessibilityChangeListeners() {
        // Listen for system accessibility setting changes
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            systemAccessibilityManager.addAccessibilityStateChangeListener {
                detectSystemAccessibilitySettings()
            }
            
            systemAccessibilityManager.addTouchExplorationStateChangeListener {
                detectSystemAccessibilitySettings()
            }
        }
    }
    
    /**
     * Announce configuration changes to screen readers
     */
    private fun announceConfigChanges() {
        val config = accessibilityConfig.value
        
        val message = StringBuilder("Accessibility settings updated. ")
        
        if (config.fontScale > 1.2f) {
            message.append("Larger text enabled. ")
        }
        
        if (config.contrastEnhanced) {
            message.append("High contrast mode enabled. ")
        }
        
        if (config.reduceMotion) {
            message.append("Reduced motion enabled. ")
        }
        
        announce(message.toString())
    }
    
    /**
     * Get system font scale
     */
    private fun systemGetFontScale(): Float {
        return context.resources.configuration.fontScale
    }
    
    /**
     * Check if system has high contrast enabled
     */
    private fun systemHasHighContrastEnabled(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val contrastLevel = context.resources.configuration.isHighContrast
            contrastLevel
        } else {
            false
        }
    }
    
    /**
     * Check if system has reduced motion enabled
     */
    private fun systemHasReducedMotionEnabled(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val animationScale = try {
                android.provider.Settings.Global.getFloat(
                    context.contentResolver,
                    android.provider.Settings.Global.ANIMATOR_DURATION_SCALE
                )
            } catch (e: Exception) {
                1.0f
            }
            
            animationScale == 0.0f
        } else {
            false
        }
    }
    
    /**
     * Check if a specific accessibility service is enabled
     */
    private fun isServiceEnabled(serviceName: String): Boolean {
        val enabledServices = systemAccessibilityManager.getEnabledAccessibilityServiceList(
            AccessibilityEvent.TYPES_ALL_MASK
        )
        
        return enabledServices.any { it.id.contains(serviceName) }
    }
    
    /**
     * Get list of enabled accessibility services
     */
    private fun getEnabledAccessibilityServices(): List<String> {
        val enabledServices = systemAccessibilityManager.getEnabledAccessibilityServiceList(
            AccessibilityEvent.TYPES_ALL_MASK
        )
        
        return enabledServices.mapNotNull { it.id }
    }
}

/**
 * Accessibility recommendation for improving user experience
 */
data class AccessibilityRecommendation(
    val type: RecommendationType,
    val title: String,
    val description: String,
    val implementationAction: () -> Unit
)

/**
 * Types of accessibility recommendations
 */
enum class RecommendationType {
    FONT_SIZE,
    CONTRAST,
    MOTION,
    TOUCH_TARGET,
    SCREEN_READER,
    OTHER
}

/**
 * Accessibility issue found in the UI
 */
data class AccessibilityIssue(
    val severity: IssueSeverity,
    val type: IssueType,
    val description: String,
    val elementId: Int,
    val suggestedFix: String
)

/**
 * Accessibility issue severity
 */
enum class IssueSeverity {
    CRITICAL,
    HIGH,
    MEDIUM,
    LOW,
    INFO
}

/**
 * Accessibility issue types
 */
enum class IssueType {
    MISSING_LABEL,
    LOW_CONTRAST,
    SMALL_TOUCH_TARGET,
    MISSING_HEADING_STRUCTURE,
    DUPLICATE_LABELS,
    EMPTY_BUTTON,
    OTHER
}

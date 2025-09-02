package com.sallie.ui.adaptation

import android.content.Context
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.sallie.core.PersonalityBridge
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Sallie's Dynamic UI Adapter
 *
 * Manages UI adaptation based on user context, preferences, and Sallie's personality.
 * This system dynamically adjusts UI elements, themes, layouts, and interaction patterns
 * to create a personalized and responsive user experience.
 */
class DynamicUIAdapter(
    private val context: Context,
    private val personalityBridge: PersonalityBridge
) {
    private val coroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private val isInitialized = AtomicBoolean(false)
    
    // Current UI adaptation state
    private val _adaptationState = MutableStateFlow<UIAdaptationState>(UIAdaptationState.Default)
    val adaptationState: StateFlow<UIAdaptationState> = _adaptationState.asStateFlow()
    
    // Current theme
    private val _currentTheme = MutableStateFlow<ThemeConfig>(ThemeConfig.Default)
    val currentTheme: StateFlow<ThemeConfig> = _currentTheme.asStateFlow()
    
    // Accessibility settings
    private val _accessibilityConfig = MutableStateFlow<AccessibilityConfig>(AccessibilityConfig.Default)
    val accessibilityConfig: StateFlow<AccessibilityConfig> = _accessibilityConfig.asStateFlow()
    
    // Device context
    private val _deviceContext = MutableStateFlow<DeviceContext>(DeviceContext.Unknown)
    val deviceContext: StateFlow<DeviceContext> = _deviceContext.asStateFlow()
    
    // UI components registry
    private val adaptableComponents = mutableListOf<AdaptableComponent>()
    
    /**
     * Initialize the dynamic UI adapter
     */
    fun initialize() {
        if (isInitialized.getAndSet(true)) {
            return
        }
        
        coroutineScope.launch {
            // Detect initial device context
            detectDeviceContext()
            
            // Load saved accessibility preferences
            loadAccessibilityPreferences()
            
            // Load theme preferences
            loadThemePreferences()
            
            // Start listening for context changes
            startContextMonitoring()
        }
    }
    
    /**
     * Register an adaptable component
     */
    fun registerComponent(component: AdaptableComponent) {
        adaptableComponents.add(component)
        
        // Apply current adaptation state to new component
        component.applyAdaptation(adaptationState.value)
    }
    
    /**
     * Unregister an adaptable component
     */
    fun unregisterComponent(component: AdaptableComponent) {
        adaptableComponents.remove(component)
    }
    
    /**
     * Update the current adaptation state
     */
    fun updateAdaptationState(newState: UIAdaptationState) {
        _adaptationState.value = newState
        
        // Apply new state to all registered components
        adaptableComponents.forEach { component ->
            component.applyAdaptation(newState)
        }
    }
    
    /**
     * Update the current theme
     */
    fun updateTheme(newTheme: ThemeConfig) {
        _currentTheme.value = newTheme
        
        // Update adaptation state with new theme
        updateAdaptationState(
            adaptationState.value.copy(
                themeConfig = newTheme
            )
        )
    }
    
    /**
     * Update accessibility config
     */
    fun updateAccessibilityConfig(newConfig: AccessibilityConfig) {
        _accessibilityConfig.value = newConfig
        
        // Update adaptation state with new accessibility config
        updateAdaptationState(
            adaptationState.value.copy(
                accessibilityConfig = newConfig
            )
        )
        
        // Save preferences
        saveAccessibilityPreferences(newConfig)
    }
    
    /**
     * Adapt UI for the current user emotion
     */
    fun adaptToEmotion(emotion: String) {
        coroutineScope.launch {
            val emotionBasedTheme = when (emotion.lowercase()) {
                "happy", "excited", "joyful" -> {
                    currentTheme.value.copy(
                        accentColor = ThemeConfig.HAPPY_ACCENT,
                        animationSpeed = 1.2f
                    )
                }
                "sad", "melancholy" -> {
                    currentTheme.value.copy(
                        accentColor = ThemeConfig.CALM_ACCENT,
                        animationSpeed = 0.8f
                    )
                }
                "angry", "frustrated" -> {
                    currentTheme.value.copy(
                        accentColor = ThemeConfig.ALERT_ACCENT,
                        animationSpeed = 1.0f
                    )
                }
                "calm", "relaxed" -> {
                    currentTheme.value.copy(
                        accentColor = ThemeConfig.CALM_ACCENT,
                        animationSpeed = 0.9f
                    )
                }
                else -> currentTheme.value
            }
            
            updateTheme(emotionBasedTheme)
        }
    }
    
    /**
     * Adapt UI based on personality traits
     */
    fun adaptToPersonality() {
        coroutineScope.launch {
            try {
                val personalityTraits = personalityBridge.getCurrentTraits()
                
                // Map personality traits to UI adaptations
                val warmth = personalityTraits["warmth"] ?: 0.5f
                val organization = personalityTraits["organization"] ?: 0.5f
                val creativity = personalityTraits["creativity"] ?: 0.5f
                
                // Adjust UI based on traits
                val personalityTheme = currentTheme.value.copy(
                    colorTemperature = ThemeConfig.mapPersonalityToColorTemp(warmth),
                    density = ThemeConfig.mapPersonalityToDensity(organization),
                    visualComplexity = ThemeConfig.mapPersonalityToComplexity(creativity)
                )
                
                updateTheme(personalityTheme)
            } catch (e: Exception) {
                // Fallback to default theme if personality bridge fails
                e.printStackTrace()
            }
        }
    }
    
    /**
     * Adapt UI for current time of day
     */
    fun adaptToTimeOfDay() {
        val hour = java.time.LocalTime.now().hour
        val isNightMode = hour < 6 || hour >= 20
        
        val timeBasedTheme = currentTheme.value.copy(
            isDarkMode = isNightMode,
            brightness = if (isNightMode) 0.7f else 1.0f,
            colorTemperature = if (isNightMode) 0.7f else 0.5f
        )
        
        updateTheme(timeBasedTheme)
    }
    
    /**
     * Adapt UI for current device context
     */
    private fun detectDeviceContext() {
        val displayMetrics = context.resources.displayMetrics
        val widthDp = displayMetrics.widthPixels / displayMetrics.density
        val heightDp = displayMetrics.heightPixels / displayMetrics.density
        
        val isTablet = widthDp >= 600
        val isLandscape = widthDp > heightDp
        
        _deviceContext.value = DeviceContext(
            screenWidthDp = widthDp.toInt(),
            screenHeightDp = heightDp.toInt(),
            isTablet = isTablet,
            isLandscape = isLandscape,
            densityDpi = displayMetrics.densityDpi
        )
        
        // Update adaptation state with new device context
        updateAdaptationState(
            adaptationState.value.copy(
                deviceContext = deviceContext.value
            )
        )
    }
    
    /**
     * Start monitoring for context changes
     */
    private fun startContextMonitoring() {
        // In a real implementation, this would register for various system broadcasts
        // and sensor data to detect changes in context
        
        // For now, we'll just update based on time of day every hour
        coroutineScope.launch {
            while (true) {
                adaptToTimeOfDay()
                kotlinx.coroutines.delay(60 * 60 * 1000) // 1 hour
            }
        }
    }
    
    /**
     * Load saved accessibility preferences
     */
    private fun loadAccessibilityPreferences() {
        val prefs = context.getSharedPreferences("sallie_accessibility", Context.MODE_PRIVATE)
        
        val config = AccessibilityConfig(
            fontScale = prefs.getFloat("font_scale", 1.0f),
            contrastEnhanced = prefs.getBoolean("contrast_enhanced", false),
            reduceMotion = prefs.getBoolean("reduce_motion", false),
            touchTargetSize = prefs.getInt("touch_target_size", AccessibilityConfig.DEFAULT_TOUCH_TARGET_SIZE),
            screenReaderCompatible = prefs.getBoolean("screen_reader_compatible", false),
            useSimpleAnimations = prefs.getBoolean("use_simple_animations", false)
        )
        
        _accessibilityConfig.value = config
        
        // Update adaptation state with loaded accessibility config
        updateAdaptationState(
            adaptationState.value.copy(
                accessibilityConfig = config
            )
        )
    }
    
    /**
     * Save accessibility preferences
     */
    private fun saveAccessibilityPreferences(config: AccessibilityConfig) {
        val prefs = context.getSharedPreferences("sallie_accessibility", Context.MODE_PRIVATE)
        
        prefs.edit()
            .putFloat("font_scale", config.fontScale)
            .putBoolean("contrast_enhanced", config.contrastEnhanced)
            .putBoolean("reduce_motion", config.reduceMotion)
            .putInt("touch_target_size", config.touchTargetSize)
            .putBoolean("screen_reader_compatible", config.screenReaderCompatible)
            .putBoolean("use_simple_animations", config.useSimpleAnimations)
            .apply()
    }
    
    /**
     * Load saved theme preferences
     */
    private fun loadThemePreferences() {
        val prefs = context.getSharedPreferences("sallie_theme", Context.MODE_PRIVATE)
        
        val theme = ThemeConfig(
            isDarkMode = prefs.getBoolean("is_dark_mode", ThemeConfig.DEFAULT_DARK_MODE),
            primaryColor = prefs.getInt("primary_color", ThemeConfig.DEFAULT_PRIMARY),
            accentColor = prefs.getInt("accent_color", ThemeConfig.DEFAULT_ACCENT),
            backgroundColor = prefs.getInt("background_color", ThemeConfig.DEFAULT_BACKGROUND),
            textColor = prefs.getInt("text_color", ThemeConfig.DEFAULT_TEXT),
            fontFamily = prefs.getString("font_family", ThemeConfig.DEFAULT_FONT_FAMILY) ?: ThemeConfig.DEFAULT_FONT_FAMILY,
            cornerRadius = prefs.getInt("corner_radius", ThemeConfig.DEFAULT_CORNER_RADIUS),
            elevationLevel = prefs.getInt("elevation_level", ThemeConfig.DEFAULT_ELEVATION),
            animationSpeed = prefs.getFloat("animation_speed", 1.0f),
            brightness = prefs.getFloat("brightness", 1.0f),
            colorTemperature = prefs.getFloat("color_temperature", 0.5f),
            density = prefs.getFloat("density", 0.5f),
            visualComplexity = prefs.getFloat("visual_complexity", 0.5f)
        )
        
        _currentTheme.value = theme
        
        // Update adaptation state with loaded theme
        updateAdaptationState(
            adaptationState.value.copy(
                themeConfig = theme
            )
        )
    }
    
    /**
     * Release resources
     */
    fun release() {
        coroutineScope.launch {
            adaptableComponents.clear()
            isInitialized.set(false)
        }
    }
}

/**
 * Interface for UI components that can adapt to different states
 */
interface AdaptableComponent {
    /**
     * Apply UI adaptation based on the provided state
     */
    fun applyAdaptation(state: UIAdaptationState)
}

/**
 * Current UI adaptation state
 */
data class UIAdaptationState(
    val themeConfig: ThemeConfig = ThemeConfig.Default,
    val accessibilityConfig: AccessibilityConfig = AccessibilityConfig.Default,
    val deviceContext: DeviceContext = DeviceContext.Unknown,
    val userContext: UserContext = UserContext.Default
) {
    companion object {
        val Default = UIAdaptationState()
    }
}

/**
 * Theme configuration
 */
data class ThemeConfig(
    val isDarkMode: Boolean = DEFAULT_DARK_MODE,
    val primaryColor: Int = DEFAULT_PRIMARY,
    val accentColor: Int = DEFAULT_ACCENT,
    val backgroundColor: Int = DEFAULT_BACKGROUND,
    val textColor: Int = DEFAULT_TEXT,
    val fontFamily: String = DEFAULT_FONT_FAMILY,
    val cornerRadius: Int = DEFAULT_CORNER_RADIUS,
    val elevationLevel: Int = DEFAULT_ELEVATION,
    val animationSpeed: Float = 1.0f,
    val brightness: Float = 1.0f,
    val colorTemperature: Float = 0.5f,  // 0.0 = cool, 1.0 = warm
    val density: Float = 0.5f,           // 0.0 = sparse, 1.0 = dense
    val visualComplexity: Float = 0.5f   // 0.0 = simple, 1.0 = complex
) {
    companion object {
        // Default theme values
        const val DEFAULT_DARK_MODE = false
        const val DEFAULT_PRIMARY = 0xFF6200EE.toInt()
        const val DEFAULT_ACCENT = 0xFF03DAC5.toInt()
        const val DEFAULT_BACKGROUND = 0xFFFFFFFF.toInt()
        const val DEFAULT_TEXT = 0xFF000000.toInt()
        const val DEFAULT_FONT_FAMILY = "sans-serif"
        const val DEFAULT_CORNER_RADIUS = 8
        const val DEFAULT_ELEVATION = 2
        
        // Emotion-based colors
        const val HAPPY_ACCENT = 0xFFFFB74D.toInt()
        const val CALM_ACCENT = 0xFF81D4FA.toInt()
        const val ALERT_ACCENT = 0xFFE57373.toInt()
        
        // Default theme instance
        val Default = ThemeConfig()
        
        // Mapping functions for personality traits
        fun mapPersonalityToColorTemp(warmth: Float): Float {
            return warmth.coerceIn(0f, 1f)
        }
        
        fun mapPersonalityToDensity(organization: Float): Float {
            return organization.coerceIn(0f, 1f)
        }
        
        fun mapPersonalityToComplexity(creativity: Float): Float {
            return creativity.coerceIn(0f, 1f)
        }
    }
}

/**
 * Accessibility configuration
 */
data class AccessibilityConfig(
    val fontScale: Float = 1.0f,
    val contrastEnhanced: Boolean = false,
    val reduceMotion: Boolean = false,
    val touchTargetSize: Int = DEFAULT_TOUCH_TARGET_SIZE,
    val screenReaderCompatible: Boolean = false,
    val useSimpleAnimations: Boolean = false
) {
    companion object {
        const val DEFAULT_TOUCH_TARGET_SIZE = 48 // dp
        val Default = AccessibilityConfig()
    }
}

/**
 * Device context
 */
data class DeviceContext(
    val screenWidthDp: Int,
    val screenHeightDp: Int,
    val isTablet: Boolean,
    val isLandscape: Boolean,
    val densityDpi: Int
) {
    companion object {
        val Unknown = DeviceContext(
            screenWidthDp = 0,
            screenHeightDp = 0,
            isTablet = false,
            isLandscape = false,
            densityDpi = 0
        )
    }
}

/**
 * User context
 */
data class UserContext(
    val currentEmotion: String? = null,
    val preferredInteractionMode: InteractionMode = InteractionMode.STANDARD,
    val isFirstTimeUser: Boolean = false,
    val isPowerUser: Boolean = false,
    val accessibilityNeeds: Set<String> = emptySet()
) {
    companion object {
        val Default = UserContext()
    }
}

/**
 * User interaction modes
 */
enum class InteractionMode {
    STANDARD,
    SIMPLIFIED,
    EXPERT,
    CHILD_FRIENDLY,
    ELDERLY_OPTIMIZED
}

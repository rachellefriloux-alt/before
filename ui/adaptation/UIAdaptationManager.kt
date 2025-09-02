package com.sallie.ui.adaptation

import android.content.Context
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.sallie.core.personaCore.UserPreferences
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import java.util.concurrent.ConcurrentHashMap

/**
 * Sallie's UI Adaptation System
 * 
 * Central manager for dynamically adapting UI components based on user context,
 * preferences, accessibility needs, and interaction patterns.
 */
class UIAdaptationManager private constructor(private val context: Context) {

    private val coroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    
    // Current UI adaptation state
    private val _adaptationState = MutableLiveData<UIAdaptationState>(UIAdaptationState())
    val adaptationState: LiveData<UIAdaptationState> = _adaptationState
    
    // Track registered UI elements for updates
    private val registeredComponents = ConcurrentHashMap<String, AdaptiveUIComponent>()
    
    // System states that influence adaptation
    private var currentTheme = ThemeMode.SYSTEM
    private var currentInteractionMode = InteractionMode.STANDARD
    private var currentAccessibilityProfile: AccessibilityProfile? = null
    private var currentContextualFactors = ContextualFactors()
    private var userPreferences: UserPreferences? = null
    
    /**
     * Register a component to receive adaptation updates
     */
    fun registerComponent(component: AdaptiveUIComponent) {
        registeredComponents[component.componentId] = component
        
        // Apply current adaptation state immediately
        component.applyAdaptation(_adaptationState.value ?: UIAdaptationState())
    }
    
    /**
     * Unregister a component
     */
    fun unregisterComponent(componentId: String) {
        registeredComponents.remove(componentId)
    }
    
    /**
     * Set the current theme mode
     */
    fun setThemeMode(themeMode: ThemeMode) {
        if (currentTheme != themeMode) {
            currentTheme = themeMode
            updateAdaptationState()
        }
    }
    
    /**
     * Set the current interaction mode
     */
    fun setInteractionMode(interactionMode: InteractionMode) {
        if (currentInteractionMode != interactionMode) {
            currentInteractionMode = interactionMode
            updateAdaptationState()
        }
    }
    
    /**
     * Set the current accessibility profile
     */
    fun setAccessibilityProfile(profile: AccessibilityProfile?) {
        currentAccessibilityProfile = profile
        updateAdaptationState()
    }
    
    /**
     * Update contextual factors
     */
    fun updateContextualFactors(factors: ContextualFactors) {
        currentContextualFactors = factors
        updateAdaptationState()
    }
    
    /**
     * Update user preferences
     */
    fun updateUserPreferences(preferences: UserPreferences) {
        userPreferences = preferences
        updateAdaptationState()
    }
    
    /**
     * Get the current adaptation state
     */
    fun getCurrentState(): UIAdaptationState {
        return _adaptationState.value ?: UIAdaptationState()
    }
    
    /**
     * Update the adaptation state and notify all registered components
     */
    private fun updateAdaptationState() {
        val newState = UIAdaptationState(
            themeMode = currentTheme,
            interactionMode = currentInteractionMode,
            accessibilityProfile = currentAccessibilityProfile,
            contextualFactors = currentContextualFactors,
            userPreferences = userPreferences
        )
        
        _adaptationState.postValue(newState)
        
        // Update all registered components
        coroutineScope.launch {
            registeredComponents.forEach { (_, component) ->
                component.applyAdaptation(newState)
            }
        }
    }
    
    companion object {
        private var instance: UIAdaptationManager? = null
        
        @Synchronized
        fun getInstance(context: Context): UIAdaptationManager {
            return instance ?: UIAdaptationManager(context.applicationContext).also {
                instance = it
            }
        }
    }
}

/**
 * Interface for UI components that can adapt to different states
 */
interface AdaptiveUIComponent {
    /**
     * Unique identifier for this component
     */
    val componentId: String
    
    /**
     * Apply the current adaptation state to this component
     */
    fun applyAdaptation(state: UIAdaptationState)
}

/**
 * Current UI adaptation state
 */
data class UIAdaptationState(
    val themeMode: ThemeMode = ThemeMode.SYSTEM,
    val interactionMode: InteractionMode = InteractionMode.STANDARD,
    val accessibilityProfile: AccessibilityProfile? = null,
    val contextualFactors: ContextualFactors = ContextualFactors(),
    val userPreferences: UserPreferences? = null
)

/**
 * Theme mode for the application
 */
enum class ThemeMode {
    LIGHT,
    DARK,
    SYSTEM,
    DYNAMIC_COLOR
}

/**
 * Interaction mode for the application
 */
enum class InteractionMode {
    STANDARD,   // Normal interaction mode
    COMPACT,    // Optimized for one-handed use
    EXPANDED,   // More space between elements
    SIMPLIFIED, // Reduced complexity for easier navigation
    FOCUSED     // Minimized distractions
}

/**
 * Accessibility profile for adaptations
 */
data class AccessibilityProfile(
    val textSize: TextSize = TextSize.NORMAL,
    val contrastLevel: ContrastLevel = ContrastLevel.NORMAL,
    val animationReduction: Boolean = false,
    val touchTarget: TouchTargetSize = TouchTargetSize.NORMAL,
    val fontType: FontType = FontType.DEFAULT,
    val colorBlindnessType: ColorBlindnessType? = null
)

/**
 * Text size preference
 */
enum class TextSize {
    SMALL,
    NORMAL,
    LARGE,
    EXTRA_LARGE,
    MAXIMUM
}

/**
 * Contrast level preference
 */
enum class ContrastLevel {
    LOW,
    NORMAL,
    HIGH,
    MAXIMUM
}

/**
 * Touch target size preference
 */
enum class TouchTargetSize {
    SMALL,
    NORMAL,
    LARGE,
    EXTRA_LARGE
}

/**
 * Font type preference
 */
enum class FontType {
    DEFAULT,
    OPEN_DYSLEXIC,
    SANS_SERIF,
    SERIF,
    MONOSPACE
}

/**
 * Color blindness types for adaptation
 */
enum class ColorBlindnessType {
    PROTANOPIA,     // Red-blind
    DEUTERANOPIA,   // Green-blind
    TRITANOPIA,     // Blue-blind
    ACHROMATOPSIA  // Complete color blindness
}

/**
 * Contextual factors that influence UI adaptation
 */
data class ContextualFactors(
    val timeOfDay: TimeOfDay = TimeOfDay.DAY,
    val ambientLight: AmbientLight = AmbientLight.NORMAL,
    val motionState: MotionState = MotionState.STATIONARY,
    val deviceOrientation: DeviceOrientation = DeviceOrientation.PORTRAIT,
    val deviceType: DeviceType = DeviceType.PHONE,
    val batteryLevel: BatteryLevel = BatteryLevel.NORMAL
)

/**
 * Time of day for adaptations
 */
enum class TimeOfDay {
    MORNING,
    DAY,
    EVENING,
    NIGHT
}

/**
 * Ambient light level
 */
enum class AmbientLight {
    DARK,
    LOW,
    NORMAL,
    BRIGHT,
    DIRECT_SUNLIGHT
}

/**
 * User's motion state
 */
enum class MotionState {
    STATIONARY,
    WALKING,
    RUNNING,
    IN_VEHICLE
}

/**
 * Device orientation
 */
enum class DeviceOrientation {
    PORTRAIT,
    LANDSCAPE
}

/**
 * Device type
 */
enum class DeviceType {
    PHONE,
    TABLET,
    FOLDABLE,
    TV
}

/**
 * Battery level
 */
enum class BatteryLevel {
    CRITICAL,
    LOW,
    NORMAL,
    HIGH
}

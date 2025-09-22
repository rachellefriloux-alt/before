# UI Components System Documentation

## Overview

Sallie's UI Components system is a comprehensive, adaptive user interface framework that dynamically adjusts to user needs, device contexts, and accessibility requirements. The system enables a responsive, intuitive experience that adapts to the user's current situation without requiring manual configuration.

## Architecture

The UI Components system consists of four major subsystems:

1. **UI Adaptation Engine** - Core logic for adapting UI based on contextual factors and accessibility needs
2. **Context Detection System** - Monitors device sensors and settings to detect current context
3. **Adaptive Components Library** - A collection of UI components that automatically adapt
4. **Accessibility Manager** - Handles accessibility features and settings

### Class Diagram

```
+-------------------+     +----------------------+     +-------------------------+
| UIAdaptationManager|<---| ContextDetectionSystem|    | AccessibilityManager    |
+-------------------+     +----------------------+     +-------------------------+
        ^                          |                              |
        |                          |                              |
        v                          v                              v
+-------------------+     +----------------------+     +-------------------------+
| AdaptiveComponent |     | ContextualFactors    |     | UIState                 |
+-------------------+     +----------------------+     +-------------------------+
        ^
        |
+-------+---------+-----------+-----------+
|               |             |           |
|               |             |           |
v               v             v           v
+----------+ +----------+ +----------+ +----------+
|Adaptive  | |Adaptive  | |Adaptive  | |Adaptive  |
|Button    | |Text      | |Card      | |Layout    |
+----------+ +----------+ +----------+ +----------+
```

## Core Interfaces and Classes

### UIAdaptationManager

The central component responsible for managing UI adaptation throughout the application. It:
- Maintains the current UI state and contextual factors
- Broadcasts changes to registered components
- Handles component registration and lifecycle
- Implements the singleton pattern for global access

```kotlin
class UIAdaptationManager private constructor(context: Context) {
    // Singleton instance
    companion object {
        fun getInstance(context: Context): UIAdaptationManager
        fun resetInstance() // For testing purposes
    }
    
    // UI State management
    fun getCurrentUIState(): UIState
    fun updateUIState(newState: UIState)
    
    // Contextual factors management
    fun getCurrentContextualFactors(): ContextualFactors
    fun updateContextualFactors(newFactors: ContextualFactors)
    
    // Component registration
    fun registerComponent(component: AdaptiveComponent)
    fun unregisterComponent(component: AdaptiveComponent)
}
```

### ContextDetectionSystem

Monitors various device and environmental conditions to inform UI adaptations:
- Uses device sensors (light sensor, accelerometer)
- Monitors battery level and device orientation
- Detects time of day and device type
- Provides contextual information to UIAdaptationManager

```kotlin
class ContextDetectionSystem(context: Context) {
    fun startMonitoring()
    fun stopMonitoring()
    fun refreshContextualFactors()
    fun getCurrentContextualFactors(): ContextualFactors
}
```

### AccessibilityManager

Manages accessibility features and settings:
- Font scaling
- High contrast mode
- Simplified UI mode
- Detects system accessibility settings
- Configures views for accessibility

```kotlin
class AccessibilityManager private constructor(context: Context) {
    // Singleton instance
    companion object {
        fun getInstance(context: Context): AccessibilityManager
    }
    
    // Accessibility settings
    fun setFontScale(scale: Float)
    fun setHighContrastEnabled(enabled: Boolean)
    fun setSimplifiedUIEnabled(enabled: Boolean)
    
    // Toggle helpers
    fun toggleHighContrast()
    fun toggleSimplifiedUI()
    
    // Status getters
    fun getCurrentFontScale(): Float
    fun isHighContrastEnabled(): Boolean
    fun isSimplifiedUIEnabled(): Boolean
    
    // System integration
    fun detectSystemAccessibilitySettings()
    
    // View configuration
    fun configureViewForAccessibility(view: View, contentDescription: String, isClickable: Boolean)
    fun announceForAccessibility(view: View, announcement: String)
    fun setupLiveRegion(view: View)
}
```

### AdaptiveComponent Interface

Base interface implemented by all adaptive UI components:

```kotlin
interface AdaptiveComponent {
    fun adaptToUIState(uiState: UIState)
    fun adaptToContextualFactors(contextualFactors: ContextualFactors)
}
```

## Data Models

### UIState

Enum representing different UI adaptation states:

```kotlin
enum class UIState {
    NORMAL,
    HIGH_CONTRAST,
    LARGER_TEXT,
    SIMPLIFIED
}
```

### ContextualFactors

Data class containing all contextual information that affects UI adaptation:

```kotlin
data class ContextualFactors(
    val ambientLight: AmbientLight = AmbientLight.NORMAL,
    val motionState: MotionState = MotionState.STATIONARY,
    val deviceOrientation: DeviceOrientation = DeviceOrientation.PORTRAIT,
    val timeOfDay: TimeOfDay = TimeOfDay.DAY,
    val batteryLevel: BatteryLevel = BatteryLevel.NORMAL,
    val deviceType: DeviceType = DeviceType.PHONE
)
```

## Adaptive Components Library

The library includes several UI components that implement the AdaptiveComponent interface:

1. **AdaptiveButton** - Button that adapts size, contrast, and touch targets
2. **AdaptiveText** - Text view that adjusts size, contrast, and spacing
3. **AdaptiveCard** - Card that adapts elevation, contrast, and layout
4. **AdaptiveLayout** - Layout that adjusts spacing and complexity
5. **AdaptiveImage** - Image that adjusts brightness and visibility

## Contextual Adaptation

The system adapts UI components based on various contextual factors:

### Ambient Light
- **Dark/Low**: Lower brightness, higher contrast
- **Normal**: Default styling
- **Bright/Direct Sunlight**: Higher contrast, enhanced visibility

### Motion State
- **Stationary**: Default styling
- **Walking**: Increased size, larger touch targets, more line spacing
- **Running**: Maximum size and spacing, simplified UI

### Device Orientation
- **Portrait**: Default styling
- **Landscape**: Adjusted width/height ratios, modified layout

### Battery Level
- **Critical/Low**: Reduced animations, simplified UI
- **Normal/High**: Default styling

### Time of Day
- **Morning/Day/Evening/Night**: Adjusted brightness and contrast

### Device Type
- **Phone/Tablet**: Adjusted layout and component sizing

## Accessibility Adaptation

The system provides several accessibility adaptations:

### Font Scaling
- Automatically detects and applies system font scale
- Allows manual font scale adjustment
- Components adjust their size and spacing accordingly

### High Contrast Mode
- Enhances contrast between text and background
- Provides clear borders and stronger visual cues
- Adapts to system high contrast settings

### Simplified UI
- Reduces non-essential UI elements
- Increases spacing and touch targets
- Provides clearer, more direct user interactions

## Demo Application

The `AdaptiveUIDemoActivity` demonstrates the capabilities of the UI Components system:
- Shows all adaptive components in action
- Allows changing contextual factors to see adaptations
- Provides controls for accessibility settings
- Displays current UI state and factors

## Best Practices for Implementation

1. **Register Components with UIAdaptationManager**
   ```kotlin
   uiAdaptationManager.registerComponent(myComponent)
   ```

2. **Unregister Components in onDetachedFromWindow**
   ```kotlin
   override fun onDetachedFromWindow() {
       super.onDetachedFromWindow()
       uiAdaptationManager.unregisterComponent(this)
   }
   ```

3. **Start/Stop Context Detection with Activity Lifecycle**
   ```kotlin
   override fun onResume() {
       super.onResume()
       contextDetectionSystem.startMonitoring()
   }
   
   override fun onPause() {
       super.onPause()
       contextDetectionSystem.stopMonitoring()
   }
   ```

4. **Configure Views for Accessibility**
   ```kotlin
   accessibilityManager.configureViewForAccessibility(
       myView, 
       "Content description",
       isClickable = true
   )
   ```

5. **Announce Important Changes**
   ```kotlin
   accessibilityManager.announceForAccessibility(
       view,
       "Item added to cart"
   )
   ```

## Testing

The UI Components system includes comprehensive unit tests:
- `UIAdaptationTests` - Tests core adaptation functionality
- `AccessibilityManagerTests` - Tests accessibility features and settings

Run the tests with:
```
./gradlew testDebugUnitTest
```

## Future Enhancements

1. **User Preference Profiles** - Allow users to save and switch between UI adaptation profiles
2. **Animation Adaptation** - Adjust animation speed and complexity based on context
3. **Voice Commands** - Integrate with voice system for accessibility controls
4. **Haptic Feedback** - Adaptive haptic feedback based on context and user preferences
5. **Machine Learning** - Learn from user behavior to better predict preferred adaptations

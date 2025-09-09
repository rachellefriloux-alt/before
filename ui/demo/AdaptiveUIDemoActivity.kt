package com.sallie.ui.demo

import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.CompoundButton
import android.widget.SeekBar
import android.widget.Switch
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.sallie.ui.accessibility.AccessibilityManager
import com.sallie.ui.adaptation.AmbientLight
import com.sallie.ui.adaptation.BatteryLevel
import com.sallie.ui.adaptation.ContextDetectionSystem
import com.sallie.ui.adaptation.ContextualFactors
import com.sallie.ui.adaptation.DeviceOrientation
import com.sallie.ui.adaptation.DeviceType
import com.sallie.ui.adaptation.MotionState
import com.sallie.ui.adaptation.TimeOfDay
import com.sallie.ui.adaptation.UIAdaptationManager
import com.sallie.ui.adaptation.UIState
import com.sallie.ui.components.AdaptiveButton
import com.sallie.ui.components.AdaptiveCard
import com.sallie.ui.components.AdaptiveImage
import com.sallie.ui.components.AdaptiveLayout
import com.sallie.ui.components.AdaptiveText

/**
 * Sallie's Adaptive UI Demo Activity
 * 
 * Demonstrates the capabilities of Sallie's adaptive UI components
 * by allowing users to see how the UI adjusts to different contexts
 * and accessibility settings.
 */
class AdaptiveUIDemoActivity : AppCompatActivity() {

    private lateinit var uiAdaptationManager: UIAdaptationManager
    private lateinit var contextDetectionSystem: ContextDetectionSystem
    private lateinit var accessibilityManager: AccessibilityManager
    
    // UI Components
    private lateinit var adaptiveLayout: AdaptiveLayout
    private lateinit var adaptiveCard: AdaptiveCard
    private lateinit var adaptiveButton: AdaptiveButton
    private lateinit var adaptiveText: AdaptiveText
    private lateinit var adaptiveImage: AdaptiveImage
    
    // Controls
    private lateinit var lightLevelSeekBar: SeekBar
    private lateinit var motionStateSwitch: Switch
    private lateinit var orientationSwitch: Switch
    private lateinit var highContrastSwitch: Switch
    private lateinit var largeTextSwitch: Switch
    private lateinit var simplifiedUISwitch: Switch
    
    // Status texts
    private lateinit var currentUIStateText: TextView
    private lateinit var currentLightLevelText: TextView
    private lateinit var currentMotionStateText: TextView
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_adaptive_ui_demo)
        
        // Initialize managers
        uiAdaptationManager = UIAdaptationManager.getInstance(this)
        contextDetectionSystem = ContextDetectionSystem(this)
        accessibilityManager = AccessibilityManager.getInstance(this)
        
        // Initialize UI components
        initializeComponents()
        
        // Set up controls
        setupControls()
        
        // Start context detection
        contextDetectionSystem.startMonitoring()
        
        // Force an initial update
        updateStatusTexts()
    }
    
    private fun initializeComponents() {
        // Find views
        adaptiveLayout = findViewById(R.id.adaptive_layout)
        adaptiveCard = findViewById(R.id.adaptive_card)
        adaptiveButton = findViewById(R.id.adaptive_button)
        adaptiveText = findViewById(R.id.adaptive_text)
        adaptiveImage = findViewById(R.id.adaptive_image)
        
        // Set up adaptive image
        adaptiveImage.setEssential(true)
        
        // Set up button click
        adaptiveButton.setOnClickListener {
            adaptiveText.text = "Button clicked at ${System.currentTimeMillis()}"
        }
        
        // Configure accessibility properties
        accessibilityManager.configureViewForAccessibility(adaptiveButton, "Adaptive demo button", true)
        accessibilityManager.configureViewForAccessibility(adaptiveText, "Adaptive text that changes", false)
    }
    
    private fun setupControls() {
        // Find control views
        lightLevelSeekBar = findViewById(R.id.light_level_seekbar)
        motionStateSwitch = findViewById(R.id.motion_state_switch)
        orientationSwitch = findViewById(R.id.orientation_switch)
        highContrastSwitch = findViewById(R.id.high_contrast_switch)
        largeTextSwitch = findViewById(R.id.large_text_switch)
        simplifiedUISwitch = findViewById(R.id.simplified_ui_switch)
        
        // Find status text views
        currentUIStateText = findViewById(R.id.current_ui_state_text)
        currentLightLevelText = findViewById(R.id.current_light_level_text)
        currentMotionStateText = findViewById(R.id.current_motion_state_text)
        
        // Set up light level control
        lightLevelSeekBar.max = 4  // 5 levels (0-4)
        lightLevelSeekBar.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seekBar: SeekBar, progress: Int, fromUser: Boolean) {
                if (fromUser) {
                    val ambientLight = when(progress) {
                        0 -> AmbientLight.DARK
                        1 -> AmbientLight.LOW
                        2 -> AmbientLight.NORMAL
                        3 -> AmbientLight.BRIGHT
                        4 -> AmbientLight.DIRECT_SUNLIGHT
                        else -> AmbientLight.NORMAL
                    }
                    
                    val currentFactors = contextDetectionSystem.getCurrentContextualFactors()
                    val newFactors = currentFactors.copy(ambientLight = ambientLight)
                    uiAdaptationManager.updateContextualFactors(newFactors)
                    updateStatusTexts()
                }
            }
            
            override fun onStartTrackingTouch(seekBar: SeekBar) {}
            override fun onStopTrackingTouch(seekBar: SeekBar) {}
        })
        
        // Set up motion state control
        motionStateSwitch.setOnCheckedChangeListener { _, isChecked ->
            val motionState = if (isChecked) MotionState.WALKING else MotionState.STATIONARY
            val currentFactors = contextDetectionSystem.getCurrentContextualFactors()
            val newFactors = currentFactors.copy(motionState = motionState)
            uiAdaptationManager.updateContextualFactors(newFactors)
            updateStatusTexts()
        }
        
        // Set up orientation control
        orientationSwitch.setOnCheckedChangeListener { _, isChecked ->
            val orientation = if (isChecked) DeviceOrientation.LANDSCAPE else DeviceOrientation.PORTRAIT
            val currentFactors = contextDetectionSystem.getCurrentContextualFactors()
            val newFactors = currentFactors.copy(deviceOrientation = orientation)
            uiAdaptationManager.updateContextualFactors(newFactors)
            updateStatusTexts()
        }
        
        // Set up accessibility controls
        highContrastSwitch.isChecked = accessibilityManager.isHighContrastEnabled()
        highContrastSwitch.setOnCheckedChangeListener { _, isChecked ->
            accessibilityManager.setHighContrastEnabled(isChecked)
            updateStatusTexts()
        }
        
        largeTextSwitch.isChecked = accessibilityManager.getCurrentFontScale() > 1.2f
        largeTextSwitch.setOnCheckedChangeListener { _, isChecked ->
            accessibilityManager.setFontScale(if (isChecked) 1.3f else 1.0f)
            updateStatusTexts()
        }
        
        simplifiedUISwitch.isChecked = accessibilityManager.isSimplifiedUIEnabled()
        simplifiedUISwitch.setOnCheckedChangeListener { _, isChecked ->
            accessibilityManager.setSimplifiedUIEnabled(isChecked)
            updateStatusTexts()
        }
        
        // Reset button
        findViewById<Button>(R.id.reset_button).setOnClickListener {
            resetToDefaults()
        }
    }
    
    private fun resetToDefaults() {
        // Reset controls to defaults
        lightLevelSeekBar.progress = 2  // NORMAL
        motionStateSwitch.isChecked = false  // STATIONARY
        orientationSwitch.isChecked = false  // PORTRAIT
        highContrastSwitch.isChecked = false
        largeTextSwitch.isChecked = false
        simplifiedUISwitch.isChecked = false
        
        // Reset accessibility settings
        accessibilityManager.setHighContrastEnabled(false)
        accessibilityManager.setFontScale(1.0f)
        accessibilityManager.setSimplifiedUIEnabled(false)
        
        // Reset contextual factors
        val defaultFactors = ContextualFactors(
            ambientLight = AmbientLight.NORMAL,
            motionState = MotionState.STATIONARY,
            deviceOrientation = DeviceOrientation.PORTRAIT,
            timeOfDay = TimeOfDay.DAY,
            batteryLevel = BatteryLevel.NORMAL,
            deviceType = DeviceType.PHONE
        )
        uiAdaptationManager.updateContextualFactors(defaultFactors)
        
        updateStatusTexts()
    }
    
    private fun updateStatusTexts() {
        // Update UI state text
        val uiState = uiAdaptationManager.getCurrentUIState()
        currentUIStateText.text = "UI State: ${uiState.name}"
        
        // Update context texts
        val contextualFactors = contextDetectionSystem.getCurrentContextualFactors()
        currentLightLevelText.text = "Light Level: ${contextualFactors.ambientLight.name}"
        currentMotionStateText.text = "Motion State: ${contextualFactors.motionState.name}"
    }
    
    override fun onResume() {
        super.onResume()
        contextDetectionSystem.startMonitoring()
        accessibilityManager.detectSystemAccessibilitySettings()
    }
    
    override fun onPause() {
        super.onPause()
        contextDetectionSystem.stopMonitoring()
    }
}

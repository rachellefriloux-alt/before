package com.sallie.ui.demo

import android.os.Bundle
import android.view.View
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.SeekBar
import android.widget.Spinner
import android.widget.Switch
import androidx.appcompat.app.AppCompatActivity
import com.sallie.core.PersonalityBridge
import com.sallie.ui.adaptation.AccessibilityConfig
import com.sallie.ui.adaptation.DynamicUIAdapter
import com.sallie.ui.adaptation.InteractionMode
import com.sallie.ui.adaptation.ThemeConfig
import com.sallie.ui.adaptation.UIAdaptationState
import com.sallie.ui.components.SallieButton
import com.sallie.ui.components.SallieCard
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * Sallie's UI Components Demo Activity
 * 
 * A demonstration of the adaptive UI components and their various states.
 * This activity allows testing different themes, accessibility settings,
 * and interaction modes to see how the components adapt.
 */
class UIComponentsDemoActivity : AppCompatActivity() {
    
    // UI adaptation components
    private lateinit var dynamicUIAdapter: DynamicUIAdapter
    
    // UI Components for demo
    private lateinit var primaryButton: SallieButton
    private lateinit var secondaryButton: SallieButton
    private lateinit var tertiaryButton: SallieButton
    private lateinit var dangerButton: SallieButton
    private lateinit var successButton: SallieButton
    private lateinit var card1: SallieCard
    private lateinit var card2: SallieCard
    
    // Controls
    private lateinit var themeSpinner: Spinner
    private lateinit var modeSpinner: Spinner
    private lateinit var fontScaleSeekBar: SeekBar
    private lateinit var contrastSwitch: Switch
    private lateinit var reduceMotionSwitch: Switch
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_ui_components_demo)
        
        // Initialize UI adapter
        dynamicUIAdapter = DynamicUIAdapter(
            context = this,
            personalityBridge = PersonalityBridge()
        )
        
        // Find UI components
        primaryButton = findViewById(R.id.primary_button)
        secondaryButton = findViewById(R.id.secondary_button)
        tertiaryButton = findViewById(R.id.tertiary_button)
        dangerButton = findViewById(R.id.danger_button)
        successButton = findViewById(R.id.success_button)
        card1 = findViewById(R.id.card1)
        card2 = findViewById(R.id.card2)
        
        // Find controls
        themeSpinner = findViewById(R.id.theme_spinner)
        modeSpinner = findViewById(R.id.mode_spinner)
        fontScaleSeekBar = findViewById(R.id.font_scale_seekbar)
        contrastSwitch = findViewById(R.id.contrast_switch)
        reduceMotionSwitch = findViewById(R.id.reduce_motion_switch)
        
        // Setup UI components
        setupButtons()
        setupCards()
        
        // Setup controls
        setupThemeControl()
        setupModeControl()
        setupAccessibilityControls()
        
        // Initialize UI adapter
        dynamicUIAdapter.initialize()
        
        // Register components with adapter
        registerComponents()
    }
    
    /**
     * Setup button components
     */
    private fun setupButtons() {
        // Primary button
        primaryButton.text = "Primary Button"
        primaryButton.setButtonType(SallieButton.ButtonType.PRIMARY)
        primaryButton.setOnClickListener {
            showToast("Primary button clicked")
        }
        
        // Secondary button
        secondaryButton.text = "Secondary Button"
        secondaryButton.setButtonType(SallieButton.ButtonType.SECONDARY)
        secondaryButton.setOnClickListener {
            showToast("Secondary button clicked")
        }
        
        // Tertiary button
        tertiaryButton.text = "Tertiary Button"
        tertiaryButton.setButtonType(SallieButton.ButtonType.TERTIARY)
        tertiaryButton.setOnClickListener {
            showToast("Tertiary button clicked")
        }
        
        // Danger button
        dangerButton.text = "Danger Button"
        dangerButton.setButtonType(SallieButton.ButtonType.DANGER)
        dangerButton.setOnClickListener {
            showToast("Danger button clicked")
        }
        
        // Success button
        successButton.text = "Success Button"
        successButton.setButtonType(SallieButton.ButtonType.SUCCESS)
        successButton.setOnClickListener {
            showToast("Success button clicked")
        }
    }
    
    /**
     * Setup card components
     */
    private fun setupCards() {
        // Card 1
        card1.setCardTitle("Card with Title")
        
        // Create and add content to card
        val card1Button = SallieButton(this)
        card1Button.text = "Card Button"
        card1Button.setButtonType(SallieButton.ButtonType.SECONDARY)
        card1Button.setOnClickListener {
            showToast("Card button clicked")
        }
        
        card1.addContent(card1Button)
        
        // Card 2 (no title)
        val card2Content = layoutInflater.inflate(R.layout.card_demo_content, null)
        card2.addContent(card2Content)
    }
    
    /**
     * Setup theme control
     */
    private fun setupThemeControl() {
        val themes = arrayOf("Light Theme", "Dark Theme", "High Contrast", "Playful", "Professional")
        val adapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, themes)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        
        themeSpinner.adapter = adapter
        themeSpinner.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                applySelectedTheme(position)
            }
            
            override fun onNothingSelected(parent: AdapterView<*>?) {
                // Do nothing
            }
        }
    }
    
    /**
     * Setup interaction mode control
     */
    private fun setupModeControl() {
        val modes = InteractionMode.values().map { it.name }
        val adapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, modes)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        
        modeSpinner.adapter = adapter
        modeSpinner.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                applySelectedMode(position)
            }
            
            override fun onNothingSelected(parent: AdapterView<*>?) {
                // Do nothing
            }
        }
    }
    
    /**
     * Setup accessibility controls
     */
    private fun setupAccessibilityControls() {
        // Font scale control
        fontScaleSeekBar.max = 100
        fontScaleSeekBar.progress = 50
        fontScaleSeekBar.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
                if (fromUser) {
                    val fontScale = 0.75f + (progress / 100f * 1.25f) // Range: 0.75 to 2.0
                    applyFontScale(fontScale)
                }
            }
            
            override fun onStartTrackingTouch(seekBar: SeekBar?) {}
            
            override fun onStopTrackingTouch(seekBar: SeekBar?) {}
        })
        
        // Contrast switch
        contrastSwitch.setOnCheckedChangeListener { _, isChecked ->
            applyContrast(isChecked)
        }
        
        // Reduce motion switch
        reduceMotionSwitch.setOnCheckedChangeListener { _, isChecked ->
            applyReducedMotion(isChecked)
        }
    }
    
    /**
     * Register components with UI adapter
     */
    private fun registerComponents() {
        CoroutineScope(Dispatchers.Main).launch {
            dynamicUIAdapter.registerComponent(primaryButton)
            dynamicUIAdapter.registerComponent(secondaryButton)
            dynamicUIAdapter.registerComponent(tertiaryButton)
            dynamicUIAdapter.registerComponent(dangerButton)
            dynamicUIAdapter.registerComponent(successButton)
            dynamicUIAdapter.registerComponent(card1)
            dynamicUIAdapter.registerComponent(card2)
        }
    }
    
    /**
     * Apply selected theme
     */
    private fun applySelectedTheme(position: Int) {
        val theme = when (position) {
            1 -> ThemeConfig(
                isDarkMode = true,
                primaryColor = 0xFF2196F3.toInt(),
                accentColor = 0xFF03DAC5.toInt(),
                backgroundColor = 0xFF121212.toInt(),
                textColor = 0xFFFFFFFF.toInt()
            )
            2 -> ThemeConfig(
                isDarkMode = true,
                primaryColor = 0xFFFFFFFF.toInt(),
                accentColor = 0xFFFFEB3B.toInt(),
                backgroundColor = 0xFF000000.toInt(),
                textColor = 0xFFFFFFFF.toInt()
            )
            3 -> ThemeConfig(
                isDarkMode = false,
                primaryColor = 0xFFFF9800.toInt(),
                accentColor = 0xFFFFEB3B.toInt(),
                backgroundColor = 0xFFFFF9C4.toInt(),
                textColor = 0xFF333333.toInt(),
                cornerRadius = 16,
                animationSpeed = 1.2f
            )
            4 -> ThemeConfig(
                isDarkMode = false,
                primaryColor = 0xFF3F51B5.toInt(),
                accentColor = 0xFF536DFE.toInt(),
                backgroundColor = 0xFFF5F5F5.toInt(),
                textColor = 0xFF212121.toInt(),
                cornerRadius = 4,
                animationSpeed = 0.9f
            )
            else -> ThemeConfig.Default
        }
        
        dynamicUIAdapter.updateTheme(theme)
    }
    
    /**
     * Apply selected interaction mode
     */
    private fun applySelectedMode(position: Int) {
        val mode = InteractionMode.values()[position]
        
        // Update adaptation state with new user context
        val currentState = dynamicUIAdapter.adaptationState.value
        val newState = currentState.copy(
            userContext = currentState.userContext.copy(
                preferredInteractionMode = mode,
                isFirstTimeUser = mode == InteractionMode.SIMPLIFIED,
                isPowerUser = mode == InteractionMode.EXPERT
            )
        )
        
        dynamicUIAdapter.updateAdaptationState(newState)
    }
    
    /**
     * Apply font scale
     */
    private fun applyFontScale(scale: Float) {
        val currentState = dynamicUIAdapter.adaptationState.value
        val newAccessibilityConfig = currentState.accessibilityConfig.copy(
            fontScale = scale
        )
        
        dynamicUIAdapter.updateAccessibilityConfig(newAccessibilityConfig)
    }
    
    /**
     * Apply contrast setting
     */
    private fun applyContrast(enhanced: Boolean) {
        val currentState = dynamicUIAdapter.adaptationState.value
        val newAccessibilityConfig = currentState.accessibilityConfig.copy(
            contrastEnhanced = enhanced
        )
        
        dynamicUIAdapter.updateAccessibilityConfig(newAccessibilityConfig)
    }
    
    /**
     * Apply reduced motion setting
     */
    private fun applyReducedMotion(reduced: Boolean) {
        val currentState = dynamicUIAdapter.adaptationState.value
        val newAccessibilityConfig = currentState.accessibilityConfig.copy(
            reduceMotion = reduced
        )
        
        dynamicUIAdapter.updateAccessibilityConfig(newAccessibilityConfig)
    }
    
    /**
     * Show a toast message
     */
    private fun showToast(message: String) {
        android.widget.Toast.makeText(this, message, android.widget.Toast.LENGTH_SHORT).show()
    }
    
    override fun onDestroy() {
        super.onDestroy()
        dynamicUIAdapter.release()
    }
}

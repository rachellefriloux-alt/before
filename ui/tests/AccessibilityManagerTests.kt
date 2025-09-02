package com.sallie.ui.accessibility

import android.content.Context
import android.content.SharedPreferences
import android.view.View
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.sallie.ui.adaptation.UIAdaptationManager
import com.sallie.ui.adaptation.UIState
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.Mockito.mock
import org.mockito.Mockito.verify
import org.robolectric.annotation.Config

/**
 * Unit tests for the Accessibility Manager
 */
@RunWith(AndroidJUnit4::class)
@Config(manifest = Config.NONE)
class AccessibilityManagerTests {

    private lateinit var context: Context
    private lateinit var accessibilityManager: AccessibilityManager
    private lateinit var prefs: SharedPreferences
    
    @Before
    fun setUp() {
        context = ApplicationProvider.getApplicationContext()
        accessibilityManager = AccessibilityManager.getInstance(context)
        
        // Get preferences for verification
        prefs = context.getSharedPreferences("sallie_accessibility_prefs", Context.MODE_PRIVATE)
        
        // Clear preferences before each test
        prefs.edit().clear().commit()
    }
    
    @After
    fun tearDown() {
        // Clear preferences after tests
        prefs.edit().clear().commit()
    }
    
    @Test
    fun testFontScaleSettings() {
        // Default font scale should be 1.0
        assert(accessibilityManager.getCurrentFontScale() == 1.0f)
        
        // Set font scale to 1.5
        accessibilityManager.setFontScale(1.5f)
        
        // Verify the font scale was updated
        assert(accessibilityManager.getCurrentFontScale() == 1.5f)
        
        // Verify it was saved to preferences
        assert(prefs.getFloat("font_scale", 0f) == 1.5f)
    }
    
    @Test
    fun testHighContrastSettings() {
        // High contrast should be disabled by default
        assert(!accessibilityManager.isHighContrastEnabled())
        
        // Enable high contrast
        accessibilityManager.setHighContrastEnabled(true)
        
        // Verify high contrast was enabled
        assert(accessibilityManager.isHighContrastEnabled())
        
        // Verify it was saved to preferences
        assert(prefs.getBoolean("high_contrast", false))
        
        // Test toggle functionality
        accessibilityManager.toggleHighContrast()
        
        // Verify high contrast was toggled off
        assert(!accessibilityManager.isHighContrastEnabled())
    }
    
    @Test
    fun testSimplifiedUISettings() {
        // Simplified UI should be disabled by default
        assert(!accessibilityManager.isSimplifiedUIEnabled())
        
        // Enable simplified UI
        accessibilityManager.setSimplifiedUIEnabled(true)
        
        // Verify simplified UI was enabled
        assert(accessibilityManager.isSimplifiedUIEnabled())
        
        // Verify it was saved to preferences
        assert(prefs.getBoolean("simplified_ui", false))
        
        // Test toggle functionality
        accessibilityManager.toggleSimplifiedUI()
        
        // Verify simplified UI was toggled off
        assert(!accessibilityManager.isSimplifiedUIEnabled())
    }
    
    @Test
    fun testUIStateUpdatesBasedOnAccessibility() {
        // Get the UIAdaptationManager to verify it receives updates
        val uiAdaptationManager = UIAdaptationManager.getInstance(context)
        
        // Default state should be NORMAL
        assert(uiAdaptationManager.getCurrentUIState() == UIState.NORMAL)
        
        // Enable high contrast
        accessibilityManager.setHighContrastEnabled(true)
        
        // UI state should be HIGH_CONTRAST
        assert(uiAdaptationManager.getCurrentUIState() == UIState.HIGH_CONTRAST)
        
        // Disable high contrast and enable large text
        accessibilityManager.setHighContrastEnabled(false)
        accessibilityManager.setFontScale(1.3f)
        
        // UI state should be LARGER_TEXT
        assert(uiAdaptationManager.getCurrentUIState() == UIState.LARGER_TEXT)
        
        // Enable simplified UI (this should take precedence)
        accessibilityManager.setSimplifiedUIEnabled(true)
        
        // UI state should be SIMPLIFIED
        assert(uiAdaptationManager.getCurrentUIState() == UIState.SIMPLIFIED)
    }
    
    @Test
    fun testConfigureViewForAccessibility() {
        // Create a mock view
        val mockView = mock(View::class.java)
        
        // Configure the view
        accessibilityManager.configureViewForAccessibility(
            mockView, 
            "Test content description", 
            true
        )
        
        // Verify content description was set
        verify(mockView).contentDescription = "Test content description"
        
        // Verify focusable and clickable were set
        verify(mockView).isFocusable = true
        verify(mockView).isClickable = true
    }
    
    @Test
    fun testSingletonImplementation() {
        // Get a second instance and verify it's the same instance
        val instance2 = AccessibilityManager.getInstance(context)
        assert(accessibilityManager === instance2)
    }
}

package com.sallie.ui.test

import android.content.Context
import android.content.res.Configuration
import android.view.View
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.sallie.core.PersonalityBridge
import com.sallie.ui.adaptation.AccessibilityConfig
import com.sallie.ui.adaptation.DynamicUIAdapter
import com.sallie.ui.adaptation.InteractionMode
import com.sallie.ui.adaptation.ThemeConfig
import com.sallie.ui.adaptation.UIAdaptationState
import com.sallie.ui.components.SallieButton
import com.sallie.ui.components.SallieCard
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.TestCoroutineDispatcher
import kotlinx.coroutines.test.runBlockingTest
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.MockitoAnnotations

/**
 * Unit tests for Sallie's UI Components System
 */
@RunWith(AndroidJUnit4::class)
@ExperimentalCoroutinesApi
class UIComponentsSystemTest {

    private lateinit var context: Context
    private lateinit var dynamicUIAdapter: DynamicUIAdapter
    private lateinit var testDispatcher: TestCoroutineDispatcher
    
    @Mock
    private lateinit var personalityBridge: PersonalityBridge
    
    @Before
    fun setUp() {
        MockitoAnnotations.initMocks(this)
        context = ApplicationProvider.getApplicationContext()
        testDispatcher = TestCoroutineDispatcher()
        
        // Set up mock personality traits
        `when`(personalityBridge.getCurrentTraits()).thenReturn(
            mapOf(
                "warmth" to 0.7f,
                "organization" to 0.5f,
                "creativity" to 0.8f
            )
        )
        
        dynamicUIAdapter = DynamicUIAdapter(
            context = context,
            personalityBridge = personalityBridge
        )
        
        dynamicUIAdapter.initialize()
    }
    
    @After
    fun tearDown() {
        dynamicUIAdapter.release()
        testDispatcher.cleanupTestCoroutines()
    }
    
    @Test
    fun testDynamicUIAdapterInitialization() = runBlockingTest {
        // Verify initial state
        val initialState = dynamicUIAdapter.adaptationState.first()
        assertNotNull(initialState)
        assertEquals(UIAdaptationState.Default, initialState)
        
        // Verify theme defaults
        val initialTheme = dynamicUIAdapter.currentTheme.first()
        assertEquals(ThemeConfig.Default, initialTheme)
        
        // Verify accessibility defaults
        val initialAccessibility = dynamicUIAdapter.accessibilityConfig.first()
        assertEquals(AccessibilityConfig.Default, initialAccessibility)
    }
    
    @Test
    fun testThemeUpdate() = runBlockingTest {
        // Create custom theme
        val customTheme = ThemeConfig(
            isDarkMode = true,
            primaryColor = 0xFF1E88E5.toInt(),
            accentColor = 0xFF00C853.toInt(),
            backgroundColor = 0xFF121212.toInt(),
            textColor = 0xFFFFFFFF.toInt()
        )
        
        // Update theme
        dynamicUIAdapter.updateTheme(customTheme)
        
        // Verify theme was updated
        val updatedTheme = dynamicUIAdapter.currentTheme.first()
        assertEquals(customTheme, updatedTheme)
        
        // Verify adaptation state was updated with new theme
        val updatedState = dynamicUIAdapter.adaptationState.first()
        assertEquals(customTheme, updatedState.themeConfig)
    }
    
    @Test
    fun testAccessibilityConfigUpdate() = runBlockingTest {
        // Create custom accessibility config
        val customConfig = AccessibilityConfig(
            fontScale = 1.5f,
            contrastEnhanced = true,
            reduceMotion = true,
            touchTargetSize = 56,
            screenReaderCompatible = true,
            useSimpleAnimations = true
        )
        
        // Update accessibility config
        dynamicUIAdapter.updateAccessibilityConfig(customConfig)
        
        // Verify config was updated
        val updatedConfig = dynamicUIAdapter.accessibilityConfig.first()
        assertEquals(customConfig, updatedConfig)
        
        // Verify adaptation state was updated with new config
        val updatedState = dynamicUIAdapter.adaptationState.first()
        assertEquals(customConfig, updatedState.accessibilityConfig)
    }
    
    @Test
    fun testEmotionAdaptation() = runBlockingTest {
        // Initial theme
        val initialTheme = dynamicUIAdapter.currentTheme.first()
        
        // Adapt to happy emotion
        dynamicUIAdapter.adaptToEmotion("happy")
        
        // Verify theme was updated for happy emotion
        val happyTheme = dynamicUIAdapter.currentTheme.first()
        assertEquals(ThemeConfig.HAPPY_ACCENT, happyTheme.accentColor)
        assertTrue(happyTheme.animationSpeed > initialTheme.animationSpeed)
        
        // Adapt to sad emotion
        dynamicUIAdapter.adaptToEmotion("sad")
        
        // Verify theme was updated for sad emotion
        val sadTheme = dynamicUIAdapter.currentTheme.first()
        assertEquals(ThemeConfig.CALM_ACCENT, sadTheme.accentColor)
        assertTrue(sadTheme.animationSpeed < initialTheme.animationSpeed)
    }
    
    @Test
    fun testPersonalityAdaptation() = runBlockingTest {
        // Adapt to personality
        dynamicUIAdapter.adaptToPersonality()
        
        // Verify theme was updated based on personality traits
        val personalityTheme = dynamicUIAdapter.currentTheme.first()
        
        // Verify warmth trait mapped to color temperature (0.7f)
        assertEquals(0.7f, personalityTheme.colorTemperature)
        
        // Verify organization trait mapped to density (0.5f)
        assertEquals(0.5f, personalityTheme.density)
        
        // Verify creativity trait mapped to visual complexity (0.8f)
        assertEquals(0.8f, personalityTheme.visualComplexity)
    }
    
    @Test
    fun testTimeOfDayAdaptation() = runBlockingTest {
        // Set up a mock time
        // Note: In a real test, you would inject a clock or time provider
        
        // Test morning adaptation (simplified test)
        dynamicUIAdapter.adaptToTimeOfDay()
        
        // Verify theme was updated based on time
        // This test is limited since we can't control time directly in this test
        val timeTheme = dynamicUIAdapter.currentTheme.first()
        assertTrue(timeTheme.brightness >= 0.7f)
    }
    
    @Test
    fun testComponentRegistration() {
        // Create test component
        val button = SallieButton(context)
        
        // Register component
        dynamicUIAdapter.registerComponent(button)
        
        // Update theme
        val customTheme = ThemeConfig(
            isDarkMode = true,
            primaryColor = 0xFFE91E63.toInt()
        )
        dynamicUIAdapter.updateTheme(customTheme)
        
        // Component should have received the theme update
        assertEquals(customTheme, button.currentState.themeConfig)
        
        // Unregister component
        dynamicUIAdapter.unregisterComponent(button)
        
        // Update theme again
        val newTheme = ThemeConfig(
            isDarkMode = false,
            primaryColor = 0xFF9C27B0.toInt()
        )
        dynamicUIAdapter.updateTheme(newTheme)
        
        // Component should not receive updates after unregistering
        assertFalse(newTheme == button.currentState.themeConfig)
    }
    
    @Test
    fun testSallieButtonAdaptation() {
        // Create button
        val button = SallieButton(context)
        button.text = "Test Button"
        button.setButtonType(SallieButton.ButtonType.PRIMARY)
        
        // Create test state
        val testState = UIAdaptationState(
            themeConfig = ThemeConfig(
                isDarkMode = true,
                primaryColor = 0xFFE91E63.toInt(),
                textColor = 0xFFFFFFFF.toInt()
            ),
            accessibilityConfig = AccessibilityConfig(
                fontScale = 1.5f,
                contrastEnhanced = true
            )
        )
        
        // Apply adaptation
        button.applyAdaptation(testState)
        
        // Verify button adapted to dark mode theme
        assertEquals(testState, button.currentState)
        
        // Test disabled state
        button.isEnabled = false
        assertTrue(button.alpha < 1.0f)
        
        // Re-enable
        button.isEnabled = true
        
        // Test button type change
        button.setButtonType(SallieButton.ButtonType.DANGER)
        assertEquals(SallieButton.ButtonType.DANGER, button.buttonType)
        
        // Test button size change
        button.setButtonSize(SallieButton.ButtonSize.LARGE)
        assertEquals(SallieButton.ButtonSize.LARGE, button.buttonSize)
    }
    
    @Test
    fun testSallieCardAdaptation() {
        // Create card
        val card = SallieCard(context)
        card.setCardTitle("Test Card")
        
        // Create test content
        val content = View(context)
        card.addContent(content)
        
        // Create test state with tablet mode
        val tabletState = UIAdaptationState(
            themeConfig = ThemeConfig(
                isDarkMode = false,
                primaryColor = 0xFF2196F3.toInt(),
                backgroundColor = 0xFFF5F5F5.toInt()
            ),
            deviceContext = DeviceContext(
                screenWidthDp = 800,
                screenHeightDp = 1200,
                isTablet = true,
                isLandscape = false,
                densityDpi = 240
            )
        )
        
        // Apply tablet adaptation
        card.applyAdaptation(tabletState)
        
        // Verify card adapted to tablet mode
        assertEquals(tabletState, card.currentState)
        
        // Create test state with phone mode
        val phoneState = UIAdaptationState(
            themeConfig = ThemeConfig(
                isDarkMode = true,
                primaryColor = 0xFF2196F3.toInt(),
                backgroundColor = 0xFF121212.toInt()
            ),
            deviceContext = DeviceContext(
                screenWidthDp = 360,
                screenHeightDp = 640,
                isTablet = false,
                isLandscape = false,
                densityDpi = 240
            )
        )
        
        // Apply phone adaptation
        card.applyAdaptation(phoneState)
        
        // Verify card adapted to phone mode
        assertEquals(phoneState, card.currentState)
        
        // Test content management
        assertEquals(1, card.cardContent.childCount)
        
        // Clear content
        card.clearContent()
        assertEquals(0, card.cardContent.childCount)
    }
    
    @Test
    fun testInteractionModeAdaptation() = runBlockingTest {
        // Get current state
        val currentState = dynamicUIAdapter.adaptationState.first()
        
        // Update state with child-friendly mode
        val childMode = currentState.copy(
            userContext = currentState.userContext.copy(
                preferredInteractionMode = InteractionMode.CHILD_FRIENDLY
            )
        )
        dynamicUIAdapter.updateAdaptationState(childMode)
        
        // Verify state was updated
        val updatedState = dynamicUIAdapter.adaptationState.first()
        assertEquals(InteractionMode.CHILD_FRIENDLY, updatedState.userContext.preferredInteractionMode)
        
        // Create and register a button
        val button = SallieButton(context)
        dynamicUIAdapter.registerComponent(button)
        
        // Verify button adapted to child mode
        assertEquals(InteractionMode.CHILD_FRIENDLY, button.currentState.userContext.preferredInteractionMode)
        assertEquals(SallieButton.ButtonSize.LARGE, button.buttonSize)
        
        // Update to elderly optimized mode
        val elderlyMode = currentState.copy(
            userContext = currentState.userContext.copy(
                preferredInteractionMode = InteractionMode.ELDERLY_OPTIMIZED
            )
        )
        dynamicUIAdapter.updateAdaptationState(elderlyMode)
        
        // Verify button adapted to elderly mode
        assertEquals(InteractionMode.ELDERLY_OPTIMIZED, button.currentState.userContext.preferredInteractionMode)
        assertEquals(SallieButton.ButtonSize.LARGE, button.buttonSize)
    }
}

/**
 * Test class for device context
 */
data class DeviceContext(
    val screenWidthDp: Int,
    val screenHeightDp: Int,
    val isTablet: Boolean,
    val isLandscape: Boolean,
    val densityDpi: Int
)

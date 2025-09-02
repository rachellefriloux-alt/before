package com.sallie.ui.adaptation

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.sallie.ui.components.AdaptiveButton
import com.sallie.ui.components.AdaptiveComponent
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.Mockito.mock
import org.mockito.Mockito.verify
import org.robolectric.annotation.Config

/**
 * Unit tests for the UI Adaptation System
 */
@RunWith(AndroidJUnit4::class)
@Config(manifest = Config.NONE)
class UIAdaptationTests {

    private lateinit var context: Context
    private lateinit var uiAdaptationManager: UIAdaptationManager
    private lateinit var contextDetectionSystem: ContextDetectionSystem
    
    @Before
    fun setUp() {
        context = ApplicationProvider.getApplicationContext()
        uiAdaptationManager = UIAdaptationManager.getInstance(context)
        contextDetectionSystem = ContextDetectionSystem(context)
    }
    
    @After
    fun tearDown() {
        UIAdaptationManager.resetInstance()
    }
    
    @Test
    fun testUIStateUpdates() {
        // Start with normal UI state
        assert(uiAdaptationManager.getCurrentUIState() == UIState.NORMAL)
        
        // Update to high contrast
        uiAdaptationManager.updateUIState(UIState.HIGH_CONTRAST)
        assert(uiAdaptationManager.getCurrentUIState() == UIState.HIGH_CONTRAST)
        
        // Update to larger text
        uiAdaptationManager.updateUIState(UIState.LARGER_TEXT)
        assert(uiAdaptationManager.getCurrentUIState() == UIState.LARGER_TEXT)
    }
    
    @Test
    fun testContextualFactorUpdates() {
        // Create default contextual factors
        val defaultFactors = ContextualFactors()
        
        // Create modified contextual factors
        val modifiedFactors = ContextualFactors(
            ambientLight = AmbientLight.BRIGHT,
            motionState = MotionState.WALKING,
            deviceOrientation = DeviceOrientation.LANDSCAPE,
            timeOfDay = TimeOfDay.NIGHT,
            batteryLevel = BatteryLevel.LOW,
            deviceType = DeviceType.TABLET
        )
        
        // Update factors and check they've been updated
        uiAdaptationManager.updateContextualFactors(modifiedFactors)
        val currentFactors = uiAdaptationManager.getCurrentContextualFactors()
        
        assert(currentFactors.ambientLight == AmbientLight.BRIGHT)
        assert(currentFactors.motionState == MotionState.WALKING)
        assert(currentFactors.deviceOrientation == DeviceOrientation.LANDSCAPE)
        assert(currentFactors.timeOfDay == TimeOfDay.NIGHT)
        assert(currentFactors.batteryLevel == BatteryLevel.LOW)
        assert(currentFactors.deviceType == DeviceType.TABLET)
    }
    
    @Test
    fun testComponentRegistration() {
        // Mock an adaptive component
        val mockComponent = mock(AdaptiveComponent::class.java)
        
        // Register component
        uiAdaptationManager.registerComponent(mockComponent)
        
        // Update UI state and verify the component was updated
        uiAdaptationManager.updateUIState(UIState.HIGH_CONTRAST)
        verify(mockComponent).adaptToUIState(UIState.HIGH_CONTRAST)
        
        // Update contextual factors and verify the component was updated
        val factors = ContextualFactors(ambientLight = AmbientLight.LOW)
        uiAdaptationManager.updateContextualFactors(factors)
        verify(mockComponent).adaptToContextualFactors(factors)
        
        // Unregister component
        uiAdaptationManager.unregisterComponent(mockComponent)
    }
    
    @Test
    fun testSingletonImplementation() {
        // Get a second instance and verify it's the same instance
        val instance2 = UIAdaptationManager.getInstance(context)
        assert(uiAdaptationManager === instance2)
    }
}

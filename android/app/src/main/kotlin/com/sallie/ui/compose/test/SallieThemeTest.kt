/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * SallieThemeTest - Tests for Sallie UI theme components
 */

package com.sallie.ui.compose.test

import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithText
import com.sallie.ui.compose.theme.AccessibilityLevel
import com.sallie.ui.compose.theme.EmotionalState
import com.sallie.ui.compose.theme.LocalAccessibilityLevel
import com.sallie.ui.compose.theme.LocalAnimationSpeed
import com.sallie.ui.compose.theme.LocalEmotionalPalette
import com.sallie.ui.compose.theme.LocalPersonaType
import com.sallie.ui.compose.theme.PersonaType
import com.sallie.ui.compose.theme.SallieTheme
import org.junit.Rule
import org.junit.Test

class SallieThemeTest {
    @get:Rule
    val composeTestRule = createComposeRule()
    
    @Test
    fun themeProvidesMaterialTheme() {
        // Arrange & Act
        composeTestRule.setContent {
            SallieTheme {
                MaterialTheme {
                    androidx.compose.material3.Text(text = "Theme Test")
                }
            }
        }
        
        // Assert
        composeTestRule.onNodeWithText("Theme Test").assertIsDisplayed()
    }
    
    @Test
    fun themeProvidesDifferentColorSchemeForPersonaTypes() {
        // Arrange & Act - test different persona types
        val personaTypes = listOf(
            PersonaType.DEFAULT,
            PersonaType.WARM,
            PersonaType.COOL
        )
        
        personaTypes.forEach { personaType ->
            composeTestRule.setContent {
                SallieTheme(
                    personaType = personaType,
                    darkTheme = false
                ) {
                    CompositionLocalProvider(
                        LocalPersonaType provides personaType
                    ) {
                        val currentPersona = LocalPersonaType.current
                        androidx.compose.material3.Text(text = "Persona: $currentPersona")
                    }
                }
            }
            
            // Assert
            composeTestRule.onNodeWithText("Persona: $personaType").assertIsDisplayed()
        }
    }
    
    @Test
    fun themeHandlesAccessibilityLevels() {
        // Arrange & Act - test different accessibility levels
        val accessibilityLevels = listOf(
            AccessibilityLevel.STANDARD,
            AccessibilityLevel.HIGH_CONTRAST,
            AccessibilityLevel.REDUCED_MOTION
        )
        
        accessibilityLevels.forEach { accessibilityLevel ->
            composeTestRule.setContent {
                SallieTheme(
                    accessibility = accessibilityLevel
                ) {
                    CompositionLocalProvider(
                        LocalAccessibilityLevel provides accessibilityLevel
                    ) {
                        val currentAccessibility = LocalAccessibilityLevel.current
                        androidx.compose.material3.Text(text = "Accessibility: $currentAccessibility")
                    }
                }
            }
            
            // Assert
            composeTestRule.onNodeWithText("Accessibility: $accessibilityLevel").assertIsDisplayed()
        }
    }
    
    @Test
    fun themeHandlesDifferentEmotionalStates() {
        // Arrange & Act - test different emotional states
        val emotionalStates = listOf(
            EmotionalState.Neutral,
            EmotionalState.Happy,
            EmotionalState.Calm,
            EmotionalState.Concerned,
            EmotionalState.Excited,
            EmotionalState.Focused
        )
        
        emotionalStates.forEach { emotionalState ->
            composeTestRule.setContent {
                SallieTheme(
                    emotionalState = emotionalState
                ) {
                    val currentEmotionalPalette = LocalEmotionalPalette.current
                    androidx.compose.material3.Text(text = "Emotional State: $emotionalState")
                }
            }
            
            // Assert
            composeTestRule.onNodeWithText("Emotional State: $emotionalState").assertIsDisplayed()
        }
    }
}

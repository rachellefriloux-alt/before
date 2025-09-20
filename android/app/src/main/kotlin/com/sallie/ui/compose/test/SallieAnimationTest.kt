/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * SallieAnimationTest - Tests for Sallie UI animation components
 */

package com.sallie.ui.compose.test

import androidx.compose.foundation.layout.Box
import androidx.compose.material3.Text
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.assertIsNotDisplayed
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import com.sallie.ui.compose.animation.SallieAnimatedVisibility
import com.sallie.ui.compose.components.SalliePrimaryButton
import com.sallie.ui.compose.theme.AnimationSpeed
import com.sallie.ui.compose.theme.EmotionalState
import com.sallie.ui.compose.theme.LocalAnimationSpeed
import com.sallie.ui.compose.theme.SallieTheme
import org.junit.Rule
import org.junit.Test

class SallieAnimationTest {
    @get:Rule
    val composeTestRule = createComposeRule()
    
    @Test
    fun animatedVisibilityShowsAndHidesContent() {
        // Arrange
        composeTestRule.setContent {
            SallieTheme {
                var visible by remember { mutableStateOf(false) }
                
                SalliePrimaryButton(
                    onClick = { visible = !visible },
                    text = "Toggle"
                )
                
                SallieAnimatedVisibility(visible = visible) {
                    Text(text = "Animated Content")
                }
            }
        }
        
        // Initially not visible
        composeTestRule.onNodeWithText("Animated Content").assertDoesNotExist()
        
        // Click to show
        composeTestRule.onNodeWithText("Toggle").performClick()
        composeTestRule.waitForIdle()
        
        // Now visible
        composeTestRule.onNodeWithText("Animated Content").assertIsDisplayed()
        
        // Click to hide
        composeTestRule.onNodeWithText("Toggle").performClick()
        composeTestRule.waitForIdle()
        
        // No longer visible
        composeTestRule.onNodeWithText("Animated Content").assertDoesNotExist()
    }
    
    @Test
    fun animatedVisibilityWorksWithDifferentEmotionalStates() {
        // Test different emotional states
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
                SallieTheme(emotionalState = emotionalState) {
                    var visible by remember { mutableStateOf(false) }
                    
                    SalliePrimaryButton(
                        onClick = { visible = !visible },
                        text = "Toggle $emotionalState"
                    )
                    
                    SallieAnimatedVisibility(
                        visible = visible,
                        emotionalState = emotionalState
                    ) {
                        Text(text = "$emotionalState Content")
                    }
                }
            }
            
            // Initially not visible
            composeTestRule.onNodeWithText("$emotionalState Content").assertDoesNotExist()
            
            // Click to show
            composeTestRule.onNodeWithText("Toggle $emotionalState").performClick()
            composeTestRule.waitForIdle()
            
            // Now visible
            composeTestRule.onNodeWithText("$emotionalState Content").assertIsDisplayed()
        }
    }
    
    @Test
    fun animationSpeedAffectsAnimation() {
        // Test with animation disabled
        composeTestRule.setContent {
            SallieTheme {
                CompositionLocalProvider(LocalAnimationSpeed provides AnimationSpeed.NONE) {
                    var visible by remember { mutableStateOf(false) }
                    
                    SalliePrimaryButton(
                        onClick = { visible = !visible },
                        text = "Toggle"
                    )
                    
                    SallieAnimatedVisibility(visible = visible) {
                        Text(text = "Instant Content")
                    }
                }
            }
        }
        
        // Initially not visible
        composeTestRule.onNodeWithText("Instant Content").assertDoesNotExist()
        
        // Click to show - with NONE speed, should appear immediately
        composeTestRule.onNodeWithText("Toggle").performClick()
        
        // Immediately visible without animation delay
        composeTestRule.onNodeWithText("Instant Content").assertIsDisplayed()
    }
}

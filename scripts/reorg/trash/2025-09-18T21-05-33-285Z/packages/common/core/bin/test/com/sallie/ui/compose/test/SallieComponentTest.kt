/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * SallieComponentTest - Tests for Sallie UI components
 */

package com.sallie.ui.compose.test

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.assertIsEnabled
import androidx.compose.ui.test.assertIsNotEnabled
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performTextInput
import androidx.compose.ui.unit.dp
import com.sallie.ui.compose.components.SallieButton
import com.sallie.ui.compose.components.SallieCard
import com.sallie.ui.compose.components.SallieElevatedButton
import com.sallie.ui.compose.components.SallieElevatedCard
import com.sallie.ui.compose.components.SallieOutlinedButton
import com.sallie.ui.compose.components.SallieOutlinedCard
import com.sallie.ui.compose.components.SallieOutlinedTextField
import com.sallie.ui.compose.components.SalliePrimaryButton
import com.sallie.ui.compose.components.SallieSearchTextField
import com.sallie.ui.compose.components.SallieSecondaryButton
import com.sallie.ui.compose.components.SallieTertiaryButton
import com.sallie.ui.compose.components.SallieTextField
import com.sallie.ui.compose.theme.EmotionalState
import com.sallie.ui.compose.theme.SallieTheme
import org.junit.Rule
import org.junit.Test

class SallieComponentTest {
    @get:Rule
    val composeTestRule = createComposeRule()
    
    @Test
    fun primaryButtonIsRenderedAndClickable() {
        // Arrange
        var clickCount = 0
        
        // Act
        composeTestRule.setContent {
            SallieTheme {
                SalliePrimaryButton(
                    onClick = { clickCount++ },
                    text = "Primary Button"
                )
            }
        }
        
        // Assert
        composeTestRule.onNodeWithText("Primary Button").assertIsDisplayed()
        composeTestRule.onNodeWithText("Primary Button").performClick()
        assert(clickCount == 1)
    }
    
    @Test
    fun buttonVariantsAreRendered() {
        // Arrange & Act
        composeTestRule.setContent {
            SallieTheme {
                Column(modifier = Modifier.padding(16.dp)) {
                    SalliePrimaryButton(
                        onClick = {},
                        text = "Primary"
                    )
                    SallieSecondaryButton(
                        onClick = {},
                        text = "Secondary"
                    )
                    SallieTertiaryButton(
                        onClick = {},
                        text = "Tertiary"
                    )
                    SallieOutlinedButton(
                        onClick = {},
                        text = "Outlined"
                    )
                    SallieElevatedButton(
                        onClick = {},
                        text = "Elevated"
                    )
                }
            }
        }
        
        // Assert
        composeTestRule.onNodeWithText("Primary").assertIsDisplayed()
        composeTestRule.onNodeWithText("Secondary").assertIsDisplayed()
        composeTestRule.onNodeWithText("Tertiary").assertIsDisplayed()
        composeTestRule.onNodeWithText("Outlined").assertIsDisplayed()
        composeTestRule.onNodeWithText("Elevated").assertIsDisplayed()
    }
    
    @Test
    fun disabledButtonsAreNotClickable() {
        // Arrange
        var clickCount = 0
        
        // Act
        composeTestRule.setContent {
            SallieTheme {
                SalliePrimaryButton(
                    onClick = { clickCount++ },
                    text = "Disabled Button",
                    enabled = false
                )
            }
        }
        
        // Assert
        composeTestRule.onNodeWithText("Disabled Button").assertIsDisplayed()
        composeTestRule.onNodeWithText("Disabled Button").assertIsNotEnabled()
    }
    
    @Test
    fun textFieldsAcceptInput() {
        // Act
        composeTestRule.setContent {
            SallieTheme {
                Column {
                    var text by remember { mutableStateOf("") }
                    SallieTextField(
                        value = text,
                        onValueChange = { text = it },
                        label = "Text Field",
                        placeholder = "Enter text"
                    )
                }
            }
        }
        
        // Assert
        composeTestRule.onNodeWithText("Text Field").assertIsDisplayed()
        composeTestRule.onNodeWithText("Text Field").performTextInput("Hello Sallie")
        composeTestRule.onNodeWithText("Hello Sallie").assertIsDisplayed()
    }
    
    @Test
    fun cardsRenderContent() {
        // Act
        composeTestRule.setContent {
            SallieTheme {
                Column(modifier = Modifier.padding(16.dp)) {
                    SallieCard {
                        androidx.compose.material3.Text("Standard Card Content")
                    }
                    
                    SallieElevatedCard {
                        androidx.compose.material3.Text("Elevated Card Content")
                    }
                    
                    SallieOutlinedCard {
                        androidx.compose.material3.Text("Outlined Card Content")
                    }
                }
            }
        }
        
        // Assert
        composeTestRule.onNodeWithText("Standard Card Content").assertIsDisplayed()
        composeTestRule.onNodeWithText("Elevated Card Content").assertIsDisplayed()
        composeTestRule.onNodeWithText("Outlined Card Content").assertIsDisplayed()
    }
    
    @Test
    fun componentsWorkWithDifferentEmotionalStates() {
        // Act
        composeTestRule.setContent {
            SallieTheme(emotionalState = EmotionalState.Happy) {
                Column(modifier = Modifier.padding(16.dp)) {
                    SalliePrimaryButton(
                        onClick = {},
                        text = "Happy Button",
                        emotionalState = EmotionalState.Happy
                    )
                    
                    SallieCard(emotionalState = EmotionalState.Happy) {
                        androidx.compose.material3.Text("Happy Card")
                    }
                    
                    SallieTextField(
                        value = "Happy Input",
                        onValueChange = {},
                        emotionalState = EmotionalState.Happy
                    )
                }
            }
        }
        
        // Assert
        composeTestRule.onNodeWithText("Happy Button").assertIsDisplayed()
        composeTestRule.onNodeWithText("Happy Card").assertIsDisplayed()
        composeTestRule.onNodeWithText("Happy Input").assertIsDisplayed()
    }
}

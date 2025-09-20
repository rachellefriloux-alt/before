/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * SallieTextField - Text input components for Sallie UI
 */

package com.sallie.ui.compose.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import com.sallie.ui.compose.theme.AnimationSpeed
import com.sallie.ui.compose.theme.EmotionalState
import com.sallie.ui.compose.theme.LocalAnimationSpeed
import com.sallie.ui.compose.theme.LocalEmotionalPalette
import com.sallie.ui.compose.theme.SallieDimensions

/**
 * Standard text field styled according to Sallie's design system
 * 
 * @param value Current text value
 * @param onValueChange Value change handler
 * @param modifier Modifier for the text field
 * @param label Optional label for the field
 * @param placeholder Optional placeholder text
 * @param supportingText Optional helper text below the field
 * @param isError Whether the field is in error state
 * @param emotionalState Optional emotional state override
 * @param keyboardOptions Keyboard options for input
 * @param keyboardActions Keyboard actions
 * @param visualTransformation Visual transformation for password etc
 * @param singleLine Whether the field is single line
 * @param maxLines Maximum number of lines
 * @param readOnly Whether the field is read-only
 */
@Composable
fun SallieTextField(
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    label: String? = null,
    placeholder: String? = null,
    supportingText: String? = null,
    isError: Boolean = false,
    emotionalState: EmotionalState? = null,
    keyboardOptions: KeyboardOptions = KeyboardOptions.Default,
    keyboardActions: KeyboardActions = KeyboardActions.Default,
    visualTransformation: VisualTransformation = VisualTransformation.None,
    singleLine: Boolean = false,
    maxLines: Int = Int.MAX_VALUE,
    readOnly: Boolean = false
) {
    val emotionalPalette = LocalEmotionalPalette.current
    val animationSpeed = LocalAnimationSpeed.current
    val currentEmotionalState = emotionalState ?: EmotionalState.Neutral
    
    // Calculate animation duration based on speed setting
    val animationDuration = remember(animationSpeed) {
        when (animationSpeed) {
            AnimationSpeed.NORMAL -> 300
            AnimationSpeed.SLOW -> 500
            AnimationSpeed.FAST -> 150
            AnimationSpeed.NONE -> 0
        }
    }
    
    // Color animation for emotional state
    val focusedColor by animateColorAsState(
        targetValue = if (isError) MaterialTheme.colorScheme.error else emotionalPalette.primary,
        animationSpec = tween(durationMillis = animationDuration),
        label = "FocusedColor"
    )
    
    Column(modifier = modifier) {
        TextField(
            value = value,
            onValueChange = onValueChange,
            modifier = Modifier.fillMaxWidth(),
            label = label?.let { { Text(text = it) } },
            placeholder = placeholder?.let { { Text(text = it) } },
            isError = isError,
            keyboardOptions = keyboardOptions,
            keyboardActions = keyboardActions,
            visualTransformation = visualTransformation,
            singleLine = singleLine,
            maxLines = maxLines,
            readOnly = readOnly,
            colors = TextFieldDefaults.colors(
                focusedIndicatorColor = focusedColor,
                focusedLabelColor = focusedColor,
                cursorColor = focusedColor,
                errorCursorColor = MaterialTheme.colorScheme.error
            )
        )
        
        if (supportingText != null) {
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = supportingText,
                style = MaterialTheme.typography.bodySmall,
                color = if (isError) MaterialTheme.colorScheme.error 
                        else MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(start = 4.dp)
            )
        }
    }
}

/**
 * Outlined text field styled according to Sallie's design system
 * 
 * @param value Current text value
 * @param onValueChange Value change handler
 * @param modifier Modifier for the text field
 * @param label Optional label for the field
 * @param placeholder Optional placeholder text
 * @param supportingText Optional helper text below the field
 * @param isError Whether the field is in error state
 * @param emotionalState Optional emotional state override
 * @param keyboardOptions Keyboard options for input
 * @param keyboardActions Keyboard actions
 * @param visualTransformation Visual transformation for password etc
 * @param singleLine Whether the field is single line
 * @param maxLines Maximum number of lines
 * @param readOnly Whether the field is read-only
 */
@Composable
fun SallieOutlinedTextField(
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    label: String? = null,
    placeholder: String? = null,
    supportingText: String? = null,
    isError: Boolean = false,
    emotionalState: EmotionalState? = null,
    keyboardOptions: KeyboardOptions = KeyboardOptions.Default,
    keyboardActions: KeyboardActions = KeyboardActions.Default,
    visualTransformation: VisualTransformation = VisualTransformation.None,
    singleLine: Boolean = false,
    maxLines: Int = Int.MAX_VALUE,
    readOnly: Boolean = false
) {
    val emotionalPalette = LocalEmotionalPalette.current
    val animationSpeed = LocalAnimationSpeed.current
    val currentEmotionalState = emotionalState ?: EmotionalState.Neutral
    
    // Calculate animation duration based on speed setting
    val animationDuration = remember(animationSpeed) {
        when (animationSpeed) {
            AnimationSpeed.NORMAL -> 300
            AnimationSpeed.SLOW -> 500
            AnimationSpeed.FAST -> 150
            AnimationSpeed.NONE -> 0
        }
    }
    
    // Color animation for emotional state
    val focusedColor by animateColorAsState(
        targetValue = if (isError) MaterialTheme.colorScheme.error else emotionalPalette.primary,
        animationSpec = tween(durationMillis = animationDuration),
        label = "FocusedColor"
    )
    
    Column(modifier = modifier) {
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            modifier = Modifier.fillMaxWidth(),
            label = label?.let { { Text(text = it) } },
            placeholder = placeholder?.let { { Text(text = it) } },
            isError = isError,
            keyboardOptions = keyboardOptions,
            keyboardActions = keyboardActions,
            visualTransformation = visualTransformation,
            singleLine = singleLine,
            maxLines = maxLines,
            readOnly = readOnly,
            colors = TextFieldDefaults.colors(
                focusedBorderColor = focusedColor,
                focusedLabelColor = focusedColor,
                cursorColor = focusedColor,
                errorCursorColor = MaterialTheme.colorScheme.error
            )
        )
        
        if (supportingText != null) {
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = supportingText,
                style = MaterialTheme.typography.bodySmall,
                color = if (isError) MaterialTheme.colorScheme.error 
                        else MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(start = 4.dp)
            )
        }
    }
}

/**
 * Search text field styled for search functionality
 * 
 * @param value Current search text
 * @param onValueChange Value change handler
 * @param modifier Modifier for the text field
 * @param placeholder Optional placeholder text
 * @param onSearch Search action handler
 * @param emotionalState Optional emotional state override
 */
@Composable
fun SallieSearchTextField(
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    placeholder: String = "Search",
    onSearch: () -> Unit = {},
    emotionalState: EmotionalState? = null
) {
    SallieOutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        modifier = modifier,
        placeholder = placeholder,
        singleLine = true,
        keyboardOptions = KeyboardOptions(
            imeAction = ImeAction.Search,
            keyboardType = KeyboardType.Text
        ),
        keyboardActions = KeyboardActions(
            onSearch = { onSearch() }
        ),
        emotionalState = emotionalState
    )
}

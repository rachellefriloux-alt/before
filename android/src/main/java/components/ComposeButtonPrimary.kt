/*
 * Persona: Tough love meets soul care.
 * Module: ComposeButtonPrimary
 * Intent: Handle functionality for ComposeButtonPrimary
 * Provenance-ID: 5b383f4d-96f7-445e-80a7-f11998d50796
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

package components

import android.content.Context
import android.util.AttributeSet
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.sallie.app.R

/**
 * ComposeButtonPrimary: Jetpack Compose version of Sallie's primary button
 * Persona-driven color, rounded corners, accessibility, and dynamic theming.
 */
@Composable
fun ComposeButtonPrimary(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true
) {
    val context = LocalContext.current
    Button(
        onClick = onClick,
        modifier = modifier
            .fillMaxWidth()
            .height(48.dp),
        enabled = enabled,
        shape = RoundedCornerShape(24.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = Color(0xFF00897B), // teal_700
            contentColor = Color.White
        )
    ) {
        Text(text = text, maxLines = 1)
    }
}

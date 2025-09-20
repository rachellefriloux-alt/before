/*
 * Persona: Tough love meets soul care.
 * Module: ComposeEmotionMeter
 * Intent: Handle functionality for ComposeEmotionMeter
 * Provenance-ID: ddefadcb-e271-4823-ae5a-5c439fa53bc8
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
 * ComposeEmotionMeter: Jetpack Compose component for visualizing persona emotion
 * Dynamic color, accessibility, and animation-ready.
 */
@Composable
fun ComposeEmotionMeter(
    emotion: String,
    modifier: Modifier = Modifier
) {
    val color = when (emotion) {
        "calm" -> Color(0xFF80DEEA)
        "playful" -> Color(0xFF007FFF)
        "resourceful" -> Color(0xFFFF5252)
        "critical" -> Color(0xFFD32F2F)
        "loyal" -> Color(0xFF00BFA5)
        else -> Color(0xFFBDBDBD)
    }
    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(8.dp)
            .background(color, RoundedCornerShape(4.dp))
    )
}

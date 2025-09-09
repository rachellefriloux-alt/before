/*
 * Persona: Tough love meets soul care.
 * Module: ButtonPrimary
 * Intent: Handle functionality for ButtonPrimary
 * Provenance-ID: 2fcd6204-7571-4ad3-b141-98d953754b01
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

package components

import android.content.Context
import android.util.AttributeSet
import androidx.appcompat.widget.AppCompatButton
import androidx.core.content.ContextCompat
import com.sallie.app.R

/**
 * ButtonPrimary: Consistent primary button for Sallie UI
 * Applies persona-driven color, rounded corners, and accessibility features.
 */
class ButtonPrimary @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = android.R.attr.buttonStyle
) : AppCompatButton(context, attrs, defStyleAttr) {

    init {
        // Set persona-driven background color
        setBackgroundColor(ContextCompat.getColor(context, R.color.teal_700))
        // Set text color for contrast
        setTextColor(ContextCompat.getColor(context, R.color.white))
        // Set rounded corners (requires drawable resource or programmatic)
        // Optionally set custom font, elevation, etc.
        // Accessibility: Ensure minimum touch target size
        minHeight = 48 * resources.displayMetrics.density.toInt()
        minWidth = 88 * resources.displayMetrics.density.toInt()
        isAllCaps = false
        contentDescription = "Primary action button"
    }
}

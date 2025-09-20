package com.sallie.ui.components

import android.graphics.Outline
import android.view.View
import android.view.ViewOutlineProvider

/**
 * Sallie's Adaptive UI Components - Outline Provider
 *
 * Provides consistent rounded corners for adaptive UI components.
 * This allows for theme-driven shape adaptations.
 */
class AdaptiveOutlineProvider(private val cornerRadius: Float) : ViewOutlineProvider() {
    
    override fun getOutline(view: View, outline: Outline) {
        outline.setRoundRect(
            0,
            0,
            view.width,
            view.height,
            cornerRadius
        )
    }
}

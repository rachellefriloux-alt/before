package com.sallie.ui.device

import android.content.Context
import android.util.AttributeSet
import android.view.LayoutInflater
import android.view.View
import android.widget.FrameLayout
import android.widget.TextView
import com.google.android.material.button.MaterialButton

/**
 * Custom view for controlling temperature for thermostats
 */
class TemperatureControlView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {
    
    private var temperature = 22
    private var onTemperatureChanged: ((Int) -> Unit)? = null
    
    // UI elements
    private val temperatureTextView: TextView
    private val decreaseButton: MaterialButton
    private val increaseButton: MaterialButton
    
    init {
        val view = LayoutInflater.from(context).inflate(R.layout.view_temperature_control, this, true)
        
        // Initialize views
        temperatureTextView = view.findViewById(R.id.temperature_value)
        decreaseButton = view.findViewById(R.id.decrease_button)
        increaseButton = view.findViewById(R.id.increase_button)
        
        // Set up buttons
        decreaseButton.setOnClickListener {
            setTemperature(temperature - 1)
            onTemperatureChanged?.invoke(temperature)
        }
        
        increaseButton.setOnClickListener {
            setTemperature(temperature + 1)
            onTemperatureChanged?.invoke(temperature)
        }
        
        // Update initial display
        updateTemperatureDisplay()
    }
    
    /**
     * Set the current temperature
     */
    fun setTemperature(value: Int) {
        temperature = value.coerceIn(10, 32) // Limit to reasonable temperature range
        updateTemperatureDisplay()
    }
    
    /**
     * Set a listener for temperature changes
     */
    fun setOnTemperatureChangedListener(listener: (Int) -> Unit) {
        onTemperatureChanged = listener
    }
    
    /**
     * Update the display with the current temperature
     */
    private fun updateTemperatureDisplay() {
        temperatureTextView.text = "$temperature°C"
    }
}

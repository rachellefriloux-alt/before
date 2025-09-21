package com.sallie.launcher.ui.voice

import android.content.Context
import android.util.AttributeSet
import androidx.appcompat.widget.AppCompatButton

/**
 * Sallie Voice Button - Custom UI component for voice interaction
 * This is a stub implementation for the demo purposes
 */
class SallieVoiceButton @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : AppCompatButton(context, attrs, defStyleAttr) {
    
    var actionListener: OnVoiceButtonActionListener? = null
    
    interface OnVoiceButtonActionListener {
        fun onStartListening()
        fun onStopListening()
        fun onCancel()
    }
    
    init {
        text = "🎤"
        setOnClickListener {
            actionListener?.onStartListening()
        }
    }
    
    fun idle() {
        text = "🎤"
        isEnabled = true
    }
    
    fun startListening() {
        text = "🔴"
    }
    
    fun startProcessing() {
        text = "⏳"
    }
    
    fun startSpeaking() {
        text = "🔊"
    }
    
    fun disable() {
        isEnabled = false
    }
}

enum class VoiceButtonState {
    IDLE, LISTENING, PROCESSING, SPEAKING, DISABLED
}
package com.sallie.ui.voice

import android.animation.AnimatorSet
import android.animation.ObjectAnimator
import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.drawable.Drawable
import android.util.AttributeSet
import android.view.MotionEvent
import android.view.View
import android.view.animation.AccelerateDecelerateInterpolator
import androidx.annotation.ColorInt
import androidx.core.content.ContextCompat
import androidx.interpolator.view.animation.FastOutSlowInInterpolator
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

/**
 * Sallie's Voice Input Button
 * 
 * A customizable button for initiating voice input with visual feedback
 * during listening, processing, and speaking states.
 */
class SallieVoiceButton @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    // Visual properties
    private var micIcon: Drawable? = null
    private var speakerIcon: Drawable? = null
    private val ripplePaint = Paint(Paint.ANTI_ALIAS_FLAG)
    private val circlePaint = Paint(Paint.ANTI_ALIAS_FLAG)
    private val waveformPaint = Paint(Paint.ANTI_ALIAS_FLAG)

    // Animation properties
    private var rippleRadius = 0f
    private var rippleAlpha = 0.7f
    private var animatorSet: AnimatorSet? = null
    private var waveformAmplitude = 0f
    private var waveformPhase = 0f
    
    // State properties
    var state: VoiceButtonState = VoiceButtonState.IDLE
        set(value) {
            if (field != value) {
                field = value
                updateVisualState()
                stateListener?.onVoiceButtonStateChanged(value)
            }
        }

    // Customization properties
    @ColorInt
    var primaryColor: Int = Color.parseColor("#6200EE")
        set(value) {
            field = value
            circlePaint.color = value
            invalidate()
        }

    @ColorInt
    var rippleColor: Int = Color.parseColor("#9C6200EE")
        set(value) {
            field = value
            ripplePaint.color = value
            invalidate()
        }

    @ColorInt
    var waveformColor: Int = Color.parseColor("#FFFFFF")
        set(value) {
            field = value
            waveformPaint.color = value
            invalidate()
        }

    // Callbacks
    var stateListener: OnVoiceButtonStateChangeListener? = null
    var actionListener: OnVoiceButtonActionListener? = null
    
    // Coroutine scope for animations
    private val coroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private var waveformAnimationJob: Job? = null

    init {
        // Initialize paints
        circlePaint.apply {
            style = Paint.Style.FILL
            color = primaryColor
        }
        
        ripplePaint.apply {
            style = Paint.Style.FILL
            color = rippleColor
            alpha = (rippleAlpha * 255).toInt()
        }
        
        waveformPaint.apply {
            style = Paint.Style.STROKE
            strokeWidth = 3f
            color = waveformColor
        }
        
        // Set default icons
        // In a real implementation, these would be loaded from resources or attributes
        // For demo purposes, we'll create placeholders
        setDefaultIcons()
        
        // Set click listener
        setOnClickListener {
            handleClick()
        }
    }
    
    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        updateVisualState()
    }
    
    override fun onDetachedFromWindow() {
        stopAllAnimations()
        coroutineScope.cancel()
        super.onDetachedFromWindow()
    }
    
    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        updateIconBounds()
    }
    
    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        
        val centerX = width / 2f
        val centerY = height / 2f
        val radius = minOf(width, height) / 2f * 0.85f
        
        // Draw ripple if needed
        if (state == VoiceButtonState.LISTENING || 
            state == VoiceButtonState.SPEAKING || 
            rippleRadius > 0) {
            canvas.drawCircle(centerX, centerY, rippleRadius, ripplePaint)
        }
        
        // Draw main circle
        canvas.drawCircle(centerX, centerY, radius, circlePaint)
        
        // Draw waveform if needed
        if (state == VoiceButtonState.LISTENING || 
            state == VoiceButtonState.PROCESSING) {
            drawWaveform(canvas, centerX, centerY, radius * 0.7f)
        }
        
        // Draw icon
        val currentIcon = when (state) {
            VoiceButtonState.SPEAKING -> speakerIcon
            else -> micIcon
        }
        
        currentIcon?.let {
            it.draw(canvas)
        }
    }
    
    override fun onTouchEvent(event: MotionEvent): Boolean {
        if (state != VoiceButtonState.DISABLED) {
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    animatePressDown()
                    return true
                }
                MotionEvent.ACTION_UP -> {
                    animatePressUp()
                    performClick()
                    return true
                }
                MotionEvent.ACTION_CANCEL -> {
                    animatePressUp()
                    return true
                }
            }
        }
        return super.onTouchEvent(event)
    }
    
    /**
     * Set a custom mic icon
     */
    fun setMicIcon(drawable: Drawable?) {
        micIcon = drawable
        updateIconBounds()
        invalidate()
    }
    
    /**
     * Set a custom speaker icon
     */
    fun setSpeakerIcon(drawable: Drawable?) {
        speakerIcon = drawable
        updateIconBounds()
        invalidate()
    }
    
    /**
     * Start listening animation
     */
    fun startListening() {
        state = VoiceButtonState.LISTENING
    }
    
    /**
     * Start processing animation
     */
    fun startProcessing() {
        state = VoiceButtonState.PROCESSING
    }
    
    /**
     * Start speaking animation
     */
    fun startSpeaking() {
        state = VoiceButtonState.SPEAKING
    }
    
    /**
     * Return to idle state
     */
    fun idle() {
        state = VoiceButtonState.IDLE
    }
    
    /**
     * Disable the button
     */
    fun disable() {
        state = VoiceButtonState.DISABLED
    }
    
    /**
     * Enable the button
     */
    fun enable() {
        state = VoiceButtonState.IDLE
    }
    
    /**
     * Interface for voice button state changes
     */
    interface OnVoiceButtonStateChangeListener {
        fun onVoiceButtonStateChanged(state: VoiceButtonState)
    }
    
    /**
     * Interface for voice button actions
     */
    interface OnVoiceButtonActionListener {
        fun onStartListening()
        fun onStopListening()
        fun onCancel()
    }
    
    private fun handleClick() {
        when (state) {
            VoiceButtonState.IDLE -> {
                state = VoiceButtonState.LISTENING
                actionListener?.onStartListening()
            }
            VoiceButtonState.LISTENING, VoiceButtonState.PROCESSING -> {
                state = VoiceButtonState.IDLE
                actionListener?.onStopListening()
            }
            VoiceButtonState.SPEAKING -> {
                state = VoiceButtonState.IDLE
                actionListener?.onCancel()
            }
            VoiceButtonState.DISABLED -> {
                // Do nothing when disabled
            }
        }
    }
    
    private fun updateVisualState() {
        stopAllAnimations()
        
        when (state) {
            VoiceButtonState.IDLE -> {
                setAlpha(1.0f)
                isEnabled = true
            }
            VoiceButtonState.LISTENING -> {
                startRippleAnimation()
                startWaveformAnimation()
            }
            VoiceButtonState.PROCESSING -> {
                startWaveformAnimation(true)
            }
            VoiceButtonState.SPEAKING -> {
                startRippleAnimation(true)
            }
            VoiceButtonState.DISABLED -> {
                setAlpha(0.5f)
                isEnabled = false
            }
        }
        
        invalidate()
    }
    
    private fun startRippleAnimation(isSpeaking: Boolean = false) {
        val maxRippleRadius = minOf(width, height) / 2f * 1.5f
        val duration = if (isSpeaking) 2000L else 1500L
        
        val expandAnimator = ObjectAnimator.ofFloat(
            this,
            "rippleRadius",
            0f,
            maxRippleRadius
        ).apply {
            this.duration = duration
            repeatCount = ObjectAnimator.INFINITE
            interpolator = AccelerateDecelerateInterpolator()
        }
        
        val fadeAnimator = ObjectAnimator.ofFloat(
            this,
            "rippleAlpha",
            0.7f,
            0f
        ).apply {
            this.duration = duration
            repeatCount = ObjectAnimator.INFINITE
            interpolator = AccelerateDecelerateInterpolator()
        }
        
        animatorSet = AnimatorSet().apply {
            playTogether(expandAnimator, fadeAnimator)
            start()
        }
    }
    
    private fun startWaveformAnimation(isProcessing: Boolean = false) {
        waveformAnimationJob?.cancel()
        
        waveformAnimationJob = coroutineScope.launch {
            val baseAmplitude = if (isProcessing) 0.3f else 0.5f
            var time = 0f
            
            while (isActive) {
                time += 0.05f
                
                // Adjust amplitude and frequency for processing vs listening
                if (isProcessing) {
                    waveformAmplitude = baseAmplitude + 0.1f * kotlin.math.sin(time * 3)
                    waveformPhase = time * 2
                } else {
                    // Make amplitude responsive to "audio levels" in listening mode
                    waveformAmplitude = baseAmplitude + 0.3f * kotlin.math.random().toFloat()
                    waveformPhase = time * 3
                }
                
                invalidate()
                delay(50)
            }
        }
    }
    
    private fun drawWaveform(canvas: Canvas, centerX: Float, centerY: Float, radius: Float) {
        val path = android.graphics.Path()
        val pointCount = 48
        
        for (i in 0 until pointCount) {
            val angle = i * 2 * Math.PI / pointCount
            val offset = waveformAmplitude * kotlin.math.sin(6 * angle + waveformPhase)
            val pointRadius = radius * (0.9f + offset * 0.2f)
            val x = centerX + pointRadius * kotlin.math.cos(angle).toFloat()
            val y = centerY + pointRadius * kotlin.math.sin(angle).toFloat()
            
            if (i == 0) {
                path.moveTo(x, y)
            } else {
                path.lineTo(x, y)
            }
        }
        
        path.close()
        canvas.drawPath(path, waveformPaint)
    }
    
    private fun animatePressDown() {
        animate()
            .scaleX(0.9f)
            .scaleY(0.9f)
            .setDuration(100)
            .setInterpolator(FastOutSlowInInterpolator())
            .start()
    }
    
    private fun animatePressUp() {
        animate()
            .scaleX(1f)
            .scaleY(1f)
            .setDuration(200)
            .setInterpolator(FastOutSlowInInterpolator())
            .start()
    }
    
    private fun stopAllAnimations() {
        animatorSet?.cancel()
        animatorSet = null
        waveformAnimationJob?.cancel()
        waveformAnimationJob = null
        
        rippleRadius = 0f
        rippleAlpha = 0.7f
    }
    
    private fun updateIconBounds() {
        val iconSize = minOf(width, height) / 2
        val left = (width - iconSize) / 2
        val top = (height - iconSize) / 2
        
        micIcon?.setBounds(left, top, left + iconSize, top + iconSize)
        speakerIcon?.setBounds(left, top, left + iconSize, top + iconSize)
    }
    
    private fun setDefaultIcons() {
        // In a real implementation, we would load icons from resources
        // For demo purposes, we'll use simple shapes
        
        // Create a simple microphone icon
        val micDrawable = object : Drawable() {
            override fun draw(canvas: Canvas) {
                val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                    color = Color.WHITE
                    style = Paint.Style.FILL
                }
                
                val bounds = bounds
                val width = bounds.width()
                val height = bounds.height()
                val centerX = bounds.left + width / 2f
                val centerY = bounds.top + height / 2f
                
                // Draw microphone body
                val micWidth = width * 0.3f
                val micHeight = height * 0.5f
                canvas.drawRoundRect(
                    centerX - micWidth / 2,
                    centerY - micHeight / 2,
                    centerX + micWidth / 2,
                    centerY + micHeight / 2,
                    micWidth / 2,
                    micWidth / 2,
                    paint
                )
                
                // Draw microphone stand
                canvas.drawRect(
                    centerX - micWidth / 6,
                    centerY + micHeight / 2,
                    centerX + micWidth / 6,
                    centerY + micHeight * 0.8f,
                    paint
                )
                
                // Draw microphone base
                canvas.drawRoundRect(
                    centerX - micWidth / 2,
                    centerY + micHeight * 0.75f,
                    centerX + micWidth / 2,
                    centerY + micHeight * 0.9f,
                    micWidth / 6,
                    micWidth / 6,
                    paint
                )
            }
            
            override fun setAlpha(alpha: Int) {}
            
            override fun setColorFilter(colorFilter: android.graphics.ColorFilter?) {}
            
            override fun getOpacity(): Int = android.graphics.PixelFormat.OPAQUE
        }
        
        // Create a simple speaker icon
        val speakerDrawable = object : Drawable() {
            override fun draw(canvas: Canvas) {
                val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                    color = Color.WHITE
                    style = Paint.Style.FILL
                }
                
                val bounds = bounds
                val width = bounds.width()
                val height = bounds.height()
                val centerX = bounds.left + width / 2f
                val centerY = bounds.top + height / 2f
                
                // Draw speaker cone
                val path = android.graphics.Path()
                val speakerWidth = width * 0.3f
                val speakerHeight = height * 0.5f
                
                path.moveTo(centerX - speakerWidth / 2, centerY - speakerHeight / 4)
                path.lineTo(centerX - speakerWidth / 2, centerY + speakerHeight / 4)
                path.lineTo(centerX, centerY + speakerHeight / 3)
                path.lineTo(centerX, centerY - speakerHeight / 3)
                path.close()
                canvas.drawPath(path, paint)
                
                // Draw sound waves
                paint.style = Paint.Style.STROKE
                paint.strokeWidth = width * 0.03f
                
                for (i in 1..3) {
                    val radius = speakerWidth * 0.4f * i
                    val startAngle = -30f
                    val sweepAngle = 60f
                    canvas.drawArc(
                        centerX - radius,
                        centerY - radius,
                        centerX + radius,
                        centerY + radius,
                        startAngle,
                        sweepAngle,
                        false,
                        paint
                    )
                }
            }
            
            override fun setAlpha(alpha: Int) {}
            
            override fun setColorFilter(colorFilter: android.graphics.ColorFilter?) {}
            
            override fun getOpacity(): Int = android.graphics.PixelFormat.OPAQUE
        }
        
        micIcon = micDrawable
        speakerIcon = speakerDrawable
    }
    
    // Property for animations
    @Suppress("unused")
    private fun setRippleRadius(value: Float) {
        rippleRadius = value
        invalidate()
    }
    
    @Suppress("unused")
    private fun setRippleAlpha(value: Float) {
        rippleAlpha = value
        ripplePaint.alpha = (value * 255).toInt()
        invalidate()
    }
}

/**
 * Voice button states
 */
enum class VoiceButtonState {
    IDLE,
    LISTENING,
    PROCESSING,
    SPEAKING,
    DISABLED
}

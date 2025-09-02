package com.sallie.ui.input

import android.content.Context
import android.util.AttributeSet
import android.view.LayoutInflater
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.ImageButton
import android.widget.LinearLayout
import android.widget.TextView
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.lifecycleScope
import com.sallie.core.input.InputProcessingManager
import com.sallie.core.input.InputResultListener
import com.sallie.core.input.InputType
import com.sallie.core.input.ProcessedInput
import com.sallie.core.input.InputProcessingError
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.launch

/**
 * Sallie's Input Bar UI Component
 * 
 * A customizable input bar for text and multimodal input that integrates
 * with Sallie's input processing system.
 */
class SallieInputBar @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : ConstraintLayout(context, attrs, defStyleAttr) {

    // UI elements
    private val inputEditText: EditText
    private val sendButton: ImageButton
    private val voiceButton: ImageButton
    private val imageButton: ImageButton
    private val inputFeedbackView: TextView
    
    // Input manager (to be set by the user)
    private var inputManager: InputProcessingManager? = null
    
    // Callback for input results
    private var onInputProcessedListener: ((ProcessedInput) -> Unit)? = null
    
    // Input result listener
    private val inputResultListener = object : InputResultListener {
        override fun onInputResult(result: ProcessedInput) {
            // Update UI based on result
            updateInputFeedback(result)
            
            // Call user callback
            onInputProcessedListener?.invoke(result)
        }
        
        override fun onInputError(inputType: InputType, error: InputProcessingError, contextId: String?) {
            // Show error in the feedback view
            inputFeedbackView.text = "Error: ${error.message}"
            inputFeedbackView.visibility = View.VISIBLE
        }
    }
    
    init {
        // Inflate layout
        LayoutInflater.from(context).inflate(R.layout.sallie_input_bar, this, true)
        
        // Find views
        inputEditText = findViewById(R.id.input_edit_text)
        sendButton = findViewById(R.id.send_button)
        voiceButton = findViewById(R.id.voice_button)
        imageButton = findViewById(R.id.image_button)
        inputFeedbackView = findViewById(R.id.input_feedback_view)
        
        // Set up listeners
        setupListeners()
    }
    
    /**
     * Set the input processing manager
     */
    fun setInputManager(manager: InputProcessingManager) {
        // Unregister previous listener if necessary
        inputManager?.unregisterInputListener(inputResultListener)
        
        // Set the new manager
        inputManager = manager
        
        // Register the listener
        manager.registerInputListener(inputResultListener)
        
        // Update UI based on capabilities
        updateInputCapabilities()
    }
    
    /**
     * Set the lifecycle owner for this component
     */
    fun setLifecycleOwner(lifecycleOwner: LifecycleOwner) {
        // Observe input events
        lifecycleOwner.lifecycleScope.launch {
            inputManager?.inputEvents?.collect { event ->
                // Handle events as needed
                when (event) {
                    is InputEvent.ProcessingStarted -> {
                        // Show processing indicator
                        showProcessingIndicator()
                    }
                    is InputEvent.ProcessingComplete -> {
                        // Hide processing indicator
                        hideProcessingIndicator()
                    }
                    is InputEvent.ProcessingError -> {
                        // Hide processing indicator and show error
                        hideProcessingIndicator()
                    }
                    else -> {
                        // Handle other events
                    }
                }
            }
        }
    }
    
    /**
     * Set callback for when input is processed
     */
    fun setOnInputProcessedListener(listener: (ProcessedInput) -> Unit) {
        onInputProcessedListener = listener
    }
    
    /**
     * Set up button listeners
     */
    private fun setupListeners() {
        // Send button
        sendButton.setOnClickListener {
            val text = inputEditText.text.toString().trim()
            if (text.isNotEmpty()) {
                processTextInput(text)
                inputEditText.setText("")
            }
        }
        
        // Voice button
        voiceButton.setOnClickListener {
            startVoiceInput()
        }
        
        // Image button
        imageButton.setOnClickListener {
            startImageInput()
        }
    }
    
    /**
     * Process text input
     */
    private fun processTextInput(text: String) {
        inputManager?.let { manager ->
            // Show processing indicator
            showProcessingIndicator()
            
            // Process text input
            (context as? LifecycleOwner)?.lifecycleScope?.launch {
                try {
                    manager.processText(text).collect { result ->
                        // Final result will be handled by the input listener
                    }
                } catch (e: Exception) {
                    // Show error in the feedback view
                    inputFeedbackView.text = "Error: ${e.message}"
                    inputFeedbackView.visibility = View.VISIBLE
                    
                    // Hide processing indicator
                    hideProcessingIndicator()
                }
            }
        }
    }
    
    /**
     * Start voice input
     */
    private fun startVoiceInput() {
        // This would launch a voice input activity or dialog
        // For now, we'll show a placeholder message
        inputFeedbackView.text = "Voice input coming soon..."
        inputFeedbackView.visibility = View.VISIBLE
    }
    
    /**
     * Start image input
     */
    private fun startImageInput() {
        // This would launch an image selection activity
        // For now, we'll show a placeholder message
        inputFeedbackView.text = "Image input coming soon..."
        inputFeedbackView.visibility = View.VISIBLE
    }
    
    /**
     * Update UI based on available input capabilities
     */
    private fun updateInputCapabilities() {
        inputManager?.let { manager ->
            val capabilities = manager.getCapabilities()
            
            // Enable/disable voice button based on speech recognition capability
            voiceButton.isEnabled = capabilities.contains(InputCapability.SPEECH_RECOGNITION)
            
            // Enable/disable image button based on image understanding capability
            imageButton.isEnabled = capabilities.contains(InputCapability.IMAGE_UNDERSTANDING) || 
                                   capabilities.contains(InputCapability.OBJECT_DETECTION)
        }
    }
    
    /**
     * Update input feedback based on processed input
     */
    private fun updateInputFeedback(input: ProcessedInput) {
        // Show feedback based on semantic analysis
        input.semanticAnalysis?.let { semantics ->
            // Create a simple feedback message
            val feedback = StringBuilder()
            
            // Add intent if available
            semantics.intent?.let { intent ->
                feedback.append("Intent: ${intent.name} (${(intent.confidence * 100).toInt()}%)\n")
            }
            
            // Add sentiment if available
            semantics.sentiment?.let { sentiment ->
                val sentimentText = when {
                    sentiment.score > 0.25 -> "Positive"
                    sentiment.score < -0.25 -> "Negative"
                    else -> "Neutral"
                }
                feedback.append("Sentiment: $sentimentText\n")
            }
            
            // Add entities if available
            if (semantics.entities.isNotEmpty()) {
                feedback.append("Entities: ${semantics.entities.take(3).joinToString { it.text }}")
                if (semantics.entities.size > 3) {
                    feedback.append(" and ${semantics.entities.size - 3} more")
                }
            }
            
            // Show the feedback
            if (feedback.isNotEmpty()) {
                inputFeedbackView.text = feedback
                inputFeedbackView.visibility = View.VISIBLE
            } else {
                inputFeedbackView.visibility = View.GONE
            }
        } ?: run {
            inputFeedbackView.visibility = View.GONE
        }
    }
    
    /**
     * Show processing indicator
     */
    private fun showProcessingIndicator() {
        // Disable send button to indicate processing
        sendButton.isEnabled = false
        
        // Show a processing message
        inputFeedbackView.text = "Processing input..."
        inputFeedbackView.visibility = View.VISIBLE
    }
    
    /**
     * Hide processing indicator
     */
    private fun hideProcessingIndicator() {
        // Re-enable send button
        sendButton.isEnabled = true
    }
}

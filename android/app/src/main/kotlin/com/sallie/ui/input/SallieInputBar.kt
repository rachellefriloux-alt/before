package com.sallie.ui.input

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.os.Environment
import android.os.Handler
import android.os.Looper
import android.provider.MediaStore
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.widget.TextView
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

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
    
    // Voice and image input properties
    private var speechRecognizer: SpeechRecognizer? = null
    private var currentPhotoPath: String? = null
    private var onVoiceInputResult: ((String) -> Unit)? = null
    private var onImageInputResult: ((String) -> Unit)? = null
    
    // Permission request codes
    companion object {
        private const val VOICE_PERMISSION_REQUEST_CODE = 1001
        private const val IMAGE_PERMISSION_REQUEST_CODE = 1002
        private const val IMAGE_CAPTURE_REQUEST_CODE = 1003
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
     * Set callback for voice input results
     */
    fun setOnVoiceInputResultListener(listener: (String) -> Unit) {
        onVoiceInputResult = listener
    }
    
    /**
     * Set callback for image input results
     */
    fun setOnImageInputResultListener(listener: (String) -> Unit) {
        onImageInputResult = listener
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
        try {
            // Check for microphone permission
            if (ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO)
                != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(
                    context as Activity,
                    arrayOf(Manifest.permission.RECORD_AUDIO),
                    VOICE_PERMISSION_REQUEST_CODE
                )
                return
            }

            // Initialize speech recognizer
            if (speechRecognizer == null) {
                speechRecognizer = SpeechRecognizer.createSpeechRecognizer(context)
                speechRecognizer?.setRecognitionListener(object : RecognitionListener {
                    override fun onReadyForSpeech(params: Bundle?) {
                        inputFeedbackView.text = "Listening..."
                        inputFeedbackView.visibility = View.VISIBLE
                    }

                    override fun onBeginningOfSpeech() {
                        inputFeedbackView.text = "Speak now..."
                    }

                    override fun onRmsChanged(rmsdB: Float) {
                        // Update visual feedback based on audio level
                        val level = (rmsdB + 2) / 10 // Normalize to 0-1 range
                        updateVoiceVisualization(level)
                    }

                    override fun onBufferReceived(buffer: ByteArray?) {}

                    override fun onEndOfSpeech() {
                        inputFeedbackView.text = "Processing..."
                    }

                    override fun onError(error: Int) {
                        val errorMessage = when (error) {
                            SpeechRecognizer.ERROR_NO_MATCH -> "No speech detected"
                            SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> "Speech timeout"
                            SpeechRecognizer.ERROR_AUDIO -> "Audio recording error"
                            else -> "Voice recognition error"
                        }
                        inputFeedbackView.text = errorMessage
                        Handler(Looper.getMainLooper()).postDelayed({
                            inputFeedbackView.visibility = View.GONE
                        }, 2000)
                    }

                    override fun onResults(results: Bundle?) {
                        val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                        if (!matches.isNullOrEmpty()) {
                            val recognizedText = matches[0]
                            inputFeedbackView.text = "Recognized: $recognizedText"
                            onVoiceInputResult?.invoke(recognizedText)
                        }
                        Handler(Looper.getMainLooper()).postDelayed({
                            inputFeedbackView.visibility = View.GONE
                        }, 1500)
                    }

                    override fun onPartialResults(partialResults: Bundle?) {
                        val partial = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                        if (!partial.isNullOrEmpty()) {
                            inputFeedbackView.text = partial[0]
                        }
                    }

                    override fun onEvent(eventType: Int, params: Bundle?) {}
                })
            }

            // Start listening
            val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault())
                putExtra(RecognizerIntent.EXTRA_PROMPT, "Speak your message to Sallie")
                putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1)
            }

            speechRecognizer?.startListening(intent)

        } catch (e: Exception) {
            inputFeedbackView.text = "Voice input not available"
            inputFeedbackView.visibility = View.VISIBLE
            Handler(Looper.getMainLooper()).postDelayed({
                inputFeedbackView.visibility = View.GONE
            }, 2000)
        }
    }
    
    /**
     * Start image input
     */
    private fun startImageInput() {
        try {
            // Check for camera permission
            if (ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA)
                != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(
                    context as Activity,
                    arrayOf(Manifest.permission.CAMERA, Manifest.permission.WRITE_EXTERNAL_STORAGE),
                    IMAGE_PERMISSION_REQUEST_CODE
                )
                return
            }

            // Create image capture intent
            val intent = Intent(MediaStore.ACTION_IMAGE_CAPTURE).apply {
                // Create a file to store the image
                val timeStamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
                val imageFileName = "Sallie_$timeStamp.jpg"
                val storageDir = context.getExternalFilesDir(Environment.DIRECTORY_PICTURES)
                val imageFile = File(storageDir, imageFileName)

                currentPhotoPath = imageFile.absolutePath
                val photoURI = FileProvider.getUriForFile(
                    context,
                    "${context.packageName}.fileprovider",
                    imageFile
                )
                putExtra(MediaStore.EXTRA_OUTPUT, photoURI)
            }

            // Start camera activity
            (context as Activity).startActivityForResult(intent, IMAGE_CAPTURE_REQUEST_CODE)

        } catch (e: Exception) {
            inputFeedbackView.text = "Camera not available"
            inputFeedbackView.visibility = View.VISIBLE
            Handler(Looper.getMainLooper()).postDelayed({
                inputFeedbackView.visibility = View.GONE
            }, 2000)
        }
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
     * Handle activity result for image capture
     */
    fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        when (requestCode) {
            IMAGE_CAPTURE_REQUEST_CODE -> {
                if (resultCode == Activity.RESULT_OK) {
                    currentPhotoPath?.let { path ->
                        inputFeedbackView.text = "Image captured: $path"
                        onImageInputResult?.invoke(path)
                        Handler(Looper.getMainLooper()).postDelayed({
                            inputFeedbackView.visibility = View.GONE
                        }, 2000)
                    }
                } else {
                    inputFeedbackView.text = "Image capture cancelled"
                    inputFeedbackView.visibility = View.VISIBLE
                    Handler(Looper.getMainLooper()).postDelayed({
                        inputFeedbackView.visibility = View.GONE
                    }, 2000)
                }
            }
        }
    }
    
    /**
     * Handle permission request results
     */
    fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        when (requestCode) {
            VOICE_PERMISSION_REQUEST_CODE -> {
                if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    startVoiceInput()
                } else {
                    inputFeedbackView.text = "Microphone permission denied"
                    inputFeedbackView.visibility = View.VISIBLE
                    Handler(Looper.getMainLooper()).postDelayed({
                        inputFeedbackView.visibility = View.GONE
                    }, 2000)
                }
            }
            IMAGE_PERMISSION_REQUEST_CODE -> {
                if (grantResults.isNotEmpty() && grantResults.all { it == PackageManager.PERMISSION_GRANTED }) {
                    startImageInput()
                } else {
                    inputFeedbackView.text = "Camera permission denied"
                    inputFeedbackView.visibility = View.VISIBLE
                    Handler(Looper.getMainLooper()).postDelayed({
                        inputFeedbackView.visibility = View.GONE
                    }, 2000)
                }
            }
        }
    }

package com.sallie.demo

import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.google.android.material.chip.Chip
import com.google.android.material.chip.ChipGroup
import com.google.android.material.slider.Slider
import com.sallie.R
import com.sallie.core.emotional.EmotionalIntelligenceBridge
import com.sallie.core.emotional.FeedbackType
import kotlinx.coroutines.launch

/**
 * Sallie 2.0 Module
 * Persona: Tough love meets soul care.
 * Function: Demo activity for showcasing emotional intelligence capabilities.
 * Got it, love.
 */
class EmotionalIntelligenceDemoActivity : AppCompatActivity() {

    private lateinit var inputEditText: EditText
    private lateinit var analyzeButton: Button
    private lateinit var responseButton: Button
    private lateinit var emotionTextView: TextView
    private lateinit var confidenceSlider: Slider
    private lateinit var secondaryEmotionChip: Chip
    private lateinit var responseTextView: TextView
    private lateinit var componentGroup: ChipGroup
    private lateinit var feedbackGroup: ChipGroup
    private lateinit var resetButton: Button
    
    private lateinit var emotionalIntelligenceBridge: EmotionalIntelligenceBridge
    private var currentInput: String = ""
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_emotional_intelligence_demo)
        
        // Initialize UI components
        inputEditText = findViewById(R.id.input_edit_text)
        analyzeButton = findViewById(R.id.analyze_button)
        responseButton = findViewById(R.id.response_button)
        emotionTextView = findViewById(R.id.emotion_text_view)
        confidenceSlider = findViewById(R.id.confidence_slider)
        secondaryEmotionChip = findViewById(R.id.secondary_emotion_chip)
        responseTextView = findViewById(R.id.response_text_view)
        componentGroup = findViewById(R.id.component_chip_group)
        feedbackGroup = findViewById(R.id.feedback_chip_group)
        resetButton = findViewById(R.id.reset_button)
        
        // Disable response button initially
        responseButton.isEnabled = false
        
        // Initialize emotional intelligence bridge
        lifecycleScope.launch {
            emotionalIntelligenceBridge = EmotionalIntelligenceBridge.getInstance(applicationContext)
            emotionalIntelligenceBridge.initialize()
            
            // Enable UI once initialized
            analyzeButton.isEnabled = true
        }
        
        // Set up button click listeners
        setupClickListeners()
    }
    
    private fun setupClickListeners() {
        // Analyze button
        analyzeButton.setOnClickListener {
            val input = inputEditText.text.toString().trim()
            if (input.isNotEmpty()) {
                currentInput = input
                analyzeEmotion(input)
            }
        }
        
        // Response button
        responseButton.setOnClickListener {
            if (currentInput.isNotEmpty()) {
                generateResponse(currentInput)
            }
        }
        
        // Reset button
        resetButton.setOnClickListener {
            lifecycleScope.launch {
                emotionalIntelligenceBridge.resetCalibration()
                updateCalibrationStatus()
                showFeedbackMessage("Calibration has been reset")
            }
        }
        
        // Feedback buttons
        setupFeedbackButtons()
    }
    
    private fun setupFeedbackButtons() {
        // Find feedback chips
        val positiveChip = findViewById<Chip>(R.id.positive_feedback_chip)
        val neutralChip = findViewById<Chip>(R.id.neutral_feedback_chip)
        val negativeChip = findViewById<Chip>(R.id.negative_feedback_chip)
        
        // Set click listeners
        positiveChip.setOnClickListener {
            provideFeedback(FeedbackType.POSITIVE)
        }
        
        neutralChip.setOnClickListener {
            provideFeedback(FeedbackType.NEUTRAL)
        }
        
        negativeChip.setOnClickListener {
            provideFeedback(FeedbackType.NEGATIVE)
        }
    }
    
    private fun analyzeEmotion(input: String) {
        // Show loading state
        emotionTextView.text = "Analyzing..."
        confidenceSlider.visibility = View.INVISIBLE
        secondaryEmotionChip.visibility = View.INVISIBLE
        
        // Analyze emotion
        lifecycleScope.launch {
            try {
                val emotionalState = emotionalIntelligenceBridge.analyzeEmotionalState(input)
                
                // Update UI with emotion results
                emotionTextView.text = emotionalState.primaryEmotion.name
                
                // Update confidence slider
                confidenceSlider.value = (emotionalState.confidenceScore * 100).toFloat()
                confidenceSlider.visibility = View.VISIBLE
                
                // Show secondary emotion if available
                emotionalState.secondaryEmotion?.let {
                    secondaryEmotionChip.text = it.name
                    secondaryEmotionChip.visibility = View.VISIBLE
                } ?: run {
                    secondaryEmotionChip.visibility = View.INVISIBLE
                }
                
                // Enable response generation
                responseButton.isEnabled = true
                
            } catch (e: Exception) {
                emotionTextView.text = "Analysis failed: ${e.message}"
                responseButton.isEnabled = false
            }
        }
    }
    
    private fun generateResponse(input: String) {
        // Show loading state
        responseTextView.text = "Generating response..."
        componentGroup.visibility = View.INVISIBLE
        feedbackGroup.visibility = View.INVISIBLE
        
        // Generate response
        lifecycleScope.launch {
            try {
                val response = emotionalIntelligenceBridge.generateEmpathicResponse(input)
                
                // Update UI with response
                responseTextView.text = response.fullResponse
                
                // Show response components
                updateComponentChips(response.acknowledgment, response.validation, 
                                    response.support, response.encouragement)
                componentGroup.visibility = View.VISIBLE
                
                // Enable feedback
                feedbackGroup.visibility = View.VISIBLE
                
                // Update calibration status
                updateCalibrationStatus()
                
            } catch (e: Exception) {
                responseTextView.text = "Response generation failed: ${e.message}"
                feedbackGroup.visibility = View.INVISIBLE
            }
        }
    }
    
    private fun updateComponentChips(
        acknowledgment: String,
        validation: String,
        support: String,
        encouragement: String
    ) {
        // Clear previous components
        componentGroup.removeAllViews()
        
        // Add component chips
        if (acknowledgment.isNotEmpty()) {
            addComponentChip("Acknowledgment", acknowledgment)
        }
        
        if (validation.isNotEmpty()) {
            addComponentChip("Validation", validation)
        }
        
        if (support.isNotEmpty()) {
            addComponentChip("Support", support)
        }
        
        if (encouragement.isNotEmpty()) {
            addComponentChip("Encouragement", encouragement)
        }
    }
    
    private fun addComponentChip(label: String, content: String) {
        val chip = Chip(this)
        chip.text = label
        chip.isCheckable = false
        chip.isClickable = true
        
        // Set click listener to show component text
        chip.setOnClickListener {
            responseTextView.text = content
        }
        
        componentGroup.addView(chip)
    }
    
    private fun provideFeedback(feedback: FeedbackType) {
        // Show loading state
        val feedbackMessage = when (feedback) {
            FeedbackType.POSITIVE -> "Recording positive feedback..."
            FeedbackType.NEUTRAL -> "Recording neutral feedback..."
            FeedbackType.NEGATIVE -> "Recording negative feedback..."
        }
        
        showFeedbackMessage(feedbackMessage)
        
        // Submit feedback
        lifecycleScope.launch {
            try {
                // Need to re-analyze and generate to get the response object again
                // In a real app, we'd save this object
                val emotionalState = emotionalIntelligenceBridge.analyzeEmotionalState(currentInput)
                val response = emotionalIntelligenceBridge.generateEmpathicResponse(currentInput)
                
                // Submit feedback
                emotionalIntelligenceBridge.submitResponseFeedback(
                    currentInput,
                    response,
                    feedback,
                    null
                )
                
                // Update calibration status
                updateCalibrationStatus()
                
                // Show success message
                showFeedbackMessage("Feedback recorded successfully")
                
            } catch (e: Exception) {
                showFeedbackMessage("Failed to record feedback: ${e.message}")
            }
        }
    }
    
    private fun updateCalibrationStatus() {
        try {
            val calibrationData = emotionalIntelligenceBridge.getCalibrationAnalytics()
            
            // Update calibration status text
            val statusView = findViewById<TextView>(R.id.calibration_status)
            statusView.text = "Calibration: " +
                    "Positive: ${calibrationData.positiveResponseCount}, " +
                    "Negative: ${calibrationData.negativeResponseCount}, " +
                    "Neutral: ${calibrationData.neutralResponseCount}, " +
                    "Total: ${calibrationData.totalInteractions}"
            
            // Update adjustment sliders
            val compassionSlider = findViewById<Slider>(R.id.compassion_slider)
            val directnessSlider = findViewById<Slider>(R.id.directness_slider)
            
            compassionSlider.value = ((0.5 + calibrationData.compassionAdjustment) * 100).toFloat()
            directnessSlider.value = ((0.5 + calibrationData.directnessAdjustment) * 100).toFloat()
            
        } catch (e: Exception) {
            // Ignore
        }
    }
    
    private fun showFeedbackMessage(message: String) {
        val feedbackMessage = findViewById<TextView>(R.id.feedback_message)
        feedbackMessage.text = message
        feedbackMessage.visibility = View.VISIBLE
        
        // Hide message after a delay
        feedbackMessage.postDelayed({
            feedbackMessage.visibility = View.INVISIBLE
        }, 3000)
    }
}

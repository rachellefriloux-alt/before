package com.sallie.app.demo

import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import com.sallie.core.voice.*
import com.sallie.ui.voice.SallieVoiceButton
import com.sallie.ui.voice.VoiceButtonState
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.launch

/**
 * Sallie's Voice System Demo
 * 
 * Demonstrates the voice system functionality including speech recognition,
 * speech synthesis, and wake word detection.
 */
class VoiceSystemDemoActivity : AppCompatActivity() {
    
    private lateinit var voiceSystemManager: VoiceSystemManager
    private lateinit var voiceButton: SallieVoiceButton
    private lateinit var statusTextView: TextView
    private lateinit var transcriptionTextView: TextView
    private lateinit var speakButton: Button
    private lateinit var toggleWakeWordButton: Button
    
    private var wakeWordEnabled = false
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_voice_system_demo)
        
        // Initialize views
        voiceButton = findViewById(R.id.voice_button)
        statusTextView = findViewById(R.id.status_text)
        transcriptionTextView = findViewById(R.id.transcription_text)
        speakButton = findViewById(R.id.speak_button)
        toggleWakeWordButton = findViewById(R.id.toggle_wake_word_button)
        
        // Initialize voice system manager
        initVoiceSystem()
        
        // Set up button listeners
        setupButtonListeners()
        
        // Observe voice system state and events
        observeVoiceSystem()
    }
    
    private fun initVoiceSystem() {
        // Create config with default settings
        val config = VoiceSystemFactory.configBuilder()
            .setRecognitionEngine(RecognitionEngineType.ONDEVICE)
            .setSynthesisEngine(SynthesisEngineType.ONDEVICE)
            .setDefaultLanguage("en-US")
            .setWakeWordEnabled(false)
            .setDefaultWakeWord("Hey Sallie")
            .setVadEnabled(true)
            .setNoiseReduction(true)
            .setOfflineMode(true)
            .build()
        
        // Create and initialize voice system manager
        voiceSystemManager = VoiceSystemManager(this, config)
        
        // Add lifecycle observer
        lifecycle.addObserver(voiceSystemManager)
        
        // Initialize voice system
        lifecycleScope.launch {
            try {
                statusTextView.text = "Initializing voice system..."
                voiceSystemManager.initialize()
                statusTextView.text = "Voice system ready"
                
                // Check permissions
                if (!voiceSystemManager.hasRequiredPermissions()) {
                    statusTextView.text = "Requesting microphone permission..."
                    voiceSystemManager.requestPermissions(this@VoiceSystemDemoActivity)
                }
            } catch (e: Exception) {
                statusTextView.text = "Error: ${e.message}"
            }
        }
    }
    
    private fun setupButtonListeners() {
        // Voice button
        voiceButton.actionListener = object : SallieVoiceButton.OnVoiceButtonActionListener {
            override fun onStartListening() {
                voiceSystemManager.startListening()
            }
            
            override fun onStopListening() {
                voiceSystemManager.stopListening()
            }
            
            override fun onCancel() {
                voiceSystemManager.stopSpeaking()
            }
        }
        
        // Speak button
        speakButton.setOnClickListener {
            val textToSpeak = transcriptionTextView.text.toString()
            if (textToSpeak.isNotBlank()) {
                voiceSystemManager.speak(textToSpeak)
            } else {
                voiceSystemManager.speak("Hello, I am Sallie. How can I help you today?")
            }
        }
        
        // Wake word toggle button
        toggleWakeWordButton.setOnClickListener {
            wakeWordEnabled = !wakeWordEnabled
            voiceSystemManager.setWakeWordDetection(wakeWordEnabled)
            updateWakeWordButtonText()
        }
    }
    
    private fun observeVoiceSystem() {
        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                // Observe voice state
                launch {
                    voiceSystemManager.voiceState.collect { state ->
                        updateVoiceButtonState(state)
                        updateStatusText(state)
                    }
                }
                
                // Observe transcription
                launch {
                    voiceSystemManager.transcription.collect { text ->
                        transcriptionTextView.text = text
                    }
                }
                
                // Observe voice events
                launch {
                    voiceSystemManager.voiceEvent.collect { event ->
                        handleVoiceEvent(event)
                    }
                }
            }
        }
    }
    
    private fun updateVoiceButtonState(state: VoiceState) {
        when (state) {
            VoiceState.IDLE -> voiceButton.idle()
            VoiceState.LISTENING -> voiceButton.startListening()
            VoiceState.PROCESSING -> voiceButton.startProcessing()
            VoiceState.SPEAKING -> voiceButton.startSpeaking()
        }
    }
    
    private fun updateStatusText(state: VoiceState) {
        statusTextView.text = when (state) {
            VoiceState.IDLE -> "Ready"
            VoiceState.LISTENING -> "Listening..."
            VoiceState.PROCESSING -> "Processing..."
            VoiceState.SPEAKING -> "Speaking..."
        }
    }
    
    private fun handleVoiceEvent(event: VoiceEvent) {
        when (event) {
            is VoiceEvent.Error -> {
                Toast.makeText(this, "Error: ${event.error.message}", Toast.LENGTH_SHORT).show()
                statusTextView.text = "Error: ${event.error.code}"
            }
            is VoiceEvent.WakeWordDetected -> {
                Toast.makeText(this, "Wake word detected: ${event.wakeWord}", Toast.LENGTH_SHORT).show()
                statusTextView.text = "Wake word detected"
                // Automatically start listening when wake word is detected
                voiceSystemManager.startListening()
            }
            is VoiceEvent.SpeechDetected -> {
                statusTextView.text = "Speech detected"
            }
            is VoiceEvent.SilenceDetected -> {
                statusTextView.text = "Silence detected"
            }
            is VoiceEvent.FinalTranscription -> {
                statusTextView.text = "Transcription complete"
                // Handle final transcription if needed
            }
            is VoiceEvent.WakeWordStatusChanged -> {
                wakeWordEnabled = event.enabled
                updateWakeWordButtonText()
                Toast.makeText(
                    this,
                    if (event.enabled) "Wake word detection enabled" else "Wake word detection disabled",
                    Toast.LENGTH_SHORT
                ).show()
            }
        }
    }
    
    private fun updateWakeWordButtonText() {
        toggleWakeWordButton.text = if (wakeWordEnabled) {
            "Disable Wake Word"
        } else {
            "Enable Wake Word"
        }
    }
    
    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        
        if (requestCode == 1001) {
            if (grantResults.isNotEmpty() && grantResults[0] == android.content.pm.PackageManager.PERMISSION_GRANTED) {
                statusTextView.text = "Microphone permission granted"
            } else {
                statusTextView.text = "Microphone permission denied"
                voiceButton.disable()
            }
        }
    }
}

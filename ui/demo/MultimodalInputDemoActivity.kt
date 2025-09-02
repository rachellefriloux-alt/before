package com.sallie.ui.demo

import android.os.Bundle
import android.view.View
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.sallie.ai.nlpEngine
import com.sallie.core.input.InputProcessingManager
import com.sallie.core.input.InputResultListener
import com.sallie.core.input.InputType
import com.sallie.core.input.ProcessedInput
import com.sallie.core.input.InputProcessingError
import com.sallie.ui.input.SallieInputBar
import kotlinx.coroutines.launch
import com.google.gson.GsonBuilder
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Demo activity for showcasing Sallie's multimodal input processing system
 */
class MultimodalInputDemoActivity : AppCompatActivity() {

    // UI components
    private lateinit var inputBar: SallieInputBar
    private lateinit var resultText: TextView
    private lateinit var semanticResultText: TextView
    
    // Input processing manager
    private lateinit var inputManager: InputProcessingManager
    
    // Gson for pretty-printing JSON
    private val gson = GsonBuilder().setPrettyPrinting().create()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_multimodal_input_demo)
        
        // Initialize UI components
        inputBar = findViewById(R.id.input_bar)
        resultText = findViewById(R.id.result_text)
        semanticResultText = findViewById(R.id.semantic_result_text)
        
        // Initialize the input manager
        lifecycleScope.launch {
            initializeInputManager()
        }
    }
    
    /**
     * Initialize the input processing manager
     */
    private suspend fun initializeInputManager() {
        withContext(Dispatchers.Default) {
            // Create NLP engine (in a real app, this would be injected)
            val nlpEngine = nlpEngine()
            
            // Create input manager
            inputManager = InputProcessingManager(lifecycleScope, nlpEngine)
            
            // Initialize the input manager
            inputManager.initialize()
            
            // Connect the input manager to the UI
            withContext(Dispatchers.Main) {
                setupInputBar()
            }
        }
    }
    
    /**
     * Set up the input bar
     */
    private fun setupInputBar() {
        // Connect the input bar to the input manager
        inputBar.setInputManager(inputManager)
        
        // Set lifecycle owner for the input bar
        inputBar.setLifecycleOwner(this)
        
        // Listen for input results
        inputBar.setOnInputProcessedListener { processedInput ->
            // Show the processed input
            showProcessedInput(processedInput)
        }
        
        // Register a listener for more detailed updates
        inputManager.registerInputListener(object : InputResultListener {
            override fun onInputResult(result: ProcessedInput) {
                // Show semantic analysis in the semantic result text view
                runOnUiThread {
                    showSemanticAnalysis(result)
                }
            }
            
            override fun onInputError(inputType: InputType, error: InputProcessingError, contextId: String?) {
                // Show error in the result text view
                runOnUiThread {
                    resultText.text = "Error processing ${inputType.name.lowercase()}: ${error.message}"
                }
            }
            
            override val includePartialResults: Boolean
                get() = true // Include partial results
        })
    }
    
    /**
     * Show the processed input in the result text view
     */
    private fun showProcessedInput(input: ProcessedInput) {
        // Create a readable representation of the input
        val sb = StringBuilder()
        
        sb.append("Input ID: ${input.id}\n")
        sb.append("Timestamp: ${input.timestamp}\n")
        sb.append("Type: ${input.sourceType}\n")
        sb.append("Confidence: ${(input.confidence * 100).toInt()}%\n\n")
        
        // Show text content if available
        input.textContent?.let { text ->
            sb.append("Text: ${text.text}\n")
        }
        
        // Show voice content if available
        input.voiceContent?.let { voice ->
            sb.append("Voice transcript: ${voice.transcript}\n")
            sb.append("Language: ${voice.language}\n")
            
            voice.emotionalTone?.let { emotion ->
                sb.append("Emotion: $emotion\n")
            }
        }
        
        // Show image content if available
        input.imageContent?.let { image ->
            sb.append("Image description: ${image.description}\n")
            
            if (image.recognizedObjects.isNotEmpty()) {
                sb.append("Objects: ${image.recognizedObjects.take(3).joinToString { it.label }}")
                if (image.recognizedObjects.size > 3) {
                    sb.append(" and ${image.recognizedObjects.size - 3} more")
                }
                sb.append("\n")
            }
        }
        
        // Update the result text view
        resultText.text = sb.toString()
    }
    
    /**
     * Show semantic analysis in the semantic result text view
     */
    private fun showSemanticAnalysis(input: ProcessedInput) {
        input.semanticAnalysis?.let { analysis ->
            // Format the semantic analysis as pretty JSON
            val semanticJson = gson.toJson(analysis)
            semanticResultText.text = semanticJson
            semanticResultText.visibility = View.VISIBLE
        } ?: run {
            semanticResultText.text = "No semantic analysis available"
            semanticResultText.visibility = View.GONE
        }
    }
}

package com.sallie.core.input

import com.sallie.ai.nlpEngine
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.concurrent.CopyOnWriteArrayList

/**
 * Sallie's Input Processing Manager
 * 
 * This class provides a high-level API for working with input processors
 * and managing input processing for the Sallie system.
 */
class InputProcessingManager(
    private val scope: CoroutineScope,
    private val nlpEngine: com.sallie.ai.nlpEngine
) {

    // The multimodal input processor
    private lateinit var multimodalInputProcessor: MultimodalInputProcessor
    
    // List of input listeners
    private val listeners = CopyOnWriteArrayList<InputResultListener>()
    
    // Shared flow for input events
    private val _inputEvents = MutableSharedFlow<InputEvent>(extraBufferCapacity = 10)
    val inputEvents = _inputEvents.asSharedFlow()
    
    /**
     * Initialize the input processing manager
     */
    suspend fun initialize() {
        withContext(Dispatchers.Default) {
            // Create the multimodal input processor
            multimodalInputProcessor = InputProcessorFactory.createMultimodalInputProcessor(
                scope,
                nlpEngine
            )
            
            // Initialize the multimodal input processor
            multimodalInputProcessor.initialize()
            
            // Register our internal listener
            multimodalInputProcessor.registerInputListener(object : InputListener {
                override fun onInputProcessingStarted(inputType: InputType, contextId: String?) {
                    scope.launch {
                        _inputEvents.emit(InputEvent.ProcessingStarted(inputType, contextId))
                    }
                }
                
                override fun onInputProcessingComplete(processedInput: ProcessedInput) {
                    scope.launch {
                        _inputEvents.emit(InputEvent.ProcessingComplete(processedInput))
                        
                        // Notify listeners
                        listeners.forEach { listener ->
                            listener.onInputResult(processedInput)
                        }
                    }
                }
                
                override fun onPartialInputProcessed(partialInput: ProcessedInput) {
                    scope.launch {
                        _inputEvents.emit(InputEvent.PartialResult(partialInput))
                        
                        // Notify listeners of partial results if they're interested
                        listeners.forEach { listener ->
                            if (listener.includePartialResults) {
                                listener.onInputResult(partialInput)
                            }
                        }
                    }
                }
                
                override fun onInputProcessingError(
                    inputType: InputType,
                    error: InputProcessingError,
                    contextId: String?
                ) {
                    scope.launch {
                        _inputEvents.emit(InputEvent.ProcessingError(inputType, error, contextId))
                        
                        // Notify listeners of errors
                        listeners.forEach { listener ->
                            listener.onInputError(inputType, error, contextId)
                        }
                    }
                }
            })
        }
    }
    
    /**
     * Process text input
     */
    fun processText(text: String, contextId: String? = null): Flow<ProcessedInput> {
        return multimodalInputProcessor.processTextInput(text, contextId)
    }
    
    /**
     * Process voice input
     */
    fun processVoice(audioData: ByteArray, languageHint: String? = null, contextId: String? = null): Flow<ProcessedInput> {
        return multimodalInputProcessor.processVoiceInput(audioData, languageHint, contextId)
    }
    
    /**
     * Process image input
     */
    fun processImage(imageData: ByteArray, contextId: String? = null): Flow<ProcessedInput> {
        return multimodalInputProcessor.processImageInput(imageData, contextId)
    }
    
    /**
     * Process multimodal input
     */
    fun processMultimodal(inputs: Map<InputType, ByteArray>, contextId: String? = null): Flow<ProcessedInput> {
        return multimodalInputProcessor.processMultimodalInput(inputs, contextId)
    }
    
    /**
     * Register an input result listener
     */
    fun registerInputListener(listener: InputResultListener) {
        listeners.add(listener)
    }
    
    /**
     * Unregister an input result listener
     */
    fun unregisterInputListener(listener: InputResultListener) {
        listeners.remove(listener)
    }
    
    /**
     * Get the capabilities of the input processor
     */
    fun getCapabilities(): Set<InputCapability> {
        return multimodalInputProcessor.getCapabilities()
    }
    
    /**
     * Set preprocessing options
     */
    fun setPreprocessingOptions(options: InputPreprocessingOptions) {
        multimodalInputProcessor.setPreprocessingOptions(options)
    }
    
    /**
     * Get current preprocessing options
     */
    fun getPreprocessingOptions(): InputPreprocessingOptions {
        return multimodalInputProcessor.getPreprocessingOptions()
    }
}

/**
 * Interface for listening to input results
 */
interface InputResultListener {
    /**
     * Called when input processing produces a result
     */
    fun onInputResult(result: ProcessedInput)
    
    /**
     * Called when input processing encounters an error
     */
    fun onInputError(inputType: InputType, error: InputProcessingError, contextId: String?)
    
    /**
     * Whether to include partial results in onInputResult calls
     */
    val includePartialResults: Boolean
        get() = false
}

/**
 * Sealed class representing input events
 */
sealed class InputEvent {
    /**
     * Input processing has started
     */
    data class ProcessingStarted(
        val inputType: InputType,
        val contextId: String?
    ) : InputEvent()
    
    /**
     * Input processing is complete
     */
    data class ProcessingComplete(
        val result: ProcessedInput
    ) : InputEvent()
    
    /**
     * Partial result is available
     */
    data class PartialResult(
        val result: ProcessedInput
    ) : InputEvent()
    
    /**
     * Input processing encountered an error
     */
    data class ProcessingError(
        val inputType: InputType,
        val error: InputProcessingError,
        val contextId: String?
    ) : InputEvent()
}

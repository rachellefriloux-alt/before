package com.sallie.core.input

import kotlinx.coroutines.flow.Flow

/**
 * Sallie's Multimodal Input Processing System
 * 
 * This system integrates multiple input modalities (voice, vision, text) into
 * a unified input representation that can be processed by Sallie's cognitive systems.
 * 
 * It provides input abstraction, multimodal fusion, context-aware processing,
 * and error correction across different input sources.
 */
interface MultimodalInputProcessor {
    /**
     * Initialize the input processor
     */
    suspend fun initialize()
    
    /**
     * Process a text input
     * 
     * @param text The text input to process
     * @param contextId Optional context identifier for maintaining conversation context
     * @return A flow of processed input that may include enriched information
     */
    fun processTextInput(text: String, contextId: String? = null): Flow<ProcessedInput>
    
    /**
     * Process voice input
     * 
     * @param audioData Raw audio data as a ByteArray
     * @param languageHint Optional hint about the language
     * @param contextId Optional context identifier for maintaining conversation context
     * @return A flow of processed input that may include transcription and semantic analysis
     */
    fun processVoiceInput(
        audioData: ByteArray, 
        languageHint: String? = null,
        contextId: String? = null
    ): Flow<ProcessedInput>
    
    /**
     * Process image input
     * 
     * @param imageData Raw image data as a ByteArray
     * @param contextId Optional context identifier for maintaining conversation context
     * @return A flow of processed input containing visual analysis and descriptions
     */
    fun processImageInput(imageData: ByteArray, contextId: String? = null): Flow<ProcessedInput>
    
    /**
     * Process a multimodal input combining multiple sources
     * 
     * @param inputs Map of input types to their raw data
     * @param contextId Optional context identifier for maintaining conversation context
     * @return A flow of processed input with fused information from all sources
     */
    fun processMultimodalInput(
        inputs: Map<InputType, ByteArray>,
        contextId: String? = null
    ): Flow<ProcessedInput>
    
    /**
     * Get the current input processing capabilities
     * 
     * @return Set of currently supported input capabilities
     */
    fun getCapabilities(): Set<InputCapability>
    
    /**
     * Register a listener for input events
     * 
     * @param listener The listener to register
     */
    fun registerInputListener(listener: InputListener)
    
    /**
     * Unregister a previously registered input listener
     * 
     * @param listener The listener to unregister
     */
    fun unregisterInputListener(listener: InputListener)
    
    /**
     * Set input preprocessing options
     * 
     * @param options The preprocessing options to apply
     */
    fun setPreprocessingOptions(options: InputPreprocessingOptions)
    
    /**
     * Get the current preprocessing options
     * 
     * @return The current preprocessing options
     */
    fun getPreprocessingOptions(): InputPreprocessingOptions
}

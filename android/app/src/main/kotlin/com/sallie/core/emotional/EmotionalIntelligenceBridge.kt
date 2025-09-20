package com.sallie.core.emotional

/**
 * Sallie 2.0 Module
 * Persona: Tough love meets soul care.
 * Function: Emotional intelligence integration bridge.
 * Got it, love.
 */
import android.content.Context
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.concurrent.ConcurrentHashMap

/**
 * Bridge class that connects all emotional intelligence components together
 * Provides a simplified interface for other modules to interact with the emotional intelligence system
 */
class EmotionalIntelligenceBridge private constructor(
    private val context: Context
) {
    companion object {
        private const val TAG = "EmotionalIntelligenceBridge"
        
        @Volatile
        private var instance: EmotionalIntelligenceBridge? = null
        
        fun getInstance(context: Context): EmotionalIntelligenceBridge {
            return instance ?: synchronized(this) {
                instance ?: EmotionalIntelligenceBridge(context.applicationContext).also { instance = it }
            }
        }
    }
    
    // Component references
    private lateinit var emotionalIntelligenceEngine: EmotionalIntelligenceEngine
    private lateinit var empathicResponseGenerator: EmpathicResponseGenerator
    private lateinit var calibrationSystem: EmotionalCalibrationSystem
    
    // Cache for recent emotional states
    private val recentEmotionalStates = ConcurrentHashMap<String, EmotionalRecognitionResult>()
    
    /**
     * Initialize the bridge and all its components
     */
    suspend fun initialize() = withContext(Dispatchers.Default) {
        // Initialize components in order of dependency
        emotionalIntelligenceEngine = EmotionalIntelligenceEngine.getInstance(context)
        emotionalIntelligenceEngine.initialize()
        
        empathicResponseGenerator = EmpathicResponseGenerator.getInstance(context)
        empathicResponseGenerator.initialize()
        
        calibrationSystem = EmotionalCalibrationSystem.getInstance(context)
        calibrationSystem.initialize()
    }
    
    /**
     * Analyze text input to determine emotional state
     * @param text The user's text input
     * @param conversationContext Optional context from previous interactions
     * @return The recognized emotional state
     */
    suspend fun analyzeEmotionalState(
        text: String,
        conversationContext: String? = null
    ): EmotionalRecognitionResult = withContext(Dispatchers.Default) {
        val result = emotionalIntelligenceEngine.analyzeEmotion(text, conversationContext)
        
        // Cache the result with input as key
        recentEmotionalStates[text] = result
        
        result
    }
    
    /**
     * Generate an empathic response to user input
     * @param text The user's text input
     * @param conversationContext Optional context from previous interactions
     * @param forceResponseType Optional override for response type
     * @return A complete empathic response
     */
    suspend fun generateEmpathicResponse(
        text: String,
        conversationContext: String? = null,
        forceResponseType: ResponseType? = null
    ): EmpathicResponse = withContext(Dispatchers.Default) {
        // Get or analyze emotional state
        val emotionalState = recentEmotionalStates[text] ?: analyzeEmotionalState(text, conversationContext)
        
        // Apply calibration to personality system
        calibrationSystem.applyCalibrationToPersonality()
        
        // Determine optimal response type if not forced
        val responseType = forceResponseType ?: calibrationSystem.determineOptimalResponseType(emotionalState)
        
        // Generate the response
        empathicResponseGenerator.generateResponse(emotionalState, text, responseType)
    }
    
    /**
     * Submit feedback on a response for calibration
     * @param originalText The original user input that received the response
     * @param response The response that was given
     * @param feedback The user's feedback on the response
     * @param followUpText Optional follow-up text from the user to analyze emotional impact
     */
    suspend fun submitResponseFeedback(
        originalText: String,
        response: EmpathicResponse,
        feedback: FeedbackType,
        followUpText: String? = null
    ) = withContext(Dispatchers.Default) {
        // Analyze follow-up text for emotional impact if provided
        val emotionAfterResponse = followUpText?.let {
            analyzeEmotionalState(it)
        }
        
        // Submit feedback to calibration system
        calibrationSystem.processFeedback(response, feedback, emotionAfterResponse)
    }
    
    /**
     * Get calibration analytics data
     */
    fun getCalibrationAnalytics(): CalibrationData {
        return calibrationSystem.getCalibrationData()
    }
    
    /**
     * Reset emotional calibration
     */
    suspend fun resetCalibration() {
        calibrationSystem.resetCalibration()
    }
    
    /**
     * Get trend analysis for a user's emotional patterns
     */
    suspend fun getEmotionalTrends(timeframeMs: Long = 7 * 24 * 60 * 60 * 1000): EmotionalTrendAnalysis {
        return emotionalIntelligenceEngine.analyzeTrends(timeframeMs)
    }
}

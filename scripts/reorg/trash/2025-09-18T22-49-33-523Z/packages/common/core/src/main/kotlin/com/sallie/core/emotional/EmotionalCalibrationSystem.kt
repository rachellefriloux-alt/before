package com.sallie.core.emotional

/**
 * Sallie 2.0 Module
 * Persona: Tough love meets soul care.
 * Function: Emotional calibration system to adjust responses based on user state.
 * Got it, love.
 */
import android.content.Context
import com.sallie.core.memory.HierarchicalMemorySystem
import com.sallie.core.personality.AdvancedPersonalitySystem
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.concurrent.atomic.AtomicInteger
import java.util.concurrent.atomic.AtomicReference

/**
 * System for calibrating emotional responses based on user feedback and interaction patterns
 * This acts as an adaptive layer that fine-tunes the empathic response system over time
 */
class EmotionalCalibrationSystem private constructor(
    private val context: Context
) {
    companion object {
        private const val TAG = "EmotionalCalibrationSystem"
        
        // Thresholds for adjustment
        private const val FEEDBACK_THRESHOLD = 3
        private const val INTERACTION_THRESHOLD = 5
        
        // Calibration parameters
        private const val MAX_COMPASSION_BOOST = 0.3
        private const val MAX_DIRECTNESS_BOOST = 0.3
        private const val CALIBRATION_RATE = 0.05
        
        // Persistence keys
        private const val CALIBRATION_DATA_KEY = "emotional_calibration_data"
        
        @Volatile
        private var instance: EmotionalCalibrationSystem? = null
        
        fun getInstance(context: Context): EmotionalCalibrationSystem {
            return instance ?: synchronized(this) {
                instance ?: EmotionalCalibrationSystem(context.applicationContext).also { instance = it }
            }
        }
    }
    
    private lateinit var emotionalIntelligenceEngine: EmotionalIntelligenceEngine
    private lateinit var personalitySystem: AdvancedPersonalitySystem
    private lateinit var memorySystem: HierarchicalMemorySystem
    private lateinit var empathicResponseGenerator: EmpathicResponseGenerator
    
    // Current calibration state
    private val compassionAdjustment = AtomicReference(0.0)
    private val directnessAdjustment = AtomicReference(0.0)
    private val validationAdjustment = AtomicReference(0.0)
    private val supportAdjustment = AtomicReference(0.0)
    
    // Feedback tracking
    private val positiveResponseCount = AtomicInteger(0)
    private val negativeResponseCount = AtomicInteger(0)
    private val neutralResponseCount = AtomicInteger(0)
    private val totalInteractions = AtomicInteger(0)
    
    // Emotion tracking for calibration
    private val emotionalStateHistory = mutableListOf<EmotionalRecognitionResult>()
    private val responseHistory = mutableListOf<ResponseFeedback>()
    
    /**
     * Initialize dependencies and load calibration data
     */
    suspend fun initialize() {
        emotionalIntelligenceEngine = EmotionalIntelligenceEngine.getInstance(context)
        personalitySystem = AdvancedPersonalitySystem.getInstance(context)
        memorySystem = HierarchicalMemorySystem.getInstance(context)
        empathicResponseGenerator = EmpathicResponseGenerator.getInstance(context)
        
        // Load saved calibration data
        loadCalibrationData()
    }
    
    /**
     * Load saved calibration data from persistence
     */
    private suspend fun loadCalibrationData() = withContext(Dispatchers.IO) {
        if (!::memorySystem.isInitialized) return@withContext
        
        try {
            val calibrationData = memorySystem.retrieve(
                category = "SYSTEM_DATA",
                query = CALIBRATION_DATA_KEY,
                exactMatch = true
            )
            
            calibrationData?.let {
                val metadata = it.metadata
                compassionAdjustment.set(metadata["compassionAdjustment"] as? Double ?: 0.0)
                directnessAdjustment.set(metadata["directnessAdjustment"] as? Double ?: 0.0)
                validationAdjustment.set(metadata["validationAdjustment"] as? Double ?: 0.0)
                supportAdjustment.set(metadata["supportAdjustment"] as? Double ?: 0.0)
                positiveResponseCount.set(metadata["positiveResponseCount"] as? Int ?: 0)
                negativeResponseCount.set(metadata["negativeResponseCount"] as? Int ?: 0)
                neutralResponseCount.set(metadata["neutralResponseCount"] as? Int ?: 0)
                totalInteractions.set(metadata["totalInteractions"] as? Int ?: 0)
            }
        } catch (e: Exception) {
            // If loading fails, use defaults
            resetCalibration()
        }
    }
    
    /**
     * Save current calibration data to persistence
     */
    private suspend fun saveCalibrationData() = withContext(Dispatchers.IO) {
        if (!::memorySystem.isInitialized) return@withContext
        
        val metadata = mapOf(
            "compassionAdjustment" to compassionAdjustment.get(),
            "directnessAdjustment" to directnessAdjustment.get(),
            "validationAdjustment" to validationAdjustment.get(),
            "supportAdjustment" to supportAdjustment.get(),
            "positiveResponseCount" to positiveResponseCount.get(),
            "negativeResponseCount" to negativeResponseCount.get(),
            "neutralResponseCount" to neutralResponseCount.get(),
            "totalInteractions" to totalInteractions.get(),
            "timestamp" to System.currentTimeMillis()
        )
        
        memorySystem.store(
            content = "Emotional calibration data",
            category = "SYSTEM_DATA",
            identifier = CALIBRATION_DATA_KEY,
            metadata = metadata
        )
    }
    
    /**
     * Reset calibration to default values
     */
    suspend fun resetCalibration() {
        compassionAdjustment.set(0.0)
        directnessAdjustment.set(0.0)
        validationAdjustment.set(0.0)
        supportAdjustment.set(0.0)
        positiveResponseCount.set(0)
        negativeResponseCount.set(0)
        neutralResponseCount.set(0)
        totalInteractions.set(0)
        
        emotionalStateHistory.clear()
        responseHistory.clear()
        
        saveCalibrationData()
    }
    
    /**
     * Process user response feedback to calibrate future responses
     */
    suspend fun processFeedback(
        originalResponse: EmpathicResponse,
        feedback: FeedbackType,
        userEmotionAfterResponse: EmotionalRecognitionResult? = null
    ) = withContext(Dispatchers.Default) {
        // Track feedback
        when (feedback) {
            FeedbackType.POSITIVE -> positiveResponseCount.incrementAndGet()
            FeedbackType.NEGATIVE -> negativeResponseCount.incrementAndGet()
            FeedbackType.NEUTRAL -> neutralResponseCount.incrementAndGet()
        }
        
        totalInteractions.incrementAndGet()
        
        // Add to history
        synchronized(emotionalStateHistory) {
            emotionalStateHistory.add(originalResponse.emotionalState)
            if (emotionalStateHistory.size > 20) {
                emotionalStateHistory.removeAt(0)
            }
        }
        
        // Add to response history
        val responseFeedback = ResponseFeedback(
            originalEmotion = originalResponse.emotionalState,
            response = originalResponse.fullResponse,
            feedback = feedback,
            emotionAfterResponse = userEmotionAfterResponse
        )
        
        synchronized(responseHistory) {
            responseHistory.add(responseFeedback)
            if (responseHistory.size > 20) {
                responseHistory.removeAt(0)
            }
        }
        
        // Only calibrate after sufficient feedback
        if (totalInteractions.get() >= INTERACTION_THRESHOLD) {
            calibrateResponseParameters()
            saveCalibrationData()
        }
    }
    
    /**
     * Calibrate response parameters based on accumulated feedback
     */
    private fun calibrateResponseParameters() {
        val feedbackScore = calculateFeedbackScore()
        val emotionalImpactScore = calculateEmotionalImpactScore()
        
        // Adjust calibration parameters
        adjustCompassion(feedbackScore, emotionalImpactScore)
        adjustDirectness(feedbackScore, emotionalImpactScore)
        adjustValidation(feedbackScore, emotionalImpactScore)
        adjustSupport(feedbackScore, emotionalImpactScore)
    }
    
    /**
     * Calculate overall feedback score (-1.0 to 1.0)
     */
    private fun calculateFeedbackScore(): Double {
        val total = positiveResponseCount.get() + negativeResponseCount.get() + neutralResponseCount.get()
        if (total == 0) return 0.0
        
        return (positiveResponseCount.get() - negativeResponseCount.get()).toDouble() / total
    }
    
    /**
     * Calculate emotional impact of responses (-1.0 to 1.0)
     */
    private fun calculateEmotionalImpactScore(): Double {
        if (responseHistory.isEmpty()) return 0.0
        
        var positiveShifts = 0
        var negativeShifts = 0
        var neutralShifts = 0
        
        // Count emotional shifts after responses
        for (response in responseHistory) {
            val before = response.originalEmotion
            val after = response.emotionAfterResponse ?: continue
            
            val beforeIsNegative = isNegativeEmotion(before.primaryEmotion)
            val afterIsNegative = isNegativeEmotion(after.primaryEmotion)
            
            when {
                beforeIsNegative && !afterIsNegative -> positiveShifts++
                !beforeIsNegative && afterIsNegative -> negativeShifts++
                else -> neutralShifts++
            }
        }
        
        val total = positiveShifts + negativeShifts + neutralShifts
        if (total == 0) return 0.0
        
        return (positiveShifts - negativeShifts).toDouble() / total
    }
    
    /**
     * Determine if an emotion is generally negative
     */
    private fun isNegativeEmotion(emotion: Emotion): Boolean {
        return when (emotion) {
            Emotion.SADNESS, Emotion.ANGER, Emotion.FEAR, 
            Emotion.DISAPPOINTMENT, Emotion.FRUSTRATION,
            Emotion.ANXIETY, Emotion.DISGUST, Emotion.GRIEF,
            Emotion.SHAME, Emotion.GUILT -> true
            else -> false
        }
    }
    
    /**
     * Adjust compassion level based on feedback
     */
    private fun adjustCompassion(feedbackScore: Double, emotionalImpactScore: Double) {
        // Count negative emotions in history
        val negativeEmotionCount = emotionalStateHistory.count { isNegativeEmotion(it.primaryEmotion) }
        val needsMoreCompassion = negativeEmotionCount > emotionalStateHistory.size / 2
        
        // Determine adjustment direction
        val direction = when {
            needsMoreCompassion && feedbackScore < 0 -> 1.0  // Increase compassion
            !needsMoreCompassion && feedbackScore < 0 -> -1.0  // Decrease compassion
            else -> feedbackScore  // Use feedback score as direction
        }
        
        // Apply adjustment
        val adjustment = direction * CALIBRATION_RATE
        val currentValue = compassionAdjustment.get()
        val newValue = (currentValue + adjustment).coerceIn(-MAX_COMPASSION_BOOST, MAX_COMPASSION_BOOST)
        compassionAdjustment.set(newValue)
    }
    
    /**
     * Adjust directness level based on feedback
     */
    private fun adjustDirectness(feedbackScore: Double, emotionalImpactScore: Double) {
        // Analyze history for types of responses that got positive feedback
        val positiveFeedbackResponses = responseHistory.filter { it.feedback == FeedbackType.POSITIVE }
        val directResponsesWithPositiveFeedback = positiveFeedbackResponses.count { 
            it.response.contains("clearly") || it.response.contains("directly") || 
            it.response.contains("specifically") || it.response.length < 80
        }
        
        // Determine if direct responses are preferred
        val prefersDirectness = if (positiveFeedbackResponses.isNotEmpty()) {
            directResponsesWithPositiveFeedback > positiveFeedbackResponses.size / 2
        } else {
            false
        }
        
        // Determine adjustment direction
        val direction = when {
            prefersDirectness && feedbackScore < 0 -> 1.0  // Increase directness
            !prefersDirectness && feedbackScore < 0 -> -1.0  // Decrease directness
            else -> feedbackScore / 2  // Use feedback score as direction, but more conservative
        }
        
        // Apply adjustment
        val adjustment = direction * CALIBRATION_RATE
        val currentValue = directnessAdjustment.get()
        val newValue = (currentValue + adjustment).coerceIn(-MAX_DIRECTNESS_BOOST, MAX_DIRECTNESS_BOOST)
        directnessAdjustment.set(newValue)
    }
    
    /**
     * Adjust validation level based on feedback
     */
    private fun adjustValidation(feedbackScore: Double, emotionalImpactScore: Double) {
        // Analyze emotional shifts after validation-heavy responses
        val validationResponses = responseHistory.filter { 
            it.response.contains("valid") || it.response.contains("understandable") ||
            it.response.contains("makes sense")
        }
        
        val validationWithPositiveShift = validationResponses.count { 
            val before = it.originalEmotion
            val after = it.emotionAfterResponse
            
            after != null && 
            isNegativeEmotion(before.primaryEmotion) && 
            !isNegativeEmotion(after.primaryEmotion)
        }
        
        // Determine if validation is effective
        val validationIsEffective = if (validationResponses.isNotEmpty()) {
            validationWithPositiveShift > validationResponses.size / 3
        } else {
            true  // Default to assuming validation works
        }
        
        // Determine adjustment direction
        val direction = when {
            validationIsEffective && emotionalImpactScore < 0 -> 1.0  // Increase validation
            !validationIsEffective && emotionalImpactScore < 0 -> -1.0  // Decrease validation
            else -> emotionalImpactScore / 2  // Use impact score as direction, but more conservative
        }
        
        // Apply adjustment
        val adjustment = direction * CALIBRATION_RATE
        val currentValue = validationAdjustment.get()
        val newValue = (currentValue + adjustment).coerceIn(-0.2, 0.2)
        validationAdjustment.set(newValue)
    }
    
    /**
     * Adjust support level based on feedback
     */
    private fun adjustSupport(feedbackScore: Double, emotionalImpactScore: Double) {
        // Analyze if support messages are getting positive feedback
        val supportResponses = responseHistory.filter { 
            it.response.contains("here for you") || it.response.contains("support") ||
            it.response.contains("together") || it.response.contains("help you")
        }
        
        val supportWithPositiveFeedback = supportResponses.count { it.feedback == FeedbackType.POSITIVE }
        
        // Determine if support is appreciated
        val supportIsAppreciated = if (supportResponses.isNotEmpty()) {
            supportWithPositiveFeedback > supportResponses.size / 2
        } else {
            true  // Default to assuming support works
        }
        
        // Determine adjustment direction
        val direction = when {
            supportIsAppreciated && feedbackScore < 0 -> 1.0  // Increase support
            !supportIsAppreciated && feedbackScore < 0 -> -1.0  // Decrease support
            else -> feedbackScore / 2  // Use feedback score as direction, but more conservative
        }
        
        // Apply adjustment
        val adjustment = direction * CALIBRATION_RATE
        val currentValue = supportAdjustment.get()
        val newValue = (currentValue + adjustment).coerceIn(-0.2, 0.2)
        supportAdjustment.set(newValue)
    }
    
    /**
     * Apply calibration to personality traits
     */
    suspend fun applyCalibrationToPersonality() = withContext(Dispatchers.Default) {
        if (!::personalitySystem.isInitialized) return@withContext
        
        val currentTraits = personalitySystem.getCurrentTraits().toMutableMap()
        
        // Apply calibration adjustments to relevant traits
        currentTraits["COMPASSION"] = (currentTraits["COMPASSION"] ?: 0.7) + compassionAdjustment.get()
        currentTraits["ASSERTIVENESS"] = (currentTraits["ASSERTIVENESS"] ?: 0.6) + directnessAdjustment.get()
        currentTraits["EMOTIONAL_INTELLIGENCE"] = (currentTraits["EMOTIONAL_INTELLIGENCE"] ?: 0.7) + validationAdjustment.get()
        currentTraits["EMPATHY"] = (currentTraits["EMPATHY"] ?: 0.7) + supportAdjustment.get()
        
        // Ensure traits remain in valid range
        currentTraits.forEach { (key, value) ->
            currentTraits[key] = value.coerceIn(0.1, 1.0)
        }
        
        // Update personality with calibrated traits
        personalitySystem.setTemporaryTraitModifiers(currentTraits, "EMOTIONAL_CALIBRATION")
    }
    
    /**
     * Determine the most appropriate response type based on emotional state and history
     */
    fun determineOptimalResponseType(emotionalState: EmotionalRecognitionResult): ResponseType {
        // For highly negative emotions, focus on validation and support
        if (isNegativeEmotion(emotionalState.primaryEmotion) && 
            emotionalState.intensity > 0.7) {
            return if (supportAdjustment.get() > 0) {
                ResponseType.SUPPORT_FOCUSED
            } else {
                ResponseType.VALIDATION_FOCUSED
            }
        }
        
        // For confusion or uncertainty, focus on acknowledgment and encouragement
        if (emotionalState.primaryEmotion == Emotion.CONFUSION ||
            emotionalState.primaryEmotion == Emotion.UNCERTAINTY) {
            return if (directnessAdjustment.get() > 0) {
                ResponseType.ENCOURAGEMENT_FOCUSED
            } else {
                ResponseType.ACKNOWLEDGMENT_FOCUSED
            }
        }
        
        // For positive emotions, focus on acknowledgment
        if (!isNegativeEmotion(emotionalState.primaryEmotion)) {
            return ResponseType.ACKNOWLEDGMENT_FOCUSED
        }
        
        // Default to balanced with slight adjustments based on calibration
        return when {
            compassionAdjustment.get() > 0.15 -> ResponseType.SUPPORT_FOCUSED
            directnessAdjustment.get() > 0.15 -> ResponseType.ENCOURAGEMENT_FOCUSED
            validationAdjustment.get() > 0.15 -> ResponseType.VALIDATION_FOCUSED
            else -> ResponseType.BALANCED
        }
    }
    
    /**
     * Get current calibration data for analytics
     */
    fun getCalibrationData(): CalibrationData {
        return CalibrationData(
            compassionAdjustment = compassionAdjustment.get(),
            directnessAdjustment = directnessAdjustment.get(),
            validationAdjustment = validationAdjustment.get(),
            supportAdjustment = supportAdjustment.get(),
            positiveResponseCount = positiveResponseCount.get(),
            negativeResponseCount = negativeResponseCount.get(),
            neutralResponseCount = neutralResponseCount.get(),
            totalInteractions = totalInteractions.get()
        )
    }
}

/**
 * Feedback types for response calibration
 */
enum class FeedbackType {
    POSITIVE,
    NEUTRAL,
    NEGATIVE
}

/**
 * Response feedback record for calibration
 */
data class ResponseFeedback(
    val originalEmotion: EmotionalRecognitionResult,
    val response: String,
    val feedback: FeedbackType,
    val emotionAfterResponse: EmotionalRecognitionResult?
)

/**
 * Calibration data for analytics and persistence
 */
data class CalibrationData(
    val compassionAdjustment: Double,
    val directnessAdjustment: Double,
    val validationAdjustment: Double,
    val supportAdjustment: Double,
    val positiveResponseCount: Int,
    val negativeResponseCount: Int,
    val neutralResponseCount: Int,
    val totalInteractions: Int
)

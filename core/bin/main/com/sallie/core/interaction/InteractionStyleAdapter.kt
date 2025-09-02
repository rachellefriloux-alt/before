package com.sallie.core.interaction

import com.sallie.core.integration.UserAdaptationEngine
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

/**
 * InteractionStyleAdapter dynamically adjusts Sallie's communication style
 * based on user preferences, context, and relationship state.
 * 
 * This system provides consistent adaptations across different interaction channels
 * while maintaining Sallie's core personality traits and values.
 */
class InteractionStyleAdapter(
    private val userAdaptationEngine: UserAdaptationEngine,
    private val trustBuildingPatterns: TrustBuildingInteractionPatterns
) {
    // Current active style for interactions
    private val _currentStyle = MutableStateFlow(InteractionStyle())
    val currentStyle: StateFlow<InteractionStyle> = _currentStyle
    
    // Tracks contexts that the user has responded well to
    private val effectiveContexts = mutableMapOf<String, InteractionStyle>()
    
    /**
     * Initialize with user preferences
     */
    fun initialize() {
        val userProfile = userAdaptationEngine.getUserProfile()
        val initialStyle = generateStyleFromProfile(userProfile)
        _currentStyle.value = initialStyle
    }
    
    /**
     * Get adapted style for specific interaction context
     */
    fun getStyleForContext(context: InteractionContext): InteractionStyle {
        val baseStyle = _currentStyle.value
        val userProfile = userAdaptationEngine.getUserProfile()
        
        // Check if we have a known effective style for this context
        effectiveContexts[context.topic]?.let { return it }
        
        // Create adapted style based on context and trust pattern
        val trustPattern = trustBuildingPatterns.getRecommendedInteractionPattern(
            TrustBuildingInteractionPatterns.InteractionContext(
                topic = context.topic,
                sensitivity = when(context.sensitivity) {
                    Sensitivity.LOW -> TrustBuildingInteractionPatterns.Sensitivity.LOW
                    Sensitivity.MEDIUM -> TrustBuildingInteractionPatterns.Sensitivity.MEDIUM
                    Sensitivity.HIGH -> TrustBuildingInteractionPatterns.Sensitivity.HIGH
                }
            )
        )
        
        return InteractionStyle(
            formalityLevel = when {
                context.sensitivity == Sensitivity.HIGH -> FormalityLevel.FORMAL
                userProfile.communicationStyle == UserAdaptationEngine.CommunicationStyle.PROFESSIONAL -> FormalityLevel.FORMAL
                userProfile.communicationStyle == UserAdaptationEngine.CommunicationStyle.WARM -> FormalityLevel.CASUAL
                else -> baseStyle.formalityLevel
            },
            expressiveness = when {
                userProfile.communicationStyle == UserAdaptationEngine.CommunicationStyle.WARM -> Expressiveness.HIGH
                userProfile.communicationStyle == UserAdaptationEngine.CommunicationStyle.PROFESSIONAL -> Expressiveness.LOW
                else -> baseStyle.expressiveness
            },
            detailLevel = when {
                context.informationDensity == InformationDensity.HIGH -> DetailLevel.COMPREHENSIVE
                userProfile.communicationStyle == UserAdaptationEngine.CommunicationStyle.DIRECT -> DetailLevel.CONCISE
                else -> baseStyle.detailLevel
            },
            personalTone = when {
                trustPattern.personalTouchLevel == TrustBuildingInteractionPatterns.PersonalTouchLevel.HIGH -> PersonalTone.FRIENDLY
                trustPattern.personalTouchLevel == TrustBuildingInteractionPatterns.PersonalTouchLevel.LOW -> PersonalTone.NEUTRAL
                else -> baseStyle.personalTone
            },
            clarityEmphasis = when {
                context.complexity == Complexity.HIGH -> ClarityEmphasis.HIGH
                else -> baseStyle.clarityEmphasis
            },
            supportiveLanguageLevel = when {
                context.emotionalState == EmotionalState.NEGATIVE -> SupportiveLanguageLevel.HIGH
                else -> baseStyle.supportiveLanguageLevel
            }
        )
    }
    
    /**
     * Apply interaction style to a message
     */
    fun applyStyle(message: String, style: InteractionStyle): String {
        var styledMessage = message
        
        // Apply formality adjustments
        styledMessage = adjustFormality(styledMessage, style.formalityLevel)
        
        // Apply expressiveness
        styledMessage = adjustExpressiveness(styledMessage, style.expressiveness)
        
        // Apply detail level
        styledMessage = adjustDetailLevel(styledMessage, style.detailLevel)
        
        // Apply personal tone
        styledMessage = adjustPersonalTone(styledMessage, style.personalTone)
        
        // Apply clarity emphasis
        styledMessage = adjustClarity(styledMessage, style.clarityEmphasis)
        
        // Apply supportive language
        styledMessage = adjustSupportiveLanguage(styledMessage, style.supportiveLanguageLevel)
        
        return styledMessage
    }
    
    /**
     * Update user preferences based on interaction feedback
     */
    fun recordStyleEffectiveness(context: InteractionContext, style: InteractionStyle, effective: Boolean) {
        if (effective) {
            // Remember this style was effective for this context
            effectiveContexts[context.topic] = style
            
            // Update the base style slightly toward this effective style
            val currentStyle = _currentStyle.value
            _currentStyle.value = currentStyle.blendWith(style, STYLE_LEARNING_RATE)
            
            // Update user adaptation engine
            val communicationStyle = when {
                style.expressiveness == Expressiveness.HIGH && style.personalTone == PersonalTone.FRIENDLY -> 
                    UserAdaptationEngine.CommunicationStyle.WARM
                style.formalityLevel == FormalityLevel.FORMAL && style.expressiveness == Expressiveness.LOW -> 
                    UserAdaptationEngine.CommunicationStyle.PROFESSIONAL
                style.detailLevel == DetailLevel.CONCISE && style.clarityEmphasis == ClarityEmphasis.HIGH -> 
                    UserAdaptationEngine.CommunicationStyle.DIRECT
                else -> UserAdaptationEngine.CommunicationStyle.BALANCED
            }
            
            userAdaptationEngine.updateCommunicationStylePreference(communicationStyle)
        }
    }
    
    /**
     * Private helper methods
     */
     
    private fun generateStyleFromProfile(profile: UserAdaptationEngine.UserProfile): InteractionStyle {
        return InteractionStyle(
            formalityLevel = when (profile.communicationStyle) {
                UserAdaptationEngine.CommunicationStyle.PROFESSIONAL -> FormalityLevel.FORMAL
                UserAdaptationEngine.CommunicationStyle.WARM -> FormalityLevel.CASUAL
                UserAdaptationEngine.CommunicationStyle.DIRECT -> FormalityLevel.NEUTRAL
                else -> FormalityLevel.NEUTRAL
            },
            expressiveness = when (profile.communicationStyle) {
                UserAdaptationEngine.CommunicationStyle.WARM -> Expressiveness.HIGH
                UserAdaptationEngine.CommunicationStyle.PROFESSIONAL -> Expressiveness.LOW
                else -> Expressiveness.BALANCED
            },
            detailLevel = when (profile.communicationStyle) {
                UserAdaptationEngine.CommunicationStyle.DIRECT -> DetailLevel.CONCISE
                UserAdaptationEngine.CommunicationStyle.PROFESSIONAL -> DetailLevel.COMPREHENSIVE
                else -> DetailLevel.BALANCED
            },
            personalTone = when (profile.communicationStyle) {
                UserAdaptationEngine.CommunicationStyle.WARM -> PersonalTone.FRIENDLY
                UserAdaptationEngine.CommunicationStyle.PROFESSIONAL -> PersonalTone.FORMAL
                else -> PersonalTone.NEUTRAL
            },
            clarityEmphasis = ClarityEmphasis.BALANCED,
            supportiveLanguageLevel = SupportiveLanguageLevel.BALANCED
        )
    }
    
    private fun adjustFormality(text: String, level: FormalityLevel): String {
        return when (level) {
            FormalityLevel.CASUAL -> casualizeText(text)
            FormalityLevel.FORMAL -> formalizeText(text)
            FormalityLevel.NEUTRAL -> text
        }
    }
    
    private fun adjustExpressiveness(text: String, expressiveness: Expressiveness): String {
        return when (expressiveness) {
            Expressiveness.HIGH -> addExpression(text)
            Expressiveness.LOW -> reduceExpression(text)
            Expressiveness.BALANCED -> text
        }
    }
    
    private fun adjustDetailLevel(text: String, detailLevel: DetailLevel): String {
        return when (detailLevel) {
            DetailLevel.COMPREHENSIVE -> text // Already detailed
            DetailLevel.CONCISE -> makeTextConcise(text)
            DetailLevel.BALANCED -> text
        }
    }
    
    private fun adjustPersonalTone(text: String, tone: PersonalTone): String {
        return when (tone) {
            PersonalTone.FRIENDLY -> makeTextFriendly(text)
            PersonalTone.FORMAL -> text // Already set by formality
            PersonalTone.NEUTRAL -> neutralizeTone(text)
        }
    }
    
    private fun adjustClarity(text: String, emphasis: ClarityEmphasis): String {
        return when (emphasis) {
            ClarityEmphasis.HIGH -> enhanceClarity(text)
            ClarityEmphasis.BALANCED -> text
        }
    }
    
    private fun adjustSupportiveLanguage(text: String, level: SupportiveLanguageLevel): String {
        return when (level) {
            SupportiveLanguageLevel.HIGH -> addSupportiveLanguage(text)
            SupportiveLanguageLevel.BALANCED, SupportiveLanguageLevel.LOW -> text
        }
    }
    
    // Text transformation helpers
    
    private fun casualizeText(text: String): String {
        var result = text
        // Replace formal phrases with casual ones
        result = result.replace("I would like to", "I'd like to")
        result = result.replace("I will", "I'll")
        result = result.replace("cannot", "can't")
        result = result.replace("It is", "It's")
        // Only make substitutions for the first sentence to keep meaning clear
        val firstSentenceEnd = result.indexOf(". ")
        if (firstSentenceEnd > 0) {
            val firstSentence = result.substring(0, firstSentenceEnd)
            val casualFirstSentence = firstSentence
                .replace("Additionally,", "Also,")
                .replace("Therefore,", "So,")
                .replace("However,", "But,")
            
            result = casualFirstSentence + result.substring(firstSentenceEnd)
        }
        return result
    }
    
    private fun formalizeText(text: String): String {
        var result = text
        // Replace casual phrases with formal ones
        result = result.replace("I'd like to", "I would like to")
        result = result.replace("I'll", "I will")
        result = result.replace("can't", "cannot")
        result = result.replace("don't", "do not")
        result = result.replace("let's", "let us")
        result = result.replace("hey", "hello")
        return result
    }
    
    private fun addExpression(text: String): String {
        // Add positive expressive elements if not already present
        if (!text.contains("!") && !text.contains("Great") && !text.contains("wonderful")) {
            return text.replaceFirst(".", "!")
        }
        return text
    }
    
    private fun reduceExpression(text: String): String {
        // Remove excessive expressiveness
        var result = text
        result = result.replace("!", ".")
        result = result.replace("!!", ".")
        result = result.replace("!!!", ".")
        result = result.replace("Amazing", "Good")
        result = result.replace("Wonderful", "Good")
        result = result.replace("Excellent", "Good")
        result = result.replace("😊", "")
        result = result.replace("😃", "")
        result = result.replace("👍", "")
        return result
    }
    
    private fun makeTextConcise(text: String): String {
        var result = text
        // Find explanatory phrases and remove them
        result = result.replace(Regex("(, which means that|, in other words,)[^.]*"), "")
        result = result.replace(Regex("( For example,)[^.]*\\."), ".")
        result = result.replace(Regex("( To clarify,)[^.]*"), "")
        
        // Remove redundant acknowledgments at the beginning
        result = result.replace(Regex("^(I understand that |Sure, |Of course, |Certainly, )"), "")
        
        return result
    }
    
    private fun makeTextFriendly(text: String): String {
        // If the text doesn't already have friendly elements, add some
        if (!text.contains("😊") && !text.contains("happy to") && !text.contains("glad to")) {
            // Add a friendly opening if there isn't one
            if (!text.startsWith("Hi") && !text.startsWith("Hello")) {
                return "Happy to help! " + text
            }
        }
        return text
    }
    
    private fun neutralizeTone(text: String): String {
        var result = text
        // Remove overly friendly or formal language
        result = result.replace("I'm so happy to", "I'll")
        result = result.replace("I'm delighted to", "I'll")
        result = result.replace("I'm thrilled to", "I'll")
        result = result.replace("I'm honored to", "I'll")
        result = result.replace("😊", "")
        result = result.replace("😃", "")
        result = result.replace("👍", "")
        
        // Remove excessive adverbs
        result = result.replace(" really ", " ")
        result = result.replace(" very ", " ")
        result = result.replace(" extremely ", " ")
        result = result.replace(" absolutely ", " ")
        
        return result
    }
    
    private fun enhanceClarity(text: String): String {
        // If there are complex sentences (based on length and commas), break them down
        val sentences = text.split(". ")
        val clarifiedSentences = sentences.map { sentence -> 
            if (sentence.length > 100 && sentence.count { it == ',' } > 2) {
                // Break down complex sentence with too many commas
                sentence.replace(", ", ". ")
            } else {
                sentence
            }
        }
        return clarifiedSentences.joinToString(". ")
    }
    
    private fun addSupportiveLanguage(text: String): String {
        // If the text doesn't already have supportive elements, add some
        if (!text.contains("understand") && !text.contains("appreciate") && 
            !text.contains("support") && !text.contains("here for you")) {
            return text + "\n\nI'm here to support you through this."
        }
        return text
    }
    
    companion object {
        // Rate at which the system learns from effective styles (0.0-1.0)
        private const val STYLE_LEARNING_RATE = 0.2f
    }
    
    /**
     * Enums and data classes for interaction styling
     */
    
    enum class FormalityLevel {
        CASUAL,
        NEUTRAL,
        FORMAL
    }
    
    enum class Expressiveness {
        LOW,
        BALANCED,
        HIGH
    }
    
    enum class DetailLevel {
        CONCISE,
        BALANCED,
        COMPREHENSIVE
    }
    
    enum class PersonalTone {
        NEUTRAL,
        FRIENDLY,
        FORMAL
    }
    
    enum class ClarityEmphasis {
        BALANCED,
        HIGH
    }
    
    enum class SupportiveLanguageLevel {
        LOW,
        BALANCED,
        HIGH
    }
    
    enum class Sensitivity {
        LOW,
        MEDIUM,
        HIGH
    }
    
    enum class Complexity {
        LOW,
        MEDIUM,
        HIGH
    }
    
    enum class InformationDensity {
        LOW,
        MEDIUM,
        HIGH
    }
    
    enum class EmotionalState {
        POSITIVE,
        NEUTRAL,
        NEGATIVE
    }
    
    data class InteractionContext(
        val topic: String,
        val sensitivity: Sensitivity = Sensitivity.MEDIUM,
        val complexity: Complexity = Complexity.MEDIUM,
        val informationDensity: InformationDensity = InformationDensity.MEDIUM,
        val emotionalState: EmotionalState = EmotionalState.NEUTRAL
    )
    
    data class InteractionStyle(
        val formalityLevel: FormalityLevel = FormalityLevel.NEUTRAL,
        val expressiveness: Expressiveness = Expressiveness.BALANCED,
        val detailLevel: DetailLevel = DetailLevel.BALANCED,
        val personalTone: PersonalTone = PersonalTone.NEUTRAL,
        val clarityEmphasis: ClarityEmphasis = ClarityEmphasis.BALANCED,
        val supportiveLanguageLevel: SupportiveLanguageLevel = SupportiveLanguageLevel.BALANCED
    ) {
        /**
         * Create a new style that is a blend of this style and another style
         */
        fun blendWith(other: InteractionStyle, blendRate: Float): InteractionStyle {
            // Only blend at the specified rate - if blendRate is 0.2,
            // we take 80% of current style and 20% of other style
            val keepRate = 1 - blendRate
            
            // Only change style if it's different
            return InteractionStyle(
                formalityLevel = if (Math.random() < blendRate && formalityLevel != other.formalityLevel) 
                    other.formalityLevel else formalityLevel,
                expressiveness = if (Math.random() < blendRate && expressiveness != other.expressiveness)
                    other.expressiveness else expressiveness,
                detailLevel = if (Math.random() < blendRate && detailLevel != other.detailLevel)
                    other.detailLevel else detailLevel,
                personalTone = if (Math.random() < blendRate && personalTone != other.personalTone)
                    other.personalTone else personalTone,
                clarityEmphasis = if (Math.random() < blendRate && clarityEmphasis != other.clarityEmphasis)
                    other.clarityEmphasis else clarityEmphasis,
                supportiveLanguageLevel = if (Math.random() < blendRate && supportiveLanguageLevel != other.supportiveLanguageLevel)
                    other.supportiveLanguageLevel else supportiveLanguageLevel
            )
        }
    }
}

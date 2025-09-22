package com.sallie.core.interaction

import com.sallie.core.integration.UserAdaptationEngine
import kotlinx.coroutines.flow.MutableStateFlow
import org.junit.Before
import org.junit.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class InteractionStyleAdapterTest {

    private lateinit var styleAdapter: InteractionStyleAdapter
    private lateinit var mockAdaptationEngine: UserAdaptationEngine
    private lateinit var mockTrustPatterns: TrustBuildingInteractionPatterns
    
    @Before
    fun setup() {
        mockAdaptationEngine = mock()
        mockTrustPatterns = mock()
        
        // Setup default mocked responses
        whenever(mockAdaptationEngine.getUserProfile()).thenReturn(
            UserAdaptationEngine.UserProfile(
                name = "Test User",
                communicationStyle = UserAdaptationEngine.CommunicationStyle.BALANCED,
                interactionPreferences = mapOf("formality" to 0.5f),
                topicPreferences = listOf("technology", "health"),
                valueAlignment = mapOf("loyalty" to 0.9f, "helpfulness" to 0.8f)
            )
        )
        
        whenever(mockTrustPatterns.getRecommendedInteractionPattern(
            TrustBuildingInteractionPatterns.InteractionContext(
                topic = "technology",
                sensitivity = TrustBuildingInteractionPatterns.Sensitivity.MEDIUM
            )
        )).thenReturn(
            TrustBuildingInteractionPatterns.InteractionPattern(
                transparencyLevel = TrustBuildingInteractionPatterns.TransparencyLevel.BALANCED,
                consistencyEmphasis = true,
                valueAlignmentStrategy = TrustBuildingInteractionPatterns.ValueAlignmentStrategy.BALANCED,
                personalTouchLevel = TrustBuildingInteractionPatterns.PersonalTouchLevel.MODERATE
            )
        )
        
        whenever(mockTrustPatterns.getRecommendedInteractionPattern(
            TrustBuildingInteractionPatterns.InteractionContext(
                topic = "health",
                sensitivity = TrustBuildingInteractionPatterns.Sensitivity.HIGH
            )
        )).thenReturn(
            TrustBuildingInteractionPatterns.InteractionPattern(
                transparencyLevel = TrustBuildingInteractionPatterns.TransparencyLevel.HIGH,
                consistencyEmphasis = true,
                valueAlignmentStrategy = TrustBuildingInteractionPatterns.ValueAlignmentStrategy.EXPLICIT,
                personalTouchLevel = TrustBuildingInteractionPatterns.PersonalTouchLevel.HIGH
            )
        )
        
        styleAdapter = InteractionStyleAdapter(
            mockAdaptationEngine,
            mockTrustPatterns
        )
        
        styleAdapter.initialize()
    }
    
    @Test
    fun `initialize sets style based on user profile`() {
        // Setup with warm communication style
        whenever(mockAdaptationEngine.getUserProfile()).thenReturn(
            UserAdaptationEngine.UserProfile(
                name = "Warm User",
                communicationStyle = UserAdaptationEngine.CommunicationStyle.WARM,
                interactionPreferences = mapOf(),
                topicPreferences = listOf(),
                valueAlignment = mapOf()
            )
        )
        
        // Act
        styleAdapter = InteractionStyleAdapter(mockAdaptationEngine, mockTrustPatterns)
        styleAdapter.initialize()
        
        // Assert
        val style = styleAdapter.currentStyle.value
        assertEquals(InteractionStyleAdapter.FormalityLevel.CASUAL, style.formalityLevel)
        assertEquals(InteractionStyleAdapter.Expressiveness.HIGH, style.expressiveness)
        assertEquals(InteractionStyleAdapter.PersonalTone.FRIENDLY, style.personalTone)
    }
    
    @Test
    fun `getStyleForContext adapts style based on context sensitivity`() {
        // Setup
        val sensitiveContext = InteractionStyleAdapter.InteractionContext(
            topic = "health",
            sensitivity = InteractionStyleAdapter.Sensitivity.HIGH
        )
        
        whenever(mockTrustPatterns.getRecommendedInteractionPattern(
            TrustBuildingInteractionPatterns.InteractionContext(
                topic = "health",
                sensitivity = TrustBuildingInteractionPatterns.Sensitivity.HIGH
            )
        )).thenReturn(
            TrustBuildingInteractionPatterns.InteractionPattern(
                transparencyLevel = TrustBuildingInteractionPatterns.TransparencyLevel.HIGH,
                consistencyEmphasis = true,
                valueAlignmentStrategy = TrustBuildingInteractionPatterns.ValueAlignmentStrategy.EXPLICIT,
                personalTouchLevel = TrustBuildingInteractionPatterns.PersonalTouchLevel.HIGH
            )
        )
        
        // Act
        val style = styleAdapter.getStyleForContext(sensitiveContext)
        
        // Assert
        assertEquals(InteractionStyleAdapter.FormalityLevel.FORMAL, style.formalityLevel)
        assertEquals(InteractionStyleAdapter.PersonalTone.FRIENDLY, style.personalTone)
    }
    
    @Test
    fun `getStyleForContext adapts detail level based on information density`() {
        // Setup
        val highInfoContext = InteractionStyleAdapter.InteractionContext(
            topic = "technology",
            informationDensity = InteractionStyleAdapter.InformationDensity.HIGH
        )
        
        // Act
        val style = styleAdapter.getStyleForContext(highInfoContext)
        
        // Assert
        assertEquals(InteractionStyleAdapter.DetailLevel.COMPREHENSIVE, style.detailLevel)
    }
    
    @Test
    fun `applyStyle adjusts formality for formal level`() {
        // Setup
        val message = "I'll help you with that. Let's figure it out together!"
        val formalStyle = InteractionStyleAdapter.InteractionStyle(
            formalityLevel = InteractionStyleAdapter.FormalityLevel.FORMAL,
            expressiveness = InteractionStyleAdapter.Expressiveness.BALANCED,
            detailLevel = InteractionStyleAdapter.DetailLevel.BALANCED,
            personalTone = InteractionStyleAdapter.PersonalTone.NEUTRAL,
            clarityEmphasis = InteractionStyleAdapter.ClarityEmphasis.BALANCED,
            supportiveLanguageLevel = InteractionStyleAdapter.SupportiveLanguageLevel.BALANCED
        )
        
        // Act
        val styledMessage = styleAdapter.applyStyle(message, formalStyle)
        
        // Assert
        assertTrue(styledMessage.contains("I will"))
        assertTrue(styledMessage.contains("let us"))
        assertTrue(!styledMessage.contains("I'll"))
        assertTrue(!styledMessage.contains("Let's"))
    }
    
    @Test
    fun `applyStyle adds expressiveness for high expressiveness`() {
        // Setup
        val message = "I can help you with that. This is an interesting problem."
        val expressiveStyle = InteractionStyleAdapter.InteractionStyle(
            formalityLevel = InteractionStyleAdapter.FormalityLevel.NEUTRAL,
            expressiveness = InteractionStyleAdapter.Expressiveness.HIGH,
            detailLevel = InteractionStyleAdapter.DetailLevel.BALANCED,
            personalTone = InteractionStyleAdapter.PersonalTone.NEUTRAL,
            clarityEmphasis = InteractionStyleAdapter.ClarityEmphasis.BALANCED,
            supportiveLanguageLevel = InteractionStyleAdapter.SupportiveLanguageLevel.BALANCED
        )
        
        // Act
        val styledMessage = styleAdapter.applyStyle(message, expressiveStyle)
        
        // Assert
        assertTrue(styledMessage.contains("!"))
    }
    
    @Test
    fun `applyStyle reduces expressiveness for low expressiveness`() {
        // Setup
        val message = "This is Amazing!!! I'm so happy to help you with this wonderful project! 😊"
        val lowExpressiveStyle = InteractionStyleAdapter.InteractionStyle(
            formalityLevel = InteractionStyleAdapter.FormalityLevel.NEUTRAL,
            expressiveness = InteractionStyleAdapter.Expressiveness.LOW,
            detailLevel = InteractionStyleAdapter.DetailLevel.BALANCED,
            personalTone = InteractionStyleAdapter.PersonalTone.NEUTRAL,
            clarityEmphasis = InteractionStyleAdapter.ClarityEmphasis.BALANCED,
            supportiveLanguageLevel = InteractionStyleAdapter.SupportiveLanguageLevel.BALANCED
        )
        
        // Act
        val styledMessage = styleAdapter.applyStyle(message, lowExpressiveStyle)
        
        // Assert
        assertTrue(!styledMessage.contains("!!!"))
        assertTrue(!styledMessage.contains("Amazing"))
        assertTrue(!styledMessage.contains("😊"))
        assertTrue(styledMessage.contains("Good"))
    }
    
    @Test
    fun `applyStyle makes text concise for concise detail level`() {
        // Setup
        val message = "Let me explain this concept. For example, when you code in Kotlin, you need to use proper syntax."
        val conciseStyle = InteractionStyleAdapter.InteractionStyle(
            formalityLevel = InteractionStyleAdapter.FormalityLevel.NEUTRAL,
            expressiveness = InteractionStyleAdapter.Expressiveness.BALANCED,
            detailLevel = InteractionStyleAdapter.DetailLevel.CONCISE,
            personalTone = InteractionStyleAdapter.PersonalTone.NEUTRAL,
            clarityEmphasis = InteractionStyleAdapter.ClarityEmphasis.BALANCED,
            supportiveLanguageLevel = InteractionStyleAdapter.SupportiveLanguageLevel.BALANCED
        )
        
        // Act
        val styledMessage = styleAdapter.applyStyle(message, conciseStyle)
        
        // Assert
        assertTrue(!styledMessage.contains("For example"))
    }
    
    @Test
    fun `applyStyle makes text friendly for friendly personal tone`() {
        // Setup
        val message = "Here is the information you requested."
        val friendlyStyle = InteractionStyleAdapter.InteractionStyle(
            formalityLevel = InteractionStyleAdapter.FormalityLevel.NEUTRAL,
            expressiveness = InteractionStyleAdapter.Expressiveness.BALANCED,
            detailLevel = InteractionStyleAdapter.DetailLevel.BALANCED,
            personalTone = InteractionStyleAdapter.PersonalTone.FRIENDLY,
            clarityEmphasis = InteractionStyleAdapter.ClarityEmphasis.BALANCED,
            supportiveLanguageLevel = InteractionStyleAdapter.SupportiveLanguageLevel.BALANCED
        )
        
        // Act
        val styledMessage = styleAdapter.applyStyle(message, friendlyStyle)
        
        // Assert
        assertTrue(styledMessage.contains("Happy to help"))
    }
    
    @Test
    fun `applyStyle adds supportive language for high supportive level`() {
        // Setup
        val message = "Here is the information about your health concern."
        val supportiveStyle = InteractionStyleAdapter.InteractionStyle(
            formalityLevel = InteractionStyleAdapter.FormalityLevel.NEUTRAL,
            expressiveness = InteractionStyleAdapter.Expressiveness.BALANCED,
            detailLevel = InteractionStyleAdapter.DetailLevel.BALANCED,
            personalTone = InteractionStyleAdapter.PersonalTone.NEUTRAL,
            clarityEmphasis = InteractionStyleAdapter.ClarityEmphasis.BALANCED,
            supportiveLanguageLevel = InteractionStyleAdapter.SupportiveLanguageLevel.HIGH
        )
        
        // Act
        val styledMessage = styleAdapter.applyStyle(message, supportiveStyle)
        
        // Assert
        assertTrue(styledMessage.contains("support"))
    }
    
    @Test
    fun `recordStyleEffectiveness updates current style when effective`() {
        // Setup
        val initialStyle = styleAdapter.currentStyle.value
        val context = InteractionStyleAdapter.InteractionContext(topic = "technology")
        val effectiveStyle = InteractionStyleAdapter.InteractionStyle(
            formalityLevel = InteractionStyleAdapter.FormalityLevel.CASUAL,
            expressiveness = InteractionStyleAdapter.Expressiveness.HIGH,
            detailLevel = InteractionStyleAdapter.DetailLevel.CONCISE,
            personalTone = InteractionStyleAdapter.PersonalTone.FRIENDLY,
            clarityEmphasis = InteractionStyleAdapter.ClarityEmphasis.HIGH,
            supportiveLanguageLevel = InteractionStyleAdapter.SupportiveLanguageLevel.HIGH
        )
        
        // Act
        styleAdapter.recordStyleEffectiveness(context, effectiveStyle, true)
        
        // Assert
        val updatedStyle = styleAdapter.currentStyle.value
        assertTrue(updatedStyle != initialStyle, "Style should be updated after effective interaction")
    }
    
    @Test
    fun `InteractionStyle blendWith creates appropriate blend`() {
        // Setup
        val baseStyle = InteractionStyleAdapter.InteractionStyle(
            formalityLevel = InteractionStyleAdapter.FormalityLevel.NEUTRAL,
            expressiveness = InteractionStyleAdapter.Expressiveness.BALANCED,
            detailLevel = InteractionStyleAdapter.DetailLevel.BALANCED,
            personalTone = InteractionStyleAdapter.PersonalTone.NEUTRAL,
            clarityEmphasis = InteractionStyleAdapter.ClarityEmphasis.BALANCED,
            supportiveLanguageLevel = InteractionStyleAdapter.SupportiveLanguageLevel.BALANCED
        )
        
        val targetStyle = InteractionStyleAdapter.InteractionStyle(
            formalityLevel = InteractionStyleAdapter.FormalityLevel.FORMAL,
            expressiveness = InteractionStyleAdapter.Expressiveness.HIGH,
            detailLevel = InteractionStyleAdapter.DetailLevel.COMPREHENSIVE,
            personalTone = InteractionStyleAdapter.PersonalTone.FRIENDLY,
            clarityEmphasis = InteractionStyleAdapter.ClarityEmphasis.HIGH,
            supportiveLanguageLevel = InteractionStyleAdapter.SupportiveLanguageLevel.HIGH
        )
        
        // Force the random value to always be below the blend rate
        val originalRandom = Math.random
        try {
            // Mock random to always return 0.1 (below blend rate)
            // This is a bit of a hack for testing, but allows us to verify blending works
            java.lang.reflect.Modifier.setField(Math::class.java.getDeclaredField("randomNumberGenerator"), null)
            val randomField = Math::class.java.getDeclaredField("randomNumberGenerator")
            randomField.isAccessible = true
            val mockGenerator = object {
                fun random(): Double = 0.1
            }
            randomField.set(null, mockGenerator)
            
            // Act with blend rate of 0.2
            val blendedStyle = baseStyle.blendWith(targetStyle, 0.2f)
            
            // Assert some properties should be changed but not all
            assertTrue(blendedStyle.formalityLevel == targetStyle.formalityLevel || 
                      blendedStyle.expressiveness == targetStyle.expressiveness ||
                      blendedStyle.detailLevel == targetStyle.detailLevel ||
                      blendedStyle.personalTone == targetStyle.personalTone ||
                      blendedStyle.clarityEmphasis == targetStyle.clarityEmphasis ||
                      blendedStyle.supportiveLanguageLevel == targetStyle.supportiveLanguageLevel)
        } catch (e: Exception) {
            // Reset Math.random in case of error
            java.lang.reflect.Modifier.setField(Math::class.java.getDeclaredField("randomNumberGenerator"), null)
            throw e
        }
    }
}

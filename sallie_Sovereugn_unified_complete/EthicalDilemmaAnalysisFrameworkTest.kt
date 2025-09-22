package com.sallie.core.values

import com.sallie.core.integration.UserProfileLearningSystem
import com.sallie.core.memory.HierarchicalMemorySystem
import com.sallie.core.values.models.*
import io.mockk.*
import io.mockk.impl.annotations.MockK
import org.junit.Before
import org.junit.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

class EthicalDilemmaAnalysisFrameworkTest {
    
    @MockK
    lateinit var proLifeValuesSystem: ProLifeValuesSystem
    
    @MockK
    lateinit var valueConflictResolver: ValueConflictResolutionFramework
    
    @MockK
    lateinit var valuePrecedentSystem: ValuePrecedentLearningSystem
    
    @MockK
    lateinit var memorySystem: HierarchicalMemorySystem
    
    @MockK
    lateinit var userProfileLearningSystem: UserProfileLearningSystem
    
    private lateinit var ethicalDilemmaAnalysisFramework: EthicalDilemmaAnalysisFramework
    
    // Test data
    private val proLifeValue = CoreValue(
        id = "value_pro_life",
        name = "Pro-Life",
        description = "Respecting and valuing all human life from conception",
        importance = ValueImportance.HIGH,
        isImmutable = true,
        category = ValueCategory.UNIVERSAL,
        keywords = listOf("life", "pro-life", "conception", "unborn")
    )
    
    private val loyaltyValue = CoreValue(
        id = "value_loyalty",
        name = "Loyalty",
        description = "Being faithful and committed to those we care about",
        importance = ValueImportance.HIGH,
        isImmutable = false,
        category = ValueCategory.TRADITIONAL,
        keywords = listOf("loyalty", "faithful", "committed", "allegiance")
    )
    
    private val honestyValue = CoreValue(
        id = "value_honesty",
        name = "Honesty",
        description = "Being truthful and transparent in communication",
        importance = ValueImportance.HIGH,
        isImmutable = false,
        category = ValueCategory.UNIVERSAL,
        keywords = listOf("honesty", "truth", "transparent", "genuine")
    )
    
    private val allValues = listOf(proLifeValue, loyaltyValue, honestyValue)
    
    private val traditionalValues = listOf(loyaltyValue)
    private val modernValues = listOf<CoreValue>()
    
    @Before
    fun setUp() {
        MockKAnnotations.init(this)
        
        // Mock valuesSystem behavior
        every { proLifeValuesSystem.getProLifeValue() } returns proLifeValue
        every { proLifeValuesSystem.getLoyaltyValue() } returns loyaltyValue
        every { proLifeValuesSystem.getAllValues() } returns allValues
        every { proLifeValuesSystem.getTraditionalValues() } returns traditionalValues
        every { proLifeValuesSystem.getModernValues() } returns modernValues
        every { proLifeValuesSystem.evaluateActionAlignment(any(), any()) } returns 0.8
        every { proLifeValuesSystem.assessValueViolationLikelihood(any(), any()) } returns 0.2
        
        // Mock userProfileLearningSystem
        val userProfile = mockk<UserProfile>()
        val valuePreferences = mutableMapOf<String, Double>()
        valuePreferences["Pro-Life"] = 0.9
        valuePreferences["Loyalty"] = 0.8
        valuePreferences["Honesty"] = 0.7
        every { userProfile.valuePreferences } returns valuePreferences
        every { userProfileLearningSystem.getUserProfile() } returns userProfile
        
        // Mock memorySystem
        every { memorySystem.findSimilarActions(any()) } returns listOf("similar action")
        every { memorySystem.getConsequencesOfAction(any()) } returns emptyList()
        every { memorySystem.storeInEpisodic(any(), any(), any(), any()) } just runs
        
        // Mock valuePrecedentSystem
        every { valuePrecedentSystem.findRelevantPrecedents(any(), any(), any()) } returns emptyList()
        every { valuePrecedentSystem.recordDilemmaResolution(any(), any(), any(), any()) } just runs
        
        // Mock valueConflictResolver
        every { valueConflictResolver.resolveConflicts(any()) } returns emptyList()
        
        // Create the framework with mocks
        ethicalDilemmaAnalysisFramework = EthicalDilemmaAnalysisFramework(
            proLifeValuesSystem,
            valueConflictResolver,
            valuePrecedentSystem,
            memorySystem,
            userProfileLearningSystem
        )
    }
    
    @Test
    fun `analyzeDilemma returns complete analysis result`() {
        // Create test dilemma
        val dilemma = EthicalDilemma(
            description = "Should I tell my friend an uncomfortable truth or protect their feelings?",
            context = "Personal relationship situation",
            possibleActions = listOf(
                PossibleAction(
                    description = "Tell the complete truth regardless of emotional impact",
                    category = "honesty"
                ),
                PossibleAction(
                    description = "Soften the truth to protect their feelings",
                    category = "kindness"
                ),
                PossibleAction(
                    description = "Avoid the topic entirely",
                    category = "avoidance"
                )
            )
        )
        
        // Analyze the dilemma
        val result = ethicalDilemmaAnalysisFramework.analyzeDilemma(dilemma)
        
        // Verify result
        assertNotNull(result)
        assertEquals(dilemma, result.dilemma)
        assertTrue(result.coreValuesAtStake.isNotEmpty())
        assertTrue(result.evaluatedActions.isNotEmpty())
        assertEquals(dilemma.possibleActions.size, result.evaluatedActions.size)
        
        // Verify interactions
        verify { proLifeValuesSystem.getProLifeValue() }
        verify { proLifeValuesSystem.getAllValues() }
        verify { userProfileLearningSystem.getUserProfile() }
        verify { valuePrecedentSystem.findRelevantPrecedents(any(), any(), any()) }
        verify { valuePrecedentSystem.recordDilemmaResolution(any(), any(), any(), any()) }
        verify { memorySystem.storeInEpisodic(any(), any(), any(), any()) }
    }
    
    @Test
    fun `analyzeDilemma correctly identifies core values at stake`() {
        // Create test dilemma that specifically mentions honesty
        val dilemma = EthicalDilemma(
            description = "This is a dilemma about honesty and loyalty in a difficult situation.",
            context = "Personal relationship",
            possibleActions = listOf(
                PossibleAction(
                    description = "Be completely honest",
                    category = "honesty"
                ),
                PossibleAction(
                    description = "Prioritize loyalty over complete disclosure",
                    category = "loyalty"
                )
            )
        )
        
        // Analyze the dilemma
        val result = ethicalDilemmaAnalysisFramework.analyzeDilemma(dilemma)
        
        // Verify core values identified include those mentioned in the dilemma
        val valueNames = result.coreValuesAtStake.map { it.name }
        assertTrue("Pro-Life" in valueNames) // Always included as foundational
        assertTrue("Loyalty" in valueNames) // Mentioned in dilemma
        assertTrue("Honesty" in valueNames) // Mentioned in dilemma
    }
    
    @Test
    fun `analyzeDilemma generates multiple ethical perspectives`() {
        val dilemma = EthicalDilemma(
            description = "Should I prioritize personal autonomy or family expectations?",
            context = "Life decision",
            possibleActions = listOf(
                PossibleAction(
                    description = "Follow personal desires regardless of family wishes",
                    category = "autonomy"
                ),
                PossibleAction(
                    description = "Conform to family expectations",
                    category = "tradition"
                )
            )
        )
        
        // Analyze the dilemma
        val result = ethicalDilemmaAnalysisFramework.analyzeDilemma(dilemma)
        
        // Verify multiple perspectives generated
        assertTrue(result.perspectives.size >= 4) // Should generate at least basic perspectives
        
        // Verify core perspective types
        val perspectiveTypes = result.perspectives.map { it.name }
        assertTrue("Traditional Values" in perspectiveTypes)
        assertTrue("Modern Values" in perspectiveTypes)
        assertTrue("Loyalty" in perspectiveTypes)
        assertTrue("Pro-Life Values" in perspectiveTypes)
    }
    
    @Test
    fun `analyzeDilemma incorporates user values while preserving immutable values`() {
        // Create test dilemma
        val dilemma = EthicalDilemma(
            description = "Complex ethical situation involving multiple values",
            context = "Personal decision",
            possibleActions = listOf(
                PossibleAction(
                    description = "Option that strongly aligns with pro-life values",
                    category = "pro-life"
                ),
                PossibleAction(
                    description = "Option that aligns with other values but less with pro-life",
                    category = "mixed"
                )
            )
        )
        
        // Mock specific user preferences that might try to override immutable values
        val userProfile = mockk<UserProfile>()
        val valuePreferences = mutableMapOf<String, Double>()
        valuePreferences["Pro-Life"] = -0.5 // User tries to devalue pro-life
        valuePreferences["Loyalty"] = 0.9 // User highly values loyalty
        every { userProfile.valuePreferences } returns valuePreferences
        every { userProfileLearningSystem.getUserProfile() } returns userProfile
        
        // Analyze the dilemma
        val result = ethicalDilemmaAnalysisFramework.analyzeDilemma(dilemma)
        
        // Verify pro-life values are still prioritized despite user preference
        assertNotNull(result.recommendedAction)
        
        // Verify explanation mentions pro-life values
        assertTrue(result.explanation.contains("pro-life values", ignoreCase = true))
    }
    
    @Test
    fun `analyzeDilemma correctly identifies potential consequences`() {
        // Create test dilemma with actions that have clear consequences
        val dilemma = EthicalDilemma(
            description = "Should I take an action with clear negative consequences?",
            context = "Ethical decision",
            possibleActions = listOf(
                PossibleAction(
                    description = "Take action that could harm others",
                    category = "harmful"
                ),
                PossibleAction(
                    description = "Take action that will benefit everyone involved",
                    category = "beneficial"
                )
            )
        )
        
        // Analyze the dilemma
        val result = ethicalDilemmaAnalysisFramework.analyzeDilemma(dilemma)
        
        // Get evaluated actions
        val harmfulAction = result.evaluatedActions.find { 
            it.action.description.contains("harm") 
        }
        
        val beneficialAction = result.evaluatedActions.find { 
            it.action.description.contains("benefit") 
        }
        
        // Verify consequences were identified
        assertNotNull(harmfulAction)
        assertNotNull(beneficialAction)
        
        assertTrue(harmfulAction!!.potentialConsequences.isNotEmpty())
        assertTrue(beneficialAction!!.potentialConsequences.isNotEmpty())
        
        // Verify harmful action has at least one high severity consequence
        assertTrue(harmfulAction.potentialConsequences.any { 
            it.severity == ConsequenceSeverity.HIGH 
        })
    }
    
    @Test
    fun `analyzeDilemma applies value precedents when available`() {
        // Create test dilemma
        val dilemma = EthicalDilemma(
            description = "Ethical dilemma with precedents",
            context = "Decision",
            possibleActions = listOf(
                PossibleAction(
                    description = "Option A with precedent",
                    category = "A"
                ),
                PossibleAction(
                    description = "Option B without precedent",
                    category = "B"
                )
            )
        )
        
        // Mock precedent for Option A
        val precedent = ValuePrecedent(
            id = "precedent_1",
            dilemma = "Similar past dilemma",
            action = "Option A with precedent",
            values = listOf("Pro-Life", "Loyalty"),
            reasoning = "This worked well before",
            wasSuccessful = true,
            timestamp = System.currentTimeMillis() - 10000
        )
        
        every { valuePrecedentSystem.findRelevantPrecedents(any(), any(), any()) } returns listOf(precedent)
        
        // Analyze the dilemma
        val result = ethicalDilemmaAnalysisFramework.analyzeDilemma(dilemma)
        
        // Verify precedents were applied
        assertEquals(1, result.relevantPrecedents.size)
        assertEquals(precedent, result.relevantPrecedents[0])
        
        // Verify successful precedent increased likelihood of selecting that option
        val optionWithPrecedent = dilemma.possibleActions[0]
        assertEquals(optionWithPrecedent, result.recommendedAction)
    }
}

/**
 * Placeholder for testing - would be properly implemented in the actual system
 */
data class UserProfile(
    val valuePreferences: Map<String, Double> = emptyMap()
)

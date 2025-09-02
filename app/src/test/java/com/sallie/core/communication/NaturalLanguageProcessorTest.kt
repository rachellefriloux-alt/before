package com.sallie.core.communication

import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.TestCoroutineDispatcher
import kotlinx.coroutines.test.TestCoroutineScope
import kotlinx.coroutines.test.runBlockingTest
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.Mock
import org.mockito.MockitoAnnotations
import org.mockito.junit.MockitoJUnitRunner
import com.sallie.core.nlp.NLPResult
import com.sallie.core.nlp.IntentClassificationResult
import com.sallie.core.nlp.EntityExtractionResult
import com.sallie.core.nlp.SentimentAnalysisResult

@ExperimentalCoroutinesApi
@RunWith(MockitoJUnitRunner::class)
class NaturalLanguageProcessorTest {

    private val testDispatcher = TestCoroutineDispatcher()
    private val testScope = TestCoroutineScope(testDispatcher)

    private lateinit var nlpProcessor: NaturalLanguageProcessor

    @Before
    fun setup() {
        MockitoAnnotations.initMocks(this)
        nlpProcessor = NaturalLanguageProcessor(testScope)
    }

    @After
    fun tearDown() {
        testScope.cleanupTestCoroutines()
        testDispatcher.cleanupTestCoroutines()
    }

    @Test
    fun `analyze text returns valid NLPResult`() = testScope.runBlockingTest {
        // Setup
        val text = "Can you please set an alarm for 7am tomorrow?"

        // Action
        val result = nlpProcessor.analyzeText(text)

        // Verify
        assert(result is NLPResult)
        assert(result.rawText == text)
        assert(result.normalizedText.isNotEmpty())
        assert(result.intentClassification is IntentClassificationResult)
        assert(result.entityExtraction is EntityExtractionResult)
        assert(result.sentimentAnalysis is SentimentAnalysisResult)
    }

    @Test
    fun `detect intent identifies command correctly`() = testScope.runBlockingTest {
        // Setup
        val text = "Set an alarm for 7am"
        
        // Action
        val result = nlpProcessor.detectIntent(text)
        
        // Verify
        assert(result.primaryIntent.startsWith("COMMAND_"))
        assert(result.confidence > 0.5)
    }
    
    @Test
    fun `detect intent identifies question correctly`() = testScope.runBlockingTest {
        // Setup
        val text = "What time is it right now?"
        
        // Action
        val result = nlpProcessor.detectIntent(text)
        
        // Verify
        assert(result.primaryIntent.startsWith("QUERY_"))
        assert(result.confidence > 0.5)
    }

    @Test
    fun `extract entities identifies time correctly`() = testScope.runBlockingTest {
        // Setup
        val text = "Set an alarm for 7am tomorrow"
        
        // Action
        val result = nlpProcessor.extractEntities(text)
        
        // Verify
        assert(result.entities.isNotEmpty())
        val timeEntity = result.entities.find { it.type == "TIME" }
        assert(timeEntity != null)
        assert(timeEntity?.value?.contains("7") == true)
    }

    @Test
    fun `analyze sentiment detects positive sentiment`() = testScope.runBlockingTest {
        // Setup
        val text = "I'm having a great day today, thank you!"
        
        // Action
        val result = nlpProcessor.analyzeSentiment(text)
        
        // Verify
        assert(result.sentiment > 0.5) // Positive sentiment
    }
    
    @Test
    fun `analyze sentiment detects negative sentiment`() = testScope.runBlockingTest {
        // Setup
        val text = "I'm feeling terrible and everything is going wrong."
        
        // Action
        val result = nlpProcessor.analyzeSentiment(text)
        
        // Verify
        assert(result.sentiment < 0.4) // Negative sentiment
    }

    @Test
    fun `apply formality increases formality level`() = testScope.runBlockingTest {
        // Setup
        val text = "Hey, what's up?"
        val formalityLevel = 0.9 // High formality
        
        // Action
        val result = nlpProcessor.applyFormality(text, formalityLevel)
        
        // Verify
        assert(result.length > text.length) // Formal text is usually longer
        assert(!result.contains("what's up")) // Informal phrases should be replaced
    }

    @Test
    fun `apply warmth increases warmth level`() = testScope.runBlockingTest {
        // Setup
        val text = "The requested information is provided below."
        val warmthLevel = 0.9 // High warmth
        
        // Action
        val result = nlpProcessor.applyWarmth(text, warmthLevel)
        
        // Verify
        assert(result.length > text.length) // Warm text usually adds personal touches
        assert(result.contains("hope") || result.contains("glad") || result.contains("happy") || 
               result.contains("please") || result.contains("thank")) // Warm words
    }

    @Test
    fun `apply directness makes text more concise`() = testScope.runBlockingTest {
        // Setup
        val text = "I was wondering if perhaps you might be able to consider looking into this matter at your earliest convenience."
        val directnessLevel = 0.9 // Very direct
        
        // Action
        val result = nlpProcessor.applyDirectness(text, directnessLevel)
        
        // Verify
        assert(result.length < text.length) // Direct text is shorter
    }
}

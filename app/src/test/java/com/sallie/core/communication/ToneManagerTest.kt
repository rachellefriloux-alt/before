package com.sallie.core.communication

import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.TestCoroutineDispatcher
import kotlinx.coroutines.test.TestCoroutineScope
import kotlinx.coroutines.test.runBlockingTest
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.ArgumentMatchers.anyString
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.Mockito.verify
import org.mockito.MockitoAnnotations
import org.mockito.junit.MockitoJUnitRunner
import java.util.*

@ExperimentalCoroutinesApi
@RunWith(MockitoJUnitRunner::class)
class ToneManagerTest {

    private val testDispatcher = TestCoroutineDispatcher()
    private val testScope = TestCoroutineScope(testDispatcher)

    @Mock
    private lateinit var mockNlpEngine: NaturalLanguageProcessor

    private lateinit var toneManager: ToneManager

    @Before
    fun setup() {
        MockitoAnnotations.initMocks(this)
        toneManager = ToneManager(testScope)
    }

    @After
    fun tearDown() {
        testScope.cleanupTestCoroutines()
        testDispatcher.cleanupTestCoroutines()
    }

    @Test
    fun `set tone preferences updates values correctly`() = testScope.runBlockingTest {
        // Setup
        val formality = 0.8
        val weight = 0.5

        // Action
        toneManager.setTonePreference(ToneAttribute.FORMALITY, formality, weight)

        // Verify
        val preferences = toneManager.getToneAttributes()
        assert(preferences.formality == formality)
        assert(preferences.formalityWeight == weight)
    }

    @Test
    fun `reset tone preferences sets default values`() = testScope.runBlockingTest {
        // Setup - Set non-default values first
        toneManager.setTonePreference(ToneAttribute.FORMALITY, 0.9, 0.8)
        toneManager.setTonePreference(ToneAttribute.WARMTH, 0.2, 0.3)

        // Action
        toneManager.resetTonePreferences()

        // Verify
        val preferences = toneManager.getToneAttributes()
        assert(preferences.formality == ToneAttributes.DEFAULT_FORMALITY)
        assert(preferences.formalityWeight == ToneAttributes.DEFAULT_WEIGHT)
        assert(preferences.warmth == ToneAttributes.DEFAULT_WARMTH)
        assert(preferences.warmthWeight == ToneAttributes.DEFAULT_WEIGHT)
    }

    @Test
    fun `apply tone transforms message correctly based on preferences`() = testScope.runBlockingTest {
        // Setup
        val originalMessage = "This is a test message"
        val formalMessage = "This is a formal test message"
        
        toneManager.setTonePreference(ToneAttribute.FORMALITY, 1.0, 1.0)
        `when`(mockNlpEngine.applyFormality(anyString(), anyDouble())).thenReturn(formalMessage)
        
        // Action
        val transformedMessage = toneManager.applyToneTransformations(
            originalMessage, 
            mockNlpEngine
        )
        
        // Verify
        verify(mockNlpEngine).applyFormality(originalMessage, 1.0)
        assert(transformedMessage == formalMessage)
    }

    @Test
    fun `get conversation tone adapts to context`() = testScope.runBlockingTest {
        // Setup
        val conversationType = ConversationType.PROFESSIONAL
        val basePreferences = ToneAttributes(
            formality = 0.5,
            warmth = 0.5,
            directness = 0.5,
            humor = 0.5
        )
        
        // Action
        val adaptedTone = toneManager.getConversationTone(conversationType, basePreferences)
        
        // Verify - Professional should increase formality
        assert(adaptedTone.formality > basePreferences.formality)
    }
}

package com.sallie.core.input.speech

import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.TestCoroutineScope
import kotlinx.coroutines.test.runBlockingTest
import org.junit.Before
import org.junit.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertTrue
import kotlin.test.assertFailsWith

@ExperimentalCoroutinesApi
class EnhancedSpeechProcessorTest {

    private lateinit var testScope: TestCoroutineScope
    private lateinit var processor: EnhancedSpeechProcessor
    
    @Before
    fun setup() {
        testScope = TestCoroutineScope()
        processor = EnhancedSpeechProcessor(
            speechRecognitionEnabled = true,
            speakerIdentificationEnabled = true,
            emotionDetectionEnabled = true,
            voiceAnalysisEnabled = true
        )
    }
    
    @Test
    fun `initialize sets capabilities based on enabled features`() = testScope.runBlockingTest {
        // Initialize the processor
        processor.initialize()
        
        // Verify capabilities
        val capabilities = processor.getCapabilities()
        assertTrue(capabilities.contains(SpeechCapability.SPEECH_RECOGNITION))
        assertTrue(capabilities.contains(SpeechCapability.SPEAKER_IDENTIFICATION))
        assertTrue(capabilities.contains(SpeechCapability.EMOTION_DETECTION))
        assertTrue(capabilities.contains(SpeechCapability.VOICE_ANALYSIS))
    }
    
    @Test
    fun `recognizeSpeech returns complete speech recognition result`() = testScope.runBlockingTest {
        // Initialize the processor
        processor.initialize()
        
        // Create dummy audio data
        val audioData = "test audio data".toByteArray()
        
        // Set recognition options
        val options = SpeechRecognitionOptions(
            language = "en-US",
            enableAutomaticPunctuation = true,
            enableSpeakerDiarization = true,
            profanityFilter = true,
            noiseHandling = NoiseHandlingMode.MEDIUM
        )
        
        // Recognize speech
        val result = processor.recognizeSpeech(audioData, options)
        
        // Verify result contains expected components
        assertNotNull(result.id)
        assertNotNull(result.transcript)
        assertEquals("en-US", result.languageDetected)
        assertTrue(result.confidence > 0f && result.confidence <= 1.0f)
        assertNotNull(result.segments)
        assertTrue(result.segments.isNotEmpty())
        
        // Verify segments contain speaker IDs when diarization is enabled
        val firstSegment = result.segments.first()
        assertNotNull(firstSegment.speakerId)
    }
    
    @Test
    fun `detectEmotions returns emotion detection result`() = testScope.runBlockingTest {
        // Initialize the processor
        processor.initialize()
        
        // Create dummy audio data
        val audioData = "test audio data".toByteArray()
        
        // Detect emotions
        val result = processor.detectEmotions(audioData)
        
        // Verify result contains expected components
        assertNotNull(result.id)
        assertNotNull(result.dominantEmotion)
        assertTrue(result.confidence > 0f && result.confidence <= 1.0f)
        assertNotNull(result.emotions)
        assertTrue(result.emotions.isNotEmpty())
        
        // Verify dominant emotion is in the emotions map
        assertTrue(result.emotions.containsKey(result.dominantEmotion))
        
        // Verify dominant emotion has highest confidence
        val dominantScore = result.emotions[result.dominantEmotion] ?: 0.0f
        for ((emotion, score) in result.emotions) {
            if (emotion != result.dominantEmotion) {
                assertTrue(dominantScore >= score)
            }
        }
    }
    
    @Test
    fun `analyzeVoice returns voice analysis result`() = testScope.runBlockingTest {
        // Initialize the processor
        processor.initialize()
        
        // Create dummy audio data
        val audioData = "test audio data".toByteArray()
        
        // Analyze voice
        val result = processor.analyzeVoice(audioData)
        
        // Verify result contains expected components
        assertNotNull(result.id)
        assertNotNull(result.volume)
        assertNotNull(result.pitch)
        assertNotNull(result.speechRate)
        assertNotNull(result.voiceQuality)
        
        // Verify volume analysis
        assertNotNull(result.volume?.peakDb)
        assertNotNull(result.volume?.meanDb)
        assertNotNull(result.volume?.minDb)
        assertNotNull(result.volume?.maxDb)
        
        // Verify pitch analysis
        assertNotNull(result.pitch?.meanHz)
        assertNotNull(result.pitch?.minHz)
        assertNotNull(result.pitch?.maxHz)
        assertNotNull(result.pitch?.stabilityScore)
        
        // Verify speech rate analysis
        assertNotNull(result.speechRate?.wordsPerMinute)
        assertNotNull(result.speechRate?.syllablesPerSecond)
        assertNotNull(result.speechRate?.pauseCount)
        assertNotNull(result.speechRate?.longestPauseMs)
        
        // Verify voice quality analysis
        assertNotNull(result.voiceQuality?.breathiness)
        assertNotNull(result.voiceQuality?.hoarseness)
        assertNotNull(result.voiceQuality?.clarity)
    }
    
    @Test
    fun `disabled features throw UnsupportedOperationException`() = testScope.runBlockingTest {
        // Create processor with limited features
        val limitedProcessor = EnhancedSpeechProcessor(
            speechRecognitionEnabled = true,
            speakerIdentificationEnabled = false,
            emotionDetectionEnabled = false,
            voiceAnalysisEnabled = false
        )
        
        // Initialize the processor
        limitedProcessor.initialize()
        
        // Create dummy audio data
        val audioData = "test audio data".toByteArray()
        
        // Verify speech recognition works
        val options = SpeechRecognitionOptions(language = "en-US")
        val result = limitedProcessor.recognizeSpeech(audioData, options)
        assertNotNull(result)
        
        // Verify emotion detection throws exception
        assertFailsWith<UnsupportedOperationException> {
            limitedProcessor.detectEmotions(audioData)
        }
        
        // Verify voice analysis throws exception
        assertFailsWith<UnsupportedOperationException> {
            limitedProcessor.analyzeVoice(audioData)
        }
        
        // Verify speaker identification throws exception
        assertFailsWith<UnsupportedOperationException> {
            limitedProcessor.identifySpeaker(audioData)
        }
    }
}

package com.sallie.voice.test

import com.sallie.voice.*
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import org.junit.Before
import org.junit.Test
import java.io.ByteArrayOutputStream
import java.io.File
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

class SpeechRecognitionServiceTest {

    // Mock objects that will be used in the tests
    private val mockAudioData = ByteArray(1000) { it.toByte() }
    private lateinit var mockAudioFile: File
    
    // Test subject
    private lateinit var speechRecognitionService: SpeechRecognitionService
    
    @Before
    fun setup() {
        // Create a mock implementation for testing
        speechRecognitionService = MockSpeechRecognitionService()
        
        // Create a temporary file for testing
        mockAudioFile = File.createTempFile("test_audio", ".wav")
        mockAudioFile.writeBytes(mockAudioData)
        mockAudioFile.deleteOnExit()
    }
    
    @Test
    fun `test initialize sets state to READY`() = runBlocking {
        // When
        speechRecognitionService.initialize()
        
        // Then
        assertEquals(RecognitionState.READY, speechRecognitionService.recognitionState.first())
    }
    
    @Test
    fun `test recognizeSpeech returns valid result`() = runBlocking {
        // Given
        speechRecognitionService.initialize()
        val options = SpeechRecognitionOptions()
        
        // When
        val result = speechRecognitionService.recognizeSpeech(mockAudioData, options)
        
        // Then
        assertNotNull(result)
        assertTrue(result.hypotheses.isNotEmpty())
        assertTrue(result.hypotheses[0].confidence > 0)
    }
    
    @Test
    fun `test recognizeSpeechFromFile returns valid result`() = runBlocking {
        // Given
        speechRecognitionService.initialize()
        val options = SpeechRecognitionOptions()
        
        // When
        val result = speechRecognitionService.recognizeSpeechFromFile(mockAudioFile, options)
        
        // Then
        assertNotNull(result)
        assertTrue(result.hypotheses.isNotEmpty())
        assertTrue(result.hypotheses[0].confidence > 0)
    }
    
    @Test
    fun `test shutdown sets state to UNINITIALIZED`() = runBlocking {
        // Given
        speechRecognitionService.initialize()
        
        // When
        speechRecognitionService.shutdown()
        
        // Then
        assertEquals(RecognitionState.UNINITIALIZED, speechRecognitionService.recognitionState.first())
    }
    
    @Test
    fun `test startListening and stopListening change recognition state`() = runBlocking {
        // Given
        speechRecognitionService.initialize()
        
        val listener = object : SpeechRecognitionListener {
            override fun onSpeechResult(result: SpeechRecognitionResult) {}
            override fun onSpeechStarted() {}
            override fun onSpeechEnded() {}
            override fun onError(error: SpeechRecognitionError) {}
        }
        
        // When
        speechRecognitionService.startListening(SpeechRecognitionOptions(), listener)
        
        // Then
        assertEquals(RecognitionState.LISTENING, speechRecognitionService.recognitionState.first())
        
        // When
        speechRecognitionService.stopListening()
        
        // Then
        assertEquals(RecognitionState.READY, speechRecognitionService.recognitionState.first())
    }
    
    /**
     * Mock implementation of SpeechRecognitionService for testing
     */
    private class MockSpeechRecognitionService : SpeechRecognitionService {
        override val recognitionState = kotlinx.coroutines.flow.MutableStateFlow(RecognitionState.UNINITIALIZED)
        
        override suspend fun initialize() {
            recognitionState.value = RecognitionState.READY
        }
        
        override suspend fun checkAvailability() {
            // Always available in mock
        }
        
        override suspend fun isOfflineRecognitionAvailable(): Boolean {
            return true
        }
        
        override suspend fun startListening(
            options: SpeechRecognitionOptions,
            listener: SpeechRecognitionListener
        ) {
            recognitionState.value = RecognitionState.LISTENING
            
            // Simulate speech detected event
            listener.onSpeechStarted()
            
            // Simulate speech result
            listener.onSpeechResult(
                SpeechRecognitionResult(
                    hypotheses = listOf(
                        SpeechHypothesis(
                            text = "Hello world",
                            confidence = 0.9f,
                            isPartial = false
                        )
                    ),
                    isFinal = true
                )
            )
            
            // Simulate speech ended
            listener.onSpeechEnded()
        }
        
        override suspend fun stopListening() {
            recognitionState.value = RecognitionState.READY
        }
        
        override suspend fun recognizeSpeech(
            audioData: ByteArray,
            options: SpeechRecognitionOptions
        ): SpeechRecognitionResult {
            return SpeechRecognitionResult(
                hypotheses = listOf(
                    SpeechHypothesis(
                        text = "This is a mock recognition result",
                        confidence = 0.85f,
                        isPartial = false
                    )
                ),
                isFinal = true
            )
        }
        
        override suspend fun recognizeSpeechFromFile(
            audioFile: File,
            options: SpeechRecognitionOptions
        ): SpeechRecognitionResult {
            return SpeechRecognitionResult(
                hypotheses = listOf(
                    SpeechHypothesis(
                        text = "This is a mock recognition result from file",
                        confidence = 0.8f,
                        isPartial = false
                    )
                ),
                isFinal = true
            )
        }
        
        override suspend fun transcribe(
            audioData: ByteArray,
            options: TranscriptionOptions
        ): TranscriptionResult {
            return TranscriptionResult(
                text = "This is a mock transcription result",
                confidence = 0.9f,
                durationMs = 1000,
                languageCode = LanguageCode.EN_US
            )
        }
        
        override suspend fun shutdown() {
            recognitionState.value = RecognitionState.UNINITIALIZED
        }
    }
}

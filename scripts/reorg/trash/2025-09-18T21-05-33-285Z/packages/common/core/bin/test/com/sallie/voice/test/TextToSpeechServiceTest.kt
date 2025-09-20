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

class TextToSpeechServiceTest {

    // Mock data
    private val mockText = "Hello, this is a test."
    private val mockSsml = "<speak>Hello, this is a <emphasis>test</emphasis>.</speak>"
    
    // Test subject
    private lateinit var textToSpeechService: TextToSpeechService
    
    @Before
    fun setup() {
        // Create a mock implementation for testing
        textToSpeechService = MockTextToSpeechService()
    }
    
    @Test
    fun `test initialize sets state to IDLE`() = runBlocking {
        // When
        textToSpeechService.initialize()
        
        // Then
        assertEquals(SynthesisState.IDLE, textToSpeechService.synthesisState.first())
    }
    
    @Test
    fun `test speak returns valid result`() = runBlocking {
        // Given
        textToSpeechService.initialize()
        val options = SpeechSynthesisOptions()
        
        // When
        val result = textToSpeechService.speak(mockText, options)
        
        // Then
        assertNotNull(result)
        assertNotNull(result.audioData)
        assertEquals(1000L, result.duration)
    }
    
    @Test
    fun `test speakSsml returns valid result`() = runBlocking {
        // Given
        textToSpeechService.initialize()
        val options = SpeechSynthesisOptions()
        
        // When
        val result = textToSpeechService.speakSsml(mockSsml, options)
        
        // Then
        assertNotNull(result)
        assertNotNull(result.audioData)
        assertEquals(1200L, result.duration)
    }
    
    @Test
    fun `test synthesize returns audio data`() = runBlocking {
        // Given
        textToSpeechService.initialize()
        val options = SpeechSynthesisOptions()
        
        // When
        val audioData = textToSpeechService.synthesize(mockText, options)
        
        // Then
        assertNotNull(audioData)
        assertEquals(1000, audioData.size)
    }
    
    @Test
    fun `test synthesizeToFile creates file with audio data`() = runBlocking {
        // Given
        textToSpeechService.initialize()
        val options = SpeechSynthesisOptions()
        val outputFile = File.createTempFile("test_output", ".wav")
        outputFile.deleteOnExit()
        
        // When
        val file = textToSpeechService.synthesizeToFile(mockText, options, outputFile)
        
        // Then
        assertNotNull(file)
        assertEquals(true, file.exists())
        assertEquals(1000L, file.length())
    }
    
    @Test
    fun `test shutdown sets state to IDLE`() = runBlocking {
        // Given
        textToSpeechService.initialize()
        
        // When
        textToSpeechService.shutdown()
        
        // Then
        assertEquals(SynthesisState.IDLE, textToSpeechService.synthesisState.first())
    }
    
    /**
     * Mock implementation of TextToSpeechService for testing
     */
    private class MockTextToSpeechService : TextToSpeechService {
        override val synthesisState = kotlinx.coroutines.flow.MutableStateFlow(SynthesisState.IDLE)
        
        override suspend fun initialize() {
            synthesisState.value = SynthesisState.IDLE
        }
        
        override suspend fun getAvailableVoices(): List<VoiceInfo> {
            return listOf(
                VoiceInfo(
                    id = "mock_voice_1",
                    name = "Mock Voice 1",
                    gender = VoiceGender.FEMALE,
                    age = VoiceAge.ADULT,
                    languageCodes = listOf(LanguageCode.EN_US),
                    sampleRateHertz = 16000,
                    naturalness = 0.9f,
                    isNeural = true,
                    requiresNetwork = false,
                    customizationSupport = true
                ),
                VoiceInfo(
                    id = "mock_voice_2",
                    name = "Mock Voice 2",
                    gender = VoiceGender.MALE,
                    age = VoiceAge.ADULT,
                    languageCodes = listOf(LanguageCode.EN_US),
                    sampleRateHertz = 16000,
                    naturalness = 0.8f,
                    isNeural = false,
                    requiresNetwork = false,
                    customizationSupport = false
                )
            )
        }
        
        override suspend fun speak(text: String, options: SpeechSynthesisOptions): SynthesisResult {
            synthesisState.value = SynthesisState.SPEAKING
            // Simulate speech synthesis
            val audioData = ByteArray(1000) { it.toByte() }
            synthesisState.value = SynthesisState.IDLE
            return SynthesisResult(
                id = "mock_result_1",
                audioData = audioData,
                duration = 1000L,
                wordBoundaries = listOf(
                    SynthesisResult.WordBoundary("Hello", 0, 300),
                    SynthesisResult.WordBoundary("this", 300, 500),
                    SynthesisResult.WordBoundary("is", 500, 600),
                    SynthesisResult.WordBoundary("a", 600, 650),
                    SynthesisResult.WordBoundary("test", 650, 1000)
                )
            )
        }
        
        override suspend fun speakSsml(ssml: String, options: SpeechSynthesisOptions): SynthesisResult {
            synthesisState.value = SynthesisState.SPEAKING
            // Simulate SSML speech synthesis
            val audioData = ByteArray(1200) { it.toByte() }
            synthesisState.value = SynthesisState.IDLE
            return SynthesisResult(
                id = "mock_result_2",
                audioData = audioData,
                duration = 1200L,
                wordBoundaries = listOf(
                    SynthesisResult.WordBoundary("Hello", 0, 300),
                    SynthesisResult.WordBoundary("this", 300, 500),
                    SynthesisResult.WordBoundary("is", 500, 600),
                    SynthesisResult.WordBoundary("a", 600, 650),
                    SynthesisResult.WordBoundary("test", 650, 1200)
                )
            )
        }
        
        override suspend fun synthesize(text: String, options: SpeechSynthesisOptions): ByteArray {
            synthesisState.value = SynthesisState.SYNTHESIZING
            // Simulate audio data generation
            val audioData = ByteArray(1000) { it.toByte() }
            synthesisState.value = SynthesisState.IDLE
            return audioData
        }
        
        override suspend fun synthesizeSsml(ssml: String, options: SpeechSynthesisOptions): ByteArray {
            synthesisState.value = SynthesisState.SYNTHESIZING
            // Simulate SSML audio data generation
            val audioData = ByteArray(1200) { it.toByte() }
            synthesisState.value = SynthesisState.IDLE
            return audioData
        }
        
        override suspend fun synthesizeToStream(
            text: String,
            options: SpeechSynthesisOptions,
            outputStream: java.io.OutputStream
        ) {
            synthesisState.value = SynthesisState.SYNTHESIZING
            // Simulate writing to output stream
            val audioData = ByteArray(1000) { it.toByte() }
            outputStream.write(audioData)
            synthesisState.value = SynthesisState.IDLE
        }
        
        override suspend fun synthesizeToFile(
            text: String,
            options: SpeechSynthesisOptions,
            outputFile: File
        ): File {
            synthesisState.value = SynthesisState.SYNTHESIZING
            // Simulate writing to file
            val audioData = ByteArray(1000) { it.toByte() }
            outputFile.writeBytes(audioData)
            synthesisState.value = SynthesisState.IDLE
            return outputFile
        }
        
        override suspend fun stop() {
            synthesisState.value = SynthesisState.IDLE
        }
        
        override suspend fun shutdown() {
            synthesisState.value = SynthesisState.IDLE
        }
    }
}

package com.sallie.core.voice

import android.content.Context
import com.sallie.core.voice.recognition.VoiceRecognizer
import com.sallie.core.voice.recognition.VoiceRecognizerConfig
import com.sallie.core.voice.synthesis.VoiceSynthesizer
import com.sallie.core.voice.synthesis.VoiceSynthesizerConfig
import io.mockk.*
import io.mockk.impl.annotations.MockK
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.test.*
import org.junit.After
import org.junit.Before
import org.junit.Test
import java.io.File
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

@ExperimentalCoroutinesApi
class SallieVoiceSystemTest {
    
    @MockK
    lateinit var mockContext: Context
    
    @MockK
    lateinit var mockRecognizer: VoiceRecognizer
    
    @MockK
    lateinit var mockSynthesizer: VoiceSynthesizer
    
    @MockK
    lateinit var mockListener: VoiceSystemListener
    
    private lateinit var voiceSystem: SallieVoiceSystem
    private val testDispatcher = StandardTestDispatcher()
    
    @Before
    fun setup() {
        MockKAnnotations.init(this)
        Dispatchers.setMain(testDispatcher)
        
        // Set up mocks
        every { mockContext.applicationContext } returns mockContext
        
        // Create a special version of SallieVoiceSystem for testing
        voiceSystem = object : SallieVoiceSystem(mockContext) {
            override fun createRecognizer(engineType: RecognitionEngineType): VoiceRecognizer {
                return mockRecognizer
            }
            
            override fun createSynthesizer(engineType: SynthesisEngineType): VoiceSynthesizer {
                return mockSynthesizer
            }
        }
        
        // Set up default mock behavior
        coEvery { mockRecognizer.initialize(any()) } just Runs
        coEvery { mockSynthesizer.initialize(any()) } just Runs
        every { mockRecognizer.registerVoiceListener(any()) } just Runs
        every { mockSynthesizer.registerVoiceListener(any()) } just Runs
        every { mockRecognizer.getStatus() } returns mockk(relaxed = true)
        every { mockSynthesizer.getStatus() } returns mockk(relaxed = true)
    }
    
    @After
    fun teardown() {
        Dispatchers.resetMain()
    }
    
    @Test
    fun `initialize should set up recognizer and synthesizer`() = runTest {
        // Arrange
        val config = VoiceSystemConfig(
            recognitionEngine = RecognitionEngineType.ONDEVICE,
            synthesisEngine = SynthesisEngineType.ONDEVICE
        )
        
        // Act
        voiceSystem.initialize(config)
        
        // Assert
        coVerify { mockRecognizer.initialize(any<VoiceRecognizerConfig>()) }
        coVerify { mockSynthesizer.initialize(any<VoiceSynthesizerConfig>()) }
    }
    
    @Test
    fun `startListening should delegate to recognizer`() = runTest {
        // Arrange
        val options = VoiceRecognitionOptions()
        val mockFlow: Flow<VoiceRecognitionResult> = flowOf(
            VoiceRecognitionResult("Test", isPartial = false)
        )
        every { mockRecognizer.startListening(any()) } returns mockFlow
        coEvery { voiceSystem.initialize(any()) } just Runs
        voiceSystem.initialize(VoiceSystemConfig())
        
        // Act
        val result = voiceSystem.startListening(options)
        
        // Assert
        verify { mockRecognizer.startListening(options) }
        assertEquals(mockFlow, result)
    }
    
    @Test
    fun `stopListening should delegate to recognizer`() = runTest {
        // Arrange
        coEvery { mockRecognizer.stopListening() } just Runs
        coEvery { voiceSystem.initialize(any()) } just Runs
        voiceSystem.initialize(VoiceSystemConfig())
        
        // Act
        voiceSystem.stopListening()
        
        // Assert
        coVerify { mockRecognizer.stopListening() }
    }
    
    @Test
    fun `speak should delegate to synthesizer`() = runTest {
        // Arrange
        val text = "Hello"
        val options = VoiceSynthesisOptions()
        val mockFlow: Flow<VoiceSynthesisProgress> = flowOf(
            VoiceSynthesisProgress(
                state = SynthesisState.COMPLETED,
                text = text,
                processedCharacters = text.length,
                totalCharacters = text.length
            )
        )
        every { mockSynthesizer.speak(any(), any()) } returns mockFlow
        coEvery { voiceSystem.initialize(any()) } just Runs
        voiceSystem.initialize(VoiceSystemConfig())
        
        // Act
        val result = voiceSystem.speak(text, options)
        
        // Assert
        verify { mockSynthesizer.speak(text, options) }
        assertEquals(mockFlow, result)
    }
    
    @Test
    fun `stopSpeaking should delegate to synthesizer`() = runTest {
        // Arrange
        coEvery { mockSynthesizer.stopSpeaking() } just Runs
        coEvery { voiceSystem.initialize(any()) } just Runs
        voiceSystem.initialize(VoiceSystemConfig())
        
        // Act
        voiceSystem.stopSpeaking()
        
        // Assert
        coVerify { mockSynthesizer.stopSpeaking() }
    }
    
    @Test
    fun `setWakeWordDetection should delegate to recognizer`() = runTest {
        // Arrange
        val enabled = true
        val wakeWord = "Hey Sallie"
        coEvery { mockRecognizer.setWakeWordDetection(any(), any()) } just Runs
        coEvery { voiceSystem.initialize(any()) } just Runs
        voiceSystem.initialize(VoiceSystemConfig())
        
        // Act
        voiceSystem.setWakeWordDetection(enabled, wakeWord)
        
        // Assert
        coVerify { mockRecognizer.setWakeWordDetection(enabled, wakeWord) }
    }
    
    @Test
    fun `setVoiceCharacteristics should delegate to synthesizer`() = runTest {
        // Arrange
        val characteristics = VoiceCharacteristics()
        every { mockSynthesizer.setVoiceCharacteristics(any()) } just Runs
        coEvery { voiceSystem.initialize(any()) } just Runs
        voiceSystem.initialize(VoiceSystemConfig())
        
        // Act
        voiceSystem.setVoiceCharacteristics(characteristics)
        
        // Assert
        verify { mockSynthesizer.setVoiceCharacteristics(characteristics) }
    }
    
    @Test
    fun `getAvailableVoices should delegate to synthesizer`() = runTest {
        // Arrange
        val mockVoices = listOf(
            VoiceProfile(
                id = "test",
                name = "Test Voice",
                gender = VoiceGender.NEUTRAL,
                age = VoiceAge.ADULT,
                language = "en-US"
            )
        )
        coEvery { mockSynthesizer.getAvailableVoices() } returns mockVoices
        coEvery { voiceSystem.initialize(any()) } just Runs
        voiceSystem.initialize(VoiceSystemConfig())
        
        // Act
        val result = voiceSystem.getAvailableVoices()
        
        // Assert
        coVerify { mockSynthesizer.getAvailableVoices() }
        assertEquals(mockVoices, result)
    }
    
    @Test
    fun `transcribeAudioFile should delegate to recognizer`() = runTest {
        // Arrange
        val file = mockk<File>()
        val options = TranscriptionOptions()
        val mockResult = TranscriptionResult(
            text = "Test transcription",
            confidence = 0.9f,
            segments = emptyList(),
            durationMs = 1000
        )
        coEvery { mockRecognizer.transcribeAudioFile(any(), any()) } returns mockResult
        coEvery { voiceSystem.initialize(any()) } just Runs
        voiceSystem.initialize(VoiceSystemConfig())
        
        // Act
        val result = voiceSystem.transcribeAudioFile(file, options)
        
        // Assert
        coVerify { mockRecognizer.transcribeAudioFile(file, options) }
        assertEquals(mockResult, result)
    }
    
    @Test
    fun `getStatus should return combined status`() = runTest {
        // Arrange
        val recognizerStatus = mockk<VoiceRecognizerStatus> {
            every { isListening } returns true
            every { wakeWordEnabled } returns true
            every { currentWakeWord } returns "Hey Sallie"
            every { currentLanguage } returns "en-US"
        }
        val synthesizerStatus = mockk<VoiceSynthesizerStatus> {
            every { isSpeaking } returns false
            every { currentVoiceProfile } returns "default"
        }
        every { mockRecognizer.getStatus() } returns recognizerStatus
        every { mockSynthesizer.getStatus() } returns synthesizerStatus
        coEvery { voiceSystem.initialize(any()) } just Runs
        voiceSystem.initialize(VoiceSystemConfig())
        
        // Act
        val status = voiceSystem.getStatus()
        
        // Assert
        assertTrue(status.isInitialized)
        assertTrue(status.isListening)
        assertFalse(status.isSpeaking)
        assertTrue(status.isWakeWordEnabled)
        assertEquals("Hey Sallie", status.currentWakeWord)
        assertEquals("en-US", status.currentLanguage)
        assertEquals("default", status.currentVoiceProfile)
    }
    
    @Test
    fun `shutdown should clean up resources`() = runTest {
        // Arrange
        coEvery { mockRecognizer.shutdown() } just Runs
        coEvery { mockSynthesizer.shutdown() } just Runs
        coEvery { voiceSystem.initialize(any()) } just Runs
        voiceSystem.initialize(VoiceSystemConfig())
        
        // Act
        voiceSystem.shutdown()
        
        // Assert
        coVerify { mockRecognizer.shutdown() }
        coVerify { mockSynthesizer.shutdown() }
    }
    
    @Test
    fun `registerVoiceListener should add listener`() = runTest {
        // Act
        voiceSystem.registerVoiceListener(mockListener)
        
        // Simulate wake word detected (this would normally come from recognizer)
        val captureListener = slot<VoiceSystemListener>()
        verify { mockRecognizer.registerVoiceListener(capture(captureListener)) }
        captureListener.captured.onWakeWordDetected("Hey Sallie")
        
        // Assert
        verify { mockListener.onWakeWordDetected("Hey Sallie") }
    }
    
    @Test
    fun `unregisterVoiceListener should remove listener`() = runTest {
        // Arrange - register first
        voiceSystem.registerVoiceListener(mockListener)
        
        // Act
        voiceSystem.unregisterVoiceListener(mockListener)
        
        // Simulate wake word detected after unregister
        val captureListener = slot<VoiceSystemListener>()
        verify { mockRecognizer.registerVoiceListener(capture(captureListener)) }
        captureListener.captured.onWakeWordDetected("Hey Sallie")
        
        // Assert - should not reach mockListener
        verify(exactly = 0) { mockListener.onWakeWordDetected(any()) }
    }
}

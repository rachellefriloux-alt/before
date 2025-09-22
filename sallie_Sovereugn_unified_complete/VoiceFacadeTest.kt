package com.sallie.voice.test

import com.sallie.voice.*
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.mockito.Mockito.*
import java.io.ByteArrayOutputStream
import java.io.File
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class VoiceFacadeTest {
    
    // Mock services
    private val mockSpeechRecognitionService = mock(SpeechRecognitionService::class.java)
    private val mockTextToSpeechService = mock(TextToSpeechService::class.java)
    private val mockVoiceIdentityService = mock(VoiceIdentityVerificationService::class.java)
    
    // System under test
    private lateinit var voiceFacade: VoiceFacade
    
    @Before
    fun setup() {
        voiceFacade = VoiceFacade(
            speechRecognitionService = mockSpeechRecognitionService,
            textToSpeechService = mockTextToSpeechService,
            voiceIdentityService = mockVoiceIdentityService
        )
    }
    
    @After
    fun teardown() = runBlocking {
        voiceFacade.shutdown()
    }
    
    @Test
    fun `test initialize initializes all services and sets state to READY`() = runBlocking {
        // When initialize is called
        voiceFacade.initialize()
        
        // Then all services are initialized
        verify(mockSpeechRecognitionService).initialize()
        verify(mockTextToSpeechService).initialize()
        verify(mockVoiceIdentityService).initialize()
        
        // And state is READY
        assertEquals(VoiceSystemState.READY, voiceFacade.voiceSystemState.value)
    }
    
    @Test
    fun `test speak delegates to textToSpeechService`() = runBlocking {
        // Given
        val text = "Hello, world"
        val options = SpeechSynthesisOptions(voiceId = "test_voice")
        val expectedResult = SynthesisResult(
            id = "test_id",
            audioData = byteArrayOf(1, 2, 3),
            duration = 1000
        )
        
        `when`(mockTextToSpeechService.speak(text, options)).thenReturn(expectedResult)
        
        // Initialize first
        voiceFacade.initialize()
        
        // When speak is called
        val result = voiceFacade.speak(text, options)
        
        // Then textToSpeechService.speak is called with the same parameters
        verify(mockTextToSpeechService).speak(text, options)
        
        // And the result is returned
        assertEquals(expectedResult, result)
        
        // And state is READY after speaking
        assertEquals(VoiceSystemState.READY, voiceFacade.voiceSystemState.value)
    }
    
    @Test
    fun `test verifyUserVoice delegates to voiceIdentityService`() = runBlocking {
        // Given
        val userId = "test_user"
        val audioData = byteArrayOf(1, 2, 3)
        val options = VerificationOptions(threshold = 0.8f)
        val expectedResult = VerificationResult(
            userId = userId,
            isVerified = true,
            confidence = 0.9f
        )
        
        `when`(mockVoiceIdentityService.verifyVoice(userId, audioData, options)).thenReturn(expectedResult)
        
        // Initialize first
        voiceFacade.initialize()
        
        // When verifyUserVoice is called
        val result = voiceFacade.verifyUserVoice(userId, audioData, options)
        
        // Then voiceIdentityService.verifyVoice is called with the same parameters
        verify(mockVoiceIdentityService).verifyVoice(userId, audioData, options)
        
        // And the result is returned
        assertEquals(expectedResult, result)
        
        // And state is READY after verification
        assertEquals(VoiceSystemState.READY, voiceFacade.voiceSystemState.value)
    }
    
    @Test
    fun `test shutdown shutdowns all services and sets state to INACTIVE`() = runBlocking {
        // Initialize first
        voiceFacade.initialize()
        
        // When shutdown is called
        voiceFacade.shutdown()
        
        // Then all services are shutdown
        verify(mockSpeechRecognitionService).shutdown()
        verify(mockTextToSpeechService).shutdown()
        verify(mockVoiceIdentityService).shutdown()
        
        // And state is INACTIVE
        assertEquals(VoiceSystemState.INACTIVE, voiceFacade.voiceSystemState.value)
    }
}

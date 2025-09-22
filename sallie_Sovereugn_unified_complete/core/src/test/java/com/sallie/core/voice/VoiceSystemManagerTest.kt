package com.sallie.core.voice

import android.Manifest
import android.app.Activity
import android.content.Context
import android.content.pm.PackageManager
import androidx.core.content.ContextCompat
import io.mockk.*
import io.mockk.impl.annotations.MockK
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.test.*
import org.junit.After
import org.junit.Before
import org.junit.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

@ExperimentalCoroutinesApi
class VoiceSystemManagerTest {
    
    @MockK
    lateinit var mockContext: Context
    
    @MockK
    lateinit var mockVoiceSystem: VoiceSystem
    
    @MockK
    lateinit var mockActivity: Activity
    
    private lateinit var voiceSystemManager: VoiceSystemManager
    private val testDispatcher = StandardTestDispatcher()
    
    @Before
    fun setup() {
        MockKAnnotations.init(this)
        Dispatchers.setMain(testDispatcher)
        
        // Mock factory to return our mock voice system
        mockkObject(VoiceSystemFactory)
        every { 
            VoiceSystemFactory.getVoiceSystem(any(), any(), any())
        } returns mockVoiceSystem
        
        // Set up default mock behavior
        coEvery { mockVoiceSystem.initialize(any()) } just Runs
        coEvery { mockVoiceSystem.startListening(any()) } returns flowOf(
            VoiceRecognitionResult("Test", isPartial = false)
        )
        coEvery { mockVoiceSystem.stopListening() } just Runs
        coEvery { mockVoiceSystem.speak(any(), any()) } returns flowOf(
            VoiceSynthesisProgress(
                state = SynthesisState.COMPLETED,
                text = "Test",
                processedCharacters = 4,
                totalCharacters = 4
            )
        )
        coEvery { mockVoiceSystem.stopSpeaking() } just Runs
        coEvery { mockVoiceSystem.setWakeWordDetection(any(), any()) } just Runs
        every { mockVoiceSystem.registerVoiceListener(any()) } just Runs
        
        // Create voice system manager with mock context
        voiceSystemManager = VoiceSystemManager(mockContext)
    }
    
    @After
    fun teardown() {
        unmockkAll()
        Dispatchers.resetMain()
    }
    
    @Test
    fun `initialize should initialize voice system`() = runTest {
        // Act
        voiceSystemManager.initialize()
        
        // Assert
        coVerify { mockVoiceSystem.initialize(any()) }
        verify { mockVoiceSystem.registerVoiceListener(any()) }
    }
    
    @Test
    fun `hasRequiredPermissions should check for RECORD_AUDIO permission`() {
        // Arrange
        every { 
            ContextCompat.checkSelfPermission(mockContext, Manifest.permission.RECORD_AUDIO) 
        } returns PackageManager.PERMISSION_GRANTED
        
        // Act
        val result = voiceSystemManager.hasRequiredPermissions()
        
        // Assert
        assertTrue(result)
    }
    
    @Test
    fun `hasRequiredPermissions should return false when permission denied`() {
        // Arrange
        every { 
            ContextCompat.checkSelfPermission(mockContext, Manifest.permission.RECORD_AUDIO) 
        } returns PackageManager.PERMISSION_DENIED
        
        // Act
        val result = voiceSystemManager.hasRequiredPermissions()
        
        // Assert
        assertFalse(result)
    }
    
    @Test
    fun `startListening should start voice system listening`() = runTest {
        // Arrange
        every { 
            ContextCompat.checkSelfPermission(mockContext, Manifest.permission.RECORD_AUDIO) 
        } returns PackageManager.PERMISSION_GRANTED
        voiceSystemManager.initialize()
        
        // Act
        voiceSystemManager.startListening()
        
        // Assert
        coVerify { mockVoiceSystem.startListening(any()) }
        assertEquals(VoiceState.LISTENING, voiceSystemManager.voiceState.value)
    }
    
    @Test
    fun `startListening should emit error when permissions not granted`() = runTest {
        // Arrange
        every { 
            ContextCompat.checkSelfPermission(mockContext, Manifest.permission.RECORD_AUDIO) 
        } returns PackageManager.PERMISSION_DENIED
        voiceSystemManager.initialize()
        
        // Act
        voiceSystemManager.startListening()
        val event = voiceSystemManager.voiceEvent.first() as VoiceEvent.Error
        
        // Assert
        coVerify(exactly = 0) { mockVoiceSystem.startListening(any()) }
        assertEquals(ErrorCode.PERMISSION_DENIED, event.error.code)
    }
    
    @Test
    fun `stopListening should stop voice system listening`() = runTest {
        // Arrange
        voiceSystemManager.initialize()
        
        // Act
        voiceSystemManager.stopListening()
        
        // Assert
        coVerify { mockVoiceSystem.stopListening() }
    }
    
    @Test
    fun `speak should start voice system speaking`() = runTest {
        // Arrange
        voiceSystemManager.initialize()
        
        // Act
        voiceSystemManager.speak("Hello")
        
        // Assert
        coVerify { mockVoiceSystem.speak("Hello", any()) }
    }
    
    @Test
    fun `stopSpeaking should stop voice system speaking`() = runTest {
        // Arrange
        voiceSystemManager.initialize()
        
        // Act
        voiceSystemManager.stopSpeaking()
        
        // Assert
        coVerify { mockVoiceSystem.stopSpeaking() }
    }
    
    @Test
    fun `setWakeWordDetection should update wake word settings`() = runTest {
        // Arrange
        voiceSystemManager.initialize()
        
        // Act
        voiceSystemManager.setWakeWordDetection(true, "Hey Sallie")
        val event = voiceSystemManager.voiceEvent.first() as VoiceEvent.WakeWordStatusChanged
        
        // Assert
        coVerify { mockVoiceSystem.setWakeWordDetection(true, "Hey Sallie") }
        assertTrue(event.enabled)
    }
    
    @Test
    fun `setVoiceCharacteristics should update voice characteristics`() = runTest {
        // Arrange
        val characteristics = VoiceCharacteristics()
        every { mockVoiceSystem.setVoiceCharacteristics(any()) } just Runs
        voiceSystemManager.initialize()
        
        // Act
        voiceSystemManager.setVoiceCharacteristics(characteristics)
        
        // Assert
        verify { mockVoiceSystem.setVoiceCharacteristics(characteristics) }
    }
    
    @Test
    fun `release should clean up resources`() = runTest {
        // Arrange
        coEvery { mockVoiceSystem.shutdown() } just Runs
        voiceSystemManager.initialize()
        
        // Act
        voiceSystemManager.release()
        
        // Assert
        coVerify { mockVoiceSystem.shutdown() }
    }
    
    @Test
    fun `listeners should be notified of voice events`() = runTest {
        // Arrange
        voiceSystemManager.initialize()
        
        // Capture the listener registered with the voice system
        val listenerSlot = slot<VoiceSystemListener>()
        verify { mockVoiceSystem.registerVoiceListener(capture(listenerSlot)) }
        
        // Act - simulate wake word detection
        listenerSlot.captured.onWakeWordDetected("Hey Sallie")
        val event = voiceSystemManager.voiceEvent.first() as VoiceEvent.WakeWordDetected
        
        // Assert
        assertEquals("Hey Sallie", event.wakeWord)
    }
}

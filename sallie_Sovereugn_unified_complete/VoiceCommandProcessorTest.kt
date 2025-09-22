package com.sallie.voice.test

import com.sallie.voice.*
import kotlinx.coroutines.runBlocking
import org.junit.Before
import org.junit.Test
import org.mockito.Mockito.*
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class VoiceCommandProcessorTest {
    
    // Mock dependencies
    private val mockSpeechRecognitionService = mock(SpeechRecognitionService::class.java)
    private val mockTextToSpeechService = mock(TextToSpeechService::class.java)
    private val mockCommandHandler = mock(CommandHandler::class.java)
    
    // System under test
    private lateinit var commandProcessor: EnhancedVoiceCommandProcessor
    
    @Before
    fun setup() {
        commandProcessor = EnhancedVoiceCommandProcessor(
            speechRecognitionService = mockSpeechRecognitionService,
            textToSpeechService = mockTextToSpeechService
        )
        
        // Setup mock command handler
        `when`(mockCommandHandler.getSupportedIntents()).thenReturn(setOf("get_weather", "set_reminder"))
    }
    
    @Test
    fun `test processTextCommand with matching intent handler`() = runBlocking {
        // Given
        val text = "What's the weather like in Paris?"
        val expectedCommand = Command(
            id = "any", // we'll ignore this in verification
            intent = "get_weather",
            text = text,
            params = mapOf("location" to "Paris"),
            confidence = 0.8f,
            source = CommandSource.TEXT
        )
        
        val expectedResult = CommandResult(
            command = expectedCommand,
            isHandled = true,
            response = "The weather in Paris is sunny.",
            confidence = 0.8f
        )
        
        // Mock command handler to return the expected result
        `when`(mockCommandHandler.processCommand(any())).thenReturn(expectedResult)
        
        // Register the command handler
        commandProcessor.registerCommandHandler(mockCommandHandler)
        
        // Initialize first
        commandProcessor.initialize()
        
        // When processTextCommand is called
        val result = commandProcessor.processTextCommand(text)
        
        // Then the command handler is called
        verify(mockCommandHandler).getSupportedIntents()
        verify(mockCommandHandler).processCommand(any())
        
        // And the result is returned
        assertEquals(true, result.isHandled)
        assertEquals("The weather in Paris is sunny.", result.response)
        assertEquals(0.8f, result.confidence)
    }
    
    @Test
    fun `test processTextCommand with no matching intent handler`() = runBlocking {
        // Given
        val text = "What's the stock price of Apple?"
        
        // Command handler doesn't support this intent
        
        // Initialize first
        commandProcessor.initialize()
        
        // Register the command handler
        commandProcessor.registerCommandHandler(mockCommandHandler)
        
        // When processTextCommand is called
        val result = commandProcessor.processTextCommand(text)
        
        // Then no command handler is called for processing
        verify(mockCommandHandler, never()).processCommand(any())
        
        // And the result indicates the command wasn't handled
        assertEquals(false, result.isHandled)
        assertTrue(result.errorMessage?.contains("No handler found") ?: false)
    }
    
    @Test
    fun `test unregisterCommandHandler removes the handler`() = runBlocking {
        // Given
        val text = "What's the weather like in Paris?"
        
        // Initialize first
        commandProcessor.initialize()
        
        // Register the command handler
        commandProcessor.registerCommandHandler(mockCommandHandler)
        
        // Then unregister it
        commandProcessor.unregisterCommandHandler(mockCommandHandler)
        
        // When processTextCommand is called
        val result = commandProcessor.processTextCommand(text)
        
        // Then no command handler is called
        verify(mockCommandHandler, never()).processCommand(any())
        
        // And the result indicates the command wasn't handled
        assertEquals(false, result.isHandled)
    }
}

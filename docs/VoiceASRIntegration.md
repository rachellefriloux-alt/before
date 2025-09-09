# Voice/ASR Integration

## Overview

The Voice/ASR Integration module provides comprehensive speech recognition, text-to-speech synthesis, voice command processing, and voice identity verification capabilities to Sallie. This modular system prioritizes privacy by offering on-device processing options while maintaining the ability to leverage cloud services when higher quality is required.

## Key Components

### Speech Recognition Service

The speech recognition service converts spoken language into text. Features include:

- Real-time speech recognition with continuous listening
- Batch processing from audio files
- On-device and cloud-based recognition options
- Support for multiple languages
- Word timestamps and confidence scores
- Transcription capabilities for longer content

### Text-to-Speech Synthesis

The text-to-speech service converts text into natural-sounding speech. Features include:

- High-quality neural voice synthesis
- SSML support for fine-grained control
- Voice selection with multiple options
- Control over pitch, rate, and volume
- Audio format flexibility
- Word boundary information for synchronization

### Voice Identity Verification

The voice identity verification service provides speaker recognition capabilities. Features include:

- Voice enrollment and profile management
- Speaker verification (1:1 matching)
- Speaker identification (1:many matching)
- Text-dependent and text-independent modes
- On-device and cloud-based verification options

### Voice Command Processor

The voice command processor enables voice-controlled interactions. Features include:

- Wake word detection and activation
- Intent extraction from spoken commands
- Parameter extraction
- Command routing to appropriate handlers
- Support for custom wake words

### Voice Integration Facade

The voice facade provides a unified interface to all voice capabilities. It serves as the main entry point for other components to interact with the voice system.

## Architecture

The Voice/ASR Integration module follows a layered architecture:

1. **Facade Layer** - `VoiceFacade` provides a simplified interface to all voice capabilities
2. **Service Layer** - Core services like `SpeechRecognitionService`, `TextToSpeechService`, etc.
3. **Implementation Layer** - Concrete implementations like `EnhancedSpeechRecognitionService`
4. **Provider Layer** - On-device and cloud-based providers

## Privacy Considerations

The system prioritizes privacy through:

- On-device processing options for all voice capabilities
- Default to on-device processing when possible
- Clear opt-in for cloud-based processing
- No persistent data collection without user consent
- Voice data is processed in memory and not stored unless explicitly requested

## Integration with Other Systems

The Voice/ASR Integration module integrates with:

- **Conversation System** - For voice-based interactions
- **Device Control System** - For voice-controlled device operations
- **Identity System** - For user recognition and personalization
- **Core System** - For access to Sallie's personality and values

## Usage Examples

### Basic Speech Recognition

```kotlin
// Initialize the speech recognition service
val speechRecognitionService = EnhancedSpeechRecognitionService()
speechRecognitionService.initialize()

// Start listening with a listener
speechRecognitionService.startListening(
    options = SpeechRecognitionOptions(continuous = false),
    listener = object : SpeechRecognitionListener {
        override fun onSpeechResult(result: SpeechRecognitionResult) {
            // Process the recognized text
            val recognizedText = result.hypotheses.firstOrNull()?.text
            if (recognizedText != null) {
                println("Recognized: $recognizedText")
            }
        }
        
        override fun onSpeechStarted() {
            println("Speech started")
        }
        
        override fun onSpeechEnded() {
            println("Speech ended")
        }
        
        override fun onError(error: SpeechRecognitionError) {
            println("Error: ${error.message}")
        }
    }
)

// Stop listening when done
speechRecognitionService.stopListening()
```

### Text-to-Speech Synthesis

```kotlin
// Initialize the text-to-speech service
val textToSpeechService = EnhancedTextToSpeechService()
textToSpeechService.initialize()

// Get available voices
val voices = textToSpeechService.getAvailableVoices()
println("Available voices: ${voices.map { it.name }}")

// Speak text
val options = SpeechSynthesisOptions(
    voiceId = voices.first().id,
    pitch = 1.0f,
    speakingRate = 1.0f
)
textToSpeechService.speak("Hello, I'm Sallie, your personal companion.", options)
```

### Voice Command Processing

```kotlin
// Initialize the voice command processor
val voiceCommandProcessor = EnhancedVoiceCommandProcessor(
    speechRecognitionService = speechRecognitionService,
    textToSpeechService = textToSpeechService
)
voiceCommandProcessor.initialize()

// Register a command handler
voiceCommandProcessor.registerCommandHandler(object : CommandHandler {
    override fun getSupportedIntents(): Set<String> {
        return setOf("get_weather", "set_reminder")
    }
    
    override suspend fun processCommand(command: Command): CommandResult {
        return when (command.intent) {
            "get_weather" -> {
                val location = command.params["location"] ?: "current location"
                CommandResult(
                    command = command,
                    isHandled = true,
                    response = "The weather in $location is sunny and 75 degrees.",
                    confidence = 0.9f
                )
            }
            "set_reminder" -> {
                val time = command.params["time"] ?: "later"
                val content = command.params["content"] ?: "your reminder"
                CommandResult(
                    command = command,
                    isHandled = true,
                    response = "I'll remind you to $content at $time.",
                    confidence = 0.9f
                )
            }
            else -> {
                CommandResult(
                    command = command,
                    isHandled = false,
                    errorMessage = "Unsupported intent: ${command.intent}"
                )
            }
        }
    }
})

// Start wake word detection
voiceCommandProcessor.startWakeWordDetection()

// Process a text command directly
val result = voiceCommandProcessor.processTextCommand("What's the weather in Paris?")
println("Response: ${result.response}")
```

### Using the Voice Facade

```kotlin
// Initialize the voice facade
val voiceFacade = VoiceFacade()
voiceFacade.initialize()

// Start voice activation (wake word detection)
voiceFacade.startVoiceActivation()

// Speak text
voiceFacade.speak("Hello, I'm Sallie, your personal companion.")

// Process a command
val result = voiceFacade.processTextCommand("Set a reminder for 5pm to call mom")
println("Command handled: ${result.isHandled}, Response: ${result.response}")

// Stop voice activation
voiceFacade.stopVoiceActivation()

// Shutdown when done
voiceFacade.shutdown()
```

## Future Enhancements

- Voice emotion detection
- Voice cloning with user consent
- Multi-speaker recognition
- Context-aware command processing
- Enhanced noise cancellation
- Support for additional languages
- Voice style customization

## Conclusion

The Voice/ASR Integration module provides Sallie with sophisticated voice capabilities while maintaining a focus on privacy, modularity, and extensibility. The system enables natural voice interaction while adhering to Sallie's values of trust, respect, and user control.

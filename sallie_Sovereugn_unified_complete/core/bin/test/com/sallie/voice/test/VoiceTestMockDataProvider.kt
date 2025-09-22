package com.sallie.voice.test

import com.sallie.voice.*
import java.io.File

/**
 * Mock data provider for voice tests
 */
class VoiceTestMockDataProvider {

    companion object {
        /**
         * Get a mock audio data byte array
         */
        fun getMockAudioData(): ByteArray {
            return ByteArray(16000) { it.toByte() }
        }
        
        /**
         * Create a mock audio file and return its path
         */
        fun createMockAudioFile(prefix: String = "mock_audio"): File {
            val file = File.createTempFile(prefix, ".wav")
            file.writeBytes(getMockAudioData())
            file.deleteOnExit()
            return file
        }
        
        /**
         * Get mock speech recognition options
         */
        fun getMockSpeechRecognitionOptions(): SpeechRecognitionOptions {
            return SpeechRecognitionOptions(
                languageCode = LanguageCode.EN_US,
                maxAlternatives = 3,
                enablePunctuation = true,
                enableWordTimestamps = true,
                continuous = false,
                interimResults = false,
                maxDurationSeconds = 60
            )
        }
        
        /**
         * Get mock speech recognition result
         */
        fun getMockSpeechRecognitionResult(text: String = "Hello, this is a test."): SpeechRecognitionResult {
            return SpeechRecognitionResult(
                hypotheses = listOf(
                    SpeechHypothesis(
                        text = text,
                        confidence = 0.92f,
                        isPartial = false,
                        words = listOf(
                            WordInfo("Hello", 0, 500, 0.95f),
                            WordInfo("this", 500, 750, 0.9f),
                            WordInfo("is", 750, 1000, 0.93f),
                            WordInfo("a", 1000, 1200, 0.96f),
                            WordInfo("test", 1200, 1800, 0.94f)
                        )
                    ),
                    SpeechHypothesis(
                        text = "Hello, it is a test.",
                        confidence = 0.85f,
                        isPartial = false
                    ),
                    SpeechHypothesis(
                        text = "Hello, this is test.",
                        confidence = 0.8f,
                        isPartial = false
                    )
                ),
                isFinal = true
            )
        }
        
        /**
         * Get mock transcription result
         */
        fun getMockTranscriptionResult(text: String = "This is a complete transcription of speech."): TranscriptionResult {
            return TranscriptionResult(
                text = text,
                confidence = 0.89f,
                durationMs = 5200,
                languageCode = LanguageCode.EN_US,
                segments = listOf(
                    TranscriptionSegment(
                        text = "This is a complete",
                        startTimeMs = 0,
                        endTimeMs = 2500,
                        confidence = 0.91f
                    ),
                    TranscriptionSegment(
                        text = "transcription of speech.",
                        startTimeMs = 2500,
                        endTimeMs = 5200,
                        confidence = 0.87f
                    )
                )
            )
        }
        
        /**
         * Get mock speech synthesis options
         */
        fun getMockSpeechSynthesisOptions(): SpeechSynthesisOptions {
            return SpeechSynthesisOptions(
                voiceId = "en-US-Neural2-F",
                languageCode = LanguageCode.EN_US,
                pitch = 1.0f,
                speakingRate = 1.0f,
                volume = 1.0f,
                audioFormat = AudioFormat.WAV_PCM_16KHZ_16BIT
            )
        }
        
        /**
         * Get mock synthesis result
         */
        fun getMockSynthesisResult(text: String = "Hello, this is synthesized speech."): SynthesisResult {
            return SynthesisResult(
                id = "synth_${System.currentTimeMillis()}",
                audioData = ByteArray(8000) { it.toByte() },
                duration = 4000,
                wordBoundaries = listOf(
                    SynthesisResult.WordBoundary("Hello", 0, 800),
                    SynthesisResult.WordBoundary("this", 800, 1200),
                    SynthesisResult.WordBoundary("is", 1200, 1600),
                    SynthesisResult.WordBoundary("synthesized", 1600, 3000),
                    SynthesisResult.WordBoundary("speech", 3000, 4000)
                )
            )
        }
        
        /**
         * Get mock voice info
         */
        fun getMockVoiceInfoList(): List<VoiceInfo> {
            return listOf(
                VoiceInfo(
                    id = "en-US-Neural2-F",
                    name = "Aria",
                    gender = VoiceGender.FEMALE,
                    age = VoiceAge.ADULT,
                    languageCodes = listOf(LanguageCode.EN_US),
                    sampleRateHertz = 24000,
                    naturalness = 0.95f,
                    isNeural = true,
                    requiresNetwork = true,
                    customizationSupport = true
                ),
                VoiceInfo(
                    id = "en-US-Standard1-M",
                    name = "Michael",
                    gender = VoiceGender.MALE,
                    age = VoiceAge.ADULT,
                    languageCodes = listOf(LanguageCode.EN_US),
                    sampleRateHertz = 16000,
                    naturalness = 0.7f,
                    isNeural = false,
                    requiresNetwork = false,
                    customizationSupport = false
                ),
                VoiceInfo(
                    id = "en-US-Wavenet1-F",
                    name = "Emma",
                    gender = VoiceGender.FEMALE,
                    age = VoiceAge.YOUNG_ADULT,
                    languageCodes = listOf(LanguageCode.EN_US),
                    sampleRateHertz = 24000,
                    naturalness = 0.85f,
                    isNeural = true,
                    requiresNetwork = true,
                    customizationSupport = false
                )
            )
        }
        
        /**
         * Get mock enrollment options
         */
        fun getMockEnrollmentOptions(): EnrollmentOptions {
            return EnrollmentOptions(
                minDurationSeconds = 5,
                phrase = "Sallie is my personal assistant",
                isTextDependent = true,
                sensitivityLevel = 7
            )
        }
        
        /**
         * Get mock enrollment result
         */
        fun getMockEnrollmentResult(userId: String = "user123"): EnrollmentResult {
            return EnrollmentResult(
                userId = userId,
                profileId = "profile_${userId}_${System.currentTimeMillis()}",
                isSuccessful = true,
                confidence = 0.86f,
                durationSeconds = 7.5f
            )
        }
        
        /**
         * Get mock verification options
         */
        fun getMockVerificationOptions(): VerificationOptions {
            return VerificationOptions(
                threshold = 0.7f,
                phrase = "Sallie is my personal assistant",
                isTextDependent = true
            )
        }
        
        /**
         * Get mock verification result
         */
        fun getMockVerificationResult(userId: String = "user123", isVerified: Boolean = true): VerificationResult {
            return VerificationResult(
                userId = userId,
                isVerified = isVerified,
                confidence = if (isVerified) 0.85f else 0.65f
            )
        }
        
        /**
         * Get mock identification options
         */
        fun getMockIdentificationOptions(): IdentificationOptions {
            return IdentificationOptions(
                threshold = 0.6f,
                maxResults = 3,
                phrase = null,
                isTextDependent = false
            )
        }
        
        /**
         * Get mock identification result
         */
        fun getMockIdentificationResult(isIdentified: Boolean = true): IdentificationResult {
            return if (isIdentified) {
                IdentificationResult(
                    isIdentified = true,
                    candidates = listOf(
                        IdentificationResult.IdentificationCandidate(
                            userId = "user123",
                            profileId = "profile_user123_1",
                            confidence = 0.87f
                        ),
                        IdentificationResult.IdentificationCandidate(
                            userId = "user456",
                            profileId = "profile_user456_1",
                            confidence = 0.65f
                        ),
                        IdentificationResult.IdentificationCandidate(
                            userId = "user789",
                            profileId = "profile_user789_1",
                            confidence = 0.58f
                        )
                    )
                )
            } else {
                IdentificationResult(
                    isIdentified = false,
                    candidates = listOf(
                        IdentificationResult.IdentificationCandidate(
                            userId = "user123",
                            profileId = "profile_user123_1",
                            confidence = 0.55f
                        ),
                        IdentificationResult.IdentificationCandidate(
                            userId = "user456",
                            profileId = "profile_user456_1",
                            confidence = 0.42f
                        )
                    )
                )
            }
        }
        
        /**
         * Get mock voice profiles
         */
        fun getMockVoiceProfiles(): List<VoiceProfile> {
            return listOf(
                VoiceProfile(
                    userId = "user123",
                    profileId = "profile_user123_1",
                    createdAt = System.currentTimeMillis() - 86400000, // 1 day ago
                    updatedAt = System.currentTimeMillis() - 3600000, // 1 hour ago
                    enrollmentCount = 3,
                    isTextDependent = true,
                    phrases = listOf("Sallie is my personal assistant", "Hello Sallie")
                ),
                VoiceProfile(
                    userId = "user456",
                    profileId = "profile_user456_1",
                    createdAt = System.currentTimeMillis() - 172800000, // 2 days ago
                    updatedAt = System.currentTimeMillis() - 172800000,
                    enrollmentCount = 1,
                    isTextDependent = false,
                    phrases = emptyList()
                )
            )
        }
        
        /**
         * Get mock command
         */
        fun getMockCommand(text: String = "What's the weather in New York?"): Command {
            return Command(
                id = "cmd_${System.currentTimeMillis()}",
                intent = "get_weather",
                text = text,
                params = mapOf("location" to "New York"),
                confidence = 0.91f,
                source = CommandSource.VOICE
            )
        }
        
        /**
         * Get mock command result
         */
        fun getMockCommandResult(isHandled: Boolean = true): CommandResult {
            val command = getMockCommand()
            return CommandResult(
                command = command,
                isHandled = isHandled,
                response = if (isHandled) "The weather in New York is 72°F and sunny." else null,
                confidence = if (isHandled) 0.9f else 0.0f,
                errorMessage = if (!isHandled) "No handler found for intent: get_weather" else null
            )
        }
    }
}

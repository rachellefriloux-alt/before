/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * Voice/ASR Integration Models
 */

package com.sallie.voice

import java.util.UUID

/**
 * Audio format specifications for voice processing
 */
data class AudioFormat(
    val sampleRate: Int,          // Hz
    val channels: Int,            // 1 = mono, 2 = stereo
    val bitsPerSample: Int,       // Typically 16 or 24
    val encoding: AudioEncoding   // PCM, MP3, etc.
)

/**
 * Audio encoding types
 */
enum class AudioEncoding {
    PCM_SIGNED,
    PCM_UNSIGNED,
    PCM_FLOAT,
    MP3,
    OGG_VORBIS,
    AAC,
    OPUS,
    FLAC,
    UNKNOWN
}

/**
 * Voice activation trigger types
 */
enum class VoiceActivationType {
    HOTWORD,       // Wake word like "Hey Sallie"
    CONTINUOUS,    // Always listening
    BUTTON,        // Manual activation
    PROXIMITY,     // Activated when near
    GESTURE        // Activated by gesture
}

/**
 * Language code for ASR and TTS
 */
data class LanguageCode(
    val language: String,  // ISO 639 language code (e.g., "en")
    val region: String?    // ISO 3166 region code (e.g., "US")
) {
    override fun toString(): String {
        return if (region != null) {
            "$language-$region"
        } else {
            language
        }
    }
    
    companion object {
        val ENGLISH_US = LanguageCode("en", "US")
        val ENGLISH_UK = LanguageCode("en", "GB")
        val SPANISH = LanguageCode("es", null)
        val FRENCH = LanguageCode("fr", null)
        val GERMAN = LanguageCode("de", null)
        val JAPANESE = LanguageCode("ja", null)
        val CHINESE = LanguageCode("zh", null)
        val KOREAN = LanguageCode("ko", null)
        
        fun parse(code: String): LanguageCode {
            val parts = code.split("-")
            return if (parts.size > 1) {
                LanguageCode(parts[0].lowercase(), parts[1].uppercase())
            } else {
                LanguageCode(parts[0].lowercase(), null)
            }
        }
    }
}

/**
 * Audio input source types
 */
enum class AudioSource {
    MICROPHONE,
    PHONE_CALL,
    BLUETOOTH_HEADSET,
    WIRED_HEADSET,
    EXTERNAL_MIC,
    SYSTEM_SOUND,
    FILE
}

/**
 * Recognized intent from speech
 */
data class SpeechIntent(
    val id: String = UUID.randomUUID().toString(),
    val text: String,
    val confidence: Float,
    val domain: String,
    val action: String,
    val parameters: Map<String, Any>,
    val timestamp: Long = System.currentTimeMillis()
)

/**
 * Recognition result from ASR
 */
data class RecognitionResult(
    val id: String = UUID.randomUUID().toString(),
    val text: String,
    val confidence: Float,
    val isFinal: Boolean,
    val languageCode: LanguageCode,
    val alternatives: List<Alternative> = emptyList(),
    val timestamp: Long = System.currentTimeMillis()
) {
    /**
     * Alternative recognition hypothesis
     */
    data class Alternative(
        val text: String,
        val confidence: Float
    )
}

/**
 * Voice recognition state
 */
enum class RecognitionState {
    INACTIVE,
    LISTENING,
    PROCESSING,
    SPEAKING,
    ERROR
}

/**
 * Voice identification result
 */
data class VoiceIdentificationResult(
    val id: String = UUID.randomUUID().toString(),
    val isKnownSpeaker: Boolean,
    val speakerId: String?,
    val speakerName: String?,
    val confidence: Float,
    val timestamp: Long = System.currentTimeMillis()
)

/**
 * Speaker profile for voice identification
 */
data class SpeakerProfile(
    val id: String = UUID.randomUUID().toString(),
    val name: String,
    val voiceprintData: ByteArray,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis(),
    val languageCodes: List<LanguageCode> = listOf(LanguageCode.ENGLISH_US)
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as SpeakerProfile

        if (id != other.id) return false
        if (name != other.name) return false
        if (!voiceprintData.contentEquals(other.voiceprintData)) return false
        if (createdAt != other.createdAt) return false
        if (updatedAt != other.updatedAt) return false
        if (languageCodes != other.languageCodes) return false

        return true
    }

    override fun hashCode(): Int {
        var result = id.hashCode()
        result = 31 * result + name.hashCode()
        result = 31 * result + voiceprintData.contentHashCode()
        result = 31 * result + createdAt.hashCode()
        result = 31 * result + updatedAt.hashCode()
        result = 31 * result + languageCodes.hashCode()
        return result
    }
}

/**
 * Speech synthesis options
 */
data class SpeechSynthesisOptions(
    val voiceId: String,
    val languageCode: LanguageCode,
    val pitch: Float = 1.0f,  // 0.5 to 2.0, 1.0 is normal
    val speakingRate: Float = 1.0f,  // 0.25 to 4.0, 1.0 is normal
    val volume: Float = 1.0f,  // 0.0 to 1.0
    val audioFormat: AudioFormat
)

/**
 * Voice characteristics for TTS customization
 */
data class VoiceCharacteristics(
    val gender: VoiceGender = VoiceGender.FEMALE,
    val age: VoiceAge = VoiceAge.YOUNG_ADULT,
    val accent: String? = null,
    val emotionalTone: EmotionalTone = EmotionalTone.NEUTRAL,
    val timbre: Float = 0.0f,  // -1.0 (soft) to 1.0 (bright)
    val breathiness: Float = 0.0f,  // 0.0 (clear) to 1.0 (breathy)
    val speed: Float = 1.0f  // Speech rate multiplier
)

/**
 * Voice gender types
 */
enum class VoiceGender {
    MALE,
    FEMALE,
    NEUTRAL
}

/**
 * Voice age categories
 */
enum class VoiceAge {
    CHILD,
    TEENAGER,
    YOUNG_ADULT,
    ADULT,
    SENIOR
}

/**
 * Emotional tones for speech synthesis
 */
enum class EmotionalTone {
    NEUTRAL,
    HAPPY,
    SAD,
    ANGRY,
    FEARFUL,
    SURPRISED,
    DISGUSTED,
    CALM,
    EXCITED,
    TENDER,
    SERIOUS,
    FRIENDLY
}

/**
 * Configuration for voice activation detection
 */
data class VoiceActivationConfig(
    val type: VoiceActivationType,
    val hotwords: List<String> = listOf("Hey Sallie", "Sallie"),
    val sensitivity: Float = 0.7f,  // 0.0 to 1.0
    val backgroundNoiseAdaption: Boolean = true,
    val pauseThresholdMs: Long = 1500,  // Pause length to consider end of speech
    val maxSpeechLengthMs: Long = 30000  // Maximum speech length before auto-cut
)

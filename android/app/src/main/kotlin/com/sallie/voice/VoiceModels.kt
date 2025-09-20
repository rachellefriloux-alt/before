/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * Values authenticity, respects boundaries, and maintains unwavering devotion
 * 
 * Voice Models - Data structures and types for voice synthesis and recognition
 */

package com.sallie.voice

/**
 * Speech synthesis options for TTS
 */
data class SpeechSynthesisOptions(
    val voiceId: String = "default",
    val languageCode: LanguageCode = LanguageCode.EN_US,
    val speakingRate: Float = 1.0f,        // 0.25 to 4.0
    val pitch: Float = 1.0f,               // 0.5 to 2.0
    val volumeGainDb: Float = 0.0f,        // -96.0 to 16.0
    val audioFormat: AudioFormat = AudioFormat.MP3,
    val sampleRateHertz: Int = 22050,
    val enableWordBoundaries: Boolean = false,
    val enableSsmlMarks: Boolean = false,
    val effects: List<AudioEffect> = emptyList()
)

/**
 * Supported language codes
 */
enum class LanguageCode(val code: String) {
    EN_US("en-US"),
    EN_GB("en-GB"),
    EN_AU("en-AU"),
    EN_CA("en-CA"),
    ES_ES("es-ES"),
    ES_MX("es-MX"),
    FR_FR("fr-FR"),
    DE_DE("de-DE"),
    IT_IT("it-IT"),
    JA_JP("ja-JP"),
    KO_KR("ko-KR"),
    PT_BR("pt-BR"),
    ZH_CN("zh-CN"),
    ZH_TW("zh-TW"),
    RU_RU("ru-RU"),
    AR_SA("ar-SA"),
    HI_IN("hi-IN"),
    NL_NL("nl-NL"),
    SV_SE("sv-SE"),
    NO_NO("no-NO"),
    DA_DK("da-DK"),
    FI_FI("fi-FI");
    
    companion object {
        fun fromCode(code: String): LanguageCode? {
            return values().find { it.code == code }
        }
    }
}

/**
 * Voice gender classification
 */
enum class VoiceGender {
    MALE,
    FEMALE,
    NEUTRAL
}

/**
 * Voice age classification
 */
enum class VoiceAge {
    CHILD,
    YOUNG_ADULT,
    ADULT,
    SENIOR
}

/**
 * Audio output formats
 */
enum class AudioFormat(val mimeType: String, val extension: String) {
    MP3("audio/mpeg", "mp3"),
    WAV("audio/wav", "wav"),
    OGG("audio/ogg", "ogg"),
    AAC("audio/aac", "aac"),
    FLAC("audio/flac", "flac"),
    PCM("audio/pcm", "pcm");
    
    companion object {
        fun fromMimeType(mimeType: String): AudioFormat? {
            return values().find { it.mimeType == mimeType }
        }
        
        fun fromExtension(extension: String): AudioFormat? {
            return values().find { it.extension == extension }
        }
    }
}

/**
 * Audio effects that can be applied to synthesized speech
 */
sealed class AudioEffect {
    /**
     * Telephony effect - makes voice sound like it's coming through a phone
     */
    object Telephony : AudioEffect()
    
    /**
     * Add reverberation to the voice
     */
    data class Reverb(val intensity: Float = 0.5f) : AudioEffect()
    
    /**
     * Add echo effect
     */
    data class Echo(val delay: Long = 500, val decay: Float = 0.3f) : AudioEffect()
    
    /**
     * Adjust the tone/timbre of the voice
     */
    data class ToneShift(val semitones: Float = 0.0f) : AudioEffect()
    
    /**
     * Add emotional expression to the voice
     */
    data class EmotionalTone(val emotion: EmotionalExpression) : AudioEffect()
}

/**
 * Emotional expressions that can be applied to voice synthesis
 */
enum class EmotionalExpression {
    NEUTRAL,
    HAPPY,
    SAD,
    ANGRY,
    EXCITED,
    CALM,
    WORRIED,
    CONFIDENT,
    GENTLE,
    ENCOURAGING,
    SYMPATHETIC,
    PLAYFUL,
    SERIOUS,
    LOVING,
    SUPPORTIVE
}

/**
 * Voice recognition events
 */
sealed class VoiceEvent {
    /**
     * Speech recognition started
     */
    object RecognitionStarted : VoiceEvent()
    
    /**
     * Partial recognition result (real-time)
     */
    data class PartialResult(val text: String, val confidence: Float) : VoiceEvent()
    
    /**
     * Final recognition result
     */
    data class FinalResult(val text: String, val confidence: Float, val isFinal: Boolean = true) : VoiceEvent()
    
    /**
     * Recognition error occurred
     */
    data class RecognitionError(val errorCode: String, val message: String) : VoiceEvent()
    
    /**
     * Speech synthesis started
     */
    data class SynthesisStarted(val text: String) : VoiceEvent()
    
    /**
     * Speech synthesis completed
     */
    data class SynthesisCompleted(val audioData: ByteArray, val duration: Long) : VoiceEvent() {
        override fun equals(other: Any?): Boolean {
            if (this === other) return true
            if (javaClass != other?.javaClass) return false

            other as SynthesisCompleted

            if (!audioData.contentEquals(other.audioData)) return false
            if (duration != other.duration) return false

            return true
        }

        override fun hashCode(): Int {
            var result = audioData.contentHashCode()
            result = 31 * result + duration.hashCode()
            return result
        }
    }
    
    /**
     * Synthesis error occurred
     */
    data class SynthesisError(val errorCode: String, val message: String) : VoiceEvent()
    
    /**
     * Voice activity detected
     */
    data class VoiceActivityDetected(val isActive: Boolean) : VoiceEvent()
    
    /**
     * Audio level changed
     */
    data class AudioLevelChanged(val level: Float) : VoiceEvent()
}

/**
 * Audio device types
 */
enum class AudioDeviceType {
    BUILTIN_EARPIECE,
    BUILTIN_SPEAKER,
    WIRED_HEADSET,
    WIRED_HEADPHONES,
    BLUETOOTH_SCO,
    BLUETOOTH_A2DP,
    USB_DEVICE,
    USB_ACCESSORY,
    DOCK,
    FM,
    BUILTIN_MIC,
    BACK_MIC,
    REMOTE_SUBMIX,
    TELEPHONY,
    TV_TUNER,
    LINE_ANALOG,
    LINE_DIGITAL,
    FM_TUNER,
    HDMI,
    SPDIF,
    UNKNOWN
}

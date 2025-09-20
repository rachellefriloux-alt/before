package com.sallie.feature

// Text-to-Speech (TTS) manager
class TTSManager {
    private var currentVoice: String = "default"
    private val speakHistory: MutableList<String> = mutableListOf()
    private val queue: ArrayDeque<String> = ArrayDeque()

    fun speak(text: String): String {
        queue.add(text)
        val processed = queue.removeFirst()
        speakHistory.add(processed)
        return "Speaking: $processed with voice $currentVoice"
    }

    fun switchVoice(profile: String): String {
        currentVoice = profile
        return "Voice switched to $profile"
    }

    fun getVoice(): String = currentVoice
    fun getSpeakHistory(): List<String> = speakHistory
    fun getPending(): List<String> = queue.toList()
}

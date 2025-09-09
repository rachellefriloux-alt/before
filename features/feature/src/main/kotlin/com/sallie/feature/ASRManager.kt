package com.sallie.feature

// Automatic Speech Recognition (ASR) manager
class ASRManager {
    private var listening: Boolean = false
    private val transcriptHistory: MutableList<String> = mutableListOf()
    private var partial: String = ""
    private var finalText: String = ""
    private var multiFinal: MutableList<String> = mutableListOf()
    private var rms: Float = 0f
    private val rmsHistory: ArrayDeque<Float> = ArrayDeque()
    private val maxRmsPoints = 120

    fun startListening(): String { listening = true; resetBuffers(); return "ASR listening..." }
    fun stopListening(): String { listening = false; return "ASR stopped." }

    private fun resetBuffers() { partial = ""; finalText = "" }

    fun ingestTranscript(text: String, isFinal: Boolean = false) {
        if (text.isBlank()) return
        if (isFinal) {
            finalText = text
            transcriptHistory.add(text)
            multiFinal.add(text)
            partial = ""
        } else {
            partial = text
        }
    }

    fun setRms(level: Float) { rms = level }
    fun rmsLevel(): Float = rms
    fun allFinal(): List<String> = multiFinal.toList()
    fun pushRms(level: Float) {
        rmsHistory.addLast(level)
        while (rmsHistory.size > maxRmsPoints) rmsHistory.removeFirst()
    }
    fun rmsSeries(): List<Float> = rmsHistory.toList()

    fun getTranscript(): String {
        if (!listening) return "Not listening"
        return when {
            finalText.isNotBlank() -> finalText
            partial.isNotBlank() -> "$partial ..."
            else -> "(no speech yet)"
        }
    }

    fun currentPartial(): String = partial
    fun isListening(): Boolean = listening
    fun getTranscriptHistory(): List<String> = transcriptHistory
}

package com.sallie.launcher

import android.app.Application
import android.content.Intent
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.SpeechRecognizer.ERROR_AUDIO
import android.speech.SpeechRecognizer.ERROR_CLIENT
import android.speech.SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS
import android.speech.SpeechRecognizer.ERROR_NETWORK
import android.speech.SpeechRecognizer.ERROR_NETWORK_TIMEOUT
import android.speech.SpeechRecognizer.ERROR_NO_MATCH
import android.speech.SpeechRecognizer.ERROR_RECOGNIZER_BUSY
import android.speech.SpeechRecognizer.ERROR_SERVER
import android.speech.SpeechRecognizer.ERROR_SPEECH_TIMEOUT
import android.speech.tts.TextToSpeech
import java.util.Locale

class PlatformASR(
    private val app: Application,
    private val onPartial: (String) -> Unit,
    private val onFinal: (String) -> Unit,
    private val onRms: (Float) -> Unit,
    private val onState: (String) -> Unit,
) : RecognitionListener {
    private var recognizer: SpeechRecognizer? = null

    fun start() {
        if (!SpeechRecognizer.isRecognitionAvailable(app)) {
            onState("ASR unavailable")
            return
        }
        if (recognizer == null) recognizer = SpeechRecognizer.createSpeechRecognizer(app).also { it.setRecognitionListener(this) }
        val intent =
            Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault())
                putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
            }
        recognizer?.startListening(intent)
        onState("listening")
    }

    fun stop() {
        recognizer?.stopListening()
        onState("stopped")
    }

    fun destroy() {
        recognizer?.destroy()
        recognizer = null
    }

    override fun onReadyForSpeech(params: Bundle?) {
        onState("ready")
    }

    override fun onBeginningOfSpeech() {
        onState("speech-begin")
    }

    override fun onRmsChanged(rmsdB: Float) {
        onRms(rmsdB)
    }

    override fun onBufferReceived(buffer: ByteArray?) {}

    override fun onEndOfSpeech() {
        onState("speech-end")
    }

    override fun onError(error: Int) {
        val msg =
            when (error) {
                ERROR_AUDIO -> "audio error"
                ERROR_CLIENT -> "client error"
                ERROR_INSUFFICIENT_PERMISSIONS -> "insufficient permissions"
                ERROR_NETWORK -> "network error"
                ERROR_NETWORK_TIMEOUT -> "network timeout"
                ERROR_NO_MATCH -> "no match"
                ERROR_RECOGNIZER_BUSY -> "recognizer busy"
                ERROR_SERVER -> "server error"
                ERROR_SPEECH_TIMEOUT -> "speech timeout"
                else -> "unknown error $error"
            }
        onState("error:$msg")
    }

    override fun onResults(results: Bundle?) {
        results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)?.firstOrNull()?.let(onFinal)
    }

    override fun onPartialResults(partialResults: Bundle?) {
        partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)?.firstOrNull()?.let(onPartial)
    }

    override fun onEvent(
        eventType: Int,
        params: Bundle?,
    ) {}
}

class PlatformTTS(app: Application, private val onState: (String) -> Unit) : TextToSpeech.OnInitListener {
    private var engine: TextToSpeech? = null
    private val application: Application = app

    init {
        engine = TextToSpeech(application, this)
    }

    fun speak(text: String) {
        engine?.speak(text, TextToSpeech.QUEUE_ADD, null, "sallie-${System.currentTimeMillis()}")
    }

    fun switchVoice(voiceName: String) {
        engine?.voices?.firstOrNull { it.name.contains(voiceName, true) }?.let { engine?.voice = it }
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            engine?.language = Locale.getDefault()
            onState("tts-ready")
        } else {
            onState("tts-error:$status")
        }
    }

    fun shutdownEngine() {
        engine?.shutdown()
        engine = null
    }
}

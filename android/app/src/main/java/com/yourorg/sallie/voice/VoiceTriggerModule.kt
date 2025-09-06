/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Voice trigger module for routines, theme swaps, and God-Mode activation.
 * Got it, love.
 */

package com.yourorg.sallie.voice

import android.content.Context
import android.speech.SpeechRecognizer
import android.speech.RecognizerIntent
import android.content.Intent
import android.os.Bundle
import android.util.Log
import kotlinx.coroutines.*
import java.util.*
import com.facebook.react.ReactApplication
import com.facebook.react.ReactInstanceManager
import com.facebook.react.bridge.ReactContext
import com.facebook.react.modules.core.RCTDeviceEventEmitter

object VoiceTriggerModule {
    private const val TAG = "VoiceTriggerModule"
    private var speechRecognizer: SpeechRecognizer? = null
    private var isListening = false
    private val triggerActions = mutableMapOf<String, TriggerAction>()
    private val coroutineScope = CoroutineScope(Dispatchers.Main + SupervisorJob())

    // Sealed class for trigger actions
    sealed class TriggerAction {
        data class Routine(val routineName: String) : TriggerAction()
        data class ThemeSwap(val themeName: String) : TriggerAction()
        object GodMode : TriggerAction()
        data class Custom(val action: () -> Unit) : TriggerAction()
    }

    fun initialize(context: Context, reactContext: ReactContext? = null) {
        this.reactContext = reactContext
        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(context)
        speechRecognizer?.setRecognitionListener(object : android.speech.RecognitionListener {
            override fun onReadyForSpeech(params: Bundle?) {
                Log.d(TAG, "Ready for speech")
                isListening = true
            }

            override fun onBeginningOfSpeech() {
                Log.d(TAG, "Beginning of speech")
            }

            override fun onRmsChanged(rmsdB: Float) {}

            override fun onBufferReceived(buffer: ByteArray?) {}

            override fun onEndOfSpeech() {
                Log.d(TAG, "End of speech")
                isListening = false
            }

            override fun onError(error: Int) {
                Log.e(TAG, "Speech recognition error: $error")
                isListening = false
                // Auto-restart listening on error
                startListening(context)
            }

            override fun onResults(results: Bundle?) {
                val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                matches?.firstOrNull()?.let { processVoiceInput(it) }
                // Continue listening
                startListening(context)
            }

            override fun onPartialResults(partialResults: Bundle?) {}

            override fun onEvent(eventType: Int, params: Bundle?) {}
        })

        registerDefaultTriggers()
    }

    fun startListening(context: Context) {
        if (isListening) return

        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault())
            putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1)
            putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
        }

        speechRecognizer?.startListening(intent)
    }

    fun stopListening() {
        speechRecognizer?.stopListening()
        isListening = false
    }

    fun destroy() {
        speechRecognizer?.destroy()
        speechRecognizer = null
        coroutineScope.cancel()
    }

    private fun processVoiceInput(input: String) {
        val lowerInput = input.lowercase()
        Log.d(TAG, "Processing voice input: $lowerInput")

        for ((phrase, action) in triggerActions) {
            if (lowerInput.contains(phrase.lowercase())) {
                executeTrigger(action)
                return
            }
        }

        Log.d(TAG, "No matching trigger found for: $lowerInput")
    }

    private fun executeTrigger(action: TriggerAction) {
        coroutineScope.launch {
            try {
                when (action) {
                    is TriggerAction.Routine -> executeRoutine(action.routineName)
                    is TriggerAction.ThemeSwap -> swapTheme(action.themeName)
                    is TriggerAction.GodMode -> activateGodMode()
                    is TriggerAction.Custom -> action.action()
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error executing trigger", e)
            }
        }
    }

    private fun executeRoutine(routineName: String) {
        Log.d(TAG, "Executing routine: $routineName")
        try {
            // Send event to React Native RoutineSequencerModule
            val reactContext = getReactApplicationContext()
            if (reactContext != null) {
                reactContext
                    .getJSModule(RCTDeviceEventEmitter::class.java)
                    .emit("VoiceTriggerRoutine", mapOf(
                        "routineName" to routineName,
                        "trigger" to "voice",
                        "timestamp" to System.currentTimeMillis()
                    ))
                Log.d(TAG, "Sent routine execution event to React Native: $routineName")
            } else {
                Log.w(TAG, "React context not available for routine execution")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to execute routine via React Native", e)
        }
    }

    private fun swapTheme(themeName: String) {
        Log.d(TAG, "Swapping to theme: $themeName")
        try {
            // Send event to React Native ThemeComposerUI
            val reactContext = getReactApplicationContext()
            if (reactContext != null) {
                reactContext
                    .getJSModule(RCTDeviceEventEmitter::class.java)
                    .emit("VoiceTriggerTheme", mapOf(
                        "themeName" to themeName,
                        "trigger" to "voice",
                        "timestamp" to System.currentTimeMillis()
                    ))
                Log.d(TAG, "Sent theme swap event to React Native: $themeName")
            } else {
                Log.w(TAG, "React context not available for theme swap")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to swap theme via React Native", e)
        }
    }

    private fun activateGodMode() {
        Log.d(TAG, "Activating God-Mode")
        try {
            // Send event to React Native for God-Mode activation
            val reactContext = getReactApplicationContext()
            if (reactContext != null) {
                reactContext
                    .getJSModule(RCTDeviceEventEmitter::class.java)
                    .emit("VoiceTriggerGodMode", mapOf(
                        "action" to "activate",
                        "trigger" to "voice",
                        "timestamp" to System.currentTimeMillis()
                    ))
                Log.d(TAG, "Sent God-Mode activation event to React Native")
            } else {
                Log.w(TAG, "React context not available for God-Mode activation")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to activate God-Mode via React Native", e)
        }
    }

    fun registerTrigger(phrase: String, action: TriggerAction) {
        triggerActions[phrase] = action
        Log.d(TAG, "Registered trigger: $phrase")
    }

    fun unregisterTrigger(phrase: String) {
        triggerActions.remove(phrase)
        Log.d(TAG, "Unregistered trigger: $phrase")
    }

    private fun registerDefaultTriggers() {
        // God-Mode triggers
        registerTrigger("activate god mode", TriggerAction.GodMode)
        registerTrigger("enter god mode", TriggerAction.GodMode)
        registerTrigger("god mode on", TriggerAction.GodMode)

        // Routine triggers
        registerTrigger("start morning routine", TriggerAction.Routine("morning"))
        registerTrigger("begin evening routine", TriggerAction.Routine("evening"))
        registerTrigger("run workout routine", TriggerAction.Routine("workout"))

        // Theme triggers
        registerTrigger("switch to dark theme", TriggerAction.ThemeSwap("dark"))
        registerTrigger("change to light theme", TriggerAction.ThemeSwap("light"))
        registerTrigger("apply nature theme", TriggerAction.ThemeSwap("nature"))
    }

    fun isListening(): Boolean = isListening

    private var reactContext: ReactContext? = null

    fun setReactContext(context: ReactContext) {
        reactContext = context
    }

    private fun getReactApplicationContext(): ReactContext? {
        return reactContext ?: try {
            // Fallback: try to get from application
            val app = android.app.Application.getProcessName()?.let {
                android.app.Application()
            } ?: return null

            if (app is ReactApplication) {
                val reactInstanceManager = app.reactNativeHost.reactInstanceManager
                reactInstanceManager.currentReactContext
            } else {
                Log.w(TAG, "Application is not a ReactApplication")
                null
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to get React application context", e)
            null
        }
    }
}

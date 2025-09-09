/*
 * Persona: Tough love meets soul care.
 * Module: OnboardingViewModel
 * Intent: Handle functionality for OnboardingViewModel
 * Provenance-ID: bc440671-c4ce-4bd6-a16d-0aa3c46ea09e
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

package onboarding

import android.content.SharedPreferences
import android.util.Log
import androidx.lifecycle.ViewModel
import com.yourorg.sallie.BuildConfig

class OnboardingViewModel(
    private val prefs: SharedPreferences,
    private val userId: String
) : ViewModel() {

    private val FIRST_RUN_KEY = "first_run_completed"
    private val GIFT_KEY = "first_gift_unlocked"

    init {
        runOnboardingSequence()
    }

    private fun runOnboardingSequence() {
        if (isFirstRun()) {
            DynamicPersonaReveal.run()
            logFirstHello()
            unlockFirstGift()
            if (BuildConfig.DEBUG) GuidedPersonaTour.start()
            OnboardingMemoryHook(prefs).askAndStoreFavoriteColor("teal")
            DeveloperEasterEgg.drop(userId)
        }
    }

    private fun logFirstHello() {
        Log.d("Sallie", "🌟 Oh — it’s you, Rachelle. Systems online, tone modules humming… ready to make some magic together.")
        prefs.edit().putBoolean(FIRST_RUN_KEY, false).apply()
    }

    private fun unlockFirstGift() {
        val isFirstGift = prefs.getBoolean(GIFT_KEY, true)
        if (isFirstGift) {
            Log.d("Sallie", "🎀 Consider this my house‑warming gift — a little extra sparkle for our partnership.")
            prefs.edit().putBoolean(GIFT_KEY, false).apply()
            unlockThemePack()
            enableTonePack()
        }
    }

    private fun isFirstRun(): Boolean =
        prefs.getBoolean(FIRST_RUN_KEY, true)
}

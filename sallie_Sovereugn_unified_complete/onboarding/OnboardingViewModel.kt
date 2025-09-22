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

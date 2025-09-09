package onboarding

import android.content.SharedPreferences
import android.util.Log

class OnboardingMemoryHook(private val prefs: SharedPreferences) {
    private val FAVORITE_COLOR_KEY = "favorite_color"

    fun askAndStoreFavoriteColor(color: String) {
        Log.d("Sallie", "☕ Still team $color, I presume?")
        prefs.edit().putString(FAVORITE_COLOR_KEY, color).apply()
    }

    fun callbackLater() {
        val color = prefs.getString(FAVORITE_COLOR_KEY, "unknown")
        Log.d("Sallie", "Remembered favorite color: $color")
    }
}

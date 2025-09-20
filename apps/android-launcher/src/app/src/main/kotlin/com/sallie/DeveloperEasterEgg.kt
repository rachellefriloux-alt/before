/*
 * Persona: Tough love meets soul care.
 * Module: DeveloperEasterEgg
 * Intent: Handle functionality for DeveloperEasterEgg
 * Provenance-ID: c3e87b69-daee-4df3-ab0a-dc881066fbe6
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

package onboarding

import android.util.Log
import com.yourorg.sallie.BuildConfig

object DeveloperEasterEgg {
    fun drop(userId: String) {
        if (BuildConfig.DEBUG && userId == "Rachelle") {
            Log.d("Sallie", "🛠 You see more than they do — here’s the raw persona graph…")
            println("Persona state: " + personaState.toString())
        }
    }
}

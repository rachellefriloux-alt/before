package com.sallie.launcher

import android.content.ComponentName
import android.content.Context
import android.content.pm.PackageManager
import java.util.Calendar
import android.os.Handler
import android.os.Looper

/**
 * ThemeController decides which launcher activity-alias to expose based on
 * persona (flavor), season, mood score and calendar events. It enables exactly
 * one alias and disables all others without killing the app process.
 */
object ThemeController {

    fun applyDynamicTheme(context: Context, moodScore: Int) {
    val persona = context.getString(R.string.persona_mode) // flavor-defined string
    val season = season()
    val mood = moodTier(moodScore)
    val suffix = eventSuffix() // may be ""
    val aliasName = "${context.packageName}.${persona}_${season}_${mood}${suffix}_Alias"
    swapIcon(aliasName, context)
    }

    private fun season(): String = when (Calendar.getInstance().get(Calendar.MONTH)) {
        Calendar.MARCH, Calendar.APRIL, Calendar.MAY -> "spring"
        Calendar.JUNE, Calendar.JULY, Calendar.AUGUST -> "summer"
        Calendar.SEPTEMBER, Calendar.OCTOBER, Calendar.NOVEMBER -> "autumn"
        else -> "winter"
    }

    private fun moodTier(score: Int) = when (score) {
        in 80..100 -> "high"
        in 50..79 -> "steady"
        in 20..49 -> "reflective"
        else -> "low"
    }

    private fun eventSuffix(): String {
        val cal = Calendar.getInstance()
        val month = cal.get(Calendar.MONTH) + 1
        val day = cal.get(Calendar.DAY_OF_MONTH)
        return when {
            month == 2 && day == 14 -> "_valentines"
            month == 6 -> "_pride"
            month == 8 && day == 13 -> "_birthday"
            else -> ""
        }
    }

    fun swapIcon(fullAliasName: String, context: Context) {
        val pm = context.packageManager
        val allComponents = AllAliases
            .fullyQualified(context.packageName)
            .map { ComponentName(context, it) }

        // Disable everything first (idempotent)
        allComponents.forEach { cmp ->
            pm.setComponentEnabledSetting(
                cmp,
                PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
                PackageManager.DONT_KILL_APP
            )
        }

        // Determine final component (fallback safe)
        val target = ComponentName(context, fullAliasName)
        val finalComponent = if (target in allComponents) target else ComponentName(
            context,
            "${context.packageName}.CreatorAlias"
        )

        pm.setComponentEnabledSetting(
            finalComponent,
            PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
            PackageManager.DONT_KILL_APP
        )
    }

    fun animateIconSwap(frames: List<String>, context: Context, frameDelayMs: Long = 120L) {
        frames.forEachIndexed { index, alias ->
            Handler(Looper.getMainLooper()).postDelayed({
                swapIcon(alias, context)
            }, index * frameDelayMs)
        }
    }
}

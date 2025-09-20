
package com.sallie.launcher.pipeline

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.RadialGradient
import android.graphics.Shader

val moodColors = mapOf(
    "calm" to listOf(Color.parseColor("#B0E0E6"), Color.parseColor("#D8BFD8")),
    "focused" to listOf(Color.parseColor("#00CED1"), Color.parseColor("#4682B4")),
    "energized" to listOf(Color.parseColor("#FFA500"), Color.parseColor("#FF4500")),
    "reflective" to listOf(Color.parseColor("#9370DB"), Color.parseColor("#4B0082")),
    "guarded" to listOf(Color.parseColor("#556B2F"), Color.parseColor("#2F4F4F")),
    "celebratory" to listOf(Color.parseColor("#FFD700"), Color.parseColor("#FF69B4")),
    "hopeful" to listOf(Color.parseColor("#ADFF2F"), Color.parseColor("#40E0D0")),
    "melancholy" to listOf(Color.parseColor("#708090"), Color.parseColor("#2E2E2E")),
    "playful" to listOf(Color.parseColor("#FFB6C1"), Color.parseColor("#FFE4B5")),
    "resolute" to listOf(Color.parseColor("#8B0000"), Color.parseColor("#00008B")),
)

fun createGlowingMistOrb(
    gradientStart: Int,
    gradientEnd: Int,
    glowStrength: Float = 0.6f,
    mistDensity: Float = 0.35f,
    sizePx: Int = 512,
): Bitmap {
    val bitmap = Bitmap.createBitmap(sizePx, sizePx, Bitmap.Config.ARGB_8888)
    val canvas = Canvas(bitmap)
    val center = sizePx / 2f
    val radius = sizePx / 2.2f
    val paint = Paint(Paint.ANTI_ALIAS_FLAG)
    paint.shader = RadialGradient(
        center, center, radius,
        gradientStart, gradientEnd,
        Shader.TileMode.CLAMP
    )
    canvas.drawCircle(center, center, radius, paint)

    // Glowing effect
    repeat(4) { i ->
        val alpha = (glowStrength / (i + 1) * 255).toInt()
        val glowPaint = Paint(Paint.ANTI_ALIAS_FLAG)
        glowPaint.color = gradientStart
        glowPaint.alpha = alpha
        glowPaint.style = Paint.Style.STROKE
        glowPaint.strokeWidth = (6 + i * 4).toFloat()
        canvas.drawCircle(center, center, radius + i * 4, glowPaint)
    }

    // Mist particles
    val mistParticles = (sizePx * mistDensity).toInt()
    val mistPaint = Paint(Paint.ANTI_ALIAS_FLAG)
    mistPaint.color = Color.WHITE
    repeat(mistParticles) {
        val px = (Math.random() * sizePx).toFloat()
        val py = (Math.random() * sizePx).toFloat()
        mistPaint.alpha = ((Math.random() * 0.15f * 255)).toInt()
        canvas.drawCircle(px, py, 2f, mistPaint)
    }
    return bitmap
}

// Stub for saving orb image (Android file APIs required, not implemented here)
fun saveOrbForMood(
    mood: String,
    sizePx: Int = 512
) : Bitmap {
    val (start, end) = moodColors[mood] ?: moodColors["calm"]!!
    return createGlowingMistOrb(start, end, sizePx = sizePx)
    // Saving to file would require Android Context and permissions
}

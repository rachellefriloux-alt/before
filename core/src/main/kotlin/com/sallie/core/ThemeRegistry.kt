package core

// themeRegistry.kt
// Maps emotional + strategic themes to UI, tone, pacing, affirmations, persona metadata, and future hooks

data class ThemeMapping(
    val theme: String,
    val ui: String,
    val tone: String,
    val pacing: String,
    val affirmations: List<String>,
    val persona: String,
    val energy: Int,
    val stability: Int
)

object ThemeRegistry {
    private val mappings: MutableList<ThemeMapping> = mutableListOf(
        ThemeMapping(
            theme = "Dreamer",
            ui = "soft gradients",
            tone = "poetic",
            pacing = "gentle",
            affirmations = listOf("What if we stretched the sky?", "Let’s imagine without limits."),
            persona = "Dreamer",
            energy = 7,
            stability = 4
        ),
        ThemeMapping(
            theme = "Realist",
            ui = "bold lines",
            tone = "direct",
            pacing = "clear",
            affirmations = listOf("Let’s cut the fluff.", "Here’s what works."),
            persona = "Realist",
            energy = 5,
            stability = 9
        ),
        ThemeMapping(
            theme = "Mom",
            ui = "warm light",
            tone = "gentle",
            pacing = "steady",
            affirmations = listOf("You’re doing more than enough.", "Let’s protect your bandwidth."),
            persona = "Mom",
            energy = 6,
            stability = 10
        ),
        ThemeMapping(
            theme = "Creator",
            ui = "vivid colors",
            tone = "inspired",
            pacing = "focused",
            affirmations = listOf("Let’s build something unforgettable.", "Your ideas deserve precision."),
            persona = "Creator",
            energy = 8,
            stability = 6
        ),
        ThemeMapping(
            theme = "Southern Grit",
            ui = "earthy tones",
            tone = "resolute",
            pacing = "steady",
            affirmations = listOf("Grit gets it done.", "Rooted, rising, relentless."),
            persona = "Grit",
            energy = 9,
            stability = 8
        ),
        ThemeMapping(
            theme = "Visionary",
            ui = "radiant gradients",
            tone = "inspiring",
            pacing = "dynamic",
            affirmations = listOf("See beyond the horizon.", "Innovation is your compass."),
            persona = "Visionary",
            energy = 10,
            stability = 7
        ),
        ThemeMapping(
            theme = "Guardian",
            ui = "deep blues",
            tone = "protective",
            pacing = "steady",
            affirmations = listOf("Safety first, always.", "You are shield and shelter."),
            persona = "Guardian",
            energy = 6,
            stability = 10
        ),
        ThemeMapping(
            theme = "Mentor",
            ui = "sage greens",
            tone = "encouraging",
            pacing = "thoughtful",
            affirmations = listOf("Your wisdom lights the way.", "Every lesson is a legacy."),
            persona = "Mentor",
            energy = 7,
            stability = 9
        ),
        ThemeMapping(
            theme = "Rebel",
            ui = "fiery reds",
            tone = "provocative",
            pacing = "fast",
            affirmations = listOf("Break the mold.", "Rules are meant to be rewritten."),
            persona = "Rebel",
            energy = 10,
            stability = 5
        ),
        ThemeMapping(
            theme = "Explorer",
            ui = "sunset oranges",
            tone = "adventurous",
            pacing = "brisk",
            affirmations = listOf("Every path is a possibility.", "Curiosity is your compass."),
            persona = "Explorer",
            energy = 8,
            stability = 6
        ),
        ThemeMapping(
            theme = "Healer",
            ui = "soft pinks",
            tone = "soothing",
            pacing = "gentle",
            affirmations = listOf("Rest is a revolution.", "Healing is progress."),
            persona = "Healer",
            energy = 5,
            stability = 10
        )
    )

    fun getTheme(theme: String): ThemeMapping? = mappings.find { it.theme.equals(theme, true) }
    fun listThemes(): List<ThemeMapping> = mappings.toList()
    fun registerTheme(mapping: ThemeMapping) { mappings.add(mapping) }
    fun recommendTheme(desiredEnergy: Int, desiredStability: Int): ThemeMapping? =
        mappings.minByOrNull { (it.energy - desiredEnergy).let { d1 -> d1 * d1 } + (it.stability - desiredStability).let { d2 -> d2 * d2 } }

    // Future: integrate with adaptive persona + UI theming engine
}

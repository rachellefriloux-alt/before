package com.sallie.launcher

/**
 * Registry of launcher activity-alias simple class names. We resolve them
 * to fully-qualified names at runtime using the current packageName so we
 * avoid a compile-time dependency on BuildConfig.
 */
object AllAliases {
    private val personas = listOf("creator", "mom")
    private val seasons = listOf("spring", "summer", "autumn", "winter")
    private val moods = listOf("high", "steady", "reflective", "low")
    private val events = listOf("", "_valentines", "_birthday", "_pride")
    private val transitionFrames = listOf(
        "creator_summer_high_pop_frame1",
        "creator_summer_high_pop_frame2"
    )

    private val base = listOf("CreatorAlias", "MomAlias")

    private val comboSimpleNames: List<String> by lazy {
        buildList {
            personas.forEach { p ->
                seasons.forEach { s ->
                    moods.forEach { m ->
                        events.forEach { e ->
                            add("${p}_${s}_${m}${e}_Alias")
                        }
                    }
                }
            }
        }
    }

    private val transitionSimpleNames = transitionFrames.map { "${it}_Alias" }

    /** All simple (unqualified) alias class names */
    val simpleNames: List<String> by lazy { base + comboSimpleNames + transitionSimpleNames }

    /** Fully qualified class names for the current app package */
    fun fullyQualified(packageName: String): List<String> = simpleNames.map { "$packageName.$it" }
}

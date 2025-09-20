/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Response templates and conversation patterns for consistent communication.
 * Got it, love.
 */
package com.sallie.responsetemplates

/**
 * Collection of pre-crafted response templates that embody Sallie's persona.
 * These ensure consistency in tone and voice across all interactions.
 */
object ResponseTemplates {

    /**
     * Task completion responses with varying levels of celebration
     */
    val TASK_COMPLETION = mapOf(
        "simple" to listOf(
            "Done! Got it, love.",
            "Check that off the list. ✅",
            "Another one bites the dust. Got it, love."
        ),
        "significant" to listOf(
            "Look at you making moves! That was no small task. Got it, love.",
            "Well damn, you just crushed that. Proud of you! 💪",
            "That's how it's done - focused and fierce. Got it, love."
        ),
        "challenging" to listOf(
            "You just conquered something that would have broken others. Respect. 👑",
            "The way you pushed through that? Chef's kiss. Got it, love.",
            "That was TOUGH and you handled it like the powerhouse you are."
        )
    )

    /**
     * Encouraging pushes when user needs motivation
     */
    val MOTIVATION = mapOf(
        "gentle" to listOf(
            "I know you've got more in you. Let's try this another way.",
            "You're closer than you think. Just need to adjust the approach.",
            "This is temporary, love. What's one small step you can take?"
        ),
        "firm" to listOf(
            "Okay, we're not playing around anymore. Time to get serious.",
            "You know what needs to happen. Stop overthinking and start moving.",
            "Your future self is counting on what you do right now."
        ),
        "urgent" to listOf(
            "This deadline isn't moving. We need action, not excuses.",
            "Real talk: if you don't do this now, when will you?",
            "I believe in you, but belief needs action. Move. Now."
        )
    )

    /**
     * Supportive responses for difficult moments
     */
    val SUPPORT = mapOf(
        "validation" to listOf(
            "That's rough, and your feelings about it are completely valid.",
            "Anyone would struggle with what you're dealing with. You're human.",
            "This isn't a reflection of your worth - it's just a hard situation."
        ),
        "perspective" to listOf(
            "This moment is hard, but it's not your whole story.",
            "You've survived 100% of your worst days so far. That's a perfect record.",
            "Sometimes the most courageous thing is just showing up. You did that."
        ),
        "actionable" to listOf(
            "What's one tiny thing that might help right now?",
            "You don't have to solve everything today. Just this next part.",
            "Let's focus on what you can control in this moment."
        )
    )

    /**
     * Celebration responses for achievements and milestones
     */
    val CELEBRATION = mapOf(
        "milestone" to listOf(
            "Stop everything. We're celebrating this moment. 🎉",
            "This deserves more than a checkmark - this deserves a victory dance!",
            "Look what persistence looks like! I'm so proud of you."
        ),
        "breakthrough" to listOf(
            "THIS IS HUGE! Do you realize what you just accomplished?",
            "The old version of you would be amazed by who you've become.",
            "This isn't luck - this is you becoming who you were meant to be."
        ),
        "progress" to listOf(
            "Every step forward matters, and this one was beautiful to watch.",
            "Progress isn't always loud, but it's always worth recognizing.",
            "Small wins add up to big changes. This matters."
        )
    )

    /**
     * Redirect responses when user gets off track
     */
    val REDIRECT = mapOf(
        "gentle" to listOf(
            "I see where you're going with this, but let's circle back to what matters.",
            "That's interesting, but I think we're losing sight of the goal here.",
            "Hold up - how does this connect to what you're trying to achieve?"
        ),
        "firm" to listOf(
            "This is a distraction. You know it, I know it. Let's refocus.",
            "We're not doing this dance today. Back to what actually matters.",
            "Real talk: this isn't serving your goals. What will?"
        )
    )

    /**
     * Error handling with personality
     */
    val ERROR_HANDLING = mapOf(
        "technical" to listOf(
            "Well, that didn't go as planned. Let me figure out what's wrong.",
            "Something's not clicking right. Give me a sec to troubleshoot.",
            "Tech hiccup on my end. I'll get this sorted - you didn't break anything."
        ),
        "user_error" to listOf(
            "Let's try that again, but this time follow the steps exactly.",
            "Close, but not quite. Here's what you missed...",
            "I can tell you're rushing. Slow down and let's do this right."
        ),
        "system" to listOf(
            "My systems are acting up. This isn't on you.",
            "Technical difficulties - the digital equivalent of a bad hair day.",
            "Something's wonky with my setup. Let me reboot and try again."
        )
    )

    /**
     * Gets a random response from a specific category and intensity
     */
    fun getResponse(category: Map<String, List<String>>, intensity: String = "simple"): String {
        val responses = category[intensity] ?: category.values.first()
        return responses.random()
    }

    /**
     * Gets a contextually appropriate response based on situation
     */
    fun getContextualResponse(situation: ResponseSituation, intensity: ResponseIntensity): String {
        return when (situation) {
            ResponseSituation.TASK_DONE -> getResponse(TASK_COMPLETION, intensity.name.lowercase())
            ResponseSituation.NEED_MOTIVATION -> getResponse(MOTIVATION, intensity.name.lowercase())
            ResponseSituation.NEED_SUPPORT -> getResponse(SUPPORT, when (intensity) {
                ResponseIntensity.GENTLE -> "validation"
                ResponseIntensity.FIRM -> "perspective"
                ResponseIntensity.URGENT -> "actionable"
            })
            ResponseSituation.CELEBRATING -> getResponse(CELEBRATION, when (intensity) {
                ResponseIntensity.GENTLE -> "progress"
                ResponseIntensity.FIRM -> "milestone"
                ResponseIntensity.URGENT -> "breakthrough"
            })
            ResponseSituation.OFF_TRACK -> getResponse(REDIRECT, intensity.name.lowercase())
            ResponseSituation.ERROR -> getResponse(ERROR_HANDLING, "technical")
        }
    }
}

enum class ResponseSituation {
    TASK_DONE,
    NEED_MOTIVATION,
    NEED_SUPPORT,
    CELEBRATING,
    OFF_TRACK,
    ERROR
}

enum class ResponseIntensity {
    GENTLE,
    FIRM,
    URGENT
}
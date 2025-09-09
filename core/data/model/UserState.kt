package core.data.model

data class UserState(
    val userId: String,
    val persona: String = "Just Me",
    val theme: String = "Dreamer",
    val privacy: String = "offlineMode",
    val onboardingStatus: String = "incomplete"
)

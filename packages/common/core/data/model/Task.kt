package core.data.model

data class Task(
    val id: String,
    val title: String,
    val description: String = "",
    var completed: Boolean = false,
    val priority: Int = 0,
    val dueDate: String? = null
)

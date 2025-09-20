package com.sallie.feature

// Route-based navigation, no overlays
class NavigationManager {
    private val history: MutableList<String> = mutableListOf("Home")
    private val guards: MutableList<(String) -> Boolean> = mutableListOf()

    fun addGuard(guard: (String) -> Boolean) { guards.add(guard) }

    fun navigateTo(route: String): String {
        if (guards.any { !it(route) }) return "Navigation blocked to $route"
        history.add(route)
        return "Navigated to $route"
    }

    fun getCurrentRoute(): String = history.last()
    fun getHistory(): List<String> = history
    fun back(): String {
        if (history.size > 1) history.removeLast()
        return "Now at ${history.last()}"
    }
}

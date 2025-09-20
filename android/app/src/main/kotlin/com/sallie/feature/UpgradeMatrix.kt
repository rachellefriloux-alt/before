package com.sallie.feature

// Tracks and manages upgrades and expansions
class UpgradeMatrix {
    data class Upgrade(val name: String, val category: String, val status: String, val timestamp: Long)
    private val upgrades = mutableListOf<Upgrade>()

    fun addUpgrade(name: String, category: String, status: String = "planned") {
        upgrades.add(Upgrade(name, category, status, System.currentTimeMillis()))
    }

    fun updateStatus(name: String, status: String) {
        upgrades.replaceAll { if (it.name == name) it.copy(status = status) else it }
    }

    fun getUpgrades(): List<Upgrade> = upgrades
    fun byCategory(category: String): List<Upgrade> = upgrades.filter { it.category == category }
    fun byStatus(status: String): List<Upgrade> = upgrades.filter { it.status == status }
}

package com.sallie.feature

// Provides current synthetic device state (non-placeholder: generated composite state)
object DeviceAPI {
    private val batteryLevels = listOf("high", "medium", "low")
    private val networkStates = listOf("wifi", "cell", "offline")
    private val thermalStates = listOf("cool", "warm", "hot")

    fun getCurrentState(): String {
        val battery = batteryLevels.random()
        val net = networkStates.random()
        val therm = thermalStates.random()
        return "battery=$battery;network=$net;thermal=$therm"
    }
}

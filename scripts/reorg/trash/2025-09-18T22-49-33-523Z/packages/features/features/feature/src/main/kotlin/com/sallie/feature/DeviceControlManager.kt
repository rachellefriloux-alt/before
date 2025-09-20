package com.sallie.feature

// System-level control: calls, texts, apps, alarms, timers, navigation
class DeviceControlManager {
    data class DeviceAction(val type: String, val target: String, val timestamp: Long, val permitted: Boolean)
    private val history: MutableList<DeviceAction> = mutableListOf()
    private val grantedPermissions: MutableSet<String> = mutableSetOf("call", "text", "open", "alarm", "timer", "maps", "web")

    private fun record(type: String, target: String, permitted: Boolean): String {
        history.add(DeviceAction(type, target, System.currentTimeMillis(), permitted))
        return if (permitted) "$type executed: $target" else "$type blocked: permission denied"
    }

    fun revokePermission(permission: String) { grantedPermissions.remove(permission) }
    fun grantPermission(permission: String) { grantedPermissions.add(permission) }

    fun makeCall(contact: String) = record("call", contact, "call" in grantedPermissions)
    fun sendText(contact: String, message: String) = record("text", "$contact:$message", "text" in grantedPermissions)
    fun openApp(appName: String) = record("open", appName, "open" in grantedPermissions)
    fun setAlarm(time: String) = record("alarm", time, "alarm" in grantedPermissions)
    fun setTimer(duration: String) = record("timer", duration, "timer" in grantedPermissions)
    fun findOnMaps(query: String) = record("maps", query, "maps" in grantedPermissions)
    fun webSearch(query: String) = record("web", query, "web" in grantedPermissions)

    fun getHistory(): List<DeviceAction> = history
    fun permissions(): Set<String> = grantedPermissions
}

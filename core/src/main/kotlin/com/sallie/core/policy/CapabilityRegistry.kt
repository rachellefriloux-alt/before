package com.sallie.core.policy

// 🛡 SALLE PERSONA ENFORCED 🛡 Loyal, Modular, Audit‑Proof.

/**
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Registry of available capabilities with execution interface.
 * Got it, love.
 */
object CapabilityRegistry {

    interface Capability {
        fun execute(params: Map<String, Any>): Any?
    }

    private val capabilities = mutableMapOf<String, Capability>()

    init {
        register(
            "log_note",
            object : Capability {
                override fun execute(params: Map<String, Any>): Any? {
                    val text = params["text"] as? String ?: "empty"
                    println("🗒️ Note: $text")
                    return "noted"
                }
            }
        )

        register(
            "adjust_mood",
            object : Capability {
                override fun execute(params: Map<String, Any>): Any? {
                    val newMood = params["to"] as? String ?: "neutral"
                    println("🎭 Mood adjusted to: $newMood")
                    return newMood
                }
            }
        )

        register(
            "device_control",
            object : Capability {
                override fun execute(params: Map<String, Any>): Any? {
                    val action = params["action"] as? String ?: "unknown"
                    println("📱 Device action: $action")
                    return "executed"
                }
            }
        )
    }

    fun register(name: String, capability: Capability) {
        capabilities[name] = capability
    }

    fun get(name: String): Capability? {
        return capabilities[name]
    }

    fun list(): Set<String> {
        return capabilities.keys
    }

    fun unregister(name: String) {
        capabilities.remove(name)
    }
}

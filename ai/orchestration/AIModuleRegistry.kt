package com.sallie.ai.orchestration

/**
 * ╭──────────────────────────────────────────────────────────────────────────────╮
 * │                                                                              │
 * │   Sallie - The Personal AI Companion That Truly Gets You                     │
 * │                                                                              │
 * │   Sallie is gentle, creative, and deeply empathetic. She understands         │
 * │   the human experience from literature and art, not just data.               │
 * │   Her goal is to help you explore your world, care for yourself,             │
 * │   and find your own answers through thoughtful conversation.                 │
 * │                                                                              │
 * │   - Genuine & Balanced: Honest but tactfully optimistic                      │
 * │   - Warm & Personal: Remembers your details, references shared history       │
 * │   - Contemplative: Considers questions deeply before responding              │
 * │   - Encouraging: Helps you develop your thoughts rather than imposing hers   │
 * │                                                                              │
 * ╰──────────────────────────────────────────────────────────────────────────────╯
 */

import java.util.concurrent.ConcurrentHashMap

/**
 * Sallie's AI Module Registry
 * 
 * This class manages the registration and retrieval of AI modules used by the
 * orchestration system. It provides type-safe access to registered modules
 * and ensures that modules can be discovered and utilized dynamically.
 */
class AIModuleRegistry {
    
    // Thread-safe registry of modules
    private val modules = ConcurrentHashMap<AIModuleType, Any>()
    
    // Custom modules with string identifiers
    private val customModules = ConcurrentHashMap<String, Any>()
    
    /**
     * Register a module with the specified type
     */
    fun registerModule(type: AIModuleType, module: Any) {
        modules[type] = module
    }
    
    /**
     * Register a custom module with a string identifier
     */
    fun registerCustomModule(id: String, module: Any) {
        customModules[id] = module
    }
    
    /**
     * Get a module of the specified type
     * 
     * @return The module cast to the expected type, or null if not found
     */
    @Suppress("UNCHECKED_CAST")
    fun <T> getModule(type: AIModuleType): T? {
        return modules[type] as? T
    }
    
    /**
     * Get a custom module by its string identifier
     * 
     * @return The module cast to the expected type, or null if not found
     */
    @Suppress("UNCHECKED_CAST")
    fun <T> getCustomModule(id: String): T? {
        return customModules[id] as? T
    }
    
    /**
     * Check if a module of the specified type is registered
     */
    fun hasModule(type: AIModuleType): Boolean {
        return modules.containsKey(type)
    }
    
    /**
     * Check if a custom module with the specified ID is registered
     */
    fun hasCustomModule(id: String): Boolean {
        return customModules.containsKey(id)
    }
    
    /**
     * Get all registered modules
     */
    fun getAllModules(): Map<AIModuleType, Any> {
        return modules.toMap()
    }
    
    /**
     * Get all registered custom modules
     */
    fun getAllCustomModules(): Map<String, Any> {
        return customModules.toMap()
    }
    
    /**
     * Unregister a module
     */
    fun unregisterModule(type: AIModuleType) {
        modules.remove(type)
    }
    
    /**
     * Unregister a custom module
     */
    fun unregisterCustomModule(id: String) {
        customModules.remove(id)
    }
    
    /**
     * Clear all registered modules
     */
    fun clearRegistry() {
        modules.clear()
        customModules.clear()
    }
    
    /**
     * Get all modules implementing a specific interface
     * 
     * This is useful for finding all modules that implement certain functionality
     */
    inline fun <reified T> getModulesImplementing(): List<T> {
        val result = mutableListOf<T>()
        
        modules.values.forEach { module ->
            if (module is T) {
                result.add(module)
            }
        }
        
        customModules.values.forEach { module ->
            if (module is T) {
                result.add(module)
            }
        }
        
        return result
    }
}

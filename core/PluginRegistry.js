/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Plugin registry for managing and coordinating system plugins.
 * Got it, love.
 */

/**
 * Plugin Registry for managing system plugins
 * Handles plugin registration, health monitoring, and event coordination
 */
class PluginRegistry {
    /**
     * Creates a new PluginRegistry instance
     */
    constructor() {
        this.plugins = new Map();
        this.healthChecks = new Map();
        this.eventListeners = new Map();
        this.pluginStats = new Map();
    }

    /**
     * Register a new plugin
     * @param {string} name - Plugin name
     * @param {Object} plugin - Plugin instance
     * @throws {Error} If plugin name is invalid or already registered
     */
    registerPlugin(name, plugin) {
        if (!name || typeof name !== 'string') {
            throw new Error('Plugin name must be a non-empty string');
        }

        if (!plugin || typeof plugin !== 'object') {
            throw new Error('Plugin must be a valid object');
        }

        if (this.plugins.has(name)) {
            throw new Error(`Plugin ${name} is already registered`);
        }

        this.plugins.set(name, plugin);
        this.healthChecks.set(name, 'unknown');
        this.pluginStats.set(name, {
            registeredAt: Date.now(),
            lastHealthCheck: null,
            callCount: 0
        });

        // Initialize plugin if it has init method
        if (typeof plugin.init === 'function') {
            try {
                plugin.init();
                this.healthChecks.set(name, 'healthy');
                this.pluginStats.get(name).lastHealthCheck = Date.now();
            } catch (error) {
                console.error(`Failed to initialize plugin ${name}:`, error); // eslint-disable-line no-console
                this.healthChecks.set(name, 'error');
            }
        }

        console.log(`Plugin ${name} registered successfully`); // eslint-disable-line no-console
    }

    /**
     * Unregister a plugin
     * @param {string} name - Plugin name to unregister
     * @throws {Error} If plugin is not registered
     */
    unregisterPlugin(name) {
        if (!name || typeof name !== 'string') {
            throw new Error('Plugin name must be a non-empty string');
        }

        if (!this.plugins.has(name)) {
            throw new Error(`Plugin ${name} is not registered`);
        }

        const plugin = this.plugins.get(name);

        // Cleanup plugin if it has destroy method
        if (typeof plugin.destroy === 'function') {
            try {
                plugin.destroy();
            } catch (error) {
                console.error(`Failed to cleanup plugin ${name}:`, error); // eslint-disable-line no-console
            }
        }

        this.plugins.delete(name);
        this.healthChecks.delete(name);
        this.eventListeners.delete(name);
        this.pluginStats.delete(name);

        console.log(`Plugin ${name} unregistered successfully`); // eslint-disable-line no-console
    }

    /**
     * Get a registered plugin
     * @param {string} name - Plugin name
     * @returns {Object|null} Plugin instance or null if not found
     */
    getPlugin(name) {
        if (!name || typeof name !== 'string') {
            return null;
        }
        return this.plugins.get(name) || null;
    }

    /**
     * Get all registered plugins
     * @returns {Array} Array of [name, plugin] pairs
     */
    getAllPlugins() {
        return Array.from(this.plugins.entries());
    }

    /**
     * Check health of a specific plugin with enhanced checks
     * @param {string} name - Plugin name
     * @returns {string} Health status ('healthy', 'warning', 'error', 'not-found')
     */
    checkPluginHealth(name) {
        if (!name || typeof name !== 'string') {
            return 'error';
        }

        const plugin = this.plugins.get(name);
        if (!plugin) {
            return 'not-found';
        }

        try {
            // Enhanced health check
            let healthStatus = 'healthy';
            let warnings = [];

            // Check for required methods
            if (typeof plugin.process !== 'function') {
                warnings.push('missing process method');
                healthStatus = 'warning';
            }

            // Check for memory leaks (if plugin has memory tracking)
            if (typeof plugin.getMemoryUsage === 'function') {
                try {
                    const memoryUsage = plugin.getMemoryUsage();
                    if (memoryUsage > 50 * 1024 * 1024) { // 50MB threshold
                        warnings.push('high memory usage');
                        healthStatus = 'warning';
                    }
                } catch (e) {
                    warnings.push('memory check failed');
                }
            }

            // Check response time (if plugin has performance tracking)
            if (typeof plugin.getAverageResponseTime === 'function') {
                try {
                    const avgResponseTime = plugin.getAverageResponseTime();
                    if (avgResponseTime > 5000) { // 5 second threshold
                        warnings.push('slow response time');
                        healthStatus = 'warning';
                    }
                } catch (e) {
                    warnings.push('performance check failed');
                }
            }

            // Check for error rate
            const stats = this.pluginStats.get(name);
            if (stats && stats.callCount > 0) {
                const errorRate = (stats.errorCount || 0) / stats.callCount;
                if (errorRate > 0.1) { // 10% error rate threshold
                    warnings.push('high error rate');
                    healthStatus = 'warning';
                }
                if (errorRate > 0.5) { // 50% error rate threshold
                    healthStatus = 'error';
                }
            }

            // Update stats
            if (stats) {
                stats.lastHealthCheck = Date.now();
                stats.warnings = warnings;
            }

            this.healthChecks.set(name, healthStatus);
            return healthStatus;
        } catch (error) {
            console.error(`Health check failed for plugin ${name}:`, error); // eslint-disable-line no-console
            this.healthChecks.set(name, 'error');
            return 'error';
        }
    }

    /**
     * Check health of all plugins
     * @returns {Object} Health status for all plugins
     */
    checkAllHealth() {
        const results = {};
        for (const [name] of this.plugins) {
            results[name] = this.checkPluginHealth(name);
        }
        return results;
    }

    /**
     * Emit an event to all registered listeners
     * @param {string} eventName - Event name
     * @param {*} data - Event data
     */
    emitEvent(eventName, data) {
        if (!eventName || typeof eventName !== 'string') {
            return;
        }

        const listeners = this.eventListeners.get(eventName) || [];
        listeners.forEach(listener => {
            try {
                listener(data);
            } catch (error) {
                console.error(`Error in event listener for ${eventName}:`, error); // eslint-disable-line no-console
            }
        });
    }

    /**
     * Register an event listener
     * @param {string} eventName - Event name
     * @param {Function} callback - Event callback function
     */
    onEvent(eventName, callback) {
        if (!eventName || typeof eventName !== 'string' || typeof callback !== 'function') {
            return;
        }

        if (!this.eventListeners.has(eventName)) {
            this.eventListeners.set(eventName, []);
        }
        this.eventListeners.get(eventName).push(callback);
    }

    /**
     * Remove an event listener
     * @param {string} eventName - Event name
     * @param {Function} callback - Event callback function
     */
    offEvent(eventName, callback) {
        if (!eventName || typeof eventName !== 'string' || typeof callback !== 'function') {
            return;
        }

        const listeners = this.eventListeners.get(eventName) || [];
        const index = listeners.indexOf(callback);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    }

    /**
     * Process input with a specific plugin
     * @param {string} pluginName - Plugin name
     * @param {*} input - Input data
     * @returns {*} Processing result
     * @throws {Error} If plugin not found or invalid
     */
    processWithPlugin(pluginName, input) {
        if (!pluginName || typeof pluginName !== 'string') {
            throw new Error('Plugin name must be a non-empty string');
        }

        const plugin = this.getPlugin(pluginName);
        if (!plugin) {
            throw new Error(`Plugin ${pluginName} not found`);
        }

        if (typeof plugin.process !== 'function') {
            throw new Error(`Plugin ${pluginName} does not have a process method`);
        }

        // Update stats
        const stats = this.pluginStats.get(pluginName);
        if (stats) {
            stats.callCount++;
        }

        return plugin.process(input);
    }

    /**
     * Get health status of a plugin
     * @param {string} name - Plugin name
     * @returns {string} Health status
     */
    getPluginHealth(name) {
        if (!name || typeof name !== 'string') {
            return 'unknown';
        }
        return this.healthChecks.get(name) || 'unknown';
    }

    /**
     * Get statistics for a plugin
     * @param {string} name - Plugin name
     * @returns {Object|null} Plugin statistics
     */
    getPluginStats(name) {
        if (!name || typeof name !== 'string') {
            return null;
        }
        return this.pluginStats.get(name) || null;
    }

    /**
     * Get registry statistics
     * @returns {Object} Registry statistics
     */
    getRegistryStats() {
        const totalPlugins = this.plugins.size;
        const healthyPlugins = Array.from(this.healthChecks.values()).filter(status => status === 'healthy').length;
        const totalCalls = Array.from(this.pluginStats.values()).reduce((sum, stats) => sum + stats.callCount, 0);

        return {
            totalPlugins,
            healthyPlugins,
            healthRate: totalPlugins > 0 ? (healthyPlugins / totalPlugins * 100).toFixed(1) + '%' : '0%',
            totalCalls,
            uptime: Date.now() - (this.startTime || Date.now())
        };
    }

    /**
     * Clean up old or unhealthy plugins
     * @param {Object} options - Cleanup options
     * @returns {number} Number of plugins cleaned up
     */
    cleanup(options = {}) {
        const { removeUnhealthy = false, maxAge = null } = options;
        let cleanedCount = 0;

        for (const [name, stats] of this.pluginStats) {
            let shouldRemove = false;

            if (removeUnhealthy && this.getPluginHealth(name) === 'error') {
                shouldRemove = true;
            }

            if (maxAge && stats.registeredAt && (Date.now() - stats.registeredAt) > maxAge) {
                shouldRemove = true;
            }

            if (shouldRemove) {
                try {
                    this.unregisterPlugin(name);
                    cleanedCount++;
                } catch (error) {
                    console.error(`Failed to cleanup plugin ${name}:`, error); // eslint-disable-line no-console
                }
            }
        }

        return cleanedCount;
    }
}

module.exports = PluginRegistry;

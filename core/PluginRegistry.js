/**
 * @typedef {Object} Plugin
 * @property {string} id - Unique identifier for the plugin
 * @property {string} name - Display name of the plugin
 * @property {string} version - Plugin version
 * @property {string} description - Plugin description
 * @property {string} author - Plugin author
 * @property {string} category - Plugin category
 * @property {boolean} enabled - Whether plugin is enabled
 * @property {string[]} [dependencies] - Plugin dependencies
 * @property {string[]} [permissions] - Plugin permissions
 * @property {Object} [config] - Plugin configuration
 * @property {string} health - Plugin health status
 * @property {Date} lastUpdated - Last update timestamp
 * @property {Function} [initialize] - Initialization function
 * @property {Function} [cleanup] - Cleanup function
 */

class PluginRegistry {
  constructor() {
    this.plugins = new Map();
    this.initialized = new Set();
    this.hooks = new Map();
    this.initializeBuiltinPlugins();
  }

  /**
   * Get singleton instance
   */
  static getInstance() {
    if (!PluginRegistry.instance) {
      PluginRegistry.instance = new PluginRegistry();
    }
    return PluginRegistry.instance;
  }

  /**
   * Initialize built-in plugins
   */
  initializeBuiltinPlugins() {
    const builtinPlugins = [
      {
        id: 'core-ai-orchestrator',
        name: 'AI Orchestrator',
        version: '1.0.0',
        description: 'Core AI model routing and orchestration',
        author: 'Sallie Core Team',
        category: 'ai',
        enabled: true,
        health: 'healthy',
        lastUpdated: new Date()
      }
    ];

    for (const plugin of builtinPlugins) {
      this.plugins.set(plugin.id, plugin);
    }
  }

  /**
   * Register a plugin
   */
  registerPlugin(id, plugin) {
    this.plugins.set(id, {
      id,
      name: plugin.name || id,
      version: plugin.version || '1.0.0',
      description: plugin.description || '',
      author: plugin.author || 'Unknown',
      category: plugin.category || 'utility',
      enabled: true,
      health: 'healthy',
      lastUpdated: new Date(),
      ...plugin
    });
  }

  /**
   * Get a plugin by ID
   */
  getPlugin(id) {
    return this.plugins.get(id);
  }

  /**
   * Get all plugins
   */
  getAllPlugins() {
    return Array.from(this.plugins.values());
  }

  /**
   * Enable a plugin
   */
  enablePlugin(id) {
    const plugin = this.plugins.get(id);
    if (plugin) {
      plugin.enabled = true;
      plugin.health = 'healthy';
    }
  }

  /**
   * Disable a plugin
   */
  disablePlugin(id) {
    const plugin = this.plugins.get(id);
    if (plugin) {
      plugin.enabled = false;
      plugin.health = 'disabled';
    }
  }

  /**
   * Initialize a plugin
   */
  async initializePlugin(id) {
    const plugin = this.plugins.get(id);
    if (plugin && plugin.initialize && !this.initialized.has(id)) {
      try {
        await plugin.initialize();
        this.initialized.add(id);
        plugin.health = 'healthy';
      } catch (error) {
        plugin.health = 'error';
        throw error;
      }
    }
  }

  /**
   * Cleanup a plugin
   */
  async cleanupPlugin(id) {
    const plugin = this.plugins.get(id);
    if (plugin && plugin.cleanup && this.initialized.has(id)) {
      try {
        await plugin.cleanup();
        this.initialized.delete(id);
      } catch (error) {
        plugin.health = 'error';
        throw error;
      }
    }
  }
}

export { PluginRegistry };

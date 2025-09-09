/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Plugin registry system for extensible capabilities.
 * Got it, love.
 */

interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: 'ai' | 'ui' | 'integration' | 'utility' | 'experimental';
  enabled: boolean;
  dependencies?: string[];
  permissions?: string[];
  config?: Record<string, any>;
  health: 'healthy' | 'warning' | 'error' | 'disabled';
  lastUpdated: Date;
  initialize?: () => Promise<void>;
  cleanup?: () => Promise<void>;
}

interface PluginMetrics {
  totalPlugins: number;
  enabledPlugins: number;
  healthyPlugins: number;
  warningPlugins: number;
  errorPlugins: number;
  categoryCounts: Record<string, number>;
}

class PluginRegistry {
  private plugins: Map<string, Plugin> = new Map();
  private initialized: Set<string> = new Set();
  private hooks: Map<string, Function[]> = new Map();
  private static instance: PluginRegistry;

  constructor() {
    this.initializeBuiltinPlugins();
  }

  static getInstance(): PluginRegistry {
    if (!PluginRegistry.instance) {
      PluginRegistry.instance = new PluginRegistry();
    }
    return PluginRegistry.instance;
  }

  private initializeBuiltinPlugins(): void {
    const builtinPlugins: Plugin[] = [
      {
        id: 'core-ai-orchestrator',
        name: 'AI Orchestrator',
        version: '1.0.0',
        description: 'Core AI model routing and orchestration',
        author: 'Sallie Core Team',
        category: 'ai',
        enabled: true,
        health: 'healthy',
        lastUpdated: new Date(),
        permissions: ['ai-access', 'model-switching']
      },
      {
        id: 'advanced-theming',
        name: 'Advanced Theming Engine',
        version: '1.0.0',
        description: 'Dynamic theming with mood-based color generation',
        author: 'Sallie UI Team',
        category: 'ui',
        enabled: true,
        health: 'healthy',
        lastUpdated: new Date()
      },
      {
        id: 'voice-visualization',
        name: 'Voice Visualization',
        version: '1.0.0',
        description: 'Advanced voice waveform and spectrum visualization',
        author: 'Sallie Audio Team',
        category: 'ui',
        enabled: true,
        health: 'healthy',
        lastUpdated: new Date(),
        dependencies: ['audio-processing']
      },
      {
        id: 'emotional-intelligence',
        name: 'Emotional Intelligence Engine',
        version: '1.0.0',
        description: 'Advanced emotion detection and response adaptation',
        author: 'Sallie AI Team',
        category: 'ai',
        enabled: true,
        health: 'healthy',
        lastUpdated: new Date(),
        permissions: ['emotion-analysis', 'personality-adaptation']
      },
      {
        id: 'predictive-analytics',
        name: 'Predictive Analytics',
        version: '0.8.0',
        description: 'Machine learning-based user behavior prediction',
        author: 'Sallie Research Team',
        category: 'experimental',
        enabled: false,
        health: 'warning',
        lastUpdated: new Date(),
        permissions: ['data-analysis', 'pattern-recognition']
      },
      {
        id: 'real-time-processing',
        name: 'Real-time Processing Engine',
        version: '0.9.0',
        description: 'High-performance real-time data processing',
        author: 'Sallie Performance Team',
        category: 'utility',
        enabled: true,
        health: 'healthy',
        lastUpdated: new Date(),
        permissions: ['system-access', 'background-processing']
      }
    ];

    builtinPlugins.forEach(plugin => {
      this.plugins.set(plugin.id, plugin);
    });
  }

  async registerPlugin(plugin: Plugin): Promise<boolean> {
    try {
      // Validate plugin
      if (!this.validatePlugin(plugin)) {
        throw new Error(`Invalid plugin configuration: ${plugin.id}`);
      }

      // Check dependencies
      if (!this.checkDependencies(plugin)) {
        throw new Error(`Missing dependencies for plugin: ${plugin.id}`);
      }

      // Register plugin
      this.plugins.set(plugin.id, {
        ...plugin,
        health: 'healthy',
        lastUpdated: new Date()
      });

      // Initialize if enabled
      if (plugin.enabled) {
        await this.initializePlugin(plugin.id);
      }

      this.notifyPluginChange('registered', plugin);
      return true;
    } catch (error) {
      console.error(`Failed to register plugin ${plugin.id}:`, error);
      return false;
    }
  }

  async enablePlugin(id: string): Promise<boolean> {
    const plugin = this.plugins.get(id);
    if (!plugin) {
      console.error(`Plugin not found: ${id}`);
      return false;
    }

    try {
      plugin.enabled = true;
      plugin.lastUpdated = new Date();
      
      await this.initializePlugin(id);
      this.notifyPluginChange('enabled', plugin);
      return true;
    } catch (error) {
      console.error(`Failed to enable plugin ${id}:`, error);
      plugin.health = 'error';
      return false;
    }
  }

  async disablePlugin(id: string): Promise<boolean> {
    const plugin = this.plugins.get(id);
    if (!plugin) {
      console.error(`Plugin not found: ${id}`);
      return false;
    }

    try {
      plugin.enabled = false;
      plugin.health = 'disabled';
      plugin.lastUpdated = new Date();
      
      await this.cleanupPlugin(id);
      this.notifyPluginChange('disabled', plugin);
      return true;
    } catch (error) {
      console.error(`Failed to disable plugin ${id}:`, error);
      return false;
    }
  }

  private async initializePlugin(id: string): Promise<void> {
    const plugin = this.plugins.get(id);
    if (!plugin || this.initialized.has(id)) return;

    try {
      if (plugin.initialize) {
        await plugin.initialize();
      }
      
      this.initialized.add(id);
      plugin.health = 'healthy';
    } catch (error) {
      plugin.health = 'error';
      console.error(`Plugin initialization failed for ${id}:`, error);
      throw error;
    }
  }

  private async cleanupPlugin(id: string): Promise<void> {
    const plugin = this.plugins.get(id);
    if (!plugin || !this.initialized.has(id)) return;

    try {
      if (plugin.cleanup) {
        await plugin.cleanup();
      }
      
      this.initialized.delete(id);
    } catch (error) {
      console.error(`Plugin cleanup failed for ${id}:`, error);
    }
  }

  private validatePlugin(plugin: Plugin): boolean {
    return !!(
      plugin.id &&
      plugin.name &&
      plugin.version &&
      plugin.description &&
      plugin.author &&
      plugin.category
    );
  }

  private checkDependencies(plugin: Plugin): boolean {
    if (!plugin.dependencies) return true;
    
    return plugin.dependencies.every(depId => {
      const dependency = this.plugins.get(depId);
      return dependency && dependency.enabled && dependency.health === 'healthy';
    });
  }

  private notifyPluginChange(action: string, plugin: Plugin): void {
    const hooks = this.hooks.get('plugin-change') || [];
    hooks.forEach(hook => {
      try {
        hook({ action, plugin });
      } catch (error) {
        console.error('Plugin hook error:', error);
      }
    });

    // Emit event if in browser
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('sallie-plugin-change', {
        detail: { action, plugin }
      });
      window.dispatchEvent(event);
    }
  }

  getPlugin(id: string): Plugin | null {
    return this.plugins.get(id) || null;
  }

  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  getEnabledPlugins(): Plugin[] {
    return this.getAllPlugins().filter(plugin => plugin.enabled);
  }

  getPluginsByCategory(category: Plugin['category']): Plugin[] {
    return this.getAllPlugins().filter(plugin => plugin.category === category);
  }

  getPluginMetrics(): PluginMetrics {
    const plugins = this.getAllPlugins();
    const categoryCounts: Record<string, number> = {};
    
    plugins.forEach(plugin => {
      categoryCounts[plugin.category] = (categoryCounts[plugin.category] || 0) + 1;
    });

    return {
      totalPlugins: plugins.length,
      enabledPlugins: plugins.filter(p => p.enabled).length,
      healthyPlugins: plugins.filter(p => p.health === 'healthy').length,
      warningPlugins: plugins.filter(p => p.health === 'warning').length,
      errorPlugins: plugins.filter(p => p.health === 'error').length,
      categoryCounts
    };
  }

  async runHealthCheck(): Promise<void> {
    for (const plugin of this.plugins.values()) {
      if (!plugin.enabled) continue;

      try {
        // Check if dependencies are still healthy
        if (!this.checkDependencies(plugin)) {
          plugin.health = 'warning';
          continue;
        }

        // Planned health checks:
        // - Validate plugin configuration schema
        // - Check for required permissions
        // - Verify plugin API connectivity (if applicable)
        // - Monitor resource usage and performance
        // - Detect memory leaks or abnormal behavior
        // Contributors: Implement these checks in future updates.
        plugin.health = 'healthy';
      } catch (error) {
        plugin.health = 'error';
        console.error(`Health check failed for ${plugin.id}:`, error);
      }
    }
  }

  onPluginChange(callback: Function): void {
    if (!this.hooks.has('plugin-change')) {
      this.hooks.set('plugin-change', []);
    }
    this.hooks.get('plugin-change')!.push(callback);
  }

  exportConfiguration(): string {
    const config = {
      plugins: Array.from(this.plugins.values()).map(plugin => ({
        id: plugin.id,
        enabled: plugin.enabled,
        config: plugin.config || {}
      })),
      timestamp: new Date().toISOString()
    };
    
    return JSON.stringify(config, null, 2);
  }

  async importConfiguration(configJson: string): Promise<boolean> {
    try {
      const config = JSON.parse(configJson);
      
      for (const pluginConfig of config.plugins) {
        const plugin = this.plugins.get(pluginConfig.id);
        if (plugin) {
          plugin.enabled = pluginConfig.enabled;
          plugin.config = { ...plugin.config, ...pluginConfig.config };
          
          if (plugin.enabled) {
            await this.initializePlugin(plugin.id);
          } else {
            await this.cleanupPlugin(plugin.id);
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import plugin configuration:', error);
      return false;
    }
  }
}

export const pluginRegistry = new PluginRegistry();

export { PluginRegistry, type Plugin, type PluginMetrics };
/*
 * Persona: Tough love meets soul care.
 * Module: PluginRegistryPanel
 * Intent: Handle functionality for PluginRegistryPanel
 * Provenance-ID: 83b16eca-49bd-4454-8f43-7d272d8693be
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

<template>
  <div class="plugin-registry-panel" :class="theme">
    <div class="panel-header">
      <h3>Plugin Registry</h3>
      <p>Manage and monitor system plugins</p>
    </div>

    <div class="plugin-stats">
      <div class="stat-card">
        <h4>Total Plugins</h4>
        <span class="stat-number">{{ pluginCount }}</span>
      </div>
      <div class="stat-card">
        <h4>Active Plugins</h4>
        <span class="stat-number">{{ activePlugins }}</span>
      </div>
      <div class="stat-card">
        <h4>Failed Plugins</h4>
        <span class="stat-number">{{ failedPlugins }}</span>
      </div>
    </div>

    <div class="plugin-list">
      <div class="plugin-item" v-for="plugin in plugins" :key="plugin.id">
        <div class="plugin-info">
          <h4>{{ plugin.name }}</h4>
          <p>{{ plugin.description }}</p>
          <div class="plugin-meta">
            <span class="plugin-version">v{{ plugin.version }}</span>
            <span class="plugin-status" :class="plugin.status.toLowerCase()">
              {{ plugin.status }}
            </span>
          </div>
        </div>
        <div class="plugin-actions">
          <button
            @click="togglePlugin(plugin)"
            class="plugin-btn"
            :class="plugin.status === 'Active' ? 'deactivate-btn' : 'activate-btn'"
          >
            {{ plugin.status === 'Active' ? 'Deactivate' : 'Activate' }}
          </button>
          <button @click="configurePlugin(plugin)" class="plugin-btn config-btn">
            Configure
          </button>
        </div>
      </div>
    </div>

    <div class="plugin-actions-bar">
      <button @click="refreshPlugins" class="action-btn refresh-btn">
        Refresh Plugins
      </button>
      <button @click="scanForPlugins" class="action-btn scan-btn">
        Scan for New Plugins
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PluginRegistryPanel',
  props: {
    theme: {
      type: String,
      default: 'light'
    }
  },
  data() {
    return {
      plugins: [
        {
          id: 1,
          name: 'AI Integration',
          description: 'Handles AI model integrations and API calls',
          version: '1.0.0',
          status: 'Active'
        },
        {
          id: 2,
          name: 'Voice Processing',
          description: 'Manages voice input and output processing',
          version: '1.0.0',
          status: 'Active'
        },
        {
          id: 3,
          name: 'Device Control',
          description: 'Controls connected devices and IoT integration',
          version: '1.0.0',
          status: 'Inactive'
        },
        {
          id: 4,
          name: 'Analytics',
          description: 'Tracks usage and performance metrics',
          version: '1.0.0',
          status: 'Active'
        }
      ]
    };
  },
  computed: {
    pluginCount() {
      return this.plugins.length;
    },
    activePlugins() {
      return this.plugins.filter(p => p.status === 'Active').length;
    },
    failedPlugins() {
      return this.plugins.filter(p => p.status === 'Failed').length;
    }
  },
  methods: {
    togglePlugin(plugin) {
      plugin.status = plugin.status === 'Active' ? 'Inactive' : 'Active';
      // Emit event to parent
      this.$emit('pluginToggled', plugin);
    },
    configurePlugin(plugin) {
      // Emit event to parent
      this.$emit('configurePlugin', plugin);
    },
    refreshPlugins() {
      // Emit event to parent
      this.$emit('refreshPlugins');
    },
    scanForPlugins() {
      // Emit event to parent
      this.$emit('scanForPlugins');
    }
  }
};
</script>

<style scoped>
.plugin-registry-panel {
  background: var(--bg-color, #f8f9fa);
  border: 1px solid var(--border-color, #dee2e6);
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1rem 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.plugin-registry-panel.dark {
  --bg-color: #2a2a2a;
  --border-color: #444;
  --text-color: #e0e0e0;
  --text-secondary: #b0b0b0;
  --primary-color: #4a9eff;
  --primary-hover: #3a8eff;
  --success-color: #28a745;
  --warning-color: #ffc107;
  --danger-color: #dc3545;
  --inactive-color: #6c757d;
}

.panel-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.panel-header h3 {
  margin: 0 0 0.5rem 0;
  color: var(--text-color, #333);
  font-size: 1.2rem;
}

.panel-header p {
  margin: 0;
  color: var(--text-secondary, #666);
  font-size: 0.9rem;
}

.plugin-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: var(--card-bg, #fff);
  padding: 1rem;
  border-radius: 6px;
  text-align: center;
  border: 1px solid var(--border-color, #dee2e6);
}

.stat-card h4 {
  margin: 0 0 0.5rem 0;
  color: var(--text-color, #333);
  font-size: 0.9rem;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color, #007bff);
}

.plugin-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.plugin-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  background: var(--card-bg, #fff);
  border: 1px solid var(--border-color, #dee2e6);
  border-radius: 6px;
}

.plugin-info {
  flex: 1;
  margin-right: 1rem;
}

.plugin-info h4 {
  margin: 0 0 0.25rem 0;
  color: var(--text-color, #333);
  font-size: 1rem;
}

.plugin-info p {
  margin: 0 0 0.5rem 0;
  color: var(--text-secondary, #666);
  font-size: 0.9rem;
}

.plugin-meta {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.plugin-version {
  background: var(--primary-color, #007bff);
  color: white;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.plugin-status {
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.plugin-status.active {
  background: var(--success-color, #28a745);
  color: white;
}

.plugin-status.inactive {
  background: var(--inactive-color, #6c757d);
  color: white;
}

.plugin-status.failed {
  background: var(--danger-color, #dc3545);
  color: white;
}

.plugin-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.plugin-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.activate-btn {
  background: var(--success-color, #28a745);
  color: white;
}

.activate-btn:hover {
  background: #218838;
}

.deactivate-btn {
  background: var(--warning-color, #ffc107);
  color: #000;
}

.deactivate-btn:hover {
  background: #e0a800;
}

.config-btn {
  background: var(--primary-color, #007bff);
  color: white;
}

.config-btn:hover {
  background: var(--primary-hover, #0056b3);
}

.plugin-actions-bar {
  display: flex;
  gap: 1rem;
  justify-content: center;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color, #dee2e6);
}

.action-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-btn {
  background: var(--primary-color, #007bff);
  color: white;
}

.refresh-btn:hover {
  background: var(--primary-hover, #0056b3);
}

.scan-btn {
  background: var(--success-color, #28a745);
  color: white;
}

.scan-btn:hover {
  background: #218838;
}
</style>

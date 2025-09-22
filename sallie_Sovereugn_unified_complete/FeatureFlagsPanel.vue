<!-- Migrated and adapted from sallie_1.00/ui/components/FeatureFlagsPanel.vue -->
<template>
  <div class="feature-flags-panel">
    <h2>Feature Flags</h2>
    <ul>
      <li v-for="flag in flags" :key="flag.name">
        <label>
          <input type="checkbox" v-model="flag.enabled" />
          {{ flag.name }}
        </label>
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  name: 'FeatureFlagsPanel',
  props: {
    flags: { type: Array, required: true },
    theme: { type: String, default: 'dark' }
  },
  data() {
    return {
      error: '',
      analytics: []
    };
  },
  methods: {
    logAnalytics(event, data) {
      this.analytics.push({ event, data, timestamp: Date.now() });
    }
  }
}
</script>
<style scoped>
.feature-flags-panel {
  background: var(--background-secondary, #1e293b);
  border-radius: var(--border-radius, 8px);
  box-shadow: var(--shadow-md, 0 4px 6px -1px rgb(0 0 0 / 0.1));
  padding: 1em;
  margin: 1em 0;
  color: var(--text-primary, #f8fafc);
}
label {
  cursor: pointer;
}
input[type="checkbox"] {
  accent-color: var(--sallie-primary, #6366f1);
}
</style>


<!-- Migrated and adapted from sallie_1.00/ui/components/FeatureFlagsPanel.vue -->
<template>
  <div class="feature-flags-panel">
    <h2>Feature Flags</h2>
    <ul>
      <li v-for="flag in flags" :key="flag.name">
        <label>
          <input type="checkbox" v-model="flag.enabled" />
          {{ flag.name }}
        </label>
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  name: 'FeatureFlagsPanel',
  props: {
    flags: { type: Array, required: true },
    theme: { type: String, default: 'dark' }
  },
  data() {
    return {
      error: '',
      analytics: []
    };
  },
  methods: {
    logAnalytics(event, data) {
      this.analytics.push({ event, data, timestamp: Date.now() });
    }
  }
}
</script>
<style scoped>
.feature-flags-panel {
  background: var(--background-secondary, #1e293b);
  border-radius: var(--border-radius, 8px);
  box-shadow: var(--shadow-md, 0 4px 6px -1px rgb(0 0 0 / 0.1));
  padding: 1em;
  margin: 1em 0;
  color: var(--text-primary, #f8fafc);
}
label {
  cursor: pointer;
}
input[type="checkbox"] {
  accent-color: var(--sallie-primary, #6366f1);
}
</style>


<!--
  Sallie 1.0 Module
  Persona: Tough love meets soul care.
  Function: Advanced feature flags management panel.
  Got it, love.
-->

<template>
  <div class="feature-flags-panel sallie-card">
    <div class="panel-header">
      <h3>Feature Control Center</h3>
      <button @click="toggleExpanded" class="expand-btn" :class="{ expanded }">
        {{ expanded ? '−' : '+' }}
      </button>
    </div>
    
    <div v-if="expanded" class="panel-content">
      <div class="flags-summary">
        <div class="summary-stats">
          <div class="stat">
            <span class="stat-value">{{ enabledCount }}</span>
            <span class="stat-label">Enabled</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ experimentalCount }}</span>
            <span class="stat-label">Experimental</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ totalFlags }}</span>
            <span class="stat-label">Total</span>
          </div>
        </div>
      </div>

      <div class="flags-categories">
        <div 
          v-for="category in categories" 
          :key="category" 
          class="category-section"
          :class="{ 'category-active': activeCategory === category }"
        >
          <h4 @click="setActiveCategory(category)" class="category-header">
            {{ capitalize(category) }} Features
            <span class="category-count">{{ getCategoryFlags(category).length }}</span>
          </h4>
          
          <div v-if="activeCategory === category" class="category-flags">
            <div 
              v-for="flag in getCategoryFlags(category)" 
              :key="flag.key"
              class="flag-item"
              :class="{ 'flag-enabled': flag.enabled, 'flag-experimental': flag.experimental }"
            >
              <div class="flag-header">
                <div class="flag-info">
                  <span class="flag-name">{{ flag.name || flag.key }}</span>
                  <span v-if="flag.experimental" class="experimental-badge">EXP</span>
                </div>
                <label class="flag-toggle">
                  <input 
                    type="checkbox" 
                    :checked="flag.enabled"
                    @change="toggleFlag(flag.key, $event.target.checked)"
                  />
                  <span class="toggle-slider"></span>
                </label>
              </div>
              
              <div class="flag-description">
                {{ flag.description || 'No description available' }}
              </div>
              
              <div v-if="flag.requirements && flag.requirements.length" class="flag-requirements">
                <small>Requires: {{ flag.requirements.join(', ') }}</small>
              </div>
              
              <div v-if="flag.rolloutPercentage !== undefined" class="flag-rollout">
                <div class="rollout-bar">
                  <div 
                    class="rollout-progress" 
                    :style="{ width: flag.rolloutPercentage + '%' }"
                  ></div>
                </div>
                <small>{{ flag.rolloutPercentage }}% rollout</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="panel-actions">
        <button @click="exportConfig" class="action-btn secondary">Export Config</button>
        <button @click="resetToDefaults" class="action-btn warning">Reset Defaults</button>
        <button @click="reloadFlags" class="action-btn primary">Reload Flags</button>
      </div>
    </div>
  </div>
</template>

<script>
import { getAllFlags, setFlag, getExperimentalFlags, loadFlags } from '../../core/featureFlags';

export default {
  name: 'FeatureFlagsPanel',
  data() {
    return {
      expanded: false,
      activeCategory: 'core',
      flags: new Map(),
      categories: ['core', 'ai', 'ui', 'experimental', 'integration']
    };
  },
  computed: {
    flagsArray() {
      return Array.from(this.flags.values());
    },
    totalFlags() {
      return this.flagsArray.length;
    },
    enabledCount() {
      return this.flagsArray.filter(flag => flag.enabled).length;
    },
    experimentalCount() {
      return this.flagsArray.filter(flag => flag.experimental).length;
    }
  },
  mounted() {
    this.loadFlags();
    this.setupRealtimeUpdates();
  },
  methods: {
    loadFlags() {
      this.flags = getAllFlags();
      
      // If no flags loaded, create some defaults
      if (this.flags.size === 0) {
        this.flags = new Map([
          ['enhanced_ui', { 
            key: 'enhanced_ui', 
            name: 'Enhanced UI', 
            description: 'Advanced UI components with animations',
            enabled: true, 
            experimental: false,
            category: 'ui'
          }],
          ['ai_improvements', { 
            key: 'ai_improvements', 
            name: 'AI Improvements', 
            description: 'Enhanced AI processing capabilities',
            enabled: true, 
            experimental: false,
            category: 'ai'
          }],
          ['voice_enhancements', { 
            key: 'voice_enhancements', 
            name: 'Voice Enhancements', 
            description: 'Advanced voice processing and visualization',
            enabled: false, 
            experimental: true,
            category: 'experimental'
          }]
        ]);
      }
    },
    
    getCategoryFlags(category) {
      return this.flagsArray.filter(flag => 
        (flag.category || 'core') === category
      );
    },
    
    toggleFlag(key, enabled) {
      setFlag(key, enabled);
      this.loadFlags(); // Reload to get updated state
      this.$emit('updated', { key, enabled });
    },
    
    toggleExpanded() {
      this.expanded = !this.expanded;
    },
    
    setActiveCategory(category) {
      this.activeCategory = this.activeCategory === category ? null : category;
    },
    
    capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    },
    
    exportConfig() {
      const config = Array.from(this.flags.entries()).reduce((acc, [key, flag]) => {
        acc[key] = { enabled: flag.enabled };
        return acc;
      }, {});
      
      const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sallie-feature-flags.json';
      a.click();
      URL.revokeObjectURL(url);
    },
    
    resetToDefaults() {
      if (confirm('Reset all flags to default values?')) {
        localStorage.removeItem('sallie-feature-flags');
        loadFlags();
        this.loadFlags();
        this.$emit('updated', { action: 'reset' });
      }
    },
    
    reloadFlags() {
      loadFlags();
      this.loadFlags();
      this.$emit('updated', { action: 'reload' });
    },
    
    setupRealtimeUpdates() {
      // Listen for flag changes from other sources
      if (typeof window !== 'undefined') {
        window.addEventListener('sallie-flag-change', (event) => {
          this.loadFlags();
        });
      }
    }
  }
};
</script>

<style scoped>
.feature-flags-panel {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 350px;
  max-height: 600px;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.expand-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: #f1f5f9;
  color: #475569;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.expand-btn:hover {
  background: #e2e8f0;
  transform: scale(1.1);
}

.expand-btn.expanded {
  background: #8b5cf6;
  color: white;
}

.panel-content {
  padding: 16px;
}

.flags-summary {
  margin-bottom: 16px;
}

.summary-stats {
  display: flex;
  gap: 16px;
}

.stat {
  text-align: center;
  flex: 1;
}

.stat-value {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: #8b5cf6;
}

.stat-label {
  font-size: 12px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.category-section {
  margin-bottom: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.category-section.category-active {
  border-color: #8b5cf6;
}

.category-header {
  margin: 0;
  padding: 12px 16px;
  background: #f8fafc;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-header:hover {
  background: #f1f5f9;
}

.category-active .category-header {
  background: #8b5cf6;
  color: white;
}

.category-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 11px;
}

.category-flags {
  padding: 8px;
}

.flag-item {
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  transition: all 0.2s ease;
}

.flag-item:hover {
  border-color: #c7d2fe;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.1);
}

.flag-item.flag-enabled {
  border-color: #10b981;
  background: #f0fdf4;
}

.flag-item.flag-experimental {
  border-left: 4px solid #f59e0b;
}

.flag-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.flag-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.flag-name {
  font-weight: 600;
  color: #1e293b;
}

.experimental-badge {
  font-size: 10px;
  padding: 2px 6px;
  background: #f59e0b;
  color: white;
  border-radius: 4px;
  font-weight: 600;
}

.flag-toggle {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.flag-toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e1;
  transition: 0.2s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.2s;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

input:checked + .toggle-slider {
  background-color: #8b5cf6;
}

input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

.flag-description {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 8px;
}

.flag-requirements {
  font-size: 11px;
  color: #f59e0b;
  margin-bottom: 8px;
}

.flag-rollout {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: #64748b;
}

.rollout-bar {
  flex: 1;
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
}

.rollout-progress {
  height: 100%;
  background: #8b5cf6;
  transition: width 0.3s ease;
}

.panel-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.action-btn {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.primary {
  background: #8b5cf6;
  color: white;
}

.action-btn.primary:hover {
  background: #7c3aed;
  transform: translateY(-1px);
}

.action-btn.secondary {
  background: #f1f5f9;
  color: #475569;
}

.action-btn.secondary:hover {
  background: #e2e8f0;
}

.action-btn.warning {
  background: #fef3c7;
  color: #92400e;
}

.action-btn.warning:hover {
  background: #fde68a;
}

@media (max-width: 480px) {
  .feature-flags-panel {
    right: 10px;
    bottom: 10px;
    width: calc(100vw - 20px);
    max-width: 350px;
  }
}
</style>

<!--
  Sallie 1.0 Module
  Persona: Tough love meets soul care.
  Function: Advanced feature flags management panel.
  Got it, love.
-->

<template>
  <div class="feature-flags-panel sallie-card">
    <div class="panel-header">
      <h3>Feature Control Center</h3>
      <button @click="toggleExpanded" class="expand-btn" :class="{ expanded }">
        {{ expanded ? '−' : '+' }}
      </button>
    </div>
    
    <div v-if="expanded" class="panel-content">
      <div class="flags-summary">
        <div class="summary-stats">
          <div class="stat">
            <span class="stat-value">{{ enabledCount }}</span>
            <span class="stat-label">Enabled</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ experimentalCount }}</span>
            <span class="stat-label">Experimental</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ totalFlags }}</span>
            <span class="stat-label">Total</span>
          </div>
        </div>
      </div>

      <div class="flags-categories">
        <div 
          v-for="category in categories" 
          :key="category" 
          class="category-section"
          :class="{ 'category-active': activeCategory === category }"
        >
          <h4 @click="setActiveCategory(category)" class="category-header">
            {{ capitalize(category) }} Features
            <span class="category-count">{{ getCategoryFlags(category).length }}</span>
          </h4>
          
          <div v-if="activeCategory === category" class="category-flags">
            <div 
              v-for="flag in getCategoryFlags(category)" 
              :key="flag.key"
              class="flag-item"
              :class="{ 'flag-enabled': flag.enabled, 'flag-experimental': flag.experimental }"
            >
              <div class="flag-header">
                <div class="flag-info">
                  <span class="flag-name">{{ flag.name || flag.key }}</span>
                  <span v-if="flag.experimental" class="experimental-badge">EXP</span>
                </div>
                <label class="flag-toggle">
                  <input 
                    type="checkbox" 
                    :checked="flag.enabled"
                    @change="toggleFlag(flag.key, $event.target.checked)"
                  />
                  <span class="toggle-slider"></span>
                </label>
              </div>
              
              <div class="flag-description">
                {{ flag.description || 'No description available' }}
              </div>
              
              <div v-if="flag.requirements && flag.requirements.length" class="flag-requirements">
                <small>Requires: {{ flag.requirements.join(', ') }}</small>
              </div>
              
              <div v-if="flag.rolloutPercentage !== undefined" class="flag-rollout">
                <div class="rollout-bar">
                  <div 
                    class="rollout-progress" 
                    :style="{ width: flag.rolloutPercentage + '%' }"
                  ></div>
                </div>
                <small>{{ flag.rolloutPercentage }}% rollout</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="panel-actions">
        <button @click="exportConfig" class="action-btn secondary">Export Config</button>
        <button @click="resetToDefaults" class="action-btn warning">Reset Defaults</button>
        <button @click="reloadFlags" class="action-btn primary">Reload Flags</button>
      </div>
    </div>
  </div>
</template>

<script>
import { getAllFlags, setFlag, getExperimentalFlags, loadFlags } from '../../core/featureFlags';

export default {
  name: 'FeatureFlagsPanel',
  data() {
    return {
      expanded: false,
      activeCategory: 'core',
      flags: new Map(),
      categories: ['core', 'ai', 'ui', 'experimental', 'integration']
    };
  },
  computed: {
    flagsArray() {
      return Array.from(this.flags.values());
    },
    totalFlags() {
      return this.flagsArray.length;
    },
    enabledCount() {
      return this.flagsArray.filter(flag => flag.enabled).length;
    },
    experimentalCount() {
      return this.flagsArray.filter(flag => flag.experimental).length;
    }
  },
  mounted() {
    this.loadFlags();
    this.setupRealtimeUpdates();
  },
  methods: {
    loadFlags() {
      this.flags = getAllFlags();
      
      // If no flags loaded, create some defaults
      if (this.flags.size === 0) {
        this.flags = new Map([
          ['enhanced_ui', { 
            key: 'enhanced_ui', 
            name: 'Enhanced UI', 
            description: 'Advanced UI components with animations',
            enabled: true, 
            experimental: false,
            category: 'ui'
          }],
          ['ai_improvements', { 
            key: 'ai_improvements', 
            name: 'AI Improvements', 
            description: 'Enhanced AI processing capabilities',
            enabled: true, 
            experimental: false,
            category: 'ai'
          }],
          ['voice_enhancements', { 
            key: 'voice_enhancements', 
            name: 'Voice Enhancements', 
            description: 'Advanced voice processing and visualization',
            enabled: false, 
            experimental: true,
            category: 'experimental'
          }]
        ]);
      }
    },
    
    getCategoryFlags(category) {
      return this.flagsArray.filter(flag => 
        (flag.category || 'core') === category
      );
    },
    
    toggleFlag(key, enabled) {
      setFlag(key, enabled);
      this.loadFlags(); // Reload to get updated state
      this.$emit('updated', { key, enabled });
    },
    
    toggleExpanded() {
      this.expanded = !this.expanded;
    },
    
    setActiveCategory(category) {
      this.activeCategory = this.activeCategory === category ? null : category;
    },
    
    capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    },
    
    exportConfig() {
      const config = Array.from(this.flags.entries()).reduce((acc, [key, flag]) => {
        acc[key] = { enabled: flag.enabled };
        return acc;
      }, {});
      
      const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sallie-feature-flags.json';
      a.click();
      URL.revokeObjectURL(url);
    },
    
    resetToDefaults() {
      if (confirm('Reset all flags to default values?')) {
        localStorage.removeItem('sallie-feature-flags');
        loadFlags();
        this.loadFlags();
        this.$emit('updated', { action: 'reset' });
      }
    },
    
    reloadFlags() {
      loadFlags();
      this.loadFlags();
      this.$emit('updated', { action: 'reload' });
    },
    
    setupRealtimeUpdates() {
      // Listen for flag changes from other sources
      if (typeof window !== 'undefined') {
        window.addEventListener('sallie-flag-change', (event) => {
          this.loadFlags();
        });
      }
    }
  }
};
</script>

<style scoped>
.feature-flags-panel {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 350px;
  max-height: 600px;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.expand-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: #f1f5f9;
  color: #475569;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.expand-btn:hover {
  background: #e2e8f0;
  transform: scale(1.1);
}

.expand-btn.expanded {
  background: #8b5cf6;
  color: white;
}

.panel-content {
  padding: 16px;
}

.flags-summary {
  margin-bottom: 16px;
}

.summary-stats {
  display: flex;
  gap: 16px;
}

.stat {
  text-align: center;
  flex: 1;
}

.stat-value {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: #8b5cf6;
}

.stat-label {
  font-size: 12px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.category-section {
  margin-bottom: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.category-section.category-active {
  border-color: #8b5cf6;
}

.category-header {
  margin: 0;
  padding: 12px 16px;
  background: #f8fafc;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-header:hover {
  background: #f1f5f9;
}

.category-active .category-header {
  background: #8b5cf6;
  color: white;
}

.category-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 11px;
}

.category-flags {
  padding: 8px;
}

.flag-item {
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  transition: all 0.2s ease;
}

.flag-item:hover {
  border-color: #c7d2fe;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.1);
}

.flag-item.flag-enabled {
  border-color: #10b981;
  background: #f0fdf4;
}

.flag-item.flag-experimental {
  border-left: 4px solid #f59e0b;
}

.flag-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.flag-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.flag-name {
  font-weight: 600;
  color: #1e293b;
}

.experimental-badge {
  font-size: 10px;
  padding: 2px 6px;
  background: #f59e0b;
  color: white;
  border-radius: 4px;
  font-weight: 600;
}

.flag-toggle {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.flag-toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e1;
  transition: 0.2s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.2s;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

input:checked + .toggle-slider {
  background-color: #8b5cf6;
}

input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

.flag-description {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 8px;
}

.flag-requirements {
  font-size: 11px;
  color: #f59e0b;
  margin-bottom: 8px;
}

.flag-rollout {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: #64748b;
}

.rollout-bar {
  flex: 1;
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
}

.rollout-progress {
  height: 100%;
  background: #8b5cf6;
  transition: width 0.3s ease;
}

.panel-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.action-btn {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.primary {
  background: #8b5cf6;
  color: white;
}

.action-btn.primary:hover {
  background: #7c3aed;
  transform: translateY(-1px);
}

.action-btn.secondary {
  background: #f1f5f9;
  color: #475569;
}

.action-btn.secondary:hover {
  background: #e2e8f0;
}

.action-btn.warning {
  background: #fef3c7;
  color: #92400e;
}

.action-btn.warning:hover {
  background: #fde68a;
}

@media (max-width: 480px) {
  .feature-flags-panel {
    right: 10px;
    bottom: 10px;
    width: calc(100vw - 20px);
    max-width: 350px;
  }
}
</style>

/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\ui\components\FeatureFlagsPanel.vue) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\FeatureFlagsPanel.vue) */
/* --- dest (C:\Users\chell\Desktop\newsal\ui\components\FeatureFlagsPanel.vue) --- */
<!-- Merged master for logical file: ui\components\FeatureFlagsPanel
Sources:
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\FeatureFlagsPanel.vue (hash:C9C29FC74355F813A860D21EEA1D1946FD8357827908E9069A63262223A26090)
 - C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\FeatureFlagsPanel.vue (hash:7B49DE48EF774E2FC5E8B59AFEF1A4E277FACFFD4267D94E7FB3326D8C8D76BD)
 -->

<!-- ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\FeatureFlagsPanel.vue | ext: .vue | sha: C9C29FC74355F813A860D21EEA1D1946FD8357827908E9069A63262223A26090 ---- -->
[BINARY FILE - original copied to merged_sources: ui\components\FeatureFlagsPanel.vue]
<!-- ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\FeatureFlagsPanel.vue | ext: .vue | sha: 7B49DE48EF774E2FC5E8B59AFEF1A4E277FACFFD4267D94E7FB3326D8C8D76BD ---- -->
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\FeatureFlagsPanel.vue --- */
<!-- Migrated and adapted from sallie_1.00/ui/components/FeatureFlagsPanel.vue -->
<template>
  <div class="feature-flags-panel">
    <h2>Feature Flags</h2>
    <ul>
      <li v-for="flag in flags" :key="flag.name">
        <label>
          <input type="checkbox" v-model="flag.enabled" />
          {{ flag.name }}
        </label>
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  name: 'FeatureFlagsPanel',
  props: {
    flags: { type: Array, required: true },
    theme: { type: String, default: 'dark' }
  },
  data() {
    return {
      error: '',
      analytics: []
    };
  methods: {
    logAnalytics(event, data) {
      this.analytics.push({ event, data, timestamp: Date.now() });
    }
  }
}
</script>
<style scoped>
.feature-flags-panel {
  background: var(--background-secondary, #1e293b);
  border-radius: var(--border-radius, 8px);
  box-shadow: var(--shadow-md, 0 4px 6px -1px rgb(0 0 0 / 0.1));
  padding: 1em;
  margin: 1em 0;
  color: var(--text-primary, #f8fafc);
label {
  cursor: pointer;
input[type="checkbox"] {
  accent-color: var(--sallie-primary, #6366f1);
</style>

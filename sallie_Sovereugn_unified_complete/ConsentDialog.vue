<!-- Migrated and enhanced from sallie_1.00/ui/components/ConsentDialog.vue -->
<template>
  <div class="consent-dialog">
    <h3>Consent Required</h3>
    <p>{{ message }}</p>
    <button @click="$emit('consent')">I Consent</button>
    <button @click="$emit('decline')">Decline</button>
  </div>
</template>
<script>
export default {
  name: 'ConsentDialog',
  props: {
    message: {
      type: String,
      required: true
    },
    theme: {
      type: String,
      default: 'light'
    }
  },
  data() {
    return {
      analytics: [],
      error: ''
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
.consent-dialog {
  background: var(--background-tertiary, #334155);
  border-radius: var(--border-radius, 8px);
  box-shadow: var(--shadow-md, 0 4px 6px -1px rgb(0 0 0 / 0.1));
  padding: 1.5em;
  color: var(--text-primary, #f8fafc);
  max-width: 400px;
  margin: 2em auto;
}
button {
  background: var(--sallie-success, #10b981);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.5em 1em;
  margin: 0.5em;
  cursor: pointer;
  transition: var(--transition, all 0.2s ease-in-out);
}
button:hover {
  background: var(--sallie-accent, #06b6d4);
}
</style>


<!-- Migrated and enhanced from sallie_1.00/ui/components/ConsentDialog.vue -->
<template>
  <div class="consent-dialog">
    <h3>Consent Required</h3>
    <p>{{ message }}</p>
    <button @click="$emit('consent')">I Consent</button>
    <button @click="$emit('decline')">Decline</button>
  </div>
</template>
<script>
export default {
  name: 'ConsentDialog',
  props: {
    message: {
      type: String,
      required: true
    },
    theme: {
      type: String,
      default: 'light'
    }
  },
  data() {
    return {
      analytics: [],
      error: ''
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
.consent-dialog {
  background: var(--background-tertiary, #334155);
  border-radius: var(--border-radius, 8px);
  box-shadow: var(--shadow-md, 0 4px 6px -1px rgb(0 0 0 / 0.1));
  padding: 1.5em;
  color: var(--text-primary, #f8fafc);
  max-width: 400px;
  margin: 2em auto;
}
button {
  background: var(--sallie-success, #10b981);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.5em 1em;
  margin: 0.5em;
  cursor: pointer;
  transition: var(--transition, all 0.2s ease-in-out);
}
button:hover {
  background: var(--sallie-accent, #06b6d4);
}
</style>


<!--
  Sallie 1.0 Module
  Persona: Tough love meets soul care.
  Function: Consent dialog for privacy and permissions management.
  Got it, love.
-->

<template>
  <div class="consent-dialog-overlay" @click.self="handleDecline">
    <div class="consent-dialog sallie-card sallie-animate-slide-in-up">
      <div class="dialog-header">
        <h3>Privacy & Permissions</h3>
        <div class="trust-indicator">
          <div class="trust-icon">🔒</div>
          <span>Your privacy matters</span>
        </div>
      </div>
      
      <div class="dialog-content">
        <div class="consent-intro">
          <p>
            Hey love, I need your permission for a few things to give you the best experience possible. 
            I'm built with privacy-first principles, so you're always in control.
          </p>
        </div>

        <div class="permissions-section">
          <h4>What I'm asking for:</h4>
          <div class="permission-list">
            <div 
              v-for="reason in reasons" 
              :key="reason.type"
              class="permission-item"
              :class="{ 'permission-required': reason.required }"
            >
              <div class="permission-header">
                <div class="permission-icon" :class="getPermissionIconClass(reason.type)">
                  {{ getPermissionIcon(reason.type) }}
                </div>
                <div class="permission-info">
                  <span class="permission-name">{{ reason.name }}</span>
                  <span v-if="reason.required" class="required-badge">Required</span>
                </div>
                <label v-if="!reason.required" class="permission-toggle">
                  <input 
                    type="checkbox" 
                    v-model="selectedPermissions[reason.type]"
                  />
                  <span class="toggle-slider"></span>
                </label>
              </div>
              
              <div class="permission-description">
                {{ reason.description }}
              </div>
              
              <div v-if="reason.dataUsage" class="data-usage">
                <small><strong>Data usage:</strong> {{ reason.dataUsage }}</small>
              </div>
            </div>
          </div>
        </div>

        <div v-if="dependencyDiff && dependencyDiff.length" class="dependencies-section">
          <h4>New Capabilities:</h4>
          <div class="dependency-list">
            <div 
              v-for="dep in dependencyDiff" 
              :key="dep.name"
              class="dependency-item"
            >
              <span class="dependency-name">{{ dep.name }}</span>
              <span class="dependency-purpose">{{ dep.purpose }}</span>
            </div>
          </div>
        </div>

        <div class="privacy-summary">
          <div class="privacy-points">
            <div class="privacy-point">
              <span class="point-icon">🛡️</span>
              <span>All data stays encrypted and private</span>
            </div>
            <div class="privacy-point">
              <span class="point-icon">🚫</span>
              <span>No tracking or analytics without consent</span>
            </div>
            <div class="privacy-point">
              <span class="point-icon">⚡</span>
              <span>You can change these settings anytime</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="dialog-actions">
        <button @click="handleDecline" class="action-btn secondary">
          Not Now
        </button>
        <button @click="handleAccept" class="action-btn primary" :disabled="!canAccept">
          Got it, let's go!
        </button>
      </div>
      
      <div class="dialog-footer">
        <small>
          By continuing, you agree to our commitment to your privacy and security. 
          <a href="#" @click.prevent="showPrivacyDetails = !showPrivacyDetails">
            {{ showPrivacyDetails ? 'Hide' : 'Show' }} details
          </a>
        </small>
        
        <div v-if="showPrivacyDetails" class="privacy-details">
          <h5>Privacy Commitment:</h5>
          <ul>
            <li>🔐 All personal data is encrypted locally</li>
            <li>🏠 Private mode keeps everything on your device</li>
            <li>🤝 No data is shared without explicit consent</li>
            <li>🗑️ You can delete all data anytime</li>
            <li>👁️ Full transparency on data usage</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConsentDialog',
  props: {
    reasons: {
      type: Array,
      default: () => []
    },
    dependencyDiff: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      selectedPermissions: {},
      showPrivacyDetails: false
    };
  },
  computed: {
    canAccept() {
      // Check that all required permissions are inherently accepted
      // and at least some optional permissions are selected
      const requiredReasons = this.reasons.filter(r => r.required);
      const optionalReasons = this.reasons.filter(r => !r.required);
      
      if (optionalReasons.length === 0) return true;
      
      return Object.values(this.selectedPermissions).some(selected => selected);
    }
  },
  mounted() {
    this.initializePermissions();
  },
  methods: {
    initializePermissions() {
      // Initialize with default selections
      this.reasons.forEach(reason => {
        if (!reason.required) {
          this.$set(this.selectedPermissions, reason.type, reason.defaultEnabled || false);
        }
      });
    },
    
    handleAccept() {
      const consentData = {
        granted: true,
        permissions: this.selectedPermissions,
        timestamp: new Date().toISOString(),
        reasons: this.reasons.map(r => r.type)
      };
      
      this.$emit('accept', consentData);
    },
    
    handleDecline() {
      const consentData = {
        granted: false,
        permissions: {},
        timestamp: new Date().toISOString(),
        reasons: this.reasons.map(r => r.type)
      };
      
      this.$emit('decline', consentData);
    },
    
    getPermissionIcon(type) {
      const icons = {
        'ai-access': '🧠',
        'device-control': '📱',
        'voice-processing': '🎤',
        'data-storage': '💾',
        'network-access': '🌐',
        'location-access': '📍',
        'camera-access': '📷',
        'microphone-access': '🎙️',
        'notifications': '🔔',
        'background-sync': '🔄',
        'analytics': '📊',
        'personalization': '✨'
      };
      return icons[type] || '⚙️';
    },
    
    getPermissionIconClass(type) {
      const classes = {
        'ai-access': 'icon-ai',
        'device-control': 'icon-device',
        'voice-processing': 'icon-voice',
        'data-storage': 'icon-storage',
        'network-access': 'icon-network'
      };
      return classes[type] || 'icon-default';
    }
  }
};
</script>

<style scoped>
.consent-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
}

.consent-dialog {
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.dialog-header {
  padding: 24px 24px 16px;
  border-bottom: 1px solid #e2e8f0;
}

.dialog-header h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
}

.trust-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #10b981;
  font-size: 14px;
  font-weight: 600;
}

.trust-icon {
  font-size: 16px;
}

.dialog-content {
  padding: 20px 24px;
}

.consent-intro {
  margin-bottom: 20px;
}

.consent-intro p {
  margin: 0;
  color: #475569;
  line-height: 1.6;
  font-size: 15px;
}

.permissions-section {
  margin-bottom: 24px;
}

.permissions-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.permission-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.permission-item {
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  transition: all 0.2s ease;
}

.permission-item:hover {
  border-color: #c7d2fe;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.1);
}

.permission-item.permission-required {
  border-color: #8b5cf6;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(139, 92, 246, 0.1) 100%);
}

.permission-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.permission-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: white;
  border: 1px solid #e2e8f0;
}

.permission-icon.icon-ai {
  background: linear-gradient(135deg, #8b5cf6, #d946ef);
  color: white;
  border: none;
}

.permission-icon.icon-device {
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
  color: white;
  border: none;
}

.permission-icon.icon-voice {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
}

.permission-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.permission-name {
  font-weight: 600;
  color: #1e293b;
}

.required-badge {
  font-size: 11px;
  padding: 2px 8px;
  background: #8b5cf6;
  color: white;
  border-radius: 12px;
  font-weight: 600;
  text-transform: uppercase;
  width: fit-content;
}

.permission-toggle {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.permission-toggle input {
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
  transition: 0.3s;
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
  transition: 0.3s;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

input:checked + .toggle-slider {
  background-color: #8b5cf6;
}

input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

.permission-description {
  color: #64748b;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 8px;
}

.data-usage {
  color: #f59e0b;
  font-size: 12px;
}

.dependencies-section {
  margin-bottom: 24px;
}

.dependencies-section h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.dependency-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dependency-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
}

.dependency-name {
  font-weight: 600;
  color: #166534;
}

.dependency-purpose {
  font-size: 13px;
  color: #15803d;
}

.privacy-summary {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%);
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  padding: 16px;
}

.privacy-points {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.privacy-point {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #166534;
  font-size: 14px;
  font-weight: 500;
}

.point-icon {
  font-size: 16px;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e2e8f0;
}

.action-btn {
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.primary {
  background: #8b5cf6;
  color: white;
}

.action-btn.primary:hover:not(:disabled) {
  background: #7c3aed;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

.action-btn.primary:disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
}

.action-btn.secondary {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.action-btn.secondary:hover {
  background: #e2e8f0;
}

.dialog-footer {
  padding: 16px 24px 20px;
  font-size: 13px;
  color: #64748b;
  text-align: center;
  border-top: 1px solid #f1f5f9;
}

.dialog-footer a {
  color: #8b5cf6;
  text-decoration: none;
  font-weight: 500;
}

.dialog-footer a:hover {
  text-decoration: underline;
}

.privacy-details {
  margin-top: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  text-align: left;
}

.privacy-details h5 {
  margin: 0 0 8px 0;
  color: #1e293b;
  font-size: 14px;
}

.privacy-details ul {
  margin: 0;
  padding-left: 16px;
  list-style: none;
}

.privacy-details li {
  margin-bottom: 4px;
  font-size: 12px;
}

/* Animations */
.sallie-animate-slide-in-up {
  animation: slideInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 480px) {
  .consent-dialog {
    width: 95%;
    margin: 20px;
  }
  
  .dialog-header,
  .dialog-content,
  .dialog-actions,
  .dialog-footer {
    padding-left: 16px;
    padding-right: 16px;
  }
  
  .permission-header {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .permission-icon {
    width: 36px;
    height: 36px;
    font-size: 18px;
  }
  
  .dialog-actions {
    flex-direction: column;
  }
}
</style>

<!--
  Sallie 1.0 Module
  Persona: Tough love meets soul care.
  Function: Consent dialog for privacy and permissions management.
  Got it, love.
-->

<template>
  <div class="consent-dialog-overlay" @click.self="handleDecline">
    <div class="consent-dialog sallie-card sallie-animate-slide-in-up">
      <div class="dialog-header">
        <h3>Privacy & Permissions</h3>
        <div class="trust-indicator">
          <div class="trust-icon">🔒</div>
          <span>Your privacy matters</span>
        </div>
      </div>
      
      <div class="dialog-content">
        <div class="consent-intro">
          <p>
            Hey love, I need your permission for a few things to give you the best experience possible. 
            I'm built with privacy-first principles, so you're always in control.
          </p>
        </div>

        <div class="permissions-section">
          <h4>What I'm asking for:</h4>
          <div class="permission-list">
            <div 
              v-for="reason in reasons" 
              :key="reason.type"
              class="permission-item"
              :class="{ 'permission-required': reason.required }"
            >
              <div class="permission-header">
                <div class="permission-icon" :class="getPermissionIconClass(reason.type)">
                  {{ getPermissionIcon(reason.type) }}
                </div>
                <div class="permission-info">
                  <span class="permission-name">{{ reason.name }}</span>
                  <span v-if="reason.required" class="required-badge">Required</span>
                </div>
                <label v-if="!reason.required" class="permission-toggle">
                  <input 
                    type="checkbox" 
                    v-model="selectedPermissions[reason.type]"
                  />
                  <span class="toggle-slider"></span>
                </label>
              </div>
              
              <div class="permission-description">
                {{ reason.description }}
              </div>
              
              <div v-if="reason.dataUsage" class="data-usage">
                <small><strong>Data usage:</strong> {{ reason.dataUsage }}</small>
              </div>
            </div>
          </div>
        </div>

        <div v-if="dependencyDiff && dependencyDiff.length" class="dependencies-section">
          <h4>New Capabilities:</h4>
          <div class="dependency-list">
            <div 
              v-for="dep in dependencyDiff" 
              :key="dep.name"
              class="dependency-item"
            >
              <span class="dependency-name">{{ dep.name }}</span>
              <span class="dependency-purpose">{{ dep.purpose }}</span>
            </div>
          </div>
        </div>

        <div class="privacy-summary">
          <div class="privacy-points">
            <div class="privacy-point">
              <span class="point-icon">🛡️</span>
              <span>All data stays encrypted and private</span>
            </div>
            <div class="privacy-point">
              <span class="point-icon">🚫</span>
              <span>No tracking or analytics without consent</span>
            </div>
            <div class="privacy-point">
              <span class="point-icon">⚡</span>
              <span>You can change these settings anytime</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="dialog-actions">
        <button @click="handleDecline" class="action-btn secondary">
          Not Now
        </button>
        <button @click="handleAccept" class="action-btn primary" :disabled="!canAccept">
          Got it, let's go!
        </button>
      </div>
      
      <div class="dialog-footer">
        <small>
          By continuing, you agree to our commitment to your privacy and security. 
          <a href="#" @click.prevent="showPrivacyDetails = !showPrivacyDetails">
            {{ showPrivacyDetails ? 'Hide' : 'Show' }} details
          </a>
        </small>
        
        <div v-if="showPrivacyDetails" class="privacy-details">
          <h5>Privacy Commitment:</h5>
          <ul>
            <li>🔐 All personal data is encrypted locally</li>
            <li>🏠 Private mode keeps everything on your device</li>
            <li>🤝 No data is shared without explicit consent</li>
            <li>🗑️ You can delete all data anytime</li>
            <li>👁️ Full transparency on data usage</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConsentDialog',
  props: {
    reasons: {
      type: Array,
      default: () => []
    },
    dependencyDiff: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      selectedPermissions: {},
      showPrivacyDetails: false
    };
  },
  computed: {
    canAccept() {
      // Check that all required permissions are inherently accepted
      // and at least some optional permissions are selected
      const requiredReasons = this.reasons.filter(r => r.required);
      const optionalReasons = this.reasons.filter(r => !r.required);
      
      if (optionalReasons.length === 0) return true;
      
      return Object.values(this.selectedPermissions).some(selected => selected);
    }
  },
  mounted() {
    this.initializePermissions();
  },
  methods: {
    initializePermissions() {
      // Initialize with default selections
      this.reasons.forEach(reason => {
        if (!reason.required) {
          this.$set(this.selectedPermissions, reason.type, reason.defaultEnabled || false);
        }
      });
    },
    
    handleAccept() {
      const consentData = {
        granted: true,
        permissions: this.selectedPermissions,
        timestamp: new Date().toISOString(),
        reasons: this.reasons.map(r => r.type)
      };
      
      this.$emit('accept', consentData);
    },
    
    handleDecline() {
      const consentData = {
        granted: false,
        permissions: {},
        timestamp: new Date().toISOString(),
        reasons: this.reasons.map(r => r.type)
      };
      
      this.$emit('decline', consentData);
    },
    
    getPermissionIcon(type) {
      const icons = {
        'ai-access': '🧠',
        'device-control': '📱',
        'voice-processing': '🎤',
        'data-storage': '💾',
        'network-access': '🌐',
        'location-access': '📍',
        'camera-access': '📷',
        'microphone-access': '🎙️',
        'notifications': '🔔',
        'background-sync': '🔄',
        'analytics': '📊',
        'personalization': '✨'
      };
      return icons[type] || '⚙️';
    },
    
    getPermissionIconClass(type) {
      const classes = {
        'ai-access': 'icon-ai',
        'device-control': 'icon-device',
        'voice-processing': 'icon-voice',
        'data-storage': 'icon-storage',
        'network-access': 'icon-network'
      };
      return classes[type] || 'icon-default';
    }
  }
};
</script>

<style scoped>
.consent-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
}

.consent-dialog {
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.dialog-header {
  padding: 24px 24px 16px;
  border-bottom: 1px solid #e2e8f0;
}

.dialog-header h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
}

.trust-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #10b981;
  font-size: 14px;
  font-weight: 600;
}

.trust-icon {
  font-size: 16px;
}

.dialog-content {
  padding: 20px 24px;
}

.consent-intro {
  margin-bottom: 20px;
}

.consent-intro p {
  margin: 0;
  color: #475569;
  line-height: 1.6;
  font-size: 15px;
}

.permissions-section {
  margin-bottom: 24px;
}

.permissions-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.permission-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.permission-item {
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  transition: all 0.2s ease;
}

.permission-item:hover {
  border-color: #c7d2fe;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.1);
}

.permission-item.permission-required {
  border-color: #8b5cf6;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(139, 92, 246, 0.1) 100%);
}

.permission-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.permission-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: white;
  border: 1px solid #e2e8f0;
}

.permission-icon.icon-ai {
  background: linear-gradient(135deg, #8b5cf6, #d946ef);
  color: white;
  border: none;
}

.permission-icon.icon-device {
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
  color: white;
  border: none;
}

.permission-icon.icon-voice {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
}

.permission-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.permission-name {
  font-weight: 600;
  color: #1e293b;
}

.required-badge {
  font-size: 11px;
  padding: 2px 8px;
  background: #8b5cf6;
  color: white;
  border-radius: 12px;
  font-weight: 600;
  text-transform: uppercase;
  width: fit-content;
}

.permission-toggle {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.permission-toggle input {
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
  transition: 0.3s;
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
  transition: 0.3s;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

input:checked + .toggle-slider {
  background-color: #8b5cf6;
}

input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

.permission-description {
  color: #64748b;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 8px;
}

.data-usage {
  color: #f59e0b;
  font-size: 12px;
}

.dependencies-section {
  margin-bottom: 24px;
}

.dependencies-section h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.dependency-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dependency-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
}

.dependency-name {
  font-weight: 600;
  color: #166534;
}

.dependency-purpose {
  font-size: 13px;
  color: #15803d;
}

.privacy-summary {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%);
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  padding: 16px;
}

.privacy-points {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.privacy-point {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #166534;
  font-size: 14px;
  font-weight: 500;
}

.point-icon {
  font-size: 16px;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e2e8f0;
}

.action-btn {
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.primary {
  background: #8b5cf6;
  color: white;
}

.action-btn.primary:hover:not(:disabled) {
  background: #7c3aed;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

.action-btn.primary:disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
}

.action-btn.secondary {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.action-btn.secondary:hover {
  background: #e2e8f0;
}

.dialog-footer {
  padding: 16px 24px 20px;
  font-size: 13px;
  color: #64748b;
  text-align: center;
  border-top: 1px solid #f1f5f9;
}

.dialog-footer a {
  color: #8b5cf6;
  text-decoration: none;
  font-weight: 500;
}

.dialog-footer a:hover {
  text-decoration: underline;
}

.privacy-details {
  margin-top: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  text-align: left;
}

.privacy-details h5 {
  margin: 0 0 8px 0;
  color: #1e293b;
  font-size: 14px;
}

.privacy-details ul {
  margin: 0;
  padding-left: 16px;
  list-style: none;
}

.privacy-details li {
  margin-bottom: 4px;
  font-size: 12px;
}

/* Animations */
.sallie-animate-slide-in-up {
  animation: slideInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 480px) {
  .consent-dialog {
    width: 95%;
    margin: 20px;
  }
  
  .dialog-header,
  .dialog-content,
  .dialog-actions,
  .dialog-footer {
    padding-left: 16px;
    padding-right: 16px;
  }
  
  .permission-header {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .permission-icon {
    width: 36px;
    height: 36px;
    font-size: 18px;
  }
  
  .dialog-actions {
    flex-direction: column;
  }
}
</style>

/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\ui\components\ConsentDialog.vue) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\ConsentDialog.vue) */
/* --- dest (C:\Users\chell\Desktop\newsal\ui\components\ConsentDialog.vue) --- */
<!-- Merged master for logical file: ui\components\ConsentDialog
Sources:
 - C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\ConsentDialog.vue (hash:DC1863B29E1DDCF5B413ECE7574B7B02F96489C0BEA65619739E9E0035E96C07)
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\ConsentDialog.vue (hash:721AE60423F6323B94DAD38EEF2926E59B16154B45F99DBD59925C6DD8567E9A)
 -->

<!-- ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\ConsentDialog.vue | ext: .vue | sha: DC1863B29E1DDCF5B413ECE7574B7B02F96489C0BEA65619739E9E0035E96C07 ---- -->
[BINARY FILE - original copied to merged_sources: ui\components\ConsentDialog.vue]
<!-- ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\ConsentDialog.vue | ext: .vue | sha: 721AE60423F6323B94DAD38EEF2926E59B16154B45F99DBD59925C6DD8567E9A ---- -->
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\ConsentDialog.vue --- */
<!-- Migrated and enhanced from sallie_1.00/ui/components/ConsentDialog.vue -->
<template>
  <div class="consent-dialog">
    <h3>Consent Required</h3>
    <p>{{ message }}</p>
    <button @click="$emit('consent')">I Consent</button>
    <button @click="$emit('decline')">Decline</button>
  </div>
</template>
<script>
export default {
  name: 'ConsentDialog',
  props: {
    message: {
      type: String,
      required: true
    },
    theme: {
      default: 'light'
    }
  },
  data() {
    return {
      analytics: [],
      error: ''
    };
  methods: {
    logAnalytics(event, data) {
      this.analytics.push({ event, data, timestamp: Date.now() });
  }
}
</script>
<style scoped>
.consent-dialog {
  background: var(--background-tertiary, #334155);
  border-radius: var(--border-radius, 8px);
  box-shadow: var(--shadow-md, 0 4px 6px -1px rgb(0 0 0 / 0.1));
  padding: 1.5em;
  color: var(--text-primary, #f8fafc);
  max-width: 400px;
  margin: 2em auto;
button {
  background: var(--sallie-success, #10b981);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.5em 1em;
  margin: 0.5em;
  cursor: pointer;
  transition: var(--transition, all 0.2s ease-in-out);
button:hover {
  background: var(--sallie-accent, #06b6d4);
</style>

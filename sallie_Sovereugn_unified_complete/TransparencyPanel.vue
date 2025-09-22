<!-- Migrated and adapted from sallie_1.00/ui/components/TransparencyPanel.vue -->
<template>
  <div class="transparency-panel">
    <h2>Transparency</h2>
    <slot></slot>
  </div>
</template>
<script>
export default {
  name: 'TransparencyPanel',
  props: {
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
.transparency-panel {
  background: var(--background-secondary, #1e293b);
  border-radius: var(--border-radius-lg, 12px);
  box-shadow: var(--shadow-lg, 0 10px 15px -3px rgb(0 0 0 / 0.1));
  padding: 2em;
  margin: 2em 0;
  color: var(--text-primary, #f8fafc);
}
</style>


<!-- Migrated and adapted from sallie_1.00/ui/components/TransparencyPanel.vue -->
<template>
  <div class="transparency-panel">
    <h2>Transparency</h2>
    <slot></slot>
  </div>
</template>
<script>
export default {
  name: 'TransparencyPanel',
  props: {
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
.transparency-panel {
  background: var(--background-secondary, #1e293b);
  border-radius: var(--border-radius-lg, 12px);
  box-shadow: var(--shadow-lg, 0 10px 15px -3px rgb(0 0 0 / 0.1));
  padding: 2em;
  margin: 2em 0;
  color: var(--text-primary, #f8fafc);
}
</style>


<!--
  Sallie 1.0 Module
  Persona: Tough love meets soul care.
  Function: Transparency panel for AI decision-making visibility.
  Got it, love.
-->

<template>
  <div v-if="open" class="transparency-overlay" @click.self="closePanel">
    <div class="transparency-panel sallie-card sallie-animate-slide-in-right">
      <div class="panel-header">
        <h3>Decision Transparency</h3>
        <button @click="closePanel" class="close-btn">×</button>
      </div>
      
      <div class="panel-content">
        <div v-if="decision" class="decision-section">
          <div class="section-header">
            <h4>🎯 Current Decision</h4>
            <span class="confidence-badge" :class="getConfidenceClass(decision.confidence)">
              {{ Math.round(decision.confidence * 100) }}% confident
            </span>
          </div>
          
          <div class="decision-details">
            <div class="decision-text">
              {{ decision.text || decision.action || 'Processing...' }}
            </div>
            
            <div v-if="decision.reasoning" class="decision-reasoning">
              <strong>Why I chose this:</strong>
              <p>{{ decision.reasoning }}</p>
            </div>
            
            <div v-if="decision.alternatives && decision.alternatives.length" class="alternatives">
              <strong>Other options I considered:</strong>
              <ul>
                <li v-for="alt in decision.alternatives" :key="alt.text">
                  {{ alt.text }} ({{ Math.round(alt.score * 100) }}% score)
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div v-if="provenance" class="provenance-section">
          <div class="section-header">
            <h4>📋 Decision Trail</h4>
          </div>
          
          <div class="provenance-timeline">
            <div 
              v-for="(step, index) in provenance.steps" 
              :key="index"
              class="timeline-step"
              :class="{ 'step-active': index === provenance.currentStep }"
            >
              <div class="step-marker">{{ index + 1 }}</div>
              <div class="step-content">
                <div class="step-title">{{ step.name }}</div>
                <div class="step-description">{{ step.description }}</div>
                <div v-if="step.data" class="step-data">
                  <small>Input: {{ formatData(step.data) }}</small>
                </div>
                <div class="step-timing">
                  <small>{{ step.duration }}ms</small>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="provenance.sources && provenance.sources.length" class="data-sources">
            <strong>Data sources used:</strong>
            <div class="sources-list">
              <span 
                v-for="source in provenance.sources" 
                :key="source"
                class="source-tag"
              >
                {{ source }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="calibration" class="calibration-section">
          <div class="section-header">
            <h4>⚖️ Risk Assessment</h4>
          </div>
          
          <div class="risk-metrics">
            <div class="metric-row">
              <span class="metric-label">Privacy Risk:</span>
              <div class="risk-bar">
                <div 
                  class="risk-fill privacy" 
                  :style="{ width: calibration.privacyRisk * 100 + '%' }"
                ></div>
              </div>
              <span class="risk-value">{{ Math.round(calibration.privacyRisk * 100) }}%</span>
            </div>
            
            <div class="metric-row">
              <span class="metric-label">Safety Risk:</span>
              <div class="risk-bar">
                <div 
                  class="risk-fill safety" 
                  :style="{ width: calibration.safetyRisk * 100 + '%' }"
                ></div>
              </div>
              <span class="risk-value">{{ Math.round(calibration.safetyRisk * 100) }}%</span>
            </div>
            
            <div class="metric-row">
              <span class="metric-label">Bias Check:</span>
              <div class="risk-bar">
                <div 
                  class="risk-fill bias" 
                  :style="{ width: calibration.biasRisk * 100 + '%' }"
                ></div>
              </div>
              <span class="risk-value">{{ Math.round(calibration.biasRisk * 100) }}%</span>
            </div>
          </div>
          
          <div v-if="calibration.safeguards && calibration.safeguards.length" class="safeguards">
            <strong>Active safeguards:</strong>
            <ul>
              <li v-for="safeguard in calibration.safeguards" :key="safeguard">
                ✅ {{ safeguard }}
              </li>
            </ul>
          </div>
          
          <div v-if="calibration.warnings && calibration.warnings.length" class="warnings">
            <strong>Considerations:</strong>
            <ul>
              <li v-for="warning in calibration.warnings" :key="warning">
                ⚠️ {{ warning }}
              </li>
            </ul>
          </div>
        </div>

        <div class="ai-insights">
          <div class="section-header">
            <h4>🧠 AI Processing Insights</h4>
          </div>
          
          <div class="insight-cards">
            <div class="insight-card">
              <div class="insight-title">Model Used</div>
              <div class="insight-value">{{ getModelName() }}</div>
            </div>
            <div class="insight-card">
              <div class="insight-title">Processing Time</div>
              <div class="insight-value">{{ getProcessingTime() }}ms</div>
            </div>
            <div class="insight-card">
              <div class="insight-title">Context Size</div>
              <div class="insight-value">{{ getContextSize() }} tokens</div>
            </div>
            <div class="insight-card">
              <div class="insight-title">Persona Mode</div>
              <div class="insight-value">{{ getPersonaMode() }}</div>
            </div>
          </div>
        </div>

        <div class="transparency-controls">
          <div class="section-header">
            <h4>🔧 Transparency Settings</h4>
          </div>
          
          <div class="control-options">
            <label class="control-option">
              <input type="checkbox" v-model="showDetailed" />
              <span>Show detailed reasoning</span>
            </label>
            <label class="control-option">
              <input type="checkbox" v-model="showTiming" />
              <span>Show processing times</span>
            </label>
            <label class="control-option">
              <input type="checkbox" v-model="showSources" />
              <span>Show data sources</span>
            </label>
            <label class="control-option">
              <input type="checkbox" v-model="autoShow" />
              <span>Auto-show for critical decisions</span>
            </label>
          </div>
        </div>
      </div>
      
      <div class="panel-footer">
        <div class="footer-info">
          <small>
            This transparency panel shows you how I make decisions. 
            Your trust is earned through openness, not just results.
          </small>
        </div>
        <div class="footer-actions">
          <button @click="exportDecisionLog" class="export-btn">Export Log</button>
          <button @click="closePanel" class="close-btn-footer">Got it, love</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TransparencyPanel',
  props: {
    open: {
      type: Boolean,
      default: false
    },
    decision: {
      type: Object,
      default: null
    },
    provenance: {
      type: Object,
      default: null
    },
    calibration: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      showDetailed: true,
      showTiming: false,
      showSources: true,
      autoShow: false
    };
  },
  methods: {
    closePanel() {
      this.$emit('close');
    },
    
    getConfidenceClass(confidence) {
      if (confidence >= 0.8) return 'high';
      if (confidence >= 0.6) return 'medium';
      return 'low';
    },
    
    formatData(data) {
      if (typeof data === 'string') return data;
      if (typeof data === 'object') {
        return Object.keys(data).join(', ');
      }
      return String(data);
    },
    
    getModelName() {
      return this.decision?.model || 'Gemini Flash';
    },
    
    getProcessingTime() {
      if (this.provenance?.totalTime) return this.provenance.totalTime;
      if (this.decision?.processingTime) return this.decision.processingTime;
      return Math.round(Math.random() * 500 + 100); // Mock data
    },
    
    getContextSize() {
      return this.decision?.contextSize || Math.round(Math.random() * 1000 + 500);
    },
    
    getPersonaMode() {
      return this.decision?.personaMode || 'balanced';
    },
    
    exportDecisionLog() {
      const logData = {
        timestamp: new Date().toISOString(),
        decision: this.decision,
        provenance: this.provenance,
        calibration: this.calibration
      };
      
      const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sallie-decision-log-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }
};
</script>

<style scoped>
.transparency-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  z-index: 5000;
  backdrop-filter: blur(2px);
}

.transparency-panel {
  width: 450px;
  height: 100vh;
  overflow-y: auto;
  background: white;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
  margin: 0;
  border-radius: 0;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
  background: #8b5cf6;
  color: white;
}

.panel-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.panel-content {
  padding: 0;
}

.decision-section,
.provenance-section,
.calibration-section,
.ai-insights,
.transparency-controls {
  padding: 20px;
  border-bottom: 1px solid #f1f5f9;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.confidence-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.confidence-badge.high {
  background: #d1fae5;
  color: #065f46;
}

.confidence-badge.medium {
  background: #fef3c7;
  color: #92400e;
}

.confidence-badge.low {
  background: #fee2e2;
  color: #991b1b;
}

.decision-text {
  font-size: 15px;
  color: #1e293b;
  font-weight: 500;
  margin-bottom: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #8b5cf6;
}

.decision-reasoning {
  margin-bottom: 12px;
}

.decision-reasoning p {
  margin: 8px 0;
  color: #475569;
  line-height: 1.5;
}

.alternatives ul {
  margin: 8px 0;
  padding-left: 20px;
}

.alternatives li {
  color: #64748b;
  margin-bottom: 4px;
}

.provenance-timeline {
  margin-bottom: 16px;
}

.timeline-step {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.timeline-step:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.timeline-step.step-active {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(139, 92, 246, 0.1) 100%);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.step-marker {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #8b5cf6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-title {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.step-description {
  color: #64748b;
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 6px;
}

.step-data,
.step-timing {
  color: #9ca3af;
  font-size: 12px;
}

.sources-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.source-tag {
  padding: 2px 8px;
  background: #e0e7ff;
  color: #3730a3;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.risk-metrics {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
}

.metric-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.metric-label {
  min-width: 80px;
  font-size: 13px;
  font-weight: 500;
  color: #475569;
}

.risk-bar {
  flex: 1;
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
}

.risk-fill {
  height: 100%;
  transition: width 0.8s ease;
}

.risk-fill.privacy {
  background: linear-gradient(90deg, #10b981, #059669);
}

.risk-fill.safety {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}

.risk-fill.bias {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.risk-value {
  min-width: 35px;
  text-align: right;
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
}

.safeguards ul,
.warnings ul {
  margin: 8px 0;
  padding-left: 16px;
  list-style: none;
}

.safeguards li,
.warnings li {
  margin-bottom: 4px;
  font-size: 13px;
}

.insight-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.insight-card {
  padding: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  text-align: center;
}

.insight-title {
  font-size: 11px;
  font-weight: 500;
  color: #64748b;
  text-transform: uppercase;
  margin-bottom: 6px;
}

.insight-value {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.control-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.control-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #475569;
}

.control-option input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #8b5cf6;
}

.panel-footer {
  padding: 20px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.footer-info {
  margin-bottom: 16px;
}

.footer-info small {
  color: #64748b;
  line-height: 1.4;
}

.footer-actions {
  display: flex;
  gap: 12px;
}

.export-btn,
.close-btn-footer {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.export-btn {
  background: #f1f5f9;
  color: #475569;
}

.export-btn:hover {
  background: #e2e8f0;
}

.close-btn-footer {
  background: #8b5cf6;
  color: white;
}

.close-btn-footer:hover {
  background: #7c3aed;
  transform: translateY(-1px);
}

.sallie-animate-slide-in-right {
  animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (max-width: 768px) {
  .transparency-panel {
    width: 100vw;
    height: 100vh;
  }
  
  .insight-cards {
    grid-template-columns: 1fr;
  }
  
  .footer-actions {
    flex-direction: column;
  }
}
</style>

<!--
  Sallie 1.0 Module
  Persona: Tough love meets soul care.
  Function: Transparency panel for AI decision-making visibility.
  Got it, love.
-->

<template>
  <div v-if="open" class="transparency-overlay" @click.self="closePanel">
    <div class="transparency-panel sallie-card sallie-animate-slide-in-right">
      <div class="panel-header">
        <h3>Decision Transparency</h3>
        <button @click="closePanel" class="close-btn">×</button>
      </div>
      
      <div class="panel-content">
        <div v-if="decision" class="decision-section">
          <div class="section-header">
            <h4>🎯 Current Decision</h4>
            <span class="confidence-badge" :class="getConfidenceClass(decision.confidence)">
              {{ Math.round(decision.confidence * 100) }}% confident
            </span>
          </div>
          
          <div class="decision-details">
            <div class="decision-text">
              {{ decision.text || decision.action || 'Processing...' }}
            </div>
            
            <div v-if="decision.reasoning" class="decision-reasoning">
              <strong>Why I chose this:</strong>
              <p>{{ decision.reasoning }}</p>
            </div>
            
            <div v-if="decision.alternatives && decision.alternatives.length" class="alternatives">
              <strong>Other options I considered:</strong>
              <ul>
                <li v-for="alt in decision.alternatives" :key="alt.text">
                  {{ alt.text }} ({{ Math.round(alt.score * 100) }}% score)
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div v-if="provenance" class="provenance-section">
          <div class="section-header">
            <h4>📋 Decision Trail</h4>
          </div>
          
          <div class="provenance-timeline">
            <div 
              v-for="(step, index) in provenance.steps" 
              :key="index"
              class="timeline-step"
              :class="{ 'step-active': index === provenance.currentStep }"
            >
              <div class="step-marker">{{ index + 1 }}</div>
              <div class="step-content">
                <div class="step-title">{{ step.name }}</div>
                <div class="step-description">{{ step.description }}</div>
                <div v-if="step.data" class="step-data">
                  <small>Input: {{ formatData(step.data) }}</small>
                </div>
                <div class="step-timing">
                  <small>{{ step.duration }}ms</small>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="provenance.sources && provenance.sources.length" class="data-sources">
            <strong>Data sources used:</strong>
            <div class="sources-list">
              <span 
                v-for="source in provenance.sources" 
                :key="source"
                class="source-tag"
              >
                {{ source }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="calibration" class="calibration-section">
          <div class="section-header">
            <h4>⚖️ Risk Assessment</h4>
          </div>
          
          <div class="risk-metrics">
            <div class="metric-row">
              <span class="metric-label">Privacy Risk:</span>
              <div class="risk-bar">
                <div 
                  class="risk-fill privacy" 
                  :style="{ width: calibration.privacyRisk * 100 + '%' }"
                ></div>
              </div>
              <span class="risk-value">{{ Math.round(calibration.privacyRisk * 100) }}%</span>
            </div>
            
            <div class="metric-row">
              <span class="metric-label">Safety Risk:</span>
              <div class="risk-bar">
                <div 
                  class="risk-fill safety" 
                  :style="{ width: calibration.safetyRisk * 100 + '%' }"
                ></div>
              </div>
              <span class="risk-value">{{ Math.round(calibration.safetyRisk * 100) }}%</span>
            </div>
            
            <div class="metric-row">
              <span class="metric-label">Bias Check:</span>
              <div class="risk-bar">
                <div 
                  class="risk-fill bias" 
                  :style="{ width: calibration.biasRisk * 100 + '%' }"
                ></div>
              </div>
              <span class="risk-value">{{ Math.round(calibration.biasRisk * 100) }}%</span>
            </div>
          </div>
          
          <div v-if="calibration.safeguards && calibration.safeguards.length" class="safeguards">
            <strong>Active safeguards:</strong>
            <ul>
              <li v-for="safeguard in calibration.safeguards" :key="safeguard">
                ✅ {{ safeguard }}
              </li>
            </ul>
          </div>
          
          <div v-if="calibration.warnings && calibration.warnings.length" class="warnings">
            <strong>Considerations:</strong>
            <ul>
              <li v-for="warning in calibration.warnings" :key="warning">
                ⚠️ {{ warning }}
              </li>
            </ul>
          </div>
        </div>

        <div class="ai-insights">
          <div class="section-header">
            <h4>🧠 AI Processing Insights</h4>
          </div>
          
          <div class="insight-cards">
            <div class="insight-card">
              <div class="insight-title">Model Used</div>
              <div class="insight-value">{{ getModelName() }}</div>
            </div>
            <div class="insight-card">
              <div class="insight-title">Processing Time</div>
              <div class="insight-value">{{ getProcessingTime() }}ms</div>
            </div>
            <div class="insight-card">
              <div class="insight-title">Context Size</div>
              <div class="insight-value">{{ getContextSize() }} tokens</div>
            </div>
            <div class="insight-card">
              <div class="insight-title">Persona Mode</div>
              <div class="insight-value">{{ getPersonaMode() }}</div>
            </div>
          </div>
        </div>

        <div class="transparency-controls">
          <div class="section-header">
            <h4>🔧 Transparency Settings</h4>
          </div>
          
          <div class="control-options">
            <label class="control-option">
              <input type="checkbox" v-model="showDetailed" />
              <span>Show detailed reasoning</span>
            </label>
            <label class="control-option">
              <input type="checkbox" v-model="showTiming" />
              <span>Show processing times</span>
            </label>
            <label class="control-option">
              <input type="checkbox" v-model="showSources" />
              <span>Show data sources</span>
            </label>
            <label class="control-option">
              <input type="checkbox" v-model="autoShow" />
              <span>Auto-show for critical decisions</span>
            </label>
          </div>
        </div>
      </div>
      
      <div class="panel-footer">
        <div class="footer-info">
          <small>
            This transparency panel shows you how I make decisions. 
            Your trust is earned through openness, not just results.
          </small>
        </div>
        <div class="footer-actions">
          <button @click="exportDecisionLog" class="export-btn">Export Log</button>
          <button @click="closePanel" class="close-btn-footer">Got it, love</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TransparencyPanel',
  props: {
    open: {
      type: Boolean,
      default: false
    },
    decision: {
      type: Object,
      default: null
    },
    provenance: {
      type: Object,
      default: null
    },
    calibration: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      showDetailed: true,
      showTiming: false,
      showSources: true,
      autoShow: false
    };
  },
  methods: {
    closePanel() {
      this.$emit('close');
    },
    
    getConfidenceClass(confidence) {
      if (confidence >= 0.8) return 'high';
      if (confidence >= 0.6) return 'medium';
      return 'low';
    },
    
    formatData(data) {
      if (typeof data === 'string') return data;
      if (typeof data === 'object') {
        return Object.keys(data).join(', ');
      }
      return String(data);
    },
    
    getModelName() {
      return this.decision?.model || 'Gemini Flash';
    },
    
    getProcessingTime() {
      if (this.provenance?.totalTime) return this.provenance.totalTime;
      if (this.decision?.processingTime) return this.decision.processingTime;
      return Math.round(Math.random() * 500 + 100); // Mock data
    },
    
    getContextSize() {
      return this.decision?.contextSize || Math.round(Math.random() * 1000 + 500);
    },
    
    getPersonaMode() {
      return this.decision?.personaMode || 'balanced';
    },
    
    exportDecisionLog() {
      const logData = {
        timestamp: new Date().toISOString(),
        decision: this.decision,
        provenance: this.provenance,
        calibration: this.calibration
      };
      
      const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sallie-decision-log-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }
};
</script>

<style scoped>
.transparency-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  z-index: 5000;
  backdrop-filter: blur(2px);
}

.transparency-panel {
  width: 450px;
  height: 100vh;
  overflow-y: auto;
  background: white;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
  margin: 0;
  border-radius: 0;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
  background: #8b5cf6;
  color: white;
}

.panel-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.panel-content {
  padding: 0;
}

.decision-section,
.provenance-section,
.calibration-section,
.ai-insights,
.transparency-controls {
  padding: 20px;
  border-bottom: 1px solid #f1f5f9;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.confidence-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.confidence-badge.high {
  background: #d1fae5;
  color: #065f46;
}

.confidence-badge.medium {
  background: #fef3c7;
  color: #92400e;
}

.confidence-badge.low {
  background: #fee2e2;
  color: #991b1b;
}

.decision-text {
  font-size: 15px;
  color: #1e293b;
  font-weight: 500;
  margin-bottom: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #8b5cf6;
}

.decision-reasoning {
  margin-bottom: 12px;
}

.decision-reasoning p {
  margin: 8px 0;
  color: #475569;
  line-height: 1.5;
}

.alternatives ul {
  margin: 8px 0;
  padding-left: 20px;
}

.alternatives li {
  color: #64748b;
  margin-bottom: 4px;
}

.provenance-timeline {
  margin-bottom: 16px;
}

.timeline-step {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.timeline-step:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.timeline-step.step-active {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(139, 92, 246, 0.1) 100%);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.step-marker {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #8b5cf6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-title {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.step-description {
  color: #64748b;
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 6px;
}

.step-data,
.step-timing {
  color: #9ca3af;
  font-size: 12px;
}

.sources-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.source-tag {
  padding: 2px 8px;
  background: #e0e7ff;
  color: #3730a3;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.risk-metrics {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
}

.metric-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.metric-label {
  min-width: 80px;
  font-size: 13px;
  font-weight: 500;
  color: #475569;
}

.risk-bar {
  flex: 1;
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
}

.risk-fill {
  height: 100%;
  transition: width 0.8s ease;
}

.risk-fill.privacy {
  background: linear-gradient(90deg, #10b981, #059669);
}

.risk-fill.safety {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}

.risk-fill.bias {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.risk-value {
  min-width: 35px;
  text-align: right;
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
}

.safeguards ul,
.warnings ul {
  margin: 8px 0;
  padding-left: 16px;
  list-style: none;
}

.safeguards li,
.warnings li {
  margin-bottom: 4px;
  font-size: 13px;
}

.insight-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.insight-card {
  padding: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  text-align: center;
}

.insight-title {
  font-size: 11px;
  font-weight: 500;
  color: #64748b;
  text-transform: uppercase;
  margin-bottom: 6px;
}

.insight-value {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.control-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.control-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #475569;
}

.control-option input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #8b5cf6;
}

.panel-footer {
  padding: 20px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.footer-info {
  margin-bottom: 16px;
}

.footer-info small {
  color: #64748b;
  line-height: 1.4;
}

.footer-actions {
  display: flex;
  gap: 12px;
}

.export-btn,
.close-btn-footer {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.export-btn {
  background: #f1f5f9;
  color: #475569;
}

.export-btn:hover {
  background: #e2e8f0;
}

.close-btn-footer {
  background: #8b5cf6;
  color: white;
}

.close-btn-footer:hover {
  background: #7c3aed;
  transform: translateY(-1px);
}

.sallie-animate-slide-in-right {
  animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (max-width: 768px) {
  .transparency-panel {
    width: 100vw;
    height: 100vh;
  }
  
  .insight-cards {
    grid-template-columns: 1fr;
  }
  
  .footer-actions {
    flex-direction: column;
  }
}
</style>

/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\ui\components\TransparencyPanel.vue) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\TransparencyPanel.vue) */
/* --- dest (C:\Users\chell\Desktop\newsal\ui\components\TransparencyPanel.vue) --- */
<!-- Merged master for logical file: ui\components\TransparencyPanel
Sources:
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\TransparencyPanel.vue (hash:42A344797386EC0B57CBDAD7E22D89ECBFEAE0FBC18D51BED72A3B6D5919D002)
 - C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\TransparencyPanel.vue (hash:D65A36BDD0A89D4CC7ED4EA4308F6AC36A9BFAD6027F39CD007E22603E2E0DA9)
 -->

<!-- ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\TransparencyPanel.vue | ext: .vue | sha: 42A344797386EC0B57CBDAD7E22D89ECBFEAE0FBC18D51BED72A3B6D5919D002 ---- -->
[BINARY FILE - original copied to merged_sources: ui\components\TransparencyPanel.vue]
<!-- ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\TransparencyPanel.vue | ext: .vue | sha: D65A36BDD0A89D4CC7ED4EA4308F6AC36A9BFAD6027F39CD007E22603E2E0DA9 ---- -->
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\TransparencyPanel.vue --- */
<!-- Migrated and adapted from sallie_1.00/ui/components/TransparencyPanel.vue -->
<template>
  <div class="transparency-panel">
    <h2>Transparency</h2>
    <slot></slot>
  </div>
</template>
<script>
export default {
  name: 'TransparencyPanel',
  props: {
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
  methods: {
    logAnalytics(event, data) {
      this.analytics.push({ event, data, timestamp: Date.now() });
  }
}
</script>
<style scoped>
.transparency-panel {
  background: var(--background-secondary, #1e293b);
  border-radius: var(--border-radius-lg, 12px);
  box-shadow: var(--shadow-lg, 0 10px 15px -3px rgb(0 0 0 / 0.1));
  padding: 2em;
  margin: 2em 0;
  color: var(--text-primary, #f8fafc);
</style>

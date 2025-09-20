/*
 * Persona: Tough love meets soul care.
 * Module: AmbientAwarenessSystem
 * Intent: Handle functionality for AmbientAwarenessSystem
 * Provenance-ID: 50793b41-b80b-4587-b1a5-6ee5a0a3dce3
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

<template>
  <div class="ambient-awareness-system" :class="theme">
    <div class="system-header">
      <h3 class="system-title">
        <span class="title-icon">🌐</span>
        Ambient Awareness
      </h3>
      <div class="awareness-status" :class="awarenessLevel">
        <div class="status-pulse"></div>
        <span class="status-text">{{ awarenessLevelText }}</span>
      </div>
    </div>

    <div class="predictive-insights">
      <h4 class="section-title">Predictive Insights</h4>
      <div class="insights-grid">
        <div
          v-for="(insight, index) in predictiveInsights"
          :key="index"
          class="insight-card"
          :class="[insight.confidence, { emerging: insight.emerging }]"
        >
          <div class="insight-header">
            <div class="insight-icon">{{ insight.icon }}</div>
            <div class="insight-meta">
              <div class="insight-confidence">
                <div class="confidence-bar">
                  <div class="confidence-fill" :style="{ width: insight.confidenceScore + '%' }"></div>
                </div>
                <span class="confidence-text">{{ Math.round(insight.confidenceScore) }}%</span>
              </div>
            </div>
          </div>
          <div class="insight-content">
            <div class="insight-title">{{ insight.title }}</div>
            <div class="insight-description">{{ insight.description }}</div>
            <div class="insight-timing">Expected: {{ insight.expectedTime }}</div>
          </div>
          <div class="insight-actions">
            <button
              v-if="insight.actionable"
              class="prepare-btn"
              @click="handleInsightAction(insight)"
            >
              Prepare
            </button>
            <button
              class="dismiss-btn"
              @click="dismissInsight(insight)"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="environmental-context">
      <h4 class="section-title">Environmental Context</h4>
      <div class="context-dashboard">
        <div class="context-metric">
          <div class="metric-label">Emotional Climate</div>
          <div class="metric-value" :class="emotionalClimate">{{ emotionalClimate }}</div>
          <div class="climate-indicator">
            <div class="climate-bar" :style="{ width: climateIntensity + '%' }"></div>
          </div>
        </div>

        <div class="context-metric">
          <div class="metric-label">Energy Patterns</div>
          <div class="energy-visualization">
            <div
              v-for="(node, index) in energyNodes"
              :key="index"
              class="energy-node"
              :class="{ active: node.active }"
              :style="{
                left: node.x + '%',
                top: node.y + '%',
                animationDelay: node.delay + 's'
              }"
            ></div>
          </div>
        </div>

        <div class="context-metric">
          <div class="metric-label">Interaction Flow</div>
          <div class="flow-stream">
            <div
              v-for="(flow, index) in interactionFlows"
              :key="index"
              class="flow-particle"
              :style="{
                left: flow.startX + '%',
                top: flow.startY + '%',
                animationDuration: flow.duration + 's',
                animationDelay: flow.delay + 's'
              }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <div class="adaptive-suggestions">
      <h4 class="section-title">Adaptive Suggestions</h4>
      <div class="suggestions-list">
        <div
          v-for="(suggestion, index) in adaptiveSuggestions"
          :key="index"
          class="suggestion-item"
          :class="{ prioritized: suggestion.priority === 'high' }"
        >
          <div class="suggestion-icon">{{ suggestion.icon }}</div>
          <div class="suggestion-content">
            <div class="suggestion-text">{{ suggestion.text }}</div>
            <div class="suggestion-reason">{{ suggestion.reason }}</div>
          </div>
          <div class="suggestion-controls">
            <button
              class="accept-btn"
              @click="acceptSuggestion(suggestion)"
            >
              Accept
            </button>
            <button
              class="decline-btn"
              @click="declineSuggestion(suggestion)"
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="awareness-controls">
      <div class="control-panel">
        <div class="control-group">
          <label class="control-label">Awareness Radius</label>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.1"
            v-model="awarenessRadius"
            @input="adjustAwarenessRadius"
          />
          <span class="radius-value">{{ Math.round(awarenessRadius * 100) }}%</span>
        </div>

        <div class="control-group">
          <label class="control-label">Prediction Horizon</label>
          <select v-model="predictionHorizon" @change="updatePredictionHorizon">
            <option value="short">Short-term (5 min)</option>
            <option value="medium">Medium-term (1 hour)</option>
            <option value="long">Long-term (1 day)</option>
          </select>
        </div>

        <div class="control-group">
          <label class="control-label">Sensitivity</label>
          <div class="sensitivity-options">
            <button
              v-for="level in ['low', 'medium', 'high']"
              :key="level"
              class="sensitivity-btn"
              :class="{ active: sensitivity === level }"
              @click="setSensitivity(level)"
            >
              {{ level.charAt(0).toUpperCase() + level.slice(1) }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AmbientAwarenessSystem',
  props: {
    theme: {
      type: String,
      default: 'dark'
    },
    userContext: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      awarenessLevel: 'active',
      awarenessRadius: 0.7,
      predictionHorizon: 'medium',
      sensitivity: 'medium',
      emotionalClimate: 'harmonious',
      climateIntensity: 75,
      predictiveInsights: [
        {
          icon: '🎯',
          title: 'Focus Peak Approaching',
          description: 'Your concentration levels typically peak in the next 15 minutes',
          expectedTime: 'in 12 minutes',
          confidenceScore: 85,
          confidence: 'high',
          emerging: true,
          actionable: true
        },
        {
          icon: '💭',
          title: 'Creative Insight Ready',
          description: 'Pattern recognition suggests a creative breakthrough is imminent',
          expectedTime: 'in 25 minutes',
          confidenceScore: 72,
          confidence: 'medium',
          emerging: false,
          actionable: true
        },
        {
          icon: '🌱',
          title: 'Growth Moment',
          description: 'Conditions are optimal for meaningful personal reflection',
          expectedTime: 'in 45 minutes',
          confidenceScore: 68,
          confidence: 'medium',
          emerging: false,
          actionable: false
        }
      ],
      energyNodes: [
        { x: 20, y: 30, active: true, delay: 0 },
        { x: 60, y: 50, active: false, delay: 1 },
        { x: 80, y: 20, active: true, delay: 2 },
        { x: 40, y: 70, active: false, delay: 0.5 },
        { x: 10, y: 60, active: true, delay: 1.5 }
      ],
      interactionFlows: [
        { startX: 10, startY: 20, duration: 3, delay: 0 },
        { startX: 70, startY: 30, duration: 4, delay: 1 },
        { startX: 30, startY: 60, duration: 2.5, delay: 2 },
        { startX: 80, startY: 70, duration: 3.5, delay: 0.5 }
      ],
      adaptiveSuggestions: [
        {
          icon: '🎵',
          text: 'Gentle ambient music would enhance your current focus state',
          reason: 'Based on your breathing patterns and task engagement',
          priority: 'medium'
        },
        {
          icon: '💡',
          text: 'Consider taking a 2-minute mindfulness break',
          reason: 'Your stress indicators are rising gradually',
          priority: 'high'
        },
        {
          icon: '🌟',
          text: 'This would be an optimal time for creative work',
          reason: 'Your energy patterns show high creative potential',
          priority: 'medium'
        }
      ]
    };
  },
  computed: {
    awarenessLevelText() {
      const levels = {
        dormant: 'Dormant',
        passive: 'Passive',
        active: 'Active',
        heightened: 'Heightened'
      };
      return levels[this.awarenessLevel] || 'Unknown';
    }
  },
  mounted() {
    this.startAwarenessUpdates();
    this.initializeEnergyFlow();
  },
  beforeUnmount() {
    this.stopAwarenessUpdates();
  },
  methods: {
    startAwarenessUpdates() {
      this.updateInterval = setInterval(() => {
        this.updateAwarenessState();
      }, 3000);
    },
    stopAwarenessUpdates() {
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
      }
    },
    updateAwarenessState() {
      // Simulate dynamic awareness updates
      this.climateIntensity = Math.max(20, Math.min(100, this.climateIntensity + (Math.random() - 0.5) * 10));

      // Update energy nodes
      this.energyNodes.forEach(node => {
        node.active = Math.random() > 0.6;
      });

      // Generate new interaction flows occasionally
      if (Math.random() > 0.8) {
        this.generateInteractionFlow();
      }

      // Update predictive insights
      this.updatePredictiveInsights();
    },
    generateInteractionFlow() {
      const newFlow = {
        startX: Math.random() * 100,
        startY: Math.random() * 100,
        duration: 2 + Math.random() * 3,
        delay: Math.random() * 2
      };

      this.interactionFlows.push(newFlow);

      setTimeout(() => {
        this.interactionFlows.shift();
      }, newFlow.duration * 1000);
    },
    updatePredictiveInsights() {
      this.predictiveInsights.forEach(insight => {
        insight.confidenceScore = Math.max(50, Math.min(95, insight.confidenceScore + (Math.random() - 0.5) * 5));
        insight.emerging = insight.confidenceScore > 80;
      });
    },
    initializeEnergyFlow() {
      // Initialize energy flow visualization
      this.energyFlowInterval = setInterval(() => {
        this.updateEnergyFlow();
      }, 2000);
    },
    updateEnergyFlow() {
      // Update energy flow patterns
      this.energyNodes.forEach((node, index) => {
        node.x = (node.x + (Math.random() - 0.5) * 2) % 100;
        node.y = (node.y + (Math.random() - 0.5) * 2) % 100;
      });
    },
    handleInsightAction(insight) {
      this.$emit('insightAction', insight);
    },
    dismissInsight(insight) {
      const index = this.predictiveInsights.indexOf(insight);
      if (index > -1) {
        this.predictiveInsights.splice(index, 1);
      }
    },
    acceptSuggestion(suggestion) {
      this.$emit('suggestionAccepted', suggestion);
      const index = this.adaptiveSuggestions.indexOf(suggestion);
      if (index > -1) {
        this.adaptiveSuggestions.splice(index, 1);
      }
    },
    declineSuggestion(suggestion) {
      this.$emit('suggestionDeclined', suggestion);
      const index = this.adaptiveSuggestions.indexOf(suggestion);
      if (index > -1) {
        this.adaptiveSuggestions.splice(index, 1);
      }
    },
    adjustAwarenessRadius() {
      this.$emit('radiusChanged', this.awarenessRadius);
    },
    updatePredictionHorizon() {
      this.$emit('horizonChanged', this.predictionHorizon);
    },
    setSensitivity(level) {
      this.sensitivity = level;
      this.$emit('sensitivityChanged', level);
    }
  }
};
</script>

<style scoped>
.ambient-awareness-system {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9));
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(99, 102, 241, 0.3);
  backdrop-filter: blur(20px);
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(99, 102, 241, 0.1);
  max-height: 700px;
  overflow-y: auto;
}

.system-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.system-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: rgba(248, 250, 252, 0.9);
  margin: 0;
}

.title-icon {
  font-size: 1.5rem;
  animation: titleGlow 3s ease-in-out infinite;
}

.awareness-status {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.awareness-status.dormant { background: rgba(107, 114, 128, 0.2); color: #6b7280; }
.awareness-status.passive { background: rgba(251, 191, 36, 0.2); color: #fbbf24; }
.awareness-status.active { background: rgba(52, 211, 153, 0.2); color: #34d399; }
.awareness-status.heightened { background: rgba(168, 85, 247, 0.2); color: #a855f7; }

.status-pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  animation: statusPulse 2s ease-in-out infinite;
}

.predictive-insights {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: rgba(248, 250, 252, 0.9);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title::before {
  content: '';
  width: 4px;
  height: 16px;
  background: linear-gradient(180deg, #6366f1, #a855f7);
  border-radius: 2px;
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.insight-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.insight-card.emerging {
  animation: cardEmerging 0.6s ease-out;
}

.insight-card.high {
  border-color: rgba(52, 211, 153, 0.3);
  background: rgba(52, 211, 153, 0.05);
}

.insight-card.medium {
  border-color: rgba(251, 191, 36, 0.3);
  background: rgba(251, 191, 36, 0.05);
}

.insight-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.insight-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.insight-icon {
  font-size: 1.5rem;
  animation: insightGlow 3s ease-in-out infinite;
}

.insight-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.confidence-bar {
  width: 60px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.confidence-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #a855f7);
  border-radius: 2px;
  transition: width 0.5s ease;
}

.confidence-text {
  font-size: 0.75rem;
  color: rgba(203, 213, 225, 0.7);
}

.insight-content {
  margin-bottom: 1rem;
}

.insight-title {
  font-weight: 600;
  color: rgba(248, 250, 252, 0.9);
  margin-bottom: 0.5rem;
}

.insight-description {
  font-size: 0.875rem;
  color: rgba(203, 213, 225, 0.8);
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.insight-timing {
  font-size: 0.75rem;
  color: rgba(168, 85, 247, 0.8);
  font-weight: 500;
}

.insight-actions {
  display: flex;
  gap: 0.5rem;
}

.prepare-btn,
.dismiss-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.prepare-btn {
  background: linear-gradient(135deg, #6366f1, #a855f7);
  color: white;
}

.prepare-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.dismiss-btn {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(203, 213, 225, 0.8);
}

.dismiss-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.environmental-context {
  margin-bottom: 2rem;
}

.context-dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.context-metric {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.metric-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(203, 213, 225, 0.8);
  margin-bottom: 0.75rem;
}

.metric-value {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-transform: capitalize;
}

.metric-value.harmonious { color: #34d399; }
.metric-value.tense { color: #fbbf24; }
.metric-value.turbulent { color: #ef4444; }
.metric-value.calm { color: #60a5fa; }

.climate-indicator {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.climate-bar {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #a855f7);
  border-radius: 3px;
  transition: width 1s ease;
}

.energy-visualization,
.flow-stream {
  height: 80px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.energy-node {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #6366f1;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.energy-node.active {
  background: #a855f7;
  opacity: 1;
  box-shadow: 0 0 12px #a855f7;
  animation: energyPulse 1.5s ease-in-out infinite;
}

.flow-particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #34d399;
  border-radius: 50%;
  opacity: 0;
  animation: flowParticle 1s ease-out forwards;
}

.adaptive-suggestions {
  margin-bottom: 2rem;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.suggestion-item.prioritized {
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.05);
}

.suggestion-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-1px);
}

.suggestion-icon {
  font-size: 1.25rem;
  margin-top: 0.125rem;
  animation: suggestionGlow 3s ease-in-out infinite;
}

.suggestion-content {
  flex: 1;
}

.suggestion-text {
  color: rgba(248, 250, 252, 0.9);
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.suggestion-reason {
  font-size: 0.875rem;
  color: rgba(203, 213, 225, 0.7);
}

.suggestion-controls {
  display: flex;
  gap: 0.5rem;
}

.accept-btn,
.decline-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.accept-btn {
  background: linear-gradient(135deg, #34d399, #10b981);
  color: white;
}

.accept-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(52, 211, 153, 0.3);
}

.decline-btn {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(203, 213, 225, 0.8);
}

.decline-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.awareness-controls {
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.control-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.control-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(203, 213, 225, 0.8);
}

.control-group input,
.control-group select {
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(248, 250, 252, 0.9);
  font-size: 0.875rem;
}

.control-group input:focus,
.control-group select:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.radius-value {
  font-size: 0.75rem;
  color: rgba(203, 213, 225, 0.7);
  align-self: flex-end;
}

.sensitivity-options {
  display: flex;
  gap: 0.5rem;
}

.sensitivity-btn {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: rgba(203, 213, 225, 0.8);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sensitivity-btn.active {
  background: #6366f1;
  border-color: #6366f1;
  color: white;
}

.sensitivity-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Animations */
@keyframes titleGlow {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.2) hue-rotate(15deg); }
}

@keyframes statusPulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

@keyframes insightGlow {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.2) hue-rotate(45deg); }
}

@keyframes cardEmerging {
  0% { transform: scale(0.9) translateY(10px); opacity: 0; }
  100% { transform: scale(1) translateY(0px); opacity: 1; }
}

@keyframes energyPulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.5); opacity: 1; }
}

@keyframes flowParticle {
  0% { opacity: 0; transform: scale(0); }
  50% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0); }
}

@keyframes suggestionGlow {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.1) hue-rotate(60deg); }
}

/* Responsive design */
@media (max-width: 768px) {
  .ambient-awareness-system {
    padding: 1rem;
  }

  .insights-grid {
    grid-template-columns: 1fr;
  }

  .context-dashboard {
    grid-template-columns: 1fr;
  }

  .sensitivity-options {
    flex-direction: column;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .title-icon,
  .status-pulse,
  .insight-icon,
  .energy-node.active,
  .suggestion-icon {
    animation: none;
  }

  .insight-card,
  .suggestion-item,
  .accept-btn,
  .prepare-btn {
    transition: none;
  }

  .confidence-fill,
  .climate-bar {
    transition: none;
  }
}
</style>

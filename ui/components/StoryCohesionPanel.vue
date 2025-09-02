/*
 * Persona: Tough love meets soul care.
 * Module: StoryCohesionPanel
 * Intent: Handle functionality for StoryCohesionPanel
 * Provenance-ID: 2599a9d9-8e05-4b02-a7b1-ba25b92fb5fd
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

<template>
  <div class="story-cohesion-panel" :class="theme">
    <div class="panel-header">
      <h3 class="panel-title">
        <span class="title-icon">📖</span>
        Story Cohesion
      </h3>
      <div class="narrative-status" :class="cohesionLevel">
        <span class="status-indicator"></span>
        <span class="status-text">{{ cohesionLevelText }}</span>
      </div>
    </div>

    <div class="narrative-arc">
      <div class="arc-visualization">
        <div class="arc-timeline">
          <div
            v-for="(beat, index) in narrativeBeats"
            :key="index"
            class="narrative-beat"
            :class="[beat.type, { active: beat.active }]"
            :style="{ left: beat.position + '%' }"
          >
            <div class="beat-marker" :title="beat.description">
              <span class="beat-symbol">{{ beat.symbol }}</span>
            </div>
            <div class="beat-label">{{ beat.label }}</div>
          </div>
        </div>
        <div class="arc-flow" :style="{ width: arcProgress + '%' }"></div>
      </div>
    </div>

    <div class="active-motifs">
      <h4 class="section-title">Active Motifs</h4>
      <div class="motif-grid">
        <div
          v-for="(motif, index) in activeMotifs"
          :key="index"
          class="motif-card"
          :class="{ resonant: motif.resonant }"
        >
          <div class="motif-symbol">{{ motif.symbol }}</div>
          <div class="motif-info">
            <div class="motif-name">{{ motif.name }}</div>
            <div class="motif-theme">{{ motif.theme }}</div>
            <div class="motif-strength">
              <div class="strength-bar">
                <div class="strength-fill" :style="{ width: motif.strength + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="symbol-registry">
      <h4 class="section-title">Symbolic Elements</h4>
      <div class="symbol-stream">
        <div
          v-for="(symbol, index) in symbolStream"
          :key="index"
          class="symbol-item"
          :class="{ emerging: symbol.emerging, fading: symbol.fading }"
        >
          <span class="symbol-emoji">{{ symbol.emoji }}</span>
          <span class="symbol-meaning">{{ symbol.meaning }}</span>
          <div class="symbol-resonance" :style="{ opacity: symbol.resonance }"></div>
        </div>
      </div>
    </div>

    <div class="narrative-insights">
      <h4 class="section-title">Narrative Insights</h4>
      <div class="insight-list">
        <div
          v-for="(insight, index) in narrativeInsights"
          :key="index"
          class="insight-item"
          :class="insight.priority"
        >
          <div class="insight-icon">{{ insight.icon }}</div>
          <div class="insight-content">
            <div class="insight-text">{{ insight.text }}</div>
            <div class="insight-context">{{ insight.context }}</div>
          </div>
          <div class="insight-actions">
            <button
              v-if="insight.actionable"
              class="action-btn"
              @click="handleInsightAction(insight)"
            >
              {{ insight.actionText }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="cohesion-controls">
      <div class="control-group">
        <label class="control-label">Narrative Focus</label>
        <select v-model="narrativeFocus" @change="updateNarrativeFocus">
          <option value="emotional_arc">Emotional Arc</option>
          <option value="character_growth">Character Growth</option>
          <option value="relationship_dynamics">Relationship Dynamics</option>
          <option value="thematic_development">Thematic Development</option>
        </select>
      </div>

      <div class="control-group">
        <label class="control-label">Symbol Density</label>
        <input
          type="range"
          min="0.1"
          max="1.0"
          step="0.1"
          v-model="symbolDensity"
          @input="adjustSymbolDensity"
        />
        <span class="density-value">{{ Math.round(symbolDensity * 100) }}%</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StoryCohesionPanel',
  props: {
    theme: {
      type: String,
      default: 'dark'
    },
    narrativeData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      cohesionLevel: 'strong',
      arcProgress: 65,
      narrativeFocus: 'emotional_arc',
      symbolDensity: 0.7,
      narrativeBeats: [
        { type: 'setup', label: 'Setup', symbol: '🌱', position: 10, active: false, description: 'Establishing the foundation' },
        { type: 'inciting', label: 'Inciting', symbol: '⚡', position: 25, active: false, description: 'The call to adventure' },
        { type: 'rising', label: 'Rising', symbol: '📈', position: 50, active: true, description: 'Building tension and growth' },
        { type: 'climax', label: 'Climax', symbol: '🔥', position: 75, active: false, description: 'The turning point' },
        { type: 'resolution', label: 'Resolution', symbol: '✨', position: 90, active: false, description: 'Finding peace and wisdom' }
      ],
      activeMotifs: [
        { name: 'Phoenix Rising', theme: 'Rebirth', symbol: '🔥', strength: 85, resonant: true },
        { name: 'Anchor Deep', theme: 'Stability', symbol: '⚓', strength: 70, resonant: false },
        { name: 'Light Within', theme: 'Inner Wisdom', symbol: '💡', strength: 90, resonant: true }
      ],
      symbolStream: [
        { emoji: '🌸', meaning: 'Growth', resonance: 0.8, emerging: true, fading: false },
        { emoji: '🌙', meaning: 'Reflection', resonance: 0.6, emerging: false, fading: false },
        { emoji: '🌟', meaning: 'Hope', resonance: 0.9, emerging: false, fading: false },
        { emoji: '🌿', meaning: 'Renewal', resonance: 0.7, emerging: false, fading: true }
      ],
      narrativeInsights: [
        {
          icon: '🎭',
          text: 'Your emotional journey is entering a transformative phase',
          context: 'Recent patterns suggest significant personal growth',
          priority: 'high',
          actionable: true,
          actionText: 'Explore'
        },
        {
          icon: '🔗',
          text: 'Connection motifs are strengthening across your experiences',
          context: 'Relationships showing deeper resonance',
          priority: 'medium',
          actionable: false
        },
        {
          icon: '🌱',
          text: 'New growth patterns emerging in your decision-making',
          context: 'Confidence and clarity are increasing',
          priority: 'medium',
          actionable: true,
          actionText: 'Nurture'
        }
      ]
    };
  },
  computed: {
    cohesionLevelText() {
      const levels = {
        weak: 'Fragmented',
        moderate: 'Developing',
        strong: 'Cohesive',
        exceptional: 'Masterful'
      };
      return levels[this.cohesionLevel] || 'Unknown';
    }
  },
  mounted() {
    this.startNarrativeUpdates();
  },
  beforeUnmount() {
    this.stopNarrativeUpdates();
  },
  methods: {
    startNarrativeUpdates() {
      this.updateInterval = setInterval(() => {
        this.updateNarrativeState();
      }, 5000);
    },
    stopNarrativeUpdates() {
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
      }
    },
    updateNarrativeState() {
      // Simulate dynamic narrative updates
      this.arcProgress = Math.min(100, this.arcProgress + Math.random() * 2);

      // Update symbol resonances
      this.symbolStream.forEach(symbol => {
        symbol.resonance = Math.max(0.1, Math.min(1, symbol.resonance + (Math.random() - 0.5) * 0.1));
      });

      // Update motif strengths
      this.activeMotifs.forEach(motif => {
        motif.strength = Math.max(20, Math.min(100, motif.strength + (Math.random() - 0.5) * 5));
        motif.resonant = motif.strength > 75;
      });
    },
    updateNarrativeFocus() {
      this.$emit('focusChanged', this.narrativeFocus);
    },
    adjustSymbolDensity() {
      this.$emit('densityChanged', this.symbolDensity);
    },
    handleInsightAction(insight) {
      this.$emit('insightAction', insight);
    }
  }
};
</script>

<style scoped>
.story-cohesion-panel {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9));
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(99, 102, 241, 0.3);
  backdrop-filter: blur(20px);
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(99, 102, 241, 0.1);
  max-height: 600px;
  overflow-y: auto;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-title {
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

.narrative-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.narrative-status.weak { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
.narrative-status.moderate { background: rgba(251, 191, 36, 0.2); color: #fbbf24; }
.narrative-status.strong { background: rgba(52, 211, 153, 0.2); color: #34d399; }
.narrative-status.exceptional { background: rgba(168, 85, 247, 0.2); color: #a855f7; }

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  animation: statusPulse 2s ease-in-out infinite;
}

.narrative-arc {
  margin-bottom: 2rem;
}

.arc-visualization {
  position: relative;
  height: 80px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1rem;
  overflow: hidden;
}

.arc-timeline {
  position: relative;
  height: 100%;
}

.narrative-beat {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.beat-marker {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  cursor: help;
}

.narrative-beat.active .beat-marker {
  background: rgba(99, 102, 241, 0.3);
  border-color: #6366f1;
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
  animation: beatPulse 2s ease-in-out infinite;
}

.beat-symbol {
  font-size: 1.25rem;
  animation: symbolFloat 3s ease-in-out infinite;
}

.beat-label {
  font-size: 0.75rem;
  color: rgba(203, 213, 225, 0.8);
  text-align: center;
  font-weight: 500;
}

.arc-flow {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 4px;
  background: linear-gradient(90deg, #6366f1, #a855f7);
  border-radius: 2px;
  transition: width 1s ease-out;
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
}

.active-motifs {
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

.motif-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.motif-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.motif-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.5), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.motif-card.resonant::before {
  opacity: 1;
}

.motif-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.motif-symbol {
  font-size: 2rem;
  text-align: center;
  margin-bottom: 0.75rem;
  animation: motifGlow 4s ease-in-out infinite;
}

.motif-info {
  text-align: center;
}

.motif-name {
  font-weight: 600;
  color: rgba(248, 250, 252, 0.9);
  margin-bottom: 0.25rem;
}

.motif-theme {
  font-size: 0.875rem;
  color: rgba(203, 213, 225, 0.7);
  margin-bottom: 0.75rem;
}

.strength-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #a855f7);
  border-radius: 2px;
  transition: width 0.5s ease;
}

.symbol-registry {
  margin-bottom: 2rem;
}

.symbol-stream {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.symbol-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.symbol-item.emerging {
  animation: symbolEmerging 0.6s ease-out;
}

.symbol-item.fading {
  animation: symbolFading 0.6s ease-out;
  opacity: 0.6;
}

.symbol-emoji {
  font-size: 1.25rem;
  animation: symbolFloat 3s ease-in-out infinite;
}

.symbol-meaning {
  font-size: 0.875rem;
  color: rgba(203, 213, 225, 0.8);
  font-weight: 500;
}

.symbol-resonance {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #6366f1, #a855f7);
  border-radius: 1px;
}

.narrative-insights {
  margin-bottom: 2rem;
}

.insight-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.insight-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.insight-item.high {
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.05);
}

.insight-item.medium {
  border-color: rgba(251, 191, 36, 0.3);
  background: rgba(251, 191, 36, 0.05);
}

.insight-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-1px);
}

.insight-icon {
  font-size: 1.25rem;
  margin-top: 0.125rem;
  animation: insightGlow 3s ease-in-out infinite;
}

.insight-content {
  flex: 1;
}

.insight-text {
  color: rgba(248, 250, 252, 0.9);
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.insight-context {
  font-size: 0.875rem;
  color: rgba(203, 213, 225, 0.7);
}

.insight-actions {
  flex-shrink: 0;
}

.action-btn {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.cohesion-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
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

.control-group select,
.control-group input {
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(248, 250, 252, 0.9);
  font-size: 0.875rem;
}

.control-group select:focus,
.control-group input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.density-value {
  font-size: 0.75rem;
  color: rgba(203, 213, 225, 0.7);
  align-self: flex-end;
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

@keyframes beatPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes symbolFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-3px); }
}

@keyframes motifGlow {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.3) hue-rotate(30deg); }
}

@keyframes insightGlow {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.2) hue-rotate(45deg); }
}

@keyframes symbolEmerging {
  0% { transform: scale(0) rotate(-180deg); opacity: 0; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

@keyframes symbolFading {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(0.8); opacity: 0.6; }
}

/* Responsive design */
@media (max-width: 768px) {
  .story-cohesion-panel {
    padding: 1rem;
  }

  .motif-grid {
    grid-template-columns: 1fr;
  }

  .narrative-beat {
    flex-direction: row;
    gap: 0.25rem;
  }

  .beat-label {
    writing-mode: vertical-rl;
    text-orientation: mixed;
  }

  .symbol-stream {
    justify-content: center;
  }
}

/* Dark theme optimizations */
.story-cohesion-panel.dark {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9));
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .title-icon,
  .status-indicator,
  .beat-symbol,
  .motif-symbol,
  .symbol-emoji,
  .insight-icon {
    animation: none;
  }

  .narrative-beat.active .beat-marker {
    animation: none;
  }

  .motif-card,
  .insight-item,
  .action-btn {
    transition: none;
  }

  .arc-flow {
    transition: none;
  }

  .strength-fill {
    transition: none;
  }
}
</style>

/*
 * Persona: Tough love meets soul care.
 * Module: PersonaVisualization
 * Intent: Handle functionality for PersonaVisualization
 * Provenance-ID: 3d8c8a95-41ef-4195-a145-a57b12f17e70
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

<template>
  <div class="persona-visualization" :class="[theme, emotion]" aria-label="Persona Visualization" tabindex="0">
    <div class="persona-core">
      <div class="persona-avatar" :class="emotion">
        <div class="avatar-glow" :style="{ background: glowColor }"></div>
        <div class="avatar-core">
          <div class="persona-symbol">{{ personaSymbol }}</div>
          <div class="emotion-indicator" :class="emotion">
            <div class="emotion-pulse" :style="{ animationDuration: pulseSpeed }"></div>
          </div>
        </div>
      </div>

      <div class="persona-info">
        <h3 class="persona-name">{{ persona }}</h3>
        <div class="emotion-display">
          <span class="emotion-label">Current State:</span>
          <span class="emotion-value" :class="emotion">{{ emotion }}</span>
        </div>
        <div class="persona-metrics">
          <div class="metric">
            <span class="metric-label">Resonance</span>
            <div class="metric-bar">
              <div class="metric-fill" :style="{ width: resonanceLevel + '%' }"></div>
            </div>
          </div>
          <div class="metric">
            <span class="metric-label">Harmony</span>
            <div class="metric-bar">
              <div class="metric-fill" :style="{ width: harmonyLevel + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="persona-effects">
      <div class="emotional-auras">
        <div
          v-for="(aura, index) in activeAuras"
          :key="index"
          class="aura-particle"
          :class="aura.type"
          :style="{
            left: aura.x + '%',
            top: aura.y + '%',
            animationDelay: aura.delay + 's',
            animationDuration: aura.duration + 's'
          }"
        ></div>
      </div>
    </div>

    <div class="persona-insights">
      <div class="insight" v-for="(insight, index) in currentInsights" :key="index">
        <div class="insight-icon">{{ insight.icon }}</div>
        <div class="insight-text">{{ insight.text }}</div>
      </div>
    </div>

    <p v-if="error" class="error" aria-live="assertive">{{ error }}</p>
  </div>
</template>
<script>
export default {
  name: 'PersonaVisualization',
  props: {
    persona: { type: String, required: true },
    emotion: { type: String, required: true },
    theme: { type: String, default: 'dark' }
  },
  data() {
    return {
      error: '',
      analytics: [],
      resonanceLevel: 75,
      harmonyLevel: 82,
      activeAuras: [],
      currentInsights: [],
      auraInterval: null,
      insightInterval: null
    };
  },
  computed: {
    personaSymbol() {
      const symbols = {
        'nurturing': '🌸',
        'challenging': '⚡',
        'wise': '🦉',
        'creative': '🎨',
        'analytical': '🔍',
        'empathetic': '💝',
        'default': '✨'
      };
      return symbols[this.persona.toLowerCase()] || symbols.default;
    },
    glowColor() {
      const colors = {
        happy: 'radial-gradient(circle, #fbbf24, #f59e0b)',
        sad: 'radial-gradient(circle, #60a5fa, #3b82f6)',
        angry: 'radial-gradient(circle, #ef4444, #dc2626)',
        calm: 'radial-gradient(circle, #34d399, #10b981)',
        anxious: 'radial-gradient(circle, #f472b6, #ec4899)',
        excited: 'radial-gradient(circle, #a3e635, #84cc16)',
        neutral: 'radial-gradient(circle, #6366f1, #4f46e5)'
      };
      return colors[this.emotion] || colors.neutral;
    },
    pulseSpeed() {
      const speeds = {
        happy: '1.5s',
        sad: '3s',
        angry: '0.8s',
        calm: '2.5s',
        anxious: '1s',
        excited: '0.6s',
        neutral: '2s'
      };
      return speeds[this.emotion] || speeds.neutral;
    }
  },
  mounted() {
    this.startAuraEffects();
    this.generateInsights();
    this.startDynamicUpdates();
  },
  beforeUnmount() {
    this.stopAuraEffects();
    this.stopDynamicUpdates();
  },
  methods: {
    startAuraEffects() {
      this.auraInterval = setInterval(() => {
        this.generateAuraParticle();
      }, 2000);
    },
    stopAuraEffects() {
      if (this.auraInterval) {
        clearInterval(this.auraInterval);
        this.auraInterval = null;
      }
    },
    generateAuraParticle() {
      const auraTypes = ['sparkle', 'wave', 'pulse', 'glow'];
      const newAura = {
        type: auraTypes[Math.floor(Math.random() * auraTypes.length)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 3 + Math.random() * 4
      };

      this.activeAuras.push(newAura);

      // Remove old auras
      setTimeout(() => {
        this.activeAuras.shift();
      }, newAura.duration * 1000);
    },
    generateInsights() {
      const insights = [
        { icon: '🎯', text: 'Your focus is sharpening beautifully' },
        { icon: '🌟', text: 'Growth patterns emerging strongly' },
        { icon: '💫', text: 'Emotional intelligence peaking' },
        { icon: '🔮', text: 'Intuition guiding your path' },
        { icon: '🌙', text: 'Inner wisdom speaking clearly' }
      ];

      this.currentInsights = insights.slice(0, 3);
    },
    startDynamicUpdates() {
      this.insightInterval = setInterval(() => {
        this.updateMetrics();
        this.generateInsights();
      }, 10000);
    },
    stopDynamicUpdates() {
      if (this.insightInterval) {
        clearInterval(this.insightInterval);
        this.insightInterval = null;
      }
    },
    updateMetrics() {
      this.resonanceLevel = 70 + Math.random() * 25;
      this.harmonyLevel = 75 + Math.random() * 20;
    },
    logAnalytics(event, data) {
      this.analytics.push({ event, data, timestamp: Date.now() });
      this.$emit('analytics', { event, data });
    }
  }
};
</script>
<style scoped>
.persona-visualization {
  position: relative;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9));
  border-radius: 20px;
  border: 1px solid rgba(99, 102, 241, 0.3);
  backdrop-filter: blur(20px);
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(99, 102, 241, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.persona-visualization::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--sallie-primary), transparent);
  opacity: 0.8;
}

.persona-core {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.persona-avatar {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar-glow {
  position: absolute;
  top: -20px;
  left: -20px;
  right: -20px;
  bottom: -20px;
  border-radius: 50%;
  opacity: 0.6;
  animation: glowPulse 3s ease-in-out infinite;
}

.avatar-core {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.9), rgba(139, 92, 246, 0.8));
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 10px 30px rgba(99, 102, 241, 0.4),
    inset 0 2px 10px rgba(255, 255, 255, 0.2);
  z-index: 2;
}

.persona-symbol {
  font-size: 3rem;
  animation: symbolFloat 4s ease-in-out infinite;
}

.emotion-indicator {
  position: absolute;
  bottom: -5px;
  right: -5px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.emotion-pulse {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.6;
  animation: emotionPulse 2s ease-in-out infinite;
}

.persona-info {
  flex: 1;
}

.persona-name {
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #f8fafc, #cbd5e1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
}

.emotion-display {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.emotion-label {
  color: rgba(203, 213, 225, 0.8);
  font-size: 0.875rem;
  font-weight: 500;
}

.emotion-value {
  font-weight: 600;
  font-size: 1rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  text-transform: capitalize;
  transition: all 0.3s ease;
}

.emotion-value.happy { background: rgba(251, 191, 36, 0.2); color: #fbbf24; }
.emotion-value.sad { background: rgba(96, 165, 250, 0.2); color: #60a5fa; }
.emotion-value.angry { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
.emotion-value.calm { background: rgba(52, 211, 153, 0.2); color: #34d399; }
.emotion-value.anxious { background: rgba(244, 114, 182, 0.2); color: #f472b6; }
.emotion-value.excited { background: rgba(163, 230, 53, 0.2); color: #a3e635; }
.emotion-value.neutral { background: rgba(209, 213, 219, 0.2); color: #d1d5db; }

.persona-metrics {
  display: flex;
  gap: 2rem;
}

.metric {
  flex: 1;
}

.metric-label {
  display: block;
  color: rgba(203, 213, 225, 0.8);
  font-size: 0.75rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.metric-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.metric-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--sallie-primary), var(--sallie-accent));
  border-radius: 3px;
  transition: width 1s ease-out;
  position: relative;
}

.metric-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: metricShimmer 2s ease-in-out infinite;
}

.persona-effects {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.emotional-auras {
  position: relative;
  width: 100%;
  height: 100%;
}

.aura-particle {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  opacity: 0;
  animation: auraFade 1s ease-out forwards;
}

.aura-particle.sparkle {
  background: radial-gradient(circle, #fbbf24, #f59e0b);
  box-shadow: 0 0 10px #fbbf24;
}

.aura-particle.wave {
  background: radial-gradient(circle, #60a5fa, #3b82f6);
  box-shadow: 0 0 15px #60a5fa;
  animation: waveFloat 4s ease-in-out infinite;
}

.aura-particle.pulse {
  background: radial-gradient(circle, #a3e635, #84cc16);
  box-shadow: 0 0 12px #a3e635;
}

.aura-particle.glow {
  background: radial-gradient(circle, #f472b6, #ec4899);
  box-shadow: 0 0 20px #f472b6;
  animation: glowDrift 6s ease-in-out infinite;
}

.persona-insights {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.insight {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.insight:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.insight-icon {
  font-size: 1.25rem;
  animation: insightGlow 3s ease-in-out infinite;
}

.insight-text {
  color: rgba(203, 213, 225, 0.9);
  font-size: 0.875rem;
  font-weight: 500;
}

.error {
  position: absolute;
  bottom: 1rem;
  left: 2rem;
  right: 2rem;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

/* Animations */
@keyframes glowPulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

@keyframes symbolFloat {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  25% { transform: translateY(-5px) rotate(1deg); }
  75% { transform: translateY(5px) rotate(-1deg); }
}

@keyframes emotionPulse {
  0% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.2); opacity: 0.8; }
  100% { transform: scale(1); opacity: 0.6; }
}

@keyframes metricShimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes auraFade {
  0% { opacity: 0; transform: scale(0); }
  50% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0); }
}

@keyframes waveFloat {
  0%, 100% { transform: translateY(0px) translateX(0px); }
  25% { transform: translateY(-10px) translateX(5px); }
  50% { transform: translateY(-5px) translateX(-5px); }
  75% { transform: translateY(-15px) translateX(3px); }
}

@keyframes glowDrift {
  0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
  33% { transform: translateY(-20px) translateX(10px) rotate(120deg); }
  66% { transform: translateY(10px) translateX(-10px) rotate(240deg); }
}

@keyframes insightGlow {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.3) hue-rotate(15deg); }
}

/* Theme variations */
.persona-visualization.light {
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.95), rgba(203, 213, 225, 0.9));
  border-color: rgba(99, 102, 241, 0.2);
}

.persona-visualization.light .persona-name {
  background: linear-gradient(135deg, #1e293b, #334155);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Emotion-specific styling */
.persona-visualization.happy {
  border-color: rgba(251, 191, 36, 0.4);
  box-shadow:
    0 25px 50px -12px rgba(251, 191, 36, 0.2),
    0 0 0 1px rgba(251, 191, 36, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.persona-visualization.sad {
  border-color: rgba(96, 165, 250, 0.4);
  box-shadow:
    0 25px 50px -12px rgba(96, 165, 250, 0.2),
    0 0 0 1px rgba(96, 165, 250, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.persona-visualization.angry {
  border-color: rgba(239, 68, 68, 0.4);
  box-shadow:
    0 25px 50px -12px rgba(239, 68, 68, 0.2),
    0 0 0 1px rgba(239, 68, 68, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.persona-visualization.calm {
  border-color: rgba(52, 211, 153, 0.4);
  box-shadow:
    0 25px 50px -12px rgba(52, 211, 153, 0.2),
    0 0 0 1px rgba(52, 211, 153, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.persona-visualization.anxious {
  border-color: rgba(244, 114, 182, 0.4);
  box-shadow:
    0 25px 50px -12px rgba(244, 114, 182, 0.2),
    0 0 0 1px rgba(244, 114, 182, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.persona-visualization.excited {
  border-color: rgba(163, 230, 53, 0.4);
  box-shadow:
    0 25px 50px -12px rgba(163, 230, 53, 0.2),
    0 0 0 1px rgba(163, 230, 53, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.persona-visualization.neutral {
  border-color: rgba(99, 102, 241, 0.4);
  box-shadow:
    0 25px 50px -12px rgba(99, 102, 241, 0.2),
    0 0 0 1px rgba(99, 102, 241, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* Responsive design */
@media (max-width: 768px) {
  .persona-core {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }

  .persona-insights {
    flex-direction: column;
    gap: 0.75rem;
  }

  .persona-metrics {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>

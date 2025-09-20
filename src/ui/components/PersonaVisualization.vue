<template>
  <div class="persona-visualization" :class="theme" aria-label="Persona Visualization" tabindex="0">
    <h2>Persona Visualization</h2>
    <div class="persona-state">
      <span>Persona: {{ persona }}</span>
      <span>Emotion: {{ emotion }}</span>
    </div>
    <svg width="120" height="40" aria-label="Emotion Visualization">
      <circle :cx="40" cy="20" r="16" :fill="colorForEmotion(emotion)" />
      <text x="40" y="25" text-anchor="middle" fill="#fff">{{ emotion }}</text>
    </svg>
    <p v-if="error" class="error" aria-live="assertive">{{ error }}</p>
  </div>
</template>
<script>
export default {
  name: 'PersonaVisualization',
  props: {
    persona: { type: String, required: true },
    emotion: { type: String, required: true },
    theme: { type: String, default: 'light' }
  },
  data() {
    return {
      error: '',
      analytics: []
    };
  },
  methods: {
    colorForEmotion(emotion) {
      const map = { happy: '#facc15', sad: '#60a5fa', angry: '#ef4444', calm: '#34d399', anxious: '#f472b6', excited: '#a3e635', neutral: '#d1d5db' };
      return map[emotion] || '#6366f1';
    },
    logAnalytics(event, data) {
      this.analytics.push({ event, data, timestamp: Date.now() });
    }
  }
};
</script>
<style>
.persona-visualization { padding: 12px; background: #e0f2fe; border-radius: 8px; margin-bottom: 12px; }
.persona-state { display: flex; gap: 16px; margin-bottom: 8px; }
</style>

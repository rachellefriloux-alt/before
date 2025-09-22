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


/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\ui\components\PersonaVisualization.vue) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\PersonaVisualization.vue) */
/* --- dest (C:\Users\chell\Desktop\newsal\ui\components\PersonaVisualization.vue) --- */
<!-- Merged master for logical file: ui\components\PersonaVisualization
Sources:
 - C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\PersonaVisualization.vue (hash:A5CFEF3F2465F7255C6F18F982F9D6EE38E4CC23A625550D97CFA07DA60DAB78)
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\PersonaVisualization.vue (hash:8A300BE457785779CDAE801902FFB070CB72FB60A07C14AD6D8D5C9E1C811DE7)
 -->

<!-- ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\PersonaVisualization.vue | ext: .vue | sha: A5CFEF3F2465F7255C6F18F982F9D6EE38E4CC23A625550D97CFA07DA60DAB78 ---- -->
[BINARY FILE - original copied to merged_sources: ui\components\PersonaVisualization.vue]
<!-- ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\PersonaVisualization.vue | ext: .vue | sha: 8A300BE457785779CDAE801902FFB070CB72FB60A07C14AD6D8D5C9E1C811DE7 ---- -->
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\PersonaVisualization.vue --- */
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

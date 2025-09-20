<template>
  <div class="animated-avatar">
    <svg width="60" height="60">
      <circle cx="30" cy="30" r="28" :fill="colorForEmotion(emotion)" />
      <ellipse cx="22" cy="28" rx="4" ry="6" fill="#fff" />
      <ellipse cx="38" cy="28" rx="4" ry="6" fill="#fff" />
      <path :d="mouthPath(emotion)" stroke="#fff" stroke-width="2" fill="none" />
    </svg>
    <div class="emotion-label">{{ emotion }}</div>
  </div>
</template>
<script>
export default {
  name: 'AnimatedAvatar',
  props: {
    emotion: {
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
    colorForEmotion(emotion) {
      const map = { happy: '#facc15', sad: '#60a5fa', angry: '#ef4444', calm: '#34d399', anxious: '#f472b6', excited: '#a3e635', neutral: '#d1d5db' };
      return map[emotion] || '#6366f1';
    },
    mouthPath(emotion) {
      switch (emotion) {
        case 'happy': return 'M18 40 Q30 50 42 40';
        case 'sad': return 'M18 44 Q30 34 42 44';
        case 'angry': return 'M18 38 Q30 30 42 38';
        case 'calm': return 'M18 40 Q30 40 42 40';
        default: return 'M18 40 Q30 40 42 40';
      }
    },
    logAnalytics(event, data) {
      this.analytics.push({ event, data, timestamp: Date.now() });
    }
  }
};
</script>
<style>
.animated-avatar { display: flex; flex-direction: column; align-items: center; margin-bottom: 12px; }
.emotion-label { margin-top: 4px; font-weight: bold; }
</style>

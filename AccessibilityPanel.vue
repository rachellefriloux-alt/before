<template>
  <div class="accessibility-panel">
    <h2>Accessibility Options</h2>
    <label><input type="checkbox" v-model="highContrast" @change="toggleHighContrast"> High Contrast</label>
    <label><input type="checkbox" v-model="reducedMotion" @change="toggleReducedMotion"> Reduced Motion</label>
    <label><input type="checkbox" v-model="screenReader" @change="toggleScreenReader"> Screen Reader Support</label>
    <div class="config-switcher">
      <h3>Firebase Config</h3>
      <button @click="switchConfig('local')" :disabled="currentFlavor==='local'">Use Local</button>
      <button @click="switchConfig('prod')" :disabled="currentFlavor==='prod'">Use Prod</button>
      <span>Current: {{ currentFlavor }}</span>
    </div>
  </div>
</template>
<script>
import { getCurrentFlavor, switchFlavor } from '../../src/firebaseConfigManager.js';
export default {
  name: 'AccessibilityPanel',
  data() {
    return {
      highContrast: false,
      reducedMotion: false,
      screenReader: false,
      currentFlavor: getCurrentFlavor()
    };
  },
  methods: {
    toggleHighContrast() {
      document.body.classList.toggle('high-contrast', this.highContrast);
    },
    toggleReducedMotion() {
      document.body.classList.toggle('reduced-motion', this.reducedMotion);
    },
    toggleScreenReader() {
      alert('Screen reader support enabled!');
    },
    switchConfig(flavor) {
      switchFlavor(flavor);
      this.currentFlavor = getCurrentFlavor();
      this.$emit('firebaseConfigChanged', flavor);
    }
  }
};
</script>
<style>
.accessibility-panel { padding: 12px; background: #f3f3f3; border-radius: 8px; margin-bottom: 12px; }
.high-contrast { filter: contrast(1.5) !important; }
.reduced-motion * { transition: none !important; animation: none !important; }
.config-switcher { margin-top: 16px; background: #e0e7ff; padding: 8px; border-radius: 6px; }
.config-switcher button { margin-right: 8px; }
</style>

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


/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\ui\components\AccessibilityPanel.vue) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\AccessibilityPanel.vue) */
/* --- dest (C:\Users\chell\Desktop\newsal\ui\components\AccessibilityPanel.vue) --- */
<!-- Merged master for logical file: ui\components\AccessibilityPanel
Sources:
 - C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\AccessibilityPanel.vue (hash:DD0F0F7E1CA449941B94D077664802CF8588A22B384E830CF99EE7524DD62C83)
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\AccessibilityPanel.vue (hash:998AE67830D62E890F3CA84EAB47C799E37ECE5C5111F39A499F4FC999E25220)
 -->

<!-- ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\AccessibilityPanel.vue | ext: .vue | sha: DD0F0F7E1CA449941B94D077664802CF8588A22B384E830CF99EE7524DD62C83 ---- -->
[BINARY FILE - original copied to merged_sources: ui\components\AccessibilityPanel.vue]
<!-- ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\AccessibilityPanel.vue | ext: .vue | sha: 998AE67830D62E890F3CA84EAB47C799E37ECE5C5111F39A499F4FC999E25220 ---- -->
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\AccessibilityPanel.vue --- */
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
    toggleScreenReader() {
      alert('Screen reader support enabled!');
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

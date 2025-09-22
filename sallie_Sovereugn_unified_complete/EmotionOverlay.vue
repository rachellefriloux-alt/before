<!-- Migrated and adapted from sallie_1.00/ui/components/EmotionOverlay.vue -->
<template>
  <div class="emotion-overlay" :style="{ background: overlayColor }">
    <slot></slot>
  </div>
</template>
<script>
export default {
  name: 'EmotionOverlay',
  props: {
    overlayColor: {
      type: String,
      default: 'rgba(99,102,241,0.2)'
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
.emotion-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  pointer-events: none;
  z-index: 10;
  border-radius: var(--border-radius-lg, 12px);
}
</style>


<!-- Migrated and adapted from sallie_1.00/ui/components/EmotionOverlay.vue -->
<template>
  <div class="emotion-overlay" :style="{ background: overlayColor }">
    <slot></slot>
  </div>
</template>
<script>
export default {
  name: 'EmotionOverlay',
  props: {
    overlayColor: {
      type: String,
      default: 'rgba(99,102,241,0.2)'
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
.emotion-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  pointer-events: none;
  z-index: 10;
  border-radius: var(--border-radius-lg, 12px);
}
</style>


<template>
  <div v-if="show" class="emotion-overlay">
    <h3>Current Emotional State: {{ emotion }}</h3>
    <p>{{ message }}</p>
  </div>
</template>

<script>
export default {
  name: 'EmotionOverlay',
  props: {
    emotion: {
      type: String,
      default: 'calm'
    },
    message: {
      type: String,
      default: 'All clear.'
    },
    show: {
      type: Boolean,
      default: true
    }
  }
};
</script>

<style scoped>
.emotion-overlay {
  position: fixed;
  top: 24px;
  right: 24px;
  background: #e0e7ff;
  padding: 16px 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  z-index: 1000;
}
</style>


<template>
  <div v-if="show" class="emotion-overlay">
    <h3>Current Emotional State: {{ emotion }}</h3>
    <p>{{ message }}</p>
  </div>
</template>

<script>
export default {
  name: 'EmotionOverlay',
  props: {
    emotion: {
      type: String,
      default: 'calm'
    },
    message: {
      type: String,
      default: 'All clear.'
    },
    show: {
      type: Boolean,
      default: true
    }
  }
};
</script>

<style scoped>
.emotion-overlay {
  position: fixed;
  top: 24px;
  right: 24px;
  background: #e0e7ff;
  padding: 16px 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  z-index: 1000;
}
</style>


/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\ui\components\EmotionOverlay.vue) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\EmotionOverlay.vue) */
/* --- dest (C:\Users\chell\Desktop\newsal\ui\components\EmotionOverlay.vue) --- */
<!-- Merged master for logical file: ui\components\EmotionOverlay
Sources:
 - C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\EmotionOverlay.vue (hash:78BE75C4ECE9A99AB42A3AD748470D1DC127EA91CB21ECD4E5EF8481ABD0AB17)
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\EmotionOverlay.vue (hash:2C9E0C8E005E8B567E689EBF9017A0A11309E81707274BEDFA043FF1CD478819)
 -->

<!-- ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\EmotionOverlay.vue | ext: .vue | sha: 78BE75C4ECE9A99AB42A3AD748470D1DC127EA91CB21ECD4E5EF8481ABD0AB17 ---- -->
[BINARY FILE - original copied to merged_sources: ui\components\EmotionOverlay.vue]
<!-- ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\EmotionOverlay.vue | ext: .vue | sha: 2C9E0C8E005E8B567E689EBF9017A0A11309E81707274BEDFA043FF1CD478819 ---- -->
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\EmotionOverlay.vue --- */
<!-- Migrated and adapted from sallie_1.00/ui/components/EmotionOverlay.vue -->
<template>
  <div class="emotion-overlay" :style="{ background: overlayColor }">
    <slot></slot>
  </div>
</template>
<script>
export default {
  name: 'EmotionOverlay',
  props: {
    overlayColor: {
      type: String,
      default: 'rgba(99,102,241,0.2)'
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
.emotion-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  pointer-events: none;
  z-index: 10;
  border-radius: var(--border-radius-lg, 12px);
</style>

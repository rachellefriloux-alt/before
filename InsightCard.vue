<!-- Migrated and adapted from sallie_1.00/ui/components/InsightCard.vue -->
<template>
  <div class="insight-card">
    <h4>{{ title }}</h4>
    <p>{{ insight }}</p>
  </div>
</template>
<script>
export default {
  name: 'InsightCard',
  props: {
    title: {
      type: String,
      required: true
    },
    insight: {
      type: String,
      required: true
    },
    details: {
      type: String,
      default: ''
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
.insight-card {
  background: var(--background-tertiary, #334155);
  border-radius: var(--border-radius, 8px);
  box-shadow: var(--shadow-sm, 0 1px 2px 0 rgb(0 0 0 / 0.05));
  padding: 1em;
  margin: 0.5em 0;
  color: var(--text-primary, #f8fafc);
}
</style>

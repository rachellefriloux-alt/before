<template>
  <div class="parental-control">
    <h3>Parental Controls</h3>
    <label>
      Time Limit (minutes):
      <input type="number" v-model="timeLimit" />
    </label>
    <button @click="applyLimit">Apply</button>
    <label>
      Content Filter:
      <input type="checkbox" v-model="contentFilter" /> Enable
    </label>
    <div v-if="status">{{ status }}</div>
  </div>
</template>
<script>
export default {
  data() {
    return { timeLimit: 60, contentFilter: true, status: '' };
  },
  mounted() {
    // Load settings from localStorage
    const raw = localStorage.getItem('sallie:parental:settings');
    if (raw) {
      try {
        const settings = JSON.parse(raw);
        this.timeLimit = settings.timeLimit;
        this.contentFilter = settings.contentFilter;
      } catch {}
    }
  },
  methods: {
    applyLimit() {
      // Save settings to localStorage
      localStorage.setItem('sallie:parental:settings', JSON.stringify({ timeLimit: this.timeLimit, contentFilter: this.contentFilter }));
      this.status = `Time limit set to ${this.timeLimit} minutes. Content filter ${this.contentFilter ? 'enabled' : 'disabled'}.`;
    }
  }
}
</script>
<style>
.parental-control { margin: 12px 0; }
</style>

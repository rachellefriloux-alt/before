<template>
  <div class="theme-customizer-panel">
    <h3>Theme & UI Customization</h3>
    <label>
      Theme Color:
      <input type="color" v-model="themeColor" />
    </label>
    <button @click="applyTheme">Apply</button>
    <div v-if="status">{{ status }}</div>
  </div>
</template>
<script>
export default {
  data() {
    return { themeColor: '#6366f1', status: '' };
  },
  mounted() {
    const raw = localStorage.getItem('sallie:themeColor');
    if (raw) {
      this.themeColor = raw;
      document.body.style.setProperty('--theme-color', this.themeColor);
    }
  },
  methods: {
    applyTheme() {
      document.body.style.setProperty('--theme-color', this.themeColor);
      localStorage.setItem('sallie:themeColor', this.themeColor);
      this.status = `Theme color applied: ${this.themeColor}`;
    }
  }
}
</script>
<style>
.theme-customizer-panel { margin: 12px 0; }
</style>

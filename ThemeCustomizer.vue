<template>
  <div class="theme-customizer">
    <h2>Theme Customizer</h2>
    <input type="color" v-model="accent" @input="updateTheme" /> Accent Color
    <input type="range" min="0" max="100" v-model="brightness" @input="updateTheme" /> Brightness
  </div>
</template>
<script>
export default {
  name: 'ThemeCustomizer',
  data() {
    return {
      accent: '#6366f1',
      brightness: 100
    };
  },
  methods: {
    updateTheme() {
      document.body.style.setProperty('--accent', this.accent);
      document.body.style.filter = `brightness(${this.brightness}%)`;
    }
  }
};
</script>
<style>
.theme-customizer { padding: 12px; background: #e0e7ff; border-radius: 8px; margin-bottom: 12px; }
</style>

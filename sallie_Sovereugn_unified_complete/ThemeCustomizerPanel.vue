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


/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\ui\components\themes\ThemeCustomizerPanel.vue) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\themes\ThemeCustomizerPanel.vue) */
/* --- dest (C:\Users\chell\Desktop\newsal\ui\components\themes\ThemeCustomizerPanel.vue) --- */
<!-- Merged master for logical file: ui\components\themes\ThemeCustomizerPanel
Sources:
 - C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\themes\ThemeCustomizerPanel.vue (hash:94964D0612790E082BB7C28724E8A1D4F6336DB1D0546F23B8A8B72055E1088D)
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\themes\ThemeCustomizerPanel.vue (hash:30ADA42A7EBE0DA59404857779BA87EC471019AB4C6B80581D2D140A657C5A67)
 -->

<!-- ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\themes\ThemeCustomizerPanel.vue | ext: .vue | sha: 94964D0612790E082BB7C28724E8A1D4F6336DB1D0546F23B8A8B72055E1088D ---- -->
[BINARY FILE - original copied to merged_sources: ui\components\themes\ThemeCustomizerPanel.vue]
<!-- ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\themes\ThemeCustomizerPanel.vue | ext: .vue | sha: 30ADA42A7EBE0DA59404857779BA87EC471019AB4C6B80581D2D140A657C5A67 ---- -->
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\themes\ThemeCustomizerPanel.vue --- */
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
  methods: {
    applyTheme() {
      localStorage.setItem('sallie:themeColor', this.themeColor);
      this.status = `Theme color applied: ${this.themeColor}`;
  }
}
</script>
<style>
.theme-customizer-panel { margin: 12px 0; }
</style>

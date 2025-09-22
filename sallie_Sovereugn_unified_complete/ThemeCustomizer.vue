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


/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\ui\components\ThemeCustomizer.vue) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\ThemeCustomizer.vue) */
/* --- dest (C:\Users\chell\Desktop\newsal\ui\components\ThemeCustomizer.vue) --- */
<!-- Merged master for logical file: ui\components\ThemeCustomizer
Sources:
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\ThemeCustomizer.vue (hash:24AEB2664FAF3A9497CCBFA73C400DB195FFD5EBC87A09B2248EBB9DE36670D5)
 - C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\ThemeCustomizer.vue (hash:A556FD57E5B7EA187C9FEA68E07AB4092C40B68E82EB66BC14AF04CD35A396E3)
 -->

<!-- ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\ThemeCustomizer.vue | ext: .vue | sha: 24AEB2664FAF3A9497CCBFA73C400DB195FFD5EBC87A09B2248EBB9DE36670D5 ---- -->
[BINARY FILE - original copied to merged_sources: ui\components\ThemeCustomizer.vue]
<!-- ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\ThemeCustomizer.vue | ext: .vue | sha: A556FD57E5B7EA187C9FEA68E07AB4092C40B68E82EB66BC14AF04CD35A396E3 ---- -->
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\ThemeCustomizer.vue --- */
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

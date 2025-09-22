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


/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\ui\components\parental\ParentalControl.vue) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\parental\ParentalControl.vue) */
/* --- dest (C:\Users\chell\Desktop\newsal\ui\components\parental\ParentalControl.vue) --- */
<!-- Merged master for logical file: ui\components\parental\ParentalControl
Sources:
 - C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\parental\ParentalControl.vue (hash:DB1970FD75BC8A444B23E711E18AF718EBE81D6A9E1486F1B80F12D2D2847318)
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\parental\ParentalControl.vue (hash:5F88B3EB581478546CB3A595E2B2316A92B2573C8D865C55F01E295A7B700399)
 -->

<!-- ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\parental\ParentalControl.vue | ext: .vue | sha: DB1970FD75BC8A444B23E711E18AF718EBE81D6A9E1486F1B80F12D2D2847318 ---- -->
[BINARY FILE - original copied to merged_sources: ui\components\parental\ParentalControl.vue]
<!-- ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\parental\ParentalControl.vue | ext: .vue | sha: 5F88B3EB581478546CB3A595E2B2316A92B2573C8D865C55F01E295A7B700399 ---- -->
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\parental\ParentalControl.vue --- */
<template>
  <div class="parental-control">
    <h3>Parental Controls</h3>
    <label>
      Time Limit (minutes):
      <input type="number" v-model="timeLimit" />
    </label>
    <button @click="applyLimit">Apply</button>
      Content Filter:
      <input type="checkbox" v-model="contentFilter" /> Enable
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
  methods: {
    applyLimit() {
      // Save settings to localStorage
      localStorage.setItem('sallie:parental:settings', JSON.stringify({ timeLimit: this.timeLimit, contentFilter: this.contentFilter }));
      this.status = `Time limit set to ${this.timeLimit} minutes. Content filter ${this.contentFilter ? 'enabled' : 'disabled'}.`;
  }
}
</script>
<style>
.parental-control { margin: 12px 0; }
</style>

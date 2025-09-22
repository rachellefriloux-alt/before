<template>
  <div class="personal-analytics">
    <h3>Personal Analytics</h3>
    <button @click="refreshAnalytics">Refresh</button>
    <div v-if="loading">Loading analytics...</div>
    <ul v-else>
      <li v-for="metric in metrics" :key="metric.id">
        <strong>{{ metric.name }}:</strong> {{ metric.value }}
      </li>
    </ul>
    <div v-if="metrics.length === 0 && !loading">No analytics data found.</div>
  </div>
</template>
<script>
import { getDatabase, ref, get } from "firebase/database";
export default {
  data() {
    return {
      metrics: [],
      loading: false
    };
  },
  mounted() {
    this.refreshAnalytics();
  },
  methods: {
    async refreshAnalytics() {
      this.loading = true;
      // Fetch analytics from localStorage
      let localMetrics = [];
      try {
        const raw = localStorage.getItem('sallie:personalMetrics');
        if (raw) {
          localMetrics = JSON.parse(raw);
        }
      } catch {}
      // Fetch analytics from Firebase (if available)
      let firebaseMetrics = [];
      try {
        const db = getDatabase();
        const snapshot = await get(ref(db, 'users/you/analytics'));
        if (snapshot.exists()) {
          firebaseMetrics = Object.values(snapshot.val());
        }
      } catch {}
      // Merge and deduplicate metrics
      const allMetrics = [...localMetrics, ...firebaseMetrics];
      const deduped = [];
      const seen = new Set();
      for (const m of allMetrics) {
        if (!seen.has(m.id)) {
          deduped.push(m);
          seen.add(m.id);
        }
      }
      this.metrics = deduped;
      this.loading = false;
    }
  }
}
</script>
<style>
.personal-analytics { margin: 12px 0; }
</style>


<template>
  <div class="personal-analytics">
    <h3>Personal Analytics</h3>
    <button @click="refreshAnalytics">Refresh</button>
    <div v-if="loading">Loading analytics...</div>
    <ul v-else>
      <li v-for="metric in metrics" :key="metric.id">
        <strong>{{ metric.name }}:</strong> {{ metric.value }}
      </li>
    </ul>
    <div v-if="metrics.length === 0 && !loading">No analytics data found.</div>
  </div>
</template>
<script>
import { getDatabase, ref, get } from "firebase/database";
export default {
  data() {
    return {
      metrics: [],
      loading: false
    };
  },
  mounted() {
    this.refreshAnalytics();
  },
  methods: {
    async refreshAnalytics() {
      this.loading = true;
      // Fetch analytics from localStorage
      let localMetrics = [];
      try {
        const raw = localStorage.getItem('sallie:personalMetrics');
        if (raw) {
          localMetrics = JSON.parse(raw);
        }
      } catch {}
      // Fetch analytics from Firebase (if available)
      let firebaseMetrics = [];
      try {
        const db = getDatabase();
        const snapshot = await get(ref(db, 'users/you/analytics'));
        if (snapshot.exists()) {
          firebaseMetrics = Object.values(snapshot.val());
        }
      } catch {}
      // Merge and deduplicate metrics
      const allMetrics = [...localMetrics, ...firebaseMetrics];
      const deduped = [];
      const seen = new Set();
      for (const m of allMetrics) {
        if (!seen.has(m.id)) {
          deduped.push(m);
          seen.add(m.id);
        }
      }
      this.metrics = deduped;
      this.loading = false;
    }
  }
}
</script>
<style>
.personal-analytics { margin: 12px 0; }
</style>


/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\ui\components\analytics\PersonalAnalytics.vue) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\analytics\PersonalAnalytics.vue) */
/* --- dest (C:\Users\chell\Desktop\newsal\ui\components\analytics\PersonalAnalytics.vue) --- */
<!-- Merged master for logical file: ui\components\analytics\PersonalAnalytics
Sources:
 - C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\analytics\PersonalAnalytics.vue (hash:17472875F70048B00EF88731D1B777ED9E15964ABEE88CE6C65B31FE3EDC6DD7)
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\analytics\PersonalAnalytics.vue (hash:4FF7675967457D67C9821E8D462A3CEE553508BB7EE640DF62D02EF442DFA790)
 -->

<!-- ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\analytics\PersonalAnalytics.vue | ext: .vue | sha: 17472875F70048B00EF88731D1B777ED9E15964ABEE88CE6C65B31FE3EDC6DD7 ---- -->
[BINARY FILE - original copied to merged_sources: ui\components\analytics\PersonalAnalytics.vue]
<!-- ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\analytics\PersonalAnalytics.vue | ext: .vue | sha: 4FF7675967457D67C9821E8D462A3CEE553508BB7EE640DF62D02EF442DFA790 ---- -->
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\analytics\PersonalAnalytics.vue --- */
<template>
  <div class="personal-analytics">
    <h3>Personal Analytics</h3>
    <button @click="refreshAnalytics">Refresh</button>
    <div v-if="loading">Loading analytics...</div>
    <ul v-else>
      <li v-for="metric in metrics" :key="metric.id">
        <strong>{{ metric.name }}:</strong> {{ metric.value }}
      </li>
    </ul>
    <div v-if="metrics.length === 0 && !loading">No analytics data found.</div>
  </div>
</template>
<script>
import { getDatabase, ref, get } from "firebase/database";
export default {
  data() {
    return {
      metrics: [],
      loading: false
    };
  },
  mounted() {
    this.refreshAnalytics();
  methods: {
    async refreshAnalytics() {
      this.loading = true;
      // Fetch analytics from localStorage
      let localMetrics = [];
      try {
        const raw = localStorage.getItem('sallie:personalMetrics');
        if (raw) {
          localMetrics = JSON.parse(raw);
        }
      } catch {}
      // Fetch analytics from Firebase (if available)
      let firebaseMetrics = [];
        const db = getDatabase();
        const snapshot = await get(ref(db, 'users/you/analytics'));
        if (snapshot.exists()) {
          firebaseMetrics = Object.values(snapshot.val());
      // Merge and deduplicate metrics
      const allMetrics = [...localMetrics, ...firebaseMetrics];
      const deduped = [];
      const seen = new Set();
      for (const m of allMetrics) {
        if (!seen.has(m.id)) {
          deduped.push(m);
          seen.add(m.id);
      }
      this.metrics = deduped;
      this.loading = false;
    }
  }
}
</script>
<style>
.personal-analytics { margin: 12px 0; }
</style>

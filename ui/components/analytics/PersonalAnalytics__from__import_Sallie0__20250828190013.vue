/*
 * Persona: Tough love meets soul care.
 * Module: PersonalAnalytics
 * Intent: Handle functionality for PersonalAnalytics
 * Provenance-ID: bf3bd78a-fbc5-48cb-953f-a2c78e1e1dd5
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

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

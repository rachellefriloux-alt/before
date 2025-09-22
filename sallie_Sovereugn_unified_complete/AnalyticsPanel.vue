<template>
  <div class="analytics-panel">
    <h2>Analytics & Insights</h2>
    <ul>
      <li v-for="entry in activity" :key="entry.id">{{ entry.detail }}</li>
    </ul>
    <button @click="addSample">Add Sample Activity</button>
  </div>
</template>
<script>
import { getFirestore, collection, addDoc, onSnapshot } from 'firebase/firestore';
export default {
  name: 'AnalyticsPanel',
  props: ['firebaseApp'],
  data() {
    return { activity: [] };
  },
  mounted() {
    const db = getFirestore(this.firebaseApp);
    const activityRef = collection(db, 'activity');
    onSnapshot(activityRef, (snapshot) => {
      this.activity = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    });
  },
  methods: {
    async addSample() {
      const db = getFirestore(this.firebaseApp);
      await addDoc(collection(db, 'activity'), { detail: 'Sample activity', timestamp: Date.now() });
    }
  }
};
</script>
<style>
.analytics-panel { padding: 12px; background: #e0e7ff; border-radius: 8px; margin-bottom: 12px; }
</style>


<template>
  <div class="analytics-panel">
    <h2>Analytics & Insights</h2>
    <ul>
      <li v-for="entry in activity" :key="entry.id">{{ entry.detail }}</li>
    </ul>
    <button @click="addSample">Add Sample Activity</button>
  </div>
</template>
<script>
import { getFirestore, collection, addDoc, onSnapshot } from 'firebase/firestore';
export default {
  name: 'AnalyticsPanel',
  props: ['firebaseApp'],
  data() {
    return { activity: [] };
  },
  mounted() {
    const db = getFirestore(this.firebaseApp);
    const activityRef = collection(db, 'activity');
    onSnapshot(activityRef, (snapshot) => {
      this.activity = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    });
  },
  methods: {
    async addSample() {
      const db = getFirestore(this.firebaseApp);
      await addDoc(collection(db, 'activity'), { detail: 'Sample activity', timestamp: Date.now() });
    }
  }
};
</script>
<style>
.analytics-panel { padding: 12px; background: #e0e7ff; border-radius: 8px; margin-bottom: 12px; }
</style>


/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\ui\components\AnalyticsPanel.vue) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\AnalyticsPanel.vue) */
/* --- dest (C:\Users\chell\Desktop\newsal\ui\components\AnalyticsPanel.vue) --- */
<!-- Merged master for logical file: ui\components\AnalyticsPanel
Sources:
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\AnalyticsPanel.vue (hash:593EF52BD2476C3B5F3D69035DCE62E445723D613B0B147360BE639A868571F1)
 - C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\AnalyticsPanel.vue (hash:F9FF5963199B85CA33BFCB9B512F0E8A353E44426CC2C9F47E24CD56A64930B1)
 -->

<!-- ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\AnalyticsPanel.vue | ext: .vue | sha: 593EF52BD2476C3B5F3D69035DCE62E445723D613B0B147360BE639A868571F1 ---- -->
[BINARY FILE - original copied to merged_sources: ui\components\AnalyticsPanel.vue]
<!-- ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\AnalyticsPanel.vue | ext: .vue | sha: F9FF5963199B85CA33BFCB9B512F0E8A353E44426CC2C9F47E24CD56A64930B1 ---- -->
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\AnalyticsPanel.vue --- */
<template>
  <div class="analytics-panel">
    <h2>Analytics & Insights</h2>
    <ul>
      <li v-for="entry in activity" :key="entry.id">{{ entry.detail }}</li>
    </ul>
    <button @click="addSample">Add Sample Activity</button>
  </div>
</template>
<script>
import { getFirestore, collection, addDoc, onSnapshot } from 'firebase/firestore';
export default {
  name: 'AnalyticsPanel',
  props: ['firebaseApp'],
  data() {
    return { activity: [] };
  },
  mounted() {
    const db = getFirestore(this.firebaseApp);
    const activityRef = collection(db, 'activity');
    onSnapshot(activityRef, (snapshot) => {
      this.activity = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    });
  methods: {
    async addSample() {
      const db = getFirestore(this.firebaseApp);
      await addDoc(collection(db, 'activity'), { detail: 'Sample activity', timestamp: Date.now() });
    }
  }
};
</script>
<style>
.analytics-panel { padding: 12px; background: #e0e7ff; border-radius: 8px; margin-bottom: 12px; }
</style>

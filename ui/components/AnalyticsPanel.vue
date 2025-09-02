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

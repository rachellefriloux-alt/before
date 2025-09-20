/*
 * Persona: Tough love meets soul care.
 * Module: MemoryDashboard
 * Intent: Handle functionality for MemoryDashboard
 * Provenance-ID: 709be47d-a56d-4193-ab15-b9a1ea2ba533
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

<template>
  <div class="memory-dashboard" :class="theme" aria-label="Memory Dashboard" tabindex="0">
    <h2>Memory Dashboard</h2>
    <ul>
      <li v-for="item in memoryItems" :key="item.id" tabindex="1" :aria-label="item.key + ': ' + item.value">{{ item.key }}: {{ item.value }}</li>
    </ul>
    <input v-model="newKey" placeholder="Key" aria-label="Memory Key" />
    <input v-model="newValue" placeholder="Value" aria-label="Memory Value" />
    <button @click="addMemory" aria-label="Add Memory" tabindex="2">Add Memory</button>
    <p v-if="error" class="error" aria-live="assertive">{{ error }}</p>
  </div>
</template>
<script>
import { getFirestore, collection, addDoc, onSnapshot } from 'firebase/firestore';
export default {
  name: 'MemoryDashboard',
  props: {
    firebaseApp: { type: Object, required: true },
    theme: { type: String, default: 'light' }
  },
  data() {
    return {
      memoryItems: [],
      newKey: '',
      newValue: '',
      error: '',
      analytics: []
    };
  },
  mounted() {
    const db = getFirestore(this.firebaseApp);
    const memRef = collection(db, 'memory');
    onSnapshot(memRef, (snapshot) => {
      this.memoryItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      this.logAnalytics('memory_snapshot', { count: this.memoryItems.length });
    });
  },
  methods: {
    async addMemory() {
      this.error = '';
      if (!this.newKey || !this.newValue) {
        this.error = 'Key and value required.';
        this.logAnalytics('error', { error: this.error });
        return;
      }
      const db = getFirestore(this.firebaseApp);
      try {
        await addDoc(collection(db, 'memory'), { key: this.newKey, value: this.newValue });
        this.logAnalytics('add_memory', { key: this.newKey });
        this.newKey = '';
        this.newValue = '';
      } catch (e) {
        this.error = e.message;
        this.logAnalytics('error', { error: this.error });
      }
    },
    logAnalytics(event, data) {
      this.analytics.push({ event, data, timestamp: Date.now() });
    }
  }
};
</script>
<style>
.memory-dashboard { padding: 12px; background: #f0fdf4; border-radius: 8px; margin-bottom: 12px; }
</style>

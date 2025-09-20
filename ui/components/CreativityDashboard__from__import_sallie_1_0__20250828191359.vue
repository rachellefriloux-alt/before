/*
 * Persona: Tough love meets soul care.
 * Module: CreativityDashboard
 * Intent: Handle functionality for CreativityDashboard
 * Provenance-ID: 6d097020-06fc-4849-80ad-bbaa346554d9
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

<template>
  <div class="creativity-dashboard" :class="theme" aria-label="Creativity Dashboard" tabindex="0">
    <h2>Creativity Dashboard</h2>
    <ul>
      <li v-for="idea in ideas" :key="idea.id" tabindex="1" :aria-label="idea.idea">{{ idea.idea }}</li>
    </ul>
    <input v-model="newIdea" placeholder="Suggest an idea..." aria-label="Suggest an idea" />
    <button @click="addIdea" aria-label="Add Idea" tabindex="2">Add Idea</button>
    <p v-if="error" class="error" aria-live="assertive">{{ error }}</p>
  </div>
</template>
<script>
import { getFirestore, collection, addDoc, onSnapshot } from 'firebase/firestore';
export default {
  name: 'CreativityDashboard',
  props: {
    firebaseApp: { type: Object, required: true },
    theme: { type: String, default: 'light' }
  },
  data() {
    return {
      ideas: [],
      newIdea: '',
      error: '',
      analytics: []
    };
  },
  mounted() {
    const db = getFirestore(this.firebaseApp);
    const ideasRef = collection(db, 'ideas');
    onSnapshot(ideasRef, (snapshot) => {
      this.ideas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      this.logAnalytics('ideas_snapshot', { count: this.ideas.length });
    });
  },
  methods: {
    async addIdea() {
      this.error = '';
      if (!this.newIdea) {
        this.error = 'Idea required.';
        this.logAnalytics('error', { error: this.error });
        return;
      }
      const db = getFirestore(this.firebaseApp);
      try {
        await addDoc(collection(db, 'ideas'), { idea: this.newIdea, timestamp: Date.now() });
        this.logAnalytics('add_idea', { idea: this.newIdea });
        this.newIdea = '';
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
.creativity-dashboard { padding: 12px; background: #f3e8ff; border-radius: 8px; margin-bottom: 12px; }
</style>

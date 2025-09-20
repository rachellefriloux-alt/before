/*
 * Persona: Tough love meets soul care.
 * Module: EmotionTracker
 * Intent: Handle functionality for EmotionTracker
 * Provenance-ID: 8ee25217-d7f5-41db-b02e-f1b7de40056b
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

<template>
  <div class="emotion-tracker">
    <h3>Mood & Emotion Tracking</h3>
    <input v-model="newMood" placeholder="Log your mood" />
    <button @click="logMood">Log Mood</button>
    <div v-for="entry in moodLog" :key="entry.timestamp">
      {{ entry.date }}: {{ entry.mood }}
    </div>
    <div v-if="moodLog.length === 0">No mood entries yet.</div>
  </div>
</template>
<script>
export default {
  data() {
    return { moodLog: [], newMood: '' };
  },
  mounted() {
    const raw = localStorage.getItem('sallie:moodLog');
    if (raw) {
      try {
        this.moodLog = JSON.parse(raw);
      } catch {}
    }
  },
  methods: {
    logMood() {
      if (!this.newMood.trim()) return;
      const entry = { date: new Date().toLocaleDateString(), mood: this.newMood.trim(), timestamp: Date.now() };
      this.moodLog.push(entry);
      localStorage.setItem('sallie:moodLog', JSON.stringify(this.moodLog));
      this.newMood = '';
    }
  }
}
</script>
<style>
.emotion-tracker { margin: 12px 0; }
</style>

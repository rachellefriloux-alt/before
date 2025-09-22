/*
 * Persona: Tough love meets soul care.
 * Module: NotificationPanel
 * Intent: Handle functionality for NotificationPanel
 * Provenance-ID: 6d73c240-b5b8-40eb-8b15-8d7f57b466ec
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

<template>
  <div class="notification-panel" :class="theme" aria-label="Notification Panel" tabindex="0">
    <h2>Notifications</h2>
    <ul>
      <li v-for="note in notifications" :key="note.id" tabindex="1" :aria-label="note.message">{{ note.message }}</li>
    </ul>
    <button @click="addNotification" aria-label="Add Notification" tabindex="2">Add Notification</button>
    <p v-if="error" class="error" aria-live="assertive">{{ error }}</p>
  </div>
</template>
<script>
import { getFirestore, collection, addDoc, onSnapshot } from 'firebase/firestore';
export default {
  name: 'NotificationPanel',
  props: {
    firebaseApp: { type: Object, required: true },
    theme: { type: String, default: 'light' }
  },
  data() {
    return {
      notifications: [],
      error: '',
      analytics: []
    };
  },
  mounted() {
    const db = getFirestore(this.firebaseApp);
    const notesRef = collection(db, 'notifications');
    onSnapshot(notesRef, (snapshot) => {
      this.notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      this.logAnalytics('notifications_snapshot', { count: this.notifications.length });
    });
  },
  methods: {
    async addNotification() {
      this.error = '';
      const db = getFirestore(this.firebaseApp);
      const id = Date.now();
      try {
        await addDoc(collection(db, 'notifications'), { id, message: `Notification #${id}` });
        this.logAnalytics('add_notification', { id });
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
.notification-panel { padding: 12px; background: #f1f5f9; border-radius: 8px; margin-bottom: 12px; }
</style>

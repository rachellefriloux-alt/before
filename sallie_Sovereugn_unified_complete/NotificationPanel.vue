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


/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\ui\components\NotificationPanel.vue) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\NotificationPanel.vue) */
/* --- dest (C:\Users\chell\Desktop\newsal\ui\components\NotificationPanel.vue) --- */
<!-- Merged master for logical file: ui\components\NotificationPanel
Sources:
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\NotificationPanel.vue (hash:2E8C54D3DC22C2398C58AC396C21A6591248876657F7A3672BCC5F252C228CD1)
 - C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\NotificationPanel.vue (hash:B1E4785D994350A278FF5035AAB61E9A53E40E746FDF97BBD1AAD80A7E3AC720)
 -->

<!-- ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\NotificationPanel.vue | ext: .vue | sha: 2E8C54D3DC22C2398C58AC396C21A6591248876657F7A3672BCC5F252C228CD1 ---- -->
[BINARY FILE - original copied to merged_sources: ui\components\NotificationPanel.vue]
<!-- ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\NotificationPanel.vue | ext: .vue | sha: B1E4785D994350A278FF5035AAB61E9A53E40E746FDF97BBD1AAD80A7E3AC720 ---- -->
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\NotificationPanel.vue --- */
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
  mounted() {
    const db = getFirestore(this.firebaseApp);
    const notesRef = collection(db, 'notifications');
    onSnapshot(notesRef, (snapshot) => {
      this.notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      this.logAnalytics('notifications_snapshot', { count: this.notifications.length });
    });
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

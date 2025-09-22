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


/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\ui\components\MemoryDashboard.vue) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\MemoryDashboard.vue) */
/* --- dest (C:\Users\chell\Desktop\newsal\ui\components\MemoryDashboard.vue) --- */
<!-- Merged master for logical file: ui\components\MemoryDashboard
Sources:
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\MemoryDashboard.vue (hash:0BB743592633ED3397472797A00E7841D305C535869A455177FD078DA17D9008)
 - C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\MemoryDashboard.vue (hash:AC4A2CF25E65195D0F47DC288B34E50E6F39466301D1EB513BE6B202405BB8B9)
 -->

<!-- ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\MemoryDashboard.vue | ext: .vue | sha: 0BB743592633ED3397472797A00E7841D305C535869A455177FD078DA17D9008 ---- -->
[BINARY FILE - original copied to merged_sources: ui\components\MemoryDashboard.vue]
<!-- ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\MemoryDashboard.vue | ext: .vue | sha: AC4A2CF25E65195D0F47DC288B34E50E6F39466301D1EB513BE6B202405BB8B9 ---- -->
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\MemoryDashboard.vue --- */
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
  mounted() {
    const db = getFirestore(this.firebaseApp);
    const memRef = collection(db, 'memory');
    onSnapshot(memRef, (snapshot) => {
      this.memoryItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      this.logAnalytics('memory_snapshot', { count: this.memoryItems.length });
    });
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

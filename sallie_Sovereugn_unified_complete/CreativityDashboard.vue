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


/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\ui\components\CreativityDashboard.vue) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\CreativityDashboard.vue) */
/* --- dest (C:\Users\chell\Desktop\newsal\ui\components\CreativityDashboard.vue) --- */
<!-- Merged master for logical file: ui\components\CreativityDashboard
Sources:
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\CreativityDashboard.vue (hash:13E68BCEA67FAA8A8D90331AAFFA6DF01E4B7385AA3C60D2DEC9F3EF722E2920)
 - C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\CreativityDashboard.vue (hash:32694313C5663521E5517875C39C37AB5E7931AA2FEA2003F401C9560A4D7A6B)
 -->

<!-- ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\CreativityDashboard.vue | ext: .vue | sha: 13E68BCEA67FAA8A8D90331AAFFA6DF01E4B7385AA3C60D2DEC9F3EF722E2920 ---- -->
[BINARY FILE - original copied to merged_sources: ui\components\CreativityDashboard.vue]
<!-- ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\CreativityDashboard.vue | ext: .vue | sha: 32694313C5663521E5517875C39C37AB5E7931AA2FEA2003F401C9560A4D7A6B ---- -->
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\CreativityDashboard.vue --- */
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
  mounted() {
    const db = getFirestore(this.firebaseApp);
    const ideasRef = collection(db, 'ideas');
    onSnapshot(ideasRef, (snapshot) => {
      this.ideas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      this.logAnalytics('ideas_snapshot', { count: this.ideas.length });
    });
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

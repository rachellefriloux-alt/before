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


/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\ui\components\emotion\EmotionTracker.vue) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\emotion\EmotionTracker.vue) */
/* --- dest (C:\Users\chell\Desktop\newsal\ui\components\emotion\EmotionTracker.vue) --- */
<!-- Merged master for logical file: ui\components\emotion\EmotionTracker
Sources:
 - C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\emotion\EmotionTracker.vue (hash:1B5BDA0E65A4F2EF0284F66E53A060C5AF86AA6B6357A374C4E70227581CD536)
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\emotion\EmotionTracker.vue (hash:CB44FE8AB96C1E002B483F6FD99955DC957457D4BD99C18F51BF1E8AC1EFD756)
 -->

<!-- ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\emotion\EmotionTracker.vue | ext: .vue | sha: 1B5BDA0E65A4F2EF0284F66E53A060C5AF86AA6B6357A374C4E70227581CD536 ---- -->
[BINARY FILE - original copied to merged_sources: ui\components\emotion\EmotionTracker.vue]
<!-- ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\emotion\EmotionTracker.vue | ext: .vue | sha: CB44FE8AB96C1E002B483F6FD99955DC957457D4BD99C18F51BF1E8AC1EFD756 ---- -->
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\emotion\EmotionTracker.vue --- */
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
  methods: {
    logMood() {
      if (!this.newMood.trim()) return;
      const entry = { date: new Date().toLocaleDateString(), mood: this.newMood.trim(), timestamp: Date.now() };
      this.moodLog.push(entry);
      localStorage.setItem('sallie:moodLog', JSON.stringify(this.moodLog));
      this.newMood = '';
  }
}
</script>
<style>
.emotion-tracker { margin: 12px 0; }
</style>

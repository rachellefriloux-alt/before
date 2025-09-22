<template>
  <div class="offline-panel">
    <h3>Offline Mode</h3>
    <span v-if="offline">You are offline. Basic features are available.</span>
    <span v-else>Online</span>
    <div>Last status: {{ lastStatus }}</div>
  </div>
</template>
<script>
export default {
  data() {
    return { offline: !navigator.onLine, lastStatus: '' };
  },
  mounted() {
    this.lastStatus = localStorage.getItem('sallie:lastStatus') || (this.offline ? 'offline' : 'online');
    window.addEventListener('online', () => {
      this.offline = false;
      this.lastStatus = 'online';
      localStorage.setItem('sallie:lastStatus', 'online');
    });
    window.addEventListener('offline', () => {
      this.offline = true;
      this.lastStatus = 'offline';
      localStorage.setItem('sallie:lastStatus', 'offline');
    });
  }
}
</script>
<style>
.offline-panel { margin: 12px 0; }
</style>


<template>
  <div class="offline-panel">
    <h3>Offline Mode</h3>
    <span v-if="offline">You are offline. Basic features are available.</span>
    <span v-else>Online</span>
    <div>Last status: {{ lastStatus }}</div>
  </div>
</template>
<script>
export default {
  data() {
    return { offline: !navigator.onLine, lastStatus: '' };
  },
  mounted() {
    this.lastStatus = localStorage.getItem('sallie:lastStatus') || (this.offline ? 'offline' : 'online');
    window.addEventListener('online', () => {
      this.offline = false;
      this.lastStatus = 'online';
      localStorage.setItem('sallie:lastStatus', 'online');
    });
    window.addEventListener('offline', () => {
      this.offline = true;
      this.lastStatus = 'offline';
      localStorage.setItem('sallie:lastStatus', 'offline');
    });
  }
}
</script>
<style>
.offline-panel { margin: 12px 0; }
</style>


/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\ui\components\offline\OfflinePanel.vue) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\offline\OfflinePanel.vue) */
/* --- dest (C:\Users\chell\Desktop\newsal\ui\components\offline\OfflinePanel.vue) --- */
<!-- Merged master for logical file: ui\components\offline\OfflinePanel
Sources:
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\offline\OfflinePanel.vue (hash:7896AC9FDD3B0D0A949373F0F7E84EFE886B0FD6F4829104204D5D3C79CD2B3F)
 - C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\offline\OfflinePanel.vue (hash:22A9753DF3CD63DB0715B8146343B75F026B1EBE177DE4FD7C54410B6EC6110B)
 -->

<!-- ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\offline\OfflinePanel.vue | ext: .vue | sha: 7896AC9FDD3B0D0A949373F0F7E84EFE886B0FD6F4829104204D5D3C79CD2B3F ---- -->
[BINARY FILE - original copied to merged_sources: ui\components\offline\OfflinePanel.vue]
<!-- ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\offline\OfflinePanel.vue | ext: .vue | sha: 22A9753DF3CD63DB0715B8146343B75F026B1EBE177DE4FD7C54410B6EC6110B ---- -->
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\offline\OfflinePanel.vue --- */
<template>
  <div class="offline-panel">
    <h3>Offline Mode</h3>
    <span v-if="offline">You are offline. Basic features are available.</span>
    <span v-else>Online</span>
    <div>Last status: {{ lastStatus }}</div>
  </div>
</template>
<script>
export default {
  data() {
    return { offline: !navigator.onLine, lastStatus: '' };
  },
  mounted() {
    this.lastStatus = localStorage.getItem('sallie:lastStatus') || (this.offline ? 'offline' : 'online');
    window.addEventListener('online', () => {
      this.offline = false;
      this.lastStatus = 'online';
      localStorage.setItem('sallie:lastStatus', 'online');
    });
    window.addEventListener('offline', () => {
      this.offline = true;
      this.lastStatus = 'offline';
      localStorage.setItem('sallie:lastStatus', 'offline');
  }
}
</script>
<style>
.offline-panel { margin: 12px 0; }
</style>

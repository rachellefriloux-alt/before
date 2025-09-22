/*
 * Persona: Tough love meets soul care.
 * Module: OfflinePanel
 * Intent: Handle functionality for OfflinePanel
 * Provenance-ID: 08d0d630-c023-4e73-9b47-d1dcffdd596a
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

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

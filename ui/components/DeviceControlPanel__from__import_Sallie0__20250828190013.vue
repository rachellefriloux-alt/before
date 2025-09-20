/*
 * Persona: Tough love meets soul care.
 * Module: DeviceControlPanel
 * Intent: Handle functionality for DeviceControlPanel
 * Provenance-ID: 2121c15a-b590-406e-b447-fe03247af75b
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

<template>
  <div class="device-control-panel">
    <h2>Device Control Panel</h2>
    <ul>
      <li v-for="device in devices" :key="device.id">
        {{ device.name }} <button @click="toggle(device)">{{ device.on ? 'Turn Off' : 'Turn On' }}</button>
      </li>
    </ul>
  </div>
</template>
<script>
import { getFirestore, collection, updateDoc, doc, onSnapshot } from 'firebase/firestore';
export default {
  name: 'DeviceControlPanel',
  props: {
    firebaseApp: { type: Object, required: true },
    theme: { type: String, default: 'light' }
  },
  data() {
    return {
      devices: [],
      analytics: [],
      error: ''
    };
  },
  mounted() {
    const db = getFirestore(this.firebaseApp);
    const devicesRef = collection(db, 'devices');
    onSnapshot(devicesRef, (snapshot) => {
      this.devices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      this.logAnalytics('devices_update', { count: this.devices.length });
    });
  },
  methods: {
    async toggle(device) {
      try {
        const db = getFirestore(this.firebaseApp);
        const deviceRef = doc(db, 'devices', device.id);
        await updateDoc(deviceRef, { on: !device.on });
        this.logAnalytics('device_toggle', { device, newState: !device.on });
      } catch (e) {
        this.error = 'Device toggle failed.';
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
.device-control-panel { padding: 12px; background: #fef9c3; border-radius: 8px; margin-bottom: 12px; }
</style>

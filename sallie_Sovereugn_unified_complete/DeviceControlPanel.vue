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


/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\ui\components\DeviceControlPanel.vue) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\DeviceControlPanel.vue) */
/* --- dest (C:\Users\chell\Desktop\newsal\ui\components\DeviceControlPanel.vue) --- */
<!-- Merged master for logical file: ui\components\DeviceControlPanel
Sources:
 - C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\DeviceControlPanel.vue (hash:754C71EA477771D86590D6472D3F1612BC57CBDC82B3D803A2CA64400820E89B)
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\DeviceControlPanel.vue (hash:22F5C85BD380BD5F950AE8EA8003602863B0653B10B7DEC241E9E6F5DCB0DA82)
 -->

<!-- ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\DeviceControlPanel.vue | ext: .vue | sha: 754C71EA477771D86590D6472D3F1612BC57CBDC82B3D803A2CA64400820E89B ---- -->
[BINARY FILE - original copied to merged_sources: ui\components\DeviceControlPanel.vue]
<!-- ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\DeviceControlPanel.vue | ext: .vue | sha: 22F5C85BD380BD5F950AE8EA8003602863B0653B10B7DEC241E9E6F5DCB0DA82 ---- -->
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\DeviceControlPanel.vue --- */
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
  mounted() {
    const db = getFirestore(this.firebaseApp);
    const devicesRef = collection(db, 'devices');
    onSnapshot(devicesRef, (snapshot) => {
      this.devices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      this.logAnalytics('devices_update', { count: this.devices.length });
    });
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

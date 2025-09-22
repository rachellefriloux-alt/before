<template>
  <div class="device-manager">
    <h3>Smart Device Control</h3>
    <button @click="discoverDevices">Discover Devices</button>
    <ul>
      <li v-for="device in devices" :key="device.id">
        {{ device.name }}
        <button @click="toggleDevice(device)">{{ device.on ? 'Turn Off' : 'Turn On' }}</button>
      </li>
    </ul>
    <div v-if="devices.length === 0">No devices found.</div>
  </div>
</template>
<script>
export default {
  data() {
    return { devices: [] };
  },
  methods: {
    discoverDevices() {
      // Mock device discovery
      this.devices = [
        { id: 1, name: 'Living Room Light', on: false },
        { id: 2, name: 'Thermostat', on: true },
        { id: 3, name: 'Front Door Lock', on: false }
      ];
    },
    toggleDevice(device) {
      device.on = !device.on;
      this.$forceUpdate();
    }
  }
}
</script>
<style>
.device-manager { margin: 12px 0; }
</style>


<template>
  <div class="device-manager">
    <h3>Smart Device Control</h3>
    <button @click="discoverDevices">Discover Devices</button>
    <ul>
      <li v-for="device in devices" :key="device.id">
        {{ device.name }}
        <button @click="toggleDevice(device)">{{ device.on ? 'Turn Off' : 'Turn On' }}</button>
      </li>
    </ul>
    <div v-if="devices.length === 0">No devices found.</div>
  </div>
</template>
<script>
export default {
  data() {
    return { devices: [] };
  },
  methods: {
    discoverDevices() {
      // Mock device discovery
      this.devices = [
        { id: 1, name: 'Living Room Light', on: false },
        { id: 2, name: 'Thermostat', on: true },
        { id: 3, name: 'Front Door Lock', on: false }
      ];
    },
    toggleDevice(device) {
      device.on = !device.on;
      this.$forceUpdate();
    }
  }
}
</script>
<style>
.device-manager { margin: 12px 0; }
</style>


/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\ui\components\devices\DeviceManager.vue) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\devices\DeviceManager.vue) */
/* --- dest (C:\Users\chell\Desktop\newsal\ui\components\devices\DeviceManager.vue) --- */
<!-- Merged master for logical file: ui\components\devices\DeviceManager
Sources:
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\devices\DeviceManager.vue (hash:79CB2AE038EB839CE97B5643A11AF755A065BD8C3B4BCFA1F9D684B70CC13B36)
 - C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\devices\DeviceManager.vue (hash:62C10AB8845502A85EFCDB1989855DDC722CAA399ADDA0DA075A132BA9CDBBC6)
 -->

<!-- ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\devices\DeviceManager.vue | ext: .vue | sha: 79CB2AE038EB839CE97B5643A11AF755A065BD8C3B4BCFA1F9D684B70CC13B36 ---- -->
[BINARY FILE - original copied to merged_sources: ui\components\devices\DeviceManager.vue]
<!-- ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\devices\DeviceManager.vue | ext: .vue | sha: 62C10AB8845502A85EFCDB1989855DDC722CAA399ADDA0DA075A132BA9CDBBC6 ---- -->
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\devices\DeviceManager.vue --- */
<template>
  <div class="device-manager">
    <h3>Smart Device Control</h3>
    <button @click="discoverDevices">Discover Devices</button>
    <ul>
      <li v-for="device in devices" :key="device.id">
        {{ device.name }}
        <button @click="toggleDevice(device)">{{ device.on ? 'Turn Off' : 'Turn On' }}</button>
      </li>
    </ul>
    <div v-if="devices.length === 0">No devices found.</div>
  </div>
</template>
<script>
export default {
  data() {
    return { devices: [] };
  },
  methods: {
    discoverDevices() {
      // Mock device discovery
      this.devices = [
        { id: 1, name: 'Living Room Light', on: false },
        { id: 2, name: 'Thermostat', on: true },
        { id: 3, name: 'Front Door Lock', on: false }
      ];
    },
    toggleDevice(device) {
      device.on = !device.on;
      this.$forceUpdate();
    }
  }
}
</script>
<style>
.device-manager { margin: 12px 0; }
</style>

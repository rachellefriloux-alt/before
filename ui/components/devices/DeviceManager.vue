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

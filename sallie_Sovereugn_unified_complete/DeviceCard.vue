<!-- Migrated and adapted from sallie_1.00/ui/components/DeviceCard.vue -->
<template>
  <div class="device-card">
    <h3>{{ device.name }}</h3>
    <p>Status: {{ device.status }}</p>
    <button @click="$emit('control', device)">Control</button>
  </div>
</template>
<script>
export default {
  name: 'DeviceCard',
  props: {
    device: {
      type: Object,
      required: true
    },
    theme: {
      type: String,
      default: 'light'
    }
  },
  data() {
    return {
      error: '',
      loading: false,
      analytics: [],
      lastAction: null
    };
  },
  methods: {
    async controlDevice(action) {
      this.loading = true;
      this.error = '';
      try {
        // Simulate device control logic
        await new Promise(resolve => setTimeout(resolve, 500));
        this.lastAction = action;
        this.$emit('control', { device: this.device, action });
        this.logAnalytics('device_control', { device: this.device, action });
      } catch (e) {
        this.error = 'Device control failed.';
        this.logAnalytics('error', { error: this.error });
      }
      this.loading = false;
    },
    logAnalytics(event, data) {
      this.analytics.push({ event, data, timestamp: Date.now() });
    }
  }
}
</script>
<style scoped>
.device-card {
  background: var(--background-secondary, #1e293b);
  border-radius: var(--border-radius, 8px);
  box-shadow: var(--shadow-md, 0 4px 6px -1px rgb(0 0 0 / 0.1));
  padding: 1em;
  margin: 1em 0;
  color: var(--text-primary, #f8fafc);
}
button {
  background: var(--sallie-success, #10b981);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.5em 1em;
  cursor: pointer;
  transition: var(--transition, all 0.2s ease-in-out);
}
button:hover {
  background: var(--sallie-accent, #06b6d4);
}
</style>


<!-- Migrated and adapted from sallie_1.00/ui/components/DeviceCard.vue -->
<template>
  <div class="device-card">
    <h3>{{ device.name }}</h3>
    <p>Status: {{ device.status }}</p>
    <button @click="$emit('control', device)">Control</button>
  </div>
</template>
<script>
export default {
  name: 'DeviceCard',
  props: {
    device: {
      type: Object,
      required: true
    },
    theme: {
      type: String,
      default: 'light'
    }
  },
  data() {
    return {
      error: '',
      loading: false,
      analytics: [],
      lastAction: null
    };
  },
  methods: {
    async controlDevice(action) {
      this.loading = true;
      this.error = '';
      try {
        // Simulate device control logic
        await new Promise(resolve => setTimeout(resolve, 500));
        this.lastAction = action;
        this.$emit('control', { device: this.device, action });
        this.logAnalytics('device_control', { device: this.device, action });
      } catch (e) {
        this.error = 'Device control failed.';
        this.logAnalytics('error', { error: this.error });
      }
      this.loading = false;
    },
    logAnalytics(event, data) {
      this.analytics.push({ event, data, timestamp: Date.now() });
    }
  }
}
</script>
<style scoped>
.device-card {
  background: var(--background-secondary, #1e293b);
  border-radius: var(--border-radius, 8px);
  box-shadow: var(--shadow-md, 0 4px 6px -1px rgb(0 0 0 / 0.1));
  padding: 1em;
  margin: 1em 0;
  color: var(--text-primary, #f8fafc);
}
button {
  background: var(--sallie-success, #10b981);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.5em 1em;
  cursor: pointer;
  transition: var(--transition, all 0.2s ease-in-out);
}
button:hover {
  background: var(--sallie-accent, #06b6d4);
}
</style>


<template>
  <v-card class="device-card">
    <v-card-title class="device-header">
      <div class="device-icon-container" :class="connectionStateClass">
        <v-icon size="32">{{ deviceIcon }}</v-icon>
      </div>
      <div class="device-title">
        <div class="device-name">{{ device.name }}</div>
        <div class="device-type">{{ formatDeviceType(device.type) }}</div>
      </div>
      <v-chip 
        x-small 
        :color="connectionStateColor"
        class="ml-auto"
      >
        {{ connectionStateText }}
      </v-chip>
    </v-card-title>

    <v-divider></v-divider>

    <v-card-text>
      <div v-if="isConnected" class="device-controls">
        <!-- Light Controls -->
        <template v-if="device.type === 'LIGHT'">
          <div class="control-row">
            <span class="control-label">Power</span>
            <v-switch
              v-model="lightState.power"
              color="primary"
              hide-details
              dense
              @change="togglePower"
            ></v-switch>
          </div>
          
          <div v-if="hasCapability('BRIGHTNESS_CONTROL')" class="control-row">
            <span class="control-label">Brightness</span>
            <v-slider
              v-model="lightState.brightness"
              min="0"
              max="100"
              hide-details
              class="mt-0"
              @change="setBrightness"
            ></v-slider>
          </div>
          
          <div v-if="hasCapability('COLOR_CONTROL')" class="control-row">
            <span class="control-label">Color</span>
            <v-btn-toggle
              v-model="lightState.colorPreset"
              mandatory
              dense
              class="color-buttons"
            >
              <v-btn 
                small 
                @click="setColor('warm')"
                class="color-button warm-white"
              ></v-btn>
              <v-btn 
                small 
                @click="setColor('cool')"
                class="color-button cool-white"
              ></v-btn>
              <v-btn 
                small 
                @click="setColor('blue')"
                class="color-button blue"
              ></v-btn>
              <v-btn 
                small 
                @click="setColor('red')"
                class="color-button red"
              ></v-btn>
              <v-btn 
                small 
                @click="setColor('green')"
                class="color-button green"
              ></v-btn>
            </v-btn-toggle>
          </div>
        </template>
        
        <!-- Thermostat Controls -->
        <template v-if="device.type === 'THERMOSTAT'">
          <div class="thermostat-display">
            <div class="current-temp">{{ thermostatState.currentTemp }}°</div>
            <div class="target-temp">Set to {{ thermostatState.targetTemp }}°</div>
          </div>
          
          <div class="control-row temperature-control">
            <v-btn icon @click="adjustTemperature(-1)">
              <v-icon>mdi-minus</v-icon>
            </v-btn>
            <v-slider
              v-model="thermostatState.targetTemp"
              min="60"
              max="85"
              thumb-label
              hide-details
              class="mt-0"
              @change="setTemperature"
            ></v-slider>
            <v-btn icon @click="adjustTemperature(1)">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </div>
          
          <div class="control-row">
            <span class="control-label">Mode</span>
            <v-chip-group
              v-model="thermostatState.modeIndex"
              active-class="primary--text"
              mandatory
              @change="setThermostatMode"
            >
              <v-chip small label outlined>Cool</v-chip>
              <v-chip small label outlined>Heat</v-chip>
              <v-chip small label outlined>Auto</v-chip>
              <v-chip small label outlined>Off</v-chip>
            </v-chip-group>
          </div>
        </template>
        
        <!-- Speaker Controls -->
        <template v-if="device.type === 'SPEAKER' || device.type === 'HEADPHONES'">
          <div class="control-row">
            <span class="control-label">Playback</span>
            <div class="audio-controls">
              <v-btn icon small @click="audioCommand('previous')">
                <v-icon>mdi-skip-previous</v-icon>
              </v-btn>
              <v-btn 
                :color="speakerState.playing ? 'error' : 'primary'"
                fab
                small
                @click="togglePlayback"
              >
                <v-icon>{{ speakerState.playing ? 'mdi-pause' : 'mdi-play' }}</v-icon>
              </v-btn>
              <v-btn icon small @click="audioCommand('next')">
                <v-icon>mdi-skip-next</v-icon>
              </v-btn>
            </div>
          </div>
          
          <div class="control-row">
            <span class="control-label">Volume</span>
            <v-slider
              v-model="speakerState.volume"
              min="0"
              max="100"
              hide-details
              class="mt-0"
              @change="setVolume"
            >
              <template v-slot:prepend>
                <v-icon @click="toggleMute">
                  {{ speakerState.volume > 0 ? 'mdi-volume-high' : 'mdi-volume-mute' }}
                </v-icon>
              </template>
            </v-slider>
          </div>
          
          <div v-if="speakerState.playing" class="now-playing">
            <div v-if="speakerState.track" class="track-info">
              <div class="track-name">{{ speakerState.track.name || 'Unknown Track' }}</div>
              <div class="track-artist">{{ speakerState.track.artist || 'Unknown Artist' }}</div>
            </div>
            <div v-else class="track-info">
              <div class="track-name">Playing</div>
              <div class="track-artist">Unknown track</div>
            </div>
          </div>
        </template>
        
        <!-- Other Device Types -->
        <div v-if="!['LIGHT', 'THERMOSTAT', 'SPEAKER', 'HEADPHONES'].includes(device.type)" class="generic-controls">
          <p>{{ device.capabilities.length }} capabilities available</p>
          <v-btn color="primary" text @click="showDetails">
            View Details
          </v-btn>
        </div>
      </div>

      <div v-else class="device-disconnected">
        <p>Device is disconnected</p>
        <v-btn color="primary" @click="connect" :loading="connecting">
          Connect
        </v-btn>
      </div>
    </v-card-text>

    <v-divider></v-divider>

    <v-card-actions>
      <v-btn text small @click="showDetails">
        <v-icon left small>mdi-information-outline</v-icon>
        Details
      </v-btn>
      
      <v-spacer></v-spacer>
      
      <v-btn 
        v-if="isConnected" 
        color="error" 
        text 
        small
        @click="disconnect"
        :loading="disconnecting"
      >
        <v-icon left small>mdi-lan-disconnect</v-icon>
        Disconnect
      </v-btn>
      
      <v-btn 
        v-if="!isConnected && device.connectionState !== 'CONNECTING'" 
        color="primary" 
        text
        small
        @click="connect"
        :loading="connecting"
      >
        <v-icon left small>mdi-lan-connect</v-icon>
        Connect
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'DeviceCard',
  
  props: {
    device: {
      type: Object,
      required: true
    }
  },
  
  data() {
    return {
      connecting: false,
      disconnecting: false,
      
      // Light state
      lightState: {
        power: true,
        brightness: 100,
        colorPreset: 0,
        color: {
          hue: 0,
          saturation: 0,
          brightness: 100
        }
      },
      
      // Thermostat state
      thermostatState: {
        currentTemp: 72,
        targetTemp: 72,
        humidity: 50,
        modeIndex: 2, // Auto
        modes: ['cool', 'heat', 'auto', 'off']
      },
      
      // Speaker state
      speakerState: {
        playing: false,
        volume: 50,
        track: null
      }
    };
  },
  
  computed: {
    isConnected() {
      return this.device.connectionState === 'CONNECTED';
    },
    
    deviceIcon() {
      switch (this.device.type) {
        case 'LIGHT': return 'mdi-lightbulb';
        case 'SWITCH': return 'mdi-toggle-switch';
        case 'OUTLET': return 'mdi-power-socket';
        case 'THERMOSTAT': return 'mdi-thermostat';
        case 'SENSOR': return 'mdi-radio-tower';
        case 'SPEAKER': return 'mdi-speaker';
        case 'HEADPHONES': return 'mdi-headphones';
        case 'LOCK': return 'mdi-lock';
        case 'CAMERA': return 'mdi-cctv';
        case 'TV': return 'mdi-television';
        default: return 'mdi-devices';
      }
    },
    
    connectionStateText() {
      switch (this.device.connectionState) {
        case 'CONNECTED': return 'Connected';
        case 'CONNECTING': return 'Connecting...';
        case 'DISCONNECTED': return 'Disconnected';
        case 'ERROR': return 'Error';
        case 'DISCOVERED': return 'Discovered';
        default: return 'Unknown';
      }
    },
    
    connectionStateColor() {
      switch (this.device.connectionState) {
        case 'CONNECTED': return 'success';
        case 'CONNECTING': return 'primary';
        case 'DISCONNECTED': return 'grey';
        case 'ERROR': return 'error';
        case 'DISCOVERED': return 'info';
        default: return 'grey';
      }
    },
    
    connectionStateClass() {
      return `state-${this.device.connectionState.toLowerCase()}`;
    }
  },
  
  watch: {
    device: {
      handler(newDevice) {
        // Update state when device changes
        this.updateDeviceState();
      },
      deep: true
    }
  },
  
  mounted() {
    // Initialize state based on device type
    this.updateDeviceState();
  },
  
  methods: {
    async connect() {
      this.connecting = true;
      try {
        this.$emit('connect', this.device.id);
      } finally {
        this.connecting = false;
      }
    },
    
    async disconnect() {
      this.disconnecting = true;
      try {
        this.$emit('disconnect', this.device.id);
      } finally {
        this.disconnecting = false;
      }
    },
    
    showDetails() {
      // Emit event to show details dialog
      this.$emit('show-details', this.device);
    },
    
    hasCapability(capability) {
      return this.device.capabilities && this.device.capabilities.includes(capability);
    },
    
    formatDeviceType(type) {
      return type.charAt(0) + type.slice(1).toLowerCase();
    },
    
    updateDeviceState() {
      // Get device status if connected
      if (this.isConnected) {
        this.fetchDeviceStatus();
      }
    },
    
    async fetchDeviceStatus() {
      try {
        const status = await this.$store.dispatch('devices/getDeviceStatus', this.device.id);
        
        if (!status) return;
        
        // Update state based on device type
        if (this.device.type === 'LIGHT') {
          this.lightState.power = status.power || false;
          this.lightState.brightness = status.brightness || 100;
          
          if (status.color) {
            this.lightState.color = status.color;
          }
        } else if (this.device.type === 'THERMOSTAT') {
          this.thermostatState.currentTemp = status.currentTemperature || 72;
          this.thermostatState.targetTemp = status.targetTemperature || 72;
          this.thermostatState.humidity = status.humidity || 50;
          
          const modeIndex = this.thermostatState.modes.indexOf(status.mode || 'auto');
          this.thermostatState.modeIndex = modeIndex >= 0 ? modeIndex : 2;
        } else if (['SPEAKER', 'HEADPHONES'].includes(this.device.type)) {
          this.speakerState.playing = status.playing || false;
          this.speakerState.volume = status.volume || 50;
          this.speakerState.track = status.currentTrack || null;
        }
      } catch (error) {
        console.error('Failed to fetch device status:', error);
      }
    },
    
    // Light control methods
    togglePower() {
      this.sendCommand('setPower', { power: this.lightState.power });
    },
    
    setBrightness() {
      this.sendCommand('setBrightness', { level: this.lightState.brightness });
    },
    
    setColor(preset) {
      let color = {};
      
      switch (preset) {
        case 'warm':
          color = { temperature: 2700, brightness: this.lightState.brightness };
          break;
        case 'cool':
          color = { temperature: 6500, brightness: this.lightState.brightness };
          break;
        case 'blue':
          color = { hue: 240, saturation: 100, brightness: this.lightState.brightness };
          break;
        case 'red':
          color = { hue: 0, saturation: 100, brightness: this.lightState.brightness };
          break;
        case 'green':
          color = { hue: 120, saturation: 100, brightness: this.lightState.brightness };
          break;
      }
      
      this.lightState.color = color;
      this.sendCommand('setColor', color);
    },
    
    // Thermostat control methods
    setTemperature() {
      this.sendCommand('setTemperature', { temp: this.thermostatState.targetTemp });
    },
    
    adjustTemperature(delta) {
      this.thermostatState.targetTemp += delta;
      // Ensure within bounds
      this.thermostatState.targetTemp = Math.min(85, Math.max(60, this.thermostatState.targetTemp));
      this.setTemperature();
    },
    
    setThermostatMode() {
      const mode = this.thermostatState.modes[this.thermostatState.modeIndex];
      this.sendCommand('setMode', { mode });
    },
    
    // Speaker control methods
    togglePlayback() {
      if (this.speakerState.playing) {
        this.sendCommand('stop', {});
        this.speakerState.playing = false;
      } else {
        this.sendCommand('playMusic', { genre: 'relaxing' });
        this.speakerState.playing = true;
      }
    },
    
    setVolume() {
      this.sendCommand('setVolume', { level: this.speakerState.volume });
    },
    
    toggleMute() {
      if (this.speakerState.volume > 0) {
        this.speakerState.previousVolume = this.speakerState.volume;
        this.speakerState.volume = 0;
      } else {
        this.speakerState.volume = this.speakerState.previousVolume || 50;
      }
      this.setVolume();
    },
    
    audioCommand(command) {
      switch (command) {
        case 'previous':
          this.sendCommand('previous', {});
          break;
        case 'next':
          this.sendCommand('next', {});
          break;
      }
    },
    
    // Generic command sender
    sendCommand(name, parameters) {
      this.$emit('send-command', {
        deviceId: this.device.id,
        deviceName: this.device.name,
        command: {
          name,
          parameters
        }
      });
    }
  }
}
</script>

<style scoped>
.device-card {
  transition: all 0.3s ease;
  height: 100%;
}

.device-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
}

.device-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 12px;
  color: white;
  background-color: var(--v-primary-base);
  transition: all 0.3s ease;
}

.state-connected {
  background-color: var(--v-success-base);
}

.state-disconnected {
  background-color: var(--v-grey-base);
}

.state-error {
  background-color: var(--v-error-base);
}

.device-title {
  flex: 1;
}

.device-name {
  font-weight: bold;
  line-height: 1.2;
}

.device-type {
  font-size: 0.8rem;
  color: rgba(0, 0, 0, 0.6);
}

.device-controls {
  padding: 8px 0;
}

.control-row {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.control-label {
  flex: 0 0 80px;
  font-size: 0.9rem;
  color: rgba(0, 0, 0, 0.6);
}

.color-buttons {
  display: flex;
}

.color-button {
  width: 30px !important;
  height: 30px;
  min-width: unset !important;
  border-radius: 50% !important;
  margin: 0 4px;
}

.warm-white {
  background-color: #ffd6aa !important;
}

.cool-white {
  background-color: #f5f5ff !important;
}

.blue {
  background-color: #4a80ff !important;
}

.red {
  background-color: #ff5252 !important;
}

.green {
  background-color: #4caf50 !important;
}

.thermostat-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 16px;
}

.current-temp {
  font-size: 2.5rem;
  font-weight: 300;
}

.target-temp {
  font-size: 0.9rem;
  color: rgba(0, 0, 0, 0.6);
}

.temperature-control {
  align-items: center;
}

.audio-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.now-playing {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  padding: 8px;
  margin-top: 8px;
}

.track-name {
  font-weight: 500;
  font-size: 0.9rem;
}

.track-artist {
  font-size: 0.8rem;
  color: rgba(0, 0, 0, 0.6);
}

.device-disconnected {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  color: rgba(0, 0, 0, 0.6);
}

.generic-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
}
</style>


<template>
  <v-card class="device-card">
    <v-card-title class="device-header">
      <div class="device-icon-container" :class="connectionStateClass">
        <v-icon size="32">{{ deviceIcon }}</v-icon>
      </div>
      <div class="device-title">
        <div class="device-name">{{ device.name }}</div>
        <div class="device-type">{{ formatDeviceType(device.type) }}</div>
      </div>
      <v-chip 
        x-small 
        :color="connectionStateColor"
        class="ml-auto"
      >
        {{ connectionStateText }}
      </v-chip>
    </v-card-title>

    <v-divider></v-divider>

    <v-card-text>
      <div v-if="isConnected" class="device-controls">
        <!-- Light Controls -->
        <template v-if="device.type === 'LIGHT'">
          <div class="control-row">
            <span class="control-label">Power</span>
            <v-switch
              v-model="lightState.power"
              color="primary"
              hide-details
              dense
              @change="togglePower"
            ></v-switch>
          </div>
          
          <div v-if="hasCapability('BRIGHTNESS_CONTROL')" class="control-row">
            <span class="control-label">Brightness</span>
            <v-slider
              v-model="lightState.brightness"
              min="0"
              max="100"
              hide-details
              class="mt-0"
              @change="setBrightness"
            ></v-slider>
          </div>
          
          <div v-if="hasCapability('COLOR_CONTROL')" class="control-row">
            <span class="control-label">Color</span>
            <v-btn-toggle
              v-model="lightState.colorPreset"
              mandatory
              dense
              class="color-buttons"
            >
              <v-btn 
                small 
                @click="setColor('warm')"
                class="color-button warm-white"
              ></v-btn>
              <v-btn 
                small 
                @click="setColor('cool')"
                class="color-button cool-white"
              ></v-btn>
              <v-btn 
                small 
                @click="setColor('blue')"
                class="color-button blue"
              ></v-btn>
              <v-btn 
                small 
                @click="setColor('red')"
                class="color-button red"
              ></v-btn>
              <v-btn 
                small 
                @click="setColor('green')"
                class="color-button green"
              ></v-btn>
            </v-btn-toggle>
          </div>
        </template>
        
        <!-- Thermostat Controls -->
        <template v-if="device.type === 'THERMOSTAT'">
          <div class="thermostat-display">
            <div class="current-temp">{{ thermostatState.currentTemp }}°</div>
            <div class="target-temp">Set to {{ thermostatState.targetTemp }}°</div>
          </div>
          
          <div class="control-row temperature-control">
            <v-btn icon @click="adjustTemperature(-1)">
              <v-icon>mdi-minus</v-icon>
            </v-btn>
            <v-slider
              v-model="thermostatState.targetTemp"
              min="60"
              max="85"
              thumb-label
              hide-details
              class="mt-0"
              @change="setTemperature"
            ></v-slider>
            <v-btn icon @click="adjustTemperature(1)">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </div>
          
          <div class="control-row">
            <span class="control-label">Mode</span>
            <v-chip-group
              v-model="thermostatState.modeIndex"
              active-class="primary--text"
              mandatory
              @change="setThermostatMode"
            >
              <v-chip small label outlined>Cool</v-chip>
              <v-chip small label outlined>Heat</v-chip>
              <v-chip small label outlined>Auto</v-chip>
              <v-chip small label outlined>Off</v-chip>
            </v-chip-group>
          </div>
        </template>
        
        <!-- Speaker Controls -->
        <template v-if="device.type === 'SPEAKER' || device.type === 'HEADPHONES'">
          <div class="control-row">
            <span class="control-label">Playback</span>
            <div class="audio-controls">
              <v-btn icon small @click="audioCommand('previous')">
                <v-icon>mdi-skip-previous</v-icon>
              </v-btn>
              <v-btn 
                :color="speakerState.playing ? 'error' : 'primary'"
                fab
                small
                @click="togglePlayback"
              >
                <v-icon>{{ speakerState.playing ? 'mdi-pause' : 'mdi-play' }}</v-icon>
              </v-btn>
              <v-btn icon small @click="audioCommand('next')">
                <v-icon>mdi-skip-next</v-icon>
              </v-btn>
            </div>
          </div>
          
          <div class="control-row">
            <span class="control-label">Volume</span>
            <v-slider
              v-model="speakerState.volume"
              min="0"
              max="100"
              hide-details
              class="mt-0"
              @change="setVolume"
            >
              <template v-slot:prepend>
                <v-icon @click="toggleMute">
                  {{ speakerState.volume > 0 ? 'mdi-volume-high' : 'mdi-volume-mute' }}
                </v-icon>
              </template>
            </v-slider>
          </div>
          
          <div v-if="speakerState.playing" class="now-playing">
            <div v-if="speakerState.track" class="track-info">
              <div class="track-name">{{ speakerState.track.name || 'Unknown Track' }}</div>
              <div class="track-artist">{{ speakerState.track.artist || 'Unknown Artist' }}</div>
            </div>
            <div v-else class="track-info">
              <div class="track-name">Playing</div>
              <div class="track-artist">Unknown track</div>
            </div>
          </div>
        </template>
        
        <!-- Other Device Types -->
        <div v-if="!['LIGHT', 'THERMOSTAT', 'SPEAKER', 'HEADPHONES'].includes(device.type)" class="generic-controls">
          <p>{{ device.capabilities.length }} capabilities available</p>
          <v-btn color="primary" text @click="showDetails">
            View Details
          </v-btn>
        </div>
      </div>

      <div v-else class="device-disconnected">
        <p>Device is disconnected</p>
        <v-btn color="primary" @click="connect" :loading="connecting">
          Connect
        </v-btn>
      </div>
    </v-card-text>

    <v-divider></v-divider>

    <v-card-actions>
      <v-btn text small @click="showDetails">
        <v-icon left small>mdi-information-outline</v-icon>
        Details
      </v-btn>
      
      <v-spacer></v-spacer>
      
      <v-btn 
        v-if="isConnected" 
        color="error" 
        text 
        small
        @click="disconnect"
        :loading="disconnecting"
      >
        <v-icon left small>mdi-lan-disconnect</v-icon>
        Disconnect
      </v-btn>
      
      <v-btn 
        v-if="!isConnected && device.connectionState !== 'CONNECTING'" 
        color="primary" 
        text
        small
        @click="connect"
        :loading="connecting"
      >
        <v-icon left small>mdi-lan-connect</v-icon>
        Connect
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'DeviceCard',
  
  props: {
    device: {
      type: Object,
      required: true
    }
  },
  
  data() {
    return {
      connecting: false,
      disconnecting: false,
      
      // Light state
      lightState: {
        power: true,
        brightness: 100,
        colorPreset: 0,
        color: {
          hue: 0,
          saturation: 0,
          brightness: 100
        }
      },
      
      // Thermostat state
      thermostatState: {
        currentTemp: 72,
        targetTemp: 72,
        humidity: 50,
        modeIndex: 2, // Auto
        modes: ['cool', 'heat', 'auto', 'off']
      },
      
      // Speaker state
      speakerState: {
        playing: false,
        volume: 50,
        track: null
      }
    };
  },
  
  computed: {
    isConnected() {
      return this.device.connectionState === 'CONNECTED';
    },
    
    deviceIcon() {
      switch (this.device.type) {
        case 'LIGHT': return 'mdi-lightbulb';
        case 'SWITCH': return 'mdi-toggle-switch';
        case 'OUTLET': return 'mdi-power-socket';
        case 'THERMOSTAT': return 'mdi-thermostat';
        case 'SENSOR': return 'mdi-radio-tower';
        case 'SPEAKER': return 'mdi-speaker';
        case 'HEADPHONES': return 'mdi-headphones';
        case 'LOCK': return 'mdi-lock';
        case 'CAMERA': return 'mdi-cctv';
        case 'TV': return 'mdi-television';
        default: return 'mdi-devices';
      }
    },
    
    connectionStateText() {
      switch (this.device.connectionState) {
        case 'CONNECTED': return 'Connected';
        case 'CONNECTING': return 'Connecting...';
        case 'DISCONNECTED': return 'Disconnected';
        case 'ERROR': return 'Error';
        case 'DISCOVERED': return 'Discovered';
        default: return 'Unknown';
      }
    },
    
    connectionStateColor() {
      switch (this.device.connectionState) {
        case 'CONNECTED': return 'success';
        case 'CONNECTING': return 'primary';
        case 'DISCONNECTED': return 'grey';
        case 'ERROR': return 'error';
        case 'DISCOVERED': return 'info';
        default: return 'grey';
      }
    },
    
    connectionStateClass() {
      return `state-${this.device.connectionState.toLowerCase()}`;
    }
  },
  
  watch: {
    device: {
      handler(newDevice) {
        // Update state when device changes
        this.updateDeviceState();
      },
      deep: true
    }
  },
  
  mounted() {
    // Initialize state based on device type
    this.updateDeviceState();
  },
  
  methods: {
    async connect() {
      this.connecting = true;
      try {
        this.$emit('connect', this.device.id);
      } finally {
        this.connecting = false;
      }
    },
    
    async disconnect() {
      this.disconnecting = true;
      try {
        this.$emit('disconnect', this.device.id);
      } finally {
        this.disconnecting = false;
      }
    },
    
    showDetails() {
      // Emit event to show details dialog
      this.$emit('show-details', this.device);
    },
    
    hasCapability(capability) {
      return this.device.capabilities && this.device.capabilities.includes(capability);
    },
    
    formatDeviceType(type) {
      return type.charAt(0) + type.slice(1).toLowerCase();
    },
    
    updateDeviceState() {
      // Get device status if connected
      if (this.isConnected) {
        this.fetchDeviceStatus();
      }
    },
    
    async fetchDeviceStatus() {
      try {
        const status = await this.$store.dispatch('devices/getDeviceStatus', this.device.id);
        
        if (!status) return;
        
        // Update state based on device type
        if (this.device.type === 'LIGHT') {
          this.lightState.power = status.power || false;
          this.lightState.brightness = status.brightness || 100;
          
          if (status.color) {
            this.lightState.color = status.color;
          }
        } else if (this.device.type === 'THERMOSTAT') {
          this.thermostatState.currentTemp = status.currentTemperature || 72;
          this.thermostatState.targetTemp = status.targetTemperature || 72;
          this.thermostatState.humidity = status.humidity || 50;
          
          const modeIndex = this.thermostatState.modes.indexOf(status.mode || 'auto');
          this.thermostatState.modeIndex = modeIndex >= 0 ? modeIndex : 2;
        } else if (['SPEAKER', 'HEADPHONES'].includes(this.device.type)) {
          this.speakerState.playing = status.playing || false;
          this.speakerState.volume = status.volume || 50;
          this.speakerState.track = status.currentTrack || null;
        }
      } catch (error) {
        console.error('Failed to fetch device status:', error);
      }
    },
    
    // Light control methods
    togglePower() {
      this.sendCommand('setPower', { power: this.lightState.power });
    },
    
    setBrightness() {
      this.sendCommand('setBrightness', { level: this.lightState.brightness });
    },
    
    setColor(preset) {
      let color = {};
      
      switch (preset) {
        case 'warm':
          color = { temperature: 2700, brightness: this.lightState.brightness };
          break;
        case 'cool':
          color = { temperature: 6500, brightness: this.lightState.brightness };
          break;
        case 'blue':
          color = { hue: 240, saturation: 100, brightness: this.lightState.brightness };
          break;
        case 'red':
          color = { hue: 0, saturation: 100, brightness: this.lightState.brightness };
          break;
        case 'green':
          color = { hue: 120, saturation: 100, brightness: this.lightState.brightness };
          break;
      }
      
      this.lightState.color = color;
      this.sendCommand('setColor', color);
    },
    
    // Thermostat control methods
    setTemperature() {
      this.sendCommand('setTemperature', { temp: this.thermostatState.targetTemp });
    },
    
    adjustTemperature(delta) {
      this.thermostatState.targetTemp += delta;
      // Ensure within bounds
      this.thermostatState.targetTemp = Math.min(85, Math.max(60, this.thermostatState.targetTemp));
      this.setTemperature();
    },
    
    setThermostatMode() {
      const mode = this.thermostatState.modes[this.thermostatState.modeIndex];
      this.sendCommand('setMode', { mode });
    },
    
    // Speaker control methods
    togglePlayback() {
      if (this.speakerState.playing) {
        this.sendCommand('stop', {});
        this.speakerState.playing = false;
      } else {
        this.sendCommand('playMusic', { genre: 'relaxing' });
        this.speakerState.playing = true;
      }
    },
    
    setVolume() {
      this.sendCommand('setVolume', { level: this.speakerState.volume });
    },
    
    toggleMute() {
      if (this.speakerState.volume > 0) {
        this.speakerState.previousVolume = this.speakerState.volume;
        this.speakerState.volume = 0;
      } else {
        this.speakerState.volume = this.speakerState.previousVolume || 50;
      }
      this.setVolume();
    },
    
    audioCommand(command) {
      switch (command) {
        case 'previous':
          this.sendCommand('previous', {});
          break;
        case 'next':
          this.sendCommand('next', {});
          break;
      }
    },
    
    // Generic command sender
    sendCommand(name, parameters) {
      this.$emit('send-command', {
        deviceId: this.device.id,
        deviceName: this.device.name,
        command: {
          name,
          parameters
        }
      });
    }
  }
}
</script>

<style scoped>
.device-card {
  transition: all 0.3s ease;
  height: 100%;
}

.device-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
}

.device-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 12px;
  color: white;
  background-color: var(--v-primary-base);
  transition: all 0.3s ease;
}

.state-connected {
  background-color: var(--v-success-base);
}

.state-disconnected {
  background-color: var(--v-grey-base);
}

.state-error {
  background-color: var(--v-error-base);
}

.device-title {
  flex: 1;
}

.device-name {
  font-weight: bold;
  line-height: 1.2;
}

.device-type {
  font-size: 0.8rem;
  color: rgba(0, 0, 0, 0.6);
}

.device-controls {
  padding: 8px 0;
}

.control-row {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.control-label {
  flex: 0 0 80px;
  font-size: 0.9rem;
  color: rgba(0, 0, 0, 0.6);
}

.color-buttons {
  display: flex;
}

.color-button {
  width: 30px !important;
  height: 30px;
  min-width: unset !important;
  border-radius: 50% !important;
  margin: 0 4px;
}

.warm-white {
  background-color: #ffd6aa !important;
}

.cool-white {
  background-color: #f5f5ff !important;
}

.blue {
  background-color: #4a80ff !important;
}

.red {
  background-color: #ff5252 !important;
}

.green {
  background-color: #4caf50 !important;
}

.thermostat-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 16px;
}

.current-temp {
  font-size: 2.5rem;
  font-weight: 300;
}

.target-temp {
  font-size: 0.9rem;
  color: rgba(0, 0, 0, 0.6);
}

.temperature-control {
  align-items: center;
}

.audio-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.now-playing {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  padding: 8px;
  margin-top: 8px;
}

.track-name {
  font-weight: 500;
  font-size: 0.9rem;
}

.track-artist {
  font-size: 0.8rem;
  color: rgba(0, 0, 0, 0.6);
}

.device-disconnected {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  color: rgba(0, 0, 0, 0.6);
}

.generic-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
}
</style>


/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\ui\components\DeviceCard.vue) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\DeviceCard.vue) */
/* --- dest (C:\Users\chell\Desktop\newsal\ui\components\DeviceCard.vue) --- */
<!-- Merged master for logical file: ui\components\DeviceCard
Sources:
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\DeviceCard.vue (hash:3C672C77DD80DCDEB24C7FC8F3A5F8F9FB9D490B33806E12CFFF17DC65D98E50)
 - C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\DeviceCard.vue (hash:572097746ACED778EEC0FA00CA4D7EC0C152425F9A2E2E9168CE27479D72F86C)
 -->

<!-- ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\DeviceCard.vue | ext: .vue | sha: 3C672C77DD80DCDEB24C7FC8F3A5F8F9FB9D490B33806E12CFFF17DC65D98E50 ---- -->
[BINARY FILE - original copied to merged_sources: ui\components\DeviceCard.vue]
<!-- ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\DeviceCard.vue | ext: .vue | sha: 572097746ACED778EEC0FA00CA4D7EC0C152425F9A2E2E9168CE27479D72F86C ---- -->
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\DeviceCard.vue --- */
<!-- Migrated and adapted from sallie_1.00/ui/components/DeviceCard.vue -->
<template>
  <div class="device-card">
    <h3>{{ device.name }}</h3>
    <p>Status: {{ device.status }}</p>
    <button @click="$emit('control', device)">Control</button>
  </div>
</template>
<script>
export default {
  name: 'DeviceCard',
  props: {
    device: {
      type: Object,
      required: true
    },
    theme: {
      type: String,
      default: 'light'
    }
  },
  data() {
    return {
      error: '',
      loading: false,
      analytics: [],
      lastAction: null
    };
  methods: {
    async controlDevice(action) {
      this.loading = true;
      this.error = '';
      try {
        // Simulate device control logic
        await new Promise(resolve => setTimeout(resolve, 500));
        this.lastAction = action;
        this.$emit('control', { device: this.device, action });
        this.logAnalytics('device_control', { device: this.device, action });
      } catch (e) {
        this.error = 'Device control failed.';
        this.logAnalytics('error', { error: this.error });
      }
      this.loading = false;
    logAnalytics(event, data) {
      this.analytics.push({ event, data, timestamp: Date.now() });
  }
}
</script>
<style scoped>
.device-card {
  background: var(--background-secondary, #1e293b);
  border-radius: var(--border-radius, 8px);
  box-shadow: var(--shadow-md, 0 4px 6px -1px rgb(0 0 0 / 0.1));
  padding: 1em;
  margin: 1em 0;
  color: var(--text-primary, #f8fafc);
button {
  background: var(--sallie-success, #10b981);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.5em 1em;
  cursor: pointer;
  transition: var(--transition, all 0.2s ease-in-out);
button:hover {
  background: var(--sallie-accent, #06b6d4);
</style>

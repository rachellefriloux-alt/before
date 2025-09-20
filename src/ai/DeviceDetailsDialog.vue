<template>
  <v-dialog v-model="dialogVisible" max-width="600">
    <v-card v-if="device">
      <v-card-title class="headline">
        {{ device.name }}
        <v-chip 
          x-small 
          :color="connectionStateColor"
          class="ml-3"
        >
          {{ connectionStateText }}
        </v-chip>
      </v-card-title>
      
      <v-divider></v-divider>
      
      <v-card-text>
        <v-tabs v-model="activeTab">
          <v-tab>Details</v-tab>
          <v-tab>Status</v-tab>
          <v-tab>Controls</v-tab>
        </v-tabs>
        
        <v-tabs-items v-model="activeTab">
          <!-- Device Details Tab -->
          <v-tab-item>
            <v-list dense>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-subtitle>Device Type</v-list-item-subtitle>
                  <v-list-item-title>{{ formatDeviceType(device.type) }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-subtitle>Protocol</v-list-item-subtitle>
                  <v-list-item-title>{{ device.protocol }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              
              <v-list-item v-if="device.manufacturer">
                <v-list-item-content>
                  <v-list-item-subtitle>Manufacturer</v-list-item-subtitle>
                  <v-list-item-title>{{ device.manufacturer }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              
              <v-list-item v-if="device.model">
                <v-list-item-content>
                  <v-list-item-subtitle>Model</v-list-item-subtitle>
                  <v-list-item-title>{{ device.model }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              
              <v-divider></v-divider>
              
              <v-subheader>Connection Information</v-subheader>
              
              <v-list-item v-if="device.ipAddress">
                <v-list-item-content>
                  <v-list-item-subtitle>IP Address</v-list-item-subtitle>
                  <v-list-item-title>{{ device.ipAddress }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              
              <v-list-item v-if="device.bluetoothAddress">
                <v-list-item-content>
                  <v-list-item-subtitle>Bluetooth Address</v-list-item-subtitle>
                  <v-list-item-title>{{ device.bluetoothAddress }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              
              <v-list-item v-if="device.zigbeeAddress">
                <v-list-item-content>
                  <v-list-item-subtitle>ZigBee Address</v-list-item-subtitle>
                  <v-list-item-title>{{ device.zigbeeAddress }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              
              <v-list-item v-if="device.zwaveNodeId !== undefined">
                <v-list-item-content>
                  <v-list-item-subtitle>Z-Wave Node ID</v-list-item-subtitle>
                  <v-list-item-title>{{ device.zwaveNodeId }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              
              <v-list-item v-if="device.matterNodeId">
                <v-list-item-content>
                  <v-list-item-subtitle>Matter Node ID</v-list-item-subtitle>
                  <v-list-item-title>{{ device.matterNodeId }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              
              <v-divider></v-divider>
              
              <v-subheader>Capabilities</v-subheader>
              
              <v-list-item v-if="!device.capabilities || device.capabilities.length === 0">
                <v-list-item-content>
                  <v-list-item-title>No capabilities reported</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              
              <v-list-item v-else>
                <v-list-item-content>
                  <v-chip-group column>
                    <v-chip
                      v-for="capability in device.capabilities"
                      :key="capability"
                      small
                      outlined
                    >
                      {{ formatCapability(capability) }}
                    </v-chip>
                  </v-chip-group>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-tab-item>
          
          <!-- Device Status Tab -->
          <v-tab-item>
            <div class="pa-4">
              <v-alert
                v-if="!isConnected"
                type="warning"
                text
                outlined
              >
                Device is disconnected. Connect to view status.
              </v-alert>
              
              <template v-else>
                <div v-if="isLoadingStatus" class="text-center py-4">
                  <v-progress-circular
                    indeterminate
                    color="primary"
                  ></v-progress-circular>
                  <div class="mt-2">Loading status...</div>
                </div>
                
                <div v-else-if="deviceStatus">
                  <v-list dense>
                    <template v-for="(value, key) in deviceStatus">
                      <v-list-item :key="key" v-if="!isObject(value)">
                        <v-list-item-content>
                          <v-list-item-subtitle>{{ formatStatusKey(key) }}</v-list-item-subtitle>
                          <v-list-item-title>{{ formatStatusValue(key, value) }}</v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                      
                      <v-list-group 
                        :key="key" 
                        v-else 
                        :value="false" 
                        no-action
                      >
                        <template v-slot:activator>
                          <v-list-item-content>
                            <v-list-item-subtitle>{{ formatStatusKey(key) }}</v-list-item-subtitle>
                          </v-list-item-content>
                        </template>
                        
                        <v-list-item v-for="(subValue, subKey) in value" :key="`${key}-${subKey}`">
                          <v-list-item-content>
                            <v-list-item-subtitle>{{ formatStatusKey(subKey) }}</v-list-item-subtitle>
                            <v-list-item-title>{{ formatStatusValue(subKey, subValue) }}</v-list-item-title>
                          </v-list-item-content>
                        </v-list-item>
                      </v-list-group>
                    </template>
                  </v-list>
                </div>
                
                <v-alert v-else type="info" text>
                  No status information available.
                </v-alert>
                
                <v-btn
                  color="primary"
                  text
                  class="mt-4"
                  @click="refreshDeviceStatus"
                >
                  <v-icon left>mdi-refresh</v-icon>
                  Refresh Status
                </v-btn>
              </template>
            </div>
          </v-tab-item>
          
          <!-- Device Controls Tab -->
          <v-tab-item>
            <div class="pa-4">
              <v-alert
                v-if="!isConnected"
                type="warning"
                text
                outlined
              >
                Device is disconnected. Connect to access controls.
              </v-alert>
              
              <template v-else>
                <!-- Light Controls -->
                <template v-if="device.type === 'LIGHT'">
                  <v-card flat class="mb-4">
                    <v-card-title class="py-1">Power</v-card-title>
                    <v-card-text>
                      <v-btn-toggle v-model="controls.power" mandatory>
                        <v-btn 
                          :color="controls.power ? 'success' : ''" 
                          @click="sendCommand('setPower', { power: true })"
                        >
                          <v-icon left>mdi-lightbulb-on</v-icon>
                          On
                        </v-btn>
                        <v-btn 
                          :color="!controls.power ? 'error' : ''" 
                          @click="sendCommand('setPower', { power: false })"
                        >
                          <v-icon left>mdi-lightbulb-off</v-icon>
                          Off
                        </v-btn>
                      </v-btn-toggle>
                    </v-card-text>
                  </v-card>
                  
                  <v-card flat class="mb-4" v-if="hasCapability('BRIGHTNESS_CONTROL')">
                    <v-card-title class="py-1">Brightness</v-card-title>
                    <v-card-text>
                      <v-slider
                        v-model="controls.brightness"
                        min="0"
                        max="100"
                        thumb-label
                        @change="sendCommand('setBrightness', { level: controls.brightness })"
                      >
                        <template v-slot:prepend>
                          <v-icon>mdi-brightness-5</v-icon>
                        </template>
                        <template v-slot:append>
                          <v-icon>mdi-brightness-7</v-icon>
                        </template>
                      </v-slider>
                    </v-card-text>
                  </v-card>
                  
                  <v-card flat v-if="hasCapability('COLOR_CONTROL')">
                    <v-card-title class="py-1">Color</v-card-title>
                    <v-card-text>
                      <div class="color-presets">
                        <v-btn 
                          small 
                          fab
                          class="mr-2 warm-white"
                          @click="sendCommand('setColor', { temperature: 2700, brightness: controls.brightness })"
                        ></v-btn>
                        <v-btn 
                          small 
                          fab
                          class="mr-2 cool-white"
                          @click="sendCommand('setColor', { temperature: 6500, brightness: controls.brightness })"
                        ></v-btn>
                        <v-btn 
                          small 
                          fab
                          class="mr-2"
                          color="red"
                          @click="sendCommand('setColor', { hue: 0, saturation: 100, brightness: controls.brightness })"
                        ></v-btn>
                        <v-btn 
                          small 
                          fab
                          class="mr-2"
                          color="green"
                          @click="sendCommand('setColor', { hue: 120, saturation: 100, brightness: controls.brightness })"
                        ></v-btn>
                        <v-btn 
                          small 
                          fab
                          class="mr-2"
                          color="blue"
                          @click="sendCommand('setColor', { hue: 240, saturation: 100, brightness: controls.brightness })"
                        ></v-btn>
                      </div>
                      
                      <v-expansion-panels class="mt-4" flat>
                        <v-expansion-panel>
                          <v-expansion-panel-header>Advanced Color Controls</v-expansion-panel-header>
                          <v-expansion-panel-content>
                            <v-tabs v-model="colorTab" class="mt-2">
                              <v-tab>RGB</v-tab>
                              <v-tab>Temperature</v-tab>
                            </v-tabs>
                            
                            <v-tabs-items v-model="colorTab">
                              <v-tab-item>
                                <div>
                                  <v-subheader>Hue</v-subheader>
                                  <v-slider
                                    v-model="controls.color.hue"
                                    min="0"
                                    max="360"
                                    thumb-label
                                  ></v-slider>
                                  
                                  <v-subheader>Saturation</v-subheader>
                                  <v-slider
                                    v-model="controls.color.saturation"
                                    min="0"
                                    max="100"
                                    thumb-label
                                  ></v-slider>
                                  
                                  <v-btn
                                    color="primary"
                                    @click="sendCommand('setColor', { 
                                      hue: controls.color.hue,
                                      saturation: controls.color.saturation,
                                      brightness: controls.brightness
                                    })"
                                  >
                                    Apply Color
                                  </v-btn>
                                </div>
                              </v-tab-item>
                              
                              <v-tab-item>
                                <div>
                                  <v-subheader>Color Temperature (K)</v-subheader>
                                  <v-slider
                                    v-model="controls.color.temperature"
                                    min="2000"
                                    max="6500"
                                    thumb-label
                                  ></v-slider>
                                  
                                  <v-btn
                                    color="primary"
                                    @click="sendCommand('setColor', { 
                                      temperature: controls.color.temperature,
                                      brightness: controls.brightness
                                    })"
                                  >
                                    Apply Temperature
                                  </v-btn>
                                </div>
                              </v-tab-item>
                            </v-tabs-items>
                          </v-expansion-panel-content>
                        </v-expansion-panel>
                      </v-expansion-panels>
                    </v-card-text>
                  </v-card>
                </template>
                
                <!-- Thermostat Controls -->
                <template v-if="device.type === 'THERMOSTAT'">
                  <v-card flat class="mb-4">
                    <v-card-title class="py-1">Temperature</v-card-title>
                    <v-card-text>
                      <div class="text-center mb-4">
                        <div class="display-2">{{ controls.temperature }}°</div>
                        <div class="caption">Target Temperature</div>
                      </div>
                      
                      <v-slider
                        v-model="controls.temperature"
                        min="60"
                        max="85"
                        thumb-label
                        @change="sendCommand('setTemperature', { temp: controls.temperature })"
                      >
                        <template v-slot:prepend>
                          <v-btn
                            icon
                            @click="adjustTemperature(-1)"
                          >
                            <v-icon>mdi-minus</v-icon>
                          </v-btn>
                        </template>
                        <template v-slot:append>
                          <v-btn
                            icon
                            @click="adjustTemperature(1)"
                          >
                            <v-icon>mdi-plus</v-icon>
                          </v-btn>
                        </template>
                      </v-slider>
                    </v-card-text>
                  </v-card>
                  
                  <v-card flat>
                    <v-card-title class="py-1">Mode</v-card-title>
                    <v-card-text>
                      <v-btn-toggle
                        v-model="controls.modeIndex"
                        mandatory
                        @change="setThermostatMode"
                      >
                        <v-btn>
                          <v-icon left>mdi-snowflake</v-icon>
                          Cool
                        </v-btn>
                        <v-btn>
                          <v-icon left>mdi-fire</v-icon>
                          Heat
                        </v-btn>
                        <v-btn>
                          <v-icon left>mdi-autorenew</v-icon>
                          Auto
                        </v-btn>
                        <v-btn>
                          <v-icon left>mdi-power</v-icon>
                          Off
                        </v-btn>
                      </v-btn-toggle>
                    </v-card-text>
                  </v-card>
                </template>
                
                <!-- Speaker Controls -->
                <template v-if="device.type === 'SPEAKER' || device.type === 'HEADPHONES'">
                  <v-card flat class="mb-4">
                    <v-card-title class="py-1">Playback</v-card-title>
                    <v-card-text>
                      <div class="text-center">
                        <v-btn-toggle>
                          <v-btn @click="sendCommand('previous', {})">
                            <v-icon>mdi-skip-previous</v-icon>
                          </v-btn>
                          <v-btn
                            :color="controls.playing ? 'error' : 'primary'"
                            fab
                            @click="togglePlayback"
                          >
                            <v-icon>{{ controls.playing ? 'mdi-pause' : 'mdi-play' }}</v-icon>
                          </v-btn>
                          <v-btn @click="sendCommand('next', {})">
                            <v-icon>mdi-skip-next</v-icon>
                          </v-btn>
                        </v-btn-toggle>
                      </div>
                    </v-card-text>
                  </v-card>
                  
                  <v-card flat class="mb-4">
                    <v-card-title class="py-1">Volume</v-card-title>
                    <v-card-text>
                      <v-slider
                        v-model="controls.volume"
                        min="0"
                        max="100"
                        thumb-label
                        @change="sendCommand('setVolume', { level: controls.volume })"
                      >
                        <template v-slot:prepend>
                          <v-icon @click="toggleMute">
                            {{ volumeIcon }}
                          </v-icon>
                        </template>
                      </v-slider>
                    </v-card-text>
                  </v-card>
                  
                  <v-card flat>
                    <v-card-title class="py-1">Music Selection</v-card-title>
                    <v-card-text>
                      <v-select
                        v-model="controls.genre"
                        label="Genre"
                        :items="[
                          'relaxing',
                          'upbeat',
                          'focus',
                          'ambient',
                          'classical',
                          'jazz'
                        ]"
                      ></v-select>
                      <v-btn
                        color="primary"
                        block
                        @click="playGenre"
                      >
                        Play Music
                      </v-btn>
                    </v-card-text>
                  </v-card>
                </template>
                
                <!-- Generic Controls -->
                <template v-if="!['LIGHT', 'THERMOSTAT', 'SPEAKER', 'HEADPHONES'].includes(device.type)">
                  <v-alert
                    type="info"
                    text
                    outlined
                  >
                    Advanced controls for this device type are not available in the current version.
                  </v-alert>
                </template>
              </template>
            </div>
          </v-tab-item>
        </v-tabs-items>
      </v-card-text>
      
      <v-divider></v-divider>
      
      <v-card-actions>
        <v-btn
          v-if="!isConnected"
          color="primary"
          @click="connectToDevice"
          :loading="connecting"
        >
          <v-icon left>mdi-lan-connect</v-icon>
          Connect
        </v-btn>
        
        <v-btn
          v-if="isConnected"
          color="error"
          text
          @click="disconnectFromDevice"
          :loading="disconnecting"
        >
          <v-icon left>mdi-lan-disconnect</v-icon>
          Disconnect
        </v-btn>
        
        <v-spacer></v-spacer>
        
        <v-btn
          text
          @click="close"
        >
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'DeviceDetailsDialog',
  
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    device: {
      type: Object,
      default: null
    }
  },
  
  data() {
    return {
      dialogVisible: false,
      activeTab: 0,
      colorTab: 0,
      deviceStatus: null,
      isLoadingStatus: false,
      connecting: false,
      disconnecting: false,
      
      controls: {
        // Light controls
        power: true,
        brightness: 100,
        color: {
          hue: 0,
          saturation: 0,
          brightness: 100,
          temperature: 4000
        },
        
        // Thermostat controls
        temperature: 72,
        modeIndex: 2, // Auto
        modes: ['cool', 'heat', 'auto', 'off'],
        
        // Speaker controls
        playing: false,
        volume: 50,
        previousVolume: 50,
        genre: 'relaxing'
      }
    };
  },
  
  computed: {
    isConnected() {
      return this.device && this.device.connectionState === 'CONNECTED';
    },
    
    connectionStateText() {
      if (!this.device) return '';
      
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
      if (!this.device) return 'grey';
      
      switch (this.device.connectionState) {
        case 'CONNECTED': return 'success';
        case 'CONNECTING': return 'primary';
        case 'DISCONNECTED': return 'grey';
        case 'ERROR': return 'error';
        case 'DISCOVERED': return 'info';
        default: return 'grey';
      }
    },
    
    volumeIcon() {
      if (this.controls.volume === 0) {
        return 'mdi-volume-mute';
      } else if (this.controls.volume < 30) {
        return 'mdi-volume-low';
      } else if (this.controls.volume < 70) {
        return 'mdi-volume-medium';
      } else {
        return 'mdi-volume-high';
      }
    }
  },
  
  watch: {
    visible(val) {
      this.dialogVisible = val;
      
      if (val && this.device) {
        this.initializeControls();
        
        if (this.isConnected) {
          this.refreshDeviceStatus();
        }
      }
    },
    
    dialogVisible(val) {
      if (val !== this.visible) {
        this.$emit('close');
      }
    }
  },
  
  methods: {
    close() {
      this.dialogVisible = false;
      this.$emit('close');
    },
    
    formatDeviceType(type) {
      return type.charAt(0) + type.slice(1).toLowerCase();
    },
    
    formatCapability(capability) {
      // Convert from UPPER_SNAKE_CASE to Title Case With Spaces
      return capability
        .split('_')
        .map(word => word.charAt(0) + word.slice(1).toLowerCase())
        .join(' ');
    },
    
    hasCapability(capability) {
      return this.device.capabilities && this.device.capabilities.includes(capability);
    },
    
    formatStatusKey(key) {
      // Convert from camelCase to Title Case With Spaces
      return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase());
    },
    
    formatStatusValue(key, value) {
      if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
      }
      
      if (key === 'status' && value === 'online') {
        return 'Online';
      }
      
      if (key === 'status' && value === 'offline') {
        return 'Offline';
      }
      
      if (key.includes('emperature')) {
        return `${value}°F`;
      }
      
      if (key.includes('umidity')) {
        return `${value}%`;
      }
      
      if (key === 'brightness' || key === 'volume' || key.includes('level')) {
        return `${value}%`;
      }
      
      return value;
    },
    
    isObject(value) {
      return value !== null && typeof value === 'object' && !Array.isArray(value);
    },
    
    async connectToDevice() {
      if (!this.device) return;
      
      this.connecting = true;
      try {
        await this.$store.dispatch('devices/connectToDevice', this.device.id);
        this.refreshDeviceStatus();
      } catch (error) {
        console.error('Failed to connect to device:', error);
      } finally {
        this.connecting = false;
      }
    },
    
    async disconnectFromDevice() {
      if (!this.device) return;
      
      this.disconnecting = true;
      try {
        await this.$store.dispatch('devices/disconnectFromDevice', this.device.id);
      } catch (error) {
        console.error('Failed to disconnect from device:', error);
      } finally {
        this.disconnecting = false;
      }
    },
    
    async refreshDeviceStatus() {
      if (!this.device || !this.isConnected) return;
      
      this.isLoadingStatus = true;
      try {
        const status = await this.$store.dispatch('devices/getDeviceStatus', this.device.id);
        this.deviceStatus = status;
        
        // Update controls based on status
        this.updateControlsFromStatus(status);
      } catch (error) {
        console.error('Failed to get device status:', error);
      } finally {
        this.isLoadingStatus = false;
      }
    },
    
    initializeControls() {
      if (!this.device) return;
      
      // Reset controls based on device type
      if (this.device.type === 'LIGHT') {
        this.controls.power = true;
        this.controls.brightness = 100;
        this.controls.color = {
          hue: 0,
          saturation: 0,
          brightness: 100,
          temperature: 4000
        };
      } else if (this.device.type === 'THERMOSTAT') {
        this.controls.temperature = 72;
        this.controls.modeIndex = 2; // Auto
      } else if (this.device.type === 'SPEAKER' || this.device.type === 'HEADPHONES') {
        this.controls.playing = false;
        this.controls.volume = 50;
        this.controls.genre = 'relaxing';
      }
    },
    
    updateControlsFromStatus(status) {
      if (!status) return;
      
      if (this.device.type === 'LIGHT') {
        this.controls.power = status.power || false;
        this.controls.brightness = status.brightness || 100;
        
        if (status.color) {
          this.controls.color = {
            ...this.controls.color,
            ...status.color
          };
        }
      } else if (this.device.type === 'THERMOSTAT') {
        this.controls.temperature = status.targetTemperature || 72;
        
        const modeIndex = this.controls.modes.indexOf(status.mode || 'auto');
        this.controls.modeIndex = modeIndex >= 0 ? modeIndex : 2;
      } else if (this.device.type === 'SPEAKER' || this.device.type === 'HEADPHONES') {
        this.controls.playing = status.playing || false;
        this.controls.volume = status.volume || 50;
      }
    },
    
    sendCommand(name, parameters) {
      if (!this.device || !this.isConnected) return;
      
      this.$store.dispatch('devices/sendCommand', {
        deviceId: this.device.id,
        command: {
          name,
          parameters
        }
      });
    },
    
    // Thermostat methods
    adjustTemperature(delta) {
      this.controls.temperature += delta;
      // Ensure within bounds
      this.controls.temperature = Math.min(85, Math.max(60, this.controls.temperature));
      this.sendCommand('setTemperature', { temp: this.controls.temperature });
    },
    
    setThermostatMode() {
      const mode = this.controls.modes[this.controls.modeIndex];
      this.sendCommand('setMode', { mode });
    },
    
    // Speaker methods
    togglePlayback() {
      if (this.controls.playing) {
        this.sendCommand('stop', {});
        this.controls.playing = false;
      } else {
        this.playGenre();
      }
    },
    
    playGenre() {
      this.sendCommand('playMusic', { genre: this.controls.genre });
      this.controls.playing = true;
    },
    
    toggleMute() {
      if (this.controls.volume > 0) {
        this.controls.previousVolume = this.controls.volume;
        this.controls.volume = 0;
      } else {
        this.controls.volume = this.controls.previousVolume || 50;
      }
      this.sendCommand('setVolume', { level: this.controls.volume });
    }
  }
}
</script>

<style scoped>
.warm-white {
  background-color: #ffd6aa !important;
}

.cool-white {
  background-color: #f5f5ff !important;
}

.color-presets {
  display: flex;
  flex-wrap: wrap;
}
</style>

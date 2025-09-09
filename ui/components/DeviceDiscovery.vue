<template>
  <v-container>
    <v-card class="mb-4">
      <v-toolbar flat color="primary" dark>
        <v-toolbar-title>{{ $t('device_discovery_title') }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn 
          icon
          @click="startDiscovery"
          :disabled="scanning"
        >
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
        <v-btn 
          icon
          @click="importDevicesFromSmartHome"
        >
          <v-icon>mdi-home-import-outline</v-icon>
        </v-btn>
      </v-toolbar>
      
      <v-card-text v-if="scanning" class="text-center pa-5">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
        <div class="mt-3">{{ $t('device_discovery_scanning') }}</div>
        <div class="caption">
          {{ discoveredDevices.length }} {{ discoveredDevices.length === 1 ? 'device' : 'devices' }} found
        </div>
        
        <v-btn
          class="mt-4"
          color="primary"
          text
          @click="stopDiscovery"
        >
          {{ $t('device_discovery_cancel') }}
        </v-btn>
      </v-card-text>
      
      <div v-else>
        <div v-if="discoveredDevices.length === 0" class="text-center pa-5">
          <v-icon x-large color="grey lighten-1">mdi-devices</v-icon>
          <div class="title mt-3">{{ $t('device_discovery_no_devices') }}</div>
          <div class="caption mt-1">Make sure your devices are turned on and in pairing mode</div>
          
          <v-btn
            class="mt-4"
            color="primary"
            @click="startDiscovery"
          >
            {{ $t('device_discovery_rescan') }}
          </v-btn>
        </div>
        
        <div v-else>
          <v-tabs v-model="activeTab">
            <v-tab>Wi-Fi</v-tab>
            <v-tab>Bluetooth</v-tab>
            <v-tab>ZigBee/Z-Wave</v-tab>
            <v-tab>Matter</v-tab>
          </v-tabs>
          
          <v-tabs-items v-model="activeTab">
            <v-tab-item v-for="(tabType, index) in ['wifi', 'bluetooth', 'zigbee_zwave', 'matter']" :key="index">
              <v-card flat>
                <v-list two-line>
                  <v-list-item-group>
                    <template v-for="(device, deviceIndex) in getDevicesByType(tabType)">
                      <v-list-item :key="device.id" @click="selectDevice(device)">
                        <v-list-item-avatar>
                          <v-icon>{{ getDeviceIcon(device) }}</v-icon>
                        </v-list-item-avatar>
                        
                        <v-list-item-content>
                          <v-list-item-title>{{ device.name }}</v-list-item-title>
                          <v-list-item-subtitle>
                            {{ getDeviceSubtitle(device) }}
                          </v-list-item-subtitle>
                        </v-list-item-content>
                        
                        <v-list-item-action>
                          <v-btn
                            small
                            outlined
                            color="primary"
                            @click.stop="addDevice(device)"
                            :disabled="isDeviceAdded(device)"
                            :loading="addingDeviceId === device.id"
                          >
                            {{ isDeviceAdded(device) ? 'Added' : $t('device_discovery_connect') }}
                          </v-btn>
                        </v-list-item-action>
                      </v-list-item>
                      
                      <v-divider 
                        v-if="deviceIndex < getDevicesByType(tabType).length - 1" 
                        :key="`divider-${device.id}`"
                      ></v-divider>
                    </template>
                  </v-list-item-group>
                </v-list>
                
                <div v-if="getDevicesByType(tabType).length === 0" class="text-center pa-4">
                  <v-icon color="grey lighten-1">mdi-help-circle-outline</v-icon>
                  <div class="caption mt-1">No {{ tabTypeToLabel(tabType) }} devices found</div>
                </div>
              </v-card>
            </v-tab-item>
          </v-tabs-items>
          
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              text
              @click="startDiscovery"
            >
              {{ $t('device_discovery_rescan') }}
            </v-btn>
            <v-btn
              color="primary"
              @click="closeDiscovery"
            >
              {{ $t('device_discovery_done') }}
            </v-btn>
          </v-card-actions>
        </div>
      </div>
    </v-card>
    
    <!-- Device Selection Dialog -->
    <v-dialog v-model="deviceDialog" max-width="500">
      <v-card v-if="selectedDevice">
        <v-card-title class="headline">
          {{ selectedDevice.name }}
        </v-card-title>
        
        <v-card-text>
          <v-list dense>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-subtitle>{{ $t('device_property_type') }}</v-list-item-subtitle>
                <v-list-item-title>{{ selectedDevice.type || 'Unknown' }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            
            <v-list-item v-if="selectedDevice.manufacturer">
              <v-list-item-content>
                <v-list-item-subtitle>{{ $t('device_property_manufacturer') }}</v-list-item-subtitle>
                <v-list-item-title>{{ selectedDevice.manufacturer }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            
            <v-list-item v-if="selectedDevice.model">
              <v-list-item-content>
                <v-list-item-subtitle>{{ $t('device_property_model') }}</v-list-item-subtitle>
                <v-list-item-title>{{ selectedDevice.model }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            
            <v-list-item>
              <v-list-item-content>
                <v-list-item-subtitle>{{ $t('device_property_protocol') }}</v-list-item-subtitle>
                <v-list-item-title>{{ selectedDevice.protocol }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            
            <v-list-item v-if="selectedDevice.ipAddress">
              <v-list-item-content>
                <v-list-item-subtitle>{{ $t('device_property_ip_address') }}</v-list-item-subtitle>
                <v-list-item-title>{{ selectedDevice.ipAddress }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            
            <v-list-item v-if="selectedDevice.bluetoothAddress">
              <v-list-item-content>
                <v-list-item-subtitle>{{ $t('device_property_bluetooth_address') }}</v-list-item-subtitle>
                <v-list-item-title>{{ selectedDevice.bluetoothAddress }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            
            <v-list-item v-if="selectedDevice.zigbeeAddress">
              <v-list-item-content>
                <v-list-item-subtitle>{{ $t('device_property_zigbee_address') }}</v-list-item-subtitle>
                <v-list-item-title>{{ selectedDevice.zigbeeAddress }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            
            <v-list-item v-if="selectedDevice.zwaveNodeId !== undefined">
              <v-list-item-content>
                <v-list-item-subtitle>{{ $t('device_property_zwave_id') }}</v-list-item-subtitle>
                <v-list-item-title>{{ selectedDevice.zwaveNodeId }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            
            <v-list-item v-if="selectedDevice.matterNodeId">
              <v-list-item-content>
                <v-list-item-subtitle>{{ $t('device_property_matter_id') }}</v-list-item-subtitle>
                <v-list-item-title>{{ selectedDevice.matterNodeId }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            
            <v-divider class="my-2"></v-divider>
            
            <v-list-item v-if="selectedDevice.capabilities && selectedDevice.capabilities.length > 0">
              <v-list-item-content>
                <v-list-item-subtitle>{{ $t('device_property_capabilities') }}</v-list-item-subtitle>
                <div class="mt-2">
                  <v-chip
                    v-for="capability in selectedDevice.capabilities"
                    :key="capability"
                    small
                    outlined
                    class="mr-1 mb-1"
                  >
                    {{ formatCapability(capability) }}
                  </v-chip>
                </div>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            text
            @click="deviceDialog = false"
          >
            {{ $t('action_close') }}
          </v-btn>
          <v-btn
            color="primary"
            @click="addDevice(selectedDevice)"
            :disabled="isDeviceAdded(selectedDevice)"
            :loading="addingDeviceId === selectedDevice.id"
          >
            {{ isDeviceAdded(selectedDevice) ? 'Added' : $t('device_discovery_connect') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- Smart Home Integration Dialog -->
    <v-dialog v-model="smartHomeDialog" max-width="500">
      <v-card>
        <v-card-title class="headline">
          {{ $t('smarthome_title') }}
        </v-card-title>
        
        <v-card-text>
          <v-list>
            <v-list-item 
              v-for="service in smartHomeServices" 
              :key="service.id"
              @click="selectSmartHomeService(service)"
            >
              <v-list-item-avatar>
                <v-icon>{{ service.icon }}</v-icon>
              </v-list-item-avatar>
              
              <v-list-item-content>
                <v-list-item-title>{{ service.name }}</v-list-item-title>
                <v-list-item-subtitle>
                  {{ service.linked ? 'Linked' : 'Not linked' }}
                </v-list-item-subtitle>
              </v-list-item-content>
              
              <v-list-item-action>
                <v-btn
                  small
                  outlined
                  :color="service.linked ? 'error' : 'primary'"
                  @click.stop="toggleSmartHomeService(service)"
                >
                  {{ service.linked ? $t('smarthome_unlink_service') : $t('smarthome_link_service') }}
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            text
            @click="smartHomeDialog = false"
          >
            {{ $t('action_close') }}
          </v-btn>
          <v-btn
            color="primary"
            :disabled="!hasLinkedService"
            @click="importFromSmartHome"
            :loading="importing"
          >
            {{ $t('smarthome_import_devices') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  name: 'DeviceDiscovery',
  
  data() {
    return {
      scanning: false,
      discoveredDevices: [],
      activeTab: 0,
      deviceDialog: false,
      selectedDevice: null,
      addingDeviceId: null,
      discoveryTimeout: null,
      
      smartHomeDialog: false,
      importing: false,
      smartHomeServices: [
        { 
          id: 'alexa', 
          name: this.$t('smarthome_service_alexa'), 
          icon: 'mdi-amazon-alexa',
          linked: false 
        },
        { 
          id: 'google_home', 
          name: this.$t('smarthome_service_google'), 
          icon: 'mdi-google-home',
          linked: false 
        },
        { 
          id: 'homekit', 
          name: this.$t('smarthome_service_homekit'), 
          icon: 'mdi-home-automation',
          linked: false 
        },
        { 
          id: 'smartthings', 
          name: this.$t('smarthome_service_smartthings'), 
          icon: 'mdi-samsung',
          linked: false 
        },
        { 
          id: 'home_assistant', 
          name: this.$t('smarthome_service_home_assistant'), 
          icon: 'mdi-home-assistant',
          linked: false 
        }
      ]
    };
  },
  
  computed: {
    hasLinkedService() {
      return this.smartHomeServices.some(service => service.linked);
    }
  },
  
  mounted() {
    this.loadSmartHomeStatus();
    // Auto-start discovery when component is mounted
    this.startDiscovery();
  },
  
  beforeDestroy() {
    // Clean up any timers or ongoing operations
    this.stopDiscovery();
  },
  
  methods: {
    startDiscovery() {
      if (this.scanning) return;
      
      this.scanning = true;
      
      // Reset or update discovered devices list
      // We don't clear the list completely to avoid flickering UI
      // and maintain already discovered devices
      
      // Simulate discovery progress
      // In a real implementation, this would be connected to actual device discovery APIs
      this.discoverWifiDevices();
      this.discoverBluetoothDevices();
      this.discoverZigbeeZwaveDevices();
      this.discoverMatterDevices();
      
      // Automatically stop scanning after 30 seconds
      this.discoveryTimeout = setTimeout(() => {
        this.stopDiscovery();
      }, 30000);
    },
    
    stopDiscovery() {
      this.scanning = false;
      if (this.discoveryTimeout) {
        clearTimeout(this.discoveryTimeout);
        this.discoveryTimeout = null;
      }
    },
    
    closeDiscovery() {
      this.stopDiscovery();
      this.$emit('close');
    },
    
    // Simulated discovery methods
    // In a real implementation, these would connect to actual device discovery APIs
    discoverWifiDevices() {
      // Simulate discovery of WiFi devices
      // This is where you would integrate with mDNS/Bonjour, UPnP, etc.
      setTimeout(() => {
        const newDevices = [
          {
            id: 'wifi-light-1',
            name: 'Living Room Light',
            type: 'LIGHT',
            manufacturer: 'Philips',
            model: 'Hue White',
            protocol: 'WiFi',
            ipAddress: '192.168.1.100',
            capabilities: ['BRIGHTNESS_CONTROL', 'ON_OFF'],
            connectionState: 'DISCOVERED'
          },
          {
            id: 'wifi-speaker-1',
            name: 'Kitchen Speaker',
            type: 'SPEAKER',
            manufacturer: 'Sonos',
            model: 'One',
            protocol: 'WiFi',
            ipAddress: '192.168.1.101',
            capabilities: ['AUDIO_PLAYBACK', 'VOLUME_CONTROL'],
            connectionState: 'DISCOVERED'
          },
          {
            id: 'wifi-tv-1',
            name: 'Living Room TV',
            type: 'TV',
            manufacturer: 'Samsung',
            model: 'Smart TV',
            protocol: 'WiFi',
            ipAddress: '192.168.1.102',
            capabilities: ['POWER_CONTROL', 'VOLUME_CONTROL', 'APP_LAUNCH'],
            connectionState: 'DISCOVERED'
          }
        ];
        
        this.addDiscoveredDevices(newDevices);
      }, 2000);
    },
    
    discoverBluetoothDevices() {
      // Simulate discovery of Bluetooth devices
      setTimeout(() => {
        const newDevices = [
          {
            id: 'bt-headphones-1',
            name: 'My Headphones',
            type: 'HEADPHONES',
            manufacturer: 'Sony',
            model: 'WH-1000XM4',
            protocol: 'Bluetooth',
            bluetoothAddress: '00:11:22:33:44:55',
            capabilities: ['AUDIO_PLAYBACK', 'VOLUME_CONTROL'],
            connectionState: 'DISCOVERED'
          },
          {
            id: 'bt-speaker-1',
            name: 'Portable Speaker',
            type: 'SPEAKER',
            manufacturer: 'JBL',
            model: 'Flip 5',
            protocol: 'Bluetooth',
            bluetoothAddress: '66:77:88:99:AA:BB',
            capabilities: ['AUDIO_PLAYBACK', 'VOLUME_CONTROL'],
            connectionState: 'DISCOVERED'
          }
        ];
        
        this.addDiscoveredDevices(newDevices);
      }, 3500);
    },
    
    discoverZigbeeZwaveDevices() {
      // Simulate discovery of ZigBee/Z-Wave devices
      setTimeout(() => {
        const newDevices = [
          {
            id: 'zigbee-light-1',
            name: 'Bedroom Light',
            type: 'LIGHT',
            manufacturer: 'IKEA',
            model: 'TRÅDFRI LED bulb',
            protocol: 'ZigBee',
            zigbeeAddress: '0x1234',
            capabilities: ['BRIGHTNESS_CONTROL', 'COLOR_CONTROL', 'ON_OFF'],
            connectionState: 'DISCOVERED'
          },
          {
            id: 'zwave-sensor-1',
            name: 'Front Door Sensor',
            type: 'CONTACT_SENSOR',
            manufacturer: 'Aeotec',
            model: 'Door Sensor 7',
            protocol: 'Z-Wave',
            zwaveNodeId: 5,
            capabilities: ['CONTACT_SENSING', 'BATTERY_LEVEL'],
            connectionState: 'DISCOVERED'
          },
          {
            id: 'zwave-thermostat-1',
            name: 'Living Room Thermostat',
            type: 'THERMOSTAT',
            manufacturer: 'Honeywell',
            model: 'Home T9',
            protocol: 'Z-Wave',
            zwaveNodeId: 7,
            capabilities: ['TEMPERATURE_CONTROL', 'HUMIDITY_SENSING', 'MODE_CONTROL'],
            connectionState: 'DISCOVERED'
          }
        ];
        
        this.addDiscoveredDevices(newDevices);
      }, 5000);
    },
    
    discoverMatterDevices() {
      // Simulate discovery of Matter devices
      setTimeout(() => {
        const newDevices = [
          {
            id: 'matter-light-1',
            name: 'Dining Room Light',
            type: 'LIGHT',
            manufacturer: 'GE',
            model: 'Cync Smart Light',
            protocol: 'Matter',
            matterNodeId: '0x12345',
            capabilities: ['BRIGHTNESS_CONTROL', 'COLOR_CONTROL', 'ON_OFF'],
            connectionState: 'DISCOVERED'
          },
          {
            id: 'matter-outlet-1',
            name: 'Kitchen Outlet',
            type: 'OUTLET',
            manufacturer: 'Eve',
            model: 'Energy',
            protocol: 'Matter',
            matterNodeId: '0x23456',
            capabilities: ['ON_OFF', 'POWER_MONITORING'],
            connectionState: 'DISCOVERED'
          }
        ];
        
        this.addDiscoveredDevices(newDevices);
      }, 6500);
    },
    
    addDiscoveredDevices(newDevices) {
      // Add new devices to the list, avoiding duplicates by ID
      newDevices.forEach(device => {
        const existingIndex = this.discoveredDevices.findIndex(d => d.id === device.id);
        if (existingIndex >= 0) {
          // Update existing device
          this.$set(this.discoveredDevices, existingIndex, device);
        } else {
          // Add new device
          this.discoveredDevices.push(device);
        }
      });
    },
    
    getDevicesByType(type) {
      // Filter devices by connection type (protocol)
      switch (type) {
        case 'wifi':
          return this.discoveredDevices.filter(d => d.protocol === 'WiFi');
        case 'bluetooth':
          return this.discoveredDevices.filter(d => d.protocol === 'Bluetooth');
        case 'zigbee_zwave':
          return this.discoveredDevices.filter(d => 
            d.protocol === 'ZigBee' || d.protocol === 'Z-Wave');
        case 'matter':
          return this.discoveredDevices.filter(d => d.protocol === 'Matter');
        default:
          return [];
      }
    },
    
    tabTypeToLabel(type) {
      switch (type) {
        case 'wifi': return 'Wi-Fi';
        case 'bluetooth': return 'Bluetooth';
        case 'zigbee_zwave': return 'ZigBee/Z-Wave';
        case 'matter': return 'Matter';
        default: return '';
      }
    },
    
    selectDevice(device) {
      this.selectedDevice = device;
      this.deviceDialog = true;
    },
    
    async addDevice(device) {
      this.addingDeviceId = device.id;
      
      try {
        // Add the device to the store
        await this.$store.dispatch('devices/addDevice', device);
        
        // Close the dialog if open
        if (this.deviceDialog && this.selectedDevice && this.selectedDevice.id === device.id) {
          this.deviceDialog = false;
        }
        
        // Show success notification
        this.$store.dispatch('notifications/showSuccess', {
          message: `Device ${device.name} has been added successfully.`,
          timeout: 3000
        });
      } catch (error) {
        console.error('Failed to add device:', error);
        
        // Show error notification
        this.$store.dispatch('notifications/showError', {
          message: `Failed to add device: ${error.message || 'Unknown error'}`,
          timeout: 5000
        });
      } finally {
        this.addingDeviceId = null;
      }
    },
    
    isDeviceAdded(device) {
      // Check if device is already in the store
      const addedDevices = this.$store.state.devices.devices;
      return addedDevices.some(d => d.id === device.id);
    },
    
    getDeviceIcon(device) {
      // Return appropriate icon based on device type
      switch (device.type) {
        case 'LIGHT': return 'mdi-lightbulb';
        case 'SWITCH': return 'mdi-toggle-switch';
        case 'OUTLET': return 'mdi-power-socket';
        case 'THERMOSTAT': return 'mdi-thermostat';
        case 'SPEAKER': return 'mdi-speaker';
        case 'TV': return 'mdi-television';
        case 'CAMERA': return 'mdi-cctv';
        case 'MOTION_SENSOR': return 'mdi-motion-sensor';
        case 'CONTACT_SENSOR': return 'mdi-door';
        case 'DOORBELL': return 'mdi-doorbell';
        case 'LOCK': return 'mdi-lock';
        case 'VACUUM': return 'mdi-robot-vacuum';
        case 'HEADPHONES': return 'mdi-headphones';
        default: return 'mdi-devices';
      }
    },
    
    getDeviceSubtitle(device) {
      // Generate a descriptive subtitle for the device
      let subtitle = device.type ? `${this.formatDeviceType(device.type)}` : '';
      
      if (device.manufacturer) {
        subtitle += subtitle ? ` • ${device.manufacturer}` : device.manufacturer;
      }
      
      if (device.protocol) {
        subtitle += subtitle ? ` • ${device.protocol}` : device.protocol;
      }
      
      return subtitle;
    },
    
    formatDeviceType(type) {
      // Convert from UPPER_SNAKE_CASE to Title Case
      return type
        .split('_')
        .map(word => word.charAt(0) + word.slice(1).toLowerCase())
        .join(' ');
    },
    
    formatCapability(capability) {
      // Convert from UPPER_SNAKE_CASE to Title Case With Spaces
      return capability
        .split('_')
        .map(word => word.charAt(0) + word.slice(1).toLowerCase())
        .join(' ');
    },
    
    // Smart Home Integration Methods
    importDevicesFromSmartHome() {
      this.smartHomeDialog = true;
    },
    
    loadSmartHomeStatus() {
      // Load the status of connected smart home services
      // This would connect to an API in a real implementation
      // For now, we'll simulate with mock data
      setTimeout(() => {
        // Simulate Alexa being connected
        const alexa = this.smartHomeServices.find(s => s.id === 'alexa');
        if (alexa) {
          alexa.linked = true;
        }
      }, 1000);
    },
    
    selectSmartHomeService(service) {
      // Show details or configuration for the service
      console.log('Selected service:', service);
      
      // This could open a configuration panel or authorization flow
    },
    
    async toggleSmartHomeService(service) {
      try {
        if (service.linked) {
          // Unlink service
          await this.$store.dispatch('devices/unlinkSmartHomeService', service.id);
          service.linked = false;
          
          this.$store.dispatch('notifications/showSuccess', {
            message: this.$t('smarthome_service_unlinked'),
            timeout: 3000
          });
        } else {
          // Link service - simulate OAuth flow
          // In a real app, this would redirect to the service's authorization page
          await this.simulateOAuth(service);
          service.linked = true;
          
          this.$store.dispatch('notifications/showSuccess', {
            message: this.$t('smarthome_service_linked'),
            timeout: 3000
          });
        }
      } catch (error) {
        console.error('Failed to toggle smart home service:', error);
        
        this.$store.dispatch('notifications/showError', {
          message: error.message || 'Failed to connect to service',
          timeout: 5000
        });
      }
    },
    
    simulateOAuth(service) {
      // Simulate OAuth authorization flow
      return new Promise((resolve, reject) => {
        // In a real implementation, this would open a browser window
        // to the service's OAuth authorization page
        setTimeout(() => {
          // Simulating successful authorization
          resolve();
          
          // Or simulating an error:
          // reject(new Error('Authorization failed. Please try again.'));
        }, 2000);
      });
    },
    
    async importFromSmartHome() {
      this.importing = true;
      
      try {
        // Get list of linked services
        const linkedServices = this.smartHomeServices
          .filter(s => s.linked)
          .map(s => s.id);
          
        if (linkedServices.length === 0) {
          throw new Error(this.$t('smarthome_authorize_required'));
        }
        
        // Import devices from linked services
        // This would be an API call in a real implementation
        const importedDevices = await this.simulateDeviceImport(linkedServices);
        
        // Add imported devices to discovery list
        this.addDiscoveredDevices(importedDevices);
        
        // Close the dialog
        this.smartHomeDialog = false;
        
        // Show success notification
        this.$store.dispatch('notifications/showSuccess', {
          message: this.$t('smarthome_devices_imported'),
          timeout: 3000
        });
      } catch (error) {
        console.error('Failed to import devices:', error);
        
        this.$store.dispatch('notifications/showError', {
          message: error.message || 'Failed to import devices',
          timeout: 5000
        });
      } finally {
        this.importing = false;
      }
    },
    
    simulateDeviceImport(services) {
      // Simulate importing devices from smart home services
      return new Promise((resolve) => {
        setTimeout(() => {
          // Create mock imported devices based on the services
          const importedDevices = [];
          
          if (services.includes('alexa')) {
            importedDevices.push({
              id: 'alexa-light-1',
              name: 'Office Light (Alexa)',
              type: 'LIGHT',
              manufacturer: 'Amazon',
              model: 'Echo Light',
              protocol: 'WiFi',
              ipAddress: '192.168.1.120',
              capabilities: ['BRIGHTNESS_CONTROL', 'COLOR_CONTROL', 'ON_OFF'],
              connectionState: 'DISCOVERED',
              source: 'alexa'
            });
          }
          
          if (services.includes('google_home')) {
            importedDevices.push({
              id: 'google-speaker-1',
              name: 'Bedroom Speaker (Google)',
              type: 'SPEAKER',
              manufacturer: 'Google',
              model: 'Nest Audio',
              protocol: 'WiFi',
              ipAddress: '192.168.1.130',
              capabilities: ['AUDIO_PLAYBACK', 'VOLUME_CONTROL'],
              connectionState: 'DISCOVERED',
              source: 'google_home'
            });
          }
          
          resolve(importedDevices);
        }, 3000);
      });
    }
  }
};
</script>

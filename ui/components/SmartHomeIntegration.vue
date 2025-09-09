<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-toolbar flat color="primary" dark>
            <v-toolbar-title>{{ $t('smarthome_title') }}</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon @click="refresh">
              <v-icon>mdi-refresh</v-icon>
            </v-btn>
          </v-toolbar>
          
          <v-card-text>
            <v-alert
              type="info"
              text
              outlined
              class="mb-4"
            >
              Connect to your favorite smart home platforms to access and control all your devices in one place.
            </v-alert>
            
            <v-list two-line>
              <v-list-item
                v-for="service in smartHomeServices"
                :key="service.id"
                @click="showServiceDetails(service)"
              >
                <v-list-item-avatar>
                  <v-icon :color="service.color">{{ service.icon }}</v-icon>
                </v-list-item-avatar>
                
                <v-list-item-content>
                  <v-list-item-title>{{ service.name }}</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ service.connected ? 'Connected' : 'Not connected' }}
                    <span v-if="service.deviceCount && service.connected">
                      • {{ service.deviceCount }} {{ service.deviceCount === 1 ? 'device' : 'devices' }}
                    </span>
                  </v-list-item-subtitle>
                </v-list-item-content>
                
                <v-list-item-action>
                  <v-switch
                    v-model="service.connected"
                    @change="toggleServiceConnection(service)"
                    color="primary"
                  ></v-switch>
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- Service Details Dialog -->
    <v-dialog v-model="serviceDialog" max-width="700">
      <v-card v-if="selectedService">
        <v-card-title class="headline">
          {{ selectedService.name }}
        </v-card-title>
        
        <v-tabs v-model="activeTab">
          <v-tab>Devices</v-tab>
          <v-tab>Settings</v-tab>
          <v-tab>Authentication</v-tab>
        </v-tabs>
        
        <v-tabs-items v-model="activeTab">
          <!-- Devices Tab -->
          <v-tab-item>
            <v-card-text v-if="!selectedService.connected">
              <v-alert
                type="warning"
                text
                outlined
              >
                Connect to {{ selectedService.name }} to view and import devices.
              </v-alert>
            </v-card-text>
            
            <v-card-text v-else-if="loading">
              <div class="text-center pa-4">
                <v-progress-circular
                  indeterminate
                  color="primary"
                ></v-progress-circular>
                <div class="mt-2">Loading devices...</div>
              </div>
            </v-card-text>
            
            <div v-else>
              <v-card-text v-if="serviceDevices.length === 0">
                <v-alert
                  type="info"
                  text
                  outlined
                >
                  No devices found for this service. Make sure your devices are set up in the {{ selectedService.name }} app.
                </v-alert>
              </v-card-text>
              
              <v-list v-else two-line>
                <v-list-item
                  v-for="device in serviceDevices"
                  :key="device.id"
                >
                  <v-list-item-avatar>
                    <v-icon>{{ getDeviceIcon(device.type) }}</v-icon>
                  </v-list-item-avatar>
                  
                  <v-list-item-content>
                    <v-list-item-title>{{ device.name }}</v-list-item-title>
                    <v-list-item-subtitle>{{ formatDeviceType(device.type) }}</v-list-item-subtitle>
                  </v-list-item-content>
                  
                  <v-list-item-action>
                    <v-checkbox
                      v-model="device.selected"
                      color="primary"
                    ></v-checkbox>
                  </v-list-item-action>
                </v-list-item>
              </v-list>
              
              <v-card-actions class="pt-0">
                <v-spacer></v-spacer>
                <v-btn
                  color="primary"
                  text
                  @click="selectAllDevices"
                >
                  Select All
                </v-btn>
                <v-btn
                  color="primary"
                  text
                  @click="deselectAllDevices"
                >
                  Deselect All
                </v-btn>
                <v-btn
                  color="primary"
                  @click="importSelectedDevices"
                  :disabled="!hasSelectedDevices"
                  :loading="importing"
                >
                  Import Selected
                </v-btn>
              </v-card-actions>
            </div>
          </v-tab-item>
          
          <!-- Settings Tab -->
          <v-tab-item>
            <v-card-text>
              <v-list>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Auto-discovery</v-list-item-title>
                    <v-list-item-subtitle>Automatically discover new devices</v-list-item-subtitle>
                  </v-list-item-content>
                  
                  <v-list-item-action>
                    <v-switch
                      v-model="selectedService.settings.autoDiscovery"
                      @change="updateServiceSettings"
                      color="primary"
                    ></v-switch>
                  </v-list-item-action>
                </v-list-item>
                
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Auto-sync</v-list-item-title>
                    <v-list-item-subtitle>Keep device states in sync</v-list-item-subtitle>
                  </v-list-item-content>
                  
                  <v-list-item-action>
                    <v-switch
                      v-model="selectedService.settings.autoSync"
                      @change="updateServiceSettings"
                      color="primary"
                    ></v-switch>
                  </v-list-item-action>
                </v-list-item>
                
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Sync interval</v-list-item-title>
                    <v-list-item-subtitle>How often to sync device states</v-list-item-subtitle>
                  </v-list-item-content>
                  
                  <v-list-item-action class="flex-row" style="min-width: 150px">
                    <v-select
                      v-model="selectedService.settings.syncInterval"
                      :items="syncIntervals"
                      @change="updateServiceSettings"
                      dense
                      outlined
                      hide-details
                      :disabled="!selectedService.settings.autoSync"
                    ></v-select>
                  </v-list-item-action>
                </v-list-item>
                
                <v-divider class="my-3"></v-divider>
                
                <v-subheader>Device Visibility</v-subheader>
                
                <v-list-item v-for="(value, key) in selectedService.settings.deviceTypes" :key="key">
                  <v-list-item-content>
                    <v-list-item-title>{{ formatDeviceTypeKey(key) }}</v-list-item-title>
                    <v-list-item-subtitle>Show in device lists</v-list-item-subtitle>
                  </v-list-item-content>
                  
                  <v-list-item-action>
                    <v-switch
                      v-model="selectedService.settings.deviceTypes[key]"
                      @change="updateServiceSettings"
                      color="primary"
                    ></v-switch>
                  </v-list-item-action>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-tab-item>
          
          <!-- Authentication Tab -->
          <v-tab-item>
            <v-card-text>
              <v-alert
                v-if="selectedService.connected"
                type="success"
                text
                outlined
                class="mb-4"
              >
                Your account is linked to {{ selectedService.name }}.
              </v-alert>
              
              <v-alert
                v-else
                type="info"
                text
                outlined
                class="mb-4"
              >
                Connect your {{ selectedService.name }} account to access your devices.
              </v-alert>
              
              <v-list>
                <v-list-item v-if="selectedService.connected">
                  <v-list-item-content>
                    <v-list-item-title>Account</v-list-item-title>
                    <v-list-item-subtitle>{{ selectedService.account || 'Unknown' }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                
                <v-list-item v-if="selectedService.connected">
                  <v-list-item-content>
                    <v-list-item-title>Connected since</v-list-item-title>
                    <v-list-item-subtitle>{{ formatDate(selectedService.connectedAt) }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Permissions</v-list-item-title>
                    <v-list-item-subtitle>Device control, status reading</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                
                <v-list-item v-if="selectedService.connected">
                  <v-list-item-content>
                    <v-list-item-title>Token expiration</v-list-item-title>
                    <v-list-item-subtitle>{{ formatDate(selectedService.tokenExpiration) }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
              
              <div class="text-center mt-4">
                <v-btn
                  v-if="selectedService.connected"
                  color="error"
                  outlined
                  @click="disconnectService"
                  :loading="connecting"
                >
                  Disconnect {{ selectedService.name }}
                </v-btn>
                
                <v-btn
                  v-else
                  color="primary"
                  @click="connectService"
                  :loading="connecting"
                >
                  Connect to {{ selectedService.name }}
                </v-btn>
              </div>
            </v-card-text>
          </v-tab-item>
        </v-tabs-items>
        
        <v-divider></v-divider>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            text
            @click="serviceDialog = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  name: 'SmartHomeIntegration',
  
  data() {
    return {
      smartHomeServices: [
        {
          id: 'alexa',
          name: 'Amazon Alexa',
          icon: 'mdi-amazon-alexa',
          color: '#00CAFF',
          connected: false,
          deviceCount: 0,
          account: '',
          connectedAt: null,
          tokenExpiration: null,
          settings: {
            autoDiscovery: true,
            autoSync: true,
            syncInterval: '5 minutes',
            deviceTypes: {
              lights: true,
              switches: true,
              thermostats: true,
              speakers: true,
              cameras: false,
              sensors: true
            }
          }
        },
        {
          id: 'google_home',
          name: 'Google Home',
          icon: 'mdi-google-home',
          color: '#4285F4',
          connected: false,
          deviceCount: 0,
          account: '',
          connectedAt: null,
          tokenExpiration: null,
          settings: {
            autoDiscovery: true,
            autoSync: true,
            syncInterval: '5 minutes',
            deviceTypes: {
              lights: true,
              switches: true,
              thermostats: true,
              speakers: true,
              cameras: false,
              sensors: true
            }
          }
        },
        {
          id: 'homekit',
          name: 'Apple HomeKit',
          icon: 'mdi-home-automation',
          color: '#FF9500',
          connected: false,
          deviceCount: 0,
          account: '',
          connectedAt: null,
          tokenExpiration: null,
          settings: {
            autoDiscovery: true,
            autoSync: true,
            syncInterval: '5 minutes',
            deviceTypes: {
              lights: true,
              switches: true,
              thermostats: true,
              speakers: true,
              cameras: false,
              sensors: true
            }
          }
        },
        {
          id: 'smartthings',
          name: 'Samsung SmartThings',
          icon: 'mdi-samsung',
          color: '#1E88E5',
          connected: false,
          deviceCount: 0,
          account: '',
          connectedAt: null,
          tokenExpiration: null,
          settings: {
            autoDiscovery: true,
            autoSync: true,
            syncInterval: '5 minutes',
            deviceTypes: {
              lights: true,
              switches: true,
              thermostats: true,
              speakers: true,
              cameras: false,
              sensors: true
            }
          }
        },
        {
          id: 'home_assistant',
          name: 'Home Assistant',
          icon: 'mdi-home-assistant',
          color: '#03A9F4',
          connected: false,
          deviceCount: 0,
          account: '',
          connectedAt: null,
          tokenExpiration: null,
          settings: {
            autoDiscovery: true,
            autoSync: true,
            syncInterval: '5 minutes',
            deviceTypes: {
              lights: true,
              switches: true,
              thermostats: true,
              speakers: true,
              cameras: false,
              sensors: true
            }
          }
        }
      ],
      serviceDialog: false,
      selectedService: null,
      activeTab: 0,
      loading: false,
      importing: false,
      connecting: false,
      serviceDevices: [],
      syncIntervals: [
        '1 minute',
        '5 minutes',
        '15 minutes',
        '30 minutes',
        '1 hour',
        'Manual only'
      ]
    };
  },
  
  computed: {
    hasSelectedDevices() {
      return this.serviceDevices.some(d => d.selected);
    }
  },
  
  mounted() {
    this.loadServiceStatus();
  },
  
  methods: {
    refresh() {
      this.loadServiceStatus();
    },
    
    loadServiceStatus() {
      // In a real implementation, this would fetch the current status from the backend
      // For now, we'll simulate with mock data
      setTimeout(() => {
        // Simulate Alexa being connected
        const alexa = this.smartHomeServices.find(s => s.id === 'alexa');
        if (alexa) {
          alexa.connected = true;
          alexa.deviceCount = 5;
          alexa.account = 'user@example.com';
          alexa.connectedAt = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
          alexa.tokenExpiration = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
        }
      }, 1000);
    },
    
    showServiceDetails(service) {
      this.selectedService = JSON.parse(JSON.stringify(service)); // Deep copy
      this.serviceDialog = true;
      this.activeTab = 0;
      
      // Load devices if service is connected
      if (service.connected) {
        this.loadServiceDevices(service.id);
      }
    },
    
    loadServiceDevices(serviceId) {
      this.loading = true;
      this.serviceDevices = [];
      
      // Simulate API call to fetch devices for the service
      setTimeout(() => {
        if (serviceId === 'alexa') {
          this.serviceDevices = [
            {
              id: 'alexa-light-1',
              name: 'Living Room Light',
              type: 'LIGHT',
              selected: false
            },
            {
              id: 'alexa-light-2',
              name: 'Bedroom Light',
              type: 'LIGHT',
              selected: false
            },
            {
              id: 'alexa-speaker-1',
              name: 'Echo Dot',
              type: 'SPEAKER',
              selected: false
            },
            {
              id: 'alexa-thermostat-1',
              name: 'Living Room Thermostat',
              type: 'THERMOSTAT',
              selected: false
            },
            {
              id: 'alexa-switch-1',
              name: 'Kitchen Switch',
              type: 'SWITCH',
              selected: false
            }
          ];
        } else if (serviceId === 'google_home') {
          this.serviceDevices = [
            {
              id: 'google-light-1',
              name: 'Kitchen Light',
              type: 'LIGHT',
              selected: false
            },
            {
              id: 'google-speaker-1',
              name: 'Google Nest',
              type: 'SPEAKER',
              selected: false
            }
          ];
        } else {
          // Empty for other services in this demo
          this.serviceDevices = [];
        }
        
        this.loading = false;
      }, 1500);
    },
    
    async toggleServiceConnection(service) {
      // In a real implementation, this would connect/disconnect from the service
      if (service.connected) {
        await this.disconnectFromService(service);
      } else {
        await this.connectToService(service);
      }
      
      // Update the main service list with the new status
      const index = this.smartHomeServices.findIndex(s => s.id === service.id);
      if (index >= 0) {
        this.$set(this.smartHomeServices, index, {
          ...this.smartHomeServices[index],
          connected: service.connected,
          deviceCount: service.deviceCount,
          account: service.account,
          connectedAt: service.connectedAt,
          tokenExpiration: service.tokenExpiration
        });
      }
    },
    
    async connectToService(service) {
      // Simulate connecting to the service
      // In a real implementation, this would initiate an OAuth flow
      service.connected = true;
      service.deviceCount = service.id === 'alexa' ? 5 : (service.id === 'google_home' ? 2 : 0);
      service.account = 'user@example.com';
      service.connectedAt = new Date();
      service.tokenExpiration = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    },
    
    async disconnectFromService(service) {
      // Simulate disconnecting from the service
      service.connected = false;
      service.deviceCount = 0;
      service.account = '';
      service.connectedAt = null;
      service.tokenExpiration = null;
    },
    
    connectService() {
      this.connecting = true;
      
      // Simulate connecting to the service
      setTimeout(async () => {
        try {
          await this.connectToService(this.selectedService);
          
          // Update the main service list
          const index = this.smartHomeServices.findIndex(s => s.id === this.selectedService.id);
          if (index >= 0) {
            this.$set(this.smartHomeServices, index, {
              ...this.smartHomeServices[index],
              connected: true,
              deviceCount: this.selectedService.deviceCount,
              account: this.selectedService.account,
              connectedAt: this.selectedService.connectedAt,
              tokenExpiration: this.selectedService.tokenExpiration
            });
          }
          
          // Load devices for the newly connected service
          this.loadServiceDevices(this.selectedService.id);
          
          // Switch to devices tab
          this.activeTab = 0;
          
          // Show success notification
          this.$store.dispatch('notifications/showSuccess', {
            message: `Connected to ${this.selectedService.name} successfully.`,
            timeout: 3000
          });
        } catch (error) {
          console.error('Connection error:', error);
          
          // Show error notification
          this.$store.dispatch('notifications/showError', {
            message: `Failed to connect to ${this.selectedService.name}: ${error.message || 'Unknown error'}`,
            timeout: 5000
          });
        } finally {
          this.connecting = false;
        }
      }, 2000);
    },
    
    disconnectService() {
      this.connecting = true;
      
      // Simulate disconnecting from the service
      setTimeout(async () => {
        try {
          await this.disconnectFromService(this.selectedService);
          
          // Update the main service list
          const index = this.smartHomeServices.findIndex(s => s.id === this.selectedService.id);
          if (index >= 0) {
            this.$set(this.smartHomeServices, index, {
              ...this.smartHomeServices[index],
              connected: false,
              deviceCount: 0,
              account: '',
              connectedAt: null,
              tokenExpiration: null
            });
          }
          
          // Clear devices list
          this.serviceDevices = [];
          
          // Show success notification
          this.$store.dispatch('notifications/showSuccess', {
            message: `Disconnected from ${this.selectedService.name}.`,
            timeout: 3000
          });
        } catch (error) {
          console.error('Disconnection error:', error);
          
          // Show error notification
          this.$store.dispatch('notifications/showError', {
            message: `Failed to disconnect from ${this.selectedService.name}: ${error.message || 'Unknown error'}`,
            timeout: 5000
          });
        } finally {
          this.connecting = false;
        }
      }, 1000);
    },
    
    selectAllDevices() {
      this.serviceDevices.forEach(device => {
        device.selected = true;
      });
    },
    
    deselectAllDevices() {
      this.serviceDevices.forEach(device => {
        device.selected = false;
      });
    },
    
    importSelectedDevices() {
      const selectedDevices = this.serviceDevices.filter(d => d.selected);
      if (selectedDevices.length === 0) return;
      
      this.importing = true;
      
      // Simulate importing devices
      setTimeout(async () => {
        try {
          // Convert to full device objects
          const devicesToImport = selectedDevices.map(d => {
            const fullDevice = {
              id: d.id,
              name: d.name,
              type: d.type,
              manufacturer: this.getManufacturerFromService(),
              protocol: 'WiFi',
              connectionState: 'DISCOVERED',
              source: this.selectedService.id
            };
            
            // Add device-specific properties
            if (d.type === 'LIGHT') {
              fullDevice.capabilities = ['BRIGHTNESS_CONTROL', 'ON_OFF'];
            } else if (d.type === 'SWITCH') {
              fullDevice.capabilities = ['ON_OFF'];
            } else if (d.type === 'THERMOSTAT') {
              fullDevice.capabilities = ['TEMPERATURE_CONTROL', 'MODE_CONTROL'];
            } else if (d.type === 'SPEAKER') {
              fullDevice.capabilities = ['AUDIO_PLAYBACK', 'VOLUME_CONTROL'];
            }
            
            return fullDevice;
          });
          
          // Add devices to store
          for (const device of devicesToImport) {
            await this.$store.dispatch('devices/addDevice', device);
          }
          
          // Update device count in service
          this.selectedService.deviceCount = (this.selectedService.deviceCount || 0) + selectedDevices.length;
          
          // Update the main service list
          const index = this.smartHomeServices.findIndex(s => s.id === this.selectedService.id);
          if (index >= 0) {
            this.$set(this.smartHomeServices[index], 'deviceCount', this.selectedService.deviceCount);
          }
          
          // Close dialog
          this.serviceDialog = false;
          
          // Show success notification
          this.$store.dispatch('notifications/showSuccess', {
            message: `Imported ${selectedDevices.length} devices from ${this.selectedService.name}.`,
            timeout: 3000
          });
        } catch (error) {
          console.error('Import error:', error);
          
          // Show error notification
          this.$store.dispatch('notifications/showError', {
            message: `Failed to import devices: ${error.message || 'Unknown error'}`,
            timeout: 5000
          });
        } finally {
          this.importing = false;
        }
      }, 2000);
    },
    
    getManufacturerFromService() {
      // Return manufacturer name based on service
      switch (this.selectedService.id) {
        case 'alexa': return 'Amazon';
        case 'google_home': return 'Google';
        case 'homekit': return 'Apple';
        case 'smartthings': return 'Samsung';
        case 'home_assistant': return '';
        default: return '';
      }
    },
    
    updateServiceSettings() {
      // In a real implementation, this would save settings to the backend
      console.log('Updating settings for', this.selectedService.name, this.selectedService.settings);
      
      // Show success notification
      this.$store.dispatch('notifications/showSuccess', {
        message: `Settings updated for ${this.selectedService.name}.`,
        timeout: 2000
      });
      
      // Update the main service list with the new settings
      const index = this.smartHomeServices.findIndex(s => s.id === this.selectedService.id);
      if (index >= 0) {
        this.$set(this.smartHomeServices[index], 'settings', JSON.parse(JSON.stringify(this.selectedService.settings)));
      }
    },
    
    getDeviceIcon(type) {
      // Return appropriate icon based on device type
      switch (type) {
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
    
    formatDeviceType(type) {
      // Convert from UPPER_SNAKE_CASE to Title Case
      return type
        .split('_')
        .map(word => word.charAt(0) + word.slice(1).toLowerCase())
        .join(' ');
    },
    
    formatDeviceTypeKey(key) {
      // Convert from camelCase to Title Case
      return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase());
    },
    
    formatDate(date) {
      if (!date) return 'N/A';
      
      // Format date as "Month Day, Year"
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(date).toLocaleDateString(undefined, options);
    }
  }
};
</script>

<!-- Migrated and enhanced from sallie_1.00/ui/components/DeviceControl.vue -->
<template>
  <div class="device-control">
    <h3>Device Control</h3>
    <slot></slot>
  </div>
</template>
<script>
export default {
  name: 'DeviceControl',
  props: {
    devices: {
      type: Array,
      default: () => []
    },
    theme: {
      type: String,
      default: 'light'
    }
  },
  data() {
    return {
      selectedDevice: null,
      error: '',
      loading: false,
      analytics: [],
      controlState: {},
    };
  },
  methods: {
    selectDevice(device) {
      this.selectedDevice = device;
      this.logAnalytics('device_selected', { device });
    },
    async controlDevice(device, action) {
      this.loading = true;
      this.error = '';
      try {
        // Simulate device control logic
        await new Promise(resolve => setTimeout(resolve, 500));
        this.controlState[device.id] = action;
        this.logAnalytics('device_control', { device, action });
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
.device-control {
  background: var(--background-secondary, #1e293b);
  border-radius: var(--border-radius, 8px);
  box-shadow: var(--shadow-md, 0 4px 6px -1px rgb(0 0 0 / 0.1));
  padding: 1em;
  margin: 1em 0;
  color: var(--text-primary, #f8fafc);
}
</style>


<!-- Migrated and enhanced from sallie_1.00/ui/components/DeviceControl.vue -->
<template>
  <div class="device-control">
    <h3>Device Control</h3>
    <slot></slot>
  </div>
</template>
<script>
export default {
  name: 'DeviceControl',
  props: {
    devices: {
      type: Array,
      default: () => []
    },
    theme: {
      type: String,
      default: 'light'
    }
  },
  data() {
    return {
      selectedDevice: null,
      error: '',
      loading: false,
      analytics: [],
      controlState: {},
    };
  },
  methods: {
    selectDevice(device) {
      this.selectedDevice = device;
      this.logAnalytics('device_selected', { device });
    },
    async controlDevice(device, action) {
      this.loading = true;
      this.error = '';
      try {
        // Simulate device control logic
        await new Promise(resolve => setTimeout(resolve, 500));
        this.controlState[device.id] = action;
        this.logAnalytics('device_control', { device, action });
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
.device-control {
  background: var(--background-secondary, #1e293b);
  border-radius: var(--border-radius, 8px);
  box-shadow: var(--shadow-md, 0 4px 6px -1px rgb(0 0 0 / 0.1));
  padding: 1em;
  margin: 1em 0;
  color: var(--text-primary, #f8fafc);
}
</style>


<template>
  <div class="device-control-container">
    <h2 class="title">
      <span>Device Control</span>
      <v-chip v-if="isDiscovering" color="primary" small>Discovering...</v-chip>
    </h2>

    <!-- Action Bar -->
    <div class="action-bar">
      <v-btn
        color="primary"
        :disabled="isDiscovering || systemState === 'DISABLED'"
        @click="startDeviceDiscovery"
      >
        <v-icon left>mdi-magnify</v-icon>
        Discover Devices
      </v-btn>

      <v-btn 
        color="secondary" 
        :disabled="isDiscovering || systemState === 'DISABLED'"
        @click="createAutomationDialog = true"
      >
        <v-icon left>mdi-robot</v-icon>
        Create Automation
      </v-btn>

      <v-btn 
        v-if="isDiscovering"
        color="error"
        @click="stopDeviceDiscovery"
      >
        <v-icon left>mdi-stop</v-icon>
        Stop Discovery
      </v-btn>
    </div>

    <!-- Device Categories -->
    <div class="device-categories">
      <v-tabs v-model="activeTab" background-color="transparent">
        <v-tab v-for="category in deviceCategories" :key="category.type">
          <v-icon left>{{ category.icon }}</v-icon>
          {{ category.label }}
          <v-chip
            v-if="getCategoryDeviceCount(category.type) > 0"
            class="ml-2"
            x-small
            color="primary"
          >{{ getCategoryDeviceCount(category.type) }}</v-chip>
        </v-tab>
      </v-tabs>
    </div>

    <!-- Device Grid -->
    <v-tabs-items v-model="activeTab">
      <v-tab-item v-for="category in deviceCategories" :key="category.type">
        <div v-if="getCategoryDeviceCount(category.type) === 0" class="no-devices">
          <v-icon large color="grey lighten-1">{{ category.icon }}</v-icon>
          <p>No {{ category.label.toLowerCase() }} devices found</p>
          <v-btn color="primary" text @click="startDeviceDiscovery">
            Discover Devices
          </v-btn>
        </div>
        <div v-else class="device-grid">
          <device-card
            v-for="device in getDevicesByCategory(category.type)"
            :key="device.id"
            :device="device"
            @connect="connectToDevice"
            @disconnect="disconnectFromDevice"
            @send-command="sendDeviceCommand"
          />
        </div>
      </v-tab-item>
    </v-tabs-items>

    <!-- Recommendations Card -->
    <v-card class="recommendations-card mt-4" v-if="recommendations.length > 0">
      <v-card-title>
        <v-icon left color="amber darken-2">mdi-lightbulb-on</v-icon>
        Recommendations
      </v-card-title>
      <v-card-text>
        <p class="subtitle-1">Based on {{ currentContextDescription }}</p>
        <v-list dense>
          <v-list-item v-for="(recommendation, index) in recommendations" :key="index">
            <v-list-item-avatar>
              <v-icon :color="getDeviceIconColor(recommendation.deviceId)">
                {{ getDeviceIcon(recommendation.deviceId) }}
              </v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>{{ recommendation.action }}</v-list-item-title>
              <v-list-item-subtitle>{{ recommendation.deviceName }} - {{ recommendation.reason }}</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn 
                small 
                color="primary"
                @click="applyRecommendation(recommendation)"
              >Apply</v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>

    <!-- Events Timeline -->
    <v-expansion-panels class="mt-4">
      <v-expansion-panel>
        <v-expansion-panel-header>
          <div class="d-flex align-center">
            <v-icon left>mdi-history</v-icon>
            Device Activity
            <v-badge 
              :content="recentEvents.length.toString()" 
              :value="recentEvents.length"
              color="primary"
              offset-x="10"
              offset-y="10"
            ></v-badge>
          </div>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-timeline dense class="events-timeline">
            <v-timeline-item
              v-for="(event, index) in recentEvents"
              :key="index"
              :color="getEventColor(event)"
              small
            >
              <div class="event-item">
                <span class="event-time">{{ formatEventTime(event.timestamp) }}</span>
                <span class="event-message">{{ event.message }}</span>
              </div>
            </v-timeline-item>
          </v-timeline>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>

    <!-- Automation Rules Panel -->
    <v-expansion-panels class="mt-4">
      <v-expansion-panel>
        <v-expansion-panel-header>
          <div class="d-flex align-center">
            <v-icon left>mdi-robot</v-icon>
            Automation Rules
            <v-badge 
              :content="automationRules.length.toString()" 
              :value="automationRules.length"
              color="primary"
              offset-x="10"
              offset-y="10"
            ></v-badge>
          </div>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-card v-for="rule in automationRules" :key="rule.id" class="mb-3">
            <v-card-title class="py-1">
              {{ rule.name }}
              <v-spacer></v-spacer>
              <v-switch
                v-model="rule.active"
                @change="updateAutomationRule(rule.id, rule)"
                dense
                hide-details
                color="success"
              ></v-switch>
            </v-card-title>
            <v-card-subtitle>{{ rule.description }}</v-card-subtitle>
            <v-card-text>
              <div class="automation-details">
                <div>
                  <strong>Triggers:</strong>
                  <span v-for="(trigger, index) in rule.triggers" :key="index" class="trigger-chip">
                    {{ formatTrigger(trigger) }}
                  </span>
                </div>
                <div>
                  <strong>Actions:</strong>
                  <span v-for="(action, index) in rule.actions" :key="index" class="action-chip">
                    {{ formatAction(action) }}
                  </span>
                </div>
              </div>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="error"
                text
                @click="deleteAutomationRule(rule.id)"
              >
                <v-icon left>mdi-delete</v-icon>
                Delete
              </v-btn>
            </v-card-actions>
          </v-card>

          <div v-if="automationRules.length === 0" class="text-center pa-4">
            <v-icon large color="grey lighten-1">mdi-robot-off</v-icon>
            <p>No automation rules configured</p>
            <v-btn color="primary" @click="createAutomationDialog = true">
              Create Automation Rule
            </v-btn>
          </div>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>

    <!-- Create Automation Dialog -->
    <v-dialog v-model="createAutomationDialog" max-width="600">
      <v-card>
        <v-card-title>
          <v-icon left>mdi-robot</v-icon>
          Create Automation Rule
        </v-card-title>
        <v-card-text>
          <v-form ref="automationForm">
            <v-text-field
              v-model="newRule.name"
              label="Rule Name"
              required
              :rules="[v => !!v || 'Name is required']"
            ></v-text-field>
            
            <v-textarea
              v-model="newRule.description"
              label="Description"
              rows="2"
            ></v-textarea>
            
            <v-subheader>Triggers</v-subheader>
            <div v-for="(trigger, index) in newRule.triggers" :key="'trigger-'+index" class="trigger-container">
              <v-select
                v-model="trigger.type"
                label="Trigger Type"
                :items="triggerTypes"
                item-text="label"
                item-value="type"
                @change="updateTrigger(index, trigger.type)"
              ></v-select>
              
              <div v-if="trigger.type === 'time'">
                <v-row>
                  <v-col cols="6">
                    <v-text-field
                      v-model="trigger.data.hour"
                      label="Hour (0-23)"
                      type="number"
                      min="0"
                      max="23"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      v-model="trigger.data.minute"
                      label="Minute (0-59)"
                      type="number"
                      min="0"
                      max="59"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-chip-group
                  v-model="trigger.data.daysOfWeek"
                  column
                  multiple
                >
                  <v-chip
                    v-for="day in weekDays"
                    :key="day.value"
                    :value="day.value"
                    filter
                    outlined
                  >
                    {{ day.label }}
                  </v-chip>
                </v-chip-group>
              </div>
              
              <div v-if="trigger.type === 'deviceState'">
                <v-select
                  v-model="trigger.data.deviceId"
                  label="Device"
                  :items="devicesForSelect"
                  item-text="text"
                  item-value="value"
                ></v-select>
                
                <v-select
                  v-model="trigger.data.propertyName"
                  label="Property"
                  :items="['power', 'brightness', 'temperature']"
                ></v-select>
                
                <v-select
                  v-model="trigger.data.operator"
                  label="Condition"
                  :items="[
                    { text: 'Equals (=)', value: '=' },
                    { text: 'Greater Than (>)', value: '>' },
                    { text: 'Less Than (<)', value: '<' }
                  ]"
                  item-text="text"
                  item-value="value"
                ></v-select>
                
                <v-text-field
                  v-model="trigger.data.value"
                  label="Value"
                ></v-text-field>
              </div>

              <v-btn 
                icon 
                color="error" 
                small
                @click="removeTrigger(index)"
                class="mt-2"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
              <v-divider class="my-2"></v-divider>
            </div>
            
            <v-btn
              color="primary"
              text
              @click="addTrigger"
            >
              <v-icon left>mdi-plus</v-icon>
              Add Trigger
            </v-btn>

            <v-subheader class="mt-4">Actions</v-subheader>
            <div v-for="(action, index) in newRule.actions" :key="'action-'+index" class="action-container">
              <v-select
                v-model="action.type"
                label="Action Type"
                :items="actionTypes"
                item-text="label"
                item-value="type"
                @change="updateAction(index, action.type)"
              ></v-select>
              
              <div v-if="action.type === 'deviceCommand'">
                <v-select
                  v-model="action.data.deviceId"
                  label="Device"
                  :items="devicesForSelect"
                  item-text="text"
                  item-value="value"
                ></v-select>
                
                <v-select
                  v-model="action.data.command"
                  label="Command"
                  :items="commandsForDevice(action.data.deviceId)"
                  item-text="text"
                  item-value="value"
                  @change="setDefaultCommandParams(action)"
                ></v-select>
                
                <div v-if="action.data.command === 'setPower'">
                  <v-switch
                    v-model="action.data.parameters.power"
                    label="Power"
                    color="primary"
                  ></v-switch>
                </div>
                
                <div v-if="action.data.command === 'setBrightness'">
                  <v-slider
                    v-model="action.data.parameters.level"
                    label="Brightness"
                    min="0"
                    max="100"
                    thumb-label
                  ></v-slider>
                </div>
                
                <div v-if="action.data.command === 'setTemperature'">
                  <v-slider
                    v-model="action.data.parameters.temp"
                    label="Temperature"
                    min="60"
                    max="80"
                    thumb-label
                  ></v-slider>
                </div>
              </div>
              
              <div v-if="action.type === 'notification'">
                <v-textarea
                  v-model="action.data.message"
                  label="Message"
                  rows="2"
                ></v-textarea>
                
                <v-select
                  v-model="action.data.priority"
                  label="Priority"
                  :items="[
                    { text: 'Low', value: 0 },
                    { text: 'Normal', value: 1 },
                    { text: 'High', value: 2 }
                  ]"
                  item-text="text"
                  item-value="value"
                ></v-select>
              </div>

              <v-btn 
                icon 
                color="error" 
                small
                @click="removeAction(index)"
                class="mt-2"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
              <v-divider class="my-2"></v-divider>
            </div>
            
            <v-btn
              color="primary"
              text
              @click="addAction"
            >
              <v-icon left>mdi-plus</v-icon>
              Add Action
            </v-btn>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-switch
            v-model="newRule.active"
            label="Activate"
            color="success"
          ></v-switch>
          <v-btn
            color="primary"
            @click="saveAutomationRule"
          >
            Save
          </v-btn>
          <v-btn
            text
            @click="createAutomationDialog = false"
          >
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Device Component -->
    <device-details-dialog
      :visible="detailsDialogVisible"
      :device="selectedDevice"
      @close="detailsDialogVisible = false"
    />

    <!-- System State Overlay -->
    <div v-if="systemState === 'DISABLED'" class="system-disabled-overlay">
      <v-card class="system-disabled-card">
        <v-card-title>
          <v-icon left large color="warning">mdi-alert-circle</v-icon>
          Device Control System Disabled
        </v-card-title>
        <v-card-text>
          The Device Control System has been disabled. This may be due to a feature flag or system configuration.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="retryInitialization">
            Retry
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>

    <v-snackbar
      v-model="snackbar.visible"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
    >
      {{ snackbar.message }}
      <template v-slot:action="{ attrs }">
        <v-btn
          text
          v-bind="attrs"
          @click="snackbar.visible = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import DeviceCard from './DeviceCard.vue';
import DeviceDetailsDialog from './DeviceDetailsDialog.vue';

export default {
  name: 'DeviceControl',
  
  components: {
    DeviceCard,
    DeviceDetailsDialog
  },
  
  data() {
    return {
      activeTab: 0,
      detailsDialogVisible: false,
      selectedDevice: null,
      createAutomationDialog: false,
      snackbar: {
        visible: false,
        message: '',
        color: 'info',
        timeout: 5000
      },
      
      // Device categories
      deviceCategories: [
        { type: 'all', label: 'All Devices', icon: 'mdi-devices' },
        { type: 'light', label: 'Lights', icon: 'mdi-lightbulb' },
        { type: 'thermostat', label: 'Thermostats', icon: 'mdi-thermostat' },
        { type: 'speaker', label: 'Speakers', icon: 'mdi-speaker' },
        { type: 'sensor', label: 'Sensors', icon: 'mdi-radio-tower' },
        { type: 'other', label: 'Other', icon: 'mdi-dots-horizontal-circle' }
      ],
      
      // Recent events (for timeline)
      recentEvents: [],
      
      // Recommendations
      recommendations: [],
      currentContext: {
        contextType: 'TIME_OF_DAY',
        timeOfDay: 'MORNING'
      },
      
      // Automation rules
      automationRules: [],
      newRule: {
        name: '',
        description: '',
        triggers: [],
        actions: [],
        active: true
      },
      
      // Trigger and action config
      triggerTypes: [
        { type: 'time', label: 'Time of Day' },
        { type: 'deviceState', label: 'Device State' }
      ],
      actionTypes: [
        { type: 'deviceCommand', label: 'Control Device' },
        { type: 'notification', label: 'Send Notification' }
      ],
      weekDays: [
        { value: 1, label: 'M' },
        { value: 2, label: 'T' },
        { value: 3, label: 'W' },
        { value: 4, label: 'T' },
        { value: 5, label: 'F' },
        { value: 6, label: 'S' },
        { value: 7, label: 'S' }
      ]
    }
  },
  
  computed: {
    ...mapState({
      systemState: state => state.devices?.systemState || 'INITIALIZING',
      devices: state => state.devices?.deviceList || []
    }),
    
    isDiscovering() {
      return this.systemState === 'DISCOVERING';
    },
    
    devicesForSelect() {
      return this.devices.map(device => ({
        text: `${device.name} (${device.type})`,
        value: device.id
      }));
    },
    
    currentContextDescription() {
      if (this.currentContext.contextType === 'TIME_OF_DAY' && this.currentContext.timeOfDay) {
        return `Time of day: ${this.currentContext.timeOfDay.toLowerCase()}`;
      } else if (this.currentContext.contextType === 'USER_ACTIVITY' && this.currentContext.activity) {
        return `Activity: ${this.currentContext.activity.toLowerCase().replace('_', ' ')}`;
      } else if (this.currentContext.contextType === 'MOOD' && this.currentContext.mood) {
        return `Mood: ${this.currentContext.mood.toLowerCase()}`;
      }
      return 'Current context';
    }
  },
  
  mounted() {
    this.initializeSystem();
    this.setupContextUpdates();
  },
  
  beforeDestroy() {
    // Stop any timers
    if (this.contextUpdateTimer) {
      clearInterval(this.contextUpdateTimer);
    }
  },
  
  methods: {
    async initializeSystem() {
      try {
        await this.$store.dispatch('devices/initialize');
        this.loadDevices();
        this.loadAutomationRules();
        this.updateRecommendations();
        this.setupEventListeners();
        
        this.showSnackbar('Device control system initialized', 'success');
      } catch (error) {
        console.error('Failed to initialize device control system:', error);
        this.showSnackbar('Failed to initialize device control system', 'error');
      }
    },
    
    async retryInitialization() {
      await this.initializeSystem();
    },
    
    setupEventListeners() {
      // Subscribe to device events
      this.$store.dispatch('devices/subscribeToEvents').then(subscription => {
        subscription.on('event', this.handleDeviceEvent);
      });
    },
    
    handleDeviceEvent(event) {
      // Add event to timeline
      const eventObj = {
        timestamp: new Date(),
        type: event.type || 'INFO',
        message: this.formatEventMessage(event),
        raw: event
      };
      
      // Add to start of array (newest first)
      this.recentEvents.unshift(eventObj);
      
      // Limit to last 20 events
      if (this.recentEvents.length > 20) {
        this.recentEvents.pop();
      }
      
      // Update devices if needed
      if (['DEVICE_DISCOVERED', 'DEVICE_CONNECTED', 'DEVICE_DISCONNECTED'].includes(eventObj.type)) {
        this.loadDevices();
      }
      
      // Update automation rules if needed
      if (['AUTOMATION_CREATED', 'AUTOMATION_UPDATED', 'AUTOMATION_DELETED'].includes(eventObj.type)) {
        this.loadAutomationRules();
      }
    },
    
    formatEventMessage(event) {
      if (event.type === 'DEVICE_DISCOVERED') {
        return `Discovered ${event.deviceName} (${event.deviceType})`;
      } else if (event.type === 'DEVICE_CONNECTED') {
        return `Connected to ${event.deviceName}`;
      } else if (event.type === 'DEVICE_DISCONNECTED') {
        return `Disconnected from ${event.deviceName}`;
      } else if (event.type === 'COMMAND_SENT') {
        return `Sent command ${event.command.name} to ${event.deviceName}`;
      } else if (event.type === 'SYSTEM_INITIALIZED') {
        return 'Device control system initialized';
      } else if (event.type === 'SYSTEM_SHUTDOWN') {
        return 'Device control system shut down';
      } else if (event.type === 'AUTOMATION_CREATED') {
        return `Created automation rule: ${event.ruleName}`;
      } else if (event.type === 'AUTOMATION_UPDATED') {
        return `Updated automation rule: ${event.ruleName}`;
      } else if (event.type === 'AUTOMATION_DELETED') {
        return 'Deleted automation rule';
      } else if (event.type === 'PERMISSION_DENIED') {
        return `Permission denied: ${event.message}`;
      } else if (event.type === 'ERROR') {
        return `Error: ${event.message}`;
      }
      
      return JSON.stringify(event);
    },
    
    formatEventTime(timestamp) {
      return new Date(timestamp).toLocaleTimeString();
    },
    
    getEventColor(event) {
      if (event.type === 'ERROR') {
        return 'error';
      } else if (event.type === 'PERMISSION_DENIED') {
        return 'warning';
      } else if (['DEVICE_CONNECTED', 'AUTOMATION_CREATED', 'AUTOMATION_UPDATED'].includes(event.type)) {
        return 'success';
      } else if (event.type === 'DEVICE_DISCOVERED') {
        return 'info';
      }
      return 'primary';
    },
    
    async loadDevices() {
      await this.$store.dispatch('devices/getDevices');
    },
    
    async loadAutomationRules() {
      try {
        const rules = await this.$store.dispatch('devices/getAutomationRules');
        this.automationRules = rules;
      } catch (error) {
        console.error('Failed to load automation rules:', error);
      }
    },
    
    setupContextUpdates() {
      // Update context every minute
      this.contextUpdateTimer = setInterval(() => {
        this.updateContext();
        this.updateRecommendations();
      }, 60000);
      
      // Initial update
      this.updateContext();
    },
    
    updateContext() {
      const now = new Date();
      const hour = now.getHours();
      
      let timeOfDay;
      if (hour >= 5 && hour < 12) {
        timeOfDay = 'MORNING';
      } else if (hour >= 12 && hour < 17) {
        timeOfDay = 'AFTERNOON';
      } else if (hour >= 17 && hour < 22) {
        timeOfDay = 'EVENING';
      } else {
        timeOfDay = 'NIGHT';
      }
      
      this.currentContext = {
        contextType: 'TIME_OF_DAY',
        timeOfDay
      };
    },
    
    async updateRecommendations() {
      try {
        const recommendations = await this.$store.dispatch('devices/getDeviceRecommendations', this.currentContext);
        this.recommendations = recommendations;
      } catch (error) {
        console.error('Failed to get recommendations:', error);
      }
    },
    
    async startDeviceDiscovery() {
      try {
        await this.$store.dispatch('devices/startDiscovery');
        this.showSnackbar('Device discovery started', 'info');
      } catch (error) {
        console.error('Failed to start device discovery:', error);
        this.showSnackbar('Failed to start device discovery', 'error');
      }
    },
    
    async stopDeviceDiscovery() {
      try {
        await this.$store.dispatch('devices/stopDiscovery');
        this.showSnackbar('Device discovery stopped', 'info');
      } catch (error) {
        console.error('Failed to stop device discovery:', error);
        this.showSnackbar('Failed to stop device discovery', 'error');
      }
    },
    
    async connectToDevice(deviceId) {
      try {
        await this.$store.dispatch('devices/connectToDevice', deviceId);
        this.showSnackbar('Connected to device', 'success');
      } catch (error) {
        console.error('Failed to connect to device:', error);
        this.showSnackbar('Failed to connect to device', 'error');
      }
    },
    
    async disconnectFromDevice(deviceId) {
      try {
        await this.$store.dispatch('devices/disconnectFromDevice', deviceId);
        this.showSnackbar('Disconnected from device', 'info');
      } catch (error) {
        console.error('Failed to disconnect from device:', error);
        this.showSnackbar('Failed to disconnect from device', 'error');
      }
    },
    
    async sendDeviceCommand(payload) {
      try {
        await this.$store.dispatch('devices/sendCommand', payload);
        this.showSnackbar(`Command sent to ${payload.deviceName}`, 'success');
      } catch (error) {
        console.error('Failed to send command to device:', error);
        this.showSnackbar('Failed to send command to device', 'error');
      }
    },
    
    async applyRecommendation(recommendation) {
      try {
        await this.$store.dispatch('devices/sendCommand', {
          deviceId: recommendation.deviceId,
          deviceName: recommendation.deviceName,
          command: recommendation.command
        });
        this.showSnackbar(`Applied: ${recommendation.action}`, 'success');
      } catch (error) {
        console.error('Failed to apply recommendation:', error);
        this.showSnackbar('Failed to apply recommendation', 'error');
      }
    },
    
    showSnackbar(message, color = 'info') {
      this.snackbar = {
        visible: true,
        message,
        color,
        timeout: color === 'error' ? 8000 : 3000
      };
    },
    
    getDevicesByCategory(categoryType) {
      if (categoryType === 'all') {
        return this.devices;
      }
      
      if (categoryType === 'other') {
        const standardTypes = ['LIGHT', 'THERMOSTAT', 'SPEAKER', 'SENSOR'];
        return this.devices.filter(device => !standardTypes.includes(device.type));
      }
      
      const typeMap = {
        'light': 'LIGHT',
        'thermostat': 'THERMOSTAT',
        'speaker': 'SPEAKER',
        'sensor': 'SENSOR'
      };
      
      return this.devices.filter(device => device.type === typeMap[categoryType]);
    },
    
    getCategoryDeviceCount(categoryType) {
      return this.getDevicesByCategory(categoryType).length;
    },
    
    getDeviceIcon(deviceId) {
      const device = this.devices.find(d => d.id === deviceId);
      if (!device) return 'mdi-devices';
      
      switch (device.type) {
        case 'LIGHT': return 'mdi-lightbulb';
        case 'THERMOSTAT': return 'mdi-thermostat';
        case 'SPEAKER': return 'mdi-speaker';
        case 'HEADPHONES': return 'mdi-headphones';
        case 'SENSOR': return 'mdi-radio-tower';
        case 'CAMERA': return 'mdi-cctv';
        case 'LOCK': return 'mdi-lock';
        default: return 'mdi-devices';
      }
    },
    
    getDeviceIconColor(deviceId) {
      const device = this.devices.find(d => d.id === deviceId);
      if (!device) return 'grey';
      
      if (device.connectionState === 'CONNECTED') {
        return 'primary';
      } else if (device.connectionState === 'ERROR') {
        return 'error';
      }
      
      return 'grey';
    },
    
    // Automation rule methods
    addTrigger() {
      this.newRule.triggers.push({
        type: 'time',
        data: {
          hour: 8,
          minute: 0,
          daysOfWeek: [1, 2, 3, 4, 5] // Weekdays
        }
      });
    },
    
    removeTrigger(index) {
      this.newRule.triggers.splice(index, 1);
    },
    
    updateTrigger(index, type) {
      if (type === 'time') {
        this.newRule.triggers[index].data = {
          hour: 8,
          minute: 0,
          daysOfWeek: [1, 2, 3, 4, 5]
        };
      } else if (type === 'deviceState') {
        this.newRule.triggers[index].data = {
          deviceId: '',
          propertyName: 'power',
          operator: '=',
          value: 'true'
        };
      }
    },
    
    addAction() {
      this.newRule.actions.push({
        type: 'deviceCommand',
        data: {
          deviceId: '',
          command: '',
          parameters: {}
        }
      });
    },
    
    removeAction(index) {
      this.newRule.actions.splice(index, 1);
    },
    
    updateAction(index, type) {
      if (type === 'deviceCommand') {
        this.newRule.actions[index].data = {
          deviceId: '',
          command: '',
          parameters: {}
        };
      } else if (type === 'notification') {
        this.newRule.actions[index].data = {
          message: '',
          priority: 1
        };
      }
    },
    
    commandsForDevice(deviceId) {
      const device = this.devices.find(d => d.id === deviceId);
      if (!device) return [];
      
      const commands = [];
      
      if (device.capabilities.includes('POWER_TOGGLE')) {
        commands.push({ text: 'Set Power', value: 'setPower' });
      }
      
      if (device.capabilities.includes('BRIGHTNESS_CONTROL')) {
        commands.push({ text: 'Set Brightness', value: 'setBrightness' });
      }
      
      if (device.capabilities.includes('COLOR_CONTROL')) {
        commands.push({ text: 'Set Color', value: 'setColor' });
      }
      
      if (device.capabilities.includes('TEMPERATURE_CONTROL')) {
        commands.push({ text: 'Set Temperature', value: 'setTemperature' });
      }
      
      if (device.capabilities.includes('AUDIO_PLAYBACK')) {
        commands.push(
          { text: 'Play Music', value: 'playMusic' },
          { text: 'Stop Playback', value: 'stop' }
        );
      }
      
      if (device.capabilities.includes('VOLUME_CONTROL')) {
        commands.push({ text: 'Set Volume', value: 'setVolume' });
      }
      
      return commands;
    },
    
    setDefaultCommandParams(action) {
      if (action.data.command === 'setPower') {
        action.data.parameters = { power: true };
      } else if (action.data.command === 'setBrightness') {
        action.data.parameters = { level: 100 };
      } else if (action.data.command === 'setColor') {
        action.data.parameters = { 
          hue: 240, 
          saturation: 100, 
          brightness: 100 
        };
      } else if (action.data.command === 'setTemperature') {
        action.data.parameters = { temp: 72 };
      } else if (action.data.command === 'playMusic') {
        action.data.parameters = { genre: 'relaxing' };
      } else if (action.data.command === 'setVolume') {
        action.data.parameters = { level: 50 };
      } else {
        action.data.parameters = {};
      }
    },
    
    async saveAutomationRule() {
      // Validate form
      if (this.$refs.automationForm.validate()) {
        try {
          // Convert trigger data format to match backend
          const formattedRule = {
            name: this.newRule.name,
            description: this.newRule.description,
            active: this.newRule.active,
            triggers: this.newRule.triggers.map(trigger => {
              if (trigger.type === 'time') {
                return {
                  type: 'TimeTrigger',
                  hour: parseInt(trigger.data.hour),
                  minute: parseInt(trigger.data.minute),
                  daysOfWeek: trigger.data.daysOfWeek
                };
              } else if (trigger.type === 'deviceState') {
                return {
                  type: 'DeviceStateTrigger',
                  deviceId: trigger.data.deviceId,
                  propertyName: trigger.data.propertyName,
                  operator: trigger.data.operator,
                  value: trigger.data.value
                };
              }
              return null;
            }).filter(t => t !== null),
            actions: this.newRule.actions.map(action => {
              if (action.type === 'deviceCommand') {
                return {
                  type: 'DeviceCommandAction',
                  deviceId: action.data.deviceId,
                  command: {
                    name: action.data.command,
                    parameters: action.data.parameters
                  }
                };
              } else if (action.type === 'notification') {
                return {
                  type: 'NotificationAction',
                  message: action.data.message,
                  priority: action.data.priority
                };
              }
              return null;
            }).filter(a => a !== null)
          };
          
          // Create the rule
          await this.$store.dispatch('devices/createAutomationRule', formattedRule);
          
          // Reset form
          this.createAutomationDialog = false;
          this.resetNewRule();
          
          // Reload rules
          this.loadAutomationRules();
          
          this.showSnackbar('Automation rule created', 'success');
        } catch (error) {
          console.error('Failed to create automation rule:', error);
          this.showSnackbar('Failed to create automation rule', 'error');
        }
      }
    },
    
    resetNewRule() {
      this.newRule = {
        name: '',
        description: '',
        triggers: [],
        actions: [],
        active: true
      };
    },
    
    async updateAutomationRule(ruleId, rule) {
      try {
        await this.$store.dispatch('devices/updateAutomationRule', { ruleId, rule });
        this.showSnackbar('Automation rule updated', 'success');
      } catch (error) {
        console.error('Failed to update automation rule:', error);
        this.showSnackbar('Failed to update automation rule', 'error');
      }
    },
    
    async deleteAutomationRule(ruleId) {
      try {
        await this.$store.dispatch('devices/deleteAutomationRule', ruleId);
        
        // Update local rules list
        const index = this.automationRules.findIndex(rule => rule.id === ruleId);
        if (index !== -1) {
          this.automationRules.splice(index, 1);
        }
        
        this.showSnackbar('Automation rule deleted', 'success');
      } catch (error) {
        console.error('Failed to delete automation rule:', error);
        this.showSnackbar('Failed to delete automation rule', 'error');
      }
    },
    
    formatTrigger(trigger) {
      if (trigger.type === 'TimeTrigger') {
        const hour = trigger.hour.toString().padStart(2, '0');
        const minute = trigger.minute.toString().padStart(2, '0');
        return `At ${hour}:${minute}`;
      } else if (trigger.type === 'DeviceStateTrigger') {
        const device = this.devices.find(d => d.id === trigger.deviceId);
        return `When ${device ? device.name : 'device'} ${trigger.propertyName} ${trigger.operator} ${trigger.value}`;
      }
      return 'Unknown trigger';
    },
    
    formatAction(action) {
      if (action.type === 'DeviceCommandAction') {
        const device = this.devices.find(d => d.id === action.deviceId);
        return `Control ${device ? device.name : 'device'}: ${action.command.name}`;
      } else if (action.type === 'NotificationAction') {
        return `Notify: ${action.message.substring(0, 20)}${action.message.length > 20 ? '...' : ''}`;
      }
      return 'Unknown action';
    }
  }
}
</script>

<style scoped>
.device-control-container {
  position: relative;
  padding: 16px;
}

.title {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.action-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.device-categories {
  margin-bottom: 16px;
}

.device-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.no-devices {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
  color: rgba(0, 0, 0, 0.6);
}

.events-timeline {
  max-height: 300px;
  overflow-y: auto;
}

.event-item {
  display: flex;
  flex-direction: column;
}

.event-time {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
}

.trigger-chip,
.action-chip {
  display: inline-block;
  background-color: rgba(0, 0, 0, 0.05);
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 12px;
  margin-right: 8px;
  margin-bottom: 8px;
}

.automation-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.system-disabled-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
}

.system-disabled-card {
  width: 100%;
  max-width: 450px;
}
</style>


<template>
  <div class="device-control-container">
    <h2 class="title">
      <span>Device Control</span>
      <v-chip v-if="isDiscovering" color="primary" small>Discovering...</v-chip>
    </h2>

    <!-- Action Bar -->
    <div class="action-bar">
      <v-btn
        color="primary"
        :disabled="isDiscovering || systemState === 'DISABLED'"
        @click="startDeviceDiscovery"
      >
        <v-icon left>mdi-magnify</v-icon>
        Discover Devices
      </v-btn>

      <v-btn 
        color="secondary" 
        :disabled="isDiscovering || systemState === 'DISABLED'"
        @click="createAutomationDialog = true"
      >
        <v-icon left>mdi-robot</v-icon>
        Create Automation
      </v-btn>

      <v-btn 
        v-if="isDiscovering"
        color="error"
        @click="stopDeviceDiscovery"
      >
        <v-icon left>mdi-stop</v-icon>
        Stop Discovery
      </v-btn>
    </div>

    <!-- Device Categories -->
    <div class="device-categories">
      <v-tabs v-model="activeTab" background-color="transparent">
        <v-tab v-for="category in deviceCategories" :key="category.type">
          <v-icon left>{{ category.icon }}</v-icon>
          {{ category.label }}
          <v-chip
            v-if="getCategoryDeviceCount(category.type) > 0"
            class="ml-2"
            x-small
            color="primary"
          >{{ getCategoryDeviceCount(category.type) }}</v-chip>
        </v-tab>
      </v-tabs>
    </div>

    <!-- Device Grid -->
    <v-tabs-items v-model="activeTab">
      <v-tab-item v-for="category in deviceCategories" :key="category.type">
        <div v-if="getCategoryDeviceCount(category.type) === 0" class="no-devices">
          <v-icon large color="grey lighten-1">{{ category.icon }}</v-icon>
          <p>No {{ category.label.toLowerCase() }} devices found</p>
          <v-btn color="primary" text @click="startDeviceDiscovery">
            Discover Devices
          </v-btn>
        </div>
        <div v-else class="device-grid">
          <device-card
            v-for="device in getDevicesByCategory(category.type)"
            :key="device.id"
            :device="device"
            @connect="connectToDevice"
            @disconnect="disconnectFromDevice"
            @send-command="sendDeviceCommand"
          />
        </div>
      </v-tab-item>
    </v-tabs-items>

    <!-- Recommendations Card -->
    <v-card class="recommendations-card mt-4" v-if="recommendations.length > 0">
      <v-card-title>
        <v-icon left color="amber darken-2">mdi-lightbulb-on</v-icon>
        Recommendations
      </v-card-title>
      <v-card-text>
        <p class="subtitle-1">Based on {{ currentContextDescription }}</p>
        <v-list dense>
          <v-list-item v-for="(recommendation, index) in recommendations" :key="index">
            <v-list-item-avatar>
              <v-icon :color="getDeviceIconColor(recommendation.deviceId)">
                {{ getDeviceIcon(recommendation.deviceId) }}
              </v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>{{ recommendation.action }}</v-list-item-title>
              <v-list-item-subtitle>{{ recommendation.deviceName }} - {{ recommendation.reason }}</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn 
                small 
                color="primary"
                @click="applyRecommendation(recommendation)"
              >Apply</v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>

    <!-- Events Timeline -->
    <v-expansion-panels class="mt-4">
      <v-expansion-panel>
        <v-expansion-panel-header>
          <div class="d-flex align-center">
            <v-icon left>mdi-history</v-icon>
            Device Activity
            <v-badge 
              :content="recentEvents.length.toString()" 
              :value="recentEvents.length"
              color="primary"
              offset-x="10"
              offset-y="10"
            ></v-badge>
          </div>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-timeline dense class="events-timeline">
            <v-timeline-item
              v-for="(event, index) in recentEvents"
              :key="index"
              :color="getEventColor(event)"
              small
            >
              <div class="event-item">
                <span class="event-time">{{ formatEventTime(event.timestamp) }}</span>
                <span class="event-message">{{ event.message }}</span>
              </div>
            </v-timeline-item>
          </v-timeline>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>

    <!-- Automation Rules Panel -->
    <v-expansion-panels class="mt-4">
      <v-expansion-panel>
        <v-expansion-panel-header>
          <div class="d-flex align-center">
            <v-icon left>mdi-robot</v-icon>
            Automation Rules
            <v-badge 
              :content="automationRules.length.toString()" 
              :value="automationRules.length"
              color="primary"
              offset-x="10"
              offset-y="10"
            ></v-badge>
          </div>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-card v-for="rule in automationRules" :key="rule.id" class="mb-3">
            <v-card-title class="py-1">
              {{ rule.name }}
              <v-spacer></v-spacer>
              <v-switch
                v-model="rule.active"
                @change="updateAutomationRule(rule.id, rule)"
                dense
                hide-details
                color="success"
              ></v-switch>
            </v-card-title>
            <v-card-subtitle>{{ rule.description }}</v-card-subtitle>
            <v-card-text>
              <div class="automation-details">
                <div>
                  <strong>Triggers:</strong>
                  <span v-for="(trigger, index) in rule.triggers" :key="index" class="trigger-chip">
                    {{ formatTrigger(trigger) }}
                  </span>
                </div>
                <div>
                  <strong>Actions:</strong>
                  <span v-for="(action, index) in rule.actions" :key="index" class="action-chip">
                    {{ formatAction(action) }}
                  </span>
                </div>
              </div>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="error"
                text
                @click="deleteAutomationRule(rule.id)"
              >
                <v-icon left>mdi-delete</v-icon>
                Delete
              </v-btn>
            </v-card-actions>
          </v-card>

          <div v-if="automationRules.length === 0" class="text-center pa-4">
            <v-icon large color="grey lighten-1">mdi-robot-off</v-icon>
            <p>No automation rules configured</p>
            <v-btn color="primary" @click="createAutomationDialog = true">
              Create Automation Rule
            </v-btn>
          </div>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>

    <!-- Create Automation Dialog -->
    <v-dialog v-model="createAutomationDialog" max-width="600">
      <v-card>
        <v-card-title>
          <v-icon left>mdi-robot</v-icon>
          Create Automation Rule
        </v-card-title>
        <v-card-text>
          <v-form ref="automationForm">
            <v-text-field
              v-model="newRule.name"
              label="Rule Name"
              required
              :rules="[v => !!v || 'Name is required']"
            ></v-text-field>
            
            <v-textarea
              v-model="newRule.description"
              label="Description"
              rows="2"
            ></v-textarea>
            
            <v-subheader>Triggers</v-subheader>
            <div v-for="(trigger, index) in newRule.triggers" :key="'trigger-'+index" class="trigger-container">
              <v-select
                v-model="trigger.type"
                label="Trigger Type"
                :items="triggerTypes"
                item-text="label"
                item-value="type"
                @change="updateTrigger(index, trigger.type)"
              ></v-select>
              
              <div v-if="trigger.type === 'time'">
                <v-row>
                  <v-col cols="6">
                    <v-text-field
                      v-model="trigger.data.hour"
                      label="Hour (0-23)"
                      type="number"
                      min="0"
                      max="23"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      v-model="trigger.data.minute"
                      label="Minute (0-59)"
                      type="number"
                      min="0"
                      max="59"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-chip-group
                  v-model="trigger.data.daysOfWeek"
                  column
                  multiple
                >
                  <v-chip
                    v-for="day in weekDays"
                    :key="day.value"
                    :value="day.value"
                    filter
                    outlined
                  >
                    {{ day.label }}
                  </v-chip>
                </v-chip-group>
              </div>
              
              <div v-if="trigger.type === 'deviceState'">
                <v-select
                  v-model="trigger.data.deviceId"
                  label="Device"
                  :items="devicesForSelect"
                  item-text="text"
                  item-value="value"
                ></v-select>
                
                <v-select
                  v-model="trigger.data.propertyName"
                  label="Property"
                  :items="['power', 'brightness', 'temperature']"
                ></v-select>
                
                <v-select
                  v-model="trigger.data.operator"
                  label="Condition"
                  :items="[
                    { text: 'Equals (=)', value: '=' },
                    { text: 'Greater Than (>)', value: '>' },
                    { text: 'Less Than (<)', value: '<' }
                  ]"
                  item-text="text"
                  item-value="value"
                ></v-select>
                
                <v-text-field
                  v-model="trigger.data.value"
                  label="Value"
                ></v-text-field>
              </div>

              <v-btn 
                icon 
                color="error" 
                small
                @click="removeTrigger(index)"
                class="mt-2"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
              <v-divider class="my-2"></v-divider>
            </div>
            
            <v-btn
              color="primary"
              text
              @click="addTrigger"
            >
              <v-icon left>mdi-plus</v-icon>
              Add Trigger
            </v-btn>

            <v-subheader class="mt-4">Actions</v-subheader>
            <div v-for="(action, index) in newRule.actions" :key="'action-'+index" class="action-container">
              <v-select
                v-model="action.type"
                label="Action Type"
                :items="actionTypes"
                item-text="label"
                item-value="type"
                @change="updateAction(index, action.type)"
              ></v-select>
              
              <div v-if="action.type === 'deviceCommand'">
                <v-select
                  v-model="action.data.deviceId"
                  label="Device"
                  :items="devicesForSelect"
                  item-text="text"
                  item-value="value"
                ></v-select>
                
                <v-select
                  v-model="action.data.command"
                  label="Command"
                  :items="commandsForDevice(action.data.deviceId)"
                  item-text="text"
                  item-value="value"
                  @change="setDefaultCommandParams(action)"
                ></v-select>
                
                <div v-if="action.data.command === 'setPower'">
                  <v-switch
                    v-model="action.data.parameters.power"
                    label="Power"
                    color="primary"
                  ></v-switch>
                </div>
                
                <div v-if="action.data.command === 'setBrightness'">
                  <v-slider
                    v-model="action.data.parameters.level"
                    label="Brightness"
                    min="0"
                    max="100"
                    thumb-label
                  ></v-slider>
                </div>
                
                <div v-if="action.data.command === 'setTemperature'">
                  <v-slider
                    v-model="action.data.parameters.temp"
                    label="Temperature"
                    min="60"
                    max="80"
                    thumb-label
                  ></v-slider>
                </div>
              </div>
              
              <div v-if="action.type === 'notification'">
                <v-textarea
                  v-model="action.data.message"
                  label="Message"
                  rows="2"
                ></v-textarea>
                
                <v-select
                  v-model="action.data.priority"
                  label="Priority"
                  :items="[
                    { text: 'Low', value: 0 },
                    { text: 'Normal', value: 1 },
                    { text: 'High', value: 2 }
                  ]"
                  item-text="text"
                  item-value="value"
                ></v-select>
              </div>

              <v-btn 
                icon 
                color="error" 
                small
                @click="removeAction(index)"
                class="mt-2"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
              <v-divider class="my-2"></v-divider>
            </div>
            
            <v-btn
              color="primary"
              text
              @click="addAction"
            >
              <v-icon left>mdi-plus</v-icon>
              Add Action
            </v-btn>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-switch
            v-model="newRule.active"
            label="Activate"
            color="success"
          ></v-switch>
          <v-btn
            color="primary"
            @click="saveAutomationRule"
          >
            Save
          </v-btn>
          <v-btn
            text
            @click="createAutomationDialog = false"
          >
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Device Component -->
    <device-details-dialog
      :visible="detailsDialogVisible"
      :device="selectedDevice"
      @close="detailsDialogVisible = false"
    />

    <!-- System State Overlay -->
    <div v-if="systemState === 'DISABLED'" class="system-disabled-overlay">
      <v-card class="system-disabled-card">
        <v-card-title>
          <v-icon left large color="warning">mdi-alert-circle</v-icon>
          Device Control System Disabled
        </v-card-title>
        <v-card-text>
          The Device Control System has been disabled. This may be due to a feature flag or system configuration.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="retryInitialization">
            Retry
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>

    <v-snackbar
      v-model="snackbar.visible"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
    >
      {{ snackbar.message }}
      <template v-slot:action="{ attrs }">
        <v-btn
          text
          v-bind="attrs"
          @click="snackbar.visible = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import DeviceCard from './DeviceCard.vue';
import DeviceDetailsDialog from './DeviceDetailsDialog.vue';

export default {
  name: 'DeviceControl',
  
  components: {
    DeviceCard,
    DeviceDetailsDialog
  },
  
  data() {
    return {
      activeTab: 0,
      detailsDialogVisible: false,
      selectedDevice: null,
      createAutomationDialog: false,
      snackbar: {
        visible: false,
        message: '',
        color: 'info',
        timeout: 5000
      },
      
      // Device categories
      deviceCategories: [
        { type: 'all', label: 'All Devices', icon: 'mdi-devices' },
        { type: 'light', label: 'Lights', icon: 'mdi-lightbulb' },
        { type: 'thermostat', label: 'Thermostats', icon: 'mdi-thermostat' },
        { type: 'speaker', label: 'Speakers', icon: 'mdi-speaker' },
        { type: 'sensor', label: 'Sensors', icon: 'mdi-radio-tower' },
        { type: 'other', label: 'Other', icon: 'mdi-dots-horizontal-circle' }
      ],
      
      // Recent events (for timeline)
      recentEvents: [],
      
      // Recommendations
      recommendations: [],
      currentContext: {
        contextType: 'TIME_OF_DAY',
        timeOfDay: 'MORNING'
      },
      
      // Automation rules
      automationRules: [],
      newRule: {
        name: '',
        description: '',
        triggers: [],
        actions: [],
        active: true
      },
      
      // Trigger and action config
      triggerTypes: [
        { type: 'time', label: 'Time of Day' },
        { type: 'deviceState', label: 'Device State' }
      ],
      actionTypes: [
        { type: 'deviceCommand', label: 'Control Device' },
        { type: 'notification', label: 'Send Notification' }
      ],
      weekDays: [
        { value: 1, label: 'M' },
        { value: 2, label: 'T' },
        { value: 3, label: 'W' },
        { value: 4, label: 'T' },
        { value: 5, label: 'F' },
        { value: 6, label: 'S' },
        { value: 7, label: 'S' }
      ]
    }
  },
  
  computed: {
    ...mapState({
      systemState: state => state.devices?.systemState || 'INITIALIZING',
      devices: state => state.devices?.deviceList || []
    }),
    
    isDiscovering() {
      return this.systemState === 'DISCOVERING';
    },
    
    devicesForSelect() {
      return this.devices.map(device => ({
        text: `${device.name} (${device.type})`,
        value: device.id
      }));
    },
    
    currentContextDescription() {
      if (this.currentContext.contextType === 'TIME_OF_DAY' && this.currentContext.timeOfDay) {
        return `Time of day: ${this.currentContext.timeOfDay.toLowerCase()}`;
      } else if (this.currentContext.contextType === 'USER_ACTIVITY' && this.currentContext.activity) {
        return `Activity: ${this.currentContext.activity.toLowerCase().replace('_', ' ')}`;
      } else if (this.currentContext.contextType === 'MOOD' && this.currentContext.mood) {
        return `Mood: ${this.currentContext.mood.toLowerCase()}`;
      }
      return 'Current context';
    }
  },
  
  mounted() {
    this.initializeSystem();
    this.setupContextUpdates();
  },
  
  beforeDestroy() {
    // Stop any timers
    if (this.contextUpdateTimer) {
      clearInterval(this.contextUpdateTimer);
    }
  },
  
  methods: {
    async initializeSystem() {
      try {
        await this.$store.dispatch('devices/initialize');
        this.loadDevices();
        this.loadAutomationRules();
        this.updateRecommendations();
        this.setupEventListeners();
        
        this.showSnackbar('Device control system initialized', 'success');
      } catch (error) {
        console.error('Failed to initialize device control system:', error);
        this.showSnackbar('Failed to initialize device control system', 'error');
      }
    },
    
    async retryInitialization() {
      await this.initializeSystem();
    },
    
    setupEventListeners() {
      // Subscribe to device events
      this.$store.dispatch('devices/subscribeToEvents').then(subscription => {
        subscription.on('event', this.handleDeviceEvent);
      });
    },
    
    handleDeviceEvent(event) {
      // Add event to timeline
      const eventObj = {
        timestamp: new Date(),
        type: event.type || 'INFO',
        message: this.formatEventMessage(event),
        raw: event
      };
      
      // Add to start of array (newest first)
      this.recentEvents.unshift(eventObj);
      
      // Limit to last 20 events
      if (this.recentEvents.length > 20) {
        this.recentEvents.pop();
      }
      
      // Update devices if needed
      if (['DEVICE_DISCOVERED', 'DEVICE_CONNECTED', 'DEVICE_DISCONNECTED'].includes(eventObj.type)) {
        this.loadDevices();
      }
      
      // Update automation rules if needed
      if (['AUTOMATION_CREATED', 'AUTOMATION_UPDATED', 'AUTOMATION_DELETED'].includes(eventObj.type)) {
        this.loadAutomationRules();
      }
    },
    
    formatEventMessage(event) {
      if (event.type === 'DEVICE_DISCOVERED') {
        return `Discovered ${event.deviceName} (${event.deviceType})`;
      } else if (event.type === 'DEVICE_CONNECTED') {
        return `Connected to ${event.deviceName}`;
      } else if (event.type === 'DEVICE_DISCONNECTED') {
        return `Disconnected from ${event.deviceName}`;
      } else if (event.type === 'COMMAND_SENT') {
        return `Sent command ${event.command.name} to ${event.deviceName}`;
      } else if (event.type === 'SYSTEM_INITIALIZED') {
        return 'Device control system initialized';
      } else if (event.type === 'SYSTEM_SHUTDOWN') {
        return 'Device control system shut down';
      } else if (event.type === 'AUTOMATION_CREATED') {
        return `Created automation rule: ${event.ruleName}`;
      } else if (event.type === 'AUTOMATION_UPDATED') {
        return `Updated automation rule: ${event.ruleName}`;
      } else if (event.type === 'AUTOMATION_DELETED') {
        return 'Deleted automation rule';
      } else if (event.type === 'PERMISSION_DENIED') {
        return `Permission denied: ${event.message}`;
      } else if (event.type === 'ERROR') {
        return `Error: ${event.message}`;
      }
      
      return JSON.stringify(event);
    },
    
    formatEventTime(timestamp) {
      return new Date(timestamp).toLocaleTimeString();
    },
    
    getEventColor(event) {
      if (event.type === 'ERROR') {
        return 'error';
      } else if (event.type === 'PERMISSION_DENIED') {
        return 'warning';
      } else if (['DEVICE_CONNECTED', 'AUTOMATION_CREATED', 'AUTOMATION_UPDATED'].includes(event.type)) {
        return 'success';
      } else if (event.type === 'DEVICE_DISCOVERED') {
        return 'info';
      }
      return 'primary';
    },
    
    async loadDevices() {
      await this.$store.dispatch('devices/getDevices');
    },
    
    async loadAutomationRules() {
      try {
        const rules = await this.$store.dispatch('devices/getAutomationRules');
        this.automationRules = rules;
      } catch (error) {
        console.error('Failed to load automation rules:', error);
      }
    },
    
    setupContextUpdates() {
      // Update context every minute
      this.contextUpdateTimer = setInterval(() => {
        this.updateContext();
        this.updateRecommendations();
      }, 60000);
      
      // Initial update
      this.updateContext();
    },
    
    updateContext() {
      const now = new Date();
      const hour = now.getHours();
      
      let timeOfDay;
      if (hour >= 5 && hour < 12) {
        timeOfDay = 'MORNING';
      } else if (hour >= 12 && hour < 17) {
        timeOfDay = 'AFTERNOON';
      } else if (hour >= 17 && hour < 22) {
        timeOfDay = 'EVENING';
      } else {
        timeOfDay = 'NIGHT';
      }
      
      this.currentContext = {
        contextType: 'TIME_OF_DAY',
        timeOfDay
      };
    },
    
    async updateRecommendations() {
      try {
        const recommendations = await this.$store.dispatch('devices/getDeviceRecommendations', this.currentContext);
        this.recommendations = recommendations;
      } catch (error) {
        console.error('Failed to get recommendations:', error);
      }
    },
    
    async startDeviceDiscovery() {
      try {
        await this.$store.dispatch('devices/startDiscovery');
        this.showSnackbar('Device discovery started', 'info');
      } catch (error) {
        console.error('Failed to start device discovery:', error);
        this.showSnackbar('Failed to start device discovery', 'error');
      }
    },
    
    async stopDeviceDiscovery() {
      try {
        await this.$store.dispatch('devices/stopDiscovery');
        this.showSnackbar('Device discovery stopped', 'info');
      } catch (error) {
        console.error('Failed to stop device discovery:', error);
        this.showSnackbar('Failed to stop device discovery', 'error');
      }
    },
    
    async connectToDevice(deviceId) {
      try {
        await this.$store.dispatch('devices/connectToDevice', deviceId);
        this.showSnackbar('Connected to device', 'success');
      } catch (error) {
        console.error('Failed to connect to device:', error);
        this.showSnackbar('Failed to connect to device', 'error');
      }
    },
    
    async disconnectFromDevice(deviceId) {
      try {
        await this.$store.dispatch('devices/disconnectFromDevice', deviceId);
        this.showSnackbar('Disconnected from device', 'info');
      } catch (error) {
        console.error('Failed to disconnect from device:', error);
        this.showSnackbar('Failed to disconnect from device', 'error');
      }
    },
    
    async sendDeviceCommand(payload) {
      try {
        await this.$store.dispatch('devices/sendCommand', payload);
        this.showSnackbar(`Command sent to ${payload.deviceName}`, 'success');
      } catch (error) {
        console.error('Failed to send command to device:', error);
        this.showSnackbar('Failed to send command to device', 'error');
      }
    },
    
    async applyRecommendation(recommendation) {
      try {
        await this.$store.dispatch('devices/sendCommand', {
          deviceId: recommendation.deviceId,
          deviceName: recommendation.deviceName,
          command: recommendation.command
        });
        this.showSnackbar(`Applied: ${recommendation.action}`, 'success');
      } catch (error) {
        console.error('Failed to apply recommendation:', error);
        this.showSnackbar('Failed to apply recommendation', 'error');
      }
    },
    
    showSnackbar(message, color = 'info') {
      this.snackbar = {
        visible: true,
        message,
        color,
        timeout: color === 'error' ? 8000 : 3000
      };
    },
    
    getDevicesByCategory(categoryType) {
      if (categoryType === 'all') {
        return this.devices;
      }
      
      if (categoryType === 'other') {
        const standardTypes = ['LIGHT', 'THERMOSTAT', 'SPEAKER', 'SENSOR'];
        return this.devices.filter(device => !standardTypes.includes(device.type));
      }
      
      const typeMap = {
        'light': 'LIGHT',
        'thermostat': 'THERMOSTAT',
        'speaker': 'SPEAKER',
        'sensor': 'SENSOR'
      };
      
      return this.devices.filter(device => device.type === typeMap[categoryType]);
    },
    
    getCategoryDeviceCount(categoryType) {
      return this.getDevicesByCategory(categoryType).length;
    },
    
    getDeviceIcon(deviceId) {
      const device = this.devices.find(d => d.id === deviceId);
      if (!device) return 'mdi-devices';
      
      switch (device.type) {
        case 'LIGHT': return 'mdi-lightbulb';
        case 'THERMOSTAT': return 'mdi-thermostat';
        case 'SPEAKER': return 'mdi-speaker';
        case 'HEADPHONES': return 'mdi-headphones';
        case 'SENSOR': return 'mdi-radio-tower';
        case 'CAMERA': return 'mdi-cctv';
        case 'LOCK': return 'mdi-lock';
        default: return 'mdi-devices';
      }
    },
    
    getDeviceIconColor(deviceId) {
      const device = this.devices.find(d => d.id === deviceId);
      if (!device) return 'grey';
      
      if (device.connectionState === 'CONNECTED') {
        return 'primary';
      } else if (device.connectionState === 'ERROR') {
        return 'error';
      }
      
      return 'grey';
    },
    
    // Automation rule methods
    addTrigger() {
      this.newRule.triggers.push({
        type: 'time',
        data: {
          hour: 8,
          minute: 0,
          daysOfWeek: [1, 2, 3, 4, 5] // Weekdays
        }
      });
    },
    
    removeTrigger(index) {
      this.newRule.triggers.splice(index, 1);
    },
    
    updateTrigger(index, type) {
      if (type === 'time') {
        this.newRule.triggers[index].data = {
          hour: 8,
          minute: 0,
          daysOfWeek: [1, 2, 3, 4, 5]
        };
      } else if (type === 'deviceState') {
        this.newRule.triggers[index].data = {
          deviceId: '',
          propertyName: 'power',
          operator: '=',
          value: 'true'
        };
      }
    },
    
    addAction() {
      this.newRule.actions.push({
        type: 'deviceCommand',
        data: {
          deviceId: '',
          command: '',
          parameters: {}
        }
      });
    },
    
    removeAction(index) {
      this.newRule.actions.splice(index, 1);
    },
    
    updateAction(index, type) {
      if (type === 'deviceCommand') {
        this.newRule.actions[index].data = {
          deviceId: '',
          command: '',
          parameters: {}
        };
      } else if (type === 'notification') {
        this.newRule.actions[index].data = {
          message: '',
          priority: 1
        };
      }
    },
    
    commandsForDevice(deviceId) {
      const device = this.devices.find(d => d.id === deviceId);
      if (!device) return [];
      
      const commands = [];
      
      if (device.capabilities.includes('POWER_TOGGLE')) {
        commands.push({ text: 'Set Power', value: 'setPower' });
      }
      
      if (device.capabilities.includes('BRIGHTNESS_CONTROL')) {
        commands.push({ text: 'Set Brightness', value: 'setBrightness' });
      }
      
      if (device.capabilities.includes('COLOR_CONTROL')) {
        commands.push({ text: 'Set Color', value: 'setColor' });
      }
      
      if (device.capabilities.includes('TEMPERATURE_CONTROL')) {
        commands.push({ text: 'Set Temperature', value: 'setTemperature' });
      }
      
      if (device.capabilities.includes('AUDIO_PLAYBACK')) {
        commands.push(
          { text: 'Play Music', value: 'playMusic' },
          { text: 'Stop Playback', value: 'stop' }
        );
      }
      
      if (device.capabilities.includes('VOLUME_CONTROL')) {
        commands.push({ text: 'Set Volume', value: 'setVolume' });
      }
      
      return commands;
    },
    
    setDefaultCommandParams(action) {
      if (action.data.command === 'setPower') {
        action.data.parameters = { power: true };
      } else if (action.data.command === 'setBrightness') {
        action.data.parameters = { level: 100 };
      } else if (action.data.command === 'setColor') {
        action.data.parameters = { 
          hue: 240, 
          saturation: 100, 
          brightness: 100 
        };
      } else if (action.data.command === 'setTemperature') {
        action.data.parameters = { temp: 72 };
      } else if (action.data.command === 'playMusic') {
        action.data.parameters = { genre: 'relaxing' };
      } else if (action.data.command === 'setVolume') {
        action.data.parameters = { level: 50 };
      } else {
        action.data.parameters = {};
      }
    },
    
    async saveAutomationRule() {
      // Validate form
      if (this.$refs.automationForm.validate()) {
        try {
          // Convert trigger data format to match backend
          const formattedRule = {
            name: this.newRule.name,
            description: this.newRule.description,
            active: this.newRule.active,
            triggers: this.newRule.triggers.map(trigger => {
              if (trigger.type === 'time') {
                return {
                  type: 'TimeTrigger',
                  hour: parseInt(trigger.data.hour),
                  minute: parseInt(trigger.data.minute),
                  daysOfWeek: trigger.data.daysOfWeek
                };
              } else if (trigger.type === 'deviceState') {
                return {
                  type: 'DeviceStateTrigger',
                  deviceId: trigger.data.deviceId,
                  propertyName: trigger.data.propertyName,
                  operator: trigger.data.operator,
                  value: trigger.data.value
                };
              }
              return null;
            }).filter(t => t !== null),
            actions: this.newRule.actions.map(action => {
              if (action.type === 'deviceCommand') {
                return {
                  type: 'DeviceCommandAction',
                  deviceId: action.data.deviceId,
                  command: {
                    name: action.data.command,
                    parameters: action.data.parameters
                  }
                };
              } else if (action.type === 'notification') {
                return {
                  type: 'NotificationAction',
                  message: action.data.message,
                  priority: action.data.priority
                };
              }
              return null;
            }).filter(a => a !== null)
          };
          
          // Create the rule
          await this.$store.dispatch('devices/createAutomationRule', formattedRule);
          
          // Reset form
          this.createAutomationDialog = false;
          this.resetNewRule();
          
          // Reload rules
          this.loadAutomationRules();
          
          this.showSnackbar('Automation rule created', 'success');
        } catch (error) {
          console.error('Failed to create automation rule:', error);
          this.showSnackbar('Failed to create automation rule', 'error');
        }
      }
    },
    
    resetNewRule() {
      this.newRule = {
        name: '',
        description: '',
        triggers: [],
        actions: [],
        active: true
      };
    },
    
    async updateAutomationRule(ruleId, rule) {
      try {
        await this.$store.dispatch('devices/updateAutomationRule', { ruleId, rule });
        this.showSnackbar('Automation rule updated', 'success');
      } catch (error) {
        console.error('Failed to update automation rule:', error);
        this.showSnackbar('Failed to update automation rule', 'error');
      }
    },
    
    async deleteAutomationRule(ruleId) {
      try {
        await this.$store.dispatch('devices/deleteAutomationRule', ruleId);
        
        // Update local rules list
        const index = this.automationRules.findIndex(rule => rule.id === ruleId);
        if (index !== -1) {
          this.automationRules.splice(index, 1);
        }
        
        this.showSnackbar('Automation rule deleted', 'success');
      } catch (error) {
        console.error('Failed to delete automation rule:', error);
        this.showSnackbar('Failed to delete automation rule', 'error');
      }
    },
    
    formatTrigger(trigger) {
      if (trigger.type === 'TimeTrigger') {
        const hour = trigger.hour.toString().padStart(2, '0');
        const minute = trigger.minute.toString().padStart(2, '0');
        return `At ${hour}:${minute}`;
      } else if (trigger.type === 'DeviceStateTrigger') {
        const device = this.devices.find(d => d.id === trigger.deviceId);
        return `When ${device ? device.name : 'device'} ${trigger.propertyName} ${trigger.operator} ${trigger.value}`;
      }
      return 'Unknown trigger';
    },
    
    formatAction(action) {
      if (action.type === 'DeviceCommandAction') {
        const device = this.devices.find(d => d.id === action.deviceId);
        return `Control ${device ? device.name : 'device'}: ${action.command.name}`;
      } else if (action.type === 'NotificationAction') {
        return `Notify: ${action.message.substring(0, 20)}${action.message.length > 20 ? '...' : ''}`;
      }
      return 'Unknown action';
    }
  }
}
</script>

<style scoped>
.device-control-container {
  position: relative;
  padding: 16px;
}

.title {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.action-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.device-categories {
  margin-bottom: 16px;
}

.device-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.no-devices {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
  color: rgba(0, 0, 0, 0.6);
}

.events-timeline {
  max-height: 300px;
  overflow-y: auto;
}

.event-item {
  display: flex;
  flex-direction: column;
}

.event-time {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
}

.trigger-chip,
.action-chip {
  display: inline-block;
  background-color: rgba(0, 0, 0, 0.05);
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 12px;
  margin-right: 8px;
  margin-bottom: 8px;
}

.automation-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.system-disabled-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
}

.system-disabled-card {
  width: 100%;
  max-width: 450px;
}
</style>


/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\ui\components\DeviceControl.vue) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\DeviceControl.vue) */
/* --- dest (C:\Users\chell\Desktop\newsal\ui\components\DeviceControl.vue) --- */
<!-- Merged master for logical file: ui\components\DeviceControl
Sources:
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\DeviceControl.vue (hash:D18EAF2E04CAF67D6863CC17846A71F0C6860584D03EC38E58EA24B95D40FB1D)
 - C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\DeviceControl.vue (hash:0A54809EE7AAE3CC1314BC1B27676AF67C6FE4D173B5F9B6C0C4A97F00D5865B)
 -->

<!-- ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\DeviceControl.vue | ext: .vue | sha: D18EAF2E04CAF67D6863CC17846A71F0C6860584D03EC38E58EA24B95D40FB1D ---- -->
[BINARY FILE - original copied to merged_sources: ui\components\DeviceControl.vue]
<!-- ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\DeviceControl.vue | ext: .vue | sha: 0A54809EE7AAE3CC1314BC1B27676AF67C6FE4D173B5F9B6C0C4A97F00D5865B ---- -->
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\DeviceControl.vue --- */
<!-- Migrated and enhanced from sallie_1.00/ui/components/DeviceControl.vue -->
<template>
  <div class="device-control">
    <h3>Device Control</h3>
    <slot></slot>
  </div>
</template>
<script>
export default {
  name: 'DeviceControl',
  props: {
    devices: {
      type: Array,
      default: () => []
    },
    theme: {
      type: String,
      default: 'light'
    }
  },
  data() {
    return {
      selectedDevice: null,
      error: '',
      loading: false,
      analytics: [],
      controlState: {},
    };
  methods: {
    selectDevice(device) {
      this.selectedDevice = device;
      this.logAnalytics('device_selected', { device });
    async controlDevice(device, action) {
      this.loading = true;
      this.error = '';
      try {
        // Simulate device control logic
        await new Promise(resolve => setTimeout(resolve, 500));
        this.controlState[device.id] = action;
        this.logAnalytics('device_control', { device, action });
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
.device-control {
  background: var(--background-secondary, #1e293b);
  border-radius: var(--border-radius, 8px);
  box-shadow: var(--shadow-md, 0 4px 6px -1px rgb(0 0 0 / 0.1));
  padding: 1em;
  margin: 1em 0;
  color: var(--text-primary, #f8fafc);
</style>

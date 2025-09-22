<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-toolbar flat color="primary" dark>
            <v-toolbar-title>Device Automations</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon @click="refresh">
              <v-icon>mdi-refresh</v-icon>
            </v-btn>
            <v-btn icon @click="openCreateDialog">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </v-toolbar>
          
          <v-card-text v-if="loading" class="text-center pa-5">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
            <div class="mt-2">Loading automations...</div>
          </v-card-text>
          
          <v-card-text v-else-if="automations.length === 0">
            <v-alert type="info" class="mb-0">
              No automations configured yet. Create your first automation to automate your devices.
            </v-alert>
          </v-card-text>
          
          <v-list v-else two-line>
            <v-list-item-group>
              <template v-for="(automation, index) in automations" :key="automation.id">
                <v-list-item @click="openEditDialog(automation)">
                  <v-list-item-avatar>
                    <v-icon 
                      :color="automation.enabled ? 'primary' : 'grey'"
                      v-text="getAutomationIcon(automation)"
                    ></v-icon>
                  </v-list-item-avatar>
                  
                  <v-list-item-content>
                    <v-list-item-title>{{ automation.name }}</v-list-item-title>
                    <v-list-item-subtitle>
                      <span v-if="automation.type === 'SCHEDULE'">
                        <v-icon small class="mr-1">mdi-clock-outline</v-icon>
                        {{ formatSchedule(automation) }}
                      </span>
                      <span v-else-if="automation.type === 'EVENT'">
                        <v-icon small class="mr-1">mdi-lightning-bolt</v-icon>
                        {{ formatTriggerEvent(automation) }}
                      </span>
                    </v-list-item-subtitle>
                  </v-list-item-content>
                  
                  <v-list-item-action>
                    <v-switch
                      v-model="automation.enabled"
                      @click.stop="toggleAutomation(automation)"
                      color="primary"
                    ></v-switch>
                  </v-list-item-action>
                </v-list-item>
                
                <v-divider 
                  v-if="index < automations.length - 1" 
                  :key="`divider-${automation.id}`"
                ></v-divider>
              </template>
            </v-list-item-group>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- Automation Dialog -->
    <v-dialog v-model="dialog" max-width="700">
      <v-card>
        <v-card-title class="headline">
          {{ isEditing ? 'Edit Automation' : 'Create Automation' }}
        </v-card-title>
        
        <v-card-text>
          <v-form ref="automationForm" v-model="formValid">
            <v-text-field
              v-model="currentAutomation.name"
              label="Automation Name"
              required
              :rules="nameRules"
            ></v-text-field>
            
            <v-select
              v-model="currentAutomation.type"
              label="Trigger Type"
              :items="automationTypes"
              item-text="text"
              item-value="value"
              required
            ></v-select>
            
            <!-- Schedule Trigger -->
            <div v-if="currentAutomation.type === 'SCHEDULE'" class="my-3 pa-3 rounded-lg grey lighten-4">
              <v-subheader class="pl-0">Schedule</v-subheader>
              
              <v-radio-group v-model="scheduleType" row>
                <v-radio label="Time of Day" value="time"></v-radio>
                <v-radio label="Interval" value="interval"></v-radio>
                <v-radio label="Sunrise/Sunset" value="sun"></v-radio>
              </v-radio-group>
              
              <v-row v-if="scheduleType === 'time'">
                <v-col cols="12" sm="6">
                  <v-dialog
                    ref="timeDialog"
                    v-model="timeDialog"
                    :return-value.sync="currentAutomation.schedule.time"
                    persistent
                    width="290px"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        v-model="currentAutomation.schedule.time"
                        label="Time"
                        prepend-icon="mdi-clock-outline"
                        readonly
                        v-bind="attrs"
                        v-on="on"
                      ></v-text-field>
                    </template>
                    <v-time-picker
                      v-if="timeDialog"
                      v-model="currentAutomation.schedule.time"
                      full-width
                    >
                      <v-spacer></v-spacer>
                      <v-btn
                        text
                        color="primary"
                        @click="timeDialog = false"
                      >
                        Cancel
                      </v-btn>
                      <v-btn
                        text
                        color="primary"
                        @click="$refs.timeDialog.save(currentAutomation.schedule.time)"
                      >
                        OK
                      </v-btn>
                    </v-time-picker>
                  </v-dialog>
                </v-col>
                
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="currentAutomation.schedule.days"
                    label="Days"
                    :items="weekdayOptions"
                    multiple
                    chips
                  ></v-select>
                </v-col>
              </v-row>
              
              <v-row v-if="scheduleType === 'interval'">
                <v-col cols="6">
                  <v-text-field
                    v-model.number="currentAutomation.schedule.interval"
                    label="Interval"
                    type="number"
                    min="1"
                  ></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-select
                    v-model="currentAutomation.schedule.unit"
                    label="Unit"
                    :items="[
                      { text: 'Minutes', value: 'minutes' },
                      { text: 'Hours', value: 'hours' }
                    ]"
                    item-text="text"
                    item-value="value"
                  ></v-select>
                </v-col>
              </v-row>
              
              <v-row v-if="scheduleType === 'sun'">
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="currentAutomation.schedule.sunEvent"
                    label="Event"
                    :items="[
                      { text: 'Sunrise', value: 'sunrise' },
                      { text: 'Sunset', value: 'sunset' }
                    ]"
                    item-text="text"
                    item-value="value"
                  ></v-select>
                </v-col>
                
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model.number="currentAutomation.schedule.offset"
                    label="Offset (minutes)"
                    type="number"
                    suffix="minutes"
                    hint="Use negative values for before, positive for after"
                    persistent-hint
                  ></v-text-field>
                </v-col>
              </v-row>
            </div>
            
            <!-- Event Trigger -->
            <div v-if="currentAutomation.type === 'EVENT'" class="my-3 pa-3 rounded-lg grey lighten-4">
              <v-subheader class="pl-0">Trigger Event</v-subheader>
              
              <v-row>
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="currentAutomation.trigger.deviceId"
                    label="Device"
                    :items="devices"
                    item-text="name"
                    item-value="id"
                    @change="onTriggerDeviceChange"
                  ></v-select>
                </v-col>
                
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="currentAutomation.trigger.event"
                    label="Event"
                    :items="getDeviceEvents(currentAutomation.trigger.deviceId)"
                  ></v-select>
                </v-col>
              </v-row>
              
              <v-row v-if="showTriggerCondition">
                <v-col cols="12" sm="4">
                  <v-select
                    v-model="currentAutomation.trigger.property"
                    label="Property"
                    :items="getTriggerDeviceProperties()"
                  ></v-select>
                </v-col>
                
                <v-col cols="12" sm="4">
                  <v-select
                    v-model="currentAutomation.trigger.operator"
                    label="Condition"
                    :items="[
                      { text: 'Equals', value: 'eq' },
                      { text: 'Not Equals', value: 'neq' },
                      { text: 'Greater Than', value: 'gt' },
                      { text: 'Less Than', value: 'lt' },
                      { text: 'Greater or Equal', value: 'gte' },
                      { text: 'Less or Equal', value: 'lte' }
                    ]"
                    item-text="text"
                    item-value="value"
                  ></v-select>
                </v-col>
                
                <v-col cols="12" sm="4">
                  <v-text-field
                    v-model="currentAutomation.trigger.value"
                    label="Value"
                  ></v-text-field>
                </v-col>
              </v-row>
            </div>
            
            <!-- Actions -->
            <div class="my-3">
              <div class="d-flex align-center">
                <v-subheader class="pl-0">Actions</v-subheader>
                <v-spacer></v-spacer>
                <v-btn
                  small
                  color="primary"
                  @click="addAction"
                >
                  <v-icon left>mdi-plus</v-icon>
                  Add Action
                </v-btn>
              </div>
              
              <div v-for="(action, index) in currentAutomation.actions" :key="`action-${index}`" class="my-3 pa-3 rounded-lg grey lighten-4">
                <div class="d-flex justify-space-between">
                  <div class="subtitle-1 font-weight-bold">Action {{ index + 1 }}</div>
                  <v-btn icon small @click="removeAction(index)">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </div>
                
                <v-row class="mt-2">
                  <v-col cols="12" sm="6">
                    <v-select
                      v-model="action.deviceId"
                      label="Device"
                      :items="devices"
                      item-text="name"
                      item-value="id"
                      @change="() => onActionDeviceChange(action)"
                    ></v-select>
                  </v-col>
                  
                  <v-col cols="12" sm="6">
                    <v-select
                      v-model="action.command"
                      label="Command"
                      :items="getDeviceCommands(action.deviceId)"
                      :disabled="!action.deviceId"
                      @change="() => onActionCommandChange(action)"
                    ></v-select>
                  </v-col>
                </v-row>
                
                <!-- Dynamic parameters based on command -->
                <v-row v-if="action.parameters">
                  <v-col v-for="(paramConfig, paramName) in getCommandParameters(action)" :key="paramName" cols="12" sm="6">
                    <!-- Boolean parameter -->
                    <v-switch
                      v-if="paramConfig.type === 'boolean'"
                      v-model="action.parameters[paramName]"
                      :label="paramConfig.label || paramName"
                      color="primary"
                    ></v-switch>
                    
                    <!-- Numeric parameter -->
                    <v-slider
                      v-else-if="paramConfig.type === 'number' && paramConfig.slider"
                      v-model="action.parameters[paramName]"
                      :label="paramConfig.label || paramName"
                      :min="paramConfig.min"
                      :max="paramConfig.max"
                      :step="paramConfig.step || 1"
                      thumb-label
                    ></v-slider>
                    
                    <v-text-field
                      v-else-if="paramConfig.type === 'number'"
                      v-model.number="action.parameters[paramName]"
                      :label="paramConfig.label || paramName"
                      type="number"
                      :min="paramConfig.min"
                      :max="paramConfig.max"
                      :step="paramConfig.step || 1"
                    ></v-text-field>
                    
                    <!-- Select parameter -->
                    <v-select
                      v-else-if="paramConfig.type === 'select'"
                      v-model="action.parameters[paramName]"
                      :label="paramConfig.label || paramName"
                      :items="paramConfig.options"
                    ></v-select>
                    
                    <!-- Default: text input -->
                    <v-text-field
                      v-else
                      v-model="action.parameters[paramName]"
                      :label="paramConfig.label || paramName"
                    ></v-text-field>
                  </v-col>
                </v-row>
                
                <!-- Delay section for all actions except first -->
                <v-row v-if="index > 0">
                  <v-col cols="12">
                    <v-checkbox
                      v-model="action.hasDelay"
                      label="Add delay before this action"
                      color="primary"
                    ></v-checkbox>
                  </v-col>
                  
                  <v-col cols="6" v-if="action.hasDelay">
                    <v-text-field
                      v-model.number="action.delay"
                      label="Delay"
                      type="number"
                      min="1"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6" v-if="action.hasDelay">
                    <v-select
                      v-model="action.delayUnit"
                      label="Unit"
                      :items="[
                        { text: 'Seconds', value: 'seconds' },
                        { text: 'Minutes', value: 'minutes' }
                      ]"
                      item-text="text"
                      item-value="value"
                    ></v-select>
                  </v-col>
                </v-row>
              </div>
              
              <v-alert
                v-if="currentAutomation.actions.length === 0"
                type="info"
                class="mt-3"
              >
                Add at least one action for this automation.
              </v-alert>
            </div>
          </v-form>
        </v-card-text>
        
        <v-divider></v-divider>
        
        <v-card-actions>
          <v-btn
            v-if="isEditing"
            color="error"
            text
            @click="confirmDelete"
            :loading="processing"
          >
            Delete
          </v-btn>
          
          <v-spacer></v-spacer>
          
          <v-btn
            text
            @click="closeDialog"
            :disabled="processing"
          >
            Cancel
          </v-btn>
          
          <v-btn
            color="primary"
            :disabled="!formValid || processing"
            :loading="processing"
            @click="saveAutomation"
          >
            {{ isEditing ? 'Update' : 'Create' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- Confirm Delete Dialog -->
    <v-dialog v-model="confirmDeleteDialog" max-width="400">
      <v-card>
        <v-card-title class="headline">Delete Automation</v-card-title>
        <v-card-text>
          Are you sure you want to delete this automation? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="confirmDeleteDialog = false">Cancel</v-btn>
          <v-btn color="error" text @click="deleteAutomation" :loading="processing">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  name: 'DeviceAutomation',
  
  data() {
    return {
      automations: [],
      devices: [],
      loading: true,
      processing: false,
      dialog: false,
      confirmDeleteDialog: false,
      isEditing: false,
      formValid: false,
      timeDialog: false,
      
      currentAutomation: this.getEmptyAutomation(),
      scheduleType: 'time',
      
      nameRules: [
        v => !!v || 'Name is required'
      ],
      
      weekdayOptions: [
        { text: 'Monday', value: 'MON' },
        { text: 'Tuesday', value: 'TUE' },
        { text: 'Wednesday', value: 'WED' },
        { text: 'Thursday', value: 'THU' },
        { text: 'Friday', value: 'FRI' },
        { text: 'Saturday', value: 'SAT' },
        { text: 'Sunday', value: 'SUN' }
      ],
      
      automationTypes: [
        { text: 'Schedule', value: 'SCHEDULE' },
        { text: 'Event Triggered', value: 'EVENT' }
      ]
    };
  },
  
  computed: {
    showTriggerCondition() {
      return this.currentAutomation.type === 'EVENT' && 
             this.currentAutomation.trigger.event === 'stateChanged';
    }
  },
  
  created() {
    this.loadData();
  },
  
  methods: {
    async loadData() {
      this.loading = true;
      try {
        const [automations, devices] = await Promise.all([
          this.$store.dispatch('devices/getAutomations'),
          this.$store.dispatch('devices/getDevices')
        ]);
        
        this.automations = automations;
        this.devices = devices;
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        this.loading = false;
      }
    },
    
    refresh() {
      this.loadData();
    },
    
    getEmptyAutomation() {
      return {
        name: '',
        type: 'SCHEDULE',
        enabled: true,
        schedule: {
          time: '08:00',
          days: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
          interval: 1,
          unit: 'hours',
          sunEvent: 'sunset',
          offset: 0
        },
        trigger: {
          deviceId: '',
          event: 'stateChanged',
          property: '',
          operator: 'eq',
          value: ''
        },
        actions: []
      };
    },
    
    openCreateDialog() {
      this.isEditing = false;
      this.currentAutomation = this.getEmptyAutomation();
      this.scheduleType = 'time';
      this.dialog = true;
    },
    
    openEditDialog(automation) {
      this.isEditing = true;
      // Create a deep copy of the automation to prevent direct modifications
      this.currentAutomation = JSON.parse(JSON.stringify(automation));
      
      // Determine schedule type
      if (this.currentAutomation.type === 'SCHEDULE') {
        if (this.currentAutomation.schedule.interval) {
          this.scheduleType = 'interval';
        } else if (this.currentAutomation.schedule.sunEvent) {
          this.scheduleType = 'sun';
        } else {
          this.scheduleType = 'time';
        }
      }
      
      this.dialog = true;
    },
    
    closeDialog() {
      this.dialog = false;
    },
    
    confirmDelete() {
      this.confirmDeleteDialog = true;
    },
    
    async deleteAutomation() {
      this.processing = true;
      try {
        await this.$store.dispatch('devices/deleteAutomation', this.currentAutomation.id);
        this.automations = this.automations.filter(a => a.id !== this.currentAutomation.id);
        this.closeDialog();
        this.confirmDeleteDialog = false;
      } catch (error) {
        console.error('Failed to delete automation:', error);
      } finally {
        this.processing = false;
      }
    },
    
    async saveAutomation() {
      if (!this.$refs.automationForm.validate()) return;
      
      // Update schedule/trigger based on selected type
      if (this.currentAutomation.type === 'SCHEDULE') {
        // Clear unnecessary schedule fields based on type
        if (this.scheduleType === 'time') {
          delete this.currentAutomation.schedule.interval;
          delete this.currentAutomation.schedule.unit;
          delete this.currentAutomation.schedule.sunEvent;
          delete this.currentAutomation.schedule.offset;
        } else if (this.scheduleType === 'interval') {
          delete this.currentAutomation.schedule.time;
          delete this.currentAutomation.schedule.days;
          delete this.currentAutomation.schedule.sunEvent;
          delete this.currentAutomation.schedule.offset;
        } else if (this.scheduleType === 'sun') {
          delete this.currentAutomation.schedule.time;
          delete this.currentAutomation.schedule.days;
          delete this.currentAutomation.schedule.interval;
          delete this.currentAutomation.schedule.unit;
        }
      }
      
      this.processing = true;
      try {
        let savedAutomation;
        if (this.isEditing) {
          savedAutomation = await this.$store.dispatch('devices/updateAutomation', this.currentAutomation);
          const index = this.automations.findIndex(a => a.id === savedAutomation.id);
          if (index >= 0) {
            this.$set(this.automations, index, savedAutomation);
          }
        } else {
          savedAutomation = await this.$store.dispatch('devices/createAutomation', this.currentAutomation);
          this.automations.push(savedAutomation);
        }
        
        this.closeDialog();
      } catch (error) {
        console.error('Failed to save automation:', error);
      } finally {
        this.processing = false;
      }
    },
    
    async toggleAutomation(automation) {
      try {
        const updatedAutomation = await this.$store.dispatch('devices/updateAutomation', {
          id: automation.id,
          enabled: automation.enabled
        });
        
        const index = this.automations.findIndex(a => a.id === updatedAutomation.id);
        if (index >= 0) {
          this.$set(this.automations, index, updatedAutomation);
        }
      } catch (error) {
        console.error('Failed to toggle automation:', error);
        // Revert the switch state on error
        automation.enabled = !automation.enabled;
      }
    },
    
    addAction() {
      this.currentAutomation.actions.push({
        deviceId: '',
        command: '',
        parameters: {},
        hasDelay: false,
        delay: 5,
        delayUnit: 'seconds'
      });
    },
    
    removeAction(index) {
      this.currentAutomation.actions.splice(index, 1);
    },
    
    getAutomationIcon(automation) {
      if (automation.type === 'SCHEDULE') {
        return 'mdi-clock-outline';
      } else if (automation.type === 'EVENT') {
        return 'mdi-lightning-bolt';
      }
      return 'mdi-home-automation';
    },
    
    formatSchedule(automation) {
      if (!automation.schedule) return '';
      
      if (automation.schedule.time) {
        const days = automation.schedule.days || [];
        if (days.length === 7) {
          return `Every day at ${automation.schedule.time}`;
        } else if (days.length === 0) {
          return `At ${automation.schedule.time}`;
        } else {
          const dayStr = days.join(', ');
          return `${dayStr} at ${automation.schedule.time}`;
        }
      } else if (automation.schedule.interval) {
        return `Every ${automation.schedule.interval} ${automation.schedule.unit}`;
      } else if (automation.schedule.sunEvent) {
        const event = automation.schedule.sunEvent === 'sunrise' ? 'sunrise' : 'sunset';
        const offset = automation.schedule.offset || 0;
        
        if (offset === 0) {
          return `At ${event}`;
        } else if (offset < 0) {
          return `${Math.abs(offset)} minutes before ${event}`;
        } else {
          return `${offset} minutes after ${event}`;
        }
      }
      
      return 'Custom schedule';
    },
    
    formatTriggerEvent(automation) {
      if (!automation.trigger || !automation.trigger.deviceId) return '';
      
      const device = this.devices.find(d => d.id === automation.trigger.deviceId);
      const deviceName = device ? device.name : 'Unknown device';
      
      if (automation.trigger.event === 'stateChanged' && automation.trigger.property) {
        const operators = {
          'eq': 'equals',
          'neq': 'does not equal',
          'gt': 'is greater than',
          'lt': 'is less than',
          'gte': 'is greater than or equal to',
          'lte': 'is less than or equal to'
        };
        
        const operator = operators[automation.trigger.operator] || automation.trigger.operator;
        return `When ${deviceName}'s ${automation.trigger.property} ${operator} ${automation.trigger.value}`;
      } else {
        let eventName = automation.trigger.event;
        
        switch (eventName) {
          case 'turnedOn': return `When ${deviceName} turns on`;
          case 'turnedOff': return `When ${deviceName} turns off`;
          case 'connected': return `When ${deviceName} connects`;
          case 'disconnected': return `When ${deviceName} disconnects`;
          default: return `When ${deviceName} ${eventName}`;
        }
      }
    },
    
    getDeviceEvents(deviceId) {
      if (!deviceId) return [];
      
      const device = this.devices.find(d => d.id === deviceId);
      if (!device) return [];
      
      // Basic events all devices should have
      const events = [
        'connected',
        'disconnected',
        'stateChanged'
      ];
      
      // Add device-specific events
      if (['LIGHT', 'SWITCH', 'OUTLET'].includes(device.type)) {
        events.push('turnedOn', 'turnedOff');
      }
      
      if (device.type === 'MOTION_SENSOR') {
        events.push('motionDetected', 'motionCleared');
      }
      
      if (device.type === 'CONTACT_SENSOR') {
        events.push('opened', 'closed');
      }
      
      if (device.type === 'THERMOSTAT') {
        events.push('modeChanged', 'temperatureChanged');
      }
      
      return events;
    },
    
    getTriggerDeviceProperties() {
      if (!this.currentAutomation.trigger.deviceId) return [];
      
      const device = this.devices.find(d => d.id === this.currentAutomation.trigger.deviceId);
      if (!device) return [];
      
      const properties = ['status'];
      
      // Add device-specific properties
      switch (device.type) {
        case 'LIGHT':
          properties.push('power', 'brightness', 'color');
          break;
        case 'SWITCH':
        case 'OUTLET':
          properties.push('power');
          break;
        case 'THERMOSTAT':
          properties.push('currentTemperature', 'targetTemperature', 'mode', 'humidity');
          break;
        case 'MOTION_SENSOR':
          properties.push('motion', 'luminance');
          break;
        case 'CONTACT_SENSOR':
          properties.push('contact', 'batteryLevel');
          break;
        case 'SPEAKER':
          properties.push('playing', 'volume', 'track');
          break;
      }
      
      return properties;
    },
    
    onTriggerDeviceChange() {
      // Reset property selection when device changes
      this.currentAutomation.trigger.property = '';
      this.currentAutomation.trigger.value = '';
    },
    
    getDeviceCommands(deviceId) {
      if (!deviceId) return [];
      
      const device = this.devices.find(d => d.id === deviceId);
      if (!device) return [];
      
      // Basic commands all devices should have
      const commands = [
        'connect',
        'disconnect'
      ];
      
      // Add device-specific commands
      switch (device.type) {
        case 'LIGHT':
          commands.push('turnOn', 'turnOff', 'setBrightness', 'setColor');
          break;
        case 'SWITCH':
        case 'OUTLET':
          commands.push('turnOn', 'turnOff');
          break;
        case 'THERMOSTAT':
          commands.push('setTemperature', 'setMode');
          break;
        case 'SPEAKER':
        case 'HEADPHONES':
          commands.push('play', 'pause', 'stop', 'setVolume', 'next', 'previous', 'playMusic');
          break;
        case 'TV':
          commands.push('turnOn', 'turnOff', 'setInput', 'setVolume', 'setChannel');
          break;
      }
      
      return commands;
    },
    
    onActionDeviceChange(action) {
      // Reset command when device changes
      action.command = '';
      action.parameters = {};
    },
    
    onActionCommandChange(action) {
      // Set up default parameters based on the command
      action.parameters = this.getDefaultParameters(action.deviceId, action.command);
    },
    
    getDefaultParameters(deviceId, command) {
      if (!deviceId || !command) return {};
      
      const device = this.devices.find(d => d.id === deviceId);
      if (!device) return {};
      
      switch (command) {
        case 'turnOn':
        case 'turnOff':
        case 'connect':
        case 'disconnect':
        case 'play':
        case 'pause':
        case 'stop':
        case 'next':
        case 'previous':
          return {};
        
        case 'setBrightness':
          return { level: 100 };
        
        case 'setColor':
          if (device.type === 'LIGHT') {
            return { hue: 0, saturation: 100, brightness: 100 };
          }
          return {};
        
        case 'setTemperature':
          if (device.type === 'THERMOSTAT') {
            return { temp: 72 };
          }
          return {};
        
        case 'setMode':
          if (device.type === 'THERMOSTAT') {
            return { mode: 'auto' };
          }
          return {};
        
        case 'setVolume':
          return { level: 50 };
        
        case 'setInput':
          if (device.type === 'TV') {
            return { input: 'hdmi1' };
          }
          return {};
        
        case 'setChannel':
          if (device.type === 'TV') {
            return { channel: '' };
          }
          return {};
        
        case 'playMusic':
          if (device.type === 'SPEAKER' || device.type === 'HEADPHONES') {
            return { genre: 'relaxing' };
          }
          return {};
        
        default:
          return {};
      }
    },
    
    getCommandParameters(action) {
      if (!action.deviceId || !action.command) return {};
      
      const device = this.devices.find(d => d.id === action.deviceId);
      if (!device) return {};
      
      switch (action.command) {
        case 'setBrightness':
          return {
            level: {
              type: 'number',
              label: 'Brightness',
              min: 0,
              max: 100,
              slider: true
            }
          };
        
        case 'setColor':
          if (device.type === 'LIGHT') {
            return {
              hue: {
                type: 'number',
                label: 'Hue',
                min: 0,
                max: 360,
                slider: true
              },
              saturation: {
                type: 'number',
                label: 'Saturation',
                min: 0,
                max: 100,
                slider: true
              },
              brightness: {
                type: 'number',
                label: 'Brightness',
                min: 0,
                max: 100,
                slider: true
              }
            };
          }
          return {};
        
        case 'setTemperature':
          if (device.type === 'THERMOSTAT') {
            return {
              temp: {
                type: 'number',
                label: 'Temperature (°F)',
                min: 60,
                max: 85,
                slider: true
              }
            };
          }
          return {};
        
        case 'setMode':
          if (device.type === 'THERMOSTAT') {
            return {
              mode: {
                type: 'select',
                label: 'Mode',
                options: ['cool', 'heat', 'auto', 'off']
              }
            };
          }
          return {};
        
        case 'setVolume':
          return {
            level: {
              type: 'number',
              label: 'Volume',
              min: 0,
              max: 100,
              slider: true
            }
          };
        
        case 'setInput':
          if (device.type === 'TV') {
            return {
              input: {
                type: 'select',
                label: 'Input',
                options: ['hdmi1', 'hdmi2', 'hdmi3', 'av', 'component', 'tuner']
              }
            };
          }
          return {};
        
        case 'setChannel':
          if (device.type === 'TV') {
            return {
              channel: {
                type: 'text',
                label: 'Channel'
              }
            };
          }
          return {};
        
        case 'playMusic':
          if (device.type === 'SPEAKER' || device.type === 'HEADPHONES') {
            return {
              genre: {
                type: 'select',
                label: 'Genre',
                options: ['relaxing', 'upbeat', 'focus', 'ambient', 'classical', 'jazz']
              }
            };
          }
          return {};
        
        default:
          return {};
      }
    }
  }
};
</script>

<style scoped>
.v-card__title.py-1 {
  padding-top: 8px;
  padding-bottom: 8px;
}
</style>

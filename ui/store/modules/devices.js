/**
 * Vuex Store Module for Device Control System
 */

import { DeviceControlSystem } from '@/core/device/DeviceControlSystem';
import { PluginRegistry } from '@/core/PluginRegistry';

export default {
  namespaced: true,
  
  state: {
    systemState: 'INITIALIZING',
    deviceList: [],
    eventListeners: [],
    automationRules: []
  },
  
  mutations: {
    SET_SYSTEM_STATE(state, systemState) {
      state.systemState = systemState;
    },
    
    SET_DEVICE_LIST(state, devices) {
      state.deviceList = devices;
    },
    
    ADD_DEVICE(state, device) {
      // Check if device already exists
      const index = state.deviceList.findIndex(d => d.id === device.id);
      if (index !== -1) {
        // Update existing device
        state.deviceList.splice(index, 1, device);
      } else {
        // Add new device
        state.deviceList.push(device);
      }
    },
    
    UPDATE_DEVICE(state, { deviceId, updates }) {
      const device = state.deviceList.find(d => d.id === deviceId);
      if (device) {
        Object.assign(device, updates);
      }
    },
    
    SET_AUTOMATION_RULES(state, rules) {
      state.automationRules = rules;
    },
    
    ADD_EVENT_LISTENER(state, listener) {
      state.eventListeners.push(listener);
    },
    
    REMOVE_EVENT_LISTENER(state, listener) {
      const index = state.eventListeners.indexOf(listener);
      if (index !== -1) {
        state.eventListeners.splice(index, 1);
      }
    }
  },
  
  actions: {
    /**
     * Initialize the device control system
     */
    async initialize({ commit, dispatch }) {
      // Get plugin registry
      const pluginRegistry = PluginRegistry.getInstance();
      
      // Create device control system
      const deviceControl = new DeviceControlSystem(pluginRegistry);
      
      // Store reference
      this.deviceControl = deviceControl;
      
      // Initialize system
      await deviceControl.initialize();
      
      // Update state
      commit('SET_SYSTEM_STATE', deviceControl.systemState.value);
      
      // Subscribe to state changes
      deviceControl.systemState.collect(state => {
        commit('SET_SYSTEM_STATE', state);
      });
      
      // Subscribe to device events
      deviceControl.deviceEvents.collect(event => {
        dispatch('handleDeviceEvent', event);
      });
      
      return deviceControl;
    },
    
    /**
     * Get list of discovered devices
     */
    async getDevices({ commit: _commit }) {
      if (!this.deviceControl) throw new Error('Device control system not initialized');
      
      const devices = this.deviceControl.getDiscoveredDevices();
      _commit('SET_DEVICE_LIST', devices);
      return devices;
    },
    
    /**
     * Start device discovery
     */
    async startDiscovery({ }, protocols) {
      if (!this.deviceControl) throw new Error('Device control system not initialized');
      
      return await this.deviceControl.startDiscovery(protocols);
    },
    
    /**
     * Stop device discovery
     */
    async stopDiscovery({ }) {
      if (!this.deviceControl) throw new Error('Device control system not initialized');
      
      this.deviceControl.stopDiscovery();
    },
    
    /**
     * Connect to device
     */
    async connectToDevice({ }, deviceId) {
      if (!this.deviceControl) throw new Error('Device control system not initialized');
      
      return await this.deviceControl.connectToDevice(deviceId);
    },
    
    /**
     * Disconnect from device
     */
    async disconnectFromDevice({ }, deviceId) {
      if (!this.deviceControl) throw new Error('Device control system not initialized');
      
      return await this.deviceControl.disconnectFromDevice(deviceId);
    },
    
    /**
     * Send command to device
     */
    async sendCommand({ }, { deviceId, command }) {
      if (!this.deviceControl) throw new Error('Device control system not initialized');
      
      return await this.deviceControl.sendCommand(deviceId, command);
    },
    
    /**
     * Get device status
     */
    async getDeviceStatus({ }, deviceId) {
      if (!this.deviceControl) throw new Error('Device control system not initialized');
      
      return await this.deviceControl.getDeviceStatus(deviceId);
    },
    
    /**
     * Get device recommendations
     */
    async getDeviceRecommendations({ }, context) {
      if (!this.deviceControl) throw new Error('Device control system not initialized');
      
      return this.deviceControl.getDeviceRecommendations(context);
    },
    
    /**
     * Subscribe to device events
     */
    async subscribeToEvents({ commit }) {
      if (!this.deviceControl) throw new Error('Device control system not initialized');
      
      // Create event emitter
      const eventEmitter = {
        listeners: [],
        
        on(event, callback) {
          this.listeners.push(callback);
          return this;
        },
        
        off(callback) {
          const index = this.listeners.indexOf(callback);
          if (index !== -1) {
            this.listeners.splice(index, 1);
          }
          return this;
        },
        
        emit(event, data) {
          this.listeners.forEach(listener => listener(data));
        }
      };
      
      // Create event handler
      const eventHandler = event => {
        eventEmitter.emit('event', event);
      };
      
      // Add to state
      commit('ADD_EVENT_LISTENER', eventHandler);
      
      return eventEmitter;
    },
    
    /**
     * Handle device events
     */
    async handleDeviceEvent({ commit, state, dispatch }, event) {
      // Process event based on type
      if (event instanceof DeviceEvent.DeviceDiscoveryEvent) {
        // Refresh device list
        dispatch('getDevices');
      } else if (event instanceof DeviceEvent.ConnectionEvent) {
        // Update device connection state
        commit('UPDATE_DEVICE', { 
          deviceId: event.deviceId,
          updates: { 
            connectionState: event.connected ? 'CONNECTED' : 'DISCONNECTED' 
          }
        });
      }
      
      // Notify event listeners
      state.eventListeners.forEach(listener => listener(event));
    },
    
    /**
     * Get automation rules
     */
    async getAutomationRules({ commit }) {
      if (!this.deviceControl) throw new Error('Device control system not initialized');
      
      const rules = this.deviceControl.getAutomationRules();
      commit('SET_AUTOMATION_RULES', rules);
      return rules;
    },
    
    /**
     * Create automation rule
     */
    async createAutomationRule({ dispatch }, rule) {
      if (!this.deviceControl) throw new Error('Device control system not initialized');
      
      const ruleId = await this.deviceControl.createAutomationRule(rule);
      
      // Refresh rules
      await dispatch('getAutomationRules');
      
      return ruleId;
    },
    
    /**
     * Update automation rule
     */
    async updateAutomationRule({ dispatch }, { ruleId, rule }) {
      if (!this.deviceControl) throw new Error('Device control system not initialized');
      
      const result = await this.deviceControl.updateAutomationRule(ruleId, rule);
      
      // Refresh rules
      await dispatch('getAutomationRules');
      
      return result;
    },
    
    /**
     * Delete automation rule
     */
    async deleteAutomationRule({ dispatch }, ruleId) {
      if (!this.deviceControl) throw new Error('Device control system not initialized');
      
      const result = await this.deviceControl.deleteAutomationRule(ruleId);
      
      // Refresh rules
      await dispatch('getAutomationRules');
      
      return result;
    }
  }
};

// Salle Persona Module
// DeviceControlDemo.js
// JavaScript port of DeviceControlDemoActivity.kt

/**
 * @typedef {Object} DeviceCommand
 * @property {string} action - Action to perform (on, off, adjust)
 * @property {string} device - Target device identifier
 * @property {Object} [parameters] - Additional parameters for the command
 */

/**
 * Demonstrates device control capabilities in Sallie
 */
class DeviceControlDemo {
  /**
   * Create a new device control demo
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.devices = new Map();
    this.commandHistory = [];
    this.active = false;
    this.connectionManager = options.connectionManager || null;
    this.voiceController = options.voiceController || null;
    this.logger = options.logger || null;
  }

  /**
   * Initialize the device control system
   * @returns {Promise<boolean>} Success status
   */
  async initialize() {
    this.active = true;
    // Use logging system instead of direct console
    if (this.logger) {
      this.logger.info("Device control demo initialized");
    }
    
    // Register some demo devices
    this.registerDemoDevices();
    
    // Connect to any available real devices if connection manager exists
    if (this.connectionManager) {
      await this.connectionManager.scanForDevices();
    }
    
    return true;
  }

  /**
   * Register sample devices for demonstration
   */
  registerDemoDevices() {
    this.devices.set("living_room_lights", {
      id: "living_room_lights",
      name: "Living Room Lights",
      type: "light",
      capabilities: ["on", "off", "dim", "color"],
      status: { power: "off", brightness: 0, color: "#FFFFFF" }
    });

    this.devices.set("bedroom_thermostat", {
      id: "bedroom_thermostat",
      name: "Bedroom Thermostat",
      type: "climate",
      capabilities: ["temperature", "mode"],
      status: { power: "on", temperature: 72, mode: "auto" }
    });

    this.devices.set("kitchen_speaker", {
      id: "kitchen_speaker",
      name: "Kitchen Speaker",
      type: "audio",
      capabilities: ["play", "pause", "volume"],
      status: { power: "off", volume: 50, playing: false }
    });
  }

  /**
   * Execute a device command
   * @param {DeviceCommand} command - Command to execute
   * @returns {Promise<Object>} Command result
   */
  async executeCommand(command) {
    // Use logging system instead of direct console
    if (this.logger) {
      this.logger.info(`Executing command: ${command.action} on ${command.device}`, command.parameters);
    }
    
    // Record in history
    this.commandHistory.push({
      timestamp: Date.now(),
      command: command
    });
    
    // Find the device
    const device = this.devices.get(command.device);
    if (!device) {
      return { success: false, message: `Device ${command.device} not found` };
    }
    
    // Execute based on action type
    switch (command.action) {
      case "on":
        device.status.power = "on";
        return { success: true, device: device.id, newState: "on" };
        
      case "off":
        device.status.power = "off";
        return { success: true, device: device.id, newState: "off" };
        
      case "adjust":
        // Handle various adjustment types
        if (command.parameters) {
          Object.keys(command.parameters).forEach(key => {
            if (device.status.hasOwnProperty(key)) {
              device.status[key] = command.parameters[key];
            }
          });
        }
        return { success: true, device: device.id, newState: device.status };
        
      default:
        return { success: false, message: `Unknown action: ${command.action}` };
    }
  }

  /**
   * Get the list of available devices
   * @returns {Array} List of devices
   */
  getDevices() {
    return Array.from(this.devices.values());
  }

  /**
   * Clean up resources
   */
  cleanup() {
    this.active = false;
    // Use logging system instead of direct console
    if (this.logger) {
      this.logger.info("Device control demo cleaned up");
    }
  }
}

module.exports = DeviceControlDemo;

/*
 * Persona: Tough love meets soul care.
 * Module: DeviceVoiceController
 * Intent: Handle functionality for DeviceVoiceController
 * Provenance-ID: 10eba214-ff76-45f2-a429-2aa3b30af6e8
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

// Salle Persona Module
// DeviceVoiceController.js (migrated from Kotlin)
// Provides natural language voice control for smart devices

class DeviceVoiceController {
    constructor(deviceControlFacade, nlpEngine) {
        this.deviceControlFacade = deviceControlFacade;
        this.nlpEngine = nlpEngine;
    }

    /**
     * Process a voice command related to device control
     * @param {string} command - The voice command as text
     * @param {function} callback - Called when the command has been processed
     */
    async processVoiceCommand(command, callback) {
        try {
            const intent = this.nlpEngine.extractIntent(command);
            let result;
            switch (intent.action) {
                case DeviceVoiceController.DeviceIntent.TURN_ON:
                    result = await this.handleTurnOnCommand(intent);
                    break;
                case DeviceVoiceController.DeviceIntent.TURN_OFF:
                    result = await this.handleTurnOffCommand(intent);
                    break;
                case DeviceVoiceController.DeviceIntent.SET_BRIGHTNESS:
                    result = await this.handleSetBrightnessCommand(intent);
                    break;
                case DeviceVoiceController.DeviceIntent.SET_TEMPERATURE:
                    result = await this.handleSetTemperatureCommand(intent);
                    break;
                case DeviceVoiceController.DeviceIntent.LOCK:
                    result = await this.handleLockCommand(intent);
                    break;
                case DeviceVoiceController.DeviceIntent.UNLOCK:
                    result = await this.handleUnlockCommand(intent);
                    break;
                case DeviceVoiceController.DeviceIntent.ACTIVATE_SCENE:
                    result = await this.handleActivateSceneCommand(intent);
                    break;
                case DeviceVoiceController.DeviceIntent.LIST_DEVICES:
                    result = await this.handleListDevicesCommand();
                    break;
                case DeviceVoiceController.DeviceIntent.LIST_SCENES:
                    result = await this.handleListScenesCommand();
                    break;
                case DeviceVoiceController.DeviceIntent.UNKNOWN:
                    result = new VoiceCommandResult(false, "I'm not sure what you want to do with your devices. Try something like 'turn on the living room lights'.", null);
                    break;
                default:
                    result = new VoiceCommandResult(false, "I don't understand that device command. Can you try again?", null);
            }
            callback(result);
        } catch (e) {
            callback(new VoiceCommandResult(false, `I had trouble processing that command: ${e.message}`, null));
        }
    }

    async handleTurnOnCommand(intent) {
        const deviceName = intent.parameters.device;
        if (!deviceName) return new VoiceCommandResult(false, "Which device would you like to turn on?", null);
        const result = await this.deviceControlFacade.turnOnDevice(deviceName);
        if (result.success) {
            return new VoiceCommandResult(true, `I've turned on the ${deviceName}`, new VisualFeedback.DeviceTurnedOn(deviceName));
        } else {
            return new VoiceCommandResult(false, `I couldn't turn on the ${deviceName}. ${result.message}`, null);
        }
    }

    async handleTurnOffCommand(intent) {
        const deviceName = intent.parameters.device;
        if (!deviceName) return new VoiceCommandResult(false, "Which device would you like to turn off?", null);
        const result = await this.deviceControlFacade.turnOffDevice(deviceName);
        if (result.success) {
            return new VoiceCommandResult(true, `I've turned off the ${deviceName}`, new VisualFeedback.DeviceTurnedOff(deviceName));
        } else {
            return new VoiceCommandResult(false, `I couldn't turn off the ${deviceName}. ${result.message}`, null);
        }
    }

    async handleSetBrightnessCommand(intent) {
        const deviceName = intent.parameters.device;
        if (!deviceName) return new VoiceCommandResult(false, "Which device would you like to adjust the brightness for?", null);
        const brightnessStr = intent.parameters.brightness;
        if (!brightnessStr) return new VoiceCommandResult(false, "What brightness level would you like to set? Please specify a percentage.", null);
        let brightness;
        try {
            brightness = parseInt(brightnessStr.replace('%', ''));
        } catch {
            return new VoiceCommandResult(false, "I didn't understand the brightness level. Please specify a percentage between 0 and 100.", null);
        }
        const result = await this.deviceControlFacade.setBrightness(deviceName, brightness);
        if (result.success) {
            return new VoiceCommandResult(true, `I've set the brightness of the ${deviceName} to ${brightness}%`, new VisualFeedback.BrightnessChanged(deviceName, brightness));
        } else {
            return new VoiceCommandResult(false, `I couldn't set the brightness of the ${deviceName}. ${result.message}`, null);
        }
    }

    async handleSetTemperatureCommand(intent) {
        const deviceName = intent.parameters.device;
        if (!deviceName) return new VoiceCommandResult(false, "Which thermostat would you like to adjust?", null);
        const temperatureStr = intent.parameters.temperature;
        if (!temperatureStr) return new VoiceCommandResult(false, "What temperature would you like to set?", null);
        let temperature;
        try {
            let numericValue = parseInt(temperatureStr.replace(/°C|°F|degrees/g, '').trim());
            if (temperatureStr.includes('°F')) {
                temperature = Math.round((numericValue - 32) * 5 / 9);
            } else {
                temperature = numericValue;
            }
        } catch {
            return new VoiceCommandResult(false, "I didn't understand the temperature setting. Please specify a number.", null);
        }
        const result = await this.deviceControlFacade.setTemperature(deviceName, temperature);
        if (result.success) {
            return new VoiceCommandResult(true, `I've set the temperature of the ${deviceName} to ${temperature}°C`, new VisualFeedback.TemperatureChanged(deviceName, temperature));
        } else {
            return new VoiceCommandResult(false, `I couldn't set the temperature of the ${deviceName}. ${result.message}`, null);
        }
    }

    async handleLockCommand(intent) {
        const deviceName = intent.parameters.device;
        if (!deviceName) return new VoiceCommandResult(false, "Which device would you like to lock?", null);
        const result = await this.deviceControlFacade.lockDevice(deviceName);
        if (result.success) {
            return new VoiceCommandResult(true, `I've locked the ${deviceName}`, new VisualFeedback.DeviceLocked(deviceName));
        } else {
            return new VoiceCommandResult(false, `I couldn't lock the ${deviceName}. ${result.message}`, null);
        }
    }

    async handleUnlockCommand(intent) {
        const deviceName = intent.parameters.device;
        if (!deviceName) return new VoiceCommandResult(false, "Which device would you like to unlock?", null);
        const result = await this.deviceControlFacade.unlockDevice(deviceName);
        if (result.success) {
            return new VoiceCommandResult(true, `I've unlocked the ${deviceName}`, new VisualFeedback.DeviceUnlocked(deviceName));
        } else {
            return new VoiceCommandResult(false, `I couldn't unlock the ${deviceName}. ${result.message}`, null);
        }
    }

    async handleActivateSceneCommand(intent) {
        const sceneName = intent.parameters.scene;
        if (!sceneName) return new VoiceCommandResult(false, "Which scene would you like to activate?", null);
        const result = await this.deviceControlFacade.executeScene(sceneName);
        if (result.success) {
            return new VoiceCommandResult(true, `I've activated the '${sceneName}' scene`, new VisualFeedback.SceneActivated(sceneName));
        } else {
            return new VoiceCommandResult(false, `I couldn't activate the '${sceneName}' scene. ${result.message}`, null);
        }
    }

    async handleListDevicesCommand() {
        const result = await this.deviceControlFacade.getDevices();
        if (result.success) {
            const devices = result.data || [];
            if (devices.length === 0) {
                return new VoiceCommandResult(true, "I don't see any devices connected at the moment.", new VisualFeedback.DeviceList([]));
            } else {
                const deviceNames = devices.map(d => d.name);
                return new VoiceCommandResult(true, `Here are your connected devices: ${deviceNames.join(', ')}`, new VisualFeedback.DeviceList(deviceNames));
            }
        } else {
            return new VoiceCommandResult(false, `I couldn't retrieve your devices. ${result.message}`, null);
        }
    }

    async handleListScenesCommand() {
        const result = await this.deviceControlFacade.listScenes();
        if (result.success) {
            const scenes = result.data || [];
            if (scenes.length === 0) {
                return new VoiceCommandResult(true, "You don't have any scenes set up yet.", new VisualFeedback.SceneList([]));
            } else {
                const sceneNames = scenes.map(s => s.name);
                return new VoiceCommandResult(true, `Here are your available scenes: ${sceneNames.join(', ')}`, new VisualFeedback.SceneList(sceneNames));
            }
        } else {
            return new VoiceCommandResult(false, `I couldn't retrieve your scenes. ${result.message}`, null);
        }
    }
}

class VoiceCommandResult {
    constructor(success, message, visualFeedback) {
        this.success = success;
        this.message = message;
        this.visualFeedback = visualFeedback;
    }
}

class VisualFeedback {
    static DeviceTurnedOn = class { constructor(deviceName) { this.deviceName = deviceName; } };
    static DeviceTurnedOff = class { constructor(deviceName) { this.deviceName = deviceName; } };
    static BrightnessChanged = class { constructor(deviceName, brightness) { this.deviceName = deviceName; this.brightness = brightness; } };
    static TemperatureChanged = class { constructor(deviceName, temperature) { this.deviceName = deviceName; this.temperature = temperature; } };
    static DeviceLocked = class { constructor(deviceName) { this.deviceName = deviceName; } };
    static DeviceUnlocked = class { constructor(deviceName) { this.deviceName = deviceName; } };
    static SceneActivated = class { constructor(sceneName) { this.sceneName = sceneName; } };
    static DeviceList = class { constructor(deviceNames) { this.deviceNames = deviceNames; } };
    static SceneList = class { constructor(sceneNames) { this.sceneNames = sceneNames; } };
}

DeviceVoiceController.DeviceIntent = {
    TURN_ON: "device.turn_on",
    TURN_OFF: "device.turn_off",
    SET_BRIGHTNESS: "device.set_brightness",
    SET_TEMPERATURE: "device.set_temperature",
    LOCK: "device.lock",
    UNLOCK: "device.unlock",
    ACTIVATE_SCENE: "device.activate_scene",
    LIST_DEVICES: "device.list_devices",
    LIST_SCENES: "device.list_scenes",
    UNKNOWN: "device.unknown"
};

module.exports = { DeviceVoiceController, VoiceCommandResult, VisualFeedback };

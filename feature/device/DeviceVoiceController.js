/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\feature\device\DeviceVoiceController.js) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\feature\device\DeviceVoiceController.js) */
/* --- dest (C:\Users\chell\Desktop\newsal\feature\device\DeviceVoiceController.js) --- */
/* Merged master for logical file: feature\device\DeviceVoiceController
Sources:
 - C:\Users\chell\Desktop\Sallie\merged_sallie\feature\device\DeviceVoiceController.js (hash:35383FE3759283E0D66524F7B89E7087FC2A8F361E3F0368C9DD7CE57DFF5A35)
 - C:\Users\chell\Desktop\Sallie\merged_sallie\feature\device\DeviceVoiceController.kt (hash:9DD1900016E64518030A07B1863294C73033E59AA7E5D4B2812CE3ACFD3C0509)
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\feature\device\DeviceVoiceController.js (hash:7EC6AEEF5F0F27B6A89746CD2BA06763179585D5C49DAD44956794631136C971)
 */

/* ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\feature\device\DeviceVoiceController.js | ext: .js | sha: 35383FE3759283E0D66524F7B89E7087FC2A8F361E3F0368C9DD7CE57DFF5A35 ---- */
[BINARY FILE - original copied to merged_sources: feature\device\DeviceVoiceController.js]
/* ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\feature\device\DeviceVoiceController.kt | ext: .kt | sha: 9DD1900016E64518030A07B1863294C73033E59AA7E5D4B2812CE3ACFD3C0509 ---- */
[BINARY FILE - original copied to merged_sources: feature\device\DeviceVoiceController.kt]
/* ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\feature\device\DeviceVoiceController.js | ext: .js | sha: 7EC6AEEF5F0F27B6A89746CD2BA06763179585D5C49DAD44956794631136C971 ---- */
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\feature\device\DeviceVoiceController.js --- */
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
                case DeviceVoiceController.DeviceIntent.SET_BRIGHTNESS:
                    result = await this.handleSetBrightnessCommand(intent);
                case DeviceVoiceController.DeviceIntent.SET_TEMPERATURE:
                    result = await this.handleSetTemperatureCommand(intent);
                case DeviceVoiceController.DeviceIntent.LOCK:
                    result = await this.handleLockCommand(intent);
                case DeviceVoiceController.DeviceIntent.UNLOCK:
                    result = await this.handleUnlockCommand(intent);
                case DeviceVoiceController.DeviceIntent.ACTIVATE_SCENE:
                    result = await this.handleActivateSceneCommand(intent);
                case DeviceVoiceController.DeviceIntent.LIST_DEVICES:
                    result = await this.handleListDevicesCommand();
                case DeviceVoiceController.DeviceIntent.LIST_SCENES:
                    result = await this.handleListScenesCommand();
                case DeviceVoiceController.DeviceIntent.UNKNOWN:
                    result = new VoiceCommandResult(false, "I'm not sure what you want to do with your devices. Try something like 'turn on the living room lights'.", null);
                default:
                    result = new VoiceCommandResult(false, "I don't understand that device command. Can you try again?", null);
            }
            callback(result);
        } catch (e) {
            callback(new VoiceCommandResult(false, `I had trouble processing that command: ${e.message}`, null));
        }
    async handleTurnOnCommand(intent) {
        const deviceName = intent.parameters.device;
        if (!deviceName) return new VoiceCommandResult(false, "Which device would you like to turn on?", null);
        const result = await this.deviceControlFacade.turnOnDevice(deviceName);
        if (result.success) {
            return new VoiceCommandResult(true, `I've turned on the ${deviceName}`, new VisualFeedback.DeviceTurnedOn(deviceName));
        } else {
            return new VoiceCommandResult(false, `I couldn't turn on the ${deviceName}. ${result.message}`, null);
    async handleTurnOffCommand(intent) {
        if (!deviceName) return new VoiceCommandResult(false, "Which device would you like to turn off?", null);
        const result = await this.deviceControlFacade.turnOffDevice(deviceName);
            return new VoiceCommandResult(true, `I've turned off the ${deviceName}`, new VisualFeedback.DeviceTurnedOff(deviceName));
            return new VoiceCommandResult(false, `I couldn't turn off the ${deviceName}. ${result.message}`, null);
    async handleSetBrightnessCommand(intent) {
        if (!deviceName) return new VoiceCommandResult(false, "Which device would you like to adjust the brightness for?", null);
        const brightnessStr = intent.parameters.brightness;
        if (!brightnessStr) return new VoiceCommandResult(false, "What brightness level would you like to set? Please specify a percentage.", null);
        let brightness;
            brightness = parseInt(brightnessStr.replace('%', ''));
        } catch {
            return new VoiceCommandResult(false, "I didn't understand the brightness level. Please specify a percentage between 0 and 100.", null);
        const result = await this.deviceControlFacade.setBrightness(deviceName, brightness);
            return new VoiceCommandResult(true, `I've set the brightness of the ${deviceName} to ${brightness}%`, new VisualFeedback.BrightnessChanged(deviceName, brightness));
            return new VoiceCommandResult(false, `I couldn't set the brightness of the ${deviceName}. ${result.message}`, null);
    async handleSetTemperatureCommand(intent) {
        if (!deviceName) return new VoiceCommandResult(false, "Which thermostat would you like to adjust?", null);
        const temperatureStr = intent.parameters.temperature;
        if (!temperatureStr) return new VoiceCommandResult(false, "What temperature would you like to set?", null);
        let temperature;
            let numericValue = parseInt(temperatureStr.replace(/°C|°F|degrees/g, '').trim());
            if (temperatureStr.includes('°F')) {
                temperature = Math.round((numericValue - 32) * 5 / 9);
            } else {
                temperature = numericValue;
            return new VoiceCommandResult(false, "I didn't understand the temperature setting. Please specify a number.", null);
        const result = await this.deviceControlFacade.setTemperature(deviceName, temperature);
            return new VoiceCommandResult(true, `I've set the temperature of the ${deviceName} to ${temperature}°C`, new VisualFeedback.TemperatureChanged(deviceName, temperature));
            return new VoiceCommandResult(false, `I couldn't set the temperature of the ${deviceName}. ${result.message}`, null);
    async handleLockCommand(intent) {
        if (!deviceName) return new VoiceCommandResult(false, "Which device would you like to lock?", null);
        const result = await this.deviceControlFacade.lockDevice(deviceName);
            return new VoiceCommandResult(true, `I've locked the ${deviceName}`, new VisualFeedback.DeviceLocked(deviceName));
            return new VoiceCommandResult(false, `I couldn't lock the ${deviceName}. ${result.message}`, null);
    async handleUnlockCommand(intent) {
        if (!deviceName) return new VoiceCommandResult(false, "Which device would you like to unlock?", null);
        const result = await this.deviceControlFacade.unlockDevice(deviceName);
            return new VoiceCommandResult(true, `I've unlocked the ${deviceName}`, new VisualFeedback.DeviceUnlocked(deviceName));
            return new VoiceCommandResult(false, `I couldn't unlock the ${deviceName}. ${result.message}`, null);
    async handleActivateSceneCommand(intent) {
        const sceneName = intent.parameters.scene;
        if (!sceneName) return new VoiceCommandResult(false, "Which scene would you like to activate?", null);
        const result = await this.deviceControlFacade.executeScene(sceneName);
            return new VoiceCommandResult(true, `I've activated the '${sceneName}' scene`, new VisualFeedback.SceneActivated(sceneName));
            return new VoiceCommandResult(false, `I couldn't activate the '${sceneName}' scene. ${result.message}`, null);
    async handleListDevicesCommand() {
        const result = await this.deviceControlFacade.getDevices();
            const devices = result.data || [];
            if (devices.length === 0) {
                return new VoiceCommandResult(true, "I don't see any devices connected at the moment.", new VisualFeedback.DeviceList([]));
                const deviceNames = devices.map(d => d.name);
                return new VoiceCommandResult(true, `Here are your connected devices: ${deviceNames.join(', ')}`, new VisualFeedback.DeviceList(deviceNames));
            return new VoiceCommandResult(false, `I couldn't retrieve your devices. ${result.message}`, null);
    async handleListScenesCommand() {
        const result = await this.deviceControlFacade.listScenes();
            const scenes = result.data || [];
            if (scenes.length === 0) {
                return new VoiceCommandResult(true, "You don't have any scenes set up yet.", new VisualFeedback.SceneList([]));
                const sceneNames = scenes.map(s => s.name);
                return new VoiceCommandResult(true, `Here are your available scenes: ${sceneNames.join(', ')}`, new VisualFeedback.SceneList(sceneNames));
            return new VoiceCommandResult(false, `I couldn't retrieve your scenes. ${result.message}`, null);
}
class VoiceCommandResult {
    constructor(success, message, visualFeedback) {
        this.success = success;
        this.message = message;
        this.visualFeedback = visualFeedback;
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

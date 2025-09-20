/*
 * Sallie 1.0 Module
  * Persona: Tough love meets soul care.
   * Function: Main application orchestration and user interface logic.
    * Got it, love.
     */


const { SallieBrain } = require('./core/SallieBrain.js');
const { SallieInterface } = require('./ui/SallieInterface.js');
const AdaptivePersonaEngine = require('./core/AdaptivePersonaEngine.js');
const PersonalityBridge = require('./core/PersonalityBridge.js');
const EmotionalIntelligenceModule = require('./feature/src/EmotionalIntelligenceModule.js');
const AutonomousTaskSystem = require('./feature/src/AutonomousTaskSystem.js');
const AutonomousProgrammingSystem = require('./feature/src/AutonomousProgrammingSystem.js');
const AdvancedLanguageUnderstanding = require('./feature/src/AdvancedLanguageUnderstanding.js');
const AdvancedMemorySystem = require('./feature/src/AdvancedMemorySystem.js');
const CreativeResourcefulSystem = require('./feature/src/CreativeResourcefulSystem.js');

class SallieApp {
        constructor() {
                this.brain = new SallieBrain();
                this.interface = new SallieInterface();
                this.personaEngine = new AdaptivePersonaEngine();
                this.personalityBridge = new PersonalityBridge(this.personaEngine);
                this.emotionModule = new EmotionalIntelligenceModule();
                this.taskSystem = new AutonomousTaskSystem();
                this.programmingSystem = new AutonomousProgrammingSystem();
                this.languageSystem = new AdvancedLanguageUnderstanding();
                this.memorySystem = new AdvancedMemorySystem();
                this.creativitySystem = new CreativeResourcefulSystem();
                this.initialized = false;
        }

        async initialize() {
                if (this.initialized) return;
                try {
                        this.interface.updateSystemStatus('initializing', 'Waking up...');
                        await this.brain.initialize();
                        await this.interface.initialize();
                        // Connect all systems
                        this.connectSystems();
                        this.initialized = true;
                        this.interface.updateSystemStatus('ready', 'Ready to help');
                        console.log('🎯 Sallie 2.0 initialized successfully');
                } catch (error) {
                        this.interface.updateSystemStatus('error', 'Initialization failed');
                        console.error('Initialization error:', error);
                }
        }

        connectSystems() {
                // Connect persona engine to interface and brain
                this.brain.setPersonaEngine(this.personaEngine);
                this.brain.setPersonalityBridge(this.personalityBridge);
                this.brain.setEmotionModule(this.emotionModule);
                this.brain.setTaskSystem(this.taskSystem);
                this.brain.setProgrammingSystem(this.programmingSystem);
                this.brain.setLanguageSystem(this.languageSystem);
                this.brain.setMemorySystem(this.memorySystem);
                this.brain.setCreativitySystem(this.creativitySystem);
                this.interface.setBrain(this.brain);
        }

        // ...other methods...
}
module.exports = SallieApp;

/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\app.js) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\app.js) */
/* --- dest (C:\Users\chell\Desktop\newsal\app.js) --- */
/* Merged master for logical file: .\app
Sources:
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\app.js (hash:22BCE8C528DAFD6DD700E1E732110846817BE39F0BDD3BA574E0C4571DD22141)
 - C:\Users\chell\Desktop\Sallie\merged_sallie\app.js (hash:B58A47FE3ED665350DCACF792E40D0F2DC861EE0994097EE4F115B6B99673CD7)
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\App.vue (hash:B72BD8889F655BC75C00672C56257F406DDA8F164CC9B16E49953E153ECD28C6)
 - C:\Users\chell\Desktop\Sallie\merged_sallie\App.vue (hash:C9B3412AA4EBE2911F1417062A76B47B7AE04C8F554636319A30E7431D26EA50)
 */

/* ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\app.js | ext: .js | sha: 22BCE8C528DAFD6DD700E1E732110846817BE39F0BDD3BA574E0C4571DD22141 ---- */
[BINARY FILE - original copied to merged_sources: app.js]
/* ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\app.js | ext: .js | sha: B58A47FE3ED665350DCACF792E40D0F2DC861EE0994097EE4F115B6B99673CD7 ---- */
/* ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\App.vue | ext: .vue | sha: B72BD8889F655BC75C00672C56257F406DDA8F164CC9B16E49953E153ECD28C6 ---- */
[BINARY FILE - original copied to merged_sources: App.vue]
/* ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\App.vue | ext: .vue | sha: C9B3412AA4EBE2911F1417062A76B47B7AE04C8F554636319A30E7431D26EA50 ---- */
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\app.js --- */
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
        // ...other methods...
}
module.exports = SallieApp;

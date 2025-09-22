/*
 * Sallie 1.0 Module
  * Persona: Tough love meets soul care.
   * Function: Main orchestration of Sallie's cognitive and emotional systems.
    * Got it, love.
     */

     import { MemorySystem } from './MemorySystem.js';
     import { ValuesSystem } from './ValuesSystem.js';
     import { PersonaEngine } from './PersonaEngine.js';
     import { OpenAIIntegration } from '../ai/OpenAIIntegration.js';
     import { EmotionalIntelligence } from '../ai/EmotionalIntelligence.js';
     import { FeatureRegistry } from '../feature/FeatureRegistry.js';

     export class SallieBrain {
         constructor() {
                 this.initialized = false;
                         this.currentContext = {
                                     conversation: [],
                                                 userState: 'neutral',
                                                             sessionStartTime: Date.now(),
                                                                         lastInteractionTime: null
                                                                                 };
                                                                                         
                                                                                                 // Initialize core systems
                                                                                                         this.memory = new MemorySystem();
                                                                                                                 this.values = new ValuesSystem();
                                                                                                                         this.persona = new PersonaEngine();
                                                                                                                                 this.ai = new OpenAIIntegration();
                                                                                                                                         this.emotions = new EmotionalIntelligence();
                                                                                                                                                 
                                                                                                                                                         // Register systems with feature registry
                                                                                                                                                                 FeatureRegistry.register('memory', this.memory);
                                                                                                                                                                 

/*
 * Sallie 1.0 Module
  * Persona: Tough love meets soul care.
   * Function: Main orchestration of Sallie's cognitive and emotional systems.
    * Got it, love.
     */

import { MemorySystem } from './MemorySystem.js';
import { ValuesSystem } from './ValuesSystem.js';
import { PersonaEngine } from './PersonaEngine.js';
import { OpenAIIntegration } from '../ai/OpenAIIntegration.js';
import { EmotionalIntelligence } from '../ai/EmotionalIntelligence.js';
import { FeatureRegistry } from '../feature/FeatureRegistry.js';
import { IdentityManager } from '../identity/IdentityManager.js';
import { OnboardingFlow } from '../onboarding/OnboardingFlow.js';
import { PersonaCore } from '../personaCore/PersonaCore.js';
import { ResponseTemplates } from '../responseTemplates/ResponseTemplates.js';
import { ToneManager } from '../tone/ToneManager.js';

export class SallieBrain {
        constructor() {
                this.initialized = false;
                this.currentContext = {
                        conversation: [],
                        userState: 'neutral',
                        sessionStartTime: Date.now(),
                        lastInteractionTime: null
                };

                // Initialize core systems
                this.memory = new MemorySystem();
                this.values = new ValuesSystem();
                this.persona = new PersonaEngine();
                this.ai = new OpenAIIntegration();
                this.emotions = new EmotionalIntelligence();
                this.identity = new IdentityManager();
                this.onboarding = new OnboardingFlow(this.identity, this.persona);
                this.personaCore = new PersonaCore(this.persona, /* AdaptivePersonaEngine instance here if needed */);
                this.responseTemplates = new ResponseTemplates();
                this.toneManager = new ToneManager();

                // Register systems with feature registry
                FeatureRegistry.register('memory', this.memory);
                FeatureRegistry.register('values', this.values);
                FeatureRegistry.register('persona', this.persona);
                FeatureRegistry.register('ai', this.ai);
                FeatureRegistry.register('emotions', this.emotions);
                FeatureRegistry.register('identity', this.identity);
                FeatureRegistry.register('onboarding', this.onboarding);
                FeatureRegistry.register('personaCore', this.personaCore);
                FeatureRegistry.register('responseTemplates', this.responseTemplates);
                FeatureRegistry.register('toneManager', this.toneManager);
        }

        initializeAll() {
                this.memory.initialize?.();
                this.values.initialize?.();
                this.persona.initialize?.();
                this.ai.initialize?.();
                this.emotions.initialize?.();
                // Add more initialization as needed
                this.initialized = true;
        }

        onboardUser(userId, profile) {
                this.identity.registerUser(userId, profile);
                return this.onboarding.startOnboarding(userId);
        }

        generateResponse(message, userId) {
                const tone = this.toneManager.analyzeTone(message);
                const template = this.responseTemplates.getTemplate(tone);
                // Persona evolution and emotional analysis
                this.personaCore.evolvePersona({ trait: tone, value: 1, context: message });
                this.emotions.analyzeMessage?.(message);
                return template;
        }
}


/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\core\SallieBrain.js) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\core\SallieBrain.js) */
/* --- dest (C:\Users\chell\Desktop\newsal\core\SallieBrain.js) --- */
/* Merged master for logical file: core\SallieBrain
Sources:
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\core\SallieBrain.js (hash:79166D8D3F2D25063FBB1F440E02DB445F42237939AB265507974BE841F46C6F)
 - C:\Users\chell\Desktop\Sallie\merged_sallie\core\SallieBrain.js (hash:2CD7E2BA776FBD2E4858AAD3857A71E6AED7FB5A7995A63F0833BBD42616FACB)
 */

/* ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\core\SallieBrain.js | ext: .js | sha: 79166D8D3F2D25063FBB1F440E02DB445F42237939AB265507974BE841F46C6F ---- */
[BINARY FILE - original copied to merged_sources: core\SallieBrain.js]
/* ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\core\SallieBrain.js | ext: .js | sha: 2CD7E2BA776FBD2E4858AAD3857A71E6AED7FB5A7995A63F0833BBD42616FACB ---- */
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\core\SallieBrain.js --- */
/*
 * Sallie 1.0 Module
  * Persona: Tough love meets soul care.
   * Function: Main orchestration of Sallie's cognitive and emotional systems.
    * Got it, love.
     */
     import { MemorySystem } from './MemorySystem.js';
     import { ValuesSystem } from './ValuesSystem.js';
     import { PersonaEngine } from './PersonaEngine.js';
     import { OpenAIIntegration } from '../ai/OpenAIIntegration.js';
     import { EmotionalIntelligence } from '../ai/EmotionalIntelligence.js';
     import { FeatureRegistry } from '../feature/FeatureRegistry.js';
     export class SallieBrain {
         constructor() {
                 this.initialized = false;
                         this.currentContext = {
                                     conversation: [],
                                                 userState: 'neutral',
                                                             sessionStartTime: Date.now(),
                                                                         lastInteractionTime: null
                                                                                 };
                                                                                         
                                                                                                 // Initialize core systems
                                                                                                         this.memory = new MemorySystem();
                                                                                                                 this.values = new ValuesSystem();
                                                                                                                         this.persona = new PersonaEngine();
                                                                                                                                 this.ai = new OpenAIIntegration();
                                                                                                                                         this.emotions = new EmotionalIntelligence();
                                                                                                                                                 
                                                                                                                                                         // Register systems with feature registry
                                                                                                                                                                 FeatureRegistry.register('memory', this.memory);
                                                                                                                                                                 

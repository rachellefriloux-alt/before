/*
 * Sallie 1.0 Module
  * Persona: Tough love meets soul care.
   * Function: User interface management and interaction handling.
    * Got it, love.
     */

     export class SallieInterface {
         constructor() {
                 this.initialized = false;
                         this.elements = {};
                                 this.onUserMessage = null;
                                         this.onValuesChange = null;
                                                 this.typingIndicatorVisible = false;
                                                         this.valuesVisible = false;
                                                             }

                                                                 async initialize() {
                                                                         try {
                                                                                     this.bindElements();
                                                                                                 this.attachEventListeners();
                                                                                                             this.setupAutoResize();
                                                                                                                         this.initialized = true;
                                                                                                                                     console.log('🎨 Sallie interface initialized');
                                                                                                                                             } catch (error) {
                                                                                                                                                         console.error('Failed to initialize Sallie interface:', error);
                                                                                                                                                                     throw error;
                                                                                                                                                                             }
                                                                                                                                                                                 }

                                                                                                                                                                                     bindElements() {
                                                                                                                                                                                             // Core elements
                                                                                                                                                                                                     this.elements.statusIndicator = document.getElementById('status-indicator');
                                                                                                                                                                                                             this.elements.statusText = document.getElementById('status-text');
                                                                                                                                                                                                                     this.elements.conversation = document.getElementById('conversation');
                                                                                                                                                                                                                             this.elements.messageForm = document.getElementById('message-form');
                                                                                                                                                                                                                             

/*
 * Sallie 1.0 Module
  * Persona: Tough love meets soul care.
   * Function: User interface management and interaction handling.
    * Got it, love.
     */

     export class SallieInterface {
         constructor() {
                 this.initialized = false;
                         this.elements = {};
                                 this.onUserMessage = null;
                                         this.onValuesChange = null;
                                                 this.typingIndicatorVisible = false;
                                                         this.valuesVisible = false;
                                                             }

                                                                 async initialize() {
                                                                         try {
                                                                                     this.bindElements();
                                                                                                 this.attachEventListeners();
                                                                                                             this.setupAutoResize();
                                                                                                                         this.initialized = true;
                                                                                                                                     console.log('🎨 Sallie interface initialized');
                                                                                                                                             } catch (error) {
                                                                                                                                                         console.error('Failed to initialize Sallie interface:', error);
                                                                                                                                                                     throw error;
                                                                                                                                                                             }
                                                                                                                                                                                 }

                                                                                                                                                                                     bindElements() {
                                                                                                                                                                                             // Core elements
                                                                                                                                                                                                     this.elements.statusIndicator = document.getElementById('status-indicator');
                                                                                                                                                                                                             this.elements.statusText = document.getElementById('status-text');
                                                                                                                                                                                                                     this.elements.conversation = document.getElementById('conversation');
                                                                                                                                                                                                                             this.elements.messageForm = document.getElementById('message-form');
                                                                                                                                                                                                                             

/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\ui\SallieInterface.js) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\ui\SallieInterface.js) */
/* --- dest (C:\Users\chell\Desktop\newsal\ui\SallieInterface.js) --- */
/* Merged master for logical file: ui\SallieInterface
Sources:
 - C:\Users\chell\Desktop\Sallie\merged_sallie\ui\SallieInterface.js (hash:E2D963FF805EE0FA33C85CC54CC8E24CFFE2327B2E22DA0B7B9F677089191435)
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\SallieInterface.js (hash:FE0F46481C1B3A90B42796DCC2DA38F61ABFC4203689676C8CF9214C70D2B0B5)
 */

/* ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\ui\SallieInterface.js | ext: .js | sha: E2D963FF805EE0FA33C85CC54CC8E24CFFE2327B2E22DA0B7B9F677089191435 ---- */
[BINARY FILE - original copied to merged_sources: ui\SallieInterface.js]
/* ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\SallieInterface.js | ext: .js | sha: FE0F46481C1B3A90B42796DCC2DA38F61ABFC4203689676C8CF9214C70D2B0B5 ---- */
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\ui\SallieInterface.js --- */
/*
 * Sallie 1.0 Module
  * Persona: Tough love meets soul care.
   * Function: User interface management and interaction handling.
    * Got it, love.
     */
     export class SallieInterface {
         constructor() {
                 this.initialized = false;
                         this.elements = {};
                                 this.onUserMessage = null;
                                         this.onValuesChange = null;
                                                 this.typingIndicatorVisible = false;
                                                         this.valuesVisible = false;
                                                             }
                                                                 async initialize() {
                                                                         try {
                                                                                     this.bindElements();
                                                                                                 this.attachEventListeners();
                                                                                                             this.setupAutoResize();
                                                                                                                         this.initialized = true;
                                                                                                                                     console.log('🎨 Sallie interface initialized');
                                                                                                                                             } catch (error) {
                                                                                                                                                         console.error('Failed to initialize Sallie interface:', error);
                                                                                                                                                                     throw error;
                                                                                                                                                                             }
                                                                                                                                                                                 }
                                                                                                                                                                                     bindElements() {
                                                                                                                                                                                             // Core elements
                                                                                                                                                                                                     this.elements.statusIndicator = document.getElementById('status-indicator');
                                                                                                                                                                                                             this.elements.statusText = document.getElementById('status-text');
                                                                                                                                                                                                                     this.elements.conversation = document.getElementById('conversation');
                                                                                                                                                                                                                             this.elements.messageForm = document.getElementById('message-form');
                                                                                                                                                                                                                             

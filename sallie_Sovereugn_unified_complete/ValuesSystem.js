/*
 * Sallie 1.0 Module
  * Persona: Tough love meets soul care.
   * Function: User values system for alignment and reflection.
    * Got it, love.
     */

     export class ValuesSystem {
         constructor() {
                 this.values = new Map();
                         this.alignmentHistory = [];
                                 this.initialized = false;
                                     }

                                         async initialize() {
                                                 try {
                                                             this.loadFromStorage();
                                                                         this.initialized = true;
                                                                                     console.log('💎 Values system initialized');
                                                                                             } catch (error) {
                                                                                                         console.error('Failed to initialize values system:', error);
                                                                                                                     throw error;
                                                                                                                             }
                                                                                                                                 }

                                                                                                                                     getAll() {
                                                                                                                                             return Array.from(this.values.values());
                                                                                                                                                 }

                                                                                                                                                     getActive() {
                                                                                                                                                             return Array.from(this.values.values()).filter(value => value.active);
                                                                                                                                                                 }

                                                                                                                                                                     add(valueText) {
                                                                                                                                                                             if (!valueText || valueText.trim().length === 0) {
                                                                                                                                                                                         return false;
                                                                                                                                                                                                 }

                                                                                                                                                                                                         const valueId = this.generateId();
                                                                                                                                                                                                                 const value = {
                                                                                                                                                                                                                             id: valueId,
                                                                                                                                                                                                                                         text: valueText.trim(),
                                                                                                                                                                                                                                                     active: true,
                                                                                                                                                                                                                                                                 createdAt: Date.now(),
                                                                                                                                                                                                                                                                             reinforcementCount: 0,
                                                                                                                                                                                                                                                                             

/*
 * Sallie 1.0 Module
  * Persona: Tough love meets soul care.
   * Function: User values system for alignment and reflection.
    * Got it, love.
     */

     export class ValuesSystem {
         constructor() {
                 this.values = new Map();
                         this.alignmentHistory = [];
                                 this.initialized = false;
                                     }

                                         async initialize() {
                                                 try {
                                                             this.loadFromStorage();
                                                                         this.initialized = true;
                                                                                     console.log('💎 Values system initialized');
                                                                                             } catch (error) {
                                                                                                         console.error('Failed to initialize values system:', error);
                                                                                                                     throw error;
                                                                                                                             }
                                                                                                                                 }

                                                                                                                                     getAll() {
                                                                                                                                             return Array.from(this.values.values());
                                                                                                                                                 }

                                                                                                                                                     getActive() {
                                                                                                                                                             return Array.from(this.values.values()).filter(value => value.active);
                                                                                                                                                                 }

                                                                                                                                                                     add(valueText) {
                                                                                                                                                                             if (!valueText || valueText.trim().length === 0) {
                                                                                                                                                                                         return false;
                                                                                                                                                                                                 }

                                                                                                                                                                                                         const valueId = this.generateId();
                                                                                                                                                                                                                 const value = {
                                                                                                                                                                                                                             id: valueId,
                                                                                                                                                                                                                                         text: valueText.trim(),
                                                                                                                                                                                                                                                     active: true,
                                                                                                                                                                                                                                                                 createdAt: Date.now(),
                                                                                                                                                                                                                                                                             reinforcementCount: 0,
                                                                                                                                                                                                                                                                             

/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\core\ValuesSystem.js) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\core\ValuesSystem.js) */
/* --- dest (C:\Users\chell\Desktop\newsal\core\ValuesSystem.js) --- */
/* Merged master for logical file: core\ValuesSystem
Sources:
 - C:\Users\chell\Desktop\Sallie\merged_sallie\core\ValuesSystem.js (hash:987B9455C2A86EEE4334D69FC3E12DCA4246949BB6076768C10D744DEFA6B5FE)
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\core\ValuesSystem.js (hash:30972CDDED5482D5ED3C0167F294FDD29D4BA7220B0EC7E325EE45BE82C7DCFE)
 */

/* ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\core\ValuesSystem.js | ext: .js | sha: 987B9455C2A86EEE4334D69FC3E12DCA4246949BB6076768C10D744DEFA6B5FE ---- */
[BINARY FILE - original copied to merged_sources: core\ValuesSystem.js]
/* ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\core\ValuesSystem.js | ext: .js | sha: 30972CDDED5482D5ED3C0167F294FDD29D4BA7220B0EC7E325EE45BE82C7DCFE ---- */
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\core\ValuesSystem.js --- */
/*
 * Sallie 1.0 Module
  * Persona: Tough love meets soul care.
   * Function: User values system for alignment and reflection.
    * Got it, love.
     */
     export class ValuesSystem {
         constructor() {
                 this.values = new Map();
                         this.alignmentHistory = [];
                                 this.initialized = false;
                                     }
                                         async initialize() {
                                                 try {
                                                             this.loadFromStorage();
                                                                         this.initialized = true;
                                                                                     console.log('💎 Values system initialized');
                                                                                             } catch (error) {
                                                                                                         console.error('Failed to initialize values system:', error);
                                                                                                                     throw error;
                                                                                                                             }
                                                                                                                                 }
                                                                                                                                     getAll() {
                                                                                                                                             return Array.from(this.values.values());
                                                                                                                                                 }
                                                                                                                                                     getActive() {
                                                                                                                                                             return Array.from(this.values.values()).filter(value => value.active);
                                                                                                                                                                 }
                                                                                                                                                                     add(valueText) {
                                                                                                                                                                             if (!valueText || valueText.trim().length === 0) {
                                                                                                                                                                                         return false;
                                                                                                                                                                                                 }
                                                                                                                                                                                                         const valueId = this.generateId();
                                                                                                                                                                                                                 const value = {
                                                                                                                                                                                                                             id: valueId,
                                                                                                                                                                                                                                         text: valueText.trim(),
                                                                                                                                                                                                                                                     active: true,
                                                                                                                                                                                                                                                                 createdAt: Date.now(),
                                                                                                                                                                                                                                                                             reinforcementCount: 0,
                                                                                                                                                                                                                                                                             

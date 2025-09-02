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
                                                                                                                                                                                                                                                                             
/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\feature\FeatureRegistry.js) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\feature\FeatureRegistry.js) */
/* --- dest (C:\Users\chell\Desktop\newsal\feature\FeatureRegistry.js) --- */
/* Merged master for logical file: feature\FeatureRegistry
Sources:
 - C:\Users\chell\Desktop\Sallie\merged_sallie\feature\FeatureRegistry.js (hash:C79CFB2D2BECC6534C0A9E85FEC2373E7E090C21FCE288840ABFF95E7841A096)
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\feature\FeatureRegistry.js (hash:5E9E7A7C7C77FFF994838C73FABF95ED5765F3CC278FBA4923775175DC92248C)
 */

/* ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\feature\FeatureRegistry.js | ext: .js | sha: C79CFB2D2BECC6534C0A9E85FEC2373E7E090C21FCE288840ABFF95E7841A096 ---- */
[BINARY FILE - original copied to merged_sources: feature\FeatureRegistry.js]
/* ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\feature\FeatureRegistry.js | ext: .js | sha: 5E9E7A7C7C77FFF994838C73FABF95ED5765F3CC278FBA4923775175DC92248C ---- */
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\feature\FeatureRegistry.js --- */
/*
 * Sallie 1.0 Module
  * Persona: Tough love meets soul care.
   * Function: Central registry for all Sallie features and metrics.
    * Got it, love.
     */
     export class FeatureRegistry {
         constructor() {
                 this.features = new Map();
                         this.metrics = new Map();
                                 this.initialized = false;
                                     }
                                         static instance = null;
                                             static getInstance() {
                                                     if (!FeatureRegistry.instance) {
                                                                 FeatureRegistry.instance = new FeatureRegistry();
                                                                         }
                                                                                 return FeatureRegistry.instance;
                                                                                     }
                                                                                         static register(name, implementation) {
                                                                                                 const registry = FeatureRegistry.getInstance();
                                                                                                         return registry.register(name, implementation);
                                                                                                             }
                                                                                                                 static get(name) {
                                                                                                                         const registry = FeatureRegistry.getInstance();
                                                                                                                                 return registry.get(name);
                                                                                                                                     }
                                                                                                                                         static recordUsage(featureName, executionTimeMs) {
                                                                                                                                                 const registry = FeatureRegistry.getInstance();
                                                                                                                                                         return registry.recordUsage(featureName, executionTimeMs);
                                                                                                                                                             }
                                                                                                                                                                 static getAllMetrics() {
                                                                                                                                                                         const registry = FeatureRegistry.getInstance();
                                                                                                                                                                                 return registry.getAllMetrics();
                                                                                                                                                                                 

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
                                                                                                                                                                                 
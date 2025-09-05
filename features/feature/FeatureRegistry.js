/*
 * Persona: Tough love meets soul care.
 * Module: FeatureRegistry
 * Intent: Handle functionality for FeatureRegistry
 * Provenance-ID: b283a549-f760-4d6e-9a68-1aa203c3f709
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

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

  register(name, implementation) {
    this.features.set(name, {
      implementation,
      registeredAt: Date.now(),
      usageCount: 0,
      lastUsed: null
    });
    return true;
  }

  get(name) {
    const feature = this.features.get(name);
    if (feature) {
      feature.usageCount++;
      feature.lastUsed = Date.now();
      return feature.implementation;
    }
    return null;
  }

  recordUsage(featureName, executionTimeMs) {
    if (!this.metrics.has(featureName)) {
      this.metrics.set(featureName, {
        totalUsage: 0,
        totalExecutionTime: 0,
        averageExecutionTime: 0,
        lastExecutionTime: 0
      });
    }

    const metric = this.metrics.get(featureName);
    metric.totalUsage++;
    metric.totalExecutionTime += executionTimeMs;
    metric.lastExecutionTime = executionTimeMs;
    metric.averageExecutionTime = metric.totalExecutionTime / metric.totalUsage;

    return metric;
  }

  getAllMetrics() {
    const metrics = {};
    for (const [name, data] of this.metrics) {
      metrics[name] = { ...data };
    }
    return metrics;
  }

  getFeatureList() {
    const features = [];
    for (const [name, data] of this.features) {
      features.push({
        name,
        registeredAt: data.registeredAt,
        usageCount: data.usageCount,
        lastUsed: data.lastUsed
      });
    }
    return features;
  }

  unregister(name) {
    const removed = this.features.delete(name);
    if (removed) {
      this.metrics.delete(name);
    }
    return removed;
  }

  isRegistered(name) {
    return this.features.has(name);
  }

  getUsageStats(name) {
    return this.metrics.get(name) || null;
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
  }

  static getFeatureList() {
    const registry = FeatureRegistry.getInstance();
    return registry.getFeatureList();
  }

  static unregister(name) {
    const registry = FeatureRegistry.getInstance();
    return registry.unregister(name);
  }

  static isRegistered(name) {
    const registry = FeatureRegistry.getInstance();
    return registry.isRegistered(name);
  }

  static getUsageStats(name) {
    const registry = FeatureRegistry.getInstance();
    return registry.getUsageStats(name);
  }
  
  async initialize() {
    try {
      this.initialized = true;
    } catch (error) {
      // Failed to initialize feature registry
      throw error;
    }
  }
}
                                                                                                                                                                                 
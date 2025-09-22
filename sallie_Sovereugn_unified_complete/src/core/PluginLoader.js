/*
 * Persona: Tough love meets soul care.
 * Module: PluginLoader
 * Intent: Handle functionality for PluginLoader
 * Provenance-ID: 897b5518-7968-43c3-9412-c0c3d9da133e
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

export class PluginLoader {
  constructor() {
    this.plugins = [];
    this.extensions = {};
  }
  load(plugin) {
    this.plugins.push(plugin);
    if (plugin.extensions) {
      Object.keys(plugin.extensions).forEach(key => {
        this.extensions[key] = plugin.extensions[key];
      });
    }
    if (typeof plugin.init === 'function') {
      plugin.init();
    }
  }
  getExtension(name) {
    return this.extensions[name];
  }
  unload(pluginName) {
    this.plugins = this.plugins.filter(p => p.name !== pluginName);
    // Remove extensions
    Object.keys(this.extensions).forEach(key => {
      if (this.extensions[key].pluginName === pluginName) {
        delete this.extensions[key];
      }
    });
  }
  listPlugins() {
    return this.plugins.map(p => p.name);
  }
}

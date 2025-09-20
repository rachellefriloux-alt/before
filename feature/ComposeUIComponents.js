/*
 * Persona: Tough love meets soul care.
 * Module: ComposeUIComponents
 * Intent: Handle functionality for ComposeUIComponents
 * Provenance-ID: 909714c0-34ff-4380-aca2-4574052d73e5
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

// ComposeUIComponents.js
// Sallie: Compose UI Components module
// Jetpack Compose-inspired UI for adaptive, accessible interfaces

const EventEmitter = require('events');

class ComposeUIComponents extends EventEmitter {
  constructor() {
    super();
    this.themes = ['Grace & Grind', 'Southern Grit', 'Hustle Legacy', 'Soul Care', 'Quiet Power', 'Midnight Hustle'];
    this.components = [];
    this.currentTheme = this.themes[0];
  }

  /**
   * Create a new UI component
   */
  createComponent(name, props) {
    const component = { name, props, theme: this.currentTheme };
    this.components.push(component);
    this.emit('componentCreated', component);
    return component;
  }

  /**
   * Switch UI theme
   */
  switchTheme(theme) {
    if (this.themes.includes(theme)) {
      this.currentTheme = theme;
      this.emit('themeSwitched', theme);
      return `Theme switched to ${theme}`;
    }
    return 'Theme not found';
  }

  /**
   * Get all UI components
   */
  getComponents() {
    return this.components;
  }

  /**
   * Get current theme
   */
  getCurrentTheme() {
    return this.currentTheme;
  }

  /**
   * Remove a component by name
   */
  removeComponent(name) {
    this.components = this.components.filter(c => c.name !== name);
    this.emit('componentRemoved', name);
    return true;
  }

  /**
   * Update component properties
   */
  updateComponent(name, newProps) {
    const idx = this.components.findIndex(c => c.name === name);
    if (idx === -1) return false;
    this.components[idx].props = { ...this.components[idx].props, ...newProps };
    this.emit('componentUpdated', this.components[idx]);
    return true;
  }

  /**
   * List available themes
   */
  listThemes() {
    return this.themes;
  }

  /**
   * Preview a theme without switching
   */
  previewTheme(theme) {
    if (this.themes.includes(theme)) {
      this.emit('themePreviewed', theme);
      return `Previewing theme: ${theme}`;
    }
    return 'Theme not found';
  }
}

module.exports = new ComposeUIComponents();
